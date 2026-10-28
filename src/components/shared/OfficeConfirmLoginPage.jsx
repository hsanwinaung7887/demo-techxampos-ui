// src/components/office/OfficeConfirmLoginPage.jsx

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import "../../light-style/shared-css/confirmLogin.css";
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const OfficeConfirmLoginPage = () => {
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
        
        if (action === "deny") {
          localStorage.removeItem("officeLoginConfirmed");
          sessionStorage.removeItem("officeLoginConfirmed");
          sessionStorage.removeItem("officePendingLogin");
          sessionStorage.removeItem("officeAwaitingConfirmation");
          
          await fetch(`${API_BASE_URL}/ss@01/office-user/confirm-login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ token, action: "deny" }),
          });
          
          setMessage("❌ Login denied. Please login again.");
          
          setTimeout(() => {
            window.location.href = "/office/login";
          }, 3000);
          return;
        }
        
        // action === "confirm"
        const response = await fetch(`${API_BASE_URL}/ss@01/office-user/confirm-login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ token, action }),
        });
        
        const data = await response.json();
        
        if (data.success) {
  const confirmData = {
    timestamp: Date.now(),
    redirect: data.redirect || "/office/dashboard",
    user: data.user,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken
  };
  
  // ✅ Store for polling detection
  localStorage.setItem("officeLoginConfirmed", JSON.stringify(confirmData));
  sessionStorage.setItem("officeLoginConfirmed", JSON.stringify(confirmData));
  
  // ✅ CRITICAL: Set cookies via API for the original tab
  try {
    const cookieResponse = await fetch(`${API_BASE_URL}/office/auth/set-cookies`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken
      })
    });
    const cookieResult = await cookieResponse.json();

  } catch (e) {
    console.error("Could not set cookies via API:", e);
  }
  
  // ✅ Broadcast to original login tab
  try {
    const channel = new BroadcastChannel('office_login_channel');
    channel.postMessage({ type: 'OFFICE_LOGIN_CONFIRMED', data: confirmData });
    channel.close();
  } catch (e) {
    console.log("BroadcastChannel not supported");
  }
  
  // ✅ Try to refresh original login window
  if (window.opener && !window.opener.closed) {
    window.opener.postMessage({ type: 'OFFICE_LOGIN_CONFIRMED', data: confirmData }, '*');
    window.opener.location.reload();
    setMessage("✅ Login confirmed! Original window is refreshing...");
  } else {
    setMessage(
      "✅ Login confirmed successfully!\n\n" +
      "ကျေးဇူးပြု၍ သင်ဝင်ရောက်နေသော မူလစက်ပေါ်ရှိ ဘရောက်ဆာသို့ ပြန်သွားပြီး\n" +
      "စာမျက်နှာကို Refresh (F5) နှိပ်ပါ။"
    );
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
            <div className="success-icon">{message.includes("denied") ? "❌" : "✅"}</div>
            <h2>{message.includes("denied") ? "Login Denied" : "Login Confirmed!"}</h2>
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

export default OfficeConfirmLoginPage;