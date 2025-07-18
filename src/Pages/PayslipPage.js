import React from 'react';
import { Layout } from 'antd';
import Sidebar from '../Components/Sidebar'; 
import PayslipGenerator from '../Components/PayslipGenerator';
import './PayslipPage.css'; 

const { Content } = Layout;

const PayslipPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout className="site-layout">
        <Content className="payslip-page-content">
          <PayslipGenerator />
        </Content>
      </Layout>
    </Layout>
  );
};

export default PayslipPage;