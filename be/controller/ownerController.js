const User = require("../models/User");
const cloudinary = require("../utils/cloudinary");
const Booking = require("../models/Booking");
const Vehicle = require("../models/Vehicle");
const Notification = require('../models/Notification');
const { calculateDepositRefund } = require('./bookingController');

// --- 1. Gửi yêu cầu trở thành chủ xe ---
const becomeOwner = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Chỉ cho phép nếu CCCD đã xác thực
    if (user.cccd_verification_status !== 'verified') {
      return res.status(400).json({ message: 'Bạn cần xác thực CCCD thành công trước khi đăng ký làm chủ xe.' });
    }

    if (user.owner_request_status === "pending") {
      return res.status(409).json({ message: "Bạn đã gửi yêu cầu và đang chờ duyệt." });
    }
    if (user.owner_request_status === "approved") {
      return res.status(409).json({ message: "Bạn đã là chủ xe." });
    }

    user.owner_request_status = "pending";
    user.owner_request_submitted_at = new Date();
    await user.save();

    // Gửi thông báo cho user
    await Notification.create({
      user: user._id,
      type: 'system',
      title: 'Yêu cầu đăng ký chủ xe',
      message: 'Yêu cầu đăng ký chủ xe của bạn đã được gửi và đang chờ admin duyệt.',
      data: { owner_request_status: 'pending' },
    });

    // Gửi thông báo cho admin
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await Notification.create({
        user: admin._id,
        type: 'admin',
        title: 'Yêu cầu đăng ký chủ xe mới',
        message: `Người dùng ${user.name} (${user.email}) vừa gửi yêu cầu trở thành chủ xe.`,
        data: { userId: user._id, name: user.name, email: user.email },
      });
    }

    return res.status(200).json({
      success: true,
      message: "Yêu cầu đăng ký chủ xe đã được gửi.",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        owner_request_status: user.owner_request_status,
      },
    });
  } catch (error) {
    console.error("Error in becomeOwner:", error);
    return res.status(500).json({ message: "Server error submitting owner request" });
  }
};

// --- 2. Lấy tất cả đơn thuê của chủ xe ---
const getOwnerBookings = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const sortBy = req.query.sortBy || 'createdAt';
    const sortOrder = req.query.sortOrder || 'desc';
    const status = req.query.status || '';

    const vehicles = await Vehicle.find({ owner: ownerId }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    // Build search query
    let searchQuery = { vehicle: { $in: vehicleIds } };
    
    // Add status filter if provided
    if (status) {
      if (status === 'completed_pending_payout') {
        // Filter for completed bookings that are pending payout
        searchQuery.status = 'completed';
        searchQuery.payoutStatus = 'pending';
      } else {
        searchQuery.status = status;
      }
    }

    // Build sort query
    let sortQuery = {};
    if (sortBy === 'createdAt') {
      sortQuery.createdAt = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'status') {
      sortQuery.status = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'totalAmount') {
      sortQuery.totalAmount = sortOrder === 'asc' ? 1 : -1;
    } else {
      sortQuery.createdAt = -1; // default sort
    }

    // Get total count for pagination
    let totalBookings;
    if (search) {
      // If search is provided, we need to use aggregation to search in populated fields
      const searchPipeline = [
        { $match: searchQuery },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicle',
            foreignField: '_id',
            as: 'vehicleData'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'renter',
            foreignField: '_id',
            as: 'renterData'
          }
        },
        {
          $match: {
            $or: [
              { 'vehicleData.brand': { $regex: search, $options: 'i' } },
              { 'vehicleData.model': { $regex: search, $options: 'i' } },
              { 'renterData.name': { $regex: search, $options: 'i' } },
              { 'renterData.email': { $regex: search, $options: 'i' } }
            ]
          }
        }
      ];
      
      const countResult = await Booking.aggregate([...searchPipeline, { $count: 'total' }]);
      totalBookings = countResult.length > 0 ? countResult[0].total : 0;
      
      const bookings = await Booking.aggregate([
        ...searchPipeline,
        { $sort: sortQuery },
        { $skip: (page - 1) * limit },
        { $limit: limit },
        {
          $lookup: {
            from: 'vehicles',
            localField: 'vehicle',
            foreignField: '_id',
            as: 'vehicle'
          }
        },
        {
          $lookup: {
            from: 'users',
            localField: 'renter',
            foreignField: '_id',
            as: 'renter'
          }
        },
        {
          $addFields: {
            vehicle: { $arrayElemAt: ['$vehicle', 0] },
            renter: { $arrayElemAt: ['$renter', 0] }
          }
        },
        {
          $project: {
            _id: 1,
            status: 1,
            startDate: 1,
            endDate: 1,
            pickupTime: 1,
            returnTime: 1,
            totalAmount: 1,
            payoutStatus: 1,
            createdAt: 1,
            'vehicle.brand': 1,
            'vehicle.model': 1,
            'renter.name': 1,
            'renter.email': 1
          }
        }
      ]);
      
      res.json({ 
        success: true, 
        bookings,
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page
      });
    } else {
      // No search, use regular query
      totalBookings = await Booking.countDocuments(searchQuery);
      
      const bookings = await Booking.find(searchQuery)
        .populate("vehicle", "brand model")
        .populate("renter", "name email")
        .sort(sortQuery)
        .skip((page - 1) * limit)
        .limit(limit);

      res.json({ 
        success: true, 
        bookings,
        totalBookings,
        totalPages: Math.ceil(totalBookings / limit),
        currentPage: page
      });
    }
  } catch (err) {
    console.error("Error in getOwnerBookings:", err);
    res
      .status(500)
      .json({ success: false, message: "Không thể lấy danh sách đơn thuê." });
  }
};

