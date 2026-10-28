// src/hooks/useOfficeAuthPolling.js
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { setOfficeUser } from '../redux/slices/officeAuthSlice';
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

export const useOfficeAuthPolling = (isAuthenticated, isLoading, setIsLoading) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const pollingRef = useRef(null);
  const pendingCheckRef = useRef(null);

  // Check for pending login (from OTP flow)
  useEffect(() => {
    const checkPendingLogin = async () => {
      const pending = sessionStorage.getItem("officePendingLogin");
      if (pending && !isAuthenticated && !isLoading) {
        try {
          const pendingData = JSON.parse(pending);
          const elapsed = Date.now() - pendingData.timestamp;
          
          if (elapsed > 10 * 60 * 1000) {
            sessionStorage.removeItem("officePendingLogin");
            return;
          }
          
          const response = await fetch(`${API_BASE_URL}/office/auth/me`, {
            method: "GET",
            credentials: "include",
            headers: { "Content-Type": "application/json" }
          });
          
          const data = await response.json();
          
          if (data.success && data.user) {
            sessionStorage.removeItem("officePendingLogin");
            
            dispatch(setOfficeUser({
              user: data.user,
              isAuthenticated: true
            }));
            
            navigate("/office/dashboard");
          }
        } catch (err) {
          console.error("Error checking office pending login:", err);
        }
      }
    };
    
    checkPendingLogin();
    pendingCheckRef.current = setInterval(checkPendingLogin, 3000);
    
    return () => {
      if (pendingCheckRef.current) clearInterval(pendingCheckRef.current);
    };
  }, [isAuthenticated, isLoading, dispatch, navigate]);
  
  // Poll for auth status changes (for cross-device / email confirmation)
  useEffect(() => {
    if (isAuthenticated || isLoading) return;
    
    let pollCount = 0;
    const maxPolls = 60; // 3 minutes
    
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
          
          dispatch(setOfficeUser({
            user: data.user,
            isAuthenticated: true
          }));
          
          navigate("/office/dashboard");
          
          if (setIsLoading) setIsLoading(false);
        } else if (pollCount >= maxPolls) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          if (setIsLoading) setIsLoading(false);
        }
      } catch (err) {
        console.error("Office polling error:", err);
        if (pollCount >= maxPolls && pollingRef.current) {
          clearInterval(pollingRef.current);
          if (setIsLoading) setIsLoading(false);
        }
      }
    }, 3000);
    
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthenticated, isLoading, dispatch, navigate, setIsLoading]);
};