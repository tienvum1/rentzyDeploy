import React, { useState, useEffect } from 'react';
import './VehicleManagement.css'
import axios from 'axios';
import SidebarOwner from '../../../components/SidebarOwner/SidebarOwner';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const VehicleManagement = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false); // Add loading state
    const [message, setMessage] = useState(null); // Add message state (success/error)
    const [ownerVehicles, setOwnerVehicles] = useState([]); // State to store the list of owner vehicles
    const [error, setError] = useState(null); // State to store fetch errors for owner vehicles
    const [searchTerm, setSearchTerm] = useState(''); // State for search
    const [currentPage, setCurrentPage] = useState(1); // State for pagination
    const [totalPages, setTotalPages] = useState(1); // State for total pages
    const [totalVehicles, setTotalVehicles] = useState(0); // State for total vehicles count
    const [sortBy, setSortBy] = useState(''); // State for sorting
    const [sortOrder, setSortOrder] = useState('desc'); // State for sort order (asc/desc)
    const vehiclesPerPage = 10; // Number of vehicles per page
    const backendUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:4999'; // Cung cấp giá trị default

    // Function to fetch danh sách xe từ backend với phân trang, tìm kiếm và sắp xếp
    const fetchOwnerVehicles = async (page = 1, search = '', sort = '', order = 'desc') => {
        setLoading(true);
        setError(null); // Reset lỗi trước khi fetch mới
        try {
            const params = {
                page: page,
                limit: vehiclesPerPage,
                search: search,
                sortBy: sort,
                sortOrder: order
            };
            
            const response = await axios.get(`${backendUrl}/api/vehicles/owner`, {
                params,
                withCredentials: true, // Quan trọng để gửi cookie chứa token xác thực
            });
            
            console.log('Fetched owner vehicles:', response.data);
            setOwnerVehicles(response.data.vehicles);
            setTotalPages(response.data.totalPages);
            setTotalVehicles(response.data.totalVehicles);
            setCurrentPage(response.data.currentPage);
        } catch (err) {
            console.error('Error fetching owner vehicles:', err);
            setError('Không thể tải danh sách xe của bạn.'); // Thông báo lỗi thân thiện với người dùng
             if (err.response && err.response.data && err.response.data.message) {
                setError(`Không thể tải danh sách xe của bạn: ${err.response.data.message}`);
             }
        } finally {
            setLoading(false);
        }
    };

    // Fetch owner vehicles when the component mounts or when page/search/sort changes
    useEffect(() => {
        fetchOwnerVehicles(currentPage, searchTerm, sortBy, sortOrder);
    }, [currentPage, sortBy, sortOrder]); // Re-fetch when page, sort or order changes

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
        fetchOwnerVehicles(1, value, sortBy, sortOrder);
    };

    // Handle sort
    const handleSort = (field) => {
        const newOrder = sortBy === field && sortOrder === 'desc' ? 'asc' : 'desc';
        setSortBy(field);
        setSortOrder(newOrder);
        setCurrentPage(1); // Reset to first page when sorting
    };

    // Handle page change
    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Generate pagination buttons
    const renderPagination = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
        
        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        if (currentPage > 1) {
            pages.push(
                <button key="prev" onClick={() => handlePageChange(currentPage - 1)} className="pagination-btn">
                    « Trước
                </button>
            );
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`pagination-btn ${i === currentPage ? 'active' : ''}`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        if (currentPage < totalPages) {
            pages.push(
                <button key="next" onClick={() => handlePageChange(currentPage + 1)} className="pagination-btn">
                    Sau »
                </button>
            );
        }

        return pages;
    };

    // Placeholder function for handling edit action
    const handleEdit = async (vehicleId) => {
        console.log('Edit vehicle with ID:', vehicleId);
        // Use navigate to go to the edit page
        navigate(`/ownerpage/edit-vehicle/${vehicleId}`);
    };

    // Thêm hàm chuyển sang trang chi tiết xe
    const handleViewDetail = (vehicleId) => {
        navigate(`/ownerpage/vehicle/${vehicleId}`);
    };

    // Effect to automatically hide messages after a delay
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => {
                setMessage(null);
            }, 3000); // Hide after 3 seconds (3000 milliseconds)

            // Clean up the timer if the component unmounts or message changes
            return () => clearTimeout(timer);
        }
    }, [message]); // Rerun effect when message changes

    // Placeholder for navigation to add car page
    const handleNavigateToAddCar = () => {
        navigate('/ownerpage/add-vehicle'); // Use navigate
        // setMessage({ type: 'info', text: 'Navigate to Add Car page' }); // Remove placeholder message
    };

    const handleToggleLock = async (vehicleId, newStatus) => {
        if (window.confirm(`Bạn có chắc chắn muốn ${newStatus === "blocked" ? "khoá" : "mở khoá"} xe này?`)) {
            try {
                setLoading(true);
                const apiUrl = `${backendUrl}/api/vehicles/${vehicleId}/status`;
                const response = await axios.put(apiUrl, { status: newStatus }, { withCredentials: true });
                toast.success(response.data.message || 'Cập nhật trạng thái xe thành công!');
                fetchOwnerVehicles();
            } catch (error) {
                toast.error(error.response?.data?.message || 'Không thể cập nhật trạng thái xe.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="vehicle-management-container">
            <SidebarOwner />
            {/* SidebarOwner không ở đây. Nó nằm trong OwnerPage và hiển thị cố định. */}
            {/* Nội dung của VehicleManagement được hiển thị bên cạnh sidebar. */}
            <div className="vehicle-management-content">
                <h2>Quản lý xe của bạn</h2>
                {error && <p className="error">{error}</p>}
                
                <div className="vehicle-management-header">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên xe, biển số..."
                            value={searchTerm}
                            onChange={handleSearch}
                            className="search-input"
                        />
                    </div>
                    <div className="sort-container">
                        <select 
                            value={sortBy} 
                            onChange={(e) => {
                                const value = e.target.value;
                                if (value) {
                                    handleSort(value);
                                } else {
                                    setSortBy('');
                                    setSortOrder('desc');
                                    setCurrentPage(1);
                                }
                            }}
                            className="sort-select"
                        >
                            <option value="">Sắp xếp theo</option>
                            <option value="rentalCount">Lượt thuê</option>
                            <option value="pricePerDay">Giá thuê</option>
                            <option value="createdAt">Ngày tạo</option>
                        </select>
                        {sortBy && (
                            <button 
                                onClick={() => handleSort(sortBy)}
                                className="sort-order-btn"
                                title={`Sắp xếp ${sortOrder === 'asc' ? 'tăng dần' : 'giảm dần'}`}
                            >
                                {sortOrder === 'asc' ? '↑' : '↓'}
                            </button>
                        )}
                    </div>
                    <div className="add-buttons">
                        <button className="btn-add-car" onClick={handleNavigateToAddCar}>+ Thêm xe mới</button>
                    </div>
                </div>
                
                <div className="vehicle-stats">
                    <p>Tổng số xe: <strong>{totalVehicles}</strong></p>
                </div>
                
                {loading && <p>Đang tải danh sách xe...</p>}
                {!loading && ownerVehicles.length === 0 && !error && (
                    <p>{searchTerm ? 'Không tìm thấy xe nào phù hợp.' : 'Bạn chưa có xe nào được đăng.'}</p>
                )}
                {!loading && ownerVehicles.length > 0 && (
                    <>
                        <table className="vehicle-table">
                            <thead>
                                <tr>
                                    <th>Ảnh</th>
                                    <th>Xe</th>
                                    <th>Biển số</th>
                                    <th>Giá/Ngày</th>
                                    <th>Lượt thuê</th>
                                    <th>Trạng thái</th>
                                    <th>Duyệt</th>
                                    <th>Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {ownerVehicles.map(vehicle => (
                                    <tr key={vehicle._id}>
                                        <td>
                                            {vehicle.primaryImage ? (
                                                <img src={vehicle.primaryImage} alt={`${vehicle.brand} ${vehicle.model}`} style={{ width: '80px', height: 'auto', borderRadius: '4px' }} />
                                            ) : (
                                                <span>No Image</span>
                                            )}
                                        </td>
                                        <td>
                                            <strong>{vehicle.brand} {vehicle.model}</strong>
                                        </td>
                                        <td>{vehicle.licensePlate}</td>
                                        <td>{vehicle.pricePerDay?.toLocaleString()} VND</td>
                                        <td>
                                            <span className="rental-count">{vehicle.rentalCount || 0} lượt</span>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${vehicle.status}`}>
                                                {vehicle.status === 'available' ? 'Có sẵn' : 'Bị khóa'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`approval-badge ${vehicle.approvalStatus}`}>
                                                {vehicle.approvalStatus === 'approved' ? 'Đã duyệt' : 
                                                 vehicle.approvalStatus === 'pending' ? 'Chờ duyệt' : 'Từ chối'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button className="detail-button" onClick={() => handleViewDetail(vehicle._id)}>Chi tiết</button>
                                                <button className="edit-button" onClick={() => handleEdit(vehicle._id)}>Sửa</button>
                                                {vehicle.status === "blocked" ? (
                                                    <button className="unlock-button" onClick={() => handleToggleLock(vehicle._id, "available")}>Mở khóa</button>
                                                ) : (
                                                    <button className="lock-button" onClick={() => handleToggleLock(vehicle._id, "blocked")}>Khóa</button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="pagination-container">
                                <div className="pagination-info">
                                    Hiển thị {((currentPage - 1) * vehiclesPerPage) + 1} - {Math.min(currentPage * vehiclesPerPage, totalVehicles)} của {totalVehicles} xe
                                </div>
                                <div className="pagination">
                                    {renderPagination()}
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
            <ToastContainer position="top-right" autoClose={2500} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
        </div>
    );
};

export default VehicleManagement;