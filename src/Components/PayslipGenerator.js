import React, { useState, useEffect } from 'react';
import { Button, Select, DatePicker, Table, message, Spin, Card, InputNumber, Form, Row, Col, Divider } from 'antd';
import './PayslipGenerator.css';

const PayslipGenerator = () => {
  const API_BASE_URL = `${process.env.REACT_APP_API_BASE_URL}`;

  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [generatedPayslips, setGeneratedPayslips] = useState([]);
  const [payslipDetails, setPayslipDetails] = useState(null);
  const [bonusAmount, setBonusAmount] = useState(0);
  const [allowanceAmount, setAllowanceAmount] = useState(0);
  const [form] = Form.useForm();
  const [status, setStatus] = useState({
    success: null,
    message: ''
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      setFetching(true);
      try {
        const res = await fetch(`${API_BASE_URL}/employees`);
        if (!res.ok) throw new Error('Failed to fetch employees');
        const data = await res.json();
        setEmployees(data);
        
        // Extract unique positions
        const uniquePositions = [...new Set(data.map(emp => emp.position))].filter(Boolean);
        setPositions(uniquePositions);
      } catch (error) {
        message.error(error.message);
      } finally {
        setFetching(false);
      }
    };

    fetchEmployees();
  }, []);

  const filteredEmployees = selectedPosition
    ? employees.filter(emp => emp.position === selectedPosition)
    : employees;

  const resetForm = () => {
    setBonusAmount(0);
    setAllowanceAmount(0);
    setPayslipDetails(null);
    form.resetFields(['bonus', 'allowance']);
  };

  const generatePayslip = async () => {
    if (!selectedEmployee || !selectedMonth) {
      setStatus({
        success: false,
        message: 'Please select both employee and month'
      });
      return;
    }

    setLoading(true);
    setGeneratedPayslips([]);
    setPayslipDetails(null);
    setStatus({
      success: null,
      message: ''
    });

    try {
      const month = selectedMonth.month() + 1; // moment months are 0-indexed
      const year = selectedMonth.year();
      
      const requestBody = {
        month: month,
        year: year,
        employeeId: selectedEmployee,
        bonus: bonusAmount || 0,
        allowance: allowanceAmount || 0
      };

      const response = await fetch(`${API_BASE_URL}/payslips/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate payslip');
      }

      const data = await response.json();
      
      if (data.success) {
        const employeeName = `${data.employees[0]?.name} ${data.employees[0]?.surname}`;
        let successMessage = `Payslip generated successfully for ${employeeName}`;
        
        if (bonusAmount > 0) {
          successMessage += ` with bonus of R${bonusAmount.toFixed(2)}`;
        }
        if (allowanceAmount > 0) {
          successMessage += ` with allowance of R${allowanceAmount.toFixed(2)}`;
        }
        
        setStatus({
          success: true,
          message: successMessage
        });
        setGeneratedPayslips(data.employees);
        
        await fetchPayslipDetails(selectedEmployee, year, month);
      } else {
        throw new Error('Failed to generate payslip');
      }
    } catch (error) {
      setStatus({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchPayslipDetails = async (employeeId, year, month) => {
    const maxRetries = 5;
    const delayMs = 5000; // 5 seconds delay between retries
  
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Attempt ${attempt}: Fetching payslip for ${employeeId} ${month}/${year}`);
        
        const response = await fetch(`${API_BASE_URL}/payslips/view/${employeeId}/${year}/${month}`);
        
        if (!response.ok) {
          throw new Error(`Response not OK (status ${response.status})`);
        }
  
        const data = await response.json();
  
        if (data.success && data.payslip) {
          const raw = data.payslip;
  
          const mappedPayslip = {
            EmployeeName: raw.employeeName || 'Unknown',
            Position: raw.position || 'Not specified',
            Period: raw.period || 'Not specified',
            GeneratedDate: raw.generatedDate || 'Not specified',
            BasicSalary: raw.basicSalary || 0,
            Allowance: raw.allowance || 0,
            Bonus: raw.bonus || 0,
            GrossSalary: raw.grossSalary || 0,
            TaxAmount: raw.taxAmount || 0,
            UIF: raw.uif || 0,
            NetSalary: raw.netSalary || 0
          };
  
          console.log('Payslip fetched successfully');
          setPayslipDetails(mappedPayslip);
          return;
        } else {
          throw new Error('Payslip not ready yet');
        }
      } catch (error) {
        console.warn(`Attempt ${attempt} failed: ${error.message}`);
  
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delayMs));
        } else {
          console.error('Error fetching payslip details after all retries:', error);
          message.error('Payslip not available yet. Try again later.');
        }
      }
    }
  };
  
  const generateBulkPayslips = async () => {
    if (!selectedPosition || !selectedMonth) {
      setStatus({
        success: false,
        message: 'Please select both position and month for bulk generation'
      });
      return;
    }

    setLoading(true);
    setGeneratedPayslips([]);
    setPayslipDetails(null);
    setStatus({
      success: null,
      message: ''
    });

    try {
      const month = selectedMonth.month() + 1;
      const year = selectedMonth.year();
      
      const requestBody = {
        month: month,
        year: year,
        position: selectedPosition,
        bonus: bonusAmount || 0,
        allowance: allowanceAmount || 0
      };

      const response = await fetch(`${API_BASE_URL}/payslips/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate payslips');
      }

      const data = await response.json();
      
      if (data.success) {
        let successMessage = `Generated ${data.count} payslips for ${data.position}`;
        
        if (bonusAmount > 0) {
          successMessage += ` with bonus of R${bonusAmount.toFixed(2)} each`;
        }
        if (allowanceAmount > 0) {
          successMessage += ` with allowance of R${allowanceAmount.toFixed(2)} each`;
        }
        
        setStatus({
          success: true,
          message: successMessage
        });
        setGeneratedPayslips(data.employees);
      } else {
        throw new Error('Failed to generate payslips');
      }
    } catch (error) {
      setStatus({
        success: false,
        message: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const slipDetailsColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Surname', 
      dataIndex: 'surname',
      key: 'surname',
    }
  ];

  const payslipDataColumns = [
    { 
      title: 'Description', 
      dataIndex: 'type', 
      key: 'type' 
    },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount',
      render: (amount) => {
        // Handle both positive and negative amounts
        const numAmount = Number(amount) || 0;
        const isNegative = numAmount < 0;
        const displayAmount = Math.abs(numAmount);
        
        return (
          <span style={{ color: isNegative ? '#ff4d4f' : '#000' }}>
            {isNegative ? '-' : ''}R{displayAmount.toFixed(2)}
          </span>
        );
      }
    },
  ];

  // Generate payslip breakdown data from fetched details
  const getPayslipBreakdown = () => {
    if (!payslipDetails) return [];
    
    // Convert all values to numbers to ensure proper calculation
    const basicSalary = Number(payslipDetails.BasicSalary) || 0;
    const allowance = Number(payslipDetails.Allowance) || 0;
    const bonus = Number(payslipDetails.Bonus) || 0;
    const taxAmount = Number(payslipDetails.TaxAmount) || 0;
    const uif = Number(payslipDetails.UIF) || 0;
    const netSalary = Number(payslipDetails.NetSalary) || 0;
    
    const breakdown = [
      { key: '1', type: 'Basic Salary', amount: basicSalary }
    ];

    // Add allowance if present
    if (allowance > 0) {
      breakdown.push({ key: '2', type: 'Allowance', amount: allowance });
    }

    // Add bonus if present
    if (bonus > 0) {
      breakdown.push({ key: '3', type: 'Bonus', amount: bonus });
    }

    // Add deductions
    breakdown.push(
      { key: '4', type: 'PAYE Tax', amount: -taxAmount },
      { key: '5', type: 'UIF Contribution', amount: -uif },
      { key: '6', type: 'Net Pay', amount: netSalary }
    );
    
    return breakdown;
  };

  // Helper function to safely format currency
  const formatCurrency = (value) => {
    const numValue = Number(value) || 0;
    return `R${numValue.toFixed(2)}`;
  };

  // Helper function to safely get employee name
  const getEmployeeName = () => {
    if (!payslipDetails) return 'Unknown Employee';
    return payslipDetails.EmployeeName || 'Unknown Employee';
  };

  // Helper function to safely get position
  const getPosition = () => {
    if (!payslipDetails) return 'Not specified';
    return payslipDetails.Position || 'Not specified';
  };

  // Helper function to safely get period
  const getPeriod = () => {
    if (!payslipDetails) return 'Not specified';
    return payslipDetails.Period || 'Not specified';
  };

  // Helper function to safely get generated date
  const getGeneratedDate = () => {
    if (!payslipDetails) return 'Not specified';
    return payslipDetails.GeneratedDate || 'Not specified';
  };

  // Helper function to get gross salary
  const getGrossSalary = () => {
    if (!payslipDetails) return 0;
    const basic = Number(payslipDetails.BasicSalary) || 0;
    const allowance = Number(payslipDetails.Allowance) || 0;
    const bonus = Number(payslipDetails.Bonus) || 0;
    return basic + allowance + bonus;
  };

  return (
    <div className="section payslip">
      <h3>Payslip Generator</h3>
      <div className="section-content">
      {status.message && (
          <div className={`status-message ${status.success ? 'success' : 'error'}`}>
            {status.message}
          </div>
        )}
        <Spin spinning={fetching}>
          <Card size="small" style={{ marginBottom: 20 }}>
            <div style={{ display: 'grid', gap: 16 }}>
              <Select
                placeholder="Select Position"
                style={{ width: '100%' }}
                value={selectedPosition}
                onChange={value => {
                  setSelectedPosition(value);
                  setSelectedEmployee(null);
                  setGeneratedPayslips([]);
                  resetForm();
                }}
                options={positions.map(pos => ({
                  value: pos,
                  label: pos
                }))}
                allowClear
              />

              <Select
                placeholder="Select Employee (Optional for bulk generation)"
                style={{ width: '100%' }}
                value={selectedEmployee}
                onChange={value => {
                  setSelectedEmployee(value);
                  setPayslipDetails(null);
                }}
                options={filteredEmployees.map(emp => ({
                  value: emp.employeeId,
                  label: `${emp.firstName} ${emp.lastName} (${emp.department})`
                }))}
                allowClear
              />

              <DatePicker 
                picker="month" 
                style={{ width: '100%' }} 
                value={selectedMonth}
                onChange={value => {
                  setSelectedMonth(value);
                  setPayslipDetails(null);
                }}
                placeholder="Select Month"
              />

              <Divider style={{ margin: '16px 0' }}>Additional Compensation</Divider>
              
              <Form form={form} layout="vertical">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item 
                      label="Allowance Amount" 
                      name="allowance"
                      
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={100}
                        precision={2}
                        placeholder="0.00"
                        prefix="R"
                        value={allowanceAmount}
                        onChange={value => setAllowanceAmount(value || 0)}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item 
                      label="Bonus Amount" 
                      name="bonus"
                      
                    >
                      <InputNumber
                        style={{ width: '100%' }}
                        min={0}
                        step={100}
                        precision={2}
                        placeholder="0.00"
                        prefix="R"
                        value={bonusAmount}
                        onChange={value => setBonusAmount(value || 0)}
                        formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        parser={value => value.replace(/\$\s?|(,*)/g, '')}
                      />
                    </Form.Item>
                  </Col>
                </Row>
              </Form>

              {(bonusAmount > 0 || allowanceAmount > 0) && (
                <div style={{ 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f', 
                  borderRadius: '6px', 
                  padding: '12px',
                  fontSize: '14px'
                }}>
                  <strong>Additional Compensation Summary:</strong>
                  <br />
                  {allowanceAmount > 0 && (
                    <span>• Allowance: <strong>R{allowanceAmount.toFixed(2)}</strong><br /></span>
                  )}
                  {bonusAmount > 0 && (
                    <span>• Bonus: <strong>R{bonusAmount.toFixed(2)}</strong><br /></span>
                  )}
                  <span>• Total Additional: <strong>R{(allowanceAmount + bonusAmount).toFixed(2)}</strong></span>
                </div>
              )}
            </div>
          </Card>
        </Spin>
        
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          <Button 
            className="generate-button"
            type="primary"
            onClick={generatePayslip}
            loading={loading}
            disabled={!selectedEmployee || !selectedMonth}
            style={{ flex: 1 }}
          >
            Generate Individual Payslip
          
          </Button>

          <Button 
            type="default"
            onClick={generateBulkPayslips}
            loading={loading}
            disabled={!selectedPosition || !selectedMonth || selectedEmployee}
            style={{ flex: 1 }}
          >
            Generate Bulk Payslips
            
          </Button>
        </div>

        {/* Show generated payslips list */}
        {generatedPayslips.length > 0 && (
          <Card title="Generated Payslips" style={{ marginBottom: 20 }}>
            <Table 
              columns={slipDetailsColumns} 
              dataSource={generatedPayslips.map((emp, index) => ({
                key: index,
                name: emp.name,
                surname: emp.surname
              }))} 
              pagination={false}
              size="small"
            />
          </Card>
        )}

        {/* Show detailed payslip breakdown for individual generation */}
        {payslipDetails && (
          <Card title={`Payslip Details - ${getEmployeeName()}`} style={{ marginTop: 20 }}>
            <div style={{ marginBottom: 16 }}>
              <Row gutter={16}>
                <Col span={12}>
                  <p><strong>Position:</strong> {getPosition()}</p>
                  <p><strong>Period:</strong> {getPeriod()}</p>
                </Col>
                <Col span={12}>
                  <p><strong>Generated:</strong> {getGeneratedDate()}</p>
                  <p><strong>Gross Salary:</strong> <span style={{ color: '#1890ff', fontWeight: 'bold' }}>{formatCurrency(getGrossSalary())}</span></p>
                </Col>
              </Row>
            </div>
            <Table 
              columns={payslipDataColumns} 
              dataSource={getPayslipBreakdown()} 
              pagination={false}
              bordered
              size="small"
              summary={() => {
                const netSalary = Number(payslipDetails?.NetSalary) || 0;
                return (
                  <Table.Summary.Row>
                    <Table.Summary.Cell><strong>Net Amount</strong></Table.Summary.Cell>
                    <Table.Summary.Cell>
                      <strong style={{ color: '#52c41a', fontSize: '16px' }}>
                        {formatCurrency(netSalary)}
                      </strong>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                );
              }}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default PayslipGenerator;