// src/apis/officeAuditLogApi.js
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/office/audit-logs`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const officeAuditLogApi = {
  getAuditLogs: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      action = 'all',
      severity = 'all',
      status = 'all',
      dateFrom = '',
      dateTo = '',
      deviceFingerprint = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (search) queryParams.append('search', search);
    if (action && action !== 'all') queryParams.append('action', action);
    if (severity && severity !== 'all') queryParams.append('severity', severity);
    if (status && status !== 'all') queryParams.append('status', status);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);
    if (deviceFingerprint) queryParams.append('deviceFingerprint', deviceFingerprint);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse(response);
  },

  getAuditStats: async () => {
    const response = await fetch(`${API_BASE_URLS}/stats`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};