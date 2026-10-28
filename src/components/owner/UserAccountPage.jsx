// 📁 src/components/owner/owner-components/UserAccountPage.jsx

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { NavLink } from 'react-router-dom';
import "../../light-style/owner-css/userAccountPage.css";

const UserAccountPage = () => {
  // Loading States
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(false);
  const [loadingDirection, setLoadingDirection] = useState(null);

  // User data
  const currentUser = {
    id: 1,
    name: "Admin User",
    role: "System Admin",
    email: "admin@xam.com"
  };

  // ====== JSON Data ======
  const initialShopAccounts = [
    {
      id: 1,
      username: "minimart_owner",
      password: "********",
      full_name: "John Doe",
      email: "john@minimart.com",
      phone: "09123456789",
      role: "shop_owner",
      status: "Active",
      created_at: "2024-01-15 09:30:00",
      last_login: "2024-02-20 14:30:00"
    },
    {
      id: 2,
      username: "techgadgets_owner",
      password: "********",
      full_name: "Alice Smith",
      email: "alice@techgadgets.com",
      phone: "09234567890",
      role: "shop_owner",
      status: "Active",
      created_at: "2024-01-20 14:20:00",
      last_login: "2024-02-21 10:15:00"
    },
    {
      id: 3,
      username: "tech_manager",
      password: "********",
      full_name: "Mike Taylor",
      email: "mike@techgadgets.com",
      phone: "09345678901",
      role: "manager",
      status: "Active",
      created_at: "2024-01-25 11:00:00",
      last_login: "2024-02-20 09:45:00"
    },
    {
      id: 4,
      username: "mini_inventory",
      password: "********",
      full_name: "Sarah Lee",
      email: "sarah@minimart.com",
      phone: "09456789012",
      role: "inventory_storer",
      status: "Active",
      created_at: "2024-01-18 13:45:00",
      last_login: "2024-02-19 16:20:00"
    },
    {
      id: 5,
      username: "fashion_owner",
      password: "********",
      full_name: "Mary Wilson",
      email: "mary@fashionstore.com",
      phone: "09567890123",
      role: "shop_owner",
      status: "Active",
      created_at: "2024-02-01 10:15:00",
      last_login: "2024-02-22 08:30:00"
    },
    {
      id: 6,
      username: "coffee_owner",
      password: "********",
      full_name: "Bob Johnson",
      email: "bob@coffeehub.com",
      phone: "09678901234",
      role: "shop_owner",
      status: "Unactive",
      created_at: "2023-12-10 11:45:00",
      last_login: "2024-01-05 14:10:00"
    },
    {
      id: 7,
      username: "bookstore_owner",
      password: "********",
      full_name: "Emma Wilson",
      email: "emma@bookstore.com",
      phone: "09789012345",
      role: "shop_owner",
      status: "Active",
      created_at: "2024-02-05 09:00:00",
      last_login: "2024-02-22 10:30:00"
    },
    {
      id: 8,
      username: "bookstore_manager",
      password: "********",
      full_name: "David Brown",
      email: "david@bookstore.com",
      phone: "09890123456",
      role: "manager",
      status: "Active",
      created_at: "2024-02-06 11:30:00",
      last_login: "2024-02-21 15:45:00"
    },
    {
      id: 9,
      username: "gadgets_inventory",
      password: "********",
      full_name: "Lisa Chen",
      email: "lisa@techgadgets.com",
      phone: "09901234567",
      role: "inventory_storer",
      status: "Active",
      created_at: "2024-01-28 10:15:00",
      last_login: "2024-02-20 11:20:00"
    },
    {
      id: 10,
      username: "fashion_cashier",
      password: "********",
      full_name: "Tom Harris",
      email: "tom@fashionstore.com",
      phone: "09012345678",
      role: "cashier",
      status: "Active",
      created_at: "2024-02-03 14:30:00",
      last_login: "2024-02-21 16:10:00"
    },
    {
      id: 11,
      username: "fashion_viewer",
      password: "********",
      full_name: "Anna Kim",
      email: "anna@fashionstore.com",
      phone: "09111222333",
      role: "viewer",
      status: "Active",
      created_at: "2024-02-07 09:45:00",
      last_login: "2024-02-19 13:25:00"
    },
    {
      id: 12,
      username: "coffee_manager",
      password: "********",
      full_name: "James Lee",
      email: "james@coffeehub.com",
      phone: "09222333444",
      role: "manager",
      status: "Unactive",
      created_at: "2024-01-12 15:20:00",
      last_login: "2024-01-30 10:15:00"
    },
    {
      id: 13,
      username: "gadgets_cashier",
      password: "********",
      full_name: "Sophia Martinez",
      email: "sophia@techgadgets.com",
      phone: "09333444555",
      role: "cashier",
      status: "Active",
      created_at: "2024-02-08 13:10:00",
      last_login: "2024-02-20 14:30:00"
    },
    {
      id: 14,
      username: "mini_cashier",
      password: "********",
      full_name: "Oliver Chen",
      email: "oliver@minimart.com",
      phone: "09444555666",
      role: "cashier",
      status: "Active",
      created_at: "2024-01-22 11:45:00",
      last_login: "2024-02-18 09:20:00"
    },
    {
      id: 15,
      username: "bookstore_cashier",
      password: "********",
      full_name: "Mia Wong",
      email: "mia@bookstore.com",
      phone: "09555666777",
      role: "cashier",
      status: "Unactive",
      created_at: "2024-02-09 10:30:00",
      last_login: "2024-02-12 15:40:00"
    }
  ];

  const initialHistory = [
    { 
      id: 1, 
      timestamp: "10:30 AM", 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setHours(10, 30, 0, 0)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Created", 
      account: "minimart_owner", 
      accountId: 1, 
      type: "add", 
      details: ["Username: minimart_owner", "Role: Shop Owner", "Status: Active", "Full Name: John Doe"]
    },
    { 
      id: 2, 
      timestamp: "02:20 PM", 
      date: new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setDate(new Date().getDate() - 1)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Created", 
      account: "techgadgets_owner", 
      accountId: 2, 
      type: "add", 
      details: ["Username: techgadgets_owner", "Role: Shop Owner", "Status: Active", "Full Name: Alice Smith"]
    },
    { 
      id: 3, 
      timestamp: "11:00 AM", 
      date: new Date(new Date().setDate(new Date().getDate() - 5)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setDate(new Date().getDate() - 5)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Created", 
      account: "tech_manager", 
      accountId: 3, 
      type: "add", 
      details: ["Username: tech_manager", "Role: Manager", "Status: Active", "Full Name: Mike Taylor"]
    },
    { 
      id: 4, 
      timestamp: "01:45 PM", 
      date: new Date(new Date().setDate(new Date().getDate() - 7)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setDate(new Date().getDate() - 7)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Created", 
      account: "mini_inventory", 
      accountId: 4, 
      type: "add", 
      details: ["Username: mini_inventory", "Role: Inventory Storer", "Status: Active", "Full Name: Sarah Lee"]
    },
    { 
      id: 5, 
      timestamp: "10:15 AM", 
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setHours(10, 15, 0, 0)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Created", 
      account: "fashion_owner", 
      accountId: 5, 
      type: "add", 
      details: ["Username: fashion_owner", "Role: Shop Owner", "Status: Active", "Full Name: Mary Wilson"]
    },
    { 
      id: 6, 
      timestamp: "03:30 PM", 
      date: new Date(new Date().setDate(new Date().getDate() - 2)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setDate(new Date().getDate() - 2)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Status Updated", 
      account: "coffee_owner", 
      accountId: 6, 
      type: "edit", 
      details: ["Status: Active → Unactive", "Reason: User requested deactivation"]
    },
    { 
      id: 7, 
      timestamp: "04:15 PM", 
      date: new Date(new Date().setDate(new Date().getDate() - 1)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setDate(new Date().getDate() - 1)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Deleted", 
      account: "test_user", 
      accountId: 7, 
      type: "delete", 
      details: ["Username: test_user", "Full Name: Test User", "Role: Viewer", "Deleted by: Admin User"]
    },
    { 
      id: 8, 
      timestamp: "09:30 AM", 
      date: new Date(new Date().setDate(new Date().getDate() - 3)).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      dateObj: new Date(new Date().setDate(new Date().getDate() - 3)),
      user: "Admin User", 
      role: "System Admin", 
      action: "Account Role Changed", 
      account: "gadgets_inventory", 
      accountId: 9, 
      type: "edit", 
      details: ["Role: Cashier → Inventory Storer"]
    }
  ];

  // Available roles for shop accounts
  const availableRoles = [
    { value: "shop_owner", label: "Shop Owner", description: "Full access to all shop features" },
    { value: "manager", label: "Manager", description: "Manage shop operations, staff, and reports" },
    { value: "inventory_storer", label: "Inventory Storer", description: "Manage inventory and stock" },
    { value: "cashier", label: "Cashier", description: "Process sales and transactions" },
    { value: "viewer", label: "Viewer", description: "View-only access to shop data" }
  ];

  // ========== States ==========
  const [shopAccounts, setShopAccounts] = useState(initialShopAccounts);
  const [filteredAccounts, setFilteredAccounts] = useState(initialShopAccounts);
  const [logs, setLogs] = useState(initialHistory);
  const [filteredLogs, setFilteredLogs] = useState(initialHistory);
  
  const [activeTab, setActiveTab] = useState("all-accounts");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("all");
  
  // ====== Pagination States ======
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [pageInputValue, setPageInputValue] = useState("1");
  
  const [historyCurrentPage, setHistoryCurrentPage] = useState(1);
  const [historyItemsPerPage, setHistoryItemsPerPage] = useState(10);
  const [historyPageInputValue, setHistoryPageInputValue] = useState("1");
  
  // Date Filter States for History
  const [dateFilter, setDateFilter] = useState("all");
  const [customDateFrom, setCustomDateFrom] = useState("");
  const [customDateTo, setCustomDateTo] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // Modal states
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [modalType, setModalType] = useState("add");
  const [editingAccount, setEditingAccount] = useState(null);
  
  const [accountForm, setAccountForm] = useState({
    id: null,
    username: "",
    password: "",
    confirm_password: "",
    full_name: "",
    email: "",
    phone: "",
    role: "shop_owner",
    status: "Active"
  });
  
  const [logFilter, setLogFilter] = useState("all");
  const [selectedLogDetails, setSelectedLogDetails] = useState(null);
  const [showLogDetails, setShowLogDetails] = useState(false);

  // Refs
  const filterTimeoutRef = useRef(null);
  const pageChangeTimeoutRef = useRef(null);
  const tableBodyRef = useRef(null);
  const historyContainerRef = useRef(null);

  // Cleanup timeouts
  useEffect(() => {
    return () => {
      if (pageChangeTimeoutRef.current) {
        clearTimeout(pageChangeTimeoutRef.current);
      }
    };
  }, []);

  // Helper functions
  const getStatusCount = (status) => {
    let filtered = [...shopAccounts];
    
    if (selectedRoleFilter !== "all") {
      filtered = filtered.filter(account => account.role === selectedRoleFilter);
    }
    
    return filtered.filter(account => account.status === status).length;
  };

  const getTotalAccounts = () => {
    let filtered = [...shopAccounts];
    
    if (selectedRoleFilter !== "all") {
      filtered = filtered.filter(account => account.role === selectedRoleFilter);
    }
    
    if (selectedStatusFilter !== "all") {
      filtered = filtered.filter(account => account.status === selectedStatusFilter);
    }
    
    return filtered.length;
  };

  // Tab options with counts
  const tabOptions = useMemo(() => [
    { 
      value: "all-accounts", 
      label: "All Accounts",
      icon: "fas fa-user-circle", 
      count: getTotalAccounts()
    },
    { 
      value: "active", 
      label: "Active", 
      icon: "fas fa-check-circle", 
      count: getStatusCount("Active")
    },
    { 
      value: "unactive", 
      label: "Unactive",  
      icon: "fas fa-times-circle", 
      count: getStatusCount("Unactive")
    },
    { 
      value: "history", 
      label: "History",  
      icon: "fas fa-history", 
      count: logs.length
    }
  ], [shopAccounts, logs, selectedRoleFilter, selectedStatusFilter]);

  // Log counts
  const logCounts = useMemo(() => {
    const all = filteredLogs.length;
    const add = logs.filter(l => l.type === "add").length;
    const edit = logs.filter(l => l.type === "edit").length;
    const del = logs.filter(l => l.type === "delete").length;
    
    return {
      all,
      add,
      edit,
      delete: del
    };
  }, [logs, filteredLogs]);

  // ========== Account Filter Function ==========
  useEffect(() => {
    setIsTableLoading(true);
    
    if (filterTimeoutRef.current) {
      clearTimeout(filterTimeoutRef.current);
    }
    
    filterTimeoutRef.current = setTimeout(() => {
      let filtered = [...shopAccounts];
      
      // Filter by role
      if (selectedRoleFilter !== "all") {
        filtered = filtered.filter(account => account.role === selectedRoleFilter);
      }
      
      // Filter by status (from filter dropdown)
      if (selectedStatusFilter !== "all") {
        filtered = filtered.filter(account => account.status === selectedStatusFilter);
      }
      
      // Filter by status tab
      if (activeTab === "active") {
        filtered = filtered.filter(account => account.status === "Active");
      } else if (activeTab === "unactive") {
        filtered = filtered.filter(account => account.status === "Unactive");
      }
      
      // Apply search
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(account => {
          if (searchField === "all") {
            return (
              account.username.toLowerCase().includes(query) ||
              account.full_name.toLowerCase().includes(query) ||
              account.email.toLowerCase().includes(query) ||
              (account.phone && account.phone.toLowerCase().includes(query))
            );
          } else if (searchField === "username") {
            return account.username.toLowerCase().includes(query);
          } else if (searchField === "full_name") {
            return account.full_name.toLowerCase().includes(query);
          } else if (searchField === "email") {
            return account.email.toLowerCase().includes(query);
          } else if (searchField === "phone") {
            return account.phone && account.phone.toLowerCase().includes(query);
          } else if (searchField === "role") {
            const roleLabel = availableRoles.find(r => r.value === account.role)?.label || "";
            return roleLabel.toLowerCase().includes(query);
          }
          return false;
        });
      }
      
      setFilteredAccounts(filtered);
      setCurrentPage(1);
      setPageInputValue("1");
      setIsTableLoading(false);
    }, 300);
    
    return () => {
      if (filterTimeoutRef.current) {
        clearTimeout(filterTimeoutRef.current);
      }
    };
  }, [activeTab, shopAccounts, searchQuery, searchField, selectedRoleFilter, selectedStatusFilter]);

  // ========== History Filter Function ==========
  useEffect(() => {
    let filtered = [...logs];
    
    // Filter by action type
    if (logFilter !== "all") {
      filtered = filtered.filter(log => log.type === logFilter);
    }
    
    // Filter by date
    const now = new Date();
    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59, 999);
    
    if (dateFilter === "today") {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateObj);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === today.getTime();
      });
    } else if (dateFilter === "yesterday") {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateObj);
        logDate.setHours(0, 0, 0, 0);
        return logDate.getTime() === yesterday.getTime();
      });
    } else if (dateFilter === "thisWeek") {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateObj);
        return logDate >= weekAgo && logDate <= now;
      });
    } else if (dateFilter === "thisMonth") {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateObj);
        return logDate >= monthStart && logDate <= monthEnd;
      });
    } else if (dateFilter === "custom" && customDateFrom && customDateTo) {
      const fromDate = new Date(customDateFrom);
      fromDate.setHours(0, 0, 0, 0);
      const toDate = new Date(customDateTo);
      toDate.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(log => {
        const logDate = new Date(log.dateObj);
        return logDate >= fromDate && logDate <= toDate;
      });
    }
    
    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.dateObj) - new Date(a.dateObj));
    
    setFilteredLogs(filtered);
    setHistoryCurrentPage(1);
    setHistoryPageInputValue("1");
  }, [logs, logFilter, dateFilter, customDateFrom, customDateTo]);

  // ========== Account Pagination ==========
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = useMemo(() => 
    filteredAccounts.slice(indexOfFirstItem, indexOfLastItem), 
    [filteredAccounts, indexOfFirstItem, indexOfLastItem]
  );
  const totalPages = useMemo(() => 
    Math.ceil(filteredAccounts.length / itemsPerPage), 
    [filteredAccounts.length, itemsPerPage]
  );

  const changePage = useCallback((newPage, direction) => {
    if (newPage === currentPage || newPage < 1 || newPage > totalPages) return;
    
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
    }
    
    setIsPageLoading(true);
    setLoadingDirection(direction);
    
    pageChangeTimeoutRef.current = setTimeout(() => {
      setCurrentPage(newPage);
      setPageInputValue(newPage.toString());
      setIsPageLoading(false);
      setLoadingDirection(null);
      
      if (tableBodyRef.current) {
        tableBodyRef.current.scrollTop = 0;
      }
    }, 150);
  }, [currentPage, totalPages]);

  // ========== History Pagination ==========
  const historyIndexLast = historyCurrentPage * historyItemsPerPage;
  const historyIndexFirst = historyIndexLast - historyItemsPerPage;
  const currentLogs = useMemo(() => 
    filteredLogs.slice(historyIndexFirst, historyIndexLast), 
    [filteredLogs, historyIndexFirst, historyIndexLast]
  );
  const historyTotalPages = useMemo(() => 
    Math.ceil(filteredLogs.length / historyItemsPerPage), 
    [filteredLogs.length, historyItemsPerPage]
  );

  const changeHistoryPage = useCallback((newPage, direction) => {
    if (newPage === historyCurrentPage || newPage < 1 || newPage > historyTotalPages) return;
    
    if (pageChangeTimeoutRef.current) {
      clearTimeout(pageChangeTimeoutRef.current);
    }
    
    setIsPageLoading(true);
    setLoadingDirection(direction);
    
    pageChangeTimeoutRef.current = setTimeout(() => {
      setHistoryCurrentPage(newPage);
      setHistoryPageInputValue(newPage.toString());
      setIsPageLoading(false);
      setLoadingDirection(null);
      
      if (historyContainerRef.current) {
        historyContainerRef.current.scrollTop = 0;
      }
    }, 150);
  }, [historyCurrentPage, historyTotalPages]);

  const handleHistoryPageInputBlur = useCallback(() => {
    const value = parseInt(historyPageInputValue);
    if (!isNaN(value) && value >= 1 && value <= historyTotalPages && value !== historyCurrentPage) {
      changeHistoryPage(value, 'jump');
    } else {
      setHistoryPageInputValue(historyCurrentPage.toString());
    }
  }, [historyPageInputValue, historyTotalPages, historyCurrentPage, changeHistoryPage]);

  const handleDateFilterChange = useCallback((filter) => {
    setDateFilter(filter);
    setHistoryCurrentPage(1);
    setHistoryPageInputValue("1");
    setShowDatePicker(filter === "custom");
    if (filter !== "custom") {
      setCustomDateFrom("");
      setCustomDateTo("");
    }
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateFilter("all");
    setCustomDateFrom("");
    setCustomDateTo("");
    setShowDatePicker(false);
    setHistoryCurrentPage(1);
    setHistoryPageInputValue("1");
  }, []);

  // Group logs by date for display
  const groupLogsByDate = (logs) => {
    const grouped = {};
    logs.forEach(log => {
      const dateKey = log.date;
      if (!grouped[dateKey]) grouped[dateKey] = [];
      grouped[dateKey].push(log);
    });
    return grouped;
  };

  const groupedLogs = useMemo(() => groupLogsByDate(currentLogs), [currentLogs]);

  // ========== CRUD Operations ==========
  const handleTabChange = (e) => {
    setActiveTab(e.target.value);
    setSearchQuery("");
  };

  const handleSearchChange = (e) => setSearchQuery(e.target.value);
  const handleSearchFieldChange = (e) => setSearchField(e.target.value);
  const clearSearch = () => setSearchQuery("");

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedRoleFilter("all");
    setSelectedStatusFilter("all");
    setSearchField("all");
  };

  // Helper function to detect changes between old and new account
  const detectChanges = (oldAccount, newAccount) => {
    const changes = [];

    // Check username change
    if (oldAccount.username !== newAccount.username) {
      changes.push(`Username: ${oldAccount.username} → ${newAccount.username}`);
    }

    // Check full name change
    if (oldAccount.full_name !== newAccount.full_name) {
      changes.push(`Full Name: ${oldAccount.full_name} → ${newAccount.full_name}`);
    }

    // Check email change
    if (oldAccount.email !== newAccount.email) {
      changes.push(`Email: ${oldAccount.email} → ${newAccount.email}`);
    }

    // Check phone change
    if (oldAccount.phone !== newAccount.phone) {
      changes.push(`Phone: ${oldAccount.phone || 'N/A'} → ${newAccount.phone || 'N/A'}`);
    }

    // Check role change
    if (oldAccount.role !== newAccount.role) {
      const oldRole = availableRoles.find(r => r.value === oldAccount.role)?.label || oldAccount.role;
      const newRole = availableRoles.find(r => r.value === newAccount.role)?.label || newAccount.role;
      changes.push(`Role: ${oldRole} → ${newRole}`);
    }

    // Check status change
    if (oldAccount.status !== newAccount.status) {
      changes.push(`Status: ${oldAccount.status} → ${newAccount.status}`);
    }

    return changes;
  };

  const addLog = (actionType, account, oldAccount = null) => {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const dateString = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    
    let action = "", details = [];
    
    if (actionType === "add") {
      action = "Account Created";
      details = [
        `Username: ${account.username}`,
        `Full Name: ${account.full_name}`,
        `Role: ${availableRoles.find(r => r.value === account.role)?.label || account.role}`,
        `Status: ${account.status}`
      ];
    } else if (actionType === "edit" && oldAccount) {
      const changes = detectChanges(oldAccount, account);
      if (changes.some(change => change.includes("Status:"))) {
        action = "Account Status Updated";
      } else if (changes.some(change => change.includes("Role:"))) {
        action = "Account Role Changed";
      } else {
        action = "Account Updated";
      }
      details = changes;
    } else if (actionType === "delete") {
      action = "Account Deleted";
      details = [
        `Username: ${account.username}`,
        `Full Name: ${account.full_name}`,
        `Role: ${availableRoles.find(r => r.value === account.role)?.label || account.role}`,
        `Deleted by: ${currentUser.name}`
      ];
    }
    
    const newLog = {
      id: logs.length + 1,
      timestamp: timeString,
      date: dateString,
      dateObj: now,
      user: currentUser.name,
      role: currentUser.role,
      action,
      account: account.username,
      accountId: account.id,
      type: actionType,
      details
    };
    
    setLogs(prev => [newLog, ...prev]);
  };

  const handleAction = (action, accountId) => {
    const account = shopAccounts.find(a => a.id === accountId);
    
    if (action === 'edit') {
      setEditingAccount(account);
      setAccountForm({
        id: account.id,
        username: account.username,
        password: "",
        confirm_password: "",
        full_name: account.full_name,
        email: account.email,
        phone: account.phone,
        role: account.role,
        status: account.status
      });
      setModalType("edit");
      setShowAccountModal(true);
    } else if (action === 'delete') {
      const confirmMessage = `Are you sure you want to delete the account "${account.username}"?\n\nNote: This action cannot be undone.`;
      
      if (window.confirm(confirmMessage)) {
        setShopAccounts(prev => prev.filter(a => a.id !== accountId));
        addLog("delete", account);
      }
    }
  };

  const generateUsernameSuggestion = () => {
    const rolePrefix = accountForm.role === "shop_owner" ? "owner" : 
                      accountForm.role === "manager" ? "manager" :
                      accountForm.role === "inventory_storer" ? "inventory" :
                      accountForm.role === "cashier" ? "cashier" : "viewer";
    
    const existingUsernames = shopAccounts
      .filter(acc => acc.role === accountForm.role)
      .map(acc => acc.username);
    
    let suggestion = `${rolePrefix}_user`;
    let counter = 1;
    
    while (existingUsernames.includes(suggestion) && counter < 10) {
      suggestion = `${rolePrefix}_user${counter}`;
      counter++;
    }
    
    return suggestion;
  };

  // Auto-generate username when role changes
  useEffect(() => {
    if (modalType === "add" && accountForm.role) {
      const suggestion = generateUsernameSuggestion();
      setAccountForm(prev => ({
        ...prev,
        username: suggestion
      }));
    }
  }, [accountForm.role, modalType]);

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setAccountForm(prev => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status) => {
    setAccountForm(prev => ({ ...prev, status }));
  };

  const resetForm = () => {
    setAccountForm({
      id: null,
      username: "",
      password: "",
      confirm_password: "",
      full_name: "",
      email: "",
      phone: "",
      role: "shop_owner",
      status: "Active"
    });
  };

  const openAddModal = () => {
    setModalType("add");
    resetForm();
    setShowAccountModal(true);
  };

  const handleSaveAccount = () => {
    // Validation
    if (!accountForm.username || !accountForm.full_name || !accountForm.email || !accountForm.role) {
      alert("Please fill in all required fields");
      return;
    }

    if (modalType === "add") {
      if (!accountForm.password) {
        alert("Please enter a password");
        return;
      }
      
      if (accountForm.password !== accountForm.confirm_password) {
        alert("Passwords do not match");
        return;
      }
      
      if (accountForm.password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }
    }

    if (modalType === "add") {
      const newId = shopAccounts.length > 0 ? Math.max(...shopAccounts.map(a => a.id)) + 1 : 1;
      
      const newAccount = {
        id: newId,
        username: accountForm.username,
        password: "********",
        full_name: accountForm.full_name,
        email: accountForm.email,
        phone: accountForm.phone,
        role: accountForm.role,
        status: accountForm.status,
        created_at: new Date().toLocaleString(),
        last_login: null
      };
      
      setShopAccounts(prev => [...prev, newAccount]);
      addLog("add", newAccount);
      
      alert("Account created successfully!");
    } else if (modalType === "edit" && editingAccount) {
      const updatedAccount = {
        ...editingAccount,
        username: accountForm.username,
        full_name: accountForm.full_name,
        email: accountForm.email,
        phone: accountForm.phone,
        role: accountForm.role,
        status: accountForm.status,
        updated_at: new Date().toLocaleString()
      };
      
      const updatedData = shopAccounts.map(acc => 
        acc.id === editingAccount.id ? updatedAccount : acc
      );
      
      setShopAccounts(updatedData);
      addLog("edit", updatedAccount, editingAccount);
      setEditingAccount(null);
      
      alert("Account updated successfully!");
    }
    
    resetForm();
    setShowAccountModal(false);
  };

  const showLogDetailModal = (log) => {
    setSelectedLogDetails(log);
    setShowLogDetails(true);
  };

  // Get role label
  const getRoleLabel = (roleValue) => {
    const role = availableRoles.find(r => r.value === roleValue);
    return role ? role.label : roleValue;
  };

  // Get role description
  const getRoleDescription = (roleValue) => {
    const role = availableRoles.find(r => r.value === roleValue);
    return role ? role.description : "";
  };

  // ========== Loading Spinner Component ==========
  const LoadingSpinner = ({ direction }) => {
    let message = "";
    if (direction === 'prev') {
      message = "Loading previous page...";
    } else if (direction === 'next') {
      message = "Loading next page...";
    } else if (direction === 'jump') {
      message = "Jumping to page...";
    } else {
      message = "Loading data...";
    }
    
    return (
      <div className="user-account-loading-overlay">
        <div className="user-account-loading-spinner">
          <div className="user-account-spinner"></div>
          <div className="user-account-loading-message">{message}</div>
        </div>
      </div>
    );
  };

  return (
    <div className="user-account-container">
      {/* Loading Overlay */}
      {isPageLoading && <LoadingSpinner direction={loadingDirection} />}

      <div className="shop-management-header uac">
        <div className="header-top-row">
          <NavLink to="/ownerDashboard" className="user-account-back-btn">
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </NavLink>
          <div className="header-center-content">
            <h1><i className="fas fa-user-circle"></i> Account Management</h1>
            <p>Manage all user accounts</p>
          </div>
        </div>
      </div>

      <div className="user-account-tabs-header">
        {/* Selection Box for Tabs */}
        <div className="user-account-tabs-selector">
          <div className="user-account-select-container">
            <i className={`fas ${tabOptions.find(tab => tab.value === activeTab)?.icon} user-account-select-icon`}></i>
            <select 
              className="user-account-tab-select"
              value={activeTab}
              onChange={handleTabChange}
              disabled={isPageLoading}
            >
              {tabOptions.map((tab) => (
                <option key={tab.value} value={tab.value}>
                  {tab.label} ({tab.count})
                </option>
              ))}
            </select>
            <i className="fas fa-chevron-down user-account-select-arrow"></i>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        {activeTab !== 'history' && (
          <>
            <div className="user-account-search-controls">
              <div className="user-account-search-input-group">
                <i className="fas fa-search user-account-search-icon"></i>
                <input
                  type="text"
                  className="user-account-search-input"
                  placeholder="Search accounts..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  disabled={isPageLoading}
                />
                {searchQuery && (
                  <button 
                    className="user-account-clear-search-btn" 
                    onClick={clearSearch} 
                    disabled={isPageLoading}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                )}
              </div>
              
              <div className="user-account-filter-buttons">
                {/* Role Filter Dropdown */}
                <div className="user-account-filter-dropdown">
                  <i className="fas fa-tag user-account-filter-icon"></i>
                  <select 
                    className="user-account-filter-select"
                    value={selectedRoleFilter}
                    onChange={(e) => setSelectedRoleFilter(e.target.value)}
                    disabled={isPageLoading}
                  >
                    <option value="all">All Roles</option>
                    {availableRoles.map(role => (
                      <option key={role.value} value={role.value}>
                        {role.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {(searchQuery || selectedRoleFilter !== "all" || selectedStatusFilter !== "all") && (
                  <button 
                    className="user-account-clear-filters-btn"
                    onClick={clearAllFilters}
                    disabled={isPageLoading}
                  >
                    <i className="fas fa-times"></i> Clear
                  </button>
                )}
              </div>
            </div>
            
            <button 
              className="user-account-add-btn"
              onClick={openAddModal}
              disabled={isPageLoading}
            >
              <i className="fas fa-plus"></i> Create Account
            </button>
          </>
        )}
        
        {activeTab === 'history' && (
          <div style={{ flex: 1 }}></div>
        )}
      </div>
  
      <div className="subtab-content active">
        {activeTab === "history" ? (
          /* ===== HISTORY TAB with Pagination ===== */
          <div className="user-account-history-section">
            <div className="user-account-section-title">
              <div className="user-account-title-row">
                <div className="user-account-title-left">
                  <i className="fas fa-history"></i> 
                  <span className="user-account-title-text">
                    Activity History
                  </span>
                </div>

                {/* Center - History Pagination */}
                <div className="user-account-title-center">
                  <div className="user-account-compact-nav">
                    <button 
                      className={`user-account-nav-btn ${isPageLoading ? 'loading' : ''}`} 
                      onClick={() => changeHistoryPage(historyCurrentPage - 1, 'prev')}
                      disabled={historyCurrentPage === 1 || isPageLoading}
                      title="Previous Page"
                    >
                      {isPageLoading && loadingDirection === 'prev' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-left"></i>
                      )}
                    </button>
                    
                    <div className="user-account-page-control">
                      <input 
                        type="text" 
                        className="user-account-page-input" 
                        value={historyPageInputValue}
                        onChange={(e) => setHistoryPageInputValue(e.target.value)}
                        onBlur={handleHistoryPageInputBlur}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={isPageLoading}
                      />
                      <span className="user-account-page-total">
                        / {historyTotalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`user-account-nav-btn ${isPageLoading ? 'loading' : ''}`} 
                      onClick={() => changeHistoryPage(historyCurrentPage + 1, 'next')}
                      disabled={historyCurrentPage === historyTotalPages || historyTotalPages === 0 || isPageLoading}
                      title="Next Page"
                    >
                      {isPageLoading && loadingDirection === 'next' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </button>
                    
                    <div className="user-account-items-per-page">
                      <select 
                        className="user-account-per-page-select" 
                        value={historyItemsPerPage} 
                        onChange={(e) => {
                          setHistoryItemsPerPage(parseInt(e.target.value));
                          setHistoryCurrentPage(1);
                          setHistoryPageInputValue("1");
                        }}
                        disabled={isPageLoading}
                      >
                        <option value={5}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="user-account-per-page-label">
                        /pg
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side - Showing count */}
                <div className="user-account-title-right">
                  {isPageLoading ? (
                    <span className="user-account-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="user-account-loading-label">Loading...</span>
                    </span>
                  ) : (
                    <span className="user-account-showing-count">
                      <span className="user-account-count-numbers">
                        {filteredLogs.length > 0 ? historyIndexFirst + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="user-account-count-numbers">
                        {Math.min(historyIndexLast, filteredLogs.length)}
                      </span>
                      <span> / </span>
                      <span className="user-account-count-numbers">
                        {filteredLogs.length}
                      </span>
                      <span className="user-account-count-label">
                        items
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            {/* Log Filters & Date Filters */}
            <div className="user-account-log-filters">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', alignItems: 'center', width: '100%' }}>
                {/* Action Filter Tabs - Left side */}
                <div className="user-account-filter-tabs" style={{ flex: '1 1 auto' }}>
                  <button 
                    className={`user-account-filter-tab ${logFilter === "all" ? "active" : ""}`}
                    onClick={() => { setLogFilter("all"); setHistoryCurrentPage(1); setHistoryPageInputValue("1"); }}
                    disabled={isPageLoading}
                  >
                    All 
                    <span className="user-account-filter-count">({logCounts.all})</span>
                  </button>
                  <button 
                    className={`user-account-filter-tab ${logFilter === "add" ? "active" : ""}`}
                    onClick={() => { setLogFilter("add"); setHistoryCurrentPage(1); setHistoryPageInputValue("1"); }}
                    disabled={isPageLoading}
                  >
                    <i className="fas fa-plus"></i> 
                    <span className="user-account-filter-count">({logCounts.add})</span>
                  </button>
                  <button 
                    className={`user-account-filter-tab ${logFilter === "edit" ? "active" : ""}`}
                    onClick={() => { setLogFilter("edit"); setHistoryCurrentPage(1); setHistoryPageInputValue("1"); }}
                    disabled={isPageLoading}
                  >
                    <i className="fas fa-edit"></i> 
                    <span className="user-account-filter-count">({logCounts.edit})</span>
                  </button>
                  <button 
                    className={`user-account-filter-tab ${logFilter === "delete" ? "active" : ""}`}
                    onClick={() => { setLogFilter("delete"); setHistoryCurrentPage(1); setHistoryPageInputValue("1"); }}
                    disabled={isPageLoading}
                  >
                    <i className="fas fa-trash"></i> 
                    <span className="user-account-filter-count">({logCounts.delete})</span>
                  </button>
                </div>

                {/* Date Filter Tabs - Right side */}
                <div className="user-account-filter-tabs" style={{ marginLeft: 'auto' }}>
                  <button 
                    className={`user-account-filter-tab ${dateFilter === "all" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("all")}
                    disabled={isPageLoading}
                  >
                    All Time
                  </button>
                  <button 
                    className={`user-account-filter-tab ${dateFilter === "today" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("today")}
                    disabled={isPageLoading}
                  >
                    Today
                  </button>
                  <button 
                    className={`user-account-filter-tab ${dateFilter === "yesterday" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("yesterday")}
                    disabled={isPageLoading}
                  >
                    Yesterday
                  </button>
                  <button 
                    className={`user-account-filter-tab ${dateFilter === "thisWeek" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisWeek")}
                    disabled={isPageLoading}
                  >
                    This Week
                  </button>
                  <button 
                    className={`user-account-filter-tab ${dateFilter === "thisMonth" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("thisMonth")}
                    disabled={isPageLoading}
                  >
                    This Month
                  </button>
                  <button 
                    className={`user-account-filter-tab ${dateFilter === "custom" ? "active" : ""}`}
                    onClick={() => handleDateFilterChange("custom")}
                    disabled={isPageLoading}
                  >
                    <i className="fas fa-calendar"></i> Custom
                  </button>
                  
                  {dateFilter !== "all" && (
                    <button 
                      className="user-account-filter-tab"
                      onClick={clearDateFilter}
                      style={{ backgroundColor: '#fef2f7', color: '#f72585' }}
                      disabled={isPageLoading}
                    >
                      <i className="fas fa-times"></i> Clear
                    </button>
                  )}
                </div>
              </div>

              {/* Custom Date Picker */}
              {showDatePicker && (
                <div className="user-account-custom-date-picker">
                  <div className="user-account-date-picker-row">
                    <label>From:</label>
                    <input
                      type="date"
                      className="user-account-date-input"
                      value={customDateFrom}
                      onChange={(e) => setCustomDateFrom(e.target.value)}
                    />
                  </div>
                  <div className="user-account-date-picker-row">
                    <label>To:</label>
                    <input
                      type="date"
                      className="user-account-date-input"
                      value={customDateTo}
                      onChange={(e) => setCustomDateTo(e.target.value)}
                    />
                  </div>
                  <button 
                    className="user-account-apply-date-btn"
                    onClick={() => {
                      if (customDateFrom && customDateTo) {
                        setHistoryCurrentPage(1);
                        setHistoryPageInputValue("1");
                      }
                    }}
                    disabled={!customDateFrom || !customDateTo}
                  >
                    <i className="fas fa-check"></i> Apply
                  </button>
                </div>
              )}
            </div>
            
            {/* Compact Logs Container */}
            <div 
              className="user-account-compact-logs-container" 
              ref={historyContainerRef}
              style={{ position: 'relative', minHeight: '400px' }}
            >
              {Object.keys(groupedLogs).length > 0 ? (
                Object.entries(groupedLogs).map(([date, dateLogs]) => (
                  <div key={date} className="user-account-date-group">
                    <div className="user-account-date-header">
                      <span className="user-account-date-label">{date}</span>
                      <span className="user-account-date-count">{dateLogs.length} activities</span>
                    </div>
                    <div className="user-account-logs-list">
                      {dateLogs.map(log => (
                        <div 
                          key={log.id} 
                          className={`user-account-compact-log-entry log-${log.type}`}
                          onClick={() => showLogDetailModal(log)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="user-account-log-icon">
                            {log.type === 'add' && <i className="fas fa-plus-circle"></i>}
                            {log.type === 'edit' && <i className="fas fa-edit"></i>}
                            {log.type === 'delete' && <i className="fas fa-trash"></i>}
                          </div>
                          <div className="user-account-log-content">
                            <div className="user-account-log-main-info">
                              <span className="user-account-log-action">
                                {log.action}
                              </span>
                              <span className="user-account-log-account">
                                "{log.account}"
                                {log.accountId && <span className="user-account-account-id">#{log.accountId}</span>}
                              </span>
                            </div>
                            <div className="user-account-log-details">
                              <span className="user-account-log-user">
                                <i className="fas fa-user"></i> {log.user}
                                <span className="user-account-user-role">({log.role})</span>
                              </span>
                              <span className="user-account-log-time">
                                <i className="fas fa-clock"></i> {log.timestamp}
                              </span>
                              {log.details && log.details.length > 0 && (
                                <span className="user-account-log-detail-count">
                                  <i className="fas fa-list"></i> {log.details.length} changes
                                </span>
                              )}
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
                  <p>No activities found for the selected filter.</p>
                  {(dateFilter !== "all" || logFilter !== "all") && (
                    <button 
                      className="user-account-clear-search-btn secondary"
                      onClick={clearDateFilter}
                    >
                      Clear Filters
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* ===== ACCOUNTS TAB with Pagination ===== */
          <>
            <div className="user-account-section-title">
              <div className="user-account-title-row">
                <div className="user-account-title-left">
                  <i className="fas fa-user-circle"></i> 
                  <span className="user-account-title-text">
                    {activeTab === "all-accounts" && "All Accounts"}
                    {activeTab === "active" && "Active Accounts"}
                    {activeTab === "unactive" && "Unactive Accounts"}
                  </span>
                </div>
                
                {/* Center - Pagination */}
                <div className="user-account-title-center">
                  <div className="user-account-compact-nav">
                    <button 
                      className={`user-account-nav-btn ${isPageLoading ? 'loading' : ''}`} 
                      onClick={() => changePage(currentPage - 1, 'prev')}
                      disabled={currentPage === 1 || isPageLoading}
                      title="Previous Page"
                    >
                      {isPageLoading && loadingDirection === 'prev' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-left"></i>
                      )}
                    </button>
                    
                    <div className="user-account-page-control">
                      <input 
                        type="text" 
                        className="user-account-page-input" 
                        value={pageInputValue}
                        onChange={(e) => setPageInputValue(e.target.value)}
                        onBlur={() => {
                          const value = parseInt(pageInputValue);
                          if (!isNaN(value) && value >= 1 && value <= totalPages && value !== currentPage) {
                            changePage(value, 'jump');
                          } else {
                            setPageInputValue(currentPage.toString());
                          }
                        }}
                        onKeyPress={(e) => e.key === 'Enter' && e.target.blur()}
                        disabled={isPageLoading}
                      />
                      <span className="user-account-page-total">
                        / {totalPages.toLocaleString()}
                      </span>
                    </div>
                    
                    <button 
                      className={`user-account-nav-btn ${isPageLoading ? 'loading' : ''}`} 
                      onClick={() => changePage(currentPage + 1, 'next')}
                      disabled={currentPage === totalPages || totalPages === 0 || isPageLoading}
                      title="Next Page"
                    >
                      {isPageLoading && loadingDirection === 'next' ? (
                        <i className="fas fa-spinner fa-spin"></i>
                      ) : (
                        <i className="fas fa-chevron-right"></i>
                      )}
                    </button>
                    
                    <div className="user-account-items-per-page">
                      <select 
                        className="user-account-per-page-select" 
                        value={itemsPerPage} 
                        onChange={(e) => {
                          setItemsPerPage(parseInt(e.target.value));
                          setCurrentPage(1);
                          setPageInputValue("1");
                        }}
                        disabled={isPageLoading}
                      >
                        <option value={5}>10</option>
                        <option value={20}>20</option>
                        <option value={50}>50</option>
                        <option value={100}>100</option>
                      </select>
                      <span className="user-account-per-page-label">
                        /pg
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="user-account-title-right">
                  {isTableLoading ? (
                    <span className="user-account-loading-text">
                      <i className="fas fa-spinner fa-spin"></i> 
                      <span className="user-account-loading-label">Loading...</span>
                    </span>
                  ) : (
                    <span className="user-account-showing-count">
                      <span className="user-account-count-numbers">
                        {filteredAccounts.length > 0 ? indexOfFirstItem + 1 : 0}
                      </span>
                      <span> - </span>
                      <span className="user-account-count-numbers">
                        {Math.min(indexOfLastItem, filteredAccounts.length)}
                      </span>
                      <span> / </span>
                      <span className="user-account-count-numbers">
                        {filteredAccounts.length}
                      </span>
                      <span className="user-account-count-label">
                        items
                      </span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Filter badges */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                {searchQuery && (
                  <span className="user-account-search-badge">
                    <i className="fas fa-search"></i> "{searchQuery}"
                  </span>
                )}
                {selectedRoleFilter !== "all" && (
                  <span className="user-account-filter-badge">
                    <i className="fas fa-tag"></i> {availableRoles.find(r => r.value === selectedRoleFilter)?.label}
                  </span>
                )}
                {selectedStatusFilter !== "all" && (
                  <span className="user-account-filter-badge">
                    <i className="fas fa-circle"></i> {selectedStatusFilter}
                  </span>
                )}
              </div>
            </div>
            
            <div className="user-account-table-wrapper" ref={tableBodyRef}>
              <table className="user-account-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Username</th>
                    <th>Full Name</th>
                    <th>Contact</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {isTableLoading ? (
                    <tr>
                      <td colSpan="7" className="user-account-no-data">
                        <div className="user-account-no-data-content">
                          <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px' }}></i>
                          <p>Loading data...</p>
                        </div>
                      </td>
                    </tr>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((account, index) => (
                      <tr key={account.id}>
                        <td>{indexOfFirstItem + index + 1}</td>
                        <td>
                          <div>
                            <strong>{account.username}</strong>
                            {account.created_at && (
                              <div className="user-account-created">
                                <i className="far fa-clock"></i> Created: {new Date(account.created_at).toLocaleDateString()}
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{account.full_name}</td>
                        <td>
                          <div className="user-account-contact-cell">
                            <div className="user-account-contact-item">
                              <i className="fas fa-envelope user-account-contact-icon"></i>
                              <span className="user-account-contact-text">{account.email}</span>
                            </div>
                            <div className="user-account-contact-item">
                              <i className="fas fa-phone user-account-contact-icon"></i>
                              <span className="user-account-contact-text">{account.phone}</span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="user-account-role-cell">
                            <span className={`user-account-role-badge role-${account.role}`}>
                              {getRoleLabel(account.role)}
                            </span>
                            <div className="user-account-role-desc">
                              {getRoleDescription(account.role)}
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className={`user-account-status-badge status-${account.status.toLowerCase()}`}>
                            {account.status}
                          </span>
                          {account.last_login && (
                            <div className="user-account-last-login">
                              <i className="fas fa-sign-in-alt"></i> Last: {new Date(account.last_login).toLocaleDateString()}
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="user-account-action-buttons">
                            <button 
                              className="user-account-action-btn user-account-action-edit" 
                              title="Edit Account"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('edit', account.id);
                              }}
                              disabled={isPageLoading}
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button 
                              className="user-account-action-btn user-account-action-delete" 
                              title="Delete Account"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction('delete', account.id);
                              }}
                              disabled={isPageLoading}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" className="user-account-no-data">
                        <div className="user-account-no-data-content">
                          <i className="fas fa-user-slash"></i>
                          <p>
                            {searchQuery 
                              ? `No accounts found for "${searchQuery}"`
                              : selectedRoleFilter !== "all" || selectedStatusFilter !== "all"
                              ? "No accounts found for selected filters"
                              : "No accounts found for this filter"}
                          </p>
                          {(searchQuery || selectedRoleFilter !== "all" || selectedStatusFilter !== "all") && (
                            <button className="user-account-clear-search-btn secondary" onClick={clearAllFilters}>
                              Clear All Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Account Modal */}
      {showAccountModal && (
        <div className="user-account-modal-overlay">
          <div className="user-account-modal-content">
            <div className="user-account-modal-header">
              <h3>
                <i className={`fas ${modalType === "add" ? "fa-plus-circle" : "fa-edit"}`}></i> 
                {modalType === "add" ? "Create New Account" : "Edit Account"}
              </h3>
              <button className="user-account-modal-close" onClick={() => setShowAccountModal(false)} disabled={isPageLoading}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="user-account-modal-body">
              <div className="user-account-current-user-banner">
                <i className="fas fa-user-circle"></i>
                <div>
                  <div className="user-account-user-name">{currentUser.name}</div>
                  <div className="user-account-user-role">{currentUser.role}</div>
                </div>
              </div>
              
              <div className="user-account-form-group">
                <label className="user-account-required">
                  Role
                </label>
                <select
                  name="role"
                  value={accountForm.role}
                  onChange={handleFormChange}
                  disabled={isPageLoading}
                >
                  {availableRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
                <div className="user-account-role-hint">
                  {getRoleDescription(accountForm.role)}
                </div>
              </div>
              
              <div className="user-account-form-group">
                <label className="user-account-required">
                  Username
                </label>
                <div className="user-account-username-container">
                  <input
                    type="text"
                    name="username"
                    value={accountForm.username}
                    onChange={handleFormChange}
                    placeholder="username"
                    maxLength="30"
                    disabled={isPageLoading}
                  />
                  {modalType === "add" && (
                    <button 
                      type="button"
                      className="user-account-generate-btn"
                      onClick={() => {
                        const suggestion = generateUsernameSuggestion();
                        setAccountForm(prev => ({ ...prev, username: suggestion }));
                      }}
                      title="Generate username suggestion"
                      disabled={isPageLoading}
                    >
                      <i className="fas fa-magic"></i> Suggest
                    </button>
                  )}
                </div>
                <div className="user-account-form-hint">
                  Username will be used for login
                </div>
              </div>
              
              <div className="user-account-form-row">
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={accountForm.full_name}
                    onChange={handleFormChange}
                    placeholder="John Doe"
                    maxLength="50"
                    disabled={isPageLoading}
                  />
                </div>
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={accountForm.email}
                    onChange={handleFormChange}
                    placeholder="user@example.com"
                    disabled={isPageLoading}
                  />
                </div>
              </div>
              
              <div className="user-account-form-row">
                <div className="user-account-form-group">
                  <label>Phone</label>
                  <input
                    type="text"
                    name="phone"
                    value={accountForm.phone}
                    onChange={handleFormChange}
                    placeholder="09123456789"
                    disabled={isPageLoading}
                  />
                </div>
                {modalType === "add" ? (
                  <div className="user-account-form-group">
                    <label className="user-account-required">
                      Password
                    </label>
                    <input
                      type="password"
                      name="password"
                      value={accountForm.password}
                      onChange={handleFormChange}
                      placeholder="Enter password"
                      disabled={isPageLoading}
                    />
                  </div>
                ) : (
                  <div className="user-account-form-group">
                    <label>Change Password</label>
                    <input
                      type="password"
                      name="password"
                      value={accountForm.password}
                      onChange={handleFormChange}
                      placeholder="Leave blank to keep current"
                      disabled={isPageLoading}
                    />
                  </div>
                )}
              </div>
              
              {modalType === "add" && (
                <div className="user-account-form-group">
                  <label className="user-account-required">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    name="confirm_password"
                    value={accountForm.confirm_password}
                    onChange={handleFormChange}
                    placeholder="Confirm password"
                    disabled={isPageLoading}
                  />
                </div>
              )}
              
              <div className="user-account-form-group">
                <label className="user-account-required">
                  Status
                </label>
                <div className="user-account-status-select-group">
                  <div 
                    className={`user-account-status-option ${accountForm.status === 'Active' ? 'selected' : ''}`}
                    onClick={() => !isPageLoading && handleStatusChange('Active')}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={accountForm.status === 'Active'}
                      readOnly
                      className="user-account-status-radio"
                      disabled={isPageLoading}
                    />
                    <label className="user-account-status-label">
                      <i className="fas fa-check-circle"></i>
                      Active
                    </label>
                  </div>
                  <div 
                    className={`user-account-status-option ${accountForm.status === 'Unactive' ? 'selected' : ''}`}
                    onClick={() => !isPageLoading && handleStatusChange('Unactive')}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="Unactive"
                      checked={accountForm.status === 'Unactive'}
                      readOnly
                      className="user-account-status-radio"
                      disabled={isPageLoading}
                    />
                    <label className="user-account-status-label">
                      <i className="fas fa-times-circle"></i>
                      Unactive
                    </label>
                  </div>
                </div>
              </div>
              
              {modalType === "add" && (
                <div className="user-account-credentials-note">
                  <i className="fas fa-info-circle"></i>
                  <span>Login credentials will be sent to the provided email address.</span>
                </div>
              )}
            </div>
            <div className="user-account-modal-footer">
              <button className="user-account-btn-cancel" onClick={() => setShowAccountModal(false)} disabled={isPageLoading}>
                Cancel
              </button>
              <button 
                className="user-account-btn-submit" 
                onClick={handleSaveAccount}
                disabled={
                  !accountForm.username || 
                  !accountForm.full_name || 
                  !accountForm.email || 
                  !accountForm.role ||
                  (modalType === "add" && (!accountForm.password || !accountForm.confirm_password)) ||
                  isPageLoading
                }
              >
                {isPageLoading ? (
                  <>
                    <span className="fas fa-spinner fa-spin"></span> Processing...
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i> 
                    {modalType === "add" ? "Create Account" : "Save Changes"}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log Details Modal */}
      {showLogDetails && selectedLogDetails && (
        <div className="user-account-modal-overlay">
          <div className="user-account-modal-content" style={{ maxWidth: '600px' }}>
            <div className="user-account-modal-header">
              <h3>
                <i className={`fas ${
                  selectedLogDetails.type === 'add' ? 'fa-plus-circle' : 
                  selectedLogDetails.type === 'edit' ? 'fa-edit' : 
                  'fa-trash'
                }`}></i> 
                Activity Details
              </h3>
              <button className="user-account-modal-close" onClick={() => setShowLogDetails(false)}>
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="user-account-modal-body">
              <div className="user-account-log-detail-header">
                <div className="user-account-log-detail-main">
                  <div className="user-account-log-detail-action">
                    <span className={`user-account-action-badge user-account-action-${selectedLogDetails.type}`}>
                      {selectedLogDetails.type === 'add' && <i className="fas fa-plus"></i>}
                      {selectedLogDetails.type === 'edit' && <i className="fas fa-edit"></i>}
                      {selectedLogDetails.type === 'delete' && <i className="fas fa-trash"></i>}
                      {selectedLogDetails.action}
                    </span>
                  </div>
                  {selectedLogDetails.account && (
                    <div className="user-account-log-detail-account">
                      <i className="fas fa-user"></i>
                      <span className="user-account-name">{selectedLogDetails.account}</span>
                      {selectedLogDetails.accountId && (
                        <span className="user-account-id-detail">ID: #{selectedLogDetails.accountId}</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="user-account-log-detail-meta">
                  <div className="user-account-log-detail-user">
                    <i className="fas fa-user"></i>
                    <div>
                      <div className="user-account-user-name">{selectedLogDetails.user}</div>
                      <div className="user-account-user-role">{selectedLogDetails.role}</div>
                    </div>
                  </div>
                  <div className="user-account-log-detail-time">
                    <i className="fas fa-calendar"></i>
                    <div>
                      <div className="user-account-log-date">{selectedLogDetails.date}</div>
                      <div className="user-account-log-time">{selectedLogDetails.timestamp}</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="user-account-log-detail-content">
                <h4>Change Details:</h4>
                {selectedLogDetails.details && selectedLogDetails.details.length > 0 ? (
                  <div className="user-account-change-list">
                    {selectedLogDetails.details.map((detail, index) => (
                      <div key={index} className="user-account-change-item">
                        <i className="fas fa-chevron-right"></i>
                        <span>{detail}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="user-account-no-changes">
                    <i className="fas fa-info-circle"></i>
                    <span>No specific changes recorded</span>
                  </div>
                )}
              </div>
            </div>
            <div className="user-account-modal-footer">
              <button className="user-account-btn-cancel" onClick={() => setShowLogDetails(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserAccountPage;