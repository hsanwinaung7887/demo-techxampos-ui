// src/components/user/UserAdminDashboard.jsx
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout as logoutAction } from "../../redux/slices/authSlice";
import UserAccountUPEPage from './UserAccountUPEPage';
import StoreDetailModal from './StoreDetailModal';
import "../../light-style/user-css/userAdminDashboardPage.css";

// ============================================================
// ✅ DEMO JSON DATA
// ============================================================
const DEMO_OVERVIEW = {
  totalSales: 48500000,
  totalProfit: 12300000,
  totalDamageLoss: 850000,
  totalGeneralExpenses: 3200000,
};

const DEMO_BRANCH_SUMMARIES = [
  {
    branchId: 1,
    branchCode: "BR-001",
    branchName: "Main Branch",
    address: "No.123, Yangon Main Road, Yangon",
    periodSales: 22000000,
    periodProfit: 5800000,
    periodDamagedLoss: 350000,
    totalInvoices: 245,
    growthPercentage: "+12.5%",
    bestProduct: { productName: "Premium Rice 25kg", quantitySold: 85, salesAmount: 4250000 },
    worstProduct: { productName: "Instant Noodle", quantitySold: 5, salesAmount: 75000 },
  },
  {
    branchId: 2,
    branchCode: "BR-002",
    branchName: "Mandalay Branch",
    address: "No.45, Mandalay Center, Mandalay",
    periodSales: 15500000,
    periodProfit: 4200000,
    periodDamagedLoss: 280000,
    totalInvoices: 178,
    growthPercentage: "+8.3%",
    bestProduct: { productName: "Cooking Oil 5L", quantitySold: 62, salesAmount: 3100000 },
    worstProduct: { productName: "Candy Pack", quantitySold: 8, salesAmount: 40000 },
  },
  {
    branchId: 3,
    branchCode: "BR-003",
    branchName: "Naypyidaw Branch",
    address: "No.78, Naypyidaw Main Street, Naypyidaw",
    periodSales: 11000000,
    periodProfit: 2300000,
    periodDamagedLoss: 220000,
    totalInvoices: 124,
    growthPercentage: "-2.1%",
    bestProduct: { productName: "Sugar 1kg", quantitySold: 45, salesAmount: 1350000 },
    worstProduct: { productName: "Salt Pack", quantitySold: 10, salesAmount: 25000 },
  },
];

