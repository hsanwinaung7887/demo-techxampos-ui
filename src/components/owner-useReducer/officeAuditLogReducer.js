// src/owner-useReducer/officeAuditLogReducer.js

export const initialOfficeAuditLogState = {
  auditLogs: [],
  filteredLogs: [],
  selectedLog: null,
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  },
  filters: {
    search: '',
    action: 'all',
    severity: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
    deviceFingerprint: ''
  },
  statistics: {
    totalLogs: 0,
    todayLogs: 0,
    criticalLogs: 0,
    failedActions: 0,
    uniqueUsers: 0,
    uniqueIPs: 0
  },
  loading: false,
  tableLoading: false,
  error: null,
  success: false,
  realTimeMode: false,
  autoRefresh: false
};

export const officeAuditLogReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_OFFICE_AUDIT_LOGS_START":
      return { ...state, tableLoading: true, error: null };
      
    case "FETCH_OFFICE_AUDIT_LOGS_SUCCESS": {
      const responseData = action.payload.data;
      
      // ✅ FIXED: Check if responseData.data is an array, otherwise use empty array
      let auditLogs = [];
      let currentPage = 1;
      let pageSize = state.pagination.size;
      let totalItems = 0;
      let totalPages = 1;
      
      // Handle different possible response structures
      if (responseData && Array.isArray(responseData.data)) {
        // Structure: { success: true, data: { data: [], currentPage, pageSize, totalItems, totalPages } }
        auditLogs = responseData.data || [];
        currentPage = responseData.currentPage || 1;
        pageSize = responseData.pageSize || state.pagination.size;
        totalItems = responseData.totalItems || 0;
        totalPages = responseData.totalPages || 1;
      } else if (responseData && Array.isArray(responseData)) {
        // Structure: { success: true, data: [] }
        auditLogs = responseData;
      } else if (responseData && responseData.data && !Array.isArray(responseData.data)) {
        // Structure: { success: true, data: { content: [] } } (Spring Boot Page format)
        auditLogs = responseData.data.content || [];
        currentPage = responseData.data.number + 1 || 1;
        pageSize = responseData.data.size || state.pagination.size;
        totalItems = responseData.data.totalElements || 0;
        totalPages = responseData.data.totalPages || 1;
      } else {
        // Fallback: empty array
        auditLogs = [];
        console.warn("Unexpected API response structure:", responseData);
      }
      
      const processedLogs = Array.isArray(auditLogs) ? auditLogs.map(log => ({
        ...log,
        id: log.id || log.logId,
        timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
        date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '',
        time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''
      })) : [];
      
      const uniqueUsers = [...new Set(processedLogs.map(l => l.username).filter(Boolean))];
      const uniqueIPs = [...new Set(processedLogs.map(l => l.ipAddress).filter(Boolean))];
      const today = new Date().toISOString().split('T')[0];
      const todayLogs = processedLogs.filter(log => log.createdAt?.startsWith(today));
      const criticalLogs = processedLogs.filter(log => log.severity === 'CRITICAL');
      const failedActions = processedLogs.filter(log => log.status === 'FAILED');
      
      return {
        ...state,
        auditLogs: processedLogs,
        filteredLogs: processedLogs,
        pagination: {
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages: totalPages,
          hasNext: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        statistics: {
          totalLogs: totalItems,
          todayLogs: todayLogs.length,
          criticalLogs: criticalLogs.length,
          failedActions: failedActions.length,
          uniqueUsers: uniqueUsers.length,
          uniqueIPs: uniqueIPs.length
        },
        tableLoading: false
      };
    }
    
    case "FETCH_OFFICE_AUDIT_LOGS_FAILURE":
      return { ...state, tableLoading: false, error: action.payload.error };
      
    case "SET_OFFICE_FILTERS":
      return { ...state, filters: { ...state.filters, ...action.payload }, pagination: { ...state.pagination, page: 1 } };
      
    case "CLEAR_OFFICE_FILTERS":
      return { ...state, filters: initialOfficeAuditLogState.filters, pagination: { ...state.pagination, page: 1 } };
      
    case "APPLY_OFFICE_LOCAL_FILTERS": {
      let filtered = [...state.auditLogs];
      const { filters } = state;
      
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(log =>
          (log.username || '').toLowerCase().includes(searchLower) ||
          (log.description || '').toLowerCase().includes(searchLower)
        );
      }
      if (filters.action !== 'all') filtered = filtered.filter(log => log.action === filters.action);
      if (filters.severity !== 'all') filtered = filtered.filter(log => log.severity === filters.severity);
      if (filters.status !== 'all') filtered = filtered.filter(log => log.status === filters.status);
      if (filters.dateFrom) filtered = filtered.filter(log => log.createdAt?.split('T')[0] >= filters.dateFrom);
      if (filters.dateTo) filtered = filtered.filter(log => log.createdAt?.split('T')[0] <= filters.dateTo);
      
      return { ...state, filteredLogs: filtered };
    }
    
    case "SET_OFFICE_PAGE":
      return { ...state, pagination: { ...state.pagination, page: action.payload } };
      
    case "SET_OFFICE_PAGE_SIZE":
      return { ...state, pagination: { ...state.pagination, size: action.payload, page: 1 } };
      
    case "SET_OFFICE_SELECTED_LOG":
      return { ...state, selectedLog: action.payload };
      
    case "SET_OFFICE_REAL_TIME_MODE":
      return { ...state, realTimeMode: action.payload };
      
    case "SET_OFFICE_AUTO_REFRESH":
      return { ...state, autoRefresh: action.payload };
      
    case "SET_OFFICE_LOADING":
      return { ...state, loading: action.payload };
      
    case "SET_OFFICE_TABLE_LOADING":
      return { ...state, tableLoading: action.payload };
      
    case "SET_OFFICE_ERROR":
      return { ...state, error: action.payload, loading: false, tableLoading: false };
      
    case "CLEAR_OFFICE_ERROR":
      return { ...state, error: null };
      
    case "SET_OFFICE_SUCCESS":
      return { ...state, success: action.payload };
      
    case "CLEAR_OFFICE_SUCCESS":
      return { ...state, success: false };
      
    default:
      return state;
  }
};

