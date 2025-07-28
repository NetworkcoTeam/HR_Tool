import React, { useState, useEffect } from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  List, 
  Tag, 
  Divider, 
  Avatar,
  Spin,
  message,
  Empty
} from 'antd';
import { 
  CheckCircleOutlined, 
  FilePdfOutlined, 
  ClockCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import './Home.css';

const { Content } = Layout;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [todoData, setTodoData] = useState([]);
  const [payslipData, setPayslipData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch from localStorage (replace with actual API calls if needed)
        const storedTodo = localStorage.getItem('employee_todos');
        const storedPayslips = localStorage.getItem('employee_payslips');
        const storedLeaves = localStorage.getItem('employee_leaves');
        const storedAppointments = localStorage.getItem('employee_appointments');

        // Parse data with fallback to empty array
        setTodoData(storedTodo ? JSON.parse(storedTodo) : []);
        setPayslipData(storedPayslips ? JSON.parse(storedPayslips) : []);
        setLeaveData(storedLeaves ? JSON.parse(storedLeaves) : []);
        setAppointments(storedAppointments ? JSON.parse(storedAppointments) : []);

      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load dashboard data');
        message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleAddTodo = () => {
    // Implement your todo addition logic here
    // This would typically open a modal or navigate to a todo form
    message.info('Add todo functionality would be implemented here');
  };

  const handleDownloadPayslip = (payslipId) => {
    try {
      // Implement payslip download logic
      message.success(`Downloading payslip ${payslipId}`);
    } catch (err) {
      message.error('Failed to download payslip');
      console.error('Payslip download error:', err);
    }
  };

  const handleApplyLeave = () => {
    // Implement leave application navigation
    message.info('Navigate to leave application form');
  };
  
  


  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Layout className="site-layout">
          <Content className="error-content">
            <div className="error-state">
              <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
              <h2>Unable to load dashboard</h2>
              <p>{error}</p>
              <Button type="primary" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
    
  
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout className="site-layout">
        <Content className="home-content">
          <div className="dashboard-header">
            <h1>Employee Dashboard</h1>
            <div className="current-date">
              <CalendarOutlined /> {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </div>
          </div>

          <Divider />

          {loading ? (
            <div className="loading-state">
              <Spin size="large" />
              <p>Loading dashboard...</p>
            </div>
          ) : (
            <div className="dashboard-grid">
              {/* First Row */}
              <div className="dashboard-row">
                <Card 
                  title="TO DO LIST" 
                  className="dashboard-card"
                  extra={
                    <Button 
                      type="primary" 
                      icon={<PlusOutlined />} 
                      size="small"
                      onClick={handleAddTodo}
                    >
                      Add Task
                    </Button>
                  }
                >
                  {todoData.length > 0 ? (
                    <List
                      dataSource={todoData}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Button 
                                shape="circle" 
                                icon={item.completed ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined />}
                                type="text"
                              />
                            }
                            title={<span className={item.completed ? 'completed-task' : ''}>{item.task}</span>}
                            description={item.time}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No tasks found" />
                  )}
                </Card>

                <Card 
                  title="PAYSLIPS" 
                  className="dashboard-card"
                >
                  {payslipData.length > 0 ? (
                    <List
                      dataSource={payslipData}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button 
                              type="link" 
                              icon={<FilePdfOutlined />}
                              onClick={() => handleDownloadPayslip(item.id)}
                              disabled={item.downloaded}
                            >
                              {item.downloaded ? 'Downloaded' : 'Download'}
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={item.month}
                            description={item.year || ''}
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No payslips available" />
                  )}
                </Card>
              </div>

              {/* Second Row */}
              <div className="dashboard-row">
                <Card 
                  title="LEAVE STATUS" 
                  className="dashboard-card"
                >
                  {leaveData.length > 0 ? (
                    <>
                      <List
                        dataSource={leaveData}
                        renderItem={(item) => (
                          <List.Item>
                            <List.Item.Meta
                              avatar={
                                <Tag color={item.status === 'approved' ? 'success' : 
                                    item.status === 'pending' ? 'processing' : 'error'}>
                                  {item.status.toUpperCase()}
                                </Tag>
                              }
                              title={item.type}
                              description={`${item.days} days (${item.startDate} - ${item.endDate})`}
                            />
                          </List.Item>
                        )}
                      />
                      <Button 
                        type="dashed" 
                        block 
                        icon={<PlusOutlined />}
                        onClick={handleApplyLeave}
                      >
                        Apply for Leave
                      </Button>
                    </>
                  ) : (
                    <Empty description="No leave records">
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleApplyLeave}>
                        Apply for Leave
                      </Button>
                     
                      
                    </Empty>
                  )}
                </Card>

                <Card 
                  title={
                    <div className="appointments-header">
                      <span>APPOINTMENTS</span>
                      <Tag color="blue">Today</Tag>
                    </div>
                  } 
                  className="dashboard-card"
                >
                  {appointments.length > 0 ? (
                    <List
                      dataSource={appointments}
                      renderItem={(item) => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={
                              <Avatar 
                                icon={<UserOutlined />} 
                                style={{ backgroundColor: item.type === 'internal' ? '#1890ff' : '#722ed1' }}
                              />
                            }
                            title={item.title}
                            description={
                              <>
                                <div>{item.time}</div>
                                <div>With: {item.with}</div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No appointments scheduled" />
                  )}
                </Card>
              </div>
            </div>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;