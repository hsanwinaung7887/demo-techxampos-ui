import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/user/credits`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const creditApi = {
  // Get all credits with pagination and filters
  getCredits: async (params = {}) => {
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

  // Get credit by ID
  getCreditById: async (id, branchId) => {
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

  // Create new credit
  createCredit: async (creditData, branchId) => {
    try {
      const requestBody = {
        ...creditData,
        branchId: branchId,
        totalAmount: creditData.totalAmount ? parseFloat(creditData.totalAmount) : 0,
        paidAmount: creditData.paidAmount ? parseFloat(creditData.paidAmount) : 0
      };

      const response = await fetch(API_BASE_URLS, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Update credit
  updateCredit: async (id, creditData, branchId) => {
    try {
      const requestBody = {
        ...creditData,
        branchId: branchId,
        totalAmount: creditData.totalAmount ? parseFloat(creditData.totalAmount) : 0,
        paidAmount: creditData.paidAmount ? parseFloat(creditData.paidAmount) : 0
      };

      const response = await fetch(`${API_BASE_URLS}/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Delete credit
  deleteCredit: async (id, branchId) => {
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
  },

  // Get credit summary
  getCreditSummary: async (branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/summary?branchId=${branchId}`, {
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

  // ===== NEW: Get recent invoices from sale table =====
  getRecentInvoices: async (branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/recent-invoices?branchId=${branchId}`, {
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

  // ===== NEW: Search invoices =====
  searchInvoices: async (query, branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/search-invoices?query=${encodeURIComponent(query)}&branchId=${branchId}`, {
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

  // ===== NEW: Get invoice by ID =====
  getInvoiceById: async (invoiceId, branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/invoice/${invoiceId}?branchId=${branchId}`, {
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

export const creditPaymentApi = {
  // Get payments by credit ID
  getPaymentsByCreditId: async (creditId, branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/payments/credit/${creditId}?branchId=${branchId}`, {
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

  // Add payment
  addPayment: async (paymentData, branchId) => {
    try {
      const requestBody = {
        ...paymentData,
        branchId: branchId,
        paymentAmount: paymentData.paymentAmount ? parseFloat(paymentData.paymentAmount) : 0
      };

      const response = await fetch(`${API_BASE_URLS}/payments`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // UPDATE payment
  updatePayment: async (paymentId, paymentData, branchId) => {
    if (!paymentId) {
      console.error('Payment ID is required for update');
      throw new Error('Payment ID is required');
    }

    const id = typeof paymentId === 'string' ? parseInt(paymentId, 10) : paymentId;
    
    if (isNaN(id)) {
      console.error('Invalid payment ID:', paymentId);
      throw new Error('Invalid payment ID');
    }

    try {
      const requestBody = {
        ...paymentData,
        branchId: branchId,
        paymentAmount: paymentData.paymentAmount ? parseFloat(paymentData.paymentAmount) : 0
      };

      const response = await fetch(`${API_BASE_URLS}/payments/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },
};

export const creditLogsApi = {
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

  // Get log by ID
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

  // Get log summary
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