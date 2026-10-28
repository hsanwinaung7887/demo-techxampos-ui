// src/components/OfficeProtectedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getOfficeCurrentUser, setOfficeUser } from '../redux/slices/officeAuthSlice';
import{getApiBaseUrl} from '../components/utils/defineConfig'
const API_BASE_URL = getApiBaseUrl();

const OfficeProtectedRoute = ({ children, allowedRoles = [] }) => {
  const dispatch = useDispatch();
  const { isAuthenticated, user, isLoading, waitingForConfirmation } = useSelector((state) => state.officeAuth);
  const [showConnectionError, setShowConnectionError] = useState(false);
  const hasFetched = useRef(false);
  const timeoutRef = useRef(null);
  const pollingRef = useRef(null);
  const broadcastChannelRef = useRef(null);

  // ========== POLLING FOR "IT'S ME" CONFIRMATION ==========
  useEffect(() => {
    // Only poll if waiting for confirmation OR not authenticated
    if ((!waitingForConfirmation && isAuthenticated) || isLoading) {
      return;
    }

    let pollCount = 0;
    const maxPolls = 60; // 3 minutes
    
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        pollCount++;
 
        const response = await fetch(`${API_BASE_URL}/office/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {

          if (pollingRef.current) clearInterval(pollingRef.current);
          
          // Update Redux state
          dispatch(setOfficeUser({
            user: data.user,
            isAuthenticated: true
          }));
          
          // Redirect to dashboard
          window.location.href = "/office/dashboard";
        } else if (pollCount >= maxPolls) {
          console.log("⏰ Office polling timeout");
          if (pollingRef.current) clearInterval(pollingRef.current);
        }
      } catch (err) {
        console.error("Office polling error:", err);
        if (pollCount >= maxPolls && pollingRef.current) {
          clearInterval(pollingRef.current);
        }
      }
    }, 3000);
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthenticated, isLoading, waitingForConfirmation, dispatch]);

  // ========== BROADCAST CHANNEL & STORAGE EVENT LISTENERS ==========
  useEffect(() => {
    const checkAuthAndRedirect = async () => {
      try {
        console.log("📢 Checking auth after confirmation event...");
        const response = await fetch(`${API_BASE_URL}/office/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
          console.log("✅ Auth check passed, redirecting to dashboard");
          if (pollingRef.current) clearInterval(pollingRef.current);
          
          dispatch(setOfficeUser({
            user: data.user,
            isAuthenticated: true
          }));
          
          window.location.href = "/office/dashboard";
        }
      } catch (err) {
        console.error("Auth check error:", err);
      }
    };
    
    const handleStorageChange = (e) => {
      if (e.key === 'officeLoginConfirmed' && e.newValue) {
        console.log("📢 Office login confirmed via storage event!");
        checkAuthAndRedirect();
      }
    };
    
    const handleMessage = (event) => {
      if (event.data?.type === 'OFFICE_LOGIN_CONFIRMED') {
        console.log("📢 Office login confirmed via postMessage!");
        checkAuthAndRedirect();
      }
    };
    
    // Setup BroadcastChannel
    try {
      const channel = new BroadcastChannel('office_login_channel');
      broadcastChannelRef.current = channel;
      channel.onmessage = (event) => {
        if (event.data?.type === 'OFFICE_LOGIN_CONFIRMED') {
          console.log("📢 Office login confirmed via BroadcastChannel!");
          checkAuthAndRedirect();
        }
      };
    } catch (err) {
      console.log("BroadcastChannel not supported");
    }
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('message', handleMessage);
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
    };
  }, [dispatch]);

  // ========== INITIAL AUTH CHECK ==========
  useEffect(() => {
    if (hasFetched.current) return;
    if (isAuthenticated) return;
    if (isLoading) return;

    if (!isAuthenticated && !isLoading && !hasFetched.current) {
      console.log("🔍 OfficeProtectedRoute: fetching office user...");
      hasFetched.current = true;
      dispatch(getOfficeCurrentUser());
      
      timeoutRef.current = setTimeout(() => {
        if (!isAuthenticated && !isLoading) {
          setShowConnectionError(true);
        }
      }, 5000);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [dispatch, isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        height: '100vh',
        fontSize: '18px'
      }}>
        <i className="fas fa-spinner fa-spin" style={{ marginRight: '10px' }}></i>
        Loading office portal...
      </div>
    );
  }

  if (showConnectionError && !isAuthenticated) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          padding: '24px',
          textAlign: 'center',
          maxWidth: '320px',
        }}>
          <h3>Connection Error</h3>
          <p>Please check your internet connection and try again.</p>
          <button
            onClick={() => {
              setShowConnectionError(false);
              hasFetched.current = false;
              dispatch(getOfficeCurrentUser());
            }}
            style={{
              padding: '8px 24px',
              backgroundColor: '#3498db',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/office/login" replace />;
  }

  if (allowedRoles.length > 0 && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children ? children : <Outlet />;
};

export default OfficeProtectedRoute;