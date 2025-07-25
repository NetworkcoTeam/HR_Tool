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
  Modal
} from 'antd';
import {
  CheckCircleOutlined,
  FilePdfOutlined,
  EyeOutlined,
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

  const [employeeId, setEmployeeId] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.employee_id) {
          setEmployeeId(parsed.employee_id);
        }
      } catch (err) {
        console.error("Failed to parse localStorage user:", err);
      }
    }
  }, []);
  



  useEffect(() => {
    const fetchData = async () => {
      if (!employeeId) return;
      try {
        setLoading(true);
    
        // Fetch payslips from backend API
        const payslipsResponse = await fetch(`${API_BASE}/api/Payslips/employee/${employeeId}/payslips`);
    
        if (!payslipsResponse.ok) {
          throw new Error(`HTTP error! status: ${payslipsResponse.status}`);
        }
    
        const payslipsJson = await payslipsResponse.json();
        
        console.log("Raw payslips response:", payslipsJson); // Debugging
        
        if (payslipsJson.success) {
          const parseDate = (dateStr) => {
            if (!dateStr) return new Date();
            
            if (dateStr instanceof Date) {
              return dateStr;
            }
            
            if (typeof dateStr === 'string') {
              // Try parsing as ISO string
              const isoDate = new Date(dateStr);
              if (!isNaN(isoDate.getTime())) {
                return isoDate;
              }
              
              // Try parsing as date part only (YYYY-MM-DD)
              const dateParts = dateStr.split('T')[0].split('-');
              if (dateParts.length === 3) {
                return new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
              }
            }
            
            return new Date();
          };
  
          const processedPayslips = payslipsJson.payslips.map(payslip => {
            const periodEndDate = parseDate(payslip.periodEnd);
            const periodStartDate = parseDate(payslip.periodStart);
  
            return {
              ...payslip,
              MonthName: periodEndDate.toLocaleString('default', { month: 'long' }),
              MonthNumber: periodEndDate.getMonth() + 1,
              Year: periodEndDate.getFullYear(),
              FormattedPeriodEnd: periodEndDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              FormattedPeriodStart: periodStartDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
              }),
              RawPeriodEnd: periodEndDate,
              RawPeriodStart: periodStartDate
            };
          });
    
          // Sort by date descending
          const sortedPayslips = processedPayslips.sort((a, b) => 
            b.RawPeriodEnd - a.RawPeriodEnd
          );
    
          setPayslipData(sortedPayslips);
        } else {
          message.error(payslipsJson.error || 'Failed to fetch payslips');
          setPayslipData([]);
        }
    
        // Mock data for other sections
        setTodoData([]);
        setLeaveData([]);
        setAppointments([]);
    
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load dashboard data');
        message.error('Failed to load dashboard data: ' + err.message);
        setPayslipData([]);
        setTodoData([]);
        setLeaveData([]);
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [employeeId]);

  const handleAddTodo = () => {
    message.info('Add todo functionality would be implemented here');
  };

  const handleViewPayslip = async (year, month) => {
    try {
      message.loading('Fetching payslip details...', 0);
      const response = await fetch(`${API_BASE}/api/Payslips/view/${employeeId}/${year}/${month}`);
  
      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch payslip');
      }
  
      const result = await response.json();

      message.destroy();

      if (result.success && result.payslip) {
        setCurrentPayslipDetails({
          employeeName: result.payslip.employeeName,
          position: result.payslip.position,
          period: result.payslip.period || 'N/A',
          basicSalary: result.payslip.basicSalary,
          taxAmount: result.payslip.taxAmount,
          uif: result.payslip.uif,
          netSalary: result.payslip.netSalary,
          generatedDate: result.payslip.generatedDate
        });
        setIsModalVisible(true);
      } else {
        message.error(result.error || 'No payslip data available');
      }
    } catch (err) {
      message.destroy();
      console.error('Payslip view error:', err);
      message.error(err.message || 'Failed to fetch payslip details');
    }
  };

  const handleDownloadPayslip = async (year, month) => {
    try {
      const loadingMessage = message.loading('Downloading payslip...', 0);
      const response = await fetch(`${API_BASE}/api/Payslips/download/${employeeId}/${year}/${month}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }
  
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      
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

                <Card title="PAYSLIPS" className="dashboard-card">
                  {payslipData.length > 0 ? (
                    <List
                      dataSource={payslipData}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button
                              icon={<EyeOutlined />}
                              type="link"
                              onClick={() => handleViewPayslip(item.Year, item.MonthNumber)} 
                            >
                              View
                            </Button>,
                            <Button
                              type="primary"
                              icon={<FilePdfOutlined />}
                              onClick={() => handleDownloadPayslip(item.Year, item.MonthNumber)}
                            >
                              Download
                            </Button>
                          ]}
                        >
                          <List.Item.Meta
                            title={`${item.MonthName} ${item.Year}`}
                            description={`Pay Date: ${item.FormattedPeriodEnd}`}
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
                <p><strong>Basic Salary:</strong> R{(currentPayslipDetails.basicSalary || 0).toFixed(2)}</p>
                <p><strong>Tax Amount:</strong> R{(currentPayslipDetails.taxAmount || 0).toFixed(2)}</p>
                <p><strong>UIF:</strong> R{(currentPayslipDetails.uif || 0).toFixed(2)}</p>
                <p><strong>Net Salary:</strong> R{(currentPayslipDetails.netSalary || 0).toFixed(2)}</p>
                <p><strong>Generated Date:</strong> {currentPayslipDetails.generatedDate || 'N/A'}</p>
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