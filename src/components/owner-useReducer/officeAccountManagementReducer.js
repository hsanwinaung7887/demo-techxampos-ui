export const initialState = {
  // Accounts
  accounts: [],                    // လက်ရှိ page ရဲ့ accounts ပဲထား
  accountsMap: new Map(),           // ID by Account map
  filteredAccounts: [],             // Filter လုပ်ပြီးသား accounts
  selectedAccount: null,
  
  // Logs
  logs: [],                          // လက်ရှိ page ရဲ့ logs ပဲထား
  filteredLogs: [],                  // Filter လုပ်ပြီးသား logs
  selectedLog: null,
  
  // Error & Loading
  error: null,
  loading: false,
  tableLoading: false,
  success: false,
  
  // UI States
  activeTab: "all-accounts",         // all-accounts, active, inactive, suspended, history
  searchQuery: "",
  searchField: "all",
  
  // Filters
  filters: {
    role: "all",
    status: "all"
  },
  
  // Pagination - Server Side (for billion rows)
  pagination: {
    page: 1,
    size: 10,
    total: 0,          // Total filtered items
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
  
  // Summary Stats with accurate counts
  summary: {
    total: 0,
    active: 0,
    inactive: 0,
    suspended: 0,
    deleted: 0,
    filteredTotal: 0,
    logSummary: {
      total: 0,
      add: 0,
      edit: 0,
      delete: 0,
      today: 0
    }
  },

  // Role counts for dropdown (accurate from DB)
  roleCounts: {
    all: 0,
    MANAGER: 0,
    ACCOUNT_TEAM: 0,
    SUPPORT_TEAM: 0,
    BILLING_TEAM: 0,
    CUSTOMER_SERVICE: 0
  },
  
  // Status counts - အသစ်ပြင်ဆင်
  statusCounts: {
    Active: 0,
    Inactive: 0,
    Suspended: 0,
    Deleted: 0
  },
  
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
      { value: "MANAGER", label: "Manager" },
      { value: "ACCOUNT_TEAM", label: "Account Team" },
      { value: "SUPPORT_TEAM", label: "Support Team" },
      { value: "BILLING_TEAM", label: "Billing Team" },
      { value: "CUSTOMER_SERVICE", label: "Customer Service"}
    ]
  },
  
  // Cache for already loaded pages (optional)
  accountsCache: new Map(),
  loadedPages: [],
  
  // Last Updated Timestamp
  lastUpdated: null
};

