export const initialState = {
  credits: [],
  creditsMap: new Map(),
  filteredCredits: [],
  selectedCredit: null,
  payments: [],
  
  logs: [],
  filteredLogs: [],
  selectedLog: null,

  error: null,
  loading: false,
  tableLoading: false,
  success: false,

  activeTab: "all-credits",
  searchQuery: "",
  searchField: "all",

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
    totalPages: 0,
    hasMore: false,
    hasPrevious: false
  },

  logFilter: "all",
  dateFilter: {
    filter: "all",
    customFrom: "",
    customTo: ""
  },

  statusCounts: {
    all: 0,
    pending: 0,
    partially_paid: 0,
    paid: 0,
    overdue: 0
  },

  actionTypeCounts: {
    all: 0,
    ADD: 0,
    EDIT: 0,
    DELETE: 0,
    PAYMENT_ADD: 0
  },

  summary: {
    totalCredit: 0,
    totalPaid: 0,
    totalRemaining: 0
  },

  lastUpdated: null
};

export const creditReducer = (state, action) => {
  switch (action.type) {

    case "FETCH_CREDITS": {
      const newCredits = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.pagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || 0;
      const statusCounts = action.payload.statusCounts || state.statusCounts;
      const summary = action.payload.summary || state.summary;

      const creditsMap = new Map();
      newCredits.forEach(credit => creditsMap.set(credit.id, credit));

      return {
        ...state,
        credits: newCredits,
        creditsMap,
        pagination: {
          ...state.pagination,
          page: currentPage,
          size: pageSize,
          total: totalItems,
          totalPages,
          hasMore: currentPage < totalPages,
          hasPrevious: currentPage > 1
        },
        statusCounts,
        summary,
        lastUpdated: new Date().toISOString()
      };
    }

    case "ADD_CREDIT": {
      const newCredit = action.payload.credit;

      const creditsMap = new Map(state.creditsMap);
      creditsMap.set(newCredit.id, newCredit);

      const updatedCredits = [...state.credits, newCredit];

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = (statusCounts.all || 0) + 1;
      statusCounts[newCredit.status] = (statusCounts[newCredit.status] || 0) + 1;

      const summary = { ...state.summary };
      summary.totalCredit = (summary.totalCredit || 0) + newCredit.totalAmount;
      summary.totalPaid = (summary.totalPaid || 0) + newCredit.paidAmount;
      summary.totalRemaining = (summary.totalRemaining || 0) + newCredit.remainingAmount;

      return {
        ...state,
        credits: updatedCredits,
        creditsMap,
        statusCounts,
        summary,
        success: true
      };
    }

    case "UPDATE_CREDIT": {
      const updatedCredit = action.payload.credit;

      const creditsMap = new Map(state.creditsMap);
      creditsMap.set(updatedCredit.id, updatedCredit);

      const updatedCredits = state.credits.map(c =>
        c.id === updatedCredit.id ? updatedCredit : c
      );

      const oldCredit = state.creditsMap.get(updatedCredit.id);

      const statusCounts = { ...state.statusCounts };
      const summary = { ...state.summary };

      if (oldCredit) {
        // Update status counts
        statusCounts[oldCredit.status] = Math.max(0, (statusCounts[oldCredit.status] || 0) - 1);
        statusCounts[updatedCredit.status] = (statusCounts[updatedCredit.status] || 0) + 1;

        // Update summary
        summary.totalCredit = (summary.totalCredit || 0) - oldCredit.totalAmount + updatedCredit.totalAmount;
        summary.totalPaid = (summary.totalPaid || 0) - oldCredit.paidAmount + updatedCredit.paidAmount;
        summary.totalRemaining = (summary.totalRemaining || 0) - oldCredit.remainingAmount + updatedCredit.remainingAmount;
      }

      return {
        ...state,
        credits: updatedCredits,
        creditsMap,
        selectedCredit: state.selectedCredit?.id === updatedCredit.id ? updatedCredit : state.selectedCredit,
        statusCounts,
        summary,
        success: true
      };
    }

    case "DELETE_CREDIT": {
      const creditId = action.payload.creditId;
      const deletedCredit = state.creditsMap.get(creditId);

      if (!deletedCredit) return state;

      const updatedCredits = state.credits.filter(c => c.id !== creditId);
      const updatedFilteredCredits = state.filteredCredits.filter(c => c.id !== creditId);

      const creditsMap = new Map(state.creditsMap);
      creditsMap.delete(creditId);

      const statusCounts = { ...state.statusCounts };
      statusCounts.all = Math.max(0, (statusCounts.all || 0) - 1);
      statusCounts[deletedCredit.status] = Math.max(0, (statusCounts[deletedCredit.status] || 0) - 1);

      const summary = { ...state.summary };
      summary.totalCredit = Math.max(0, (summary.totalCredit || 0) - deletedCredit.totalAmount);
      summary.totalPaid = Math.max(0, (summary.totalPaid || 0) - deletedCredit.paidAmount);
      summary.totalRemaining = Math.max(0, (summary.totalRemaining || 0) - deletedCredit.remainingAmount);

      return {
        ...state,
        credits: updatedCredits,
        creditsMap,
        filteredCredits: updatedFilteredCredits,
        statusCounts,
        summary,
        success: true
      };
    }

    case "ADD_PAYMENT": {
      const { creditId, payment } = action.payload;
      const oldCredit = state.creditsMap.get(creditId);

      if (!oldCredit) return state;

      const updatedCredit = {
        ...oldCredit,
        paidAmount: oldCredit.paidAmount + payment.paymentAmount,
        remainingAmount: oldCredit.remainingAmount - payment.paymentAmount,
        lastPaymentDate: payment.paymentDate,
        paymentCount: (oldCredit.paymentCount || 0) + 1
      };

      // Update status if needed
      if (updatedCredit.remainingAmount <= 0) {
        updatedCredit.status = "paid";
      } else if (updatedCredit.paidAmount > 0 && updatedCredit.remainingAmount > 0) {
        updatedCredit.status = "partially_paid";
      }

      // Check if overdue
      const today = new Date().toISOString().split('T')[0];
      if (updatedCredit.dueDate && updatedCredit.dueDate < today && updatedCredit.remainingAmount > 0) {
        updatedCredit.status = "overdue";
      }

      const creditsMap = new Map(state.creditsMap);
      creditsMap.set(creditId, updatedCredit);

      const updatedCredits = state.credits.map(c =>
        c.id === creditId ? updatedCredit : c
      );

      const statusCounts = { ...state.statusCounts };
      statusCounts[oldCredit.status] = Math.max(0, (statusCounts[oldCredit.status] || 0) - 1);
      statusCounts[updatedCredit.status] = (statusCounts[updatedCredit.status] || 0) + 1;

      const summary = { ...state.summary };
      summary.totalPaid = (summary.totalPaid || 0) + payment.paymentAmount;
      summary.totalRemaining = Math.max(0, (summary.totalRemaining || 0) - payment.paymentAmount);

      const payments = [...(state.payments || []), payment];

      return {
        ...state,
        credits: updatedCredits,
        creditsMap,
        payments,
        statusCounts,
        summary,
        success: true
      };
    }

    case "SET_PAYMENTS": {
      return {
        ...state,
        payments: action.payload
      };
    }

    case "FILTER_CREDITS": {
      let filtered = [...state.credits];

      if (state.activeTab !== "all-credits" && state.activeTab !== "history") {
        filtered = filtered.filter(c => c.status === state.activeTab);
      }

      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase().trim();
        filtered = filtered.filter(c => {
          switch(state.searchField) {
            case "customerName":
              return c.customerName?.toLowerCase().includes(query);
            case "phone":
              return c.phone?.includes(query);
            case "invoiceNo":
              return c.invoiceNo?.toLowerCase().includes(query);
            case "all":
            default:
              return (
                c.customerName?.toLowerCase().includes(query) ||
                c.phone?.includes(query) ||
                c.invoiceNo?.toLowerCase().includes(query) ||
                c.email?.toLowerCase().includes(query)
              );
          }
        });
      }

      return {
        ...state,
        filteredCredits: filtered
      };
    }

    case "FETCH_LOGS": {
      const newLogs = action.payload.data || [];
      const currentPage = action.payload.currentPage || 1;
      const pageSize = action.payload.pageSize || state.logPagination.size;
      const totalItems = action.payload.totalItems || 0;
      const totalPages = action.payload.totalPages || Math.ceil(totalItems / pageSize) || 1;
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

    case "FILTER_LOGS": {
      let filteredLogs = [...state.logs];

      if (state.logFilter !== "all") {
        filteredLogs = filteredLogs.filter(log => log.actionType === state.logFilter);
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

        filteredLogs = filteredLogs.filter(log => {
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

      filteredLogs.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
        const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
        return dateB - dateA;
      });

      return {
        ...state,
        filteredLogs
      };
    }

    case "SET_SELECTED_LOG": {
      const selectedLog = action.payload ? {
        ...action.payload,
        createdByName: action.payload.createdByName || 'Unknown User',
        createdByRole: action.payload.createdByRole || 'N/A'
      } : null;
      return { ...state, selectedLog };
    }

    case "SET_ACTIVE_TAB":
      return { ...state, activeTab: action.payload, pagination: { ...state.pagination, page: 1 } };

    case "SET_SEARCH_QUERY":
      return { ...state, searchQuery: action.payload, pagination: { ...state.pagination, page: 1 } };

    case "SET_SEARCH_FIELD":
      return { ...state, searchField: action.payload };

    case "SET_PAGINATION":
      return { ...state, pagination: { ...state.pagination, ...action.payload } };

    case "SET_LOG_PAGINATION":
      return { ...state, logPagination: { ...state.logPagination, ...action.payload } };

    case "SET_DATE_FILTER":
      return { ...state, dateFilter: { ...state.dateFilter, ...action.payload }, logPagination: { ...state.logPagination, page: 1 } };

    case "SET_LOG_FILTER":
      return { ...state, logFilter: action.payload, logPagination: { ...state.logPagination, page: 1 } };

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
        dateFilter: { filter: "all", customFrom: "", customTo: "" },
        logFilter: "all",
        pagination: { ...state.pagination, page: 1 },
        logPagination: { ...state.logPagination, page: 1 }
      };

    default:
      return state;
  }
};