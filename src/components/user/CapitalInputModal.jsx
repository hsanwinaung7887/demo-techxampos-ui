// src/components/user/CapitalInputModal.jsx
import React, { useState } from 'react';
import '../../light-style/user-css/capitalInputModal.css';

const CapitalInputModal = ({ isOpen, onClose, onSubmit, loading, lang, isClosed }) => {

  const t = (en, mm) => lang === 'mm' ? mm : en;

  const [formData, setFormData] = useState({
    type: 'INJECTION',
    category: 'Owner Investment',
    amount: '',
    description: '',
    entryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const [errors, setErrors] = useState({});

  // Category Options
  const categoryOptions = [
    { value: 'Owner Investment', label_mm: 'ပိုင်ရှင်ရင်းနှီးငွေ', label_en: 'Owner Investment' },
    { value: 'Business Expansion', label_mm: 'လုပ်ငန်းချဲ့ထွင်ငွေ', label_en: 'Business Expansion' },
    { value: 'Emergency Fund', label_mm: 'အရေးပေါ်ရန်ပုံငွေ', label_en: 'Emergency Fund' },
    { value: 'Equipment Purchase', label_mm: 'စက်ပစ္စည်းဝယ်ယူငွေ', label_en: 'Equipment Purchase' },
    { value: 'Owner Drawing', label_mm: 'ပိုင်ရှင်ထုတ်ယူငွေ', label_en: 'Owner Drawing' },
    { value: 'Loan Repayment', label_mm: 'ချေးငွေပြန်ဆပ်ငွေ', label_en: 'Loan Repayment' },
    { value: 'Other', label_mm: 'အခြား', label_en: 'Other' }
  ];

  const typeOptions = [
    { value: 'INJECTION', label_mm: 'ထည့်သွင်း', label_en: 'Injection' },
    { value: 'WITHDRAWAL', label_mm: 'ထုတ်ယူ', label_en: 'Withdrawal' },
    { value: 'TRANSFER', label_mm: 'လွှဲပြောင်း', label_en: 'Transfer' }
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.type) newErrors.type = t('Type is required', 'အမျိုးအစား လိုအပ်ပါသည်');
    if (!formData.category) newErrors.category = t('Category is required', 'အမျိုးအစားခွဲ လိုအပ်ပါသည်');
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = t('Valid amount is required', 'မှန်ကန်သောပမာဏ လိုအပ်ပါသည်');
    }
    if (!formData.description) newErrors.description = t('Description is required', 'ဖော်ပြချက် လိုအပ်ပါသည်');
    if (!formData.entryDate) newErrors.entryDate = t('Date is required', 'ရက်စွဲ လိုအပ်ပါသည်');
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isClosed) {
      alert(t('Cannot add because period is closed', 'စာရင်းပိတ်ထားပြီးဖြစ်၍ မထည့်သွင်းနိုင်ပါ'));
      return;
    }
    if (validate()) {
      onSubmit(formData);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="capital-modal-overlay" onClick={onClose}>
      <div className="capital-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="capital-modal-header">
          <h3>
            <i className="fas fa-coins"></i>
            {t('Add Capital Transaction', 'မတည်ငွေထည့်သွင်းမည်')}
          </h3>
          <button className="capital-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="capital-form">
          {isClosed && (
            <div className="capital-form-closed-warning">
              <i className="fas fa-lock"></i>
              {t('Period is closed. Cannot add new transactions.', 'စာရင်းပိတ်ထားပြီးဖြစ်၍ မတည်ငွေထည့်သွင်း၍မရပါ။')}
            </div>
          )}

          {/* Type */}
          <div className="capital-form-row">
            <div className="capital-form-group">
              <label className="expense-required">{t('Transaction Type', 'အမျိုးအစား')}</label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading || isClosed}
                className={errors.type ? 'input-error' : ''}
              >
                {typeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {lang === 'mm' ? opt.label_mm : opt.label_en}
                  </option>
                ))}
              </select>
              {errors.type && <span className="expense-field-error">{errors.type}</span>}
            </div>

            {/* Category */}
            <div className="capital-form-group">
              <label className="expense-required">{t('Category', 'အမျိုးအစားခွဲ')}</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading || isClosed}
                className={errors.category ? 'input-error' : ''}
              >
                {categoryOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {lang === 'mm' ? opt.label_mm : opt.label_en}
                  </option>
                ))}
              </select>
              {errors.category && <span className="expense-field-error">{errors.category}</span>}
            </div>
          </div>

          {/* Amount + Date */}
          <div className="capital-form-row">
            <div className="capital-form-group">
              <label className="expense-required">{t('Amount (MMK)', 'ပမာဏ (MMK)')}</label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                placeholder={t('Enter amount', 'ပမာဏရေးပါ')}
                min="0"
                step="100"
                disabled={loading || isClosed}
                className={errors.amount ? 'input-error' : ''}
              />
              {errors.amount && <span className="expense-field-error">{errors.amount}</span>}
            </div>

            <div className="capital-form-group">
              <label className="expense-required">{t('Date', 'ရက်စွဲ')}</label>
              <input
                type="date"
                name="entryDate"
                value={formData.entryDate}
                onChange={handleChange}
                disabled={loading || isClosed}
                className={errors.entryDate ? 'input-error' : ''}
              />
              {errors.entryDate && <span className="expense-field-error">{errors.entryDate}</span>}
            </div>
          </div>

          {/* Description */}
          <div className="capital-form-row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="capital-form-group">
              <label className="expense-required">{t('Description', 'ဖော်ပြချက်')}</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder={t('Enter description', 'ဖော်ပြချက်ရေးပါ')}
                disabled={loading || isClosed}
                className={errors.description ? 'input-error' : ''}
                rows="2"
              />
              {errors.description && <span className="expense-field-error">{errors.description}</span>}
            </div>
          </div>

          {/* Notes */}
          <div className="capital-form-row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="capital-form-group">
              <label>{t('Notes (Optional)', 'မှတ်ချက် (မလိုအပ်ပါ)')}</label>
              <input
                type="text"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                placeholder={t('Additional notes...', 'နောက်ထပ်မှတ်ချက်...')}
                disabled={loading || isClosed}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="capital-form-actions">
            <button type="button" className="capital-btn-cancel" onClick={onClose} disabled={loading}>
              {t('Cancel', 'ပယ်ဖျက်မည်')}
            </button>
            <button
              type="submit"
              className={`capital-btn-submit ${loading ? 'loading' : ''}`}
              disabled={loading || isClosed}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t('Saving...', 'သိမ်းနေသည်...')}
                </>
              ) : (
                <>
                  <i className="fas fa-save"></i>
                  {t('Add Transaction', 'ထည့်မည်')}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ===== ✅ IMPORTANT: Export Default =====
export default CapitalInputModal;