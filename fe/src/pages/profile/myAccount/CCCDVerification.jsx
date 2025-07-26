import React, { useState, useEffect } from 'react';
import './DriverLicenseVerification.css';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth } from '../../../context/AuthContext';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

const statusMap = {
  none: { label: 'Chưa xác thực', color: '#64748b' },
  pending: { label: 'Đang chờ duyệt', color: '#f59e42' },
  verified: { label: 'Đã xác thực', color: '#22c55e' },
  rejected: { label: 'Bị từ chối', color: '#ef4444' },
};

const CCCDVerification = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    cccd_number: '',
    full_name: '',
    birth_date: '',
  });
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('none');

  useEffect(() => {
    if (user) {
      setStatus(user.cccd_verification_status || 'none');
      setForm({
        cccd_number: user.cccd_number || '',
        full_name: user.cccd_full_name || '',
        birth_date: user.cccd_birth_date ? new Date(user.cccd_birth_date).toISOString().split('T')[0] : '',
      });
      if (user.cccd_image) setImage(user.cccd_image);
      setEditMode(user.cccd_verification_status !== 'verified' && user.cccd_verification_status !== 'pending');
    }
  }, [user]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    if (selectedFile) {
      setImage(URL.createObjectURL(selectedFile));
    }
  };

  const handleCancel = () => {
    setForm({
      cccd_number: user?.cccd_number || '',
      full_name: user?.cccd_full_name || '',
      birth_date: user?.cccd_birth_date ? new Date(user.cccd_birth_date).toISOString().split('T')[0] : '',
    });
    setImage(user?.cccd_image || null);
    setFile(null);
    setEditMode(true);
  };

  const handleSubmit = async () => {
    if (!form.cccd_number || !form.full_name || !form.birth_date || !file) {
      toast.error('Vui lòng nhập đầy đủ thông tin và chọn ảnh CCCD!');
      return;
    }
    setLoading(true);
    const formData = new FormData();
    formData.append('cccd_number', form.cccd_number);
    formData.append('full_name', form.full_name);
    formData.append('birth_date', form.birth_date);
    formData.append('cccd_image', file);
    try {
      const response = await axios.post(
        `${backendUrl}/api/user/verify-cccd`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );
      if (response.data && response.data.success) {
        toast.success(response.data.message || 'Gửi xác thực CCCD thành công!');
        setEditMode(false);
        await login();
      } else {
        toast.error(response.data.message || 'Gửi xác thực thất bại!');
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Lỗi khi gửi xác thực CCCD!'
      );
    } finally {
      setLoading(false);
    }
  };

  const statusInfo = statusMap[status] || statusMap['none'];

  return (
    <div className="dlx-container">
      <div className="dlx-header" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between'}}>
        <h2>Căn cước công dân</h2>
        <span className="cccd-status-badge" style={{background: statusInfo.color+"22", color: statusInfo.color, padding: '4px 12px', borderRadius: 8, fontWeight: 500}}>
          {statusInfo.label}
        </span>
      </div>
      <div className="dlx-form-container">
        <div className="dlx-image-section">
          <h4>Ảnh mặt trước CCCD</h4>
          <div className="dlx-image-preview">
            {image ? <img src={image} alt="CCCD" /> : <p>Chưa có ảnh</p>}
          </div>
          {editMode && <input type="file" onChange={handleFileChange} />}
        </div>
        <div className="dlx-info-section">
          <div className="dlx-form-field">
            <label>Số CCCD</label>
            <input
              type="text"
              value={form.cccd_number}
              onChange={e => setForm({ ...form, cccd_number: e.target.value })}
              readOnly={!editMode}
            />
          </div>
          <div className="dlx-form-field">
            <label>Họ và tên</label>
            <input
              type="text"
              value={form.full_name}
              onChange={e => setForm({ ...form, full_name: e.target.value })}
              readOnly={!editMode}
            />
          </div>
          <div className="dlx-form-field">
            <label>Ngày sinh</label>
            <input
              type="date"
              value={form.birth_date}
              onChange={e => setForm({ ...form, birth_date: e.target.value })}
              readOnly={!editMode}
            />
          </div>
        </div>
      </div>
      {editMode && (
        <div className="dlx-actions">
          <button onClick={handleCancel} className="dlx-cancel-btn" disabled={loading}>Hủy</button>
          <button onClick={handleSubmit} className="dlx-save-btn" disabled={loading}>
            {loading ? 'Đang gửi...' : 'Lưu lại'}
          </button>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default CCCDVerification; 