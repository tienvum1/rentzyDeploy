import React, { useState, useEffect } from 'react';
import './DriverLicenseVerification.css';
import { FaPen } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import { toast,ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

const DriverLicenseVerification = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    driver_license_number: '',
    driver_license_full_name: '',
    driver_license_birth_date: '',
  });
  const [image, setImage] = useState(null);
  const [file, setFile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState('none');
  const [ocrData, setOcrData] = useState(null);
  const [ocrMatch, setOcrMatch] = useState(true);
  const [ocrChecked, setOcrChecked] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (user) {
      const userStatus = user.driver_license_verification_status || 'none';
      setStatus(userStatus);

      setForm({
        driver_license_number: user.driver_license_number || '',
        driver_license_full_name: user.driver_license_full_name || '',
        driver_license_birth_date: user.driver_license_birth_date ? new Date(user.driver_license_birth_date).toISOString().split('T')[0] : '',
      });

      if (user.driver_license_image) {
        setImage(user.driver_license_image);
      }

      // Automatically enter edit mode if the user has no license info submitted.
      if (userStatus === 'none' && !user.driver_license_number) {
        setEditMode(true);
      } else {
        setEditMode(false);
      }
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
    // Reset form to the state from context
    if (user) {
      setForm({
        driver_license_number: user.driver_license_number || '',
        driver_license_full_name: user.driver_license_full_name || '',
        driver_license_birth_date: user.driver_license_birth_date ? new Date(user.driver_license_birth_date).toISOString().split('T')[0] : '',
      });
      setImage(user.driver_license_image || null);
    }
    setFile(null);
    setEditMode(false);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('driver_license_number', form.driver_license_number);
    formData.append('driver_license_full_name', form.driver_license_full_name);
    formData.append('driver_license_birth_date', form.driver_license_birth_date);
    if (file) {
      formData.append('driver_license_image', file); // file là File object từ input
    }
    try {
      const response = await axios.post(`${backendUrl}/api/user/create-driver-license`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (response.data && response.success) {
        toast.success(response.message);
        await login(); // Refresh user data from context
      } else {
        toast.error(response.data.message || 'Có lỗi xảy ra khi gửi thông tin.');
      }
    } catch (error) {
      if (error.response && error.response.data && error.response.data.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error('Đã xảy ra lỗi khi gửi thông tin.');
      }
    }
  };
  
  const getStatusInfo = () => {
    switch (status) {
      case 'verified':
        return { text: '✅ Đã xác thực', className: 'verified' };
      case 'pending':
        return { text: '🟡 Đang chờ duyệt', className: 'pending' };
      case 'rejected':
        return { text: '❌ Đã từ chối', className: 'rejected' };
      case 'none':
      default:
        return { text: '🔴 Chưa xác thực', className: '' };
    }
  };
  
  const statusInfo = getStatusInfo();

  return (
    <div className="dlx-container">
      <div className="dlx-header">
        <h2>Giấy phép lái xe</h2>
        <div className="dlx-header-actions">
          <span className={`dlx__badge ${statusInfo.className}`}>
            {statusInfo.text}
          </span>

            <button onClick={() => setEditMode(true)} className="dlx-edit-btn">Chỉnh sửa</button>

        </div>
      </div>
      <div className="dlx-notice">
        <p>Lưu ý: để tránh phát sinh vấn đề trong quá trình thuê xe, <strong>người đặt xe</strong> trên hệ thống (đã xác thực GPLX) <strong>ĐỒNG THỜI</strong> phải là <strong>người lái xe</strong>.</p>
      </div>
      <div className="dlx-form-container">
        <div className="dlx-image-section">
          <h4>Ảnh mặt trước GPLX</h4>
          <div className="dlx-image-preview">
            {image ? <img src={image} alt="GPLX" /> : <p>Chưa có ảnh</p>}
          </div>
          {editMode && <input type="file" onChange={handleFileChange} />}
        </div>
        <div className="dlx-info-section">
          <div className="dlx-form-field">
            <label>Số GPLX</label>
            <input
              type="text"
              value={form.driver_license_number}
              onChange={(e) => setForm({ ...form, driver_license_number: e.target.value })}
              readOnly={!editMode}
            />
          </div>
          <div className="dlx-form-field">
            <label>Họ và tên</label>
            <input
              type="text"
              value={form.driver_license_full_name}
              onChange={(e) => setForm({ ...form, driver_license_full_name: e.target.value })}
              readOnly={!editMode}
            />
          </div>
          <div className="dlx-form-field">
            <label>Ngày sinh</label>
            <input
              type="date"
              value={form.driver_license_birth_date}
              onChange={(e) => setForm({ ...form, driver_license_birth_date: e.target.value })}
              readOnly={!editMode}
            />
          </div>
        </div>
      </div>
      {editMode && (
        <div className="dlx-actions">
          <button onClick={handleCancel} className="dlx-cancel-btn">Hủy</button>
          <button onClick={handleSubmit} className="dlx-save-btn">Lưu lại</button>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={2000} />
    </div>
  );
};

export default DriverLicenseVerification;
