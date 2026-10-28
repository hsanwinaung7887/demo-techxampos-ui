import React, { useState, useEffect, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import "../../light-style/owner-css/OwnerAccountPage.css";
import { setOwnerUser } from '../../redux/slices/ownerAuthSlice';
import { useSelector, useDispatch } from 'react-redux';
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const OwnerAccountPage = () => {
  // ===== Language =====
  const dispatch = useDispatch();
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'dashboardLanguage') {
        setLanguage(e.newValue || 'en');
      }
    };
    const handleLanguageEvent = () => {
      setLanguage(localStorage.getItem('dashboardLanguage') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChange', handleLanguageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChange', handleLanguageEvent);
    };
  }, []);

  // ===== Redux - Owner Data =====
  const { user: ownerUser, isAuthenticated } = useSelector((state) => state.ownerAuth);

  // ===== Convert Redux user to account format =====
  const superAdminAccount = useMemo(() => ({
    id: ownerUser?.id,
    username: ownerUser?.username || "",
    fullName: ownerUser?.fullName || "",
    email: ownerUser?.email || "",
    phone: ownerUser?.phone || "",
    role: ownerUser?.role || "SUPER_ADMIN",
    status: ownerUser?.status !== false,
    createdDate: ownerUser?.createdAt
  }), [ownerUser]);

  // ===== UI States =====
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showEditInfoModal, setShowEditInfoModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const [tableLoading, setTableLoading] = useState(false);

  // ===== Password Form =====
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // ===== Edit Form =====
  const [editForm, setEditForm] = useState({
    currentPassword: "",
    username: "",
    fullName: "",
    email: "",
    phone: ""
  });

  // ===== Initialize Edit Form with Owner Data =====
  useEffect(() => {
    if (ownerUser) {
      setEditForm(prev => ({
        ...prev,
        username: ownerUser.username || "",
        fullName: ownerUser.fullName || "",
        email: ownerUser.email || "",
        phone: ownerUser.phone || ""
      }));
    }
  }, [ownerUser]);

  // ===== History States =====
  const [accountHistory, setAccountHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [historyStats, setHistoryStats] = useState({ totalLogins: 0, failedAttempts: 0 });
  const itemsPerPage = 5;

  // ===== Retry Connection =====
  const retryConnection = () => {
    setNetworkError(null);
    setHistoryError("");
    fetchAccountHistory(currentPage);
  };

  // ===== Fetch Account History =====
  const fetchAccountHistory = async (page = 1) => {
    setHistoryLoading(true);
    setHistoryError("");
    setNetworkError(null);
    
    try {
      const res = await fetch(
        `${API_BASE_URL}/ss@01/super-admin/history?page=${page}&size=${itemsPerPage}`, 
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
      if (err.message.includes('Network') || err.message.includes('Failed to fetch')) {
        setNetworkError(language === 'mm' 
          ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။" 
          : "Cannot connect to server. Please check your internet connection.");
      } else {
        setHistoryError(language === 'mm' ? "ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာရှိနေသည်" : "Network error. Please try again.");
      }
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

  // ===== Handle Form Changes =====
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  // ===== Change Password =====
  const handleChangePassword = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      alert(language === 'mm' ? "အကွက်အားလုံးဖြည့်ပါ" : "Please fill in all fields");
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert(language === 'mm' ? "စကားဝှက်အသစ်နှင့် အတည်ပြုစကားဝှက် မတူပါ" : "New password and confirm password do not match");
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      alert(language === 'mm' ? "စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်" : "Password must be at least 6 characters long");
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/ss@01/super-admin/change-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        alert(data.message || (language === 'mm' ? "စကားဝှက် ပြောင်းလဲခြင်း အောင်မြင်ပါသည်" : "Password changed successfully!"));
        setPasswordForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        setShowChangePasswordModal(false);
      } else {
        alert(data.message || (language === 'mm' ? "စကားဝှက် ပြောင်းလဲရန် မအောင်မြင်ပါ" : "Failed to change password"));
      }
    } catch (err) {
      alert(language === 'mm' ? "တစ်ခုခု မှားယွင်းသွားပါသည်။ ထပ်ကြိုးစားပါ" : "Something went wrong. Please try again.");
    }
  };

  // ===== Update Account Info =====
  const handleUpdateAccountInfo = async () => {
    if (!editForm.currentPassword) {
      alert(language === 'mm' ? "အတည်ပြုရန် သင့်လက်ရှိစကားဝှက်ကို ရိုက်ထည့်ပါ" : "Please enter your current password to verify");
      return;
    }
    if (!editForm.username || !editForm.email) {
      alert(language === 'mm' ? "အသုံးပြုသူအမည်နှင့် အီးမေးလ် လိုအပ်ပါသည်" : "Username and email are required");
      return;
    }

    try {
    const res = await fetch(`${API_BASE_URL}/ss@01/super-admin/update-info?currentPassword=${encodeURIComponent(editForm.currentPassword)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        username: editForm.username,
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone
      })
    });

    const data = await res.json();
  
    if (res.ok && data.success) {
      // ✅ Force update - data.user မပါရင်တောင် ကိုယ်တိုင်ဖွဲ့
      const updatedUserData = {
        id: ownerUser?.id,
        username: editForm.username,
        fullName: editForm.fullName,
        email: editForm.email,
        phone: editForm.phone,
        role: ownerUser?.role || "SUPER_ADMIN",
        status: ownerUser?.status !== false
      };
      
      console.log("Manually created user data:", updatedUserData);
      dispatch(setOwnerUser(updatedUserData));
      
      alert(data.message || "Update successful!");
      setShowEditInfoModal(false);
    } else {
      alert(data.message || "Update failed");
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong");
  }
};

  // ===== Open Edit Modal =====
  const openEditModal = () => {
    setEditForm(prev => ({
      ...prev,
      username: ownerUser?.username || "",
      fullName: ownerUser?.fullName || "",
      email: ownerUser?.email || "",
      phone: ownerUser?.phone || "",
      currentPassword: ""
    }));
    setShowEditInfoModal(true);
  };

  // ===== Helper Functions =====
  const getActionIcon = (actionType) => {
    const icons = {
      "LOGIN": "fa-sign-in-alt",
      "LOGOUT": "fa-sign-out-alt",
      "PASSWORD_CHANGE": "fa-key",
      "PROFILE_UPDATE": "fa-user-edit",
      "OTP_VERIFY": "fa-shield-alt",
      "OTP_SENT": "fa-paper-plane",
      "DEVICE_TRUSTED": "fa-laptop",
      "FORGOT_PASSWORD": "fa-question-circle"
    };
    return icons[actionType] || "fa-history";
  };

  const getActionText = (actionType) => {
    const texts = {
      "LOGIN": language === 'mm' ? "ဝင်ရောက်ခြင်း" : "Login",
      "LOGOUT": language === 'mm' ? "ထွက်ခြင်း" : "Logout",
      "PASSWORD_CHANGE": language === 'mm' ? "စကားဝှက်ပြောင်းခြင်း" : "Password Change",
      "PROFILE_UPDATE": language === 'mm' ? "ပရိုဖိုင်မွမ်းမံခြင်း" : "Profile Update",
      "OTP_VERIFY": language === 'mm' ? "OTP အတည်ပြုခြင်း" : "OTP Verification",
      "OTP_SENT": language === 'mm' ? "OTP ပို့ခြင်း" : "OTP Sent",
      "DEVICE_TRUSTED": language === 'mm' ? "စက်ပစ္စည်းယုံကြည်ရခြင်း" : "Device Trusted",
      "FORGOT_PASSWORD": language === 'mm' ? "စကားဝှက်မေ့ခြင်း" : "Password Reset Request"
    };
    return texts[actionType] || actionType;
  };

  const getStatusClass = (status) => {
    const classes = {
      "SUCCESS": "status-success",
      "FAILED": "status-failed",
      "PENDING": "status-pending",
      "ERROR": "status-error"
    };
    return classes[status] || "";
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
  if (!isAuthenticated) {
    return (
      <div className="shop-account-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p>
        </div>
      </div>
    );
  }

  // ===== Render =====
  return (
    <div className="shop-account-container">
      {/* Network Error */}
      {networkError && (
        <div className="user-account-network-error">
          <i className="fas fa-wifi-slash"></i>
          <div className="error-content">
            <div className="error-title">{language === 'mm' ? 'ချိတ်ဆက်မှုအမှား' : 'Connection Error'}</div>
            <div className="error-message">{networkError}</div>
          </div>
          <button onClick={retryConnection}>
            <i className="fas fa-sync-alt"></i> {language === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}
          </button>
        </div>
      )}

      {/* Header */}
      <div className="shop-management-header">
        <div className="header-top-row">
          <NavLink to="/owner/dashboard" className="shop-account-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်' : 'Back to Dashboard'}
          </NavLink>
          <div className="header-center-content">
            <h1><i className="fas fa-user-shield"></i> {language === 'mm' ? 'စူပါအက်ဒမင် အကောင့် စီမံခန့်ခွဲမှု' : 'Super Admin Account Management'}</h1>
            <p>{language === 'mm' ? 'စနစ်အက်ဒမင်အကောင့် စီမံခန့်ခွဲရန်' : 'Manage system administrator account'}</p>
          </div>
        </div>
      </div>

      {/* Title */}
      <div className="shop-account-section-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <i className="fas fa-user-shield"></i> {language === 'mm' ? 'စနစ်အက်ဒမင် အကောင့်' : 'System Administrator Account'}
        </div>
        <button className="shop-account-history-btn" onClick={openHistoryModal}>
          <i className="fas fa-history"></i> {language === 'mm' ? 'အကောင့်မှတ်တမ်း' : 'Account History'}
        </button>
      </div>

      {/* Table */}
      <div className="shop-account-table-wrapper">
        <table className="shop-account-table">
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
                  <strong>{superAdminAccount.username}</strong>
                  <div className="shop-account-created">
                    <i className="far fa-clock"></i> {language === 'mm' ? 'ဖန်တီးရက်' : 'Created'}: {superAdminAccount.createdDate ? new Date(superAdminAccount.createdDate).toLocaleDateString() : ""}
                  </div>
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
              <td>{superAdminAccount.fullName}</td>
              <td>
                <div className="shop-account-contact-cell">
                  <div className="shop-account-contact-item">
                    <i className="fas fa-envelope shop-account-contact-icon"></i>
                    <span className="shop-account-contact-text">{superAdminAccount.email}</span>
                  </div>
                  <div className="shop-account-contact-item">
                    <i className="fas fa-phone shop-account-contact-icon"></i>
                    <span className="shop-account-contact-text">{superAdminAccount.phone || (language === 'mm' ? 'မရှိသေး' : 'N/A')}</span>
                  </div>
                </div>
              </td>
              <td>
                <div className="shop-account-role-cell">
                  <span className="shop-account-role-badge role-super_admin">
                    {superAdminAccount.role}
                  </span>
                  <div className="shop-account-role-desc">
                    {language === 'mm' ? 'စနစ်အပြည့်အဝ အသုံးပြုခွင့်' : 'Full system access and control'}
                  </div>
                </div>
              </td>
              <td>
                <span className={`shop-account-status-badge ${superAdminAccount.status ? "status-active" : "status-disabled"}`}>
                  {superAdminAccount.status 
                    ? (language === 'mm' ? 'အသက်ဝင်သည်' : 'Active') 
                    : (language === 'mm' ? 'မအသက်ဝင်ပါ' : 'Inactive')}
                </span>
              </td>
              <td>
                <div className="shop-account-action-buttons">
                  <button className="shop-account-edit-btn" onClick={openEditModal}>
                    <i className="fas fa-edit"></i> {language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit Info'}
                  </button>
                  <button className="shop-account-change-password-btn" onClick={() => setShowChangePasswordModal(true)}>
                    <i className="fas fa-key"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Security Notice */}
      <div className="shop-account-security-notice">
        <i className="fas fa-shield-alt"></i>
        <p>
          {language === 'mm' 
            ? 'လုံခြုံရေးသတိပေးချက် - သင့်အသုံးပြုသူအမည်နှင့် စကားဝှက်ကို မည်သူ့ကိုမျှ မျှဝေခြင်းမပြုပါနှင့်။ လုံခြုံရေးအကြောင်းပြချက်များအရ သင့်အကောင့်အထောက်အထားများကို လျှို့ဝှက်ထားပြီး သင်ကိုယ်တိုင်သာ အသုံးပြုပါ။' 
            : 'Security Notice - Do not share your username and password with anyone. For security reasons, keep your account credentials confidential and use them only by yourself.'}
        </p>
      </div>

      {/* History Modal */}
      {showHistoryModal && (
        <div className="shop-account-modal-overlay">
          <div className="shop-account-modal-content" style={{ maxWidth: '800px' }}>
            <div className="shop-account-modal-header">
              <h3><i className="fas fa-history"></i> {language === 'mm' ? 'အကောင့်လှုပ်ရှားမှုမှတ်တမ်း' : 'Account Activity History'}</h3>
              <button className="shop-account-modal-close" onClick={() => setShowHistoryModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="shop-account-modal-body">
              {/* Stats Summary */}
              {!historyLoading && !historyError && accountHistory.length > 0 && (
                <div className="shop-account-history-stats">
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
                      <span className="stat-value-final">{totalItems}</span>
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
                                    <span>{language === 'mm' ? 'IP' : 'IP'}: {item.ipAddress}</span>
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
                      
                      <span className="shop-account-page-info">
                        {language === 'mm' ? 'စာမျက်နှာ' : 'Page'} {currentPage} {language === 'mm' ? '၏' : 'of'} {totalPages}
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
                      <span>
                        {language === 'mm' ? 'ပြသခြင်း' : 'Showing'} {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, totalItems)} {language === 'mm' ? '၏' : 'of'} {totalItems} {language === 'mm' ? 'ခု' : 'activities'}
                      </span>
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

      {/* Edit Account Info Modal */}
      {showEditInfoModal && (
        <div className="shop-account-modal-overlay">
          <div className="shop-account-modal-content" style={{ maxWidth: '600px' }}>
            <div className="shop-account-modal-header">
              <h3><i className="fas fa-user-edit"></i> {language === 'mm' ? 'အကောင့်အချက်အလက် ပြင်ဆင်ရန်' : 'Edit Account Information'}</h3>
              <button className="shop-account-modal-close" onClick={() => setShowEditInfoModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="shop-account-modal-body">
              <div className="edit-info-form">
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'လက်ရှိစကားဝှက် (အတည်ပြုရန်)' : 'Current Password (for verification)'}</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    value={editForm.currentPassword} 
                    onChange={handleEditFormChange} 
                    placeholder={language === 'mm' ? 'အတည်ပြုရန် လက်ရှိစကားဝှက်ထည့်ပါ' : 'Enter your current password to verify'}
                  />
                  <div className="form-help-text">
                    <i className="fas fa-info-circle"></i> {language === 'mm' ? 'ပြောင်းလဲမှုပြုလုပ်ရန် သင့်လက်ရှိစကားဝှက် လိုအပ်ပါသည်' : 'Your current password is required to make changes'}
                  </div>
                </div>
                
                <div className="form-section-divider">
                  <span>{language === 'mm' ? 'အကောင့်အချက်အလက်' : 'Account Information'}</span>
                </div>
                
                <div className="shop-account-form-row">
                  <div className="shop-account-form-group">
                    <label className="shop-account-required">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                    <input 
                      type="text" 
                      name="username" 
                      value={editForm.username} 
                      onChange={handleEditFormChange} 
                      placeholder={language === 'mm' ? 'အသုံးပြုသူအမည်ထည့်ပါ' : 'Enter username'}
                    />
                  </div>
                  <div className="shop-account-form-group">
                    <label>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                    <input 
                      type="text" 
                      name="fullName" 
                      value={editForm.fullName} 
                      onChange={handleEditFormChange} 
                      placeholder={language === 'mm' ? 'အမည်အပြည့်အစုံထည့်ပါ' : 'Enter full name'}
                    />
                  </div>
                </div>
                
                <div className="shop-account-form-row">
                  <div className="shop-account-form-group">
                    <label className="shop-account-required">{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                    <input 
                      type="email" 
                      name="email" 
                      value={editForm.email} 
                      onChange={handleEditFormChange} 
                      placeholder={language === 'mm' ? 'အီးမေးလ်လိပ်စာထည့်ပါ' : 'Enter email address'}
                    />
                  </div>
                  <div className="shop-account-form-group">
                    <label>{language === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone Number'}</label>
                    <input 
                      type="tel" 
                      name="phone" 
                      value={editForm.phone} 
                      onChange={handleEditFormChange} 
                      placeholder={language === 'mm' ? 'ဖုန်းနံပါတ်ထည့်ပါ' : 'Enter phone number'}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="shop-account-modal-footer">
              <button className="shop-account-btn-cancel" onClick={() => setShowEditInfoModal(false)}>{language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}</button>
              <button 
                className="shop-account-btn-submit" 
                onClick={handleUpdateAccountInfo}
                disabled={!editForm.currentPassword || !editForm.username || !editForm.email}
              >
                <i className="fas fa-save"></i> {language === 'mm' ? 'အချက်အလက် မွမ်းမံရန်' : 'Update Information'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="shop-account-modal-overlay">
          <div className="shop-account-modal-content" style={{ maxWidth: '500px' }}>
            <div className="shop-account-modal-header">
              <h3><i className="fas fa-key"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}</h3>
              <button className="shop-account-modal-close" onClick={() => setShowChangePasswordModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="shop-account-modal-body">
              <div className="change-password-form">
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                  <input type="text" value={superAdminAccount.username || ""} disabled className="disabled-input" />
                </div>
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'စကားဝှက်ဟောင်း' : 'Old Password'}</label>
                  <input 
                    type="password" 
                    name="oldPassword" 
                    value={passwordForm.oldPassword} 
                    onChange={handlePasswordFormChange} 
                    placeholder={language === 'mm' ? 'လက်ရှိစကားဝှက်ထည့်ပါ' : 'Enter current password'} 
                  />
                </div>
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'စကားဝှက်အသစ်' : 'New Password'}</label>
                  <input 
                    type="password" 
                    name="newPassword" 
                    value={passwordForm.newPassword} 
                    onChange={handlePasswordFormChange} 
                    placeholder={language === 'mm' ? 'စကားဝှက်အသစ်ထည့်ပါ' : 'Enter new password'} 
                  />
                </div>
                <div className="shop-account-form-group">
                  <label className="shop-account-required">{language === 'mm' ? 'စကားဝှက်အတည်ပြုရန်' : 'Confirm Password'}</label>
                  <input 
                    type="password" 
                    name="confirmPassword" 
                    value={passwordForm.confirmPassword} 
                    onChange={handlePasswordFormChange} 
                    placeholder={language === 'mm' ? 'စကားဝှက်အသစ်အတည်ပြုရန်' : 'Confirm new password'} 
                  />
                </div>
                <div className="forget-password-link" onClick={() => alert(language === 'mm' ? 'စကားဝှက်ပြန်လည်သတ်မှတ်ရန် စာမျက်နှာသို့ ပြောင်းရွှေ့နေသည်...' : 'Redirecting to password reset page...')}>
                  <i className="fas fa-question-circle"></i> <span>{language === 'mm' ? 'စကားဝှက်မေ့နေပါသလား?' : 'Forget Password?'}</span>
                </div>
              </div>
            </div>
            <div className="shop-account-modal-footer">
              <button className="shop-account-btn-cancel" onClick={() => setShowChangePasswordModal(false)}>{language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}</button>
              <button 
                className="shop-account-btn-submit" 
                onClick={handleChangePassword}
                disabled={!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              >
                <i className="fas fa-save"></i> {language === 'mm' ? 'စကားဝှက်ပြောင်းရန်' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerAccountPage;