import React, { useState, useRef, useEffect } from "react";
import {
  FaCrown,
  FaCarSide,
  FaIndustry,
  FaSlidersH,
  FaGasPump,
  FaMapMarkerAlt,
  FaTruck,
  FaCar,
  FaShuttleVan,
  FaCarAlt,
  FaCaravan,
  FaSortAmountDown
} from "react-icons/fa";
import "./FilterBar.css";

// Icon components với thiết kế đẹp hơn
const PickupIcon = () => <FaTruck className="vehicle-icon" />;
const HatchbackIcon = () => <FaCar className="vehicle-icon" />;
const MPV7Icon = () => <FaShuttleVan className="vehicle-icon" />;
const Sedan5Icon = () => <FaCarAlt className="vehicle-icon" />;
const SUV5Icon = () => <FaCarSide className="vehicle-icon" />;
const SUV7Icon = () => <FaCaravan className="vehicle-icon" />;

// Nhiên liệu
export const fuelOptions = [
  { value: "gasoline", label: "Xăng", icon: <FaGasPump /> },
  { value: "diesel", label: "Dầu", icon: <FaGasPump /> },
  { value: "electric", label: "Điện", icon: <FaGasPump /> },
  { value: "hybrid", label: "Hybrid", icon: <FaGasPump /> }
];

// Loại xe
export const transmissionOptions = [
  { value: "manual", label: "Số sàn", icon: <FaSlidersH /> },
  { value: "automatic", label: "Số tự động", icon: <FaSlidersH /> }
];

// Khu vực xe (quận Đà Nẵng)
export const areaOptions = [
  { value: "Hai Chau", label: "Hải Châu", icon: <FaMapMarkerAlt /> },
  { value: "Thanh Khe", label: "Thanh Khê", icon: <FaMapMarkerAlt /> },
  { value: "Son Tra", label: "Sơn Trà", icon: <FaMapMarkerAlt /> },
  { value: "Ngu Hanh Son", label: "Ngũ Hành Sơn", icon: <FaMapMarkerAlt /> },
  { value: "Lien Chieu", label: "Liên Chiểu", icon: <FaMapMarkerAlt /> },
  { value: "Cam Le", label: "Cẩm Lệ", icon: <FaMapMarkerAlt /> },
  { value: "Hoa Vang", label: "Hòa Vang", icon: <FaMapMarkerAlt /> }
];

// Số chỗ: như ảnh bạn gửi, có thể là object gồm icon, label, count
export const seatOptions = [
  { value: "pickup", label: "Bán Tải", count: 3, icon: <PickupIcon /> },
  { value: "hatchback", label: "HatchBack", count: 9, icon: <HatchbackIcon /> },
  { value: "mpv7", label: "MPV 7 chỗ", count: 23, icon: <MPV7Icon /> },
  { value: "sedan5", label: "Sedan 5 chỗ", count: 78, icon: <Sedan5Icon /> },
  { value: "suv5", label: "SUV 5 chỗ", count: 109, icon: <SUV5Icon /> },
  { value: "suv7", label: "SUV 7 chỗ", count: 124, icon: <SUV7Icon /> }
];

// Hãng xe (brand)
export const brandOptions = [
  "Toyota",
  "Kia",
  "Mazda",
  "Hyundai",
  "Honda",
  "VinFast",
  "Ford",
  "Mercedes-Benz"
].map(b => ({ value: b, label: b, icon: <FaIndustry /> }));

const FilterBar = ({ onFilter, onClearAllFilters, onSort }) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [selected, setSelected] = useState({
    seat: null,
    fuel: null,
    transmission: null,
    area: null,
    brand: null,
  });
  const [activeFilters, setActiveFilters] = useState(0);
  const barRef = useRef();

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (barRef.current && !barRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Đếm số filter đang active
  useEffect(() => {
    const count = Object.values(selected).filter(value => value !== null).length;
    setActiveFilters(count);
  }, [selected]);

  // Toggle chọn filter
  const handleSelect = (type, value) => {
    setSelected(prev => ({
      ...prev,
      [type]: prev[type] === value ? null : value
    }));
    if (onFilter) onFilter(type, value);
  };

  // Clear tất cả filter
  const clearAllFilters = () => {
    setSelected({ seat: null, fuel: null, transmission: null, area: null, brand: null });
    if (onClearAllFilters) onClearAllFilters();
  };

  // Helper render dropdown với animation
  const renderDropdown = (type, options) => (
    <div className="filter-dropdown">
      {options.map(opt => (
        <div
          key={opt.value}
          className={`dropdown-item${selected[type] === opt.value ? " selected" : ""}`}
          onClick={() => handleSelect(type, opt.value)}
        >
          {opt.icon && <span className="dropdown-icon">{opt.icon}</span>}
          <span className="dropdown-text">
            {opt.label}
            {typeof opt.count === 'number' && (
              <span className="dropdown-count"> ({opt.count} xe)</span>
            )}
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="filter-bar" ref={barRef}>
      <button
        className={`filter-btn ${activeFilters === 0 ? 'active' : ''}`}
        onClick={clearAllFilters}
      >
        <FaCrown /> Tất cả
      </button>

      {/* Số chỗ */}
      <div className="filter-dropdown-container">
        <button
          className={`filter-btn ${selected.seat ? 'active' : ''}`}
          onClick={() => setOpenDropdown(openDropdown === 'seat' ? null : 'seat')}
        >
          <FaCarSide /> Số chỗ
          {selected.seat && <span className="filter-badge">1</span>}
        </button>
        {openDropdown === 'seat' && renderDropdown('seat', seatOptions)}
      </div>

      {/* Hãng xe */}
      <div className="filter-dropdown-container">
        <button
          className={`filter-btn ${selected.brand ? 'active' : ''}`}
          onClick={() => setOpenDropdown(openDropdown === 'brand' ? null : 'brand')}
        >
          <FaIndustry /> Hãng xe
          {selected.brand && <span className="filter-badge">1</span>}
        </button>
        {openDropdown === 'brand' && renderDropdown('brand', brandOptions)}
      </div>

      {/* Loại xe */}
      <div className="filter-dropdown-container">
        <button
          className={`filter-btn ${selected.transmission ? 'active' : ''}`}
          onClick={() => setOpenDropdown(openDropdown === 'transmission' ? null : 'transmission')}
        >
          <FaSlidersH /> Loại xe
          {selected.transmission && <span className="filter-badge">1</span>}
        </button>
        {openDropdown === 'transmission' && renderDropdown('transmission', transmissionOptions)}
      </div>

      {/* Nhiên liệu */}
      <div className="filter-dropdown-container">
        <button
          className={`filter-btn ${selected.fuel ? 'active' : ''}`}
          onClick={() => setOpenDropdown(openDropdown === 'fuel' ? null : 'fuel')}
        >
          <FaGasPump /> Nhiên liệu
          {selected.fuel && <span className="filter-badge">1</span>}
        </button>
        {openDropdown === 'fuel' && renderDropdown('fuel', fuelOptions)}
      </div>


      <button className="filter-btn sort-btn" onClick={onSort}>
        <FaSortAmountDown /> Sắp xếp
      </button>
    </div>
  );
};

export default FilterBar;
