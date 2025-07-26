import React, { useState, useEffect } from 'react';
import { Modal, Descriptions, Tag, Spin, message, Card, Row, Col, Statistic, Avatar, Divider } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, CarOutlined, BookOutlined } from '@ant-design/icons';
import axios from 'axios';

const UserDetailModal = ({ visible, user, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    if (visible && user) {
      fetchUserDetail();
    }
  }, [visible, user]);

  const fetchUserDetail = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/admin/users/${user._id}`);
      if (response.data.success) {
        setUserDetail(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching user detail:', error);
      message.error('Lỗi khi tải chi tiết người dùng');
    } finally {
      setLoading(false);
    }
  };

  const getStatusTag = (status) => {
    const statusConfig = {
      active: { color: 'green', text: 'Hoạt động' },
      blocked: { color: 'red', text: 'Bị khóa' },
      pending: { color: 'orange', text: 'Chờ duyệt' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: status };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getRoleTag = (role) => {
    const roleConfig = {
      admin: { color: 'purple', text: 'Quản trị viên' },
      owner: { color: 'blue', text: 'Chủ xe' },
      renter: { color: 'cyan', text: 'Người thuê' }
    };
    
    const config = roleConfig[role] || { color: 'default', text: role };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const getVerificationTag = (status) => {
    const statusConfig = {
      verified: { color: 'green', text: 'Đã xác thực' },
      pending: { color: 'orange', text: 'Chờ xác thực' },
      rejected: { color: 'red', text: 'Bị từ chối' },
      unverified: { color: 'default', text: 'Chưa xác thực' }
    };
    
    const config = statusConfig[status] || { color: 'default', text: 'Không xác định' };
    return <Tag color={config.color}>{config.text}</Tag>;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount || 0);
  };

  if (!user) return null;

  return (
    <Modal
      title="Chi tiết người dùng"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={800}
      bodyStyle={{ maxHeight: '70vh', overflowY: 'auto' }}
    >
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      ) : userDetail ? (
        <div>
          {/* User Basic Info */}
          <Card style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
              <Avatar 
                size={64} 
                src={userDetail.user.avatar_url} 
                icon={<UserOutlined />}
                style={{ marginRight: '16px' }}
              />
              <div>
                <h3 style={{ margin: 0 }}>{userDetail.user.name}</h3>
                <p style={{ margin: 0, color: '#666' }}>ID: {userDetail.user._id}</p>
                <div style={{ marginTop: '8px' }}>
                  {getRoleTag(userDetail.user.role)}
                  {getStatusTag(userDetail.user.status)}
                </div>
              </div>
            </div>
            
            <Descriptions column={2} size="small">
              <Descriptions.Item label="Email" span={2}>
                <MailOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
                {userDetail.user.email}
                {userDetail.user.email_verified && (
                  <Tag color="green" style={{ marginLeft: '8px' }}>Đã xác thực</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Số điện thoại">
                <PhoneOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                {userDetail.user.phone || 'Chưa cập nhật'}
                {userDetail.user.phone_verified && userDetail.user.phone && (
                  <Tag color="green" style={{ marginLeft: '8px' }}>Đã xác thực</Tag>
                )}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày tạo">
                <CalendarOutlined style={{ marginRight: '8px', color: '#fa8c16' }} />
                {new Date(userDetail.user.created_at).toLocaleDateString('vi-VN')}
              </Descriptions.Item>
              
              <Descriptions.Item label="Phương thức đăng nhập">
                {userDetail.user.login_method || 'Email'}
              </Descriptions.Item>
              
              <Descriptions.Item label="Ngày cập nhật cuối">
                {userDetail.user.updated_at ? new Date(userDetail.user.updated_at).toLocaleDateString('vi-VN') : 'Chưa cập nhật'}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Verification Status */}
          <Card title="Trạng thái xác thực" style={{ marginBottom: '16px' }}>
            <Row gutter={16}>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '8px' }}>CCCD</div>
                  {getVerificationTag(userDetail.user.cccd_verification_status)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '8px' }}>GPLX</div>
                  {getVerificationTag(userDetail.user.driver_license_verification_status)}
                </div>
              </Col>
              <Col span={8}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ marginBottom: '8px' }}>Yêu cầu chủ xe</div>
                  {userDetail.user.owner_request_status ? 
                    getVerificationTag(userDetail.user.owner_request_status) : 
                    <Tag color="default">Chưa yêu cầu</Tag>
                  }
                </div>
              </Col>
            </Row>
          </Card>



          {/* Statistics */}
          {userDetail.stats && Object.keys(userDetail.stats).length > 0 && (
            <Card title="Thống kê hoạt động">
              <Row gutter={16}>
                {userDetail.user.role === 'owner' && (
                  <>
                    <Col span={8}>
                      <Statistic
                        title="Số xe"
                        value={userDetail.stats.vehicleCount || 0}
                        prefix={<CarOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Tổng đơn thuê"
                        value={userDetail.stats.totalBookings || 0}
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col span={8}>
                      <Statistic
                        title="Đơn hoàn thành"
                        value={userDetail.stats.completedBookings || 0}
                        prefix={<BookOutlined />}
                      />
                    </Col>
                  </>
                )}
                
                {userDetail.user.role === 'renter' && (
                  <>
                    <Col span={12}>
                      <Statistic
                        title="Tổng đơn thuê"
                        value={userDetail.stats.totalBookings || 0}
                        prefix={<BookOutlined />}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Đơn hoàn thành"
                        value={userDetail.stats.completedBookings || 0}
                        prefix={<BookOutlined />}
                      />
                    </Col>
                  </>
                )}
              </Row>
            </Card>
          )}

          {/* CCCD Info */}
          {userDetail.user.cccd_number && (
            <Card title="Thông tin CCCD" style={{ marginTop: '16px' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Số CCCD">
                  {userDetail.user.cccd_number}
                </Descriptions.Item>
                <Descriptions.Item label="Họ tên trên CCCD">
                  {userDetail.user.cccd_full_name}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {userDetail.user.cccd_birth_date}
                </Descriptions.Item>
                {userDetail.user.cccd_image && (
                  <Descriptions.Item label="Ảnh CCCD">
                    <img 
                      src={userDetail.user.cccd_image} 
                      alt="CCCD" 
                      style={{ maxWidth: '200px', maxHeight: '120px' }}
                    />
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}

          {/* Driver License Info */}
          {userDetail.user.driver_license_number && (
            <Card title="Thông tin GPLX" style={{ marginTop: '16px' }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Số GPLX">
                  {userDetail.user.driver_license_number}
                </Descriptions.Item>
                <Descriptions.Item label="Họ tên trên GPLX">
                  {userDetail.user.driver_license_full_name}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày sinh">
                  {userDetail.user.driver_license_birth_date}
                </Descriptions.Item>
                {userDetail.user.driver_license_image && (
                  <Descriptions.Item label="Ảnh GPLX">
                    <img 
                      src={userDetail.user.driver_license_image} 
                      alt="GPLX" 
                      style={{ maxWidth: '200px', maxHeight: '120px' }}
                    />
                  </Descriptions.Item>
                )}
              </Descriptions>
            </Card>
          )}
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>Không thể tải thông tin người dùng</p>
        </div>
      )}
    </Modal>
  );
};

export default UserDetailModal;