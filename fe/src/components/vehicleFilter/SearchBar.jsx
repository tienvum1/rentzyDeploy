import React, { useState } from "react";
import { FaCalendarAlt, FaSearch, FaSpinner } from "react-icons/fa";
import RentalTimeModal from "./RentalTimeModal";
import { searchVehiclesByTime } from "../../services/vehicleService";
import "./SearchBar.css";

const SearchBar = ({ onSearch, onSearchStart, onSearchComplete }) => {
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [rentalTime, setRentalTime] = useState({
    pickupDate: "",
    pickupTime: "20:00",
    returnDate: "",
    returnTime: "20:00"
  });

  const handleTimeClick = () => setShowModal(true);

  const handleConfirmTime = (time) => {
    setRentalTime(time);
    setShowModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!rentalTime.pickupDate || !rentalTime.returnDate) {
      alert("Vui lòng chọn thời gian thuê xe");
      return;
    }

    // Check if return date is after pickup date
    const pickup = new Date(`${rentalTime.pickupDate}T${rentalTime.pickupTime}`);
    const returnDate = new Date(`${rentalTime.returnDate}T${rentalTime.returnTime}`);
    
    if (returnDate <= pickup) {
      alert("Thời gian trả xe phải sau thời gian nhận xe");
      return;
    }

    setIsLoading(true);
    
    // Notify parent component that search is starting
    if (onSearchStart) {
      onSearchStart();
    }
    
    try {
      // Call the new simple API
      const searchResult = await searchVehiclesByTime({
        pickupDate: rentalTime.pickupDate,
        pickupTime: rentalTime.pickupTime,
        returnDate: rentalTime.returnDate,
        returnTime: rentalTime.returnTime
      });

      // Notify parent component with search results
      if (onSearch) {
        onSearch({
          ...rentalTime,
          searchResult
        });
      }
    } catch (error) {
      console.error("Search error:", error);
      alert(error.message || "Có lỗi xảy ra khi tìm kiếm xe");
    } finally {
      setIsLoading(false);
      
      // Notify parent component that search is complete
      if (onSearchComplete) {
        onSearchComplete();
      }
    }
  };

  // Hiển thị text thời gian đã chọn
  const timeText = rentalTime.pickupDate && rentalTime.returnDate
    ? `${rentalTime.pickupTime}, ${rentalTime.pickupDate} đến ${rentalTime.returnTime}, ${rentalTime.returnDate}`
    : "Chọn thời gian";

  // Calculate duration
  const getDuration = () => {
    if (!rentalTime.pickupDate || !rentalTime.returnDate) return null;
    
    const pickup = new Date(`${rentalTime.pickupDate}T${rentalTime.pickupTime}`);
    const returnDate = new Date(`${rentalTime.returnDate}T${rentalTime.returnTime}`);
    
    if (returnDate <= pickup) return null;
    
    const diffTime = Math.abs(returnDate - pickup);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
    
    if (diffDays > 1) {
      return `${diffDays} ngày`;
    } else if (diffHours > 1) {
      return `${diffHours} giờ`;
    } else {
      return "Dưới 1 giờ";
    }
  };

  const duration = getDuration();

  return (
    <>
      <form className={`search-bar ${isLoading ? 'loading' : ''}`} onSubmit={handleSubmit}>
        <div 
          className="search-bar-field" 
          onClick={handleTimeClick}
        >
          <FaCalendarAlt className="search-bar-icon" />
          <div className="search-bar-content">
            <span className="search-bar-text">{timeText}</span>
            {duration && (
              <span className="search-bar-duration">({duration})</span>
            )}
          </div>
        </div>
        
        <button 
          className="search-bar-btn" 
          type="submit"
          disabled={isLoading || !rentalTime.pickupDate || !rentalTime.returnDate}
        >
          {isLoading ? (
            <>
              <FaSpinner className="search-bar-spinner" />
              Đang tìm...
            </>
          ) : (
            <>
              <FaSearch />
              TÌM XE
            </>
          )}
        </button>
      </form>
      
      <RentalTimeModal
        open={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={handleConfirmTime}
        initialValue={rentalTime}
      />
    </>
  );
};

export default SearchBar; 