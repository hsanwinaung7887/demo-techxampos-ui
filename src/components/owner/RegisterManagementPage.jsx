import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import "../../light-style/owner-css/registerManagement.css";

// Sample shop data
const initialShops = [
    {
        id: 1,
        name: "Mini Mart",
        owner: "John Doe",
        package: "Premium",
        billing: "Monthly",
        amount: "200,000 Ks",
        status: "Active",
        registeredDate: "2024-01-15",
        expiryDate: "2024-02-15",
        email: "john@minimart.com",
        phone: "09123456789",
        address: "Yangon, Kamayut",
        users: 5,
        products: 450,
        storage: "2GB",
        branches: 2
    },
    {
        id: 2,
        name: "Tech Gadgets",
        owner: "Alice Smith",
        package: "Standard",
        billing: "Yearly",
        amount: "2,000,000 Ks",
        status: "Pending Payment",
        registeredDate: "2024-01-20",
        expiryDate: "2025-01-20",
        email: "alice@techgadgets.com",
        phone: "09234567890",
        address: "Mandalay, Chanmyathazi",
        users: 3,
        products: 300,
        storage: "1GB",
        branches: 1
    },
    {
        id: 3,
        name: "Coffee Hub",
        owner: "Bob Johnson",
        package: "Basic",
        billing: "Monthly",
        amount: "150,000 Ks",
        status: "Suspended",
        registeredDate: "2023-12-10",
        expiryDate: "2024-01-10",
        email: "bob@coffeehub.com",
        phone: "09345678901",
        address: "Naypyidaw, Zabuthiri",
        users: 2,
        products: 200,
        storage: "500MB",
        branches: 1
    },
    {
        id: 4,
        name: "Fashion Store",
        owner: "Emma Wilson",
        package: "Premium",
        billing: "Yearly",
        amount: "2,400,000 Ks",
        status: "Active",
        registeredDate: "2023-11-05",
        expiryDate: "2024-11-05",
        email: "emma@fashionstore.com",
        phone: "09456789012",
        address: "Yangon, Bahan",
        users: 8,
        products: 600,
        storage: "3GB",
        branches: 3
    }
];

