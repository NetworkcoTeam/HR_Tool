import React from 'react';
import Dashboard from '../Components/Dashboard';
import Sidebar from '../Components/Sidebar';
import './Admin.css';

function Admin() {
  return (
    <div className="admin-container">
      <Sidebar />
      <div className="dashboard-main">
        <Dashboard />
      </div>
    </div>
  );
}

export default Admin;