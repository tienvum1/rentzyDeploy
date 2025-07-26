import React from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/footer/Footer';
import './IntroductionPage.css';

const IntroductionPage = () => {
  return (
    <>
      <Header />
      <div className="introduction-page">
        <div className="intro-hero">
          <div className="intro-hero-content">
            <h1 className="intro-title">
              Bảng Giá Thuê Xe Tự Lái Giá Rẻ Đà Nẵng 2025: Giá Chỉ Từ 400K
            </h1>
            <p className="intro-subtitle">
              Thuê xe tự lái Đà Nẵng là giải pháp hoàn hảo để khám phá thành phố biển với sự tự do, tiện lợi và tiết kiệm. 
              Rentzy mang đến trải nghiệm di chuyển hiện đại với giá chỉ từ 400.000 VNĐ, cùng nhiều ưu đãi hấp dẫn.
            </p>
          </div>
        </div>

        <div className="intro-content">
          <section className="why-choose-section">
            <h2>Tại sao nên thuê xe tự lái Đà Nẵng 2025?</h2>
            <p>
              Thuê xe tự lái Đà Nẵng 2025 mang lại sự linh hoạt, tiết kiệm và thoải mái, giúp bạn dễ dàng di chuyển 
              đến các địa danh nổi tiếng như Cầu Rồng, biển Mỹ Khê, Bà Nà Hills, hay Hội An.
            </p>
          </section>

          <section className="benefits-section">
            <h2>Lợi ích nổi bật của thuê xe tự lái:</h2>
            <div className="benefits-grid">
              <div className="benefit-item">
                <h3>🚗 Tự do di chuyển</h3>
                <p>
                  Không phụ thuộc vào lịch trình xe buýt hay taxi, bạn có thể tự do ghé thăm Chùa Linh Ứng, 
                  Ngũ Hành Sơn, hoặc các quán cà phê view biển tại Sơn Trà.
                </p>
              </div>
              <div className="benefit-item">
                <h3>💰 Tiết kiệm chi phí</h3>
                <p>
                  Giá thuê xe tự lái rẻ hơn 40-50% so với taxi hoặc xe có tài xế, chỉ từ 400.000 VNĐ/4 giờ với Rentzy.
                </p>
              </div>
              <div className="benefit-item">
                <h3>🎯 Phù hợp nhiều nhu cầu</h3>
                <p>
                  Từ du lịch, công tác ngắn ngày, đến sự kiện cưới hỏi, xe tự lái đáp ứng mọi đối tượng.
                </p>
              </div>
            </div>
          </section>

          <section className="demand-section">
            <h2>Nhu Cầu Thuê Xe Tự Lái Giá Rẻ Đà Nẵng 2025</h2>
            <p>
              Đà Nẵng là điểm đến du lịch hàng đầu Việt Nam, đón hơn 8 triệu lượt khách mỗi năm. 
              Nhu cầu thuê xe tự lái tăng mạnh do:
            </p>
            <ul className="demand-list">
              <li><strong>Du lịch khám phá:</strong> Du khách muốn tự lái đến Hội An, Huế, hoặc các điểm nội thành.</li>
              <li><strong>Công tác ngắn ngày:</strong> Doanh nhân cần xe di chuyển nhanh giữa Hải Châu, Thanh Khê.</li>
              <li><strong>Sự kiện cá nhân:</strong> Cưới hỏi, về quê, hoặc các chuyến đi nhóm cần xe 7 chỗ rộng rãi.</li>
            </ul>
          </section>

          <section className="pricing-section">
            <h2>Bảng Giá Thuê Xe Tự Lái Giá Rẻ Đà Nẵng 2025</h2>
            <p>Rentzy cung cấp bảng giá thuê xe tự lái Đà Nẵng cạnh tranh, phù hợp mọi nhu cầu (cập nhật 2025):</p>
            
            <div className="pricing-table">
              <table>
                <thead>
                  <tr>
                    <th>Dòng xe</th>
                    <th>4 giờ</th>
                    <th>8 giờ</th>
                    <th>12 giờ</th>
                    <th>24 giờ</th>
                    <th>3 ngày</th>
                    <th>7 ngày</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Hyundai Accent 2021 (AT, Sedan - 5 chỗ)</td>
                    <td>400.000 VNĐ</td>
                    <td>500.000 VNĐ</td>
                    <td>550.000 VNĐ</td>
                    <td>700.000 VNĐ</td>
                    <td>1.950.000 VNĐ</td>
                    <td>4.200.000 VNĐ</td>
                  </tr>
                  <tr>
                    <td>Honda City 2022 (CVT, Sedan - 5 chỗ)</td>
                    <td>450.000 VNĐ</td>
                    <td>550.000 VNĐ</td>
                    <td>650.000 VNĐ</td>
                    <td>850.000 VNĐ</td>
                    <td>2.400.000 VNĐ</td>
                    <td>5.110.000 VNĐ</td>
                  </tr>
                  <tr>
                    <td>Toyota Vios 2023 (AT, Sedan - 5 chỗ)</td>
                    <td>420.000 VNĐ</td>
                    <td>520.000 VNĐ</td>
                    <td>600.000 VNĐ</td>
                    <td>750.000 VNĐ</td>
                    <td>2.100.000 VNĐ</td>
                    <td>4.550.000 VNĐ</td>
                  </tr>
                </tbody>
              </table>
              <p className="pricing-note">*Bảng giá mang tính chất tham khảo, đặt xe ngay để xem giá chi tiết</p>
            </div>

            <div className="cta-section">
              <button className="cta-button" onClick={() => window.location.href = '/vehicles'}>
                ĐẶT XE NGAY
              </button>
            </div>
          </section>

          <section className="coverage-section">
            <h2>Phạm vi phục vụ</h2>
            <p>
              Rentzy phủ sóng dịch vụ thuê xe tự lái tại 6 quận: Hải Châu, Thanh Khê, Sơn Trà, 
              Ngũ Hành Sơn, Cẩm Lệ, và Liên Chiểu, đảm bảo dễ dàng tiếp cận.
            </p>
            <div className="districts-grid">
              <div className="district-item">Thuê Xe Tự Lái Quận Hải Châu Đà Nẵng</div>
              <div className="district-item">Thuê Xe Tự Lái Quận Thanh Khê Đà Nẵng</div>
              <div className="district-item">Thuê Xe Tự Lái Quận Sơn Trà Đà Nẵng</div>
              <div className="district-item">Thuê Xe Tự Lái Quận Ngũ Hành Sơn Đà Nẵng</div>
              <div className="district-item">Thuê Xe Tự Lái Quận Cẩm Lệ Đà Nẵng</div>
              <div className="district-item">Thuê Xe Tự Lái Quận Liên Chiểu Đà Nẵng</div>
            </div>
          </section>

          <section className="advantages-section">
            <h2>Lợi Ích Khi Thuê Xe Tự Lái Đà Nẵng Rentzy</h2>
            <div className="advantages-grid">
              <div className="advantage-item">
                <h3>🔧 Công nghệ hiện đại</h3>
                <ul>
                  <li>Đặt xe trực tuyến qua website, xác thực hồ sơ trong 5 phút</li>
                  <li>Theo dõi hành trình với dữ liệu minh bạch</li>
                </ul>
              </div>
              <div className="advantage-item">
                <h3>📞 Hỗ trợ khách hàng 24/7</h3>
                <ul>
                  <li>Hotline hỗ trợ nhanh chóng từ đặt xe đến xử lý sự cố</li>
                  <li>95% khách hàng hài lòng với tốc độ phản hồi</li>
                </ul>
              </div>
              <div className="advantage-item">
                <h3>🌐 Mạng lưới rộng</h3>
                <ul>
                  <li>Xe có sẵn tại Hải Châu, Sơn Trà, Ngũ Hành Sơn, và các quận khác</li>
                </ul>
              </div>
              <div className="advantage-item">
                <h3>🚚 Dịch vụ giao xe tận nơi</h3>
                <ul>
                  <li>Xe được giao đến khách sạn, homestay, hoặc văn phòng với chi phí hợp lý</li>
                </ul>
              </div>
            </div>
          </section>

          <section className="conclusion-section">
            <h2>Kết Luận</h2>
            <p>
              Thuê xe tự lái Đà Nẵng 2025 là giải pháp lý tưởng để khám phá thành phố biển với chi phí hợp lý 
              và sự linh hoạt tối đa. Với Rentzy, bạn có thể chọn từ các dòng xe đời mới, giá chỉ từ 400.000 VNĐ, 
              cùng nhiều ưu đãi hấp dẫn.
            </p>
            <p>
              Truy cập website Rentzy hoặc liên hệ để đặt xe và bắt đầu hành trình khám phá Đà Nẵng!
            </p>
            <div className="final-cta">
              <button className="cta-button" onClick={() => window.location.href = '/vehicles'}>
                Khám phá xe ngay
              </button>
            </div>
          </section>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default IntroductionPage;