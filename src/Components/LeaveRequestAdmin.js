import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Tag, Spin, message } from 'antd';

const LeaveRequestsAdmin = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

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
    ...(role=="admin"
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
      <Spin spinning={loading}>
        <Table 
          columns={columns} 
          dataSource={leaveRequests} 
          rowKey="id"
        />
      </Spin>
    </div>
  );
};

export default LeaveRequestsAdmin;
