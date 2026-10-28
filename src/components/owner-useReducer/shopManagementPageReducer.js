// 📁 src/components/owner/owner-useReducer/shopManagementPageReducer.js

export const initialState = {
  shops: [],
  logs: [],
  error: null,
  loading: false,
  activeTab: "all-shops",
  searchQuery: "",
  searchField: "all",
  selectedShop: null,
  pagination: {
    page: 0,
    size: 100,
    total: 0,
    totalPages: 0,
    hasMore: false
  },
  logPagination: {
    page: 0,
    size: 100,
    total: 0,
    totalPages: 0,
    hasMore: false
  }
};

export const shopManagementPageReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_SHOPS":
      return { 
        ...state, 
        shops: action.payload.shops,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          hasMore: action.payload.totalPages > state.pagination.page + 1
        }
      };
    
    case "ADD_SHOP":
      return { 
        ...state, 
        shops: [action.payload.shop, ...state.shops],
        logs: [action.payload.log, ...state.logs],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };
    
    case "UPDATE_SHOP":
      return {
        ...state,
        shops: state.shops.map(shop => 
          shop.id === action.payload.shop.id ? action.payload.shop : shop
        ),
        logs: [action.payload.log, ...state.logs]
      };
    
    case "DELETE_SHOP":
      return {
        ...state,
        shops: state.shops.filter(shop => shop.id !== action.payload.shopId),
        logs: [action.payload.log, ...state.logs],
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      };
    
    case "FETCH_LOGS":
      return { 
        ...state, 
        logs: action.payload.logs,
        logPagination: {
          ...state.logPagination,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          hasMore: action.payload.totalPages > state.logPagination.page + 1
        }
      };
    
    case "LOAD_MORE_SHOPS":
      return {
        ...state,
        shops: [...state.shops, ...action.payload.shops],
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          hasMore: action.payload.hasMore
        }
      };
    
    case "LOAD_MORE_LOGS":
      return {
        ...state,
        logs: [...state.logs, ...action.payload.logs],
        logPagination: {
          ...state.logPagination,
          page: action.payload.page,
          hasMore: action.payload.hasMore
        }
      };
    
    case "SET_ACTIVE_TAB":
      return { 
        ...state, 
        activeTab: action.payload,
        pagination: {
          ...state.pagination,
          page: 0
        }
      };
    
    case "SET_SEARCH_QUERY":
      return { 
        ...state, 
        searchQuery: action.payload,
        pagination: {
          ...state.pagination,
          page: 0
        }
      };
    
    case "SET_SEARCH_FIELD":
      return { 
        ...state, 
        searchField: action.payload,
        pagination: {
          ...state.pagination,
          page: 0
        }
      };
    
    case "SET_SELECTED_SHOP":
      return { ...state, selectedShop: action.payload };
    
    case "SET_ERROR":
      return { ...state, error: action.payload };
    
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    
    case "RESET_PAGINATION":
      return {
        ...state,
        pagination: {
          ...initialState.pagination,
          size: state.pagination.size
        }
      };
    
    default:
      return state;
  }
};