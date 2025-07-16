import React from 'react';
import Sidebar from '../Components/Sidebar'; 
import LeaveApplications from '../Components/LeaveApplications.js';

const LeaveManagementPage = () => {
  return (
    <div className="admin-container">
          <Sidebar />
          <div className="dashboard-main">
            <LeaveApplications />
          </div>
        </div>
  );
};

export default LeaveManagementPage;