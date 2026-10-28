// src/components/user/BranchAccountManagementPage.jsx (DEMO Version - FIXED)
import React, { useState, useEffect, useRef, useMemo, useCallback, useReducer } from 'react';
import { useNavigate, useLocation, NavLink } from 'react-router-dom';
import "../../light-style/user-css/branchAccountManagement.css";

// ============================================================
// ✅ JSON DEMO DATA
// ============================================================
const DEMO_CURRENT_USER = {
  id: 1,
  username: "manager01",
  name: "Aung Aung",
  fullName: "Aung Aung",
  role: "MANAGER",
  status: "Active",
  branchId: 1,
  branchCode: "branch",
};

// ✅ Demo accounts (branchCode filter မလုပ်တော့ဘူး)
const DEMO_ACCOUNTS = [
  { id: 1, username: "manager01", fullName: "Aung Aung", email: "manager01@branch.com", phone: "09123456789", role: "MANAGER", status: "Active", branchId: 1, branchCode: "branch", createdAt: new Date(Date.now() - 7*86400000).toISOString() },
  { id: 2, username: "staff01", fullName: "Su Su", email: "staff01@branch.com", phone: "09234567890", role: "STAFF", status: "Active", branchId: 1, branchCode: "branch", createdAt: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 3, username: "cashier01", fullName: "Kyaw Kyaw", email: "cashier01@branch.com", phone: "09345678901", role: "CASHIER", status: "Active", branchId: 1, branchCode: "branch", createdAt: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 4, username: "inv01", fullName: "Mya Mya", email: "inv01@branch.com", phone: "09456789012", role: "INVENTORY_STAFF", status: "Unactive", branchId: 1, branchCode: "branch", createdAt: new Date(Date.now() - 2*86400000).toISOString() },
  { id: 5, username: "staff02", fullName: "Hla Hla", email: "staff02@branch.com", phone: "09567890123", role: "STAFF", status: "Pending", branchId: 1, branchCode: "branch", createdAt: new Date(Date.now() - 1*86400000).toISOString() },
  { id: 6, username: "viewer01", fullName: "Nwe Nwe", email: "viewer01@branch.com", phone: "09678901234", role: "VIEWER", status: "Active", branchId: 1, branchCode: "branch", createdAt: new Date(Date.now() - 6*86400000).toISOString() },
];

const DEMO_LOGS = [
  { id: 1, actionType: "ADD", accountId: 2, username: "staff01", createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 5*86400000).toISOString(), changes: ["Username: staff01", "Role: STAFF", "Status: Active"] },
  { id: 2, actionType: "ADD", accountId: 3, username: "cashier01", createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 3*86400000).toISOString(), changes: ["Username: cashier01", "Role: CASHIER", "Status: Active"] },
  { id: 3, actionType: "EDIT", accountId: 3, username: "cashier01", createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 2*86400000).toISOString(), changes: ["Status: Active → Unactive"] },
  { id: 4, actionType: "DELETE", accountId: 6, username: "old_staff", createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 1*86400000).toISOString(), changes: ["Account deleted"] },
  { id: 5, actionType: "ADD", accountId: 5, username: "staff02", createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 1*86400000).toISOString(), changes: ["Username: staff02", "Role: STAFF", "Status: Pending"] },
];

const ROLES = [
  { value: "STAFF", label: "Staff", label_mm: "ဝန်ထမ်း" },
  { value: "MANAGER", label: "Manager", label_mm: "မန်နေဂျာ" },
  { value: "INVENTORY_STAFF", label: "Inventory Staff", label_mm: "ပစ္စည်းထိန်း" },
  { value: "CASHIER", label: "Cashier", label_mm: "ငွေကိုင်" },
  { value: "VIEWER", label: "Viewer", label_mm: "ကြည့်ရှုသူ" },
];

