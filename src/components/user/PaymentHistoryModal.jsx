import React, { useEffect, useState } from 'react';

const PaymentHistoryModal = ({
  show,
  onClose,
  credit,
  payments,
  language,
  formatCurrency,
  formatDate,
  getPaymentMethodText,
  onAddPayment,
  onEditPayment,
  onRefresh // NEW: callback to refresh credit data
}) => {
  const [localCredit, setLocalCredit] = useState(credit);
  const [localPayments, setLocalPayments] = useState(payments);

  // Update local state when props change
  useEffect(() => {
    if (credit) {
      setLocalCredit(credit);
    }
  }, [credit]);

  useEffect(() => {
    if (payments) {
      setLocalPayments(payments);
    }
  }, [payments]);

  // Refresh data when modal opens
  useEffect(() => {
    if (show && onRefresh) {
      onRefresh();
    }
  }, [show, onRefresh]);

  if (!show || !localCredit) return null;

  const t = (en, mm) => language === 'mm' ? mm : en;

  return (
    <div className="credit-modal-overlay">
      <div className="credit-modal-content" style={{ maxWidth: '900px' }}>
        <div className="credit-modal-header">
          <h3>
            <i className="fas fa-history"></i>
            {t('Payment History', 'ငွေပေးချေမှု မှတ်တမ်း')} - {localCredit.customerName}
          </h3>
          <button className="credit-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="credit-modal-body">
          {/* Summary Card - using localCredit */}
          <div className="credit-summary-card">
            <div className="credit-summary-item">
              <div className="credit-summary-label">{t('Total', 'စုစုပေါင်း')}</div>
              <div className="credit-summary-value">{formatCurrency(localCredit.totalAmount)}</div>
            </div>
            <div className="credit-summary-item">
              <div className="credit-summary-label">{t('Paid', 'ပေးချေပြီး')}</div>
              <div className="credit-summary-value credit-summary-paid">{formatCurrency(localCredit.paidAmount)}</div>
            </div>
            <div className="credit-summary-item">
              <div className="credit-summary-label">{t('Remaining', 'ကျန်ငွေ')}</div>
              <div className="credit-summary-value credit-summary-remaining">{formatCurrency(localCredit.remainingAmount)}</div>
            </div>
            <div className="credit-summary-item">
              <div className="credit-summary-label">{t('Status', 'အခြေအနေ')}</div>
              <div className="credit-summary-status">
                <span className={`credit-status-badge ${
                  localCredit.status === 'paid' ? 'credit-status-paid' :
                  localCredit.status === 'pending' ? 'credit-status-pending' :
                  localCredit.status === 'overdue' ? 'credit-status-overdue' :
                  'credit-status-partial'
                }`}>
                  {localCredit.status === 'paid' ? t('Paid', 'ပေးချေပြီး') :
                   localCredit.status === 'pending' ? t('Pending', 'ဆိုင်ငံ့') :
                   localCredit.status === 'overdue' ? t('Overdue', 'နောက်ကျ') :
                   t('Partially Paid', 'တစ်စိတ်တစ်ပိုင်း')}
                </span>
              </div>
            </div>
          </div>

          {/* Payment History Table - using localPayments */}
          <div className="credit-payment-history">
            <h4 className="credit-history-title">
              <i className="fas fa-receipt"></i> {t('Payment History', 'ငွေပေးချေမှု မှတ်တမ်း')}
              <span className="credit-history-count">{localPayments?.length || 0} {t('payments', 'ကြိမ်')}</span>
            </h4>

            {localPayments && localPayments.length > 0 ? (
              <div className="credit-history-table">
                <table>
                  <thead>
                    <tr>
                      <th>{t('Date', 'ရက်')}</th>
                      {/* <th>{t('Reference', 'ရည်ညွှန်း')}</th> */}
                      <th>{t('Amount', 'ပမာဏ')}</th>
                      <th>{t('Method', 'နည်းလမ်း')}</th>
                      <th>{t('Collected By', 'ကောက်ခံသူ')}</th>
                      <th>{t('Notes', 'မှတ်ချက်')}</th>
                      <th>{t('Actions', 'လုပ်ဆောင်ချက်')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {localPayments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.paymentDate)}</td>
                        {/* <td>{payment.referenceNo || '-'}</td> */}
                        <td className="credit-history-amount">{formatCurrency(payment.paymentAmount)}</td>
                        <td>
                          <span className="credit-payment-method">
                            {getPaymentMethodText(payment.paymentMethod, language)}
                          </span>
                        </td>
                        <td>{payment.createdByName || '-'}</td>
                        <td className="credit-history-notes" title={payment.notes}>
                          {payment.notes || '-'}
                        </td>
                        <td>
                          <button 
                            className="credit-action-btn credit-action-edit" 
                            style={{ width: '28px', height: '28px' }}
                            title={t('Edit Payment', 'ငွေပေးချေမှု ပြင်ဆင်ရန်')}
                            onClick={() => onEditPayment(payment)}
                          >
                            <i className="fas fa-edit" style={{ fontSize: '12px' }}></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan="2"><strong>{t('Total', 'စုစုပေါင်း')}</strong></td>
                      <td className="credit-history-total">
                        <strong>{formatCurrency(localPayments.reduce((sum, p) => sum + p.paymentAmount, 0))}</strong>
                      </td>
                      <td colSpan="4"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            ) : (
              <div className="credit-no-history">
                <i className="fas fa-receipt"></i>
                <p>{t('No payment history found.', 'ငွေပေးချေမှု မှတ်တမ်း မတွေ့ပါ။')}</p>
              </div>
            )}
          </div>
        </div>
        <div className="credit-modal-footer">
          <button className="credit-btn-cancel" onClick={onClose}>
            {t('Close', 'ပိတ်မည်')}
          </button>
          {localCredit.remainingAmount > 0 && (
            <button className="credit-btn-submit" onClick={onAddPayment}>
              <i className="fas fa-plus-circle"></i> {t('Add Payment', 'ငွေပေးချေမှုထည့်ရန်')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentHistoryModal;