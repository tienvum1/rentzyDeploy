import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import './AllPendingRefunds.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const AllPendingRefunds = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [note, setNote] = useState('');
  const [actionType, setActionType] = useState(''); // 'renter_refund' hoặc 'owner_compensation'
  const [filterType, setFilterType] = useState('all'); // 'all', 'renter', 'owner'
  const [summary, setSummary] = useState({ totalPendingRenterRefunds: 0, totalPendingOwnerCompensations: 0 });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalBookings: 0,
    hasNext: false,
    hasPrev: false
  });

  useEffect(() => {
    fetchRequests();
  }, [filterType, pagination.currentPage]);

  const fetchRequests = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        page,
        limit: 10
      };
      if (filterType !== 'all') {
        params.type = filterType;
      }
      
      const res = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/admin/all-pending-refunds`,
        { 
          params,
          withCredentials: true 
        }
      );
      
      setRequests(res.data.data.bookings || []);
      setPagination(res.data.data.pagination);
      setSummary(res.data.data.summary);
    } catch (err) {
      setError('Không thể tải danh sách yêu cầu chuyển tiền.');
      console.error('Error fetching requests:', err);
    }
    setLoading(false);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest || !actionType) return;
    
    const bookingId = selectedRequest._id;
    setActionLoading(prev => ({ ...prev, [`${bookingId}_${actionType}`]: true }));
    
    try {
      let endpoint = '';
      if (actionType === 'renter_refund') {
        endpoint = `/api/admin/approve-refund/${bookingId}`;
      } else if (actionType === 'owner_compensation') {
        endpoint = `/api/admin/approve-owner-compensation/${bookingId}`;
      }
      
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}${endpoint}`,
        { note },
        { withCredentials: true }
      );
      
      // Refresh danh sách
      fetchRequests(pagination.currentPage);
      toast.success(`Duyệt ${actionType === 'renter_refund' ? 'hoàn tiền' : 'bồi thường'} thành công!`);
      setShowModal(false);
      setSelectedRequest(null);
      setNote('');
      setActionType('');
    } catch (err) {
      toast.error(`Duyệt ${actionType === 'renter_refund' ? 'hoàn tiền' : 'bồi thường'} thất bại!`);
      console.error('Error approving request:', err);
    }
    
    setActionLoading(prev => ({ ...prev, [`${bookingId}_${actionType}`]: false }));
  };

  const openApprovalModal = (request, type) => {
    setSelectedRequest(request);
    setActionType(type);
    setShowModal(true);
    setNote('');
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedRequest(null);
    setNote('');
    setActionType('');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f6f8fa' }}>
      <SidebarAdmin />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="all-pending-refunds">
          <div className="header-section">
            <h2>Quản lý yêu cầu chuyển tiền</h2>
            
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <h3>Hoàn tiền người thuê</h3>
                <div className="summary-number">{summary.totalPendingRenterRefunds}</div>
                <p>yêu cầu chờ duyệt</p>
              </div>
              <div className="summary-card">
                <h3>Bồi thường chủ xe</h3>
                <div className="summary-number">{summary.totalPendingOwnerCompensations}</div>
                <p>yêu cầu chờ duyệt</p>
              </div>
              <div className="summary-card total">
                <h3>Tổng cộng</h3>
                <div className="summary-number">
                  {summary.totalPendingRenterRefunds + summary.totalPendingOwnerCompensations}
                </div>
                <p>yêu cầu chờ duyệt</p>
              </div>
            </div>

            {/* Filter Buttons */}
            <div className="filter-buttons">
              <button 
                className={filterType === 'all' ? 'active' : ''}
                onClick={() => setFilterType('all')}
              >
                Tất cả
              </button>
              <button 
                className={filterType === 'renter' ? 'active' : ''}
                onClick={() => setFilterType('renter')}
              >
                Hoàn tiền người thuê
              </button>
              <button 
                className={filterType === 'owner' ? 'active' : ''}
                onClick={() => setFilterType('owner')}
              >
                Bồi thường chủ xe
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading">Đang tải...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : requests.length === 0 ? (
            <div className="empty-state">
              <h3>Không có yêu cầu nào</h3>
              <p>Hiện tại không có yêu cầu chuyển tiền nào cần duyệt.</p>
            </div>
          ) : (
            <>
              <div className="requests-table">
                <table>
                  <thead>
                    <tr>
                      <th>Mã đơn</th>
                      <th>Loại yêu cầu</th>
                      <th>Người liên quan</th>
                      <th>Thông tin ngân hàng</th>
                      <th>Xe</th>
                      <th>Số tiền</th>
                      <th>Ngày tạo</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((request) => 
                      request.pendingRequests?.map((pendingReq, index) => {
                        const isRenterRefund = pendingReq.type === 'renter_refund';
                        const targetUser = isRenterRefund ? request.renter : request.vehicle?.owner;
                        
                        return (
                          <tr key={`${request._id}_${index}`}>
                            <td>
                              <div className="booking-id">#{request._id.slice(-6)}</div>
                              <div className="booking-status">{getStatusBadge(request.status)}</div>
                            </td>
                            <td>
                              <div className="request-type">
                                <span className={`type-badge ${isRenterRefund ? 'type-renter' : 'type-owner'}`}>
                                  {pendingReq.description}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="user-info">
                                <div className="user-name">{targetUser?.name}</div>
                                <div className="user-email">{targetUser?.email}</div>
                                <div className="user-phone">{targetUser?.phone}</div>
                              </div>
                            </td>
                            <td>
                              <div className="bank-info">
                                {targetUser?.bankAccounts && targetUser.bankAccounts.length > 0 ? (
                                  <>
                                    <div className="bank-name">{targetUser.bankAccounts[0].bankName}</div>
                                    <div className="bank-account">{targetUser.bankAccounts[0].accountNumber}</div>
                                    <div className="bank-holder">{targetUser.bankAccounts[0].accountHolder}</div>
                                  </>
                                ) : (
                                  <span className="no-bank-info">Chưa có thông tin ngân hàng</span>
                                )}
                              </div>
                            </td>
                            <td>
                              <div className="vehicle-info">
                                <div className="vehicle-name">
                                  {request.vehicle?.brand} {request.vehicle?.model}
                                </div>
                                <div className="vehicle-plate">{request.vehicle?.licensePlate}</div>
                              </div>
                            </td>
                            <td>
                              <div className="amount-info">
                                <div className="amount">{formatCurrency(pendingReq.amount)}</div>
                              </div>
                            </td>
                            <td>
                              <div className="date-info">
                                {formatDate(pendingReq.createdAt)}
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons">
                                <button
                                  className="approve-btn"
                                  onClick={() => openApprovalModal(request, pendingReq.type)}
                                  disabled={actionLoading[`${request._id}_${pendingReq.type}`]}
                                >
                                  {actionLoading[`${request._id}_${pendingReq.type}`] ? (
                                    'Đang xử lý...'
                                  ) : (
                                    `Duyệt ${isRenterRefund ? 'hoàn tiền' : 'bồi thường'}`
                                  )}
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

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
            </>
          )}

          {/* Modal duyệt */}
          {showModal && (
            <div className="modal-overlay" onClick={closeModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>
                  Duyệt {actionType === 'renter_refund' ? 'hoàn tiền' : 'bồi thường'}
                </h3>
                
                {selectedRequest && (
                  <div className="modal-info">
                    <p><strong>Mã đơn:</strong> #{selectedRequest._id.slice(-6)}</p>
                    <p><strong>Người thuê:</strong> {selectedRequest.renter?.name}</p>
                    <p><strong>Chủ xe:</strong> {selectedRequest.vehicle?.owner?.name}</p>
                    <p><strong>Xe:</strong> {selectedRequest.vehicle?.brand} {selectedRequest.vehicle?.model}</p>
                    
                    {actionType === 'renter_refund' && (
                      <p><strong>Số tiền hoàn:</strong> {formatCurrency(selectedRequest.totalRefundForRenterCancel)}</p>
                    )}
                    
                    {actionType === 'owner_compensation' && (
                      <p><strong>Số tiền bồi thường:</strong> {formatCurrency(selectedRequest.totalRefundForOwnerCancel)}</p>
                    )}
                  </div>
                )}
                
                <div className="form-group">
                  <label>Ghi chú (tùy chọn):</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Nhập ghi chú cho yêu cầu này..."
                    rows={3}
                  />
                </div>
                
                <div className="modal-actions">
                  <button className="cancel-btn" onClick={closeModal}>
                    Hủy
                  </button>
                  <button 
                    className="confirm-btn" 
                    onClick={handleApproveRequest}
                    disabled={actionLoading[`${selectedRequest?._id}_${actionType}`]}
                  >
                    {actionLoading[`${selectedRequest?._id}_${actionType}`] ? 'Đang xử lý...' : 'Xác nhận duyệt'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default AllPendingRefunds;