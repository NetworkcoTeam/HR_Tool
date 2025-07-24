
/*import React, { useEffect, useState } from 'react';

import { Table, Button, Tag, message, Spin } from 'antd';
import './LeaveRequestAdmin.css';

const LeaveRequestsAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5143/api/LeaveRequest/all');
      if (!res.ok) {
        throw new Error('Failed to fetch leave requests');
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
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={leaveRequests} 
          rowKey="id"
          loading={loading}
        />
      </Spin>
    </div>
  );
};


export default LeaveRequestsAdmin;*/
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Tag, Spin, message, Radio } from 'antd';

const LeaveRequestsAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [filteredRequests, setFilteredRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [statusFilter, setStatusFilter] = useState('Pending');

  // ✅ Automatically get user info from local storage
  const role = localStorage.getItem('role');
  const employeeId = localStorage.getItem('employeeId');
  //const isAdmin = role === 'Admin';

  const fetchLeaveRequests = async () => {
    setLoading(true);
    try {
            const url = role == "admin"
            ? `http://localhost:5143/api/LeaveRequest/all`
            : `http://localhost:5143/api/LeaveRequest/employee/${employeeId}`;
            

      const response = await axios.get(url);
      setLeaveRequests(response.data);
      // Filter by pending status initially
      setFilteredRequests(response.data.filter(request => request.status === 'Pending'));
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch leave requests.');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, newStatus) => {
    setUpdating(true);
    try {
      await axios.put(`http://localhost:5143/api/LeaveRequest/status/${id}`, {
        status: newStatus,
      });
      message.success(`Status updated to ${newStatus}`);
      fetchLeaveRequests();
    } catch (error) {
      console.error(error);
      message.error('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  useEffect(() => {
    if (statusFilter === 'All') {
      setFilteredRequests(leaveRequests);
    } else {
      setFilteredRequests(leaveRequests.filter(request => request.status === statusFilter));
    }
  }, [statusFilter, leaveRequests]);

  const columns = [
    // your table columns...
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
    ...(role
      ? [{
          title: 'Action',
          key: 'action',
          render: (_, record) => (
            <>
              <Button 
                type="primary" 
                onClick={() => updateStatus(record.id, 'Approved')}
                disabled={record.status === 'Approved' || updating}
                loading={updating}
                style={{ marginRight: 8, backgroundColor: 'green', borderColor: 'green' }}
              >
                Approve
              </Button>
              <Button 
                danger 
                onClick={() => updateStatus(record.id, 'Denied')}
                disabled={record.status === 'Denied' || updating}
                loading={updating}
                style={{ backgroundColor: 'red', borderColor: 'red' }}
              >
                Deny
              </Button>
            </>
          ),
        }]
      : []
    ),
  ];

  return (
    <div style={{ padding: '24px' }}>
      <h1>Leave Requests</h1>
      <div style={{ marginBottom: 16 }}>
        <Radio.Group 
          value={statusFilter} 
          onChange={(e) => setStatusFilter(e.target.value)}
          buttonStyle="solid"
        >
          <Radio.Button value="Pending">Pending</Radio.Button>
          <Radio.Button value="Approved">Approved</Radio.Button>
          <Radio.Button value="Denied">Denied</Radio.Button>
          <Radio.Button value="All">All</Radio.Button>
        </Radio.Group>
      </div>
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={filteredRequests} 
          rowKey="id"
        />
      </Spin>
    </div>
  );
};

export default LeaveRequestsAdmin;

