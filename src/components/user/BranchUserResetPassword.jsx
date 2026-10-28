import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import "../../light-style/branch-css/branchUserResetPassword.css";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const BranchUserResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    
    // ===== Language State =====
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('branchLanguage') || 'en';
    });

    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === 'branchLanguage') {
                setLanguage(e.newValue || 'en');
            }
        };
        const handleLanguageEvent = () => {
            const newLang = localStorage.getItem('branchLanguage') || 'en';
            setLanguage(newLang);
        };
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('branchLanguageChange', handleLanguageEvent);
        
        const savedLang = localStorage.getItem('branchLanguage') || 'en';
        setLanguage(savedLang);
        
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('branchLanguageChange', handleLanguageEvent);
        };
    }, []);

    // ===== Form Data =====
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    
    // ===== UI States =====
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [checking, setChecking] = useState(true);
    
    // ===== Password Visibility =====
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ===== Check Token on Load =====
    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setMessage({ 
                type: 'error', 
                text: language === 'mm' ? 'လင့်ခ် မမှန်ကန်ပါ' : 'Invalid reset link' 
            });
            setChecking(false);
            return;
        }

        verifyToken(token);
    }, [searchParams, language]);

    // ===== Verify Reset Token =====
    const verifyToken = async (token) => {
        try {
            const response = await axios.post(
                `${API_BASE_URL}/branch-accounts/verify-reset-token`,
                { token }
            );

            if (response.data.success) {
                setTokenValid(true);
                setEmail(response.data.email);
            } else {
                setMessage({ 
                    type: 'error', 
                    text: response.data.message || (language === 'mm' ? 'လင့်ခ် မမှန်ကန်ပါ' : 'Invalid token')
                });
            }
        } catch (error) {
            console.error('Token verification error:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 
                       (language === 'mm' ? 'ကွန်ရက်ချိတ်ဆက်မှု အမှားရှိနေသည်' : 'Network error')
            });
        } finally {
            setChecking(false);
        }
    };

    // ===== Handle Form Submit =====
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validation
        if (!formData.newPassword || !formData.confirmPassword) {
            setMessage({ 
                type: 'error', 
                text: language === 'mm' ? 'အကွက်အားလုံး ဖြည့်စွက်ပါ' : 'Please fill all fields' 
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ 
                type: 'error', 
                text: language === 'mm' ? 'စကားဝှက်နှစ်ခု မတူညီပါ' : 'Passwords do not match' 
            });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ 
                type: 'error', 
                text: language === 'mm' ? 'စကားဝှက်သည် အနည်းဆုံး ၈ လုံးရှိရပါမည်' : 'Password must be at least 8 characters' 
            });
            return;
        }

        // Password strength check
        if (!/[A-Z]/.test(formData.newPassword)) {
            setMessage({ 
                type: 'error', 
                text: language === 'mm' ? 'စာလုံးအကြီး တစ်လုံးပါဝင်ရပါမည်' : 'Must contain at least one uppercase letter' 
            });
            return;
        }

        if (!/[0-9]/.test(formData.newPassword)) {
            setMessage({ 
                type: 'error', 
                text: language === 'mm' ? 'နံပါတ် တစ်လုံးပါဝင်ရပါမည်' : 'Must contain at least one number' 
            });
            return;
        }

        setLoading(true);
        const token = searchParams.get('token');

        try {
            const response = await axios.post(
                `${API_BASE_URL}/branch-accounts/reset-password`,
                {
                    token,
                    newPassword: formData.newPassword,
                }
            );

            if (response.data.success) {
                setMessage({ 
                    type: 'success', 
                    text: language === 'mm' 
                        ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ခြင်း အောင်မြင်ပါသည်။ ဝင်ရောက်ရန် စာမျက်နှာသို့ ပြန်ညွှန်းနေသည်...' 
                        : 'Password reset successful! Redirecting to login...' 
                });
                
                localStorage.removeItem('currentBranchUser');
                
                setTimeout(() => {
                    navigate('/');
                }, 3000);
            } else {
                setMessage({ 
                    type: 'error', 
                    text: response.data.message || (language === 'mm' ? 'မအောင်မြင်ပါ' : 'Failed to reset password')
                });
            }
        } catch (error) {
            console.error('Password reset error:', error);
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 
                       (language === 'mm' ? 'ကွန်ရက်ချိတ်ဆက်မှု အမှားရှိနေသည်' : 'Network error. Please try again.')
            });
        } finally {
            setLoading(false);
        }
    };

    // ===== Handle Input Change =====
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        if (message.text) {
            setMessage({ type: '', text: '' });
        }
    };

    // ===== Toggle Password Visibility =====
    const toggleNewPassword = () => {
        setShowNewPassword(!showNewPassword);
    };

    const toggleConfirmPassword = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    // ===== Go to Login =====
    const goToLogin = () => {
        navigate('/');
    };

    // ===== Go to Forgot Password =====
    const goToForgotPassword = () => {
        navigate('/branch/forgot-password');
    };

    // ===== Loading State =====
    if (checking) {
        return (
            <div className="reset-container">
                <div className="reset-card loading-card">
                    <div className="spinner"></div>
                    <p>{language === 'mm' ? 'လင့်ခ်ကို စစ်ဆေးနေသည်...' : 'Verifying reset link...'}</p>
                </div>
            </div>
        );
    }

    // ===== Invalid Token State =====
    if (!tokenValid) {
        return (
            <div className="reset-container">
                <div className="reset-card">
                    <div className="reset-header">
                        <div className="reset-icon error-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1>{language === 'mm' ? 'လင့်ခ် မမှန်ကန်ပါ' : 'Invalid Link'}</h1>
                    </div>

                    <div className="invalid-content">
                        <div className="invalid-icon">
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <h3>
                            {language === 'mm' 
                                ? 'ပြန်လည်သတ်မှတ်ရန် လင့်ခ် မမှန်ကန်ပါ' 
                                : 'Reset Link Invalid or Expired'}
                        </h3>
                        <p className="invalid-text">
                            {message.text || (language === 'mm' 
                                ? 'ဤစကားဝှက်ပြန်လည်သတ်မှတ်ရန် လင့်ခ်သည် မမှန်ကန်ပါ သို့မဟုတ် သက်တမ်းကုန်ဆုံးသွားပါပြီ။ ကျေးဇူးပြု၍ အသစ်ပြန်လည်တောင်းဆိုပါ။'
                                : 'This password reset link is invalid or has expired. Please request a new one.')}
                        </p>
                        <div className="invalid-actions">
                            <button 
                                className="btn-primary"
                                onClick={goToLogin}
                            >
                                <i className="fas fa-arrow-left"></i> 
                                {language === 'mm' ? 'ဝင်ရောက်ရန် စာမျက်နှာသို့' : 'Back to Login'}
                            </button>
                            <button 
                                className="btn-secondary"
                                onClick={goToForgotPassword}
                            >
                                <i className="fas fa-redo"></i> 
                                {language === 'mm' ? 'အသစ်တောင်းဆိုရန်' : 'Request New Link'}
                            </button>
                        </div>
                    </div>

                    <div className="reset-footer">
                        <p className="footer-help">
                            <i className="fas fa-headset"></i>
                            {language === 'mm' ? 'အကူအညီလိုပါက' : 'Need help?'}
                            <a href="mailto:branch-support@company.com" className="support-link">
                                {language === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact Support'}
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ===== Main Form =====
    return (
        <div className="reset-container">
            <div className="reset-card">
                {/* Header */}
                <div className="reset-header">
                    <div className="reset-icon">
                        <i className="fas fa-key"></i>
                    </div>
                    <h1>{language === 'mm' ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန်' : 'Reset Password'}</h1>
                    <p className="reset-subtitle">
                        {email 
                            ? (language === 'mm' 
                                ? `${email} အတွက် စကားဝှက်အသစ်ထည့်ပါ` 
                                : `Enter new password for ${email}`)
                            : (language === 'mm' 
                                ? 'သင့်စကားဝှက်အသစ်ကို အောက်တွင်ထည့်ပါ' 
                                : 'Enter your new password below')}
                    </p>
                </div>

                {/* Message Alert */}
                {message.text && (
                    <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                        <span className="alert-icon">
                            {message.type === 'success' 
                                ? <i className="fas fa-check-circle"></i>
                                : <i className="fas fa-exclamation-circle"></i>
                            }
                        </span>
                        <span className="alert-text">{message.text}</span>
                    </div>
                )}

                {/* Password Requirements */}
                <div className="password-requirements">
                    <div className="requirements-title">
                        <i className="fas fa-shield-alt"></i> 
                        {language === 'mm' ? 'စကားဝှက် လိုအပ်ချက်များ' : 'Password Requirements'}
                    </div>
                    <ul className="requirements-list">
                        <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                            {formData.newPassword.length >= 8 
                                ? <i className="fas fa-check-circle"></i>
                                : <i className="fas fa-circle"></i>
                            }
                            {language === 'mm' ? 'အနည်းဆုံး ၈ လုံး' : 'At least 8 characters'}
                        </li>
                        <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                            {/[A-Z]/.test(formData.newPassword)
                                ? <i className="fas fa-check-circle"></i>
                                : <i className="fas fa-circle"></i>
                            }
                            {language === 'mm' ? 'စာလုံးအကြီး တစ်လုံး' : 'At least one uppercase letter'}
                        </li>
                        <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                            {/[0-9]/.test(formData.newPassword)
                                ? <i className="fas fa-check-circle"></i>
                                : <i className="fas fa-circle"></i>
                            }
                            {language === 'mm' ? 'နံပါတ် တစ်လုံး' : 'At least one number'}
                        </li>
                    </ul>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="reset-form">
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-lock"></i> 
                            {language === 'mm' ? 'စကားဝှက်အသစ်' : 'New Password'}
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                placeholder={language === 'mm' ? 'စကားဝှက်အသစ်ထည့်ပါ' : 'Enter new password'}
                                required
                                className="form-input password-input"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={toggleNewPassword}
                                disabled={loading}
                            >
                                {showNewPassword ? (
                                    <i className="fas fa-eye-slash"></i>
                                ) : (
                                    <i className="fas fa-eye"></i>
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-lock"></i> 
                            {language === 'mm' ? 'စကားဝှက်အတည်ပြုရန်' : 'Confirm Password'}
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                placeholder={language === 'mm' ? 'စကားဝှက်အသစ်အတည်ပြုရန်' : 'Confirm new password'}
                                required
                                className="form-input password-input"
                                disabled={loading}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={toggleConfirmPassword}
                                disabled={loading}
                            >
                                {showConfirmPassword ? (
                                    <i className="fas fa-eye-slash"></i>
                                ) : (
                                    <i className="fas fa-eye"></i>
                                )}
                            </button>
                        </div>
                        {formData.newPassword && formData.confirmPassword && (
                            <div className="form-help-text">
                                {formData.newPassword === formData.confirmPassword ? (
                                    <span className="text-success">
                                        <i className="fas fa-check"></i> 
                                        {language === 'mm' ? 'စကားဝှက် တူညီသည်' : 'Passwords match'}
                                    </span>
                                ) : (
                                    <span className="text-error">
                                        <i className="fas fa-times"></i> 
                                        {language === 'mm' ? 'စကားဝှက် မတူညီပါ' : 'Passwords do not match'}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>

                    <button 
                        type="submit" 
                        className={`btn-submit ${loading ? 'btn-loading' : ''}`}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-small"></span>
                                {language === 'mm' ? 'ပြန်လည်သတ်မှတ်နေသည်...' : 'Resetting Password...'}
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sync-alt"></i> 
                                {language === 'mm' ? 'စကားဝှက် ပြန်လည်သတ်မှတ်ရန်' : 'Reset Password'}
                            </>
                        )}
                    </button>

                    <div className="reset-footer">
                        <p className="footer-text">
                            {language === 'mm' ? 'စကားဝှက် မှတ်မိပါသလား?' : 'Remember your password?'}
                            <button 
                                type="button"
                                className="footer-link"
                                onClick={goToLogin}
                                disabled={loading}
                            >
                                {language === 'mm' ? 'ဝင်ရောက်ရန်' : 'Back to Login'}
                            </button>
                        </p>
                        <p className="footer-help">
                            <i className="fas fa-headset"></i>
                            {language === 'mm' ? 'အကူအညီလိုပါက' : 'Need help?'}
                            <a href="mailto:branch-support@company.com" className="support-link">
                                {language === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact Support'}
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BranchUserResetPassword;