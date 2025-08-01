import React, { useState, useEffect, useCallback } from 'react';
import moment from 'moment';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  DatePicker, 
  TimePicker, 
  Select, 
  Tag, 
  Divider,
  Row,
  Col,
  message
} from 'antd';
import { 
  PhoneOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import axios from 'axios';
import './Appointment.css';


const { Option } = Select;

const Appointment = () => {
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const statusColors = {
    Pending: 'orange',
    Accepted: 'green',
    Rejected: 'red',
    Cancelled: 'gray'
  };

  const appointmentReasons = [
    'One-on-One Meeting',
    'Performance Review',
    'Complaint Resolution',
    'Contract Negotiation',
    'Other HR Matter'
  ];

  const API_BASE_URL = 'http://localhost:5143/api/appointment';

  // Load user from localStorage and determine admin status
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setIsAdmin(user.role === 'admin');
        console.log('User role:', user.role, 'isAdmin:', user.role === 'admin');
      } catch (err) {
        console.error("Failed to parse user data:", err);
      }
    }
  }, []);

  // Fetch appointments with proper admin detection
  const fetchAppointments = useCallback(async () => {
    if (!userData || !userData.employee_id) return;
  
    try {
      setLoading(true);
      const endpoint = isAdmin 
        ? `${API_BASE_URL}/all` 
        : `${API_BASE_URL}/employee/${userData.employee_id}`;

      
      const response = await axios.get(endpoint);
      console.log("Raw appointment data:", response.data);

      
      const formattedData = response.data.map(item => ({
        ...item,
        appointmentId: item.appointmentId || item.appointment_id,
        employeeId: item.employeeId || item.employee_id,
        employeeName: isAdmin ? `Employee ${item.employeeId}` : `${userData.name} ${userData.surname}`,
        appointmentDate: item.appointmentDate || item.appointment_date,
        startTime: item.startTime || item.start_time,
        endTime: item.endTime || item.end_time,
        contactNumber: item.contactNumber || item.contact_number,
        createdAt: item.createdAt || item.created_at
      }));
  
      setAppointments(formattedData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      message.error('Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userData]);
  

  useEffect(() => {
    if (userData) {
      fetchAppointments();
    }
  }, [userData, isAdmin]);

  // Pre-fill form with user data when modal opens
  useEffect(() => {
    if (isModalVisible && userData) {
      form.setFieldsValue({
        employeeId: userData.employee_id,
        empName: `${userData.name} ${userData.surname}`,
        subject: 'HR Meeting'
      });
    }
  }, [isModalVisible, userData, form]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/status/${appointmentId}`, { status });
      message.success(`Appointment ${status.toLowerCase()}`);
      fetchAppointments();
    } catch (error) {
      console.error('Error updating status:', error);
      message.error('Failed to update status');
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await axios.put(`${API_BASE_URL}/cancel/${appointmentId}`, {
        employeeId: userData?.employee_id
      });
      message.success('Appointment cancelled');
      fetchAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      message.error('Failed to cancel appointment');
    }
  };

  const onFinish = async (values) => {
    try {
      // Get the date from the form
      const appointmentDate = values.date.format('YYYY-MM-DD');

      // Get the start time and end time
      const startTime = values.time[0].format('HH:mm:ss');
      const endTime = values.time[1].format('HH:mm:ss');

      // Combine date and time to create a full datetime object in local time
      // For example, 2025-09-30 08:00:00 (SAST)
      const startDateTimeLocal = moment(`${appointmentDate}T${startTime}`);
      const endDateTimeLocal = moment(`${appointmentDate}T${endTime}`);

      // Convert the local datetimes to UTC ISO 8601 strings
      // The .toISOString() method automatically converts to UTC
      const startDateTimeUTC = startDateTimeLocal.toISOString();
      const endDateTimeUTC = endDateTimeLocal.toISOString();

      const request = {
        employeeId: parseInt(userData.employee_id),
        subject: values.subject,
        description: values.description,
        // Send the full UTC datetime strings to the backend
        appointmentDate: startDateTimeUTC, 
        startTime: startTime,
        endTime: endTime,
        contactNumber: values.contactNumber.toString(),
        status: 'Pending'
      };

      console.log('Submitting appointment:', request);
      await axios.post(API_BASE_URL, request);
      message.success('Appointment booked successfully!');
      setIsModalVisible(false);
      form.resetFields();
      fetchAppointments();
    } catch (error) {
      console.error('Error booking appointment:', error);
      const errorMessage = error.response?.data?.message || 'Failed to book appointment';
      message.error(errorMessage);
    }
  };

  const columns = [
    {
      title: 'Employee',
      key: 'employee',
      render: (_, record) => (
        <span>
          {record.employeeName || 'N/A'} (ID: {record.employeeId})
        </span>
      ),
    },
    {
      title: 'Date',
      dataIndex: 'appointmentDate',
      key: 'appointmentDate',
      render: date => moment(date).format('LL'),
      sorter: (a, b) => new Date(a.appointmentDate) - new Date(b.appointmentDate),
    },
    {
      title: 'Time',
      key: 'time',
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: 'Title',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Purpose',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={statusColors[status] || 'default'}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: 'Pending', value: 'Pending' },
        { text: 'Accepted', value: 'Accepted' },
        { text: 'Rejected', value: 'Rejected' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    ...(isAdmin ? [
      {
        title: 'Contact',
        dataIndex: 'contactNumber',
        key: 'contactNumber',
      },
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <div>
            <Button 
              type="link" 
              onClick={() => updateAppointmentStatus(record.appointmentId, 'Accepted')}
              disabled={record.status !== 'Pending'}
              style={{ color: 'green' }}
            >
              Accept
            </Button>
            <Button 
              type="link" 
              onClick={() => updateAppointmentStatus(record.appointmentId, 'Rejected')}
              disabled={record.status !== 'Pending'}
              danger
            >
              Reject
            </Button>
          </div>
        ),
      }
    ] : [
      {
        title: 'Action',
        key: 'action',
        render: (_, record) => (
          <Button 
            type="link" 
            onClick={() => cancelAppointment(record.appointmentId)}
            disabled={record.status !== 'Pending'}
            danger
          >
            Cancel
          </Button>
        ),
      }
    ]),
  ];

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>{isAdmin ? 'HR Appointments Dashboard' : 'My HR Appointments'}</h1>
        {!isAdmin && (
          <Button 
            type="primary" 
            onClick={showModal} 
            icon={<FileTextOutlined />}
          >
            Book HR Appointment
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={appointments} 
        rowKey="appointmentId"
        loading={loading}
        pagination={{ 
          pageSize: 5,
          showSizeChanger: false 
        }}
        locale={{ 
          emptyText: 'No appointments found' 
        }}
        scroll={{ x: true }}
      />

      <Modal
        title="Book HR Appointment"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        centered
        destroyOnClose
      >
        <Divider />
        <Form
          form={form}
          name="appointmentForm"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="employeeId"
                label="Employee ID"
              >
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="empName"
                label="Employee Name"
              >
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="subject"
                label="Meeting Title"
                rules={[{ required: true, message: 'Please enter meeting title' }]}
              >
                <Input placeholder="e.g., Performance Review" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[
                  { 
                    pattern: /^[0-9]{10}$/,
                    message: 'Please enter a valid 10-digit phone number'
                  }
                ]}
              >
                <Input 
                prefix={<PhoneOutlined />} 
                placeholder="0810123987" 
                inputMode="numeric"/>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Meeting Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  disabledDate={(current) => current && current < moment().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Meeting Time"
                rules={[{ required: true, message: 'Please select time range' }]}
              >
                <TimePicker.RangePicker
  style={{ width: '100%' }}
  format="h:mm a"
  minuteStep={15}
  disabledTime={(current) => {
    if (!current) {
      return {
        disabledHours: () => [],
        disabledMinutes: () => [],
        disabledSeconds: () => []
      };
    }
    
    const hour = current.hour();
    return {
      disabledHours: () => hour < 8 || hour > 17 ? [] : [],
      disabledMinutes: () => [],
      disabledSeconds: () => []
    };
  }}
/>
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Meeting Reason"
                rules={[{ required: true, message: 'Please select a reason' }]}
              >
                <Select placeholder="Select a reason for the meeting">
                  {appointmentReasons.map(reason => (
                    <Option key={reason} value={reason}>
                      {reason}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Row justify="end" gutter={16}>
            <Col>
              <Button onClick={handleCancel}>
                Cancel
              </Button>
            </Col>
            <Col>
              <Button type="primary" htmlType="submit">
                Book Appointment
              </Button>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Appointment;

