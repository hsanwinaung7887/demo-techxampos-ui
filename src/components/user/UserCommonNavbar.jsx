// src/components/user/UserCommonNavbar.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout as logoutAction } from "../../redux/slices/authSlice";
import "../../light-style/user-css/userCommonNavbar.css";
import menuIcon from "../../assets/icons/menu-icon.png";
import barcode from "../../assets/icons/barcode.png";
import cart from "../../assets/icons/cart.png";
import wifi from "../../assets/icons/wifi.png";
import logo from "../../assets/icons/easyLogo.png";
import reload from "../../assets/icons/reload.png";
import user from "../../assets/icons/user.png";
import { useCart } from "./CartContent";
import { getApiBaseUrl } from '../utils/defineConfig';

const API_BASE_URL = getApiBaseUrl();

// ============================================================
// ✅ DEMO USER FALLBACK
// ============================================================
const DEMO_USER = {
  id: 1,
  username: 'demo_owner',
  fullName: 'Demo Owner',
  name: 'Demo Owner',
  email: 'demo@example.com',
  phone: '09-123456789',
  role: 'MANAGER',
  userType: 'shop',
  status: 'Active',
  branchId: 1,
  shopId: 1,
  branchCode: 'branch',
};

const UserCommonNavbar = ({ onShowHeldCarts }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  // ===== Cart Context =====
  const { heldCarts, branchId, currentUser: cartUser, branchModules } = useCart();

  // ===== Redux Auth =====
  const { user: reduxUser } = useSelector((state) => state.auth);

  // ✅ Fallback chain: reduxUser → cartUser → DEMO_USER
  const currentUser = reduxUser || cartUser || DEMO_USER;

  const [isCashier, setIsCashier] = useState(false);

  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(
    localStorage.getItem("activeMenu") || "Sale"
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [language, setLanguage] = useState(
    localStorage.getItem("appLanguage") || "mm"
  );

  const [showBarcodeInput, setShowBarcodeInput] = useState(() => {
    const saved = localStorage.getItem('barcodeInputVisible');
    return saved === 'true';
  });

  const [showMobileBarcodeModal, setShowMobileBarcodeModal] = useState(() => {
    const saved = localStorage.getItem('mobileBarcodeModalVisible');
    return saved === 'true';
  });

  const [barcodeValue, setBarcodeValue] = useState("");
  const barcodeInputRef = useRef(null);
  const mobileBarcodeInputRef = useRef(null);
  const scanTimeoutRef = useRef(null);

  const isSalePage = location.pathname === "/user/sale/page";

  // ===== ALL MODULES DEFINITION =====
  const ALL_MODULES = [
    { name: "Category", path: "/user/category/page", icon: "fas fa-tags" },
    { name: "Inventory", path: "/user/inventory/page", icon: "fas fa-boxes" },
    { name: "Product", path: "/user/product/page", icon: "fas fa-cube" },
    { name: "Sale", path: "/user/sale/page", icon: "fas fa-shopping-cart" },
    { name: "Return", path: "/user/return/page", icon: "fas fa-undo-alt" },
    { name: "Credit", path: "/user/credit-debit/page", icon: "fas fa-credit-card" },
    { name: "Discount", path: "/user/discount/page", icon: "fas fa-percent" },
    { name: "Damage", path: "/user/damage/page", icon: "fas fa-exclamation-triangle" },
    { name: "Expense", path: "/user/expense/page", icon: "fas fa-coins" },
    { name: "Capital", path: "/user/capital/page", icon: "fas fa-building-columns" },
    { name: "BranchAccount", path: "/branch/manager/account/management/page", icon: "fas fa-shop" },
    { name: "MyAccount", path: "/branch/account/upe/page", icon: "fas fa-users" },
    { name: "AboutInfo", path: "/user/setting/page", icon: "fas fa-cog" },
    { name: "ChooseLanguage", path: null, icon: "fas fa-language" },
  ];

  // ===== DEFAULT MODULES =====
  const DEFAULT_MODULES = {
    Category: true,
    Inventory: true,
    Product: true,
    Sale: true,
    Return: true,
    Credit: true,
    Discount: true,
    Damage: true,
    Expense: true,
    Capital: true,
    BranchAccount: true,
    MyAccount: true,
    AboutInfo: true
  };

  // ===== GET FILTERED MENUS WITH useMemo =====
  const MENUS = useMemo(() => {
    const role = currentUser?.role;

    // 1. Role-based filtering
    let roleMenus = ALL_MODULES;
    if (role === "CASHIER") {
      const allowedNames = ["Sale", "Return", "Credit", "AboutInfo", "Discount", "Damage", "MyAccount", "ChooseLanguage", "Capital"];
      roleMenus = ALL_MODULES.filter(menu => allowedNames.includes(menu.name));
    }

    // 2. Branch-based filtering (branchModules)
    const modules = branchModules || DEFAULT_MODULES;

    const filtered = roleMenus.filter(menu => {
      if (menu.name === "ChooseLanguage") return true;
      const isAllowed = modules[menu.name] !== false;
      return isAllowed;
    });

    return filtered;
  }, [currentUser?.role, branchModules]);

  // ===== useEffects =====
  useEffect(() => {
    if (isSalePage) {
      localStorage.setItem('barcodeInputVisible', showBarcodeInput);
    }
  }, [showBarcodeInput, isSalePage]);

  useEffect(() => {
    if (isSalePage) {
      localStorage.setItem('mobileBarcodeModalVisible', showMobileBarcodeModal);
    }
  }, [showMobileBarcodeModal, isSalePage]);

  useEffect(() => {
    if (!isSalePage) {
      setShowBarcodeInput(false);
      setShowMobileBarcodeModal(false);
      setBarcodeValue("");
    }
  }, [isSalePage]);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem("activeMenu", activeMenu);
  }, [activeMenu]);

  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/user/sale/page")) setActiveMenu("Sale");
    else if (path.includes("/user/category/page")) setActiveMenu("Category");
    else if (path.includes("/user/inventory/page")) setActiveMenu("Inventory");
    else if (path.includes("/user/product/page")) setActiveMenu("Product");
    else if (path.includes("/branch/account/upe/page")) setActiveMenu("MyAccount");
    else if (path.includes("/user/capital/page")) setActiveMenu("Capital");
    else if (path.includes("/branch/manager/account/management/page")) setActiveMenu("BranchAccount");
    else if (path.includes("/branch/account/management/page")) setActiveMenu("BranchAccount");
    else if (path.includes("/user/return/page")) setActiveMenu("Return");
    else if (path.includes("/user/credit-debit/page")) setActiveMenu("Credit");
    else if (path.includes("/user/setting/page")) setActiveMenu("AboutInfo");
    else if (path.includes("/user/discount/page")) setActiveMenu("Discount");
    else if (path.includes("/user/damage/page")) setActiveMenu("Damage");
  }, [location]);

  useEffect(() => {
    if (isSalePage && showBarcodeInput && barcodeInputRef.current) {
      setTimeout(() => {
        barcodeInputRef.current.focus();
        barcodeInputRef.current.select();
      }, 100);
    }
    if (isSalePage && showMobileBarcodeModal && mobileBarcodeInputRef.current) {
      setTimeout(() => {
        mobileBarcodeInputRef.current.focus();
        mobileBarcodeInputRef.current.select();
      }, 100);
    }
  }, [showBarcodeInput, showMobileBarcodeModal, isSalePage]);

  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    window.dispatchEvent(new CustomEvent('appLanguageChanged', {
      detail: { language: language }
    }));
  }, [language]);

  useEffect(() => {
    const role = currentUser?.role;
    setIsCashier(role === "CASHIER");
  }, [currentUser]);

  // ===== Barcode Handlers =====
  const handleBarcodeSubmit = (value) => {
    if (value && value.trim()) {
      window.dispatchEvent(new CustomEvent('barcodeScanned', {
        detail: { barcode: value.trim() }
      }));
      setBarcodeValue("");
      setTimeout(() => {
        if (isSalePage && showBarcodeInput && barcodeInputRef.current) {
          barcodeInputRef.current.value = "";
          barcodeInputRef.current.focus();
          barcodeInputRef.current.select();
        }
        if (isSalePage && showMobileBarcodeModal && mobileBarcodeInputRef.current) {
          mobileBarcodeInputRef.current.value = "";
          mobileBarcodeInputRef.current.focus();
          mobileBarcodeInputRef.current.select();
        }
      }, 50);
    }
  };

  const handleBarcodeChange = (e) => {
    const value = e.target.value;
    setBarcodeValue(value);
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }
    if (value && value.trim()) {
      scanTimeoutRef.current = setTimeout(() => {
        handleBarcodeSubmit(value);
      }, 100);
    }
  };

  const handleBarcodeKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      handleBarcodeSubmit(e.target.value);
    }
  };

  const handleBarcodeClick = () => {
    if (!isSalePage) return;
    if (window.innerWidth <= 768) {
      setShowMobileBarcodeModal(!showMobileBarcodeModal);
    } else {
      setShowBarcodeInput(!showBarcodeInput);
    }
    setBarcodeValue("");
  };

  // ===== User Display =====
  const displayName = currentUser?.name || currentUser?.fullName || currentUser?.username || "Demo User";
  const displayRole = currentUser?.role || "";
  const tooltipText = displayRole ? `${displayName} (${displayRole})` : displayName;

  const getInitials = (name) => {
    return name
      .replace(/\./g, "")
      .split(" ")
      .filter(word => word.length > 0)
      .map(word => word[0].toUpperCase())
      .join("");
  };

  // ===== LOGOUT HANDLER =====
  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include"
      });
    } catch (e) { console.log("Logout error:", e); }

    dispatch(logoutAction());

    const deviceFingerprint = localStorage.getItem("device_fingerprint");
    const appLanguage = localStorage.getItem("appLanguage");

    localStorage.clear();

    if (deviceFingerprint) {
      localStorage.setItem("device_fingerprint", deviceFingerprint);
    }
    if (appLanguage) {
      localStorage.setItem("appLanguage", appLanguage);
    }

    window.location.href = "/";
  };

  // ============================================================
  // ✅ MENU CLICK HANDLER - FIXED (alert မပေါ်တော့ဘူး)
  // ============================================================
  const handleMenuClick = (menuName, path) => {
    // ===== Language Toggle =====
    if (menuName === "ChooseLanguage") {
      const newLang = language === "mm" ? "en" : "mm";
      setLanguage(newLang);
      setOpen(false);
      return;
    }

    // ===== Branch Account - Role အလိုက် route =====
    if (menuName === "BranchAccount") {
      // ✅ currentUser က fallback ရှိပြီးသား (DEMO_USER) မို့ null မဖြစ်တော့ဘူး
      const role = currentUser?.role || 'MANAGER';

      if (role === 'MANAGER' || role === 'ADMIN' || role === 'SHOP_OWNER' || role === 'OWNER' || role === 'SUPER_ADMIN') {
        navigate('/branch/manager/account/management/page');
      } else if (role === 'STAFF' || role === 'CASHIER') {
        navigate('/branch/account/management/page');
      } else {
        // ✅ ကျန်တဲ့ role တွေအတွက်လည်း manager page ကို ပို့
        navigate('/branch/manager/account/management/page');
      }
      setOpen(false);
      return;
    }

    // ===== Default =====
    setActiveMenu(menuName);
    setOpen(false);
    if (path) navigate(path);
  };

  const handleReload = () => window.location.reload();

  // ===== Time Formatting =====
  const formatTime = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12;
    return `${formattedHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} ${ampm}`;
  };

  const getDayAndDate = (date) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[date.getDay()]} ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
  };

  const getTranslatedMenuName = (menuName) => {
    if (language !== "mm") return menuName;

    const translations = {
      "Category": "အမျိုးအစား",
      "Inventory": "စတော့စာရင်း",
      "Product": "ကုန်ပစ္စည်း",
      "Sale": "ရောင်းချခြင်း",
      "MyAccount": "မိမိ အကောင့်စီမံရန်",
      "BranchAccount": "ဆိုင်ခွဲသုံးစွဲသူ အကောင့်စာရင်း",
      "Return": "ပြန်လည်ပေးအပ်",
      "Credit": "အကြွေး",
      "AboutInfo": "ဆော့ဝဲလ် အချက်အလက်",
      "Discount": "လျှော့ဈေး",
      "Damage": "ပျက်စီးစာရင်း",
      "Expense": "ကုန်ကျစရိတ်",
      "ChooseLanguage": "ဘာသာစကားရွေးပါ",
      "Capital": "မတည်ငွေ",
    };

    return translations[menuName] || menuName;
  };

  return (
    <div className="userCommonMenuBar-main">
      <div className="user-common-menubar-container">
        <div className="menuBar-left">
          <button className="icon-btn" onClick={() => setOpen(true)}>
            <img src={menuIcon} alt="menu" />
          </button>
          <img src={logo} alt="logo" className="menu-logo" />
        </div>

        {isSalePage && showBarcodeInput && (
          <div className="auto-barcode">
            <div className="barcode-desktop-wrapper show">
              <input
                ref={barcodeInputRef}
                type="text"
                className="barcode-input-field"
                placeholder={language === "mm" ? "...ဘားကုဒ်ထည့်ပါ..." : "Enter barcode..."}
                value={barcodeValue}
                onChange={handleBarcodeChange}
                onKeyPress={handleBarcodeKeyPress}
              />
            </div>
          </div>
        )}

        <div className="menuBar-right">
          <label
            className="time tooltip"
            data-tooltip={`${formatTime(currentTime)} - ${getDayAndDate(currentTime)}`}
          >
            {formatTime(currentTime)}
          </label>

          <button
            className={`icon-btn wifi tooltip ${isOnline ? 'online' : 'offline'}`}
            data-tooltip={language === "mm"
              ? (isOnline ? "အင်တာနက်ချိတ်ဆက်ထား ✓" : "အင်တာနက်မရှိပါ ✗")
              : (isOnline ? "Internet Connected ✓" : "No Internet Connection ✗")
            }
          >
            <img src={wifi} alt="wifi" />
          </button>

          <button className="icon-btn" onClick={handleReload}>
            <img src={reload} alt="reload" />
          </button>

          {isSalePage && (
            <button
              className={`icon-btn barcode-btn tooltip ${(showBarcodeInput || showMobileBarcodeModal) ? 'active' : ''}`}
              data-tooltip={language === "mm"
                ? ((showBarcodeInput || showMobileBarcodeModal) ? "ဘားကုဒ်စနစ်ဖွင့်ထားသည် ✓" : "ဘားကုဒ်စနစ်ပိတ်ထားသည်")
                : ((showBarcodeInput || showMobileBarcodeModal) ? "Barcode system is on ✓" : "Barcode system is off")
              }
              onClick={handleBarcodeClick}
            >
              <img src={barcode} alt="barcode" />
            </button>
          )}

          {isSalePage && (
            <button
              className="icon-btn"
              onClick={onShowHeldCarts}
              style={{ position: "relative" }}
            >
              <img src={cart} alt="cart" />
              {heldCarts.length > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "-5px",
                    right: "-5px",
                    backgroundColor: "red",
                    color: "white",
                    borderRadius: "50%",
                    width: "18px",
                    height: "18px",
                    fontSize: "10px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {heldCarts.length}
                </span>
              )}
            </button>
          )}

          <button className="icon-btn pf-btn tooltip" data-tooltip={tooltipText}>
            <img className="pf" src={user} alt="user" />
            <span className="name-full">{displayName}</span>
            <span className="name-short">{getInitials(displayName)}</span>
          </button>
        </div>
      </div>

      {isSalePage && showMobileBarcodeModal && (
        <div className="mobile-barcode-modal" onClick={() => setShowMobileBarcodeModal(false)}>
          <div className="mobile-barcode-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="mobile-barcode-header">
              <h3>{language === "mm" ? "ဘားကုဒ်ရှာဖွေရန်" : "Scan Barcode"}</h3>
              <button className="mobile-barcode-close" onClick={() => setShowMobileBarcodeModal(false)}>✕</button>
            </div>
            <input
              ref={mobileBarcodeInputRef}
              type="text"
              className="mobile-barcode-input"
              placeholder={language === "mm" ? "ဘားကုဒ်ထည့်ပါ..." : "Enter barcode..."}
              value={barcodeValue}
              onChange={handleBarcodeChange}
              onKeyPress={handleBarcodeKeyPress}
              autoFocus
            />
          </div>
        </div>
      )}

      <div className={`side-menu ${open ? "open" : ""} ${isCashier ? "cashier-mode" : ""}`}>
        <div className="side-menu-header">
          <h3>{language === "mm" ? "မီနူး" : "Menu"}</h3>
          <span onClick={() => setOpen(false)}>✕</span>
        </div>

        {MENUS.map((item) => (
          <div
            key={item.name}
            className={`side-menu-item ${activeMenu === item.name ? "active" : ""}`}
            onClick={() => handleMenuClick(item.name, item.path)}
          >
            <i className={`${item.icon} menu-icon`} style={{ marginRight: '12px', width: '20px', textAlign: 'center' }}></i>
            {getTranslatedMenuName(item.name)}
            {item.name === "ChooseLanguage" && (
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#666" }}>
                {language === "mm" ? "English" : "မြန်မာ"}
              </span>
            )}
          </div>
        ))}

        <div
          className="side-menu-item logout"
          onClick={handleLogout}
        >
          <i className="fas fa-sign-out-alt menu-icon" style={{ marginRight: '12px', width: '20px', textAlign: 'center' }}></i>
          {language === "mm" ? "ထွက်မည်" : "Logout"}
        </div>
      </div>

      {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}
    </div>
  );
};

export default UserCommonNavbar;