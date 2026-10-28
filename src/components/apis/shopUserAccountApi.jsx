import officeApiClient from '../../services/officeApiClient';

const API_BASE_URL = '/office/shop-accounts';

// Helper function to handle responses
const handleResponse = (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || 'Something went wrong');
  }
  return response.data.data; // Return inner data
};

// ===== Shop User Account API =====
export const shopUserAccountApi = {
  // Get all accounts with pagination and filters
  getAccounts: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      statusTab = 'all-accounts'
    } = params;

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());

    if (search) queryParams.append('search', search);
    if (statusTab && statusTab !== 'all-accounts') queryParams.append('statusTab', statusTab);

    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  },

  // Get account by ID
  getAccountById: async (id) => {
    const response = await officeApiClient.get(`${API_BASE_URL}/${id}`);
    return handleResponse(response);
  },

  // Create new account
 createAccount: async (accountData, currentUser) => {
    const requestBody = {
      ...accountData,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name || currentUser?.username,
      currentUserRole: currentUser?.role
    };
    
    const response = await officeApiClient.post(API_BASE_URL, requestBody);
    return handleResponse(response);
  },

  // ✅ Update account with currentUser
  updateAccount: async (id, accountData, currentUser) => {
    const requestBody = {
      ...accountData,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name || currentUser?.username,
      currentUserRole: currentUser?.role
    };
    
    const response = await officeApiClient.put(`${API_BASE_URL}/${id}`, requestBody);
    return handleResponse(response);
  },

  // ✅ Delete account with currentUser
  deleteAccount: async (id, currentUser) => {
    // Delete အတွက် query params နဲ့ ပို့ပါ
    const params = new URLSearchParams({
      userId: currentUser?.id,
      userName: currentUser?.name || currentUser?.username,
      userRole: currentUser?.role
    });
    
    const response = await officeApiClient.delete(`${API_BASE_URL}/${id}?${params}`);
    return response.data;
  },

  // Check username availability
  checkUsername: async (username) => {
    const url = `${API_BASE_URL}/check-username?username=${encodeURIComponent(username)}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  },

  // Check email availability
  checkEmail: async (email) => {
    const url = `${API_BASE_URL}/check-email?email=${encodeURIComponent(email)}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  }
};

// ===== Shop User Account Logs API =====
export const shopUserAccountLogsApi = {
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

    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    queryParams.append('actionType', actionType);
    queryParams.append('dateFilter', dateFilter);

    if (fromDate) queryParams.append('fromDate', fromDate);
    if (toDate) queryParams.append('toDate', toDate);

    const url = `${API_BASE_URL}/logs?${queryParams.toString()}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  },

  // Get log by ID
  getLogById: async (id) => {
    const response = await officeApiClient.get(`${API_BASE_URL}/logs/${id}`);
    return handleResponse(response);
  }
};