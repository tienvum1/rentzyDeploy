import React, { useEffect, useState } from 'react';
import './ownerOverview.css';
import { useAuth } from '../../../context/AuthContext';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

const months = [
  'Th1', 'Th2', 'Th3', 'Th4', 'Th5', 'Th6', 'Th7', 'Th8', 'Th9', 'Th10', 'Th11', 'Th12'
];

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

const OwnerOverview = () => {
  const { user } = useAuth();
  const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';
  const [vehicleCount, setVehicleCount] = useState(0);
  const [bookingCount, setBookingCount] = useState(0);
  const [revenue, setRevenue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewType, setViewType] = useState('month'); // 'month' | 'day'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // 1-12
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Chart data
  const [vehicleStats, setVehicleStats] = useState([]);
  const [bookingStats, setBookingStats] = useState([]);
  const [revenueStats, setRevenueStats] = useState([]);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    setError('');
    // Build query params for day view
    let start = '', end = '';
    if (viewType === 'day') {
      const days = getDaysInMonth(selectedYear, selectedMonth);
      start = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01T00:00:00.000Z`;
      end = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${days}T23:59:59.999Z`;
    }
    // Fetch all stats in parallel
    Promise.all([
      // Get vehicles count
      fetch(`${backendUrl}/api/vehicles/owner`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.vehicles ? data.vehicles.length : 0),
      // Get bookings count
      fetch(`${backendUrl}/api/owner/owner-bookings`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.bookings ? data.bookings.length : 0),
      // Get total revenue
      fetch(`${backendUrl}/api/owner/revenue?type=all`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.total?.totalRevenue || 0),
      // Get vehicle stats by month or by day
      fetch(`${backendUrl}/api/owner/vehicle-stats-by-month`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.stats || []),
      // Get booking stats by month or by day
      fetch(`${backendUrl}/api/owner/booking-stats-by-month`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.stats || []),
      // Get revenue by month or by day
      fetch(`${backendUrl}/api/owner/revenue?type=${viewType}${viewType === 'day' ? `&start=${start}&end=${end}` : ''}`, { credentials: 'include' })
        .then(res => res.json())
        .then(data => data.revenue || []),
    ])
      .then(([vehicles, bookings, totalRevenue, vehicleStatsRaw, bookingStatsRaw, revenueStatsRaw]) => {
        setVehicleCount(vehicles);
        setBookingCount(bookings);
        setRevenue(totalRevenue);
        if (viewType === 'month') {
          // Chuẩn hóa dữ liệu cho biểu đồ theo tháng
          const vehicleStatsArr = Array(12).fill(0);
          vehicleStatsRaw.forEach(item => {
            if (item._id && item._id.month) vehicleStatsArr[item._id.month - 1] = item.count;
          });
          setVehicleStats(vehicleStatsArr.map((count, idx) => ({ label: months[idx], count })));
          const bookingStatsArr = Array(12).fill(0);
          bookingStatsRaw.forEach(item => {
            if (item._id && item._id.month) bookingStatsArr[item._id.month - 1] = item.count;
          });
          setBookingStats(bookingStatsArr.map((count, idx) => ({ label: months[idx], count })));
          const revenueStatsArr = Array(12).fill(0);
          revenueStatsRaw.forEach(item => {
            if (item._id && item._id.month) revenueStatsArr[item._id.month - 1] = item.totalRevenue;
          });
          setRevenueStats(revenueStatsArr.map((revenue, idx) => ({ label: months[idx], revenue })));
        } else {
          // Theo ngày: group lại ở FE
          const days = getDaysInMonth(selectedYear, selectedMonth);
          // Vehicle
          const vehicleStatsArr = Array(days).fill(0);
          vehicleStatsRaw.forEach(item => {
            if (item._id && item._id.day && item._id.month === selectedMonth) vehicleStatsArr[item._id.day - 1] = item.count;
          });
          setVehicleStats(vehicleStatsArr.map((count, idx) => ({ label: `${idx + 1}`, count })));
          // Booking
          const bookingStatsArr = Array(days).fill(0);
          bookingStatsRaw.forEach(item => {
            if (item._id && item._id.day && item._id.month === selectedMonth) bookingStatsArr[item._id.day - 1] = item.count;
          });
          setBookingStats(bookingStatsArr.map((count, idx) => ({ label: `${idx + 1}`, count })));
          // Revenue
          const revenueStatsArr = Array(days).fill(0);
          revenueStatsRaw.forEach(item => {
            if (item._id && item._id.day && item._id.month === selectedMonth) revenueStatsArr[item._id.day - 1] = item.totalRevenue;
          });
          setRevenueStats(revenueStatsArr.map((revenue, idx) => ({ label: `${idx + 1}`, revenue })));
        }
      })
      .catch(() => setError('Không thể tải dữ liệu tổng quan.'))
      .finally(() => setLoading(false));
  }, [user, backendUrl, viewType, selectedMonth, selectedYear]);

  if (!user) {
    return <div className="owner-overview-container"><p>Vui lòng đăng nhập để xem tổng quan.</p></div>;
  }

  return (
    <div className="owner-overview-container">
      <h1 className="owner-overview-title">Chào mừng, {user.name || user.email}!</h1>
      <p className="owner-overview-subtitle">Tổng quan hoạt động của bạn trên hệ thống</p>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 16 }}>
        <label htmlFor="viewType">Xem theo: </label>
        <select id="viewType" value={viewType} onChange={e => setViewType(e.target.value)}>
          <option value="month">Tháng</option>
          <option value="day">Ngày</option>
        </select>
        {viewType === 'day' && (
          <>
            <label htmlFor="month-select">Tháng: </label>
            <select id="month-select" value={selectedMonth} onChange={e => setSelectedMonth(Number(e.target.value))}>
              {months.map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>{m}</option>
              ))}
            </select>
            <label htmlFor="year-select">Năm: </label>
            <input id="year-select" type="number" min="2000" max="2100" value={selectedYear} onChange={e => setSelectedYear(Number(e.target.value))} style={{ width: 80 }} />
          </>
        )}
      </div>
      {loading ? (
        <div className="owner-overview-loading">Đang tải dữ liệu...</div>
      ) : error ? (
        <div className="owner-overview-error">{error}</div>
      ) : (
        <>
          <div className="owner-overview-stats">
            <div className="owner-overview-stat-card">
              <div className="stat-label">Tổng số xe</div>
              <div className="stat-value">{vehicleCount}</div>
            </div>
            <div className="owner-overview-stat-card">
              <div className="stat-label">Tổng số đơn thuê</div>
              <div className="stat-value">{bookingCount}</div>
            </div>
            <div className="owner-overview-stat-card">
              <div className="stat-label">Tổng doanh thu</div>
              <div className="stat-value">{revenue.toLocaleString()} VND</div>
            </div>
          </div>

          <div className="owner-overview-charts">
            <div className="chart-section">
              <h3>Biểu đồ số lượng xe theo {viewType === 'month' ? 'tháng' : 'ngày'}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={vehicleStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Số xe" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-section">
              <h3>Biểu đồ số lượng đơn thuê theo {viewType === 'month' ? 'tháng' : 'ngày'}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={bookingStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Số đơn thuê" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="chart-section">
              <h3>Biểu đồ doanh thu theo {viewType === 'month' ? 'tháng' : 'ngày'}</h3>
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={revenueStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" name="Doanh thu (VND)" stroke="#f59e42" strokeWidth={3} dot={true} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default OwnerOverview;
