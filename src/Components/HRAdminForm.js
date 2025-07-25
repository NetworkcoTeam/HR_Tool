import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Button, 
  Layout, 
  Divider,
  Row,
  Col,
  message,
  Card,
  Spin,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  IdcardOutlined, 
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SearchOutlined,
  SaveOutlined
} from '@ant-design/icons';
import Sidebar from './Sidebar';
import './HRAdminForm.css';

const { Content } = Layout;
const { Option } = Select;

const HrAdminForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchIdNumber, setSearchIdNumber] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check if user is admin on component mount
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

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5143/api/HrAdmin/user/${searchIdNumber}`);
      const data = await response.json();
      
      if (response.ok) {
        console.log("API Response:", data);
        
        setUserData(data);
        form.setFieldsValue({
          employeeFirstName: data.name,
          employeeLastName: data.surname,
          userIdNumber: searchIdNumber
        });
        message.success('User found! Please complete the form');
      } else {
        message.error(data.status || 'User not found');
      }
    } catch (error) {
      message.error('Error fetching user data');
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      const requestData = {
        userIdNumber: values.userIdNumber,
        employeeFirstName: values.employeeFirstName,
        employeeLastName: values.employeeLastName,
        employeePosition: values.position,
        contractType: values.contractType,
        contractStartDate: values.startDate.format('YYYY-MM-DD'),
        contractEndDate: values.endDate?.format('YYYY-MM-DD'),
        basicSalary: values.basicSalary,
        contractTerms: values.terms
      };

      const response = await fetch('http://localhost:5143/api/HrAdmin/admit-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        message.success('User admitted successfully!');
        form.resetFields();
        setUserData(null);
        setSearchIdNumber('');
      } else {
        message.error(result.message || 'Failed to admit user');
      }
    } catch (error) {
      message.error('Error submitting form');
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Content style={{ margin: '0 16px' }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Alert
              message="Access Denied"
              description="You don't have permission to access this page. Only HR administrators can perform employee admissions."
              type="error"
              showIcon
            />
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout className="site-layout">
        <Content style={{ margin: '0 16px' }}>
          <div className="site-layout-background" style={{ padding: 24, minHeight: 360 }}>
            <Card title="HR Admin - Employee Admission" bordered={false}>
              <Row gutter={16}>
                <Col span={24}>
                  <div style={{ marginBottom: 16 }}>
                    <Input.Search
                      placeholder="Enter ID Number to search"
                      enterButton={<><SearchOutlined /> Search</>}
                      size="large"
                      value={searchIdNumber}
                      onChange={(e) => setSearchIdNumber(e.target.value)}
                      onSearch={fetchUserData}
                      disabled={loading}
                    />
                  </div>
                </Col>
              </Row>

              <Divider orientation="left">Employee Details</Divider>
              
              <Spin spinning={loading}>
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleSubmit}
                  initialValues={{
                    contractType: 'Permanent',
                    isActive: true
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="userIdNumber"
                        label="ID Number"
                        rules={[{ required: true, message: 'Please input ID number!' }]}
                      >
                        <Input 
                          prefix={<IdcardOutlined />} 
                          placeholder="ID Number" 
                          disabled={true}
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="employeeFirstName"
                        label="First Name"
                        rules={[{ required: true, message: 'Please input first name!' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          placeholder="First Name" 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="employeeLastName"
                        label="Last Name"
                        rules={[{ required: true, message: 'Please input last name!' }]}
                      >
                        <Input 
                          prefix={<UserOutlined />} 
                          placeholder="Last Name" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="position"
                        label="Position"
                        rules={[{ required: true, message: 'Please select position!' }]}
                      >
                        <Select placeholder="Select position">
                          <Option value="Manager">Manager</Option>
                          <Option value="HR">HR</Option>
                          <Option value="Intern">Intern</Option>
                          <Option value="Other">Other</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Divider orientation="left">Contract Details</Divider>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="contractType"
                        label="Contract Type"
                        rules={[{ required: true, message: 'Please select contract type!' }]}
                      >
                        <Select placeholder="Select contract type">
                          <Option value="Permanent">Permanent</Option>
                          <Option value="Fixed-Term">Fixed-Term</Option>
                          <Option value="Probation">Probation</Option>
                        </Select>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="startDate"
                        label="Start Date"
                        rules={[{ required: true, message: 'Please select start date!' }]}
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          placeholder="Select start date" 
                        />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="endDate"
                        label="End Date (if applicable)"
                      >
                        <DatePicker 
                          style={{ width: '100%' }} 
                          placeholder="Select end date" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="basicSalary"
                        label="Basic Salary"
                        rules={[{ required: true, message: 'Please input basic salary!' }]}
                      >
                        <Input 
                          type="number" 
                          prefix="R" 
                          placeholder="Basic Salary" 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name="terms"
                        label="Contract Terms"
                      >
                        <Input.TextArea 
                          rows={4} 
                          placeholder="Additional contract terms..." 
                        />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item>
                    <Button 
                      type="primary" 
                      htmlType="submit" 
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      Submit Admission
                    </Button>
                  </Form.Item>
                </Form>
              </Spin>
            </Card>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default HrAdminForm;