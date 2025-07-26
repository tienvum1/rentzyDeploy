import React from 'react';

const VehicleHeader = ({  model,  location }) => {
    return (
        <div className="vehicle-detail-header">
            <h1> {model}</h1> <br/>
            <div className="vehicle-detail-location-share">
                <p className="location"><i className="fa-solid fa-location-dot"></i> {location}</p>
              
            </div>
        </div>
    );
};

export default VehicleHeader; 