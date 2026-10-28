// 📁 src/components/office/useReducer/shopPlanReducer.js

export const initialState = {
  // Plans
  plans: [],                    // Current page plans
  plansMap: new Map(),           // ID by Plan map
  filteredPlans: [],             // Filtered plans
  selectedPlan: null,
  
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
  activeTab: "all-plans",        // all-plans, active, inactive, history
  searchQuery: "",
  levelFilter: "all",
  
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
    total: 0,
    active: 0,
    inactive: 0,
    filteredTotal: 0,
    logSummary: {
      total: 0,
      add: 0,
      edit: 0,
      delete: 0,
      today: 0
    }
  },

  // Level counts
  levelCounts: {
    all: 0,
    BASIC: 0,
    STANDARD: 0,
    PREMIUM: 0,
    ENTERPRISE: 0
  },
  
  // Status counts
  statusCounts: {
    Active: 0,
    Inactive: 0
  },
  
  // Log action type counts
  actionTypeCounts: {
    all: 0,
    ADD: 0,
    EDIT: 0,
    DELETE: 0
  },

  // Dropdown Data
  dropdownData: {
    levels: [
      { value: "BASIC", label: "Basic" },
      { value: "STANDARD", label: "Standard" },
      { value: "PREMIUM", label: "Premium" },
      { value: "ENTERPRISE", label: "Enterprise" }
    ],
    billingCycles: [
      { value: "MONTHLY", label: "Monthly" },
      { value: "YEARLY", label: "Yearly" },
      { value: "QUARTERLY", label: "Quarterly" },
      { value: "LIFETIME", label: "Lifetime" },
      { value: "ONETIME", label: "One Time" }
    ],
    currencies: [
      { value: "MMK", label: "MMK" },
      { value: "USD", label: "USD" }
    ]
  },
  
  lastUpdated: null
};

