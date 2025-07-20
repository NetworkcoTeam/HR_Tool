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
  Empty,
  Modal // Import Modal for viewing payslip details
} from 'antd';
import {
  CheckCircleOutlined,
  FilePdfOutlined,
  EyeOutlined, // Import EyeOutlined for view button
  ClockCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import './Home.css';


const API_BASE = 'http://localhost:5143';

const { Content } = Layout;

const Home = () => {
  const [loading, setLoading] = useState(true);
  const [todoData, setTodoData] = useState([]);
  const [payslipData, setPayslipData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); 
  const [currentPayslipDetails, setCurrentPayslipDetails] = useState(null); 

  
  const employeeId = 2223655; 

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
    
        // Fetch from localStorage
        const storedTodo = localStorage.getItem('employee_todos');
        const storedLeaves = localStorage.getItem('employee_leaves');
        const storedAppointments = localStorage.getItem('employee_appointments');
    
        // Fetch payslips from backend API
        const payslipsResponse = await fetch(`${API_BASE}/api/Payslips/employee/${employeeId}/payslips`);
    
        if (!payslipsResponse.ok) {
          throw new Error(`HTTP error! status: ${payslipsResponse.status}`);
        }
    
        const payslipsJson = await payslipsResponse.json();
        
        if (payslipsJson.success) {
          // Process and transform payslip data with proper date handling
          const processedPayslips = payslipsJson.payslips.map(payslip => {
            // Safely parse the date
            let periodEndDate;
            try {
              periodEndDate = new Date(payslip.PeriodEnd);
              if (isNaN(periodEndDate.getTime())) {
                throw new Error('Invalid date');
              }
            } catch (e) {
              console.warn(`Invalid PeriodEnd date for payslip: ${payslip.PeriodEnd}`);
              periodEndDate = new Date(); 
            }
    
            return {
              ...payslip,
              MonthName: periodEndDate.toLocaleString('default', { month: 'long' }),
              MonthNumber: periodEndDate.getMonth() + 1,
              Year: periodEndDate.getFullYear(),
              
              period_end: `${periodEndDate.getFullYear()}-${String(periodEndDate.getMonth() + 1).padStart(2, '0')}-${String(periodEndDate.getDate()).padStart(2, '0')}`
            };
          });
    
          // Sort payslips by year and month in descending order
          const sortedPayslips = processedPayslips.sort((a, b) => {
            if (b.Year !== a.Year) return b.Year - a.Year;
            return b.MonthNumber - a.MonthNumber;
          });
    
          setPayslipData(sortedPayslips);
        } else {
          message.error(payslipsJson.error || 'Failed to fetch payslips');
          setPayslipData([]);
        }
    
        // Parse other data
        setTodoData(storedTodo ? JSON.parse(storedTodo) : []);
        setLeaveData(storedLeaves ? JSON.parse(storedLeaves) : []);
        setAppointments(storedAppointments ? JSON.parse(storedAppointments) : []);
    
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load dashboard data');
        message.error('Failed to load dashboard data: ' + err.message);
        
        // Set empty arrays on error
        setPayslipData([]);
        setTodoData([]);
        setLeaveData([]);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]); // Add employeeId to dependency array

  const handleAddTodo = () => {
    
    
    message.info('Add todo functionality would be implemented here');
  };

  const handleDownloadPayslip = async (year, month) => {
    try {
      const loadingMessage = message.loading('Downloading payslip...', 0);
      
      const response = await fetch(`${API_BASE}/api/Payslips/download/${employeeId}/${year}/${month}`);
      
      if (!response.ok) {
        // Clone the response before reading it
        const errorResponse = response.clone();
        let errorText;
        try {
          errorText = await errorResponse.text();
        } catch (e) {
          errorText = await errorResponse.json().then(json => json.error || JSON.stringify(json));
        }
        throw new Error(errorText || `HTTP error ${response.status}`);
      }
  
      // Handle successful PDF download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        loadingMessage();
        message.success('Payslip downloaded successfully!');
      }, 100);
      
    } catch (err) {
      message.destroy();
      message.error(`Download failed: ${err.message}`);
      console.error('Payslip download error:', err);
    }
  };

  const handleViewPayslip = async (year, month) => {
    try {
      message.loading('Fetching payslip details...', 0);
      const response = await fetch(`${API_BASE}/api/Payslips/view/${employeeId}/${year}/${month}`);
  
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error ${response.status}: ${errorText}`);
      }
  
      const result = await response.json();
      console.log('Payslip API response:', result); // Add this for debugging
      
      message.destroy();
      if (result.success) {
        setCurrentPayslipDetails(result.payslip);
        setIsModalVisible(true);
      } else {
        message.error(result.error || 'Failed to fetch payslip details.');
      }
    } catch (err) {
      message.destroy();
      console.error('Full error:', err); // More detailed error logging
      message.error('Failed to view payslip: ' + err.message);
    }
  };

  const handleApplyLeave = () => {
    
    message.info('Navigate to leave application form');
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentPayslipDetails(null);
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
                              type="primary"
                              icon={<FilePdfOutlined />}
                              onClick={() => handleDownloadPayslip(item.Year, item.MonthNumber)}
                              disabled={!item.Year || !item.MonthNumber}
                              
                              
                              
                              
                            >
                              Download
                            </Button>,
                            <Button
                              type="link"
                              icon={<EyeOutlined />}
                              onClick={() => handleViewPayslip(item.Year, item.MonthNumber)}
                            >
                              View
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={`${item.MonthName} ${item.Year}`}
                            description={`Period: ${new Date(item.PeriodEnd).toLocaleDateString()}`}
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

          {/* Payslip Details Modal */}
          <Modal
  title="Payslip Details"
  visible={isModalVisible}
  onCancel={handleModalCancel}
  footer={[
    <Button key="back" onClick={handleModalCancel}>
      Close
    </Button>
  ]}
>
  {currentPayslipDetails ? (
    <div>
      <p><strong>Employee Name:</strong> {currentPayslipDetails.employeeName || 'N/A'}</p>
      <p><strong>Position:</strong> {currentPayslipDetails.position || 'N/A'}</p>
      <p><strong>Period:</strong> {currentPayslipDetails.period || 'N/A'}</p>
      <p><strong>Basic Salary:</strong> R{(currentPayslipDetails.testSalary || 0).toFixed(2)}</p>
      <p><strong>Tax Amount:</strong> R{(currentPayslipDetails.taxAmount || 0).toFixed(2)}</p>
      <p><strong>UIF:</strong> R{(currentPayslipDetails.uif || 0).toFixed(2)}</p>
      <p><strong>Net Salary:</strong> R{(currentPayslipDetails.netSalary || 0).toFixed(2)}</p>
      <p><strong>Generated Date:</strong> {currentPayslipDetails.generatedRate || 'N/A'}</p>
    </div>
  ) : (
    <Empty description="No payslip details available" />
  )}
</Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;
