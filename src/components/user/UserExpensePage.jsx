// UserExpensePage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import '../../light-style/user-css/userExpensePage.css';
import UserExpenseModal from './UserExpenseModal';
import UserExpenseExportModal from './UserExpenseExportModal';

// ============================================================
// ✅ DEMO SEED DATA — JSON + localStorage
// ============================================================
const EXPENSES_KEY = "demo_expenses";
const LOGS_KEY = "demo_expense_logs";
const EMPLOYEES_KEY = "demo_employees";
const SEED_VERSION_KEY = "demo_expense_seed_version";
const SEED_VERSION = "1.0.0";

const SEED_EMPLOYEES = [
  { id: 1, fullName: "မောင်မောင်", username: "maung", role: "MANAGER", status: "Active" },
  { id: 2, fullName: "ဒေါ်မြင့်", username: "myint", role: "CASHIER", status: "Active" },
  { id: 3, fullName: "ကိုဇော်", username: "zaw", role: "CASHIER", status: "Active" },
  { id: 4, fullName: "မယ်သီ", username: "thee", role: "INVENTORY", status: "Active" }
];

const SEED_EXPENSES = [
  {
    id: 1, title: "ဆိုင်ငှားခ", category: "Rent", subCategory: "",
    amount: 350000, expenseDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    paymentMethod: "Bank Transfer", status: "Paid", vendor: "ဦးလှမြင့်",
    description: "လစဉ် ဆိုင်ငှားခ", depreciationType: null, depreciationRate: null,
    employeeId: null, employeeName: null,
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), branchId: 1
  },
  {
    id: 2, title: "ဝန်ထမ်းခ - ဒေါ်မြင့်", category: "Salary", subCategory: "Staff",
    amount: 250000, expenseDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    paymentMethod: "Cash", status: "Paid", vendor: "",
    description: "လစဉ်လုပ်ခ", depreciationType: null, depreciationRate: null,
    employeeId: 2, employeeName: "ဒေါ်မြင့်",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), branchId: 1
  },
  {
    id: 3, title: "လျှပ်စစ်ဖိုး", category: "Utilities", subCategory: "Electricity",
    amount: 85000, expenseDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    paymentMethod: "Cash", status: "Pending", vendor: "YESC",
    description: "လစဉ် လျှပ်စစ်ဖိုး", depreciationType: null, depreciationRate: null,
    employeeId: null, employeeName: null,
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), branchId: 1
  },
  {
    id: 4, title: "POS စက်တန်ဖိုးလျော့", category: "Depreciation", subCategory: "Equipment",
    amount: 120000, expenseDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    paymentMethod: "Bank Transfer", status: "Paid", vendor: "",
    description: "POS စက် တန်ဖိုးလျော့", depreciationType: "straight_line", depreciationRate: 10,
    depreciationValue: 120000, employeeId: null, employeeName: null,
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1
  },
  {
    id: 5, title: "ရေဖိုး", category: "Utilities", subCategory: "Water",
    amount: 35000, expenseDate: new Date().toISOString().split('T')[0],
    paymentMethod: "Mobile Payment", status: "Pending", vendor: "ရေဌာန",
    description: "", depreciationType: null, depreciationRate: null,
    employeeId: null, employeeName: null,
    createdByName: "Cashier2", createdByRole: "Cashier",
    createdAt: new Date().toISOString(), branchId: 1
  },
  {
    id: 6, title: "Software Subscription", category: "Software", subCategory: "",
    amount: 45000, expenseDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    paymentMethod: "Credit Card", status: "Paid", vendor: "Microsoft",
    description: "Monthly subscription", depreciationType: null, depreciationRate: null,
    employeeId: null, employeeName: null,
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), branchId: 1
  },
  {
    id: 7, title: "စျေးကွက်ရှာဖွေရေး", category: "Marketing", subCategory: "",
    amount: 120000, expenseDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    paymentMethod: "Cash", status: "Cancelled", vendor: "Facebook Ads",
    description: "Social Media Ads", depreciationType: null, depreciationRate: null,
    employeeId: null, employeeName: null,
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), branchId: 1
  },
  {
    id: 8, title: "ရုံးသုံးပစ္စည်း", category: "Supplies", subCategory: "",
    amount: 28000, expenseDate: new Date(Date.now() - 4 * 86400000).toISOString().split('T')[0],
    paymentMethod: "Cash", status: "Paid", vendor: "City Mart",
    description: "Pen, paper, folder", depreciationType: null, depreciationRate: null,
    employeeId: null, employeeName: null,
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 4 * 86400000).toISOString(), branchId: 1
  }
];

const SEED_LOGS = [
  { id: 1, actionType: "CREATE", expenseId: 1, expenseName: "ဆိုင်ငှားခ", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), branchId: 1, changes: ["Title: ဆိုင်ငှားခ", "Amount: 350,000 Ks"] },
  { id: 2, actionType: "CREATE", expenseId: 2, expenseName: "ဝန်ထမ်းခ - ဒေါ်မြင့်", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), branchId: 1, changes: ["Title: ဝန်ထမ်းခ", "Amount: 250,000 Ks"] },
  { id: 3, actionType: "CREATE", expenseId: 3, expenseName: "လျှပ်စစ်ဖိုး", createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), branchId: 1, changes: ["Amount: 85,000 Ks"] },
  { id: 4, actionType: "STATUS_CHANGE", expenseId: 3, expenseName: "လျှပ်စစ်ဖိုး", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(), branchId: 1, changes: ["Status: Pending → Paid"] },
  { id: 5, actionType: "CREATE", expenseId: 4, expenseName: "POS စက်တန်ဖိုးလျော့", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1, changes: ["Amount: 120,000 Ks"] },
  { id: 6, actionType: "UPDATE", expenseId: 4, expenseName: "POS စက်တန်ဖိုးလျော့", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 1 * 86400000 + 1800000).toISOString(), branchId: 1, changes: ["Rate: → 10%"] },
  { id: 7, actionType: "CREATE", expenseId: 5, expenseName: "ရေဖိုး", createdByName: "Cashier2", createdByRole: "Cashier", createdAt: new Date().toISOString(), branchId: 1, changes: ["Amount: 35,000 Ks"] },
  { id: 8, actionType: "DELETE", expenseId: 99, expenseName: "Old Expense", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), branchId: 1, changes: ["Expense deleted"] },
  { id: 9, actionType: "CREATE", expenseId: 6, expenseName: "Software Subscription", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), branchId: 1, changes: ["Amount: 45,000 Ks"] },
  { id: 10, actionType: "STATUS_CHANGE", expenseId: 7, expenseName: "စျေးကွက်ရှာဖွေရေး", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), branchId: 1, changes: ["Status: Pending → Cancelled"] }
];

// ============================================================
// localStorage helpers
// ============================================================
const getData = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
};

const saveData = (key, data) => {
  try { localStorage.setItem(key, JSON.stringify(data)); } catch (e) { console.error(e); }
};

const ensureExpenseSeed = () => {
  const v = localStorage.getItem(SEED_VERSION_KEY);
  if (v !== SEED_VERSION) {
    saveData(EXPENSES_KEY, SEED_EXPENSES);
    saveData(LOGS_KEY, SEED_LOGS);
    saveData(EMPLOYEES_KEY, SEED_EMPLOYEES);
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    console.log('🌱 Expense seed loaded');
  } else {
    if (getData(EXPENSES_KEY, []).length === 0) saveData(EXPENSES_KEY, SEED_EXPENSES);
    if (getData(LOGS_KEY, []).length === 0) saveData(LOGS_KEY, SEED_LOGS);
    if (getData(EMPLOYEES_KEY, []).length === 0) saveData(EMPLOYEES_KEY, SEED_EMPLOYEES);
  }
};

