export const initialState = {
  returns: [],
  returnsMap: new Map(),
  filteredReturns: [],
  selectedReturn: null,

  logs: [],
  filteredLogs: [],
  selectedLog: null,

  error: null,
  loading: false,
  tableLoading: false,
  success: false,

  activeTab: "all-returns",
  searchQuery: "",
  statusFilter: "all",

  pagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false
  },

  logPagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false
  },

  logFilter: "all",
  dateFilter: {
    filter: "all",
    customFrom: "",
    customTo: ""
  },

  statusCounts: {
    all: 0,
    pending: 0,
    processing: 0,
    completed: 0,
    rejected: 0
  },

  actionTypeCounts: {
    all: 0,
    RETURN: 0,
    UPDATE: 0,
    COMPLETE: 0,
    DELETE: 0
  },

  lastUpdated: null
};

export const returnReducer = (state, action) => {
  switch (action.type) {

    case "FETCH_RETURNS": {
      const newReturns = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;

      const returnsMap = new Map();
      newReturns.forEach(ret => returnsMap.set(ret.id, ret));

      return {
        ...state,
        returns: newReturns,
        filteredReturns: newReturns,
        returnsMap,
        pagination: {
          ...state.pagination,
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        statusCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    case "ADD_RETURN": {
      const newReturn = action.payload.return;

      const returnsMap = new Map(state.returnsMap);
      returnsMap.set(newReturn.id, newReturn);

      const updatedReturns = [...state.returns, newReturn];

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = (statusCounts.all || 0) + 1;
      
      const status = newReturn.status?.toLowerCase() || 'pending';
      statusCounts[status] = (statusCounts[status] || 0) + 1;

      return {
        ...state,
        returns: updatedReturns,
        returnsMap,
        statusCounts,
        success: true
      };
    }

    case "UPDATE_RETURN": {
      const updatedReturn = action.payload.return;

      const returnsMap = new Map(state.returnsMap);
      returnsMap.set(updatedReturn.id, updatedReturn);

      const updatedReturns = state.returns.map(r =>
        r.id === updatedReturn.id ? updatedReturn : r
      );

      const oldReturn = state.returnsMap.get(updatedReturn.id);

      const statusCounts = { ...state.statusCounts };
      if (oldReturn && oldReturn.status !== updatedReturn.status) {
        const oldStatus = oldReturn.status?.toLowerCase() || 'pending';
        const newStatus = updatedReturn.status?.toLowerCase() || 'pending';
        
        statusCounts[oldStatus] = Math.max(0, (statusCounts[oldStatus] || 0) - 1);
        statusCounts[newStatus] = (statusCounts[newStatus] || 0) + 1;
      }

      return {
        ...state,
        returns: updatedReturns,
        returnsMap,
        selectedReturn: state.selectedReturn?.id === updatedReturn.id ? updatedReturn : state.selectedReturn,
        statusCounts,
        success: true
      };
    }

    case "DELETE_RETURN": {
      const returnId = action.payload.returnId;
      const deletedReturn = state.returnsMap.get(returnId);

      if (!deletedReturn) return state;

      const updatedReturns = state.returns.filter(r => r.id !== returnId);
      const updatedFilteredReturns = state.filteredReturns.filter(r => r.id !== returnId);

      const returnsMap = new Map(state.returnsMap);
      returnsMap.delete(returnId);

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = Math.max(0, (statusCounts.all || 0) - 1);
      
      const status = deletedReturn.status?.toLowerCase() || 'pending';
      statusCounts[status] = Math.max(0, (statusCounts[status] || 0) - 1);

      return {
        ...state,
        returns: updatedReturns,
        returnsMap,
        filteredReturns: updatedFilteredReturns,
        statusCounts,
        success: true
      };
    }

    case "FILTER_RETURNS": {
    // Server က ပြီးသား filter လုပ်ပြီးသား data တွေကို ပြန်မဆန်းစစ်ပါနဲ့
    // လိုအပ်ရင် search query အတွက် client filter သာ ထားနိုင်တယ်
    let filtered = [...state.returns];

    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase().trim();
      filtered = filtered.filter(r =>
        r.returnNo?.toLowerCase().includes(query) ||
        r.invoiceNo?.toLowerCase().includes(query) ||
        r.customerName?.toLowerCase().includes(query)
      );
    }

    return { ...state, filteredReturns: filtered };
  }

    case "FETCH_LOGS": {
      const newLogs = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.logPagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 1;
      const actionTypeCounts = action.payload.actionTypeCounts || state.actionTypeCounts;

      const processedLogs = newLogs.map(log => ({
        ...log,
        createdByName: log.createdByName || 'Unknown User',
        createdByRole: log.createdByRole || 'N/A',
        timestamp: log.timestamp || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : ''),
        date: log.date || (log.createdAt ? new Date(log.createdAt).toLocaleDateString() : 'Unknown')
      }));

      return {
        ...state,
        logs: processedLogs,
        filteredLogs: processedLogs,
        logPagination: {
          ...state.logPagination,
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        actionTypeCounts
      };
    }

    case "FILTER_LOGS": {
      let filtered = [...state.logs];

      if (state.logFilter !== "all") {
        filtered = filtered.filter(log => log.actionType === state.logFilter.toUpperCase());
      }

      if (state.dateFilter.filter !== "all") {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);

        filtered = filtered.filter(log => {
          if (!log.createdAt) return true;
          const logDate = new Date(log.createdAt);

          switch (state.dateFilter.filter) {
            case "today": return logDate >= today;
            case "yesterday": return logDate >= yesterday && logDate < today;
            case "thisWeek": return logDate >= weekAgo;
            case "thisMonth": return logDate >= monthAgo;
            case "custom":
              if (state.dateFilter.customFrom && state.dateFilter.customTo) {
                const from = new Date(state.dateFilter.customFrom);
                const to = new Date(state.dateFilter.customTo);
                to.setHours(23, 59, 59, 999);
                return logDate >= from && logDate <= to;
              }
              return true;
            default: return true;
          }
        });
      }

      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return { ...state, filteredLogs: filtered };
    }

    case "SET_SELECTED_LOG":
      return { ...state, selectedLog: action.payload };

    case "SET_ACTIVE_TAB":
      return { 
        ...state, 
        activeTab: action.payload, 
        pagination: { ...state.pagination, page: 1 } 
      };

    case "SET_SEARCH_QUERY":
      return { 
        ...state, 
        searchQuery: action.payload, 
        pagination: { ...state.pagination, page: 1 } 
      };

    case "SET_STATUS_FILTER":
      return { 
        ...state, 
        statusFilter: action.payload, 
        pagination: { ...state.pagination, page: 1 } 
      };

    case "SET_PAGINATION":
      return { 
        ...state, 
        pagination: { ...state.pagination, ...action.payload } 
      };

    case "SET_LOG_PAGINATION":
      return { 
        ...state, 
        logPagination: { ...state.logPagination, ...action.payload } 
      };

    case "SET_DATE_FILTER":
      return { 
        ...state, 
        dateFilter: { ...state.dateFilter, ...action.payload }, 
        logPagination: { ...state.logPagination, page: 1 } 
      };

    case "SET_LOG_FILTER":
      return { 
        ...state, 
        logFilter: action.payload, 
        logPagination: { ...state.logPagination, page: 1 } 
      };

    case "SET_ERROR":
      return { 
        ...state, 
        error: action.payload, 
        loading: false, 
        tableLoading: false, 
        success: false 
      };

    case "CLEAR_ERROR":
      return { ...state, error: null };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_TABLE_LOADING":
      return { ...state, tableLoading: action.payload };

    case "SET_SUCCESS":
      return { ...state, success: action.payload, error: null };

    case "CLEAR_SUCCESS":
      return { ...state, success: false };

    case "CLEAR_FILTERS":
      return {
        ...state,
        searchQuery: "",
        statusFilter: "all",
        dateFilter: { filter: "all", customFrom: "", customTo: "" },
        logFilter: "all",
        pagination: { ...state.pagination, page: 1 },
        logPagination: { ...state.logPagination, page: 1 }
      };

    default:
      return state;
  }
};