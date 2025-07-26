import React, { useRef, useState } from 'react';

const AvatarPopup = ({ open, onClose, onSave }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const fileInputRef = useRef();

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSave = () => {
    if (file) onSave(file);
  };

  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: 16, padding: 32, minWidth: 320, boxShadow: '0 4px 24px #ff914d33',
        display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative'
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', fontSize: 22, cursor: 'pointer'
        }}>×</button>
        <h3>Đổi ảnh đại diện</h3>
        <img
          src={preview || 'https://cdn-icons-png.flaticon.com/512/149/149071.png'}
          alt="avatar preview"
          style={{ width: 120, height: 120, borderRadius: '50%', objectFit: 'cover', margin: '18px 0' }}
        />
        <input
          type="file"
          accept="image/*"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            background: '#ff914d', color: '#fff', border: 'none', borderRadius: 20, padding: '8px 24px',
            fontWeight: 600, fontSize: 16, cursor: 'pointer', marginBottom: 12
          }}
        >
          Chọn ảnh từ máy
        </button>
        <button
          onClick={handleSave}
          disabled={!file}
          style={{
            background: file ? 'linear-gradient(90deg, #ff914d 60%, #ffb86c 100%)' : '#eee',
            color: file ? '#fff' : '#aaa', border: 'none', borderRadius: 20, padding: '8px 24px',
            fontWeight: 600, fontSize: 16, cursor: file ? 'pointer' : 'not-allowed'
          }}
        >
          Lưu ảnh
        </button>
      </div>
    </div>
  );
};

export default AvatarPopup;