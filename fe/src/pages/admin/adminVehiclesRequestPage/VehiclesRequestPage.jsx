import React, { useState, useEffect } from 'react';
import './VehiclesRequestPage.css';
import axios from 'axios';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';
const adminApi = `${backendUrl}/api/admin`;

const VehiclesRequestPage = () => {
    const [pendingVehicles, setPendingVehicles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState({});
    const [rejectionReason, setRejectionReason] = useState({});
    const [modalOpen, setModalOpen] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState(null);
    const [modalVehicle, setModalVehicle] = useState(null);

    const navigate = useNavigate();

    // Fetch pending vehicles
    const fetchPendingVehicleApprovals = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${adminApi}/vehicle-approvals`, {
                withCredentials: true,
            });
            setPendingVehicles(response.data.vehicles);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu duyệt xe.');
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchPendingVehicleApprovals();
    }, []);

    const handleReview = async (vehicleId, status) => {
        setActionLoading(prev => ({ ...prev, [vehicleId]: true }));
        setError(null);
        const payload = { status };
        if (status === 'rejected') {
            const reason = rejectionReason[vehicleId] || '';
            payload.rejectionReason = reason;
        }
        try {
            const response = await axios.put(`${adminApi}/vehicle-approvals/${vehicleId}`, payload, { withCredentials: true });
            if (response.status === 200) {
                setPendingVehicles(pendingVehicles.filter(vehicle => vehicle._id !== vehicleId));
                toast.success(response.data.message || 'Thành công!');
            } else {
                toast.error(response.data.message || 'Đã xảy ra lỗi khi duyệt xe.');
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi xử lý yêu cầu duyệt xe!');
        }
        setActionLoading(prev => ({ ...prev, [vehicleId]: false }));
    };

    const handleReasonChange = (vehicleId, value) => {
        setRejectionReason(prev => ({ ...prev, [vehicleId]: value }));
    };

    // Thay openDetailModal bằng navigate
    const handleDetailClick = (vehicleId) => {
        navigate(`/admin/vehicle-approvals/${vehicleId}`);
    };

    // Xóa modal và các state/modal liên quan

    // Render main table
    const renderContent = () => {
        if (loading) return <p>Đang tải danh sách yêu cầu duyệt xe...</p>;
        if (error) return <p className="error-message">Lỗi: {error}</p>;
        if (pendingVehicles.length === 0) return (
            <div className="no-requests-message-container">
                <p>Không có yêu cầu duyệt xe nào.</p>
            </div>
        );
        return (
            <table className="vehicles-table">
                <thead>
                    <tr>
                        <th>Ảnh</th>
                        <th>Thương hiệu</th>
                        <th>Model</th>
                        <th>Biển số</th>
                        <th>Giá/Ngày</th>
                        <th>Chủ xe</th>
                        <th>Trạng thái duyệt</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {pendingVehicles.map((vehicle) => (
                        <tr key={vehicle._id}>
                            <td>
                                {vehicle.primaryImage ? (
                                    <img
                                        src={vehicle.primaryImage}
                                        alt={`Ảnh xe ${vehicle.brand} ${vehicle.model}`}
                                        className="vehicle-thumbnail"
                                    />
                                ) : (
                                    'Không ảnh'
                                )}
                            </td>
                            <td>{vehicle.brand}</td>
                            <td>{vehicle.model}</td>
                            <td>{vehicle.licensePlate}</td>
                            <td>{vehicle.pricePerDay ? parseFloat(vehicle.pricePerDay).toLocaleString() + ' VNĐ' : 'N/A'}</td>
                            <td>{vehicle.owner ? `${vehicle.owner.name} (${vehicle.owner.email})` : 'N/A'}</td>
                            <td>{vehicle.approvalStatus}</td>
                            <td>
                                {actionLoading[vehicle._id] ? (
                                    'Đang xử lý...'
                                ) : (
                                    vehicle.approvalStatus === 'pending' ? (
                                        <>
                                            <button className="btn-action btn-success" onClick={() => handleReview(vehicle._id, 'approved')}>Duyệt</button>
                                            <button className="btn-action btn-danger" onClick={() => handleReview(vehicle._id, 'rejected')}>Từ chối</button>
                                            <input
                                                type="text"
                                                placeholder="Lý do từ chối (nếu có)"
                                                value={rejectionReason[vehicle._id] || ''}
                                                onChange={(e) => handleReasonChange(vehicle._id, e.target.value)}
                                                className="rejection-reason-input"
                                            />
                                            <button className="btn-action btn-detail" onClick={() => handleDetailClick(vehicle._id)}>Chi tiết</button>
                                        </>
                                    ) : (
                                        <>
                                            <p>{vehicle.approvalStatus}</p>
                                            <button className="btn-action btn-detail" onClick={() => handleDetailClick(vehicle._id)}>Chi tiết</button>
                                        </>
                                    )
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };

    return (
        <div className="admin-dashboard-layout">
            <SidebarAdmin />
            <div className="admin-dashboard-content">
                <div className="vehicles-requests-inner-content">
                    <h2>Yêu cầu Duyệt Xe</h2>
                    {renderContent()}
                </div>
            </div>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default VehiclesRequestPage;