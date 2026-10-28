import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import "../../light-style/owner-css/userManagement.css";

const UserManagementPage = () => {
  // Simplified user roles for small businesses
  const USER_ROLES = [
    { code: 'owner', name: 'ဆိုင်ပိုင်ရှင်', color: '#dc2626' },
    { code: 'manager', name: 'မန်နေဂျာ', color: '#059669' },
    { code: 'staff', name: 'ဝန်ထမ်း', color: '#3b82f6' },
    { code: 'cashier', name: 'ငွေရှင်း', color: '#8b5cf6' }
  ];

  // Current logged in user (from localStorage)
  const currentUser = {
    id: 1,
    name: "ဦးကျော်မင်း",
    role: "owner",
    shop_id: 1
  };

  // Initial users data - simplified
  const initialUsers = [
    {
      id: 1,
      code: "OWNER01",
      name: "ဦးကျော်မင်း",
      phone: "09123456789",
      role: "owner",
      shop_id: 1,
      status: "active",
      created_date: "2024-01-01",
      last_login: "2024-02-03 10:30"
    },
    {
      id: 2,
      code: "MGR01",
      name: "မမီမီ",
      phone: "09234567890",
      role: "manager",
      shop_id: 1,
      status: "active",
      created_date: "2024-01-15",
      last_login: "2024-02-03 09:15"
    },
    {
      id: 3,
      code: "STAFF01",
      name: "ကိုကျော်လွင်",
      phone: "09345678901",
      role: "staff",
      shop_id: 1,
      status: "active",
      created_date: "2024-01-20",
      last_login: "2024-02-03 08:30"
    },
    {
      id: 4,
      code: "CASH01",
      name: "မအေးအေး",
      phone: "09456789012",
      role: "cashier",
      shop_id: 1,
      status: "inactive",
      created_date: "2024-01-25",
      last_login: "2024-02-01 14:20"
    }
  ];

  // State declarations - simplified
  const [users, setUsers] = useState(initialUsers);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Form state
  const [userForm, setUserForm] = useState({
    id: null,
    name: "",
    phone: "",
    role: "staff",
    pin_code: "",
    confirm_pin: ""
  });

  // Filter users
  useEffect(() => {
    filterUsers();
  }, [searchTerm, filterStatus]);

  const filterUsers = () => {
    let filtered = [...initialUsers];
    
    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter(user => user.status === filterStatus);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(term) ||
        user.phone.includes(term) ||
        user.code.toLowerCase().includes(term)
      );
    }
    
    setUsers(filtered);
  };

  // Get counts
  const getActiveCount = () => users.filter(u => u.status === "active").length;
  const getTotalCount = () => users.length;

  // Handle actions
  const handleAction = (action, userId) => {
    const user = initialUsers.find(u => u.id === userId);
    
    switch(action) {
      case 'edit':
        setSelectedUser(user);
        setUserForm({
          id: user.id,
          name: user.name,
          phone: user.phone,
          role: user.role,
          pin_code: "",
          confirm_pin: ""
        });
        setShowEditModal(true);
        break;
        
      case 'toggle_status':
        const updatedUsers = initialUsers.map(u => 
          u.id === userId 
            ? { 
                ...u, 
                status: u.status === "active" ? "inactive" : "active",
                last_login: new Date().toLocaleString('en-US', { 
                  year: 'numeric', 
                  month: '2-digit', 
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })
              } 
            : u
        );
        setUsers(updatedUsers);
        break;
        
      case 'delete':
        if (window.confirm(`${user.name} ကို ဖျက်မှာ သေချာလား?`)) {
          const newUsers = initialUsers.filter(u => u.id !== userId);
          setUsers(newUsers);
        }
        break;
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setUserForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Generate user code
  const generateUserCode = () => {
    const roles = {
      owner: "OWNER",
      manager: "MGR",
      staff: "STAFF",
      cashier: "CASH"
    };
    const prefix = roles[userForm.role] || "USER";
    const count = users.filter(u => u.role === userForm.role).length + 1;
    return `${prefix}${count.toString().padStart(2, '0')}`;
  };

  // Save user
  const handleSaveUser = () => {
    if (!userForm.name.trim() || !userForm.phone.trim()) {
      alert("အမည်နှင့် ဖုန်းနံပါတ် ထည့်ပေးပါ");
      return;
    }

    if (showAddModal) {
      // Add new user
      const newUser = {
        id: users.length + 1,
        code: generateUserCode(),
        name: userForm.name,
        phone: userForm.phone,
        role: userForm.role,
        shop_id: currentUser.shop_id,
        status: "active",
        created_date: new Date().toISOString().split('T')[0],
        last_login: null
      };
      
      setUsers([...users, newUser]);
      setShowAddModal(false);
      
    } else if (showEditModal && selectedUser) {
      // Update existing user
      const updatedUsers = users.map(user => 
        user.id === selectedUser.id 
          ? { 
              ...user, 
              name: userForm.name,
              phone: userForm.phone,
              role: userForm.role
            } 
          : user
      );
      
      setUsers(updatedUsers);
      setShowEditModal(false);
      setSelectedUser(null);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setUserForm({
      id: null,
      name: "",
      phone: "",
      role: "staff",
      pin_code: "",
      confirm_pin: ""
    });
  };

  // Get role name
  const getRoleName = (roleCode) => {
    const role = USER_ROLES.find(r => r.code === roleCode);
    return role ? role.name : roleCode;
  };

  // Get role color
  const getRoleColor = (roleCode) => {
    const role = USER_ROLES.find(r => r.code === roleCode);
    return role ? role.color : '#6b7280';
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "မရှိသေး";
    const date = new Date(dateString);
    return date.toLocaleDateString('my-MM');
  };

  return (
    <div className="simple-user-container">
      {/* Header */}
      <div className="simple-user-header">
        <div className="simple-user-header-left">
          <h2><i className="fas fa-users"></i> ဝန်ထမ်းစီမံခန့်ခွဲရေး</h2>
          <div className="simple-user-stats">
            <span className="simple-user-stat">
              <i className="fas fa-user-check"></i>
              <span className="simple-user-stat-value">{getActiveCount()}</span>
              <span className="simple-user-stat-label">လုပ်ကိုင်ဆဲ</span>
            </span>
            <span className="simple-user-stat">
              <i className="fas fa-users"></i>
              <span className="simple-user-stat-value">{getTotalCount()}</span>
              <span className="simple-user-stat-label">စုစုပေါင်း</span>
            </span>
          </div>
        </div>
        
        <button 
          className="simple-user-add-btn"
          onClick={() => {
            resetForm();
            setShowAddModal(true);
          }}
        >
          <i className="fas fa-user-plus"></i> အသစ်ထည့်မည်
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="simple-user-controls">
        <div className="simple-user-search">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="အမည်၊ ဖုန်းနံပါတ် ရှာရန်..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="simple-user-clear-search"
              onClick={() => setSearchTerm("")}
            >
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <div className="simple-user-filters">
          <button 
            className={`simple-user-filter-btn ${filterStatus === "all" ? "active" : ""}`}
            onClick={() => setFilterStatus("all")}
          >
            အားလုံး
          </button>
          <button 
            className={`simple-user-filter-btn ${filterStatus === "active" ? "active" : ""}`}
            onClick={() => setFilterStatus("active")}
          >
            <i className="fas fa-check-circle"></i> လုပ်ကိုင်ဆဲ
          </button>
          <button 
            className={`simple-user-filter-btn ${filterStatus === "inactive" ? "active" : ""}`}
            onClick={() => setFilterStatus("inactive")}
          >
            <i className="fas fa-times-circle"></i> ပိတ်ထား
          </button>
        </div>
      </div>

      {/* Users Grid */}
      <div className="simple-user-grid">
        {users.length > 0 ? (
          users.map(user => (
            <div key={user.id} className="simple-user-card">
              <div className="simple-user-card-header">
                <div className="simple-user-avatar">
                  {user.name.charAt(0)}
                </div>
                <div className="simple-user-info">
                  <h3 className="simple-user-name">{user.name}</h3>
                  <div className="simple-user-code">{user.code}</div>
                </div>
                <div className="simple-user-status">
                  <span className={`simple-user-status-badge ${user.status}`}>
                    {user.status === "active" ? "လုပ်ကိုင်ဆဲ" : "ပိတ်ထား"}
                  </span>
                </div>
              </div>
              
              <div className="simple-user-card-body">
                <div className="simple-user-detail">
                  <i className="fas fa-phone"></i>
                  <span>{user.phone}</span>
                </div>
                <div className="simple-user-detail">
                  <i className="fas fa-user-tag"></i>
                  <span 
                    className="simple-user-role" 
                    style={{ color: getRoleColor(user.role) }}
                  >
                    {getRoleName(user.role)}
                  </span>
                </div>
                <div className="simple-user-detail">
                  <i className="fas fa-calendar"></i>
                  <span>စတင်ရက်: {formatDate(user.created_date)}</span>
                </div>
                <div className="simple-user-detail">
                  <i className="fas fa-sign-in-alt"></i>
                  <span>နောက်ဆုံးဝင်: {user.last_login ? formatDate(user.last_login) : "မရှိသေး"}</span>
                </div>
              </div>
              
              <div className="simple-user-card-actions">
                <button 
                  className="simple-user-action-btn edit"
                  onClick={() => handleAction('edit', user.id)}
                  title="ပြင်ဆင်မည်"
                >
                  <i className="fas fa-edit"></i>
                </button>
                
                <button 
                  className={`simple-user-action-btn ${user.status === "active" ? "deactivate" : "activate"}`}
                  onClick={() => handleAction('toggle_status', user.id)}
                  title={user.status === "active" ? "ပိတ်မည်" : "ဖွင့်မည်"}
                >
                  <i className={`fas ${user.status === "active" ? "fa-user-times" : "fa-user-check"}`}></i>
                </button>
                
                {user.role !== "owner" && (
                  <button 
                    className="simple-user-action-btn delete"
                    onClick={() => handleAction('delete', user.id)}
                    title="ဖျက်မည်"
                  >
                    <i className="fas fa-trash"></i>
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="simple-user-empty">
            <i className="fas fa-users-slash"></i>
            <p>ဝန်ထမ်း မတွေ့ပါ</p>
            {searchTerm && (
              <button 
                className="simple-user-clear-btn"
                onClick={() => setSearchTerm("")}
              >
                ရှာဖွေမှု ရှင်းလင်းရန်
              </button>
            )}
          </div>
        )}
      </div>

      {/* Add/Edit User Modal */}
      {(showAddModal || showEditModal) && (
        <div className="simple-user-modal-overlay">
          <div className="simple-user-modal">
            <div className="simple-user-modal-header">
              <h3>
                <i className={`fas ${showAddModal ? "fa-user-plus" : "fa-edit"}`}></i>
                {showAddModal ? "အသစ်ထည့်မည်" : "ပြင်ဆင်မည်"}
              </h3>
              <button 
                className="simple-user-modal-close"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="simple-user-modal-body">
              <div className="simple-user-form-group">
                <label>
                  <i className="fas fa-user"></i> အမည် *
                </label>
                <input
                  type="text"
                  name="name"
                  value={userForm.name}
                  onChange={handleFormChange}
                  placeholder="ဦးကျော်မင်း"
                  required
                />
              </div>
              
              <div className="simple-user-form-group">
                <label>
                  <i className="fas fa-phone"></i> ဖုန်းနံပါတ် *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={userForm.phone}
                  onChange={handleFormChange}
                  placeholder="09123456789"
                  required
                />
              </div>
              
              <div className="simple-user-form-group">
                <label>
                  <i className="fas fa-user-tag"></i> အဆင့်
                </label>
                <select
                  name="role"
                  value={userForm.role}
                  onChange={handleFormChange}
                  disabled={selectedUser?.role === "owner"}
                >
                  {USER_ROLES.map(role => (
                    <option key={role.code} value={role.code}>
                      {role.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="simple-user-form-group">
                <label>
                  <i className="fas fa-lock"></i> PIN ကုဒ် (ဝင်ရန်)
                </label>
                <input
                  type="password"
                  name="pin_code"
                  value={userForm.pin_code}
                  onChange={handleFormChange}
                  placeholder="4 လုံး ဂဏန်း"
                  maxLength="4"
                  inputMode="numeric"
                />
                <small>ဝန်ထမ်းများ ဝင်ရန် 4 လုံး ဂဏန်း</small>
              </div>
              
              {userForm.pin_code && (
                <div className="simple-user-form-group">
                  <label>
                    <i className="fas fa-lock"></i> PIN ကုဒ် အတည်ပြုရန်
                  </label>
                  <input
                    type="password"
                    name="confirm_pin"
                    value={userForm.confirm_pin}
                    onChange={handleFormChange}
                    placeholder="ထပ်ရိုက်ပါ"
                    maxLength="4"
                    inputMode="numeric"
                  />
                  {userForm.pin_code !== userForm.confirm_pin && userForm.confirm_pin && (
                    <div className="simple-user-error">
                      <i className="fas fa-exclamation-circle"></i> PIN ကုဒ် မတူပါ
                    </div>
                  )}
                </div>
              )}
              
              {showEditModal && selectedUser && (
                <div className="simple-user-info-box">
                  <h4><i className="fas fa-info-circle"></i> အချက်အလက်</h4>
                  <div className="simple-user-info-row">
                    <span>ကုဒ်:</span>
                    <strong>{selectedUser.code}</strong>
                  </div>
                  <div className="simple-user-info-row">
                    <span>အဆင့်:</span>
                    <strong style={{ color: getRoleColor(selectedUser.role) }}>
                      {getRoleName(selectedUser.role)}
                    </strong>
                  </div>
                  <div className="simple-user-info-row">
                    <span>အခြေအနေ:</span>
                    <span className={`simple-user-status-tag ${selectedUser.status}`}>
                      {selectedUser.status === "active" ? "လုပ်ကိုင်ဆဲ" : "ပိတ်ထား"}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="simple-user-modal-footer">
              <button 
                className="simple-user-btn-cancel"
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                  setSelectedUser(null);
                  resetForm();
                }}
              >
                ပယ်ဖျက်မည်
              </button>
              <button 
                className="simple-user-btn-save"
                onClick={handleSaveUser}
                disabled={!userForm.name.trim() || !userForm.phone.trim() || 
                         (userForm.pin_code && userForm.pin_code !== userForm.confirm_pin)}
              >
                <i className="fas fa-save"></i>
                {showAddModal ? "သိမ်းမည်" : "ပြင်မည်"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Back Button */}
      <div className="simple-user-back">
        <NavLink to="/ownerDashboard" className="simple-user-back-btn">
          <i className="fas fa-arrow-left"></i> နောက်သို့
        </NavLink>
      </div>
    </div>
  );
};

export default UserManagementPage;