// src/reducers/capitalReducer.js
import capitalApi from '../apis/capitalApi';

// ============================================================
// ACTION TYPES
// ============================================================
const FETCH_SUMMARY_START = 'capital/FETCH_SUMMARY_START';
const FETCH_SUMMARY_SUCCESS = 'capital/FETCH_SUMMARY_SUCCESS';
const FETCH_SUMMARY_ERROR = 'capital/FETCH_SUMMARY_ERROR';

const FETCH_TRANSACTIONS_START = 'capital/FETCH_TRANSACTIONS_START';
const FETCH_TRANSACTIONS_SUCCESS = 'capital/FETCH_TRANSACTIONS_SUCCESS';
const FETCH_TRANSACTIONS_ERROR = 'capital/FETCH_TRANSACTIONS_ERROR';

const CREATE_TRANSACTION_START = 'capital/CREATE_TRANSACTION_START';
const CREATE_TRANSACTION_SUCCESS = 'capital/CREATE_TRANSACTION_SUCCESS';
const CREATE_TRANSACTION_ERROR = 'capital/CREATE_TRANSACTION_ERROR';

const DELETE_TRANSACTION_START = 'capital/DELETE_TRANSACTION_START';
const DELETE_TRANSACTION_SUCCESS = 'capital/DELETE_TRANSACTION_SUCCESS';
const DELETE_TRANSACTION_ERROR = 'capital/DELETE_TRANSACTION_ERROR';

const FETCH_CLOSING_HISTORY_START = 'capital/FETCH_CLOSING_HISTORY_START';
const FETCH_CLOSING_HISTORY_SUCCESS = 'capital/FETCH_CLOSING_HISTORY_SUCCESS';
const FETCH_CLOSING_HISTORY_ERROR = 'capital/FETCH_CLOSING_HISTORY_ERROR';

const CLOSE_PERIOD_START = 'capital/CLOSE_PERIOD_START';
const CLOSE_PERIOD_SUCCESS = 'capital/CLOSE_PERIOD_SUCCESS';
const CLOSE_PERIOD_ERROR = 'capital/CLOSE_PERIOD_ERROR';

const FETCH_LOGS_START = 'capital/FETCH_LOGS_START';
const FETCH_LOGS_SUCCESS = 'capital/FETCH_LOGS_SUCCESS';
const FETCH_LOGS_ERROR = 'capital/FETCH_LOGS_ERROR';

const FETCH_EXTERNAL_DATA_START = 'capital/FETCH_EXTERNAL_DATA_START';
const FETCH_EXTERNAL_DATA_SUCCESS = 'capital/FETCH_EXTERNAL_DATA_SUCCESS';
const FETCH_EXTERNAL_DATA_ERROR = 'capital/FETCH_EXTERNAL_DATA_ERROR';

// ============================================================
// NEW: Branch Profit for Closing
// ============================================================
const FETCH_BRANCH_PROFIT_START = 'capital/FETCH_BRANCH_PROFIT_START';
const FETCH_BRANCH_PROFIT_SUCCESS = 'capital/FETCH_BRANCH_PROFIT_SUCCESS';
const FETCH_BRANCH_PROFIT_ERROR = 'capital/FETCH_BRANCH_PROFIT_ERROR';

const SET_PAGE = 'capital/SET_PAGE';
const SET_PAGE_SIZE = 'capital/SET_PAGE_SIZE';
const SET_LOG_PAGE = 'capital/SET_LOG_PAGE';
const SET_LOG_PAGE_SIZE = 'capital/SET_LOG_PAGE_SIZE';
const SET_CLOSING_PAGE = 'capital/SET_CLOSING_PAGE';
const SET_CLOSING_PAGE_SIZE = 'capital/SET_CLOSING_PAGE_SIZE';
const SET_FILTER_TYPE = 'capital/SET_FILTER_TYPE';
const SET_SEARCH = 'capital/SET_SEARCH';
const CLEAR_ERROR = 'capital/CLEAR_ERROR';
const CLEAR_SUCCESS = 'capital/CLEAR_SUCCESS';

