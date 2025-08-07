import React, { useEffect, useState } from 'react';
import { Table, Button, Tag, message, Spin, Radio } from 'antd';
import './LeaveRequestAdmin.css';

const LeaveRequestsAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'denied'

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5143/api/LeaveRequest/all');
      if (!res.ok) {
        throw new Error('Failed to fetch leave requests');
      }
      const data = await res.json();
      setLeaveRequests(data);
      setFilteredRequests(data); // Initially show all requests
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
        body: JSON.stringify({ status: newStatus }),
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

  useEffect(() => {
    if (filter === 'all') {
      setFilteredRequests(leaveRequests);
    } else {
      const filtered = leaveRequests.filter(request => 
        request.status.toLowerCase() === filter.toLowerCase()
      );
      setFilteredRequests(filtered);
    }
  }, [filter, leaveRequests]);

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
            disabled={record.status === 'Approved' || updating}
            loading={updating}
            style={{ marginRight: 8 }}
          >
            Approve
          </Button>
          <Button 
            danger 
            onClick={() => updateStatus(record.id, 'Denied')}
            disabled={record.status === 'Denied' || updating}
            loading={updating}
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
      
      <div style={{ marginBottom: '16px' }}>
        <Radio.Group 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="all">All</Radio.Button>
          <Radio.Button value="pending">Pending</Radio.Button>
          <Radio.Button value="approved">Approved</Radio.Button>
          <Radio.Button value="denied">Denied</Radio.Button>
        </Radio.Group>
      </div>
      
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={filteredRequests} 
          rowKey="id"
          loading={loading}
        />
      </Spin>
    </div>
  );
};

export default LeaveRequestsAdmin;