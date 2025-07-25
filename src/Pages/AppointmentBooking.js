import React, { useEffect, useState } from 'react';
import { Layout } from 'antd';
import Sidebar from '../Components/Sidebar';
import AdminSidebar from '../Components/AdminSidebar';
import Appointment from '../Components/Appointment';
import './AppointmentBooking.css';

const { Content, Sider } = Layout;

const AppointmentBooking = () => {
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('role');
    console.log("Raw stored role from localStorage:", stored);
  
    try {
      if (stored.startsWith('{')) {
        
        const parsed = JSON.parse(stored);
        setUserRole(parsed.role);
        console.log("Parsed role from JSON:", parsed.role);
      } else {
        
        setUserRole(stored);
        console.log("Set role directly:", stored);
      }
    } catch (err) {
      console.error("Error parsing role from localStorage", err);
    }
  }, []);
  
  if (!userRole) return null; 

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
