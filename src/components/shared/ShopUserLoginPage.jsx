import "../../shared-style/user-css/shopUserLoginPage.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearError } from "../../redux/slices/authSlice";

const ShopUserLoginPage = () => {
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("appLanguage") || localStorage.getItem("pos-language") || "mm";
  });

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    window.addEventListener('appLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('appLanguageChanged', handleLanguageChange);
  }, []);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);

  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
    shopCode: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [lockoutTimer, setLockoutTimer] = useState(0);
  const timerRef = useRef(null);

  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMessage, setForgotMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const t = {
    title: language === "mm" ? "အကောင့်ဝင်ရန်" : "Account Login",
    subtitle: language === "mm" ? "သင့်အကောင့်သို့ ဝင်ရောက်ရန်" : "Sign in to your account",
    shopCodeLabel: language === "mm" ? "ဆိုင်/ဆိုင်ခွဲကုဒ်" : "Shop/Branch Code",
    shopCodePlaceholder: language === "mm" ? "ဆိုင် သို့မဟုတ် ဆိုင်ခွဲကုဒ် ထည့်ပါ" : "Enter shop or branch code",
    usernameLabel: language === "mm" ? "အသုံးပြုသူအမည်" : "Username",
    usernamePlaceholder: language === "mm" ? "သင့်အသုံးပြုသူအမည် ထည့်ပါ" : "Enter your username",
    passwordLabel: language === "mm" ? "စကားဝှက်" : "Password",
    passwordPlaceholder: language === "mm" ? "သင့်စကားဝှက် ထည့်ပါ" : "Enter your password",
    forgotPassword: language === "mm" ? "စကားဝှက်မေ့နေပါသလား?" : "Forgot password?",
    signIn: language === "mm" ? "ဝင်ရောက်ရန်" : "Sign In",
    signingIn: language === "mm" ? "ဝင်ရောက်နေသည်..." : "Signing in...",
    wait: language === "mm" ? "စောင့်ပါ" : "Wait",
    forgotTitle: language === "mm" ? "စကားဝှက်မေ့နေပါသလား?" : "Forgot Password",
    forgotText: language === "mm" 
      ? "သင့်မှတ်ပုံတင်ထားသော အီးမေးလ်လိပ်စာကို ထည့်ပါ။" 
      : "Enter your registered email address.",
    emailLabel: language === "mm" ? "အီးမေးလ်လိပ်စာ" : "Email Address",
    emailPlaceholder: language === "mm" ? "သင့်အီးမေးလ်လိပ်စာ ထည့်ပါ" : "Enter your email",
    cancel: language === "mm" ? "ပယ်ဖျက်ရန်" : "Cancel",
    sendLink: language === "mm" ? "လင့်ခ်ပို့ရန်" : "Send Reset Link",
    sending: language === "mm" ? "ပို့နေသည်..." : "Sending...",
    resetSent: language === "mm" 
      ? "စကားဝှက်ပြန်လည်သတ်မှတ်ရန် လင့်ခ်ကို သင့်အီးမေးလ်သို့ ပို့ပြီးပါပြီ။"
      : "Password reset link has been sent to your email.",
    resetFailed: language === "mm"
      ? "လင့်ခ်ပို့ရန် မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်ကြိုးစားပါ။"
      : "Failed to send reset link. Please try again.",
    networkError: language === "mm"
      ? "ဆာဗာနှင့် ချိတ်ဆက်မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။"
      : "Cannot connect to server. Please check your internet connection.",
    invalidCredentials: language === "mm"
      ? "အသုံးပြုသူအမည်၊ စကားဝှက် သို့မဟုတ် ဆိုင်ကုဒ် မှားယွင်းနေပါသည်။"
      : "Invalid username, password or shop code.",
    // ✅ Hint texts
    hintShopCode: language === "mm" ? "ဥပမာ — shop သို့မဟုတ် branch" : "Code — shop or branch",
    hintUsername: language === "mm" ? "Demo — root" : "Demo — root",
    hintPassword: language === "mm" ? "Demo — 123" : "Demo — 123",
  };

  const startCountdown = (seconds) => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setLockoutTimer(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          localStorage.removeItem("lockoutExpiry");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    const storedExpiry = localStorage.getItem("lockoutExpiry");
    if (storedExpiry) {
      const expiry = parseInt(storedExpiry, 10);
      const now = Date.now();
      const remaining = Math.max(0, Math.floor((expiry - now) / 1000));
      if (remaining > 0) {
        setLockoutTimer(remaining);
        startCountdown(remaining);
      } else {
        localStorage.removeItem("lockoutExpiry");
      }
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleRefresh = () => {
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials(prev => ({
      ...prev,
      [name]: value
    }));
    dispatch(clearError());
    setLoginError("");
  };

  // ============================================================
  // ✅ MOCK LOGIN
  // ============================================================
  const handleLogin = async (e) => {
    e.preventDefault();

    if (lockoutTimer > 0) {
      setLoginError(`Please wait ${lockoutTimer} seconds before trying again.`);
      return;
    }

    setLoading(true);
    setLoginError("");

    await new Promise(resolve => setTimeout(resolve, 800));

    const shopCode = credentials.shopCode.trim().toLowerCase();
    const username = credentials.username.trim().toLowerCase();
    const password = credentials.password;

    const VALID_USERNAME = "root";
    const VALID_PASSWORD = "123";

    if (!shopCode) {
      setLoginError(t.invalidCredentials);
      setLoading(false);
      return;
    }

    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      setLoginError(t.invalidCredentials);
      setLoading(false);
      return;
    }

    let userType = "shop";
    if (shopCode === "branch") {
      userType = "branch";
    } else if (shopCode === "shop") {
      userType = "shop";
    } else {
      userType = "shop";
    }

    sessionStorage.setItem("pendingLogin", JSON.stringify({
      username: username,
      password: password,
      shopCode: shopCode,
      userType: userType,
      timestamp: Date.now()
    }));

    setLoading(false);

    navigate("/shop-user-otp-page", {
      state: {
        userType: userType,
        username: username,
        shopCode: shopCode,
        message: "OTP sent to your email"
      }
    });
  };

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const handleForgotPassword = () => {
    setShowForgotModal(true);
    setForgotEmail("");
    setForgotMessage("");
  };

  const submitForgotPassword = async () => {
    if (!forgotEmail) {
      setForgotMessage(t.emailLabel + " " + (language === "mm" ? "လိုအပ်ပါသည်" : "is required"));
      return;
    }

    setForgotLoading(true);
    setForgotMessage("");

    await new Promise(resolve => setTimeout(resolve, 800));

    setForgotMessage(t.resetSent);
    setForgotLoading(false);
    setTimeout(() => setShowForgotModal(false), 3000);
  };

  const errorMessage = loginError || (typeof error === 'string' ? error : error?.message);

  return (
    <div className="shared-login-main">
      <div className="shared-login-container">
        <div className="shared-login-card" style={{ position: 'relative' }}>
          <button 
            onClick={handleRefresh}
            style={{
              position: 'absolute',
              top: '15px',
              right: '15px',
              background: 'rgba(248, 114, 10, 0.1)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
              zIndex: 10
            }}
            title={language === "mm" ? "ဒေတာရှင်းလင်းရန်" : "Refresh & Clear Data"}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(248, 114, 10, 0.2)';
              e.currentTarget.style.transform = 'rotate(180deg)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(248, 114, 10, 0.1)';
              e.currentTarget.style.transform = 'rotate(0deg)';
            }}
          >
            <i className="fas fa-sync-alt" style={{ color: '#f8720a', fontSize: '16px' }}></i>
          </button>

          <div className="shared-login-header">
            <div className="shared-login-logo">
              <div className="shared-login-logo-icon">
                <i className="fas fa-store"></i>
              </div>
              <h1 className="shared-login-logo-text">{t.title}</h1>
            </div>
            <p className="shared-login-subtitle">{t.subtitle}</p>
          </div>

          {errorMessage && (
            <div className="shared-alert shared-alert-error">
              <span className="shared-alert-icon"><i className="fas fa-exclamation-circle"></i></span>
              <span className="shared-alert-text">{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="shared-login-form">
            {/* Shop / Branch Code */}
            <div className="shared-form-group">
              <label htmlFor="shopCode" className="shared-form-label">
                <i className="fas fa-store"></i> {t.shopCodeLabel}
              </label>
              <input
                id="shopCode"
                name="shopCode"
                type="text"
                placeholder={t.shopCodePlaceholder}
                value={credentials.shopCode}
                onChange={handleChange}
                required
                className="shared-form-input"
                disabled={lockoutTimer > 0 || loading}
              />
              <small className="shared-form-hint">{t.hintShopCode}</small>
            </div>

            {/* Username */}
            <div className="shared-form-group">
              <label htmlFor="username" className="shared-form-label">
                <i className="fas fa-user"></i> {t.usernameLabel}
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder={t.usernamePlaceholder}
                value={credentials.username}
                onChange={handleChange}
                required
                className="shared-form-input"
                disabled={lockoutTimer > 0 || loading}
              />
              <small className="shared-form-hint">{t.hintUsername}</small>
            </div>

            {/* Password */}
            <div className="shared-form-group">
              <div className="shared-form-label-row">
                <label htmlFor="password" className="shared-form-label">
                  <i className="fas fa-key"></i> {t.passwordLabel}
                </label>
                <button 
                  type="button" 
                  className="shared-forgot-password"
                  onClick={handleForgotPassword}
                  disabled={lockoutTimer > 0 || loading}
                > 
                  {t.forgotPassword}
                </button>
              </div>
              <div className="shared-password-input-wrapper">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder={t.passwordPlaceholder}
                  value={credentials.password}
                  onChange={handleChange}
                  required
                  className="shared-form-input shared-password-input"
                  disabled={lockoutTimer > 0 || loading}
                />
                <button
                  type="button"
                  className="shared-password-toggle"
                  onClick={togglePasswordVisibility}
                  disabled={lockoutTimer > 0 || loading}
                >
                  {showPassword ? <i className="fas fa-eye-slash"></i> : <i className="fas fa-eye"></i>}
                </button>
              </div>
              <small className="shared-form-hint">{t.hintPassword}</small>
            </div>

            <button 
              type="submit" 
              className={`shared-login-button ${(isLoading || loading) ? 'shared-login-button-loading' : ''}`}
              disabled={lockoutTimer > 0 || loading}
            >
              {(isLoading || loading) ? (
                <>
                  <span className="shared-spinner"></span>
                  {t.signingIn}
                </>
              ) : lockoutTimer > 0 ? (
                <>
                  <i className="fas fa-hourglass-half"></i> {t.wait} {lockoutTimer}s
                </>
              ) : (
                <>
                  <i className="fas fa-sign-in-alt"></i> {t.signIn}
                </>
              )}
            </button>
          </form>
        </div>

        <div className="shared-login-bg-shape shared-login-bg-shape-1"></div>
        <div className="shared-login-bg-shape shared-login-bg-shape-2"></div>
      </div>

      {showForgotModal && (
        <div className="office-modal-overlay">
          <div className="office-modal">
            <div className="office-modal-header">
              <h3><i className="fas fa-key"></i> {t.forgotTitle}</h3>
              <button className="office-modal-close" onClick={() => setShowForgotModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="office-modal-body">
              <p className="office-modal-text">{t.forgotText}</p>
              <div className="office-form-group">
                <label htmlFor="forgot-email" className="office-form-label">
                  <i className="fas fa-envelope"></i> {t.emailLabel}
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="office-form-input"
                  disabled={forgotLoading}
                />
              </div>
              {forgotMessage && (
                <div className={`office-alert ${forgotMessage.includes('sent') || forgotMessage.includes('ပို့ပြီး') ? 'office-alert-success' : 'office-alert-error'}`}>
                  <span className="office-alert-icon">
                    {forgotMessage.includes('sent') || forgotMessage.includes('ပို့ပြီး') ? <i className="fas fa-check-circle"></i> : <i className="fas fa-exclamation-circle"></i>}
                  </span>
                  <span className="office-alert-text">{forgotMessage}</span>
                </div>
              )}
            </div>
            <div className="office-modal-footer">
              <button className="office-button-secondary" onClick={() => setShowForgotModal(false)} disabled={forgotLoading}>
                {t.cancel}
              </button>
              <button className="office-button-primary" onClick={submitForgotPassword} disabled={forgotLoading}>
                {forgotLoading ? (
                  <><span className="office-spinner-small"></span> {t.sending}</>
                ) : (
                  <><i className="fas fa-paper-plane"></i> {t.sendLink}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopUserLoginPage;