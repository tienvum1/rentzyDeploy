import React from 'react';


const VehicleFeatures = ({ seatCount, transmission, fuelType, fuelConsumption }) => {
    return (
        <div className="vehicle-detail-features">
            <h2>Đặc điểm</h2>
            <div className="features-grid">
                <div className="feature-item">
                    <i className="fa-solid fa-chair"></i>
                    <p>Số chỗ: <strong>{seatCount}</strong></p>
                </div>
                <div className="feature-item">
                    <i className="fa-solid fa-gears"></i>
                    <p>Truyền động: <strong>{transmission === 'automatic' ? 'Số tự động' : 'Số sàn'}</strong></p>
                </div>
                <div className="feature-item">
                    <i className="fa-solid fa-gas-pump"></i>
                    <p>Nhiên liệu: <strong>{fuelType === 'electric' ? 'Điện' : fuelType === 'gasoline' ? 'Xăng' : fuelType}</strong></p>
                </div>
                <div className="feature-item">
                    <i className="fa-solid fa-gauge-high"></i>
                    <p>Tiêu hao: <strong>{fuelConsumption}l/100km</strong></p>
                </div>
                {/* Add more features as needed */}
            </div>
        </div>
    );
};

export default VehicleFeatures; 