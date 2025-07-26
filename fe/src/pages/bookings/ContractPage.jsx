import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './ContractPage.css';
import SignatureCanvas from 'react-signature-canvas';
import { useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FaCheck, FaCar, FaFileSignature, FaRegCircle, FaClipboardCheck } from "react-icons/fa";
import Header from '../../components/Header/Header';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function ProgressBar({ currentStep }) {
  return (
    <div className="progress-bar-wrapper">
      <div className="progress-steps">
        <div className={`progress-step completed`}>
          <div className={`step-icon active`}>
            <FaCheck />
          </div>
          <span className="step-text">Tìm và chọn xe</span>
        </div>
        <div className={`progress-step completed`}>
          <div className={`step-icon active`}>
            <FaClipboardCheck />
          </div>
          <span className="step-text">Xác nhận đơn hàng</span>
        </div>
        <div className={`progress-step completed`}>
          <div className={`step-icon active`}>
            <FaCar />
          </div>
          <span className="step-text">Thanh toán cọc 30%</span>
        </div>
        <div className={`progress-step ${currentStep >= 3 ? 'completed' : ''}`}>
          <div className={`step-icon ${currentStep >= 3 ? 'active' : 'current'}`}>
            <FaFileSignature />
          </div>
          <span className="step-text">Ký hợp đồng</span>
        </div>
        <div className={`progress-step ${currentStep >= 4 ? 'completed' : ''}`}>
          <div className={`step-icon ${currentStep >= 4 ? 'active' : 'inactive'}`}>
            <FaCar />
          </div>
          <span className="step-text">Nhận xe</span>
        </div>
      </div>
    </div>
  );
}



const ContractPage = () => {
  const { bookingId } = useParams();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const renterSigRef = useRef();
  const [renterSignature, setRenterSignature] = useState(null);
  const [isSigEmpty, setIsSigEmpty] = useState(true);
  const ownerSigRef = useRef();
  const [ownerSignature, setOwnerSignature] = useState(null);
  const [isOwnerSigEmpty, setIsOwnerSigEmpty] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/contract/${bookingId}`, { withCredentials: true });
        setBooking(res.data.booking);
        // Set signatures if present
        setRenterSignature(res.data.booking.renterSignature || null);
        setOwnerSignature(res.data.booking.ownerSignature || null);
      } catch (err) {
        setError('Không tìm thấy hợp đồng hoặc đơn thuê.');
      } finally {
        setLoading(false);
      }
    };
    fetchBooking();
  }, [bookingId]);

  if (loading) return <div className="contract-loading">Đang tải hợp đồng...</div>;
  if (error || !booking) return <div className="contract-error">{error || 'Không tìm thấy hợp đồng.'}</div>;

  const { vehicle, renter, startDate, endDate, totalAmount, deposit } = booking;
  const owner = vehicle?.owner;
  const today = new Date();
  const formatDate = (date) => new Date(date).toLocaleDateString('vi-VN');

  const canSignRenter = user && booking && user._id === (booking.renter?._id || booking.renter);
  const canSignOwner = user && booking && user._id === (booking.vehicle?.owner?._id || booking.vehicle?.owner);

  const handleSaveSignature = async (type) => {
    let sigRef = type === 'renter' ? renterSigRef : ownerSigRef;
    let setSig = type === 'renter' ? setRenterSignature : setOwnerSignature;
    const dataUrl = sigRef.current.getCanvas().toDataURL('image/png');
    setSig(dataUrl);
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/bookings/${bookingId}/signature`, {
        type,
        signature: dataUrl
      }, { withCredentials: true });
      toast.success('Lưu chữ ký thành công!');
    } catch (err) {
      toast.error('Lưu chữ ký thất bại!');
    }
  };

  return (
    <>
      <Header />
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="contract-page-bg">
        <div className="progress-bar-wrapper">
          <ProgressBar currentStep={3} />
        </div>
        <div className="contract-a4-container">
          {/* Thông báo cần ký hợp đồng */}
          {canSignRenter && !renterSignature && (
            <div style={{
              background: '#fffbe6',
              color: '#ad8b00',
              border: '1px solid #ffe58f',
              borderRadius: 8,
              padding: '12px 20px',
              marginBottom: 18,
              fontWeight: 500,
              fontSize: '1.05rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{fontSize: 20, marginRight: 8}}>⚠️</span>
              Bạn cần ký hợp đồng để hoàn thành thủ tục nhận xe.
            </div>
          )}
          {canSignRenter && renterSignature && (
            <div style={{
              background: '#e6fffb',
              color: '#08979c',
              border: '1px solid #87e8de',
              borderRadius: 8,
              padding: '10px 18px',
              marginBottom: 16,
              fontWeight: 500,
              fontSize: '1.01rem',
              display: 'flex',
              alignItems: 'center',
              gap: 8
            }}>
              <span style={{fontSize: 20, marginRight: 8}}>✅</span>
              Bạn đã ký hợp đồng. Có thể hoàn thành bước này.
            </div>
          )}
          <main className="contract-content">
            {/* Nội dung hợp đồng */}
            <div className="contract-header-row">
              <div className="contract-header-right" style={{marginLeft: 'auto'}}>
                <div className="contract-nation">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
                <div className="contract-motto">Độc lập – Tự do – Hạnh phúc</div>
                <div className="contract-dash">-----------------00-----------------</div>
                <div className="contract-number">Số: {today.getDate()}/{today.getFullYear()}/TD-LD</div>
                <div className="contract-date">Đà Nẵng, ngày {today.getDate()} tháng {today.getMonth()+1} năm {today.getFullYear()}</div>
              </div>
            </div>
            <h2 className="contract-title-main">HỢP ĐỒNG THUÊ XE Ô TÔ</h2>
            <div className="contract-legal">
              <div>- Căn cứ Bộ luật Dân sự năm 2015;</div>
              <div>- Căn cứ Luật Thương mại năm 2005;</div>
              <div>- Căn cứ nhu cầu và thỏa thuận của hai bên;</div>
            </div>
            <div className="contract-between">Hợp đồng này được lập giữa các bên:</div>
            <div className="contract-party contract-party-a">
              <b>Bên A (Người cho thuê):</b>
              <div>Họ tên: <b>{owner?.cccd_full_name}</b></div>
              <div>Email: <b>{owner?.email}</b></div>
              <div>Số điện thoại: <b>{owner?.phone}</b></div>
              <div>Số CCCD: <b>{owner?.cccd_number}</b></div>
            </div>
            <div className="contract-party contract-party-b">
              <b>Bên B (Người thuê):</b>
              <div>Họ tên: <b>{renter?.driver_license_full_name || renter?.name}</b></div>
              <div>Số điện thoại: <b>{renter?.phone}</b></div>
              <div>Số GPLX: <b>{renter?.driver_license_number}</b></div>
            </div>
            <div className="contract-agree">Hai bên thống nhất các điều khoản dưới đây:</div>

            <div className="contract-section">
              <b>Điều 1: Thông tin xe cho thuê</b>
              <ul style={{marginLeft: 18}}>
                <li>Hãng xe: <b>{vehicle?.brand}</b></li>
                <li>Dòng xe: <b>{vehicle?.model}</b></li>
                <li>Biển số: <b>{vehicle?.licensePlate}</b></li>
              </ul>
            </div>

            <div className="contract-section">
              <b>Điều 2: Thời hạn và chi phí thuê xe</b>
              <div>Thời gian thuê: Từ <b>{formatDate(startDate)}</b> đến <b>{formatDate(endDate)}</b>.</div>
              <div>Địa điểm nhận xe: <b>{booking.pickupLocation}</b></div>
              <div>Địa điểm trả xe: <b>{booking.returnLocation}</b></div>
              <div>Số tiền thuê: <b>{totalAmount?.toLocaleString('vi-VN')}đ</b> cho toàn bộ thời gian thuê.</div> 
              <div>Quá thời hạn trên, nếu Bên B muốn gia hạn phải thông báo trước cho Bên A và được Bên A đồng ý.</div>
            </div>

            <div className="contract-section">
              <b>Điều 3: Quyền và nghĩa vụ của các bên</b>
              <ul style={{marginLeft: 18}}>
                <li><b>Bên A (Người cho thuê):</b>
                  <ul>
                    <li>Giao xe đúng hiện trạng, đủ giấy tờ, bảo hiểm, đúng thời gian, địa điểm.</li>
                    <li>Hỗ trợ Bên B trong quá trình thuê xe nếu có sự cố kỹ thuật.</li>
                    <li>Hoàn trả cọc đúng hạn nếu Bên B không vi phạm hợp đồng.</li>
                  </ul>
                </li>
                <li><b>Bên B (Người thuê):</b>
                  <ul>
                    <li>Sử dụng xe đúng mục đích, không cho người khác thuê lại, không sử dụng vào mục đích vi phạm pháp luật.</li>
                    <li>Bảo quản xe, chịu trách nhiệm bồi thường nếu làm hư hỏng, mất mát, vi phạm giao thông.</li>
                    <li>Trả xe đúng thời gian, địa điểm, hiện trạng ban đầu (trừ hao mòn tự nhiên).</li>
                    <li>Thanh toán đầy đủ các khoản phát sinh (nếu có): phí phạt, phí vệ sinh, phí trễ hạn, v.v.</li>
                  </ul>
                </li>
              </ul>
            </div>

            <div className="contract-section">
              <b>Điều 4: Xác nhận giao nhận xe</b>
              <div>
                Hai bên sẽ cùng kiểm tra hiện trạng xe (ngoại thất, nội thất, mức xăng, giấy tờ, phụ kiện đi kèm...) khi giao và nhận xe. Mọi phát sinh, hư hỏng, thiếu sót sẽ được ghi nhận bằng biên bản riêng hoặc cập nhật trên hệ thống.
              </div>
            </div>

            <div className="contract-section">
              <b>Điều 5: Xử lý vi phạm và chấm dứt hợp đồng</b>
              <ul style={{marginLeft: 18}}>
                <li>Nếu Bên B trả xe trễ, sẽ bị tính phí theo quy định của Bên A hoặc nền tảng.</li>
                <li>Nếu phát hiện sử dụng xe sai mục đích, Bên A có quyền thu hồi xe và không hoàn cọc.</li>
                <li>Hợp đồng chấm dứt khi hai bên hoàn thành nghĩa vụ, hoặc theo thỏa thuận/hủy ngang có lý do chính đáng.</li>
              </ul>
            </div>

            <div className="contract-section">
              <b>Điều 6: Giải quyết tranh chấp</b>
              <div>Hai bên ưu tiên giải quyết tranh chấp bằng thương lượng, hòa giải. Nếu không giải quyết được, tranh chấp sẽ được đưa ra tòa án có thẩm quyền theo quy định pháp luật Việt Nam.</div>
            </div>

            <div className="contract-section">
              <b>Điều 7: Hiệu lực hợp đồng</b>
              <div>Hợp đồng có hiệu lực từ khi hai bên ký tên/xác nhận điện tử và Bên B đã thanh toán đặt cọc.</div>
              <div>Hợp đồng được lập thành 02 bản, mỗi bên giữ 01 bản, có giá trị pháp lý như nhau.</div>
            </div>

            <div className="contract-signature-row">
              <div className="contract-signature-col">
                <b>BÊN A (chủ xe)</b>
                <div className="contract-signature-space">(Ký, ghi rõ họ tên)</div>
                <div className="contract-signature-box signature-box-with-placeholder">
                  {ownerSignature ? (
                    <img src={ownerSignature} alt="Chữ ký chủ xe" style={{width: 220, height: 110, border: '1px solid #ccc', borderRadius: 6}} />
                  ) : canSignOwner ? (
                    <div style={{position: 'relative', width: 220, height: 110}}>
                      <SignatureCanvas
                        penColor="#222"
                        minWidth={0.5}
                        maxWidth={1}
                        canvasProps={{
                          width: 220,
                          height: 110,
                          style: { width: 220, height: 110, borderRadius: 8, display: 'block' }
                        }}
                        ref={ownerSigRef}
                        onBegin={() => setIsOwnerSigEmpty(false)}
                        onEnd={() => setIsOwnerSigEmpty(ownerSigRef.current.isEmpty())}
                      />
                      {isOwnerSigEmpty && (
                        <div className="signature-placeholder-text">Hãy ký chữ ký của bạn vào vùng này</div>
                      )}
                    </div>
                  ) : null}
                </div>
                {!ownerSignature && canSignOwner && (
                  <div style={{marginTop: 10, display: 'flex', gap: 12, justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={{fontSize: 13, color: '#888', marginBottom: 4}}>
                      Chữ ký sẽ được lưu lên hệ thống và không thể chỉnh sửa lại.
                    </div>
                    <div style={{display: 'flex', gap: 12}}>
                      <button onClick={() => { ownerSigRef.current.clear(); setIsOwnerSigEmpty(true); }}>Xóa</button>
                      <button onClick={() => handleSaveSignature('owner')}>Lưu chữ ký</button>
                    </div>
                  </div>
                )}
                <div className="contract-signature-name">{owner?.cccd_full_name || owner?.name}</div>
              </div>
              <div className="contract-signature-col">
                <b>BÊN B (người thuê xe)</b>
                <div className="contract-signature-space">(Ký, ghi rõ họ tên)</div>
                <div className="contract-signature-box signature-box-with-placeholder">
                  {renterSignature ? (
                    <img src={renterSignature} alt="Chữ ký" style={{width: 220, height: 110, border: '1px solid #ccc', borderRadius: 6}} />
                  ) : canSignRenter ? (
                    <div style={{position: 'relative', width: 220, height: 110}}>
                      <SignatureCanvas
                        penColor="#222"
                        minWidth={0.5}
                        maxWidth={1}
                        canvasProps={{
                          width: 220,
                          height: 110,
                          style: { width: 220, height: 110, borderRadius: 8, display: 'block' }
                        }}
                        ref={renterSigRef}
                        onBegin={() => setIsSigEmpty(false)}
                        onEnd={() => setIsSigEmpty(renterSigRef.current.isEmpty())}
                      />
                      {isSigEmpty && (
                        <div className="signature-placeholder-text">Hãy ký chữ ký của bạn vào vùng này</div>
                      )}
                    </div>
                  ) : null}
                </div>
                {!renterSignature && canSignRenter && (
                  <div style={{marginTop: 10, display: 'flex', gap: 12, justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
                    <div style={{fontSize: 13, color: '#888', marginBottom: 4}}>
                      Chữ ký sẽ được lưu lên hệ thống và không thể chỉnh sửa lại.
                    </div>
                    <div style={{display: 'flex', gap: 12}}>
                      <button onClick={() => { renterSigRef.current.clear(); setIsSigEmpty(true); }}>Xóa</button>
                      <button onClick={() => handleSaveSignature('renter')}>Lưu chữ ký</button>
                    </div>
                  </div>
                )}
                <div className="contract-signature-name">{renter?.driver_license_full_name || renter?.name}</div>
              </div>
            </div>
            <div className="contract-footer-note">
              Hợp đồng này được tạo và lưu trữ tự động trên hệ thống Rentzy. Mọi thông tin, chữ ký điện tử và nội dung hợp đồng sẽ được sử dụng làm căn cứ pháp lý trong quá trình thuê xe, giải quyết tranh chấp (nếu có) và tuân thủ theo quy định của pháp luật Việt Nam cũng như chính sách của nền tảng.
            </div>
            {canSignRenter && renterSignature && (
              <div style={{ textAlign: 'center', marginTop: 24 }}>
                <button
                  className="contract-complete-btn"
                  onClick={() => navigate('/')} // hoặc chuyển sang trang tiếp theo
                  style={{
                    background: '#1976d2',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 8,
                    padding: '12px 36px',
                    fontSize: '1.15rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px #e3eaff44',
                  }}
                >
                  Hoàn thành
                </button>
              </div>
            )}

          </main>
        </div>
      </div>
    </>
  );
};


export default ContractPage;