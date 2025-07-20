import React from 'react';
import Dashboard from '../Components/Dashboard';
import AdminSidebar from '../Components/AdminSidebar';
import './Admin.css';

function Admin() {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="dashboard-main">
        <Dashboard />
      </div>
    </div>
  );
}

export default Admin;