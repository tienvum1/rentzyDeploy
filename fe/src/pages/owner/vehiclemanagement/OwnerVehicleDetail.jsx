import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OwnerVehicleDetail.css';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';

const OwnerVehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [modalImage, setModalImage] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backendUrl}/api/vehicles/${id}`);
        setVehicle(response.data.vehicle);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin xe.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVehicle();
  }, [id, backendUrl]);

  if (loading) return <div className="owner-vehicle-detail-loading">Đang tải...</div>;
  if (error) return <div className="owner-vehicle-detail-error">{error}</div>;
  if (!vehicle) return <div className="owner-vehicle-detail-notfound">Không tìm thấy xe.</div>;

  return (
    <div className="owner-vehicle-detail-layout">
      <div className="owner-vehicle-detail-main">
        <div className="sidebar-owner-wrap">
          <SidebarOwner />
        </div>
        <div className="owner-vehicle-detail-content">
          <h2>Chi tiết xe của bạn</h2>
          <div className="owner-vehicle-detail-card improved">
            <div className="owner-vehicle-detail-images">
              {vehicle.primaryImage && (
                <img
                  src={vehicle.primaryImage}
                  alt="Ảnh chính"
                  className="main-image clickable"
                  onClick={() => setModalImage(vehicle.primaryImage)}
                  title="Click để xem lớn"
                />
              )}
              {vehicle.gallery && vehicle.gallery.length > 0 && (
                <div className="gallery-images">
                  {vehicle.gallery.map((img, idx) => (
                    <img
                      key={idx}
                      src={img}
                      alt={`Ảnh phụ ${idx + 1}`}
                      className="gallery-image clickable"
                      onClick={() => setModalImage(img)}
                      title="Click để xem lớn"
                    />
                  ))}
                </div>
              )}
            </div>
            <div className="owner-vehicle-detail-info improved">
              <table className="vehicle-info-table">
                <tbody>
                  <tr><td>Thương hiệu:</td><td>{vehicle.brand}</td></tr>
                  <tr><td>Dòng xe:</td><td>{vehicle.model}</td></tr>
                  <tr><td>Biển số:</td><td>{vehicle.licensePlate}</td></tr>
                  <tr><td>Địa điểm:</td><td>{vehicle.location}</td></tr>
                  <tr><td>Giá thuê/ngày:</td><td>{vehicle.pricePerDay?.toLocaleString()} VND</td></tr>
                  <tr><td>Số chỗ:</td><td>{vehicle.seatCount}</td></tr>
                  <tr><td>Thân xe:</td><td>{vehicle.bodyType}</td></tr>
                  <tr><td>Hộp số:</td><td>{vehicle.transmission}</td></tr>
                  <tr><td>Nhiên liệu:</td><td>{vehicle.fuelType}</td></tr>
                  <tr><td>Tiêu hao nhiên liệu:</td><td>{vehicle.fuelConsumption}</td></tr>
                  <tr><td>Trạng thái xe:</td><td>{vehicle.status}</td></tr>
                  <tr><td>Trạng thái duyệt:</td><td>{vehicle.approvalStatus}</td></tr>
                  <tr><td>Tính năng:</td><td>{vehicle.features && vehicle.features.length > 0 ? vehicle.features.join(', ') : 'Không có'}</td></tr>
                  <tr>
                    <td>Giấy tờ xe:</td>
                    <td>
                      {vehicle.vehicleDocument ? (
                        vehicle.vehicleDocument.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={vehicle.vehicleDocument}
                            alt="Giấy tờ xe"
                            className="vehicle-document-img clickable"
                            style={{maxWidth: 220, maxHeight: 160, border: '1.5px solid #bdbdbd', borderRadius: 8, marginTop: 6, cursor: 'zoom-in'}}
                            onClick={() => setModalImage(vehicle.vehicleDocument)}
                            title="Click để xem lớn"
                          />
                        ) : vehicle.vehicleDocument.match(/\.pdf$/i) ? (
                          <a href={vehicle.vehicleDocument} target="_blank" rel="noopener noreferrer">Xem file PDF</a>
                        ) : (
                          <a href={vehicle.vehicleDocument} target="_blank" rel="noopener noreferrer">Xem</a>
                        )
                      ) : 'Không có'}
                    </td>
                  </tr>
                  <tr><td>Mô tả:</td><td>{vehicle.description}</td></tr>
                  <tr><td>Lượt thuê:</td><td>{vehicle.rentalCount || 0}</td></tr>
                </tbody>
              </table>
            </div>
          </div>
          <button className="btn-back" onClick={() => navigate(-1)}>Quay lại</button>
        </div>
      </div>
      {modalImage && (
        <div className="image-modal" onClick={() => setModalImage(null)}>
          <img src={modalImage} alt="Xem lớn" className="modal-img" style={{maxWidth: '90vw', maxHeight: '90vh'}} />
        </div>
      )}
    </div>
  );
};

export default OwnerVehicleDetail; 