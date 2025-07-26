const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { protect } = require('../middleware/authMiddleware');
const ownerController = require('../controller/ownerController');
const { getOwnerCancelRequests } = require('../controller/ownerController');
const { getOwnerRevenue } = require('../controller/ownerController');
const reviewController = require('../controller/reviewController');

// Simple middleware to check if user is admin
const checkAdmin = (req, res, next) => {
    // Assuming user info (including roles) is attached to req.user by protect middleware
    if (req.user && req.user.role && req.user.role.includes('admin')) {
        next(); // User is admin, proceed
    } else {
        res.status(403).json({ message: 'Admin access required.' }); // Not authorized
    }
};

router.put(
  '/registerOwner',
  protect,
  upload.fields([
    { name: 'cccd_front_image', maxCount: 1 },
    { name: 'cccd_back_image', maxCount: 1 },
  ]),
  ownerController.becomeOwner
);


// Lấy tất cả đơn thuê của chủ xe hiện tại
router.get('/owner-bookings', protect, ownerController.getOwnerBookings);
router.get('/cancel-requests', protect, getOwnerCancelRequests);
// doanh thu của owner
router.get('/revenue', protect, getOwnerRevenue);

// Thống kê số lượng xe theo tháng cho owner
router.get('/vehicle-stats-by-month', protect, ownerController.getOwnerVehicleStatsByMonth);
// Thống kê số lượng đơn thuê theo tháng cho owner
router.get('/booking-stats-by-month', protect, ownerController.getOwnerBookingStatsByMonth);

// Lấy đánh giá về xe của owner
router.get('/vehicle-reviews', protect, reviewController.getOwnerVehicleReviews);

// Owner cancel booking and request compensation
router.post('/cancel-booking/:id', protect, require('../controller/bookingController').ownerCancelBooking);

module.exports = router;
