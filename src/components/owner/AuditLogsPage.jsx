// export default AuditLogsPage;
import React, { useState, useEffect, useReducer, useCallback, useRef, useMemo } from 'react';
import { NavLink } from 'react-router-dom';
import { auditLogApi } from '../apis/auditLogApi';
import { blacklistApi } from '../apis/blacklistApi';
import { trustedDeviceApi } from '../apis/trustedDeviceApi';
import { auditHistoryApi } from '../apis/auditHistoryApi';
import { initialAuditLogState, auditLogReducer, auditLogActions } from '../owner-useReducer/auditLogReducer';
import { initialAuditHistoryState, auditHistoryReducer } from '../owner-useReducer/auditHistoryReducer';
import "../../light-style/owner-css/auditLogsPage.css";

const AuditLogsPage = () => {
  // ===== Language State =====
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('officeLanguage') || 'en';
  });

  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'officeLanguage') setLanguage(e.newValue || 'en');
    };
    const handleLanguageEvent = () => {
      setLanguage(localStorage.getItem('officeLanguage') || 'en');
    };
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChange', handleLanguageEvent);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChange', handleLanguageEvent);
    };
  }, []);

  const [state, dispatch] = useReducer(auditLogReducer, initialAuditLogState);
  const isInitialMount = useRef(true);
  const filterTimeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);
  const [selectedActionFilter, setSelectedActionFilter] = useState('all');

  const {
    auditLogs,
    filteredLogs,
    selectedLog,
    pagination,
    filters,
    statistics,
    loading,
    tableLoading,
    error,
    success,
    realTimeMode,
    autoRefresh
  } = state;
  
  // ===== History State =====
  const [historyState, historyDispatch] = useReducer(auditHistoryReducer, initialAuditHistoryState);
  const [showHistoryTab, setShowHistoryTab] = useState(false);
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [historyLoadingDirection, setHistoryLoadingDirection] = useState(null);
  const historyPageChangeTimeoutRef = useRef(null);
  const historyContainerRef = useRef(null);
  const [showHistoryPicker, setShowHistoryPicker] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // ===== Blacklist States =====
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [showBlacklistTable, setShowBlacklistTable] = useState(false);
  const [showWhitelistTable, setShowWhitelistTable] = useState(false);
  const [blacklistData, setBlacklistData] = useState([]);
  const [whitelistData, setWhitelistData] = useState([]);
  const [trustedDevices, setTrustedDevices] = useState([]);
  const [blacklistLoading, setBlacklistLoading] = useState(false);
  const [whitelistLoading, setWhitelistLoading] = useState(false);
  const [trustedDevicesLoading, setTrustedDevicesLoading] = useState(false);
  const [blacklistPagination, setBlacklistPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1
  });
  const [whitelistPagination, setWhitelistPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1
  });
  const [trustedDevicesPagination, setTrustedDevicesPagination] = useState({
    page: 1,
    size: 10,
    total: 0,
    totalPages: 1
  });
  const [whitelistFilters, setWhitelistFilters] = useState({
    search: '',
    userType: '',
    status: 'ACTIVE'
  });
  const [trustedDevicesFilters, setTrustedDevicesFilters] = useState({
    search: '',
    userType: ''
  });
  const [blacklistFilters, setBlacklistFilters] = useState({
    search: '',
    blockType: '',
    status: 'ACTIVE'
  });
  const [blacklistForm, setBlacklistForm] = useState({
    blockType: 'IP',
    blockValue: '',
    reason: 'UNAUTHORIZED',
    durationType: 'DAYS',
    durationValue: 7
  });
  const [blacklistFormErrors, setBlacklistFormErrors] = useState({});
  
  // ===== History Stats (like Category Page) =====
  const [historyStats, setHistoryStats] = useState({
    ADD: 0,
    EDIT: 0,
    DELETE: 0,
    LOGIN: 0,
    LOGOUT: 0,
    VIEW: 0,
    EXPORT: 0,
    total: 0
  });
  
  // ===== Helper: Format device fingerprint for display =====
  const formatDeviceFingerprint = (hash) => {
    if (!hash) return '-';
    if (hash.length <= 16) return hash;
    return `${hash.substring(0, 8)}...${hash.substring(hash.length - 8)}`;
  };
  
  const getFullFingerprint = (hash) => {
    return hash || '-';
  };
  
  // ===== Reason Options =====
  const reasonOptions = [
    { value: 'UNAUTHORIZED', label: language === 'mm' ? 'လုပ်ပိုင်ခွင့်မရှိသူ' : 'Unauthorized' },
    { value: 'MALICIOUS', label: language === 'mm' ? 'စနစ်ကိုအန္တရာယ်ပြုသူ' : 'Malicious Activity' },
    { value: 'SUSPICIOUS', label: language === 'mm' ? 'သံသယဖြစ်ဖွယ်လုပ်ဆောင်ချက်' : 'Suspicious Behavior' },
    { value: 'SPAM', label: language === 'mm' ? 'Spam ပို့သူ' : 'Spam' },
    { value: 'OTHER', label: language === 'mm' ? 'အခြား' : 'Other' }
  ];
  
  // ===== Helper Functions =====
  const getBrowserIcon = (browser) => {
    if (!browser) return 'fa-globe';
    const b = browser.toLowerCase();
    if (b.includes('chrome')) return 'fa-chrome';
    if (b.includes('firefox')) return 'fa-firefox';
    if (b.includes('safari')) return 'fa-safari';
    if (b.includes('edge')) return 'fa-edge';
    if (b.includes('opera')) return 'fa-opera';
    return 'fa-globe';
  };
  
  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'CRITICAL': return '#dc2626';
      case 'HIGH': return '#ea580c';
      case 'MEDIUM': return '#d97706';
      case 'WARNING': return '#ca8a04';
      case 'INFO': return '#059669';
      default: return '#6b7280';
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'SUCCESS': return '#059669';
      case 'FAILED': return '#dc2626';
      case 'BLOCKED': return '#7c2d12';
      default: return '#6b7280';
    }
  };
  
  const getBlacklistStatusColor = (status) => {
    switch(status) {
      case 'ACTIVE': return '#10b981';
      case 'EXPIRED': return '#6b7280';
      case 'UNBLOCKED': return '#3b82f6';
      default: return '#6b7280';
    }
  };
  
  const getReasonLabel = (reason) => {
    const found = reasonOptions.find(r => r.value === reason);
    return found ? found.label : (reason || (language === 'mm' ? 'အကြောင်းပြချက်မရှိ' : 'No reason'));
  };
  
  const getDurationDisplay = (item) => {
    if (item.durationType === 'PERMANENT') return language === 'mm' ? 'တစ်သက်တာ' : 'Permanent';
    if (!item.expiresAt) return item.durationType;
    const expires = new Date(item.expiresAt);
    const typeLabel = item.durationType === 'MINUTES' ? (language === 'mm' ? 'မိနစ်' : 'min') :
                      item.durationType === 'HOURS' ? (language === 'mm' ? 'နာရီ' : 'hr') :
                      item.durationType === 'DAYS' ? (language === 'mm' ? 'ရက်' : 'days') :
                      (language === 'mm' ? 'လ' : 'months');
    return `${item.durationValue} ${typeLabel} (${expires.toLocaleDateString()})`;
  };
  
  // ===== History Helper Functions =====
  const getActionIcon = (actionType) => {
    switch(actionType) {
      case "ADD": return "fa-plus-circle";
      case "EDIT": return "fa-edit";
      case "DELETE": return "fa-trash";
      case "LOGIN": return "fa-sign-in-alt";
      case "LOGOUT": return "fa-sign-out-alt";
      case "VIEW": return "fa-eye";
      case "EXPORT": return "fa-download";
      default: return "fa-history";
    }
  };
  
  const getActionColor = (actionType) => {
    switch(actionType) {
      case "ADD": return "#10b981";
      case "EDIT": return "#f59e0b";
      case "DELETE": return "#ef4444";
      case "LOGIN": return "#3b82f6";
      case "LOGOUT": return "#6b7280";
      case "VIEW": return "#8b5cf6";
      case "EXPORT": return "#06b6d4";
      default: return "#6b7280";
    }
  };
  
  const getActionLabel = (actionType) => {
    switch(actionType) {
      case "ADD": return language === 'mm' ? 'ထည့်ခြင်း' : 'Added';
      case "EDIT": return language === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Updated';
      case "DELETE": return language === 'mm' ? 'ဖျက်ခြင်း' : 'Deleted';
      case "LOGIN": return language === 'mm' ? 'ဝင်ရောက်ခြင်း' : 'Logged In';
      case "LOGOUT": return language === 'mm' ? 'ထွက်ခွာခြင်း' : 'Logged Out';
      case "VIEW": return language === 'mm' ? 'ကြည့်ရှုခြင်း' : 'Viewed';
      case "EXPORT": return language === 'mm' ? 'ထုတ်ယူခြင်း' : 'Exported';
      default: return actionType;
    }
  };
  
  const groupHistoryByDate = (logs) => {
    const grouped = {};
    if (!logs || !Array.isArray(logs)) return grouped;
    logs.forEach(log => {
      if (log && log.date) {
        if (!grouped[log.date]) grouped[log.date] = [];
        grouped[log.date].push(log);
      }
    });
    return grouped;
  };
  
  const groupedHistoryLogs = useMemo(() => {
    if (!historyState.filteredHistoryLogs || !Array.isArray(historyState.filteredHistoryLogs)) return {};
    return groupHistoryByDate(historyState.filteredHistoryLogs);
  }, [historyState.filteredHistoryLogs]);
  
  // ===== History Actions =====
  const historyActions = {
    setLoading: (loading) => historyDispatch({ type: 'SET_LOADING', payload: loading }),
    setError: (error) => historyDispatch({ type: 'SET_ERROR', payload: error }),
    clearError: () => historyDispatch({ type: 'CLEAR_ERROR' }),
    fetchSuccess: (data) => historyDispatch({ type: 'FETCH_HISTORY_SUCCESS', payload: data }),
    setFilters: (filters) => historyDispatch({ type: 'SET_FILTERS', payload: filters }),
    setPagination: (pagination) => historyDispatch({ type: 'SET_PAGINATION', payload: pagination }),
    setSelectedLog: (log) => historyDispatch({ type: 'SET_SELECTED_LOG', payload: log }),
    clearFilters: () => historyDispatch({ type: 'CLEAR_FILTERS' }),
    applyFilters: () => historyDispatch({ type: 'APPLY_FILTERS' })
  };
  
  // ===== API Calls =====
  const fetchAuditLogs = useCallback(async () => {
    dispatch(auditLogActions.fetchLogsStart());
    try {
      const { page, size } = pagination;
      const { search, userType, action, severity, status, dateFrom, dateTo, deviceFingerprint } = filters;
      const response = await auditLogApi.getAuditLogs({
        page, size, search, action, severity, status, userType, dateFrom, dateTo, deviceFingerprint
      });
      if (response.success) {
        dispatch(auditLogActions.fetchLogsSuccess(response.data));
      } else {
        dispatch(auditLogActions.fetchLogsFailure(response.message));
      }
    } catch (error) {
      dispatch(auditLogActions.fetchLogsFailure(error.message));
    }
  }, [pagination.page, pagination.size, filters]);
  
  const fetchStatistics = useCallback(async () => {
    try {
      const response = await auditLogApi.getAuditStats();
      if (response.success) {
        dispatch(auditLogActions.fetchStatsSuccess(response.data));
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, []);
  
  // Update fetchHistory function to get total count correctly
const fetchHistory = useCallback(async () => {
  setHistoryLoading(true);
  try {
    const { page, size } = historyState.pagination;
    const { dateFilter, customFrom, customTo } = historyState.filters;
    
    // Always fetch with actionType filter if selected
    const actionFilterValue = selectedActionFilter !== 'all' ? selectedActionFilter : 'all';
    
    const response = await auditHistoryApi.getHistoryLogs({
      page, size, 
      search: '',
      actionType: actionFilterValue,
      entityType: 'all',
      dateFilter,
      fromDate: dateFilter === 'custom' ? customFrom : '',
      toDate: dateFilter === 'custom' ? customTo : ''
    });
    
    if (response.success) {
      const responseData = response.data;
      historyActions.fetchSuccess(responseData);
      setHistoryPageInputValue(page.toString());
      
      // ✅ Calculate stats from API totalItems, not from current page data
      const totalItems = responseData.totalItems || 0;
      
      // Get action counts from API response summary
      const actionCounts = responseData.actionTypeCounts || {};
      
      const stats = {
        ADD: actionCounts.ADD || 0,
        EDIT: actionCounts.EDIT || 0,
        DELETE: actionCounts.DELETE || 0,
        LOGIN: actionCounts.LOGIN || 0,
        LOGOUT: actionCounts.LOGOUT || 0,
        VIEW: actionCounts.VIEW || 0,
        EXPORT: actionCounts.EXPORT || 0,
        total: totalItems
      };
      setHistoryStats(stats);
    }
  } catch (error) {
    console.error('Fetch history error:', error);
    historyActions.setError(error.message);
  } finally {
    setHistoryLoading(false);
  }
}, [historyState.pagination.page, historyState.pagination.size, historyState.filters.dateFilter, historyState.filters.customFrom, historyState.filters.customTo, selectedActionFilter]);

// Add filter by action type handler
const handleActionTypeFilter = (actionType) => {
  setSelectedActionFilter(actionType);
  historyActions.setPagination({ page: 1 });
  setHistoryPageInputValue("1");
  // fetch will trigger via useEffect
};

// Update useEffect to depend on selectedActionFilter
useEffect(() => {
  if (isInitialMount.current || !showHistoryTab) return;
  const timeout = setTimeout(() => {
    fetchHistory();
  }, 300);
  return () => clearTimeout(timeout);
}, [historyState.filters.dateFilter, historyState.filters.customFrom, historyState.filters.customTo, selectedActionFilter, fetchHistory, showHistoryTab]);
  const fetchBlacklist = useCallback(async () => {
    setBlacklistLoading(true);
    try {
      const response = await blacklistApi.getBlacklist({
        page: blacklistPagination.page,
        size: blacklistPagination.size,
        search: blacklistFilters.search,
        blockType: blacklistFilters.blockType,
        status: blacklistFilters.status
      });
      if (response.success) {
        setBlacklistData(response.data.data || []);
        setBlacklistPagination(prev => ({
          ...prev,
          total: response.data.totalItems || 0,
          totalPages: response.data.totalPages || 1
        }));
      }
    } catch (error) {
      console.error('Failed to fetch blacklist:', error);
    } finally {
      setBlacklistLoading(false);
    }
  }, [blacklistPagination.page, blacklistPagination.size, blacklistFilters]);
  
  const fetchTrustedDevices = useCallback(async () => {
    setTrustedDevicesLoading(true);
    try {
      const response = await trustedDeviceApi.getTrustedDevices({
        page: trustedDevicesPagination.page,
        size: trustedDevicesPagination.size,
        search: trustedDevicesFilters.search,
        userType: trustedDevicesFilters.userType
      });
      
      if (response.success) {
        const devicesArray = response.data || [];
        setTrustedDevices(devicesArray);
        setTrustedDevicesPagination(prev => ({
          ...prev,
          total: response.totalItems || devicesArray.length,
          totalPages: response.totalPages || 1
        }));
      }
    } catch (error) {
      console.error('Failed to fetch trusted devices:', error);
    } finally {
      setTrustedDevicesLoading(false);
    }
  }, [trustedDevicesPagination.page, trustedDevicesPagination.size, trustedDevicesFilters]);
  
  // ===== Blacklist Actions =====
  const validateBlacklistForm = () => {
    const errors = {};
    if (!blacklistForm.blockValue.trim()) {
      errors.blockValue = language === 'mm' ? 'တန်ဖိုး လိုအပ်ပါသည်' : 'Value is required';
    }
    if (!blacklistForm.reason) {
      errors.reason = language === 'mm' ? 'အကြောင်းပြချက် လိုအပ်ပါသည်' : 'Reason is required';
    }
    if (blacklistForm.durationType !== 'PERMANENT' && (!blacklistForm.durationValue || blacklistForm.durationValue < 1)) {
      errors.durationValue = language === 'mm' ? 'ကြာချိန် ထည့်ပါ' : 'Duration is required';
    }
    setBlacklistFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleAddToBlacklist = async () => {
    if (!validateBlacklistForm()) return;
    try {
      const response = await blacklistApi.addToBlacklist(blacklistForm);
      if (response.success) {
        alert(language === 'mm' ? 'Blacklist ထည့်သွင်းပြီးပါပြီ' : 'Added to blacklist successfully');
        setShowBlacklistModal(false);
        setBlacklistForm({
          blockType: 'IP',
          blockValue: '',
          reason: 'UNAUTHORIZED',
          durationType: 'DAYS',
          durationValue: 7
        });
        fetchBlacklist();
        setShowBlacklistTable(true);
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert(error.message);
    }
  };
  
  const handleUnblock = async (id) => {
    if (window.confirm(language === 'mm' ? 'ဤစာရင်းကို ပြန်ဖွင့်မှာလား?' : 'Are you sure you want to unblock this?')) {
      try {
        const response = await blacklistApi.unblock(id);
        if (response.success) {
          alert(language === 'mm' ? 'ပြန်ဖွင့်ပေးပြီးပါပြီ' : 'Unblocked successfully');
          fetchBlacklist();
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const handleRevokeDevice = async (id) => {
    if (window.confirm(language === 'mm' ? 'ဤစက်ကို ယုံကြည်ရသောစာရင်းမှ ဖယ်ရှားမှာလား?' : 'Revoke this trusted device?')) {
      try {
        const response = await trustedDeviceApi.revokeDevice(id);
        if (response.success) {
          alert(language === 'mm' ? 'စက်ကို ဖယ်ရှားပြီးပါပြီ' : 'Device revoked successfully');
          fetchTrustedDevices();
        } else {
          alert(response.message);
        }
      } catch (error) {
        alert(error.message);
      }
    }
  };
  
  const exportCsv = useCallback(async () => {
    try {
      const { dateFrom, dateTo } = filters;
      const blob = await auditLogApi.exportCsv({ dateFrom, dateTo });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      dispatch(auditLogActions.setSuccess(true));
      setTimeout(() => dispatch(auditLogActions.clearSuccess()), 3000);
    } catch (error) {
      dispatch(auditLogActions.setError(error.message));
    }
  }, [filters]);
  
  const openBlacklistModal = (type, value) => {
    setBlacklistForm({
      blockType: type,
      blockValue: value || '',
      reason: 'UNAUTHORIZED',
      durationType: 'DAYS',
      durationValue: 7
    });
    setBlacklistFormErrors({});
    setShowBlacklistModal(true);
  };
  
  // ===== Filter Handlers =====
  const handleFilterChange = (filterName, value) => {
    dispatch(auditLogActions.setFilters({ [filterName]: value }));
  };
  
  const clearFilters = () => {
    dispatch(auditLogActions.clearFilters());
    fetchAuditLogs();
  };
  
  const handlePageChange = (page) => {
    dispatch(auditLogActions.setPage(page));
  };
  
  const handlePageSizeChange = (size) => {
    dispatch(auditLogActions.setPageSize(parseInt(size)));
  };
  
  const setRealTimeMode = (enabled) => {
    dispatch(auditLogActions.setRealTimeMode(enabled));
    if (!enabled && refreshIntervalRef.current) {
      clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = null;
    }
  };
  
  const setAutoRefresh = (enabled) => {
    dispatch(auditLogActions.setAutoRefresh(enabled));
  };
  
  const generateReport = () => {
    const reportSummary = `
Audit Report Generated:
=======================
Total Logs: ${statistics.totalLogs}
Today's Logs: ${statistics.todayLogs}
Critical Alerts: ${statistics.criticalLogs}
Failed Actions: ${statistics.failedActions}
Unique Users: ${statistics.uniqueUsers}
Unique IPs: ${statistics.uniqueIPs}
    `;
    alert(reportSummary);
  };
  
  // ===== History Handlers =====
  const changeHistoryPage = useCallback((newPage, direction) => {
    if (newPage === historyState.pagination.page || newPage < 1 || newPage > historyState.pagination.totalPages) return;
    if (historyPageChangeTimeoutRef.current) clearTimeout(historyPageChangeTimeoutRef.current);
    setHistoryLoadingDirection(direction);
    historyPageChangeTimeoutRef.current = setTimeout(() => {
      historyActions.setPagination({ page: newPage });
      setHistoryPageInputValue(newPage.toString());
      setHistoryLoadingDirection(null);
      if (historyContainerRef.current) historyContainerRef.current.scrollTop = 0;
    }, 150);
  }, [historyState.pagination.page, historyState.pagination.totalPages]);
  
  const handleHistoryPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    historyActions.setPagination({ size: newSize, page: 1 });
    setHistoryPageInputValue("1");
    fetchHistory();
  };
  
  const handleHistoryDateFilterChange = (filter) => {
    historyActions.setFilters({ dateFilter: filter });
    setShowHistoryPicker(filter === "custom");
    if (filter !== "custom") {
      historyActions.setFilters({ customFrom: "", customTo: "" });
      fetchHistory();
    }
  };
  
  const handleHistoryCustomDateChange = (type, value) => {
    historyActions.setFilters({ [type]: value });
  };
  
  const clearHistoryFilters = () => {
    historyActions.setFilters({ dateFilter: 'all', customFrom: '', customTo: '' });
    setShowHistoryPicker(false);
    historyActions.setPagination({ page: 1 });
    setHistoryPageInputValue("1");
    fetchHistory();
  };
  
  // ===== Effects =====
  useEffect(() => {
    if (realTimeMode && autoRefresh) {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      refreshIntervalRef.current = setInterval(() => {
        fetchAuditLogs();
        fetchStatistics();
      }, 5000);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [realTimeMode, autoRefresh, fetchAuditLogs, fetchStatistics]);
  
  useEffect(() => {
    if (isInitialMount.current) return;
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      fetchAuditLogs();
    }, 500);
    return () => {
      if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    };
  }, [filters, fetchAuditLogs]);
  
  useEffect(() => {
    if (isInitialMount.current) return;
    fetchAuditLogs();
  }, [pagination.page, pagination.size, fetchAuditLogs]);
  
  useEffect(() => {
    dispatch(auditLogActions.applyLocalFilters());
  }, [filters, auditLogs]);
  
  useEffect(() => {
    if (showBlacklistTable) fetchBlacklist();
  }, [showBlacklistTable, blacklistPagination.page, blacklistPagination.size, blacklistFilters]);
  
  useEffect(() => {
    if (showWhitelistTable) fetchTrustedDevices();
  }, [showWhitelistTable, trustedDevicesPagination.page, trustedDevicesPagination.size, trustedDevicesFilters]);
  
  // History filters effect
  useEffect(() => {
    if (isInitialMount.current || !showHistoryTab) return;
    const timeout = setTimeout(() => {
      fetchHistory();
    }, 500);
    return () => clearTimeout(timeout);
  }, [historyState.filters.dateFilter, fetchHistory, showHistoryTab]);
  
  // History pagination effect
  useEffect(() => {
    if (isInitialMount.current || !showHistoryTab) return;
    fetchHistory();
  }, [historyState.pagination.page, historyState.pagination.size, fetchHistory, showHistoryTab]);
  
  // Apply local filters for history
  useEffect(() => {
    historyActions.applyFilters();
  }, [historyState.filters, historyState.historyLogs]);
  
  // Initial load
  useEffect(() => {
    fetchAuditLogs();
    fetchStatistics();
    isInitialMount.current = false;
    return () => {
      if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
      if (historyPageChangeTimeoutRef.current) clearTimeout(historyPageChangeTimeoutRef.current);
    };
  }, []);
  
  // ===== Pagination Values =====
  const currentLogs = filteredLogs;
  const currentPageNum = pagination.page || 1;
  const totalPages = pagination.totalPages || 1;
  const totalItems = pagination.total || 0;
  const pageSize = pagination.size || 10;
  const startItem = totalItems > 0 ? (currentPageNum - 1) * pageSize + 1 : 0;
  const endItem = Math.min(currentPageNum * pageSize, totalItems);
  
  // Loading state
  if (loading && !tableLoading && filteredLogs.length === 0) {
    return (
      <div className="audit-logs-main">
        <div className="loading-state" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginRight: '15px' }}></i>
          <p>{language === 'mm' ? 'ဒေတာများ ဖွင့်နေသည်...' : 'Loading audit logs...'}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="audit-logs-main">
      {/* Header */}
      <div className="audit-header">
        <h1><i className="fas fa-clipboard-list"></i> {language === 'mm' ? 'ဆိုင်/ဆိုင်ခွဲ စစ်ဆေးမှုမှတ်တမ်းများ' : 'BRANCH/SHOP AUDIT LOGS'}</h1>
        <p>{language === 'mm' ? 'စနစ်လုပ်ဆောင်ချက်များနှင့် အသုံးပြုသူလုပ်ဆောင်ချက်များကို ခြေရာခံရန်' : 'Track and monitor all system activities and user actions'}</p>
      </div>
      
      {/* Messages */}
      {success && (
        <div className="audit-message success">
          <i className="fas fa-check-circle"></i>
          <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
          <button onClick={() => dispatch(auditLogActions.clearSuccess())}><i className="fas fa-times"></i></button>
        </div>
      )}
      {error && (
        <div className="audit-message error">
          <i className="fas fa-exclamation-circle"></i>
          <span>{error}</span>
          <button onClick={() => dispatch(auditLogActions.clearError())}><i className="fas fa-times"></i></button>
        </div>
      )}
      
      {/* Statistics Cards */}
      <div className="statistics-cards">
        <div className="stat-card total"><div className="stat-icon"><i className="fas fa-history"></i></div><div className="stat-content"><h3>{language === 'mm' ? 'စုစုပေါင်းမှတ်တမ်း' : 'Total Logs'}</h3><h2>{statistics.totalLogs.toLocaleString()}</h2><p>{language === 'mm' ? 'ခြေရာခံထားသမျှ' : 'All tracked activities'}</p></div></div>
        <div className="stat-card today"><div className="stat-icon"><i className="fas fa-calendar-day"></i></div><div className="stat-content"><h3>{language === 'mm' ? 'ယနေ့မှတ်တမ်း' : "Today's Logs"}</h3><h2>{statistics.todayLogs.toLocaleString()}</h2><p>{language === 'mm' ? 'ယနေ့လုပ်ဆောင်ချက်များ' : 'Activities for today'}</p></div></div>
        <div className="stat-card critical"><div className="stat-icon"><i className="fas fa-exclamation-triangle"></i></div><div className="stat-content"><h3>{language === 'mm' ? 'အရေးကြီးသတိပေးချက်များ' : 'Critical Alerts'}</h3><h2>{statistics.criticalLogs.toLocaleString()}</h2><p>{language === 'mm' ? 'ချက်ချင်းအာရုံစိုက်ရန်' : 'Require immediate attention'}</p></div></div>
        <div className="stat-card failed"><div className="stat-icon"><i className="fas fa-times-circle"></i></div><div className="stat-content"><h3>{language === 'mm' ? 'မအောင်မြင်သောလုပ်ဆောင်ချက်များ' : 'Failed Actions'}</h3><h2>{statistics.failedActions.toLocaleString()}</h2><p>{language === 'mm' ? 'မအောင်မြင်သောကြိုးပမ်းမှုများ' : 'Unsuccessful attempts'}</p></div></div>
        <div className="stat-card users"><div className="stat-icon"><i className="fas fa-users"></i></div><div className="stat-content"><h3>{language === 'mm' ? 'ထူးခြားအသုံးပြုသူများ' : 'Unique Users'}</h3><h2>{statistics.uniqueUsers.toLocaleString()}</h2><p>{language === 'mm' ? 'ကွဲပြားသောအသုံးပြုသူများ' : 'Different users tracked'}</p></div></div>
        <div className="stat-card ips"><div className="stat-icon"><i className="fas fa-network-wired"></i></div><div className="stat-content"><h3>{language === 'mm' ? 'ထူးခြား IP လိပ်စာများ' : 'Unique IPs'}</h3><h2>{statistics.uniqueIPs.toLocaleString()}</h2><p>{language === 'mm' ? 'ကွဲပြားသော IP လိပ်စာများ' : 'Different IP addresses'}</p></div></div>
      </div>
      
      {/* History Tab Selector - Category Page Style */}
      <div className="cat-tabs-header" style={{ marginBottom: '20px' , background:"white" , padding:"20px", borderRadius:"20px"}}>
        <div className="cat-tabs-selector">
          <div className="cat-select-container">
            <i className={`fas ${showHistoryTab ? 'fa-history' : 'fa-list-alt'} cat-select-icon`}></i>
            <select 
              className="cat-tab-select" 
              value={showHistoryTab ? 'history' : 'audit-logs'}
              onChange={(e) => {
                const isHistory = e.target.value === 'history';
                setShowHistoryTab(isHistory);
                if (isHistory) {
                  setShowBlacklistTable(false);
                  setShowWhitelistTable(false);
                  fetchHistory();
                } else {
                  setShowBlacklistTable(false);
                  setShowWhitelistTable(false);
                }
              }}
            >
              <option value="audit-logs">
                {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်းများ' : 'Audit Logs'} ({statistics.totalLogs?.toLocaleString() || 0})
              </option>
              <option value="history">
                <i className="fas fa-history"></i> 
                {language === 'mm' ? 'သမိုင်းမှတ်တမ်း' : 'History'} 
              </option>
            </select>
            <i className="fas fa-chevron-down cat-select-arrow"></i>
          </div>
        </div>
        
        {/* Trusted Devices & Blacklist Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button 
            className={`sys-user-btn whitelist ${showWhitelistTable ? 'active' : ''}`} 
            onClick={() => { 
              setShowWhitelistTable(!showWhitelistTable); 
              setShowBlacklistTable(false); 
              setShowHistoryTab(false);
            }}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            <i className="fas fa-check-circle"></i> {language === 'mm' ? 'ယုံကြည်ရသောစက်များ' : 'Trusted Devices'}
          </button>
          <button 
            className={`sys-user-btn blacklist ${showBlacklistTable ? 'active' : ''}`} 
            onClick={() => { 
              setShowBlacklistTable(!showBlacklistTable); 
              setShowWhitelistTable(false); 
              setShowHistoryTab(false);
            }}
            style={{ padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
          >
            <i className="fas fa-ban"></i> {language === 'mm' ? 'ပိတ်ပင်စာရင်း' : 'Blacklist'}
          </button>
        </div>
      </div>
      
      {/* Trusted Devices Table */}
      {showWhitelistTable && (
        <div className="whitelist-section">
          <div className="whitelist-header">
            <h3><i className="fas fa-check-circle"></i> {language === 'mm' ? 'ယုံကြည်ရသောစက်များ' : 'Trusted Devices'} ({trustedDevicesPagination.total} {language === 'mm' ? 'ခု' : 'devices'})</h3>
            <div className="whitelist-filters">
              <input type="text" placeholder={language === 'mm' ? 'ရှာဖွေရန်...' : 'Search...'} value={trustedDevicesFilters.search} onChange={(e) => setTrustedDevicesFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))} />
              <select value={trustedDevicesFilters.userType} onChange={(e) => setTrustedDevicesFilters(prev => ({ ...prev, userType: e.target.value, page: 1 }))}>
                <option value="">{language === 'mm' ? 'အားလုံး' : 'All Types'}</option>
                <option value="branch">{language === 'mm' ? 'ဆိုင်ခွဲအသုံးပြုသူ' : 'Branch User'}</option>
                <option value="shop">{language === 'mm' ? 'ဆိုင်အသုံးပြုသူ' : 'Shop User'}</option>
              </select>
              <button className="whitelist-clear-btn" onClick={() => { setTrustedDevicesFilters({ search: '', userType: '' }); setTrustedDevicesPagination(prev => ({ ...prev, page: 1 })); }}>
                <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
              </button>
            </div>
          </div>
          <div className="whitelist-table-container">
            <table className="whitelist-table">
              <thead>
                <tr>
                  <th>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</th>
                  <th>{language === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                  <th>{language === 'mm' ? 'စက်လက်ဗွေ (Hashed)' : 'Device Fingerprint (Hashed)'}</th>
                  <th>{language === 'mm' ? 'IP လိပ်စာ' : 'IP Address'}</th>
                  <th>{language === 'mm' ? 'နောက်ဆုံးအသုံးပြုချိန်' : 'Last Used'}</th>
                  <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {trustedDevicesLoading ? (
                  <tr><td colSpan="6" className="loading-cell"><i className="fas fa-spinner fa-spin"></i> Loading...</td></tr>
                ) : trustedDevices.length > 0 ? (
                  trustedDevices.map(device => (
                    <tr key={device.id}>
                      <td><strong>{device.username}</strong><br/><small>{device.fullName}</small></td>
                      <td><span className={`user-type-badge ${device.userType === 'branch' ? 'branch' : 'shop'}`}>
                        <i className={`fas ${device.userType === 'branch' ? 'fa-store' : 'fa-shop'}`}></i>
                        {device.userType === 'branch' ? (language === 'mm' ? 'ဆိုင်ခွဲ' : 'Branch') : (language === 'mm' ? 'ဆိုင်' : 'Shop')}
                      </span></td>
                      <td className="device-fp-cell">
                        <code className="device-fp-code" title={getFullFingerprint(device.deviceHash)}>
                          <i className="fas fa-fingerprint"></i> {formatDeviceFingerprint(device.deviceHash)}
                        </code>
                      </td>
                      <td>{device.ipAddress || '-'}</td>
                      <td>{device.lastUsedAt ? new Date(device.lastUsedAt).toLocaleString() : '-'}</td>
                      <td>
                        <button className="btn-revoke" onClick={() => handleRevokeDevice(device.id)}>
                          <i className="fas fa-trash-alt"></i> {language === 'mm' ? 'ဖယ်ရှားရန်' : 'Revoke'}
                        </button>
                       </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="6" className="no-data"><i className="fas fa-folder-open"></i> No trusted devices found</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {trustedDevicesPagination.totalPages > 1 && (
            <div className="whitelist-pagination">
              <button onClick={() => setTrustedDevicesPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={trustedDevicesPagination.page === 1}>Previous</button>
              <span>Page {trustedDevicesPagination.page} of {trustedDevicesPagination.totalPages}</span>
              <button onClick={() => setTrustedDevicesPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={trustedDevicesPagination.page === trustedDevicesPagination.totalPages}>Next</button>
            </div>
          )}
        </div>
      )}
      
      {/* Blacklist Table */}
      {showBlacklistTable && (
        <div className="blacklist-section">
          <div className="blacklist-header">
            <h3><i className="fas fa-ban"></i> {language === 'mm' ? 'ပိတ်ပင်စာရင်း' : 'Blacklist'} ({blacklistPagination.total} {language === 'mm' ? 'ခု' : 'items'})</h3>
            <div className="blacklist-filters">
              <input type="text" placeholder={language === 'mm' ? 'ရှာဖွေရန်...' : 'Search...'} value={blacklistFilters.search} onChange={(e) => setBlacklistFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))} />
              <select value={blacklistFilters.blockType} onChange={(e) => setBlacklistFilters(prev => ({ ...prev, blockType: e.target.value, page: 1 }))}>
                <option value="">{language === 'mm' ? 'အားလုံး' : 'All Types'}</option>
                <option value="IP">IP Address</option>
                <option value="DEVICE_FINGERPRINT">{language === 'mm' ? 'စက်လက်ဗွေ' : 'Device Fingerprint'}</option>
                <option value="USERNAME">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</option>
              </select>
              <select value={blacklistFilters.status} onChange={(e) => setBlacklistFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}>
                <option value="ACTIVE">{language === 'mm' ? 'လက်ရှိပိတ်ထားသော' : 'Active'}</option>
                <option value="EXPIRED">{language === 'mm' ? 'သက်တမ်းကုန်သော' : 'Expired'}</option>
                <option value="UNBLOCKED">{language === 'mm' ? 'ပြန်ဖွင့်ထားသော' : 'Unblocked'}</option>
              </select>
              <button className="blacklist-clear-btn" onClick={() => { setBlacklistFilters({ search: '', blockType: '', status: 'ACTIVE' }); setBlacklistPagination(prev => ({ ...prev, page: 1 })); }}>
                <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
              </button>
              <button className="blacklist-add-btn" onClick={() => openBlacklistModal('IP', '')}>
                <i className="fas fa-plus"></i> {language === 'mm' ? 'ပိတ်ပင်ရန်' : 'Add'}
              </button>
            </div>
          </div>
          <div className="blacklist-table-container">
            <table className="blacklist-table">
              <thead>
                <tr>
                  <th>{language === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                  <th>{language === 'mm' ? 'တန်ဖိုး' : 'Value'}</th>
                  <th>{language === 'mm' ? 'အကြောင်းပြချက်' : 'Reason'}</th>
                  <th>{language === 'mm' ? 'ကြာချိန်' : 'Duration'}</th>
                  <th>{language === 'mm' ? 'ပိတ်ဆို့သူ' : 'Blocked By'}</th>
                  <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                  <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {blacklistLoading ? (
                  <tr><td colSpan="7" className="loading-cell"><i className="fas fa-spinner fa-spin"></i> Loading...</td></tr>
                ) : blacklistData.length > 0 ? (
                  blacklistData.map(item => (
                    <tr key={item.id}>
                      <td><span className="block-type-badge">{item.blockType === 'IP' ? 'IP' : item.blockType === 'DEVICE_FINGERPRINT' ? 'Device' : 'User'}</span></td>
                      <td className="block-value-cell" title={item.blockValue}>
                        {item.blockType === 'DEVICE_FINGERPRINT' 
                          ? formatDeviceFingerprint(item.blockValue)
                          : item.blockValue.length > 30 ? item.blockValue.substring(0,30)+'...' : item.blockValue}
                      </td>
                      <td>{getReasonLabel(item.reason)}</td>
                      <td>{getDurationDisplay(item)}</td>
                      <td><small>{item.blockedByName}<br/>({item.blockedByRole})</small></td>
                      <td><span className="blacklist-status-badge" style={{backgroundColor:getBlacklistStatusColor(item.status)}}>{item.status}</span></td>
                      <td>{item.status === 'ACTIVE' && (<button className="btn-unblock" onClick={() => handleUnblock(item.id)}><i className="fas fa-unlock-alt"></i> {language === 'mm' ? 'ပြန်ဖွင့်ရန်' : 'Unblock'}</button>)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="no-data"><i className="fas fa-folder-open"></i> No blacklist entries</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {blacklistPagination.totalPages > 1 && (
            <div className="blacklist-pagination">
              <button onClick={() => setBlacklistPagination(prev => ({ ...prev, page: prev.page - 1 }))} disabled={blacklistPagination.page === 1}>Previous</button>
              <span>Page {blacklistPagination.page} of {blacklistPagination.totalPages}</span>
              <button onClick={() => setBlacklistPagination(prev => ({ ...prev, page: prev.page + 1 }))} disabled={blacklistPagination.page === blacklistPagination.totalPages}>Next</button>
            </div>
          )}
        </div>
      )}
      
      {/* ===== HISTORY TAB (Category Page Style) ===== */}
      {showHistoryTab && (
        <div className="history-section">
          {/* Stats Badges like Category Page */}
          {/* Stats Badges with Clickable Filter - Category Page Style */}
<div className="cat-search-badge-container" style={{ marginBottom: '15px', justifyContent: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
  <button 
    className={`cat-search-badge ${selectedActionFilter === 'all' ? 'active-filter' : ''}`} 
    onClick={() => handleActionTypeFilter('all')}
    style={{ 
      background: selectedActionFilter === 'all' ? '#4f46e5' : '#f1f5f9',
      color: selectedActionFilter === 'all' ? 'white' : '#475569',
      border: 'none',
      cursor: 'pointer',
      padding: '6px 16px',
      borderRadius: '30px',
      fontSize: '0.8rem',
      fontWeight: '500',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px'
    }}
  >
    <i className="fas fa-list"></i> {language === 'mm' ? 'အားလုံး' : 'All'}: {historyStats.total}
  </button>
  
  {historyStats.ADD > 0 && (
    <button 
      className={`cat-search-badge ${selectedActionFilter === 'ADD' ? 'active-filter' : ''}`}
      onClick={() => handleActionTypeFilter('ADD')}
      style={{ 
        background: selectedActionFilter === 'ADD' ? '#10b981' : '#d1fae5',
        color: selectedActionFilter === 'ADD' ? 'white' : '#065f46',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-plus-circle"></i> {language === 'mm' ? 'ထည့်ခြင်း' : 'Added'}: {historyStats.ADD}
    </button>
  )}
  
  {historyStats.EDIT > 0 && (
    <button 
      className={`cat-search-badge ${selectedActionFilter === 'EDIT' ? 'active-filter' : ''}`}
      onClick={() => handleActionTypeFilter('EDIT')}
      style={{ 
        background: selectedActionFilter === 'EDIT' ? '#f59e0b' : '#fed7aa',
        color: selectedActionFilter === 'EDIT' ? 'white' : '#9a3412',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-edit"></i> {language === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Updated'}: {historyStats.EDIT}
    </button>
  )}
  
  {historyStats.DELETE > 0 && (
    <button 
      className={`cat-search-badge ${selectedActionFilter === 'DELETE' ? 'active-filter' : ''}`}
      onClick={() => handleActionTypeFilter('DELETE')}
      style={{ 
        background: selectedActionFilter === 'DELETE' ? '#ef4444' : '#fee2e2',
        color: selectedActionFilter === 'DELETE' ? 'white' : '#991b1b',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-trash"></i> {language === 'mm' ? 'ဖျက်ခြင်း' : 'Deleted'}: {historyStats.DELETE}
    </button>
  )}
  
  {historyStats.LOGIN > 0 && (
    <button 
      className={`cat-search-badge ${selectedActionFilter === 'LOGIN' ? 'active-filter' : ''}`}
      onClick={() => handleActionTypeFilter('LOGIN')}
      style={{ 
        background: selectedActionFilter === 'LOGIN' ? '#3b82f6' : '#dbeafe',
        color: selectedActionFilter === 'LOGIN' ? 'white' : '#1e40af',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-sign-in-alt"></i> {language === 'mm' ? 'ဝင်ရောက်ခြင်း' : 'Login'}: {historyStats.LOGIN}
    </button>
  )}
  
  {historyStats.LOGOUT > 0 && (
    <button 
      className={`cat-search-badge ${selectedActionFilter === 'LOGOUT' ? 'active-filter' : ''}`}
      onClick={() => handleActionTypeFilter('LOGOUT')}
      style={{ 
        background: selectedActionFilter === 'LOGOUT' ? '#6b7280' : '#e0e7ff',
        color: selectedActionFilter === 'LOGOUT' ? 'white' : '#3730a3',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-sign-out-alt"></i> {language === 'mm' ? 'ထွက်ခွာခြင်း' : 'Logout'}: {historyStats.LOGOUT}
    </button>
  )}
  
  {historyStats.VIEW > 0 && (
    <button 
      className={`cat-search-badge ${selectedActionFilter === 'VIEW' ? 'active-filter' : ''}`}
      onClick={() => handleActionTypeFilter('VIEW')}
      style={{ 
        background: selectedActionFilter === 'VIEW' ? '#8b5cf6' : '#f3e8ff',
        color: selectedActionFilter === 'VIEW' ? 'white' : '#6b21a5',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-eye"></i> {language === 'mm' ? 'ကြည့်ရှုခြင်း' : 'Viewed'}: {historyStats.VIEW}
    </button>
  )}
  
  {historyStats.EXPORT > 0 && (
    <button 
      className={`cat-search-badge ${selectedActionFilter === 'EXPORT' ? 'active-filter' : ''}`}
      onClick={() => handleActionTypeFilter('EXPORT')}
      style={{ 
        background: selectedActionFilter === 'EXPORT' ? '#06b6d4' : '#cffafe',
        color: selectedActionFilter === 'EXPORT' ? 'white' : '#155e75',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-download"></i> {language === 'mm' ? 'ထုတ်ယူခြင်း' : 'Exported'}: {historyStats.EXPORT}
    </button>
  )}
  
  {/* Clear filter button */}
  {selectedActionFilter !== 'all' && (
    <button 
      className="cat-search-badge"
      onClick={() => handleActionTypeFilter('all')}
      style={{ 
        background: '#fef2f7',
        color: '#f72585',
        border: 'none',
        cursor: 'pointer',
        padding: '6px 16px',
        borderRadius: '30px',
        fontSize: '0.8rem',
        fontWeight: '500',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear filter'}
    </button>
  )}
</div>
          
          {/* History Filters - Only Date Filter, No Search */}
          <div className="history-filters" style={{ marginBottom: '20px' }}>
            <div className="date-filter-buttons">
              <button className={`date-filter-btn ${historyState.filters.dateFilter === 'today' ? 'active' : ''}`} onClick={() => handleHistoryDateFilterChange('today')}>
                {language === 'mm' ? 'ယနေ့' : 'Today'}
              </button>
              <button className={`date-filter-btn ${historyState.filters.dateFilter === 'yesterday' ? 'active' : ''}`} onClick={() => handleHistoryDateFilterChange('yesterday')}>
                {language === 'mm' ? 'မနေ့က' : 'Yesterday'}
              </button>
              <button className={`date-filter-btn ${historyState.filters.dateFilter === 'thisWeek' ? 'active' : ''}`} onClick={() => handleHistoryDateFilterChange('thisWeek')}>
                {language === 'mm' ? 'ဒီအပတ်' : 'This Week'}
              </button>
              <button className={`date-filter-btn ${historyState.filters.dateFilter === 'thisMonth' ? 'active' : ''}`} onClick={() => handleHistoryDateFilterChange('thisMonth')}>
                {language === 'mm' ? 'ဒီလ' : 'This Month'}
              </button>
              <button className={`date-filter-btn ${historyState.filters.dateFilter === 'custom' ? 'active' : ''}`} onClick={() => handleHistoryDateFilterChange('custom')}>
                <i className="fas fa-calendar"></i> {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
              </button>
              {historyState.filters.dateFilter !== 'all' && (
                <button className="date-filter-btn clear" onClick={clearHistoryFilters}>
                  <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                </button>
              )}
            </div>
            
            {showHistoryPicker && (
              <div className="custom-date-picker">
                <div className="date-picker-row">
                  <label>{language === 'mm' ? 'မှ' : 'From:'}</label>
                  <input type="date" value={historyState.filters.customFrom} onChange={(e) => handleHistoryCustomDateChange('customFrom', e.target.value)} />
                </div>
                <div className="date-picker-row">
                  <label>{language === 'mm' ? 'ထိ' : 'To:'}</label>
                  <input type="date" value={historyState.filters.customTo} onChange={(e) => handleHistoryCustomDateChange('customTo', e.target.value)} />
                </div>
                <button className="apply-date-btn" onClick={() => fetchHistory()}>
                  <i className="fas fa-check"></i> {language === 'mm' ? 'အတည်ပြုရန်' : 'Apply'}
                </button>
              </div>
            )}
          </div>
          
          {/* History Pagination Header */}
          <div className="history-pagination-header">
            <div className="page-controls">
              <button 
                className="nav-btn" 
                onClick={() => changeHistoryPage(historyState.pagination.page - 1, 'prev')}
                disabled={historyState.pagination.page === 1 || historyLoading}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="page-control">
                <input 
                  type="text" 
                  className="page-input" 
                  value={historyPageInputValue}
                  onChange={(e) => setHistoryPageInputValue(e.target.value)}
                  onBlur={() => {
                    const value = parseInt(historyPageInputValue);
                    if (!isNaN(value) && value >= 1 && value <= historyState.pagination.totalPages && value !== historyState.pagination.page) {
                      changeHistoryPage(value, 'jump');
                    } else {
                      setHistoryPageInputValue(historyState.pagination.page.toString());
                    }
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                />
                <span className="page-total">/ {historyState.pagination.totalPages.toLocaleString()}</span>
              </div>
              <button 
                className="nav-btn" 
                onClick={() => changeHistoryPage(historyState.pagination.page + 1, 'next')}
                disabled={historyState.pagination.page === historyState.pagination.totalPages || historyState.pagination.totalPages === 0 || historyLoading}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              <select 
                className="per-page-select" 
                value={historyState.pagination.size} 
                onChange={handleHistoryPageSizeChange}
              >
                <option value={10}>10 / page</option>
                <option value={20}>20 / page</option>
                <option value={50}>50 / page</option>
                <option value={100}>100 / page</option>
              </select>
            </div>
            <div className="showing-count">
              {historyLoading ? (
                <span><i className="fas fa-spinner fa-spin"></i> Loading...</span>
              ) : (
                <span>
                  Showing {historyState.filteredHistoryLogs.length > 0 ? ((historyState.pagination.page - 1) * historyState.pagination.size) + 1 : 0} - {Math.min(historyState.pagination.page * historyState.pagination.size, historyState.pagination.total)} of {historyState.pagination.total.toLocaleString()} items
                </span>
              )}
            </div>
          </div>
          
          {/* History Logs Container - Category Page Style */}
          <div className="cat-compact-logs-container" ref={historyContainerRef} style={{ maxHeight: '500px', overflowY: 'auto' }}>
            {historyLoading ? (
              <div className="loading-state">
                <i className="fas fa-spinner fa-spin"></i>
                <p>{language === 'mm' ? 'မှတ်တမ်းများ ဖွင့်နေသည်...' : 'Loading history...'}</p>
              </div>
            ) : Object.keys(groupedHistoryLogs).length > 0 ? (
              Object.entries(groupedHistoryLogs).map(([date, logs]) => (
                <div key={date} className="cat-date-group">
                  <div className="cat-date-header">
                    <span className="cat-date-label">{date}</span>
                    <span className="cat-date-count">{logs.length} {language === 'mm' ? 'ခု' : 'activities'}</span>
                  </div>
                  <div className="cat-logs-list">
                    {logs.map(log => (
                      <div 
                        key={log.id} 
                        className={`cat-compact-log-entry log-${log.actionType?.toLowerCase()}`}
                        onClick={() => historyActions.setSelectedLog(log)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className="cat-log-icon" style={{ color: getActionColor(log.actionType) }}>
                          <i className={`fas ${getActionIcon(log.actionType)}`}></i>
                        </div>
                        <div className="cat-log-content">
                          <div className="cat-log-main-info">
                            <span className="cat-log-action">
                              {getActionLabel(log.actionType)}
                            </span>
                            <span className="cat-log-category">
                              {log.entityType} "{log.entityName || log.entityId || '-'}"
                              {log.entityId && <span className="cat-category-id">#{log.entityId}</span>}
                            </span>
                          </div>
                          <div className="prod-log-details">
                            <span className="cat-log-user">
                              <i className="fas fa-user"></i> 
                              <strong>{log.fullName || log.username || 'Unknown'}</strong>
                              <span className="cat-user-role">({log.userRole || 'N/A'})</span>
                            </span>
                            <span className="cat-log-time">
                              <i className="fas fa-clock"></i> {log.timestamp}
                            </span>
                            {log.description && (
                              <span className="cat-log-detail-count">
                                <i className="fas fa-info-circle"></i> {log.description.length > 50 ? log.description.substring(0, 50) + '...' : log.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-logs">
                <i className="fas fa-clipboard-list"></i>
                <p>{language === 'mm' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် မှတ်တမ်းများ မတွေ့ပါ။' : 'No history found for the selected filters.'}</p>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Controls & Audit Table - Only show when NOT in history tab */}
      {!showHistoryTab && !showWhitelistTable && !showBlacklistTable && (
        <>
          <div className="controls-section">
            <div className="controls-left">
              <div className="search-box"><i className="fas fa-search"></i><input type="text" placeholder={language === 'mm' ? 'မှတ်တမ်းများရှာဖွေရန်...' : 'Search logs...'} value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} /></div>
              <div className="filter-group">
                <select value={filters.userType} onChange={(e) => handleFilterChange('userType', e.target.value)}>
                  <option value="all">{language === 'mm' ? 'အားလုံး' : 'All Users'}</option>
                  <option value="branch">{language === 'mm' ? 'ဆိုင်ခွဲ' : 'Branch'}</option>
                  <option value="shop">{language === 'mm' ? 'ဆိုင်' : 'Shop'}</option>
                  <option value="owner">{language === 'mm' ? 'ပိုင်ရှင်' : 'Owner'}</option>
                  <option value="system">{language === 'mm' ? 'စနစ်' : 'System'}</option>
                </select>
                <input 
                  type="text" 
                  className="fingerprint-search" 
                  placeholder={language === 'mm' ? 'စက်လက်ဗွေ ရှာရန်...' : 'Search Device FP...'} 
                  value={filters.deviceFingerprint || ''} 
                  onChange={(e) => handleFilterChange('deviceFingerprint', e.target.value)} 
                />
                <select value={filters.severity} onChange={(e) => handleFilterChange('severity', e.target.value)}>
                  <option value="all">{language === 'mm' ? 'အားလုံး' : 'All Severity'}</option>
                  <option value="CRITICAL">Critical</option><option value="HIGH">High</option><option value="MEDIUM">Medium</option><option value="WARNING">Warning</option><option value="INFO">Info</option>
                </select>
                <select value={filters.status} onChange={(e) => handleFilterChange('status', e.target.value)}>
                  <option value="all">{language === 'mm' ? 'အားလုံး' : 'All Status'}</option>
                  <option value="SUCCESS">Success</option><option value="FAILED">Failed</option><option value="BLOCKED">Blocked</option>
                </select>
              </div>
              <div className="date-filters">
                <div className="date-input"><label>{language === 'mm' ? 'မှ' : 'From'}</label><input type="date" value={filters.dateFrom} onChange={(e) => handleFilterChange('dateFrom', e.target.value)} /></div>
                <div className="date-input"><label>{language === 'mm' ? 'ထိ' : 'To'}</label><input type="date" value={filters.dateTo} onChange={(e) => handleFilterChange('dateTo', e.target.value)} /></div>
              </div>
            </div>
            <div className="controls-right">
              <div className="mode-toggle">
                <label className="toggle-label"><input type="checkbox" checked={realTimeMode} onChange={(e) => setRealTimeMode(e.target.checked)} /><span className="toggle-slider"></span><span className="toggle-text">Real-time</span></label>
                {realTimeMode && (<label className="toggle-label"><input type="checkbox" checked={autoRefresh} onChange={(e) => setAutoRefresh(e.target.checked)} /><span className="toggle-slider"></span><span className="toggle-text">Auto Refresh</span></label>)}
              </div>
              <button className="btn-clear" onClick={clearFilters}><i className="fas fa-filter-circle-xmark"></i> Clear</button>
              <button className="btn-export" onClick={exportCsv}><i className="fas fa-file-csv"></i> CSV</button>
              <button className="btn-report" onClick={generateReport}><i className="fas fa-file-pdf"></i> Report</button>
              <button className="btn-refresh" onClick={fetchAuditLogs}><i className="fas fa-sync-alt"></i></button>
            </div>
          </div>
          
          {/* Audit Table */}
          <div className="audit-table-section">
            <div className="section-header">
              <h2><i className="fas fa-list-alt"></i> {language === 'mm' ? 'ဆိုင်/ဆိုင်ခွဲ စစ်ဆေးမှုမှတ်တမ်းများ' : 'Branch/Shop Audit Logs'} ({totalItems.toLocaleString()} records)</h2>
              <div className="table-info">Showing {startItem}-{endItem} of {totalItems.toLocaleString()}</div>
            </div>
            <div className="audit-table-container">
              <table className="audit-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'အချိန်' : 'Timestamp'}</th>
                    <th>{language === 'mm' ? 'အသုံးပြုသူ' : 'User'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Action'}</th>
                    <th>{language === 'mm' ? 'ဖော်ပြချက်' : 'Description'}</th>
                    <th>{language === 'mm' ? 'စက်လည်ပတ်မှုစနစ်' : 'Browser / OS'}</th>
                    <th>{language === 'mm' ? 'စက်လက်ဗွေ (Hashed)' : 'Device FP'}</th>
                    <th>{language === 'mm' ? 'တည်နေရာ' : 'Location'}</th>
                    <th>{language === 'mm' ? 'ပြင်းထန်မှု' : 'Severity'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th style={{minWidth:"260px"}}>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="10" className="loading-cell"><i className="fas fa-spinner fa-spin"></i> Loading...</td></tr>
                  ) : currentLogs.length > 0 ? (
                    currentLogs.map(log => (
                      <tr key={log.id} className={selectedLog?.id === log.id ? 'selected' : ''} onClick={() => dispatch(auditLogActions.setSelectedLog(log))}>
                        <td className="timestamp-cell"><div className="timestamp-date">{log.date}</div>
                        <div className="timestamp-time" style={{fontSize:"12px"}}>{log.time}</div></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div className="user-avatar">{log.username?.charAt(0)?.toUpperCase() || '?'}</div>
                            <div className="user-info">
                              <strong>{log.username || 'Unknown'}</strong>
                              <small>{log.userType}</small>
                            </div>
                          </div>
                        </td>
                        <td><span className="action-badge">{log.action?.replace(/_/g, ' ') || '-'}</span></td>
                        <td className="description-cell"><div className="description-text">{log.description || '-'}</div></td>
                        <td>
                          <div className="browser-info">
                            <i className={`fab ${getBrowserIcon(log.browser)}`}></i>
                            <span>{log.browser || '-'}</span>
                            <small className="os-info">{log.os || ''}</small>
                            {log.deviceType && <span className="device-type-badge">({log.deviceType})</span>}
                          </div>
                        </td>
                        <td>
                          <div className="device-fp" title={getFullFingerprint(log.deviceFingerprint)}>
                            <i className="fas fa-fingerprint"></i>
                            <code className="fp-hash">{formatDeviceFingerprint(log.deviceFingerprint)}</code>
                          </div>
                        </td>
                        <td>
                          <div className="location-info">
                            <i className="fas fa-map-marker-alt"></i>
                            <div className="location-details">
                              <span className="location-name">{log.location || 'Unknown'}</span>
                              {log.ipAddress && (
                                <span className="location-ip">
                                  <i className="fas fa-network-wired"></i> {log.ipAddress}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td><span className="severity-badge" style={{backgroundColor:getSeverityColor(log.severity)}}>{log.severity}</span></td>
                        <td><span className="status-badge" style={{backgroundColor:getStatusColor(log.status)}}>{log.status}</span></td>
                        <td>
                          <button className="btn-view-details" onClick={(e)=>{e.stopPropagation();dispatch(auditLogActions.setSelectedLog(log));}}><i className="fas fa-eye"></i> View</button>
                          <button className="btn-block-ip" onClick={(e)=>{e.stopPropagation();openBlacklistModal('IP', log.ipAddress);}}><i className="fas fa-ban"></i> Block IP</button>
                          {log.deviceFingerprint && (
                            <button className="btn-block-fp" onClick={(e)=>{e.stopPropagation();openBlacklistModal('DEVICE_FINGERPRINT', log.deviceFingerprint);}}>
                              <i className="fas fa-fingerprint"></i> Block FP
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="10" className="no-data"><i className="fas fa-folder-open"></i> No audit logs found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="pagination">
              <div className="pagination-buttons">
                <button onClick={() => handlePageChange(currentPageNum-1)} disabled={currentPageNum===1||tableLoading} className="pagination-btn"><i className="fas fa-chevron-left"></i> Previous</button>
                <span className="page-info">Page <strong>{currentPageNum}</strong> of <strong>{totalPages}</strong></span>
                <button onClick={() => handlePageChange(currentPageNum+1)} disabled={currentPageNum===totalPages||tableLoading} className="pagination-btn">Next <i className="fas fa-chevron-right"></i></button>
              </div>
              <div className="page-size-selector">
                <select value={pageSize} onChange={(e) => handlePageSizeChange(e.target.value)} disabled={tableLoading} className="page-size-select">
                  <option value={10}>10 / page</option><option value={20}>20 / page</option><option value={50}>50 / page</option><option value={100}>100 / page</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Log Details Panel */}
          {selectedLog && (
            <div className="log-details-panel">
              <div className="details-header"><h3><i className="fas fa-info-circle"></i> Log Details: {selectedLog.action?.replace(/_/g, ' ')}</h3><button className="btn-close" onClick={() => dispatch(auditLogActions.setSelectedLog(null))}><i className="fas fa-times"></i></button></div>
              <div className="details-grid">
                <div className="detail-item"><label>Log ID</label><span className="detail-value">{selectedLog.id}</span></div>
                <div className="detail-item"><label>Timestamp</label><span className="detail-value">{selectedLog.timestamp}</span></div>
                <div className="detail-item"><label>User</label><span className="detail-value">{selectedLog.username} ({selectedLog.userType})</span></div>
                <div className="detail-item"><label>IP Address</label><span className="detail-value">{selectedLog.ipAddress}</span></div>
                <div className="detail-item"><label>Location</label><span className="detail-value">{selectedLog.location}</span></div>
                <div className="detail-item"><label>Browser / OS</label><span className="detail-value"><i className={`fab ${getBrowserIcon(selectedLog.browser)}`}></i> {selectedLog.browser || '-'} / {selectedLog.os || '-'} <span className="device-type-badge">({selectedLog.deviceType})</span></span></div>
                <div className="detail-item">
                  <label><i className="fas fa-fingerprint"></i> Device Fingerprint (Hashed)</label>
                  <div className="detail-value device-fp-full">
                    <code style={{ fontSize: '12px', wordBreak: 'break-all', background: '#f1f5f9', padding: '8px', borderRadius: '8px', display: 'inline-block', fontFamily: 'monospace' }}>
                      {selectedLog.deviceFingerprint || '-'}
                    </code>
                  </div>
                </div>
                <div className="detail-item"><label>Description</label><span className="detail-value description">{selectedLog.description || '-'}</span></div>
                <div className="detail-item"><label>Status</label><span className="detail-value"><span className="status-badge" style={{backgroundColor:getStatusColor(selectedLog.status)}}>{selectedLog.status}</span></span></div>
                <div className="detail-item"><label>Severity</label><span className="detail-value"><span className="severity-badge" style={{backgroundColor:getSeverityColor(selectedLog.severity)}}>{selectedLog.severity}</span></span></div>
              </div>
              <div className="details-actions">
                <button className="btn-block" onClick={() => openBlacklistModal('IP', selectedLog.ipAddress)}><i className="fas fa-ban"></i> Block IP</button>
                {selectedLog.deviceFingerprint && (
                  <button className="btn-block" onClick={() => openBlacklistModal('DEVICE_FINGERPRINT', selectedLog.deviceFingerprint)}>
                    <i className="fas fa-fingerprint"></i> Block Device
                  </button>
                )}
                {selectedLog.username && (
                  <button className="btn-block" onClick={() => openBlacklistModal('USERNAME', selectedLog.username)}>
                    <i className="fas fa-user"></i> Block User
                  </button>
                )}
              </div>
            </div>
          )}
        </>
      )}
      
      {/* Back to Dashboard */}
      <div className="back-section"><NavLink to="/office/dashboard" className="btn-back"><i className="fas fa-arrow-left"></i> Back to Dashboard</NavLink></div>
      
      {/* Blacklist Modal */}
      {showBlacklistModal && (
        <div className="blacklist-modal-overlay">
          <div className="blacklist-modal-content">
            <div className="blacklist-modal-header"><h3><i className="fas fa-ban"></i> Add to Blacklist</h3><button className="blacklist-modal-close" onClick={() => setShowBlacklistModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="blacklist-modal-body">
              <div className="blacklist-form-group"><label>Block Type</label><select value={blacklistForm.blockType} onChange={(e) => setBlacklistForm(prev => ({ ...prev, blockType: e.target.value }))}><option value="IP">IP Address</option><option value="DEVICE_FINGERPRINT">Device Fingerprint</option><option value="USERNAME">Username</option></select></div>
              <div className="blacklist-form-group"><label>Value</label><input type="text" value={blacklistForm.blockValue} onChange={(e) => setBlacklistForm(prev => ({ ...prev, blockValue: e.target.value }))} placeholder="Enter value" className={blacklistFormErrors.blockValue ? 'error' : ''} />{blacklistFormErrors.blockValue && <span className="error-message">{blacklistFormErrors.blockValue}</span>}</div>
              <div className="blacklist-form-group"><label>Reason</label><select value={blacklistForm.reason} onChange={(e) => setBlacklistForm(prev => ({ ...prev, reason: e.target.value }))}>{reasonOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}</select></div>
              <div className="blacklist-form-row">
                <div className="blacklist-form-group"><label>Duration Type</label><select value={blacklistForm.durationType} onChange={(e) => setBlacklistForm(prev => ({ ...prev, durationType: e.target.value }))}><option value="MINUTES">Minutes</option><option value="HOURS">Hours</option><option value="DAYS">Days</option><option value="MONTHS">Months</option><option value="PERMANENT">Permanent</option></select></div>
                {blacklistForm.durationType !== 'PERMANENT' && (<div className="blacklist-form-group"><label>Duration</label><input type="number" min="1" value={blacklistForm.durationValue} onChange={(e) => setBlacklistForm(prev => ({ ...prev, durationValue: parseInt(e.target.value) || 0 }))} className={blacklistFormErrors.durationValue ? 'error' : ''} />{blacklistFormErrors.durationValue && <span className="error-message">{blacklistFormErrors.durationValue}</span>}</div>)}
              </div>
            </div>
            <div className="blacklist-modal-footer"><button className="blacklist-btn-cancel" onClick={() => setShowBlacklistModal(false)}>Cancel</button><button className="blacklist-btn-submit" onClick={handleAddToBlacklist}><i className="fas fa-ban"></i> Add</button></div>
          </div>
        </div>
      )}
      
      {/* History Details Modal */}
      {historyState.selectedHistoryLog && (
        <div className="cat-modal-overlay">
          <div className="cat-modal-content" style={{ maxWidth: '600px' }}>
            <div className="cat-modal-header">
              <h3>
                <i className={`fas ${getActionIcon(historyState.selectedHistoryLog.actionType)}`}></i>
                {language === 'mm' ? 'မှတ်တမ်းအသေးစိတ်' : 'History Details'}
              </h3>
              <button className="cat-modal-close" onClick={() => historyActions.setSelectedLog(null)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="cat-modal-body">
              <div className="history-detail-header">
                <div className="history-detail-action">
                  <span className={`history-action-badge action-${historyState.selectedHistoryLog.actionType?.toLowerCase()}`}>
                    <i className={`fas ${getActionIcon(historyState.selectedHistoryLog.actionType)}`}></i>
                    {getActionLabel(historyState.selectedHistoryLog.actionType)}
                  </span>
                </div>
                <div className="history-detail-meta">
                  <div className="history-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="history-user-name"><strong>{historyState.selectedHistoryLog.fullName || historyState.selectedHistoryLog.username || 'Unknown'}</strong></div>
                      <div className="history-user-role">{historyState.selectedHistoryLog.userRole || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="history-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="history-date">{historyState.selectedHistoryLog.date}</div>
                      <div className="history-time">{historyState.selectedHistoryLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="history-detail-info">
                <div className="info-row">
                  <label>{language === 'mm' ? 'အမျိုးအစား' : 'Entity Type'}:</label>
                  <span>{historyState.selectedHistoryLog.entityType || '-'}</span>
                </div>
                <div className="info-row">
                  <label>{language === 'mm' ? 'အမည် / ID' : 'Name / ID'}:</label>
                  <span>{historyState.selectedHistoryLog.entityName || '-'} {historyState.selectedHistoryLog.entityId && <span className="entity-id">(#{historyState.selectedHistoryLog.entityId})</span>}</span>
                </div>
                <div className="info-row">
                  <label>{language === 'mm' ? 'ဖော်ပြချက်' : 'Description'}:</label>
                  <span>{historyState.selectedHistoryLog.description || '-'}</span>
                </div>
                <div className="info-row">
                  <label>IP Address:</label>
                  <span>{historyState.selectedHistoryLog.ipAddress || '-'}</span>
                </div>
                <div className="info-row">
                  <label>{language === 'mm' ? 'စက်အချက်အလက်' : 'Device Info'}:</label>
                  <span className="device-info-text">{historyState.selectedHistoryLog.deviceInfo || '-'}</span>
                </div>
              </div>
              
              {historyState.selectedHistoryLog.changes && historyState.selectedHistoryLog.changes.length > 0 && (
                <div className="history-changes-section">
                  <h4>{language === 'mm' ? 'အပြောင်းအလဲများ' : 'Changes'}:</h4>
                  <div className="history-changes-list">
                    {historyState.selectedHistoryLog.changes.map((change, idx) => (
                      <div key={idx} className="history-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{change}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="cat-modal-footer">
              <button className="cat-btn-cancel" onClick={() => historyActions.setSelectedLog(null)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditLogsPage;