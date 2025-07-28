import React, { useState } from 'react';
import { Layout } from 'antd';
import Sidebar from '../Components/Sidebar';
import AdminSidebar from '../Components/AdminSidebar';
import Appointment from '../Components/Appointment';
import './AppointmentBooking.css';

const { Header, Content, Sider } = Layout;

const AppointmentBooking = () => {
  // In a real app, you would get this from authentication context or localStorage
  const [userRole, setUserRole] = useState('admin'); // Change to 'user' to test regular sidebar
  
  return (
    <Layout className="appointment-booking-layout">
      <Sider width={250} className="sidebar">
        {userRole === 'admin' ? <AdminSidebar /> : <Sidebar />}
      </Sider>
      <Layout className="site-layout">
        <Content className="site-layout-content">
          <div className="content-container">
            <Appointment />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppointmentBooking;