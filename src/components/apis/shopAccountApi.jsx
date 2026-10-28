// 📁 src/components/owner/apis/shopAccountApi.js

import axios from 'axios';
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();
const shopAccountApi = {
  // Get accounts with pagination
  getAccounts: async (params) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/shop-accounts`, {
        params: {
          status: params.status || 'all',
          role: params.role || 'all',
          shopCode: params.shopCode || '',
          search: params.search || '',
          searchField: params.searchField || 'all',
          page: params.page || 0,
          size: params.size || 10
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching accounts:', error);
      throw error;
    }
  },

  // Get account counts
  getAccountCounts: async (search = '') => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/shop-accounts/counts`, {
        params: { search },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching account counts:', error);
      throw error;
    }
  },

  // Get account by ID
  getAccountById: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/shop-accounts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching account by ID:', error);
      throw error;
    }
  },

  // Create account
  createAccount: async (accountData) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const data = {
        username: accountData.username,
        password: accountData.password,
        fullName: accountData.fullName,
        email: accountData.email,
        phone: accountData.phone || '',
        role: accountData.role,
        status: accountData.status.toUpperCase(),
        shopId: accountData.shopId,
        createdBy: currentUser.id,
        createdByName: currentUser.name
      };

      const response = await axios.post(`${API_BASE_URL}/shop-accounts`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error creating account:', error);
      throw error;
    }
  },

  // Update account
  updateAccount: async (id, accountData) => {
    try {
      const token = localStorage.getItem('token');
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}');

      const data = {
        username: accountData.username,
        fullName: accountData.fullName,
        email: accountData.email,
        phone: accountData.phone || '',
        role: accountData.role,
        status: accountData.status.toUpperCase(),
        shopId: accountData.shopId,
        updatedBy: currentUser.id,
        updatedByName: currentUser.name
      };

      // Only include password if it's provided
      if (accountData.password) {
        data.password = accountData.password;
      }

      const response = await axios.put(`${API_BASE_URL}/shop-accounts/${id}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error updating account:', error);
      throw error;
    }
  },

  // Delete account (soft delete)
  deleteAccount: async (id) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(`${API_BASE_URL}/shop-accounts/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  // Get account logs
  getLogs: async (params) => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/shop-account-logs`, {
        params: {
          type: params.type || 'all',
          startDate: params.startDate || '',
          endDate: params.endDate || '',
          search: params.search || '',
          page: params.page || 0,
          size: params.size || 10
        },
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching account logs:', error);
      throw error;
    }
  },

  // Get log counts
  getLogCounts: async () => {
    try {
      const token = localStorage.getItem('token');

      const response = await axios.get(`${API_BASE_URL}/shop-account-logs/counts`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching log counts:', error);
      throw error;
    }
  },

  // Get shops for dropdown
  getShopsForDropdown: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/shops/dropdown`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching shops for dropdown:', error);
      throw error;
    }
  },

  // Get roles for dropdown
  getRolesForDropdown: async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/shop-accounts/roles/dropdown`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error fetching roles for dropdown:', error);
      throw error;
    }
  },

  // Check username availability
  checkUsername: async (username, shopId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/shop-accounts/check-username`, {
        params: { username, shopId },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error checking username:', error);
      throw error;
    }
  },

  // Generate username suggestion
  generateUsername: async (role, shopCode) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/shop-accounts/generate-username`, {
        params: { role, shopCode },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      return response;
    } catch (error) {
      console.error('Error generating username:', error);
      throw error;
    }
  }
};

export default shopAccountApi;