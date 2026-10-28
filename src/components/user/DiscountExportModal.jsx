// DiscountExportModal.jsx
import React, { useState } from 'react';
import "../../light-style/user-css/userDiscountPage.css";

const DiscountExportModal = ({ show, onClose, onExport, loading, language }) => {
  const [exportType, setExportType] = useState('both'); // 'discounts', 'logs', 'both'

  if (!show) return null;

  const handleExport = () => {
    onExport(exportType);
  };

  return (
    <div className="disc-modal-overlay">
      <div className="disc-modal-content" style={{ maxWidth: '450px' }}>
        <div className="disc-modal-header">
          <h3>
            <i className="fas fa-file-export" style={{ color: '#10b981' }}></i>
            {language === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
          </h3>
          <button className="disc-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="disc-modal-body">
          <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
            {language === 'mm' 
              ? 'တင်ပို့လိုသော ဒေတာအမျိုးအစားကို ရွေးချယ်ပါ။' 
              : 'Select the type of data you want to export.'}
          </p>

          <div className="disc-export-options">
            <div 
              className={`disc-export-option ${exportType === 'discounts' ? 'selected' : ''}`}
              onClick={() => setExportType('discounts')}
            >
              <div className="disc-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="discounts" 
                  checked={exportType === 'discounts'} 
                  onChange={() => setExportType('discounts')}
                />
                <div className="disc-export-radio-custom"></div>
              </div>
              <div className="disc-export-option-content">
                <i className="fas fa-tags" style={{ color: '#4361ee' }}></i>
                <div>
                  <div className="disc-export-option-title">
                    {language === 'mm' ? 'လျှော့ဈေးများ' : 'Discounts'}
                  </div>
                  <div className="disc-export-option-desc">
                    {language === 'mm' ? 'လျှော့ဈေးစာရင်းအားလုံး' : 'All discount list'}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`disc-export-option ${exportType === 'logs' ? 'selected' : ''}`}
              onClick={() => setExportType('logs')}
            >
              <div className="disc-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="logs" 
                  checked={exportType === 'logs'} 
                  onChange={() => setExportType('logs')}
                />
                <div className="disc-export-radio-custom"></div>
              </div>
              <div className="disc-export-option-content">
                <i className="fas fa-history" style={{ color: '#f59e0b' }}></i>
                <div>
                  <div className="disc-export-option-title">
                    {language === 'mm' ? 'မှတ်တမ်းများ' : 'Logs'}
                  </div>
                  <div className="disc-export-option-desc">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်းအားလုံး' : 'All activity logs'}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`disc-export-option ${exportType === 'both' ? 'selected' : ''}`}
              onClick={() => setExportType('both')}
            >
              <div className="disc-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="both" 
                  checked={exportType === 'both'} 
                  onChange={() => setExportType('both')}
                />
                <div className="disc-export-radio-custom"></div>
              </div>
              <div className="disc-export-option-content">
                <i className="fas fa-layer-group" style={{ color: '#8b5cf6' }}></i>
                <div>
                  <div className="disc-export-option-title">
                    {language === 'mm' ? 'အားလုံး' : 'Both'}
                  </div>
                  <div className="disc-export-option-desc">
                    {language === 'mm' ? 'လျှော့ဈေးနှင့် မှတ်တမ်းနှစ်ခုလုံး' : 'Both discounts and logs'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="disc-modal-footer">
          <button className="disc-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button 
            className={`disc-btn-submit ${loading ? 'loading' : ''}`}
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

export default DiscountExportModal;