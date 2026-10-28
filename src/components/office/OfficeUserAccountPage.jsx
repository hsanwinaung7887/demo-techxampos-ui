import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import "../../light-style/office-css/officeUserAccountPage.css";
import { getOfficeCurrentUser, officeLogout, clearOfficeError } from '../../redux/slices/officeAuthSlice';
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();


const OfficeUserAccountPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // ✅ Redux ကနေ user ကိုယူ
  const { user: reduxUser, isAuthenticated, isLoading: authLoading, error: authError } = useSelector((state) => state.officeAuth);
  
  // ✅ currentUser ကို useMemo နဲ့ memoize
  const currentUser = useMemo(() => {
    if (reduxUser && isAuthenticated) {
      return {
        id: reduxUser.id,
        username: reduxUser.username,
        fullName: reduxUser.fullName || reduxUser.username,
        email: reduxUser.email,
        phone: reduxUser.phone || '',
        role: reduxUser.role,
        status: reduxUser.status || 'Active',
      };
    }
    return null;
  }, [reduxUser?.id, reduxUser?.role, isAuthenticated]);
  
  // ===== Language State =====
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('officeLanguage') || 'en';
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'officeLanguage') {
        setLanguage(e.newValue || 'en');
      }
    };
    const handleLanguageEvent = (e) => {
        if (e.detail && e.detail.language) {
            setLanguage(e.detail.language);
        } else {
            const newLang = localStorage.getItem('officeLanguage') || 'en';
            setLanguage(newLang);
        }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('officeLanguageChange', handleLanguageEvent);
    
    const savedLang = localStorage.getItem('officeLanguage') || 'en';
    setLanguage(savedLang);
    
    return () => {
        window.removeEventListener('storage', handleStorageChange);
        window.removeEventListener('officeLanguageChange', handleLanguageEvent);
    };
  }, []);

  // ✅ Check authentication on mount
  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      dispatch(getOfficeCurrentUser());
    }
  }, [dispatch, isAuthenticated, authLoading]);

  // ✅ Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/office/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ===== Modal States =====
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // ===== Edit Form State =====
  const [editForm, setEditForm] = useState({
    currentPassword: "",
    username: "",
    fullName: "",
    email: "",
    phone: ""
  });

  // ===== Password Form State =====
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // ===== History States =====
  const [accountHistory, setAccountHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [historyStats, setHistoryStats] = useState({
    totalLogins: 0,
    failedAttempts: 0
  });
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

  // ===== Fetch Account History from Backend =====
  const fetchAccountHistory = async (page = 1) => {
    if (!currentUser?.id) return;
    
    setHistoryLoading(true);
    setHistoryError("");
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/ss@01/office-user/history/${currentUser.id}?page=${page}&size=${itemsPerPage}`,
        {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        }
      );
      
      const response = await res.json();
      
      if (response.success) {
        const historyData = response.data;
        setAccountHistory(historyData.history || []);
        setCurrentPage(historyData.currentPage || 1);
        setTotalItems(historyData.totalItems || 0);
        setTotalPages(historyData.totalPages || 1);
        setHistoryStats(historyData.stats || { totalLogins: 0, failedAttempts: 0 });
      } else {
        setHistoryError(response.message || (language === 'mm' ? "မှတ်တမ်းရယူရန် မအောင်မြင်ပါ" : "Failed to fetch history"));
      }
    } catch (err) {
      console.error("History fetch error:", err);
      setHistoryError(language === 'mm' ? "ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာရှိနေသည်" : "Network error");
    } finally {
      setHistoryLoading(false);
    }
  };

  // ===== Open History Modal =====
  const openHistoryModal = () => {
    setShowHistoryModal(true);
    fetchAccountHistory(1);
  };

  // ===== Handle Page Change =====
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      fetchAccountHistory(newPage);
    }
  };

  // ===== Handle Edit Form Change =====
  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // ===== Handle Password Form Change =====
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  // ===== Update Account Info API =====
  const handleUpdateAccountInfo = async () => {
    if (!editForm.currentPassword) {
      alert(language === 'mm' ? "အတည်ပြုရန် သင့်လက်ရှိစကားဝှက်ကို ရိုက်ထည့်ပါ" : "Please enter your current password");
      return;
    }

    try {
      const res = await fetch(
        `${API_BASE_URL}/ss@01/office-user/update-info/${currentUser.id}?currentPassword=${encodeURIComponent(editForm.currentPassword)}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            username: editForm.username,
            fullName: editForm.fullName,
            email: editForm.email,
            phone: editForm.phone
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message || (language === 'mm' ? "အချက်အလက် မွမ်းမံခြင်း အောင်မြင်ပါသည်" : "Information updated successfully!"));
        setShowEditModal(false);
        setEditForm(prev => ({ ...prev, currentPassword: "" }));
        // Refresh user data
        dispatch(getOfficeCurrentUser());
      } else {
        alert(data.message || (language === 'mm' ? "မွမ်းမံရန် မအောင်မြင်ပါ" : "Update failed"));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'mm' ? "တစ်ခုခု မှားယွင်းသွားပါသည်" : "Something went wrong");
    }
  };

  // ===== Change Password API =====
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

    try {
      const res = await fetch(
        `${API_BASE_URL}/ss@01/office-user/change-password/${currentUser.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            oldPassword: passwordForm.oldPassword,
            newPassword: passwordForm.newPassword
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        alert(data.message || (language === 'mm' ? "စကားဝှက် ပြောင်းလဲခြင်း အောင်မြင်ပါသည်" : "Password changed successfully!"));
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowPasswordModal(false);
      } else {
        alert(data.message || (language === 'mm' ? "စကားဝှက် ပြောင်းလဲရန် မအောင်မြင်ပါ" : "Failed to change password"));
      }
    } catch (err) {
      console.error(err);
      alert(language === 'mm' ? "တစ်ခုခု မှားယွင်းသွားပါသည်" : "Something went wrong");
    }
  };

  // ===== Logout =====
  const handleLogout = async () => {
    await dispatch(officeLogout()).unwrap();
    navigate('/office/login');
  };

  // ===== Helper Functions for History =====
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
    const actionMap = {
      "LOGIN": language === 'mm' ? "ဝင်ရောက်ခြင်း" : "Login",
      "LOGOUT": language === 'mm' ? "ထွက်ခြင်း" : "Logout",
      "PASSWORD_CHANGE": language === 'mm' ? "စကားဝှက်ပြောင်းခြင်း" : "Password Change",
      "PROFILE_UPDATE": language === 'mm' ? "ပရိုဖိုင်မွမ်းမံခြင်း" : "Profile Update",
      "OTP_VERIFY": language === 'mm' ? "OTP အတည်ပြုခြင်း" : "OTP Verification",
      "OTP_SENT": language === 'mm' ? "OTP ပို့ခြင်း" : "OTP Sent",
      "DEVICE_TRUSTED": language === 'mm' ? "စက်ပစ္စည်းယုံကြည်ရခြင်း" : "Device Trusted",
      "FORGOT_PASSWORD": language === 'mm' ? "စကားဝှက်မေ့ခြင်း" : "Password Reset Request"
    };
    return actionMap[actionType] || actionType;
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
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const parseUserAgent = (userAgent) => {
    if (!userAgent) return { browser: language === 'mm' ? "မသိရှိ" : "Unknown", os: language === 'mm' ? "မသိရှိ" : "Unknown" };
    
    let browser = language === 'mm' ? "မသိရှိ" : "Unknown";
    let os = language === 'mm' ? "မသိရှိ" : "Unknown";
    
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

  // ===== Loading State =====
  if (authLoading || !currentUser) {
    return (
      <div className="office-account-loading">
        <div className="spinner"></div>
        <p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p>
      </div>
    );
  }

  // ===== Main Render =====
  return (
    <div className="office-account-container">
      {/* Header */}
      <div className="office-management-header">
        <div className="header-top-row">
          <button className="office-account-back-btn" onClick={() => navigate('/office/dashboard')}>
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်' : 'Back to Dashboard'}
          </button>
          <div className="header-center-content">
            <h1><i className="fas fa-user-tie"></i> {language === 'mm' ? 'ရုံးဝန်ထမ်း အကောင့် စီမံခန့်ခွဲမှု' : 'Office User Account Management'}</h1>
            <p>{language === 'mm' ? 'သင်၏ကိုယ်ရေးကိုယ်တာအချက်အလက်များကို စီမံခန့်ခွဲရန်' : 'Manage your personal information'}</p>
          </div>
        </div>
      </div>

      {/* Section Title with History Button */}
      <div className="office-account-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <i className="fas fa-user-tie"></i> {language === 'mm' ? 'ရုံးဝန်ထမ်း အကောင့်' : 'Office User Account'}
        </div>
        <button 
          className="office-account-history-btn"
          onClick={openHistoryModal}
        >
          <i className="fas fa-history"></i>
          {language === 'mm' ? 'အကောင့်မှတ်တမ်း' : 'Account History'}
        </button>
      </div>

      {/* Account Table */}
      <div className="office-account-table-wrapper">
        <table className="office-account-table">
          <thead>
            <tr>
              <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
              <th>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</th>
              <th>{language === 'mm' ? 'စကားဝှက်' : 'Password'}</th>
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
                  <strong>{currentUser?.username}</strong>
                </div>
               </td>
              <td>
                <div className="password-display">
                  <strong>********</strong>
                  <div className="password-hint">
                    <i className="fas fa-info-circle"></i> {language === 'mm' ? 'လုံခြုံရေးအတွက် ဝှက်ထားသည်' : 'Hidden for security'}
                  </div>
                </div>
               </td>
              <td>{currentUser?.fullName || '-'}</td>
              <td>
                <div className="office-account-contact-cell">
                  <div className="office-account-contact-item">
                    <i className="fas fa-envelope office-account-contact-icon"></i>
                    <span className="office-account-contact-text">{currentUser?.email || '-'}</span>
                  </div>
                  <div className="office-account-contact-item">
                    <i className="fas fa-phone office-account-contact-icon"></i>
                    <span className="office-account-contact-text">{currentUser?.phone || '-'}</span>
                  </div>
                </div>
               </td>
              <td>
                <div className="office-account-role-cell">
                    <span className={`office-account-role-badge role-${currentUser?.role?.toLowerCase()}`}>
                        {currentUser?.role === 'MANAGER' && (language === 'mm' ? 'မန်နေဂျာ' : 'Manager')}
                        {currentUser?.role === 'ACCOUNT_TEAM' && (language === 'mm' ? 'အကောင့်အဖွဲ့' : 'Account Team')}
                        {currentUser?.role === 'BILLING_TEAM' && (language === 'mm' ? 'ငွေကိုင်အဖွဲ့' : 'Billing Team')}
                        {currentUser?.role === 'CUSTOMER_SERVICE' && (language === 'mm' ? 'ဖောက်သည်ဝန်ဆောင်မှု' : 'Customer Service')}
                        {currentUser?.role === 'ACCOUNTANT' && (language === 'mm' ? 'စာရင်းကိုင်' : 'Accountant')}
                    </span>
                </div>
               </td>
              <td>
                <span className={`office-account-status-badge ${currentUser?.status === 'Active' ? "status-active" : "status-disabled"}`}>
                  {currentUser?.status === 'Active' 
                    ? (language === 'mm' ? 'အသက်ဝင်သည်' : 'Active') 
                    : (language === 'mm' ? 'မအသက်ဝင်ပါ' : 'Inactive')}
                </span>
               </td>
              <td>
                <div className="office-account-action-buttons">
                  <button 
                    className="office-account-edit-btn"
                    onClick={() => setShowEditModal(true)}
                  >
                    <i className="fas fa-edit"></i> {language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit Info'}
                  </button>
                  <button 
                    className="office-account-change-password-btn"
                    onClick={() => setShowPasswordModal(true)}
                  >
                    <i className="fas fa-key"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}
                  </button>
                </div>
               </td>
             </tr>
          </tbody>
        </table>
      </div>

      {/* Security Notice */}
      <div className="office-account-security-notice">
        <i className="fas fa-shield-alt"></i>
        <p>
          {language === 'mm' 
            ? 'လုံခြုံရေးသတိပေးချက် - သင့်အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို မည်သူ့ကိုမျှ မျှဝေခြင်းမပြုပါနှင့်။'
            : 'Security Notice - Do not share your username and password with anyone.'}
        </p>
      </div>

      {/* ===== EDIT MODAL ===== */}
      {showEditModal && (
        <div className="office-account-modal-overlay">
          <div className="office-account-modal-content" style={{ maxWidth: '600px' }}>
            <div className="office-account-modal-header">
              <h3><i className="fas fa-user-edit"></i> {language === 'mm' ? 'ကိုယ်ရေးအချက်အလက် ပြင်ဆင်ရန်' : 'Edit Personal Information'}</h3>
              <button className="office-account-modal-close" onClick={() => setShowEditModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="office-account-modal-body">
              <div className="edit-info-form">
                <div className="office-account-form-group">
                  <label className="office-account-required">{language === 'mm' ? 'လက်ရှိစကားဝှက် (အတည်ပြုရန်)' : 'Current Password (Verification)'}</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    value={editForm.currentPassword} 
                    onChange={handleEditFormChange} 
                    placeholder={language === 'mm' ? 'အတည်ပြုရန် စကားဝှက်ထည့်ပါ' : 'Enter password to verify'}
                  />
                </div>
                
                <div className="form-section-divider">
                  <span>{language === 'mm' ? 'ကိုယ်ရေးအချက်အလက်' : 'Personal Information'}</span>
                </div>
                
                <div className="office-account-form-row">
                  <div className="office-account-form-group">
                    <label>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                    <input 
                      type="text" 
                      name="username" 
                      value={editForm.username} 
                      onChange={handleEditFormChange} 
                    />
                  </div>
                  <div className="office-account-form-group">
                    <label>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={editForm.fullName} 
                      onChange={handleEditFormChange} 
                    />
                  </div>
                </div>
                
                <div className="office-account-form-row">
                  <div className="office-account-form-group">
                    <label className="office-account-required">{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={editForm.email} 
                      onChange={handleEditFormChange} 
                    />
                  </div>
                  <div className="office-account-form-group">
                    <label>{language === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={editForm.phone} 
                      onChange={handleEditFormChange} 
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="office-account-modal-footer">
              <button className="office-account-btn-cancel" onClick={() => setShowEditModal(false)}>
                {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
              </button>
              <button 
                className="office-account-btn-submit" 
                onClick={handleUpdateAccountInfo}
                disabled={!editForm.currentPassword}
              >
                <i className="fas fa-save"></i> {language === 'mm' ? 'သိမ်းရန်' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== PASSWORD MODAL ===== */}
      {showPasswordModal && (
        <div className="office-account-modal-overlay">
          <div className="office-account-modal-content" style={{ maxWidth: '500px' }}>
            <div className="office-account-modal-header">
              <h3><i className="fas fa-key"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}</h3>
              <button className="office-account-modal-close" onClick={() => setShowPasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="office-account-modal-body">
              <div className="change-password-form">
                <div className="office-account-form-group">
                  <label className="office-account-required">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                  <input type="text" value={currentUser?.username || ""} disabled className="disabled-input" />
                </div>
                <div className="office-account-form-group">
                  <label className="office-account-required">{language === 'mm' ? 'စကားဝှက်ဟောင်း' : 'Old Password'}</label>
                  <input 
                    type="password" 
                    name="oldPassword" 
                    value={passwordForm.oldPassword} 
                    onChange={handlePasswordFormChange} 
                  />
                </div>
                <div className="office-account-form-group">
                  <label className="office-account-required">{language === 'mm' ? 'စကားဝှက်အသစ်' : 'New Password'}</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordFormChange} 
                  />
                </div>
                <div className="office-account-form-group">
                  <label className="office-account-required">{language === 'mm' ? 'စကားဝှက်အတည်ပြုရန်' : 'Confirm Password'}</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={passwordForm.confirmPassword} 
                    onChange={handlePasswordFormChange} 
                  />
                </div>
              </div>
            </div>
            <div className="office-account-modal-footer">
              <button className="office-account-btn-cancel" onClick={() => setShowPasswordModal(false)}>
                {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
              </button>
              <button 
                className="office-account-btn-submit" 
                onClick={handleChangePassword}
                disabled={!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                <i className="fas fa-save"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== HISTORY MODAL ===== */}
      {showHistoryModal && (
        <div className="office-account-modal-overlay">
          <div className="office-account-modal-content" style={{ maxWidth: '800px' }}>
            <div className="office-account-modal-header">
              <h3>
                <i className="fas fa-history"></i> 
                {language === 'mm' ? 'လှုပ်ရှားမှုမှတ်တမ်း' : 'Activity History'}
              </h3>
              <button className="office-account-modal-close" onClick={() => setShowHistoryModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="office-account-modal-body">
              {/* Stats Summary */}
              {!historyLoading && !historyError && accountHistory.length > 0 && (
                <div className="office-account-history-stats">
                  <div className="first-row">
                    <div className="stat-item">
                      <span className="stat-label">{language === 'mm' ? 'စုစုပေါင်းဝင်ရောက်မှု' : 'Total Logins'}:</span>
                      <span className="stat-value-final">{historyStats.totalLogins}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label">{language === 'mm' ? 'မအောင်မြင်သည့်အကြိမ်' : 'Failed Attempts'}:</span>
                      <span className="stat-value-final">{historyStats.failedAttempts}</span>
                    </div>
                  </div>
                  <div className="first-row">
                    <div className="stat-item">
                      <span className="stat-label">{language === 'mm' ? 'အခြားလုပ်ဆောင်ချက်' : 'Other Activities'}:</span>
                      <span className="stat-value-final">{totalItems - historyStats.totalLogins - historyStats.failedAttempts}</span>
                    </div>
                    <div className="stat-item">
                      <span className="stat-label-final">{language === 'mm' ? 'စုစုပေါင်းလုပ်ဆောင်ချက်' : 'Total Activities'}:</span>
                      <span className="stat-value-final2">{totalItems}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* History List */}
              {!historyLoading && !historyError && accountHistory.length > 0 && (
                <div className="office-account-history-list">
                  {accountHistory.map((item) => {
                    const { browser, os } = parseUserAgent(item.userAgent);
                    return (
                      <div key={item.id} className="office-account-history-item">
                        <div className="office-account-history-icon">
                          <i className={`fas ${getActionIcon(item.actionType)}`}></i>
                        </div>
                        <div className="office-account-history-content">
                          <div className="office-account-history-header">
                            <span className="office-account-history-action">
                              {getActionText(item.actionType)}
                            </span>
                            <span className={`office-account-history-status ${getStatusClass(item.status)}`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="office-account-history-details">
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
                            {(browser !== (language === 'mm' ? 'မသိရှိ' : 'Unknown') || os !== (language === 'mm' ? 'မသိရှိ' : 'Unknown')) && (
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
                <div className="office-account-pagination">
                  <button 
                    className="office-account-page-btn"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-angle-double-left"></i>
                  </button>
                  <button 
                    className="office-account-page-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <i className="fas fa-angle-left"></i>
                  </button>
                  
                  <span className="office-account-page-info">
                    {language === 'mm' ? 'စာမျက်နှာ' : 'Page'} {currentPage} / {totalPages}
                  </span>
                  
                  <button 
                    className="office-account-page-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fas fa-angle-right"></i>
                  </button>
                  <button 
                    className="office-account-page-btn"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <i className="fas fa-angle-double-right"></i>
                  </button>
                </div>
              )}
            </div>
            
            <div className="office-account-modal-footer">
              <button className="office-account-btn-cancel" onClick={() => setShowHistoryModal(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeUserAccountPage;