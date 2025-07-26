import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SetPasswordPrompt.css'; // Import the CSS file

const SetPasswordPrompt = ({ isVisible, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    // Prevent scrolling when the prompt is visible
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to reset overflow when component unmounts or visibility changes
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isVisible]); // Depend on isVisible state

  if (!isVisible) {
    return null; // Don't render if not visible
  }

  const handleGoToSetPassword = () => {
    navigate('/set-password');
    onClose(); // Close the prompt after navigating
  };

  return (
    <>
      {/* Backdrop */}
      <div className="backdrop" onClick={onClose}></div>

      {/* Prompt Popup */}
      <div className="set-password-prompt">
        <h3>Chào mừng!</h3>
        <p>Bạn đã đăng nhập bằng Google. Vui lòng thiết lập mật khẩu để có thể đăng nhập bằng email và mật khẩu sau này.</p>
        <button onClick={handleGoToSetPassword} className="prompt-button primary">Thiết lập mật khẩu</button>
        <button onClick={onClose} className="prompt-button secondary">Bỏ qua</button>
      </div>
    </>
  );
};

export default SetPasswordPrompt; 