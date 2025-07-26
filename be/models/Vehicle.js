const mongoose = require('mongoose');

// Vehicle Schema: Quản lý thông tin xe cho thuê
const vehicleSchema = new mongoose.Schema({
  // Thương hiệu xe (VD: Toyota, Kia, Ford)
  brand: {
    type: String,
    required: true
  },
  // Dòng xe (VD: Vios, Morning, Ranger)
  model: {
    type: String,
    required: true
  },
  // Biển số xe (duy nhất)
  licensePlate: {
    type: String,
    required: true,
    unique: true
  },
  // Địa điểm xe (VD: Hà Nội, TP.HCM...)
  location: {
    type: String,
    required: true
  },
  // Giá thuê mỗi ngày (VND)
  pricePerDay: {
    type: Number,
    required: true,
    min: 0
  },
  // Số chỗ ngồi
  seatCount: {
    type: Number,
    required: true,
    min: 1
  },
  // Dạng thân xe (Sedan, SUV, ...)
  bodyType: {
    type: String,
    required: true
  },
  // Hộp số (automatic, manual)
  transmission: {
    type: String,
    required: true,
    enum: ['automatic', 'manual']
  },
  // Loại nhiên liệu (gasoline, diesel, electric, hybrid)
  fuelType: {
    type: String,
    required: true,
    enum: ['gasoline', 'diesel', 'electric', 'hybrid']
  },
  // Mức tiêu hao nhiên liệu (VD: 6.5 L/100km)
  fuelConsumption: {
    type: String
  },
  // Danh sách tính năng (VD: Bluetooth, Camera lùi...)
  features: [{
    type: String
  }],
  // Ảnh chính của xe (Cloudinary URL)
  primaryImage: {
    type: String,
    required: true
  },
  // Danh sách ảnh phụ (Cloudinary URL)
  gallery: [{
    type: String
  }],
  // Link file giấy tờ xe (ảnh hoặc PDF)
  vehicleDocument: {
    type: String,
    required: true
  },
  // Mô tả chi tiết về xe
  description: {
    type: String,
    required: true
  },
  // Chủ xe (ref tới User)
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Trạng thái duyệt xe: pending, approved, rejected
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  // Trạng thái xe: available, blocked
  status: {
    type: String,
    enum: ['available', 'blocked'],
    default: 'available'
  },
  // Số lượt thuê thành công
  rentalCount: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);
