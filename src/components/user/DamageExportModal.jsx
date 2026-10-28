// DamageExportModal.jsx
import React, { useState } from 'react';
import "../../light-style/user-css/userDamagePage.css";

const DamageExportModal = ({ show, onClose, onExport, loading, language }) => {
  const [exportType, setExportType] = useState('both'); // 'damages', 'logs', 'both'

  if (!show) return null;

  const handleExport = () => {
    onExport(exportType);
  };

  return (
    <div className="damage-modal-overlay">
      <div className="damage-modal-content" style={{ maxWidth: '450px' }}>
        <div className="damage-modal-header">
          <h3>
            <i className="fas fa-file-export" style={{ color: '#10b981' }}></i>
            {language === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
          </h3>
          <button className="damage-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="damage-modal-body">
          <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
            {language === 'mm' 
              ? 'တင်ပို့လိုသော ဒေတာအမျိုးအစားကို ရွေးချယ်ပါ။' 
              : 'Select the type of data you want to export.'}
          </p>

          <div className="damage-export-options">
            {/* ===== Damages Option ===== */}
            <div 
              className={`damage-export-option ${exportType === 'damages' ? 'selected' : ''}`}
              onClick={() => setExportType('damages')}
            >
              <div className="damage-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="damages" 
                  checked={exportType === 'damages'} 
                  onChange={() => setExportType('damages')}
                />
                <div className="damage-export-radio-custom"></div>
              </div>
              <div className="damage-export-option-content">
                <i className="fas fa-exclamation-triangle" style={{ color: '#f72585' }}></i>
                <div>
                  <div className="damage-export-option-title">
                    {language === 'mm' ? 'ပျက်စီးမှုများ' : 'Damages'}
                  </div>
                  <div className="damage-export-option-desc">
                    {language === 'mm' ? 'ပျက်စီးမှုစာရင်းအားလုံး' : 'All damage records'}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Logs Option ===== */}
            <div 
              className={`damage-export-option ${exportType === 'logs' ? 'selected' : ''}`}
              onClick={() => setExportType('logs')}
            >
              <div className="damage-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="logs" 
                  checked={exportType === 'logs'} 
                  onChange={() => setExportType('logs')}
                />
                <div className="damage-export-radio-custom"></div>
              </div>
              <div className="damage-export-option-content">
                <i className="fas fa-history" style={{ color: '#f59e0b' }}></i>
                <div>
                  <div className="damage-export-option-title">
                    {language === 'mm' ? 'မှတ်တမ်းများ' : 'Logs'}
                  </div>
                  <div className="damage-export-option-desc">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်းအားလုံး' : 'All activity logs'}
                  </div>
                </div>
              </div>
            </div>

            {/* ===== Both Option ===== */}
            <div 
              className={`damage-export-option ${exportType === 'both' ? 'selected' : ''}`}
              onClick={() => setExportType('both')}
            >
              <div className="damage-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="both" 
                  checked={exportType === 'both'} 
                  onChange={() => setExportType('both')}
                />
                <div className="damage-export-radio-custom"></div>
              </div>
              <div className="damage-export-option-content">
                <i className="fas fa-layer-group" style={{ color: '#8b5cf6' }}></i>
                <div>
                  <div className="damage-export-option-title">
                    {language === 'mm' ? 'အားလုံး' : 'Both'}
                  </div>
                  <div className="damage-export-option-desc">
                    {language === 'mm' ? 'ပျက်စီးမှုနှင့် မှတ်တမ်းနှစ်ခုလုံး' : 'Both damages and logs'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="damage-modal-footer">
          <button className="damage-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button 
            className={`damage-btn-submit ${loading ? 'loading' : ''}`}
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

export default DamageExportModal;