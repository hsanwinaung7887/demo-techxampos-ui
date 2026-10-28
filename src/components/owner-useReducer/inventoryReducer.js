export const initialState = {
  // Products with inventory data
  products: [],
  productsMap: new Map(),
  filteredProducts: [],
  totalPurchaseValue: 0,

  // Batches (keyed by productId)
  batchesMap: new Map(),

  // Logs
  logs: [],
  filteredLogs: [],
  selectedLog: null,

  // UI States
  activeTab: "all-products",
  searchQuery: "",
  searchField: "all",

  // Pagination for products
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

  // Batch Pagination
  batchPagination: {
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
    inStock: 0,
    lowStock: 0,
    outOfStock: 0,
    damaged: 0
  },

  // Log action type counts
  actionTypeCounts: {
    all: 0,
    ADD_BATCH: 0,
    ADJUST_BATCH: 0,
    DELETE_BATCH: 0,
    UPDATE_BATCH: 0,
    RETURN: 0,
    DAMAGE: 0
  },

  // Error & Loading
  error: null,
  loading: false,
  tableLoading: false,
  batchLoading: false,
  success: false,

  lastUpdated: null
};

export const inventoryReducer = (state, action) => {
  switch (action.type) {

    // ===== PRODUCTS =====
    case "FETCH_PRODUCTS": {
      const newProducts = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;

      const productsMap = new Map();
      newProducts.forEach(prod => productsMap.set(prod.id, prod));
      const totalPurchaseValue = newProducts.reduce((sum, product) => {
        return sum + (product.totalPurchaseValue || 0);
      }, 0);
      return {
        ...state,
        products: newProducts,
        productsMap,
        filteredProducts: newProducts,
        pagination: {
          ...state.pagination,
          // page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        statusCounts,
        lastUpdated: new Date().toISOString(),
        totalPurchaseValue: totalPurchaseValue,
      };
    }

    case "UPDATE_PRODUCT": {
      const updatedProduct = action.payload.product;
      const productsMap = new Map(state.productsMap);
      productsMap.set(updatedProduct.id, updatedProduct);

      const updatedProducts = state.products.map(p =>
        p.id === updatedProduct.id ? updatedProduct : p
      );

      const updatedFilteredProducts = state.filteredProducts.map(p =>
        p.id === updatedProduct.id ? updatedProduct : p
      );

      return {
        ...state,
        products: updatedProducts,
        productsMap,
        filteredProducts: updatedFilteredProducts
      };
    }

    // ===== BATCHES =====
    case "FETCH_BATCHES": {
      const { productId, batches, pagination, allBatchesTotal } = action.payload;
      const batchesMap = new Map(state.batchesMap);
      
      batchesMap.set(productId, {
        data: batches || [],
        allBatchesTotal: allBatchesTotal,
        pagination: pagination || {
          page: 1,
          size: state.batchPagination.size,
          total: batches?.length || 0,
          totalPages: 1
        }
      });
      
      return {
        ...state,
        batchesMap,
        batchPagination: pagination || state.batchPagination,
        batchLoading: false
      };
    }

    case "UPDATE_BATCH": {
      const { productId, batch } = action.payload;
      const batchesMap = new Map(state.batchesMap);
      const batchData = batchesMap.get(productId);
      
      if (batchData) {
        const updatedBatches = batchData.data.map(b => 
          b.id === batch.id ? batch : b
        );
        
        const newTotal = updatedBatches.reduce((sum, b) => sum + (b.remaining || 0), 0);
        
        batchesMap.set(productId, {
          ...batchData,
          data: updatedBatches,
          allBatchesTotal: newTotal
        });
      }
      
      return {
        ...state,
        batchesMap
      };
    }

    case "SET_BATCH_PAGINATION":
      return {
        ...state,
        batchPagination: { ...state.batchPagination, ...action.payload }
      };

    case "SET_BATCH_LOADING":
      return {
        ...state,
        batchLoading: action.payload
      };

    case "CLEAR_BATCHES": {
      const { productId } = action.payload;
      const batchesMap = new Map(state.batchesMap);
      batchesMap.delete(productId);
      return {
        ...state,
        batchesMap,
        batchPagination: initialState.batchPagination
      };
    }

    // ===== LOGS =====
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
          // page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        actionTypeCounts
      };
    }

    // ===== FILTER PRODUCTS - FRONTEND FILTER ONLY FOR SEARCH =====
    case "FILTER_PRODUCTS": {
      let filtered = [...state.products];

      // Apply search filter only (backend already filtered by stock status)
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(p => {
          return (
            p.name?.toLowerCase().includes(query) ||
            p.barcode?.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query) ||
            p.categoryName?.toLowerCase().includes(query)
          );
        });
      }

      return { ...state, filteredProducts: filtered };
    }

    case "FILTER_LOGS": {
      let filtered = [...state.logs];

      if (state.logFilter !== "all") {
        filtered = filtered.filter(log => log.actionType === state.logFilter);
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

    // ===== UI STATE SETTERS =====
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

    case "SET_SEARCH_FIELD":
      return { 
        ...state, 
        searchField: action.payload, 
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

    case "SET_SELECTED_LOG":
      return { ...state, selectedLog: action.payload };

    // ===== ERROR & LOADING STATES =====
    case "SET_ERROR":
      return { 
        ...state, 
        error: action.payload, 
        loading: false, 
        tableLoading: false, 
        batchLoading: false,
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



