import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/user/inventory/logs`;  // ✅ Updated to use getApiBaseUrl()

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const inventoryLogsApi = {
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

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse(response);
  },

  // Get log by ID
  getLogById: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Export logs
  exportLogs: async (params = {}) => {
    const {
      actionType = 'all',
      dateFilter = 'all',
      fromDate = '',
      toDate = '',
      branchId,
      format = 'csv'
    } = params;

    const queryParams = new URLSearchParams({
      actionType,
      dateFilter,
      branchId: branchId.toString(),
      format
    });

    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const response = await fetch(`${API_BASE_URLS}/export?${queryParams}`, {
      method: 'GET',
      credentials: 'include'
    });
    return response;
  }
};