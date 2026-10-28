// CategoryExportModal.jsx
import React, { useState } from 'react';
import "../../light-style/user-css/userCategoryPage.css";

const CategoryExportModal = ({ show, onClose, onExport, loading, language }) => {
  const [exportType, setExportType] = useState('both'); // 'categories', 'logs', 'both'

  if (!show) return null;

  const handleExport = () => {
    onExport(exportType);
  };

  return (
    <div className="cat-modal-overlay">
      <div className="cat-modal-content" style={{ maxWidth: '450px' }}>
        <div className="cat-modal-header">
          <h3>
            <i className="fas fa-file-export" style={{ color: '#10b981' }}></i>
            {language === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
          </h3>
          <button className="cat-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="cat-modal-body">
          <p style={{ marginBottom: '20px', color: '#6c757d', fontSize: '14px' }}>
            {language === 'mm' 
              ? 'တင်ပို့လိုသော ဒေတာအမျိုးအစားကို ရွေးချယ်ပါ။' 
              : 'Select the type of data you want to export.'}
          </p>

          <div className="cat-export-options">
            <div 
              className={`cat-export-option ${exportType === 'categories' ? 'selected' : ''}`}
              onClick={() => setExportType('categories')}
            >
              <div className="cat-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="categories" 
                  checked={exportType === 'categories'} 
                  onChange={() => setExportType('categories')}
                />
                <div className="cat-export-radio-custom"></div>
              </div>
              <div className="cat-export-option-content">
                <i className="fas fa-tags" style={{ color: '#4361ee' }}></i>
                <div>
                  <div className="cat-export-option-title">
                    {language === 'mm' ? 'အမျိုးအစားများ' : 'Categories'}
                  </div>
                  <div className="cat-export-option-desc">
                    {language === 'mm' ? 'အမျိုးအစားစာရင်းအားလုံး' : 'All category list'}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`cat-export-option ${exportType === 'logs' ? 'selected' : ''}`}
              onClick={() => setExportType('logs')}
            >
              <div className="cat-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="logs" 
                  checked={exportType === 'logs'} 
                  onChange={() => setExportType('logs')}
                />
                <div className="cat-export-radio-custom"></div>
              </div>
              <div className="cat-export-option-content">
                <i className="fas fa-history" style={{ color: '#f59e0b' }}></i>
                <div>
                  <div className="cat-export-option-title">
                    {language === 'mm' ? 'မှတ်တမ်းများ' : 'Logs'}
                  </div>
                  <div className="cat-export-option-desc">
                    {language === 'mm' ? 'လုပ်ဆောင်ချက်မှတ်တမ်းအားလုံး' : 'All activity logs'}
                  </div>
                </div>
              </div>
            </div>

            <div 
              className={`cat-export-option ${exportType === 'both' ? 'selected' : ''}`}
              onClick={() => setExportType('both')}
            >
              <div className="cat-export-radio">
                <input 
                  type="radio" 
                  name="exportType" 
                  value="both" 
                  checked={exportType === 'both'} 
                  onChange={() => setExportType('both')}
                />
                <div className="cat-export-radio-custom"></div>
              </div>
              <div className="cat-export-option-content">
                <i className="fas fa-layer-group" style={{ color: '#8b5cf6' }}></i>
                <div>
                  <div className="cat-export-option-title">
                    {language === 'mm' ? 'အားလုံး' : 'Both'}
                  </div>
                  <div className="cat-export-option-desc">
                    {language === 'mm' ? 'အမျိုးအစားနှင့် မှတ်တမ်းနှစ်ခုလုံး' : 'Both categories and logs'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="cat-modal-footer">
          <button className="cat-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button 
            className={`cat-btn-submit ${loading ? 'loading' : ''}`}
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

export default CategoryExportModal;