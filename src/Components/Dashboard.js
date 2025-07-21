import React from 'react';
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
  TeamOutlined, 
  FileTextOutlined, 
  CalendarOutlined,
  DollarOutlined
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import './Dashboard.css';

const { Title } = Typography;
const { Content } = Layout;

const Dashboard = () => {
  const navigate = useNavigate();

  const handleGeneratePayslip = () => navigate('/payslip/generate');
  const handleViewAll = (route) => navigate(route);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout className="site-layout">
        <Content className="dashboard-content">
          <div className="dashboard-header">
            <Title level={2}>ADMIN DASHBOARD</Title>
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

          <div className="dashboard-grid">
            {/* First Row */}
            <div className="dashboard-row">
              <Card 
                title={
                  <span>
                    <TeamOutlined className="card-icon" />
                    EMPLOYEE RECORDS
                  </span>
                }
                className="dashboard-card"
                extra={
                  <Button 
                    type="link" 
                    onClick={() => handleViewAll('/employees')}
                    className="view-all-button"
                  >
                    View All
                  </Button>
                }
              >
                <Empty description="No employee records found" />
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
                    onClick={handleGeneratePayslip}
                    icon={<FileTextOutlined />}
                    className="generate-button"
                  >
                    Generate Payslip
                  </Button>
                </div>
              </Card>
            </div>

            {/* Second Row */}
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
                    onClick={() => handleViewAll('/leave-management')}
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