import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FaTimesCircle } from 'react-icons/fa';
import './PaymentFailed.css';

const PaymentFailed = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const message = searchParams.get('message');
  const bookingId = searchParams.get('bookingId');

  useEffect(() => {
    if (message) {
      toast.error(message);
    }
  }, [message]);

  const handleRetry = () => {
    if (bookingId) {
      navigate(`/payment/remaining/${bookingId}`);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="payment-failed-container">
      <div className="payment-failed-card">
        <FaTimesCircle className="failed-icon" />
        <h2>Thanh toán thất bại</h2>
        <p>{message || 'Có lỗi xảy ra trong quá trình thanh toán.'}</p>
        <div className="payment-failed-actions">
          <button className="retry-button" onClick={handleRetry}>
            Thử lại
          </button>
          <button className="back-button" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailed; 