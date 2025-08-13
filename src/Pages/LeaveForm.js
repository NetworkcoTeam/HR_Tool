import React, { useState, useEffect, useCallback } from "react";
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
  message,
  Table,
  Tag,
  Modal,
} from "antd";
import {
  UploadOutlined,
  UserOutlined,
  IdcardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import Sidebar from "../Components/Sidebar";
import "./LeaveForm.css";
import moment from "moment";

const { Content } = Layout;

const Leave = () => {
  const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/LeaveRequest`;
  const [form] = Form.useForm();
  const [leaveType, setLeaveType] = useState("");
  const [userData, setUserData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);

  const statusColors = {
    pending: "orange",
    approved: "green",
    rejected: "red",
    cancelled: "gray",
  };

  const leaveTypes = [
    { label: "Unpaid", value: "unpaid" },
    { label: "Maternity", value: "maternity" },
    { label: "Paternity", value: "paternity" },
    { label: "Sick", value: "sick" },
    { label: "Annual", value: "annual" },
    { label: "Family Responsibility", value: "family" },
    { label: "Other", value: "other" },
  ];

  // Load user data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setUserData(user);
      } catch (error) {
        console.error("Failed to parse user data:", error);
      }
    }
  }, []);

  // Pre-fill form when modal opens
  useEffect(() => {
    if (isModalVisible && userData) {
      form.setFieldsValue({
        name: userData.name,
        surname: userData.surname,
        employeeId: userData.employee_id,
      });
    }
  }, [isModalVisible, userData, form]);

  // Fetch all leave requests
  const fetchLeaveRequests = useCallback(async () => {
    if (!userData || !userData.employee_id) return;

    try {
      setLoading(true);
      const response = await fetch(
        `${API_BASE_URL}/employee/${userData.employee_id}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();
      const formatted = data
        .map((r) => ({
          ...r,
          id: r.id,
          type: r.typeOfLeave || "Leave",
          status: r.status?.toLowerCase() || "pending",
          days:
            r.totalDays ||
            Math.ceil(
              (new Date(r.leaveEnd) - new Date(r.leaveStart)) / 86400000
            ) + 1,
          startDate: new Date(r.leaveStart).toLocaleDateString(),
          endDate: new Date(r.leaveEnd).toLocaleDateString(),
          rawStartDate: new Date(r.leaveStart),
          createdAt: new Date(r.createdAt).toLocaleDateString(),
        }))
        .sort((a, b) => b.rawStartDate - a.rawStartDate);

      setLeaveRequests(formatted);
    } catch (error) {
      console.error("Error fetching leave requests:", error);
      message.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  }, [userData]);

  useEffect(() => {
    if (userData) {
      fetchLeaveRequests();
    }
  }, [userData, fetchLeaveRequests]);

  const showModal = () => setIsModalVisible(true);

  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
    setLeaveType("");
  };

  const onFinish = async (values) => {
    try {
      // Format selected dates with a default time (09:00 SAST)
      const startDateTimeLocal = moment(
        `${values.leaveStart.format("YYYY-MM-DD")}T09:00:00`
      );
      const endDateTimeLocal = moment(
        `${values.leaveEnd.format("YYYY-MM-DD")}T09:00:00`
      );

      const totalDays =
        Math.ceil(endDateTimeLocal.diff(startDateTimeLocal, "days")) + 1;

      const doctorsLetterName =
        values.doctorsLetter?.[0]?.originFileObj?.name ||
        values.doctorsLetter?.[0]?.name ||
        "";
      const funeralLetterName =
        values.funeralLetter?.[0]?.originFileObj?.name ||
        values.funeralLetter?.[0]?.name ||
        "";

      const payload = {
        Name: values.name || userData?.name || "",
        Surname: values.surname || userData?.surname || "",
        EmployeeId: String(values.employeeId || userData?.employee_id || ""),
        Position: values.position || userData?.position || "",
        Department: values.department || userData?.department || "",
        LeaveStart: startDateTimeLocal.toISOString(),
        LeaveEnd: endDateTimeLocal.toISOString(),
        TotalDays: totalDays,
        TypeOfLeave: values.leaveType || "",
        Status: "Pending",
        OtherDetails: values.otherLeaveType || "N/A",
        DoctorsLetter: doctorsLetterName,
        FuneralLetter: funeralLetterName,
        CreatedAt: new Date().toISOString(),
      };

      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit leave request");
      }

      const result = await response.json();
      message.success(
        result.message || "Leave request submitted successfully!"
      );
      setIsModalVisible(false);
      form.resetFields();
      setLeaveType("");
      fetchLeaveRequests();
    } catch (error) {
      console.error("Error submitting form:", error);
      message.error(error.message || "Failed to submit leave request");
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) return e;
    return e && e.fileList;
  };

  const columns = [
    {
      title: "Leave Type",
      dataIndex: "type",
      key: "type",
      render: (type) => type.charAt(0).toUpperCase() + type.slice(1),
    },
    {
      title: "Start Date",
      dataIndex: "startDate",
      key: "startDate",
      sorter: (a, b) => a.rawStartDate - b.rawStartDate,
    },
    {
      title: "End Date",
      dataIndex: "endDate",
      key: "endDate",
    },
    {
      title: "Total Days",
      dataIndex: "days",
      key: "days",
      render: (days) => `${days} ${days === 1 ? "day" : "days"}`,
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
        { text: "Pending", value: "pending" },
        { text: "Approved", value: "approved" },
        { text: "Rejected", value: "rejected" },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: "Applied Date",
      dataIndex: "createdAt",
      key: "createdAt",
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sidebar />
      <Layout className="site-layout">
        <Content style={{ margin: "24px 16px", padding: 24 }}>
          <div className="leave-requests-container">
            <div className="leave-header">
              <h1>
                <FileTextOutlined /> My Leave Requests
              </h1>
              <Button
                type="primary"
                onClick={showModal}
                icon={<PlusOutlined />}
                size="large"
              >
                Apply for Leave
              </Button>
            </div>

            <Divider />

            <Table
              columns={columns}
              dataSource={leaveRequests}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showQuickJumper: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} leave requests`,
              }}
              locale={{
                emptyText: "No leave requests found",
              }}
              scroll={{ x: true }}
            />

            <Modal
              title="Apply for Leave"
              visible={isModalVisible}
              onCancel={handleCancel}
              footer={null}
              width={900}
              centered
              destroyOnClose
            >
              <Divider />
              <Form
                form={form}
                name="leaveForm"
                onFinish={onFinish}
                layout="vertical"
                size="large"
              >
                <Row gutter={24}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Name"
                      rules={[
                        { required: true, message: "Please input your name!" },
                      ]}
                    >
                      <Input
                        prefix={<UserOutlined />}
                        placeholder="Enter your name"
                        disabled={!!userData?.name}
                      />
                    </Form.Item>

                    <Form.Item
                      name="employeeId"
                      label="Employee ID"
                      rules={[
                        {
                          required: true,
                          message: "Please input your employee ID!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<IdcardOutlined />}
                        placeholder="Enter employee ID"
                        disabled={!!userData?.employee_id}
                      />
                    </Form.Item>

                    <Form.Item
                      name="position"
                      label="Position"
                      rules={[
                        {
                          required: true,
                          message: "Please input your position!",
                        },
                      ]}
                    >
                      <Input placeholder="Enter your position" />
                    </Form.Item>

                    <Form.Item
                      name="leaveStart"
                      label="Leave Start Date"
                      rules={[
                        {
                          required: true,
                          message: "Please select start date!",
                        },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        suffixIcon={<CalendarOutlined />}
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      name="surname"
                      label="Surname"
                      rules={[
                        {
                          required: true,
                          message: "Please input your surname!",
                        },
                      ]}
                    >
                      <Input
                        placeholder="Enter your surname"
                        disabled={!!userData?.surname}
                      />
                    </Form.Item>

                    <Form.Item
                      name="department"
                      label="Department"
                      rules={[
                        {
                          required: true,
                          message: "Please input your department!",
                        },
                      ]}
                    >
                      <Input
                        prefix={<TeamOutlined />}
                        placeholder="Enter department"
                      />
                    </Form.Item>

                    <Form.Item
                      name="leaveEnd"
                      label="Leave End Date"
                      rules={[
                        { required: true, message: "Please select end date!" },
                      ]}
                    >
                      <DatePicker
                        style={{ width: "100%" }}
                        suffixIcon={<CalendarOutlined />}
                      />
                    </Form.Item>

                    <Form.Item name="totalDays" label="Total Days">
                      <Input
                        disabled
                        placeholder="Will be calculated automatically"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider orientation="left">Leave Details</Divider>

                <Form.Item
                  name="leaveType"
                  label="Type of Leave"
                  rules={[
                    { required: true, message: "Please select leave type!" },
                  ]}
                >
                  <Radio.Group
                    options={leaveTypes}
                    onChange={(e) => setLeaveType(e.target.value)}
                    optionType="button"
                    buttonStyle="solid"
                  />
                </Form.Item>

                {leaveType === "other" && (
                  <Form.Item
                    name="otherLeaveType"
                    label="Please specify leave type"
                    rules={[
                      { required: true, message: "Please specify leave type!" },
                    ]}
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

                <Divider />

                <Row justify="end" gutter={16}>
                  <Col>
                    <Button onClick={handleCancel}>Cancel</Button>
                  </Col>
                  <Col>
                    <Button type="primary" htmlType="submit">
                      Submit Application
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Modal>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Leave;
