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
  Tag,
  Popconfirm
} from 'antd';
import { 
  UserOutlined, 
  CheckOutlined,
  ExclamationCircleOutlined,
  TeamOutlined,
  SolutionOutlined,
  UsergroupAddOutlined,
  ExportOutlined,
  HistoryOutlined
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
        case 'offboarded':
          endpoint = 'http://localhost:5143/api/HrAdmin/offboarded-users';
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

  const handleOffboardClick = async (user) => {
    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:5143/api/HrAdmin/offboard-user/${user.idNumber}`,
        { method: 'POST' }
      );
      
      const result = await response.json();
      
      if (response.ok) {
        message.success(result.message || 'User offboarded successfully');
        fetchUsers(); // Refresh the current tab
      } else {
        message.error(result.message || 'Failed to offboard user');
      }
    } catch (error) {
      message.error('Error offboarding user');
      console.error("Offboard error:", error);
    } finally {
      setLoading(false);
    }
  };

  const getColumns = (tabKey) => {
    const baseColumns = [
      {
        title: tabKey === 'nonAdmitted' ? 'ID Number' : 'Employee ID',
        key: tabKey === 'nonAdmitted' ? 'idNumber' : 'employeeId',
        width: 150,
        render: (_, record) => (
          tabKey === 'nonAdmitted' ? record.idNumber : (record.employeeId || 'N/A')
        ),
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
          <Tag color={
            status === 'Admitted' ? 'green' : 
            status === 'Offboarded' ? 'red' : 'orange'
          }>
            {status}
          </Tag>
        ),
      },
      {
        title: 'Action',
        key: 'action',
        width: 180,
        render: (_, record) => (
          <>
            {record.status === 'Pending' && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={() => handleAdmitClick(record)}
                style={{ marginRight: 8 }}
              >
                Admit
              </Button>
            )}
            {record.status === 'Admitted' && (
              <Popconfirm
                title="Are you sure you want to offboard this user?"
                onConfirm={() => handleOffboardClick(record)}
                okText="Yes"
                cancelText="No"
              >
                <Button 
                  danger
                  icon={<ExportOutlined />}
                >
                  Offboard
                </Button>
              </Popconfirm>
            )}
          </>
        ),
      },
    ];

    if (tabKey === 'offboarded') {
      return [
        ...baseColumns.filter(col => col.key !== 'action'),
        {
          title: 'Archived At',
          dataIndex: 'archivedAt',
          key: 'archivedAt',
          render: (date) => new Date(date).toLocaleString(),
        }
      ];
    }

    return baseColumns;
  };

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
                    columns={getColumns('nonAdmitted')} 
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
                    columns={getColumns('admitted')} 
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
                      <HistoryOutlined />
                      Offboarded
                    </span>
                  }
                  key="offboarded"
                >
                  <Table 
                    columns={getColumns('offboarded')} 
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
                    columns={getColumns('all')} 
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