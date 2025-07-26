const express = require('express');
const router = express.Router();
const { 
    createPayment, 
    checkPayment, 
    handleWebhook,
    verifyMoMoPayment,
    createRentalPayment,
    checkRentalPayment
} = require('../controller/paymentController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /api/momo/create
// @desc    Tạo yêu cầu thanh toán MoMo
// @access  Private
router.post('/create', protect, createPayment);

// @route   GET /api/momo/check-payment
// @desc    Endpoint callback sau khi người dùng thanh toán MoMo (redirect)
// @access  Public (MoMo gọi trực tiếp)
router.get('/check-payment', checkPayment);

// @route   POST /api/momo/webhook
// @desc    Endpoint Webhook nhận thông báo từ MoMo (IPN)
// @access  Public (MoMo gọi trực tiếp)
router.post('/webhook', handleWebhook);

// @route   POST /api/momo/verify-payment
// @desc    Xác minh thanh toán MoMo
// @access  Private
router.post('/verify-payment', protect, verifyMoMoPayment);

// @route   POST /api/momo/rental-payment
// @desc    Tạo yêu cầu thanh toán MoMo cho thuê
// @access  Private
router.post('/rental-payment', protect, createRentalPayment);

//
// Route for checking rental payment
router.get('/check-rental-payment', checkRentalPayment);

module.exports = router; 