import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, Button, message } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import './ResetPassword.css';

const ResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const validateToken = async () => {
      try {
        const response = await fetch('http://localhost:5143/api/passwordreset/validate-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Invalid token');
        }

        console.log('Token validated successfully');
        setTokenValid(true);
      } catch (err) {
        console.error("Token validation failed:", err);
        message.error('Invalid or expired reset link.');
        navigate('/forgot-password');
      }
    };

    if (token) validateToken();
    else navigate('/reset-password');
  }, [token, navigate]);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5143/api/passwordreset/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          newPassword: values.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Password reset failed');
      }

      console.log('Password reset successful:', data);
      message.success('Password has been reset successfully!');
      navigate('/');
    } catch (err) {
      console.error("Password reset failed:", err);
      message.error(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (!tokenValid) return null;

  return (
    <div className="reset-password-container">
      <Form onFinish={onFinish} layout="vertical">
        <Form.Item
          name="password"
          label="New Password"
          rules={[
            { required: true, message: 'Please input your new password!' },
            { min: 8, message: 'Password must be at least 8 characters!' }
          ]}
          hasFeedback
        >
          <Input.Password prefix={<LockOutlined />} placeholder="New password" />
        </Form.Item>

        <Form.Item
          name="confirm"
          label="Confirm Password"
          dependencies={['password']}
          hasFeedback
          rules={[
            { required: true, message: 'Please confirm your password!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('password') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('Passwords do not match!'));
              },
            }),
          ]}
        >
          <Input.Password prefix={<LockOutlined />} placeholder="Confirm new password" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={loading}
            block
          >
            Reset Password
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default ResetPassword;