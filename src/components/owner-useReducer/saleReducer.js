export const initialState = {
  // Sales
  sales: [],
  salesMap: new Map(),
  filteredSales: [],
  selectedSale: null,

  // Held Carts
  heldCarts: [],
  heldCartsMap: new Map(),

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
  activeTab: "all-sales", // all-sales, completed, held, void, history
  searchQuery: "",
  statusFilter: "all",

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

  // Status counts
  statusCounts: {
    all: 0,
    completed: 0,
    held: 0,
    void: 0
  },

  // Log action type counts
  actionTypeCounts: {
    all: 0,
    COMPLETE: 0,
    HOLD: 0,
    CONTINUE: 0,
    DELETE: 0,
    VOID: 0
  },

  lastUpdated: null
};

export const saleReducer = (state, action) => {
  switch (action.type) {

    case "FETCH_SALES": {
      const newSales = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;

      const salesMap = new Map();
      newSales.forEach(sale => salesMap.set(sale.id, sale));

      return {
        ...state,
        sales: newSales,
        salesMap,
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

    case "FETCH_HELD_CARTS": {
      const newHeldCarts = action.payload.data || [];

      const heldCartsMap = new Map();
      newHeldCarts.forEach(cart => heldCartsMap.set(cart.id, cart));

      return {
        ...state,
        heldCarts: newHeldCarts,
        heldCartsMap
      };
    }

    case "ADD_SALE": {
      const newSale = action.payload.sale;

      const salesMap = new Map(state.salesMap);
      salesMap.set(newSale.id, newSale);

      const updatedSales = [...state.sales, newSale];

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = (statusCounts.all || 0) + 1;
      statusCounts[newSale.status] = (statusCounts[newSale.status] || 0) + 1;

      return {
        ...state,
        sales: updatedSales,
        salesMap,
        statusCounts,
        success: true
      };
    }

    case "HOLD_CART": {
      const heldCart = action.payload.cart;

      const heldCartsMap = new Map(state.heldCartsMap);
      heldCartsMap.set(heldCart.id, heldCart);

      const updatedHeldCarts = [heldCart, ...state.heldCarts];

      return {
        ...state,
        heldCarts: updatedHeldCarts,
        heldCartsMap,
        success: true
      };
    }

    case "CONTINUE_CART": {
      const cartId = action.payload.cartId;

      const heldCartsMap = new Map(state.heldCartsMap);
      heldCartsMap.delete(cartId);

      const updatedHeldCarts = state.heldCarts.filter(c => c.id !== cartId);

      return {
        ...state,
        heldCarts: updatedHeldCarts,
        heldCartsMap
      };
    }

    case "DELETE_HELD_CART": {
      const cartId = action.payload.cartId;

      const heldCartsMap = new Map(state.heldCartsMap);
      heldCartsMap.delete(cartId);

      const updatedHeldCarts = state.heldCarts.filter(c => c.id !== cartId);

      return {
        ...state,
        heldCarts: updatedHeldCarts,
        heldCartsMap,
        success: true
      };
    }

    case "FILTER_SALES": {
      let filtered = [...state.sales];

      if (state.activeTab !== "all-sales" && state.activeTab !== "history") {
        filtered = filtered.filter(s => s.status === state.activeTab);
      }

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(s =>
          s.invoiceNo?.toLowerCase().includes(query) ||
          s.customerName?.toLowerCase().includes(query) ||
          s.customerPhone?.toLowerCase().includes(query)
        );
      }

      return {
        ...state,
        filteredSales: filtered
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