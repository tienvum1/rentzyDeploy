import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';
import './OwnerCancelRequests.css';
import { toast } from 'react-toastify';

const OwnerCancelRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState('');

  useEffect(() => {
    fetchRequests();
    // eslint-disable-next-line
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/owner/cancel-requests`, { withCredentials: true });
      setRequests(res.data.data || []);
    } catch (err) {
      setError('Không thể tải danh sách yêu cầu huỷ.');
    }
    setLoading(false);
  };

  const handleApprove = async (bookingId) => {
    if (!window.confirm('Bạn có chắc chắn muốn duyệt huỷ đơn này?')) return;
    setActionLoading(bookingId + '-approve');
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}/owner-approve-cancel`, {}, { withCredentials: true });
      setRequests(prev => prev.filter(r => r._id !== bookingId));
      toast.success('Duyệt huỷ đơn thành công!');
    } catch (err) {
      toast.error('Duyệt huỷ thất bại!');
    }
    setActionLoading('');
  };

  const handleReject = async (bookingId) => {
    setActionLoading(bookingId + '-reject');
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}/owner-reject-cancel`, {}, { withCredentials: true });
      setRequests(prev => prev.filter(r => r._id !== bookingId));
      toast.success('Từ chối huỷ đơn thành công!');
    } catch (err) {
      toast.error('Từ chối huỷ thất bại!');
    }
    setActionLoading('');
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
      <SidebarOwner />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="owner-cancel-requests-container">
          <h2>Đơn hủy của khách thuê</h2>
          {loading ? (
            <div className="ocr-loading">Đang tải...</div>
          ) : error ? (
            <div className="ocr-error">{error}</div>
          ) : requests.length === 0 ? (
            <div className="ocr-empty">Không có đơn hủy nào từ khách thuê.</div>
          ) : (
            <div className="ocr-table-wrapper">
              <table className="ocr-table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Xe</th>
                    <th>Khách thuê</th>
                    <th>Ngày thuê</th>
                    <th>Lý do huỷ</th>
                    <th>Tiền hoàn khách</th>
                    <th>Tiền bồi thường</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map(r => (
                    <tr key={r._id}>
                      <td>{r._id.slice(-6).toUpperCase()}</td>
                      <td>{r.vehicle?.brand} {r.vehicle?.model}</td>
                      <td>{r.renter?.name || r.renter?.fullName || r.renter?.email}</td>
                      <td>{new Date(r.startDate).toLocaleDateString('vi-VN')} - {new Date(r.endDate).toLocaleDateString('vi-VN')}</td>
                      <td>{r.cancellationReason || '-'}</td>
                      <td style={{ color: '#1976d2', fontWeight: 600 }}>
                        {typeof r.totalRefundForRenterCancel === 'number'
                          ? r.totalRefundForRenterCancel.toLocaleString('vi-VN') + ' ₫'
                          : '-'}
                      </td>
                      <td style={{ color: '#e53e3e', fontWeight: 600 }}>
                        {typeof r.totalRefundForOwnerCancel === 'number'
                          ? r.totalRefundForOwnerCancel.toLocaleString('vi-VN') + ' ₫'
                          : '-'}
                      </td>
                      <td>
                        <button
                          className="ocr-approve-btn"
                          disabled={actionLoading === r._id + '-approve'}
                          onClick={() => handleApprove(r._id)}
                        >
                          Duyệt
                        </button>
                        <button
                          className="ocr-reject-btn"
                          disabled={actionLoading === r._id + '-reject'}
                          onClick={() => handleReject(r._id)}
                        >
                          Từ chối
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerCancelRequests;