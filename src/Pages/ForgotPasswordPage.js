import React from 'react';
import { Layout } from 'antd';
import Navbar from '../Components/Navbar'; 
import ForgotPassword from '../Components/ForgotPassword'; 
import './ForgotPasswordPage.css';

const { Content } = Layout;

const ForgotPasswordPage = () => {
  return (
    <Layout className="forgot-password-page">
      <Navbar />
      <Content className="page-content">
        <ForgotPassword /> {/* Remove the extra padding div */}
      </Content>
    </Layout>
  );
};

export default ForgotPasswordPage;