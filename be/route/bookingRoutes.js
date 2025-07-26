// be/routes/bookingRoutes.js
const express = require('express');
const router = express.Router();
const { protect, verifyRenterRequirements, adminOnly } = require('../middleware/authMiddleware');
const { getVehicleBookedDates,getBookingByIdForOwner, createBooking, getBookingDetails, cancelExpiredBooking, cancelBookingByFrontend, getUserBookings, getAllBookingOfSpecificUser, getFilteredBookingsOfUser, getAllModelOfVehicle, getAllStatusOfBooking, cancelBookingByUser, requestCancelBooking, renterCancelBooking, ownerApproveCancel, ownerRejectCancel, confirmHandover, confirmReturn, uploadPreDeliveryImages, uploadPostDeliveryImages, reviewBooking ,getOwnerReviews, getBookingContract, getExpectedDepositRefund, recalculateBookingRefund, getMyBookingReviews, saveBookingSignature} = require('../controller/bookingController');
const upload = require('../middleware/upload');

// Public routes
router.get('/vehicle/:vehicleId/dates', getVehicleBookedDates);

// Lấy chi tiết đơn thuê cho chủ xe
router.get('/getBookingById/:id', protect, getBookingByIdForOwner);

// Routes cho người dùng thông thường
router.get('/my-bookings', protect, getUserBookings);
router.post('/createBooking', protect, verifyRenterRequirements, createBooking);
router.get('/:id', protect, getBookingDetails);
router.get('/contract/:id', protect, getBookingContract);

// huỷ đơn thuê
router.post('/:id/cancel-expired', protect, cancelBookingByFrontend);

// huỷ đơn thue
router.get('/:id/expected-refund',protect , getExpectedDepositRefund); // Route: Tính toán hoàn tiền cọc dự kiến
router.post('/:id/recalculate-refund', protect, recalculateBookingRefund); // Route: Tính lại tiền hoàn cho booking đã tồn tại
router.post('/:id/request-cancel', protect, requestCancelBooking); // gửi yêu cầu
router.post('/:id/renter-cancel', protect, renterCancelBooking); // renter hủy chuyến trực tiếp 

// approve đơn thuê
router.post('/:id/owner-approve-cancel', protect, ownerApproveCancel);
router.post('/:id/owner-reject-cancel', protect, ownerRejectCancel);


// Xác nhận giao xe
router.post('/:id/confirm-handover', protect, confirmHandover);
// Xác nhận trả xe
router.post('/:id/confirm-return', protect, confirmReturn);

// Upload ảnh trước khi nhận/giao xe
router.post('/:id/upload-pre-delivery-images', upload.array('images', 5), protect, uploadPreDeliveryImages);
// Upload ảnh sau khi nhận lại xe
router.post('/:id/upload-post-delivery-images', upload.array('images', 5), protect, uploadPostDeliveryImages);

// Đánh giá booking
router.post('/:id/review', protect, reviewBooking);
router.get('/:ownerId/reviews', getOwnerReviews);

// Lấy tất cả review của user 
router.get('/user/my-reviews', protect, getMyBookingReviews);

// Save signature for booking
router.post('/:id/signature', protect, saveBookingSignature);

// route for get all bookings of specific user : 
router.post('/a/get-filter-bookings', protect, getFilteredBookingsOfUser )
// router for get all models 
router.get("/a/get-all-models", protect, getAllModelOfVehicle)
// router for get all status bookings of specific user 
router.get('/a/get-all-status-of-booking-for-user', protect, getAllStatusOfBooking);
router.get('/get-all-bookings', protect, getAllBookingOfSpecificUser)

// Xoá booking (chỉ cho phép renter hoặc admin)
router.delete('/:id', protect, require('../controller/bookingController').deleteBookingByUser);

// Thêm import
const { 
  cancelPendingBooking 
} = require('../controller/bookingController');

// Thêm route mới
router.post('/:id/cancel-pending', protect, cancelPendingBooking);

module.exports = router;