export const officeAccountManagementReducer = (state, action) => {
  switch (action.type) {
    // ===== ACCOUNT ACTIONS =====
    
    case "FETCH_ACCOUNTS": {
      const newAccounts = action.payload.accounts || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const roleCounts = action.payload.roleCounts || state.roleCounts;
      const statusCounts = action.payload.statusCounts || state.statusCounts;
      
      const accountsMap = new Map();
      
      newAccounts.forEach(account => {
        accountsMap.set(account.id, account);
      });
      
      const allAccounts = [...newAccounts];
      
      const accountsCache = new Map(state.accountsCache);
      accountsCache.set(currentPage, newAccounts);
      
      const loadedPages = [...new Set([...state.loadedPages, currentPage])].sort((a, b) => a - b);
      
      return {
        ...state,
        accounts: allAccounts,
        accountsMap,
        accountsCache,
        loadedPages,
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
          total: roleCounts.all || totalItems,
          active: statusCounts.Active || 0,
          inactive: statusCounts.Inactive || 0,
          suspended: statusCounts.Suspended || 0,
          deleted: statusCounts.Deleted || 0,
          filteredTotal: totalItems,
          ...action.payload.summary
        },
        roleCounts,
        statusCounts,
        lastUpdated: new Date().toISOString()
      };
    }

    case "ADD_ACCOUNT": {
      const newAccount = action.payload.account;
      
      const accountsMap = new Map(state.accountsMap);
      accountsMap.set(newAccount.id, newAccount);
      
      const updatedAccounts = [...state.accounts, newAccount];
      
      const roleCounts = { ...state.roleCounts };
      roleCounts.all = (roleCounts.all || 0) + 1;
      roleCounts[newAccount.role] = (roleCounts[newAccount.role] || 0) + 1;
      
      const statusCounts = { ...state.statusCounts };
      statusCounts[newAccount.status] = (statusCounts[newAccount.status] || 0) + 1;
      
      return {
        ...state,
        accounts: updatedAccounts,
        accountsMap,
        roleCounts,
        statusCounts,
        success: true
      };
    }

    case "UPDATE_ACCOUNT": {
      const updatedAccount = action.payload.account;
      
      const accountsMap = new Map(state.accountsMap);
      accountsMap.set(updatedAccount.id, updatedAccount);
      
      const updatedAccounts = state.accounts.map(acc => 
        acc.id === updatedAccount.id ? updatedAccount : acc
      );
      
      const oldAccount = state.accountsMap.get(updatedAccount.id);
      
      const roleCounts = { ...state.roleCounts };
      if (oldAccount && oldAccount.role !== updatedAccount.role) {
        roleCounts[oldAccount.role] = Math.max(0, (roleCounts[oldAccount.role] || 0) - 1);
        roleCounts[updatedAccount.role] = (roleCounts[updatedAccount.role] || 0) + 1;
      }
      
      const statusCounts = { ...state.statusCounts };
      if (oldAccount && oldAccount.status !== updatedAccount.status) {
        statusCounts[oldAccount.status] = Math.max(0, (statusCounts[oldAccount.status] || 0) - 1);
        statusCounts[updatedAccount.status] = (statusCounts[updatedAccount.status] || 0) + 1;
      }
      
      return {
        ...state,
        accounts: updatedAccounts,
        accountsMap,
        selectedAccount: state.selectedAccount?.id === updatedAccount.id 
          ? updatedAccount 
          : state.selectedAccount,
        roleCounts,
        statusCounts,
        success: true
      };
    }

    // ===== SOFT DELETE =====
    case "DELETE_ACCOUNT": {
      const accountId = action.payload.accountId;
      const deletedAccount = state.accountsMap.get(accountId);
      
      if (!deletedAccount) return state;
      
      // Account ကို Deleted status ပြောင်း
      const accountsMap = new Map(state.accountsMap);
      const updatedDeletedAccount = {
        ...deletedAccount,
        status: "Deleted"
      };
      accountsMap.set(accountId, updatedDeletedAccount);
      
      // လက်ရှိ page ထဲကနေ ဖျက် (UI မှာ ချက်ချင်းပျောက်သွားစေချင်လို့)
      const updatedAccounts = state.accounts.filter(acc => acc.id !== accountId);
      
      // Role counts လျှော့
      const roleCounts = { ...state.roleCounts };
      roleCounts.all = Math.max(0, (roleCounts.all || 0) - 1);
      roleCounts[deletedAccount.role] = Math.max(0, (roleCounts[deletedAccount.role] || 0) - 1);
      
      // Status counts ပြောင်း
      const statusCounts = { ...state.statusCounts };
      statusCounts[deletedAccount.status] = Math.max(0, (statusCounts[deletedAccount.status] || 0) - 1);
      statusCounts["Deleted"] = (statusCounts["Deleted"] || 0) + 1;
      
      // Filtered accounts ကနေလည်း ဖယ်
      const updatedFilteredAccounts = state.filteredAccounts.filter(acc => acc.id !== accountId);
      
      return {
        ...state,
        accounts: updatedAccounts,
        accountsMap,
        filteredAccounts: updatedFilteredAccounts,
        roleCounts,
        statusCounts,
        success: true
      };
    }

    // ===== FILTER ACCOUNTS =====
    case "FILTER_ACCOUNTS": {
      // accounts ထဲမှာ Deleted မပါဘူး (အပေါ်က DELETE_ACCOUNT မှာ ဖယ်ပြီးသား)
      let filtered = [...state.accounts];

      // Filter by status tab
      if (state.activeTab === "active") {
        filtered = filtered.filter(acc => acc.status === "Active");
      } else if (state.activeTab === "inactive") {
        filtered = filtered.filter(acc => acc.status === "Inactive");
      } else if (state.activeTab === "suspended") {
        filtered = filtered.filter(acc => acc.status === "Suspended");  // Suspended ကိုပဲပြမယ်
      }
      // all-accounts ဆိုရင် Active, Inactive, Suspended အကုန်ပါမယ် (Deleted မပါ)

      // Apply role filter
      if (state.filters.role !== "all") {
        filtered = filtered.filter(acc => acc.role === state.filters.role);
      }

      // Apply search
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(acc => {
          const fullName = acc.fullName || acc.full_name || '';
          const phone = acc.phone || '';
          
          return (
            acc.username?.toLowerCase().includes(query) ||
            fullName.toLowerCase().includes(query) ||
            acc.email?.toLowerCase().includes(query) ||
            phone.toLowerCase().includes(query)
          );
        });
      }

      return {
        ...state,
        filteredAccounts: filtered
      };
    }

    // ===== LOG ACTIONS =====
    
    case "FETCH_LOGS": {
      const newLogs = action.payload.logs || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.logPagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const actionTypeCounts = action.payload.actionTypeCounts || state.actionTypeCounts;
      
      return {
        ...state,
        logs: newLogs,
        filteredLogs: newLogs,
        logPagination: {
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        summary: {
          ...state.summary,
          logSummary: action.payload.summary || state.summary.logSummary
        },
        actionTypeCounts
      };
    }

    // ===== FILTER LOGS =====
    case "FILTER_LOGS": {
      let filteredLogs = [...state.logs];

      if (state.logFilter !== "all") {
        filteredLogs = filteredLogs.filter(log => 
          log.actionType === state.logFilter
        );
      }

      // Filter by date
      const now = new Date();
      const today = new Date(now.setHours(0, 0, 0, 0));
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);

      switch (state.dateFilter.filter) {
        case "today":
          filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.createdAt);
            return logDate >= today;
          });
          break;
        case "yesterday":
          filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.createdAt);
            return logDate >= yesterday && logDate < today;
          });
          break;
        case "thisWeek":
          filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.createdAt);
            return logDate >= weekAgo;
          });
          break;
        case "thisMonth":
          filteredLogs = filteredLogs.filter(log => {
            const logDate = new Date(log.createdAt);
            return logDate >= monthStart;
          });
          break;
        case "custom":
          if (state.dateFilter.customFrom && state.dateFilter.customTo) {
            const fromDate = new Date(state.dateFilter.customFrom);
            fromDate.setHours(0, 0, 0, 0);
            const toDate = new Date(state.dateFilter.customTo);
            toDate.setHours(23, 59, 59, 999);
            
            filteredLogs = filteredLogs.filter(log => {
              const logDate = new Date(log.createdAt);
              return logDate >= fromDate && logDate <= toDate;
            });
          }
          break;
        default:
          break;
      }

      filteredLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      return {
        ...state,
        filteredLogs
      };
    }

    case "SET_SELECTED_LOG":
      return {
        ...state,
        selectedLog: action.payload
      };

    // ===== UI STATE ACTIONS =====
    
    case "SET_ACTIVE_TAB":
      return {
        ...state,
        activeTab: action.payload,
        pagination: {
          ...state.pagination,
          page: 1
        }
      };

    case "SET_SEARCH_QUERY":
      return {
        ...state,
        searchQuery: action.payload,
        pagination: {
          ...state.pagination,
          page: 1
        }
      };

    case "SET_SEARCH_FIELD":
      return {
        ...state,
        searchField: action.payload,
        pagination: {
          ...state.pagination,
          page: 1
        }
      };

    case "SET_FILTERS":
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload
        },
        pagination: {
          ...state.pagination,
          page: 1
        }
      };

    case "SET_DATE_FILTER":
      return {
        ...state,
        dateFilter: {
          ...state.dateFilter,
          ...action.payload
        },
        logPagination: {
          ...state.logPagination,
          page: 1
        }
      };

    case "SET_LOG_FILTER":
      return {
        ...state,
        logFilter: action.payload,
        logPagination: {
          ...state.logPagination,
          page: 1
        }
      };

    // ===== PAGINATION ACTIONS =====
    
    case "SET_PAGINATION":
      return {
        ...state,
        pagination: {
          ...state.pagination,
          ...action.payload
        }
      };

    case "SET_LOG_PAGINATION":
      return {
        ...state,
        logPagination: {
          ...state.logPagination,
          ...action.payload
        }
      };

    case "GO_TO_PAGE": {
      const page = action.payload.page;
      
      if (state.accountsCache.has(page)) {
        const cachedAccounts = state.accountsCache.get(page);
        return {
          ...state,
          pagination: {
            ...state.pagination,
            page
          },
          accounts: cachedAccounts,
          filteredAccounts: cachedAccounts
        };
      }
      
      return {
        ...state,
        pagination: {
          ...state.pagination,
          page
        }
      };
    }

    // ===== ERROR & LOADING ACTIONS =====
    
    case "SET_ERROR":
      return { 
        ...state, 
        error: action.payload,
        loading: false,
        tableLoading: false,
        success: false
      };

    case "CLEAR_ERROR":
      return { 
        ...state, 
        error: null 
      };

    case "SET_LOADING":
      return { 
        ...state, 
        loading: action.payload 
      };

    case "SET_TABLE_LOADING":
      return { 
        ...state, 
        tableLoading: action.payload 
      };

    case "SET_SUCCESS":
      return { 
        ...state, 
        success: action.payload,
        error: null
      };

    case "CLEAR_SUCCESS":
      return { 
        ...state, 
        success: false 
      };

    // ===== DROPDOWN DATA =====
    
    case "SET_DROPDOWN_DATA":
      return {
        ...state,
        dropdownData: {
          ...state.dropdownData,
          ...action.payload
        }
      };

    // ===== SUMMARY STATS =====
    
    case "UPDATE_SUMMARY":
      return {
        ...state,
        summary: {
          ...state.summary,
          ...action.payload
        }
      };

    // ===== CACHE MANAGEMENT =====
    
    case "CLEAR_CACHE":
      return {
        ...state,
        accountsCache: new Map(),
        loadedPages: []
      };

    // ===== RESET STATE =====
    
    case "RESET_STATE":
      return {
        ...initialState,
        dropdownData: state.dropdownData
      };

    case "CLEAR_FILTERS":
      return {
        ...state,
        searchQuery: "",
        searchField: "all",
        filters: {
          role: "all",
          status: "all"
        },
        dateFilter: {
          filter: "all",
          customFrom: "",
          customTo: ""
        },
        logFilter: "all",
        pagination: {
          ...state.pagination,
          page: 1
        },
        logPagination: {
          ...state.logPagination,
          page: 1
        }
      };

    default:
      return state;
  }
};