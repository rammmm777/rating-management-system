import React from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout as AntLayout, Menu, Button, Typography, Space } from 'antd';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Content } = AntLayout;
const { Title } = Typography;

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getMenuItems = () => {
    const items = [];
    
    if (user?.role === 'admin') {
      items.push({
        key: '/app/admin',
        label: 'Dashboard',
      });
      items.push({
        key: '/app/profile',
        label: 'Profile',
      });
    } else if (user?.role === 'user') {
      items.push({
        key: '/app/user',
        label: 'Stores',
      });
      items.push({
        key: '/app/profile',
        label: 'Profile',
      });
    } else if (user?.role === 'owner') {
      items.push({
        key: '/app/owner',
        label: 'Dashboard',
      });
      items.push({
        key: '/app/profile',
        label: 'Profile',
      });
    }
    
    return items;
  };

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Title level={3} style={{ color: 'white', margin: 0 }}>
            Rating Management System
          </Title>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={getMenuItems()}
            onClick={handleMenuClick}
            style={{ marginLeft: '2rem', border: 'none' }}
          />
        </div>
        <Space>
          <span style={{ color: 'white' }}>
            <UserOutlined /> {user?.name} ({user?.role})
          </span>
          <Button
            type="primary"
            icon={<LogoutOutlined />}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </Space>
      </Header>
      <Content style={{ padding: '2rem' }}>
        <Outlet />
      </Content>
    </AntLayout>
  );
};

export default Layout;
