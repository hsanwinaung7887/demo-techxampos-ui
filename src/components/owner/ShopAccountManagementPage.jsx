// 📁 src/components/office/office-components/ShopAccountManagementPage.jsx
import React, { useState, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { initialState, shopUserAccountReducer } from '../owner-useReducer/shopUserAccountReducer';
import { shopUserAccountApi, shopUserAccountLogsApi } from '../apis/shopUserAccountApi';
import { shopApi } from '../apis/shopApi';
import "../../light-style/office-css/shopAccountManagement.css";
import { useDispatch, useSelector } from 'react-redux';
import { getOfficeCurrentUser, clearOfficeAuth } from '../../redux/slices/officeAuthSlice';

const ShopAccountManagementPage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // Language
  const [language, setLanguage] = useState(() => localStorage.getItem('officeLanguage') || 'en');

  // Local UI States
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);
  const pageChangeTimeoutRef = useRef(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [state, dispatchReducer] = useReducer(shopUserAccountReducer, initialState);

  // Dropdown data – only shops (plans removed)
  const [shops, setShops] = useState([]);

  // Error States
  const [networkError, setNetworkError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  // Form state – planId and planCode removed
  const [accountForm, setAccountForm] = useState({
    id: null,
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phone: "",
    role: "SHOP_OWNER",
    status: "Active",
    shopId: null,
    shopCode: ""
    // ❌ planId, planCode removed
  });

  // Refs
  const filterTimeoutRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Current use

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

  // ✅ ထည့်ရန်
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

  // Fetch shops only (plans removed)
  useEffect(() => {
    const fetchShops = async () => {
      try {
        const shopsRes = await shopApi.getShops({ statusTab: 'active', size: 1000 });
        if (shopsRes && shopsRes.data) {
          // shopsRes.data က array ဖြစ်နေရင် အဲဒီအတိုင်းသုံး၊ object ဖြစ်နေရင် data property ကိုယူ
          const shopsArray = Array.isArray(shopsRes.data) ? shopsRes.data : (shopsRes.data?.data || []);
          setShops(shopsArray);
        } else if (Array.isArray(shopsRes)) {
          setShops(shopsRes);
        }
      } catch (err) {
        console.error("Failed to fetch shops", err);
      }
    };
    fetchShops();
  }, []);

  // Action creators (unchanged)
  const actions = {
  setLoading: (isLoading) => dispatchReducer({ type: "SET_LOADING", payload: isLoading }),
  setTableLoading: (isLoading) => dispatchReducer({ type: "SET_TABLE_LOADING", payload: isLoading }),
  setError: (error) => { dispatchReducer({ type: "SET_ERROR", payload: error }); setNetworkError(null); },
  clearError: () => dispatchReducer({ type: "CLEAR_ERROR" }),
  setSuccess: (isSuccess) => dispatchReducer({ type: "SET_SUCCESS", payload: isSuccess }),
  clearSuccess: () => dispatchReducer({ type: "CLEAR_SUCCESS" }),
  setActiveTab: (tab) => dispatchReducer({ type: "SET_ACTIVE_TAB", payload: tab }),
  setSearchQuery: (query) => dispatchReducer({ type: "SET_SEARCH_QUERY", payload: query }),
  setSearchField: (field) => dispatchReducer({ type: "SET_SEARCH_FIELD", payload: field }),
  setPagination: (pagination) => dispatchReducer({ type: "SET_PAGINATION", payload: pagination }),
  setLogPagination: (pagination) => dispatchReducer({ type: "SET_LOG_PAGINATION", payload: pagination }),
  setDateFilter: (dateFilter) => dispatchReducer({ type: "SET_DATE_FILTER", payload: dateFilter }),
  setLogFilter: (logFilter) => dispatchReducer({ type: "SET_LOG_FILTER", payload: logFilter }),
  fetchAccounts: (data) => dispatchReducer({ type: "FETCH_ACCOUNTS", payload: data }),
  fetchLogs: (data) => dispatchReducer({ type: "FETCH_LOGS", payload: data }),
  addAccount: (data) => dispatchReducer({ type: "ADD_ACCOUNT", payload: data }),
  updateAccount: (data) => dispatchReducer({ type: "UPDATE_ACCOUNT", payload: data }),
  deleteAccount: (data) => dispatchReducer({ type: "DELETE_ACCOUNT", payload: data }),
  filterAccounts: () => dispatchReducer({ type: "FILTER_ACCOUNTS" }),
  filterLogs: () => dispatchReducer({ type: "FILTER_LOGS" }),
  setSelectedLog: (log) => dispatchReducer({ type: "SET_SELECTED_LOG", payload: log }),
  clearFilters: () => dispatchReducer({ type: "CLEAR_FILTERS" })
  };

  // Validate form – plan validation removed
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    setValidationError(null);

    if (modalType === "add") {
      if (!accountForm.username) {
        errors.username = language === 'mm' ? "အသုံးပြုသူအမည် လိုအပ်ပါသည်" : "Username is required";
        isValid = false;
      }
      if (!accountForm.fullName) {
        errors.fullName = language === 'mm' ? "အမည်အပြည့်အစုံ လိုအပ်ပါသည်" : "Full name is required";
        isValid = false;
      }
      if (!accountForm.email) {
        errors.email = language === 'mm' ? "အီးမေးလ် လိုအပ်ပါသည်" : "Email is required";
        isValid = false;
      } else if (!/\S+@\S+\.\S+/.test(accountForm.email)) {
        errors.email = language === 'mm' ? "အီးမေးလ် မမှန်ကန်ပါ" : "Invalid email format";
        isValid = false;
      }
      if (!accountForm.shopId) {
        errors.shopId = language === 'mm' ? "ဆိုင်ရွေးချယ်ရန် လိုအပ်ပါသည်" : "Shop selection required";
        isValid = false;
      }
      if (!accountForm.password) {
        errors.password = language === 'mm' ? "စကားဝှက် လိုအပ်ပါသည်" : "Password is required";
        isValid = false;
      } else if (accountForm.password.length < 6) {
        errors.password = language === 'mm' ? "စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်" : "Password must be at least 6 characters";
        isValid = false;
      }
      if (accountForm.password !== accountForm.confirmPassword) {
        errors.confirmPassword = language === 'mm' ? "စကားဝှက် မတိုက်ဆိုင်ပါ" : "Passwords do not match";
        isValid = false;
      }
    }

    setFormErrors(errors);
    return isValid;
  };

  // Data fetching – unchanged
  const fetchAccounts = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) setTableLoading(true);
    else setTableLoading(true);
    setNetworkError(null);

    try {
      const params = {
        page: state.pagination.page,
        size: state.pagination.size,
        search: state.searchQuery || undefined,
        statusTab: state.activeTab
      };
      const response = await shopUserAccountApi.getAccounts(params);
      if (response) {
        actions.fetchAccounts({
          accounts: response.data || [],
          currentPage: response.currentPage || 1,
          pageSize: response.pageSize || state.pagination.size,
          totalItems: response.totalItems || 0,
          totalPages: response.totalPages || 1,
          statusCounts: response.statusCounts || {},
          roleCounts: response.roleCounts || {}
        });

        setPageInputValue(state.pagination.page.toString());
      } else {
        actions.setError(response.message);
      }
    } catch (error) {
      console.error("Fetch accounts error:", error);
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        setNetworkError(language === 'mm'
          ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။"
          : "Cannot connect to server. Please check your internet connection.");
      } else {
        actions.setError(error.message);
      }
    } finally {
      setTableLoading(false);
    }
  }, [state.pagination.page, state.pagination.size, state.searchQuery, state.activeTab, language]);

  const fetchLogs = useCallback(async (isInitialLoad = false) => {
  if (isInitialLoad) setLoading(true);
  else setLoading(true);
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
    
    const responseData = await shopUserAccountLogsApi.getLogs(params);
    
    // ✅ responseData က inner data ဖြစ်တယ် (data array, pagination, etc.)
    actions.fetchLogs({
      logs: responseData.data || [],
      currentPage: responseData.currentPage || 1,
      pageSize: responseData.pageSize || state.logPagination.size,
      totalItems: responseData.totalItems || 0,
      totalPages: responseData.totalPages || 1,
      actionTypeCounts: responseData.actionTypeCounts || {}
    });
    setHistoryPageInputValue(state.logPagination.page.toString());
    
  } catch (error) {
    console.error("Fetch logs error:", error);
    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      setNetworkError(language === 'mm'
        ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။"
        : "Cannot connect to server. Please check your internet connection.");
    } else {
      actions.setError(error.message);
    }
  } finally {
    setLoading(false);
  }
}, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter.filter, state.dateFilter.customFrom, state.dateFilter.customTo, language]);
 
// Initial load
  useEffect(() => {
    if (currentUser) {
      Promise.all([fetchAccounts(true), fetchLogs(true)]).then(() => {
        isInitialMount.current = false;
      });
    }
  }, [currentUser]);

  // Filter debounce
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchAccounts();
    }, 500);
    return () => clearTimeout(filterTimeoutRef.current);
  }, [state.searchQuery, state.searchField]);

  // Page change effect
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    fetchAccounts();
  }, [state.pagination.page, state.pagination.size]);

  // Logs filter effect
  useEffect(() => {
    if (isInitialMount.current) return;
    fetchLogs();
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter]);

  // Local filters
  useEffect(() => { actions.filterAccounts(); }, [state.searchQuery, state.searchField, state.activeTab, state.accounts]);
  useEffect(() => { actions.filterLogs(); }, [state.logFilter, state.dateFilter, state.logs]);

  // Tab change
  useEffect(() => {
    if (isInitialMount.current) return;
    if (state.activeTab === 'history') {
      actions.setLogPagination({ page: 1 });
      setHistoryPageInputValue("1");
      fetchLogs();
    } else {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchAccounts();
    }
  }, [state.activeTab]);

  // Handlers
  const handleTabChange = (e) => actions.setActiveTab(e.target.value);
  const handleSearchChange = (e) => actions.setSearchQuery(e.target.value);
  const handleSearchFieldChange = (e) => actions.setSearchField(e.target.value);
  const clearSearch = () => actions.setSearchQuery("");

  // Pagination
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

  // Date filters
  const handleDateFilterChange = (filter) => {
    actions.setDateFilter({ filter });
    actions.setLogPagination({ page: 1 });
    setHistoryPageInputValue("1");
    setShowDatePicker(filter === "custom");
    if (filter !== "custom") actions.setDateFilter({ customFrom: "", customTo: "" });
  };
  const handleCustomDateChange = (type, value) => actions.setDateFilter({ [type]: value });
  const clearDateFilter = () => {
    actions.setDateFilter({ filter: "all", customFrom: "", customTo: "" });
    setShowDatePicker(false);
    actions.setLogPagination({ page: 1 });
    setHistoryPageInputValue("1");
  };

  // CRUD handlers – planId removed from edit
  const handleAction = async (action, accountId) => {
  const account = state.accountsMap.get(accountId);
  if (!account) return;

  if (action === 'edit') {
    const shop = shops.find(s => s.id === account.shopId);
    setAccountForm({
      id: account.id,
      username: account.username,
      password: "",
      confirmPassword: "",
      fullName: account.fullName,
      email: account.email,
      phone: account.phone || "",
      role: account.role,
      status: account.status,
      shopId: account.shopId,
      shopCode: shop ? shop.shopCode : `ID: ${account.shopId}`
    });
    setFormErrors({});
    setModalType("edit");
    setShowAccountModal(true);
  }
  else if (action === 'delete') {
    if (window.confirm(language === 'mm'
      ? `"${account.username}" အကောင့်ကို ဖျက်ရန် သေချာပါသလား?`
      : `Are you sure you want to delete the account "${account.username}"?`)) {
      try {
        setLoading(true);
        
        // ✅ currentUser ရှိမှသာ လုပ်ပါ
        if (!currentUser) {
          actions.setError("User not authenticated");
          setLoading(false);
          return;
        }
        
        const response = await shopUserAccountApi.deleteAccount(accountId, currentUser);
        if (response && response.success === true) {
          actions.deleteAccount({ accountId });
          actions.setSuccess(true);
          await fetchAccounts();
          await fetchLogs();
          setTimeout(() => actions.clearSuccess(), 3000);
        } else {
          actions.setError(response?.message || "Delete failed");
        }
      } catch (error) {
        console.error("Delete error:", error);
        if (error.message?.includes('Network')) {
          setNetworkError(language === 'mm' ? "ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာ" : "Network error");
        } else {
          actions.setError(error.message || "Delete failed");
        }
      } finally {
        setLoading(false);
      }
    }
  }
};

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleStatusChange = (status) => {
    setAccountForm(prev => ({ ...prev, status }));
  };

  const resetForm = () => {
    setAccountForm({
      id: null,
      username: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      email: "",
      phone: "",
      role: "SHOP_OWNER",
      status: "Active",
      shopId: null,
      shopCode: ""
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    setModalType("add");
    resetForm();
    setShowAccountModal(true);
  };

  const handleSaveAccount = async () => {
  if (modalType === "add" && !validateForm()) {
    setValidationError(language === 'mm' ? "ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ" : "Please fix the errors in the form");
    return;
  }

  try {
    setLoading(true);
    
    // ✅ currentUser ရှိမှသာ လုပ်ပါ
    if (!currentUser) {
      actions.setError("User not authenticated");
      setLoading(false);
      return;
    }
    
    if (modalType === "add") {
      const accountData = { ...accountForm };
      delete accountData.confirmPassword;
      delete accountData.shopCode;

      if (!accountData.shopId) {
        throw new Error(language === 'mm' ? "ဆိုင်ရွေးချယ်ရန် လိုအပ်ပါသည်" : "Shop selection is required");
      }

      // ✅ currentUser ကို ထည့်ပို့ပါ
      const response = await shopUserAccountApi.createAccount(accountData, currentUser);

      if (response && response.id) {
        actions.addAccount({ account: response });
        actions.setSuccess(true);
        setShowAccountModal(false);
        resetForm();
        await Promise.all([fetchLogs(), fetchAccounts()]);
        setTimeout(() => actions.clearSuccess(), 3000);
      } else {
        actions.setError(response?.message || "Failed to create account");
      }
    } else {
      const updateData = {
        username: accountForm.username,
        fullName: accountForm.fullName,
        email: accountForm.email,
        phone: accountForm.phone,
        role: accountForm.role,
        status: accountForm.status,
        shopId: accountForm.shopId
      };
      
      if (accountForm.password && accountForm.password.trim() !== "") {
        if (accountForm.password !== accountForm.confirmPassword) {
          throw new Error(language === 'mm' ? "စကားဝှက် မတိုက်ဆိုင်ပါ" : "Passwords do not match");
        }
        if (accountForm.password.length < 6) {
          throw new Error(language === 'mm' ? "စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်" : "Password must be at least 6 characters");
        }
        updateData.password = accountForm.password;
      }
      
      // ✅ currentUser ကို ထည့်ပို့ပါ
      const response = await shopUserAccountApi.updateAccount(accountForm.id, updateData, currentUser);

      if (response && response.id) {
        actions.updateAccount({ account: response });
        actions.setSuccess(true);
        setShowAccountModal(false);
        resetForm();
        await Promise.all([fetchLogs(), fetchAccounts()]);
        setTimeout(() => actions.clearSuccess(), 3000);
      } else {
        actions.setError(response?.message || "Failed to update account");
      }
    }
  } catch (error) {
    console.error("Save account error:", error);
    if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
      setNetworkError(language === 'mm'
        ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။"
        : "Cannot connect to server. Please check your internet connection.");
    } else {
      actions.setError(error.message);
    }
  } finally {
    setLoading(false);
  }
};

  const showLogDetailModal = (log) => {
    actions.setSelectedLog(log);
    setShowLogDetails(true);
  };

  // Helper functions
  const getRoleLabel = (roleValue) => {
    const role = state.dropdownData.roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getStatusLabel = (status) => {
    const map = {
      'Active': language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active',
      'Unactive': language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive',
      'Pending': language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending'
    };
    return map[status] || status;
  };

  const getShopDisplay = (shopId) => {
    const shop = shops.find(s => s.id === shopId);
    return shop ? `${shop.shopCode} - ${shop.name}` : `ID: ${shopId}`;
  };

  // Functions for log icons and colors
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

  // Group logs by date
  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const dateKey = date.toLocaleDateString(language === 'mm' ? 'my' : 'en-US', {
        month: 'short', day: 'numeric', year: 'numeric'
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

  // Loading Spinner
  const LoadingSpinner = ({ direction }) => {
    let message = "";
    if (direction === 'prev') message = language === 'mm' ? "ယခင်စာမျက်နှာကို ဖွင့်နေသည်..." : "Loading previous page...";
    else if (direction === 'next') message = language === 'mm' ? "နောက်စာမျက်နှာကို ဖွင့်နေသည်..." : "Loading next page...";
    else if (direction === 'jump') message = language === 'mm' ? "စာမျက်နှာသို့ သွားနေသည်..." : "Jumping to page...";
    else message = language === 'mm' ? "ဒေတာများ ရယူနေသည်..." : "Loading data...";

    return (
      <div className="cat-loading-overlay">
        <div className="cat-loading-spinner">
          <div className="cat-spinner"></div>
          <div className="cat-loading-message">{message}</div>
          <div className="cat-loading-submessage">{language === 'mm' ? 'ခဏစောင့်ပါ...' : 'Please wait...'}</div>
        </div>
      </div>
    );
  };

  if (!currentUser) {
    return (
      <div className="cat-container shop-account-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{language === 'mm' ? 'အသုံးပြုသူဒေတာ ဖွင့်နေသည်...' : 'Loading user data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-container shop-account-container">
      {/* Loading Overlay */}
      {((state.activeTab === 'history' && loading) || (state.activeTab !== 'history' && tableLoading)) &&
        <LoadingSpinner direction={loadingDirection} />}

      {/* Messages */}
      <div className="cat-messages-container">
        {state.success && (
          <div className="cat-message success">
            <i className="fas fa-check-circle"></i>
            <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={actions.clearSuccess}><i className="fas fa-times"></i></button>
          </div>
        )}
        {state.error && (
          <div className="cat-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{state.error}</span>
            <button onClick={actions.clearError}><i className="fas fa-times"></i></button>
          </div>
        )}
        {networkError && (
          <div className="cat-network-error">
            <i className="fas fa-wifi-slash"></i>
            <div className="error-content">
              <div className="error-title">{language === 'mm' ? 'ချိတ်ဆက်မှုအမှား' : 'Connection Error'}</div>
              <div className="error-message">{networkError}</div>
            </div>
            <button onClick={() => { setNetworkError(null); fetchAccounts(); fetchLogs(); }}>
              <i className="fas fa-sync-alt"></i> {language === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="shop-management-header">
        <div className="header-top-row">
          <NavLink to="/office/dashboard" className="user-account-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်' : 'Back to Dashboard'}
          </NavLink>
          <div className="header-center-content">
            <h1><i className="fas fa-user-circle"></i> {language === 'mm' ? 'ဆိုင်အကောင့် စီမံခန့်ခွဲမှု' : 'Shop Account Management'}</h1>
            <p>{language === 'mm' ? 'အကောင့်များ စီမံခန့်ခွဲရန်' : 'Manage all user accounts'}</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="cat-tabs-header">
        <div className="user-account-tabs-selector cat-tabs-selector">
          <div className="cat-select-container">
            <i className={`fas ${state.activeTab === 'all-accounts' ? 'fa-users' : state.activeTab === 'active' ? 'fa-check-circle' : state.activeTab === 'unactive' ? 'fa-times-circle' : state.activeTab === 'pending' ? 'fa-clock' : 'fa-history'} cat-select-icon`}></i>
            <select className="cat-tab-select" value={state.activeTab} onChange={handleTabChange} disabled={loading || tableLoading}>
              <option value="all-accounts">{language === 'mm' ? 'အကောင့်အားလုံး' : 'All Accounts'} ({state.summary.total})</option>
              <option value="active">{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'} ({state.statusCounts.Active || 0})</option>
              <option value="unactive">{language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'} ({state.statusCounts.Unactive || 0})</option>
              <option value="pending">{language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending'} ({state.statusCounts.Pending || 0})</option>
              <option value="history">{language === 'mm' ? 'မှတ်တမ်း' : 'History'} ({state.actionTypeCounts.all || 0})</option>
            </select>
            <i className="fas fa-chevron-down cat-select-arrow"></i>
          </div>
        </div>

        {state.activeTab !== 'history' && (
          <>
            <div className="cat-search-controls">
              <div className="cat-search-input-group">
                <i className="fas fa-search cat-search-icon"></i>
                <input
                  type="text"
                  className="cat-search-input"
                  placeholder={language === 'mm' ? 'အကောင့်များ ရှာဖွေရန်...' : 'Search accounts...'}
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                  disabled={tableLoading}
                />
                {state.searchQuery && (
                  <button className="cat-clear-search-btn" onClick={clearSearch} disabled={tableLoading}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="user-account-filter-buttons">
                <select className="cat-search-select" value={state.searchField} onChange={handleSearchFieldChange} disabled={tableLoading}>
                  <option value="all">{language === 'mm' ? 'အားလုံး' : 'All Fields'}</option>
                  <option value="username">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</option>
                  <option value="fullName">{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</option>
                  <option value="email">Email</option>
                  <option value="phone">{language === 'mm' ? 'ဖုန်း' : 'Phone'}</option>
                  <option value="role">{language === 'mm' ? 'ရာထူး' : 'Role'}</option>
                  <option value="shopCode">{language === 'mm' ? 'ဆိုင်ကုဒ်' : 'Shop Code'}</option>
                </select>
                {state.searchQuery && (
                  <button className="cat-clear-search-btn secondary" onClick={clearSearch} disabled={tableLoading}>
                    <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            <button className="cat-add-btn" onClick={openAddModal} disabled={tableLoading}>
              <i className="fas fa-plus"></i> {language === 'mm' ? 'အကောင့်အသစ်ဖန်တီးရန်' : 'Create Account'}
            </button>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="subtab-content active">
        {state.activeTab === "history" ? (
          /* HISTORY TAB – unchanged (no plan fields) */
          <div className="cat-history-section">
            <div className="cat-section-title">
              <div className="cat-title-row">
                <div className="cat-title-left">
                  <i className="fas fa-history"></i>
                  <span className="cat-title-text">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}
                  </span>
                </div>

                {/* Center - History Pagination */}
                <div className="cat-title-center">
                  <div className="cat-compact-nav">
                    <button
                      className={`cat-nav-btn ${loading ? 'loading' : ''}`}
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

                    <div className="cat-page-control">
                      <input
                        type="text"
                        className="cat-page-input"
                        value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(historyPageInputValue);
                          if (!isNaN(val) && val >= 1 && val <= state.logPagination.totalPages && val !== state.logPagination.page) {
                            changeHistoryPage(val, 'jump');
                          } else {
                            setHistoryPageInputValue(state.logPagination.page.toString());
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={loading}
                      />
                      <span className="cat-page-total">
                        / {state.logPagination.totalPages.toLocaleString()}
                      </span>
                    </div>

                    <button
                      className={`cat-nav-btn ${loading ? 'loading' : ''}`}
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

                    <div className="cat-items-per-page">
                      <select
                        className="cat-per-page-select"
                        value={state.logPagination.size}
                        onChange={handleLogPageSizeChange}
                        disabled={loading}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="cat-per-page-label">
                        {language === 'mm' ? '/စာမျက်နှာ' : '/pg'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Showing count */}
                <div className="cat-title-right">
                  {loading ? (
                    <span className="cat-loading-text">
                      <i className="fas fa-spinner fa-spin"></i>
                      <span className="cat-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                    </span>
                  ) : (
                    <span className="cat-showing-count">
                      <span className="cat-count-numbers">
                        {state.logPagination.total > 0 ? ((state.logPagination.page - 1) * state.logPagination.size) + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="cat-count-numbers">
                        {Math.min(state.logPagination.page * state.logPagination.size, state.logPagination.total)}
                      </span>
                      <span> / </span>
                      <span className="cat-count-numbers">
                        {state.logPagination.total.toLocaleString()}
                      </span>
                      <span className="cat-count-label">
                        {language === 'mm' ? 'ခု' : 'items'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Log Filters & Date Filters */}
            <div className="cat-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                {/* Action Filter Tabs */}
                <div className="cat-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button
                    className={`cat-filter-tab ${state.logFilter === "all" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("all"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'အားလုံး' : 'All'}
                    <span className="cat-filter-count">({state.actionTypeCounts.all?.toLocaleString() || 0})</span>
                  </button>
                  <button
                    className={`cat-filter-tab ${state.logFilter === "ADD" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("ADD"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}
                  >
                    <i className="fas fa-plus"></i>
                    {language === 'mm' ? 'ပေါင်းထည့်ခြင်း' : 'Add'}
                    <span className="cat-filter-count">({state.actionTypeCounts.ADD?.toLocaleString() || 0})</span>
                  </button>
                  <button
                    className={`cat-filter-tab ${state.logFilter === "EDIT" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("EDIT"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}
                  >
                    <i className="fas fa-edit"></i>
                    {language === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Edit'}
                    <span className="cat-filter-count">({state.actionTypeCounts.EDIT?.toLocaleString() || 0})</span>
                  </button>
                  <button
                    className={`cat-filter-tab ${state.logFilter === "DELETE" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("DELETE"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}
                  >
                    <i className="fas fa-trash"></i>
                    {language === 'mm' ? 'ဖျက်ခြင်း' : 'Delete'}
                    <span className="cat-filter-count">({state.actionTypeCounts.DELETE?.toLocaleString() || 0})</span>
                  </button>
                </div>

                {/* Date Filter Tabs */}
                <div className="cat-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button
                    className={`cat-filter-tab ${state.dateFilter.filter === "all" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("all")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'အချိန်အားလုံး' : 'All Time'}
                  </button>
                  <button
                    className={`cat-filter-tab ${state.dateFilter.filter === "today" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("today")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ယနေ့' : 'Today'}
                  </button>
                  <button
                    className={`cat-filter-tab ${state.dateFilter.filter === "yesterday" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("yesterday")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'မနေ့က' : 'Yesterday'}
                  </button>
                  <button
                    className={`cat-filter-tab ${state.dateFilter.filter === "thisWeek" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisWeek")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ဒီအပတ်' : 'This Week'}
                  </button>
                  <button
                    className={`cat-filter-tab ${state.dateFilter.filter === "thisMonth" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisMonth")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ဒီလ' : 'This Month'}
                  </button>
                  <button
                    className={`cat-filter-tab ${state.dateFilter.filter === "custom" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("custom")}
                    disabled={loading}
                  >
                    <i className="fas fa-calendar"></i> {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
                  </button>

                  {state.dateFilter.filter !== "all" && (
                    <button
                      className="cat-filter-tab"
                      onClick={clearDateFilter}
                      style={{ backgroundColor: '#fef2f7', color: '#f72585' }}
                      disabled={loading}
                    >
                      <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Date Picker */}
              {showDatePicker && (
                <div className="cat-custom-date-picker">
                  <div className="cat-date-picker-row">
                    <label>{language === 'mm' ? 'မှ' : 'From:'}</label>
                    <input
                      type="date"
                      className="cat-date-input"
                      value={state.dateFilter.customFrom}
                      onChange={(e) => handleCustomDateChange('customFrom', e.target.value)}
                    />
                  </div>
                  <div className="cat-date-picker-row">
                    <label>{language === 'mm' ? 'ထိ' : 'To:'}</label>
                    <input
                      type="date"
                      className="cat-date-input"
                      value={state.dateFilter.customTo}
                      onChange={(e) => handleCustomDateChange('customTo', e.target.value)}
                    />
                  </div>
                  <button
                    className="cat-apply-date-btn"
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

            {/* Compact Logs Container */}
            <div className="cat-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                  <p>{language === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p>
                </div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="cat-date-group">
                    <div className="cat-date-header">
                      <span className="cat-date-label">{date}</span>
                      <span className="cat-date-count">
                        {dateLogs.length} {language === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}
                      </span>
                    </div>
                    <div className="prod-logs-list">
                    {dateLogs.map(log => (
                      <div key={log.id} className={`cat-compact-log-entry log-${log.actionType?.toLowerCase()}`} onClick={() => showLogDetailModal(log)} style={{ cursor: 'pointer' }}>
                        <div className="cat-log-icon" style={{ color: getActionColor(log.actionType) }}><i className={`fas ${getActionIcon(log.actionType)}`}></i> </div>
                        <div className="cat-log-content">
                          <div className="cat-log-main-info">
                            <div>
                            <span className="cat-log-action">
                              {log.actionType === 'ADD' && (language === 'mm' ? 'အကောင့်ဖန်တီးခြင်း' : 'Account Created')}
                              {log.actionType === 'EDIT' && (language === 'mm' ? 'အကောင့်ပြင်ဆင်ခြင်း' : 'Account Updated')}
                              {log.actionType === 'DELETE' && (language === 'mm' ? 'အကောင့်ဖျက်ခြင်း' : 'Account Deleted')}
                            </span>
                            <span className="cat-log-category" style={{marginLeft:"8px"}}> "{log.username}" {log.accountId && <span className="cat-category-id">#{log.accountId}</span>}</span>
                            </div>
                            </div>
                            <div className="prod-log-details">
                            <span className="cat-log-user"> <i className="fas fa-user"></i> <strong>{log.createdByName || 'Unknown'}</strong> <span className="cat-user-role">({log.createdByRole || 'N/A'})</span></span>
                            <span className="cat-log-time"> <i className="fas fa-clock"></i> {log.timestamp} </span>
                            {log.changes && log.changes.length > 0 && (<span className="cat-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} {language === 'mm' ? 'ခု ပြောင်းလဲမှု' : 'changes'}</span>)}
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
                  <p>
                    {language === 'mm'
                      ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် လုပ်ဆောင်ချက်များ မတွေ့ပါ။'
                      : 'No activities found for the selected filter.'}
                  </p>
                  {(state.dateFilter.filter !== "all" || state.logFilter !== "all") && (
                    <button className="cat-clear-search-btn secondary" onClick={clearDateFilter}>
                      {language === 'mm' ? 'စစ်ထုတ်မှုများ ရှင်းလင်းရန်' : 'Clear Filters'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ACCOUNTS TAB – plan column removed */
          <>
            <div className="cat-section-title">
              <div className="cat-title-row">
                <div className="cat-title-left">
                  <i className="fas fa-user-circle"></i>
                  <span className="cat-title-text">
                    {state.activeTab === "all-accounts" && (language === 'mm' ? 'အကောင့်အားလုံး' : 'All Accounts')}
                    {state.activeTab === "active" && (language === 'mm' ? 'အသုံးပြုနိုင်သော အကောင့်များ' : 'Active Accounts')}
                    {state.activeTab === "unactive" && (language === 'mm' ? 'အသုံးမပြုနိုင်သော အကောင့်များ' : 'Unactive Accounts')}
                    {state.activeTab === "pending" && (language === 'mm' ? 'ဆိုင်းငံ့ဆဲ အကောင့်များ' : 'Pending Accounts')}
                  </span>
                </div>

                <div className="cat-title-center">
                  <div className="cat-compact-nav">
                    <button className={`cat-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(state.pagination.page - 1, 'prev')} disabled={state.pagination.page === 1 || tableLoading}>
                      {tableLoading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="cat-page-control">
                      <input type="text" className="cat-page-input" value={pageInputValue} onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => { const val = parseInt(pageInputValue); if (!isNaN(val) && val >=1 && val <= state.pagination.totalPages && val !== state.pagination.page) changePage(val, 'jump'); else setPageInputValue(state.pagination.page.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={tableLoading} />
                      <span className="cat-page-total">/ {state.pagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`cat-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(state.pagination.page + 1, 'next')} disabled={state.pagination.page === state.pagination.totalPages || state.pagination.totalPages === 0 || tableLoading}>
                      {tableLoading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="cat-items-per-page">
                      <select className="cat-per-page-select" value={state.pagination.size} onChange={handlePageSizeChange} disabled={tableLoading}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="cat-per-page-label">{language === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>

                <div className="cat-title-right">
                  {tableLoading ? (
                    <span className="cat-loading-text"><i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                  ) : (
                    <span className="cat-showing-count">
                      <span className="cat-count-numbers">{state.pagination.total > 0 ? ((state.pagination.page-1)*state.pagination.size)+1 : 0}</span>
                      <span> - </span>
                      <span className="cat-count-numbers">{Math.min(state.pagination.page * state.pagination.size, state.pagination.total)}</span>
                      <span> / </span>
                      <span className="cat-count-numbers">{state.pagination.total.toLocaleString()}</span>
                      <span className="cat-count-label">{language === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
              {state.searchQuery && (
                <div className="cat-search-badge-container">
                  <span className="cat-search-badge"><i className="fas fa-search"></i> "{state.searchQuery}"<button onClick={clearSearch} className="cat-clear-search-badge"><i className="fas fa-times-circle"></i></button></span>
                </div>
              )}
            </div>

            <div className="cat-table-wrapper" ref={tableBodyRef}>
              <table className="cat-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{language === 'mm' ? 'ဆိုင်' : 'Shop'}</th>
                    <th>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</th>
                    <th>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</th>
                    <th>{language === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact'}</th>
                    <th>{language === 'mm' ? 'ရာထူး' : 'Role'}</th>
                    {/* ❌ Plan column removed */}
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="8" className="cat-no-data"><div className="cat-no-data-content"><i className="fas fa-spinner fa-spin"></i><p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading data...'}</p></div></td></tr>
                  ) : state.filteredAccounts.length > 0 ? (
                    state.filteredAccounts.map((acc, index) => (
                      <tr key={acc.id}>
                        <td>{((state.pagination.page-1)*state.pagination.size)+index+1}</td>
                        <td>
                          <div className="user-account-shop-code-cell">
                            <span className="user-account-shop-code-badge">{acc.shopCode || getShopDisplay(acc.shopId)}</span>
                            {acc.shopId && <div className="user-account-shop-id">ID: #{acc.shopId}</div>}
                          </div>
                        </td>
                        <td>
                          <div><strong>{acc.username}</strong>{acc.createdAt && <div className="user-account-created"><i className="far fa-clock"></i> {new Date(acc.createdAt).toLocaleDateString()}</div>}</div>
                        </td>
                        <td><div><strong>{acc.fullName}</strong></div></td>
                        <td>
                          <div className="user-account-contact-cell">
                            <div className="user-account-contact-item"><i className="fas fa-envelope user-account-contact-icon"></i><span className="user-account-contact-text">{acc.email}</span></div>
                            {acc.phone && <div className="user-account-contact-item"><i className="fas fa-phone user-account-contact-icon"></i><span className="user-account-contact-text">{acc.phone}</span></div>}
                          </div>
                        </td>
                        <td>
                          <div className="user-account-role-cell">
                            <span className={`user-account-role-badge role-${acc.role?.toLowerCase().replace('_', '-')}`}>{getRoleLabel(acc.role)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="user-account-status-cell">
                            <span className={`cat-status-badge ${acc.status === 'Active' ? 'cat-status-active' : acc.status === 'Unactive' ? 'cat-status-inactive' : 'cat-status-pending'}`}>
                              {getStatusLabel(acc.status)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="cat-action-buttons">
                            <button className="cat-action-btn cat-action-edit" title={language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit'} onClick={() => handleAction('edit', acc.id)} disabled={loading}><i className="fas fa-edit"></i></button>
                            <button className="cat-action-btn cat-action-delete" title={language === 'mm' ? 'ဖျက်ရန်' : 'Delete'} onClick={() => handleAction('delete', acc.id)} disabled={loading}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="8" className="cat-no-data"><div className="cat-no-data-content"><i className="fas fa-user-slash"></i><p>{language === 'mm' ? 'အကောင့်များ မတွေ့ပါ' : 'No accounts found'}</p>{state.searchQuery && <button className="cat-clear-search-btn secondary" onClick={clearSearch}>{language === 'mm' ? 'ရှာဖွေမှု ရှင်းလင်းရန်' : 'Clear Search'}</button>}</div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Account Modal (Add/Edit) – plan fields removed */}
      {showAccountModal && (
        <div className="cat-modal-overlay">
          <div className="cat-modal-content" style={{ maxWidth: '600px' }}>
            <div className="cat-modal-header">
              <h3>
                <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i>
                {modalType === "add"
                  ? (language === 'mm' ? 'အကောင့်အသစ်ဖန်တီးရန်' : 'Create New Account')
                  : (language === 'mm' ? 'အကောင့်အခြေအနေပြောင်းလဲရန်' : 'Change Account Status')}
              </h3>
              <button className="cat-modal-close" onClick={() => setShowAccountModal(false)} disabled={loading}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="cat-modal-body">
              {currentUser && (
                <div className="cat-current-user-banner">
                  <i className="fas fa-user-circle"></i>
                  <div><div className="cat-user-name">{currentUser.name}</div><div className="cat-user-role">{currentUser.role}</div></div>
                </div>
              )}
              {validationError && (
                <div className="cat-validation-error"><i className="fas fa-exclamation-circle"></i><span>{validationError}</span></div>
              )}

              {modalType === "add" ? (
                /* Add Mode – full form without plan */
                <>
                  <div className="cat-form-group" style={{ marginBottom: '20px' }}>
                    <label className="cat-required">{language === 'mm' ? 'ဆိုင်' : 'Shop'}</label>
                    <select name="shopId" value={accountForm.shopId || ''} onChange={handleFormChange} disabled={loading} className={formErrors.shopId ? 'cat-input-error' : ''}>
                      <option value="">{language === 'mm' ? 'ဆိုင်ရွေးချယ်ပါ' : 'Select Shop'}</option>
                      {shops.map(shop => <option key={shop.id} value={shop.id}>{shop.shopCode} - {shop.name}</option>)}
                    </select>
                    {formErrors.shopId && <div className="cat-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.shopId}</span></div>}
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label className="cat-required">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                      <input type="text" name="username" value={accountForm.username} onChange={handleFormChange} disabled={loading} className={formErrors.username ? 'cat-input-error' : ''} />
                      {formErrors.username && <div className="cat-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.username}</span></div>}
                    </div>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label className="cat-required">{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                      <input type="text" name="fullName" value={accountForm.fullName} onChange={handleFormChange} disabled={loading} className={formErrors.fullName ? 'cat-input-error' : ''} />
                      {formErrors.fullName && <div className="cat-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.fullName}</span></div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label className="cat-required">Email</label>
                      <input type="email" name="email" value={accountForm.email} onChange={handleFormChange} disabled={loading} className={formErrors.email ? 'cat-input-error' : ''} />
                      {formErrors.email && <div className="cat-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.email}</span></div>}
                    </div>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label>{language === 'mm' ? 'ဖုန်း' : 'Phone'}</label>
                      <input type="text" name="phone" value={accountForm.phone} onChange={handleFormChange} disabled={loading} />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label className="cat-required">{language === 'mm' ? 'ရာထူး' : 'Role'}</label>
                      <select name="role" value={accountForm.role} onChange={handleFormChange} disabled={loading}>
                        {state.dropdownData.roles.map(role => <option key={role.value} value={role.value}>{role.label}</option>)}
                      </select>
                    </div>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label className="cat-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
                      <div className="cat-status-select-group">
                        <div className={`cat-status-option ${accountForm.status === 'Active' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Active')}>
                          <input type="radio" name="status" value="Active" checked={accountForm.status === 'Active'} readOnly className="cat-status-radio" disabled={loading} />
                          <label className="cat-status-label"><i className="fas fa-check-circle"></i>{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}</label>
                        </div>
                        <div className={`cat-status-option ${accountForm.status === 'Unactive' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Unactive')}>
                          <input type="radio" name="status" value="Unactive" checked={accountForm.status === 'Unactive'} readOnly className="cat-status-radio" disabled={loading} />
                          <label className="cat-status-label"><i className="fas fa-times-circle"></i>{language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'}</label>
                        </div>
                        <div className={`cat-status-option ${accountForm.status === 'Pending' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Pending')}>
                          <input type="radio" name="status" value="Pending" checked={accountForm.status === 'Pending'} readOnly className="cat-status-radio" disabled={loading} />
                          <label className="cat-status-label"><i className="fas fa-clock"></i>{language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending'}</label>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label className="cat-required">{language === 'mm' ? 'စကားဝှက်' : 'Password'}</label>
                      <input type="password" name="password" value={accountForm.password} onChange={handleFormChange} disabled={loading} className={formErrors.password ? 'cat-input-error' : ''} />
                      {formErrors.password && <div className="cat-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.password}</span></div>}
                    </div>
                    <div className="cat-form-group" style={{ flex: 1 }}>
                      <label className="cat-required">{language === 'mm' ? 'စကားဝှက် အတည်ပြုရန်' : 'Confirm Password'}</label>
                      <input type="password" name="confirmPassword" value={accountForm.confirmPassword} onChange={handleFormChange} disabled={loading} className={formErrors.confirmPassword ? 'cat-input-error' : ''} />
                      {formErrors.confirmPassword && <div className="cat-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.confirmPassword}</span></div>}
                    </div>
                  </div>

                  <div className="cat-info-box">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'စကားဝှက်ကို ပေးထားသော အီးမေးလ်သို့ ပေးပို့မည်။' : 'Login credentials will be sent to the provided email address.'}</span>
                  </div>
                </>
              ) : (
                /* Edit Mode – read‑only info + status only, plan removed */
                <>
                  <div className="user-account-info-grid">
                    <div className="user-account-info-column">
                      <div className="user-account-info-item">
                        <label>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                        <div className="user-account-info-value">
                          <i className="fas fa-user"></i>
                          <span>{accountForm.username}</span>
                        </div>
                      </div>
                      <div className="user-account-info-item">
                        <label>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                        <div className="user-account-info-value">
                          <i className="fas fa-id-card"></i>
                          <span>{accountForm.fullName}</span>
                        </div>
                      </div>
                      <div className="user-account-info-item">
                        <label>{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                        <div className="user-account-info-value">
                          <i className="fas fa-envelope"></i>
                          <span>{accountForm.email}</span>
                        </div>
                      </div>
                    </div>
                    <div className="user-account-info-column">
                      <div className="user-account-info-item">
                        <label>{language === 'mm' ? 'ဖုန်း' : 'Phone'}</label>
                        <div className="user-account-info-value">
                          <i className="fas fa-phone"></i>
                          <span>{accountForm.phone || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="user-account-info-item">
                        <label>{language === 'mm' ? 'အခန်းကဏ္ဍ' : 'Role'}</label>
                        <div className="user-account-info-value">
                          <i className="fas fa-tag"></i>
                          <span className={`user-account-role-badge role-${accountForm.role?.toLowerCase().replace('_', '-')}`}>
                            {getRoleLabel(accountForm.role)}
                          </span>
                        </div>
                      </div>
                      <div className="user-account-info-item">
                        <label>{language === 'mm' ? 'ဆိုင်' : 'Shop'}</label>
                        <div className="user-account-info-value">
                          <i className="fas fa-store"></i>
                          <span>{accountForm.shopCode}</span>
                        </div>
                      </div>
                      {/* ❌ Plan item removed */}
                    </div>
                  </div>

                  <div className="user-account-divider">
                    <span>{language === 'mm' ? 'အခြေအနေပြောင်းလဲရန်' : 'Change Status'}</span>
                  </div>

                  <div className="cat-form-group">
                    <label className="cat-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
                    <div className="cat-status-select-group">
                      <div className={`cat-status-option ${accountForm.status === 'Active' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Active')}>
                        <input type="radio" name="status" value="Active" checked={accountForm.status === 'Active'} readOnly className="cat-status-radio" disabled={loading} />
                        <label className="cat-status-label"><i className="fas fa-check-circle"></i>{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}</label>
                      </div>
                      <div className={`cat-status-option ${accountForm.status === 'Unactive' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Unactive')}>
                        <input type="radio" name="status" value="Unactive" checked={accountForm.status === 'Unactive'} readOnly className="cat-status-radio" disabled={loading} />
                        <label className="cat-status-label"><i className="fas fa-times-circle"></i>{language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'}</label>
                      </div>
                      <div className={`cat-status-option ${accountForm.status === 'Pending' ? 'selected' : ''}`} onClick={() => !loading && handleStatusChange('Pending')}>
                        <input type="radio" name="status" value="Pending" checked={accountForm.status === 'Pending'} readOnly className="cat-status-radio" disabled={loading} />
                        <label className="cat-status-label"><i className="fas fa-clock"></i>{language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending'}</label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="cat-modal-footer">
              <button className="cat-btn-cancel" onClick={() => setShowAccountModal(false)} disabled={loading}>
                {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
              </button>
              <button
                className={`cat-btn-submit ${loading ? 'loading' : ''}`}
                onClick={handleSaveAccount}
                disabled={
                  (modalType === "add" ? (
                    !accountForm.username || !accountForm.fullName || !accountForm.email || !accountForm.role || !accountForm.shopId || !accountForm.password || !accountForm.confirmPassword
                  ) : false) || loading
                }
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...'}</>
                ) : (
                  <><i className="fas fa-save"></i> {modalType === "add" ? (language === 'mm' ? 'အကောင့်ဖန်တီးရန်' : 'Create Account') : (language === 'mm' ? 'အခြေအနေပြောင်းလဲရန်' : 'Update Status')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal – unchanged */}
      {showLogDetails && state.selectedLog && (
        <div className="cat-modal-overlay">
          <div className="cat-modal-content" style={{ maxWidth: '600px' }}>
            <div className="cat-modal-header">
              <h3>
                <i className={`fas ${state.selectedLog.actionType === 'ADD' ? 'fa-plus-circle' : state.selectedLog.actionType === 'EDIT' ? 'fa-edit' : 'fa-trash'}`}></i>
                {language === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}
              </h3>
              <button className="cat-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="cat-modal-body">
              <div className="cat-log-detail-header">
                <div className="cat-log-detail-main">
                  <div className="cat-log-detail-action">
                    <span className={`cat-action-badge cat-action-${state.selectedLog.actionType?.toLowerCase()}`}>
                      {state.selectedLog.actionType === 'ADD' && <i className="fas fa-plus"></i>}
                      {state.selectedLog.actionType === 'EDIT' && <i className="fas fa-edit"></i>}
                      {state.selectedLog.actionType === 'DELETE' && <i className="fas fa-trash"></i>}
                      {state.selectedLog.actionType === 'ADD' && (language === 'mm' ? 'အကောင့်ဖန်တီးခြင်း' : 'Account Created')}
                      {state.selectedLog.actionType === 'EDIT' && (language === 'mm' ? 'အကောင့်ပြင်ဆင်ခြင်း' : 'Account Updated')}
                      {state.selectedLog.actionType === 'DELETE' && (language === 'mm' ? 'အကောင့်ဖျက်ခြင်း' : 'Account Deleted')}
                    </span>
                  </div>
                  {state.selectedLog.username && (
                    <div className="cat-log-detail-category">
                      <i className="fas fa-user"></i>
                      <span className="cat-category-name">{state.selectedLog.username}</span>
                      {state.selectedLog.accountId && <span className="cat-category-id-detail">ID: #{state.selectedLog.accountId}</span>}
                    </div>
                  )}
                </div>

                <div className="cat-log-detail-meta">
                  <div className="cat-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="cat-user-name-detail">{state.selectedLog.createdByName}</div>
                      <div className="cat-user-role-detail">{state.selectedLog.createdByRole || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="cat-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="cat-log-date-detail">{state.selectedLog.date}</div>
                      <div className="cat-log-time-detail">{state.selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="cat-log-detail-content">
                <h4>{language === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {state.selectedLog.changes && state.selectedLog.changes.length > 0 ? (
                  <div className="cat-change-list">
                    {state.selectedLog.changes.map((detail, index) => {
                      const hasArrow = detail.includes('→');
                      return (
                        <div key={index} className="cat-change-item">
                          <i className="fas fa-chevron-right"></i>
                          {hasArrow ? (
                            <span>
                              {detail.split('→')[0]}
                              <strong className="change-arrow">→</strong>
                              {detail.split('→')[1]}
                            </span>
                          ) : (
                            <span>{detail}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="cat-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="cat-modal-footer">
              <button className="cat-btn-cancel" onClick={() => setShowLogDetails(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopAccountManagementPage;