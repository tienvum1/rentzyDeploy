import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './ConsignForm.css';
import RentalSteps from './RentalSteps';
import Header from '../../components/Header/Header';
import Footer from '../../components/footer/Footer';
import axios from 'axios';

const ConsignForm = () => {
  const { user, setUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

  const handleRequestOwner = async () => {
    setLoading(true);
    setMessage('');
    setError('');
    try {
      // Gửi yêu cầu với thông tin đã có
      const payload = {
        name: user?.name,
        phone: user?.phone,
        cccd_number: user?.cccd_number,
      };
      // Không upload lại ảnh CCCD, backend sẽ lấy từ user
      const response = await axios.put(
        `${backendUrl}/api/owner/registerOwner`,
        payload,
        { withCredentials: true }
      );
      if (response.data.success) {
        setMessage('Đã gửi yêu cầu trở thành chủ xe. Vui lòng chờ admin duyệt!');
        setUser({ ...user, owner_request_status: 'pending' });
      } else {
        setError(response.data.message || 'Gửi yêu cầu thất bại.');
      }
    } catch (err) {
      // Nếu lỗi xác thực CCCD, hiển thị thông báo rõ ràng
      if (err.response?.data?.message === 'Bạn cần xác thực CCCD thành công trước khi đăng ký làm chủ xe.') {
        setError('Bạn cần xác thực CCCD thành công trước khi đăng ký làm chủ xe.');
      } else {
        setError(err.response?.data?.message || 'Gửi yêu cầu thất bại.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <div className="consign-main-bg">
        <div className="consign-main-container">
          <div className="consign-form-left">
            <h2 className="consign-title">
              Thông tin cá nhân <span className="brand-highlight">Rentzy</span>
            </h2>
            <p className="consign-desc">
              Đây là thông tin cá nhân của bạn đã lưu trên hệ thống. Nếu cần thay đổi, vui lòng cập nhật ở trang hồ sơ.
            </p>
            <div className="consign-form">
              <div className="form-group">
                <label>Họ tên</label>
                <input type="text" value={user?.cccd_full_name || ''} readOnly />
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <input type="text" value={user?.phone || ''} readOnly />
              </div>
              <div className="form-group">
                <label>Số CCCD</label>
                <input type="text" value={user?.cccd_number || ''} readOnly />
              </div>
              <div className="form-group">
                <label>Ảnh CCCD</label>
                {user?.cccd_image ? (
                  <img src={user.cccd_image} alt="CCCD" style={{ width: 180, borderRadius: 8, marginTop: 8 }} />
                ) : (
                  <div style={{ color: '#888', marginTop: 8 }}>Chưa có ảnh</div>
                )}
              </div>
              {/* Nút gửi yêu cầu trở thành chủ xe */}
              {user && (!user.role?.includes('owner')) && user.owner_request_status !== 'pending' && (
                <button
                  className="btn-submit"
                  style={{ marginTop: 24 }}
                  onClick={handleRequestOwner}
                  disabled={loading}
                >
                  {loading ? 'Đang gửi yêu cầu...' : 'Gửi yêu cầu duyệt thành chủ thuê xe'}
                </button>
              )}
              {/* Thông báo trạng thái */}
              {user && user.owner_request_status === 'pending' && (
                <div className="form-success" style={{ marginTop: 16 }}>
                  Đã gửi yêu cầu, vui lòng chờ admin duyệt!
                </div>
              )}
              {user && user.role?.includes('owner') && user.owner_request_status === 'approved' && (
                <div className="form-success" style={{ marginTop: 16 }}>
                  Bạn đã là chủ xe!
                </div>
              )}
              {message && <div className="form-success" style={{ marginTop: 16 }}>{message}</div>}
              {error && <div className="form-error" style={{ marginTop: 16 }}>{error}</div>}
            </div>
          </div>
        </div>
        <RentalSteps />
      </div>
      <Footer />
    </>
  );
};

export default ConsignForm;
