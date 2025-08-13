import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Button, 
  Divider, 
  Typography,
  Empty,
  Tag
} from 'antd';
import { 
  FileTextOutlined, 
  CalendarOutlined,
  DollarOutlined,
  PlusOutlined
} from '@ant-design/icons';
import './Dashboard.css';
import Todo from './Todo.js';

const { Title } = Typography;
const { Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const [employeeId, setEmployeeId] = useState(null);
  const [user, setUser] = useState(null);
  const [viewMode, setViewMode] = useState("admin");
  const todoRef = useRef();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setUser(storedUser);
      if (storedUser.employee_id) {
        setEmployeeId(storedUser.employee_id);
      }
    }
  }, []);

  const handleViewAll = (route) => navigate(route);

  const handleAddTaskClick = () => {
    todoRef.current?.openModal();
  };

  const toggleView = () => {
    const newView = viewMode === "admin" ? "employee" : "admin";
    setViewMode(newView);
    navigate(newView === "admin" ? "/admin" : "/home");
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Layout className="site-layout">
        <Content className="dashboard-content">
          <div className="dashboard-header">
            <Title level={2}>ADMIN DASHBOARD</Title>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div className="current-date">
                <CalendarOutlined /> {new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </div>

              {/* Show button only if role is Admin */}
              {user?.role === "admin" && (
                <Button 
                  type="primary" 
                  size="small"
                  onClick={toggleView}
                >
                  {viewMode === "admin" ? "Switch to Employee View" : "Switch to Admin View"}
                </Button>
              )}
            </div>
          </div>

          <Divider />

          <div className="dashboard-grid">
            <div className="dashboard-row">
              <Card
                title="TO DO LIST"
                className="dashboard-card"
                extra={
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    size="small"
                    onClick={handleAddTaskClick}
                  >
                    Add Task
                  </Button>
                }
              >
                <Todo ref={todoRef} employeeId={employeeId} />
              </Card>

              <Card 
                title={
                  <span>
                    <DollarOutlined className="card-icon" />
                    PAYSLIP MANAGEMENT
                  </span>
                }
                className="dashboard-card"
              >
                <div className="payslip-content">
                  <Button 
                    type="primary" 
                    onClick={() => handleViewAll('/payslipManagement')}
                    icon={<FileTextOutlined />}
                    className="generate-button"
                  >
                    Generate Payslip
                  </Button>
                </div>
              </Card>
            </div>

            <div className="dashboard-row">
              <Card 
                title={
                  <span>
                    <CalendarOutlined className="card-icon" />
                    LEAVE APPLICATIONS
                  </span>
                }
                className="dashboard-card"
                extra={
                  <Button 
                    type="link" 
                    onClick={() => handleViewAll('/LeaveManagement')}
                    className="view-all-button"
                  >
                    View All
                  </Button>
                }
              >
                <Empty description="No pending leave applications" />
              </Card>

              <Card 
                title={
                  <div className="appointments-header">
                    <span>
                      <CalendarOutlined className="card-icon" />
                      UPCOMING APPOINTMENTS
                    </span>
                    <Tag color="blue">Today</Tag>
                  </div>
                }
                className="dashboard-card"
              >
                <Empty description="No appointments scheduled" />
              </Card>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Dashboard;
