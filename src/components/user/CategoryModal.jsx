// CategoryModal.jsx
import "../../light-style/user-css/userCategoryPage.css";
import React from 'react';

const CategoryModal = ({
  show,
  onClose,
  modalType,
  categoryForm,
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
  fileInputRef
}) => {
  const triggerFileInput = () => fileInputRef.current?.click();

  if (!show) return null;

  return (
    <div className="cat-modal-overlay">
      <div className="cat-modal-content">
        <div className="cat-modal-header">
          <h3>
            <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i>
            {modalType === "add"
              ? (language === 'mm' ? 'အမျိုးအစားအသစ်ထည့်ရန်' : 'Add New Category')
              : (language === 'mm' ? 'အမျိုးအစားပြင်ဆင်ရန်' : 'Edit Category')}
          </h3>
          <button className="cat-modal-close" onClick={onClose} disabled={loading}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="cat-modal-body">
          <div className="cat-current-user-banner">
            <i className="fas fa-user-circle"></i>
            <div>
              <div className="cat-user-name">{currentUser?.username}</div>
              <div className="cat-user-role">{currentUser?.role}</div>
            </div>
          </div>
          {validationError && (
            <div className="cat-validation-error" style={{ marginBottom: '15px' }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{validationError}</span>
            </div>
          )}

          <div className="cat-form-group">
            <label className="cat-required">
              {language === 'mm' ? 'အမျိုးအစားအမည်' : 'Category Name'}
            </label>
            <input
              type="text"
              name="name"
              value={categoryForm.name}
              onChange={onFormChange}
              placeholder={language === 'mm' ? 'ဥပမာ - အီလက်ထရောနစ်' : 'e.g., Electronics'}
              maxLength="100"
              disabled={loading}
              className={formErrors.name ? 'cat-input-error' : ''}
            />
            {formErrors.name && (
              <div className="cat-field-error">
                <i className="fas fa-exclamation-circle"></i>
                <span>{formErrors.name}</span>
              </div>
            )}
          </div>

          <div className="cat-form-group">
            <label>{language === 'mm' ? 'ဖော်ပြချက်' : 'Description'}</label>
            <textarea
              name="description"
              value={categoryForm.description}
              onChange={onFormChange}
              placeholder={language === 'mm' ? 'အမျိုးအစားအကြောင်းအသေးစိတ်...' : 'Category description...'}
              rows="3"
              maxLength="500"
              disabled={loading}
            />
          </div>

          <div className="cat-form-group">
            <label>{language === 'mm' ? 'ပုံ' : 'Image'}</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={onImageUpload}
              accept="image/*"
              style={{ display: 'none' }}
              disabled={loading}
            />
            {!categoryForm.currentImageUrl ? (
              <div className="cat-image-upload-container" onClick={triggerFileInput}>
                <div className="cat-image-upload-content">
                  <i className="fas fa-cloud-upload-alt cat-image-upload-icon"></i>
                  <div className="cat-image-upload-text">
                    {language === 'mm' ? 'ပုံတင်ရန် နှိပ်ပါ' : 'Click to upload image'}
                  </div>
                  <div className="cat-image-upload-hint">
                    {language === 'mm' ? 'PNG, JPG, GIF ဖိုင် 5MB အထိ' : 'PNG, JPG, GIF up to 5MB'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="cat-image-preview">
                <img src={categoryForm.currentImageUrl} alt="Preview" />
                <button className="cat-remove-image-btn" onClick={onRemoveImage} disabled={loading}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
            )}
          </div>

          <div className="cat-form-group">
            <label className="cat-required">{language === 'mm' ? 'အခြေအနေ' : 'Status'}</label>
            <div className="cat-status-select-group">
              <div
                className={`cat-status-option ${categoryForm.status === 'Active' ? 'selected' : ''}`}
                onClick={() => !loading && onStatusChange('Active')}
              >
                <input
                  type="radio"
                  name="status"
                  value="Active"
                  checked={categoryForm.status === 'Active'}
                  readOnly
                  className="cat-status-radio"
                  disabled={loading}
                />
                <label className="cat-status-label">
                  <i className="fas fa-check-circle" style={{ color: '#10b981' }}></i>
                  {language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'}
                </label>
              </div>
              <div
                className={`cat-status-option ${categoryForm.status === 'Inactive' ? 'selected' : ''}`}
                onClick={() => !loading && onStatusChange('Inactive')}
              >
                <input
                  type="radio"
                  name="status"
                  value="Inactive"
                  checked={categoryForm.status === 'Inactive'}
                  readOnly
                  className="cat-status-radio"
                  disabled={loading}
                />
                <label className="cat-status-label">
                  <i className="fas fa-times-circle" style={{ color: '#f59e0b' }}></i>
                  {language === 'mm' ? 'အသုံးမပြုနိုင်' : 'Inactive'}
                </label>
              </div>
            </div>
          </div>
        </div>
        <div className="cat-modal-footer">
          <button className="cat-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'ဖျက်သိမ်းရန်' : 'Cancel'}
          </button>
          <button
            className={`cat-btn-submit ${loading ? 'loading' : ''}`}
            onClick={onSave}
            disabled={!categoryForm.name.trim() || loading}
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
                  ? (language === 'mm' ? 'ထည့်သွင်းမည်' : 'Add Category')
                  : (language === 'mm' ? 'သိမ်းဆည်းမည်' : 'Save Changes')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;