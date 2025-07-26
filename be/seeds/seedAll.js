require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/rentzy";
console.log(MONGO_URI);
async function seedAll() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });

  // Hash password for all users
  const hashedPassword = await bcrypt.hash("12345678", 10);

  // 1. Seed Users
  await User.deleteMany({});
  const users = await User.insertMany(
    Array.from({ length: 30 }).map((_, i) => {
      let role;
      if (i === 0) {
        role = ["admin"]; // First user is admin
      } else if (i < 8) {
        role = ["owner"]; // Next 7 users are owners
      } else {
        role = ["renter"]; // Remaining users are renters
      }

      // Tạo một số yêu cầu chờ duyệt
      const owner_request_status = i >= 8 && i < 12 ? "pending" : undefined;
      const driver_license_verification_status =
        i >= 12 && i < 16 ? "pending" : undefined;
      const driver_license_number =
        i >= 12 && i < 16 ? `GPLX${100000 + i}` : undefined;

      return {
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        password_hash: hashedPassword,
        phone: `09000000${i + 1}`,
        role: role,
        is_verified: true, // All users are verified
        is_phone_verified: i % 2 === 1,
        avatar_url: "",
        loginMethods: ["password"], // Set login method to password
        owner_request_status: owner_request_status,
        driver_license_verification_status: driver_license_verification_status,
        driver_license_number: driver_license_number,
      };
    })
  );

  // 2. Seed Vehicles (owner là 7 user từ index 1-7, skip admin at index 0)
  await Vehicle.deleteMany({});
  const vehicles = await Vehicle.insertMany(
    Array.from({ length: 35 }).map((_, i) => {
      const ownerIndex = 1 + (i % 7); // 7 chủ xe từ index 1-7 (skip admin at index 0)
      const brand = [
        "Toyota",
        "Honda",
        "Ford",
        "Hyundai",
        "Kia",
        "Mazda",
        "VinFast",
        "Chevrolet",
        "BMW",
        "Mercedes",
        "Audi",
        "Lexus",
      ][i % 12];

      const model = [
        "Sedan",
        "SUV",
        "Hatchback",
        "Pickup",
        "Coupe",
        "Convertible",
        "Wagon",
      ][i % 7];

      const bodyType = [
        "sedan",
        "SUV",
        "hatchback",
        "pickup",
        "coupe",
        "convertible",
        "wagon",
      ][i % 7];

      // Tăng giá thuê xe để test số tiền đặt cọc lớn hơn
      const pricePerDay = 1000000 + Math.floor(Math.random() * 1000000);
      const rentalCount = Math.floor(Math.random() * 50); // Số lần thuê ngẫu nhiên

      // Một số xe chờ duyệt
      const approvalStatus = i >= 30 ? "pending" : "approved";

      return {
        owner: users[ownerIndex]._id,
        brand: brand,
        model: model,
        description: `Mô tả xe ${brand} ${model} mẫu số ${i + 1}`,
        seatCount: 4 + (i % 4),
        bodyType: bodyType,
        transmission: ["manual", "automatic"][i % 2],
        fuelType: ["gasoline", "diesel", "electric", "hybrid"][i % 4],
        fuelConsumption: `${5 + (i % 5)} L/100km`,
        licensePlate: `${brand.substring(0, 2).toUpperCase()}${i + 1000}${model
          .substring(0, 2)
          .toUpperCase()}`,
        location: `Hà Nội`,
        pricePerDay: pricePerDay,
        deposit: 1000000,
        features: ["Bluetooth", "Camera lùi", "Điều hoà", "GPS", "Bảo hiểm"],
        rentalPolicy:
          "Không hút thuốc trong xe, không chở quá số người quy định",
        primaryImage: `https://images.unsplash.com/photo-1503736334956-4c8f8e92946d?auto=format&fit=crop&w=400&q=80`,
        vehicleDocument: `https://example.com/vehicle-docs/${i + 1}.pdf`,
        gallery: [],
        approvalStatus: approvalStatus,
        status: "available",
        rentalCount: rentalCount,
      };
    })
  );

  // 3. Seed Bookings (renter là 14 user từ index 6-19, vehicle random)
  await Booking.deleteMany({});

  // Tạo booking với dữ liệu đa dạng hơn cho thống kê
  const bookingStatuses = [
    "pending",
    "deposit_paid",
    "in_progress",
    "fully_paid",
    "completed",
    "canceled",
  ];
  const bookingData = [];

  // Tạo booking cho 6 tháng gần nhất
  for (let month = 0; month < 6; month++) {
    const baseDate = new Date();
    baseDate.setMonth(baseDate.getMonth() - month);

    // Tạo 8-15 booking mỗi tháng
    const bookingsPerMonth = 8 + Math.floor(Math.random() * 8);

    for (let i = 0; i < bookingsPerMonth; i++) {
      const start = new Date(baseDate);
      start.setDate(1 + Math.floor(Math.random() * 28));
      const end = new Date(start);
      end.setDate(start.getDate() + 1 + Math.floor(Math.random() * 5));

      const totalDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      const basePrice = 500000 + Math.floor(Math.random() * 300000);
      const totalAmount = basePrice * totalDays;
      const totalCost = totalAmount * 0.9; // 10% commission
      // const payoutAmount = totalCost * 0.8; // 80% cho chủ xe // Removed - withdrawals functionality deleted

      const status =
        bookingStatuses[Math.floor(Math.random() * bookingStatuses.length)];
      // const payoutStatus = // Removed - withdrawals functionality deleted
      //   status === "completed"
      //     ? Math.random() > 0.3
      //       ? "pending"
      //       : "approved"
      //     : "none";

      bookingData.push({
        renter: users[8 + (i % 22)]._id, // 22 renter users từ index 8-29
        vehicle: vehicles[i % 35]._id, // 35 vehicles
        startDate: start,
        endDate: end,
        pickupTime: "09:00",
        returnTime: "17:00",
        totalDays: totalDays,
        totalAmount: totalAmount,
        totalCost: totalCost,
        deposit: 100000,
        discountAmount: 0,
        deliveryFee: 0,
        status: status,
        // payoutStatus: payoutStatus, // Removed - withdrawals functionality deleted
        // payoutAmount: payoutAmount, // Removed - withdrawals functionality deleted
        // payoutNote: "", // Removed - withdrawals functionality deleted
        pickupLocation: "Hà Nội",
        returnLocation: "Hà Nội",
        note: "",
        rating: status === "completed" ? 4 + Math.random() : undefined,
        review:
          status === "completed" ? `Đánh giá mẫu cho booking ${i + 1}` : "",
        preRentalImages: [],
        postRentalImages: [],
        cancellationReason: status === "canceled" ? "Khách hàng hủy" : "",
        cancelledAt: status === "canceled" ? new Date() : null,
        cancelledBy: status === "canceled" ? "renter" : undefined,
        promoCode: "",
        transactions: [],
        totalRefund: 0,
        createdAt: start, // Để thống kê theo tháng chính xác
      });
    }
  }

  const bookings = await Booking.insertMany(bookingData);

  // 4. Seed Transactions (booking và user liên kết đúng)
  await Transaction.deleteMany({});

  const transactionData = [];

  // Tạo transactions cho tất cả bookings
  bookings.forEach((booking, index) => {
    const renter = users[8 + (index % 22)]; // 22 renter users từ index 8-29

    // Transaction cho deposit
    transactionData.push({
      booking: booking._id,
      user: renter._id,
      amount: booking.deposit || 100000, // đảm bảo luôn có amount
      type: "DEPOSIT", // Đúng enum
      status: "COMPLETED",
      paymentMethod: ["PAYOS", "MOMO", "VNPAY", "ZALOPAY"][
        Math.floor(Math.random() * 4)
      ],
      paymentMetadata: {},
      description: `Đặt cọc cho booking ${booking._id}`,
      isRefunded: false,
      refundedTransaction: null,
      createdAt: booking.startDate,
    });

    // Transaction cho rental fee (nếu booking completed)
    if (booking.status === "completed") {
      transactionData.push({
        booking: booking._id,
        user: renter._id,
        amount: booking.totalCost,
        type: "RENTAL",
        status: "COMPLETED",
        paymentMethod: ["PAYOS", "MOMO", "VNPAY", "ZALOPAY"][
          Math.floor(Math.random() * 4)
        ],
        paymentMetadata: {},
        description: `Thanh toán phí thuê xe cho booking ${booking._id}`,
        isRefunded: false,
        refundedTransaction: null,
        createdAt: booking.endDate,
      });

      // Removed PAYOUT transaction - withdrawals functionality deleted
      // if (booking.payoutStatus === "approved") {
      //   transactionData.push({
      //     booking: booking._id,
      //     user: booking.vehicle.owner, // Sẽ được populate sau
      //     amount: booking.payoutAmount,
      //     type: "PAYOUT",
      //     status: "COMPLETED",
      //     paymentMethod: "BANK_TRANSFER",
      //     paymentMetadata: {},
      //     description: `Giải ngân cho chủ xe sau khi hoàn thành đơn thuê`,
      //     isRefunded: false,
      //     refundedTransaction: null,
      //     createdAt: new Date(booking.endDate.getTime() + 24 * 60 * 60 * 1000), // 1 ngày sau
      //   });
      // }
    }

    // Một số transaction khác
    if (Math.random() > 0.7) {
      transactionData.push({
        booking: booking._id,
        user: renter._id,
        amount: 50000 + Math.floor(Math.random() * 100000),
        type: "DEPOSIT",
        status: "COMPLETED",
        paymentMethod: ["PAYOS", "MOMO", "VNPAY"][
          Math.floor(Math.random() * 3)
        ],
        paymentMetadata: {},
        description: `Nạp tiền vào ví`,
        isRefunded: false,
        refundedTransaction: null,
        createdAt: new Date(booking.startDate.getTime() - 24 * 60 * 60 * 1000), // 1 ngày trước
      });
    }
  });

  await Transaction.insertMany(transactionData);

  console.log("Seeded all data with correct relations!");
  await mongoose.disconnect();
}

seedAll();