// --- 3. Lấy danh sách yêu cầu huỷ cần duyệt ---
const getOwnerCancelRequests = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({ owner: req.user._id }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    const bookings = await Booking.find({
      vehicle: { $in: vehicleIds },
      status: "cancel_requested",
    })
      .populate("vehicle", "brand model ownerInfo")
      .populate("renter", "name fullName email");

    // Tính toán số tiền hoàn và bồi thường cho mỗi booking
    const bookingsWithRefundInfo = bookings.map(booking => {
      const refundInfo = calculateDepositRefund(booking);
      return {
        ...booking.toObject(),
        totalRefund: refundInfo.totalRefund,
        ownerCompensation: refundInfo.ownerCompensation,
        refundPolicy: refundInfo.policy
      };
    });

    res.json({ success: true, data: bookingsWithRefundInfo });
  } catch (err) {
    console.error("getOwnerCancelRequests error:", err);
    res
      .status(500)
      .json({ success: false, message: "Lỗi server khi lấy danh sách đơn huỷ." });
  }
};

// doanh thu 
// --- 4. Lấy doanh thu của chủ xe ---
const getOwnerRevenue = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const { type = 'month', start, end } = req.query;

    // Lấy tất cả xe của owner
    const vehicles = await Vehicle.find({ owner: ownerId }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);

    // Chỉ lấy booking đã hoàn thành
    const match = {
      vehicle: { $in: vehicleIds },
      status: 'completed',
    };
    if (start || end) {
      match.createdAt = {};
      if (start) match.createdAt.$gte = new Date(start);
      if (end) match.createdAt.$lte = new Date(end);
    }

    // Group theo type - FIX: Sửa logic grouping cho daily
    let groupId = null;
    if (type === 'day') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' }, day: { $dayOfMonth: '$createdAt' } };
    } else if (type === 'week') {
      groupId = { year: { $year: '$createdAt' }, week: { $isoWeek: '$createdAt' } };
    } else if (type === 'month') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    } else if (type === 'year') {
      groupId = { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } };
    }

    // Tính doanh thu thực tế của chủ xe (trừ phí platform 10%)
    const PLATFORM_FEE_RATE = 0.1; // 10% phí platform
    
    const revenue = await Booking.aggregate([
      { $match: match },
      {
        $addFields: {
          ownerRevenue: {
            $multiply: [
              '$totalAmount',
              { $subtract: [1, PLATFORM_FEE_RATE] }
            ]
          }
        }
      },
      { $group: {
        _id: groupId,
        totalRevenue: { $sum: '$ownerRevenue' },
        grossRevenue: { $sum: '$totalAmount' },
        platformFee: { $sum: { $multiply: ['$totalAmount', PLATFORM_FEE_RATE] } },
        count: { $sum: 1 },
      }},
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } }
    ]);

    // Tổng doanh thu toàn bộ (không phụ thuộc vào filter thời gian)
    const totalMatch = {
      vehicle: { $in: vehicleIds },
      status: 'completed',
    };
    
    const total = await Booking.aggregate([
      { $match: totalMatch },
      {
        $addFields: {
          ownerRevenue: {
            $multiply: [
              '$totalAmount',
              { $subtract: [1, PLATFORM_FEE_RATE] }
            ]
          }
        }
      },
      { $group: { 
        _id: null, 
        totalRevenue: { $sum: '$ownerRevenue' },
        grossRevenue: { $sum: '$totalAmount' },
        platformFee: { $sum: { $multiply: ['$totalAmount', PLATFORM_FEE_RATE] } },
        count: { $sum: 1 } 
      } }
    ]);

    // Xử lý dữ liệu để frontend dễ sử dụng
    const processedRevenue = revenue.map(item => {
      let period = '';
      let displayPeriod = '';
      
      if (type === 'day' && item._id && item._id.day) {
        // FIX: Xử lý đúng dữ liệu daily
        const date = new Date(item._id.year, item._id.month - 1, item._id.day);
        period = date.toISOString().split('T')[0];
        displayPeriod = String(item._id.day).padStart(2, '0') + '/' + String(item._id.month).padStart(2, '0');
      } else if ((type === 'month' || type === 'year') && item._id) {
        period = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
        const monthNames = [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ];
        displayPeriod = monthNames[item._id.month - 1];
      }
      
      return {
        ...item,
        period,
        displayPeriod,
        revenue: item.totalRevenue || 0,
        bookingCount: item.count || 0
      };
    });

    res.json({ 
      success: true, 
      revenue: processedRevenue, 
      total: total[0] || { totalRevenue: 0, grossRevenue: 0, platformFee: 0, count: 0 },
      platformFeeRate: PLATFORM_FEE_RATE,
      debug: {
        matchCondition: match,
        totalMatchCondition: totalMatch,
        vehicleCount: vehicleIds.length,
        rawRevenue: revenue
      }
    });
  } catch (err) {
    console.error('Error in getOwnerRevenue:', err);
    res.status(500).json({ success: false, message: 'Không thể lấy doanh thu.' });
  }
};

