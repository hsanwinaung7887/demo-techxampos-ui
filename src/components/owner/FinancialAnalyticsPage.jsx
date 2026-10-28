import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import "../../light-style/owner-css/financialAnalyticsPage.css";

// Sample financial data
const initialShops = [
    {
        id: 1,
        name: "Mini Mart",
        owner: "John Doe",
        package: "Premium",
        monthlyRevenue: 1250000,
        yearlyRevenue: 15000000,
        pendingAmount: 200000,
        totalPaid: 1300000,
        paymentHistory: [
            { date: "2024-01-15", amount: 200000, status: "Paid" },
            { date: "2023-12-15", amount: 200000, status: "Paid" },
            { date: "2023-11-15", amount: 200000, status: "Paid" }
        ]
    },
    {
        id: 2,
        name: "Tech Gadgets",
        owner: "Alice Smith",
        package: "Standard",
        monthlyRevenue: 850000,
        yearlyRevenue: 10200000,
        pendingAmount: 0,
        totalPaid: 2000000,
        paymentHistory: [
            { date: "2024-01-20", amount: 2000000, status: "Paid" }
        ]
    },
    {
        id: 3,
        name: "Coffee Hub",
        owner: "Bob Johnson",
        package: "Basic",
        monthlyRevenue: 450000,
        yearlyRevenue: 5400000,
        pendingAmount: 150000,
        totalPaid: 450000,
        paymentHistory: [
            { date: "2024-01-10", amount: 150000, status: "Paid" },
            { date: "2023-12-10", amount: 150000, status: "Paid" },
            { date: "2023-11-10", amount: 150000, status: "Paid" }
        ]
    },
    {
        id: 4,
        name: "Fashion Store",
        owner: "Emma Wilson",
        package: "Premium",
        monthlyRevenue: 1800000,
        yearlyRevenue: 21600000,
        pendingAmount: 0,
        totalPaid: 2400000,
        paymentHistory: [
            { date: "2024-01-05", amount: 2400000, status: "Paid" }
        ]
    }
];

// Revenue data for charts
const monthlyRevenueData = [
    { month: 'Jan', revenue: 4350000, shops: 4 },
    { month: 'Feb', revenue: 4200000, shops: 4 },
    { month: 'Mar', revenue: 4500000, shops: 4 },
    { month: 'Apr', revenue: 4700000, shops: 4 },
    { month: 'May', revenue: 4600000, shops: 5 },
    { month: 'Jun', revenue: 4800000, shops: 5 },
    { month: 'Jul', revenue: 5000000, shops: 5 },
    { month: 'Aug', revenue: 5200000, shops: 6 },
    { month: 'Sep', revenue: 5100000, shops: 6 },
    { month: 'Oct', revenue: 5300000, shops: 6 },
    { month: 'Nov', revenue: 5500000, shops: 7 },
    { month: 'Dec', revenue: 5800000, shops: 7 }
];

const packageDistributionData = [
    { name: 'Premium', value: 2, revenue: 3750000, color: '#667eea' },
    { name: 'Standard', value: 1, revenue: 850000, color: '#f093fb' },
    { name: 'Basic', value: 1, revenue: 450000, color: '#4facfe' }
];

