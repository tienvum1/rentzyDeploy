const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
const cloudinary = require("../utils/cloudinary");
const User = require("../models/User");
const Vehicle = require("../models/Vehicle");
const Notification = require("../models/Notification");
const Booking = require("../models/Booking");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

// Hàm gọi FPT.AI OCR
async function extractDriverLicenseInfoFPT(imageUrl) {
  // Tải ảnh về file tạm nếu là URL
  const response = await axios.get(imageUrl, { responseType: "arraybuffer" });
  const tempPath = `/tmp/license_${Date.now()}.jpg`;
  fs.writeFileSync(tempPath, response.data);
  const form = new FormData();
  form.append("image", fs.createReadStream(tempPath));
  const apiKey =
    process.env.FPT_AI_API_KEY || "ncs4OhsljMoirb4bbqDkt9tdDaU0lBNw";
  try {
    const ocrRes = await axios.post("https://api.fpt.ai/vision/dlr/vnm", form, {
      headers: {
        ...form.getHeaders(),
        "api-key": apiKey,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    fs.unlinkSync(tempPath); // Xoá file tạm
    return ocrRes.data.data;
  } catch (error) {
    fs.unlinkSync(tempPath);
    throw error;
  }
}
function removeVietnameseTones(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();
}
// Controller nhận upload GPLX và xác thực AI
const createOrUpdateDriverLicense = async (req, res) => {
  try {
    const {
      driver_license_full_name,
      driver_license_birth_date,
      driver_license_number,
    } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Nếu có file mới thì upload, không thì giữ ảnh cũ
    let imageUrl = user.driver_license_image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "driver_licenses",
      });
      imageUrl = result.secure_url;
    }
    // Gọi FPT.AI OCR để trích xuất thông tin từ ảnh hiện tại
    const ocrInfo = await extractDriverLicenseInfoFPT(imageUrl);
    const ocr = Array.isArray(ocrInfo) ? ocrInfo[0] : ocrInfo;
    // So sánh trực tiếp, không chuẩn hóa
    const ocrName = (ocr?.name || "").trim();
    const ocrDob = ocr?.dob ? ocr.dob.split("/").reverse().join("-") : "";
    const ocrId = (ocr?.id || "").trim();
    const inputName = (driver_license_full_name || "").trim();
    const inputDob = (driver_license_birth_date || "").trim();
    const inputId = (driver_license_number || "").trim();
    // Log dữ liệu để debug
    console.log("--- AI OCR fields ---");
    console.log("id:", ocr?.id);
    console.log("name:", ocr?.name);
    console.log("dob:", ocr?.dob);
    console.log("nation:", ocr?.nation);
    console.log("address:", ocr?.address);
    console.log("class:", ocr?.class);
    console.log("date:", ocr?.date);
    console.log("doe:", ocr?.doe);
    console.log("--- User input fields ---");
    console.log("driver_license_number:", driver_license_number);
    console.log("driver_license_full_name:", driver_license_full_name);
    console.log("driver_license_birth_date:", driver_license_birth_date);
    console.log("--- So sánh trực tiếp ---");
    console.log({ ocrName, inputName, ocrDob, inputDob, ocrId, inputId });
    let warning = "";
    if (!ocrName || !ocrDob || !ocrId) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Không nhận diện được đủ thông tin từ ảnh GPLX.",
        });
    }
    if (ocrName !== inputName || ocrDob !== inputDob || ocrId !== inputId) {
      return res
        .status(400)
        .json({
          success: false,
          message:
            "Thông tin trên ảnh GPLX không khớp với thông tin bạn nhập. Vui lòng kiểm tra lại!",
        });
    }
    // Nếu khớp hoàn toàn, lưu và trả về thành công
    user.driver_license_full_name = driver_license_full_name;
    user.driver_license_birth_date = driver_license_birth_date;
    user.driver_license_number = driver_license_number;
    user.driver_license_image = imageUrl;
    user.driver_license_verification_status = "pending";
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json({
        success: true,
        message: "Thông tin GPLX đã được gửi để chờ admin duyệt!",
        user,
        ocr,
        input: {
          driver_license_full_name,
          driver_license_birth_date,
          driver_license_number,
        },
      });
  } catch (error) {
    console.error("Error creating/updating driver license:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xử lý thông tin GPLX." });
  }
};

