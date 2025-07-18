import React from 'react';
import { 
  Layout, 
  Card, 
  Button, 
  Divider,
  Tag,
  Table,
  Select,
  DatePicker
} from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import './PayslipGenerator.css';

const { Content } = Layout;
const { Option } = Select;

const PayslipGenerator = () => {
  const [payDate, setPayDate] = React.useState(null);
  const [employeePosition, setEmployeePosition] = React.useState('intern');

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Surname',
      dataIndex: 'surname',
      key: 'surname',
    },
    {
      title: 'Position',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: 'Worked Hours',
      dataIndex: 'workedHours',
      key: 'workedHours',
    },
    {
      title: 'Deductions',
      dataIndex: 'deductions',
      key: 'deductions',
    },
    {
      title: 'Pay Date',
      dataIndex: 'payDate',
      key: 'payDate',
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
    },
  ];

  const handleDateChange = (date) => {
    setPayDate(date);
  };

  const handlePositionChange = (value) => {
    setEmployeePosition(value);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#F5EDED' }}>
      <Layout className="site-layout">
        <Content className="payslip-content">
          <div className="payslip-header">
            <h1 className="payslip-main-title">Payslip</h1>
            <div className="current-date">
              <CalendarOutlined /> {new Date().toLocaleDateString()}
            </div>
          </div>

          <Divider />

          <Card 
            title="Payslip & Employee Details" 
            className="payslip-card"
            headStyle={{ color: '#161C70', fontWeight: 'bold' }}
          >
            <div className="details-row">
              <Card 
                title="Payslip Details" 
                className="detail-card"
                headStyle={{ color: '#161C70', fontWeight: 'bold' }}
              >
                <div className="detail-item">
                  <span className="detail-label">Pay Date:</span>
                  <DatePicker
                    style={{ width: '100%', maxWidth: '200px' }}
                    onChange={handleDateChange}
                    value={payDate}
                    className="date-picker"
                  />
                </div>
                
              </Card>

              <Card 
                title="Employee Details" 
                className="detail-card"
                headStyle={{ color: '#161C70', fontWeight: 'bold' }}
              >
                <div className="detail-item">
                  <span className="detail-label">Employee Position:</span>
                  <Select
                    value={employeePosition}
                    style={{ width: '100%', maxWidth: '200px' }}
                    onChange={handlePositionChange}
                    className="position-select"
                  >
                    <Option value="intern">Intern</Option>
                    <Option value="management">Management</Option>
                    <Option value="hr">HR</Option>
                  </Select>
                </div>
              </Card>
            </div>

            <div className="action-button-container">
              <Button 
                type="primary" 
                className="generate-button"
                style={{ backgroundColor: '#161C70', borderColor: '#161C70' }}
              >
                Generate Payslip
              </Button>
            </div>
          </Card>

          <Card 
            title="Slip Details" 
            className="payslip-card"
            headStyle={{ color: '#161C70', fontWeight: 'bold' }}
          >
            <Table 
              columns={columns} 
              dataSource={[]}
              className="slip-details-table"
              bordered
            />
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default PayslipGenerator;