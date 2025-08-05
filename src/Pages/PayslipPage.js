import React, { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Button,
  List,
  Spin,
  message,
  Empty,
  Modal,
  Input,
  Row,
  Col,
  Space,
  Typography,
  Divider,
  Tooltip
} from 'antd';
import {
  FilePdfOutlined,
  EyeOutlined,
  SearchOutlined,
  DownloadOutlined,
  CalendarOutlined,
  DollarOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import moment from 'moment';

import Sidebar from '../Components/Sidebar';
import './Home.css';

const API_BASE = 'http://localhost:5143';
const { Content } = Layout;
const { Title, Text } = Typography;

const Payslips = () => {
  const [loading, setLoading] = useState(true);
  const [payslipData, setPayslipData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [currentPayslipDetails, setCurrentPayslipDetails] = useState(null);
  const [employeeId, setEmployeeId] = useState(null);
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.employee_id) {
          setEmployeeId(parsed.employee_id);
        }
      } catch (err) {
        console.error("Failed to parse localStorage user:", err);
      }
    }
  }, []);

  const parseDate = (dateStr) => {
    if (!dateStr) return new Date();
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const fetchAllPayslips = async (empId) => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/Payslips/employee/${empId}/payslips`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const { success, payslips, error } = await res.json();
      if (!success) return message.error(error || 'Failed to load payslips');

      const processed = payslips.map(p => {
        const end = parseDate(p.periodEnd);
        const start = parseDate(p.periodStart);
        return {
          ...p,
          MonthName: end.toLocaleString('default', { month: 'long' }),
          MonthNumber: end.getMonth() + 1,
          Year: end.getFullYear(),
          FormattedPeriodEnd: end.toLocaleDateString('en-US'),
          FormattedPeriodStart: start.toLocaleDateString('en-US'),
          RawPeriodEnd: end,
          RawPeriodStart: start
        };
      }).sort((a, b) => b.RawPeriodEnd - a.RawPeriodEnd);

      setPayslipData(processed);
      setFilteredData(processed);
    } catch (err) {
      console.error(err);
      setError('Failed to load payslips');
      message.error('Failed to load payslips: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleViewPayslip = async (year, month) => {
    try {
      message.loading('Fetching payslip details...', 0);
      const res = await fetch(`${API_BASE}/api/Payslips/view/${employeeId}/${year}/${month}`);
      const result = await res.json();
      message.destroy();
      if (result.success && result.payslip) {
        setCurrentPayslipDetails(result.payslip);
        setIsModalVisible(true);
      } else {
        message.error(result.error || 'No payslip data available');
      }
    } catch (err) {
      message.destroy();
      message.error(err.message);
    }
  };

  const handleDownloadPayslip = async (year, month) => {
    try {
      message.loading('Preparing download...', 0);
      const res = await fetch(`${API_BASE}/api/Payslips/download/${employeeId}/${year}/${month}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Payslip_${month}_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.destroy();
      message.success('Payslip downloaded successfully!');
    } catch (err) {
      message.destroy();
      message.error('Download failed: ' + err.message);
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    setCurrentPayslipDetails(null);
  };

  // Filter functions
  const applyFilters = () => {
    let filtered = [...payslipData];

    if (searchText) {
      filtered = filtered.filter(item => 
        item.MonthName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.Year.toString().includes(searchText)
      );
    }

    setFilteredData(filtered);
  };

  const clearFilters = () => {
    setSearchText('');
    setFilteredData(payslipData);
  };

  useEffect(() => {
    if (employeeId) {
      fetchAllPayslips(employeeId);
    }
  }, [employeeId]);

  useEffect(() => {
    applyFilters();
  }, [searchText, payslipData]);

  if (error) {
    return (
      <Layout style={{ minHeight: '100vh' }}>
        <Sidebar />
        <Content className="error-content">
          <div className="error-state">
            <ExclamationCircleOutlined style={{ fontSize: '48px', color: '#ff4d4f' }} />
            <h2>Unable to load payslips</h2>
            <p>{error}</p>
            <Button onClick={() => window.location.reload()}>Retry</Button>
          </div>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar />
      <Layout className="site-layout">
        <Content className="home-content">
          {/* Header */}
          <div className="dashboard-header">
            <Row justify="space-between" align="middle">
              <Col>
                <Title level={2} style={{ margin: 0 }}>
                  <DollarOutlined style={{ marginRight: 8 }} />
                  My Payslips
                </Title>
              </Col>
              <Col>
                <Text type="secondary">
                  Total: {filteredData.length} payslip{filteredData.length !== 1 ? 's' : ''}
                </Text>
              </Col>
            </Row>
          </div>

          <Divider />

          {loading ? (
            <div className="loading-state">
              <Spin size="large" />
              <p>Loading payslips...</p>
            </div>
          ) : (
            <div>
              {/* Filters */}
              <Card style={{ marginBottom: 24 }}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} sm={12} md={6}>
                    <Input
                      placeholder="Search by month or year"
                      prefix={<SearchOutlined />}
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      allowClear
                    />
                  </Col>
                  <Col xs={24} sm={12} md={4}>
                    <Button onClick={clearFilters} style={{ width: '100%' }}>
                      Clear Filters
                    </Button>
                  </Col>
                </Row>
              </Card>

              {/* Payslips List */}
              <Card className="dashboard-card">
                <Spin spinning={loading}>
                  {filteredData.length > 0 ? (
                    <List
                      itemLayout="horizontal"
                      dataSource={filteredData}
                      pagination={{
                        pageSize: 10,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                          `${range[0]}-${range[1]} of ${total} payslips`,
                      }}
                      renderItem={item => (
                        <List.Item
                          actions={[
                            <Tooltip title="View Details">
                              <Button 
                                icon={<EyeOutlined />} 
                                type="link" 
                                onClick={() => handleViewPayslip(item.Year, item.MonthNumber)}
                              >
                                View
                              </Button>
                            </Tooltip>,
                            <Tooltip title="Download PDF">
                              <Button 
                                icon={<DownloadOutlined />} 
                                onClick={() => handleDownloadPayslip(item.Year, item.MonthNumber)}
                              >
                                Download
                              </Button>
                            </Tooltip>
                          ]}
                        >
                          <List.Item.Meta
                            avatar={<FilePdfOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                            title={
                              <Space>
                                <Text strong>{item.MonthName} {item.Year}</Text>
                                {item.netSalary && (
                                  <Text type="success" strong>
                                    R{item.netSalary.toFixed(2)}
                                  </Text>
                                )}
                              </Space>
                            }
                            description={
                              <div>
                                <div>
                                  <CalendarOutlined style={{ marginRight: 4 }} />
                                  Pay Period: {item.FormattedPeriodStart} - {item.FormattedPeriodEnd}
                                </div>
                                {item.generatedDate && (
                                  <div style={{ marginTop: 4 }}>
                                    <Text type="secondary">
                                      Generated: {new Date(item.generatedDate).toLocaleDateString()}
                                    </Text>
                                  </div>
                                )}
                              </div>
                            }
                          />
                        </List.Item>
                      )}
                    />
                  ) : (
                    <Empty 
                      description={
                        payslipData.length === 0 
                          ? "No payslips available" 
                          : "No payslips match your filters"
                      }
                      style={{ padding: '50px 0' }}
                    >
                      {payslipData.length > 0 && (
                        <Button onClick={clearFilters}>Clear Filters</Button>
                      )}
                    </Empty>
                  )}
                </Spin>
              </Card>
            </div>
          )}

          {/* Payslip Details Modal */}
          <Modal 
            title={
              <Space>
                <FilePdfOutlined />
                Payslip Details
              </Space>
            }
            open={isModalVisible} 
            onCancel={handleModalCancel} 
            footer={[
              <Button key="close" onClick={handleModalCancel}>
                Close
              </Button>
            ]}
            width={600}
          >
            {currentPayslipDetails ? (
              <div>
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Employee Name:</Text>
                    <br />
                    <Text>{currentPayslipDetails.employeeName}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Position:</Text>
                    <br />
                    <Text>{currentPayslipDetails.position}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Period:</Text>
                    <br />
                    <Text>{currentPayslipDetails.period}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Generated Date:</Text>
                    <br />
                    <Text>{currentPayslipDetails.generatedDate}</Text>
                  </Col>
                </Row>
                
                <Divider />
                
                <Row gutter={[16, 16]}>
                  <Col span={12}>
                    <Text strong>Basic Salary:</Text>
                    <br />
                    <Text type="success">R{(currentPayslipDetails.basicSalary || 0).toFixed(2)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Tax Amount:</Text>
                    <br />
                    <Text type="danger">R{(currentPayslipDetails.taxAmount || 0).toFixed(2)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>UIF:</Text>
                    <br />
                    <Text type="warning">R{(currentPayslipDetails.uif || 0).toFixed(2)}</Text>
                  </Col>
                  <Col span={12}>
                    <Text strong>Net Salary:</Text>
                    <br />
                    <Text strong type="success" style={{ fontSize: '16px' }}>
                      R{(currentPayslipDetails.netSalary || 0).toFixed(2)}
                    </Text>
                  </Col>
                </Row>
              </div>
            ) : (
              <Empty description="No payslip details available" />
            )}
          </Modal>
        </Content>
      </Layout>
    </Layout>
  );
};

export default Payslips;
