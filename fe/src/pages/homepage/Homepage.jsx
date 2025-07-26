import React from 'react';
import './Homepage.css';
import Header from '../../components/Header/Header';
import Footer from '../../components/footer/Footer';
import HeroSection from '../../components/HeroSection/HeroSection';
import StatsSection from '../../components/StatsSection/StatsSection';
import BrandsSection from '../../components/BrandsSection/BrandsSection';
import VehicleList from './VehicleList';
import FilterBar from '../../components/vehicleFilter/FilterBar';
import DateTimeSelector from '../../components/DateTimeSelector/DateTimeSelector';
import ChatChooseCar from '../../components/ChatBox/ChatChooseCar';

// Testimonial Section
const testimonials = [
  {
    name: 'Nguyễn Văn An',
    comment: 'Thuê xe ở đây rất nhanh chóng, xe mới và giá hợp lý. Sẽ quay lại!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
  },
  {
    name: 'Trần T',
    comment: 'Dịch vụ hỗ trợ tận tình, thủ tục đơn giản. Rất hài lòng!',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
  },
  {
    name: 'Lê Quốc C',
    comment: 'Nhiều lựa chọn xe, giao xe đúng giờ, giá tốt.',
    avatar: 'https://randomuser.me/api/portraits/men/65.jpg',
  },
];

function TestimonialSection() {
  return (
    <section className="testimonial-section">
      <h3 className="testimonial-title">Khách hàng nói gì về chúng tôi?</h3>
      <div className="testimonial-list">
        {testimonials.map((t, idx) => (
          <div className="testimonial-card" key={idx}>
            <img src={t.avatar} alt={t.name} className="testimonial-avatar" />
            <div className="testimonial-comment">"{t.comment}"</div>
            <div className="testimonial-name">- {t.name}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Call to Action Section
function CallToActionSection() {
  return (
    <section className="cta-section">
      <h2>Bạn đã sẵn sàng trải nghiệm dịch vụ thuê xe chuyên nghiệp?</h2>
      <p>Đăng ký tài khoản ngay để nhận ưu đãi và khám phá hàng trăm mẫu xe chất lượng!</p>
      <a href="/register" className="cta-btn">Đăng ký ngay</a>
    </section>
  );
}

function Homepage() {
  const handleSearch = (searchParams) => {
    // Gọi API tìm kiếm xe với searchParams
    // hoặc chuyển searchParams sang trang kết quả
    console.log(searchParams);
  };

  return (
    <div className="homepage-root">
      <Header />
      <div className="homepage-container">
        <section className="hero-wrapper">
          <HeroSection />
        </section>
        <section className="stats-wrapper">
          <StatsSection />
        </section>
        <section className="brands-wrapper">
          <BrandsSection />
        </section>
        <section className="vehiclelist-wrapper">
          <VehicleList />
        </section>
        <TestimonialSection />
        {/* chatbox to help choose car : */}
        <ChatChooseCar />
        
      </div>
      <Footer />
    </div>
  );
}

export default Homepage;