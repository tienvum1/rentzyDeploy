// fe/src/pages/owner/ownerpage.jsx
import React, { useState } from "react";
import "./OwnerPage.css";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

import SidebarOwner from "../../components/SidebarOwner/SidebarOwner";

// Import các component nội dung cho từng mục menu (bạn cần đảm bảo các file này tồn tại)
import VehicleManagement from "./vehiclemanagement/VehicleManagement";
import NotificationPage from "../profile/myNotifications/NotificationPage";
import OwnerCancelRequests from "./ownerBookings/OwnerCancelRequests";
import OwnerOverview from "./ownerOverview/ownerOverview";
// Import các component nội dung thực tế của bạn
// import OverviewContent from './OverviewContent';
// import BookingManagement from '../bookingmanagement/BookingManagement';
// import NotificationPage from '../notification/NotificationPage';
// import RevenuePage from '../revenue/RevenuePage';

// Định nghĩa các component placeholder nếu chưa có file thật
// const OverviewContent = () => (
//   <>
//     <h1>Welcome to your Owner Dashboard</h1>
//     <p>Select an option from the sidebar to manage your properties.</p>
//   </>
// );
const BookingManagement = () => (
  <div>Booking Management Content (Placeholder)</div>
);
// const NotificationPage = () => <div>Notification Content (Placeholder)</div>;
const RevenuePage = () => <div>Revenue Content (Placeholder)</div>;

// Tạo một object ánh xạ tên menu item với component tương ứng
const contentComponents = {
  overview: OwnerOverview, // Sử dụng component OwnerOverview thực tế
  "vehicle-management": VehicleManagement,
  "booking-management": BookingManagement, // Sử dụng component BookingManagement thực tế khi có
  notification: NotificationPage, // Sử dụng component NotificationPage thực tế
  revenue: RevenuePage, // Sử dụng component RevenuePage thực tế khi có
  "cancel-requests": OwnerCancelRequests, // Sử dụng component OwnerCancelRequests thực tế khi có
};

const OwnerPage = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  // activeMenuItem state vẫn ở đây để quản lý nội dung nào sẽ hiển thị trong main-content
  const [activeMenuItem, setActiveMenuItem] = useState("overview");

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    navigate("/");
  };

  // Hàm này không còn switch statement, chỉ tìm và trả về component từ map
  const renderContent = () => {
    // Lấy component tương ứng từ object contentComponents dựa trên activeMenuItem
    const ContentComponent = contentComponents[activeMenuItem];

    // Kiểm tra xem có tìm thấy component không trước khi render
    if (ContentComponent) {
      // Render component tìm được
      return <ContentComponent />;
    } else {
      // Trả về nội dung mặc định hoặc thông báo lỗi nếu activeMenuItem không khớp
      return (
        <>
          <h1>Content Not Found</h1>
          <p>The requested content could not be displayed.</p>
        </>
      );
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sử dụng component SidebarOwner đã tách biệt */}
      {/* Truyền state activeMenuItem và hàm cập nhật state (setActiveMenuItem) xuống làm prop */}
      {/* Truyền cả hàm handleLogout xuống */}
      <SidebarOwner
        activeMenuItem={activeMenuItem}
        onMenuItemClick={setActiveMenuItem}
        handleLogout={handleLogout}
      />

      <div className="main-content">
        {/* Hiển thị nội dung tương ứng với item được chọn bằng cách gọi renderContent */}
        {renderContent()}
      </div>
    </div>
  );
};

export default OwnerPage;
