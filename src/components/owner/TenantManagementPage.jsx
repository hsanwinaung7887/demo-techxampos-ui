import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import "../../light-style/owner-css/tenantManagement.css";

const TenantManagementPage = () => {
    const [tenants, setTenants] = useState([]);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [showHistory, setShowHistory] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        company: "",
        address: "",
        status: "Active",
        plan: "Basic",
        maxShops: 1,
        maxUsers: 5
    });

    // Initial data
    const initialTenants = [
        {
            id: 1,
            name: "John Doe",
            email: "john@example.com",
            phone: "09123456789",
            company: "John Enterprises",
            address: "Yangon, Myanmar",
            status: "Active",
            plan: "Premium",
            maxShops: 10,
            maxUsers: 50,
            createdDate: "2024-01-15",
            lastLogin: "2024-02-10 14:30",
            subscriptionExpiry: "2024-12-31",
            shopsCount: 8,
            usersCount: 32,
            totalRevenue: "12,500,000 Ks"
        },
        {
            id: 2,
            name: "Alice Smith",
            email: "alice@techcorp.com",
            phone: "09234567890",
            company: "TechCorp Myanmar",
            address: "Mandalay, Myanmar",
            status: "Suspended",
            plan: "Standard",
            maxShops: 5,
            maxUsers: 20,
            createdDate: "2024-01-20",
            lastLogin: "2024-02-08 10:15",
            subscriptionExpiry: "2024-06-30",
            shopsCount: 3,
            usersCount: 12,
            totalRevenue: "8,200,000 Ks"
        }
    ];

    // Sample activity logs
    const [activityLogs, setActivityLogs] = useState([
        {
            id: 1,
            tenantId: 1,
            action: "Tenant Created",
            details: "New tenant account created",
            timestamp: "2024-01-15 09:30:00",
            user: "Super Admin"
        },
        {
            id: 2,
            tenantId: 1,
            action: "Plan Upgraded",
            details: "Plan upgraded from Standard to Premium",
            timestamp: "2024-01-20 14:45:00",
            user: "System"
        },
        {
            id: 3,
            tenantId: 2,
            action: "Tenant Suspended",
            details: "Account suspended due to payment issues",
            timestamp: "2024-02-01 11:20:00",
            user: "Super Admin"
        }
    ]);

    useEffect(() => {
        // In real app, fetch from API
        setTenants(initialTenants);
    }, []);

    const filteredTenants = tenants.filter(tenant =>
        tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tenant.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectTenant = (tenant) => {
        setSelectedTenant(tenant);
        setEditMode(false);
        setShowHistory(false);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleCreateTenant = () => {
        if (!formData.name || !formData.email) {
            alert("Please fill required fields");
            return;
        }

        const newTenant = {
            id: tenants.length + 1,
            ...formData,
            createdDate: new Date().toISOString().split('T')[0],
            lastLogin: "Never",
            shopsCount: 0,
            usersCount: 0,
            totalRevenue: "0 Ks"
        };

        // Add activity log
        const newLog = {
            id: activityLogs.length + 1,
            tenantId: newTenant.id,
            action: "Tenant Created",
            details: `New tenant "${formData.name}" created`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: "Super Admin"
        };

        setTenants([...tenants, newTenant]);
        setActivityLogs([newLog, ...activityLogs]);
        setShowModal(false);
        setFormData({
            name: "",
            email: "",
            phone: "",
            company: "",
            address: "",
            status: "Active",
            plan: "Basic",
            maxShops: 1,
            maxUsers: 5
        });
        
        alert(`Tenant ${formData.name} created successfully!`);
    };

    const handleUpdateTenant = () => {
        if (!selectedTenant) return;

        const updatedTenants = tenants.map(tenant => 
            tenant.id === selectedTenant.id ? { ...tenant, ...formData } : tenant
        );

        // Add activity log
        const updateLog = {
            id: activityLogs.length + 1,
            tenantId: selectedTenant.id,
            action: "Tenant Updated",
            details: `Tenant details updated`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: "Super Admin"
        };

        setTenants(updatedTenants);
        setSelectedTenant({ ...selectedTenant, ...formData });
        setActivityLogs([updateLog, ...activityLogs]);
        setEditMode(false);
        alert("Tenant updated successfully!");
    };

    const handleDeleteTenant = (id) => {
        if (window.confirm("Are you sure you want to delete this tenant?")) {
            const tenantName = tenants.find(t => t.id === id)?.name;
            
            // Add activity log
            const deleteLog = {
                id: activityLogs.length + 1,
                tenantId: id,
                action: "Tenant Deleted",
                details: `Tenant "${tenantName}" deleted`,
                timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
                user: "Super Admin"
            };

            const updatedTenants = tenants.filter(tenant => tenant.id !== id);
            setTenants(updatedTenants);
            setActivityLogs([deleteLog, ...activityLogs]);
            
            if (selectedTenant?.id === id) {
                setSelectedTenant(null);
            }
            alert("Tenant deleted successfully!");
        }
    };

    const handleStatusChange = (status) => {
        if (!selectedTenant) return;

        const updatedTenants = tenants.map(tenant => 
            tenant.id === selectedTenant.id ? { ...tenant, status } : tenant
        );

        // Add activity log
        const statusLog = {
            id: activityLogs.length + 1,
            tenantId: selectedTenant.id,
            action: `Status Changed to ${status}`,
            details: `Tenant status updated`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            user: "Super Admin"
        };

        setTenants(updatedTenants);
        setSelectedTenant({ ...selectedTenant, status });
        setActivityLogs([statusLog, ...activityLogs]);
        alert(`Status changed to ${status}`);
    };

    const getTenantLogs = (tenantId) => {
        return activityLogs.filter(log => log.tenantId === tenantId);
    };

    return (
        <div className="tenant-management-main">
            {/* Header */}
            <div className="tenant-management-header">
                <h1><i className="fas fa-users"></i> TENANT MANAGEMENT</h1>
                <p>Manage all tenant accounts and subscriptions</p>
            </div>

            <div className="tenant-management-container">
                {/* Left Panel - Tenant List */}
                <div className="tenant-list-panel">
                    <div className="panel-header">
                        <h2>All Tenants ({filteredTenants.length})</h2>
                        <div className="header-actions">
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    placeholder="Search tenants..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <button 
                                className="btn-create"
                                onClick={() => setShowModal(true)}
                            >
                                <i className="fas fa-plus"></i> New Tenant
                            </button>
                        </div>
                    </div>

                    <div className="tenant-list">
                        {filteredTenants.map(tenant => (
                            <div
                                key={tenant.id}
                                className={`tenant-list-item ${selectedTenant?.id === tenant.id ? 'active' : ''}`}
                                onClick={() => handleSelectTenant(tenant)}
                            >
                                <div className="tenant-list-header">
                                    <div className="tenant-avatar">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <div className="tenant-info">
                                        <h3>{tenant.name}</h3>
                                        <p className="tenant-company">{tenant.company}</p>
                                    </div>
                                    <span className={`status-badge status-${tenant.status.toLowerCase()}`}>
                                        {tenant.status}
                                    </span>
                                </div>
                                <div className="tenant-list-details">
                                    <p><i className="fas fa-envelope"></i> {tenant.email}</p>
                                    <p><i className="fas fa-mobile-alt"></i> {tenant.phone}</p>
                                    <p><i className="fas fa-store"></i> {tenant.shopsCount}/{tenant.maxShops} Shops</p>
                                </div>
                                <div className="tenant-list-footer">
                                    <span className="plan-badge">{tenant.plan}</span>
                                    <span className="date-info">Joined: {tenant.createdDate}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Tenant Details */}
                <div className="tenant-details-panel">
                    {selectedTenant ? (
                        <div className="details-container">
                            <div className="details-header">
                                <h2>{selectedTenant.name}</h2>
                                <div className="action-buttons">
                                    <button
                                        className="btn-edit"
                                        onClick={() => {
                                            setEditMode(!editMode);
                                            setFormData({
                                                name: selectedTenant.name,
                                                email: selectedTenant.email,
                                                phone: selectedTenant.phone,
                                                company: selectedTenant.company,
                                                address: selectedTenant.address,
                                                status: selectedTenant.status,
                                                plan: selectedTenant.plan,
                                                maxShops: selectedTenant.maxShops,
                                                maxUsers: selectedTenant.maxUsers
                                            });
                                        }}
                                    >
                                        <i className="fas fa-edit"></i> {editMode ? 'Cancel' : 'Edit'}
                                    </button>
                                    <button
                                        className="btn-history"
                                        onClick={() => setShowHistory(!showHistory)}
                                    >
                                        <i className="fas fa-history"></i> {showHistory ? 'Hide History' : 'View History'}
                                    </button>
                                </div>
                            </div>

                            {/* Activity History */}
                            {showHistory && (
                                <div className="history-section">
                                    <h3><i className="fas fa-history"></i> Activity Logs</h3>
                                    <div className="history-list">
                                        {getTenantLogs(selectedTenant.id).map(log => (
                                            <div key={log.id} className="history-item">
                                                <div className="history-icon">
                                                    <i className="fas fa-info-circle"></i>
                                                </div>
                                                <div className="history-content">
                                                    <div className="history-header">
                                                        <strong>{log.action}</strong>
                                                        <span className="history-time">{log.timestamp}</span>
                                                    </div>
                                                    <p>{log.details}</p>
                                                    <small>By: {log.user}</small>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Edit Form or Display Info */}
                            {editMode ? (
                                <div className="edit-form">
                                    <h3><i className="fas fa-user-edit"></i> Edit Tenant Information</h3>
                                    <div className="form-grid">
                                        <div className="form-group">
                                            <label>Full Name *</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Email *</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Phone</label>
                                            <input
                                                type="text"
                                                name="phone"
                                                value={formData.phone}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Company</label>
                                            <input
                                                type="text"
                                                name="company"
                                                value={formData.company}
                                                onChange={handleInputChange}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Plan</label>
                                            <select
                                                name="plan"
                                                value={formData.plan}
                                                onChange={handleInputChange}
                                            >
                                                <option value="Basic">Basic</option>
                                                <option value="Standard">Standard</option>
                                                <option value="Premium">Premium</option>
                                                <option value="Enterprise">Enterprise</option>
                                            </select>
                                        </div>
                                        <div className="form-group">
                                            <label>Max Shops</label>
                                            <input
                                                type="number"
                                                name="maxShops"
                                                value={formData.maxShops}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="100"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Max Users</label>
                                            <input
                                                type="number"
                                                name="maxUsers"
                                                value={formData.maxUsers}
                                                onChange={handleInputChange}
                                                min="1"
                                                max="500"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Address</label>
                                            <textarea
                                                name="address"
                                                value={formData.address}
                                                onChange={handleInputChange}
                                                rows="3"
                                            />
                                        </div>
                                    </div>
                                    <div className="form-actions">
                                        <button
                                            className="btn-save"
                                            onClick={handleUpdateTenant}
                                        >
                                            <i className="fas fa-save"></i> Save Changes
                                        </button>
                                        <button
                                            className="btn-cancel"
                                            onClick={() => setEditMode(false)}
                                        >
                                            <i className="fas fa-times"></i> Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {/* Tenant Info Cards */}
                                    <div className="tenant-info-grid">
                                        <div className="info-card">
                                            <div className="info-icon">
                                                <i className="fas fa-id-card"></i>
                                            </div>
                                            <div className="info-content">
                                                <h4>Personal Info</h4>
                                                <p><strong>Name:</strong> {selectedTenant.name}</p>
                                                <p><strong>Email:</strong> {selectedTenant.email}</p>
                                                <p><strong>Phone:</strong> {selectedTenant.phone}</p>
                                                <p><strong>Company:</strong> {selectedTenant.company}</p>
                                            </div>
                                        </div>

                                        <div className="info-card">
                                            <div className="info-icon">
                                                <i className="fas fa-chart-line"></i>
                                            </div>
                                            <div className="info-content">
                                                <h4>Subscription</h4>
                                                <p><strong>Plan:</strong> <span className="plan-tag">{selectedTenant.plan}</span></p>
                                                <p><strong>Status:</strong> {selectedTenant.status}</p>
                                                <p><strong>Expires:</strong> {selectedTenant.subscriptionExpiry}</p>
                                                <p><strong>Last Login:</strong> {selectedTenant.lastLogin}</p>
                                            </div>
                                        </div>

                                        <div className="info-card">
                                            <div className="info-icon">
                                                <i className="fas fa-chart-pie"></i>
                                            </div>
                                            <div className="info-content">
                                                <h4>Usage Statistics</h4>
                                                <p><strong>Shops:</strong> {selectedTenant.shopsCount}/{selectedTenant.maxShops}</p>
                                                <p><strong>Users:</strong> {selectedTenant.usersCount}/{selectedTenant.maxUsers}</p>
                                                <p><strong>Total Revenue:</strong> {selectedTenant.totalRevenue}</p>
                                                <p><strong>Created:</strong> {selectedTenant.createdDate}</p>
                                            </div>
                                        </div>

                                        <div className="info-card">
                                            <div className="info-icon">
                                                <i className="fas fa-map-marker-alt"></i>
                                            </div>
                                            <div className="info-content">
                                                <h4>Address</h4>
                                                <p>{selectedTenant.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="quick-actions">
                                        <h3><i className="fas fa-bolt"></i> Quick Actions</h3>
                                        <div className="action-buttons-grid">
                                            <button
                                                className={`action-btn ${selectedTenant.status === 'Active' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange('Active')}
                                            >
                                                <i className="fas fa-check-circle"></i> Activate
                                            </button>
                                            <button
                                                className={`action-btn ${selectedTenant.status === 'Suspended' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange('Suspended')}
                                            >
                                                <i className="fas fa-ban"></i> Suspend
                                            </button>
                                            <button
                                                className={`action-btn ${selectedTenant.status === 'Inactive' ? 'active' : ''}`}
                                                onClick={() => handleStatusChange('Inactive')}
                                            >
                                                <i className="fas fa-power-off"></i> Deactivate
                                            </button>
                                            <button
                                                className="action-btn btn-danger"
                                                onClick={() => handleDeleteTenant(selectedTenant.id)}
                                            >
                                                <i className="fas fa-trash"></i> Delete
                                            </button>
                                        </div>
                                    </div>

                                    {/* Associated Shops (can be expanded) */}
                                    <div className="associated-section">
                                        <h3><i className="fas fa-store"></i> Associated Shops ({selectedTenant.shopsCount})</h3>
                                        <p>View and manage shops for this tenant</p>
                                        <button className="btn-view-shops">
                                            <i className="fas fa-external-link-alt"></i> View All Shops
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="no-selection">
                            <i className="fas fa-users"></i>
                            <h3>Select a Tenant</h3>
                            <p>Click on a tenant from the list to view and manage details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Tenant Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2><i className="fas fa-user-plus"></i> Create New Tenant</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>
                                <i className="fas fa-times"></i>
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Full Name *</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        placeholder="Enter email address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Company</label>
                                    <input
                                        type="text"
                                        name="company"
                                        value={formData.company}
                                        onChange={handleInputChange}
                                        placeholder="Enter company name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Plan</label>
                                    <select
                                        name="plan"
                                        value={formData.plan}
                                        onChange={handleInputChange}
                                    >
                                        <option value="Basic">Basic</option>
                                        <option value="Standard">Standard</option>
                                        <option value="Premium">Premium</option>
                                        <option value="Enterprise">Enterprise</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Max Shops</label>
                                    <input
                                        type="number"
                                        name="maxShops"
                                        value={formData.maxShops}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="100"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Max Users</label>
                                    <input
                                        type="number"
                                        name="maxUsers"
                                        value={formData.maxUsers}
                                        onChange={handleInputChange}
                                        min="1"
                                        max="500"
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <textarea
                                        name="address"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                        rows="3"
                                        placeholder="Enter address"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setShowModal(false)}>
                                Cancel
                            </button>
                            <button className="btn-create-confirm" onClick={handleCreateTenant}>
                                <i className="fas fa-user-plus"></i> Create Tenant
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Back to Dashboard */}
            <div className="back-section">
                <NavLink to="/office/dashboard" className="btn-back">
                    <i className="fas fa-arrow-left"></i> Back to Dashboard
                </NavLink>
            </div>
        </div>
    );
};

export default TenantManagementPage;