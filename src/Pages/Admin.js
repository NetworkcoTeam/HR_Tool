import React from 'react';
import Dashboard from '../Components/Dashboard';
import AdminSidebar from '../Components/AdminSidebar';
import './Admin.css';

function Admin() {
  return (
    <>
      <AdminSidebar />
      
        <Dashboard />
      </>
   
  );
}

export default Admin;