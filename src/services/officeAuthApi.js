// src/services/officeAuthApi.js
import apiClient from './apiClient';

const officeAuthApi = {
  login: async (credentials) => {
    const response = await apiClient.post('/ss@01/office-user/login', credentials);
    return response.data;
  },

  verifyOtp: async (data) => {
    const response = await apiClient.post('/ss@01/office-user/verify-otp', data);
    return response.data;
  },

  resendOtp: async (data) => {
    const response = await apiClient.post('/ss@01/office-user/resend-otp', data);
    return response.data;
  },

  getMe: async () => {
    const response = await apiClient.get('/ss@01/office-user/me');
    return response.data;
  },

  logout: async () => {
    const response = await apiClient.post('/ss@01/office-user/logout');
    return response.data;
  },
};

export default officeAuthApi;
