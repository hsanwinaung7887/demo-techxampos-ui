import React, { useState, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { initialState, shopReducer } from '../owner-useReducer/shopReducer';
import { shopApi, shopLogsApi } from '../apis/shopApi';
import "../../light-style/office-css/shopManagement.css";
import { useSelector, useDispatch } from 'react-redux';
import { getOfficeCurrentUser } from '../../redux/slices/officeAuthSlice';

const ShopManagementPage = () => {
  const navigate = useNavigate();
  const [state, localDispatch] = useReducer(shopReducer, initialState);
  
  // Language State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('officeLanguage') || 'en';
  });

  // =============== Listen for language changes ===============
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'officeLanguage') {
        setLanguage(e.newValue || 'en');
      }
    };

    const handleLanguageEvent = () => {
      const newLang = localStorage.getItem('officeLanguage') || 'en';
      setLanguage(newLang);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('languageChange', handleLanguageEvent);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('languageChange', handleLanguageEvent);
    };
  }, []);
  
  // Local UI States
  const [showShopModal, setShowShopModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);
  const pageChangeTimeoutRef = useRef(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Error States
  const [networkError, setNetworkError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  // Form state
  const [shopForm, setShopForm] = useState({
    id: null,
    shopCode: "",
    name: "",
    shopType: "RETAIL",
    status: "Active"
  });

  // Refs
  const filterTimeoutRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  // ===== Get current user from localStorage =====
  const dispatch = useDispatch();
  const { user: reduxUser, isAuthenticated, isLoading: authLoading } = useSelector((state) => state.officeAuth);

  const currentUser = useMemo(() => {
    if (reduxUser && isAuthenticated) {
      return {
        id: reduxUser.id,
        name: reduxUser.fullName || reduxUser.username,
        username: reduxUser.username,
        role: reduxUser.role,
        email: reduxUser.email
      };
    }
    return null;
  }, [reduxUser, isAuthenticated]);

  useEffect(() => {
  if (!isAuthenticated && !authLoading) {
    dispatch(getOfficeCurrentUser());
  }
  }, [dispatch, isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/office/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ===== Action Creators =====
// ပြင်ရမည် (localDispatch သုံးပါ)
const actions = {
  setLoading: (isLoading) => localDispatch({ type: "SET_LOADING", payload: isLoading }),
  setTableLoading: (isLoading) => localDispatch({ type: "SET_TABLE_LOADING", payload: isLoading }),
  setError: (error) => {
    localDispatch({ type: "SET_ERROR", payload: error });
    setNetworkError(null);
  },
  clearError: () => localDispatch({ type: "CLEAR_ERROR" }),
  setSuccess: (isSuccess) => localDispatch({ type: "SET_SUCCESS", payload: isSuccess }),
  clearSuccess: () => localDispatch({ type: "CLEAR_SUCCESS" }),
  
  setActiveTab: (tab) => localDispatch({ type: "SET_ACTIVE_TAB", payload: tab }),
  setSearchQuery: (query) => localDispatch({ type: "SET_SEARCH_QUERY", payload: query }),
  setSearchField: (field) => localDispatch({ type: "SET_SEARCH_FIELD", payload: field }),
  
  setPagination: (pagination) => localDispatch({ type: "SET_PAGINATION", payload: pagination }),
  setLogPagination: (pagination) => localDispatch({ type: "SET_LOG_PAGINATION", payload: pagination }),
  
  setDateFilter: (dateFilter) => localDispatch({ type: "SET_DATE_FILTER", payload: dateFilter }),
  setLogFilter: (logFilter) => localDispatch({ type: "SET_LOG_FILTER", payload: logFilter }),
  
  fetchShops: (data) => localDispatch({ type: "FETCH_SHOPS", payload: data }),
  fetchLogs: (data) => localDispatch({ type: "FETCH_LOGS", payload: data }),
  
  addShop: (data) => localDispatch({ type: "ADD_SHOP", payload: data }),
  updateShop: (data) => localDispatch({ type: "UPDATE_SHOP", payload: data }),
  deleteShop: (data) => localDispatch({ type: "DELETE_SHOP", payload: data }),
  
  filterShops: () => localDispatch({ type: "FILTER_SHOPS" }),
  filterLogs: () => localDispatch({ type: "FILTER_LOGS" }),
  
  setSelectedLog: (log) => localDispatch({ type: "SET_SELECTED_LOG", payload: log }),
  clearFilters: () => localDispatch({ type: "CLEAR_FILTERS" })
};
  // ===== Form Validation =====
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    setValidationError(null);
    
    if (!shopForm.shopCode) {
      errors.shopCode = language === 'mm' ? "ဆိုင်ကုဒ် လိုအပ်ပါသည်" : "Shop code is required";
      isValid = false;
    } else if (shopForm.shopCode.length < 3) {
      errors.shopCode = language === 'mm' ? "အနည်းဆုံး ၃ လုံးရှိရပါမည်" : "At least 3 characters";
      isValid = false;
    }
    
    if (!shopForm.name) {
      errors.name = language === 'mm' ? "ဆိုင်အမည် လိုအပ်ပါသည်" : "Shop name is required";
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // ===== Retry Connection =====
  const retryConnection = () => {
    setNetworkError(null);
    actions.clearError();
    if (state.activeTab === 'history') {
      fetchLogs();
    } else {
      fetchShops();
    }
  };

  // ===== Format Change Details =====
  const formatChangeDetails = (log) => {
    if (!log.changes || log.changes.length === 0) {
      if (log.actionType === 'ADD') {
        return [
          language === 'mm' ? `ဆိုင်ကုဒ်: ${log.shopCode}` : `Shop Code: ${log.shopCode}`,
          language === 'mm' ? `ဆိုင်အမည်: ${log.shopName}` : `Shop Name: ${log.shopName}`,
          language === 'mm' ? `အမျိုးအစား: ${log.shopType || 'RETAIL'}` : `Type: ${log.shopType || 'RETAIL'}`,
          language === 'mm' ? `အခြေအနေ: အသုံးပြုနိုင်` : `Status: Active`,
          language === 'mm' 
            ? `ဖန်တီးသူ: ${log.createdByName || 'Unknown'} (${log.createdByRole || 'N/A'})` 
            : `Created by: ${log.createdByName || 'Unknown'} (${log.createdByRole || 'N/A'})`
        ];
      } else if (log.actionType === 'DELETE') {
        return [
          language === 'mm' ? `ဆိုင်ကုဒ်: ${log.shopCode}` : `Shop Code: ${log.shopCode}`,
          language === 'mm' ? `ဆိုင်အမည်: ${log.shopName}` : `Shop Name: ${log.shopName}`,
          language === 'mm' ? `ဆိုင် ID: #${log.shopId}` : `Shop ID: #${log.shopId}`,
          language === 'mm' ? 'အခြေအနေ: ဖျက်ပြီးပါပြီ' : 'Status: Deleted',
          language === 'mm' 
            ? `ဖျက်သူ: ${log.createdByName || 'Unknown'} (${log.createdByRole || 'N/A'})` 
            : `Deleted by: ${log.createdByName || 'Unknown'} (${log.createdByRole || 'N/A'})`
        ];
      }
    }
    return log.changes || [language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No changes recorded'];
  };

  // ===== Group Logs by Date =====
  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const dateKey = date.toLocaleDateString(language === 'mm' ? 'my' : 'en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    });
    return grouped;
  };

  const groupedLogs = useMemo(() => {
    if (!state.filteredLogs) return {};
    return groupLogsByDate(state.filteredLogs);
  }, [state.filteredLogs, language]);

  // ===== Data Fetching =====
  const fetchShops = useCallback(async (isInitialLoad = false) => {
  // ✅ loading state ကို သေချာသတ်မှတ်ပါ
  setTableLoading(true);
  setNetworkError(null);
  
  try {
    const params = {
      page: state.pagination.page,
      size: state.pagination.size,
      search: state.searchQuery || undefined,
      statusTab: state.activeTab
    };
    
    const response = await shopApi.getShops(params);
    if (response && response.success === true) {
      const responseData = response.data;
      
      actions.fetchShops({
        shops: responseData?.data || [],
        currentPage: responseData?.currentPage || 1,
        pageSize: responseData?.pageSize || state.pagination.size,
        totalItems: responseData?.totalItems || 0,
        totalPages: responseData?.totalPages || 1,
        statusCounts: responseData?.statusCounts || {},
        shopTypeCounts: responseData?.shopTypeCounts || {}
      });
      setPageInputValue(state.pagination.page.toString());
    } else {
      console.error("Shops response error:", response);
      actions.setError(response?.message || 'No data received');
      // ✅ Empty data သတ်မှတ်ပါ
      actions.fetchShops({
        shops: [],
        currentPage: 1,
        pageSize: state.pagination.size,
        totalItems: 0,
        totalPages: 1,
        statusCounts: {},
        shopTypeCounts: {}
      });
    }
  } catch (error) {
    console.error("Fetch shops error:", error);
    if (error.message?.includes('Network')) {
      setNetworkError(language === 'mm' ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ" : "Cannot connect to server");
    } else {
      actions.setError(error.message);
    }
  } finally {
    setTableLoading(false);
  }
}, [state.pagination.page, state.pagination.size, state.searchQuery, state.activeTab, language]);

  const fetchLogs = useCallback(async (isInitialLoad = false) => {
  setLoading(true);
  setNetworkError(null);
  
  try {
    const params = {
      page: state.logPagination.page,
      size: state.logPagination.size,
      actionType: state.logFilter,
      dateFilter: state.dateFilter.filter,
      fromDate: state.dateFilter.customFrom || undefined,
      toDate: state.dateFilter.customTo || undefined
    };
    
    const response = await shopLogsApi.getLogs(params);

    // ✅ Check response structure
    if (response && response.success === true) {
      const responseData = response.data;
      
      // ✅ Ensure logs is an array
      const logsArray = Array.isArray(responseData?.data) ? responseData.data : [];
      
      actions.fetchLogs({
        logs: logsArray,
        currentPage: responseData?.currentPage || 1,
        pageSize: responseData?.pageSize || state.logPagination.size,
        totalItems: responseData?.totalItems || 0,
        totalPages: responseData?.totalPages || 1,
        actionTypeCounts: responseData?.actionTypeCounts || {}
      });
      setHistoryPageInputValue(state.logPagination.page.toString());
    } else {
      console.error("Logs response error:", response);
      actions.setError(response?.message || 'No logs received');
      // ✅ Set empty logs on error
      actions.fetchLogs({
        logs: [],
        currentPage: 1,
        pageSize: state.logPagination.size,
        totalItems: 0,
        totalPages: 1,
        actionTypeCounts: {}
      });
    }
  } catch (error) {
    console.error("Fetch logs error:", error);
    if (error.message?.includes('Network')) {
      setNetworkError(language === 'mm' ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ" : "Cannot connect to server");
    } else {
      actions.setError(error.message);
    }
    // ✅ Set empty logs on error
    actions.fetchLogs({
      logs: [],
      currentPage: 1,
      pageSize: state.logPagination.size,
      totalItems: 0,
      totalPages: 1,
      actionTypeCounts: {}
    });
  } finally {
    setLoading(false);
  }
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter.filter, state.dateFilter.customFrom, state.dateFilter.customTo, language]);
 
  // ===== Initial Load =====
  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchShops(true),
        fetchLogs(true)
      ]).then(() => {
        isInitialMount.current = false;
      });
    }
  }, [currentUser]);

  // ===== Filter Effect =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    
    filterTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchShops();
    }, 500);
    
    return () => clearTimeout(filterTimeoutRef.current);
  }, [state.searchQuery, state.searchField]);

  // ===== Page Change Effect =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    fetchShops();
  }, [state.pagination.page, state.pagination.size]);

  // ===== Logs Filter Effect =====
  useEffect(() => {
    if (isInitialMount.current) return;
    fetchLogs();
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter]);

  // ===== Filter Shops Locally =====
  useEffect(() => {
    actions.filterShops();
  }, [state.searchQuery, state.searchField, state.activeTab, state.shops]);

  // ===== Filter Logs Locally =====
  useEffect(() => {
    actions.filterLogs();
  }, [state.logFilter, state.dateFilter, state.logs]);

  // ===== Tab Change Effect =====
  useEffect(() => {
    if (isInitialMount.current) return;
    if (state.activeTab === 'history') {
      actions.setLogPagination({ page: 1 });
      setHistoryPageInputValue("1");
      fetchLogs();
    } else {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchShops();
    }
  }, [state.activeTab]);

  // ===== Handlers =====
  const handleTabChange = (e) => {
    actions.setActiveTab(e.target.value);
  };

  const handleSearchChange = (e) => {
    actions.setSearchQuery(e.target.value);
  };

  const handleSearchFieldChange = (e) => {
    actions.setSearchField(e.target.value);
  };

  const clearSearch = () => {
    actions.setSearchQuery("");
  };

  // ===== Page change handlers =====
  const changePage = useCallback((newPage, direction) => {
    if (newPage === state.pagination.page || newPage < 1 || newPage > state.pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: newPage });
      setPageInputValue(newPage.toString());
      setLoadingDirection(null);
      if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
    }, 150);
  }, [state.pagination.page, state.pagination.totalPages]);

  const changeHistoryPage = useCallback((newPage, direction) => {
    if (newPage === state.logPagination.page || newPage < 1 || newPage > state.logPagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      actions.setLogPagination({ page: newPage });
      setHistoryPageInputValue(newPage.toString());
      setLoadingDirection(null);
      if (historyContainerRef.current) historyContainerRef.current.scrollTop = 0;
    }, 150);
  }, [state.logPagination.page, state.logPagination.totalPages]);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    actions.setPagination({ size: newSize, page: 1 });
    setPageInputValue("1");
  };

  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    actions.setLogPagination({ size: newSize, page: 1 });
    setHistoryPageInputValue("1");
  };

  // ===== Date Filter Handlers =====
  const handleDateFilterChange = (filter) => {
    actions.setDateFilter({ filter });
    actions.setLogPagination({ page: 1 });
    setHistoryPageInputValue("1");
    setShowDatePicker(filter === "custom");
    if (filter !== "custom") {
      actions.setDateFilter({ customFrom: "", customTo: "" });
    }
  };

  const handleCustomDateChange = (type, value) => {
    actions.setDateFilter({ [type]: value });
  };

  const clearDateFilter = () => {
    actions.setDateFilter({ filter: "all", customFrom: "", customTo: "" });
    setShowDatePicker(false);
    actions.setLogPagination({ page: 1 });
    setHistoryPageInputValue("1");
  };

  // ===== CRUD Handlers =====
  const handleAction = async (action, shopId) => {
    const shop = state.shopsMap.get(shopId);
    
    if (action === 'edit') {
      setShopForm({
        id: shop.id,
        shopCode: shop.shopCode,
        name: shop.name,
        shopType: shop.shopType,
        status: shop.status
      });
      setFormErrors({});
      setModalType("edit");
      setShowShopModal(true);
    } else if (action === 'delete') {
      if (window.confirm(language === 'mm' 
        ? `"${shop.name}" ဆိုင်ကို ဖျက်ရန် သေချာပါသလား?` 
        : `Are you sure you want to delete the shop "${shop.name}"?`)) {
        try {
          setLoading(true);
          const response = await shopApi.deleteShop(shopId);
          if (response.success) {
            actions.deleteShop({ shopId });
            actions.setSuccess(true);
            fetchLogs();
            fetchShops();
            setTimeout(() => actions.clearSuccess(), 3000);
          } else {
            actions.setError(response.message);
          }
        } catch (error) {
          if (error.message.includes('Network')) {
            setNetworkError(language === 'mm' ? "ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာရှိနေသည်။ ထပ်ကြိုးစားပါ။" : "Network error. Please try again.");
          } else {
            actions.setError(error.message);
          }
        } finally {
          setLoading(false);
        }
      }
    }
    // Note: 'view' action has been removed
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setShopForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleStatusChange = (status) => {
    setShopForm(prev => ({ ...prev, status }));
  };

  const resetForm = () => {
    setShopForm({
      id: null,
      shopCode: "",
      name: "",
      shopType: "RETAIL",
      status: "Active"
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    setModalType("add");
    resetForm();
    setShowShopModal(true);
  };

  // ===== CRUD Handlers အတွင်းက handleSaveShop ကို ဒီလိုပြင်ပါ =====
const handleSaveShop = async () => {
  if (!validateForm()) {
    setValidationError(language === 'mm' ? "ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ" : "Please fix the errors in the form");
    return;
  }

  try {
    setLoading(true);
    
    if (modalType === "add") {
      const response = await shopApi.createShop(shopForm);

      if (response && response.success) {
        // ✅ အောင်မြင်ကြောင်း message ပြရန်
        actions.setSuccess(true);
        
        // ✅ Modal ကိုပိတ်ပါ
        setShowShopModal(false);
        
        // ✅ Form ကို reset လုပ်ပါ
        resetForm();
        
        // ✅ Data ကို ချက်ချင်း refresh လုပ်ပါ
        await Promise.all([
          fetchShops(),
          fetchLogs()
        ]);
        
        // ✅ 3 စက္ကန့်အကြာမှ success message ဖျက်ပါ
        setTimeout(() => actions.clearSuccess(), 3000);
      } else {
        actions.setError(response?.message || (language === 'mm' ? 'ဆိုင်ဖန်တီးရာတွင် အမှားရှိသည်' : 'Failed to create shop'));
      }
    } else {
      // EDIT mode
      const response = await shopApi.updateShop(shopForm.id, shopForm);

      if (response && response.success) {
        actions.setSuccess(true);
        setShowShopModal(false);
        resetForm();
        await Promise.all([
          fetchShops(),
          fetchLogs()
        ]);
        setTimeout(() => actions.clearSuccess(), 3000);
      } else {
        actions.setError(response?.message || (language === 'mm' ? 'ဆိုင်ပြင်ဆင်ရာတွင် အမှားရှိသည်' : 'Failed to update shop'));
      }
    }
  } catch (error) {
    console.error("Save shop error:", error);
    if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
      setNetworkError(language === 'mm' 
        ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။" 
        : "Cannot connect to server. Please check your internet connection.");
    } else {
      actions.setError(error.message || (language === 'mm' ? 'အမှားတစ်ခုဖြစ်ပွားခဲ့သည်' : 'An error occurred'));
    }
  } finally {
    setLoading(false);
  }
};

  const showLogDetailModal = (log) => {
    const formattedLog = {
      ...log,
      createdByName: log.createdByName || log.createdBy || 'Unknown',
      createdByRole: log.createdByRole || 'N/A',
      formattedChanges: formatChangeDetails(log)
    };
    actions.setSelectedLog(formattedLog);
    setShowLogDetails(true);
  };

  // ===== Helper Functions =====
  const getShopTypeLabel = (typeValue) => {
    const type = state.dropdownData.shopTypes.find(t => t.value === typeValue);
    return type ? type.label : typeValue;
  };

  const getStatusLabel = (statusValue) => {
    return statusValue === 'Active' 
      ? (language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active')
      : (language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive');
  };

  const getActionIcon = (actionType) => {
    switch(actionType) {
      case "ADD": return "fa-plus-circle";
      case "EDIT": return "fa-edit";
      case "DELETE": return "fa-trash";
      default: return "fa-history";
    }
  };

  const getActionColor = (actionType) => {
    switch(actionType) {
      case "ADD": return "#10b981";
      case "EDIT": return "#f59e0b";
      case "DELETE": return "#ef4444";
      default: return "#6b7280";
    }
  };

  // ===== Branch Navigation Handler =====
  const openBranchPage = (shopId, shopName) => {
    navigate("/branch/management/page");
  };

  // ===== Loading Spinner Component =====
  const LoadingSpinner = ({ direction }) => {
    let message = "";
    if (direction === 'prev') message = language === 'mm' ? "ယခင်စာမျက်နှာကို ဖွင့်နေသည်..." : "Loading previous page...";
    else if (direction === 'next') message = language === 'mm' ? "နောက်စာမျက်နှာကို ဖွင့်နေသည်..." : "Loading next page...";
    else if (direction === 'jump') message = language === 'mm' ? "စာမျက်နှာသို့ သွားနေသည်..." : "Jumping to page...";
    else message = language === 'mm' ? "ဒေတာများ ရယူနေသည်..." : "Loading data...";
    
    return (
      <div className="shop-plan-loading-overlay">
        <div className="shop-plan-loading-spinner">
          <div className="shop-plan-spinner"></div>
          <div className="shop-plan-loading-message">{message}</div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="shop-container">
        <div className="loading-state" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginRight: '15px' }}></i>
          <p style={{ fontSize: '18px' }}>{language === 'mm' ? 'အသုံးပြုသူဒေတာ ဖွင့်နေသည်...' : 'Loading user data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      {/* Loading Spinner */}
      {/* {((state.activeTab === 'history' && loading) || 
        (state.activeTab !== 'history' && tableLoading)) && 
        <LoadingSpinner direction={loadingDirection} />} */}

      {/* Messages Container */}
      <div className="shop-messages-container">
        {state.success && (
          <div className="shop-message success">
            <i className="fas fa-check-circle"></i>
            <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={actions.clearSuccess}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {state.error && (
          <div className="shop-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{state.error}</span>
            <button onClick={actions.clearError}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {networkError && (
          <div className="shop-network-error">
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
      </div>

      <div className="shop-management-header">
        <div className="header-top-row">
          <NavLink to="/office/dashboard" className="shop-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်' : 'Back to Dashboard'}
          </NavLink>
          <div className="header-center-content">
            <h1><i className="fas fa-store-alt"></i> {language === 'mm' ? 'ဆိုင် စီမံခန့်ခွဲမှု' : 'Shop Management'}</h1>
            <p>{language === 'mm' ? 'ဆိုင်အားလုံး စီမံခန့်ခွဲရန်' : 'Manage all shops'}</p>
          </div>
        </div>
      </div>

      <div className="shop-tabs-header">
        <div className="shop-tabs-selector">
          <div className="shop-select-container">
            <i className={`fas ${
              state.activeTab === "all-shops" ? "fa-store" :
              state.activeTab === "active" ? "fa-check-circle" :
              state.activeTab === "unactive" ? "fa-times-circle" :
              "fa-history"
            } shop-select-icon`}></i>
            <select 
              className="shop-tab-select"
              value={state.activeTab}
              onChange={handleTabChange}
              disabled={loading || tableLoading}
            >
              <option value="all-shops">
                {language === 'mm' ? 'ဆိုင်အားလုံး' : 'All Shops'} ({state.summary.total?.toLocaleString() || 0})
              </option>
              <option value="active">
                {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'} ({state.statusCounts.Active?.toLocaleString() || 0})
              </option>
              <option value="unactive">
                {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'} ({state.statusCounts.Unactive?.toLocaleString() || 0})
              </option>
              <option value="history">
                {language === 'mm' ? 'မှတ်တမ်း' : 'History'} ({state.actionTypeCounts.all?.toLocaleString() || 0})
              </option>
            </select>
            <i className="fas fa-chevron-down shop-select-arrow"></i>
          </div>
        </div>
        
        {state.activeTab !== 'history' && (
          <>
            <div className="shop-search-controls">
              <div className="shop-search-input-group">
                <i className="fas fa-search shop-search-icon"></i>
                <input
                  type="text"
                  className="shop-search-input"
                  placeholder={language === 'mm' ? 'ဆိုင်ကုဒ်၊ အမည်၊ အမျိုးအစား ဖြင့်ရှာဖွေရန်...' : 'Search by shop code, name, email...'}
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                  disabled={tableLoading}
                />
                {state.searchQuery && (
                  <button 
                    className="shop-clear-search-btn" 
                    onClick={clearSearch} 
                    disabled={tableLoading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="user-account-filter-buttons">
                <select 
                  className="shop-search-select"
                  value={state.searchField}
                  onChange={handleSearchFieldChange}
                  disabled={tableLoading}
                >
                  <option value="all">{language === 'mm' ? 'အားလုံး' : 'All Fields'}</option>
                  <option value="shop_code">{language === 'mm' ? 'ဆိုင်ကုဒ်' : 'Shop Code'}</option>
                  <option value="name">{language === 'mm' ? 'ဆိုင်အမည်' : 'Shop Name'}</option>
                  <option value="shop_type">{language === 'mm' ? 'ဆိုင်အမျိုးအစား' : 'Shop Type'}</option>
                </select>
                
                {state.searchQuery && (
                  <button 
                    className="shop-clear-search-btn secondary"
                    onClick={clearSearch}
                    disabled={tableLoading}
                  >
                    <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            
            <button 
              className="shop-add-btn"
              onClick={openAddModal}
              disabled={tableLoading}
            >
              <i className="fas fa-plus"></i> {language === 'mm' ? 'ဆိုင်အသစ်ထည့်ရန်' : 'Add Shop'}
            </button>
          </>
        )}
      </div>
  
      <div className="subtab-content active">
        {state.activeTab === "history" ? (
          /* ===== HISTORY TAB ===== */
          <div className="shop-history-section">
            <div className="shop-section-title">
              <div className="shop-title-row">
                <div className="shop-title-left">
                  <i className="fas fa-history"></i> 
                  <span className="shop-title-text">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}
                  </span>
                </div>

                <div className="shop-title-center">
                  <div className="shop-compact-nav">
                    <button 
                      className={`shop-nav-btn ${loading ? 'loading' : ''}`} 
                      onClick={() => changeHistoryPage(state.logPagination.page - 1, 'prev')}
                      disabled={state.logPagination.page === 1 || loading}
                      title={language === 'mm' ? 'ယခင်စာမျက်နှာ' : 'Previous Page'}
                    >
                      {loading && loadingDirection === 'prev' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-left"></i>
                      )}
                    </button>
                    
                    <div className="shop-page-control">
                      <input 
                        type="text" 
                        className="shop-page-input" 
                        value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => {
                          const value = parseInt(historyPageInputValue);
                          if (!isNaN(value) && value >= 1 && value <= state.logPagination.totalPages && value !== state.logPagination.page) {
                            changeHistoryPage(value, 'jump');
                          } else {
                            setHistoryPageInputValue(state.logPagination.page.toString());
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={loading}
                      />
                      <span className="shop-page-total">
                        / {state.logPagination.totalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`shop-nav-btn ${loading ? 'loading' : ''}`} 
                      onClick={() => changeHistoryPage(state.logPagination.page + 1, 'next')}
                      disabled={state.logPagination.page === state.logPagination.totalPages || state.logPagination.totalPages === 0 || loading}
                      title={language === 'mm' ? 'နောက်စာမျက်နှာ' : 'Next Page'}
                    >
                      {loading && loadingDirection === 'next' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </button>
                    
                    <div className="shop-items-per-page">
                      <select 
                        className="shop-per-page-select" 
                        value={state.logPagination.size} 
                        onChange={handleLogPageSizeChange}
                        disabled={loading}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="shop-per-page-label">
                        {language === 'mm' ? '/စာမျက်နှာ' : '/pg'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shop-title-right">
                  {loading ? (
                    <span className="shop-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="shop-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                    </span>
                  ) : (
                    <span className="shop-showing-count">
                      <span className="shop-count-numbers">
                        {state.logPagination.total > 0 ? ((state.logPagination.page - 1) * state.logPagination.size) + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="shop-count-numbers">
                        {Math.min(state.logPagination.page * state.logPagination.size, state.logPagination.total)}
                      </span>
                      <span> / </span>
                      <span className="shop-count-numbers">
                        {state.logPagination.total.toLocaleString()}
                      </span>
                      <span className="shop-count-label">
                        {language === 'mm' ? 'ခု' : 'items'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="shop-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="shop-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button 
                    className={`shop-filter-tab ${state.logFilter === "all" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("all");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'အားလုံး' : 'All'} 
                    <span className="shop-filter-count">
                      ({state.actionTypeCounts.all?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.logFilter === "ADD" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("ADD");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-plus"></i> 
                    {language === 'mm' ? 'ပေါင်းထည့်ခြင်း' : 'Add'} <span className="shop-filter-count">
                      ({state.actionTypeCounts.ADD?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.logFilter === "EDIT" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("EDIT");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-edit"></i> 
                    {language === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Edit'} <span className="shop-filter-count">
                      ({state.actionTypeCounts.EDIT?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.logFilter === "DELETE" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("DELETE");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-trash"></i> 
                    {language === 'mm' ? 'ဖျက်ခြင်း' : 'Delete'} <span className="shop-filter-count">
                      ({state.actionTypeCounts.DELETE?.toLocaleString() || 0})
                    </span>
                  </button>
                </div>

                <div className="shop-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button 
                    className={`shop-filter-tab ${state.dateFilter.filter === "all" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("all")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'အချိန်အားလုံး' : 'All Time'}
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.dateFilter.filter === "today" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("today")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ယနေ့' : 'Today'}
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.dateFilter.filter === "yesterday" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("yesterday")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'မနေ့က' : 'Yesterday'}
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.dateFilter.filter === "thisWeek" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisWeek")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ဒီအပတ်' : 'This Week'}
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.dateFilter.filter === "thisMonth" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisMonth")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ဒီလ' : 'This Month'}
                  </button>
                  <button 
                    className={`shop-filter-tab ${state.dateFilter.filter === "custom" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("custom")}
                    disabled={loading}
                  >
                    <i className="fas fa-calendar"></i> {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
                  </button>
                  
                  {state.dateFilter.filter !== "all" && (
                    <button 
                      className="shop-filter-tab"
                      onClick={clearDateFilter}
                      style={{ backgroundColor: '#fef2f7', color: '#f72585' }}
                      disabled={loading}
                    >
                      <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {showDatePicker && (
                <div className="shop-custom-date-picker">
                  <div className="shop-date-picker-row">
                    <label>{language === 'mm' ? 'မှ' : 'From:'}</label>
                    <input
                      type="date"
                      className="shop-date-input"
                      value={state.dateFilter.customFrom}
                      onChange={(e) => handleCustomDateChange('customFrom', e.target.value)}
                    />
                  </div>
                  <div className="shop-date-picker-row">
                    <label>{language === 'mm' ? 'ထိ' : 'To:'}</label>
                    <input
                      type="date"
                      className="shop-date-input"
                      value={state.dateFilter.customTo}
                      onChange={(e) => handleCustomDateChange('customTo', e.target.value)}
                    />
                  </div>
                  <button 
                    className="shop-apply-date-btn"
                    onClick={() => {
                      if (state.dateFilter.customFrom && state.dateFilter.customTo) {
                        actions.setLogPagination({ page: 1 });
                        setHistoryPageInputValue("1");
                      }
                    }}
                    disabled={!state.dateFilter.customFrom || !state.dateFilter.customTo}
                  >
                    <i className="fas fa-check"></i> {language === 'mm' ? 'အတည်ပြုရန်' : 'Apply'}
                  </button>
                </div>
              )}
            </div>
            
            <div className="shop-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                  <p>{language === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p>
                </div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="shop-date-group">
                    <div className="shop-date-header">
                      <span className="shop-date-label">{date}</span>
                      <span className="shop-date-count">
                        {dateLogs.length} {language === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}
                      </span>
                    </div>
                    
                    <div className="cat-logs-list">
                      {dateLogs.map(log => (
                        <div 
                          key={log.id} 
                          className={`cat-compact-log-entry log-${log.actionType?.toLowerCase()}`}
                          onClick={() => showLogDetailModal(log)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="cat-log-icon" style={{ color: getActionColor(log.actionType) }}>
                            <i className={`fas ${getActionIcon(log.actionType)}`}></i>
                          </div>
                          <div className="cat-log-content">
                            <div className="cat-log-main-info">
                              <div>
                              <span className="cat-log-action">
                                {log.actionType === 'ADD' && (language === 'mm' ? 'ဆိုင်ဖန်တီးခြင်း' : 'Shop Created')}
                                {log.actionType === 'EDIT' && (language === 'mm' ? 'ဆိုင်ပြင်ဆင်ခြင်း' : 'Shop Updated')}
                                {log.actionType === 'DELETE' && (language === 'mm' ? 'ဆိုင်ဖျက်ခြင်း' : 'Shop Deleted')}
                              </span>
                              <span className="cat-log-category">
                                "{log.shopName}"
                                {log.shopId && <span className="shop-shop-id" style={{marginLeft:"8px"}}>#{log.shopId}</span>}
                              </span>
                              </div>
                            </div>
                            <div className="shop-log-details">
                              <span className="shop-log-user">
                                <i className="fas fa-user"></i> 
                                <strong>{log.createdByName || 'Unknown'}</strong>
                                <span className="shop-user-role">({log.createdByRole || 'N/A'})</span>
                              </span>
                              <span className="shop-log-time">
                                <i className="fas fa-clock"></i> {log.timestamp}
                              </span>
                              {log.changes && log.changes.length > 0 && (
                                <span className="shop-log-detail-count">
                                  <i className="fas fa-list"></i> {log.changes.length} {language === 'mm' ? 'ခု ပြောင်းလဲမှု' : 'changes'}
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
                  <p>{language === 'mm' 
                    ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် လုပ်ဆောင်ချက်များ မတွေ့ပါ။' 
                    : 'No activities found for the selected filter.'}</p>
                  {(state.dateFilter.filter !== "all" || state.logFilter !== "all") && (
                    <button 
                      className="shop-clear-search-btn secondary"
                      onClick={clearDateFilter}
                    >
                      {language === 'mm' ? 'စစ်ထုတ်မှုများ ရှင်းလင်းရန်' : 'Clear Filters'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== SHOPS TAB ===== */
          <>
            <div className="shop-section-title">
              <div className="shop-title-row">
                <div className="shop-title-left">
                  <i className="fas fa-store"></i> 
                  <span className="shop-title-text">
                    {state.activeTab === "all-shops" && (language === 'mm' ? 'ဆိုင်အားလုံး' : 'All Shops')}
                    {state.activeTab === "active" && (language === 'mm' ? 'အသုံးပြုနိုင်သောဆိုင်များ' : 'Active Shops')}
                    {state.activeTab === "unactive" && (language === 'mm' ? 'အသုံးမပြုနိုင်သောဆိုင်များ' : 'Unactive Shops')}
                  </span>
                </div>
                
                <div className="shop-title-center">
                  <div className="shop-compact-nav">
                    <button 
                      className={`shop-nav-btn ${tableLoading ? 'loading' : ''}`} 
                      onClick={() => changePage(state.pagination.page - 1, 'prev')}
                      disabled={state.pagination.page === 1 || tableLoading}
                      title={language === 'mm' ? 'ယခင်စာမျက်နှာ' : 'Previous Page'}
                    >
                      {tableLoading && loadingDirection === 'prev' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-left"></i>
                      )}
                    </button>
                    
                    <div className="shop-page-control">
                      <input 
                        type="text" 
                        className="shop-page-input" 
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => {
                          const value = parseInt(pageInputValue);
                          if (!isNaN(value) && value >= 1 && value <= state.pagination.totalPages && value !== state.pagination.page) {
                            changePage(value, 'jump');
                          } else {
                            setPageInputValue(state.pagination.page.toString());
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={tableLoading}
                      />
                      <span className="shop-page-total">
                        / {state.pagination.totalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`shop-nav-btn ${tableLoading ? 'loading' : ''}`} 
                      onClick={() => changePage(state.pagination.page + 1, 'next')}
                      disabled={state.pagination.page === state.pagination.totalPages || state.pagination.totalPages === 0 || tableLoading}
                      title={language === 'mm' ? 'နောက်စာမျက်နှာ' : 'Next Page'}
                    >
                      {tableLoading && loadingDirection === 'next' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </button>
                    
                    <div className="shop-items-per-page">
                      <select 
                        className="shop-per-page-select" 
                        value={state.pagination.size} 
                        onChange={handlePageSizeChange}
                        disabled={tableLoading}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="shop-per-page-label">
                        {language === 'mm' ? '/စာမျက်နှာ' : '/pg'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="shop-title-right">
                  {tableLoading ? (
                    <span className="shop-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="shop-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                    </span>
                  ) : (
                    <span className="shop-showing-count">
                      <span className="shop-count-numbers">
                        {state.pagination.total > 0 ? ((state.pagination.page - 1) * state.pagination.size) + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="shop-count-numbers">
                        {Math.min(state.pagination.page * state.pagination.size, state.pagination.total)}
                      </span>
                      <span> / </span>
                      <span className="shop-count-numbers">
                        {state.pagination.total.toLocaleString()}
                      </span>
                      <span className="shop-count-label">
                        {language === 'mm' ? 'ခု' : 'items'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              
              {state.searchQuery && (
                <div className="shop-search-badge-container">
                  <span className="shop-search-badge">
                    <i className="fas fa-search"></i> "{state.searchQuery}"
                    <button onClick={clearSearch} className="shop-clear-search-badge">
                      <i className="fas fa-times-circle"></i>
                    </button>
                  </span>
                </div>
              )}
            </div>
            
            <div className="shop-table-wrapper" ref={tableBodyRef}>
              <table className="shop-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{language === 'mm' ? 'ဆိုင်ကုဒ်' : 'Shop Code'}</th>
                    <th>{language === 'mm' ? 'ဆိုင်အမည်' : 'Shop Name'}</th>
                    <th>{language === 'mm' ? 'ဆိုင်အမျိုးအစား' : 'Shop Type'}</th>
                    <th>{language === 'mm' ? 'ဆိုင်ခွဲများ' : 'Branches'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr>
                      <td colSpan="8" className="shop-no-data">
                        <div className="shop-no-data-content">
                          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                          <p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading data...'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : state.filteredShops.length > 0 ? (
                    state.filteredShops.map((shop, index) => (
                      <tr key={shop.id}>
                        <td>{((state.pagination.page - 1) * state.pagination.size) + index + 1}</td>
                        <td>
                          <div>
                            <strong>{shop.shopCode}</strong>
                            <div className="shop-id">ID: #{shop.id}</div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{shop.name}</strong>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="shop-type-tag">{getShopTypeLabel(shop.shopType)}</span>
                              <div className="shop-address-info">
                                <span>
                                  {getShopTypeLabel(shop.shopType) === "Retail" ? "လက်လီ ဆိုင်များ" : 
                                  getShopTypeLabel(shop.shopType) === "Wholesale" ? "လက္ကား ဆိုင်များ" :
                                  getShopTypeLabel(shop.shopType) === "Service" ? "ဝန်ဆောင်မှုပေး ဆိုင်များ" :
                                  getShopTypeLabel(shop.shopType) === "Food & Beverage" ? "စားသောက် ဆိုင်များ" :
                                  getShopTypeLabel(shop.shopType) === "Fashion" ? "အဝတ်အထည်ရောင်း ဆိုင်များ" :
                                  getShopTypeLabel(shop.shopType) === "Electronics" ? "လျှပ်စစ်ပစ္စည်း ဆိုင်များ" :
                                  getShopTypeLabel(shop.shopType) === "Other" ? "အခြားသော ဆိုင်များ" : ""}
                                </span>
                              </div>
                          </div>
                        </td>
                        <td>
                        <button
                          className="branch-count-btn"
                          onClick={() => navigate(`/office/shop/${shop.id}/branches`)}   // ဒီလိုပြောင်း
                          title={language === 'mm' ? 'ဆိုင်ခွဲများ စီမံရန်' : 'Manage branches'}
                        >
                          <i className="fas fa-code-branch"></i> {shop.branchCount || 0}
                        </button>
                        </td>
                          <td>
                          <span className={`shop-status-badge ${shop.status === 'Active' ? 'status-active' : 'status-unactive'}`}>
                            {getStatusLabel(shop.status)}
                          </span>
                        </td>
                        <td>
                          <div className="shop-action-buttons">
                            {/* View button removed */}
                            <button className="shop-action-btn shop-action-edit" title={language === 'mm' ? 'ဆိုင်ပြင်ဆင်ရန်' : 'Edit Shop'} onClick={() => handleAction('edit', shop.id)} disabled={loading}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="shop-action-btn shop-action-delete" title={language === 'mm' ? 'ဆိုင်ဖျက်ရန်' : 'Delete Shop'} onClick={() => handleAction('delete', shop.id)} disabled={loading}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="shop-no-data">
                        <div className="shop-no-data-content">
                          <i className="fas fa-store-slash"></i>
                          <p>
                            {state.searchQuery 
                              ? (language === 'mm' ? `"${state.searchQuery}" အတွက် ဆိုင်များ မတွေ့ပါ` : `No shops found for "${state.searchQuery}"`)
                              : (language === 'mm' ? 'ဆိုင်များ မတွေ့ပါ' : 'No shops found')}
                          </p>
                          {state.searchQuery && (
                            <button className="shop-clear-search-btn secondary" onClick={clearSearch}>
                              {language === 'mm' ? 'ရှာဖွေမှု ရှင်းလင်းရန်' : 'Clear Search'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ===== Shop Modal (Add/Edit) ===== */}
      {showShopModal && currentUser && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-content">
            <div className="shop-modal-header">
              <h3>
                <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i> 
                {modalType === "add" 
                  ? (language === 'mm' ? 'ဆိုင်အသစ်ဖန်တီးရန်' : 'Register New Shop')
                  : (language === 'mm' ? 'ဆိုင်ပြင်ဆင်ရန်' : 'Edit Shop')}
              </h3>
              <button className="shop-modal-close" onClick={() => setShowShopModal(false)} disabled={loading}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="shop-modal-body">
              <div className="shop-current-user-banner">
                <i className="fas fa-user-circle"></i>
                <div>
                  <div className="shop-user-name">{currentUser.username}</div>
                  <div className="shop-user-role">{currentUser.role}</div>
                </div>
              </div>
              
              {validationError && (
                <div className="shop-validation-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{validationError}</span>
                </div>
              )}
              
              <div className="shop-form-group">
                <label className="shop-required">{language === 'mm' ? 'ဆိုင်ကုဒ်' : 'Shop Code'}</label>
                <input type="text" name="shopCode" value={shopForm.shopCode} onChange={handleFormChange} placeholder="SHOP001" maxLength="20" disabled={loading} className={formErrors.shopCode ? 'shop-input-error' : ''} />
                {formErrors.shopCode && <div className="shop-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.shopCode}</span></div>}
              </div>
              
              <div className="shop-form-group">
                <label className="shop-required">{language === 'mm' ? 'ဆိုင်အမည်' : 'Shop Name'}</label>
                <input type="text" name="name" value={shopForm.name} onChange={handleFormChange} placeholder={language === 'mm' ? 'ဆိုင်အမည်' : 'Shop name'} maxLength="100" disabled={loading} className={formErrors.name ? 'shop-input-error' : ''} />
                {formErrors.name && <div className="shop-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.name}</span></div>}
              </div>
              
              <div className="shop-form-group">
                <label>{language === 'mm' ? 'ဆိုင်အမျိုးအစား' : 'Shop Type'}</label>
                <select name="shopType" value={shopForm.shopType} onChange={handleFormChange} disabled={loading}>
                  {state.dropdownData.shopTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              
              <div className="shop-form-group">
                <label className="shop-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
                <div className="shop-status-select-group">
                  <div className={`shop-status-option ${shopForm.status === 'Active' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Active')}>
                    <input type="radio" name="status" value="Active" checked={shopForm.status === 'Active'} readOnly className="shop-status-radio" disabled={loading} />
                    <label className="shop-status-label"><i className="fas fa-check-circle"></i>{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}</label>
                  </div>
                  <div className={`shop-status-option ${shopForm.status === 'Unactive' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Unactive')}>
                    <input type="radio" name="status" value="Unactive" checked={shopForm.status === 'Unactive'} readOnly className="shop-status-radio" disabled={loading} />
                    <label className="shop-status-label"><i className="fas fa-times-circle"></i>{language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'}</label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="shop-modal-footer">
              <button className="shop-btn-cancel" onClick={() => setShowShopModal(false)} disabled={loading}>{language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}</button>
              <button className={`shop-btn-submit ${loading ? 'loading' : ''}`} onClick={handleSaveShop} disabled={!shopForm.shopCode.trim() || !shopForm.name.trim() || loading}>
                {loading ? (<><i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...'}</>) : (<><i className="fas fa-save"></i> {modalType === "add" ? (language === 'mm' ? 'ဆိုင်ဖန်တီးရန်' : 'Register Shop') : (language === 'mm' ? 'သိမ်းဆည်းရန်' : 'Save Changes')}</>)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Log Details Modal ===== */}
      {showLogDetails && state.selectedLog && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-content" style={{ maxWidth: '600px' }}>
            <div className="shop-modal-header">
              <h3><i className={`fas ${state.selectedLog.actionType === 'ADD' ? 'fa-plus-circle' : state.selectedLog.actionType === 'EDIT' ? 'fa-edit' : 'fa-trash'}`}></i> {language === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}</h3>
              <button className="shop-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="shop-modal-body">
              <div className="shop-log-detail-header">
                <div className="shop-log-detail-main">
                  <div className="shop-log-detail-action">
                    <span className={`shop-action-badge shop-action-${state.selectedLog.actionType?.toLowerCase()}`}>
                      {state.selectedLog.actionType === 'ADD' && <i className="fas fa-plus"></i>}
                      {state.selectedLog.actionType === 'EDIT' && <i className="fas fa-edit"></i>}
                      {state.selectedLog.actionType === 'DELETE' && <i className="fas fa-trash"></i>}
                      {state.selectedLog.actionType === 'ADD' && (language === 'mm' ? 'ဆိုင်ဖန်တီးခြင်း' : 'Shop Created')}
                      {state.selectedLog.actionType === 'EDIT' && (language === 'mm' ? 'ဆိုင်ပြင်ဆင်ခြင်း' : 'Shop Updated')}
                      {state.selectedLog.actionType === 'DELETE' && (language === 'mm' ? 'ဆိုင်ဖျက်ခြင်း' : 'Shop Deleted')}
                    </span>
                  </div>
                  {state.selectedLog.shopName && (
                    <div className="shop-log-detail-shop">
                      <i className="fas fa-store"></i>
                      <span className="shop-name">{state.selectedLog.shopName}</span>
                      {state.selectedLog.shopId && <span className="shop-id-detail">ID: #{state.selectedLog.shopId}</span>}
                    </div>
                  )}
                </div>
                <div className="shop-log-detail-meta">
                  <div className="shop-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="shop-user-name-detail"><strong>{state.selectedLog.createdByName || state.selectedLog.createdBy || 'Unknown'}</strong></div>
                      <div className="shop-user-role-detail">{state.selectedLog.createdByRole || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="shop-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="shop-log-date-detail">{state.selectedLog.date}</div>
                      <div className="shop-log-time-detail">{state.selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="shop-log-detail-content">
                <h4>{language === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {state.selectedLog.changes && state.selectedLog.changes.length > 0 ? (
                  <div className="shop-change-list">
                    {state.selectedLog.changes.map((detail, index) => (
                      <div key={index} className="shop-change-item"><i className="fas fa-chevron-right"></i><span>{detail}</span></div>
                    ))}
                  </div>
                ) : (
                  <div className="shop-no-changes"><i className="fas fa-info-circle"></i><span>{language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'}</span></div>
                )}
              </div>
            </div>
            <div className="shop-modal-footer">
              <button className="shop-btn-cancel" onClick={() => setShowLogDetails(false)}>{language === 'mm' ? 'ပိတ်ရန်' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopManagementPage;