// ProductStockSearchModal.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import "../../light-style/user-css/productStockSearchModal.css";

const empty_image = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
    <rect width="200" height="200" fill="#f0f3f7"/>
    <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#999" text-anchor="middle" dy=".3em">No Image</text>
  </svg>`)}`;

const PRODUCTS_KEY = "demo_products";
const CATEGORIES_KEY = "demo_categories";

// ✅ Demo Branches (JSON data)
const SEED_BRANCHES = [
  { branchId: 1, branchName: "Yangon Main Branch", branchNameEn: "Yangon Main Branch", address: "123, Yangon-Mandalay Road, Yangon", addressEn: "123, Yangon-Mandalay Road, Yangon", phone: "09-123456789" },
  { branchId: 2, branchName: "Mandalay Branch",    branchNameEn: "Mandalay Branch",    address: "45, 26th Street, Mandalay",       addressEn: "45, 26th Street, Mandalay",       phone: "09-234567890" },
  { branchId: 3, branchName: "Naypyidaw Branch",   branchNameEn: "Naypyidaw Branch",   address: "78, Zabuthiri Road, Naypyidaw",   addressEn: "78, Zabuthiri Road, Naypyidaw",   phone: "09-345678901" },
  { branchId: 4, branchName: "Bago Branch",        branchNameEn: "Bago Branch",        address: "12, Bogyoke Road, Bago",          addressEn: "12, Bogyoke Road, Bago",          phone: "09-456789012" },
];

// ✅ localStorage helpers
const getData = (key, fallback = []) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch { return fallback; }
};

// ✅ Deterministic pseudo-random (based on product id + branch id)
const seededRandom = (seed) => {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
};

// ✅ Product တစ်ခုအတွက် fake branch stock တွေ ဖန်တီး
const generateBranchStocks = (product, branches) => {
  return branches.map((branch, idx) => {
    // ✅ Deterministic stock — product id + branch id ပေါ် မူတည်
    const seed = (product.id || 1) * 100 + branch.branchId;
    const rand = seededRandom(seed);

    // ✅ 30% chance out of stock, 70% chance in stock
    let stock = 0;
    if (rand > 0.3) {
      // 1 to 30 ကြား stock
      stock = Math.floor(rand * 30) + 1;
    }

    // ✅ Price — product ရဲ့ sellingPrice ကို အခြေခံ
    const basePrice = Number(product.sellingPrice || product.price || 0);
    // ✅ Branch အလိုက် ±5% ကွာခြား
    const priceVariation = 1 + ((seededRandom(seed + 999) - 0.5) * 0.1);
    const price = Math.round(basePrice * priceVariation);

    return {
      branchId: branch.branchId,
      branchName: branch.branchName,
      branchNameEn: branch.branchNameEn,
      address: branch.address,
      addressEn: branch.addressEn,
      phone: branch.phone,
      stock,
      price,
    };
  });
};

const ProductStockSearchModal = ({ isOpen, onClose, language = "mm", branchId }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [isPageLoading, setIsPageLoading] = useState(false);

  const t = (en, mm) => language === "mm" ? mm : en;

  // ✅ JSON ကနေ ရှာဖွေ
  const handleSearch = (page = 1) => {
    if (!searchTerm.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }

    setLoading(true);
    setError(null);
    setIsPageLoading(true);

    try {
      const allProducts = getData(PRODUCTS_KEY, []);
      const categories = getData(CATEGORIES_KEY, []);
      const q = searchTerm.toLowerCase().trim();

      // ✅ Active products တွေကိုပဲ ရှာ
      const matched = allProducts.filter(p => {
        if (p.status !== 'Active') return false;
        return (
          p.name?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q) ||
          p.sku?.toLowerCase().includes(q)
        );
      });

      // ✅ Category name + branch stocks ထည့်
      const enriched = matched.map(p => {
        const cat = categories.find(c => c.id === p.categoryId);
        const branches = generateBranchStocks(p, SEED_BRANCHES);
        return {
          id: p.id,
          name: p.name,
          sku: p.sku,
          barcode: p.barcode,
          image: p.image,
          categoryName: cat?.name || p.categoryName || 'Uncategorized',
          branches,
        };
      });

      // ✅ Pagination
      const total = enriched.length;
      const totalPagesCalc = Math.max(1, Math.ceil(total / itemsPerPage));
      const safePage = Math.min(Math.max(1, page), totalPagesCalc);
      const start = (safePage - 1) * itemsPerPage;
      const paged = enriched.slice(start, start + itemsPerPage);

      setResults(paged);
      setTotalItems(total);
      setTotalPages(totalPagesCalc);
      setCurrentPage(safePage);
      setPageInputValue(safePage.toString());
    } catch (err) {
      console.error('Error searching products:', err);
      setError(t('Search failed', 'ရှာဖွေမှု မအောင်မြင်ပါ'));
    } finally {
      setLoading(false);
      setIsPageLoading(false);
      setSearched(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      handleSearch(1);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setResults([]);
    setSearched(false);
    setError(null);
    setCurrentPage(1);
    setPageInputValue("1");
  };

  const changePage = (page) => {
    if (page < 1 || page > totalPages || isPageLoading || loading) return;
    handleSearch(page);
  };

  const handlePageInputBlur = () => {
    let page = parseInt(pageInputValue);
    if (isNaN(page) || page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    changePage(page);
  };

  const handleItemsPerPageChange = (e) => {
    const newSize = parseInt(e.target.value);
    setItemsPerPage(newSize);
    setCurrentPage(1);
    // ✅ ချက်ချင်း re-search
    setTimeout(() => handleSearch(1), 0);
  };

  // ✅ Modal ပိတ်ရင် state ရှင်း
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setResults([]);
      setSearched(false);
      setError(null);
      setCurrentPage(1);
      setPageInputValue("1");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="pss-overlay" onClick={onClose}>
      <div className="pss-modal" onClick={(e) => e.stopPropagation()}>

        {/* ===== HEADER ===== */}
        <div className="pss-header">
          <h3 className="pss-title">
            {t("Search Products in Branches", "ပစ္စည်းရှိသည့်ဆိုင်များ ရှာဖွေရန်")}
          </h3>
          <button className="pss-close" onClick={onClose}>✕</button>
        </div>

        {/* ===== SEARCH BOX ===== */}
        <div className="pss-search-box">
          <div className="pss-search-wrap">
            <button className="pss-search-btn" onClick={() => handleSearch(1)} disabled={loading}>
              <i className="fas fa-search pss-search-icon"></i>
            </button>
            <input
              className="pss-search-input"
              type="text"
              placeholder={t(
                "Search by product name, barcode or SKU",
                "ပစ္စည်းအမည်၊ ဘားကုဒ် သို့မဟုတ် SKU ဖြင့်ရှာပါ"
              )}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              autoFocus
              disabled={loading}
            />
            {searchTerm && (
              <button className="pss-clear" onClick={clearSearch} disabled={loading}>
                ✕
              </button>
            )}
          </div>
          <button className="pss-submit" onClick={() => handleSearch(1)} disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : t("Search", "ရှာမည်")}
          </button>
        </div>

        {/* ===== ERROR ===== */}
        {error && (
          <div className="pss-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
          </div>
        )}

        {/* ===== RESULTS ===== */}
        <div className="pss-results">
          {!searched ? (
            <div className="pss-empty">
              <div className="pss-empty-icon">🔍</div>
              <p>{t("Type product name to search which branches have stock", "ပစ္စည်းအမည် ရိုက်ပြီး ဘယ်ဆိုင်တွေမှာ ရှိလဲ ရှာဖွေပါ")}</p>
            </div>
          ) : loading ? (
            <div className="pss-loading">
              <i className="fas fa-spinner fa-spin"></i>
              <p>{t("Searching...", "ရှာဖွေနေသည်...")}</p>
            </div>
          ) : results.length === 0 ? (
            <div className="pss-empty">
              <div className="pss-empty-icon">😕</div>
              <p>{t(`No products found matching '${searchTerm}'`, `'${searchTerm}' နှင့်ကိုက်ညီသော ပစ္စည်း မတွေ့ပါ`)}</p>
            </div>
          ) : (
            <>
              <div className="pss-list">
                {results.map((product) => (
                  <div key={product.barcode} className="pss-card">
                    <div className="pss-card-header">
                      <h4 className="pss-card-title">{product.name}</h4>
                      <div className="pss-card-codes">
                        <span className="pss-badge sku">SKU: {product.sku}</span>
                        <span className="pss-badge barcode">Barcode: {product.barcode}</span>
                      </div>
                    </div>
                    <div className="pss-branches">
                      <h5 className="pss-branches-title">{t("Available Branches", "ရောင်းချနေသောဆိုင်များ")}</h5>
                      {product.branches.map((branch) => (
                        <div key={branch.branchId} className="pss-branch">
                          <div className="pss-branch-info">
                            <div className="pss-branch-row">
                              <strong className="pss-branch-name">{t(branch.branchName, branch.branchName)}</strong>
                              <span className={`pss-stock-badge ${branch.stock > 0 ? 'in' : 'out'}`}>
                                {branch.stock > 0 ? t(`${branch.stock} in stock`, `${branch.stock} ခုရှိ`) : t("Out of stock", "ကုန်နေ")}
                              </span>
                            </div>
                            <div className="pss-branch-address">
                              <i className="fas fa-store-alt"></i>
                              <span>{t(branch.address, branch.addressEn)}</span>
                            </div>
                            <div className="pss-branch-contact">
                              <span className="pss-branch-price">
                                <i className="fas fa-tag"></i> {branch.price?.toLocaleString()} Ks
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== PAGINATION ===== */}
              {totalPages > 1 && (
                <div className="pss-pagination">
                  <span className="pss-page-info">
                    {t(`Page ${currentPage} of ${totalPages}`, `စာမျက်နှာ ${currentPage} / ${totalPages}`)}
                  </span>
                  <div className="pss-page-controls">
                    <button className="pss-page-btn" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1 || isPageLoading}>
                      <i className="fas fa-chevron-left"></i>
                    </button>
                    <div className="pss-page-input-group">
                      <input
                        type="text"
                        className="pss-page-input"
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={handlePageInputBlur}
                        onKeyPress={(e) => e.key === 'Enter' && handlePageInputBlur()}
                        disabled={isPageLoading}
                      />
                      <span className="pss-page-total">/ {totalPages}</span>
                    </div>
                    <button className="pss-page-btn" onClick={() => changePage(currentPage + 1)} disabled={currentPage === totalPages || isPageLoading}>
                      <i className="fas fa-chevron-right"></i>
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="pss-footer">
          <span className="pss-result-count">
            {searched && !loading && t(`Found ${totalItems} products`, `တွေ့ရှိသည့်ပစ္စည်း: ${totalItems} မျိုး`)}
          </span>
          <div className="pss-items-per-page">
            <select className="pss-select" value={itemsPerPage} onChange={handleItemsPerPageChange} disabled={loading}>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>{t("/page", "/စာမျက်နှာ")}</span>
          </div>
          <button className="pss-close-footer" onClick={onClose}>
            {t("Close", "ပိတ်မည်")}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ProductStockSearchModal;