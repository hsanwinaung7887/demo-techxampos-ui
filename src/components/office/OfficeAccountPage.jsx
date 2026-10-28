import React, { useState, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { initialState, officeAccountManagementReducer } from '../owner-useReducer/officeAccountManagementReducer';
import { accountApi, logsApi } from '../apis/officeAccountApi';
import { useSelector } from 'react-redux';
import "../../light-style/owner-css/officeAccountPage.css";

const OfficeAccountPage = () => {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(officeAccountManagementReducer, initialState);

  // Language State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('dashboardLanguage') || 'en';
  });

  // Listen for language changes
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'dashboardLanguage') {
        setLanguage(e.newValue || 'en');
      }
    };

    const handleLanguageEvent = () => {
      const newLang = localStorage.getItem('dashboardLanguage') || 'en';
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
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loadingDirection, setLoadingDirection] = useState(null);
  
  // Error and Success States
  const [passwordError, setPasswordError] = useState(null);
  const [networkError, setNetworkError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  // Form state
  const [accountForm, setAccountForm] = useState({
    id: null,
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phone: "",
    role: "MANAGER",
    status: "Active"  // Active, Inactive, Suspended
  });

  // Refs
  const filterTimeoutRef = useRef(null);
  const pageChangeTimeoutRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  // ✅ ဒီအတိုင်းထားပါ
  const { user: ownerUser, isAuthenticated, isLoading: authLoading } = useSelector((state) => state.ownerAuth);

  // OfficeAccountPage.js

  const currentUser = useMemo(() => {
    if (ownerUser && isAuthenticated) {
        return {
            id: ownerUser.id,
            // ✅ fullName ဖြစ်ဖြစ် name ဖြစ်ဖြစ် သေချာထည့်ပါ
            name: ownerUser.fullName || ownerUser.name || ownerUser.username,
            role: ownerUser.role,
            username: ownerUser.username,
            email: ownerUser.email,
            fullName: ownerUser.fullName || ownerUser.name  // fullName ကိုလည်းထည့်
        };
    }
    return null;
  }, [ownerUser, isAuthenticated]);

  // ✅ ဒီ useEffect တစ်ခုတည်းထားပါ
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/ownerLogin');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // ===== Action Creators =====
  const actions = {
    setLoading: (isLoading) => dispatch({ type: "SET_LOADING", payload: isLoading }),
    setTableLoading: (isLoading) => dispatch({ type: "SET_TABLE_LOADING", payload: isLoading }),
    setError: (error) => {
      dispatch({ type: "SET_ERROR", payload: error });
      setNetworkError(null);
    },
    clearError: () => dispatch({ type: "CLEAR_ERROR" }),
    setSuccess: (isSuccess) => dispatch({ type: "SET_SUCCESS", payload: isSuccess }),
    clearSuccess: () => dispatch({ type: "CLEAR_SUCCESS" }),
    
    setActiveTab: (tab) => dispatch({ type: "SET_ACTIVE_TAB", payload: tab }),
    setSearchQuery: (query) => dispatch({ type: "SET_SEARCH_QUERY", payload: query }),
    setSearchField: (field) => dispatch({ type: "SET_SEARCH_FIELD", payload: field }),
    setFilters: (filters) => dispatch({ type: "SET_FILTERS", payload: filters }),
    
    setPagination: (pagination) => dispatch({ type: "SET_PAGINATION", payload: pagination }),
    setLogPagination: (pagination) => dispatch({ type: "SET_LOG_PAGINATION", payload: pagination }),
    
    setDateFilter: (dateFilter) => dispatch({ type: "SET_DATE_FILTER", payload: dateFilter }),
    setLogFilter: (logFilter) => dispatch({ type: "SET_LOG_FILTER", payload: logFilter }),
    
    fetchAccounts: (data) => dispatch({ type: "FETCH_ACCOUNTS", payload: data }),
    fetchLogs: (data) => dispatch({ type: "FETCH_LOGS", payload: data }),
    
    addAccount: (data) => dispatch({ type: "ADD_ACCOUNT", payload: data }),
    updateAccount: (data) => dispatch({ type: "UPDATE_ACCOUNT", payload: data }),
    deleteAccount: (data) => dispatch({ type: "DELETE_ACCOUNT", payload: data }),
    
    filterAccounts: () => dispatch({ type: "FILTER_ACCOUNTS" }),
    filterLogs: () => dispatch({ type: "FILTER_LOGS" }),
    
    setSelectedLog: (log) => dispatch({ type: "SET_SELECTED_LOG", payload: log })
  };

  // ===== Form Validation Function =====
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    setPasswordError(null);
    setValidationError(null);
    
    if (!accountForm.username) {
      errors.username = language === 'mm' ? "အသုံးပြုသူအမည် လိုအပ်ပါသည်" : "Username is required";
      isValid = false;
    } else if (accountForm.username.length < 3) {
      errors.username = language === 'mm' ? "အသုံးပြုသူအမည်သည် အနည်းဆုံး ၃ လုံးရှိရပါမည်" : "Username must be at least 3 characters";
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
      errors.email = language === 'mm' ? "အီးမေးလ် မှားယွင်းနေပါသည်" : "Email is invalid";
      isValid = false;
    }
    
    if (!accountForm.role) {
      errors.role = language === 'mm' ? "အခန်းကဏ္ဍ လိုအပ်ပါသည်" : "Role is required";
      isValid = false;
    }
    
    if (modalType === "add") {
      if (!accountForm.password) {
        errors.password = language === 'mm' ? "စကားဝှက် လိုအပ်ပါသည်" : "Password is required";
        isValid = false;
      } else if (accountForm.password.length < 6) {
        errors.password = language === 'mm' ? "စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်" : "Password must be at least 6 characters";
        isValid = false;
      }
      
      if (!accountForm.confirmPassword) {
        errors.confirmPassword = language === 'mm' ? "စကားဝှက်အတည်ပြုရန် လိုအပ်ပါသည်" : "Please confirm your password";
        isValid = false;
      } else if (accountForm.password !== accountForm.confirmPassword) {
        errors.confirmPassword = language === 'mm' ? "စကားဝှက်များ မတူညီပါ" : "Passwords do not match";
        setPasswordError(language === 'mm' ? "စကားဝှက်များ မတူညီပါ" : "Passwords do not match");
        isValid = false;
      }
    }
    
    if (modalType === "edit" && accountForm.password) {
      if (accountForm.password.length < 6) {
        errors.password = language === 'mm' ? "စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်" : "Password must be at least 6 characters";
        isValid = false;
      }
      
      if (accountForm.password !== accountForm.confirmPassword) {
        errors.confirmPassword = language === 'mm' ? "စကားဝှက်များ မတူညီပါ" : "Passwords do not match";
        setPasswordError(language === 'mm' ? "စကားဝှက်များ မတူညီပါ" : "Passwords do not match");
        isValid = false;
      }
    }
    
    setFormErrors(errors);
    return isValid;
  };

  // ===== Retry Connection Function =====
  const retryConnection = () => {
    setNetworkError(null);
    actions.clearError();
    
    if (state.activeTab === 'history') {
      fetchLogs();
    } else {
      fetchAccounts();
    }
  };

  // ===== Format Change Details Function =====
  const formatChangeDetails = (log) => {
    if (!log.changes || log.changes.length === 0) {
      if (log.actionType === 'ADD') {
        return [
          language === 'mm' ? `အသုံးပြုသူအမည်: ${log.accountUsername}` : `Username: ${log.accountUsername}`,
          language === 'mm' ? `အခန်းကဏ္ဍ: ${log.details?.role || 'MANAGER'}` : `Role: ${log.details?.role || 'MANAGER'}`,
          language === 'mm' ? 'အခြေအနေ: အသုံးပြုနိုင်' : 'Status: Active'
        ];
      } else if (log.actionType === 'DELETE') {
        return [
          language === 'mm' ? `အသုံးပြုသူအမည်: ${log.accountUsername}` : `Username: ${log.accountUsername}`,
          language === 'mm' ? `အကောင့် ID: #${log.accountId}` : `Account ID: #${log.accountId}`,
          language === 'mm' ? 'အခြေအနေ: ဖျက်ပြီးပါပြီ' : 'Status: Deleted'
        ];
      } else if (log.actionType === 'EDIT') {
        if (log.details?.changes) {
          return log.details.changes;
        }
        return [language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'];
      }
    }
    return log.changes || [language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No changes recorded'];
  };

  // ===== Group Logs by Date Function =====
  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const dateKey = date.toLocaleDateString(language === 'mm' ? 'my' : 'en-US', { 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
      
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(log);
    });
    return grouped;
  };

  // ===== Real-time Grouped Logs =====
  const groupedLogs = useMemo(() => {
    if (!state.filteredLogs) return {};
    return groupLogsByDate(state.filteredLogs);
  }, [state.filteredLogs, language]);

  // ===== Data Fetching =====
  const fetchAccounts = useCallback(async (isInitialLoad = false) => {
  if (isInitialLoad) {
    actions.setTableLoading(true);
  } else {
    actions.setTableLoading(true);
  }
  setNetworkError(null);
  
  try {
    const params = {
      page: state.pagination.page,
      size: state.pagination.size,
      search: state.searchQuery || undefined,
      role: state.filters.role !== 'all' ? state.filters.role : undefined,
      status: state.filters.status !== 'all' ? state.filters.status : undefined,
      statusTab: state.activeTab  // all-accounts, active, inactive, suspended, history
    };
    
    const response = await accountApi.getAccounts(params);
    
    if (response.success) {
      actions.fetchAccounts({
        accounts: response.data.data,
        currentPage: response.data.currentPage,
        pageSize: response.data.pageSize,
        totalItems: response.data.totalItems,
        totalPages: response.data.totalPages,
        summary: response.data.summary,
        roleCounts: response.data.roleCounts,
        statusCounts: response.data.statusCounts
      });
    } else {
      actions.setError(response.message);
    }
  } catch (error) {

    if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
      setNetworkError(language === 'mm' 
        ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။" 
        : "Cannot connect to server. Please check your internet connection.");
    } else {
      actions.setError(error.message);
    }
  } finally {
    actions.setTableLoading(false);
  }
  }, [state.pagination.page, state.pagination.size, state.searchQuery, 
    state.filters.role, state.filters.status, state.activeTab, language]);

  const fetchLogs = useCallback(async (isInitialLoad = false) => {
    if (isInitialLoad) {
      actions.setLoading(true);
    } else {
      actions.setLoading(true);
    }
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
      
      const response = await logsApi.getLogs(params);
      
      if (response.success) {
        actions.fetchLogs({
          logs: response.data.data,
          currentPage: response.data.currentPage,
          pageSize: response.data.pageSize,
          totalItems: response.data.totalItems,
          totalPages: response.data.totalPages,
          summary: response.data.summary,
          actionTypeCounts: response.data.actionTypeCounts
        });
      } else {
        actions.setError(response.message);
      }
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
      actions.setLoading(false);
    }
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter, language]);

  // ===== Initial Load =====
  useEffect(() => {
    if (currentUser) {
      console.log("Initial load - fetching data...");
      
      Promise.all([
        fetchAccounts(true),
        fetchLogs(true)
      ]).then(() => {
        console.log("Initial data loaded");
        isInitialMount.current = false;
      });
    }
  }, [currentUser]);

  // ===== Filter Effect - Debounced =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    filterTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchAccounts();
    }, 500);
    
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [state.searchQuery, state.filters.role, state.filters.status]);

  // ===== Page Change Effect =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    
    fetchAccounts();
  }, [state.pagination.page, state.pagination.size]);

  // ===== Logs Filter Effect =====
  useEffect(() => {
    if (isInitialMount.current) return;
    
    fetchLogs();
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter]);

  // ===== Filter Accounts Locally =====
  useEffect(() => {
    actions.filterAccounts();
  }, [state.searchQuery, state.filters, state.activeTab, state.accounts]);

  // ===== Filter Logs Locally =====
  useEffect(() => {
    actions.filterLogs();
  }, [state.logFilter, state.dateFilter, state.logs]);

  // ===== Tab Change Effect =====
  useEffect(() => {
    if (isInitialMount.current) return;
    
    if (state.activeTab === 'history') {
      fetchLogs();
    } else {
      fetchAccounts();
    }
  }, [state.activeTab]);

  // ===== Handlers =====
  const handleTabChange = (e) => {
    const newTab = e.target.value;
    actions.setActiveTab(newTab);
    actions.setPagination({ page: 1 });
    setPageInputValue("1");
  };

  const handleSearchChange = (e) => {
    actions.setSearchQuery(e.target.value);
  };

  const handleRoleFilterChange = (e) => {
    actions.setFilters({ role: e.target.value });
  };

  const handleStatusFilterChange = (e) => {
    actions.setFilters({ status: e.target.value });
  };

  const clearAllFilters = () => {
    actions.setSearchQuery("");
    actions.setFilters({ role: "all", status: "all" });
    actions.setPagination({ page: 1 });
    setPageInputValue("1");
  };

  // ===== Pagination Handlers =====
  const changePage = useCallback((newPage, direction) => {
    if (newPage === state.pagination.page || newPage < 1 || newPage > state.pagination.totalPages) return;
    
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
    }
    
    setLoadingDirection(direction);
    
    pageChangeTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: newPage });
      setPageInputValue(newPage.toString());
      setLoadingDirection(null);
      
      if (tableBodyRef.current) {
        tableBodyRef.current.scrollTop = 0;
      }
    }, 150);
  }, [state.pagination.page, state.pagination.totalPages]);

  const changeHistoryPage = useCallback((newPage, direction) => {
    if (newPage === state.logPagination.page || newPage < 1 || newPage > state.logPagination.totalPages) return;
    
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
    }
    
    setLoadingDirection(direction);
    
    pageChangeTimeoutRef.current = setTimeout(() => {
      actions.setLogPagination({ page: newPage });
      setHistoryPageInputValue(newPage.toString());
      setLoadingDirection(null);
      
      if (historyContainerRef.current) {
        historyContainerRef.current.scrollTop = 0;
      }
    }, 150);
  }, [state.logPagination.page, state.logPagination.totalPages]);

  // ===== Handle Page Size Change =====
  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    actions.setPagination({ 
      size: newSize,
      page: 1 
    });
    setPageInputValue("1");
  };

  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    actions.setLogPagination({ 
      size: newSize,
      page: 1 
    });
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
    actions.setDateFilter({ 
      filter: "all", 
      customFrom: "", 
      customTo: "" 
    });
    setShowDatePicker(false);
    actions.setLogPagination({ page: 1 });
    setHistoryPageInputValue("1");
  };

  // ===== CRUD Handlers =====
  // OfficeAccountPage.js - handleAction function

const handleAction = async (action, accountId) => {
    const account = state.accountsMap.get(accountId);
    
    if (action === 'edit') {
      setAccountForm({
        id: account.id,
        username: account.username,
        password: "",
        confirmPassword: "",
        fullName: account.fullName || account.full_name,
        email: account.email,
        phone: account.phone || "",
        role: account.role,
        status: account.status
      });
      setFormErrors({});
      setPasswordError(null);
      setModalType("edit");
      setShowAccountModal(true);
    } else if (action === 'delete') {
      if (window.confirm(language === 'mm' 
        ? `"${account.username}" အကောင့်ကို ဖျက်ရန် သေချာပါသလား? (Soft Delete)` 
        : `Are you sure you want to delete the account "${account.username}"? (Soft Delete)`)) {
        try {
          actions.setLoading(true);
          
          const response = await accountApi.deleteAccount(accountId, currentUser);
          
          if (response.success) {
            actions.deleteAccount({ accountId });
            actions.setSuccess(true);
            fetchLogs(); // Refresh logs
            fetchAccounts(); // Refresh accounts
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
          actions.setLoading(false);
        }
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
    
    if (name === 'password' || name === 'confirmPassword') {
      setPasswordError(null);
    }
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
      role: "MANAGER",
      status: "Active"
    });
    setFormErrors({});
    setPasswordError(null);
    setValidationError(null);
  };

  const openAddModal = () => {
    setModalType("add");
    resetForm();
    setShowAccountModal(true);
  };

  // OfficeAccountPage.js - handleSaveAccount function

const handleSaveAccount = async () => {
    if (!validateForm()) {
        setValidationError(language === 'mm' ? "ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ" : "Please fix the errors in the form");
        return;
    }

    try {
        actions.setLoading(true);
        
        if (modalType === "add") {
            // ✅ currentUser ပါအောင်သေချာထည့်
            const response = await accountApi.createAccount(accountForm, currentUser);
            if (response.success) {
                actions.addAccount({ account: response.data });
                actions.setSuccess(true);
                setShowAccountModal(false);
                fetchLogs();
                fetchAccounts();
                setTimeout(() => actions.clearSuccess(), 3000);
            } else {
                actions.setError(response.message);
            }
        } else {
            const response = await accountApi.updateAccount(accountForm.id, accountForm, currentUser);
            if (response.success) {
                actions.updateAccount({ account: response.data });
                actions.setSuccess(true);
                setShowAccountModal(false);
                fetchLogs();
                fetchAccounts();
                setTimeout(() => actions.clearSuccess(), 3000);
            } else {
                actions.setError(response.message);
            }
        }
    } catch (error) {
        console.error("Save account error:", error);
        
        if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
            setNetworkError(language === 'mm' 
                ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။" 
                : "Cannot connect to server. Please check your internet connection.");
        } else {
            actions.setError(error.message);
        }
    } finally {
        actions.setLoading(false);
    }
};

  const showLogDetailModal = (log) => {
    const formattedLog = {
      ...log,
      formattedChanges: formatChangeDetails(log)
    };
    actions.setSelectedLog(formattedLog);
    setShowLogDetails(true);
  };

  // ===== Helper Functions =====
  const getRoleLabel = (roleValue) => {
    const role = state.dropdownData.roles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  const getRoleDescription = (roleValue) => {
    const descriptions = {
      MANAGER: language === 'mm' ? "ဆိုင်လုပ်ငန်းများ၊ ဝန်ထမ်းများနှင့် အစီရင်ခံစာများ စီမံခန့်ခွဲရန်" : "Manage shop operations, staff, and reports",
      ACCOUNT_TEAM: language === 'mm' ? "ဆိုင်အသုံးပြုသူ အကောင့်များ ဖန်တီးရန်နှင့် စီမံခန့်ခွဲရန်" : "Create and manage shop user accounts",
      SUPPORT_TEAM: language === 'mm' ? "အရောင်းနှင့် ငွေပေးချေမှုများ ဆောင်ရွက်ရန်" : "Process sales and transactions",
      BILLING_TEAM: language === 'mm' ? "ဆိုင်အချက်အလက်များကို ကြည့်ရှုရန်သာ" : "View-only access to shop data",
      CUSTOMER_SERVICE: language === 'mm' ? "ဝယ်ယူသူများ၏ မေးမြန်းမှုများနှင့် တိုင်ကြားချက်များ ကိုင်တွယ်ရန်" : "Handle customer inquiries and complaints",
    };
    return descriptions[roleValue] || "";
  };

  const getStatusLabel = (statusValue) => {
    const statusMap = {
      'Active': language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active',
      'Inactive': language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive',
      'Suspended': language === 'mm' ? 'ဆိုင်းငံ့ထား' : 'Suspended',
      'Deleted': language === 'mm' ? 'ဖျက်ထား' : 'Deleted'
    };
    return statusMap[statusValue] || statusValue;
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

  const getCountByRole = (roleValue) => {
    if (roleValue === 'all') {
      return state.roleCounts.all || 0;
    }
    return state.roleCounts[roleValue] || 0;
  };

  // ===== Loading Spinner Component =====
  const LoadingSpinner = ({ direction }) => {
    let message = "";
    if (direction === 'prev') message = language === 'mm' ? "ယခင်စာမျက်နှာကို ဖွင့်နေသည်..." : "Loading previous page...";
    else if (direction === 'next') message = language === 'mm' ? "နောက်စာမျက်နှာကို ဖွင့်နေသည်..." : "Loading next page...";
    else if (direction === 'jump') message = language === 'mm' ? "စာမျက်နှာသို့ သွားနေသည်..." : "Jumping to page...";
    else message = language === 'mm' ? "ဒေတာများ ရယူနေသည်..." : "Loading data...";
    
    return (
      <div className="user-account-loading-overlay">
        <div className="user-account-loading-spinner">
          <div className="user-account-spinner"></div>
          <div className="user-account-loading-message">{message}</div>
        </div>
      </div>
    );
  };

  if (authLoading || !currentUser) {
    return (
      <div className="user-account-container">
        <div className="loading-state" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginRight: '15px' }}></i>
          <p style={{ fontSize: '18px' }}>{language === 'mm' ? 'အသုံးပြုသူဒေတာ ဖွင့်နေသည်...' : 'Loading user data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="user-account-container">
      {/* Loading Spinner */}
      {((state.activeTab === 'history' && state.loading) || 
        (state.activeTab !== 'history' && state.tableLoading)) && 
        <LoadingSpinner direction={loadingDirection} />}

      {/* Messages Container */}
      <div className="user-account-messages-container">
        {state.success && (
          <div className="user-account-message success">
            <i className="fas fa-check-circle"></i>
            <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={actions.clearSuccess}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {state.error && (
          <div className="user-account-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{state.error}</span>
            <button onClick={actions.clearError}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {networkError && (
          <div className="user-account-network-error">
            <i className="fas fa-wifi-slash"></i>
            <div className="error-content">
              <div className="error-title">{language === 'mm' ? 'Connection Error' : 'Connection Error'}</div>
              <div className="error-message">{networkError}</div>
            </div>
            <button onClick={retryConnection}>
              <i className="fas fa-sync-alt"></i> {language === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      <div className="shop-management-header uac">
        <div className="header-top-row">
          <NavLink to="/owner/dashboard" className="user-account-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်' : 'Back to Dashboard'}
          </NavLink>
          <div className="header-center-content">
            <h1><i className="fas fa-user-circle"></i> {language === 'mm' ? 'ရုံးအကောင့် စီမံခန့်ခွဲမှု' : 'Office Account Management'}</h1>
            <p>{language === 'mm' ? 'အသုံးပြုသူအကောင့်အားလုံး စီမံခန့်ခွဲရန်' : 'Manage all user accounts'}</p>
          </div>
        </div>
      </div>

      <div className="user-account-tabs-header">
        <div className="user-account-tabs-selector">
          <div className="user-account-select-container">
            <i className={`fas ${
              state.activeTab === "all-accounts" ? "fa-users" :
              state.activeTab === "active" ? "fa-check-circle" :
              state.activeTab === "inactive" ? "fa-times-circle" :
              state.activeTab === "suspended" ? "fa-pause-circle" :
              "fa-history"
            } user-account-select-icon`}></i>
            <select 
              className="user-account-tab-select"
              value={state.activeTab}
              onChange={handleTabChange}
              disabled={state.loading || state.tableLoading}
            >
              <option value="all-accounts">
                {language === 'mm' ? 'အကောင့်အားလုံး' : 'All Accounts'} ({state.roleCounts.all?.toLocaleString() || 0})
              </option>
              <option value="active">
                {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'} ({state.statusCounts.Active?.toLocaleString() || 0})
              </option>
              <option value="inactive">
                {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'} ({state.statusCounts.Inactive?.toLocaleString() || 0})
              </option>
              <option value="suspended">
                {language === 'mm' ? 'ဆိုင်းငံ့ထား' : 'Suspended'} ({state.statusCounts.Suspended?.toLocaleString() || 0})
              </option>
              <option value="history">
                {language === 'mm' ? 'မှတ်တမ်း' : 'History'} ({state.actionTypeCounts.all?.toLocaleString() || 0})
              </option>
            </select>
            <i className="fas fa-chevron-down user-account-select-arrow"></i>
          </div>
        </div>
        
        {state.activeTab !== 'history' && (
          <>
            <div className="user-account-search-controls">
              <div className="user-account-search-input-group">
                <i className="fas fa-search user-account-search-icon"></i>
                <input
                  type="text"
                  className="user-account-search-input"
                  placeholder={language === 'mm' ? 'အသုံးပြုသူအမည်၊ အမည်၊ အီးမေလ် သို့မဟုက် ဖုန်း ဖြင့်ရှာဖွေရန်...' : 'Search by username, name, email or phone...'}
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                  disabled={state.tableLoading}
                />
                {state.searchQuery && (
                  <button 
                    className="user-account-clear-search-btn" 
                    onClick={() => actions.setSearchQuery("")} 
                    disabled={state.tableLoading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="user-account-filter-select-group">
                <i className="fas fa-tag user-account-filter-icon"></i>
                <select 
                  className="user-account-filter-select"
                  value={state.filters.role}
                  onChange={handleRoleFilterChange}
                  disabled={state.tableLoading}
                >
                  <option value="all">
                    {language === 'mm' ? 'အခန်းကဏ္ဍအားလုံး' : 'All Roles'} ({getCountByRole('all').toLocaleString()})
                  </option>
                  {state.dropdownData.roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label} ({getCountByRole(role.value).toLocaleString()})
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down user-account-select-arrow"></i>
              </div>
              
              <div className="user-account-filter-buttons">
                {(state.searchQuery || state.filters.role !== "all" || state.filters.status !== "all") && (
                  <button 
                    className="user-account-clear-filters-btn"
                    onClick={clearAllFilters}
                    disabled={state.tableLoading}
                  >
                    <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            
            <button 
              className="user-account-add-btn"
              onClick={openAddModal}
              disabled={state.tableLoading}
            >
              <i className="fas fa-plus"></i> {language === 'mm' ? 'အကောင့်ဖန်တီးရန်' : 'Create Account'}
            </button>
          </>
        )}
      </div>
  
      <div className="subtab-content active">
        {state.activeTab === "history" ? (
          /* ===== HISTORY TAB ===== */
          <div className="user-account-history-section">
            <div className="user-account-section-title">
              <div className="user-account-title-row">
                <div className="user-account-title-left">
                  <i className="fas fa-history"></i> 
                  <span className="user-account-title-text">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}
                  </span>
                </div>

                <div className="user-account-title-center">
                  <div className="user-account-compact-nav">
                    <button 
                      className={`user-account-nav-btn ${state.loading ? 'loading' : ''}`} 
                      onClick={() => changeHistoryPage(state.logPagination.page - 1, 'prev')}
                      disabled={state.logPagination.page === 1 || state.loading}
                      title={language === 'mm' ? 'ယခင်စာမျက်နှာ' : 'Previous Page'}
                    >
                      {state.loading && loadingDirection === 'prev' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-left"></i>
                      )}
                    </button>
                    
                    <div className="user-account-page-control">
                      <input 
                        type="text" 
                        className="user-account-page-input" 
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
                        disabled={state.loading}
                      />
                      <span className="user-account-page-total">
                        / {state.logPagination.totalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`user-account-nav-btn ${state.loading ? 'loading' : ''}`} 
                      onClick={() => changeHistoryPage(state.logPagination.page + 1, 'next')}
                      disabled={state.logPagination.page === state.logPagination.totalPages || state.logPagination.totalPages === 0 || state.loading}
                      title={language === 'mm' ? 'နောက်စာမျက်နှာ' : 'Next Page'}
                    >
                      {state.loading && loadingDirection === 'next' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </button>
                    
                    <div className="user-account-items-per-page">
                      <select 
                        className="user-account-per-page-select" 
                        value={state.logPagination.size} 
                        onChange={handleLogPageSizeChange}
                        disabled={state.loading}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="user-account-per-page-label">
                        {language === 'mm' ? '/စာမျက်နှာ' : '/pg'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="user-account-title-right">
                  {state.loading ? (
                    <span className="user-account-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="user-account-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                    </span>
                  ) : (
                    <span className="user-account-showing-count">
                      <span className="user-account-count-numbers">
                        {state.logPagination.total > 0 ? ((state.logPagination.page - 1) * state.logPagination.size) + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="user-account-count-numbers">
                        {Math.min(state.logPagination.page * state.logPagination.size, state.logPagination.total)}
                      </span>
                      <span> / </span>
                      <span className="user-account-count-numbers">
                        {state.logPagination.total.toLocaleString()}
                      </span>
                      <span className="user-account-count-label">
                        {language === 'mm' ? 'ခု' : 'items'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="user-account-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="user-account-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button 
                    className={`user-account-filter-tab ${state.logFilter === "all" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("all");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={state.loading}
                  >
                    {language === 'mm' ? 'အားလုံး' : 'All'} 
                    <span className="user-account-filter-count">
                      ({state.actionTypeCounts.all?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.logFilter === "ADD" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("ADD");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={state.loading}
                  >
                    <i className="fas fa-plus"></i> 
                    {language === 'mm' ? 'ပေါင်းထည့်ခြင်း' : 'Add'} <span className="user-account-filter-count">
                      ({state.actionTypeCounts.ADD?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.logFilter === "EDIT" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("EDIT");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={state.loading}
                  >
                    <i className="fas fa-edit"></i> 
                    {language === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Edit'} <span className="user-account-filter-count">
                      ({state.actionTypeCounts.EDIT?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.logFilter === "DELETE" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("DELETE");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={state.loading}
                  >
                    <i className="fas fa-trash"></i> 
                    {language === 'mm' ? 'ဖျက်ခြင်း' : 'Delete'} <span className="user-account-filter-count">
                      ({state.actionTypeCounts.DELETE?.toLocaleString() || 0})
                    </span>
                  </button>
                </div>

                <div className="user-account-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button 
                    className={`user-account-filter-tab ${state.dateFilter.filter === "all" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("all")}
                    disabled={state.loading}
                  >
                    {language === 'mm' ? 'အချိန်အားလုံး' : 'All Time'}
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.dateFilter.filter === "today" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("today")}
                    disabled={state.loading}
                  >
                    {language === 'mm' ? 'ယနေ့' : 'Today'}
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.dateFilter.filter === "yesterday" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("yesterday")}
                    disabled={state.loading}
                  >
                    {language === 'mm' ? 'မနေ့က' : 'Yesterday'}
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.dateFilter.filter === "thisWeek" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisWeek")}
                    disabled={state.loading}
                  >
                    {language === 'mm' ? 'ဒီအပတ်' : 'This Week'}
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.dateFilter.filter === "thisMonth" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisMonth")}
                    disabled={state.loading}
                  >
                    {language === 'mm' ? 'ဒီလ' : 'This Month'}
                  </button>
                  <button 
                    className={`user-account-filter-tab ${state.dateFilter.filter === "custom" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("custom")}
                    disabled={state.loading}
                  >
                    <i className="fas fa-calendar"></i> {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
                  </button>
                  
                  {state.dateFilter.filter !== "all" && (
                    <button 
                      className="user-account-filter-tab"
                      onClick={clearDateFilter}
                      style={{ backgroundColor: '#fef2f7', color: '#f72585' }}
                      disabled={state.loading}
                    >
                      <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {showDatePicker && (
                <div className="user-account-custom-date-picker">
                  <div className="user-account-date-picker-row">
                    <label>{language === 'mm' ? 'မှ' : 'From:'}</label>
                    <input
                      type="date"
                      className="user-account-date-input"
                      value={state.dateFilter.customFrom}
                      onChange={(e) => handleCustomDateChange('customFrom', e.target.value)}
                    />
                  </div>
                  <div className="user-account-date-picker-row">
                    <label>{language === 'mm' ? 'ထိ' : 'To:'}</label>
                    <input
                      type="date"
                      className="user-account-date-input"
                      value={state.dateFilter.customTo}
                      onChange={(e) => handleCustomDateChange('customTo', e.target.value)}
                    />
                  </div>
                  <button 
                    className="user-account-apply-date-btn"
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
            
            <div className="user-account-compact-logs-container" ref={historyContainerRef}>
              {state.loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                  <p>{language === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p>
                </div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="user-account-date-group">
                    <div className="user-account-date-header">
                      <span className="user-account-date-label">{date}</span>
                      <span className="user-account-date-count">
                        {dateLogs.length} {language === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}
                      </span>
                    </div>
                    
                    <div className="user-account-logs-list">
                      {dateLogs.map(log => (
                        <div 
                          key={log.id} 
                          className={`user-account-compact-log-entry log-${log.actionType?.toLowerCase()}`}
                          onClick={() => showLogDetailModal(log)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="user-account-log-icon" style={{ color: getActionColor(log.actionType) }}>
                            <i className={`fas ${getActionIcon(log.actionType)}`}></i>
                          </div>
                          <div className="user-account-log-content">
                            <div className="user-account-log-main-info">
                              <span className="user-account-log-action">
                                {log.actionType === 'ADD' && (language === 'mm' ? 'အကောင့်ဖန်တီးခြင်း' : 'Account Created')}
                                {log.actionType === 'EDIT' && (language === 'mm' ? 'အကောင့်ပြင်ဆင်ခြင်း' : 'Account Updated')}
                                {log.actionType === 'DELETE' && (language === 'mm' ? 'အကောင့်ဖျက်ခြင်း (Soft)' : 'Account Deleted (Soft)')}
                              </span>
                              <span className="user-account-log-account">
                                "{log.accountUsername}"
                                {log.accountId && <span className="user-account-account-id">#{log.accountId}</span>}
                              </span>
                            </div>
                            <div className="user-account-log-details">
                              <span className="user-account-log-user">
                                <i className="fas fa-user"></i> {log.createdByName}
                                <span className="user-account-user-role">({log.createdByRole || 'SUPER_ADMIN'})</span>
                              </span>
                              <span className="user-account-log-time">
                                <i className="fas fa-clock"></i> {log.timestamp}
                              </span>
                              {log.changes && log.changes.length > 0 && (
                                <span className="user-account-log-detail-count">
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
                  {state.dateFilter.filter !== "all" && (
                    <button 
                      className="user-account-clear-search-btn secondary"
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
          /* ===== ACCOUNTS TAB ===== */
          <>
            <div className="user-account-section-title">
              <div className="user-account-title-row">
                <div className="user-account-title-left">
                  <i className="fas fa-user-circle"></i> 
                  <span className="user-account-title-text">
                    {state.activeTab === "all-accounts" && (language === 'mm' ? 'အကောင့်အားလုံး' : 'All Accounts')}
                    {state.activeTab === "active" && (language === 'mm' ? 'အသုံးပြုနိုင်သောအကောင့်များ' : 'Active Accounts')}
                    {state.activeTab === "inactive" && (language === 'mm' ? 'အသုံးမပြုနိုင်သောအကောင့်များ' : 'Inactive Accounts')}
                    {state.activeTab === "suspended" && (language === 'mm' ? 'ဆိုင်းငံ့ထားသောအကောင့်များ' : 'Suspended Accounts')}
                  </span>
                </div>

                <div className="user-account-title-center">
                  <div className="user-account-compact-nav">
                    <button 
                      className={`user-account-nav-btn ${state.tableLoading ? 'loading' : ''}`} 
                      onClick={() => changePage(state.pagination.page - 1, 'prev')}
                      disabled={state.pagination.page === 1 || state.tableLoading}
                      title={language === 'mm' ? 'ယခင်စာမျက်နှာ' : 'Previous Page'}
                    >
                      {state.tableLoading && loadingDirection === 'prev' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-left"></i>
                      )}
                    </button>
                    
                    <div className="user-account-page-control">
                      <input 
                        type="text" 
                        className="user-account-page-input" 
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
                        disabled={state.tableLoading}
                      />
                      <span className="user-account-page-total">
                        / {state.pagination.totalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`user-account-nav-btn ${state.tableLoading ? 'loading' : ''}`} 
                      onClick={() => changePage(state.pagination.page + 1, 'next')}
                      disabled={state.pagination.page === state.pagination.totalPages || state.pagination.totalPages === 0 || state.tableLoading}
                      title={language === 'mm' ? 'နောက်စာမျက်နှာ' : 'Next Page'}
                    >
                      {state.tableLoading && loadingDirection === 'next' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </button>
                    
                    <div className="user-account-items-per-page">
                      <select 
                        className="user-account-per-page-select" 
                        value={state.pagination.size} 
                        onChange={handlePageSizeChange}
                        disabled={state.tableLoading}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="user-account-per-page-label">
                        {language === 'mm' ? '/စာမျက်နှာ' : '/pg'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="user-account-title-right">
                  {state.tableLoading ? (
                    <span className="user-account-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="user-account-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                    </span>
                  ) : (
                    <span className="user-account-showing-count">
                      <span className="user-account-count-numbers">
                        {state.pagination.total > 0 ? ((state.pagination.page - 1) * state.pagination.size) + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="user-account-count-numbers">
                        {Math.min(state.pagination.page * state.pagination.size, state.pagination.total)}
                      </span>
                      <span> / </span>
                      <span className="user-account-count-numbers">
                        {state.pagination.total.toLocaleString()}
                      </span>
                      <span className="user-account-count-label">
                        {language === 'mm' ? 'ခု' : 'items'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              
              {(state.searchQuery || state.filters.role !== "all" || state.filters.status !== "all") && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {state.searchQuery && (
                    <span className="user-account-search-badge">
                      <i className="fas fa-search"></i> "{state.searchQuery}"
                    </span>
                  )}
                  {state.filters.role !== "all" && (
                    <span className="user-account-filter-badge">
                      <i className="fas fa-tag"></i> {language === 'mm' ? 'အခန်းကဏ္ဍ' : 'Role'}: {state.dropdownData.roles.find(r => r.value === state.filters.role)?.label}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="user-account-table-wrapper" ref={tableBodyRef}>
              <table className="user-account-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</th>
                    <th>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</th>
                    <th>{language === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact'}</th>
                    <th>{language === 'mm' ? 'အခန်းကဏ္ဍ' : 'Role'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.tableLoading ? (
                    <tr>
                      <td colSpan="7" className="user-account-no-data">
                        <div className="user-account-no-data-content">
                          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                          <p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading data...'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : state.filteredAccounts.length > 0 ? (
                    state.filteredAccounts.map((account, index) => (
                      <tr key={account.id}>
                        <td>{((state.pagination.page - 1) * state.pagination.size) + index + 1}</td>
                        <td>
                          <div>
                            <strong>{account.username}</strong>
                            {account.createdAt && (
                              <div className="user-account-created">
                                <i className="far fa-clock"></i> {language === 'mm' ? 'ဖန်တီးရက်' : 'Created'}: {new Date(account.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{account.fullName || account.full_name}</td>
                        <td>
                          <div className="user-account-contact-cell">
                            <div className="user-account-contact-item">
                              <i className="fas fa-envelope user-account-contact-icon"></i>
                              <span className="user-account-contact-text">{account.email}</span>
                            </div>
                            <div className="user-account-contact-item">
                              <i className="fas fa-phone user-account-contact-icon"></i>
                              <span className="user-account-contact-text">{account.phone || 'N/A'}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="user-account-role-cell">
                            <span className={`user-account-role-badge role-${account.role}`}>
                              {getRoleLabel(account.role)}
                            </span>
                            <div className="user-account-role-desc">
                              {getRoleDescription(account.role)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`user-account-status-badge status-${account.status.toLowerCase()}`}>
                            {getStatusLabel(account.status)}
                          </span>
                          {account.lastLogin && (
                            <div className="user-account-last-login">
                              <i className="fas fa-sign-in-alt"></i> {language === 'mm' ? 'နောက်ဆုံးဝင်ရောက်' : 'Last'}: {new Date(account.lastLogin).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="user-account-action-buttons">
                            {account.status !== 'Deleted' && (
                              <>
                                <button 
                                  className="user-account-action-btn user-account-action-edit" 
                                  title={language === 'mm' ? 'အကောင့်ပြင်ဆင်ရန်' : 'Edit Account'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction('edit', account.id);
                                  }}
                                  disabled={state.loading}
                                >
                                  <i className="fas fa-edit"></i>
                                </button>
                                <button 
                                  className="user-account-action-btn user-account-action-delete" 
                                  title={language === 'mm' ? 'အကောင့်ဖျက်ရန် (Soft)' : 'Delete Account (Soft)'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleAction('delete', account.id);
                                  }}
                                  disabled={state.loading}
                                >
                                  <i className="fas fa-trash"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="user-account-no-data">
                        <div className="user-account-no-data-content">
                          <i className="fas fa-user-slash"></i>
                          <p>
                            {state.searchQuery 
                              ? (language === 'mm' 
                                ? `"${state.searchQuery}" အတွက် အကောင့်များ မတွေ့ပါ`
                                : `No accounts found for "${state.searchQuery}"`)
                              : state.filters.role !== "all"
                              ? (language === 'mm' 
                                ? "ရွေးချယ်ထားသော စစ်ထုတ်မှုများအတွက် အကောင့်များ မတွေ့ပါ"
                                : "No accounts found for selected filters")
                              : (language === 'mm' ? "အကောင့်များ မတွေ့ပါ" : "No accounts found")}
                          </p>
                          {(state.searchQuery || state.filters.role !== "all") && (
                            <button className="user-account-clear-search-btn secondary" onClick={clearAllFilters}>
                              {language === 'mm' ? 'စစ်ထုတ်မှုများအားလုံး ရှင်းလင်းရန်' : 'Clear All Filters'}
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

      {/* ===== Account Modal ===== */}
      {showAccountModal && currentUser && (
      <div className="user-account-modal-overlay">
        <div className="user-account-modal-content">
          <div className="user-account-modal-header">
            <h3>
              <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i> 
              {modalType === "add" 
                ? (language === 'mm' ? 'အကောင့်အသစ်ဖန်တီးရန်' : 'Create New Account')
                : (language === 'mm' ? 'အကောင့်အခြေအနေပြောင်းလဲရန်' : 'Change Account Status')}
            </h3>
            <button className="user-account-modal-close" onClick={() => setShowAccountModal(false)} disabled={state.loading}>
              <i className="fas fa-times"></i>
            </button>
          </div>
          
          <div className="user-account-modal-body">
            <div className="user-account-current-user-banner">
              <i className="fas fa-user-circle"></i>
              <div>
                <div className="user-account-user-name">{currentUser.name}</div>
                <div className="user-account-user-role">{currentUser.role}</div>
              </div>
            </div>
            
            {validationError && (
              <div className="user-account-validation-error" style={{ marginBottom: '15px' }}>
                <i className="fas fa-exclamation-circle"></i>
                <span>{validationError}</span>
              </div>
            )}
            
            {/* ===== ADD MODE - ပုံမှန်အတိုင်း အကွက်အကုန်ပြ ===== */}
            {modalType === "add" ? (
              <>
                {/* Role Selection */}
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    {language === 'mm' ? 'အခန်းကဏ္ဍ' : 'Role'}
                  </label>
                  <select
                    name="role"
                    value={accountForm.role}
                    onChange={handleFormChange}
                    disabled={state.loading}
                    className={formErrors.role ? 'user-account-input-error' : ''}
                  >
                    {state.dropdownData.roles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.role && (
                    <div className="user-account-field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{formErrors.role}</span>
                    </div>
                  )}
                  <div className="user-account-role-hint">
                    {getRoleDescription(accountForm.role)}
                  </div>
                </div>
                
                {/* Username */}
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    {language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={accountForm.username}
                    onChange={handleFormChange}
                    placeholder={language === 'mm' ? 'အသုံးပြုသူအမည်' : 'username'}
                    maxLength="30"
                    disabled={state.loading}
                    className={formErrors.username ? 'user-account-input-error' : ''}
                  />
                  {formErrors.username && (
                    <div className="user-account-field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{formErrors.username}</span>
                    </div>
                  )}
                </div>
                
                {/* Full Name and Email */}
                <div className="user-account-form-row">
                  <div className="user-account-form-group">
                    <label className="user-account-required">
                      {language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={accountForm.fullName}
                      onChange={handleFormChange}
                      placeholder={language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'John Doe'}
                      maxLength="50"
                      disabled={state.loading}
                      className={formErrors.fullName ? 'user-account-input-error' : ''}
                    />
                    {formErrors.fullName && (
                      <div className="user-account-field-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{formErrors.fullName}</span>
                      </div>
                    )}
                  </div>
                  <div className="user-account-form-group">
                    <label className="user-account-required">
                      {language === 'mm' ? 'အီးမေးလ်' : 'Email'}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={accountForm.email}
                      onChange={handleFormChange}
                      placeholder={language === 'mm' ? 'user@example.com' : 'user@example.com'}
                      disabled={state.loading}
                      className={formErrors.email ? 'user-account-input-error' : ''}
                    />
                    {formErrors.email && (
                      <div className="user-account-field-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{formErrors.email}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Phone and Password */}
                <div className="user-account-form-row">
                  <div className="user-account-form-group">
                    <label>{language === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone'}</label>
                    <input
                      type="text"
                      name="phone"
                      value={accountForm.phone}
                      onChange={handleFormChange}
                      placeholder={language === 'mm' ? '၀၉၁၂၃၄၅၆၇၈၉' : '09123456789'}
                      disabled={state.loading}
                    />
                  </div>
                  <div className="user-account-form-group">
                    <label className="user-account-required">
                      {language === 'mm' ? 'စကားဝှက်' : 'Password'}
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={accountForm.password}
                      onChange={handleFormChange}
                      placeholder={language === 'mm' ? 'စကားဝှက်ထည့်ပါ' : 'Enter password'}
                      disabled={state.loading}
                      className={formErrors.password ? 'user-account-input-error' : ''}
                    />
                    {formErrors.password && (
                      <div className="user-account-field-error">
                        <i className="fas fa-exclamation-circle"></i>
                        <span>{formErrors.password}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Confirm Password */}
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    {language === 'mm' ? 'စကားဝှက်အတည်ပြုရန်' : 'Confirm Password'}
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={accountForm.confirmPassword}
                    onChange={handleFormChange}
                    placeholder={language === 'mm' ? 'စကားဝှက်အတည်ပြုရန်' : 'Confirm password'}
                    disabled={state.loading}
                    className={formErrors.confirmPassword ? 'user-account-input-error' : ''}
                  />
                  {formErrors.confirmPassword && (
                    <div className="user-account-field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{formErrors.confirmPassword}</span>
                    </div>
                  )}
                </div>
                
                {passwordError && (
                  <div className="user-account-password-error">
                    <i className="fas fa-times-circle"></i>
                    <span>{passwordError}</span>
                  </div>
                )}
                
                {/* Status Selection for Add Mode */}
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    {language === 'mm' ? 'အခြေအနေ' : 'Status'}
                  </label>
                  <div className="user-account-status-select-group">
                    <div 
                      className={`user-account-status-option ${accountForm.status === 'Active' ? 'selected' : ''}`}
                      onClick={() => !state.loading && handleStatusChange('Active')}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={accountForm.status === 'Active'}
                        readOnly
                        className="user-account-status-radio"
                        disabled={state.loading}
                      />
                      <label className="user-account-status-label">
                        <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                        {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}
                      </label>
                    </div>
                    <div 
                      className={`user-account-status-option ${accountForm.status === 'Inactive' ? 'selected' : ''}`}
                      onClick={() => !state.loading && handleStatusChange('Inactive')}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={accountForm.status === 'Inactive'}
                        readOnly
                        className="user-account-status-radio"
                        disabled={state.loading}
                      />
                      <label className="user-account-status-label">
                        <i className="fas fa-times-circle" style={{ color: '#f59e0b' }}></i>
                        {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'}
                      </label>
                    </div>
                    <div 
                      className={`user-account-status-option ${accountForm.status === 'Suspended' ? 'selected' : ''}`}
                      onClick={() => !state.loading && handleStatusChange('Suspended')}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Suspended"
                        checked={accountForm.status === 'Suspended'}
                        readOnly
                        className="user-account-status-radio"
                        disabled={state.loading}
                      />
                      <label className="user-account-status-label">
                        <i className="fas fa-pause-circle" style={{ color: '#8b5cf6' }}></i>
                        {language === 'mm' ? 'ဆိုင်းငံ့ထား' : 'Suspended'}
                      </label>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              /* ===== EDIT MODE - ဘယ်ညာယှဉ်ပြီး ပြမယ် ===== */
              <>
                {/* 2-Column Layout for Account Info */}
                <div className="user-account-info-grid">
                  {/* Left Column */}
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
                      <label>{language === 'mm' ? 'အခန်းကဏ္ဍ' : 'Role'}</label>
                      <div className="user-account-info-value">
                        <i className="fas fa-tag"></i>
                        <span className={`user-account-role-badge role-${accountForm.role}`}>
                          {getRoleLabel(accountForm.role)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Right Column */}
                  <div className="user-account-info-column">
                    <div className="user-account-info-item">
                      <label>{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                      <div className="user-account-info-value">
                        <i className="fas fa-envelope"></i>
                        <span>{accountForm.email}</span>
                      </div>
                    </div>
                    
                    <div className="user-account-info-item">
                      <label>{language === 'mm' ? 'ဖုန်းနံပါတ်' : 'Phone'}</label>
                      <div className="user-account-info-value">
                        <i className="fas fa-phone"></i>
                        <span>{accountForm.phone || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="user-account-info-item">
                      <label>{language === 'mm' ? 'အကောင့် ID' : 'Account ID'}</label>
                      <div className="user-account-info-value">
                        <i className="fas fa-hashtag"></i>
                        <span>#{accountForm.id}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Divider */}
                <div className="user-account-divider">
                  <span>{language === 'mm' ? 'အခြေအနေပြောင်းလဲရန်' : 'Change Status'}</span>
                </div>
                
                {/* Status Selection - Only editable field in Edit Mode */}
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    {language === 'mm' ? 'အခြေအနေ' : 'Status'}
                  </label>
                  <div className="user-account-status-select-group">
                    <div 
                      className={`user-account-status-option ${accountForm.status === 'Active' ? 'selected' : ''}`}
                      onClick={() => !state.loading && handleStatusChange('Active')}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Active"
                        checked={accountForm.status === 'Active'}
                        readOnly
                        className="user-account-status-radio"
                        disabled={state.loading}
                      />
                      <label className="user-account-status-label">
                        <i className="fas fa-check-circle" style={{ color: '#5ac4fa' }}></i>
                        {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}
                      </label>
                    </div>
                    <div 
                      className={`user-account-status-option ${accountForm.status === 'Inactive' ? 'selected' : ''}`}
                      onClick={() => !state.loading && handleStatusChange('Inactive')}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Inactive"
                        checked={accountForm.status === 'Inactive'}
                        readOnly
                        className="user-account-status-radio"
                        disabled={state.loading}
                      />
                      <label className="user-account-status-label">
                        <i className="fas fa-times-circle" style={{ color: '#f5356f' }}></i>
                        {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'}
                      </label>
                    </div>
                    <div 
                      className={`user-account-status-option ${accountForm.status === 'Suspended' ? 'selected' : ''}`}
                      onClick={() => !state.loading && handleStatusChange('Suspended')}
                    >
                      <input
                        type="radio"
                        name="status"
                        value="Suspended"
                        checked={accountForm.status === 'Suspended'}
                        readOnly
                        className="user-account-status-radio"
                        disabled={state.loading}
                      />
                      <label className="user-account-status-label">
                        <i className="fas fa-pause-circle" style={{ color: '#f59e0b' }}></i>
                        {language === 'mm' ? 'ဆိုင်းငံ့ထား' : 'Suspended'}
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
          
          <div className="user-account-modal-footer">
            <button className="user-account-btn-cancel" onClick={() => setShowAccountModal(false)} disabled={state.loading}>
              {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
            </button>
            <button 
              className={`user-account-btn-submit ${state.loading ? 'loading' : ''}`} 
              onClick={handleSaveAccount}
              disabled={
                (modalType === "add" ? (
                  !accountForm.username || 
                  !accountForm.fullName || 
                  !accountForm.email || 
                  !accountForm.role ||
                  !accountForm.password || 
                  !accountForm.confirmPassword
                ) : false) ||
                state.loading
              }
            >
              {state.loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...'}
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i> 
                  {modalType === "add" 
                    ? (language === 'mm' ? 'အကောင့်ဖန်တီးရန်' : 'Create Account')
                    : (language === 'mm' ? 'အခြေအနေပြောင်းလဲရန်' : 'Update Status')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )}

      {/* ===== Log Details Modal ===== */}
      {showLogDetails && state.selectedLog && (
        <div className="user-account-modal-overlay">
          <div className="user-account-modal-content" style={{ maxWidth: '600px' }}>
            <div className="user-account-modal-header">
              <h3>
                <i className={`fas ${
                  state.selectedLog.actionType === 'ADD' ? 'fa-plus-circle' : 
                  state.selectedLog.actionType === 'EDIT' ? 'fa-edit' : 
                  'fa-trash'
                }`}></i> 
                {language === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}
              </h3>
              <button className="user-account-modal-close" onClick={() => setShowLogDetails(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="user-account-modal-body">
              <div className="user-account-log-detail-header">
                <div className="user-account-log-detail-main">
                  <div className="user-account-log-detail-action">
                    <span className={`user-account-action-badge user-account-action-${state.selectedLog.actionType?.toLowerCase()}`}>
                      {state.selectedLog.actionType === 'ADD' && <i className="fas fa-plus"></i>}
                      {state.selectedLog.actionType === 'EDIT' && <i className="fas fa-edit"></i>}
                      {state.selectedLog.actionType === 'DELETE' && <i className="fas fa-trash"></i>}
                      {state.selectedLog.actionType === 'ADD' && (language === 'mm' ? 'အကောင့်ဖန်တီးခြင်း' : 'Account Created')}
                      {state.selectedLog.actionType === 'EDIT' && (language === 'mm' ? 'အကောင့်ပြင်ဆင်ခြင်း' : 'Account Updated')}
                      {state.selectedLog.actionType === 'DELETE' && (language === 'mm' ? 'အကောင့်ဖျက်ခြင်း ' : 'Account Deleted ')}
                    </span>
                  </div>
                  {state.selectedLog.accountUsername && (
                    <div className="user-account-log-detail-account">
                      <i className="fas fa-user"></i>
                      <span className="user-account-name">{state.selectedLog.accountUsername}</span>
                      {state.selectedLog.accountId && (
                        <span className="user-account-id-detail">ID: #{state.selectedLog.accountId}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="user-account-log-detail-meta">
                  <div className="user-account-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="user-account-user-name">{state.selectedLog.createdByName}</div>
                      <div className="user-account-user-role">{state.selectedLog.createdByRole || 'SUPER_ADMIN'}</div>
                    </div>
                  </div>
                  <div className="user-account-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="user-account-log-date">{state.selectedLog.date}</div>
                      <div className="user-account-log-time">{state.selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="user-account-log-detail-content">
                <h4>{language === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {state.selectedLog.changes && state.selectedLog.changes.length > 0 ? (
                  <div className="user-account-change-list">
                    {state.selectedLog.changes.map((detail, index) => {
                      const hasArrow = detail.includes('→');
                      
                      return (
                        <div key={index} className="user-account-change-item">
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
                  <div className="user-account-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="user-account-modal-footer">
              <button className="user-account-btn-cancel" onClick={() => setShowLogDetails(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficeAccountPage;