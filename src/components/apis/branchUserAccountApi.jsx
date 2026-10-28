// branchUserAccountApi.js (JWT Version)
import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();
const API_BASE_URLS = `${API_BASE_URL}/branch/accounts`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

// ✅ JWT သုံးတော့ X-User-Id headers မလိုတော့ဘူး (token ထဲမှာ ပါတယ်)
export const branchUserAccountApi = {
  getAccounts: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      statusTab = 'all-accounts',
      branchCode,
      branchId
    } = params;

    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    if (search) queryParams.append('search', search);
    if (statusTab) queryParams.append('statusTab', statusTab);
    if (branchCode) queryParams.append('branchCode', branchCode);
    if (branchId) queryParams.append('branchId', branchId);

    const response = await fetch(`${API_BASE_URLS}?${queryParams}`, {
      method: 'GET',
      credentials: 'include',  // ✅ JWT cookie ပါပို့
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  getAccountById: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  createAccount: async (accountData) => {
    // ✅ JWT သုံးတော့ X-User-Id headers မလိုတော့ဘူး
    const response = await fetch(API_BASE_URLS, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return handleResponse(response);
  },

  updateAccount: async (id, accountData) => {
    const response = await fetch(`${API_BASE_URLS}/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(accountData)
    });
    return handleResponse(response);
  },

  deleteAccount: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/${id}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  },

  checkUsername: async (username) => {
    const response = await fetch(`${API_BASE_URLS}/check-username?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  checkEmail: async (email) => {
    const response = await fetch(`${API_BASE_URLS}/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};