import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { FaInfoCircle, FaCreditCard, FaStar, FaTimesCircle } from 'react-icons/fa';
import './UserBookings.css';
import ProfileLayout from '../profileLayout/ProfileLayout';
import { reviewBooking } from '../../../services/vehicleService';

const UserBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewBookingId, setReviewBookingId] = useState(null);
  const [reviewStars, setReviewStars] = useState(5);
  const [reviewContent, setReviewContent] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelBookingId, setCancelBookingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelError, setCancelError] = useState('');
  const [cancelSubmitting, setCancelSubmitting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const config = {
        withCredentials: true,
      };
      let url = `${process.env.REACT_APP_BACKEND_URL}/api/bookings/my-bookings`;
      if (statusFilter) {
        url += `?status=${statusFilter}`;
      }
      const res = await axios.get(url, config);
      setBookings(res.data.bookings);
      setError(null);
    } catch (err) {
      console.error('Error fetching user bookings:', err);
      setError(err.response?.data?.message || 'Failed to fetch bookings');
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Vui lòng đăng nhập để xem lịch sử đặt xe.");
        navigate('/login');
      } else {
        toast.error('Có lỗi xảy ra khi tải danh sách đặt xe.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending':
        return 'Đang chờ xử lý';
      case 'deposit_paid':
        return 'Đã thanh toán tiền giữ chỗ';
      case 'fully_paid':
        return 'Đã thanh toán toàn bộ';
      case 'in_progress':
        return 'Đang thuê xe';
      case 'completed':
        return 'Đã hoàn thành';
      case 'canceled':
        return 'Đã huỷ';
      case 'refunded':
        return 'Đã hoàn tiền';
      case 'rejected':
        return 'Bị từ chối';
      case 'cancel_requested':
        return 'Đang chờ huỷ';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    return status.toLowerCase();
  };

  const calculatePaymentDetails = (booking) => {
    // Tổng tiền khách đã trả (không trừ hoàn tiền)
    const totalPaid = booking.transactions.reduce((sum, transaction) => {
      if (transaction.status === 'COMPLETED' && transaction.type !== 'REFUND') {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    // Tổng tiền đã hoàn lại
    const totalRefund = booking.transactions.reduce((sum, transaction) => {
      if (transaction.status === 'COMPLETED' && transaction.type === 'REFUND') {
        return sum + transaction.amount;
      }
      return sum;
    }, 0);

    // Số tiền còn lại phải trả (nếu đã hoàn tiền hoặc đã huỷ thì là 0)
    let remainingAmount = booking.status === 'RENTAL_PAID' ? 0 : booking.totalAmount - totalPaid;
    if (
      booking.status === 'canceled' || booking.status === 'CANCELED' ||
      booking.status === 'refunded' || booking.status === 'REFUNDED'
    ) {
      remainingAmount = 0;
    }

    return {
      totalPaid,
      totalRefund,
      remainingAmount
    };
  };

  const handleOpenReview = (bookingId) => {
    setReviewBookingId(bookingId);
    setShowReviewModal(true);
    setReviewStars(5);
    setReviewContent("");
  };

  const handleCloseReview = () => {
    setShowReviewModal(false);
    setReviewBookingId(null);
    setReviewStars(5);
    setReviewContent("");
  };

  const handleSubmitReview = async () => {
    if (!reviewStars || !reviewContent.trim()) {
      toast.error("Vui lòng chọn số sao và nhập nội dung đánh giá.");
      return;
    }
    setReviewSubmitting(true);
    try {
      await reviewBooking(reviewBookingId, reviewStars, reviewContent);
      toast.success("Đánh giá của bạn đã được gửi!");
      handleCloseReview();
      fetchBookings(); // Reload lại danh sách để ẩn nút đánh giá
    } catch (err) {
      toast.error(err.response?.data?.message || "Gửi đánh giá thất bại. Vui lòng thử lại.");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleOpenCancel = (bookingId) => {
    setCancelBookingId(bookingId);
    setShowCancelModal(true);
    setCancelReason('');
    setCancelError('');
  };

  const handleCloseCancel = () => {
    setShowCancelModal(false);
    setCancelBookingId(null);
    setCancelReason('');
    setCancelError('');
  };

  const handleSubmitCancel = async () => {
    if (!cancelReason.trim()) {
      setCancelError('Vui lòng nhập lý do huỷ đơn.');
      return;
    }
    setCancelSubmitting(true);
    try {
      const config = { withCredentials: true };
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/${cancelBookingId}/request-cancel`,
        {
          reason: cancelReason
        },
        config
      );
      if (res.data.success) {
        toast.success('Yêu cầu huỷ đơn đã được gửi thành công! Vui lòng chờ chủ xe duyệt.');
        handleCloseCancel();
        fetchBookings(); // Reload lại danh sách
      } else {
        toast.error(res.data.message || 'Không thể gửi yêu cầu huỷ.');
        setCancelError(res.data.message || 'Không thể gửi yêu cầu huỷ.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Không thể gửi yêu cầu huỷ.');
      setCancelError(err.response?.data?.message || 'Không thể gửi yêu cầu huỷ.');
    } finally {
      setCancelSubmitting(false);
    }
  };

  // Filter bookings based on status
  const filteredBookings = statusFilter
    ? bookings.filter(booking => booking.status === statusFilter)
    : bookings;

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBookings = filteredBookings.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="pagination-container">
        <div className="pagination-info">
           Hiển thị {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredBookings.length)} trong tổng số {filteredBookings.length} đơn
         </div>
        <div className="pagination">
          <button 
            className="pagination-btn" 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            ‹ Trước
          </button>
          
          {startPage > 1 && (
            <>
              <button className="pagination-btn" onClick={() => handlePageChange(1)}>1</button>
              {startPage > 2 && <span className="pagination-dots">...</span>}
            </>
          )}
          
          {pageNumbers.map(number => (
            <button
              key={number}
              className={`pagination-btn ${currentPage === number ? 'active' : ''}`}
              onClick={() => handlePageChange(number)}
            >
              {number}
            </button>
          ))}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
              <button className="pagination-btn" onClick={() => handlePageChange(totalPages)}>{totalPages}</button>
            </>
          )}
          
          <button 
            className="pagination-btn" 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Sau ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <ProfileLayout>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      
      <div className="user-bookings-wrapper">
        <div className="page-header">
          <h1 className="page-title">Lịch sử đặt xe của bạn</h1>
          <p className="page-subtitle">Quản lý và theo dõi tất cả các đơn thuê xe của bạn</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải danh sách đặt xe...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Có lỗi xảy ra</h3>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchBookings}>Thử lại</button>
          </div>
        ) : (
          <div className="bookings-main-content">
            <div className="filter-section">
      
              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="statusFilter">Trạng thái đơn hàng</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="filter-select"
                  >
                    <option value="">Tất cả trạng thái</option>
                    <option value="pending">Đang chờ xử lý</option>
                    <option value="deposit_paid">Đã thanh toán tiền giữ chỗ</option>
                    <option value="fully_paid">Đã thanh toán toàn bộ</option>
                    <option value="in_progress">Đang thuê xe</option>
                    <option value="completed">Đã hoàn thành</option>
                    <option value="canceled">Đã huỷ</option>
                    <option value="refunded">Đã hoàn tiền</option>
                    <option value="rejected">Bị từ chối</option>
                    <option value="cancel_requested">Đang chờ huỷ</option>
                  </select>
                </div>
                <div className="filter-stats">
                  <span className="total-bookings">
                    {statusFilter ? `Đã lọc: ${filteredBookings.length}/${bookings.length} đơn` : `Tổng: ${bookings.length} đơn`}
                  </span>
                </div>
              </div>
            </div>

            {filteredBookings.length === 0 ? (
              <p className="no-bookings-message">
                {statusFilter ? 'Không có đơn nào phù hợp với bộ lọc.' : 'Bạn chưa có đơn đặt xe nào.'}
              </p>
            ) : (
              <div className="bookings-table-section">
                <div className="table-header">
                  <h3>Danh sách đơn thuê xe</h3>
                </div>
                <div className="bookings-table-container">
                  <table className="bookings-table">
                    <thead>
                      <tr>
                        <th>Mã đơn</th>
                        <th>Xe</th>
                        <th>Ngày nhận</th>
                        <th>Ngày trả</th>
                        <th>Tổng tiền</th>
                        <th>Đã thanh toán</th>
                        <th>Còn lại</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                  <tbody>
                    {currentBookings.map((booking) => {
                        const { totalPaid, remainingAmount, totalRefund } = calculatePaymentDetails(booking);
                        
                        return (
                          <React.Fragment key={booking._id}>
                            <tr>
                              <td className="booking-id">#{booking._id.slice(-4)}</td>
                              <td>
                                <div className="vehicle-cell-content">
                                  <div className="vehicle-details-text">
                                    <p className="vehicle-name-in-table">
                                      {booking.vehicle?.brand} {booking.vehicle?.model || 'Xe không xác định'}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="date-cell">{moment(booking.startDate).format('DD/MM/YYYY HH:mm')}</td>
                              <td className="date-cell">{moment(booking.endDate).format('DD/MM/YYYY HH:mm')}</td>
                              <td className="amount-cell">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}</td>
                              <td className="amount-cell">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalPaid)}</td>
                              <td className="amount-cell">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(remainingAmount)}</td>
                              <td>
                                <span className={`status-badge ${getStatusClass(booking.status)}`}>
                                  {getStatusText(booking.status)}
                                </span>
                              </td>
                              <td className="actions-cell">
                                <div className="action-buttons">
                                  <button 
                                    className="view-details-button"
                                    onClick={() => navigate(`/bookings/${booking._id}`)}
                                    title="Xem chi tiết"
                                  >
                                    <FaInfoCircle /> Xem chi tiết
                                  </button>
                                  <button
                                    className="view-contract-button"
                                    style={{ marginLeft: 8, background: '#1976d2', color: '#fff', borderRadius: 6, padding: '6px 14px', fontWeight: 500, border: 'none', cursor: 'pointer' }}
                                    onClick={() => navigate(`/contracts/${booking._id}`)}
                                    title="Xem hợp đồng"
                                  >
                                    Xem hợp đồng
                                  </button>
                                  {booking.status === 'DEPOSIT_PAID' && remainingAmount > 0 && (
                                    <button 
                                      className="pay-remaining-button"
                                      onClick={() => navigate(`/payment-remaining/${booking._id}`)}
                                      title="Thanh toán"
                                    >
                                      <FaCreditCard /> Thanh toán
                                    </button>
                                  )}
                                  { booking.status =='completed' && !booking.rating && !booking.review && (
                                    <button
                                      className="review-button"
                                      onClick={() => handleOpenReview(booking._id)}
                                      title="Đánh giá"
                                    >
                                      Đánh giá
                                    </button>
                                  )}

                                </div>
                              </td>
                            </tr>
                            {totalRefund > 0 && (
                              <tr>
                                <td colSpan={9}>
                                  <div className="refund-note" style={{ color: '#2563eb', background: '#f1f5f9', borderRadius: 6, padding: '6px 12px', margin: '4px 0', fontSize: 15 }}>
                                    Đã hoàn tiền: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRefund)} về ví của bạn.
                                  </div>
                                </td>
                              </tr>
                            )}
                            {(booking.totalRefundForRenterCancel > 0 || booking.totalRefundForOwnerCancel > 0) && booking.status === 'canceled' && (
                              <tr>
                                <td colSpan={9}>
                                  <div className="cancel-refund-info" style={{ color: '#059669', background: '#f0fdf4', borderRadius: 6, padding: '8px 12px', margin: '4px 0', fontSize: 15, border: '1px solid #bbf7d0' }}>
                                    <div><strong>Thông tin hoàn tiền sau huỷ:</strong></div>
                                    {booking.totalRefundForRenterCancel > 0 && (
                                      <div>• Hoàn cho bạn: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalRefundForRenterCancel)}</div>
                                    )}
                                    {booking.totalRefundForOwnerCancel > 0 && (
                                      <div>• Bồi thường chủ xe: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalRefundForOwnerCancel)}</div>
                                    )}
                                    <div style={{ fontSize: 13, color: '#065f46', marginTop: 4 }}>Trạng thái: {booking.refundStatusRenter === 'approved' ? 'Đã chuyển tiền' : 'Đang chờ admin duyệt chuyển tiền'}</div>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            
            {/* Pagination */}
            {renderPagination()}
          </div>
        )}
      </div>
      {/* Review Modal Popup */}
      {showReviewModal && (
        <div className="review-modal-overlay">
          <div className="review-modal">
            <button className="review-modal-close" onClick={handleCloseReview}>×</button>
            <h3>Đánh giá chuyến đi</h3>
            <div className="review-stars">
              {[1,2,3,4,5].map((star) => (
                <FaStar
                  key={star}
                  size={28}
                  style={{ cursor: 'pointer', marginRight: 4 }}
                  color={star <= reviewStars ? '#fbbf24' : '#e5e7eb'}
                  onClick={() => setReviewStars(star)}
                />
              ))}
            </div>
            <textarea
              className="review-textarea"
              rows={4}
              placeholder="Hãy chia sẻ trải nghiệm của bạn..."
              value={reviewContent}
              onChange={e => setReviewContent(e.target.value)}
              disabled={reviewSubmitting}
            />
            <div className="review-modal-actions">
              <button className="review-submit-btn" onClick={handleSubmitReview} disabled={reviewSubmitting}>
                {reviewSubmitting ? 'Đang gửi...' : 'Gửi đánh giá'}
              </button>
              <button className="review-cancel-btn" onClick={handleCloseReview} disabled={reviewSubmitting}>
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="modal-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div className="modal-content" style={{
            background: '#fff',
            borderRadius: 12,
            padding: 24,
            maxWidth: 500,
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <div className="modal-header" style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 20
            }}>
              <h3 style={{ margin: 0, color: '#dc3545' }}>Huỷ đặt xe</h3>
              <button
                onClick={handleCloseCancel}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: 24,
                  cursor: 'pointer',
                  color: '#666'
                }}
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
                  Lý do huỷ đơn <span style={{ color: 'red' }}>*</span>
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Nhập lý do huỷ đơn..."
                  rows={4}
                  style={{
                    width: '100%',
                    border: '1px solid #ddd',
                    borderRadius: 6,
                    padding: 10,
                    fontSize: 14,
                    resize: 'vertical',
                    outline: 'none'
                  }}
                />
              </div>
              {cancelError && (
                <div style={{ color: 'red', fontSize: 14, marginBottom: 16 }}>
                  {cancelError}
                </div>
              )}
              <div style={{ color: '#666', fontSize: 14, marginBottom: 20 }}>
                <strong>Lưu ý:</strong> Yêu cầu huỷ sẽ được gửi đến chủ xe để duyệt. Số tiền hoàn lại sẽ phụ thuộc vào chính sách hoàn tiền và thời gian huỷ.
              </div>
            </div>
            <div className="modal-footer" style={{
              display: 'flex',
              gap: 12,
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={handleCloseCancel}
                disabled={cancelSubmitting}
                style={{
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  fontWeight: 500
                }}
              >
                Đóng
              </button>
              <button
                onClick={handleSubmitCancel}
                disabled={cancelSubmitting || !cancelReason.trim()}
                style={{
                  background: cancelSubmitting ? '#ccc' : '#dc3545',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '10px 20px',
                  cursor: cancelSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: 500
                }}
              >
                {cancelSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu huỷ'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProfileLayout>
  );
};

export default UserBookings;