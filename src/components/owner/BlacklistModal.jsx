// src/components/auditLogs/BlacklistModal.jsx

import React, { useState } from 'react';

const BlacklistModal = ({ show, onClose, onSave, blockType, blockValue, loading, language }) => {
  const [formData, setFormData] = useState({
    blockType: blockType || 'IP',
    blockValue: blockValue || '',
    reason: '',
    durationType: 'DAYS',
    durationValue: 7
  });
  const [errors, setErrors] = useState({});

  const durationOptions = [
    { value: 'MINUTES', label: language === 'mm' ? 'မိနစ်' : 'Minutes' },
    { value: 'HOURS', label: language === 'mm' ? 'နာရီ' : 'Hours' },
    { value: 'DAYS', label: language === 'mm' ? 'ရက်' : 'Days' },
    { value: 'MONTHS', label: language === 'mm' ? 'လ' : 'Months' },
    { value: 'PERMANENT', label: language === 'mm' ? 'တစ်သက်တာ' : 'Permanent' }
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.blockValue.trim()) {
      newErrors.blockValue = language === 'mm' ? 'တန်ဖိုး လိုအပ်ပါသည်' : 'Value is required';
    }
    if (!formData.reason.trim()) {
      newErrors.reason = language === 'mm' ? 'အကြောင်းပြချက် လိုအပ်ပါသည်' : 'Reason is required';
    }
    if (formData.durationType !== 'PERMANENT' && (!formData.durationValue || formData.durationValue < 1)) {
      newErrors.durationValue = language === 'mm' ? 'ကြာချိန် ထည့်ပါ' : 'Duration is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSave(formData);
    }
  };

  if (!show) return null;

  return (
    <div className="blacklist-modal-overlay">
      <div className="blacklist-modal-content">
        <div className="blacklist-modal-header">
          <h3><i className="fas fa-ban"></i> {language === 'mm' ? 'Blacklist ထည့်ရန်' : 'Add to Blacklist'}</h3>
          <button className="blacklist-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>
        
        <div className="blacklist-modal-body">
          <div className="blacklist-form-group">
            <label>{language === 'mm' ? 'ပိတ်ဆို့မည့်အမျိုးအစား' : 'Block Type'}</label>
            <select value={formData.blockType} onChange={(e) => handleChange('blockType', e.target.value)}>
              <option value="IP">IP Address</option>
              <option value="DEVICE_FINGERPRINT">Device Fingerprint</option>
              <option value="USERNAME">Username</option>
            </select>
          </div>
          
          <div className="blacklist-form-group">
            <label>{language === 'mm' ? 'တန်ဖိုး' : 'Value'}</label>
            <input
              type="text"
              value={formData.blockValue}
              onChange={(e) => handleChange('blockValue', e.target.value)}
              placeholder={formData.blockType === 'IP' ? '192.168.1.1' : formData.blockType === 'USERNAME' ? 'username' : 'device_fingerprint_hash'}
              className={errors.blockValue ? 'error' : ''}
            />
            {errors.blockValue && <span className="error-message">{errors.blockValue}</span>}
          </div>
          
          <div className="blacklist-form-group">
            <label>{language === 'mm' ? 'အကြောင်းပြချက်' : 'Reason'}</label>
            <textarea
              value={formData.reason}
              onChange={(e) => handleChange('reason', e.target.value)}
              rows="2"
              placeholder={language === 'mm' ? 'ပိတ်ဆို့ရသည့်အကြောင်းအရင်း...' : 'Reason for blocking...'}
              className={errors.reason ? 'error' : ''}
            />
            {errors.reason && <span className="error-message">{errors.reason}</span>}
          </div>
          
          <div className="blacklist-form-row">
            <div className="blacklist-form-group">
              <label>{language === 'mm' ? 'ကြာချိန်အမျိုးအစား' : 'Duration Type'}</label>
              <select value={formData.durationType} onChange={(e) => handleChange('durationType', e.target.value)}>
                {durationOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            
            {formData.durationType !== 'PERMANENT' && (
              <div className="blacklist-form-group">
                <label>{language === 'mm' ? 'ကြာချိန်' : 'Duration'}</label>
                <input
                  type="number"
                  min="1"
                  value={formData.durationValue}
                  onChange={(e) => handleChange('durationValue', parseInt(e.target.value) || 0)}
                  className={errors.durationValue ? 'error' : ''}
                />
                {errors.durationValue && <span className="error-message">{errors.durationValue}</span>}
              </div>
            )}
          </div>
        </div>
        
        <div className="blacklist-modal-footer">
          <button className="blacklist-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'မလုပ်တော့ပါ' : 'Cancel'}
          </button>
          <button className="blacklist-btn-submit" onClick={handleSubmit} disabled={loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> {language === 'mm' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...'}</> : <><i className="fas fa-ban"></i> {language === 'mm' ? 'Blacklist ထည့်ရန်' : 'Add to Blacklist'}</>}
          </button>
        </div>
      </div>
      
      <style>{`
        .blacklist-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .blacklist-modal-content {
          background: white;
          border-radius: 16px;
          width: 500px;
          max-width: 90%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .blacklist-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          border-bottom: 1px solid #e5e7eb;
        }
        .blacklist-modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #111827;
        }
        .blacklist-modal-close {
          background: none;
          border: none;
          font-size: 20px;
          cursor: pointer;
          color: #6b7280;
        }
        .blacklist-modal-body {
          padding: 20px;
        }
        .blacklist-form-group {
          margin-bottom: 16px;
        }
        .blacklist-form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          font-size: 14px;
          color: #374151;
        }
        .blacklist-form-group input,
        .blacklist-form-group select,
        .blacklist-form-group textarea {
          width: 100%;
          padding: 10px 12px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }
        .blacklist-form-group input.error,
        .blacklist-form-group textarea.error {
          border-color: #ef4444;
        }
        .error-message {
          color: #ef4444;
          font-size: 12px;
          margin-top: 4px;
          display: block;
        }
        .blacklist-form-row {
          display: flex;
          gap: 16px;
        }
        .blacklist-form-row .blacklist-form-group {
          flex: 1;
        }
        .blacklist-modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding: 16px 20px;
          border-top: 1px solid #e5e7eb;
        }
        .blacklist-btn-cancel {
          padding: 8px 16px;
          background: #f3f4f6;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .blacklist-btn-submit {
          padding: 8px 16px;
          background: #dc2626;
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .blacklist-btn-submit:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default BlacklistModal;