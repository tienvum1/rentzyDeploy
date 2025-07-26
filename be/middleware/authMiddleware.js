// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // Check for token in cookies (for web) or Authorization header (for mobile/API clients)
  if (req.cookies && req.cookies.token) {
    token = req.cookies.token;
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res
      .status(401)
      .json({ message: "Không có quyền truy cập, vui lòng đăng nhập" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Always fetch the user directly from the database
    // This ensures we always have the most up-to-date user information,
    // especially after critical changes like phone verification.
    const user = await User.findById(decoded.user_id).select("-password_hash");

    if (!user) {
        return res.status(401).json({ message: "Người dùng không tồn tại." });
    }

    // Kiểm tra tài khoản có bị khóa không
    if (user.isActive === false) {
        return res.status(403).json({ message: "Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên." });
    }

    req.user = user;
    
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user && req.user.role && Array.isArray(req.user.role) && req.user.role.includes('admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Access denied. Admin role required.' });
  }
};

const verifyRenterRequirements = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!user.is_phone_verified) {
      return res.status(403).json({ 
        message: "Phone number verification required",
        requiresPhoneVerification: true
      });
    }

    if (user.driver_license_verification_status !== 'verified') {
      return res.status(403).json({ 
        message: "Driver's license verification required",
        requiresLicenseVerification: true
      });
    }

    next();
  } catch (error) {
    console.error("Error in verifyRenterRequirements:", error);
    res.status(500).json({ message: "Error checking renter requirements" });
  }
};

module.exports = {
  protect,
  adminOnly,
  verifyRenterRequirements
};
