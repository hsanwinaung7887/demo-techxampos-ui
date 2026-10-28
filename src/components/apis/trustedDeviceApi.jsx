import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/trusted-devices`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const trustedDeviceApi = {
  // Get trusted devices with pagination
  getTrustedDevices: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      userType = ''
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    if (search) queryParams.append('search', search);
    if (userType) queryParams.append('userType', userType);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Revoke a trusted device (remove from whitelist)
  revokeDevice: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/${id}/revoke`, {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // Get trusted devices for a specific user
  getUserTrustedDevices: async (userId, userType = 'branch') => {
    const response = await fetch(`${API_BASE_URLS}/user/${userId}?userType=${userType}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};