const DEMO_BRANCH_DETAIL = {
  branchId: 1,
  branchName: "Main Branch",
  location: "No.123, Yangon Main Road, Yangon",
  periodLabel: "This Month (Sep 2026)",
  manager: { name: "U Aung Aung", phone: "09-123456789" },
  status: "Profitable",
  // Sales
  totalGrossSales: 23500000,
  totalRefunds: 500000,
  periodSales: 23000000,
  growthPercentage: "+12.5%",
  // Costs
  totalCOGS: 14500000,
  totalReturnCOGS: 320000,
  periodLoss: 350000,
  periodDiscount: 450000,
  allSaleDiscount: 480000,
  totalReturnDiscount: 30000,
  freeGift: { quantity: 120, amount: 850000 },
  freeReturnItemsQuantity: 8,
  freeReturnItemsValue: 55000,
  generalExpenses: 1200000,
  // Profit
  periodProfit: 5800000,
  // Tax
  totalTax: 250000,
  totalReturnTax: 8000,
  // Credit
  periodCreditOutstanding: 1850000,
  // Invoices
  totalInvoices: 245,
  // Payment
  paymentMethodAmounts: {
    "Cash": 12000000,
    "KBZ Pay": 5500000,
    "Wave Money": 3200000,
    "AYA Pay": 1800000,
    "Credit": 1000000,
  },
  // Discount
  discountAmounts: {
    "Member Discount": 250000,
    "Seasonal Discount": 150000,
    "Bulk Discount": 80000,
  },
  // Products
  topProducts: [
    { productId: 1, productName: "Premium Rice 25kg", quantitySold: 85, salesAmount: 4250000 },
    { productId: 2, productName: "Cooking Oil 5L", quantitySold: 62, salesAmount: 3100000 },
    { productId: 3, productName: "Sugar 1kg", quantitySold: 145, salesAmount: 1450000 },
    { productId: 4, productName: "Washing Powder 3kg", quantitySold: 38, salesAmount: 1520000 },
    { productId: 5, productName: "Milk Powder 1kg", quantitySold: 42, salesAmount: 1260000 },
    { productId: 6, productName: "Coffee Mix 30pcs", quantitySold: 55, salesAmount: 825000 },
    { productId: 7, productName: "Shampoo 500ml", quantitySold: 33, salesAmount: 660000 },
    { productId: 8, productName: "Toothpaste 200g", quantitySold: 28, salesAmount: 420000 },
    { productId: 9, productName: "Soap Bar 100g", quantitySold: 78, salesAmount: 390000 },
    { productId: 10, productName: "Detergent Liquid 1L", quantitySold: 25, salesAmount: 375000 },
  ],
  worstProducts: [
    { productId: 11, productName: "Instant Noodle", quantitySold: 5, salesAmount: 75000 },
    { productId: 12, productName: "Candy Pack", quantitySold: 8, salesAmount: 40000 },
    { productId: 13, productName: "Salt Pack", quantitySold: 10, salesAmount: 25000 },
    { productId: 14, productName: "Biscuit Small", quantitySold: 12, salesAmount: 36000 },
    { productId: 15, productName: "Juice Box", quantitySold: 15, salesAmount: 60000 },
  ],
  topEmployees: [
    { employeeId: 1, employeeName: "Daw Su Su", salesAmount: 5500000 },
    { employeeId: 2, employeeName: "U Kyaw Kyaw", salesAmount: 4800000 },
    { employeeId: 3, employeeName: "Daw Mya Mya", salesAmount: 4200000 },
    { employeeId: 4, employeeName: "U Hla Hla", salesAmount: 3800000 },
    { employeeId: 5, employeeName: "Daw Nwe Nwe", salesAmount: 3200000 },
    { employeeId: 6, employeeName: "U Zaw Zaw", salesAmount: 2800000 },
    { employeeId: 7, employeeName: "Daw Thiri", salesAmount: 2500000 },
    { employeeId: 8, employeeName: "U Min Min", salesAmount: 2200000 },
    { employeeId: 9, employeeName: "Daw Yee Yee", salesAmount: 2000000 },
    { employeeId: 10, employeeName: "U Tun Tun", salesAmount: 1800000 },
  ],
  // Expense details
  expenseDetails: [
    { id: 1, category: "Rent", subCategory: "Shop Rent", title: "Monthly Shop Rent", vendor: "U Ba", amount: 500000, date: "2026-09-01", status: "Paid", description: "September shop rent" },
    { id: 2, category: "Utilities", subCategory: "Electricity", title: "Electricity Bill", vendor: "YESC", amount: 350000, date: "2026-09-05", status: "Paid", description: "September electricity" },
    { id: 3, category: "Utilities", subCategory: "Water", title: "Water Bill", vendor: "City Water", amount: 120000, date: "2026-09-05", status: "Paid", description: "September water" },
    { id: 4, category: "Salary", subCategory: "Staff Salary", title: "Staff Salaries", vendor: "Various", amount: 800000, date: "2026-09-30", status: "Paid", description: "September salaries" },
    { id: 5, category: "Transport", subCategory: "Delivery", title: "Delivery Cost", vendor: "Delivery Service", amount: 150000, date: "2026-09-15", status: "Paid", description: "Product delivery" },
    { id: 6, category: "Marketing", subCategory: "Ads", title: "Facebook Ads", vendor: "Facebook", amount: 80000, date: "2026-09-20", status: "Pending", description: "Monthly ads" },
  ],
};

const DEMO_USER = {
  id: 1,
  username: 'demo_owner',
  fullName: 'Demo Owner',
  role: 'SHOP_OWNER',
  userType: 'shop',
  branchId: 1,
  shopId: 1,
};