// --- 5. Lấy số lượng xe của owner theo tháng trong năm hiện tại ---
const getOwnerVehicleStatsByMonth = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const now = new Date();
    const year = now.getFullYear();
    const stats = await Vehicle.aggregate([
      { $match: {
          owner: ownerId,
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
          }
        }
      },
      { $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);
    res.json({ success: true, year, stats });
  } catch (err) {
    console.error("Error in getOwnerVehicleStatsByMonth:", err);
    res.status(500).json({ success: false, message: "Không thể lấy thống kê xe theo tháng." });
  }
};

// --- 6. Lấy số lượng đơn thuê của owner theo tháng trong năm hiện tại ---
const getOwnerBookingStatsByMonth = async (req, res) => {
  try {
    const ownerId = req.user._id;
    const now = new Date();
    const year = now.getFullYear();
    // Lấy tất cả xe của owner
    const vehicles = await Vehicle.find({ owner: ownerId }).select('_id');
    const vehicleIds = vehicles.map(v => v._id);
    const stats = await Booking.aggregate([
      { $match: {
          vehicle: { $in: vehicleIds },
          createdAt: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`)
          }
        }
      },
      { $group: {
          _id: { month: { $month: "$createdAt" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.month": 1 } }
    ]);
    res.json({ success: true, year, stats });
  } catch (err) {
    console.error("Error in getOwnerBookingStatsByMonth:", err);
    res.status(500).json({ success: false, message: "Không thể lấy thống kê đơn thuê theo tháng." });
  }
};

// --- Export tất cả ---
module.exports = {
  becomeOwner,
  getOwnerBookings,
  getOwnerCancelRequests,
  getOwnerRevenue,
  getOwnerVehicleStatsByMonth,
  getOwnerBookingStatsByMonth,
};
