import Sidebar from '../Components/Sidebar';
import './Documents.css';
import { Table, Spin, message, Button } from 'antd';
import { DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';

function Documents() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [userDetails, setUserDetails] = useState({});

  useEffect(() => {
    // Get user details from localStorage
    const storedUserDetails = localStorage.getItem('user');
    if (storedUserDetails) {
      setUserDetails(JSON.parse(storedUserDetails));
    }
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5143/api/Documents', {
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
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (record) => {
    // Implement download functionality
    message.success(`Downloading ${record.fileName}`);
    // Add actual download logic here
  };

  const handleView = (record) => {
    // Implement view functionality
    message.info(`Viewing ${record.fileName}`);
    // Add actual view logic here
  };

  const columns = [
    {
      title: 'File Name',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (text) => <span className="file-name">{text}</span>,
    },
    {
      title: 'Type',
      dataIndex: 'fileType',
      key: 'fileType',
    },
    {
      title: 'Upload Date',
      dataIndex: 'uploadDate',
      key: 'uploadDate',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'View',
      key: 'view',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleView(record)}
        />
      ),
    },
    {
      title: 'Download',
      key: 'download',
      render: (_, record) => (
        <Button
          type="link"
          icon={<DownloadOutlined />}
          onClick={() => handleDownload(record)}
        />
      ),
    },
  ];

  // Determine which sidebar to render
  const renderSidebar = userDetails.role === 'admin' ? <AdminSidebar /> : <Sidebar />;

  return (
    <>
      {renderSidebar}
      <div className="documents-container">
        <div className="header">
          <h1>Documents</h1>
        </div>

        <div className="table-container">
          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={documents}
              rowKey="id"
              loading={loading}
              pagination={{
                ...pagination,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
                onChange: (page, pageSize) => {
                  setPagination({ current: page, pageSize });
                },
              }}
              scroll={{ x: true }}
            />
          </Spin>
        </div>
      </div>
    </>
  );
}

export default Documents;