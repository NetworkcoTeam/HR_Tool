import React from 'react';
import './LeaveApplications.css';

const LeaveApplications = () => {
  return (
    <div className="frame">
      <div className="rectangle-large"></div>
      <div className="dashboard-header">
        <div className="header-title">LEAVE MANAGEMENT</div>
      </div>
      
      <div className="content-container">
        <div className="white-card">
          <div className="headers">
            <div className="start-date-header">Start Date</div>
            <div className="leave-type-header">Leave Type</div>
            <div className="status-header">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaveApplications;