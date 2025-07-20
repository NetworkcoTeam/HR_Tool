import React, { useState } from 'react'; 
 import {  
  Layout,  
  Card,  
  Button,  
  Divider, 
  Table, 
  Select, 
  DatePicker, 
  Input, 
  message, 
  Spin 
 } from 'antd'; 
 import { CalendarOutlined } from '@ant-design/icons'; 
 import axios from 'axios'; 
 import './PayslipGenerator.css'; 

 const { Content } = Layout; 
 const { Option } = Select; 

 const PayslipGenerator = () => { 
  const [payDate, setPayDate] = useState(null); 
  const [employeePosition, setEmployeePosition] = useState(''); 
  const [employeeId, setEmployeeId] = useState(''); 
  const [payslipData, setPayslipData] = useState([]); 
  const [loading, setLoading] = useState(false); 

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
    title: 'Employee ID', 
    dataIndex: 'employeeId', 
    key: 'employeeId', 
  }, 
  { 
    title: 'Employee Position', 
    dataIndex: 'position', 
    key: 'position', 
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
  ]; 

  const handleDateChange = (date) => { 
  setPayDate(date); 
  }; 

  const handlePositionChange = (value) => { 
  setEmployeePosition(value); 
  }; 

  const handleEmployeeIdChange = (e) => { 
  setEmployeeId(e.target.value); 
  }; 

  const handleGeneratePayslip = async () => { 
  if (!payDate) { 
    message.error('Please select a pay date'); 
    return; 
  } 

  setLoading(true); 
   
  try { 
    const requestData = { 
      month: payDate.month() + 1, 
      year: payDate.year(), 
      payDate: payDate.format('YYYY-MM-DD'), 
      ...(employeeId && { employeeId: parseInt(employeeId) }), 
      ...(employeePosition && { position: employeePosition }) 
    }; 

    const response = await axios.post('http://localhost:5143/api/payslips/generate', requestData); 
     
    if (response.data.success) { 
      const generatedPayslips = response.data.employees.map((employee, index) => ({ 
        key: index, 
        name: employee.name, 
        surname: employee.surname, 
        employeeId: employee.employeeId || 'N/A', 
        position: employee.position || 'N/A', 
        deductions: 'UIF, PAYE TAX', 
        payDate: payDate.format('DD/MM/YYYY'), 
      })); 
       
      setPayslipData(generatedPayslips); 
      message.success(`Successfully generated ${response.data.count} payslip(s)`); 
    } else { 
      message.error('Failed to generate payslips'); 
    } 
  } catch (error) { 
    console.error('Error generating payslips:', error); 
    message.error(error.response?.data?.error || 'Failed to generate payslips. Please check the API endpoint.'); 
  } finally { 
    setLoading(false); 
  } 
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
          style={{ header: { color: '#161C70', fontWeight: 'bold' } }} 
        > 
          <div className="details-row"> 
            <Card  
              title="Payslip Details"  
              className="detail-card" 
              style={{ header: { color: '#161C70', fontWeight: 'bold' } }} 
            > 
              <div className="detail-item"> 
                <span className="detail-label">Pay Date:</span> 
                <DatePicker 
                  style={{ width: '100%', maxWidth: '200px' }} 
                  onChange={handleDateChange} 
                  value={payDate} 
                  className="date-picker" 
                  format="DD/MM/YYYY" 
                /> 
              </div> 
            </Card> 

            <Card  
              title="Employee Details"  
              className="detail-card" 
              style={{ header: { color: '#161C70', fontWeight: 'bold' } }} 
            > 
              <div className="detail-item"> 
                <span className="detail-label">Employee Position:</span> 
                <Select 
                  value={employeePosition} 
                  style={{ width: '100%', maxWidth: '200px', marginBottom: '10px' }} 
                  onChange={handlePositionChange} 
                  className="position-select" 
                  allowClear 
                  placeholder="Select position or leave blank for all" 
                > 
                  <Option value="">All Employees</Option> 
                  <Option value="intern">Intern</Option> 
                  <Option value="manager">Management</Option> 
                  <Option value="hr">HR</Option> 
                  <Option value="other">Other</Option> 
                </Select> 
              </div> 
               
              <div className="detail-item"> 
                <span className="detail-label">Employee ID:</span> 
                <Input 
                  value={employeeId} 
                  style={{ width: '100%', maxWidth: '200px' }} 
                  onChange={handleEmployeeIdChange} 
                  className="employee-id-input" 
                  placeholder="Enter Employee ID (optional)" 
                  type="number" 
                /> 
              </div> 
            </Card> 
          </div> 

          <div className="action-button-container"> 
            <Button  
              type="primary"  
              className="generate-button" 
              style={{ backgroundColor: '#161C70', borderColor: '#161C70' }} 
              onClick={handleGeneratePayslip} 
              loading={loading} 
            > 
              Generate Payslip 
            </Button> 
          </div> 
        </Card> 

        <Card  
          title="Slip Details"  
          className="payslip-card" 
          style={{ header: { color: '#161C70', fontWeight: 'bold' } }} 
        > 
          <Spin spinning={loading}> 
            <Table  
              columns={columns}  
              dataSource={payslipData} 
              className="slip-details-table" 
              bordered 
              pagination={{ 
                pageSize: 10, 
                showSizeChanger: true, 
                showQuickJumper: true, 
              }} 
            /> 
          </Spin> 
        </Card> 
      </Content> 
    </Layout> 
  </Layout> 
  ); 
 }; 

 export default PayslipGenerator;