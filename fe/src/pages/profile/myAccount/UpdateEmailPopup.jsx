import React, { useState } from 'react';
import './UpdateEmailPopup.css'; // We will create this CSS file
import { FaTimes } from 'react-icons/fa'; // Close icon

const UpdateEmailPopup = ({ open, onClose, onUpdateEmail, currentEmail, errorMessage }) => {
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Reset state when popup opens/closes or currentEmail changes
  useState(() => {
      if(open) {
          setNewEmail(currentEmail || ''); // Initialize with current email or empty string
          setMessage(null);
          setLoading(false);
      } else {
          // Optional: clear newEmail when closed
          // setNewEmail('');
      }
  }, [open, currentEmail]);

  const handleEmailChange = (e) => {
    setNewEmail(e.target.value);
  };

  const handleUpdateClick = async () => {
    if (!newEmail.trim()) {
      setMessage({ type: 'error', text: 'Email mới không được để trống.' });
      return;
    }
    setMessage(null);

    setLoading(true);
    await onUpdateEmail(newEmail);
    setLoading(false);
    // message and closing will be handled by parent via onUpdateEmail callback
  };

  if (!open) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Cập nhật email</h3>
        {message && <p className={`popup-message ${message.type}`}>{message.text}</p>}
        {!message && errorMessage && <p className="popup-message error">{errorMessage}</p>}
        <input
          type="email"
          placeholder="Email mới"
          value={newEmail}
          onChange={handleEmailChange}
          className="popup-input"
        />
        <button onClick={handleUpdateClick} disabled={loading} className="popup-update-btn">
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </div>
    </div>
  );
};

export default UpdateEmailPopup; 