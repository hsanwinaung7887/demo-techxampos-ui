// discountApi.js - FULLY FIXED
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/user/discounts`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const discountApi = {
  // Get all discounts with pagination and filters
  getDiscounts: async (params = {}) => {
    const { page = 1, size = 10, search = '', status = '', branchId } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    });
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    
    try {
      const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Get discount by ID
  getDiscountById: async (id, branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Create new discount
  createDiscount: async (discountData, branchId) => {
    try {
      const formattedData = {
        ...discountData,
        branchId: branchId,
        discountValue: discountData.discountValue ? parseFloat(discountData.discountValue) : null,
        minPurchase: discountData.minPurchase ? parseFloat(discountData.minPurchase) : null,
        maxUsage: discountData.maxUsage ? parseInt(discountData.maxUsage) : null,
        buyQuantity: discountData.buyQuantity ? parseInt(discountData.buyQuantity) : null,
        getQuantity: discountData.getQuantity ? parseInt(discountData.getQuantity) : null,
        discountAmount: discountData.discountAmount ? parseFloat(discountData.discountAmount) : null,
        startTime: discountData.startTime ? discountData.startTime.substring(0, 5) : null,
        endTime: discountData.endTime ? discountData.endTime.substring(0, 5) : null
      };

      const response = await fetch(API_BASE_URLS, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Update discount
  updateDiscount: async (id, discountData, branchId) => {
    try {
      const formattedData = {
        ...discountData,
        branchId: branchId,
        discountValue: discountData.discountValue ? parseFloat(discountData.discountValue) : null,
        minPurchase: discountData.minPurchase ? parseFloat(discountData.minPurchase) : null,
        maxUsage: discountData.maxUsage ? parseInt(discountData.maxUsage) : null,
        buyQuantity: discountData.buyQuantity ? parseInt(discountData.buyQuantity) : null,
        getQuantity: discountData.getQuantity ? parseInt(discountData.getQuantity) : null,
        discountAmount: discountData.discountAmount ? parseFloat(discountData.discountAmount) : null,
        startTime: discountData.startTime ? discountData.startTime.substring(0, 5) : null,
        endTime: discountData.endTime ? discountData.endTime.substring(0, 5) : null
      };

      const response = await fetch(`${API_BASE_URLS}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // ✅ FIXED: Delete discount - use API_BASE_URLS not API_BASE_URL
  deleteDiscount: async (id, branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
};

export const discountLogsApi = {
  // Get logs with pagination and filters
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

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      actionType,
      dateFilter,
      branchId: branchId.toString()
    });

    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    try {
      const response = await fetch(`${API_BASE_URLS}/logs?${queryParams}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  getLogById: async (id, branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/logs/${id}?branchId=${branchId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  getLogSummary: async (branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/logs/summary?branchId=${branchId}`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
};