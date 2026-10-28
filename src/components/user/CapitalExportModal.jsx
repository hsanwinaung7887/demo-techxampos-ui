// CapitalExportModal.jsx
import React, { useState } from 'react';
import "../../light-style/user-css/capitalPage.css";

const CapitalExportModal = ({ show, onClose, onExport, loading, language }) => {
  const [exportType, setExportType] = useState('both'); // 'transactions', 'logs', 'both'

  if (!show) return null;

  const handleExport = () => {
    onExport(exportType);
  };

  return (
    <div className="capital-modal-overlay">
      <div className="capital-modal-content" style={{ maxWidth: '450px' }}>
        <div className="capital-modal-header">
          <h3>
            <i className="fas fa-file-export" style={{ color: '#10b981' }}></i>
            {language === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
          </h3>
          <button className="capital-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="capital-detail-body">
          <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
            {language === 'mm' 
              ? 'တင်ပို့လိုသော ဒေတာအမျိုးအစားကို ရွေးချယ်ပါ။' 
              : 'Select the type of data you want to export.'}
          </p>

          <div className="capital-export-options">
            {/* ===== Transactions Option ===== */}
            <div 
              className={`capital-export-option ${exportType === 'transactions' ? 'selected' : ''}`}
              onClick={() => setExportType('transactions')}
            >
              <div className="capital-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="transactions" 
                  checked={exportType === 'transactions'} 
                  onChange={() => setExportType('transactions')}
                />
                <div className="capital-export-radio-custom"></div>
              </div>
              <div className="capital-export-option-content">
                <i className="fas fa-coins" style={{ color: '#10b981' }}></i>
                <div>
                  <div className="capital-export-option-title">
                    {language === 'mm' ? 'မတည်ငွေလွှဲပြောင်းမှုများ' : 'Transactions'}
                  </div>
                  <div className="capital-export-option-desc">
                    {language === 'mm' ? 'လွှဲပြောင်းမှုစာရင်းအားလုံး' : 'All transaction records'}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Logs Option ===== */}
            <div 
              className={`capital-export-option ${exportType === 'logs' ? 'selected' : ''}`}
              onClick={() => setExportType('logs')}
            >
              <div className="capital-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="logs" 
                  checked={exportType === 'logs'} 
                  onChange={() => setExportType('logs')}
                />
                <div className="capital-export-radio-custom"></div>
              </div>
              <div className="capital-export-option-content">
                <i className="fas fa-history" style={{ color: '#f59e0b' }}></i>
                <div>
                  <div className="capital-export-option-title">
                    {language === 'mm' ? 'မှတ်တမ်းများ' : 'Logs'}
                  </div>
                  <div className="capital-export-option-desc">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်းအားလုံး' : 'All activity logs'}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Both Option ===== */}
            <div 
              className={`capital-export-option ${exportType === 'both' ? 'selected' : ''}`}
              onClick={() => setExportType('both')}
            >
              <div className="capital-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="both" 
                  checked={exportType === 'both'} 
                  onChange={() => setExportType('both')}
                />
                <div className="capital-export-radio-custom"></div>
              </div>
              <div className="capital-export-option-content">
                <i className="fas fa-layer-group" style={{ color: '#8b5cf6' }}></i>
                <div>
                  <div className="capital-export-option-title">
                    {language === 'mm' ? 'အားလုံး' : 'Both'}
                  </div>
                  <div className="capital-export-option-desc">
                    {language === 'mm' ? 'လွှဲပြောင်းမှုနှင့် မှတ်တမ်းနှစ်ခုလုံး' : 'Both transactions and logs'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="capital-modal-footer">
          <button className="capital-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button 
            className={`capital-btn-submit ${loading ? 'loading' : ''}`}
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

export default CapitalExportModal;