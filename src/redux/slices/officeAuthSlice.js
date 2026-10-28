// src/redux/slices/officeAuthSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import officeApiClient from '../../services/officeApiClient';

export const officeLogin = createAsyncThunk(
  'officeAuth/login',
  async ({ username, password, deviceFingerprint }, { rejectWithValue }) => {
    try {
      const response = await officeApiClient.post('/ss@01/office-user/login', {
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

export const officeVerifyOtp = createAsyncThunk(
  'officeAuth/verifyOtp',
  async ({ otp, username, deviceFingerprint }, { rejectWithValue }) => {
    try {
      const response = await officeApiClient.post('/ss@01/office-user/verify-otp', {
        otp,
        username,
        deviceFingerprint
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const officeResendOtp = createAsyncThunk(
  'officeAuth/resendOtp',
  async ({ username }, { rejectWithValue }) => {
    try {
      const response = await officeApiClient.post('/ss@01/office-user/resend-otp', {
        username
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const getOfficeCurrentUser = createAsyncThunk(
  'officeAuth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      const response = await officeApiClient.get('/office/auth/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: error.message });
    }
  }
);

export const officeLogout = createAsyncThunk(
  'officeAuth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const response = await officeApiClient.post('/ss@01/office-user/logout');
      return response.data;
    } catch (error) {
      console.error("Logout API error:", error);
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
  pendingUsername: null,
  waitingForConfirmation: false,
};

const officeAuthSlice = createSlice({
  name: 'officeAuth',
  initialState,
  reducers: {
    clearOfficeError: (state) => {
      state.error = null;
    },
    clearOfficeAuth: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      state.requiresOtp = false;
      state.pendingUsername = null;
      state.isLoading = false;
      state.waitingForConfirmation = false;
    },
    setOfficeRequiresOtp: (state, action) => {
      state.requiresOtp = action.payload;
    },
    setOfficePendingUsername: (state, action) => {
      state.pendingUsername = action.payload;
    },
    setOfficeWaitingForConfirmation: (state, action) => {
      state.waitingForConfirmation = action.payload;
    },
    setOfficeUser: (state, action) => {
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.waitingForConfirmation = false;
      state.requiresOtp = false;
      state.pendingUsername = null;
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(officeLogin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(officeLogin.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          if (action.payload.requiresOtp === true) {
            state.requiresOtp = true;
            state.pendingUsername = action.payload.username || state.pendingUsername;
            state.user = null;
            state.isAuthenticated = false;
            state.waitingForConfirmation = false;
          } else if (action.payload.user) {
            state.user = action.payload.user;
            state.isAuthenticated = true;
            state.requiresOtp = false;
            state.pendingUsername = null;
            state.waitingForConfirmation = false;
          }
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(officeLogin.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'Login failed';
      })
      
      .addCase(officeVerifyOtp.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(officeVerifyOtp.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success) {
          state.requiresOtp = false;
          state.waitingForConfirmation = true;
          state.error = null;
        } else {
          state.error = action.payload.message;
        }
      })
      .addCase(officeVerifyOtp.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload?.message || 'OTP verification failed';
      })
      
      .addCase(officeResendOtp.rejected, (state, action) => {
        state.error = action.payload?.message || 'Failed to resend OTP';
      })
      
      .addCase(getOfficeCurrentUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getOfficeCurrentUser.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.success && action.payload.user) {
          state.user = action.payload.user;
          state.isAuthenticated = true;
          state.waitingForConfirmation = false;
          state.requiresOtp = false;
        } else {
          state.user = null;
          state.isAuthenticated = false;
        }
      })
      .addCase(getOfficeCurrentUser.rejected, (state) => {
        state.isLoading = false;
        state.user = null;
        state.isAuthenticated = false;
      })
      
      .addCase(officeLogout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
        state.error = null;
        state.requiresOtp = false;
        state.pendingUsername = null;
        state.waitingForConfirmation = false;
      });
  }
});

export const { 
  clearOfficeError, 
  clearOfficeAuth, 
  setOfficeRequiresOtp, 
  setOfficePendingUsername,
  setOfficeWaitingForConfirmation,
  setOfficeUser
} = officeAuthSlice.actions;

export default officeAuthSlice.reducer;