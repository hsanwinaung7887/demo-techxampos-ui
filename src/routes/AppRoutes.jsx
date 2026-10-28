import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import { useEffect, useState } from "react";

// ================== User pages ==================
import UserAdminDashboardCombine from "../components/user-combine/UserAdminDashboardCombine";
import UserPageCombine from "../components/user-combine/UserPageCombine";
import UserCategoryPage from "../components/user/UserCategoryPage";
import UserProductPage from "../components/user/UserProductPage";
import UserInventoryPage from "../components/user/UserInventoryPage";
import UserSalePage from "../components/user/UserSalePage";
import UserAccountManagementPage from "../components/user/BranchAccountManagementPage";
import UserAccountUPEPage from "../components/user/UserAccountUPEPage";
import UserReturnPage from "../components/user/UserReturnPage";
import UserCreditPage from "../components/user/UserCreditPage";
import UserSettingPage from "../components/user/UserSettingPage";
import UserDiscountPage from "../components/user/UserDiscountPage";
import UserDamagePage from "../components/user/UserDamagePage";
import { CartProvider } from "../components/user/CartContent";
import Capital from "../components/user/CapitalPage";

// ================== Shared pages ================
import SharedCoverPageCombine from "../components/shared/SharedCoverPageCombine";
import ShopUserLoginPage from "../components/shared/ShopUserLoginPage";
import ShopUserOtpPage from "../components/shared/ShopUserOtpPage";

// ================== Owner pages =================
import OwnerLogin from "../components/owner/OwnerLogin";
import OwnerOtpLogin from "../components/owner/OwnerOtpLogin";
import OwnerDashboard from "../components/owner/OwnerDashboard";
import FinancialAnalyticsPage from "../components/owner/FinancialAnalyticsPage";
import AuditLogsPage from "../components/owner/AuditLogsPage";
import SystemHealthPage from "../components/owner/SystemHealthPage";
import ShopManagementPage from "../components/owner/ShopManagementPage";
import RegisterManagementPage from "../components/owner/RegisterManagementPage";
import PlanManagementPage from "../components/owner/PlanManagementPage";
import TenantManagementPage from "../components/owner/TenantManagementPage";
import ShopAccountManagementPage from "../components/owner/ShopAccountManagementPage";
import UserManagementPage from "../components/owner/UserManagementPage";
import OwnerAccountPage from "../components/owner/OwnerAccountPage";
import OfficeAccountPage from "../components/office/OfficeAccountPage";
import ResetPassword from "../components/owner/ResetPassword";
import ShopOwnerPage from "../components/user/ShopOwnerPage";
import ShopUserResetPassword from "../components/owner/ShopUserResetPassword";
import BranchUserResetPassword from "../components/user/BranchUserResetPassword";
import BranchAccountUPEPage from "../components/user/BranchAccountUPEPage";
import SystemBackupRestorePage from "../components/owner/SystemBackupRestorePage";
import UserExpensePage from "../components/user/UserExpensePage";

// ================== Office pages =================
import OfficeDashboard from "../components/office/OfficeDashboard";
import OfficeLogin from "../components/office/OfficeLogin";
import OfficeOtpLogin from "../components/office/OfficeOtpLogin";
import OfficeUserAccountPage from "../components/office/OfficeUserAccountPage";
import OfficeUserResetPassword from "../components/office/OfficeUserResetPassword";
import BranchManagementPage from "../components/owner/BranchManagementPage";
import BranchAccountManagementPage from "../components/user/BranchAccountManagementPage";
import BranchManagerAccountManagementPage from "../components/user/BranchManagerAccountManagementPage";

import { useSelector } from "react-redux";
import ProtectedRoute from "../components/ProtectedRoute";
import OfficeProtectedRoute from "../components/OfficeProtectedRoute";
import OwnerProtectedRoute from "../components/OwnerProtectedRoute";
import OfficeConfirmLoginPage from "../components/shared/OfficeConfirmLoginPage";
import OwnerConfirmLoginPage from "../components/shared/OwnerConfirmLoginPage";
import OfficeAuditLogsPage from "../components/owner/OfficeAuditLogsPage";
import ServicePage from "../components/user/ServicePage";
import ContactPage from "../components/user/ContactPage";

// ============================================================
// ✅ BLOCKED PAGE COMPONENT
// ============================================================
const BlockedPage = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '24px'
    }}>
      <div style={{
        maxWidth: '600px',
        width: '100%',
        textAlign: 'center'
      }}>
        <div style={{
          marginBottom: '32px',
          position: 'relative'
        }}>
          <svg
            width="120"
            height="120"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ display: 'block', margin: '0 auto' }}
          >
            <circle cx="100" cy="100" r="85" fill="#f0f4ff" />
            <circle cx="100" cy="100" r="85" stroke="#e0e7ff" strokeWidth="1.5" />
            <rect x="50" y="80" width="100" height="75" rx="16" fill="#4f46e5" />
            <rect x="50" y="80" width="100" height="75" rx="16" fill="url(#lockShine)" opacity="0.3" />
            <path 
              d="M70 80 L70 60 C70 40 85 30 100 30 C115 30 130 40 130 60 L130 80" 
              stroke="#4f46e5" 
              strokeWidth="12" 
              strokeLinecap="round" 
              fill="none" 
            />
            <path 
              d="M70 80 L70 60 C70 40 85 30 100 30 C115 30 130 40 130 60 L130 80" 
              stroke="#818cf8" 
              strokeWidth="6" 
              strokeLinecap="round" 
              fill="none" 
              opacity="0.4"
            />
            <circle cx="100" cy="115" r="10" fill="#ffffff" />
            <rect x="96" y="115" width="8" height="16" rx="4" fill="#ffffff" />
            <circle cx="100" cy="62" r="4" fill="#c7d2fe" opacity="0.6" />
            <circle cx="70" cy="170" r="4" fill="#c7d2fe" opacity="0.4" />
            <circle cx="130" cy="170" r="4" fill="#c7d2fe" opacity="0.4" />
            <defs>
              <linearGradient id="lockShine" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.4" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div style={{
          display: 'inline-block',
          padding: '4px 16px',
          backgroundColor: '#fef3f2',
          borderRadius: '20px',
          marginBottom: '20px',
          border: '1px solid #fecaca'
        }}>
          <span style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#dc2626',
            letterSpacing: '0.5px',
            fontFamily: 'monospace'
          }}>
            ACCESS DENIED
          </span>
        </div>

        <h1 style={{
          fontSize: '32px',
          fontWeight: '700',
          color: '#111827',
          margin: '0 0 12px 0',
          letterSpacing: '-0.02em'
        }}>
          You're not authorized
        </h1>

        <p style={{
          fontSize: '17px',
          color: '#6b7280',
          margin: '0 0 32px 0',
          lineHeight: '1.7',
          maxWidth: '480px',
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          It looks like you don't have permission to access this page.
          If you think this is a mistake, please contact your administrator.
        </p>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap'
        }}>
          <a
            href="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 32px',
              backgroundColor: '#4f46e5',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '500',
              textDecoration: 'none',
              borderRadius: '10px',
              border: 'none',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#4338ca';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(79, 70, 229, 0.25)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#4f46e5';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12L12 3L21 12" />
              <path d="M12 3V21" />
            </svg>
            Back to Home
          </a>

          <a
            href="/contact"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 32px',
              backgroundColor: 'transparent',
              color: '#4f46e5',
              fontSize: '15px',
              fontWeight: '500',
              textDecoration: 'none',
              borderRadius: '10px',
              border: '1px solid #e5e7eb',
              transition: 'all 0.2s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#f8fafc';
              e.target.style.borderColor = '#4f46e5';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = '#e5e7eb';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" />
            </svg>
            Need Help?
          </a>
        </div>

        <div style={{
          marginTop: '48px',
          paddingTop: '24px',
          borderTop: '1px solid #f3f4f6'
        }}>
          <p style={{
            fontSize: '13px',
            color: '#9ca3af',
            margin: 0
          }}>
            © {new Date().getFullYear()} TechXam. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// ✅ LOADING SPINNER COMPONENT
// ============================================================
const LoadingSpinner = () => {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#ffffff'
    }}>
      <div style={{
        width: '48px',
        height: '48px',
        border: '3px solid #f3f4f6',
        borderTop: '3px solid #4f46e5',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite'
      }} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// ============================================================
// ✅ SECRET KEY GUARD - Owner/Office အတွက်ပဲ စစ်မယ်
// ============================================================
const SecretKeyGuard = () => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const secretKey = urlParams.get('secret_key');
      
      const storedKey = localStorage.getItem('app_secret_key');
      const sessionKey = sessionStorage.getItem('app_secret_key');
      const cookieKey = document.cookie.split('; ')
        .find(row => row.startsWith('app_secret_key='))
        ?.split('=')[1];

      const VALID_KEY = import.meta.env.VITE_APP_SECRET_KEY || 'my-secret-key-2024';
      
      const isValidKey = secretKey === VALID_KEY || 
                         storedKey === VALID_KEY || 
                         sessionKey === VALID_KEY || 
                         cookieKey === VALID_KEY;

      if (isValidKey) {
        localStorage.setItem('app_secret_key', VALID_KEY);
        sessionStorage.setItem('app_secret_key', VALID_KEY);
        document.cookie = `app_secret_key=${VALID_KEY}; path=/; max-age=86400; SameSite=Strict; Secure`;
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return <BlockedPage />;
  }

  return <Outlet />;
};

// ============================================================
// ✅ LOGIN GUARD - Login Page တွေအတွက် (Owner/Office Login)
// ============================================================
const LoginGuard = ({ children }) => {
  const [hasAccess, setHasAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAccess = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const secretKey = urlParams.get('secret_key');
      
      const storedKey = localStorage.getItem('app_secret_key');
      const sessionKey = sessionStorage.getItem('app_secret_key');
      const cookieKey = document.cookie.split('; ')
        .find(row => row.startsWith('app_secret_key='))
        ?.split('=')[1];

      const VALID_KEY = import.meta.env.VITE_APP_SECRET_KEY || 'my-secret-key-2024';
      
      const isValidKey = secretKey === VALID_KEY || 
                         storedKey === VALID_KEY || 
                         sessionKey === VALID_KEY || 
                         cookieKey === VALID_KEY;

      if (isValidKey) {
        localStorage.setItem('app_secret_key', VALID_KEY);
        sessionStorage.setItem('app_secret_key', VALID_KEY);
        document.cookie = `app_secret_key=${VALID_KEY}; path=/; max-age=86400; SameSite=Strict; Secure`;
        setHasAccess(true);
      } else {
        setHasAccess(false);
      }
      setLoading(false);
    };

    checkAccess();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!hasAccess) {
    return <BlockedPage />;
  }

  return children;
};

// ============================================================
// ✅ MAIN APP ROUTES
// ============================================================
const AppRoutes = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Router>
      <Routes>
        {/* ===== PUBLIC ROUTES (No Secret Key Required) ===== */}
        <Route element={<SharedCoverPageCombine />}>
          <Route path="/" element={<ShopUserLoginPage />} />
          <Route path="/user/login" element={<ShopUserLoginPage />} />
          <Route path="/shop-user-otp-page" element={<ShopUserOtpPage />} />
          <Route path="/services" element={<ServicePage />} />                    {/* ✅ ADD */}
          <Route path="/contact" element={<ContactPage />} />               {/* ✅ Optional */}
        </Route>

        {/* ===== LOGIN PAGES - Secret Key စစ်မယ် ===== */}
        <Route 
          path="/ownerLogin" 
          element={
            <LoginGuard>
              <OwnerLogin />
            </LoginGuard>
          } 
        />
        <Route 
          path="/ownerOtpLogin" 
          element={
            <LoginGuard>
              <OwnerOtpLogin />
            </LoginGuard>
          } 
        />
        <Route 
          path="/office/login" 
          element={
            <LoginGuard>
              <OfficeLogin />
            </LoginGuard>
          } 
        />
        <Route 
          path="/office/otp/login" 
          element={
            <LoginGuard>
              <OfficeOtpLogin />
            </LoginGuard>
          } 
        />
        <Route 
          path="/office/confirm-login" 
          element={
            <LoginGuard>
              <OfficeConfirmLoginPage />
            </LoginGuard>
          } 
        />
        <Route 
          path="/owner/confirm-login" 
          element={
            <LoginGuard>
              <OwnerConfirmLoginPage />
            </LoginGuard>
          } 
        />
        {/* <Route 
          path="/office/reset-password" 
          element={
            <LoginGuard>
              <OfficeUserResetPassword />
            </LoginGuard>
          } 
        /> */}
        <Route path="/office/reset-password" element={<OfficeUserResetPassword />} />
        {/* <Route 
          path="/reset-password" 
          element={
            <LoginGuard>
              <ResetPassword />
            </LoginGuard>
          } 
        /> */}
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/shop/reset-password" element={<ShopUserResetPassword />} />
        <Route path="/branch/reset-password" element={<BranchUserResetPassword />} />

        {/* ============================================================== */}
        {/* ✅ SHOP/BRANCH USER ROUTES - Secret Key မစစ်ရ */}
        {/* ============================================================== */}
        
        {/* Shop Owner Routes */}
        <Route element={
          <ProtectedRoute 
            allowedRoles={["SHOP_OWNER"]}
            allowedUserTypes={["shop"]}
          >
            <UserAdminDashboardCombine />
          </ProtectedRoute>
        }>
          <Route path="/userAdminDashboardCombine" element={<UserAdminDashboardCombine />} />
        </Route>
        
        {/* User Routes (Shop/Branch) */}
        <Route element={
          <ProtectedRoute 
            allowedRoles={["STAFF", "CASHIER", "INVENTORY_STAFF", "MANAGER"]}
            allowedUserTypes={["shop", "branch"]}
          >
            <CartProvider>
              <UserPageCombine />
            </CartProvider>
          </ProtectedRoute>
        }>
          <Route path="/branch/manager/account/management/page" element={<BranchManagerAccountManagementPage />} />
          <Route path="/user/category/page" element={<UserCategoryPage />} />
          <Route path="/user/product/page" element={<UserProductPage />} />
          <Route path="/user/inventory/page" element={<UserInventoryPage />} />
          <Route path="/user/capital/page" element={<Capital/>} />
          <Route path="/user/sale/page" element={<UserSalePage />} />
          <Route path="/user/account/upe/page" element={<UserAccountUPEPage />} />
          <Route path="/user/return/page" element={<UserReturnPage />} />
          <Route path="/user/credit-debit/page" element={<UserCreditPage />} />
          <Route path="/user/setting/page" element={<UserSettingPage />} />
          <Route path="/user/discount/page" element={<UserDiscountPage />} />
          <Route path="/user/damage/page" element={<UserDamagePage />} />
          <Route path="/user/expense/page" element={<UserExpensePage />} />
          <Route path="/branch/account/upe/page" element={<BranchAccountUPEPage />} />
        </Route>

        {/* Other Routes (No Secret Key Required) */}
        <Route path="/branch/account/management/page" element={<BranchAccountManagementPage />} />
        <Route path="/shop/owner/page" element={<ShopOwnerPage />} />

        {/* ============================================================== */}
        {/* ✅ OWNER/OFFICE ROUTES - Secret Key စစ်မယ် */}
        {/* ============================================================== */}
        <Route element={<SecretKeyGuard />}>
          {/* Owner Routes */}
          <Route element={<OwnerProtectedRoute allowedRoles={["SUPER_ADMIN", "SYSTEM_ADMIN"]} />}>
            <Route path="/owner/dashboard" element={<OwnerDashboard />} />
            <Route path="/user/management/page" element={<UserManagementPage />} />
            <Route path="/owner/account/page" element={<OwnerAccountPage />} />
            <Route path="/office/account/page" element={<OfficeAccountPage />} />
            <Route path="/office/system/health/page" element={<SystemHealthPage />} />
            <Route path="/office/register/management/page" element={<RegisterManagementPage />} />
            <Route path="/office/tenant/management/page" element={<TenantManagementPage />} />
            <Route path="/office/financial/analytics/page" element={<FinancialAnalyticsPage />} />
            <Route path="/branch/shop/audit/logs/page" element={<AuditLogsPage />} />
            <Route path="/office/audit/logs/page" element={<OfficeAuditLogsPage />} />
          </Route>

          {/* Office Routes */}
          <Route element={
            <OfficeProtectedRoute allowedRoles={["MANAGER", "ACCOUNT_TEAM", "BILLING_TEAM", "CUSTOMER_SERVICE", "ACCOUNTANT"]} />
          }>
            <Route path="/office/dashboard" element={<OfficeDashboard />} />
            <Route path="/office/user/account/page" element={<OfficeUserAccountPage />} />
            <Route path="/office/shop/management/page" element={<ShopManagementPage />} />
            <Route path="/office/shop/:shopId/branches" element={<BranchManagementPage />} />
            <Route path="/office/plan/management/page" element={<PlanManagementPage />} />
            <Route path="/office/system/health/page" element={<SystemHealthPage />} />
            <Route path="/office/register/management/page" element={<RegisterManagementPage />} />
            <Route path="/office/tenant/management/page" element={<TenantManagementPage />} />
            <Route path="/office/financial/analytics/page" element={<FinancialAnalyticsPage />} />
            <Route path="/branch/shop/audit/logs/page" element={<AuditLogsPage />} />
            <Route path="/office/audit/logs/page" element={<OfficeAuditLogsPage />} />
            <Route path="/backup/restore/page" element={<SystemBackupRestorePage />} />
            <Route path="/office/shop/account/management/page" element={<ShopAccountManagementPage />} />
          </Route>
        </Route>

        {/* ===== 404 - NOT FOUND ===== */}
        <Route path="*" element={<BlockedPage />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;