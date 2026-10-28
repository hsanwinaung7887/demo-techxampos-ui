import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/user/products`;

const handleResponse = async (response) => {
  let data;
  try {
    // Try to parse as JSON first
    const text = await response.text();
    
    try {
      data = JSON.parse(text);
    } catch (e) {
      console.error('JSON parse error:', e);
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  } catch (e) {
    console.error('Response reading error:', e);
    throw new Error('Failed to read response');
  }
  
  if (!response.ok) {
    console.error('API Error Response:', data);
    throw new Error(data.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return data;
};

export const productApi = {
  // Get all products with pagination and filters
  getProducts: async (params = {}) => {
    const { page = 1, size = 10, search = '', status = '', statusTab = 'all-products', branchId } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    });
    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (statusTab) queryParams.append('statusTab', statusTab);
    
    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  getTotalPurchaseValue: async (branchId) => {
    const response = await fetch(`${API_BASE_URLS}/total-purchase-value?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // ========== NEW: Get products for selector with category filter ==========
  getProductsForSelector: async (params = {}) => {
    const { page = 1, size = 20, search = '', categoryId, branchId } = params;
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    });
    if (search) queryParams.append('search', search);
    // categoryId ရှိပြီး 'all' မဟုတ်ရင် ထည့်ပါ
    if (categoryId && categoryId !== 'all' && categoryId !== '') {
      queryParams.append('categoryId', categoryId);
    }
    
    const response = await fetch(`${API_BASE_URLS}/selector?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get product by ID
  getProductById: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    const data = await handleResponse(response);
    
    // Ensure cost data is included
    if (data.success && data.data) {
    }
    
    return data;
  },

  // Create new product (FormData)
  createProduct: async (formData, branchId) => {
    const response = await fetch(API_BASE_URLS, {
      method: 'POST',
      credentials: 'include',
      // Content-Type ကို မသတ်မှတ်ပါနဲ့ - browser က automatically multipart/form-data နဲ့ boundary ထည့်ပေးပါမယ်
      body: formData
    });
    
    return handleResponse(response);
  },

  // Update product
  updateProduct: async (id, formData, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      body: formData
    });
    
    return handleResponse(response);
  },

  // Delete product
  deleteProduct: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Check barcode uniqueness
  checkBarcode: async (barcode, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/check-barcode?barcode=${encodeURIComponent(barcode)}&branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Check SKU uniqueness
  checkSku: async (sku, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/check-sku?sku=${encodeURIComponent(sku)}&branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get product limit info
  getProductLimit: async (branchId) => {
    const response = await fetch(`${API_BASE_URLS}/limit-info?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};

export const productLogsApi = {
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

    const response = await fetch(`${API_BASE_URLS}/logs?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse(response);
  },

  // Get log by ID
  getLogById: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/logs/${id}?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get log summary
  getLogSummary: async (branchId) => {
    const response = await fetch(`${API_BASE_URLS}/logs/summary?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};