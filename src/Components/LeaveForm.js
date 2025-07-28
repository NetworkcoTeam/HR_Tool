import React, { useState, useEffect } from 'react';

import { 
  Form, 
  Input, 
  DatePicker, 
  Radio, 
  Upload, 
  Button, 
  Layout, 
  Divider,
  Row,
  Col,
  message 
} from 'antd';
import { 
  UploadOutlined, 
  UserOutlined, 
  IdcardOutlined, 
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined 
} from '@ant-design/icons';
import Sidebar from '../Components/Sidebar';
import '../Pages/LeaveForm.css';

const { Content } = Layout;

const Leave = () => {
  const [form] = Form.useForm();
  const [leaveType, setLeaveType] = useState('');
  const [fileList, setFileList] = useState([]);
  const [userData, setUserData] = useState(null);

  // Load user data from localStorage on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        
        // Set form fields with user data
        form.setFieldsValue({
          name: user.name,
          surname: user.surname,
          employeeId: user.idNumber,
          // Add other fields if available in your user object
          // department: user.department,
          // position: user.position
        });
      } catch (error) {
        console.error('Failed to parse user data:', error);
      }
    }
  }, [form]);


const onFinish = async (values) => {
  try {
    // Calculate total days
    const startDate = values.leaveStart.toDate();
    const endDate = values.leaveEnd.toDate();
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    const totalDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;

const payload = {
  id: crypto.randomUUID(),
  name: values.name || userData?.name || "",
  surname: values.surname || userData?.surname || "",
  employee_id: values.employeeId || userData?.idNumber || "",
  position: values.position || "",
  department: values.department || "",
  leave_start: values.leaveStart.toISOString(),
  leave_end: values.leaveEnd.toISOString(),
  total_days: totalDays,
  type_of_leave: values.leaveType || "",
  status: "Pending",
  other_details: values.otherLeaveType || "",
  doctors_letter: values.doctorsLetter?.[0]?.name || "",
  funeral_letter: values.funeralLetter?.[0]?.name || "",
  created_at: new Date().toISOString()
};



    console.log('Submitting payload:', payload);

    const response = await fetch('http://localhost:5143/api/LeaveRequest', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(payload)
    });

if (!response.ok) {
      let errorMessage = 'Failed to submit leave request';

      // Try to parse the response as JSON
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || JSON.stringify(errorData);
      } catch (parseError) {
        // If response isn't JSON
        const text = await response.text();
        errorMessage = text || errorMessage;
      }

      throw new Error(errorMessage);
    }

    message.success('Leave application submitted successfully!');
    form.resetFields();
  } catch (error) {
    console.error('Full error:', error);
    message.error(`Submission failed: ${error.message}`);
  }
};

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
    message.error('Please fill in all required fields!');
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  const leaveTypes = [
    { label: 'Unpaid', value: 'unpaid' },
    { label: 'Maternity', value: 'maternity' },
    { label: 'Paternity', value: 'paternity' },
    { label: 'Sick', value: 'sick' },
    { label: 'Annual', value: 'annual' },
    { label: 'Family Responsibility', value: 'family' },
    { label: 'Other', value: 'other' },
  ];

  

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout className="site-layout">
        <Content style={{ margin: '24px 16px', padding: 24 }}>
          <div className="leave-form-container">
            <h1 className="form-title">
              <FileTextOutlined /> Leave Application
            </h1>
            
            <Divider />

            <Form
              form={form}
              name="leaveForm"
              onFinish={onFinish}
              onFinishFailed={onFinishFailed}
              layout="vertical"
              size="large"
            >
              <Row gutter={24}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="name"
                    label="Name"
                    rules={[{ required: true, message: 'Please input your name!' }]}
                  >
                    <Input 
                      prefix={<UserOutlined />} 
                      placeholder="Enter your name" 
                      disabled={!!userData?.name} // Disable if we have user data
                    />
                  </Form.Item>

                  <Form.Item
                    name="employeeId"
                    label="Employee ID"
                    rules={[{ required: true, message: 'Please input your employee ID!' }]}
                  >
                    <Input 
                      prefix={<IdcardOutlined />} 
                      placeholder="Enter employee ID" 
                      disabled={!!userData?.idNumber}
                    />
                  </Form.Item>

                  <Form.Item
                    name="position"
                    label="Position"
                    rules={[{ required: true, message: 'Please input your position!' }]}
                  >
                    <Input placeholder="Enter your position" />
                  </Form.Item>

                  <Form.Item
                    name="leaveStart"
                    label="Leave Start Date"
                    rules={[{ required: true, message: 'Please select start date!' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      suffixIcon={<CalendarOutlined />} 
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="surname"
                    label="Surname"
                    rules={[{ required: true, message: 'Please input your surname!' }]}
                  >
                    <Input 
                      placeholder="Enter your surname" 
                      disabled={!!userData?.surname}
                    />
                  </Form.Item>

                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true, message: 'Please input your department!' }]}
                  >
                    <Input prefix={<TeamOutlined />} placeholder="Enter department" />
                  </Form.Item>

                  <Form.Item
                    name="leaveEnd"
                    label="Leave End Date"
                    rules={[{ required: true, message: 'Please select end date!' }]}
                  >
                    <DatePicker 
                      style={{ width: '100%' }} 
                      suffixIcon={<CalendarOutlined />} 
                    />
                  </Form.Item>

                  <Form.Item
                    name="totalDays"
                    label="Total Days"
                  >
                    <Input disabled placeholder="Will be calculated automatically" />
                  </Form.Item>
                </Col>
              </Row>

              {/* Rest of your form remains the same */}
              <Divider orientation="left">Leave Details</Divider>

              <Form.Item
                name="leaveType"
                label="Type of Leave"
                rules={[{ required: true, message: 'Please select leave type!' }]}
              >
                <Radio.Group 
                  options={leaveTypes} 
                  onChange={(e) => setLeaveType(e.target.value)}
                  optionType="button"
                  buttonStyle="solid"
                />
              </Form.Item>

              {leaveType === 'other' && (
                <Form.Item
                  name="otherLeaveType"
                  label="Please specify leave type"
                  rules={[{ required: true, message: 'Please specify leave type!' }]}
                >
                  <Input placeholder="Enter leave type" />
                </Form.Item>
              )}

              <Divider orientation="left">Supporting Documents</Divider>

              <Form.Item
                name="doctorsLetter"
                label="Doctor's Letter (if applicable)"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload 
                  beforeUpload={() => false} 
                  listType="text"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>

              <Form.Item
                name="funeralLetter"
                label="Funeral Letter (if applicable)"
                valuePropName="fileList"
                getValueFromEvent={normFile}
              >
                <Upload 
                  beforeUpload={() => false} 
                  listType="text"
                  maxCount={1}
                >
                  <Button icon={<UploadOutlined />}>Click to upload</Button>
                </Upload>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" size="large">
                  Submit Application
                </Button>
              </Form.Item>
            </Form>
            
 
            
            
            
          </div>
          
        </Content>
      </Layout>
    </Layout>
  );
};

export default Leave;