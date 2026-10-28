import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../light-style/owner-css/ownerOpt.css";
import { 
  ownerVerifyOtp, 
  ownerResendOtp, 
  clearOwnerError,
  clearOwnerAuth
} from "../../redux/slices/ownerAuthSlice";
import { getApiBaseUrl } from "../utils/defineConfig";
const API_BASE_URL = getApiBaseUrl();


const OwnerOtpLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.ownerAuth);
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [localError, setLocalError] = useState("");
  const [waitingForConfirmation, setWaitingForConfirmation] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const hasRedirected = useRef(false);
  const pollingRef = useRef(null);
  const countdownRef = useRef(null);
  
  const inputRefs = useRef([]);
  
  // ✅ FIXED: Get username from multiple sources
 const [username, setUsername] = useState(() => {
  // Priority 1: location.state
  if (location.state?.username) {
    return location.state.username;
  }
  // Priority 2: sessionStorage
  const stored = sessionStorage.getItem("ownerUsername");
  if (stored) {
    return stored;
  }
  return "";
});

// ✅ Save to sessionStorage when username is set
useEffect(() => {
  if (username) {
    sessionStorage.setItem("ownerUsername", username);
  }
}, [username]);

// ✅ Add this check before verify OTP
if (!username) {
  console.error("❌ No username found for OTP verification!");
  setLocalError("Session expired. Please login again.");
  setTimeout(() => {
    sessionStorage.removeItem("ownerUsername");
    navigate("/ownerLogin", { replace: true });
  }, 2000);
  return;
}
  // Clear on mount
  useEffect(() => {
    dispatch(clearOwnerAuth());
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [dispatch]);

  // Redirect if authenticated
  useEffect(() => {
    if (hasRedirected.current) return;
    if (isAuthenticated) {
      hasRedirected.current = true;
      navigate("/owner/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Countdown effect when waiting for confirmation
  useEffect(() => {
    if (waitingForConfirmation) {
      setCountdown(60);
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
            handleGoBack();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [waitingForConfirmation]);

  // Polling for confirmation
  // Update the polling function
const startConfirmationPolling = () => {
  if (pollingRef.current) clearInterval(pollingRef.current);
  
  let pollCount = 0;
  const maxPolls = 30; // 90 seconds max (3 seconds * 30)
  
  pollingRef.current = setInterval(async () => {
    try {
      pollCount++;
      // ✅ Check both /me endpoint and localStorag
      const response = await fetch(`${API_BASE_URL}/owner/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      
      // ✅ Also check localStorage for confirmation
      const localConfirm = localStorage.getItem("ownerLoginConfirmed");
      
      if (data.success && data.user) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        sessionStorage.removeItem("ownerUsername");
        sessionStorage.removeItem("ownerPendingLogin");
        localStorage.removeItem("ownerLoginConfirmed");
        navigate("/owner/dashboard", { replace: true });
      } 
      else if (localConfirm) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        sessionStorage.removeItem("ownerUsername");
        sessionStorage.removeItem("ownerPendingLogin");
        localStorage.removeItem("ownerLoginConfirmed");
        navigate("/owner/dashboard", { replace: true });
      }
      else if (pollCount >= maxPolls) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        setWaitingForConfirmation(false);
        setLocalError("Confirmation timeout. Please try logging in again.");
      }
    } catch (err) {
      console.error("Polling error:", err);
      if (pollCount >= maxPolls && pollingRef.current) {
        clearInterval(pollingRef.current);
        setWaitingForConfirmation(false);
        setLocalError("Confirmation timeout. Please try logging in again.");
      }
    }
  }, 3000);
};

  // Listen for storage events (cross-tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'ownerLoginConfirmed' && e.newValue) {
        navigate("/owner/dashboard", { replace: true });
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  useEffect(() => {
    if (timer > 0) {
      const countdown = setTimeout(() => setTimer(timer - 1), 1000);
      return () => clearTimeout(countdown);
    }
  }, [timer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
    setLocalError("");
    dispatch(clearOwnerError());
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = [...otp];
      pastedData.split("").forEach((char, idx) => {
        if (idx < 6) newOtp[idx] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(5, pastedData.length - 1)]?.focus();
    }
  };

  // ✅ FIXED: Include username in verify OTP call
  const handleVerifyOtp = async (e) => {
  e.preventDefault();
  
  const otpString = otp.join("");
  if (otpString.length !== 6) {
    setLocalError("Please enter a valid 6-digit OTP");
    return;
  }
  
  if (!username) {
    console.error("❌ No username found!");
    setLocalError("Session expired. Please login again.");
    setTimeout(() => navigate("/ownerLogin"), 2000);
    return;
  }

  setLocalError("");
  setSuccess("");

  try {
    const result = await dispatch(ownerVerifyOtp({ 
      otp: otpString,
      username: username
    })).unwrap();
    
    if (result.requiresConfirmation === true) {
      setWaitingForConfirmation(true);
      setSuccess("OTP verified! Please check your email and click 'It's me' to complete login.");
      startConfirmationPolling();
    } 
    else if (result.success === true) {
      sessionStorage.removeItem("ownerUsername");
      navigate("/owner/dashboard", { replace: true });
    }
    else {
      setLocalError(result.message || "Invalid OTP. Please try again.");
    }
  } catch (err) {
    console.error("❌ OTP verification error:", err);
    // ✅ Better error message
    if (err.status === 403) {
      setLocalError("Authentication error. Please refresh and try again.");
    } else if (err.message) {
      setLocalError(err.message);
    } else {
      setLocalError("Invalid OTP. Please try again.");
    }
  }
};

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    if (!username) {
      setLocalError("Session expired. Please login again.");
      setTimeout(() => navigate("/ownerLogin"), 2000);
      return;
    }
    
    setResendLoading(true);
    setLocalError("");
    setSuccess("");

    try {
      const result = await dispatch(ownerResendOtp({ username })).unwrap();
      
      if (result.success) {
        setTimer(60);
        setSuccess("OTP has been resent to your registered email/phone");
      } else {
        setLocalError(result.message || "Failed to resend OTP");
      }
    } catch (err) {
      setLocalError(err.message || "Failed to resend OTP");
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoBack = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    sessionStorage.removeItem("ownerUsername");
    sessionStorage.removeItem("ownerPendingLogin");
    navigate("/ownerLogin");
  };

  const displayError = localError || error;

  return (
    <div className="main-main">
      <div className="owner-otp-container">
        <div className="owner-otp-card">
          <div className="owner-otp-header">
            <button className="owner-otp-back-button" onClick={handleGoBack} type="button">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            
            <div className="owner-otp-logo">
              <div className="owner-otp-logo-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h1 className="owner-otp-logo-text">
                {waitingForConfirmation ? "Confirm Login" : "Verify OTP"}
              </h1>
            </div>
            
            {/* ✅ Show username for debugging */}
            <p className="owner-otp-subtitle" style={{ fontSize: "12px", color: "#888" }}>
              {username ? `Verifying for: ${username}` : "Loading user info..."}
            </p>
          </div>

          {displayError && (
            <div className="owner-otp-alert owner-otp-alert-error">
              <span className="owner-otp-alert-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
              <span className="owner-otp-alert-text">{displayError}</span>
            </div>
          )}

          {success && !waitingForConfirmation && (
            <div className="owner-otp-alert owner-otp-alert-success">
              <span className="owner-otp-alert-icon">
                <i className="fas fa-check-circle"></i>
              </span>
              <span className="owner-otp-alert-text">{success}</span>
            </div>
          )}

          {!waitingForConfirmation ? (
            <form onSubmit={handleVerifyOtp} className="owner-otp-form">
              <div className="owner-otp-inputs-container">
                <p className="owner-otp-instruction">
                  <i className="fas fa-keyboard"></i> Enter 6-digit code
                </p>
                
                <div className="owner-otp-inputs-group">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      inputMode="numeric"
                      pattern="\d*"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      onPaste={handlePaste}
                      className="owner-otp-input"
                      disabled={isLoading}
                      required
                    />
                  ))}
                </div>
              </div>

              <div className="owner-otp-timer-section">
                {timer > 0 ? (
                  <p className="owner-otp-timer">
                    <i className="fas fa-clock"></i> Resend OTP in <span className="owner-otp-timer-count">{timer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={resendLoading}
                    className={`owner-otp-resend-button ${resendLoading ? 'owner-otp-resend-button-loading' : ''}`}
                  >
                    {resendLoading ? (
                      <><span className="owner-otp-spinner"></span> Resending...</>
                    ) : (
                      <><i className="fas fa-redo"></i> Resend OTP</>
                    )}
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading || otp.join("").length !== 6}
                className={`owner-otp-verify-button ${isLoading ? 'owner-otp-verify-button-loading' : ''}`}
              >
                {isLoading ? (
                  <><span className="owner-otp-spinner"></span> Verifying...</>
                ) : (
                  <><i className="fas fa-check"></i> Verify OTP</>
                )}
              </button>
            </form>
          ) : (
            <div className="owner-otp-waiting" style={{ textAlign: "center", padding: "20px" }}>
              <div style={{
                position: "relative",
                width: "80px",
                height: "80px",
                margin: "0 auto"
              }}>
                <div className="spinner" style={{
                  width: "80px",
                  height: "80px",
                  border: "4px solid #e0e0e0",
                  borderTop: "4px solid #4CAF50",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                  position: "absolute",
                  top: 0,
                  left: 0
                }}></div>
                <div style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "24px",
                  fontWeight: "bold",
                  color: "#4CAF50"
                }}>
                  {countdown}
                </div>
              </div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
              <p style={{ marginTop: "20px", color: "#666" }}>
                <i className="fas fa-envelope"></i> {success || "Please check your email and click 'It's me' to complete login."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerOtpLogin;