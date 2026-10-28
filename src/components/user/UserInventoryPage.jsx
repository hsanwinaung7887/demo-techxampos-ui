// UserInventoryPage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import "../../light-style/user-css/userInventoryPage.css";
import AddStockModal from './AddStockModal';
import InventoryExportModal from './InventoryExportModal';
import { useSelector } from 'react-redux';

// ============================================================
// ✅ JSON SEED DATA
// ============================================================
const PRODUCTS_KEY = "demo_products";
const BATCHES_KEY = "demo_inventory_batches";
const INV_LOGS_KEY = "demo_inventory_logs";

// ✅ Placeholder SVG ပုံ
const makeImage = (letter, bg = "#4361ee") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="120" height="120" rx="12" fill="${bg}"/>
      <text x="50%" y="55%" font-family="Arial" font-size="52" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    </svg>`)}`;

// ✅ Seed Products
const SEED_PRODUCTS = [
  { id: 1, name: "ကီးဘုတ်",       description: "စံကီးဘုတ် USB",       barcode: "120215421001", sku: "PRD-001", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "pcs",    costPrice: 8000, sellingPrice: 12000, minStock: 5,  totalStock: 25, status: "Active",   notes: "",         image: makeImage("က", "#4361ee"), createdAt: new Date(Date.now() - 9*86400000).toISOString() },
  { id: 2, name: "မောက်စ်",        description: "ကြိုးမဲ့ မောက်စ်",        barcode: "120215421002", sku: "PRD-002", categoryId: 1, categoryName: "အီလက်ထရောနစ်",  unit: "pcs",    costPrice: 5000, sellingPrice: 8500,  minStock: 5,  totalStock: 3,  status: "Active",   notes: "",         image: makeImage("မ", "#10b981"), createdAt: new Date(Date.now() - 7*86400000).toISOString() },
  { id: 3, name: "စာအုပ်မှတ်စု",   description: "A5 မှတ်စုစာအုပ်",      barcode: "120215421003", sku: "PRD-003", categoryId: 5, categoryName: "စာရေးကိရိယာ", unit: "ခု",     costPrice: 1500, sellingPrice: 2500,  minStock: 10, totalStock: 50, status: "Active",   notes: "",         image: makeImage("စ", "#f59e0b"), createdAt: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 4, name: "ဖောင်တိန်",      description: "အပြာရောင် ဖောင်တိန်",    barcode: "120215421004", sku: "PRD-004", categoryId: 5, categoryName: "စာရေးကိရိယာ", unit: "ချောင်း", costPrice: 800,  sellingPrice: 1500,  minStock: 20, totalStock: 0,  status: "Inactive", notes: "ပစ္စည်းပြတ်", image: makeImage("ဖ", "#f72585"), createdAt: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 5, name: "ရေသောက်ဗူး",    description: "စတီးရေဗူး 1L",         barcode: "120215421005", sku: "PRD-005", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း", unit: "ဗူး",    costPrice: 3500, sellingPrice: 5000,  minStock: 10, totalStock: 18, status: "Active",   notes: "",         image: makeImage("ရ", "#8b5cf6"), createdAt: new Date(Date.now() - 1*86400000).toISOString() },
];

// ✅✅✅ SEED BATCHES
const SEED_BATCHES = {
  1: [
    { id: 101, productId: 1, batchNumber: "B-1", purchasePrice: 8000, quantity: 20, remaining: 18, dateReceived: new Date(Date.now() - 9*86400000).toISOString().split('T')[0], expiryDate: null, supplier: "ABC Electronics", location: "A-01-01", notes: "", createdAt: new Date(Date.now() - 9*86400000).toISOString() },
    { id: 102, productId: 1, batchNumber: "B-2", purchasePrice: 8200, quantity: 10, remaining: 7,  dateReceived: new Date(Date.now() - 5*86400000).toISOString().split('T')[0], expiryDate: null, supplier: "XYZ Trading",     location: "A-01-02", notes: "", createdAt: new Date(Date.now() - 5*86400000).toISOString() },
  ],
  2: [
    { id: 201, productId: 2, batchNumber: "B-1", purchasePrice: 5000, quantity: 10, remaining: 3, dateReceived: new Date(Date.now() - 7*86400000).toISOString().split('T')[0], expiryDate: null, supplier: "ABC Electronics", location: "A-02-01", notes: "", createdAt: new Date(Date.now() - 7*86400000).toISOString() },
  ],
  3: [
    { id: 301, productId: 3, batchNumber: "B-1", purchasePrice: 1500, quantity: 30, remaining: 25, dateReceived: new Date(Date.now() - 5*86400000).toISOString().split('T')[0], expiryDate: null, supplier: "Stationery World", location: "B-01-01", notes: "", createdAt: new Date(Date.now() - 5*86400000).toISOString() },
    { id: 302, productId: 3, batchNumber: "B-2", purchasePrice: 1600, quantity: 25, remaining: 25, dateReceived: new Date(Date.now() - 2*86400000).toISOString().split('T')[0], expiryDate: null, supplier: "Book Mart",        location: "B-01-02", notes: "", createdAt: new Date(Date.now() - 2*86400000).toISOString() },
  ],
  4: [
    { id: 401, productId: 4, batchNumber: "B-1", purchasePrice: 800, quantity: 20, remaining: 0, dateReceived: new Date(Date.now() - 10*86400000).toISOString().split('T')[0], expiryDate: null, supplier: "Stationery World", location: "B-02-01", notes: "", createdAt: new Date(Date.now() - 10*86400000).toISOString() },
  ],
  5: [
    { id: 501, productId: 5, batchNumber: "B-1", purchasePrice: 3500, quantity: 18, remaining: 18, dateReceived: new Date(Date.now() - 1*86400000).toISOString().split('T')[0], expiryDate: null, supplier: "Home Plus", location: "C-01-01", notes: "", createdAt: new Date(Date.now() - 1*86400000).toISOString() },
  ],
};

// ✅ Seed Logs
const SEED_LOGS = [
  { id: 1, actionType: "ADD_BATCH", productId: 1, productName: "ကီးဘုတ်",     createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 9*86400000).toISOString(), changes: ["အမည်: ကီးဘုတ်", "အရေအတွက်: 20", "ဝယ်ဈေး: 8,000 MMK", "စုစုပေါင်းကုန်ကျစရိတ်: 160,000 MMK"] },
  { id: 2, actionType: "ADD_BATCH", productId: 3, productName: "စာအုပ်မှတ်စု", createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 5*86400000).toISOString(), changes: ["အမည်: စာအုပ်မှတ်စု", "အရေအတွက်: 30", "ဝယ်ဈေး: 1,500 MMK", "စုစုပေါင်းကုန်ကျစရိတ်: 45,000 MMK"] },
  { id: 3, actionType: "ADD_BATCH", productId: 5, productName: "ရေသောက်ဗူး",  createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 1*86400000).toISOString(), changes: ["အမည်: ရေသောက်ဗူး", "အရေအတွက်: 18", "ဝယ်ဈေး: 3,500 MMK", "စုစုပေါင်းကုန်ကျစရိတ်: 63,000 MMK"] },
];

