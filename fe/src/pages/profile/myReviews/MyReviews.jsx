import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProfileLayout from '../profileLayout/ProfileLayout';
import './MyReviews.css';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReviews();
    // eslint-disable-next-line
  }, []);

  const fetchReviews = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get('/api/bookings/user/my-reviews', {
        withCredentials: true
      });
      setReviews(res.data.reviews || []);
    } catch (err) {
      setError('Không thể tải danh sách đánh giá.');
    }
    setLoading(false);
  };

  return (
    <ProfileLayout>
      <div className="my-reviews-container">
        <h2 className="my-reviews-title">Đánh giá bạn đã viết cho các xe</h2>
        {loading ? (
          <div className="my-reviews-loading">Đang tải...</div>
        ) : error ? (
          <div className="my-reviews-error">{error}</div>
        ) : reviews.length === 0 ? (
          <div className="my-reviews-empty">Bạn chưa có đánh giá nào.</div>
        ) : (
          <div className="my-reviews-list">
            {reviews.map((r) => (
              <div className="my-review-card new-style" key={r._id}>
                <div className="my-review-card-header">
                  <div className="my-review-avatar">
                    {r.avatarUrl
                      ? <img src={r.avatarUrl} alt={r.name} />
                      : <span className="my-review-avatar-fallback">{r.name?.charAt(0) || "?"}</span>
                    }
                  </div>
                  <div className="my-review-header-info">
                    <div className="my-review-name">{r.name || "Ẩn danh"}</div>
                    <div className="my-review-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < r.rating ? '#ffb400' : '#e0e0e0', fontSize: 20 }}>★</span>
                      ))}
                    </div>
                  </div>
                  <div className="my-review-date-top">
                    {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="my-review-content-box">
                  {r.review || '-'}
                </div>
                <div className="my-review-divider" />
                <div className="my-review-booking-row">
                  <div className="my-review-booking-info">
                    <span className="icon">#️⃣</span>
                    <b>ID đơn thuê:</b> {r.bookingId}
                  </div>
                  <div className="my-review-booking-info">
                    <span className="icon">🚗</span>
                    <b>Xe:</b> {r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : 'N/A'}
                  </div>
                  <div className="my-review-booking-info">
                    <span className="icon">📅</span>
                    <b>Ngày thuê:</b> {r.startDate ? new Date(r.startDate).toLocaleDateString('vi-VN') : ''} - {r.endDate ? new Date(r.endDate).toLocaleDateString('vi-VN') : ''}
                  </div>
                  <div className="my-review-booking-info">
                    <span className="icon">💵</span>
                    <b>Tổng tiền:</b> {r.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </div>
                </div>
                <div className="my-review-card-footer">
                  <button className="my-review-detail-btn" onClick={() => window.location.href = `/bookings/${r.bookingId}`}>Xem đơn</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default MyReviews; 