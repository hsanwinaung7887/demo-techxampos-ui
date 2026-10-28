import React, { useState } from 'react';

const CreditModal = ({
  show,
  onClose,
  modalType,
  creditForm,
  onFormChange,
  onSave,
  loading,
  validationError,
  formErrors,
  currentUser,
  language,
  isFormValid,
  formatCurrency,
  recentInvoices = [],
  onSearchInvoice,
  onSelectInvoice,
  searchLoading = false,
  searchResults = []
}) => {
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!show) return null;

  const t = (en, mm) => language === 'mm' ? mm : en;

  // Handle invoice search
  const handleSearch = () => {
    if (searchQuery.trim()) {
      onSearchInvoice(searchQuery);
      setShowSearchResults(true);
    }
  };

  // Handle invoice selection from search results
  const handleSelectInvoice = (invoice) => {
    onSelectInvoice(invoice);
    setShowSearchResults(false);
    setSearchQuery('');
  };

  return (
    <div className="credit-modal-overlay">
      <div className="credit-modal-content">
        <div className="credit-modal-header">
          <h3>
            <i className={`fas ${modalType === 'add' ? 'fa-plus-circle' : 'fa-edit'}`}></i>
            {modalType === 'add' 
              ? t('Add New Credit', 'အကြွေးအသစ် ထည့်ရန်')
              : t('Edit Credit', 'အကြွေး ပြင်ဆင်ရန်')
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

          {validationError && (
            <div className="credit-validation-error" style={{ marginBottom: '15px' }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{validationError}</span>
            </div>
          )}

          {/* ===== Invoice Selection Section (Only for add mode) ===== */}
          {modalType === 'add' && (
            <div className="credit-form-group">
              <label className="credit-required">
                {t('Select Invoice', 'Invoice ရွေးချယ်ပါ')}
              </label>
              
              {/* Recent Invoices Dropdown */}
              <div style={{ position: 'relative', marginBottom: '10px' }}>
                <div 
                  className="credit-input-with-symbol"
                  style={{ cursor: 'pointer' }}
                  onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                >
                  <input
                    type="text"
                    value={creditForm.invoiceNo || t('Select recent invoice', 'လတ်တလော Invoice ရွေးပါ')}
                    readOnly
                    style={{ backgroundColor: '#f8f9fa', cursor: 'pointer' }}
                  />
                  <span className="credit-input-symbol">
                    <i className={`fas fa-chevron-${showRecentDropdown ? 'up' : 'down'}`}></i>
                  </span>
                </div>

                {/* Recent Invoices Dropdown Menu */}
                {showRecentDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid var(--credit-gray-light)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    marginTop: '5px'
                  }}>
                    {recentInvoices.length > 0 ? (
                      recentInvoices.map(invoice => (
                        <div
                          key={invoice.id}
                          style={{
                            padding: '12px 15px',
                            borderBottom: '1px solid var(--credit-gray-light)',
                            cursor: 'pointer',
                            transition: 'background 0.2s'
                          }}
                          onClick={() => {
                            onSelectInvoice(invoice);
                            setShowRecentDropdown(false);
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                              <strong style={{ color: '#4361ee' }}>{invoice.invoiceNo}</strong>
                              <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '4px' }}>
                                <i className="fas fa-user"></i> {invoice.customerName}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: '600', color: '#2ecc71' }}>
                                {formatCurrency(invoice.totalAmount)}
                              </div>
                              <div style={{ fontSize: '12px', color: '#6c757d' }}>
                                {invoice.saleDate}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div style={{ padding: '20px', textAlign: 'center', color: '#6c757d' }}>
                        <i className="fas fa-receipt" style={{ fontSize: '24px', marginBottom: '10px', display: 'block' }}></i>
                        {t('No recent invoices found', 'လတ်တလော Invoice မတွေ့ပါ')}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* OR Divider */}
              <div style={{ display: 'flex', alignItems: 'center', margin: '15px 0' }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--credit-gray-light)' }}></div>
                <span style={{ margin: '0 15px', color: 'var(--credit-gray)', fontSize: '14px' }}>
                  {t('OR', 'သို့မဟုတ်')}
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--credit-gray-light)' }}></div>
              </div>

              {/* Search Invoice */}
              <div style={{ position: 'relative' }}>
                <div className="credit-input-with-symbol">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={t('Search invoice by number or customer', 'Invoice နံပါတ် သို့မဟုတ် ဝယ်ယူသူအမည်ဖြင့်ရှာပါ')}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <span className="credit-input-symbol">
                    {searchLoading ? (
                      <i className="fas fa-spinner fa-spin"></i>
                    ) : (
                      <i className="fas fa-search" style={{ cursor: 'pointer' }} onClick={handleSearch}></i>
                    )}
                  </span>
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    maxHeight: '300px',
                    overflowY: 'auto',
                    backgroundColor: 'white',
                    border: '1px solid var(--credit-gray-light)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    marginTop: '5px'
                  }}>
                    {searchResults.map(invoice => (
                      <div
                        key={invoice.id}
                        style={{
                          padding: '12px 15px',
                          borderBottom: '1px solid var(--credit-gray-light)',
                          cursor: 'pointer'
                        }}
                        onClick={() => handleSelectInvoice(invoice)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f0f7ff'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <strong style={{ color: '#4361ee' }}>{invoice.invoiceNo}</strong>
                            <div style={{ fontSize: '13px', color: '#6c757d', marginTop: '4px' }}>
                              <i className="fas fa-user"></i> {invoice.customerName}
                            </div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontWeight: '600', color: '#2ecc71' }}>
                              {formatCurrency(invoice.totalAmount)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6c757d' }}>
                              {invoice.saleDate}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {showSearchResults && searchQuery && searchResults.length === 0 && !searchLoading && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    padding: '20px',
                    backgroundColor: 'white',
                    border: '1px solid var(--credit-gray-light)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                    zIndex: 1000,
                    marginTop: '5px',
                    textAlign: 'center',
                    color: '#6c757d'
                  }}>
                    <i className="fas fa-search" style={{ fontSize: '20px', marginBottom: '8px', display: 'block' }}></i>
                    {t('No invoices found', 'Invoice မတွေ့ပါ')}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice No (readonly for both modes - auto-filled) */}
          <div className="credit-form-group">
            <label>{t('Invoice No', 'Invoice နံပါတ်')}</label>
            <input
              type="text"
              name="invoiceNo"
              value={creditForm.invoiceNo}
              onChange={onFormChange}
              placeholder={t('Invoice number', 'Invoice နံပါတ်')}
              maxLength="50"
              disabled={true}
              className="credit-input-disabled"
            />
          </div>

          {/* 🔴 FIXED: Customer fields are now editable */}
          <div className="credit-form-row">
            <div className="credit-form-group">
              <label className="credit-required">
                {t('Customer Name', 'ဝယ်ယူသူအမည်')}
              </label>
              <input
                type="text"
                name="customerName"
                value={creditForm.customerName}
                onChange={onFormChange}
                placeholder={t('Enter customer name', 'ဝယ်ယူသူအမည်ရေးပါ')}
                maxLength="100"
                disabled={loading}
                className={formErrors.customerName ? 'credit-input-error' : ''}
                // 🔴 REMOVED: readOnly attribute
              />
              {formErrors.customerName && (
                <div className="credit-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.customerName}</span>
                </div>
              )}
            </div>
            <div className="credit-form-group">
              <label>{t('Phone', 'ဖုန်း')}</label>
              <input
                type="text"
                name="phone"
                value={creditForm.phone}
                onChange={onFormChange}
                placeholder="09xxxxxxxxx"
                maxLength="15"
                disabled={loading}
                // 🔴 REMOVED: readOnly attribute
              />
            </div>
          </div>

          <div className="credit-form-row">
            <div className="credit-form-group">
              <label>{t('Email', 'အီးမေး')}</label>
              <input
                type="email"
                name="email"
                value={creditForm.email}
                onChange={onFormChange}
                placeholder="customer@email.com"
                maxLength="100"
                disabled={loading}
                // 🔴 REMOVED: readOnly attribute
              />
            </div>
            <div className="credit-form-group">
              <label>{t('Address', 'လိပ်စာ')}</label>
              <input
                type="text"
                name="address"
                value={creditForm.address}
                onChange={onFormChange}
                placeholder={t('Customer address', 'ဝယ်ယူသူလိပ်စာ')}
                maxLength="255"
                disabled={loading}
                // 🔴 REMOVED: readOnly attribute
              />
            </div>
          </div>

          {/* Amount fields */}
          <div className="credit-form-row">
            <div className="credit-form-group">
              <label className="credit-required">{t('Total Amount', 'စုစုပေါင်းပမာဏ')}</label>
              <div className="credit-input-with-symbol">
                <input
                  type="number"
                  name="totalAmount"
                  value={creditForm.totalAmount}
                  onChange={onFormChange}
                  placeholder="0"
                  min="0"
                  step="100"
                  disabled={loading}
                  className={formErrors.totalAmount ? 'credit-input-error' : ''}
                />
                <span className="credit-input-symbol">Ks</span>
              </div>
              {formErrors.totalAmount && (
                <div className="credit-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.totalAmount}</span>
                </div>
              )}
            </div>
          </div>

          <div className="credit-form-group">
            <label>{t('Due Date', 'နောက်ဆုံးရက်')}</label>
            <input
              type="date"
              name="dueDate"
              value={creditForm.dueDate}
              onChange={onFormChange}
              disabled={loading}
            />
          </div>

          <div className="credit-form-group">
            <label>{t('Notes', 'မှတ်ချက်')}</label>
            <textarea
              name="notes"
              value={creditForm.notes}
              onChange={onFormChange}
              placeholder={t('Additional notes...', 'အပိုမှတ်ချက်များ...')}
              rows="3"
              maxLength="500"
              disabled={loading}
            />
          </div>

          {/* Status Display */}
          <div className="credit-form-group">
            <label>{t('Status', 'အခြေအနေ')}</label>
            <div className="credit-status-display">
              <span className={`credit-status-badge ${
                (parseFloat(creditForm.totalAmount) || 0) - (parseFloat(creditForm.paidAmount) || 0) <= 0 
                  ? 'credit-status-paid' 
                  : parseFloat(creditForm.paidAmount) > 0 
                    ? 'credit-status-partial' 
                    : 'credit-status-pending'
              }`}>
                {(parseFloat(creditForm.totalAmount) || 0) - (parseFloat(creditForm.paidAmount) || 0) <= 0 
                  ? t('Paid', 'ပေးချေပြီး')
                  : parseFloat(creditForm.paidAmount) > 0 
                    ? t('Partially Paid', 'တစ်စိတ်တစ်ပိုင်း')
                    : t('Pending', 'ဆိုင်ငံ့')
                }
              </span>
            </div>
          </div>
        </div>
        <div className="credit-modal-footer">
          <button className="credit-btn-cancel" onClick={onClose} disabled={loading}>
            {t('Cancel', 'ပယ်ဖျက်မည်')}
          </button>
          <button
            className={`credit-btn-submit ${loading ? 'loading' : ''}`}
            onClick={onSave}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {t('Processing...', 'လုပ်ဆောင်နေသည်...')}
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {modalType === 'add'
                  ? t('Add Credit', 'အကြွေးထည့်မည်')
                  : t('Save Changes', 'သိမ်းဆည်းမည်')
                }
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreditModal;