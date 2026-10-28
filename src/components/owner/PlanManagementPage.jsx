import React, { useState, useEffect, useReducer, useRef, useCallback, useMemo } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { initialState, shopPlanReducer } from '../owner-useReducer/shopPlanReducer';
import { shopPlanApi, shopPlanLogsApi } from '../apis/shopPlanApi';
import { useSelector, useDispatch } from 'react-redux';
import { getOfficeCurrentUser } from '../../redux/slices/officeAuthSlice';
import "../../light-style/office-css/shopPlanManagement.css";

const PlanManagementPage = () => {
  const navigate = useNavigate();
  const [state, localDispatch] = useReducer(shopPlanReducer, initialState);
  
  // Language State
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('officeLanguage') || 'en';
  });

  // Listen for language changes
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
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  // ✏️ NEW: Pagination input values and loading direction
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null); // 'prev', 'next', 'jump'
  const pageChangeTimeoutRef = useRef(null); // ✏️ NEW
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  
  // Quick View Modal State
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  
  // Error States
  const [networkError, setNetworkError] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  // Form state
  const [planForm, setPlanForm] = useState({
    id: null,
    planCode: "",
    name: "",
    description: "",
    level: "BASIC",
    price: "",
    currency: "MMK",
    billingCycle: "MONTHLY",
    maxUsers: 1,
    maxProducts: 100,
    storageGb: 1,
    maxBranches: 1,
    status: "Active",
    sortOrder: 0
  });

  // Refs
  const filterTimeoutRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const isInitialMount = useRef(true);


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
  }, [reduxUser?.id, reduxUser?.role, isAuthenticated]);

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
    setLevelFilter: (level) => localDispatch({ type: "SET_LEVEL_FILTER", payload: level }),
    
    setPagination: (pagination) => localDispatch({ type: "SET_PAGINATION", payload: pagination }),
    setLogPagination: (pagination) => localDispatch({ type: "SET_LOG_PAGINATION", payload: pagination }),
    
    setDateFilter: (dateFilter) => localDispatch({ type: "SET_DATE_FILTER", payload: dateFilter }),
    setLogFilter: (logFilter) => localDispatch({ type: "SET_LOG_FILTER", payload: logFilter }),
    
    fetchPlans: (data) => localDispatch({ type: "FETCH_PLANS", payload: data }),
    fetchLogs: (data) => localDispatch({ type: "FETCH_LOGS", payload: data }),
    
    addPlan: (data) => localDispatch({ type: "ADD_PLAN", payload: data }),
    updatePlan: (data) => localDispatch({ type: "UPDATE_PLAN", payload: data }),
    deletePlan: (data) => localDispatch({ type: "DELETE_PLAN", payload: data }),
    
    filterPlans: () => localDispatch({ type: "FILTER_PLANS" }),
    filterLogs: () => localDispatch({ type: "FILTER_LOGS" }),
    
    setSelectedLog: (log) => localDispatch({ type: "SET_SELECTED_LOG", payload: log })
  };

  // ===== Form Validation =====
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    
    setValidationError(null);
    
    if (!planForm.planCode) {
      errors.planCode = language === 'mm' ? "ပလန်ကုဒ် လိုအပ်ပါသည်" : "Plan code is required";
      isValid = false;
    } else if (planForm.planCode.length < 3) {
      errors.planCode = language === 'mm' ? "ပလန်ကုဒ်သည် အနည်းဆုံး ၃ လုံးရှိရပါမည်" : "Plan code must be at least 3 characters";
      isValid = false;
    }
    
    if (!planForm.name) {
      errors.name = language === 'mm' ? "ပလန်အမည် လိုအပ်ပါသည်" : "Plan name is required";
      isValid = false;
    }
    
    if (!planForm.price) {
      errors.price = language === 'mm' ? "စျေးနှုန်း လိုအပ်ပါသည်" : "Price is required";
      isValid = false;
    } else if (planForm.price < 0) {
      errors.price = language === 'mm' ? "စျေးနှုန်းသည် အနုတ်မဖြစ်နိုင်ပါ" : "Price cannot be negative";
      isValid = false;
    }
    
    if (!planForm.level) {
      errors.level = language === 'mm' ? "အဆင့် လိုအပ်ပါသည်" : "Level is required";
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
      fetchPlans();
    }
  };

  // ===== Format Change Details =====
  const formatChangeDetails = (log) => {
    if (!log.changes || log.changes.length === 0) {
      if (log.actionType === 'ADD') {
        return [
          language === 'mm' ? `ပလန်ကုဒ်: ${log.planCode}` : `Plan Code: ${log.planCode}`,
          language === 'mm' ? `ပလန်အမည်: ${log.planName}` : `Plan Name: ${log.planName}`,
          language === 'mm' ? `အဆင့်: ${log.planLevel || 'BASIC'}` : `Level: ${log.planLevel || 'BASIC'}`,
          language === 'mm' ? `အခြေအနေ: အသုံးပြုနိုင်` : `Status: Active`,
          language === 'mm' 
            ? `ဖန်တီးသူ: ${log.createdByName || 'Unknown'} (${log.createdByRole || 'N/A'})` 
            : `Created by: ${log.createdByName || 'Unknown'} (${log.createdByRole || 'N/A'})`
        ];
      } else if (log.actionType === 'DELETE') {
        return [
          language === 'mm' ? `ပလန်ကုဒ်: ${log.planCode}` : `Plan Code: ${log.planCode}`,
          language === 'mm' ? `ပလန်အမည်: ${log.planName}` : `Plan Name: ${log.planName}`,
          language === 'mm' ? `ပလန် ID: #${log.planId}` : `Plan ID: #${log.planId}`,
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
  const fetchPlans = useCallback(async (isInitialLoad = false) => {
  if (isInitialLoad) {
    setTableLoading(true);
  } else {
    setTableLoading(true);
  }
  setNetworkError(null);
  
  try {
    const params = {
      page: state.pagination.page,
      size: state.pagination.size,
      search: state.searchQuery || undefined,
      level: state.levelFilter !== 'all' ? state.levelFilter : undefined,
      statusTab: state.activeTab
    };
    const response = await shopPlanApi.getPlans(params);
    
    // ✅ response ရဲ့ structure ကို စစ်ပါ
    if (response && response.data) {
      actions.fetchPlans({
        plans: response.data || [],
        currentPage: response.currentPage || 1,
        pageSize: response.pageSize || state.pagination.size,
        totalItems: response.totalItems || 0,
        totalPages: response.totalPages || 1,
        summary: response.summary || {},
        levelCounts: response.roleCounts || {},
        statusCounts: response.statusCounts || {}
      });
      setPageInputValue(state.pagination.page.toString());
    } else {
      actions.setError(response?.message || 'No data received');
    }
  } catch (error) {
    console.error("Fetch plans error:", error);
    
    if (error.message?.includes('Network') || error.message?.includes('Failed to fetch')) {
      setNetworkError(language === 'mm' 
        ? "ဆာဗာသို့ ချိတ်ဆက်၍မရပါ။ သင့်အင်တာနက်ချိတ်ဆက်မှုကို စစ်ဆေးပါ။" 
        : "Cannot connect to server. Please check your internet connection.");
    } else {
      actions.setError(error.message);
    }
  } finally {
    // ✅ ဒီနေရာမှာ setTableLoading(false) ထည့်ပါ
    setTableLoading(false);
  }
  }, [state.pagination.page, state.pagination.size, state.searchQuery, state.levelFilter, state.activeTab, language]);


  const fetchLogs = useCallback(async (isInitialLoad = false) => {
  if (isInitialLoad) {
    setLoading(true);
  } else {
    setLoading(true);
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
    
    const response = await shopPlanLogsApi.getLogs(params);
    // ✅ response structure ကို သေချာစစ်ပါ
    if (response && response.success !== false) {
      const responseData = response.data || response;
      
      actions.fetchLogs({
        logs: responseData.data || [],
        currentPage: responseData.currentPage || 1,
        pageSize: responseData.pageSize || state.logPagination.size,
        totalItems: responseData.totalItems || 0,
        totalPages: responseData.totalPages || 1,
        summary: responseData.summary || {},
        actionTypeCounts: responseData.actionTypeCounts || {}
      });
      setHistoryPageInputValue(state.logPagination.page.toString());
    } else {
      console.error("Logs response error:", response);
      actions.setError(response?.message || 'No logs received');
    }
  } catch (error) {
    console.error("Fetch logs error:", error);
    
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
}, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter.filter, state.dateFilter.customFrom, state.dateFilter.customTo, language]);
 
// ===== Initial Load =====
  useEffect(() => {
    if (currentUser) {
      Promise.all([
        fetchPlans(true),
        fetchLogs(true)
      ]).then(() => {
        isInitialMount.current = false;
      });
    }
  }, [currentUser]);

  // ===== Filter Effect =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    filterTimeoutRef.current = setTimeout(() => {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchPlans();
    }, 500);
    
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [state.searchQuery, state.levelFilter]);

  // ===== Page Change Effect =====
  useEffect(() => {
    if (isInitialMount.current || state.activeTab === 'history') return;
    
    fetchPlans();
  }, [state.pagination.page, state.pagination.size]); // ✏️ MODIFIED: depends on pagination

  // ===== Logs Filter Effect =====
  useEffect(() => {
    if (isInitialMount.current) return;
    
    fetchLogs();
  }, [state.logPagination.page, state.logPagination.size, state.logFilter, state.dateFilter]); // ✏️ MODIFIED

  // ===== Filter Plans Locally =====
  useEffect(() => {
    actions.filterPlans();
  }, [state.searchQuery, state.levelFilter, state.activeTab, state.plans]);

  // ===== Filter Logs Locally =====
  useEffect(() => {
    actions.filterLogs();
  }, [state.logFilter, state.dateFilter, state.logs]);

  // ===== Tab Change Effect =====
  useEffect(() => {
    if (isInitialMount.current) return;
    
    if (state.activeTab === 'history') {
      actions.setLogPagination({ page: 1 }); // ✏️ MODIFIED: use actions
      setHistoryPageInputValue("1");
      fetchLogs();
    } else {
      actions.setPagination({ page: 1 });
      setPageInputValue("1");
      fetchPlans();
    }
  }, [state.activeTab]);

  // ===== Handlers =====
  const handleTabChange = (e) => {
    const newTab = e.target.value;
    actions.setActiveTab(newTab);
  };

  const handleSearchChange = (e) => {
    actions.setSearchQuery(e.target.value);
  };

  const handleLevelFilterChange = (e) => {
    actions.setLevelFilter(e.target.value);
  };

  const clearAllFilters = () => {
    actions.setSearchQuery("");
    actions.setLevelFilter("all");
    actions.setPagination({ page: 1 });
    setPageInputValue("1");
  };

  // ===== ✏️ NEW: Page change handlers with direction =====
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

  // ===== ✏️ NEW: Page size handlers =====
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
  const handleAction = async (action, planId) => {
  const plan = state.plansMap.get(planId);
  
  if (action === 'edit') {
    setPlanForm({
      id: plan.id,
      planCode: plan.planCode,
      name: plan.name,
      description: plan.description || "",
      level: plan.level,
      price: plan.price,
      currency: plan.currency,
      billingCycle: plan.billingCycle,
      maxUsers: plan.maxUsers,
      maxProducts: plan.maxProducts,
      storageGb: plan.storageGb,
      maxBranches: plan.maxBranches,
      status: plan.status,
      sortOrder: plan.sortOrder || 0
    });
    setFormErrors({});
    setModalType("edit");
    setShowPlanModal(true);
  } else if (action === 'delete') {
    if (window.confirm(language === 'mm' 
      ? `"${plan.name}" ပလန်ကို ဖျက်ရန် သေချာပါသလား?` 
      : `Are you sure you want to delete the plan "${plan.name}"?`)) {
      try {
        setLoading(true);
      
        // ✅ currentUser ရှိမှသာ delete လုပ်ပါ
        if (!currentUser) {
          actions.setError("User not authenticated");
          setLoading(false);
          return;
        }
        
        const response = await shopPlanApi.deletePlan(planId, currentUser);
        if (response && response.success !== false) {
          actions.deletePlan({ planId });
          await fetchPlans();
          await fetchLogs();
          actions.setSuccess(true);
          setTimeout(() => actions.clearSuccess(), 3000);
        } else {
          actions.setError(response?.message || "Delete failed");
        }
      } catch (error) {
        console.error("Delete error:", error);
        if (error.response?.data?.message) {
          actions.setError(error.response.data.message);
        } else if (error.message?.includes('Network')) {
          setNetworkError(language === 'mm' ? "ကွန်ရက်ချိတ်ဆက်မှု ပြဿနာ" : "Network error");
        } else {
          actions.setError(error.message || "Delete failed");
        }
      } finally {
        setLoading(false);
      }
    }
  } else if (action === 'view') {
    setSelectedPlan(plan);
    setShowQuickViewModal(true);
  }
};

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setPlanForm(prev => ({ ...prev, [name]: value }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setPlanForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleStatusChange = (status) => {
    setPlanForm(prev => ({ ...prev, status }));
  };

  const resetForm = () => {
    setPlanForm({
      id: null,
      planCode: "",
      name: "",
      description: "",
      level: "BASIC",
      price: "",
      currency: "MMK",
      billingCycle: "MONTHLY",
      maxUsers: 1,
      maxProducts: 100,
      storageGb: 1,
      maxBranches: 1,
      status: "Active",
      sortOrder: 0
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    setModalType("add");
    resetForm();
    setShowPlanModal(true);
  };

  const handleSavePlan = async () => {
  if (!validateForm()) {
    setValidationError(language === 'mm' ? "ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ" : "Please fix the errors in the form");
    return;
  }

  try {
    setLoading(true);
    
    if (modalType === "add") {
      // ✅ currentUser ကို ထည့်ပို့ပါ
      const response = await shopPlanApi.createPlan(planForm, currentUser);
      if (response && response.success !== false) {
        setShowPlanModal(false);
        await fetchPlans();
        await fetchLogs();
        actions.setSuccess(true);
        setTimeout(() => actions.clearSuccess(), 3000);
        resetForm();
      } else {
        actions.setError(response?.message || "Create failed");
      }
    } else {
      // ✅ currentUser ကို ထည့်ပို့ပါ
      const response = await shopPlanApi.updatePlan(planForm.id, planForm, currentUser);

      if (response && response.success !== false) {
        setShowPlanModal(false);
        await fetchPlans();
        await fetchLogs();
        actions.setSuccess(true);
        setTimeout(() => actions.clearSuccess(), 3000);
        resetForm();
      } else {
        actions.setError(response?.message || "Update failed");
      }
    }
  } catch (error) {
    console.error("Save plan error:", error);
    
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
  const getLevelLabel = (levelValue) => {
    const level = state.dropdownData.levels.find(l => l.value === levelValue);
    return level ? level.label : levelValue;
  };

  const getStatusLabel = (statusValue) => {
    return statusValue === 'Active' 
      ? (language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active')
      : (language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive');
  };

  const getBillingCycleLabel = (cycleValue) => {
    const cycle = state.dropdownData.billingCycles.find(c => c.value === cycleValue);
    return cycle ? cycle.label : cycleValue;
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

  const getCountByLevel = (levelValue) => {
    if (levelValue === 'all') {
      return state.levelCounts.all || 0;
    }
    return state.levelCounts[levelValue] || 0;
  };

  // ===== ✏️ MODIFIED: Loading Spinner with direction =====
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

  if (authLoading || !currentUser) {
    return (
      <div className="shop-plan-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{language === 'mm' ? 'အသုံးပြုသူဒေတာ ဖွင့်နေသည်...' : 'Loading user data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="shop-plan-container">
      {/* {((state.activeTab === 'history' && (loading || authLoading)) || 
      (state.activeTab !== 'history' && (tableLoading || authLoading))) && 
      <LoadingSpinner direction={loadingDirection} />} */}

      {/* Messages Container */}
      <div className="shop-plan-messages-container">
        {state.success && (
          <div className="shop-plan-message success">
            <i className="fas fa-check-circle"></i>
            <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={actions.clearSuccess}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {state.error && (
          <div className="shop-plan-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{state.error}</span>
            <button onClick={actions.clearError}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {networkError && (
          <div className="shop-plan-network-error">
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
          <NavLink to="/office/dashboard" className="user-account-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်' : 'Back to Dashboard'}
          </NavLink>
          <div className="header-center-content">
            <h1><i className="fas fa-store-alt"></i> {language === 'mm' ? 'ဆိုင်ပလန် စီမံခန့်ခွဲမှု' : 'Shop Plan Management'}</h1>
            <p>{language === 'mm' ? 'ပလန်အားလုံး စီမံခန့်ခွဲရန်' : 'Manage all shop plans'}</p>
          </div>
        </div>
      </div>

      <div className="shop-plan-tabs-header">
        <div className="shop-plan-tabs-selector">
          <div className="shop-plan-select-container">
            <i className={`fas ${
              state.activeTab === "all-plans" ? "fa-cubes" :
              state.activeTab === "active" ? "fa-check-circle" :
              state.activeTab === "inactive" ? "fa-times-circle" :
              "fa-history"
            } shop-plan-select-icon`}></i>
            <select 
              className="shop-plan-tab-select"
              value={state.activeTab}
              onChange={handleTabChange}
              disabled={loading || tableLoading}
            >
              <option value="all-plans">
                {language === 'mm' ? 'ပလန်အားလုံး' : 'All Plans'} ({state.levelCounts.all?.toLocaleString() || 0})
              </option>
              <option value="active">
                {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'} ({state.statusCounts.Active?.toLocaleString() || 0})
              </option>
              <option value="inactive">
                {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'} ({state.statusCounts.Inactive?.toLocaleString() || 0})
              </option>
              <option value="history">
                {language === 'mm' ? 'မှတ်တမ်း' : 'History'} ({state.actionTypeCounts.all?.toLocaleString() || 0})
              </option>
            </select>
            <i className="fas fa-chevron-down shop-plan-select-arrow"></i>
          </div>
        </div>
        
        {state.activeTab !== 'history' && (
          <>
            <div className="shop-plan-search-controls">
              <div className="shop-plan-search-input-group">
                <i className="fas fa-search shop-plan-search-icon"></i>
                <input
                  type="text"
                  className="shop-plan-search-input"
                  placeholder={language === 'mm' ? 'ပလန်ကုဒ်၊ အမည်၊ ဖော်ပြချက်ဖြင့်ရှာဖွေရန်...' : 'Search by plan code, name, description...'}
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                  disabled={tableLoading}
                />
                {state.searchQuery && (
                  <button 
                    className="shop-plan-clear-search-btn" 
                    onClick={() => actions.setSearchQuery("")} 
                    disabled={tableLoading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="shop-plan-filter-select-group">
                <i className="fas fa-tag shop-plan-filter-icon"></i>
                <select 
                  className="shop-plan-filter-select"
                  value={state.levelFilter}
                  onChange={handleLevelFilterChange}
                  disabled={tableLoading}
                >
                  <option value="all">
                    {language === 'mm' ? 'အဆင့်အားလုံး' : 'All Levels'} ({getCountByLevel('all').toLocaleString()})
                  </option>
                  {state.dropdownData.levels.map(level => (
                    <option key={level.value} value={level.value}>
                      {level.label} ({getCountByLevel(level.value).toLocaleString()})
                    </option>
                  ))}
                </select>
                <i className="fas fa-chevron-down shop-plan-select-arrow"></i>
              </div>
              
              <div className="shop-plan-filter-buttons">
                {(state.searchQuery || state.levelFilter !== "all") && (
                  <button 
                    className="shop-plan-clear-filters-btn"
                    onClick={clearAllFilters}
                    disabled={tableLoading}
                  >
                    <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            
            <button 
              className="shop-plan-add-btn"
              onClick={openAddModal}
              disabled={tableLoading}
            >
              <i className="fas fa-plus"></i> {language === 'mm' ? 'ပလန်ဖန်တီးရန်' : 'Create Plan'}
            </button>
          </>
        )}
      </div>
  
      <div className="subtab-content active">
        {state.activeTab === "history" ? (
          /* ===== HISTORY TAB ===== */
          <div className="shop-plan-history-section">
            <div className="shop-plan-section-title">
              <div className="shop-plan-title-row">
                <div className="shop-plan-title-left">
                  <i className="fas fa-history"></i> 
                  <span className="shop-plan-title-text">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}
                  </span>
                </div>

                {/* ✏️ NEW: Center pagination controls for history */}
                <div className="shop-plan-title-center">
                  <div className="shop-plan-compact-nav">
                    <button 
                      className={`shop-plan-nav-btn ${loading ? 'loading' : ''}`} 
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
                    
                    <div className="shop-plan-page-control">
                      <input 
                        type="text" 
                        className="shop-plan-page-input" 
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
                      <span className="shop-plan-page-total">
                        / {state.logPagination.totalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`shop-plan-nav-btn ${loading ? 'loading' : ''}`} 
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
                    
                    <div className="shop-plan-items-per-page">
                      <select 
                        className="shop-plan-per-page-select" 
                        value={state.logPagination.size} 
                        onChange={handleLogPageSizeChange}
                        disabled={loading}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="shop-plan-per-page-label">
                        {language === 'mm' ? '/စာမျက်နှာ' : '/pg'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shop-plan-title-right">
                  {loading ? (
                    <span className="shop-plan-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="shop-plan-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                    </span>
                  ) : (
                    <span className="shop-plan-showing-count">
                      <span className="shop-plan-count-numbers">
                        {state.logPagination.total > 0 ? ((state.logPagination.page - 1) * state.logPagination.size) + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="shop-plan-count-numbers">
                        {Math.min(state.logPagination.page * state.logPagination.size, state.logPagination.total)}
                      </span>
                      <span> / </span>
                      <span className="shop-plan-count-numbers">
                        {state.logPagination.total.toLocaleString()}
                      </span>
                      <span className="shop-plan-count-label">
                        {language === 'mm' ? 'ခု' : 'items'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="shop-plan-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="shop-plan-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button 
                    className={`shop-plan-filter-tab ${state.logFilter === "all" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("all");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'အားလုံး' : 'All'} 
                    <span className="shop-plan-filter-count">
                      ({state.actionTypeCounts.all?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.logFilter === "ADD" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("ADD");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-plus"></i> 
                    {language === 'mm' ? 'ပေါင်းထည့်ခြင်း' : 'Add'} <span className="shop-plan-filter-count">
                      ({state.actionTypeCounts.ADD?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.logFilter === "EDIT" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("EDIT");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-edit"></i> 
                    {language === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Edit'} <span className="shop-plan-filter-count">
                      ({state.actionTypeCounts.EDIT?.toLocaleString() || 0})
                    </span>
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.logFilter === "DELETE" ? "active" : ""}`}
                    onClick={() => { 
                      actions.setLogFilter("DELETE");
                      actions.setLogPagination({ page: 1 });
                      setHistoryPageInputValue("1");
                    }}
                    disabled={loading}
                  >
                    <i className="fas fa-trash"></i> 
                    {language === 'mm' ? 'ဖျက်ခြင်း' : 'Delete'} <span className="shop-plan-filter-count">
                      ({state.actionTypeCounts.DELETE?.toLocaleString() || 0})
                    </span>
                  </button>
                </div>

                <div className="shop-plan-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button 
                    className={`shop-plan-filter-tab ${state.dateFilter.filter === "all" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("all")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'အချိန်အားလုံး' : 'All Time'}
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.dateFilter.filter === "today" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("today")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ယနေ့' : 'Today'}
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.dateFilter.filter === "yesterday" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("yesterday")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'မနေ့က' : 'Yesterday'}
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.dateFilter.filter === "thisWeek" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisWeek")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ဒီအပတ်' : 'This Week'}
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.dateFilter.filter === "thisMonth" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisMonth")}
                    disabled={loading}
                  >
                    {language === 'mm' ? 'ဒီလ' : 'This Month'}
                  </button>
                  <button 
                    className={`shop-plan-filter-tab ${state.dateFilter.filter === "custom" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("custom")}
                    disabled={loading}
                  >
                    <i className="fas fa-calendar"></i> {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
                  </button>
                  
                  {state.dateFilter.filter !== "all" && (
                    <button 
                      className="shop-plan-filter-tab"
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
                <div className="shop-plan-custom-date-picker">
                  <div className="shop-plan-date-picker-row">
                    <label>{language === 'mm' ? 'မှ' : 'From:'}</label>
                    <input
                      type="date"
                      className="shop-plan-date-input"
                      value={state.dateFilter.customFrom}
                      onChange={(e) => handleCustomDateChange('customFrom', e.target.value)}
                    />
                  </div>
                  <div className="shop-plan-date-picker-row">
                    <label>{language === 'mm' ? 'ထိ' : 'To:'}</label>
                    <input
                      type="date"
                      className="shop-plan-date-input"
                      value={state.dateFilter.customTo}
                      onChange={(e) => handleCustomDateChange('customTo', e.target.value)}
                    />
                  </div>
                  <button 
                    className="shop-plan-apply-date-btn"
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
            
            <div className="shop-plan-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state">
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                  <p>{language === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p>
                </div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="shop-plan-date-group">
                    <div className="shop-plan-date-header">
                      <span className="shop-plan-date-label">{date}</span>
                      <span className="shop-plan-date-count">
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
                        <div className="shop-plan-log-content">
                          <div className="shop-plan-log-main-info">
                            <span className="shop-plan-log-action">
                              {log.actionType === 'ADD' && (language === 'mm' ? 'ပလန်အသစ်ထည့်ခြင်း' : 'Plan Added')}
                              {log.actionType === 'EDIT' && (language === 'mm' ? 'ပလန်ပြင်ဆင်ခြင်း' : 'Plan Updated')}
                              {log.actionType === 'DELETE' && (language === 'mm' ? 'ပလန်ဖျက်ခြင်း' : 'Plan Deleted')}
                            </span>
                            <span className="shop-plan-log-plan">
                              "{log.planName}"
                              {log.planId && <span className="shop-plan-plan-id">#{log.planId}</span>}
                            </span>
                          </div>
                          {/* 🔁 Category Page အတိုင်း prod-log-details သုံးမယ် */}
                          <div className="prod-log-details">
                            <span className="shop-plan-log-user">
                              <i className="fas fa-user"></i> 
                              <strong>{log.createdByName || 'Unknown'}</strong>
                              <span className="shop-plan-user-role">({log.createdByRole || 'N/A'})</span>
                            </span>
                            <span className="shop-plan-log-time">
                              <i className="fas fa-clock"></i> {log.timestamp}
                            </span>
                            {log.changes && log.changes.length > 0 && (
                              <span className="shop-plan-log-detail-count">
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
                      className="shop-plan-clear-search-btn secondary"
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
          /* ===== PLANS TAB ===== */
          <>
            <div className="shop-plan-section-title">
              <div className="shop-plan-title-row">
                <div className="shop-plan-title-left">
                  <i className="fas fa-cubes"></i> 
                  <span className="shop-plan-title-text">
                    {state.activeTab === "all-plans" && (language === 'mm' ? 'ပလန်အားလုံး' : 'All Plans')}
                    {state.activeTab === "active" && (language === 'mm' ? 'အသုံးပြုနိုင်သောပလန်များ' : 'Active Plans')}
                    {state.activeTab === "inactive" && (language === 'mm' ? 'အသုံးမပြုနိုင်သောပလန်များ' : 'Inactive Plans')}
                  </span>
                </div>
                
                {/* ✏️ NEW: Center pagination controls for plans */}
                <div className="shop-plan-title-center">
                  <div className="shop-plan-compact-nav">
                    <button 
                      className={`shop-plan-nav-btn ${tableLoading ? 'loading' : ''}`} 
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
                    
                    <div className="shop-plan-page-control">
                      <input 
                        type="text" 
                        className="shop-plan-page-input" 
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
                      <span className="shop-plan-page-total">
                        / {state.pagination.totalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`shop-plan-nav-btn ${tableLoading ? 'loading' : ''}`} 
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
                    
                    <div className="shop-plan-items-per-page">
                      <select 
                        className="shop-plan-per-page-select" 
                        value={state.pagination.size} 
                        onChange={handlePageSizeChange}
                        disabled={tableLoading}
                      >
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="shop-plan-per-page-label">
                        {language === 'mm' ? '/စာမျက်နှာ' : '/pg'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="shop-plan-title-right">
                  {tableLoading ? (
                    <span className="shop-plan-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="shop-plan-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                    </span>
                  ) : (
                    <span className="shop-plan-showing-count">
                      <span className="shop-plan-count-numbers">
                        {state.pagination.total > 0 ? ((state.pagination.page - 1) * state.pagination.size) + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="shop-plan-count-numbers">
                        {Math.min(state.pagination.page * state.pagination.size, state.pagination.total)}
                      </span>
                      <span> / </span>
                      <span className="shop-plan-count-numbers">
                        {state.pagination.total.toLocaleString()}
                      </span>
                      <span className="shop-plan-count-label">
                        {language === 'mm' ? 'ခု' : 'items'}
                      </span>
                    </span>
                  )}
                </div>
              </div>
              
              {(state.searchQuery || state.levelFilter !== "all") && (
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                  {state.searchQuery && (
                    <span className="shop-plan-search-badge">
                      <i className="fas fa-search"></i> "{state.searchQuery}"
                    </span>
                  )}
                  {state.levelFilter !== "all" && (
                    <span className="shop-plan-filter-badge">
                      <i className="fas fa-tag"></i> {language === 'mm' ? 'အဆင့်' : 'Level'}: {state.dropdownData.levels.find(l => l.value === state.levelFilter)?.label}
                    </span>
                  )}
                </div>
              )}
            </div>
            
            <div className="shop-plan-table-wrapper" ref={tableBodyRef}>
              <table className="shop-plan-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{language === 'mm' ? 'ပလန်ကုဒ်' : 'Plan Code'}</th>
                    <th>{language === 'mm' ? 'ပလန်အမည်' : 'Plan Name'}</th>
                    <th>{language === 'mm' ? 'အဆင့်' : 'Level'}</th>
                    <th>{language === 'mm' ? 'အသုံးပြုသူ' : 'Users'}</th>
                    <th>{language === 'mm' ? 'ပစ္စည်း' : 'Products'}</th>
                    <th>{language === 'mm' ? 'စျေးနှုန်း' : 'Price'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr>
                      <td colSpan="9" className="shop-plan-no-data">
                        <div className="shop-plan-no-data-content">
                          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i>
                          <p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading data...'}</p>
                        </div>
                      </td>
                    </tr>
                  ) : state.filteredPlans.length > 0 ? (
                    state.filteredPlans.map((plan, index) => (
                      <tr key={plan.id}>
                        <td>{((state.pagination.page - 1) * state.pagination.size) + index + 1}</td>
                        <td>
                          <div>
                            <strong>{plan.planCode}</strong>
                            {plan.createdAt && (
                              <div className="shop-plan-created">
                                <i className="far fa-clock"></i> {language === 'mm' ? 'ဖန်တီးရက်' : 'Created'}: {new Date(plan.createdAt).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>
                          <div>
                            <strong>{plan.name}</strong>
                            {plan.description && (
                              <div className="shop-plan-description">{plan.description}</div>
                            )}
                          </div>
                        </td>
                        <td>
                          <span className={`shop-plan-level-badge level-${plan.level}`}>
                            {getLevelLabel(plan.level)}
                          </span>
                        </td>
                        <td>
                          <span className="shop-plan-feature-value">{plan.maxUsers}</span>
                        </td>
                        <td>
                          <span className="shop-plan-feature-value">{plan.maxProducts.toLocaleString()}</span>
                        </td>
                        <td>
                          <span className="shop-plan-price-tag">
                            {plan.currency} {plan.price.toLocaleString()}
                            <div className="shop-plan-billing-cycle">{plan.billingCycle}</div>
                          </span>
                        </td>
                        <td>
                          <span className={`shop-plan-status-badge ${plan.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                            {getStatusLabel(plan.status)}
                          </span>
                        </td>
                        <td>
                          <div className="shop-plan-action-buttons">
                            <button 
                              className="shop-plan-action-btn shop-plan-action-view" 
                              title={language === 'mm' ? 'အမြန်ကြည့်ရန်' : 'Quick View'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('view', plan.id);
                              }}
                              disabled={loading}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            <button 
                              className="shop-plan-action-btn shop-plan-action-edit" 
                              title={language === 'mm' ? 'ပလန်ပြင်ဆင်ရန်' : 'Edit Plan'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('edit', plan.id);
                              }}
                              disabled={loading}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="shop-plan-action-btn shop-plan-action-delete" 
                              title={language === 'mm' ? 'ပလန်ဖျက်ရန်' : 'Delete Plan'}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('delete', plan.id);
                              }}
                              disabled={loading}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="9" className="shop-plan-no-data">
                        <div className="shop-plan-no-data-content">
                          <i className="fas fa-cubes"></i>
                          <p>
                            {state.searchQuery 
                              ? (language === 'mm' 
                                ? `"${state.searchQuery}" အတွက် ပလန်များ မတွေ့ပါ`
                                : `No plans found for "${state.searchQuery}"`)
                              : state.levelFilter !== "all"
                              ? (language === 'mm' 
                                ? "ရွေးချယ်ထားသော စစ်ထုတ်မှုများအတွက် ပလန်များ မတွေ့ပါ"
                                : "No plans found for selected filters")
                              : (language === 'mm' ? "ပလန်များ မတွေ့ပါ" : "No plans found")}
                          </p>
                          {(state.searchQuery || state.levelFilter !== "all") && (
                            <button className="shop-plan-clear-search-btn secondary" onClick={clearAllFilters}>
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

      {/* ===== Plan Modal (Add/Edit) ===== */}
      {showPlanModal && currentUser && (
        <div className="shop-plan-modal-overlay">
          <div className="shop-plan-modal-content">
            <div className="shop-plan-modal-header">
              <h3>
                <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i> 
                {modalType === "add" 
                  ? (language === 'mm' ? 'ပလန်အသစ်ဖန်တီးရန်' : 'Create New Plan')
                  : (language === 'mm' ? 'ပလန်ပြင်ဆင်ရန်' : 'Edit Plan')}
              </h3>
              <button className="shop-plan-modal-close" onClick={() => setShowPlanModal(false)} disabled={loading}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="shop-plan-modal-body">
              <div className="shop-plan-current-user-banner">
                <i className="fas fa-user-circle"></i>
                <div>
                  <div className="shop-plan-user-name">{currentUser.username}</div>
                  <div className="shop-plan-user-role">{currentUser.role}</div>
                </div>
              </div>
              
              {validationError && (
                <div className="shop-plan-validation-error" style={{ marginBottom: '15px' }}>
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{validationError}</span>
                </div>
              )}
              
              {/* Plan Code and Name */}
              <div className="shop-plan-form-row">
                <div className="shop-plan-form-group">
                  <label className="shop-plan-required">
                    {language === 'mm' ? 'ပလန်ကုဒ်' : 'Plan Code'}
                  </label>
                  <input
                    type="text"
                    name="planCode"
                    value={planForm.planCode}
                    onChange={handleFormChange}
                    placeholder={language === 'mm' ? 'BASIC_MONTHLY' : 'BASIC_MONTHLY'}
                    maxLength="50"
                    disabled={loading}
                    className={formErrors.planCode ? 'shop-plan-input-error' : ''}
                  />
                  {formErrors.planCode && (
                    <div className="shop-plan-field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{formErrors.planCode}</span>
                    </div>
                  )}
                </div>
                <div className="shop-plan-form-group">
                  <label className="shop-plan-required">
                    {language === 'mm' ? 'ပလန်အမည်' : 'Plan Name'}
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={planForm.name}
                    onChange={handleFormChange}
                    placeholder={language === 'mm' ? 'အခြေခံ လစဉ်' : 'Basic Monthly'}
                    maxLength="100"
                    disabled={loading}
                    className={formErrors.name ? 'shop-plan-input-error' : ''}
                  />
                  {formErrors.name && (
                    <div className="shop-plan-field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{formErrors.name}</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Description */}
              <div className="shop-plan-form-group">
                <label>{language === 'mm' ? 'ဖော်ပြချက်' : 'Description'}</label>
                <textarea
                  name="description"
                  value={planForm.description}
                  onChange={handleFormChange}
                  placeholder={language === 'mm' ? 'ပလန်အကြောင်းအသေးစိတ်...' : 'Plan description...'}
                  rows="2"
                  maxLength="500"
                  disabled={loading}
                />
              </div>
              
              {/* Level and Billing Cycle */}
              <div className="shop-plan-form-row">
                <div className="shop-plan-form-group">
                  <label className="shop-plan-required">
                    {language === 'mm' ? 'အဆင့်' : 'Level'}
                  </label>
                  <select
                    name="level"
                    value={planForm.level}
                    onChange={handleFormChange}
                    disabled={loading}
                    className={formErrors.level ? 'shop-plan-input-error' : ''}
                  >
                    {state.dropdownData.levels.map(level => (
                      <option key={level.value} value={level.value}>
                        {level.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.level && (
                    <div className="shop-plan-field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{formErrors.level}</span>
                    </div>
                  )}
                </div>
                <div className="shop-plan-form-group">
                  <label className="shop-plan-required">
                    {language === 'mm' ? 'ငွေပေးချေမှု ကာလ' : 'Billing Cycle'}
                  </label>
                  <select
                    name="billingCycle"
                    value={planForm.billingCycle}
                    onChange={handleFormChange}
                    disabled={loading}
                  >
                    {state.dropdownData.billingCycles.map(cycle => (
                      <option key={cycle.value} value={cycle.value}>
                        {cycle.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Price and Currency */}
              <div className="shop-plan-form-row">
                <div className="shop-plan-form-group">
                  <label className="shop-plan-required">
                    {language === 'mm' ? 'စျေးနှုန်း' : 'Price'}
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={planForm.price}
                    onChange={handleNumberChange}
                    placeholder="50000"
                    min="0"
                    step="1000"
                    disabled={loading}
                    className={formErrors.price ? 'shop-plan-input-error' : ''}
                  />
                  {formErrors.price && (
                    <div className="shop-plan-field-error">
                      <i className="fas fa-exclamation-circle"></i>
                      <span>{formErrors.price}</span>
                    </div>
                  )}
                </div>
                <div className="shop-plan-form-group">
                  <label>{language === 'mm' ? 'ငွေကြေး' : 'Currency'}</label>
                  <select
                    name="currency"
                    value={planForm.currency}
                    onChange={handleFormChange}
                    disabled={loading}
                  >
                    {state.dropdownData.currencies.map(currency => (
                      <option key={currency.value} value={currency.value}>
                        {currency.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Features Section */}
              <div className="shop-plan-section-divider">
                <h4>{language === 'mm' ? 'အင်္ဂါရပ်များနှင့် ကန့်သတ်ချက်များ' : 'Features & Limits'}</h4>
              </div>
              
              <div className="shop-plan-form-row">  {/* ================ */}
                <div className="shop-plan-form-group">
                  <label>{language === 'mm' ? 'အများဆုံး အသုံးပြုသူ' : 'Max Users'}</label>
                  <input
                    type="number"
                    name="maxUsers"
                    value={planForm.maxUsers}
                    onChange={handleNumberChange}
                    min="1"
                    disabled={loading}
                  />
                </div>
                <div className="shop-plan-form-group">
                  <label>{language === 'mm' ? 'အများဆုံး ပစ္စည်း' : 'Max Products'}</label>
                  <input
                    type="number"
                    name="maxProducts"
                    value={planForm.maxProducts}
                    onChange={handleNumberChange}
                    min="1"
                    disabled={loading}
                  />
                </div>
              </div>
              
              <div className="shop-plan-form-row">
                <div className="shop-plan-form-group">
                  <label>{language === 'mm' ? 'သိုလှောင်မှု (GB)' : 'Storage (GB)'}</label>
                  <input
                    type="number"
                    name="storageGb"
                    value={planForm.storageGb}
                    onChange={handleNumberChange}
                    min="0.1"
                    step="0.1"
                    disabled={loading}
                  />
                </div>
              </div>
              
              {/* Sort Order */}
              <div className="shop-plan-form-group">
                <label>{language === 'mm' ? 'စီအစဉ်' : 'Sort Order'}</label>
                <input
                  type="number"
                  name="sortOrder"
                  value={planForm.sortOrder}
                  onChange={handleNumberChange}
                  min="0"
                  disabled={loading}
                />
              </div>
              
              {/* Status Selection */}
              <div className="shop-plan-form-group">
                <label className="shop-plan-required">
                  {language === 'mm' ? 'အခြေအနေ' : 'Status'}
                </label>
                <div className="shop-plan-status-select-group">
                  <div 
                    className={`shop-plan-status-option ${planForm.status === 'Active' ? 'selected' : ''}`}
                    onClick={() => !loading && handleStatusChange('Active')}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={planForm.status === 'Active'}
                      readOnly
                      className="shop-plan-status-radio"
                      disabled={loading}
                    />
                    <label className="shop-plan-status-label">
                      <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                      {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}
                    </label>
                  </div>
                  <div 
                    className={`shop-plan-status-option ${planForm.status === 'Inactive' ? 'selected' : ''}`}
                    onClick={() => !loading && handleStatusChange('Inactive')}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={planForm.status === 'Inactive'}
                      readOnly
                      className="shop-plan-status-radio"
                      disabled={loading}
                    />
                    <label className="shop-plan-status-label">
                      <i className="fas fa-times-circle" style={{ color: '#f59e0b' }}></i>
                      {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'}
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="shop-plan-modal-footer">
              <button className="shop-plan-btn-cancel" onClick={() => setShowPlanModal(false)} disabled={loading}>
                {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
              </button>
              <button 
                className={`shop-plan-btn-submit ${loading ? 'loading' : ''}`} 
                onClick={handleSavePlan}
                disabled={
                  !planForm.planCode || 
                  !planForm.name || 
                  !planForm.price ||
                  loading
                }
              >
                {loading ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> 
                    {modalType === "add" 
                      ? (language === 'mm' ? 'ပလန်ဖန်တီးရန်' : 'Create Plan')
                      : (language === 'mm' ? 'သိမ်းဆည်းရန်' : 'Save Changes')}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Quick View Modal (Read Only) ===== */}
      {showQuickViewModal && selectedPlan && (
        <div className="shop-plan-modal-overlay">
          <div className="shop-plan-modal-content" style={{ maxWidth: '700px' }}>
            <div className="shop-plan-modal-header">
              <h3>
                <i className="fas fa-eye"></i> 
                {language === 'mm' ? 'ပလန်အသေးစိတ်' : 'Plan Details'} 
              </h3>
              <button className="shop-plan-modal-close" onClick={() => setShowQuickViewModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="shop-plan-modal-body">
              {/* Plan Header */}
              <div className="quick-view-header">
                <div className="quick-view-title">
                  <h2>{selectedPlan.name}</h2>
                  <span className={`quick-view-status-badge ${selectedPlan.status === 'Active' ? 'status-active' : 'status-inactive'}`}>
                    {getStatusLabel(selectedPlan.status)}
                  </span>
                </div>
                <div className="quick-view-code">
                  <span className="code-label">{language === 'mm' ? 'ပလန်ကုဒ်' : 'Plan Code'}:</span>
                  <span className="code-value">{selectedPlan.planCode}</span>
                </div>
              </div>

              {/* Plan Description */}
              {selectedPlan.description && (
                <div className="quick-view-description">
                  <i className="fas fa-quote-left"></i>
                  <p>{selectedPlan.description}</p>
                </div>
              )}

              {/* Features Section */}
              <div className="quick-view-features">
                <h4>
                  <i className="fas fa-cogs"></i>
                  {language === 'mm' ? 'အင်္ဂါရပ်များ' : 'Features'}
                </h4>
                <div className="features-grid">
                  <div className="feature-card">
                    <i className="fas fa-tag"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'အဆင့်' : 'Level'}</span>
                      <span className={`item-value level-badge level-${selectedPlan.level}`}>
                      {getLevelLabel(selectedPlan.level)}
                    </span>
                    </div>
                  </div>
                  
                  <div className="feature-card">
                    <i className="fas fa-money-bill-wave"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'စျေးနှုန်း' : 'Price'}</span>
                      <span className="item-value bill">
                      {getBillingCycleLabel(selectedPlan.billingCycle)}
                    </span>
                    </div>
                  </div>

                  <div className="feature-card">
                    <i className="fas fa-credit-card"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'ငွေပေးချေမှု ကာလ' : 'Billing Cycle'}</span>
                      <span className="item-value price-value">
                      {selectedPlan.currency} {selectedPlan.price.toLocaleString()}
                    </span>
                    </div>
                  </div>
                  <div className="feature-card">
                    <i className="fas fa-user"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'ဖန်တီးသူ' : 'Created By'}</span>
                      <span className="item-value">
                      {selectedPlan.createdBy || '-'}
                    </span>
                    </div>
                  </div>
                  <div className="feature-card">
                    <i className="fas fa-users"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'အများဆုံး အသုံးပြုသူ' : 'Max Users'}</span>
                      <span className="feature-value">{selectedPlan.maxUsers}</span>
                    </div>
                  </div>
                  <div className="feature-card">
                    <i className="fas fa-box"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'အများဆုံး ပစ္စည်း' : 'Max Products'}</span>
                      <span className="feature-value">{selectedPlan.maxProducts.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="feature-card">
                    <i className="fas fa-hdd"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'သိုလှောင်မှု' : 'Storage'}</span>
                      <span className="feature-value">{selectedPlan.storageGb} GB</span>
                    </div>
                  </div>

                    <div className="feature-card">
                    <i className="fas fa-sort-amount-down"></i>
                    <div className="feature-content">
                      <span className="feature-title">{language === 'mm' ? 'စီအစဉ်' : 'Sort Order'}</span>
                      <span className="item-value">
                      #{selectedPlan.sortOrder}
                    </span>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* ID Info */}
              <div className="quick-view-footer">
                <span className="id-info">
                  <i className="fas fa-hashtag"></i>
                  {language === 'mm' ? 'ပလန် ID' : 'Plan ID'}: #{selectedPlan.id}
                </span>
              </div>
            </div>
            
            <div className="shop-plan-modal-footer">
              <button 
                className="shop-plan-btn-edit" 
                onClick={() => {
                  setShowQuickViewModal(false);
                  handleAction('edit', selectedPlan.id);
                }}
              >
                <i className="fas fa-edit"></i> 
                {language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit Plan'}
              </button>
              <button className="shop-plan-btn-cancel" onClick={() => setShowQuickViewModal(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Log Details Modal ===== */}
      {showLogDetails && state.selectedLog && (
        <div className="shop-plan-modal-overlay">
          <div className="shop-plan-modal-content" style={{ maxWidth: '600px' }}>
            <div className="shop-plan-modal-header">
              <h3>
                <i className={`fas ${
                  state.selectedLog.actionType === 'ADD' ? 'fa-plus-circle' : 
                  state.selectedLog.actionType === 'EDIT' ? 'fa-edit' : 
                  'fa-trash'
                }`}></i> 
                {language === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}
              </h3>
              <button className="shop-plan-modal-close" onClick={() => setShowLogDetails(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="shop-plan-modal-body">
              <div className="shop-plan-log-detail-header">
                <div className="shop-plan-log-detail-main">
                  <div className="shop-plan-log-detail-action">
                    <span className={`shop-plan-action-badge shop-plan-action-${state.selectedLog.actionType?.toLowerCase()}`}>
                      {state.selectedLog.actionType === 'ADD' && <i className="fas fa-plus"></i>}
                      {state.selectedLog.actionType === 'EDIT' && <i className="fas fa-edit"></i>}
                      {state.selectedLog.actionType === 'DELETE' && <i className="fas fa-trash"></i>}
                      {state.selectedLog.actionType === 'ADD' && (language === 'mm' ? 'ပလန်ဖန်တီးခြင်း' : 'Plan Created')}
                      {state.selectedLog.actionType === 'EDIT' && (language === 'mm' ? 'ပလန်ပြင်ဆင်ခြင်း' : 'Plan Updated')}
                      {state.selectedLog.actionType === 'DELETE' && (language === 'mm' ? 'ပလန်ဖျက်ခြင်း' : 'Plan Deleted')}
                    </span>
                  </div>
                  {state.selectedLog.planName && (
                    <div className="shop-plan-log-detail-plan">
                      <i className="fas fa-cube"></i>
                      <span className="shop-plan-name">{state.selectedLog.planName}</span>
                      {state.selectedLog.planId && (
                        <span className="shop-plan-id-detail">ID: #{state.selectedLog.planId}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="shop-plan-log-detail-meta">
                <div className="shop-plan-log-detail-user">
                  <i className="fas fa-user"></i>
                  <div>
                    <div className="shop-plan-user-name">
                      <strong>{state.selectedLog.createdByName || state.selectedLog.createdBy || 'Unknown'}</strong>
                    </div>
                    <div className="shop-plan-user-role">
                      {state.selectedLog.createdByRole || 'N/A'}
                    </div>
                  </div>
                </div>
                  <div className="shop-plan-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="shop-plan-log-date">{state.selectedLog.date}</div>
                      <div className="shop-plan-log-time">{state.selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="shop-plan-log-detail-content">
                <h4>{language === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {state.selectedLog.changes && state.selectedLog.changes.length > 0 ? (
                  <div className="shop-plan-change-list">
                    {state.selectedLog.changes.map((detail, index) => {
                      const hasArrow = detail.includes('→');
                      
                      return (
                        <div key={index} className="shop-plan-change-item">
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
                  <div className="shop-plan-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="shop-plan-modal-footer">
              <button className="shop-plan-btn-cancel" onClick={() => setShowLogDetails(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PlanManagementPage;