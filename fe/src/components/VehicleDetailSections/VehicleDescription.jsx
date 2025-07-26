import React from 'react';

const VehicleDescription = ({ description }) => {
    return (
        <div className="vehicle-detail-description">
            <h2>Mô tả</h2>
            <p>{description}</p>
        </div>
    );
};

export default VehicleDescription; 