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
  Form,
  Input,
  DatePicker,
  Select
} from 'antd';
import {
  CheckCircleOutlined,
  FilePdfOutlined,
  EyeOutlined,
  ClockCircleOutlined,
  CalendarOutlined,
  PlusOutlined,
  UserOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import './Home.css';
import AppointmentsTile from '../Components/AppointmentTile';

const API_BASE = 'http://localhost:5143';
const { Content } = Layout;

const Home = () => {
  const navigate = useNavigate();
  const todoCache = useRef(null);
  const leaveCache = useRef(null);

  const [loading, setLoading] = useState(true);
  const [todoData, setTodoData] = useState([]);
  const [payslipData, setPayslipData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPayslipDetails, setCurrentPayslipDetails] = useState(null);
  const [isAddTodoModalVisible, setIsAddTodoModalVisible] = useState(false);
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

  const fetchPayslips = async (empId) => {
    if (!empId) return;
    
    try {
      const payslipsResponse = await fetch(`${API_BASE}/api/Payslips/employee/${empId}/payslips`);
      if (!payslipsResponse.ok) {
        throw new Error(`HTTP error! status: ${payslipsResponse.status}`);
      }
      
      const payslipsJson = await payslipsResponse.json();
      
      if (payslipsJson.success) {
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

        const sortedPayslips = processedPayslips.sort((a, b) => 
          b.RawPeriodEnd - a.RawPeriodEnd
        );
        setPayslipData(sortedPayslips);
      } else {
        message.error(payslipsJson.error || 'Failed to fetch payslips');
        setPayslipData([]);
      }
    } catch (err) {
      console.error('Failed to load payslips:', err);
      setError('Failed to load payslips');
      message.error('Failed to load payslips: ' + err.message);
      setPayslipData([]);
    }
  };

  const fetchLeaveRequests = async (empId) => {
    if (!empId) return;

    if (leaveCache.current) {
      setLeaveData(leaveCache.current);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/LeaveRequest/employee/${empId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch leave requests: ${response.status}`);
      }

      const data = await response.json();
      const formattedData = data.map(request => ({
  id: request.id,
  type: request.typeOfLeave || 'Leave',
  status: request.status?.toLowerCase() || 'pending',
  days: request.totalDays || Math.ceil(
    (new Date(request.leaveEnd) - new Date(request.leaveStart)) / (1000 * 60 * 60 * 24)
  ) + 1,
  startDate: new Date(request.leaveStart).toLocaleDateString(),
  endDate: new Date(request.leaveEnd).toLocaleDateString(),
  details: request.otherDetails || ''
}));

      leaveCache.current = formattedData;
      setLeaveData(formattedData);
    } catch (err) {
      console.error("Error fetching leave requests:", err);
      setError(err.message);
      message.error("Failed to load leave requests");
    }
  };

  const fetchTodos = async (empId) => {
    if (!empId) return;

    if (todoCache.current) {
      setTodoData(todoCache.current);
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/ToDo`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch todos: ${response.status}`);
      }

      const data = await response.json();
      const formattedData = data.map(todo => ({
        id: todo.id,
        task: todo.title,
        dueDate: todo.dueDate,
        status: todo.status,
        priority: todo.priorityLevel,
        completed: todo.status === 'Completed'
      }));

      todoCache.current = formattedData;
      setTodoData(formattedData);
    } catch (err) {
      console.error("Error fetching todos:", err);
      setError(err.message);
      message.error("Failed to load todos");
    }
  };

  const addTodo = async (newTodo) => {
    try {
      const response = await fetch(`${API_BASE}/api/ToDo`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(newTodo)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add todo');
      }

      todoCache.current = null; // Invalidate cache
      await fetchTodos(employeeId);
      return await response.json();
    } catch (err) {
      console.error("Error adding todo:", err);
      throw err;
    }
  };

  const updateTodoStatus = async (id, completed) => {
    try {
      const response = await fetch(`${API_BASE}/api/ToDo/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          status: completed ? 'Completed' : 'Pending'
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update todo: ${response.status}`);
      }
      
      todoCache.current = null; // Invalidate cache
      await fetchTodos(employeeId);
      return await response.json();
    } catch (err) {
      console.error("Error updating todo:", err);
      throw err;
    }
  };

  const deleteTodo = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/api/ToDo/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete todo: ${response.status}`);
      }
      
      todoCache.current = null; // Invalidate cache
      await fetchTodos(employeeId);
      return true;
    } catch (err) {
      console.error("Error deleting todo:", err);
      throw err;
    }
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
    navigate("/leaveForm");
  };

  const handleAddTodoSubmit = async (values) => {
    try {
      const todoPayload = {
        title: values.task,
        dueDate: values.dueDate.format('YYYY-MM-DDTHH:mm:ss'),
        status: "Pending",
        priorityLevel: values.priority
      };
      
      await addTodo(todoPayload);
      message.success('Todo added successfully!');
      setIsAddTodoModalVisible(false);
    } catch (err) {
      message.error(`Failed to add todo: ${err.message}`);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentPayslipDetails(null);
  };

  useEffect(() => {
    const loadData = async () => {
      if (!employeeId) return;
      
      setLoading(true);
      try {
        await Promise.all([
          fetchPayslips(employeeId),
          fetchTodos(employeeId),
          fetchLeaveRequests(employeeId)
        ]);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('Failed to load dashboard data');
        message.error('Failed to load dashboard data: ' + err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [employeeId]);

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
                      onClick={() => setIsAddTodoModalVisible(true)}
                    >
                      Add Task
                    </Button>
                  }
                >
                  {todoData.length > 0 ? (
                    <List
                      dataSource={todoData}
                      renderItem={(item) => (
                        <List.Item
                          actions={[
                            <Button
                              type="text"
                              icon={item.completed ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ClockCircleOutlined />}
                              onClick={() => updateTodoStatus(item.id, !item.completed)}
                            />,
                            <Button
                              type="text"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => deleteTodo(item.id)}
                            />
                          ]}
                        >
                          <List.Item.Meta
                            avatar={
                              <Tag color={
                                item.priority === 'High' ? 'red' : 
                                item.priority === 'Medium' ? 'orange' : 'blue'
                              }>
                                {item.priority}
                              </Tag>
                            }
                            title={<span className={item.completed ? 'completed-task' : ''}>{item.task}</span>}
                            description={
                              <>
                                <div>Due: {new Date(item.dueDate).toLocaleDateString()}</div>
                                <div>Status: <Tag color={item.completed ? 'success' : 'processing'}>
                                  {item.completed ? 'Completed' : 'Pending'}
                                </Tag></div>
                              </>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty description="No tasks found">
                      <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddTodoModalVisible(true)}>
                        Add Your First Task
                      </Button>
                    </Empty>
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
                        icon={<PlusOutlined />}
                        style={{ width: '100%', maxWidth: 300 }}
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
                    <AppointmentsTile />
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

          <Modal
            title="Add New Todo"
            visible={isAddTodoModalVisible}
            onCancel={() => setIsAddTodoModalVisible(false)}
            footer={null}
          >
            <Form
              layout="vertical"
              onFinish={handleAddTodoSubmit}
            >
              <Form.Item
                label="Task"
                name="task"
                rules={[{ required: true, message: 'Please enter a task' }]}
              >
                <Input placeholder="Enter task description" />
              </Form.Item>
              
              <Form.Item
                label="Due Date"
                name="dueDate"
                rules={[{ required: true, message: 'Please select a due date' }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
              
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: 'Please select a priority' }]}
              >
                <Select>
                  <Select.Option value="Low">Low</Select.Option>
                  <Select.Option value="Medium">Medium</Select.Option>
                  <Select.Option value="High">High</Select.Option>
                </Select>
              </Form.Item>
              
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Add Task
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Home;