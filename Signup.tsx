import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;

const Signup: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      await signup(values);
      message.success('Signup successful!');
      navigate('/app/user');
    } catch (error: any) {
      message.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      minHeight: '100vh',
      background: '#f0f2f5'
    }}>
      <Card style={{ width: 400 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Title level={2}>Sign Up</Title>
        </div>
        <Form
          name="signup"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input your name!' },
              { min: 20, message: 'Name must be at least 20 characters!' },
              { max: 60, message: 'Name must not exceed 60 characters!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Full Name (20-60 characters)" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              { max: 16, message: 'Password must not exceed 16 characters!' },
              {
                pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/,
                message: 'Password must contain uppercase letter and special character!'
              }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password (8-16 chars, uppercase + special)"
            />
          </Form.Item>

          <Form.Item
            name="address"
            rules={[
              { max: 400, message: 'Address must not exceed 400 characters!' }
            ]}
          >
            <Input.TextArea
              placeholder="Address (Optional, max 400 characters)"
              rows={3}
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              style={{ width: '100%' }}
            >
              Sign Up
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            Already have an account? <Link to="/login">Login</Link>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Signup;
