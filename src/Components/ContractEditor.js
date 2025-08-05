import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  Select, 
  Button, 
  Spin, 
  Card,
  Switch,
  Row,
  Col,
  DatePicker,
  Divider
} from 'antd';
import { SearchOutlined, SaveOutlined } from '@ant-design/icons';
import moment from 'moment';
import './LoginForm.css'; //for for status message classes

const { Option } = Select;

const ContractEditor = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [contractData, setContractData] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [status, setStatus] = useState({
    success: null,
    message: ''
  });

  const fetchContractData = async () => {
    if (!employeeId) {
      setStatus({
        success: false,
        message: 'Please enter an Employee ID'
      });
      return;
    }

    try {
      setSearching(true);
      setStatus({
        success: null,
        message: ''
      });
      
      const response = await fetch(`http://localhost:5143/api/HrAdmin/contracts/employee/${employeeId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.status || 'Contract not found');
      }

      const data = await response.json();
      setContractData(data);
      
      // Set form values with the fetched data
      form.setFieldsValue({
        contractType: data.contractType,
        startDate: data.startDate ? moment(data.startDate) : null,
        endDate: data.endDate ? moment(data.endDate) : null,
        basicSalary: data.basicSalary,
        allowance: data.allowance || 0,
        terms: data.terms,
        isActive: data.isActive,
        position: data.position,
        department: data.department
      });
      
      setStatus({
        success: true,
        message: 'Contract data updated successfully'
      });
    } catch (error) {
      setStatus({
        success: false,
        message: error.message
      });
      setContractData(null);
      form.resetFields();
    } finally {
      setSearching(false);
    }
  };

  const handleSubmit = async (values) => {
    if (!contractData) return;
  
    try {
      setLoading(true);
      setStatus({
        success: null,
        message: ''
      });
      
      // Prepare the updated contract data
      const updatedContract = {
        contractId: contractData.contractId,
        employeeId: contractData.employeeId,
        contractType: values.contractType,
        startDate: values.startDate?.format('YYYY-MM-DD'),
        endDate: values.endDate?.format('YYYY-MM-DD'),
        basicSalary: parseFloat(values.basicSalary),
        allowance: values.allowance ? parseFloat(values.allowance) : null,
        terms: values.terms,
        isActive: values.isActive,
        position: values.position,
        department: values.department,
        createdAt: contractData.createdAt
      };
  
      const response = await fetch(`http://localhost:5143/api/HrAdmin/contracts/${contractData.contractId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(localStorage.getItem('token') && {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          })
        },
        body: JSON.stringify(updatedContract)
      });
  
      if (!response.ok) {
        let errorMessage = 'Failed to update contract';
        try {
          const errorData = await response.json();
          errorMessage = errorData.status || errorData.message || errorMessage;
        } catch (parseError) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }
  
      const result = await response.json();
      
      setStatus({
        success: true,
        message: 'Contract updated successfully'
      });
      
      // Refresh the data to show updated values
      await fetchContractData();
    } catch (error) {
      setStatus({
        success: false,
        message: error.message || 'Failed to update contract'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Contract Editor" bordered={false}>
        {status.message && (
        <div className={`status-message ${status.success ? 'success' : 'error'}`}>
          {status.message}
        </div>
      )}
      <Row gutter={16}>
        <Col span={24}>
          <div style={{ marginBottom: 16 }}>
            <Input.Search
              placeholder="Enter Employee ID"
              enterButton={<><SearchOutlined /> Search</>}
              size="large"
              value={employeeId}
              onChange={(e) => setEmployeeId(e.target.value)}
              onSearch={fetchContractData}
              disabled={searching}
            />
          </div>
        </Col>
      </Row>

      <Spin spinning={searching || loading}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            isActive: true,
            allowance: 0
          }}
        >
          {contractData && (
            <>
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Contract ID">
                    <Input value={contractData.contractId} disabled />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Employee ID">
                    <Input value={contractData.employeeId} disabled />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Employee Name">
                    <Input value={`${contractData.firstName} ${contractData.lastName}`} disabled />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item label="Created At">
                    <Input value={moment(contractData.createdAt).format('YYYY-MM-DD HH:mm:ss')} disabled />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Last Updated">
                    <Input value={moment(contractData.updatedAt).format('YYYY-MM-DD HH:mm:ss')} disabled />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item label="Status">
                    <Input value={contractData.isActive ? 'Active' : 'Inactive'} disabled style={{
                      color: contractData.isActive ? '#52c41a' : '#ff4d4f',
                      fontWeight: 'bold'
                    }} />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="position"
                    label="Position"
                    rules={[{ required: true, message: 'Please input position!' }]}
                  >
                    <Input placeholder="Enter position" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="department"
                    label="Department"
                    rules={[{ required: true, message: 'Please input department!' }]}
                  >
                    <Input placeholder="Enter department" />
                  </Form.Item>
                </Col>
              </Row>

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
                <Col span={12}>
                  <Form.Item
                    name="isActive"
                    label="Active Status"
                    valuePropName="checked"
                  >
                    <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
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
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="endDate"
                    label="End Date (if applicable)"
                  >
                    <DatePicker style={{ width: '100%' }} />
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
                    <Input prefix="R" type="number" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="allowance"
                    label="Allowance"
                  >
                    <Input prefix="R" type="number" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="terms"
                label="Contract Terms"
              >
                <Input.TextArea rows={4} />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Update Contract
                </Button>
              </Form.Item>
            </>
          )}
        </Form>
      </Spin>
    </Card>
  );
};

export default ContractEditor;