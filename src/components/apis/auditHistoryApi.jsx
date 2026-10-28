// src/apis/auditHistoryApi.js
import { getApiBaseUrl } from "../utils/defineConfig";
const API_BASE_URL = getApiBaseUrl();
const API_BASE_URLS = `${API_BASE_URL}/audit-history`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const auditHistoryApi = {
  // Get audit history logs with pagination and filters
  getHistoryLogs: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      actionType = 'all',
      entityType = 'all',
      dateFilter = 'all',
      fromDate = '',
      toDate = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (search) queryParams.append('search', search);
    if (actionType && actionType !== 'all') queryParams.append('actionType', actionType);
    if (entityType && entityType !== 'all') queryParams.append('entityType', entityType);
    if (dateFilter && dateFilter !== 'all') queryParams.append('dateFilter', dateFilter);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse(response);
  }
};