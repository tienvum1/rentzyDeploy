import React, { useState } from 'react';
import './UpdateEmailPopup.css'; // Reusing the same CSS file for general styles
import { FaTimes } from 'react-icons/fa'; // Close icon

const VerifyEmailPopup = ({ open, onClose, onVerifyOtp, onResendOtp }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [resendLoading, setResendLoading] = useState(false); // State for resend button loading

  // Reset state when popup opens/closes
  useState(() => {
      if(open) {
          setOtp(''); // Clear OTP when opening
          setMessage(null);
          setLoading(false);
          setResendLoading(false);
      }
  }, [open]);

  const handleOtpChange = (e) => {
    setOtp(e.target.value);
  };

  const handleVerifyClick = async () => {
    if (!otp.trim()) {
      setMessage({ type: 'error', text: 'Vui lòng nhập mã OTP.' });
      return;
    }

    setLoading(true);
    setMessage(null);
    await onVerifyOtp(otp);
    setLoading(false);
    // message and closing will be handled by parent via onVerifyOtp callback
  };

  const handleResendClick = async () => {
      setResendLoading(true);
      setMessage(null); // Clear previous messages
      await onResendOtp();
      setResendLoading(false);
      // message will be handled by parent via onResendOtp callback (e.g., show success message)
  };

  if (!open) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Xác minh email</h3> {/* Title */}
        {message && <p className={`popup-message ${message.type}`}>{message.text}</p>}
        <input
          type="text"
          placeholder="Nhập mã OTP từ email"
          value={otp}
          onChange={handleOtpChange}
          className="popup-input"
        />
        <button onClick={handleVerifyClick} disabled={loading} className="popup-update-btn"> {/* Reusing popup-update-btn class */}
          {loading ? 'Đang xác minh...' : 'Xác minh'}
        </button>
        <button onClick={handleResendClick} disabled={resendLoading} className="popup-resend-btn"> {/* New class for resend button */}
            {resendLoading ? 'Đang gửi lại...' : 'Không nhận được mã OTP. Yêu cầu gửi lại'}
        </button>
      </div>
    </div>
  );
};

export default VerifyEmailPopup; 