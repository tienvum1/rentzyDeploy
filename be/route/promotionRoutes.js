const express = require('express');
const router = express.Router();
const promotionController = require('../controller/promotionController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Kiểm tra mã khuyến mãi (ai cũng dùng)
router.post('/check', promotionController.checkPromotion);

// CRUD cho admin
router.get('/', protect, adminOnly, promotionController.getAllPromotions);
router.get('/:id', protect, adminOnly, promotionController.getPromotionById);
router.post('/', protect, adminOnly, promotionController.createPromotion);
router.put('/:id', protect, adminOnly, promotionController.updatePromotion);
router.delete('/:id', protect, adminOnly, promotionController.deletePromotion);

module.exports = router; 