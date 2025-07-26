import React, { useEffect, useState } from "react";
import axios from "axios";
import { FaCar, FaStar, FaCrown } from "react-icons/fa";
import { useParams } from "react-router-dom";
import "./OwnerProfilePage.css";
import VehicleCard from '../../../components/VehicleCard/VehicleCard';
import Header from '../../../components/Header/Header';
import Footer from '../../../components/footer/Footer';

const OwnerProfilePage = () => {
  const { ownerId } = useParams();
  const [ownerInfo, setOwnerInfo] = useState(null);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState([]);

  // Lấy thông tin chủ xe + đánh giá
  useEffect(() => {
    const fetchOwnerData = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${ownerId}/reviews`);
        setOwnerInfo(res.data.owner);
        setReviews(res.data.reviews); // <-- thêm dòng này
      } catch (err) {
        setOwnerInfo(null);
        setReviews([]);
      }
    };
    fetchOwnerData();
  }, [ownerId]);

  // Lấy danh sách xe của chủ xe
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/vehicles/ownerVehicles/${ownerId}`);
        setVehicles(res.data.vehicles || []);
      } catch (err) {
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, [ownerId]);

  if (loading) return <div className="owner-profile-loading">Đang tải...</div>;
  if (!ownerInfo) return <div className="owner-profile-error">Không tìm thấy chủ xe.</div>;

  return (
    <>
      <Header />
      <div className="owner-profile-page">
        {/* Thông tin chủ xe */}
        <div className="owner-profile-header">
          <div className="owner-profile-avatar">
            <img src={ownerInfo.avatar} alt={ownerInfo.name} />
          </div>
          <div className="owner-profile-main">
            <h2>{ownerInfo.name}</h2>
            <div className="owner-profile-meta">
              <span className="owner-profile-bookings">
                <FaCar color="#22c55e" /> {ownerInfo.totalBookings}+ chuyến
              </span>
              <span className="owner-profile-rating">
                <FaStar color="#fbbf24" /> {ownerInfo.avgRating} ({ownerInfo.totalReviews} đánh giá)
              </span>
            </div>
            <div className="owner-profile-stats">
              <span>Tỉ lệ phản hồi: <b>{ownerInfo.responseRate}%</b></span>
              <span>Thời gian phản hồi: <b>{ownerInfo.responseTime}</b></span>
              <span>Tỉ lệ đồng ý: <b>{ownerInfo.acceptanceRate}%</b></span>
            </div>
           
          </div>
        </div>

        {/* Danh sách xe */}
        <div className="owner-profile-section">
          <h3>Danh sách xe đang cho thuê</h3>
          <div className="owner-vehicle-list">
            {vehicles.length === 0 ? (
              <div>Chủ xe chưa có xe nào đang cho thuê.</div>
            ) : (
              vehicles.filter(v => v.status === 'available' && v.approvalStatus === 'approved').map((v) => (
                <VehicleCard vehicle={v} key={v._id} />
              ))
            )}
          </div>
        </div>

        {/* Đánh giá chủ xe */}
        <div className="owner-profile-section">
          <h3>Đánh giá về chủ xe</h3>
          {/* Tổng điểm & số đánh giá */}
          <div className="review-summary">
            <b>{ownerInfo.avgRating}</b>
            <FaStar color="#fbbf24" />
            <span className="review-summary-count">• {ownerInfo.totalReviews} đánh giá</span>
          </div>
          {/* Danh sách review */}
          <div className="owner-reviews-list">
            {reviews.length === 0 ? (
              <div>Chưa có đánh giá nào cho chủ xe này.</div>
            ) : (
              reviews.slice(0, 2).map((r, idx) => (
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
              ))
            )}
          </div>
          {/* Xem thêm */}
          {reviews.length > 2 && (
            <div className="see-more-btn-wrapper">
              <button className="see-more-btn" onClick={() => {}}>Xem thêm</button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
};

export default OwnerProfilePage;