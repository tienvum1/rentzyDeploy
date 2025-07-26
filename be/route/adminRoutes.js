const express = require("express");
const router = express.Router();
const { protect, adminOnly } = require("../middleware/authMiddleware");
const adminController = require("../controller/adminController");
const upload = require('../middleware/upload');


// Route để lấy thống kê tổng quan cho admin dashboard
router.get(
  "/dashboard-stats",
  protect,
  adminOnly,
  adminController.getDashboardStats
);
// duyệt gplx
router.post('/create-driver-license', protect,upload.single('driver_license_image'), adminController.createOrUpdateDriverLicense);
// Route để lấy danh sách các yêu cầu trở thành chủ xe
router.get(
  "/owner-requests",
  protect,
  adminOnly,
  adminController.getOwnerRequests
);
// Route để cập nhật trạng thái yêu cầu của chủ xe
router.put(
  "/owner-requests/:userId",
  protect,
  adminOnly,
  adminController.updateOwnerRequestStatus
);

// Route để lấy danh sách các xe chờ duyệt
router.get(
  "/vehicle-approvals",
  protect,
  adminOnly,
  adminController.getPendingVehicleApprovals
);
// Route để lấy chi tiết xe chờ duyệt
router.get(
  "/vehicle-approvals/:id",
  protect,
  adminOnly,
  adminController.getPendingVehicleDetail
);
// Route để duyệt xe
router.put(
  "/vehicle-approvals/:vehicleId",
  protect,
  adminOnly,
  adminController.reviewVehicleApproval
);

// Route để lấy danh sách các yêu cầu xác thực GPLX
router.get(
  "/driver-license-requests",
  protect,
  adminOnly,
  adminController.getDriverLicenseRequests
);

// Route để cập nhật trạng thái xác thực GPLX
router.put(
  "/driver-license-status/:userId",
  protect,
  adminOnly,
  adminController.updateDriverLicenseStatus
);




// Route để lấy danh sách đơn hủy chờ admin duyệt
router.get('/cancel-requests', protect, adminOnly, adminController.getPendingCancelRequests);
// Route để admin duyệt hủy đơn và tạo refund request
router.post('/approve-cancel/:id', protect, adminOnly, require('../controller/bookingController').adminApproveCancel);

// Route để lấy tất cả các yêu cầu pending (cả renter và owner)
router.get('/all-pending-refunds', protect, adminOnly, adminController.getAllPendingRefundRequests);

// Routes cho approve refund và owner compensation
router.post('/approve-refund/:bookingId', protect, adminOnly, adminController.approveRefund);
router.post('/approve-owner-compensation/:bookingId', protect, adminOnly, adminController.approveOwnerCompensation);

// Routes cho quản lý giải ngân cho chủ xe
router.get('/payout-requests', protect, adminOnly, adminController.getPendingPayoutRequests);
router.post('/approve-payout/:bookingId', protect, adminOnly, adminController.approvePayoutRequest);



router.get('/cccd-requests', protect, adminOnly, adminController.getPendingCCCDRequests);
router.put('/cccd-status/:userId', protect, adminOnly, adminController.updateCCCDStatus);

// Routes cho quản lý người dùng
router.get('/users', protect, adminOnly, adminController.getAllUsers);
router.get('/users/:userId', protect, adminOnly, adminController.getUserDetail);
router.put('/users/:userId/block', protect, adminOnly, adminController.blockUser);

module.exports = router;
