import React from 'react';
import { Layout } from 'antd';
import AdminSidebar from '../Components/AdminSidebar';
import ContractEditor from '../Components/ContractEditor';
import './PayslipManagement.css'; // Reusing the same styles

const { Content } = Layout;

const ContractEditorPage = () => {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout className="site-layout">
        <Content className="payslip-page-content">
          <h1>Contract Management</h1>
          <ContractEditor />
        </Content>
      </Layout>
    </Layout>
  );
};

export default ContractEditorPage;