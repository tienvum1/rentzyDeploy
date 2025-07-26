import React, { useState, useEffect } from 'react';
import './UpdateEmailPopup.css'; // Reusing the same CSS file for basic styles
import { FaTimes } from 'react-icons/fa'; // Close icon

const UpdateNamePopup = ({ open, onClose, onUpdateName, currentName, errorMessage }) => {
  const [newName, setNewName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null); // Internal message for popup

  // Reset state when popup opens/closes or currentName changes
  useEffect(() => {
    if (open) {
      setNewName(currentName || ''); // Initialize with current name or empty string
      setMessage(null); // Clear internal message
      setLoading(false);
    }
  }, [open, currentName]);

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };

  const handleUpdateClick = async () => {
    if (!newName.trim()) {
      setMessage({ type: 'error', text: 'Tên mới không được để trống.' });
      return;
    }

    setLoading(true);
    setMessage(null); // Clear internal message before calling parent handler
    await onUpdateName(newName); // Parent handles API call and potential error message
    setLoading(false);
    // Parent is expected to close the popup and show main message/handle error
  };

  if (!open) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <button className="popup-close" onClick={onClose}>
          <FaTimes />
        </button>
        <h3>Cập nhật thông tin</h3> {/* Title based on screenshot */}
        {message && <p className={`popup-message ${message.type}`}>{message.text}</p>} {/* Display internal messages */}
        {errorMessage && <p className="popup-message error">{errorMessage}</p>} {/* Display error message from parent */}
        <div className="popup-field"> {/* Using a div for label and input */}
            <label htmlFor="newName" className="popup-label">Tên tài khoản</label> {/* Label based on screenshot */}
             <input
              id="newName"
              type="text"
              placeholder="Nhập tên mới"
              value={newName}
              onChange={handleNameChange}
              className="popup-input"
            />
        </div>
        <button onClick={handleUpdateClick} disabled={loading} className="popup-update-btn">
          {loading ? 'Đang cập nhật...' : 'Cập nhật'}
        </button>
      </div>
    </div>
  );
};

export default UpdateNamePopup; 