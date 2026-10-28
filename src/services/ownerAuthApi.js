import ownerApiClient from './ownerApiClient';

const ownerAuthApi = {
  login: async (credentials) => {
    const response = await ownerApiClient.post('/ss@01/super-admin/login', credentials);
    return response.data;
  },

  verifyOtp: async (data) => {
    const response = await ownerApiClient.post('/ss@01/super-admin/verify-otp', data);
    return response.data;
  },

  resendOtp: async () => {
    const response = await ownerApiClient.post('/ss@01/super-admin/resend-otp');
    return response.data;
  },

  getCurrentUser: async () => {
    const response = await ownerApiClient.get('/owner/auth/me');
    return response.data;
  },

  logout: async () => {
    const response = await ownerApiClient.post('/ss@01/super-admin/logout');
    return response.data;
  },

  refreshToken: async () => {
    const response = await ownerApiClient.post('/owner/auth/refresh');
    return response.data;
  },

  forgotPassword: async (email) => {
    const response = await ownerApiClient.post('/ss@01/super-admin/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (token, newPassword) => {
    const response = await ownerApiClient.post('/ss@01/super-admin/reset-password', { token, newPassword });
    return response.data;
  },

  verifyResetToken: async (token) => {
    const response = await ownerApiClient.post('/ss@01/super-admin/verify-reset-token', { token });
    return response.data;
  },

  changePassword: async (oldPassword, newPassword) => {
    const response = await ownerApiClient.post('/ss@01/super-admin/change-password', { oldPassword, newPassword });
    return response.data;
  },

  updateProfile: async (data, currentPassword) => {
    const response = await ownerApiClient.post('/ss@01/super-admin/update-info', data, {
      params: { currentPassword }
    });
    return response.data;
  }
};

export default ownerAuthApi;