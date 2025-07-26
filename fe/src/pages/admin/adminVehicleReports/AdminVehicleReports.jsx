import React, { useEffect, useState } from 'react';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import './AdminVehicleReports.css';
const REASON_LABELS = {
  fake_info: 'Xe không đúng thực tế',
  illegal: 'Xe vi phạm pháp luật',
  bad_owner: 'Chủ xe không hợp tác',
  dangerous: 'Xe nguy hiểm/không an toàn',
  other: 'Khác',
};

const AdminVehicleReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {

      const res = await axios.get('/api/report/vehicle-reports', {
        withCredentials: true
      });
      setReports(res.data.reports || []);
    } catch (err) {
      setError('Không thể tải danh sách báo cáo.');
    }
    setLoading(false);
  };

  return (
    <div className="admin-dashboard-layout">
      <SidebarAdmin />
      <div className="admin-dashboard-content">
        <h2 style={{ textAlign: 'center', marginBottom: 24 }}>Quản lý báo cáo xe</h2>
        {loading ? (
          <div>Đang tải...</div>
        ) : error ? (
          <div style={{ color: 'red', textAlign: 'center' }}>{error}</div>
        ) : reports.length === 0 ? (
          <div style={{ textAlign: 'center' }}>Chưa có báo cáo nào.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Xe</th>
                  <th>Biển số</th>
                  <th>Người báo cáo</th>
                  <th>Email</th>
                  <th>Lý do</th>
                  <th>Nội dung</th>
                  <th>Ngày gửi</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r._id}>
                    <td>{r.vehicle ? `${r.vehicle.brand} ${r.vehicle.model}` : 'N/A'}</td>
                    <td>{r.vehicle?.licensePlate || 'N/A'}</td>
                    <td>{r.user?.name || 'N/A'}</td>
                    <td>{r.user?.email || 'N/A'}</td>
                    <td>{REASON_LABELS[r.reason] || r.reason}</td>
                    <td>{r.message || '-'}</td>
                    <td>{new Date(r.createdAt).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVehicleReports; 