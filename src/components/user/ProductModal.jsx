import React, { useState, useEffect, useRef } from 'react';
import "../../light-style/user-css/userProductPage.css";

const ProductModal = ({
  show,
  onClose,
  modalType,
  productForm,
  onFormChange,
  onStatusChange,
  onImageUpload,
  onRemoveImage,
  onSave,
  loading,
  validationError,
  formErrors,
  currentUser,
  language,
  fileInputRef,
  categories,
  isFormValid,
  formatCurrency,
  formatPercentage,
  triggerFileInput
}) => {
  // Category dropdown state
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);

  // Unit dropdown state
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const unitRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
      if (unitRef.current && !unitRef.current.contains(event.target)) {
        setIsUnitOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected category name
  const getSelectedCategoryName = () => {
    if (!productForm.categoryId) {
      return language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select category';
    }
    const cat = categories.find(c => c.id.toString() === productForm.categoryId);
    return cat ? cat.name : (language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select category');
  };

  // Unit options mapping
  const unitOptions = [
    { value: 'pcs', mm: 'ခု (pcs)', en: 'pcs' },
    { value: 'kg', mm: 'ကီလို (kg)', en: 'kg' },
    { value: 'g', mm: 'ဂရမ် (g)', en: 'g' },
    { value: 'L', mm: 'လီတာ (L)', en: 'L' },
    { value: 'ml', mm: 'မီလီလီတာ (ml)', en: 'ml' },
    { value: 'box', mm: 'ဘူး (box)', en: 'box' },
    { value: 'pack', mm: 'ထုပ် (pack)', en: 'pack' },
    { value: 'dozen', mm: 'ဒါဇင် (dozen)', en: 'dozen' },
    { value: 'pair', mm: 'စုံ (pair)', en: 'pair' },
    { value: 'carton', mm: 'ကတ်တွန် (carton)', en: 'carton' },
    { value: 'bottle', mm: 'ပုလင်း (bottle)', en: 'bottle' },
    { value: 'can', mm: 'ဗူး (can)', en: 'can' },
    { value: 'stick', mm: 'ချောင်း (stick)', en: 'stick' },
    { value: 'meter', mm: 'မီတာ (meter)', en: 'meter' }
  ];

  // Get selected unit name
  const getSelectedUnitName = () => {
    const unit = unitOptions.find(u => u.value === productForm.unit);
    if (!unit) {
      return language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select unit';
    }
    return language === 'mm' ? unit.mm : unit.en;
  };

  if (!show) return null;

  return (
    <div className="prod-modal-overlay">
      <div className="prod-modal-content">
        <div className="prod-modal-header">
          <h3>
            <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i>
            {modalType === "add"
              ? (language === 'mm' ? 'ပစ္စည်းအသစ်ထည့်ရန်' : 'Add New Product')
              : (language === 'mm' ? 'ပစ္စည်းပြင်ဆင်ရန်' : 'Edit Product')}
          </h3>
          <button className="prod-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="prod-modal-body">
          <div className="prod-current-user-banner">
            <i className="fas fa-user-circle"></i>
            <div>
              <div className="prod-user-name">{currentUser?.username}</div>
              <div className="prod-user-role">{currentUser?.role}</div>
            </div>
          </div>
          {validationError && (
            <div className="prod-validation-error" style={{ marginBottom: '15px' }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{validationError}</span>
            </div>
          )}

          <div className="prod-form-row">
            <div className="prod-form-group">
              <label className="prod-required">{language === 'mm' ? 'ပစ္စည်းအမည်' : 'Product Name'}</label>
              <input
                type="text"
                name="name"
                value={productForm.name}
                onChange={onFormChange}
                placeholder={language === 'mm' ? 'ဥပမာ - ကီးဘုတ်' : 'e.g., Keyboard'}
                maxLength="100"
                disabled={loading}
                className={formErrors.name ? 'prod-input-error' : ''}
              />
              {formErrors.name && (
                <div className="prod-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.name}</span>
                </div>
              )}
            </div>
            <div className="prod-form-group">
              <label className="prod-required">{language === 'mm' ? 'ဘားကုဒ်' : 'Barcode'}</label>
              <input
                type="text"
                name="barcode"
                value={productForm.barcode}
                onChange={onFormChange}
                placeholder="120215421012"
                maxLength="50"
                disabled={loading}
                className={formErrors.barcode ? 'prod-input-error' : ''}
              />
              {formErrors.barcode && (
                <div className="prod-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.barcode}</span>
                </div>
              )}
            </div>
          </div>

          <div className="prod-form-row">
            <div className="prod-form-group">
              <label className="prod-required">{language === 'mm' ? 'အမျိုးအစား' : 'Category'}</label>
              <div className="prod-custom-select-wrapper" ref={categoryRef}>
                <div 
                  className={`prod-custom-select-trigger ${isCategoryOpen ? 'open' : ''}`}
                  onClick={() => !loading && setIsCategoryOpen(!isCategoryOpen)}
                >
                  <span className="prod-selected-value">{getSelectedCategoryName()}</span>
                  <i className={`fas fa-chevron-${isCategoryOpen ? 'up' : 'down'}`}></i>
                </div>
                {isCategoryOpen && (
                  <div className="prod-custom-select-dropdown">
                    <div 
                      className={`prod-custom-option ${!productForm.categoryId ? 'selected' : ''}`}
                      onClick={() => {
                        onFormChange({ target: { name: 'categoryId', value: '' } });
                        setIsCategoryOpen(false);
                      }}
                    >
                      {language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select category'}
                    </div>
                    {categories.map(cat => (
                      <div
                        key={cat.id}
                        className={`prod-custom-option ${productForm.categoryId === cat.id.toString() ? 'selected' : ''}`}
                        onClick={() => {
                          onFormChange({ target: { name: 'categoryId', value: cat.id.toString() } });
                          setIsCategoryOpen(false);
                        }}
                      >
                        {cat.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {formErrors.categoryId && (
                <div className="prod-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.categoryId}</span>
                </div>
              )}
            </div>
            <div className="prod-form-group">
              <label className="prod-required">SKU</label>
              <input
                type="text"
                name="sku"
                value={productForm.sku}
                onChange={onFormChange}
                placeholder="PRD-001"
                maxLength="50"
                disabled={loading}
                className={formErrors.sku ? 'prod-input-error' : ''}
              />
              {formErrors.sku && (
                <div className="prod-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.sku}</span>
                </div>
              )}
            </div>
          </div>

          <div className="prod-form-row">
            <div className="prod-form-group">
              <label className="prod-required">{language === 'mm' ? 'အနည်းဆုံး အရေတွက်(အသိပေးရန်)' : 'Minimum Stock Alert'}</label>
              <input
                type="number"
                name="minStock"
                value={productForm.minStock}
                onChange={onFormChange}
                placeholder="0"
                min="0"
                step="1"
                disabled={loading}
                className={formErrors.minStock ? 'prod-input-error' : ''}
              />
              {formErrors.minStock && (
                <div className="prod-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.minStock}</span>
                </div>
              )}
            </div>
            <div className="prod-form-group">
              <label className="prod-required">{language === 'mm' ? 'ယူနစ်' : 'Unit'}</label>
              <div className="prod-custom-select-wrapper" ref={unitRef}>
                <div 
                  className={`prod-custom-select-trigger ${isUnitOpen ? 'open' : ''}`}
                  onClick={() => !loading && setIsUnitOpen(!isUnitOpen)}
                >
                  <span className="prod-selected-value">{getSelectedUnitName()}</span>
                  <i className={`fas fa-chevron-${isUnitOpen ? 'up' : 'down'}`}></i>
                </div>
                {isUnitOpen && (
                  <div className="prod-custom-select-dropdown">
                    {unitOptions.map(unit => (
                      <div
                        key={unit.value}
                        className={`prod-custom-option ${productForm.unit === unit.value ? 'selected' : ''}`}
                        onClick={() => {
                          onFormChange({ target: { name: 'unit', value: unit.value } });
                          setIsUnitOpen(false);
                        }}
                      >
                        {language === 'mm' ? unit.mm : unit.en}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="prod-form-row">
            <div className="prod-form-group">
              <label>{language === 'mm' ? 'ဝယ်ဈေး (MMK)' : 'Cost Price (MMK)'}</label>
              <p className="prod-display-text">
                {formatCurrency(productForm.costPrice)}
              </p>
            </div>
            <div className="prod-form-group">
              <label className="prod-required">{language === 'mm' ? 'ရောင်းဈေး (MMK)' : 'Selling Price (MMK)'}</label>
              <input
                type="number"
                name="sellingPrice"
                value={productForm.sellingPrice}
                onChange={onFormChange}
                placeholder="0 MMK"
                min="0"
                step="50"
                disabled={loading}
                className={formErrors.sellingPrice ? 'prod-input-error' : ''}
              />
              {formErrors.sellingPrice && (
                <div className="prod-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.sellingPrice}</span>
                </div>
              )}
            </div>
          </div>

          {/* Price calculation section */}
          {(productForm.costPrice || productForm.sellingPrice) && (
            <div className="prod-calculated-pricing">
              {(() => {
                const cost = parseFloat(productForm.costPrice) || 0;
                const selling = parseFloat(productForm.sellingPrice) || 0;
                const profit = selling - cost;
                const margin = cost > 0 ? (profit / cost) * 100 : 0;

                return (
                  <>
                    <div className="prod-pricing-row">
                      <span className="prod-pricing-label">
                        {language === 'mm' ? 'အမြတ်' : 'Profit'}:
                      </span>
                      <span className={`prod-pricing-value ${profit >= 0 ? 'positive' : 'negative'}`}>
                        {formatCurrency ? formatCurrency(profit) : profit + ' MMK'}
                      </span>
                    </div>
                    <div className="prod-pricing-row">
                      <span className="prod-pricing-label">
                        {language === 'mm' ? 'အမြတ်နှုန်း' : 'Margin'}:
                      </span>
                      <span className={`prod-pricing-value ${
                        margin >= 30 ? 'high' : margin >= 15 ? 'medium' : 'low'
                      }`}>
                        {formatPercentage ? formatPercentage(margin) : margin.toFixed(2) + '%'}
                      </span>
                    </div>
                    {profit < 0 && (
                      <div className="prod-pricing-warning">
                        <i className="fas fa-exclamation-triangle"></i>
                        {language === 'mm' ? 'သတိ: ဈေးနှိမ်ရောင်းခြင်း!' : 'Warning: Selling at loss!'}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}

          <div className="prod-form-group">
            <label>{language === 'mm' ? 'မှတ်ချက်' : 'Notes'}</label>
            <textarea
              name="notes"
              value={productForm.notes}
              onChange={onFormChange}
              placeholder={language === 'mm' ? 'အပိုမှတ်ချက်များ...' : 'Additional notes...'}
              rows="3"
              maxLength="500"
              disabled={loading}
            />
          </div>

          {/* Image Upload Section */}
          <div className="prod-form-group">
            <label>{language === 'mm' ? 'ပုံ' : 'Image'}</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={loading}
            />
            {!productForm.currentImageUrl ? (
              <div className="prod-image-upload-container" onClick={triggerFileInput}>
                <div className="prod-image-upload-content">
                  <i className="fas fa-cloud-upload-alt prod-image-upload-icon"></i>
                  <div className="prod-image-upload-text">
                    {language === 'mm' ? 'ပုံတင်ရန် နှိပ်ပါ' : 'Click to upload image'}
                  </div>
                  <div className="prod-image-upload-hint">
                    {language === 'mm' ? 'PNG, JPG, GIF ဖိုင် 5MB အထိ' : 'PNG, JPG, GIF up to 5MB'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="prod-image-preview">
                <img src={productForm.currentImageUrl} alt="Preview" />
                <button className="prod-remove-image-btn" onClick={onRemoveImage} disabled={loading}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          <div className="prod-form-group">
            <label className="prod-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
            <div className="prod-status-select-group">
              <div
                className={`prod-status-option ${productForm.status === 'Active' ? 'selected' : ''}`}
                onClick={() => !loading && onStatusChange('Active')}
              >
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={productForm.status === 'Active'}
                  readOnly
                  className="prod-status-radio"
                  disabled={loading}
                />
                <label className="prod-status-label">
                  <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                  {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}
                </label>
              </div>
              <div
                className={`prod-status-option ${productForm.status === 'Inactive' ? 'selected' : ''}`}
                onClick={() => !loading && onStatusChange('Inactive')}
              >
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={productForm.status === 'Inactive'}
                  readOnly
                  className="prod-status-radio"
                  disabled={loading}
                />
                <label className="prod-status-label">
                  <i className="fas fa-times-circle" style={{ color: '#f59e0b' }}></i>
                  {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'}
                </label>
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
            onClick={onSave}
            disabled={!isFormValid || loading}
          >
            {loading ? (
              <>
                <i className="fas fa-spinner fa-spin"></i>
                {language === 'mm' ? 'လုပ်ဆောင်နေသည်...' : 'Processing...'}
              </>
            ) : (
              <>
                <i className="fas fa-save"></i>
                {modalType === "add"
                  ? (language === 'mm' ? 'ထည့်သွင်းမည်' : 'Add Product')
                  : (language === 'mm' ? 'သိမ်းဆည်းမည်' : 'Save Changes')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;