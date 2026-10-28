// UserCreditPage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import CreditModal from './CreditModal';
import PaymentModal from './PaymentModal';
import PaymentHistoryModal from './PaymentHistoryModal';
import CreditExportModal from './CreditExportModal';
import "../../light-style/user-css/UserCreditPage.css";
import { useSelector } from 'react-redux';

// ============================================================
// ✅ DEMO SEED DATA — JSON + localStorage
// ============================================================
const CREDITS_KEY = "demo_credits";
const PAYMENTS_KEY = "demo_credit_payments";
const LOGS_KEY = "demo_credit_logs";
const INVOICES_KEY = "demo_credit_invoices";
const SEED_VERSION_KEY = "demo_credit_seed_version";
const SEED_VERSION = "1.0.0";

// ✅ Demo Invoices (for CreditModal invoice search)
const SEED_INVOICES = [
  { id: 1, invoiceNo: "INV-2024-001", customerName: "မောင်မောင်", customerPhone: "09-771234567", customerEmail: "maung@example.com", customerAddress: "ရန်ကုန်", totalAmount: 61500, saleDate: "2024-01-15" },
  { id: 2, invoiceNo: "INV-2024-002", customerName: "ဒေါ်မြင့်", customerPhone: "09-791234567", customerEmail: "myint@example.com", customerAddress: "မန္တလေး", totalAmount: 34000, saleDate: "2024-01-17" },
  { id: 3, invoiceNo: "INV-2024-003", customerName: "ကိုဇော်", customerPhone: "09-781234567", customerEmail: "zaw@example.com", customerAddress: "နေပြည်တော်", totalAmount: 45500, saleDate: "2024-01-19" },
  { id: 4, invoiceNo: "INV-2024-004", customerName: "မယ်သီ", customerPhone: "09-751234567", customerEmail: "thee@example.com", customerAddress: "ပဲခူး", totalAmount: 82000, saleDate: "2024-01-20" },
  { id: 5, invoiceNo: "INV-2024-005", customerName: "ဦးကျော်", customerPhone: "09-761234567", customerEmail: "kyaw@example.com", customerAddress: "မော်လမြိုင်", totalAmount: 27500, saleDate: "2024-01-21" }
];

const SEED_CREDITS = [
  {
    id: 1, invoiceNo: "INV-2024-001", invoiceId: 1,
    customerName: "မောင်မောင်", phone: "09-771234567", email: "maung@example.com", address: "ရန်ကုန်",
    totalAmount: 61500, paidAmount: 61500, remainingAmount: 0,
    dueDate: "2024-02-15", status: "paid", notes: "အပြည့်ပေးချေပြီး",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    paymentCount: 2, branchId: 1
  },
  {
    id: 2, invoiceNo: "INV-2024-002", invoiceId: 2,
    customerName: "ဒေါ်မြင့်", phone: "09-791234567", email: "myint@example.com", address: "မန္တလေး",
    totalAmount: 34000, paidAmount: 15000, remainingAmount: 19000,
    dueDate: "2024-02-20", status: "partially_paid", notes: "တစ်စိတ်တစ်ပိုင်းပေးချေပြီး",
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    paymentCount: 1, branchId: 1
  },
  {
    id: 3, invoiceNo: "INV-2024-003", invoiceId: 3,
    customerName: "ကိုဇော်", phone: "09-781234567", email: "zaw@example.com", address: "နေပြည်တော်",
    totalAmount: 45500, paidAmount: 0, remainingAmount: 45500,
    dueDate: "2024-02-25", status: "pending", notes: "အကြွေး",
    createdByName: "Cashier2", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    lastPaymentDate: null,
    paymentCount: 0, branchId: 1
  },
  {
    id: 4, invoiceNo: "INV-2024-004", invoiceId: 4,
    customerName: "မယ်သီ", phone: "09-751234567", email: "thee@example.com", address: "ပဲခူး",
    totalAmount: 82000, paidAmount: 50000, remainingAmount: 32000,
    dueDate: "2024-01-10", status: "overdue", notes: "နောက်ကျနေသည်",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 15 * 86400000).toISOString(),
    paymentCount: 1, branchId: 1
  },
  {
    id: 5, invoiceNo: "INV-2024-005", invoiceId: 5,
    customerName: "ဦးကျော်", phone: "09-761234567", email: "kyaw@example.com", address: "မော်လမြိုင်",
    totalAmount: 27500, paidAmount: 27500, remainingAmount: 0,
    dueDate: "2024-02-28", status: "paid", notes: "",
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    lastPaymentDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    paymentCount: 1, branchId: 1
  }
];

const SEED_PAYMENTS = [
  { id: 1, creditId: 1, paymentAmount: 30000, paymentMethod: "cash", paymentDate: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0], referenceNo: "PAY001", notes: "ပထမအကြိမ်", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 8 * 86400000).toISOString() },
  { id: 2, creditId: 1, paymentAmount: 31500, paymentMethod: "kpay", paymentDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0], referenceNo: "PAY002", notes: "ဒုတိယအကြိမ်", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 5 * 86400000).toISOString() },
  { id: 3, creditId: 2, paymentAmount: 15000, paymentMethod: "cash", paymentDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0], referenceNo: "PAY003", notes: "", createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 3 * 86400000).toISOString() },
  { id: 4, creditId: 4, paymentAmount: 50000, paymentMethod: "bank_transfer", paymentDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0], referenceNo: "PAY004", notes: "ဘဏ်လွှဲ", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 15 * 86400000).toISOString() },
  { id: 5, creditId: 5, paymentAmount: 27500, paymentMethod: "wave_pay", paymentDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0], referenceNo: "PAY005", notes: "", createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 1 * 86400000).toISOString() }
];

const SEED_LOGS = [
  { id: 1, actionType: "ADD", creditId: 1, invoiceNo: "INV-2024-001", customerName: "မောင်မောင်", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), branchId: 1, changes: ["Credit created: 61,500 Ks"] },
  { id: 2, actionType: "PAYMENT_ADD", creditId: 1, invoiceNo: "INV-2024-001", customerName: "မောင်မောင်", paymentAmount: 30000, paymentMethod: "cash", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), branchId: 1, changes: ["Payment: 30,000 Ks"] },
  { id: 3, actionType: "PAYMENT_ADD", creditId: 1, invoiceNo: "INV-2024-001", customerName: "မောင်မောင်", paymentAmount: 31500, paymentMethod: "kpay", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), branchId: 1, changes: ["Payment: 31,500 Ks", "Status: PAID"] },
  { id: 4, actionType: "ADD", creditId: 2, invoiceNo: "INV-2024-002", customerName: "ဒေါ်မြင့်", createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), branchId: 1, changes: ["Credit created: 34,000 Ks"] },
  { id: 5, actionType: "PAYMENT_ADD", creditId: 2, invoiceNo: "INV-2024-002", customerName: "ဒေါ်မြင့်", paymentAmount: 15000, paymentMethod: "cash", createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), branchId: 1, changes: ["Payment: 15,000 Ks"] },
  { id: 6, actionType: "ADD", creditId: 3, invoiceNo: "INV-2024-003", customerName: "ကိုဇော်", createdByName: "Cashier2", createdByRole: "Cashier", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), branchId: 1, changes: ["Credit created: 45,500 Ks"] },
  { id: 7, actionType: "ADD", creditId: 4, invoiceNo: "INV-2024-004", customerName: "မယ်သီ", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), branchId: 1, changes: ["Credit created: 82,000 Ks"] },
  { id: 8, actionType: "PAYMENT_ADD", creditId: 4, invoiceNo: "INV-2024-004", customerName: "မယ်သီ", paymentAmount: 50000, paymentMethod: "bank_transfer", createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), branchId: 1, changes: ["Payment: 50,000 Ks"] },
  { id: 9, actionType: "ADD", creditId: 5, invoiceNo: "INV-2024-005", customerName: "ဦးကျော်", createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), branchId: 1, changes: ["Credit created: 27,500 Ks"] },
  { id: 10, actionType: "PAYMENT_ADD", creditId: 5, invoiceNo: "INV-2024-005", customerName: "ဦးကျော်", paymentAmount: 27500, paymentMethod: "wave_pay", createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1, changes: ["Payment: 27,500 Ks", "Status: PAID"] }
];

// ============================================================
// ✅ localStorage helpers
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