export const officeAuditLogActions = {
  fetchLogsStart: () => ({ type: "FETCH_OFFICE_AUDIT_LOGS_START" }),
  fetchLogsSuccess: (data) => ({ type: "FETCH_OFFICE_AUDIT_LOGS_SUCCESS", payload: { data } }),
  fetchLogsFailure: (error) => ({ type: "FETCH_OFFICE_AUDIT_LOGS_FAILURE", payload: { error } }),
  setFilters: (filters) => ({ type: "SET_OFFICE_FILTERS", payload: filters }),
  clearFilters: () => ({ type: "CLEAR_OFFICE_FILTERS" }),
  applyLocalFilters: () => ({ type: "APPLY_OFFICE_LOCAL_FILTERS" }),
  setPage: (page) => ({ type: "SET_OFFICE_PAGE", payload: page }),
  setPageSize: (size) => ({ type: "SET_OFFICE_PAGE_SIZE", payload: size }),
  setSelectedLog: (log) => ({ type: "SET_OFFICE_SELECTED_LOG", payload: log }),
  setRealTimeMode: (enabled) => ({ type: "SET_OFFICE_REAL_TIME_MODE", payload: enabled }),
  setAutoRefresh: (enabled) => ({ type: "SET_OFFICE_AUTO_REFRESH", payload: enabled }),
  setLoading: (loading) => ({ type: "SET_OFFICE_LOADING", payload: loading }),
  setTableLoading: (loading) => ({ type: "SET_OFFICE_TABLE_LOADING", payload: loading }),
  setError: (error) => ({ type: "SET_OFFICE_ERROR", payload: error }),
  clearError: () => ({ type: "CLEAR_OFFICE_ERROR" }),
  setSuccess: (success) => ({ type: "SET_OFFICE_SUCCESS", payload: success }),
  clearSuccess: () => ({ type: "CLEAR_OFFICE_SUCCESS" })
};