// 📁 src/components/office/apis/shopPlanApi.js
import officeApiClient from '../../services/officeApiClient'; 

const API_BASE_URL = '/office/plans';

// ✅ FIXED: Handle nested response structure correctly
const handleResponse = (response) => {
  if (!response.data.success) {
    throw new Error(response.data.message || 'Something went wrong');
  }
  
  return response.data.data;
};

// ===== Shop Plan API =====
export const shopPlanApi = {
  getPlans: async (params = {}) => {
    const {
      page = 1,
      size = 10,
      search = '',
      level = '',
      statusTab = 'all-plans'
    } = params;
    
    const queryParams = new URLSearchParams();
    queryParams.append('page', page.toString());
    queryParams.append('size', size.toString());
    
    if (search) queryParams.append('search', search);
    if (level) queryParams.append('level', level);
    if (statusTab && statusTab !== 'all-plans') queryParams.append('statusTab', statusTab);
    
    const url = `${API_BASE_URL}?${queryParams.toString()}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  },
  
  getPlanById: async (id) => {
    const response = await officeApiClient.get(`${API_BASE_URL}/${id}`);
    return handleResponse(response);
  },
  
  createPlan: async (planData, currentUser) => {
    // ✅ currentUser info ကို ထည့်ပို့ပါ
    const requestBody = {
      ...planData,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name || currentUser?.username,
      currentUserRole: currentUser?.role
    };
    
    const response = await officeApiClient.post(API_BASE_URL, requestBody);
    return handleResponse(response);
  },
  
  updatePlan: async (id, planData, currentUser) => {
    const requestBody = {
      ...planData,
      currentUserId: currentUser?.id,
      currentUserName: currentUser?.name || currentUser?.username,
      currentUserRole: currentUser?.role
    };
    
    const response = await officeApiClient.put(`${API_BASE_URL}/${id}`, requestBody);
    return handleResponse(response);
  },
  
  deletePlan: async (id, currentUser) => {
    // ✅ Query params နဲ့ ပို့ပါ (DELETE request body မပါဘူး)
    const params = new URLSearchParams({
      userId: currentUser?.id,
      userName: currentUser?.name || currentUser?.username,
      userRole: currentUser?.role
    });
    
    const response = await officeApiClient.delete(`${API_BASE_URL}/${id}?${params}`);
    return response.data;
  },

  
  checkPlanCode: async (planCode) => {
    const url = `${API_BASE_URL}/check-plan-code?planCode=${encodeURIComponent(planCode)}`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  },
  
  getLevelCounts: async () => {
    const url = `${API_BASE_URL}/level-counts`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  }
};

// ===== Shop Plan Logs API =====
export const shopPlanLogsApi = {
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
    // ✅ Return full response, NOT handleResponse
    return response.data;
  },
  
  getLogById: async (id) => {
    const response = await officeApiClient.get(`${API_BASE_URL}/logs/${id}`);
    return handleResponse(response);
  },
  
  getLogSummary: async () => {
    const url = `${API_BASE_URL}/logs/summary`;
    const response = await officeApiClient.get(url);
    return handleResponse(response);
  }
};