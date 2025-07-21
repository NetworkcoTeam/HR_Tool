import React from 'react';
import Sidebar from '../Components/Sidebar'; 
import ViewLeaveApplications from '../Components/ViewLeaveApplications.js';

const ViewLeavePage = () => {
  return (
    <div className="admin-container">
          <Sidebar />
          <div className="dashboard-main">
            <ViewLeaveApplications />
          </div>
        </div>
  );
};

export default ViewLeavePage;