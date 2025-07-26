import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import './PayoutRequests.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const PayoutRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'pending', 'approved'
  const [summary, setSummary] = useState({ 
    totalPendingPayouts: 0, 
    totalPayoutAmount: 0,
    totalApprovedPayouts: 0,
    totalApprovedAmount: 0
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, pagination.currentPage]);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10
      };
      if (filterStatus !== 'all') {
        params.status = filterStatus;
      }
      
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/payout-requests`,
        { 
          params,
          withCredentials: true 
        }
      );
      
      setRequests(res.data.data.bookings || []);
      setPagination(res.data.data.pagination);
      setSummary(res.data.data.summary);
    } catch (err) {
      setError('Không thể tải danh sách yêu cầu giải ngân.');
      console.error('Error fetching payout requests:', err);
    }
    setLoading(false);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    const bookingId = selectedRequest._id;
    setActionLoading(prev => ({ ...prev, [bookingId]: true }));
    
    try {
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/approve-payout/${bookingId}`,
        { note },
        { withCredentials: true }
      );
      
      toast.success('Đã duyệt yêu cầu giải ngân thành công!');
      setShowModal(false);
      setNote('');
      setSelectedRequest(null);
      fetchRequests(pagination.currentPage);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Có lỗi xảy ra khi duyệt yêu cầu.');
      console.error('Error approving payout:', err);
    }
    
    setActionLoading(prev => ({ ...prev, [bookingId]: false }));
  };

  const openApprovalModal = (request) => {
    setSelectedRequest(request);
    setShowModal(true);
    setNote('');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': { text: 'Chờ duyệt', class: 'status-pending' },
      'approved': { text: 'Đã duyệt', class: 'status-approved' },
      'rejected': { text: 'Từ chối', class: 'status-rejected' }
    };
    const statusInfo = statusMap[status] || { text: status, class: 'status-default' };
    return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
        <SidebarAdmin />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="loading">Đang tải...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
      <SidebarAdmin />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="all-pending-refunds">
          <div className="header-section">
            <h2>Quản lý yêu cầu giải ngân</h2>
            
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Yêu cầu chờ duyệt</h3>
                <div className="summary-number">{summary.totalPendingPayouts}</div>
                <p>yêu cầu giải ngân</p>
              </div>
              <div className="summary-card">
                <h3>Số tiền chờ giải ngân</h3>
                <div className="summary-number">{formatCurrency(summary.totalPayoutAmount)}</div>
                <p>tổng số tiền</p>
              </div>
              <div className="summary-card total">
                <h3>Tổng cộng</h3>
                <div className="summary-number">
                  {summary.totalPendingPayouts + (summary.totalApprovedPayouts || 0)}
                </div>
                <p>tất cả yêu cầu</p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="filter-buttons">
              <button 
                className={filterStatus === 'all' ? 'active' : ''}
                onClick={() => setFilterStatus('all')}
              >
                Tất cả
              </button>
              <button 
                className={filterStatus === 'pending' ? 'active' : ''}
                onClick={() => setFilterStatus('pending')}
              >
                Chờ duyệt
              </button>
              <button 
                className={filterStatus === 'approved' ? 'active' : ''}
                onClick={() => setFilterStatus('approved')}
              >
                Đã duyệt
              </button>
            </div>
          </div>

          {error && (
            <div className="error">
              {error}
            </div>
          )}

          {requests.length === 0 ? (
            <div className="empty-state">
              <h3>Không có yêu cầu giải ngân</h3>
              <p>Hiện tại không có yêu cầu giải ngân nào cần xử lý.</p>
            </div>
          ) : (
            <div className="requests-table">
              <table>
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Chủ xe</th>
                    <th>Xe</th>
                    <th>Thông tin ngân hàng</th>
                    <th>Số tiền giải ngân</th>
                    <th>Ngày yêu cầu</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request._id}>
                      <td>
                        <div className="booking-id">#{request._id.slice(-6)}</div>
                        <div className="booking-status">{getStatusBadge(request.payoutStatus || 'pending')}</div>
                      </td>
                      <td>
                        <div className="user-info">
                          <div className="user-name">{request.vehicle?.owner?.name || 'N/A'}</div>
                          <div className="user-email">{request.vehicle?.owner?.email || 'N/A'}</div>
                          <div className="user-phone">{request.vehicle?.owner?.phone || 'N/A'}</div>
                        </div>
                      </td>
                      <td>
                        <div className="vehicle-info">
                          <div className="vehicle-name">{request.vehicle?.brand} {request.vehicle?.model}</div>
                          <div className="vehicle-plate">{request.vehicle?.licensePlate}</div>
                        </div>
                      </td>
                      <td>
                        <div className="bank-info">
                          {request.vehicle?.owner?.bankAccounts?.[0] ? (
                            <>
                              <div className="bank-name">{request.vehicle.owner.bankAccounts[0].bankName}</div>
                              <div className="bank-account">{request.vehicle.owner.bankAccounts[0].accountNumber}</div>
                              <div className="bank-holder">{request.vehicle.owner.bankAccounts[0].accountHolder}</div>
                            </>
                          ) : (
                            <div className="no-bank-info">Chưa có thông tin ngân hàng</div>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="amount-info">
                          <div className="amount">{formatCurrency(request.payoutAmount || 0)}</div>
                        </div>
                      </td>
                      <td>
                        <div className="date-info">
                          {formatDate(request.payoutRequestedAt)}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          {(request.payoutStatus || 'pending') === 'pending' ? (
                            <button
                              className="approve-btn"
                              onClick={() => openApprovalModal(request)}
                              disabled={actionLoading[request._id]}
                            >
                              {actionLoading[request._id] ? 'Đang xử lý...' : 'Duyệt giải ngân'}
                            </button>
                          ) : (
                            <span className="status-text">Đã xử lý</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={!pagination.hasPrev}
              >
                Trước
              </button>
              
              <span className="page-info">
                Trang {pagination.currentPage} / {pagination.totalPages}
              </span>
              
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasNext}
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {/* Approval Modal */}
        {showModal && selectedRequest && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h3>Duyệt yêu cầu giải ngân</h3>
              
              <div className="modal-info">
                <p><strong>Mã đơn:</strong> #{selectedRequest._id.slice(-6)}</p>
                <p><strong>Chủ xe:</strong> {selectedRequest.vehicle?.owner?.name}</p>
                <p><strong>Xe:</strong> {selectedRequest.vehicle?.brand} {selectedRequest.vehicle?.model}</p>
                <p><strong>Số tiền giải ngân:</strong> {formatCurrency(selectedRequest.payoutAmount)}</p>
                {selectedRequest.vehicle?.owner?.bankAccounts?.[0] && (
                  <>
                    <p><strong>Ngân hàng:</strong> {selectedRequest.vehicle.owner.bankAccounts[0].bankName}</p>
                    <p><strong>Số tài khoản:</strong> {selectedRequest.vehicle.owner.bankAccounts[0].accountNumber}</p>
                    <p><strong>Chủ tài khoản:</strong> {selectedRequest.vehicle.owner.bankAccounts[0].accountHolder}</p>
                  </>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="note">Ghi chú (tùy chọn):</label>
                <textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú cho yêu cầu giải ngân..."
                  rows="3"
                />
              </div>
              
              <div className="modal-actions">
                <button className="cancel-btn" onClick={() => setShowModal(false)}>
                  Hủy
                </button>
                <button 
                  className="confirm-btn" 
                  onClick={handleApproveRequest}
                  disabled={actionLoading[selectedRequest._id]}
                >
                  {actionLoading[selectedRequest._id] ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                </button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default PayoutRequests;