const ensureCreditSeed = () => {
  const v = localStorage.getItem(SEED_VERSION_KEY);
  if (v !== SEED_VERSION) {
    saveData(CREDITS_KEY, SEED_CREDITS);
    saveData(PAYMENTS_KEY, SEED_PAYMENTS);
    saveData(LOGS_KEY, SEED_LOGS);
    saveData(INVOICES_KEY, SEED_INVOICES);
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    console.log('🌱 Credit seed loaded');
  } else {
    if (getData(CREDITS_KEY, []).length === 0) saveData(CREDITS_KEY, SEED_CREDITS);
    if (getData(PAYMENTS_KEY, []).length === 0) saveData(PAYMENTS_KEY, SEED_PAYMENTS);
    if (getData(LOGS_KEY, []).length === 0) saveData(LOGS_KEY, SEED_LOGS);
    if (getData(INVOICES_KEY, []).length === 0) saveData(INVOICES_KEY, SEED_INVOICES);
  }
};

const generateCreditId = () => {
  const credits = getData(CREDITS_KEY, []);
  return credits.reduce((m, c) => Math.max(m, c.id || 0), 0) + 1;
};

const generatePaymentId = () => {
  const payments = getData(PAYMENTS_KEY, []);
  return payments.reduce((m, p) => Math.max(m, p.id || 0), 0) + 1;
};

const generateLogId = () => {
  const logs = getData(LOGS_KEY, []);
  return logs.reduce((m, l) => Math.max(m, l.id || 0), 0) + 1;
};

