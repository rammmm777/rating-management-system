import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Table, 
  Input, 
  Button, 
  Rate, 
  Modal, 
  Form, 
  message,
  Space,
  Tag
} from 'antd';
import { SearchOutlined, StarOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';

interface Store {
  id: number;
  name: string;
  email: string;
  address?: string;
  average_rating: number;
  user_rating?: number;
}

const UserDashboard: React.FC = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [searchName, setSearchName] = useState('');
  const [searchAddress, setSearchAddress] = useState('');
  const [ratingForm] = Form.useForm();

  useEffect(() => {
    fetchStores();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchName, searchAddress]);

  const fetchStores = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchName) params.append('name', searchName);
      if (searchAddress) params.append('address', searchAddress);
      
      const response = await axios.get(`http://localhost:5000/api/user/stores?${params}`);
      setStores(response.data);
    } catch (error) {
      message.error('Failed to fetch stores');
    } finally {
      setLoading(false);
    }
  };

  const handleRateStore = (store: Store) => {
    setSelectedStore(store);
    setRatingModalVisible(true);
    if (store.user_rating) {
      ratingForm.setFieldsValue({ rating: store.user_rating });
    }
  };

  const handleSubmitRating = async (values: { rating: number }) => {
    if (!selectedStore) return;

    try {
      if (selectedStore.user_rating) {
        // Update existing rating
        await axios.patch(`http://localhost:5000/api/user/ratings/${selectedStore.id}`, {
          rating: values.rating
        });
        message.success('Rating updated successfully');
      } else {
        // Submit new rating
        await axios.post('http://localhost:5000/api/user/ratings', {
          store_id: selectedStore.id,
          rating: values.rating
        });
        message.success('Rating submitted successfully');
      }
      
      setRatingModalVisible(false);
      ratingForm.resetFields();
      setSelectedStore(null);
      fetchStores();
    } catch (error: any) {
      message.error(error.response?.data?.error || 'Failed to submit rating');
    }
  };

  const columns = [
    {
      title: 'Store Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Address',
      dataIndex: 'address',
      key: 'address',
      render: (address: string) => address || 'N/A',
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
      title: 'Your Rating',
      dataIndex: 'user_rating',
      key: 'user_rating',
      render: (rating: number, record: Store) => (
        rating ? (
          <Tag color="blue">
            <StarOutlined /> {rating}
          </Tag>
        ) : (
          <Tag>Not Rated</Tag>
        )
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: React.ReactNode, record: Store) => (
        <Button
          type="primary"
          icon={<EditOutlined />}
          onClick={() => handleRateStore(record)}
        >
          {record.user_rating ? 'Update Rating' : 'Rate Store'}
        </Button>
      ),
    },
  ];

  return (
    <div>
      <Card title="Stores" style={{ marginBottom: '2rem' }}>
        <Space style={{ marginBottom: '1rem' }} size="middle">
          <Input
            placeholder="Search by store name"
            prefix={<SearchOutlined />}
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{ width: 250 }}
          />
          <Input
            placeholder="Search by address"
            prefix={<SearchOutlined />}
            value={searchAddress}
            onChange={(e) => setSearchAddress(e.target.value)}
            style={{ width: 250 }}
          />
          <Button onClick={() => {
            setSearchName('');
            setSearchAddress('');
          }}>
            Clear Filters
          </Button>
        </Space>

        <Table
          columns={columns}
          dataSource={stores}
          loading={loading}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title={`Rate ${selectedStore?.name}`}
        open={ratingModalVisible}
        onCancel={() => {
          setRatingModalVisible(false);
          setSelectedStore(null);
          ratingForm.resetFields();
        }}
        footer={null}
      >
        <Form form={ratingForm} onFinish={handleSubmitRating} layout="vertical">
          <Form.Item
            name="rating"
            label="Rating"
            rules={[{ required: true, message: 'Please select a rating!' }]}
          >
            <Rate />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {selectedStore?.user_rating ? 'Update Rating' : 'Submit Rating'}
              </Button>
              <Button onClick={() => {
                setRatingModalVisible(false);
                setSelectedStore(null);
                ratingForm.resetFields();
              }}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDashboard;
