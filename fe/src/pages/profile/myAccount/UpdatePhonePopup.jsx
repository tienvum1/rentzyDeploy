import React, { useState } from 'react';
import './UpdateEmailPopup.css'; // Reusing the same CSS file
import { FaTimes } from 'react-icons/fa'; // Close icon

const UpdatePhonePopup = ({ open, onClose, onUpdatePhone, currentPhone, errorMessage }) => {
  const [newPhone, setNewPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // Reset state when popup opens/closes or currentPhone changes
  useState(() => {
      if(open) {
          setNewPhone(currentPhone || ''); // Initialize with current phone or empty string
          setMessage(null); // Clear internal message
          setLoading(false);
      } else {
          // Optional: clear newPhone when closed
          // setNewPhone('');
      }
  }, [open, currentPhone]);

  const handlePhoneChange = (e) => {
    setNewPhone(e.target.value);
  };

  const handleUpdateClick = async () => {
    if (!newPhone.trim()) {
      setMessage({ type: 'error', text: 'Số điện thoại mới không được để trống.' });
      return;
    }
     // Optional: Add basic phone number validation here if needed

    setLoading(true);
    setMessage(null); // Clear internal message before calling parent handler
    await onUpdatePhone(newPhone); // Parent handles API call and sets errorMessage prop if needed
    setLoading(false);
    // message and closing will be handled by parent via onUpdatePhone callback
  };

  if (!open) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Cập nhật số điện thoại</h3> {/* Title */}
        {message && <p className={`popup-message ${message.type}`}>{message.text}</p>} {/* Display internal messages */}
        {errorMessage && <p className="popup-message error">{errorMessage}</p>} {/* Display error message from parent */}
        <input
          type="tel" // Use type tel for phone numbers
          placeholder="Số điện thoại mới"
          value={newPhone}
          onChange={handlePhoneChange}
          className="popup-input"
        />
        <button onClick={handleUpdateClick} disabled={loading} className="popup-update-btn">
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </div>
    </div>
  );
};

export default UpdatePhonePopup;