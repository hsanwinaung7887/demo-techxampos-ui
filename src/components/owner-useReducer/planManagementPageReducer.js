// planManagementPageReducer.js
export const initialState = {
  plans: [],
  logs: [],
  error: null,
  loading: false,
  activeTab: "all-plans",
  searchQuery: "",
  selectedPlan: null
};

export const planManagementPageReducer = (state, action) => {
  switch (action.type) {
    case "FETCH_PLANS":
      return { ...state, plans: action.payload };
    
    case "FETCH_LOGS":
      return { ...state, logs: action.payload };
    
    case "ADD_PLAN":
      return { 
        ...state, 
        plans: [...state.plans, action.payload.plan],
        logs: [action.payload.log, ...state.logs]
      };
    
    case "UPDATE_PLAN":
      return {
        ...state,
        plans: state.plans.map(plan => 
          plan.id === action.payload.plan.id ? action.payload.plan : plan
        ),
        logs: [action.payload.log, ...state.logs]
      };
    
    case "DELETE_PLAN":
      return {
        ...state,
        plans: state.plans.filter(plan => plan.id !== action.payload.planId),
        logs: [action.payload.log, ...state.logs]
      };
    
    case "ADD_LOG":
      return {
        ...state,
        logs: [action.payload, ...state.logs]
      };
    
    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload };
    
    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload };
    
    case "SET_SELECTED_PLAN":
      return { ...state, selectedPlan: action.payload };
    
    case "SET_ERROR":
      return { ...state, error: action.payload };
    
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    
    default:
      return state;
  }
};