import React, { useState, useEffect } from 'react';
import { Button, Select, DatePicker, Table, message, Spin, Card } from 'antd';
import './PayslipGenerator.css';

const PayslipGenerator = () => {
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);
  const [positions, setPositions] = useState([]);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [generatedPayslips, setGeneratedPayslips] = useState([]);
  const [payslipDetails, setPayslipDetails] = useState(null);


  useEffect(() => {
    const fetchEmployees = async () => {
      setFetching(true);
      try {
        const res = await fetch('http://localhost:5143/api/employees');
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


  const generatePayslip = async () => {

    if (!selectedEmployee || !selectedMonth) {
      message.error('Please select both employee and month');
      return;
    }

    setLoading(true);

    setGeneratedPayslips([]);
    setPayslipDetails(null);

    try {
      const month = selectedMonth.month() + 1; // moment months are 0-indexed
      const year = selectedMonth.year();
      
      const requestBody = {
        month: month,
        year: year,
        employeeId: selectedEmployee
      };

      const response = await fetch('http://localhost:5143/api/payslips/generate', {
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
        message.success(`Payslip generated successfully for ${data.employees[0]?.name} ${data.employees[0]?.surname}`);
        setGeneratedPayslips(data.employees);
        
        // Fetch the generated payslip details to display
        await fetchPayslipDetails(selectedEmployee, year, month);
      } else {
        throw new Error('Failed to generate payslip');
      }
    } catch (error) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };


  const fetchPayslipDetails = async (employeeId, year, month) => {
    const maxRetries = 5;
    const delayMs = 5000; // 5 seconds delay between retries
  
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`⏳ Attempt ${attempt}: Fetching payslip for ${employeeId} ${month}/${year}`);
        
        const response = await fetch(`http://localhost:5143/api/payslips/view/${employeeId}/${year}/${month}`);
        
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
            TaxAmount: raw.taxAmount || 0,
            UIF: raw.uifAmount || 0,
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
      message.error('Please select both position and month for bulk generation');
      return;
    }

    setLoading(true);
    setGeneratedPayslips([]);
    setPayslipDetails(null);

    try {
      const month = selectedMonth.month() + 1;
      const year = selectedMonth.year();
      
      const requestBody = {
        month: month,
        year: year,
        position: selectedPosition
      };

      const response = await fetch('http://localhost:5143/api/payslips/generate', {
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
        message.success(`Generated ${data.count} payslips for ${data.position}`);
        setGeneratedPayslips(data.employees);
      } else {
        throw new Error('Failed to generate payslips');
      }
    } catch (error) {
      message.error(error.message);
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
    const taxAmount = Number(payslipDetails.TaxAmount) || 0;
    const uifAmount = Number(payslipDetails.UIF) || 0;
    const netSalary = Number(payslipDetails.NetSalary) || 0;
    
    return [
      { key: '1', type: 'Basic Salary', amount: basicSalary },
      { key: '2', type: 'PAYE Tax', amount: -taxAmount }, // Negative for deduction
      { key: '3', type: 'UIF Contribution', amount: -uifAmount }, // Negative for deduction
      { key: '4', type: 'Net Pay', amount: netSalary },
    ];
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


  return (
    <div className="section payslip">
      <h3>Payslip Generator</h3>
      <div className="section-content">
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
                  setPayslipDetails(null);

             
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
            disabled={!selectedPosition || !selectedMonth}
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
              <p><strong>Position:</strong> {getPosition()}</p>
              <p><strong>Period:</strong> {getPeriod()}</p>
              <p><strong>Generated:</strong> {getGeneratedDate()}</p>
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