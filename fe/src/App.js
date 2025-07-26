// fe/src/App.js
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import OwnerRouteGuard from "./components/OwnerRouteGuard/OwnerRouteGuard"; // Import OwnerRouteGuard
import AdminRouteGuard from "./components/AdminRouteGuard/AdminRouteGuard"; // Import AdminRouteGuard

import RenterRouteGuard from "./components/RenterRouteGuard/RenterRouteGuard";
import UserChatPage from "./pages/profile/myAccount/UserChatPage";

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


// page
import Homepage from "./pages/homepage/Homepage";
import VehiclePage from "./pages/vehiclePage/VehicleListPage";
import Login from "./pages/login/Login";
import Register from "./pages/register/Register";
import VerifyEmail from "./pages/verifyEmail/VerifyEmail";

import ForgotPassword from "./pages/login/ForgotPassword";
import ResetPassword from "./pages/login/ResetPassword";
import ChangePassword from "./pages/changePassword/ChangePassword";
import VehicleDetail from "./pages/vehicles/VehicleDetail"; // Import VehicleDetail
import BookingDetailsPage from "./pages/bookings/BookingDetailsPage"; // Import BookingDetailsPage

import ConsignForm from "./pages/consignForm/ConsignForm";
// profile  owner
import OwnerProfilePage from "./pages/owner/ownerProfilePage/OwnerProfilePage";

// order booking  payment
import OrderConfirmation from "./pages/payment/paymentConfirm/OrderConfirmation";
import PaymentDeposit from "./pages/payment/paymentDeposit/PaymentDeposit";
import PaymentRemaining from "./pages/payment/paymentRemaining/PaymentRemaining";
import ContractPage from "./pages/bookings/ContractPage";

// user
import Profile from "./pages/profile/myAccount/Profile"; // IMPORT: New ProfilePage component
import UserBookings from "./pages/profile/myBookings/UserBookings"; // Import UserBookings

import NotificationPage from "./pages/profile/myNotifications/NotificationPage";
import MyReviews from './pages/profile/myReviews/MyReviews';
import MyTransactions from './pages/profile/myTransactions/MyTransactions';
import FavoritesPage from "./pages/profile/FavoritesPage";

// owner
import OwnerPage from "./pages/owner/OwnerPage";
import VehicleManagement from "./pages/owner/vehiclemanagement/VehicleManagement";
import AddVehicleForm from "./pages/owner/vehiclemanagement/AddVehicleForm";
import OwnerVehicleDetail from "./pages/owner/vehiclemanagement/OwnerVehicleDetail";
import EditVehicleForm from "./pages/owner/vehiclemanagement/EditVehicleForm";

import OwnerNotificationPage from "./pages/owner/ownerNotifications/OwnerNotificationPage";
import OwnerBookingManagement from "./pages/owner/ownerBookings/OwnerBookingManagement";
import OwenerCancelRequest from "./pages/owner/ownerBookings/OwnerCancelRequests";
import OwnerBookingDetail from "./pages/owner/bookingDetail/BookingDetailOwner";
import RevenuePage from "./pages/owner/ownerRevenue/RevenuePage";
import OwnerVehicleReviews from "./pages/owner/vehicleReviews/OwnerVehicleReviews";
import OwnerContractPage from './pages/owner/ownerBookings/OwnerContractPage';

// admin
import AdminDashboard from "./pages/admin/adminDashboard/AdminDashboard";
import OwnerRequestsPage from "./pages/admin/adminOwnerRequestsPage/OwnerRequestsPage";
import VehiclesRequestPage from "./pages/admin/adminVehiclesRequestPage/VehiclesRequestPage";

import DriverLicenseRequestsPage from "./pages/admin/adminDriverLicenseRequestsPage/DriverLicenseRequestsPage";

import AdminVehicleDetailPage from './pages/admin/adminAdminVehicleDetailPage/AdminVehicleDetailPage';
// import AdminPayoutRequests from './pages/admin/payoutRequests/AdminPayoutRequests'; // Removed - withdrawals page deleted
import AdminNotificationPage from './pages/admin/adminNotificationPage/AdminNotificationPage';
import AdminPromotionPage from './pages/admin/adminPromotionPage/AdminPromotionPage';
import AdminVehicleReports from './pages/admin/adminVehicleReports/AdminVehicleReports';
import AdminChatPage from "./pages/admin/adminChatPage/AdminChatPage";
import CCCDRequestsPage from './pages/admin/adminCCCDRequestsPage/CCCDRequestsPage';
import UserManagement from './pages/admin/adminManagementUser/UserManagement';

import AllPendingRefunds from './pages/admin/allPendingRefunds/AllPendingRefunds';
import PayoutRequests from './pages/admin/payoutRequests/PayoutRequests';


import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentFailed from "./pages/payment/PaymentFailed";
import IntroductionPage from "./pages/introduction/IntroductionPage";



function App() {
  return (
    <Router>
      <AuthProvider>
        {/* Wrap the application with AuthProvider */}
        <div className="App">
          {/* ToastContainer để hiển thị toast toàn cục */}
          <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover />
          <Routes>
            {/* Profile*/}
            <Route path="/" element={<RenterRouteGuard><Homepage /></RenterRouteGuard>} />
            <Route path="/homepage" element={<Homepage />} />
            <Route path="/vehicles" element={<VehiclePage />} />
            <Route path="/introduction" element={<IntroductionPage />} />
            <Route path="/owner/:ownerId" element={<OwnerProfilePage />} />
            
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            

      {/* Profile*/}
            <Route path="/profile/account" element={<Profile />} />
            <Route path="/profile/favorites" element={<FavoritesPage />} />
            <Route
              path="/profile/my-bookings"
              element={<UserBookings />}
            />{" "}
            {/* New route for user bookings */}
            <Route
              path="/profile/my-notifications"
              element={<NotificationPage />}
            />
            <Route path="/profile/my-reviews" element={<MyReviews />} />
            <Route path="/profile/my-transactions" element={<MyTransactions />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/profile/change-password"
              element={<ChangePassword />}
            />

            <Route path="/vehicles/:id" element={<VehicleDetail />} />{" "}
            {/* Add VehicleDetail route */}
            {/* Add VehicleDetail route */}
            <Route path="/confirm/:bookingId" element={<OrderConfirmation />} />
            <Route path="/payment-deposit/:bookingId" element={<PaymentDeposit />} />
            <Route path="/contracts/:bookingId" element={<ContractPage />} />
            
            <Route path="/bookings/:id" element={<BookingDetailsPage />} /> {/* New route for Booking Details */}
            <Route path="/payment-remaining/:id" element={<PaymentRemaining />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/payment/failed" element={<PaymentFailed />} />
            {/* Add route for OwnerPage */}
            <Route path="/consignForm" element={<ConsignForm />} />
            <Route path="/ownerpage/contract/:bookingId" element={<OwnerContractPage />} />

            {/* admin route */}
            {/* chỉ admin có quyền truy cập */}
            <Route path="/admin" element={<AdminRouteGuard />}>
              <Route index element={<AdminDashboard />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="owner-requests" element={<OwnerRequestsPage />} />
              <Route
                path="vehicle-approvals"
                element={<VehiclesRequestPage />}
              />
              <Route
                path="vehicle-approvals/:id"
                element={<AdminVehicleDetailPage />}
              />

              <Route path="promotions" element={<AdminPromotionPage />} />
              <Route
                path="driver-license-requests"
                element={<DriverLicenseRequestsPage />}
              />
              {/* <Route path="payout-requests" element={<AdminPayoutRequests />} /> */} {/* Removed - withdrawals page deleted */}
              <Route path="notifications" element={<AdminNotificationPage />} />
              <Route path="chat" element={<AdminChatPage />} />
              <Route path="cccd-requests" element={<CCCDRequestsPage />} />
              <Route path="user-management" element={<UserManagement />} />
              <Route path="vehicle-reports" element={<AdminVehicleReports />} />

              <Route path="all-pending-refunds" element={<AllPendingRefunds />} />
              <Route path="payout-requests" element={<PayoutRequests />} />
        

            </Route>
            {/* Route Guard owner  managemnt route */}
            {/*  Chỉ có user đăng kí chủ xe mới dăng nhập được  đăng nhập được */}
            <Route path="/ownerpage" element={<OwnerRouteGuard />}>
              <Route path="overview" element={<OwnerPage />} />
              <Route
                path="vehicle-management"
                element={<VehicleManagement />}
              />
              <Route path="add-vehicle" element={<AddVehicleForm />} />
              <Route path="vehicle/:id" element={<OwnerVehicleDetail />} />
              <Route path="edit-vehicle/:id" element={<EditVehicleForm />} />
              <Route path="notifications" element={<OwnerNotificationPage />} />
              <Route
                path="booking-management"
                element={<OwnerBookingManagement />}
              />
              <Route path="cancel-requests" element={<OwenerCancelRequest />} />
              <Route
                path="booking-detail/:id"
                element={<OwnerBookingDetail />}
              />
              <Route path="revenue" element={<RevenuePage />} />
              <Route path="/ownerpage/vehicle-reviews" element={<OwnerVehicleReviews />} />
            </Route>
            {/* 404 Route - Thêm route cho trang không tìm thấy */}
            {/* 404 Route - Thêm route cho trang không tìm thấy */}
            <Route
              path="*"
              element={
                <div className="not-found">
                  <h1>404 - Page Not Found</h1>
                  <p>The page you are looking for does not exist.</p>
                </div>
              }
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