export const shopPlanReducer = (state, action) => {
  switch (action.type) {
    
    // ===== FETCH PLANS =====
    case "FETCH_PLANS": {
      const newPlans = action.payload.plans || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const levelCounts = action.payload.levelCounts || state.levelCounts;
      const statusCounts = action.payload.statusCounts || state.statusCounts;
      
      const plansMap = new Map();
      newPlans.forEach(plan => plansMap.set(plan.id, plan));
      
      return {
        ...state,
        plans: newPlans,
        plansMap,
        pagination: {
          ...state.pagination,
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        summary: {
          ...state.summary,
          total: levelCounts.all || totalItems,
          active: statusCounts.Active || 0,
          inactive: statusCounts.Inactive || 0,
          filteredTotal: totalItems
        },
        levelCounts,
        statusCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    // ===== ADD PLAN =====
    case "ADD_PLAN": {
      const newPlan = action.payload.plan;
      
      const plansMap = new Map(state.plansMap);
      plansMap.set(newPlan.id, newPlan);
      
      const updatedPlans = [...state.plans, newPlan];
      
      const levelCounts = { ...state.levelCounts };
      levelCounts.all = (levelCounts.all || 0) + 1;
      levelCounts[newPlan.level] = (levelCounts[newPlan.level] || 0) + 1;
      
      const statusCounts = { ...state.statusCounts };
      statusCounts[newPlan.status] = (statusCounts[newPlan.status] || 0) + 1;
      
      return {
        ...state,
        plans: updatedPlans,
        plansMap,
        levelCounts,
        statusCounts,
        success: true
      };
    }

    // ===== UPDATE PLAN =====
    case "UPDATE_PLAN": {
      const updatedPlan = action.payload.plan;
      
      const plansMap = new Map(state.plansMap);
      plansMap.set(updatedPlan.id, updatedPlan);
      
      const updatedPlans = state.plans.map(p => 
        p.id === updatedPlan.id ? updatedPlan : p
      );
      
      const oldPlan = state.plansMap.get(updatedPlan.id);
      
      const levelCounts = { ...state.levelCounts };
      if (oldPlan && oldPlan.level !== updatedPlan.level) {
        levelCounts[oldPlan.level] = Math.max(0, (levelCounts[oldPlan.level] || 0) - 1);
        levelCounts[updatedPlan.level] = (levelCounts[updatedPlan.level] || 0) + 1;
      }
      
      const statusCounts = { ...state.statusCounts };
      if (oldPlan && oldPlan.status !== updatedPlan.status) {
        statusCounts[oldPlan.status] = Math.max(0, (statusCounts[oldPlan.status] || 0) - 1);
        statusCounts[updatedPlan.status] = (statusCounts[updatedPlan.status] || 0) + 1;
      }
      
      return {
        ...state,
        plans: updatedPlans,
        plansMap,
        selectedPlan: state.selectedPlan?.id === updatedPlan.id ? updatedPlan : state.selectedPlan,
        levelCounts,
        statusCounts,
        success: true
      };
    }

    // ===== DELETE PLAN (SOFT DELETE) =====
    case "DELETE_PLAN": {
      const planId = action.payload.planId;
      const deletedPlan = state.plansMap.get(planId);
      
      if (!deletedPlan) return state;
      
      const updatedPlans = state.plans.filter(p => p.id !== planId);
      const updatedFilteredPlans = state.filteredPlans.filter(p => p.id !== planId);
      
      const plansMap = new Map(state.plansMap);
      plansMap.delete(planId);
      
      const levelCounts = { ...state.levelCounts };
      levelCounts.all = Math.max(0, (levelCounts.all || 0) - 1);
      levelCounts[deletedPlan.level] = Math.max(0, (levelCounts[deletedPlan.level] || 0) - 1);
      
      const statusCounts = { ...state.statusCounts };
      statusCounts[deletedPlan.status] = Math.max(0, (statusCounts[deletedPlan.status] || 0) - 1);
      
      return {
        ...state,
        plans: updatedPlans,
        plansMap,
        filteredPlans: updatedFilteredPlans,
        levelCounts,
        statusCounts,
        success: true
      };
    }

    // ===== FILTER PLANS =====
    case "FILTER_PLANS": {
      let filtered = [...state.plans];

      if (state.activeTab === "active") {
        filtered = filtered.filter(p => p.status === "Active");
      } else if (state.activeTab === "inactive") {
        filtered = filtered.filter(p => p.status === "Inactive");
      }

      if (state.levelFilter !== "all") {
        filtered = filtered.filter(p => p.level === state.levelFilter);
      }

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(p => 
          p.planCode?.toLowerCase().includes(query) ||
          p.name?.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query) ||
          p.level?.toLowerCase().includes(query)
        );
      }

      return {
        ...state,
        filteredPlans: filtered
      };
    }

    // ===== FETCH LOGS =====
    // ===== FETCH LOGS =====
    case "FETCH_LOGS": {
      const newLogs = action.payload.logs || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.logPagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || Math.ceil(totalItems / pageSize) || 1;
      const actionTypeCounts = action.payload.actionTypeCounts || state.actionTypeCounts;
      
      // FIXED: Process logs to ensure createdByName and createdByRole exist
      const processedLogs = newLogs.map(log => ({
        ...log,
        createdByName: log.createdByName || log.createdBy || 'Unknown User',
        createdByRole: log.createdByRole || 'N/A',
        // Ensure timestamp exists
        timestamp: log.timestamp || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : '')
      }));
      
      if (processedLogs.length > 0) {
        console.log("🔄 First processed log");
      }
      
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

    // ===== SET SELECTED LOG =====
    case "SET_SELECTED_LOG": {
      // FIXED: Ensure selected log has all required fields
      const selectedLog = action.payload ? {
        ...action.payload,
        createdByName: action.payload.createdByName || action.payload.createdBy || 'Unknown User',
        createdByRole: action.payload.createdByRole || 'N/A',
        date: action.payload.date || (action.payload.createdAt ? new Date(action.payload.createdAt).toLocaleDateString() : ''),
        timestamp: action.payload.timestamp || (action.payload.createdAt ? new Date(action.payload.createdAt).toLocaleTimeString() : '')
      } : null;
      
      return { 
        ...state, 
        selectedLog 
      };
    }

    // ===== FIXED: FILTER LOGS with proper date filtering and user info preservation =====
    case "FILTER_LOGS": {
      let filteredLogs = [...state.logs];

      // Filter by action type
      if (state.logFilter !== "all") {
        filteredLogs = filteredLogs.filter(log => log.actionType === state.logFilter);
      }

      // Filter by date
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
            case "today":
              return logDate >= today;
            case "yesterday":
              return logDate >= yesterday && logDate < today;
            case "thisWeek":
              return logDate >= weekAgo;
            case "thisMonth":
              return logDate >= monthAgo;
            case "custom":
              if (state.dateFilter.customFrom && state.dateFilter.customTo) {
                const from = new Date(state.dateFilter.customFrom);
                const to = new Date(state.dateFilter.customTo);
                to.setHours(23, 59, 59, 999);
                return logDate >= from && logDate <= to;
              }
              return true;
            default:
              return true;
          }
        });
      }

      // Sort by createdAt descending (newest first)
      filteredLogs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      // FIXED: Ensure user info is preserved (add fallbacks if missing)
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
      // FIXED: Ensure user info is preserved when setting selected log
      const selectedLog = action.payload ? {
        ...action.payload,
        createdByName: action.payload.createdByName || 'Unknown User',
        createdByRole: action.payload.createdByRole || 'N/A'
      } : null;
      
      return { 
        ...state, 
        selectedLog 
      };
    }

    // ===== SET ACTIVE TAB =====
    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };

    // ===== SET SEARCH QUERY =====
    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };

    // ===== SET LEVEL FILTER =====
    case "SET_LEVEL_FILTER":
      return {
        ...state,
        levelFilter: action.payload,
        pagination: { ...state.pagination, page: 1 }
      };

    // ===== SET PAGINATION =====
    case "SET_PAGINATION":
      return {
        ...state,
        pagination: { ...state.pagination, ...action.payload }
      };

    // ===== SET LOG PAGINATION =====
    case "SET_LOG_PAGINATION":
      return {
        ...state,
        logPagination: { ...state.logPagination, ...action.payload }
      };

    // ===== SET DATE FILTER =====
    case "SET_DATE_FILTER":
      return {
        ...state,
        dateFilter: { ...state.dateFilter, ...action.payload },
        logPagination: { ...state.logPagination, page: 1 }
      };

    // ===== SET LOG FILTER =====
    case "SET_LOG_FILTER":
      return {
        ...state,
        logFilter: action.payload,
        logPagination: { ...state.logPagination, page: 1 }
      };

    // ===== SET ERROR =====
    case "SET_ERROR":
      return { 
        ...state, 
        error: action.payload,
        loading: false,
        tableLoading: false,
        success: false
      };

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
        levelFilter: "all",
        dateFilter: { filter: "all", customFrom: "", customTo: "" },
        logFilter: "all",
        pagination: { ...state.pagination, page: 1 },
        logPagination: { ...state.logPagination, page: 1 }
      };

    default:
      return state;
  }
};