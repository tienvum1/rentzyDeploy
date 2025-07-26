const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    createPayment,
    checkPayment,
    handleWebhook,
    verifyMoMoPayment,

    createPayOSLink,
    handlePayOSWebhook,
    createPayOSLinkForRemaining
} = require('../controller/paymentController');

// MoMo Payment Routes
router.post('/momo/create', protect, createPayment);
router.get('/momo/check-payment', checkPayment);
router.post('/momo/webhook', handleWebhook);
router.post('/momo/verify', protect, verifyMoMoPayment);



// PayOS Payment Route
router.post('/payos/link', protect, createPayOSLink);
// PayOS Remaining Payment Route
router.post('/payos/remaining-link', protect, createPayOSLinkForRemaining);
// PayOS Webhook Route
router.post('/payos/webhook', handlePayOSWebhook);

module.exports = router;