const mongoose = require('mongoose');

const REASON_ENUM = [
  'fake_info',      // Xe không đúng thực tế
  'illegal',        // Xe vi phạm pháp luật
  'bad_owner',      // Chủ xe không hợp tác
  'dangerous',      // Xe nguy hiểm/không an toàn
  'other'           // Khác
];

const VehicleReportSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    enum: REASON_ENUM,
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('VehicleReport', VehicleReportSchema); 