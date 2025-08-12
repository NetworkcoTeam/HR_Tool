import React, { useState, useEffect, useCallback } from "react";
import moment from "moment";
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
  message,
  Alert,
  List,
  Typography,
} from "antd";
import {
  PhoneOutlined,
  FileTextOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import axios from "axios";
import "./Appointment.css";

const { Option } = Select;
const { Text } = Typography;

const Appointment = () => {
  const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/appointment`;

  const [appointments, setAppointments] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [userData, setUserData] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  const statusColors = {
    Pending: "orange",
    Accepted: "green",
    Rejected: "red",
    Cancelled: "gray",
  };

  const appointmentReasons = [
    "One-on-One Meeting",
    "Performance Review",
    "Complaint Resolution",
    "Contract Negotiation",
    "Other HR Matter",
  ];

  // Load user from localStorage and determine admin status
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
        setIsAdmin(user.role === "admin");
        console.log("User role:", user.role, "isAdmin:", user.role === "admin");
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

      const formattedData = response.data.map((item) => ({
        ...item,
        appointmentId: item.appointmentId || item.appointment_id,
        employeeId: item.employeeId || item.employee_id,
        employeeName: isAdmin
          ? `Employee ${item.employeeId}`
          : `${userData.name} ${userData.surname}`,
        appointmentDate: item.appointmentDate || item.appointment_date,
        startTime: item.startTime || item.start_time,
        endTime: item.endTime || item.end_time,
        contactNumber: item.contactNumber || item.contact_number,
        createdAt: item.createdAt || item.created_at,
      }));

      setAppointments(formattedData);
    } catch (error) {
      console.error("Error fetching appointments:", error);
      message.error("Failed to fetch appointments");
    } finally {
      setLoading(false);
    }
  }, [isAdmin, userData]);

  // Fetch occupied time slots for a specific date
  const fetchOccupiedSlots = useCallback(
    async (date) => {
      if (!date) return;

      try {
        setLoadingSlots(true);
        const dateStr = date.format("YYYY-MM-DD");
        const response = await axios.get(
          `${API_BASE_URL}/available-slots/${dateStr}`
        );

        setOccupiedSlots(response.data.occupiedSlots || []);
      } catch (error) {
        console.error("Error fetching occupied slots:", error);
        setOccupiedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    },
    [API_BASE_URL]
  );

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
        subject: "HR Meeting",
      });
    }
  }, [isModalVisible, userData, form]);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedDate(null);
    setOccupiedSlots([]);
    form.resetFields();
  };

  // Handle date selection change
  const handleDateChange = (date) => {
    setSelectedDate(date);
    if (date) {
      fetchOccupiedSlots(date);
    } else {
      setOccupiedSlots([]);
    }
  };

  const updateAppointmentStatus = async (appointmentId, status) => {
    try {
      await axios.put(`${API_BASE_URL}/status/${appointmentId}`, { status });
      message.success(`Appointment ${status.toLowerCase()}`);
      fetchAppointments();
    } catch (error) {
      console.error("Error updating status:", error);
      message.error("Failed to update status");
    }
  };

  const cancelAppointment = async (appointmentId) => {
    try {
      await axios.put(`${API_BASE_URL}/cancel/${appointmentId}`, {
        employeeId: userData?.employee_id,
      });
      message.success("Appointment cancelled");
      fetchAppointments();
    } catch (error) {
      console.error("Error cancelling appointment:", error);
      message.error("Failed to cancel appointment");
    }
  };

  const onFinish = async (values) => {
    try {
      // Get the date from the form
      const appointmentDate = values.date.format("YYYY-MM-DD");

      // Get the start time and end time
      const startTime = values.time[0].format("HH:mm:ss");
      const endTime = values.time[1].format("HH:mm:ss");

      // Combine date and time to create a full datetime object in local time (SAST)
      const startDateTimeLocal = moment(`${appointmentDate}T${startTime}`);
      const endDateTimeLocal = moment(`${appointmentDate}T${endTime}`);

      // Convert the local datetimes to UTC ISO 8601 strings
      const startDateTimeUTC = startDateTimeLocal.toISOString();
      const endDateTimeUTC = endDateTimeLocal.toISOString();

      const request = {
        employeeId: parseInt(userData.employee_id),
        subject: values.subject,
        description: values.description,
        appointmentDate: startDateTimeUTC,
        startTime: startTime,
        endTime: endTime,
        contactNumber: values.contactNumber?.toString() || "",
        status: "Pending",
      };

      console.log("Submitting appointment:", request);
      await axios.post(API_BASE_URL, request);
      message.success("Appointment booked successfully!");
      setIsModalVisible(false);
      setSelectedDate(null);
      setOccupiedSlots([]);
      form.resetFields();
      fetchAppointments();
    } catch (error) {
      console.error("Error booking appointment:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to book appointment";

      if (error.response?.data?.details?.includes("Time slot not available")) {
        message.error({
          content: errorMessage,
          duration: 10,
        });
      } else {
        message.error(errorMessage);
      }
    }
  };

  // Helper function to check if a time range conflicts with occupied slots
  const hasTimeConflict = (selectedRange) => {
    if (!selectedRange || selectedRange.length !== 2 || !occupiedSlots.length)
      return false;
  
    const [selectedStart, selectedEnd] = selectedRange; // Extract from selectedRange
    const startTime = selectedStart.format('HH:mm');    // Format to get time string
    const endTime = selectedEnd.format('HH:mm');        // Format to get time string
  
    return occupiedSlots.some((slot) => {
      const slotStart = moment(slot.startTime, "HH:mm");
      const slotEnd = moment(slot.endTime, "HH:mm");
      const selectedStartMoment = moment(startTime, "HH:mm"); 
      const selectedEndMoment = moment(endTime, "HH:mm");     
  
      // Add 15-minute buffer
      const bufferStartMoment = selectedStartMoment
        .clone()
        .subtract(15, "minutes");
      const bufferEndMoment = selectedEndMoment.clone().add(15, "minutes");
  
      // Check for overlap
      return !(
        bufferEndMoment.isSameOrBefore(slotStart) ||
        bufferStartMoment.isSameOrAfter(slotEnd)
      );
    });
  };

  const columns = [
    {
      title: "Employee",
      key: "employee",
      render: (_, record) => (
        <span>
          {record.employeeName || "N/A"} (ID: {record.employeeId})
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "appointmentDate",
      key: "appointmentDate",
      render: (date) => moment(date).format("LL"),
      sorter: (a, b) =>
        new Date(a.appointmentDate) - new Date(b.appointmentDate),
    },
    {
      title: "Time",
      key: "time",
      render: (_, record) => `${record.startTime} - ${record.endTime}`,
    },
    {
      title: "Title",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Purpose",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={statusColors[status] || "default"}>
          {status.toUpperCase()}
        </Tag>
      ),
      filters: [
        { text: "Pending", value: "Pending" },
        { text: "Accepted", value: "Accepted" },
        { text: "Rejected", value: "Rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    ...(isAdmin
      ? [
          {
            title: "Contact",
            dataIndex: "contactNumber",
            key: "contactNumber",
          },
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <div>
                <Button
                  type="link"
                  onClick={() =>
                    updateAppointmentStatus(record.appointmentId, "Accepted")
                  }
                  disabled={record.status !== "Pending"}
                  style={{ color: "green" }}
                >
                  Accept
                </Button>
                <Button
                  type="link"
                  onClick={() =>
                    updateAppointmentStatus(record.appointmentId, "Rejected")
                  }
                  disabled={record.status !== "Pending"}
                  danger
                >
                  Reject
                </Button>
              </div>
            ),
          },
        ]
      : [
          {
            title: "Action",
            key: "action",
            render: (_, record) => (
              <Button
                type="link"
                onClick={() => cancelAppointment(record.appointmentId)}
                disabled={record.status !== "Pending"}
                danger
              >
                Cancel
              </Button>
            ),
          },
        ]),
  ];

  return (
    <div className="appointments-container">
      <div className="appointments-header">
        <h1>{isAdmin ? "HR Appointments Dashboard" : "My HR Appointments"}</h1>
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
          showSizeChanger: false,
        }}
        locale={{
          emptyText: "No appointments found",
        }}
        scroll={{ x: true }}
      />

      <Modal
        title="Book HR Appointment"
        visible={isModalVisible}
        onCancel={handleCancel}
        footer={null}
        width={900}
        centered
        destroyOnClose
      >
        <Alert
          message="Appointment Booking Guidelines"
          description="Please maintain at least 15 minutes between appointments. Check existing bookings before selecting your time slot."
          type="info"
          showIcon
          icon={<ClockCircleOutlined />}
          style={{ marginBottom: 20 }}
        />

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
              <Form.Item name="employeeId" label="Employee ID">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="empName" label="Employee Name">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="subject"
                label="Meeting Title"
                rules={[
                  { required: true, message: "Please enter meeting title" },
                ]}
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
                    message: "Please enter a valid 10-digit phone number",
                  },
                ]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="0810123987"
                  inputMode="numeric"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            <Col span={12}>
              <Form.Item
                name="date"
                label="Meeting Date"
                rules={[{ required: true, message: "Please select date" }]}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  disabledDate={(current) =>
                    current && current < moment().startOf("day")
                  }
                  onChange={handleDateChange}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="time"
                label="Meeting Time"
                rules={[
                  { required: true, message: "Please select time range" },
                  {
                    validator: (_, value) => {
                      if (value && hasTimeConflict(value)) {
                        return Promise.reject(
                          new Error(
                            "Selected time conflicts with existing appointments (including 15-min buffer)"
                          )
                        );
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <TimePicker.RangePicker
                  style={{ width: "100%" }}
                  format="h:mm a"
                  minuteStep={15}
                  disabledTime={(current) => {
                    const hour = current?.hour() || 0;
                    return {
                      disabledHours: () => {
                        const disabled = [];
                        for (let i = 0; i < 24; i++) {
                          if (i < 8 || i > 17) {
                            disabled.push(i);
                          }
                        }
                        return disabled;
                      },
                      disabledMinutes: () => [],
                      disabledSeconds: () => [],
                    };
                  }}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Show occupied slots when date is selected */}
          {selectedDate && (
            <Row>
              <Col span={24}>
                <Form.Item label="Existing Appointments for Selected Date">
                  {loadingSlots ? (
                    <div>Loading existing appointments...</div>
                  ) : occupiedSlots.length > 0 ? (
                    <div>
                      <Alert
                        message="Occupied Time Slots"
                        description="The following time slots are already booked. Please select a time with at least 15 minutes gap."
                        type="warning"
                        showIcon
                        icon={<ExclamationCircleOutlined />}
                        style={{ marginBottom: 10 }}
                      />
                      <List
                        size="small"
                        dataSource={occupiedSlots}
                        renderItem={(slot, index) => (
                          <List.Item key={index}>
                            <Text strong>
                              {slot.startTime} - {slot.endTime}
                            </Text>
                            <Text type="secondary" style={{ marginLeft: 10 }}>
                              {slot.subject}
                            </Text>
                          </List.Item>
                        )}
                        style={{
                          background: "#fafafa",
                          padding: "10px",
                          borderRadius: "6px",
                          maxHeight: "150px",
                          overflowY: "auto",
                        }}
                      />
                    </div>
                  ) : (
                    <Alert
                      message="No existing appointments"
                      description="This date has no existing appointments. You can book any time slot during business hours (8:00 AM - 6:00 PM)."
                      type="success"
                      showIcon
                    />
                  )}
                </Form.Item>
              </Col>
            </Row>
          )}

          <Row>
            <Col span={24}>
              <Form.Item
                name="description"
                label="Meeting Reason"
                rules={[{ required: true, message: "Please select a reason" }]}
              >
                <Select placeholder="Select a reason for the meeting">
                  {appointmentReasons.map((reason) => (
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
              <Button onClick={handleCancel}>Cancel</Button>
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
