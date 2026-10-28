// src/owner-useReducer/branchReducer.js
export const initialState = {
  branches: [],
  filteredBranches: [],
  logs: [],
  filteredLogs: [],
  selectedBranch: null,
  selectedLog: null,
  shopId: null,
  shopName: '',
  error: null,
  loading: false,
  tableLoading: false,
  success: false,
  activeTab: 'all-branches',
  searchQuery: '',
  searchField: 'all',
  statusFilter: 'all', // 'all', 'Active', 'Unactive'
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
    totalPages: 0
  },
  logFilter: 'all',
  dateFilter: {
    filter: 'all',
    customFrom: '',
    customTo: ''
  },
  summary: {
    total: 0,
    active: 0,
    unactive: 0,
    filteredTotal: 0
  },
  statusCounts: {
    Active: 0,
    Unactive: 0
  },
  actionTypeCounts: {
    all: 0,
    ADD: 0,
    EDIT: 0,
    DELETE: 0
  },
  lastUpdated: null
};

export const branchReducer = (state, action) => {
  switch (action.type) {
    case 'SET_SHOP_CONTEXT':
      return { ...state, shopId: action.payload.shopId, shopName: action.payload.shopName };

    case 'FETCH_BRANCHES': {
      const newBranches = action.payload.branches || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;
      const summary = action.payload.summary || state.summary;

      return {
        ...state,
        branches: newBranches,
        filteredBranches: newBranches,
        pagination: {
          ...state.pagination,
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        summary,
        statusCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    case 'ADD_BRANCH': {
      const newBranch = action.payload.branch;
      return {
        ...state,
        branches: [newBranch, ...state.branches],
        filteredBranches: [newBranch, ...state.filteredBranches],
        success: true
      };
    }

    case 'UPDATE_BRANCH': {
      const updatedBranch = action.payload.branch;
      const updatedBranches = state.branches.map(b =>
        b.id === updatedBranch.id ? updatedBranch : b
      );
      const updatedFiltered = state.filteredBranches.map(b =>
        b.id === updatedBranch.id ? updatedBranch : b
      );
      return {
        ...state,
        branches: updatedBranches,
        filteredBranches: updatedFiltered,
        selectedBranch: state.selectedBranch?.id === updatedBranch.id ? updatedBranch : state.selectedBranch,
        success: true
      };
    }

    case 'DELETE_BRANCH': {
      const branchId = action.payload.branchId;
      return {
        ...state,
        branches: state.branches.filter(b => b.id !== branchId),
        filteredBranches: state.filteredBranches.filter(b => b.id !== branchId),
        success: true
      };
    }

    case 'FILTER_BRANCHES': {
      let filtered = [...state.branches];
      if (state.statusFilter !== 'all') {
        filtered = filtered.filter(b => b.status === state.statusFilter);
      }
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(branch => {
          if (state.searchField === 'all') {
            return (
              branch.branchCode?.toLowerCase().includes(query) ||
              branch.name?.toLowerCase().includes(query) ||
              branch.address?.toLowerCase().includes(query)
            );
          } else if (state.searchField === 'branch_code') {
            return branch.branchCode?.toLowerCase().includes(query);
          } else if (state.searchField === 'name') {
            return branch.name?.toLowerCase().includes(query);
          } else if (state.searchField === 'address') {
            return branch.address?.toLowerCase().includes(query);
          }
          return false;
        });
      }
      return { ...state, filteredBranches: filtered };
    }

    case 'FETCH_LOGS': {
      const newLogs = action.payload.logs || [];
      const currentPage = action.payload.currentPage || 1;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 1;
      const actionTypeCounts = action.payload.actionTypeCounts || state.actionTypeCounts;

      return {
        ...state,
        logs: newLogs,
        filteredLogs: newLogs,
        logPagination: {
          ...state.logPagination,
          page: currentPage,
          total: totalItems,
          totalPages
        },
        actionTypeCounts
      };
    }

    case 'FILTER_LOGS': {
      let filtered = [...state.logs];
      if (state.logFilter !== 'all') {
        filtered = filtered.filter(log => log.actionType === state.logFilter);
      }
      if (state.dateFilter.filter !== 'all') {
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
            case 'today':
              return logDate >= today;
            case 'yesterday':
              return logDate >= yesterday && logDate < today;
            case 'thisWeek':
              return logDate >= weekAgo;
            case 'thisMonth':
              return logDate >= monthAgo;
            case 'custom':
              if (state.dateFilter.customFrom && state.dateFilter.customTo) {
                const from = new Date(state.dateFilter.customFrom);
                const to = new Date(state.dateFilter.customTo);
                to.setHours(23, 59, 59, 999);
                return logDate >= from && logDate <= to;
              }
              return true;
            default:
              return true;
          }
        });
      }
      filtered.sort((a, b) => (b.createdAt ? new Date(b.createdAt) : 0) - (a.createdAt ? new Date(a.createdAt) : 0));
      return { ...state, filteredLogs: filtered };
    }

    case 'SET_SELECTED_LOG':
      return { ...state, selectedLog: action.payload };

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload, pagination: { ...state.pagination, page: 1 } };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload, pagination: { ...state.pagination, page: 1 } };

    case 'SET_SEARCH_FIELD':
      return { ...state, searchField: action.payload, pagination: { ...state.pagination, page: 1 } };

    case 'SET_STATUS_FILTER':
      return { ...state, statusFilter: action.payload, pagination: { ...state.pagination, page: 1 } };

    case 'SET_PAGINATION':
      return { ...state, pagination: { ...state.pagination, ...action.payload } };

    case 'SET_LOG_PAGINATION':
      return { ...state, logPagination: { ...state.logPagination, ...action.payload } };

    case 'SET_DATE_FILTER':
      return { ...state, dateFilter: { ...state.dateFilter, ...action.payload } };

    case 'SET_LOG_FILTER':
      return { ...state, logFilter: action.payload, logPagination: { ...state.logPagination, page: 1 } };

    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false, tableLoading: false, success: false };

    case 'CLEAR_ERROR':
      return { ...state, error: null };

    case 'SET_LOADING':
      return { ...state, loading: action.payload };

    case 'SET_TABLE_LOADING':
      return { ...state, tableLoading: action.payload };

    case 'SET_SUCCESS':
      return { ...state, success: action.payload, error: null };

    case 'CLEAR_SUCCESS':
      return { ...state, success: false };

    case 'CLEAR_FILTERS':
      return {
        ...state,
        searchQuery: '',
        searchField: 'all',
        statusFilter: 'all',
        dateFilter: { filter: 'all', customFrom: '', customTo: '' },
        logFilter: 'all',
        pagination: { ...state.pagination, page: 1 },
        logPagination: { ...state.logPagination, page: 1 }
      };

    default:
      return state;
  }
};