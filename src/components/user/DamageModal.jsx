import React, { useState, useEffect, useRef } from 'react';
import "../../light-style/user-css/userDamagePage.css";

const DamageModal = ({
  show,
  onClose,
  modalType,
  damageForm,
  onFormChange,
  onStatusChange,
  onImageUpload,
  onRemoveImage,
  onSave,
  onSelectProduct,
  loading,
  validationError,
  formErrors,
  currentUser,
  language,
  fileInputRef,
  damageTypeOptions,
  unitOptions,
  statusOptions,
  damageApi,
  isFormValid,
  triggerFileInput
}) => {
  // Unit dropdown state
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const unitRef = useRef(null);

  // Unit options with Myanmar and English
  const unitOptionsList = [
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (unitRef.current && !unitRef.current.contains(event.target)) {
        setIsUnitOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get selected unit name
  const getSelectedUnitName = () => {
    const unit = unitOptionsList.find(u => u.value === damageForm.unit);
    if (!unit) {
      return language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select unit';
    }
    return language === 'mm' ? unit.mm : unit.en;
  };

  if (!show) return null;

  return (
    <div className="damage-modal-overlay">
      <div className="damage-modal-content">
        <div className="damage-modal-header">
          <h3>
            <i className={`fas ${modalType === "add" ? "fa-exclamation-triangle" : "fa-edit"}`}></i>
            {modalType === "add"
              ? (language === 'mm' ? 'ပျက်စီးမှုအသစ်မှတ်တမ်းတင်ရန်' : 'Report New Damage')
              : (language === 'mm' ? 'ပျက်စီးမှုပြင်ဆင်ရန်' : 'Edit Damage Report')}
          </h3>
          <button className="damage-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="damage-modal-body">
          <div className="damage-current-user-banner">
            <i className="fas fa-user-circle"></i>
            <div>
              <div className="damage-user-name">{currentUser?.name}</div>
              <div className="damage-user-role">{currentUser?.role}</div>
            </div>
          </div>
          {validationError && (
            <div className="damage-validation-error" style={{ marginBottom: '15px' }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{validationError}</span>
            </div>
          )}

          {/* Product Selection */}
          <div className="damage-form-group">
            <label className="damage-required">
              {language === 'mm' ? 'ပစ္စည်း' : 'Product'}
            </label>
            <div className="damage-product-select-container">
              <input
                type="text"
                className="damage-product-input"
                value={damageForm.productName}
                placeholder={language === 'mm' ? 'ပစ္စည်းရွေးရန် နှိပ်ပါ' : 'Click to select product'}
                onClick={onSelectProduct}
                readOnly
                disabled={modalType === "edit"}
              />
              {modalType === "add" && (
                <button 
                  className="damage-select-product-btn"
                  onClick={onSelectProduct}
                  type="button"
                  disabled={loading}
                >
                  <i className="fas fa-search"></i> {language === 'mm' ? 'ရွေးရန်' : 'Select'}
                </button>
              )}
            </div>
            {formErrors.productId && (
              <div className="damage-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.productId}</span>
              </div>
            )}
            {damageForm.barcode && (
              <div className="damage-product-info-display">
                <span>{language === 'mm' ? 'ဘားကုဒ်' : 'Barcode'}: <strong>{damageForm.barcode}</strong></span>
                <span>{language === 'mm' ? 'အမျိုးအစား' : 'Category'}: <strong>{damageForm.categoryName}</strong></span>
              </div>
            )}
            {modalType === "add" && damageForm.availableStock > 0 && (
              <div className="damage-stock-info">
                <span className="stock-label">{language === 'mm' ? 'လက်ကျန်' : 'Available Stock'}:</span>
                <span className="stock-value avg-price">{damageForm.availableStock} {damageForm.unit}</span>
                {/* <span className="avg-price">
                  {language === 'mm' ? 'ဝယ်ဈေး' : 'Cost Price'}: {damageForm.averagePurchasePrice?.toLocaleString()} Ks/{damageForm.unit}
                </span> */}
              </div>
            )}
          </div>

          {/* Quantity and Unit - with custom dropdown */}
          <div className="damage-form-row">
            <div className="damage-form-group">
              <label className="damage-required">
                {language === 'mm' ? 'ပမာဏ' : 'Quantity'}
              </label>
              <div className="damage-quantity-input-group">
                <input
                  type="number"
                  name="quantity"
                  style={{ minWidth: "80px" }}
                  value={damageForm.quantity}
                  onChange={onFormChange}
                  min="1"
                  max={modalType === "add" ? damageForm.availableStock : undefined}
                  step="1"
                  disabled={loading}
                  className={formErrors.quantity ? 'damage-input-error' : ''}
                />
                <div className="damage-custom-select-wrapper" ref={unitRef}>
                  <div 
                    className={`damage-custom-select-trigger ${isUnitOpen ? 'open' : ''}`}
                    onClick={() => !loading && setIsUnitOpen(!isUnitOpen)}
                  >
                    <span className="damage-selected-value">{getSelectedUnitName()}</span>
                    <i className={`fas fa-chevron-${isUnitOpen ? 'up' : 'down'}`}></i>
                  </div>
                  {isUnitOpen && (
                    <div className="damage-custom-select-dropdown">
                      {unitOptionsList.map(unit => (
                        <div
                          key={unit.value}
                          className={`damage-custom-option ${damageForm.unit === unit.value ? 'selected' : ''}`}
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
              {formErrors.quantity && (
                <div className="damage-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.quantity}</span>
                </div>
              )}
            </div>
            
            <div className="damage-form-group">
              <label className="damage-required">
                {language === 'mm' ? 'ပျက်စီးမှုအမျိုးအစား' : 'Damage Type'}
              </label>
              <select
                name="damageType"
                value={damageForm.damageType}
                onChange={onFormChange}
                disabled={loading}
                className={formErrors.damageType ? 'damage-input-error' : ''}
              >
                {damageTypeOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'mm' ? opt.label_mm : opt.label_en}
                  </option>
                ))}
              </select>
              {formErrors.damageType && (
                <div className="damage-field-error">
                  <i className="fas fa-exclamation-circle"></i>
                  <span>{formErrors.damageType}</span>
                </div>
              )}
            </div>
          </div>

          {/* Loss Value */}
          <div className="damage-loss-section">
            <div className="damage-form-group">
              <label className="damage-required">
                {language === 'mm' ? 'ဆုံးရှုံးမှုတန်ဖိုး (Ks)' : 'Loss Value (Ks)'}
              </label>
                           
              {/* ✅ FIFO Calculation Details Display - FIXED TOTAL */}
              {modalType === "add" && damageForm.batchDetails && damageForm.batchDetails.length > 0 && damageForm.quantity > 0 && (
                <div className="damage-fifo-details">
                  <div className="fifo-title">
                    <i className="fas fa-calculator"></i>
                    {language === 'mm' ? 'FIFO ဖြင့် တွက်ချက်ပုံ (အစောဆုံးအသုတ်မှစ၍)' : 'FIFO Calculation (Oldest batch first)'}
                  </div>
                  <div className="fifo-batches">
                    {(() => {
                      let remainingQty = damageForm.quantity;
                      let totalCalculatedLoss = 0;  // ✅ Local total variable
                      const details = [];
                      
                      // Sort batches by batchId (oldest first)
                      const sortedBatches = [...damageForm.batchDetails].sort((a, b) => a.batchId - b.batchId);
                      
                      for (const batch of sortedBatches) {
                        if (remainingQty <= 0) break;
                        const takeQty = Math.min(batch.remaining, remainingQty);
                        const batchLoss = takeQty * batch.purchasePrice;
                        totalCalculatedLoss += batchLoss;  // ✅ Accumulate total
                        details.push({ ...batch, takeQty, batchLoss });
                        remainingQty -= takeQty;
                      }
                      
                      return (
                        <>
                          {details.map((detail, idx) => (
                            <div key={idx} className="fifo-batch-item">
                              <span className="batch-label">
                                {language === 'mm' ? `အသုတ် ${idx + 1}` : `Batch ${idx + 1}`}:
                              </span>
                              <span className="batch-detail">
                                {detail.takeQty} {damageForm.unit} × {detail.purchasePrice?.toLocaleString()} Ks = 
                                <strong className="batch-loss"> {detail.batchLoss?.toLocaleString()} Ks</strong>
                              </span>
                            </div>
                          ))}
                          <div className="fifo-total">
                            <span>{language === 'mm' ? 'စုစုပေါင်း' : 'Total'}:</span>
                            <strong className="total-loss">{totalCalculatedLoss.toLocaleString()} Ks</strong>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
              
              {modalType === "add" && damageForm.averagePurchasePrice > 0 && (
                <small className="damage-hint">
                  {language === 'mm' 
                    ? `FIFO စနစ်ဖြင့် အလိုအလျောက်တွက်ပေးသည် (အစောဆုံးအသုတ်မှစ၍)`
                    : `Auto-calculated using FIFO method (oldest batch first)`}
                </small>
              )}
            </div>
          </div>

          {/* Status (for edit mode) */}
          {modalType === "edit" && (
            <div className="damage-form-group">
              <label>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
              <select
                name="status"
                value={damageForm.status}
                onChange={onFormChange}
                disabled={loading}
              >
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>
                    {language === 'mm' ? opt.label_mm : opt.label_en}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Location */}
          <div className="damage-form-group">
            <label>
              {language === 'mm' ? 'ကုန်သိုလှောင်ရုံ တည်နေရာ' : 'Warehouse Location'}
            </label>
            <input
              type="text"
              name="warehouseSection"
              value={damageForm.warehouseSection}
              onChange={onFormChange}
              placeholder={language === 'mm' ? 'ဥပမာ - A-12' : 'e.g., A-12'}
              disabled={loading}
            />
          </div>

          {/* ===== IMAGE UPLOAD ===== */}
          <div className="damage-form-group">
            <label>{language === 'mm' ? 'ပုံ' : 'Image'}</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={loading}
            />
            
            {!damageForm.currentImageUrl ? (
              <div className="damage-image-upload-container" onClick={triggerFileInput}>
                <div className="damage-image-upload-content">
                  <i className="fas fa-cloud-upload-alt damage-image-upload-icon"></i>
                  <div className="damage-image-upload-text">
                    {language === 'mm' ? 'ပုံတင်ရန် နှိပ်ပါ' : 'Click to upload image'}
                  </div>
                  <div className="damage-image-upload-hint">
                    {language === 'mm' ? 'PNG, JPG, GIF ဖိုင် 5MB အထိ' : 'PNG, JPG, GIF up to 5MB'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="damage-image-preview">
                <img src={damageForm.currentImageUrl} alt="Preview" />
                <button className="damage-remove-image-btn" onClick={onRemoveImage} disabled={loading}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="damage-form-group">
            <label>
              {language === 'mm' ? 'ပျက်စီးမှု အသေးစိတ်အချက်အလက်' : 'Damage Details'}
            </label>
            <textarea
              name="notes"
              value={damageForm.notes}
              onChange={onFormChange}
              placeholder={language === 'mm' ? 'ပျက်စီးမှုအကြောင်း အသေးစိတ်ရေးပါ...' : 'Describe the damage in detail...'}
              rows="3"
              maxLength="500"
              disabled={loading}
            />
          </div>

          {/* Reporter Information */}
          <div className="damage-reporter-info">
            <div className="damage-info-row">
              <span>{language === 'mm' ? 'တင်သွင်းသူ' : 'Reported by'}:</span>
              <strong>{damageForm.reportedBy}</strong>
            </div>
            <div className="damage-info-row">
              <span>{language === 'mm' ? 'တင်သွင်းသည့်နေ့' : 'Report date'}:</span>
              <strong>{damageForm.reportedDate} {damageForm.reportedTime}</strong>
            </div>
          </div>
        </div>
        <div className="damage-modal-footer">
          <button className="damage-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button
            className={`damage-btn-submit ${loading ? 'loading' : ''}`}
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
                  ? (language === 'mm' ? 'မှတ်တမ်းတင်မည်' : 'Report Damage')
                  : (language === 'mm' ? 'သိမ်းဆည်းမည်' : 'Save Changes')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DamageModal;