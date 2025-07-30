import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { MailOutlined } from '@ant-design/icons';
import './ForgotPassword.css';

const ForgotPassword = () => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
  setLoading(true);
  try {
    const response = await fetch('http://localhost:5143/api/passwordreset/forgot-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: values.email }),
    });

    let data = {};
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (parseError) {
      console.warn("Non-JSON response received");
    }

    if (!response.ok) {
      throw new Error(data.message || `Server error: ${response.status}`);
    }

    message.success(data.message || 'Reset link sent if email exists');
  } catch (err) {
    console.error("Error:", err);
    message.error(err.message || 'Failed to send reset link');
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="forgot-password-container">
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please input your email!' },
            { type: 'email', message: 'Please enter a valid email!' }
          ]}
        >
          <Input prefix={<MailOutlined />} placeholder="Enter your email" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Send Reset Link
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ForgotPassword;