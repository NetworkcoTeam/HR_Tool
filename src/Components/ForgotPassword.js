import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './ForgotPassword.css';

const { Title, Text } = Typography;

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // API call would go here
      message.success('Reset link sent to your email');
      form.resetFields();
    } catch (error) {
      message.error(error.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="forgot-password-card">
      <div className="card-content">
        <Title level={3} className="form-title">
          Forgot Password
        </Title>
        <Text type="secondary" className="form-subtitle">
          Enter your email to receive a password reset link
        </Text>
        
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input your email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />}
              placeholder="your.email@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              size="large"
              loading={loading}
              className="submit-btn"
            >
              Send Reset Link
            </Button>
          </Form.Item>
        </Form>

        <div className="card-footer">
          <Button 
            type="link" 
            onClick={() => navigate('/login')}
            className="back-btn"
          >
            Back to Login
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ForgotPassword;