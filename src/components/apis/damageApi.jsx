import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/user/damages`;
const LOGS_API_BASE_URL = `${API_BASE_URL}/user/damage-logs`  ;
// damageApi.js - Add this constant
const EXPORT_API_BASE_URL = `${API_BASE_URL}/user/damages/export`;

const handleResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (e) {
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

export const damageApi = {
  // Get damages with pagination and filters
  getDamages: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      damageType = 'all',
      branchId
    } = params;

    if (!branchId) {
      throw new Error('Branch ID is required');
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    });

    if (search) queryParams.append('search', search);
    if (damageType !== 'all') queryParams.append('damageType', damageType);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse(response);
  },

  // Get damage by ID
  getDamageById: async (id, branchId) => {
    if (!id) throw new Error('Damage ID is required');
    if (!branchId) throw new Error('Branch ID is required');

    const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get product info for damage reporting (with stock and average price)
  getProductForDamage: async (productId, branchId) => {
    if (!productId) throw new Error('Product ID is required');
    if (!branchId) throw new Error('Branch ID is required');

    const response = await fetch(`${API_BASE_URLS}/product/${productId}?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get image URL
  getImageUrl: (filename) => {
    if (!filename) return null;
    return `http://localhost:8083/uploads/images/medium/${filename}`;
  },

  // Get thumbnail URL
  getThumbnailUrl: (filename) => {
    if (!filename) return null;
    return `http://localhost:8083/uploads/images/thumbnail/${filename}`;
  },

  // Create new damage (FormData) - Single image (UserProductPage နည်းအတိုင်း)
  createDamage: async (formData, branchId) => {
    try {
      if (!branchId) throw new Error('Branch ID is required');
      
      for (let pair of formData.entries()) {
        if (pair[0] === 'image') {
          if (pair[1] instanceof File) {
            console.log(`   📷 ${pair[0]}:`, pair[1].name, `(${pair[1].type}, ${pair[1].size} bytes)`);
          } else {
            console.log(`   📷 ${pair[0]}:`, pair[1]);
          }
        } else {
          console.log(`   📝 ${pair[0]}:`, pair[1]);
        }
      }

      const response = await fetch(`${API_BASE_URLS}?branchId=${branchId}`, {
        method: 'POST',
        credentials: 'include',
        body: formData
        // No Content-Type header - browser will set it with boundary
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('❌ Create damage failed:', error);
      throw error;
    }
  },

  // Update damage - Single image (UserProductPage နည်းအတိုင်း)
  updateDamage: async (id, formData, branchId) => {
    try {
      if (!id) throw new Error('Damage ID is required');
      if (!branchId) throw new Error('Branch ID is required');

      // Debug log FormData
      for (let pair of formData.entries()) {
        if (pair[0] === 'image') {
          if (pair[1] instanceof File) {
            console.log(`   📷 ${pair[0]}:`, pair[1].name, `(${pair[1].type}, ${pair[1].size} bytes)`);
          } else {
            console.log(`   📷 ${pair[0]}:`, pair[1]);
          }
        } else {
          console.log(`   📝 ${pair[0]}:`, pair[1]);
        }
      }

      const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
        method: 'PUT',
        credentials: 'include',
        body: formData
        // No Content-Type header - browser will set it with boundary
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('❌ Update damage failed:', error);
      throw error;
    }
  },

  // Delete damage
  deleteDamage: async (id, branchId) => {
    try {
      if (!id) throw new Error('Damage ID is required');
      if (!branchId) throw new Error('Branch ID is required');

      const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await handleResponse(response);
      return result;

    } catch (error) {
      console.error('❌ Delete damage failed:', error);
      throw error;
    }
  }
};

export const damageLogsApi = {
  // Get damage logs with pagination
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
      throw new Error('Branch ID is required');
    }

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      actionType,
      dateFilter,
      branchId: branchId.toString()
    });

    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const response = await fetch(`${LOGS_API_BASE_URL}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse(response);
  },

  // Get log by ID
  getLogById: async (id) => {
    if (!id) throw new Error('Log ID is required');

    const response = await fetch(`${LOGS_API_BASE_URL}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get logs by damage ID
  getLogsByDamageId: async (damageId) => {
    if (!damageId) throw new Error('Damage ID is required');

    const response = await fetch(`${LOGS_API_BASE_URL}/damage/${damageId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};