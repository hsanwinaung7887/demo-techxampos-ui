// src/components/user/StoreDetailModal.jsx
import React, { useState, useEffect } from 'react';
import { Pie, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import StoreReport from './StoreReport';
import ExpenseDetailModal from './ExpenseDetailModal';
import "../../light-style/user-css/StoreDetailModal.css";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, ChartDataLabels);

// ============================================================
// ✅ PERIOD-BASED DEMO DATA (Profit မှန်ကန်အောင် ပြင်ပြီး)
// ============================================================
const DEMO_PERIOD_DATA = {
  today: {
    periodLabel: "Today (Sep 21, 2026)",
    totalGrossSales: 850000,
    totalRefunds: 15000,
    periodSales: 835000,
    growthPercentage: "+5.2%",
    totalCOGS: 520000,
    totalReturnCOGS: 8000,
    periodLoss: 12000,
    periodDiscount: 18000,
    allSaleDiscount: 20000,
    totalReturnDiscount: 2000,
    freeGift: { quantity: 5, amount: 35000 },
    freeReturnItemsQuantity: 0,
    freeReturnItemsValue: 0,
    generalExpenses: 45000,
    periodProfit: 231000,       // ✅ ပြင်ပြီး (231,000)
    totalTax: 9000,
    totalReturnTax: 300,
    periodCreditOutstanding: 68000,
    totalInvoices: 12,
    paymentMethodAmounts: { "Cash": 450000, "KBZ Pay": 220000, "Wave Money": 130000, "AYA Pay": 50000 },
    discountAmounts: { "Member Discount": 12000, "Seasonal Discount": 6000 },
    topProducts: [
      { productId: 1, productName: "Premium Rice 25kg", quantitySold: 4, salesAmount: 200000 },
      { productId: 2, productName: "Cooking Oil 5L", quantitySold: 3, salesAmount: 150000 },
      { productId: 3, productName: "Sugar 1kg", quantitySold: 8, salesAmount: 80000 },
      { productId: 4, productName: "Milk Powder 1kg", quantitySold: 2, salesAmount: 60000 },
      { productId: 5, productName: "Coffee Mix 30pcs", quantitySold: 3, salesAmount: 45000 },
    ],
    worstProducts: [
      { productId: 11, productName: "Instant Noodle", quantitySold: 1, salesAmount: 15000 },
      { productId: 12, productName: "Candy Pack", quantitySold: 1, salesAmount: 5000 },
    ],
    topEmployees: [
      { employeeId: 1, employeeName: "Daw Su Su", salesAmount: 320000 },
      { employeeId: 2, employeeName: "U Kyaw Kyaw", salesAmount: 280000 },
      { employeeId: 3, employeeName: "Daw Mya Mya", salesAmount: 235000 },
    ],
  },
  week: {
    periodLabel: "This Week (Sep 15 - Sep 21, 2026)",
    totalGrossSales: 5800000,
    totalRefunds: 120000,
    periodSales: 5680000,
    growthPercentage: "+8.7%",
    totalCOGS: 3600000,
    totalReturnCOGS: 75000,
    periodLoss: 85000,
    periodDiscount: 120000,
    allSaleDiscount: 130000,
    totalReturnDiscount: 10000,
    freeGift: { quantity: 35, amount: 250000 },
    freeReturnItemsQuantity: 2,
    freeReturnItemsValue: 15000,
    generalExpenses: 320000,
    periodProfit: 1515000,      // ✅ ပြင်ပြီး (1,515,000)
    totalTax: 62000,
    totalReturnTax: 2000,
    periodCreditOutstanding: 420000,
    totalInvoices: 78,
    paymentMethodAmounts: { "Cash": 2800000, "KBZ Pay": 1400000, "Wave Money": 850000, "AYA Pay": 450000, "Credit": 180000 },
    discountAmounts: { "Member Discount": 65000, "Seasonal Discount": 35000, "Bulk Discount": 20000 },
    topProducts: [
      { productId: 1, productName: "Premium Rice 25kg", quantitySold: 22, salesAmount: 1100000 },
      { productId: 2, productName: "Cooking Oil 5L", quantitySold: 15, salesAmount: 750000 },
      { productId: 3, productName: "Sugar 1kg", quantitySold: 38, salesAmount: 380000 },
      { productId: 4, productName: "Washing Powder 3kg", quantitySold: 10, salesAmount: 400000 },
      { productId: 5, productName: "Milk Powder 1kg", quantitySold: 12, salesAmount: 360000 },
      { productId: 6, productName: "Coffee Mix 30pcs", quantitySold: 15, salesAmount: 225000 },
      { productId: 7, productName: "Shampoo 500ml", quantitySold: 9, salesAmount: 180000 },
      { productId: 8, productName: "Toothpaste 200g", quantitySold: 8, salesAmount: 120000 },
      { productId: 9, productName: "Soap Bar 100g", quantitySold: 20, salesAmount: 100000 },
      { productId: 10, productName: "Detergent Liquid 1L", quantitySold: 7, salesAmount: 105000 },
    ],
    worstProducts: [
      { productId: 11, productName: "Instant Noodle", quantitySold: 2, salesAmount: 30000 },
      { productId: 12, productName: "Candy Pack", quantitySold: 3, salesAmount: 15000 },
      { productId: 13, productName: "Salt Pack", quantitySold: 3, salesAmount: 7500 },
      { productId: 14, productName: "Biscuit Small", quantitySold: 4, salesAmount: 12000 },
      { productId: 15, productName: "Juice Box", quantitySold: 5, salesAmount: 20000 },
    ],
    topEmployees: [
      { employeeId: 1, employeeName: "Daw Su Su", salesAmount: 1500000 },
      { employeeId: 2, employeeName: "U Kyaw Kyaw", salesAmount: 1250000 },
      { employeeId: 3, employeeName: "Daw Mya Mya", salesAmount: 1100000 },
      { employeeId: 4, employeeName: "U Hla Hla", salesAmount: 950000 },
      { employeeId: 5, employeeName: "Daw Nwe Nwe", salesAmount: 880000 },
    ],
  },
  month: {
    periodLabel: "This Month (Sep 2026)",
    totalGrossSales: 23500000,
    totalRefunds: 500000,
    periodSales: 23000000,
    growthPercentage: "+12.5%",
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
    periodProfit: 6475000,      // ✅ ပြင်ပြီး (6,475,000)
    totalTax: 250000,
    totalReturnTax: 8000,
    periodCreditOutstanding: 1850000,
    totalInvoices: 245,
    paymentMethodAmounts: {
      "Cash": 12000000,
      "KBZ Pay": 5500000,
      "Wave Money": 3200000,
      "AYA Pay": 1800000,
      "Credit": 1000000,
    },
    discountAmounts: {
      "Member Discount": 250000,
      "Seasonal Discount": 150000,
      "Bulk Discount": 80000,
    },
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
  },
  year: {
    periodLabel: "This Year (2026)",
    totalGrossSales: 285000000,
    totalRefunds: 6500000,
    periodSales: 278500000,
    growthPercentage: "+18.3%",
    totalCOGS: 178000000,
    totalReturnCOGS: 4200000,
    periodLoss: 4200000,
    periodDiscount: 5500000,
    allSaleDiscount: 5800000,
    totalReturnDiscount: 300000,
    freeGift: { quantity: 1450, amount: 10500000 },
    freeReturnItemsQuantity: 95,
    freeReturnItemsValue: 680000,
    generalExpenses: 14500000,
    periodProfit: 76180000,     // ✅ ပြင်ပြီး (76,180,000)
    totalTax: 3000000,
    totalReturnTax: 95000,
    periodCreditOutstanding: 1850000,
    totalInvoices: 2980,
    paymentMethodAmounts: {
      "Cash": 145000000,
      "KBZ Pay": 68000000,
      "Wave Money": 38000000,
      "AYA Pay": 21000000,
      "Credit": 6500000,
    },
    discountAmounts: {
      "Member Discount": 3000000,
      "Seasonal Discount": 1800000,
      "Bulk Discount": 700000,
    },
    topProducts: [
      { productId: 1, productName: "Premium Rice 25kg", quantitySold: 1020, salesAmount: 51000000 },
      { productId: 2, productName: "Cooking Oil 5L", quantitySold: 745, salesAmount: 37250000 },
      { productId: 3, productName: "Sugar 1kg", quantitySold: 1740, salesAmount: 17400000 },
      { productId: 4, productName: "Washing Powder 3kg", quantitySold: 456, salesAmount: 18240000 },
      { productId: 5, productName: "Milk Powder 1kg", quantitySold: 504, salesAmount: 15120000 },
      { productId: 6, productName: "Coffee Mix 30pcs", quantitySold: 660, salesAmount: 9900000 },
      { productId: 7, productName: "Shampoo 500ml", quantitySold: 396, salesAmount: 7920000 },
      { productId: 8, productName: "Toothpaste 200g", quantitySold: 336, salesAmount: 5040000 },
      { productId: 9, productName: "Soap Bar 100g", quantitySold: 936, salesAmount: 4680000 },
      { productId: 10, productName: "Detergent Liquid 1L", quantitySold: 300, salesAmount: 4500000 },
    ],
    worstProducts: [
      { productId: 11, productName: "Instant Noodle", quantitySold: 60, salesAmount: 900000 },
      { productId: 12, productName: "Candy Pack", quantitySold: 96, salesAmount: 480000 },
      { productId: 13, productName: "Salt Pack", quantitySold: 120, salesAmount: 300000 },
      { productId: 14, productName: "Biscuit Small", quantitySold: 144, salesAmount: 432000 },
      { productId: 15, productName: "Juice Box", quantitySold: 180, salesAmount: 720000 },
    ],
    topEmployees: [
      { employeeId: 1, employeeName: "Daw Su Su", salesAmount: 66000000 },
      { employeeId: 2, employeeName: "U Kyaw Kyaw", salesAmount: 57600000 },
      { employeeId: 3, employeeName: "Daw Mya Mya", salesAmount: 50400000 },
      { employeeId: 4, employeeName: "U Hla Hla", salesAmount: 45600000 },
      { employeeId: 5, employeeName: "Daw Nwe Nwe", salesAmount: 38400000 },
      { employeeId: 6, employeeName: "U Zaw Zaw", salesAmount: 33600000 },
      { employeeId: 7, employeeName: "Daw Thiri", salesAmount: 30000000 },
      { employeeId: 8, employeeName: "U Min Min", salesAmount: 26400000 },
      { employeeId: 9, employeeName: "Daw Yee Yee", salesAmount: 24000000 },
      { employeeId: 10, employeeName: "U Tun Tun", salesAmount: 21600000 },
    ],
  },
  prevMonth: {
    periodLabel: "Previous Month (Aug 2026)",
    totalGrossSales: 21500000,
    totalRefunds: 420000,
    periodSales: 21080000,
    growthPercentage: "+9.2%",
    totalCOGS: 13500000,
    totalReturnCOGS: 280000,
    periodLoss: 320000,
    periodDiscount: 410000,
    allSaleDiscount: 440000,
    totalReturnDiscount: 28000,
    freeGift: { quantity: 105, amount: 780000 },
    freeReturnItemsQuantity: 6,
    freeReturnItemsValue: 45000,
    generalExpenses: 1100000,
    periodProfit: 5705000,      // ✅ ပြင်ပြီး (5,705,000)
    totalTax: 225000,
    totalReturnTax: 6500,
    periodCreditOutstanding: 1650000,
    totalInvoices: 220,
    paymentMethodAmounts: {
      "Cash": 11000000,
      "KBZ Pay": 5000000,
      "Wave Money": 2800000,
      "AYA Pay": 1500000,
      "Credit": 880000,
    },
    discountAmounts: {
      "Member Discount": 220000,
      "Seasonal Discount": 140000,
      "Bulk Discount": 70000,
    },
    topProducts: [
      { productId: 1, productName: "Premium Rice 25kg", quantitySold: 78, salesAmount: 3900000 },
      { productId: 2, productName: "Cooking Oil 5L", quantitySold: 55, salesAmount: 2750000 },
      { productId: 3, productName: "Sugar 1kg", quantitySold: 128, salesAmount: 1280000 },
      { productId: 4, productName: "Washing Powder 3kg", quantitySold: 34, salesAmount: 1360000 },
      { productId: 5, productName: "Milk Powder 1kg", quantitySold: 38, salesAmount: 1140000 },
      { productId: 6, productName: "Coffee Mix 30pcs", quantitySold: 48, salesAmount: 720000 },
      { productId: 7, productName: "Shampoo 500ml", quantitySold: 28, salesAmount: 560000 },
      { productId: 8, productName: "Toothpaste 200g", quantitySold: 24, salesAmount: 360000 },
      { productId: 9, productName: "Soap Bar 100g", quantitySold: 68, salesAmount: 340000 },
      { productId: 10, productName: "Detergent Liquid 1L", quantitySold: 22, salesAmount: 330000 },
    ],
    worstProducts: [
      { productId: 11, productName: "Instant Noodle", quantitySold: 4, salesAmount: 60000 },
      { productId: 12, productName: "Candy Pack", quantitySold: 7, salesAmount: 35000 },
      { productId: 13, productName: "Salt Pack", quantitySold: 9, salesAmount: 22500 },
      { productId: 14, productName: "Biscuit Small", quantitySold: 10, salesAmount: 30000 },
      { productId: 15, productName: "Juice Box", quantitySold: 12, salesAmount: 48000 },
    ],
    topEmployees: [
      { employeeId: 1, employeeName: "Daw Su Su", salesAmount: 4900000 },
      { employeeId: 2, employeeName: "U Kyaw Kyaw", salesAmount: 4200000 },
      { employeeId: 3, employeeName: "Daw Mya Mya", salesAmount: 3800000 },
      { employeeId: 4, employeeName: "U Hla Hla", salesAmount: 3400000 },
      { employeeId: 5, employeeName: "Daw Nwe Nwe", salesAmount: 2900000 },
    ],
  },
};

// Expense Details
const DEMO_EXPENSE_DETAILS = [
  { id: 1, category: "Rent", subCategory: "Shop Rent", title: "Monthly Shop Rent", vendor: "U Ba", amount: 500000, date: "2026-09-01", status: "Paid", description: "September shop rent" },
  { id: 2, category: "Utilities", subCategory: "Electricity", title: "Electricity Bill", vendor: "YESC", amount: 350000, date: "2026-09-05", status: "Paid", description: "September electricity" },
  { id: 3, category: "Utilities", subCategory: "Water", title: "Water Bill", vendor: "City Water", amount: 120000, date: "2026-09-05", status: "Paid", description: "September water" },
  { id: 4, category: "Salary", subCategory: "Staff Salary", title: "Staff Salaries", vendor: "Various", amount: 800000, date: "2026-09-30", status: "Paid", description: "September salaries" },
  { id: 5, category: "Transport", subCategory: "Delivery", title: "Delivery Cost", vendor: "Delivery Service", amount: 150000, date: "2026-09-15", status: "Paid", description: "Product delivery" },
  { id: 6, category: "Marketing", subCategory: "Ads", title: "Facebook Ads", vendor: "Facebook", amount: 80000, date: "2026-09-20", status: "Pending", description: "Monthly ads" },
];

