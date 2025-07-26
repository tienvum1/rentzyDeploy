import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';
import './OwnerVehicleReviews.css';
import { useNavigate } from 'react-router-dom';

const OwnerVehicleReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get('/api/owner/vehicle-reviews', { withCredentials: true });
        setReviews(res.data.reviews || []);
      } catch (err) {
        setError('Không thể tải đánh giá.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  return (
    <div className="owner-review-layout">
      <SidebarOwner />
      <div className="owner-review-content">
        <h2 className="owner-review-title">Đánh giá về xe của bạn</h2>
        {loading && <div className="owner-review-loading">Đang tải...</div>}
        {error && <div className="owner-review-error">{error}</div>}
        {!loading && reviews.length === 0 && <div className="owner-review-empty">Chưa có đánh giá nào cho xe của bạn.</div>}
        {!loading && reviews.length > 0 && (
          <div className="owner-review-list">
            {reviews.map((r, idx) => (
              <div className="owner-review-card clean" key={idx}>
                <div className="owner-review-top-row">
                  <img src={r.avatar} alt={r.name} className="owner-review-avatar" />
                  <div className="owner-review-name-rating">
                    <span className="owner-review-name">{r.name}</span>
                    <span className="owner-review-rating-row">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < r.rating ? '#ffb400' : '#e0e0e0', fontSize: 18 }}>★</span>
                      ))}
                    </span>
                  </div>
                  <span className="owner-review-date-top">{r.date}</span>
                </div>
                <div className="owner-review-content-text main-content">{r.content}</div>
                <div className="owner-review-divider" />
                <div className="owner-review-booking-section">
                  <div className="owner-review-booking-grid">
                  <div><span className="icon">#️⃣</span> <b>ID đơn thuê:</b> {r.bookingId}</div>
                    <div><span className="icon">🚗</span> <b>Xe:</b> {r.vehicle}</div>
                   
                    <div><span className="icon">📅</span> <b>Ngày thuê:</b> {r.startDate ? new Date(r.startDate).toLocaleDateString('vi-VN') : ''} - {r.endDate ? new Date(r.endDate).toLocaleDateString('vi-VN') : ''}</div>
                    <div><span className="icon">💵</span> <b>Tổng tiền:</b> {r.totalAmount?.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>
                  </div>
                  <button className="owner-review-detail-btn" onClick={() => navigate(`/ownerpage/booking-detail/${r.bookingId}`)}>
                    Xem đơn
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerVehicleReviews; 