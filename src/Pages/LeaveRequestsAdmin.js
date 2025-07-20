// LeaveRequestsAdmin.js

import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message } from 'antd';

const LeaveRequestsAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);

  const fetchLeaveRequests = async () => {
    try {
      const res = await fetch('http://localhost:5143/api/LeaveRequest');
      const data = await res.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch leave requests');
    }
  };

  const updateStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5143/api/LeaveRequest/status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStatus),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.message || 'Failed to update status');
      }

      message.success(result.message);
      fetchLeaveRequests(); // Refresh list
    } catch (error) {
      console.error(error);
      message.error(`Error: ${error.message}`);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const columns = [
    {
      title: 'Employee',
      dataIndex: 'name',
      key: 'name',
      render: (_, record) => `${record.name} ${record.surname}`,
    },
    {
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    },
    {
      title: 'Department',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: 'Leave Type',
      dataIndex: 'typeOfLeave',
      key: 'typeOfLeave',
    },
    {
      title: 'Start Date',
      dataIndex: 'leaveStart',
      key: 'leaveStart',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'End Date',
      dataIndex: 'leaveEnd',
      key: 'leaveEnd',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Total Days',
      dataIndex: 'totalDays',
      key: 'totalDays',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = 'default';
        if (status === 'Approved') color = 'green';
        else if (status === 'Denied') color = 'red';
        else if (status === 'Pending') color = 'blue';
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button 
            type="primary" 
            onClick={() => updateStatus(record.id, 'Approved')}
            disabled={record.status === 'Approved'}
            style={{ marginRight: 8 }}
          >
            Approve
          </Button>
          <Button 
            danger 
            onClick={() => updateStatus(record.id, 'Denied')}
            disabled={record.status === 'Denied'}
          >
            Deny
          </Button>
        </>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Leave Requests Management</h1>
      <Table 
        columns={columns} 
        dataSource={leaveRequests} 
        rowKey="id"
      />
    </div>
  );
};

export default LeaveRequestsAdmin;