// ============================================================
// INITIAL STATE
// ============================================================
const initialState = {
  // Summary
  summary: {
    totalCapital: 0,
    currentBalance: 0,
    totalWithdrawals: 0,
    totalTransfers: 0,
    monthlyCapital: 0,
    growthPercentage: '0%',
    totalTransactions: 0,
    isClosed: false,
    closingDate: null,
    closingSales: null,
    closingCogs: null,
    closingExpense: null,
    closingProfitLoss: null
  },

  // Transactions
  transactions: [],
  pagination: { page: 1, size: 10, total: 0, totalPages: 0 },

  // Closing History
  closingHistory: [],
  closingPagination: { page: 1, size: 6, total: 0, totalPages: 0 },

  // Logs
  logs: [],
  logPagination: { page: 1, size: 10, total: 0, totalPages: 0 },

  // External Data
  externalData: {
    totalSales: 0,
    totalCogs: 0,
    totalExpense: 0
  },

  // Filters
  filterType: 'all',
  searchTerm: '',

  // ============================================================
  // NEW: Branch Profit for Closing
  // ============================================================
  branchProfit: null,
  // UI States
  loading: false,
  error: null,
  success: false
};

// ============================================================
// REDUCER
// ============================================================
const capitalReducer = (state = initialState, action) => {
  switch (action.type) {

    // ==========================================================
    // FETCH SUMMARY
    // ==========================================================
    case FETCH_SUMMARY_START:
      return { ...state, loading: true, error: null };

    case FETCH_SUMMARY_SUCCESS:
      return {
        ...state,
        loading: false,
        summary: {
          ...state.summary,
          ...action.payload
        }
      };

    case FETCH_SUMMARY_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // FETCH TRANSACTIONS
    // ==========================================================
    case FETCH_TRANSACTIONS_START:
      return { ...state, loading: true, error: null };

    case FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        loading: false,
        transactions: action.payload.data || [],
        pagination: {
          page: action.payload.currentPage || 1,
          size: action.payload.pageSize || 10,
          total: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0
        }
      };

    case FETCH_TRANSACTIONS_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // CREATE TRANSACTION
    // ==========================================================
    case CREATE_TRANSACTION_START:
      return { ...state, loading: true, error: null, success: false };

    case CREATE_TRANSACTION_SUCCESS:
      return { ...state, loading: false, success: true };

    case CREATE_TRANSACTION_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // DELETE TRANSACTION
    // ==========================================================
    case DELETE_TRANSACTION_START:
      return { ...state, loading: true, error: null, success: false };

    case DELETE_TRANSACTION_SUCCESS:
      return { ...state, loading: false, success: true };

    case DELETE_TRANSACTION_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // FETCH CLOSING HISTORY
    // ==========================================================
    case FETCH_CLOSING_HISTORY_START:
      return { ...state, loading: true, error: null };

    case FETCH_CLOSING_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        closingHistory: action.payload.data || [],
        closingPagination: {
          page: action.payload.currentPage || 1,
          size: action.payload.pageSize || 6,
          total: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0
        }
      };

    case FETCH_CLOSING_HISTORY_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // CLOSE PERIOD
    // ==========================================================
    case CLOSE_PERIOD_START:
      return { ...state, loading: true, error: null, success: false };

    case CLOSE_PERIOD_SUCCESS:
      return { ...state, loading: false, success: true };

    case CLOSE_PERIOD_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // FETCH LOGS
    // ==========================================================
    case FETCH_LOGS_START:
      return { ...state, loading: true, error: null };

    case FETCH_LOGS_SUCCESS:
      return {
        ...state,
        loading: false,
        logs: action.payload.data || [],
        logPagination: {
          page: action.payload.currentPage || 1,
          size: action.payload.pageSize || 10,
          total: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0
        }
      };

    case FETCH_LOGS_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // FETCH EXTERNAL DATA
    // ==========================================================
    case FETCH_EXTERNAL_DATA_START:
      return { ...state, loading: true, error: null };

    case FETCH_EXTERNAL_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        externalData: {
          totalSales: action.payload.totalSales || 0,
          totalCogs: action.payload.totalCogs || 0,
          totalExpense: action.payload.totalExpense || 0
        }
      };

    case FETCH_EXTERNAL_DATA_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // NEW: FETCH BRANCH PROFIT
    // ==========================================================
    case FETCH_BRANCH_PROFIT_START:
      return { ...state, loading: true, error: null };

 case FETCH_BRANCH_PROFIT_SUCCESS:
  // ✅ action.payload = { month: 9, profit: 5900, year: 2026 }
  const profitValue = action.payload?.profit || 0;

  return {
    ...state,
    loading: false,
    branchProfit: profitValue
  };

    case FETCH_BRANCH_PROFIT_ERROR:
      return { ...state, loading: false, error: action.payload };

    // ==========================================================
    // PAGINATION
    // ==========================================================
    case SET_PAGE:
      return { ...state, pagination: { ...state.pagination, page: action.payload } };

    case SET_PAGE_SIZE:
      return { ...state, pagination: { ...state.pagination, size: action.payload, page: 1 } };

    case SET_LOG_PAGE:
      return { ...state, logPagination: { ...state.logPagination, page: action.payload } };

    case SET_LOG_PAGE_SIZE:
      return { ...state, logPagination: { ...state.logPagination, size: action.payload, page: 1 } };

    case SET_CLOSING_PAGE:
      return { ...state, closingPagination: { ...state.closingPagination, page: action.payload } };

    case SET_CLOSING_PAGE_SIZE:
      return { ...state, closingPagination: { ...state.closingPagination, size: action.payload, page: 1 } };

    // ==========================================================
    // FILTERS
    // ==========================================================
    case SET_FILTER_TYPE:
      return { ...state, filterType: action.payload, pagination: { ...state.pagination, page: 1 } };

    case SET_SEARCH:
      return { ...state, searchTerm: action.payload, pagination: { ...state.pagination, page: 1 } };

    // ==========================================================
    // UI
    // ==========================================================
    case CLEAR_ERROR:
      return { ...state, error: null };

    case CLEAR_SUCCESS:
      return { ...state, success: false };

    default:
      return state;
  }
};

