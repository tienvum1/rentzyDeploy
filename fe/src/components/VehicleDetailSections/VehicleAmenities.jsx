import React from 'react';

const VehicleAmenities = ({ features }) => {
    // A mapping from amenity name to its icon
    const amenityIconMap = {
        'Bản đồ': 'fa-solid fa-map',
        'Bluetooth': 'fa-brands fa-bluetooth-b',
        'Camera 360': 'fa-solid fa-camera',
        'Cảm biến va chạm': 'fa-solid fa-sensor-on',
        'Camera hành trình': 'fa-solid fa-car-rear',
        'Camera Lùi': 'fa-solid fa-camera-retro',
        'Định vị GPS': 'fa-solid fa-location-crosshairs',
        'Khe cắm USB': 'fa-solid fa-usb',
        'Cảnh báo tốc độ': 'fa-solid fa-triangle-exclamation',
        'Cửa sổ trời': 'fa-solid fa-cloud-sun',
        'ETC': 'fa-solid fa-road',
        'Lốp dự phòng': 'fa-solid fa-tire',
        'Màn hình DVD': 'fa-solid fa-tv',
        'Túi khí an toàn': 'fa-solid fa-shield-halved',
        'Camera cập lề': 'fa-solid fa-video', // Example icon for new feature
        'Cảm biến lốp': 'fa-solid fa-tire-pressure-gauge', // Example icon for new feature
        // Add more mappings as needed
    };

    // Default icon for features not found in the map
    const defaultIcon = 'fa-solid fa-circle-question'; 

    return (
        <div className="vehicle-detail-amenities">
            <h2>Các tiện nghi khác</h2>
            <div className="amenities-grid">
                {features && features.map((feature, index) => (
                    <div className="amenity-item" key={index}>
                        <i className={amenityIconMap[feature] || defaultIcon}></i>
                        <p>{feature}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default VehicleAmenities; 