// Lấy danh sách yêu cầu làm chủ xe
const getOwnerRequests = async (req, res) => {
  try {
    const pendingOwners = await User.find({
      owner_request_status: "pending",
    }).select(
      "name email phone cccd_number cccd_full_name cccd_birth_date cccd_image owner_request_status owner_request_submitted_at"
    );
    res.status(200).json({ success: true, data: pendingOwners });
  } catch (error) {
    console.error("Error fetching owner requests:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

// Cập nhật trạng thái yêu cầu làm chủ xe
const updateOwnerRequestStatus = async (req, res) => {
  const { userId } = req.params;
  const { status } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.owner_request_status = status;
    if (status === "approved") {
      user.role = "owner";
      user.owner_request_status = "approved";
    }

    await user.save({ validateBeforeSave: false });

    // --- Notification logic ---
    let notifyTitle = "Kết quả yêu cầu đăng ký chủ xe";
    let notifyMessage = "";
    if (status === "approved") {
      notifyMessage =
        "Yêu cầu đăng ký chủ xe của bạn đã được duyệt. Bạn đã trở thành chủ xe.";
    } else {
      notifyMessage = "Yêu cầu đăng ký chủ xe của bạn đã bị từ chối.";
    }
    await Notification.create({
      user: user._id,
      type: "system",
      title: notifyTitle,
      message: notifyMessage,
      data: { owner_request_status: status },
    });

    res.status(200).json({
      success: true,
      message: `Yêu cầu của chủ xe đã được ${
        status === "approved" ? "chấp thuận" : "từ chối"
      }.`,
    });
  } catch (error) {
    console.error(
      `Error updating owner request status for user ${userId}:`,
      error
    );
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

// Lấy danh sách yêu cầu xác thực GPLX
const getDriverLicenseRequests = async (req, res) => {
  try {
    const pendingLicenses = await User.find({
      driver_license_verification_status: "pending",
      driver_license_number: { $ne: null, $ne: "" },
    }).select("-password");
    res.status(200).json(pendingLicenses);
  } catch (error) {
    console.error("Error fetching driver license requests:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Cập nhật trạng thái xác thực GPLX
const updateDriverLicenseStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }

    user.driver_license_verification_status = status;

    // Tự động cập nhật tên người dùng khi admin duyệt GPLX
    if (status === "verified" && user.driver_license_full_name) {
      user.name = user.driver_license_full_name;
    }

    await user.save({ validateBeforeSave: false });

    // --- Notification logic ---
    let notifyTitle = "Kết quả xác thực giấy phép lái xe";
    let notifyMessage = "";
    if (status === "verified") {
      notifyMessage = "Giấy phép lái xe của bạn đã được xác thực thành công.";
      if (user.driver_license_full_name) {
        notifyMessage += ` Tên của bạn đã được cập nhật thành: ${user.driver_license_full_name}.`;
      }
    } else {
      notifyMessage = "Giấy phép lái xe của bạn đã bị từ chối xác thực.";
    }
    await Notification.create({
      user: user._id,
      type: "system",
      title: notifyTitle,
      message: notifyMessage,
      data: { driver_license_verification_status: status },
    });

    res.status(200).json({
      message: `Giấy phép lái xe đã được ${
        status === "verified" ? "chấp thuận" : "từ chối"
      }.`,
    });
  } catch (error) {
    console.error("Error updating driver license status:", error);
    res.status(500).json({ message: "Lỗi máy chủ nội bộ" });
  }
};

// Lấy danh sách xe chờ duyệt
const getPendingVehicleApprovals = async (req, res) => {
  try {
    const pendingVehicles = await Vehicle.find({ approvalStatus: "pending" })
      .select(
        "_id brand model licensePlate pricePerDay primaryImage approvalStatus status owner"
      )
      .populate("owner", "name email");
    res
      .status(200)
      .json({ count: pendingVehicles.length, vehicles: pendingVehicles });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch pending vehicles.",
        error: error.message,
      });
  }
};

// Lấy chi tiết xe chờ duyệt
const getPendingVehicleDetail = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id).populate("owner", "name email");
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }
    res.status(200).json({ vehicle });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to fetch vehicle detail.",
        error: error.message,
      });
  }
};

// Duyệt hoặc từ chối xe mới
const reviewVehicleApproval = async (req, res) => {
  const { vehicleId } = req.params;
  const { status, rejectionReason } = req.body;
  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status provided." });
  }
  try {
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: "Vehicle not found." });
    }
    vehicle.approvalStatus = status;
    vehicle.rejectionReason =
      status === "rejected" ? rejectionReason || null : null;
    await vehicle.save();

    // Gửi notification cho owner về kết quả duyệt
    let notifyTitle = "Kết quả duyệt xe";
    let notifyMessage = "";
    if (status === "approved") {
      notifyMessage = `Xe ${vehicle.brand} ${vehicle.model} của bạn đã được duyệt và sẵn sàng cho thuê.`;
    } else {
      notifyMessage = `Xe ${vehicle.brand} ${
        vehicle.model
      } của bạn đã bị từ chối duyệt.${
        rejectionReason ? " Lý do: " + rejectionReason : ""
      }`;
    }
    await require("../models/Notification").create({
      user: vehicle.owner,
      type: "vehicle",
      title: notifyTitle,
      message: notifyMessage,
      vehicle: vehicle._id,
      data: {
        approvalStatus: status,
        rejectionReason: status === "rejected" ? rejectionReason : undefined,
      },
    });

    res
      .status(200)
      .json({ message: `Vehicle ${vehicleId} has been ${status}.` });
  } catch (error) {
    res
      .status(500)
      .json({
        message: "Failed to review vehicle approval.",
        error: error.message,
      });
  }
};

// Removed getPendingPayoutRequests function - withdrawals functionality deleted

// Lấy danh sách booking chờ hoàn tiền cọc cho người thuê
const getPendingDepositRefundRequests = async (req, res) => {
  try {
    const bookings = await Booking.find({ depositRefundStatus: "pending" })
      .populate("vehicle")
      .populate({ path: "vehicle", populate: { path: "owner" } })
      .populate("renter");
    const data = bookings.map((b) => {
      const totalAmount = b.totalAmount || 0;
      return {
        id: b._id,
        vehicle: b.vehicle,
        owner: b.vehicle?.owner,
        renter: b.renter,
        deposit: b.deposit,
        depositRefundStatus: b.depositRefundStatus,
        totalAmount,
        status: b.status,
        createdAt: b.createdAt,
      };
    });
    res.json({ success: true, data });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Lỗi server", error: err.message });
  }
};

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const blockedUsers = await User.countDocuments({ isActive: false });
    const totalAdmins = await User.countDocuments({ role: { $in: ["admin"] } });
    const totalOwners = await User.countDocuments({ role: { $in: ["owner"] } });
    const totalRenters = await User.countDocuments({
      role: { $in: ["renter"] },
    });

    const totalVehicles = await Vehicle.countDocuments();
    const pendingVehicles = await Vehicle.countDocuments({
      approvalStatus: "pending",
    });
    const approvedVehicles = await Vehicle.countDocuments({
      approvalStatus: "approved",
    });
    const availableVehicles = await Vehicle.countDocuments({
      status: "available",
    });

    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: "pending" });
    const completedBookings = await Booking.countDocuments({
      status: "completed",
    });
    const cancelledBookings = await Booking.countDocuments({
      status: "cancelled",
    });

    const totalTransactions = await Transaction.countDocuments();
    const completedTransactions = await Transaction.countDocuments({
      status: "COMPLETED",
    });

    const revenueStats = await Transaction.aggregate([
      { $match: { status: "COMPLETED", type: { $in: ["RENTAL", "DEPOSIT"] } } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
    ]);
    const totalRevenue =
      revenueStats.length > 0 ? revenueStats[0].totalRevenue : 0;

    const pendingOwnerRequests = await User.countDocuments({
      owner_request_status: "pending",
    });
    const pendingDriverLicenses = await User.countDocuments({
      driver_license_verification_status: "pending",
      driver_license_number: { $ne: null, $ne: "" },
    });
    // const pendingPayouts = await Booking.countDocuments({ payoutStatus: 'pending' }); // Removed - withdrawals functionality deleted

    const monthlyStats = await Booking.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
          },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          revenue: { $sum: "$totalCost" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const topVehicles = await Vehicle.aggregate([
      { $sort: { rentalCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "owner",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $project: {
          _id: 1,
          brand: 1,
          model: 1,
          licensePlate: 1,
          rentalCount: 1,
          pricePerDay: 1,
          primaryImage: 1,
          "owner.name": 1,
        },
      },
    ]);

    const topOwners = await Booking.aggregate([
      { $match: { status: "completed" } },
      {
        $lookup: {
          from: "vehicles",
          localField: "vehicle",
          foreignField: "_id",
          as: "vehicle",
        },
      },
      { $unwind: "$vehicle" },
      {
        $group: {
          _id: "$vehicle.owner",
          // totalRevenue: { $sum: '$payoutAmount' }, // Removed - withdrawals functionality deleted
          totalRevenue: { $sum: "$totalCost" }, // Use totalCost instead
          bookingCount: { $sum: 1 },
        },
      },
      { $sort: { totalRevenue: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "owner",
        },
      },
      { $unwind: "$owner" },
      {
        $project: {
          _id: 1,
          "owner.name": 1,
          "owner.email": 1,
          totalRevenue: 1,
          bookingCount: 1,
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        userStats: {
          total: totalUsers,
          active: activeUsers,
          blocked: blockedUsers,
          admins: totalAdmins,
          owners: totalOwners,
          renters: totalRenters,
        },
        vehicleStats: {
          total: totalVehicles,
          pending: pendingVehicles,
          approved: approvedVehicles,
          available: availableVehicles,
        },
        bookingStats: {
          total: totalBookings,
          pending: pendingBookings,
          completed: completedBookings,
          cancelled: cancelledBookings,
        },
        transactionStats: {
          total: totalTransactions,
          completed: completedTransactions,
          totalRevenue: totalRevenue,
        },
        pendingRequests: {
          ownerRequests: pendingOwnerRequests,
          driverLicenses: pendingDriverLicenses,
          // payouts: pendingPayouts // Removed - withdrawals functionality deleted
        },
        monthlyStats,
        topVehicles,
        topOwners,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    res.status(500).json({ success: false, message: "Lỗi máy chủ nội bộ" });
  }
};

// Lấy danh sách user chờ duyệt CCCD
const getPendingCCCDRequests = async (req, res) => {
  try {
    const users = await require("../models/User").find({
      cccd_verification_status: "pending",
    });
    res.json(users);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách CCCD chờ duyệt." });
  }
};

// Cập nhật trạng thái xác thực CCCD
const updateCCCDStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body;
    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Trạng thái không hợp lệ." });
    }
    const user = await require("../models/User").findById(userId);
    if (!user) return res.status(404).json({ message: "Không tìm thấy user." });

    user.cccd_verification_status = status;

    // Tự động cập nhật tên người dùng khi admin duyệt CCCD
    if (status === "verified" && user.cccd_full_name) {
      user.name = user.cccd_full_name;
    }

    await user.save({ validateBeforeSave: false });

    // Gửi thông báo cho user
    const Notification = require("../models/Notification");
    let notifyTitle = "Kết quả xác thực CCCD";
    let notifyMessage = "";
    if (status === "verified") {
      notifyMessage = "CCCD của bạn đã được xác thực thành công.";
      if (user.cccd_full_name) {
        notifyMessage += ` Tên của bạn đã được cập nhật thành: ${user.cccd_full_name}.`;
      }
    } else {
      notifyMessage = "CCCD của bạn đã bị từ chối xác thực.";
    }
    await Notification.create({
      user: user._id,
      type: "system",
      title: notifyTitle,
      message: notifyMessage,
      data: { cccd_verification_status: status },
    });

    res.json({
      message: `CCCD đã được ${
        status === "verified" ? "chấp thuận" : "từ chối"
      }.`,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Lỗi server khi cập nhật trạng thái CCCD." });
  }
};

// Lấy danh sách tất cả người dùng với phân trang
const getAllUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const role = req.query.role || "";
    const status = req.query.status || "";

    // Tạo query filter
    let filter = {};
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
      ];
    }
    if (role) {
      filter.role = { $in: [role] };
    }
    if (status) {
      if (status === "active") {
        filter.isActive = true;
      } else if (status === "blocked") {
        filter.isActive = false;
      }
    }

    const users = await User.find(filter)
      .select("-password -googleId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages,
          totalUsers: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi lấy danh sách người dùng",
      });
  }
};

