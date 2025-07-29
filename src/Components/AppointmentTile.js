import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import moment from 'moment';
import { Card, Button, List, Typography, Spin, message } from 'antd'; 
import { CalendarOutlined } from '@ant-design/icons'; 

const { Text } = Typography;

const API_BASE_URL = 'http://localhost:5143/api/appointment';

const AppointmentsTile = () => {
  const [upcomingAppointments, setUpcomingAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUserData(JSON.parse(storedUser));
      } catch (err) {
        console.error("Failed to parse user data from localStorage:", err);
      }
    }
  }, []);

  // Fetch appointments for the logged-in employee
  const fetchEmployeeAppointments = useCallback(async () => {
    if (!userData || !userData.employee_id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      // Fetch appointments specifically for the logged-in employee 
      const response = await axios.get(`${API_BASE_URL}/employee/${userData.employee_id}`);
      
      const today = moment().startOf('day');
      const filteredAppointments = response.data
        .filter(app => moment(app.appointmentDate).isSameOrAfter(today, 'day') && app.status !== 'Cancelled' && app.status !== 'Rejected') // Filter for upcoming and not cancelled/rejected 
        .sort((a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate)) // Sort by date
        .slice(0, 3); // Display top 3 upcoming appointments for the tile

      setUpcomingAppointments(filteredAppointments);
    } catch (error) {
      console.error('Error fetching employee appointments for dashboard tile:', error);
      message.error('Failed to load appointments for tile.');
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData) {
      fetchEmployeeAppointments();
    }
  }, [userData, fetchEmployeeAppointments]);

  const handleViewAll = () => {

    window.location.href = '/AppointmentBooking'; 
  };

  return (
    <Card
      title={
        <>
          <CalendarOutlined style={{ marginRight: 8 }} />
          APPOINTMENTS
        </>
      }
      extra={<Button type="link" onClick={handleViewAll}>View All</Button>}
      style={{ minHeight: 250 }} // Adjust height as needed 
    >
      <Spin spinning={loading}>
        {upcomingAppointments.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={upcomingAppointments}
            renderItem={app => (
              <List.Item>
                <List.Item.Meta
                  title={
                    <Text strong>
                      {app.subject}
                    </Text>
                  }
                  description={
                    <>
                      <Text type="secondary">{moment(app.appointmentDate).format('ddd, MMM D YYYY')} at {app.startTime}</Text>
                      <br />
                      <Text ellipsis={true}>{app.description}</Text>
                    </>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <p style={{ marginTop: 10 }}>No upcoming appointments scheduled.</p>
          </div>
        )}
      </Spin>
    </Card>
  );
};

export default AppointmentsTile;