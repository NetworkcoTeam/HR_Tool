import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  DatePicker, 
  Select, 
  Button, 
  Divider,
  Row,
  Col,
  Spin,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  IdcardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import './HRAdminForm.css';

const { Option } = Select;

const HrAdminForm = ({ initialValues, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState({
    success: null,
    message: ''
  });

  // Set initial values when component mounts or initialValues changes
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue(initialValues);
    }
  }, [initialValues, form]);

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setStatusMessage({ success: null, message: '' });
      
      const requestData = {
        userIdNumber: values.userIdNumber,
        employeeFirstName: values.employeeFirstName,
        employeeLastName: values.employeeLastName,
        employeePosition: values.position,
        department: values.department, 
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
        setStatusMessage({
          success: true,
          message: 'Employee admitted successfully!'
        });
        if (onSuccess) onSuccess();
      } else {
        setStatusMessage({
          success: false,
          message: result.message || 'Failed to admit employee'
        });
      }
    } catch (error) {
      setStatusMessage({
        success: false,
        message: 'Error submitting form. Please try again.'
      });
      console.error('Submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Spin spinning={loading}>
      {statusMessage.message && (
        <Alert
          message={statusMessage.message}
          type={statusMessage.success ? 'success' : 'error'}
          showIcon
          style={{ marginBottom: 24 }}
        />
      )}
      
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          ...initialValues,
          contractType: 'Permanent',
          isActive: true
        }}
      >
        <Divider orientation="left">Employee Details</Divider>
        
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
              <Select 
                placeholder="Select position"
                suffixIcon={<TeamOutlined />}
              >
                <Option value="Manager">Manager</Option>
                <Option value="HR">HR</Option>
                <Option value="Developer">Developer</Option>
                <Option value="Designer">Designer</Option>
                <Option value="Intern">Intern</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="department"
              label="Department"
              rules={[{ required: true, message: 'Please select department!' }]}
            >
              <Select 
                placeholder="Select department"
                suffixIcon={<TeamOutlined />}
              >
                <Option value="IT">IT</Option>
                <Option value="HR">HR</Option>
                <Option value="Marketing">Marketing</Option>
                <Option value="Finance">Finance</Option>
                <Option value="Operations">Operations</Option>
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
              <Select 
                placeholder="Select contract type"
                suffixIcon={<FileTextOutlined />}
              >
                <Option value="Permanent">Permanent</Option>
                <Option value="Fixed-Term">Fixed-Term</Option>
                <Option value="Probation">Probation</Option>
                <Option value="Internship">Internship</Option>
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
                suffixIcon={<CalendarOutlined />}
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
                suffixIcon={<CalendarOutlined />}
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

        <Form.Item style={{ marginTop: 24, textAlign: 'right' }}>
          <Button 
            onClick={onCancel}
            style={{ marginRight: 8 }}
            icon={<CloseOutlined />}
          >
            Cancel
          </Button>
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
  );
};

export default HrAdminForm;