const generateExpenseId = () => {
  const items = getData(EXPENSES_KEY, []);
  return items.reduce((m, e) => Math.max(m, e.id || 0), 0) + 1;
};

const generateLogId = () => {
  const logs = getData(LOGS_KEY, []);
  return logs.reduce((m, l) => Math.max(m, l.id || 0), 0) + 1;
};

const addExpenseLog = (logData) => {
  const logs = getData(LOGS_KEY, []);
  const newLog = {
    id: generateLogId(),
    actionType: logData.actionType || 'CREATE',
    expenseId: logData.expenseId || 0,
    expenseName: logData.expenseName || '',
    createdByName: logData.createdByName || 'System',
    createdByRole: logData.createdByRole || 'N/A',
    createdAt: new Date().toISOString(),
    branchId: logData.branchId || 1,
    changes: logData.changes || []
  };
  logs.unshift(newLog);
  saveData(LOGS_KEY, logs);
  return newLog;
};

// ============================================================
// useLanguage Hook
// ============================================================
const useLanguage = () => {
  const [lang, setLang] = useState(localStorage.getItem('appLanguage') || 'mm');
  useEffect(() => {
    const handler = (e) => setLang(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);
  return lang;
};

const UserExpensePage = () => {
  const navigate = useNavigate();
  const lang = useLanguage();

  // ✅ currentUser with Demo fallback
  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const currentUser = useMemo(() => {
    if (reduxUser && isAuthenticated) {
      return {
        id: reduxUser.id,
        name: reduxUser.fullName || reduxUser.username,
        username: reduxUser.username,
        role: reduxUser.role,
        email: reduxUser.email,
        branch_id: reduxUser.branchId || reduxUser.branch_id || 1,
        shop_id: reduxUser.shopId || reduxUser.shop_id || 1,
      };
    }
    return { id: 1, name: 'Demo User', username: 'demo', role: 'Cashier', email: 'demo@example.com', branch_id: 1, shop_id: 1 };
  }, [reduxUser?.id, reduxUser?.branchId, isAuthenticated]);

  const branchId = currentUser.branch_id;

  // ===== SEED =====
  useEffect(() => { ensureExpenseSeed(); }, []);

  // ===== STATE (localStorage based) =====
  const [expenses, setExpenses] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1 });
  const [logPagination, setLogPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1 });
  const [categoryCounts, setCategoryCounts] = useState({});
  const [statusCounts, setStatusCounts] = useState({});
  const [depreciationCounts, setDepreciationCounts] = useState({});
  const [actionTypeCounts, setActionTypeCounts] = useState({ all: 0, CREATE: 0, UPDATE: 0, DELETE: 0, STATUS_CHANGE: 0 });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPaymentMethod, setFilterPaymentMethod] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepreciation, setFilterDepreciation] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [customFromDate, setCustomFromDate] = useState('');
  const [customToDate, setCustomToDate] = useState('');
  const [summary, setSummary] = useState({ totalAmount: 0, totalDepreciation: 0, totalCapital: 0, monthlyExpense: 0 });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ===== Local UI States =====
  const [showModal, setShowModal] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ show: false, expense: null });
  const [activeTab, setActiveTab] = useState('expenses');
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);
  const pageChangeTimeoutRef = useRef(null);
  const [showHistoryDatePicker, setShowHistoryDatePicker] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(null);
  const [sortField, setSortField] = useState('id');
  const [sortDirection, setSortDirection] = useState('desc');
  const [networkError, setNetworkError] = useState(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const [viewExpense, setViewExpense] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [employeeLoading, setEmployeeLoading] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);

  // ===== FETCH EMPLOYEES =====
  const fetchEmployees = useCallback(() => {
    const list = getData(EMPLOYEES_KEY, []).filter(e => e.status === 'Active' && e.role !== 'VIEWER');
    setEmployees(list);
    return list;
  }, []);

  useEffect(() => {
    if (branchId) fetchEmployees();
  }, [branchId, fetchEmployees]);

  // ===== LOAD EXPENSES =====
  const loadExpenses = useCallback((page = 1, size = 10, search = '', category = 'all', method = 'all', status = 'all', depr = 'all') => {
    setLoading(true);
    try {
      let all = getData(EXPENSES_KEY, []);
      all = all.filter(e => !e.branchId || e.branchId === branchId);

      // Category counts
      const cCounts = { all: all.length };
      all.forEach(e => { cCounts[e.category] = (cCounts[e.category] || 0) + 1; });
      setCategoryCounts(cCounts);

      // Status counts
      const sCounts = { all: all.length };
      all.forEach(e => { sCounts[e.status] = (sCounts[e.status] || 0) + 1; });
      setStatusCounts(sCounts);

      // Depreciation counts
      const dCounts = { all: 0 };
      all.forEach(e => { if (e.depreciationType) dCounts.all++; });
      setDepreciationCounts(dCounts);

      // Summary
      const now = new Date();
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const totalAmount = all.filter(e => e.category !== 'Capital').reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const totalDepreciation = all.filter(e => e.category === 'Depreciation').reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const totalCapital = all.filter(e => e.category === 'Capital').reduce((s, e) => s + (Number(e.amount) || 0), 0);
      const monthlyExpense = all.filter(e => {
        const d = new Date(e.expenseDate);
        return d >= monthStart && e.category !== 'Capital';
      }).reduce((s, e) => s + (Number(e.amount) || 0), 0);
      setSummary({ totalAmount, totalDepreciation, totalCapital, monthlyExpense });

      // Filter
      let filtered = [...all];
      if (category && category !== 'all') filtered = filtered.filter(e => e.category === category);
      if (method && method !== 'all') filtered = filtered.filter(e => e.paymentMethod === method);
      if (status && status !== 'all') filtered = filtered.filter(e => e.status === status);
      if (depr && depr !== 'all') filtered = filtered.filter(e => e.depreciationType === depr);
      if (search) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(e =>
          e.title?.toLowerCase().includes(q) ||
          e.category?.toLowerCase().includes(q) ||
          e.vendor?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q)
        );
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      // Pagination
      const totalItems = filtered.length;
      const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
      const safePage = Math.min(Math.max(1, page), totalPagesCalc);
      const start = (safePage - 1) * size;
      const paged = filtered.slice(start, start + size);

      setExpenses(paged);
      setPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc });
      setPageInputValue(safePage.toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // ===== LOAD LOGS =====
  const loadLogs = useCallback((page = 1, size = 10, action = 'all', dFilter = 'all', fromDate = '', toDate = '') => {
    setLoading(true);
    try {
      let all = getData(LOGS_KEY, []);
      all = all.filter(l => !l.branchId || l.branchId === branchId);

      // Action counts
      const aCounts = {
        all: all.length,
        CREATE: all.filter(l => l.actionType === 'CREATE').length,
        UPDATE: all.filter(l => l.actionType === 'UPDATE').length,
        DELETE: all.filter(l => l.actionType === 'DELETE').length,
        STATUS_CHANGE: all.filter(l => l.actionType === 'STATUS_CHANGE').length,
      };
      setActionTypeCounts(aCounts);

      if (action && action !== 'all') all = all.filter(l => l.actionType === action);

      // Date filter
      if (dFilter && dFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

        all = all.filter(log => {
          if (!log.createdAt) return true;
          const ld = new Date(log.createdAt);
          switch (dFilter) {
            case 'today': return ld >= today;
            case 'yesterday': return ld >= yesterday && ld < today;
            case 'thisWeek': return ld >= weekAgo;
            case 'thisMonth': return ld >= monthAgo;
            case 'custom':
              if (fromDate && toDate) {
                const from = new Date(fromDate);
                const to = new Date(toDate);
                to.setHours(23, 59, 59, 999);
                return ld >= from && ld <= to;
              }
              return true;
            default: return true;
          }
        });
      }

      all.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalItems = all.length;
      const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
      const safePage = Math.min(Math.max(1, page), totalPagesCalc);
      const start = (safePage - 1) * size;
      const paged = all.slice(start, start + size);

      setLogs(paged);
      setLogPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc });
      setHistoryPageInputValue(safePage.toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  // ===== INITIAL LOAD =====
  useEffect(() => {
    if (!initialLoadDone.current && branchId) {
      initialLoadDone.current = true;
      loadExpenses(1, 10, '', 'all', 'all', 'all', 'all');
      loadLogs(1, 10, 'all', 'all', '', '');
    }
  }, [branchId, loadExpenses, loadLogs]);

  // ===== SEARCH DEBOUNCE =====
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setSearchTerm(localSearchTerm);
      setPagination(p => ({ ...p, page: 1 }));
      setPageInputValue('1');
      loadExpenses(1, pagination.size, localSearchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
    }, 500);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [localSearchTerm]);

  // ===== FILTER CHANGES =====
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (activeTab !== 'expenses') return;
    loadExpenses(1, pagination.size, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
  }, [filterCategory, filterPaymentMethod, filterStatus, filterDepreciation, pagination.size]);

  // ===== LOG FILTER CHANGES =====
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (activeTab !== 'history') return;
    loadLogs(1, logPagination.size, actionFilter, dateFilter, customFromDate, customToDate);
  }, [actionFilter, dateFilter, customFromDate, customToDate, logPagination.size]);

  // ===== CLEAR SUCCESS/ERROR =====
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(false), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); }
  }, [error]);

  // ===== CLEANUP =====
  useEffect(() => {
    return () => {
      if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // ===== SAVE EXPENSE =====
  const handleSaveExpense = async (data) => {
    try {
      await new Promise(r => setTimeout(r, 300));
      const items = getData(EXPENSES_KEY, []);
      const now = new Date().toISOString();

      if (editingExpense) {
        const idx = items.findIndex(e => e.id === editingExpense.id);
        if (idx !== -1) {
          items[idx] = {
            ...items[idx],
            ...data,
            amount: parseFloat(data.amount) || 0,
            updatedAt: now
          };
          saveData(EXPENSES_KEY, items);
          addExpenseLog({
            actionType: 'UPDATE', expenseId: items[idx].id, expenseName: items[idx].title,
            createdByName: currentUser.name, createdByRole: currentUser.role, branchId,
            changes: [`Expense updated: ${items[idx].title}`, `Amount: ${items[idx].amount.toLocaleString()} Ks`]
          });
        }
      } else {
        const newId = generateExpenseId();
        const newExpense = {
          id: newId,
          ...data,
          amount: parseFloat(data.amount) || 0,
          createdByName: currentUser.name,
          createdByRole: currentUser.role,
          createdAt: now,
          branchId
        };
        items.unshift(newExpense);
        saveData(EXPENSES_KEY, items);
        addExpenseLog({
          actionType: 'CREATE', expenseId: newId, expenseName: newExpense.title,
          createdByName: currentUser.name, createdByRole: currentUser.role, branchId,
          changes: [`Title: ${newExpense.title}`, `Amount: ${newExpense.amount.toLocaleString()} Ks`]
        });
      }

      setShowModal(false);
      setEditingExpense(null);
      setSuccess(true);
      loadExpenses(1, pagination.size, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
      loadLogs(1, logPagination.size, actionFilter, dateFilter, customFromDate, customToDate);
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== DELETE EXPENSE =====
  const handleDeleteExpense = async () => {
    if (!deleteModal.expense) return;
    try {
      await new Promise(r => setTimeout(r, 200));
      const items = getData(EXPENSES_KEY, []);
      const target = items.find(e => e.id === deleteModal.expense.id);
      const filtered = items.filter(e => e.id !== deleteModal.expense.id);
      saveData(EXPENSES_KEY, filtered);

      if (target) {
        addExpenseLog({
          actionType: 'DELETE', expenseId: target.id, expenseName: target.title,
          createdByName: currentUser.name, createdByRole: currentUser.role, branchId,
          changes: [`Expense deleted: ${target.title}`]
        });
      }

      setDeleteModal({ show: false, expense: null });
      setSuccess(true);
      loadExpenses(1, pagination.size, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
      loadLogs(1, logPagination.size, actionFilter, dateFilter, customFromDate, customToDate);
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== STATUS UPDATE =====
  const handleStatusUpdate = async (expenseId, newStatus) => {
    try {
      await new Promise(r => setTimeout(r, 150));
      const items = getData(EXPENSES_KEY, []);
      const idx = items.findIndex(e => e.id === expenseId);
      if (idx !== -1) {
        const oldStatus = items[idx].status;
        items[idx] = { ...items[idx], status: newStatus, updatedAt: new Date().toISOString() };
        saveData(EXPENSES_KEY, items);
        addExpenseLog({
          actionType: 'STATUS_CHANGE', expenseId, expenseName: items[idx].title,
          createdByName: currentUser.name, createdByRole: currentUser.role, branchId,
          changes: [`Status: ${oldStatus} → ${newStatus}`]
        });
        setSuccess(true);
        loadExpenses(pagination.page, pagination.size, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
        loadLogs(1, logPagination.size, actionFilter, dateFilter, customFromDate, customToDate);
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // ===== EXPORT =====
  const handleExport = async (exportType) => {
    setExportLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      let rows = [];
      let filename = `expense_data_${new Date().toISOString().slice(0, 10)}.csv`;

      if (exportType === 'expenses' || exportType === 'both') {
        const all = getData(EXPENSES_KEY, []).filter(e => !e.branchId || e.branchId === branchId);
        rows.push('=== EXPENSES ===');
        rows.push(['Title', 'Category', 'SubCategory', 'Amount', 'Date', 'Payment', 'Vendor', 'Status'].join(','));
        all.forEach(e => {
          rows.push([`"${e.title}"`, e.category, e.subCategory || '', e.amount, e.expenseDate, e.paymentMethod, `"${e.vendor || ''}"`, e.status].join(','));
        });
        rows.push('');
      }

      if (exportType === 'logs' || exportType === 'both') {
        const all = getData(LOGS_KEY, []).filter(l => !l.branchId || l.branchId === branchId);
        if (exportType === 'both') rows.push('=== LOGS ===');
        rows.push(['Action', 'Expense', 'User', 'Role', 'Date', 'Changes'].join(','));
        all.forEach(l => {
          rows.push([l.actionType, `"${l.expenseName}"`, `"${l.createdByName}"`, l.createdByRole, new Date(l.createdAt).toLocaleDateString(), `"${(l.changes || []).join('; ')}"`].join(','));
        });
      }

      const blob = new Blob(['\ufeff' + rows.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  // ===== Helper Functions =====
  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '0 Ks';
    const num = typeof amount === 'number' ? amount : parseFloat(amount);
    if (isNaN(num)) return '0 Ks';
    return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(num) + ' Ks';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const getCategoryBadgeClass = (category) => {
    const map = {
      'Salary': 'cat-salary', 'Rent': 'cat-rent', 'Utilities': 'cat-utilities',
      'Software': 'cat-software', 'Equipment': 'cat-equipment', 'Supplies': 'cat-supplies',
      'Marketing': 'cat-marketing', 'Transport': 'cat-transport', 'Food': 'cat-food',
      'Insurance': 'cat-insurance', 'Tax': 'cat-tax', 'Maintenance': 'cat-maintenance',
      'Depreciation': 'cat-depreciation', 'Capital': 'cat-capital', 'Other': 'cat-other'
    };
    return map[category] || 'cat-other';
  };

  const getPaymentMethodBadge = (method) => {
    const map = {
      'Cash': 'method-cash', 'Bank Transfer': 'method-bank',
      'Credit Card': 'method-credit', 'Mobile Payment': 'method-mobile', 'Check': 'method-check'
    };
    return map[method] || 'method-other';
  };

  const getActionIcon = (actionType) => {
    const map = { 'CREATE': 'fa-plus-circle', 'UPDATE': 'fa-edit', 'STATUS_CHANGE': 'fa-exchange-alt', 'DELETE': 'fa-trash' };
    return map[actionType] || 'fa-history';
  };

  const getActionColor = (actionType) => {
    const map = { 'CREATE': '#10b981', 'UPDATE': '#3b82f6', 'STATUS_CHANGE': '#f59e0b', 'DELETE': '#ef4444' };
    return map[actionType] || '#6b7280';
  };

  const getActionLabel = (actionType) => {
    if (lang === 'mm') {
      const map = { 'CREATE': 'အသစ်ထည့်', 'UPDATE': 'ပြင်ဆင်', 'STATUS_CHANGE': 'အခြေအနေပြောင်း', 'DELETE': 'ဖျက်' };
      return map[actionType] || 'လုပ်ဆောင်ချက်';
    }
    const map = { 'CREATE': 'Created', 'UPDATE': 'Updated', 'STATUS_CHANGE': 'Status Changed', 'DELETE': 'Deleted' };
    return map[actionType] || 'Action';
  };

  const getDepreciationLabel = (type) => {
    if (lang === 'mm') {
      const map = { 'straight_line': 'တန်းတူ', 'declining_balance': 'ကျဆင်းနေသော', 'unit_of_production': 'ထုတ်လုပ်မှုအလိုက်' };
      return map[type] || type;
    }
    const map = { 'straight_line': 'Straight Line', 'declining_balance': 'Declining Balance', 'unit_of_production': 'Unit of Production' };
    return map[type] || type;
  };

  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const dateKey = date.toLocaleDateString(lang === 'mm' ? 'my' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    });
    return grouped;
  };

  const groupedHistory = useMemo(() => groupLogsByDate(logs || []), [logs, lang]);

  const getEmployeeName = useCallback((employeeId) => {
    if (!employeeId) return null;
    const emp = employees.find(e => e.id === employeeId);
    return emp ? (emp.fullName || emp.username) : null;
  }, [employees]);

  // ===== Pagination Handlers =====
  const changePage = useCallback((newPage, direction) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      loadExpenses(newPage, pagination.size, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
      setLoadingDirection(null);
      if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
    }, 150);
  }, [pagination.page, pagination.totalPages, pagination.size, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation, loadExpenses]);

  const changeHistoryPage = useCallback((newPage, direction) => {
    if (newPage === logPagination.page || newPage < 1 || newPage > logPagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      loadLogs(newPage, logPagination.size, actionFilter, dateFilter, customFromDate, customToDate);
      setLoadingDirection(null);
      if (historyContainerRef.current) historyContainerRef.current.scrollTop = 0;
    }, 150);
  }, [logPagination.page, logPagination.totalPages, logPagination.size, actionFilter, dateFilter, customFromDate, customToDate, loadLogs]);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPagination(p => ({ ...p, size: newSize, page: 1 }));
    setPageInputValue("1");
    loadExpenses(1, newSize, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
  };

  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setLogPagination(p => ({ ...p, size: newSize, page: 1 }));
    setHistoryPageInputValue("1");
    loadLogs(1, newSize, actionFilter, dateFilter, customFromDate, customToDate);
  };

  // ===== Sort Handler =====
  const handleSort = (field) => {
    if (sortField === field) setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = [...(expenses || [])];
    filtered.sort((a, b) => {
      let aVal = a[sortField] || '';
      let bVal = b[sortField] || '';
      if (typeof aVal === 'string') { aVal = aVal.toLowerCase(); bVal = bVal.toLowerCase(); }
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
    return filtered;
  }, [expenses, sortField, sortDirection]);

  // ===== Options =====
  const categoryOptions = [
    { value: 'all', label_en: 'All Categories', label_mm: 'အမျိုးအစားအားလုံး' },
    { value: 'Salary', label_en: 'Salary', label_mm: 'ဝန်ထမ်းခ' },
    { value: 'Rent', label_en: 'Rent', label_mm: 'ဆိုင်ငှားခ' },
    { value: 'Utilities', label_en: 'Utilities', label_mm: 'ရေဖိုးမီးဘာညာ' },
    { value: 'Software', label_en: 'Software', label_mm: 'ဆော့ဝဲလ်' },
    { value: 'Equipment', label_en: 'Equipment', label_mm: 'ပစ္စည်းကိရိယာ' },
    { value: 'Supplies', label_en: 'Supplies', label_mm: 'သုံးစွဲပစ္စည်း' },
    { value: 'Marketing', label_en: 'Marketing', label_mm: 'စျေးကွက်ရှာဖွေရေး' },
    { value: 'Transport', label_en: 'Transport', label_mm: 'သယ်ယူပို့ဆောင်ရေး' },
    { value: 'Food', label_en: 'Food', label_mm: 'စားသောက်ကုန်' },
    { value: 'Insurance', label_en: 'Insurance', label_mm: 'အာမခံ' },
    { value: 'Tax', label_en: 'Tax', label_mm: 'အခွန်' },
    { value: 'Maintenance', label_en: 'Maintenance', label_mm: 'ပြုပြင်ထိန်းသိမ်းခြင်း' },
    { value: 'Depreciation', label_en: 'Depreciation', label_mm: 'တန်ဖိုးလျော့ချခြင်း' },
    { value: 'Other', label_en: 'Other', label_mm: 'အခြား' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label_en: 'All Methods', label_mm: 'အားလုံး' },
    { value: 'Cash', label_en: 'Cash', label_mm: 'ငွေသား' },
    { value: 'Bank Transfer', label_en: 'Bank Transfer', label_mm: 'ဘဏ်လွှဲ' },
    { value: 'Credit Card', label_en: 'Credit Card', label_mm: 'ခရက်ဒစ်ကဒ်' },
    { value: 'Mobile Payment', label_en: 'Mobile Payment', label_mm: 'မိုဘိုင်းငွေပေးချေ' },
    { value: 'Check', label_en: 'Check', label_mm: 'ချက်' }
  ];

  const statusOptions = [
    { value: 'all', label_en: 'All Status', label_mm: 'အားလုံး' },
    { value: 'Paid', label_en: 'Paid', label_mm: 'ပေးချေပြီး' },
    { value: 'Pending', label_en: 'Pending', label_mm: 'ဆိုင်ငံ့' },
    { value: 'Cancelled', label_en: 'Cancelled', label_mm: 'ပယ်ဖျက်ထား' }
  ];

  const actionFilterOptions = [
    { value: 'all', label_en: 'All Actions', label_mm: 'အားလုံး' },
    { value: 'CREATE', label_en: 'Created', label_mm: 'အသစ်ထည့်' },
    { value: 'UPDATE', label_en: 'Updated', label_mm: 'ပြင်ဆင်' },
    { value: 'STATUS_CHANGE', label_en: 'Status Change', label_mm: 'အခြေအနေပြောင်း' },
    { value: 'DELETE', label_en: 'Deleted', label_mm: 'ဖျက်' }
  ];

  const dateFilterOptions = [
    { value: 'all', label_en: 'All Time', label_mm: 'အားလုံး' },
    { value: 'today', label_en: 'Today', label_mm: 'ယနေ့' },
    { value: 'yesterday', label_en: 'Yesterday', label_mm: 'မနေ့က' },
    { value: 'thisWeek', label_en: 'This Week', label_mm: 'ဒီအပတ်' },
    { value: 'thisMonth', label_en: 'This Month', label_mm: 'ဒီလ' },
    { value: 'custom', label_en: 'Custom', label_mm: 'စိတ်ကြိုက်' }
  ];

  const handleCustomDateApply = () => {
    if (customFromDate && customToDate) {
      loadLogs(1, logPagination.size, actionFilter, 'custom', customFromDate, customToDate);
      setHistoryPageInputValue("1");
    }
  };

  const retryConnection = () => {
    setNetworkError(null);
    if (activeTab === 'history') loadLogs(logPagination.page, logPagination.size, actionFilter, dateFilter, customFromDate, customToDate);
    else loadExpenses(pagination.page, pagination.size, searchTerm, filterCategory, filterPaymentMethod, filterStatus, filterDepreciation);
  };

  // ===== JSX (SAME AS ORIGINAL) =====
  return (
    <div className="expense-container">
      {/* ===== MESSAGES - Overlay Top Right ===== */}
      <div className="expense-messages-overlay">
        {success && (
          <div className="expense-message success">
            <i className="fas fa-check-circle"></i>
            <span>{lang === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={() => setSuccess(false)}><i className="fas fa-times"></i></button>
          </div>
        )}
        {error && (
          <div className="expense-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button onClick={() => setError(null)}><i className="fas fa-times"></i></button>
          </div>
        )}
        {networkError && (
          <div className="expense-network-error">
            <i className="fas fa-wifi-slash"></i>
            <div className="expense-error-content">
              <div className="expense-error-title">{lang === 'mm' ? 'ချိတ်ဆက်မှုအမှား' : 'Connection Error'}</div>
              <div className="expense-error-message">{networkError}</div>
            </div>
            <button onClick={retryConnection}><i className="fas fa-sync-alt"></i> {lang === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}</button>
          </div>
        )}
      </div>

      {/* ===== HEADER BAR ===== */}
      <div className="expense-header-bar">
        <div className="expense-tabs-selector">
          <div className="expense-select-container">
            <i className={`fas ${activeTab === 'expenses' ? 'fa-money-bill-wave' : 'fa-history'} expense-select-icon`}></i>
            <select className="expense-tab-select" value={activeTab}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'export') { setShowExportModal(true); e.target.value = activeTab; return; }
                setActiveTab(value);
              }}
              disabled={loading}>
              <option value="expenses">{lang === 'mm' ? 'ကုန်ကျစရိတ်' : 'Expenses'} ({pagination.total || 0})</option>
              <option value="history">{lang === 'mm' ? 'မှတ်တမ်း' : 'History'} ({logPagination.total || 0})</option>
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>
                {lang === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
              </option>
            </select>
            <i className="fas fa-chevron-down expense-select-arrow"></i>
          </div>
        </div>

        {activeTab === 'expenses' && (
          <div className="expense-filter-bar">
            <div className="expense-search-box">
              <i className="fas fa-search"></i>
              <input type="text"
                placeholder={lang === 'mm' ? 'အမည်၊ အမျိုးအစား၊ ပေးသွင်းသူ...' : 'Search...'}
                value={localSearchTerm}
                onChange={(e) => setLocalSearchTerm(e.target.value)}
                disabled={loading} />
              {localSearchTerm && (
                <button className="expense-clear-search-btn" onClick={() => { setLocalSearchTerm(''); setSearchTerm(''); loadExpenses(1, pagination.size, '', filterCategory, filterPaymentMethod, filterStatus, filterDepreciation); }} disabled={loading}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            <select className="expense-filter-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} disabled={loading}>
              {categoryOptions.map(opt => (<option key={opt.value} value={opt.value}>{lang === 'mm' ? opt.label_mm : opt.label_en}</option>))}
            </select>
            <select className="expense-filter-select" value={filterPaymentMethod} onChange={(e) => setFilterPaymentMethod(e.target.value)} disabled={loading}>
              {paymentMethodOptions.map(opt => (<option key={opt.value} value={opt.value}>{lang === 'mm' ? opt.label_mm : opt.label_en}</option>))}
            </select>
            <select className="expense-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} disabled={loading}>
              {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{lang === 'mm' ? opt.label_mm : opt.label_en}</option>))}
            </select>
            {(searchTerm || filterCategory !== 'all' || filterPaymentMethod !== 'all' || filterStatus !== 'all') && (
              <button className="expense-clear-filters-btn" onClick={() => {
                setLocalSearchTerm(''); setSearchTerm('');
                setFilterCategory('all'); setFilterPaymentMethod('all'); setFilterStatus('all');
                loadExpenses(1, pagination.size, '', 'all', 'all', 'all', filterDepreciation);
              }} disabled={loading}>
                <i className="fas fa-times"></i> {lang === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
              </button>
            )}
          </div>
        )}

        {activeTab === 'expenses' && (
          <button onClick={() => { setEditingExpense(null); setShowModal(true); }} className="expense-add-btn" disabled={loading}>
            <i className="fas fa-plus"></i> {lang === 'mm' ? 'ကုန်ကျစရိတ်အသစ်' : 'New Expense'}
          </button>
        )}
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="expense-summary-cards">
        <div className="expense-summary-card total">
          <div className="expense-summary-info">
            <div className="expense-summary-label">
              {lang === 'mm' ? 'စုစုပေါင်းကုန်ကျစရိတ်' : 'Total Expenses'}
              <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{lang === 'mm' ? '(မတည်ငွေမပါ)' : '(excl. Capital)'}</span>
            </div>
            <div className="expense-summary-value">{formatCurrency(summary?.totalAmount || 0)}</div>
          </div>
        </div>
        <div className="expense-summary-card depreciation">
          <div className="expense-summary-info">
            <div className="expense-summary-label">{lang === 'mm' ? 'တန်ဖိုးလျော့ချခြင်း' : 'Depreciation'}</div>
            <div className="expense-summary-value">{formatCurrency(summary?.totalDepreciation || 0)}</div>
          </div>
        </div>
        <div className="expense-summary-card monthly">
          <div className="expense-summary-info">
            <div className="expense-summary-label">{lang === 'mm' ? 'ဒီလ' : 'This Month'}</div>
            <div className="expense-summary-value">{formatCurrency(summary?.monthlyExpense || 0)}</div>
          </div>
        </div>
      </div>

      {/* ===== EXPENSES TAB ===== */}
      {activeTab === 'expenses' && (
      <>
        <div className="expense-section-title">
          <div className="expense-title-row">
            <div className="expense-title-left">
              <i className="fas fa-money-bill-wave"></i>
              <span className="expense-title-text">{lang === 'mm' ? 'ကုန်ကျစရိတ်အားလုံး' : 'All Expenses'}</span>
            </div>
            <div className="expense-title-center">
              <div className="expense-compact-nav">
                <button className={`expense-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changePage(pagination.page - 1, 'prev')} disabled={pagination.page === 1 || loading}>
                  {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                </button>
                <div className="expense-page-control">
                  <input type="text" className="expense-page-input" value={pageInputValue}
                    onChange={(e) => setPageInputValue(e.target.value)}
                    onBlur={() => { const value = parseInt(pageInputValue); if (!isNaN(value) && value >= 1 && value <= pagination.totalPages && value !== pagination.page) changePage(value, 'jump'); else setPageInputValue(pagination.page.toString()); }}
                    onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                  <span className="expense-page-total">/ {pagination.totalPages.toLocaleString()}</span>
                </div>
                <button className={`expense-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changePage(pagination.page + 1, 'next')} disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || loading}>
                  {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                </button>
                <div className="expense-items-per-page">
                  <select className="expense-per-page-select" value={pagination.size} onChange={handlePageSizeChange} disabled={loading}>
                    <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                  </select>
                  <span className="expense-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                </div>
              </div>
            </div>
            <div className="expense-title-right">
              {loading ? (
                <span className="expense-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="expense-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
              ) : (
                <span className="expense-showing-count">
                  <span className="expense-count-numbers">{pagination.total > 0 ? ((pagination.page - 1) * pagination.size) + 1 : 0}</span>
                  <span> - </span>
                  <span className="expense-count-numbers">{Math.min(pagination.page * pagination.size, pagination.total)}</span>
                  <span> / </span>
                  <span className="expense-count-numbers">{pagination.total.toLocaleString()}</span>
                  <span className="expense-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                </span>
              )}
            </div>
          </div>
          {(searchTerm || filterCategory !== 'all' || filterPaymentMethod !== 'all' || filterStatus !== 'all') && (
            <div className="expense-search-badge-container">
              {searchTerm && <span className="expense-search-badge"><i className="fas fa-search"></i> "{searchTerm}"</span>}
              {filterCategory !== 'all' && <span className="expense-search-badge"><i className="fas fa-tag"></i> {categoryOptions.find(o => o.value === filterCategory)?.[lang === 'mm' ? 'label_mm' : 'label_en']}</span>}
              {filterPaymentMethod !== 'all' && <span className="expense-search-badge"><i className="fas fa-credit-card"></i> {paymentMethodOptions.find(o => o.value === filterPaymentMethod)?.[lang === 'mm' ? 'label_mm' : 'label_en']}</span>}
              {filterStatus !== 'all' && <span className="expense-search-badge"><i className="fas fa-check-circle"></i> {statusOptions.find(o => o.value === filterStatus)?.[lang === 'mm' ? 'label_mm' : 'label_en']}</span>}
            </div>
          )}
        </div>

        <div className="expense-table-wrapper" ref={tableBodyRef}>
          <table className="expense-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>{lang === 'mm' ? 'နံပါတ်' : 'No'}</th>
                <th className="sortable" onClick={() => handleSort('title')}>{lang === 'mm' ? 'အမည်' : 'Title'}{sortField === 'title' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}</th>
                <th className="sortable" onClick={() => handleSort('category')}>{lang === 'mm' ? 'အမျိုးအစား' : 'Category'}{sortField === 'category' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}</th>
                <th>{lang === 'mm' ? 'အမျိုးအစားခွဲ' : 'Sub Category'}</th>
                <th className="sortable" onClick={() => handleSort('amount')}>{lang === 'mm' ? 'ပမာဏ' : 'Amount'}{sortField === 'amount' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}</th>
                <th className="sortable" onClick={() => handleSort('date')}>{lang === 'mm' ? 'ရက်စွဲ' : 'Date'}{sortField === 'date' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}</th>
                <th>{lang === 'mm' ? 'ငွေပေးချေမှု' : 'Payment'}</th>
                <th>{lang === 'mm' ? 'ပေးသွင်းသူ' : 'Vendor'}</th>
                <th className="sortable" onClick={() => handleSort('status')}>{lang === 'mm' ? 'အခြေအနေ' : 'Status'}{sortField === 'status' && <i className={`fas fa-sort-${sortDirection === 'asc' ? 'up' : 'down'}`}></i>}</th>
                <th>{lang === 'mm' ? 'တန်ဖိုးလျော့' : 'Depreciation'}</th>
                <th style={{ width: '140px' }}>{lang === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="11" className="expense-no-data"><div className="expense-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p></div></td></tr>
              ) : filteredAndSortedExpenses.length > 0 ? (
                filteredAndSortedExpenses.map((expense, index) => (
                  <tr key={expense.id}>
                    <td className="expense-serial-cell">{((pagination.page - 1) * pagination.size) + index + 1}</td>
                    <td className="expense-title-cell">
                      <span className="expense-title">{expense.title}</span>
                      {expense.description && <div className="expense-desc-preview"><i className="fas fa-info-circle"></i> {expense.description.length > 30 ? expense.description.substring(0, 30) + '...' : expense.description}</div>}
                    </td>
                    <td><span className={`expense-category-badge ${getCategoryBadgeClass(expense.category)}`}>{lang === 'mm' ? categoryOptions.find(c => c.value === expense.category)?.label_mm || expense.category : expense.category}</span></td>
                    <td>
                      {expense.category === 'Salary' && expense.employeeId ? (
                        <div className="expense-employee-cell">
                          <div className="expense-employee-name"><i className="fas fa-user" style={{ color: '#10b981', fontSize: '12px', marginRight: '4px' }}></i>{getEmployeeName(expense.employeeId) || expense.employeeName || 'Unknown'}</div>
                          {expense.subCategory && <div className="expense-sub-category-text" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{expense.subCategory}</div>}
                        </div>
                      ) : expense.category === 'Salary' && expense.subCategory ? (
                        <div className="expense-employee-cell">
                          <div className="expense-employee-name" style={{ color: '#f59e0b' }}><i className="fas fa-user" style={{ fontSize: '12px', marginRight: '4px' }}></i>{expense.subCategory}</div>
                          <div className="expense-sub-category-text" style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{lang === 'mm' ? 'ဝန်ထမ်း' : 'Employee'}</div>
                        </div>
                      ) : (
                        <span className="expense-sub-category">{expense.subCategory || '-'}</span>
                      )}
                    </td>
                    <td className="expense-amount-cell"><span className="expense-amount">{formatCurrency(expense.amount)}</span></td>
                    <td className="expense-date-cell">{formatDate(expense.expenseDate)}</td>
                    <td><span className={`expense-payment-badge ${getPaymentMethodBadge(expense.paymentMethod)}`}>{expense.paymentMethod}</span></td>
                    <td className="expense-vendor-cell">{expense.vendor ? <span className="expense-vendor">{expense.vendor}</span> : <span className="expense-vendor-empty">-</span>}</td>
                    <td>
                      <select className={`expense-status-select ${expense.status === 'Paid' ? 'status-paid' : expense.status === 'Pending' ? 'status-pending' : 'status-cancelled'}`} value={expense.status} onChange={(e) => handleStatusUpdate(expense.id, e.target.value)} disabled={loading}>
                        <option value="Paid">{lang === 'mm' ? 'ပေးချေပြီး' : 'Paid'}</option>
                        <option value="Pending">{lang === 'mm' ? 'ဆိုင်ငံ့' : 'Pending'}</option>
                        <option value="Cancelled">{lang === 'mm' ? 'ပယ်ဖျက်ထား' : 'Cancelled'}</option>
                      </select>
                    </td>
                    <td>{expense.depreciationType ? <span className="expense-depreciation-badge">{getDepreciationLabel(expense.depreciationType)}{expense.depreciationRate && ` (${expense.depreciationRate}%)`}</span> : '-'}</td>
                    <td className="expense-actions-cell">
                      <button className="expense-btn-action view" title={lang === 'mm' ? 'အသေးစိတ်ကြည့်ရန်' : 'View Details'} onClick={() => { setViewExpense(expense); setShowViewModal(true); }} disabled={loading}><i className="fas fa-eye"></i></button>
                      <button className="expense-btn-action edit" title={lang === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit'} onClick={() => { setEditingExpense(expense); setShowModal(true); }} disabled={loading}><i className="fas fa-edit"></i></button>
                      <button className="expense-btn-action delete" title={lang === 'mm' ? 'ဖျက်ရန်' : 'Delete'} onClick={() => setDeleteModal({ show: true, expense })} disabled={loading}><i className="fas fa-trash"></i></button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="11" className="expense-empty-state" style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                  <i className="fas fa-money-bill-wave"></i>
                  <p>{lang === 'mm' ? 'ကုန်ကျစရိတ် မတွေ့ပါ' : 'No expenses found'}</p>
                  <span>{lang === 'mm' ? 'ရှာဖွေမှု သို့မဟုတ် စစ်ထုတ်မှုကို ပြောင်းလဲကြည့်ပါ' : 'Try adjusting your search or filter'}</span>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    )}

      {/* ===== HISTORY TAB ===== */}
      {activeTab === 'history' && (
        <div className="expense-history-section">
          <div className="expense-section-title">
            <div className="expense-title-row">
              <div className="expense-title-left">
                <i className="fas fa-history"></i>
                <span className="expense-title-text">{lang === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}</span>
              </div>
              <div className="expense-title-center">
                <div className="expense-compact-nav">
                  <button className={`expense-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page - 1, 'prev')} disabled={logPagination.page === 1 || loading}>
                    {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                  </button>
                  <div className="expense-page-control">
                    <input type="text" className="expense-page-input" value={historyPageInputValue}
                      onChange={(e) => setHistoryPageInputValue(e.target.value)}
                      onBlur={() => { const value = parseInt(historyPageInputValue); if (!isNaN(value) && value >= 1 && value <= logPagination.totalPages && value !== logPagination.page) changeHistoryPage(value, 'jump'); else setHistoryPageInputValue(logPagination.page.toString()); }}
                      onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                    <span className="expense-page-total">/ {logPagination.totalPages.toLocaleString()}</span>
                  </div>
                  <button className={`expense-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page + 1, 'next')} disabled={logPagination.page === logPagination.totalPages || logPagination.totalPages === 0 || loading}>
                    {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                  </button>
                  <div className="expense-items-per-page">
                    <select className="expense-per-page-select" value={logPagination.size} onChange={handleLogPageSizeChange} disabled={loading}>
                      <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                    </select>
                    <span className="expense-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                  </div>
                </div>
              </div>
              <div className="expense-title-right">
                {loading ? (
                  <span className="expense-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="expense-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                ) : (
                  <span className="expense-showing-count">
                    <span className="expense-count-numbers">{logPagination.total > 0 ? ((logPagination.page - 1) * logPagination.size) + 1 : 0}</span>
                    <span> - </span>
                    <span className="expense-count-numbers">{Math.min(logPagination.page * logPagination.size, logPagination.total)}</span>
                    <span> / </span>
                    <span className="expense-count-numbers">{logPagination.total.toLocaleString()}</span>
                    <span className="expense-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="expense-log-filters">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
              <div className="expense-filter-tabs" style={{ flex: '1 1 auto' }}>
                {actionFilterOptions.map(opt => (
                  <button key={opt.value} className={`expense-filter-tab ${actionFilter === opt.value ? 'active' : ''}`} onClick={() => { setActionFilter(opt.value); setHistoryPageInputValue("1"); }} disabled={loading}>
                    {lang === 'mm' ? opt.label_mm : opt.label_en}
                    <span className="expense-filter-count">({actionTypeCounts?.[opt.value] || 0})</span>
                  </button>
                ))}
              </div>
              <div className="expense-filter-tabs" style={{ marginLeft: 'auto' }}>
                {dateFilterOptions.map(opt => (
                  <button key={opt.value} className={`expense-filter-tab ${dateFilter === opt.value ? 'active' : ''}`}
                    onClick={() => { setDateFilter(opt.value); setShowHistoryDatePicker(opt.value === 'custom'); setHistoryPageInputValue("1"); }} disabled={loading}>
                    {lang === 'mm' ? opt.label_mm : opt.label_en}
                  </button>
                ))}
                {dateFilter !== 'all' && (
                  <button className="expense-filter-tab" onClick={() => { setDateFilter('all'); setShowHistoryDatePicker(false); setCustomFromDate(''); setCustomToDate(''); setHistoryPageInputValue("1"); }} style={{ backgroundColor: '#fef2f7', color: '#f72585' }} disabled={loading}>
                    <i className="fas fa-times"></i> {lang === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                  </button>
                )}
              </div>
            </div>
            {showHistoryDatePicker && (
              <div className="expense-custom-date-picker">
                <div className="expense-date-picker-row"><label>{lang === 'mm' ? 'မှ' : 'From:'}</label><input type="date" className="expense-date-input" value={customFromDate} onChange={(e) => setCustomFromDate(e.target.value)} /></div>
                <div className="expense-date-picker-row"><label>{lang === 'mm' ? 'ထိ' : 'To:'}</label><input type="date" className="expense-date-input" value={customToDate} onChange={(e) => setCustomToDate(e.target.value)} /></div>
                <button className="expense-apply-date-btn" onClick={handleCustomDateApply} disabled={!customFromDate || !customToDate || loading}><i className="fas fa-check"></i> {lang === 'mm' ? 'အတည်ပြု' : 'Apply'}</button>
              </div>
            )}
          </div>

          <div className="expense-compact-logs-container" ref={historyContainerRef}>
            {loading ? (
              <div className="expense-loading-state"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p></div>
            ) : Object.keys(groupedHistory).length > 0 ? (
              Object.entries(groupedHistory).map(([date, dateLogs]) => (
                <div key={date} className="expense-date-group">
                  <div className="expense-date-header">
                    <span className="expense-date-label">{date}</span>
                    <span className="expense-date-count">{dateLogs.length} {lang === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}</span>
                  </div>
                  <div className="expense-logs-list">
                    {dateLogs.map(log => (
                      <div key={log.id} className="expense-compact-log-entry" onClick={() => setShowLogDetails(log)} style={{ cursor: 'pointer' }}>
                        <div className="expense-log-icon" style={{ color: getActionColor(log.actionType) }}><i className={`fas ${getActionIcon(log.actionType)}`}></i></div>
                        <div className="expense-log-content">
                          <div className="expense-log-main-info">
                            <span className="expense-log-action">{getActionLabel(log.actionType)}</span>
                            <span className="expense-log-product">{log.expenseName || `EXP-${String(log.expenseId).padStart(4, '0')}`}</span>
                          </div>
                          <div className="expense-log-details">
                            <span className="expense-log-user"><i className="fas fa-user"></i> <strong>{log.createdByName || 'Unknown'}</strong><span className="expense-user-role">({log.createdByRole || 'N/A'})</span></span>
                            <span className="expense-log-time"><i className="fas fa-clock"></i> {formatDateTime(log.createdAt)}</span>
                            {log.changes && log.changes.length > 0 && <span className="expense-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} {lang === 'mm' ? 'ပြောင်းလဲမှု' : 'changes'}</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <div className="expense-no-logs">
                <i className="fas fa-clipboard-list"></i>
                <p>{lang === 'mm' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် လုပ်ဆောင်ချက်များ မတွေ့ပါ။' : 'No activities found.'}</p>
                {dateFilter !== 'all' && (
                  <button className="expense-clear-search-btn secondary" onClick={() => { setDateFilter('all'); setShowHistoryDatePicker(false); setCustomFromDate(''); setCustomToDate(''); setHistoryPageInputValue("1"); }}>
                    {lang === 'mm' ? 'စစ်ထုတ်မှုများ ရှင်းလင်းရန်' : 'Clear Filters'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ===== Export Modal ===== */}
      <UserExpenseExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
        language={lang}
      />

      {/* ===== MODALS ===== */}
{showModal && (
  <UserExpenseModal
    key={editingExpense?.id || 'new-expense'}  
    onSave={handleSaveExpense}
    onClose={() => { 
      console.log('🔒 Modal onClose called');
      setShowModal(false); 
      setEditingExpense(null); 
    }}
    initialData={editingExpense}
    language={lang}
    branchId={branchId}
    onEmployeesLoaded={setEmployees}
  />
)}

      {deleteModal.show && (
        <div className="expense-delete-modal-overlay" onClick={() => setDeleteModal({ show: false, expense: null })}>
          <div className="expense-delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="expense-delete-modal-icon"><i className="fas fa-exclamation-triangle"></i></div>
            <h3>{lang === 'mm' ? 'ကုန်ကျစရိတ်ဖျက်ရန်' : 'Delete Expense'}</h3>
            <p>
              {lang === 'mm' ? 'ဤကုန်ကျစရိတ်ကို ဖျက်ရန် သေချာပါသလား' : 'Are you sure you want to delete expense'}
              <strong> "{deleteModal.expense?.title}"</strong>?<br />
              <span className="expense-delete-warning">{lang === 'mm' ? 'ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ဖျက်သိမ်း၍မရပါ။' : 'This action cannot be undone.'}</span>
            </p>
            <div className="expense-delete-modal-actions">
              <button className="expense-btn-cancel" onClick={() => setDeleteModal({ show: false, expense: null })}><i className="fas fa-times"></i> {lang === 'mm' ? 'ပယ်ဖျက်မည်' : 'Cancel'}</button>
              <button className="expense-btn-confirm-delete" onClick={handleDeleteExpense}><i className="fas fa-trash"></i> {lang === 'mm' ? 'ဖျက်မည်' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== LOG DETAIL MODAL ===== */}
      {showLogDetails && (
        <div className="expense-modal-overlay" onClick={() => setShowLogDetails(null)}>
          <div className="expense-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="expense-modal-header">
              <h3><i className={`fas ${getActionIcon(showLogDetails.actionType)}`} style={{ color: getActionColor(showLogDetails.actionType) }}></i> {lang === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}</h3>
              <button className="expense-modal-close" onClick={() => setShowLogDetails(null)}><i className="fas fa-times"></i></button>
            </div>
            <div className="expense-modal-body">
              <div className="expense-log-detail-header">
                <div className="expense-log-detail-main">
                  <div className="expense-log-detail-action">
                    <span className={`expense-action-badge expense-action-${showLogDetails.actionType?.toLowerCase()}`}>
                      <i className={`fas ${getActionIcon(showLogDetails.actionType)}`}></i>{getActionLabel(showLogDetails.actionType)}
                    </span>
                  </div>
                  {showLogDetails.expenseName && (
                    <div className="expense-log-detail-product"><i className="fas fa-tag"></i><span className="expense-product-name">{showLogDetails.expenseName}</span></div>
                  )}
                </div>
                <div className="expense-log-detail-meta">
                  <div className="expense-log-detail-user"><i className="fas fa-user"></i><div><div className="expense-user-name-detail"><strong>{showLogDetails.createdByName || 'Unknown'}</strong></div><div className="expense-user-role-detail">{showLogDetails.createdByRole || 'N/A'}</div></div></div>
                  <div className="expense-log-detail-time"><i className="fas fa-calendar"></i><div><div className="expense-log-date-detail">{formatDate(showLogDetails.createdAt)}</div><div className="expense-log-time-detail">{new Date(showLogDetails.createdAt).toLocaleTimeString()}</div></div></div>
                </div>
              </div>
              {showLogDetails.changes && showLogDetails.changes.length > 0 && (
                <div className="expense-log-detail-content">
                  <h4>{lang === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                  <div className="expense-change-list">
                    {showLogDetails.changes.map((detail, index) => (
                      <div key={index} className="expense-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="expense-modal-footer">
              <button className="expense-btn-cancel" onClick={() => setShowLogDetails(null)}>{lang === 'mm' ? 'ပိတ်မည်' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== VIEW EXPENSE DETAIL MODAL ===== */}
      {showViewModal && viewExpense && (
        <div className="expense-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="expense-modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '650px' }}>
            <div className="expense-modal-header">
              <h3><i className="fas fa-eye" style={{ color: '#10b981' }}></i> {lang === 'mm' ? 'ကုန်ကျစရိတ်အသေးစိတ်' : 'Expense Details'}</h3>
              <button className="expense-modal-close" onClick={() => setShowViewModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="expense-modal-body">
              <div className="expense-view-header" style={{ padding: '16px 18px', background: '#f8fafc', borderRadius: '8px', marginBottom: '16px', borderLeft: '4px solid #10b981' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '18px', color: '#1e293b' }}>{viewExpense.title}</h3>
                  <span className={`expense-status-badge ${viewExpense.status === 'Paid' ? 'status-paid' : viewExpense.status === 'Pending' ? 'status-pending' : 'status-cancelled'}`}>{viewExpense.status}</span>
                </div>
                <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px' }}>#{viewExpense.id}</div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'mm' ? 'ပမာဏ' : 'Amount'}</div>
                  <div style={{ fontSize: '18px', fontWeight: 700, color: '#10b981' }}>{formatCurrency(viewExpense.amount)}</div>
                </div>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'mm' ? 'ရက်စွဲ' : 'Date'}</div>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{formatDate(viewExpense.expenseDate)}</div>
                </div>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'mm' ? 'အမျိုးအစား' : 'Category'}</div>
                  <span className={`expense-category-badge ${getCategoryBadgeClass(viewExpense.category)}`}>{lang === 'mm' ? categoryOptions.find(c => c.value === viewExpense.category)?.label_mm || viewExpense.category : viewExpense.category}</span>
                </div>
                <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'mm' ? 'ငွေပေးချေမှု' : 'Payment'}</div>
                  <span className={`expense-payment-badge ${getPaymentMethodBadge(viewExpense.paymentMethod)}`}>{viewExpense.paymentMethod}</span>
                </div>
                {viewExpense.subCategory && viewExpense.category !== 'Salary' && (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'mm' ? 'အမျိုးအစားခွဲ' : 'Sub Category'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{viewExpense.subCategory}</div>
                  </div>
                )}
                {viewExpense.vendor && (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'mm' ? 'ပေးသွင်းသူ' : 'Vendor'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{viewExpense.vendor}</div>
                  </div>
                )}
                {viewExpense.depreciationType && (
                  <div style={{ padding: '10px 14px', background: '#f8fafc', borderRadius: '6px' }}>
                    <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600 }}>{lang === 'mm' ? 'တန်ဖိုးလျော့' : 'Depreciation'}</div>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>{getDepreciationLabel(viewExpense.depreciationType)}{viewExpense.depreciationRate && ` (${viewExpense.depreciationRate}%)`}</div>
                  </div>
                )}
              </div>
              {viewExpense.description && (
                <div style={{ padding: '12px 16px', background: '#f8fafc', borderRadius: '6px', marginBottom: '12px' }}>
                  <div style={{ fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 600, marginBottom: '4px' }}>{lang === 'mm' ? 'အသေးစိတ်' : 'Description'}</div>
                  <div style={{ fontSize: '14px', color: '#1e293b' }}>{viewExpense.description}</div>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#94a3b8', paddingTop: '12px', borderTop: '1px solid #e9ecef', flexWrap: 'wrap', gap: '8px' }}>
                <div><i className="fas fa-user" style={{ marginRight: '4px' }}></i>{viewExpense.createdByName || 'Unknown'}<span style={{ color: '#cbd5e1' }}> • </span>{viewExpense.createdByRole || 'N/A'}</div>
                <div><i className="fas fa-clock" style={{ marginRight: '4px' }}></i>{formatDateTime(viewExpense.createdAt)}</div>
              </div>
            </div>
            <div className="expense-modal-footer">
              <button className="expense-btn-cancel" onClick={() => setShowViewModal(false)}>{lang === 'mm' ? 'ပိတ်မည်' : 'Close'}</button>
              <button className="expense-btn-submit" onClick={() => { setShowViewModal(false); setEditingExpense(viewExpense); setShowModal(true); }}>
                <i className="fas fa-edit"></i> {lang === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserExpensePage;