// src/hooks/useAuthPolling.js
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setUser } from '../redux/slices/authSlice';
import { getApiBaseUrl } from '../components/utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();


export const useAuthPolling = (isAuthenticated, isLoading, setIsLoading) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const pendingCheckRef = useRef(null);

  // Check for pending login (from OTP flow)
  useEffect(() => {
    const checkPendingLogin = async () => {
      const pending = sessionStorage.getItem("pendingLogin");
      if (pending && !isAuthenticated && !isLoading) {
        try {
          const pendingData = JSON.parse(pending);
          const elapsed = Date.now() - pendingData.timestamp;
          
          // If pending is older than 10 minutes, clear it
          if (elapsed > 10 * 60 * 1000) {
            sessionStorage.removeItem("pendingLogin");
            return;
          }
          
          // Check if user is now authenticated
          const response = await fetch(`${API_BASE_URL}/auth/me`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          });
          
          const data = await response.json();
          
          if (data.success && data.user) {
            console.log("✅ Pending login completed! User is now authenticated.");
            sessionStorage.removeItem("pendingLogin");
            
            dispatch(setUser({
              user: data.user,
              userType: data.user.userType,
              isAuthenticated: true
            }));
            
            // Redirect based on role
            const redirectPath = data.user.role === "SHOP_OWNER" 
              ? "/userAdminDashboardCombine" 
              : (data.user.userType === "branch" ? "/user/category/page" : "/user/category/page");
            
            navigate(redirectPath);
          }
        } catch (err) {
          console.error("Error checking pending login:", err);
        }
      }
    };
    
    // Check immediately
    checkPendingLogin();
    
    // Then check every 3 seconds
    pendingCheckRef.current = setInterval(checkPendingLogin, 3000);
    
    return () => {
      if (pendingCheckRef.current) {
        clearInterval(pendingCheckRef.current);
      }
    };
  }, [isAuthenticated, isLoading, dispatch, navigate]);
  
  // Poll for auth status changes (for cross-device)
  useEffect(() => {
    if (isAuthenticated || isLoading) return;
    
    let pollCount = 0;
    const maxPolls = 30; // 90 seconds max
    
    pollingRef.current = setInterval(async () => {
      try {
        pollCount++;
        
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" }
        });
        
        const data = await response.json();
        
        if (data.success && data.user) {
          console.log("🎉 Auth polling detected authenticated user!");
          
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          
          dispatch(setUser({
            user: data.user,
            userType: data.user.userType,
            isAuthenticated: true
          }));
          
          const redirectPath = data.user.role === "SHOP_OWNER" 
            ? "/userAdminDashboardCombine" 
            : (data.user.userType === "branch" ? "/user/category/page" : "/user/category/page");
          
          navigate(redirectPath);
          
          if (setIsLoading) setIsLoading(false);
        } else if (pollCount >= maxPolls) {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
          }
          if (setIsLoading) setIsLoading(false);
        }
      } catch (err) {
        console.error("Polling error:", err);
        if (pollCount >= maxPolls && pollingRef.current) {
          clearInterval(pollingRef.current);
          if (setIsLoading) setIsLoading(false);
        }
      }
    }, 3000);
    
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isAuthenticated, isLoading, dispatch, navigate, setIsLoading]);
};