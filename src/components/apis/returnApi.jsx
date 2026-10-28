import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/return`;


const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const returnApi = {
  // Search sales by invoice number
  searchSaleByInvoice: async (invoiceNo, branchId) => {
    const response = await fetch(
      `${API_BASE_URLS}/search-sale?invoiceNo=${encodeURIComponent(invoiceNo)}&branchId=${branchId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return handleResponse(response);
  },

  // Get sale details with batch information
  getSaleWithBatches: async (saleId, branchId) => {
    const response = await fetch(
      `${API_BASE_URLS}/sale/${saleId}/batches?branchId=${branchId}`,
      {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      }
    );
    return handleResponse(response);
  },

  // Process return
  processReturn: async (returnData, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/process?branchId=${branchId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(returnData)
    });
    return handleResponse(response);
  },

  // Get returns with pagination
  getReturns: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      status = '',
      branchId,
      fromDate = '',
      toDate = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      branchId: branchId.toString()
    });

    if (search) queryParams.append('search', search);
    if (status) queryParams.append('status', status);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get return by ID
  getReturnById: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Update return status
  updateReturnStatus: async (id, statusData, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/${id}/status?branchId=${branchId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(statusData)
    });
    return handleResponse(response);
  },

  // Delete return
  deleteReturn: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/${id}?branchId=${branchId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};