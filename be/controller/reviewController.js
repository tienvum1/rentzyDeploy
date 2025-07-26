// be/controller/reviewController.js
const Booking = require('../models/Booking');

const getOwnerVehicleReviews = async (req, res) => {
    try {
      const ownerId = req.user._id;
      // Lấy các booking đã được đánh giá của các xe thuộc owner này
      const bookings = await Booking.find({
        rating: { $exists: true, $ne: null },
        review: { $exists: true, $ne: "" }
      })
        .populate({
          path: 'vehicle',
          match: { owner: ownerId }
        })
        .populate('renter', 'name avatar_url');
  
      // Lọc booking có vehicle thuộc owner
      const filtered = bookings.filter(b => b.vehicle);
  
      // Chuẩn hóa danh sách review
      const reviews = filtered.map(b => ({
        bookingId: b._id,
        name: b.renter?.name || 'Ẩn danh',
        avatar: b.renter?.avatar_url || '/default-avatar.png',
        rating: b.rating,
        content: b.review,
        date: new Date(b.updatedAt).toLocaleDateString('vi-VN'),
        vehicle: b.vehicle ? `${b.vehicle.brand} ${b.vehicle.model}` : '',
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        totalAmount: b.totalAmount,
        pickupLocation: b.pickupLocation,
        returnLocation: b.returnLocation,
        pickupTime: b.pickupTime,
        returnTime: b.returnTime,
        totalDays: b.totalDays,
        totalCost: b.totalCost,
        discountAmount: b.discountAmount,
        deliveryFee: b.deliveryFee,
        note: b.note,
        promoCode: b.promoCode
      }));
  
      res.json({ reviews });
    } catch (err) {
      res.status(500).json({ message: 'Lỗi server khi lấy đánh giá xe của bạn' });
    }
};

module.exports = {
  getOwnerVehicleReviews
};