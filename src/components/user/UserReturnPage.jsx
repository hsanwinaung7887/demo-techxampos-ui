// UserReturnPage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ReturnModal from './ReturnModal';
import ReturnDetailsModal from './ReturnDetailsModal';
import ReturnExportModal from './ReturnExportModal';
import "../../light-style/user-css/userReturnPage.css";
import { useSelector } from 'react-redux';

// ============================================================
// ✅ DEMO SEED DATA — JSON + localStorage
// ============================================================
const SALES_KEY = "demo_sales";
const RETURNS_KEY = "demo_returns";
const RETURN_LOGS_KEY = "demo_return_logs";
const SEED_VERSION_KEY = "demo_return_seed_version";
const SEED_VERSION = "1.0.0";

const SEED_SALES = [
  {
    id: 1, invoiceNo: "INV-2024-001", customerName: "မောင်မောင်", customerPhone: "09-771234567",
    saleDate: new Date(Date.now() - 5 * 86400000).toISOString(),
    total: 61500, subtotal: 60000, taxPercentage: 5, taxAmount: 3000,
    paymentMethod: "Cash", additionalDiscount: 1500, branchId: 1,
    items: [
      { id: 1, saleItemId: 1, productId: 1, productName: "ကီးဘုတ်", barcode: "120215421001", sku: "PRD-001", quantity: 2, price: 12000, originalPrice: 12000, discountAmount: 0, subtotal: 24000, batchId: 1, batchNumber: "BATCH-001", purchasePrice: 8000, isFree: false },
      { id: 2, saleItemId: 2, productId: 4, productName: "နားကြပ်", barcode: "120215421004", sku: "PRD-004", quantity: 1, price: 36000, originalPrice: 45000, discountAmount: 9000, subtotal: 36000, batchId: 2, batchNumber: "BATCH-002", purchasePrice: 25000, isFree: false }
    ]
  },
  {
    id: 2, invoiceNo: "INV-2024-002", customerName: "ဒေါ်မြင့်", customerPhone: "09-791234567",
    saleDate: new Date(Date.now() - 3 * 86400000).toISOString(),
    total: 34000, subtotal: 32000, taxPercentage: 5, taxAmount: 1600,
    paymentMethod: "KPay", additionalDiscount: 0, branchId: 1,
    items: [
      { id: 3, saleItemId: 3, productId: 21, productName: "တီရှပ်", barcode: "120215421021", sku: "PRD-021", quantity: 3, price: 10800, originalPrice: 12000, discountAmount: 3600, subtotal: 32400, batchId: 3, batchNumber: "BATCH-003", purchasePrice: 6000, isFree: false }
    ]
  },
  {
    id: 3, invoiceNo: "INV-2024-003", customerName: "ကိုဇော်", customerPhone: "09-781234567",
    saleDate: new Date(Date.now() - 1 * 86400000).toISOString(),
    total: 45500, subtotal: 45000, taxPercentage: 5, taxAmount: 2250,
    paymentMethod: "Cash", additionalDiscount: 1750, branchId: 1,
    items: [
      { id: 4, saleItemId: 4, productId: 11, productName: "ကော်ဖီ", barcode: "120215421011", sku: "PRD-011", quantity: 5, price: 5500, originalPrice: 6000, discountAmount: 2500, subtotal: 27500, batchId: 4, batchNumber: "BATCH-004", purchasePrice: 3500, isFree: false },
      { id: 5, saleItemId: 5, productId: 15, productName: "ရေသန့်", barcode: "120215421015", sku: "PRD-015", quantity: 10, price: 700, originalPrice: 700, discountAmount: 0, subtotal: 7000, batchId: 5, batchNumber: "BATCH-005", purchasePrice: 300, isFree: false }
    ]
  }
];

const SEED_RETURNS = [
  {
    id: 1, returnNo: "RET-2024-001", invoiceNo: "INV-2024-001",
    customerName: "မောင်မောင်", customerPhone: "09-771234567",
    returnType: "PARTIAL", reason: "DEFECTIVE",
    refundAmount: 12000, taxRefund: 600, totalRefund: 12600,
    paymentMethod: "Cash", status: "COMPLETED",
    totalItems: 1, totalQuantity: 1, notes: "ကီးဘုတ် 1 ခု ချို့ယွင်းနေ",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), branchId: 1,
    items: [{ id: 1, productId: 1, productName: "ကီးဘုတ်", sku: "PRD-001", barcode: "120215421001", quantity: 1, unitPrice: 12000, batchId: 1, reason: "ချို့ယွင်းနေ" }]
  },
  {
    id: 2, returnNo: "RET-2024-002", invoiceNo: "INV-2024-002",
    customerName: "ဒေါ်မြင့်", customerPhone: "09-791234567",
    returnType: "FULL", reason: "WRONG_SIZE",
    refundAmount: 32400, taxRefund: 1620, totalRefund: 34020,
    paymentMethod: "KPay", status: "PENDING",
    totalItems: 1, totalQuantity: 3, notes: "အရွယ်အစား မှား",
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1,
    items: [{ id: 2, productId: 21, productName: "တီရှပ်", sku: "PRD-021", barcode: "120215421021", quantity: 3, unitPrice: 10800, batchId: 3, reason: "အရွယ်အစားမှား" }]
  },
  {
    id: 3, returnNo: "RET-2024-003", invoiceNo: "INV-2024-003",
    customerName: "ကိုဇော်", customerPhone: "09-781234567",
    returnType: "PARTIAL", reason: "DAMAGED",
    refundAmount: 5500, taxRefund: 275, totalRefund: 5775,
    paymentMethod: "Cash", status: "PROCESSING",
    totalItems: 1, totalQuantity: 1, notes: "ကော်ဖီထုပ် ပျက်စီးနေ",
    createdByName: "Cashier2", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), branchId: 1,
    items: [{ id: 3, productId: 11, productName: "ကော်ဖီ", sku: "PRD-011", barcode: "120215421011", quantity: 1, unitPrice: 5500, batchId: 4, reason: "ပျက်စီးနေ" }]
  },
  {
    id: 4, returnNo: "RET-2024-004", invoiceNo: "INV-2024-001",
    customerName: "မောင်မောင်", customerPhone: "09-771234567",
    returnType: "PARTIAL", reason: "CUSTOMER_CHANGED_MIND",
    refundAmount: 36000, taxRefund: 1800, totalRefund: 37800,
    paymentMethod: "Cash", status: "PENDING",
    totalItems: 1, totalQuantity: 1, notes: "နားကြပ် မလိုချင်တော့ပါ",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), branchId: 1,
    items: [{ id: 4, productId: 4, productName: "နားကြပ်", sku: "PRD-004", barcode: "120215421004", quantity: 1, unitPrice: 36000, batchId: 2, reason: "စိတ်ပြောင်း" }]
  },
  {
    id: 5, returnNo: "RET-2024-005", invoiceNo: "INV-2024-003",
    customerName: "ကိုဇော်", customerPhone: "09-781234567",
    returnType: "PARTIAL", reason: "NOT_AS_DESCRIBED",
    refundAmount: 700, taxRefund: 35, totalRefund: 735,
    paymentMethod: "Cash", status: "COMPLETED",
    totalItems: 1, totalQuantity: 1, notes: "",
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), branchId: 1,
    items: [{ id: 5, productId: 15, productName: "ရေသန့်", sku: "PRD-015", barcode: "120215421015", quantity: 1, unitPrice: 700, batchId: 5, reason: "ဖော်ပြချက်မကိုက်" }]
  },
  {
    id: 6, returnNo: "RET-2024-006", invoiceNo: "INV-2024-002",
    customerName: "ဒေါ်မြင့်", customerPhone: "09-791234567",
    returnType: "FULL", reason: "OTHER",
    refundAmount: 10800, taxRefund: 540, totalRefund: 11340,
    paymentMethod: "KPay", status: "COMPLETED",
    totalItems: 1, totalQuantity: 1, notes: "အခြားအကြောင်းပြချက်",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), branchId: 1,
    items: [{ id: 6, productId: 21, productName: "တီရှပ်", sku: "PRD-021", barcode: "120215421021", quantity: 1, unitPrice: 10800, batchId: 3, reason: "အခြား" }]
  }
];

