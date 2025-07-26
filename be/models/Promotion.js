const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
  // Mã khuyến mãi, duy nhất
  code: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  // Mô tả chi tiết chương trình khuyến mãi
  description: {
    type: String,
    required: true
  },
  // Phần trăm giảm giá (ví dụ: 10 cho 10%)
  discountPercent: {
    type: Number,
    required: true
  },
  // Số tiền giảm tối đa (đơn vị: VNĐ)
  maxDiscount: {
    type: Number,
    required: true
  },
  // Giá trị đơn tối thiểu để áp dụng mã (đơn vị: VNĐ)
  minOrderValue: {
    type: Number,
    required: true
  },
  // Thời gian bắt đầu mã có hiệu lực
  validFrom: {
    type: Date,
    required: true
  },
  // Thời gian kết thúc mã có hiệu lực
  validTo: {
    type: Date,
    required: true
  },
  // Số lượng mã còn lại
  quantity: {
    type: Number,
    required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Promotion', promotionSchema); 