import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../../context/AuthContext';
import './OwnerRequestsPage.css';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';

const OwnerRequestsPage = () => {
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectionReason, setRejectionReason] = useState({});
  const [modalImage, setModalImage] = useState(null);

  const { user } = useAuth();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

  const fetchPendingRequests = async () => {
    setLoading(true);
    setError('');
    try {
      if (!user || !user.role || !user.role.includes('admin')) {
        setError('Bạn không có quyền truy cập trang này.');
        setLoading(false);
        return;
      }
      const response = await axios.get(`${backendUrl}/api/admin/owner-requests`, {
        withCredentials: true,
      });
      if (response.data.success) {
        setPendingRequests(response.data.data);
      } else {
        setError(response.data.message || 'Lỗi khi lấy danh sách yêu cầu chờ duyệt.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Lỗi kết nối server khi lấy danh sách.');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (userId, status) => {
    setActionLoading(prev => ({ ...prev, [userId]: true }));
    setError('');
    setRejectionReason(prev => ({ ...prev, [userId]: '' }));

    const payload = { status };
    if (status === 'rejected') {
      const reason = rejectionReason[userId] || '';
      if (!reason) {
        setError(`Vui lòng nhập lý do từ chối cho yêu cầu của ${userId}.`);
        setActionLoading(prev => ({ ...prev, [userId]: false }));
        return;
      }
      payload.rejectionReason = reason;
    }

    try {
      const response = await axios.put(`${backendUrl}/api/admin/owner-requests/${userId}`, payload, {
        withCredentials: true,
      });

      if (response.data.success) {
        setPendingRequests(pendingRequests.filter(req => req._id !== userId));
        alert(response.data.message);
      } else {
        setError(response.data.message || `Lỗi khi duyệt yêu cầu của ${userId}.`);
      }
    } catch (err) {
      setError(err.response?.data?.message || `Lỗi kết nối server khi duyệt yêu cầu của ${userId}.`);
    } finally {
      setActionLoading(prev => ({ ...prev, [userId]: false }));
    }
  };

  useEffect(() => {
    if (user && user.role) {
      if (user.role.includes('admin')) {
        fetchPendingRequests();
      } else {
        setError('Bạn không có quyền truy cập trang này.');
        setLoading(false);
      }
    } else if (user === null) {
      setError('Vui lòng đăng nhập để truy cập trang này.');
      setLoading(false);
    }
  }, [user]);

  const handleReasonChange = (userId, value) => {
    setRejectionReason(prev => ({ ...prev, [userId]: value }));
  };

  const closeModal = () => setModalImage(null);

  const renderContent = () => {
    if (loading) return <p>Đang tải danh sách yêu cầu...</p>;
    if (error) return <div className="error-message">Lỗi: {error}</div>;
    if (pendingRequests.length === 0) {
      return (
        <div className="no-requests-message-container">
          <p>Không có yêu cầu nào đang chờ duyệt lúc này.</p>
        </div>
      );
    }

    return (
      <table className="requests-table">
        <thead>
          <tr>
            <th>Họ tên CCCD</th>
            <th>Email</th>
            <th>Số điện thoại</th>
            <th>Số CCCD</th>
            <th>Ngày sinh</th>
            <th>Ảnh CCCD</th>
            <th>Ngày gửi</th>
            <th>Hành động</th>
          </tr>
        </thead>
        <tbody>
          {pendingRequests.map(request => (
            <tr key={request._id}>
              <td>{request.cccd_full_name || request.name}</td>
              <td>{request.email}</td>
              <td>{request.phone}</td>
              <td>{request.cccd_number}</td>
              <td>{request.cccd_birth_date ? new Date(request.cccd_birth_date).toLocaleDateString() : ''}</td>
              <td>
                {request.cccd_image ? (
                  <img
                    src={request.cccd_image}
                    alt="CCCD"
                    className="cccd-image-thumbnail"
                    onClick={() => setModalImage(request.cccd_image)}
                  />
                ) : 'Không có ảnh'}
              </td>
              <td>{request.owner_request_submitted_at ? new Date(request.owner_request_submitted_at).toLocaleDateString() : ''}</td>
              <td>
                {actionLoading[request._id] ? (
                  'Đang xử lý...'
                ) : (
                  <>
                    <button
                      onClick={() => handleReview(request._id, 'approved')}
                      className="btn-approve"
                    >
                      Chấp nhận
                    </button>
                    <button
                      onClick={() => handleReview(request._id, 'rejected')}
                      className="btn-reject"
                    >
                      Từ chối
                    </button>
                    <input
                      type="text"
                      placeholder="Lý do từ chối (nếu có)"
                      value={rejectionReason[request._id] || ''}
                      onChange={(e) => handleReasonChange(request._id, e.target.value)}
                    />
                  </>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  };

  return (
    <div className="admin-dashboard-layout">
      <SidebarAdmin />
      <div className="admin-dashboard-content">
        <div className="owner-requests-inner-content">
          <h2>Yêu cầu Duyệt Chủ xe</h2>
          {renderContent()}
        </div>
      </div>
      {modalImage && (
        <div className="modal-backdrop" onClick={closeModal}>
          <img src={modalImage} alt="Preview" className="modal-image" />
        </div>
      )}
    </div>
  );
};

export default OwnerRequestsPage;