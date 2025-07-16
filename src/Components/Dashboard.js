import React from 'react';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  return (
    <div className="dashboard-content">
      {/* Top Navigation */}
      <div className="dashboard-header">
        <div className="header-title">ADMIN DASHBOARD</div>
      </div>

      {/* Main Content Sections */}
      <div className="dashboard-sections">
        {/* Employee Records */}
        <div className="section employee-records">
          <h3>Employee Records</h3>
          <div className="section-content">
            <Link to="/" className="records-content">Interns</Link>
            <Link to="/" className="records-content">Management</Link>
            <Link to="/" className="records-content">HR</Link>
            <div className="view-all-container">
              <Link to="/" className="view-all-button">View All</Link>
            </div>
          </div>
        </div>

        {/* Payslip */}
        <div className="section payslip">
          <h3>Payslip</h3>
          <div className="section-content">
            <div className="payslip-actions">
              <Link to="/" className="generate-button">Generate Payslip</Link>
            </div>
          </div>
        </div>

        {/* Leave Applications */}
        <div className="section appointments">
          <h3>LEAVE APPLICATIONS</h3>
          <div className="section-content">
            <div className="appointment-items-container">
              {/* <Link to="/" className="appointment-item">
                <span>11 August 2025</span>
                <span className="status-badge">Pending</span>
              </Link>
              <Link to="/" className="appointment-item">
                <span>10 June 2025</span>
                <span className="status-badge">Pending</span>
              </Link>
              <Link to="/" className="appointment-item">
                <span>15 March 2025</span>
                <span className="status-badge">Pending</span>
              </Link> */}
            </div>
            <div className="view-all-container">
              <Link to="/" className="view-all-button">View All</Link>
            </div>
          </div>
        </div>

        {/* Terms of Employment */}
        <div className="section terms">
          <h3>APPOINTMENTS</h3>
          <div className="section-content">
            {/* <Link to="/terms" className="terms-info">
              <span>12:00 - 12:30</span>
              <span className="terms-date">10 JULY 2025</span>
            </Link> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;