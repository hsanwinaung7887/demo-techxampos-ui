// src/apis/auditLogApi.js
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/audit-logs`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const auditLogApi = {
  // Get audit logs with pagination and filters
  getAuditLogs: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      action = 'all',
      severity = 'all',
      status = 'all',
      userType = 'all',
      dateFrom = '',
      dateTo = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });

    if (search) queryParams.append('search', search);
    if (action && action !== 'all') queryParams.append('action', action);
    if (severity && severity !== 'all') queryParams.append('severity', severity);
    if (status && status !== 'all') queryParams.append('status', status);
    if (userType && userType !== 'all') queryParams.append('userType', userType);
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });

    return handleResponse(response);
  },

  // Get audit statistics
  getAuditStats: async () => {
    const response = await fetch(`${API_BASE_URLS}/stats`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Export logs as CSV
  exportCsv: async (params = {}) => {
    const { dateFrom = '', dateTo = '' } = params;
    const queryParams = new URLSearchParams();
    if (dateFrom) queryParams.append('dateFrom', dateFrom);
    if (dateTo) queryParams.append('dateTo', dateTo);

    const response = await fetch(`${API_BASE_URLS}/export/csv?${queryParams}`, {
      method: 'GET',
      credentials: 'include'
    });
    
    if (!response.ok) {
      throw new Error('Export failed');
    }
    
    const blob = await response.blob();
    return blob;
  },

  // Block IP address
  blockIpAddress: async (ipAddress) => {
    const response = await fetch(`${API_BASE_URLS}/block-ip`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ipAddress })
    });
    return handleResponse(response);
  },

  // Flag log for review
  flagLog: async (logId, reason) => {
    const response = await fetch(`${API_BASE_URLS}/${logId}/flag`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason })
    });
    return handleResponse(response);
  }
};