// ============================================================
// ✅ getData — empty array/object ဆိုရင်လည်း seed ထည့်
// ============================================================
const getData = (key, seed) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);

    // Empty array → seed
    if (Array.isArray(parsed) && parsed.length === 0) {
      if (Array.isArray(seed) && seed.length > 0) {
        localStorage.setItem(key, JSON.stringify(seed));
        return seed;
      }
    }
    // Empty object → seed
    if (!Array.isArray(parsed) && typeof parsed === 'object' && parsed !== null) {
      if (Object.keys(parsed).length === 0) {
        if (!Array.isArray(seed) && typeof seed === 'object' && seed !== null && Object.keys(seed).length > 0) {
          localStorage.setItem(key, JSON.stringify(seed));
          return seed;
        }
      }
    }
    return parsed;
  } catch {
    return seed;
  }
};
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ✅ format helpers
const formatCurrency = (n) => (n?.toLocaleString() || '0') + ' MMK';
const formatDate = (iso, lang) => {
  try { return new Date(iso).toLocaleDateString(lang === 'mm' ? 'my-MM' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' }); }
  catch { return ''; }
};
const formatDateTime = (iso, lang) => {
  try { return new Date(iso).toLocaleString(lang === 'mm' ? 'my-MM' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return ''; }
};

// ============================================================
// ✅ COMPONENT
// ============================================================
const UserInventoryPage = () => {
  const navigate = useNavigate();

  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("appLanguage") || localStorage.getItem("pos-language");
    if (stored) return stored;
    localStorage.setItem("appLanguage", "mm");
    return "mm";
  });

  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const currentUser = useMemo(() => {
    if (reduxUser && isAuthenticated) return reduxUser;
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, [reduxUser, isAuthenticated]);

  // ===== Local States =====
  const [products, setProducts] = useState([]);
  const [batches, setBatches] = useState({});
  const [logs, setLogs] = useState([]);

  const [activeTab, setActiveTab] = useState("all-products");
  const [searchQuery, setSearchQuery] = useState("");
  const [logFilter, setLogFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ filter: "all", customFrom: "", customTo: "" });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  // ===== UI States =====
  const [showQuickView, setShowQuickView] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showAddBatchModal, setShowAddBatchModal] = useState(false);
  const [showBatchAdjustModal, setShowBatchAdjustModal] = useState(false);
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedLog, setSelectedLog] = useState(null);
  const [isAdjustingStock, setIsAdjustingStock] = useState(false);
  const [isAdjustingBatch, setIsAdjustingBatch] = useState(false);
  const [isAddingBatch, setIsAddingBatch] = useState(false);
  const [isEditingBatch, setIsEditingBatch] = useState(false);
  const [batchPageInput, setBatchPageInput] = useState("1");
  const [batchPage, setBatchPage] = useState(1);
  const [batchPageSize, setBatchPageSize] = useState(10);
  const [showAddStockModal, setShowAddStockModal] = useState(false);

  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  const [editForm, setEditForm] = useState({ location: '', supplier: '', notes: '', purchasePrice: '' });
  const [adjustmentForm, setAdjustmentForm] = useState({ adjustmentType: 'ADJUSTMENT', quantity: '', reason: '', reference: '', notes: '' });
  const [batchForm, setBatchForm] = useState({
    batchNumber: '', purchasePrice: '', quantity: '',
    dateReceived: new Date().toISOString().split('T')[0],
    expiryDate: '', supplier: '', location: '', notes: ''
  });
  const [batchAdjustForm, setBatchAdjustForm] = useState({ quantity: '', reasonType: 'WRONG_COUNT', reason: '', notes: '' });

  const reasonOptions = [
    { value: 'WRONG_COUNT', label: { mm: 'မှားယွင်းရေတွက်ခြင်း', en: 'Wrong Count' } },
    { value: 'DAMAGED', label: { mm: 'ပျက်စီးခြင်း', en: 'Damaged' } },
    { value: 'EXPIRED', label: { mm: 'သက်တမ်းကုန်ဆုံး', en: 'Expired' } },
    { value: 'LOST', label: { mm: 'ပျောက်ဆုံးခြင်း', en: 'Lost' } },
    { value: 'STOLEN', label: { mm: 'ခိုးယူခံရခြင်း', en: 'Stolen' } },
    { value: 'RETURNED', label: { mm: 'ပြန်လည်အပ်နှံခြင်း', en: 'Returned' } },
    { value: 'FOUND', label: { mm: 'ပြန်တွေ့ခြင်း', en: 'Found' } },
    { value: 'QUALITY_ISSUE', label: { mm: 'အရည်အသွေးပြဿနာ', en: 'Quality Issue' } },
    { value: 'TRANSFER_IN', label: { mm: 'အခြားဆိုင်မှလက်ခံ', en: 'Transfer In' } },
    { value: 'TRANSFER_OUT', label: { mm: 'အခြားဆိုင်သို့ရွှေ့ပြောင်း', en: 'Transfer Out' } },
    { value: 'OTHER', label: { mm: 'အခြား', en: 'Other' } }
  ];

  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);

  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);

  // ✅ Language listener
  useEffect(() => {
    const handler = (e) => setLanguage(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);

  // ✅ Initial load
  useEffect(() => {
    setTableLoading(true);
    const t = setTimeout(() => {
      setProducts(getData(PRODUCTS_KEY, SEED_PRODUCTS));
      setBatches(getData(BATCHES_KEY, SEED_BATCHES));
      setLogs(getData(INV_LOGS_KEY, SEED_LOGS));
      setTableLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // ===== Filtered products =====
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeTab === 'in-stock') list = list.filter(p => (p.totalStock || 0) > 10);
    else if (activeTab === 'low-stock') list = list.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) <= 10);
    else if (activeTab === 'out-of-stock') list = list.filter(p => (p.totalStock || 0) === 0);
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        p.categoryName?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, activeTab, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ===== Status counts =====
  const statusCounts = useMemo(() => {
    const inStock = products.filter(p => (p.totalStock || 0) > 10).length;
    const lowStock = products.filter(p => (p.totalStock || 0) > 0 && (p.totalStock || 0) <= 10).length;
    const outOfStock = products.filter(p => (p.totalStock || 0) === 0).length;
    return { all: products.length, inStock, lowStock, outOfStock, damaged: 0 };
  }, [products]);

  // ✅✅✅ TOTAL PURCHASE VALUE — Product တစ်ခုချင်းစီရဲ့ batch cost ကို ပေါင်း
  const totalPurchaseValue = useMemo(() => {
    let total = 0;
    products.forEach(p => {
      const list = batches[p.id] || [];
      list.forEach(b => {
        total += (b.purchasePrice || 0) * (b.remaining || 0);
      });
    });
    return total;
  }, [products, batches]);

  // ===== Filtered logs =====
  const filteredLogs = useMemo(() => {
    let list = [...logs];
    if (logFilter !== "all") list = list.filter(l => l.actionType === logFilter);
    if (dateFilter.filter !== "all") {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yest = new Date(today); yest.setDate(yest.getDate() - 1);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);
      list = list.filter(l => {
        const d = new Date(l.createdAt);
        switch (dateFilter.filter) {
          case "today": return d >= today;
          case "yesterday": return d >= yest && d < today;
          case "thisWeek": return d >= weekAgo;
          case "thisMonth": return d >= monthAgo;
          case "custom":
            if (dateFilter.customFrom && dateFilter.customTo) {
              const from = new Date(dateFilter.customFrom);
              const to = new Date(dateFilter.customTo); to.setHours(23, 59, 59, 999);
              return d >= from && d <= to;
            }
            return true;
          default: return true;
        }
      });
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [logs, logFilter, dateFilter]);

  const logTotalPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize));
  const safeLogPage = Math.min(logPage, logTotalPages);
  const pagedLogs = filteredLogs.slice((safeLogPage - 1) * logPageSize, safeLogPage * logPageSize);

  const groupedLogs = useMemo(() => {
    const grouped = {};
    pagedLogs.forEach(log => {
      const key = formatDate(log.createdAt, language);
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    });
    return grouped;
  }, [pagedLogs, language]);

  const logCounts = useMemo(() => ({
    all: logs.length,
    ADD_BATCH: logs.filter(l => l.actionType === "ADD_BATCH").length,
    ADJUST_BATCH: logs.filter(l => l.actionType === "ADJUST_BATCH").length,
    UPDATE_BATCH: logs.filter(l => l.actionType === "UPDATE_BATCH").length,
    DELETE_BATCH: logs.filter(l => l.actionType === "DELETE_BATCH").length,
    RETURN: logs.filter(l => l.actionType === "RETURN").length,
    DAMAGE: logs.filter(l => l.actionType === "DAMAGE").length,
  }), [logs]);

  // ===== Logging =====
  const logAction = (actionType, product, changes) => {
    const newLog = {
      id: logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      actionType,
      productId: product?.id,
      productName: product?.name,
      createdByName: currentUser?.fullName || currentUser?.username || "မသိသော အသုံးပြုသူ",
      createdByRole: currentUser?.role || "N/A",
      createdAt: new Date().toISOString(),
      changes,
    };
    const updated = [...logs, newLog];
    setLogs(updated);
    saveData(INV_LOGS_KEY, updated);
  };

  // ===== Batches for current product =====
  const currentBatches = useMemo(() => {
    if (!selectedProduct) return [];
    return batches[selectedProduct.id] || [];
  }, [batches, selectedProduct]);

  const batchTotalPages = Math.max(1, Math.ceil(currentBatches.length / batchPageSize));
  const safeBatchPage = Math.min(batchPage, batchTotalPages);
  const pagedBatches = currentBatches.slice((safeBatchPage - 1) * batchPageSize, safeBatchPage * batchPageSize);

  // ===== Tab =====
  const handleTabChange = (e) => {
    const value = e.target.value;
    if (value === 'export') { setShowExportModal(true); e.target.value = activeTab; return; }
    setActiveTab(value);
    setPage(1);
    setPageInputValue("1");
  };

  // ===== Pagination =====
  const changePage = (newPage, direction) => {
    if (newPage === safePage || newPage < 1 || newPage > totalPages) return;
    setLoadingDirection(direction);
    setPage(newPage);
    setPageInputValue(newPage.toString());
    setTimeout(() => setLoadingDirection(null), 150);
    if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
  };
  const changeHistoryPage = (newPage, direction) => {
    if (newPage === safeLogPage || newPage < 1 || newPage > logTotalPages) return;
    setLoadingDirection(direction);
    setLogPage(newPage);
    setHistoryPageInputValue(newPage.toString());
    setTimeout(() => setLoadingDirection(null), 150);
    if (historyContainerRef.current) historyContainerRef.current.scrollTop = 0;
  };

  const handlePageSizeChange = (e) => { setPageSize(parseInt(e.target.value)); setPage(1); setPageInputValue("1"); };
  const handleLogPageSizeChange = (e) => { setLogPageSize(parseInt(e.target.value)); setLogPage(1); setHistoryPageInputValue("1"); };

  // ===== Date filters =====
  const handleDateFilterChange = (filter) => {
    setDateFilter({ filter, customFrom: filter === "custom" ? dateFilter.customFrom : "", customTo: filter === "custom" ? dateFilter.customTo : "" });
    setLogPage(1);
    setHistoryPageInputValue("1");
    setShowDatePicker(filter === "custom");
  };
  const handleCustomDateChange = (type, value) => setDateFilter(prev => ({ ...prev, [type]: value }));
  const clearDateFilter = () => {
    setDateFilter({ filter: "all", customFrom: "", customTo: "" });
    setShowDatePicker(false);
    setLogPage(1);
    setHistoryPageInputValue("1");
  };

  // ===== Helpers =====
  const getStatusLabel = (status) => status === 'Active'
    ? (language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active')
    : (language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive');
  const getAvailableStock = (p) => p.totalStock || 0;

  const getActionLabel = (t) => {
    const labels = {
      ADD_BATCH: { mm: 'Batch အသစ်ထည့်', en: 'Batch Added' },
      ADJUST_BATCH: { mm: 'Batch ချိန်ညှိ', en: 'Batch Adjusted' },
      DELETE_BATCH: { mm: 'Batch ဖျက်', en: 'Batch Deleted' },
      UPDATE_BATCH: { mm: 'Batch ပြင်ဆင်', en: 'Batch Updated' },
      SALE: { mm: 'ရောင်းချခြင်း', en: 'Sale' },
      RETURN: { mm: 'ပြန်လည်ရောက်ရှိ', en: 'Return' },
      DAMAGE: { mm: 'ပျက်စီးမှု', en: 'Damage' },
    };
    return labels[t]?.[language === 'mm' ? 'mm' : 'en'] || t;
  };
  const getActionIcon = (t) => ({
    ADD_BATCH: 'fa-plus-circle', ADJUST_BATCH: 'fa-sliders-h', DELETE_BATCH: 'fa-trash',
    UPDATE_BATCH: 'fa-edit', SALE: 'fa-shopping-cart', RETURN: 'fa-undo-alt', DAMAGE: 'fa-exclamation-triangle'
  }[t] || 'fa-history');
  const getActionColor = (t) => ({
    ADD_BATCH: '#10b981', ADJUST_BATCH: '#f59e0b', DELETE_BATCH: '#ef4444', UPDATE_BATCH: '#3b82f6',
    SALE: '#8b5cf6', RETURN: '#fc38b7', DAMAGE: '#ff6b6b'
  }[t] || '#6b7280');
  const getActionBadgeClass = (t) => ({
    ADD_BATCH: 'inv-action-add', ADJUST_BATCH: 'inv-action-edit', DELETE_BATCH: 'inv-action-delete',
    UPDATE_BATCH: 'inv-action-update', SALE: 'inv-action-sale', RETURN: 'inv-action-return', DAMAGE: 'inv-action-damage'
  }[t] || 'inv-action-add');
  const renderActionBadge = (t) => {
    if (t === 'RETURN') return <span className="return-badge">{getActionLabel(t)}</span>;
    if (t === 'DAMAGE') return <span className="damage-badge">{getActionLabel(t)}</span>;
    return <span className="inv-log-action">{getActionLabel(t)}</span>;
  };
  const getReasonLabel = (rv) => {
    const opt = reasonOptions.find(o => o.value === rv);
    return opt ? (language === 'mm' ? opt.label.mm : opt.label.en) : rv;
  };

  // ============================================================
  // ✅ CRUD
  // ============================================================
  const updateProductStock = (productId, newStock) => {
    const updated = products.map(p => p.id === productId ? { ...p, totalStock: newStock } : p);
    setProducts(updated);
    saveData(PRODUCTS_KEY, updated);
    if (selectedProduct && selectedProduct.id === productId) {
      setSelectedProduct(prev => ({ ...prev, totalStock: newStock }));
    }
  };

  const addLog = logAction;

  // ===== Add Batch =====
  const handleAddBatch = async () => {
    if (!selectedProduct) return;
    const qty = parseInt(batchForm.quantity);
    if (!qty || qty <= 0) {
      alert(language === 'mm' ? 'အရေအတွက် မှန်ကန်စွာ ထည့်ပါ။' : 'Please enter a valid quantity.');
      return;
    }
    setIsAddingBatch(true);
    await new Promise(r => setTimeout(r, 250));

    const newBatch = {
      id: Date.now(),
      productId: selectedProduct.id,
      batchNumber: batchForm.batchNumber || `B-${Date.now()}`,
      purchasePrice: parseFloat(batchForm.purchasePrice) || 0,
      quantity: qty,
      remaining: qty,
      dateReceived: batchForm.dateReceived,
      expiryDate: batchForm.expiryDate || null,
      supplier: batchForm.supplier || '',
      location: batchForm.location || '',
      notes: batchForm.notes || '',
      createdAt: new Date().toISOString(),
    };

    const list = batches[selectedProduct.id] || [];
    const updatedBatches = { ...batches, [selectedProduct.id]: [...list, newBatch] };
    setBatches(updatedBatches);
    saveData(BATCHES_KEY, updatedBatches);

    updateProductStock(selectedProduct.id, (selectedProduct.totalStock || 0) + qty);
    addLog('ADD_BATCH', selectedProduct, [
      `အရေအတွက်: ${qty}`,
      `ဝယ်ဈေး: ${formatCurrency(newBatch.purchasePrice)}`,
      `စုစုပေါင်းကုန်ကျစရိတ်: ${(newBatch.purchasePrice * qty).toLocaleString()} MMK`,
    ]);

    setSuccess(true);
    setShowAddBatchModal(false);
    setBatchForm({
      batchNumber: '', purchasePrice: '', quantity: '',
      dateReceived: new Date().toISOString().split('T')[0],
      expiryDate: '', supplier: '', location: '', notes: ''
    });
    setIsAddingBatch(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCloseAddBatchModal = () => {
    setShowAddBatchModal(false);
    setBatchForm({
      batchNumber: '', purchasePrice: '', quantity: '',
      dateReceived: new Date().toISOString().split('T')[0],
      expiryDate: '', supplier: '', location: '', notes: ''
    });
  };

  // ===== Batch Adjust =====
  const handleBatchAdjust = async () => {
    if (!selectedProduct || !selectedBatch) return;
    const qty = parseInt(batchAdjustForm.quantity);
    if (!qty || qty === 0) {
      alert(language === 'mm' ? 'အရေအတွက် မှန်ကန်စွာ ထည့်ပါ။' : 'Please enter a valid quantity.');
      return;
    }
    setIsAdjustingBatch(true);
    await new Promise(r => setTimeout(r, 250));

    const list = batches[selectedProduct.id] || [];
    const updatedList = list.map(b => b.id === selectedBatch.id
      ? { ...b, remaining: Math.max(0, (b.remaining || 0) + qty) } : b);
    const updatedBatches = { ...batches, [selectedProduct.id]: updatedList };
    setBatches(updatedBatches);
    saveData(BATCHES_KEY, updatedBatches);

    updateProductStock(selectedProduct.id, (selectedProduct.totalStock || 0) + qty);
    let reasonText = getReasonLabel(batchAdjustForm.reasonType);
    if (batchAdjustForm.reasonType === 'OTHER' && batchAdjustForm.reason.trim()) {
      reasonText += `: ${batchAdjustForm.reason.trim()}`;
    }
    addLog('ADJUST_BATCH', selectedProduct, [
      `အရေအတွက်: ${qty > 0 ? '+' : ''}${qty}`,
      `အကြောင်းပြချက်: ${reasonText}`,
    ]);

    setSuccess(true);
    setBatchAdjustForm({ quantity: '', reasonType: 'WRONG_COUNT', reason: '', notes: '' });
    setShowBatchAdjustModal(false);
    setIsAdjustingBatch(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCloseBatchAdjustModal = () => {
    setBatchAdjustForm({ quantity: '', reasonType: 'WRONG_COUNT', reason: '', notes: '' });
    setShowBatchAdjustModal(false);
  };

  // ===== Edit Batch =====
  const handleEditProduct = async () => {
    if (!selectedProduct || !selectedBatch) return;
    setIsEditingBatch(true);
    await new Promise(r => setTimeout(r, 250));

    const list = batches[selectedProduct.id] || [];
    const updatedList = list.map(b => b.id === selectedBatch.id
      ? { ...b, supplier: editForm.supplier, location: editForm.location, notes: editForm.notes, purchasePrice: parseFloat(editForm.purchasePrice) || b.purchasePrice }
      : b);
    const updatedBatches = { ...batches, [selectedProduct.id]: updatedList };
    setBatches(updatedBatches);
    saveData(BATCHES_KEY, updatedBatches);

    addLog('UPDATE_BATCH', selectedProduct, [
      `ဝယ်ဈေး: ${formatCurrency(parseFloat(editForm.purchasePrice) || 0)}`,
      `ထောက်ပံ့သူ: ${editForm.supplier || '-'}`,
      `တည်နေရာ: ${editForm.location || '-'}`,
    ]);

    setSuccess(true);
    setShowEditModal(false);
    setSelectedBatch(null);
    setEditForm({ location: '', supplier: '', notes: '', purchasePrice: '' });
    setIsEditingBatch(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setSelectedBatch(null);
    setEditForm({ location: '', supplier: '', notes: '', purchasePrice: '' });
  };

  // ===== Stock Adjust =====
  const handleStockAdjust = async () => {
    if (!selectedProduct) return;
    const qty = parseInt(adjustmentForm.quantity);
    if (!qty || qty === 0) {
      alert(language === 'mm' ? 'အရေအတွက် မှန်ကန်စွာ ထည့်ပါ။' : 'Please enter a valid quantity.');
      return;
    }
    const list = batches[selectedProduct.id] || [];
    if (list.length === 0) {
      alert(language === 'mm' ? 'ဤပစ္စည်းတွင် Batch မရှိပါ။' : 'No batches for this product.');
      return;
    }
    setIsAdjustingStock(true);
    await new Promise(r => setTimeout(r, 250));

    const sorted = [...list].sort((a, b) => new Date(a.dateReceived) - new Date(b.dateReceived));
    const targetBatch = sorted[0];
    const updatedList = list.map(b => b.id === targetBatch.id ? { ...b, remaining: Math.max(0, (b.remaining || 0) + qty) } : b);
    const updatedBatches = { ...batches, [selectedProduct.id]: updatedList };
    setBatches(updatedBatches);
    saveData(BATCHES_KEY, updatedBatches);

    updateProductStock(selectedProduct.id, (selectedProduct.totalStock || 0) + qty);
    addLog('ADJUST_BATCH', selectedProduct, [`အရေအတွက်: ${qty > 0 ? '+' : ''}${qty}`, `အကြောင်းပြချက်: ${adjustmentForm.reason}`]);

    setSuccess(true);
    setShowAdjustModal(false);
    setAdjustmentForm({ adjustmentType: 'ADJUSTMENT', quantity: '', reason: '', reference: '', notes: '' });
    setIsAdjustingStock(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  // ===== Export =====
  const handleExport = async (exportType) => {
    setExportLoading(true);
    await new Promise(r => setTimeout(r, 500));
    try {
      let rows = [];
      if (exportType === "inventory" || exportType === "both") {
        rows.push(["=== စတော့စာရင်း ==="]);
        rows.push(["နံပါတ်", "အမည်", "ဘားကုဒ်", "SKU", "အမျိုးအစား", "ရောင်းဈေး", "လက်ကျန်", "ကုန်ကျစရိတ်", "အခြေအနေ"]);
        products.forEach(p => {
          const productBatches = batches[p.id] || [];
          const totalCost = productBatches.reduce((s, b) => s + (b.purchasePrice || 0) * (b.remaining || 0), 0);
          rows.push([p.id, p.name, p.barcode, p.sku, p.categoryName, p.sellingPrice, p.totalStock, totalCost, getStatusLabel(p.status)]);
        });
        rows.push([]);
      }
      if (exportType === "logs" || exportType === "both") {
        rows.push(["=== မှတ်တမ်းများ ==="]);
        rows.push(["နံပါတ်", "လုပ်ဆောင်ချက်", "ပစ္စည်း", "လုပ်သူ", "အချိန်", "အပြောင်းအလဲများ"]);
        logs.forEach(l => rows.push([l.id, getActionLabel(l.actionType), l.productName, l.createdByName, formatDateTime(l.createdAt, language), (l.changes || []).join(" | ")]));
      }
      const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `inventory_export_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("တင်ပို့ရာတွင် မအောင်မြင်ပါ");
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  // ===== Reload =====
  const reloadAll = () => {
    setProducts(getData(PRODUCTS_KEY, SEED_PRODUCTS));
    setBatches(getData(BATCHES_KEY, SEED_BATCHES));
    setLogs(getData(INV_LOGS_KEY, SEED_LOGS));
  };

  if (!currentUser) {
    return (
      <div className="inv-container">
        <div className="loading-state" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginRight: '15px' }}></i>
          <p style={{ fontSize: '18px' }}>အသုံးပြုသူဒေတာ ဖွင့်နေသည်...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-container">
      {/* Messages */}
      <div className="cat-messages-container">
        {success && (
          <div className="cat-message success">
            <i className="fas fa-check-circle"></i>
            <span>လုပ်ဆောင်မှု အောင်မြင်ပါသည်။</span>
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
      </div>

      {/* Tabs Header */}
      <div className="inv-tabs-header">
        <div className="inv-tabs-selector">
          <div className="inv-select-container">
            <i className={`fas ${
              activeTab === 'all-products' ? 'fa-boxes' :
              activeTab === 'in-stock' ? 'fa-check-circle' :
              activeTab === 'low-stock' ? 'fa-exclamation-triangle' :
              activeTab === 'out-of-stock' ? 'fa-times-circle' : 'fa-history'
            } inv-select-icon`}></i>
            <select className="inv-tab-select" value={activeTab} onChange={handleTabChange} disabled={loading || tableLoading}>
              <option value="all-products">ပစ္စည်းအားလုံး ({statusCounts.all})</option>
              <option value="in-stock">လက်ကျန်ရှိ ({statusCounts.inStock})</option>
              <option value="low-stock">လက်ကျန်နည်း ({statusCounts.lowStock})</option>
              <option value="out-of-stock">လက်ကျန်မရှိ ({statusCounts.outOfStock})</option>
              <option value="history">မှတ်တမ်း ({logCounts.all})</option>
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>ဒေတာတင်ပို့ရန်</option>
            </select>
            <i className="fas fa-chevron-down inv-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' ? (
          <>
            <div className="inv-search-controls">
              <div className="inv-search-input-group">
                <i className="fas fa-search inv-search-icon"></i>
                <input type="text" className="inv-search-input"
                  placeholder="အမည်၊ ကုဒ်၊ အမျိုးအစား..."
                  value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} disabled={tableLoading} />
                {searchQuery && (
                  <button className="inv-clear-search-btn" onClick={() => { setSearchQuery(""); setPage(1); }} disabled={tableLoading}><i className="fas fa-times"></i></button>
                )}
              </div>
            </div>

            <div className="inv-total-purchase-container">
              <div className="inv-total-purchase-box">
                <i className="fas fa-coins"></i>
                <div className="inv-total-purchase-info">
                  <span className="inv-total-purchase-label">စုစုပေါင်းဝယ်ယူမှုတန်ဖိုး</span>
                  <span className="inv-total-purchase-value">{totalPurchaseValue.toLocaleString()} MMK</span>
                </div>
              </div>
            </div>

            <button className="inv-add-btn" onClick={() => setShowAddStockModal(true)} disabled={tableLoading}>
              <i className="fas fa-plus"></i> စတော့အသစ်ထည့်ရန်
            </button>
          </>
        ) : <div style={{ flex: 1 }}></div>}
      </div>

      <div className="subtab-content active">
        {activeTab === 'history' ? (
          /* ===== HISTORY ===== */
          <div className="inv-history-section">
            <div className="inv-section-title">
              <div className="inv-title-row">
                <div className="inv-title-left">
                  <i className="fas fa-history"></i>
                  <span className="inv-title-text">လက်ကျန်မှတ်တမ်း</span>
                </div>
                <div className="inv-title-center">
                  <div className="inv-compact-nav">
                    <button className="inv-nav-btn" onClick={() => changeHistoryPage(safeLogPage - 1, 'prev')} disabled={safeLogPage === 1}><i className="fas fa-chevron-left"></i></button>
                    <div className="inv-page-control">
                      <input type="text" className="inv-page-input" value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(historyPageInputValue); if (!isNaN(v) && v >= 1 && v <= logTotalPages) changeHistoryPage(v, 'jump'); else setHistoryPageInputValue(safeLogPage.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="inv-page-total">/ {logTotalPages}</span>
                    </div>
                    <button className="inv-nav-btn" onClick={() => changeHistoryPage(safeLogPage + 1, 'next')} disabled={safeLogPage === logTotalPages}><i className="fas fa-chevron-right"></i></button>
                    <div className="inv-items-per-page">
                      <select className="inv-per-page-select" value={logPageSize} onChange={handleLogPageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="inv-per-page-label">/စာမျက်နှာ</span>
                    </div>
                  </div>
                </div>
                <div className="inv-title-right">
                  <span className="inv-showing-count">
                    <span className="inv-count-numbers">{filteredLogs.length > 0 ? ((safeLogPage - 1) * logPageSize) + 1 : 0}</span>
                    <span> - </span>
                    <span className="inv-count-numbers">{Math.min(safeLogPage * logPageSize, filteredLogs.length)}</span>
                    <span> / </span>
                    <span className="inv-count-numbers">{filteredLogs.length}</span>
                    <span className="inv-count-label">ခု</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="inv-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, alignItems: 'center', width: '100%' }}>
                <div className="inv-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button className={`inv-filter-tab ${logFilter === 'all' ? 'active' : ''}`} onClick={() => { setLogFilter('all'); setLogPage(1); }}>အားလုံး <span className="inv-filter-count">({logCounts.all})</span></button>
                  <button className={`inv-filter-tab ${logFilter === 'ADD_BATCH' ? 'active' : ''}`} onClick={() => { setLogFilter('ADD_BATCH'); setLogPage(1); }}><i className="fas fa-plus"></i> ထည့်သွင်း <span className="inv-filter-count">({logCounts.ADD_BATCH})</span></button>
                  <button className={`inv-filter-tab ${logFilter === 'ADJUST_BATCH' ? 'active' : ''}`} onClick={() => { setLogFilter('ADJUST_BATCH'); setLogPage(1); }}><i className="fas fa-sliders-h"></i> ချိန်ညှိ <span className="inv-filter-count">({logCounts.ADJUST_BATCH})</span></button>
                  <button className={`inv-filter-tab ${logFilter === 'UPDATE_BATCH' ? 'active' : ''}`} onClick={() => { setLogFilter('UPDATE_BATCH'); setLogPage(1); }}><i className="fas fa-edit"></i> ပြင်ဆင် <span className="inv-filter-count">({logCounts.UPDATE_BATCH})</span></button>
                </div>
                <div className="inv-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button className={`inv-filter-tab ${dateFilter.filter === 'all' ? 'active' : ''}`} onClick={() => handleDateFilterChange('all')}>အချိန်အားလုံး</button>
                  <button className={`inv-filter-tab ${dateFilter.filter === 'today' ? 'active' : ''}`} onClick={() => handleDateFilterChange('today')}>ယနေ့</button>
                  <button className={`inv-filter-tab ${dateFilter.filter === 'yesterday' ? 'active' : ''}`} onClick={() => handleDateFilterChange('yesterday')}>မနေ့က</button>
                  <button className={`inv-filter-tab ${dateFilter.filter === 'thisWeek' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisWeek')}>ဒီအပတ်</button>
                  <button className={`inv-filter-tab ${dateFilter.filter === 'thisMonth' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisMonth')}>ဒီလ</button>
                  <button className={`inv-filter-tab ${dateFilter.filter === 'custom' ? 'active' : ''}`} onClick={() => handleDateFilterChange('custom')}><i className="fas fa-calendar"></i> စိတ်ကြိုက်</button>
                  {dateFilter.filter !== 'all' && (
                    <button className="inv-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }}><i className="fas fa-times"></i> ရှင်းလင်းရန်</button>
                  )}
                </div>
              </div>
              {showDatePicker && (
                <div className="inv-custom-date-picker">
                  <div className="inv-date-picker-row"><label>မှ</label><input type="date" className="inv-date-input" value={dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} /></div>
                  <div className="inv-date-picker-row"><label>ထိ</label><input type="date" className="inv-date-input" value={dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} /></div>
                </div>
              )}
            </div>

            <div className="inv-compact-logs-container" ref={historyContainerRef}>
              {Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dayLogs]) => (
                  <div key={date} className="inv-date-group">
                    <div className="inv-date-header">
                      <span className="inv-date-label">{date}</span>
                      <span className="inv-date-count">{dayLogs.length} ခု</span>
                    </div>
                    <div className="inv-logs-list">
                      {dayLogs.map(log => (
                        <div key={log.id} className={`inv-compact-log-entry log-${log.actionType?.toLowerCase()}`}
                          onClick={() => { setSelectedLog(log); setShowLogDetails(true); }} style={{ cursor: 'pointer' }}>
                          <div className="inv-log-icon" style={{ color: getActionColor(log.actionType) }}>
                            <i className={`fas ${getActionIcon(log.actionType)}`}></i>
                          </div>
                          <div className="inv-log-content">
                            <div className="inv-log-main-info">
                              {renderActionBadge(log.actionType)}
                              <span className="inv-log-product">"{log.productName}"{log.productId && <span className="inv-product-id">#{log.productId}</span>}</span>
                            </div>
                            <div className="inv-log-details">
                              <span className="inv-log-user"><i className="fas fa-user"></i> <strong>{log.createdByName}</strong> <span className="inv-user-role">({log.createdByRole})</span></span>
                              <span className="inv-log-time"><i className="fas fa-clock"></i> {formatDateTime(log.createdAt, language)}</span>
                              {log.changes && log.changes.length > 0 && <span className="inv-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} ခု</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-logs"><i className="fas fa-clipboard-list"></i><p>မှတ်တမ်းမရှိပါ။</p></div>
              )}
            </div>
          </div>
        ) : (
          /* ===== PRODUCTS ===== */
          <>
            <div className="inv-section-title">
              <div className="inv-title-row">
                <div className="inv-title-left">
                  <i className="fas fa-boxes"></i>
                  <span className="inv-title-text">
                    {activeTab === 'all-products' && 'ပစ္စည်းအားလုံး'}
                    {activeTab === 'in-stock' && 'လက်ကျန်ရှိပစ္စည်းများ'}
                    {activeTab === 'low-stock' && 'လက်ကျန်နည်းပစ္စည်းများ'}
                    {activeTab === 'out-of-stock' && 'လက်ကျန်မရှိပစ္စည်းများ'}
                  </span>
                </div>
                <div className="inv-title-center">
                  <div className="inv-compact-nav">
                    <button className="inv-nav-btn" onClick={() => changePage(safePage - 1, 'prev')} disabled={safePage === 1}><i className="fas fa-chevron-left"></i></button>
                    <div className="inv-page-control">
                      <input type="text" className="inv-page-input" value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(pageInputValue); if (!isNaN(v) && v >= 1 && v <= totalPages) changePage(v, 'jump'); else setPageInputValue(safePage.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="inv-page-total">/ {totalPages}</span>
                    </div>
                    <button className="inv-nav-btn" onClick={() => changePage(safePage + 1, 'next')} disabled={safePage === totalPages}><i className="fas fa-chevron-right"></i></button>
                    <div className="inv-items-per-page">
                      <select className="inv-per-page-select" value={pageSize} onChange={handlePageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="inv-per-page-label">/စာမျက်နှာ</span>
                    </div>
                  </div>
                </div>
                <div className="inv-title-right">
                  <span className="inv-showing-count">
                    <span className="inv-count-numbers">{filteredProducts.length > 0 ? ((safePage - 1) * pageSize) + 1 : 0}</span>
                    <span> - </span>
                    <span className="inv-count-numbers">{Math.min(safePage * pageSize, filteredProducts.length)}</span>
                    <span> / </span>
                    <span className="inv-count-numbers">{filteredProducts.length}</span>
                    <span className="inv-count-label">ခု</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="inv-table-wrapper" ref={tableBodyRef}>
              <table className="inventory-table">
                <thead>
                  <tr>
                    <th>နံပါတ်</th>
                    <th>ပုံ</th>
                    <th>ပစ္စည်းအမည်</th>
                    <th>ဘားကုဒ်</th>
                    <th>အမျိုးအစား</th>
                    <th>ရောင်းဈေး</th>
                    <th>ရနိုင်သော</th>
                    <th>ကုန်ကျစရိတ်</th>
                    <th>အခြေအနေ</th>
                    <th>လုပ်ဆောင်ချက်</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="10" className="inv-no-data"><div className="inv-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: 48, marginBottom: 15 }}></i><p>ဒေတာများ ရယူနေသည်...</p></div></td></tr>
                  ) : pagedProducts.length > 0 ? (
                    pagedProducts.map((product, index) => {
                      const productBatches = batches[product.id] || [];
                      const productTotalCost = productBatches.reduce(
                        (sum, b) => sum + (b.purchasePrice || 0) * (b.remaining || 0),
                        0
                      );
                      return (
                        <tr key={product.id}>
                          <td>{(safePage - 1) * pageSize + index + 1}</td>
                          <td className="prod-image-cell">
                            {product.image ? (
                              <img src={product.image} alt={product.name} className="prod-image" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                            ) : (
                              <div className="prod-image-fallback">{product.name.charAt(0).toUpperCase()}</div>
                            )}
                          </td>
                          <td>
                            <div><strong>{product.name}</strong></div>
                            <span className='inv-sku-style'><i className="fas fa-tag"></i>{product.sku}</span>
                            {product.notes && <div className="inv-notes-preview"><i className="fas fa-sticky-note"></i> {product.notes.substring(0, 30)}{product.notes.length > 30 ? '...' : ''}</div>}
                          </td>
                          <td>{product.barcode}</td>
                          <td>{product.categoryName}</td>
                          <td><span className='inv-sellingprice-stock'>{product.sellingPrice?.toLocaleString()} MMK</span></td>
                          <td className={`inv-available-stock ${(product.totalStock || 0) <= 10 ? 'low' : 'high'}`}>
                            {product.totalStock || 0}
                            {(product.totalStock || 0) <= 10 && (product.totalStock || 0) > 0 && (
                              <span className="inv-min-stock-indicator"><i className="fas fa-exclamation"></i></span>
                            )}
                          </td>
                          <td>
                            <span className="inv-total-cost-cell">
                              {productTotalCost.toLocaleString()} MMK
                            </span>
                          </td>
                          <td><span className={`inv-status-badge ${product.status === 'Active' ? 'inv-status-active' : 'inv-status-inactive'}`}>{getStatusLabel(product.status)}</span></td>
                          <td>
                            <div className="inv-action-buttons">
                              <button className="inv-action-btn inv-action-view" onClick={() => { setSelectedProduct(product); setShowQuickView(true); }}><i className="fas fa-eye"></i></button>
                              <button className="inv-action-btn inv-action-batch" onClick={() => { setSelectedProduct(product); setBatchPage(1); setBatchPageInput("1"); setShowBatchModal(true); }}><i className="fas fa-layer-group"></i></button>
                              <button className="inv-action-btn inv-action-add-batch" onClick={() => { setSelectedProduct(product); setShowAddBatchModal(true); }}><i className="fas fa-plus-circle"></i></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="10" className="inv-no-data"><div className="inv-no-data-content"><i className="fas fa-box-open"></i><p>ပစ္စည်းမရှိပါ။</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* ===== Quick View ===== */}
      {showQuickView && selectedProduct && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content" style={{ maxWidth: '500px' }}>
            <div className="inv-modal-header">
              <h3><i className="fas fa-eye"></i> ပစ္စည်းအသေးစိတ်</h3>
              <button className="inv-modal-close" onClick={() => setShowQuickView(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="inv-modal-body">
              <div className="quick-view-header">
                <h4>{selectedProduct.name}</h4>
                <span className={`inv-status-badge ${selectedProduct.status === 'Active' ? 'inv-status-active' : 'inv-status-inactive'}`}>{getStatusLabel(selectedProduct.status)}</span>
              </div>
              {selectedProduct.image && (
                <div style={{ textAlign: 'center', margin: '15px 0' }}>
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8 }} />
                </div>
              )}
              <div className="quick-view-grid">
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-barcode"></i> ဘားကုဒ်:</span><span>{selectedProduct.barcode}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-tag"></i> SKU:</span><span>{selectedProduct.sku}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-layer-group"></i> အမျိုးအစား:</span><span>{selectedProduct.categoryName}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-dollar-sign"></i> ရောင်းဈေး:</span><span>{selectedProduct.sellingPrice?.toLocaleString()} MMK</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-check-circle"></i> လက်ကျန်ရှိ:</span><span>{getAvailableStock(selectedProduct)}</span></div>
                {(() => {
                  const productBatches = batches[selectedProduct.id] || [];
                  const productTotalCost = productBatches.reduce(
                    (sum, b) => sum + (b.purchasePrice || 0) * (b.remaining || 0), 0);
                  const productTotalQty = productBatches.reduce((s, b) => s + (b.remaining || 0), 0);
                  const avgCost = productTotalQty > 0 ? productTotalCost / productTotalQty : 0;
                  return (
                    <>
                      <div className="quick-view-row">
                        <span className="quick-view-label"><i className="fas fa-coins"></i> စုစုပေါင်းကုန်ကျစရိတ်:</span>
                        <span style={{ color: '#065f46', fontWeight: 700 }}>{productTotalCost.toLocaleString()} MMK</span>
                      </div>
                      <div className="quick-view-row">
                        <span className="quick-view-label"><i className="fas fa-calculator"></i> ပျမ်းမျှဝယ်ဈေး:</span>
                        <span style={{ color: '#065f46', fontWeight: 700 }}>{avgCost.toLocaleString(undefined, { maximumFractionDigits: 0 })} MMK</span>
                      </div>
                    </>
                  );
                })()}
                {selectedProduct.notes && <div className="quick-view-row full-width"><span className="quick-view-label"><i className="fas fa-sticky-note"></i> မှတ်ချက်:</span><span>{selectedProduct.notes}</span></div>}
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowQuickView(false)}>ပိတ်</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Batch Modal ===== */}
      {showBatchModal && selectedProduct && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content" style={{ maxWidth: '900px' }}>
            <div className="inv-modal-header">
              <h3><i className="fas fa-layer-group"></i> {selectedProduct.name} - Batch များ</h3>
              <button className="inv-modal-close" onClick={() => { setShowBatchModal(false); setBatchPage(1); }}><i className="fas fa-times"></i></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-batch-summary">
                <div className="inv-summary-item">
                  <span className="inv-summary-label">စုစုပေါင်း Batch:</span>
                  <span className="inv-summary-value">{currentBatches.length}</span>
                </div>
                <div className="inv-summary-item">
                  <span className="inv-summary-label">စုစုပေါင်းလက်ကျန်:</span>
                  <span className="inv-summary-value">{currentBatches.reduce((s, b) => s + (b.remaining || 0), 0)}</span>
                </div>
                <div className="inv-summary-item" style={{ borderLeft: '3px solid #10b981' }}>
                  <span className="inv-summary-label" style={{ color: '#10b981' }}><i className="fas fa-coins" style={{ marginRight: 5 }}></i>စုစုပေါင်းဝယ်ယူမှုတန်ဖိုး</span>
                  <span className="inv-summary-value" style={{ color: '#065f46' }}>
                    {currentBatches.reduce((sum, b) => sum + (b.purchasePrice * b.remaining), 0).toLocaleString()} MMK
                  </span>
                </div>
              </div>

              {batchTotalPages > 1 && (
                <div className="inv-batch-pagination">
                  <div className="inv-pagination-controls">
                    <button className="inv-pagination-btn" onClick={() => { setBatchPage(p => Math.max(1, p - 1)); setBatchPageInput(String(Math.max(1, batchPage - 1))); }} disabled={safeBatchPage === 1}><i className="fas fa-chevron-left"></i></button>
                    <div className="inv-page-control">
                      <input type="text" className="inv-page-input" value={batchPageInput}
                        onChange={(e) => setBatchPageInput(e.target.value)}
                        onBlur={() => { const v = parseInt(batchPageInput); if (!isNaN(v) && v >= 1 && v <= batchTotalPages) { setBatchPage(v); setBatchPageInput(v.toString()); } else setBatchPageInput(safeBatchPage.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="inv-page-total">/ {batchTotalPages}</span>
                    </div>
                    <button className="inv-pagination-btn" onClick={() => { setBatchPage(p => Math.min(batchTotalPages, p + 1)); setBatchPageInput(String(Math.min(batchTotalPages, batchPage + 1))); }} disabled={safeBatchPage === batchTotalPages}><i className="fas fa-chevron-right"></i></button>
                    <div className="inv-items-per-page">
                      <select className="inv-per-page-select" value={batchPageSize} onChange={(e) => { setBatchPageSize(parseInt(e.target.value)); setBatchPage(1); setBatchPageInput("1"); }}>
                        <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
                      </select>
                      <span className="inv-per-page-label">/စာမျက်နှာ</span>
                    </div>
                  </div>
                </div>
              )}

              <div className="inv-batch-table-container">
                <table className="inv-batch-table">
                  <thead>
                    <tr>
                      <th>Batch နံပါတ်</th>
                      <th>ဝယ်ဈေး</th>
                      <th>စုစုပေါင်း</th>
                      <th>လက်ကျန်</th>
                      <th>ရက်စွဲ</th>
                      <th style={{ minWidth: 180 }}>ထောက်ပံ့သူ</th>
                      <th>လုပ်ဆောင်ချက်</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pagedBatches.length > 0 ? (
                      pagedBatches.map((batch, idx) => {
                        const serialNo = currentBatches.length - ((safeBatchPage - 1) * batchPageSize) - idx;
                        return (
                          <tr key={batch.id}>
                            <td><span className="inv-batch-number">B-{serialNo}</span></td>
                            <td className="inv-price-cell" style={{ fontSize: 13.5 }}>{batch.purchasePrice?.toLocaleString()} MMK</td>
                            <td className="inv-qty-cell total">{batch.quantity}</td>
                            <td className="inv-qty-cell remaining">
                              <span className={`inv-remaining-badge ${batch.remaining <= 0 ? 'empty' : batch.remaining < batch.quantity * 0.2 ? 'low' : 'normal'}`}>
                                {batch.remaining}
                              </span>
                            </td>
                            <td>
                              <div className="inv-batch-date">
                                <div className="inv-batch-date-item received"><i className="fas fa-calendar-alt"></i><span>{batch.dateReceived}</span></div>
                                {batch.expiryDate && (
                                  <div className={`inv-batch-date-item expiry ${new Date(batch.expiryDate) < new Date() ? 'expired' : ''}`}>
                                    <i className="fas fa-hourglass-half"></i><span>{batch.expiryDate}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="inv-batch-date">
                                <div className="inv-suppliers"><span>{batch.supplier || '-'}</span></div>
                                <span className='inv-batch-location'>{batch.location ? (<><i className="fas fa-map-marker-alt"></i>{batch.location}</>) : ''}</span>
                              </div>
                            </td>
                            <td>
                              <div className="inv-action-buttons">
                                <button className="inv-action-btn inv-action-edit" onClick={() => { setSelectedBatch(batch); setEditForm({ location: batch.location || '', supplier: batch.supplier || '', notes: batch.notes || '', purchasePrice: batch.purchasePrice || '' }); setShowEditModal(true); }}><i className="fas fa-edit"></i></button>
                                <button className="inv-action-btn inv-action-adjust" onClick={() => { setSelectedBatch(batch); setShowBatchAdjustModal(true); }}><i className="fas fa-sliders-h"></i></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr><td colSpan="7" className="inv-no-batches"><i className="fas fa-box-open"></i><p>Batch မရှိသေးပါ။</p></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowBatchModal(false)}>ပိတ်</button>
              <button className="inv-btn-submit" onClick={() => { setShowBatchModal(false); setShowAddBatchModal(true); }}>
                <i className="fas fa-plus"></i> Batch အသစ်
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Add Batch Modal ===== */}
      {showAddBatchModal && selectedProduct && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content" style={{ maxWidth: '600px' }}>
            <div className="inv-modal-header">
              <h3><i className="fas fa-plus-circle"></i> Batch အသစ်ထည့်ရန်: {selectedProduct.name}</h3>
              <button className="inv-modal-close" onClick={handleCloseAddBatchModal}><i className="fas fa-times"></i></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label className="inv-required">ဝယ်ဈေး (ကျပ်)</label>
                  <input type="number" value={batchForm.purchasePrice} onChange={(e) => setBatchForm({ ...batchForm, purchasePrice: e.target.value })} min="0" step="1" />
                </div>
                <div className="inv-form-group">
                  <label className="inv-required">အရေအတွက်</label>
                  <input type="number" value={batchForm.quantity} onChange={(e) => setBatchForm({ ...batchForm, quantity: e.target.value })} min="1" step="1" />
                </div>
              </div>
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label className="inv-required">လက်ခံရက်စွဲ</label>
                  <input type="date" value={batchForm.dateReceived} onChange={(e) => setBatchForm({ ...batchForm, dateReceived: e.target.value })} />
                </div>
                <div className="inv-form-group">
                  <label>သက်တမ်းကုန်ရက်</label>
                  <input type="date" value={batchForm.expiryDate} onChange={(e) => setBatchForm({ ...batchForm, expiryDate: e.target.value })} />
                </div>
              </div>
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label>ထောက်ပံ့သူ</label>
                  <input type="text" value={batchForm.supplier} onChange={(e) => setBatchForm({ ...batchForm, supplier: e.target.value })} />
                </div>
                <div className="inv-form-group">
                  <label>တည်နေရာ</label>
                  <input type="text" value={batchForm.location} onChange={(e) => setBatchForm({ ...batchForm, location: e.target.value })} placeholder="e.g., A-01-01" />
                </div>
              </div>
              {batchForm.quantity && batchForm.purchasePrice && (
                <div style={{
                  background: '#ecfdf5', border: '1px solid #a7f3d0',
                  borderRadius: 10, padding: '12px 16px', marginTop: 10,
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between'
                }}>
                  <span style={{ color: '#065f46', fontWeight: 600, fontSize: 14 }}>
                    <i className="fas fa-coins" style={{ marginRight: 8 }}></i>
                    စုစုပေါင်းကုန်ကျစရိတ်:
                  </span>
                  <span style={{ color: '#065f46', fontWeight: 700, fontSize: 16 }}>
                    {((parseFloat(batchForm.purchasePrice) || 0) * (parseInt(batchForm.quantity) || 0)).toLocaleString()} MMK
                  </span>
                </div>
              )}
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={handleCloseAddBatchModal}>ပယ်ဖျက်</button>
              <button className="inv-btn-submit" onClick={handleAddBatch} disabled={!batchForm.quantity || !batchForm.purchasePrice || !batchForm.dateReceived || isAddingBatch}>
                {isAddingBatch ? <><i className="fas fa-spinner fa-spin"></i> ထည့်သွင်းနေသည်...</> : <><i className="fas fa-plus"></i> ထည့်သွင်းမည်</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Batch Adjust Modal ===== */}
      {showBatchAdjustModal && selectedProduct && selectedBatch && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content" style={{ maxWidth: '500px' }}>
            <div className="inv-modal-header">
              <h3><i className="fas fa-sliders-h"></i> Batch ချိန်ညှိမှု</h3>
              <button className="inv-modal-close" onClick={handleCloseBatchAdjustModal}><i className="fas fa-times"></i></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-batch-info-panel">
                <div><span>ပစ္စည်း:</span> <strong>{selectedProduct.name}</strong></div>
                <div><span>လက်ကျန်:</span> <strong>{selectedBatch.remaining}</strong></div>
              </div>
              <div className="inv-form-group">
                <label className="inv-required">အရေအတွက် (အပေါင်း/အနှုတ်)</label>
                <input type="number" value={batchAdjustForm.quantity} onChange={(e) => setBatchAdjustForm({ ...batchAdjustForm, quantity: e.target.value })} placeholder="ဥပမာ -5 သို့ +10" autoFocus />
              </div>
              <div className="inv-form-group">
                <label className="inv-required">အကြောင်းပြချက်</label>
                <select className="inv-select-input" value={batchAdjustForm.reasonType} onChange={(e) => setBatchAdjustForm({ ...batchAdjustForm, reasonType: e.target.value, reason: '' })} size="5">
                  {reasonOptions.map(option => (
                    <option key={option.value} value={option.value}>{language === 'mm' ? option.label.mm : option.label.en}</option>
                  ))}
                </select>
              </div>
              {batchAdjustForm.reasonType === 'OTHER' && (
                <div className="inv-form-group">
                  <label>အခြားအကြောင်းပြချက် ရိုက်ထည့်ပါ</label>
                  <input type="text" value={batchAdjustForm.reason} onChange={(e) => setBatchAdjustForm({ ...batchAdjustForm, reason: e.target.value })} />
                </div>
              )}
              <div className="cat-form-group">
                <label>မှတ်ချက်</label>
                <textarea value={batchAdjustForm.notes} onChange={(e) => setBatchAdjustForm({ ...batchAdjustForm, notes: e.target.value })} rows="2" />
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={handleCloseBatchAdjustModal}>ပယ်ဖျက်</button>
              <button className="inv-btn-submit" onClick={handleBatchAdjust}
                disabled={!batchAdjustForm.quantity || (batchAdjustForm.reasonType === 'OTHER' && !batchAdjustForm.reason.trim()) || isAdjustingBatch}>
                {isAdjustingBatch ? <><i className="fas fa-spinner fa-spin"></i> ချိန်ညှိနေသည်...</> : <><i className="fas fa-check"></i> ချိန်ညှိမည်</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Edit Batch Modal ===== */}
      {showEditModal && selectedProduct && selectedBatch && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content" style={{ maxWidth: '500px' }}>
            <div className="inv-modal-header">
              <h3><i className="fas fa-edit"></i> Batch ပြင်ဆင်: {selectedProduct.name}</h3>
              <button className="inv-modal-close" onClick={handleCloseEditModal}><i className="fas fa-times"></i></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-form-group">
                <label>ဝယ်ဈေး (ကျပ်)</label>
                <input type="number" value={editForm.purchasePrice} onChange={(e) => setEditForm({ ...editForm, purchasePrice: e.target.value })} min="0" step="1" />
              </div>
              <div className="inv-form-group">
                <label>တည်နေရာ</label>
                <input type="text" value={editForm.location} onChange={(e) => setEditForm({ ...editForm, location: e.target.value })} />
              </div>
              <div className="inv-form-group">
                <label>ထောက်ပံ့သူ</label>
                <input type="text" value={editForm.supplier} onChange={(e) => setEditForm({ ...editForm, supplier: e.target.value })} />
              </div>
              <div className="cat-form-group">
                <label>မှတ်ချက်</label>
                <textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows="3" />
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={handleCloseEditModal}>ပယ်ဖျက်</button>
              <button className="inv-btn-submit" onClick={handleEditProduct} disabled={!editForm.purchasePrice || parseFloat(editForm.purchasePrice) < 0 || isEditingBatch}>
                {isEditingBatch ? <><i className="fas fa-spinner fa-spin"></i> သိမ်းနေသည်...</> : <><i className="fas fa-save"></i> သိမ်းမည်</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Stock Adjust Modal ===== */}
      {showAdjustModal && selectedProduct && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content" style={{ maxWidth: '500px' }}>
            <div className="inv-modal-header">
              <h3><i className="fas fa-sliders-h"></i> လက်ကျန်ချိန်ညှိ: {selectedProduct.name}</h3>
              <button className="inv-modal-close" onClick={() => setShowAdjustModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-stock-info"><div>လက်ကျန်: <strong>{selectedProduct.totalStock}</strong></div></div>
              <div className="inv-form-group">
                <label className="inv-required">အမျိုးအစား</label>
                <select value={adjustmentForm.adjustmentType} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, adjustmentType: e.target.value })}>
                  <option value="ADJUSTMENT">ချိန်ညှိခြင်း</option>
                  <option value="RESTOCK">ပြန်ဖြည့်ခြင်း</option>
                  <option value="SALE">ရောင်းချခြင်း</option>
                  <option value="RETURN">ပြန်အမ်းခြင်း</option>
                  <option value="DAMAGE">ပျက်စီးခြင်း</option>
                </select>
              </div>
              <div className="inv-form-group">
                <label className="inv-required">အရေအတွက်</label>
                <input type="number" value={adjustmentForm.quantity} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, quantity: e.target.value })} placeholder="ဥပမာ +10 သို့ -5" />
              </div>
              <div className="inv-form-group">
                <label className="inv-required">အကြောင်းပြချက်</label>
                <textarea value={adjustmentForm.reason} onChange={(e) => setAdjustmentForm({ ...adjustmentForm, reason: e.target.value })} rows="2" />
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowAdjustModal(false)}>ပယ်ဖျက်</button>
              <button className="inv-btn-submit" onClick={handleStockAdjust} disabled={!adjustmentForm.quantity || !adjustmentForm.reason || isAdjustingStock}>
                {isAdjustingStock ? <><i className="fas fa-spinner fa-spin"></i> ချိန်ညှိနေသည်...</> : <><i className="fas fa-check"></i> ချန်ညှိမည်</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Log Details Modal ===== */}
      {showLogDetails && selectedLog && (
        <div className="inv-modal-overlay">
          <div className="inv-modal-content" style={{ maxWidth: '600px' }}>
            <div className="inv-modal-header">
              <h3><i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i> မှတ်တမ်းအသေးစိတ်</h3>
              <button className="inv-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="inv-modal-body">
              <div className="inv-log-detail-header">
                <div className="inv-log-detail-main">
                  <div className="inv-log-detail-action">
                    <span className={`inv-action-badge ${getActionBadgeClass(selectedLog.actionType)}`}>
                      <i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i>
                      {getActionLabel(selectedLog.actionType)}
                    </span>
                  </div>
                  {selectedLog.productName && (
                    <div className="inv-log-detail-product">
                      <i className="fas fa-box"></i>
                      <span className="inv-product-name">{selectedLog.productName}</span>
                      {selectedLog.productId && <span className="inv-product-id-detail">ID: #{selectedLog.productId}</span>}
                    </div>
                  )}
                </div>
                <div className="inv-log-detail-meta">
                  <div className="inv-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div><div className="inv-user-name-detail"><strong>{selectedLog.createdByName}</strong></div><div className="inv-user-role-detail">{selectedLog.createdByRole}</div></div>
                  </div>
                  <div className="inv-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div><div className="inv-log-date-detail">{formatDate(selectedLog.createdAt, language)}</div><div className="inv-log-time-detail">{formatDateTime(selectedLog.createdAt, language)}</div></div>
                  </div>
                </div>
              </div>
              <div className="inv-log-detail-content">
                <h4>အပြောင်းအလဲအသေးစိတ်:</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="inv-change-list">
                    {selectedLog.changes.map((c, i) => (
                      <div key={i} className="inv-change-item"><i className="fas fa-chevron-right"></i><span>{c}</span></div>
                    ))}
                  </div>
                ) : (
                  <div className="inv-no-changes"><i className="fas fa-info-circle"></i><span>အပြောင်းအလဲမှတ်တမ်း မရှိပါ</span></div>
                )}
              </div>
            </div>
            <div className="inv-modal-footer">
              <button className="inv-btn-cancel" onClick={() => setShowLogDetails(false)}>ပိတ်</button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Export Modal ===== */}
      <InventoryExportModal show={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} loading={exportLoading} language={language} />

      {/* ===== AddStockModal ===== */}
      <AddStockModal
        isOpen={showAddStockModal}
        onClose={() => setShowAddStockModal(false)}
        currentUser={currentUser}
        language={language}
        onSuccess={reloadAll}
      />
    </div>
  );
};

export default UserInventoryPage;