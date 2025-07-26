import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AvatarPopup from './AvatarPopup';
import './Profile.css';
import { FaExclamationCircle, FaPencilAlt, FaCheckCircle, FaUser } from 'react-icons/fa';
import UpdateEmailPopup from './UpdateEmailPopup';
import UpdatePhonePopup from './UpdatePhonePopup';
import VerifyEmailPopup from './VerifyEmailPopup';
import axios from 'axios';
import VerifyPhonePopup from './VerifyPhonePopup';
import UpdateNamePopup from './UpdateNamePopup';
import DriverLicenseVerification from './DriverLicenseVerification';
import ProfileLayout from '../profileLayout/ProfileLayout';
import BankAccountPage from './BankAccountPage';
import CCCDPage from './CCCDPage';
import CCCDVerification from './CCCDVerification';

const Profile = () => {
  const { user, isAuthenticated, isLoading, login } = useAuth();
  const navigate = useNavigate();

  const [message, setMessage] = useState(null);
  const [showAvatarPopup, setShowAvatarPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [showVerifyEmailPopup, setShowVerifyEmailPopup] = useState(false);
  const [emailUpdateErrorMessage, setEmailUpdateErrorMessage] = useState(null);
  const [showVerifyPhonePopup, setShowVerifyPhonePopup] = useState(false);
  const [phoneUpdateErrorMessage, setPhoneUpdateErrorMessage] = useState(null);
  const [phoneVerificationError, setPhoneVerificationError] = useState('');
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, isLoading, navigate]);

  const handleUpdateName = async (newName) => {
    setMessage(null);
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/update-profile`, {
        name: newName
      }, {
        withCredentials: true
      });

      if (response.status === 200) {
        setMessage(response.data.message || 'Tên người dùng đã được cập nhật thành công!');
        await login();
        setShowNamePopup(false);
      } else {
        setMessage(response.data.message || 'Cập nhật tên người dùng thành công nhưng có cảnh báo.');
        await login();
        setShowNamePopup(false);
      }
    } catch (error) {
      console.error('Error updating name:', error.response?.data || error.message);
      setMessage(error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật tên người dùng.');
      setShowNamePopup(false);
    }
  };

  const handleAvatarSave = async (file) => {
    setMessage('');
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await fetch('/api/user/update-avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Avatar update failed');
      setShowAvatarPopup(false);
      await login();
      setMessage('Avatar updated successfully!');
    } catch {
      setMessage('Error updating avatar!');
    }
  };

  const formatDate = (date) => {
    if (!date || isNaN(Date.parse(String(date)))) return 'Invalid date';
    return new Date(String(date)).toLocaleDateString('vi-VN');
  };

  if (isLoading || !user) return <div>Loading...</div>;

  return (
    <ProfileLayout>
      <div style={{ display: 'flex', gap: 16, marginBottom: 24 }}>
        <button
          onClick={() => setActiveTab('profile')}
          style={{ padding: '8px 16px', background: activeTab === 'profile' ? '#1976d2' : '#eee', color: activeTab === 'profile' ? '#fff' : '#333', border: 'none', borderRadius: 4 }}
        >
          Thông tin cá nhân
        </button>
        <button
          onClick={() => setActiveTab('gplx')}
          style={{ padding: '8px 16px', background: activeTab === 'gplx' ? '#1976d2' : '#eee', color: activeTab === 'gplx' ? '#fff' : '#333', border: 'none', borderRadius: 4 }}
        >
          Giấy phép lái xe
        </button>
        
        <button
          onClick={() => setActiveTab('cccdAI')}
          style={{ padding: '8px 16px', background: activeTab === 'cccdAI' ? '#1976d2' : '#eee', color: activeTab === 'cccdAI' ? '#fff' : '#333', border: 'none', borderRadius: 4 }}
        >
          CCCD 
        </button>
        {/* <button
          onClick={() => setActiveTab('cccd')}
          style={{ padding: '8px 16px', background: activeTab === 'cccd' ? '#1976d2' : '#eee', color: activeTab === 'cccd' ? '#fff' : '#333', border: 'none', borderRadius: 4 }}
        >
          CCCD 
        </button> */}
        <button
          onClick={() => setActiveTab('bank')}
          style={{ padding: '8px 16px', background: activeTab === 'bank' ? '#1976d2' : '#eee', color: activeTab === 'bank' ? '#fff' : '#333', border: 'none', borderRadius: 4 }}
        >
          Tài khoản ngân hàng
        </button>
      </div>
      {activeTab === 'profile' && (
        <div className="profile__card">
          {/* Avatar Section */}
          <div
            className="profile__avatar-wrap"
            onClick={() => setShowAvatarPopup(true)}
            role="button"
            tabIndex={0}
          >
            <img
              src={user.avatar_url || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
              alt={user.name || 'User Avatar'}
              className="profile__avatar"
            />
            <span className="profile__avatar-edit">✏️</span>
          </div>
          <div className="profile__avatar-note">Click to change avatar</div>

          {/* Profile Display */}
          <div className="profile__form">
            <div className="profile__field">
              <span className="profile__label">Name:</span>
              <div className="profile__name-details">
                <span className="profile__value">{user.name || 'Not set'}</span>
                <FaPencilAlt
                  className="profile__edit-icon"
                  onClick={() => setShowNamePopup(true)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="profile__field">
              <span className="profile__label">Email:</span>
              <div className="profile__email-details">
                {!user.is_verified && (
                  <span className="profile__verification-badge profile__not-verified-badge">
                    <FaExclamationCircle className="badge-icon" />
                    Chưa xác thực
                  </span>
                )}
                {user.is_verified && (
                  <span className="profile__verification-badge profile__verified-badge">
                    <FaCheckCircle className="badge-icon" />
                    Đã xác thực
                  </span>
                )}
                <span className="profile__value">{user.email}</span>
                <FaPencilAlt
                  className="profile__edit-icon"
                  onClick={() => setShowEmailPopup(true)}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="profile__field">
              <span className="profile__label">Phone:</span>
              <div className="profile__phone-details">
                {!user.is_phone_verified && user.phone && (
                  <span className="profile__verification-badge profile__not-verified-badge">
                    <FaExclamationCircle className="badge-icon" />
                    Chưa xác thực
                  </span>
                )}
                {user.is_phone_verified && user.phone && (
                  <span className="profile__verification-badge profile__verified-badge">
                    <FaCheckCircle className="badge-icon" />
                    Đã xác thực
                  </span>
                )}
                <span className="profile__value">{user.phone || 'Not set'}</span>
                <FaPencilAlt
                  className="profile__edit-icon"
                  onClick={() => {
                    if (user.phone && !user.is_phone_verified) {
                      setShowVerifyPhonePopup(true);
                    } else {
                      setShowPhonePopup(true);
                    }
                  }}
                  style={{ cursor: 'pointer' }}
                />
              </div>
            </div>

            <div className="profile__field">
              <span className="profile__label">Role:</span>
              <span className="profile__value">
                {Array.isArray(user.role) ? user.role.join(', ') : user.role}
              </span>
            </div>

            <div className="profile__field">
              <span className="profile__label">Created:</span>
              <span className="profile__value">{formatDate(user.created_at)}</span>
            </div>

            {message && <div className="profile__msg">{message}</div>}
          </div>
        </div>
      )}
      {activeTab === 'gplx' && <DriverLicenseVerification />}
      {activeTab === 'cccd' && <CCCDPage />}
      {activeTab === 'cccdAI' && <CCCDVerification />}
      {activeTab === 'bank' && <BankAccountPage />}
      <AvatarPopup
        open={showAvatarPopup}
        onClose={() => setShowAvatarPopup(false)}
        onSave={handleAvatarSave}
      />
      <UpdateEmailPopup
        open={showEmailPopup}
        onClose={() => setShowEmailPopup(false)}
        onUpdateEmail={async (newEmail) => {
          try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/update-email`, { email: newEmail }, { withCredentials: true });
            if (response.data.requiresVerification) {
              setShowEmailPopup(false);
              setShowVerifyEmailPopup(true);
            } else {
              await login();
              setShowEmailPopup(false);
              setMessage(response.data.message || 'Email updated!');
            }
          } catch (error) {
            setEmailUpdateErrorMessage(error.response?.data?.message || 'Lỗi khi cập nhật email.');
          }
        }}
        currentEmail={user.email}
        errorMessage={emailUpdateErrorMessage}
      />
      <UpdatePhonePopup
        open={showPhonePopup}
        onClose={() => setShowPhonePopup(false)}
        onUpdatePhone={async (newPhone) => {
          try {
            const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/update-phone`, { phone: newPhone }, { withCredentials: true });
            // Since we no longer require verification, always refresh user data and close popup
            await login(); // Refresh user data
            setShowPhonePopup(false);
            setMessage(response.data.message || 'Số điện thoại đã được cập nhật thành công!');
          } catch (error) {
            setPhoneUpdateErrorMessage(error.response?.data?.message || 'Lỗi khi cập nhật số điện thoại.');
          }
        }}
        currentPhone={user.phone}
        errorMessage={phoneUpdateErrorMessage}
      />
      <UpdateNamePopup
        open={showNamePopup}
        onClose={() => setShowNamePopup(false)}
        onUpdateName={handleUpdateName}
        currentName={user.name}
      />
      <VerifyEmailPopup
        open={showVerifyEmailPopup}
        onClose={() => setShowVerifyEmailPopup(false)}
        onVerifyOtp={async (otp) => {
          try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/verify-email-otp`, { otp }, { withCredentials: true });
            await login();
            setShowVerifyEmailPopup(false);
            setMessage(response.data.message || 'Email xác minh thành công!');
          } catch (error) {
            console.error('Lỗi khi xác minh OTP email:', error.response?.data?.message || error.message);
            // You could set an error message in the popup here
          }
        }}
        onResendOtp={async () => {
          try {
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/resend-email-otp`, {}, { withCredentials: true });
            setMessage(response.data.message || 'Mã OTP mới đã được gửi.');
          } catch (error) {
            setMessage(error.response?.data?.message || 'Gửi lại mã OTP thất bại.');
          }
        }}
      />
      <VerifyPhonePopup
        open={showVerifyPhonePopup}
        onClose={() => setShowVerifyPhonePopup(false)}
        userPhone={user.phone}
        onVerifyOtp={async (otp) => {
          try {
            setPhoneVerificationError('');
            const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/verify-phone-otp`, { otp }, { withCredentials: true });
            await login();
            setShowVerifyPhonePopup(false);
            setMessage(response.data.message || 'Số điện thoại đã được xác minh thành công!');
          } catch (error) {
            const errorMessage = error.response?.data?.message || 'Lỗi không xác định.';
            console.error('Lỗi khi xác minh OTP điện thoại:', errorMessage);
            setPhoneVerificationError(errorMessage);
          }
        }}
        errorMessage={phoneVerificationError}
        setErrorMessage={setPhoneVerificationError}
      />
    </ProfileLayout>
  );
};

export default Profile;
