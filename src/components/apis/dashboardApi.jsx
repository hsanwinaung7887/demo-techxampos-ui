// dashboardApi.js (JWT Version)
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/dashboard`;  

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const dashboardApi = {
  getOverview: async (periodData) => {
    const response = await fetch(`${API_BASE_URLS}/overview`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(periodData)
    });
    return handleResponse(response);
  },

  getBranchesSummary: async (periodData) => {
    const response = await fetch(`${API_BASE_URLS}/branches`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(periodData)
    });
    return handleResponse(response);
  },

  getBranchDetail: async (branchId, periodData) => {
    const response = await fetch(`${API_BASE_URLS}/branch/${branchId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(periodData)
    });
    return handleResponse(response);
  },

  getBranchSalesTrend: async (branchId, periodData) => {
    const response = await fetch(`${API_BASE_URLS}/branch/${branchId}/sales-trend`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(periodData)
    });
    return handleResponse(response);
  },

  // ===== NEW: Get Expense Details for Modal =====
  getExpensesDetail: async (periodData) => {
    const response = await fetch(`${API_BASE_URLS}/expenses-detail`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(periodData)
    });
    return handleResponse(response);
  }
};