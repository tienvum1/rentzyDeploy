import React from 'react';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer__top-modern">
      <div className="footer__brand-modern">
        <div className="footer__logo-row-modern">
          <img src="https://cdn-icons-png.flaticon.com/512/854/854894.png" alt="Car Logo" className="footer__logo-modern" />
          <span className="footer__brand-name-modern">Rentzy</span>
        </div>
        <div className="footer__slogan-modern">
          <span>Thuê xe ô tô chuyên nghiệp tại Đà Nẵng - An toàn, tiện lợi, giá tốt.</span>
        </div>
        <button className="footer__cta-btn" onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}>
          Đặt xe ngay
        </button>
        <div className="footer__socials-modern">
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733547.png" alt="Facebook" /></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/733/733558.png" alt="Instagram" /></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" alt="X" /></a>
          <a href="#"><img src="https://cdn-icons-png.flaticon.com/512/1384/1384060.png" alt="YouTube" /></a>
        </div>
      </div>
      <div className="footer__links-modern">
        <div>
          <div className="footer__col-title-modern">Loại xe</div>
          <ul>
            <li><a href="#">Sedan</a></li>
            <li><a href="#">SUV</a></li>
            <li><a href="#">Hatchback</a></li>
            <li><a href="#">Xe điện</a></li>
          </ul>
        </div>
        <div>
          <div className="footer__col-title-modern">Hỗ trợ</div>
          <ul>
            <li><a href="#">Câu hỏi thường gặp</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
            <li><a href="#">Liên hệ</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__contact-modern">
        <div className="footer__contact-item-modern">
          <img src="https://cdn-icons-png.flaticon.com/512/535/535239.png" alt="Address" />
          <span>123 Le Van Hien, DaNang, Vietnam</span>
        </div>
        <div className="footer__contact-item-modern">
          <img src="https://cdn-icons-png.flaticon.com/512/732/732200.png" alt="Email" />
          <span>support@rentzy.vn</span>
        </div>
        <div className="footer__contact-item-modern">
          <img src="https://cdn-icons-png.flaticon.com/512/597/597177.png" alt="Phone" />
          <span>+84 987 654 321</span>
        </div>
        <div className="footer__apps-modern">
          <a href="#"><img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="App Store" /></a>
          <a href="#"><img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Google Play" /></a>
        </div>
      </div>
    </div>
    <div className="footer__bottom-modern">
      © {new Date().getFullYear()} Rentzy. All rights reserved.
    </div>
  </footer>
);

export default Footer;