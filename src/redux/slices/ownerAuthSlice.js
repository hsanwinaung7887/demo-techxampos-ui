import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import ownerApiClient from '../../services/ownerApiClient';

// ✅ Owner login API call
export const ownerLogin = createAsyncThunk(
  'ownerAuth/login',
  async ({ username, password, deviceFingerprint }, { rejectWithValue }) => {
    try {
      const response = await ownerApiClient.post('/ss@01/super-admin/login', {
        username,
        password,
        deviceFingerprint
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Owner verify OTP
export const ownerVerifyOtp = createAsyncThunk(
  'ownerAuth/verifyOtp',
  async ({ otp, username }, { rejectWithValue }) => {
    try {
      const response = await ownerApiClient.post('/ss@01/super-admin/verify-otp', {
        otp,
        username
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Owner resend OTP
export const ownerResendOtp = createAsyncThunk(
  'ownerAuth/resendOtp',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApiClient.post('/ss@01/super-admin/resend-otp');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Owner get current user (ME)
export const getOwnerCurrentUser = createAsyncThunk(
  'ownerAuth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApiClient.get('/ss@01/super-admin/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Owner logout
export const ownerLogout = createAsyncThunk(
  'ownerAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApiClient.post('/ss@01/super-admin/logout');
      return response.data;
    } catch (error) {
      console.error("Owner logout API error:", error);
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

// ✅ Owner refresh token
export const ownerRefreshToken = createAsyncThunk(
  'ownerAuth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const response = await ownerApiClient.post('/owner/auth/refresh');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  requiresOtp: false,
  waitingForConfirmation: false,  // ✅ ADD THIS
};

const ownerAuthSlice = createSlice({
  name: 'ownerAuth',
  initialState,
  reducers: {
    clearOwnerError: (state) => {
      state.error = null;
    },
    clearOwnerAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.requiresOtp = false;
      state.isLoading = false;
    },
    setOwnerRequiresOtp: (state, action) => {
      state.requiresOtp = action.payload;
    },
    // ✅ NEW: Set owner user (for profile updates)
    setOwnerUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = true;
    },
    // ✅ NEW: Partial update owner user
    updateOwnerUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    }
  },
  extraReducers: (builder) => {
    builder
      // ========== LOGIN ==========
      .addCase(ownerLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(ownerLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          if (action.payload.requiresOtp === true) {
            state.requiresOtp = true;
            state.user = null;
            state.isAuthenticated = false;
          } else {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.requiresOtp = false;
            state.error = null;
          }
        } else {
          state.error = action.payload.message;
          state.isAuthenticated = false;
          state.requiresOtp = false;
        }
      })
      .addCase(ownerLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      // ========== VERIFY OTP ==========
      .addCase(ownerVerifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(ownerVerifyOtp.fulfilled, (state, action) => {
  state.isLoading = false;

  if (action.payload.success) {
    if (action.payload.requiresConfirmation === true) {
      // ✅ OTP verified, waiting for "It's me" email click
      state.requiresOtp = false;
      state.isAuthenticated = false;
      state.waitingForConfirmation = true;  // ✅ Set waiting flag
      state.user = null;
      state.error = null;
    } else if (action.payload.alreadyTrusted === true) {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.requiresOtp = false;
      state.waitingForConfirmation = false;
      state.error = null;
    } else {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.requiresOtp = false;
      state.waitingForConfirmation = false;
      state.error = null;
    }
  } else {
    state.error = action.payload.message;
    state.waitingForConfirmation = false;
  }
})
      // In ownerVerifyOtp rejected case
    .addCase(ownerVerifyOtp.rejected, (state, action) => {
      state.isLoading = false;
      console.error("❌ ownerVerifyOtp rejected:", action);
      
      // ✅ Handle 403 error specifically
      if (action.payload?.status === 403) {
        state.error = "Session expired. Please login again.";
        state.requiresOtp = false;
      } else {
        state.error = action.payload?.message || action.error?.message || "OTP verification failed";
      }
    })
      // ========== RESEND OTP ==========
      .addCase(ownerResendOtp.pending, (state) => {
        state.error = null;
      })
      .addCase(ownerResendOtp.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to resend OTP';
      })
      
      // ========== GET CURRENT USER ==========
      .addCase(getOwnerCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOwnerCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(getOwnerCurrentUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;

      })
      
      // ========== REFRESH TOKEN ==========
      .addCase(ownerRefreshToken.fulfilled, (state) => {
        console.log('✅ Owner token refreshed');
      })
      .addCase(ownerRefreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
        console.log('❌ Owner token refresh failed');
      })
      
      // ========== LOGOUT ==========
      .addCase(ownerLogout.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(ownerLogout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.requiresOtp = false;
        console.log('✅ Owner logout success');
      })
      .addCase(ownerLogout.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = action.payload?.message || 'Logout failed';
        state.requiresOtp = false;
        console.log('❌ Owner logout rejected but state cleared');
      });
  }
});

// ✅ Export all actions
export const { 
  clearOwnerError, 
  clearOwnerAuth, 
  setOwnerRequiresOtp,
  setOwnerUser,      // ✅ NEW
  updateOwnerUser    // ✅ NEW (optional)
} = ownerAuthSlice.actions;

export default ownerAuthSlice.reducer;