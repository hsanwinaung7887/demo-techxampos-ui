// UserExpenseExportModal.jsx
import React, { useState } from 'react';
import "../../light-style/user-css/userExpensePage.css";

const UserExpenseExportModal = ({ show, onClose, onExport, loading, language }) => {
  const [exportType, setExportType] = useState('both'); // 'expenses', 'logs', 'both'

  if (!show) return null;

  const handleExport = () => {
    onExport(exportType);
  };

  return (
    <div className="expense-modal-overlay">
      <div className="expense-modal-content" style={{ maxWidth: '450px' }}>
        <div className="expense-modal-header">
          <h3>
            <i className="fas fa-file-export" style={{ color: '#10b981' }}></i>
            {language === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
          </h3>
          <button className="expense-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="expense-modal-body">
          <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
            {language === 'mm' 
              ? 'တင်ပို့လိုသော ဒေတာအမျိုးအစားကို ရွေးချယ်ပါ။' 
              : 'Select the type of data you want to export.'}
          </p>

          <div className="expense-export-options">
            {/* ===== Expenses Option ===== */}
            <div 
              className={`expense-export-option ${exportType === 'expenses' ? 'selected' : ''}`}
              onClick={() => setExportType('expenses')}
            >
              <div className="expense-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="expenses" 
                  checked={exportType === 'expenses'} 
                  onChange={() => setExportType('expenses')}
                />
                <div className="expense-export-radio-custom"></div>
              </div>
              <div className="expense-export-option-content">
                <i className="fas fa-money-bill-wave" style={{ color: '#10b981' }}></i>
                <div>
                  <div className="expense-export-option-title">
                    {language === 'mm' ? 'ကုန်ကျစရိတ်များ' : 'Expenses'}
                  </div>
                  <div className="expense-export-option-desc">
                    {language === 'mm' ? 'ကုန်ကျစရိတ်စာရင်းအားလုံး' : 'All expense records'}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Logs Option ===== */}
            <div 
              className={`expense-export-option ${exportType === 'logs' ? 'selected' : ''}`}
              onClick={() => setExportType('logs')}
            >
              <div className="expense-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="logs" 
                  checked={exportType === 'logs'} 
                  onChange={() => setExportType('logs')}
                />
                <div className="expense-export-radio-custom"></div>
              </div>
              <div className="expense-export-option-content">
                <i className="fas fa-history" style={{ color: '#f59e0b' }}></i>
                <div>
                  <div className="expense-export-option-title">
                    {language === 'mm' ? 'မှတ်တမ်းများ' : 'Logs'}
                  </div>
                  <div className="expense-export-option-desc">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်းအားလုံး' : 'All activity logs'}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Both Option ===== */}
            <div 
              className={`expense-export-option ${exportType === 'both' ? 'selected' : ''}`}
              onClick={() => setExportType('both')}
            >
              <div className="expense-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="both" 
                  checked={exportType === 'both'} 
                  onChange={() => setExportType('both')}
                />
                <div className="expense-export-radio-custom"></div>
              </div>
              <div className="expense-export-option-content">
                <i className="fas fa-layer-group" style={{ color: '#8b5cf6' }}></i>
                <div>
                  <div className="expense-export-option-title">
                    {language === 'mm' ? 'အားလုံး' : 'Both'}
                  </div>
                  <div className="expense-export-option-desc">
                    {language === 'mm' ? 'ကုန်ကျစရိတ်နှင့် မှတ်တမ်းနှစ်ခုလုံး' : 'Both expenses and logs'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="expense-modal-footer">
          <button className="expense-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button 
            className={`expense-btn-submit ${loading ? 'loading' : ''}`}
            onClick={handleExport}
            disabled={loading}
            style={{ backgroundColor: '#10b981' }}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {language === 'mm' ? 'တင်ပို့နေသည်...' : 'Exporting...'}
              </>
            ) : (
              <>
                <i className="fas fa-file-excel"></i>
                {language === 'mm' ? 'Excel တင်ပို့မည်' : 'Export to Excel'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserExpenseExportModal;