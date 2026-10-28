// UserCategoryPage.jsx (Demo — Frontend only, JSON + localStorage + Internet Images)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryModal from './CategoryModal';
import CategoryExportModal from './CategoryExportModal';
import "../../light-style/user-css/userCategoryPage.css";
import imageCompression from 'browser-image-compression';
import { useSelector } from 'react-redux';

// ============================================================
// ✅ JSON SEED DATA - Internet Images
// ============================================================
const CATEGORIES_KEY = "demo_categories";
const LOGS_KEY = "demo_category_logs";

// ✅ Fallback SVG (internet မရှိရင် သုံး)
const makeImage = (letter, bg = "#4361ee") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="120" height="120" rx="12" fill="${bg}"/>
      <text x="50%" y="55%" font-family="Arial" font-size="52" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    </svg>`)}`;

// ✅ Internet image URLs (Unsplash)
const SEED_CATEGORIES = [
  {
    id: 1,
    name: "အီလက်ထရောနစ်",
    description: "အီလက်ထရောနစ်ပစ္စည်းများနှင့် ကိရိယာများ",
    status: "Active",
    image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?w=200&h=200&fit=crop",
    createdAt: new Date(Date.now() - 9*86400000).toISOString()
  },
  {
    id: 2,
    name: "အစားအသောက်",
    description: "ကုန်စုံ၊ အဆာပြေနှင့် အအေးများ",
    status: "Active",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop",
    createdAt: new Date(Date.now() - 7*86400000).toISOString()
  },
  {
    id: 3,
    name: "အဝတ်အထည်",
    description: "အဝတ်အထည်နှင့် အသုံးအဆောင်များ",
    status: "Active",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=200&h=200&fit=crop",
    createdAt: new Date(Date.now() - 5*86400000).toISOString()
  },
  {
    id: 4,
    name: "အိမ်သုံးပစ္စည်း",
    description: "အိမ်သုံးပစ္စည်းနှင့် မီးဖိုချောင်သုံး",
    status: "Inactive",
    image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop",
    createdAt: new Date(Date.now() - 3*86400000).toISOString()
  },
  {
    id: 5,
    name: "စာရေးကိရိယာ",
    description: "ရုံးသုံးနှင့် ကျောင်းသုံးပစ္စည်းများ",
    status: "Active",
    image: "https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=200&h=200&fit=crop",
    createdAt: new Date(Date.now() - 1*86400000).toISOString()
  },
];

const SEED_LOGS = [
  { id: 1, actionType: "ADD",    categoryId: 1, categoryName: "အီလက်ထရောနစ်",  createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 9*86400000).toISOString(), changes: ["အမည်: အီလက်ထရောနစ်", "ဖော်ပြချက်: အီလက်ထရောနစ်ပစ္စည်းများ", "အခြေအနေ: အသုံးပြုနိုင်"] },
  { id: 2, actionType: "EDIT",   categoryId: 2, categoryName: "အစားအသောက်",    createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 5*86400000).toISOString(), changes: ["အခြေအနေ: အသုံးမပြုနိုင် → အသုံးပြုနိုင်"] },
  { id: 3, actionType: "DELETE", categoryId: 9, categoryName: "အမျိုးအစားဟောင်း", createdByName: "အောင်အောင်", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 2*86400000).toISOString(), changes: ["အမျိုးအစားကို ဖျက်လိုက်ပါပြီ"] },
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

