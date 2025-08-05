import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  message, 
  Spin, 
  Layout,
  Alert,
  Card,
  Tabs,
  Tag
} from 'antd';
import { 
  UserOutlined, 
  CheckOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  SolutionOutlined,
  UsergroupAddOutlined
} from '@ant-design/icons';
import AdminSidebar from '../Components/AdminSidebar';
import HRAdminForm from '../Components/HRAdminForm';
import '../Components/HRAdminForm.css';

const { Content } = Layout;
const { TabPane } = Tabs;

const EmployeeManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState('nonAdmitted');

  // Check admin status
  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.role === 'admin') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error checking admin status:', error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, []);

  // Fetch users based on active tab
  const fetchUsers = async () => {
    try {
      setLoading(true);
      let endpoint;
      
      switch(activeTab) {
        case 'admitted':
          endpoint = 'http://localhost:5143/api/HrAdmin/admitted-users';
          break;
        case 'all':
          endpoint = 'http://localhost:5143/api/HrAdmin/all-users';
          break;
        default:
          endpoint = 'http://localhost:5143/api/HrAdmin/non-admitted-users';
      }

      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
      } else {
        message.error(data.message || 'Failed to fetch users');
      }
    } catch (error) {
      message.error('Error fetching users');
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, activeTab]);

  const handleAdmitClick = (user) => {
    setSelectedUser(user);
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  const handleAdmissionSuccess = () => {
    message.success('User admitted successfully!');
    fetchUsers();
    setIsModalVisible(false);
    setSelectedUser(null);
  };

  const handleTabChange = (key) => {
    setActiveTab(key);
  };

  const columns = [
    {
      title: 'ID Number',
      dataIndex: 'idNumber',
      key: 'idNumber',
      width: 150,
    },
    {
      title: 'Name',
      key: 'name',
      render: (_, record) => `${record.name} ${record.surname}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status) => (
        <Tag color={status === 'Admitted' ? 'green' : 'orange'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Action',
      key: 'action',
      width: 120,
      render: (_, record) => (
        record.status !== 'Admitted' && (
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={() => handleAdmitClick(record)}
          >
            Admit
          </Button>
        )
      ),
    },
  ];

  if (isCheckingAuth) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        <Content style={{ margin: '0 16px' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <AdminSidebar />
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Alert
              message="Access Denied"
              description="You don't have permission to access this page. Only HR administrators can perform employee admissions."
              type="error"
              showIcon
              banner
            />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AdminSidebar />
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Card 
              title={<><TeamOutlined /> Employee Management</>}
              bordered={false}
              extra={
                <Button 
                  type="default" 
                  icon={<ExclamationCircleOutlined />}
                  onClick={fetchUsers}
                  loading={loading}
                >
                  Refresh
                </Button>
              }
            >
              <Tabs activeKey={activeTab} onChange={handleTabChange}>
                <TabPane
                  tab={
                    <span>
                      <SolutionOutlined />
                      Non-Admitted
                    </span>
                  }
                  key="nonAdmitted"
                >
                  <Table 
                    columns={columns} 
                    dataSource={users} 
                    rowKey="idNumber"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <UserOutlined />
                      Admitted
                    </span>
                  }
                  key="admitted"
                >
                  <Table 
                    columns={columns.filter(col => col.key !== 'action')}
                    dataSource={users} 
                    rowKey="idNumber"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                  />
                </TabPane>
                <TabPane
                  tab={
                    <span>
                      <UsergroupAddOutlined />
                      All Users
                    </span>
                  }
                  key="all"
                >
                  <Table 
                    columns={columns} 
                    dataSource={users} 
                    rowKey="idNumber"
                    loading={loading}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: true }}
                  />
                </TabPane>
              </Tabs>

              <Modal
                title={`Admit User: ${selectedUser?.name} ${selectedUser?.surname}`}
                visible={isModalVisible}
                onCancel={handleModalClose}
                footer={null}
                width={800}
                destroyOnClose
              >
                {selectedUser && (
                  <HRAdminForm 
                    initialValues={{
                      userIdNumber: selectedUser.idNumber,
                      employeeFirstName: selectedUser.name,
                      employeeLastName: selectedUser.surname
                    }}
                    onSuccess={handleAdmissionSuccess}
                    onCancel={handleModalClose}
                  />
                )}
              </Modal>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default EmployeeManagement;