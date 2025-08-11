import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Modal,
  Row,
  Col,
  Space,
  Typography
} from 'antd';
import {
  CheckCircleOutlined,
  FilePdfOutlined,
  EyeOutlined,
  CalendarOutlined,
  PlusOutlined,
  UserOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

import Sidebar from '../Components/Sidebar';
import AppointmentsTile from '../Components/AppointmentTile';
import Todo from '../Components/Todo';

import './Home.css';

const API_BASE = `${process.env.REACT_APP_API_BASE_URL}`;
const { Content } = Layout;
const { Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const leaveCache = useRef(null);
  const todoRef = useRef();
  const [loading, setLoading] = useState(true);
  const [payslipData, setPayslipData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPayslipDetails, setCurrentPayslipDetails] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);

  const handleAddTaskClick = () => {
    todoRef.current?.openModal();
  };

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

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const fetchPayslips = async (empId) => {
    try {
      const res = await fetch(`${API_BASE}/Payslips/employee/${empId}/payslips`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { success, payslips, error } = await res.json();
      if (!success) return message.error(error || 'Failed to load payslips');

      const processed = payslips.map(p => {
        const end = parseDate(p.periodEnd);
        const start = parseDate(p.periodStart);
        return {
          ...p,
          MonthName: end.toLocaleString('default', { month: 'long' }),
          MonthNumber: end.getMonth() + 1,
          Year: end.getFullYear(),
          FormattedPeriodEnd: end.toLocaleDateString('en-US'),
          RawPeriodEnd: end,
          RawPeriodStart: start
        };
      }).sort((a, b) => b.RawPeriodEnd - a.RawPeriodEnd)
        .slice(0, 3); // Only show top 3 latest payslips for dashboard

      setPayslipData(processed);
    } catch (err) {
      console.error(err);
      setError('Failed to load payslips');
      message.error('Failed to load payslips: ' + err.message);
    }
  };

  const fetchLeaveRequests = async (empId) => {
    if (leaveCache.current) {
      // Apply the same filtering logic to cached data
      const filtered = leaveCache.current
        .sort((a, b) => new Date(b.startDate) - new Date(a.startDate)) // Sort by most recent first
        .slice(0, 3); // Take only top 3
      setLeaveData(filtered);
      return;
    }
    
    try {
      const res = await fetch(`${API_BASE}/LeaveRequest/employee/${empId}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const formatted = data.map(r => ({
        id: r.id,
        type: r.typeOfLeave || 'Leave',
        status: r.status?.toLowerCase() || 'pending',
        days: r.totalDays || Math.ceil((new Date(r.leaveEnd) - new Date(r.leaveStart)) / 86400000) + 1,
        startDate: new Date(r.leaveStart).toLocaleDateString(),
        endDate: new Date(r.leaveEnd).toLocaleDateString(),
        rawStartDate: new Date(r.leaveStart), // Keep raw date for sorting
        rawEndDate: new Date(r.leaveEnd)
      }))
      .sort((a, b) => b.rawStartDate - a.rawStartDate) // Sort by most recent start date first
      .slice(0, 3); // Take only top 3 most recent
      
      leaveCache.current = data.map(r => ({ // Cache the full data
        id: r.id,
        type: r.typeOfLeave || 'Leave',
        status: r.status?.toLowerCase() || 'pending',
        days: r.totalDays || Math.ceil((new Date(r.leaveEnd) - new Date(r.leaveStart)) / 86400000) + 1,
        startDate: new Date(r.leaveStart).toLocaleDateString(),
        endDate: new Date(r.leaveEnd).toLocaleDateString(),
        rawStartDate: new Date(r.leaveStart),
        rawEndDate: new Date(r.leaveEnd)
      }));
      
      setLeaveData(formatted);
    } catch (err) {
      console.error(err);
      setError(err.message);
      message.error("Failed to load leave requests");
    }
  };

  const handleViewPayslip = async (year, month) => {
    try {
      message.loading('Fetching payslip details...', 0);
      const res = await fetch(`${API_BASE}/Payslips/view/${employeeId}/${year}/${month}`);
      const result = await res.json();
      message.destroy();
      if (result.success && result.payslip) {
        setCurrentPayslipDetails(result.payslip);
        setIsModalVisible(true);
      } else {
        message.error(result.error || 'No payslip data available');
      }
    } catch (err) {
      message.destroy();
      message.error(err.message);
    }
  };

  const handleDownloadPayslip = async (year, month) => {
    try {
      const res = await fetch(`${API_BASE}/Payslips/download/${employeeId}/${year}/${month}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Payslip downloaded!');
    } catch (err) {
      message.error('Download failed: ' + err.message);
    }
  };

  const handleApplyLeave = () => navigate("/leaveForm");
  const handleModalCancel = () => setIsModalVisible(false);
  const handleViewAllPayslips = () => navigate("/PayslipPage");

  const loadData = async () => {
    if (!employeeId) return;
    setLoading(true);
    setError(null); // Clear error when retrying
    try {
      await Promise.all([fetchPayslips(employeeId), fetchLeaveRequests(employeeId)]);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [employeeId]);

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Content className="error-content">
          <div className="error-state">
            <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            <h2>Unable to load dashboard</h2>
            <p>{error}</p>
            <Button onClick={loadData}>Retry</Button>
          </div>
        </Content>
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
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
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
                <Card title="TODO" className="dashboard-card"
                   extra={
                    <Button
                      type="primary"
                      icon={<PlusOutlined />}
                      size="small"
                      onClick={handleAddTaskClick}
                    >
                      Add Task
                    </Button>
                  }>
                 <Todo ref={todoRef} employeeId={employeeId} />
                </Card>
                
                <Card 
                  title="PAYSLIPS" 
                  className="dashboard-card"
                  extra={<Button type="link" onClick={handleViewAllPayslips}>View All</Button>}
                  style={{ minHeight: 250 }}
                >
                  {payslipData.length > 0 ? (
                    <List
                      dataSource={payslipData}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Button icon={<EyeOutlined />} type="link" onClick={() => handleViewPayslip(item.Year, item.MonthNumber)}>View</Button>,
                            <Button icon={<FilePdfOutlined />} onClick={() => handleDownloadPayslip(item.Year, item.MonthNumber)}>Download</Button>
                          ]}
                        >
                          <List.Item.Meta title={`${item.MonthName} ${item.Year}`} description={`Pay Date: ${item.FormattedPeriodEnd}`} />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <p style={{ marginTop: 10 }}>No payslips available</p>
                    </div>
                  )}
                </Card>
              </div>

              {/* Second Row */}
              <div className="dashboard-row">
              <Card 
                title="LEAVE STATUS" 
                className="dashboard-card"
                extra={<Button type="link" onClick={() => navigate('/leaveForm')}>View All</Button>} 
              >
                {leaveData.length > 0 ? (
                  <>
                    <List
                      dataSource={leaveData}
                      renderItem={item => (
                        <List.Item>
                          <List.Item.Meta
                            avatar={<Tag color={item.status === 'approved' ? 'green' : item.status === 'pending' ? 'blue' : 'red'}>{item.status.toUpperCase()}</Tag>}
                            title={item.type}
                            description={`${item.days} days (${item.startDate} - ${item.endDate})`}
                          />
                        </List.Item>
                      )}
                    />
                    <Button type="dashed" icon={<PlusOutlined />} style={{ width: '100%', maxWidth: 300 }} onClick={handleApplyLeave}>
                      Apply for Leave
                    </Button>
                  </>
                ) : (
                  <Empty description="No leave records">
                    <Button type="primary" icon={<PlusOutlined />} onClick={handleApplyLeave}>Apply for Leave</Button>
                  </Empty>
                )}
              </Card>

                <AppointmentsTile />
              </div>
            </div>
          )}

          <Modal 
            title={
              <Space>
                <FilePdfOutlined />
                Payslip Details
              </Space>
            }
            visible={isModalVisible} 
            onCancel={handleModalCancel} 
            footer={[
              <Button key="close" onClick={handleModalCancel}>
                Close
              </Button>
            ]}
            width={600}
          >
            {currentPayslipDetails ? (
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Employee Name:</Text>
                    <br />
                    <Text>{currentPayslipDetails.employeeName}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Position:</Text>
                    <br />
                    <Text>{currentPayslipDetails.position}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Period:</Text>
                    <br />
                    <Text>{currentPayslipDetails.period}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Generated Date:</Text>
                    <br />
                    <Text>{currentPayslipDetails.generatedDate}</Text>
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Basic Salary:</Text>
                    <br />
                    <Text type="success">R{(currentPayslipDetails.basicSalary || 0).toFixed(2)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Tax Amount:</Text>
                    <br />
                    <Text type="danger">R{(currentPayslipDetails.taxAmount || 0).toFixed(2)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>UIF:</Text>
                    <br />
                    <Text type="warning">R{(currentPayslipDetails.uif || 0).toFixed(2)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Net Salary:</Text>
                    <br />
                    <Text strong type="success" style={{ fontSize: '16px' }}>
                      R{(currentPayslipDetails.netSalary || 0).toFixed(2)}
                    </Text>
                  </Col>
                </Row>
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
