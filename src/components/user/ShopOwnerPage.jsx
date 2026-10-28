// 📁 src/components/owner/owner-components/ShopOwnerPage.jsx
import React, { useState } from 'react';
import "../../light-style/owner-css/shopOwnerPage.css";
// Mock JSON data
const branches = [
  { id: 1, code: 'BR001', name: 'Downtown Flagship', address: '123 Main St' },
  { id: 2, code: 'BR002', name: 'Uptown Boutique', address: '456 Park Ave' },
  { id: 3, code: 'BR003', name: 'Airport Express', address: 'Terminal 3' },
  { id: 4, code: 'BR004', name: 'Mall of Fame', address: '789 Shopping Blvd' },
  { id: 5, code: 'BR005', name: 'Harbor View', address: '321 Bayfront' },
];

const ShopOwnerPage = () => {
  const [selectedBranch, setSelectedBranch] = useState(null);

  const handleBranchClick = (branch) => {
    setSelectedBranch(branch);
    // In real app, navigate to staff management or show details
    alert(`Selected branch: ${branch.code} – ${branch.name}\nAddress: ${branch.address}`);
  };

  return (
    <div className="shop-owner-page">
      {/* Header */}
      <header className="owner-header">
        <div className="header-logo">
          <span className="logo-icon">🛒</span>
          <h1>Shop<span>Owner</span></h1>
        </div>
        <div className="header-user">
          <span className="user-greeting">Welcome back,</span>
          <span className="user-name">Alex Morgan</span>
          <div className="user-avatar">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" alt="User" />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="owner-main">
        <div className="cards-container">
          {/* Left card – Staff Management */}
          <div className="card staff-card">
            <div className="card-header">
              <div className="header-icon">
                <i className="fas fa-users-cog"></i>
              </div>
              <div className="header-title">
                <h2>Staff Management</h2>
                <p>Manage employees by branch</p>
              </div>
            </div>
            <div className="branch-selector">
              <h3>Select branch</h3>
              <div className="branch-list">
                {branches.map((branch) => (
                  <div
                    key={branch.id}
                    className={`branch-item ${selectedBranch?.id === branch.id ? 'active' : ''}`}
                    onClick={() => handleBranchClick(branch)}
                  >
                    <span className="branch-code">{branch.code}</span>
                    <span className="branch-name">{branch.name}</span>
                    <i className="fas fa-chevron-right branch-arrow"></i>
                  </div>
                ))}
              </div>
            </div>
            {selectedBranch && (
              <div className="selected-branch-info">
                <i className="fas fa-store-alt"></i>
                <div>
                  <strong>{selectedBranch.name}</strong>
                  <small>{selectedBranch.address}</small>
                </div>
              </div>
            )}
          </div>

          {/* Right card – Business Dashboard */}
          <div className="card dashboard-card">
            <div className="card-header">
              <div className="header-icon">
                <i className="fas fa-chart-pie"></i>
              </div>
              <div className="header-title">
                <h2>Business Dashboard</h2>
                <p>Real‑time performance metrics</p>
              </div>
            </div>
            <div className="dashboard-stats">
              <div className="stat-item">
                <span className="stat-label">Today's Sales</span>
                <span className="stat-value">$12,345</span>
                <span className="stat-change positive">+8.2%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Orders</span>
                <span className="stat-value">147</span>
                <span className="stat-change">–</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Avg. Order Value</span>
                <span className="stat-value">$84</span>
                <span className="stat-change positive">+3%</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Customers</span>
                <span className="stat-value">2,305</span>
                <span className="stat-change positive">+12%</span>
              </div>
            </div>
            <div className="dashboard-cta">
              <button className="dashboard-btn">
                Go to Full Dashboard
                <i className="fas fa-arrow-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ShopOwnerPage;