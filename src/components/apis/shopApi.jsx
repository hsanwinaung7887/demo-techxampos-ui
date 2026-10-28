import officeApiClient from '../../services/officeApiClient';

const API_BASE_URL = '/office/shops';

// Helper function to handle responses
const handleResponse = (response) => {
  // ✅ response.data ရဲ့ structure ကို စစ်ဆေးပါ
  if (response.data && response.data.success === true) {
    // Return the full response with success flag
    return {
      success: true,
      data: response.data.data,
      message: response.data.message
    };
  }
  
  // Error case
  return {
    success: false,
    message: response.data?.message || 'Something went wrong',
    data: null
  };
};

// ===== Shop API =====
export const shopApi = {
  // Get all shops with pagination and filters
  getShops: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      statusTab = 'all-shops'
    } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    if (search) queryParams.append('search', search);
    if (statusTab && statusTab !== 'all-shops') queryParams.append('statusTab', statusTab);
    
    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  },
  
  // Get shop by ID
  getShopById: async (id) => {
    const response = await officeApiClient.get(`${API_BASE_URL}/${id}`);
    return handleResponse(response);
  },
  
  // Create new shop
  createShop: async (shopData) => {
    const response = await officeApiClient.post(API_BASE_URL, shopData);
    return handleResponse(response);
  },
  
  // Update shop
  updateShop: async (id, shopData) => {
    const response = await officeApiClient.put(`${API_BASE_URL}/${id}`, shopData);
    return handleResponse(response);
  },
  
  // Soft delete shop
  deleteShop: async (id) => {
    const response = await officeApiClient.delete(`${API_BASE_URL}/${id}`);
    return response.data;  // handleResponse မသုံးပါနဲ့
  },
  
  // Check shop code availability
  checkShopCode: async (shopCode) => {
    const url = `${API_BASE_URL}/check-shop-code?shopCode=${encodeURIComponent(shopCode)}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  }
};

// ===== Shop Logs API =====
export const shopLogsApi = {
  // Get logs with pagination and filters
 getLogs: async (params = {}) => {
  const {
    page = 1,
    size = 10,
    actionType = 'all',
    dateFilter = 'all',
    fromDate = '',
    toDate = ''
  } = params;
  
  const queryParams = new URLSearchParams();
  queryParams.append('page', page.toString());
  queryParams.append('size', size.toString());
  queryParams.append('actionType', actionType);
  queryParams.append('dateFilter', dateFilter);
  
  if (fromDate) queryParams.append('fromDate', fromDate);
  if (toDate) queryParams.append('toDate', toDate);
  
  const url = `${API_BASE_URL}/logs?${queryParams.toString()}`;
  const response = await officeApiClient.get(url);
  // ✅ Return the full response (not just response.data)
  return response.data;
},
  
  // Get log by ID
  getLogById: async (id) => {
    const response = await officeApiClient.get(`${API_BASE_URL}/logs/${id}`);
    return handleResponse(response);
  }
};