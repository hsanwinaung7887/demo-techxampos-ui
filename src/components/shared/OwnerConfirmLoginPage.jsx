import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../../light-style/shared-css/confirmLogin.css";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const OwnerConfirmLoginPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const action = searchParams.get("action");
  
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token || !action) {
      setError("Invalid confirmation link");
      setLoading(false);
      return;
    }

    const confirmLogin = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/ss@01/super-admin/confirm-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, action }),
        });
        
        const data = await response.json();

        if (data.success) {
          // ✅ Store autoLoginToken in localStorage for polling
          if (data.autoLoginToken) {
            localStorage.setItem("ownerAutoLoginToken", data.autoLoginToken);
            sessionStorage.setItem("ownerAutoLoginToken", data.autoLoginToken);
          }
          
          const confirmData = {
            timestamp: Date.now(),
            redirect: "/owner/dashboard",
            user: data.user,
            autoLoginToken: data.autoLoginToken
          };
          
          // Store for polling detection
          localStorage.setItem("ownerLoginConfirmed", JSON.stringify(confirmData));
          sessionStorage.setItem("ownerLoginConfirmed", JSON.stringify(confirmData));
          
          // Try BroadcastChannel (same browser, different tabs)
          try {
            const channel = new BroadcastChannel('owner_login_channel');
            channel.postMessage({ type: 'LOGIN_CONFIRMED', data: confirmData });
            channel.close();
          } catch (e) {
            console.log("BroadcastChannel not supported");
          }
          
          // Try to refresh original login window
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: 'LOGIN_CONFIRMED', data: confirmData }, '*');
            window.opener.location.href = "/owner/dashboard";
            setMessage("✅ Login confirmed! Dashboard is loading in the original window...");
          } else {
            // No opener - redirect directly
            setMessage("✅ Login confirmed successfully! Redirecting to dashboard...");
            
            // Redirect after 2 seconds
            setTimeout(() => {
              window.location.href = "/owner/dashboard";
            }, 2000);
            return;
          }
          
          // Auto close after 5 seconds
          setTimeout(() => {
            if (window.opener && !window.opener.closed) {
              window.close();
            }
          }, 5000);
          
        } else {
          setError(data.message || "Confirmation failed");
        }
      } catch (err) {
        console.error("Confirm login error:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    confirmLogin();
  }, [token, action]);

  return (
    <div className="confirm-login-container">
      <div className="confirm-login-card">
        {loading ? (
          <>
            <div className="spinner"></div>
            <h2>Processing...</h2>
            <p>Please wait while we confirm your login.</p>
          </>
        ) : error ? (
          <>
            <div className="error-icon">❌</div>
            <h2>Confirmation Failed</h2>
            <p>{error}</p>
            <button onClick={() => window.close()} className="confirm-btn">
              Close
            </button>
          </>
        ) : message ? (
          <>
            <div className="success-icon">✅</div>
            <h2>Login Confirmed!</h2>
            <p style={{ whiteSpace: "pre-line" }}>{message}</p>
            <button onClick={() => window.close()} className="confirm-btn">
              Close Window
            </button>
          </>
        ) : null}
      </div>
    </div>
  );
};

export default OwnerConfirmLoginPage;