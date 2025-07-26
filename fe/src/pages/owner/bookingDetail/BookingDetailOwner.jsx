import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import moment from 'moment';
import 'moment/locale/vi';
import { FaArrowLeft, FaTruck, FaHandshake, FaCar, FaCheck, FaCamera, FaTimes, FaUser, FaMoneyBillWave } from 'react-icons/fa';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';
import styles from './BookingDetailOwner.module.css';
import { useAuth } from '../../../context/AuthContext';

moment.locale('vi');

function ImageUploaderCard({ title, images, setImages, savedImages, setSavedImages, disabled, onSave, max = 5, canEdit }) {
  const fileInputRef = useRef();
  const isUploaded = savedImages && savedImages.length === max;
  const allowEdit = canEdit && !disabled && !isUploaded;

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > max) {
      toast.error(`Chỉ được tải lên tối đa ${max} ảnh.`);
      return;
    }
    const newImages = files.map(file => ({ file, preview: URL.createObjectURL(file) }));
    setImages(prev => [...prev, ...newImages]);
  };
  const removeImage = (idx) => {
    setImages(prev => {
      const newArr = [...prev];
      if (newArr[idx].preview) URL.revokeObjectURL(newArr[idx].preview);
      newArr.splice(idx, 1);
      return newArr;
    });
  };
  const handleSave = () => {
    if (images.length !== max) {
      toast.error(`Bạn phải chọn đủ ${max} ảnh để lưu!`);
      return;
    }
    setSavedImages(images);
    if (onSave) onSave(images);
    toast.success('Đã lưu ảnh!');
  };

  return (
    <div className={styles.card} style={{marginBottom: 24}}>
      <div className={styles.cardTitle}><FaCamera /> {title}</div>
      {!isUploaded && (
        <div style={{color: '#e67e22', fontWeight: 500, marginBottom: 10}}>Bạn chỉ được upload ảnh 1 lần. Sau khi lưu sẽ không thể chỉnh sửa ảnh nữa.</div>
      )}
      <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 12}}>
        {(isUploaded ? savedImages : images).map((img, idx) => (
          <div key={idx} style={{ position: 'relative' }}>
            <img src={img.preview || img.url || img} alt={`Ảnh xe ${idx + 1}`} style={{width: 120, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #e3e8ef'}} />
            {allowEdit && (
              <button onClick={() => removeImage(idx)} style={{ position: 'absolute', top: 2, right: 2, background: '#fff', border: 'none', borderRadius: '50%', width: 22, height: 22, cursor: 'pointer', boxShadow: '0 1px 4px #e3e8ef', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FaTimes style={{color: '#f76c6c', fontSize: 14}} /></button>
            )}
          </div>
        ))}
      </div>
      {allowEdit && (
        <>
          {images.length < max && (
            <button onClick={() => fileInputRef.current.click()} style={{background: '#e3e8ef', color: '#2b7a78', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, cursor: 'pointer', fontSize: 15}}><FaCamera style={{marginRight: 6}} />Tải ảnh xe</button>
          )}
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{display: 'none'}} onChange={handleImageUpload} disabled={disabled} />
          <div style={{color: '#64748b', marginTop: 6, fontSize: 13}}>Bắt buộc đủ {max} ảnh. Ảnh sẽ được lưu khi bấm "Lưu ảnh".</div>
          <div style={{display: 'flex', gap: 18, marginTop: 18}}>
            <button onClick={handleSave} style={{background: '#3182ce', color: '#fff', fontWeight: 600, fontSize: 17, border: 'none', borderRadius: 10, padding: '12px 28px', boxShadow: '0 2px 8px #e3e8ef', cursor: images.length === max ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 10}} disabled={images.length !== max || disabled}><FaCheck style={{fontSize: 18}} />Lưu ảnh</button>
          </div>
        </>
      )}
      {isUploaded && savedImages && savedImages.length > 0 && (
        <div style={{color: '#64748b', marginBottom: 8}}>Ảnh đã upload:</div>
      )}
    </div>
  );
}

const BookingDetailOwner = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [preDeliveryImages, setPreDeliveryImages] = useState([]);
  const [savedPreDeliveryImages, setSavedPreDeliveryImages] = useState([]);
  const [postDeliveryImages, setPostDeliveryImages] = useState([]);
  const [savedPostDeliveryImages, setSavedPostDeliveryImages] = useState([]);
  const { user } = useAuth();
  const [uploadingPre, setUploadingPre] = useState(false);
  const [uploadingPost, setUploadingPost] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => { fetchBookingDetails(); }, [id]);

  const fetchBookingDetails = async () => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/getBookingById/${id}`,
        { withCredentials: true }
      );
      if (response.data.success) {
        setBooking(response.data.booking);
        if (response.data.booking.preRentalImages && response.data.booking.preRentalImages.length === 5) {
          setSavedPreDeliveryImages(response.data.booking.preRentalImages);
        }
        if (response.data.booking.postRentalImages && response.data.booking.postRentalImages.length === 5) {
          setSavedPostDeliveryImages(response.data.booking.postRentalImages);
        }
        setError(null);
      } else {
        setError(response.data.message || 'Không thể tải thông tin đơn đặt xe');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin đơn đặt xe');
      if (err.response?.status === 401 || err.response?.status === 403) {
        toast.error('Vui lòng đăng nhập để xem chi tiết đơn đặt xe.');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUploadPreDeliveryImages = async (images) => {
    if (!images || images.length === 0) {
      toast.error('Vui lòng chọn ít nhất một ảnh để lưu!');
      return;
    }
    setUploadingPre(true);
    try {
      const formData = new FormData();
      images.forEach(img => formData.append('images', img.file));
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/${booking._id}/upload-pre-delivery-images`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success && res.data.urls) {
        setSavedPreDeliveryImages(res.data.urls);
        toast.success('Đã upload ảnh xe thành công!');
      } else {
        toast.error(res.data.message || 'Lưu ảnh thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi upload ảnh.');
    } finally {
      setUploadingPre(false);
    }
  };

  const handleUploadPostDeliveryImages = async (images) => {
    if (!images || images.length !== 5) {
      toast.error('Bạn phải upload đủ 5 ảnh xe khi nhận lại!');
      return false;
    }
    setUploadingPost(true);
    try {
      const formData = new FormData();
      images.forEach(img => formData.append('images', img.file));
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/${booking._id}/upload-post-delivery-images`,
        formData,
        { withCredentials: true, headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (res.data.success && res.data.urls) {
        setSavedPostDeliveryImages(res.data.urls);
        fetchBookingDetails();
        toast.success('Đã upload ảnh nhận lại xe thành công!');
        return true;
      } else {
        toast.error(res.data.message || 'Lưu ảnh thất bại.');
        return false;
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi upload ảnh.');
      return false;
    } finally {
      setUploadingPost(false);
    }
  };

  const handleConfirmHandover = async () => {
    if (!(booking.preRentalImages && booking.preRentalImages.length === 5)) {
      toast.error('Bạn phải upload đủ 5 ảnh xe trước khi giao!');
      return;
    }
    setIsUploading(true);
    try {
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/${booking._id}/confirm-handover`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success('Bạn đã xác nhận giao xe!');
        setPreDeliveryImages([]);
        setSavedPreDeliveryImages([]);
        fetchBookingDetails();
      } else {
        toast.error(res.data.message || 'Xác nhận thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xác nhận giao xe.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmReturn = async () => {
    if (!savedPostDeliveryImages || savedPostDeliveryImages.length !== 5) {
      toast.error('Bạn phải upload đủ 5 ảnh xe khi nhận lại trước khi xác nhận!');
      return;
    }
    setIsUploading(true);
    try {
      if (postDeliveryImages.length === 5 && (!savedPostDeliveryImages || savedPostDeliveryImages.length !== 5)) {
        const ok = await handleUploadPostDeliveryImages(postDeliveryImages);
        if (!ok) {
          setIsUploading(false);
          return;
        }
      }
      const res = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/bookings/${booking._id}/confirm-return`,
        {},
        { withCredentials: true }
      );
      if (res.data.success) {
        toast.success('Bạn đã xác nhận nhận lại xe!');
        fetchBookingDetails();
      } else {
        toast.error(res.data.message || 'Xác nhận thất bại.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi khi xác nhận nhận lại xe.');
    } finally {
      setIsUploading(false);
    }
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', minimumFractionDigits: 0 }).format(amount);
  const formatDateTime = (date) => moment.utc(date).local().format('DD/MM/YYYY HH:mm');
  const getStatusText = (status) => {
    switch (status) {
      case 'PENDING': return 'Đang chờ xử lý';
      case 'CONFIRMED': return 'Đã xác nhận';
      case 'DEPOSIT_PAID': return 'Đã thanh toán tiền giữ chỗ';
      case 'RENTAL_PAID': return 'Đã thanh toán đầy đủ';
      case 'IN_PROGRESS': return 'Đang sử dụng';
      case 'COMPLETED': return 'Đã hoàn thành';
      case 'CANCELED': return 'Đã hủy';
      case 'REJECTED': return 'Đã từ chối';
      case 'EXPIRED': return 'Đã hết hạn';
      default: return status;
    }
  };
  const getStatusClass = (status) => {
    switch (status) {
      case 'COMPLETED': return styles.statusBadge + ' ' + styles.completed;
      case 'CANCELED': return styles.statusBadge + ' ' + styles.canceled;
      case 'IN_PROGRESS': return styles.statusBadge + ' ' + styles.in_progress;
      case 'RENTAL_PAID': return styles.statusBadge + ' ' + styles.rental_paid;
      case 'PENDING': return styles.statusBadge + ' ' + styles.pending;
      default: return styles.statusBadge;
    }
  };

  if (loading) return <div className={styles.container}>Đang tải thông tin...</div>;
  if (error) return <div className={styles.container}><div className={styles.card}>{error}</div></div>;
  if (!booking) return <div className={styles.container}><div className={styles.card}>Không tìm thấy thông tin đơn đặt xe</div></div>;

  return (
    <>
      <div className={styles.container}>
        <SidebarOwner />
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            <button className={styles.backBtn} onClick={() => navigate('/ownerpage/booking-management')}>
              <FaArrowLeft /> Quay lại
            </button>
            <span className={styles.bookingId}>#{booking._id.slice(-6)}</span>
          </div>
          <div className={styles.headerCenter}>
            <div className={styles.title}>Chi tiết đơn thuê</div>
            <div className={styles.dates}>
              <span> Tạo: {formatDateTime(booking.createdAt)}</span>
              <span> Cập nhật: {formatDateTime(booking.updatedAt)}</span>
            </div>
          </div>
          <div className={styles.headerRight}>
            <span className={getStatusClass(booking.status)}>{getStatusText(booking.status)}</span>
            {user && booking.vehicle?.owner === user._id && (
              <div style={{marginTop: 18, display: 'flex', gap: 18}}>
                {!booking.ownerHandoverConfirmed && booking.status && booking.status.toLowerCase() === 'fully_paid' && (
                  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6}}>
                    <button
                      onClick={handleConfirmHandover}
                      style={{ background: '#2b7a78', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', borderRadius: 10, padding: '14px 32px', boxShadow: '0 2px 8px #e3e8ef', cursor: (!!booking.renterSignature && !!booking.ownerSignature && !isUploading) ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: 10 }}
                      disabled={isUploading || !booking.renterSignature || !booking.ownerSignature}
                    >
                      <FaTruck style={{fontSize: 20}} />
                      {isUploading ? 'Đang xử lý...' : 'Đã giao xe'}
                    </button>
                    {(!booking.renterSignature || !booking.ownerSignature) && (
                      <div style={{color: '#e67e22', fontSize: 14, marginTop: 2, fontWeight: 500}}>
                        Cần chữ ký của cả chủ xe và người thuê để giao xe.
                      </div>
                    )}
                  </div>
                )}
                {booking.ownerHandoverConfirmed && !booking.ownerReturnConfirmed && (
                  <button
                    onClick={handleConfirmReturn}
                    style={{ background: '#f76c6c', color: '#fff', fontWeight: 600, fontSize: 18, border: 'none', borderRadius: 10, padding: '14px 32px', boxShadow: '0 2px 8px #e3e8ef', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}
                    disabled={booking.ownerReturnConfirmed}
                  >
                    <FaHandshake style={{fontSize: 20}} />
                    {booking.ownerReturnConfirmed ? 'Đã nhận lại xe' : 'Đã nhận lại xe'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        {user && booking.vehicle?.owner === user._id && (!booking.preRentalImages || booking.preRentalImages.length < 5) && !booking.ownerHandoverConfirmed && booking.status !== 'canceled' && (
          <ImageUploaderCard
            title="Ảnh xe trước khi giao"
            images={preDeliveryImages}
            setImages={setPreDeliveryImages}
            savedImages={savedPreDeliveryImages}
            setSavedImages={setSavedPreDeliveryImages}
            disabled={booking.renterHandoverConfirmed}
            onSave={handleUploadPreDeliveryImages}
            canEdit={!booking.renterHandoverConfirmed}
            max={5}
          />
        )}
        {booking.preRentalImages && booking.preRentalImages.length === 5 && booking.status !== 'canceled' && (
          <div className={styles.card} style={{marginBottom: 24}}>
            <div className={styles.cardTitle}><FaCamera /> Ảnh xe trước khi giao (đã upload)</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12}}>
              {booking.preRentalImages.map((url, idx) => (
                <img key={idx} src={url} alt={`Ảnh xe ${idx + 1}`} style={{width: 120, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #e3e8ef'}} />
              ))}
            </div>
          </div>
        )}
        {user && booking.vehicle?.owner === user._id && booking.ownerHandoverConfirmed && booking.renterHandoverConfirmed && !booking.ownerReturnConfirmed && (!booking.postRentalImages || booking.postRentalImages.length < 5) && (
          <ImageUploaderCard
            title="Ảnh xe khi nhận lại"
            images={postDeliveryImages}
            setImages={setPostDeliveryImages}
            savedImages={savedPostDeliveryImages}
            setSavedImages={setSavedPostDeliveryImages}
            disabled={uploadingPost || (savedPostDeliveryImages && savedPostDeliveryImages.length === 5)}
            onSave={handleUploadPostDeliveryImages}
            canEdit={!uploadingPost && (!savedPostDeliveryImages || savedPostDeliveryImages.length < 5)}
            max={5}
          />
        )}
        {booking.postRentalImages && booking.postRentalImages.length === 5 && (
          <div className={styles.card} style={{marginBottom: 24}}>
            <div className={styles.cardTitle}><FaCamera /> Ảnh xe khi nhận lại (đã upload)</div>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 12}}>
              {booking.postRentalImages.map((url, idx) => (
                <img key={idx} src={url} alt={`Ảnh xe nhận lại ${idx + 1}`} style={{width: 120, height: 80, objectFit: 'cover', borderRadius: 8, boxShadow: '0 2px 8px #e3e8ef'}} />
              ))}
            </div>
          </div>
        )}
        {booking.status && booking.status.toLowerCase() === 'completed' && (
          <div style={{margin: '24px 0', textAlign: 'center'}}>
            <button style={{background: '#38b000', color: '#fff', fontWeight: 700, fontSize: 20, border: 'none', borderRadius: 12, padding: '16px 48px', boxShadow: '0 2px 8px #e3e8ef', cursor: 'default'}} disabled>
            Đã hoàn thành đơn thuê
            </button>
          </div>
        )}
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}><FaCar /> Thông tin xe</div>
            {booking.vehicle?.primaryImage && (
              <img src={booking.vehicle.primaryImage} alt="Ảnh xe" className={styles.vehicleImg} />
            )}
            <div className={styles.infoRow}><span className={styles.infoLabel}>Tên xe:</span><span className={styles.infoValue}>{booking.vehicle?.brand} {booking.vehicle?.model}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Biển số:</span><span className={styles.infoValue}>{booking.vehicle?.licensePlate}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Năm:</span><span className={styles.infoValue}>{booking.vehicle?.year || 'N/A'}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Nhận xe:</span><span className={styles.infoValue}>{moment(booking.startDate).format('HH:mm DD/MM/YYYY')}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Địa chỉ nhận xe:</span><span className={styles.infoValue}>{booking.pickupLocation || '—'}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Trả xe:</span><span className={styles.infoValue}>{moment(booking.endDate).format('HH:mm DD/MM/YYYY')}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Địa chỉ trả xe:</span><span className={styles.infoValue}>{booking.returnLocation || '—'}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Số ngày thuê:</span><span className={styles.infoValue}>{booking.totalDays}</span></div>
            {booking.note && <div className={styles.infoRow}><span className={styles.infoLabel}>Ghi chú:</span><span className={styles.infoValue}>{booking.note}</span></div>}
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}><FaUser /> Người thuê</div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Họ tên:</span><span className={styles.infoValue}>{booking.renter?.name}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Email:</span><span className={styles.infoValue}>{booking.renter?.email}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>SĐT:</span><span className={styles.infoValue}>{booking.renter?.phone}</span></div>
            <div className={styles.section} style={{marginTop: 12}}>
            <div className={styles.cardTitle}> THông tin giấy phép lái xe</div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>Họ tên trên GPLX: </span><span className={styles.infoValue}>{booking.renter?.driver_license_full_name}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>Số GPLX:</span><span className={styles.infoValue}>{booking.renter?.driver_license_number}</span></div>
              <div className={styles.infoRow}><span className={styles.infoLabel}>Ngày sinh:</span><span className={styles.infoValue}>{booking.renter?.driver_license_birth_date ? moment(booking.renter.driver_license_birth_date).format('DD/MM/YYYY') : ''}</span></div>
              {booking.renter?.driver_license_image && (
                <div style={{margin: '10px 0'}}>
                  <img src={booking.renter.driver_license_image} alt="Ảnh GPLX" style={{width: 180, borderRadius: 10, boxShadow: '0 2px 8px #e3e8ef'}} />
                </div>
              )}
            </div>
          </div>
        </div>
        <div className={styles.grid}>
          <div className={styles.card}>
            <div className={styles.cardTitle}><FaMoneyBillWave /> Thanh toán</div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Tổng tiền:</span><span className={styles.infoValue}>{formatCurrency(booking.totalAmount)}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Tiền thuê xe:</span><span className={styles.infoValue}>{formatCurrency(booking.totalCost)}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Phí giao xe:</span><span className={styles.infoValue}>{formatCurrency(booking.deliveryFee)}</span></div>
            <div className={styles.infoRow}><span className={styles.infoLabel}>Giảm giá:</span><span className={styles.infoValue}>{formatCurrency(booking.discountAmount)}</span></div>
            {booking.promoCode && <div className={styles.infoRow}><span className={styles.infoLabel}>Mã KM:</span><span className={styles.infoValue}>{booking.promoCode}</span></div>}
          </div>
          <div className={styles.card}>
            <div className={styles.cardTitle}><FaMoneyBillWave /> Lịch sử giao dịch</div>
            <table className={styles.paymentTable}>
              <thead>
                <tr>
                  <th>Mã GD</th>
                  <th>Loại</th>
                  <th>Số tiền</th>
                  <th>Trạng thái</th>
                  <th>PTTT</th>
                  <th>Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {booking.transactions?.map((t) => (
                  <tr key={t._id}>
                    <td>{t._id.slice(-6)}</td>
                    <td>{t.type}</td>
                    <td>{formatCurrency(t.amount)}</td>
                    <td>{t.status}</td>
                    <td>{t.paymentMethod}</td>
                    <td>{formatDateTime(t.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default BookingDetailOwner; 