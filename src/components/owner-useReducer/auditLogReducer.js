// src/reducers/auditLogReducer.js

export const initialAuditLogState = {
  // Data
  auditLogs: [],
  filteredLogs: [],
  selectedLog: null,
  
  // Pagination
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  },
  
  // Filters
  filters: {
    search: '',
    userType: 'all',
    action: 'all',
    severity: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  },
  
  // Statistics
  statistics: {
    totalLogs: 0,
    todayLogs: 0,
    criticalLogs: 0,
    failedActions: 0,
    uniqueUsers: 0,
    uniqueIPs: 0
  },
  
  // Summary stats from API
  summary: {
    criticalCount24h: 0,
    totalFiltered: 0,
    severityCounts: {},
    statusCounts: {},
    actionCounts: {}
  },
  
  // UI States
  loading: false,
  tableLoading: false,
  error: null,
  success: false,
  
  // Real-time mode
  realTimeMode: false,
  autoRefresh: false,
  
  lastUpdated: null
};

export const auditLogReducer = (state, action) => {
  switch (action.type) {
    
    // ===== FETCH AUDIT LOGS =====
    case "FETCH_AUDIT_LOGS_START":
      return {
        ...state,
        tableLoading: true,
        error: null
      };
      
    case "FETCH_AUDIT_LOGS_SUCCESS": {
      const { data } = action.payload;
      const auditLogs = data.data || [];
      const currentPage = data.currentPage || 1;
      const pageSize = data.pageSize || state.pagination.size;
      const totalItems = data.totalItems || 0;
      const totalPages = data.totalPages || 1;
      const summary = data.summary || state.summary;
      
      // Process logs for display
      const processedLogs = auditLogs.map(log => ({
        ...log,
        id: log.logId || log.id,
        timestamp: log.createdAt ? new Date(log.createdAt).toLocaleString() : '',
        date: log.createdAt ? new Date(log.createdAt).toLocaleDateString() : '',
        time: log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : '',
        device: `${log.browser || 'Unknown'} on ${log.os || 'Unknown'}`,
        location: log.location || 'Unknown Location',
        userType: log.userType || 'Unknown',
        actionType: log.actionType || 'SYSTEM'
      }));
      
      // Build statistics from logs
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
        summary: {
          ...summary,
          severityCounts: data.severityCounts || {},
          statusCounts: data.statusCounts || {},
          actionCounts: data.actionCounts || {}
        },
        statistics: {
          totalLogs: totalItems,
          todayLogs: todayLogs.length,
          criticalLogs: criticalLogs.length,
          failedActions: failedActions.length,
          uniqueUsers: uniqueUsers.length,
          uniqueIPs: uniqueIPs.length
        },
        tableLoading: false,
        lastUpdated: new Date().toISOString()
      };
    }
    
    case "FETCH_AUDIT_LOGS_FAILURE":
      return {
        ...state,
        tableLoading: false,
        error: action.payload.error
      };
      
    // ===== FETCH STATISTICS =====
    case "FETCH_STATS_SUCCESS": {
      const { data } = action.payload;
      return {
        ...state,
        statistics: {
          ...state.statistics,
          totalLogs: data.totalToday || state.statistics.totalLogs,
          todayLogs: data.totalToday || 0,
          criticalLogs: data.criticalToday || 0,
          failedActions: data.failedLoginsToday || 0,
          uniqueIPs: data.uniqueIpsToday || 0
        }
      };
    }
    
    // ===== FILTER LOGS =====
    case "SET_FILTERS":
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
      
    case "CLEAR_FILTERS":
      return {
        ...state,
        filters: initialAuditLogState.filters,
        pagination: { ...state.pagination, page: 1 }
      };
      
    // ===== FILTER LOCALLY =====
    case "APPLY_LOCAL_FILTERS": {
      let filtered = [...state.auditLogs];
      const { filters } = state;
      
      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filtered = filtered.filter(log =>
          (log.username || '').toLowerCase().includes(searchLower) ||
          (log.description || '').toLowerCase().includes(searchLower) ||
          (log.ipAddress || '').includes(searchLower) ||
          (log.entityId || '').toLowerCase().includes(searchLower)
        );
      }
      
      // User type filter
      if (filters.userType !== 'all') {
        filtered = filtered.filter(log => log.userType === filters.userType);
      }
      
      // Severity filter
      if (filters.severity !== 'all') {
        filtered = filtered.filter(log => log.severity === filters.severity);
      }
      
      // Status filter
      if (filters.status !== 'all') {
        filtered = filtered.filter(log => log.status === filters.status);
      }
      
      // Date range filter
      if (filters.dateFrom) {
        filtered = filtered.filter(log => {
          const logDate = log.createdAt?.split('T')[0];
          return logDate >= filters.dateFrom;
        });
      }
      
      if (filters.dateTo) {
        filtered = filtered.filter(log => {
          const logDate = log.createdAt?.split('T')[0];
          return logDate <= filters.dateTo;
        });
      }
      
      return {
        ...state,
        filteredLogs: filtered
      };
    }
    
    // ===== PAGINATION =====
    case "SET_PAGE":
      return {
        ...state,
        pagination: { ...state.pagination, page: action.payload }
      };
      
    case "SET_PAGE_SIZE":
      return {
        ...state,
        pagination: { ...state.pagination, size: action.payload, page: 1 }
      };
      
    // ===== SELECT LOG =====
    case "SET_SELECTED_LOG":
      return {
        ...state,
        selectedLog: action.payload
      };
      
    // ===== REAL-TIME MODE =====
    case "SET_REAL_TIME_MODE":
      return {
        ...state,
        realTimeMode: action.payload
      };
      
    case "SET_AUTO_REFRESH":
      return {
        ...state,
        autoRefresh: action.payload
      };
      
    // ===== ADD MOCK LOG (for real-time demo) =====
    case "ADD_MOCK_LOG": {
      const newLog = {
        ...action.payload,
        id: `mock_${Date.now()}`,
        timestamp: new Date().toLocaleString(),
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };
      const updatedLogs = [newLog, ...state.auditLogs];
      return {
        ...state,
        auditLogs: updatedLogs,
        filteredLogs: updatedLogs
      };
    }
    
    // ===== UI STATES =====
    case "SET_LOADING":
      return { ...state, loading: action.payload };
      
    case "SET_TABLE_LOADING":
      return { ...state, tableLoading: action.payload };
      
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false, tableLoading: false };
      
    case "CLEAR_ERROR":
      return { ...state, error: null };
      
    case "SET_SUCCESS":
      return { ...state, success: action.payload };
      
    case "CLEAR_SUCCESS":
      return { ...state, success: false };
      
    default:
      return state;
  }
};

