import React, { useState, useEffect } from "react";
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
  Alert,
} from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  TeamOutlined,
  CalendarOutlined,
  FileTextOutlined,
  SearchOutlined,
  SaveOutlined,
} from "@ant-design/icons";
import AdminSidebar from "./AdminSidebar";
import "./HRAdminForm.css";

const { Content } = Layout;
const { Option } = Select;

const HrAdminForm = () => {
  const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}/HrAdmin`;

  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);
  const [searchIdNumber, setSearchIdNumber] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);

  const [statusMessage, setStatusMessage] = useState({
    success: null,
    message: "",
  });

  // Check if user is admin on component mount
  useEffect(() => {
    const checkAdminStatus = () => {
      try {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user && user.role === "admin") {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAdminStatus();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/user/${searchIdNumber}`);
      const data = await response.json();

      if (response.ok) {
        setErrorMessage(null);
        setUserData(data);
        form.setFieldsValue({
          employeeFirstName: data.name,
          employeeLastName: data.surname,
          userIdNumber: searchIdNumber,
          role: data.role || "employee",
        });
        setStatusMessage({
          success: true,
          message: "Employee found! Please complete the form",
        });
      } else {
        const errorMsg = data.status || "Employee not found";
        setErrorMessage(errorMsg);
        setUserData(null);
        form.resetFields();
        setStatusMessage({
          success: false,
          message: errorMsg,
        });
      }
    } catch (error) {
      setStatusMessage({
        success: false,
        message: "Error fetching employee data",
      });
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      setStatusMessage({ success: null, message: "" });

      const requestData = {
        userIdNumber: values.userIdNumber,
        employeeFirstName: values.employeeFirstName,
        employeeLastName: values.employeeLastName,
        employeePosition: values.position,
        department: values.department,
        contractType: values.contractType,
        contractStartDate: values.startDate.format("YYYY-MM-DD"),
        contractEndDate: values.endDate?.format("YYYY-MM-DD"),
        basicSalary: values.basicSalary,
        contractTerms: values.terms,
      };

      const response = await fetch(`${API_BASE_URL}/admit-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (response.ok) {
        setStatusMessage({
          success: true,
          message: "Employee admitted successfully!",
        });
        form.resetFields();
        setUserData(null);
        setSearchIdNumber("");
      } else {
        setStatusMessage({
          success: false,
          message: result.message || "Failed to admit employee",
        });
      }
    } catch (error) {
      setStatusMessage({
        success: false,
        message: "Error submitting form. Please try again.",
      });
      console.error("Submission error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <AdminSidebar />
        <Content style={{ margin: "0 16px" }}>
          <Spin size="large" />
        </Content>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout style={{ minHeight: "100vh" }}>
        <AdminSidebar />
        <Content style={{ margin: "0 16px" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
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
    <Layout style={{ minHeight: "100vh" }}>
      <AdminSidebar />
      <Layout className="site-layout">
        <Content style={{ margin: "0 16px" }}>
          <div
            className="site-layout-background"
            style={{ padding: 24, minHeight: 360 }}
          >
            <Card title="HR Admin - Employee Admission" bordered={false}>
              {statusMessage.message && (
                <div
                  className={`status-message ${
                    statusMessage.success ? "success" : "error"
                  }`}
                >
                  {statusMessage.message}
                </div>
              )}
              <Row gutter={16}>
                <Col span={24}>
                  <div style={{ marginBottom: 16 }}>
                    <Input.Search
                      placeholder="Enter ID Number to search"
                      enterButton={
                        <>
                          <SearchOutlined /> Search
                        </>
                      }
                      size="large"
                      value={searchIdNumber}
                      onChange={(e) => {
                        setSearchIdNumber(e.target.value);
                        setErrorMessage(null); // Clear error if user types again
                      }}
                      onSearch={fetchUserData}
                      disabled={loading}
                    />

                    {/* Show error message below the search input */}
                    {errorMessage && (
                      <Alert
                        message="Error"
                        description={errorMessage}
                        type="error"
                        showIcon
                        style={{ marginTop: "12px" }}
                      />
                    )}
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
                    contractType: "Permanent",
                    isActive: true,
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="userIdNumber"
                        label="ID Number"
                        rules={[
                          {
                            required: true,
                            message: "Please input ID number!",
                          },
                        ]}
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
                        rules={[
                          {
                            required: true,
                            message: "Please input first name!",
                          },
                        ]}
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
                        rules={[
                          {
                            required: true,
                            message: "Please input last name!",
                          },
                        ]}
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
                        rules={[
                          {
                            required: true,
                            message: "Please select position!",
                          },
                        ]}
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

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name="department"
                        label="Department"
                        rules={[
                          {
                            required: true,
                            message: "Please select department!",
                          },
                        ]}
                      >
                        <Select placeholder="Select department">
                          <Option value="IT">IT</Option>
                          <Option value="HR">HR</Option>
                          <Option value="Marketing">Marketing</Option>
                          <Option value="Finance">Finance</Option>
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
                        rules={[
                          {
                            required: true,
                            message: "Please select contract type!",
                          },
                        ]}
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
                        rules={[
                          {
                            required: true,
                            message: "Please select start date!",
                          },
                        ]}
                      >
                        <DatePicker
                          style={{ width: "100%" }}
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
                          style={{ width: "100%" }}
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
                        rules={[
                          {
                            required: true,
                            message: "Please input basic salary!",
                          },
                        ]}
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
                      <Form.Item name="terms" label="Contract Terms">
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
