// fe/src/components/SidebarOwner/SidebarOwner.jsx
import React from 'react';
import './SidebarOwner.css';
import { NavLink } from 'react-router-dom';
import { MdOutlineDashboard, MdDirectionsCar, MdCalendarMonth, MdNotifications, MdShowChart, MdLogout, MdAccountCircle } from 'react-icons/md';
import { FaCar, FaClipboardList, FaBell, FaMoneyCheckAlt, FaTimesCircle } from 'react-icons/fa';

// SidebarOwner nhận prop handleLogout
const SidebarOwner = ({ handleLogout }) => {
    return (
        <div className="sidebar">
            <div className="sidebar-header">Bảng điều khiển chủ xe</div>
            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <NavLink
                            to="/ownerpage/overview"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <MdOutlineDashboard />
                            Tổng quan
                        </NavLink>
                    </li>
                    <li className="divider"></li>
                    <li>
                        <NavLink
                            to="/ownerpage/vehicle-management"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <MdDirectionsCar />
                            Quản lý xe
                        </NavLink>
                    </li>
                    <li className="divider"></li>
                    <li>
                        <NavLink
                            to="/ownerpage/booking-management"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <MdCalendarMonth />
                            Quản lý đơn thuê
                        </NavLink>
                    </li>
                    <li className="divider"></li>
                    <li>
                        <NavLink
                            to="/ownerpage/cancel-requests"
                            className={({ isActive }) =>
                                isActive ? 'active' : ''
                            }
                        >
                            <FaTimesCircle style={{ marginRight: 8, fontSize: 18 }} />
                            Duyệt đơn huỷ
                        </NavLink>
                    </li>
                    <li className="divider"></li>
                  
            
                    <li>
                        <NavLink
                            to="/ownerpage/revenue"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <MdShowChart />
                            Doanh thu
                        </NavLink>
                    </li>
                    <li className="divider"></li>
                    <li>
                        <NavLink
                            to="/ownerpage/vehicle-reviews"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <FaClipboardList style={{ marginRight: 8, fontSize: 18 }} />
                            Đánh giá về xe của tôi
                        </NavLink>
                    </li>
                    <li className="divider"></li>
                    <li>
                        <NavLink
                            to="/ownerpage/notifications"
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                        >
                            <MdNotifications />
                            Thông báo
                        </NavLink>
                    </li>
              
                 
                    <li className="divider"></li>
                 
                    <li>
                        <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); handleLogout(e); }}>
                            <MdLogout />
                            Đăng xuất
                        </a>
                    </li>
                    <li className="divider"></li>
                </ul>
            </nav>
        </div>
    );
};

export default SidebarOwner;