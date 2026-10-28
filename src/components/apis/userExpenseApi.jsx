// src/apis/userExpenseApi.js
import { getApiBaseUrl } from '../utils/defineConfig';

const API_BASE_URL = getApiBaseUrl();
// ===== Helper Functions =====
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
    console.error('❌ API Error:', {
      status: response.status,
      statusText: response.statusText,
      data: data
    });
    throw new Error(errorMessage);
  }
  
  return data;
};

// ===== Build Query String =====
const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  Object.keys(params).forEach(key => {
    if (params[key] !== null && params[key] !== undefined && params[key] !== '') {
      queryParams.append(key, params[key]);
    }
  });
  return queryParams.toString();
};

// ===== API Object =====
const userExpenseApi = {
  
  // ============================================================
  // 1. EXPENSES CRUD
  // ============================================================
  
  /**
   * Get expenses with pagination and filters
   */
  getExpenses: async (params = {}) => {
    const { 
      page = 1, 
      size = 10, 
      search = '', 
      category = 'all', 
      paymentMethod = 'all', 
      status = 'all',
      depreciationType = 'all',
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
    if (category && category !== 'all') queryParams.category = category;
    if (paymentMethod && paymentMethod !== 'all') queryParams.paymentMethod = paymentMethod;
    if (status && status !== 'all') queryParams.status = status;
    if (depreciationType && depreciationType !== 'all') queryParams.depreciationType = depreciationType;

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/user/expenses?${queryString}`;
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getExpenses error:', error);
      throw error;
    }
  },

  /**
   * Get expense by ID
   */
  getExpenseById: async (id, branchId) => {

    if (!id) {
      console.error('❌ Expense ID is required');
      throw new Error('Expense ID is required');
    }
    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/expenses/${id}?branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getExpenseById error:', error);
      throw error;
    }
  },

  /**
   * Create new expense
   */
  createExpense: async (data, branchId) => {

    if (!branchId) {
      console.error('❌ Branch ID is missing!');
      throw new Error('Branch ID is required');
    }

    // Validate required fields
    if (!data.title) {
      console.error('❌ Title is required');
      throw new Error('Title is required');
    }
    if (!data.category) {
      console.error('❌ Category is required');
      throw new Error('Category is required');
    }
    if (!data.amount || data.amount <= 0) {
      console.error('❌ Valid amount is required');
      throw new Error('Valid amount is required');
    }

    const url = `${API_BASE_URL}/user/expenses?branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const result = await handleResponse(response);
      return result;
      
    } catch (error) {
      console.error('❌ createExpense error:', error);
      throw error;
    }
  },

  /**
   * Update existing expense
   */
  updateExpense: async (id, data, branchId) => {
    if (!id) {
      console.error('❌ Expense ID is required');
      throw new Error('Expense ID is required');
    }
    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/expenses/${id}?branchId=${branchId}`;
 
    try {
      const response = await fetch(url, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      const result = await handleResponse(response);
      console.log('✅ updateExpense success:', result);
      return result;
      
    } catch (error) {
      console.error('❌ updateExpense error:', error);
      throw error;
    }
  },

  /**
   * Delete expense (soft delete)
   */
  deleteExpense: async (id, branchId) => {

    if (!id) {
      console.error('❌ Expense ID is required');
      throw new Error('Expense ID is required');
    }
    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/expenses/${id}?branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await handleResponse(response);
      return result;
      
    } catch (error) {
      console.error('❌ deleteExpense error:', error);
      throw error;
    }
  },

  /**
   * Update expense status
   */
  updateStatus: async (id, status, branchId) => {

    if (!id) {
      console.error('❌ Expense ID is required');
      throw new Error('Expense ID is required');
    }
    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    // Validate status
    const validStatuses = ['Paid', 'Pending', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      console.error('❌ Invalid status:', status);
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    const url = `${API_BASE_URL}/user/expenses/${id}/status?status=${status}&branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      const result = await handleResponse(response);
      return result;
      
    } catch (error) {
      console.error('❌ updateStatus error:', error);
      throw error;
    }
  },

  // ============================================================
  // 2. DEPRECIATION
  // ============================================================

  /**
   * Calculate depreciation for an expense
   */
  calculateDepreciation: async (data, branchId) => {

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/expenses/depreciation/calculate?branchId=${branchId}`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('❌ calculateDepreciation error:', error);
      throw error;
    }
  },

  /**
   * Get depreciation summary
   */
  getDepreciationSummary: async (branchId) => {

    if (!branchId) {
      console.error('❌ Branch ID is required');
      throw new Error('Branch ID is required');
    }

    const url = `${API_BASE_URL}/user/expenses/depreciation/summary?branchId=${branchId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('❌ getDepreciationSummary error:', error);
      throw error;
    }
  },

  // ============================================================
  // 3. LOGS
  // ============================================================

  /**
   * Get expense logs with pagination and filters
   */
  getLogs: async (params = {}) => {

    const { 
      page = 1, 
      size = 10, 
      actionType = 'all', 
      dateFilter = 'all', 
      fromDate = '', 
      toDate = '',
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
    
    if (actionType && actionType !== 'all') queryParams.actionType = actionType;
    if (dateFilter) queryParams.dateFilter = dateFilter;
    if (fromDate) queryParams.fromDate = fromDate;
    if (toDate) queryParams.toDate = toDate;

    const queryString = buildQueryString(queryParams);
    const url = `${API_BASE_URL}/user/expense-logs?${queryString}`;
    
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
  }
};

export default userExpenseApi;