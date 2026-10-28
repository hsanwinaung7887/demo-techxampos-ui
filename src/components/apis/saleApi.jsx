import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/sale`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const saleApi = {
  // Get payment methods
  getPaymentMethods: async (branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/payment-methods?branchId=${branchId}`, {
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

  // Hold cart
  holdCart: async (holdData) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/hold`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(holdData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Get held carts
  getHeldCarts: async (branchId, search = '') => {
    try {
      const queryParams = new URLSearchParams({ branchId: branchId.toString() });
      if (search) queryParams.append('search', search);
      
      const response = await fetch(`${API_BASE_URLS}/hold?${queryParams}`, {
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

  // Continue held cart
  continueHeldCart: async (cartId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/hold/${cartId}`, {
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

  // Delete held cart
  deleteHeldCart: async (cartId, branchId) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/hold/${cartId}?branchId=${branchId}`, {
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

  // Complete sale
  completeSale: async (saleData) => {
    try {
      const response = await fetch(`${API_BASE_URLS}/complete`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(saleData)
      });
      return handleResponse(response);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  },

  // Search products across branches
  searchProductsAcrossBranches: async (params) => {
    const { search, branchId, includeOtherBranches, currentBranchId } = params;
    
    const queryParams = new URLSearchParams({
      search,
      branchId: branchId.toString(),
      includeOtherBranches: includeOtherBranches ? 'true' : 'false'
    });
    
    if (currentBranchId) {
      queryParams.append('currentBranchId', currentBranchId.toString());
    }

    try {
      const response = await fetch(`${API_BASE_URLS}/search-across-branches?${queryParams}`, {
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

  // Get sales history
  getSalesHistory: async (params = {}) => {
    const { page = 1, size = 10, search = '', startDate = '', endDate = '', branchId } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    });
    
    if (search) queryParams.append('search', search);
    if (startDate) queryParams.append('startDate', startDate);
    if (endDate) queryParams.append('endDate', endDate);

    try {
      const response = await fetch(`${API_BASE_URLS}/history?${queryParams}`, {
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

  // Get daily sales summary
  getDailySalesSummary: async (startDate, endDate, branchId) => {
    const queryParams = new URLSearchParams({
      startDate,
      endDate,
      branchId: branchId.toString()
    });

    try {
      const response = await fetch(`${API_BASE_URLS}/summary/daily?${queryParams}`, {
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