// Lấy chi tiết người dùng
const getUserDetail = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-password -googleId");
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Lấy thống kê liên quan đến user
    const userStats = {};

    if (user.role && user.role.includes("owner")) {
      const vehicleCount = await Vehicle.countDocuments({ owner: userId });
      const totalBookings = await Booking.countDocuments({
        "vehicle.owner": userId,
      });
      const completedBookings = await Booking.countDocuments({
        "vehicle.owner": userId,
        status: "completed",
      });

      userStats.vehicleCount = vehicleCount;
      userStats.totalBookings = totalBookings;
      userStats.completedBookings = completedBookings;
    }

    if (user.role && user.role.includes("renter")) {
      const totalBookings = await Booking.countDocuments({ renter: userId });
      const completedBookings = await Booking.countDocuments({
        renter: userId,
        status: "completed",
      });

      userStats.totalBookings = totalBookings;
      userStats.completedBookings = completedBookings;
    }

    res.status(200).json({
      success: true,
      data: {
        user,
        stats: userStats,
      },
    });
  } catch (error) {
    console.error("Error fetching user detail:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi lấy chi tiết người dùng",
      });
  }
};

// Khóa/mở khóa người dùng
const blockUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, action } = req.body; // action: 'block' hoặc 'unblock'

    if (!reason && action === "block") {
      return res
        .status(400)
        .json({
          success: false,
          message: "Vui lòng nhập lý do khóa tài khoản",
        });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "Không tìm thấy người dùng" });
    }

    // Cập nhật trạng thái isActive
    user.isActive = action === "block" ? false : true;
    await user.save({ validateBeforeSave: false });

    // Tạo thông báo cho user
    const notificationTitle =
      action === "block" ? "Tài khoản bị khóa" : "Tài khoản được mở khóa";
    const notificationMessage =
      action === "block"
        ? `Tài khoản của bạn đã bị khóa. Lý do: ${reason}`
        : "Tài khoản của bạn đã được mở khóa và có thể sử dụng bình thường.";

    await Notification.create({
      user: userId,
      type: "system",
      title: notificationTitle,
      message: notificationMessage,
      data: {
        action,
        reason: action === "block" ? reason : null,
        blockedAt: action === "block" ? new Date() : null,
      },
    });

    // Gửi email thông báo khi khóa/mở khóa tài khoản
    try {
      const { sendAccountStatusEmail } = require("../utils/emailService");
      await sendAccountStatusEmail(user.email, user.name, action, reason);
    } catch (emailError) {
      console.error(
        "Error sending account status notification email:",
        emailError
      );
      // Không throw error để không ảnh hưởng đến việc cập nhật trạng thái tài khoản
    }

    res.status(200).json({
      success: true,
      message:
        action === "block"
          ? "Đã khóa tài khoản người dùng thành công"
          : "Đã mở khóa tài khoản người dùng thành công",
    });
  } catch (error) {
    console.error("Error blocking/unblocking user:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Lỗi server khi cập nhật trạng thái người dùng",
      });
  }
};

