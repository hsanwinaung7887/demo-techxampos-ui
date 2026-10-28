// src/components/user/CapitalPage.jsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import '../../light-style/user-css/capitalPage.css';
import CapitalInputModal from './CapitalInputModal';
import CapitalExportModal from './CapitalExportModal';

// ============================================================
// ✅ DEMO DATA - API/Reducer ဖယ်ပြီး ဒီထဲမှာပဲ ထည့်ထားတယ်
// ============================================================
const DEMO_USER = {
  id: 1,
  name: 'Demo Owner',
  username: 'demo_owner',
  role: 'OWNER',
  branchId: 1,
  shopId: 1,
};

const DEMO_SUMMARY = {
  totalCapital: 50000000,
  currentBalance: 32500000,
  totalWithdrawals: 12000000,
  totalTransfers: 5500000,
  monthlyCapital: 8000000,
  growthPercentage: '+12.5%',
  totalTransactions: 24,
  isClosed: false,
  closingDate: null,
  closingSales: null,
  closingCogs: null,
  closingExpense: null,
  closingProfitLoss: null,
};

const DEMO_TRANSACTIONS = [
  { id: 1, transactionNumber: 'TXN-001', type: 'INJECTION', category: 'Owner Investment', amount: 20000000, description: 'Initial capital injection', entryDate: '2026-09-01', status: 'ACTIVE', notes: 'Starting capital', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-01T09:00:00' },
  { id: 2, transactionNumber: 'TXN-002', type: 'INJECTION', category: 'Business Expansion', amount: 15000000, description: 'Branch expansion fund', entryDate: '2026-09-03', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-03T10:30:00' },
  { id: 3, transactionNumber: 'TXN-003', type: 'WITHDRAWAL', category: 'Owner Drawing', amount: 5000000, description: 'Owner personal withdrawal', entryDate: '2026-09-05', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-05T14:15:00' },
  { id: 4, transactionNumber: 'TXN-004', type: 'INJECTION', category: 'Emergency Fund', amount: 8000000, description: 'Emergency reserve', entryDate: '2026-09-08', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-08T11:00:00' },
  { id: 5, transactionNumber: 'TXN-005', type: 'TRANSFER', category: 'Equipment Purchase', amount: 5500000, description: 'Transfer for equipment', entryDate: '2026-09-10', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-10T16:45:00' },
  { id: 6, transactionNumber: 'TXN-006', type: 'WITHDRAWAL', category: 'Loan Repayment', amount: 7000000, description: 'Bank loan repayment', entryDate: '2026-09-12', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-12T09:20:00' },
  { id: 7, transactionNumber: 'TXN-007', type: 'INJECTION', category: 'Owner Investment', amount: 12000000, description: 'Additional investment', entryDate: '2026-09-15', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-15T13:00:00' },
  { id: 8, transactionNumber: 'TXN-008', type: 'TRANSFER', category: 'Other', amount: 3000000, description: 'Misc transfer', entryDate: '2026-09-18', status: 'REVERSED', notes: 'Reversed', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-18T10:10:00' },
  { id: 9, transactionNumber: 'TXN-009', type: 'INJECTION', category: 'Business Expansion', amount: 9000000, description: 'New branch setup', entryDate: '2026-09-20', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-20T08:30:00' },
  { id: 10, transactionNumber: 'TXN-010', type: 'WITHDRAWAL', category: 'Owner Drawing', amount: 2500000, description: 'Monthly drawing', entryDate: '2026-09-22', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-22T15:00:00' },
  { id: 11, transactionNumber: 'TXN-011', type: 'INJECTION', category: 'Emergency Fund', amount: 6000000, description: 'Extra emergency fund', entryDate: '2026-09-25', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-25T12:00:00' },
  { id: 12, transactionNumber: 'TXN-012', type: 'TRANSFER', category: 'Equipment Purchase', amount: 4000000, description: 'New machines', entryDate: '2026-09-28', status: 'ACTIVE', notes: '', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-28T09:45:00' },
];

const DEMO_LOGS = [
  { id: 1, actionType: 'CREATE', actionLabel: 'Capital Injection', description: 'Injected 20,000,000 Ks as initial capital', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-01T09:00:00' },
  { id: 2, actionType: 'CREATE', actionLabel: 'Capital Injection', description: 'Injected 15,000,000 Ks for expansion', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-03T10:30:00' },
  { id: 3, actionType: 'CREATE', actionLabel: 'Withdrawal', description: 'Withdrew 5,000,000 Ks for owner drawing', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-05T14:15:00' },
  { id: 4, actionType: 'CREATE', actionLabel: 'Capital Injection', description: 'Injected 8,000,000 Ks emergency fund', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-08T11:00:00' },
  { id: 5, actionType: 'CREATE', actionLabel: 'Transfer', description: 'Transferred 5,500,000 Ks for equipment', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-10T16:45:00' },
  { id: 6, actionType: 'DELETE', actionLabel: 'Transaction Deleted', description: 'Deleted a reversed transaction', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-18T11:00:00' },
  { id: 7, actionType: 'CLOSE', actionLabel: 'Period Closed', description: 'Closed period for August 2026', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-01T00:00:00' },
  { id: 8, actionType: 'CREATE', actionLabel: 'Capital Injection', description: 'Injected 12,000,000 Ks additional', createdByName: 'Demo Owner', createdByRole: 'OWNER', createdAt: '2026-09-15T13:00:00' },
];

const DEMO_CLOSING_HISTORY = [
  { id: 1, closingDate: '2026-08-31', profitLoss: 5900000, previousCapital: 45000000, closedBy: 'Demo Owner', createdByName: 'Demo Owner', notes: 'August 2026 closing - strong month' },
  { id: 2, closingDate: '2026-07-31', profitLoss: -1200000, previousCapital: 42000000, closedBy: 'Demo Owner', createdByName: 'Demo Owner', notes: 'July 2026 closing - slight loss due to renovation' },
  { id: 3, closingDate: '2026-06-30', profitLoss: 3800000, previousCapital: 38000000, closedBy: 'Demo Owner', createdByName: 'Demo Owner', notes: 'June 2026 closing - steady growth' },
  { id: 4, closingDate: '2026-05-31', profitLoss: 2100000, previousCapital: 35000000, closedBy: 'Demo Owner', createdByName: 'Demo Owner', notes: 'May 2026 closing' },
  { id: 5, closingDate: '2026-04-30', profitLoss: 4500000, previousCapital: 32000000, closedBy: 'Demo Owner', createdByName: 'Demo Owner', notes: 'April 2026 closing - good sales' },
  { id: 6, closingDate: '2026-03-31', profitLoss: -800000, previousCapital: 30000000, closedBy: 'Demo Owner', createdByName: 'Demo Owner', notes: 'March 2026 closing' },
];

const DEMO_BRANCH_PROFIT = 5900000;

// ============================================================
// CUSTOM HOOKS
// ============================================================
const useLanguage = () => {
  const [lang, setLang] = useState(localStorage.getItem('appLanguage') || 'mm');

  useEffect(() => {
    const handler = (e) => setLang(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);

  return lang;
};

// ============================================================
// HELPER FUNCTIONS
// ============================================================
const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0 Ks';
  const num = typeof amount === 'number' ? amount : parseFloat(amount);
  if (isNaN(num)) return '0 Ks';
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(num) + ' Ks';
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getTransactionTypeBadge = (type) => {
  const map = {
    'INJECTION': 'type-injection',
    'WITHDRAWAL': 'type-withdrawal',
    'TRANSFER': 'type-transfer',
    'CLOSING': 'type-closing'
  };
  return map[type] || 'type-other';
};

const getTransactionTypeLabel = (type, lang) => {
  const map = {
    'INJECTION': { mm: 'ထည့်သွင်း', en: 'Injection' },
    'WITHDRAWAL': { mm: 'ထုတ်ယူ', en: 'Withdrawal' },
    'TRANSFER': { mm: 'လွှဲပြောင်း', en: 'Transfer' },
    'CLOSING': { mm: 'စာရင်းပိတ်', en: 'Closing' }
  };
  return map[type]?.[lang] || type;
};

const getStatusBadge = (status) => {
  const map = {
    'ACTIVE': 'status-active',
    'REVERSED': 'status-reversed',
    'CANCELLED': 'status-cancelled',
    'CLOSED': 'status-closed'
  };
  return map[status] || 'status-other';
};

const getStatusLabel = (status, lang) => {
  const map = {
    'ACTIVE': { mm: 'အသက်ဝင်သည်', en: 'Active' },
    'REVERSED': { mm: 'ပြန်လည်ပြင်ဆင်', en: 'Reversed' },
    'CANCELLED': { mm: 'ပယ်ဖျက်ထား', en: 'Cancelled' },
    'CLOSED': { mm: 'စာရင်းပိတ်ပြီး', en: 'Closed' }
  };
  return map[status]?.[lang] || status;
};

const getProfitLossDisplay = (value, lang) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return '0 Ks';
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(Math.abs(num));
  if (num > 0) return `+${formatted} Ks`;
  if (num < 0) return `-${formatted} Ks`;
  return '0 Ks';
};

const getProfitLossColor = (value) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return '#6b7280';
  if (num > 0) return '#10b981';
  if (num < 0) return '#ef4444';
  return '#6b7280';
};

const getProfitLossLabel = (value, lang) => {
  const num = typeof value === 'number' ? value : parseFloat(value);
  if (isNaN(num)) return lang === 'mm' ? 'သုည' : 'Zero';
  if (num > 0) return lang === 'mm' ? 'အမြတ်' : 'Profit';
  if (num < 0) return lang === 'mm' ? 'အရှုံး' : 'Loss';
  return lang === 'mm' ? 'သုည' : 'Zero';
};

// ============================================================
// MAIN COMPONENT
// ============================================================
const CapitalPage = () => {
  const lang = useLanguage();

  // ===== Local States (Redux ဖယ်ပြီး local state ပြောင်း) =====
  const [summary, setSummary] = useState(DEMO_SUMMARY);
  const [transactions, setTransactions] = useState(DEMO_TRANSACTIONS);
  const [logs, setLogs] = useState(DEMO_LOGS);
  const [closingHistory, setClosingHistory] = useState(DEMO_CLOSING_HISTORY);
  const [branchProfit, setBranchProfit] = useState(DEMO_BRANCH_PROFIT);

  const [pagination, setPagination] = useState({ page: 1, size: 10, total: DEMO_TRANSACTIONS.length, totalPages: Math.ceil(DEMO_TRANSACTIONS.length / 10) });
  const [logPagination, setLogPagination] = useState({ page: 1, size: 10, total: DEMO_LOGS.length, totalPages: Math.ceil(DEMO_LOGS.length / 10) });
  const [closingPagination, setClosingPagination] = useState({ page: 1, size: 6, total: DEMO_CLOSING_HISTORY.length, totalPages: Math.ceil(DEMO_CLOSING_HISTORY.length / 6) });

  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // ===== Current User (Demo) =====
  const currentUser = useMemo(() => DEMO_USER, []);
  const branchId = currentUser?.branchId;

  // ===== Local States =====
  const [activeTab, setActiveTab] = useState('transactions');
  const [pageInputValue, setPageInputValue] = useState("1");
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  const [closingPageInputValue, setClosingPageInputValue] = useState("1");
  const [loadingDirection, setLoadingDirection] = useState(null);
  const pageChangeTimeoutRef = useRef(null);

  // ===== Debounce Search =====
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const searchTimeoutRef = useRef(null);
  const [isClosing, setIsClosing] = useState(false);

  // ===== Export Modal State =====
  const [showExportModal, setShowExportModal] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);

  // ===== Modal States =====
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showClosingModal, setShowClosingModal] = useState(false);
  const [showLogDetailModal, setShowLogDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);

  // ===== Closing Data =====
  const [closingData, setClosingData] = useState({
    profitLoss: '',
    notes: '',
    closingDate: new Date().toISOString().split('T')[0]
  });

  // ============================================================
  // EFFECTS
  // ============================================================

  // Sync searchTerm
  useEffect(() => {
    if (searchTerm !== localSearchTerm) {
      setLocalSearchTerm(searchTerm);
    }
  }, [searchTerm]);

  // Debounced Search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      if (localSearchTerm !== searchTerm) {
        setSearchTerm(localSearchTerm);
        setPagination(prev => ({ ...prev, page: 1 }));
        setPageInputValue("1");
      }
    }, 500);
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [localSearchTerm, searchTerm]);

  // Clear Success/Error
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, []);

  // ============================================================
  // ✅ FILTERED DATA (demo အတွက် local filter)
  // ============================================================
  const filteredTransactions = useMemo(() => {
    let result = [...transactions];
    if (filterType !== 'all') {
      result = result.filter(t => t.type === filterType);
    }
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      result = result.filter(t =>
        (t.description || '').toLowerCase().includes(s) ||
        (t.category || '').toLowerCase().includes(s) ||
        (t.transactionNumber || '').toLowerCase().includes(s)
      );
    }
    return result;
  }, [transactions, filterType, searchTerm]);

  const paginatedTransactions = useMemo(() => {
    const start = (pagination.page - 1) * pagination.size;
    return filteredTransactions.slice(start, start + pagination.size);
  }, [filteredTransactions, pagination.page, pagination.size]);

  const paginatedLogs = useMemo(() => {
    const start = (logPagination.page - 1) * logPagination.size;
    return logs.slice(start, start + logPagination.size);
  }, [logs, logPagination.page, logPagination.size]);

  const paginatedClosing = useMemo(() => {
    const start = (closingPagination.page - 1) * closingPagination.size;
    return closingHistory.slice(start, start + closingPagination.size);
  }, [closingHistory, closingPagination.page, closingPagination.size]);

  // Sync pagination total when filter changes
  useEffect(() => {
    setPagination(prev => ({
      ...prev,
      total: filteredTransactions.length,
      totalPages: Math.max(1, Math.ceil(filteredTransactions.length / prev.size))
    }));
  }, [filteredTransactions.length]);

  // ============================================================
  // EXPORT HANDLER (demo - CSV download)
  // ============================================================
  const handleExport = async (exportType) => {
    setExportLoading(true);
    try {
      // Demo: CSV download
      let rows = [];
      if (exportType === 'transactions' || exportType === 'both') {
        rows.push(['=== TRANSACTIONS ===']);
        rows.push(['No', 'Date', 'Type', 'Category', 'Description', 'Amount', 'Status']);
        transactions.forEach((t, i) => {
          rows.push([i + 1, t.entryDate, t.type, t.category, t.description, t.amount, t.status]);
        });
        rows.push([]);
      }
      if (exportType === 'logs' || exportType === 'both') {
        rows.push(['=== LOGS ===']);
        rows.push(['No', 'Action', 'Description', 'User', 'Date']);
        logs.forEach((l, i) => {
          rows.push([i + 1, l.actionLabel, l.description, l.createdByName, l.createdAt]);
        });
      }

      const csv = rows.map(r => r.map(c => `"${c ?? ''}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `capital_demo_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      setSuccess(true);
    } catch (err) {
      console.error('Export error:', err);
      alert('Export failed: ' + err.message);
    } finally {
      setExportLoading(false);
      setShowExportModal(false);
    }
  };

  // ============================================================
  // HANDLERS (demo - local state update)
  // ============================================================
  const handleAddTransaction = () => {
    if (summary.isClosed) {
      alert(lang === 'mm' ? 'စာရင်းပိတ်ထားပြီးဖြစ်၍ မတည်ငွေထည့်သွင်းရန် မဖြစ်နိုင်ပါ' : 'Cannot add capital because period is closed');
      return;
    }
    setShowAddModal(true);
  };

  const handleSaveTransaction = async (formData) => {
    if (summary.isClosed) {
      alert(lang === 'mm' ? 'စာရင်းပိတ်ထားပြီးဖြစ်၍ မတည်ငွေထည့်သွင်းရန် မဖြစ်နိုင်ပါ' : 'Cannot add capital because period is closed');
      return;
    }

    const amount = parseFloat(formData.amount);
    const newTx = {
      id: Date.now(),
      transactionNumber: `TXN-${String(transactions.length + 1).padStart(3, '0')}`,
      type: formData.type,
      category: formData.category,
      amount: amount,
      description: formData.description,
      entryDate: formData.entryDate,
      status: 'ACTIVE',
      notes: formData.notes || '',
      createdByName: currentUser.name,
      createdByRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };

    // Update transactions
    const updated = [newTx, ...transactions];
    setTransactions(updated);

    // Update summary
    setSummary(prev => {
      const isInjection = formData.type === 'INJECTION';
      const isWithdrawal = formData.type === 'WITHDRAWAL';
      return {
        ...prev,
        totalCapital: isInjection ? prev.totalCapital + amount : prev.totalCapital,
        currentBalance: isInjection ? prev.currentBalance + amount : isWithdrawal ? prev.currentBalance - amount : prev.currentBalance,
        totalWithdrawals: isWithdrawal ? prev.totalWithdrawals + amount : prev.totalWithdrawals,
        totalTransfers: formData.type === 'TRANSFER' ? prev.totalTransfers + amount : prev.totalTransfers,
        monthlyCapital: isInjection ? prev.monthlyCapital + amount : prev.monthlyCapital,
        totalTransactions: prev.totalTransactions + 1,
      };
    });

    // Add log
    const newLog = {
      id: Date.now(),
      actionType: 'CREATE',
      actionLabel: formData.type === 'INJECTION' ? 'Capital Injection' : formData.type === 'WITHDRAWAL' ? 'Withdrawal' : 'Transfer',
      description: `${formData.type} of ${amount.toLocaleString()} Ks - ${formData.description}`,
      createdByName: currentUser.name,
      createdByRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);

    setSuccess(true);
    setShowAddModal(false);
  };

  const handleViewTransaction = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleViewLogDetail = (log) => {
    setSelectedLog(log);
    setShowLogDetailModal(true);
  };

  const handleDeleteTransaction = (transaction) => {
    if (transaction.isClosingEntry) {
      alert(lang === 'mm' ? 'စာရင်းပိတ်မှတ်တမ်းကို ဖျက်၍မရပါ' : 'Cannot delete closing entry');
      return;
    }
    if (summary.isClosed) {
      alert(lang === 'mm' ? 'စာရင်းပိတ်ထားပြီးဖြစ်၍ ဖျက်၍မရပါ' : 'Cannot delete because period is closed');
      return;
    }
    setDeleteTarget(transaction);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const tx = deleteTarget;

    // Update transactions
    setTransactions(prev => prev.filter(t => t.id !== tx.id));

    // Update summary (revert)
    setSummary(prev => {
      const isInjection = tx.type === 'INJECTION';
      const isWithdrawal = tx.type === 'WITHDRAWAL';
      return {
        ...prev,
        totalCapital: isInjection ? prev.totalCapital - tx.amount : prev.totalCapital,
        currentBalance: isInjection ? prev.currentBalance - tx.amount : isWithdrawal ? prev.currentBalance + tx.amount : prev.currentBalance,
        totalWithdrawals: isWithdrawal ? prev.totalWithdrawals - tx.amount : prev.totalWithdrawals,
        totalTransfers: tx.type === 'TRANSFER' ? prev.totalTransfers - tx.amount : prev.totalTransfers,
        totalTransactions: Math.max(0, prev.totalTransactions - 1),
      };
    });

    // Add log
    const newLog = {
      id: Date.now(),
      actionType: 'DELETE',
      actionLabel: 'Transaction Deleted',
      description: `Deleted ${tx.type} of ${tx.amount.toLocaleString()} Ks - ${tx.description}`,
      createdByName: currentUser.name,
      createdByRole: currentUser.role,
      createdAt: new Date().toISOString(),
    };
    setLogs(prev => [newLog, ...prev]);

    setSuccess(true);
    setShowDeleteModal(false);
    setDeleteTarget(null);
  };

  const handleClosing = async () => {
    if (summary.isClosed) {
      alert(lang === 'mm' ? 'စာရင်းပိတ်ပြီးဖြစ်ပါသည်' : 'Period is already closed');
      return;
    }
    setShowClosingModal(true);
    setClosingData({
      profitLoss: branchProfit.toString(),
      notes: '',
      closingDate: new Date().toISOString().split('T')[0]
    });
  };

  const confirmClosing = async () => {
    setIsClosing(true);
    const profitLoss = parseFloat(closingData.profitLoss) || 0;

    try {
      const newCapital = summary.totalCapital + profitLoss;

      // Add closing transaction
      const newTx = {
        id: Date.now(),
        transactionNumber: `CLS-${String(closingHistory.length + 1).padStart(3, '0')}`,
        type: 'CLOSING',
        category: 'Period Closing',
        amount: profitLoss,
        description: `Period closed - Profit/Loss: ${profitLoss.toLocaleString()} Ks`,
        entryDate: closingData.closingDate,
        status: 'CLOSED',
        notes: closingData.notes || '',
        isClosingEntry: true,
        profitLoss: profitLoss,
        createdByName: currentUser.name,
        createdByRole: currentUser.role,
        createdAt: new Date().toISOString(),
      };
      setTransactions(prev => [newTx, ...prev]);

      // Add closing history
      const newHistory = {
        id: Date.now(),
        closingDate: closingData.closingDate,
        profitLoss: profitLoss,
        previousCapital: summary.totalCapital,
        closedBy: currentUser.name,
        createdByName: currentUser.name,
        notes: closingData.notes || '',
      };
      setClosingHistory(prev => [newHistory, ...prev]);

      // Update summary
      setSummary(prev => ({
        ...prev,
        totalCapital: newCapital,
        currentBalance: newCapital,
        isClosed: true,
        closingDate: closingData.closingDate,
        closingProfitLoss: profitLoss,
      }));

      // Add log
      const newLog = {
        id: Date.now(),
        actionType: 'CLOSE',
        actionLabel: 'Period Closed',
        description: `Closed period with Profit/Loss: ${profitLoss.toLocaleString()} Ks`,
        createdByName: currentUser.name,
        createdByRole: currentUser.role,
        createdAt: new Date().toISOString(),
      };
      setLogs(prev => [newLog, ...prev]);

      setShowClosingModal(false);
      setClosingData({
        profitLoss: '',
        notes: '',
        closingDate: new Date().toISOString().split('T')[0]
      });
      setSuccess(true);

      alert(lang === 'mm' ? '✅ စာရင်းပိတ်ခြင်း အောင်မြင်ပါသည်' : '✅ Period closed successfully');
    } catch (err) {
      console.error('❌ Close period error:', err);
      alert(`Error: ${err.message}`);
    } finally {
      setIsClosing(false);
    }
  };

  // ============================================================
  // PAGINATION HANDLERS
  // ============================================================
  const changePage = useCallback((newPage, direction) => {
    if (newPage === pagination.page || newPage < 1 || newPage > pagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      setPagination(prev => ({ ...prev, page: newPage }));
      setPageInputValue(newPage.toString());
      setLoadingDirection(null);
    }, 150);
  }, [pagination.page, pagination.totalPages]);

  const changeLogPage = useCallback((newPage, direction) => {
    if (newPage === logPagination.page || newPage < 1 || newPage > logPagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      setLogPagination(prev => ({ ...prev, page: newPage }));
      setHistoryPageInputValue(newPage.toString());
      setLoadingDirection(null);
    }, 150);
  }, [logPagination.page, logPagination.totalPages]);

  const changeClosingPage = useCallback((newPage, direction) => {
    if (newPage === closingPagination.page || newPage < 1 || newPage > closingPagination.totalPages) return;
    if (pageChangeTimeoutRef.current) clearTimeout(pageChangeTimeoutRef.current);
    setLoadingDirection(direction);
    pageChangeTimeoutRef.current = setTimeout(() => {
      setClosingPagination(prev => ({ ...prev, page: newPage }));
      setClosingPageInputValue(newPage.toString());
      setLoadingDirection(null);
    }, 150);
  }, [closingPagination.page, closingPagination.totalPages]);

  const handlePageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setPagination(prev => ({ ...prev, size: newSize, page: 1 }));
    setPageInputValue("1");
  };

  const handleLogPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setLogPagination(prev => ({ ...prev, size: newSize, page: 1 }));
    setHistoryPageInputValue("1");
  };

  const handleClosingPageSizeChange = (e) => {
    const newSize = parseInt(e.target.value);
    setClosingPagination(prev => ({ ...prev, size: newSize, page: 1 }));
    setClosingPageInputValue("1");
  };

  // ============================================================
  // TAB OPTIONS
  // ============================================================
  const tabOptions = [
    { value: 'transactions', label_mm: 'လွှဲပြောင်းမှုများ', label_en: 'Transactions', icon: 'fa-list' },
    { value: 'history', label_mm: 'မှတ်တမ်း', label_en: 'History', icon: 'fa-history' },
    { value: 'closing', label_mm: 'စာရင်းပိတ်မှတ်တမ်း', label_en: 'Closing History', icon: 'fa-lock' }
  ];

  // ============================================================
  // RENDER
  // ============================================================
  if (!currentUser) {
    return (
      <div className="capital-container">
        <div className="capital-loading-state">
          <i className="fas fa-spinner fa-spin"></i>
          <p>{lang === 'mm' ? 'အသုံးပြုသူဒေတာ ဖွင့်နေသည်...' : 'Loading user data...'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="capital-container">
      {/* ===== HEADER ===== */}
      <div className="capital-header">
        <div className="capital-header-left">
          <div className="capital-tab-select-container">
            <i className={`fas ${tabOptions.find(t => t.value === activeTab)?.icon || 'fa-list'} capital-tab-select-icon`}></i>
            <select
              className="capital-tab-select"
              value={activeTab}
              onChange={(e) => {
                const value = e.target.value;
                if (value === 'export') {
                  setShowExportModal(true);
                  e.target.value = activeTab;
                  return;
                }
                setActiveTab(value);
              }}
              disabled={loading}
            >
              {tabOptions.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {lang === 'mm' ? opt.label_mm : opt.label_en}
                </option>
              ))}
              <option value="export" style={{ color: '#10b981', fontWeight: 'bold', borderTop: '1px solid #e9ecef' }}>
                {lang === 'mm' ? 'ဒေတာတင်ပို့ရန်' : 'Export Data'}
              </option>
            </select>
            <i className="fas fa-chevron-down capital-tab-select-arrow"></i>
          </div>

          {summary.isClosed && (
            <span className="capital-closed-badge">
              <i className="fas fa-lock"></i>
              {lang === 'mm' ? 'စာရင်းပိတ်ပြီး' : 'Closed'}
            </span>
          )}
        </div>

        <div className="capital-header-center">
          {activeTab === 'transactions' && (
            <div className="capital-search-filter-wrapper">
              <div className="capital-search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder={lang === 'mm' ? 'ရှာဖွေရန်...' : 'Search...'}
                  value={localSearchTerm}
                  onChange={(e) => setLocalSearchTerm(e.target.value)}
                />
                {localSearchTerm && (
                  <button className="capital-clear-search" onClick={() => {
                    setLocalSearchTerm('');
                    setSearchTerm('');
                    setPagination(prev => ({ ...prev, page: 1 }));
                    setPageInputValue("1");
                  }}>
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>

              <select
                className="capital-filter-select"
                value={filterType}
                onChange={(e) => {
                  setFilterType(e.target.value);
                  setPagination(prev => ({ ...prev, page: 1 }));
                }}
              >
                <option value="all">{lang === 'mm' ? 'အားလုံး' : 'All Types'}</option>
                <option value="INJECTION">{lang === 'mm' ? 'ထည့်သွင်း' : 'Injection'}</option>
                <option value="WITHDRAWAL">{lang === 'mm' ? 'ထုတ်ယူ' : 'Withdrawal'}</option>
                <option value="TRANSFER">{lang === 'mm' ? 'လွှဲပြောင်း' : 'Transfer'}</option>
              </select>

              {(searchTerm || filterType !== 'all') && (
                <button className="capital-clear-filters-btn" onClick={() => {
                  setLocalSearchTerm('');
                  setSearchTerm('');
                  setFilterType('all');
                  setPagination(prev => ({ ...prev, page: 1 }));
                  setPageInputValue("1");
                }}>
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
          )}
        </div>

        <div className="capital-header-right">
          <button className="capital-closing-btn" onClick={handleClosing} disabled={summary.isClosed}>
            <i className="fas fa-lock"></i>
            {lang === 'mm' ? 'စာရင်းပိတ်မည်' : 'Close Period'}
          </button>
          <button className="capital-add-btn" onClick={handleAddTransaction} disabled={summary.isClosed}>
            <i className="fas fa-plus"></i>
            {lang === 'mm' ? 'မတည်ငွေထည့်သွင်း' : 'Add Capital'}
          </button>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="capital-summary-cards">
        <div className="capital-summary-card total">
          <div className="capital-summary-icon"><i className="fas fa-coins"></i></div>
          <div className="capital-summary-info">
            <div className="capital-summary-label">{lang === 'mm' ? 'စုစုပေါင်းမတည်ငွေ' : 'Total Capital'}</div>
            <div className="capital-summary-value">{formatCurrency(summary.totalCapital)}</div>
            <div className="capital-summary-sub">{lang === 'mm' ? 'စုစုပေါင်းထည့်သွင်းမှု' : 'Total Injections'}</div>
          </div>
        </div>

        <div className="capital-summary-card balance">
          <div className="capital-summary-icon" style={{ background: '#d1fae5', color: '#10b981' }}>
            <i className="fas fa-wallet"></i>
          </div>
          <div className="capital-summary-info">
            <div className="capital-summary-label">{lang === 'mm' ? 'လက်ရှိကျန်ငွေ' : 'Current Balance'}</div>
            <div className="capital-summary-value" style={{ color: summary.isClosed ? '#6b7280' : '#10b981' }}>
              {formatCurrency(summary.currentBalance)}
            </div>
            <div className="capital-summary-sub">
              {summary.isClosed 
                ? (lang === 'mm' ? 'စာရင်းပိတ်ပြီး' : 'Closed') 
                : (lang === 'mm' ? 'အသုံးပြုနိုင်ငွေ' : 'Available')}
            </div>
          </div>
        </div>

        <div className="capital-summary-card withdrawals">
          <div className="capital-summary-icon" style={{ background: '#fef3c7', color: '#f59e0b' }}>
            <i className="fas fa-arrow-up"></i>
          </div>
          <div className="capital-summary-info">
            <div className="capital-summary-label">{lang === 'mm' ? 'စုစုပေါင်းထုတ်ယူမှု' : 'Total Withdrawals'}</div>
            <div className="capital-summary-value" style={{ color: '#f59e0b' }}>{formatCurrency(summary.totalWithdrawals)}</div>
            <div className="capital-summary-sub">{summary.totalTransactions} {lang === 'mm' ? 'အကြိမ်' : 'transactions'}</div>
          </div>
        </div>

        <div className="capital-summary-card monthly">
          <div className="capital-summary-icon" style={{ background: '#eff6ff', color: '#3b82f6' }}>
            <i className="fas fa-calendar-alt"></i>
          </div>
          <div className="capital-summary-info">
            <div className="capital-summary-label">{lang === 'mm' ? 'ဒီလမတည်ငွေ' : 'This Month'}</div>
            <div className="capital-summary-value" style={{ color: '#3b82f6' }}>{formatCurrency(summary.monthlyCapital)}</div>
            <div className="capital-summary-sub">{summary.growthPercentage} {lang === 'mm' ? 'တိုးတက်မှု' : 'growth'}</div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ===== TRANSACTIONS TAB ===== */}
      {/* ============================================================ */}
      {activeTab === 'transactions' && (
        <>
          <div className="capital-pagination-top">
            <div className="capital-pagination-title">
              <i className="fas fa-list"></i>
              <span>{lang === 'mm' ? 'လွှဲပြောင်းမှုများ' : 'Transactions'}</span>
            </div>

            <div className="capital-pagination-controls">
              <button className="capital-nav-btn" onClick={() => changePage(pagination.page - 1, 'prev')} disabled={pagination.page === 1 || loading}>
                {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
              </button>
              <div className="capital-page-control">
                <input type="text" className="capital-page-input" value={pageInputValue} onChange={(e) => setPageInputValue(e.target.value)} onBlur={() => {
                  const value = parseInt(pageInputValue);
                  if (!isNaN(value) && value >= 1 && value <= pagination.totalPages && value !== pagination.page) {
                    changePage(value, 'jump');
                  } else {
                    setPageInputValue(pagination.page.toString());
                  }
                }} onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                <span className="capital-page-total">/ {pagination.totalPages.toLocaleString()}</span>
              </div>
              <button className="capital-nav-btn" onClick={() => changePage(pagination.page + 1, 'next')} disabled={pagination.page === pagination.totalPages || pagination.totalPages === 0 || loading}>
                {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
              </button>
              <div className="capital-items-per-page">
                <select className="capital-per-page-select" value={pagination.size} onChange={handlePageSizeChange} disabled={loading}>
                  <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                </select>
                <span className="capital-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
              </div>
            </div>
            <div className="capital-pagination-info">
              {loading ? (
                <span className="capital-loading-text"><i className="fas fa-spinner fa-spin"></i> {lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
              ) : (
                <span className="capital-showing-count">
                  {pagination.total > 0 ? ((pagination.page - 1) * pagination.size) + 1 : 0} - {Math.min(pagination.page * pagination.size, pagination.total)} / {pagination.total.toLocaleString()} {lang === 'mm' ? 'ခု' : 'items'}
                </span>
              )}
            </div>
          </div>

          <div className="capital-table-wrapper">
            <table className="capital-table">
              <thead>
                <tr>
                  <th>{lang === 'mm' ? 'နံပါတ်' : 'No'}</th>
                  <th>{lang === 'mm' ? 'ရက်စွဲ' : 'Date'}</th>
                  <th>{lang === 'mm' ? 'အမျိုးအစား' : 'Type'}</th>
                  <th>{lang === 'mm' ? 'ဖော်ပြချက်' : 'Description'}</th>
                  <th>{lang === 'mm' ? 'ပမာဏ' : 'Amount'}</th>
                  <th>{lang === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                  <th>{lang === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="7" className="capital-no-data"><div className="capital-no-data-content"><i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', marginBottom: '15px' }}></i><p>{lang === 'mm' ? 'ဒေတာများ ရယူနေသည်...' : 'Loading data...'}</p></div></td></tr>
                ) : paginatedTransactions.length > 0 ? (
                  paginatedTransactions.map((transaction, index) => (
                    <tr key={transaction.id}>
                      <td>{((pagination.page - 1) * pagination.size) + index + 1}</td>
                      <td>{formatDate(transaction.entryDate)}</td>
                      <td><span className={`capital-type-badge ${getTransactionTypeBadge(transaction.type)}`}>{getTransactionTypeLabel(transaction.type, lang)}</span></td>
                      <td><div className="capital-description-cell"><span className="capital-description">{transaction.description}</span><span className="capital-category">{transaction.category}</span></div></td>
                      <td className={`capital-amount ${transaction.type === 'INJECTION' ? 'positive' : transaction.type === 'WITHDRAWAL' ? 'negative' : 'neutral'}`}>
                        {transaction.type === 'INJECTION' ? '+' : transaction.type === 'WITHDRAWAL' ? '-' : '→'}{formatCurrency(transaction.amount)}
                      </td>
                      <td><span className={`capital-status-badge ${getStatusBadge(transaction.status)}`}>{getStatusLabel(transaction.status, lang)}</span></td>
                      <td>
                        <div className="capital-actions">
                          <button className="capital-btn-view" onClick={() => handleViewTransaction(transaction)} title={lang === 'mm' ? 'အသေးစိတ်ကြည့်ရန်' : 'View Details'}><i className="fas fa-eye"></i></button>
                          <button className="capital-btn-delete" onClick={() => handleDeleteTransaction(transaction)} title={lang === 'mm' ? 'ဖျက်ရန်' : 'Delete'} disabled={summary.isClosed || transaction.type === 'CLOSING'}><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan="7" className="capital-empty-state"><div className="capital-no-data-content"><i className="fas fa-building-columns"></i><p>{lang === 'mm' ? 'မတည်ငွေလွှဲပြောင်းမှု မရှိပါ' : 'No capital transactions found'}</p><span>{lang === 'mm' ? 'ရှာဖွေမှု သို့မဟုတ် စစ်ထုတ်မှုကို ပြောင်းလဲကြည့်ပါ' : 'Try adjusting your search or filter'}</span></div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* ============================================================ */}
      {/* ===== HISTORY TAB ===== */}
      {/* ============================================================ */}
      {activeTab === 'history' && (
        <>
          <div className="capital-history-header">
            <div className="capital-history-info"><i className="fas fa-history"></i><span>{lang === 'mm' ? 'မှတ်တမ်း' : 'History'}</span></div>
            <div className="capital-pagination-right">
              <div className="capital-pagination-controls">
                <button className="capital-nav-btn" onClick={() => changeLogPage(logPagination.page - 1, 'prev')} disabled={logPagination.page === 1 || loading}>
                  {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                </button>
                <div className="capital-page-control">
                  <input type="text" className="capital-page-input" value={historyPageInputValue} onChange={(e) => setHistoryPageInputValue(e.target.value)} onBlur={() => {
                    const value = parseInt(historyPageInputValue);
                    if (!isNaN(value) && value >= 1 && value <= logPagination.totalPages && value !== logPagination.page) {
                      changeLogPage(value, 'jump');
                    } else {
                      setHistoryPageInputValue(logPagination.page.toString());
                    }
                  }} onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                  <span className="capital-page-total">/ {logPagination.totalPages.toLocaleString()}</span>
                </div>
                <button className="capital-nav-btn" onClick={() => changeLogPage(logPagination.page + 1, 'next')} disabled={logPagination.page === logPagination.totalPages || logPagination.totalPages === 0 || loading}>
                  {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                </button>
                <div className="capital-items-per-page">
                  <select className="capital-per-page-select" value={logPagination.size} onChange={handleLogPageSizeChange} disabled={loading}>
                    <option value={10}>10</option><option value={20}>20</option><option value={50}>50</option><option value={100}>100</option>
                  </select>
                  <span className="capital-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                </div>
              </div>
            </div>
            <div className="capital-pagination-info">
                {loading ? (
                  <span className="capital-loading-text"><i className="fas fa-spinner fa-spin"></i> {lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
                ) : (
                  <span className="capital-showing-count">
                    {logPagination.total > 0 ? ((logPagination.page - 1) * logPagination.size) + 1 : 0} - {Math.min(logPagination.page * logPagination.size, logPagination.total)} / {logPagination.total.toLocaleString()} {lang === 'mm' ? 'ခု' : 'items'}
                  </span>
                )}
              </div>
          </div>

          <div className="capital-history-section">
            {loading ? (
              <div className="capital-loading-state"><i className="fas fa-spinner fa-spin"></i><p>{lang === 'mm' ? 'မှတ်တမ်းများ ဖွင့်နေသည်...' : 'Loading logs...'}</p></div>
            ) : paginatedLogs.length > 0 ? (
              paginatedLogs.map((log) => (
                <div key={log.id} className="capital-log-entry" onClick={() => handleViewLogDetail(log)} style={{ cursor: 'pointer' }}>
                  <div className={`capital-log-icon ${log.actionType === 'DELETE' ? 'delete' : log.actionType === 'CLOSE' ? 'close' : ''}`}>
                    <i className={`fas ${log.actionType === 'CREATE' ? 'fa-plus-circle' : log.actionType === 'DELETE' ? 'fa-trash' : log.actionType === 'CLOSE' ? 'fa-lock' : 'fa-edit'}`}></i>
                  </div>
                  <div className="capital-log-content">
                    <div className="capital-log-header"><span className="capital-log-action">{log.actionLabel || log.actionType}</span><span className="capital-log-time">{formatDateTime(log.createdAt)}</span></div>
                    <div className="capital-log-description">{log.description}</div>
                    <div className="capital-log-user"><i className="fas fa-user"></i>{log.createdByName || 'Unknown'} <span className="capital-log-role">({log.createdByRole || 'N/A'})</span></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="capital-no-data"><div className="capital-no-data-content"><i className="fas fa-history"></i><p>{lang === 'mm' ? 'မှတ်တမ်း မရှိပါ' : 'No logs found'}</p><span>{lang === 'mm' ? 'လုပ်ဆောင်ချက်များ မရှိသေးပါ' : 'No activities yet'}</span></div></div>
            )}
          </div>
        </>
      )}

      {/* ===== Export Modal ===== */}
      <CapitalExportModal
        show={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
        loading={exportLoading}
        language={lang}
      />

      {/* ============================================================ */}
      {/* ===== CLOSING HISTORY TAB ===== */}
      {/* ============================================================ */}
      {activeTab === 'closing' && (
        <div className="capital-closing-tab-wrapper">
          <div className="capital-history-header">
            <div className="capital-history-info">
              <i className="fas fa-lock" style={{ color: '#f59e0b' }}></i>
              <span>{lang === 'mm' ? 'စာရင်းပိတ်မှတ်တမ်း' : 'Closing History'}</span>
            </div>
            <div className="capital-pagination-right">
              <div className="capital-pagination-controls">
                <button className="capital-nav-btn" onClick={() => changeClosingPage(closingPagination.page - 1, 'prev')} disabled={closingPagination.page === 1 || loading}>
                  {loading && loadingDirection === 'prev' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-left"></i>}
                </button>
                <div className="capital-page-control">
                  <input type="text" className="capital-page-input" value={closingPageInputValue} onChange={(e) => setClosingPageInputValue(e.target.value)} onBlur={() => {
                    const value = parseInt(closingPageInputValue);
                    if (!isNaN(value) && value >= 1 && value <= closingPagination.totalPages && value !== closingPagination.page) {
                      changeClosingPage(value, 'jump');
                    } else {
                      setClosingPageInputValue(closingPagination.page.toString());
                    }
                  }} onKeyPress={(e) => e.key === 'Enter' && e.target.blur()} disabled={loading} />
                  <span className="capital-page-total">/ {closingPagination.totalPages.toLocaleString()}</span>
                </div>
                <button className="capital-nav-btn" onClick={() => changeClosingPage(closingPagination.page + 1, 'next')} disabled={closingPagination.page === closingPagination.totalPages || closingPagination.totalPages === 0 || loading}>
                  {loading && loadingDirection === 'next' ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-chevron-right"></i>}
                </button>
                <div className="capital-items-per-page">
                  <select className="capital-per-page-select" value={closingPagination.size} onChange={handleClosingPageSizeChange} disabled={loading}>
                    <option value={6}>6</option><option value={12}>12</option><option value={24}>24</option><option value={48}>48</option>
                  </select>
                  <span className="capital-per-page-label">{lang === 'mm' ? '/စာမျက်နှာ' : '/pg'}</span>
                </div>
              </div>
            </div>
            <div className="capital-pagination-info">
              {loading ? (
                <span className="capital-loading-text"><i className="fas fa-spinner fa-spin"></i> {lang === 'mm' ? 'ဖွင့်နေသည်...' : 'Loading...'}</span>
              ) : (
                <span className="capital-showing-count">
                  {closingPagination.total > 0 ? ((closingPagination.page - 1) * closingPagination.size) + 1 : 0} - {Math.min(closingPagination.page * closingPagination.size, closingPagination.total)} / {closingPagination.total.toLocaleString()} {lang === 'mm' ? 'ခု' : 'items'}
                </span>
              )}
            </div>
          </div>

          <div className="capital-closing-card-grid">
            {loading ? (
              <div className="capital-loading-state" style={{ gridColumn: '1 / -1' }}>
                <i className="fas fa-spinner fa-spin"></i>
                <p>{lang === 'mm' ? 'စာရင်းပိတ်မှတ်တမ်းများ ဖွင့်နေသည်...' : 'Loading closing history...'}</p>
              </div>
            ) : paginatedClosing.length > 0 ? (
              paginatedClosing.map((history) => (
                <div key={history.id} className="capital-closing-card">
                  <div className="capital-closing-card-header">
                    <div className="capital-closing-card-period">
                      <i className="fas fa-calendar-alt"></i>
                      <span>{formatDate(history.closingDate)}</span>
                    </div>
                    <div className="capital-closing-card-badge">
                      <i className="fas fa-lock"></i>
                      {lang === 'mm' ? 'ပိတ်ပြီး' : 'Closed'}
                    </div>
                  </div>

                  <div className="capital-closing-card-body">
                    <div className="capital-closing-stat" style={{ gridColumn: '1 / -1' }}>
                      <span className="capital-closing-stat-label">
                        <i className="fas fa-money-bill-wave" style={{ color: getProfitLossColor(history.profitLoss) }}></i>
                        {lang === 'mm' ? 'အမြတ်/အရှုံး' : 'Profit/Loss'}
                        <span className="capital-closing-profit-label" style={{
                          fontSize: '10px',
                          fontWeight: 600,
                          color: getProfitLossColor(history.profitLoss),
                          background: getProfitLossColor(history.profitLoss) + '20',
                          padding: '1px 8px',
                          borderRadius: '12px',
                          marginLeft: '4px'
                        }}>
                          {getProfitLossLabel(history.profitLoss, lang)}
                        </span>
                      </span>
                      <span className="capital-closing-stat-value" style={{
                        color: getProfitLossColor(history.profitLoss),
                        fontWeight: 700
                      }}>
                        {getProfitLossDisplay(history.profitLoss, lang)}
                      </span>
                    </div>
                  </div>

                  <div className="capital-closing-card-capital">
                    <div className="capital-closing-capital-row">
                      <span className="capital-closing-capital-label">
                        <i className="fas fa-arrow-left" style={{ color: '#6b7280' }}></i>
                        {lang === 'mm' ? 'ယခင်မတည်ငွေ' : 'Previous Capital'}
                      </span>
                      <span className="capital-closing-capital-value" style={{ color: '#6b7280' }}>
                        {formatCurrency(history.previousCapital || 0)}
                      </span>
                    </div>

                    <div className="capital-closing-capital-arrow">
                      <i className="fas fa-arrow-down" style={{ color: '#f59e0b', fontSize: '14px' }}></i>
                    </div>

                    <div className="capital-closing-capital-row" style={{ background: '#d1fae5', borderRadius: '6px', padding: '6px 10px' }}>
                      <span className="capital-closing-capital-label" style={{ fontWeight: 700, color: '#065f46' }}>
                        <i className="fas fa-arrow-right" style={{ color: '#10b981' }}></i>
                        {lang === 'mm' ? 'လက်ရှိမတည်ငွေ' : 'New Capital'}
                      </span>
                      <span className="capital-closing-capital-value" style={{ fontWeight: 700, color: '#065f46', fontSize: '16px' }}>
                        {formatCurrency((history.previousCapital || 0) + (history.profitLoss || 0))}
                      </span>
                    </div>
                  </div>

                  <div className="capital-closing-card-footer">
                    <div className="capital-closing-card-user">
                      <i className="fas fa-user"></i>
                      <span>{history.closedBy || history.createdByName || 'Unknown'}</span>
                    </div>
                  </div>

                  {history.notes && (
                    <div className="capital-closing-card-notes">
                      <i className="fas fa-pen"></i>
                      <span>{history.notes}</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="capital-no-data" style={{ gridColumn: '1 / -1' }}>
                <div className="capital-no-data-content">
                  <i className="fas fa-lock"></i>
                  <p>{lang === 'mm' ? 'စာရင်းပိတ်မှတ်တမ်း မရှိပါ' : 'No closing history found'}</p>
                  <span>{lang === 'mm' ? 'စာရင်းပိတ်ခြင်း မရှိသေးပါ' : 'No closing entries yet'}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== MODALS ===== */}
      {/* ============================================================ */}

      <CapitalInputModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleSaveTransaction}
        loading={loading}
        lang={lang}
        isClosed={summary.isClosed}
      />

      {/* View Detail Modal */}
      {showDetailModal && selectedTransaction && (
        <div className="capital-modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="capital-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="capital-modal-header"><h3><i className="fas fa-info-circle"></i>{lang === 'mm' ? 'အသေးစိတ်အချက်အလက်' : 'Transaction Details'}</h3><button className="capital-modal-close" onClick={() => setShowDetailModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="capital-detail-body">
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'နံပါတ်' : 'Number'}</span><span className="capital-detail-value">{selectedTransaction.transactionNumber || selectedTransaction.id}</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'အမျိုးအစား' : 'Type'}</span><span className={`capital-type-badge ${getTransactionTypeBadge(selectedTransaction.type)}`}>{getTransactionTypeLabel(selectedTransaction.type, lang)}</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ပမာဏ' : 'Amount'}</span><span className="capital-detail-value amount">{formatCurrency(selectedTransaction.amount)}</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ရက်စွဲ' : 'Date'}</span><span className="capital-detail-value">{formatDate(selectedTransaction.entryDate)}</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ဖော်ပြချက်' : 'Description'}</span><span className="capital-detail-value">{selectedTransaction.description}</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'အခြေအနေ' : 'Status'}</span><span className={`capital-status-badge ${getStatusBadge(selectedTransaction.status)}`}>{getStatusLabel(selectedTransaction.status, lang)}</span></div>
              {selectedTransaction.notes && <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'မှတ်ချက်' : 'Notes'}</span><span className="capital-detail-value">{selectedTransaction.notes}</span></div>}
              {selectedTransaction.type === 'CLOSING' && (
                <>
                  <div className="capital-detail-row" style={{ background: '#fef3c7', padding: '8px 12px', borderRadius: '6px' }}>
                    <span className="capital-detail-label" style={{ color: '#f59e0b' }}><i className="fas fa-lock"></i> {lang === 'mm' ? 'စာရင်းပိတ်' : 'Closing Entry'}</span>
                    <span className="capital-detail-value">{lang === 'mm' ? 'ပြင်ဆင်မရပါ' : 'Cannot be modified'}</span>
                  </div>
                  {selectedTransaction.sales !== undefined && <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'အရောင်း' : 'Sales'}</span><span className="capital-detail-value">{formatCurrency(selectedTransaction.sales)}</span></div>}
                  {selectedTransaction.cogs !== undefined && <div className="capital-detail-row"><span className="capital-detail-label">COGS</span><span className="capital-detail-value">{formatCurrency(selectedTransaction.cogs)}</span></div>}
                  {selectedTransaction.expense !== undefined && <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ကုန်ကျစရိတ်' : 'Expense'}</span><span className="capital-detail-value">{formatCurrency(selectedTransaction.expense)}</span></div>}
                  {selectedTransaction.profitLoss !== undefined && (
                    <div className="capital-detail-row">
                      <span className="capital-detail-label">
                        {lang === 'mm' ? 'အမြတ်/အရှုံး' : 'Profit/Loss'}
                        <span style={{ fontSize: '11px', fontWeight: 600, color: getProfitLossColor(selectedTransaction.profitLoss), background: getProfitLossColor(selectedTransaction.profitLoss) + '20', padding: '1px 10px', borderRadius: '12px', marginLeft: '8px' }}>
                          {getProfitLossLabel(selectedTransaction.profitLoss, lang)}
                        </span>
                      </span>
                      <span className="capital-detail-value" style={{ color: getProfitLossColor(selectedTransaction.profitLoss), fontWeight: 700 }}>
                        {getProfitLossDisplay(selectedTransaction.profitLoss, lang)}
                      </span>
                    </div>
                  )}
                </>
              )}
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ဖန်တီးသူ' : 'Created By'}</span><span className="capital-detail-value">{selectedTransaction.createdByName || 'Unknown'} ({selectedTransaction.createdByRole || 'N/A'})</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ဖန်တီးချိန်' : 'Created At'}</span><span className="capital-detail-value">{formatDateTime(selectedTransaction.createdAt)}</span></div>
            </div>
            <div className="capital-modal-footer"><button className="capital-btn-cancel" onClick={() => setShowDetailModal(false)}>{lang === 'mm' ? 'ပိတ်မည်' : 'Close'}</button></div>
          </div>
        </div>
      )}

      {/* Log Detail Modal */}
      {showLogDetailModal && selectedLog && (
        <div className="capital-modal-overlay" onClick={() => setShowLogDetailModal(false)}>
          <div className="capital-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="capital-modal-header"><h3><i className="fas fa-history"></i>{lang === 'mm' ? 'မှတ်တမ်းအသေးစိတ်' : 'Log Details'}</h3><button className="capital-modal-close" onClick={() => setShowLogDetailModal(false)}><i className="fas fa-times"></i></button></div>
            <div className="capital-detail-body">
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Action'}</span><span className="capital-detail-value">{selectedLog.actionLabel || selectedLog.actionType}</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ဖော်ပြချက်' : 'Description'}</span><span className="capital-detail-value">{selectedLog.description}</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ဖန်တီးသူ' : 'Created By'}</span><span className="capital-detail-value">{selectedLog.createdByName || 'Unknown'} ({selectedLog.createdByRole || 'N/A'})</span></div>
              <div className="capital-detail-row"><span className="capital-detail-label">{lang === 'mm' ? 'ဖန်တီးချိန်' : 'Created At'}</span><span className="capital-detail-value">{formatDateTime(selectedLog.createdAt)}</span></div>
            </div>
            <div className="capital-modal-footer"><button className="capital-btn-cancel" onClick={() => setShowLogDetailModal(false)}>{lang === 'mm' ? 'ပိတ်မည်' : 'Close'}</button></div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && deleteTarget && (
        <div className="capital-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="capital-delete-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="capital-delete-icon"><i className="fas fa-exclamation-triangle"></i></div>
            <h3>{lang === 'mm' ? 'ဖျက်ရန်သေချာပါသလား' : 'Are you sure?'}</h3>
            <p>{lang === 'mm' ? 'ဤလွှဲပြောင်းမှုကို ဖျက်ပါက ပြန်လည်ရယူ၍မရပါ။' : 'This action cannot be undone.'}<br /><strong>"{deleteTarget.description}"</strong></p>
            <div className="capital-delete-actions">
              <button className="capital-btn-cancel" onClick={() => setShowDeleteModal(false)}>{lang === 'mm' ? 'ပယ်ဖျက်မည်' : 'Cancel'}</button>
              <button className="capital-btn-confirm-delete" onClick={confirmDelete}><i className="fas fa-trash"></i>{lang === 'mm' ? 'ဖျက်မည်' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* ===== CLOSING MODAL ===== */}
      {/* ============================================================ */}
      {showClosingModal && (
        <div className="capital-modal-overlay" onClick={() => setShowClosingModal(false)}>
          <div className="capital-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="capital-modal-header">
              <h3><i className="fas fa-lock" style={{ color: '#f59e0b' }}></i>{lang === 'mm' ? 'စာရင်းပိတ်မည်' : 'Close Period'}</h3>
              <button className="capital-modal-close" onClick={() => setShowClosingModal(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="capital-detail-body">
              {/* ===== Current Capital ===== */}
              <div className="capital-detail-row">
                <span className="capital-detail-label">{lang === 'mm' ? 'လက်ရှိမတည်ငွေ' : 'Current Capital'}</span>
                <span className="capital-detail-value amount">{formatCurrency(summary.totalCapital || 0)}</span>
              </div>

              {/* ===== Closing Date ===== */}
              <div className="capital-detail-row" style={{ background: '#eff6ff', padding: '10px 12px', borderRadius: '8px', marginBottom: '8px' }}>
                <span className="capital-detail-label" style={{ color: '#3b82f6', fontWeight: 600 }}>
                  <i className="fas fa-calendar-alt" style={{ color: '#3b82f6' }}></i>
                  {lang === 'mm' ? 'စာရင်းပိတ်မည့်ရက်စွဲ' : 'Closing Date'}
                </span>
                <span className="capital-detail-value">
                  <input 
                    type="date" 
                    className="capital-closing-input" 
                    value={closingData.closingDate} 
                    onChange={(e) => setClosingData(prev => ({ ...prev, closingDate: e.target.value }))} 
                    style={{ padding: '8px 12px', border: '2px solid #3b82f6', borderRadius: '6px', width: '100%', fontSize: '14px', backgroundColor: 'white' }} 
                  />
                </span>
              </div>

              {/* ===== ONLY Profit/Loss Input ===== */}
              <div className="capital-detail-row" style={{ 
                background: (parseFloat(closingData.profitLoss) || 0) > 0 ? '#d1fae5' : (parseFloat(closingData.profitLoss) || 0) < 0 ? '#fee2e2' : '#f3f4f6',
                padding: '12px 14px', 
                borderRadius: '8px', 
                marginBottom: '8px'
              }}>
                <span className="capital-detail-label" style={{ fontWeight: 600 }}>
                  <i className="fas fa-money-bill-wave" style={{ color: (parseFloat(closingData.profitLoss) || 0) > 0 ? '#10b981' : (parseFloat(closingData.profitLoss) || 0) < 0 ? '#ef4444' : '#6b7280' }}></i>
                  {lang === 'mm' ? 'အမြတ် / အရှုံး' : 'Profit / Loss'}
                  <span style={{ 
                    fontSize: '11px', 
                    fontWeight: 600, 
                    color: (parseFloat(closingData.profitLoss) || 0) > 0 ? '#10b981' : (parseFloat(closingData.profitLoss) || 0) < 0 ? '#ef4444' : '#6b7280',
                    background: (parseFloat(closingData.profitLoss) || 0) > 0 ? 'rgba(16,185,129,0.15)' : (parseFloat(closingData.profitLoss) || 0) < 0 ? 'rgba(239,68,68,0.15)' : 'rgba(107,114,128,0.15)',
                    padding: '1px 10px', 
                    borderRadius: '12px', 
                    marginLeft: '8px'
                  }}>
                    {(parseFloat(closingData.profitLoss) || 0) > 0 ? (lang === 'mm' ? '✅ အမြတ်' : '✅ Profit') : 
                     (parseFloat(closingData.profitLoss) || 0) < 0 ? (lang === 'mm' ? '❌ အရှုံး' : '❌ Loss') : 
                     (lang === 'mm' ? '⚖️ သုည' : '⚖️ Zero')}
                  </span>
                </span>
                <span className="capital-detail-value" style={{ 
                  fontWeight: 700,
                  color: (parseFloat(closingData.profitLoss) || 0) > 0 ? '#10b981' : (parseFloat(closingData.profitLoss) || 0) < 0 ? '#ef4444' : '#6b7280'
                }}>
                  <input 
                    type="number" 
                    className="capital-closing-input" 
                    value={closingData.profitLoss} 
                    onChange={(e) => setClosingData(prev => ({ ...prev, profitLoss: e.target.value }))} 
                    placeholder="0" 
                    style={{ 
                      padding: '8px 12px', 
                      border: '1px solid #e9ecef', 
                      borderRadius: '6px', 
                      width: '100%', 
                      fontSize: '14px', 
                      fontWeight: 700, 
                      color: (parseFloat(closingData.profitLoss) || 0) > 0 ? '#10b981' : (parseFloat(closingData.profitLoss) || 0) < 0 ? '#ef4444' : '#6b7280' 
                    }} 
                  />
                </span>
              </div>

              {/* ===== Notes ===== */}
              <div className="capital-detail-row">
                <span className="capital-detail-label">{lang === 'mm' ? 'မှတ်ချက်' : 'Notes'}</span>
                <span className="capital-detail-value">
                  <input 
                    type="text" 
                    className="capital-closing-input" 
                    value={closingData.notes} 
                    onChange={(e) => setClosingData(prev => ({ ...prev, notes: e.target.value }))} 
                    placeholder={lang === 'mm' ? 'မှတ်ချက်ထည့်ပါ' : 'Enter notes'} 
                    style={{ padding: '8px 12px', border: '1px solid #e9ecef', borderRadius: '6px', width: '100%', fontSize: '14px' }} 
                  />
                </span>
              </div>

              {/* ===== New Capital Preview ===== */}
              <div className="capital-detail-row" style={{ background: '#d1fae5', padding: '12px 14px', borderRadius: '8px', marginTop: '12px', flexDirection: 'column', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                  <i className="fas fa-arrow-right" style={{ color: '#10b981' }}></i>
                  <span style={{ fontWeight: 700, color: '#065f46' }}>
                    {lang === 'mm' ? 'စာရင်းပိတ်ပြီးနောက် မတည်ငွေ' : 'New Capital'}
                  </span>
                  <span style={{ fontWeight: 700, marginLeft: 'auto', color: '#065f46', fontSize: '18px' }}>
                    {formatCurrency(
                      (summary.totalCapital || 0) + (parseFloat(closingData.profitLoss) || 0)
                    )}
                  </span>
                </div>
                <div style={{ fontSize: '13px', color: '#065f46', marginTop: '8px', opacity: 0.8 }}>
                  {lang === 'mm' 
                    ? 'လက်ရှိမတည်ငွေ + အမြတ် (သို့မဟုတ် - အရှုံး)' 
                    : 'Current Capital + Profit (or - Loss)'}
                </div>
                <div style={{ fontSize: '13px', color: '#6b7280', marginTop: '8px', borderTop: '1px solid #a7f3d0', paddingTop: '8px', width: '100%' }}>
                  {lang === 'mm' ? 'စာရင်းပိတ်ပြီးပါက ပြန်လည်ပြင်ဆင်၍မရပါ။ ဆက်လက်လုပ်ဆောင်မည်လား။' : 'This action cannot be undone. Are you sure you want to close this period?'}
                </div>
              </div>
            </div>

            <div className="capital-modal-footer">
              <button 
                className="capital-btn-cancel" 
                onClick={() => setShowClosingModal(false)}
                disabled={isClosing}
              >
                {lang === 'mm' ? 'ပယ်ဖျက်မည်' : 'Cancel'}
              </button>
              
              <button 
                className={`capital-btn-confirm-close ${isClosing ? 'loading' : ''}`} 
                onClick={confirmClosing}
                disabled={isClosing}
              >
                {isClosing ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    {lang === 'mm' ? 'ပိတ်နေသည်...' : 'Closing...'}
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock"></i>
                    {lang === 'mm' ? 'စာရင်းပိတ်မည်' : 'Close Period'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CapitalPage;