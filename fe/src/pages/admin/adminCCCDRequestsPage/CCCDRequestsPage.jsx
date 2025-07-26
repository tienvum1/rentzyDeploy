import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import './CCCDRequestsPage.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

const CCCDRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [modalImage, setModalImage] = useState(null);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${backendUrl}/api/admin/cccd-requests`, { withCredentials: true });
      setRequests(res.data || []);
    } catch (err) {
      setError('Không thể tải danh sách CCCD chờ duyệt.');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleUpdateStatus = async (userId, status) => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${status === 'verified' ? 'duyệt' : 'từ chối'} CCCD này?`)) return;
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    try {
      await axios.put(`${backendUrl}/api/admin/cccd-status/${userId}`, { status }, { withCredentials: true });
      setRequests(prev => prev.filter(r => r._id !== userId));
      alert(`Yêu cầu đã được ${status === 'verified' ? 'chấp thuận' : 'từ chối'}.`);
    } catch (err) {
      alert('Cập nhật trạng thái thất bại.');
    }
    setActionLoading(prev => ({ ...prev, [userId]: false }));
  };

  const closeModal = () => setModalImage(null);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
      <SidebarAdmin />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="cccd-requests-container">
          <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Duyệt xác thực CCCD AI</h2>
          {loading ? (
            <div className="cccd-loading">Đang tải...</div>
          ) : error ? (
            <div className="cccd-error">{error}</div>
          ) : requests.length === 0 ? (
            <div className="cccd-empty">Không có yêu cầu xác thực CCCD nào cần duyệt.</div>
          ) : (
            <table className="cccd-requests-table">
              <thead>
                <tr>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Số CCCD</th>
                  <th>Ngày sinh</th>
                  <th>Ảnh CCCD</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((req) => (
                  <tr key={req._id}>
                    <td>{req.cccd_full_name}</td>
                    <td>{req.email}</td>
                    <td>{req.cccd_number}</td>
                    <td>{req.cccd_birth_date ? new Date(req.cccd_birth_date).toLocaleDateString('vi-VN') : ''}</td>
                    <td>
                      {req.cccd_image ? (
                        <img
                          src={req.cccd_image}
                          alt="CCCD"
                          className="cccd-img-thumb"
                          onClick={() => setModalImage(req.cccd_image)}
                        />
                      ) : 'Không có ảnh'}
                    </td>
                    <td>
                      <button
                        className="cccd-approve-btn"
                        disabled={actionLoading[req._id]}
                        onClick={() => handleUpdateStatus(req._id, 'verified')}
                      >
                        {actionLoading[req._id] ? 'Đang duyệt...' : 'Chấp nhận'}
                      </button>
                      <button
                        className="cccd-reject-btn"
                        disabled={actionLoading[req._id]}
                        onClick={() => handleUpdateStatus(req._id, 'rejected')}
                      >
                        {actionLoading[req._id] ? 'Đang xử lý...' : 'Từ chối'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        {modalImage && (
          <div className="cccd-modal-backdrop" onClick={closeModal}>
            <img src={modalImage} alt="CCCD Preview" className="cccd-modal-img" />
          </div>
        )}
      </div>
    </div>
  );
};

export default CCCDRequestsPage; 