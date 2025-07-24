import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Spin, message, Radio, Modal, Form, Input, DatePicker, InputNumber } from 'antd';
import './RegistrationRequestAdmin.css';

const RegistrationRequestAdmin = () => {
  // Mock data for registration requests
  const mockRequests = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phone: '555-123-4567',
      department: 'Engineering',
      position: 'Software Engineer',
      appliedDate: '2023-05-15',
      status: 'Pending'
    },
    {
      id: '2',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      phone: '555-987-6543',
      department: 'Marketing',
      position: 'Marketing Specialist',
      appliedDate: '2023-05-18',
      status: 'Pending'
    },
    {
      id: '3',
      firstName: 'Robert',
      lastName: 'Johnson',
      email: 'robert.j@example.com',
      phone: '555-456-7890',
      department: 'HR',
      position: 'HR Coordinator',
      appliedDate: '2023-05-10',
      status: 'Approved',
      contractDetails: {
        position: 'HR Coordinator',
        salary: 55000,
        startDate: '2023-06-01',
        contractType: 'Full-time',
        benefits: 'Health insurance, 401k matching'
      }
    },
    {
      id: '4',
      firstName: 'Emily',
      lastName: 'Williams',
      email: 'emily.w@example.com',
      phone: '555-789-0123',
      department: 'Finance',
      position: 'Financial Analyst',
      appliedDate: '2023-05-05',
      status: 'Denied'
    }
  ];

  const [requests, setRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [form] = Form.useForm();

  const fetchRegistrationRequests = async () => {
    setLoading(true);
    
  };

  const updateStatus = async (id, newStatus, contractDetails = null) => {
    setUpdating(true);
    try {
      // Simulate API call
      setTimeout(() => {
        const updatedRequests = requests.map(request => {
          if (request.id === id) {
            return { 
              ...request, 
              status: newStatus,
              ...(contractDetails ? { contractDetails } : {})
            };
          }
          return request;
        });
        
        setRequests(updatedRequests);
        setFilteredRequests(updatedRequests.filter(request => 
          statusFilter === 'All' ? true : request.status === statusFilter
        ));
        message.success(`Status updated to ${newStatus}`);
        setUpdating(false);
      }, 500);
    } catch (error) {
      console.error(error);
      message.error('Failed to update status.');
      setUpdating(false);
    }
  };

  const handleApprove = (record) => {
    setSelectedRequest(record);
    setIsModalVisible(true);
  };

  const handleDeny = (record) => {
    Modal.confirm({
      title: 'Are you sure you want to deny this registration?',
      content: 'This action cannot be undone.',
      onOk: () => updateStatus(record.id, 'Denied'),
    });
  };

  const handleModalSubmit = () => {
    form.validateFields().then(values => {
      const contractDetails = {
        position: values.position,
        salary: values.salary,
        startDate: values.startDate.format('YYYY-MM-DD'),
        contractType: values.contractType,
        benefits: values.benefits,
      };
      updateStatus(selectedRequest.id, 'Approved', contractDetails);
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  useEffect(() => {
    fetchRegistrationRequests();
  }, []);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredRequests(requests);
    } else {
      setFilteredRequests(requests.filter(request => request.status === statusFilter));
    }
  }, [statusFilter, requests]);

  const columns = [
    {
      title: 'Name',
      dataIndex: 'firstName',
      key: 'name',
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Applied Date',
      dataIndex: 'appliedDate',
      key: 'appliedDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Approved') color = 'green';
        else if (status === 'Denied') color = 'red';
        else if (status === 'Pending') color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button 
            type="primary" 
            onClick={() => handleApprove(record)}
            disabled={record.status === 'Approved' || updating}
            loading={updating}
            style={{ marginRight: 8 }}
          >
            Approve
          </Button>
          <Button 
            danger 
            onClick={() => handleDeny(record)}
            disabled={record.status === 'Denied' || updating}
            loading={updating}
          >
            Deny
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Registration Requests Management</h1>
      <div style={{ marginBottom: 16 }}>
        <Radio.Group 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="Pending">Pending</Radio.Button>
          <Radio.Button value="Approved">Approved</Radio.Button>
          <Radio.Button value="Denied">Denied</Radio.Button>
          <Radio.Button value="All">All</Radio.Button>
        </Radio.Group>
      </div>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={filteredRequests} 
          rowKey="id"
        />
      </Spin>

      <Modal
        title="Contract Details"
        visible={isModalVisible}
        onOk={handleModalSubmit}
        onCancel={() => {
          setIsModalVisible(false);
          form.resetFields();
        }}
        width={700}
      >
        <Form form={form} layout="vertical" initialValues={{ position: selectedRequest?.position }}>
          <Form.Item label="Position" name="position" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Salary" name="salary" rules={[{ required: true }]}>
            <InputNumber
              style={{ width: '100%' }}
              min={0}
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
          <Form.Item label="Start Date" name="startDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="End Date" name="endtDate" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item label="Contract Type" name="contractType" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Benefits" name="benefits">
            <Input.TextArea rows={4} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RegistrationRequestAdmin;