// ============================================================
// Helper Functions
// ============================================================
const formatMoneyForInsights = (amount) => {
  if (amount === null || amount === undefined) return '0 Ks';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0 Ks';
  return num.toFixed(1).replace(/\B(?=(\d{3})+(?!\d))/g, ',') + ' Ks';
};

const safeNumber = (value) => {
  if (value === null || value === undefined) return 0;
  const num = typeof value === 'number' ? value : parseFloat(value);
  return isNaN(num) ? 0 : num;
};

// ============================================================
// Body Skeleton
// ============================================================
const BodySkeleton = ({ language }) => (
  <div className="dashboard-modal-body skeleton-body">
    <div className="dashboard-modal-info">
      {[1, 2, 3].map((i) => (
        <div key={i} className="dashboard-info-item skeleton-info-item">
          <div className="skeleton-icon" style={{ width: '32px', height: '32px', borderRadius: '50%' }}></div>
          <div>
            <div className="skeleton-text" style={{ width: '60px', height: '12px', marginBottom: '6px' }}></div>
            <div className="skeleton-text" style={{ width: '100px', height: '16px' }}></div>
          </div>
        </div>
      ))}
    </div>

    <div className="dashboard-metrics-grid skeleton-metrics-grid">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="metric-card skeleton-metric-card">
          <div className="skeleton-icon" style={{ width: '40px', height: '40px', borderRadius: '10px' }}></div>
          <div className="metric-content">
            <div className="skeleton-text" style={{ width: '80px', height: '12px', marginBottom: '6px' }}></div>
            <div className="skeleton-text" style={{ width: '100px', height: '20px' }}></div>
          </div>
        </div>
      ))}
    </div>

    <div className="dashboard-charts-section skeleton-charts">
      <div className="chart-card skeleton-chart-card">
        <div className="skeleton-text" style={{ width: '150px', height: '18px', marginBottom: '15px' }}></div>
        <div className="skeleton-chart" style={{ height: '200px', borderRadius: '12px' }}></div>
      </div>
      <div className="chart-card skeleton-chart-card">
        <div className="skeleton-text" style={{ width: '150px', height: '18px', marginBottom: '15px' }}></div>
        <div className="skeleton-chart" style={{ height: '200px', borderRadius: '12px' }}></div>
      </div>
    </div>
  </div>
);