// ✅ မြန်မာလို date format
const formatDate = (iso, lang) => {
  try {
    return new Date(iso).toLocaleDateString(lang === 'mm' ? 'my-MM' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric'
    });
  } catch { return ''; }
};
const formatTime = (iso, lang) => {
  try {
    return new Date(iso).toLocaleTimeString(lang === 'mm' ? 'my-MM' : 'en-US', {
      hour: '2-digit', minute: '2-digit'
    });
  } catch { return ''; }
};
const formatDateTime = (iso, lang) => {
  try {
    return new Date(iso).toLocaleString(lang === 'mm' ? 'my-MM' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch { return ''; }
};

// ============================================================
// ✅ COMPONENT
// ============================================================
const UserCategoryPage = () => {
  const navigate = useNavigate();

  // ✅ မြန်မာစာ default
  const [language, setLanguage] = useState(() => {
    const stored = localStorage.getItem("appLanguage") || localStorage.getItem("pos-language");
    if (stored) return stored;
    localStorage.setItem("appLanguage", "mm");
    return "mm";
  });

  // ✅ Current user
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const currentUser = useMemo(() => {
    if (user && isAuthenticated) return user;
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  }, [user, isAuthenticated]);

  // ===== Local states =====
  const [categories, setCategories] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeTab, setActiveTab] = useState("all-categories");
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

  // UI states
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);

  // Export
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // Quick View
  const [showQuickViewModal, setShowQuickViewModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Form
  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);
  const [categoryForm, setCategoryForm] = useState({
    id: null, name: "", description: "", imageFile: null, currentImageUrl: "", status: "Active"
  });

  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const fileInputRef = useRef(null);

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
      setCategories(getData(CATEGORIES_KEY, SEED_CATEGORIES));
      setLogs(getData(LOGS_KEY, SEED_LOGS));
      setTableLoading(false);
    }, 250);
    return () => clearTimeout(t);
  }, []);

  // ===== Filtered categories =====
  const filteredCategories = useMemo(() => {
    let list = [...categories];
    if (activeTab === "active") list = list.filter(c => c.status === "Active");
    else if (activeTab === "inactive") list = list.filter(c => c.status === "Inactive");
    if (statusFilter !== "all") list = list.filter(c => c.status === statusFilter);
    if (searchQuery) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(c =>
        c.name?.toLowerCase().includes(q) ||
        c.description?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [categories, activeTab, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredCategories.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedCategories = filteredCategories.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ===== Status counts =====
  const statusCounts = useMemo(() => ({
    all: categories.length,
    Active: categories.filter(c => c.status === "Active").length,
    Inactive: categories.filter(c => c.status === "Inactive").length,
  }), [categories]);

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
    ADD: logs.filter(l => l.actionType === "ADD").length,
    EDIT: logs.filter(l => l.actionType === "EDIT").length,
    DELETE: logs.filter(l => l.actionType === "DELETE").length,
  }), [logs]);

  // ============================================================
  // ✅ LOGGING
  // ============================================================
  const logAction = (actionType, category, changes) => {
    const newLog = {
      id: logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      actionType,
      categoryId: category.id,
      categoryName: category.name,
      createdByName: currentUser?.fullName || currentUser?.username || "မသိသော အသုံးပြုသူ",
      createdByRole: currentUser?.role || "N/A",
      createdAt: new Date().toISOString(),
      changes,
    };
    const updated = [...logs, newLog];
    setLogs(updated);
    saveData(LOGS_KEY, updated);
  };

  // ============================================================
  // ✅ CRUD
  // ============================================================
  const handleSaveCategory = async () => {
    const errors = {};
    if (!categoryForm.name?.trim()) {
      errors.name = "အမျိုးအစားအမည် လိုအပ်ပါသည်";
    }
    if (Object.keys(errors).length) {
      setFormErrors(errors);
      setValidationError("ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ");
      return;
    }
    setValidationError(null);
    setLoading(true);
    await new Promise(r => setTimeout(r, 300));

    if (modalType === "add") {
      const newId = categories.length ? Math.max(...categories.map(c => c.id)) + 1 : 1;
      const newCat = {
        id: newId,
        name: categoryForm.name.trim(),
        description: categoryForm.description?.trim() || "",
        status: categoryForm.status,
        image: categoryForm.currentImageUrl || makeImage(categoryForm.name.charAt(0).toUpperCase()),
        createdAt: new Date().toISOString(),
      };
      const updated = [newCat, ...categories];
      setCategories(updated);
      saveData(CATEGORIES_KEY, updated);
      logAction("ADD", newCat, [
        `အမည်: ${newCat.name}`,
        `ဖော်ပြချက်: ${newCat.description || '-'}`,
        `အခြေအနေ: ${newCat.status === 'Active' ? 'အသုံးပြုနိုင်' : 'အသုံးမပြုနိုင်'}`,
      ]);
      setSuccess(true);
    } else {
      const old = categories.find(c => c.id === categoryForm.id);
      const updatedCat = {
        ...old,
        name: categoryForm.name.trim(),
        description: categoryForm.description?.trim() || "",
        status: categoryForm.status,
        image: categoryForm.currentImageUrl || old.image,
      };
      const updated = categories.map(c => c.id === updatedCat.id ? updatedCat : c);
      setCategories(updated);
      saveData(CATEGORIES_KEY, updated);

      const changes = [];
      if (old.name !== updatedCat.name) changes.push(`အမည်: ${old.name} → ${updatedCat.name}`);
      if (old.description !== updatedCat.description) changes.push(`ဖော်ပြချက်: ${old.description || '-'} → ${updatedCat.description || '-'}`);
      if (old.status !== updatedCat.status) {
        const oldLbl = old.status === 'Active' ? 'အသုံးပြုနိုင်' : 'အသုံးမပြုနိုင်';
        const newLbl = updatedCat.status === 'Active' ? 'အသုံးပြုနိုင်' : 'အသုံးမပြုနိုင်';
        changes.push(`အခြေအနေ: ${oldLbl} → ${newLbl}`);
      }
      if (!changes.length) changes.push("ပြင်ဆင်ပြီးပါပြီ");
      logAction("EDIT", updatedCat, changes);
      setSuccess(true);
    }

    setLoading(false);
    setShowCategoryModal(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleDelete = async (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;
    if (!window.confirm(`"${category.name}" အမျိုးအစားကို ဖျက်ရန် သေချာပါသလား?`)) return;

    setLoading(true);
    await new Promise(r => setTimeout(r, 250));

    const updated = categories.filter(c => c.id !== categoryId);
    setCategories(updated);
    saveData(CATEGORIES_KEY, updated);
    logAction("DELETE", category, [`"${category.name}" အမျိုးအစားကို ဖျက်လိုက်ပါပြီ`]);
    setSuccess(true);
    setLoading(false);
    setTimeout(() => setSuccess(false), 3000);
  };

  const handleAction = (action, categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    if (action === 'edit') {
      setCategoryForm({
        id: category.id,
        name: category.name,
        description: category.description || "",
        imageFile: null,
        currentImageUrl: category.image || "",
        status: category.status,
      });
      setFormErrors({});
      setModalType("edit");
      setShowCategoryModal(true);
    } else if (action === 'delete') {
      handleDelete(categoryId);
    } else if (action === 'view') {
      setSelectedCategory(category);
      setShowQuickViewModal(true);
    }
  };

  // ===== Form handlers =====
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };
  const handleStatusChange = (status) => setCategoryForm(prev => ({ ...prev, status }));

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert("ကျေးဇူးပြု၍ ပုံဖိုင်တစ်ခုကို ရွေးချယ်ပါ။");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert("5MB အောက် ပုံကို ရွေးပါ။");
      return;
    }
    try {
      setLoading(true);
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true,
      });
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });
      setCategoryForm(prev => ({ ...prev, imageFile: compressed, currentImageUrl: base64 }));
    } catch (err) {
      console.error(err);
      alert('ပုံကို ချုံ့ရာတွင် မအောင်မြင်ပါ။ သေးငယ်သော ပုံကို စမ်းပါ။');
    } finally {
      setLoading(false);
    }
  };

  const removeImage = () => {
    setCategoryForm(prev => ({ ...prev, imageFile: null, currentImageUrl: "" }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const resetForm = () => {
    setCategoryForm({ id: null, name: "", description: "", imageFile: null, currentImageUrl: "", status: "Active" });
    setFormErrors({});
    setValidationError(null);
  };

  const openAddModal = () => {
    setModalType("add");
    resetForm();
    setShowCategoryModal(true);
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

  // ===== Tab change =====
  const handleTabChange = (e) => {
    const value = e.target.value;
    if (value === 'export') {
      setShowExportModal(true);
      e.target.value = activeTab;
      return;
    }
    setActiveTab(value);
    setPage(1);
    setLogPage(1);
    setPageInputValue("1");
    setHistoryPageInputValue("1");
  };

  // ===== Export (CSV) =====
  const handleExport = async (exportType) => {
    setExportLoading(true);
    await new Promise(r => setTimeout(r, 500));

    try {
      let rows = [];
      if (exportType === "categories" || exportType === "both") {
        rows.push(["=== အမျိုးအစားများ ==="]);
        rows.push(["နံပါတ်", "အမည်", "ဖော်ပြချက်", "အခြေအနေ", "ဖန်တီးရက်"]);
        categories.forEach(c => rows.push([
          c.id, c.name, c.description,
          c.status === 'Active' ? 'အသုံးပြုနိုင်' : 'အသုံးမပြုနိုင်',
          formatDateTime(c.createdAt, language)
        ]));
        rows.push([]);
      }
      if (exportType === "logs" || exportType === "both") {
        rows.push(["=== မှတ်တမ်းများ ==="]);
        rows.push(["နံပါတ်", "လုပ်ဆောင်ချက်", "အမျိုးအစား", "လုပ်သူ", "ရာထူး", "အချိန်", "ပြောင်းလဲမှုများ"]);
        logs.forEach(l => rows.push([
          l.id, l.actionType, l.categoryName, l.createdByName, l.createdByRole,
          formatDateTime(l.createdAt, language),
          (l.changes || []).join(" | ")
        ]));
      }

      const csv = rows.map(r => r.map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(",")).join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `category_export_${new Date().toISOString().slice(0,10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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

  // ===== Helpers =====
  const getStatusLabel = (s) => s === 'Active' ? 'အသုံးပြုနိုင်' : 'အသုံးမပြုနိုင်';
  const getActionIcon = (a) => a === 'ADD' ? 'fa-plus-circle' : a === 'EDIT' ? 'fa-edit' : 'fa-trash';
  const getActionColor = (a) => a === 'ADD' ? '#10b981' : a === 'EDIT' ? '#f59e0b' : '#ef4444';
  const getActionLabel = (a) =>
    a === 'ADD' ? 'အမျိုးအစားအသစ်ထည့်ခြင်း'
    : a === 'EDIT' ? 'အမျိုးအစားပြင်ဆင်ခြင်း'
    : 'အမျိုးအစားဖျက်ခြင်း';

  const showLogDetailModal = (log) => { setSelectedLog(log); setShowLogDetails(true); };

  if (!currentUser) {
    return (
      <div className="cat-container">
        <div className="loading-state" style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginRight: '15px' }}></i>
          <p style={{ fontSize: '18px' }}>အသုံးပြုသူဒေတာ ဖွင့်နေသည်...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cat-container">
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

      <div className="cat-tabs-header">
        <div className="cat-tabs-selector">
          <div className="cat-select-container">
            <i className={`fas ${
              activeTab === "all-categories" ? "fa-layer-group" :
              activeTab === "active" ? "fa-check-circle" :
              activeTab === "inactive" ? "fa-times-circle" :
              "fa-history"
            } cat-select-icon`}></i>
            <select className="cat-tab-select" value={activeTab} onChange={handleTabChange} disabled={loading || tableLoading}>
              <option value="all-categories">အမျိုးအစားအားလုံး ({statusCounts.all})</option>
              <option value="active">အသုံးပြုနိုင် ({statusCounts.Active})</option>
              <option value="inactive">အသုံးမပြုနိုင် ({statusCounts.Inactive})</option>
              <option value="history">မှတ်တမ်း ({logCounts.all})</option>
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>ဒေတာတင်ပို့ရန်</option>
            </select>
            <i className="fas fa-chevron-down cat-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' && (
          <>
            <div className="cat-search-controls">
              <div className="cat-search-input-group">
                <i className="fas fa-search cat-search-icon"></i>
                <input type="text" className="cat-search-input"
                  placeholder="အမည်၊ ဖော်ပြချက်ဖြင့်ရှာဖွေရန်..."
                  value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setPage(1); }} disabled={tableLoading} />
                {searchQuery && (
                  <button className="cat-clear-search-btn" onClick={() => { setSearchQuery(""); setPage(1); }} disabled={tableLoading}><i className="fas fa-times"></i></button>
                )}
              </div>
            </div>

            <button className="cat-add-btn" onClick={openAddModal} disabled={tableLoading}>
              <i className="fas fa-plus"></i> အမျိုးအစားအသစ်
            </button>
          </>
        )}
      </div>

      <div className="subtab-content active">
        {activeTab === "history" ? (
          /* ===== HISTORY ===== */
          <div className="cat-history-section">
            <div className="cat-section-title">
              <div className="cat-title-row">
                <div className="cat-title-left">
                  <i className="fas fa-history"></i>
                  <span className="cat-title-text">လုပ်ဆောင်ချက်မှတ်တမ်း</span>
                </div>
                <div className="cat-title-center">
                  <div className="cat-compact-nav">
                    <button className="cat-nav-btn" onClick={() => changeHistoryPage(safeLogPage - 1, 'prev')} disabled={safeLogPage === 1}><i className="fas fa-chevron-left"></i></button>
                    <div className="cat-page-control">
                      <input type="text" className="cat-page-input" value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(historyPageInputValue); if (!isNaN(v) && v >= 1 && v <= logTotalPages) changeHistoryPage(v, 'jump'); else setHistoryPageInputValue(safeLogPage.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="cat-page-total">/ {logTotalPages}</span>
                    </div>
                    <button className="cat-nav-btn" onClick={() => changeHistoryPage(safeLogPage + 1, 'next')} disabled={safeLogPage === logTotalPages}><i className="fas fa-chevron-right"></i></button>
                    <div className="cat-items-per-page">
                      <select className="cat-per-page-select" value={logPageSize} onChange={handleLogPageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="cat-per-page-label">/စာမျက်နှာ</span>
                    </div>
                  </div>
                </div>
                <div className="cat-title-right">
                  <span className="cat-showing-count">
                    <span className="cat-count-numbers">{filteredLogs.length > 0 ? ((safeLogPage - 1) * logPageSize) + 1 : 0}</span>
                    <span> - </span>
                    <span className="cat-count-numbers">{Math.min(safeLogPage * logPageSize, filteredLogs.length)}</span>
                    <span> / </span>
                    <span className="cat-count-numbers">{filteredLogs.length}</span>
                    <span className="cat-count-label">ခု</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="cat-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, alignItems: 'center', width: '100%' }}>
                <div className="cat-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button className={`cat-filter-tab ${logFilter === 'all' ? 'active' : ''}`} onClick={() => { setLogFilter('all'); setLogPage(1); }}>
                    အားလုံး <span className="cat-filter-count">({logCounts.all})</span>
                  </button>
                  <button className={`cat-filter-tab ${logFilter === 'ADD' ? 'active' : ''}`} onClick={() => { setLogFilter('ADD'); setLogPage(1); }}>
                    <i className="fas fa-plus"></i> ပေါင်းထည့်ခြင်း <span className="cat-filter-count">({logCounts.ADD})</span>
                  </button>
                  <button className={`cat-filter-tab ${logFilter === 'EDIT' ? 'active' : ''}`} onClick={() => { setLogFilter('EDIT'); setLogPage(1); }}>
                    <i className="fas fa-edit"></i> ပြင်ဆင်ခြင်း <span className="cat-filter-count">({logCounts.EDIT})</span>
                  </button>
                  <button className={`cat-filter-tab ${logFilter === 'DELETE' ? 'active' : ''}`} onClick={() => { setLogFilter('DELETE'); setLogPage(1); }}>
                    <i className="fas fa-trash"></i> ဖျက်ခြင်း <span className="cat-filter-count">({logCounts.DELETE})</span>
                  </button>
                </div>

                <div className="cat-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button className={`cat-filter-tab ${dateFilter.filter === 'all' ? 'active' : ''}`} onClick={() => handleDateFilterChange('all')}>အချိန်အားလုံး</button>
                  <button className={`cat-filter-tab ${dateFilter.filter === 'today' ? 'active' : ''}`} onClick={() => handleDateFilterChange('today')}>ယနေ့</button>
                  <button className={`cat-filter-tab ${dateFilter.filter === 'yesterday' ? 'active' : ''}`} onClick={() => handleDateFilterChange('yesterday')}>မနေ့က</button>
                  <button className={`cat-filter-tab ${dateFilter.filter === 'thisWeek' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisWeek')}>ဒီအပတ်</button>
                  <button className={`cat-filter-tab ${dateFilter.filter === 'thisMonth' ? 'active' : ''}`} onClick={() => handleDateFilterChange('thisMonth')}>ဒီလ</button>
                  <button className={`cat-filter-tab ${dateFilter.filter === 'custom' ? 'active' : ''}`} onClick={() => handleDateFilterChange('custom')}>
                    <i className="fas fa-calendar"></i> စိတ်ကြိုက်
                  </button>
                  {dateFilter.filter !== 'all' && (
                    <button className="cat-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }}>
                      <i className="fas fa-times"></i> ရှင်းလင်းရန်
                    </button>
                  )}
                </div>
              </div>

              {showDatePicker && (
                <div className="cat-custom-date-picker">
                  <div className="cat-date-picker-row">
                    <label>မှ</label>
                    <input type="date" className="cat-date-input" value={dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} />
                  </div>
                  <div className="cat-date-picker-row">
                    <label>ထိ</label>
                    <input type="date" className="cat-date-input" value={dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} />
                  </div>
                </div>
              )}
            </div>

            <div className="cat-compact-logs-container" ref={historyContainerRef}>
              {Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dayLogs]) => (
                  <div key={date} className="cat-date-group">
                    <div className="cat-date-header">
                      <span className="cat-date-label">{date}</span>
                      <span className="cat-date-count">{dayLogs.length} ခု</span>
                    </div>
                    <div className="cat-logs-list">
                      {dayLogs.map(log => (
                        <div key={log.id} className={`cat-compact-log-entry log-${log.actionType?.toLowerCase()}`} onClick={() => showLogDetailModal(log)} style={{ cursor: 'pointer' }}>
                          <div className="cat-log-icon" style={{ color: getActionColor(log.actionType) }}><i className={`fas ${getActionIcon(log.actionType)}`}></i></div>
                          <div className="cat-log-content">
                            <div className="cat-log-main-info">
                              <span className="cat-log-action">{getActionLabel(log.actionType)}</span>
                              <span className="cat-log-category">"{log.categoryName}"{log.categoryId && <span className="cat-category-id">#{log.categoryId}</span>}</span>
                            </div>
                            <div className="cat-log-details">
                              <span className="cat-log-user"><i className="fas fa-user"></i> <strong>{log.createdByName}</strong> <span className="cat-user-role">({log.createdByRole})</span></span>
                              <span className="cat-log-time"><i className="fas fa-clock"></i> {formatDateTime(log.createdAt, language)}</span>
                              {log.changes && log.changes.length > 0 && <span className="cat-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} ခု ပြောင်းလဲမှု</span>}
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
                  <p>မှတ်တမ်း မရှိပါ</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== CATEGORIES ===== */
          <>
            <div className="cat-section-title">
              <div className="cat-title-row">
                <div className="cat-title-left">
                  <i className="fas fa-tags"></i>
                  <span className="cat-title-text">
                    {activeTab === "all-categories" && "အမျိုးအစားအားလုံး"}
                    {activeTab === "active" && "အသုံးပြုနိုင်သောအမျိုးအစားများ"}
                    {activeTab === "inactive" && "အသုံးမပြုနိုင်သောအမျိုးအစားများ"}
                  </span>
                </div>
                <div className="cat-title-center">
                  <div className="cat-compact-nav">
                    <button className="cat-nav-btn" onClick={() => changePage(safePage - 1, 'prev')} disabled={safePage === 1}><i className="fas fa-chevron-left"></i></button>
                    <div className="cat-page-control">
                      <input type="text" className="cat-page-input" value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(pageInputValue); if (!isNaN(v) && v >= 1 && v <= totalPages) changePage(v, 'jump'); else setPageInputValue(safePage.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} />
                      <span className="cat-page-total">/ {totalPages}</span>
                    </div>
                    <button className="cat-nav-btn" onClick={() => changePage(safePage + 1, 'next')} disabled={safePage === totalPages}><i className="fas fa-chevron-right"></i></button>
                    <div className="cat-items-per-page">
                      <select className="cat-per-page-select" value={pageSize} onChange={handlePageSizeChange}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="cat-per-page-label">/စာမျက်နှာ</span>
                    </div>
                  </div>
                </div>
                <div className="cat-title-right">
                  <span className="cat-showing-count">
                    <span className="cat-count-numbers">{filteredCategories.length > 0 ? ((safePage - 1) * pageSize) + 1 : 0}</span>
                    <span> - </span>
                    <span className="cat-count-numbers">{Math.min(safePage * pageSize, filteredCategories.length)}</span>
                    <span> / </span>
                    <span className="cat-count-numbers">{filteredCategories.length}</span>
                    <span className="cat-count-label">ခု</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="cat-table-wrapper" ref={tableBodyRef}>
              <table className="cat-table">
                <thead>
                  <tr>
                    <th>နံပါတ်</th>
                    <th>ပုံ</th>
                    <th style={{ maxWidth: 400, width: 400 }}>အမည်</th>
                    <th style={{ maxWidth: 450, width: 500 }}>ဖော်ပြချက်</th>
                    <th>အခြေအနေ</th>
                    <th>လုပ်ဆောင်ချက်</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="6" className="cat-no-data"><div className="cat-no-data-content" style={{ padding: '20px 0' }}><i className="fas fa-spinner fa-spin" style={{ fontSize: 32, color: '#4361ee', marginBottom: 10 }}></i><p style={{ fontSize: 14, color: '#6c757d' }}>ဒေတာများ ရယူနေသည်...</p></div></td></tr>
                  ) : pagedCategories.length > 0 ? (
                    pagedCategories.map((category, index) => (
                      <tr key={category.id}>
                        <td>{(safePage - 1) * pageSize + index + 1}</td>
                        <td className="cat-image-cell">
                          {category.image ? (
                            <img
                              src={category.image}
                              alt={category.name}
                              className="cat-image"
                              loading="lazy"
                              onError={(e) => {
                                // ✅ Internet မရှိရင် fallback
                                e.target.onerror = null;
                                e.target.src = makeImage(category.name.charAt(0).toUpperCase());
                              }}
                            />
                          ) : (
                            <div className="cat-image-fallback">{category.name.charAt(0).toUpperCase()}</div>
                          )}
                        </td>
                        <td>
                          <div><strong>{category.name}</strong>
                            {category.createdAt && <div className="cat-created-info"><i className="far fa-clock"></i> ဖန်တီးရက်: {formatDate(category.createdAt, language)}</div>}
                          </div>
                        </td>
                        <td><div className="cat-description-cell">{category.description || '-'}</div></td>
                        <td><span className={`cat-status-badge ${category.status === 'Active' ? 'cat-status-active' : 'cat-status-inactive'}`}>{getStatusLabel(category.status)}</span></td>
                        <td>
                          <div className="cat-action-buttons">
                            <button className="cat-action-btn cat-action-view" onClick={() => handleAction('view', category.id)}><i className="fas fa-eye"></i></button>
                            <button className="cat-action-btn cat-action-edit" onClick={() => handleAction('edit', category.id)}><i className="fas fa-edit"></i></button>
                            <button className="cat-action-btn cat-action-delete" onClick={() => handleAction('delete', category.id)}><i className="fas fa-trash"></i></button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="6" className="cat-no-data"><div className="cat-no-data-content"><i className="fas fa-folder-open"></i><p>အမျိုးအစားများ မတွေ့ပါ</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        modalType={modalType}
        categoryForm={categoryForm}
        onFormChange={handleFormChange}
        onStatusChange={handleStatusChange}
        onImageUpload={handleImageUpload}
        onRemoveImage={removeImage}
        onSave={handleSaveCategory}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={language}
        fileInputRef={fileInputRef}
      />

      {/* Quick View */}
      {showQuickViewModal && selectedCategory && (
        <div className="cat-modal-overlay">
          <div className="cat-modal-content" style={{ maxWidth: 500 }}>
            <div className="cat-modal-header">
              <h3><i className="fas fa-eye"></i> အမျိုးအစားအသေးစိတ်</h3>
              <button className="cat-modal-close" onClick={() => setShowQuickViewModal(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="cat-modal-body">
              <div className="quick-view-header">
                <div className="quick-view-title">
                  <h4>{selectedCategory.name}</h4>
                  <span className={`quick-view-status-badge ${selectedCategory.status === 'Active' ? 'status-active' : 'status-inactive'}`}>{getStatusLabel(selectedCategory.status)}</span>
                </div>
              </div>
              {selectedCategory.description && (
                <div className="quick-view-description"><i className="fas fa-quote-left"></i><p>{selectedCategory.description}</p></div>
              )}
              {selectedCategory.image && (
                <div style={{ textAlign: 'center', margin: '15px 0' }}>
                  <img
                    src={selectedCategory.image}
                    alt={selectedCategory.name}
                    style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8 }}
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = makeImage(selectedCategory.name.charAt(0).toUpperCase());
                    }}
                  />
                </div>
              )}
              <div className="quick-view-footer">
                <span className="id-info"><i className="fas fa-hashtag"></i> ID: #{selectedCategory.id}</span>
                {selectedCategory.createdAt && <span className="id-info" style={{ marginLeft: 10 }}><i className="far fa-calendar"></i>{formatDate(selectedCategory.createdAt, language)}</span>}
              </div>
            </div>
            <div className="cat-modal-footer">
              <button className="cat-btn-edit" onClick={() => { setShowQuickViewModal(false); handleAction('edit', selectedCategory.id); }}><i className="fas fa-edit"></i> ပြင်ဆင်ရန်</button>
              <button className="cat-btn-cancel" onClick={() => setShowQuickViewModal(false)}>ပိတ်ရန်</button>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      <CategoryExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
        language={language}
      />

      {/* Log Details */}
      {showLogDetails && selectedLog && (
        <div className="cat-modal-overlay">
          <div className="cat-modal-content" style={{ maxWidth: 600 }}>
            <div className="cat-modal-header">
              <h3><i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i> လုပ်ဆောင်ချက်အသေးစိတ်</h3>
              <button className="cat-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="cat-modal-body">
              <div className="cat-log-detail-header">
                <div className="cat-log-detail-main">
                  <div className="cat-log-detail-action">
                    <span className={`cat-action-badge cat-action-${selectedLog.actionType?.toLowerCase()}`}>
                      {selectedLog.actionType === 'ADD' && <i className="fas fa-plus"></i>}
                      {selectedLog.actionType === 'EDIT' && <i className="fas fa-edit"></i>}
                      {selectedLog.actionType === 'DELETE' && <i className="fas fa-trash"></i>}
                      {getActionLabel(selectedLog.actionType)}
                    </span>
                  </div>
                  <div className="cat-log-detail-category">
                    <i className="fas fa-tag"></i>
                    <span className="cat-category-name">{selectedLog.categoryName}</span>
                    {selectedLog.categoryId && <span className="cat-category-id-detail">ID: #{selectedLog.categoryId}</span>}
                  </div>
                </div>
                <div className="cat-log-detail-meta">
                  <div className="cat-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div><div className="cat-user-name-detail"><strong>{selectedLog.createdByName}</strong></div><div className="cat-user-role-detail">{selectedLog.createdByRole}</div></div>
                  </div>
                  <div className="cat-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div><div className="cat-log-date-detail">{formatDate(selectedLog.createdAt, language)}</div><div className="cat-log-time-detail">{formatTime(selectedLog.createdAt, language)}</div></div>
                  </div>
                </div>
              </div>
              <div className="cat-log-detail-content">
                <h4>အပြောင်းအလဲအသေးစိတ်:</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="cat-change-list">
                    {selectedLog.changes.map((detail, i) => (
                      <div key={i} className="cat-change-item"><i className="fas fa-chevron-right"></i><span>{detail}</span></div>
                    ))}
                  </div>
                ) : (
                  <div className="cat-no-changes"><i className="fas fa-info-circle"></i><span>အပြောင်းအလဲမှတ်တမ်း မရှိပါ</span></div>
                )}
              </div>
            </div>
            <div className="cat-modal-footer">
              <button className="cat-btn-cancel" onClick={() => setShowLogDetails(false)}>ပိတ်ရန်</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserCategoryPage;
