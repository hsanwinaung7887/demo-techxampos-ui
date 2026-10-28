import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/office`;

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      console.error('Session expired or not authenticated');
      window.location.href = '/office/login';
    }
    throw new Error(data.message || 'Something went wrong');
  }
  return data;
};

export const branchApi = {
  // ===== Branches CRUD =====
  getBranches: async (params = {}) => {
    const { shopId, page = 1, size = 10, status = '', search = '' } = params;
    const queryParams = new URLSearchParams();
    queryParams.append('shopId', shopId);
    queryParams.append('page', page);
    queryParams.append('size', size);
    if (status) queryParams.append('status', status);
    if (search) queryParams.append('search', search);
    
    const response = await fetch(`${API_BASE_URLS}/branches?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  getBranchById: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/branches/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // ✅ CREATE - currentUser ထည့်ပို့ပါ
  createBranch: async (branchData, shopId, currentUser) => {
    // console.log("📝 CREATE BRANCH - currentUser:", currentUser);
    
    const requestBody = {
      ...branchData,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name || currentUser?.username,
      currentUserRole: currentUser?.role
    };
    
    const response = await fetch(`${API_BASE_URLS}/branches?shopId=${shopId}`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    return handleResponse(response);
  },

  // ✅ UPDATE - currentUser ထည့်ပို့ပါ
  updateBranch: async (id, branchData, currentUser) => {
    // console.log("📝 UPDATE BRANCH - currentUser:", currentUser);
    
    const requestBody = {
      ...branchData,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name || currentUser?.username,
      currentUserRole: currentUser?.role
    };
    
    const response = await fetch(`${API_BASE_URLS}/branches/${id}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
    return handleResponse(response);
  },

  // ✅ DELETE - query params နဲ့ ပို့ပါ
  deleteBranch: async (id, currentUser) => {
    // console.log("🗑️ DELETE BRANCH - currentUser:", currentUser);
    
    const params = new URLSearchParams({
      userId: currentUser?.id,
      userName: currentUser?.name || currentUser?.username,
      userRole: currentUser?.role
    });
    
    const response = await fetch(`${API_BASE_URLS}/branches/${id}?${params}`, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    return handleResponse(response);
  },

  checkBranchCode: async (branchCode) => {
    const response = await fetch(`${API_BASE_URLS}/branches/check-branch-code?branchCode=${encodeURIComponent(branchCode)}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  // ===== Branch Logs =====
  getLogs: async (params = {}) => {
    const {
      shopId,
      page = 1,
      size = 10,
      actionType = 'all',
      dateFilter = 'all',
      fromDate = '',
      toDate = ''
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page);
    queryParams.append('size', size);
    queryParams.append('actionType', actionType);
    queryParams.append('dateFilter', dateFilter);
    
    if (shopId) queryParams.append('shopId', shopId);
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const response = await fetch(`${API_BASE_URLS}/branches/logs?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  },

  getLogById: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/branches/logs/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' }
    });
    return handleResponse(response);
  }
};