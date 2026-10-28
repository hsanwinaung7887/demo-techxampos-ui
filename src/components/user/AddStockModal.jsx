// AddStockModal.jsx (Demo — Frontend only, JSON + localStorage)
import React, { useState, useEffect, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import CategoryModal from './CategoryModal';

const PRODUCTS_KEY = "demo_products";
const CATEGORIES_KEY = "demo_categories";
const BATCHES_KEY = "demo_inventory_batches";
const INV_LOGS_KEY = "demo_inventory_logs";

// ✅ localStorage helpers — empty array/object ဆိုရင်လည်း seed ထည့်
const getData = (key, seed) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    const parsed = JSON.parse(raw);
    // ✅ Empty array ဖြစ်ရင် seed ထည့်
    if (Array.isArray(parsed) && parsed.length === 0 && Array.isArray(seed) && seed.length > 0) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    return parsed;
  } catch {
    return seed;
  }
};
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

const makeImage = (letter, bg = "#4361ee") =>
  `data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120">
      <rect width="120" height="120" rx="12" fill="${bg}"/>
      <text x="50%" y="55%" font-family="Arial" font-size="52" font-weight="bold"
            fill="white" text-anchor="middle" dominant-baseline="middle">${letter}</text>
    </svg>`)}`;

const AddStockModal = ({ isOpen, onClose, currentUser, language, onSuccess }) => {
  const [step, setStep] = useState('category');
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const categoryRef = useRef(null);
  const [isUnitOpen, setIsUnitOpen] = useState(false);
  const unitRef = useRef(null);

  const unitOptions = [
    { value: 'pcs', mm: 'ခု (pcs)', en: 'pcs' },
    { value: 'kg', mm: 'ကီလို (kg)', en: 'kg' },
    { value: 'g', mm: 'ဂရမ် (g)', en: 'g' },
    { value: 'L', mm: 'လီတာ (L)', en: 'L' },
    { value: 'box', mm: 'ဘူး (box)', en: 'box' },
    { value: 'pack', mm: 'ထုပ် (pack)', en: 'pack' },
    { value: 'dozen', mm: 'ဒါဇင် (dozen)', en: 'dozen' },
    { value: 'pair', mm: 'စုံ (pair)', en: 'pair' },
  ];

  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', status: 'Active', imageFile: null, currentImageUrl: '' });
  const [productForm, setProductForm] = useState({ name: '', barcode: '', sku: '', sellingPrice: '', unit: 'pcs', minStock: 0, description: '', notes: '', imageFile: null, imagePreview: '' });
  const [batchForm, setBatchForm] = useState({
    quantity: '', purchasePrice: '',
    dateReceived: new Date().toISOString().split('T')[0],
    expiryDate: '', supplier: '', location: '', notes: ''
  });

  const [error, setError] = useState('');
  const [categoryFormErrors, setCategoryFormErrors] = useState({});
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target)) setIsCategoryOpen(false);
      if (unitRef.current && !unitRef.current.contains(event.target)) setIsUnitOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setCategories(getData(CATEGORIES_KEY, []));
      resetForm();
    }
  }, [isOpen]);

  const resetForm = () => {
    setStep('category');
    setSelectedCategoryId('');
    setCategoryForm({ name: '', description: '', status: 'Active', imageFile: null, currentImageUrl: '' });
    setProductForm({ name: '', barcode: '', sku: '', sellingPrice: '', unit: 'pcs', minStock: 0, description: '', notes: '', imageFile: null, imagePreview: '' });
    setBatchForm({ quantity: '', purchasePrice: '', dateReceived: new Date().toISOString().split('T')[0], expiryDate: '', supplier: '', location: '', notes: '' });
    setError('');
    setCategoryFormErrors({});
  };

  const getSelectedCategoryName = () => {
    if (!selectedCategoryId) return language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select category';
    const cat = categories.find(c => c.id.toString() === selectedCategoryId);
    return cat ? cat.name : (language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select category');
  };
  const getSelectedUnitName = () => {
    const u = unitOptions.find(o => o.value === productForm.unit);
    return u ? (language === 'mm' ? u.mm : u.en) : (language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select unit');
  };

  // ===== Category =====
  const handleCategoryFormChange = (e) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  const handleCategoryStatusChange = (status) => setCategoryForm(prev => ({ ...prev, status }));
  const handleCategoryImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true });
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });
      setCategoryForm(prev => ({ ...prev, imageFile: compressed, currentImageUrl: base64 }));
    } catch (err) { alert('Image compression failed.'); }
  };
  const handleCategoryRemoveImage = () => {
    setCategoryForm(prev => ({ ...prev, imageFile: null, currentImageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCategorySave = async () => {
    if (!categoryForm.name.trim()) {
      setCategoryFormErrors({ name: 'အမျိုးအစားအမည် လိုအပ်ပါသည်' });
      return;
    }
    setCategoryFormErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 250));

    const list = getData(CATEGORIES_KEY, []);
    const newId = list.length ? Math.max(...list.map(c => c.id)) + 1 : 1;
    const newCat = {
      id: newId,
      name: categoryForm.name.trim(),
      description: categoryForm.description.trim(),
      status: categoryForm.status,
      image: categoryForm.currentImageUrl || makeImage(categoryForm.name.charAt(0).toUpperCase()),
      createdAt: new Date().toISOString(),
    };
    const updated = [...list, newCat];
    saveData(CATEGORIES_KEY, updated);
    setCategories(updated);
    setSelectedCategoryId(newId.toString());
    setShowCategoryModal(false);
    setLoading(false);
    setStep('product');
  };

  // ===== Product =====
  const handleProductImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/') || file.size > 5 * 1024 * 1024) return;
    try {
      const compressed = await imageCompression(file, { maxSizeMB: 0.5, maxWidthOrHeight: 1024, useWebWorker: true });
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(compressed);
      });
      setProductForm(prev => ({ ...prev, imageFile: compressed, imagePreview: base64 }));
    } catch (err) { alert('Image compression failed.'); }
  };
  const handleProductRemoveImage = () => setProductForm(prev => ({ ...prev, imageFile: null, imagePreview: '' }));

  // ===== Steps =====
  const canProceed = () => {
    if (step === 'category') return selectedCategoryId !== '';
    if (step === 'product') return productForm.name && productForm.barcode && productForm.sku && productForm.sellingPrice;
    if (step === 'batch') return batchForm.quantity && batchForm.purchasePrice && batchForm.dateReceived;
    return true;
  };

  const handleNext = () => {
    if (step === 'category') setStep('product');
    else if (step === 'product') setStep('batch');
    else handleSubmit();
  };

  const handleBack = () => {
    if (step === 'product') setStep('category');
    else if (step === 'batch') setStep('product');
  };

  // ============================================================
  // ✅ SUBMIT — Product + Batch + Log ကို localStorage မှာ တစ်ခါတည်း သိမ်း
  // ============================================================
  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    await new Promise(r => setTimeout(r, 300));

    try {
      const qty = parseInt(batchForm.quantity) || 0;
      const purchasePrice = parseFloat(batchForm.purchasePrice) || 0;
      const sellingPrice = parseFloat(productForm.sellingPrice) || 0;

      // ============================================================
      // 1️⃣ Product ကို demo_products မှာ ထည့်
      // ============================================================
      const products = getData(PRODUCTS_KEY, []);
      const cat = categories.find(c => c.id.toString() === selectedCategoryId);
      const newProductId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;

      const newProduct = {
        id: newProductId,
        name: productForm.name.trim(),
        barcode: productForm.barcode.trim(),
        sku: productForm.sku.trim(),
        categoryId: parseInt(selectedCategoryId),
        categoryName: cat?.name || '',
        sellingPrice: sellingPrice,
        costPrice: purchasePrice,            // ✅ batch မှ ယူ
        unit: productForm.unit || 'pcs',
        minStock: parseInt(productForm.minStock) || 0,
        totalStock: qty,                     // ✅ batch qty ကို total stock အဖြစ်
        description: productForm.description.trim(),
        notes: productForm.notes.trim(),
        status: 'Active',
        image: productForm.imagePreview || makeImage(productForm.name.charAt(0).toUpperCase()),
        createdAt: new Date().toISOString(),
      };

      const updatedProducts = [newProduct, ...products];
      saveData(PRODUCTS_KEY, updatedProducts);

      // ============================================================
      // 2️⃣ Batch ကို demo_inventory_batches (object) မှာ ထည့်
      // ============================================================
      const batches = getData(BATCHES_KEY, {});
      const list = batches[newProductId] || [];
      const newBatch = {
        id: Date.now(),
        productId: newProductId,
        batchNumber: `B-${Date.now()}`,
        purchasePrice: purchasePrice,
        quantity: qty,
        remaining: qty,                      // ✅ remaining = quantity
        dateReceived: batchForm.dateReceived,
        expiryDate: batchForm.expiryDate || null,
        supplier: batchForm.supplier || '',
        location: batchForm.location || '',
        notes: batchForm.notes || '',
        createdAt: new Date().toISOString(),
      };
      const updatedBatches = { ...batches, [newProductId]: [...list, newBatch] };
      saveData(BATCHES_KEY, updatedBatches);

      // ============================================================
      // 3️⃣ Log ကို demo_inventory_logs မှာ ထည့်
      // ============================================================
      const logs = getData(INV_LOGS_KEY, []);
      const newLog = {
        id: logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1,
        actionType: 'ADD_BATCH',
        productId: newProductId,
        productName: newProduct.name,
        createdByName: currentUser?.fullName || currentUser?.username || 'Unknown',
        createdByRole: currentUser?.role || 'N/A',
        createdAt: new Date().toISOString(),
        changes: [
          `အမည်: ${newProduct.name}`,
          `ဘားကုဒ်: ${newProduct.barcode}`,
          `အရေအတွက်: ${qty}`,
          `ဝယ်ဈေး: ${purchasePrice.toLocaleString()} MMK`,
          `စုစုပေါင်းကုန်ကျစရိတ်: ${(purchasePrice * qty).toLocaleString()} MMK`,
        ],
      };
      saveData(INV_LOGS_KEY, [...logs, newLog]);

      // ✅ Parent ကို reload ခိုင်း
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="inv-modal-overlay">
      <div className="inv-modal-content" style={{ maxWidth: '700px' }}>
        <div className="inv-modal-header">
          <h3><i className="fas fa-plus-circle"></i> {language === 'mm' ? 'စတော့အသစ်ထည့်ရန်' : 'Add Stock'}</h3>
          <button className="inv-modal-close" onClick={onClose}><i className="fas fa-times"></i></button>
        </div>

        <div className="inv-modal-body">
          {error && (
            <div className="cat-message error" style={{ marginBottom: 15 }}>
              <i className="fas fa-exclamation-circle"></i>
              <span>{error}</span>
            </div>
          )}

          <div style={{ display: 'flex', marginBottom: 20, borderBottom: '1px solid #eee', paddingBottom: 10 }}>
            <div style={{ flex: 1, textAlign: 'center', color: step === 'category' ? '#4361ee' : '#ccc' }}>
              <div className="step-number">1</div>
              <div className="step-label">{language === 'mm' ? 'အမျိုးအစား' : 'Category'}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', color: step === 'product' ? '#4361ee' : '#ccc' }}>
              <div className="step-number">2</div>
              <div className="step-label">{language === 'mm' ? 'ပစ္စည်း' : 'Product'}</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', color: step === 'batch' ? '#4361ee' : '#ccc' }}>
              <div className="step-number">3</div>
              <div className="step-label">{language === 'mm' ? 'အသုတ်' : 'Batch'}</div>
            </div>
          </div>

          {/* Step 1: Category */}
          {step === 'category' && (
            <div className="addstock-step">
              <div className="inv-form-group">
                <label className="inv-required">{language === 'mm' ? 'အမျိုးအစား' : 'Category'}</label>
                <div className="inv-custom-select-wrapper" ref={categoryRef}>
                  <div className={`inv-custom-select-trigger ${isCategoryOpen ? 'open' : ''}`} onClick={() => !loading && setIsCategoryOpen(!isCategoryOpen)}>
                    <span className="inv-selected-value">{getSelectedCategoryName()}</span>
                    <i className={`fas fa-chevron-${isCategoryOpen ? 'up' : 'down'}`}></i>
                  </div>
                  {isCategoryOpen && (
                    <div className="inv-custom-select-dropdown">
                      <div className={`inv-custom-option ${!selectedCategoryId ? 'selected' : ''}`} onClick={() => { setSelectedCategoryId(''); setIsCategoryOpen(false); }}>
                        {language === 'mm' ? 'ရွေးချယ်ပါ' : 'Select category'}
                      </div>
                      {categories.map(cat => (
                        <div key={cat.id} className={`inv-custom-option ${selectedCategoryId === cat.id.toString() ? 'selected' : ''}`}
                          onClick={() => { setSelectedCategoryId(cat.id.toString()); setIsCategoryOpen(false); }}>
                          {cat.name}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <button className="inv-btn-secondary" onClick={() => setShowCategoryModal(true)} style={{ marginTop: 10 }}>
                <i className="fas fa-plus"></i> {language === 'mm' ? 'အမျိုးအစားအသစ်' : 'New Category'}
              </button>
            </div>
          )}

          {/* Step 2: Product */}
          {step === 'product' && (
            <div className="addstock-step">
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label className="inv-required">{language === 'mm' ? 'ပစ္စည်းအမည်' : 'Product Name'}</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm({ ...productForm, name: e.target.value })} />
                </div>
                <div className="inv-form-group">
                  <label className="inv-required">{language === 'mm' ? 'ဘားကုဒ်' : 'Barcode'}</label>
                  <input type="text" value={productForm.barcode} onChange={e => setProductForm({ ...productForm, barcode: e.target.value })} />
                </div>
              </div>
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label className="inv-required">SKU</label>
                  <input type="text" value={productForm.sku} onChange={e => setProductForm({ ...productForm, sku: e.target.value })} />
                </div>
                <div className="inv-form-group">
                  <label className="inv-required">{language === 'mm' ? 'ရောင်းဈေး' : 'Selling Price'}</label>
                  <input type="number" value={productForm.sellingPrice} onChange={e => setProductForm({ ...productForm, sellingPrice: e.target.value })} />
                </div>
              </div>
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label>{language === 'mm' ? 'ယူနစ်' : 'Unit'}</label>
                  <div className="inv-custom-select-wrapper" ref={unitRef}>
                    <div className={`inv-custom-select-trigger ${isUnitOpen ? 'open' : ''}`} onClick={() => !loading && setIsUnitOpen(!isUnitOpen)}>
                      <span className="inv-selected-value">{getSelectedUnitName()}</span>
                      <i className={`fas fa-chevron-${isUnitOpen ? 'up' : 'down'}`}></i>
                    </div>
                    {isUnitOpen && (
                      <div className="inv-custom-select-dropdown">
                        {unitOptions.map(u => (
                          <div key={u.value} className={`inv-custom-option ${productForm.unit === u.value ? 'selected' : ''}`}
                            onClick={() => { setProductForm({ ...productForm, unit: u.value }); setIsUnitOpen(false); }}>
                            {language === 'mm' ? u.mm : u.en}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="inv-form-group">
                  <label>{language === 'mm' ? 'အနည်းဆုံး သိုလှောင်ပမာဏ' : 'Min Stock'}</label>
                  <input type="number" min="0" value={productForm.minStock} onChange={e => setProductForm({ ...productForm, minStock: e.target.value })} />
                </div>
              </div>
              <div className="inv-form-group">
                <label>{language === 'mm' ? 'ဖော်ပြချက်' : 'Description'}</label>
                <textarea value={productForm.description} onChange={e => setProductForm({ ...productForm, description: e.target.value })} rows="2" />
              </div>
              <div className="inv-form-group">
                <label>{language === 'mm' ? 'ပုံ' : 'Image'}</label>
                <input type="file" onChange={handleProductImageUpload} accept="image/*" style={{ display: 'none' }} id="product-image-input" />
                {!productForm.imagePreview ? (
                  <div className="inv-image-upload" onClick={() => document.getElementById('product-image-input').click()}>
                    <i className="fas fa-cloud-upload-alt"></i>
                    <span>{language === 'mm' ? 'ပုံတင်ရန် နှိပ်ပါ' : 'Click to upload image'}</span>
                  </div>
                ) : (
                  <div className="inv-image-preview">
                    <img src={productForm.imagePreview} alt="Preview" />
                    <button className="inv-remove-image" onClick={handleProductRemoveImage}><i className="fas fa-times"></i></button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Batch */}
          {step === 'batch' && (
            <div className="addstock-step">
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label className="inv-required">{language === 'mm' ? 'အရေအတွက်' : 'Quantity'}</label>
                  <input type="number" value={batchForm.quantity} onChange={e => setBatchForm({ ...batchForm, quantity: e.target.value })} min="1" />
                </div>
                <div className="inv-form-group">
                  <label className="inv-required">{language === 'mm' ? 'ဝယ်ဈေး' : 'Purchase Price'}</label>
                  <input type="number" value={batchForm.purchasePrice} onChange={e => setBatchForm({ ...batchForm, purchasePrice: e.target.value })} min="0" step="50" />
                </div>
              </div>
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label className="inv-required">{language === 'mm' ? 'လက်ခံရက်စွဲ' : 'Date Received'}</label>
                  <input type="date" value={batchForm.dateReceived} onChange={e => setBatchForm({ ...batchForm, dateReceived: e.target.value })} />
                </div>
                <div className="inv-form-group">
                  <label>{language === 'mm' ? 'သက်တမ်းကုန်ရက်' : 'Expiry Date'}</label>
                  <input type="date" value={batchForm.expiryDate} onChange={e => setBatchForm({ ...batchForm, expiryDate: e.target.value })} />
                </div>
              </div>
              <div className="inv-form-row">
                <div className="inv-form-group">
                  <label>{language === 'mm' ? 'ထောက်ပံ့သူ' : 'Supplier'}</label>
                  <input type="text" value={batchForm.supplier} onChange={e => setBatchForm({ ...batchForm, supplier: e.target.value })} />
                </div>
                <div className="inv-form-group">
                  <label>{language === 'mm' ? 'တည်နေရာ' : 'Location'}</label>
                  <input type="text" value={batchForm.location} onChange={e => setBatchForm({ ...batchForm, location: e.target.value })} />
                </div>
              </div>
              <div className="inv-form-group">
                <label>{language === 'mm' ? 'မှတ်ချက်' : 'Notes'}</label>
                <textarea value={batchForm.notes} onChange={e => setBatchForm({ ...batchForm, notes: e.target.value })} rows="2" />
              </div>

              {/* ✅ Live Total Cost Preview */}
              {batchForm.quantity && batchForm.purchasePrice && (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  borderRadius: 10,
                  padding: '12px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 10
                }}>
                  <span style={{ color: '#065f46', fontWeight: 600, fontSize: 14 }}>
                    <i className="fas fa-coins" style={{ marginRight: 8 }}></i>
                    {language === 'mm' ? 'စုစုပေါင်းကုန်ကျစရိတ်' : 'Total Cost'}:
                  </span>
                  <span style={{ color: '#065f46', fontWeight: 700, fontSize: 16 }}>
                    {((parseFloat(batchForm.purchasePrice) || 0) * (parseInt(batchForm.quantity) || 0)).toLocaleString()} MMK
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="inv-modal-footer">
          {step !== 'category' && (
            <button className="inv-btn-cancel" onClick={handleBack} disabled={loading}>
              {language === 'mm' ? 'နောက်သို့' : 'Back'}
            </button>
          )}
          <button className="inv-btn-submit" onClick={handleNext} disabled={!canProceed() || loading}>
            {loading ? <><i className="fas fa-spinner fa-spin"></i> လုပ်ဆောင်နေသည်...</> : step === 'batch' ? <><i className="fas fa-save"></i> သိမ်းဆည်းမည်</> : <><i className="fas fa-arrow-right"></i> ရှေ့သို့</>}
          </button>
          <button className="inv-btn-cancel" onClick={onClose} disabled={loading}>
            {language === 'mm' ? 'မလုပ်တော့ပါ' : 'Cancel'}
          </button>
        </div>
      </div>

      {/* Category Modal */}
      <CategoryModal
        show={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        modalType="add"
        categoryForm={categoryForm}
        onFormChange={handleCategoryFormChange}
        onStatusChange={handleCategoryStatusChange}
        onImageUpload={handleCategoryImageUpload}
        onRemoveImage={handleCategoryRemoveImage}
        onSave={handleCategorySave}
        loading={loading}
        validationError={null}
        formErrors={categoryFormErrors}
        currentUser={currentUser}
        language={language}
        fileInputRef={fileInputRef}
      />
    </div>
  );
};

export default AddStockModal;