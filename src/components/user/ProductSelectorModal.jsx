import React, { useState, useEffect, useRef } from 'react';

const ProductSelectorModal = ({
  show,
  onClose,
  products,
  selectedIds,
  onSave,
  language,
  loading,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  categories,
  page,
  onPageChange,
  pageSize,
  onPageSizeChange,
  totalPages,
  totalItems
}) => {
  const [localSelected, setLocalSelected] = useState([]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    if (show) {
      setLocalSelected(selectedIds || []);
    }
  }, [show, selectedIds]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) {
        setIsCategoryOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getSelectedCategoryName = () => {
    if (!selectedCategory || selectedCategory === null || selectedCategory === 'all') {
      return language === 'mm' ? 'ကတ်တဂိုရီ အားလုံး' : 'All Categories';
    }
    const cat = categories.find(c => c.id === selectedCategory);
    return cat ? cat.name : (language === 'mm' ? 'ကတ်တဂိုရီ အားလုံး' : 'All Categories');
  };

  const handleToggleProduct = (productId) => {
    setLocalSelected(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const handleSelectAll = () => {
    const allProductIds = products.map(p => p.id);
    setLocalSelected(allProductIds);
  };

  const handleClearAll = () => {
    setLocalSelected([]);
  };

  const handleSave = () => {
    onSave(localSelected);
  };

  const handlePrevPage = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages) onPageChange(page + 1);
  };

  // Clear search input
  const handleClearSearch = () => {
    onSearchChange('');
    onPageChange(1);
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const t = (en, mm) => language === 'mm' ? mm : en;

  if (!show) return null;

  return (
    <div className="disc-modal-overlay">
      <div className="disc-modal-content disc-product-selector-modal">
        <div className="disc-modal-header">
          <h3>
            <i className="fas fa-boxes"></i> 
            {t('Select Products', 'ပစ္စည်းများ ရွေးချယ်ပါ')}
          </h3>
          <button className="disc-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="disc-modal-body">
          <div className="disc-product-selector-header">
            {/* Search input with clear button */}
            <div className="disc-product-search" style={{ position: 'relative', flex: 2 }}>
              <i className="fas fa-search" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#6c757d', zIndex: 2 }}></i>
              <input
                ref={searchInputRef}
                type="text"
                placeholder={t(
                  'Search products by name, SKU or ID...',
                  'ပစ္စည်း အမည်၊ SKU သို့မဟုတ် ID ဖြင့် ရှာဖွေပါ...'
                )}
                value={searchQuery}
                onChange={(e) => {
                  onSearchChange(e.target.value);
                  onPageChange(1);
                }}
                style={{ paddingLeft: '35px', paddingRight: '35px' }}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  style={{
                    position: 'absolute',
                    right: '35px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#6c757d',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.color = '#f72585'}
                  onMouseLeave={(e) => e.target.style.color = '#6c757d'}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>

            {/* Category Filter */}
            <div className="disc-product-categories" style={{ flex: 1, minWidth: '180px' }}>
              <div className="disc-custom-select-wrapper" ref={categoryRef}>
                <div 
                  className={`disc-custom-select-trigger ${isCategoryOpen ? 'open' : ''}`}
                  onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                >
                  <span className="disc-selected-value">{getSelectedCategoryName()}</span>
                  <i className={`fas fa-chevron-${isCategoryOpen ? 'up' : 'down'}`}></i>
                </div>
                {isCategoryOpen && (
                  <div className="disc-custom-select-dropdown">
                    <div 
                      className={`disc-custom-option ${(!selectedCategory || selectedCategory === 'all') ? 'selected' : ''}`}
                      onClick={() => {
                        onCategoryChange('all');
                        onPageChange(1);
                        setIsCategoryOpen(false);
                      }}
                    >
                      {t('All Categories', 'ကတ်တဂိုရီ အားလုံး')}
                    </div>
                    {categories && categories.length > 0 ? (
                      categories.map(cat => (
                        <div
                          key={cat.id}
                          className={`disc-custom-option ${selectedCategory === cat.id ? 'selected' : ''}`}
                          onClick={() => {
                            onCategoryChange(cat.id);
                            onPageChange(1);
                            setIsCategoryOpen(false);
                          }}
                        >
                          {cat.name}
                        </div>
                      ))
                    ) : (
                      <div className="disc-custom-option" style={{ cursor: 'default', color: '#999' }}>
                        {t('No categories', 'ကတ်တဂိုရီမရှိပါ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="disc-product-selector-actions">
            <button className="disc-select-all-btn" onClick={handleSelectAll} disabled={loading}>
              <i className="fas fa-check-double"></i> 
              {t(`Select All (${products.length})`, `အားလုံး ရွေးမည် (${products.length})`)}
            </button>
            <button className="disc-clear-all-btn" onClick={handleClearAll} disabled={loading}>
              <i className="fas fa-times"></i> 
              {t('Clear All', 'အားလုံး ရှင်းမည်')}
            </button>
            <div className="disc-selected-counter">
              <i className="fas fa-check-circle"></i>
              {t(
                `${localSelected.length} products selected`,
                `ပစ္စည်း ${localSelected.length} ခု ရွေးချယ်ထားသည်`
              )}
            </div>
          </div>

          <div className="disc-product-list-container">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#4361ee' }}></i>
                <p>{t('Loading products...', 'ပစ္စည်းများ ဖွင့်နေသည်...')}</p>
              </div>
            ) : (
              <div className="disc-product-list">
                {products.length > 0 ? (
                  products.map(product => (
                    <div 
                      key={product.id} 
                      className={`disc-product-item ${localSelected.includes(product.id) ? 'selected' : ''}`}
                      onClick={() => handleToggleProduct(product.id)}
                    >
                      <div className="disc-product-checkbox">
                        <i className={`fas fa-${localSelected.includes(product.id) ? 'check-square' : 'square'}`}></i>
                      </div>
                      <div className="disc-product-info">
                        <div className="disc-product-name">{product.name}</div>
                        <div className="disc-product-details">
                          <span className="disc-product-id">ID: {product.id}</span>
                          <span className="disc-product-sku">{product.sku}</span>
                          <span className="disc-product-category">{product.categoryName || product.category}</span>
                          <span className="disc-product-price">Ks {product.sellingPrice?.toLocaleString() || 0}</span>
                          <span className="disc-product-stock">
                            {t('Stock', 'စတော့')}: {product.totalStock || 0}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ textAlign: 'center', padding: '40px' }}>
                    <i className="fas fa-box-open" style={{ fontSize: '32px', color: '#6c757d' }}></i>
                    <p>{t('No products found', 'ပစ္စည်းများ မတွေ့ပါ')}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="disc-product-pagination">
            <div className="disc-product-pagination-info">
              {t(
                `Showing ${products.length} of ${totalItems} products`,
                `ပစ္စည်း ${products.length} ခု (စုစုပေါင်း ${totalItems}) ပြသနေသည်`
              )}
            </div>
            <div className="disc-product-pagination-controls">
              <button 
                className="disc-product-pagination-btn" 
                onClick={handlePrevPage} 
                disabled={page === 1 || loading}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="disc-product-pagination-page">
                <input
                  type="text"
                  className="disc-product-pagination-input"
                  value={page}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (!isNaN(val) && val >= 1 && val <= totalPages) {
                      onPageChange(val);
                    }
                  }}
                  disabled={loading}
                />
                <span className="disc-product-pagination-total">/ {totalPages}</span>
              </div>
              <button 
                className="disc-product-pagination-btn" 
                onClick={handleNextPage} 
                disabled={page === totalPages || totalPages === 0 || loading}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
              <div className="disc-product-pagination-per-page">
                <select 
                  className="disc-product-pagination-select"
                  value={pageSize}
                  onChange={(e) => {
                    onPageSizeChange(parseInt(e.target.value));
                    onPageChange(1);
                  }}
                  disabled={loading}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="disc-modal-footer">
          <button className="disc-btn-cancel" onClick={onClose}>
            {t('Cancel', 'ပယ်ဖျက်မည်')}
          </button>
          <button 
            className="disc-btn-submit" 
            onClick={handleSave}
            disabled={loading}
          >
            <i className="fas fa-save"></i> 
            {t('Save Selection', 'ရွေးချယ်မှု သိမ်းမည်')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductSelectorModal;