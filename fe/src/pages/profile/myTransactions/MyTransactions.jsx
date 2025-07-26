import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';
import moment from 'moment';
import { FaInfoCircle, FaCreditCard, FaExchangeAlt, FaMoneyBillWave } from 'react-icons/fa';
import './MyTransactions.css';
import ProfileLayout from '../profileLayout/ProfileLayout';

const MyTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [summary, setSummary] = useState({
    totalTransactions: 0,
    totalAmount: 0,
    completedTransactions: 0,
    completedAmount: 0,
    pendingTransactions: 0,
    pendingAmount: 0
  });
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  const navigate = useNavigate();

  useEffect(() => {
    fetchTransactions();
  }, [typeFilter, statusFilter, paymentMethodFilter, currentPage]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const config = {
        withCredentials: true,
      };
      
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage
      });
      
      if (typeFilter) params.append('type', typeFilter);
      if (statusFilter) params.append('status', statusFilter);
      if (paymentMethodFilter) params.append('paymentMethod', paymentMethodFilter);
      
      const url = `${process.env.REACT_APP_BACKEND_URL}/api/user/my-transactions?${params}`;
      const res = await axios.get(url, config);
      
      setTransactions(res.data.data.transactions);
      setSummary(res.data.data.summary);
      setTotalPages(res.data.data.pagination.totalPages);
      setError(null);
    } catch (err) {
      console.error('Error fetching user transactions:', err);
      setError(err.response?.data?.message || 'Failed to fetch transactions');
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error("Vui lòng đăng nhập để xem lịch sử giao dịch.");
        navigate('/login');
      } else {
        toast.error('Có lỗi xảy ra khi tải danh sách giao dịch.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTypeText = (type) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Đặt cọc';
      case 'RENTAL':
        return 'Thanh toán thuê xe';
      case 'TOPUP':
        return 'Nạp tiền';
      case 'bank_transfer_refund':
        return 'Hoàn tiền huỷ';
      default:
        return type;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING':
        return 'Đang xử lý';
      case 'COMPLETED':
        return 'Hoàn thành';
      case 'FAILED':
        return 'Thất bại';
      case 'REFUNDED':
        return 'Đã hoàn tiền';
      case 'CANCELED':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getPaymentMethodText = (method) => {
    switch (method) {
      case 'PAYOS':
        return 'PayOS';
      case 'MOMO':
        return 'MoMo';
      case 'VNPAY':
        return 'VNPay';
      case 'ZALOPAY':
        return 'ZaloPay';
      case 'BANK_TRANSFER':
      case 'bank_transfer':
        return 'Chuyển khoản ngân hàng';
      case 'CASH':
        return 'Tiền mặt';
      default:
        return method;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED':
        return 'completed';
      case 'PENDING':
        return 'pending';
      case 'FAILED':
        return 'failed';
      case 'REFUNDED':
        return 'refunded';
      case 'CANCELED':
        return 'canceled';
      default:
        return '';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'DEPOSIT':
      case 'RENTAL':
        return <FaCreditCard />;
      case 'REFUND':
      case 'bank_transfer_refund':
      case 'bank_transfer_compensation':
        return <FaMoneyBillWave />;
      case 'TOPUP':
        return <FaExchangeAlt />;
      default:
        return <FaInfoCircle />;
    }
  };

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [typeFilter, statusFilter, paymentMethodFilter]);

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
          className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination-container">
        <div className="pagination-controls">
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
          >
            ‹ Trước
          </button>
          
          {startPage > 1 && (
            <>
              <button className="pagination-btn" onClick={() => setCurrentPage(1)}>1</button>
              {startPage > 2 && <span className="pagination-dots">...</span>}
            </>
          )}
          
          {pages}
          
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
              <button className="pagination-btn" onClick={() => setCurrentPage(totalPages)}>{totalPages}</button>
            </>
          )}
          
          <button
            className="pagination-btn"
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
          >
            Sau ›
          </button>
        </div>
        <div className="pagination-info">
          <span>Trang {currentPage} / {totalPages}</span>
        </div>
      </div>
    );
  };

  return (
    <ProfileLayout>
      <ToastContainer position="top-right" autoClose={4000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover theme="light" />
      
      <div className="user-transactions-wrapper">
        <div className="page-header">
          <h1 className="page-title">Lịch sử giao dịch</h1>
          <p className="page-subtitle">Quản lý và theo dõi tất cả các giao dịch của bạn</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p className="loading-text">Đang tải danh sách giao dịch...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Có lỗi xảy ra</h3>
            <p className="error-message">{error}</p>
            <button className="retry-button" onClick={fetchTransactions}>Thử lại</button>
          </div>
        ) : (
          <div className="transactions-main-content">
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card">
                <div className="summary-icon">
                  <FaExchangeAlt />
                </div>
                <div className="summary-content">
                  <h3>{summary.totalTransactions}</h3>
                  <p>Tổng giao dịch</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon completed">
                  <FaCreditCard />
                </div>
                <div className="summary-content">
                  <h3>{summary.completedTransactions}</h3>
                  <p>Giao dịch thành công</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon pending">
                  <FaInfoCircle />
                </div>
                <div className="summary-content">
                  <h3>{summary.pendingTransactions}</h3>
                  <p>Giao dịch đang xử lý</p>
                </div>
              </div>
              <div className="summary-card">
                <div className="summary-icon">
                  <FaMoneyBillWave />
                </div>
                <div className="summary-content">
                  <h3>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(summary.completedAmount)}</h3>
                  <p>Tổng tiền đã giao dịch</p>
                </div>
              </div>
            </div>

            <div className="filter-section">
              <div className="filter-controls">
                <div className="filter-group">
                  <label htmlFor="typeFilter">Loại giao dịch</label>
                  <select
                    id="typeFilter"
                    value={typeFilter}
                    onChange={(e) => setTypeFilter(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="DEPOSIT">Đặt cọc</option>
                    <option value="RENTAL">Thanh toán thuê xe</option>
                    <option value="TOPUP">Nạp tiền</option>
                    <option value="bank_transfer_refund">Hoàn tiền huỷ</option>
=
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="statusFilter">Trạng thái</label>
                  <select
                    id="statusFilter"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="PENDING">Đang xử lý</option>
                    <option value="COMPLETED">Hoàn thành</option>
                    <option value="FAILED">Thất bại</option>
                    <option value="REFUNDED">Đã hoàn tiền</option>
                    <option value="CANCELED">Đã hủy</option>
                  </select>
                </div>
                <div className="filter-group">
                  <label htmlFor="paymentMethodFilter">Phương thức thanh toán</label>
                  <select
                    id="paymentMethodFilter"
                    value={paymentMethodFilter}
                    onChange={(e) => setPaymentMethodFilter(e.target.value)}
                  >
                    <option value="">Tất cả</option>
                    <option value="PAYOS">PayOS</option>
                    <option value="MOMO">MoMo</option>
                    <option value="VNPAY">VNPay</option>
                    <option value="ZALOPAY">ZaloPay</option>
                    <option value="BANK_TRANSFER">Chuyển khoản ngân hàng</option>
                    <option value="CASH">Tiền mặt</option>
                  </select>
                </div>
              </div>
            </div>

            {transactions.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💳</div>
                <h3>Chưa có giao dịch nào</h3>
                <p>Bạn chưa thực hiện giao dịch nào. Hãy bắt đầu thuê xe để có giao dịch đầu tiên!</p>
              </div>
            ) : (
              <div className="transactions-table-section">
                <div className="table-header">
                  <h3>Danh sách giao dịch</h3>
                </div>
                <div className="transactions-table-container">
                  <table className="transactions-table">
                    <thead>
                      <tr>
                        <th>Mã giao dịch</th>
                        <th>Loại</th>
                        <th>Đơn hàng</th>
                        <th>Số tiền</th>
                        <th>Phương thức</th>
                        <th>Trạng thái</th>
                        <th>Ngày tạo</th>
                        
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((transaction) => (
                        <tr key={transaction._id}>
                          <td className="transaction-id">
                            <div className="transaction-code">
                              {getTypeIcon(transaction.type)}
                              <span>#{transaction._id.slice(-8).toUpperCase()}</span>
                            </div>
                          </td>
                          <td className="transaction-type">
                            <span className={`type-badge ${transaction.type.toLowerCase()}`}>
                              {getTypeText(transaction.type)}
                            </span>
                          </td>
                          <td className="booking-info">
                            {transaction.booking ? (
                              <div className="booking-details">
                                <div className="booking-code">#{transaction.booking._id.slice(-8)}</div>
                                {transaction.booking.vehicle && (
                                  <div className="vehicle-name">{transaction.booking.vehicle.name}</div>
                                )}
                              </div>
                            ) : (
                              <span className="no-booking">-</span>
                            )}
                          </td>
                          <td className="amount-cell">
                            <span className={`amount ${transaction.type === 'REFUND' || transaction.type.includes('refund') || transaction.type.includes('compensation') ? 'positive' : 'negative'}`}>
                              {transaction.type === 'REFUND' || transaction.type.includes('refund') || transaction.type.includes('compensation') ? '+' : '-'}
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(transaction.amount)}
                            </span>
                          </td>
                          <td className="payment-method">
                            {getPaymentMethodText(transaction.paymentMethod)}
                          </td>
                          <td className="status-text">
                            <span className={`status-badge ${getStatusClass(transaction.status)}`}>
                              {getStatusText(transaction.status)}
                            </span>
                          </td>
                          <td className="date-cell">
                            {moment(transaction.createdAt).format('DD/MM/YYYY HH:mm')}
                          </td>
                     
                        </tr>
                      ))}
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
    </ProfileLayout>
  );
};

export default MyTransactions;