const addCreditLog = (logData) => {
  const logs = getData(LOGS_KEY, []);
  const newLog = {
    id: generateLogId(),
    actionType: logData.actionType || 'ADD',
    creditId: logData.creditId || 0,
    invoiceNo: logData.invoiceNo || '',
    customerName: logData.customerName || '',
    paymentAmount: logData.paymentAmount || 0,
    paymentMethod: logData.paymentMethod || '',
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

// ✅ Compute credit status from amounts
const computeStatus = (credit) => {
  const today = new Date().toISOString().split('T')[0];
  const remaining = (credit.totalAmount || 0) - (credit.paidAmount || 0);
  if (remaining <= 0) return 'paid';
  if (credit.dueDate && credit.dueDate < today) return 'overdue';
  if ((credit.paidAmount || 0) > 0) return 'partially_paid';
  return 'pending';
};

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// ============================================================
// Hook for language
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

// ============================================================================
// Helper functions
// ============================================================================
const getActionIcon = (type) => {
  switch (type) {
    case 'ADD': return 'fa-plus-circle';
    case 'EDIT': return 'fa-edit';
    case 'DELETE': return 'fa-trash';
    case 'PAYMENT_ADD': return 'fa-money-bill-wave';
    case 'PAYMENT_EDIT': return 'fa-edit';
    default: return 'fa-history';
  }
};

const getActionColor = (type) => {
  switch (type) {
    case 'ADD': return '#10b981';
    case 'EDIT': return '#f59e0b';
    case 'DELETE': return '#ef4444';
    case 'PAYMENT_ADD': return '#2ecc71';
    case 'PAYMENT_EDIT': return '#f59e0b';
    default: return '#6b7280';
  }
};

const getStatusLabel = (status, lang) => {
  switch(status) {
    case 'paid': return lang === 'mm' ? 'ပေးချေပြီး' : 'Paid';
    case 'pending': return lang === 'mm' ? 'ဆိုင်ငံ့' : 'Pending';
    case 'partially_paid': return lang === 'mm' ? 'တစ်စိတ်တစ်ပိုင်း' : 'Partially Paid';
    case 'overdue': return lang === 'mm' ? 'နောက်ကျ' : 'Overdue';
    default: return status;
  }
};

const getStatusBadgeClass = (status) => {
  switch(status) {
    case 'paid': return 'credit-status-paid';
    case 'pending': return 'credit-status-pending';
    case 'partially_paid': return 'credit-status-partial';
    case 'overdue': return 'credit-status-overdue';
    default: return 'credit-status-pending';
  }
};

const getPaymentMethodText = (method, lang) => {
  if (lang === 'mm') {
    switch(method) {
      case 'cash': return 'ငွေသား';
      case 'bank_transfer': return 'ဘဏ်လွှဲ';
      case 'kpay': return 'KPay';
      case 'wave_pay': return 'Wave Pay';
      case 'cb_pay': return 'CB Pay';
      default: return method;
    }
  } else {
    switch(method) {
      case 'cash': return 'Cash';
      case 'bank_transfer': return 'Bank Transfer';
      case 'kpay': return 'KPay';
      case 'wave_pay': return 'Wave Pay';
      case 'cb_pay': return 'CB Pay';
      default: return method;
    }
  }
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 Ks';
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount) + ' Ks';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const groupLogsByDate = (logs, lang) => {
  const grouped = {};
  logs.forEach(log => {
    const date = new Date(log.createdAt);
    const dateKey = date.toLocaleDateString(lang === 'mm' ? 'my' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(log);
  });
  return grouped;
};

// ============================================================
// Main Component
// ============================================================
const UserCreditPage = () => {
  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const lang = useLanguage();

  // ✅ currentUser with Demo fallback
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

  // ===== SEED =====
  useEffect(() => { ensureCreditSeed(); }, []);

  // ===== STATE =====
  const [credits, setCredits] = useState([]);
  const [creditsMap, setCreditsMap] = useState(new Map());
  const [filteredCredits, setFilteredCredits] = useState([]);
  const [payments, setPayments] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(null);

  const [activeTab, setActiveTab] = useState('all-credits');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchField, setSearchField] = useState('all');

  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1, hasMore: false, hasPrevious: false });
  const [logPagination, setLogPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1, hasMore: false, hasPrevious: false });

  const [logFilter, setLogFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ filter: 'all', customFrom: '', customTo: '' });

  const [statusCounts, setStatusCounts] = useState({ all: 0, pending: 0, partially_paid: 0, paid: 0, overdue: 0 });
  const [actionTypeCounts, setActionTypeCounts] = useState({ all: 0, ADD: 0, EDIT: 0, DELETE: 0, PAYMENT_ADD: 0, PAYMENT_EDIT: 0 });
  const [summary, setSummary] = useState({ totalCredit: 0, totalPaid: 0, totalRemaining: 0 });

  // UI state
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [showAddPaymentModal, setShowAddPaymentModal] = useState(false);
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [showPaymentHistoryModal, setShowPaymentHistoryModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedCreditForPayment, setSelectedCreditForPayment] = useState(null);
  const [selectedCreditForHistory, setSelectedCreditForHistory] = useState(null);
  const [selectedPaymentForEdit, setSelectedPaymentForEdit] = useState(null);

  const [pageInputValue, setPageInputValue] = useState('1');
  const [historyPageInputValue, setHistoryPageInputValue] = useState('1');
  const [loadingDirection, setLoadingDirection] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchInputValue, setSearchInputValue] = useState('');

  const [creditForm, setCreditForm] = useState({
    id: null, invoiceNo: '', invoiceId: '', customerName: '', phone: '', email: '', address: '',
    totalAmount: '', paidAmount: '0', dueDate: '', notes: '', status: 'pending'
  });

  const [paymentForm, setPaymentForm] = useState({
    id: null, creditId: null, paymentAmount: '', paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0], referenceNo: '', notes: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  const searchInputRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const pageChangeTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);

  // ============================================================
  // ✅ LOAD DATA
  // ============================================================
  const loadCredits = useCallback((page = 1, size = 10, tab = 'all-credits', search = '', field = 'all') => {
    const branchId = currentUser.branch_id || 1;
    let allCredits = getData(CREDITS_KEY, []);
    allCredits = allCredits.filter(c => !c.branchId || c.branchId === branchId);

    // Recompute status
    allCredits = allCredits.map(c => ({ ...c, status: computeStatus(c) }));

    // Status counts
    setStatusCounts({
      all: allCredits.length,
      pending: allCredits.filter(c => c.status === 'pending').length,
      partially_paid: allCredits.filter(c => c.status === 'partially_paid').length,
      paid: allCredits.filter(c => c.status === 'paid').length,
      overdue: allCredits.filter(c => c.status === 'overdue').length,
    });

    // Summary
    setSummary({
      totalCredit: allCredits.reduce((s, c) => s + (c.totalAmount || 0), 0),
      totalPaid: allCredits.reduce((s, c) => s + (c.paidAmount || 0), 0),
      totalRemaining: allCredits.reduce((s, c) => s + ((c.totalAmount || 0) - (c.paidAmount || 0)), 0),
    });

    // Filter by tab
    let filtered = [...allCredits];
    if (tab !== 'all-credits' && tab !== 'history') {
      filtered = filtered.filter(c => c.status === tab);
    }

    // Search
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(c => {
        switch(field) {
          case 'customerName': return c.customerName?.toLowerCase().includes(q);
          case 'phone': return c.phone?.includes(q);
          case 'invoiceNo': return c.invoiceNo?.toLowerCase().includes(q);
          default:
            return c.customerName?.toLowerCase().includes(q) ||
                   c.phone?.includes(q) ||
                   c.invoiceNo?.toLowerCase().includes(q) ||
                   c.email?.toLowerCase().includes(q);
        }
      });
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const totalItems = filtered.length;
    const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
    const safePage = Math.min(Math.max(1, page), totalPagesCalc);
    const start = (safePage - 1) * size;
    const paged = filtered.slice(start, start + size);

    const map = new Map();
    paged.forEach(c => map.set(c.id, c));

    setCredits(paged);
    setFilteredCredits(paged);
    setCreditsMap(map);
    setPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc, hasMore: safePage < totalPagesCalc, hasPrevious: safePage > 1 });
    setPageInputValue(safePage.toString());
  }, [currentUser.branch_id]);

  const loadLogs = useCallback((page = 1, size = 10, actionFilter = 'all', dFilter = { filter: 'all' }) => {
    const branchId = currentUser.branch_id || 1;
    let allLogs = getData(LOGS_KEY, []);
    allLogs = allLogs.filter(l => !l.branchId || l.branchId === branchId);

    // Counts
    setActionTypeCounts({
      all: allLogs.length,
      ADD: allLogs.filter(l => l.actionType === 'ADD').length,
      EDIT: allLogs.filter(l => l.actionType === 'EDIT').length,
      DELETE: allLogs.filter(l => l.actionType === 'DELETE').length,
      PAYMENT_ADD: allLogs.filter(l => l.actionType === 'PAYMENT_ADD').length,
      PAYMENT_EDIT: allLogs.filter(l => l.actionType === 'PAYMENT_EDIT').length,
    });

    if (actionFilter !== 'all') allLogs = allLogs.filter(l => l.actionType === actionFilter);

    // Date filter
    if (dFilter.filter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

      allLogs = allLogs.filter(log => {
        if (!log.createdAt) return true;
        const logDate = new Date(log.createdAt);
        switch (dFilter.filter) {
          case 'today': return logDate >= today;
          case 'yesterday': return logDate >= yesterday && logDate < today;
          case 'thisWeek': return logDate >= weekAgo;
          case 'thisMonth': return logDate >= monthAgo;
          case 'custom':
            if (dFilter.customFrom && dFilter.customTo) {
              const from = new Date(dFilter.customFrom);
              const to = new Date(dFilter.customTo);
              to.setHours(23, 59, 59, 999);
              return logDate >= from && logDate <= to;
            }
            return true;
          default: return true;
        }
      });
    }

    allLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const processed = allLogs.map(log => ({
      ...log,
      createdByName: log.createdByName || 'Unknown User',
      createdByRole: log.createdByRole || 'N/A',
      timestamp: log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : '',
      date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : ''
    }));

    const totalItems = processed.length;
    const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
    const safePage = Math.min(Math.max(1, page), totalPagesCalc);
    const start = (safePage - 1) * size;
    const paged = processed.slice(start, start + size);

    setLogs(paged);
    setFilteredLogs(paged);
    setLogPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc, hasMore: safePage < totalPagesCalc, hasPrevious: safePage > 1 });
    setHistoryPageInputValue(safePage.toString());
  }, [currentUser.branch_id]);

  // ============================================================
  // ✅ INITIAL LOAD
  // ============================================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadCredits(1, 10, 'all-credits', '', 'all');
      loadLogs(1, 10, 'all', { filter: 'all' });
    }
  }, [loadCredits, loadLogs]);

  // Tab/search change
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (activeTab === 'history') return;
    const t = setTimeout(() => {
      loadCredits(1, pagination.size, activeTab, searchQuery, searchField);
    }, 300);
    return () => clearTimeout(t);
  }, [activeTab, searchQuery, searchField, pagination.size, loadCredits]);

  // Logs filter change
  useEffect(() => {
    if (!initialLoadDone.current) return;
    loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
  }, [logFilter, dateFilter, logPagination.size, logPagination.page, loadLogs]);

  // ============================================================
  // ✅ PAGINATION
  // ============================================================
  const changePage = (newPage, direction) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
    loadCredits(newPage, pagination.size, activeTab, searchQuery, searchField);
    pageChangeTimeoutRef.current = setTimeout(() => setLoadingDirection(null), 300);
  };

  const changeHistoryPage = (newPage, direction) => {
    if (newPage === logPagination.page || newPage < 1 || newPage > logPagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    if (historyContainerRef.current) historyContainerRef.current.scrollTop = 0;
    loadLogs(newPage, logPagination.size, logFilter, dateFilter);
    pageChangeTimeoutRef.current = setTimeout(() => setLoadingDirection(null), 300);
  };

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setPagination(p => ({ ...p, size: newSize, page: 1 }));
    setPageInputValue('1');
    loadCredits(1, newSize, activeTab, searchQuery, searchField);
  };

  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setLogPagination(p => ({ ...p, size: newSize, page: 1 }));
    setHistoryPageInputValue('1');
    loadLogs(1, newSize, logFilter, dateFilter);
  };

  // ===== Date filter =====
  const handleDateFilterChange = (filter) => {
    if (filter === 'custom') {
      setShowDatePicker(true);
    } else {
      setDateFilter({ filter, customFrom: '', customTo: '' });
      setHistoryPageInputValue('1');
      setShowDatePicker(false);
    }
  };

  const handleCustomDateChange = (type, value) => {
    setDateFilter(prev => ({ ...prev, [type]: value }));
  };

  const clearDateFilter = () => {
    setDateFilter({ filter: 'all', customFrom: '', customTo: '' });
    setShowDatePicker(false);
    setHistoryPageInputValue('1');
  };

  // ===== Search =====
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setSearchQuery(searchInputValue);
      setPagination(p => ({ ...p, page: 1 }));
      setPageInputValue('1');
      loadCredits(1, pagination.size, activeTab, searchInputValue, searchField);
    }
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchQuery('');
    setPagination(p => ({ ...p, page: 1 }));
    setPageInputValue('1');
    loadCredits(1, pagination.size, activeTab, '', searchField);
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  // ===== Tab =====
  const handleTabChange = (e) => {
    const value = e.target.value;
    if (value === 'export') { setShowExportModal(true); e.target.value = activeTab; return; }
    setActiveTab(value);
  };

  const handleSearchFieldChange = (e) => setSearchField(e.target.value);

  const retryConnection = () => {
    setNetworkError(null);
    if (activeTab === 'history') loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
    else loadCredits(pagination.page, pagination.size, activeTab, searchQuery, searchField);
  };

  // ===== Invoices =====
  const fetchRecentInvoices = useCallback(() => {
    const branchId = currentUser.branch_id || 1;
    const invoices = getData(INVOICES_KEY, []);
    setRecentInvoices(invoices.filter(i => !i.branchId || i.branchId === branchId).slice(0, 5));
  }, [currentUser.branch_id]);

  const handleSearchInvoice = useCallback((query) => {
    if (!query.trim()) return;
    setSearchLoading(true);
    setTimeout(() => {
      const invoices = getData(INVOICES_KEY, []);
      const q = query.toLowerCase().trim();
      const results = invoices.filter(i =>
        i.invoiceNo?.toLowerCase().includes(q) ||
        i.customerName?.toLowerCase().includes(q)
      );
      setSearchResults(results);
      setSearchLoading(false);
    }, 250);
  }, []);

  const handleSelectInvoice = useCallback((invoice) => {
    setCreditForm(prev => ({
      ...prev,
      invoiceNo: invoice.invoiceNo,
      invoiceId: invoice.id,
      customerName: invoice.customerName || '',
      phone: invoice.customerPhone || '',
      email: invoice.customerEmail || '',
      address: invoice.customerAddress || '',
      totalAmount: invoice.totalAmount || '',
      paidAmount: '0',
    }));
    setSearchResults([]);
  }, []);

  // ============================================================
  // ✅ EXPORT (CSV)
  // ============================================================
  const handleExport = async (exportType) => {
    const branchId = currentUser.branch_id || 1;
    setExportLoading(true);
    try {
      await delay(300);
      let rows = [];
      let filename = `credits_data_${new Date().toISOString().slice(0, 10)}.csv`;

      if (exportType === 'credits' || exportType === 'both') {
        const allCredits = getData(CREDITS_KEY, []).filter(c => !c.branchId || c.branchId === branchId);
        rows.push('=== CREDITS ===');
        rows.push(['Invoice No', 'Customer', 'Phone', 'Total', 'Paid', 'Remaining', 'Due Date', 'Status'].join(','));
        allCredits.forEach(c => {
          rows.push([c.invoiceNo, `"${c.customerName}"`, c.phone, c.totalAmount, c.paidAmount, c.totalAmount - c.paidAmount, c.dueDate, c.status].join(','));
        });
        rows.push('');
      }

      if (exportType === 'logs' || exportType === 'both') {
        const allLogs = getData(LOGS_KEY, []).filter(l => !l.branchId || l.branchId === branchId);
        if (exportType === 'both') rows.push('=== LOGS ===');
        rows.push(['Action', 'Invoice', 'Customer', 'User', 'Date', 'Details'].join(','));
        allLogs.forEach(l => {
          rows.push([l.actionType, l.invoiceNo, `"${l.customerName}"`, `"${l.createdByName}"`, formatDate(l.createdAt), `"${(l.changes || []).join('; ')}"`].join(','));
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
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  // ============================================================
  // ✅ FORM VALIDATION
  // ============================================================
  const validateCreditForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    if (!creditForm.customerName.trim()) { errors.customerName = lang === 'mm' ? 'ဝယ်ယူသူအမည် လိုအပ်ပါသည်' : 'Customer name is required'; isValid = false; }
    if (!creditForm.totalAmount || parseFloat(creditForm.totalAmount) <= 0) { errors.totalAmount = lang === 'mm' ? 'စုစုပေါင်းပမာဏ လိုအပ်ပါသည်' : 'Total amount is required'; isValid = false; }
    setFormErrors(errors);
    return isValid;
  }, [creditForm, lang]);

  const validatePaymentForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    const amount = parseFloat(paymentForm.paymentAmount);
    const remaining = selectedCreditForPayment?.remainingAmount || 0;
    if (!paymentForm.paymentAmount || isNaN(amount)) { errors.paymentAmount = lang === 'mm' ? 'ငွေပေးချေပမာဏ လိုအပ်ပါသည်' : 'Payment amount is required'; isValid = false; }
    else if (amount < 0) { errors.paymentAmount = lang === 'mm' ? 'အနှုတ်ဂဏန်း မဖြစ်နိုင်ပါ' : 'Cannot be negative'; isValid = false; }
    else if (amount === 0) { errors.paymentAmount = lang === 'mm' ? '0 မဖြစ်နိုင်ပါ' : 'Cannot be zero'; isValid = false; }
    else if (amount > remaining) { errors.paymentAmount = lang === 'mm' ? `ကျန်ငွေ (${formatCurrency(remaining)}) ထက် မပိုနိုင်ပါ` : `Cannot exceed remaining (${formatCurrency(remaining)})`; isValid = false; }
    setFormErrors(errors);
    return isValid;
  }, [paymentForm, selectedCreditForPayment, lang]);

  const isCreditFormValid = useMemo(() => creditForm.customerName.trim() !== '' && creditForm.totalAmount && parseFloat(creditForm.totalAmount) > 0, [creditForm]);

  const isPaymentFormValid = useMemo(() => {
    const amount = parseFloat(paymentForm.paymentAmount);
    const remaining = selectedCreditForPayment?.remainingAmount || 0;
    return !isNaN(amount) && amount > 0 && amount <= remaining;
  }, [paymentForm.paymentAmount, selectedCreditForPayment]);

  // ============================================================
  // ✅ CREDIT CRUD
  // ============================================================
  const openAddModal = () => {
    setCreditForm({
      id: null, invoiceNo: `INV${Date.now()}`, invoiceId: '',
      customerName: '', phone: '', email: '', address: '',
      totalAmount: '', paidAmount: '0',
      dueDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      notes: '', status: 'pending'
    });
    setFormErrors({});
    setModalType('add');
    fetchRecentInvoices();
    setShowCreditModal(true);
  };

  const handleCreditFormChange = (e) => {
    const { name, value } = e.target;
    setCreditForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSaveCredit = async () => {
    if (!validateCreditForm()) {
      setValidationError(lang === 'mm' ? 'ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ' : 'Please fix the errors');
      return;
    }
    try {
      setLoading(true);
      await delay(300);
      const credits = getData(CREDITS_KEY, []);
      const branchId = currentUser.branch_id || 1;
      const now = new Date().toISOString();
      const total = parseFloat(creditForm.totalAmount) || 0;
      const paid = parseFloat(creditForm.paidAmount) || 0;

      if (modalType === 'add') {
        const newId = generateCreditId();
        const newCredit = {
          id: newId,
          invoiceNo: creditForm.invoiceNo,
          invoiceId: creditForm.invoiceId,
          customerName: creditForm.customerName,
          phone: creditForm.phone,
          email: creditForm.email,
          address: creditForm.address,
          totalAmount: total,
          paidAmount: paid,
          remainingAmount: total - paid,
          dueDate: creditForm.dueDate,
          status: computeStatus({ totalAmount: total, paidAmount: paid, dueDate: creditForm.dueDate }),
          notes: creditForm.notes,
          createdByName: currentUser.name,
          createdByRole: currentUser.role,
          createdAt: now,
          lastPaymentDate: null,
          paymentCount: 0,
          branchId
        };
        credits.unshift(newCredit);
        saveData(CREDITS_KEY, credits);
        addCreditLog({ actionType: 'ADD', creditId: newId, invoiceNo: newCredit.invoiceNo, customerName: newCredit.customerName, createdByName: currentUser.name, createdByRole: currentUser.role, branchId, changes: [`Credit created: ${formatCurrency(total)}`] });
      } else {
        const idx = credits.findIndex(c => c.id === creditForm.id);
        if (idx !== -1) {
          const old = credits[idx];
          credits[idx] = {
            ...old,
            customerName: creditForm.customerName,
            phone: creditForm.phone,
            email: creditForm.email,
            address: creditForm.address,
            totalAmount: total,
            paidAmount: paid,
            remainingAmount: total - paid,
            dueDate: creditForm.dueDate,
            status: computeStatus({ totalAmount: total, paidAmount: paid, dueDate: creditForm.dueDate }),
            notes: creditForm.notes,
            updatedAt: now
          };
          saveData(CREDITS_KEY, credits);
          addCreditLog({ actionType: 'EDIT', creditId: creditForm.id, invoiceNo: old.invoiceNo, customerName: old.customerName, createdByName: currentUser.name, createdByRole: currentUser.role, branchId, changes: [`Credit updated`] });
        }
      }

      setSuccess(true);
      setShowCreditModal(false);
      loadCredits(1, pagination.size, activeTab, searchQuery, searchField);
      loadLogs(1, logPagination.size, logFilter, dateFilter);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ ACTION HANDLERS
  // ============================================================
  const handleCreditAction = async (action, creditId) => {
    const credit = creditsMap.get(creditId);
    if (!credit) return;

    if (action === 'edit') {
      setCreditForm({
        id: credit.id, invoiceNo: credit.invoiceNo || '', invoiceId: credit.invoiceId || '',
        customerName: credit.customerName || '', phone: credit.phone || '',
        email: credit.email || '', address: credit.address || '',
        totalAmount: credit.totalAmount || '', paidAmount: credit.paidAmount || '0',
        dueDate: credit.dueDate || '', notes: credit.notes || '', status: credit.status || 'pending'
      });
      setFormErrors({});
      setModalType('edit');
      setShowCreditModal(true);
    } else if (action === 'delete') {
      if (window.confirm(lang === 'mm' ? `"${credit.customerName}" အတွက် အကြွေးမှတ်တမ်းကို ဖျက်ရန် သေချာပါသလား?` : `Delete credit for "${credit.customerName}"?`)) {
        try {
          setLoading(true);
          await delay(200);
          const credits = getData(CREDITS_KEY, []).filter(c => c.id !== creditId);
          saveData(CREDITS_KEY, credits);
          addCreditLog({ actionType: 'DELETE', creditId, invoiceNo: credit.invoiceNo, customerName: credit.customerName, createdByName: currentUser.name, createdByRole: currentUser.role, branchId: credit.branchId, changes: [`Credit deleted`] });
          setSuccess(true);
          loadCredits(1, pagination.size, activeTab, searchQuery, searchField);
          loadLogs(1, logPagination.size, logFilter, dateFilter);
          setTimeout(() => setSuccess(false), 3000);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
      }
    } else if (action === 'view_payments') {
      setSelectedCreditForHistory(credit);
      fetchPayments(creditId);
      setShowPaymentHistoryModal(true);
    } else if (action === 'add_payment') {
      setSelectedCreditForPayment(credit);
      setPaymentForm({
        id: null, creditId: credit.id, paymentAmount: '', paymentMethod: 'cash',
        paymentDate: new Date().toISOString().split('T')[0],
        referenceNo: `PAY${Date.now()}`, notes: ''
      });
      setFormErrors({});
      setShowAddPaymentModal(true);
    }
  };

  const fetchPayments = useCallback((creditId) => {
    const branchId = currentUser.branch_id || 1;
    const all = getData(PAYMENTS_KEY, []);
    setPayments(all.filter(p => p.creditId === creditId && (!p.branchId || p.branchId === branchId)));
  }, [currentUser.branch_id]);

  const handleEditPayment = (payment) => {
    const credit = creditsMap.get(payment.creditId);
    setSelectedPaymentForEdit(payment);
    setSelectedCreditForPayment(credit);
    setPaymentForm({
      id: payment.id, creditId: payment.creditId, paymentAmount: payment.paymentAmount,
      paymentMethod: payment.paymentMethod, paymentDate: payment.paymentDate,
      referenceNo: payment.referenceNo || '', notes: payment.notes || ''
    });
    setFormErrors({});
    setShowEditPaymentModal(true);
  };

  const handlePaymentFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'paymentAmount' && parseFloat(value) < 0) {
      setPaymentForm(prev => ({ ...prev, [name]: '0' }));
      return;
    }
    setPaymentForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleSavePayment = async () => {
    if (!validatePaymentForm()) {
      setValidationError(lang === 'mm' ? 'ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ' : 'Please fix the errors');
      return;
    }
    try {
      setLoading(true);
      await delay(300);
      const amount = parseFloat(paymentForm.paymentAmount);
      const payments = getData(PAYMENTS_KEY, []);
      const credits = getData(CREDITS_KEY, []);
      const newPaymentId = generatePaymentId();
      const branchId = currentUser.branch_id || 1;

      const newPayment = {
        id: newPaymentId,
        creditId: paymentForm.creditId,
        paymentAmount: amount,
        paymentMethod: paymentForm.paymentMethod,
        paymentDate: paymentForm.paymentDate,
        referenceNo: paymentForm.referenceNo,
        notes: paymentForm.notes,
        createdByName: currentUser.name,
        createdByRole: currentUser.role,
        createdAt: new Date().toISOString(),
        branchId
      };
      payments.unshift(newPayment);
      saveData(PAYMENTS_KEY, payments);

      // Update credit
      const idx = credits.findIndex(c => c.id === paymentForm.creditId);
      if (idx !== -1) {
        const old = credits[idx];
        const newPaid = (old.paidAmount || 0) + amount;
        const newRemaining = (old.totalAmount || 0) - newPaid;
        credits[idx] = {
          ...old,
          paidAmount: newPaid,
          remainingAmount: newRemaining,
          lastPaymentDate: paymentForm.paymentDate,
          paymentCount: (old.paymentCount || 0) + 1,
          status: computeStatus({ totalAmount: old.totalAmount, paidAmount: newPaid, dueDate: old.dueDate })
        };
        saveData(CREDITS_KEY, credits);

        addCreditLog({
          actionType: 'PAYMENT_ADD',
          creditId: old.id,
          invoiceNo: old.invoiceNo,
          customerName: old.customerName,
          paymentAmount: amount,
          paymentMethod: paymentForm.paymentMethod,
          createdByName: currentUser.name,
          createdByRole: currentUser.role,
          branchId,
          changes: [`Payment: ${formatCurrency(amount)}`, `Status: ${credits[idx].status.toUpperCase()}`]
        });
      }

      setSuccess(true);
      setShowAddPaymentModal(false);
      loadCredits(pagination.page, pagination.size, activeTab, searchQuery, searchField);
      loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
      if (selectedCreditForHistory?.id === paymentForm.creditId) fetchPayments(paymentForm.creditId);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const handleUpdatePayment = async (formData) => {
    if (!formData.id) {
      setValidationError(lang === 'mm' ? 'ငွေပေးချေမှု ID ပျောက်နေသည်' : 'Payment ID is missing');
      return;
    }
    const amount = parseFloat(formData.paymentAmount);
    if (amount <= 0) { setValidationError(lang === 'mm' ? '0 ထက်ကြီးရပါမည်' : 'Must be greater than 0'); return; }

    try {
      setLoading(true);
      await delay(300);
      const payments = getData(PAYMENTS_KEY, []);
      const credits = getData(CREDITS_KEY, []);
      const branchId = currentUser.branch_id || 1;

      const pIdx = payments.findIndex(p => p.id === formData.id);
      if (pIdx === -1) throw new Error('Payment not found');
      const oldPayment = payments[pIdx];
      const amountDiff = amount - oldPayment.paymentAmount;

      payments[pIdx] = {
        ...oldPayment,
        paymentAmount: amount,
        paymentMethod: formData.paymentMethod,
        paymentDate: formData.paymentDate,
        referenceNo: formData.referenceNo || '',
        notes: formData.notes || '',
        updatedAt: new Date().toISOString()
      };
      saveData(PAYMENTS_KEY, payments);

      // Update credit
      const cIdx = credits.findIndex(c => c.id === formData.creditId);
      if (cIdx !== -1) {
        const old = credits[cIdx];
        const newPaid = (old.paidAmount || 0) + amountDiff;
        credits[cIdx] = {
          ...old,
          paidAmount: newPaid,
          remainingAmount: (old.totalAmount || 0) - newPaid,
          status: computeStatus({ totalAmount: old.totalAmount, paidAmount: newPaid, dueDate: old.dueDate })
        };
        saveData(CREDITS_KEY, credits);

        addCreditLog({
          actionType: 'PAYMENT_EDIT',
          creditId: old.id,
          invoiceNo: old.invoiceNo,
          customerName: old.customerName,
          paymentAmount: amount,
          paymentMethod: formData.paymentMethod,
          createdByName: currentUser.name,
          createdByRole: currentUser.role,
          branchId,
          changes: [`Payment updated: ${formatCurrency(oldPayment.paymentAmount)} → ${formatCurrency(amount)}`]
        });
      }

      setSuccess(true);
      setShowEditPaymentModal(false);
      setSelectedPaymentForEdit(null);
      loadCredits(pagination.page, pagination.size, activeTab, searchQuery, searchField);
      loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
      if (selectedCreditForHistory?.id === formData.creditId) fetchPayments(formData.creditId);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  const refreshCreditData = useCallback(() => {
    if (selectedCreditForHistory?.id) {
      const credits = getData(CREDITS_KEY, []);
      const c = credits.find(x => x.id === selectedCreditForHistory.id);
      if (c) setSelectedCreditForHistory({ ...c, status: computeStatus(c) });
      fetchPayments(selectedCreditForHistory.id);
    }
  }, [selectedCreditForHistory, fetchPayments]);

  const showLogDetailModal = (log) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs, lang), [filteredLogs, lang]);

  const searchFieldOptions = useMemo(() => [
    { value: "all", label: lang === 'mm' ? "အကွက်အားလုံး" : "All Fields" },
    { value: "customerName", label: lang === 'mm' ? "ဝယ်ယူသူအမည်" : "Customer Name" },
    { value: "phone", label: lang === 'mm' ? "ဖုန်းနံပါတ်" : "Phone Number" },
    { value: "invoiceNo", label: lang === 'mm' ? "Invoice နံပါတ်" : "Invoice No" }
  ], [lang]);

  const dateFilterOptions = useMemo(() => [
    { value: "all", label_mm: "အားလုံး", label_en: "All Time" },
    { value: "today", label_mm: "ယနေ့", label_en: "Today" },
    { value: "yesterday", label_mm: "မနေ့က", label_en: "Yesterday" },
    { value: "thisWeek", label_mm: "ဒီရက်သတ္တပတ်", label_en: "This Week" },
    { value: "thisMonth", label_mm: "ဒီလ", label_en: "This Month" },
    { value: "custom", label_mm: "ရက်ရွေး", label_en: "Custom" }
  ], []);

  const tabOptions = useMemo(() => [
    { value: "all-credits", label_mm: "အကြွေးအားလုံး", label_en: "All Credits", icon: "fa-list-alt", count: statusCounts.all },
    { value: "pending", label_mm: "ဆိုင်ငံ့", label_en: "Pending", icon: "fa-clock", count: statusCounts.pending },
    { value: "partially_paid", label_mm: "တစ်စိတ်တစ်ပိုင်း", label_en: "Partially Paid", icon: "fa-money-check-alt", count: statusCounts.partially_paid },
    { value: "paid", label_mm: "ပေးချေပြီး", label_en: "Paid", icon: "fa-check-circle", count: statusCounts.paid },
    { value: "overdue", label_mm: "နောက်ကျ", label_en: "Overdue", icon: "fa-exclamation-circle", count: statusCounts.overdue },
    { value: "history", label_mm: "မှတ်တမ်း", label_en: "History", icon: "fa-history", count: actionTypeCounts.all }
  ], [statusCounts, actionTypeCounts.all]);

  // ============================================================
  // ✅ JSX (SAME AS ORIGINAL)
  // ============================================================
  return (
    <div className="credit-container">
      {/* Messages */}
      <div className="cat-messages-container">
        {success && (
          <div className="cat-message success">
            <i className="fas fa-check-circle"></i>
            <span>{lang === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={() => setSuccess(false)}><i className="fas fa-times"></i></button>
          </div>
        )}
        {error && (
          <div className="cat-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button onClick={() => setError(null)}><i className="fas fa-times"></i></button>
          </div>
        )}
        {networkError && (
          <div className="damage-network-error">
            <i className="fas fa-wifi-slash"></i>
            <div className="error-content">
              <div className="error-title">{lang === 'mm' ? 'ချိတ်ဆက်မှုအမှား' : 'Connection Error'}</div>
              <div className="error-message">{networkError}</div>
            </div>
            <button onClick={retryConnection}>
              <i className="fas fa-sync-alt"></i> {lang === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}
            </button>
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="credit-tabs-header">
        <div className="credit-tabs-selector">
          <div className="credit-select-container">
            <i className={`fas ${tabOptions.find(t => t.value === activeTab)?.icon} credit-select-icon`}></i>
            <select className="credit-tab-select" value={activeTab} onChange={handleTabChange} disabled={loading || tableLoading}>
              {tabOptions.map(tab => (
                <option key={tab.value} value={tab.value}>
                  {lang === 'mm' ? tab.label_mm : tab.label_en} ({tab.count?.toLocaleString() || 0})
                </option>
              ))}
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>
                {lang === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
              </option>
            </select>
            <i className="fas fa-chevron-down credit-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' && (
          <>
            <div className="credit-search-controls">
              <div className="credit-search-input-group">
                <i className="fas fa-search credit-search-icon"></i>
                <input
                  ref={searchInputRef}
                  type="text"
                  className="credit-search-input"
                  placeholder={lang === 'mm' ? 'အမည်၊ ဖုန်း၊ Invoice ဖြင့်ရှာဖွေရန် (Enter နှိပ်ပါ)...' : 'Search by name, phone, invoice (Press Enter)...'}
                  value={searchInputValue}
                  onChange={(e) => setSearchInputValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown}
                  disabled={tableLoading}
                />
                {searchInputValue && (
                  <button className="credit-clear-search-btn" onClick={handleClearSearch} disabled={tableLoading}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              <div className="credit-search-field-selector">
                <select className="credit-search-select" value={searchField} onChange={handleSearchFieldChange} disabled={tableLoading}>
                  {searchFieldOptions.map(option => (<option key={option.value} value={option.value}>{option.label}</option>))}
                </select>
              </div>
            </div>

            <div className="credit-header-stats">
              <div className="credit-stat-card">
                <div className="credit-stat-label">{lang === 'mm' ? 'စုစုပေါင်းအကြွေး' : 'Total Credit'}</div>
                <div className="credit-stat-value">{formatCurrency(summary.totalCredit)}</div>
              </div>
              <div className="credit-stat-card">
                <div className="credit-stat-label">{lang === 'mm' ? 'ကျန်ငွေ' : 'Remaining'}</div>
                <div className="credit-stat-value credit-stat-danger">{formatCurrency(summary.totalRemaining)}</div>
              </div>
              <button className="credit-add-btn" onClick={openAddModal} disabled={tableLoading}>
                <i className="fas fa-plus"></i> {lang === 'mm' ? 'အကြွေးအသစ် ထည့်ရန်' : 'Add Credit'}
              </button>
            </div>
          </>
        )}
      </div>

      <div className="subtab-content active">
        {activeTab === 'history' ? (
          /* ===== HISTORY TAB ===== */
          <div className="credit-history-section">
            <div className="credit-section-title">
              <div className="credit-title-row">
                <div className="credit-title-left">
                  <i className="fas fa-history"></i>
                  <span className="credit-title-text">{lang === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}</span>
                </div>
                <div className="credit-title-center">
                  <div className="credit-compact-nav">
                    <button className={`credit-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page - 1, 'prev')} disabled={logPagination.page === 1 || loading}>
                      {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="credit-page-control">
                      <input type="text" className="credit-page-input" value={historyPageInputValue} onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(historyPageInputValue, 10); if (!isNaN(v) && v >= 1 && v <= logPagination.totalPages && v !== logPagination.page) changeHistoryPage(v, 'jump'); else setHistoryPageInputValue(logPagination.page.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                      <span className="credit-page-total">/ {logPagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`credit-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page + 1, 'next')} disabled={logPagination.page === logPagination.totalPages || logPagination.totalPages === 0 || loading}>
                      {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="credit-items-per-page">
                      <select className="credit-per-page-select" value={logPagination.size} onChange={handleLogPageSizeChange} disabled={loading}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="credit-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="credit-title-right">
                  {loading ? (
                    <span className="credit-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="credit-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="credit-showing-count">
                      <span className="credit-count-numbers">{logPagination.total > 0 ? ((logPagination.page - 1) * logPagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="credit-count-numbers">{Math.min(logPagination.page * logPagination.size, logPagination.total)}</span>
                      <span> / </span>
                      <span className="credit-count-numbers">{logPagination.total.toLocaleString()}</span>
                      <span className="credit-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="credit-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="credit-filter-tabs" style={{ flex: '1 1 auto' }}>
                  {[
                    { v: 'all', label_mm: 'အားလုံး', label_en: 'All', count: actionTypeCounts.all },
                    { v: 'ADD', label_mm: 'အကြွေးထည့်', label_en: 'Add', count: actionTypeCounts.ADD, icon: 'fa-plus-circle' },
                    { v: 'EDIT', label_mm: 'ပြင်ဆင်', label_en: 'Edit', count: actionTypeCounts.EDIT, icon: 'fa-edit' },
                    { v: 'DELETE', label_mm: 'ဖျက်', label_en: 'Delete', count: actionTypeCounts.DELETE, icon: 'fa-trash' },
                    { v: 'PAYMENT_ADD', label_mm: 'ငွေပေးချေ', label_en: 'Payment', count: actionTypeCounts.PAYMENT_ADD, icon: 'fa-money-bill-wave' },
                    { v: 'PAYMENT_EDIT', label_mm: 'ငွေပေးချေပြင်ဆင်', label_en: 'Payment Edit', count: actionTypeCounts.PAYMENT_EDIT, icon: 'fa-edit' }
                  ].map(f => (
                    <button key={f.v} className={`credit-filter-tab ${logFilter === f.v ? 'active' : ''}`} onClick={() => setLogFilter(f.v)} disabled={loading}>
                      {f.icon && <i className={`fas ${f.icon}`}></i>} {lang === 'mm' ? f.label_mm : f.label_en} <span className="credit-filter-count">({f.count?.toLocaleString() || 0})</span>
                    </button>
                  ))}
                </div>
                <div className="credit-filter-tabs" style={{ marginLeft: 'auto' }}>
                  {dateFilterOptions.map(o => (
                    <button key={o.value} className={`credit-filter-tab ${dateFilter.filter === o.value ? 'active' : ''}`} onClick={() => handleDateFilterChange(o.value)} disabled={loading}>
                      {lang === 'mm' ? o.label_mm : o.label_en}
                    </button>
                  ))}
                  {dateFilter.filter !== 'all' && (
                    <button className="credit-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }} disabled={loading}>
                      <i className="fas fa-times"></i> {lang === 'mm' ? 'ရှင်းမည်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>
              {showDatePicker && (
                <div className="credit-custom-date-picker">
                  <div className="credit-date-picker-row"><label>{lang === 'mm' ? 'မှ' : 'From:'}</label><input type="date" className="credit-date-input" value={dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} /></div>
                  <div className="credit-date-picker-row"><label>{lang === 'mm' ? 'ထိ' : 'To:'}</label><input type="date" className="credit-date-input" value={dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} /></div>
                  <button className="credit-apply-date-btn" disabled={!dateFilter.customFrom || !dateFilter.customTo}>
                    <i className="fas fa-check"></i> {lang === 'mm' ? 'အတည်ပြု' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="credit-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p></div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="credit-date-group">
                    <div className="credit-date-header">
                      <span className="credit-date-label">{date}</span>
                      <span className="credit-date-count">{dateLogs.length} {lang === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}</span>
                    </div>
                    <div className="credit-logs-list">
                      {dateLogs.map(log => (
                        <div key={log.id} className={`credit-compact-log-entry log-${log.actionType?.toLowerCase()}`} onClick={() => showLogDetailModal(log)} style={{ cursor: 'pointer' }}>
                          <div className="credit-log-icon" style={{ color: getActionColor(log.actionType) }}><i className={`fas ${getActionIcon(log.actionType)}`}></i></div>
                          <div className="credit-log-content">
                            <div className="credit-log-main-info">
                              <span className="credit-log-action">
                                {log.actionType === 'ADD' && (lang === 'mm' ? 'အကြွေးအသစ်ထည့်ခြင်း' : 'Credit Added')}
                                {log.actionType === 'EDIT' && (lang === 'mm' ? 'အကြွေးပြင်ဆင်ခြင်း' : 'Credit Updated')}
                                {log.actionType === 'DELETE' && (lang === 'mm' ? 'အကြွေးဖျက်ခြင်း' : 'Credit Deleted')}
                                {log.actionType === 'PAYMENT_ADD' && (lang === 'mm' ? 'ငွေပေးချေမှု' : 'Payment Added')}
                                {log.actionType === 'PAYMENT_EDIT' && (lang === 'mm' ? 'ငွေပေးချေမှုပြင်ဆင်' : 'Payment Updated')}
                              </span>
                              <span className="credit-log-customer">"{log.customerName}"{log.invoiceNo && <span className="credit-log-id">#{log.invoiceNo}</span>}</span>
                            </div>
                            {log.paymentAmount > 0 && (
                              <div className="credit-log-payment-amount">
                                <i className="fas fa-money-bill-wave" style={{ color: '#2ecc71' }}></i>
                                <strong>{formatCurrency(log.paymentAmount)}</strong>
                                {log.paymentMethod && <span className="credit-log-payment-method">({getPaymentMethodText(log.paymentMethod, lang)})</span>}
                              </div>
                            )}
                            <div className="credit-log-details">
                              <span className="credit-log-user"><i className="fas fa-user"></i> <strong>{log.createdByName || 'Unknown'}</strong> <span className="credit-user-role">({log.createdByRole || 'N/A'})</span></span>
                              <span className="credit-log-time"><i className="fas fa-clock"></i> {log.timestamp}</span>
                              {log.changes && log.changes.length > 0 && <span className="credit-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} {lang === 'mm' ? 'ခု' : 'details'}</span>}
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
                  <p>{lang === 'mm' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် လုပ်ဆောင်ချက်များ မတွေ့ပါ။' : 'No activities found.'}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== CREDITS TAB ===== */
          <>
            <div className="credit-section-title">
              <div className="credit-title-row">
                <div className="credit-title-left">
                  <i className="fas fa-credit-card"></i>
                  <span className="credit-title-text">
                    {activeTab === 'all-credits' && (lang === 'mm' ? 'အကြွေးမှတ်တမ်းအားလုံး' : 'All Credit Records')}
                    {activeTab === 'pending' && (lang === 'mm' ? 'ဆိုင်ငံ့အကြွေးများ' : 'Pending Credits')}
                    {activeTab === 'partially_paid' && (lang === 'mm' ? 'တစ်စိတ်တစ်ပိုင်းပေးချေပြီး' : 'Partially Paid')}
                    {activeTab === 'paid' && (lang === 'mm' ? 'ပေးချေပြီး' : 'Paid Credits')}
                    {activeTab === 'overdue' && (lang === 'mm' ? 'နောက်ကျအကြွေးများ' : 'Overdue Credits')}
                  </span>
                </div>
                <div className="credit-title-center">
                  <div className="credit-compact-nav">
                    <button className={`credit-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page - 1, 'prev')} disabled={pagination.page === 1 || tableLoading}>
                      {tableLoading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="credit-page-control">
                      <input type="text" className="credit-page-input" value={pageInputValue} onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(pageInputValue, 10); if (!isNaN(v) && v >= 1 && v <= pagination.totalPages && v !== pagination.page) changePage(v, 'jump'); else setPageInputValue(pagination.page.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={tableLoading} />
                      <span className="credit-page-total">/ {pagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`credit-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page + 1, 'next')} disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || tableLoading}>
                      {tableLoading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="credit-items-per-page">
                      <select className="credit-per-page-select" value={pagination.size} onChange={handlePageSizeChange} disabled={tableLoading}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="credit-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="credit-title-right">
                  {tableLoading ? (
                    <span className="credit-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="credit-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="credit-showing-count">
                      <span className="credit-count-numbers">{pagination.total > 0 ? ((pagination.page - 1) * pagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="credit-count-numbers">{Math.min(pagination.page * pagination.size, pagination.total)}</span>
                      <span> / </span>
                      <span className="credit-count-numbers">{pagination.total.toLocaleString()}</span>
                      <span className="credit-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
              {searchQuery && (
                <div className="credit-search-badge-container">
                  <span className="credit-search-badge"><i className="fas fa-search"></i> "{searchQuery}"</span>
                </div>
              )}
            </div>

            <div className="credit-table-wrapper" ref={tableBodyRef}>
              <table className="credit-table">
                <thead>
                  <tr>
                    <th>{lang === 'mm' ? 'Invoice' : 'Invoice'}</th>
                    <th>{lang === 'mm' ? 'ဝယ်ယူသူ' : 'Customer'}</th>
                    <th>{lang === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact'}</th>
                    <th>{lang === 'mm' ? 'စုစုပေါင်း' : 'Total'}</th>
                    <th>{lang === 'mm' ? 'ပေးချေပြီး' : 'Paid'}</th>
                    <th>{lang === 'mm' ? 'ကျန်ငွေ' : 'Remaining'}</th>
                    <th>{lang === 'mm' ? 'နောက်ဆုံးရက်' : 'Due Date'}</th>
                    <th>{lang === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{lang === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="9" className="credit-no-data"><div className="credit-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p></div></td></tr>
                  ) : filteredCredits.length > 0 ? (
                    filteredCredits.map(credit => (
                      <tr key={credit.id}>
                        <td><div className="credit-id-cell"><span className="credit-id">{credit.invoiceNo}</span></div></td>
                        <td>
                          <strong>{credit.customerName}</strong>
                          {credit.notes && <div className="credit-notes-preview" title={credit.notes}><i className="fas fa-sticky-note"></i> {credit.notes.length > 30 ? credit.notes.substring(0, 30) + '...' : credit.notes}</div>}
                        </td>
                        <td>
                          <div className="credit-contact-cell">
                            <div><i className="fas fa-phone"></i> {credit.phone || '-'}</div>
                            {credit.email && <div><i className="fas fa-envelope"></i> {credit.email}</div>}
                          </div>
                        </td>
                        <td className="credit-amount-cell">{formatCurrency(credit.totalAmount)}</td>
                        <td className="credit-amount-cell credit-paid">
                          {formatCurrency(credit.paidAmount)}
                          <div className="credit-payment-progress"><div className="credit-progress-bar" style={{ width: `${(credit.paidAmount / credit.totalAmount) * 100}%` }}></div></div>
                        </td>
                        <td className="credit-amount-cell credit-remaining" style={{ color: "#f72585" }}>{formatCurrency(credit.totalAmount - credit.paidAmount)}</td>
                        <td>
                          <div className="credit-date-cell">
                            {credit.dueDate ? formatDate(credit.dueDate) : '-'}
                            {credit.lastPaymentDate && <small>{lang === 'mm' ? 'နောက်ဆုံးပေး' : 'Last paid'}: {formatDate(credit.lastPaymentDate)}</small>}
                          </div>
                        </td>
                        <td><span className={`credit-status-badge ${getStatusBadgeClass(credit.status)}`}>{getStatusLabel(credit.status, lang)}</span></td>
                        <td>
                          <div className="credit-action-buttons">
                            <button className="credit-action-btn credit-action-view" title={lang === 'mm' ? 'ငွေပေးချေမှုမှတ်တမ်း' : 'Payment History'} onClick={() => handleCreditAction('view_payments', credit.id)} disabled={loading}><i className="fas fa-history"></i></button>
                            {(credit.totalAmount - credit.paidAmount) > 0 && (
                              <button className="credit-action-btn credit-action-payment" title={lang === 'mm' ? 'ငွေပေးချေမှုထည့်' : 'Add Payment'} onClick={() => handleCreditAction('add_payment', credit.id)} disabled={loading}><i className="fas fa-money-bill-wave"></i></button>
                            )}
                            <button className="credit-action-btn credit-action-edit" title={lang === 'mm' ? 'ပြင်ဆင်' : 'Edit'} onClick={() => handleCreditAction('edit', credit.id)} disabled={loading}><i className="fas fa-edit"></i></button>
                            <button className="credit-action-btn credit-action-delete" title={lang === 'mm' ? 'ဖျက်' : 'Delete'} onClick={() => handleCreditAction('delete', credit.id)} disabled={loading}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="9" className="credit-no-data"><div className="credit-no-data-content"><i className="fas fa-credit-card"></i><p>{searchQuery ? (lang === 'mm' ? `"${searchQuery}" အတွက် အကြွေးမှတ်တမ်း မတွေ့ပါ` : `No credits found for "${searchQuery}"`) : (lang === 'mm' ? 'အကြွေးမှတ်တမ်း မတွေ့ပါ' : 'No credit records found')}</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <CreditModal
        show={showCreditModal}
        onClose={() => setShowCreditModal(false)}
        modalType={modalType}
        creditForm={creditForm}
        onFormChange={handleCreditFormChange}
        onSave={handleSaveCredit}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={lang}
        isFormValid={isCreditFormValid}
        formatCurrency={formatCurrency}
        recentInvoices={recentInvoices}
        onSearchInvoice={handleSearchInvoice}
        onSelectInvoice={handleSelectInvoice}
        searchLoading={searchLoading}
        searchResults={searchResults}
      />

      <PaymentModal
        show={showAddPaymentModal}
        onClose={() => setShowAddPaymentModal(false)}
        modalType="add"
        paymentForm={paymentForm}
        credit={selectedCreditForPayment}
        onFormChange={handlePaymentFormChange}
        onSave={handleSavePayment}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={lang}
        isFormValid={isPaymentFormValid}
        formatCurrency={formatCurrency}
        getPaymentMethodText={getPaymentMethodText}
      />

      <PaymentModal
        show={showEditPaymentModal}
        onClose={() => setShowEditPaymentModal(false)}
        modalType="edit"
        paymentForm={paymentForm}
        credit={selectedCreditForPayment}
        existingPayment={selectedPaymentForEdit}
        onFormChange={handlePaymentFormChange}
        onUpdate={handleUpdatePayment}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={lang}
        isFormValid={isPaymentFormValid}
        formatCurrency={formatCurrency}
        getPaymentMethodText={getPaymentMethodText}
      />

      <CreditExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
        language={lang}
      />

      <PaymentHistoryModal
        show={showPaymentHistoryModal}
        onClose={() => setShowPaymentHistoryModal(false)}
        credit={selectedCreditForHistory}
        payments={payments}
        language={lang}
        formatCurrency={formatCurrency}
        formatDate={formatDate}
        getPaymentMethodText={getPaymentMethodText}
        onAddPayment={() => {
          setShowPaymentHistoryModal(false);
          if (selectedCreditForHistory) {
            setSelectedCreditForPayment(selectedCreditForHistory);
            setPaymentForm({ id: null, creditId: selectedCreditForHistory.id, paymentAmount: '', paymentMethod: 'cash', paymentDate: new Date().toISOString().split('T')[0], referenceNo: `PAY${Date.now()}`, notes: '' });
            setShowAddPaymentModal(true);
          }
        }}
        onEditPayment={handleEditPayment}
        onRefresh={refreshCreditData}
      />

      {/* Log Details Modal */}
      {showLogDetails && selectedLog && (
        <div className="credit-modal-overlay">
          <div className="credit-modal-content" style={{ maxWidth: '600px' }}>
            <div className="credit-modal-header">
              <h3><i className={`fas ${getActionIcon(selectedLog.actionType)}`} style={{ color: getActionColor(selectedLog.actionType) }}></i> {lang === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}</h3>
              <button className="credit-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="credit-modal-body">
              <div className="credit-log-detail-header">
                <div className="credit-log-detail-main">
                  <div className="credit-log-detail-action">
                    <span className="credit-action-badge" style={{ backgroundColor: `${getActionColor(selectedLog.actionType)}20`, color: getActionColor(selectedLog.actionType), borderColor: getActionColor(selectedLog.actionType) }}>
                      <i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i>
                      {selectedLog.actionType === 'ADD' && (lang === 'mm' ? 'အကြွေးအသစ်ထည့်ခြင်း' : 'Credit Added')}
                      {selectedLog.actionType === 'EDIT' && (lang === 'mm' ? 'အကြွေးပြင်ဆင်ခြင်း' : 'Credit Updated')}
                      {selectedLog.actionType === 'DELETE' && (lang === 'mm' ? 'အကြွေးဖျက်ခြင်း' : 'Credit Deleted')}
                      {selectedLog.actionType === 'PAYMENT_ADD' && (lang === 'mm' ? 'ငွေပေးချေမှု' : 'Payment Added')}
                      {selectedLog.actionType === 'PAYMENT_EDIT' && (lang === 'mm' ? 'ငွေပေးချေမှုပြင်ဆင်' : 'Payment Updated')}
                    </span>
                  </div>
                  {selectedLog.customerName && (
                    <div className="credit-log-detail-customer">
                      <i className="fas fa-user"></i>
                      <span className="credit-customer-name">"{selectedLog.customerName}"</span>
                      {selectedLog.invoiceNo && <span className="credit-credit-id-detail">Invoice: {selectedLog.invoiceNo}</span>}
                    </div>
                  )}
                  {selectedLog.paymentAmount > 0 && (
                    <div className="credit-payment-amount">
                      <i className="fas fa-money-bill-wave"></i> {formatCurrency(selectedLog.paymentAmount)}
                      {selectedLog.paymentMethod && <span> ({getPaymentMethodText(selectedLog.paymentMethod, lang)})</span>}
                    </div>
                  )}
                </div>
                <div className="credit-log-detail-meta">
                  <div className="credit-log-detail-user"><i className="fas fa-user"></i><div><div className="credit-user-name-detail"><strong>{selectedLog.createdByName}</strong></div><div className="credit-user-role-detail">{selectedLog.createdByRole}</div></div></div>
                  <div className="credit-log-detail-time"><i className="fas fa-calendar"></i><div><div className="credit-log-date-detail">{selectedLog.date}</div><div className="credit-log-time-detail">{selectedLog.timestamp}</div></div></div>
                </div>
              </div>
              <div className="credit-log-detail-content">
                <h4>{lang === 'mm' ? 'အသေးစိတ်များ' : 'Details'}:</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="credit-change-list">
                    {selectedLog.changes.map((detail, index) => (
                      <div key={index} className="credit-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="credit-no-changes"><i className="fas fa-info-circle"></i><span>{lang === 'mm' ? 'အသေးစိတ်မှတ်တမ်း မရှိပါ' : 'No details recorded'}</span></div>
                )}
              </div>
            </div>
            <div className="credit-modal-footer">
              <button className="credit-btn-cancel" onClick={() => setShowLogDetails(false)}>{lang === 'mm' ? 'ပိတ်မည်' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCreditPage;