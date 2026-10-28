// 📁 src/components/owner/useReducer/shopReducer.js

export const initialState = {
  // Shops
  shops: [],
  shopsMap: new Map(),
  filteredShops: [],
  selectedShop: null,

  // Logs
  logs: [],
  filteredLogs: [],
  selectedLog: null,

  // Error & Loading
  error: null,
  loading: false,
  tableLoading: false,
  success: false,

  // UI States
  activeTab: "all-shops", // all-shops, active, unactive, history
  searchQuery: "",
  searchField: "all",

  // Pagination for shops
  pagination: {
    page: 1,
    size: 10,
    total: 0,
    totalPages: 0,
    hasMore: false,
    hasPrevious: false
  },

  // Pagination for logs
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
    unactive: 0,
    filteredTotal: 0,
    logSummary: {
      total: 0,
      add: 0,
      edit: 0,
      delete: 0,
      today: 0
    }
  },

  // Status counts
  statusCounts: {
    Active: 0,
    Unactive: 0
  },

  // Shop type counts
  shopTypeCounts: {},

  // Log action type counts
  actionTypeCounts: {
    all: 0,
    ADD: 0,
    EDIT: 0,
    DELETE: 0
  },

  // Dropdown Data
  dropdownData: {
    shopTypes: [
      { value: "RETAIL", label: "Retail" },
      { value: "WHOLESALE", label: "Wholesale" },
      { value: "SERVICE", label: "Service" },
      { value: "FOOD", label: "Food & Beverage" },
      { value: "FASHION", label: "Fashion" },
      { value: "ELECTRONICS", label: "Electronics" },
      { value: "OTHER", label: "Other" }
    ]
  },

  lastUpdated: null
};

export const shopReducer = (state, action) => {
  switch (action.type) {

    // ===== FETCH SHOPS =====
    case "FETCH_SHOPS": {
      const newShops = action.payload.shops || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;
      const shopTypeCounts = action.payload.shopTypeCounts || state.shopTypeCounts;

      const shopsMap = new Map();
      newShops.forEach(shop => shopsMap.set(shop.id, shop));

      return {
        ...state,
        shops: newShops,
        shopsMap,
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
          total: totalItems,
          active: statusCounts.Active || 0,
          unactive: statusCounts.Unactive || 0,
          filteredTotal: totalItems
        },
        statusCounts,
        shopTypeCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    // ===== ADD SHOP =====
    case "ADD_SHOP": {
      const newShop = action.payload.shop;
      const shopsMap = new Map(state.shopsMap);
      shopsMap.set(newShop.id, newShop);
      const updatedShops = [...state.shops, newShop];

      const statusCounts = { ...state.statusCounts };
      statusCounts[newShop.status] = (statusCounts[newShop.status] || 0) + 1;

      return {
        ...state,
        shops: updatedShops,
        shopsMap,
        statusCounts,
        success: true
      };
    }

    // ===== UPDATE SHOP =====
    case "UPDATE_SHOP": {
      const updatedShop = action.payload.shop;
      const shopsMap = new Map(state.shopsMap);
      shopsMap.set(updatedShop.id, updatedShop);
      const updatedShops = state.shops.map(s => s.id === updatedShop.id ? updatedShop : s);

      const oldShop = state.shopsMap.get(updatedShop.id);
      const statusCounts = { ...state.statusCounts };
      if (oldShop && oldShop.status !== updatedShop.status) {
        statusCounts[oldShop.status] = Math.max(0, (statusCounts[oldShop.status] || 0) - 1);
        statusCounts[updatedShop.status] = (statusCounts[updatedShop.status] || 0) + 1;
      }

      return {
        ...state,
        shops: updatedShops,
        shopsMap,
        selectedShop: state.selectedShop?.id === updatedShop.id ? updatedShop : state.selectedShop,
        statusCounts,
        success: true
      };
    }

    // ===== DELETE SHOP (SOFT DELETE) =====
    case "DELETE_SHOP": {
      const shopId = action.payload.shopId;
      const deletedShop = state.shopsMap.get(shopId);
      if (!deletedShop) return state;

      const updatedShops = state.shops.filter(s => s.id !== shopId);
      const updatedFilteredShops = state.filteredShops.filter(s => s.id !== shopId);
      const shopsMap = new Map(state.shopsMap);
      shopsMap.delete(shopId);

      const statusCounts = { ...state.statusCounts };
      statusCounts[deletedShop.status] = Math.max(0, (statusCounts[deletedShop.status] || 0) - 1);

      return {
        ...state,
        shops: updatedShops,
        shopsMap,
        filteredShops: updatedFilteredShops,
        statusCounts,
        success: true
      };
    }

    // ===== FILTER SHOPS =====
    case "FILTER_SHOPS": {
      let filtered = [...state.shops];

      // Filter by status tab
      if (state.activeTab === "active") {
        filtered = filtered.filter(s => s.status === "Active");
      } else if (state.activeTab === "unactive") {
        filtered = filtered.filter(s => s.status === "Unactive");
      }

      // Apply search
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(shop => {
          if (state.searchField === "all") {
            return (
              shop.shopCode?.toLowerCase().includes(query) ||
              shop.name?.toLowerCase().includes(query) ||
              shop.shopType?.toLowerCase().includes(query)
            );
          } else if (state.searchField === "shop_code") {
            return shop.shopCode?.toLowerCase().includes(query);
          } else if (state.searchField === "name") {
            return shop.name?.toLowerCase().includes(query);
          } else if (state.searchField === "shop_type") {
            return shop.shopType?.toLowerCase().includes(query);
          }
          return false;
        });
      }

      return {
        ...state,
        filteredShops: filtered
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

    // ===== FILTER LOGS =====
    case "FILTER_LOGS": {
      let filtered = [...state.logs];

      if (state.logFilter !== "all") {
        filtered = filtered.filter(log => log.actionType === state.logFilter);
      }

      // Date filtering – same logic as plan reducer
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

      // Sort newest first
      filtered.sort((a, b) => (b.createdAt ? new Date(b.createdAt) : 0) - (a.createdAt ? new Date(a.createdAt) : 0));

      filtered = filtered.map(log => ({
        ...log,
        createdByName: log.createdByName || 'Unknown User',
        createdByRole: log.createdByRole || 'N/A'
      }));

      return {
        ...state,
        filteredLogs: filtered
      };
    }

    // ===== SET SELECTED LOG =====
    case "SET_SELECTED_LOG":
      return {
        ...state,
        selectedLog: action.payload ? {
          ...action.payload,
          createdByName: action.payload.createdByName || 'Unknown User',
          createdByRole: action.payload.createdByRole || 'N/A'
        } : null
      };

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

    // ===== SET SEARCH FIELD =====
    case "SET_SEARCH_FIELD":
      return {
        ...state,
        searchField: action.payload,
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
        searchField: "all",
        dateFilter: { filter: "all", customFrom: "", customTo: "" },
        logFilter: "all",
        pagination: { ...state.pagination, page: 1 },
        logPagination: { ...state.logPagination, page: 1 }
      };

    default:
      return state;
  }
};