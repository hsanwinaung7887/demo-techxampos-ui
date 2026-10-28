import { useState, useEffect, useMemo, useRef } from "react";
import "../../shared-style/user-css/UserSettingPage.css";
import { useSelector } from 'react-redux';
import { getApiBaseUrl } from '../utils/defineConfig';

const API_BASE_URL = getApiBaseUrl();

// Helper function to format bytes
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getBestUnit = (bytes) => {
  if (bytes === 0) return { value: 0, unit: 'Bytes', originalBytes: 0 };
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  let i = 0;
  let value = bytes;
  while (value >= k && i < sizes.length - 1) {
    value /= k;
    i++;
  }
  return {
    value: parseFloat(value.toFixed(2)),
    unit: sizes[i],
    originalBytes: bytes
  };
};

const paperSizeOptions = [
  { value: "58mm", label: "58mm", width: 58, description: "Small (Coffee Shop, Fast Food)" },
  { value: "76mm", label: "76mm", width: 76, description: "Standard (Retail Stores)" },
  { value: "80mm", label: "80mm", width: 80, description: "Most Common (Supermarkets)" },
  { value: "82mm", label: "82mm", width: 82, description: "Wide Format" },
  { value: "112mm", label: "112mm", width: 112, description: "Extra Wide (Restaurants)" }
];

const UserSettingPage = () => {
  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const qrFileInputRef = useRef(null);

  const currentUser = useMemo(() => {
    if (reduxUser && isAuthenticated) {
      return {
        id: reduxUser.id,
        name: reduxUser.fullName || reduxUser.username,
        username: reduxUser.username,
        role: reduxUser.role,
        branchId: reduxUser.branchId || reduxUser.branch_id,
        shopId: reduxUser.shopId || reduxUser.shop_id,
      };
    }
    return null;
  }, [reduxUser?.id, reduxUser?.branchId, isAuthenticated]);

  const [language, setLanguage] = useState(localStorage.getItem("appLanguage") || "mm");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [branchInfo, setBranchInfo] = useState(null);
  const [planInfo, setPlanInfo] = useState(null);
  const [storageUsage, setStorageUsage] = useState(null);

  // ===== Voucher Setting States =====
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherSetting, setVoucherSetting] = useState({
    shopName: '',
    phone: '',
    address: '',
    note1: '',
    note2: '',
    paperSize: '80mm',
    logoImageUrl: '',      // ========== NEW ==========
    qrCodeImageUrl: ''     // ========== NEW ==========
  });
  const [voucherLoading, setVoucherLoading] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingQr, setUploadingQr] = useState(false);

  const [storageData, setStorageData] = useState({
    usedBytes: 0,
    usedFormatted: "0 Bytes",
    usedValue: 0,
    usedUnit: "Bytes",
    freeBytes: 0,
    freeFormatted: "0 Bytes",
    totalBytes: 0,
    totalFormatted: "0 Bytes",
    percentage: 0
  });

  const softwareInfo = {
    name: "EasyPOS",
    version: "1.0.0",
    developedBy: "TechXam Software Solutions",
    country: "Myanmar",
    licenseType: "Commercial License",
    website: "www.techxam.com",
    releaseDate: "2026-2-26",
    supportedOs: "Cross-Platform Browser Based"
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const fetchWithRetry = async (url, retries = 3) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, {
          method: 'GET',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' }
        });
        if (response.ok) {
          return await response.json();
        }
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch {
          throw new Error(`HTTP ${response.status}: ${text.substring(0, 100)}`);
        }
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const fetchBranchInfo = async () => {
    try {
      const data = await fetchWithRetry(`${API_BASE_URL}/user/setting/branch/info`);
      if (data.success && data.data) {
        setBranchInfo(data.data);
      }
    } catch (error) {
      console.error('Branch fetch error:', error);
    }
  };

  const fetchPlanInfo = async () => {
    try {
      const data = await fetchWithRetry(`${API_BASE_URL}/user/setting/plan/current`);
      if (data.success && data.data) {
        setPlanInfo(data.data);
        return data.data;
      }
    } catch (error) {
      console.error('Plan fetch error:', error);
    }
    return null;
  };

  const fetchVoucherSetting = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/user/setting/voucher`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();
      if (data.success && data.data) {
        setVoucherSetting({
          shopName: data.data.shopName || '',
          phone: data.data.phone || '',
          address: data.data.address || '',
          note1: data.data.note1 || '',
          note2: data.data.note2 || '',
          paperSize: data.data.paperSize || '80mm',
          logoImageUrl: data.data.logoImageUrl || '',
          qrCodeImageUrl: data.data.qrCodeImageUrl || ''
        });
      } else {
        clearVoucherForm();
      }
    } catch (error) {
      console.error('Fetch voucher setting error:', error);
      clearVoucherForm();
    }
  };

  const clearVoucherForm = () => {
    setVoucherSetting({
      shopName: '',
      phone: '',
      address: '',
      note1: '',
      note2: '',
      paperSize: '80mm',
      logoImageUrl: '',
      qrCodeImageUrl: ''
    });
  };

  const fetchStorageUsage = async (planData) => {
    try {
      const data = await fetchWithRetry(`${API_BASE_URL}/user/setting/storage/usage`);
      if (data.success && data.data) {
        setStorageUsage(data.data);
        const usedBytes = data.data.totalBytes || 0;
        const totalGB = planData?.storageGb || 15;
        const totalBytes = totalGB * 1024 * 1024 * 1024;
        const freeBytes = Math.max(0, totalBytes - usedBytes);
        const percentage = totalBytes > 0 ? Math.min(100, Math.round((usedBytes / totalBytes) * 100)) : 0;
        const usedFormatted = getBestUnit(usedBytes);
        const freeFormatted = getBestUnit(freeBytes);
        const totalFormatted = getBestUnit(totalBytes);
        
        setStorageData({
          usedBytes: usedBytes,
          usedFormatted: `${usedFormatted.value} ${usedFormatted.unit}`,
          usedValue: usedFormatted.value,
          usedUnit: usedFormatted.unit,
          freeBytes: freeBytes,
          freeFormatted: `${freeFormatted.value} ${freeFormatted.unit}`,
          freeValue: freeFormatted.value,
          freeUnit: freeFormatted.unit,
          totalBytes: totalBytes,
          totalFormatted: `${totalFormatted.value} ${totalFormatted.unit}`,
          totalValue: totalFormatted.value,
          totalUnit: totalFormatted.unit,
          percentage: percentage
        });
      }
    } catch (error) {
      console.error('Storage usage fetch error:', error);
    }
  };

  // ===== Upload Logo =====
  const handleUploadLogo = async (file) => {
    if (!file) return;
    setUploadingLogo(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/setting/voucher/upload-logo`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setVoucherSetting(prev => ({
          ...prev,
          logoImageUrl: data.data.logoImageUrl
        }));
        showNotification(
          language === 'mm' ? 'Logo တင်ခြင်း အောင်မြင်ပါသည်။' : 'Logo uploaded successfully!',
          'success'
        );
      } else {
        showNotification(data.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload logo error:', error);
      showNotification(
        language === 'mm' ? 'Logo တင်ခြင်း မအောင်မြင်ပါ' : 'Failed to upload logo',
        'error'
      );
    } finally {
      setUploadingLogo(false);
    }
  };

  // ===== Upload QR Code =====
  const handleUploadQrCode = async (file) => {
    if (!file) return;
    setUploadingQr(true);
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/setting/voucher/upload-qrcode`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });
      
      const data = await response.json();
      if (data.success) {
        setVoucherSetting(prev => ({
          ...prev,
          qrCodeImageUrl: data.data.qrCodeImageUrl
        }));
        showNotification(
          language === 'mm' ? 'QR Code တင်ခြင်း အောင်မြင်ပါသည်။' : 'QR Code uploaded successfully!',
          'success'
        );
      } else {
        showNotification(data.message || 'Upload failed', 'error');
      }
    } catch (error) {
      console.error('Upload QR Code error:', error);
      showNotification(
        language === 'mm' ? 'QR Code တင်ခြင်း မအောင်မြင်ပါ' : 'Failed to upload QR Code',
        'error'
      );
    } finally {
      setUploadingQr(false);
    }
  };

  // ===== Delete Logo =====
  const handleDeleteLogo = async () => {
    if (!voucherSetting.logoImageUrl) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/setting/voucher/delete-logo`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setVoucherSetting(prev => ({
          ...prev,
          logoImageUrl: ''
        }));
        showNotification(
          language === 'mm' ? 'Logo ဖျက်ခြင်း အောင်မြင်ပါသည်။' : 'Logo deleted successfully!',
          'success'
        );
      }
    } catch (error) {
      console.error('Delete logo error:', error);
      showNotification('Failed to delete logo', 'error');
    }
  };

  // ===== Delete QR Code =====
  const handleDeleteQrCode = async () => {
    if (!voucherSetting.qrCodeImageUrl) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/setting/voucher/delete-qrcode`, {
        method: 'DELETE',
        credentials: 'include'
      });
      
      const data = await response.json();
      if (data.success) {
        setVoucherSetting(prev => ({
          ...prev,
          qrCodeImageUrl: ''
        }));
        showNotification(
          language === 'mm' ? 'QR Code ဖျက်ခြင်း အောင်မြင်ပါသည်။' : 'QR Code deleted successfully!',
          'success'
        );
      }
    } catch (error) {
      console.error('Delete QR Code error:', error);
      showNotification('Failed to delete QR Code', 'error');
    }
  };

  // ===== Save Voucher Setting =====
  const handleSaveVoucherSetting = async () => {
    setVoucherLoading(true);
    
    try {
      const response = await fetch(`${API_BASE_URL}/user/setting/voucher`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(voucherSetting)
      });
      
      const data = await response.json();
      
      if (data.success) {
        showNotification(
          language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!',
          'success'
        );
        
        // Fetch latest data after save
        await fetchVoucherSetting();
        
        setTimeout(() => {
          setShowVoucherModal(false);
        }, 1500);
      } else {
        showNotification(
          data.message || (language === 'mm' ? 'သိမ်းဆည်းမှု မအောင်မြင်ပါ' : 'Failed to save'),
          'error'
        );
      }
    } catch (error) {
      console.error('Save voucher setting error:', error);
      showNotification(
        language === 'mm' ? 'ဆာဗာသို့ ချိတ်ဆက်၍မရပါ' : 'Cannot connect to server',
        'error'
      );
    } finally {
      setVoucherLoading(false);
    }
  };

  const handleOpenVoucherModal = async () => {
    setShowVoucherModal(true);
    setVoucherLoading(true);
    try {
      await fetchVoucherSetting();
    } finally {
      setVoucherLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        await fetchBranchInfo();
        const planData = await fetchPlanInfo();
        await fetchStorageUsage(planData);
        await fetchVoucherSetting();
      } catch (error) {
        console.error('Load data error:', error);
        setError("Failed to load data. Please check if server is running.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  useEffect(() => {
    const handleLanguageChange = (event) => {
      setLanguage(event.detail.language);
    };
    window.addEventListener('appLanguageChanged', handleLanguageChange);
    return () => window.removeEventListener('appLanguageChanged', handleLanguageChange);
  }, []);

  const getStorageColor = (percentage) => 
    percentage >= 80 ? "#ff4757" : percentage >= 60 ? "#ffa502" : "#2ed573";

  if (error) {
    return (
      <div className="software-info-page">
        <div className="error-container" style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          textAlign: "center",
          padding: "20px"
        }}>
          <i className="fas fa-exclamation-triangle" style={{ fontSize: "48px", color: "#ff4757", marginBottom: "20px" }}></i>
          <h2 style={{ color: "#ff4757", marginBottom: "10px" }}>
            {language === "mm" ? "ချိတ်ဆက်မှု ပြဿနာ" : "Connection Error"}
          </h2>
          <p style={{ color: "#666", marginBottom: "20px" }}>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{
              padding: "10px 20px",
              backgroundColor: "#4361ee",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            <i className="fas fa-sync-alt"></i> {language === "mm" ? "ပြန်စမ်းမည်" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="software-info-page">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{language === "mm" ? "ဒေတာများ ရယူနေသည်..." : "Loading data..."}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="software-info-page">
      {notification.show && (
        <div className={`voucher-notification ${notification.type}`}>
          <i className={`fas ${notification.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="page-header">
        <h1>
          <i className="fas fa-info-circle"></i>
          {language === "mm" ? "ဆော့ဝဲလ်အချက်အလက်" : "Software Information"}
        </h1>
      </div>

      <div className="software-container">
        <div className="software-card">
          {/* Header - same as before */}
          <div className="software-header-row">
            <div className="software-title-section">
              <div className="software-icon">
                <h3>EP</h3>
              </div>
              <div className="software-title-info">
                <h2>{softwareInfo.name}</h2>
                <p className="software-version">
                  <i className="fas fa-tag"></i>
                  {language === "mm" ? "ဗားရှင်း" : "Version"} {softwareInfo.version}
                </p>
              </div>
            </div>
            <div className="software-title-info">
              <div className="plan-badge-premium">
                <i className="fas fa-crown"></i>
                <span>{planInfo?.planName || "Premium"}</span>
              </div>
              <p className="branch-name">
                <i className="fas fa-store"></i> {branchInfo?.branchName || "Loading..."}
              </p>
            </div>
          </div>

          <div className="two-card">
            {/* System Specifications - same as before */}
            <div className="spec-section">
              <h3>
                <i className="fas fa-microchip"></i>
                {language === "mm" ? "စနစ်သတ်မှတ်ချက်များ" : "System Specifications"}
              </h3>
              <div className="spec-grid">
                <div className="spec-item storage-item">
                  <i className="fas fa-database"></i>
                  <div className="spec-content">
                    <div className="storage-info">
                      <span className="spec-label">
                        {language === "mm" ? "သိုလှောင်မှု" : "Storage"}
                      </span>
                      <div className="storage-stats">
                        <span className="storage-value">
                          {storageData.usedFormatted} / {storageData.totalFormatted}
                        </span>
                        <span className="storage-percentage" style={{ color: getStorageColor(storageData.percentage) }}>
                          {storageData.percentage}% {language === "mm" ? "အသုံးပြုပြီး" : "used"}
                        </span>
                      </div>
                    </div>
                    <div className="storage-bar-container">
                      <div className="storage-bar" style={{ 
                        width: `${storageData.percentage}%`,
                        backgroundColor: getStorageColor(storageData.percentage)
                      }}></div>
                    </div>
                    <div className="storage-details">
                      <span className="storage-used">
                        <i className="fas fa-database"></i>
                        {language === "mm" ? "အသုံးပြုထား" : "Used"}: {storageData.usedFormatted}
                      </span>
                      <span className="storage-free">
                        <i className="fas fa-chart-line"></i>
                        {language === "mm" ? "လွတ်လပ်" : "Free"}: {storageData.freeFormatted}
                      </span>
                    </div>
                    {storageData.percentage >= 80 && (
                      <div className="storage-warning" style={{
                        marginTop: "12px",
                        padding: "8px 12px",
                        backgroundColor: storageData.percentage >= 90 ? "#fff3cd" : "#fff8e7",
                        borderRadius: "6px",
                        fontSize: "12px",
                        color: "#856404",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px"
                      }}>
                        <i className="fas fa-exclamation-triangle"></i>
                        <span>
                          {storageData.percentage >= 90 
                            ? (language === "mm" ? "⚠️ သိုလှောင်မှုနေရာ လုံလောက်တော့မည်မဟုတ်ပါ။" : "⚠️ Storage is almost full.")
                            : (language === "mm" ? "⚠️ သိုလှောင်မှုနေရာ 80% ကျော်သွားပါပြီ။" : "⚠️ Storage usage exceeded 80%.")
                          }
                        </span>
                      </div>
                    )}
                    {storageUsage && (
                      <details style={{ marginTop: "12px" }}>
                        <summary style={{ 
                          fontSize: "12px", 
                          cursor: "pointer", 
                          color: "#666",
                          padding: "4px 0"
                        }}>
                          <i className="fas fa-chart-bar"></i> 
                          {language === "mm" ? "အသေးစိတ် အချက်အလက်" : "Detailed Breakdown"}
                        </summary>
                        <div style={{ 
                          marginTop: "8px", 
                          fontSize: "11px", 
                          maxHeight: "200px", 
                          overflowY: "auto",
                          borderTop: "1px solid #eee",
                          paddingTop: "8px"
                        }}>
                          {storageUsage.tables && Object.entries(storageUsage.tables).map(([tableName, data]) => {
                            const bytes = data.bytes;
                            const formatted = formatBytes(bytes);
                            return (
                              <div key={tableName} style={{ 
                                display: "flex", 
                                justifyContent: "space-between",
                                padding: "4px 0",
                                borderBottom: "1px solid #f0f0f0"
                              }}>
                                <span style={{ color: "#666" }}>{tableName.replace(/_/g, " ")}</span>
                                <span>
                                  {data.rows?.toLocaleString()} rows 
                                  <span style={{ color: "#999", marginLeft: "8px" }}>
                                    ({formatted})
                                  </span>
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
                <div className="spec-item">
                  <i className="fas fa-chart-line"></i>
                  <div className="spec-content">
                    <span className="spec-label">
                      {language === "mm" ? "အဆင့်" : "Plan Level"}
                    </span>
                    <span className="spec-value">{planInfo?.level || "Premium"}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <i className="fas fa-calendar-alt"></i>
                  <div className="spec-content">
                    <span className="spec-label">
                      {language === "mm" ? "ငွေပေးချေမှု" : "Billing Cycle"}
                    </span>
                    <span className="spec-value">{planInfo?.billingCycle || "Monthly"}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <i className="fas fa-users"></i>
                  <div className="spec-content">
                    <span className="spec-label">
                      {language === "mm" ? "အကောင့် သုံးစွဲနိုင်မှု" : "Max Users"}
                    </span>
                    <span className="spec-value">{planInfo?.maxUsers || 5}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <i className="fas fa-cube"></i>
                  <div className="spec-content">
                    <span className="spec-label">
                      {language === "mm" ? "ပစ္စည်း အများဆုံး" : "Max Products"}
                    </span>
                    <span className="spec-value">{planInfo?.maxProducts?.toLocaleString() || "6,000"}</span>
                  </div>
                </div>
                <div className="spec-item">
                  <i className="fas fa-server"></i>
                  <div className="spec-content">
                    <span className="spec-label">
                      {language === "mm" ? "ဒေတာဘေ့စ်" : "Database"}
                    </span>
                    <span className="spec-value">PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Software Details - same as before */}
            <div className="info-section">
              <h3>
                <i className="fas fa-info-circle"></i>
                {language === "mm" ? "ဆော့ဝဲလ်အသေးစိတ်" : "Software Details"}
              </h3>
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-content">
                    <span className="info-label">
                      {language === "mm" ? "ဖန်တီးသူ" : "Developed By"}
                    </span>
                    <span className="info-value1">{softwareInfo.developedBy}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <span className="info-label">
                      {language === "mm" ? "နိုင်ငံ" : "Country"}
                    </span>
                    <span className="info-value1">{softwareInfo.country}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <span className="info-label">
                      {language === "mm" ? "လိုင်စင်အမျိုးအစား" : "License Type"}
                    </span>
                    <span className="info-value license">
                      <i className="fas fa-certificate"></i>
                      {softwareInfo.licenseType}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <span className="info-label">
                      {language === "mm" ? "ဝဘ်ဆိုဒ်" : "Website"}
                    </span>
                    <span className="info-value website">
                      <i className="fas fa-globe"></i>
                      {softwareInfo.website}
                    </span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <span className="info-label">
                      {language === "mm" ? "ထုတ်ပြန်ရက်" : "Release Date"}
                    </span>
                    <span className="info-value1">{softwareInfo.releaseDate}</span>
                  </div>
                </div>
                <div className="info-item">
                  <div className="info-content">
                    <span className="info-label">
                      {language === "mm" ? "ပလက်ဖောင်း" : "Platform"}
                    </span>
                    <span className="info-value1">{softwareInfo.supportedOs}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Voucher Button - same as before */}
          <div className="voucher-button-wrapper">
            <button 
              className="voucher-glam-btn"
              onClick={handleOpenVoucherModal}
            >
              <div className="voucher-glam-btn-glow"></div>
              <div className="voucher-glam-btn-content">
                <i className="fas fa-receipt"></i>
                <span>{language === "mm" ? "Voucher ပြင်ဆင်ရန်" : "Voucher Settings"}</span>
                <i className="fas fa-chevron-right"></i>
              </div>
            </button>
          </div>

          <div className="footer-section">
            <p>
              <i className="far fa-copyright"></i>
              {new Date().getFullYear()} {softwareInfo.developedBy}. {
                language === "mm" ? "အခွင့်အရေးအားလုံးကို ချုပ်ကိုင်ထားသည်" : "All rights reserved"
              }
            </p>
            <p className="copyright-note">
              <i className="fas fa-exclamation-triangle"></i>
              {language === "mm" 
                ? "ဤဆော့ဝဲလ်ကို စီးပွားဖြစ်အသုံးပြုရန်အတွက်သာ လိုင်စင်ရရှိထားသည်" 
                : "This software is licensed for commercial use only"
              }
            </p>
          </div>
        </div>
      </div>

      {/* ===== VOUCHER SETTING MODAL with Image Upload ===== */}
      {showVoucherModal && (
        <div className="voucher-modal-overlay" onClick={() => !voucherLoading && setShowVoucherModal(false)}>
          <div className="voucher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="voucher-modal-header">
              <h3>
                <i className="fas fa-receipt"></i>
                {language === "mm" ? "Voucher ပြင်ဆင်ချက်များ" : "Voucher Settings"}
              </h3>
              <button className="voucher-modal-close" onClick={() => !voucherLoading && setShowVoucherModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="voucher-modal-body">
              <div className="voucher-info-text">
                <i className="fas fa-info-circle"></i>
                {language === "mm" 
                  ? "အောက်ပါအချက်အလက်များကို ဖြည့်သွင်းပါ။ သိမ်းဆည်းပြီးပါက Voucher ပေါ်တွင် ပြသပါမည်။" 
                  : "Fill in the information below. It will appear on the voucher after saving."}
              </div>
              
              {/* ===== LOGO IMAGE UPLOAD ===== */}
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-image"></i>
                  {language === "mm" ? "ဆိုင် Logo" : "Shop Logo"}
                </label>
                <div className="image-upload-container">
                  <div className="image-preview-wrapper">
                    {voucherSetting.logoImageUrl ? (
                      <div className="image-preview">
                        <img src={voucherSetting.logoImageUrl} alt="Logo" />
                        <button 
                          className="image-remove-btn"
                          onClick={handleDeleteLogo}
                          disabled={voucherLoading}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="image-placeholder">
                        <i className="fas fa-store"></i>
                        <span>{language === "mm" ? "Logo မရှိသေးပါ" : "No logo"}</span>
                      </div>
                    )}
                  </div>
                  <div className="image-upload-actions">
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleUploadLogo(e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      className="image-upload-btn"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={voucherLoading || uploadingLogo}
                    >
                      {uploadingLogo ? (
                        <><i className="fas fa-spinner fa-spin"></i> {language === "mm" ? "တင်နေသည်..." : "Uploading..."}</>
                      ) : (
                        <><i className="fas fa-upload"></i> {language === "mm" ? "Logo တင်ရန်" : "Upload Logo"}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== QR CODE IMAGE UPLOAD ===== */}
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-qrcode"></i>
                  {language === "mm" ? "QR Code" : "QR Code"}
                </label>
                <div className="image-upload-container">
                  <div className="image-preview-wrapper">
                    {voucherSetting.qrCodeImageUrl ? (
                      <div className="image-preview qr-preview">
                        <img src={voucherSetting.qrCodeImageUrl} alt="QR Code" />
                        <button 
                          className="image-remove-btn"
                          onClick={handleDeleteQrCode}
                          disabled={voucherLoading}
                        >
                          <i className="fas fa-times"></i>
                        </button>
                      </div>
                    ) : (
                      <div className="image-placeholder qr-placeholder">
                        <i className="fas fa-qrcode"></i>
                        <span>{language === "mm" ? "QR Code မရှိသေးပါ" : "No QR Code"}</span>
                      </div>
                    )}
                  </div>
                  <div className="image-upload-actions">
                    <input
                      type="file"
                      ref={qrFileInputRef}
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleUploadQrCode(e.target.files[0]);
                        }
                        e.target.value = '';
                      }}
                      accept="image/*"
                      style={{ display: 'none' }}
                    />
                    <button
                      className="image-upload-btn"
                      onClick={() => qrFileInputRef.current?.click()}
                      disabled={voucherLoading || uploadingQr}
                    >
                      {uploadingQr ? (
                        <><i className="fas fa-spinner fa-spin"></i> {language === "mm" ? "တင်နေသည်..." : "Uploading..."}</>
                      ) : (
                        <><i className="fas fa-upload"></i> {language === "mm" ? "QR Code တင်ရန်" : "Upload QR"}</>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-store"></i>
                  {language === "mm" ? "ဆိုင်အမည်" : "Shop Name"}
                </label>
                <input
                  type="text"
                  value={voucherSetting.shopName}
                  onChange={(e) => setVoucherSetting({...voucherSetting, shopName: e.target.value})}
                  placeholder={language === "mm" ? "ဆိုင်အမည် ထည့်ပါ" : "Enter shop name"}
                  disabled={voucherLoading}
                />
              </div>
              
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-phone-alt"></i>
                  {language === "mm" ? "ဖုန်းနံပါတ်" : "Phone Number"}
                </label>
                <input
                  type="tel"
                  value={voucherSetting.phone}
                  onChange={(e) => setVoucherSetting({...voucherSetting, phone: e.target.value})}
                  placeholder={language === "mm" ? "ဖုန်းနံပါတ် ထည့်ပါ" : "Enter phone number"}
                  disabled={voucherLoading}
                />
              </div>
              
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-map-marker-alt"></i>
                  {language === "mm" ? "လိပ်စာ" : "Address"}
                </label>
                <textarea
                  value={voucherSetting.address}
                  onChange={(e) => setVoucherSetting({...voucherSetting, address: e.target.value})}
                  placeholder={language === "mm" ? "လိပ်စာ ထည့်ပါ" : "Enter address"}
                  rows="3"
                  disabled={voucherLoading}
                />
              </div>
              
              {/* ===== PAPER SIZE SELECTION ===== */}
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-print"></i>
                  {language === "mm" ? "Voucher စက္ကူအရွယ်အစား" : "Voucher Paper Size"}
                </label>
                <div className="paper-size-selector">
                  {paperSizeOptions.map(option => (
                    <div
                      key={option.value}
                      className={`paper-size-option ${voucherSetting.paperSize === option.value ? 'selected' : ''}`}
                      onClick={() => !voucherLoading && setVoucherSetting({...voucherSetting, paperSize: option.value})}
                    >
                      <div className="paper-size-preview" style={{ width: `${option.width / 2}px` }}>
                        <div className="paper-size-preview-inner">
                          <i className="fas fa-receipt"></i>
                        </div>
                      </div>
                      <div className="paper-size-info">
                        <span className="paper-size-label">{option.label}</span>
                        <span className="paper-size-desc">
                          {language === "mm" ? option.description : option.description}
                        </span>
                      </div>
                      {voucherSetting.paperSize === option.value && (
                        <i className="fas fa-check-circle paper-size-check"></i>
                      )}
                    </div>
                  ))}
                </div>
                <div className="paper-size-hint">
                  <i className="fas fa-info-circle"></i>
                  {language === "mm" 
                    ? "သင့် POS ပရင်တာနှင့် ကိုက်ညီသော စက္ကူအရွယ်အစားကို ရွေးချယ်ပါ။ အများဆုံးအသုံးပြုသောအရွယ်မှာ 80mm ဖြစ်ပါသည်။"
                    : "Select the paper size that matches your POS printer. 80mm is the most common size."}
                </div>
              </div>
              
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-pen-alt"></i>
                  {language === "mm" ? "မှတ်ချက် (၁)" : "Note 1"}
                </label>
                <input
                  type="text"
                  value={voucherSetting.note1}
                  onChange={(e) => setVoucherSetting({...voucherSetting, note1: e.target.value})}
                  placeholder={language === "mm" ? "မှတ်ချက် (ဥပမာ - ကျေးဇူးတင်ပါသည်)" : "Note (e.g., Thank you)"}
                  disabled={voucherLoading}
                />
              </div>
              
              <div className="voucher-form-group">
                <label>
                  <i className="fas fa-pen-alt"></i>
                  {language === "mm" ? "မှတ်ချက် (၂)" : "Note 2"}
                </label>
                <input
                  type="text"
                  value={voucherSetting.note2}
                  onChange={(e) => setVoucherSetting({...voucherSetting, note2: e.target.value})}
                  placeholder={language === "mm" ? "မှတ်ချက် (ဥပမာ - ပြန်လည်လဲလှယ်ခွင့်မရှိပါ)" : "Note (e.g., No exchange)"}
                  disabled={voucherLoading}
                />
              </div>
            </div>
            
            <div className="voucher-modal-footer">
              <button 
                className="voucher-btn-cancel" 
                onClick={() => {
                  clearVoucherForm();
                  setShowVoucherModal(false);
                }}
                disabled={voucherLoading}
              >
                {language === "mm" ? "မလုပ်တော့ပါ" : "Cancel"}
              </button>
              <button 
                className="voucher-btn-save" 
                onClick={handleSaveVoucherSetting}
                disabled={voucherLoading}
              >
                {voucherLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {language === "mm" ? "သိမ်းဆည်းနေသည်..." : "Saving..."}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    {language === "mm" ? "သိမ်းဆည်းမည်" : "Save"}
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

export default UserSettingPage;