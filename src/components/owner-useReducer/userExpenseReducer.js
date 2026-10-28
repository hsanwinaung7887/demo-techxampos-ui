// src/reducers/userExpenseReducer.js

// ===== IMPORT =====
import userExpenseApi from '../apis/userExpenseApi';

// ===== ACTION TYPES =====
const FETCH_EXPENSES_START = 'userExpense/FETCH_EXPENSES_START';
const FETCH_EXPENSES_SUCCESS = 'userExpense/FETCH_EXPENSES_SUCCESS';
const FETCH_EXPENSES_ERROR = 'userExpense/FETCH_EXPENSES_ERROR';

const CREATE_EXPENSE_START = 'userExpense/CREATE_EXPENSE_START';
const CREATE_EXPENSE_SUCCESS = 'userExpense/CREATE_EXPENSE_SUCCESS';
const CREATE_EXPENSE_ERROR = 'userExpense/CREATE_EXPENSE_ERROR';

const UPDATE_EXPENSE_START = 'userExpense/UPDATE_EXPENSE_START';
const UPDATE_EXPENSE_SUCCESS = 'userExpense/UPDATE_EXPENSE_SUCCESS';
const UPDATE_EXPENSE_ERROR = 'userExpense/UPDATE_EXPENSE_ERROR';

const DELETE_EXPENSE_START = 'userExpense/DELETE_EXPENSE_START';
const DELETE_EXPENSE_SUCCESS = 'userExpense/DELETE_EXPENSE_SUCCESS';
const DELETE_EXPENSE_ERROR = 'userExpense/DELETE_EXPENSE_ERROR';

const UPDATE_STATUS_START = 'userExpense/UPDATE_STATUS_START';
const UPDATE_STATUS_SUCCESS = 'userExpense/UPDATE_STATUS_SUCCESS';
const UPDATE_STATUS_ERROR = 'userExpense/UPDATE_STATUS_ERROR';

const FETCH_LOGS_START = 'userExpense/FETCH_LOGS_START';
const FETCH_LOGS_SUCCESS = 'userExpense/FETCH_LOGS_SUCCESS';
const FETCH_LOGS_ERROR = 'userExpense/FETCH_LOGS_ERROR';

const SET_PAGE = 'userExpense/SET_PAGE';
const SET_PAGE_SIZE = 'userExpense/SET_PAGE_SIZE';
const SET_LOG_PAGE = 'userExpense/SET_LOG_PAGE';
const SET_LOG_PAGE_SIZE = 'userExpense/SET_LOG_PAGE_SIZE';
const SET_SEARCH = 'userExpense/SET_SEARCH';
const SET_CATEGORY_FILTER = 'userExpense/SET_CATEGORY_FILTER';
const SET_PAYMENT_METHOD_FILTER = 'userExpense/SET_PAYMENT_METHOD_FILTER';
const SET_STATUS_FILTER = 'userExpense/SET_STATUS_FILTER';
const SET_ACTION_FILTER = 'userExpense/SET_ACTION_FILTER';
const SET_DATE_FILTER = 'userExpense/SET_DATE_FILTER';
const SET_CUSTOM_DATES = 'userExpense/SET_CUSTOM_DATES';
const CLEAR_ERROR = 'userExpense/CLEAR_ERROR';
const CLEAR_SUCCESS = 'userExpense/CLEAR_SUCCESS';
const SET_DEPRECIATION_FILTER = 'userExpense/SET_DEPRECIATION_FILTER';

// ===== INITIAL STATE =====
const initialState = {
  expenses: [],
  logs: [],
  loading: false,
  pagination: { page: 1, size: 10, total: 0, totalPages: 0 },
  logPagination: { page: 1, size: 10, total: 0, totalPages: 0 },
  categoryCounts: { all: 0 },
  statusCounts: { all: 0, PAID: 0, PENDING: 0, CANCELLED: 0 },
  actionTypeCounts: { all: 0, CREATE: 0, UPDATE: 0, DELETE: 0, STATUS_CHANGE: 0 },
  depreciationCounts: { total: 0, monthly: 0, yearly: 0 },
  searchTerm: '',
  filterCategory: 'all',
  filterPaymentMethod: 'all',
  filterStatus: 'all',
  filterDepreciation: 'all',
  actionFilter: 'all',
  dateFilter: 'all',
  customFromDate: '',
  customToDate: '',
  summary: {
    totalExpenses: 0,
    totalAmount: 0,
    totalDepreciation: 0,
    totalCapital: 0,
    monthlyExpense: 0,
    monthlyDepreciation: 0
  },
  error: null,
  success: false
};

// ===== REDUCER =====
const userExpenseReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_EXPENSES_START:
      return { ...state, loading: true, error: null };
      
    case FETCH_EXPENSES_SUCCESS:
      return {
        ...state,
        loading: false,
        expenses: action.payload.data || [],
        pagination: {
          page: action.payload.currentPage || 1,
          size: action.payload.pageSize || 10,
          total: action.payload.totalItems || 0,
          totalPages: action.payload.totalPages || 0
        },
        categoryCounts: action.payload.categoryCounts || initialState.categoryCounts,
        statusCounts: action.payload.statusCounts || initialState.statusCounts,
        depreciationCounts: action.payload.depreciationCounts || initialState.depreciationCounts,
        summary: action.payload.summary || initialState.summary
      };
      
    case FETCH_EXPENSES_ERROR:
      return { ...state, loading: false, error: action.payload };

    case CREATE_EXPENSE_START:
      return { ...state, loading: true, error: null, success: false };
      
    case CREATE_EXPENSE_SUCCESS:
      return { ...state, loading: false, success: true };
      
    case CREATE_EXPENSE_ERROR:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_EXPENSE_START:
      return { ...state, loading: true, error: null, success: false };
      
    case UPDATE_EXPENSE_SUCCESS:
      return { ...state, loading: false, success: true };
      
    case UPDATE_EXPENSE_ERROR:
      return { ...state, loading: false, error: action.payload };

    case DELETE_EXPENSE_START:
      return { ...state, loading: true, error: null, success: false };
      
    case DELETE_EXPENSE_SUCCESS:
      return { ...state, loading: false, success: true };
      
    case DELETE_EXPENSE_ERROR:
      return { ...state, loading: false, error: action.payload };

    case UPDATE_STATUS_START:
      return { ...state, loading: true, error: null, success: false };

    case UPDATE_STATUS_SUCCESS:
      return { ...state, loading: false, success: true };

    case UPDATE_STATUS_ERROR:
      return { ...state, loading: false, error: action.payload };

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
        },
        actionTypeCounts: action.payload.actionTypeCounts || initialState.actionTypeCounts
      };
      
    case FETCH_LOGS_ERROR:
      return { ...state, loading: false, error: action.payload };

    case SET_PAGE:
      return { ...state, pagination: { ...state.pagination, page: action.payload } };
      
    case SET_PAGE_SIZE:
      return { ...state, pagination: { ...state.pagination, size: action.payload, page: 1 } };
      
    case SET_LOG_PAGE:
      return { ...state, logPagination: { ...state.logPagination, page: action.payload } };
      
    case SET_LOG_PAGE_SIZE:
      return { ...state, logPagination: { ...state.logPagination, size: action.payload, page: 1 } };
      
    case SET_SEARCH:
      return { ...state, searchTerm: action.payload, pagination: { ...state.pagination, page: 1 } };
      
    case SET_CATEGORY_FILTER:
      return { ...state, filterCategory: action.payload, pagination: { ...state.pagination, page: 1 } };
      
    case SET_PAYMENT_METHOD_FILTER:
      return { ...state, filterPaymentMethod: action.payload, pagination: { ...state.pagination, page: 1 } };
      
    case SET_STATUS_FILTER:
      return { ...state, filterStatus: action.payload, pagination: { ...state.pagination, page: 1 } };
      
    case SET_DEPRECIATION_FILTER:
      return { ...state, filterDepreciation: action.payload, pagination: { ...state.pagination, page: 1 } };
      
    case SET_ACTION_FILTER:
      return { ...state, actionFilter: action.payload, logPagination: { ...state.logPagination, page: 1 } };
      
    case SET_DATE_FILTER:
      return { ...state, dateFilter: action.payload, logPagination: { ...state.logPagination, page: 1 } };
      
    case SET_CUSTOM_DATES:
      return { ...state, customFromDate: action.payload.fromDate, customToDate: action.payload.toDate };
      
    case CLEAR_ERROR:
      return { ...state, error: null };
      
    case CLEAR_SUCCESS:
      return { ...state, success: false };

    default:
      return state;
  }
};

// ============================================================
// ===== ACTION CREATORS - FIXED =====
// ============================================================

export const fetchExpenses = (params) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_EXPENSES_START });
    try {
      const response = await userExpenseApi.getExpenses(params);
      dispatch({ type: FETCH_EXPENSES_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('❌ fetchExpenses error:', error);
      dispatch({ type: FETCH_EXPENSES_ERROR, payload: error.message });
    }
  };
};

