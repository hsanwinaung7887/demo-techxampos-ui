import { getApiBaseUrl } from '../utils/defineConfig';
const API_BASE_URL = getApiBaseUrl();

const API_BASE_URLS = `${API_BASE_URL}/office`;  // ✅ Updated to use getApiBaseUrl()

// Helper function to handle responses - ဒီအတိုင်းထားပါ
const handleResponse = async (response) => {
  const data = await response.json();
  
  // ✅ 401 ဆိုရင် error ပစ်မယ်
  if (!response.ok) {
    throw new Error(data.message || 'Something went wrong');
  }
  
  return data;
};
// ===== Account API =====
export const accountApi = {
  // Get all accounts with pagination and filters
  getAccounts: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      role = '',
      status = '',
      statusTab = 'all-accounts'  // all-accounts, active, inactive, suspended
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString()
    });
    
    if (search) queryParams.append('search', search);
    if (role) queryParams.append('role', role);
    if (status) queryParams.append('status', status);
    if (statusTab) queryParams.append('statusTab', statusTab);
    
    const response = await fetch(`${API_BASE_URLS}/accounts?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Get account by ID
  getAccountById: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/accounts/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  createAccount: async (accountData, currentUser) => {    
    const response = await fetch(`${API_BASE_URLS}/accounts`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...accountData,
            currentUserId: currentUser?.id,
            currentUserName: currentUser?.name || currentUser?.fullName || currentUser?.username,
            currentUserRole: currentUser?.role
        })
    });
    
    return handleResponse(response);
},
  // Update account (user info ထည့်ပို့မယ်)
  updateAccount: async (id, accountData, currentUser) => {
    const response = await fetch(`${API_BASE_URLS}/accounts/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ...accountData,
            currentUserId: currentUser?.id,
            // ✅ name or fullName ကို သေချာပို့ပါ
            currentUserName: currentUser?.name || currentUser?.fullName || currentUser?.username,
            currentUserRole: currentUser?.role
        })
    });
    
    return handleResponse(response);
},

// Delete account example
deleteAccount: async (id, currentUser) => {
    const params = new URLSearchParams({
        userId: currentUser?.id,
        userName: currentUser?.name || currentUser?.fullName || currentUser?.username,
        userRole: currentUser?.role
    });
    
    const response = await fetch(`${API_BASE_URLS}/accounts/${id}?${params}`, {
        method: 'DELETE',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    return handleResponse(response);
},

  
  // Check username availability
  checkUsername: async (username) => {
    const response = await fetch(`${API_BASE_URLS}/accounts/check-username?username=${encodeURIComponent(username)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Check email availability
  checkEmail: async (email) => {
    const response = await fetch(`${API_BASE_URLS}/accounts/check-email?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  }
};

// ===== Logs API =====
export const logsApi = {
  // Get logs with pagination and filters
  getLogs: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      actionType = 'all',
      dateFilter = 'all',
      fromDate = '',
      toDate = ''
    } = params;
    
    const queryParams = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
      actionType,
      dateFilter
    });
    
    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);
    
    const response = await fetch(`${API_BASE_URLS}/accounts/logs?${queryParams}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Get log by ID
  getLogById: async (id) => {
    const response = await fetch(`${API_BASE_URLS}/accounts/logs/${id}`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  },
  
  // Get log summary
  getLogSummary: async () => {
    const response = await fetch(`${API_BASE_URLS}/accounts/logs/summary`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return handleResponse(response);
  }
};