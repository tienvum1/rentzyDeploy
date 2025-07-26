import React, { useState, useEffect } from 'react';
import './UpdateEmailPopup.css'; // Reusing the same CSS file for general styles
import { FaTimes } from 'react-icons/fa'; // Close icon
import axios from 'axios';

const VerifyPhonePopup = ({ open, onClose, onVerifyOtp, userPhone, errorMessage, setErrorMessage }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (cooldown > 0) {
      timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [cooldown]);

  useEffect(() => {
    if (open) {
      setOtp('');
      setMessage('');
      setErrorMessage('');
      setCooldown(0);
    }
  }, [open, setErrorMessage]);

  const handleVerifyClick = async () => {
    if (!otp.trim()) {
      setErrorMessage('Vui lòng nhập mã OTP.');
      return;
    }
    setLoading(true);
    setErrorMessage('');
    await onVerifyOtp(otp); // This will be passed from Profile.jsx
    setLoading(false);
  };

  const handleResendClick = async () => {
    if (cooldown > 0) return;
    setCooldown(60); // Start cooldown immediately for instant feedback
    setMessage('');
    setErrorMessage('');
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'}/api/user/resend-phone-otp`,
        { phone: userPhone },
        {
          withCredentials: true,
        }
      );
      setMessage('Mã OTP mới đã được gửi thành công.');
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Lỗi khi gửi lại mã OTP.';
      setErrorMessage(errorMsg);
      setCooldown(0); // Reset cooldown on error so user can try again
    }
  };

  if (!open) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Xác minh số điện thoại</h3> {/* Title */}
        <p>Chúng tôi đã gửi mã OTP đến số: <strong>{userPhone}</strong></p>
        {errorMessage && <p className="popup-message error">{errorMessage}</p>}
        {message && <p className="popup-message success">{message}</p>}
        <input
          type="text"
          placeholder="Nhập mã OTP"
          value={otp}
          onChange={(e) => {
            setOtp(e.target.value);
            if (errorMessage) setErrorMessage('');
          }}
          className="popup-input"
        />
        <button onClick={handleVerifyClick} disabled={loading} className="popup-update-btn"> {/* Reusing popup-update-btn class */}
          {loading ? 'Đang xác minh...' : 'Xác minh'}
        </button>
        <div className="popup-resend-container">
          <button onClick={handleResendClick} disabled={cooldown > 0} className="popup-resend-link">
            {cooldown > 0 ? `Gửi lại sau (${cooldown}s)` : 'Gửi lại mã OTP'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerifyPhonePopup;