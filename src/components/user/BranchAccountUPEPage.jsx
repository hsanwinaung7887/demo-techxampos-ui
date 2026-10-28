// src/components/user/BranchAccountUPEPage.jsx (DEMO Version)
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../light-style/user-css/userAccountUPEPage.css";

// ============================================================
// ✅ DEMO DATA - API/Redux ဖယ်ပြီး ဒီထဲမှာပဲ ထည့်ထားတယ်
// ============================================================
const DEMO_USER = {
  id: 2,
  username: 'demo_branch',
  fullName: 'Demo Branch Manager',
  email: 'demo.branch@example.com',
  phone: '09-987654321',
  role: 'BRANCH_MANAGER',
  status: 'Active',
  branchId: 1,
  branchCode: 'branch',
};

const DEMO_BRANCH_CODE = 'branch';

const DEMO_HISTORY = [
  { id: 1, actionType: 'LOGIN', status: 'SUCCESS', createdAt: '2026-09-21T08:30:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'Morning login from branch office' },
  { id: 2, actionType: 'LOGIN', status: 'SUCCESS', createdAt: '2026-09-20T19:15:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'Evening login' },
  { id: 3, actionType: 'PASSWORD_CHANGE', status: 'SUCCESS', createdAt: '2026-09-19T10:00:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'Password updated' },
  { id: 4, actionType: 'LOGIN', status: 'FAILED', createdAt: '2026-09-19T09:55:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'Wrong password attempt' },
  { id: 5, actionType: 'PROFILE_UPDATE', status: 'SUCCESS', createdAt: '2026-09-18T14:20:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'Updated branch phone number' },
  { id: 6, actionType: 'LOGIN', status: 'SUCCESS', createdAt: '2026-09-17T08:00:00', ipAddress: '192.168.1.25', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1', details: 'Login from Mac' },
  { id: 7, actionType: 'OTP_VERIFY', status: 'SUCCESS', createdAt: '2026-09-16T15:30:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'OTP verified' },
  { id: 8, actionType: 'OTP_SENT', status: 'SUCCESS', createdAt: '2026-09-16T15:25:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'OTP sent to email' },
  { id: 9, actionType: 'LOGOUT', status: 'SUCCESS', createdAt: '2026-09-15T21:00:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'User logged out' },
  { id: 10, actionType: 'DEVICE_TRUSTED', status: 'SUCCESS', createdAt: '2026-09-14T11:45:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'New device trusted' },
  { id: 11, actionType: 'LOGIN', status: 'SUCCESS', createdAt: '2026-09-13T08:15:00', ipAddress: '192.168.1.20', userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0', details: 'Morning login' },
];

// ============================================================
// MAIN COMPONENT
// ============================================================
const BranchAccountUPEPage = () => {
  const navigate = useNavigate();

  // ✅ Demo user (Redux ဖယ်)
  const [currentUser, setCurrentUser] = useState(DEMO_USER);

  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('appLanguage') || 'en';
  });

  // ✅ Edit form state
  const [editForm, setEditForm] = useState({
    currentPassword: "",
    username: DEMO_USER.username,
    fullName: DEMO_USER.fullName,
    email: DEMO_USER.email,
    phone: DEMO_USER.phone
  });

  // Loading state
  const [loading, setLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Password form
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // History states
  const [accountHistory, setAccountHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [branchCode, setBranchCode] = useState(DEMO_BRANCH_CODE);
  const [branchLoading, setBranchLoading] = useState(false);
  const [historyStats, setHistoryStats] = useState({ totalLogins: 0, failedAttempts: 0 });
  const itemsPerPage = 5;

  // ✅ Update edit form when currentUser changes
  useEffect(() => {
    if (currentUser) {
      setEditForm(prev => ({
        ...prev,
        username: currentUser.username || "",
        fullName: currentUser.fullName || "",
        email: currentUser.email || "",
        phone: currentUser.phone || ""
      }));
    }
  }, [currentUser]);

  // Language change listener
  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    window.addEventListener('appLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('appLanguageChanged', handleLanguageChange);
  }, []);

  // ✅ Branch code - demo (local)
  useEffect(() => {
    if (currentUser?.branchId) {
      setBranchLoading(true);
      setTimeout(() => {
        setBranchCode(DEMO_BRANCH_CODE);
        setBranchLoading(false);
      }, 300);
    }
  }, [currentUser]);

  // ============================================================
  // ✅ DEMO: Fetch history (local data + pagination)
  // ============================================================
  const fetchAccountHistory = async (page = 1) => {
    setHistoryLoading(true);
    setHistoryError("");

    setTimeout(() => {
      try {
        const total = DEMO_HISTORY.length;
        const totalP = Math.max(1, Math.ceil(total / itemsPerPage));
        const start = (page - 1) * itemsPerPage;
        const pageData = DEMO_HISTORY.slice(start, start + itemsPerPage);

        const totalLogins = DEMO_HISTORY.filter(h => h.actionType === 'LOGIN' && h.status === 'SUCCESS').length;
        const failedAttempts = DEMO_HISTORY.filter(h => h.status === 'FAILED').length;

        setAccountHistory(pageData);
        setCurrentPage(page);
        setTotalItems(total);
        setTotalPages(totalP);
        setHistoryStats({ totalLogins, failedAttempts });
      } catch (err) {
        setHistoryError(language === 'mm' ? "မှတ်တမ်းရယူရန် မအောင်မြင်ပါ" : "Failed to fetch history");
      } finally {
        setHistoryLoading(false);
      }
    }, 400);
  };

  const openHistoryModal = () => {
    setShowHistoryModal(true);
    fetchAccountHistory(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchAccountHistory(newPage);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // ============================================================
  // ✅ DEMO: Update account info (local state)
  // ============================================================
  const handleUpdateAccountInfo = async () => {
    if (!editForm.currentPassword) {
      alert(language === 'mm' ? "အတည်ပြုရန် သင့်လက်ရှိစကားဝှက်ကို ရိုက်ထည့်ပါ" : "Please enter your current password");
      return;
    }

    setCurrentUser(prev => ({
      ...prev,
      username: editForm.username,
      fullName: editForm.fullName,
      email: editForm.email,
      phone: editForm.phone,
    }));

    const newHistory = {
      id: Date.now(),
      actionType: 'PROFILE_UPDATE',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
      ipAddress: '192.168.1.20',
      userAgent: navigator.userAgent,
      details: 'Profile updated (demo)',
    };
    DEMO_HISTORY.unshift(newHistory);

    alert(language === 'mm' ? "အချက်အလက် မွမ်းမံခြင်း အောင်မြင်ပါသည် (Demo)" : "Information updated successfully! (Demo)");
    setShowEditModal(false);
    setEditForm(prev => ({ ...prev, currentPassword: "" }));
  };

  // ============================================================
  // ✅ DEMO: Change password (local validation only)
  // ============================================================
  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert(language === 'mm' ? "အကွက်အားလုံးဖြည့်ပါ" : "Please fill all fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert(language === 'mm' ? "စကားဝှက်အသစ်နှင့် အတည်ပြုစကားဝှက် မတူပါ" : "Passwords do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert(language === 'mm' ? "စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်" : "Password must be at least 6 characters");
      return;
    }

    const newHistory = {
      id: Date.now(),
      actionType: 'PASSWORD_CHANGE',
      status: 'SUCCESS',
      createdAt: new Date().toISOString(),
      ipAddress: '192.168.1.20',
      userAgent: navigator.userAgent,
      details: 'Password changed (demo)',
    };
    DEMO_HISTORY.unshift(newHistory);

    alert(language === 'mm' ? "စကားဝှက် ပြောင်းလဲခြင်း အောင်မြင်ပါသည် (Demo)" : "Password changed successfully! (Demo)");
    setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setShowPasswordModal(false);
  };

  const handleLogout = async () => {
    localStorage.removeItem('currentBranchUser');
    navigate('/');
  };

  // Helper functions for history display
  const getActionIcon = (actionType) => {
    switch(actionType) {
      case "LOGIN": return "fa-sign-in-alt";
      case "LOGOUT": return "fa-sign-out-alt";
      case "PASSWORD_CHANGE": return "fa-key";
      case "PROFILE_UPDATE": return "fa-user-edit";
      case "OTP_VERIFY": return "fa-shield-alt";
      case "OTP_SENT": return "fa-paper-plane";
      case "DEVICE_TRUSTED": return "fa-laptop";
      case "FORGOT_PASSWORD": return "fa-question-circle";
      default: return "fa-history";
    }
  };

  const getActionText = (actionType) => {
    const map = {
      "LOGIN": language === 'mm' ? "ဝင်ရောက်ခြင်း" : "Login",
      "LOGOUT": language === 'mm' ? "ထွက်ခြင်း" : "Logout",
      "PASSWORD_CHANGE": language === 'mm' ? "စကားဝှက်ပြောင်းခြင်း" : "Password Change",
      "PROFILE_UPDATE": language === 'mm' ? "ပရိုဖိုင်မွမ်းမံခြင်း" : "Profile Update",
      "OTP_VERIFY": language === 'mm' ? "OTP အတည်ပြုခြင်း" : "OTP Verification",
      "OTP_SENT": language === 'mm' ? "OTP ပို့ခြင်း" : "OTP Sent",
      "DEVICE_TRUSTED": language === 'mm' ? "စက်ပစ္စည်းယုံကြည်ရခြင်း" : "Device Trusted",
      "FORGOT_PASSWORD": language === 'mm' ? "စကားဝှက်မေ့ခြင်း" : "Password Reset Request"
    };
    return map[actionType] || actionType;
  };

  const getStatusClass = (status) => {
    switch(status) {
      case "SUCCESS": return "status-success";
      case "FAILED": return "status-failed";
      case "PENDING": return "status-pending";
      default: return "";
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(language === 'mm' ? 'my' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const parseUserAgent = (userAgent) => {
    if (!userAgent) return { browser: language === 'mm' ? "မသိရှိ" : "Unknown", os: language === 'mm' ? "မသိရှိ" : "Unknown" };
    let browser = "Unknown", os = "Unknown";
    if (userAgent.includes("Chrome")) browser = "Chrome";
    else if (userAgent.includes("Firefox")) browser = "Firefox";
    else if (userAgent.includes("Safari")) browser = "Safari";
    else if (userAgent.includes("Edge")) browser = "Edge";
    if (userAgent.includes("Windows")) os = "Windows";
    else if (userAgent.includes("Mac")) os = "macOS";
    else if (userAgent.includes("Linux")) os = "Linux";
    else if (userAgent.includes("Android")) os = "Android";
    else if (userAgent.includes("iOS")) os = "iOS";
    return { browser, os };
  };

  // ✅ loading state
  if (loading) {
    return (
      <div className="shop-account-loading">
        <div className="spinner"></div>
        <p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p>
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="shop-account-loading">
        <div className="spinner"></div>
        <p>{language === 'mm' ? 'အသုံးပြုသူဒေတာ ဖွင့်နေသည်...' : 'Loading user data...'}</p>
      </div>
    );
  }

  return (
    <div className="shop-account-container">
      {/* Network error banner */}
      {networkError && (
        <div className="shop-account-network-error">
          <i className="fas fa-wifi-slash"></i>
          <div className="error-content">
            <div className="error-title">{language === 'mm' ? 'ချိတ်ဆက်မှုအမှား' : 'Connection Error'}</div>
            <div className="error-message">{networkError}</div>
          </div>
          <button onClick={() => window.location.reload()}>
            <i className="fas fa-sync-alt"></i> {language === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}
          </button>
        </div>
      )}

      {/* Section title with history button */}
      <div className="shop-account-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <i className="fas fa-user-circle"></i> {language === 'mm' ? 'ဆိုင်ခွဲအကောင့်အချက်အလက်' : 'Branch Account Information'}
        </div>
        <button className="shop-account-history-btn" onClick={openHistoryModal}>
          <i className="fas fa-history"></i>
          {language === 'mm' ? 'မှတ်တမ်း' : 'History'}
        </button>
      </div>
      
      {/* Account details table */}
      <div className="shop-account-table-wrapper">
        <table className="shop-account-table">
          <thead>
            <tr>
              <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
              <th>{language === 'mm' ? 'ဆိုင်ခွဲကုဒ်' : 'Branch Code'}</th>
              <th>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</th>
              <th>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</th>
              <th>{language === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact'}</th>
              <th>{language === 'mm' ? 'အခန်းကဏ္ဍ' : 'Role'}</th>
              <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
              <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Action'}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>
                <div>
                  <strong>
                    {branchLoading ? <i className="fas fa-spinner fa-spin"></i> : (branchCode || currentUser?.branchId)}
                  </strong>
                  <div className="shop-account-created">
                    <i className="fas fa-sign-in-alt"></i> 
                    {language === "mm" 
                      ? "login ဝင်တဲ့ခါ ဌာနခွဲကုဒ်အဖြစ် အသုံးပြုရန်" 
                      : "Use as branch code when logging in"}
                  </div>
                </div>
               </td>
              <td>
                <div>
                  <strong>{currentUser?.username}</strong>
                  <div className="shop-account-created">
                    <i className="fas fa-sign-in-alt"></i> 
                    {language === "mm" 
                      ? "login ဝင်တဲ့ခါအသုံးပြုသူအမည်အဖြစ် အသုံးပြုရန်" 
                      : "Use as username when logging in"}
                  </div>
                </div>
               </td>
              <td><strong>{currentUser?.fullName || '-'}</strong></td>
              <td>
                <div className="shop-account-contact-cell">
                  <div className="shop-account-contact-item">
                    <i className="fas fa-envelope"></i>
                    <span>{currentUser?.email || '-'}</span>
                  </div>
                  <div className="shop-account-contact-item">
                    <i className="fas fa-phone"></i>
                    <span>{currentUser?.phone || '-'}</span>
                  </div>
                </div>
               </td>
              <td>
                <div className="shop-account-role-cell">
                  <span className={`user-account-upe-role-badge role-${currentUser?.role?.toLowerCase()}`}>
                    {currentUser?.role}
                  </span>
                </div>
               </td>
              <td>
                <span className={`shop-account-status-badge ${currentUser?.status === 'Active' ? 'status-active' : 'status-disabled'}`}>
                  {currentUser?.status === 'Active' 
                    ? (language === 'mm' ? 'အသက်ဝင်သည်' : 'Active')
                    : (language === 'mm' ? 'မအသက်ဝင်ပါ' : 'Inactive')}
                </span>
               </td>
              <td>
                <div className="shop-account-action-buttons">
                  <button className="shop-account-edit-btn" onClick={() => setShowEditModal(true)}>
                    <i className="fas fa-edit"></i> {language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit Info'}
                  </button>
                  <button className="shop-account-change-password-btn" onClick={() => setShowPasswordModal(true)}>
                    <i className="fas fa-key"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}
                  </button>
                </div>
               </td>
             </tr>
          </tbody>
        </table>
      </div>

      {/* Security notice */}
      <div className="shop-account-security-notice">
        <i className="fas fa-shield-alt"></i>
        <p>
          {language === 'mm' 
            ? 'လုံခြုံရေးသတိပေးချက် - သင့်အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို မည်သူ့ကိုမျှ မျှဝေခြင်းမပြုပါနှင့်။'
            : 'Security Notice - Do not share your username and password with anyone.'}
        </p>
      </div>

      {/* Edit Info Modal */}
      {showEditModal && (
        <div className="shop-account-modal-overlay">
          <div className="shop-account-modal-content" style={{ maxWidth: '600px' }}>
            <div className="shop-account-modal-header">
              <h3><i className="fas fa-user-edit"></i> {language === 'mm' ? 'ကိုယ်ရေးအချက်အလက် ပြင်ဆင်ရန်' : 'Edit Personal Information'}</h3>
              <button className="shop-account-modal-close" onClick={() => setShowEditModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="shop-account-modal-body">
              <div className="edit-info-form">
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'လက်ရှိစကားဝှက် (အတည်ပြုရန်)' : 'Current Password (Verification)'}</label>
                  <input type="password" name="currentPassword" value={editForm.currentPassword} onChange={handleEditFormChange}
                    placeholder={language === 'mm' ? 'အတည်ပြုရန် စကားဝှက်ထည့်ပါ' : 'Enter password to verify'} />
                  <div className="form-help-text"><i className="fas fa-info-circle"></i> {language === 'mm' ? 'ပြောင်းလဲမှုပြုလုပ်ရန် သင့်လက်ရှိစကားဝှက် လိုအပ်ပါသည်' : 'Your current password is required to make changes'}</div>
                </div>
                <div className="form-section-divider"><span>{language === 'mm' ? 'ကိုယ်ရေးအချက်အလက်' : 'Personal Information'}</span></div>
                <div className="shop-account-form-row">
                  <div className="shop-account-form-group">
                    <label>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                    <input type="text" name="username" value={editForm.username} onChange={handleEditFormChange} />
                  </div>
                  <div className="shop-account-form-group">
                    <label>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                    <input type="text" name="fullName" value={editForm.fullName} onChange={handleEditFormChange} />
                  </div>
                </div>
                <div className="shop-account-form-row">
                  <div className="shop-account-form-group">
                    <label className="shop-account-required">{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                    <input type="email" name="email" value={editForm.email} onChange={handleEditFormChange} />
                  </div>
                  <div className="shop-account-form-group">
                    <label>{language === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone'}</label>
                    <input type="tel" name="phone" value={editForm.phone} onChange={handleEditFormChange} />
                  </div>
                </div>
              </div>
            </div>
            <div className="shop-account-modal-footer">
              <button className="shop-account-btn-cancel" onClick={() => setShowEditModal(false)}>{language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}</button>
              <button className="shop-account-btn-submit" onClick={handleUpdateAccountInfo} disabled={!editForm.currentPassword}>
                <i className="fas fa-save"></i> {language === 'mm' ? 'သိမ်းရန်' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="shop-account-modal-overlay">
          <div className="shop-account-modal-content" style={{ maxWidth: '500px' }}>
            <div className="shop-account-modal-header">
              <h3><i className="fas fa-key"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}</h3>
              <button className="shop-account-modal-close" onClick={() => setShowPasswordModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="shop-account-modal-body">
              <div className="change-password-form">
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'စကားဝှက်ဟောင်း' : 'Old Password'}</label>
                  <input type="password" name="oldPassword" value={passwordForm.oldPassword} onChange={handlePasswordFormChange} />
                </div>
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'စကားဝှက်အသစ်' : 'New Password'}</label>
                  <input type="password" name="newPassword" value={passwordForm.newPassword} onChange={handlePasswordFormChange} />
                </div>
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'အတည်ပြုစကားဝှက်' : 'Confirm Password'}</label>
                  <input type="password" name="confirmPassword" value={passwordForm.confirmPassword} onChange={handlePasswordFormChange} />
                </div>
                <div className="forget-password-link" onClick={() => navigate('/branch/forgot-password')}>
                  <i className="fas fa-question-circle"></i> <span>{language === 'mm' ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forgot Password?'}</span>
                </div>
              </div>
            </div>
            <div className="shop-account-modal-footer">
              <button className="shop-account-btn-cancel" onClick={() => setShowPasswordModal(false)}>{language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}</button>
              <button className="shop-account-btn-submit" onClick={handleChangePassword} disabled={!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}>
                <i className="fas fa-save"></i> {language === 'mm' ? 'ပြောင်းရန်' : 'Change'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistoryModal && (
        <div className="shop-account-modal-overlay">
          <div className="shop-account-modal-content" style={{ maxWidth: '800px' }}>
            <div className="shop-account-modal-header">
              <h3><i className="fas fa-history"></i> {language === 'mm' ? 'လှုပ်ရှားမှုမှတ်တမ်း' : 'Activity History'}</h3>
              <button className="shop-account-modal-close" onClick={() => setShowHistoryModal(false)}><i className="fas fa-times"></i></button>
            </div>
            
            <div className="shop-account-modal-body">
              {/* Stats Summary */}
              {!historyLoading && !historyError && accountHistory.length > 0 && (
                <div className="shop-account-history-stats">
                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-label">{language === 'mm' ? 'စုစုပေါင်းဝင်ရောက်မှု' : 'Total Logins'}:</span>
                      <span className="user-stat-value">{historyStats.totalLogins}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{language === 'mm' ? 'မအောင်မြင်သည့်အကြိမ်' : 'Failed Attempts'}:</span>
                      <span className="user-stat-value">{historyStats.failedAttempts}</span>
                    </div>
                  </div>
                  <div className="stats-row">
                    <div className="stat-item">
                      <span className="stat-label">{language === 'mm' ? 'အခြားလုပ်ဆောင်ချက်' : 'Other Activities'}:</span>
                      <span className="user-stat-value">
                        {Math.max(0, totalItems - historyStats.totalLogins - historyStats.failedAttempts)}
                      </span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{language === 'mm' ? 'စုစုပေါင်းလုပ်ဆောင်ချက်' : 'Total Activities'}:</span>
                      <span className="user-stat-value">{totalItems}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading State */}
              {historyLoading && (
                <div className="shop-account-history-loading">
                  <div className="spinner"></div>
                  <p>{language === 'mm' ? 'မှတ်တမ်းများရယူနေသည်...' : 'Loading history...'}</p>
                </div>
              )}

              {/* Error State */}
              {historyError && (
                <div className="shop-account-history-error">
                  <i className="fas fa-exclamation-triangle"></i>
                  <p>{historyError}</p>
                  <button onClick={() => fetchAccountHistory(currentPage)}>
                    <i className="fas fa-redo"></i> {language === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Try Again'}
                  </button>
                </div>
              )}

              {/* History List */}
              {!historyLoading && !historyError && (
                <>
                  {accountHistory.length === 0 ? (
                    <div className="shop-account-history-empty">
                      <i className="fas fa-history"></i>
                      <p>{language === 'mm' ? 'လှုပ်ရှားမှုမှတ်တမ်း မရှိပါ' : 'No activity history found'}</p>
                    </div>
                  ) : (
                    <div className="shop-account-history-list">
                      {accountHistory.map((item) => {
                        const { browser, os } = parseUserAgent(item.userAgent);
                        return (
                          <div key={item.id} className="shop-account-history-item">
                            <div className="shop-account-history-icon">
                              <i className={`fas ${getActionIcon(item.actionType)}`}></i>
                            </div>
                            <div className="shop-account-history-content">
                              <div className="shop-account-history-header">
                                <span className="shop-account-history-action">
                                  {getActionText(item.actionType)}
                                </span>
                                <span className={`shop-account-history-status ${getStatusClass(item.status)}`}>
                                  {item.status}
                                </span>
                              </div>
                              <div className="shop-account-history-details">
                                <div className="detail-row">
                                  <i className="fas fa-calendar"></i>
                                  <span>{formatDate(item.createdAt)}</span>
                                </div>
                                {item.ipAddress && (
                                  <div className="detail-row">
                                    <i className="fas fa-globe"></i>
                                    <span>IP: {item.ipAddress}</span>
                                  </div>
                                )}
                                {(browser !== 'Unknown' || os !== 'Unknown') && (
                                  <div className="detail-row">
                                    <i className="fas fa-laptop"></i>
                                    <span>{browser} / {os}</span>
                                  </div>
                                )}
                                {item.details && (
                                  <div className="detail-row details-text">
                                    <i className="fas fa-info-circle"></i>
                                    <span>{item.details}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="shop-account-pagination">
                      <button 
                        className="shop-account-page-btn"
                        onClick={() => handlePageChange(1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-angle-double-left"></i>
                      </button>
                      <button 
                        className="shop-account-page-btn"
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        <i className="fas fa-angle-left"></i>
                      </button>
                      
                      <span className="user-account-page-info">
                        {language === 'mm' ? 'စာမျက်နှာ' : 'Page'} {currentPage} / {totalPages}
                      </span>
                      
                      <button 
                        className="shop-account-page-btn"
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-angle-right"></i>
                      </button>
                      <button 
                        className="shop-account-page-btn"
                        onClick={() => handlePageChange(totalPages)}
                        disabled={currentPage === totalPages}
                      >
                        <i className="fas fa-angle-double-right"></i>
                      </button>
                    </div>
                  )}

                  {/* Footer Info */}
                  {accountHistory.length > 0 && (
                    <div className="shop-account-history-footer">
                      {language === 'mm' ? 'ပြသခြင်း' : 'Showing'} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} {language === 'mm' ? '၏' : 'of'} {totalItems}
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="shop-account-modal-footer">
              <button className="shop-account-btn-cancel" onClick={() => setShowHistoryModal(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchAccountUPEPage;