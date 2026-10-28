// src/components/user/ExpenseReport.jsx
import React, { useRef, useState, useEffect } from 'react';
import "../../light-style/user-css/ExpenseReport.css";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const ExpenseReport = ({ expenses, language, formatMoney, onClose }) => {
    const reportRef = useRef(null);
    const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
    
    // ===== Date Range States =====
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [filteredExpenses, setFilteredExpenses] = useState(expenses);
    const [isFiltered, setIsFiltered] = useState(false);

    // ===== Group expenses by month =====
    const groupByMonth = (expenses) => {
        const grouped = {};
        expenses.forEach(exp => {
            if (!exp.expenseDate) return;
            const date = new Date(exp.expenseDate);
            const monthKey = date.toLocaleDateString(language === 'mm' ? 'my-MM' : 'en-US', {
                year: 'numeric',
                month: 'long'
            });
            if (!grouped[monthKey]) {
                grouped[monthKey] = [];
            }
            grouped[monthKey].push(exp);
        });
        return grouped;
    };

    // ===== Filter by date range =====
    const handleFilter = () => {
        if (!startDate || !endDate) {
            alert(language === 'mm' ? 'စတင်ရက်နှင့် ပြီးဆုံးရက် ရွေးချယ်ပါ' : 'Please select start and end date');
            return;
        }

        if (new Date(startDate) > new Date(endDate)) {
            alert(language === 'mm' ? 'စတင်ရက်သည် ပြီးဆုံးရက်ထက် နောက်မကျရပါ' : 'Start date cannot be after end date');
            return;
        }

        const filtered = expenses.filter(exp => {
            if (!exp.expenseDate) return false;
            const expDate = new Date(exp.expenseDate);
            const start = new Date(startDate);
            const end = new Date(endDate);
            // Set time to midnight for accurate comparison
            start.setHours(0, 0, 0, 0);
            end.setHours(23, 59, 59, 999);
            return expDate >= start && expDate <= end;
        });

        setFilteredExpenses(filtered);
        setIsFiltered(true);
    };

    // ===== Reset filter =====
    const handleReset = () => {
        setFilteredExpenses(expenses);
        setIsFiltered(false);
        setStartDate('');
        setEndDate('');
    };

    // ===== Group filtered expenses by month =====
    const groupedExpenses = groupByMonth(filteredExpenses);
    const totalAmount = filteredExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
    const totalItems = filteredExpenses.length;

    // ===== Format date =====
    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const d = new Date(dateStr);
        return d.toLocaleDateString(language === 'mm' ? 'my-MM' : 'en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // ===== Category color mapping =====
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

    // ===== Format date for report =====
    const formatReportDate = () => {
        const now = new Date();
        return now.toLocaleDateString(language === 'mm' ? 'my-MM' : 'en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ============================================================
    // PDF Download - One page per month
    // ============================================================
    const downloadAsPDF = async () => {
        if (!reportRef.current || isGeneratingPDF) return;
        setIsGeneratingPDF(true);

        try {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 15;

            // Get all month sections
            const monthSections = reportRef.current.querySelectorAll('.expense-month-group');
            const monthCount = monthSections.length;

            for (let i = 0; i < monthCount; i++) {
                if (i > 0) {
                    pdf.addPage();
                }

                // Create a temporary container for this month only
                const tempContainer = document.createElement('div');
                tempContainer.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    top: 0;
                    width: ${pageWidth - margin * 2}mm;
                    background: white;
                    padding: 10mm;
                    font-family: 'Pyidaungsu', 'Arial', sans-serif;
                `;
                
                // Clone the month section
                const clone = monthSections[i].cloneNode(true);
                tempContainer.appendChild(clone);
                document.body.appendChild(tempContainer);

                // Capture the page
                const canvas = await html2canvas(tempContainer, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false,
                    allowTaint: false,
                    useCORS: true,
                    windowWidth: (pageWidth - margin * 2) * 3.78,
                    windowHeight: (pageHeight - margin * 2) * 3.78
                });

                // Remove temp container
                document.body.removeChild(tempContainer);

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;

                // Center vertically if image is shorter than page
                const yPos = (pageHeight - imgHeight) / 2;

                pdf.addImage(imgData, 'PNG', margin, yPos > margin ? yPos : margin, imgWidth, imgHeight);
            }

            // If no expenses found
            if (monthCount === 0) {
                // Create a single page with "No expenses found" message
                const tempContainer = document.createElement('div');
                tempContainer.style.cssText = `
                    position: absolute;
                    left: -9999px;
                    top: 0;
                    width: 180mm;
                    background: white;
                    padding: 20mm;
                    font-family: 'Pyidaungsu', 'Arial', sans-serif;
                    text-align: center;
                `;
                tempContainer.innerHTML = `
                    <h2 style="color:#2c3e50;">${language === 'mm' ? 'ကုန်ကျစရိတ်မရှိပါ' : 'No Expenses Found'}</h2>
                    <p style="color:#7f8c8d;">${language === 'mm' ? 'ရွေးချယ်ထားသော ကာလအတွင်း ကုန်ကျစရိတ်များ မတွေ့ပါ။' : 'No expenses found for the selected period.'}</p>
                `;
                document.body.appendChild(tempContainer);

                const canvas = await html2canvas(tempContainer, {
                    scale: 2,
                    backgroundColor: '#ffffff',
                    logging: false
                });
                document.body.removeChild(tempContainer);

                const imgData = canvas.toDataURL('image/png');
                const imgWidth = pageWidth - (margin * 2);
                const imgHeight = (canvas.height * imgWidth) / canvas.width;
                const yPos = (pageHeight - imgHeight) / 2;
                pdf.addImage(imgData, 'PNG', margin, yPos > margin ? yPos : margin, imgWidth, imgHeight);
            }

            pdf.save(`expense-report-${new Date().toISOString().split('T')[0]}.pdf`);

        } catch (error) {
            console.error('Error generating PDF:', error);
            alert(language === 'mm' ? 'PDF ထုတ်ရာတွင် အဆင်မပြေပါ။' : 'Failed to generate PDF.');
        } finally {
            setIsGeneratingPDF(false);
        }
    };

    // ============================================================
    // PNG Download (One page - all months combined)
    // ============================================================
    const downloadAsPNG = async () => {
        if (!reportRef.current) return;

        try {
            const element = reportRef.current;
            const canvas = await html2canvas(element, {
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: false,
                useCORS: true,
                windowWidth: element.scrollWidth,
                windowHeight: element.scrollHeight
            });

            const link = document.createElement('a');
            link.download = `expense-report-${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

        } catch (error) {
            console.error('Error generating PNG:', error);
            alert(language === 'mm' ? 'PNG ထုတ်ရာတွင် အဆင်မပြေပါ။' : 'Failed to generate PNG.');
        }
    };

    return (
        <div className="expense-report-modal-overlay" onClick={onClose}>
            <div className="expense-report-modal" onClick={(e) => e.stopPropagation()}>
                {/* ===== Header ===== */}
                <div className="expense-report-modal-header">
                    <h2>
                        <i className="fas fa-file-alt" style={{ color: '#e67e22' }}></i>
                        {language === 'mm' ? 'ကုန်ကျစရိတ် အစီရင်ခံစာ' : 'Expense Report'}
                    </h2>
                    <div className="expense-report-modal-actions">
                        <button 
                            className="expense-report-download-btn pdf"
                            onClick={downloadAsPDF}
                            disabled={isGeneratingPDF}
                        >
                            <i className="fas fa-file-pdf"></i>
                            {isGeneratingPDF 
                                ? (language === 'mm' ? 'ထုတ်နေသည်...' : 'Generating...')
                                : (language === 'mm' ? 'PDF ထုတ်ရန်' : 'Download PDF')}
                        </button>
                        <button 
                            className="expense-report-download-btn png"
                            onClick={downloadAsPNG}
                        >
                            <i className="fas fa-image"></i>
                            {language === 'mm' ? 'PNG ထုတ်ရန်' : 'Download PNG'}
                        </button>
                        <button className="expense-report-close-btn" onClick={onClose}>
                            <i className="fas fa-times"></i>
                        </button>
                    </div>
                </div>

                {/* ===== Filter Section ===== */}
                <div className="expense-report-filter-section">
                    <div className="expense-report-filter-row">
                        <div className="expense-report-filter-group">
                            <label>{language === 'mm' ? 'မှ' : 'From'}</label>
                            <input 
                                type="date" 
                                className="expense-report-date-input"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                            />
                        </div>
                        <div className="expense-report-filter-group">
                            <label>{language === 'mm' ? 'ထိ' : 'To'}</label>
                            <input 
                                type="date" 
                                className="expense-report-date-input"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                            />
                        </div>
                        <button 
                            className="expense-report-filter-btn apply"
                            onClick={handleFilter}
                        >
                            <i className="fas fa-filter"></i>
                            {language === 'mm' ? 'စစ်ထုတ်ရန်' : 'Filter'}
                        </button>
                        {isFiltered && (
                            <button 
                                className="expense-report-filter-btn reset"
                                onClick={handleReset}
                            >
                                <i className="fas fa-undo"></i>
                                {language === 'mm' ? 'ပြန်လည်သတ်မှတ်' : 'Reset'}
                            </button>
                        )}
                    </div>
                    {isFiltered && (
                        <div className="expense-report-filter-info">
                            <i className="fas fa-info-circle"></i>
                            {language === 'mm' 
                                ? `ပြသခြင်း: ${formatDate(startDate)} မှ ${formatDate(endDate)} အထိ (${totalItems} items)`
                                : `Showing: ${formatDate(startDate)} to ${formatDate(endDate)} (${totalItems} items)`}
                        </div>
                    )}
                </div>

                {/* ===== Report Body ===== */}
                <div className="expense-report-modal-body" ref={reportRef}>
                    {/* Report Header */}
                    <div className="expense-report-header">
                        <h1 className="expense-report-title">
                            {language === 'mm' ? 'ကုန်ကျစရိတ် အစီရင်ခံစာ' : 'Expense Report'}
                            {isFiltered && (
                                <span className="expense-report-period">
                                    {formatDate(startDate)} - {formatDate(endDate)}
                                </span>
                            )}
                        </h1>
                        <p className="expense-report-date">{formatReportDate()}</p>
                    </div>

                    {/* Summary */}
                    <div className="expense-report-summary">
                        <div className="expense-report-summary-item">
                            <span className="expense-report-summary-label">
                                {language === 'mm' ? 'စုစုပေါင်းကုန်ကျစရိတ်' : 'Total Expenses'}
                            </span>
                            <span className="expense-report-summary-value">{formatMoney(totalAmount)}</span>
                        </div>
                        <div className="expense-report-summary-item">
                            <span className="expense-report-summary-label">
                                {language === 'mm' ? 'စုစုပေါင်းအရေအတွက်' : 'Total Items'}
                            </span>
                            <span className="expense-report-summary-value">{totalItems}</span>
                        </div>
                        <div className="expense-report-summary-item">
                            <span className="expense-report-summary-label">
                                {language === 'mm' ? 'လများ' : 'Months'}
                            </span>
                            <span className="expense-report-summary-value">
                                {Object.keys(groupedExpenses).length}
                            </span>
                        </div>
                    </div>

                    {/* ===== Group by Month - Each month as a page ===== */}
                    {Object.keys(groupedExpenses).length > 0 ? (
                        Object.entries(groupedExpenses).map(([month, monthExpenses]) => {
                            const monthTotal = monthExpenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
                            
                            return (
                                <div key={month} className="expense-month-group">
                                    <div className="expense-month-header">
                                        <h3 className="expense-month-title">
                                            <i className="fas fa-calendar-alt"></i>
                                            {month}
                                        </h3>
                                        <span className="expense-month-total">
                                            {language === 'mm' ? 'စုစုပေါင်း' : 'Total'}: {formatMoney(monthTotal)}
                                        </span>
                                        <span className="expense-month-count">
                                            ({monthExpenses.length} {language === 'mm' ? 'ခု' : 'items'})
                                        </span>
                                    </div>

                                    {/* Group by category within month */}
                                    {(() => {
                                        const categoryGroups = {};
                                        monthExpenses.forEach(exp => {
                                            if (!categoryGroups[exp.category]) {
                                                categoryGroups[exp.category] = [];
                                            }
                                            categoryGroups[exp.category].push(exp);
                                        });

                                        return Object.entries(categoryGroups).map(([category, items]) => (
                                            <div key={category} className="expense-report-category-group">
                                                <div className="expense-report-category-header" style={{ borderLeftColor: getCategoryColor(category) }}>
                                                    <span className="expense-report-category-name">{category}</span>
                                                    <span className="expense-report-category-total">
                                                        {formatMoney(items.reduce((sum, item) => sum + (item.amount || 0), 0))}
                                                    </span>
                                                    <span className="expense-report-category-count">({items.length})</span>
                                                </div>
                                                <div className="expense-report-items-list">
                                                    {items.map((expense, idx) => (
                                                        <div key={expense.id || idx} className="expense-report-item">
                                                            <div className="expense-report-item-info">
                                                                <div className="expense-report-item-title">{expense.title || 'N/A'}</div>
                                                                {expense.subCategory && (
                                                                    <div className="expense-report-item-subcategory">
                                                                        <i className="fas fa-tag"></i> {expense.subCategory}
                                                                    </div>
                                                                )}
                                                                {expense.vendor && (
                                                                    <div className="expense-report-item-vendor">
                                                                        <i className="fas fa-building"></i> {expense.vendor}
                                                                    </div>
                                                                )}
                                                                {expense.description && (
                                                                    <div className="expense-report-item-description">{expense.description}</div>
                                                                )}
                                                                <div className="expense-report-item-meta">
                                                                    <span className="expense-report-item-date">
                                                                        <i className="fas fa-calendar"></i> {formatDate(expense.expenseDate)}
                                                                    </span>
                                                                    <span className={`expense-report-item-status status-${expense.status?.toLowerCase() || 'pending'}`}>
                                                                        {expense.status || 'Pending'}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                            <div className="expense-report-item-amount">
                                                                {formatMoney(expense.amount || 0)}
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ));
                                    })()}
                                </div>
                            );
                        })
                    ) : (
                        <div className="expense-report-empty">
                            <i className="fas fa-inbox"></i>
                            <p>{language === 'mm' ? 'ကုန်ကျစရိတ်မရှိပါ' : 'No expenses found'}</p>
                        </div>
                    )}

                    {/* Report Footer */}
                    <div className="expense-report-footer">
                        <p>
                            {language === 'mm' ? 'ထုတ်ယူသည့်ရက်စွဲ' : 'Generated on'}: {formatReportDate()}
                            {isFiltered && ` | ${formatDate(startDate)} - ${formatDate(endDate)}`}
                        </p>
                    </div>
                </div>

                {/* ===== Footer ===== */}
                <div className="expense-report-modal-footer">
                    <button className="expense-report-btn-close" onClick={onClose}>
                        {language === 'mm' ? 'ပိတ်မည်' : 'Close'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseReport;