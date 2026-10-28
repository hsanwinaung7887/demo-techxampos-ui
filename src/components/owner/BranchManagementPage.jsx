import React, { useState, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useParams, NavLink } from 'react-router-dom';
import { branchApi } from '../apis/branchApi';
import { shopPlanApi } from '../apis/shopPlanApi';
import { shopApi } from '../apis/shopApi';
import { branchReducer, initialState } from '../owner-useReducer/branchReducer';
import "../../light-style/office-css/branchManagementPage.css";
import { useSelector, useDispatch } from 'react-redux';
import { getOfficeCurrentUser } from '../../redux/slices/officeAuthSlice';

// ===== MODULE LIST FOR PERMISSIONS =====
const MODULE_LIST = [
  { key: 'Category', label: 'Category' },
  { key: 'Inventory', label: 'Inventory' },
  { key: 'Product', label: 'Product' },
  { key: 'Sale', label: 'Sale' },
  { key: 'Return', label: 'Return' },
  { key: 'Credit', label: 'Credit' },
  { key: 'Discount', label: 'Discount' },
  { key: 'Damage', label: 'Damage' },
  { key: 'Expense', label: 'Expense' },
  { key: 'Capital', label: 'Capital' },
  { key: 'BranchAccount', label: 'Branch Account' },
  { key: 'MyAccount', label: 'My Account' },
  { key: 'AboutInfo', label: 'About Info' },
];

const BranchManagementPage = () => {
  const navigate = useNavigate();
  const { shopId } = useParams();

  // Language State
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

  // Reducer
  const [state, localDispatch] = useReducer(branchReducer, {
    ...initialState,
    shopId: parseInt(shopId)
  });

  // Local UI States
  const [shopName, setShopName] = useState('');
  const [showFormModal, setShowFormModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [formData, setFormData] = useState({
    id: null,
    branchCode: '',
    name: '',
    address: '',
    status: 'Active',
    planId: '',
    allowedModules: {
      Category: true,
      Inventory: true,
      Product: true,
      Sale: true,
      Return: true,
      Credit: true,
      Discount: true,
      Damage: true,
      Expense: true,
      Capital: true,
      BranchAccount: true,
      MyAccount: true,
      AboutInfo: true
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [showQuickView, setShowQuickView] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [plans, setPlans] = useState([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('1');
  const [historyPageInputValue, setHistoryPageInputValue] = useState('1');
  const [loadingDirection, setLoadingDirection] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [networkError, setNetworkError] = useState(null);
  const pageChangeTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const isInitialMount = useRef(true);

  // Current User
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

  const reduxDispatch = useDispatch();

  // ❌ ဒီ line ကိုဖယ်ပါ
  // const { selectBranch } = useCart();

  useEffect(() => {
    if (!isAuthenticated && !authLoading) {
      reduxDispatch(getOfficeCurrentUser());
    }
  }, [reduxDispatch, isAuthenticated, authLoading]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/office/login');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // Fetch Shop Details
  useEffect(() => {
    if (shopId && currentUser) {
      shopApi.getShopById(shopId).then(res => {
        if (res.success) setShopName(res.data.name);
      }).catch(console.error);
    }
  }, [shopId, currentUser]);

  // Fetch Plans (active plans only)
  useEffect(() => {
    const fetchPlans = async () => {
      setPlansLoading(true);
      try {
        const res = await shopPlanApi.getPlans({ statusTab: 'active', size: 1000 });
        if (res && Array.isArray(res)) {
          setPlans(res);
        } else if (res && res.data && Array.isArray(res.data)) {
          setPlans(res.data);
        } else {
          console.warn("Unexpected plans response structure:", res);
          setPlans([]);
        }
      } catch (err) {
        console.error('Failed to fetch plans', err);
        setPlans([]);
      } finally {
        setPlansLoading(false);
      }
    };
    fetchPlans();
  }, []);

  // Action Creators
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
    setStatusFilter: (filter) => localDispatch({ type: "SET_STATUS_FILTER", payload: filter }),

    setPagination: (pagination) => localDispatch({ type: "SET_PAGINATION", payload: pagination }),
    setLogPagination: (pagination) => localDispatch({ type: "SET_LOG_PAGINATION", payload: pagination }),

    setDateFilter: (dateFilter) => localDispatch({ type: "SET_DATE_FILTER", payload: dateFilter }),
    setLogFilter: (logFilter) => localDispatch({ type: "SET_LOG_FILTER", payload: logFilter }),

    fetchBranches: (data) => localDispatch({ type: "FETCH_BRANCHES", payload: data }),
    fetchLogs: (data) => localDispatch({ type: "FETCH_LOGS", payload: data }),

    addBranch: (data) => localDispatch({ type: "ADD_BRANCH", payload: data }),
    updateBranch: (data) => localDispatch({ type: "UPDATE_BRANCH", payload: data }),
    deleteBranch: (data) => localDispatch({ type: "DELETE_BRANCH", payload: data }),

    filterBranches: () => localDispatch({ type: "FILTER_BRANCHES" }),
    filterLogs: () => localDispatch({ type: "FILTER_LOGS" }),

    setSelectedLog: (log) => localDispatch({ type: "SET_SELECTED_LOG", payload: log }),
    clearFilters: () => localDispatch({ type: "CLEAR_FILTERS" })
  };

  // ===== Fetch Branches =====
  const fetchBranches = useCallback(async (isInitialLoad = false) => {
    if (!shopId) return;
    setTableLoading(true);
    setNetworkError(null);
    try {
      const params = {
        shopId,
        page: state.pagination.page,
        size: state.pagination.size,
        status: state.statusFilter === 'all' ? '' : state.statusFilter,
        search: state.searchQuery
      };
      const res = await branchApi.getBranches(params);

      if (res.success) {
        const data = res.data;
        actions.fetchBranches({
          branches: data.data || [],
          currentPage: data.currentPage || 1,
          pageSize: data.pageSize || state.pagination.size,
          totalItems: data.totalItems || 0,
          totalPages: data.totalPages || 1,
          statusCounts: data.statusCounts || {},
          summary: data.summary || {}
        });
        setPageInputValue((data.currentPage || 1).toString());
      } else {
        actions.setError(res.message);
      }
    } catch (error) {
      console.error('Fetch branches error:', error);
      if (error.message.includes('Network') || error.message.includes('Failed to fetch')) {
        setNetworkError(language === 'mm'
          ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။"
          : "Cannot connect to server.");
      } else {
        actions.setError(error.message);
      }
    } finally {
      setTableLoading(false);
    }
  }, [shopId, state.pagination.page, state.pagination.size, state.statusFilter, state.searchQuery, language]);

  // ===== Fetch Logs =====
  const fetchLogs = useCallback(async (isInitialLoad = false) => {
    setLoading(true);
    setNetworkError(null);
    try {
      const params = {
        branchId: null,
        page: state.logPagination.page,
        size: state.logPagination.size,
        actionType: state.logFilter,
        dateFilter: state.dateFilter.filter,
        fromDate: state.dateFilter.customFrom || undefined,
        toDate: state.dateFilter.customTo || undefined
      };
      const res = await branchApi.getLogs(params);

      if (res.success) {
        const data = res.data;
        actions.fetchLogs({
          logs: data.data || [],
          currentPage: data.currentPage || 1,
          pageSize: data.pageSize || state.logPagination.size,
          totalItems: data.totalItems || 0,
          totalPages: data.totalPages || 1,
          actionTypeCounts: data.actionTypeCounts || {}
        });
        setHistoryPageInputValue((data.currentPage || 1).toString());
      } else {
        actions.setError(res.message);
      }
    } catch (error) {
      console.error('Fetch logs error:', error);
      if (error.message.includes('Network')) {
        setNetworkError(language === 'mm'
          ? "ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာရှိနေသည်။"
          : "Network error. Please try again.");
      } else {
        actions.setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter.filter, state.dateFilter.customFrom, state.dateFilter.customTo, language]);

  // ===== Initial Load =====
  useEffect(() => {
    if (currentUser && shopId) {
      Promise.all([
        fetchBranches(true),
        fetchLogs(true)
      ]).then(() => {
        isInitialMount.current = false;
      });
    }
  }, [currentUser, shopId]);

  // ===== Filter Effect (branches) =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchBranches();
    }, 500);
    return () => clearTimeout(filterTimeoutRef.current);
  }, [state.searchQuery, state.searchField, state.statusFilter]);

  // ===== Page Change Effect (branches) =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    fetchBranches();
  }, [state.pagination.page, state.pagination.size]);

  // ===== Logs Filter Effect =====
  useEffect(() => {
    if (isInitialMount.current) return;
    fetchLogs();
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter]);

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
      if (state.activeTab === 'active') {
        actions.setStatusFilter('Active');
      } else if (state.activeTab === 'unactive') {
        actions.setStatusFilter('Unactive');
      } else {
        actions.setStatusFilter('all');
      }
    }
  }, [state.activeTab]);

  // ===== Handlers =====
  const handleTabChange = (e) => {
    const tab = e.target.value;
    actions.setActiveTab(tab);
  };

  const handleSearchChange = (e) => {
    actions.setSearchQuery(e.target.value);
  };

  const handleSearchFieldChange = (e) => {
    actions.setSearchField(e.target.value);
  };

  const clearSearch = () => {
    actions.setSearchQuery('');
  };

  // ===== Handle Module Permission Change =====
  const handleModuleChange = (moduleKey) => {
    setFormData(prev => ({
      ...prev,
      allowedModules: {
        ...prev.allowedModules,
        [moduleKey]: !prev.allowedModules[moduleKey]
      }
    }));
  };

  // ===== CRUD Handlers =====
  const validateForm = () => {
    const errors = {};
    setValidationError(null);
    if (!formData.branchCode) {
      errors.branchCode = language === 'mm' ? "ဆိုင်ခွဲကုဒ် လိုအပ်ပါသည်" : "Branch code is required";
    } else if (formData.branchCode.length < 3) {
      errors.branchCode = language === 'mm' ? "အနည်းဆုံး ၃ လုံးရှိရပါမည်" : "At least 3 characters";
    }
    if (!formData.name) {
      errors.name = language === 'mm' ? "ဆိုင်ခွဲအမည် လိုအပ်ပါသည်" : "Branch name is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAction = (action, branch) => {
    if (action === 'edit') {
      setFormData({
        id: branch.id,
        branchCode: branch.branchCode,
        name: branch.name,
        address: branch.address || '',
        status: branch.status,
        planId: branch.planId || '',
        allowedModules: branch.allowedModules || {
          Category: true,
          Inventory: true,
          Product: true,
          Sale: true,
          Return: true,
          Credit: true,
          Discount: true,
          Damage: true,
          Expense: true,
          Capital: true,
          BranchAccount: true,
          MyAccount: true,
          AboutInfo: true
        }
      });
      setFormErrors({});
      setModalType('edit');
      setShowFormModal(true);
    } else if (action === 'delete') {
      if (window.confirm(language === 'mm'
        ? `"${branch.name}" ဆိုင်ခွဲကို ဖျက်ရန် သေချာပါသလား?`
        : `Are you sure you want to delete branch "${branch.name}"?`)) {
        handleDelete(branch.id);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!currentUser) {
      actions.setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    try {
      const res = await branchApi.deleteBranch(id, currentUser);

      if (res.success) {
        actions.deleteBranch({ branchId: id });
        actions.setSuccess(true);
        fetchBranches();
        fetchLogs();
        setTimeout(() => actions.clearSuccess(), 3000);
      } else {
        actions.setError(res.message);
      }
    } catch (error) {
      console.error("Delete error:", error);
      actions.setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) {
      setValidationError(language === 'mm' ? "ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ" : "Please fix the errors");
      return;
    }
    
    if (!currentUser) {
      actions.setError("User not authenticated");
      return;
    }
    
    setLoading(true);
    try {
      const dataToSend = { 
        ...formData, 
        planId: formData.planId === '' ? null : parseInt(formData.planId, 10),
        allowedModules: formData.allowedModules
      };
      let res;
      if (modalType === 'add') {
        res = await branchApi.createBranch(dataToSend, shopId, currentUser);
      } else {
        res = await branchApi.updateBranch(formData.id, dataToSend, currentUser);
      }
      if (res.success) {
        if (modalType === 'add') {
          actions.addBranch({ branch: res.data });
        } else {
          actions.updateBranch({ branch: res.data });
        }
        actions.setSuccess(true);
        setShowFormModal(false);
        fetchBranches();
        fetchLogs();
        setTimeout(() => actions.clearSuccess(), 3000);
      } else {
        actions.setError(res.message);
      }
    } catch (error) {
      console.error("Save error:", error);
      actions.setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // ===== Page change handlers =====
  const changePage = useCallback((newPage, direction) => {
    if (newPage === state.pagination.page || newPage < 1 || newPage > state.pagination.totalPages) return;
    setLoadingDirection(direction);
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    pageChangeTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: newPage });
      setPageInputValue(newPage.toString());
      setLoadingDirection(null);
      if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
    }, 150);
  }, [state.pagination.page, state.pagination.totalPages]);

  const changeHistoryPage = useCallback((newPage, direction) => {
    if (newPage === state.logPagination.page || newPage < 1 || newPage > state.logPagination.totalPages) return;
    setLoadingDirection(direction);
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
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

  // ===== Helper Functions =====
  const getPlanDisplay = (branch) => {
    if (branch.planCode) return branch.planCode;
    if (branch.planId) {
      const plan = plans.find(p => p.id === branch.planId);
      return plan ? plan.planCode : '—';
    }
    return '—';
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

  // ===== Group Logs by Date =====
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

  // ===== Format Change Details =====
  const formatChangeDetails = (log) => {
    if (!log.changes || log.changes.length === 0) {
      if (log.actionType === 'ADD') {
        return [
          language === 'mm' ? `ဆိုင်ခွဲကုဒ်: ${log.branchCode}` : `Branch Code: ${log.branchCode}`,
          language === 'mm' ? `ဆိုင်ခွဲအမည်: ${log.branchName}` : `Branch Name: ${log.branchName}`,
          language === 'mm' ? `အခြေအနေ: အသုံးပြုနိုင်` : `Status: Active`,
          language === 'mm' ? `ဖန်တီးသူ: ${log.createdByName}` : `Created by: ${log.createdByName}`
        ];
      } else if (log.actionType === 'DELETE') {
        return [
          language === 'mm' ? `ဆိုင်ခွဲကုဒ်: ${log.branchCode}` : `Branch Code: ${log.branchCode}`,
          language === 'mm' ? `ဆိုင်ခွဲအမည်: ${log.branchName}` : `Branch Name: ${log.branchName}`,
          language === 'mm' ? 'အခြေအနေ: ဖျက်ပြီးပါပြီ' : 'Status: Deleted',
          language === 'mm' ? `ဖျက်သူ: ${log.createdByName}` : `Deleted by: ${log.createdByName}`
        ];
      }
    }
    return log.changes || [language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No changes recorded'];
  };

  // ===== Loading Spinner =====
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
        <div className="loading-state">Loading user...</div>
      </div>
    );
  }

  return (
    <div className="shop-container">
      {/* Loading Spinner */}
      {/* {((state.activeTab === 'history' && loading) || (state.activeTab !== 'history' && tableLoading)) &&
        <LoadingSpinner direction={loadingDirection} />} */}

      {/* Messages */}
      <div className="shop-messages-container">
        {state.success && (
          <div className="shop-message success">
            <i className="fas fa-check-circle"></i>
            <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation successful!'}</span>
            <button onClick={actions.clearSuccess}><i className="fas fa-times"></i></button>
          </div>
        )}
        {state.error && (
          <div className="shop-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{state.error}</span>
            <button onClick={actions.clearError}><i className="fas fa-times"></i></button>
          </div>
        )}
        {networkError && (
          <div className="shop-network-error">
            <i className="fas fa-wifi-slash"></i>
            <div className="error-content">
              <div className="error-title">{language === 'mm' ? 'ချိတ်ဆက်မှုအမှား' : 'Connection Error'}</div>
              <div className="error-message">{networkError}</div>
            </div>
            <button onClick={() => { setNetworkError(null); fetchBranches(); }}>
              <i className="fas fa-sync-alt"></i> {language === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      {/* Header with Back Button */}
      <div className="shop-management-header">
        <div className="header-top-row">
          <NavLink to="/office/shop/management/page" className="shop-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဆိုင်များသို့ ပြန်သွားရန်' : 'Back to Shops'}
          </NavLink>
          <div className="header-center-content">
            <h1>
              <i className="fas fa-code-branch"></i>
              {shopName ? `${shopName} - ${language === 'mm' ? 'ဆိုင်ခွဲများ' : 'Branches'}` : (language === 'mm' ? 'ဆိုင်ခွဲများ' : 'Branches')}
            </h1>
            <p>{language === 'mm' ? 'ဆိုင်ခွဲအားလုံး စီမံခန့်ခွဲရန်' : 'Manage all branches'}</p>
          </div>
        </div>
      </div>

      {/* Tabs and Controls */}
      <div className="shop-tabs-header">
        <div className="shop-tabs-selector">
          <div className="shop-select-container">
            <i className={`fas ${
              state.activeTab === "all-branches" ? "fa-store" :
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
              <option value="all-branches">
                {language === 'mm' ? 'ဆိုင်ခွဲအားလုံး' : 'All Branches'} ({state.summary.total?.toLocaleString() || 0})
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
                  placeholder={language === 'mm' ? 'ဆိုင်ခွဲကုဒ်၊ အမည် ဖြင့်ရှာဖွေရန်...' : 'Search by branch code, name...'}
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                  disabled={tableLoading}
                />
                {state.searchQuery && (
                  <button className="shop-clear-search-btn" onClick={clearSearch} disabled={tableLoading}>
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
                  <option value="branch_code">{language === 'mm' ? 'ဆိုင်ခွဲကုဒ်' : 'Branch Code'}</option>
                  <option value="name">{language === 'mm' ? 'ဆိုင်ခွဲအမည်' : 'Branch Name'}</option>
                </select>
                {state.searchQuery && (
                  <button className="shop-clear-search-btn secondary" onClick={clearSearch} disabled={tableLoading}>
                    <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            <button className="shop-add-btn" onClick={() => {
              setModalType('add');
              setFormData({ 
                id: null, 
                branchCode: '', 
                name: '', 
                address: '', 
                status: 'Active', 
                planId: '',
                allowedModules: {
                  Category: true,
                  Inventory: true,
                  Product: true,
                  Sale: true,
                  Return: true,
                  Credit: true,
                  Discount: true,
                  Damage: true,
                  Expense: true,
                  Capital: true,
                  BranchAccount: true,
                  MyAccount: true,
                  AboutInfo: true
                }
              });
              setFormErrors({});
              setShowFormModal(true);
            }} disabled={tableLoading}>
              <i className="fas fa-plus"></i> {language === 'mm' ? 'ဆိုင်ခွဲအသစ်ထည့်ရန်' : 'Add Branch'}
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
                  <span className="shop-title-text">{language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}</span>
                </div>
                <div className="shop-title-center">
                  <div className="shop-compact-nav">
                    <button className={`shop-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(state.logPagination.page - 1, 'prev')}
                      disabled={state.logPagination.page === 1 || loading}>
                      {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="shop-page-control">
                      <input type="text" className="shop-page-input" value={historyPageInputValue}
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
                      <span className="shop-page-total">/ {state.logPagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`shop-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(state.logPagination.page + 1, 'next')}
                      disabled={state.logPagination.page === state.logPagination.totalPages || loading}>
                      {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="shop-items-per-page">
                      <select className="shop-per-page-select" value={state.logPagination.size} onChange={handleLogPageSizeChange} disabled={loading}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="shop-per-page-label">{language === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="shop-title-right">
                  {loading ? (
                    <span className="shop-loading-text"><i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                  ) : (
                    <span className="shop-showing-count">
                      <span className="shop-count-numbers">{state.logPagination.total > 0 ? ((state.logPagination.page - 1) * state.logPagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="shop-count-numbers">{Math.min(state.logPagination.page * state.logPagination.size, state.logPagination.total)}</span>
                      <span> / </span>
                      <span className="shop-count-numbers">{state.logPagination.total.toLocaleString()}</span>
                      <span className="shop-count-label">{language === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="shop-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="shop-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button className={`shop-filter-tab ${state.logFilter === "all" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("all"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}>
                    {language === 'mm' ? 'အားလုံး' : 'All'} <span className="shop-filter-count">({state.actionTypeCounts.all?.toLocaleString() || 0})</span>
                  </button>
                  <button className={`shop-filter-tab ${state.logFilter === "ADD" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("ADD"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}>
                    <i className="fas fa-plus"></i> {language === 'mm' ? 'ပေါင်းထည့်ခြင်း' : 'Add'} <span className="shop-filter-count">({state.actionTypeCounts.ADD?.toLocaleString() || 0})</span>
                  </button>
                  <button className={`shop-filter-tab ${state.logFilter === "EDIT" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("EDIT"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}>
                    <i className="fas fa-edit"></i> {language === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Edit'} <span className="shop-filter-count">({state.actionTypeCounts.EDIT?.toLocaleString() || 0})</span>
                  </button>
                  <button className={`shop-filter-tab ${state.logFilter === "DELETE" ? "active" : ""}`}
                    onClick={() => { actions.setLogFilter("DELETE"); actions.setLogPagination({ page: 1 }); setHistoryPageInputValue("1"); }}
                    disabled={loading}>
                    <i className="fas fa-trash"></i> {language === 'mm' ? 'ဖျက်ခြင်း' : 'Delete'} <span className="shop-filter-count">({state.actionTypeCounts.DELETE?.toLocaleString() || 0})</span>
                  </button>
                </div>

                <div className="shop-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button className={`shop-filter-tab ${state.dateFilter.filter === "all" ? "active" : ""}`} onClick={() => handleDateFilterChange("all")} disabled={loading}>
                    {language === 'mm' ? 'အချိန်အားလုံး' : 'All Time'}
                  </button>
                  <button className={`shop-filter-tab ${state.dateFilter.filter === "today" ? "active" : ""}`} onClick={() => handleDateFilterChange("today")} disabled={loading}>
                    {language === 'mm' ? 'ယနေ့' : 'Today'}
                  </button>
                  <button className={`shop-filter-tab ${state.dateFilter.filter === "yesterday" ? "active" : ""}`} onClick={() => handleDateFilterChange("yesterday")} disabled={loading}>
                    {language === 'mm' ? 'မနေ့က' : 'Yesterday'}
                  </button>
                  <button className={`shop-filter-tab ${state.dateFilter.filter === "thisWeek" ? "active" : ""}`} onClick={() => handleDateFilterChange("thisWeek")} disabled={loading}>
                    {language === 'mm' ? 'ဒီအပတ်' : 'This Week'}
                  </button>
                  <button className={`shop-filter-tab ${state.dateFilter.filter === "thisMonth" ? "active" : ""}`} onClick={() => handleDateFilterChange("thisMonth")} disabled={loading}>
                    {language === 'mm' ? 'ဒီလ' : 'This Month'}
                  </button>
                  <button className={`shop-filter-tab ${state.dateFilter.filter === "custom" ? "active" : ""}`} onClick={() => handleDateFilterChange("custom")} disabled={loading}>
                    <i className="fas fa-calendar"></i> {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
                  </button>
                  {state.dateFilter.filter !== "all" && (
                    <button className="shop-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }} disabled={loading}>
                      <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {showDatePicker && (
                <div className="shop-custom-date-picker">
                  <div className="shop-date-picker-row">
                    <label>{language === 'mm' ? 'မှ' : 'From:'}</label>
                    <input type="date" className="shop-date-input" value={state.dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} />
                  </div>
                  <div className="shop-date-picker-row">
                    <label>{language === 'mm' ? 'ထိ' : 'To:'}</label>
                    <input type="date" className="shop-date-input" value={state.dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} />
                  </div>
                  <button className="shop-apply-date-btn" onClick={() => {
                    if (state.dateFilter.customFrom && state.dateFilter.customTo) {
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }
                  }} disabled={!state.dateFilter.customFrom || !state.dateFilter.customTo}>
                    <i className="fas fa-check"></i> {language === 'mm' ? 'အတည်ပြုရန်' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="shop-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin"></i><p>Loading...</p></div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="shop-date-group">
                    <div className="shop-date-header">
                      <span className="shop-date-label">{date}</span>
                      <span className="shop-date-count">{dateLogs.length} {language === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}</span>
                    </div>
                    <div className="cat-logs-list">
                      {dateLogs.map(log => (
                        <div key={log.id} className={`cat-compact-log-entry log-${log.actionType?.toLowerCase()}`} onClick={() => {
                          const formattedLog = {
                            ...log,
                            createdByName: log.createdByName || 'Unknown',
                            createdByRole: log.createdByRole || 'N/A',
                            formattedChanges: formatChangeDetails(log)
                          };
                          actions.setSelectedLog(formattedLog);
                          setShowLogDetails(true);
                        }} style={{ cursor: 'pointer' }}>
                          <div className="cat-log-icon" style={{ color: getActionColor(log.actionType) }}>
                            <i className={`fas ${getActionIcon(log.actionType)}`}></i>
                          </div>
                          <div className="shop-log-content">
                            <div className="shop-log-main-info">
                              <div>
                                <span className="shop-log-action">
                                  {log.actionType === 'ADD' && (language === 'mm' ? 'ဆိုင်ခွဲဖန်တီးခြင်း' : 'Branch Created')}
                                  {log.actionType === 'EDIT' && (language === 'mm' ? 'ဆိုင်ခွဲပြင်ဆင်ခြင်း' : 'Branch Updated')}
                                  {log.actionType === 'DELETE' && (language === 'mm' ? 'ဆိုင်ခွဲဖျက်ခြင်း' : 'Branch Deleted')}
                                </span>
                                <span className="shop-log-branch" style={{marginLeft:"8px"}}>"{log.branchName}"</span>
                              </div>
                            </div>
                            <div className="shop-log-details">
                              <span className="shop-log-user">
                                <i className="fas fa-user"></i> <strong>{log.createdByName}</strong> <span className="shop-user-role">({log.createdByRole})</span>
                              </span>
                              <span className="shop-log-time"><i className="fas fa-clock"></i> {log.timestamp}</span>
                              {log.changes && log.changes.length > 0 && (
                                <span className="shop-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} {language === 'mm' ? 'ခု ပြောင်းလဲမှု' : 'changes'}</span>
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
                  <p>{language === 'mm' ? 'လုပ်ဆောင်ချက်များ မတွေ့ပါ။' : 'No activities found.'}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== BRANCHES TAB ===== */
          <>
            <div className="shop-section-title">
              <div className="shop-title-row">
                <div className="shop-title-left">
                  <i className="fas fa-code-branch"></i>
                  <span className="shop-title-text">
                    {state.activeTab === "all-branches" && (language === 'mm' ? 'ဆိုင်ခွဲအားလုံး' : 'All Branches')}
                    {state.activeTab === "active" && (language === 'mm' ? 'အသုံးပြုနိုင်သောဆိုင်ခွဲများ' : 'Active Branches')}
                    {state.activeTab === "unactive" && (language === 'mm' ? 'အသုံးမပြုနိုင်သောဆိုင်ခွဲများ' : 'Unactive Branches')}
                  </span>
                </div>
                <div className="shop-title-center">
                  <div className="shop-compact-nav">
                    <button className={`shop-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(state.pagination.page - 1, 'prev')}
                      disabled={state.pagination.page === 1 || tableLoading}>
                      {tableLoading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="shop-page-control">
                      <input type="text" className="shop-page-input" value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(pageInputValue);
                          if (!isNaN(val) && val >= 1 && val <= state.pagination.totalPages && val !== state.pagination.page) {
                            changePage(val, 'jump');
                          } else {
                            setPageInputValue(state.pagination.page.toString());
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={tableLoading}
                      />
                      <span className="shop-page-total">/ {state.pagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`shop-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(state.pagination.page + 1, 'next')}
                      disabled={state.pagination.page === state.pagination.totalPages || tableLoading}>
                      {tableLoading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="shop-items-per-page">
                      <select className="shop-per-page-select" value={state.pagination.size} onChange={handlePageSizeChange} disabled={tableLoading}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="shop-per-page-label">{language === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="shop-title-right">
                  {tableLoading ? (
                    <span className="shop-loading-text"><i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                  ) : (
                    <span className="shop-showing-count">
                      <span className="shop-count-numbers">{state.pagination.total > 0 ? ((state.pagination.page - 1) * state.pagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="shop-count-numbers">{Math.min(state.pagination.page * state.pagination.size, state.pagination.total)}</span>
                      <span> / </span>
                      <span className="shop-count-numbers">{state.pagination.total.toLocaleString()}</span>
                      <span className="shop-count-label">{language === 'mm' ? 'ခု' : 'items'}</span>
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
                    <th>{language === 'mm' ? 'ဆိုင်ခွဲကုဒ်' : 'Branch Code'}</th>
                    <th>{language === 'mm' ? 'ဆိုင်ခွဲအမည်' : 'Branch Name'}</th>
                    <th>{language === 'mm' ? 'ပလန်' : 'Plan'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="6" className="shop-no-data"><div className="shop-no-data-content"><i className="fas fa-spinner fa-spin"></i><p>Loading...</p></div></td></tr>
                  ) : state.filteredBranches.length > 0 ? (
                    state.filteredBranches.map((branch, index) => (
                      <tr key={branch.id}>
                        <td>{((state.pagination.page - 1) * state.pagination.size) + index + 1}</td>
                        <td>
                          <div>
                            <strong>{branch.branchCode}</strong>
                            <div className="shop-id">ID: #{branch.id}</div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{branch.name}</strong>
                            {branch.address && <div className="shop-address-info">
                              <i className="fas fa-map-marker-alt"></i>
                              <span>{branch.address}</span>
                            </div>}
                          </div>
                        </td>
                        <td>
                          <span className={`branch-plan-badge ${getPlanDisplay(branch)}`}>
                            {getPlanDisplay(branch)}
                          </span>
                        </td>
                        <td>
                          <span className={`shop-status-badge ${branch.status === 'Active' ? 'status-active' : 'status-unactive'}`}>
                            {branch.status === 'Active' ? (language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active') : (language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive')}
                          </span>
                        </td>
                        <td>
                          <div className="shop-action-buttons">
                            <button className="shop-action-btn" style={{ backgroundColor: '#4361ee' }} title={language === 'mm' ? 'ကြည့်ရှုရန်' : 'View'} onClick={() => { setSelectedBranch(branch); setShowQuickView(true); }}>
                              <i className="fas fa-eye"></i>
                            </button>
                            <button className="shop-action-btn shop-action-edit" title={language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit'} onClick={() => handleAction('edit', branch)} disabled={loading}>
                              <i className="fas fa-edit"></i>
                            </button>
                            <button className="shop-action-btn shop-action-delete" title={language === 'mm' ? 'ဖျက်ရန်' : 'Delete'} onClick={() => handleAction('delete', branch)} disabled={loading}>
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="shop-no-data">
                      <div className="shop-no-data-content">
                        <i className="fas fa-store-slash"></i>
                        <p>{state.searchQuery ? (language === 'mm' ? `"${state.searchQuery}" အတွက် ဆိုင်ခွဲများ မတွေ့ပါ` : `No branches found for "${state.searchQuery}"`) : (language === 'mm' ? 'ဆိုင်ခွဲများ မတွေ့ပါ' : 'No branches found')}</p>
                        {state.searchQuery && <button className="shop-clear-search-btn secondary" onClick={clearSearch}>{language === 'mm' ? 'ရှာဖွေမှု ရှင်းလင်းရန်' : 'Clear Search'}</button>}
                      </div>
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ===== FORM MODAL ===== */}
      {showFormModal && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-content" style={{ maxWidth: '650px' }}>
            <div className="shop-modal-header">
              <h3>
                <i className={`fas ${modalType === 'add' ? 'fa-plus-circle' : 'fa-edit'}`}></i>
                {modalType === 'add' ? (language === 'mm' ? 'ဆိုင်ခွဲအသစ်' : 'New Branch') : (language === 'mm' ? 'ဆိုင်ခွဲပြင်ဆင်ရန်' : 'Edit Branch')}
              </h3>
              <button className="shop-modal-close" onClick={() => setShowFormModal(false)} disabled={loading}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="shop-modal-body">
              {validationError && (
                <div className="shop-validation-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{validationError}</span>
                </div>
              )}
              
              {/* Branch Code */}
              <div className="shop-form-group">
                <label className="shop-required">{language === 'mm' ? 'ဆိုင်ခွဲကုဒ်' : 'Branch Code'}</label>
                <input 
                  type="text" 
                  name="branchCode" 
                  value={formData.branchCode} 
                  onChange={(e) => setFormData({...formData, branchCode: e.target.value})} 
                  placeholder="BR001" 
                  maxLength="20" 
                  disabled={loading} 
                  className={formErrors.branchCode ? 'shop-input-error' : ''} 
                />
                {formErrors.branchCode && (
                  <div className="shop-field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{formErrors.branchCode}</span>
                  </div>
                )}
              </div>
              
              {/* Branch Name */}
              <div className="shop-form-group">
                <label className="shop-required">{language === 'mm' ? 'ဆိုင်ခွဲအမည်' : 'Branch Name'}</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={(e) => setFormData({...formData, name: e.target.value})} 
                  placeholder="Downtown Branch" 
                  maxLength="100" 
                  disabled={loading} 
                  className={formErrors.name ? 'shop-input-error' : ''} 
                />
                {formErrors.name && (
                  <div className="shop-field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{formErrors.name}</span>
                  </div>
                )}
              </div>
              
              {/* Address */}
              <div className="shop-form-group">
                <label>{language === 'mm' ? 'လိပ်စာ' : 'Address'}</label>
                <textarea 
                  name="address" 
                  value={formData.address} 
                  onChange={(e) => setFormData({...formData, address: e.target.value})} 
                  rows="2" 
                  disabled={loading} 
                />
              </div>
              
              {/* Plan */}
              <div className="shop-form-group">
                <label>{language === 'mm' ? 'ပလန်' : 'Plan'}</label>
                <select
                  name="planId"
                  value={formData.planId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      planId: val === '' ? '' : parseInt(val, 10)
                    });
                  }}
                  disabled={loading || plansLoading}
                >
                  <option value="">{language === 'mm' ? 'ပလန်မရွေးပါ' : 'No Plan'}</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.planCode} - {plan.name}</option>
                  ))}
                </select>
              </div>
              
              {/* Status */}
              <div className="shop-form-group">
                <label className="shop-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
                <div className="shop-status-select-group">
                  <div className={`shop-status-option ${formData.status === 'Active' ? 'selected' : ''}`} onClick={() => !loading && setFormData({...formData, status: 'Active'})}>
                    <input type="radio" name="status" value="Active" checked={formData.status === 'Active'} readOnly className="shop-status-radio" disabled={loading} />
                    <label className="shop-status-label">
                      <i className="fas fa-check-circle"></i>
                      {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}
                    </label>
                  </div>
                  <div className={`shop-status-option ${formData.status === 'Unactive' ? 'selected' : ''}`} onClick={() => !loading && setFormData({...formData, status: 'Unactive'})}>
                    <input type="radio" name="status" value="Unactive" checked={formData.status === 'Unactive'} readOnly className="shop-status-radio" disabled={loading} />
                    <label className="shop-status-label">
                      <i className="fas fa-times-circle"></i>
                      {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'}
                    </label>
                  </div>
                </div>
              </div>

              {/* ===== ALLOWED MODULES SECTION ===== */}
              <div className="shop-form-group">
                <label>
                  {language === 'mm' ? 'ခွင့်ပြုထားသော Module များ' : 'Allowed Modules'}
                  <span style={{ fontSize: '12px', fontWeight: '400', color: '#6c757d', marginLeft: '8px' }}>
                    ({language === 'mm' ? 'အမှန်ခြစ်ထားသော Module များသာ ပြသမည်' : 'Only checked modules will be visible'})
                  </span>
                </label>
                <div className="module-permission-grid" style={{ 
                  display: 'grid', 
                  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', 
                  gap: '6px',
                  padding: '12px',
                  border: '1px solid #e9ecef',
                  borderRadius: '8px',
                  backgroundColor: '#f8fafc'
                }}>
                  {MODULE_LIST.map(module => (
                    <label key={module.key} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px',
                      cursor: 'pointer',
                      padding: '6px 10px',
                      borderRadius: '4px',
                      backgroundColor: formData.allowedModules?.[module.key] ? 'rgba(67, 97, 238, 0.08)' : 'transparent',
                      transition: 'background-color 0.2s'
                    }}>
                      <input
                        type="checkbox"
                        checked={formData.allowedModules?.[module.key] !== false}
                        onChange={() => handleModuleChange(module.key)}
                        disabled={loading}
                      />
                      <span style={{ fontSize: '13px', fontWeight: '500' }}>
                        {module.label}
                      </span>
                    </label>
                  ))}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#6c757d' }}>
                  <i className="fas fa-info-circle"></i> 
                  {language === 'mm' 
                    ? 'အမှန်ခြစ်ထားသော Module များသာ ဤဆိုင်ခွဲတွင် ပြသမည်။' 
                    : 'Only checked modules will be visible for this branch.'}
                </div>
              </div>
            </div>
            
            <div className="shop-modal-footer">
              <button className="shop-btn-cancel" onClick={() => setShowFormModal(false)} disabled={loading}>
                {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
              </button>
              <button 
                className={`shop-btn-submit ${loading ? 'loading' : ''}`} 
                onClick={handleSave} 
                disabled={!formData.branchCode.trim() || !formData.name.trim() || loading}
              >
                {loading ? (
                  <><i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...'}</>
                ) : (
                  <><i className="fas fa-save"></i> {modalType === 'add' ? (language === 'mm' ? 'သိမ်းရန်' : 'Save') : (language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Update')}</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== QUICK VIEW MODAL ===== */}
      {showQuickView && selectedBranch && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-content" style={{ maxWidth: '400px' }}>
            <div className="shop-modal-header">
              <h3><i className="fas fa-eye"></i> {language === 'mm' ? 'ဆိုင်ခွဲအသေးစိတ်' : 'Branch Details'}</h3>
              <button className="shop-modal-close" onClick={() => setShowQuickView(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="shop-modal-body">
              <p><strong>{language === 'mm' ? 'ကုဒ်' : 'Code'}: </strong> {selectedBranch.branchCode}</p>
              <p><strong>{language === 'mm' ? 'အမည်' : 'Name'}:</strong> {selectedBranch.name}</p>
              <p><strong>{language === 'mm' ? 'လိပ်စာ' : 'Address'}:</strong> {selectedBranch.address || '—'}</p>
              <p><strong>{language === 'mm' ? 'ပလန်' : 'Plan'}:</strong> <span className='plan-level'>{getPlanDisplay(selectedBranch)}</span></p>
              <p><strong>{language === 'mm' ? 'အခြေအနေ' : 'Status'}:</strong> 
                <span className={`shop-status-badge ${selectedBranch.status === 'Active' ? 'status-active' : 'status-unactive'}`}>
                  {selectedBranch.status === 'Active' ? (language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active') : (language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive')}
                </span>
              </p>
            </div>
            <div className="shop-modal-footer">
              <button className="shop-btn-cancel" onClick={() => setShowQuickView(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOG DETAILS MODAL ===== */}
      {showLogDetails && state.selectedLog && (
        <div className="shop-modal-overlay">
          <div className="shop-modal-content" style={{ maxWidth: '600px' }}>
            <div className="shop-modal-header">
              <h3>
                <i className={`fas ${state.selectedLog.actionType === 'ADD' ? 'fa-plus-circle' : state.selectedLog.actionType === 'EDIT' ? 'fa-edit' : 'fa-trash'}`}></i> 
                {language === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}
              </h3>
              <button className="shop-modal-close" onClick={() => setShowLogDetails(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="shop-modal-body">
              <div className="shop-log-detail-header">
                <div className="shop-log-detail-main">
                  <div className="shop-log-detail-action">
                    <span className={`shop-action-badge shop-action-${state.selectedLog.actionType?.toLowerCase()}`}>
                      {state.selectedLog.actionType === 'ADD' && <i className="fas fa-plus"></i>}
                      {state.selectedLog.actionType === 'EDIT' && <i className="fas fa-edit"></i>}
                      {state.selectedLog.actionType === 'DELETE' && <i className="fas fa-trash"></i>}
                      {state.selectedLog.actionType === 'ADD' && (language === 'mm' ? 'ဆိုင်ခွဲဖန်တီးခြင်း' : 'Branch Created')}
                      {state.selectedLog.actionType === 'EDIT' && (language === 'mm' ? 'ဆိုင်ခွဲပြင်ဆင်ခြင်း' : 'Branch Updated')}
                      {state.selectedLog.actionType === 'DELETE' && (language === 'mm' ? 'ဆိုင်ခွဲဖျက်ခြင်း' : 'Branch Deleted')}
                    </span>
                  </div>
                  {state.selectedLog.branchName && (
                    <div className="shop-log-detail-shop">
                      <i className="fas fa-code-branch"></i>
                      <span className="shop-name">{state.selectedLog.branchName}</span>
                      {state.selectedLog.branchId && <span className="shop-id-detail">ID: #{state.selectedLog.branchId}</span>}
                    </div>
                  )}
                </div>
                <div className="shop-log-detail-meta">
                  <div className="shop-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="shop-user-name-detail"><strong>{state.selectedLog.createdByName}</strong></div>
                      <div className="shop-user-role-detail">{state.selectedLog.createdByRole}</div>
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
                      <div key={index} className="shop-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="shop-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="shop-modal-footer">
              <button className="shop-btn-cancel" onClick={() => setShowLogDetails(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagementPage;