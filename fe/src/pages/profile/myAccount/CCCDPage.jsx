import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FaCheckCircle, FaExclamationCircle, FaTimesCircle, FaIdCard, FaPen } from 'react-icons/fa';
import axios from 'axios';
import './Profile.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

const statusMap = {
  approved: { label: 'Đã xác thực', color: '#22c55e', icon: <FaCheckCircle style={{marginRight: 6}} /> },
  pending: { label: 'Chờ duyệt', color: '#f59e42', icon: <FaExclamationCircle style={{marginRight: 6}} /> },
  rejected: { label: 'Bị từ chối', color: '#ef4444', icon: <FaTimesCircle style={{marginRight: 6}} /> },
  none: { label: 'Chưa xác thực', color: '#64748b', icon: <FaIdCard style={{marginRight: 6}} /> },
};

const CCCDPage = () => {
  const { user, login } = useAuth();
  const [form, setForm] = useState({
    cccd_number: '',
    cccd_full_name: '',
  });
  const [frontFile, setFrontFile] = useState(null);
  const [backFile, setBackFile] = useState(null);
  const [frontImage, setFrontImage] = useState('');
  const [backImage, setBackImage] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [status, setStatus] = useState('none');
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    if (user) {
      setStatus(user.owner_request_status || 'none');
      setForm({
        cccd_number: user.cccd_number || '',
        cccd_full_name: user.name || '',
      });
      setFrontImage(user.cccd_front_url || '');
      setBackImage(user.cccd_back_url || '');
      setRejectReason(user.cccdRejectReason || '');
      // Luôn cho phép chỉnh sửa
      setEditMode(false);
    }
  }, [user]);

  const handleFrontFileChange = (e) => {
    const file = e.target.files[0];
    setFrontFile(file);
    if (file) setFrontImage(URL.createObjectURL(file));
  };
  const handleBackFileChange = (e) => {
    const file = e.target.files[0];
    setBackFile(file);
    if (file) setBackImage(URL.createObjectURL(file));
  };
  const handleCancel = () => {
    if (user) {
      setForm({
        cccd_number: user.cccd_number || '',
        cccd_full_name: user.name || '',
      });
      setFrontImage(user.cccd_front_url || '');
      setBackImage(user.cccd_back_url || '');
      setFrontFile(null);
      setBackFile(null);
    }
    setEditMode(false);
  };
  const handleSubmit = async () => {
    const formData = new FormData();
    formData.append('cccd_number', form.cccd_number);
    formData.append('cccd_full_name', form.cccd_full_name);
    if (frontFile) formData.append('cccd_front', frontFile);
    if (backFile) formData.append('cccd_back', backFile);
    try {
      const response = await axios.post(`${backendUrl}/api/user/create-cccd`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        withCredentials: true
      });
      if (response.data) {
        alert('Thông tin CCCD đã được gửi để chờ duyệt!');
        await login();
        setEditMode(false);
      }
    } catch (error) {
      alert('Đã xảy ra lỗi khi gửi thông tin CCCD.');
    }
  };

  const canEdit = true; // Luôn cho phép chỉnh sửa
  const statusInfo = statusMap[status] || statusMap['none'];

  return (
    <div className="cccd-container">
      <h2 className="cccd-title"><FaIdCard style={{marginRight: 8}}/>Căn cước công dân</h2>
      <div className="cccd-status-row">
        <span className="cccd-status-badge" style={{background: statusInfo.color+"22", color: statusInfo.color}}>
          {statusInfo.icon}
          {statusInfo.label}
        </span>
        {canEdit && !editMode && (
          <button className="cccd-edit-btn" onClick={() => setEditMode(true)}><FaPen style={{marginRight: 6}}/>Chỉnh sửa</button>
        )}
      </div>
      <div className="cccd-note-box">
        <b>Lưu ý:</b> Vui lòng cung cấp CCCD chính chủ để trở thành người cho thuê xe. Thông tin của bạn sẽ được bảo mật tuyệt đối và chỉ phục vụ cho mục đích xác minh trên hệ thống.
      </div>
      <div className="cccd-main-box">
        <div className="cccd-image-col">
          <div className="cccd-image-label">Ảnh mặt trước CCCD</div>
          {editMode ? (
            <input type="file" accept="image/*" onChange={handleFrontFileChange} />
          ) : null}
          {frontImage ? (
            <img src={frontImage} alt="Ảnh mặt trước CCCD" className="cccd-img" />
          ) : (
            <div className="cccd-img-placeholder">Chưa có ảnh</div>
          )}
          <div className="cccd-image-label" style={{marginTop: 18}}>Ảnh mặt sau CCCD</div>
          {editMode ? (
            <input type="file" accept="image/*" onChange={handleBackFileChange} />
          ) : null}
          {backImage ? (
            <img src={backImage} alt="Ảnh mặt sau CCCD" className="cccd-img" />
          ) : (
            <div className="cccd-img-placeholder">Chưa có ảnh</div>
          )}
        </div>
        <div className="cccd-info-col">
          <div className="cccd-info-row">
            <span className="cccd-info-label">Số CCCD:</span>
            <input className="cccd-info-input" value={form.cccd_number} onChange={e => setForm(f => ({...f, cccd_number: e.target.value}))} readOnly={!editMode} />
          </div>
          <div className="cccd-info-row">
            <span className="cccd-info-label">Họ và tên:</span>
            <input className="cccd-info-input" value={form.cccd_full_name} onChange={e => setForm(f => ({...f, cccd_full_name: e.target.value}))} readOnly={!editMode} />
          </div>
          {status === 'rejected' && rejectReason && (
            <div className="cccd-info-row">
              <span className="cccd-info-label">Lý do từ chối:</span>
              <input className="cccd-info-input cccd-reject" value={rejectReason} readOnly />
            </div>
          )}
        </div>
      </div>
      {editMode && (
        <div className="cccd-actions">
          <button className="cccd-cancel-btn" onClick={handleCancel}>Hủy</button>
          <button className="cccd-save-btn" onClick={handleSubmit}>Lưu lại</button>
        </div>
      )}
      <div className="cccd-why-verify">Vì sao tôi cần xác thực CCCD?</div>
    </div>
  );
};

export default CCCDPage; 