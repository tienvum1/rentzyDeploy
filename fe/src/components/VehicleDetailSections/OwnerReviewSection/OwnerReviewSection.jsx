import React from "react";
import { FaStar, FaStarHalfAlt, FaRegStar, FaCrown } from "react-icons/fa";
import "./OwnerReviewSection.css";
import { useNavigate } from "react-router-dom";

function renderStars(rating) {
  const stars = [];
  const rounded = Math.round(rating * 2) / 2; // Làm tròn 0.5
  for (let i = 1; i <= 5; i++) {
    if (rounded >= i) {
      stars.push(<FaStar key={i} color="#fbbf24" />);
    } else if (rounded + 0.5 === i) {
      stars.push(<FaStarHalfAlt key={i} color="#fbbf24" />);
    } else {
      stars.push(<FaRegStar key={i} color="#e5e7eb" />);
    }
  }
  return <span className="owner-stars">{stars}</span>;
}

const OwnerReviewSection = ({
  ownerId,
  ownerName,
  ownerAvatar,
  ownerBrand,
  avgRating,
  totalReviews,
  responseRate,
  responseTime,
  acceptanceRate,
  totalBookings,
  reviews = [],
  onSeeMore,
}) => {
  const navigate = useNavigate();
  return (
    <div className="owner-review-section">
      {/* Tiêu đề thông tin chủ xe */}
      <h3 className="owner-section-title">Thông tin chủ xe</h3>
      {/* Header: Avatar + Info + Stats */}
      <div className="owner-header">
        <div
          className="owner-header-left owner-header-clickable"
          onClick={() => navigate(`/owner/${ownerId}`)}
          style={{ cursor: "pointer" }}
        >
          <img src={ownerAvatar} alt={ownerName} className="owner-avatar" />
          <div className="owner-info">
            <div className="owner-brand">{ownerBrand}</div>
            <div className="owner-rating">
              {renderStars(avgRating)}
              <span className="owner-rating-value">{avgRating}</span>          
            </div>
            <div className="owner-booking-count">
              {totalBookings ? `${totalBookings}+ chuyến` : ''}
            </div>
          </div>
        </div>
        <div className="owner-stats">
          <div>
            <div className="stat-label">Tỉ lệ phản hồi</div>
            <div className="stat-value">{responseRate}%</div>
          </div>
          <div>
            <div className="stat-label">Thời gian phản hồi</div>
            <div className="stat-value">{responseTime}</div>
          </div>
          <div>
            <div className="stat-label">Tỉ lệ đồng ý</div>
            <div className="stat-value">{acceptanceRate}%</div>
          </div>
        </div>
      </div>

    

      {/* Tiêu đề đánh giá */}
      <h4 className="owner-section-subtitle">Đánh giá</h4>
      {/* Tổng điểm & số đánh giá */}
      <div className="review-summary">
         <b>{avgRating}</b><FaStar color="#fbbf24" />
        <span className="review-summary-count">• {totalReviews} đánh giá</span>
      </div>

      {/* Danh sách review */}
      <div className="owner-reviews-list">
        {reviews.slice(0, 2).map((r, idx) => (
          <div className="owner-review-item" key={idx}>
            <div className="review-user">
              <img src={r.avatar || "/default-avatar.png"} alt={r.name} className="review-avatar" />
              <div className="review-user-info">
                <div className="review-name">{r.name}</div>
                <div className="review-stars">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} color={i < r.rating ? "#fbbf24" : "#e5e7eb"} />
                  ))}
                </div>
              </div>
              <div className="review-date">{r.date}</div>
            </div>
            {r.content && <div className="review-content">{r.content}</div>}
          </div>
        ))}
      </div>

      {/* Xem thêm */}
      {reviews.length > 2 && (
        <div className="see-more-btn-wrapper">
          <button className="see-more-btn" onClick={onSeeMore}>Xem thêm</button>
        </div>
      )}
    </div>
  );
};

export default OwnerReviewSection;