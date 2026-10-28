// 📁 src/components/office/owner-useReducer/shopUserAccountReducer.js

export const initialState = {
  // Accounts
  accounts: [],
  accountsMap: new Map(),
  filteredAccounts: [],
  selectedAccount: null,

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
  activeTab: "all-accounts", // all-accounts, active, unactive, history
  searchQuery: "",
  searchField: "all",

  // Pagination for accounts
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

  // Role counts
  roleCounts: {},

  // Log action type counts
  actionTypeCounts: {
    all: 0,
    ADD: 0,
    EDIT: 0,
    DELETE: 0
  },

  // Dropdown Data
  dropdownData: {
    roles: [
      { value: "SHOP_OWNER", label: "Shop Owner", description: "Full access to shop management" },
      { value: "MANAGER", label: "Manager", description: "Can manage staff and inventory" },
      { value: "INVENTORY_STORER", label: "Inventory Storer", description: "Can manage inventory" },
      { value: "CASHIER", label: "Cashier", description: "Can process sales" },
      { value: "VIEWER", label: "Viewer", description: "Read-only access" }
    ],
    // Shops and plans will be fetched from APIs separately
  },

  lastUpdated: null
};

export const shopUserAccountReducer = (state, action) => {
  switch (action.type) {

    // ===== FETCH ACCOUNTS =====
    case "FETCH_ACCOUNTS": {
      const newAccounts = action.payload.accounts || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;
      const roleCounts = action.payload.roleCounts || state.roleCounts;

      const accountsMap = new Map();
      newAccounts.forEach(acc => accountsMap.set(acc.id, acc));

      return {
        ...state,
        accounts: newAccounts,
        accountsMap,
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
        roleCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    // ===== ADD ACCOUNT =====
    case "ADD_ACCOUNT": {
      const newAccount = action.payload.account;
      const accountsMap = new Map(state.accountsMap);
      accountsMap.set(newAccount.id, newAccount);
      const updatedAccounts = [...state.accounts, newAccount];

      const statusCounts = { ...state.statusCounts };
      statusCounts[newAccount.status] = (statusCounts[newAccount.status] || 0) + 1;

      return {
        ...state,
        accounts: updatedAccounts,
        accountsMap,
        statusCounts,
        success: true
      };
    }

    // ===== UPDATE ACCOUNT =====
    case "UPDATE_ACCOUNT": {
      const updatedAccount = action.payload.account;
      const accountsMap = new Map(state.accountsMap);
      accountsMap.set(updatedAccount.id, updatedAccount);
      const updatedAccounts = state.accounts.map(a => a.id === updatedAccount.id ? updatedAccount : a);

      const oldAccount = state.accountsMap.get(updatedAccount.id);
      const statusCounts = { ...state.statusCounts };
      if (oldAccount && oldAccount.status !== updatedAccount.status) {
        statusCounts[oldAccount.status] = Math.max(0, (statusCounts[oldAccount.status] || 0) - 1);
        statusCounts[updatedAccount.status] = (statusCounts[updatedAccount.status] || 0) + 1;
      }

      return {
        ...state,
        accounts: updatedAccounts,
        accountsMap,
        selectedAccount: state.selectedAccount?.id === updatedAccount.id ? updatedAccount : state.selectedAccount,
        statusCounts,
        success: true
      };
    }

    // ===== DELETE ACCOUNT =====
    case "DELETE_ACCOUNT": {
      const accountId = action.payload.accountId;
      const deletedAccount = state.accountsMap.get(accountId);
      if (!deletedAccount) return state;

      const updatedAccounts = state.accounts.filter(a => a.id !== accountId);
      const updatedFiltered = state.filteredAccounts.filter(a => a.id !== accountId);
      const accountsMap = new Map(state.accountsMap);
      accountsMap.delete(accountId);

      const statusCounts = { ...state.statusCounts };
      statusCounts[deletedAccount.status] = Math.max(0, (statusCounts[deletedAccount.status] || 0) - 1);

      return {
        ...state,
        accounts: updatedAccounts,
        accountsMap,
        filteredAccounts: updatedFiltered,
        statusCounts,
        success: true
      };
    }

    // ===== FILTER ACCOUNTS =====
    case "FILTER_ACCOUNTS": {
      let filtered = [...state.accounts];

      // Filter by status tab
      if (state.activeTab === "active") {
        filtered = filtered.filter(a => a.status === "Active");
      } else if (state.activeTab === "unactive") {
        filtered = filtered.filter(a => a.status === "Unactive");
      }

      // Apply search
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(acc => {
          if (state.searchField === "all") {
            return (
              acc.username?.toLowerCase().includes(query) ||
              acc.fullName?.toLowerCase().includes(query) ||
              acc.email?.toLowerCase().includes(query) ||
              (acc.phone && acc.phone.toLowerCase().includes(query)) ||
              acc.role?.toLowerCase().includes(query) ||
              (acc.shopCode && acc.shopCode.toLowerCase().includes(query))
            );
          } else if (state.searchField === "username") {
            return acc.username?.toLowerCase().includes(query);
          } else if (state.searchField === "fullName") {
            return acc.fullName?.toLowerCase().includes(query);
          } else if (state.searchField === "email") {
            return acc.email?.toLowerCase().includes(query);
          } else if (state.searchField === "phone") {
            return acc.phone?.toLowerCase().includes(query);
          } else if (state.searchField === "role") {
            return acc.role?.toLowerCase().includes(query);
          } else if (state.searchField === "shopCode") {
            return acc.shopCode?.toLowerCase().includes(query);
          }
          return false;
        });
      }

      return {
        ...state,
        filteredAccounts: filtered
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

      // Date filtering
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