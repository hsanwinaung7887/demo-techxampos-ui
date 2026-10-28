// ProductViewModal.jsx (Demo — JSON + localStorage)
import React, { useState, useEffect } from 'react';

const PRODUCTS_KEY = "demo_products";

const getData = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
};

const ProductViewModal = ({
  show,
  onClose,
  productIds,
  language,
  branchId
}) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const itemsPerPage = 5;

  const t = (en, mm) => language === 'mm' ? mm : en;

  // ✅ JSON ကနေ products ယူ
  const fetchProducts = (page = 1) => {
    if (!productIds || productIds.length === 0) {
      setProducts([]);
      setTotalItems(0);
      setTotalPages(1);
      return;
    }

    setLoading(true);

    try {
      // localStorage ကနေ products ယူ
      const allProducts = getData(PRODUCTS_KEY, []);
      const branchIdNum = branchId || 1;

      // productIds ထဲက id တွေနဲ့ ကိုက်တာတွေ filter
      const matchedProducts = productIds
        .map(id => allProducts.find(p => p.id === id && (!p.branchId || p.branchId === branchIdNum)))
        .filter(Boolean);

      // Pagination
      const total = matchedProducts.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / itemsPerPage));
      const safePage = Math.min(Math.max(1, page), totalPagesCalc);
      const start = (safePage - 1) * itemsPerPage;
      const paged = matchedProducts.slice(start, start + itemsPerPage);

      setProducts(paged);
      setTotalItems(total);
      setTotalPages(totalPagesCalc);
      setCurrentPage(safePage);
      setPageInput(safePage.toString());
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (show && productIds && productIds.length > 0) {
      fetchProducts(1);
    }
  }, [show, productIds]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchProducts(page);
  };

  const handlePageInputChange = (e) => setPageInput(e.target.value);

  const handlePageInputBlur = () => {
    let page = parseInt(pageInput);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    handlePageChange(page);
  };

  if (!show) return null;

  return (
    <div className="disc-modal-overlay" onClick={onClose}>
      <div className="disc-modal-content disc-product-selector-modal" onClick={(e) => e.stopPropagation()}>
        <div className="disc-modal-header">
          <h3>
            <i className="fas fa-boxes"></i>
            {t('Selected Products', 'ရွေးချယ်ထားသော ပစ္စည်းများ')}
          </h3>
          <button className="disc-modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <div className="disc-modal-body">
          {/* Summary */}
          <div style={{
            background: '#eef2ff',
            padding: '10px 15px',
            borderRadius: '8px',
            marginBottom: '14px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <span>
              <i className="fas fa-box" style={{ color: '#4361ee', marginRight: '8px' }}></i>
              <span style={{ fontSize: "14px" }}>
                {t('Total Products', 'စုစုပေါင်းပစ္စည်း')}: <strong>{totalItems}</strong>
              </span>
            </span>
            <span>
              <span style={{ fontSize: "14px" }}>
                {t('Showing', 'ပြသနေသည်')}: <strong>{products.length}</strong> / <strong>{totalItems}</strong>
              </span>
            </span>
          </div>

          {/* Products List */}
          <div className="disc-product-list-container" style={{ maxHeight: '400px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '32px', color: '#4361ee' }}></i>
                <p>{t('Loading products...', 'ပစ္စည်းများ ဖွင့်နေသည်...')}</p>
              </div>
            ) : products.length > 0 ? (
              <div className="disc-product-list">
                {products.map((product) => (
                  <div key={product.id} className="disc-product-item" style={{ cursor: 'default' }}>
                    <div className="disc-product-checkbox">
                      <i className="fas fa-check-circle" style={{ color: '#4361ee' }}></i>
                    </div>
                    <div className="disc-product-info">
                      <div className="disc-product-name">{product.name}</div>
                      <div className="disc-product-details">
                        <span className="disc-product-id">ID: {product.id}</span>
                        <span className="disc-product-sku">{product.sku}</span>
                        <span className="disc-product-category">{product.categoryName}</span>
                        <span className="disc-product-price">
                          {product.sellingPrice?.toLocaleString()} Ks
                        </span>
                        <span className="disc-product-stock">
                          {t('Stock', 'စတော့')}: {product.totalStock || 0}
                        </span>
                      </div>
                      {product.notes && (
                        <div style={{ fontSize: '11px', color: '#666', marginTop: '5px', fontStyle: 'italic' }}>
                          <i className="fas fa-sticky-note" style={{ marginRight: '5px', color: '#4361ee' }}></i>
                          {product.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <i className="fas fa-box-open" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <p>{t('No products selected', 'ပစ္စည်းများ ရွေးချယ်ထားခြင်း မရှိပါ')}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="disc-product-pagination">
              <div className="disc-product-pagination-info">
                {t(`Page ${currentPage} of ${totalPages}`, `စာမျက်နှာ ${currentPage} / ${totalPages}`)}
              </div>
              <div className="disc-product-pagination-controls">
                <button
                  className="disc-product-pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <div className="disc-product-pagination-page">
                  <input
                    type="text"
                    className="disc-product-pagination-input"
                    value={pageInput}
                    onChange={handlePageInputChange}
                    onBlur={handlePageInputBlur}
                    disabled={loading}
                  />
                  <span className="disc-product-pagination-total">/ {totalPages}</span>
                </div>
                <button
                  className="disc-product-pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages || loading}
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="disc-modal-footer">
          <button className="disc-btn-cancel" onClick={onClose}>
            {t('Close', 'ပိတ်မည်')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductViewModal;