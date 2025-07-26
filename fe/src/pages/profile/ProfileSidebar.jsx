import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaUser, FaHeart, FaCar, FaSuitcaseRolling, FaClipboardCheck, FaLock, FaTrash, FaBell, FaExchangeAlt } from 'react-icons/fa';
import './ProfileSidebar.css';

const menuItems = [
  { id: 'account', icon: <FaUser />, label: 'Tài khoản của tôi', path: '/profile/account' },
  { id: 'favorites', icon: <FaHeart />, label: 'Xe yêu thích', path: '/profile/favorites' },
  { id: 'my-bookings', icon: <FaSuitcaseRolling />, label: 'Đơn thuê của tôi', path: '/profile/my-bookings' },
  { id: 'my-transactions', icon: <FaExchangeAlt />, label: 'Lịch sử giao dịch', path: '/profile/my-transactions' },
  { id: 'my-reviews', icon: <FaSuitcaseRolling />, label: 'Đánh giá của tôi', path: '/profile/my-reviews' },
  { id: 'my-notifications', icon: <FaBell />, label: 'Thông báo', path: '/profile/my-notifications' },
  { id: 'owner-management', icon: <FaClipboardCheck />, label: 'Quản lí xe cho owner', path: '/ownerpage/overview' },
  { id: 'change-password', icon: <FaLock />, label: 'Đổi mật khẩu', path: '/profile/change-password' },
  { id: 'delete-account', icon: <FaTrash />, label: 'Yêu cầu xoá tài khoản', path: '/profile/delete-account' },
];

const ProfileSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Xác định active dựa trên pathname
  const isActive = (path) => location.pathname === path;

  return (
    <div className="sidebar-profile">
      <div className="sidebar-header">
        <h3>Quản lý tài khoản</h3>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={isActive(item.path) ? 'active' : ''}
            onClick={() => navigate(item.path)}
          >
            <span className="menu-icon">{item.icon}</span> {item.label}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProfileSidebar;