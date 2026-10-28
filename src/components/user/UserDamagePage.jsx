// UserDamagePage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DamageModal from './DamageModal';
import DamageExportModal from './DamageExportModal';
import "../../light-style/user-css/userDamagePage.css";
import { useSelector } from 'react-redux';

// ============================================================
// ✅ DEMO SEED DATA — JSON + localStorage
// ============================================================
const DAMAGES_KEY = "demo_damages";
const LOGS_KEY = "demo_damage_logs";
const PRODUCTS_KEY = "demo_products";
const SEED_VERSION_KEY = "demo_damage_seed_version";
const SEED_VERSION = "1.0.0";

// ✅ Demo Products (with batch info for FIFO)
const SEED_PRODUCTS = [
  { id: 1, name: "ကီးဘုတ်", sku: "PRD-001", barcode: "120215421001", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 12000, totalStock: 25, unit: "pcs", averagePurchasePrice: 8000, batchDetails: [
    { batchId: 1, remaining: 10, purchasePrice: 7500 },
    { batchId: 2, remaining: 15, purchasePrice: 8300 }
  ]},
  { id: 2, name: "မောက်စ်", sku: "PRD-002", barcode: "120215421002", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 8500, totalStock: 3, unit: "pcs", averagePurchasePrice: 5000, batchDetails: [
    { batchId: 1, remaining: 3, purchasePrice: 5000 }
  ]},
  { id: 3, name: "မော်နီတာ", sku: "PRD-003", barcode: "120215421003", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 250000, totalStock: 8, unit: "ခု", averagePurchasePrice: 180000, batchDetails: [
    { batchId: 1, remaining: 8, purchasePrice: 180000 }
  ]},
  { id: 4, name: "နားကြပ်", sku: "PRD-004", barcode: "120215421004", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 45000, totalStock: 15, unit: "ခု", averagePurchasePrice: 25000, batchDetails: [
    { batchId: 1, remaining: 15, purchasePrice: 25000 }
  ]},
  { id: 11, name: "ကော်ဖီ", sku: "PRD-011", barcode: "120215421011", categoryId: 2, categoryName: "အစားအသောက်", sellingPrice: 6000, totalStock: 40, unit: "ထုပ်", averagePurchasePrice: 3500, batchDetails: [
    { batchId: 1, remaining: 20, purchasePrice: 3200 },
    { batchId: 2, remaining: 20, purchasePrice: 3800 }
  ]},
  { id: 12, name: "လဖက်ရည်", sku: "PRD-012", barcode: "120215421012", categoryId: 2, categoryName: "အစားအသောက်", sellingPrice: 4500, totalStock: 50, unit: "ထုပ်", averagePurchasePrice: 2500, batchDetails: [
    { batchId: 1, remaining: 50, purchasePrice: 2500 }
  ]},
  { id: 21, name: "တီရှပ်", sku: "PRD-021", barcode: "120215421021", categoryId: 3, categoryName: "အဝတ်အထည်", sellingPrice: 12000, totalStock: 30, unit: "ထည်", averagePurchasePrice: 6000, batchDetails: [
    { batchId: 1, remaining: 30, purchasePrice: 6000 }
  ]},
  { id: 22, name: "ဖိနပ်", sku: "PRD-022", barcode: "120215421022", categoryId: 3, categoryName: "အဝတ်အထည်", sellingPrice: 35000, totalStock: 14, unit: "စုံ", averagePurchasePrice: 20000, batchDetails: [
    { batchId: 1, remaining: 14, purchasePrice: 20000 }
  ]},
  { id: 31, name: "မီးသီး", sku: "PRD-031", barcode: "120215421031", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း", sellingPrice: 2800, totalStock: 60, unit: "လုံး", averagePurchasePrice: 1500, batchDetails: [
    { batchId: 1, remaining: 60, purchasePrice: 1500 }
  ]},
  { id: 41, name: "စာအုပ်မှတ်စု", sku: "PRD-041", barcode: "120215421041", categoryId: 5, categoryName: "စာရေးကိရိယာ", sellingPrice: 2500, totalStock: 50, unit: "ခု", averagePurchasePrice: 1500, batchDetails: [
    { batchId: 1, remaining: 50, purchasePrice: 1500 }
  ]}
];

const SEED_DAMAGES = [
  {
    id: 1, productId: 2, productName: "မောက်စ်", barcode: "120215421002", categoryName: "အီလက်ထရောနစ်",
    quantity: 1, unit: "pcs", damageType: "Physical Damage",
    reportedBy: "Admin", reportedById: 1,
    reportedDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    reportedTime: "10:30 AM",
    lossValue: 5000, notes: "ကြိုးပြတ်နေသည်",
    warehouseSection: "A-1",
    image: null, status: "REPORTED",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 2, productId: 11, productName: "ကော်ဖီ", barcode: "120215421011", categoryName: "အစားအသောက်",
    quantity: 5, unit: "ထုပ်", damageType: "Expired",
    reportedBy: "Cashier1", reportedById: 2,
    reportedDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    reportedTime: "02:15 PM",
    lossValue: 16000, notes: "သက်တမ်းကုန်နေသည်",
    warehouseSection: "B-2",
    image: null, status: "APPROVED",
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 3, productId: 21, productName: "တီရှပ်", barcode: "120215421021", categoryName: "အဝတ်အထည်",
    quantity: 2, unit: "ထည်", damageType: "Water Damage",
    reportedBy: "Cashier2", reportedById: 3,
    reportedDate: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    reportedTime: "09:45 AM",
    lossValue: 12000, notes: "ရေစိုနေသည်",
    warehouseSection: "C-3",
    image: null, status: "IN_REVIEW",
    createdByName: "Cashier2", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 4, productId: 22, productName: "ဖိနပ်", barcode: "120215421022", categoryName: "အဝတ်အထည်",
    quantity: 1, unit: "စုံ", damageType: "Cosmetic Damage",
    reportedBy: "Admin", reportedById: 1,
    reportedDate: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    reportedTime: "11:20 AM",
    lossValue: 20000, notes: "အရောင်ချွတ်နေသည်",
    warehouseSection: "C-4",
    image: null, status: "REPORTED",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 5, productId: 31, productName: "မီးသီး", barcode: "120215421031", categoryName: "အိမ်သုံးပစ္စည်း",
    quantity: 3, unit: "လုံး", damageType: "Electrical Fault",
    reportedBy: "Cashier1", reportedById: 2,
    reportedDate: new Date().toISOString().split('T')[0],
    reportedTime: "03:00 PM",
    lossValue: 4500, notes: "မီးမလင်းတော့ပါ",
    warehouseSection: "D-1",
    image: null, status: "REPORTED",
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date().toISOString(),
    branchId: 1
  },
  {
    id: 6, productId: 3, productName: "မော်နီတာ", barcode: "120215421003", categoryName: "အီလက်ထရောနစ်",
    quantity: 1, unit: "ခု", damageType: "Manufacturing Defect",
    reportedBy: "Admin", reportedById: 1,
    reportedDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    reportedTime: "01:00 PM",
    lossValue: 180000, notes: "မျက်နှာပြင်ပျက်စီးနေသည်",
    warehouseSection: "A-2",
    image: null, status: "COMPENSATED",
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    branchId: 1
  }
];

const SEED_LOGS = [
  { id: 1, actionType: "ADD_DAMAGE", damageId: 1, productName: "မောက်စ်", damageType: "Physical Damage", quantity: 1, lossValue: 5000, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), branchId: 1, changes: [] },
  { id: 2, actionType: "ADD_DAMAGE", damageId: 2, productName: "ကော်ဖီ", damageType: "Expired", quantity: 5, lossValue: 16000, createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), branchId: 1, changes: [] },
  { id: 3, actionType: "UPDATE_DAMAGE", damageId: 2, productName: "ကော်ဖီ", damageType: "Expired", quantity: 5, lossValue: 16000, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 3 * 86400000 + 3600000).toISOString(), branchId: 1, changes: ["Status: REPORTED → APPROVED"] },
  { id: 4, actionType: "ADD_DAMAGE", damageId: 3, productName: "တီရှပ်", damageType: "Water Damage", quantity: 2, lossValue: 12000, createdByName: "Cashier2", createdByRole: "Cashier", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), branchId: 1, changes: [] },
  { id: 5, actionType: "ADD_DAMAGE", damageId: 4, productName: "ဖိနပ်", damageType: "Cosmetic Damage", quantity: 1, lossValue: 20000, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1, changes: [] },
  { id: 6, actionType: "ADD_DAMAGE", damageId: 5, productName: "မီးသီး", damageType: "Electrical Fault", quantity: 3, lossValue: 4500, createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date().toISOString(), branchId: 1, changes: [] },
  { id: 7, actionType: "ADD_DAMAGE", damageId: 6, productName: "မော်နီတာ", damageType: "Manufacturing Defect", quantity: 1, lossValue: 180000, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), branchId: 1, changes: [] },
  { id: 8, actionType: "UPDATE_DAMAGE", damageId: 6, productName: "မော်နီတာ", damageType: "Manufacturing Defect", quantity: 1, lossValue: 180000, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 6 * 86400000).toISOString(), branchId: 1, changes: ["Status: IN_REVIEW → COMPENSATED"] },
  { id: 9, actionType: "DELETE_DAMAGE", damageId: 99, productName: "Old Damage", damageType: "Other", quantity: 1, lossValue: 1000, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 8 * 86400000).toISOString(), branchId: 1, changes: ["Damage deleted"] },
  { id: 10, actionType: "UPDATE_DAMAGE", damageId: 3, productName: "တီရှပ်", damageType: "Water Damage", quantity: 2, lossValue: 12000, createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1, changes: ["Status: REPORTED → IN_REVIEW"] }
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

const ensureDamageSeed = () => {
  const v = localStorage.getItem(SEED_VERSION_KEY);
  if (v !== SEED_VERSION) {
    saveData(DAMAGES_KEY, SEED_DAMAGES);
    saveData(LOGS_KEY, SEED_LOGS);
    saveData(PRODUCTS_KEY, SEED_PRODUCTS);
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    console.log('🌱 Damage seed loaded');
  } else {
    if (getData(DAMAGES_KEY, []).length === 0) saveData(DAMAGES_KEY, SEED_DAMAGES);
    if (getData(LOGS_KEY, []).length === 0) saveData(LOGS_KEY, SEED_LOGS);
    if (getData(PRODUCTS_KEY, []).length === 0) saveData(PRODUCTS_KEY, SEED_PRODUCTS);
  }
};

const generateDamageId = () => {
  const items = getData(DAMAGES_KEY, []);
  return items.reduce((m, d) => Math.max(m, d.id || 0), 0) + 1;
};

const generateLogId = () => {
  const logs = getData(LOGS_KEY, []);
  return logs.reduce((m, l) => Math.max(m, l.id || 0), 0) + 1;
};

const addDamageLog = (logData) => {
  const logs = getData(LOGS_KEY, []);
  const newLog = {
    id: generateLogId(),
    actionType: logData.actionType || 'ADD_DAMAGE',
    damageId: logData.damageId || 0,
    productName: logData.productName || '',
    damageType: logData.damageType || '',
    quantity: logData.quantity || 0,
    lossValue: logData.lossValue || 0,
    createdByName: logData.createdByName || 'System',
    createdByRole: logData.createdByRole || 'N/A',
    createdAt: new Date().toISOString(),
    branchId: logData.branchId || 1,
    changes: logData.changes || []
  };
  logs.unshift(newLog);
  saveData(LOGS_KEY, newLog ? logs : logs);
  return newLog;
};

// ✅ FIFO Loss Calculator
const calculateFIFOLoss = (batches, quantity) => {
  if (!batches || batches.length === 0) return 0;
  let remainingQty = quantity;
  let total = 0;
  const sorted = [...batches].sort((a, b) => a.batchId - b.batchId);
  for (const batch of sorted) {
    if (remainingQty <= 0) break;
    const takeQty = Math.min(batch.remaining, remainingQty);
    total += takeQty * batch.purchasePrice;
    remainingQty -= takeQty;
  }
  return total;
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

const UserDamagePage = () => {
  const navigate = useNavigate();
  const language = useLanguage();

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

  // ===== SEED =====
  useEffect(() => { ensureDamageSeed(); }, []);

  // ===== STATE (localStorage based) =====
  const [damages, setDamages] = useState([]);
  const [damagesMap, setDamagesMap] = useState(new Map());
  const [filteredDamages, setFilteredDamages] = useState([]);
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(null);

  const [activeTab, setActiveTab] = useState("all-damages");
  const [searchQuery, setSearchQuery] = useState("");
  const [damageTypeFilter, setDamageTypeFilter] = useState("all");

  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1 });
  const [logPagination, setLogPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1 });
  const [logFilter, setLogFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState({ filter: "all", customFrom: "", customTo: "" });

  const [summary, setSummary] = useState({ totalDamages: 0, totalLoss: 0 });
  const [damageTypeCounts, setDamageTypeCounts] = useState({});
  const [actionTypeCounts, setActionTypeCounts] = useState({ all: 0, ADD_DAMAGE: 0, UPDATE_DAMAGE: 0, DELETE_DAMAGE: 0 });

  // Local UI states
  const [showDamageModal, setShowDamageModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showProductSelect, setShowProductSelect] = useState(false);
  const [productSearch, setProductSearch] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [selectedDamage, setSelectedDamage] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [productSearchResults, setProductSearchResults] = useState([]);
  const [productSearchLoading, setProductSearchLoading] = useState(false);

  const [damageForm, setDamageForm] = useState({
    id: null, productId: "", productName: "", barcode: "", categoryName: "",
    quantity: 1, unit: "pcs", damageType: "Physical Damage",
    reportedBy: "", reportedById: null,
    reportedDate: new Date().toISOString().split('T')[0],
    reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    lossValue: 0, notes: "", warehouseSection: "",
    imageFile: null, currentImageUrl: "",
    availableStock: 0, averagePurchasePrice: 0,
    status: "REPORTED", batchDetails: []
  });

  // Refs
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const pageChangeTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);

  // Damage type options
  const damageTypeOptions = [
    { value: "Physical Damage", label_mm: "ရုပ်ပိုင်းဆိုင်ရာ ပျက်စီးမှု", label_en: "Physical Damage" },
    { value: "Electrical Fault", label_mm: "လျှပ်စစ်ချို့ယွင်းချက်", label_en: "Electrical Fault" },
    { value: "Water Damage", label_mm: "ရေပျက်စီးမှု", label_en: "Water Damage" },
    { value: "Cosmetic Damage", label_mm: "အပြင်ပန်း ပျက်စီးမှု", label_en: "Cosmetic Damage" },
    { value: "Manufacturing Defect", label_mm: "ထုတ်လုပ်မှုချို့ယွင်းချက်", label_en: "Manufacturing Defect" },
    { value: "Expired", label_mm: "သက်တမ်းကုန်", label_en: "Expired" },
    { value: "Fading/Discoloration", label_mm: "အရောင်ချွတ်ခြင်း", label_en: "Fading/Discoloration" },
    { value: "Other", label_mm: "အခြား", label_en: "Other" }
  ];

  const unitOptions = [
    { value: "pcs", label_mm: "pcs", label_en: "pcs" },
    { value: "kg", label_mm: "kg", label_en: "kg" },
    { value: "g", label_mm: "g", label_en: "g" },
    { value: "L", label_mm: "L", label_en: "L" },
    { value: "ml", label_mm: "ml", label_en: "ml" },
    { value: "box", label_mm: "box", label_en: "box" },
    { value: "pack", label_mm: "pack", label_en: "pack" }
  ];

  const statusOptions = [
    { value: "REPORTED", label_mm: "အစီရင်ခံပြီး", label_en: "Reported" },
    { value: "IN_REVIEW", label_mm: "သုံးသပ်ဆဲ", label_en: "In Review" },
    { value: "APPROVED", label_mm: "အတည်ပြုပြီး", label_en: "Approved" },
    { value: "REJECTED", label_mm: "ပယ်ချထား", label_en: "Rejected" },
    { value: "COMPENSATED", label_mm: "လျော်ကြေးပေးပြီး", label_en: "Compensated" }
  ];

  // ============================================================
  // ✅ LOAD DATA
  // ============================================================
  const loadDamages = useCallback((page = 1, size = 10, search = '', damageType = 'all') => {
    setTableLoading(true);
    try {
      let all = getData(DAMAGES_KEY, []);
      all = all.filter(d => !d.branchId || d.branchId === currentUser.branch_id);

      // Summary
      setSummary({
        totalDamages: all.length,
        totalLoss: all.reduce((s, d) => s + (Number(d.lossValue) || 0), 0)
      });

      // Damage type counts
      const dtCounts = {};
      all.forEach(d => { dtCounts[d.damageType] = (dtCounts[d.damageType] || 0) + 1; });
      setDamageTypeCounts(dtCounts);

      // Filter
      let filtered = [...all];
      if (damageType !== 'all') filtered = filtered.filter(d => d.damageType === damageType);
      if (search) {
        const q = search.toLowerCase().trim();
        filtered = filtered.filter(d =>
          d.productName?.toLowerCase().includes(q) ||
          d.barcode?.toLowerCase().includes(q) ||
          d.warehouseSection?.toLowerCase().includes(q)
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
      paged.forEach(d => map.set(d.id, d));

      setDamages(paged);
      setDamagesMap(map);
      setFilteredDamages(paged);
      setPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc });
      setPageInputValue(safePage.toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setTableLoading(false);
    }
  }, [currentUser.branch_id]);

  const loadLogs = useCallback((page = 1, size = 10, actionType = 'all', dFilter = 'all', fromDate = '', toDate = '') => {
    setLoading(true);
    try {
      let all = getData(LOGS_KEY, []);
      all = all.filter(l => !l.branchId || l.branchId === currentUser.branch_id);

      // Action counts
      setActionTypeCounts({
        all: all.length,
        ADD_DAMAGE: all.filter(l => l.actionType === 'ADD_DAMAGE').length,
        UPDATE_DAMAGE: all.filter(l => l.actionType === 'UPDATE_DAMAGE').length,
        DELETE_DAMAGE: all.filter(l => l.actionType === 'DELETE_DAMAGE').length,
      });

      if (actionType !== 'all') all = all.filter(l => l.actionType === actionType);

      // Date filter
      if (dFilter !== 'all') {
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

      const processed = all.map(log => ({
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
      setLogPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc });
      setHistoryPageInputValue(safePage.toString());
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser.branch_id]);

  // ============================================================
  // ✅ INITIAL LOAD
  // ============================================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadDamages(1, 10, '', 'all');
      loadLogs(1, 10, 'all', 'all', '', '');
    }
  }, [loadDamages, loadLogs]);

  // Filter effect
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (activeTab === 'history') return;
    if (filterTimeoutRef.current) clearTimeout(filterTimeoutRef.current);
    filterTimeoutRef.current = setTimeout(() => {
      loadDamages(1, pagination.size, searchQuery, damageTypeFilter);
    }, 500);
    return () => clearTimeout(filterTimeoutRef.current);
  }, [searchQuery, damageTypeFilter]);

  // Logs filter effect
  useEffect(() => {
    if (!initialLoadDone.current) return;
    loadLogs(1, logPagination.size, logFilter, dateFilter.filter, dateFilter.customFrom, dateFilter.customTo);
  }, [logFilter, dateFilter]);

  // Tab change
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (activeTab === 'history') loadLogs(1, logPagination.size, logFilter, dateFilter.filter, dateFilter.customFrom, dateFilter.customTo);
    else loadDamages(1, pagination.size, searchQuery, damageTypeFilter);
  }, [activeTab]);

  // Success/Error clear
  useEffect(() => {
    if (success) { const t = setTimeout(() => setSuccess(false), 3000); return () => clearTimeout(t); }
  }, [success]);
  useEffect(() => {
    if (error) { const t = setTimeout(() => setError(null), 5000); return () => clearTimeout(t); }
  }, [error]);

  // Product search
  useEffect(() => {
    if (!productSearch.trim()) { setProductSearchResults([]); return; }
    setProductSearchLoading(true);
    const timer = setTimeout(() => {
      const products = getData(PRODUCTS_KEY, []);
      const q = productSearch.toLowerCase().trim();
      const filtered = products.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.barcode?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q)
      );
      setProductSearchResults(filtered.slice(0, 20));
      setProductSearchLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [productSearch]);

  // ============================================================
  // ✅ PAGE CHANGE
  // ============================================================
  const changePage = useCallback((newPage, direction) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      loadDamages(newPage, pagination.size, searchQuery, damageTypeFilter);
      setLoadingDirection(null);
      if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
    }, 150);
  }, [pagination.page, pagination.totalPages, pagination.size, searchQuery, damageTypeFilter, loadDamages]);

  const changeHistoryPage = useCallback((newPage, direction) => {
    if (newPage === logPagination.page || newPage < 1 || newPage > logPagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      loadLogs(newPage, logPagination.size, logFilter, dateFilter.filter, dateFilter.customFrom, dateFilter.customTo);
      setLoadingDirection(null);
      if (historyContainerRef.current) historyContainerRef.current.scrollTop = 0;
    }, 150);
  }, [logPagination.page, logPagination.totalPages, logPagination.size, logFilter, dateFilter, loadLogs]);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPagination(p => ({ ...p, size: newSize, page: 1 }));
    setPageInputValue("1");
    loadDamages(1, newSize, searchQuery, damageTypeFilter);
  };

  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setLogPagination(p => ({ ...p, size: newSize, page: 1 }));
    setHistoryPageInputValue("1");
    loadLogs(1, newSize, logFilter, dateFilter.filter, dateFilter.customFrom, dateFilter.customTo);
  };

  // ============================================================
  // ✅ SEARCH & FILTER HANDLERS
  // ============================================================
  const handleTabChange = (e) => {
    const value = e.target.value;
    if (value === 'export') { setShowExportModal(true); e.target.value = activeTab; return; }
    setActiveTab(value);
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleDamageTypeFilterChange = (e) => setDamageTypeFilter(e.target.value);

  const clearAllFilters = () => {
    setSearchQuery("");
    setDamageTypeFilter("all");
    setPagination(p => ({ ...p, page: 1 }));
    setPageInputValue("1");
  };

  const handleDateFilterChange = (filter) => {
    setDateFilter(prev => ({ ...prev, filter }));
    setLogPagination(p => ({ ...p, page: 1 }));
    setHistoryPageInputValue("1");
    setShowDatePicker(filter === "custom");
    if (filter !== "custom") setDateFilter(prev => ({ ...prev, customFrom: "", customTo: "" }));
  };

  const handleCustomDateChange = (type, value) => {
    setDateFilter(prev => ({ ...prev, [type]: value }));
  };

  const handleLogFilterChange = (filter) => {
    setLogFilter(filter);
    setLogPagination(p => ({ ...p, page: 1 }));
    setHistoryPageInputValue("1");
  };

  const clearDateFilter = () => {
    setDateFilter({ filter: "all", customFrom: "", customTo: "" });
    setShowDatePicker(false);
    setLogPagination(p => ({ ...p, page: 1 }));
    setHistoryPageInputValue("1");
  };

  // ============================================================
  // ✅ PRODUCT SELECTION
  // ============================================================
  const handleSelectProduct = (product) => {
    const batchDetails = product.batchDetails || [];
    const initialLossValue = calculateFIFOLoss(batchDetails, 1);

    setDamageForm(prev => ({
      ...prev,
      productId: product.id,
      productName: product.name,
      barcode: product.barcode,
      categoryName: product.categoryName,
      unit: product.unit || 'pcs',
      availableStock: product.totalStock || 0,
      averagePurchasePrice: product.averagePurchasePrice || 0,
      batchDetails: batchDetails,
      lossValue: initialLossValue,
      quantity: 1
    }));
    setShowProductSelect(false);
    setProductSearch("");
  };

  // ============================================================
  // ✅ FORM VALIDATION
  // ============================================================
  const validateForm = () => {
    const errors = {};
    let isValid = true;
    setValidationError(null);

    if (!damageForm.productId) { errors.productId = language === 'mm' ? "ပစ္စည်းရွေးချယ်ရန် လိုအပ်ပါသည်" : "Product is required"; isValid = false; }
    if (!damageForm.quantity || damageForm.quantity < 1) { errors.quantity = language === 'mm' ? "ပမာဏ မှန်ကန်စွာ ထည့်ပါ" : "Valid quantity is required"; isValid = false; }
    if (modalType === 'add' && damageForm.quantity > damageForm.availableStock) {
      errors.quantity = language === 'mm' ? `လက်ကျန် ${damageForm.availableStock} ${damageForm.unit} သာရှိပါသည်` : `Only ${damageForm.availableStock} ${damageForm.unit} available`;
      isValid = false;
    }
    if (!damageForm.damageType) { errors.damageType = language === 'mm' ? "ပျက်စီးမှုအမျိုးအစား ရွေးချယ်ရန် လိုအပ်ပါသည်" : "Damage type is required"; isValid = false; }

    setFormErrors(errors);
    return isValid;
  };

  const isFormValid = useMemo(() => damageForm.productId && damageForm.quantity > 0 && damageForm.damageType, [damageForm.productId, damageForm.quantity, damageForm.damageType]);

  // ============================================================
  // ✅ CRUD HANDLERS
  // ============================================================
  const handleAction = (action, damageId) => {
    const damage = damagesMap.get(damageId);
    if (!damage) return;

    if (action === 'edit') {
      setDamageForm({
        id: damage.id, productId: damage.productId, productName: damage.productName,
        barcode: damage.barcode, categoryName: damage.categoryName,
        quantity: damage.quantity, unit: damage.unit || "pcs",
        damageType: damage.damageType, reportedBy: damage.reportedBy,
        reportedById: damage.reportedById,
        reportedDate: damage.reportedDate || new Date().toISOString().split('T')[0],
        reportedTime: damage.reportedTime || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        lossValue: damage.lossValue, notes: damage.notes || "",
        warehouseSection: damage.warehouseSection || "",
        imageFile: null, currentImageUrl: damage.image || "",
        status: damage.status || "REPORTED",
        availableStock: 0, averagePurchasePrice: 0, batchDetails: []
      });
      setFormErrors({});
      setModalType("edit");
      setShowDamageModal(true);
    } else if (action === 'delete') {
      if (window.confirm(language === 'mm' ? `"${damage.productName}" ပျက်စီးမှုမှတ်တမ်းကို ဖျက်ရန် သေချာပါသလား?` : `Are you sure you want to delete the damage record for "${damage.productName}"?`)) {
        setLoading(true);
        try {
          const items = getData(DAMAGES_KEY, []);
          const target = items.find(d => d.id === damageId);
          const filtered = items.filter(d => d.id !== damageId);
          saveData(DAMAGES_KEY, filtered);

          if (target) {
            addDamageLog({
              actionType: 'DELETE_DAMAGE', damageId: target.id, productName: target.productName,
              damageType: target.damageType, quantity: target.quantity, lossValue: target.lossValue,
              createdByName: currentUser.name, createdByRole: currentUser.role, branchId: currentUser.branch_id,
              changes: [`Damage deleted: ${target.productName}`]
            });
          }

          setSuccess(true);
          loadDamages(pagination.page, pagination.size, searchQuery, damageTypeFilter);
          loadLogs(1, logPagination.size, logFilter, dateFilter.filter, dateFilter.customFrom, dateFilter.customTo);
          setTimeout(() => setSuccess(false), 3000);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
      }
    } else if (action === 'view') {
      setSelectedDamage(damage);
      setShowQuickViewModal(true);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === 'quantity') {
      const qty = parseInt(value) || 0;
      const newLossValue = calculateFIFOLoss(damageForm.batchDetails, qty);
      setDamageForm(prev => ({ ...prev, [name]: qty, lossValue: newLossValue }));
    } else {
      setDamageForm(prev => ({ ...prev, [name]: value }));
    }
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleStatusChange = (status) => setDamageForm(prev => ({ ...prev, status }));

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert(language === "mm" ? "ကျေးဇူးပြု၍ ပုံဖိုင်တစ်ခုကို ရွေးချယ်ပါ။" : "Please select an image file."); return; }
    if (file.size > 5 * 1024 * 1024) { alert(language === "mm" ? "ဖိုင်အရွယ်အစား ကြီးလွန်းနေပါသည်။ 5MB အောက် ပုံတစ်ပုံကို ရွေးချယ်ပါ။" : "File size too large. Please select an image under 5MB."); return; }

    const previewUrl = URL.createObjectURL(file);
    if (damageForm.currentImageUrl && damageForm.currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(damageForm.currentImageUrl);
    }
    setDamageForm(prev => ({ ...prev, imageFile: file, currentImageUrl: previewUrl }));
  };

  const removeImage = () => {
    if (damageForm.currentImageUrl && damageForm.currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(damageForm.currentImageUrl);
    }
    setDamageForm(prev => ({ ...prev, imageFile: null, currentImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    if (damageForm.currentImageUrl && damageForm.currentImageUrl.startsWith('blob:')) {
      URL.revokeObjectURL(damageForm.currentImageUrl);
    }
    setDamageForm({
      id: null, productId: "", productName: "", barcode: "", categoryName: "",
      quantity: 1, unit: "pcs", damageType: "Physical Damage",
      reportedBy: currentUser?.name || "", reportedById: currentUser?.id || null,
      reportedDate: new Date().toISOString().split('T')[0],
      reportedTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      lossValue: 0, notes: "", warehouseSection: "",
      imageFile: null, currentImageUrl: "",
      availableStock: 0, averagePurchasePrice: 0,
      status: "REPORTED", batchDetails: []
    });
    setFormErrors({});
  };

  const openAddModal = () => {
    setModalType("add");
    resetForm();
    setShowDamageModal(true);
  };

  const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

  const handleSaveDamage = async () => {
  if (!validateForm()) return;

  try {
    setLoading(true);
    const items = getData(DAMAGES_KEY, []);
    const now = new Date().toISOString();

    // ✅ Image ကို base64 ပြောင်း (file ရှိရင်)
    let imageData = null;
    if (damageForm.imageFile) {
      imageData = await fileToBase64(damageForm.imageFile);
    } else if (damageForm.currentImageUrl && !damageForm.currentImageUrl.startsWith('blob:')) {
      // edit ဖြစ်ရင် ရှိပြီးသား image ကို သိမ်း
      imageData = damageForm.currentImageUrl;
    }

    if (modalType === 'edit' && damageForm.id) {
      const idx = items.findIndex(d => d.id === damageForm.id);
      if (idx !== -1) {
        const old = items[idx];
        items[idx] = {
          ...old,
          ...damageForm,
          image: imageData,   // ✅ image ထည့်
          updatedAt: now,
          // imageFile / currentImageUrl ကို store မလုပ်နဲ့
          imageFile: undefined,
          currentImageUrl: undefined
        };
        saveData(DAMAGES_KEY, items);

        addDamageLog({
          actionType: 'UPDATE_DAMAGE',
          damageId: old.id,
          productName: old.productName,
          damageType: old.damageType,
          quantity: old.quantity,
          lossValue: old.lossValue,
          createdByName: currentUser.name,
          createdByRole: currentUser.role,
          branchId: currentUser.branch_id,
          changes: [`Damage updated: ${old.productName}`]
        });
      }
    } else {
      const newId = generateDamageId();
      const newDamage = {
        id: newId,
        productId: damageForm.productId,
        productName: damageForm.productName,
        barcode: damageForm.barcode,
        categoryName: damageForm.categoryName,
        quantity: damageForm.quantity,
        unit: damageForm.unit,
        damageType: damageForm.damageType,
        reportedBy: damageForm.reportedBy,
        reportedById: damageForm.reportedById,
        reportedDate: damageForm.reportedDate,
        reportedTime: damageForm.reportedTime,
        lossValue: damageForm.lossValue,
        notes: damageForm.notes,
        warehouseSection: damageForm.warehouseSection,
        status: damageForm.status,
        image: imageData,   // ✅ image ထည့်
        createdByName: currentUser.name,
        createdByRole: currentUser.role,
        createdAt: now,
        branchId: currentUser.branch_id
      };
      items.unshift(newDamage);
      saveData(DAMAGES_KEY, items);

      addDamageLog({
        actionType: 'ADD_DAMAGE',
        damageId: newId,
        productName: newDamage.productName,
        damageType: newDamage.damageType,
        quantity: newDamage.quantity,
        lossValue: newDamage.lossValue,
        createdByName: currentUser.name,
        createdByRole: currentUser.role,
        branchId: currentUser.branch_id,
        changes: []
      });
    }

    setSuccess(true);
    setShowDamageModal(false);
    resetForm();
    loadDamages(1, pagination.size, searchQuery, damageTypeFilter);
    loadLogs(1, logPagination.size, logFilter, dateFilter.filter, dateFilter.customFrom, dateFilter.customTo);
    setTimeout(() => setSuccess(false), 3000);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

  // ============================================================
  // ✅ EXPORT (CSV)
  // ============================================================
  const handleExport = async (exportType) => {
    setExportLoading(true);
    try {
      await new Promise(r => setTimeout(r, 300));
      let rows = [];
      let filename = `damage_data_${new Date().toISOString().slice(0, 10)}.csv`;

      if (exportType === 'damages' || exportType === 'both') {
        const all = getData(DAMAGES_KEY, []).filter(d => !d.branchId || d.branchId === currentUser.branch_id);
        rows.push('=== DAMAGES ===');
        rows.push(['Product', 'Barcode', 'Category', 'Qty', 'Unit', 'Damage Type', 'Loss', 'Location', 'Status', 'Date'].join(','));
        all.forEach(d => {
          rows.push([`"${d.productName}"`, d.barcode, d.categoryName, d.quantity, d.unit, d.damageType, d.lossValue, d.warehouseSection, d.status, d.reportedDate].join(','));
        });
        rows.push('');
      }

      if (exportType === 'logs' || exportType === 'both') {
        const all = getData(LOGS_KEY, []).filter(l => !l.branchId || l.branchId === currentUser.branch_id);
        if (exportType === 'both') rows.push('=== LOGS ===');
        rows.push(['Action', 'Product', 'Damage Type', 'Qty', 'Loss', 'User', 'Role', 'Date'].join(','));
        all.forEach(l => {
          rows.push([l.actionType, `"${l.productName}"`, l.damageType, l.quantity, l.lossValue, `"${l.createdByName}"`, l.createdByRole, new Date(l.createdAt).toLocaleDateString()].join(','));
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
    } catch (err) { setError(err.message); }
    finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  // ============================================================
  // ✅ HELPERS
  // ============================================================
  const formatCurrency = (amount) => (amount || 0).toLocaleString('en-US') + ' Ks';

  const getActionIcon = (actionType) => {
    const map = { 'ADD_DAMAGE': 'fa-plus-circle', 'UPDATE_DAMAGE': 'fa-edit', 'DELETE_DAMAGE': 'fa-trash' };
    return map[actionType] || 'fa-history';
  };

  const getActionColor = (actionType) => {
    const map = { 'ADD_DAMAGE': '#10b981', 'UPDATE_DAMAGE': '#f59e0b', 'DELETE_DAMAGE': '#ef4444' };
    return map[actionType] || '#6b7280';
  };

  const getActionLabel = (actionType) => {
    if (language === 'mm') {
      const map = { 'ADD_DAMAGE': 'ပျက်စီးမှု အသစ်', 'UPDATE_DAMAGE': 'ပျက်စီးမှု ပြင်ဆင်', 'DELETE_DAMAGE': 'ပျက်စီးမှု ဖျက်' };
      return map[actionType] || actionType;
    }
    const map = { 'ADD_DAMAGE': 'Damage Added', 'UPDATE_DAMAGE': 'Damage Updated', 'DELETE_DAMAGE': 'Damage Deleted' };
    return map[actionType] || actionType;
  };

  const getStatusBadgeClass = (status) => {
    const map = { "REPORTED": "damage-status-reported", "IN_REVIEW": "damage-status-review", "APPROVED": "damage-status-approved", "REJECTED": "damage-status-rejected", "COMPENSATED": "damage-status-compensated" };
    return map[status] || "";
  };

  const getStatusLabel = (status) => {
    if (language === 'mm') {
      const map = { "REPORTED": "အစီရင်ခံပြီး", "IN_REVIEW": "သုံးသပ်ဆဲ", "APPROVED": "အတည်ပြုပြီး", "REJECTED": "ပယ်ချထား", "COMPENSATED": "လျော်ကြေးပေးပြီး" };
      return map[status] || status;
    }
    return status;
  };

  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const date = new Date(log.createdAt);
      const dateKey = date.toLocaleDateString(language === 'mm' ? 'my' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    });
    return grouped;
  };

  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs || []), [filteredLogs, language]);

  const showLogDetailModal = (log) => {
    setSelectedLog({ ...log, createdByName: log.createdByName || 'Unknown', createdByRole: log.createdByRole || 'N/A' });
    setShowLogDetails(true);
  };

  const triggerFileInput = () => fileInputRef.current?.click();

  const retryConnection = () => {
    setNetworkError(null);
    setError(null);
    if (activeTab === 'history') loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter.filter, dateFilter.customFrom, dateFilter.customTo);
    else loadDamages(pagination.page, pagination.size, searchQuery, damageTypeFilter);
  };

  // ============================================================
  // ✅ JSX (SAME AS ORIGINAL)
  // ============================================================
  return (
    <div className="damage-container">
      {/* Messages */}
      <div className="cat-messages-container">
        {success && (
          <div className="cat-message success">
            <i className="fas fa-check-circle"></i>
            <span>{language === 'mm' ? 'လုပ်ဆောင်မှု အောင်မြင်ပါသည်။' : 'Operation completed successfully!'}</span>
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
              <div className="error-title">{language === 'mm' ? 'ချိတ်ဆက်မှုအမှား' : 'Connection Error'}</div>
              <div className="error-message">{networkError}</div>
            </div>
            <button onClick={retryConnection}><i className="fas fa-sync-alt"></i> {language === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}</button>
          </div>
        )}
      </div>

      <div className="damage-tabs-header">
        <div className="damage-tabs-selector">
          <div className="damage-select-container">
            <i className={`fas ${activeTab === "all-damages" ? "fa-exclamation-triangle" : "fa-history"} damage-select-icon`}></i>
            <select className="damage-tab-select" value={activeTab} onChange={handleTabChange} disabled={loading || tableLoading}>
              <option value="all-damages">{language === 'mm' ? 'ပျက်စီးမှုအားလုံး' : 'All Damages'} ({summary.totalDamages?.toLocaleString() || 0})</option>
              <option value="history">{language === 'mm' ? 'မှတ်တမ်း' : 'History'} ({actionTypeCounts.all?.toLocaleString() || 0})</option>
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>{language === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}</option>
            </select>
            <i className="fas fa-chevron-down damage-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' && (
          <>
            <div className="damage-search-controls">
              <div className="damage-search-input-group">
                <i className="fas fa-search damage-search-icon"></i>
                <input type="text" className="damage-search-input"
                  placeholder={language === 'mm' ? 'ပစ္စည်းအမည်၊ ဘားကုဒ်၊ တည်နေရာ ရှာပါ...' : 'Search product, barcode, location...'}
                  value={searchQuery} onChange={handleSearchChange} disabled={tableLoading} />
                {searchQuery && <button className="damage-clear-search-btn" onClick={() => setSearchQuery("")} disabled={tableLoading}><i className="fas fa-times"></i></button>}
              </div>
            </div>
            <div className="damage-summary-cards">
              <div className="damage-summary-card total">
                <div className="damage-summary-content">
                  <div className="damage-summary-label">{language === "mm" ? "စုစုပေါင်းပျက်စီးမှု" : "Total Damages"}</div>
                  <div className="damage-summary-value">{summary?.totalDamages || 0}</div>
                </div>
              </div>
              <div className="damage-summary-card loss">
                <div className="damage-summary-content">
                  <div className="damage-summary-label">{language === "mm" ? "စုစုပေါင်းဆုံးရှုံးမှု" : "Total Loss"}</div>
                  <div className="damage-summary-value">{formatCurrency(summary?.totalLoss || 0)}</div>
                </div>
              </div>
            </div>
            <button className="damage-add-btn" onClick={openAddModal} disabled={tableLoading}>
              <i className="fas fa-plus"></i> {language === 'mm' ? 'ပျက်စီးမှုအသစ်' : 'Report Damage'}
            </button>
          </>
        )}
      </div>

      <div className="damage-subtab-content active">
        {activeTab === "history" ? (
          <div className="damage-history-section">
            <div className="damage-section-title">
              <div className="damage-title-row">
                <div className="damage-title-left">
                  <i className="fas fa-history"></i>
                  <span className="damage-title-text">{language === 'mm' ? 'ပျက်စီးမှု လုပ်ဆောင်ချက်များ' : 'Damage Activities'}</span>
                </div>
                <div className="damage-title-center">
                  <div className="damage-compact-nav">
                    <button className={`damage-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page - 1, 'prev')} disabled={logPagination.page === 1 || loading}>
                      {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="damage-page-control">
                      <input type="text" className="damage-page-input" value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(historyPageInputValue); if (!isNaN(v) && v >= 1 && v <= logPagination.totalPages && v !== logPagination.page) changeHistoryPage(v, 'jump'); else setHistoryPageInputValue(logPagination.page.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                      <span className="damage-page-total">/ {logPagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`damage-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page + 1, 'next')} disabled={logPagination.page === logPagination.totalPages || logPagination.totalPages === 0 || loading}>
                      {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="damage-items-per-page">
                      <select className="damage-per-page-select" value={logPagination.size} onChange={handleLogPageSizeChange} disabled={loading}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="damage-per-page-label">{language === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="damage-title-right">
                  {loading ? (
                    <span className="damage-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="damage-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="damage-showing-count">
                      <span className="damage-count-numbers">{logPagination.total > 0 ? ((logPagination.page - 1) * logPagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="damage-count-numbers">{Math.min(logPagination.page * logPagination.size, logPagination.total)}</span>
                      <span> / </span>
                      <span className="damage-count-numbers">{logPagination.total.toLocaleString()}</span>
                      <span className="damage-count-label">{language === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="damage-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="damage-filter-tabs" style={{ flex: '1 1 auto' }}>
                  {[
                    { v: 'all', mm: 'အားလုံး', en: 'All', count: actionTypeCounts.all },
                    { v: 'ADD_DAMAGE', mm: 'အသစ်', en: 'Add', count: actionTypeCounts.ADD_DAMAGE, icon: 'fa-plus' },
                    { v: 'UPDATE_DAMAGE', mm: 'ပြင်ဆင်', en: 'Edit', count: actionTypeCounts.UPDATE_DAMAGE, icon: 'fa-edit' },
                    { v: 'DELETE_DAMAGE', mm: 'ဖျက်', en: 'Delete', count: actionTypeCounts.DELETE_DAMAGE, icon: 'fa-trash' }
                  ].map(f => (
                    <button key={f.v} className={`damage-filter-tab ${logFilter === f.v ? 'active' : ''}`} onClick={() => handleLogFilterChange(f.v)} disabled={loading}>
                      {f.icon && <i className={`fas ${f.icon}`}></i>} {language === 'mm' ? f.mm : f.en}
                      <span className="damage-filter-count">({f.count?.toLocaleString() || 0})</span>
                    </button>
                  ))}
                </div>
                <div className="damage-filter-tabs" style={{ marginLeft: 'auto' }}>
                  {[
                    { v: 'all', mm: 'အချိန်အားလုံး', en: 'All Time' },
                    { v: 'today', mm: 'ယနေ့', en: 'Today' },
                    { v: 'yesterday', mm: 'မနေ့က', en: 'Yesterday' },
                    { v: 'thisWeek', mm: 'ဒီအပတ်', en: 'This Week' },
                    { v: 'thisMonth', mm: 'ဒီလ', en: 'This Month' },
                    { v: 'custom', mm: 'စိတ်ကြိုက်', en: 'Custom', icon: 'fa-calendar' }
                  ].map(o => (
                    <button key={o.v} className={`damage-filter-tab ${dateFilter.filter === o.v ? 'active' : ''}`} onClick={() => handleDateFilterChange(o.v)} disabled={loading}>
                      {o.icon && <i className={`fas ${o.icon}`}></i>} {language === 'mm' ? o.mm : o.en}
                    </button>
                  ))}
                  {dateFilter.filter !== 'all' && (
                    <button className="damage-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }} disabled={loading}>
                      <i className="fas fa-times"></i> {language === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>
              {showDatePicker && (
                <div className="damage-custom-date-picker">
                  <div className="damage-date-picker-row"><label>{language === 'mm' ? 'မှ' : 'From:'}</label><input type="date" className="damage-date-input" value={dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} /></div>
                  <div className="damage-date-picker-row"><label>{language === 'mm' ? 'ထိ' : 'To:'}</label><input type="date" className="damage-date-input" value={dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} /></div>
                  <button className="damage-apply-date-btn" onClick={() => { if (dateFilter.customFrom && dateFilter.customTo) { setLogPagination(p => ({ ...p, page: 1 })); setHistoryPageInputValue("1"); } }} disabled={!dateFilter.customFrom || !dateFilter.customTo}>
                    <i className="fas fa-check"></i> {language === 'mm' ? 'အတည်ပြုရန်' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="damage-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{language === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading activities...'}</p></div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="damage-date-group">
                    <div className="damage-date-header">
                      <span className="damage-date-label">{date}</span>
                      <span className="damage-date-count">{dateLogs.length} {language === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}</span>
                    </div>
                    <div className="damage-logs-list">
                      {dateLogs.map(log => {
                        let logClass = '';
                        if (log.actionType === 'ADD_DAMAGE') logClass = 'log-add';
                        else if (log.actionType === 'UPDATE_DAMAGE') logClass = 'log-edit';
                        else if (log.actionType === 'DELETE_DAMAGE') logClass = 'log-delete';
                        return (
                          <div key={log.id} className={`damage-compact-log-entry ${logClass}`} onClick={() => showLogDetailModal(log)} style={{ cursor: 'pointer' }}>
                            <div className="damage-log-icon" style={{ color: getActionColor(log.actionType) }}><i className={`fas ${getActionIcon(log.actionType)}`}></i></div>
                            <div className="damage-log-content">
                              <div className="damage-log-main-info">
                                <span className="damage-log-action">{getActionLabel(log.actionType)}</span>
                                <span className="damage-log-product">"{log.productName}"{log.damageId && <span className="damage-product-id">#{log.damageId}</span>}</span>
                              </div>
                              <div className="damage-log-details">
                                <span className="damage-log-user"><i className="fas fa-user"></i> <strong>{log.createdByName || 'Unknown'}</strong> <span className="damage-user-role">({log.createdByRole || 'N/A'})</span></span>
                                <span className="damage-log-time"><i className="fas fa-clock"></i> {log.timestamp}</span>
                                {log.changes && log.changes.length > 0 && <span className="damage-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} {language === 'mm' ? 'ခု ပြောင်းလဲမှု' : 'changes'}</span>}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-logs">
                  <i className="fas fa-clipboard-list"></i>
                  <p>{language === 'mm' ? 'ရွေးချယ်ထားသော စစ်ထုတ်မှုအတွက် လုပ်ဆောင်ချက်များ မတွေ့ပါ။' : 'No activities found.'}</p>
                  {dateFilter.filter !== 'all' && <button className="damage-clear-search-btn secondary" onClick={clearDateFilter}>{language === 'mm' ? 'စစ်ထုတ်မှုများ ရှင်းလင်းရန်' : 'Clear Filters'}</button>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="damage-section-title">
              <div className="damage-title-row">
                <div className="damage-title-left">
                  <i className="fas fa-exclamation-triangle"></i>
                  <span className="damage-title-text">{language === 'mm' ? 'ပျက်စီးမှုအားလုံး' : 'All Damages'}</span>
                </div>
                <div className="damage-title-center">
                  <div className="damage-compact-nav">
                    <button className={`damage-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page - 1, 'prev')} disabled={pagination.page === 1 || tableLoading}>
                      {tableLoading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="damage-page-control">
                      <input type="text" className="damage-page-input" value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(pageInputValue); if (!isNaN(v) && v >= 1 && v <= pagination.totalPages && v !== pagination.page) changePage(v, 'jump'); else setPageInputValue(pagination.page.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={tableLoading} />
                      <span className="damage-page-total">/ {pagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`damage-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page + 1, 'next')} disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || tableLoading}>
                      {tableLoading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="damage-items-per-page">
                      <select className="damage-per-page-select" value={pagination.size} onChange={handlePageSizeChange} disabled={tableLoading}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="damage-per-page-label">{language === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="damage-title-right">
                  {tableLoading ? (
                    <span className="damage-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="damage-loading-label">{language === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="damage-showing-count">
                      <span className="damage-count-numbers">{pagination.total > 0 ? ((pagination.page - 1) * pagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="damage-count-numbers">{Math.min(pagination.page * pagination.size, pagination.total)}</span>
                      <span> / </span>
                      <span className="damage-count-numbers">{pagination.total.toLocaleString()}</span>
                      <span className="damage-count-label">{language === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
              {(searchQuery || damageTypeFilter !== "all") && (
                <div className="damage-search-badge-container">
                  {searchQuery && <span className="damage-search-badge"><i className="fas fa-search"></i> "{searchQuery}"</span>}
                  {damageTypeFilter !== "all" && <span className="damage-filter-badge"><i className="fas fa-filter"></i> {damageTypeOptions.find(o => o.value === damageTypeFilter)?.[language === 'mm' ? 'label_mm' : 'label_en'] || damageTypeFilter}</span>}
                </div>
              )}
            </div>

            <div className="damage-table-wrapper" ref={tableBodyRef}>
              <table className="damage-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{language === 'mm' ? 'ပုံ' : 'Image'}</th>
                    <th>{language === 'mm' ? 'ပစ္စည်း' : 'Product'}</th>
                    <th>{language === 'mm' ? 'အမျိုးအစား' : 'Category'}</th>
                    <th>{language === 'mm' ? 'ပမာဏ' : 'Qty'}</th>
                    <th>{language === 'mm' ? 'ပျက်စီးမှုအမျိုးအစား' : 'Damage Type'}</th>
                    <th>{language === 'mm' ? 'ဆုံးရှုံးမှုတန်ဖိုး' : 'Loss Value'}</th>
                    <th>{language === 'mm' ? 'တည်နေရာ' : 'Location'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'တင်သွင်းချိန်' : 'Reported'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="11" className="damage-no-data"><div className="damage-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{language === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p></div></td></tr>
                  ) : filteredDamages.length > 0 ? (
                    filteredDamages.map((damage, index) => (
                      <tr key={damage.id}>
                        <td>{((pagination.page - 1) * pagination.size) + index + 1}</td>
                        <td className="damage-image-cell">
                          {damage.image ? (
                            <img src={damage.image} alt={damage.productName} className="damage-image" loading="lazy" onError={(e) => { e.target.style.display = 'none'; }} />
                          ) : (
                            <div className="damage-image-fallback">{damage.productName?.charAt(0).toUpperCase() || '?'}</div>
                          )}
                        </td>
                        <td><div><strong>{damage.productName}</strong>{damage.barcode && <div className="damage-product-info"><i className="fas fa-barcode"></i> {damage.barcode}</div>}</div></td>
                        <td>{damage.categoryName || '-'}</td>
                        <td><div className="damage-quantity">{damage.quantity} {damage.unit || 'pcs'}</div></td>
                        <td><span className="damage-type-badge">{language === 'mm' ? (damageTypeOptions.find(o => o.value === damage.damageType)?.label_mm || damage.damageType) : damage.damageType}</span></td>
                        <td className="damage-loss-cell"><div className={`damage-loss-value ${damage.lossValue > 0 ? 'has-loss' : 'no-loss'}`}>{damage.lossValue > 0 ? formatCurrency(damage.lossValue) : '-'}</div></td>
                        <td><div className="damage-warehouse-info">{damage.warehouseSection || '-'}</div></td>
                        <td><span className={`damage-status-badge ${getStatusBadgeClass(damage.status)}`}>{getStatusLabel(damage.status)}</span></td>
                        <td><div className="damage-reported-info"><div className="damage-reported-date">{damage.reportedDate}</div><div className="damage-reported-time">{damage.reportedTime}</div><div className="damage-reported-by"><i className="fas fa-user"></i> {damage.reportedBy}</div></div></td>
                        <td>
                          <div className="damage-action-buttons">
                            <button className="damage-action-btn damage-action-view" onClick={(e) => { e.stopPropagation(); handleAction('view', damage.id); }} disabled={loading}><i className="fas fa-eye"></i></button>
                            <button className="damage-action-btn damage-action-edit" onClick={(e) => { e.stopPropagation(); handleAction('edit', damage.id); }} disabled={loading}><i className="fas fa-edit"></i></button>
                            <button className="damage-action-btn damage-action-delete" onClick={(e) => { e.stopPropagation(); handleAction('delete', damage.id); }} disabled={loading}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="11" className="damage-no-data"><div className="damage-no-data-content"><i className="fas fa-folder-open"></i><p>{searchQuery ? (language === 'mm' ? `"${searchQuery}" အတွက် ပျက်စီးမှုများ မတွေ့ပါ` : `No damages found for "${searchQuery}"`) : (language === 'mm' ? "ပျက်စီးမှုများ မတွေ့ပါ" : "No damages found")}</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Damage Modal */}
      <DamageModal
        show={showDamageModal}
        onClose={() => setShowDamageModal(false)}
        modalType={modalType}
        damageForm={damageForm}
        onFormChange={handleFormChange}
        onStatusChange={handleStatusChange}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
        onSave={handleSaveDamage}
        onSelectProduct={() => setShowProductSelect(true)}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={language}
        fileInputRef={fileInputRef}
        damageTypeOptions={damageTypeOptions}
        unitOptions={unitOptions}
        statusOptions={statusOptions}
        damageApi={{ getImageUrl: (f) => f }}
        isFormValid={isFormValid}
        triggerFileInput={triggerFileInput}
      />

      {/* Quick View Modal */}
      {showQuickViewModal && selectedDamage && (
        <div className="damage-modal-overlay">
          <div className="damage-modal-content" style={{ maxWidth: '600px' }}>
            <div className="damage-modal-header">
              <h3><i className="fas fa-eye"></i> {language === 'mm' ? 'ပျက်စီးမှုအသေးစိတ်' : 'Damage Details'}</h3>
              <button className="damage-modal-close" onClick={() => setShowQuickViewModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="damage-modal-body">
              <div className="quick-view-header">
                <h3>{selectedDamage.productName}</h3>
                <span className={`quick-view-status-badge ${getStatusBadgeClass(selectedDamage.status)}`}>{getStatusLabel(selectedDamage.status)}</span>
              </div>
              {selectedDamage.notes && (
                <div className="quick-view-description">
                  <i className="fas fa-quote-left"></i>
                  <p>{selectedDamage.notes}</p>
                </div>
              )}
              <div className="quick-view-grid">
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-exclamation-triangle"></i> {language === 'mm' ? 'ပျက်စီးမှုအမျိုးအစား' : 'Damage Type'}:</span><span className="quick-view-value">{language === 'mm' ? (damageTypeOptions.find(o => o.value === selectedDamage.damageType)?.label_mm || selectedDamage.damageType) : selectedDamage.damageType}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-balance-scale"></i> {language === 'mm' ? 'ပမာဏ' : 'Quantity'}:</span><span className="quick-view-value">{selectedDamage.quantity} {selectedDamage.unit || 'pcs'}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-dollar-sign"></i> {language === 'mm' ? 'ဆုံးရှုံးမှုတန်ဖိုး' : 'Loss Value'}:</span><span className="quick-view-value loss-value" style={{ color: "#f72585" }}>{formatCurrency(selectedDamage.lossValue)}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-map-marker-alt"></i> {language === 'mm' ? 'တည်နေရာ' : 'Location'}:</span><span className="quick-view-value">{selectedDamage.warehouseSection || '-'}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-barcode"></i> {language === 'mm' ? 'ဘားကုဒ်' : 'Barcode'}:</span><span className="quick-view-value">{selectedDamage.barcode || '-'}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-layer-group"></i> {language === 'mm' ? 'အမျိုးအစား' : 'Category'}:</span><span className="quick-view-value">{selectedDamage.categoryName || '-'}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="far fa-calendar"></i> {language === 'mm' ? 'တင်သွင်းရက်' : 'Reported Date'}:</span><span className="quick-view-value">{selectedDamage.reportedDate}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-clock"></i> {language === 'mm' ? 'အချိန်' : 'Time'}:</span><span className="quick-view-value">{selectedDamage.reportedTime}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-user"></i> {language === 'mm' ? 'တင်သွင်းသူ' : 'Reported By'}:</span><span className="quick-view-value">{selectedDamage.reportedBy}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-hashtag"></i> ID:</span><span className="quick-view-value">#{selectedDamage.id}</span></div>
              </div>
            </div>
            <div className="damage-modal-footer">
              <button className="damage-btn-edit" onClick={() => { setShowQuickViewModal(false); handleAction('edit', selectedDamage.id); }}><i className="fas fa-edit"></i> {language === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit'}</button>
              <button className="damage-btn-cancel" onClick={() => setShowQuickViewModal(false)}>{language === 'mm' ? 'ပိတ်ရန်' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <DamageExportModal show={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} loading={exportLoading} language={language} />

      {/* Product Select Modal */}
      {showProductSelect && (
        <div className="damage-modal-overlay">
          <div className="damage-modal-content" style={{ maxWidth: '1000px', maxHeight: '80vh' }}>
            <div className="damage-modal-header">
              <h3><i className="fas fa-boxes"></i> {language === "mm" ? "ပစ္စည်းရွေးချယ်ရန်" : "Select Product"}</h3>
              <button className="damage-modal-close" onClick={() => setShowProductSelect(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="damage-modal-body">
              <div className="damage-product-search-box">
                <i className="fas fa-search"></i>
                <input type="text" placeholder={language === "mm" ? "ပစ္စည်းအမည် သို့မဟုတ် ဘားကုဒ် ရှာပါ..." : "Search product name or barcode..."} value={productSearch} onChange={(e) => setProductSearch(e.target.value)} autoFocus />
                {productSearchLoading && <i className="fas fa-spinner fa-spin" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)' }}></i>}
              </div>
              <div className="damage-product-list-container">
                {productSearchResults.length > 0 ? (
                  <div className="damage-product-table-wrapper">
                    <table className="damage-product-table">
                      <thead>
                        <tr>
                          <th>{language === "mm" ? "နံပါတ်" : "No"}</th>
                          <th>{language === "mm" ? "ပစ္စည်း" : "Product"}</th>
                          <th>{language === "mm" ? "ဘားကုဒ်" : "Barcode"}</th>
                          <th>{language === "mm" ? "အမျိုးအစား" : "Category"}</th>
                          <th>{language === "mm" ? "လက်ကျန်" : "Stock"}</th>
                          <th>{language === "mm" ? "လုပ်ဆောင်ချက်" : "Action"}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productSearchResults.map((product, index) => (
                          <tr key={product.id} className="damage-product-table-row">
                            <td>{index + 1}</td>
                            <td><div className="damage-product-table-info"><div className="damage-product-table-name">{product.name}</div>{product.sku && <small>SKU: {product.sku}</small>}</div></td>
                            <td><div className="damage-product-table-barcode">{product.barcode}</div></td>
                            <td><span className="damage-product-table-category">{product.categoryName || 'N/A'}</span></td>
                            <td><div className="damage-product-table-stock"><span className={`damage-stock-badge ${(product.totalStock || 0) > 0 ? 'in-stock' : 'out-of-stock'}`}>{product.totalStock || 0} {product.unit || 'pcs'}</span></div></td>
                            <td><button className="damage-product-select-btn" onClick={() => handleSelectProduct(product)} disabled={(product.totalStock || 0) === 0}><i className="fas fa-check"></i> {language === "mm" ? "ရွေးချယ်မည်" : "Select"}</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="damage-no-products">
                    <i className="fas fa-search"></i>
                    <p>{language === "mm" ? "ပစ္စည်းမတွေ့ပါ" : "No products found"}</p>
                    <small>{language === "mm" ? "ရှာဖွေမှုစကားလုံးကိုပြောင်းလဲကြည့်ပါ" : "Try changing your search term"}</small>
                  </div>
                )}
              </div>
            </div>
            <div className="damage-modal-footer">
              <button className="damage-btn-cancel" onClick={() => setShowProductSelect(false)}><i className="fas fa-times"></i> {language === "mm" ? "ပိတ်မည်" : "Close"}</button>
              <div className="damage-product-count">{productSearchResults.length} {language === "mm" ? "ပစ္စည်း တွေ့ရှိပါသည်" : "products found"}</div>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showLogDetails && selectedLog && (
        <div className="damage-modal-overlay">
          <div className="damage-modal-content" style={{ maxWidth: '600px' }}>
            <div className="damage-modal-header">
              <h3><i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i> {language === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}</h3>
              <button className="damage-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="damage-modal-body">
              <div className="damage-log-detail-header">
                <div className="damage-log-detail-main">
                  <div className="damage-log-detail-action">
                    <span className={`damage-action-badge damage-action-${selectedLog.actionType === 'ADD_DAMAGE' ? 'add' : selectedLog.actionType === 'UPDATE_DAMAGE' ? 'edit' : 'delete'}`}>
                      <i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i> {getActionLabel(selectedLog.actionType)}
                    </span>
                  </div>
                  {selectedLog.productName && (
                    <div className="damage-log-detail-product">
                      <i className="fas fa-box"></i>
                      <span className="damage-product-name">{selectedLog.productName}</span>
                      {selectedLog.damageId && <span className="damage-product-id-detail">ID: #{selectedLog.damageId}</span>}
                    </div>
                  )}
                </div>
                <div className="damage-log-detail-meta">
                  <div className="damage-log-detail-user"><i className="fas fa-user"></i><div><div className="damage-user-name-detail"><strong>{selectedLog.createdByName || 'Unknown'}</strong></div><div className="damage-user-role-detail">{selectedLog.createdByRole || 'N/A'}</div></div></div>
                  <div className="damage-log-detail-time"><i className="fas fa-calendar"></i><div><div className="damage-log-date-detail">{selectedLog.date}</div><div className="damage-log-time-detail">{selectedLog.timestamp}</div></div></div>
                </div>
              </div>
              <div className="damage-log-detail-content">
                <h4>{language === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="damage-change-list">
                    {selectedLog.changes.map((detail, index) => (
                      <div key={index} className="damage-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="damage-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>{language === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No changes recorded'}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="damage-modal-footer">
              <button className="damage-btn-cancel" onClick={() => setShowLogDetails(false)}>{language === 'mm' ? 'ပိတ်ရန်' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDamagePage;