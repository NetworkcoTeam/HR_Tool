import React from 'react';
import { Layout } from 'antd';
import Dashboard from '../Components/Dashboard';
import AdminSidebar from '../Components/AdminSidebar';
import './Admin.css';

function Admin() {
  return (
    <div className="admin-container">
      <AdminSidebar />
      <Layout className="site-layout">
        <Dashboard />
      </Layout>
    </div>
  );
}

export default Admin;