// src/components/user/BranchManagerAccountManagementPage.jsx (DEMO Version)
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import "../../light-style/user-css/branchAccountManagement.css";

// ============================================================
// ✅ JSON DATA (localStorage မှာ သိမ်း)
// ============================================================
const ACCOUNTS_KEY = "demo_branch_accounts";
const LOGS_KEY = "demo_branch_logs";

const SEED_ACCOUNTS = [
  { id: 1, username: "manager01", fullName: "Aung Aung",  email: "manager01@branch.com", phone: "09123456789", role: "MANAGER",         status: "Active",   branchCode: "branch", createdAt: new Date(Date.now() - 7*86400000).toISOString() },
  { id: 2, username: "staff01",   fullName: "Su Su",      email: "staff01@branch.com",   phone: "09234567890", role: "STAFF",           status: "Active",   branchCode: "branch", createdAt: new Date(Date.now() - 5*86400000).toISOString() },
  { id: 3, username: "cashier01", fullName: "Kyaw Kyaw",  email: "cashier01@branch.com", phone: "09345678901", role: "CASHIER",         status: "Active",   branchCode: "branch", createdAt: new Date(Date.now() - 3*86400000).toISOString() },
  { id: 4, username: "inv01",     fullName: "Mya Mya",    email: "inv01@branch.com",     phone: "09456789012", role: "INVENTORY_STAFF", status: "Unactive", branchCode: "branch", createdAt: new Date(Date.now() - 2*86400000).toISOString() },
  { id: 5, username: "staff02",   fullName: "Hla Hla",    email: "staff02@branch.com",   phone: "09567890123", role: "STAFF",           status: "Pending",  branchCode: "branch", createdAt: new Date(Date.now() - 1*86400000).toISOString() },
];

const SEED_LOGS = [
  { id: 1, actionType: "ADD",    accountId: 2, username: "staff01",   createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 5*86400000).toISOString(), changes: ["Username: staff01", "Role: STAFF", "Status: Active"] },
  { id: 2, actionType: "EDIT",   accountId: 3, username: "cashier01", createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 3*86400000).toISOString(), changes: ["Status: Active → Unactive"] },
  { id: 3, actionType: "DELETE", accountId: 6, username: "old_staff", createdByName: "Aung Aung", createdByRole: "MANAGER", createdAt: new Date(Date.now() - 1*86400000).toISOString(), changes: ["Account deleted"] },
];

// ✅ DEMO current user (Redux ဖယ်)
const DEMO_CURRENT_USER = {
  id: 1,
  username: "manager01",
  fullName: "Aung Aung",
  role: "MANAGER",
  branchCode: "branch",
};

// ✅ localStorage helpers
const getAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) { localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(SEED_ACCOUNTS)); return SEED_ACCOUNTS; }
    return JSON.parse(raw);
  } catch { return SEED_ACCOUNTS; }
};
const setAccounts = (list) => localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));

const getLogs = () => {
  try {
    const raw = localStorage.getItem(LOGS_KEY);
    if (!raw) { localStorage.setItem(LOGS_KEY, JSON.stringify(SEED_LOGS)); return SEED_LOGS; }
    return JSON.parse(raw);
  } catch { return SEED_LOGS; }
};
const setLogs = (list) => localStorage.setItem(LOGS_KEY, JSON.stringify(list));

// ============================================================
// ✅ COMPONENT
// ============================================================
const BranchManagerAccountManagementPage = () => {

  // ✅ Demo current user (Redux ဖယ်)
  const currentUser = DEMO_CURRENT_USER;

  const branchCode = currentUser?.branchCode || "branch";
  const isManager = currentUser?.role === 'MANAGER';

  const [language, setLanguage] = useState(() => localStorage.getItem('appLanguage') || 'mm');
  const [accounts, setAccountsState] = useState([]);
  const [logs, setLogsState] = useState([]);
  const [activeTab, setActiveTab] = useState('all-accounts');
  const [logFilter, setLogFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState({ filter: 'all', from: '', to: '' });
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [tempSearch, setTempSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [logPage, setLogPage] = useState(1);
  const [logPageSize, setLogPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('add');
  const [showLogDetails, setShowLogDetails] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({
    id: null, username: '', password: '', confirmPassword: '',
    fullName: '', email: '', phone: '', role: 'STAFF', status: 'Active'
  });

  const tableRef = useRef(null);
  const logsRef = useRef(null);

  // ✅ Language listener
  useEffect(() => {
    const handler = (e) => setLanguage(e.detail.language);
    window.addEventListener('appLanguageChanged', handler);
    return () => window.removeEventListener('appLanguageChanged', handler);
  }, []);

  // ✅ Initial load
  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => {
      setAccountsState(getAccounts());
      setLogsState(getLogs());
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, []);

  // ✅ Filtered accounts
  const filteredAccounts = useMemo(() => {
    let list = accounts.filter(a => a.branchCode === branchCode);
    if (activeTab === 'active') list = list.filter(a => a.status === 'Active');
    else if (activeTab === 'unactive') list = list.filter(a => a.status === 'Unactive');
    else if (activeTab === 'pending') list = list.filter(a => a.status === 'Pending');
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(a =>
        a.username?.toLowerCase().includes(q) ||
        a.fullName?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.phone?.toLowerCase().includes(q) ||
        a.role?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [accounts, activeTab, searchQuery, branchCode]);

  // ✅ Paginated accounts
  const totalPages = Math.max(1, Math.ceil(filteredAccounts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedAccounts = filteredAccounts.slice((safePage - 1) * pageSize, safePage * pageSize);

  // ✅ Status counts
  const statusCounts = useMemo(() => {
    const base = accounts.filter(a => a.branchCode === branchCode);
    return {
      Active:   base.filter(a => a.status === 'Active').length,
      Unactive: base.filter(a => a.status === 'Unactive').length,
      Pending:  base.filter(a => a.status === 'Pending').length,
    };
  }, [accounts, branchCode]);

  // ✅ Filtered logs
  const filteredLogs = useMemo(() => {
    let list = [...logs];
    if (logFilter !== 'all') list = list.filter(l => l.actionType === logFilter);
    if (dateFilter.filter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const yest = new Date(today); yest.setDate(yest.getDate() - 1);
      const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today); monthAgo.setMonth(monthAgo.getMonth() - 1);
      list = list.filter(l => {
        const d = new Date(l.createdAt);
        switch (dateFilter.filter) {
          case 'today': return d >= today;
          case 'yesterday': return d >= yest && d < today;
          case 'thisWeek': return d >= weekAgo;
          case 'thisMonth': return d >= monthAgo;
          case 'custom':
            if (dateFilter.from && dateFilter.to) {
              const from = new Date(dateFilter.from);
              const to = new Date(dateFilter.to); to.setHours(23, 59, 59, 999);
              return d >= from && d <= to;
            }
            return true;
          default: return true;
        }
      });
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [logs, logFilter, dateFilter]);

  const logTotalPages = Math.max(1, Math.ceil(filteredLogs.length / logPageSize));
  const safeLogPage = Math.min(logPage, logTotalPages);
  const pagedLogs = filteredLogs.slice((safeLogPage - 1) * logPageSize, safeLogPage * logPageSize);

  // ✅ Group logs by date
  const groupedLogs = useMemo(() => {
    const grouped = {};
    pagedLogs.forEach(log => {
      const key = new Date(log.createdAt).toLocaleDateString(language === 'mm' ? 'my' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(log);
    });
    return grouped;
  }, [pagedLogs, language]);

  // ✅ Log counts
  const logCounts = useMemo(() => ({
    all: logs.length,
    ADD: logs.filter(l => l.actionType === 'ADD').length,
    EDIT: logs.filter(l => l.actionType === 'EDIT').length,
    DELETE: logs.filter(l => l.actionType === 'DELETE').length,
  }), [logs]);

  // ============================================================
  // ✅ CRUD (Direct — No reducer)
  // ============================================================
  const logAction = (actionType, account, changes) => {
    const newLog = {
      id: logs.length ? Math.max(...logs.map(l => l.id)) + 1 : 1,
      actionType, accountId: account.id, username: account.username,
      createdByName: currentUser?.fullName || currentUser?.username || 'Unknown',
      createdByRole: currentUser?.role || 'N/A',
      createdAt: new Date().toISOString(),
      changes,
    };
    const updated = [...logs, newLog];
    setLogs(updated);
    setLogsState(updated);
  };

  const handleSave = () => {
    if (modalType === 'add') {
      const errors = {};
      if (!form.username) errors.username = language === 'mm' ? 'အသုံးပြုသူအမည် လိုအပ်သည်' : 'Username required';
      if (!form.fullName) errors.fullName = language === 'mm' ? 'အမည် လိုအပ်သည်' : 'Full name required';
      if (!form.email) errors.email = language === 'mm' ? 'အီးမေးလ် လိုအပ်သည်' : 'Email required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errors.email = language === 'mm' ? 'အီးမေးလ် မမှန်ပါ' : 'Invalid email';
      if (!form.password) errors.password = language === 'mm' ? 'စကားဝှက် လိုအပ်သည်' : 'Password required';
      else if (form.password.length < 6) errors.password = language === 'mm' ? '၆ လုံးအနည်းဆုံး' : 'Min 6 chars';
      if (form.password !== form.confirmPassword) errors.confirmPassword = language === 'mm' ? 'မတိုက်ဆိုင်ပါ' : 'Not matched';
      if (Object.keys(errors).length) { setFormErrors(errors); return; }

      const newAcc = {
        id: accounts.length ? Math.max(...accounts.map(a => a.id)) + 1 : 1,
        username: form.username, fullName: form.fullName, email: form.email,
        phone: form.phone, role: form.role, status: form.status,
        branchCode, createdAt: new Date().toISOString()
      };
      const updated = [...accounts, newAcc];
      setAccounts(updated); setAccountsState(updated);
      logAction('ADD', newAcc, [`Username: ${newAcc.username}`, `Full Name: ${newAcc.fullName}`, `Email: ${newAcc.email}`, `Role: ${newAcc.role}`, `Status: ${newAcc.status}`]);
      setSuccessMsg(language === 'mm' ? 'အကောင့်ဖန်တီးပြီးပါပြီ' : 'Account created');
      closeModal();
    } else {
      const old = accounts.find(a => a.id === form.id);
      const updatedAcc = { ...old, fullName: form.fullName, email: form.email, phone: form.phone, role: form.role, status: form.status };
      const updated = accounts.map(a => a.id === form.id ? updatedAcc : a);
      setAccounts(updated); setAccountsState(updated);
      const changes = [];
      if (old.status !== updatedAcc.status) changes.push(`Status: ${old.status} → ${updatedAcc.status}`);
      if (old.fullName !== updatedAcc.fullName) changes.push(`Full Name: ${old.fullName} → ${updatedAcc.fullName}`);
      if (old.email !== updatedAcc.email) changes.push(`Email: ${old.email} → ${updatedAcc.email}`);
      if (!changes.length) changes.push('Updated');
      logAction('EDIT', updatedAcc, changes);
      setSuccessMsg(language === 'mm' ? 'ပြင်ဆင်ပြီးပါပြီ' : 'Account updated');
      closeModal();
    }
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const handleDelete = (acc) => {
    if (isManager && acc.role === 'MANAGER') {
      alert(language === 'mm' ? 'မန်နေဂျာအကောင့်ကို ဖျက်၍မရပါ' : 'Cannot delete manager account');
      return;
    }
    if (!window.confirm(language === 'mm' ? `"${acc.username}" ဖျက်မလား?` : `Delete "${acc.username}"?`)) return;
    const updated = accounts.filter(a => a.id !== acc.id);
    setAccounts(updated); setAccountsState(updated);
    logAction('DELETE', acc, [`Account "${acc.username}" deleted`]);
    setSuccessMsg(language === 'mm' ? 'ဖျက်ပြီးပါပြီ' : 'Deleted');
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  const openAdd = () => {
    setForm({ id: null, username: '', password: '', confirmPassword: '', fullName: '', email: '', phone: '', role: 'STAFF', status: 'Active' });
    setFormErrors({});
    setModalType('add');
    setShowModal(true);
  };

  const openEdit = (acc) => {
    if (isManager && acc.role === 'MANAGER') {
      alert(language === 'mm' ? 'မန်နေဂျာအကောင့်ကို ပြင်၍မရပါ' : 'Cannot edit manager account');
      return;
    }
    setForm({ id: acc.id, username: acc.username, password: '', confirmPassword: '', fullName: acc.fullName, email: acc.email, phone: acc.phone || '', role: acc.role, status: acc.status });
    setFormErrors({});
    setModalType('edit');
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  // ✅ Search
  const handleSearch = () => { setSearchQuery(tempSearch); setPage(1); };
  const clearSearch = () => { setTempSearch(''); setSearchQuery(''); setPage(1); };

  // ✅ Reset demo data
  const resetDemo = () => {
    if (!window.confirm('Reset demo data?')) return;
    localStorage.removeItem(ACCOUNTS_KEY);
    localStorage.removeItem(LOGS_KEY);
    setAccountsState(SEED_ACCOUNTS);
    setLogsState(SEED_LOGS);
    setSuccessMsg('Demo data reset');
    setTimeout(() => setSuccessMsg(''), 2000);
  };

  const getRoleLabel = (r) => ({
    STAFF: 'Staff', MANAGER: 'Manager', INVENTORY_STAFF: 'Inventory Staff',
    CASHIER: 'Cashier', VIEWER: 'Viewer'
  }[r] || r);

  const getStatusLabel = (s) => ({
    Active: language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active',
    Unactive: language === 'mm' ? 'အသုံးပြုမနိုင်' : 'Unactive',
    Pending: language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending',
  }[s] || s);

  if (!currentUser) {
    return <div className="branch-container"><div className="loading-state"><i className="fas fa-spinner fa-spin"></i><p>Loading user...</p></div></div>;
  }

  return (
    <div className="branch-container">
      {/* Messages */}
      <div className="branch-messages-container">
        {successMsg && (
          <div className="branch-message success">
            <i className="fas fa-check-circle"></i>
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg('')}><i className="fas fa-times"></i></button>
          </div>
        )}
        {errorMsg && (
          <div className="branch-message error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{errorMsg}</span>
            <button onClick={() => setErrorMsg('')}><i className="fas fa-times"></i></button>
          </div>
        )}
      </div>

      {/* Header */}
      <div className="shop-management-header">
        <div className="header-top-row">
          <NavLink className="shop-back-btn"></NavLink>
          <div className="header-center-content">
            <h1>
              <i className="fas fa-store-alt"></i>
              {language === 'mm' ? `ဆိုင်ခွဲ ${branchCode} အကောင့်စီမံခန့်ခွဲမှု` : `Branch ${branchCode} Account Management`}
            </h1>
            <p>{language === 'mm' ? 'Demo — Frontend only (JSON)' : 'Demo — Frontend only (JSON)'}</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="branch-tabs-header">
        <div className="branch-tabs-selector">
          <div className="branch-select-container">
            <i className={`fas ${activeTab === 'all-accounts' ? 'fa-users' : activeTab === 'active' ? 'fa-check-circle' : activeTab === 'unactive' ? 'fa-times-circle' : activeTab === 'pending' ? 'fa-clock' : 'fa-history'} branch-select-icon`}></i>
            <select className="branch-tab-select" value={activeTab} onChange={(e) => { setActiveTab(e.target.value); setPage(1); setLogPage(1); }}>
              <option value="all-accounts">{language === 'mm' ? 'အကောင့်အားလုံး' : 'All'} ({statusCounts.Active + statusCounts.Unactive + statusCounts.Pending})</option>
              <option value="active">{language === 'mm' ? 'အသုံးပြုနိုင်' : 'Active'} ({statusCounts.Active})</option>
              <option value="unactive">{language === 'mm' ? 'အသုံးပြုမနိုင်' : 'Unactive'} ({statusCounts.Unactive})</option>
              <option value="pending">{language === 'mm' ? 'ဆိုင်းငံ့ဆဲ' : 'Pending'} ({statusCounts.Pending})</option>
              <option value="history">{language === 'mm' ? 'မှတ်တမ်း' : 'History'} ({logCounts.all})</option>
            </select>
            <i className="fas fa-chevron-down branch-select-arrow"></i>
          </div>
        </div>

        {activeTab !== 'history' && (
          <>
            <div className="branch-search-controls">
              <div className="branch-search-input-group">
                <i className="fas fa-search branch-search-icon"></i>
                <input type="text" className="branch-search-input" placeholder={language === 'mm' ? 'ရှာဖွေရန် (Enter)...' : 'Search (Enter)...'}
                  value={tempSearch} onChange={(e) => setTempSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()} />
                {(tempSearch || searchQuery) && (
                  <button className="branch-clear-search-btn" onClick={clearSearch}><i className="fas fa-times"></i></button>
                )}
              </div>
            </div>
            <button className="branch-add-btn" onClick={openAdd}>
              <i className="fas fa-plus"></i> {language === 'mm' ? 'အကောင့်အသစ်' : 'Create Account'}
            </button>
          </>
        )}
      </div>

      {/* Content */}
      <div className="subtab-content active">
        {activeTab === 'history' ? (
          <div className="branch-history-section">
            {/* Log filters */}
            <div className="branch-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 15, alignItems: 'center', width: '100%' }}>
                <div className="branch-filter-tabs" style={{ flex: '1 1 auto' }}>
                  {['all', 'ADD', 'EDIT', 'DELETE'].map(f => (
                    <button key={f} className={`branch-filter-tab ${logFilter === f ? 'active' : ''}`}
                      onClick={() => { setLogFilter(f); setLogPage(1); }}>
                      {f === 'all' ? (language === 'mm' ? 'အားလုံး' : 'All') : f}
                      <span className="branch-filter-count">({logCounts[f] || 0})</span>
                    </button>
                  ))}
                </div>
                <div className="branch-filter-tabs" style={{ marginLeft: 'auto' }}>
                  {['all', 'today', 'yesterday', 'thisWeek', 'thisMonth'].map(f => (
                    <button key={f} className={`branch-filter-tab ${dateFilter.filter === f ? 'active' : ''}`}
                      onClick={() => { setDateFilter({ ...dateFilter, filter: f }); setShowDatePicker(false); setLogPage(1); }}>
                      {f}
                    </button>
                  ))}
                  <button className={`branch-filter-tab ${dateFilter.filter === 'custom' ? 'active' : ''}`}
                    onClick={() => { setDateFilter({ ...dateFilter, filter: 'custom' }); setShowDatePicker(true); }}>
                    <i className="fas fa-calendar"></i> Custom
                  </button>
                </div>
              </div>
              {showDatePicker && (
                <div className="branch-custom-date-picker">
                  <div className="branch-date-picker-row">
                    <label>From:</label>
                    <input type="date" className="branch-date-input" value={dateFilter.from} onChange={(e) => setDateFilter({ ...dateFilter, from: e.target.value })} />
                  </div>
                  <div className="branch-date-picker-row">
                    <label>To:</label>
                    <input type="date" className="branch-date-input" value={dateFilter.to} onChange={(e) => setDateFilter({ ...dateFilter, to: e.target.value })} />
                  </div>
                </div>
              )}
            </div>

            {/* Logs list */}
            <div className="branch-compact-logs-container" ref={logsRef}>
              {Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dayLogs]) => (
                  <div key={date} className="branch-date-group">
                    <div className="branch-date-header">
                      <span className="branch-date-label">{date}</span>
                      <span className="branch-date-count">{dayLogs.length} items</span>
                    </div>
                    <div className="branch-logs-list">
                      {dayLogs.map(log => (
                        <div key={log.id} className={`branch-compact-log-entry log-${log.actionType?.toLowerCase()}`}
                          onClick={() => { setSelectedLog(log); setShowLogDetails(true); }} style={{ cursor: 'pointer' }}>
                          <div className="branch-log-icon">
                            <i className={`fas ${log.actionType === 'ADD' ? 'fa-plus-circle' : log.actionType === 'EDIT' ? 'fa-edit' : 'fa-trash'}`}></i>
                          </div>
                          <div className="branch-log-content">
                            <div className="branch-log-main-info">
                              <span className="branch-log-action">{log.actionType}</span>
                              <span className="branch-log-category">"{log.username}"</span>
                            </div>
                            <div className="branch-log-details">
                              <span className="branch-log-user"><i className="fas fa-user"></i> {log.createdByName}</span>
                              <span className="branch-log-time"><i className="fas fa-clock"></i> {new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-logs">
                  <i className="fas fa-clipboard-list"></i>
                  <p>{language === 'mm' ? 'မှတ်တမ်း မရှိပါ' : 'No logs found'}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="branch-table-wrapper" ref={tableRef}>
              <table className="branch-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>{language === 'mm' ? 'အသုံးပြုသူအမည်' : 'Username'}</th>
                    <th>{language === 'mm' ? 'အမည်အပြည့်အစုံ' : 'Full Name'}</th>
                    <th>{language === 'mm' ? 'ဆက်သွယ်ရန်' : 'Contact'}</th>
                    <th>{language === 'mm' ? 'ရာထူး' : 'Role'}</th>
                    <th>{language === 'mm' ? 'အခြေအနေ' : 'Status'}</th>
                    <th>{language === 'mm' ? 'လုပ်ဆောင်ချက်' : 'Actions'}</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedAccounts.length > 0 ? pagedAccounts.map((acc, idx) => (
                    <tr key={acc.id}>
                      <td>{(safePage - 1) * pageSize + idx + 1}</td>
                      <td><strong>{acc.username}</strong></td>
                      <td className="fullname">{acc.fullName}</td>
                      <td>
                        <div className="branch-contact-cell">
                          <div className="branch-contact-item"><i className="fas fa-envelope branch-contact-icon"></i><span className="branch-contact-text">{acc.email}</span></div>
                          {acc.phone && <div className="branch-contact-item"><i className="fas fa-phone branch-contact-icon"></i><span className="branch-contact-text">{acc.phone}</span></div>}
                        </div>
                      </td>
                      <td><span className={`branch-role-badge role-${acc.role?.toLowerCase()}`}>{getRoleLabel(acc.role)}</span></td>
                      <td><span className={`branch-status-badge ${acc.status === 'Active' ? 'branch-status-active' : acc.status === 'Unactive' ? 'branch-status-inactive' : 'branch-status-pending'}`}>{getStatusLabel(acc.status)}</span></td>
                      <td>
                        <div className="branch-action-buttons">
                          <button className="branch-action-btn branch-action-edit" onClick={() => openEdit(acc)}><i className="fas fa-edit"></i></button>
                          <button className="branch-action-btn branch-action-delete" onClick={() => handleDelete(acc)}><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan="7" className="branch-no-data"><div className="branch-no-data-content"><i className="fas fa-user-slash"></i><p>{language === 'mm' ? 'အကောင့် မတွေ့ပါ' : 'No accounts'}</p></div></td></tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, marginTop: 15 }}>
              <button className="branch-nav-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1}>
                <i className="fas fa-chevron-left"></i>
              </button>
              <span style={{ fontSize: 14 }}>Page {safePage} / {totalPages}</span>
              <button className="branch-nav-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages}>
                <i className="fas fa-chevron-right"></i>
              </button>
              <select className="branch-per-page-select" value={pageSize} onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}>
                <option value={5}>5</option><option value={10}>10</option><option value={20}>20</option><option value={50}>50</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* Account Modal */}
      {showModal && (
        <div className="branch-modal-overlay">
          <div className="branch-modal-content" style={{ maxWidth: 600 }}>
            <div className="branch-modal-header">
              <h3><i className={`fas ${modalType === 'add' ? 'fa-plus-circle' : 'fa-edit'}`}></i> {modalType === 'add' ? 'Create Account' : 'Edit Account'}</h3>
              <button className="branch-modal-close" onClick={closeModal}><i className="fas fa-times"></i></button>
            </div>
            <div className="branch-modal-body">
              <div className="branch-info-box" style={{ marginBottom: 20 }}>
                <i className="fas fa-store"></i>
                <span>Branch Code: {branchCode}</span>
              </div>

              {modalType === 'add' ? (
                <>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">Username</label>
                      <input type="text" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} className={formErrors.username ? 'branch-input-error' : ''} />
                      {formErrors.username && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i>{formErrors.username}</div>}
                    </div>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">Full Name</label>
                      <input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={formErrors.fullName ? 'branch-input-error' : ''} />
                      {formErrors.fullName && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i>{formErrors.fullName}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">Email</label>
                      <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={formErrors.email ? 'branch-input-error' : ''} />
                      {formErrors.email && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i>{formErrors.email}</div>}
                    </div>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label>Phone</label>
                      <input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
                    </div>
                  </div>
                  <div className="branch-form-group">
                    <label className="branch-required">Role</label>
                    <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      <option value="STAFF">Staff</option>
                      <option value="MANAGER">Manager</option>
                      <option value="INVENTORY_STAFF">Inventory Staff</option>
                      <option value="CASHIER">Cashier</option>
                      <option value="VIEWER">Viewer</option>
                    </select>
                  </div>
                  <div className="branch-form-group">
                    <label className="branch-required">Status</label>
                    <div className="branch-status-select-group">
                      <div className={`branch-status-option ${form.status === 'Active' ? 'selected' : ''}`} onClick={() => setForm({ ...form, status: 'Active' })}>
                        <label className="branch-status-label"><i className="fas fa-check-circle"></i>Active</label>
                      </div>
                      <div className={`branch-status-option ${form.status === 'Unactive' ? 'selected' : ''}`} onClick={() => setForm({ ...form, status: 'Unactive' })}>
                        <label className="branch-status-label"><i className="fas fa-times-circle"></i>Unactive</label>
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 15 }}>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">Password</label>
                      <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={formErrors.password ? 'branch-input-error' : ''} />
                      {formErrors.password && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i>{formErrors.password}</div>}
                    </div>
                    <div className="branch-form-group" style={{ flex: 1 }}>
                      <label className="branch-required">Confirm Password</label>
                      <input type="password" value={form.confirmPassword} onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })} className={formErrors.confirmPassword ? 'branch-input-error' : ''} />
                      {formErrors.confirmPassword && <div className="branch-field-error"><i className="fas fa-exclamation-circle"></i>{formErrors.confirmPassword}</div>}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="branch-info-grid">
                    <div className="branch-info-column">
                      <div className="branch-info-item"><label>Username</label><div className="branch-info-value"><i className="fas fa-user"></i><span>{form.username}</span></div></div>
                      <div className="branch-info-item"><label>Full Name</label><input type="text" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                      <div className="branch-info-item"><label>Email</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
                    </div>
                    <div className="branch-info-column">
                      <div className="branch-info-item"><label>Phone</label><input type="text" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></div>
                      <div className="branch-info-item">
                        <label>Role</label>
                        <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                          <option value="STAFF">Staff</option>
                          <option value="MANAGER">Manager</option>
                          <option value="INVENTORY_STAFF">Inventory Staff</option>
                          <option value="CASHIER">Cashier</option>
                          <option value="VIEWER">Viewer</option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="branch-divider"><span>Change Status</span></div>
                  <div className="branch-status-select-group">
                    <div className={`branch-status-option ${form.status === 'Active' ? 'selected' : ''}`} onClick={() => setForm({ ...form, status: 'Active' })}>
                      <label className="branch-status-label"><i className="fas fa-check-circle"></i>Active</label>
                    </div>
                    <div className={`branch-status-option ${form.status === 'Unactive' ? 'selected' : ''}`} onClick={() => setForm({ ...form, status: 'Unactive' })}>
                      <label className="branch-status-label"><i className="fas fa-times-circle"></i>Unactive</label>
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="branch-modal-footer">
              <button className="branch-btn-cancel" onClick={closeModal}>Cancel</button>
              <button className="branch-btn-submit" onClick={handleSave}>
                <i className="fas fa-save"></i> {modalType === 'add' ? 'Create' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showLogDetails && selectedLog && (
        <div className="branch-modal-overlay">
          <div className="branch-modal-content" style={{ maxWidth: 600 }}>
            <div className="branch-modal-header">
              <h3><i className="fas fa-info-circle"></i> Activity Details</h3>
              <button className="branch-modal-close" onClick={() => setShowLogDetails(false)}><i className="fas fa-times"></i></button>
            </div>
            <div className="branch-modal-body">
              <div className="branch-log-detail-header">
                <div className="branch-log-detail-action">
                  <span className={`branch-action-badge branch-action-${selectedLog.actionType?.toLowerCase()}`}>{selectedLog.actionType}</span>
                </div>
                <div className="branch-log-detail-category">
                  <i className="fas fa-user"></i> <strong>{selectedLog.username}</strong>
                </div>
                <div className="branch-log-detail-meta">
                  <div><i className="fas fa-user"></i> {selectedLog.createdByName} ({selectedLog.createdByRole})</div>
                  <div><i className="fas fa-clock"></i> {new Date(selectedLog.createdAt).toLocaleString()}</div>
                </div>
              </div>
              <div className="branch-log-detail-content">
                <h4>Changes:</h4>
                <div className="branch-change-list">
                  {selectedLog.changes?.map((c, i) => (
                    <div key={i} className="branch-change-item"><i className="fas fa-chevron-right"></i><span>{c}</span></div>
                  ))}
                </div>
              </div>
            </div>
            <div className="branch-modal-footer">
              <button className="branch-btn-cancel" onClick={() => setShowLogDetails(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BranchManagerAccountManagementPage;