// ✅ FIXED: branchId ကို data ထဲကယူပြီး API ကိုပို့ပါ
export const createExpense = (data) => {
  return async (dispatch) => {
    dispatch({ type: CREATE_EXPENSE_START });
    try {
      // ✅ branchId ကို data ထဲကယူပြီး API ကိုပို့ပါ
      const response = await userExpenseApi.createExpense(data, data?.branchId);
      dispatch({ type: CREATE_EXPENSE_SUCCESS, payload: response.data });
      return response;
    } catch (error) {
      console.error('❌ createExpense error:', error);
      dispatch({ type: CREATE_EXPENSE_ERROR, payload: error.message });
      throw error;
    }
  };
};

// ✅ FIXED: branchId ကို data ထဲကယူပြီး API ကိုပို့ပါ
export const updateExpense = (id, data) => {
  return async (dispatch) => {

    dispatch({ type: UPDATE_EXPENSE_START });
    try {
      // ✅ branchId ကို data ထဲကယူပြီး API ကိုပို့ပါ
      const response = await userExpenseApi.updateExpense(id, data, data?.branchId);
      dispatch({ type: UPDATE_EXPENSE_SUCCESS, payload: response.data });
      return response;
    } catch (error) {
      console.error('❌ updateExpense error:', error);
      dispatch({ type: UPDATE_EXPENSE_ERROR, payload: error.message });
      throw error;
    }
  };
};

// ✅ FIXED: branchId ကို data ထဲကယူပြီး API ကိုပို့ပါ
export const deleteExpense = (id, branchId) => {
  return async (dispatch) => {
    dispatch({ type: DELETE_EXPENSE_START });
    try {
      const response = await userExpenseApi.deleteExpense(id, branchId);
      dispatch({ type: DELETE_EXPENSE_SUCCESS, payload: response.data });
      return response;
    } catch (error) {
      console.error('❌ deleteExpense error:', error);
      dispatch({ type: DELETE_EXPENSE_ERROR, payload: error.message });
      throw error;
    }
  };
};

// ✅ FIXED: branchId ကို data ထဲကယူပြီး API ကိုပို့ပါ
export const updateExpenseStatus = (id, status, branchId) => {
  return async (dispatch) => {

    dispatch({ type: UPDATE_STATUS_START });
    try {
      const response = await userExpenseApi.updateStatus(id, status, branchId);
      dispatch({ type: UPDATE_STATUS_SUCCESS, payload: response.data });
      return response;
    } catch (error) {
      console.error('❌ updateExpenseStatus error:', error);
      dispatch({ type: UPDATE_STATUS_ERROR, payload: error.message });
      throw error;
    }
  };
};

export const fetchExpenseLogs = (params) => {
  return async (dispatch) => {
    dispatch({ type: FETCH_LOGS_START });
    try {
      const response = await userExpenseApi.getLogs(params);

      dispatch({ type: FETCH_LOGS_SUCCESS, payload: response.data });
    } catch (error) {
      console.error('❌ fetchExpenseLogs error:', error);
      dispatch({ type: FETCH_LOGS_ERROR, payload: error.message });
    }
  };
};

// ===== SYNC ACTIONS =====
export const setPage = (page) => ({ type: SET_PAGE, payload: page });
export const setPageSize = (size) => ({ type: SET_PAGE_SIZE, payload: size });
export const setLogPage = (page) => ({ type: SET_LOG_PAGE, payload: page });
export const setLogPageSize = (size) => ({ type: SET_LOG_PAGE_SIZE, payload: size });
export const setSearch = (search) => ({ type: SET_SEARCH, payload: search });
export const setCategoryFilter = (category) => ({ type: SET_CATEGORY_FILTER, payload: category });
export const setPaymentMethodFilter = (method) => ({ type: SET_PAYMENT_METHOD_FILTER, payload: method });
export const setStatusFilter = (status) => ({ type: SET_STATUS_FILTER, payload: status });
export const setDepreciationFilter = (filter) => ({ type: SET_DEPRECIATION_FILTER, payload: filter });
export const setActionFilter = (action) => ({ type: SET_ACTION_FILTER, payload: action });
export const setDateFilter = (date) => ({ type: SET_DATE_FILTER, payload: date });
export const setCustomDates = (fromDate, toDate) => ({ type: SET_CUSTOM_DATES, payload: { fromDate, toDate } });
export const clearError = () => ({ type: CLEAR_ERROR });
export const clearSuccess = () => ({ type: CLEAR_SUCCESS });

export default userExpenseReducer;