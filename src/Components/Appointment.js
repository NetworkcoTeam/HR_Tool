import React, { useState } from 'react';
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
  UserOutlined, 
  PhoneOutlined, 
  CalendarOutlined,
  ClockCircleOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import './Appointment.css';

const { Option } = Select;

const Appointment = ({ isAdmin = false }) => {
  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  
  const statusColors = {
    confirmed: 'green',
    pending: 'orange',
    cancelled: 'red'
  };

  const appointmentReasons = [
    { value: 'Consultation', label: 'Consultation' },
    { value: 'Follow-up', label: 'Follow-up Visit' },
    { value: 'Procedure', label: 'Medical Procedure' },
    { value: 'Test', label: 'Diagnostic Test' },
    { value: 'Vaccination', label: 'Vaccination' },
    { value: 'Other', label: 'Other' }
  ];

  const appointmentTypes = [
    { value: 'In-person', label: 'In-person' },
    { value: 'Virtual', label: 'Virtual' }
  ];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString()
    },
    {
      title: 'Time',
      dataIndex: 'time',
      key: 'time',
    },
    {
      title: 'Patient',
      dataIndex: 'patientName',
      key: 'patientName',
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
    },
    {
      title: 'Appointment Type',
      dataIndex: 'appointmentType',
      key: 'appointmentType',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: status => (
        <Tag color={statusColors[status]}>
          {status.toUpperCase()}
        </Tag>
      )
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
          <Button 
            type="link" 
            onClick={() => handleStatusChange(record.id, 'cancelled')}
            disabled={record.status === 'cancelled'}
            danger
          >
            Cancel
          </Button>
        )
      }
    ] : [])
  ];

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleStatusChange = (id, newStatus) => {
    setAppointments(prev => prev.map(appt => 
      appt.id === id ? { ...appt, status: newStatus } : appt
    ));
    message.success(`Appointment status updated to ${newStatus}`);
  };

  const onFinish = (values) => {
    try {
      const newAppointment = {
        id: Date.now(),
        date: values.date.format('YYYY-MM-DD'),
        time: values.time.format('HH:mm'),
        reason: values.reason,
        contactNumber: values.contactNumber || 'Not provided',
        status: 'pending',
        patientName: values.patientName
      };

      setAppointments([...appointments, newAppointment]);
      message.success('Appointment booked successfully!');
      setIsModalVisible(false);
      form.resetFields();
    } catch (error) {
      message.error('Failed to book appointment. Please try again.');
      console.error('Error:', error);
    }
  };

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>{isAdmin ? 'Manage Appointments' : 'My Appointments'}</h1>
        {!isAdmin && (
          <Button type="primary" onClick={showModal} icon={<FileTextOutlined />}>
            Book New Appointment
          </Button>
        )}
      </div>

      <Table 
        columns={columns} 
        dataSource={appointments} 
        rowKey="id"
        pagination={{ pageSize: 5 }}
        locale={{ emptyText: 'No appointments booked yet' }}
      />

      <Modal
        title={
          <>
            <FileTextOutlined /> Book New Appointment
          </>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={800}
        centered
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
                name="patientName"
                label="Patient Full Name"
                rules={[{ required: true, message: 'Please enter patient name' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="John Doe" 
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="contactNumber"
                label="Contact Number"
                rules={[{ pattern: /^[0-9+\- ]+$/, message: 'Please enter a valid phone number' }]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="+1 234 567 8900" 
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Appointment Date"
                rules={[{ required: true, message: 'Please select date' }]}
              >
                <DatePicker 
                  style={{ width: '100%' }}
                  suffixIcon={<CalendarOutlined />}
                  disabledDate={(current) => current && current < moment().startOf('day')}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Appointment Time"
                rules={[{ required: true, message: 'Please select time' }]}
              >
                <TimePicker
                  style={{ width: '100%' }}
                  format="h:mm a"
                  minuteStep={15}
                  suffixIcon={<ClockCircleOutlined />}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name="reason"
                label="Reason for Appointment"
                rules={[{ required: true, message: 'Please select reason' }]}
              >
                <Select
                  placeholder="Select appointment reason"
                  options={appointmentReasons}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col span={24}>
              <Form.Item
                name="appointmentType"
                label="Meeting Type"
                rules={[{ required: true, message: 'Please select reason' }]}
              >
                <Select
                  placeholder="Select appointment type"
                  options={appointmentTypes}
                />
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
              <Form.Item>
                <Button type="primary" htmlType="submit">
                  Book Appointment
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

export default Appointment;