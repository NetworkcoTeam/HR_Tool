import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Spin } from 'antd';

export default function ViewLeaveApplication(){
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5143/api/LeaveRequest/all');
      if (!res.ok) {
        throw new Error('Failed to fetch leave requests' );
      }
      const data = await res.json();
      setLeaveRequests(data);
    } catch (error) {
      console.error(error);
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      const res = await fetch(`http://localhost:5143/api/LeaveRequest/status/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }), // Match the DTO structure
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to update status');
      }

      const result = await res.json();
      message.success(result.message);
      fetchLeaveRequests(); // Refresh list
    } catch (error) {
      console.error(error);
      message.error(error.message);
    } finally {
      setUpdating(false);
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
    }
    
  ];

  return (
    <div style={{ padding: '25px'}}>
      <h1>Leave applications</h1>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={leaveRequests} 
          rowKey="id"
          loading={loading}
        />
      </Spin>
      <Button type='primary' variant='solid' size='large' onClick={leaveRequests}> view applications</Button>
      
    </div>
  );
};

