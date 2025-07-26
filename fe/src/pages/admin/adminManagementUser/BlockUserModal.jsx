import React, { useState } from 'react';
import { Modal, Form, Input, Button, message, Alert } from 'antd';
import { LockOutlined, UnlockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { TextArea } = Input;

const BlockUserModal = ({ visible, user, onClose, onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

  const isBlocked = user.isActive === false;
  const action = isBlocked ? 'unblock' : 'block';
  const title = isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản';
  const buttonText = isBlocked ? 'Mở khóa' : 'Khóa tài khoản';
  const buttonType = isBlocked ? 'primary' : 'danger';
  const icon = isBlocked ? <UnlockOutlined /> : <LockOutlined />;

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      const payload = {
        action,
        reason: values.reason || (isBlocked ? 'Mở khóa tài khoản' : 'Khóa tài khoản')
      };

      const response = await axios.put(`/api/admin/users/${user._id}/block`, payload);
      
      if (response.data.success) {
        message.success(response.data.message);
        form.resetFields();
        onSuccess();
      }
    } catch (error) {
      console.error('Error blocking/unblocking user:', error);
      const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái người dùng';
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {icon}
          <span style={{ marginLeft: '8px' }}>{title}</span>
        </div>
      }
      visible={visible}
      onCancel={handleCancel}
      footer={null}
      width={500}
    >
      <div style={{ marginBottom: '16px' }}>
        <Alert
          message={
            <div>
              <strong>Người dùng: </strong>{user.name} ({user.email})
            </div>
          }
          description={
            isBlocked 
              ? 'Bạn có chắc chắn muốn mở khóa tài khoản này? Người dùng sẽ có thể sử dụng lại tất cả các tính năng.'
              : 'Bạn có chắc chắn muốn khóa tài khoản này? Người dùng sẽ không thể đăng nhập và sử dụng các tính năng của hệ thống.'
          }
          type={isBlocked ? 'info' : 'warning'}
          icon={<ExclamationCircleOutlined />}
          showIcon
        />
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          reason: isBlocked ? '' : ''
        }}
      >
        <Form.Item
          label={isBlocked ? 'Lý do mở khóa (tùy chọn)' : 'Lý do khóa tài khoản'}
          name="reason"
          rules={[
            {
              required: !isBlocked,
              message: 'Vui lòng nhập lý do khóa tài khoản'
            },
            {
              min: isBlocked ? 0 : 10,
              message: 'Lý do phải có ít nhất 10 ký tự'
            },
            {
              max: 500,
              message: 'Lý do không được vượt quá 500 ký tự'
            }
          ]}
        >
          <TextArea
            rows={4}
            placeholder={
              isBlocked 
                ? 'Nhập lý do mở khóa (tùy chọn)...'
                : 'Nhập lý do khóa tài khoản. Thông tin này sẽ được gửi đến email của người dùng.'
            }
            showCount
            maxLength={500}
          />
        </Form.Item>

        <div style={{ textAlign: 'right', marginTop: '24px' }}>
          <Button 
            onClick={handleCancel} 
            style={{ marginRight: '8px' }}
            disabled={loading}
          >
            Hủy
          </Button>
          <Button
            type={buttonType}
            htmlType="submit"
            loading={loading}
            icon={icon}
          >
            {buttonText}
          </Button>
        </div>
      </Form>

      {!isBlocked && (
        <div style={{ marginTop: '16px' }}>
          <Alert
            message="Lưu ý"
            description={
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>Người dùng sẽ nhận được email thông báo về việc khóa tài khoản</li>
                <li>Tài khoản bị khóa sẽ không thể đăng nhập vào hệ thống</li>
                <li>Các đơn đặt xe đang diễn ra sẽ không bị ảnh hưởng</li>
                <li>Bạn có thể mở khóa tài khoản bất cứ lúc nào</li>
              </ul>
            }
            type="info"
            showIcon
          />
        </div>
      )}
    </Modal>
  );
};

export default BlockUserModal;