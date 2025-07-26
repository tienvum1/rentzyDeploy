import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import SidebarAdmin from "../../../components/SidebarAdmin/SidebarAdmin";
import "./AdminDashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isLoading, isAuthenticated } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (
      !isLoading &&
      (!isAuthenticated || !user || !user.role.includes("admin"))
    ) {
      navigate("/");
    }
  }, [user, isLoading, isAuthenticated, navigate]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch("/api/admin/dashboard-stats", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const data = await response.json();
        setDashboardData(data.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user?.role.includes("admin")) {
      fetchDashboardData();
    }
  }, [isAuthenticated, user]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat("vi-VN").format(num);
  };

  const monthlyChartData = (dashboardData?.monthlyStats || []).map((item) => ({
    name: `${item._id.month}/${item._id.year}`,
    "Số đơn": item.count,
    "Doanh thu": item.revenue,
  }));

  if (isLoading || !isAuthenticated || !user || !user.role.includes("admin")) {
    return null;
  }

  if (loading) {
    return (
      <div className="for-admin-dashboard-layout">
        <SidebarAdmin />
        <div className="for-admin-dashboard-content">
          <div className="for-admin-dashboard-loading-container">
            <div>Đang tải dữ liệu...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="for-admin-dashboard-layout">
        <SidebarAdmin />

        <div className="for-admin-dashboard-content">
          <div className="for-admin-dashboard-error-container">
            <div>
              <h3>Lỗi tải dữ liệu</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>


      </div>
    );
  }

  return (
    <div className="admin-dashboard-root">
      <SidebarAdmin />
      <main className="admin-dashboard-main">
        <header className="admin-dashboard-header">
          <h1>Bảng điều khiển Admin</h1>
          <p>Chào mừng trở lại, {user.name}! Đây là tổng quan về hệ thống Rentzy.</p>
        </header>

        {/* Thống kê nhanh */}
        <section className="admin-dashboard-stats">
          <StatCard
            title="Tổng người dùng"
            value={formatNumber(dashboardData?.userStats?.total || 0)}
            icon="👥"
            color="#1e40af"
            bg="#dbeafe"
            sub="Hoạt động"
          />
          <StatCard
            title="Tổng xe"
            value={formatNumber(dashboardData?.vehicleStats?.total || 0)}
            icon="🚗"
            color="#065f46"
            bg="#d1fae5"
            sub={`${formatNumber(dashboardData?.vehicleStats?.available || 0)} khả dụng`}
          />
          <StatCard
            title="Tổng đơn thuê"
            value={formatNumber(dashboardData?.bookingStats?.total || 0)}
            icon="📅"
            color="#92400e"
            bg="#fef3c7"
            sub={`${formatNumber(dashboardData?.bookingStats?.completed || 0)} hoàn thành`}
          />
          <StatCard
            title="Doanh thu"
            value={formatCurrency(dashboardData?.transactionStats?.totalRevenue || 0)}
            icon="💰"
            color="#be185d"
            bg="#fce7f3"
            sub="Tổng cộng"
          />
        </section>

        {/* Biểu đồ & Yêu cầu */}
        <section className="admin-dashboard-charts-tables">
          <div className="admin-dashboard-charts">
            <div className="admin-dashboard-chart-card">
              <h3>Thống kê đơn thuê theo tháng</h3>
              <div style={{ width: "100%", height: 300 }}>
                {monthlyChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                      <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" hide />
                      <Tooltip formatter={(value, name) => name === "Doanh thu" ? `${value.toLocaleString()}₫` : value} />
                      <Legend />
                      <Bar yAxisId="left" dataKey="Số đơn" fill="#8884d8" />
                      <Bar yAxisId="right" dataKey="Doanh thu" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div>Chưa có dữ liệu thống kê</div>
                )}
              </div>
            </div>
            <div className="admin-dashboard-chart-card">
              <h3>Yêu cầu chờ duyệt</h3>
              <div className="pending-requests">
                <div>
                  <span>Yêu cầu chủ xe</span>
                  <span className="pending-number">{dashboardData?.pendingRequests?.ownerRequests || 0}</span>
                </div>
                <div>
                  <span>Xác thực GPLX</span>
                  <span className="pending-number">{dashboardData?.pendingRequests?.driverLicenses || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Top bảng */}
          <div className="admin-dashboard-tables">
            <div className="admin-dashboard-table-card">
              <h3>Top 5 xe được thuê nhiều nhất</h3>
              <table>
                <thead>
                  <tr>
                    <th>Xe</th>
                    <th>Chủ xe</th>
                    <th>Số lần thuê</th>
                    <th>Giá/ngày</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.topVehicles?.map((vehicle) => (
                    <tr key={vehicle._id}>
                      <td>
                        <div>
                          <strong>{vehicle.brand} {vehicle.model}</strong>
                          <div className="license-plate">{vehicle.licensePlate}</div>
                        </div>
                      </td>
                      <td>{vehicle.owner?.name}</td>
                      <td><span className="badge completed">{vehicle.rentalCount}</span></td>
                      <td>{formatCurrency(vehicle.pricePerDay)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="admin-dashboard-table-card">
              <h3>Top 5 chủ xe có doanh thu cao nhất</h3>
              <table>
                <thead>
                  <tr>
                    <th>Chủ xe</th>
                    <th>Email</th>
                    <th>Doanh thu</th>
                    <th>Số đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {dashboardData?.topOwners?.map((owner) => (
                    <tr key={owner._id}>
                      <td><strong>{owner.owner?.name}</strong></td>
                      <td>{owner.owner?.email}</td>
                      <td className="revenue">{formatCurrency(owner.totalRevenue)}</td>
                      <td><span className="badge approved">{owner.bookingCount}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

// StatCard component (có thể đặt ở đầu file hoặc tách riêng)
function StatCard({ title, value, icon, color, bg, sub }) {
  return (
    <div className="stat-card" style={{ background: "#fff", borderRadius: 16, boxShadow: "0 2px 8px #0001", padding: 24, flex: 1, minWidth: 200, margin: 8 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 8 }}>
        <div style={{ background: bg, color, borderRadius: "50%", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginRight: 12 }}>
          {icon}
        </div>
        <span style={{ fontWeight: 600, fontSize: 16 }}>{title}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{value}</div>
      <div style={{ color: "#059669", fontWeight: 500 }}>{sub}</div>
    </div>
  );
}

export default AdminDashboard;