// Lấy danh sách các đơn hủy đang chờ admin duyệt
const getPendingCancelRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const bookings = await Booking.find({
      status: "owner_approved_cancel",
    })
      .populate("renter", "name email phone")
      .populate("vehicle", "brand model licensePlate primaryImage")
      .populate("ownerApprovedCancelBy", "name email")
      .sort({ ownerApprovedCancelAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments({
      status: "owner_approved_cancel",
    });
    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data: {
        bookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching pending cancel requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách yêu cầu hủy đơn",
    });
  }
};

// Lấy tất cả các yêu cầu pending (cả refundStatusRenter và refundStatusOwner)
const getAllPendingRefundRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const type = req.query.type; // 'renter', 'owner', hoặc không có (lấy tất cả)

    let query = {};

    if (type === "renter") {
      query.refundStatusRenter = "pending";
    } else if (type === "owner") {
      query.refundStatusOwner = "pending";
    } else {
      // Lấy tất cả các booking có ít nhất một trong hai status là pending
      query.$or = [
        { refundStatusRenter: "pending" },
        { refundStatusOwner: "pending" },
      ];
    }

    const bookings = await Booking.find(query)
      .populate("renter", "name email phone bankAccounts")
      .populate({
        path: "vehicle",
        select: "brand model licensePlate primaryImage owner",
        populate: {
          path: "owner",
          select: "name email phone bankAccounts"
        }
      })
      .sort({
        refundRequestCreatedAt: -1,
        ownerCompensationCreatedAt: -1,
      })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Phân loại các booking theo loại yêu cầu
    const categorizedBookings = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      const pendingTypes = [];

      if (booking.refundStatusRenter === "pending") {
        pendingTypes.push({
          type: "renter_refund",
          amount: booking.totalRefundForRenterCancel,
          createdAt: booking.refundRequestCreatedAt,
          description: "Hoàn tiền cho người thuê",
        });
      }

      if (booking.refundStatusOwner === "pending") {
        pendingTypes.push({
          type: "owner_compensation",
          amount: booking.totalRefundForOwnerCancel,
          createdAt: booking.ownerCompensationCreatedAt,
          description: "Bồi thường cho chủ xe",
        });
      }

      return {
        ...bookingObj,
        pendingRequests: pendingTypes,
      };
    });

    res.status(200).json({
      success: true,
      data: {
        bookings: categorizedBookings,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: {
          totalPendingRenterRefunds: await Booking.countDocuments({
            refundStatusRenter: "pending",
          }),
          totalPendingOwnerCompensations: await Booking.countDocuments({
            refundStatusOwner: "pending",
          }),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching all pending refund requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách yêu cầu chuyển tiền",
    });
  }
};

