// src/components/user/ExpenseDetailModal.jsx
import React, { useState } from 'react';
import "../../light-style/user-css/ExpenseDetailModal.css";
import ExpenseReport from './ExpenseReport';  // ✅ Import ExpenseReport

const ExpenseDetailModal = ({ expenses, language, formatMoney, onClose }) => {
    // ===== NEW: State for Report Modal =====
    const [showReport, setShowReport] = useState(false);

    // Group by category
    const groupByCategory = (expenses) => {
        const grouped = {};
        expenses.forEach(exp => {
            if (!grouped[exp.category]) {
                grouped[exp.category] = [];
            }
            grouped[exp.category].push(exp);
        });
        return grouped;
    };

    const groupedExpenses = groupByCategory(expenses);
    const totalAmount = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);

    // Category color mapping
    const getCategoryColor = (category) => {
        const colors = {
            'Salary': '#4361ee',
            'Rent': '#f72585',
            'Utilities': '#f8961e',
            'Software': '#4cc9f0',
            'Equipment': '#2ecc71',
            'Supplies': '#9b59b6',
            'Marketing': '#e74c3c',
            'Transport': '#f39c12',
            'Food': '#e67e22',
            'Insurance': '#1abc9c',
            'Tax': '#c0392b',
            'Maintenance': '#34495e',
            'Depreciation': '#8e44ad',
            'Other': '#95a5a6'
        };
        return colors[category] || '#95a5a6';
    };

    // ===== NEW: Open Report =====
    const openReport = () => {
        setShowReport(true);
    };

    return (
        <>
            {/* ===== Main Modal ===== */}
            <div className="expense-detail-modal-overlay" onClick={onClose}>
                <div className="expense-detail-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="expense-detail-modal-header">
                        <h2>
                            <i className="fas fa-money-bill-wave" style={{ color: '#e67e22' }}></i>
                            {language === 'mm' ? 'အထွေထွေကုန်ကျစရိတ်အသေးစိတ်' : 'General Expenses Details'}
                        </h2>
                        <div className="expense-detail-modal-actions">
                            {/* ===== NEW: Report Button ===== */}
                            <button 
                                className="expense-detail-report-btn"
                                onClick={openReport}
                                title={language === 'mm' ? 'အစီရင်ခံစာကြည့်ရန်' : 'View Report'}
                            >
                                <i className="fas fa-file-alt"></i>
                                {language === 'mm' ? 'အစီရင်ခံစာ' : 'Report'}
                            </button>
                            <button className="expense-detail-modal-close" onClick={onClose}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                    </div>

                    <div className="expense-detail-modal-body">
                        {/* Summary */}
                        <div className="expense-summary-banner">
                            <div className="expense-summary-total">
                                <span className="expense-summary-label">
                                    {language === 'mm' ? 'စုစုပေါင်းကုန်ကျစရိတ်' : 'Total Expenses'}
                                </span>
                                <span className="expense-summary-amount">{formatMoney(totalAmount)}</span>
                            </div>
                            <div className="expense-summary-count">
                                <span className="expense-summary-label">
                                    {language === 'mm' ? 'စုစုပေါင်းအရေအတွက်' : 'Total Items'}
                                </span>
                                <span className="expense-summary-number">{expenses.length}</span>
                            </div>
                        </div>

                        {/* Grouped by Category */}
                        {Object.keys(groupedExpenses).length > 0 ? (
                            Object.entries(groupedExpenses).map(([category, items]) => (
                                <div key={category} className="expense-category-group">
                                    <div className="expense-category-header" style={{ borderLeftColor: getCategoryColor(category) }}>
                                        <span className="expense-category-name">{category}</span>
                                        <span className="expense-category-total">
                                            {formatMoney(items.reduce((sum, item) => sum + (item.amount || 0), 0))}
                                        </span>
                                        <span className="expense-category-count">({items.length})</span>
                                    </div>
                                    <div className="expense-items-list">
                                        {items.map((expense, idx) => (
                                            <div key={expense.id || idx} className="expense-item">
                                                <div className="expense-item-info">
                                                    <div className="expense-item-title">{expense.title || 'N/A'}</div>
                                                    {expense.subCategory && (
                                                        <div className="expense-item-subcategory">
                                                            <i className="fas fa-tag"></i> {expense.subCategory}
                                                        </div>
                                                    )}
                                                    {expense.vendor && (
                                                        <div className="expense-item-vendor">
                                                            <i className="fas fa-building"></i> {expense.vendor}
                                                        </div>
                                                    )}
                                                    {expense.description && (
                                                        <div className="expense-item-description">{expense.description}</div>
                                                    )}
                                                    <div className="expense-item-meta">
                                                        <span className="expense-item-date">
                                                            <i className="fas fa-calendar"></i> {expense.expenseDate || 'N/A'}
                                                        </span>
                                                        <span className={`expense-item-status status-${expense.status?.toLowerCase() || 'pending'}`}>
                                                            {expense.status || 'Pending'}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="expense-item-amount">
                                                    {formatMoney(expense.amount || 0)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="expense-detail-empty">
                                <i className="fas fa-inbox"></i>
                                <p>{language === 'mm' ? 'ကုန်ကျစရိတ်မရှိပါ' : 'No expenses found'}</p>
                            </div>
                        )}
                    </div>

                    <div className="expense-detail-modal-footer">
                        <button className="expense-detail-btn-close" onClick={onClose}>
                            {language === 'mm' ? 'ပိတ်မည်' : 'Close'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== NEW: ExpenseReport Modal ===== */}
            {showReport && (
                <ExpenseReport
                    expenses={expenses}
                    language={language}
                    formatMoney={formatMoney}
                    onClose={() => setShowReport(false)}
                />
            )}
        </>
    );
};

export default ExpenseDetailModal;