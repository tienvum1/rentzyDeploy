import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Header.css';

const checkIsShowConsignButton = (user, isAuthenticated) => {
  if (!isAuthenticated || !user) return false;
  // Nếu là owner và đã được duyệt thì không hiện nút
  if (user.role.includes('owner') && user.owner_request_status == 'approved') {
    return false;
  }
  // Nếu chưa phải owner hoặc owner chưa được duyệt thì hiện nút
  return true;
};

const Header = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const [showDropdown, setShowDropdown] = useState(false);
  const avatarRef = useRef(null);
  const dropdownRef = useRef(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    }
    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleLogout = () => {
    setShowDropdown(false);
    logout();
    navigate('/login');
  };

  const handleViewProfile = () => {
    setShowDropdown(false);
    navigate('/profile/account');
  };

  useEffect(() => {
    if (isAuthenticated && user && !user.avatar_url) {
        // fetchUserProfile(); 
        console.log("User authenticated but avatar missing. Consider refreshing profile.");
    }
  }, [isAuthenticated, user]);

  return (
    <header className="header-modern">
      <div className="header__logo-row-modern" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img
          src="https://cdn-icons-png.flaticon.com/512/854/854894.png"
          alt="Car Logo"
          className="header__logo-modern"
        />
        <span className="header__brand-name-modern">Rentzy</span>
      </div>
      <nav className="header__nav">
        <Link to="/" className="header__link">Trang chủ</Link>
        <Link to="/vehicles" className="header__link">Xe cho thuê</Link>
        <Link to="/introduction" className="header__link">Giới thiệu</Link>
   
      </nav>
      <div className="header__actions">
        {checkIsShowConsignButton(user, isAuthenticated) && (
          <button
            className="header__consign-btn"
            onClick={() => navigate('/consignForm')}
          >
            Ký gửi xe
          </button>
        )}
        {isAuthenticated ? (
          <div className="header__user-actions">
            <div
              className="header__user-avatar"
              ref={avatarRef}
              onClick={() => setShowDropdown((prev) => !prev)}
              style={{ cursor: 'pointer' }}
            >
             <img
  src={user.avatar_url || 'https://via.placeholder.com/40/cccccc/ffffff?text=User'}
  alt={user.name || 'User Avatar'}
  className="avatar-img"
  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
/>
            </div>
            {showDropdown && (
              <div className="header__dropdown" ref={dropdownRef}>
                <button className="header__dropdown-item" onClick={handleViewProfile}>
                  Trang cá nhân
                </button>
                <button className="header__dropdown-item" onClick={handleLogout}>
                  Đăng xuất
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              className="header__login"
              onClick={() => navigate('/login')}
            >
              Đăng nhập
            </button>
            <button className="header__signup" onClick={() => navigate('/register')}>
              Đăng ký
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;