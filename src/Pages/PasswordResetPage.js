import React from 'react';
import { Layout } from 'antd';
import Navbar from '../Components/Navbar'; 
import ResetPassword from '../Components/ResetPassword'; 
import './PasswordResetPage.css';

const { Content } = Layout;

const PasswordResetPage = () => {
  return (
    <Layout className="forgot-password-page">
      <Navbar />
      <Content className="page-content">
        <ResetPassword /> 
      </Content>
    </Layout>
  );
};

export default PasswordResetPage;