// ============================================================
// Initial State
// ============================================================
const initialState = {
  accounts: [],
  accountsMap: new Map(),
  filteredAccounts: [],
  selectedAccount: null,
  planLimit: null,
  logs: [],
  filteredLogs: [],
  selectedLog: null,
  error: null,
  loading: false,
  tableLoading: false,
  success: false,
  activeTab: "all-accounts",
  searchQuery: "",
  searchField: "all",
  pagination: { page: 1, size: 10, total: 0, totalPages: 0, hasMore: false, hasPrevious: false },
  logPagination: { page: 1, size: 10, total: 0, totalPages: 0, hasMore: false, hasPrevious: false },
  logFilter: "all",
  dateFilter: { filter: "all", customFrom: "", customTo: "" },
  summary: { total: 0, active: 0, unactive: 0, filteredTotal: 0, logSummary: { total: 0, add: 0, edit: 0, delete: 0, today: 0 } },
  statusCounts: { Active: 0, Unactive: 0, Pending: 0 },
  roleCounts: {},
  actionTypeCounts: { all: 0, ADD: 0, EDIT: 0, DELETE: 0 },
  dropdownData: { roles: ROLES },
  lastUpdated: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ACCOUNTS": {
      const accounts = action.payload;
      const accountsMap = new Map();
      accounts.forEach(acc => accountsMap.set(acc.id, acc));
      return { ...state, accounts, accountsMap };
    }
    case "SET_LOGS": {
      const logs = action.payload.map(log => ({
        ...log,
        createdByName: log.createdByName || 'Unknown User',
        createdByRole: log.createdByRole || 'N/A',
        timestamp: log.timestamp || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''),
        date: log.date || (log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '')
      }));
      return { ...state, logs, filteredLogs: logs };
    }
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload, pagination: { ...state.pagination, page: 1 } };
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, pagination: { ...state.pagination, page: 1 } };
    case "SET_SEARCH_FIELD":
      return { ...state, searchField: action.payload, pagination: { ...state.pagination, page: 1 } };
    case "SET_PAGINATION":
      return { ...state, pagination: { ...state.pagination, ...action.payload } };
    case "SET_LOG_PAGINATION":
      return { ...state, logPagination: { ...state.logPagination, ...action.payload } };
    case "SET_LOG_FILTER":
      return { ...state, logFilter: action.payload, logPagination: { ...state.logPagination, page: 1 } };
    case "SET_DATE_FILTER":
      return { ...state, dateFilter: { ...state.dateFilter, ...action.payload }, logPagination: { ...state.logPagination, page: 1 } };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "SET_TABLE_LOADING":
      return { ...state, tableLoading: action.payload };
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false, tableLoading: false, success: false };
    case "CLEAR_ERROR":
      return { ...state, error: null };
    case "SET_SUCCESS":
      return { ...state, success: action.payload, error: null };
    case "CLEAR_SUCCESS":
      return { ...state, success: false };
    case "SET_SELECTED_LOG":
      return { ...state, selectedLog: action.payload };
    case "SET_STATUS_COUNTS":
      return { ...state, statusCounts: action.payload };
    case "SET_ACTION_TYPE_COUNTS":
      return { ...state, actionTypeCounts: action.payload };
    case "SET_FILTERED_ACCOUNTS":
      return { ...state, filteredAccounts: action.payload };
    case "SET_SUMMARY":
      return { ...state, summary: action.payload };
    default:
      return state;
  }
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const BranchAccountManagementPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const branchCode = queryParams.get('branchCode') || 'branch';
  const branchId = queryParams.get('branchId') || '1';

  const [state, dispatch] = useReducer(reducer, initialState);
  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'en');
  const [loadingDirection, setLoadingDirection] = useState(null);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  // ✅ Demo current user
  const currentUser = DEMO_CURRENT_USER;

  // Form state
  const [accountForm, setAccountForm] = useState({
    id: null,
    username: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    email: "",
    phone: "",
    role: "STAFF",
    status: "Active",
    branchId: null,
    branchCode: branchCode
  });

  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const pageChangeTimeoutRef = useRef(null);

  // ============================================================
  // ✅ INITIAL LOAD - JSON demo data (branch filter မလိုဘူး)
  // ============================================================
  useEffect(() => {
    setTimeout(() => {
      // ✅ Load ALL accounts (filter မလုပ်တော့ဘူး)
      const accs = DEMO_ACCOUNTS;
      dispatch({ type: "SET_ACCOUNTS", payload: accs });

      // Load logs
      dispatch({ type: "SET_LOGS", payload: DEMO_LOGS });

      // Status counts
      const statusCounts = {
        Active: accs.filter(a => a.status === 'Active').length,
        Unactive: accs.filter(a => a.status === 'Unactive').length,
        Pending: accs.filter(a => a.status === 'Pending').length,
      };
      dispatch({ type: "SET_STATUS_COUNTS", payload: statusCounts });

      // Action type counts
      const actionTypeCounts = {
        all: DEMO_LOGS.length,
        ADD: DEMO_LOGS.filter(l => l.actionType === 'ADD').length,
        EDIT: DEMO_LOGS.filter(l => l.actionType === 'EDIT').length,
        DELETE: DEMO_LOGS.filter(l => l.actionType === 'DELETE').length,
      };
      dispatch({ type: "SET_ACTION_TYPE_COUNTS", payload: actionTypeCounts });

      // Summary
      dispatch({
        type: "SET_SUMMARY",
        payload: {
          total: accs.length,
          active: statusCounts.Active,
          unactive: statusCounts.Unactive,
          filteredTotal: accs.length,
          logSummary: { total: DEMO_LOGS.length, add: actionTypeCounts.ADD, edit: actionTypeCounts.EDIT, delete: actionTypeCounts.DELETE, today: 0 }
        }
      });

      // Pagination
      dispatch({
        type: "SET_PAGINATION",
        payload: {
          page: 1,
          size: 10,
          total: accs.length,
          totalPages: Math.max(1, Math.ceil(accs.length / 10)),
          hasMore: false,
          hasPrevious: false
        }
      });

      dispatch({
        type: "SET_LOG_PAGINATION",
        payload: {
          page: 1,
          size: 10,
          total: DEMO_LOGS.length,
          totalPages: Math.max(1, Math.ceil(DEMO_LOGS.length / 10)),
          hasMore: false,
          hasPrevious: false
        }
      });
    }, 300);
  }, []);

  // ============================================================
  // ✅ FILTER ACCOUNTS (local)
  // ============================================================
  useEffect(() => {
    let filtered = [...state.accounts];

    if (state.activeTab === "active") {
      filtered = filtered.filter(a => a.status === "Active");
    } else if (state.activeTab === "unactive") {
      filtered = filtered.filter(a => a.status === "Unactive");
    } else if (state.activeTab === "pending") {
      filtered = filtered.filter(a => a.status === "Pending");
    }

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(acc => {
        if (state.searchField === "all") {
          return (
            acc.username?.toLowerCase().includes(query) ||
            acc.fullName?.toLowerCase().includes(query) ||
            acc.email?.toLowerCase().includes(query) ||
            (acc.phone && acc.phone.toLowerCase().includes(query)) ||
            acc.role?.toLowerCase().includes(query)
          );
        } else if (state.searchField === "username") return acc.username?.toLowerCase().includes(query);
        else if (state.searchField === "fullName") return acc.fullName?.toLowerCase().includes(query);
        else if (state.searchField === "email") return acc.email?.toLowerCase().includes(query);
        else if (state.searchField === "phone") return acc.phone?.toLowerCase().includes(query);
        else if (state.searchField === "role") return acc.role?.toLowerCase().includes(query);
        return false;
      });
    }

    dispatch({ type: "SET_FILTERED_ACCOUNTS", payload: filtered });
  }, [state.accounts, state.activeTab, state.searchQuery, state.searchField]);

  // ============================================================
  // ✅ FILTER LOGS (local)
  // ============================================================
  useEffect(() => {
    let filtered = [...state.logs];

    if (state.logFilter !== "all") {
      filtered = filtered.filter(log => log.actionType === state.logFilter);
    }

    if (state.dateFilter.filter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

      filtered = filtered.filter(log => {
        if (!log.createdAt) return true;
        const logDate = new Date(log.createdAt);
        switch (state.dateFilter.filter) {
          case "today": return logDate >= today;
          case "yesterday": return logDate >= yesterday && logDate < today;
          case "thisWeek": return logDate >= weekAgo;
          case "thisMonth": return logDate >= monthAgo;
          case "custom":
            if (state.dateFilter.customFrom && state.dateFilter.customTo) {
              const from = new Date(state.dateFilter.customFrom);
              const to = new Date(state.dateFilter.customTo);
              to.setHours(23, 59, 59, 999);
              return logDate >= from && logDate <= to;
            }
            return true;
          default: return true;
        }
      });
    }

    filtered.sort((a, b) => (b.createdAt ? new Date(b.createdAt) : 0) - (a.createdAt ? new Date(a.createdAt) : 0));
    dispatch({ type: "SET_LOGS", payload: filtered });
  }, [state.logFilter, state.dateFilter, state.logs.length]);

  // ============================================================
  // ✅ Validate form
  // ============================================================
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    setValidationError(null);

    if (modalType === "add") {
      if (!accountForm.username) { errors.username = language === 'mm' ? "အသုံးပြုသူအမည် လိုအပ်ပါသည်" : "Username is required"; isValid = false; }
      if (!accountForm.fullName) { errors.fullName = language === 'mm' ? "အမည်အပြည့်အစုံ လိုအပ်ပါသည်" : "Full name is required"; isValid = false; }
      if (!accountForm.email) { errors.email = language === 'mm' ? "အီးမေးလ် လိုအပ်ပါသည်" : "Email is required"; isValid = false; }
      else if (!/\S+@\S+\.\S+/.test(accountForm.email)) { errors.email = language === 'mm' ? "အီးမေးလ် မမှန်ကန်ပါ" : "Invalid email format"; isValid = false; }
      if (!accountForm.role) { errors.role = language === 'mm' ? "အခန်းကဏ္ဍ ရွေးချယ်ရန် လိုအပ်ပါသည်" : "Role is required"; isValid = false; }
      if (!accountForm.password) { errors.password = language === 'mm' ? "စကားဝှက် လိုအပ်ပါသည်" : "Password is required"; isValid = false; }
      else if (accountForm.password.length < 6) { errors.password = language === 'mm' ? "စကားဝှက်သည် အနည်းဆုံး ၆ လုံးရှိရပါမည်" : "Password must be at least 6 characters"; isValid = false; }
      if (accountForm.password !== accountForm.confirmPassword) { errors.confirmPassword = language === 'mm' ? "စကားဝှက် မတိုက်ဆိုင်ပါ" : "Passwords do not match"; isValid = false; }
    }
    setFormErrors(errors);
    return isValid;
  };

  // ============================================================
  // ✅ Handlers
  // ============================================================
  const handleTabChange = (e) => dispatch({ type: "SET_ACTIVE_TAB", payload: e.target.value });
  const handleSearchChange = (e) => dispatch({ type: "SET_SEARCH_QUERY", payload: e.target.value });
  const handleSearchFieldChange = (e) => dispatch({ type: "SET_SEARCH_FIELD", payload: e.target.value });
  const clearSearch = () => dispatch({ type: "SET_SEARCH_QUERY", payload: "" });

  const changePage = useCallback((newPage, direction) => {
    if (newPage === state.pagination.page || newPage < 1 || newPage > state.pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      dispatch({ type: "SET_PAGINATION", payload: { page: newPage } });
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
      dispatch({ type: "SET_LOG_PAGINATION", payload: { page: newPage } });
      setHistoryPageInputValue(newPage.toString());
      setLoadingDirection(null);
      if (historyContainerRef.current) historyContainerRef.current.scrollTop = 0;
    }, 150);
  }, [state.logPagination.page, state.logPagination.totalPages]);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    dispatch({ type: "SET_PAGINATION", payload: { size: newSize, page: 1 } });
    setPageInputValue("1");
  };
  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    dispatch({ type: "SET_LOG_PAGINATION", payload: { size: newSize, page: 1 } });
    setHistoryPageInputValue("1");
  };

  const handleDateFilterChange = (filter) => {
    dispatch({ type: "SET_DATE_FILTER", payload: { filter } });
    setShowDatePicker(filter === "custom");
    if (filter !== "custom") dispatch({ type: "SET_DATE_FILTER", payload: { customFrom: "", customTo: "" } });
  };
  const handleCustomDateChange = (type, value) => dispatch({ type: "SET_DATE_FILTER", payload: { [type]: value } });
  const clearDateFilter = () => {
    dispatch({ type: "SET_DATE_FILTER", payload: { filter: "all", customFrom: "", customTo: "" } });
    setShowDatePicker(false);
  };

  // ============================================================
  // ✅ CRUD
  // ============================================================
  const handleAction = async (action, accountId) => {
    const account = state.accountsMap.get(accountId);
    if (!account) return;

    if (action === 'edit') {
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
        branchId: account.branchId,
        branchCode: account.branchCode
      });
      setFormErrors({});
      setModalType("edit");
      setShowAccountModal(true);
    } else if (action === 'delete') {
      if (window.confirm(language === 'mm'
        ? `"${account.username}" အကောင့်ကို ဖျက်ရန် သေချာပါသလား?`
        : `Are you sure you want to delete the account "${account.username}"?`)) {
        const updated = state.accounts.filter(a => a.id !== accountId);
        dispatch({ type: "SET_ACCOUNTS", payload: updated });

        const newLog = {
          id: Date.now(),
          actionType: "DELETE",
          accountId: account.id,
          username: account.username,
          createdByName: currentUser.fullName,
          createdByRole: currentUser.role,
          createdAt: new Date().toISOString(),
          changes: [`Account "${account.username}" deleted`]
        };
        dispatch({ type: "SET_LOGS", payload: [newLog, ...state.logs] });
        dispatch({ type: "SET_SUCCESS", payload: true });
        setTimeout(() => dispatch({ type: "CLEAR_SUCCESS" }), 3000);
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
      id: null, username: "", password: "", confirmPassword: "",
      fullName: "", email: "", phone: "", role: "STAFF", status: "Active",
      branchId: null, branchCode: branchCode
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

    if (modalType === "add") {
      const newAcc = {
        id: state.accounts.length ? Math.max(...state.accounts.map(a => a.id)) + 1 : 1,
        username: accountForm.username,
        fullName: accountForm.fullName,
        email: accountForm.email,
        phone: accountForm.phone,
        role: accountForm.role,
        status: accountForm.status,
        branchId: parseInt(branchId),
        branchCode: branchCode,
        createdAt: new Date().toISOString()
      };
      const updated = [...state.accounts, newAcc];
      dispatch({ type: "SET_ACCOUNTS", payload: updated });

      const newLog = {
        id: Date.now(),
        actionType: "ADD",
        accountId: newAcc.id,
        username: newAcc.username,
        createdByName: currentUser.fullName,
        createdByRole: currentUser.role,
        createdAt: new Date().toISOString(),
        changes: [`Username: ${newAcc.username}`, `Full Name: ${newAcc.fullName}`, `Email: ${newAcc.email}`, `Role: ${newAcc.role}`, `Status: ${newAcc.status}`]
      };
      dispatch({ type: "SET_LOGS", payload: [newLog, ...state.logs] });
      dispatch({ type: "SET_SUCCESS", payload: true });
      setShowAccountModal(false);
      setTimeout(() => dispatch({ type: "CLEAR_SUCCESS" }), 3000);
    } else {
      const old = state.accounts.find(a => a.id === accountForm.id);
      const updatedAcc = { ...old, status: accountForm.status };
      const updated = state.accounts.map(a => a.id === accountForm.id ? updatedAcc : a);
      dispatch({ type: "SET_ACCOUNTS", payload: updated });

      const changes = [];
      if (old.status !== updatedAcc.status) changes.push(`Status: ${old.status} → ${updatedAcc.status}`);
      if (!changes.length) changes.push('Updated');

      const newLog = {
        id: Date.now(),
        actionType: "EDIT",
        accountId: updatedAcc.id,
        username: updatedAcc.username,
        createdByName: currentUser.fullName,
        createdByRole: currentUser.role,
        createdAt: new Date().toISOString(),
        changes
      };
      dispatch({ type: "SET_LOGS", payload: [newLog, ...state.logs] });
      dispatch({ type: "SET_SUCCESS", payload: true });
      setShowAccountModal(false);
      setTimeout(() => dispatch({ type: "CLEAR_SUCCESS" }), 3000);
    }
  };

  const showLogDetailModal = (log) => {
    dispatch({ type: "SET_SELECTED_LOG", payload: log });
    setShowLogDetails(true);
  };

  // Helper functions
  const getRoleLabel = (roleValue) => {
    const role = ROLES.find(r => r.value === roleValue);
    return role ? (language === 'mm' ? role.label_mm : role.label) : roleValue;
  };

  const getStatusLabel = (status) => {
    const map = {
      'Active': language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active',
      'Unactive': language === 'mm' ? 'အသုံးပြုမနိုင်' : 'Unactive',
      'Pending': language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending'
    };
    return map[status] || status;
  };

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

  // ============================================================
  // ✅ Paginated data
  // ============================================================
  const paginatedAccounts = useMemo(() => {
    const start = (state.pagination.page - 1) * state.pagination.size;
    return state.filteredAccounts.slice(start, start + state.pagination.size);
  }, [state.filteredAccounts, state.pagination.page, state.pagination.size]);

  const paginatedLogs = useMemo(() => {
    const start = (state.logPagination.page - 1) * state.logPagination.size;
    return state.filteredLogs.slice(start, start + state.logPagination.size);
  }, [state.filteredLogs, state.logPagination.page, state.logPagination.size]);

  const groupedPaginatedLogs = useMemo(() => {
    return groupLogsByDate(paginatedLogs);
  }, [paginatedLogs, language]);

  if (!currentUser) {
    return (
      <div className="branch-container">
        <div className="loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{language === 'mm' ? 'အသုံးပြုသူဒေတာ ဖွင့်နေသည်...' : 'Loading user data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="branch-container">
      {/* Messages */}
      <div className="branch-messages-container">
        {state.success && (
          <div className="branch-message success">
            <i className="fas fa-check-circle"></i>
            <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={() => dispatch({ type: "CLEAR_SUCCESS" })}><i className="fas fa-times"></i></button>
          </div>
        )}
        {state.error && (
          <div className="branch-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{state.error}</span>
            <button onClick={() => dispatch({ type: "CLEAR_ERROR" })}><i className="fas fa-times"></i></button>
          </div>
        )}
      </div>

      <div className="shop-management-header">
        <div className="header-top-row">
          <NavLink to="/userAdminDashboardCombine" className="shop-back-btn">
            <i className="fas fa-arrow-left"></i> {language === 'mm' ? 'ဒက်ရှ်ဘုတ်သို့ ပြန်သွားရန်' : 'Back to Dashboard'}
          </NavLink>
          <div className="header-center-content">
            <h1>
              <i className="fas fa-store-alt"></i>
              {branchCode
                ? (language === 'mm' ? `ဆိုင်ခွဲ ${branchCode} အကောင့်စီမံခန့်ခွဲမှု` : `Branch ${branchCode} Account Management`)
                : (language === 'mm' ? 'ဆိုင်ခွဲအကောင့် စီမံခန့်ခွဲမှု' : 'Branch Account Management')}
            </h1>
            <p>{language === 'mm' ? 'ဆိုင်ခွဲအကောင့် စီမံခန့်ခွဲရန် (Demo)' : 'Manage branch accounts (Demo)'}</p>
          </div>
        </div>
      </div>

      {/* Tabs Header */}
      <div className="branch-tabs-header">
        <div className="branch-tabs-selector">
          <div className="branch-select-container">
            <i className={`fas ${state.activeTab === 'all-accounts' ? 'fa-users' : state.activeTab === 'active' ? 'fa-check-circle' : state.activeTab === 'unactive' ? 'fa-times-circle' : state.activeTab === 'pending' ? 'fa-clock' : 'fa-history'} branch-select-icon`}></i>
            <select className="branch-tab-select" value={state.activeTab} onChange={handleTabChange}>
              <option value="all-accounts">{language === 'mm' ? 'အကောင့်အားလုံး' : 'All Accounts'} ({state.accounts.length})</option>
              <option value="active">{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'} ({state.statusCounts.Active || 0})</option>
              <option value="unactive">{language === 'mm' ? 'အသုံးပြုမနိုင်' : 'Unactive'} ({state.statusCounts.Unactive || 0})</option>
              <option value="pending">{language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending'} ({state.statusCounts.Pending || 0})</option>
              <option value="history">{language === 'mm' ? 'မှတ်တမ်း' : 'History'} ({state.actionTypeCounts.all || 0})</option>
            </select>
            <i className="fas fa-chevron-down branch-select-arrow"></i>
          </div>
        </div>

        {state.activeTab !== 'history' && (
          <>
            <div className="branch-search-controls">
              <div className="branch-search-input-group">
                <i className="fas fa-search branch-search-icon"></i>
                <input
                  type="text"
                  className="branch-search-input"
                  placeholder={language === 'mm' ? 'အကောင့်များ ရှာဖွေရန်...' : 'Search accounts...'}
                  value={state.searchQuery}
                  onChange={handleSearchChange}
                />
                {state.searchQuery && (
                  <button className="branch-clear-search-btn" onClick={clearSearch}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="branch-filter-buttons">
                <select className="branch-search-select" value={state.searchField} onChange={handleSearchFieldChange}>
                  <option value="all">{language === 'mm' ? 'အားလုံး' : 'All Fields'}</option>
                  <option value="username">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</option>
                  <option value="fullName">{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</option>
                  <option value="email">Email</option>
                  <option value="phone">{language === 'mm' ? 'ဖုန်း' : 'Phone'}</option>
                  <option value="role">{language === 'mm' ? 'ရာထူး' : 'Role'}</option>
                </select>
                {state.searchQuery && (
                  <button className="branch-clear-search-btn secondary" onClick={clearSearch}>
                    <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            <button className="branch-add-btn" onClick={openAddModal}>
              <i className="fas fa-plus"></i> {language === 'mm' ? 'အကောင့်အသစ်ဖန်တီးရန်' : 'Create Account'}
            </button>
          </>
        )}
      </div>

      {/* Content Area */}
      <div className="subtab-content active">
        {state.activeTab === "history" ? (
          /* HISTORY TAB */
          <div className="branch-history-section">
            <div className="branch-section-title">
              <div className="branch-title-row">
                <div className="branch-title-left">
                  <i className="fas fa-history"></i>
                  <span className="branch-title-text">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}
                  </span>
                </div>
                <div className="branch-title-center">
                  <div className="branch-compact-nav">
                    <button className="branch-nav-btn" onClick={() => changeHistoryPage(state.logPagination.page - 1, 'prev')} disabled={state.logPagination.page === 1}>
                      {loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="branch-page-control">
                      <input type="text" className="branch-page-input" value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(historyPageInputValue);
                          if (!isNaN(val) && val >= 1 && val <= state.logPagination.totalPages && val !== state.logPagination.page) changeHistoryPage(val, 'jump');
                          else setHistoryPageInputValue(state.logPagination.page.toString());
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="branch-page-total">/ {state.logPagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className="branch-nav-btn" onClick={() => changeHistoryPage(state.logPagination.page + 1, 'next')} disabled={state.logPagination.page === state.logPagination.totalPages || state.logPagination.totalPages === 0}>
                      {loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="branch-items-per-page">
                      <select className="branch-per-page-select" value={state.logPagination.size} onChange={handleLogPageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="branch-per-page-label">{language === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="branch-title-right">
                  <span className="branch-showing-count">
                    <span className="branch-count-numbers">{state.filteredLogs.length > 0 ? ((state.logPagination.page - 1) * state.logPagination.size) + 1 : 0}</span>
                    <span> - </span>
                    <span className="branch-count-numbers">{Math.min(state.logPagination.page * state.logPagination.size, state.filteredLogs.length)}</span>
                    <span> / </span>
                    <span className="branch-count-numbers">{state.filteredLogs.length.toLocaleString()}</span>
                    <span className="branch-count-label">{language === 'mm' ? 'ခု' : 'items'}</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="branch-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="branch-filter-tabs" style={{ flex: '1 1 auto' }}>
                  {['all', 'ADD', 'EDIT', 'DELETE'].map(f => (
                    <button key={f} className={`branch-filter-tab ${state.logFilter === f ? "active" : ""}`}
                      onClick={() => dispatch({ type: "SET_LOG_FILTER", payload: f })}>
                      {f === 'all' ? (language === 'mm' ? 'အားလုံး' : 'All') : f}
                      <span className="branch-filter-count">({state.actionTypeCounts[f] || 0})</span>
                    </button>
                  ))}
                </div>
                <div className="branch-filter-tabs" style={{ marginLeft: 'auto' }}>
                  {['all', 'today', 'yesterday', 'thisWeek', 'thisMonth'].map(f => (
                    <button key={f} className={`branch-filter-tab ${state.dateFilter.filter === f ? "active" : ""}`}
                      onClick={() => handleDateFilterChange(f)}>
                      {f === 'all' ? (language === 'mm' ? 'အချိန်အားလုံး' : 'All Time') :
                       f === 'today' ? (language === 'mm' ? 'ယနေ့' : 'Today') :
                       f === 'yesterday' ? (language === 'mm' ? 'မနေ့က' : 'Yesterday') :
                       f === 'thisWeek' ? (language === 'mm' ? 'ဒီအပတ်' : 'This Week') :
                       (language === 'mm' ? 'ဒီလ' : 'This Month')}
                    </button>
                  ))}
                  <button className={`branch-filter-tab ${state.dateFilter.filter === "custom" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("custom")}>
                    <i className="fas fa-calendar"></i> {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
                  </button>
                </div>
              </div>
              {showDatePicker && (
                <div className="branch-custom-date-picker">
                  <div className="branch-date-picker-row">
                    <label>{language === 'mm' ? 'မှ' : 'From:'}</label>
                    <input type="date" className="branch-date-input" value={state.dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} />
                  </div>
                  <div className="branch-date-picker-row">
                    <label>{language === 'mm' ? 'ထိ' : 'To:'}</label>
                    <input type="date" className="branch-date-input" value={state.dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="branch-compact-logs-container" ref={historyContainerRef}>
              {Object.keys(groupedPaginatedLogs).length > 0 ? (
                Object.entries(groupedPaginatedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="branch-date-group">
                    <div className="branch-date-header">
                      <span className="branch-date-label">{date}</span>
                      <span className="branch-date-count">
                        {dateLogs.length} {language === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}
                      </span>
                    </div>
                    <div className="branch-logs-list">
                      {dateLogs.map(log => (
                        <div key={log.id} className={`branch-compact-log-entry log-${log.actionType?.toLowerCase()}`}
                          onClick={() => showLogDetailModal(log)} style={{ cursor: 'pointer' }}>
                          <div className="branch-log-icon" style={{ color: log.actionType === 'ADD' ? '#10b981' : log.actionType === 'EDIT' ? '#f59e0b' : '#ef4444' }}>
                            <i className={`fas ${log.actionType === 'ADD' ? 'fa-plus-circle' : log.actionType === 'EDIT' ? 'fa-edit' : 'fa-trash'}`}></i>
                          </div>
                          <div className="branch-log-content">
                            <div className="branch-log-main-info">
                              <span className="branch-log-action">
                                {log.actionType === 'ADD' && (language === 'mm' ? 'အကောင့်ဖန်တီးခြင်း' : 'Account Created')}
                                {log.actionType === 'EDIT' && (language === 'mm' ? 'အကောင့်ပြင်ဆင်ခြင်း' : 'Account Updated')}
                                {log.actionType === 'DELETE' && (language === 'mm' ? 'အကောင့်ဖျက်ခြင်း' : 'Account Deleted')}
                              </span>
                              <span className="branch-log-category">
                                "{log.username}"
                                {log.accountId && <span className="branch-category-id">#{log.accountId}</span>}
                              </span>
                            </div>
                            <div className="branch-log-details">
                              <span className="branch-log-user">
                                <i className="fas fa-user"></i> {log.createdByName}
                                <span className="branch-user-role">({log.createdByRole || 'N/A'})</span>
                              </span>
                              <span className="branch-log-time">
                                <i className="fas fa-clock"></i> {log.timestamp}
                              </span>
                              {log.changes && log.changes.length > 0 && (
                                <span className="branch-log-detail-count">
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
                  <p>{language === 'mm' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် လုပ်ဆောင်ချက်များ မတွေ့ပါ။' : 'No activities found for the selected filter.'}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ACCOUNTS TAB */
          <>
            <div className="branch-section-title">
              <div className="branch-title-row">
                <div className="branch-title-left">
                  <i className="fas fa-user-circle"></i>
                  <span className="branch-title-text">
                    {state.activeTab === "all-accounts" && (language === 'mm' ? 'အကောင့်အားလုံး' : 'All Accounts')}
                    {state.activeTab === "active" && (language === 'mm' ? 'အသုံးပြုနိုင်သော အကောင့်များ' : 'Active Accounts')}
                    {state.activeTab === "unactive" && (language === 'mm' ? 'အသုံးမပြုနိုင်သော အကောင့်များ' : 'Unactive Accounts')}
                    {state.activeTab === "pending" && (language === 'mm' ? 'ဆိုင်းငံ့ဆဲ အကောင့်များ' : 'Pending Accounts')}
                  </span>
                </div>

                <div className="branch-title-center">
                  <div className="branch-compact-nav">
                    <button className="branch-nav-btn" onClick={() => changePage(state.pagination.page - 1, 'prev')} disabled={state.pagination.page === 1}>
                      {loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="branch-page-control">
                      <input type="text" className="branch-page-input" value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => {
                          const val = parseInt(pageInputValue);
                          if (!isNaN(val) && val >= 1 && val <= state.pagination.totalPages && val !== state.pagination.page) changePage(val, 'jump');
                          else setPageInputValue(state.pagination.page.toString());
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="branch-page-total">/ {state.pagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className="branch-nav-btn" onClick={() => changePage(state.pagination.page + 1, 'next')} disabled={state.pagination.page === state.pagination.totalPages || state.pagination.totalPages === 0}>
                      {loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="branch-items-per-page">
                      <select className="branch-per-page-select" value={state.pagination.size} onChange={handlePageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="branch-per-page-label">{language === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>

                <div className="branch-title-right">
                  <span className="branch-showing-count">
                    <span className="branch-count-numbers">{state.filteredAccounts.length > 0 ? ((state.pagination.page-1)*state.pagination.size)+1 : 0}</span>
                    <span> - </span>
                    <span className="branch-count-numbers">{Math.min(state.pagination.page * state.pagination.size, state.filteredAccounts.length)}</span>
                    <span> / </span>
                    <span className="branch-count-numbers">{state.filteredAccounts.length.toLocaleString()}</span>
                    <span className="branch-count-label">{language === 'mm' ? 'ခု' : 'items'}</span>
                  </span>
                </div>
              </div>
              {state.searchQuery && (
                <div className="branch-search-badge-container">
                  <span className="branch-search-badge">
                    <i className="fas fa-search"></i> "{state.searchQuery}"
                    <button onClick={clearSearch} className="branch-clear-search-badge"><i className="fas fa-times-circle"></i></button>
                  </span>
                </div>
              )}
            </div>

            <div className="branch-table-wrapper" ref={tableBodyRef}>
              <table className="branch-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</th>
                    <th>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</th>
                    <th>{language === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact'}</th>
                    <th>{language === 'mm' ? 'ရာထူး' : 'Role'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedAccounts.length > 0 ? (
                    paginatedAccounts.map((acc, index) => (
                      <tr key={acc.id}>
                        <td>{((state.pagination.page-1)*state.pagination.size)+index+1}</td>
                        <td>
                          <div><strong>{acc.username}</strong>{acc.createdAt && <div className="branch-created"><i className="far fa-clock"></i> {new Date(acc.createdAt).toLocaleDateString()}</div>}</div>
                        </td>
                        <td className='fullname'>{acc.fullName}</td>
                        <td>
                          <div className="branch-contact-cell">
                            <div className="branch-contact-item"><i className="fas fa-envelope branch-contact-icon"></i><span className="branch-contact-text">{acc.email}</span></div>
                            {acc.phone && <div className="branch-contact-item"><i className="fas fa-phone branch-contact-icon"></i><span className="branch-contact-text">{acc.phone}</span></div>}
                          </div>
                        </td>
                        <td>
                          <div className="branch-role-cell">
                            <span className={`branch-role-badge role-${acc.role?.toLowerCase()}`}>{getRoleLabel(acc.role)}</span>
                          </div>
                        </td>
                        <td>
                          <div className="branch-status-cell">
                            <span className={`branch-status-badge ${acc.status === 'Active' ? 'branch-status-active' : acc.status === 'Unactive' ? 'branch-status-inactive' : 'branch-status-pending'}`}>
                              {getStatusLabel(acc.status)}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="branch-action-buttons">
                            <button className="branch-action-btn branch-action-edit" onClick={() => handleAction('edit', acc.id)}><i className="fas fa-edit"></i></button>
                            <button className="branch-action-btn branch-action-delete" onClick={() => handleAction('delete', acc.id)}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="7" className="branch-no-data"><div className="branch-no-data-content"><i className="fas fa-user-slash"></i><p>{language === 'mm' ? 'အကောင့်များ မတွေ့ပါ' : 'No accounts found'}</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="branch-modal-overlay">
          <div className="branch-modal-content" style={{ maxWidth: '600px' }}>
            <div className="branch-modal-header">
              <h3>
                <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i>
                {modalType === "add"
                  ? (language === 'mm' ? 'အကောင့်အသစ်ဖန်တီးရန်' : 'Create New Account')
                  : (language === 'mm' ? 'အကောင့်ပြင်ဆင်ရန်' : 'Edit Account')}
              </h3>
              <button className="branch-modal-close" onClick={() => setShowAccountModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="branch-modal-body">
              {currentUser && (
                <div className="branch-current-user-banner">
                  <i className="fas fa-user-circle"></i>
                  <div><div className="branch-user-name">{currentUser.fullName}</div><div className="branch-user-role">{currentUser.role}</div></div>
                </div>
              )}
              {validationError && (
                <div className="branch-validation-error"><i className="fas fa-exclamation-circle"></i><span>{validationError}</span></div>
              )}

              <div className="branch-info-box" style={{ marginBottom: '20px' }}>
                <i className="fas fa-store"></i>
                <span>{language === 'mm' ? 'ဆိုင်ခွဲကုဒ်' : 'Branch Code'}: {branchCode}</span>
              </div>

              {modalType === "add" ? (
                <>
                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                      <input type="text" name="username" value={accountForm.username} onChange={handleFormChange} className={formErrors.username ? 'branch-input-error' : ''} placeholder={language=="mm" ? "အသုံးပြုသူ အမည်ရေးပါ":"Enter username"} />
                      {formErrors.username && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.username}</span></div>}
                    </div>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                      <input type="text" name="fullName" value={accountForm.fullName} onChange={handleFormChange} className={formErrors.fullName ? 'branch-input-error' : ''} placeholder={language=="mm" ? "အမည်အပြည့်အစုံ ရေးပါ":"Enter full name"} />
                      {formErrors.fullName && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.fullName}</span></div>}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                      <input type="email" name="email" value={accountForm.email} onChange={handleFormChange} className={formErrors.email ? 'branch-input-error' : ''} placeholder={language=="mm" ? "အီးမေးလ် ရေးပါ":"Enter email"}/>
                      {formErrors.email && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.email}</span></div>}
                    </div>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label>{language === 'mm' ? 'ဖုန်း' : 'Phone'}</label>
                      <input type="text" name="phone" value={accountForm.phone} onChange={handleFormChange} placeholder={language=="mm" ? "ဖုန်းနံပါတ် ရေးပါ":"Enter phone number"}/>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px' }}>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">{language === 'mm' ? 'ရာထူး' : 'Role'}</label>
                      <select name="role" value={accountForm.role} onChange={handleFormChange}>
                        {ROLES.map(role => <option key={role.value} value={role.value}>{language === 'mm' ? role.label_mm : role.label}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="branch-form-group">
                    <label className="branch-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
                    <div className="branch-status-select-group">
                      <div className={`branch-status-option ${accountForm.status === 'Active' ? 'selected' : ''}`} onClick={() => handleStatusChange('Active')}>
                        <input type="radio" name="status" value="Active" checked={accountForm.status === 'Active'} readOnly className="branch-status-radio" />
                        <label className="branch-status-label"><i className="fas fa-check-circle"></i>{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}</label>
                      </div>
                      <div className={`branch-status-option ${accountForm.status === 'Unactive' ? 'selected' : ''}`} onClick={() => handleStatusChange('Unactive')}>
                        <input type="radio" name="status" value="Unactive" checked={accountForm.status === 'Unactive'} readOnly className="branch-status-radio" />
                        <label className="branch-status-label"><i className="fas fa-times-circle"></i>{language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'}</label>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '15px', marginBottom: '20px' }}>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">{language === 'mm' ? 'စကားဝှက်' : 'Password'}</label>
                      <input type="password" name="password" value={accountForm.password} onChange={handleFormChange} className={formErrors.password ? 'branch-input-error' : ''} placeholder={language=="mm" ? "စကားဝှက် ထည့်ပါ":"Enter password"}/>
                      {formErrors.password && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.password}</span></div>}
                    </div>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">{language === 'mm' ? 'စကားဝှက် အတည်ပြုရန်' : 'Confirm Password'}</label>
                      <input type="password" name="confirmPassword" value={accountForm.confirmPassword} onChange={handleFormChange} className={formErrors.confirmPassword ? 'branch-input-error' : ''} placeholder={language=="mm" ? "အတည်ပြုစကားဝှက် ထည့်ပါ":"Enter confirm password"}/>
                      {formErrors.confirmPassword && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i><span>{formErrors.confirmPassword}</span></div>}
                    </div>
                  </div>

                  <div className="branch-info-box">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'စကားဝှက်ကို ပေးထားသော အီးမေးလ်သို့ ပေးပို့မည်။' : 'Login credentials will be sent to the provided email address.'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="branch-info-grid">
                    <div className="branch-info-column">
                      <div className="branch-info-item">
                        <label>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</label>
                        <div className="branch-info-value"><i className="fas fa-user"></i><span>{accountForm.username}</span></div>
                      </div>
                      <div className="branch-info-item">
                        <label>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</label>
                        <div className="branch-info-value"><i className="fas fa-id-card"></i><span>{accountForm.fullName}</span></div>
                      </div>
                      <div className="branch-info-item">
                        <label>{language === 'mm' ? 'အီးမေးလ်' : 'Email'}</label>
                        <div className="branch-info-value"><i className="fas fa-envelope"></i><span>{accountForm.email}</span></div>
                      </div>
                    </div>
                    <div className="branch-info-column">
                      <div className="branch-info-item">
                        <label>{language === 'mm' ? 'ဖုန်း' : 'Phone'}</label>
                        <div className="branch-info-value"><i className="fas fa-phone"></i><span>{accountForm.phone || 'N/A'}</span></div>
                      </div>
                      <div className="branch-info-item">
                        <label>{language === 'mm' ? 'ရာထူး' : 'Role'}</label>
                        <div className="branch-info-value"><i className="fas fa-tag"></i><span className={`branch-role-badge role-${accountForm.role?.toLowerCase()}`}>{getRoleLabel(accountForm.role)}</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="branch-divider">
                    <span>{language === 'mm' ? 'အခြေအနေပြောင်းလဲရန်' : 'Change Status'}</span>
                  </div>

                  <div className="branch-form-group">
                    <label className="branch-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
                    <div className="branch-status-select-group">
                      <div className={`branch-status-option ${accountForm.status === 'Active' ? 'selected' : ''}`} onClick={() => handleStatusChange('Active')}>
                        <input type="radio" name="status" value="Active" checked={accountForm.status === 'Active'} readOnly className="branch-status-radio" />
                        <label className="branch-status-label"><i className="fas fa-check-circle"></i>{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}</label>
                      </div>
                      <div className={`branch-status-option ${accountForm.status === 'Unactive' ? 'selected' : ''}`} onClick={() => handleStatusChange('Unactive')}>
                        <input type="radio" name="status" value="Unactive" checked={accountForm.status === 'Unactive'} readOnly className="branch-status-radio" />
                        <label className="branch-status-label"><i className="fas fa-times-circle"></i>{language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Unactive'}</label>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="branch-modal-footer">
              <button className="branch-btn-cancel" onClick={() => setShowAccountModal(false)}>
                {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
              </button>
              <button className="branch-btn-submit" onClick={handleSaveAccount}>
                <i className="fas fa-save"></i> {modalType === "add" ? (language === 'mm' ? 'အကောင့်ဖန်တီးရန်' : 'Create Account') : (language === 'mm' ? 'သိမ်းရန်' : 'Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showLogDetails && state.selectedLog && (
        <div className="branch-modal-overlay">
          <div className="branch-modal-content" style={{ maxWidth: '600px' }}>
            <div className="branch-modal-header">
              <h3>
                <i className={`fas ${state.selectedLog.actionType === 'ADD' ? 'fa-plus-circle' : state.selectedLog.actionType === 'EDIT' ? 'fa-edit' : 'fa-trash'}`}></i>
                {language === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}
              </h3>
              <button className="branch-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="branch-modal-body">
              <div className="branch-log-detail-header">
                <div className="branch-log-detail-main">
                  <div className="branch-log-detail-action">
                    <span className={`branch-action-badge branch-action-${state.selectedLog.actionType?.toLowerCase()}`}>
                      {state.selectedLog.actionType === 'ADD' && (language === 'mm' ? 'အကောင့်ဖန်တီးခြင်း' : 'Account Created')}
                      {state.selectedLog.actionType === 'EDIT' && (language === 'mm' ? 'အကောင့်ပြင်ဆင်ခြင်း' : 'Account Updated')}
                      {state.selectedLog.actionType === 'DELETE' && (language === 'mm' ? 'အကောင့်ဖျက်ခြင်း' : 'Account Deleted')}
                    </span>
                  </div>
                  {state.selectedLog.username && (
                    <div className="branch-log-detail-category">
                      <i className="fas fa-user"></i>
                      <span className="branch-category-name">{state.selectedLog.username}</span>
                      {state.selectedLog.accountId && <span className="branch-category-id-detail">ID: #{state.selectedLog.accountId}</span>}
                    </div>
                  )}
                </div>

                <div className="branch-log-detail-meta">
                  <div className="branch-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="branch-user-name-detail">{state.selectedLog.createdByName}</div>
                      <div className="branch-user-role-detail">{state.selectedLog.createdByRole || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="branch-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="branch-log-date-detail">{state.selectedLog.date || new Date(state.selectedLog.createdAt).toLocaleDateString()}</div>
                      <div className="branch-log-time-detail">{state.selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="branch-log-detail-content">
                <h4>{language === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {state.selectedLog.changes && state.selectedLog.changes.length > 0 ? (
                  <div className="branch-change-list">
                    {state.selectedLog.changes.map((detail, index) => (
                      <div key={index} className="branch-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="branch-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="branch-modal-footer">
              <button className="branch-btn-cancel" onClick={() => setShowLogDetails(false)}>
                {language === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchAccountManagementPage;