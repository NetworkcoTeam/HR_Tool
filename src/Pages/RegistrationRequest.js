import React from 'react';

import './LeaveManagement.css';
import AdminSidebar from '../Components/AdminSidebar.js'; 
import RegistrationRequestAdmin from '../Components/RegistrationRequestAdmin.js';


const RegistrationRequest = () => {
  return (
    <div className="admin-container">
          <AdminSidebar />
          <div className="dashboard-main">

            <RegistrationRequestAdmin />

          </div>
        </div>
  );
};

export default RegistrationRequest;