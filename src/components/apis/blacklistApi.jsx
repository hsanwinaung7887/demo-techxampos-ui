// src/apis/blacklistApi.js
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/blacklist`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const blacklistApi = {
  // Get blacklist with pagination
  getBlacklist: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      blockType = '',
      status = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    if (search) queryParams.append('search', search);
    if (blockType) queryParams.append('blockType', blockType);
    if (status) queryParams.append('status', status);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Add to blacklist
  addToBlacklist: async (data) => {
    const response = await fetch(`${API_BASE_URLS}/add`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    return handleResponse(response);
  },

  // Unblock
  unblock: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/unblock/${id}`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Check if blocked
  checkBlocked: async (blockType, blockValue) => {
    const response = await fetch(`${API_BASE_URLS}/check?blockType=${blockType}&blockValue=${encodeURIComponent(blockValue)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};