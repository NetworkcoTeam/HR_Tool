import Sidebar from '../Components/Sidebar';
import './Profile.css';
import { UserOutlined, MailOutlined, IdcardOutlined, SolutionOutlined } from '@ant-design/icons';
import { Avatar, Card, Divider, Flex, Typography, Row, Col, Tag } from 'antd';
import React, { useState, useEffect } from 'react';
import AdminSidebar from '../Components/AdminSidebar';

const { Title, Text } = Typography;

export default function Profile() {
    const [userDetails, setUserDetails] = useState({});
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const storedUserDetails = localStorage.getItem('user');
        if (storedUserDetails) {
            setUserDetails(JSON.parse(storedUserDetails));
        }
        setLoading(false);
    }, []);

    // Determine which sidebar to render
    const renderSidebar = userDetails.role === 'admin' ? <AdminSidebar /> : <Sidebar />;

    return (
        <>
            {renderSidebar}
            <div className='profile-container'>
                <Card 
                    title={<Title level={3}>User Profile</Title>}
                    loading={loading}
                    bordered={false}
                    className="profile-card"
                >
                    <Flex align="center" gap="large" style={{ marginBottom: 24 }}>
                        <Avatar size={128} icon={<UserOutlined />} className='profile-avatar'/>
                        <div>
                            <Title level={2}>{userDetails.name} {userDetails.surname}</Title>
                            <Tag color={userDetails.role === 'admin' ? 'red' : 'blue'} style={{ fontSize: 14 }}>
                                {userDetails.role?.toUpperCase()}
                            </Tag>
                        </div>
                    </Flex>

                    <Divider orientation="left"><SolutionOutlined /> Personal Information</Divider>
                    
                    <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                        <Col xs={24} sm={12}>
                            <Card bordered={false} className="info-card">
                                <Text strong><MailOutlined /> Email Address</Text>
                                <Text style={{ display: 'block', marginTop: 8 }}>{userDetails.email}</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card bordered={false} className="info-card">
                                <Text strong><IdcardOutlined /> ID Number</Text>
                                <Text style={{ display: 'block', marginTop: 8 }}>{userDetails.idNumber || 'N/A'}</Text>
                            </Card>
                        </Col>
                    </Row>

                    <Divider orientation="left"><SolutionOutlined /> Employment Details</Divider>
                    
                    <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12}>
                            <Card bordered={false} className="info-card">
                                <Text strong>Employee Number</Text>
                                <Text style={{ display: 'block', marginTop: 8 }}>{userDetails.employee_id || 'N/A'}</Text>
                            </Card>
                        </Col>
                        <Col xs={24} sm={12}>
                            <Card bordered={false} className="info-card">
                                <Text strong>Position</Text>
                                <Text style={{ display: 'block', marginTop: 8 }}>{userDetails.role || 'N/A'}</Text>
                            </Card>
                        </Col>
                    </Row>
                </Card>
            </div>
        </>
    );
}