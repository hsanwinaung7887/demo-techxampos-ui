// src/apis/capitalApi.js
import { getApiBaseUrl } from '../utils/defineConfig';

const API_BASE_URL = getApiBaseUrl();

// ============================================================
// Helper Functions
// ============================================================
const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
    console.error('❌ JSON parse error:', e);
    throw new Error(`Server returned ${response.status}: ${response.statusText}`);
  }

  if (!response.ok) {
    const errorMessage = data?.message || data?.error || `Server error: ${response.status}`;
    console.error('❌ API Error:', { status: response.status, data });
    throw new Error(errorMessage);
  }

  return data;
};

const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });
  return queryParams.toString();
};

// ============================================================
// Capital API
// ============================================================
const capitalApi = {

  // ==========================================================
  // 1. GET CAPITAL SUMMARY
  // ==========================================================
  getSummary: async (branchId) => {
    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/capital/summary?branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getSummary error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 2. GET CAPITAL TRANSACTIONS (with pagination & filters)
  // ==========================================================
  getTransactions: async (params = {}) => {

    const {
      page = 1,
      size = 10,
      search = '',
      type = 'all',
      branchId
    } = params;

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const queryParams = {
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    };

    if (search) queryParams.search = search;
    if (type && type !== 'all') queryParams.type = type;

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/user/capital/transactions?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getTransactions error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 3. CREATE CAPITAL TRANSACTION
  // ==========================================================
  createTransaction: async (data, branchId) => {

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    if (!data.type) {
      console.error('❌ Transaction type is required');
      throw new Error('Transaction type is required');
    }
    if (!data.amount || data.amount <= 0) {
      console.error('❌ Valid amount is required');
      throw new Error('Valid amount is required');
    }
    if (!data.description) {
      console.error('❌ Description is required');
      throw new Error('Description is required');
    }

    const url = `${API_BASE_URL}/user/capital/transactions?branchId=${branchId}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('❌ createTransaction error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 4. DELETE CAPITAL TRANSACTION
  // ==========================================================
  deleteTransaction: async (id, branchId) => {

    if (!id) {
      console.error('❌ Transaction ID is required');
      throw new Error('Transaction ID is required');
    }
    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/capital/transactions/${id}?branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('❌ deleteTransaction error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 5. GET CLOSING HISTORY (with pagination)
  // ==========================================================
  getClosingHistory: async (params = {}) => {

    const {
      page = 1,
      size = 10,
      branchId
    } = params;

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const queryParams = {
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/user/capital/closing-history?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getClosingHistory error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 6. CLOSE PERIOD - FIXED (Only Profit/Loss)
  // ==========================================================
  closePeriod: async (data, branchId) => {

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    // ✅ Validate only required fields (profitLoss and closingDate)
    if (!data.closingDate) {
      console.error('❌ Closing date is required');
      throw new Error('Closing date is required');
    }
    if (data.profitLoss === undefined || data.profitLoss === null) {
      console.error('❌ Profit/Loss is required');
      throw new Error('Profit/Loss is required');
    }

    // ❌ REMOVED: sales, cogs, expense validation

    const url = `${API_BASE_URL}/user/capital/close-period?branchId=${branchId}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('❌ closePeriod error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 7. GET CAPITAL LOGS (Activity History)
  // ==========================================================
  getLogs: async (params = {}) => {

    const {
      page = 1,
      size = 10,
      branchId
    } = params;

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const queryParams = {
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    };

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/user/capital/logs?${queryString}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getLogs error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 8. GET EXTERNAL DATA (Sales, COGS, Expense for Closing)
  // ==========================================================
  getExternalData: async (branchId) => {

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/capital/external-data?branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getExternalData error:', error);
      throw error;
    }
  },

  // ==========================================================
  // 9. GET BRANCH PROFIT FOR CLOSING (by month) - NEW
  // ==========================================================
// src/apis/capitalApi.js

// ==========================================================
// 9. GET BRANCH PROFIT FOR CLOSING (by month)
// ==========================================================
getBranchProfitForClosing: async (branchId, month, year) => {

  if (!branchId) {
    console.error('❌ Branch ID is required');
    throw new Error('Branch ID is required');
  }

  const url = `${API_BASE_URL}/user/capital/branch-profit?branchId=${branchId}&month=${month}&year=${year}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await handleResponse(response);

    // ✅ data.data ကိုပြန်ပေး (profit, month, year)
    return data.data;
  } catch (error) {
    console.error('❌ getBranchProfitForClosing error:', error);
    throw error;
  }
}
};

export default capitalApi;