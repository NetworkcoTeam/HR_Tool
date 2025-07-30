import React, { useEffect, useState } from 'react';
import { Layout, Spin } from 'antd';
import Sidebar from '../Components/Sidebar';
import AdminSidebar from '../Components/AdminSidebar';
import Appointment from '../Components/Appointment';
import './AppointmentBooking.css';

const { Content, Sider } = Layout;

const AppointmentBooking = () => {
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserRole = () => {
      try {
        // First try to get from userDetails if available
        const userDetails = localStorage.getItem('user');
        if (userDetails) {
          const parsedUser = JSON.parse(userDetails);
          if (parsedUser?.role) {
            setUserRole(parsedUser.role);
            setLoading(false);
            return;
          }
        }

        // Fallback to direct role check
        const storedRole = localStorage.getItem('role');
        if (!storedRole) {
          setLoading(false);
          return;
        }

        // Handle both JSON and direct string cases
        if (storedRole.startsWith('{')) {
          const parsed = JSON.parse(storedRole);
          setUserRole(parsed.role);
        } else {
          setUserRole(storedRole);
        }
      } catch (err) {
        console.error("Error parsing user role:", err);
      } finally {
        setLoading(false);
      }
    };

    getUserRole();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Spin size="large" />
      </div>
    );
  }

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