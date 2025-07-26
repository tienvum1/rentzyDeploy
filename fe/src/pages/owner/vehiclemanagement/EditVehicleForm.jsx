import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OwnerVehicleDetail.css';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const bodyTypeOptions = [
  'Sedan', 'SUV', 'Hatchback', 'Coupe', 'Mui trần', 'Xe wagon', 'Xe van', 'Bán tải'
];
const transmissionOptions = ['Tự động', 'Số sàn'];
const fuelTypeOptions = ['Xăng', 'Dầu', 'Điện', 'Hybrid'];
const availableFeatures = [
  'Bản đồ', 'Bluetooth', 'Camera 360', 'Camera cập lề', 'Camera hành trình', 'Camera lùi',
  'Cảm biến lốp', 'Cảm biến va chạm', 'Cảnh báo tốc độ', 'Cửa sổ trời', 'Định vị GPS',
  'Ghế trẻ em', 'Khe cắm USB', 'Lốp dự phòng', 'Màn hình DVD', 'Nắp thùng xe bán tải', 'ETC', 'Túi khí an toàn'
];

const EditVehicleForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';
  const [vehicle, setVehicle] = useState(null);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [galleryPreviews, setGalleryPreviews] = useState([]);
  const [modalImage, setModalImage] = useState(null);
  const [saving, setSaving] = useState(false);
  const galleryInputRef = useRef(null);
  // Thêm state cho preview giấy tờ xe
  const [vehicleDocumentPreview, setVehicleDocumentPreview] = useState(null);

  useEffect(() => {
    const fetchVehicle = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(`${backendUrl}/api/vehicles/${id}`);
        setVehicle(response.data.vehicle);
        setFormData({
          ...response.data.vehicle,
          main_image: null, // file mới
          gallery: [],      // file mới
          vehicleDocumentFile: null, // file mới
        });
        setMainImagePreview(response.data.vehicle.primaryImage);
        setGalleryPreviews(response.data.vehicle.gallery || []);
        setVehicleDocumentPreview(response.data.vehicle.vehicleDocument || null);
      } catch (err) {
        setError(err.response?.data?.message || 'Không thể tải thông tin xe.');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchVehicle();
  }, [id, backendUrl]);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (name === 'main_image') {
      const file = files[0] || null;
      setFormData((prev) => ({ ...prev, main_image: file }));
      setMainImagePreview(file ? URL.createObjectURL(file) : vehicle.primaryImage);
    } else if (name === 'gallery') {
      const newFiles = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        gallery: [...(prev.gallery || []), ...newFiles],
      }));
      setGalleryPreviews((prev) => [
        ...prev,
        ...newFiles.map((file) => URL.createObjectURL(file)),
      ]);
    } else if (name === 'vehicleDocument') {
      const file = files[0] || null;
      setFormData((prev) => ({ ...prev, vehicleDocumentFile: file }));
      setVehicleDocumentPreview(file ? URL.createObjectURL(file) : (vehicle.vehicleDocument || null));
    } else if (type === 'checkbox') {
      setFormData((prev) => {
        const features = prev.features || [];
        return {
          ...prev,
          features: features.includes(value)
            ? features.filter((f) => f !== value)
            : [...features, value],
        };
      });
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Xóa ảnh phụ khỏi preview và formData (chỉ xóa ảnh mới thêm, không xóa ảnh cũ đã có trên server)
  const handleRemoveGalleryImage = (idx) => {
    setGalleryPreviews((prev) => prev.filter((_, i) => i !== idx));
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== idx),
    }));
  };

  // Validate form
  const validateForm = () => {
    if (!formData.brand || !formData.model || !formData.licensePlate || !formData.location || !formData.pricePerDay || !formData.seatCount || !formData.bodyType || !formData.transmission || !formData.fuelType || !formData.description) {
      setMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ thông tin bắt buộc.' });
      return false;
    }
    return true;
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setSaving(true);
    setMessage(null);
    const dataToSubmit = new FormData();
    dataToSubmit.append('brand', formData.brand);
    dataToSubmit.append('model', formData.model);
    dataToSubmit.append('licensePlate', formData.licensePlate);
    dataToSubmit.append('location', formData.location);
    dataToSubmit.append('pricePerDay', formData.pricePerDay);
    dataToSubmit.append('seatCount', formData.seatCount);
    dataToSubmit.append('bodyType', formData.bodyType);
    dataToSubmit.append('transmission', formData.transmission);
    dataToSubmit.append('fuelType', formData.fuelType);
    dataToSubmit.append('fuelConsumption', formData.fuelConsumption || '');
    dataToSubmit.append('description', formData.description);

    // Ảnh chính (nếu có chọn mới)
    if (formData.main_image) dataToSubmit.append('main_image', formData.main_image);

    // Ảnh phụ (nếu có chọn mới)
    if (formData.gallery && formData.gallery.length > 0) {
      formData.gallery.forEach((file) => dataToSubmit.append('additional_images', file));
    }

    // Tính năng
    if (formData.features && formData.features.length > 0) {
      formData.features.forEach((f) => dataToSubmit.append('features', f));
    }

    // Nếu user xóa hết ảnh phụ, gửi thêm flag
    if ((formData.gallery && formData.gallery.length === 0) && galleryPreviews.length === 0) {
      dataToSubmit.append('clear_gallery', 'true');
    }

    // Giấy tờ xe (nếu có chọn mới)
    if (formData.vehicleDocumentFile) {
      dataToSubmit.append('vehicleDocument', formData.vehicleDocumentFile);
    }

    try {
      // Nếu backend đã đổi endpoint PUT, sửa lại ở đây
      const response = await axios.put(`${backendUrl}/api/vehicles/${id}`, dataToSubmit, { withCredentials: true });
      toast.success(response.data.message || 'Cập nhật xe thành công!');
      setTimeout(() => navigate(-1), 1500);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Có lỗi khi cập nhật xe.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="owner-vehicle-detail-loading">Đang tải...</div>;
  if (error) return <div className="owner-vehicle-detail-error">{error}</div>;
  if (!formData) return null;

  return (
    <div className="owner-vehicle-detail-layout">
      <div className="owner-vehicle-detail-main">
        <div className="sidebar-owner-wrap">
          <SidebarOwner />
        </div>
        <div className="owner-vehicle-detail-content">
          <h2>Chỉnh sửa thông tin xe</h2>
          <form className="owner-vehicle-detail-card improved" onSubmit={handleSubmit}>
            <div className="owner-vehicle-detail-images">
              <label className="main-image-label">Ảnh chính:
                <input type="file" name="main_image" accept="image/*" onChange={handleChange} style={{ display: 'none' }} id="mainImageInput" />
                <img
                  src={mainImagePreview}
                  alt="Ảnh chính"
                  className="main-image clickable"
                  onClick={() => document.getElementById('mainImageInput').click()}
                  title="Click để đổi/chọn lại ảnh chính"
                />
              </label>
              <label className="gallery-label">Ảnh phụ:
                <button type="button" className="btn-add-images" onClick={() => galleryInputRef.current.click()}>Thêm ảnh phụ</button>
                <input type="file" name="gallery" accept="image/*" multiple ref={galleryInputRef} onChange={handleChange} style={{ display: 'none' }} />
                <div className="gallery-images">
                  {galleryPreviews.map((img, idx) => (
                    <div key={idx} className="image-wrapper">
                      <img
                        src={img}
                        alt={`Ảnh phụ ${idx + 1}`}
                        className="gallery-image clickable"
                        onClick={() => setModalImage(img)}
                        title="Click để xem lớn"
                      />
                      <button type="button" className="btn-remove-image" onClick={() => handleRemoveGalleryImage(idx)}>×</button>
                    </div>
                  ))}
                </div>
              </label>
            </div>
            <div className="owner-vehicle-detail-info improved">
              <table className="vehicle-info-table">
                <tbody>
                  <tr><td>Thương hiệu <span style={{color:'#d32f2f'}}>*</span>:</td><td><input type="text" name="brand" value={formData.brand} onChange={handleChange} placeholder="VD: Toyota, Kia..." /></td></tr>
                  <tr><td>Dòng xe <span style={{color:'#d32f2f'}}>*</span>:</td><td><input type="text" name="model" value={formData.model} onChange={handleChange} placeholder="VD: Vios, Morning..." /></td></tr>
                  <tr><td>Biển số <span style={{color:'#d32f2f'}}>*</span>:</td><td><input type="text" name="licensePlate" value={formData.licensePlate} onChange={handleChange} placeholder="VD: 30A-123.45" /></td></tr>
                  <tr><td>Địa điểm <span style={{color:'#d32f2f'}}>*</span>:</td><td><input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="VD: Hà Nội, TP.HCM..." /></td></tr>
                  <tr><td>Giá thuê/ngày <span style={{color:'#d32f2f'}}>*</span>:</td><td><input type="number" name="pricePerDay" value={formData.pricePerDay} onChange={handleChange} placeholder="Nhập giá VNĐ" /></td></tr>
                  <tr><td>Số chỗ <span style={{color:'#d32f2f'}}>*</span>:</td><td><input type="number" name="seatCount" value={formData.seatCount} onChange={handleChange} placeholder="VD: 5, 7..." /></td></tr>
                  <tr><td>Kiểu dáng <span style={{color:'#d32f2f'}}>*</span>:</td><td><select name="bodyType" value={formData.bodyType} onChange={handleChange}>
                    <option value="">Chọn kiểu dáng</option>
                    {bodyTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select></td></tr>
                  <tr><td>Hộp số <span style={{color:'#d32f2f'}}>*</span>:</td><td><select name="transmission" value={formData.transmission} onChange={handleChange}>
                    <option value="">Chọn hộp số</option>
                    {transmissionOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select></td></tr>
                  <tr><td>Nhiên liệu <span style={{color:'#d32f2f'}}>*</span>:</td><td><select name="fuelType" value={formData.fuelType} onChange={handleChange}>
                    <option value="">Chọn loại nhiên liệu</option>
                    {fuelTypeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select></td></tr>
                  <tr><td>Mức tiêu thụ nhiên liệu:</td><td><input type="text" name="fuelConsumption" value={formData.fuelConsumption || ''} onChange={handleChange} placeholder="VD: 7L/100km" /></td></tr>
                  <tr><td>Tiện nghi:</td><td>
                    <div className="features-grid">
                      {availableFeatures.map((feature) => (
                        <label key={feature} className="feature-checkbox">
                          <input
                            type="checkbox"
                            name="features"
                            value={feature}
                            checked={formData.features && formData.features.includes(feature)}
                            onChange={handleChange}
                          /> {feature}
                        </label>
                      ))}
                    </div>
                  </td></tr>
                  <tr><td>Mô tả <span style={{color:'#d32f2f'}}>*</span>:</td><td><textarea name="description" value={formData.description} onChange={handleChange} rows="4" placeholder="Mô tả chi tiết về xe, tình trạng, lưu ý..." /></td></tr>
                  <tr>
                    <td>Giấy tờ xe:</td>
                    <td>
                      <input type="file" name="vehicleDocument" accept="image/*,application/pdf" onChange={handleChange} />
                      {vehicleDocumentPreview && (
                        vehicleDocumentPreview.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                          <img
                            src={vehicleDocumentPreview}
                            alt="Giấy tờ xe"
                            className="vehicle-document-img clickable"
                            style={{maxWidth: 220, maxHeight: 160, border: '1.5px solid #bdbdbd', borderRadius: 8, marginTop: 6, cursor: 'zoom-in'}}
                            onClick={() => setModalImage(vehicleDocumentPreview)}
                            title="Click để xem lớn"
                          />
                        ) : vehicleDocumentPreview.match(/\.pdf$/i) ? (
                          <a href={vehicleDocumentPreview} target="_blank" rel="noopener noreferrer">Xem file PDF</a>
                        ) : (
                          <a href={vehicleDocumentPreview} target="_blank" rel="noopener noreferrer">Xem</a>
                        )
                      )}
                    </td>
                  </tr>
                </tbody>
              </table>
              {message && <div className={`form-message ${message.type}`}>{message.text}</div>}
              <div className="form-actions equal-buttons">
                <button type="submit" className="btn-submit" disabled={saving}>{saving ? 'Đang lưu...' : 'Lưu thay đổi'}</button>
                <button type="button" className="btn-cancel" onClick={() => navigate(-1)}>Hủy</button>
              </div>
            </div>
          </form>
          {modalImage && (
            <div className="image-modal" onClick={() => setModalImage(null)}>
              <img src={modalImage} alt="Xem lớn" className="modal-img" style={{maxWidth: '90vw', maxHeight: '90vh'}} />
            </div>
          )}
        </div>
      </div>
      <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
    </div>
  );
};

export default EditVehicleForm; 