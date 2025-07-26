import React, { useState } from 'react';
import axios from 'axios';
import './ChangePassword.css';
import ProfileLayout from '../profile/profileLayout/ProfileLayout';

const ChangePassword = () => {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin mật khẩu.' });
      setLoading(false);
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setMessage({ type: 'error', text: 'Mật khẩu mới và xác nhận mật khẩu không khớp.' });
      setLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
      setLoading(false);
      return;
    }
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/change-password`, {
        oldPassword,
        newPassword,
        confirmNewPassword
      }, {
        withCredentials: true
      });
      if (response.status === 200) {
        setMessage({ type: 'success', text: response.data.message || 'Mật khẩu đã được đổi thành công.' });
        setOldPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setMessage({ type: 'info', text: response.data.message || 'Yêu cầu đổi mật khẩu đã được xử lý.' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: error.response?.data?.message || 'Đã xảy ra lỗi khi đổi mật khẩu.' });
    }
    setLoading(false);
  };

  return (
    <ProfileLayout>
      <div className="change-password-container">
        <div className="change-password-card">
          <h2>Đổi mật khẩu</h2>
          <form onSubmit={handleSubmit}>
            {message && (
              <p className={`message ${message.type}`}>{message.text}</p>
            )}
            <div className="form-group">
              <label htmlFor="oldPassword">Mật khẩu cũ:</label>
              <input
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">Mật khẩu mới:</label>
              <input
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmNewPassword">Xác nhận mật khẩu mới:</label>
              <input
                type="password"
                id="confirmNewPassword"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                className="form-input"
              />
            </div>
            <button type="submit" disabled={loading} className="submit-button">
              {loading ? 'Đang đổi mật khẩu...' : 'Đổi mật khẩu'}
            </button>
          </form>
        </div>
      </div>
    </ProfileLayout>
  );
};

export default ChangePassword; 