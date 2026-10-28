import "../../shared-style/user-css/sharedCoverOtpPage.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { clearPendingLoginData } from "../../redux/slices/authSlice";

const ShopUserOtpPage = () => {
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
  const location = useLocation();
  const dispatch = useDispatch();
  const { pendingLoginData } = useSelector((state) => state.auth);

  const { userType: locationUserType, username: locationUsername, shopCode: locationShopCode } = location.state || {};

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  const [loading, setLoading] = useState(false);

  const inputRefs = useRef([]);

  // ✅ sessionStorage မှ pendingLogin ကို ဖတ်
  const sessionPending = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("pendingLogin") || "null");
    } catch {
      return null;
    }
  })();

  const userType = locationUserType || sessionPending?.userType || pendingLoginData?.userType || "shop";
  const username = locationUsername || sessionPending?.username || pendingLoginData?.username;
  const shopCodeValue = locationShopCode || sessionPending?.shopCode || pendingLoginData?.shopCode;

  // ============================================================
  // ✅ MOCK REDIRECT PATH
  // ============================================================
const getRedirectPath = (role, userType) => {
  // SHOP_OWNER
  if (role === "SHOP_OWNER") {
    return "/userAdminDashboardCombine";
  }

  // Branch user
  if (userType === "branch") {
    switch (role) {
      case "MANAGER":
        return "/branch/manager/account/management/page";  // ✅ ဒီကို ညွှန်
      case "INVENTORY_STAFF":
        return "/user/inventory/page";
      case "STAFF":
        return "/user/category/page";
      case "CASHIER":
        return "/user/sale/page";
      default:
        return "/branch/manager/account/management/page";
    }
  }

  return "/user/category/page";
};

  // ✅ pendingLogin မရှိရင် login page ပြန်ပို့
  useEffect(() => {
    if (!sessionPending && !pendingLoginData && !locationUsername) {
      navigate("/");
    }
  }, [sessionPending, pendingLoginData, locationUsername, navigate]);

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
    setError("");
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

  // ============================================================
  // ✅ MOCK OTP VERIFY
  // ============================================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError(language === "mm" ? "ကျေးဇူးပြု၍ 6 လုံး OTP ကို မှန်ကန်စွာ ရိုက်ထည့်ပါ" : "Please enter a valid 6-digit OTP");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    // ✅ Mock delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // ✅ Demo OTP
    const VALID_OTP = "123456";

    if (otpString !== VALID_OTP) {
      setError(language === "mm" ? "မမှန်ကန်သော OTP" : "Invalid OTP");
      setLoading(false);
      return;
    }

    // ✅ Mock user object
    const isBranch = userType === "branch";

    const mockUser = isBranch
      ? {
          id: "branch-001",
          username: username,
          name: "Branch User",
          email: "branch@example.com",
          role: "MANAGER",           // MANAGER | INVENTORY_STAFF | STAFF | CASHIER
          userType: "branch",
          shopCode: shopCodeValue
        }
      : {
          id: "shop-001",
          username: username,
          name: "Shop User",
          email: "shop@example.com",
          role: "SHOP_OWNER",      // SHOP_OWNER | STAFF | CASHIER | INVENTORY_STAFF
          userType: "shop",
          shopCode: shopCodeValue
        };

    // ✅ localStorage သိမ်း
    localStorage.setItem("user", JSON.stringify(mockUser));
    localStorage.setItem("userType", mockUser.userType);
    localStorage.setItem("userRole", mockUser.role);
    localStorage.setItem("userId", mockUser.id);

    sessionStorage.removeItem("pendingLogin");
    sessionStorage.removeItem("awaitingConfirmation");
    dispatch(clearPendingLoginData());

    // ✅ Redirect path
    const redirectPath = getRedirectPath(mockUser.role, mockUser.userType);

    setSuccess(language === "mm" ? "အတည်ပြုပြီးပါပြီ။ ခေတ္တစောင့်ပါ..." : "Verified! Redirecting...");

    setTimeout(() => {
      window.location.href = redirectPath;
    }, 600);
  };

  // ============================================================
  // ✅ MOCK RESEND OTP
  // ============================================================
  const handleResendOtp = async () => {
    if (timer > 0) return;

    setResendLoading(true);
    setError("");
    setSuccess("");

    await new Promise(resolve => setTimeout(resolve, 800));

    setTimer(60);
    setSuccess(language === "mm" ? "OTP ပြန်လည်ပို့ဆောင်ပြီးပါပြီ (Demo: 123456)" : "OTP resent successfully (Demo: 123456)");
    setResendLoading(false);
  };

  const handleGoBack = () => {
    dispatch(clearPendingLoginData());
    sessionStorage.removeItem("pendingLogin");
    sessionStorage.removeItem("awaitingConfirmation");
    navigate(-1);
  };

  return (
    <div className="shared-otp-main">
      <div className="shared-otp-container">
        <div className="shared-otp-card">
          <div className="shared-otp-header">
            <button className="shared-otp-back-button" onClick={handleGoBack} type="button">
              <i className="fas fa-arrow-left"></i> {language === "mm" ? "နောက်သို့" : "Back"}
            </button>

            <div className="shared-otp-logo">
              <div className="shared-otp-logo-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h1 className="shared-otp-logo-text">{language === "mm" ? "OTP အတည်ပြုရန်" : "Verify OTP"}</h1>
            </div>
          </div>

          {/* ✅ Demo OTP Hint */}
          <div style={{
            background: '#eff6ff',
            border: '1px solid #bfdbfe',
            borderRadius: '10px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#1e40af',
            textAlign: 'center',
            lineHeight: '1.6'
          }}>
            <strong>🔐 Demo OTP:</strong> <code>123456</code><br />
            <span style={{ fontSize: '12px' }}>
              UserType: <code>{userType}</code> | Username: <code>{username}</code> | Shop: <code>{shopCodeValue}</code>
            </span>
          </div>

          {error && (
            <div className="shared-otp-alert shared-otp-alert-error">
              <span className="shared-otp-alert-icon"><i className="fas fa-exclamation-triangle"></i></span>
              <span className="shared-otp-alert-text">{error}</span>
            </div>
          )}

          {success && (
            <div className="shared-otp-alert shared-otp-alert-success">
              <span className="shared-otp-alert-icon"><i className="fas fa-check-circle"></i></span>
              <span className="shared-otp-alert-text">{success}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="shared-otp-form">
            <div className="shared-otp-inputs-container">
              <p className="shared-otp-instruction">
                <i className="fas fa-keyboard"></i> {language === "mm" ? "ကုဒ် 6 လုံးကို ရိုက်ထည့်ပါ" : "Enter 6-digit code"}
              </p>

              <div className="shared-otp-inputs-group">
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
                    className="shared-otp-input"
                    disabled={loading}
                    required
                  />
                ))}
              </div>
            </div>

            <div className="shared-otp-timer-section">
              {timer > 0 ? (
                <p className="shared-otp-timer">
                  <i className="fas fa-clock"></i> {language === "mm" ? "OTP ပြန်ပို့ရန် စောင့်ဆိုင်းရန်" : "Resend OTP in"} <span className="shared-otp-timer-count">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className={`shared-otp-resend-button ${resendLoading ? 'shared-otp-resend-button-loading' : ''}`}
                >
                  {resendLoading ? (
                    <><span className="shared-otp-spinner"></span> {language === "mm" ? "ပြန်ပို့နေသည်..." : "Resending..."}</>
                  ) : (
                    <><i className="fas fa-redo"></i> {language === "mm" ? "OTP ပြန်ပို့ရန်" : "Resend OTP"}</>
                  )}
                </button>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className={`shared-otp-verify-button ${loading ? 'shared-otp-verify-button-loading' : ''}`}
            >
              {loading ? (
                <><span className="shared-otp-spinner"></span> {language === "mm" ? "အတည်ပြုနေသည်..." : "Verifying..."}</>
              ) : (
                <><i className="fas fa-check"></i> {language === "mm" ? "OTP အတည်ပြုပါ" : "Verify OTP"}</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ShopUserOtpPage;