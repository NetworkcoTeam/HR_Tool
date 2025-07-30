import Sidebar from '../Components/Sidebar';
import './Documents.css';
import { Table, Spin, message, Button, Modal, Upload, Form, Select, Input } from 'antd';
import { DownloadOutlined, EyeOutlined, UploadOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

const { Option } = Select;

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [uploadForm] = Form.useForm();
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [userDetails, setUserDetails] = useState({});
  const [employees, setEmployees] = useState([]);
  const [searchEmployeeId, setSearchEmployeeId] = useState('');

  useEffect(() => {
    const storedUserDetails = localStorage.getItem('user');
    if (storedUserDetails) {
      const parsed = JSON.parse(storedUserDetails);
      setUserDetails({
        ...parsed,
        employeeId: parsed.employee_id,
        lastName: parsed.surname
      });

      if (parsed.role === 'admin') {
        fetchEmployees();
      }
    }
  }, []);

  useEffect(() => {
    if (userDetails.employeeId) {
      fetchDocuments();
    }
  }, [userDetails]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      let url = 'http://localhost:5143/api/Document';
      if (userDetails?.role !== 'admin' && userDetails?.employeeId) {
        url += `?employeeId=${userDetails.employeeId}`;
      }

      const res = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch documents');
      }

      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const handleAdminSearch = async () => {
    if (!searchEmployeeId.trim()) {
      message.warning('Please enter an employee ID');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:5143/api/Document?employeeId=${searchEmployeeId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch documents for employee ID');

      const data = await res.json();
      setDocuments(data);
    } catch (error) {
      console.error(error);
      message.error('Failed to fetch documents');
    } finally {
      setLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const res = await fetch('http://localhost:5143/api/Document/search-employees', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
    } catch (error) {
      console.error('Failed to fetch employees:', error);
    }
  };

  const handleDownload = async (record) => {
    try {
      const res = await fetch(`http://localhost:5143/api/Document/download/${record.docId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to download document');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = record.fileName || record.docName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      message.success(`Downloaded ${record.fileName || record.docName}`);
    } catch (error) {
      console.error(error);
      message.error('Failed to download document');
    }
  };

  const handleView = async (record) => {
    try {
      const res = await fetch(`http://localhost:5143/api/Document/download/${record.docId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) throw new Error('Failed to view document');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');

      message.success(`Opening ${record.fileName || record.docName}`);
    } catch (error) {
      console.error(error);
      message.error('Failed to view document');
    }
  };

  const handleDelete = async (record) => {
    console.log("Deleting record:", record);

    try {
      const res = await fetch(`http://localhost:5143/api/Document/${record.docId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to delete:", errorText);
        throw new Error('Failed to delete document');
      }

      message.success('Document deleted successfully');
      fetchDocuments(); // Refresh list
    } catch (error) {
      console.error("Error deleting document:", error);
      message.error('Failed to delete document');
    }
  };

  const handleUpload = async (values) => {
    if (!values.file || values.file.length === 0) {
      message.error('Please select a file');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('File', values.file[0].originFileObj);
      formData.append('EmployeeId', values.employeeId || userDetails.employeeId);
      formData.append('DocType', values.docType);
      formData.append('LastName', values.lastName || userDetails.lastName);

      const res = await fetch('http://localhost:5143/api/Document/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to upload document');
      }

      const data = await res.json();
      message.success('Document uploaded successfully');
      setUploadModalVisible(false);
      uploadForm.resetFields();
      fetchDocuments();
    } catch (error) {
      console.error(error);
      message.error(error.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text, record) => <span className="file-name">{text || record.docName}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'docType',
      key: 'docType',
    },
    ...(userDetails.role === 'admin' ? [{
      title: 'Employee ID',
      dataIndex: 'employeeId',
      key: 'employeeId',
    }] : []),
    {
      title: 'Last Name',
      dataIndex: 'lastName',
      key: 'lastName',
    },
    {
      title: 'Upload Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'File Size',
      dataIndex: 'fileSize',
      key: 'fileSize',
      render: (size) => {
        if (size < 1024) return `${size} B`;
        if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
        return `${(size / (1024 * 1024)).toFixed(1)} MB`;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const showDelete = userDetails.role !== 'admin' && record.employeeId?.toString() === userDetails.employeeId?.toString();
        return (
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button type="link" icon={<EyeOutlined />} onClick={() => handleView(record)} title="View" />
            <Button type="link" icon={<DownloadOutlined />} onClick={() => handleDownload(record)} title="Download" />
            {showDelete && (
              <Button type="link" icon={<DeleteOutlined />} onClick={() => handleDelete(record)} danger title="Delete" />
            )}
          </div>
        );
      },
    }
  ];

  const uploadProps = {
    beforeUpload: () => false,
    maxCount: 1,
    accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png,.txt',
  };

  const renderSidebar = userDetails.role === 'admin' ? <AdminSidebar /> : <Sidebar />;

  return (
    <>
      {renderSidebar}
      <div className="documents-container">
        <div className="header">
          <h1>Documents</h1>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setUploadModalVisible(true)}>
            Upload Document
          </Button>
        </div>

        {userDetails.role === 'admin' && (
          <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
            <Input
              placeholder="Enter Employee ID"
              value={searchEmployeeId}
              onChange={(e) => setSearchEmployeeId(e.target.value)}
              style={{ width: 250 }}
            />
            <Button type="primary" onClick={handleAdminSearch}>Search</Button>
            <Button onClick={() => { setSearchEmployeeId(''); fetchDocuments(); }}>Reset</Button>
          </div>
        )}

        <div className="table-container">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={documents}
              rowKey="docId"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} documents`,
                onChange: (page, pageSize) => setPagination({ current: page, pageSize }),
              }}
              scroll={{ x: true }}
            />
          </Spin>
        </div>

        <Modal
          title="Upload Document"
          open={uploadModalVisible}
          onCancel={() => {
            setUploadModalVisible(false);
            uploadForm.resetFields();
          }}
          footer={null}
          width={500}
        >
          <Form
            form={uploadForm}
            layout="vertical"
            onFinish={handleUpload}
            initialValues={{
              employeeId: userDetails.employeeId,
              lastName: userDetails.lastName
            }}
          >
            {userDetails.role === 'admin' && (
              <Form.Item
                name="employeeId"
                label="Employee"
                rules={[{ required: true, message: 'Please select an employee' }]}
              >
                <Select
                  showSearch
                  placeholder="Select an employee"
                  optionFilterProp="children"
                  filterOption={(input, option) =>
                    option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                  }
                >
                  {employees.map(emp => (
                    <Option key={emp.employeeId} value={emp.employeeId}>
                      {emp.employeeId} - {emp.fullName}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            )}
            
            <Form.Item
              name="docType"
              label="Document Type"
              rules={[{ required: true, message: 'Please enter document type' }]}
            >
              <Select placeholder="Select document type">
                <Option value="Resume">CV</Option>
                <Option value="Contract">Contract</Option>
                <Option value="ID Document">ID Document</Option>
                <Option value="Certificate">Certificate</Option>
                <Option value="Bank Confirmation">Bank Confirmation</Option>
                <Option value="SARS Letter">SARS Letter</Option>
                <Option value="Other">Other</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="lastName"
              label="Last Name"
              rules={[{ required: true, message: 'Please enter last name' }]}
            >
              <Input disabled placeholder="Enter last name" />
            </Form.Item>

            <Form.Item
              name="employeeId"
              label="Employee ID"
              rules={[{ required: true, message: 'Enter employee id' }]}
            >
              <Input disabled placeholder="Enter employee id" />
            </Form.Item>

            <Form.Item
              name="file"
              label="File"
              rules={[{ required: true, message: 'Please select a file' }]}
              valuePropName="fileList"
              getValueFromEvent={(e) => {
                if (Array.isArray(e)) {
                  return e;
                }
                return e && e.fileList;
              }}
            >
              <Upload {...uploadProps}>
                <Button icon={<UploadOutlined />}>Select File</Button>
              </Upload>
            </Form.Item>

            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Button 
                onClick={() => {
                  setUploadModalVisible(false);
                  uploadForm.resetFields();
                }}
                style={{ marginRight: 8 }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={uploading}>
                Upload
              </Button>
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </>
  );
}

export default Documents;  