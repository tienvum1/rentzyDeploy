import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './DriverLicenseRequestsPage.css';
import SidebarAdmin from '../../../components/SidebarAdmin/SidebarAdmin'; // Import sidebar

const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999';

const DriverLicenseRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalImage, setModalImage] = useState(null);

    const fetchRequests = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${backendUrl}/api/admin/driver-license-requests`, {
                withCredentials: true,
            });
            // Backend is returning an array directly, not an object with a `data` property. Let's stick to that for now.
            // If you refactor the backend to return { success: true, data: [...] }, update this line.
            setRequests(response.data); 
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Không thể tải danh sách yêu cầu.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleUpdateStatus = async (userId, status) => {
        try {
            await axios.put(`${backendUrl}/api/admin/driver-license-status/${userId}`, { status }, {
                withCredentials: true,
            });
            alert(`Yêu cầu đã được ${status === 'verified' ? 'chấp thuận' : 'từ chối'}.`);
            // Refresh the list after update
            fetchRequests();
        } catch (err) {
            alert('Cập nhật trạng thái thất bại.');
            console.error(err);
        }
    };

    const closeModal = () => setModalImage(null);

    const renderContent = () => {
        if (isLoading) {
            return <p>Đang tải...</p>;
        }

        if (error) {
            return <p className="error-message">Lỗi: {error}</p>;
        }

        if (requests.length === 0) {
            return (
                <div className="no-requests-message-container">
                    <p>Không có yêu cầu nào đang chờ duyệt.</p>
                </div>
            );
        }

        return (
            <table className="dlr-table">
                <thead>
                    <tr>
                        <th>Họ và Tên</th>
                        <th>Email</th>
                        <th>Số GPLX</th>
                        <th>Ngày Sinh</th>
                        <th>Ảnh GPLX</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {requests.map((req) => (
                        <tr key={req._id}>
                            <td>{req.driver_license_full_name}</td>
                            <td>{req.email}</td>
                            <td>{req.driver_license_number}</td>
                            <td>{new Date(req.driver_license_birth_date).toLocaleDateString('vi-VN')}</td>
                            <td>
                                {req.driver_license_image ? (
                                    <img 
                                        src={req.driver_license_image} 
                                        alt="GPLX" 
                                        className="dlr-thumbnail" 
                                        onClick={() => setModalImage(req.driver_license_image)}
                                    />
                                ) : (
                                    'Không có ảnh'
                                )}
                            </td>
                            <td>
                                <div className="dlr-actions">
                                    <button onClick={() => handleUpdateStatus(req._id, 'verified')} className="dlr-btn approve">
                                        Chấp Thuận
                                    </button>
                                    <button onClick={() => handleUpdateStatus(req._id, 'rejected')} className="dlr-btn reject">
                                        Từ Chối
                                    </button>
                                </div>
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
                <div className="dlr-inner-content">
                    <h2>Yêu cầu Duyệt Giấy Phép Lái Xe</h2>
                    {renderContent()}
                </div>
            </div>

            {modalImage && (
                <div className="modal-backdrop" onClick={closeModal}>
                    <img src={modalImage} alt="Xem trước GPLX" className="modal-image" />
                </div>
            )}
        </div>
    );
};

export default DriverLicenseRequestsPage; 