// ResetPassword.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import "../../light-style/owner-css/resetPassword.css"; // ကိုယ်ပိုင် CSS ကိုသာ သုံး

const ResetPassword = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: '',
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [tokenValid, setTokenValid] = useState(false);
    const [email, setEmail] = useState('');
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setMessage({ type: 'error', text: 'Invalid reset link' });
            setChecking(false);
            return;
        }

        verifyToken(token);
    }, [searchParams]);

    const verifyToken = async (token) => {
        try {
            const response = await axios.post(
                'http://localhost:8083/api/v1/ss@01/super-admin/verify-reset-token',
                { token }
            );

            if (response.data.success) {
                setTokenValid(true);
                setEmail(response.data.email);
            } else {
                setMessage({ type: 'error', text: response.data.message });
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Network error' 
            });
        } finally {
            setChecking(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.newPassword || !formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Please fill all fields' });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage({ type: 'error', text: 'Passwords do not match' });
            return;
        }

        if (formData.newPassword.length < 8) {
            setMessage({ type: 'error', text: 'Password must be at least 8 characters' });
            return;
        }

        setLoading(true);
        const token = searchParams.get('token');

        try {
            const response = await axios.post(
                'http://localhost:8083/api/v1/ss@01/super-admin/reset-password',
                {
                    token,
                    newPassword: formData.newPassword,
                }
            );

            if (response.data.success) {
                setMessage({ 
                    type: 'success', 
                    text: 'Password reset successful! Redirecting to login...' 
                });
                
                setTimeout(() => {
                    navigate('/ownerLogin');
                }, 3000);
            } else {
                setMessage({ type: 'error', text: response.data.message });
            }
        } catch (error) {
            setMessage({ 
                type: 'error', 
                text: error.response?.data?.message || 'Network error' 
            });
        } finally {
            setLoading(false);
        }
    };

    // Loading State
    if (checking) {
        return (
            <div className="reset-container">
                <div className="reset-card loading-card">
                    <div className="spinner"></div>
                    <p>Verifying reset link...</p>
                </div>
            </div>
        );
    }

    // Invalid Token State
    if (!tokenValid) {
        return (
            <div className="reset-container">
                <div className="reset-card">
                    <div className="reset-header">
                        <div className="reset-icon error-icon">
                            <i className="fas fa-exclamation-triangle"></i>
                        </div>
                        <h1>Invalid Link</h1>
                    </div>

                    <div className="invalid-content">
                        <div className="invalid-icon">
                            <i className="fas fa-exclamation-circle"></i>
                        </div>
                        <h3>Reset Link Invalid or Expired</h3>
                        <p className="invalid-text">
                            {message.text || "This password reset link is invalid or has expired. Please request a new one."}
                        </p>
                        <div className="invalid-actions">
                            <button 
                                className="btn-primary"
                                onClick={() => navigate('/ownerLogin')}
                            >
                                <i className="fas fa-arrow-left"></i> Back to Login
                            </button>
                            <button 
                                className="btn-secondary"
                                onClick={() => navigate('/forgot-password')}
                            >
                                <i className="fas fa-redo"></i> Request New Link
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Form
    return (
        <div className="reset-container">
            <div className="reset-card">
                {/* Header */}
                <div className="reset-header">
                    <div className="reset-icon">
                        <i className="fas fa-key"></i>
                    </div>
                    <h1>Reset Password</h1>
                    <p className="reset-subtitle">
                        {email ? `Enter new password for ${email}` : 'Enter your new password below'}
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
                        <i className="fas fa-shield-alt"></i> Password Requirements
                    </div>
                    <ul className="requirements-list">
                        <li className={formData.newPassword.length >= 8 ? 'valid' : ''}>
                            {formData.newPassword.length >= 8 
                                ? <i className="fas fa-check-circle"></i>
                                : <i className="fas fa-circle"></i>
                            }
                            At least 8 characters
                        </li>
                        <li className={/[A-Z]/.test(formData.newPassword) ? 'valid' : ''}>
                            {/[A-Z]/.test(formData.newPassword)
                                ? <i className="fas fa-check-circle"></i>
                                : <i className="fas fa-circle"></i>
                            }
                            At least one uppercase letter
                        </li>
                        <li className={/[0-9]/.test(formData.newPassword) ? 'valid' : ''}>
                            {/[0-9]/.test(formData.newPassword)
                                ? <i className="fas fa-check-circle"></i>
                                : <i className="fas fa-circle"></i>
                            }
                            At least one number
                        </li>
                    </ul>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="reset-form">
                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-lock"></i> New Password
                        </label>
                        <div className="password-input-wrapper">
                            <input
                                type="password"
                                placeholder="Enter new password"
                                value={formData.newPassword}
                                onChange={(e) => setFormData({...formData, newPassword: e.target.value})}
                                required
                                className="form-input password-input"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            <i className="fas fa-lock"></i> Confirm Password
                        </label>
                        <input
                            type="password"
                            placeholder="Confirm new password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                            required
                            className="form-input"
                            disabled={loading}
                        />
                        {formData.newPassword && formData.confirmPassword && (
                            <div className="form-help-text">
                                {formData.newPassword === formData.confirmPassword 
                                    ? <span className="text-success"><i className="fas fa-check"></i> Passwords match</span>
                                    : <span className="text-error"><i className="fas fa-times"></i> Passwords do not match</span>
                                }
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
                                Resetting Password...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-sync-alt"></i> Reset Password
                            </>
                        )}
                    </button>

                    <div className="reset-footer">
                        <p className="footer-text">
                            Remember your password?
                            <button 
                                type="button"
                                className="footer-link"
                                onClick={() => navigate('/ownerLogin')}
                                disabled={loading}
                            >
                                Back to Login
                            </button>
                        </p>
                        <p className="footer-help">
                            <i className="fas fa-headset"></i>
                            Need help? 
                            <a href="mailto:support@admin.com" className="support-link">
                                Contact Support
                            </a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;