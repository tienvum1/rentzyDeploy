import React, { useState, useEffect } from 'react';
import { FaArrowLeft, FaUser, FaPhone, FaCalendarAlt, FaMapMarkerAlt, FaCheck, FaCar, FaFileSignature } from 'react-icons/fa';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './OrderConfirmation.css';
import Header from '../../../components/Header/Header';

const OrderConfirmation = () => {
  const { bookingId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('UNKNOWN'); // PENDING, COMPLETED, FAILED, CANCELED
  const DELIVERY_FEE = 200000;

  // Tính toán các khoản phí
  const calculateFees = () => {
    if (!booking) return null;
    const totalCost = booking.totalCost || 0; // Tiền thuê xe cơ bản
    // Kiểm tra xem có cần phí giao xe không (so sánh địa điểm nhận xe với địa điểm xe)
    const needsDelivery = booking.vehicle && booking.vehicle.location && 
      booking.pickupLocation && 
      booking.pickupLocation.trim().toLowerCase() !== booking.vehicle.location.trim().toLowerCase();
    const deliveryFee = needsDelivery ? DELIVERY_FEE : 0;
    const discountAmount = booking.discountAmount || 0;
    const totalAmount = totalCost + deliveryFee - discountAmount;
    // Tính 30% và 70%
    const upfrontAmount = Math.round(totalAmount * 0.3);
    const remainingAmount = totalAmount - upfrontAmount;
    return { totalCost, deliveryFee, discountAmount, totalAmount, upfrontAmount, remainingAmount };
  };
  const fees = calculateFees();

  // Xác định trạng thái thanh toán 30%
  // Giả sử transaction type là 'UPFRONT' cho 30%, 'REMAINING' cho 70%
  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        const config = { withCredentials: true };
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}`, config);
        setBooking(res.data.booking);
        setLoading(false);
        // Tìm transaction 30%
        const upfrontTransaction = res.data.booking.transactions.find(
          t => t.type === 'UPFRONT' && t.paymentMethod === 'MOMO'
        );
        if (upfrontTransaction) {
          setPaymentStatus(upfrontTransaction.status);
        } else {
          setPaymentStatus('NO_UPFRONT_FOUND');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch booking details');
        setLoading(false);
      }
    };
    if (bookingId) fetchBookingDetails();
  }, [bookingId, navigate]);

  const handleBack = () => navigate(-1);

  const handleCancelBooking = async () => {
    if (window.confirm('Bạn có chắc chắn muốn hủy đơn hàng này không?')) {
      try {
        const config = { withCredentials: true };
        // Sử dụng API mới thay vì cancel-expired
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}/cancel-pending`, {}, config);
        toast.success('Đã hủy đơn hàng thành công!');
        setTimeout(() => {
          navigate('/vehicles'); // Điều hướng về trang xe cho thuê
        }, 2000);
      } catch (err) {
        toast.error('Không thể hủy đơn hàng. Vui lòng thử lại!');
        console.error('Cancel booking error:', err);
      }
    }
  };

  const handleConfirm = () => {
    if (booking && booking._id) {
      // Điều hướng đến trang thanh toán 30%
      navigate(`/payment-deposit/${booking._id}`);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };
  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

  const isPaymentCompleted = paymentStatus === 'COMPLETED';
  const isPaymentFailedOrCanceled = paymentStatus === 'FAILED' || paymentStatus === 'CANCELED';

  if (loading) return <div className="loading">Đang tải thông tin...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!booking || !fees) return <div className="error">Không tìm thấy thông tin đơn hàng</div>;

  // DEBUG: Log giá trị pickupLocation và vehicle.location
  console.log('DEBUG pickupLocation:', booking.pickupLocation);
  console.log('DEBUG vehicle.location:', booking.vehicle?.location);

  return (
    <><Header/>
    <div className="order-confirmation-container">
      <div className="order-card">
        <div className="back-link" onClick={handleBack}>
          <FaArrowLeft className="mr-2" />
          <span className="font-semibold">Quay lại</span>
        </div>

        <div className="progress-bar-wrapper">
          <div className="progress-steps">
            <div className="progress-step completed">
              <div className="step-icon active">
                <FaCheck />
              </div>
              <span className="step-text">Tìm và chọn xe</span>
            </div>
            <div className="progress-step completed">
              <div className="step-icon active">
                <FaCheck />
              </div>
              <span className="step-text">Xác nhận đơn hàng</span>
            </div>
            <div className={`progress-step ${isPaymentCompleted ? 'completed' : ''}`}> 
              <div className={`step-icon ${isPaymentCompleted ? 'active' : 'current'}`}>
                {isPaymentCompleted ? <FaCheck /> : <FaCar />}
              </div>
              <span className="step-text">Thanh toán cọc 30%</span>
            </div>
            <div className="progress-step"> 
              <div className={`step-icon ${isPaymentCompleted ? 'current' : 'inactive'}`}>
                <FaFileSignature />
              </div>
              <span className="step-text">Ký hợp đồng</span>
            </div>
            <div className="progress-step"> 
              <div className="step-icon inactive">
                <FaCar />
              </div>
              <span className="step-text">Nhận xe</span>
            </div>
          </div>
        </div>

        <h2 className="section-title text-center">
            {isPaymentCompleted ? 'Thanh toán cọc thành công!' : isPaymentFailedOrCanceled ? 'Thanh toán thất bại hoặc đã hủy.' : 'Đang chờ xác nhận thanh toán...'}
        </h2>
        {isPaymentCompleted && (
            <div className="payment-success-message text-center">
                <p>Mã đơn hàng của bạn: <strong>{booking._id}</strong></p>
                <p>Cảm ơn bạn đã thanh toán thành công</p>
            </div>
        )}

        <h2 className="section-title">Thông tin đơn hàng</h2>
        <div className="order-details-section">
          <div className="order-detail-item">
            <FaCalendarAlt />
            <div>
              <p className="detail-label">Thời gian thuê</p>
              <p className="detail-value">
                {formatDate(booking.startDate)} đến {formatDate(booking.endDate)}
              </p>
            </div>
          </div>
          <div className="order-detail-item">
            <FaMapMarkerAlt />
            <div>
              <p className="detail-label">Địa điểm nhận xe</p>
              <p className="detail-value">{booking.pickupLocation}</p>
            </div>
          </div>
          <div className="order-detail-item">
            <FaMapMarkerAlt />
            <div>
              <p className="detail-label">Địa điểm trả xe</p>
              <p className="detail-value">{booking.returnLocation}</p>
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-item">
              <span className="summary-label">Phí thuê xe </span>
              <span className="summary-value">{formatCurrency(fees.totalCost)}</span>
            </div>
            {booking.vehicle && booking.vehicle.location && booking.pickupLocation.trim().toLowerCase() !== booking.vehicle.location.trim().toLowerCase() && fees.deliveryFee > 0 && (
              <div className="summary-item">
                <span className="summary-label">Phí giao xe (2 chiều)</span>
                <span className="summary-value">{formatCurrency(fees.deliveryFee)}</span>
              </div>
            )}
            {fees.discountAmount > 0 && (
              <div className="summary-item">
                <span className="summary-label">Giảm giá</span>
                <span className="summary-value discount">-{formatCurrency(fees.discountAmount)}</span>
              </div>
            )}
            <div className="total-summary">
              <span>Tổng cộng</span>
              <span>{formatCurrency(fees.totalAmount)}</span>
            </div>
          </div>
        </div>

        <h2 className="section-title">Các bước tiếp theo</h2>
        <div className="payment-steps-section">
          <div className="payment-step">
            <div className="payment-step-number">1</div>
            <div className="payment-step-content">
              <p className="payment-step-title">Thanh toán cọc 30% qua Rentzy</p>
              <p className="payment-step-description">Thanh toán cọc 30% để xác nhận đơn thuê và giữ xe.</p>
            </div>
            <span className="payment-amount">{formatCurrency(fees.upfrontAmount)}</span>
          </div>
          <div className="payment-step">
            <div className={`payment-step-number ${isPaymentCompleted ? 'completed' : ''}`}>2</div>
            <div className="payment-step-content">
              <p className="payment-step-title">Ký hợp đồng thuê xe</p>
              <p className="payment-step-description">Ký hợp đồng với chủ xe để hoàn tất thủ tục pháp lý.</p>
            </div>
            <span className="payment-amount">Miễn phí</span>
          </div>
          <div className="payment-step">
            <div className="payment-step-number">3</div>
            <div className="payment-step-content">
              <p className="payment-step-title">Nhận xe và thanh toán 70% còn lại</p>
              <p className="payment-step-description">Thanh toán số tiền còn lại khi nhận xe.</p>
            </div>
            <span className="payment-amount">{formatCurrency(fees.remainingAmount)}</span>
          </div>
        </div>

        <div className="action-buttons">
            {!isPaymentCompleted && (
                <button className="confirm-button" onClick={handleConfirm}>
                    Đi đến thanh toán cọc 30%
                </button>
            )}
        </div>

        <p className="terms-text">
          Bằng việc thanh toán cọc 30% và thuê xe, bạn đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a>
        </p>

        {!isPaymentCompleted && (
          <button className="cancel-booking-button" onClick={handleCancelBooking}>
            <span className="cancel-icon">✕</span>
            Hủy đơn hàng
          </button>
        )}
      </div>
    </div>
    </>
  );
};

export default OrderConfirmation;