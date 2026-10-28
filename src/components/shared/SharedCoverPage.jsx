import "../../shared-style/user-css/sharedCoverPage.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";
import { getDeviceFingerprint } from "../utils/getDeviceFingerprint";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const SharedCoverPage = () => {
    const navigate = useNavigate();
    const { language } = useOutletContext();
    const [credentials, setCredentials] = useState({
        shopCode: "",
        username: "",
        password: ""
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showForgotModal, setShowForgotModal] = useState(false);
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotLoading, setForgotLoading] = useState(false);
    const [forgotMessage, setForgotMessage] = useState("");

    // Translations
    const translations = {
        loginTitle: language === 'my' ? 'အကောင့်ဝင်ရန်' : 'Login Form',
        loginSubtitle: language === 'my' ? 'ဆိုင်အကောင့်ဖွင့်ပြီး စတင်ရောင်းချပါ' : 'Register your shop and start selling',
        shopCodeLabel: language === 'my' ? 'ဆိုင်ကုဒ်' : 'Shop Code',
        shopCodePlaceholder: language === 'my' ? 'သင့်ဆိုင်ကုဒ်ထည့်ပါ' : 'Enter your shop code',
        usernameLabel: language === 'my' ? 'အသုံးပြုသူအမည်' : 'Username',
        usernamePlaceholder: language === 'my' ? 'အသုံးပြုသူအမည် ထည့်ပါ' : 'Enter your username',
        passwordLabel: language === 'my' ? 'စကားဝှက်' : 'Password',
        passwordPlaceholder: language === 'my' ? 'စကားဝှက်ထည့်ပါ' : 'Enter your password',
        loginButton: language === 'my' ? 'လော့ဂ်အင်' : 'Login',
        loggingIn: language === 'my' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...',
        forgotPassword: language === 'my' ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot Password?',
        networkError: language === 'my' ? 'ဆာဗာနှင့်ချိတ်ဆက်မရပါ' : 'Cannot connect to server',
        invalidCredentials: language === 'my' ? 'ဆိုင်ကုဒ်၊ အသုံးပြုသူအမည် သို့မဟုတ် စကားဝှက်မှားယွင်းနေပါသည်' : 'Invalid shop code, username or password'
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCredentials(prev => ({
            ...prev,
            [name]: value
        }));
        setError("");
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            // Get device fingerprint
            const fingerprint = await getDeviceFingerprint();

            const requestBody = {
                shopCode: credentials.shopCode,
                username: credentials.username,
                password: credentials.password,
                deviceFingerprint: fingerprint
            };
            

            const res = await fetch(
                `${API_BASE_URL}/shop-accounts/login`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify(requestBody)
                }
            );


            const data = await res.json();

            if (!res.ok) {
                throw new Error(`HTTP ${res.status}: ${data.message || 'Server error'}`);
            }

            if (data.success) {
      
                // Save user data to localStorage
                if (data.user) {
                    const userData = {
                        id: data.user.id,
                        username: data.user.username,
                        fullName: data.user.fullName,
                        email: data.user.email,
                        phone: data.user.phone,
                        role: data.user.role,
                        shopCode: data.user.shopCode,
                        shopId: data.user.shopId,
                        shopName: data.user.shopName
                    };
                    
            
                    localStorage.setItem('currentShopUser', JSON.stringify(userData));
                    
                    // Verify storage
                    const stored = JSON.parse(localStorage.getItem('currentShopUser') || '{}');
   
                }
                
                // Check if OTP required
                if (data.requiresOtp) {
     
                    navigate("/shop/otp-verify");
                } else {

                    navigate("/shop/dashboard");
                }
            } else {
     
                setError(data.message || translations.invalidCredentials);
            }
            
        } catch (err) {
            console.error("=== LOGIN ERROR ===");
            console.error("Error:", err);
            
            if (err.message.includes('Network')) {
                setError(translations.networkError);
            } else {
                setError(err.message || translations.invalidCredentials);
            }
        } finally {
            setIsSubmitting(false);
  
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const handleForgotPassword = () => {
        setShowForgotModal(true);
        setForgotEmail("");
        setForgotMessage("");
    };

    const submitForgotPassword = async () => {
        if (!forgotEmail) {
            setForgotMessage(language === 'my' ? 'ကျေးဇူးပြု၍ email လိပ်စာထည့်ပါ' : 'Please enter your email address');
            return;
        }

        setForgotLoading(true);
        setForgotMessage("");

        try {
            const res = await fetch(
                `${API_BASE_URL}/shop-accounts/forgot-password`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email: forgotEmail
                    })
                }
            );

            const data = await res.json();

            if (data.success) {
                const msg = language === 'my' 
                    ? 'စကားဝှက်ပြန်လည်သတ်မှတ်ရန် link ကို သင့် email သို့ပေးပို့ပြီးပါပြီ' 
                    : 'Password reset link has been sent to your email';
                setForgotMessage(msg);
                
                setTimeout(() => {
                    setShowForgotModal(false);
                }, 3000);
            } else {
                setForgotMessage(data.message || (language === 'my' ? 'Link ပေးပို့ရန် မအောင်မြင်ပါ' : 'Failed to send reset link'));
            }
        } catch (err) {
            const msg = language === 'my' 
                ? 'Network ပြဿနာရှိပါသည်။ ထပ်မံကြိုးစားကြည့်ပါ။' 
                : 'Network error. Please try again.';
            setForgotMessage(msg);
            console.error("Forgot password error:", err);
        } finally {
            setForgotLoading(false);
        }
    };

    return(
        <>
            <div className="share-main">
                <div className="share-container">
                    <div className="right-login">
                        <h3>{translations.loginTitle}</h3>
                        <p>{translations.loginSubtitle}</p>
                        
                        {/* Error Message */}
                        {error && (
                            <div className="error-message" style={{
                                backgroundColor: '#fee',
                                color: '#c00',
                                padding: '10px',
                                borderRadius: '5px',
                                marginBottom: '15px',
                                border: '1px solid #fcc'
                            }}>
                                <i className="fas fa-exclamation-triangle" style={{marginRight: '8px'}}></i>
                                {error}
                            </div>
                        )}
                        
                        <form onSubmit={handleLogin}>
                            <div className="col1">
                                <label htmlFor="shopCode">
                                    <i className="fas fa-store" style={{marginRight: '8px'}}></i>
                                    {translations.shopCodeLabel}
                                </label>
                                <input 
                                    type="text"
                                    id="shopCode"
                                    name="shopCode"
                                    placeholder={translations.shopCodePlaceholder}
                                    value={credentials.shopCode}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>

                            <div className="col1">
                                <label htmlFor="username">
                                    <i className="fas fa-user" style={{marginRight: '8px'}}></i>
                                    {translations.usernameLabel}
                                </label>
                                <input 
                                    type="text" 
                                    id="username"
                                    name="username"
                                    placeholder={translations.usernamePlaceholder}
                                    value={credentials.username}
                                    onChange={handleChange}
                                    required
                                    disabled={isSubmitting}
                                />
                            </div>
                            
                            <div className="col1">
                                <div className="form-label-row" style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '8px'
                                }}>
                                    <label htmlFor="password">
                                        <i className="fas fa-key" style={{marginRight: '8px'}}></i>
                                        {translations.passwordLabel}
                                    </label>
                                    <button 
                                        type="button" 
                                        className="forgot-password-link"
                                        onClick={handleForgotPassword}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            color: '#0066cc',
                                            cursor: 'pointer',
                                            fontSize: '14px',
                                            padding: '0'
                                        }}
                                    > 
                                        {translations.forgotPassword}
                                    </button>
                                </div>
                                <div style={{position: 'relative'}}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        id="password"
                                        name="password"
                                        placeholder={translations.passwordPlaceholder}
                                        value={credentials.password}
                                        onChange={handleChange}
                                        required
                                        disabled={isSubmitting}
                                        style={{
                                            width: '100%',
                                            paddingRight: '40px'
                                        }}
                                    />
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        disabled={isSubmitting}
                                        style={{
                                            position: 'absolute',
                                            right: '10px',
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none',
                                            border: 'none',
                                            color: '#666',
                                            cursor: 'pointer',
                                            padding: '5px'
                                        }}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                    >
                                        {showPassword ? (
                                            <i className="fas fa-eye-slash"></i>
                                        ) : (
                                            <i className="fas fa-eye"></i>
                                        )}
                                    </button>
                                </div>
                            </div>
                            
                            <div className="col1">
                                <button 
                                    type="submit" 
                                    disabled={isSubmitting}
                                    className={isSubmitting ? "loading" : ""}
                                    style={{
                                        width: '100%',
                                        padding: '12px',
                                        backgroundColor: isSubmitting ? '#ccc' : '#007bff',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '5px',
                                        cursor: isSubmitting ? 'not-allowed' : 'pointer',
                                        fontSize: '16px'
                                    }}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <span className="spinner" style={{
                                                display: 'inline-block',
                                                width: '16px',
                                                height: '16px',
                                                border: '2px solid #fff',
                                                borderTopColor: 'transparent',
                                                borderRadius: '50%',
                                                marginRight: '8px',
                                                animation: 'spin 1s linear infinite'
                                            }}></span>
                                            {translations.loggingIn}
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-sign-in-alt" style={{marginRight: '8px'}}></i>
                                            {translations.loginButton}
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Forgot Password Modal */}
            {showForgotModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        backgroundColor: 'white',
                        borderRadius: '10px',
                        padding: '20px',
                        width: '90%',
                        maxWidth: '500px',
                        boxShadow: '0 5px 20px rgba(0,0,0,0.2)'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '20px',
                            borderBottom: '1px solid #eee',
                            paddingBottom: '10px'
                        }}>
                            <h3 style={{margin: 0}}>
                                <i className="fas fa-key" style={{marginRight: '10px'}}></i>
                                {language === 'my' ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot Password'}
                            </h3>
                            <button 
                                onClick={() => setShowForgotModal(false)}
                                style={{
                                    background: 'none',
                                    border: 'none',
                                    fontSize: '18px',
                                    cursor: 'pointer',
                                    color: '#666'
                                }}
                            >
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        
                        <div style={{marginBottom: '20px'}}>
                            <p style={{marginBottom: '15px'}}>
                                {language === 'my' 
                                    ? 'သင့် email လိပ်စာထည့်ပါ။ စကားဝှက်ပြန်လည်သတ်မှတ်ရန် link ပေးပို့ပါမည်။' 
                                    : 'Enter your registered email address. We\'ll send you a password reset link.'}
                            </p>
                            
                            <div style={{marginBottom: '15px'}}>
                                <label htmlFor="forgotEmail" style={{
                                    display: 'block',
                                    marginBottom: '5px',
                                    fontWeight: 'bold'
                                }}>
                                    <i className="fas fa-envelope" style={{marginRight: '8px'}}></i>
                                    {language === 'my' ? 'Email လိပ်စာ' : 'Email Address'}
                                </label>
                                <input
                                    type="email"
                                    id="forgotEmail"
                                    placeholder={language === 'my' ? 'သင့် email လိပ်စာထည့်ပါ' : 'Enter your registered email'}
                                    value={forgotEmail}
                                    onChange={(e) => setForgotEmail(e.target.value)}
                                    disabled={forgotLoading}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        border: '1px solid #ddd',
                                        borderRadius: '5px'
                                    }}
                                />
                            </div>
                            
                            {forgotMessage && (
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '5px',
                                    marginBottom: '15px',
                                    backgroundColor: forgotMessage.includes('sent') ? '#d4edda' : '#f8d7da',
                                    color: forgotMessage.includes('sent') ? '#155724' : '#721c24',
                                    border: `1px solid ${forgotMessage.includes('sent') ? '#c3e6cb' : '#f5c6cb'}`
                                }}>
                                    <i className={`fas ${forgotMessage.includes('sent') ? 'fa-check-circle' : 'fa-exclamation-circle'}`} 
                                       style={{marginRight: '8px'}}></i>
                                    {forgotMessage}
                                </div>
                            )}
                        </div>
                        
                        <div style={{
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '10px'
                        }}>
                            <button
                                onClick={() => setShowForgotModal(false)}
                                disabled={forgotLoading}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: '#6c757d',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: forgotLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {language === 'my' ? 'မလုပ်တော့ပါ' : 'Cancel'}
                            </button>
                            <button
                                onClick={submitForgotPassword}
                                disabled={forgotLoading}
                                style={{
                                    padding: '8px 16px',
                                    backgroundColor: forgotLoading ? '#ccc' : '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: forgotLoading ? 'not-allowed' : 'pointer'
                                }}
                            >
                                {forgotLoading ? (
                                    <>
                                        <span style={{
                                            display: 'inline-block',
                                            width: '12px',
                                            height: '12px',
                                            border: '2px solid #fff',
                                            borderTopColor: 'transparent',
                                            borderRadius: '50%',
                                            marginRight: '8px',
                                            animation: 'spin 1s linear infinite'
                                        }}></span>
                                        {language === 'my' ? 'ပေးပို့နေသည်...' : 'Sending...'}
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-paper-plane" style={{marginRight: '8px'}}></i>
                                        {language === 'my' ? 'Link ပို့ရန်' : 'Send Reset Link'}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add CSS for spinner animation */}
            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </>
    )
}

export default SharedCoverPage;