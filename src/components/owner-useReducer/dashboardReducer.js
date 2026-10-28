// Initial state for dashboard
export const initialState = {
  loading: false,
  error: null,
  overview: null,
  branchSummaries: [],
  selectedBranchDetail: null,
  period: 'daily',
  customFromDate: null,
  customToDate: null,
  branches: [],
  showStoreDetails: false,
  successMessage: null
};

// Action types
export const DASHBOARD_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  CLEAR_ERROR: 'CLEAR_ERROR',
  SET_SUCCESS: 'SET_SUCCESS',
  CLEAR_SUCCESS: 'CLEAR_SUCCESS',
  SET_OVERVIEW: 'SET_OVERVIEW',
  SET_BRANCH_SUMMARIES: 'SET_BRANCH_SUMMARIES',
  SET_SELECTED_BRANCH_DETAIL: 'SET_SELECTED_BRANCH_DETAIL',
  SET_PERIOD: 'SET_PERIOD',
  SET_CUSTOM_DATES: 'SET_CUSTOM_DATES',
  SET_BRANCHES: 'SET_BRANCHES',
  SET_SHOW_STORE_DETAILS: 'SET_SHOW_STORE_DETAILS',
  CLEAR_SELECTED_BRANCH: 'CLEAR_SELECTED_BRANCH'
};

// Reducer function
export const dashboardReducer = (state, action) => {
  switch (action.type) {
    case DASHBOARD_ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };

    case DASHBOARD_ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };

    case DASHBOARD_ACTIONS.CLEAR_ERROR:
      return { ...state, error: null };

    case DASHBOARD_ACTIONS.SET_SUCCESS:
      return { ...state, successMessage: action.payload };

    case DASHBOARD_ACTIONS.CLEAR_SUCCESS:
      return { ...state, successMessage: null };

    case DASHBOARD_ACTIONS.SET_OVERVIEW:
      return { ...state, overview: action.payload };

    case DASHBOARD_ACTIONS.SET_BRANCH_SUMMARIES:
      return { ...state, branchSummaries: action.payload };

    case DASHBOARD_ACTIONS.SET_SELECTED_BRANCH_DETAIL:
      return { ...state, selectedBranchDetail: action.payload };

    case DASHBOARD_ACTIONS.SET_PERIOD:
      return {
        ...state,
        period: action.payload,
        customFromDate: action.payload === 'custom' ? state.customFromDate : null,
        customToDate: action.payload === 'custom' ? state.customToDate : null
      };

    case DASHBOARD_ACTIONS.SET_CUSTOM_DATES:
      return {
        ...state,
        customFromDate: action.payload.fromDate,
        customToDate: action.payload.toDate
      };

    case DASHBOARD_ACTIONS.SET_BRANCHES:
      return { ...state, branches: action.payload };

    case DASHBOARD_ACTIONS.SET_SHOW_STORE_DETAILS:
      return { ...state, showStoreDetails: action.payload };

    case DASHBOARD_ACTIONS.CLEAR_SELECTED_BRANCH:
      return { ...state, selectedBranchDetail: null, showStoreDetails: false };

    default:
      return state;
  }
};