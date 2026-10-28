import React, { useState, useEffect, useRef } from 'react';

const PaymentModal = ({
  show,
  onClose,
  paymentForm,
  credit,
  onFormChange,
  onSave,
  onUpdate,
  loading,
  validationError,
  formErrors,
  currentUser,
  language,
  isFormValid,
  formatCurrency,
  getPaymentMethodText,
  modalType = 'add',
  existingPayment = null
}) => {
  // Local state for form data
  const [localFormData, setLocalFormData] = useState({
    id: null,
    creditId: null,
    paymentAmount: '',
    paymentMethod: 'cash',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNo: '',
    notes: ''
  });

  // Local validation errors
  const [localValidationError, setLocalValidationError] = useState(null);
  const [localAmountError, setLocalAmountError] = useState(null);

  // Use ref to track if this is the initial mount
  const isInitialMount = useRef(true);
  const previousShowRef = useRef(show);

  // Initialize form only when modal opens (not on every re-render)
  useEffect(() => {
    // Only run this effect when the modal opens (show changes from false to true)
    if (show && !previousShowRef.current) {

      // Reset local errors when modal opens
      setLocalValidationError(null);
      setLocalAmountError(null);
      
      if (modalType === 'edit' && existingPayment) {
        setLocalFormData({
          id: existingPayment.id,
          creditId: existingPayment.creditId,
          paymentAmount: existingPayment.paymentAmount,
          paymentMethod: existingPayment.paymentMethod,
          paymentDate: existingPayment.paymentDate,
          referenceNo: existingPayment.referenceNo || '',
          notes: existingPayment.notes || ''
        });
      } else if (paymentForm) {
        setLocalFormData({
          id: paymentForm.id || null,
          creditId: paymentForm.creditId,
          paymentAmount: paymentForm.paymentAmount || '',
          paymentMethod: paymentForm.paymentMethod || 'cash',
          paymentDate: paymentForm.paymentDate || new Date().toISOString().split('T')[0],
          referenceNo: paymentForm.referenceNo || '',
          notes: paymentForm.notes || ''
        });
      }
    }
    
    // Update previous show ref
    previousShowRef.current = show;
  }, [show, modalType, existingPayment, paymentForm]);

  // Calculate max allowed amount based on mode
  const getMaxAllowedAmount = () => {
    if (modalType === 'edit' && existingPayment && credit) {
      // Edit mode: original payment amount + current remaining amount
      const originalPaymentAmount = existingPayment.paymentAmount || 0;
      const currentRemaining = credit.remainingAmount || 0;
      return originalPaymentAmount + currentRemaining;
    }
    // Add mode: just the remaining amount
    return credit?.remainingAmount || 0;
  };

  // Validate amount on change
  const validateAmount = (amount) => {
    const numAmount = parseFloat(amount);
    const maxAmount = getMaxAllowedAmount();
    
    // Clear previous errors
    setLocalAmountError(null);
    
    // Check if amount is empty
    if (amount === '' || amount === null || amount === undefined) {
      return true; // Allow empty, will show error on submit
    }
    
    // Check if amount is not a number
    if (isNaN(numAmount)) {
      setLocalAmountError(language === 'mm' ? 'ငွေပေးချေပမာဏသည် ဂဏန်းဖြစ်ရပါမည်' : 'Payment amount must be a number');
      return false;
    }
    
    // Check if amount is negative
    if (numAmount < 0) {
      setLocalAmountError(language === 'mm' ? 'ငွေပေးချေပမာဏသည် အနှုတ်ဂဏန်း မဖြစ်နိုင်ပါ' : 'Payment amount cannot be negative');
      return false;
    }
    
    // Check if amount is zero
    if (numAmount === 0) {
      setLocalAmountError(language === 'mm' ? 'ငွေပေးချေပမာဏသည် 0 မဖြစ်နိုင်ပါ' : 'Payment amount cannot be zero');
      return false;
    }
    
    // Check if amount exceeds max allowed
    if (numAmount > maxAmount) {
      setLocalAmountError(language === 'mm' 
        ? `ငွေပေးချေပမာဏသည် ကျန်ငွေ (${formatCurrency(maxAmount)}) ထက် မပိုနိုင်ပါ`
        : `Payment amount cannot exceed remaining amount (${formatCurrency(maxAmount)})`);
      return false;
    }
    
    return true;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Special handling for paymentAmount
    if (name === 'paymentAmount') {
      // Validate the amount
      validateAmount(value);
    }
    
    // Update local state
    setLocalFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Also call parent's onFormChange if needed (for validation)
    if (onFormChange) {
      const syntheticEvent = {
        target: {
          name,
          value
        }
      };
      onFormChange(syntheticEvent);
    }
  };

  const handleSubmit = () => {

    // Clear previous validation error
    setLocalValidationError(null);
    
    // Get payment amount
    const paymentAmount = localFormData.paymentAmount;
    const numAmount = parseFloat(paymentAmount);
    const maxAmount = getMaxAllowedAmount();
    
    // Validate payment amount
    if (!paymentAmount || paymentAmount === '') {
      setLocalValidationError(language === 'mm' ? 'ငွေပေးချေပမာဏ လိုအပ်ပါသည်' : 'Payment amount is required');
      return;
    }
    
    if (isNaN(numAmount)) {
      setLocalValidationError(language === 'mm' ? 'ငွေပေးချေပမာဏသည် ဂဏန်းဖြစ်ရပါမည်' : 'Payment amount must be a number');
      return;
    }
    
    if (numAmount < 0) {
      setLocalValidationError(language === 'mm' ? 'ငွေပေးချေပမာဏသည် အနှုတ်ဂဏန်း မဖြစ်နိုင်ပါ' : 'Payment amount cannot be negative');
      return;
    }
    
    if (numAmount === 0) {
      setLocalValidationError(language === 'mm' ? 'ငွေပေးချေပမာဏသည် 0 မဖြစ်နိုင်ပါ' : 'Payment amount cannot be zero');
      return;
    }
    
    if (numAmount > maxAmount) {
      setLocalValidationError(language === 'mm' 
        ? `ငွေပေးချေပမာဏသည် ကျန်ငွေ (${formatCurrency(maxAmount)}) ထက် မပိုနိုင်ပါ`
        : `Payment amount cannot exceed remaining amount (${formatCurrency(maxAmount)})`);
      return;
    }
    
    // Check if id exists for edit mode
    if (modalType === 'edit' && onUpdate) {
      if (!localFormData.id) {
        console.error('Payment ID is missing!');
        setLocalValidationError(language === 'mm' 
          ? 'ငွေပေးချေမှု ID ပျောက်နေသည်။ ထပ်ကြိုးစားပါ။' 
          : 'Payment ID is missing. Please try again.');
        return;
      }
      // Pass the local form data to parent
      onUpdate(localFormData);
    } else if (onSave) {
      onSave();
    }
  };

  if (!show || !credit) return null;

  const t = (en, mm) => language === 'mm' ? mm : en;
  const maxAmount = getMaxAllowedAmount();

  return (
    <div className="credit-edit-modal-overlay">
      <div className="credit-modal-content">
        <div className="credit-modal-header">
          <h3>
            <i className={`fas ${modalType === 'edit' ? 'fa-edit' : 'fa-money-bill-wave'}`}></i>
            {modalType === 'edit' 
              ? t('Edit Payment', 'ငွေပေးချေမှု ပြင်ဆင်ရန်')
              : t('Add Payment', 'ငွေပေးချေမှု ထည့်ရန်')
            }
          </h3>
          <button className="credit-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="credit-modal-body">
          <div className="credit-current-user-banner">
            <i className="fas fa-user-circle"></i>
            <div>
              <div className="credit-user-name">{currentUser?.username || currentUser?.name}</div>
              <div className="credit-user-role">{currentUser?.role}</div>
            </div>
          </div>

          {/* Show validation error */}
          {(localValidationError || validationError) && (
            <div className="credit-validation-error" style={{ marginBottom: '15px' }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{localValidationError || validationError}</span>
            </div>
          )}

          {/* Credit Summary */}
          <div className="credit-payment-info">
            <div className="credit-payment-customer">
              <i className="fas fa-user"></i>
              <div>
                <div className="credit-payment-customer-name">{credit.customerName}</div>
                <div className="credit-payment-customer-id">{credit.invoiceNo}</div>
              </div>
            </div>
            <div className="credit-payment-balance">
              <div className="credit-balance-item">
                <span className="credit-balance-label">{t('Total', 'စုစုပေါင်း')}:</span>
                <span className="credit-balance-value">{formatCurrency(credit.totalAmount)}</span>
              </div>
              <div className="credit-balance-item">
                <span className="credit-balance-label">{t('Paid', 'ပေးချေပြီး')}:</span>
                <span className="credit-balance-value">{formatCurrency(credit.paidAmount)}</span>
              </div>
              <div className="credit-balance-item credit-balance-remaining">
                <span className="credit-balance-label">{t('Remaining', 'ကျန်ငွေ')}:</span>
                <span className="credit-balance-value">{formatCurrency(maxAmount)}</span>
              </div>
            </div>
          </div>

          <div className="credit-form-group">
            <label className="credit-required">{t('Payment Amount', 'ငွေပေးချေပမာဏ')}</label>
            <div className="credit-input-with-symbol">
              <input
                type="number"
                name="paymentAmount"
                value={localFormData.paymentAmount}
                onChange={handleChange}
                placeholder="0"
                min="1"
                max={maxAmount}
                step="100"
                disabled={loading}
                className={(formErrors.paymentAmount || localAmountError) ? 'credit-input-error' : ''}
              />
              <span className="credit-input-symbol">Ks</span>
            </div>
            <div className="credit-input-hint">
              {t('Maximum', 'အများဆုံး')}: {formatCurrency(maxAmount)}
            </div>
            {(formErrors.paymentAmount || localAmountError) && (
              <div className="credit-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{localAmountError || formErrors.paymentAmount}</span>
              </div>
            )}
          </div>

          <div className="credit-form-row">
            <div className="credit-form-group">
              <label className="credit-required">{t('Payment Method', 'ငွေပေးချေနည်း')}</label>
              <select
                name="paymentMethod"
                value={localFormData.paymentMethod}
                onChange={handleChange}
                className="credit-payment-method-select"
                disabled={loading}
              >
                <option value="cash">{t('Cash', 'ငွေသား')}</option>
                <option value="bank_transfer">{t('Bank Transfer', 'ဘဏ်လွှဲ')}</option>
                <option value="kpay">KPay</option>
                <option value="wave_pay">Wave Pay</option>
                <option value="cb_pay">CB Pay</option>
              </select>
            </div>
            <div className="credit-form-group">
              <label className="credit-required">{t('Payment Date', 'ငွေပေးချေရက်')}</label>
              <input
                type="date"
                name="paymentDate"
                value={localFormData.paymentDate}
                onChange={handleChange}
                disabled={loading}
              />
            </div>
          </div>

          <div className="credit-form-group">
            <label>{t('Notes', 'မှတ်ချက်')}</label>
            <textarea
              name="notes"
              value={localFormData.notes}
              onChange={handleChange}
              placeholder={t('Payment notes...', 'ငွေပေးချေမှု မှတ်ချက်များ...')}
              rows="2"
              maxLength="200"
              disabled={loading}
            />
          </div>
        </div>
        <div className="credit-modal-footer">
          <button className="credit-btn-cancel" onClick={onClose} disabled={loading}>
            {t('Cancel', 'ပယ်ဖျက်မည်')}
          </button>
          <button
            className={`credit-btn-submit ${loading ? 'loading' : ''}`}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {t('Processing...', 'လုပ်ဆောင်နေသည်...')}
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {modalType === 'edit'
                  ? t('Update Payment', 'ငွေပေးချေမှု ပြင်ဆင်မည်')
                  : t('Record Payment', 'ငွေပေးချေမှုမှတ်တမ်းတင်မည်')
                }
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;