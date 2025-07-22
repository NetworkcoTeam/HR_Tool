import React from 'react';
import { Layout } from 'antd';
import AdminSidebar from '../Components/AdminSidebar'; 
import PayslipGenerator from '../Components/PayslipGenerator';
import './PayslipManagement.css'; 

const { Content } = Layout;

const PayslipPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout className="site-layout">
        <Content className="payslip-page-content">
          <PayslipGenerator />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PayslipPage;