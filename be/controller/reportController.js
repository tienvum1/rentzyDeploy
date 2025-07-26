const VehicleReport = require('../models/VehicleReport');

// API: User gửi báo cáo xe
exports.reportVehicle = async (req, res) => {
  try {
    const { id } = req.params; // vehicle id
    const userId = req.user._id; // lấy từ middleware xác thực
    const { reason, message } = req.body;
    if (!reason) return res.status(400).json({ message: 'Vui lòng chọn lý do.' });
    const report = new VehicleReport({
      vehicle: id,
      user: userId,
      reason,
      message: message || ''
    });
    await report.save();
    res.status(201).json({ message: 'Báo cáo của bạn đã được gửi.' });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi gửi báo cáo.', error: err.message });
  }
};

// API: Admin xem tất cả báo cáo xe
exports.getAllVehicleReports = async (req, res) => {
  try {
    const reports = await VehicleReport.find()
      .populate('vehicle', 'brand model licensePlate')
      .populate('user', 'name email');
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy danh sách báo cáo.', error: err.message });
  }
};

// API: Lấy báo cáo của 1 xe
exports.getReportsByVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const reports = await VehicleReport.find({ vehicle: id })
      .populate('user', 'name email');
    res.json({ reports });
  } catch (err) {
    res.status(500).json({ message: 'Lỗi lấy báo cáo xe.', error: err.message });
  }
}; 