// Lấy danh sách yêu cầu giải ngân cho chủ xe
const getPendingPayoutRequests = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const status = req.query.status; // 'pending', 'approved', or undefined for all

    // Build query based on status filter
    let query = {};
    if (status === "pending") {
      query.payoutStatus = "pending";
    } else if (status === "approved") {
      query.payoutStatus = "approved";
    } else {
      // For 'all' or no status, get both pending and approved
      query.payoutStatus = { $in: ["pending", "approved"] };
    }

    const bookings = await Booking.find(query)
      .populate("renter", "name email phone")
      .populate({
        path: "vehicle",
        select: "brand model licensePlate primaryImage owner",
        populate: {
          path: "owner",
          select: "name email phone bankAccounts"
        }
      })
      .sort({ payoutRequestedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Booking.countDocuments(query);
    const totalPages = Math.ceil(total / limit);

    // Tính toán số tiền giải ngân cho mỗi booking
    const payoutRequests = bookings.map((booking) => {
      const bookingObj = booking.toObject();
      // Số tiền giải ngân = tổng tiền thuê - phí hệ thống (10%)
      const systemFeeRate = 0.1; // 10%
      const systemFee = Math.round(booking.totalCost * systemFeeRate);
      const payoutAmount = Math.round(booking.totalCost * (1 - systemFeeRate));

      return {
        ...bookingObj,
        payoutAmount,
        systemFee,
        totalCost: booking.totalCost,
      };
    });

    // Calculate summary data
    const totalPendingPayouts = await Booking.countDocuments({
      payoutStatus: "pending",
    });
    const totalApprovedPayouts = await Booking.countDocuments({
      payoutStatus: "approved",
    });

    // Calculate amounts
    const pendingBookings = await Booking.find({ payoutStatus: "pending" });
    const approvedBookings = await Booking.find({ payoutStatus: "approved" });

    const systemFeeRate = 0.1;
    const totalPayoutAmount = pendingBookings.reduce((sum, booking) => {
      return sum + Math.round(booking.totalCost * (1 - systemFeeRate));
    }, 0);

    const totalApprovedAmount = approvedBookings.reduce((sum, booking) => {
      return sum + Math.round(booking.totalCost * (1 - systemFeeRate));
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        bookings: payoutRequests,
        pagination: {
          currentPage: page,
          totalPages,
          totalBookings: total,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
        summary: {
          totalPendingPayouts,
          totalPayoutAmount,
          totalApprovedPayouts,
          totalApprovedAmount,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching payout requests:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách yêu cầu giải ngân",
    });
  }
};

// Duyệt yêu cầu giải ngân cho chủ xe
const approvePayoutRequest = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { note } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          select: "name email bankAccounts"
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    if (booking.payoutStatus !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu giải ngân này đã được xử lý",
      });
    }

    // Tính toán số tiền giải ngân
    const systemFeeRate = 0.1; // 10%
    const payoutAmount = Math.round(booking.totalCost * (1 - systemFeeRate));

    // Cập nhật trạng thái giải ngân
    booking.payoutStatus = "approved";
    booking.payoutApprovedAt = new Date();
    booking.payoutApprovedBy = req.user._id;
    booking.payoutNote = note || "";
    await booking.save();

    // Tạo transaction giải ngân
    const payoutTransaction = new Transaction({
      booking: booking._id,
      user: booking.vehicle.owner._id,
      amount: payoutAmount,
      type: "bank_transfer_compensation",
      status: "COMPLETED",
      paymentMethod: "bank_transfer",
      description: `Giải ngân cho chủ xe - Booking #${booking._id
        .toString()
        .slice(-6)}`,
      bankTransferInfo: {
        recipientName: booking.vehicle.owner.name,
        accountNumber:
          booking.vehicle.owner.bankAccounts?.[0]?.accountNumber || "",
        bankName: booking.vehicle.owner.bankAccounts?.[0]?.bankName || "",
        accountHolder:
          booking.vehicle.owner.bankAccounts?.[0]?.accountHolder ||
          booking.vehicle.owner.name,
        transferDate: new Date(),
        transferAmount: payoutAmount,
        transferNote:
          note ||
          `Giải ngân cho chủ xe - Booking #${booking._id.toString().slice(-6)}`,
      },
    });
    await payoutTransaction.save();

    // Tạo thông báo cho chủ xe
    const bankInfo = booking.vehicle.owner.bankAccounts?.[0];
    const bankDetails = bankInfo
      ? `${bankInfo.bankName} - STK: ${bankInfo.accountNumber}`
      : "tài khoản đã đăng ký";

    await Notification.create({
      user: booking.vehicle.owner._id,
      type: "payout",
      title: " Yêu cầu giải ngân đã được duyệt!",
      message: `Chúc mừng! Yêu cầu giải ngân cho chuyến đi #${booking._id
        .toString()
        .slice(
          -6
        )}`,
      booking: booking._id,
      vehicle: booking.vehicle._id,
      data: {
        payoutAmount,
        bankInfo: bankDetails,
        approvedAt: new Date(),
        bookingCode: booking._id.toString().slice(-6),
      },
    });

    res.status(200).json({
      success: true,
      message: "Đã duyệt yêu cầu giải ngân thành công",
      data: {
        booking,
        payoutAmount,
        transaction: payoutTransaction,
      },
    });
  } catch (error) {
    console.error("Error approving payout request:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi duyệt yêu cầu giải ngân",
    });
  }
};