// ============================================================
// Business Insights Generator
// ============================================================
const generateBusinessInsights = (store, language) => {
  const insights = [];
  if (!store) return insights;

  const totalSales = safeNumber(store.periodSales);
  const totalProfit = safeNumber(store.periodProfit);
  const totalInvoices = safeNumber(store.totalInvoices);
  const totalLoss = safeNumber(store.periodLoss);
  const totalDiscount = safeNumber(store.periodDiscount);
  const totalRefunds = safeNumber(store.totalRefunds);
  const freeGiftAmount = safeNumber(store.freeGift?.amount);
  const generalExpenses = safeNumber(store.generalExpenses);

  const lossPercentage = totalSales > 0 ? (totalLoss / totalSales) * 100 : 0;
  const discountPercentage = totalSales > 0 ? (totalDiscount / totalSales) * 100 : 0;
  const refundPercentage = totalSales > 0 ? (totalRefunds / totalSales) * 100 : 0;
  const freeGiftPercentage = totalSales > 0 ? (freeGiftAmount / totalSales) * 100 : 0;
  const expensePercentage = totalSales > 0 ? (generalExpenses / totalSales) * 100 : 0;

  if (totalSales > 5000000) {
    insights.push({
      type: 'success',
      title: language === 'mm' ? '📈 ရောင်းအား ကောင်းမွန်ခြင်း' : '📈 Strong Sales Performance',
      description: language === 'mm'
        ? `စုစုပေါင်းရောင်းအား ${formatMoneyForInsights(totalSales)} ရှိပါတယ်။`
        : `Total sales reached ${formatMoneyForInsights(totalSales)}.`
    });
  } else if (totalSales > 2000000) {
    insights.push({
      type: 'info',
      title: language === 'mm' ? '📊 ရောင်းအား အလယ်အလတ်' : '📊 Moderate Sales',
      description: language === 'mm'
        ? `စုစုပေါင်းရောင်းအား ${formatMoneyForInsights(totalSales)} ရှိပါတယ်။`
        : `Total sales at ${formatMoneyForInsights(totalSales)}.`
    });
  } else if (totalSales < 1000000 && totalSales > 0) {
    insights.push({
      type: 'warning',
      title: language === 'mm' ? '⚠️ ရောင်းအား နည်းပါးခြင်း' : '⚠️ Low Sales Alert',
      description: language === 'mm'
        ? `လက်ရှိရောင်းအား ${formatMoneyForInsights(totalSales)} သာရှိပါသည်။`
        : `Current sales at ${formatMoneyForInsights(totalSales)}.`
    });
  }

  const actualProfit = totalProfit - generalExpenses;
  const actualProfitMargin = totalSales > 0 ? (actualProfit / totalSales) * 100 : 0;

  if (totalSales > 0) {
    if (actualProfitMargin > 25) {
      insights.push({
        type: 'success',
        title: language === 'mm' ? '💰 အမြတ်ငွေ ကောင်းမွန်ခြင်း' : '💰 Excellent Profit Margin',
        description: language === 'mm'
          ? `အမြတ်ငွေနှုန်းထား ${actualProfitMargin.toFixed(1)}% ရှိပါသည်။`
          : `Profit margin at ${actualProfitMargin.toFixed(1)}%.`
      });
    } else if (actualProfitMargin > 15) {
      insights.push({
        type: 'info',
        title: language === 'mm' ? '📊 အမြတ်ငွေ လက်ခံနိုင်ဖွယ်' : '📊 Acceptable Profit Margin',
        description: language === 'mm'
          ? `အမြတ်ငွေနှုန်းထား ${actualProfitMargin.toFixed(1)}% ရှိပါသည်။`
          : `Profit margin at ${actualProfitMargin.toFixed(1)}%.`
      });
    } else if (actualProfitMargin > 5) {
      insights.push({
        type: 'warning',
        title: language === 'mm' ? '⚠️ အမြတ်ငွေ နည်းပါးခြင်း' : '⚠️ Low Profit Margin',
        description: language === 'mm'
          ? `အမြတ်ငွေနှုန်းထား ${actualProfitMargin.toFixed(1)}% သာရှိပါသည်။`
          : `Profit margin at ${actualProfitMargin.toFixed(1)}%.`
      });
    } else if (actualProfitMargin <= 0) {
      insights.push({
        type: 'danger',
        title: language === 'mm' ? '🔴 အရှုံးပေါ်နေခြင်း' : '🔴 Operating at Loss',
        description: language === 'mm'
          ? `လက်ရှိတွင် အရှုံးပေါ်နေပါသည်။`
          : `Currently operating at a loss.`
      });
    }
  }

  if (totalSales > 0 && expensePercentage > 20 && expensePercentage < 200) {
    insights.push({
      type: 'warning',
      title: language === 'mm' ? '📊 ကုန်ကျစရိတ် များပြားခြင်း' : '📊 High Operating Expenses',
      description: language === 'mm'
        ? `ကုန်ကျစရိတ်သည် စုစုပေါင်းရောင်းအား၏ ${expensePercentage.toFixed(1)}% (${formatMoneyForInsights(generalExpenses)}) ရှိပါသည်။`
        : `Operating expenses account for ${expensePercentage.toFixed(1)}% (${formatMoneyForInsights(generalExpenses)}) of total sales.`
    });
  }

  if (totalSales > 0 && lossPercentage > 5) {
    insights.push({
      type: 'danger',
      title: language === 'mm' ? '📉 ပျက်စီးဆုံးရှုံးမှု များပြားခြင်း' : '📉 High Damage/Loss Rate',
      description: language === 'mm'
        ? `ဆုံးရှုံးမှုပမာဏသည် စုစုပေါင်းရောင်းအား၏ ${lossPercentage.toFixed(1)}% (${formatMoneyForInsights(totalLoss)}) ရှိပါသည်။`
        : `Losses account for ${lossPercentage.toFixed(1)}% (${formatMoneyForInsights(totalLoss)}) of total sales.`
    });
  }

  if (totalSales > 0 && discountPercentage > 10) {
    insights.push({
      type: 'warning',
      title: language === 'mm' ? '🏷️ လျှော့ဈေး များပြားခြင်း' : '🏷️ High Discount Rate',
      description: language === 'mm'
        ? `လျှော့ဈေးပမာဏသည် စုစုပေါင်းရောင်းအား၏ ${discountPercentage.toFixed(1)}% (${formatMoneyForInsights(totalDiscount)}) ရှိပါသည်။`
        : `Discounts account for ${discountPercentage.toFixed(1)}% (${formatMoneyForInsights(totalDiscount)}) of total sales.`
    });
  }

  if (totalSales > 0 && refundPercentage > 3) {
    insights.push({
      type: 'danger',
      title: language === 'mm' ? '↩️ ပြန်အမ်းငွေ များပြားခြင်း' : '↩️ High Refund Rate',
      description: language === 'mm'
        ? `ပြန်အမ်းငွေပမာဏသည် စုစုပေါင်းရောင်းအား၏ ${refundPercentage.toFixed(1)}% (${formatMoneyForInsights(totalRefunds)}) ရှိပါသည်။`
        : `Refunds account for ${refundPercentage.toFixed(1)}% (${formatMoneyForInsights(totalRefunds)}) of total sales.`
    });
  }

  if (totalSales > 0 && freeGiftPercentage > 2) {
    insights.push({
      type: 'info',
      title: language === 'mm' ? '🎁 လက်ဆောင်ပစ္စည်း များပြားခြင်း' : '🎁 High Free Items Rate',
      description: language === 'mm'
        ? `လက်ဆောင်ပစ္စည်းတန်ဖိုးသည် စုစုပေါင်းရောင်းအား၏ ${freeGiftPercentage.toFixed(1)}% (${formatMoneyForInsights(freeGiftAmount)}) ရှိပါသည်။`
        : `Free items value accounts for ${freeGiftPercentage.toFixed(1)}% (${formatMoneyForInsights(freeGiftAmount)}) of total sales.`
    });
  }

  const growthValue = parseFloat(store.growthPercentage) || 0;
  if (growthValue > 20) {
    insights.push({
      type: 'success',
      title: language === 'mm' ? '🚀 တိုးတက်မှုနှုန်း သိသာထင်ရှား' : '🚀 Significant Growth',
      description: language === 'mm'
        ? `ယခင်ကာလထက် ${growthValue.toFixed(1)}% တိုးတက်လာပါသည်။`
        : `${growthValue.toFixed(1)}% growth compared to previous period.`
    });
  } else if (growthValue < -10) {
    insights.push({
      type: 'danger',
      title: language === 'mm' ? '📉 တိုးတက်မှုနှုန်း ကျဆင်းခြင်း' : '📉 Negative Growth',
      description: language === 'mm'
        ? `ယခင်ကာလထက် ${Math.abs(growthValue).toFixed(1)}% ကျဆင်းလာပါသည်။`
        : `${Math.abs(growthValue).toFixed(1)}% decline compared to previous period.`
    });
  }

  if (store.bestProduct && totalSales > 0) {
    const bestProductSales = safeNumber(store.bestProduct.salesAmount);
    const bestProductPercentage = (bestProductSales / totalSales) * 100;
    insights.push({
      type: 'info',
      title: language === 'mm' ? '🌟 အကောင်းဆုံးရောင်းအားရပစ္စည်း' : '🌟 Best Selling Product',
      description: language === 'mm'
        ? `"${store.bestProduct.productName}" ပစ္စည်း အရေအတွက် ${store.bestProduct.quantitySold} ရောင်းချရပြီး စုစုပေါင်းရောင်းအား၏ ${bestProductPercentage.toFixed(1)}% ရှိပါသည်။`
        : `"${store.bestProduct.productName}" sold ${store.bestProduct.quantitySold} units, accounting for ${bestProductPercentage.toFixed(1)}% of total sales.`
    });
  }

  if (store.worstProducts && store.worstProducts.length > 0 && totalSales > 0) {
    const worstProduct = store.worstProducts[0];
    const worstProductSales = safeNumber(worstProduct.salesAmount);
    const worstProductPercentage = (worstProductSales / totalSales) * 100;
    insights.push({
      type: 'warning',
      title: language === 'mm' ? '📉 ရောင်းအားအနည်းဆုံးပစ္စည်း' : '📉 Lowest Selling Product',
      description: language === 'mm'
        ? `"${worstProduct.productName}" ပစ္စည်း အရေအတွက် ${worstProduct.quantitySold} သာရောင်းချရပြီး စုစုပေါင်းရောင်းအား၏ ${worstProductPercentage.toFixed(1)}% သာရှိပါသည်။`
        : `"${worstProduct.productName}" sold only ${worstProduct.quantitySold} units, accounting for just ${worstProductPercentage.toFixed(1)}% of total sales.`
    });
  }

  if (totalInvoices > 500) {
    insights.push({
      type: 'success',
      title: language === 'mm' ? '📋 အရောင်းစာရင်း များပြားခြင်း' : '📋 High Transaction Volume',
      description: language === 'mm'
        ? `စုစုပေါင်းအရောင်းစာရင်း အရေအတွက် ${totalInvoices} ခုရှိပါသည်။`
        : `Total of ${totalInvoices} transactions.`
    });
  }

  return insights;
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const StoreDetailModal = ({
  branchData,
  onClose,
  language,
  formatMoney,
  initialPeriod = 'month'
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [storeData, setStoreData] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState(initialPeriod);
  const [showCustomDate, setShowCustomDate] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showReport, setShowReport] = useState(false);
  const [calculatedProfit, setCalculatedProfit] = useState(0);
  const [showExpenseDetail, setShowExpenseDetail] = useState(false);

  // ✅ DEMO: fetchBranchDetail → local data
  const fetchBranchDetail = (period, customFrom, customTo) => {
    if (!branchData?.branchId) {
      console.error('❌ No branchId provided');
      return;
    }

    setLoading(true);
    setError(null);

    setTimeout(() => {
      try {
        const periodKey = period === 'custom' ? 'month' : period;
        const demoData = DEMO_PERIOD_DATA[periodKey] || DEMO_PERIOD_DATA.month;

        // ✅ Profit ကို တွက်ပြီး သေချာအောင် ပြန် set
        const realFreeGiftAmount = safeNumber(demoData.freeGift?.amount) - safeNumber(demoData.freeReturnItemsValue);
        const grossSales = safeNumber(demoData.totalGrossSales) - realFreeGiftAmount;
        const netSales = grossSales - safeNumber(demoData.totalRefunds);
        const realCOGS = safeNumber(demoData.totalCOGS) - safeNumber(demoData.totalReturnCOGS);
        const generalExpenses = safeNumber(demoData.generalExpenses);
        const profit = netSales - safeNumber(demoData.periodLoss) - realCOGS - generalExpenses;

        setStoreData({
          ...demoData,
          branchId: branchData.branchId,
          branchName: branchData.branchName,
          location: branchData.address || branchData.location,
          manager: { name: "U Aung Aung", phone: "09-123456789" },
          status: "Profitable",
          bestProduct: demoData.topProducts?.[0] || null,
          worstProducts: demoData.worstProducts || [],
          expenseDetails: DEMO_EXPENSE_DETAILS,
          periodProfit: profit,   // ✅ တွက်ထားတဲ့ profit ကို သုံး
        });
      } catch (err) {
        console.error('❌ Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  useEffect(() => {
    fetchBranchDetail(selectedPeriod, startDate, endDate);
  }, [branchData?.branchId]);

  const handlePeriodClick = (period) => {
    setSelectedPeriod(period);
    if (period === 'custom') {
      setShowCustomDate(true);
    } else {
      setShowCustomDate(false);
      fetchBranchDetail(period, null, null);
    }
  };

  // ✅ Profit Calculation
  useEffect(() => {
    if (storeData) {
      const realFreeGiftAmount = safeNumber(storeData.freeGift?.amount) - safeNumber(storeData.freeReturnItemsValue);
      const grossSales = safeNumber(storeData.totalGrossSales) - realFreeGiftAmount;
      const netSales = grossSales - safeNumber(storeData.totalRefunds);
      const realCOGS = safeNumber(storeData.totalCOGS) - safeNumber(storeData.totalReturnCOGS);
      const generalExpenses = safeNumber(storeData.generalExpenses);

      const profit = netSales - safeNumber(storeData.periodLoss) - realCOGS - generalExpenses;
      setCalculatedProfit(profit);
    }
  }, [storeData]);

  const handleCustomDateApply = () => {
    if (startDate && endDate) {
      fetchBranchDetail('custom', startDate, endDate);
      setShowCustomDate(false);
    }
  };

  const businessInsights = generateBusinessInsights(storeData, language);

  const getPaymentPieData = () => {
    if (!storeData?.paymentMethodAmounts) return null;
    const labels = Object.keys(storeData.paymentMethodAmounts);
    const values = Object.values(storeData.paymentMethodAmounts).map(v => safeNumber(v));
    if (labels.length === 0) return null;
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#4361ee', '#f72585', '#f8961e', '#4cc9f0', '#2ecc71', '#9b59b6']
      }]
    };
  };

  const getDiscountPieData = () => {
    if (!storeData?.discountAmounts) return null;
    const labels = Object.keys(storeData.discountAmounts);
    const values = Object.values(storeData.discountAmounts).map(v => safeNumber(v));
    if (labels.length === 0) return null;
    return {
      labels,
      datasets: [{
        data: values,
        backgroundColor: ['#ff6b6b', '#4ecdc4', '#ffe66d', '#c77dff', '#95a5a6']
      }]
    };
  };

  const getProductsBarData = () => {
    if (!storeData?.topProducts || storeData.topProducts.length === 0) return null;
    return {
      labels: storeData.topProducts.map(p => p.productName),
      datasets: [{
        label: language === 'mm' ? 'ရောင်းရသော အရေအတွက်' : 'Quantity Sold',
        data: storeData.topProducts.map(p => safeNumber(p.quantitySold)),
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        borderColor: '#2980b9',
        borderWidth: 1
      }]
    };
  };

  const getWorstProductsBarData = () => {
    if (!storeData?.worstProducts || storeData.worstProducts.length === 0) return null;
    return {
      labels: storeData.worstProducts.map(p => p.productName),
      datasets: [{
        label: language === 'mm' ? 'ရောင်းရသော အရေအတွက်' : 'Quantity Sold',
        data: storeData.worstProducts.map(p => safeNumber(p.quantitySold)),
        backgroundColor: 'rgba(231, 76, 60, 0.8)',
        borderColor: '#c0392b',
        borderWidth: 1
      }]
    };
  };

  const paymentPieData = getPaymentPieData();
  const discountPieData = getDiscountPieData();
  const productsBarData = getProductsBarData();
  const worstProductsBarData = getWorstProductsBarData();

  const pieOptions = {
    plugins: {
      datalabels: { display: false },
      legend: {
        position: 'bottom',
        labels: { boxWidth: 12, padding: 15, font: { size: 11 } }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, val) => acc + val, 0);
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
            return `${label}: ${formatMoney(value)} (${percentage}%)`;
          }
        }
      }
    }
  };

  const productsBarOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const product = storeData.topProducts[context.dataIndex];
            const quantity = safeNumber(product.quantitySold);
            const amount = safeNumber(product.salesAmount);
            return [
              `${language === 'mm' ? 'အရေအတွက်' : 'Quantity'}: ${quantity}`,
              `${language === 'mm' ? 'ငွေပမာဏ' : 'Amount'}: ${formatMoney(amount)}`
            ];
          }
        }
      },
      datalabels: { display: false }
    },
    scales: { x: { title: { display: true, text: language === 'mm' ? 'အရေအတွက်' : 'Quantity' } } }
  };

  const worstProductsBarOptions = {
    indexAxis: 'y',
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => {
            const product = storeData.worstProducts[context.dataIndex];
            if (!product) return '';
            const quantity = safeNumber(product.quantitySold);
            const amount = safeNumber(product.salesAmount);
            return [
              `${language === 'mm' ? 'အရေအတွက်' : 'Quantity'}: ${quantity}`,
              `${language === 'mm' ? 'ငွေပမာဏ' : 'Amount'}: ${formatMoney(amount)}`
            ];
          }
        }
      },
      datalabels: { display: false }
    },
    scales: { x: { title: { display: true, text: language === 'mm' ? 'အရေအတွက်' : 'Quantity' } } }
  };

  const generateReport = () => {
    setShowReport(true);
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div className="dashboard-modal-overlay">
        <div className="dashboard-modal">
          <div className="dashboard-modal-header">
            <h2>
              <i className="fas fa-store"></i>
              {branchData?.branchName || 'Loading...'}
              <span className="dashboard-modal-badge" style={{ background: '#94a3b8', color: 'white' }}>
                {language === 'mm' ? 'ဖွင့်နေသည်' : 'Loading'}
              </span>
            </h2>
            <button className="dashboard-modal-close" onClick={onClose}>✕</button>
          </div>

          <div className="dashboard-modal-period">
            <div className="period-selector">
              {['today', 'week', 'month', 'year'].map(p => (
                <button key={p} className={`period-btn ${selectedPeriod === p ? 'active' : ''}`} disabled>
                  {p === 'today' ? (language === 'mm' ? 'ယနေ့' : 'Today') :
                   p === 'week' ? (language === 'mm' ? 'ဤအပတ်' : 'This Week') :
                   p === 'month' ? (language === 'mm' ? 'ဤလ' : 'This Month') :
                   (language === 'mm' ? 'ဤနှစ်' : 'This Year')}
                </button>
              ))}
              <button className="period-btn custom" disabled>
                {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
              </button>
            </div>
          </div>

          <BodySkeleton language={language} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-modal-overlay">
        <div className="dashboard-modal">
          <div className="dashboard-modal-header">
            <h2><i className="fas fa-store"></i> {branchData?.branchName || 'Error'}</h2>
            <button className="dashboard-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="dashboard-modal-body" style={{ textAlign: 'center', padding: '50px', color: '#e74c3c' }}>
            <i className="fas fa-exclamation-circle" style={{ fontSize: '48px', marginBottom: '20px' }}></i>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!storeData) return null;

  const generalExpenses = safeNumber(storeData.generalExpenses);

  return (
    <div className="dashboard-modal-overlay">
      <div className="dashboard-modal">
        <div className="dashboard-modal-header">
          <h2>
            <i className="fas fa-store"></i>
            {storeData?.branchName}
            <span className={`dashboard-modal-badge ${calculatedProfit >= 0 ? 'success' : 'danger'}`}>
              {calculatedProfit >= 0
                ? (language === 'mm' ? 'အမြတ်ရ' : 'Profitable')
                : (language === 'mm' ? 'အရှုံး' : 'Loss')}
            </span>
          </h2>
          <button className="dashboard-modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="dashboard-modal-period">
          <div className="period-selector">
            <button className={`period-btn ${selectedPeriod === 'today' ? 'active' : ''}`} onClick={() => handlePeriodClick('today')}>
              {language === 'mm' ? 'ယနေ့' : 'Today'}
            </button>
            <button className={`period-btn ${selectedPeriod === 'week' ? 'active' : ''}`} onClick={() => handlePeriodClick('week')}>
              {language === 'mm' ? 'ဤအပတ်' : 'This Week'}
            </button>
            <button className={`period-btn ${selectedPeriod === 'month' ? 'active' : ''}`} onClick={() => handlePeriodClick('month')}>
              {language === 'mm' ? 'ဤလ' : 'This Month'}
            </button>
            <button className={`period-btn ${selectedPeriod === 'year' ? 'active' : ''}`} onClick={() => handlePeriodClick('year')}>
              {language === 'mm' ? 'ဤနှစ်' : 'This Year'}
            </button>
            <button className={`period-btn custom ${selectedPeriod === 'custom' ? 'active' : ''}`} onClick={() => handlePeriodClick('custom')}>
              {language === 'mm' ? 'စိတ်ကြိုက်' : 'Custom'}
            </button>
          </div>

          {showCustomDate && (
            <div className="custom-date-range">
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="date-input" />
              <span className="date-separator">{language === 'mm' ? 'မှ' : 'to'}</span>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="date-input" />
              <button className="apply-date-btn" onClick={handleCustomDateApply}>
                {language === 'mm' ? 'ကြည့်ရန်' : 'Apply'}
              </button>
            </div>
          )}
        </div>

        <div className="dashboard-modal-body">
          <div className="dashboard-modal-info">
            <div className="dashboard-info-item location-item">
              <i className="fas fa-map-marker-alt"></i>
              <div className="dashboard-info-content">
                <div className="dashboard-info-label">{language === 'mm' ? 'တည်နေရာ' : 'Location'}</div>
                <div className="dashboard-info-value location-value">
                  {branchData?.address || storeData.location || 'N/A'}
                </div>
              </div>
            </div>
            <div className="dashboard-info-item">
              <i className="fas fa-user-tie"></i>
              <div>
                <div className="dashboard-info-label">{language === 'mm' ? 'မန်နေဂျာ' : 'Manager'}</div>
                <div className="dashboard-info-value">{storeData.manager?.name || 'N/A'}</div>
                <div className="dashboard-info-value-phone">{storeData.manager?.phone || 'N/A'}</div>
              </div>
            </div>
            <div className="dashboard-info-item">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <div className="dashboard-info-label">{language === 'mm' ? 'ကာလ' : 'Period'}</div>
                <div className="dashboard-info-value">{storeData.periodLabel || 'N/A'}</div>
              </div>
            </div>
          </div>

          <div className="dashboard-metrics-grid">
            {(() => {
              const realFreeGiftCount = safeNumber(storeData.freeGift?.quantity) - safeNumber(storeData.freeReturnItemsQuantity);
              const realFreeGiftAmount = safeNumber(storeData.freeGift?.amount) - safeNumber(storeData.freeReturnItemsValue);
              const realAllSaleDiscount = safeNumber(storeData.allSaleDiscount) - safeNumber(storeData.totalReturnDiscount);
              const realTax = safeNumber(storeData.totalTax) - safeNumber(storeData.totalReturnTax);
              const grossSales = safeNumber(storeData.totalGrossSales) - realFreeGiftAmount;
              const netSales = grossSales - safeNumber(storeData.totalRefunds);
              const realCOGS = safeNumber(storeData.totalCOGS) - safeNumber(storeData.totalReturnCOGS);
              const generalExpenses = safeNumber(storeData.generalExpenses);
              const profit = netSales - safeNumber(storeData.periodLoss) - realCOGS - generalExpenses;

              return (
                <>
                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#e8f0fe', color: '#3498db' }}>
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'စုစုပေါင်းရောင်းရငွေ' : 'Gross Sales'}</div>
                      <div className="metric-value large-number" style={{ color: '#3498db', fontWeight: 'bold' }}>
                        {formatMoney(grossSales)}
                      </div>
                      <div className="metric-trend" style={{ color: '#7f8c8d', fontSize: '11px' }}>
                          {language === 'mm' ? 'လက်ဆောင်၊ အခွန်၊ လျှော့ဈေး နှုတ်ပီး' : 'After gift, tax, discout'}
                        </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#fee9e9', color: '#e74c3c' }}>
                      <i className="fas fa-undo-alt"></i>
                    </div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'ပြန်အမ်းငွေ' : 'Refunds'}</div>
                      <div className="metric-value large-number" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        {formatMoney(safeNumber(storeData.totalRefunds))}
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-shopping-cart"></i></div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'အသားတင်ရောင်းအား' : 'Net Sales'}</div>
                      <div className="metric-value large-number">{formatMoney(netSales)}</div>
                      <div className="return_gross" style={{display:"flex", justifyContent:"space-between"}}>
                        <div className="metric-trend" style={{ color: '#27ae60' }}>
                          {storeData.growthPercentage || '0%'}
                        </div>
                        <div className="metric-trend" style={{ color: '#7f8c8d', fontSize: '11px' }}>
                          {language === 'mm' ? 'ပြန်အမ်းပြီးငွေ နှုတ်ပီး' : 'After total returns'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-chart-line"></i></div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'ပျက်ဆီးဆုံးရှုံးမှု' : 'Damage/Loss'}</div>
                      <div className="metric-value loss large-number">
                        {formatMoney(safeNumber(storeData.periodLoss))}
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#f0f0f0', color: '#9b59b6' }}>
                      <i className="fas fa-gift"></i>
                    </div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'လက်ဆောင်ပစ္စည်း' : 'Free Items'}</div>
                      <div className="metric-value">{realFreeGiftCount}</div>
                      <div className="metric-sub-value large-number" style={{ color: '#9b59b6', fontWeight: 'bold' }}>
                        {formatMoney(realFreeGiftAmount)}
                      </div>
                      <div className="tooltip-container">
                        <div className="metric-trend" style={{ color: '#7f8c8d', fontSize: '11px', cursor: 'help', borderBottom: '1px dashed #ccc' }}>
                          {language === 'mm' ? 'အသေးစိတ်' : 'Details'} ℹ️
                        </div>
                        <div className="custom-tooltip">
                          <div className="tooltip-item">
                            <span className="tooltip-label">{language === 'mm' ? 'ရောင်းချ လက်ဆောင်' : 'Sale Free Items'}:</span>
                            <span className="tooltip-value">-{safeNumber(storeData.freeGift?.quantity)} pcs (-{formatMoney(safeNumber(storeData.freeGift?.amount))})</span>
                          </div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">{language === 'mm' ? 'ပြန်အမ်း လက်ဆောင်' : 'Return Free Items'}:</span>
                            <span className="tooltip-value negative">+{safeNumber(storeData.freeReturnItemsQuantity)} pcs (+{formatMoney(safeNumber(storeData.freeReturnItemsValue))})</span>
                          </div>
                          <div className="tooltip-divider"></div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">{language === 'mm' ? 'အသားတင် လက်ဆောင်' : 'Net Free Items'}:</span>
                            <span className="tooltip-value">{realFreeGiftCount} pcs ({formatMoney(realFreeGiftAmount)})</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-percent"></i></div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'လျှော့စျေး' : 'Discount'}</div>
                      <div className="metric-value discount large-number">{formatMoney(realAllSaleDiscount)}</div>
                      <div className="tooltip-container">
                        <div className="metric-trend" style={{ color: '#7f8c8d', fontSize: '11px', cursor: 'help', borderBottom: '1px dashed #ccc' }}>
                          {language === 'mm' ? 'အသေးစိတ်' : 'Details'} ℹ️
                        </div>
                        <div className="custom-tooltip">
                          <div className="tooltip-item">
                            <span className="tooltip-label">{language === 'mm' ? 'ရောင်းချ လျှော့ဈေး' : 'Sale Discount'}:</span>
                            <span className="tooltip-value negative">- {formatMoney(safeNumber(storeData.allSaleDiscount))}</span>
                          </div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">{language === 'mm' ? 'ပြန်အမ်း လျှော့ဈေး' : 'Return Discount'}:</span>
                            <span className="tooltip-value positive">+ {formatMoney(safeNumber(storeData.totalReturnDiscount))}</span>
                          </div>
                          <div className="tooltip-divider"></div>
                          <div className="tooltip-item">
                            <span className="tooltip-label">{language === 'mm' ? 'အသားတင် လျှော့ဈေး' : 'Net Discount'}:</span>
                            <span className="tooltip-value">{formatMoney(realAllSaleDiscount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon" style={{ background: '#f0f0f0', color: '#7f8c8d' }}>
                      <i className="fas fa-box"></i>
                    </div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'ကုန်ကျစရိတ်' : 'COGS'}</div>
                      <div className="metric-value large-number" style={{ color: '#e74c3c', fontWeight: 'bold' }}>
                        {formatMoney(realCOGS)}
                      </div>
                    </div>
                  </div>

                  <div className="metric-card"
                       onClick={() => {
                         if (storeData.expenseDetails && storeData.expenseDetails.length > 0) {
                           setShowExpenseDetail(true);
                         } else {
                           alert(language === 'mm' ? 'ကုန်ကျစရိတ်အသေးစိတ် မရှိပါ' : 'No expense details available');
                         }
                       }}
                       style={{ cursor: 'pointer' }}>
                    <div className="metric-icon" style={{ background: '#fef3c7', color: '#e67e22' }}>
                      <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div className="metric-content">
                      <div className="metric-label">
                        {language === 'mm' ? 'အထွေထွေကုန်ကျစရိတ်' : 'General Expenses'}
                        <i className="fas fa-chevron-right" style={{ fontSize: '10px', color: '#94a3b8', marginLeft: '6px' }}></i>
                      </div>
                      <div className="metric-value large-number" style={{ color: '#e67e22', fontWeight: 'bold' }}>
                        {formatMoney(generalExpenses)}
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-dollar-sign"></i></div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'အသားတင်အမြတ်' : 'Net Profit'}</div>
                      <div className={`metric-value large-number ${profit >= 0 ? 'profit' : 'loss'}`}>
                        {formatMoney(profit)}
                      </div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-file-invoice"></i></div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'အရောင်းစာရင်း' : 'Sale Invoices'}</div>
                      <div className="metric-value">{safeNumber(storeData.totalInvoices)}</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-percent"></i></div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'အခွန်' : 'Tax Amount'}</div>
                      <div className="metric-value large-number">{formatMoney(realTax)}</div>
                    </div>
                  </div>

                  <div className="metric-card">
                    <div className="metric-icon"><i className="fas fa-credit-card"></i></div>
                    <div className="metric-content">
                      <div className="metric-label">{language === 'mm' ? 'ရရန်အကြွေး' : 'Credit Outstanding'}</div>
                      <div className="metric-value large-number">
                        {formatMoney(safeNumber(storeData.periodCreditOutstanding))}
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}
          </div>

          <div className="dashboard-charts-section">
            <div className="chart-card payment-chart">
              <h3><i className="fas fa-credit-card"></i> {language === 'mm' ? 'ငွေပေးချေမှုနည်းလမ်းများ' : 'Payment Methods'}</h3>
              {paymentPieData ? (
                <div className="chart-container"><Pie data={paymentPieData} options={pieOptions} /></div>
              ) : (
                <div className="no-data">{language === 'mm' ? 'ဒေတာမရှိပါ' : 'No data'}</div>
              )}
            </div>

            <div className="chart-card discount-chart">
              <h3><i className="fas fa-tags"></i> {language === 'mm' ? 'လျှော့စျေးအမျိုးအစားများ' : 'Discount Types'}</h3>
              {discountPieData ? (
                <div className="chart-container"><Pie data={discountPieData} options={pieOptions} /></div>
              ) : (
                <div className="no-data">{language === 'mm' ? 'ဒေတာမရှိပါ' : 'No data'}</div>
              )}
            </div>
          </div>

          <div className="dashboard-products-section">
            <h3><i className="fas fa-chart-bar"></i> {language === 'mm' ? 'အကောင်းဆုံးပစ္စည်း ၁၀ မျိုး' : 'Top 10 Products'}</h3>
            {productsBarData ? (
              <div className="chart-container"><Bar data={productsBarData} options={productsBarOptions} /></div>
            ) : (
              <div className="no-data">{language === 'mm' ? 'ဒေတာမရှိပါ' : 'No data'}</div>
            )}
          </div>

          {worstProductsBarData && (
            <div className="dashboard-products-section">
              <h3><i className="fas fa-chart-bar"></i> {language === 'mm' ? 'ရောင်းအားအနည်းဆုံး ပစ္စည်း ၁၀ မျိုး' : 'Bottom 10 Products'}</h3>
              <div className="chart-container"><Bar data={worstProductsBarData} options={worstProductsBarOptions} /></div>
            </div>
          )}

          <div className="dashboard-employees-section">
            <h3><i className="fas fa-users"></i> {language === 'mm' ? 'ထိပ်တန်းဝန်ထမ်း ၁၀ ဦး' : 'Top 10 Employees'}</h3>
            <div className="employees-table-container">
              <table className="employees-table">
                <thead>
                  <tr>
                    <th>{language === 'mm' ? 'စဉ်' : 'No.'}</th>
                    <th>{language === 'mm' ? 'အမည်' : 'Name'}</th>
                    <th>{language === 'mm' ? 'ရောင်းအား' : 'Sales Amount'}</th>
                  </tr>
                </thead>
                <tbody>
                  {storeData.topEmployees && storeData.topEmployees.length > 0 ? (
                    storeData.topEmployees.map((emp, index) => (
                      <tr key={emp.employeeId || index}>
                        <td>{index + 1}</td>
                        <td>{emp.employeeName}</td>
                        <td className="amount">{formatMoney(safeNumber(emp.salesAmount))}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="3" className="no-data">{language === 'mm' ? 'ဒေတာမရှိပါ' : 'No data'}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="dashboard-insights-section">
            <h3><i className="fas fa-chart-line"></i> {language === 'mm' ? 'စီးပွားရေး အကြံပြုချက်များ' : 'Business Insights'}</h3>
            <div className="insights-grid">
              {businessInsights.length > 0 ? (
                businessInsights.map((insight, idx) => (
                  <div key={idx} className={`insight-card ${insight.type}`}>
                    <div className="insight-title">{insight.title}</div>
                    <div className="insight-description">{insight.description}</div>
                  </div>
                ))
              ) : (
                <div className="insight-card info">
                  <div className="insight-title">{language === 'mm' ? 'ℹ️ သတင်းအချက်အလက်' : 'ℹ️ Information'}</div>
                  <div className="insight-description">
                    {language === 'mm' ? 'လက်ရှိအချိန်တွင် အကြံပြုချက်များ မရှိပါ။' : 'No insights available at this time.'}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="dashboard-report-section">
            <button className="dashboard-report-btn" onClick={generateReport}>
              <i className="fas fa-file-alt"></i>
              {language === 'mm' ? ' အစီရင်ခံစာကြည့်ရန်' : ' View Report'}
            </button>
          </div>
        </div>
      </div>

      {showReport && (
        <StoreReport
          storeData={storeData}
          branchData={branchData}
          language={language}
          formatMoney={formatMoney}
          paymentPieData={paymentPieData}
          discountPieData={discountPieData}
          businessInsights={businessInsights}
          onClose={() => setShowReport(false)}
        />
      )}

      {showExpenseDetail && storeData.expenseDetails && (
        <ExpenseDetailModal
          expenses={storeData.expenseDetails}
          language={language}
          formatMoney={formatMoney}
          onClose={() => setShowExpenseDetail(false)}
        />
      )}
    </div>
  );
};

export default StoreDetailModal;