const SEED_RETURN_LOGS = [
  { id: 1, actionType: "RETURN", returnNo: "RET-2024-001", returnId: 1, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), branchId: 1, changes: ["Return created with 1 item", "Refund amount: 12,600 Ks"] },
  { id: 2, actionType: "COMPLETE", returnNo: "RET-2024-001", returnId: 1, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 2 * 86400000 + 3600000).toISOString(), branchId: 1, changes: ["Status changed: PENDING → COMPLETED"] },
  { id: 3, actionType: "RETURN", returnNo: "RET-2024-002", returnId: 2, createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1, changes: ["Return created with 1 item", "Type: FULL"] },
  { id: 4, actionType: "UPDATE", returnNo: "RET-2024-002", returnId: 2, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 20 * 3600000).toISOString(), branchId: 1, changes: ["Notes updated"] },
  { id: 5, actionType: "RETURN", returnNo: "RET-2024-003", returnId: 3, createdByName: "Cashier2", createdByRole: "Cashier", createdAt: new Date(Date.now() - 12 * 3600000).toISOString(), branchId: 1, changes: ["Return created with 1 item"] },
  { id: 6, actionType: "RETURN", returnNo: "RET-2024-004", returnId: 4, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 6 * 3600000).toISOString(), branchId: 1, changes: ["Return created with 1 item", "Type: PARTIAL"] },
  { id: 7, actionType: "RETURN", returnNo: "RET-2024-005", returnId: 5, createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 20 * 86400000).toISOString(), branchId: 1, changes: ["Return created with 1 item"] },
  { id: 8, actionType: "COMPLETE", returnNo: "RET-2024-005", returnId: 5, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 19 * 86400000).toISOString(), branchId: 1, changes: ["Status changed: PENDING → COMPLETED"] },
  { id: 9, actionType: "RETURN", returnNo: "RET-2024-006", returnId: 6, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 25 * 86400000).toISOString(), branchId: 1, changes: ["Return created with 1 item"] },
  { id: 10, actionType: "DELETE", returnNo: "RET-2024-000", returnId: 0, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), branchId: 1, changes: ["Return deleted (cancelled)"] }
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
  try { localStorage.setItem(key, JSON.stringify(data)); }
  catch (e) { console.error("Save error:", e); }
};

const ensureReturnSeed = () => {
  const currentVersion = localStorage.getItem(SEED_VERSION_KEY);
  if (currentVersion !== SEED_VERSION) {
    console.log('🌱 Seeding demo return data v' + SEED_VERSION);
    saveData(SALES_KEY, SEED_SALES);
    saveData(RETURNS_KEY, SEED_RETURNS);
    saveData(RETURN_LOGS_KEY, SEED_RETURN_LOGS);
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
  } else {
    if (getData(RETURNS_KEY, []).length === 0) saveData(RETURNS_KEY, SEED_RETURNS);
    if (getData(RETURN_LOGS_KEY, []).length === 0) saveData(RETURN_LOGS_KEY, SEED_RETURN_LOGS);
    if (getData(SALES_KEY, []).length === 0) saveData(SALES_KEY, SEED_SALES);
  }
};

const generateReturnId = () => {
  const returns = getData(RETURNS_KEY, []);
  return returns.reduce((max, r) => Math.max(max, r.id || 0), 0) + 1;
};

const generateReturnNo = () => {
  const returns = getData(RETURNS_KEY, []);
  const year = new Date().getFullYear();
  return `RET-${year}-${String(returns.length + 1).padStart(3, '0')}`;
};

const generateLogId = () => {
  const logs = getData(RETURN_LOGS_KEY, []);
  return logs.reduce((max, l) => Math.max(max, l.id || 0), 0) + 1;
};

const addReturnLog = (logData) => {
  const logs = getData(RETURN_LOGS_KEY, []);
  const newLog = {
    id: generateLogId(),
    actionType: logData.actionType || 'RETURN',
    returnNo: logData.returnNo || '',
    returnId: logData.returnId || 0,
    createdByName: logData.createdByName || 'System',
    createdByRole: logData.createdByRole || 'N/A',
    createdAt: new Date().toISOString(),
    branchId: logData.branchId || 1,
    changes: logData.changes || []
  };
  logs.unshift(newLog);
  saveData(RETURN_LOGS_KEY, logs);
  return newLog;
};

