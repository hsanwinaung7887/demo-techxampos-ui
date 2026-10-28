// ReturnModal.jsx (Demo — JSON only)
import React, { useEffect, useRef } from 'react';

const ReturnModal = ({
  show,
  onClose,
  returnForm,
  returnItems,
  selectedSale,
  onFormChange,
  onInvoiceSearch,
  onReturnTypeChange,
  onItemChange,
  onReasonChange,
  onProcessReturn,
  loading,
  validationError,
  formErrors,
  currentUser,
  language,
  formatCurrency,
  additionalDiscountPercent = 0,
  onAdditionalDiscountChange = () => {},
}) => {
  const invoiceInputRef = useRef(null);

  useEffect(() => {
    if (show && invoiceInputRef.current) {
      invoiceInputRef.current.focus();
    }
  }, [show]);

  if (!show) return null;

  const t = (en, mm) => language === 'mm' ? mm : en;

  const selectedItemsCount = returnItems.filter(item => item.returnQuantity > 0).length;
  const totalReturnQty = returnItems.reduce((sum, item) => sum + (item.returnQuantity || 0), 0);

  // ✅ Calculate selected items subtotal (after product discounts)
  const calculateSelectedItemsSubtotal = () => {
    return returnItems.reduce((sum, item) => {
      if (item.returnQuantity > 0) {
        return sum + (item.unitPrice * item.returnQuantity);
      }
      return sum;
    }, 0);
  };

  const selectedSubtotal = calculateSelectedItemsSubtotal();
  const additionalDiscountAmount = (selectedSubtotal * additionalDiscountPercent) / 100;
  const taxPercentage = selectedSale?.taxPercentage || 0;
  const taxableAmount = selectedSubtotal - additionalDiscountAmount;
  const taxRefund = (taxableAmount * taxPercentage) / 100;
  const calculatedTotalRefund = taxableAmount + taxRefund;

  // ✅ FIX: Parent (UserReturnPage) state ကနေ ယူသုံးတာမို့ parameter မလိုပါ
  const handleProcessClick = () => {
    if (typeof onProcessReturn === 'function') {
      onProcessReturn();  // ✅ parameter မပို့တော့ပါ
    }
  };

  // ✅ Product Discount Refund (for display)
  const totalOriginalPrice = returnItems.reduce((sum, item) => {
    if (item.returnQuantity > 0) {
      return sum + ((item.originalPrice || item.unitPrice) * item.returnQuantity);
    }
    return sum;
  }, 0);
  const productDiscountRefund = totalOriginalPrice - selectedSubtotal;
  const discountPercent = totalOriginalPrice > 0
    ? (productDiscountRefund / totalOriginalPrice) * 100
    : 0;

  return (
    <div className="return-modal-overlay">
      <div className="return-modal-content" style={{ maxWidth: '900px' }}>
        <div className="return-modal-header">
          <h3>
            <i className="fas fa-undo-alt"></i>
            {t('Process Return', 'ပြန်လည်အပ်နှံမှုလုပ်ဆောင်ရန်')}
          </h3>
          <button className="return-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="return-modal-body">
          {/* User Banner */}
          <div className="return-current-user-banner">
            <i className="fas fa-user-circle"></i>
            <div>
              <div className="return-user-name">{currentUser?.name}</div>
              <div className="return-user-role">{currentUser?.role}</div>
            </div>
          </div>

          {validationError && (
            <div className="return-validation-error">
              <i className="fas fa-exclamation-circle"></i>
              <span>{validationError}</span>
            </div>
          )}

          {/* Invoice Search Section */}
          <div className="return-form-group">
            <label className="return-required">
              {t('Invoice Number', 'ဘေလ်နံပါတ်')}
            </label>
            <div className="return-invoice-search-group">
              <input
                ref={invoiceInputRef}
                type="text"
                name="invoiceNo"
                value={returnForm.invoiceNo}
                onChange={onFormChange}
                placeholder={t('Enter invoice number', 'ဘေလ်နံပါတ်ထည့်ပါ')}
                disabled={loading || selectedSale}
                className={formErrors.saleId ? 'return-input-error' : ''}
              />
              <button
                className="return-search-invoice-btn"
                onClick={onInvoiceSearch}
                disabled={loading || !returnForm.invoiceNo.trim() || selectedSale}
              >
                <i className="fas fa-search"></i> {t('Search', 'ရှာရန်')}
              </button>
            </div>
            {formErrors.saleId && (
              <div className="return-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.saleId}</span>
              </div>
            )}
          </div>

          {/* Sale Info */}
          {selectedSale && (
            <div className="return-sale-info">
              <div className="return-sale-info-header">
                <i className="fas fa-receipt"></i>
                <span>{t('Sale Details', 'ရောင်းချမှုအသေးစိတ်')}</span>
              </div>
              <div className="return-sale-info-grid">
                <div className="return-sale-info-item">
                  <span className="return-info-label">{t('Customer', 'ဝယ်ယူသူ')}:</span>
                  <span className="return-info-value">{selectedSale.customerName}</span>
                </div>
                <div className="return-sale-info-item">
                  <span className="return-info-label">{t('Date', 'ရက်စွဲ')}:</span>
                  <span className="return-info-value">
                    {new Date(selectedSale.saleDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="return-sale-info-item">
                  <span className="return-info-label">{t('Total', 'စုစုပေါင်း')}:</span>
                  <span className="return-info-value">{formatCurrency(selectedSale.total)}</span>
                </div>
                <div className="return-sale-info-item">
                  <span className="return-info-label">{t('Payment', 'ငွေပေးချေမှု')}:</span>
                  <span className="return-info-value">{selectedSale.paymentMethod}</span>
                </div>
                <div className="return-sale-info-item">
                  <span className="return-info-label">{t('Additional Discount', 'ထပ်ဆောင်းလျှော့စျေး')}:</span>
                  <span className="return-info-value">
                    {selectedSale.additionalDiscount > 0
                      ? `${formatCurrency(selectedSale.additionalDiscount)} (${((selectedSale.additionalDiscount / selectedSale.subtotal) * 100).toFixed(1)}%)`
                      : '-'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Return Type */}
          {selectedSale && (
            <div className="return-form-group">
              <label className="return-required">
                {t('Return Type', 'ပြန်အပ်နှံမှုအမျိုးအစား')}
              </label>
              <div className="return-type-selector">
                <div
                  className={`return-type-option ${returnForm.returnType === 'FULL' ? 'selected' : ''}`}
                  onClick={() => !loading && onReturnTypeChange('FULL')}
                >
                  <i className="fas fa-undo-alt"></i>
                  <span>{t('Full Return', 'အားလုံးပြန်အပ်')}</span>
                </div>
                <div
                  className={`return-type-option ${returnForm.returnType === 'PARTIAL' ? 'selected' : ''}`}
                  onClick={() => !loading && onReturnTypeChange('PARTIAL')}
                >
                  <i className="fas fa-cut"></i>
                  <span>{t('Partial Return', 'တစ်စိတ်တစ်ပိုင်းပြန်အပ်')}</span>
                </div>
              </div>
              {formErrors.returnType && (
                <div className="return-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.returnType}</span>
                </div>
              )}
            </div>
          )}

          {/* Items to Return */}
          {selectedSale && returnItems.length > 0 && (
            <div className="return-form-group">
              <label className="return-required">
                {t('Items to Return', 'ပြန်အပ်မည့်ပစ္စည်းများ')}
              </label>
              <div className="return-items-table-container">
                <table className="return-items-table">
                  <thead>
                    <tr>
                      <th>{t('Product', 'ပစ္စည်း')}</th>
                      <th>{t('Unit Price', 'တစ်ခုဈေး')}</th>
                      <th>{t('Sold', 'ရောင်းခဲ့')}</th>
                      <th>{t('Return', 'ပြန်အပ်')}</th>
                      <th>{t('Reason', 'အကြောင်းပြချက်')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnItems.filter(item => !item.isFree).map(item => (
                      <tr key={item.saleItemId}>
                        <td>
                          <div className="return-item-name">{item.productName}</div>
                          <div className="return-item-sku">{item.sku}</div>
                        </td>
                        <td className="return-item-price">{formatCurrency(item.unitPrice)}</td>
                        <td className="return-item-qty-sold">{item.originalQuantity}</td>
                        <td>
                          <input
                            type="number"
                            className="return-item-qty-input"
                            min="0"
                            max={item.maxReturnable}
                            value={item.returnQuantity || 0}
                            onChange={(e) => onItemChange(item.saleItemId, parseInt(e.target.value) || 0)}
                            disabled={loading}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="return-item-reason-input"
                            placeholder={t('Reason (optional)', 'အကြောင်းပြချက် (ချန်လှပ်နိုင်)')}
                            value={item.returnReason || ''}
                            onChange={(e) => onReasonChange(item.saleItemId, e.target.value)}
                            disabled={loading}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {formErrors.items && (
                <div className="return-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.items}</span>
                </div>
              )}

              {selectedItemsCount > 0 && (
                <div className="return-selected-summary">
                  <span>
                    {t('Selected', 'ရွေးချယ်ထားသည်')}: {selectedItemsCount} {t('items', 'ပစ္စည်း')},
                    {t('Total Qty', 'စုစုပေါင်းအရေအတွက်')}: {totalReturnQty}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Additional Discount */}
          {selectedSale && selectedItemsCount > 0 && (
            <div className="return-form-group">
              <label>
                {t('Additional Discount (%)', 'ထပ်ဆောင်းလျှော့စျေး (%)')}
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <input
                  type="number"
                  value={additionalDiscountPercent}
                  onChange={(e) => onAdditionalDiscountChange(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                  max="100"
                  step="0.5"
                  disabled={loading}
                  style={{
                    width: '100px',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ddd',
                    textAlign: 'center'
                  }}
                />
                <span>%</span>
                <span style={{ fontSize: '12px', color: '#666', marginLeft: '10px' }}>
                  {t('(Discount will be applied to selected items only)', '(ရွေးချယ်ထားသော ပစ္စည်းများအတွက်သာ သက်ရောက်မည်)')}
                </span>
              </div>
            </div>
          )}

          {/* Reason for Return */}
          {selectedSale && (
            <div className="return-form-group">
              <label className="return-required">
                {t('Reason for Return', 'ပြန်အပ်ရသည့်အကြောင်းပြချက်')}
              </label>
              <select
                name="reason"
                value={returnForm.reason}
                onChange={onFormChange}
                disabled={loading}
                className={formErrors.reason ? 'return-input-error' : ''}
              >
                <option value="">{t('Select reason', 'အကြောင်းပြချက်ရွေးပါ')}</option>
                <option value="DEFECTIVE">{t('Defective Product', 'ချို့ယွင်းနေသောပစ္စည်း')}</option>
                <option value="WRONG_ITEM">{t('Wrong Item', 'ပစ္စည်းမှားယွင်း')}</option>
                <option value="NOT_AS_DESCRIBED">{t('Not as Described', 'ဖော်ပြချက်နှင့်မကိုက်ညီ')}</option>
                <option value="DAMAGED">{t('Damaged', 'ပျက်စီးနေ')}</option>
                <option value="CUSTOMER_CHANGED_MIND">{t('Customer Changed Mind', 'ဝယ်ယူသူစိတ်ပြောင်း')}</option>
                <option value="WRONG_SIZE">{t('Wrong Size/Color', 'အရွယ်အစား/အရောင်မှား')}</option>
                <option value="OTHER">{t('Other', 'အခြား')}</option>
              </select>
              {formErrors.reason && (
                <div className="return-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.reason}</span>
                </div>
              )}
            </div>
          )}

          {/* Refund Summary */}
          {selectedSale && selectedItemsCount > 0 && (
            <div className="return-refund-summary">
              <div style={{ marginBottom: '8px', paddingBottom: '4px', borderBottom: '1px solid #4361ee' }}>
                <span style={{ fontWeight: 'bold', color: '#4361ee' }}>
                  {t('Refund Breakdown', 'ပြန်အမ်းငွေအသေးစိတ်')}
                </span>
              </div>

              <div className="return-refund-row">
                <span>{t('Items Subtotal (after product discounts)', 'ပစ္စည်းတန်ဖိုး (လျှော့စျေးပြီး)')}:</span>
                <span>{formatCurrency(selectedSubtotal)}</span>
              </div>

              {productDiscountRefund > 0 && (
                <div className="return-refund-row" style={{ color: '#f59e0b' }}>
                  <span>
                    {t('Product Discount Refund', 'လျှော့ဈေးပြန်အမ်း')}
                    ({discountPercent.toFixed(1)}%):
                  </span>
                  <span>-{formatCurrency(productDiscountRefund)}</span>
                </div>
              )}

              {additionalDiscountPercent > 0 && (
                <div className="return-refund-row" style={{ color: '#f72585' }}>
                  <span>
                    {t('Additional Discount', 'ထပ်ဆောင်းလျှော့စျေး')}
                    ({additionalDiscountPercent}%):
                  </span>
                  <span>-{formatCurrency(additionalDiscountAmount)}</span>
                </div>
              )}

              <div className="return-refund-row">
                <span>
                  {t('Tax Refund', 'အခွန်ပြန်အမ်း')}
                  ({taxPercentage}%):
                </span>
                <span style={{ color: '#4cc9f0' }}>+{formatCurrency(taxRefund)}</span>
              </div>

              <div className="return-refund-row return-refund-total">
                <span style={{ fontWeight: 'bold', fontSize: '15px' }}>
                  {t('TOTAL REFUND', 'စုစုပေါင်းပြန်အမ်းငွေ')}:
                </span>
                <span style={{ fontWeight: 'bold', fontSize: '16px', color: '#4361ee' }}>
                  {formatCurrency(calculatedTotalRefund)}
                </span>
              </div>
            </div>
          )}

          {/* Notes */}
          {selectedSale && (
            <div className="return-form-group">
              <label>{t('Notes', 'မှတ်ချက်')}</label>
              <textarea
                name="notes"
                value={returnForm.notes}
                onChange={onFormChange}
                placeholder={t('Additional notes...', 'အပိုမှတ်ချက်များ...')}
                rows="3"
                disabled={loading}
              />
            </div>
          )}
        </div>

        <div className="return-modal-footer">
          <button className="return-btn-cancel" onClick={onClose} disabled={loading}>
            {t('Cancel', 'ပယ်ဖျက်')}
          </button>
          {selectedSale && (
            <button
              className="return-btn-submit"
              onClick={handleProcessClick}
              disabled={loading || selectedItemsCount === 0 || !returnForm.reason}
            >
              {loading ? (
                <>
                  <i className="fas fa-spinner fa-spin"></i>
                  {t('Processing...', 'လုပ်ဆောင်နေသည်...')}
                </>
              ) : (
                <>
                  <i className="fas fa-undo-alt"></i>
                  {t('Process Return', 'ပြန်အပ်နှံမည်')}
                  {calculatedTotalRefund > 0 && ` (${formatCurrency(calculatedTotalRefund)})`}
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReturnModal;