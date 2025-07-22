import React from 'react';
import Sidebar from '../Components/Sidebar'; 
import ViewLeaveApplications from '../Components/ViewLeaveApplications.js';
import './ViewLeave.css'

const ViewLeavePage = () => {
  return (
    <div className="ViewLeave-container">
          <Sidebar />
          <div className="viewLeave-main">
            <ViewLeaveApplications />
          </div>
        </div>
  );
};

export default ViewLeavePage;