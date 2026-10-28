// 📁 src/components/owner/owner-reducers/shopAccountManagementReducer.js

export const initialState = {
  accounts: [],
  filteredAccounts: [],
  logs: [],
  error: null,
  loading: false,
  tableLoading: false,
  activeTab: "all-accounts",
  searchQuery: "",
  searchField: "all",
  selectedAccount: null,
  filters: {
    role: "all",
    status: "all",
    shopCode: ""
  },
  pagination: {
    page: 0,
    size: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  },
  logPagination: {
    page: 0,
    size: 10,
    total: 0,
    totalPages: 0,
    hasMore: false
  },
  dateFilter: {
    filter: "all",
    customFrom: "",
    customTo: ""
  },
  logFilter: "all",
  dropdownData: {
    shops: [],
    roles: []
  }
};

export const shopAccountManagementReducer= (state, action) => {
  switch (action.type) {
    case "FETCH_ACCOUNTS":
      return {
        ...state,
        accounts: action.payload.accounts,
        filteredAccounts: action.payload.accounts,
        pagination: {
          ...state.pagination,
          total: action.payload.total,
          totalPages: action.payload.totalPages,
          hasMore: action.payload.totalPages > state.pagination.page + 1
        }
      };

    case "LOAD_MORE_ACCOUNTS":
      return {
        ...state,
        accounts: [...state.accounts, ...action.payload.accounts],
        filteredAccounts: [...state.filteredAccounts, ...action.payload.accounts],
        pagination: {
          ...state.pagination,
          page: action.payload.page,
          hasMore: action.payload.hasMore
        }
      };

    case "ADD_ACCOUNT":
      return {
        ...state,
        accounts: [action.payload.account, ...state.accounts],
        filteredAccounts: [action.payload.account, ...state.filteredAccounts],
        pagination: {
          ...state.pagination,
          total: state.pagination.total + 1
        }
      };

    case "UPDATE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.map(acc =>
          acc.id === action.payload.account.id ? action.payload.account : acc
        ),
        filteredAccounts: state.filteredAccounts.map(acc =>
          acc.id === action.payload.account.id ? action.payload.account : acc
        )
      };

    case "DELETE_ACCOUNT":
      return {
        ...state,
        accounts: state.accounts.filter(acc => acc.id !== action.payload.accountId),
        filteredAccounts: state.filteredAccounts.filter(acc => acc.id !== action.payload.accountId),
        pagination: {
          ...state.pagination,
          total: state.pagination.total - 1
        }
      };

    case "FILTER_ACCOUNTS":
      let filtered = [...state.accounts];

      // Filter by status tab
      if (state.activeTab === "active") {
        filtered = filtered.filter(acc => acc.status === "Active");
      } else if (state.activeTab === "unactive") {
        filtered = filtered.filter(acc => acc.status === "Unactive");
      }

      // Apply filters
      if (state.filters.role !== "all") {
        filtered = filtered.filter(acc => acc.role === state.filters.role);
      }

      if (state.filters.status !== "all") {
        filtered = filtered.filter(acc => acc.status === state.filters.status);
      }

      if (state.filters.shopCode) {
        const query = state.filters.shopCode.toLowerCase();
        filtered = filtered.filter(acc =>
          acc.shop_code.toLowerCase().includes(query)
        );
      }

      // Filter by search
      if (action.payload?.searchQuery !== undefined) {
        const query = action.payload.searchQuery.toLowerCase().trim();
        if (query) {
          const field = action.payload.searchField || state.searchField;
          filtered = filtered.filter(acc => {
            switch (field) {
              case "username":
                return acc.username.toLowerCase().includes(query);
              case "full_name":
                return acc.full_name.toLowerCase().includes(query);
              case "email":
                return acc.email.toLowerCase().includes(query);
              case "phone":
                return acc.phone?.toLowerCase().includes(query);
              case "shop_code":
                return acc.shop_code.toLowerCase().includes(query);
              case "role":
                return acc.role_label.toLowerCase().includes(query);
              case "all":
              default:
                return acc.username.toLowerCase().includes(query) ||
                  acc.full_name.toLowerCase().includes(query) ||
                  acc.email.toLowerCase().includes(query) ||
                  acc.phone?.toLowerCase().includes(query) ||
                  acc.shop_code.toLowerCase().includes(query) ||
                  acc.role_label.toLowerCase().includes(query);
            }
          });
        }
      } else if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(acc => {
          switch (state.searchField) {
            case "username":
              return acc.username.toLowerCase().includes(query);
            case "full_name":
              return acc.full_name.toLowerCase().includes(query);
            case "email":
              return acc.email.toLowerCase().includes(query);
            case "phone":
              return acc.phone?.toLowerCase().includes(query);
            case "shop_code":
              return acc.shop_code.toLowerCase().includes(query);
            case "role":
              return acc.role_label.toLowerCase().includes(query);
            case "all":
            default:
              return acc.username.toLowerCase().includes(query) ||
                acc.full_name.toLowerCase().includes(query) ||
                acc.email.toLowerCase().includes(query) ||
                acc.phone?.toLowerCase().includes(query) ||
                acc.shop_code.toLowerCase().includes(query) ||
                acc.role_label.toLowerCase().includes(query);
          }
        });
      }

      return {
        ...state,
        filteredAccounts: filtered,
        pagination: {
          ...state.pagination,
          page: 0
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

    case "SET_FILTERS":
      return {
        ...state,
        filters: action.payload,
        pagination: {
          ...state.pagination,
          page: 0
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
          page: 0
        }
      };

    case "SET_LOG_FILTER":
      return {
        ...state,
        logFilter: action.payload,
        logPagination: {
          ...state.logPagination,
          page: 0
        }
      };

    case "SET_SELECTED_ACCOUNT":
      return { ...state, selectedAccount: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_TABLE_LOADING":
      return { ...state, tableLoading: action.payload };

    case "RESET_PAGINATION":
      return {
        ...state,
        pagination: {
          ...initialState.pagination,
          size: state.pagination.size
        }
      };

    case "RESET_LOG_PAGINATION":
      return {
        ...state,
        logPagination: {
          ...initialState.logPagination,
          size: state.logPagination.size
        }
      };

    case "SET_DROPDOWN_DATA":
      return {
        ...state,
        dropdownData: action.payload
      };

    default:
      return state;
  }
};