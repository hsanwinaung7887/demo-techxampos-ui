export const initialState = {
  // Damages
  damages: [],                    // Current page damages
  damagesMap: new Map(),           // ID by Damage map
  filteredDamages: [],             // Filtered damages
  selectedDamage: null,

  // Logs
  logs: [],                      // Current page logs
  filteredLogs: [],              // Filtered logs
  selectedLog: null,

  // Error & Loading
  error: null,
  loading: false,
  tableLoading: false,
  success: false,

  // UI States
  activeTab: "all-damages",        // all-damages, history
  searchQuery: "",
  damageTypeFilter: "all",         // for damage type filter

  // Pagination
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false
  },

  // Log Pagination
  logPagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false
  },

  // Log Filters
  logFilter: "all",
  dateFilter: {
    filter: "all",
    customFrom: "",
    customTo: ""
  },

  // Summary Stats
  summary: {
    totalDamages: 0,
    totalLoss: 0
  },

  // Damage type counts
  damageTypeCounts: {},

  // Log action type counts
  actionTypeCounts: {
    all: 0,
    ADD_DAMAGE: 0,
    UPDATE_DAMAGE: 0,
    DELETE_DAMAGE: 0
  },

  lastUpdated: null
};

export const damageReducer = (state, action) => {
  switch (action.type) {

    // ===== FETCH DAMAGES =====
    case "FETCH_DAMAGES": {
      const newDamages = action.payload.damages || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const summary = action.payload.summary || state.summary;
      const damageTypeCounts = action.payload.damageTypeCounts || state.damageTypeCounts;

      const damagesMap = new Map();
      newDamages.forEach(damage => damagesMap.set(damage.id, damage));

      return {
        ...state,
        damages: newDamages,
        damagesMap,
        pagination: {
          ...state.pagination,
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        summary,
        damageTypeCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    // ===== ADD DAMAGE =====
    case "ADD_DAMAGE": {
      const newDamage = action.payload.damage;

      const damagesMap = new Map(state.damagesMap);
      damagesMap.set(newDamage.id, newDamage);

      const updatedDamages = [...state.damages, newDamage];

      const updatedSummary = {
        ...state.summary,
        totalDamages: (state.summary.totalDamages || 0) + 1,
        totalLoss: (state.summary.totalLoss || 0) + (newDamage.lossValue || 0)
      };

      return {
        ...state,
        damages: updatedDamages,
        damagesMap,
        summary: updatedSummary,
        success: true
      };
    }

    // ===== UPDATE DAMAGE =====
    case "UPDATE_DAMAGE": {
      const updatedDamage = action.payload.damage;

      const damagesMap = new Map(state.damagesMap);
      damagesMap.set(updatedDamage.id, updatedDamage);

      const updatedDamages = state.damages.map(d =>
        d.id === updatedDamage.id ? updatedDamage : d
      );

      const oldDamage = state.damagesMap.get(updatedDamage.id);

      // Update summary if loss value changed
      let updatedSummary = { ...state.summary };
      if (oldDamage && oldDamage.lossValue !== updatedDamage.lossValue) {
        updatedSummary.totalLoss = (updatedSummary.totalLoss || 0) - (oldDamage.lossValue || 0) + (updatedDamage.lossValue || 0);
      }

      return {
        ...state,
        damages: updatedDamages,
        damagesMap,
        selectedDamage: state.selectedDamage?.id === updatedDamage.id ? updatedDamage : state.selectedDamage,
        summary: updatedSummary,
        success: true
      };
    }

    // ===== DELETE DAMAGE =====
    case "DELETE_DAMAGE": {
      const damageId = action.payload.damageId;
      const deletedDamage = state.damagesMap.get(damageId);

      if (!deletedDamage) return state;

      const updatedDamages = state.damages.filter(d => d.id !== damageId);
      const updatedFilteredDamages = state.filteredDamages.filter(d => d.id !== damageId);

      const damagesMap = new Map(state.damagesMap);
      damagesMap.delete(damageId);

      // Update summary
      const updatedSummary = {
        ...state.summary,
        totalDamages: Math.max(0, (state.summary.totalDamages || 0) - 1),
        totalLoss: Math.max(0, (state.summary.totalLoss || 0) - (deletedDamage.lossValue || 0))
      };

      return {
        ...state,
        damages: updatedDamages,
        damagesMap,
        filteredDamages: updatedFilteredDamages,
        summary: updatedSummary,
        success: true
      };
    }

    // ===== FILTER DAMAGES =====
    case "FILTER_DAMAGES": {
      let filtered = [...state.damages];

      if (state.damageTypeFilter !== "all") {
        filtered = filtered.filter(d => d.damageType === state.damageTypeFilter);
      }

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(d =>
          d.productName?.toLowerCase().includes(query) ||
          d.barcode?.toLowerCase().includes(query) ||
          d.warehouseSection?.toLowerCase().includes(query)
        );
      }

      return {
        ...state,
        filteredDamages: filtered
      };
    }

    // ===== FETCH LOGS =====
    case "FETCH_LOGS": {
      const newLogs = action.payload.logs || [];
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

    // ===== FILTER LOGS =====
    case "FILTER_LOGS": {
      let filteredLogs = [...state.logs];

      if (state.logFilter !== "all") {
        filteredLogs = filteredLogs.filter(log => log.actionType === state.logFilter);
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

        filteredLogs = filteredLogs.filter(log => {
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

      filteredLogs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      filteredLogs = filteredLogs.map(log => ({
        ...log,
        createdByName: log.createdByName || 'Unknown User',
        createdByRole: log.createdByRole || 'N/A'
      }));

      return {
        ...state,
        filteredLogs
      };
    }

    // ===== SET SELECTED LOG =====
    case "SET_SELECTED_LOG": {
      const selectedLog = action.payload ? {
        ...action.payload,
        createdByName: action.payload.createdByName || 'Unknown User',
        createdByRole: action.payload.createdByRole || 'N/A'
      } : null;
      return { ...state, selectedLog };
    }

    // ===== SET ACTIVE TAB =====
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload, pagination: { ...state.pagination, page: 1 } };

    // ===== SET SEARCH QUERY =====
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, pagination: { ...state.pagination, page: 1 } };

    // ===== SET DAMAGE TYPE FILTER =====
    case "SET_DAMAGE_TYPE_FILTER":
      return { ...state, damageTypeFilter: action.payload, pagination: { ...state.pagination, page: 1 } };

    // ===== SET PAGINATION =====
    case "SET_PAGINATION":
      return { ...state, pagination: { ...state.pagination, ...action.payload } };

    // ===== SET LOG PAGINATION =====
    case "SET_LOG_PAGINATION":
      return { ...state, logPagination: { ...state.logPagination, ...action.payload } };

    // ===== SET DATE FILTER =====
    case "SET_DATE_FILTER":
      return { ...state, dateFilter: { ...state.dateFilter, ...action.payload }, logPagination: { ...state.logPagination, page: 1 } };

    // ===== SET LOG FILTER =====
    case "SET_LOG_FILTER":
      return { ...state, logFilter: action.payload, logPagination: { ...state.logPagination, page: 1 } };

    // ===== SET ERROR =====
    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false, tableLoading: false, success: false };

    // ===== CLEAR ERROR =====
    case "CLEAR_ERROR":
      return { ...state, error: null };

    // ===== SET LOADING =====
    case "SET_LOADING":
      return { ...state, loading: action.payload };

    // ===== SET TABLE LOADING =====
    case "SET_TABLE_LOADING":
      return { ...state, tableLoading: action.payload };

    // ===== SET SUCCESS =====
    case "SET_SUCCESS":
      return { ...state, success: action.payload, error: null };

    // ===== CLEAR SUCCESS =====
    case "CLEAR_SUCCESS":
      return { ...state, success: false };

    // ===== CLEAR FILTERS =====
    case "CLEAR_FILTERS":
      return {
        ...state,
        searchQuery: "",
        damageTypeFilter: "all",
        dateFilter: { filter: "all", customFrom: "", customTo: "" },
        logFilter: "all",
        pagination: { ...state.pagination, page: 1 },
        logPagination: { ...state.logPagination, page: 1 }
      };

    default:
      return state;
  }
};