// Duyệt hoàn tiền cho renter
const approveRefund = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { note } = req.body;
    console.log("bookingId", bookingId);
    console.log("body", req.body);

    const booking = await Booking.findById(bookingId)
      .populate("renter", "name email bankAccounts")
      .populate("vehicle", "brand model licensePlate");

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    if (booking.refundStatusRenter !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu hoàn tiền này đã được xử lý hoặc không tồn tại",
      });
    }

    const refundAmount = booking.totalRefundForRenterCancel || 0;

    if (refundAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền hoàn trả không hợp lệ",
      });
    }

    // Cập nhật trạng thái hoàn tiền
    booking.refundStatusRenter = "approved";
    booking.refundApprovedAt = new Date();
    booking.refundNote = note || "";
    await booking.save();

    // Tìm transaction pending hiện có hoặc tạo mới nếu không có
    let refundTransaction = await Transaction.findOne({
      booking: booking._id,
      user: booking.renter._id,
      type: "bank_transfer_refund",
      status: "PENDING"
    });

    if (refundTransaction) {
      // Cập nhật transaction pending hiện có
      refundTransaction.status = "COMPLETED";
      refundTransaction.bankTransferInfo = {
        recipientName: booking.renter.name,
        accountNumber: booking.renter.bankAccounts?.[0]?.accountNumber || "",
        bankName: booking.renter.bankAccounts?.[0]?.bankName || "",
        accountHolder:
          booking.renter.bankAccounts?.[0]?.accountHolder ||
          booking.renter.name,
        transferDate: new Date(),
        transferAmount: refundAmount,
        transferNote:
          note || `Hoàn tiền hủy đơn #${booking._id.toString().slice(-6)}`,
      };
      await refundTransaction.save();
    } else {
      // Tạo transaction mới nếu không tìm thấy pending
      refundTransaction = new Transaction({
        booking: booking._id,
        user: booking.renter._id,
        amount: refundAmount,
        type: "bank_transfer_refund",
        status: "COMPLETED",
        paymentMethod: "bank_transfer",
        description: `Hoàn tiền hủy đơn #${booking._id.toString().slice(-6)}`,
        bankTransferInfo: {
          recipientName: booking.renter.name,
          accountNumber: booking.renter.bankAccounts?.[0]?.accountNumber || "",
          bankName: booking.renter.bankAccounts?.[0]?.bankName || "",
          accountHolder:
            booking.renter.bankAccounts?.[0]?.accountHolder ||
            booking.renter.name,
          transferDate: new Date(),
          transferAmount: refundAmount,
          transferNote:
            note || `Hoàn tiền hủy đơn #${booking._id.toString().slice(-6)}`,
        },
      });
      await refundTransaction.save();

      // Thêm transaction vào booking nếu là transaction mới
      booking.transactions.push(refundTransaction._id);
      await booking.save();
    }

    // Tạo thông báo cho renter
    const bankInfo = booking.renter.bankAccounts?.[0];
    const bankDetails = bankInfo
      ? `${bankInfo.bankName} - STK: ${bankInfo.accountNumber}`
      : "tài khoản đã đăng ký";

    await Notification.create({
      user: booking.renter._id,
      type: "refund",
      title: "Yêu cầu hoàn tiền đã được duyệt!",
      message: `Yêu cầu hoàn tiền cho đơn hủy #${booking._id
        .toString()
        .slice(
          -6
        )} đã được admin duyệt thành công.\n\n Số tiền hoàn trả: ${refundAmount.toLocaleString(
        "vi-VN"
      )}đ\n Tài khoản nhận: ${bankDetails}\n Thời gian duyệt: ${new Date().toLocaleString(
        "vi-VN"
      )}\n\nSố tiền sẽ được chuyển vào tài khoản ngân hàng của bạn .`,
      booking: booking._id,
      vehicle: booking.vehicle._id,
      data: {
        refundAmount,
        bankInfo: bankDetails,
        approvedAt: new Date(),
        bookingCode: booking._id.toString().slice(-6),
      },
    });

    res.status(200).json({
      success: true,
      message: "Đã duyệt yêu cầu hoàn tiền thành công",
      data: {
        booking,
        refundAmount,
        transaction: refundTransaction,
      },
    });
  } catch (error) {
    console.error("Error approving refund:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi duyệt yêu cầu hoàn tiền",
    });
  }
};

