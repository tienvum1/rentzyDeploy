import React from 'react';

const VehicleImageGallery = ({ primaryImage, gallery, selectedImage, setSelectedImage, brand, model }) => {
    return (
        <div className="vehicle-detail-image-section">
            {/* Main Image Display */}
            <div className="vehicle-detail-main-image-container">
                <img 
                    src={selectedImage} 
                    alt={`${brand} ${model}`} 
                    className="vehicle-detail-main-image"
                />
            </div>

            {/* Gallery Thumbnails */}
            <div className="vehicle-detail-gallery">
                {primaryImage && (
                    <img 
                        src={primaryImage} 
                        alt="Primary Thumbnail" 
                        className={`vehicle-detail-thumbnail ${selectedImage === primaryImage ? 'selected' : ''}`}
                        onClick={() => setSelectedImage(primaryImage)}
                    />
                )}
                {gallery && gallery.map((img, index) => (
                    <img 
                        key={index} 
                        src={img} 
                        alt={`Gallery Image ${index + 1}`} 
                        className={`vehicle-detail-thumbnail ${selectedImage === img ? 'selected' : ''}`}
                        onClick={() => setSelectedImage(img)}
                    />
                ))}
            </div>
        </div>
    );
};

export default VehicleImageGallery; 