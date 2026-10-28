// api/planApi.js
import axios from 'axios';
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/ssre@01`;

// Get current user info from localStorage or context
const getCurrentUser = () => {
  const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  return {
    id: user.id || 1, // fallback for testing
    username: user.username || 'Admin User',
    role: user.role || 'Admin'
  };
};

const planApi = {
  // Plans
  getPlans: (params) => {
    const { status, search, page, size } = params;
    return axios.get(`${API_BASE_URLS}`, {
      params: { 
        status: status === 'all-plans' ? 'all' : status,
        search,
        page: page || 0,
        size: size || 100
      }
    });
  },

  getPlanCounts: () => {
    return axios.get(`${API_BASE_URLS}/counts`);
  },

  getPlanById: (id) => {
    return axios.get(`${API_BASE_URLS}/${id}`);
  },

  createPlan: (planData) => {
    const user = getCurrentUser();
    return axios.post(`${API_BASE_URLS}`, planData, {
      headers: {
        'X-User-Id': user.id,
        'X-Username': user.username,
        'X-Role': user.role
      }
    });
  },

  updatePlan: (id, planData) => {
    const user = getCurrentUser();
    return axios.put(`${API_BASE_URLS}/${id}`, planData, {
      headers: {
        'X-User-Id': user.id,
        'X-Username': user.username,
        'X-Role': user.role
      }
    });
  },

  deletePlan: (id) => {
    const user = getCurrentUser();
    return axios.delete(`${API_BASE_URLS}/${id}`, {
      headers: {
        'X-User-Id': user.id,
        'X-Username': user.username,
        'X-Role': user.role
      }
    });
  },

  // Logs
  getLogs: (params) => {
    const { type, search, page, size } = params;
    return axios.get(`${API_BASE_URLS}/logs`, {
      params: { 
        type,
        search,
        page: page || 0,
        size: size || 100
      }
    });
  },

  getLogCounts: () => {
    return axios.get(`${API_BASE_URLS}/logs/counts`);
  }
};

export default planApi;