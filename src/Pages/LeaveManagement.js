import React from 'react';
import Sidebar from '../Components/Sidebar'; 
import Dashboard from '../Components/Dashboard';
import LeaveApplications from '../Components/LeaveApplications.js';

const LeaveManagementPage = () => {
  return (
    <div className="admin-container">
          <Sidebar />
          <div className="dashboard-main">
            <Dashboard />
          </div>
        </div>
  );
};

export default LeaveManagementPage;