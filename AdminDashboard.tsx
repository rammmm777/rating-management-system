import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message,
  Space,
  Tag
} from 'antd';
import { PlusOutlined, UserOutlined, ShopOutlined, StarOutlined } from '@ant-design/icons';
import axios from 'axios';

interface DashboardStats {
  usersCount: number;
  storesCount: number;
  ratingsCount: number;
}

interface User {
  id: number;
  name: string;
  email: string;
  address?: string;
  role: string;
}

interface Store {
  id: number;
  name: string;
  email: string;
  address?: string;
  owner_name?: string;
  average_rating: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({ usersCount: 0, storesCount: 0, ratingsCount: 0 });
  const [users, setUsers] = useState<User[]>([]);
  const [stores, setStores] = useState<Store[]>([]);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [storeModalVisible, setStoreModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [storesLoading, setStoresLoading] = useState(false);
  const [userForm] = Form.useForm();
  const [storeForm] = Form.useForm();

  useEffect(() => {
    fetchStats();
    fetchUsers();
    fetchStores();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      message.error('Failed to fetch dashboard stats');
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      message.error('Failed to fetch users');
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchStores = async () => {
    setStoresLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/admin/stores');
      setStores(response.data);
    } catch (error) {
      message.error('Failed to fetch stores');
    } finally {
      setStoresLoading(false);
    }
  };

  const handleCreateUser = async (values: any) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/users', values);
      message.success('User created successfully');
      setUserModalVisible(false);
      userForm.resetFields();
      fetchUsers();
      fetchStats();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStore = async (values: any) => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/admin/stores', values);
      message.success('Store created successfully');
      setStoreModalVisible(false);
      storeForm.resetFields();
      fetchStores();
      fetchStats();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to create store');
    } finally {
      setLoading(false);
    }
  };

  const userColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Role',
      dataIndex: 'role',
      key: 'role',
      render: (role: string) => (
        <Tag color={role === 'admin' ? 'red' : role === 'owner' ? 'blue' : 'green'}>
          {role.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => address || 'N/A',
    },
  ];

  const storeColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Owner',
      dataIndex: 'owner_name',
      key: 'owner_name',
      render: (owner: string) => owner || 'N/A',
    },
    {
      title: 'Average Rating',
      dataIndex: 'average_rating',
      key: 'average_rating',
      render: (rating: number) => (
        <Space>
          <StarOutlined style={{ color: '#faad14' }} />
          {rating.toFixed(1)}
        </Space>
      ),
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => address || 'N/A',
    },
  ];

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Users"
              value={stats.usersCount}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Stores"
              value={stats.storesCount}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Ratings"
              value={stats.ratingsCount}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title="Users Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setUserModalVisible(true)}
          >
            Add User
          </Button>
        }
        style={{ marginBottom: '2rem' }}
      >
        <Table
          columns={userColumns}
          dataSource={users}
          loading={usersLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Card 
        title="Stores Management" 
        extra={
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={() => setStoreModalVisible(true)}
          >
            Add Store
          </Button>
        }
      >
        <Table
          columns={storeColumns}
          dataSource={stores}
          loading={storesLoading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Create New User"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={null}
      >
        <Form form={userForm} onFinish={handleCreateUser} layout="vertical">
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input name!' },
              { min: 20, message: 'Name must be at least 20 characters!' },
              { max: 60, message: 'Name must not exceed 60 characters!' }
            ]}
          >
            <Input placeholder="Name (20-60 characters)" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Invalid email!' }
            ]}
          >
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please input password!' },
              { min: 8, message: 'Password must be at least 8 characters!' },
              { max: 16, message: 'Password must not exceed 16 characters!' },
              {
                pattern: /^(?=.*[A-Z])(?=.*[!@#$%^&*]).{8,16}$/,
                message: 'Password must contain uppercase letter and special character!'
              }
            ]}
          >
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item
            name="role"
            rules={[{ required: true, message: 'Please select role!' }]}
          >
            <Select placeholder="Select Role">
              <Select.Option value="admin">Admin</Select.Option>
              <Select.Option value="user">User</Select.Option>
              <Select.Option value="owner">Owner</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="address">
            <Input.TextArea placeholder="Address (Optional)" rows={3} />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create User
              </Button>
              <Button onClick={() => setUserModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Create New Store"
        open={storeModalVisible}
        onCancel={() => setStoreModalVisible(false)}
        footer={null}
      >
        <Form form={storeForm} onFinish={handleCreateStore} layout="vertical">
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Please input store name!' },
              { min: 20, message: 'Name must be at least 20 characters!' },
              { max: 60, message: 'Name must not exceed 60 characters!' }
            ]}
          >
            <Input placeholder="Store Name (20-60 characters)" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please input email!' },
              { type: 'email', message: 'Invalid email!' }
            ]}
          >
            <Input placeholder="Store Email" />
          </Form.Item>
          <Form.Item name="address">
            <Input.TextArea placeholder="Store Address (Optional)" rows={3} />
          </Form.Item>
          <Form.Item name="owner_id">
            <Input placeholder="Owner ID (Optional)" type="number" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Create Store
              </Button>
              <Button onClick={() => setStoreModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
