import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaCheckCircle } from 'react-icons/fa';
import './PaymentSuccess.css';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (bookingId) {
      toast.success('Thanh toán thành công!');
      // Redirect to booking details after 3 seconds
      const timer = setTimeout(() => {
        navigate(`/bookings/${bookingId}`);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [bookingId, navigate]);

  return (
    <div className="payment-success-container">
      <div className="payment-success-card">
        <FaCheckCircle className="success-icon" />
        <h2>Thanh toán thành công!</h2>
        <p>Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi.</p>
        <p>Bạn sẽ được chuyển hướng đến trang chi tiết đơn hàng trong giây lát...</p>
      </div>
    </div>
  );
};

export default PaymentSuccess; 