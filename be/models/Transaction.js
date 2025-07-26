const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    amount: {
      type: Number,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "DEPOSIT",
        "RENTAL",
        "REFUND",
        "TOPUP",
        "bank_transfer_refund",
        "bank_transfer_compensation",
      ], // Removed WITHDRAW - withdrawals functionality deleted
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "COMPLETED", "FAILED", "REFUNDED", "CANCELED"],
      default: "PENDING",
    },
    paymentMethod: {
      type: String,
      enum: [
        "PAYOS",
        "CASH",
        "BANK_TRANSFER",
        "MOMO",
        "VNPAY",
        "ZALOPAY",
        "bank_transfer",
      ],
      required: true,
    },
    paymentMetadata: {
      type: Map,
      of: String,
    },
    // Thông tin ngân hàng cho chuyển khoản
    bankTransferInfo: {
      recipientName: String,
      accountNumber: String,
      bankName: String,
      accountHolder: String,
      transferDate: Date,
      transferReference: String,
      transferAmount: Number,
      transferNote: String,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Transaction", transactionSchema);
