import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../light-style/user-css/userCommonNavbar.css";
import menuIcon from "../../assets/icons/menu-icon.png";
import barcode from "../../assets/icons/barcode.png";
import cart from "../../assets/icons/cart.png";
import wifi from "../../assets/icons/wifi.png";
import logo from "../../assets/icons/EasyLogo.png";
import reload from "../../assets/icons/reload.png";
import user from "../../assets/icons/user.png";
import { useCart } from "./CartContent";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const UserCommonNavbarReadOnly = ({ onShowHeldCarts }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { heldCarts, branchId, currentUser } = useCart();
  
  const [open, setOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState(
    localStorage.getItem("activeMenu") || "Sale"
  );
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [language, setLanguage] = useState(
    localStorage.getItem("appLanguage") || "mm"
  );

  // Internet connection status
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

  // Update time
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Save active menu
  useEffect(() => {
    localStorage.setItem("activeMenu", activeMenu);
  }, [activeMenu]);

  // Update active menu when location changes
  useEffect(() => {
    const path = location.pathname;
    if (path.includes("/user/sale/page")) setActiveMenu("Sale");
    else if (path.includes("/user/category/ro/page")) setActiveMenu("Category");
    else if (path.includes("/user/inventory/page")) setActiveMenu("Inventory");
    else if (path.includes("/user/product/page")) setActiveMenu("Product");
    // else if (path.includes("/user/account/upe/page")) setActiveMenu("UserAccount");
    else if (path.includes("/branch/account/upe/page")) setActiveMenu("UserAccount");
    else if (path.includes("/branch/account/management/page")) setActiveMenu("BranchAccount");
    else if (path.includes("/branch/manager/account/management/page")) setActiveMenu("BranchAccount");
    else if (path.includes("/user/return/page")) setActiveMenu("Return");
    else if (path.includes("/user/credit-debit/page")) setActiveMenu("Credit");
    else if (path.includes("/user/setting/page")) setActiveMenu("Setting");
    else if (path.includes("/user/discount/page")) setActiveMenu("Discount");
    else if (path.includes("/user/damage/page")) setActiveMenu("Damage");
    // else if (path.includes("/userAdminDashboardCombine")) setActiveMenu("Dashboard");
  }, [location]);

  // Language change
  useEffect(() => {
    localStorage.setItem("appLanguage", language);
    window.dispatchEvent(new CustomEvent('appLanguageChanged', { 
      detail: { language: language } 
    }));
  }, [language]);

  // Prepare user display
  const displayName = currentUser?.name || currentUser?.username || "User";
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

  // Menu items
  const MENUS = [
    // { name: "Dashboard", path: "/userAdminDashboardCombine", icon: "fas fa-chart-pie" },
    { name: "Category", path: "/user/category/ro/page", icon: "fas fa-tags" },
    { name: "Inventory", path: "/user/inventory/page", icon: "fas fa-boxes" },
    { name: "Product", path: "/user/product/page", icon: "fas fa-cube" },
    { name: "Sale", path: "/user/sale/page", icon: "fas fa-shopping-cart" },
    // { name: "UserAccount", path: "/user/account/upe/page", icon: "fas fa-users" },
    { name: "UserAccount", path: "/branch/account/upe/page", icon: "fas fa-users" },
    { name: "BranchAccount", path: null, icon: "fas fa-shop" },
    { name: "Return", path: "/user/return/page", icon: "fas fa-undo-alt" },
    { name: "Credit", path: "/user/credit-debit/page", icon: "fas fa-credit-card" },
    { name: "Setting", path: "/user/setting/page", icon: "fas fa-cog" },
    { name: "Discount", path: "/user/discount/page", icon: "fas fa-percent" },
    { name: "Damage", path: "/user/damage/page", icon: "fas fa-exclamation-triangle" },
    { name: "Choose Language", path: null, icon: "fas fa-language" },
  ];

  const handleMenuClick = (menuName, path) => {
    if (menuName === "Choose Language") {
      const newLang = language === "mm" ? "en" : "mm";
      setLanguage(newLang);
      setOpen(false);
      return;
    }
    
    if (menuName === "BranchAccount") {
      if (!currentUser) {
        alert(language === 'mm' ? 'ကျေးဇူးပြု၍ အကောင့်ဝင်ပါ။' : 'Please log in.');
        setOpen(false);
        return;
      }

      const role = currentUser.role;
      if (role === 'MANAGER' || role === 'ADMIN') {
        navigate('/branch/manager/account/management/page');
      } else if (role === 'STAFF' || role === 'CASHIER') {
        navigate('/branch/account/management/page');
      } else {
        alert(language === 'mm' ? 'သင့်တွင် ဤစာမျက်နှာကို ကြည့်ရှုခွင့်မရှိပါ။' : 'You do not have permission to view this page.');
      }
      setOpen(false);
      return;
    }

    setActiveMenu(menuName);
    setOpen(false);
    if (path) navigate(path);
  };

  const handleReload = () => window.location.reload();

  // Format time
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

  // Translated menu names
  const getTranslatedMenuName = (menuName) => {
    if (language !== "mm") return menuName;
    
    const translations = {
      "Dashboard": "ဒက်ရှ်ဘုတ်",
      "Category": "အမျိုးအစား",
      "Inventory": "စတော့စာရင်း",
      "Product": "ကုန်ပစ္စည်း",
      "Sale": "ရောင်းချခြင်း",
      "UserAccount": "သုံးစွဲသူ အကောင့်စာရင်း",
      "BranchAccount": "ဆိုင်ခွဲသုံးစွဲသူ အကောင့်စာရင်း",
      "Return": "ပြန်လည်ပေးအပ်",
      "Credit": "အကြွေး",
      "Setting": "ဆက်တင်",
      "Discount": "လျှော့ဈေး",
      "Damage": "ပျက်စီးစာရင်း",
      "Choose Language": "ဘာသာစကားရွေးပါ"
    };
    
    return translations[menuName] || menuName;
  };

  // Check if current page is Sale page
  const isSalePage = location.pathname === "/user/sale/page";

  return (
    <div className="userCommonMenuBar-main">
      <div className="user-common-menubar-container">
        <div className="menuBar-left">
          <button className="icon-btn" onClick={() => setOpen(true)}>
            <img src={menuIcon} alt="menu" />
          </button>
          <img src={logo} alt="logo" className="menu-logo" />
        </div>
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
          <button className="icon-btn">
            <img src={barcode} alt="barcode" />
          </button>
          
          {/* Cart Icon - Only on Sale page */}
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
          
          {/* Profile Button */}
          <button className="icon-btn pf-btn tooltip" data-tooltip={tooltipText}>
            <img className="pf" src={user} alt="user" />
            <span className="name-full">{displayName}</span>
            <span className="name-short">{getInitials(displayName)}</span>
          </button>
        </div>
      </div>

      {/* Slide Menu */}
      <div className={`side-menu ${open ? "open" : ""}`}>
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
            {item.name === "Choose Language" && (
              <span style={{ marginLeft: "auto", fontSize: "12px", color: "#666" }}>
                {language === "mm" ? "မြန်မာ" : "English"}
              </span>
            )}
          </div>
        ))}
        <div
          className="side-menu-item logout"
          onClick={async () => {
            try {
              const url = `${API_BASE_URL}/api/v1/branch-accounts/logout`;
              await fetch(url, {
                method: "POST",
                credentials: "include",
              });
            } catch (err) {
              console.error("Logout error:", err);
            } finally {
              localStorage.removeItem("activeMenu");
              localStorage.removeItem("appLanguage");
              localStorage.removeItem("currentBranchUser");
              localStorage.removeItem("saleCart");
              localStorage.removeItem("saleCustomer");
              localStorage.removeItem("saleTax");
              localStorage.removeItem("heldCarts");
              navigate("/");
            }
          }}
        >
          <i className="fas fa-sign-out-alt menu-icon" style={{ marginRight: '12px', width: '20px', textAlign: 'center' }}></i>
          {language === "mm" ? "ထွက်မည်" : "Logout"}
        </div>
      </div>

      {/* Overlay */}
      {open && <div className="menu-overlay" onClick={() => setOpen(false)} />}
    </div>
  );
};

export default UserCommonNavbarReadOnly;