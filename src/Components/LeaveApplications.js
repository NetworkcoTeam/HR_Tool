import React, { useEffect, useState } from 'react';
import axios from 'axios';

const LeaveApplications = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all leave requests
  const fetchLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:5143/api/LeaveRequest'); // matches your [HttpGet] GetAll()
      setLeaveRequests(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch leave requests.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  // Update status (Approved or Denied)
  const updateStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5143/api/LeaveRequest/${id}/status`, status, {
        headers: { 'Content-Type': 'application/json' }
      });
      // Refresh list
      fetchLeaveRequests();
    } catch (err) {
      alert('Failed to update status.');
    }
  };

  // Delete leave request
  const deleteRequest = async (id) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;

    try {
      await axios.delete(`http://localhost:5143/api/LeaveRequest/${id}`);
      // Refresh list
      fetchLeaveRequests();
    } catch (err) {
      alert('Failed to delete leave request.');
    }
  };

  if (loading) return <p>Loading leave requests...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Leave Applications</h2>
      {leaveRequests.length === 0 && <p>No leave requests found.</p>}

      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Employee ID</th>
            <th>Leave Type</th>
            <th>Status</th>
            <th>Update Status</th>
            <th>Delete</th>
          </tr>
        </thead>
        <tbody>
          {leaveRequests.map(lr => (
            <tr key={lr.id}>
              <td>{lr.name} {lr.surname}</td>
              <td>{lr.employeeId}</td>
              <td>{lr.typeOfLeave}</td>
              <td>{lr.status}</td>
              <td>
                {lr.status.toLowerCase() === 'approved' || lr.status.toLowerCase() === 'denied' ? (
                  <em>{lr.status}</em>
                ) : (
                  <>
                    <button onClick={() => updateStatus(lr.id, 'Approved')}>Approve</button>
                    <button onClick={() => updateStatus(lr.id, 'Denied')} style={{ marginLeft: '8px' }}>Deny</button>
                  </>
                )}
              </td>
              <td>
                <button onClick={() => deleteRequest(lr.id)} style={{ color: 'red' }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeaveApplications;
