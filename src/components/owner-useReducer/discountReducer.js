export const initialState = {
  discounts: [],
  discountsMap: new Map(),
  filteredDiscounts: [],
  selectedDiscount: null,

  logs: [],
  filteredLogs: [],
  selectedLog: null,

  error: null,
  loading: false,
  tableLoading: false,
  success: false,

  activeTab: "all-discounts",
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
    active: 0,
    inactive: 0,
    expired: 0
  },

  actionTypeCounts: {
    all: 0,
    ADD: 0,
    EDIT: 0,
    DELETE: 0
  },

  // NEW: Discount conflicts
  discountConflicts: new Map(), // productId -> [discount names]

  lastUpdated: null
};

export const discountReducer = (state, action) => {
  switch (action.type) {

    case "FETCH_DISCOUNTS": {
      const newDiscounts = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;

      const discountsMap = new Map();
      newDiscounts.forEach(discount => discountsMap.set(discount.id, discount));

      // Calculate discount conflicts
      const discountConflicts = new Map();
      newDiscounts.forEach(discount => {
        if (discount.applicableTo === 'selected' && discount.selectedProductIds) {
          discount.selectedProductIds.forEach(productId => {
            if (!discountConflicts.has(productId)) {
              discountConflicts.set(productId, []);
            }
            discountConflicts.get(productId).push(discount.name);
          });
        }
      });

      return {
        ...state,
        discounts: newDiscounts,
        discountsMap,
        discountConflicts,
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

    case "ADD_DISCOUNT": {
      const newDiscount = action.payload.discount;

      const discountsMap = new Map(state.discountsMap);
      discountsMap.set(newDiscount.id, newDiscount);

      const updatedDiscounts = [...state.discounts, newDiscount];

      // Update conflicts
      const discountConflicts = new Map(state.discountConflicts);
      if (newDiscount.applicableTo === 'selected' && newDiscount.selectedProductIds) {
        newDiscount.selectedProductIds.forEach(productId => {
          if (!discountConflicts.has(productId)) {
            discountConflicts.set(productId, []);
          }
          discountConflicts.get(productId).push(newDiscount.name);
        });
      }

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = (statusCounts.all || 0) + 1;
      
      const today = new Date().toISOString().split('T')[0];
      if (newDiscount.status === 'Active' && newDiscount.endDate >= today) {
        statusCounts.active = (statusCounts.active || 0) + 1;
      } else if (newDiscount.status === 'Inactive') {
        statusCounts.inactive = (statusCounts.inactive || 0) + 1;
      } else if (newDiscount.endDate < today) {
        statusCounts.expired = (statusCounts.expired || 0) + 1;
      }

      return {
        ...state,
        discounts: updatedDiscounts,
        discountsMap,
        discountConflicts,
        statusCounts,
        success: true
      };
    }

    case "UPDATE_DISCOUNT": {
      const updatedDiscount = action.payload.discount;

      const discountsMap = new Map(state.discountsMap);
      discountsMap.set(updatedDiscount.id, updatedDiscount);

      const updatedDiscounts = state.discounts.map(d =>
        d.id === updatedDiscount.id ? updatedDiscount : d
      );

      const oldDiscount = state.discountsMap.get(updatedDiscount.id);
      const today = new Date().toISOString().split('T')[0];

      // Update conflicts - remove old product associations, add new ones
      const discountConflicts = new Map(state.discountConflicts);
      
      // Remove old product associations
      if (oldDiscount && oldDiscount.applicableTo === 'selected' && oldDiscount.selectedProductIds) {
        oldDiscount.selectedProductIds.forEach(productId => {
          if (discountConflicts.has(productId)) {
            const updatedList = discountConflicts.get(productId).filter(name => name !== oldDiscount.name);
            if (updatedList.length === 0) {
              discountConflicts.delete(productId);
            } else {
              discountConflicts.set(productId, updatedList);
            }
          }
        });
      }

      // Add new product associations
      if (updatedDiscount.applicableTo === 'selected' && updatedDiscount.selectedProductIds) {
        updatedDiscount.selectedProductIds.forEach(productId => {
          if (!discountConflicts.has(productId)) {
            discountConflicts.set(productId, []);
          }
          if (!discountConflicts.get(productId).includes(updatedDiscount.name)) {
            discountConflicts.get(productId).push(updatedDiscount.name);
          }
        });
      }

      const statusCounts = { ...state.statusCounts };
      
      if (oldDiscount) {
        if (oldDiscount.status === 'Active' && oldDiscount.endDate >= today) {
          statusCounts.active = Math.max(0, (statusCounts.active || 0) - 1);
        } else if (oldDiscount.status === 'Inactive') {
          statusCounts.inactive = Math.max(0, (statusCounts.inactive || 0) - 1);
        } else if (oldDiscount.endDate < today) {
          statusCounts.expired = Math.max(0, (statusCounts.expired || 0) - 1);
        }

        if (updatedDiscount.status === 'Active' && updatedDiscount.endDate >= today) {
          statusCounts.active = (statusCounts.active || 0) + 1;
        } else if (updatedDiscount.status === 'Inactive') {
          statusCounts.inactive = (statusCounts.inactive || 0) + 1;
        } else if (updatedDiscount.endDate < today) {
          statusCounts.expired = (statusCounts.expired || 0) + 1;
        }
      }

      return {
        ...state,
        discounts: updatedDiscounts,
        discountsMap,
        discountConflicts,
        selectedDiscount: state.selectedDiscount?.id === updatedDiscount.id ? updatedDiscount : state.selectedDiscount,
        statusCounts,
        success: true
      };
    }

    case "DELETE_DISCOUNT": {
      const discountId = action.payload.discountId;
      const deletedDiscount = state.discountsMap.get(discountId);

      if (!deletedDiscount) return state;

      const updatedDiscounts = state.discounts.filter(d => d.id !== discountId);
      const updatedFilteredDiscounts = state.filteredDiscounts.filter(d => d.id !== discountId);

      const discountsMap = new Map(state.discountsMap);
      discountsMap.delete(discountId);

      // Update conflicts - remove product associations
      const discountConflicts = new Map(state.discountConflicts);
      if (deletedDiscount.applicableTo === 'selected' && deletedDiscount.selectedProductIds) {
        deletedDiscount.selectedProductIds.forEach(productId => {
          if (discountConflicts.has(productId)) {
            const updatedList = discountConflicts.get(productId).filter(name => name !== deletedDiscount.name);
            if (updatedList.length === 0) {
              discountConflicts.delete(productId);
            } else {
              discountConflicts.set(productId, updatedList);
            }
          }
        });
      }

      const today = new Date().toISOString().split('T')[0];
      const statusCounts = { ...state.statusCounts };
      
      statusCounts.all = Math.max(0, (statusCounts.all || 0) - 1);
      
      if (deletedDiscount.status === 'Active' && deletedDiscount.endDate >= today) {
        statusCounts.active = Math.max(0, (statusCounts.active || 0) - 1);
      } else if (deletedDiscount.status === 'Inactive') {
        statusCounts.inactive = Math.max(0, (statusCounts.inactive || 0) - 1);
      } else if (deletedDiscount.endDate < today) {
        statusCounts.expired = Math.max(0, (statusCounts.expired || 0) - 1);
      }

      return {
        ...state,
        discounts: updatedDiscounts,
        discountsMap,
        discountConflicts,
        filteredDiscounts: updatedFilteredDiscounts,
        statusCounts,
        success: true
      };
    }

    case "FILTER_DISCOUNTS": {
      let filtered = [...state.discounts];

      const today = new Date().toISOString().split('T')[0];

      if (state.activeTab !== "all-discounts" && state.activeTab !== "history") {
        if (state.activeTab === "active") {
          filtered = filtered.filter(d => d.status === "Active" && d.endDate >= today);
        } else if (state.activeTab === "inactive") {
          filtered = filtered.filter(d => d.status === "Inactive");
        } else if (state.activeTab === "expired") {
          filtered = filtered.filter(d => d.status === "Expired" || d.endDate < today);
        }
      }

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(d =>
          d.name?.toLowerCase().includes(query) ||
          d.code?.toLowerCase().includes(query) ||
          d.type?.toLowerCase().includes(query)
        );
      }

      return {
        ...state,
        filteredDiscounts: filtered
      };
    }

    case "FETCH_LOGS": {
      const newLogs = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.logPagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || Math.ceil(totalItems / pageSize) || 1;
      const actionTypeCounts = action.payload.actionTypeCounts || state.actionTypeCounts;

      const processedLogs = newLogs.map(log => ({
        ...log,
        createdByName: log.createdByName || log.createdBy || 'Unknown User',
        createdByRole: log.createdByRole || 'N/A',
        timestamp: log.timestamp || (log.createdAt ? new Date(log.createdAt).toLocaleTimeString() : '')
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
      let filteredLogs = [...state.logs];

      if (state.logFilter !== "all") {
        filteredLogs = filteredLogs.filter(log => log.actionType === state.logFilter.toUpperCase());
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

    case "SET_SELECTED_LOG": {
      const selectedLog = action.payload ? {
        ...action.payload,
        createdByName: action.payload.createdByName || 'Unknown User',
        createdByRole: action.payload.createdByRole || 'N/A'
      } : null;
      return { ...state, selectedLog };
    }

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload, pagination: { ...state.pagination, page: 1 } };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, pagination: { ...state.pagination, page: 1 } };

    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, pagination: { ...state.pagination, page: 1 } };

    case "SET_PAGINATION":
      return { ...state, pagination: { ...state.pagination, ...action.payload } };

    case "SET_LOG_PAGINATION":
      return { ...state, logPagination: { ...state.logPagination, ...action.payload } };

    case "SET_DATE_FILTER":
      return { ...state, dateFilter: { ...state.dateFilter, ...action.payload }, logPagination: { ...state.logPagination, page: 1 } };

    case "SET_LOG_FILTER":
      return { ...state, logFilter: action.payload, logPagination: { ...state.logPagination, page: 1 } };

    case "SET_ERROR":
      return { ...state, error: action.payload, loading: false, tableLoading: false, success: false };

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