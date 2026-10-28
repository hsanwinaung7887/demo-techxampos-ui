// src/redux/slices/authSlice.js
// ✅ Demo version — frontend only, no backend, no authApi

import { createSlice } from '@reduxjs/toolkit';

// ✅ Demo user — အမြဲ login ဝင်ထားသလို ဖြစ်စေရန်
const DEMO_USER = {
  id: 1,
  username: 'demo_owner',
  fullName: 'Demo Owner',
  email: 'demo@example.com',
  phone: '09-123456789',
  role: 'SHOP_OWNER',        // Owner role (အားလုံးရဲ့ route ကို ဝင်လို့ရ)
  userType: 'shop',          // 'shop' or 'branch'
  status: 'Active',
  branchId: 1,
  shopId: 1,
  branchCode: 'branch',
};

// ✅ localStorage ကနေ initial state ကို ယူ
const getStoredUser = () => {
  try {
    const raw = localStorage.getItem("user");
    return raw ? JSON.parse(raw) : DEMO_USER;  // ← user မရှိရင် demo user ပြန်
  } catch {
    return DEMO_USER;
  }
};

const storedUser = getStoredUser();

const initialState = {
  user: storedUser,
  userType: storedUser?.userType || 'shop',
  isAuthenticated: true,     // ← ✅ အမြဲ true ထား
  isLoading: false,
  error: null,
  requiresOtp: false,
  pendingLoginData: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // ✅ Error ရှင်းရန်
    clearError: (state) => {
      state.error = null;
    },

    setError: (state, action) => {
      state.error = action.payload;
    },

    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },

    setRequiresOtp: (state, action) => {
      state.requiresOtp = action.payload;
    },

    setPendingLoginData: (state, action) => {
      state.pendingLoginData = action.payload;
    },

    clearPendingLoginData: (state) => {
      state.pendingLoginData = null;
      state.requiresOtp = false;
    },

    // ✅ User သတ်မှတ် (login အောင်မြင်ရင် သုံး)
    setUser: (state, action) => {
      const user = action.payload.user;
      state.user = user;
      state.userType = action.payload.userType || user?.userType || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
      state.requiresOtp = false;
      state.pendingLoginData = null;

      if (user) {
        try {
          localStorage.setItem("user", JSON.stringify(user));
          if (user.userType) localStorage.setItem("userType", user.userType);
          if (user.role) localStorage.setItem("userRole", user.role);
          if (user.id) localStorage.setItem("userId", user.id);
        } catch (e) {
          console.error("Failed to store user:", e);
        }
      }
    },

    // ✅ Logout — demo မှာ logout လုပ်ရင် demo user ပြန်ထား
    logout: (state) => {
      state.user = DEMO_USER;
      state.userType = 'shop';
      state.isAuthenticated = true;
      state.requiresOtp = false;
      state.pendingLoginData = null;
      state.error = null;
      state.isLoading = false;

      try {
        localStorage.setItem("user", JSON.stringify(DEMO_USER));
        localStorage.setItem("userType", 'shop');
        localStorage.setItem("userRole", DEMO_USER.role);
        localStorage.setItem("userId", DEMO_USER.id);
      } catch (e) {
        console.error("Failed to store demo user:", e);
      }
    },

    // ✅ App စတင်တဲ့အခါ restore
    restoreAuth: (state) => {
      const user = getStoredUser();
      state.user = user || DEMO_USER;
      state.userType = user?.userType || 'shop';
      state.isAuthenticated = true;
      state.isLoading = false;
    },
  },
});

export const {
  clearError,
  setError,
  setLoading,
  setRequiresOtp,
  setPendingLoginData,
  clearPendingLoginData,
  setUser,
  logout,
  restoreAuth,
} = authSlice.actions;

export default authSlice.reducer;