export const initialState = {
  // Products
  products: [],                    // Current page products
  productsMap: new Map(),           // ID by Product map
  filteredProducts: [],             // Filtered products
  selectedProduct: null,

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
  activeTab: "all-products",        // all-products, active, inactive, history
  searchQuery: "",
  statusFilter: "all",               // for status filter

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

  // Status counts
  statusCounts: {
    all: 0,
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

  lastUpdated: null
};

export const productReducer = (state, action) => {
  switch (action.type) {

    // ===== FETCH PRODUCTS =====
    case "FETCH_PRODUCTS": {
      const newProducts = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || Math.ceil(totalItems / pageSize) || 1;
      const statusCounts = action.payload.statusCounts || state.statusCounts;

      const productsMap = new Map();
      newProducts.forEach(prod => productsMap.set(prod.id, prod));

      return {
        ...state,
        products: newProducts,
        productsMap,
        filteredProducts: newProducts, // ဒါကိုထည့်ပါ
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
          total: statusCounts.all || totalItems,
          active: statusCounts.Active || 0,
          inactive: statusCounts.Inactive || 0,
          filteredTotal: totalItems
        },
        statusCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    // ===== ADD PRODUCT =====
    case "ADD_PRODUCT": {
      const newProduct = action.payload.product;

      const productsMap = new Map(state.productsMap);
      productsMap.set(newProduct.id, newProduct);

      const updatedProducts = [...state.products, newProduct];

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = (statusCounts.all || 0) + 1;
      statusCounts[newProduct.status] = (statusCounts[newProduct.status] || 0) + 1;

      return {
        ...state,
        products: updatedProducts,
        productsMap,
        filteredProducts: updatedProducts, // ဒါကိုထည့်ပါ
        statusCounts,
        success: true
      };
    }

    // ===== UPDATE PRODUCT =====
    case "UPDATE_PRODUCT": {
      const updatedProduct = action.payload.product;

      const productsMap = new Map(state.productsMap);
      productsMap.set(updatedProduct.id, updatedProduct);

      const updatedProducts = state.products.map(p =>
        p.id === updatedProduct.id ? updatedProduct : p
      );

      const oldProduct = state.productsMap.get(updatedProduct.id);

      const statusCounts = { ...state.statusCounts };
      if (oldProduct && oldProduct.status !== updatedProduct.status) {
        statusCounts[oldProduct.status] = Math.max(0, (statusCounts[oldProduct.status] || 0) - 1);
        statusCounts[updatedProduct.status] = (statusCounts[updatedProduct.status] || 0) + 1;
      }

      return {
        ...state,
        products: updatedProducts,
        productsMap,
        filteredProducts: updatedProducts, // ဒါကိုထည့်ပါ
        selectedProduct: state.selectedProduct?.id === updatedProduct.id ? updatedProduct : state.selectedProduct,
        statusCounts,
        success: true
      };
    }

    // ===== DELETE PRODUCT =====
    case "DELETE_PRODUCT": {
      const productId = action.payload.productId;
      const deletedProduct = state.productsMap.get(productId);

      if (!deletedProduct) return state;

      const updatedProducts = state.products.filter(p => p.id !== productId);
      const updatedFilteredProducts = state.filteredProducts.filter(p => p.id !== productId);

      const productsMap = new Map(state.productsMap);
      productsMap.delete(productId);

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = Math.max(0, (statusCounts.all || 0) - 1);
      statusCounts[deletedProduct.status] = Math.max(0, (statusCounts[deletedProduct.status] || 0) - 1);

      return {
        ...state,
        products: updatedProducts,
        productsMap,
        filteredProducts: updatedFilteredProducts,
        statusCounts,
        success: true
      };
    }

    // ===== FILTER PRODUCTS =====
    // case "FILTER_PRODUCTS": {
    //   let filtered = [...state.products];

    //   if (state.activeTab === "active") {
    //     filtered = filtered.filter(p => p.status === "Active");
    //   } else if (state.activeTab === "inactive") {
    //     filtered = filtered.filter(p => p.status === "Inactive");
    //   }

    //   if (state.statusFilter !== "all") {
    //     filtered = filtered.filter(p => p.status === state.statusFilter);
    //   }

    //   if (state.searchQuery) {
    //     const query = state.searchQuery.toLowerCase().trim();
    //     filtered = filtered.filter(p =>
    //       p.name?.toLowerCase().includes(query) ||
    //       p.barcode?.toLowerCase().includes(query) ||
    //       p.sku?.toLowerCase().includes(query) ||
    //       p.categoryName?.toLowerCase().includes(query)
    //     );
    //   }

    //   return {
    //     ...state,
    //     filteredProducts: filtered
    //   };
    // }

    // ===== FETCH LOGS =====
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

    // ===== FILTER LOGS =====
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

    // ===== SET STATUS FILTER =====
    case "SET_STATUS_FILTER":
      return { ...state, statusFilter: action.payload, pagination: { ...state.pagination, page: 1 } };

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