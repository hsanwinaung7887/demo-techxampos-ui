import React from 'react';

const DiscountModal = ({
  show,
  onClose,
  modalType,
  discountForm,
  onFormChange,
  onTypeChange,
  onStatusChange,
  onApplicableToChange,
  onSave,
  loading,
  validationError,
  formErrors,
  currentUser,
  language,
  categories,
  isFormValid,
  formatCurrency,
  calculateDiscountValue,
  openProductSelector,
  generateDiscountCode,
  formatDate
}) => {
  if (!show) return null;

  const t = (en, mm) => language === 'mm' ? mm : en;

  const renderTypeSpecificFields = () => {
    switch(discountForm.type) {
      case 'Percentage':
        return (
          <div className="disc-form-group">
            <label className="disc-required">
              {t('Discount Percentage', 'လျှော့ဈေး ရာခိုင်နှုန်း')}
            </label>
            <div className="disc-value-input">
              <input
                type="number"
                name="discountValue"
                value={discountForm.discountValue}
                onChange={onFormChange}
                placeholder={t('Enter percentage', 'ရာခိုင်နှုန်း ရိုက်ထည့်ပါ')}
                min="1"
                max="100"
                step="0.01"
                className={formErrors.discountValue ? 'disc-input-error' : ''}
              />
              <span className="disc-value-suffix">%</span>
            </div>
            {formErrors.discountValue && (
              <div className="disc-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.discountValue}</span>
              </div>
            )}
          </div>
        );

      case 'Fixed':
        return (
          <div className="disc-form-group">
            <label className="disc-required">
              {t('Discount Amount', 'လျှော့ဈေး ပမာဏ')}
            </label>
            <div className="disc-value-input">
              <span className="disc-value-prefix">Ks</span>
              <input
                type="number"
                name="discountValue"
                value={discountForm.discountValue}
                onChange={onFormChange}
                placeholder={t('Enter amount', 'ပမာဏ ရိုက်ထည့်ပါ')}
                min="1"
                step="100"
                className={formErrors.discountValue ? 'disc-input-error' : ''}
              />
            </div>
            {formErrors.discountValue && (
              <div className="disc-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.discountValue}</span>
              </div>
            )}
          </div>
        );

      case 'Buy Amount':
        return (
          <>
            <div className="disc-form-row">
              <div className="disc-form-group">
                <label className="disc-required">
                  {t('Minimum Purchase', 'အနည်းဆုံး ဝယ်ယူငွေ')}
                </label>
                <div className="disc-value-input">
                  <span className="disc-value-prefix">Ks</span>
                  <input
                    type="number"
                    name="minPurchase"
                    value={discountForm.minPurchase}
                    onChange={onFormChange}
                    placeholder={t('Enter amount', 'ပမာဏ ရိုက်ထည့်ပါ')}
                    min="1"
                    step="100"
                    className={formErrors.minPurchase ? 'disc-input-error' : ''}
                  />
                </div>
                {formErrors.minPurchase && (
                  <div className="disc-field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{formErrors.minPurchase}</span>
                  </div>
                )}
              </div>
              <div className="disc-form-group">
                <label className="disc-required">
                  {t('Discount Amount', 'လျှော့ဈေး ပမာဏ')}
                </label>
                <div className="disc-value-input">
                  <span className="disc-value-prefix">Ks</span>
                  <input
                    type="number"
                    name="discountAmount"
                    value={discountForm.discountAmount}
                    onChange={onFormChange}
                    placeholder={t('Enter amount', 'ပမာဏ ရိုက်ထည့်ပါ')}
                    min="1"
                    step="100"
                    className={formErrors.discountAmount ? 'disc-input-error' : ''}
                  />
                </div>
                {formErrors.discountAmount && (
                  <div className="disc-field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{formErrors.discountAmount}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      case 'BuyXGetY':
        return (
          <div className="disc-form-row">
            <div className="disc-form-group">
              <label className="disc-required">
                {t('Buy Quantity', 'ဝယ်ယူရမည့်အရေအတွက်')}
              </label>
              <input
                type="number"
                name="buyQuantity"
                value={discountForm.buyQuantity}
                onChange={onFormChange}
                placeholder={t('Enter quantity', 'အရေအတွက် ရိုက်ထည့်ပါ')}
                min="1"
                className={formErrors.buyQuantity ? 'disc-input-error' : ''}
              />
              {formErrors.buyQuantity && (
                <div className="disc-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.buyQuantity}</span>
                </div>
              )}
            </div>
            <div className="disc-form-group">
              <label className="disc-required">
                {t('Get Quantity Free', 'အပိုရရန် အရေအတွက်')}
              </label>
              <input
                type="number"
                name="getQuantity"
                value={discountForm.getQuantity}
                onChange={onFormChange}
                placeholder={t('Enter quantity', 'အရေအတွက် ရိုက်ထည့်ပါ')}
                min="1"
                className={formErrors.getQuantity ? 'disc-input-error' : ''}
              />
              {formErrors.getQuantity && (
                <div className="disc-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.getQuantity}</span>
                </div>
              )}
            </div>
          </div>
        );

      case 'Time Based':
        return (
          <>
            <div className="disc-form-group">
              <label className="disc-required">
                {t('Discount Percentage', 'လျှော့ဈေး ရာခိုင်နှုန်း')}
              </label>
              <div className="disc-value-input">
                <input
                  type="number"
                  name="discountValue"
                  value={discountForm.discountValue}
                  onChange={onFormChange}
                  placeholder={t('Enter percentage', 'ရာခိုင်နှုန်း ရိုက်ထည့်ပါ')}
                  min="1"
                  max="100"
                  step="0.01"
                  className={formErrors.discountValue ? 'disc-input-error' : ''}
                />
                <span className="disc-value-suffix">%</span>
              </div>
              {formErrors.discountValue && (
                <div className="disc-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.discountValue}</span>
                </div>
              )}
            </div>
            <div className="disc-form-row">
              <div className="disc-form-group">
                <label className="disc-required">
                  {t('Start Time', 'စတင်ချိန်')}
                </label>
                <input
                  type="time"
                  name="startTime"
                  value={discountForm.startTime}
                  onChange={onFormChange}
                  className={formErrors.startTime ? 'disc-input-error' : ''}
                />
                {formErrors.startTime && (
                  <div className="disc-field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{formErrors.startTime}</span>
                  </div>
                )}
              </div>
              <div className="disc-form-group">
                <label className="disc-required">
                  {t('End Time', 'ပြီးဆုံးချိန်')}
                </label>
                <input
                  type="time"
                  name="endTime"
                  value={discountForm.endTime}
                  onChange={onFormChange}
                  className={formErrors.endTime ? 'disc-input-error' : ''}
                />
                {formErrors.endTime && (
                  <div className="disc-field-error">
                    <i className="fas fa-exclamation-circle"></i>
                    <span>{formErrors.endTime}</span>
                  </div>
                )}
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  // FIXED: renderApplicableToFields - ပစ္စည်းအားလုံးရွေးရင် message ပြမယ်
  const renderApplicableToFields = () => {
    return (
      <div className="disc-form-group">
        <label className="disc-required">
          {t('Apply Discount To', 'လျှော့ဈေး အကျုံးဝင်မှု')}
        </label>
        <div className="disc-applicable-selector">
          <div 
            className={`disc-applicable-option ${discountForm.applicableTo === 'all' ? 'selected' : ''}`}
            onClick={() => onApplicableToChange('all')}
          >
            <i className="fas fa-boxes"></i>
            <span>{t('All Products', 'ပစ္စည်းအားလုံး')}</span>
          </div>
          <div 
            className={`disc-applicable-option ${discountForm.applicableTo === 'selected' ? 'selected' : ''}`}
            onClick={() => {
              // When clicking "Selected Products", open product selector WITHOUT auto-selecting all
              onApplicableToChange('selected');
              openProductSelector();
            }}
          >
            <i className="fas fa-check-square"></i>
            <span>{t('Selected Products', 'ရွေးချယ်ထားသော ပစ္စည်း')}</span>
          </div>
        </div>

        {discountForm.applicableTo === 'selected' && (
          <div className="disc-form-group" style={{ marginTop: '15px' }}>
            <label>{t('Selected Products', 'ရွေးချယ်ထားသော ပစ္စည်း')}</label>
            <div className="disc-selected-products-preview">
              <div className="disc-selected-count">
                <i className="fas fa-check-circle"></i>
                {t(
                  `${discountForm.selectedProductIds.length} products selected`,
                  `ပစ္စည်း ${discountForm.selectedProductIds.length} ခု ရွေးချယ်ထားသည်`
                )}
              </div>
              <button 
                type="button"
                className="disc-select-products-btn"
                onClick={() => {
                  // Pass current selected products to selector
                  openProductSelector();
                }}
              >
                <i className="fas fa-edit"></i> {discountForm.selectedProductIds.length > 0 
                  ? t('Edit', 'ပြင်ဆင်မည်')
                  : t('Select', 'ရွေးချယ်မည်')
                }
              </button>
            </div>
            {formErrors.selectedProductIds && (
              <div className="disc-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.selectedProductIds}</span>
              </div>
            )}
          </div>
        )}

        {discountForm.applicableTo === 'all' && (
          <div className="disc-form-group" style={{ marginTop: '15px' }}>
            <div style={{
              background: '#eef2ff',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #4361ee20'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
                color: '#4361ee',
                fontWeight: '600'
              }}>
                <i className="fas fa-check-circle"></i>
                <span>
                  {t(
                    'All Products Selected',
                    'ပစ္စည်းအားလုံး ရွေးချယ်ထားသည်'
                  )}
                </span>
              </div>
              <div style={{
                fontSize: '13px',
                color: '#666',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <i className="fas fa-info-circle" style={{ color: '#4361ee' }}></i>
                {t(
                  `This discount will apply to all active products in this branch`,
                  `ဤလျှော့ဈေးသည် ဌာနခွဲရှိ ပစ္စည်းအားလုံးအတွက် အကျုံးဝင်မည်`
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="disc-modal-overlay">
      <div className="disc-modal-content">
        <div className="disc-modal-header">
          <h3>
            <i className={`fas ${modalType === 'add' ? 'fa-plus-circle' : 'fa-edit'}`}></i>
            {modalType === 'add' 
              ? t('Add New Discount', 'လျှော့ဈေးအသစ် ထည့်ရန်')
              : t('Edit Discount', 'လျှော့ဈေး ပြင်ဆင်ရန်')
            }
          </h3>
          <button className="disc-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="disc-modal-body">
          <div className="disc-current-user-banner">
            <i className="fas fa-user-circle"></i>
            <div>
              <div className="disc-user-name">{currentUser?.username || currentUser?.name}</div>
              <div className="disc-user-role">{currentUser?.role}</div>
            </div>
          </div>

          {validationError && (
            <div className="disc-validation-error" style={{ marginBottom: '15px' }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{validationError}</span>
            </div>
          )}

          <div className="disc-form-group">
            <label className="disc-required">
              {t('Discount Name', 'လျှော့ဈေး အမည်')}
            </label>
            <input
              type="text"
              name="name"
              value={discountForm.name}
              onChange={onFormChange}
              placeholder={t('Enter discount name', 'လျှော့ဈေး အမည် ရိုက်ထည့်ပါ')}
              maxLength="100"
              disabled={loading}
              className={formErrors.name ? 'disc-input-error' : ''}
            />
            {formErrors.name && (
              <div className="disc-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.name}</span>
              </div>
            )}
          </div>

          <div className="disc-form-group">
            <label className="disc-required">
              {t('Discount Code', 'လျှော့ဈေး ကုဒ်')}
            </label>
            <div className="disc-code-input-group">
              <input
                type="text"
                name="code"
                value={discountForm.code}
                onChange={onFormChange}
                placeholder={t('Enter discount code', 'လျှော့ဈေး ကုဒ် ရိုက်ထည့်ပါ')}
                maxLength="50"
                disabled={loading}
                className={formErrors.code ? 'disc-input-error' : ''}
              />
              <button className="disc-generate-code-btn" onClick={generateDiscountCode} type="button" disabled={loading}>
                <i className="fas fa-barcode"></i> {t('Generate', 'ကုဒ်ထုတ်မည်')}
              </button>
            </div>
            {formErrors.code && (
              <div className="disc-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.code}</span>
              </div>
            )}
          </div>

          <div className="disc-form-group">
            <label className="disc-required">
              {t('Discount Type', 'လျှော့ဈေး အမျိုးအစား')}
            </label>
            {/* <div className="disc-type-selector">
              {['Percentage', 'Fixed', 'Buy Amount', 'BuyXGetY', 'Time Based'].map(type => (
                <div 
                  key={type}
                  className={`disc-type-option ${discountForm.type === type ? 'selected' : ''}`}
                  onClick={() => onTypeChange(type)}
                >
                  <i className={`fas ${
                    type === 'Percentage' ? 'fa-percent' :
                    type === 'Fixed' ? 'fa-money-bill-wave' :
                    type === 'Buy Amount' ? 'fa-shopping-cart' :
                    type === 'BuyXGetY' ? 'fa-gift' : 'fa-clock'
                  }`}></i>
                  <span>
                    {type === 'Percentage' && t('Percentage', 'ရာခိုင်နှုန်း')}
                    {type === 'Fixed' && t('Fixed Amount', 'တိကျသောပမာဏ')}
                    {type === 'Buy Amount' && t('Buy Amount', 'ဝယ်ယူငွေအပေါ်')}
                    {type === 'BuyXGetY' && t('Buy X Get Y', 'ဝယ် X ရ Y')}
                    {type === 'Time Based' && t('Time Based', 'အချိန်အခြေခံ')}
                  </span>
                </div>
              ))}
            </div> */}
            <div className="disc-type-selector">
            {['Percentage', 'Fixed', 'BuyXGetY', 'Time Based'].map(type => (  // ← "Buy Amount" ကိုဖယ်လိုက်ပါ
              <div 
                key={type}
                className={`disc-type-option ${discountForm.type === type ? 'selected' : ''}`}
                onClick={() => onTypeChange(type)}
              >
                <i className={`fas ${
                  type === 'Percentage' ? 'fa-percent' :
                  type === 'Fixed' ? 'fa-money-bill-wave' :
                  type === 'BuyXGetY' ? 'fa-gift' : 'fa-clock'
                }`}></i>
                <span>
                  {type === 'Percentage' && t('Percentage', 'ရာခိုင်နှုန်း')}
                  {type === 'Fixed' && t('Fixed Amount', 'တိကျသောပမာဏ')}
                  {type === 'BuyXGetY' && t('Buy X Get Y', 'ဝယ် X ရ Y')}
                  {type === 'Time Based' && t('Time Based', 'အချိန်အခြေခံ')}
                </span>
              </div>
            ))}
          </div>
          </div>

          {renderTypeSpecificFields()}

          {renderApplicableToFields()}

          <div className="disc-form-row">
            <div className="disc-form-group">
              <label className="disc-required">
                {t('Start Date', 'စတင်ရက်')}
              </label>
              <input
                type="date"
                name="startDate"
                value={discountForm.startDate}
                onChange={onFormChange}
                min={new Date().toISOString().split('T')[0]}
                disabled={loading}
                className={formErrors.startDate ? 'disc-input-error' : ''}
              />
              {formErrors.startDate && (
                <div className="disc-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.startDate}</span>
                </div>
              )}
            </div>
            <div className="disc-form-group">
              <label className="disc-required">
                {t('End Date', 'ပြီးဆုံးရက်')}
              </label>
              <input
                type="date"
                name="endDate"
                value={discountForm.endDate}
                onChange={onFormChange}
                min={discountForm.startDate || new Date().toISOString().split('T')[0]}
                disabled={loading}
                className={formErrors.endDate ? 'disc-input-error' : ''}
              />
              {formErrors.endDate && (
                <div className="disc-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.endDate}</span>
                </div>
              )}
            </div>
          </div>

          <div className="disc-form-group">
            <label>
              {t('Maximum Usage (Optional)', 'အများဆုံးအသုံးပြုမှု (ချန်လျှင်အကန့်အသတ်မရှိ)')}
            </label>
            <input
              type="number"
              name="maxUsage"
              value={discountForm.maxUsage}
              onChange={onFormChange}
              placeholder={t('Leave empty for unlimited', 'ချန်လျှင်အကန့်အသတ်မရှိ')}
              min="1"
              disabled={loading}
            />
          </div>

          <div className="disc-form-group">
            <label>
              {t('Notes (Optional)', 'မှတ်ချက် (ချန်လျှင်းနိုင်)')}
            </label>
            <textarea
              name="notes"
              value={discountForm.notes}
              onChange={onFormChange}
              placeholder={t('Add any notes about this discount', 'လျှော့ဈေးအကြောင်း မှတ်ချက်များ ထည့်ရန်')}
              rows="3"
              maxLength="500"
              disabled={loading}
            />
          </div>

          <div className="disc-form-group">
            <label className="disc-required">
              {t('Status', 'အခြေအနေ')}
            </label>
            <div className="disc-status-select-group">
              <div 
                className={`disc-status-option ${discountForm.status === 'Active' ? 'selected' : ''}`}
                onClick={() => onStatusChange('Active')}
              >
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={discountForm.status === 'Active'}
                  readOnly
                  className="disc-status-radio"
                  disabled={loading}
                />
                <label className="disc-status-label">
                  <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                  {t('Active', 'အသုံးပြုနိုင်')}
                </label>
              </div>
              <div 
                className={`disc-status-option ${discountForm.status === 'Inactive' ? 'selected' : ''}`}
                onClick={() => onStatusChange('Inactive')}
              >
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={discountForm.status === 'Inactive'}
                  readOnly
                  className="disc-status-radio"
                  disabled={loading}
                />
                <label className="disc-status-label">
                  <i className="fas fa-times-circle" style={{ color: '#f59e0b' }}></i>
                  {t('Inactive', 'အသုံးမပြုနိုင်')}
                </label>
              </div>
            </div>
          </div>

          {discountForm.name && discountForm.code && discountForm.startDate && discountForm.endDate && isFormValid && (
            <div className="disc-preview">
              <h4>{t('Discount Preview', 'လျှော့ဈေး အစမ်းကြည့်ရှုခြင်း')}:</h4>
              <div className="disc-preview-card">
                <div className="disc-preview-header">
                  <div className="disc-preview-name">{discountForm.name}</div>
                  <div className="disc-preview-code">{discountForm.code}</div>
                </div>
                <div className="disc-preview-body">
                  <div className="disc-preview-type" style={{ 
                    backgroundColor: discountForm.type === 'Percentage' ? '#4361ee' :
                                    discountForm.type === 'Fixed' ? '#4cc9f0' :
                                    discountForm.type === 'Buy Amount' ? '#f8961e' :
                                    discountForm.type === 'BuyXGetY' ? '#f72585' : '#3a0ca3'
                  }}>
                    {discountForm.type === 'Percentage' && t('Percentage', 'ရာခိုင်နှုန်း')}
                    {discountForm.type === 'Fixed' && t('Fixed Amount', 'တိကျသောပမာဏ')}
                    {discountForm.type === 'Buy Amount' && t('Buy Amount', 'ဝယ်ယူငွေအပေါ်')}
                    {discountForm.type === 'BuyXGetY' && t('Buy X Get Y', 'ဝယ် X ရ Y')}
                    {discountForm.type === 'Time Based' && t('Time Based', 'အချိန်အခြေခံ')}
                  </div>
                  <div className="disc-preview-value">
                    {calculateDiscountValue(discountForm, language)}
                  </div>
                  <div className="disc-preview-applies">
                    {t('Applies to', 'အကျုံးဝင်မှု')}: {
                      discountForm.applicableTo === 'all' 
                        ? t('All Products', 'ပစ္စည်းအားလုံး')
                        : t('Selected Products', 'ရွေးချယ်ထားသော ပစ္စည်း')
                    }
                  </div>
                  <div className="disc-preview-dates">
                    {formatDate(discountForm.startDate)} - {formatDate(discountForm.endDate)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="disc-modal-footer">
          <button className="disc-btn-cancel" onClick={onClose} disabled={loading}>
            {t('Cancel', 'ပယ်ဖျက်မည်')}
          </button>
          <button
            className={`disc-btn-submit ${loading ? 'loading' : ''}`}
            onClick={onSave}
            disabled={
              !isFormValid || 
              loading || 
              (discountForm.applicableTo === 'selected' && discountForm.selectedProductIds.length === 0)
            }
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
                  ? t('Add Discount', 'လျှော့ဈေးထည့်မည်')
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

export default DiscountModal;