// ============================================================
// ACTION CREATORS
// ============================================================

// ==========================================================
// 1. Fetch Summary
// ==========================================================
export const fetchSummary = (branchId) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_SUMMARY_START });

    try {
      const response = await capitalApi.getSummary(branchId);
      dispatch({ type: FETCH_SUMMARY_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('❌ fetchSummary error:', error);
      dispatch({ type: FETCH_SUMMARY_ERROR, payload: error.message });
    }
  };
};

// ==========================================================
// 2. Fetch Transactions
// ==========================================================
export const fetchTransactions = (params) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_TRANSACTIONS_START });

    try {
      const response = await capitalApi.getTransactions(params);
      dispatch({ type: FETCH_TRANSACTIONS_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('❌ fetchTransactions error:', error);
      dispatch({ type: FETCH_TRANSACTIONS_ERROR, payload: error.message });
    }
  };
};

// ==========================================================
// 3. Create Transaction
// ==========================================================
export const createTransaction = (data, branchId) => {
  return async (dispatch) => {

    dispatch({ type: CREATE_TRANSACTION_START });

    try {
      const response = await capitalApi.createTransaction(data, branchId);

      dispatch({ type: CREATE_TRANSACTION_SUCCESS, payload: response.data });
      return response;
    } catch (error) {
      console.error('❌ createTransaction error:', error);
      dispatch({ type: CREATE_TRANSACTION_ERROR, payload: error.message });
      throw error;
    }
  };
};

// ==========================================================
// 4. Delete Transaction
// ==========================================================
export const deleteTransaction = (id, branchId) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_TRANSACTION_START });

    try {
      const response = await capitalApi.deleteTransaction(id, branchId);
      dispatch({ type: DELETE_TRANSACTION_SUCCESS, payload: response.data });
      return response;
    } catch (error) {
      console.error('❌ deleteTransaction error:', error);
      dispatch({ type: DELETE_TRANSACTION_ERROR, payload: error.message });
      throw error;
    }
  };
};

// ==========================================================
// 5. Fetch Closing History
// ==========================================================
export const fetchClosingHistory = (params) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_CLOSING_HISTORY_START });

    try {
      const response = await capitalApi.getClosingHistory(params);
      dispatch({ type: FETCH_CLOSING_HISTORY_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('❌ fetchClosingHistory error:', error);
      dispatch({ type: FETCH_CLOSING_HISTORY_ERROR, payload: error.message });
    }
  };
};

// ==========================================================
// 6. Close Period
// ==========================================================
export const closePeriod = (data, branchId) => {
  return async (dispatch) => {
    dispatch({ type: CLOSE_PERIOD_START });

    try {
      const response = await capitalApi.closePeriod(data, branchId);
      dispatch({ type: CLOSE_PERIOD_SUCCESS, payload: response.data });
      return response;
    } catch (error) {
      console.error('❌ closePeriod error:', error);
      dispatch({ type: CLOSE_PERIOD_ERROR, payload: error.message });
      throw error;
    }
  };
};

// ==========================================================
// 7. Fetch Logs
// ==========================================================
export const fetchLogs = (params) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_LOGS_START });

    try {
      const response = await capitalApi.getLogs(params);
      dispatch({ type: FETCH_LOGS_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('❌ fetchLogs error:', error);
      dispatch({ type: FETCH_LOGS_ERROR, payload: error.message });
    }
  };
};

// ==========================================================
// 8. Fetch External Data
// ==========================================================
export const fetchExternalData = (branchId) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_EXTERNAL_DATA_START });

    try {
      const response = await capitalApi.getExternalData(branchId);
      dispatch({ type: FETCH_EXTERNAL_DATA_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('❌ fetchExternalData error:', error);
      dispatch({ type: FETCH_EXTERNAL_DATA_ERROR, payload: error.message });
    }
  };
};

// ==========================================================
// 9. NEW: Fetch Branch Profit for Closing (by month)
// ==========================================================
export const fetchBranchProfit = (branchId, month, year) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_BRANCH_PROFIT_START });

    try {
      const response = await capitalApi.getBranchProfitForClosing(branchId, month, year);

      // ✅ response က { month: 9, profit: 5900, year: 2026 }
      dispatch({ 
        type: FETCH_BRANCH_PROFIT_SUCCESS, 
        payload: response 
      });
      
      return response;
    } catch (error) {
      console.error('❌ fetchBranchProfit error:', error);
      dispatch({ type: FETCH_BRANCH_PROFIT_ERROR, payload: error.message });
      throw error;
    }
  };
};

// ==========================================================
// SYNC ACTIONS
// ==========================================================
export const setPage = (page) => ({ type: SET_PAGE, payload: page });
export const setPageSize = (size) => ({ type: SET_PAGE_SIZE, payload: size });
export const setLogPage = (page) => ({ type: SET_LOG_PAGE, payload: page });
export const setLogPageSize = (size) => ({ type: SET_LOG_PAGE_SIZE, payload: size });
export const setClosingPage = (page) => ({ type: SET_CLOSING_PAGE, payload: page });
export const setClosingPageSize = (size) => ({ type: SET_CLOSING_PAGE_SIZE, payload: size });
export const setFilterType = (type) => ({ type: SET_FILTER_TYPE, payload: type });
export const setSearch = (search) => ({ type: SET_SEARCH, payload: search });
export const clearError = () => ({ type: CLEAR_ERROR });
export const clearSuccess = () => ({ type: CLEAR_SUCCESS });

export default capitalReducer;