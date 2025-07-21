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

  const generatePayslip = () => {
    if (!selectedEmployee || !selectedMonth) {
      message.error('Please select both employee and month');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const employee = employees.find(e => e.employeeId === selectedEmployee);
      message.success(`Payslip generated for ${employee.firstName} ${employee.lastName}`);
      setLoading(false);
    }, 1500);
  };

  const columns = [
    { title: 'Earnings', dataIndex: 'type', key: 'type' },
    { 
      title: 'Amount', 
      dataIndex: 'amount', 
      key: 'amount',
      render: amount => `$${amount.toFixed(2)}`
    },
  ];

  const payslipData = [
    { key: '1', type: 'Basic Salary', amount: 5000 },
    { key: '2', type: 'Allowances', amount: 1000 },
    { key: '3', type: 'Deductions', amount: -750 },
    { key: '4', type: 'Net Pay', amount: 5250 },
  ];

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
                onChange={value => {
                  setSelectedPosition(value);
                  setSelectedEmployee(null); // Reset employee selection
                }}
                options={positions.map(pos => ({
                  value: pos,
                  label: pos
                }))}
                allowClear
              />

              <Select
                placeholder="Select Employee"
                style={{ width: '100%' }}
                value={selectedEmployee}
                onChange={setSelectedEmployee}
                disabled={!selectedPosition}
                options={filteredEmployees.map(emp => ({
                  value: emp.employeeId,
                  label: `${emp.firstName} ${emp.lastName} (${emp.department})`
                }))}
              />

              <DatePicker 
                picker="month" 
                style={{ width: '100%' }} 
                onChange={setSelectedMonth}
                placeholder="Select Month"
              />
            </div>
          </Card>
        </Spin>
        
        <Button 
          className="generate-button"
          type="primary"
          onClick={generatePayslip}
          loading={loading}
          disabled={!selectedEmployee || !selectedMonth}
          block
        >
          Generate Payslip
        </Button>

        {selectedEmployee && selectedMonth && (
          <Card style={{ marginTop: 20 }}>
            <Table 
              columns={columns} 
              dataSource={payslipData} 
              pagination={false}
              bordered
              size="small"
              summary={() => (
                <Table.Summary.Row>
                  <Table.Summary.Cell><strong>Total</strong></Table.Summary.Cell>
                  <Table.Summary.Cell>
                    <strong>${payslipData.reduce((sum, item) => sum + item.amount, 0).toFixed(2)}</strong>
                  </Table.Summary.Cell>
                </Table.Summary.Row>
              )}
            />
          </Card>
        )}
      </div>
    </div>
  );
};

export default PayslipGenerator;