import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import "../../light-style/owner-css/ownerLogin.css";
import { getDeviceFingerprint } from "../utils/getDeviceFingerprint";
import { 
  ownerLogin, 
  clearOwnerError,
  clearOwnerAuth
} from "../../redux/slices/ownerAuthSlice";

import { getApiBaseUrl } from "../utils/defineConfig";
const API_BASE_URL = getApiBaseUrl();


const OwnerLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error, requiresOtp, isAuthenticated } = useSelector((state) => state.ownerAuth);
  const hasRedirected = useRef(false);
  
  const [credentials, setCredentials] = useState({
    username: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [loginError, setLoginError] = useState("");

  // Clear any stale auth state on mount
  useEffect(() => {
    dispatch(clearOwnerAuth());
    // Clear any stale session data
    sessionStorage.removeItem("ownerUsername");
    sessionStorage.removeItem("ownerPendingLogin");
  }, [dispatch]);

  // ✅ Redirect if already authenticated - only once
  useEffect(() => {
    if (hasRedirected.current) return;
    if (!isLoading && isAuthenticated === true) {
      hasRedirected.current = true;
      navigate("/owner/dashboard", { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate]);

  // ✅ Redirect to OTP page when OTP is required
  useEffect(() => {
    if (requiresOtp) {
      // Username is already saved in sessionStorage during login
      navigate("/ownerOtpLogin");
    }
  }, [requiresOtp, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    dispatch(clearOwnerError());
    setLoginError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError("");
    
    try {
      const fingerprint = await getDeviceFingerprint();
      // ✅ Save username to sessionStorage BEFORE login attempt
      sessionStorage.setItem("ownerUsername", credentials.username);
      const result = await dispatch(ownerLogin({
        username: credentials.username,
        password: credentials.password,
        deviceFingerprint: fingerprint
      })).unwrap();
      
      if (result.requiresOtp === true) {
        // ✅ Navigate with username in state
        navigate("/ownerOtpLogin", { 
          state: { username: credentials.username },
          replace: true 
        });
      } else if (result.success === true) {
        // ✅ Clear session storage on successful login (no OTP needed)
        sessionStorage.removeItem("ownerUsername");
        navigate("/owner/dashboard", { replace: true });
      }
      
    } catch (err) {
      console.error("❌ Owner login error:", err);
      setLoginError(err.message || "Login failed. Please try again.");
      // Clear session storage on error
      sessionStorage.removeItem("ownerUsername");
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
        `${API_BASE_URL}/ss@01/super-admin/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
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
      console.error("Forgot password error:", err);
    } finally {
      setForgotLoading(false);
    }
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  
  const displayError = loginError || error;

  return (
    <div className="main-main">
      <div className="owner-login-container">
        <div className="owner-login-card">
          <div className="owner-login-header">
            <div className="owner-logo">
              <div className="owner-logo-icon">
                <i className="fas fa-lock"></i>
              </div>
              <h1 className="owner-logo-text">Admin Portal</h1>
            </div>
            <p className="owner-login-subtitle">Sign in to your administrator account</p>
          </div>

          {displayError && (
            <div className="owner-alert owner-alert-error">
              <span className="owner-alert-icon">
                <i className="fas fa-exclamation-circle"></i>
              </span>
              <span className="owner-alert-text">{displayError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="owner-login-form">
            <div className="owner-form-group">
              <label htmlFor="username" className="owner-form-label">
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
                className="owner-form-input"
                disabled={isLoading}
                autoComplete="off"
              />
            </div>

            <div className="owner-form-group">
              <div className="owner-form-label-row">
                <label htmlFor="password" className="owner-form-label">
                  <i className="fas fa-key"></i> Password
                </label>
                <button 
                  type="button" 
                  className="owner-forgot-password"
                  onClick={handleForgotPassword}
                > 
                  Forgot password?
                </button>
              </div>
              <div className="owner-password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="owner-form-input owner-password-input"
                  disabled={isLoading}
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="owner-password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className={`owner-login-button ${isLoading ? 'owner-login-button-loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="owner-spinner"></span>
                  Signing in...
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> Sign in
                </>
              )}
            </button>
          </form>

          <div className="owner-login-footer">
            <p className="owner-footer-text">Need help?
              <a href="mailto:support@admin.com" className="owner-support-link">
                support@admin.com
              </a>
            </p>
          </div>
        </div>
        
        <div className="owner-login-bg-shape owner-login-bg-shape-1"></div>
        <div className="owner-login-bg-shape owner-login-bg-shape-2"></div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="owner-modal-overlay">
          <div className="owner-modal">
            <div className="owner-modal-header">
              <h3><i className="fas fa-key"></i> Forgot Password</h3>
              <button className="owner-modal-close" onClick={() => setShowForgotModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="owner-modal-body">
              <p className="owner-modal-text">
                Enter your registered email address. We'll send you a password reset link.
              </p>
              <div className="owner-form-group">
                <label htmlFor="forgot-email" className="owner-form-label">
                  <i className="fas fa-envelope"></i> Email Address
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder="Enter your registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="owner-form-input"
                  disabled={forgotLoading}
                />
              </div>
              {forgotMessage && (
                <div className={`owner-alert ${forgotMessage.includes('sent') ? 'owner-alert-success' : 'owner-alert-error'}`}>
                  <span className="owner-alert-icon">
                    {forgotMessage.includes('sent') ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-circle"></i>}
                  </span>
                  <span className="owner-alert-text">{forgotMessage}</span>
                </div>
              )}
            </div>
            <div className="owner-modal-footer">
              <button className="owner-button-secondary" onClick={() => setShowForgotModal(false)} disabled={forgotLoading}>
                Cancel
              </button>
              <button className="owner-button-primary" onClick={submitForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? (
                  <>
                    <span className="owner-spinner-small"></span>
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

export default OwnerLogin;