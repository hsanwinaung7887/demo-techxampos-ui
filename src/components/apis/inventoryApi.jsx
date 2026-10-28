import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/user/inventory`;  // ✅ Updated to use getApiBaseUrl()

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const inventoryApi = {
  // Get batches for a product (with pagination)
  getBatches: async (productId, branchId, page = 1, size = 10, all = false) => {
    const queryParams = new URLSearchParams({
      branchId: branchId.toString(),
      page: page.toString(),
      size: size.toString(),
      all: all.toString()
    });
    
    const response = await fetch(`${API_BASE_URLS}/batches/product/${productId}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get batch summary
  getBatchSummary: async (productId, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/batches/product/${productId}/summary?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get single batch
  getBatch: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/batches/${id}?branchId=${branchId}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Create new batch
  createBatch: async (batchData, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/batches?branchId=${branchId}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    });
    return handleResponse(response);
  },

  // Update batch details
  updateBatch: async (id, batchData, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/batches/${id}?branchId=${branchId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(batchData)
    });
    return handleResponse(response);
  },

  // Adjust batch
  adjustBatch: async (id, quantityChange, reason, notes, branchId) => {
    const params = new URLSearchParams({
      quantityChange: quantityChange.toString(),
      reason,
      notes: notes || '',
      branchId: branchId.toString()
    });
    const response = await fetch(`${API_BASE_URLS}/batches/${id}/adjust?${params}`, {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Delete batch
  deleteBatch: async (id, branchId) => {
    const response = await fetch(`${API_BASE_URLS}/batches/${id}?branchId=${branchId}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
  
};