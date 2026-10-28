import { useState, useEffect } from "react";
import "../../light-style/user-css/userMenubar.css"
import closeIcon from "../../assets/images/bayin.jpg";
import menuIcon from "../../assets/icons/menu-icon.png";
import barcode from "../../assets/icons/barcode.png";
import cart from "../../assets/icons/cart.png";
import wifi from "../../assets/icons/wifi.png";
import logo from "../../assets/icons/xamLogo.png"
import reload from"../../assets/icons/reload.png"
import user from"../../assets/icons/user.png"
import searchIcon from"../../assets/icons/light-search.png"
import noti from"../../assets/icons/notification.png"
import sunday from"../../assets/images/sunday.jpg"


// JSON Dat
const PRODUCT_DATA = {
  categories: [
    {
      id: 1,
      name: "ခေါက်ဆွဲခြောက်",
      itemCount: 125,
      image: "closeIcon",
      items: [
        {
          id: 101,
          name: "Ultra Spicy ခေါက်ဆွဲ",
          price: 2500,
          image: "closeIcon",
          stock: 25,
          sku: "NS001",
          barcode: "8901234567890",
          category: "ခေါက်ဆွဲခြောက်"
        },
        {
          id: 102,
          name: "စပိုင်စီအနက်ရောင်ထုပ်",
          price: 2000,
          image: "closeIcon",
          stock: 1225,
          sku: "NS002",
          barcode: "8901234567891",
          category: "ခေါက်ဆွဲခြောက်"
        },
        {
          id: 103,
          name: "Sunday ခေါက်ဆွဲ",
          price: 2000,
          image: "sunday",
          stock: 25,
          sku: "NS003",
          barcode: "8901234567892",
          category: "ခေါက်ဆွဲခြောက်"
        },
        {
          id: 104,
          name: "ခေါက်ဆွဲခြောက်",
          price: 2000,
          image: "closeIcon",
          stock: 25,
          sku: "NS004",
          barcode: "8901234567895",
          category: "ခေါက်ဆွဲခြောက်"
        }
      ]
    },
    {
      id: 2,
      name: "အချိုရည်များ",
      itemCount: 80,
      image: "closeIcon",
      items: [
        {
          id: 201,
          name: "Coca Cola 330ml",
          price: 1500,
          image: "closeIcon",
          stock: 50,
          sku: "DR001",
          barcode: "8901234567893",
          category: "အချိုရည်များ"
        },
        {
          id: 202,
          name: "Pepsi 330ml",
          price: 1400,
          image: "closeIcon",
          stock: 40,
          sku: "DR002",
          barcode: "8901234567894",
          category: "အချိုရည်များ"
        },
        {
          id: 203,
          name: "အချိုရည်များ",
          price: 2000,
          image: "closeIcon",
          stock: 80,
          sku: "DR003",
          barcode: "8901234567896",
          category: "အချိုရည်များ"
        }
      ]
    },
    {
      id: 3,
      name: "Coca Cola",
      itemCount: 125,
      image: "closeIcon",
      items: [
        {
          id: 301,
          name: "Coca Cola",
          price: 2000,
          image: "closeIcon",
          stock: 125,
          sku: "CC001",
          barcode: "8901234567897",
          category: "Coca Cola"
        }
      ]
    }
  ],
  paymentMethods: [
    { id: 1, name: "Cash" },
    { id: 2, name: "KPay" },
    { id: 3, name: "Wave" },
    { id: 4, name: "Credit" }
  ]
};

const UserNavSalePage = () => {
  const getInitials = (name) => {
    return name
      .replace(/\./g, "")
      .split(" ")
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .join("");
  };

  const MENUS = ["ProductList", "Sale", "Category", "Discount"];
  const LOGOUT = "Logout";

  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(localStorage.getItem("activeMenu") || "Sale");
  const [cartItems, setCartItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("Cash");
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [heldCarts, setHeldCarts] = useState([]);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [customerName, setCustomerName] = useState("ဧည့်သည်");
  const [customerPhone, setCustomerPhone] = useState("0978510555");
  const [showHeldCartsModal, setShowHeldCartsModal] = useState(false);
  const [barcodeActive, setBarcodeActive] = useState(false);

  // Load held carts from localStorage on component mount
  useEffect(() => {
    const savedCarts = localStorage.getItem("heldCarts");
    if (savedCarts) {
      setHeldCarts(JSON.parse(savedCarts));
    }
  }, []);

  // Save held carts to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("heldCarts", JSON.stringify(heldCarts));
  }, [heldCarts]);

  // Initialize all products
  useEffect(() => {
    const products = PRODUCT_DATA.categories.flatMap(category => 
      category.items.map(item => ({
        ...item,
        categoryId: category.id,
        categoryName: category.name
      }))
    );
    setAllProducts(products);
    setFilteredProducts(products);
  }, []);

  // Handle category click
  useEffect(() => {
    if (selectedCategory) {
      const category = PRODUCT_DATA.categories.find(cat => cat.id === selectedCategory);
      if (category) {
        setFilteredProducts(category.items.map(item => ({
          ...item,
          categoryId: category.id,
          categoryName: category.name
        })));
      }
    } else {
      setFilteredProducts(allProducts);
    }
  }, [selectedCategory, allProducts]);

  // Search functionality
  useEffect(() => {
    if (searchTerm.trim() === "") {
      if (selectedCategory) {
        const category = PRODUCT_DATA.categories.find(cat => cat.id === selectedCategory);
        setFilteredProducts(category.items.map(item => ({
          ...item,
          categoryId: category.id,
          categoryName: category.name
        })));
      } else {
        setFilteredProducts(allProducts);
      }
    } else {
      const filtered = allProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.includes(searchTerm)
      );
      setFilteredProducts(filtered);
    }
  }, [searchTerm, allProducts, selectedCategory]);

  // Add to cart function
  const addToCart = (product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === product.id);
      
      if (existingItem) {
        // Increase quantity if item already in cart
        return prevItems.map(item =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new item to cart
        return [
          ...prevItems,
          {
            ...product,
            quantity: 1,
            total: product.price
          }
        ];
      }
    });
  };

  // Update quantity in cart
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) {
      removeFromCart(id);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === id
          ? {
              ...item,
              quantity: newQuantity,
              total: newQuantity * item.price
            }
          : item
      )
    );
  };

  // Remove from cart
  const removeFromCart = (id) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  // Calculate cart totals
  const calculateTotals = () => {
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;
    const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return {
      subtotal,
      taxAmount,
      total,
      totalQuantity
    };
  };

  const { subtotal, taxAmount, total, totalQuantity } = calculateTotals();

  // Clear cart
  const clearCart = () => {
    setCartItems([]);
  };

  // Hold cart - save current cart with customer info
  const holdCart = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const newHeldCart = {
      id: Date.now(), // Unique ID
      customerName: customerName,
      customerPhone: customerPhone,
      items: [...cartItems],
      totals: calculateTotals(),
      taxPercentage: taxPercentage,
      timestamp: new Date().toISOString(),
      status: "held"
    };

    setHeldCarts(prev => [newHeldCart, ...prev]);
    
    // Clear current cart
    clearCart();
    
    alert(`Cart held successfully for ${customerName}!`);
  };

  // Continue with held cart
  const continueHeldCart = (heldCart) => {
    setCartItems(heldCart.items);
    setTaxPercentage(heldCart.taxPercentage);
    setCustomerName(heldCart.customerName);
    setCustomerPhone(heldCart.customerPhone);
    setShowHeldCartsModal(false);
    
    // Remove from held carts
    setHeldCarts(prev => prev.filter(cart => cart.id !== heldCart.id));
    
    alert(`Continuing with ${heldCart.customerName}'s cart`);
  };

  // Delete held cart
  const deleteHeldCart = (cartId) => {
    if (window.confirm("Are you sure you want to delete this held cart?")) {
      setHeldCarts(prev => prev.filter(cart => cart.id !== cartId));
    }
  };

  // Checkout function
  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Cart is empty!");
      return;
    }

    const saleData = {
      items: cartItems,
      totals: calculateTotals(),
      paymentMethod: selectedPayment,
      tax: taxPercentage,
      timestamp: new Date().toISOString(),
      customer: {
        name: customerName,
        phone: customerPhone
      }
    };

    alert(`Checkout successful! Total: ${total.toLocaleString()} Ks`);
    
    // Clear cart after checkout
    clearCart();
  };

  // Save customer info
  const saveCustomerInfo = () => {
    setShowCustomerModal(false);
    alert("Customer information saved!");
  };

  // Get image source
  const getImageSrc = (imageName) => {
    switch(imageName) {
      case "closeIcon": return closeIcon;
      case "sunday": return sunday;
      case "noti": return noti;
      default: return closeIcon;
    }
  };

  // Handle barcode button click - toggle active state
  const handleBarcodeClick = () => {
    setBarcodeActive(!barcodeActive);
  };

  // Handle menu selection
  useEffect(() => {
    localStorage.setItem("activeMenu", activeMenu);
  }, [activeMenu]);

  return (
    <div className="userMenuBar-main">
      {/* Top Navigation Bar */}
      <div className="user-share-container">
        <div className="menuBar-left">
          <button className="icon-btn" onClick={() => setOpen(true)}>
            <img src={menuIcon} alt="menu" />
          </button>
          <img src={logo} alt="logo" className="menu-logo" />
        </div>
        <div className="menuBar-right">
          <label className="time tooltip" htmlFor="" data-tooltip="12:00AM (Sat)">12:00AM</label>
          <button className="icon-btn wifi"><img src={wifi} alt="wifi" /></button>
          <button className="icon-btn"><img src={reload} alt="reload" /></button>
          <button 
            className={`icon-btn ${barcodeActive ? 'barcode-active' : ''}`} 
            onClick={handleBarcodeClick}
          >
            <img src={barcode} alt="barcode" />
          </button>
          <button 
            className="icon-btn" 
            onClick={() => setShowHeldCartsModal(true)}
            style={{ position: 'relative' }}
          >
            <img src={cart} alt="cart" />
            {heldCarts.length > 0 && (
              <span style={{
                position: 'absolute',
                top: '-5px',
                right: '-5px',
                backgroundColor: 'red',
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {heldCarts.length}
              </span>
            )}
          </button>
          <button className="icon-btn pf-btn tooltip" data-tooltip="Mr. San Win Aung">
            <img className="pf" src={user} alt="user" />
            <span className="name-full">San Win Aung</span>
            <span className="name-short">{getInitials("San Win Aung")}</span>
          </button>
        </div>
      </div>

      {/* Side Menu */}
      <div className={`side-menu ${open ? "open" : ""}`}>
        <div className="side-menu-header">
          <h3>Menu</h3>
          <span onClick={() => setOpen(false)}>✕</span>
        </div>

        {MENUS.map(item => (
          <div
            key={item}
            className={`side-menu-item ${activeMenu === item ? "active" : ""}`}
            onClick={() => {
              setActiveMenu(item);
              setOpen(false);
            }}
          >
            {item}
          </div>
        ))}

        <div
          className="side-menu-item logout"
          onClick={() => {
            localStorage.removeItem("activeMenu");
            console.log("logout");
          }}
        >
          Logout
        </div>
      </div>

      {/* Overlay */}
      {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}

      {/* Customer Modal */}
      {showCustomerModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Customer Information</h3>
              <span onClick={() => setShowCustomerModal(false)}>✕</span>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Customer Name</label>
                <input 
                  type="text" 
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Enter customer name"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowCustomerModal(false)}>
                Cancel
              </button>
              <button className="btn btn-primary" onClick={saveCustomerInfo}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Held Carts Modal */}
      {showHeldCartsModal && (
        <div className="modal-overlay">
          <div className="modal-content held-carts-modal">
            <div className="modal-header">
              <h3>Held Carts ({heldCarts.length})</h3>
              <span onClick={() => setShowHeldCartsModal(false)}>✕</span>
            </div>
            <div className="modal-body">
              {heldCarts.length === 0 ? (
                <p style={{ textAlign: 'center', padding: '20px' }}>
                  No held carts found
                </p>
              ) : (
                <div className="held-carts-list">
                  {heldCarts.map(cart => (
                    <div key={cart.id} className="held-cart-item">
                      <div className="held-cart-info">
                        <div className="held-cart-customer">
                          <strong>{cart.customerName}</strong>
                          <span>{cart.customerPhone}</span>
                        </div>
                        <div className="held-cart-details">
                          <span>{cart.items.length} items</span>
                          <span>Total: {cart.totals.total.toLocaleString()} Ks</span>
                          <span className="held-cart-time">
                            {new Date(cart.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                        </div>
                      </div>
                      <div className="held-cart-actions">
                        <button 
                          className="btn btn-continue"
                          onClick={() => continueHeldCart(cart)}
                        >
                          Continue
                        </button>
                        <button 
                          className="btn btn-delete"
                          onClick={() => deleteHeldCart(cart.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn" onClick={() => setShowHeldCartsModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="card-cart-container">
        {/* Left Side - Products */}
        <div className="card-container-show">
          {/* Category Filter */}
          <div className="user-filter-category">
            <div className="card-box">
              <div 
                className={`cate-card horizontal ${selectedCategory === null ? 'active-category' : ''}`}
                onClick={() => setSelectedCategory(null)}
              >
                <div className="cate-img">
                  <img src={closeIcon} alt="all" />
                </div>
                <div className="cate-text">
                  <span>အားလုံး</span>
                  <p>{allProducts.length} items</p>
                </div>
              </div>
              
              {PRODUCT_DATA.categories.map(category => (
                <div 
                  key={category.id}
                  className={`cate-card horizontal ${selectedCategory === category.id ? 'active-category' : ''}`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <div className="cate-img">
                    <img src={getImageSrc(category.image)} alt={category.name} />
                  </div>
                  <div className="cate-text">
                    <span>{category.name}</span>
                    <p>{category.itemCount} items</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="user-search-category">
            <div className="card-box">
              <button className="search-btn">
                <img className="search-btn-icon" src={searchIcon} alt="search" />
              </button>
              <input 
                className="searchbar" 
                type="text" 
                placeholder="ပစ္စည်းအမည်၊ ဘားကုဒ်၊ Sku နံပါတ် ဖြင့်ရှာရန်"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <select 
                value={selectedCategory || ""} 
                onChange={(e) => setSelectedCategory(e.target.value ? parseInt(e.target.value) : null)}
              >
                <option value="">ပစ္စည်းအားလုံး</option>
                {PRODUCT_DATA.categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <button className="icon-btn">
                <img className="noti-icon" src={noti} alt="notification" />
              </button>
              <label htmlFor="">
                <input type="checkbox" />
                အခြားဆိုင်သို့
              </label>
            </div>
          </div>

          {/* Product Grid */}
          <div className="user-category-card-show">
            <div className="category-card-box">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  className="category-card-list"
                  onClick={() => addToCart(product)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="category-image-container">
                    <img 
                      src={getImageSrc(product.image)} 
                      alt={product.name} 
                      className="category-image" 
                    />
                  </div>
                  <div className="cate-overlay">
                    <span className="item-name">{product.name}</span>
                    <p className="item-price">{product.price.toLocaleString()} Ks</p>
                  </div>
                  <div className="cate-overlay-qty">
                    <p className="item-qty tooltip" data-tooltip="လက်ကျန်">
                      {product.stock}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side - Cart */}
        <div className="card-cart-show">
          <div className="item-cart">
            {/* Customer Info */}
            <div className="cate-card horizontal">
              <div className="cate-main-frame">
                <div className="cate-cus-img">
                  <img src={user} alt="customer" />
                </div>
                <div className="cate-text1">
                  <span className="guest">{customerName}</span>
                  <span className="guest-phone">{customerPhone}</span>
                </div>
              </div>
              <button 
                className="close-guest" 
                onClick={() => setShowCustomerModal(true)}
              >
                အသေးစိပ်
              </button>
            </div>

            {/* Cart Items */}
            <div className="cart-items-card">
              <h2>ဈေးခြင်းထဲသို့ ({cartItems.length} items)</h2>
              <div className="sub-cart-items-card">
                {cartItems.map(item => (
                  <div key={item.id} className="cate-card2 horizontal">
                    <div className="cate-main-frame cart-item-box">
                      <div className="cate-img2">
                        <img src={getImageSrc(item.image)} alt={item.name} />
                      </div>
                      <div className="cate-text2">
                        <span className="cart-name">{item.name}</span>
                        <p className="cart-price">{item.price.toLocaleString()} Ks</p>
                      </div>
                    </div>
                    <div className="btn-collection">
                      <button 
                        className="close-guest first" 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, item.quantity - 1);
                        }}
                      >
                        -
                      </button>
                      <input 
                        className="middle" 
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                      />
                      <button 
                        className="close-guest third"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateQuantity(item.id, item.quantity + 1);
                        }}
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
                
                {cartItems.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                    Cart is empty. Click on products to add them.
                  </div>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="payment-voucher-card">
              <div className="payment-voucher-card-container">
                <div className="total-qty">
                  <span>အရေတွက်</span>
                  <span>{totalQuantity}</span>
                </div>
                
                <div className="subTotal">
                  <span>စုစုပေါင်း (အခွန်မပါ)</span>
                  <span>{subtotal.toLocaleString()} Ks</span>
                </div>
                
                <div className="tax-amount">
                  <span>အခွန်</span>
                  <div className="tax-input">
                    <input 
                      type="number" 
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="percent">%</span>
                  </div>
                </div>
                
                <div className="payment-box">
                  <span>ငွေပေးချေမှု</span>
                  <select 
                    value={selectedPayment} 
                    onChange={(e) => setSelectedPayment(e.target.value)}
                  >
                    {PRODUCT_DATA.paymentMethods.map(method => (
                      <option key={method.id} value={method.name}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="finalTotal">
                  <span>စုစုပေါင်း (အခွန်ပါပီး)</span>
                  <span>{total.toLocaleString()} Ks</span>
                </div>

                {/* Action Buttons */}
                <div className="button-collection">
                  <div className="button-type">
                    <button className="btn clear" onClick={clearCart}>
                      ဖျက်မည်
                    </button>
                    <button className="btn hold" onClick={holdCart}>
                      ခေတ္တထား
                    </button>
                  </div>
                  
                  <div className="checkOut">
                    <button className="btn checkout" onClick={handleCheckout}>
                      ငွေရင်းမည်
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Barcode Active State */
        .barcode-active {
          background: #9ccff9 !important;
          border-color: #b6deff !important;
        }

        .barcode-active img {
          filter: brightness(0) saturate(100%) invert(100%) !important;
          opacity: 1 !important;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 10000;
        }

        .modal-content {
          background: white;
          border-radius: 10px;
          width: 90%;
          max-width: 500px;
          max-height: 80vh;
          overflow: hidden;
        }

        .held-carts-modal {
          max-width: 600px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px;
          border-bottom: 1px solid #e5e5e5;
          background: #f8f9fa;
        }

        .modal-header h3 {
          margin: 0;
          font-size: 18px;
          color: #333;
        }

        .modal-header span {
          cursor: pointer;
          font-size: 20px;
          color: #666;
        }

        .modal-body {
          padding: 20px;
          max-height: 50vh;
          overflow-y: auto;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          padding: 16px;
          border-top: 1px solid #e5e5e5;
          background: #f8f9fa;
        }

        /* Form Styles */
        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          color: #333;
          font-weight: 500;
        }

        .form-group input {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 14px;
        }

        /* Held Carts List */
        .held-carts-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .held-cart-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          background: #f9f9f9;
        }

        .held-cart-info {
          flex: 1;
        }

        .held-cart-customer {
          margin-bottom: 5px;
        }

        .held-cart-customer strong {
          display: block;
          color: #333;
          margin-bottom: 2px;
        }

        .held-cart-customer span {
          color: #666;
          font-size: 12px;
        }

        .held-cart-details {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #666;
        }

        .held-cart-time {
          font-style: italic;
        }

        .held-cart-actions {
          display: flex;
          gap: 8px;
        }

        .btn-continue {
          background: #2196F3 !important;
          color: white !important;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-delete {
          background: #f44336 !important;
          color: white !important;
          border: none;
          padding: 5px 10px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-primary {
          background: #2196F3 !important;
          color: white !important;
          border: none;
        }

        .btn {
          padding: 8px 16px;
          border-radius: 5px;
          border: 1px solid #ddd;
          background: white;
          cursor: pointer;
          font-size: 14px;
        }

        .btn:hover {
          opacity: 0.9;
        }

        /* Active category style */
        .cate-card.horizontal.active-category {
          background: #e8f0ff;
          border-color: #3b82f6;
          border-left: 4px solid #3b82f6;
        }

        /* Cart item hover effects */

        /* Scrollbar styling for cart items */
        .sub-cart-items-card {
          max-height: 300px;
          overflow-y: auto;
        }

        /* Responsive improvements */
        @media (max-width: 768px) {
          .modal-content {
            width: 95%;
            max-height: 70vh;
          }
          
          .held-cart-item {
            flex-direction: column;
            align-items: flex-start;
          }
          
          .held-cart-actions {
            width: 100%;
            margin-top: 10px;
            justify-content: flex-end;
          }
        }
      `}</style>
    </div>
  );
};

export default UserNavSalePage;