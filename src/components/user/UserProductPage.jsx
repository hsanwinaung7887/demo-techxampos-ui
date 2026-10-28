// UserProductPage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import ProductModal from './ProductModal';
import ProductExportModal from './ProductExportModal';
import imageCompression from 'browser-image-compression';
import "../../light-style/user-css/userProductPage.css";
import { useSelector } from 'react-redux';

// ============================================================
// ✅ JSON SEED DATA
// ============================================================
const PRODUCTS_KEY = "demo_products";
const PROD_LOGS_KEY = "demo_product_logs";

// ✅ Placeholder SVG ပုံ
const makeImage = (letter, bg = "#4361ee") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="120" height="120" rx="12" fill="${bg}"/>
      <text x="50%" y="55%" font-family="Arial" font-size="52" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    </svg>`)}`;

const SEED_PRODUCTS = [
  { id: 1, name: "ကီးဘုတ်", description: "စံကီးဘုတ် USB", barcode: "120215421001", sku: "PRD-001", categoryId: 1, categoryName: "အီလက်ထရောနစ်", unit: "pcs", costPrice: 8000, sellingPrice: 12000, minStock: 5, totalStock: 25, status: "Active", notes: "", image: makeImage("က", "#4361ee"), createdAt: new Date(Date.now() - 9*86400000).toISOString() },
  { id: 2, name: "မောက်စ်", description: "ကြိုးမဲ့ မောက်စ်", barcode: "120215421002", sku: "PRD-002", categoryId: 1, categoryName: "အီလက်ထရောနစ်", unit: "pcs", costPrice: 5000, sellingPrice: 8500, minStock: 5, totalStock: 3, status: "Active", notes: "", image: makeImage("မ", "#10b981"), createdAt: new Date(Date.now() - 7*86400000).toISOString() },
  { id: 3, name: "စာအုပ်မှတ်စု", description: "A5 မှတ်စုစာအုပ်", barcode: "120215421003", sku: "PRD-003", categoryId: 5, categoryName: "စာရေးကိရိယာ", unit: "ခု", costPrice: 1500, sellingPrice: 2500, minStock: 10, totalStock: 50, status: "Active", notes: "", image: makeImage("စ", "#f59e0b"), createdAt: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 4, name: "ဖောင်တိန်", description: "အပြာရောင် ဖောင်တိန်", barcode: "120215421004", sku: "PRD-004", categoryId: 5, categoryName: "စာရေးကိရိယာ", unit: "ချောင်း", costPrice: 800, sellingPrice: 1500, minStock: 20, totalStock: 0, status: "Inactive", notes: "ပစ္စည်းပြတ်", image: makeImage("ဖ", "#f72585"), createdAt: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 5, name: "ရေသောက်ဗူး", description: "စတီးရေဗူး 1L", barcode: "120215421005", sku: "PRD-005", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း", unit: "ဗူး", costPrice: 3500, sellingPrice: 5000, minStock: 10, totalStock: 18, status: "Active", notes: "", image: makeImage("ရ", "#8b5cf6"), createdAt: new Date(Date.now() - 1*86400000).toISOString() },
];

const SEED_LOGS = [
  { id: 1, actionType: "ADD",    productId: 1, productName: "ကီးဘုတ်",       createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 9*86400000).toISOString(), changes: ["အမည်: ကီးဘုတ်", "SKU: PRD-001", "ရောင်းဈေး: 12,000 MMK", "အခြေအနေ: အသုံးပြုနိုင်"] },
  { id: 2, actionType: "EDIT",   productId: 2, productName: "မောက်စ်",         createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 5*86400000).toISOString(), changes: ["ရောင်းဈေး: 8,000 → 8,500 MMK"] },
  { id: 3, actionType: "DELETE", productId: 9, productName: "ပစ္စည်းဟောင်း", createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 2*86400000).toISOString(), changes: ["ပစ္စည်းကို ဖျက်လိုက်ပါပြီ"] },
];

