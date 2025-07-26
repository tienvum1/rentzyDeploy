import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import './AdminVehicleDetailPage.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';
const adminApi = `${backendUrl}/api/admin`;

const AdminVehicleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [vehicle, setVehicle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [zoomImage, setZoomImage] = useState(null); // State for zoomed image

    useEffect(() => {
        const fetchDetail = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${adminApi}/vehicle-approvals/${id}`, { withCredentials: true });
                setVehicle(response.data.vehicle);
            } catch (err) {
                setError(err.response?.data?.message || 'Không thể tải chi tiết xe.');
            }
            setLoading(false);
        };
        if (id) fetchDetail();
    }, [id]);

    const handleImageClick = (imgUrl) => {
        setZoomImage(imgUrl);
    };
    const closeZoom = () => setZoomImage(null);

    if (loading) return <div className="admin-dashboard-content"><p>Đang tải chi tiết xe...</p></div>;
    if (error) return <div className="admin-dashboard-content"><p className="error-message">{error}</p></div>;
    if (!vehicle) return <div className="admin-dashboard-content"><p>Không tìm thấy xe.</p></div>;

    return (
        <div className="admin-dashboard-layout">
            <SidebarAdmin />
            <div className="admin-dashboard-content">
                <div className="vehicles-requests-inner-content">
                    <button className="btn-action btn-close" onClick={() => navigate(-1)}>Quay lại</button>
                    <h2>Chi tiết xe chờ duyệt</h2>
                    <div className="vehicle-detail-admin-new">
                        <div className="vehicle-detail-images-col">
                            {vehicle.primaryImage && (
                                <img src={vehicle.primaryImage} alt="Ảnh chính" className="vehicle-detail-main-img" onClick={() => handleImageClick(vehicle.primaryImage)} />
                            )}
                            {vehicle.gallery && vehicle.gallery.length > 0 && (
                                <div className="vehicle-detail-gallery">
                                    {vehicle.gallery.map((img, idx) => (
                                        <img key={idx} src={img} alt={`Ảnh phụ ${idx + 1}`} className="vehicle-detail-gallery-img" onClick={() => handleImageClick(img)} />
                                    ))}
                                </div>
                            )}
                            <div className="vehicle-info-group">
                                <div className="vehicle-info-group-title">Giấy tờ xe</div>
                                {vehicle.vehicleDocument ? (
                                    vehicle.vehicleDocument.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                        <img src={vehicle.vehicleDocument} alt="Giấy tờ xe" style={{maxWidth: 400, maxHeight: 280, border: '1.5px solid #bdbdbd', borderRadius: 8, marginTop: 6, cursor: 'zoom-in'}} onClick={() => handleImageClick(vehicle.vehicleDocument)} />
                                    ) : vehicle.vehicleDocument.match(/\.pdf$/i) ? (
                                        <a href={vehicle.vehicleDocument} target="_blank" rel="noopener noreferrer">Xem file PDF</a>
                                    ) : (
                                        <a href={vehicle.vehicleDocument} target="_blank" rel="noopener noreferrer">Xem</a>
                                    )
                                ) : 'Không có'}
                            </div>
                        </div>
                        <div className="vehicle-detail-info-col">
                            <div className="vehicle-info-group">
                                <div className="vehicle-info-group-title">Thông tin xe</div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Thương hiệu:</span><span className="vehicle-info-value">{vehicle.brand}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Model:</span><span className="vehicle-info-value">{vehicle.model}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Biển số:</span><span className="vehicle-info-value" style={{fontWeight:600, color:'#d32f2f'}}>{vehicle.licensePlate}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Địa điểm:</span><span className="vehicle-info-value">{vehicle.location}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Giá/ngày:</span><span className="vehicle-info-value">{vehicle.pricePerDay ? parseFloat(vehicle.pricePerDay).toLocaleString() + ' VNĐ' : 'N/A'}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Số chỗ:</span><span className="vehicle-info-value">{vehicle.seatCount}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Kiểu dáng:</span><span className="vehicle-info-value">{vehicle.bodyType}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Hộp số:</span><span className="vehicle-info-value">{vehicle.transmission}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Nhiên liệu:</span><span className="vehicle-info-value">{vehicle.fuelType}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Mức tiêu thụ:</span><span className="vehicle-info-value">{vehicle.fuelConsumption}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Tiện nghi:</span><span className="vehicle-info-value">{vehicle.features && Array.isArray(vehicle.features) ? vehicle.features.join(', ') : vehicle.features}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Mô tả:</span><span className="vehicle-info-value">{vehicle.description}</span></div>
                            </div>
                            <div className="vehicle-info-group">
                                <div className="vehicle-info-group-title">Chủ xe</div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Tên:</span><span className="vehicle-info-value">{vehicle.owner ? vehicle.owner.name : 'N/A'}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Email:</span><span className="vehicle-info-value">{vehicle.owner ? vehicle.owner.email : 'N/A'}</span></div>
                            </div>
                            <div className="vehicle-info-group">
                                <div className="vehicle-info-group-title">Trạng thái</div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Duyệt:</span><span className="vehicle-info-value" style={{fontWeight:600, color:'#1976d2'}}>{vehicle.approvalStatus}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Trạng thái xe:</span><span className="vehicle-info-value">{vehicle.status}</span></div>
                                <div className="vehicle-info-row"><span className="vehicle-info-label">Lượt thuê:</span><span className="vehicle-info-value">{vehicle.rentalCount || 0}</span></div>
                            </div>
                        </div>
                    </div>
                </div>
                {/* Zoomed image modal */}
                {zoomImage && (
                    <div className="zoom-modal-backdrop" onClick={closeZoom}>
                        <div className="zoom-modal-content" onClick={e => e.stopPropagation()}>
                            <img src={zoomImage} alt="Phóng to" className="zoom-modal-img" style={{maxWidth: '90vw', maxHeight: '90vh'}} />
                            <button className="btn-action btn-close" onClick={closeZoom} style={{marginTop: 16}}>Đóng</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminVehicleDetailPage; 