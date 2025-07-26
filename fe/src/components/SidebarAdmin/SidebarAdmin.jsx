import React from "react";
import { useNavigate } from "react-router-dom";
import "./SidebarAdmin.css";
import { Link } from 'react-router-dom';

const SidebarAdmin = () => {


    const navigate = useNavigate();

    const handleMenuItemClick = (path) => {
        navigate(path);
    };

    return (
        <div className="sidebar-admin">
            <div className="sidebar-header">
                <h3>Admin Dashboard</h3>
            </div>
            <ul className="sidebar-menu">
                {/* Dashboard overview */}
                <li onClick={() => handleMenuItemClick('/admin')}>Dashboard</li>

                {/* User management */}
                <li onClick={() => handleMenuItemClick('/admin/user-management')}>Quản lý người dùng</li>

                {/* Driver License Requests */}
                <li onClick={() => handleMenuItemClick('/admin/driver-license-requests')}>Duyệt GPLX</li>

                <li onClick={() => handleMenuItemClick('/admin/cccd-requests')}>Duyệt CCCD</li>
                {/* Owner Requests */}
                <li onClick={() => handleMenuItemClick('/admin/owner-requests')}>Duyệt chủ xe</li>

                {/* Vehicle Approvals */}
                <li onClick={() => handleMenuItemClick('/admin/vehicle-approvals')}>Duyệt xe</li>

                {/* Payout Requests */}
                <li onClick={() => handleMenuItemClick('/admin/payout-requests')}>Duyệt giải ngân</li>

                {/* All Pending Refunds */}
                <li onClick={() => handleMenuItemClick('/admin/all-pending-refunds')}>Quản lý yêu cầu chuyển tiền</li>




        
        <li onClick={() => handleMenuItemClick('/admin/vehicle-reports')}>Quản lý báo cáo</li>
    

{/* Admin Chat */}
        <li onClick={() => handleMenuItemClick("/admin/chat")}>Admin Chat</li>
              

                {/* Notifications */}
                <li onClick={() => handleMenuItemClick('/admin/notifications')}>Thông báo</li>

                {/* Add more admin tags as needed for your project */}
                {/* Example: Transaction Management, Reports, etc. */}
                {/* <li onClick={() => handleMenuItemClick('/admin/transactions')}>Quản lý giao dịch</li> */}
                {/* <li onClick={() => handleMenuItemClick('/admin/reports')}>Báo cáo thống kê</li> */}
                                {/* Withdrawals Management */}
                <li onClick={() => handleMenuItemClick('/admin/promotions')}>Quản lý mã khuyến mãi</li>
            </ul>
        </div>
    );

};

export default SidebarAdmin;
