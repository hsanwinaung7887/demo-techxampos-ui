import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";   // ✅ ADD
import logo from "../../assets/icons/easyLogo.png";
import closeIcon from "../../assets/icons/close-icon.png";
import menuIcon from "../../assets/icons/menu-icon.png";
import "../../shared-style/user-css/sharedNavbar.css";
import { Translations } from "./Translations";

const SharedNavbar = ({ language, setLanguage }) => {
  const navigate = useNavigate();        // ✅ ADD
  const location = useLocation();        // ✅ ADD
  const [menuOpen, setMenuOpen] = useState(false);
  
  const [selected, setSelected] = useState(() => {
    return localStorage.getItem("selectedMenu") || "home";
  });

  useEffect(() => {
    localStorage.setItem("selectedMenu", selected);
  }, [selected]);

  // ✅ URL ကနေ active tab ကို auto-detect
  useEffect(() => {
    const path = location.pathname;
    if (path === "/" || path === "/home") setSelected("home");
    else if (path === "/services") setSelected("services");
    else if (path === "/contact") setSelected("contact");
  }, [location]);

  const handleSelect = (item) => {
    setSelected(item);
    setMenuOpen(false);   // ✅ Mobile မှာ menu ပိတ်
    
    // ✅ Navigate
    if (item === "home") navigate("/");
    else if (item === "services") navigate("/services");
    else if (item === "contact") navigate("/contact");
  };

  const languageOptions = [
    { code: "en", flag: "🇺🇸 English" },
    { code: "my", flag: "🇲🇲 Burmese" },
  ];

  const t = Translations[language] || Translations.en;
  const menuItems = ["home", "services", "contact"];

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    localStorage.setItem("appLanguage", newLang);
    localStorage.setItem("pos-language", newLang);
    window.dispatchEvent(new CustomEvent('appLanguageChanged', { 
      detail: { language: newLang } 
    }));
  };

  return (
    <div className="main">
      <div className="container">
        <div className="left">
          <img src={logo} alt="logo" />
        </div>
        <div className={`right ${menuOpen ? "open" : ""}`}>
          <ul>
            {menuItems.map((item) => (
              <li
                key={item}
                onClick={() => handleSelect(item)}
                className={selected === item ? "active" : ""}
              >
                {t[item]}
              </li>
            ))}
            <li>
              <select 
                value={language} 
                onChange={handleLanguageChange} 
                className="language-select"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.flag}
                  </option>
                ))}
              </select>
            </li>
          </ul>
        </div>

        <div className="shared-menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          <img src={menuOpen ? closeIcon : menuIcon} alt="menu" />
        </div>
      </div>
    </div>
  );
};

export default SharedNavbar;