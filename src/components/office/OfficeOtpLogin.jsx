// src/components/office/OfficeOtpLogin.jsx

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../light-style/office-css/officeOpt.css";
import { getDeviceFingerprint } from "../utils/getDeviceFingerprint";
import { 
  officeVerifyOtp, 
  officeResendOtp, 
  clearOfficeError,
  setOfficeWaitingForConfirmation
} from "../../redux/slices/officeAuthSlice";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const OfficeOtpLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isLoading, error, pendingUsername, waitingForConfirmation } = useSelector((state) => state.officeAuth);
  
  const username = pendingUsername || location.state?.username || "";
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [localError, setLocalError] = useState("");
  const [countdown, setCountdown] = useState(60);
  
  const inputRefs = useRef([]);
  const pollingRef = useRef(null);
  const countdownRef = useRef(null);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, []);

  // Countdown when waiting for confirmation
  useEffect(() => {
    if (waitingForConfirmation) {
      setCountdown(60);
      if (countdownRef.current) clearInterval(countdownRef.current);
      
      countdownRef.current = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(countdownRef.current);
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

  // src/components/office/OfficeOtpLogin.jsx

// Update the polling useEffect:
useEffect(() => {
  if (!waitingForConfirmation) return;
  
  if (pollingRef.current) clearInterval(pollingRef.current);
  
  let pollCount = 0;
  const maxPolls = 60;
  
  const checkAuth = async () => {
    try {
      pollCount++; 
      // ✅ First check if we have loginConfirmed in localStorage (from broadcast)
      const confirmed = localStorage.getItem("officeLoginConfirmed");
      if (confirmed) {
        const confirmData = JSON.parse(confirmed);
        if (confirmData.timestamp && (Date.now() - confirmData.timestamp < 60000)) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (countdownRef.current) clearInterval(countdownRef.current);
          window.location.href = "/office/dashboard";
          return;
        }
      }
      
      // ✅ Check auth status via API
      const response = await fetch(`${API_BASE_URL}/office/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      
      const data = await response.json();
      if (data.success && data.user) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        if (countdownRef.current) clearInterval(countdownRef.current);
        sessionStorage.removeItem("officePendingLogin");
        window.location.href = "/office/dashboard";
      } else if (pollCount >= maxPolls) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        dispatch(setOfficeWaitingForConfirmation(false));
        setLocalError("Confirmation timeout. Please try logging in again.");
      }
    } catch (err) {
      console.error("Polling error:", err);
      if (pollCount >= maxPolls && pollingRef.current) {
        clearInterval(pollingRef.current);
        dispatch(setOfficeWaitingForConfirmation(false));
      }
    }
  };
  
  pollingRef.current = setInterval(checkAuth, 3000);
  checkAuth(); // Run immediately
  
  return () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
  };
}, [waitingForConfirmation, dispatch]);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'officeLoginConfirmed' && e.newValue) {
        window.location.href = "/office/dashboard";
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
    dispatch(clearOfficeError());
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

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setLocalError("Please enter a valid 6-digit OTP");
      return;
    }
    
    setLocalError("");
    setSuccess("");

    try {
      const fingerprint = await getDeviceFingerprint();
      
      const result = await dispatch(officeVerifyOtp({ 
        otp: otpString, 
        username: username,
        deviceFingerprint: fingerprint
      })).unwrap();
      
      if (result.success) {
        dispatch(setOfficeWaitingForConfirmation(true));
        sessionStorage.setItem("officePendingLogin", JSON.stringify({
          username: username,
          timestamp: Date.now()
        }));
        setSuccess("OTP verified! Please check your email and click 'It's me' to complete login.");
      } else {
        setLocalError(result.message || "Invalid OTP. Please try again.");
      }
    } catch (err) {
      console.error("❌ OTP verification error:", err);
      setLocalError(err.message || "Invalid OTP. Please try again.");
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setResendLoading(true);
    setLocalError("");
    setSuccess("");

    try {
      const result = await dispatch(officeResendOtp({ username })).unwrap();
      
      if (result.success) {
        setTimer(60);
        setSuccess("OTP has been resent to your registered email");
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
    navigate("/office/login");
  };

  const displayError = localError || error;

  if (waitingForConfirmation) {
    return (
      <div className="main-main">
        <div className="office-otp-container">
          <div className="office-otp-card">
            <div className="office-otp-header">
              <button className="office-otp-back-button" onClick={handleGoBack} type="button">
                <i className="fas fa-arrow-left"></i> Back
              </button>
              <div className="office-otp-logo">
                <div className="office-otp-logo-icon">
                  <i className="fas fa-shield-alt"></i>
                </div>
                <h1 className="office-otp-logo-text">Confirm Login</h1>
              </div>
            </div>

            {success && (
              <div className="office-otp-alert office-otp-alert-success">
                <span className="office-otp-alert-icon">
                  <i className="fas fa-check-circle"></i>
                </span>
                <span className="office-otp-alert-text">{success}</span>
              </div>
            )}

            <div className="office-otp-waiting" style={{ textAlign: "center", padding: "30px" }}>
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
                Waiting for you to click "It's me" in the email...
              </p>
              <p style={{ marginTop: "10px", fontSize: "12px", color: "#999" }}>
                This page will automatically detect when you confirm.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-main">
      <div className="office-otp-container">
        <div className="office-otp-card">
          <div className="office-otp-header">
            <button className="office-otp-back-button" onClick={handleGoBack} type="button">
              <i className="fas fa-arrow-left"></i> Back
            </button>
            
            <div className="office-otp-logo">
              <div className="office-otp-logo-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h1 className="office-otp-logo-text">Verify OTP</h1>
            </div>
            
            <p className="office-otp-subtitle">
              Enter the 6-digit verification code sent to your registered email
            </p>
          </div>

          {displayError && (
            <div className="office-otp-alert office-otp-alert-error">
              <span className="office-otp-alert-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
              <span className="office-otp-alert-text">{displayError}</span>
            </div>
          )}

          {success && !waitingForConfirmation && (
            <div className="office-otp-alert office-otp-alert-success">
              <span className="office-otp-alert-icon">
                <i className="fas fa-check-circle"></i>
              </span>
              <span className="office-otp-alert-text">{success}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="office-otp-form">
            <div className="office-otp-inputs-container">
              <p className="office-otp-instruction">
                <i className="fas fa-keyboard"></i> Enter 6-digit code
              </p>
              
              <div className="office-otp-inputs-group">
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
                    className="office-otp-input"
                    disabled={isLoading}
                    required
                  />
                ))}
              </div>
            </div>

            <div className="office-otp-timer-section">
              {timer > 0 ? (
                <p className="office-otp-timer">
                  <i className="fas fa-clock"></i> Resend OTP in <span className="office-otp-timer-count">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className={`office-otp-resend-button ${resendLoading ? 'office-otp-resend-button-loading' : ''}`}
                >
                  {resendLoading ? (
                    <>
                      <span className="office-otp-spinner"></span>
                      Resending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo"></i> Resend OTP
                    </>
                  )}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || otp.join("").length !== 6}
              className={`office-otp-verify-button ${isLoading ? 'office-otp-verify-button-loading' : ''}`}
            >
              {isLoading ? (
                <>
                  <span className="office-otp-spinner"></span>
                  Verifying...
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> Verify OTP
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfficeOtpLogin;