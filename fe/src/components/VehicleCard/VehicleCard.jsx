import React from "react";
import { Car, MapPin, Fuel, Users, Heart, Gauge } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./VehicleCard.css";
import { FaHeart, FaRegHeart } from 'react-icons/fa';

const VehicleCard = ({ vehicle }) => {
  const navigate = useNavigate();
  const { user, isLoading, favorites, toggleFavorite } = useAuth();
  // Đồng bộ trạng thái yêu thích với context
  const isFavorite = favorites && favorites.some(fav => fav._id === vehicle._id);
  // Hiệu ứng click
  const [clicked, setClicked] = React.useState(false);
  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (isLoading) return;
    if (!user) {
      alert("Vui lòng đăng nhập để yêu thích xe!");
      return;
    }
    setClicked(true);
    toggleFavorite(vehicle);
    setTimeout(() => setClicked(false), 180);
  };

  const handleCardClick = () => {
    navigate(`/vehicles/${vehicle._id}`);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  // Helper: Capitalize first letter of each word
  const capitalizeWords = (str) =>
    str ? str.replace(/\b\w/g, (c) => c.toUpperCase()) : '';

  // Mapping for transmission and fuelType
  const getTransmissionLabel = (val) => {
    if (!val) return '';
    const v = val.toLowerCase();
    if (v === 'automatic' || v === 'tự động') return 'Tự động';
    if (v === 'manual' || v === 'số sàn') return 'Số sàn';
    return capitalizeWords(val);
  };
  const getFuelTypeLabel = (val) => {
    if (!val) return '';
    const v = val.toLowerCase();
    if (v === 'gasoline' || v === 'xăng') return 'Xăng';
    if (v === 'diesel' || v === 'dầu') return 'Dầu';
    if (v === 'electric' || v === 'điện') return 'Điện';
    if (v === 'hybrid') return 'Hybrid';
    return capitalizeWords(val);
  };

  return (
    <div className="vehicle-card-pro" onClick={handleCardClick} tabIndex={0}>
      <div className="vehicle-card-pro-img-wrap">
        <img
          src={vehicle.primaryImage || "/default-car.jpg"}
          alt={`${vehicle.brand} ${vehicle.model}`}
          className="vehicle-card-pro-img"
          loading="lazy"
        />
        {/* Icon trái tim ở góc phải trên, có thể click để thêm/bỏ yêu thích */}
        <button
          onClick={handleFavoriteClick}
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            zIndex: 20,
            background: 'rgba(255,255,255,0.8)',
            borderRadius: '50%',
            padding: 2,
            border: 'none',
            cursor: 'pointer',
            outline: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 32,
            height: 32,
          }}
          aria-label={isFavorite ? 'Bỏ yêu thích xe này' : 'Thêm vào xe yêu thích'}
        >
          {isFavorite ? (
            <FaHeart color="#f44336" size={22} />
          ) : (
            <FaRegHeart color="#f44336" size={22} />
          )}
        </button>
      </div>
      <div className="vehicle-card-pro-info">
        <div className="vehicle-card-pro-title-row">
          <span className="vehicle-card-pro-brand">{capitalizeWords(vehicle.brand)}</span>
          <span className="vehicle-card-pro-model">{capitalizeWords(vehicle.model)}</span>
        </div>
        <div className="vehicle-card-pro-location">
          <MapPin size={18} strokeWidth={2} />
          <span>{capitalizeWords(vehicle.location)}</span>
        </div>
        <div className="vehicle-card-pro-specs">
          <div>
            <Users size={18} strokeWidth={2} /> {vehicle.seatCount} chỗ
          </div>
          <div>
            <Gauge size={18} strokeWidth={2} />{" "}
            {getTransmissionLabel(vehicle.transmission)}
          </div>
          <div>
            <Fuel size={18} strokeWidth={2} />{" "}
            {getFuelTypeLabel(vehicle.fuelType)}
          </div>
        </div>
        <div className="vehicle-card-pro-price-row">
          <span className="vehicle-card-pro-price">
            {formatCurrency(vehicle.pricePerDay)}
          </span>
          <span className="vehicle-card-pro-price-unit">/ngày</span>
        </div>
      </div>
    </div>
  );
};

export default VehicleCard;