const RegisterManagementPage = () => {
    const [shops, setShops] = useState(initialShops);
    const [selectedShop, setSelectedShop] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [paymentMode, setPaymentMode] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState("");
    const [newPackage, setNewPackage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    // Filter shops based on search
    const filteredShops = shops.filter(shop =>
        shop.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shop.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Handle shop selection
    const handleSelectShop = (shop) => {
        setSelectedShop(shop);
        setEditMode(false);
        setPaymentMode(false);
        setPaymentAmount("");
        setNewPackage("");
    };

    // Handle payment confirmation
    const handleConfirmPayment = () => {
        if (!selectedShop || !paymentAmount) return;
        
        const updatedShops = shops.map(shop => {
            if (shop.id === selectedShop.id) {
                return {
                    ...shop,
                    status: "Active",
                    amount: paymentAmount
                };
            }
            return shop;
        });
        
        setShops(updatedShops);
        setSelectedShop({
            ...selectedShop,
            status: "Active",
            amount: paymentAmount
        });
        setPaymentMode(false);
        alert(`Payment of ${paymentAmount} confirmed for ${selectedShop.name}`);
    };

    // Handle package update
    const handleUpdatePackage = () => {
        if (!selectedShop || !newPackage) return;
        
        const updatedShops = shops.map(shop => {
            if (shop.id === selectedShop.id) {
                return {
                    ...shop,
                    package: newPackage
                };
            }
            return shop;
        });
        
        setShops(updatedShops);
        setSelectedShop({
            ...selectedShop,
            package: newPackage
        });
        setEditMode(false);
        alert(`Package updated to ${newPackage} for ${selectedShop.name}`);
    };

    // Handle shop status change
    const handleStatusChange = (status) => {
        if (!selectedShop) return;
        
        const updatedShops = shops.map(shop => {
            if (shop.id === selectedShop.id) {
                return {
                    ...shop,
                    status: status
                };
            }
            return shop;
        });
        
        setShops(updatedShops);
        setSelectedShop({
            ...selectedShop,
            status: status
        });
        alert(`Status changed to ${status} for ${selectedShop.name}`);
    };

    return (
        <div className="shop-management-main">
            {/* Header */}
            <div className="shop-management-header">
                <h1><i className="fas fa-store-alt"></i> Register MANAGEMENT</h1>
                <p>Manage all registered shops and their subscriptions</p>
            </div>

            <div className="shop-management-container">
                {/* Left Panel - Shop List */}
                <div className="shop-list-panel">
                    <div className="panel-header">
                        <h2>Registered Shops ({filteredShops.length})</h2>
                        <div className="search-box">
                            <i className="fas fa-search"></i>
                            <input
                                type="text"
                                placeholder="Search shops..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="shop-list">
                        {filteredShops.map(shop => (
                            <div
                                key={shop.id}
                                className={`shop-list-item ${selectedShop?.id === shop.id ? 'active' : ''}`}
                                onClick={() => handleSelectShop(shop)}
                            >
                                <div className="shop-list-header">
                                    <h3>{shop.name}</h3>
                                    <span className={`status-badge status-${shop.status.toLowerCase().replace(' ', '-')}`}>
                                        {shop.status}
                                    </span>
                                </div>
                                <div className="shop-list-details">
                                    <p><i className="fas fa-user"></i> {shop.owner}</p>
                                    <p><i className="fas fa-box"></i> {shop.package} Package</p>
                                    <p><i className="fas fa-calendar-alt"></i> Expires: {shop.expiryDate}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Panel - Shop Details */}
                <div className="shop-details-panel">
                    {selectedShop ? (
                        <div className="details-container">
                            <div className="details-header">
                                <h2>{selectedShop.name} Details</h2>
                                <div className="action-buttons">
                                    <button
                                        className="btn-edit"
                                        onClick={() => setEditMode(!editMode)}
                                    >
                                        <i className="fas fa-edit"></i> {editMode ? 'Cancel Edit' : 'Edit'}
                                    </button>
                                    <button
                                        className="btn-payment"
                                        onClick={() => setPaymentMode(!paymentMode)}
                                    >
                                        <i className="fas fa-credit-card"></i> {paymentMode ? 'Cancel Payment' : 'Receive Payment'}
                                    </button>
                                </div>
                            </div>

                            {/* Payment Section */}
                            {paymentMode && (
                                <div className="payment-section">
                                    <h3><i className="fas fa-money-bill-wave"></i> Receive Payment</h3>
                                    <div className="payment-form">
                                        <div className="form-group">
                                            <label>Amount (Ks)</label>
                                            <input
                                                type="text"
                                                value={paymentAmount}
                                                onChange={(e) => setPaymentAmount(e.target.value)}
                                                placeholder="Enter amount"
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Payment Method</label>
                                            <select>
                                                <option>Bank Transfer</option>
                                                <option>Cash</option>
                                                <option>Mobile Banking</option>
                                                <option>Credit Card</option>
                                            </select>
                                        </div>
                                        <button
                                            className="btn-confirm"
                                            onClick={handleConfirmPayment}
                                        >
                                            <i className="fas fa-check-circle"></i> Confirm Payment
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Shop Details */}
                            <div className="shop-info-grid">
                                <div className="info-card">
                                    <div className="info-icon">
                                        <i className="fas fa-box"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Package</h4>
                                        {editMode ? (
                                            <select
                                                value={newPackage || selectedShop.package}
                                                onChange={(e) => setNewPackage(e.target.value)}
                                            >
                                                <option value="Basic">Basic</option>
                                                <option value="Standard">Standard</option>
                                                <option value="Premium">Premium</option>
                                            </select>
                                        ) : (
                                            <p className="info-value">{selectedShop.package}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <i className="fas fa-money-bill"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Billing Cycle</h4>
                                        <p className="info-value">{selectedShop.billing}</p>
                                        <p className="info-sub">Amount: {selectedShop.amount}</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <i className="fas fa-calendar-alt"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Dates</h4>
                                        <p className="info-sub">Registered: {selectedShop.registeredDate}</p>
                                        <p className="info-sub">Expires: {selectedShop.expiryDate}</p>
                                    </div>
                                </div>

                                <div className="info-card">
                                    <div className="info-icon">
                                        <i className="fas fa-chart-bar"></i>
                                    </div>
                                    <div className="info-content">
                                        <h4>Usage</h4>
                                        <p className="info-sub">Users: {selectedShop.users}</p>
                                        <p className="info-sub">Products: {selectedShop.products}</p>
                                        <p className="info-sub">Storage: {selectedShop.storage}</p>
                                        <p className="info-sub">Branches: {selectedShop.branches}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="contact-section">
                                <h3><i className="fas fa-address-card"></i> Contact Information</h3>
                                <div className="contact-grid">
                                    <div className="contact-item">
                                        <i className="fas fa-envelope"></i>
                                        <span>{selectedShop.email}</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-phone"></i>
                                        <span>{selectedShop.phone}</span>
                                    </div>
                                    <div className="contact-item">
                                        <i className="fas fa-map-marker-alt"></i>
                                        <span>{selectedShop.address}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Status Management */}
                            <div className="status-section">
                                <h3><i className="fas fa-cogs"></i> Shop Status Management</h3>
                                <div className="status-buttons">
                                    <button
                                        className={`btn-status ${selectedShop.status === 'Active' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('Active')}
                                    >
                                        <i className="fas fa-check-circle"></i> Active
                                    </button>
                                    <button
                                        className={`btn-status ${selectedShop.status === 'Suspended' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('Suspended')}
                                    >
                                        <i className="fas fa-ban"></i> Suspend
                                    </button>
                                    <button
                                        className={`btn-status ${selectedShop.status === 'Pending Payment' ? 'active' : ''}`}
                                        onClick={() => handleStatusChange('Pending Payment')}
                                    >
                                        <i className="fas fa-clock"></i> Pending
                                    </button>
                                    <button
                                        className="btn-status btn-delete"
                                        onClick={() => {
                                            if (window.confirm(`Delete ${selectedShop.name}?`)) {
                                                setShops(shops.filter(s => s.id !== selectedShop.id));
                                                setSelectedShop(null);
                                            }
                                        }}
                                    >
                                        <i className="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>

                            {/* Save Button for Edit Mode */}
                            {editMode && newPackage && (
                                <div className="save-section">
                                    <button
                                        className="btn-save"
                                        onClick={handleUpdatePackage}
                                    >
                                        <i className="fas fa-save"></i> Save Changes
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="no-selection">
                            <i className="fas fa-store"></i>
                            <h3>Select a Shop</h3>
                            <p>Click on a shop from the list to view and manage its details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Back to Dashboard */}
            <div className="back-section">
                <NavLink to="/office/dashboard" className="btn-back">
                    <i className="fas fa-arrow-left"></i> Back to Dashboard
                </NavLink>
            </div>
        </div>
    );
};

export default RegisterManagementPage;