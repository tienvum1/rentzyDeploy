const Promotion = require('../models/Promotion');

// Kiểm tra mã khuyến mãi
// Body: { code, orderValue }
exports.checkPromotion = async (req, res) => {
  try {
    const { code, orderValue } = req.body;
    if (!code || !orderValue) {
      return res.status(400).json({ success: false, message: 'Thiếu thông tin kiểm tra mã.' });
    }
    const promo = await Promotion.findOne({ code: code.trim().toUpperCase() });
    if (!promo) {
      return res.status(404).json({ success: false, message: 'Mã khuyến mãi không tồn tại.' });
    }
    if (promo.quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Mã khuyến mãi đã hết lượt sử dụng.' });
    }
    const now = new Date();
    if (now < promo.validFrom || now > promo.validTo) {
      return res.status(400).json({ success: false, message: 'Mã khuyến mãi không còn hiệu lực.' });
    }
    if (orderValue < promo.minOrderValue) {
      return res.status(400).json({ success: false, message: `Đơn hàng phải từ ${promo.minOrderValue.toLocaleString()}đ mới được áp dụng mã này.` });
    }
    // Tính số tiền giảm
    let discount = Math.floor(orderValue * promo.discountPercent / 100);
    if (discount > promo.maxDiscount) discount = promo.maxDiscount;
    return res.status(200).json({
      success: true,
      message: 'Áp dụng mã thành công!',
      promotion: {
        code: promo.code,
        description: promo.description,
        discountPercent: promo.discountPercent,
        maxDiscount: promo.maxDiscount,
        minOrderValue: promo.minOrderValue,
        validFrom: promo.validFrom,
        validTo: promo.validTo,
        quantity: promo.quantity
      },
      discountAmount: discount
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi kiểm tra mã khuyến mãi.', error: error.message });
  }
};

// Tạo mã khuyến mãi mới (admin)
exports.createPromotion = async (req, res) => {
  try {
    const {
      code, description, discountPercent, maxDiscount, minOrderValue,
      rentalStart, rentalEnd, validFrom, validTo, quantity
    } = req.body;
    if (!code || !description || !discountPercent || !maxDiscount || !minOrderValue || !rentalStart || !rentalEnd || !validFrom || !validTo || !quantity) {
      return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ thông tin.' });
    }
    const exist = await Promotion.findOne({ code: code.trim().toUpperCase() });
    if (exist) {
      return res.status(400).json({ success: false, message: 'Mã khuyến mãi đã tồn tại.' });
    }
    const promo = await Promotion.create({
      code: code.trim().toUpperCase(),
      description,
      discountPercent,
      maxDiscount,
      minOrderValue,
      rentalStart,
      rentalEnd,
      validFrom,
      validTo,
      quantity
    });
    res.status(201).json({ success: true, message: 'Tạo mã thành công!', promotion: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi tạo mã khuyến mãi.', error: error.message });
  }
};

// Lấy tất cả mã khuyến mãi (admin)
exports.getAllPromotions = async (req, res) => {
  try {
    const promos = await Promotion.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, promotions: promos });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy danh sách mã.', error: error.message });
  }
};

// Lấy chi tiết 1 mã khuyến mãi (admin)
exports.getPromotionById = async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Không tìm thấy mã.' });
    res.status(200).json({ success: true, promotion: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi lấy chi tiết mã.', error: error.message });
  }
};

// Cập nhật mã khuyến mãi (admin)
exports.updatePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findById(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Không tìm thấy mã.' });
    const fields = [
      'description', 'discountPercent', 'maxDiscount', 'minOrderValue',
      'rentalStart', 'rentalEnd', 'validFrom', 'validTo', 'quantity'
    ];
    fields.forEach(f => { if (req.body[f] !== undefined) promo[f] = req.body[f]; });
    await promo.save();
    res.status(200).json({ success: true, message: 'Cập nhật thành công!', promotion: promo });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi cập nhật mã.', error: error.message });
  }
};

// Xoá mã khuyến mãi (admin)
exports.deletePromotion = async (req, res) => {
  try {
    const promo = await Promotion.findByIdAndDelete(req.params.id);
    if (!promo) return res.status(404).json({ success: false, message: 'Không tìm thấy mã.' });
    res.status(200).json({ success: true, message: 'Đã xoá mã thành công.' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi xoá mã.', error: error.message });
  }
}; 