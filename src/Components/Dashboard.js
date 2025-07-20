import React from 'react';
import LeaveRequestsAdmin from './LeaveRequestAdmin';
import PayslipGenerator from './PayslipGenerator';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      <div className="dashboard-header">
        <h2 className="header-title">HR Management Dashboard</h2>
      </div>
      
      <div className="dashboard-sections">
        <div className="section leave-requests">
          
          <div className="section-content">
            <LeaveRequestsAdmin />
          </div>
        </div>
        
        <PayslipGenerator />
      </div>
    </div>
  );
};

export default Dashboard;