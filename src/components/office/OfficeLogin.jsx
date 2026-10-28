import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../light-style/office-css/officeLogin.css";
import { getDeviceFingerprint } from "../utils/getDeviceFingerprint";
import { 
  officeLogin, 
  clearOfficeError,
  setOfficePendingUsername,
  clearOfficeAuth
} from "../../redux/slices/officeAuthSlice";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const OfficeLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, requiresOtp, isAuthenticated } = useSelector((state) => state.officeAuth);
  const hasRedirected = useRef(false);
  
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const timerRef = useRef(null);
  
  // Forgot Password Modal States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [loginError, setLoginError] = useState("");

  // Clear any stale auth state on mount
  useEffect(() => {
    dispatch(clearOfficeAuth());
  }, [dispatch]);

  // ✅ Load lockout expiry from localStorage on mount
  useEffect(() => {
    const storedExpiry = localStorage.getItem("officeLockoutExpiry");
    if (storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      if (remaining > 0) {
        setLockoutTimer(remaining);
        startCountdown(remaining);
      } else {
        localStorage.removeItem("officeLockoutExpiry");
      }
    }
  }, []);

  // ✅ Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // ✅ Start countdown timer
  const startCountdown = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    timerRef.current = setInterval(() => {
      setLockoutTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          localStorage.removeItem("officeLockoutExpiry");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ✅ Redirect if already authenticated - only once
  useEffect(() => {
    if (hasRedirected.current) return;
    if (!isLoading && isAuthenticated === true) {
      hasRedirected.current = true;
      navigate("/office/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // ✅ Redirect to OTP page when OTP is required
  useEffect(() => {
    if (requiresOtp) {
      navigate("/office/otp/login");
    }
  }, [requiresOtp, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    dispatch(clearOfficeError());
    setLoginError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (lockoutTimer > 0) {
      setLoginError(`Please wait ${lockoutTimer} seconds before trying again.`);
      return;
    }
    
    setLoginError("");
    
    try {
      const fingerprint = await getDeviceFingerprint();
      dispatch(setOfficePendingUsername(credentials.username));
      
      const result = await dispatch(officeLogin({
        username: credentials.username,
        password: credentials.password,
        deviceFingerprint: fingerprint
      })).unwrap();

      // ✅ Check for lockout
      if (result.lockRemaining && result.lockRemaining > 0) {
        const remaining = result.lockRemaining;
        setLockoutTimer(remaining);
        startCountdown(remaining);
        
        // Save to localStorage
        const expiry = Date.now() + (remaining * 1000);
        localStorage.setItem("officeLockoutExpiry", expiry.toString());
        
        setLoginError(`Too many failed attempts. Please wait ${remaining} seconds before trying again.`);
        return;
      }
      
      if (result.requiresOtp === true) {
        navigate("/office/otp/login", { 
          state: { username: credentials.username }
        });
      } else if (result.success === true) {
        // Clear any lockout on successful login
        localStorage.removeItem("officeLockoutExpiry");
        setLockoutTimer(0);
        navigate("/office/dashboard", { replace: true });
      } else if (!result.success && result.message) {
        setLoginError(result.message);
      }
      
    } catch (err) {
      console.error("❌ Office login error:", err);
      setLoginError(err.message || "Login failed. Please try again.");
    }
  };

  const handleForgotPassword = () => {
    setShowForgotModal(true);
    setForgotEmail("");
    setForgotMessage("");
  };

  const submitForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotMessage("Please enter your email address");
      return;
    }

    setForgotLoading(true);
    setForgotMessage("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/ss@01/office-user/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: forgotEmail })
        }
      );

      const data = await res.json();

      if (data.success) {
        setForgotMessage("Password reset link has been sent to your email");
        setTimeout(() => setShowForgotModal(false), 3000);
      } else {
        setForgotMessage(data.message || "Failed to send reset link");
      }
    } catch (err) {
      setForgotMessage("Network error. Please try again.");
    } finally {
      setForgotLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const displayError = loginError || error;

  return (
    <div className="main-main">
      <div className="office-login-container">
        <div className="office-login-card">
          <div className="office-login-header">
            <div className="office-logo">
              <div className="office-logo-icon">
                <i className="fas fa-building"></i>
              </div>
              <h1 className="office-logo-text">Office Portal</h1>
            </div>
            <p className="office-login-subtitle">Sign in to your office account</p>
          </div>

          {displayError && (
            <div className="office-alert office-alert-error">
              <span className="office-alert-icon">
                <i className="fas fa-exclamation-circle"></i>
              </span>
              <span className="office-alert-text">{displayError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="office-login-form">
            <div className="office-form-group">
              <label htmlFor="username" className="office-form-label">
                <i className="fas fa-user"></i> Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={credentials.username}
                onChange={handleChange}
                required
                className="office-form-input"
                disabled={lockoutTimer > 0 || isLoading}
              />
            </div>

            <div className="office-form-group">
              <div className="office-form-label-row">
                <label htmlFor="password" className="office-form-label">
                  <i className="fas fa-key"></i> Password
                </label>
                <button 
                  type="button" 
                  className="office-forgot-password"
                  onClick={handleForgotPassword}
                  disabled={lockoutTimer > 0 || isLoading}
                > 
                  Forgot password?
                </button>
              </div>
              <div className="office-password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="office-form-input office-password-input"
                  disabled={lockoutTimer > 0 || isLoading}
                />
                <button
                  type="button"
                  className="office-password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={lockoutTimer > 0 || isLoading}
                >
                  {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`office-login-button ${isLoading ? 'office-login-button-loading' : ''}`}
              disabled={isLoading || lockoutTimer > 0}
            >
              {isLoading ? (
                <>
                  <span className="office-spinner"></span>
                  Signing in...
                </>
              ) : lockoutTimer > 0 ? (
                <>
                  <i className="fas fa-hourglass-half"></i> Wait {lockoutTimer}s
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign in
                </>
              )}
            </button>
          </form>

          <div className="office-login-footer">
            <p className="office-footer-text">Need help?
              <a href="mailto:support@office.com" className="office-support-link">
                support@office.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="office-login-bg-shape office-login-bg-shape-1"></div>
        <div className="office-login-bg-shape office-login-bg-shape-2"></div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="office-modal-overlay">
          <div className="office-modal">
            <div className="office-modal-header">
              <h3><i className="fas fa-key"></i> Forgot Password</h3>
              <button className="office-modal-close" onClick={() => setShowForgotModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="office-modal-body">
              <p className="office-modal-text">
                Enter your registered email address. We'll send you a password reset link.
              </p>
              <div className="office-form-group">
                <label htmlFor="forgot-email" className="office-form-label">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="office-form-input"
                  disabled={forgotLoading}
                />
              </div>
              {forgotMessage && (
                <div className={`office-alert ${forgotMessage.includes('sent') ? 'office-alert-success' : 'office-alert-error'}`}>
                  <span className="office-alert-icon">
                    {forgotMessage.includes('sent') ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-circle"></i>}
                  </span>
                  <span className="office-alert-text">{forgotMessage}</span>
                </div>
              )}
            </div>
            <div className="office-modal-footer">
              <button className="office-button-secondary" onClick={() => setShowForgotModal(false)} disabled={forgotLoading}>
                Cancel
              </button>
              <button className="office-button-primary" onClick={submitForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? (
                  <>
                    <span className="office-spinner-small"></span>
                    Sending...
                  </>
                ) : (
                  <>
                    <i className="fas fa-paper-plane"></i> Send Reset Link
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeLogin;