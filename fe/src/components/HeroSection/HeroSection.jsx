import React from 'react';
import './HeroSection.css';

const HeroSection = () => {
  return (
    <div className="hero-section">
      <div className="hero-section__content">
        <h1 className="hero-section__title">
          Tìm chiếc xe <br />
          hoàn hảo <br />
          cho <span className="highlight">chuyến đi của bạn</span>
        </h1>
        <p className="hero-section__desc">
          Nhanh chóng, dễ dàng và giá tốt nhất. Dù bạn lên kế hoạch cho một chuyến đi cuối tuần hay hành trình xuyên Việt, đội xe đa dạng và dịch vụ tận tâm của chúng tôi sẽ giúp bạn lên đường thật dễ dàng.
        </p>
        <div className="hero-section__buttons">
          <button className="btn btn-primary">Bắt đầu ngay</button>
          <button className="btn btn-secondary">Tải ứng dụng</button>
        </div>
        <div className="hero-section__stores">
          <div className="store">
            <img src="https://upload.wikimedia.org/wikipedia/commons/6/67/App_Store_%28iOS%29.svg" alt="Apple Store" className="store__icon" />
            <span>Tải trên <b>Apple Store</b></span>
          </div>
          <div className="store">
            <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" className="store__icon" />
            <span>Tải về từ <b>Google Play</b></span>
          </div>
        </div>
      </div>
      <div className="hero-section__image">
        <img src="https://images.pexels.com/photos/358070/pexels-photo-358070.jpeg" alt="Xe ô tô" />
      </div>
    </div>
  );
};
export default HeroSection; 