// Action creators
export const auditLogActions = {
  fetchLogsStart: () => ({ type: "FETCH_AUDIT_LOGS_START" }),
  fetchLogsSuccess: (data) => ({ type: "FETCH_AUDIT_LOGS_SUCCESS", payload: { data } }),
  fetchLogsFailure: (error) => ({ type: "FETCH_AUDIT_LOGS_FAILURE", payload: { error } }),
  
  fetchStatsSuccess: (data) => ({ type: "FETCH_STATS_SUCCESS", payload: { data } }),
  
  setFilters: (filters) => ({ type: "SET_FILTERS", payload: filters }),
  clearFilters: () => ({ type: "CLEAR_FILTERS" }),
  applyLocalFilters: () => ({ type: "APPLY_LOCAL_FILTERS" }),
  
  setPage: (page) => ({ type: "SET_PAGE", payload: page }),
  setPageSize: (size) => ({ type: "SET_PAGE_SIZE", payload: size }),
  
  setSelectedLog: (log) => ({ type: "SET_SELECTED_LOG", payload: log }),
  
  setRealTimeMode: (enabled) => ({ type: "SET_REAL_TIME_MODE", payload: enabled }),
  setAutoRefresh: (enabled) => ({ type: "SET_AUTO_REFRESH", payload: enabled }),
  
  addMockLog: (log) => ({ type: "ADD_MOCK_LOG", payload: log }),
  
  setLoading: (loading) => ({ type: "SET_LOADING", payload: loading }),
  setTableLoading: (loading) => ({ type: "SET_TABLE_LOADING", payload: loading }),
  setError: (error) => ({ type: "SET_ERROR", payload: error }),
  clearError: () => ({ type: "CLEAR_ERROR" }),
  setSuccess: (success) => ({ type: "SET_SUCCESS", payload: success }),
  clearSuccess: () => ({ type: "CLEAR_SUCCESS" })
};