// ===== Custom Hooks =====
const useLanguage = () => {
  const [lang, setLang] = React.useState(localStorage.getItem('appLanguage') || 'mm');

  React.useEffect(() => {
    const handler = (e) => setLang(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);

  return lang;
};

// ===== Helper Functions =====
const formatMoney = (amount) => {
  if (amount === null || amount === undefined) return '0 Ks';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0 Ks';
  return num.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' Ks';
};

const getCurrentDate = (language) => {
  const now = new Date();
  if (language === 'mm') {
    return now.toLocaleDateString('my-MM', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
  } else {
    return now.toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
    });
  }
};

const getDisplayStatus = (branch, language, generalExpenses = 0) => {
  const netProfit = (branch.periodProfit || 0) - (branch.periodDamagedLoss || 0) - generalExpenses;

  if (!branch.periodSales || branch.periodSales === 0) {
    return { text: language === 'mm' ? 'မရှိ' : 'No Sales', color: '#95a5a6' };
  }
  if (netProfit >= 0) {
    return { text: language === 'mm' ? 'အမြတ်ရ' : 'Profitable', color: '#27ae60' };
  }
  return { text: language === 'mm' ? 'အရှုံး' : 'Loss', color: '#e74c3c' };
};

const BranchCardSkeleton = ({ language }) => (
  <div className="dashboard-store-card skeleton">
    <div className="dashboard-store-header">
      <div className="skeleton-text" style={{ width: '60%', height: '20px' }}></div>
      <div className="skeleton-text" style={{ width: '30%', height: '24px', borderRadius: '30px' }}></div>
    </div>
    <div className="skeleton-text" style={{ width: '70%', height: '16px', marginBottom: '15px' }}></div>
    <div className="dashboard-store-metrics skeleton-metrics">
      <div className="skeleton-text" style={{ width: '100%', height: '20px' }}></div>
      <div className="skeleton-text" style={{ width: '100%', height: '20px' }}></div>
      <div className="skeleton-text" style={{ width: '100%', height: '20px' }}></div>
    </div>
    <div className="skeleton-text" style={{ width: '100%', height: '40px', borderRadius: '10px' }}></div>
  </div>
);

// ===== Main Component =====
const UserAdminDashboard = () => {
  const navigate = useNavigate();
  const language = useLanguage();
  const dispatchRedux = useDispatch();

  const { user: reduxUser } = useSelector((state) => state.auth);
  const currentUser = reduxUser || DEMO_USER;

  // ✅ Local state (reducer ဖယ်)
  const [overview, setOverview] = useState(DEMO_OVERVIEW);
  const [branchSummaries, setBranchSummaries] = useState(DEMO_BRANCH_SUMMARIES);
  const [branches] = useState(DEMO_BRANCH_SUMMARIES.map(b => ({
    id: b.branchId,
    branchCode: b.branchCode,
    name: b.branchName,
  })));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedBranchDetail, setSelectedBranchDetail] = useState(null);
  const [showStoreDetails, setShowStoreDetails] = useState(false);

  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const [showAccountPage, setShowAccountPage] = useState(false);

  // ===== Trend period =====
  const [trendPeriod, setTrendPeriod] = useState('month');
  const [isPeriodLoading, setIsPeriodLoading] = useState(false);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);

  // ===== Branch General Expenses =====
  const [branchGeneralExpenses, setBranchGeneralExpenses] = useState({});

  // ===== Store counts =====
  const totalStores = branchSummaries.length;

  const profitableStores = branchSummaries.filter(b => {
    const netProfit = (b.periodProfit || 0) - (b.periodDamagedLoss || 0) - (branchGeneralExpenses[b.branchId] || 0);
    return netProfit > 0 && b.periodSales > 0;
  }).length;

  const lossMakingStores = branchSummaries.filter(b => {
    const netProfit = (b.periodProfit || 0) - (b.periodDamagedLoss || 0) - (branchGeneralExpenses[b.branchId] || 0);
    return netProfit < 0 && b.periodSales > 0;
  }).length;

  const noSalesStores = branchSummaries.filter(b => {
    return !b.periodSales || b.periodSales === 0;
  }).length;

  // ✅ Close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Simulate fetching general expenses
  useEffect(() => {
    if (branchSummaries.length > 0 && Object.keys(branchGeneralExpenses).length === 0) {
      setLoading(true);
      setTimeout(() => {
        const expensesMap = {};
        branchSummaries.forEach(b => {
          expensesMap[b.branchId] = DEMO_BRANCH_DETAIL.generalExpenses || 0;
        });
        setBranchGeneralExpenses(expensesMap);
        setLoading(false);
      }, 300);
    }
  }, [branchSummaries]);

  // Handlers
  const handleLanguageChange = (newLang) => {
    localStorage.setItem("appLanguage", newLang);
    window.dispatchEvent(new CustomEvent('appLanguageChanged', { detail: { language: newLang } }));
  };

  const handleLogout = () => {
    dispatchRedux(logoutAction());
    const deviceFingerprint = localStorage.getItem("device_fingerprint");
    const appLanguage = localStorage.getItem("appLanguage");
    localStorage.clear();
    if (deviceFingerprint) localStorage.setItem("device_fingerprint", deviceFingerprint);
    if (appLanguage) localStorage.setItem("appLanguage", appLanguage);
    window.location.href = "/";
  };

  const handleManageAccount = () => {
    setShowAccountPage(true);
    setShowDropdown(false);
  };

  const handleBackToDashboard = () => {
    setShowAccountPage(false);
  };

  const handleCustomDateApply = () => {
    if (customStartDate && customEndDate) {
      setShowCustomDatePicker(false);
      // Demo: simulate loading
      setIsPeriodLoading(true);
      setTimeout(() => setIsPeriodLoading(false), 500);
    }
  };

  const handleBranchSelect = (e) => {
    const branchCode = e.target.value;
    const selectedBranch = branches.find(b => b.branchCode === branchCode);
    if (selectedBranch) {
      const encodedBranchCode = encodeURIComponent(branchCode);
      navigate(`/branch/account/management/page?branchCode=${encodedBranchCode}&branchId=${selectedBranch.id}`);
    }
  };

  const handleStoreClick = (branch) => {
    // ✅ Demo: branch detail ကို JSON ကနေ ယူ
    setSelectedBranchDetail({
      ...DEMO_BRANCH_DETAIL,
      branchId: branch.branchId,
      branchName: branch.branchName,
      location: branch.address,
    });
    setShowStoreDetails(true);
  };

  const closeModal = () => {
    setSelectedBranchDetail(null);
    setShowStoreDetails(false);
  };

  // ===== Summary values =====
  const totalSales = overview?.totalSales || 0;
  const totalProfit = overview?.totalProfit || 0;
  const totalDamageLoss = overview?.totalDamageLoss || 0;

  const getBranchNetProfit = (branch) => {
    const generalExpenses = branchGeneralExpenses[branch.branchId] || 0;
    return (branch.periodProfit || 0) - (branch.periodDamagedLoss || 0) - generalExpenses;
  };

  // ===== Trend Period Selector =====
  const TrendPeriodSelector = () => (
    <div className="trend-period-container">
      <div className="dashboard-trend-period-selector">
        <button
          className={`trend-period-btn ${trendPeriod === 'week' ? 'active' : ''} ${isPeriodLoading ? 'loading' : ''}`}
          onClick={() => { setTrendPeriod('week'); setShowCustomDatePicker(false); }}
          disabled={isPeriodLoading}
        >
          {isPeriodLoading && trendPeriod === 'week' && <i className="fas fa-spinner fa-spin"></i>}
          {language === 'mm' ? 'ဤအပတ်' : 'This Week'}
        </button>
        <button
          className={`trend-period-btn ${trendPeriod === 'month' ? 'active' : ''} ${isPeriodLoading ? 'loading' : ''}`}
          onClick={() => { setTrendPeriod('month'); setShowCustomDatePicker(false); }}
          disabled={isPeriodLoading}
        >
          {isPeriodLoading && trendPeriod === 'month' && <i className="fas fa-spinner fa-spin"></i>}
          {language === 'mm' ? 'ဤလ' : 'This Month'}
        </button>
        <button
          className={`trend-period-btn ${trendPeriod === 'prevMonth' ? 'active' : ''} ${isPeriodLoading ? 'loading' : ''}`}
          onClick={() => { setTrendPeriod('prevMonth'); setShowCustomDatePicker(false); }}
          disabled={isPeriodLoading}
        >
          {isPeriodLoading && trendPeriod === 'prevMonth' && <i className="fas fa-spinner fa-spin"></i>}
          {language === 'mm' ? 'အရင်လ' : 'Prev Month'}
        </button>
        <button
          className={`trend-period-btn ${trendPeriod === 'year' ? 'active' : ''} ${isPeriodLoading ? 'loading' : ''}`}
          onClick={() => { setTrendPeriod('year'); setShowCustomDatePicker(false); }}
          disabled={isPeriodLoading}
        >
          {isPeriodLoading && trendPeriod === 'year' && <i className="fas fa-spinner fa-spin"></i>}
          {language === 'mm' ? 'ဤနှစ်' : 'This Year'}
        </button>
        <button
          className={`trend-period-btn ${trendPeriod === 'custom' ? 'active' : ''} ${isPeriodLoading ? 'loading' : ''}`}
          onClick={() => { setTrendPeriod('custom'); setShowCustomDatePicker(true); }}
          disabled={isPeriodLoading}
        >
          {isPeriodLoading && trendPeriod === 'custom' && <i className="fas fa-spinner fa-spin"></i>}
          {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
        </button>
      </div>

      {showCustomDatePicker && (
        <div className="custom-date-range">
          <input type="date" className="date-input" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} disabled={isPeriodLoading} />
          <span className="date-separator">{language === 'mm' ? 'မှ' : 'to'}</span>
          <input type="date" className="date-input" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} disabled={isPeriodLoading} />
          <button className="apply-date-btn" onClick={handleCustomDateApply} disabled={!customStartDate || !customEndDate || isPeriodLoading}>
            {isPeriodLoading ? <i className="fas fa-spinner fa-spin"></i> : null}
            {language === 'mm' ? 'ကြည့်ရန်' : 'Apply'}
          </button>
        </div>
      )}
    </div>
  );

  if (!currentUser) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner"></div>
        <p>{language === 'mm' ? 'ဝင်ရောက်နေသည်...' : 'Loading...'}</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Header */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-header-title">
            {language === 'mm' ? 'လုပ်ငန်း အကျဉ်းချုပ်' : 'Business Dashboard'}
          </h1>
          <p className="dashboard-header-subtitle">
            {language === 'mm' ? 'ပိုင်ရှင် - ' : 'Owner - '}
            {currentUser?.fullName || (language === 'mm' ? 'မသိရှိ' : 'Unknown')}
          </p>
        </div>
        <div>
          <div className="dashboard-header-date">{getCurrentDate(language)}</div>
          <div className="dashboard-header-actions" ref={dropdownRef}>
            <button className="dashboard-dropdown-btn" onClick={() => setShowDropdown(!showDropdown)}>
              <i className="fas fa-user-circle"></i>
              {language === 'mm' ? 'မိမိအကောင့် စီမံရန်' : 'Account'}
              <i className={`fas fa-chevron-${showDropdown ? 'up' : 'down'}`}></i>
            </button>
            {showDropdown && (
              <div className="dashboard-dropdown-menu">
                <div className="dashboard-dropdown-item" onClick={() => {
                  const newLang = language === "mm" ? "en" : "mm";
                  handleLanguageChange(newLang);
                  setShowDropdown(false);
                }}>
                  <i className="fas fa-language"></i>
                  {language === "mm" ? "ဘာသာပြောင်းရန် (English)" : "Change Language (မြန်မာ)"}
                </div>
                <div className="dashboard-dropdown-item" onClick={handleManageAccount}>
                  <i className="fas fa-users"></i>
                  {language === "mm" ? "အကောင့်စီမံခန့်ခွဲမှု" : "Manage Account"}
                </div>
                <div className="dashboard-dropdown-item logout" onClick={() => {
                  handleLogout();
                  setShowDropdown(false);
                }}>
                  <i className="fas fa-sign-out-alt"></i>
                  {language === "mm" ? "ထွက်မည်" : "Logout"}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="dashboard-staff-selector">
          <label htmlFor="branchSelect">
            <i className="fas fa-users"></i>
            {language === 'mm' ? 'ဝန်ထမ်းစီမံရန်' : 'Manage Staff'}
          </label>
          <select id="branchSelect" onChange={handleBranchSelect} value="" disabled={branches.length === 0}>
            <option value="">
              {branches.length === 0
                ? (language === 'mm' ? 'ဆိုင်ခွဲမရှိပါ' : 'No branches')
                : (language === 'mm' ? 'ဆိုင်ခွဲရွေးချယ်ပါ' : 'Select branch')}
            </option>
            {branches.map(branch => (
              <option key={branch.id} value={branch.branchCode}>
                {branch.branchCode} - {branch.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showAccountPage ? (
        <>
          <div className="dashboard-back-button-container">
            <button className="shop-account-history-btn backbtn" onClick={handleBackToDashboard}>
              <i className="fas fa-arrow-left"></i>
              {language === 'mm' ? 'နောက်သို့' : 'Back to Dashboard'}
            </button>
          </div>
          <UserAccountUPEPage />
        </>
      ) : (
        <>
          {error && (
            <div className="dashboard-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          {/* Summary Cards */}
          <div className="dashboard-summary-cards">
            <div className="summary-card">
              <div className="card-icon"><i className="fas fa-shopping-cart"></i></div>
              <div className="card-content">
                <div className="card-label">{language === 'mm' ? 'စုစုပေါင်းရောင်းအား' : 'Total Sales'}</div>
                <div className="card-value">{formatMoney(totalSales)}</div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon"><i className="fas fa-chart-line"></i></div>
              <div className="card-content">
                <div className="card-label">{language === 'mm' ? 'ပျက်စီးဆုံးရှုံးမှု' : 'Loss'}</div>
                <div className="card-value loss">{formatMoney(totalDamageLoss)}</div>
              </div>
            </div>

            <div className="summary-card expense-card" style={{ cursor: 'pointer' }}>
              <div className="card-icon" style={{ background: '#fef3c7', color: '#e67e22' }}>
                <i className="fas fa-money-bill-wave"></i>
              </div>
              <div className="card-content">
                <div className="card-label">{language === 'mm' ? 'အထွေထွေကုန်ကျစရိတ်' : 'General Expenses'}</div>
                <div className="card-value" style={{ color: '#e67e22' }}>
                  {formatMoney(overview?.totalGeneralExpenses || 0)}
                </div>
                <div className="card-label" style={{ marginTop: '3px', fontSize: '8px', color: '#94a3b8' }}>
                  {language === 'mm' ? 'ပျက်စီးတန်ဖိုးမပါ' : 'Excluding Damages'}
                </div>
              </div>
            </div>

            <div className="summary-card">
              <div className="card-icon" style={{ background: '#e8f5e9', color: '#2e7d32' }}>
                <i className="fas fa-calculator"></i>
              </div>
              <div className="card-content">
                <div className="card-label">{language === 'mm' ? 'အသားတင်အမြတ်' : 'Net Profit'}</div>
                <div className="card-value" style={{
                  color: (totalProfit - (overview?.totalGeneralExpenses || 0)) >= 0 ? '#27ae60' : '#e74c3c'
                }}>
                  {formatMoney(totalProfit - (overview?.totalGeneralExpenses || 0))}
                </div>
              </div>
            </div>

            <div className="summary-card store-stats-card">
              <div className="card-icon"><i className="fas fa-store"></i></div>
              <div className="card-content">
                <div className="card-label">{language === 'mm' ? 'ဆိုင်အခြေအနေ' : 'Store Status'}</div>
                <div className="store-stats-tiny">
                  <div className="stat-item-tiny profitable">
                    <span className="stat-dot-tiny"></span>
                    <span className="stat-value-tiny">{profitableStores}</span>
                    <span className="stat-label-tiny">{language === 'mm' ? 'အမြတ်' : 'P'}</span>
                  </div>
                  <div className="stat-item-tiny loss">
                    <span className="stat-dot-tiny"></span>
                    <span className="stat-value-tiny">{lossMakingStores}</span>
                    <span className="stat-label-tiny">{language === 'mm' ? 'အရှုံး' : 'L'}</span>
                  </div>
                  <div className="stat-item-tiny no-sales">
                    <span className="stat-dot-tiny"></span>
                    <span className="stat-value-tiny">{noSalesStores}</span>
                    <span className="stat-label-tiny">{language === 'mm' ? 'မရောင်း' : 'N'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Store Cards */}
          <div className="dashboard-stores-section">
            <div className="stores-header-wrapper">
              <h2 className="dashboard-section-title">
                {language === 'mm' ? 'ဆိုင်များ' : 'Stores'} ({branchSummaries?.length || 0})
              </h2>
              <TrendPeriodSelector />
            </div>

            {loading || isPeriodLoading ? (
              <div className="dashboard-stores-grid">
                {[1, 2, 3].map((i) => <BranchCardSkeleton key={i} language={language} />)}
              </div>
            ) : !branchSummaries || branchSummaries.length === 0 ? (
              <div className="dashboard-no-data">
                <i className="fas fa-store-slash"></i>
                <p>{language === 'mm' ? 'ဆိုင်ခွဲမရှိသေးပါ' : 'No branches found'}</p>
              </div>
            ) : (
              <div className="dashboard-stores-grid">
                {branchSummaries.map((branch) => {
                  const branchGeneralExpense = branchGeneralExpenses[branch.branchId] || 0;
                  return (
                    <div
                      key={branch.branchId}
                      className="dashboard-store-card"
                      onClick={() => handleStoreClick(branch)}
                    >
                      <div className="dashboard-store-header">
                        <h3 className="dashboard-store-name">{branch.branchName || branch.branchCode}</h3>
                        <span
                          className="dashboard-store-status"
                          style={{ backgroundColor: getDisplayStatus(branch, language, branchGeneralExpense).color }}
                        >
                          {getDisplayStatus(branch, language, branchGeneralExpense).text}
                        </span>
                      </div>

                      <div className="dashboard-store-location">
                        <i className="fas fa-map-marker-alt"></i>
                        {branch.address || branch.location || (language === 'mm' ? 'နေရာမသိ' : 'Unknown location')}
                      </div>

                      <div className="dashboard-store-metrics">
                        <div className="dashboard-metric-row">
                          <span className="dashboard-metric-label">{language === 'mm' ? 'ရောင်းအား' : 'Sales'}:</span>
                          <span className="dashboard-metric-value">{formatMoney(branch.periodSales || 0)}</span>
                        </div>
                        <div className="dashboard-metric-row">
                          <span className="dashboard-metric-label">{language === 'mm' ? 'ပျက်စီးဆုံးရှုံးမှု' : 'Loss'}:</span>
                          <span className="dashboard-metric-value loss">
                            {formatMoney((branch.periodDamagedLoss || 0))}
                          </span>
                        </div>
                        <div className="dashboard-metric-row">
                          <span className="dashboard-metric-label">{language === 'mm' ? 'အမြတ်' : 'Profit'} <span style={{ fontSize: '9px', color: '#94a3b8', marginLeft: '4px' }}> ({language === 'mm' ? 'ပျက်စီးနှုတ်ပီး' : 'Incl. Damages'})</span> </span>
                          <span className="dashboard-metric-value" style={{
                            color: (branch.periodProfit || 0) >= 0 ? '#27ae60' : '#e74c3c'
                          }}>
                            {formatMoney(branch.periodProfit || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="dashboard-store-products">
                        {branch.bestProduct && (
                          <div className="dashboard-product-info">
                            <span className="dashboard-product-label">{language === 'mm' ? 'အကောင်းဆုံး' : 'Best'}:</span>
                            <span className="dashboard-product-value best">
                              {branch.bestProduct.productName} ({branch.bestProduct.quantitySold})
                            </span>
                          </div>
                        )}
                        {branch.worstProduct && (
                          <div className="dashboard-product-info">
                            <span className="dashboard-product-label">{language === 'mm' ? 'အညံ့ဆုံး' : 'Worst'}:</span>
                            <span className="dashboard-product-value worst">
                              {branch.worstProduct.productName} ({branch.worstProduct.quantitySold})
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="dashboard-store-actions">
                        <button className="dashboard-view-btn">
                          {language === 'mm' ? 'အသေးစိတ်ကြည့်ရန်' : 'View Details'}
                          <i className="fas fa-arrow-right"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {showStoreDetails && selectedBranchDetail && (
            <StoreDetailModal
              branchData={selectedBranchDetail}
              onClose={closeModal}
              language={language}
              formatMoney={formatMoney}
            />
          )}
        </>
      )}
    </div>
  );
};

export default UserAdminDashboard;