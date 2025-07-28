import React from 'react';
import { Layout } from 'antd';
import Sidebar from '../Components/Sidebar';
import Appointment from '../Components/Appointment';
import './AppointmentBooking.css';

const { Header, Content, Sider } = Layout;

const AppointmentBooking = () => {
  return (
    <Layout className="appointment-booking-layout">
      <Sider width={250} className="sidebar">
        <Sidebar />
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