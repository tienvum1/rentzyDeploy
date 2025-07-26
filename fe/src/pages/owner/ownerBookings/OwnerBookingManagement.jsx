import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';
import moment from 'moment';
import { toast } from 'react-toastify';
import './OwnerBookingManagement.css';
import './OwnerActionButtons.css';

const OwnerBookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalBookings, setTotalBookings] = useState(0);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [statusFilter, setStatusFilter] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [compensationAmount, setCompensationAmount] = useState('');
  const [cancelLoading, setCancelLoading] = useState(false);
  const bookingsPerPage = 10;
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

  const fetchOwnerBookings = async (page = 1, search = '', sort = 'createdAt', order = 'desc', status = '') => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: bookingsPerPage.toString(),
        sortBy: sort,
        sortOrder: order
      });
      
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      
      const res = await axios.get(`${backendUrl}/api/owner/owner-bookings?${params}`, { withCredentials: true });
      if (res.data.success) {
        setBookings(res.data.bookings);
        setTotalPages(res.data.totalPages);
        setTotalBookings(res.data.totalBookings);
        setCurrentPage(res.data.currentPage);
      } else {
        setError(res.data.message || 'Không thể tải danh sách đơn thuê.');
      }
    } catch (err) {
      setError('Không thể tải danh sách đơn thuê.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOwnerBookings(currentPage, searchTerm, sortBy, sortOrder, statusFilter);
  }, [currentPage, sortBy, sortOrder, statusFilter]);

  useEffect(() => {
    const delayedSearch = setTimeout(() => {
      if (currentPage === 1) {
        fetchOwnerBookings(1, searchTerm, sortBy, sortOrder, statusFilter);
      } else {
        setCurrentPage(1);
      }
    }, 500);
    return () => clearTimeout(delayedSearch);
  }, [searchTerm]);

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setCurrentPage(1);
  };
  
  const handleSortToggle = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    setCurrentPage(1);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  const handleStatusFilterChange = (e) => {
    setStatusFilter(e.target.value);
    setCurrentPage(1);
  };
  
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleCancelBooking = (booking) => {
    setSelectedBooking(booking);
    setShowCancelModal(true);
    setCancelReason('');
    setCompensationAmount('');
  };

  const handleCancelModalClose = () => {
    setShowCancelModal(false);
    setSelectedBooking(null);
    setCancelReason('');
    setCompensationAmount('');
  };

  const handleCancelSubmit = async () => {
    if (!cancelReason.trim()) {
      toast.error('Vui lòng nhập lý do hủy chuyến');
      return;
    }
    if (!compensationAmount || compensationAmount <= 0) {
      toast.error('Vui lòng nhập số tiền bồi thường hợp lệ');
      return;
    }

    setCancelLoading(true);
    try {
      const response = await axios.post(
        `${backendUrl}/api/owner/cancel-booking/${selectedBooking._id}`,
        {
          compensationReason: cancelReason,
          compensationAmount: parseInt(compensationAmount)
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        toast.success('Đã hủy chuyến và tạo yêu cầu bồi thường thành công!');
        handleCancelModalClose();
        fetchOwnerBookings(currentPage, searchTerm, sortBy, sortOrder, statusFilter);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi hủy chuyến');
    } finally {
      setCancelLoading(false);
    }
  };
  
  // Helper function để hiển thị text trạng thái
  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Đơn mới tạo, chưa thanh toán',
      'deposit_paid': 'Đã thanh toán cọc (30%)',
      'fully_paid': 'Đã hoàn tất thanh toán (100%)',
      'in_progress': 'Đang thuê xe',
      'completed': 'Đã trả xe, hoàn tất',
      'canceled': 'Đã hủy',
      'owner_canceled': 'Chủ xe hủy',
      'refunded': 'Đã hoàn tiền',
      'rejected': 'Bị từ chối',
      'cancel_requested': 'Đang chờ chủ xe duyệt huỷ'
    };
    return statusMap[status] || status;
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;
    
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }
    
    return (
      <div className="pagination-container">
        <div className="pagination-info">
          Hiển thị {Math.min((currentPage - 1) * bookingsPerPage + 1, totalBookings)} - {Math.min(currentPage * bookingsPerPage, totalBookings)} của {totalBookings} đơn thuê
        </div>
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            ‹ Trước
          </button>
          {pages}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Sau ›
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="owner-booking-layout">
      <SidebarOwner />
      <div className="owner-booking-content">
        <div className="owner-booking-header">
          <div className="search-container">
            <input
              type="text"
              className="owner-booking-search-input"
              placeholder="Tìm kiếm xe, khách thuê..."
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          <div className="filter-container">
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="status-filter-select"
            >
              <option value="">Tất cả trạng thái</option>
              <option value="pending">Đơn mới tạo, chưa thanh toán</option>
              <option value="deposit_paid">Đã thanh toán cọc (30%)</option>
              <option value="fully_paid">Đã hoàn tất thanh toán (100%)</option>
              <option value="in_progress">Đang thuê xe</option>
              <option value="completed">Đã trả xe, hoàn tất</option>
              <option value="canceled">Đã hủy</option>
              <option value="owner_canceled">Chủ xe hủy</option>
              <option value="refunded">Đã hoàn tiền</option>
              <option value="rejected">Bị từ chối</option>
              <option value="cancel_requested">Đang chờ chủ xe duyệt huỷ</option>
            </select>
          </div>
          <div className="sort-container">
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="owner-booking-sort-select"
            >
              <option value="createdAt">Ngày tạo</option>
              <option value="status">Trạng thái</option>
              <option value="totalAmount">Tổng tiền</option>
            </select>
            <button onClick={handleSortToggle} className="sort-order-btn">
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
        
        <div className="booking-stats">
          <h2 className="owner-booking-title">Quản lý đơn thuê</h2>
          {totalBookings > 0 && (
            <p className="booking-count">Tổng số: {totalBookings} đơn thuê</p>
          )}
        </div>
        
        {loading && <p>Đang tải...</p>}
        {error && <p className="owner-booking-error">{error}</p>}
        {!loading && bookings.length === 0 && (
          <p className="owner-booking-empty">
            {searchTerm || statusFilter ? 'Không tìm thấy đơn thuê nào phù hợp.' : 'Bạn chưa có đơn thuê nào.'}
          </p>
        )}
        {!loading && bookings.length > 0 && (
          <div className="owner-booking-table-wrapper">
            <table className="owner-booking-table">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Xe</th>
                  <th>Khách thuê</th>
                  <th>Trạng thái</th>
                  <th>Tổng tiền</th>
                  <th>Giờ & Ngày thuê</th>
                  <th>Ngày tạo</th>
                  <th>Giải ngân</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                   <tr key={b._id}>
                     <td>#{b._id.slice(-6)}</td>
                     <td>{b.vehicle?.brand} {b.vehicle?.model}</td>
                     <td>{b.renter?.name || b.renter?.email}</td>
                     <td>
                       {getStatusText(b.status)}
                     </td>
                     <td className="total-amount">
                       {b.totalAmount ? `${b.totalAmount.toLocaleString('vi-VN')} VNĐ` : 'N/A'}
                     </td>
                     <td>
                       {b.pickupTime} {moment(b.startDate).format('DD/MM/YYYY')} - {b.returnTime} {moment(b.endDate).format('DD/MM/YYYY')}
                     </td>
                     <td>{moment(b.createdAt).format('DD/MM/YYYY HH:mm')}</td>
                     <td>
                       {b.payoutStatus === 'none' && <span className="payout-status payout-status-none">Chưa đến bước</span>}
                       {b.payoutStatus === 'pending' && <span className="payout-status payout-status-pending">Chờ duyệt</span>}
                       {b.payoutStatus === 'approved' && <span className="payout-status payout-status-approved">Đã giải ngân</span>}
                       {b.payoutStatus === 'rejected' && <span className="payout-status payout-status-rejected">Từ chối</span>}
                     </td>
                     <td>
                       <div className="owner-booking-action-group">
                         <a
                           className="owner-booking-action-btn view"
                           href={`/ownerpage/booking-detail/${b._id}`}
                         >
                           Xem
                         </a>
                         <a
                           className="owner-booking-action-btn contract"
                           href={`/ownerpage/contract/${b._id}`}
                         >
                           Hợp đồng
                         </a>
                         {(['deposit_paid', 'fully_paid'].includes(b.status)) && (
                           <button
                             className="owner-booking-action-btn cancel"
                             onClick={() => handleCancelBooking(b)}
                           >
                             Hủy chuyến
                           </button>
                         )}
                       </div>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
             {renderPagination()}
           </div>
         )}

         {/* Cancel Booking Modal */}
         {showCancelModal && (
           <div className="modal-overlay">
             <div className="modal-content">
               <div className="modal-header">
                 <h3>Hủy chuyến và yêu cầu bồi thường</h3>
                 <button className="modal-close" onClick={handleCancelModalClose}>
                   ×
                 </button>
               </div>
               <div className="modal-body">
                 <p><strong>Đơn:</strong> #{selectedBooking?._id.slice(-6)}</p>
                 <p><strong>Xe:</strong> {selectedBooking?.vehicle?.brand} {selectedBooking?.vehicle?.model}</p>
                 <p><strong>Khách thuê:</strong> {selectedBooking?.renter?.name || selectedBooking?.renter?.email}</p>
                 
                 <div className="form-group">
                   <label>Lý do hủy chuyến *</label>
                   <textarea
                     value={cancelReason}
                     onChange={(e) => setCancelReason(e.target.value)}
                     placeholder="Nhập lý do hủy chuyến..."
                     rows={3}
                   />
                 </div>
                 
                 <div className="form-group">
                   <label>Số tiền bồi thường cho khách (VNĐ) *</label>
                   <input
                     type="number"
                     value={compensationAmount}
                     onChange={(e) => setCompensationAmount(e.target.value)}
                     placeholder="Nhập số tiền bồi thường..."
                     min="0"
                   />
                 </div>
               </div>
               <div className="modal-footer">
                 <button 
                   className="btn-secondary" 
                   onClick={handleCancelModalClose}
                   disabled={cancelLoading}
                 >
                   Hủy
                 </button>
                 <button 
                   className="btn-primary" 
                   onClick={handleCancelSubmit}
                   disabled={cancelLoading}
                 >
                   {cancelLoading ? 'Đang xử lý...' : 'Xác nhận hủy chuyến'}
                 </button>
               </div>
             </div>
           </div>
         )}
       </div>
     </div>
   );
 };

export default OwnerBookingManagement;