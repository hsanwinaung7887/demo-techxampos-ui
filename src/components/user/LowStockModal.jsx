// LowStockModal.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import "../../light-style/user-css/lowStockModal.css";

const empty_image = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#f0f3f7"/>
    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text>
  </svg>`)}`;

const PRODUCTS_KEY = "demo_products";
const CATEGORIES_KEY = "demo_categories";

// ✅ localStorage helpers
const getData = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
};

const LowStockModal = ({ isOpen, onClose, language = "mm", branchId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [pageInput, setPageInput] = useState('1');
  const [lowStockCount, setLowStockCount] = useState(0);
  const [outOfStockCount, setOutOfStockCount] = useState(0);
  const [expiredCount, setExpiredCount] = useState(0);
  const [expiringSoonCount, setExpiringSoonCount] = useState(0);

  const itemsPerPage = 10;
  const t = (en, mm) => language === 'mm' ? mm : en;

  // ✅ JSON ကနေ low stock products တွေကို filter
  const fetchLowStockProducts = (page = 1) => {
    setLoading(true);
    try {
      const allProducts = getData(PRODUCTS_KEY, []);
      const categories = getData(CATEGORIES_KEY, []);

      // ✅ Active products တွေကိုပဲ ယူ
      const activeProducts = allProducts.filter(p => p.status === 'Active');

      // ✅ Low stock / Out of stock ဖြစ်တာတွေကို filter
      // (totalStock < 5 or totalStock === 0)
      const alertProducts = activeProducts.filter(p => {
        const stock = Number(p.totalStock || 0);
        return stock < 5 || stock === 0;
      });

      // ✅ Category name ထည့်
      const enriched = alertProducts.map(p => {
        const cat = categories.find(c => c.id === p.categoryId);
        return {
          ...p,
          categoryName: cat?.name || p.categoryName || 'Uncategorized',
          price: p.sellingPrice || p.price || 0,
          totalStock: Number(p.totalStock || 0),
          expiryStatus: null, // Demo မှာ expiry မရှိ
        };
      });

      // ✅ Sort — out of stock အရင်ပြ၊ ပြီးရင် အနည်းဆုံး stock အရ
      enriched.sort((a, b) => {
        if (a.totalStock === 0 && b.totalStock !== 0) return -1;
        if (b.totalStock === 0 && a.totalStock !== 0) return 1;
        return a.totalStock - b.totalStock;
      });

      // ✅ Summary counts
      const outCount = enriched.filter(p => p.totalStock === 0).length;
      const lowCount = enriched.filter(p => p.totalStock > 0 && p.totalStock < 5).length;
      setOutOfStockCount(outCount);
      setLowStockCount(lowCount);
      setExpiredCount(0);
      setExpiringSoonCount(0);

      // ✅ Pagination
      const total = enriched.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / itemsPerPage));
      const safePage = Math.min(Math.max(1, page), totalPagesCalc);
      const start = (safePage - 1) * itemsPerPage;
      const paged = enriched.slice(start, start + itemsPerPage);

      setProducts(paged);
      setTotalItems(total);
      setTotalPages(totalPagesCalc);
      setCurrentPage(safePage);
      setPageInput(safePage.toString());
    } catch (error) {
      console.error('Error fetching low stock products:', error);
      setProducts([]);
      setTotalItems(0);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLowStockProducts(1);
    }
  }, [isOpen, branchId]);

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    fetchLowStockProducts(page);
  };

  const handlePageInputBlur = () => {
    let page = parseInt(pageInput);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    handlePageChange(page);
  };

  const getStockStatus = (product) => {
    if (product.expiryStatus === 'EXPIRED') {
      return { label: t('Expired', 'သက်တမ်းကုန်'), class: 'expired', icon: 'fa-times-circle' };
    }
    if (product.expiryStatus === 'EXPIRING_SOON') {
      return { label: t('Expiring Soon', 'သက်တမ်းနီး'), class: 'expiring-soon', icon: 'fa-clock' };
    }
    if (product.totalStock === 0) {
      return { label: t('Out of Stock', 'ကုန်နေ'), class: 'out-of-stock', icon: 'fa-times-circle' };
    }
    if (product.totalStock < 5) {
      return { label: t('Low Stock', 'လက်ကျန်နည်း'), class: 'low-stock', icon: 'fa-exclamation-triangle' };
    }
    return null;
  };

  const getImageSrc = (product) => {
    if (!product) return empty_image;
    return product.imageUrl || product.image || product.thumbnailUrl || empty_image;
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="low-modal-overlay" onClick={onClose}>
      <div className="low-stock-modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="low-stock-modal-header">
          <h3>
            <i className="fas fa-exclamation-triangle"></i>
            {t('Inventory Alerts', 'စတော့သတိပေးချက်များ')}
          </h3>
          <button className="low-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* Summary Cards */}
        <div className="low-stock-summary">
          <div className="low-summary-card total">
            <div className="low-summary-icon">
              <i className="fas fa-boxes"></i>
            </div>
            <div className="low-summary-info">
              <span className="low-summary-label">{t('Total Alerts', 'စုစုပေါင်းသတိပေးချက်')}</span>
              <span className="low-summary-value">{totalItems}</span>
            </div>
          </div>

          <div className="low-summary-card expired">
            <div className="low-summary-icon">
              <i className="fas fa-times-circle"></i>
            </div>
            <div className="low-summary-info">
              <span className="low-summary-label">{t('Expired', 'သက်တမ်းကုန်')}</span>
              <span className="low-summary-value expired-value">{expiredCount}</span>
            </div>
          </div>

          <div className="low-summary-card expiring">
            <div className="low-summary-icon">
              <i className="fas fa-clock"></i>
            </div>
            <div className="low-summary-info">
              <span className="low-summary-label">{t('Expiring Soon', 'သက်တမ်းနီး')}</span>
              <span className="low-summary-value expiring-value">{expiringSoonCount}</span>
            </div>
          </div>

          <div className="low-summary-card low">
            <div className="low-summary-icon">
              <i className="fas fa-exclamation-triangle"></i>
            </div>
            <div className="low-summary-info">
              <span className="low-summary-label">{t('Low Stock', 'လက်ကျန်နည်း')}</span>
              <span className="low-summary-value">{lowStockCount}</span>
            </div>
          </div>

          <div className="low-summary-card out">
            <div className="low-summary-icon">
              <i className="fas fa-ban"></i>
            </div>
            <div className="low-summary-info">
              <span className="low-summary-label">{t('Out of Stock', 'ကုန်နေ')}</span>
              <span className="low-summary-value out-value">{outOfStockCount}</span>
            </div>
          </div>
        </div>

        {/* Products List */}
        <div className="low-stock-list-container">
          {loading ? (
            <div className="low-loading-state">
              <i className="fas fa-spinner fa-spin"></i>
              <p>{t('Loading products...', 'ပစ္စည်းများ ဖွင့်နေသည်...')}</p>
            </div>
          ) : products.length > 0 ? (
            <div className="low-stock-list">
              {products.map((product) => {
                const stockStatus = getStockStatus(product);
                const barColor = product.totalStock === 0 ? '#dc3545' :
                               product.totalStock < 3 ? '#ff8800' :
                               product.totalStock < 5 ? '#ffc107' : '#28a745';
                const stock = product.totalStock || 0;
                const percent = Math.min((stock / 10) * 100, 100);

                return (
                  <div key={product.id} className={`low-stock-item ${stockStatus?.class || ''}`}>
                    <div className="low-item-image">
                      <img
                        src={getImageSrc(product)}
                        alt={product.name}
                        onError={(e) => { e.target.src = empty_image; }}
                      />
                    </div>
                    <div className="low-item-info">
                      <div className="low-item-name-row">
                        <h4 className="low-item-name">{product.name || 'Unknown Product'}</h4>
                        {stockStatus && (
                          <span className={`low-status-badge ${stockStatus.class}`}>
                            <i className={`fas ${stockStatus.icon}`}></i>
                            {stockStatus.label}
                          </span>
                        )}
                      </div>
                      <div className="low-item-details">
                        <span>SKU: {product.sku || 'N/A'}</span>
                        <span>{product.barcode || 'N/A'}</span>
                        <span>{product.categoryName || 'Uncategorized'}</span>
                        <span className="low-item-price">{Number(product.price || 0).toLocaleString()} Ks</span>
                      </div>
                      <div className="low-item-stock">
                        <div className="low-stock-bar">
                          <div className="low-stock-fill" style={{ width: `${percent}%`, backgroundColor: barColor }}></div>
                        </div>
                        <span className="low-stock-count">
                          {t('Stock', 'လက်ကျန်')}: <strong>{stock}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="low-no-results">
              <i className="fas fa-check-circle"></i>
              <p>{t('All products are in good stock!', 'ပစ္စည်းအားလုံး လက်ကျန်ကောင်းမွန်ပါသည်။')}</p>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="low-stock-pagination">
            <div className="low-pagination-info">
              {t(`Page ${currentPage} of ${totalPages}`, `စာမျက်နှာ ${currentPage} / ${totalPages}`)}
            </div>
            <div className="low-pagination-controls">
              <button
                className="low-pagination-btn"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <i className="fas fa-chevron-left"></i>
              </button>
              <div className="low-pagination-page">
                <input
                  type="text"
                  className="low-pagination-input"
                  value={pageInput}
                  onChange={(e) => setPageInput(e.target.value)}
                  onBlur={handlePageInputBlur}
                  onKeyPress={(e) => e.key === 'Enter' && handlePageInputBlur()}
                  disabled={loading}
                />
                <span className="low-pagination-total">/ {totalPages}</span>
              </div>
              <button
                className="low-pagination-btn"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                <i className="fas fa-chevron-right"></i>
              </button>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="low-stock-modal-footer">
          <span className="low-result-count">
            {t(`Showing ${products.length} of ${totalItems} products`, `ပစ္စည်း ${products.length} ခု (စုစုပေါင်း ${totalItems}) ပြသနေသည်`)}
          </span>
          <button className="low-btn-secondary" onClick={onClose}>
            {t('Close', 'ပိတ်မည်')}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LowStockModal;