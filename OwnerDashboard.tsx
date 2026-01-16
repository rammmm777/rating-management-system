import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Row, 
  Col, 
  Statistic, 
  Table, 
  Rate, 
  Tag,
  Typography,
  Space
} from 'antd';
import { StarOutlined, ShopOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

interface StoreInfo {
  id: number;
  name: string;
  email: string;
  address?: string;
  average_rating: number;
  rating_count: number;
}

interface Rater {
  id: number;
  name: string;
  email: string;
  rating: number;
  created_at: string;
}

const OwnerDashboard: React.FC = () => {
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [raters, setRaters] = useState<Rater[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/owner/dashboard');
      setStoreInfo(response.data.storeInfo);
      setRaters(response.data.raters);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const raterColumns = [
    {
      title: 'User ID',
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
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Space>
          <Rate disabled value={rating} style={{ fontSize: 16 }} />
          <Tag color="blue">{rating}</Tag>
        </Space>
      ),
    },
    {
      title: 'Rated On',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date: string) => formatDate(date),
    },
  ];

  if (!storeInfo) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Title level={3}>No store found for this owner</Title>
        <p>Please contact an administrator to assign a store to your account.</p>
      </div>
    );
  }

  return (
    <div>
      <Row gutter={[16, 16]} style={{ marginBottom: '2rem' }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="Average Rating"
              value={storeInfo.average_rating}
              precision={1}
              prefix={<StarOutlined />}
              valueStyle={{ color: '#faad14' }}
              suffix="/ 5.0"
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Total Ratings"
              value={storeInfo.rating_count}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="Store Name"
              value={storeInfo.name}
              prefix={<ShopOutlined />}
              valueStyle={{ color: '#52c41a', fontSize: '18px' }}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Store Information" style={{ marginBottom: '2rem' }}>
        <Row gutter={[16, 16]}>
          <Col span={12}>
            <p><strong>Store Name:</strong> {storeInfo.name}</p>
            <p><strong>Email:</strong> {storeInfo.email}</p>
          </Col>
          <Col span={12}>
            <p><strong>Address:</strong> {storeInfo.address || 'N/A'}</p>
            <p><strong>Store ID:</strong> {storeInfo.id}</p>
          </Col>
        </Row>
      </Card>

      <Card title="User Ratings">
        <Table
          columns={raterColumns}
          dataSource={raters}
          loading={loading}
          rowKey="id"
          pagination={{ 
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} of ${total} ratings`
          }}
          locale={{
            emptyText: 'No ratings yet. Users will start rating your store soon!'
          }}
        />
      </Card>
    </div>
  );
};

export default OwnerDashboard;
