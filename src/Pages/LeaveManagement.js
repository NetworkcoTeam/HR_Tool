import React from 'react';

import './LeaveManagement.css';
import AdminSidebar from '../Components/AdminSidebar.js'; 
import LeaveRequestAdmin from '../Components/LeaveRequestAdmin.js';


const LeaveManagement = () => {
  return (
    <div className="admin-container">
          <AdminSidebar />
          <div className="dashboard-main">

            <LeaveRequestAdmin />

          </div>
        </div>
  );
};

export default LeaveManagement;