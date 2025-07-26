const express = require('express');
const router = express.Router();
const reportController = require('../controller/reportController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// User gửi báo cáo xe
router.post('/vehicles/:id/report', protect, reportController.reportVehicle);

// Admin xem tất cả báo cáo xe
router.get('/vehicle-reports', protect, adminOnly, reportController.getAllVehicleReports);

// Admin xem báo cáo của 1 xe
router.get('/vehicles/:id/reports', protect, adminOnly, reportController.getReportsByVehicle);

module.exports = router; 