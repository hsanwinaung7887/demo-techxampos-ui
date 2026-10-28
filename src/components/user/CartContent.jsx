// CartContent.jsx (Demo — Frontend only, JSON + localStorage)
import { createContext, useState, useContext, useEffect, useCallback } from "react";
import { useSelector } from 'react-redux';

const CartContent = createContext();

export const useCart = () => {
  const context = useContext(CartContent);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};

// ✅ localStorage keys
const CART_KEY = "demo_sale_cart";
const CUSTOMER_KEY = "demo_sale_customer";
const TAX_KEY = "demo_sale_tax";
const HELD_CARTS_KEY = "demo_sale_held_carts";
const INVOICE_KEY = "demo_sale_invoice_counter";

const getData = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch { return fallback; }
};
const saveData = (key, data) => localStorage.setItem(key, JSON.stringify(data));

export const CartProvider = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [cartItems, setCartItems] = useState([]);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [customerName, setCustomerName] = useState("ဧည့်သည်");
  const [customerPhone, setCustomerPhone] = useState("");
  const [heldCarts, setHeldCarts] = useState([]);
  const [branchId, setBranchId] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [language, setLanguage] = useState(localStorage.getItem('appLanguage') || 'mm');

  const [branchModules, setBranchModules] = useState({
    Category: true, Inventory: true, Product: true, Sale: true,
    Return: true, Credit: true, Discount: true, Damage: true,
    Expense: true, Capital: true, BranchAccount: true, MyAccount: true, AboutInfo: true
  });
  const [currentBranch, setCurrentBranch] = useState(null);

  // ===== User → branchId, currentUser =====
  useEffect(() => {
    if (user && isAuthenticated) {
      const bId = user.branchId || user.branch_id;
      setBranchId(bId);
      setCurrentUser({
        id: user.id,
        name: user.fullName || user.username,
        username: user.username,
        role: user.role,
        email: user.email,
        branch_id: bId,
        shop_id: user.shopId || user.shop_id,
      });
    }
  }, [user, isAuthenticated]);

  // ===== Language listener =====
  useEffect(() => {
    const handler = (e) => setLanguage(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);

  // ===== Load from localStorage =====
  useEffect(() => {
    setCartItems(getData(CART_KEY, []));
    setCustomerName(getData(CUSTOMER_KEY, { name: "ဧည့်သည်", phone: "" }).name || "ဧည့်သည်");
    setCustomerPhone(getData(CUSTOMER_KEY, { name: "ဧည့်သည်", phone: "" }).phone || "");
    setTaxPercentage(parseFloat(getData(TAX_KEY, 0)) || 0);
    setHeldCarts(getData(HELD_CARTS_KEY, []));
  }, []);

  // ===== Save =====
  useEffect(() => { saveData(CART_KEY, cartItems); }, [cartItems]);
  useEffect(() => { saveData(CUSTOMER_KEY, { name: customerName, phone: customerPhone }); }, [customerName, customerPhone]);
  useEffect(() => { saveData(TAX_KEY, taxPercentage); }, [taxPercentage]);
  useEffect(() => { saveData(HELD_CARTS_KEY, heldCarts); }, [heldCarts]);

  // ===== Categories (from demo_categories) =====
  const fetchCategories = useCallback(async () => {
    try {
      const raw = localStorage.getItem("demo_categories");
      let list = raw ? JSON.parse(raw) : [];
      list = list.filter(c => c.status === 'Active');
      setCategories(list.map(c => ({
        id: c.id,
        name: c.name,
        nameEn: c.name,
        image: c.image,
        itemCount: 0,
      })));
    } catch {
      setCategories([]);
    }
  }, []);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  // ===== Invoice number (local counter) =====
  const getNextInvoiceNumber = useCallback(async () => {
    const counter = parseInt(localStorage.getItem(INVOICE_KEY) || "0", 10);
    const next = counter + 1;
    localStorage.setItem(INVOICE_KEY, String(next));
    const pad = String(next).padStart(6, "0");
    return `INV-${pad}`;
  }, []);

  // ===== Add to cart =====
  const addToCart = (product) => {
    const availableStock = product.totalStock || 0;
    const existingItem = cartItems.find(item => item.id === product.id);
    const currentQtyInCart = existingItem ? existingItem.quantity : 0;
    const totalQty = currentQtyInCart + 1;

    if (totalQty > availableStock) {
      alert(`⚠️ ${product.name} ${language === "mm" ? `လက်ကျန် ${availableStock} ခုသာရှိပါသည်` : `only ${availableStock} items in stock`}`);
      return;
    }

    const discount = product.discount || {};
    const isBuyXGetY = discount.type === 'BuyXGetY' || discount.type === 'Buy X Get Y';
    const buyQty = discount.buyQuantity || 2;
    const getQty = discount.getQuantity || 1;

    setCartItems(prevItems => {
      const existing = prevItems.find(item => item.id === product.id);
      if (existing) {
        const newQuantity = existing.quantity + 1;
        let freeQty = 0;
        if (isBuyXGetY) freeQty = Math.floor(newQuantity / buyQty) * getQty;
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: newQuantity, isBuyXGetY, buyQty, getQty, freeQty }
            : item
        );
      }
      return [...prevItems, {
        id: product.id,
        name: product.name,
        price: product.price,
        originalPrice: product.originalPrice || product.price,
        quantity: 1,
        stock: availableStock,
        totalStock: availableStock,
        image: product.image,
        imageUrl: product.imageUrl,
        discount: product.discount,
        discountAmount: product.discountAmount,
        hasDiscount: product.hasDiscount,
        isBuyXGetY,
        buyQty,
        getQty,
        freeQty: 0,
        discountId: discount.id,
        discountType: discount.type,
        discountLabel: discount.label,
        barcode: product.barcode,
        sku: product.sku,
        categoryId: product.categoryId,
        categoryName: product.categoryName,
      }];
    });
  };

  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) { removeFromCart(id); return; }
    setCartItems(prev => {
      const item = prev.find(i => i.id === id);
      if (!item) return prev;
      const availableStock = item.stock || item.totalStock || 0;
      if (newQuantity > availableStock) {
        alert(`⚠️ ${item.name} ${language === "mm" ? `လက်ကျန် ${availableStock} ခုသာရှိပါသည်` : `only ${availableStock} items in stock`}`);
        return prev;
      }
      return prev.map(i => {
        if (i.id !== id) return i;
        let freeQty = 0;
        if (i.isBuyXGetY) freeQty = Math.floor(newQuantity / (i.buyQty || 2)) * (i.getQty || 1);
        return { ...i, quantity: newQuantity, freeQty };
      });
    });
  };

  const removeFromCart = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCartItems([]);

  // ===== Calculate totals (with discount) =====
  const calculateCartTotals = useCallback((items) => {
    let subtotal = 0;
    let discountTotal = 0;
    let totalQuantity = 0;
    items.forEach(item => {
      const itemOriginalTotal = (item.originalPrice || item.price) * item.quantity;
      const itemDiscountedTotal = item.price * item.quantity;
      const itemDiscount = itemOriginalTotal - itemDiscountedTotal;
      subtotal += itemDiscountedTotal;
      discountTotal += itemDiscount;
      totalQuantity += item.quantity;
    });
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, discountTotal, taxAmount, total, totalQuantity };
  }, [taxPercentage]);

  // ===== Hold cart (local) =====
  const holdCart = async () => {
    if (cartItems.length === 0) {
      alert(language === "mm" ? "ဈေးခြင်းထဲ ဘာမှမရှိပါ!" : "Cart is empty!");
      return null;
    }
    const totals = calculateCartTotals(cartItems);
    const newHeld = {
      id: Date.now(),
      branchId,
      customerName,
      customerPhone,
      items: cartItems.map(item => ({ ...item })),
      subtotal: totals.subtotal,
      discountTotal: totals.discountTotal,
      taxPercentage,
      taxAmount: totals.taxAmount,
      total: totals.total,
      heldAt: new Date().toISOString(),
    };
    const updated = [...heldCarts, newHeld];
    setHeldCarts(updated);
    saveData(HELD_CARTS_KEY, updated);
    clearCart();
    return newHeld;
  };

  const continueHeldCart = (heldCart) => {
    const items = (heldCart.items || []).map(item => ({
      ...item,
      id: item.id || item.productId,
      quantity: item.quantity || 1,
      stock: item.stock || item.totalStock || 999,
      totalStock: item.totalStock || item.stock || 999,
    }));
    setCartItems(items);
    setTaxPercentage(heldCart.taxPercentage || 0);
    setCustomerName(heldCart.customerName || "ဧည့်သည်");
    setCustomerPhone(heldCart.customerPhone || "");
    const updated = heldCarts.filter(c => c.id !== heldCart.id);
    setHeldCarts(updated);
    saveData(HELD_CARTS_KEY, updated);
  };

  const deleteHeldCart = (cartId) => {
    const updated = heldCarts.filter(c => c.id !== cartId);
    setHeldCarts(updated);
    saveData(HELD_CARTS_KEY, updated);
  };

  // ===== Checkout (local — save to demo_sales) =====
  const checkout = async (additionalDiscount = 0, paymentMethod = "Cash", printReceipt = true, taxOverride = null, invoiceNo = null) => {
    if (cartItems.length === 0) throw new Error("Cart is empty");

    const totals = calculateCartTotals(cartItems);
    const effectiveTax = taxOverride !== null ? taxOverride : taxPercentage;

    // ✅ Final total calculation
    const subtotal = totals.subtotal;
    const productDiscount = totals.discountTotal;
    const additional = Math.min(additionalDiscount, subtotal);
    const taxable = subtotal - additional;
    const taxAmount = (taxable * effectiveTax) / 100;
    const finalTotal = taxable + taxAmount;

    const sale = {
      id: Date.now(),
      invoiceNo: invoiceNo || `INV-${String(Date.now()).slice(-6)}`,
      branchId,
      customerName,
      customerPhone,
      items: cartItems.map(item => ({ ...item })),
      subtotal,
      productDiscount,
      additionalDiscount: additional,
      totalDiscount: productDiscount + additional,
      taxPercentage: effectiveTax,
      taxAmount,
      finalTotal,
      paymentMethod,
      createdAt: new Date().toISOString(),
      cashier: currentUser?.name || "Cashier",
    };

    // ✅ Save to demo_sales
    const sales = getData("demo_sales", []);
    sales.push(sale);
    saveData("demo_sales", sales);

    // ✅ Save sale logs
    const saleLogs = getData("demo_sale_logs", []);
    saleLogs.push({
      id: saleLogs.length ? Math.max(...saleLogs.map(l => l.id)) + 1 : 1,
      actionType: 'SALE',
      invoiceNo: sale.invoiceNo,
      createdByName: currentUser?.name || "Cashier",
      createdByRole: currentUser?.role || "N/A",
      createdAt: sale.createdAt,
      changes: [
        `ဘောင်ချာ: ${sale.invoiceNo}`,
        `စုစုပေါင်း: ${finalTotal.toLocaleString()} MMK`,
        `ငွေပေးချေမှု: ${paymentMethod}`,
      ],
    });
    saveData("demo_sale_logs", saleLogs);

    clearCart();
    return sale;
  };

  // ===== Branch helpers =====
  const selectBranch = useCallback((branch) => {
    setCurrentBranch(branch);
    setBranchId(branch?.id || null);
    if (branch?.allowedModules) {
      setBranchModules(branch.allowedModules);
      localStorage.setItem('branchModules', JSON.stringify(branch.allowedModules));
    }
    if (branch) localStorage.setItem('selectedBranch', JSON.stringify(branch));
  }, []);

  const value = {
    cartItems, addToCart, updateQuantity, removeFromCart, clearCart,
    taxPercentage, setTaxPercentage,
    customerName, setCustomerName,
    customerPhone, setCustomerPhone,
    heldCarts, holdCart, continueHeldCart, deleteHeldCart,
    fetchHeldCarts: () => {},
    checkout, calculateCartTotals,
    branchId, currentUser, isLoading,
    categories, fetchCategories,
    getNextInvoiceNumber,
    branchModules, setBranchModules,
    currentBranch, setCurrentBranch,
    selectBranch,
  };

  return <CartContent.Provider value={value}>{children}</CartContent.Provider>;
};

export default CartProvider;