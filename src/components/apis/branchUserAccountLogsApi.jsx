// branchUserAccountLogsApi.js (JWT Version)
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/branch/accounts/logs`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const branchUserAccountLogsApi = {
  getLogs: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      actionType = 'all',
      dateFilter = 'all',
      fromDate = '',
      toDate = '',
      branchCode,
      branchId
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      actionType,
      dateFilter
    });
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    if (branchCode) queryParams.append('branchCode', branchCode);
    if (branchId) queryParams.append('branchId', branchId);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',  // ✅ JWT cookie ပါပို့
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  getLogById: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};