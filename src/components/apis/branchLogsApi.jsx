// branchLogsApi.js
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/office`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      console.error('Session expired or not authenticated');
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const branchLogsApi = {
  // Get logs with pagination and filters (by shop or branch)
  getLogs: async (params = {}) => {
    const {
      shopId,          // filter by shop (all branches of this shop)
      branchId,        // filter by specific branch
      page = 1,
      size = 10,
      actionType = 'all',
      dateFilter = 'all',
      fromDate = '',
      toDate = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      actionType,
      dateFilter
    });
    if (shopId) queryParams.append('shopId', shopId);
    if (branchId) queryParams.append('branchId', branchId);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const response = await fetch(`${API_BASE_URLS}/branches/logs?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  getLogById: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/branches/logs/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};