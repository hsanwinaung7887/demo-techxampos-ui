// src/components/office/OfficeDashboard.jsx
import "../../light-style/owner-css/ownerDashboard.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { officeLogout, getOfficeCurrentUser, clearOfficeAuth } from "../../redux/slices/officeAuthSlice";

const OfficeDashboard = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user, isAuthenticated, isLoading } = useSelector((state) => state.officeAuth);
    const hasCheckedAuth = useRef(false);
    const hasRedirected = useRef(false);
    
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('officeLanguage') || 'en';
    });

    // Check authentication on mount - only once
    useEffect(() => {
        if (hasCheckedAuth.current) return;
        if (!isAuthenticated && !isLoading) {
            hasCheckedAuth.current = true;
            dispatch(getOfficeCurrentUser());
        }
    }, [dispatch, isAuthenticated, isLoading]);

    // Redirect if not authenticated - only once
    useEffect(() => {
        if (hasRedirected.current) return;
        if (!isLoading && !isAuthenticated) {
            console.log("🚫 Not authenticated, redirecting to login");
            hasRedirected.current = true;
            navigate("/office/login", { replace: true });
        }
    }, [isAuthenticated, isLoading, navigate]);

    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('officeLanguage', lang);
        
        window.dispatchEvent(new CustomEvent('officeLanguageChange', { 
            detail: { language: lang } 
        }));
    };

    useEffect(() => {
        const savedLang = localStorage.getItem('officeLanguage') || 'en';
        setLanguage(savedLang);
    }, []);

    const handleLogout = async () => {
        try {
            await dispatch(officeLogout()).unwrap();
        } catch (error) {
            console.error("Logout error:", error);
        } finally {
            dispatch(clearOfficeAuth());
            localStorage.removeItem('persist:root');
            window.location.href = "/office/login";
        }
    };

    if (isLoading) {
        return (
            <div className="ownerDashboard-main">
                <div className="loading-state">
                    <i className="fas fa-spinner fa-spin"></i>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="ownerDashboard-main">
            <div className="dashboard-header">
                <h1>{language === 'mm' ? "ရုံးအသုံးပြုသူ ဒက်ရှ်ဘုတ်" : "OFFICE USER DASHBOARD"}</h1>
                <div className="header-subtitle">
                    {language === 'mm' ? "သင့်လုပ်ငန်းများကို စီမံခန့်ခွဲပါ" : "Manage your business operations"}
                    {user && <span className="welcome-name"> | Welcome, {user.fullName || user.username}</span>}
                </div>
                
                <div className="language-switcher">
                    <button
                        onClick={() => handleLanguageChange('mm')}
                        className={`lang-btn ${language === 'mm' ? 'active' : ''}`}
                    >
                        မြန်မာ
                    </button>
                    <button
                        onClick={() => handleLanguageChange('en')}
                        className={`lang-btn ${language === 'en' ? 'active' : ''}`}
                    >
                        English
                    </button>
                </div>
            </div>

            <div className="quick-stats"></div>
            
            <div className="portion-title">
                <h2>{language === 'mm' ? 'စီမံခန့်ခွဲမှု PANEL များ' : 'MANAGEMENT PANELS'}</h2>
            </div>
            
            <div className="dashboard-grid">
                <div className="grid-item">
                    <NavLink to="/office/plan/management/page" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="grid-icon">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <h3>{language === 'mm' ? 'အစီအစဉ် စီမံခန့်ခွဲမှု' : 'Plan Management'}</h3>
                        <p>{language === 'mm' ? 'အစီအစဉ်များ ကြည့်/ပြင်ရန်' : 'View/Edit Plans'}</p>
                    </NavLink>
                </div>
                <div className="grid-item">
                    <NavLink to="/office/shop/management/page" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="grid-icon">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <h3>{language === 'mm' ? 'ဆိုင် စီမံခန့်ခွဲမှု' : 'Shop Management'}</h3>
                        <p>{language === 'mm' ? 'ဆိုင်များ ကြည့်/ပြင်ရန်' : 'View/Edit Shop'}</p>
                    </NavLink>
                </div>
                <div className="grid-item">
                    <NavLink to="/office/shop/account/management/page" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="grid-icon">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <h3>{language === 'mm' ? 'ဆိုင်အသုံးပြုသူ စီမံခန့်ခွဲမှု' : 'Shop User Management'}</h3>
                        <p>{language === 'mm' ? 'ဆိုင်အသုံးပြုသူ အကောင့်များ ကြည့်/ပြင်ရန်' : 'View/Edit Shop-User Account'}</p>
                    </NavLink>
                </div>
                <div className="grid-item">
                    <NavLink to="/office/user/account/page" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="grid-icon">
                            <i className="fas fa-user-tie"></i>
                        </div>
                        <h3>{language === 'mm' ? 'ကိုယ်ရေး အကောင့်' : 'My Account'}</h3>
                        <p>{language === 'mm' ? 'ကိုယ်ရေးအချက်အလက် ကြည့်/ပြင်ရန်' : 'View/Edit Profile'}</p>
                    </NavLink>
                </div>
            </div>
            
            <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i> {language === 'mm' ? 'ထွက်ရန်' : 'Logout'}
            </button>
        </div>
    );
}

export default OfficeDashboard;