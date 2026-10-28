// src/services/authApi.js
import apiClient from './apiClient';

const authApi = {
  login: async (credentials) => {
    // Determine which endpoint to use based on user type?
    // For now, try shop first, then branch (handled in component)
    const response = await apiClient.post('/shop-accounts/login', credentials);
    return response.data;
  },

  branchLogin: async (credentials) => {
    const response = await apiClient.post('/branch-accounts/login', credentials);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/auth/me');
    return response.data;
  },

  refreshToken: async () => {
    const response = await apiClient.post('/auth/refresh');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/auth/logout');
    return response.data;
  },
};

export default authApi;