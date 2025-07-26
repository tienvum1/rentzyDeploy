const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const notificationController = require('../controller/notificationController');

// Lấy thông báo của user hiện tại
router.get('/', protect, notificationController.getUserNotifications);

module.exports = router; 