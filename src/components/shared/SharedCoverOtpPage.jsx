import "../../shared-style/user-css/sharedCoverOtpPage.css";
import { useState, useEffect, useRef } from "react";
import { useNavigate} from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const SharedCoverOtpPage = () => {
    
  const navigate = useNavigate();
  // Outlet context ကနေ language ကို လက်ခံရမယ်
  const { language } = useOutletContext();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [timer, setTimer] = useState(60);
  
  const inputRefs = useRef([]);
  

  // Translations object with ternary conditions
  const translations = {
    title: language === "my" ? "OTPအတည်ပြုရန်" : "Verify OTP",
    subtitle: language === "my" 
      ? "သင့်ရဲ့အကောင့်သို့ ပေးပို့ထားသော OTP ကုဒ် 6 လုံးကို ရိုက်ထည့်ပါ" 
      : "Enter the 6-digit verification code sent to your registered email/phone",
    instruction: language === "my" 
      ? "ကုဒ် 6 လုံးကို ရိုက်ထည့်ပါ" 
      : "Enter 6-digit code",
    verifyButton: language === "my" 
      ? "OTP အတည်ပြုပါ" 
      : "Verify OTP",
    verifying: language === "my" 
      ? "အတည်ပြုနေသည်..." 
      : "Verifying...",
    resendButton: language === "my" 
      ? "OTP ပြန်ပို့ရန်" 
      : "Resend OTP",
    resending: language === "my" 
      ? "ပြန်ပို့နေသည်..." 
      : "Resending...",
    timerText: language === "my" 
      ? "OTP ပြန်ပို့ရန် စောင့်ဆိုင်းရန်" 
      : "Resend OTP in",
    footerText: language === "my" 
      ? "ကုဒ်မရရှိပါက spam folder ကို စစ်ဆေးပါ သို့မဟုတ် သင့် email/phone number မှန်ကန်မှုကို အတည်ပြုပါ။" 
      : "Didn't receive the code? Check your spam folder or ensure your email/phone is correct.",
    contactSupport: language === "my" 
      ? "အကူအညီရယူရန်" 
      : "Contact Support",
    backButton: language === "my" 
      ? "နောက်သို့" 
      : "Back",
    otpError: language === "my" 
      ? "ကျေးဇူးပြု၍ 6 လုံး OTP ကို မှန်ကန်စွာ ရိုက်ထည့်ပါ" 
      : "Please enter a valid 6-digit OTP",
    invalidOtp: language === "my" 
      ? "မမှန်ကန်သော OTP ဖြစ်ပါသည်။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားကြည့်ပါ။" 
      : "Invalid OTP. Please try again.",
    networkError: language === "my" 
      ? "Network ပြဿနာရှိပါသည်။ ကျေးဇူးပြု၍ internet ချိတ်ဆက်မှုကို စစ်ဆေးပါ။" 
      : "Network error. Please check your connection.",
    otpResent: language === "my" 
      ? "OTP ကုဒ်ကို သင့်အကောင့်သို့ ပြန်လည်ပေးပို့ပြီးပါပြီ" 
      : "OTP has been resent to your registered email/phone",
    resendFailed: language === "my" 
      ? "OTP ပြန်ပို့ရန် မအောင်မြင်ပါ။ ကျေးဇူးပြု၍ ထပ်မံကြိုးစားကြည့်ပါ။" 
      : "Failed to resend OTP. Please try again."
  };

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
      pastedData.split("").forEach((char, index) => {
        if (index < 6) newOtp[index] = char;
      });
      setOtp(newOtp);
      inputRefs.current[Math.min(5, pastedData.length - 1)]?.focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    
    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError(translations.otpError);
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/ss@01/super-admin/verify-otp`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ 
            otp: otpString, 
          })
        }
      );

      const data = await res.json();
      
      if (data.success) {
        setSuccess(language === "my" ? "OTP အတည်ပြုပြီးပါပြီ!" : "OTP verified successfully!");
        setTimeout(() => navigate("/ownerDashboard"), 1000);
      } else {
        setError(data.message || translations.invalidOtp);
      }
    } catch (error) {
      setError(translations.networkError);
      console.error("OTP verification error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    
    setResendLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(
        `${API_BASE_URL}/ss@01/super-admin/resend-otp`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = await res.json();
      
      if (data.success) {
        setTimer(60);
        setSuccess(translations.otpResent);
      } else {
        setError(data.message || translations.resendFailed);
      }
    } catch (error) {
      setError(translations.networkError);
    } finally {
      setResendLoading(false);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };
  
  return (
    <div className="shared-otp-main">
      <div className="shared-otp-container">
        <div className="shared-otp-card">
          {/* Header */}
          <div className="shared-otp-header">
            <button 
              className="shared-otp-back-button"
              onClick={handleGoBack}
              type="button"
            >
              <i className="fas fa-arrow-left"></i> {translations.backButton}
            </button>
            
            <div className="shared-otp-logo">
              <div className="shared-otp-logo-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h1 className="shared-otp-logo-text">{translations.title}</h1>
            </div>
            
            <p className="shared-otp-subtitle">
              {translations.subtitle}
            </p>
          </div>

          {/* Messages */}
          {error && (
            <div className="shared-otp-alert shared-otp-alert-error">
              <span className="shared-otp-alert-icon">
                <i className="fas fa-exclamation-triangle"></i>
              </span>
              <span className="shared-otp-alert-text">{error}</span>
            </div>
          )}

          {success && (
            <div className="shared-otp-alert shared-otp-alert-success">
              <span className="shared-otp-alert-icon">
                <i className="fas fa-check-circle"></i>
              </span>
              <span className="shared-otp-alert-text">{success}</span>
            </div>
          )}

          {/* OTP Form */}
          <form onSubmit={handleVerifyOtp} className="shared-otp-form">
            <div className="shared-otp-inputs-container">
              <p className="shared-otp-instruction">
                <i className="fas fa-keyboard"></i> {translations.instruction}
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

            {/* Timer and Resend */}
            <div className="shared-otp-timer-section">
              {timer > 0 ? (
                <p className="shared-otp-timer">
                  <i className="fas fa-clock"></i> {translations.timerText} <span className="shared-otp-timer-count">{timer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={resendLoading}
                  className={`shared-otp-resend-button ${resendLoading ? 'shared-otp-resend-button-loading' : ''}`}
                >
                  {resendLoading ? (
                    <>
                      <span className="shared-otp-spinner"></span>
                      <i className="fas fa-redo"></i> {translations.resending}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-redo"></i> {translations.resendButton}
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              disabled={loading || otp.join("").length !== 6}
              className={`shared-otp-verify-button ${loading ? 'shared-otp-verify-button-loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="shared-otp-spinner"></span>
                  <i className="fas fa-spinner fa-spin"></i> {translations.verifying}
                </>
              ) : (
                <>
                  <i className="fas fa-check"></i> {translations.verifyButton}
                </>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="shared-otp-footer">
            <p className="shared-otp-footer-text">
              {translations.footerText}
            </p>
            <button 
              type="button"
              className="shared-otp-contact-support"
              onClick={() => alert(language === "my" ? "အကူအညီရယူရန်: support@admin.com" : "Contact support at support@admin.com")}
            >
              <i className="fas fa-headset"></i> {translations.contactSupport}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SharedCoverOtpPage;