// Duyệt bồi thường cho owner
const approveOwnerCompensation = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { note } = req.body;

    const booking = await Booking.findById(bookingId)
      .populate({
        path: "vehicle",
        populate: {
          path: "owner",
          select: "name email bankAccounts"
        }
      });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Không tìm thấy booking",
      });
    }

    if (booking.refundStatusOwner !== "pending") {
      return res.status(400).json({
        success: false,
        message: "Yêu cầu bồi thường này đã được xử lý hoặc không tồn tại",
      });
    }

    const compensationAmount = booking.totalRefundForOwnerCancel || 0;

    if (compensationAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Số tiền bồi thường không hợp lệ",
      });
    }

    // Cập nhật trạng thái bồi thường
    booking.refundStatusOwner = "approved";
    booking.ownerCompensationApprovedAt = new Date();
    booking.ownerCompensationApprovedBy = req.user._id;
    booking.ownerCompensationNote = note || "";
    await booking.save();

    // Tìm transaction pending hiện có hoặc tạo mới nếu không có
    let compensationTransaction = await Transaction.findOne({
      booking: booking._id,
      user: booking.vehicle.owner._id,
      type: "bank_transfer_compensation",
      status: "PENDING"
    });

    if (compensationTransaction) {
      // Cập nhật transaction pending hiện có
      compensationTransaction.status = "COMPLETED";
      compensationTransaction.bankTransferInfo = {
        recipientName: booking.vehicle.owner.name,
        accountNumber:
          booking.vehicle.owner.bankAccounts?.[0]?.accountNumber || "",
        bankName: booking.vehicle.owner.bankAccounts?.[0]?.bankName || "",
        accountHolder:
          booking.vehicle.owner.bankAccounts?.[0]?.accountHolder ||
          booking.vehicle.owner.name,
        transferDate: new Date(),
        transferAmount: compensationAmount,
        transferNote:
          note || `Bồi thường hủy đơn #${booking._id.toString().slice(-6)}`,
      };
      await compensationTransaction.save();
    } else {
      // Tạo transaction mới nếu không tìm thấy pending
      compensationTransaction = new Transaction({
        booking: booking._id,
        user: booking.vehicle.owner._id,
        amount: compensationAmount,
        type: "bank_transfer_compensation",
        status: "COMPLETED",
        paymentMethod: "bank_transfer",
        description: `Bồi thường hủy đơn #${booking._id.toString().slice(-6)}`,
        bankTransferInfo: {
          recipientName: booking.vehicle.owner.name,
          accountNumber:
            booking.vehicle.owner.bankAccounts?.[0]?.accountNumber || "",
          bankName: booking.vehicle.owner.bankAccounts?.[0]?.bankName || "",
          accountHolder:
            booking.vehicle.owner.bankAccounts?.[0]?.accountHolder ||
            booking.vehicle.owner.name,
          transferDate: new Date(),
          transferAmount: compensationAmount,
          transferNote:
            note || `Bồi thường hủy đơn #${booking._id.toString().slice(-6)}`,
        },
      });
      await compensationTransaction.save();

      // Thêm transaction vào booking nếu là transaction mới
      booking.transactions.push(compensationTransaction._id);
      await booking.save();
    }

    // Tạo thông báo cho owner
    const bankInfo = booking.vehicle.owner.bankAccounts?.[0];
    const bankDetails = bankInfo
      ? `${bankInfo.bankName} - STK: ${bankInfo.accountNumber}`
      : "tài khoản đã đăng ký";

    await Notification.create({
      user: booking.vehicle.owner._id,
      type: "compensation",
      title: "💰 Yêu cầu bồi thường đã được duyệt!",
      message: `Yêu cầu bồi thường cho đơn hủy #${booking._id
        .toString()
        .slice(
          -6
        )} đã được admin duyệt thành công.\n\n💰 Số tiền bồi thường: ${compensationAmount.toLocaleString(
        "vi-VN"
      )}đ\n🏦 Tài khoản nhận: ${bankDetails}\n⏰ Thời gian duyệt: ${new Date().toLocaleString(
        "vi-VN"
      )}\n\nSố tiền sẽ được chuyển vào tài khoản ngân hàng của bạn trong vòng 1-3 ngày làm việc.`,
      booking: booking._id,
      vehicle: booking.vehicle._id,
      data: {
        compensationAmount,
        bankInfo: bankDetails,
        approvedAt: new Date(),
        bookingCode: booking._id.toString().slice(-6),
      },
    });

    res.status(200).json({
      success: true,
      message: "Đã duyệt yêu cầu bồi thường thành công",
      data: {
        booking,
        compensationAmount,
        transaction: compensationTransaction,
      },
    });
  } catch (error) {
    console.error("Error approving owner compensation:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi duyệt yêu cầu bồi thường",
    });
  }
};

// ✅ Export tất cả ở một chỗ duy nhất
module.exports = {
  getOwnerRequests,
  updateOwnerRequestStatus,
  getDriverLicenseRequests,
  updateDriverLicenseStatus,
  getPendingVehicleApprovals,
  getPendingVehicleDetail,
  reviewVehicleApproval,
  getDashboardStats,
  getPendingPayoutRequests,
  approvePayoutRequest,
  getPendingDepositRefundRequests,
  createOrUpdateDriverLicense,
  getPendingCCCDRequests,
  updateCCCDStatus,
  getAllUsers,
  getUserDetail,
  blockUser,
  getPendingCancelRequests,
  getAllPendingRefundRequests,
  approveRefund,
  approveOwnerCompensation,
};
