// src/owner-useReducer/auditHistoryReducer.js

export const initialAuditHistoryState = {
  historyLogs: [],
  filteredHistoryLogs: [],
  selectedHistoryLog: null,
  loading: false,
  error: null,
  
  // Pagination
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0
  },
  
  // Filters
  filters: {
    search: '',
    actionType: 'all',
    entityType: 'all',
    dateFilter: 'all',
    customFrom: '',
    customTo: ''
  },
  
  // Counts
  actionTypeCounts: {
    all: 0,
    ADD: 0,
    EDIT: 0,
    DELETE: 0,
    LOGIN: 0,
    LOGOUT: 0,
    VIEW: 0,
    EXPORT: 0
  }
};

export const auditHistoryReducer = (state, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
      
    case 'CLEAR_ERROR':
      return { ...state, error: null };
      
    case 'FETCH_HISTORY_SUCCESS':
      return {
        ...state,
        historyLogs: action.payload.data || [],
        filteredHistoryLogs: action.payload.data || [],
        pagination: {
          page: action.payload.currentPage || 1,
          size: action.payload.pageSize || 10,
          total: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 1
        },
        actionTypeCounts: action.payload.actionTypeCounts || state.actionTypeCounts,
        loading: false,
        error: null
      };
      
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
        pagination: { ...state.pagination, page: 1 }
      };
      
    case 'SET_PAGINATION':
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };
      
    case 'SET_SELECTED_LOG':
      return { ...state, selectedHistoryLog: action.payload };
      
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialAuditHistoryState.filters,
        pagination: { ...state.pagination, page: 1 }
      };
      
    case 'APPLY_FILTERS': {
      let filtered = [...state.historyLogs];
      const { search, actionType, entityType, dateFilter, customFrom, customTo } = state.filters;
      
      if (search) {
        const query = search.toLowerCase();
        filtered = filtered.filter(log =>
          log.username?.toLowerCase().includes(query) ||
          log.actionType?.toLowerCase().includes(query) ||
          log.entityName?.toLowerCase().includes(query) ||
          log.description?.toLowerCase().includes(query)
        );
      }
      
      if (actionType !== 'all') {
        filtered = filtered.filter(log => log.actionType === actionType);
      }
      
      if (entityType !== 'all') {
        filtered = filtered.filter(log => log.entityType === entityType);
      }
      
      if (dateFilter !== 'all') {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        filtered = filtered.filter(log => {
          if (!log.createdAt) return true;
          const logDate = new Date(log.createdAt);
          
          switch (dateFilter) {
            case 'today': return logDate >= today;
            case 'yesterday':
              const yesterday = new Date(today);
              yesterday.setDate(yesterday.getDate() - 1);
              return logDate >= yesterday && logDate < today;
            case 'thisWeek':
              const weekAgo = new Date(today);
              weekAgo.setDate(weekAgo.getDate() - 7);
              return logDate >= weekAgo;
            case 'thisMonth':
              const monthAgo = new Date(today);
              monthAgo.setMonth(monthAgo.getMonth() - 1);
              return logDate >= monthAgo;
            case 'custom':
              if (customFrom && customTo) {
                const from = new Date(customFrom);
                const to = new Date(customTo);
                to.setHours(23, 59, 59, 999);
                return logDate >= from && logDate <= to;
              }
              return true;
            default: return true;
          }
        });
      }
      
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return { ...state, filteredHistoryLogs: filtered };
    }
    
    default:
      return state;
  }
};