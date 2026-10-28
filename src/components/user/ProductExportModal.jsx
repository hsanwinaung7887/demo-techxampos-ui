// ProductExportModal.jsx
import React, { useState } from 'react';
import "../../light-style/user-css/userProductPage.css";

const ProductExportModal = ({ show, onClose, onExport, loading, language }) => {
  const [exportType, setExportType] = useState('both'); // 'products', 'logs', 'both'

  if (!show) return null;

  const handleExport = () => {
    onExport(exportType);
  };

  return (
    <div className="prod-modal-overlay">
      <div className="prod-modal-content" style={{ maxWidth: '450px' }}>
        <div className="prod-modal-header">
          <h3>
            <i className="fas fa-file-export" style={{ color: '#10b981' }}></i>
            {language === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
          </h3>
          <button className="prod-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="prod-modal-body">
          <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
            {language === 'mm' 
              ? 'တင်ပို့လိုသော ဒေတာအမျိုးအစားကို ရွေးချယ်ပါ။' 
              : 'Select the type of data you want to export.'}
          </p>

          <div className="prod-export-options">
            <div 
              className={`prod-export-option ${exportType === 'products' ? 'selected' : ''}`}
              onClick={() => setExportType('products')}
            >
              <div className="prod-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="products" 
                  checked={exportType === 'products'} 
                  onChange={() => setExportType('products')}
                />
                <div className="prod-export-radio-custom"></div>
              </div>
              <div className="prod-export-option-content">
                <i className="fas fa-boxes" style={{ color: '#4361ee' }}></i>
                <div>
                  <div className="prod-export-option-title">
                    {language === 'mm' ? 'ပစ္စည်းများ' : 'Products'}
                  </div>
                  <div className="prod-export-option-desc">
                    {language === 'mm' ? 'ပစ္စည်းစာရင်းအားလုံး' : 'All product list'}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`prod-export-option ${exportType === 'logs' ? 'selected' : ''}`}
              onClick={() => setExportType('logs')}
            >
              <div className="prod-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="logs" 
                  checked={exportType === 'logs'} 
                  onChange={() => setExportType('logs')}
                />
                <div className="prod-export-radio-custom"></div>
              </div>
              <div className="prod-export-option-content">
                <i className="fas fa-history" style={{ color: '#f59e0b' }}></i>
                <div>
                  <div className="prod-export-option-title">
                    {language === 'mm' ? 'မှတ်တမ်းများ' : 'Logs'}
                  </div>
                  <div className="prod-export-option-desc">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်းအားလုံး' : 'All activity logs'}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`prod-export-option ${exportType === 'both' ? 'selected' : ''}`}
              onClick={() => setExportType('both')}
            >
              <div className="prod-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="both" 
                  checked={exportType === 'both'} 
                  onChange={() => setExportType('both')}
                />
                <div className="prod-export-radio-custom"></div>
              </div>
              <div className="prod-export-option-content">
                <i className="fas fa-layer-group" style={{ color: '#8b5cf6' }}></i>
                <div>
                  <div className="prod-export-option-title">
                    {language === 'mm' ? 'အားလုံး' : 'Both'}
                  </div>
                  <div className="prod-export-option-desc">
                    {language === 'mm' ? 'ပစ္စည်းနှင့် မှတ်တမ်းနှစ်ခုလုံး' : 'Both products and logs'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="prod-modal-footer">
          <button className="prod-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button 
            className={`prod-btn-submit ${loading ? 'loading' : ''}`}
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

export default ProductExportModal;