// ✅ localStorage helpers
const getData = (key, seed) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) { localStorage.setItem(key, JSON.stringify(seed)); return seed; }
    return JSON.parse(raw);
  } catch { return seed; }
};
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// ✅ Format helpers
const formatCurrency = (amount) => (amount?.toLocaleString() || '0') + ' MMK';
const formatPercentage = (value) => (value || 0).toFixed(2) + '%';
const formatDate = (iso, lang) => {
  try {
    return new Date(iso).toLocaleDateString(lang === 'mm' ? 'my-MM' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch { return ''; }
};
const formatDateTime = (iso, lang) => {
  try {
    return new Date(iso).toLocaleString(lang === 'mm' ? 'my-MM' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch { return ''; }
};

const getStockStatusClass = (product) => {
  if (!product) return '';
  const stock = product.totalStock || 0;
  const min = product.minStock || 0;
  if (stock === 0) return 'stock-out';
  if (stock <= min) return 'stock-low';
  return 'stock-normal';
};

const getActionIcon = (type) => ({ ADD: 'fa-plus-circle', EDIT: 'fa-edit', DELETE: 'fa-trash' }[type] || 'fa-history');
const getActionColor = (type) => ({ ADD: '#10b981', EDIT: '#f59e0b', DELETE: '#ef4444' }[type] || '#6b7280');
const getActionLabel = (type, lang) =>
  type === 'ADD' ? (lang === 'mm' ? 'ပစ္စည်းအသစ်ထည့်ခြင်း' : 'Product Added')
  : type === 'EDIT' ? (lang === 'mm' ? 'ပစ္စည်းပြင်ဆင်ခြင်း' : 'Product Updated')
  : (lang === 'mm' ? 'ပစ္စည်းဖျက်ခြင်း' : 'Product Deleted');

const getStatusLabel = (status, lang) =>
  status === 'Active' ? (lang === 'mm' ? 'အသုံးပြုနိုင်' : 'Active')
  : (lang === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive');

const groupLogsByDate = (logs, lang) => {
  const grouped = {};
  logs.forEach(log => {
    const key = formatDate(log.createdAt, lang);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(log);
  });
  return grouped;
};

// ✅ Categories (from demo_categories if exist, else defaults)
const getCategories = () => {
  try {
    const raw = localStorage.getItem("demo_categories");
    if (raw) return JSON.parse(raw);
  } catch {}
  return [
    { id: 1, name: "အီလက်ထရောနစ်", status: "Active" },
    { id: 2, name: "အစားအသောက်", status: "Active" },
    { id: 3, name: "အဝတ်အထည်", status: "Active" },
    { id: 4, name: "အိမ်သုံးပစ္စည်း", status: "Inactive" },
    { id: 5, name: "စာရေးကိရိယာ", status: "Active" },
  ];
};

// ============================================================
// ✅ COMPONENT
// ============================================================
const UserProductPage = () => {
  const navigate = useNavigate();

  // ✅ language default mm
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem("appLanguage") || localStorage.getItem("pos-language");
    if (stored) return stored;
    localStorage.setItem("appLanguage", "mm");
    return "mm";
  });

  // ✅ Current user
  const { user: reduxUser, isAuthenticated } = useSelector((state) => state.auth);
  const currentUser = useMemo(() => {
    if (reduxUser && isAuthenticated) return reduxUser;
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, [reduxUser, isAuthenticated]);

  // ===== Local states =====
  const [products, setProducts] = useState([]);
  const [logs, setLogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("all-products");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
  const [networkError, setNetworkError] = useState(null);

  // UI
  const [showProductModal, setShowProductModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);

  // Form
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [productForm, setProductForm] = useState({
    id: null, name: "", description: "", barcode: "", sku: "",
    categoryId: "", unit: "pcs", costPrice: "", sellingPrice: "",
    profit: 0, margin: 0, minStock: 0, status: "Active", notes: "",
    imageFile: null, currentImageUrl: "",
  });

  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // ✅ Language listener
  useEffect(() => {
    const handler = (e) => setLang(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);

  // ✅ Initial load
  useEffect(() => {
    setTableLoading(true);
    const t = setTimeout(() => {
      setProducts(getData(PRODUCTS_KEY, SEED_PRODUCTS));
      setLogs(getData(PROD_LOGS_KEY, SEED_LOGS));
      setCategories(getCategories());
      setTableLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // ===== Filtered products =====
  const filteredProducts = useMemo(() => {
    let list = [...products];
    if (activeTab === "active") list = list.filter(p => p.status === "Active");
    else if (activeTab === "inactive") list = list.filter(p => p.status === "Inactive");
    if (statusFilter !== "all") list = list.filter(p => p.status === statusFilter);
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
  }, [products, activeTab, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ===== Status counts =====
  const statusCounts = useMemo(() => ({
    all: products.length,
    Active: products.filter(p => p.status === "Active").length,
    Inactive: products.filter(p => p.status === "Inactive").length,
  }), [products]);

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
              const to = new Date(dateFilter.customTo); to.setHours(23,59,59,999);
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

  const groupedLogs = useMemo(() => groupLogsByDate(pagedLogs, lang), [pagedLogs, lang]);

  const logCounts = useMemo(() => ({
    all: logs.length,
    ADD: logs.filter(l => l.actionType === "ADD").length,
    EDIT: logs.filter(l => l.actionType === "EDIT").length,
    DELETE: logs.filter(l => l.actionType === "DELETE").length,
  }), [logs]);

  // ============================================================
  // ✅ LOGGING
  // ============================================================
  const logAction = (actionType, product, changes) => {
    const newLog = {
      id: logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      actionType,
      productId: product.id,
      productName: product.name,
      createdByName: currentUser?.fullName || currentUser?.username || "မသိသော အသုံးပြုသူ",
      createdByRole: currentUser?.role || "N/A",
      createdAt: new Date().toISOString(),
      changes,
    };
    const updated = [...logs, newLog];
    setLogs(updated);
    saveData(PROD_LOGS_KEY, updated);
  };

  // ============================================================
  // ✅ CRUD
  // ============================================================
  const validateForm = () => {
    const errors = {};
    if (!productForm.name.trim()) errors.name = "ပစ္စည်းအမည် လိုအပ်ပါသည်";
    if (!productForm.barcode.trim()) errors.barcode = "ဘားကုဒ် လိုအပ်ပါသည်";
    if (!productForm.sku.trim()) errors.sku = "SKU လိုအပ်ပါသည်";
    if (!productForm.categoryId) errors.categoryId = "အမျိုးအစား ရွေးချယ်ပါ";
    if (!productForm.sellingPrice || parseFloat(productForm.sellingPrice) <= 0) errors.sellingPrice = "ရောင်းဈေး ထည့်သွင်းပါ";
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isFormValid = useMemo(() => (
    productForm.name.trim() !== '' &&
    productForm.barcode.trim() !== '' &&
    productForm.sku.trim() !== '' &&
    productForm.categoryId !== '' &&
    productForm.sellingPrice && parseFloat(productForm.sellingPrice) > 0
  ), [productForm]);

  const handleSaveProduct = async () => {
    if (!validateForm()) {
      setValidationError("ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ");
      return;
    }
    setValidationError(null);
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    const cat = categories.find(c => c.id.toString() === productForm.categoryId.toString());

    if (modalType === "add") {
      const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;
      const newProduct = {
        id: newId,
        name: productForm.name.trim(),
        description: productForm.description?.trim() || "",
        barcode: productForm.barcode.trim(),
        sku: productForm.sku.trim(),
        categoryId: parseInt(productForm.categoryId),
        categoryName: cat?.name || "",
        unit: productForm.unit || "pcs",
        costPrice: parseFloat(productForm.costPrice) || 0,
        sellingPrice: parseFloat(productForm.sellingPrice) || 0,
        minStock: parseInt(productForm.minStock) || 0,
        totalStock: 0,
        status: productForm.status || "Active",
        notes: productForm.notes?.trim() || "",
        image: productForm.currentImageUrl || makeImage(productForm.name.charAt(0).toUpperCase()),
        createdAt: new Date().toISOString(),
      };
      const updated = [newProduct, ...products];
      setProducts(updated);
      saveData(PRODUCTS_KEY, updated);
      logAction("ADD", newProduct, [
        `အမည်: ${newProduct.name}`,
        `ဘားကုဒ်: ${newProduct.barcode}`,
        `SKU: ${newProduct.sku}`,
        `ရောင်းဈေး: ${formatCurrency(newProduct.sellingPrice)}`,
        `အခြေအနေ: ${newProduct.status === 'Active' ? 'အသုံးပြုနိုင်' : 'အသုံးမပြုနိုင်'}`,
      ]);
      setSuccess(true);
    } else {
      const old = products.find(p => p.id === productForm.id);
      const updatedProduct = {
        ...old,
        name: productForm.name.trim(),
        description: productForm.description?.trim() || "",
        barcode: productForm.barcode.trim(),
        sku: productForm.sku.trim(),
        categoryId: parseInt(productForm.categoryId),
        categoryName: cat?.name || old.categoryName,
        unit: productForm.unit || "pcs",
        costPrice: parseFloat(productForm.costPrice) || 0,
        sellingPrice: parseFloat(productForm.sellingPrice) || 0,
        minStock: parseInt(productForm.minStock) || 0,
        status: productForm.status || "Active",
        notes: productForm.notes?.trim() || "",
        image: productForm.currentImageUrl || old.image,
      };
      const updated = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
      setProducts(updated);
      saveData(PRODUCTS_KEY, updated);

      const changes = [];
      if (old.name !== updatedProduct.name) changes.push(`အမည်: ${old.name} → ${updatedProduct.name}`);
      if (old.sellingPrice !== updatedProduct.sellingPrice) changes.push(`ရောင်းဈေး: ${formatCurrency(old.sellingPrice)} → ${formatCurrency(updatedProduct.sellingPrice)}`);
      if (old.costPrice !== updatedProduct.costPrice) changes.push(`ဝယ်ဈေး: ${formatCurrency(old.costPrice)} → ${formatCurrency(updatedProduct.costPrice)}`);
      if (old.status !== updatedProduct.status) {
        changes.push(`အခြေအနေ: ${getStatusLabel(old.status, lang)} → ${getStatusLabel(updatedProduct.status, lang)}`);
      }
      if (old.image !== updatedProduct.image) changes.push(`ပုံ: ပြောင်းလဲပြီး`);
      if (!changes.length) changes.push("ပြင်ဆင်ပြီးပါပြီ");
      logAction("EDIT", updatedProduct, changes);
      setSuccess(true);
    }
    setLoading(false);
    setShowProductModal(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = async (productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    if (!window.confirm(`"${product.name}" ပစ္စည်းကို ဖျက်ရန် သေချာပါသလား?`)) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 250));
    const updated = products.filter(p => p.id !== productId);
    setProducts(updated);
    saveData(PRODUCTS_KEY, updated);
    logAction("DELETE", product, [`"${product.name}" ပစ္စည်းကို ဖျက်လိုက်ပါပြီ`]);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAction = (action, productId) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (action === 'edit') {
      setProductForm({
        id: product.id,
        name: product.name,
        description: product.description || '',
        barcode: product.barcode,
        sku: product.sku,
        categoryId: product.categoryId ? product.categoryId.toString() : '',
        unit: product.unit || 'pcs',
        costPrice: product.costPrice || '',
        sellingPrice: product.sellingPrice || '',
        profit: (product.sellingPrice || 0) - (product.costPrice || 0),
        margin: product.costPrice > 0 ? (((product.sellingPrice || 0) - (product.costPrice || 0)) / product.costPrice) * 100 : 0,
        minStock: product.minStock || 0,
        status: product.status || 'Active',
        notes: product.notes || '',
        imageFile: null,
        currentImageUrl: product.image || '',
      });
      setFormErrors({});
      setModalType('edit');
      setShowProductModal(true);
    } else if (action === 'delete') {
      handleDelete(productId);
    } else if (action === 'view') {
      setSelectedProduct(product);
      setShowQuickViewModal(true);
    }
  };

  // ===== Form handlers =====
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };
  const handleStatusChange = (status) => setProductForm(prev => ({ ...prev, status }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { alert('ကျေးဇူးပြု၍ ပုံဖိုင်တစ်ခုကို ရွေးချယ်ပါ။'); return; }
    if (file.size > 5 * 1024 * 1024) { alert('5MB အောက် ပုံကို ရွေးပါ။'); return; }
    try {
      setLoading(true);
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true });
      // ✅ base64 ပြောင်း — refresh လုပ်လည် ကျန်နေ
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });
      setProductForm(prev => ({ ...prev, imageFile: compressed, currentImageUrl: base64 }));
    } catch (err) {
      console.error(err);
      alert('ပုံကို ချုံ့ရာတွင် မအောင်မြင်ပါ။');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setProductForm(prev => ({ ...prev, imageFile: null, currentImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setProductForm({
      id: null, name: "", description: "", barcode: "", sku: "",
      categoryId: "", unit: "pcs", costPrice: "", sellingPrice: "",
      profit: 0, margin: 0, minStock: 0, status: "Active", notes: "",
      imageFile: null, currentImageUrl: "",
    });
    setFormErrors({});
    setValidationError(null);
  };

  const openAddModal = () => {
    setModalType('add');
    resetForm();
    setShowProductModal(true);
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

  // ===== Tab =====
  const handleTabChange = (e) => {
    const value = e.target.value;
    if (value === 'export') { setShowExportModal(true); e.target.value = activeTab; return; }
    setActiveTab(value);
    setPage(1); setLogPage(1);
    setPageInputValue("1"); setHistoryPageInputValue("1");
  };

  // ===== Export =====
  const handleExport = async (exportType) => {
    setExportLoading(true);
    await new Promise(r => setTimeout(r, 500));
    try {
      let rows = [];
      if (exportType === "products" || exportType === "both") {
        rows.push(["=== ပစ္စည်းများ ==="]);
        rows.push(["နံပါတ်", "အမည်", "ဘားကုဒ်", "SKU", "အမျိုးအစား", "ယူနစ်", "ဝယ်ဈေး", "ရောင်းဈေး", "လက်ကျန်", "အခြေအနေ", "ဖန်တီးရက်"]);
        products.forEach(p => rows.push([
          p.id, p.name, p.barcode, p.sku, p.categoryName, p.unit,
          p.costPrice, p.sellingPrice, p.totalStock,
          p.status === 'Active' ? 'အသုံးပြုနိုင်' : 'အသုံးမပြုနိုင်',
          formatDateTime(p.createdAt, lang)
        ]));
        rows.push([]);
      }
      if (exportType === "logs" || exportType === "both") {
        rows.push(["=== မှတ်တမ်းများ ==="]);
        rows.push(["နံပါတ်", "လုပ်ဆောင်ချက်", "ပစ္စည်း", "လုပ်သူ", "ရာထူး", "အချိန်", "ပြောင်းလဲမှုများ"]);
        logs.forEach(l => rows.push([
          l.id, l.actionType, l.productName, l.createdByName, l.createdByRole,
          formatDateTime(l.createdAt, lang),
          (l.changes || []).join(" | ")
        ]));
      }
      const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `product_export_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link); link.click(); document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error(err);
      setError("တင်ပို့ရာတွင် မအောင်မြင်ပါ");
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  const showLogDetailModal = (log) => { setSelectedLog(log); setShowLogDetails(true); };

  if (!currentUser) {
    return (
      <div className="prod-container">
        <div className="loading-state" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginRight: '15px' }}></i>
          <p style={{ fontSize: '18px' }}>အသုံးပြုသူဒေတာ ဖွင့်နေသည်...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="prod-container">
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

      <div className="prod-tabs-header">
        <div className="prod-tabs-selector">
          <div className="prod-select-container">
            <i className={`fas ${
              activeTab === 'all-products' ? 'fa-boxes' :
              activeTab === 'active' ? 'fa-check-circle' :
              activeTab === 'inactive' ? 'fa-times-circle' : 'fa-history'
            } prod-select-icon`}></i>
            <select className="prod-tab-select" value={activeTab} onChange={handleTabChange} disabled={loading || tableLoading}>
              <option value="all-products">ပစ္စည်းအားလုံး ({statusCounts.all})</option>
              <option value="active">အသုံးပြုနိုင် ({statusCounts.Active})</option>
              <option value="inactive">အသုံးမပြုနိုင် ({statusCounts.Inactive})</option>
              <option value="history">မှတ်တမ်း ({logCounts.all})</option>
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>ဒေတာတင်ပို့ရန်</option>
            </select>
            <i className="fas fa-chevron-down prod-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' && (
          <>
            <div className="prod-search-controls">
              <div className="prod-search-input-group">
                <i className="fas fa-search prod-search-icon"></i>
                <input type="text" className="prod-search-input"
                  placeholder="အမည်၊ ဘားကုဒ်၊ SKU ဖြင့်ရှာဖွေရန်..."
                  value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} disabled={tableLoading} />
                {searchQuery && (
                  <button className="prod-clear-search-btn" onClick={() => { setSearchQuery(""); setPage(1); }} disabled={tableLoading}><i className="fas fa-times"></i></button>
                )}
              </div>
            </div>

            <div className="prod-action-container">
              <button className="prod-add-btn" onClick={openAddModal} disabled={tableLoading}>
                <i className="fas fa-plus"></i> ပစ္စည်းအသစ် ထည့်ရန်
              </button>
            </div>
          </>
        )}
      </div>

      <div className="subtab-content active">
        {activeTab === 'history' ? (
          /* ===== HISTORY ===== */
          <div className="prod-history-section">
            <div className="prod-section-title">
              <div className="prod-title-row">
                <div className="prod-title-left">
                  <i className="fas fa-history"></i>
                  <span className="prod-title-text">လုပ်ဆောင်ချက်မှတ်တမ်း</span>
                </div>
                <div className="prod-title-center">
                  <div className="prod-compact-nav">
                    <button className="prod-nav-btn" onClick={() => changeHistoryPage(safeLogPage - 1, 'prev')} disabled={safeLogPage === 1}><i className="fas fa-chevron-left"></i></button>
                    <div className="prod-page-control">
                      <input type="text" className="prod-page-input" value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(historyPageInputValue, 10); if (!isNaN(v) && v >= 1 && v <= logTotalPages) changeHistoryPage(v, 'jump'); else setHistoryPageInputValue(safeLogPage.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="prod-page-total">/ {logTotalPages}</span>
                    </div>
                    <button className="prod-nav-btn" onClick={() => changeHistoryPage(safeLogPage + 1, 'next')} disabled={safeLogPage === logTotalPages}><i className="fas fa-chevron-right"></i></button>
                    <div className="prod-items-per-page">
                      <select className="prod-per-page-select" value={logPageSize} onChange={handleLogPageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="prod-per-page-label">/စာမျက်နှာ</span>
                    </div>
                  </div>
                </div>
                <div className="prod-title-right">
                  <span className="prod-showing-count">
                    <span className="prod-count-numbers">{filteredLogs.length > 0 ? ((safeLogPage - 1) * logPageSize) + 1 : 0}</span>
                    <span> - </span>
                    <span className="prod-count-numbers">{Math.min(safeLogPage * logPageSize, filteredLogs.length)}</span>
                    <span> / </span>
                    <span className="prod-count-numbers">{filteredLogs.length}</span>
                    <span className="prod-count-label">ခု</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="prod-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, alignItems: 'center', width: '100%' }}>
                <div className="prod-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button className={`prod-filter-tab ${logFilter === 'all' ? 'active' : ''}`} onClick={() => { setLogFilter('all'); setLogPage(1); }}>
                    အားလုံး <span className="prod-filter-count">({logCounts.all})</span>
                  </button>
                  <button className={`prod-filter-tab ${logFilter === 'ADD' ? 'active' : ''}`} onClick={() => { setLogFilter('ADD'); setLogPage(1); }}>
                    <i className="fas fa-plus"></i> ပေါင်းထည့်ခြင်း <span className="prod-filter-count">({logCounts.ADD})</span>
                  </button>
                  <button className={`prod-filter-tab ${logFilter === 'EDIT' ? 'active' : ''}`} onClick={() => { setLogFilter('EDIT'); setLogPage(1); }}>
                    <i className="fas fa-edit"></i> ပြင်ဆင်ခြင်း <span className="prod-filter-count">({logCounts.EDIT})</span>
                  </button>
                  <button className={`prod-filter-tab ${logFilter === 'DELETE' ? 'active' : ''}`} onClick={() => { setLogFilter('DELETE'); setLogPage(1); }}>
                    <i className="fas fa-trash"></i> ဖျက်ခြင်း <span className="prod-filter-count">({logCounts.DELETE})</span>
                  </button>
                </div>
                <div className="prod-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button className={`prod-filter-tab ${dateFilter.filter === 'all' ? 'active' : ''}`} onClick={() => handleDateFilterChange('all')}>အချိန်အားလုံး</button>
                  <button className={`prod-filter-tab ${dateFilter.filter === 'today' ? 'active' : ''}`} onClick={() => handleDateFilterChange('today')}>ယနေ့</button>
                  <button className={`prod-filter-tab ${dateFilter.filter === 'yesterday' ? 'active' : ''}`} onClick={() => handleDateFilterChange('yesterday')}>မနေ့က</button>
                  <button className={`prod-filter-tab ${dateFilter.filter === 'thisWeek' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisWeek')}>ဒီအပတ်</button>
                  <button className={`prod-filter-tab ${dateFilter.filter === 'thisMonth' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisMonth')}>ဒီလ</button>
                  <button className={`prod-filter-tab ${dateFilter.filter === 'custom' ? 'active' : ''}`} onClick={() => handleDateFilterChange('custom')}>
                    <i className="fas fa-calendar"></i> စိတ်ကြိုက်
                  </button>
                  {dateFilter.filter !== 'all' && (
                    <button className="prod-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }}>
                      <i className="fas fa-times"></i> ရှင်းလင်းရန်
                    </button>
                  )}
                </div>
              </div>
              {showDatePicker && (
                <div className="prod-custom-date-picker">
                  <div className="prod-date-picker-row"><label>မှ</label>
                    <input type="date" className="prod-date-input" value={dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} />
                  </div>
                  <div className="prod-date-picker-row"><label>ထိ</label>
                    <input type="date" className="prod-date-input" value={dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="prod-compact-logs-container" ref={historyContainerRef}>
              {Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dayLogs]) => (
                  <div key={date} className="prod-date-group">
                    <div className="prod-date-header">
                      <span className="prod-date-label">{date}</span>
                      <span className="prod-date-count">{dayLogs.length} ခု</span>
                    </div>
                    <div className="prod-logs-list">
                      {dayLogs.map(log => (
                        <div key={log.id} className={`prod-compact-log-entry log-${log.actionType?.toLowerCase()}`} onClick={() => showLogDetailModal(log)} style={{ cursor: 'pointer' }}>
                          <div className="prod-log-icon" style={{ color: getActionColor(log.actionType) }}><i className={`fas ${getActionIcon(log.actionType)}`}></i></div>
                          <div className="prod-log-content">
                            <div className="prod-log-main-info">
                              <span className="prod-log-action">{getActionLabel(log.actionType, lang)}</span>
                              <span className="prod-log-product">"{log.productName}"{log.productId && <span className="prod-product-id">#{log.productId}</span>}</span>
                            </div>
                            <div className="prod-log-details">
                              <span className="prod-log-user"><i className="fas fa-user"></i> <strong>{log.createdByName}</strong> <span className="prod-user-role">({log.createdByRole})</span></span>
                              <span className="prod-log-time"><i className="fas fa-clock"></i> {formatDateTime(log.createdAt, lang)}</span>
                              {log.changes && log.changes.length > 0 && <span className="prod-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} ခု ပြောင်းလဲမှု</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-logs"><i className="fas fa-clipboard-list"></i><p>မှတ်တမ်း မရှိပါ</p></div>
              )}
            </div>
          </div>
        ) : (
          /* ===== PRODUCTS ===== */
          <>
            <div className="prod-section-title">
              <div className="prod-title-row">
                <div className="prod-title-left">
                  <i className="fas fa-boxes"></i>
                  <span className="prod-title-text">
                    {activeTab === 'all-products' && 'ပစ္စည်းအားလုံး'}
                    {activeTab === 'active' && 'အသုံးပြုနိုင်သောပစ္စည်းများ'}
                    {activeTab === 'inactive' && 'အသုံးမပြုနိုင်သောပစ္စည်းများ'}
                  </span>
                </div>
                <div className="prod-title-center">
                  <div className="prod-compact-nav">
                    <button className="prod-nav-btn" onClick={() => changePage(safePage - 1, 'prev')} disabled={safePage === 1}><i className="fas fa-chevron-left"></i></button>
                    <div className="prod-page-control">
                      <input type="text" className="prod-page-input" value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(pageInputValue, 10); if (!isNaN(v) && v >= 1 && v <= totalPages) changePage(v, 'jump'); else setPageInputValue(safePage.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="prod-page-total">/ {totalPages}</span>
                    </div>
                    <button className="prod-nav-btn" onClick={() => changePage(safePage + 1, 'next')} disabled={safePage === totalPages}><i className="fas fa-chevron-right"></i></button>
                    <div className="prod-items-per-page">
                      <select className="prod-per-page-select" value={pageSize} onChange={handlePageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="prod-per-page-label">/စာမျက်နှာ</span>
                    </div>
                  </div>
                </div>
                <div className="prod-title-right">
                  <span className="prod-showing-count">
                    <span className="prod-count-numbers">{filteredProducts.length > 0 ? ((safePage - 1) * pageSize) + 1 : 0}</span>
                    <span> - </span>
                    <span className="prod-count-numbers">{Math.min(safePage * pageSize, filteredProducts.length)}</span>
                    <span> / </span>
                    <span className="prod-count-numbers">{filteredProducts.length}</span>
                    <span className="prod-count-label">ခု</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="prod-table-wrapper" ref={tableBodyRef}>
              <table className="prod-table">
                <thead>
                  <tr>
                    <th>နံပါတ်</th>
                    <th>ပုံ</th>
                    <th>အမည်</th>
                    <th>ဘားကုဒ်</th>
                    <th>SKU</th>
                    <th>အမျိုးအစား</th>
                    <th>အရေတွက်</th>
                    <th>ယူနစ်</th>
                    <th>ရောင်းဈေး</th>
                    <th>အခြေအနေ</th>
                    <th>လုပ်ဆောင်ချက်</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="11" className="prod-no-data"><div className="prod-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: 48, marginBottom: 15 }}></i><p>ဒေတာများ ရယူနေသည်...</p></div></td></tr>
                  ) : pagedProducts.length > 0 ? (
                    pagedProducts.map((product, index) => (
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
                          <div>
                            <strong>{product.name}</strong>
                            {product.notes && <div className="prod-notes-preview"><i className="fas fa-sticky-note"></i> {product.notes.length > 30 ? product.notes.substring(0,30)+'...' : product.notes}</div>}
                            {product.createdAt && <div className="prod-created-info"><i className="far fa-clock"></i> {formatDate(product.createdAt, lang)}</div>}
                          </div>
                        </td>
                        <td>{product.barcode}</td>
                        <td>{product.sku}</td>
                        <td>{product.categoryName}</td>
                        <td>
                          <div className={`prod-stock-display ${getStockStatusClass(product)}`}>
                            <span className="prod-stock-number">{product.totalStock ?? 0}</span>
                            {product.totalStock <= product.minStock && product.totalStock > 0 && <span className="prod-stock-warning"><i className="fas fa-exclamation-triangle"></i></span>}
                            {product.totalStock === 0 && <span className="prod-stock-out"><i className="fas fa-times-circle"></i></span>}
                          </div>
                        </td>
                        <td>{product.unit}</td>
                        <td className="prod-price-cell"><div className="prod-selling-price">{formatCurrency(product.sellingPrice)}</div></td>
                        <td><span className={`prod-status-badge ${product.status === 'Active' ? 'prod-status-active' : 'prod-status-inactive'}`}>{getStatusLabel(product.status, lang)}</span></td>
                        <td>
                          <div className="prod-action-buttons">
                            <button className="prod-action-btn prod-action-view" onClick={() => handleAction('view', product.id)} disabled={loading}><i className="fas fa-eye"></i></button>
                            <button className="prod-action-btn prod-action-edit" onClick={() => handleAction('edit', product.id)} disabled={loading}><i className="fas fa-edit"></i></button>
                            <button className="prod-action-btn prod-action-delete" onClick={() => handleAction('delete', product.id)} disabled={loading}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="11" className="prod-no-data"><div className="prod-no-data-content"><i className="fas fa-box-open"></i><p>ပစ္စည်းများ မတွေ့ပါ</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Product Modal */}
      <ProductModal
        show={showProductModal}
        onClose={() => setShowProductModal(false)}
        modalType={modalType}
        productForm={productForm}
        onFormChange={handleFormChange}
        onStatusChange={handleStatusChange}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
        onSave={handleSaveProduct}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={lang}
        fileInputRef={fileInputRef}
        categories={categories}
        isFormValid={isFormValid}
        formatCurrency={formatCurrency}
        formatPercentage={formatPercentage}
        triggerFileInput={() => fileInputRef.current?.click()}
      />

      {/* Quick View */}
      {showQuickViewModal && selectedProduct && (
        <div className="prod-modal-overlay">
          <div className="prod-modal-content" style={{ maxWidth: 550 }}>
            <div className="prod-modal-header">
              <h3><i className="fas fa-eye"></i> ပစ္စည်းအသေးစိတ်</h3>
              <button className="prod-modal-close" onClick={() => setShowQuickViewModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="prod-modal-body">
              <div className="quick-view-header">
                <h3>{selectedProduct.name}</h3>
                <span className={`quick-view-status-badge ${selectedProduct.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{getStatusLabel(selectedProduct.status, lang)}</span>
              </div>
              {selectedProduct.description && (
                <div className="quick-view-description"><i className="fas fa-quote-left"></i><p>{selectedProduct.description}</p></div>
              )}
              {selectedProduct.image && (
                <div style={{ textAlign: 'center', margin: '15px 0' }}>
                  <img src={selectedProduct.image} alt={selectedProduct.name} style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8 }} />
                </div>
              )}
              <div className="quick-view-grid">
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-barcode"></i> ဘားကုဒ်:</span><span className="quick-view-value">{selectedProduct.barcode}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-tag"></i> SKU:</span><span className="quick-view-value">{selectedProduct.sku}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-layer-group"></i> အမျိုးအစား:</span><span className="quick-view-value">{selectedProduct.categoryName}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-balance-scale"></i> ယူနစ်:</span><span className="quick-view-value">{selectedProduct.unit || 'pcs'}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-dollar-sign"></i> ဝယ်ဈေး:</span><span className="quick-view-value">{formatCurrency(selectedProduct.costPrice || 0)}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-dollar-sign"></i> ရောင်းဈေး:</span><span className="quick-view-value">{formatCurrency(selectedProduct.sellingPrice)}</span></div>
                <div className="quick-view-row">
                  <span className="quick-view-label"><i className="fas fa-chart-line"></i> အမြတ်:</span>
                  <span className="quick-view-value">
                    {(() => {
                      const cost = selectedProduct.costPrice || 0;
                      const selling = selectedProduct.sellingPrice || 0;
                      const profit = selling - cost;
                      const margin = cost > 0 ? (profit / cost) * 100 : 0;
                      let cls = profit < 0 ? 'profit-negative' : margin < 10 ? 'profit-low' : margin < 20 ? 'profit-medium' : 'profit-high';
                      return (
                        <span className={`profit-display ${cls}`}>
                          <span className="profit-amount">{formatCurrency(profit)}</span>
                          <span className="profit-margin">({formatPercentage(margin)})</span>
                        </span>
                      );
                    })()}
                  </span>
                </div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="far fa-calendar"></i> ဖန်တီးရက်:</span><span className="quick-view-value">{formatDate(selectedProduct.createdAt, lang)}</span></div>
                <div className="quick-view-row"><span className="quick-view-label" style={{ minWidth: 200 }}><i className="fas fa-exclamation-triangle"></i> အနည်းဆုံးအရေအတွက်:</span><span className="quick-view-value">{selectedProduct.minStock}</span></div>
                <div className="quick-view-row"><span className="quick-view-label"><i className="fas fa-hashtag"></i> ID:</span><span className="quick-view-value">{selectedProduct.id}</span></div>
                {selectedProduct.notes && <div className="quick-view-row full-width"><span className="quick-view-label"><i className="fas fa-sticky-note"></i> မှတ်ချက်:</span><span className="quick-view-value">{selectedProduct.notes}</span></div>}
              </div>
            </div>
            <div className="prod-modal-footer">
              <button className="prod-btn-edit" onClick={() => { setShowQuickViewModal(false); handleAction('edit', selectedProduct.id); }}><i className="fas fa-edit"></i> ပြင်ဆင်ရန်</button>
              <button className="prod-btn-cancel" onClick={() => setShowQuickViewModal(false)}>ပိတ်ရန်</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <ProductExportModal show={showExportModal} onClose={() => setShowExportModal(false)} onExport={handleExport} loading={exportLoading} language={lang} />

      {/* Log Details */}
      {showLogDetails && selectedLog && (
        <div className="prod-modal-overlay">
          <div className="prod-modal-content" style={{ maxWidth: 600 }}>
            <div className="prod-modal-header">
              <h3><i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i> လုပ်ဆောင်ချက်အသေးစိတ်</h3>
              <button className="prod-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="prod-modal-body">
              <div className="prod-log-detail-header">
                <div className="prod-log-detail-main">
                  <div className="prod-log-detail-action">
                    <span className={`prod-action-badge prod-action-${selectedLog.actionType?.toLowerCase()}`}>
                      {selectedLog.actionType === 'ADD' && <i className="fas fa-plus"></i>}
                      {selectedLog.actionType === 'EDIT' && <i className="fas fa-edit"></i>}
                      {selectedLog.actionType === 'DELETE' && <i className="fas fa-trash"></i>}
                      {getActionLabel(selectedLog.actionType, lang)}
                    </span>
                  </div>
                  {selectedLog.productName && (
                    <div className="prod-log-detail-product"><i className="fas fa-tag"></i><span className="prod-product-name">{selectedLog.productName}</span>{selectedLog.productId && <span className="prod-product-id-detail">ID: #{selectedLog.productId}</span>}</div>
                  )}
                </div>
                <div className="prod-log-detail-meta">
                  <div className="prod-log-detail-user"><i className="fas fa-user"></i><div><div className="prod-user-name-detail"><strong>{selectedLog.createdByName}</strong></div><div className="prod-user-role-detail">{selectedLog.createdByRole}</div></div></div>
                  <div className="prod-log-detail-time"><i className="fas fa-calendar"></i><div><div className="prod-log-date-detail">{formatDate(selectedLog.createdAt, lang)}</div><div className="prod-log-time-detail">{formatDateTime(selectedLog.createdAt, lang).split(' ').slice(-2).join(' ')}</div></div></div>
                </div>
              </div>
              <div className="prod-log-detail-content">
                <h4>အပြောင်းအလဲအသေးစိတ်:</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="prod-change-list">
                    {selectedLog.changes.map((c, i) => (
                      <div key={i} className="prod-change-item"><i className="fas fa-chevron-right"></i><span>{c}</span></div>
                    ))}
                  </div>
                ) : (
                  <div className="prod-no-changes"><i className="fas fa-info-circle"></i><span>အပြောင်းအလဲမှတ်တမ်း မရှိပါ</span></div>
                )}
              </div>
            </div>
            <div className="prod-modal-footer">
              <button className="prod-btn-cancel" onClick={() => setShowLogDetails(false)}>ပိတ်ရန်</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProductPage;