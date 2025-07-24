import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Layout, 
  Card, 
  Button, 
  Divider, 
  Typography,
  Empty,
  Tag,
  Spin,
  message
} from 'antd';
import { 
  TeamOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  DollarOutlined,
  PlusOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import './Dashboard.css';

const { Title } = Typography;
const { Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleViewAll = (route) => navigate(route);

  if (error) {
    return (
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
    );
  }

  return (
    <Content className="home-content">
      <div className="dashboard-header">
        <Title level={1}>ADMIN DASHBOARD</Title>
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
          <Card 
            title={
              <span className="card-title">
                <TeamOutlined className="card-icon" />
                EMPLOYEE RECORDS
              </span>
            }
            className="dashboard-card"
          >
            <div className="card-content">
              <Empty description="No employees available" imageStyle={{ height: 40 }}>
                <Button
                  ghost
                  type="primary" 
                  onClick={() => handleViewAll('/payslipManagement')}
                  className="generate-button"
                >
                  View All
                </Button>
              </Empty>
            </div>
          </Card>

          <Card 
            title={
              <span className="card-title">
                <DollarOutlined className="card-icon" />
                PAYSLIP MANAGEMENT
              </span>
            }
            className="dashboard-card"
          >
            <div className="card-content">
              <Empty description="No payslips available" imageStyle={{ height: 40 }}>
                <Button 
                  type="primary" 
                  onClick={() => handleViewAll('/payslipManagement')}
                  icon={<FileTextOutlined />}
                  className="generate-button"
                >
                  Generate Payslip
                </Button>
              </Empty>
            </div>
          </Card>

          <Card 
            title={
              <span className="card-title">
                <CalendarOutlined className="card-icon" />
                LEAVE APPLICATIONS
              </span>
            }
            className="dashboard-card"
          >
            <div className="card-content">
              <Empty description="No employees available" imageStyle={{ height: 40 }}>
                <Button 
                  ghost
                  type="primary" 
                  onClick={() => handleViewAll('/leaveManagement')}
                  className="generate-button"
                >
                  View All
                </Button>
              </Empty>
            </div>
          </Card>

          <Card 
            title={
              <span className="card-title">
                <CalendarOutlined className="card-icon" />
                UPCOMING APPOINTMENTS
              </span>
            }
            className="dashboard-card"
          >
            <div className="card-content">
              <Empty description="No  available" imageStyle={{ height: 40 }}>
                  <Button 
                    ghost 
                    type="primary" 
                    onClick={() => handleViewAll('/AppointmentBooking')}
                    className="generate-button"
                  >
                    View All
                </Button>
              </Empty>
            </div>
          </Card>
        </div>
      )}
    </Content>
  );
};

export default Dashboard;