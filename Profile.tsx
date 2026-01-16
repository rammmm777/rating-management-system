import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message, Space } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const { Title } = Typography;

const Profile: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const onFinish = async (values: { oldPassword: string; newPassword: string }) => {
    setLoading(true);
    try {
      await axios.patch('http://localhost:5000/api/auth/update-password', values);
      message.success('Password updated successfully!');
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <Card>
        <Title level={3}>Profile</Title>
        
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <h4>User Information</h4>
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> {user?.role}</p>
          </div>

          <div>
            <h4>Change Password</h4>
            <Form
              name="changePassword"
              onFinish={onFinish}
              layout="vertical"
              style={{ marginTop: '1rem' }}
            >
              <Form.Item
                name="oldPassword"
                rules={[{ required: true, message: 'Please input your current password!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Current Password"
                />
              </Form.Item>

              <Form.Item
                name="newPassword"
                rules={[
                  { required: true, message: 'Please input your new password!' },
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
                  placeholder="New Password (8-16 chars, uppercase + special)"
                />
              </Form.Item>

              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                >
                  Update Password
                </Button>
              </Form.Item>
            </Form>
          </div>
        </Space>
      </Card>
    </div>
  );
};

export default Profile;
