import React, { useState, useEffect } from 'react';
import { Table, Button, Input, Select, Modal, message, Tag, Space, Pagination, Card, Row, Col, Statistic } from 'antd';
import { SearchOutlined, EyeOutlined, LockOutlined, UnlockOutlined, UserOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import '../adminDashboard/AdminDashboard.css';
import UserDetailModal from './UserDetailModal';
import BlockUserModal from './BlockUserModal';

const { Search } = Input;
const { Option } = Select;

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    search: '',
    role: '',
    status: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [blockModalVisible, setBlockModalVisible] = useState(false);
  const [userStats, setUserStats] = useState({
    total: 0,
    active: 0,
    blocked: 0,
    admins: 0,
    owners: 0,
    renters: 0
  });

  // Fetch users data
  const fetchUsers = async (page = 1, pageSize = 10, searchFilters = filters) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        ...searchFilters
      };
      
      const response = await axios.get('/api/admin/users', { params });
      
      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination({
          current: response.data.data.pagination.currentPage,
          pageSize: pageSize,
          total: response.data.data.pagination.totalUsers
        });
        
        // Calculate stats
        const stats = {
          total: response.data.data.pagination.totalUsers,
          active: response.data.data.users.filter(u => u.isActive === true).length,
          blocked: response.data.data.users.filter(u => u.isActive === false).length,
          admins: response.data.data.users.filter(u => u.role && u.role.includes('admin')).length,
          owners: response.data.data.users.filter(u => u.role && u.role.includes('owner')).length,
          renters: response.data.data.users.filter(u => u.role && u.role.includes('renter')).length
        };
        setUserStats(stats);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      message.error('Lỗi khi tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Handle search
  const handleSearch = (value) => {
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    fetchUsers(1, pagination.pageSize, newFilters);
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    fetchUsers(1, pagination.pageSize, newFilters);
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    fetchUsers(page, pageSize);
  };

  // Handle view user detail
  const handleViewDetail = async (user) => {
    setSelectedUser(user);
    setDetailModalVisible(true);
  };

  // Handle block/unblock user
  const handleBlockUser = (user) => {
    setSelectedUser(user);
    setBlockModalVisible(true);
  };

  // Handle block user success
  const handleBlockSuccess = () => {
    setBlockModalVisible(false);
    fetchUsers(pagination.current, pagination.pageSize);
  };

  // Get status tag based on isActive field
  const getStatusTag = (isActive) => {
    if (isActive === true) {
      return <Tag color="green">Hoạt động</Tag>;
    } else if (isActive === false) {
      return <Tag color="red">Bị khóa</Tag>;
    } else {
      return <Tag color="orange">Chờ duyệt</Tag>;
    }
  };

  // Get role tag
  const getRoleTag = (role) => {
    const roleConfig = {
      admin: { color: 'purple', text: 'Quản trị viên' },
      owner: { color: 'blue', text: 'Chủ xe' },
      renter: { color: 'cyan', text: 'Người thuê' }
    };
    
    // Handle role as array
    if (Array.isArray(role)) {
      // Show the highest priority role
      if (role.includes('admin')) {
        return <Tag color={roleConfig.admin.color}>{roleConfig.admin.text}</Tag>;
      } else if (role.includes('owner')) {
        return <Tag color={roleConfig.owner.color}>{roleConfig.owner.text}</Tag>;
      } else if (role.includes('renter')) {
        return <Tag color={roleConfig.renter.color}>{roleConfig.renter.text}</Tag>;
      }
    }
    
    const config = roleConfig[role] || { color: 'default', text: role };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  // Table columns
  const columns = [
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>ID: {record._id.slice(-6)}</div>
        </div>
      )
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
          {text}
        </div>
      )
    },
    {
      title: 'Số điện thoại',
      dataIndex: 'phone',
      key: 'phone',
      render: (text) => text ? (
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <PhoneOutlined style={{ marginRight: 8, color: '#52c41a' }} />
          {text}
        </div>
      ) : '-'
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => getRoleTag(role)
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => getStatusTag(isActive)
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            icon={<EyeOutlined />}
            size="small"
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type={record.isActive === false ? 'default' : 'danger'}
            icon={record.isActive === false ? <UnlockOutlined /> : <LockOutlined />}
            size="small"
            onClick={() => handleBlockUser(record)}
            disabled={Array.isArray(record.role) ? record.role.includes('admin') : record.role === 'admin'}
          >
            {record.isActive === false ? 'Mở khóa' : 'Khóa'}
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="admin-dashboard-root">
      <SidebarAdmin />
      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <h1>Quản lý người dùng</h1>
          <p>Quản lý tất cả người dùng trong hệ thống Rentzy</p>
        </header>
      
      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: '24px' }}>
        <Col span={4}>
          <Card>
            <Statistic
              title="Tổng người dùng"
              value={userStats.total}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Hoạt động"
              value={userStats.active}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Bị khóa"
              value={userStats.blocked}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Quản trị viên"
              value={userStats.admins}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Chủ xe"
              value={userStats.owners}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={4}>
          <Card>
            <Statistic
              title="Người thuê"
              value={userStats.renters}
              valueStyle={{ color: '#13c2c2' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card style={{ marginBottom: '24px' }}>
        <Row gutter={16}>
          <Col span={8}>
            <Search
              placeholder="Tìm kiếm theo tên, email, số điện thoại..."
              allowClear
              enterButton={<SearchOutlined />}
              onSearch={handleSearch}
              style={{ width: '100%' }}
            />
          </Col>
          <Col span={4}>
            <Select
              placeholder="Vai trò"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('role', value)}
            >
              <Option value="admin">Quản trị viên</Option>
              <Option value="owner">Chủ xe</Option>
              <Option value="renter">Người thuê</Option>
            </Select>
          </Col>
          <Col span={4}>
            <Select
              placeholder="Trạng thái"
              allowClear
              style={{ width: '100%' }}
              onChange={(value) => handleFilterChange('status', value)}
            >
              <Option value="active">Hoạt động</Option>
              <Option value="blocked">Bị khóa</Option>
              <Option value="pending">Chờ duyệt</Option>
            </Select>
          </Col>
        </Row>
      </Card>

      {/* Users Table */}
      <Card>
        <Table
          columns={columns}
          dataSource={users}
          rowKey="_id"
          loading={loading}
          pagination={false}
          scroll={{ x: 1200 }}
        />
        
        <div style={{ marginTop: '16px', textAlign: 'right' }}>
          <Pagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} người dùng`}
            onChange={handlePaginationChange}
            onShowSizeChange={handlePaginationChange}
          />
        </div>
      </Card>

      {/* User Detail Modal */}
      <UserDetailModal
        visible={detailModalVisible}
        user={selectedUser}
        onClose={() => setDetailModalVisible(false)}
      />

        {/* Block User Modal */}
        <BlockUserModal
          visible={blockModalVisible}
          user={selectedUser}
          onClose={() => setBlockModalVisible(false)}
          onSuccess={handleBlockSuccess}
        />
      </main>
    </div>
  );
};

export default UserManagement;