// Hook for language
const useLanguage = () => {
  const [lang, setLang] = useState(localStorage.getItem('appLanguage') || 'mm');
  useEffect(() => {
    const handler = (e) => setLang(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);
  return lang;
};

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 Ks';
  return amount.toLocaleString() + ' Ks';
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const groupLogsByDate = (logs, lang) => {
  const grouped = {};
  logs.forEach(log => {
    const date = new Date(log.createdAt);
    const dateKey = date.toLocaleDateString(lang === 'mm' ? 'my' : 'en-US', {
      month: 'short', day: 'numeric', year: 'numeric'
    });
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(log);
  });
  return grouped;
};

const getActionIcon = (type) => {
  switch(type) {
    case 'RETURN': return 'fa-undo-alt';
    case 'UPDATE': return 'fa-edit';
    case 'COMPLETE': return 'fa-check-circle';
    case 'DELETE': return 'fa-trash';
    default: return 'fa-history';
  }
};

const getActionColor = (type) => {
  switch(type) {
    case 'RETURN': return '#4cc9f0';
    case 'UPDATE': return '#f8961e';
    case 'COMPLETE': return '#4361ee';
    case 'DELETE': return '#f72585';
    default: return '#6c757d';
  }
};

const getStatusColor = (status) => {
  switch(status?.toLowerCase()) {
    case 'pending': return '#f72585';
    case 'processing': return '#f8961e';
    case 'completed': return '#4cc9f0';
    case 'rejected': return '#6c757d';
    default: return '#6c757d';
  }
};

// ============================================================
// Main Component
// ============================================================
const UserReturnPage = () => {
  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const lang = useLanguage();

  // ============================================================
  // ✅ currentUser — Demo fallback (null မဖြစ်တော့)
  // ============================================================
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
    // ✅ DEMO fallback — currentUser null မဖြစ်စေရ
    return {
      id: 1,
      name: 'Demo User',
      username: 'demo',
      role: 'Cashier',
      email: 'demo@example.com',
      branch_id: 1,
      shop_id: 1,
    };
  }, [reduxUser?.id, reduxUser?.branchId, isAuthenticated]);

  // ===== SEED =====
  useEffect(() => {
    ensureReturnSeed();
  }, []);

  // ===== STATE =====
  const [returns, setReturns] = useState([]);
  const [returnsMap, setReturnsMap] = useState(new Map());
  const [filteredReturns, setFilteredReturns] = useState([]);
  const [selectedReturn, setSelectedReturn] = useState(null);

  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [activeTab, setActiveTab] = useState('all-returns');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const [pagination, setPagination] = useState({
    page: 1, size: 10, total: 0, totalPages: 1, hasMore: false, hasPrevious: false
  });
  const [logPagination, setLogPagination] = useState({
    page: 1, size: 10, total: 0, totalPages: 1, hasMore: false, hasPrevious: false
  });

  const [logFilter, setLogFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ filter: 'all', customFrom: '', customTo: '' });

  const [statusCounts, setStatusCounts] = useState({
    all: 0, pending: 0, processing: 0, completed: 0, rejected: 0
  });
  const [actionTypeCounts, setActionTypeCounts] = useState({
    all: 0, RETURN: 0, UPDATE: 0, COMPLETE: 0, DELETE: 0
  });

  // UI state
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnItems, setReturnItems] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [pageInputValue, setPageInputValue] = useState('1');
  const [historyPageInputValue, setHistoryPageInputValue] = useState('1');
  const [loadingDirection, setLoadingDirection] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [additionalDiscountPercent, setAdditionalDiscountPercent] = useState(0);
  const [networkError, setNetworkError] = useState(null);
  const [tempCustomFrom, setTempCustomFrom] = useState('');
  const [tempCustomTo, setTempCustomTo] = useState('');

  const [returnForm, setReturnForm] = useState({
    saleId: null, invoiceNo: '', customerName: '', customerPhone: '',
    returnType: 'FULL', reason: '', items: [], refundAmount: 0,
    taxRefund: 0, totalRefund: 0, paymentMethod: '', notes: '', status: 'PENDING'
  });
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  // Refs
  const pageChangeTimeoutRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const initialLoadDone = useRef(false);
  const isInitialMount = useRef(true);

  // ============================================================
  // ✅ Helpers
  // ============================================================
  const clearError = () => setError(null);
  const clearSuccess = () => setSuccess(false);
  const setLogFilterAction = (filter) => { setLogFilter(filter); setLogPagination(p => ({ ...p, page: 1 })); };
  const setDateFilterAction = (payload) => { setDateFilter(prev => ({ ...prev, ...payload })); setLogPagination(p => ({ ...p, page: 1 })); };
  const setSearchQueryAction = (q) => { setSearchQuery(q); setPagination(p => ({ ...p, page: 1 })); };

  // ============================================================
  // ✅ LOAD DATA — Synchronous (loop မဖြစ်စေရ)
  // ============================================================
  const loadReturns = useCallback((page = 1, size = 10, tab = 'all-returns', search = '') => {
    const branchId = currentUser.branch_id || 1;
    
    let allReturns = getData(RETURNS_KEY, []);
    allReturns = allReturns.filter(r => !r.branchId || r.branchId === branchId);

    // Status counts
    const sc = {
      all: allReturns.length,
      pending: allReturns.filter(r => r.status === 'PENDING').length,
      processing: allReturns.filter(r => r.status === 'PROCESSING').length,
      completed: allReturns.filter(r => r.status === 'COMPLETED').length,
      rejected: allReturns.filter(r => r.status === 'REJECTED').length,
    };
    setStatusCounts(sc);

    // Filter
    let filtered = [...allReturns];
    if (tab !== 'all-returns' && tab !== 'history') {
      filtered = filtered.filter(r => r.status?.toLowerCase() === tab.toLowerCase());
    }
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.returnNo?.toLowerCase().includes(q) ||
        r.invoiceNo?.toLowerCase().includes(q) ||
        r.customerName?.toLowerCase().includes(q)
      );
    }
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const totalItems = filtered.length;
    const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
    const safePage = Math.min(Math.max(1, page), totalPagesCalc);
    const start = (safePage - 1) * size;
    const paged = filtered.slice(start, start + size);

    const map = new Map();
    paged.forEach(r => map.set(r.id, r));

    setReturns(paged);
    setFilteredReturns(paged);
    setReturnsMap(map);
    setPagination({
      page: safePage, size, total: totalItems, totalPages: totalPagesCalc,
      hasMore: safePage < totalPagesCalc, hasPrevious: safePage > 1
    });
    setPageInputValue(safePage.toString());
  }, [currentUser.branch_id]);

  const loadLogs = useCallback((page = 1, size = 10, actionFilter = 'all', dFilter = { filter: 'all' }) => {
    const branchId = currentUser.branch_id || 1;
    
    let allLogs = getData(RETURN_LOGS_KEY, []);
    allLogs = allLogs.filter(l => !l.branchId || l.branchId === branchId);

    // Action counts
    const atc = {
      all: allLogs.length,
      RETURN: allLogs.filter(l => l.actionType === 'RETURN').length,
      UPDATE: allLogs.filter(l => l.actionType === 'UPDATE').length,
      COMPLETE: allLogs.filter(l => l.actionType === 'COMPLETE').length,
      DELETE: allLogs.filter(l => l.actionType === 'DELETE').length,
    };
    setActionTypeCounts(atc);

    // Filter actionType
    if (actionFilter && actionFilter !== 'all') {
      allLogs = allLogs.filter(l => l.actionType === actionFilter.toUpperCase());
    }

    // Filter date
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
      timestamp: log.timestamp || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''),
      date: log.date || (log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Unknown')
    }));

    const totalItems = processed.length;
    const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
    const safePage = Math.min(Math.max(1, page), totalPagesCalc);
    const start = (safePage - 1) * size;
    const paged = processed.slice(start, start + size);

    setLogs(paged);
    setFilteredLogs(paged);
    setLogPagination({
      page: safePage, size, total: totalItems, totalPages: totalPagesCalc,
      hasMore: safePage < totalPagesCalc, hasPrevious: safePage > 1
    });
    setHistoryPageInputValue(safePage.toString());
  }, [currentUser.branch_id]);

  // ============================================================
  // ✅ INITIAL LOAD — တစ်ခါပဲ run
  // ============================================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadReturns(1, 10, 'all-returns', '');
      loadLogs(1, 10, 'all', { filter: 'all' });
    }
  }, [loadReturns, loadLogs]);

  // ============================================================
  // ✅ RE-LOAD on tab/search/size change (Synchronous — loop မဖြစ်)
  // ============================================================
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (activeTab === 'history') return;
    const timer = setTimeout(() => {
      loadReturns(1, pagination.size, activeTab, searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [activeTab, searchQuery, pagination.size, loadReturns]);

  useEffect(() => {
    if (!initialLoadDone.current) return;
    loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
  }, [logFilter, dateFilter, logPagination.size, logPagination.page, loadLogs]);

  // ============================================================
  // ✅ PAGE CHANGE
  // ============================================================
  const changePage = (newPage, direction) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
    loadReturns(newPage, pagination.size, activeTab, searchQuery);
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
    setPagination(prev => ({ ...prev, size: newSize, page: 1 }));
    setPageInputValue('1');
    loadReturns(1, newSize, activeTab, searchQuery);
  };

  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value, 10);
    setLogPagination(prev => ({ ...prev, size: newSize, page: 1 }));
    setHistoryPageInputValue('1');
    loadLogs(1, newSize, logFilter, dateFilter);
  };

  // ===== Date filter handlers =====
  const handleDateFilterChange = (filter) => {
    if (filter === 'custom') {
      setShowDatePicker(true);
      setTempCustomFrom(dateFilter.customFrom || '');
      setTempCustomTo(dateFilter.customTo || '');
    } else {
      setDateFilterAction({ filter, customFrom: '', customTo: '' });
      setHistoryPageInputValue('1');
      setShowDatePicker(false);
    }
  };

  const handleTempCustomDateChange = (type, value) => {
    if (type === 'from') setTempCustomFrom(value);
    else setTempCustomTo(value);
  };

  const applyCustomDateFilter = () => {
    if (tempCustomFrom && tempCustomTo) {
      setDateFilterAction({ filter: 'custom', customFrom: tempCustomFrom, customTo: tempCustomTo });
      setHistoryPageInputValue('1');
    }
  };

  const clearDateFilter = () => {
    setDateFilterAction({ filter: 'all', customFrom: '', customTo: '' });
    setShowDatePicker(false);
    setTempCustomFrom('');
    setTempCustomTo('');
    setHistoryPageInputValue('1');
  };

  // ===== Tab / Search =====
  const handleTabChange = (e) => {
    const value = e.target.value;
    if (value === 'export') {
      setShowExportModal(true);
      e.target.value = activeTab;
      return;
    }
    setActiveTab(value);
  };

  const handleSearchChange = (e) => setSearchQueryAction(e.target.value);

  const retryConnection = () => {
    setNetworkError(null);
    clearError();
    if (activeTab === 'history') loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
    else loadReturns(pagination.page, pagination.size, activeTab, searchQuery);
  };

  // ============================================================
  // ✅ EXPORT
  // ============================================================
  const handleExport = async (exportType) => {
    const branchId = currentUser?.branch_id || 1;
    setExportLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      let rows = [];
      let filename = `return_data_${new Date().toISOString().slice(0, 10)}.csv`;

      if (exportType === 'returns' || exportType === 'both') {
        const allReturns = getData(RETURNS_KEY, []).filter(r => !r.branchId || r.branchId === branchId);
        rows.push('=== RETURNS ===');
        rows.push(['Return No', 'Invoice No', 'Customer', 'Date', 'Refund', 'Type', 'Reason', 'Items', 'Status'].join(','));
        allReturns.forEach(r => {
          rows.push([r.returnNo, r.invoiceNo, `"${r.customerName}"`, formatDate(r.createdAt), r.totalRefund, r.returnType, r.reason, r.totalItems, r.status].join(','));
        });
        rows.push('');
      }

      if (exportType === 'logs' || exportType === 'both') {
        const allLogs = getData(RETURN_LOGS_KEY, []).filter(l => !l.branchId || l.branchId === branchId);
        if (exportType === 'both') rows.push('=== LOGS ===');
        rows.push(['Action', 'Return No', 'User', 'Role', 'Date', 'Changes'].join(','));
        allLogs.forEach(l => {
          rows.push([l.actionType, l.returnNo, `"${l.createdByName}"`, l.createdByRole, formatDate(l.createdAt), `"${(l.changes || []).join('; ')}"`].join(','));
        });
      }

      const csvContent = rows.join('\n');
      const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
      setTimeout(() => clearSuccess(), 3000);
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
  const validateReturnForm = useCallback(() => {
    const errors = {};
    let isValid = true;
    if (!returnForm.saleId) { errors.saleId = lang === 'mm' ? 'ဘေလ်ရွေးချယ်ပါ' : 'Please select an invoice'; isValid = false; }
    if (!returnForm.returnType) { errors.returnType = lang === 'mm' ? 'ပြန်အပ်နှံမှုအမျိုးအစားရွေးပါ' : 'Please select return type'; isValid = false; }
    if (!returnForm.reason) { errors.reason = lang === 'mm' ? 'အကြောင်းပြချက်ထည့်ပါ' : 'Please enter a reason'; isValid = false; }
    if (returnForm.items.length === 0) { errors.items = lang === 'mm' ? 'ပြန်အပ်မည့်ပစ္စည်းများရွေးပါ' : 'Please select items to return'; isValid = false; }
    if (returnForm.totalRefund <= 0) { errors.totalRefund = lang === 'mm' ? 'ပြန်အမ်းငွေပမာဏမှန်ကန်စွာထည့်ပါ' : 'Please enter a valid refund amount'; isValid = false; }
    setFormErrors(errors);
    return isValid;
  }, [returnForm, lang]);

  // ============================================================
  // ✅ SEARCH INVOICE
  // ============================================================
  const handleSearchInvoice = async () => {
    if (!returnForm.invoiceNo.trim()) {
      alert(lang === 'mm' ? 'ဘေလ်နံပါတ်ထည့်ပါ' : 'Please enter invoice number');
      return;
    }

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 300));

      const branchId = currentUser?.branch_id || 1;
      const sales = getData(SALES_KEY, []);
      const sale = sales.find(s =>
        s.invoiceNo?.toLowerCase() === returnForm.invoiceNo?.toLowerCase().trim() &&
        (!s.branchId || s.branchId === branchId)
      );

      if (sale) {
        setSelectedSale(sale);
        const items = sale.items.map(item => ({
          saleItemId: item.saleItemId || item.id,
          productId: item.productId,
          productName: item.productName,
          barcode: item.barcode,
          sku: item.sku,
          originalQuantity: item.quantity,
          returnQuantity: 0,
          maxReturnable: item.quantity,
          unitPrice: item.price,
          originalPrice: item.originalPrice,
          discountAmount: item.discountAmount || 0,
          subtotal: item.subtotal,
          batchId: item.batchId,
          batchNumber: item.batchNumber,
          purchasePrice: item.purchasePrice,
          returnReason: '',
          isFree: item.isFree || false
        }));

        setReturnItems(items);
        setReturnForm(prev => ({
          ...prev,
          saleId: sale.id,
          invoiceNo: sale.invoiceNo,
          customerName: sale.customerName,
          customerPhone: sale.customerPhone,
          paymentMethod: sale.paymentMethod,
          items: items
        }));
      } else {
        alert(lang === 'mm' ? 'ဘေလ်ရှာမတွေ့ပါ' : 'Invoice not found');
      }
    } catch (err) {
      alert(lang === 'mm' ? 'ဘေလ်ရှာဖွေရာတွင် အမှားရှိနေသည်' : 'Error searching invoice');
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // ✅ RETURN ITEM HANDLERS
  // ============================================================
  const handleReturnItemChange = (saleItemId, returnQty) => {
    const updatedItems = returnItems.map(item => {
      if (item.saleItemId === saleItemId) {
        const qty = Math.min(Math.max(parseInt(returnQty) || 0, 0), item.maxReturnable);
        return { ...item, returnQuantity: qty };
      }
      return item;
    });
    setReturnItems(updatedItems);
    calculateRefundAmounts(updatedItems);
  };

  const calculateRefundAmounts = (items) => {
    const selectedItems = items.filter(item => item.returnQuantity > 0);
    if (selectedItems.length === 0) {
      setReturnForm(prev => ({ ...prev, items, refundAmount: 0, taxRefund: 0, totalRefund: 0 }));
      return;
    }
    let refundSubtotal = 0, originalSubtotal = 0;
    selectedItems.forEach(item => {
      refundSubtotal += (item.unitPrice * item.returnQuantity);
      originalSubtotal += ((item.originalPrice || item.unitPrice) * item.returnQuantity);
    });
    const totalOriginal = selectedItems.reduce((sum, item) => sum + ((item.originalPrice || item.unitPrice) * item.originalQuantity), 0);
    const totalDiscount = selectedItems.reduce((sum, item) => sum + (item.discountAmount || 0), 0);
    const refundDiscount = totalOriginal > 0 ? (originalSubtotal / totalOriginal) * totalDiscount : 0;
    const refundAmount = refundSubtotal - refundDiscount;
    const taxPercentage = selectedSale?.taxPercentage || 0;
    const taxRefund = (refundAmount * taxPercentage) / 100;
    const totalRefund = refundAmount + taxRefund;
    setReturnForm(prev => ({
      ...prev, items,
      refundAmount: Math.round(refundAmount),
      taxRefund: Math.round(taxRefund),
      totalRefund: Math.round(totalRefund)
    }));
  };

  const handleReturnTypeChange = (type) => {
    setReturnForm(prev => ({ ...prev, returnType: type }));
    if (type === 'FULL') {
      const updatedItems = returnItems.map(item => ({ ...item, returnQuantity: item.maxReturnable }));
      setReturnItems(updatedItems);
      calculateRefundAmounts(updatedItems);
    }
  };

  // ============================================================
  // ✅ PROCESS RETURN
  // ============================================================
  const handleProcessReturn = async () => {
    if (!validateReturnForm()) {
      setValidationError(lang === 'mm' ? 'ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ' : 'Please fix the errors in the form');
      return;
    }

    const selectedItems = returnItems.filter(item => item.returnQuantity > 0);
    const selectedSubtotal = returnItems.reduce((sum, item) => {
      if (item.returnQuantity > 0) return sum + (item.unitPrice * item.returnQuantity);
      return sum;
    }, 0);

    const additionalDiscountAmount = (selectedSubtotal * additionalDiscountPercent) / 100;
    const taxPercentage = selectedSale?.taxPercentage || 0;
    const taxableAmount = selectedSubtotal - additionalDiscountAmount;
    const taxRefund = (taxableAmount * taxPercentage) / 100;
    const calculatedTotalRefund = taxableAmount + taxRefund;

    let totalOriginalPrice = 0, totalDiscountedPrice = 0;
    selectedItems.forEach(item => {
      const originalPrice = item.originalPrice || item.unitPrice;
      totalOriginalPrice += originalPrice * item.returnQuantity;
      totalDiscountedPrice += item.unitPrice * item.returnQuantity;
    });
    const productDiscountRefund = totalOriginalPrice - totalDiscountedPrice;

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 400));

      const returns = getData(RETURNS_KEY, []);
      const newId = generateReturnId();
      const newReturnNo = generateReturnNo();
      const branchId = currentUser?.branch_id || 1;

      const newReturn = {
        id: newId,
        returnNo: newReturnNo,
        invoiceNo: returnForm.invoiceNo,
        customerName: returnForm.customerName || '',
        customerPhone: returnForm.customerPhone || '',
        returnType: returnForm.returnType || 'FULL',
        reason: returnForm.reason || 'OTHER',
        refundAmount: selectedSubtotal,
        discountRefund: productDiscountRefund,
        additionalDiscountRefund: additionalDiscountAmount,
        taxRefund: taxRefund,
        totalRefund: calculatedTotalRefund,
        paymentMethod: returnForm.paymentMethod || 'Cash',
        status: 'PENDING',
        totalItems: selectedItems.length,
        totalQuantity: selectedItems.reduce((sum, i) => sum + (i.returnQuantity || 0), 0),
        notes: returnForm.notes || '',
        createdByName: currentUser?.name || 'Current User',
        createdByRole: currentUser?.role || 'Cashier',
        createdAt: new Date().toISOString(),
        branchId,
        items: selectedItems.map((item, idx) => ({
          id: idx + 1,
          productId: item.productId,
          productName: item.productName || '',
          sku: item.sku || '',
          barcode: item.barcode || '',
          quantity: item.returnQuantity || 0,
          unitPrice: item.unitPrice || 0,
          batchId: item.batchId || 0,
          reason: item.returnReason || returnForm.reason
        }))
      };

      returns.unshift(newReturn);
      saveData(RETURNS_KEY, returns);

      addReturnLog({
        actionType: 'RETURN',
        returnNo: newReturn.returnNo,
        returnId: newReturn.id,
        createdByName: newReturn.createdByName,
        createdByRole: newReturn.createdByRole,
        branchId: newReturn.branchId,
        changes: [
          `Return created with ${newReturn.totalItems} item(s)`,
          `Type: ${newReturn.returnType}`,
          `Refund: ${newReturn.totalRefund.toLocaleString()} Ks`
        ]
      });

      setSuccess(true);
      setShowReturnModal(false);
      loadReturns(1, pagination.size, activeTab, searchQuery);
      loadLogs(1, logPagination.size, logFilter, dateFilter);

      window.dispatchEvent(new CustomEvent('inventoryUpdated', {
        detail: { type: 'RETURN', returnId: newReturn.id }
      }));

      setTimeout(() => clearSuccess(), 3000);
      resetReturnForm();
      setAdditionalDiscountPercent(0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetReturnForm = () => {
    setReturnForm({
      saleId: null, invoiceNo: '', customerName: '', customerPhone: '',
      returnType: 'FULL', reason: '', items: [], refundAmount: 0,
      taxRefund: 0, totalRefund: 0, paymentMethod: '', notes: '', status: 'PENDING'
    });
    setReturnItems([]);
    setSelectedSale(null);
    setFormErrors({});
    setValidationError(null);
  };

  // ============================================================
  // ✅ ACTION HANDLERS
  // ============================================================
  const handleAction = (action, returnId) => {
    const returnItem = returnsMap.get(returnId);
    if (action === 'view') {
      setSelectedReturn(returnItem);
      setShowDetailsModal(true);
    } else if (action === 'complete') {
      handleCompleteReturn(returnId);
    } else if (action === 'delete') {
      handleDeleteReturn(returnId);
    }
  };

  const handleCompleteReturn = async (returnId) => {
    const returnItem = returnsMap.get(returnId);
    const confirmMessage = lang === 'mm'
      ? `"${returnItem.returnNo}" ပြန်လည်အပ်နှံမှုကို ပြီးမြောက်သည်အဖြစ် မှတ်သားရန် သေချာပါသလား?`
      : `Mark return "${returnItem.returnNo}" as completed?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 300));

      const returns = getData(RETURNS_KEY, []);
      const idx = returns.findIndex(r => r.id === returnId);
      if (idx === -1) throw new Error('Return not found');

      const oldStatus = returns[idx].status;
      returns[idx] = { ...returns[idx], status: 'COMPLETED', updatedAt: new Date().toISOString() };
      saveData(RETURNS_KEY, returns);

      addReturnLog({
        actionType: 'COMPLETE',
        returnNo: returns[idx].returnNo,
        returnId: returns[idx].id,
        createdByName: currentUser?.name || 'Current User',
        createdByRole: currentUser?.role || 'Cashier',
        branchId: returns[idx].branchId,
        changes: [`Status changed: ${oldStatus} → COMPLETED`]
      });

      setSuccess(true);
      loadReturns(pagination.page, pagination.size, activeTab, searchQuery);
      loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
      setTimeout(() => clearSuccess(), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReturn = async (returnId) => {
    const returnItem = returnsMap.get(returnId);
    const confirmMessage = lang === 'mm'
      ? `"${returnItem.returnNo}" ပြန်လည်အပ်နှံမှုကို ဖျက်ရန် သေချာပါသလား?\n\nမှတ်ချက်: ဤလုပ်ဆောင်ချက်ကို ပြန်လည်ရုပ်သိမ်း၍မရပါ။`
      : `Are you sure you want to delete return "${returnItem.returnNo}"?\n\nNote: This action cannot be undone.`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setLoading(true);
      await new Promise(r => setTimeout(r, 300));

      const returns = getData(RETURNS_KEY, []);
      const target = returns.find(r => r.id === returnId);
      if (!target) throw new Error('Return not found');

      const filtered = returns.filter(r => r.id !== returnId);
      saveData(RETURNS_KEY, filtered);

      addReturnLog({
        actionType: 'DELETE',
        returnNo: target.returnNo,
        returnId: target.id,
        createdByName: currentUser?.name || 'Current User',
        createdByRole: currentUser?.role || 'Cashier',
        branchId: target.branchId,
        changes: [`Return "${target.returnNo}" deleted`]
      });

      setSuccess(true);
      loadReturns(1, pagination.size, activeTab, searchQuery);
      loadLogs(1, logPagination.size, logFilter, dateFilter);
      setTimeout(() => clearSuccess(), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const showLogDetailModal = (log) => {
    setSelectedLog(log);
    setShowLogDetails(true);
  };

  const groupedLogs = useMemo(() => {
    if (!filteredLogs || filteredLogs.length === 0) return {};
    return groupLogsByDate(filteredLogs, lang);
  }, [filteredLogs, lang]);

  // ============================================================
  // ✅ JSX
  // ============================================================
  return (
    <div className="return-container">
      {/* Messages */}
      <div className="cat-messages-container">
        {success && (
          <div className="cat-message success">
            <i className="fas fa-check-circle"></i>
            <span>{lang === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
            <button onClick={clearSuccess}><i className="fas fa-times"></i></button>
          </div>
        )}
        {error && (
          <div className="cat-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button onClick={clearError}><i className="fas fa-times"></i></button>
          </div>
        )}
        {networkError && (
          <div className="return-network-error">
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
      <div className="return-tabs-header">
        <div className="return-tabs-selector">
          <div className="return-select-container">
            <i className={`fas ${
              activeTab === 'all-returns' ? 'fa-undo-alt' :
              activeTab === 'pending' ? 'fa-clock' :
              activeTab === 'processing' ? 'fa-cogs' :
              activeTab === 'completed' ? 'fa-check-circle' :
              'fa-history'
            } return-select-icon`}></i>
            <select
              className="return-tab-select"
              value={activeTab}
              onChange={handleTabChange}
              disabled={loading || tableLoading}
            >
              <option value="all-returns">
                {lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုအားလုံး' : 'All Returns'} ({statusCounts.all || 0})
              </option>
              <option value="pending">
                {lang === 'mm' ? 'စောင့်ဆိုင်း' : 'Pending'} ({statusCounts.pending || 0})
              </option>
              <option value="completed">
                {lang === 'mm' ? 'ပြီးမြောက်' : 'Completed'} ({statusCounts.completed || 0})
              </option>
              <option value="history">
                {lang === 'mm' ? 'မှတ်တမ်း' : 'History'} ({actionTypeCounts.all || 0})
              </option>
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>
                {lang === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
              </option>
            </select>
            <i className="fas fa-chevron-down return-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' && (
          <>
            <div className="return-search-controls">
              <div className="return-search-input-group">
                <i className="fas fa-search return-search-icon"></i>
                <input
                  type="text"
                  className="return-search-input"
                  placeholder={lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုနံပါတ်၊ ဘေလ်နံပါတ်...' : 'Search by return no, invoice no...'}
                  value={searchQuery}
                  onChange={handleSearchChange}
                  disabled={tableLoading}
                />
                {searchQuery && (
                  <button className="return-clear-search-btn" onClick={() => setSearchQueryAction('')} disabled={tableLoading}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
            </div>

            <button
              className="return-add-btn"
              onClick={() => setShowReturnModal(true)}
              disabled={tableLoading}
            >
              <i className="fas fa-undo-alt"></i>
              {lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုအသစ်' : 'New Return'}
            </button>
          </>
        )}
      </div>

      <div className="subtab-content active">
        {activeTab === 'history' ? (
          /* ===== HISTORY TAB ===== */
          <div className="return-history-section">
            <div className="return-section-title">
              <div className="return-title-row">
                <div className="return-title-left">
                  <i className="fas fa-history"></i>
                  <span className="return-title-text">{lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုမှတ်တမ်း' : 'Return History'}</span>
                </div>
                <div className="return-title-center">
                  <div className="return-compact-nav">
                    <button
                      className={`return-nav-btn ${loading ? 'loading' : ''}`}
                      onClick={() => changeHistoryPage(logPagination.page - 1, 'prev')}
                      disabled={logPagination.page === 1 || loading}
                    >
                      {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="return-page-control">
                      <input
                        type="text"
                        className="return-page-input"
                        value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => {
                          const value = parseInt(historyPageInputValue, 10);
                          if (!isNaN(value) && value >= 1 && value <= logPagination.totalPages && value !== logPagination.page) {
                            changeHistoryPage(value, 'jump');
                          } else {
                            setHistoryPageInputValue(logPagination.page.toString());
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={loading}
                      />
                      <span className="return-page-total">/ {logPagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button
                      className={`return-nav-btn ${loading ? 'loading' : ''}`}
                      onClick={() => changeHistoryPage(logPagination.page + 1, 'next')}
                      disabled={logPagination.page === logPagination.totalPages || logPagination.totalPages === 0 || loading}
                    >
                      {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="return-items-per-page">
                      <select className="return-per-page-select" value={logPagination.size} onChange={handleLogPageSizeChange} disabled={loading}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="return-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="return-title-right">
                  {loading ? (
                    <span className="return-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="return-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="return-showing-count">
                      <span className="return-count-numbers">{logPagination.total > 0 ? ((logPagination.page - 1) * logPagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="return-count-numbers">{Math.min(logPagination.page * logPagination.size, logPagination.total)}</span>
                      <span> / </span>
                      <span className="return-count-numbers">{logPagination.total.toLocaleString()}</span>
                      <span className="return-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="return-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="return-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button className={`return-filter-tab ${logFilter === 'all' ? 'active' : ''}`} onClick={() => { setLogFilterAction('all'); setHistoryPageInputValue('1'); }} disabled={loading}>
                    {lang === 'mm' ? 'အားလုံး' : 'All'} <span className="return-filter-count">({actionTypeCounts.all || 0})</span>
                  </button>
                  <button className={`return-filter-tab ${logFilter === 'RETURN' ? 'active' : ''}`} onClick={() => { setLogFilterAction('RETURN'); setHistoryPageInputValue('1'); }} disabled={loading}>
                    <i className="fas fa-undo-alt"></i> {lang === 'mm' ? 'ပြန်အပ်နှံ' : 'Return'} <span className="return-filter-count">({actionTypeCounts.RETURN || 0})</span>
                  </button>
                  <button className={`return-filter-tab ${logFilter === 'DELETE' ? 'active' : ''}`} onClick={() => { setLogFilterAction('DELETE'); setHistoryPageInputValue('1'); }} disabled={loading}>
                    <i className="fas fa-trash"></i> {lang === 'mm' ? 'ဖျက်' : 'Delete'} <span className="return-filter-count">({actionTypeCounts.DELETE || 0})</span>
                  </button>
                </div>

                <div className="return-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button className={`return-filter-tab ${dateFilter.filter === 'all' ? 'active' : ''}`} onClick={() => handleDateFilterChange('all')} disabled={loading}>
                    {lang === 'mm' ? 'အချိန်အားလုံး' : 'All Time'}
                  </button>
                  <button className={`return-filter-tab ${dateFilter.filter === 'today' ? 'active' : ''}`} onClick={() => handleDateFilterChange('today')} disabled={loading}>
                    {lang === 'mm' ? 'ယနေ့' : 'Today'}
                  </button>
                  <button className={`return-filter-tab ${dateFilter.filter === 'yesterday' ? 'active' : ''}`} onClick={() => handleDateFilterChange('yesterday')} disabled={loading}>
                    {lang === 'mm' ? 'မနေ့က' : 'Yesterday'}
                  </button>
                  <button className={`return-filter-tab ${dateFilter.filter === 'thisWeek' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisWeek')} disabled={loading}>
                    {lang === 'mm' ? 'ဒီအပတ်' : 'This Week'}
                  </button>
                  <button className={`return-filter-tab ${dateFilter.filter === 'thisMonth' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisMonth')} disabled={loading}>
                    {lang === 'mm' ? 'ဒီလ' : 'This Month'}
                  </button>
                  <button className={`return-filter-tab ${dateFilter.filter === 'custom' ? 'active' : ''}`} onClick={() => handleDateFilterChange('custom')} disabled={loading}>
                    <i className="fas fa-calendar"></i> {lang === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
                  </button>
                  {dateFilter.filter !== 'all' && (
                    <button className="return-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }} disabled={loading}>
                      <i className="fas fa-times"></i> {lang === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>

              {showDatePicker && (
                <div className="return-custom-date-picker">
                  <div className="return-date-picker-row">
                    <label>{lang === 'mm' ? 'မှ' : 'From:'}</label>
                    <input type="date" className="return-date-input" value={tempCustomFrom} onChange={(e) => handleTempCustomDateChange('from', e.target.value)} />
                  </div>
                  <div className="return-date-picker-row">
                    <label>{lang === 'mm' ? 'ထိ' : 'To:'}</label>
                    <input type="date" className="return-date-input" value={tempCustomTo} onChange={(e) => handleTempCustomDateChange('to', e.target.value)} />
                  </div>
                  <button className="return-apply-date-btn" onClick={applyCustomDateFilter} disabled={!tempCustomFrom || !tempCustomTo}>
                    <i className="fas fa-check"></i> {lang === 'mm' ? 'အတည်ပြုရန်' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="return-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p></div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="return-date-group">
                    <div className="return-date-header">
                      <span className="return-date-label">{date}</span>
                      <span className="return-date-count">{dateLogs.length} {lang === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}</span>
                    </div>
                    <div className="return-logs-list">
                      {dateLogs.map(log => (
                        <div
                          key={log.id}
                          className={`return-compact-log-entry log-${log.actionType?.toLowerCase()}`}
                          onClick={() => showLogDetailModal(log)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="return-log-icon" style={{ color: getActionColor(log.actionType) }}>
                            <i className={`fas ${getActionIcon(log.actionType)}`}></i>
                          </div>
                          <div className="return-log-content">
                            <div className="return-log-main-info">
                              <span className="return-log-action">
                                {log.actionType === 'RETURN' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံခြင်း' : 'Return Processed')}
                                {log.actionType === 'UPDATE' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုပြင်ဆင်ခြင်း' : 'Return Updated')}
                                {log.actionType === 'COMPLETE' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုပြီးမြောက်ခြင်း' : 'Return Completed')}
                                {log.actionType === 'DELETE' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုဖျက်ခြင်း' : 'Return Deleted')}
                              </span>
                              {log.returnNo && (
                                <span className="return-log-return">
                                  "{log.returnNo}"{log.returnId && <span className="return-return-id">#{log.returnId}</span>}
                                </span>
                              )}
                            </div>

                            <div className="return-log-details">
                              <span className="return-log-user">
                                <i className="fas fa-user"></i> <strong>{log.createdByName || 'Unknown'}</strong>
                                <span className="return-user-role">({log.createdByRole || 'N/A'})</span>
                              </span>
                              <span className="return-log-time">
                                <i className="fas fa-clock"></i> {log.timestamp}
                              </span>
                              {log.changes && log.changes.length > 0 && (
                                <span className="return-log-detail-count">
                                  <i className="fas fa-list"></i> {log.changes.length} {lang === 'mm' ? 'ခု ပြောင်းလဲမှု' : 'changes'}
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
                  <p>{lang === 'mm' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် လုပ်ဆောင်ချက်များ မတွေ့ပါ။' : 'No activities found for the selected filter.'}</p>
                  {dateFilter.filter !== 'all' && (
                    <button className="return-clear-search-btn secondary" onClick={clearDateFilter}>
                      {lang === 'mm' ? 'စစ်ထုတ်မှုများ ရှင်းလင်းရန်' : 'Clear Filters'}
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== RETURNS TAB ===== */
          <>
            <div className="return-section-title">
              <div className="return-title-row">
                <div className="return-title-left">
                  <i className="fas fa-undo-alt"></i>
                  <span className="return-title-text">
                    {activeTab === 'all-returns' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုအားလုံး' : 'All Returns')}
                    {activeTab === 'pending' && (lang === 'mm' ? 'စောင့်ဆိုင်းနေသော ပြန်လည်အပ်နှံမှုများ' : 'Pending Returns')}
                    {activeTab === 'processing' && (lang === 'mm' ? 'လုပ်ဆောင်ဆဲ ပြန်လည်အပ်နှံမှုများ' : 'Processing Returns')}
                    {activeTab === 'completed' && (lang === 'mm' ? 'ပြီးမြောက်သော ပြန်လည်အပ်နှံမှုများ' : 'Completed Returns')}
                  </span>
                </div>

                <div className="return-title-center">
                  <div className="return-compact-nav">
                    <button className={`return-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page - 1, 'prev')} disabled={pagination.page === 1 || tableLoading}>
                      {tableLoading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="return-page-control">
                      <input type="text" className="return-page-input" value={pageInputValue} onChange={(e) => setPageInputValue(e.target.value)} onBlur={() => { const value = parseInt(pageInputValue, 10); if (!isNaN(value) && value >= 1 && value <= pagination.totalPages && value !== pagination.page) { changePage(value, 'jump'); } else { setPageInputValue(pagination.page.toString()); } }} onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={tableLoading} />
                      <span className="return-page-total">/ {pagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`return-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page + 1, 'next')} disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || tableLoading}>
                      {tableLoading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="return-items-per-page">
                      <select className="return-per-page-select" value={pagination.size} onChange={handlePageSizeChange} disabled={tableLoading}>
                        <option value={10}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="return-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>

                <div className="return-title-right">
                  {tableLoading ? (
                    <span className="return-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="return-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="return-showing-count">
                      <span className="return-count-numbers">{pagination.total > 0 ? ((pagination.page - 1) * pagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="return-count-numbers">{Math.min(pagination.page * pagination.size, pagination.total)}</span>
                      <span> / </span>
                      <span className="return-count-numbers">{pagination.total.toLocaleString()}</span>
                      <span className="return-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>

              {searchQuery && (
                <div className="return-search-badge-container">
                  <span className="return-search-badge"><i className="fas fa-search"></i> "{searchQuery}"</span>
                </div>
              )}
            </div>

            <div className="return-table-wrapper" ref={tableBodyRef}>
              <table className="return-table">
                <thead>
                  <tr>
                    <th>{lang === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{lang === 'mm' ? 'ပြန်အပ်နှံမှုနံပါတ်' : 'Return No'}</th>
                    <th>{lang === 'mm' ? 'ဘေလ်နံပါတ်' : 'Invoice No'}</th>
                    <th>{lang === 'mm' ? 'ဝယ်ယူသူ' : 'Customer'}</th>
                    <th>{lang === 'mm' ? 'ရက်စွဲ' : 'Date'}</th>
                    <th>{lang === 'mm' ? 'ပြန်အမ်းငွေ' : 'Refund'}</th>
                    <th>{lang === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                    <th>{lang === 'mm' ? 'အကြောင်းပြချက်' : 'Reason'}</th>
                    <th>{lang === 'mm' ? 'ပစ္စည်းအရေအတွက်' : 'Items'}</th>
                    <th>{lang === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{lang === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="11" className="return-no-data"><div className="return-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading data...'}</p></div></td></tr>
                  ) : filteredReturns.length > 0 ? (
                    filteredReturns.map((returnItem, index) => (
                      <tr key={returnItem.id}>
                        <td>{((pagination.page - 1) * pagination.size) + index + 1}</td>
                        <td><strong>{returnItem.returnNo}</strong></td>
                        <td>{returnItem.invoiceNo}</td>
                        <td>{returnItem.customerName}</td>
                        <td>{formatDate(returnItem.createdAt)}</td>
                        <td><strong style={{ color: '#4cc9f0' }}>{formatCurrency(returnItem.totalRefund)}</strong></td>
                        <td><span className="return-type-badge" style={{ backgroundColor: returnItem.returnType === 'FULL' ? '#4361ee' : '#f8961e' }}>{returnItem.returnType === 'FULL' ? (lang === 'mm' ? 'အားလုံး' : 'Full') : (lang === 'mm' ? 'တစ်စိတ်တစ်ပိုင်း' : 'Partial')}</span></td>
                        <td><div className="return-reason-cell" title={returnItem.reason}>{returnItem.reason?.length > 30 ? returnItem.reason.substring(0, 30) + '...' : returnItem.reason}</div></td>
                        <td>
                          <span className="return-items-badge">{returnItem.totalItems || 0}</span>
                          <span className="return-items-total"> ({returnItem.totalQuantity || 0}){lang === "mm" ? "ခု" : "pcs"}</span>
                        </td>
                        <td><span className="return-status-badge" style={{ backgroundColor: getStatusColor(returnItem.status) }}>{returnItem.status === 'PENDING' && (lang === 'mm' ? 'စောင့်ဆိုင်း' : 'Pending')}{returnItem.status === 'PROCESSING' && (lang === 'mm' ? 'လုပ်ဆောင်ဆဲ' : 'Processing')}{returnItem.status === 'COMPLETED' && (lang === 'mm' ? 'ပြီးမြောက်' : 'Completed')}{returnItem.status === 'REJECTED' && (lang === 'mm' ? 'ပယ်ချ' : 'Rejected')}</span></td>
                        <td>
                          <div className="return-action-buttons">
                            <button
                              className="return-action-btn return-action-view"
                              title={lang === 'mm' ? 'အသေးစိတ်ကြည့်ရန်' : 'View Details'}
                              onClick={() => handleAction('view', returnItem.id)}
                              disabled={loading}
                            >
                              <i className="fas fa-eye"></i>
                            </button>
                            {returnItem.status !== 'COMPLETED' && (
                              <button
                                className="return-action-btn return-action-complete"
                                title={lang === 'mm' ? 'ပြီးမြောက်စေရန်' : 'Complete'}
                                onClick={() => handleAction('complete', returnItem.id)}
                                disabled={loading}
                              >
                                <i className="fas fa-check"></i>
                              </button>
                            )}
                            <button
                              className="return-action-btn return-action-delete"
                              title={lang === 'mm' ? 'ဖျက်ရန်' : 'Delete'}
                              onClick={() => handleAction('delete', returnItem.id)}
                              disabled={loading}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="11" className="return-no-data"><div className="return-no-data-content"><i className="fas fa-undo-alt"></i><p>{searchQuery ? (lang === 'mm' ? `"${searchQuery}" အတွက် ပြန်လည်အပ်နှံမှုများ မတွေ့ပါ` : `No returns found for "${searchQuery}"`) : (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုများ မတွေ့ပါ' : 'No returns found')}</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Return Modal */}
      <ReturnModal
        show={showReturnModal}
        onClose={() => {
          setShowReturnModal(false);
          resetReturnForm();
          setAdditionalDiscountPercent(0);
        }}
        returnForm={returnForm}
        returnItems={returnItems}
        selectedSale={selectedSale}
        onFormChange={(e) => setReturnForm(prev => ({ ...prev, [e.target.name]: e.target.value }))}
        onInvoiceSearch={handleSearchInvoice}
        onReturnTypeChange={handleReturnTypeChange}
        onItemChange={handleReturnItemChange}
        onReasonChange={(saleItemId, reason) => {
          const updatedItems = returnItems.map(item =>
            item.saleItemId === saleItemId ? { ...item, returnReason: reason } : item
          );
          setReturnItems(updatedItems);
        }}
        onProcessReturn={handleProcessReturn}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={lang}
        formatCurrency={formatCurrency}
        additionalDiscountPercent={additionalDiscountPercent}
        onAdditionalDiscountChange={setAdditionalDiscountPercent}
      />

      {/* Return Details Modal */}
      {showDetailsModal && selectedReturn && (
        <ReturnDetailsModal
          show={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          returnData={selectedReturn}
          language={lang}
          formatCurrency={formatCurrency}
          formatDate={formatDate}
        />
      )}

      <ReturnExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
        language={lang}
      />

      {/* Log Details Modal */}
      {showLogDetails && selectedLog && (
        <div className="return-modal-overlay">
          <div className="return-modal-content" style={{ maxWidth: '600px' }}>
            <div className="return-modal-header">
              <h3>
                <i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i>
                {lang === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}
              </h3>
              <button className="return-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="return-modal-body">
              <div className="return-log-detail-header">
                <div className="return-log-detail-main">
                  <div className="return-log-detail-action">
                    <span className={`return-action-badge return-action-${selectedLog.actionType?.toLowerCase()}`}>
                      <i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i>
                      {selectedLog.actionType === 'RETURN' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံခြင်း' : 'Return Processed')}
                      {selectedLog.actionType === 'UPDATE' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုပြင်ဆင်ခြင်း' : 'Return Updated')}
                      {selectedLog.actionType === 'COMPLETE' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုပြီးမြောက်ခြင်း' : 'Return Completed')}
                      {selectedLog.actionType === 'DELETE' && (lang === 'mm' ? 'ပြန်လည်အပ်နှံမှုဖျက်ခြင်း' : 'Return Deleted')}
                    </span>
                  </div>
                  {selectedLog.returnNo && (
                    <div className="return-log-detail-return">
                      <i className="fas fa-undo-alt"></i>
                      <span className="return-return-name">"{selectedLog.returnNo}"</span>
                      {selectedLog.returnId && <span className="return-return-id-detail">ID: #{selectedLog.returnId}</span>}
                    </div>
                  )}
                </div>

                <div className="return-log-detail-meta">
                  <div className="return-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="return-user-name-detail"><strong>{selectedLog.createdByName || 'Unknown'}</strong></div>
                      <div className="return-user-role-detail">{selectedLog.createdByRole || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="return-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="return-log-date-detail">{selectedLog.date}</div>
                      <div className="return-log-time-detail">{selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="return-log-detail-content">
                <h4>{lang === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="return-change-list">
                    {selectedLog.changes.map((detail, index) => {
                      const colonIndex = detail.indexOf(':');
                      if (colonIndex !== -1) {
                        const label = detail.substring(0, colonIndex + 1);
                        const value = detail.substring(colonIndex + 1);
                        return (
                          <div key={index} className="return-change-item">
                            <i className="fas fa-chevron-right"></i>
                            <span><strong>{label}</strong>{value}</span>
                          </div>
                        );
                      }
                      const hasArrow = detail.includes('→');
                      if (hasArrow) {
                        const parts = detail.split('→');
                        return (
                          <div key={index} className="return-change-item">
                            <i className="fas fa-chevron-right"></i>
                            <span>
                              {parts[0]}
                              <strong className="change-arrow"> → </strong>
                              {parts[1]}
                            </span>
                          </div>
                        );
                      }
                      return (
                        <div key={index} className="return-change-item">
                          <span>{detail}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="return-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>{lang === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No specific changes recorded'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="return-modal-footer">
              <button className="return-btn-cancel" onClick={() => setShowLogDetails(false)}>
                {lang === 'mm' ? 'ပိတ်ရန်' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserReturnPage;