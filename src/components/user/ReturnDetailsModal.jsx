// ReturnDetailsModal.jsx (Demo — JSON only)
import React from 'react';

const ReturnDetailsModal = ({
  show,
  onClose,
  returnData,
  language,
  formatCurrency,
  formatDate
}) => {
  if (!show || !returnData) return null;

  const t = (en, mm) => language === 'mm' ? mm : en;

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return '#f72585';
      case 'processing': return '#f8961e';
      case 'completed': return '#4cc9f0';
      case 'rejected': return '#6c757d';
      default: return '#6c757d';
    }
  };

  const getStatusText = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending': return t('Pending', 'စောင့်ဆိုင်း');
      case 'processing': return t('Processing', 'လုပ်ဆောင်ဆဲ');
      case 'completed': return t('Completed', 'ပြီးမြောက်');
      case 'rejected': return t('Rejected', 'ပယ်ချ');
      default: return status;
    }
  };

  const getReturnTypeText = (type) => {
    if (type === 'FULL') return t('Full Return', 'အားလုံးပြန်အပ်');
    if (type === 'PARTIAL') return t('Partial Return', 'တစ်စိတ်တစ်ပိုင်းပြန်အပ်');
    return type;
  };

  const getReasonText = (reason) => {
    const reasons = {
      'DEFECTIVE': t('Defective Product', 'ချို့ယွင်းနေသောပစ္စည်း'),
      'WRONG_ITEM': t('Wrong Item', 'ပစ္စည်းမှားယွင်း'),
      'NOT_AS_DESCRIBED': t('Not as Described', 'ဖော်ပြချက်နှင့်မကိုက်ညီ'),
      'DAMAGED': t('Damaged', 'ပျက်စီးနေ'),
      'CUSTOMER_CHANGED_MIND': t('Customer Changed Mind', 'ဝယ်ယူသူစိတ်ပြောင်း'),
      'WRONG_SIZE': t('Wrong Size/Color', 'အရွယ်အစား/အရောင်မှား'),
      'OTHER': t('Other', 'အခြား')
    };
    return reasons[reason] || reason;
  };

  return (
    <div className="return-modal-overlay">
      <div className="return-modal-content" style={{ maxWidth: '800px' }}>
        <div className="return-modal-header">
          <h3>
            <i className="fas fa-undo-alt"></i>
            {t('Return Details', 'ပြန်လည်အပ်နှံမှုအသေးစိတ်')}
          </h3>
          <button className="return-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="return-modal-body">
          {/* Return Header with Status */}
          <div className="return-details-header">
            <div className="return-details-title">
              <span className="return-details-label">{t('Return No', 'ပြန်အပ်နှံမှုနံပါတ်')}:</span>
              <span className="return-details-value">{returnData.returnNo}</span>
            </div>
            <div className="return-details-title">
              <span className="return-details-label">{t('Invoice No', 'ဘေလ်နံပါတ်')}:</span>
              <span className="return-details-value">{returnData.invoiceNo}</span>
            </div>
            <div className="return-details-title">
              <span className="return-details-label">{t('Status', 'အခြေအနေ')}:</span>
              <span className="return-details-status" style={{
                backgroundColor: getStatusColor(returnData.status),
                color: 'white',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                display: 'inline-block'
              }}>
                {getStatusText(returnData.status)}
              </span>
            </div>
          </div>

          {/* Customer Information */}
          <div className="return-details-section">
            <h4 className="return-details-section-title">
              <i className="fas fa-user"></i> {t('Customer Information', 'ဝယ်ယူသူအချက်အလက်')}
            </h4>
            <div className="return-details-grid">
              <div className="return-details-row">
                <span className="return-details-label">{t('Name', 'အမည်')}:</span>
                <span className="return-details-value">{returnData.customerName}</span>
              </div>
              <div className="return-details-row">
                <span className="return-details-label">{t('Phone', 'ဖုန်း')}:</span>
                <span className="return-details-value">{returnData.customerPhone || '-'}</span>
              </div>
              <div className="return-details-row">
                <span className="return-details-label">{t('Date', 'ရက်စွဲ')}:</span>
                <span className="return-details-value">{formatDate(returnData.createdAt)}</span>
              </div>
              <div className="return-details-row">
                <span className="return-details-label">{t('Payment Method', 'ငွေပေးချေမှု')}:</span>
                <span className="return-details-value">{returnData.paymentMethod}</span>
              </div>
            </div>
          </div>

          {/* Return Information */}
          <div className="return-details-section">
            <h4 className="return-details-section-title">
              <i className="fas fa-info-circle"></i> {t('Return Information', 'ပြန်အပ်နှံမှုအချက်အလက်')}
            </h4>
            <div className="return-details-grid">
              <div className="return-details-row">
                <span className="return-details-label">{t('Return Type', 'အမျိုးအစား')}:</span>
                <span className="return-details-value">
                  <span className="return-type-badge" style={{
                    backgroundColor: returnData.returnType === 'FULL' ? '#4361ee' : '#f8961e',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: '600'
                  }}>
                    {getReturnTypeText(returnData.returnType)}
                  </span>
                </span>
              </div>
              <div className="return-details-row">
                <span className="return-details-label">{t('Reason', 'အကြောင်းပြချက်')}:</span>
                <span className="return-details-value">{getReasonText(returnData.reason)}</span>
              </div>
              <div className="return-details-row">
                <span className="return-details-label">{t('Total Items', 'စုစုပေါင်းပစ္စည်း')}:</span>
                <span className="return-details-value">{returnData.totalItems || 0}</span>
              </div>
              <div className="return-details-row">
                <span className="return-details-label">{t('Total Quantity', 'စုစုပေါင်းအရေအတွက်')}:</span>
                <span className="return-details-value">{returnData.totalQuantity || 0}</span>
              </div>
            </div>
          </div>

          {/* Refund Summary */}
          <div className="return-details-section">
            <h4 className="return-details-section-title">
              <i className="fas fa-money-bill-wave"></i> {t('Refund Summary', 'ပြန်အမ်းငွေအကျဉ်းချုပ်')}
            </h4>
            <div className="return-refund-summary-box">
              <div className="return-refund-row">
                <span>{t('Refund Amount', 'ပြန်အမ်းငွေ')}:</span>
                <span>{formatCurrency(returnData.refundAmount)}</span>
              </div>
              <div className="return-refund-row">
                <span>{t('Tax Refund', 'အခွန်ပြန်အမ်း')}:</span>
                <span>{formatCurrency(returnData.taxRefund || 0)}</span>
              </div>
              <div className="return-refund-row return-refund-total">
                <span>{t('Total Refund', 'စုစုပေါင်းပြန်အမ်းငွေ')}:</span>
                <span>{formatCurrency(returnData.totalRefund)}</span>
              </div>
            </div>
          </div>

          {/* Returned Items */}
          {returnData.items && returnData.items.length > 0 && (
            <div className="return-details-section">
              <h4 className="return-details-section-title">
                <i className="fas fa-boxes"></i> {t('Returned Items', 'ပြန်အပ်နှံထားသောပစ္စည်းများ')}
              </h4>
              <div className="return-items-details-table-container">
                <table className="return-items-details-table">
                  <thead>
                    <tr>
                      <th>{t('No', 'စဉ်')}</th>
                      <th>{t('Product', 'ပစ္စည်း')}</th>
                      <th>{t('SKU/Barcode', 'ကုဒ်')}</th>
                      <th>{t('Qty', 'အရေအတွက်')}</th>
                      <th>{t('Unit Price', 'တစ်ခုဈေး')}</th>
                      <th>{t('Total', 'စုစုပေါင်း')}</th>
                      <th>{t('Batch ID', 'Batch နံပါတ်')}</th>
                      <th>{t('Reason', 'အကြောင်းပြချက်')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {returnData.items.map((item, index) => (
                      <tr key={item.id || index}>
                        <td>{index + 1}</td>
                        <td>
                          <div className="return-item-name">{item.productName}</div>
                        </td>
                        <td>
                          <div className="return-item-codes">
                            <span className="return-item-sku">{item.sku || '-'}</span>
                            <span className="return-item-barcode">{item.barcode || '-'}</span>
                          </div>
                        </td>
                        <td className="return-item-qty">{item.quantity}</td>
                        <td className="return-item-price">{formatCurrency(item.unitPrice)}</td>
                        <td className="return-item-total">{formatCurrency(item.quantity * item.unitPrice)}</td>
                        <td>
                          <span className="return-batch-id">BATCH-{item.batchId}</span>
                        </td>
                        <td>
                          <div className="return-item-reason" title={item.reason}>
                            {item.reason && item.reason.length > 20
                              ? item.reason.substring(0, 20) + '...'
                              : item.reason || '-'}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notes */}
          {returnData.notes && (
            <div className="return-details-section">
              <h4 className="return-details-section-title">
                <i className="fas fa-sticky-note"></i> {t('Notes', 'မှတ်ချက်')}
              </h4>
              <div className="return-notes-box">
                <p>{returnData.notes}</p>
              </div>
            </div>
          )}

          {/* Created By */}
          <div className="return-details-footer">
            <div className="return-created-by">
              <i className="fas fa-user-circle"></i>
              <span>
                {t('Created by', 'ဖန်တီးသူ')}: <strong>{returnData.createdByName || 'System'}</strong>
                {returnData.createdByRole && <span> ({returnData.createdByRole})</span>}
              </span>
            </div>
            <div className="return-created-at">
              <i className="fas fa-clock"></i>
              <span>{formatDate(returnData.createdAt)} {returnData.createdAt ? new Date(returnData.createdAt).toLocaleTimeString() : ''}</span>
            </div>
          </div>
        </div>

        <div className="return-modal-footer">
          <button className="return-btn-cancel" onClick={onClose}>
            {t('Close', 'ပိတ်မည်')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReturnDetailsModal;