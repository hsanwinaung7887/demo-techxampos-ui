// UserDiscountPage.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DiscountModal from './DiscountModal';
import ProductSelectorModal from './ProductSelectorModal';
import ProductViewModal from './ProductViewModal';
import DiscountExportModal from './DiscountExportModal';
import "../../light-style/user-css/userDiscountPage.css";
import { useSelector } from 'react-redux';

// ============================================================
// ✅ DEMO SEED DATA — JSON + localStorage
// ============================================================
const DISCOUNTS_KEY = "demo_discounts";
const LOGS_KEY = "demo_discount_logs";
const PRODUCTS_KEY = "demo_products";
const SEED_VERSION_KEY = "demo_discount_seed_version";
const SEED_VERSION = "1.0.0";

// ✅ Demo Products
const SEED_PRODUCTS = [
  { id: 1, name: "ကီးဘုတ်", sku: "PRD-001", barcode: "120215421001", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 12000, totalStock: 25, notes: "" },
  { id: 2, name: "မောက်စ်", sku: "PRD-002", barcode: "120215421002", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 8500, totalStock: 3, notes: "" },
  { id: 3, name: "မော်နီတာ", sku: "PRD-003", barcode: "120215421003", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 250000, totalStock: 8, notes: "" },
  { id: 4, name: "နားကြပ်", sku: "PRD-004", barcode: "120215421004", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 45000, totalStock: 15, notes: "" },
  { id: 5, name: "ပါဝါဘန့်", sku: "PRD-005", barcode: "120215421005", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 28000, totalStock: 12, notes: "" },
  { id: 6, name: "ဖုန်း", sku: "PRD-006", barcode: "120215421006", categoryId: 1, categoryName: "အီလက်ထရောနစ်", sellingPrice: 380000, totalStock: 7, notes: "" },
  { id: 11, name: "ကော်ဖီ", sku: "PRD-011", barcode: "120215421011", categoryId: 2, categoryName: "အစားအသောက်", sellingPrice: 6000, totalStock: 40, notes: "" },
  { id: 12, name: "လဖက်ရည်", sku: "PRD-012", barcode: "120215421012", categoryId: 2, categoryName: "အစားအသောက်", sellingPrice: 4500, totalStock: 50, notes: "" },
  { id: 13, name: "ဘာဂါ", sku: "PRD-013", barcode: "120215421013", categoryId: 2, categoryName: "အစားအသောက်", sellingPrice: 7000, totalStock: 30, notes: "" },
  { id: 14, name: "ဗူးသတ္တု", sku: "PRD-014", barcode: "120215421014", categoryId: 2, categoryName: "အစားအသောက်", sellingPrice: 1500, totalStock: 120, notes: "" },
  { id: 15, name: "ရေသန့်", sku: "PRD-015", barcode: "120215421015", categoryId: 2, categoryName: "အစားအသောက်", sellingPrice: 700, totalStock: 200, notes: "" },
  { id: 21, name: "တီရှပ်", sku: "PRD-021", barcode: "120215421021", categoryId: 3, categoryName: "အဝတ်အထည်", sellingPrice: 12000, totalStock: 30, notes: "" },
  { id: 22, name: "ဖိနပ်", sku: "PRD-022", barcode: "120215421022", categoryId: 3, categoryName: "အဝတ်အထည်", sellingPrice: 35000, totalStock: 14, notes: "" },
  { id: 23, name: "ဦးထုပ်", sku: "PRD-023", barcode: "120215421023", categoryId: 3, categoryName: "အဝတ်အထည်", sellingPrice: 6500, totalStock: 35, notes: "" },
  { id: 31, name: "မီးသီး", sku: "PRD-031", barcode: "120215421031", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း", sellingPrice: 2800, totalStock: 60, notes: "" },
  { id: 32, name: "ခွက်", sku: "PRD-032", barcode: "120215421032", categoryId: 4, categoryName: "အိမ်သုံးပစ္စည်း", sellingPrice: 4500, totalStock: 45, notes: "" },
  { id: 41, name: "စာအုပ်မှတ်စု", sku: "PRD-041", barcode: "120215421041", categoryId: 5, categoryName: "စာရေးကိရိယာ", sellingPrice: 2500, totalStock: 50, notes: "" },
  { id: 43, name: "ခဲဖျက်", sku: "PRD-043", barcode: "120215421043", categoryId: 5, categoryName: "စာရေးကိရိယာ", sellingPrice: 1000, totalStock: 100, notes: "" }
];

// ✅ Demo Discounts
const SEED_DISCOUNTS = [
  {
    id: 1, name: "Clothing 10% OFF", code: "CLOTH10", type: "Percentage",
    applicableTo: "selected", discountValue: 10,
    minPurchase: null, maxUsage: 100, buyQuantity: null, getQuantity: null, discountAmount: null,
    startDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 25 * 86400000).toISOString().split('T')[0],
    startTime: "09:00", endTime: "17:00",
    status: "Active", notes: "အဝတ်အထည် ၁၀% လျှော့",
    selectedProductIds: [21, 22, 23],
    productCount: 3,
    calculatedTotalDiscount: 5350,
    usageCount: 12,
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 2, name: "Coffee 500 Ks OFF", code: "COFF500", type: "Fixed",
    applicableTo: "selected", discountValue: 500,
    minPurchase: null, maxUsage: 50, buyQuantity: null, getQuantity: null, discountAmount: null,
    startDate: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 27 * 86400000).toISOString().split('T')[0],
    startTime: "09:00", endTime: "17:00",
    status: "Active", notes: "ကော်ဖီ ၅၀၀ ကျပ် လျှော့",
    selectedProductIds: [11],
    productCount: 1,
    calculatedTotalDiscount: 500,
    usageCount: 25,
    createdByName: "Cashier1", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 3, name: "Buy 2 Get 1 Free", code: "BUY2GET1", type: "BuyXGetY",
    applicableTo: "selected", discountValue: null,
    minPurchase: null, maxUsage: null, buyQuantity: 2, getQuantity: 1, discountAmount: null,
    startDate: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 20 * 86400000).toISOString().split('T')[0],
    startTime: "09:00", endTime: "17:00",
    status: "Active", notes: "၂ ခုဝယ် ၁ ခုအပိုရ",
    selectedProductIds: [12, 13, 14],
    productCount: 3,
    calculatedTotalDiscount: 4500,
    usageCount: 8,
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 4, name: "Morning Special", code: "MORN20", type: "Time Based",
    applicableTo: "all", discountValue: 20,
    minPurchase: null, maxUsage: null, buyQuantity: null, getQuantity: null, discountAmount: null,
    startDate: new Date(Date.now() - 7 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 23 * 86400000).toISOString().split('T')[0],
    startTime: "06:00", endTime: "10:00",
    status: "Active", notes: "မနက် ၆ နာရီမှ ၁၀ နာရီအထိ ၂၀% လျှော့",
    selectedProductIds: [1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 41, 43],
    productCount: 18,
    calculatedTotalDiscount: 45000,
    usageCount: 45,
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 5, name: "Expired 15% Off", code: "EXP15", type: "Percentage",
    applicableTo: "all", discountValue: 15,
    minPurchase: null, maxUsage: 100, buyQuantity: null, getQuantity: null, discountAmount: null,
    startDate: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    startTime: "09:00", endTime: "17:00",
    status: "Active", notes: "ကာလပြီးသွားသော လျှော့ဈေး",
    selectedProductIds: [1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 41, 43],
    productCount: 18,
    calculatedTotalDiscount: 32000,
    usageCount: 88,
    createdByName: "Admin", createdByRole: "Owner",
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    branchId: 1
  },
  {
    id: 6, name: "Inactive Promo", code: "INACT10", type: "Percentage",
    applicableTo: "all", discountValue: 10,
    minPurchase: null, maxUsage: null, buyQuantity: null, getQuantity: null, discountAmount: null,
    startDate: new Date(Date.now() - 15 * 86400000).toISOString().split('T')[0],
    endDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    startTime: "09:00", endTime: "17:00",
    status: "Inactive", notes: "ပိတ်ထားသော လျှော့ဈေး",
    selectedProductIds: [1, 2, 3, 4, 5, 6, 11, 12, 13, 14, 15, 21, 22, 23, 31, 32, 41, 43],
    productCount: 18,
    calculatedTotalDiscount: 0,
    usageCount: 0,
    createdByName: "Cashier2", createdByRole: "Cashier",
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    branchId: 1
  }
];

// ✅ Demo Logs
const SEED_LOGS = [
  { id: 1, actionType: "ADD", discountId: 1, discountName: "Clothing 10% OFF", productNames: ["တီရှပ်", "ဖိနပ်", "ဦးထုပ်"], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 5 * 86400000).toISOString(), branchId: 1, changes: ["Discount created: 10%"] },
  { id: 2, actionType: "ADD", discountId: 2, discountName: "Coffee 500 Ks OFF", productNames: ["ကော်ဖီ"], createdByName: "Cashier1", createdByRole: "Cashier", createdAt: new Date(Date.now() - 3 * 86400000).toISOString(), branchId: 1, changes: ["Discount created: 500 Ks"] },
  { id: 3, actionType: "EDIT", discountId: 2, discountName: "Coffee 500 Ks OFF", productNames: ["ကော်ဖီ"], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 2 * 86400000).toISOString(), branchId: 1, changes: ["MaxUsage: 30 → 50"] },
  { id: 4, actionType: "ADD", discountId: 3, discountName: "Buy 2 Get 1 Free", productNames: ["လဖက်ရည်", "ဘာဂါ", "ဗူးသတ္တု"], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 10 * 86400000).toISOString(), branchId: 1, changes: ["Discount created: Buy 2 Get 1"] },
  { id: 5, actionType: "ADD", discountId: 4, discountName: "Morning Special", productNames: [], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 7 * 86400000).toISOString(), branchId: 1, changes: ["Discount created: Time Based 20%"] },
  { id: 6, actionType: "DELETE", discountId: 99, discountName: "Old Promo", productNames: [], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 12 * 86400000).toISOString(), branchId: 1, changes: ["Discount deleted"] },
  { id: 7, actionType: "ADD", discountId: 5, discountName: "Expired 15% Off", productNames: [], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 30 * 86400000).toISOString(), branchId: 1, changes: ["Discount created: 15%"] },
  { id: 8, actionType: "ADD", discountId: 6, discountName: "Inactive Promo", productNames: [], createdByName: "Cashier2", createdByRole: "Cashier", createdAt: new Date(Date.now() - 15 * 86400000).toISOString(), branchId: 1, changes: ["Discount created: 10%"] },
  { id: 9, actionType: "EDIT", discountId: 6, discountName: "Inactive Promo", productNames: [], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 14 * 86400000).toISOString(), branchId: 1, changes: ["Status: Active → Inactive"] },
  { id: 10, actionType: "EDIT", discountId: 1, discountName: "Clothing 10% OFF", productNames: ["တီရှပ်", "ဖိနပ်", "ဦးထုပ်"], createdByName: "Admin", createdByRole: "Owner", createdAt: new Date(Date.now() - 1 * 86400000).toISOString(), branchId: 1, changes: ["EndDate updated"] }
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

const ensureDiscountSeed = () => {
  const v = localStorage.getItem(SEED_VERSION_KEY);
  if (v !== SEED_VERSION) {
    saveData(DISCOUNTS_KEY, SEED_DISCOUNTS);
    saveData(LOGS_KEY, SEED_LOGS);
    saveData(PRODUCTS_KEY, SEED_PRODUCTS);
    localStorage.setItem(SEED_VERSION_KEY, SEED_VERSION);
    console.log('🌱 Discount seed loaded');
  } else {
    if (getData(DISCOUNTS_KEY, []).length === 0) saveData(DISCOUNTS_KEY, SEED_DISCOUNTS);
    if (getData(LOGS_KEY, []).length === 0) saveData(LOGS_KEY, SEED_LOGS);
    if (getData(PRODUCTS_KEY, []).length === 0) saveData(PRODUCTS_KEY, SEED_PRODUCTS);
  }
};

const generateDiscountId = () => {
  const discounts = getData(DISCOUNTS_KEY, []);
  return discounts.reduce((m, d) => Math.max(m, d.id || 0), 0) + 1;
};

const generateLogId = () => {
  const logs = getData(LOGS_KEY, []);
  return logs.reduce((m, l) => Math.max(m, l.id || 0), 0) + 1;
};

const addDiscountLog = (logData) => {
  const logs = getData(LOGS_KEY, []);
  const newLog = {
    id: generateLogId(),
    actionType: logData.actionType || 'ADD',
    discountId: logData.discountId || 0,
    discountName: logData.discountName || '',
    productNames: logData.productNames || [],
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

const delay = (ms = 200) => new Promise(r => setTimeout(r, ms));

// ============================================================
// Helper functions
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

const calculateTotalDiscount = (discount, allProducts) => {
  if (discount.calculatedTotalDiscount !== undefined && discount.calculatedTotalDiscount !== null) {
    return discount.calculatedTotalDiscount;
  }
  if (!discount.selectedProductIds || discount.selectedProductIds.length === 0) return 0;
  const selectedProducts = allProducts.filter(p => discount.selectedProductIds.includes(p.id));
  let total = 0;
  selectedProducts.forEach(product => {
    const price = product.sellingPrice || 0;
    switch(discount.type) {
      case 'Percentage': total += price * (discount.discountValue / 100); break;
      case 'Fixed': total += discount.discountValue; break;
      case 'Buy Amount': if (price >= discount.minPurchase) total += discount.discountAmount; break;
      case 'BuyXGetY': total += price * discount.getQuantity; break;
      case 'Time Based': total += price * (discount.discountValue / 100); break;
      default: total += 0;
    }
  });
  return Math.round(total);
};

const checkDiscountConflicts = (discount, allDiscounts, allProducts) => {
  if (!discount.selectedProductIds || discount.selectedProductIds.length === 0) return [];
  const conflicts = [];
  const today = new Date().toISOString().split('T')[0];
  discount.selectedProductIds.forEach(productId => {
    const conflictingDiscounts = allDiscounts.filter(d =>
      d.id !== discount.id &&
      d.applicableTo === 'selected' &&
      d.selectedProductIds &&
      d.selectedProductIds.includes(productId) &&
      d.status === 'Active' &&
      d.endDate >= today
    );
    if (conflictingDiscounts.length > 0) {
      const product = allProducts.find(p => p.id === productId);
      conflicts.push({
        productId,
        productName: product?.name || `Product #${productId}`,
        discounts: conflictingDiscounts.map(d => d.name)
      });
    }
  });
  return conflicts;
};

const getActionIcon = (type) => {
  switch (type) {
    case 'ADD': return 'fa-plus-circle';
    case 'EDIT': return 'fa-edit';
    case 'DELETE': return 'fa-trash';
    default: return 'fa-history';
  }
};

const getActionColor = (type) => {
  switch (type) {
    case 'ADD': return '#10b981';
    case 'EDIT': return '#f59e0b';
    case 'DELETE': return '#ef4444';
    default: return '#6b7280';
  }
};

const getStatusLabel = (status, lang) => {
  switch(status) {
    case 'Active': return lang === 'mm' ? 'အသုံးပြုနိုင်' : 'Active';
    case 'Inactive': return lang === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive';
    case 'Expired': return lang === 'mm' ? 'ကာလပြီး' : 'Expired';
    default: return status;
  }
};

const getTypeLabel = (type, lang) => {
  switch(type) {
    case 'Percentage': return lang === 'mm' ? 'ရာခိုင်နှုန်း' : 'Percentage';
    case 'Fixed': return lang === 'mm' ? 'တိကျသောပမာဏ' : 'Fixed Amount';
    case 'Buy Amount': return lang === 'mm' ? 'ဝယ်ယူငွေအပေါ်' : 'Buy Amount';
    case 'BuyXGetY': return lang === 'mm' ? 'ဝယ် X ရ Y' : 'Buy X Get Y';
    case 'Time Based': return lang === 'mm' ? 'အချိန်အခြေခံ' : 'Time Based';
    default: return type;
  }
};

const getTypeIcon = (type) => {
  switch(type) {
    case 'Percentage': return 'fa-percent';
    case 'Fixed': return 'fa-money-bill-wave';
    case 'Buy Amount': return 'fa-shopping-cart';
    case 'BuyXGetY': return 'fa-gift';
    case 'Time Based': return 'fa-clock';
    default: return 'fa-tag';
  }
};

const getTypeColor = (type) => {
  switch(type) {
    case 'Percentage': return '#4361ee';
    case 'Fixed': return '#4cc9f0';
    case 'Buy Amount': return '#f8961e';
    case 'BuyXGetY': return '#f72585';
    case 'Time Based': return '#3a0ca3';
    default: return '#6c757d';
  }
};

const formatCurrency = (amount) => (amount?.toLocaleString() || '0') + ' MMK';

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

const isExpired = (endDate) => {
  const today = new Date().toISOString().split('T')[0];
  return endDate < today;
};

const getDaysRemaining = (startDate, endDate) => {
  const today = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
};

const calculateDiscountValue = (discount, lang) => {
  switch(discount.type) {
    case "Percentage":
      return lang === 'mm' ? `${discount.discountValue}% လျှော့ဈေး` : `${discount.discountValue}% off`;
    case "Fixed":
      return lang === 'mm' ? `${parseInt(discount.discountValue || 0).toLocaleString()} Ks လျှော့ဈေး` : `${parseInt(discount.discountValue || 0).toLocaleString()} Ks off`;
    case "Buy Amount":
      return lang === 'mm' ? `${parseInt(discount.minPurchase || 0).toLocaleString()} Ks ဝယ်လျှင် ${parseInt(discount.discountAmount || 0).toLocaleString()} Ks လျှော့` : `${parseInt(discount.minPurchase || 0).toLocaleString()} Ks buy, get ${parseInt(discount.discountAmount || 0).toLocaleString()} Ks off`;
    case "BuyXGetY":
      return lang === 'mm' ? `${discount.buyQuantity} ခုဝယ် ${discount.getQuantity} ခုအပိုရ` : `Buy ${discount.buyQuantity} Get ${discount.getQuantity} Free`;
    case "Time Based":
      return lang === 'mm' ? `${discount.discountValue}% (${discount.startTime} - ${discount.endTime})` : `${discount.discountValue}% (${discount.startTime} - ${discount.endTime})`;
    default:
      return discount.discountValue || "";
  }
};

// ============================================================
// Main Component
// ============================================================
const UserDiscountPage = () => {
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
  useEffect(() => { ensureDiscountSeed(); }, []);

  // ===== STATE =====
  const [discounts, setDiscounts] = useState([]);
  const [discountsMap, setDiscountsMap] = useState(new Map());
  const [filteredDiscounts, setFilteredDiscounts] = useState([]);
  const [discountConflicts, setDiscountConflicts] = useState(new Map());
  const [logs, setLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  const [loading, setLoading] = useState(false);
  const [tableLoading, setTableLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [networkError, setNetworkError] = useState(null);

  const [activeTab, setActiveTab] = useState('all-discounts');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchInputValue, setSearchInputValue] = useState('');

  const [pagination, setPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1, hasMore: false, hasPrevious: false });
  const [logPagination, setLogPagination] = useState({ page: 1, size: 10, total: 0, totalPages: 1, hasMore: false, hasPrevious: false });

  const [logFilter, setLogFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ filter: 'all', customFrom: '', customTo: '' });

  const [statusCounts, setStatusCounts] = useState({ all: 0, active: 0, inactive: 0, expired: 0 });
  const [actionTypeCounts, setActionTypeCounts] = useState({ all: 0, ADD: 0, EDIT: 0, DELETE: 0 });

  // UI state
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [showConflictAlert, setShowConflictAlert] = useState(false);
  const [conflicts, setConflicts] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showProductViewModal, setShowProductViewModal] = useState(false);
  const [viewProductIds, setViewProductIds] = useState([]);

  const [pageInputValue, setPageInputValue] = useState('1');
  const [historyPageInputValue, setHistoryPageInputValue] = useState('1');
  const [loadingDirection, setLoadingDirection] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Products (all — from localStorage)
  const [allProducts, setAllProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(false);
  const [productTotalPages, setProductTotalPages] = useState(1);
  const [productTotalItems, setProductTotalItems] = useState(0);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tempSelectedProducts, setTempSelectedProducts] = useState([]);
  const [productPage, setProductPage] = useState(1);
  const [productPageSize, setProductPageSize] = useState(20);
  const [selectorProducts, setSelectorProducts] = useState([]);

  // Form state
  const [discountForm, setDiscountForm] = useState({
    id: null, name: '', code: '', type: 'Percentage', applicableTo: 'all',
    discountValue: '', minPurchase: '', maxUsage: '',
    startDate: '', endDate: '', startTime: '09:00', endTime: '17:00',
    buyQuantity: 1, getQuantity: 1, discountAmount: '',
    status: 'Active', notes: '', selectedProductIds: []
  });

  const [formErrors, setFormErrors] = useState({});
  const [validationError, setValidationError] = useState(null);

  // Refs
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);
  const pageChangeTimeoutRef = useRef(null);
  const filterTimeoutRef = useRef(null);
  const initialLoadDone = useRef(false);
  const searchInputRef = useRef(null);

  // ============================================================
  // ✅ LOAD DATA
  // ============================================================
  const loadDiscounts = useCallback((page = 1, size = 10, tab = 'all-discounts', search = '') => {
    const branchId = currentUser.branch_id || 1;
    let all = getData(DISCOUNTS_KEY, []);
    all = all.filter(d => !d.branchId || d.branchId === branchId);

    const today = new Date().toISOString().split('T')[0];

    // Status counts
    setStatusCounts({
      all: all.length,
      active: all.filter(d => d.status === 'Active' && d.endDate >= today).length,
      inactive: all.filter(d => d.status === 'Inactive').length,
      expired: all.filter(d => d.status === 'Expired' || d.endDate < today).length,
    });

    // Filter by tab
    let filtered = [...all];
    if (tab === 'active') filtered = filtered.filter(d => d.status === 'Active' && d.endDate >= today);
    else if (tab === 'inactive') filtered = filtered.filter(d => d.status === 'Inactive');
    else if (tab === 'expired') filtered = filtered.filter(d => d.status === 'Expired' || d.endDate < today);

    // Search
    if (search) {
      const q = search.toLowerCase().trim();
      filtered = filtered.filter(d =>
        d.name?.toLowerCase().includes(q) ||
        d.code?.toLowerCase().includes(q) ||
        d.type?.toLowerCase().includes(q)
      );
    }

    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // Pagination
    const totalItems = filtered.length;
    const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
    const safePage = Math.min(Math.max(1, page), totalPagesCalc);
    const start = (safePage - 1) * size;
    const paged = filtered.slice(start, start + size);

    // Build map + conflicts
    const map = new Map();
    const conflictsMap = new Map();
    paged.forEach(d => {
      map.set(d.id, d);
      if (d.applicableTo === 'selected' && d.selectedProductIds) {
        d.selectedProductIds.forEach(pid => {
          if (!conflictsMap.has(pid)) conflictsMap.set(pid, []);
          conflictsMap.get(pid).push(d.name);
        });
      }
    });

    setDiscounts(paged);
    setFilteredDiscounts(paged);
    setDiscountsMap(map);
    setDiscountConflicts(conflictsMap);
    setPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc, hasMore: safePage < totalPagesCalc, hasPrevious: safePage > 1 });
    setPageInputValue(safePage.toString());
  }, [currentUser.branch_id]);

  const loadLogs = useCallback((page = 1, size = 10, actionFilter = 'all', dFilter = { filter: 'all' }) => {
    const branchId = currentUser.branch_id || 1;
    let all = getData(LOGS_KEY, []);
    all = all.filter(l => !l.branchId || l.branchId === branchId);

    setActionTypeCounts({
      all: all.length,
      ADD: all.filter(l => l.actionType === 'ADD').length,
      EDIT: all.filter(l => l.actionType === 'EDIT').length,
      DELETE: all.filter(l => l.actionType === 'DELETE').length,
    });

    if (actionFilter !== 'all') all = all.filter(l => l.actionType === actionFilter);

    if (dFilter.filter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);

      all = all.filter(log => {
        if (!log.createdAt) return true;
        const ld = new Date(log.createdAt);
        switch (dFilter.filter) {
          case 'today': return ld >= today;
          case 'yesterday': return ld >= yesterday && ld < today;
          case 'thisWeek': return ld >= weekAgo;
          case 'thisMonth': return ld >= monthAgo;
          case 'custom':
            if (dFilter.customFrom && dFilter.customTo) {
              const from = new Date(dFilter.customFrom);
              const to = new Date(dFilter.customTo);
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
    setLogPagination({ page: safePage, size, total: totalItems, totalPages: totalPagesCalc, hasMore: safePage < totalPagesCalc, hasPrevious: safePage > 1 });
    setHistoryPageInputValue(safePage.toString());
  }, [currentUser.branch_id]);

  // Load products
  const loadAllProducts = useCallback(() => {
    const branchId = currentUser.branch_id || 1;
    const products = getData(PRODUCTS_KEY, []).filter(p => !p.branchId || p.branchId === branchId);
    setAllProducts(products);
    return products;
  }, [currentUser.branch_id]);

  // Selector products (paged)
  const loadSelectorProducts = useCallback((page = 1, size = 20, search = '', category = 'all') => {
    setProductsLoading(true);
    const branchId = currentUser.branch_id || 1;
    let products = getData(PRODUCTS_KEY, []).filter(p => !p.branchId || p.branchId === branchId);

    if (category && category !== 'all') {
      products = products.filter(p => p.categoryId === category);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      products = products.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.sku?.toLowerCase().includes(q) ||
        String(p.id).includes(q)
      );
    }

    const totalItems = products.length;
    const totalPagesCalc = Math.max(1, Math.ceil(totalItems / size));
    const safePage = Math.min(Math.max(1, page), totalPagesCalc);
    const start = (safePage - 1) * size;
    const paged = products.slice(start, start + size);

    setSelectorProducts(paged);
    setProductTotalPages(totalPagesCalc);
    setProductTotalItems(totalItems);
    setProductsLoading(false);
  }, [currentUser.branch_id]);

  // ============================================================
  // ✅ INITIAL LOAD
  // ============================================================
  useEffect(() => {
    if (!initialLoadDone.current) {
      initialLoadDone.current = true;
      loadDiscounts(1, 10, 'all-discounts', '');
      loadLogs(1, 10, 'all', { filter: 'all' });
      loadAllProducts();
    }
  }, [loadDiscounts, loadLogs, loadAllProducts]);

  // Tab/search change
  useEffect(() => {
    if (!initialLoadDone.current) return;
    if (activeTab === 'history') return;
    const t = setTimeout(() => {
      loadDiscounts(1, pagination.size, activeTab, searchQuery);
    }, 300);
    return () => clearTimeout(t);
  }, [activeTab, searchQuery, pagination.size, loadDiscounts]);

  // Logs filter change
  useEffect(() => {
    if (!initialLoadDone.current) return;
    loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
  }, [logFilter, dateFilter, logPagination.size, logPagination.page, loadLogs]);

  // Product selector load
  useEffect(() => {
    if (showProductSelector) {
      loadSelectorProducts(productPage, productPageSize, productSearchQuery, selectedCategory);
    }
  }, [showProductSelector, productPage, productPageSize, productSearchQuery, selectedCategory, loadSelectorProducts]);

  // ============================================================
  // ✅ FORM VALIDATION
  // ============================================================
  const validateForm = useCallback(() => {
    const errors = {};
    let isValid = true;

    if (!discountForm.name.trim()) { errors.name = lang === 'mm' ? 'လျှော့ဈေးအမည် လိုအပ်ပါသည်' : 'Discount name is required'; isValid = false; }
    if (!discountForm.code.trim()) { errors.code = lang === 'mm' ? 'လျှော့ဈေးကုဒ် လိုအပ်ပါသည်' : 'Discount code is required'; isValid = false; }
    if (!discountForm.startDate) { errors.startDate = lang === 'mm' ? 'စတင်ရက် လိုအပ်ပါသည်' : 'Start date is required'; isValid = false; }
    if (!discountForm.endDate) { errors.endDate = lang === 'mm' ? 'ပြီးဆုံးရက် လိုအပ်ပါသည်' : 'End date is required'; isValid = false; }
    if (discountForm.startDate && discountForm.endDate && discountForm.startDate > discountForm.endDate) {
      errors.endDate = lang === 'mm' ? 'ပြီးဆုံးရက်သည် စတင်ရက်နောက်မှ ဖြစ်ရပါမည်' : 'End date must be after start date';
      isValid = false;
    }

    switch(discountForm.type) {
      case 'Percentage':
        if (!discountForm.discountValue || discountForm.discountValue <= 0 || discountForm.discountValue > 100) {
          errors.discountValue = lang === 'mm' ? 'ရာခိုင်နှုန်းသည် 1 နှင့် 100 ကြားဖြစ်ရပါမည်' : 'Percentage must be between 1 and 100';
          isValid = false;
        }
        break;
      case 'Fixed':
        if (!discountForm.discountValue || discountForm.discountValue <= 0) {
          errors.discountValue = lang === 'mm' ? 'လျှော့ဈေးပမာဏ လိုအပ်ပါသည်' : 'Discount amount is required';
          isValid = false;
        }
        break;
      case 'Buy Amount':
        if (!discountForm.minPurchase || discountForm.minPurchase <= 0) {
          errors.minPurchase = lang === 'mm' ? 'အနည်းဆုံးဝယ်ယူငွေ လိုအပ်ပါသည်' : 'Minimum purchase is required';
          isValid = false;
        }
        if (!discountForm.discountAmount || discountForm.discountAmount <= 0) {
          errors.discountAmount = lang === 'mm' ? 'လျှော့ဈေးပမာဏ လိုအပ်ပါသည်' : 'Discount amount is required';
          isValid = false;
        }
        if (discountForm.minPurchase && discountForm.discountAmount && discountForm.discountAmount >= discountForm.minPurchase) {
          errors.discountAmount = lang === 'mm' ? 'လျှော့ဈေးပမာဏသည် အနည်းဆုံးဝယ်ယူငွေထက် နည်းရပါမည်' : 'Discount amount must be less than minimum purchase';
          isValid = false;
        }
        break;
      case 'BuyXGetY':
        if (!discountForm.buyQuantity || discountForm.buyQuantity <= 0) { errors.buyQuantity = lang === 'mm' ? 'ဝယ်ယူရမည့်အရေအတွက် လိုအပ်ပါသည်' : 'Buy quantity is required'; isValid = false; }
        if (!discountForm.getQuantity || discountForm.getQuantity <= 0) { errors.getQuantity = lang === 'mm' ? 'ရရှိမည့်အရေအတွက် လိုအပ်ပါသည်' : 'Get quantity is required'; isValid = false; }
        break;
      case 'Time Based':
        if (!discountForm.discountValue || discountForm.discountValue <= 0 || discountForm.discountValue > 100) {
          errors.discountValue = lang === 'mm' ? 'ရာခိုင်နှုန်းသည် 1 နှင့် 100 ကြားဖြစ်ရပါမည်' : 'Percentage must be between 1 and 100';
          isValid = false;
        }
        if (!discountForm.startTime || !discountForm.endTime) {
          errors.startTime = lang === 'mm' ? 'စတင်ချိန်နှင့်ပြီးဆုံးချိန် လိုအပ်ပါသည်' : 'Start time and end time are required';
          isValid = false;
        }
        if (discountForm.startTime && discountForm.endTime && discountForm.startTime >= discountForm.endTime) {
          errors.endTime = lang === 'mm' ? 'ပြီးဆုံးချိန်သည် စတင်ချိန်နောက်မှ ဖြစ်ရပါမည်' : 'End time must be after start time';
          isValid = false;
        }
        break;
    }

    if (discountForm.applicableTo === 'selected' && (!discountForm.selectedProductIds || discountForm.selectedProductIds.length === 0)) {
      errors.selectedProductIds = lang === 'mm' ? 'အနည်းဆုံး ပစ္စည်းတစ်ခုရွေးချယ်ရပါမည်' : 'Please select at least one product';
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  }, [discountForm, lang]);

  const isFormValid = useMemo(() => {
    if (!discountForm.name.trim() || !discountForm.code.trim() || !discountForm.startDate || !discountForm.endDate) return false;
    if (discountForm.startDate > discountForm.endDate) return false;
    switch(discountForm.type) {
      case 'Percentage':
        return discountForm.discountValue && discountForm.discountValue > 0 && discountForm.discountValue <= 100;
      case 'Fixed':
        return discountForm.discountValue && discountForm.discountValue > 0;
      case 'Buy Amount':
        const mp = Number(discountForm.minPurchase);
        const da = Number(discountForm.discountAmount);
        return mp > 0 && da > 0 && da < mp;
      case 'BuyXGetY':
        return discountForm.buyQuantity && discountForm.buyQuantity > 0 && discountForm.getQuantity && discountForm.getQuantity > 0;
      case 'Time Based':
        return discountForm.discountValue && discountForm.discountValue > 0 && discountForm.discountValue <= 100 && discountForm.startTime && discountForm.endTime && discountForm.startTime < discountForm.endTime;
      default: return false;
    }
  }, [discountForm]);

  // ============================================================
  // ✅ PAGINATION
  // ============================================================
  const changePage = (newPage, direction) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    if (tableBodyRef.current) tableBodyRef.current.scrollTop = 0;
    loadDiscounts(newPage, pagination.size, activeTab, searchQuery);
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
    loadDiscounts(1, newSize, activeTab, searchQuery);
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
      loadDiscounts(1, pagination.size, activeTab, searchInputValue);
    }
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchQuery('');
    setPagination(p => ({ ...p, page: 1 }));
    setPageInputValue('1');
    loadDiscounts(1, pagination.size, activeTab, '');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  const clearAllFilters = () => {
    setSearchInputValue('');
    setSearchQuery('');
    setStatusFilter('all');
    setPagination(p => ({ ...p, page: 1 }));
    setPageInputValue('1');
    if (searchInputRef.current) searchInputRef.current.focus();
  };

  // ===== Tab =====
  const handleTabChange = (e) => {
    const value = e.target.value;
    if (value === 'export') { setShowExportModal(true); e.target.value = activeTab; return; }
    setActiveTab(value);
  };

  // ===== VIEW PRODUCTS =====
  const handleViewProducts = (discount) => {
    if (discount.selectedProductIds && discount.selectedProductIds.length > 0) {
      setViewProductIds(discount.selectedProductIds);
      setShowProductViewModal(true);
    } else {
      alert(lang === 'mm' ? 'ဤလျှော့ဈေးအတွက် ပစ္စည်းများ ရွေးချယ်ထားခြင်း မရှိပါ' : 'No products selected for this discount');
    }
  };

  // ============================================================
  // ✅ CRUD HANDLERS
  // ============================================================
  const handleAction = async (action, discountId) => {
    const discount = discountsMap.get(discountId);
    if (!discount) return;

    if (action === 'edit') {
      setDiscountForm({
        id: discount.id, name: discount.name, code: discount.code, type: discount.type,
        applicableTo: discount.applicableTo, discountValue: discount.discountValue || '',
        minPurchase: discount.minPurchase || '', maxUsage: discount.maxUsage || '',
        startDate: discount.startDate, endDate: discount.endDate,
        startTime: discount.startTime || '09:00', endTime: discount.endTime || '17:00',
        buyQuantity: discount.buyQuantity || 1, getQuantity: discount.getQuantity || 1,
        discountAmount: discount.discountAmount || '', status: discount.status,
        notes: discount.notes || '', selectedProductIds: discount.selectedProductIds || []
      });
      setFormErrors({});
      setModalType('edit');
      setShowDiscountModal(true);
    } else if (action === 'delete') {
      if (window.confirm(lang === 'mm' ? `"${discount.name}" လျှော့ဈေးကို ဖျက်ရန် သေချာပါသလား?` : `Are you sure you want to delete the discount "${discount.name}"?`)) {
        try {
          setLoading(true);
          await delay(200);
          const discounts = getData(DISCOUNTS_KEY, []).filter(d => d.id !== discountId);
          saveData(DISCOUNTS_KEY, discounts);
          addDiscountLog({
            actionType: 'DELETE', discountId, discountName: discount.name,
            productNames: [], createdByName: currentUser.name, createdByRole: currentUser.role,
            branchId: discount.branchId, changes: [`Discount "${discount.name}" deleted`]
          });
          setSuccess(true);
          loadDiscounts(1, pagination.size, activeTab, searchQuery);
          loadLogs(1, logPagination.size, logFilter, dateFilter);
          setTimeout(() => setSuccess(false), 3000);
        } catch (err) { setError(err.message); }
        finally { setLoading(false); }
      }
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;
    if (name === 'minPurchase' || name === 'discountAmount' || name === 'discountValue') {
      newValue = value === '' ? '' : Number(value);
    }
    setDiscountForm(prev => ({ ...prev, [name]: newValue }));
    if (formErrors[name]) setFormErrors(prev => ({ ...prev, [name]: null }));
  };

  const handleTypeChange = (type) => setDiscountForm(prev => ({ ...prev, type }));
  const handleStatusChange = (status) => setDiscountForm(prev => ({ ...prev, status }));

  const handleApplicableToChange = async (applicableTo) => {
    setDiscountForm(prev => ({ ...prev, applicableTo }));

    if (applicableTo === 'all') {
      try {
        setLoading(true);
        const products = loadAllProducts();
        const allProductIds = products.map(p => p.id);
        setDiscountForm(prev => ({ ...prev, applicableTo: 'all', selectedProductIds: allProductIds }));

        const tempDiscount = { ...discountForm, applicableTo: 'all', selectedProductIds: allProductIds };
        const conflictsList = checkDiscountConflicts(tempDiscount, discounts, products);
        if (conflictsList.length > 0) { setConflicts(conflictsList); setShowConflictAlert(true); }
        else setShowConflictAlert(false);
      } catch (error) { console.error(error); }
      finally { setLoading(false); }
    } else {
      openProductSelector();
    }
  };

  const generateDiscountCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
    setDiscountForm(prev => ({ ...prev, code }));
  };

  const openProductSelector = () => {
    setTempSelectedProducts(discountForm.selectedProductIds || []);
    setProductPage(1);
    setProductSearchQuery('');
    setSelectedCategory('all');
    setShowProductSelector(true);
  };

  const saveProductSelection = (selectedIds) => {
    setDiscountForm(prev => ({ ...prev, selectedProductIds: selectedIds }));
    const tempDiscount = { ...discountForm, selectedProductIds: selectedIds };
    const conflictsList = checkDiscountConflicts(tempDiscount, discounts, allProducts);
    if (conflictsList.length > 0) { setConflicts(conflictsList); setShowConflictAlert(true); }
    else setShowConflictAlert(false);
    setShowProductSelector(false);
  };

  const openAddModal = () => {
    setDiscountForm({
      id: null, name: '', code: '', type: 'Percentage', applicableTo: 'all',
      discountValue: '', minPurchase: '', maxUsage: '',
      startDate: '', endDate: '', startTime: '09:00', endTime: '17:00',
      buyQuantity: 1, getQuantity: 1, discountAmount: '',
      status: 'Active', notes: '', selectedProductIds: []
    });
    setFormErrors({});
    setShowConflictAlert(false);
    setModalType('add');
    setShowDiscountModal(true);
  };

  const handleSaveDiscount = async () => {
    if (!validateForm()) {
      setValidationError(lang === 'mm' ? 'ဖောင်တွင် အမှားများကို ပြင်ဆင်ပါ' : 'Please fix the errors in the form');
      return;
    }

    try {
      setLoading(true);
      await delay(300);

      const discounts = getData(DISCOUNTS_KEY, []);
      const branchId = currentUser.branch_id || 1;
      const now = new Date().toISOString();

      // Product names for log
      const selectedNames = (discountForm.selectedProductIds || [])
        .map(id => allProducts.find(p => p.id === id)?.name)
        .filter(Boolean);

      const formattedData = {
        name: discountForm.name,
        code: discountForm.code,
        type: discountForm.type,
        applicableTo: discountForm.applicableTo,
        discountValue: discountForm.discountValue ? parseFloat(discountForm.discountValue) : null,
        minPurchase: discountForm.minPurchase ? parseFloat(discountForm.minPurchase) : null,
        maxUsage: discountForm.maxUsage ? parseInt(discountForm.maxUsage) : null,
        buyQuantity: discountForm.buyQuantity ? parseInt(discountForm.buyQuantity) : null,
        getQuantity: discountForm.getQuantity ? parseInt(discountForm.getQuantity) : null,
        discountAmount: discountForm.discountAmount ? parseFloat(discountForm.discountAmount) : null,
        startDate: discountForm.startDate,
        endDate: discountForm.endDate,
        startTime: discountForm.startTime ? discountForm.startTime.substring(0, 5) : null,
        endTime: discountForm.endTime ? discountForm.endTime.substring(0, 5) : null,
        status: discountForm.status,
        notes: discountForm.notes,
        selectedProductIds: discountForm.selectedProductIds || [],
        productCount: (discountForm.selectedProductIds || []).length,
        branchId
      };

      if (modalType === 'add') {
        const newId = generateDiscountId();
        const newDiscount = {
          id: newId,
          ...formattedData,
          calculatedTotalDiscount: calculateTotalDiscount(formattedData, allProducts),
          usageCount: 0,
          createdByName: currentUser.name,
          createdByRole: currentUser.role,
          createdAt: now
        };
        discounts.unshift(newDiscount);
        saveData(DISCOUNTS_KEY, discounts);

        addDiscountLog({
          actionType: 'ADD', discountId: newId, discountName: newDiscount.name,
          productNames: selectedNames, createdByName: currentUser.name,
          createdByRole: currentUser.role, branchId,
          changes: [`Discount created: ${newDiscount.name}`, `Type: ${newDiscount.type}`]
        });
      } else {
        const idx = discounts.findIndex(d => d.id === discountForm.id);
        if (idx !== -1) {
          const old = discounts[idx];
          discounts[idx] = {
            ...old,
            ...formattedData,
            calculatedTotalDiscount: calculateTotalDiscount(formattedData, allProducts),
            updatedAt: now
          };
          saveData(DISCOUNTS_KEY, discounts);

          addDiscountLog({
            actionType: 'EDIT', discountId: discountForm.id, discountName: discounts[idx].name,
            productNames: selectedNames, createdByName: currentUser.name,
            createdByRole: currentUser.role, branchId,
            changes: [`Discount updated: ${discounts[idx].name}`]
          });
        }
      }

      setSuccess(true);
      setShowDiscountModal(false);
      loadDiscounts(1, pagination.size, activeTab, searchQuery);
      loadLogs(1, logPagination.size, logFilter, dateFilter);
      setTimeout(() => setSuccess(false), 3000);
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

  const retryConnection = () => {
    setNetworkError(null);
    setError(null);
    if (activeTab === 'history') loadLogs(logPagination.page, logPagination.size, logFilter, dateFilter);
    else loadDiscounts(pagination.page, pagination.size, activeTab, searchQuery);
  };

  // ============================================================
  // ✅ EXPORT (CSV)
  // ============================================================
  const handleExport = async (exportType) => {
    const branchId = currentUser.branch_id || 1;
    setExportLoading(true);
    try {
      await delay(300);
      let rows = [];
      let filename = `discounts_data_${new Date().toISOString().slice(0, 10)}.csv`;

      if (exportType === 'discounts' || exportType === 'both') {
        const all = getData(DISCOUNTS_KEY, []).filter(d => !d.branchId || d.branchId === branchId);
        rows.push('=== DISCOUNTS ===');
        rows.push(['Name', 'Code', 'Type', 'Value', 'Start', 'End', 'Status', 'Usage', 'Products'].join(','));
        all.forEach(d => {
          rows.push([`"${d.name}"`, d.code, d.type, d.discountValue || d.discountAmount || 0, d.startDate, d.endDate, d.status, d.usageCount || 0, d.productCount || 0].join(','));
        });
        rows.push('');
      }

      if (exportType === 'logs' || exportType === 'both') {
        const all = getData(LOGS_KEY, []).filter(l => !l.branchId || l.branchId === branchId);
        if (exportType === 'both') rows.push('=== LOGS ===');
        rows.push(['Action', 'Discount', 'User', 'Date', 'Details'].join(','));
        all.forEach(l => {
          rows.push([l.actionType, `"${l.discountName}"`, `"${l.createdByName}"`, formatDate(l.createdAt), `"${(l.changes || []).join('; ')}"`].join(','));
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
  // ✅ DERIVED DATA
  // ============================================================
  const groupedLogs = useMemo(() => groupLogsByDate(filteredLogs, lang), [filteredLogs, lang]);

  const categories = useMemo(() => {
    const m = new Map();
    allProducts.forEach(p => {
      if (p.categoryId && p.categoryName && !m.has(p.categoryId)) m.set(p.categoryId, p.categoryName);
    });
    return Array.from(m.entries()).map(([id, name]) => ({ id, name }));
  }, [allProducts]);

  // ============================================================
  // ✅ JSX (SAME AS ORIGINAL)
  // ============================================================
  return (
    <div className="disc-container">
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
            <button onClick={retryConnection}><i className="fas fa-sync-alt"></i> {lang === 'mm' ? 'ထပ်ကြိုးစားရန်' : 'Retry'}</button>
          </div>
        )}
        {showConflictAlert && conflicts.length > 0 && (
          <div className="disc-conflict-alert">
            <i className="fas fa-exclamation-triangle"></i>
            <div className="disc-conflict-content">
              <div className="disc-conflict-title">{lang === 'mm' ? 'သတိပေးချက် - Discount Overlap' : 'Warning - Discount Overlap'}</div>
              <div className="disc-conflict-message">
                {lang === 'mm' ? 'အောက်ပါပစ္စည်းများတွင် အခြား Active Discount များရှိနေပါသည်။' : 'The following products have other active discounts.'}
              </div>
              <ul className="disc-conflict-list">
                {conflicts.map((c, i) => (
                  <li key={i}><i className="fas fa-circle"></i><strong>{c.productName}</strong> {lang === 'mm' ? ' တွင် ' : ' has '}{c.discounts.join(', ')}</li>
                ))}
              </ul>
            </div>
            <button className="disc-conflict-close" onClick={() => setShowConflictAlert(false)}><i className="fas fa-times"></i></button>
          </div>
        )}
      </div>

      {/* Tabs Header */}
      <div className="disc-tabs-header">
        <div className="disc-tabs-selector">
          <div className="disc-select-container">
            <i className={`fas ${
              activeTab === 'all-discounts' ? 'fa-tags' :
              activeTab === 'active' ? 'fa-check-circle' :
              activeTab === 'inactive' ? 'fa-times-circle' :
              activeTab === 'expired' ? 'fa-calendar-times' :
              'fa-history'
            } disc-select-icon`}></i>
            <select className="disc-tab-select" value={activeTab} onChange={handleTabChange} disabled={loading || tableLoading}>
              <option value="all-discounts">{lang === 'mm' ? 'လျှော့ဈေး အားလုံး' : 'All Discounts'} ({statusCounts.all?.toLocaleString() || 0})</option>
              <option value="active">{lang === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'} ({statusCounts.active?.toLocaleString() || 0})</option>
              <option value="inactive">{lang === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'} ({statusCounts.inactive?.toLocaleString() || 0})</option>
              <option value="expired">{lang === 'mm' ? 'ကာလပြီး' : 'Expired'} ({statusCounts.expired?.toLocaleString() || 0})</option>
              <option value="history">{lang === 'mm' ? 'မှတ်တမ်း' : 'History'} ({actionTypeCounts.all?.toLocaleString() || 0})</option>
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>{lang === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}</option>
            </select>
            <i className="fas fa-chevron-down disc-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' && (
          <>
            <div className="disc-search-controls">
              <div className="disc-search-input-group">
                <i className="fas fa-search disc-search-icon"></i>
                <input
                  ref={searchInputRef} type="text" className="disc-search-input"
                  placeholder={lang === 'mm' ? 'အမည်၊ ကုဒ်ဖြင့်ရှာဖွေရန်...' : 'Search by name, code (Press Enter)...'}
                  value={searchInputValue} onChange={(e) => setSearchInputValue(e.target.value)}
                  onKeyDown={handleSearchKeyDown} disabled={tableLoading}
                />
                {searchInputValue && <button className="disc-clear-search-btn" onClick={handleClearSearch} disabled={tableLoading}><i className="fas fa-times"></i></button>}
              </div>
            </div>
            <button className="disc-add-btn" onClick={openAddModal} disabled={tableLoading}>
              <i className="fas fa-plus"></i> {lang === 'mm' ? 'လျှော့ဈေးအသစ် ထည့်ရန်' : 'Add Discount'}
            </button>
          </>
        )}
      </div>

      <div className="subtab-content active">
        {activeTab === 'history' ? (
          <div className="disc-history-section">
            <div className="disc-section-title">
              <div className="disc-title-row">
                <div className="disc-title-left"><i className="fas fa-history"></i><span className="disc-title-text">{lang === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်း' : 'Activity History'}</span></div>
                <div className="disc-title-center">
                  <div className="disc-compact-nav">
                    <button className={`disc-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page - 1, 'prev')} disabled={logPagination.page === 1 || loading}>
                      {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="disc-page-control">
                      <input type="text" className="disc-page-input" value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(historyPageInputValue, 10); if (!isNaN(v) && v >= 1 && v <= logPagination.totalPages && v !== logPagination.page) changeHistoryPage(v, 'jump'); else setHistoryPageInputValue(logPagination.page.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                      <span className="disc-page-total">/ {logPagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`disc-nav-btn ${loading ? 'loading' : ''}`} onClick={() => changeHistoryPage(logPagination.page + 1, 'next')} disabled={logPagination.page === logPagination.totalPages || logPagination.totalPages === 0 || loading}>
                      {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="disc-items-per-page">
                      <select className="disc-per-page-select" value={logPagination.size} onChange={handleLogPageSizeChange} disabled={loading}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="disc-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="disc-title-right">
                  {loading ? (
                    <span className="disc-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="disc-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="disc-showing-count">
                      <span className="disc-count-numbers">{logPagination.total > 0 ? ((logPagination.page - 1) * logPagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="disc-count-numbers">{Math.min(logPagination.page * logPagination.size, logPagination.total)}</span>
                      <span> / </span>
                      <span className="disc-count-numbers">{logPagination.total.toLocaleString()}</span>
                      <span className="disc-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="disc-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                <div className="disc-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button className={`disc-filter-tab ${logFilter === 'all' ? 'active' : ''}`} onClick={() => { setLogFilter('all'); setHistoryPageInputValue('1'); }} disabled={loading}>
                    {lang === 'mm' ? 'အားလုံး' : 'All'} <span className="disc-filter-count">({actionTypeCounts.all?.toLocaleString() || 0})</span>
                  </button>
                  <button className={`disc-filter-tab ${logFilter === 'ADD' ? 'active' : ''}`} onClick={() => { setLogFilter('ADD'); setHistoryPageInputValue('1'); }} disabled={loading}>
                    <i className="fas fa-plus-circle"></i> {lang === 'mm' ? 'ပေါင်းထည့်ခြင်း' : 'Add'} <span className="disc-filter-count">({actionTypeCounts.ADD?.toLocaleString() || 0})</span>
                  </button>
                  <button className={`disc-filter-tab ${logFilter === 'EDIT' ? 'active' : ''}`} onClick={() => { setLogFilter('EDIT'); setHistoryPageInputValue('1'); }} disabled={loading}>
                    <i className="fas fa-edit"></i> {lang === 'mm' ? 'ပြင်ဆင်ခြင်း' : 'Edit'} <span className="disc-filter-count">({actionTypeCounts.EDIT?.toLocaleString() || 0})</span>
                  </button>
                  <button className={`disc-filter-tab ${logFilter === 'DELETE' ? 'active' : ''}`} onClick={() => { setLogFilter('DELETE'); setHistoryPageInputValue('1'); }} disabled={loading}>
                    <i className="fas fa-trash"></i> {lang === 'mm' ? 'ဖျက်ခြင်း' : 'Delete'} <span className="disc-filter-count">({actionTypeCounts.DELETE?.toLocaleString() || 0})</span>
                  </button>
                </div>
                <div className="disc-filter-tabs" style={{ marginLeft: 'auto' }}>
                  {[
                    { v: 'all', mm: 'အချိန်အားလုံး', en: 'All Time' },
                    { v: 'today', mm: 'ယနေ့', en: 'Today' },
                    { v: 'yesterday', mm: 'မနေ့က', en: 'Yesterday' },
                    { v: 'thisWeek', mm: 'ဒီအပတ်', en: 'This Week' },
                    { v: 'thisMonth', mm: 'ဒီလ', en: 'This Month' },
                    { v: 'custom', mm: 'စိတ်ကြိုက်', en: 'Custom' }
                  ].map(o => (
                    <button key={o.v} className={`disc-filter-tab ${dateFilter.filter === o.v ? 'active' : ''}`} onClick={() => handleDateFilterChange(o.v)} disabled={loading}>
                      {o.v === 'custom' && <i className="fas fa-calendar"></i>} {lang === 'mm' ? o.mm : o.en}
                    </button>
                  ))}
                  {dateFilter.filter !== 'all' && (
                    <button className="disc-filter-tab" onClick={clearDateFilter} style={{ backgroundColor: '#fef2f7', color: '#f72585' }} disabled={loading}>
                      <i className="fas fa-times"></i> {lang === 'mm' ? 'ရှင်းလင်းရန်' : 'Clear'}
                    </button>
                  )}
                </div>
              </div>
              {showDatePicker && (
                <div className="disc-custom-date-picker">
                  <div className="disc-date-picker-row"><label>{lang === 'mm' ? 'မှ' : 'From:'}</label><input type="date" className="disc-date-input" value={dateFilter.customFrom} onChange={(e) => handleCustomDateChange('customFrom', e.target.value)} /></div>
                  <div className="disc-date-picker-row"><label>{lang === 'mm' ? 'ထိ' : 'To:'}</label><input type="date" className="disc-date-input" value={dateFilter.customTo} onChange={(e) => handleCustomDateChange('customTo', e.target.value)} /></div>
                  <button className="disc-apply-date-btn" onClick={() => { if (dateFilter.customFrom && dateFilter.customTo) setHistoryPageInputValue('1'); }} disabled={!dateFilter.customFrom || !dateFilter.customTo}>
                    <i className="fas fa-check"></i> {lang === 'mm' ? 'အတည်ပြုရန်' : 'Apply'}
                  </button>
                </div>
              )}
            </div>

            <div className="disc-compact-logs-container" ref={historyContainerRef}>
              {loading ? (
                <div className="loading-state"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'လုပ်ဆောင်ချက်များ ဖွင့်နေသည်...' : 'Loading...'}</p></div>
              ) : Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="disc-date-group">
                    <div className="disc-date-header">
                      <span className="disc-date-label">{date}</span>
                      <span className="disc-date-count">{dateLogs.length} {lang === 'mm' ? 'ခု' : dateLogs.length > 1 ? 'activities' : 'activity'}</span>
                    </div>
                    <div className="disc-logs-list">
                      {dateLogs.map(log => (
                        <div key={log.id} className={`disc-compact-log-entry log-${log.actionType?.toLowerCase()}`} onClick={() => showLogDetailModal(log)} style={{ cursor: 'pointer' }}>
                          <div className="disc-log-icon" style={{ color: getActionColor(log.actionType) }}><i className={`fas ${getActionIcon(log.actionType)}`}></i></div>
                          <div className="disc-log-content">
                            <div className="disc-log-main-info">
                              <span className="disc-log-action">
                                {log.actionType === 'ADD' && (lang === 'mm' ? 'လျှော့ဈေးအသစ်ထည့်ခြင်း' : 'Discount Added')}
                                {log.actionType === 'EDIT' && (lang === 'mm' ? 'လျှော့ဈေးပြင်ဆင်ခြင်း' : 'Discount Updated')}
                                {log.actionType === 'DELETE' && (lang === 'mm' ? 'လျှော့ဈေးဖျက်ခြင်း' : 'Discount Deleted')}
                              </span>
                              <span className="disc-log-discount">"{log.discountName}"{log.discountId && <span className="disc-discount-id">#{log.discountId}</span>}</span>
                            </div>
                            {log.productNames && log.productNames.length > 0 && (
                              <div className="disc-log-products">
                                <i className="fas fa-boxes"></i>
                                {log.productNames.map((p, i) => <span key={i} className="disc-product-tag">{p}</span>)}
                              </div>
                            )}
                            <div className="disc-log-details">
                              <span className="disc-log-user"><i className="fas fa-user"></i> <strong>{log.createdByName || 'Unknown'}</strong> <span className="disc-user-role">({log.createdByRole || 'N/A'})</span></span>
                              <span className="disc-log-time"><i className="fas fa-clock"></i> {log.timestamp}</span>
                              {log.changes && log.changes.length > 0 && <span className="disc-log-detail-count"><i className="fas fa-list"></i> {log.changes.length} {lang === 'mm' ? 'ခု' : 'changes'}</span>}
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
                  {dateFilter.filter !== 'all' && <button className="disc-clear-search-btn secondary" onClick={clearDateFilter}>{lang === 'mm' ? 'စစ်ထုတ်မှုများ ရှင်းလင်းရန်' : 'Clear Filters'}</button>}
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="disc-section-title">
              <div className="disc-title-row">
                <div className="disc-title-left">
                  <i className="fas fa-tags"></i>
                  <span className="disc-title-text">
                    {activeTab === 'all-discounts' && (lang === 'mm' ? 'လျှော့ဈေးအားလုံး' : 'All Discounts')}
                    {activeTab === 'active' && (lang === 'mm' ? 'အသုံးပြုနိုင်သောလျှော့ဈေးများ' : 'Active Discounts')}
                    {activeTab === 'inactive' && (lang === 'mm' ? 'အသုံးမပြုနိုင်သောလျှော့ဈေးများ' : 'Inactive Discounts')}
                    {activeTab === 'expired' && (lang === 'mm' ? 'ကာလပြီးလျှော့ဈေးများ' : 'Expired Discounts')}
                  </span>
                </div>
                <div className="disc-title-center">
                  <div className="disc-compact-nav">
                    <button className={`disc-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page - 1, 'prev')} disabled={pagination.page === 1 || tableLoading}>
                      {tableLoading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                    </button>
                    <div className="disc-page-control">
                      <input type="text" className="disc-page-input" value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => { const v = parseInt(pageInputValue, 10); if (!isNaN(v) && v >= 1 && v <= pagination.totalPages && v !== pagination.page) changePage(v, 'jump'); else setPageInputValue(pagination.page.toString()); }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={tableLoading} />
                      <span className="disc-page-total">/ {pagination.totalPages.toLocaleString()}</span>
                    </div>
                    <button className={`disc-nav-btn ${tableLoading ? 'loading' : ''}`} onClick={() => changePage(pagination.page + 1, 'next')} disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || tableLoading}>
                      {tableLoading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                    </button>
                    <div className="disc-items-per-page">
                      <select className="disc-per-page-select" value={pagination.size} onChange={handlePageSizeChange} disabled={tableLoading}>
                        <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                      </select>
                      <span className="disc-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                    </div>
                  </div>
                </div>
                <div className="disc-title-right">
                  {tableLoading ? (
                    <span className="disc-loading-text"><i className="fas fa-spinner fa-spin"></i> <span className="disc-loading-label">{lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span></span>
                  ) : (
                    <span className="disc-showing-count">
                      <span className="disc-count-numbers">{pagination.total > 0 ? ((pagination.page - 1) * pagination.size) + 1 : 0}</span>
                      <span> - </span>
                      <span className="disc-count-numbers">{Math.min(pagination.page * pagination.size, pagination.total)}</span>
                      <span> / </span>
                      <span className="disc-count-numbers">{pagination.total.toLocaleString()}</span>
                      <span className="disc-count-label">{lang === 'mm' ? 'ခု' : 'items'}</span>
                    </span>
                  )}
                </div>
              </div>
              {searchQuery && (
                <div className="disc-search-badge-container">
                  <span className="disc-search-badge"><i className="fas fa-search"></i> "{searchQuery}"</span>
                </div>
              )}
            </div>

            <div className="disc-table-wrapper" ref={tableBodyRef}>
              <table className="disc-table">
                <thead>
                  <tr>
                    <th>{lang === 'mm' ? 'နံပါတ်' : 'No'}</th>
                    <th>{lang === 'mm' ? 'အမည်' : 'Name'}</th>
                    <th>{lang === 'mm' ? 'ကုဒ်' : 'Code'}</th>
                    <th>{lang === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                    <th>{lang === 'mm' ? 'လျှော့ဈေး' : 'Value'}</th>
                    <th>{lang === 'mm' ? 'အကျုံးဝင်မှု' : 'Applies To'}</th>
                    <th style={{ minWidth: "90px" }}>{lang === 'mm' ? 'ပစ္စည်း' : 'Products'}</th>
                    <th style={{ minWidth: "120px" }}>{lang === 'mm' ? 'သက်တမ်း' : 'Validity'}</th>
                    <th>{lang === 'mm' ? 'အသုံးပြုမှု' : 'Usage'}</th>
                    <th>{lang === 'mm' ? 'လျှော့ငွေ ပမာဏ' : 'Total Amount'}</th>
                    <th style={{ minWidth: "110px" }}>{lang === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{lang === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {tableLoading ? (
                    <tr><td colSpan="12" className="disc-no-data"><div className="disc-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading...'}</p></div></td></tr>
                  ) : filteredDiscounts.length > 0 ? (
                    filteredDiscounts.map((discount, index) => {
                      const expired = isExpired(discount.endDate) || discount.status === 'Expired';
                      const daysRemaining = getDaysRemaining(discount.startDate, discount.endDate);
                      const totalDiscount = calculateTotalDiscount(discount, allProducts);
                      const hasConflict = discount.selectedProductIds && discount.selectedProductIds.some(pid => discountConflicts.get(pid)?.length > 1);

                      return (
                        <tr key={discount.id} className={`${discount.status === 'Inactive' || expired ? 'disc-row-inactive' : ''} ${hasConflict ? 'disc-row-conflict' : ''}`}>
                          <td>{((pagination.page - 1) * pagination.size) + index + 1}</td>
                          <td>
                            <div>
                              <strong>{discount.name}</strong>
                              {hasConflict && (
                                <span className="disc-conflict-warning disc-conflict-tooltip"
                                  data-tooltip={lang === 'mm' ? 'ဤပစ္စည်းများတွင် အခြား Discount များရှိနေပါသည်' : 'These products have other active discounts'}>
                                  <i className="fas fa-exclamation-triangle"></i>
                                </span>
                              )}
                            </div>
                            {discount.notes && (
                              <span className="dis-notes" title={discount.notes}>
                                <i className="fas fa-sticky-note"></i> {discount.notes.length > 30 ? discount.notes.substring(0, 30) + '...' : discount.notes}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="disc-code-cell">
                              <span className="disc-code-value">{discount.code}</span>
                              <button className="disc-copy-code-btn-small" onClick={() => { navigator.clipboard.writeText(discount.code); alert(lang === 'mm' ? `"${discount.code}" ကုဒ်ကို ကူးယူပြီးပါပြီ။` : `Code "${discount.code}" copied!`); }} title={lang === 'mm' ? 'ကုဒ်ကို ကူးယူမည်' : 'Copy code'}>
                                <i className="fas fa-copy"></i>
                              </button>
                            </div>
                          </td>
                          <td>
                            <span className="disc-type-badge-small" style={{ backgroundColor: getTypeColor(discount.type) }}>
                              <i className={`fas ${getTypeIcon(discount.type)}`}></i>
                              {getTypeLabel(discount.type, lang)}
                            </span>
                          </td>
                          <td>{calculateDiscountValue(discount, lang)}</td>
                          <td>
                            {discount.applicableTo === 'all' && (lang === 'mm' ? 'ပစ္စည်းအားလုံး' : 'All Products')}
                            {discount.applicableTo === 'selected' && <span>{lang === 'mm' ? 'ရွေးချယ်ထားသော' : 'Selected'}</span>}
                          </td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                              <button className="disc-product-view-btn" onClick={(e) => { e.stopPropagation(); handleViewProducts(discount); }} title={lang === 'mm' ? 'ပစ္စည်းများကြည့်ရန်' : 'View products'}>
                                <i className="fas fa-box"></i><span>{discount.productCount || 0}</span>
                              </button>
                            </div>
                          </td>
                          <td>
                            <div className="disc-date-cell">
                              <div>{formatDate(discount.startDate)}</div>
                              <div className="disc-date-to">{lang === 'mm' ? 'မှ' : 'to'}</div>
                              <div>{formatDate(discount.endDate)}</div>
                              {!expired && daysRemaining > 0 && (
                                <div className="disc-days-remaining-small"><i className="fas fa-clock"></i> {daysRemaining}{lang === 'mm' ? 'ရက်ကျန်' : 'd left'}</div>
                              )}
                              {expired && (
                                <div className="disc-expired-small"><i className="fas fa-calendar-times"></i> {lang === 'mm' ? 'ကာလပြီး' : 'Expired'}</div>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="disc-usage-cell">
                              <div className="disc-usage-max">{discount.usageCount || 0} / <span style={{ fontWeight: "bold" }}>{discount.maxUsage || '∞'}</span></div>
                            </div>
                          </td>
                          <td>
                            <div className="disc-total-given">
                              <span className="disc-total-amount">{(discount.calculatedTotalDiscount !== undefined ? discount.calculatedTotalDiscount : totalDiscount).toLocaleString()} Ks</span>
                              {discount.selectedProductIds?.length > 0 && (
                                <span className="disc-total-products"><i className="fas fa-box"></i> {discount.selectedProductIds.length} {lang === 'mm' ? 'ပစ္စည်း' : 'products'}</span>
                              )}
                            </div>
                          </td>
                          <td>
                            {expired ? (
                              <span className="disc-status-badge-small disc-status-expired"><i className="fas fa-calendar-times"></i> {getStatusLabel('Expired', lang)}</span>
                            ) : (
                              <span className={`disc-status-badge-small ${discount.status === 'Active' ? 'disc-status-active' : 'disc-status-inactive'}`}>
                                {getStatusLabel(discount.status, lang)}
                              </span>
                            )}
                          </td>
                          <td>
                            <div className="disc-action-buttons">
                              <button className="disc-action-btn disc-action-edit" title={lang === 'mm' ? 'ပြင်ဆင်ရန်' : 'Edit'} onClick={(e) => { e.stopPropagation(); handleAction('edit', discount.id); }} disabled={loading}><i className="fas fa-edit"></i></button>
                              <button className="disc-action-btn disc-action-delete" title={lang === 'mm' ? 'ဖျက်ရန်' : 'Delete'} onClick={(e) => { e.stopPropagation(); handleAction('delete', discount.id); }} disabled={loading}><i className="fas fa-trash"></i></button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr><td colSpan="12" className="disc-no-data"><div className="disc-no-data-content"><i className="fas fa-tag"></i><p>{searchQuery ? (lang === 'mm' ? `"${searchQuery}" အတွက် လျှော့ဈေးများ မတွေ့ပါ` : `No discounts found for "${searchQuery}"`) : (lang === 'mm' ? 'လျှော့ဈေးများ မတွေ့ပါ' : 'No discounts found')}</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Modals */}
      <DiscountModal
        show={showDiscountModal}
        onClose={() => setShowDiscountModal(false)}
        modalType={modalType}
        discountForm={discountForm}
        onFormChange={handleFormChange}
        onTypeChange={handleTypeChange}
        onStatusChange={handleStatusChange}
        onApplicableToChange={handleApplicableToChange}
        onSave={handleSaveDiscount}
        loading={loading}
        validationError={validationError}
        formErrors={formErrors}
        currentUser={currentUser}
        language={lang}
        categories={categories}
        isFormValid={isFormValid}
        formatCurrency={formatCurrency}
        calculateDiscountValue={calculateDiscountValue}
        openProductSelector={openProductSelector}
        generateDiscountCode={generateDiscountCode}
        formatDate={formatDate}
      />

      {showProductSelector && (
        <ProductSelectorModal
          show={showProductSelector}
          onClose={() => setShowProductSelector(false)}
          products={selectorProducts}
          selectedIds={tempSelectedProducts}
          onSave={saveProductSelection}
          language={lang}
          loading={productsLoading}
          searchQuery={productSearchQuery}
          onSearchChange={setProductSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={(catId) => { setSelectedCategory(catId); setProductPage(1); }}
          categories={categories}
          page={productPage}
          onPageChange={setProductPage}
          pageSize={productPageSize}
          onPageSizeChange={setProductPageSize}
          totalPages={productTotalPages}
          totalItems={productTotalItems}
        />
      )}

      {showProductViewModal && (
        <ProductViewModal
          show={showProductViewModal}
          onClose={() => setShowProductViewModal(false)}
          productIds={viewProductIds}
          language={lang}
          branchId={currentUser?.branch_id}
        />
      )}

      <DiscountExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
        language={lang}
      />

      {/* Log Details Modal */}
      {showLogDetails && selectedLog && (
        <div className="disc-modal-overlay">
          <div className="disc-modal-content" style={{ maxWidth: '600px' }}>
            <div className="disc-modal-header">
              <h3><i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i> {lang === 'mm' ? 'လုပ်ဆောင်ချက်အသေးစိတ်' : 'Activity Details'}</h3>
              <button className="disc-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="disc-modal-body">
              <div className="disc-log-detail-header">
                <div className="disc-log-detail-main">
                  <div className="disc-log-detail-action">
                    <span className={`disc-action-badge disc-action-${selectedLog.actionType?.toLowerCase()}`}>
                      <i className={`fas ${getActionIcon(selectedLog.actionType)}`}></i>
                      {selectedLog.actionType === 'ADD' && (lang === 'mm' ? 'လျှော့ဈေးအသစ်ထည့်ခြင်း' : 'Discount Added')}
                      {selectedLog.actionType === 'EDIT' && (lang === 'mm' ? 'လျှော့ဈေးပြင်ဆင်ခြင်း' : 'Discount Updated')}
                      {selectedLog.actionType === 'DELETE' && (lang === 'mm' ? 'လျှော့ဈေးဖျက်ခြင်း' : 'Discount Deleted')}
                    </span>
                  </div>
                  {selectedLog.discountName && (
                    <div className="disc-log-detail-discount">
                      <i className="fas fa-tag"></i>
                      <span className="disc-discount-name">"{selectedLog.discountName}"</span>
                      {selectedLog.discountId && <span className="disc-discount-id-detail">ID: #{selectedLog.discountId}</span>}
                    </div>
                  )}
                </div>
                {selectedLog.productNames && selectedLog.productNames.length > 0 && (
                  <div className="disc-log-product-list">
                    {selectedLog.productNames.map((p, i) => (
                      <span key={i} className="disc-log-product-tag"><i className="fas fa-box"></i> {p}</span>
                    ))}
                  </div>
                )}
                <div className="disc-log-detail-meta">
                  <div className="disc-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="disc-user-name-detail"><strong>{selectedLog.createdByName || 'Unknown'}</strong></div>
                      <div className="disc-user-role-detail">{selectedLog.createdByRole || 'N/A'}</div>
                    </div>
                  </div>
                  <div className="disc-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="disc-log-date-detail">{selectedLog.date}</div>
                      <div className="disc-log-time-detail">{selectedLog.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="disc-log-detail-content">
                <h4>{lang === 'mm' ? 'အပြောင်းအလဲအသေးစိတ်:' : 'Change Details:'}</h4>
                {selectedLog.changes && selectedLog.changes.length > 0 ? (
                  <div className="disc-change-list">
                    {selectedLog.changes.map((d, i) => (
                      <div key={i} className="disc-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{d}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="disc-no-changes"><i className="fas fa-info-circle"></i><span>{lang === 'mm' ? 'အပြောင်းအလဲမှတ်တမ်း မရှိပါ' : 'No changes recorded'}</span></div>
                )}
              </div>
            </div>
            <div className="disc-modal-footer">
              <button className="disc-btn-cancel" onClick={() => setShowLogDetails(false)}>{lang === 'mm' ? 'ပိတ်ရန်' : 'Close'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDiscountPage;