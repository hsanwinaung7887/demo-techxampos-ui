import "../../light-style/owner-css/ownerDashboard.css";
import { NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const OwnerDashboard = () => {
    const navigate = useNavigate();
    
    // Language State
    const [language, setLanguage] = useState(() => {
        return localStorage.getItem('dashboardLanguage') || 'en';
    });

    // Handle Language Change
    const handleLanguageChange = (lang) => {
        setLanguage(lang);
        localStorage.setItem('dashboardLanguage', lang);
    };

    const handleLogout = async () => {
    try {
        const res = await fetch(
        `${API_BASE_URL}/ss@01/super-admin/logout`,
        {
            method: "POST",
            credentials: "include", // Important for cookies
            headers: {
            "Content-Type": "application/json",
            },
            body: JSON.stringify({}) // Empty body if backend expects JSON
        }
        );

        const data = await res.json();

        if (data.success) {
        // Clear all local storage
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionData');
        // localStorage.clear(); // ဒါကိုပြင်ထားတယ်
        
        // Clear session storage
        sessionStorage.clear();
        
        // Clear any cookies by setting expired date
        document.cookie.split(";").forEach((c) => {
            document.cookie = c
            .replace(/^ +/, "")
            .replace(/=.*/, `=;expires=${new Date().toUTCString()};path=/`);
        });
        
        // Navigate to login
        navigate("/ownerLogin");
        
        // Force reload to clear React state
        setTimeout(() => {
            window.location.reload();
        }, 100);
        } else {
        console.error("Logout failed:", data.message);
        
        // Still clear local data even if API fails
        localStorage.clear();
        sessionStorage.clear();
        navigate("/ownerLogin");
        window.location.reload();
        }
    } catch (error) {
        console.error("Logout error:", error);
        
        // Clear everything on error too
        localStorage.clear();
        sessionStorage.clear();
        
        navigate("/ownerLogin");
        window.location.reload();
    }
    };

    return (
        <div className="ownerDashboard-main">
            {/* Dashboard Header */}
            <div className="dashboard-header">
                <h1>{language === 'mm' ? "စူပါ အက်ဒမင် ဒက်ရှ်ဘုတ်" : "SUPER ADMIN DASHBOARD"}</h1>
                <div className="header-subtitle">
                    {language === 'mm' ? "သင့်လုပ်ငန်းများကို စီမံခန့်ခွဲပါ" : "Manage your business operations"}
                </div>
                
                {/* Language Switcher - CSS နဲ့ခွဲထားတယ် */}
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
           <div className="portion-title">
                <h2>{language === 'mm' ? 'စီမံခန့်ခွဲမှု PANEL များ' : 'MANAGEMENT PANELS'}</h2>
           </div>
            
            {/* Dashboard Grid with Icons */}
            <div className="dashboard-grid">
                <div className="grid-item">
                    <NavLink to="/office/account/page" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="grid-icon">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <h3>{language === 'mm' ? 'ရုံးအကောင့် ထိန်းချုပ်မှု' : 'Office Account Control'}</h3>
                        <p>{language === 'mm' ? 'အကောင့် ကြည့်/ပြင်ရန်' : 'View/Edit Account'}</p>
                    </NavLink>
                </div>
                <div className="grid-item">
                    <NavLink to="/owner/account/page" style={{ textDecoration: 'none', color: 'inherit' }}>
                        <div className="grid-icon">
                            <i className="fas fa-chart-pie"></i>
                        </div>
                        <h3>{language === 'mm' ? 'စူပါအက်ဒမင် ထိန်းချုပ်မှု' : 'Super Admin Control'}</h3>
                        <p>{language === 'mm' ? 'အကောင့် ကြည့်/ပြင်ရန်' : 'View/Edit Account'}</p>
                    </NavLink>
                </div>
               
            </div>
            <button onClick={handleLogout} className="logout-btn">
                <i className="fas fa-sign-out-alt"></i> {language === 'mm' ? 'ထွက်ရန်' : 'Logout'}
            </button>
        </div>
    );
}

export default OwnerDashboard;