const FinancialAnalyticsPage = () => {
    const [shops, setShops] = useState(initialShops);
    const [selectedShop, setSelectedShop] = useState(null);
    const [timeRange, setTimeRange] = useState('monthly');
    const [viewType, setViewType] = useState('overview');
    const [filterType, setFilterType] = useState('all');
    const [dateRange, setDateRange] = useState({
        start: '2024-01-01',
        end: '2024-01-31'
    });

    // Calculate totals
    const calculateTotals = () => {
        return shops.reduce((acc, shop) => ({
            totalRevenue: acc.totalRevenue + shop.monthlyRevenue,
            totalPending: acc.totalPending + shop.pendingAmount,
            totalPaid: acc.totalPaid + shop.totalPaid,
            totalShops: shops.length
        }), { totalRevenue: 0, totalPending: 0, totalPaid: 0, totalShops: 0 });
    };

    const totals = calculateTotals();

    // Filter shops based on type
    const filteredShops = filterType === 'all' 
        ? shops 
        : shops.filter(shop => 
            filterType === 'pending' ? shop.pendingAmount > 0 :
            filterType === 'premium' ? shop.package === 'Premium' :
            filterType === 'standard' ? shop.package === 'Standard' :
            shop.package === 'Basic'
        );

    // Handle shop selection
    const handleSelectShop = (shop) => {
        setSelectedShop(shop);
    };

    // Handle payment receive
    const handleReceivePayment = (shopId, amount) => {
        setShops(shops.map(shop => {
            if (shop.id === shopId) {
                const newPayment = {
                    date: new Date().toISOString().split('T')[0],
                    amount: amount,
                    status: 'Paid'
                };
                return {
                    ...shop,
                    pendingAmount: 0,
                    totalPaid: shop.totalPaid + amount,
                    paymentHistory: [newPayment, ...shop.paymentHistory]
                };
            }
            return shop;
        }));
        
        if (selectedShop?.id === shopId) {
            setSelectedShop({
                ...selectedShop,
                pendingAmount: 0,
                totalPaid: selectedShop.totalPaid + amount,
                paymentHistory: [
                    {
                        date: new Date().toISOString().split('T')[0],
                        amount: amount,
                        status: 'Paid'
                    },
                    ...selectedShop.paymentHistory
                ]
            });
        }
        
        alert(`Payment of ${amount} Ks received successfully!`);
    };

    // Generate financial report
    const generateReport = () => {
        const reportData = {
            generatedDate: new Date().toLocaleDateString(),
            timeRange: timeRange,
            totals: totals,
            shops: filteredShops.map(shop => ({
                name: shop.name,
                package: shop.package,
                monthlyRevenue: shop.monthlyRevenue,
                pendingAmount: shop.pendingAmount,
                totalPaid: shop.totalPaid
            })),
            summary: `Total Revenue: ${totals.totalRevenue.toLocaleString()} Ks | ` +
                    `Pending Amount: ${totals.totalPending.toLocaleString()} Ks | ` +
                    `Total Paid: ${totals.totalPaid.toLocaleString()} Ks`
        };
        
        // For demo purposes, just show alert
        const reportString = JSON.stringify(reportData, null, 2);
        alert('Report generated!\n\n' + reportString);
        
        // In real implementation, you would:
        // 1. Send to backend to generate PDF
        // 2. Or download as CSV/Excel
    };

    // Export to Excel
    const exportToExcel = () => {
        const headers = ['Shop Name', 'Owner', 'Package', 'Monthly Revenue', 'Yearly Revenue', 'Pending Amount', 'Total Paid'];
        const data = shops.map(shop => [
            shop.name,
            shop.owner,
            shop.package,
            shop.monthlyRevenue,
            shop.yearlyRevenue,
            shop.pendingAmount,
            shop.totalPaid
        ]);
        
        // For demo, just show alert
        alert('Excel export would be implemented here with a library like xlsx');
    };

    return (
        <div className="financial-analytics-main">
            {/* Header with Back Button */}
            <div className="financial-header">
                <div className="header-top-row">
                    <NavLink to="/office/dashboard" className="financial-back-btn">
                        <i className="fas fa-arrow-left"></i> Back to Dashboard
                    </NavLink>
                    <div className="header-center-content">
                        <h1><i className="fas fa-chart-pie"></i> Financial Analytics</h1>
                        <p>Monitor revenue, payments, and financial reports from all shops</p>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="summary-cards">
                <div className="summary-card total-revenue">
                    <div className="summary-icon">
                        <i className="fas fa-money-bill-wave"></i>
                    </div>
                    <div className="summary-content">
                        <h3>Total Monthly Revenue</h3>
                        <h2>{totals.totalRevenue.toLocaleString()} Ks</h2>
                        <p>From {totals.totalShops} active shops</p>
                    </div>
                </div>
                
                <div className="summary-card pending-amount">
                    <div className="summary-icon">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="summary-content">
                        <h3>Pending Amount</h3>
                        <h2>{totals.totalPending.toLocaleString()} Ks</h2>
                        <p>Awaiting payment from shops</p>
                    </div>
                </div>
                
                <div className="summary-card total-paid">
                    <div className="summary-icon">
                        <i className="fas fa-check-circle"></i>
                    </div>
                    <div className="summary-content">
                        <h3>Total Paid Amount</h3>
                        <h2>{totals.totalPaid.toLocaleString()} Ks</h2>
                        <p>Received payments this year</p>
                    </div>
                </div>
                
                <div className="summary-card average-revenue">
                    <div className="summary-icon">
                        <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="summary-content">
                        <h3>Average per Shop</h3>
                        <h2>{(totals.totalRevenue / totals.totalShops).toLocaleString()} Ks</h2>
                        <p>Monthly average revenue</p>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div className="controls-section">
                <div className="controls-left">
                    <div className="time-range">
                        <button 
                            className={timeRange === 'daily' ? 'active' : ''}
                            onClick={() => setTimeRange('daily')}
                        >
                            Daily
                        </button>
                        <button 
                            className={timeRange === 'weekly' ? 'active' : ''}
                            onClick={() => setTimeRange('weekly')}
                        >
                            Weekly
                        </button>
                        <button 
                            className={timeRange === 'monthly' ? 'active' : ''}
                            onClick={() => setTimeRange('monthly')}
                        >
                            Monthly
                        </button>
                        <button 
                            className={timeRange === 'yearly' ? 'active' : ''}
                            onClick={() => setTimeRange('yearly')}
                        >
                            Yearly
                        </button>
                    </div>
                </div>
                
                <div className="controls-right">
                    <div className="view-type">
                        <select value={viewType} onChange={(e) => setViewType(e.target.value)}>
                            <option value="overview">Overview</option>
                            <option value="detailed">Detailed View</option>
                            <option value="comparison">Comparison</option>
                        </select>
                    </div>
                    
                    <div className="filter-type">
                        <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                            <option value="all">All Shops</option>
                            <option value="pending">Pending Payments</option>
                            <option value="premium">Premium Package</option>
                            <option value="standard">Standard Package</option>
                            <option value="basic">Basic Package</option>
                        </select>
                    </div>
                    
                    <button className="btn-generate" onClick={generateReport}>
                        <i className="fas fa-file-pdf"></i> Generate Report
                    </button>
                    
                    <button className="btn-export" onClick={exportToExcel}>
                        <i className="fas fa-file-excel"></i> Export Excel
                    </button>
                </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
                {/* Revenue Trend Chart */}
                <div className="chart-container large">
                    <div className="chart-header">
                        <h3><i className="fas fa-chart-line"></i> Revenue Trend ({timeRange})</h3>
                        <div className="chart-legend">
                            <span className="legend-item revenue">
                                <i className="fas fa-circle"></i> Revenue
                            </span>
                            <span className="legend-item shops">
                                <i className="fas fa-circle"></i> Active Shops
                            </span>
                        </div>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={monthlyRevenueData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="month" stroke="#666" />
                                <YAxis stroke="#666" />
                                <Tooltip 
                                    formatter={(value) => [value.toLocaleString(), '']}
                                    labelFormatter={(label) => `Month: ${label}`}
                                />
                                <Legend />
                                <Line 
                                    type="monotone" 
                                    dataKey="revenue" 
                                    name="Revenue (Ks)" 
                                    stroke="#667eea" 
                                    strokeWidth={3}
                                    dot={{ r: 4 }}
                                    activeDot={{ r: 6 }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="shops" 
                                    name="Active Shops" 
                                    stroke="#f093fb" 
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Package Distribution */}
                <div className="chart-container small">
                    <div className="chart-header">
                        <h3><i className="fas fa-chart-pie"></i> Package Distribution</h3>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={packageDistributionData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(entry) => `${entry.name}: ${entry.value}`}
                                    outerRadius={80}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {packageDistributionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    formatter={(value, name, props) => [
                                        `${value} shops (${props.payload.revenue.toLocaleString()} Ks)`,
                                        name
                                    ]}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Performers */}
                <div className="chart-container small">
                    <div className="chart-header">
                        <h3><i className="fas fa-trophy"></i> Top Revenue Shops</h3>
                    </div>
                    <div className="chart-content">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart 
                                data={[...shops]
                                    .sort((a, b) => b.monthlyRevenue - a.monthlyRevenue)
                                    .slice(0, 5)
                                }
                                layout="vertical"
                            >
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                                <XAxis type="number" stroke="#666" />
                                <YAxis 
                                    type="category" 
                                    dataKey="name" 
                                    stroke="#666" 
                                    width={100}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip 
                                    formatter={(value) => [value.toLocaleString() + ' Ks', 'Revenue']}
                                />
                                <Bar 
                                    dataKey="monthlyRevenue" 
                                    name="Monthly Revenue" 
                                    fill="#4facfe" 
                                    radius={[0, 4, 4, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Shops List with Financial Details */}
            {/* Shops List with Financial Details - Updated Version */}
            <div className="shops-financial-section">
                <div className="section-header">
                    <h2><i className="fas fa-store"></i> Shop Financial Details</h2>
                    <p>Click on a shop to view detailed payment history</p>
                </div>
                
                <div className="shops-table-container">
                    <table className="shops-financial-table">
                        <thead>
                            <tr>
                                <th>Shop Name</th>
                                <th>Package</th>
                                <th>Monthly Revenue</th>
                                <th>Yearly Revenue</th>
                                <th>Pending Amount</th>
                                <th>Total Paid</th>
                                <th>Last Payment</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredShops.map(shop => {
                                const lastPayment = shop.paymentHistory[0];
                                return (
                                    <tr 
                                        key={shop.id} 
                                        className={selectedShop?.id === shop.id ? 'selected' : ''}
                                        onClick={() => handleSelectShop(shop)}
                                    >
                                        <td>
                                            <div className="shop-info">
                                                <div>
                                                    <strong>{shop.name}</strong>
                                                    <small>{shop.owner}</small>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`package-badge ${shop.package.toLowerCase()}`}>
                                                {shop.package}
                                            </span>
                                        </td>
                                        <td className="revenue-cell">
                                            <div className="revenue-with-trend">
                                                <span>{shop.monthlyRevenue.toLocaleString()} Ks</span>
                                                <span className="trend-up">
                                                    <i className="fas fa-arrow-up"></i> 12%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="revenue-cell">
                                            {shop.yearlyRevenue.toLocaleString()} Ks
                                        </td>
                                        <td className={shop.pendingAmount > 0 ? 'pending-cell' : 'paid-cell'}>
                                            <div className="amount-with-status">
                                                {shop.pendingAmount > 0 ? (
                                                    <>
                                                        <i className="fas fa-exclamation-triangle warning-icon"></i>
                                                        <span>{shop.pendingAmount.toLocaleString()} Ks</span>
                                                        <span className="overdue-badge">Overdue</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <i className="fas fa-check-circle success-icon"></i>
                                                        <span>0 Ks</span>
                                                    </>
                                                )}
                                            </div>
                                        </td>
                                        <td className="paid-cell">
                                            <div className="paid-amount">
                                                {shop.totalPaid.toLocaleString()} Ks
                                                <div className="progress-bar">
                                                    <div 
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${Math.min((shop.totalPaid / shop.yearlyRevenue) * 100, 100)}%`
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            {lastPayment ? (
                                                <div className="last-payment">
                                                    <div className="date">{lastPayment.date}</div>
                                                    <div className="amount">{lastPayment.amount.toLocaleString()} Ks</div>
                                                </div>
                                            ) : (
                                                <span className="no-payment">No payments yet</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                {shop.pendingAmount > 0 ? (
                                                    <button 
                                                        className="btn-receive-payment"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleReceivePayment(shop.id, shop.pendingAmount);
                                                        }}
                                                    >
                                                        <i className="fas fa-credit-card"></i> Receive
                                                    </button>
                                                ) : (
                                                    <span className="fully-paid">Fully Paid</span>
                                                )}
                                                <button 
                                                    className="btn-view-details"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleSelectShop(shop);
                                                    }}
                                                >
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Selected Shop Details */}
            {selectedShop && (
                <div className="selected-shop-details">
                    <div className="details-header">
                        <h3>
                            <i className="fas fa-file-invoice-dollar"></i> 
                            Payment History: {selectedShop.name}
                        </h3>
                        <button 
                            className="btn-close"
                            onClick={() => setSelectedShop(null)}
                        >
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                    
                    <div className="payment-history">
                        <table>
                            <thead>
                                <tr>
                                    <th>Date</th>
                                    <th>Amount</th>
                                    <th>Status</th>
                                    <th>Invoice</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedShop.paymentHistory.map((payment, index) => (
                                    <tr key={index}>
                                        <td>{payment.date}</td>
                                        <td className="amount-cell">
                                            {payment.amount.toLocaleString()} Ks
                                        </td>
                                        <td>
                                            <span className={`status-badge ${payment.status.toLowerCase()}`}>
                                                {payment.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-invoice">
                                                <i className="fas fa-download"></i> Download
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    <div className="shop-summary">
                        <div className="summary-item">
                            <h4>Total Paid This Year</h4>
                            <h2>{selectedShop.totalPaid.toLocaleString()} Ks</h2>
                        </div>
                        <div className="summary-item">
                            <h4>Pending Amount</h4>
                            <h2 className={selectedShop.pendingAmount > 0 ? 'warning' : 'success'}>
                                {selectedShop.pendingAmount.toLocaleString()} Ks
                            </h2>
                        </div>
                        <div className="summary-item">
                            <h4>Next Due Date</h4>
                            <h2>2024-02-15</h2>
                        </div>
                        <div className="summary-item">
                            <h4>Average Monthly Payment</h4>
                            <h2>{(selectedShop.totalPaid / selectedShop.paymentHistory.length).toLocaleString()} Ks</h2>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default FinancialAnalyticsPage;