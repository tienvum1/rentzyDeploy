const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    // Người thuê xe
    renter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Xe được thuê
    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    // Ngày bắt đầu thuê
    startDate: {
      type: Date,
      required: true,
    },

    // Ngày kết thúc thuê
    endDate: {
      type: Date,
      required: true,
    },

    // Giờ nhận xe
    pickupTime: {
      type: String,
      required: true,
    },

    // Giờ trả xe
    returnTime: {
      type: String,
      required: true,
    },

    // Tổng số ngày thuê
    totalDays: {
      type: Number,
      required: true,
      min: 1,
    },

    // Tổng tiền thuê (VND)
    // tổng tất cả tiền
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    // Tổng tiền đã thanh toán
    totalPaid: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Mã đơn hàng PayOS (orderCode)
    orderCode: {
      type: Number,
      index: true, // giúp tìm kiếm nhanh khi xử lý webhook
      unique: true, // đảm bảo không trùng
      sparse: true, // chỉ unique nếu có giá trị
    },
    // Mã đơn hàng PayOS cho phần còn lại
    orderCodeRemaining: {
      type: Number,
      index: true,
      unique: true,
      sparse: true,
    },
    // tiền thuê xe , vd : 500k/day => 5 days = 2tr5
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    // Tiền giảm giá
    discountAmount: {
      type: Number,
      min: 0,
    },
    // tiền giao xe
    deliveryFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Trạng thái đơn thuê
    status: {
      type: String,
      enum: [
        "pending", // Đơn mới tạo, chưa thanh toán
        "deposit_paid", // Đã thanh toán cọc (30%)
        "fully_paid", // Đã hoàn tất thanh toán (100%)
        "in_progress", // Đang thuê xe
        "completed", // Đã trả xe, hoàn tất
        "canceled", // Đã hủy
        "owner_canceled", // Chủ xe hủy
        "refunded", // Đã hoàn tiền
        "rejected", // Bị từ chối (hiếm dùng)
        "cancel_requested", // Đang chờ chủ xe duyệt huỷ
      ],
      default: "pending",
    },

    // Trạng thái giải ngân cho chủ xe sau khi hoàn thành đơn thuê
    payoutStatus: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    // Thời gian yêu cầu giải ngân được tạo
    payoutRequestedAt: {
      type: Date,
    },

    // Địa chỉ nhận xe
    pickupLocation: {
      type: String,
      required: true,
    },

    // Địa chỉ trả xe
    returnLocation: {
      type: String,
      required: true,
    },

    // Ghi chú từ người thuê
    note: {
      type: String,
      default: "",
    },

    // Đánh giá sau khi thuê (1-5 sao)
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },

    // Nhận xét sau khi thuê
    review: {
      type: String,
    },

    // Hình ảnh xe trước khi thuê
    preRentalImages: [{ type: String }], // Ảnh xe trước khi nhận/giao

    // Hình ảnh xe sau khi thuê
    postRentalImages: [
      {
        type: String,
      },
    ],

    // Lý do hủy (nếu có)
    cancellationReason: {
      type: String,
    },

    // Thời gian hủy
    cancelledAt: {
      type: Date,
    },

    // Thời gian chủ xe hủy
    ownerCancelledAt: {
      type: Date,
    },

    // Người hủy (renter hoặc system)
    cancelledBy: {
      type: String,
      enum: ["renter", "system", "owner"],
    },

    // Mã khuyến mãi
    promoCode: {
      type: String,
    },

    // Giao dịch
    transactions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Transaction",
      },
    ],

    // --- Thông tin hoàn tiền khi huỷ cho người thuê
    totalRefundForRenterCancel: {
      type: Number,
      default: 0,
    },
    // Trạng thái giải ngân cho renter khi huỷ chuyến
    refundStatusRenter: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    // --- Thông tin hoàn tiền khi huỷ
    totalRefundForOwnerCancel: {
      type: Number,
      default: 0,
    },
    // Trạng thái giải ngân cho chủ xe sau khi huỷ chuyến
    refundStatusOwner: {
      type: String,
      enum: ["none", "pending", "approved", "rejected"],
      default: "none",
    },

    // giao nhận xe
    ownerHandoverConfirmed: {
      type: Boolean,
      default: false,
    },
    renterHandoverConfirmed: {
      type: Boolean,
      default: false,
    },
    ownerReturnConfirmed: {
      type: Boolean,
      default: false,
    },
    renterReturnConfirmed: {
      type: Boolean,
      default: false,
    },

    // Chữ ký điện tử
    renterSignature: {
      type: String,
      default: "",
    },
    ownerSignature: {
      type: String,
      default: "",
    },

    refundRequestCreatedAt: {
      type: Date,
    },

    ownerCompensationCreatedAt: {
      type: Date,
    },

    // Admin approval fields
    adminApprovedCancelAt: {
      type: Date,
    },
    adminApprovedCancelBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Cancel request timestamp
    cancelRequestedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
