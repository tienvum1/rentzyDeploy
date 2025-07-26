import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaBell, FaCheckCircle, FaRegClock, FaCar } from 'react-icons/fa';
import ProfileLayout from '../profileLayout/ProfileLayout';
import moment from 'moment';
import { useNavigate } from 'react-router-dom';
import './NotificationPage.css'
moment.locale('vi');

const NotificationPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [marking, setMarking] = useState('');
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';
  const navigate = useNavigate();

  // Fetch notifications
  const fetchNotifications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${backendUrl}/api/notifications`, { withCredentials: true });
      // Sort newest first
      const sorted = (response.data.notifications || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(sorted);
    } catch (err) {
      setError('Không thể tải thông báo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line
  }, []);

  // Handle click: mark as read and navigate if needed
  const handleNotificationClick = async (n) => {
    if (!n.isRead) {
      setMarking(n._id);
      try {
        await axios.patch(`${backendUrl}/api/notifications/${n._id}/read`, {}, { withCredentials: true });
        setNotifications((prev) => {
          // Mark as read and re-sort
          const updated = prev.map((item) => item._id === n._id ? { ...item, isRead: true } : item);
          return updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        });
      } catch (err) {
        // ignore error, just update UI
      } finally {
        setMarking('');
      }
    }
    // Navigate if has link
    if (n.booking) {
      navigate(`/bookings/${n.booking}`);
    } else if (n.vehicle && !n.booking) {
      navigate(`/vehicles/${n.vehicle}`);
    }
  };

  return (
    <ProfileLayout>
      <div className="notification-page-container modern-notification-container compact-notification-container">
        <div className="notification-header-row">
          <h2 className="notification-title compact-title">
            <FaBell /> Thông báo
          </h2>
        </div>
        {loading && <p>Đang tải...</p>}
        {error && <p className="notification-error">{error}</p>}
        {!loading && notifications.length === 0 && <p className="notification-empty">Bạn chưa có thông báo nào.</p>}
        {!loading && notifications.length > 0 && (
          <div className="notification-list modern-notification-list fb-style-list compact-list">
            {notifications.map((n) => (
              <div
                className={`notification-card modern-notification-card fb-style-card compact-card${!n.isRead ? ' unread' : ''}`}
                key={n._id}
                onClick={() => handleNotificationClick(n)}
                tabIndex={0}
                style={{ cursor: 'pointer', opacity: marking === n._id ? 0.7 : 1 }}
              >
                <div className="compact-row">
                  <span className={`notification-badge compact-badge${!n.isRead ? ' unread' : ' read'}`}>{!n.isRead ? <FaRegClock /> : <FaCheckCircle />}</span>
                  <span className="compact-title-text">{n.title}</span>
                  <span className="compact-message">{n.message}</span>
                  {n.booking && (
                    <span className="compact-link"><FaCar /> Đơn #{n.booking.slice(-6)}</span>
                  )}
                  {n.vehicle && !n.booking && (
                    <span className="compact-link"><FaCar /> Xe #{n.vehicle.slice(-6)}</span>
                  )}
                  <span className="compact-date">{moment(n.createdAt).fromNow()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </ProfileLayout>
  );
};

export default NotificationPage; 