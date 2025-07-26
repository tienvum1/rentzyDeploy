const User = require("../models/User");
const Transaction = require("../models/Transaction");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const bcrypt = require("bcryptjs");
const path = require("path");
const cloudinary = require("../utils/cloudinary");
const fs = require("fs");

// Initialize Twilio client
const twilio = require("twilio");
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

const axios = require("axios");
const { URL } = require("url");
const otpGenerator = require("otp-generator");
const FormData = require("form-data");
dotenv.config();

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password_hash");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json({ user });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
const sendVerificationSMS = async (phone, otp) => {
  try {
    // Validate Twilio configuration
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
      console.error("Twilio configuration is missing. Please check your .env file.");
      throw new Error("Dịch vụ SMS không được cấu hình. OTP (dev only): " + otp);
    }

    // Format phone number for Vietnam (+84)
    let formattedPhone = phone;
    if (phone.startsWith('0')) {
      formattedPhone = '+84' + phone.substring(1);
    } else if (!phone.startsWith('+')) {
      formattedPhone = '+84' + phone;
    }

    const message = `Mã xác minh Rentzy của bạn là: ${otp}. Mã có hiệu lực trong 10 phút.`;

    console.log(`Sending SMS to ${formattedPhone} via Twilio...`);

    const twilioMessage = await twilioClient.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone
    });

    console.log(`SMS sent successfully. Message SID: ${twilioMessage.sid}`);
    return twilioMessage;

  } catch (error) {
    console.error("Error sending SMS via Twilio:", error.message);
    
    // Handle specific Twilio errors
    if (error.code) {
      switch (error.code) {
        case 21211:
          throw new Error("Số điện thoại không hợp lệ.");
        case 21408:
          throw new Error("Không thể gửi tin nhắn đến số điện thoại này.");
        case 21614:
          throw new Error("Số điện thoại không hợp lệ cho quốc gia này.");
        default:
          throw new Error("Lỗi khi gửi tin nhắn SMS: " + error.message);
      }
    }
    
    throw new Error("Không thể gửi tin nhắn SMS. Vui lòng thử lại sau.");
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Vui lòng nhập email" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(200).json({ message: "Email không tồn tại" }); // Không tiết lộ email tồn tại

    // Tạo token reset password (JWT, expires in 15m)
    const resetToken = jwt.sign({ user_id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    // Link reset password
    const resetLink = `${process.env.CLIENT_ORIGIN}/reset-password?token=${resetToken}`;

    // Gửi email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      to: email,
      subject: "Đặt lại mật khẩu Rentzy",
      html: `<p>Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn vào <a href="${resetLink}">đây</a> để đặt lại mật khẩu. Link này sẽ hết hạn sau 15 phút.</p>`,
    });

    res.json({ message: "Chúng tôi đã gửi hướng dẫn đặt lại mật khẩu." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Lỗi server khi gửi email." });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, password } = req.body;
  console.log(token, password);
  if (!token || !password)
    return res.status(400).json({ message: "Thiếu token hoặc mật khẩu mới" });

  try {
    // Xác thực token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user_id);
    if (!user)
      return res
        .status(400)
        .json({ message: "Token không hợp lệ hoặc user không tồn tại" });

    // Đổi mật khẩu
    user.password_hash = await bcrypt.hash(password, 10);
    await user.save();

    res.json({
      message:
        "Đặt lại mật khẩu thành công! Bạn có thể đăng nhập bằng mật khẩu mới.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn." });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "avatars",
      width: 150,
      height: 150,
      crop: "fill",
    });

    const user = await User.findById(req.user._id);
    user.avatar_url = result.secure_url;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      message: "Avatar updated successfully",
      avatar_url: user.avatar_url,
    });
  } catch (error) {
    console.error("Error updating avatar:", error);
    res.status(500).json({ message: "Error updating avatar" });
  }
};

exports.updateProfile = async (req, res) => {
  const userId = req.user._id;
  console.log("updateProfile req.body:", req.body);
  try {
    const { name, phone, cccd_number } = req.body;
    let updateData = { name, phone, cccd_number };
    const streamUpload = (buffer, publicId) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "rentcar/driver_license", public_id: publicId },
          (error, result) => {
            if (result) resolve(result);
            else reject(error);
          }
        );
        stream.end(buffer);
      });
    };
    if (req.files) {
      if (req.files.driver_license_front && req.files.driver_license_front[0]) {
        const resultFront = await streamUpload(
          req.files.driver_license_front[0].buffer,
          `front_${userId}_${Date.now()}`
        );
        updateData.driver_license_front_url = resultFront.secure_url;
      }
      if (req.files.driver_license_back && req.files.driver_license_back[0]) {
        const resultBack = await streamUpload(
          req.files.driver_license_back[0].buffer,
          `back_${userId}_${Date.now()}`
        );
        updateData.driver_license_back_url = resultBack.secure_url;
      }
    }
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    });
    res.json({
      message: "Cập nhật profile thành công!",
      user,
      requiresVerification: false,
    });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Lỗi server khi cập nhật profile." });
  }
};

// Function to generate a random OTP
const generateOTP = () => {
  // Generate a 6-digit number
  const otp = Math.floor(100000 + Math.random() * 900000);
  return otp.toString();
};

// Function to send email verification OTP
const sendVerificationEmail = async (email, otp) => {
  console.log(`Sending verification email to ${email} with OTP: ${otp}`);

  try {
    // Create a transporter using Gmail service
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail address from environment variables
        pass: process.env.EMAIL_PASS, // Your Gmail password or app password from environment variables
      },
    });

    // Send the email
    await transporter.sendMail({
      to: email, // Recipient's email address
      subject: "Mã xác minh email Rentzy của bạn", // Email subject
      html: `<p>Mã xác minh email của bạn là: <strong>${otp}</strong></p><p>Mã này sẽ hết hạn sau 10 phút.</p>`, // Email body with OTP
    });

    console.log("Verification email sent successfully.");
  } catch (error) {
    console.error("Error sending verification email:", error);
    // Depending on requirements, you might want to throw the error or handle it silently
    throw new Error("Failed to send verification email."); // Propagate the error
  }
};

// @desc    Update user email and send verification OTP
// @route   PUT /api/user/update-email
// @access  Private
exports.updateEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    user.new_email = email;
    user.email_otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    user.email_otp_expires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save({ validateBeforeSave: false });

    // Gửi email OTP ở đây (logic gửi email)

    res.status(200).send("OTP sent to new email address for verification.");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// @desc    Verify email using OTP
// @route   POST /api/user/verify-email-otp
// @access  Private
exports.verifyEmailOtp = async (req, res) => {
  const { otp } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (
      !user ||
      !user.new_email ||
      user.email_otp !== otp ||
      user.email_otp_expires < Date.now()
    ) {
      return res.status(400).send("Invalid or expired OTP.");
    }

    user.email = user.new_email;
    user.new_email = undefined;
    user.email_otp = undefined;
    user.email_otp_expires = undefined;
    await user.save({ validateBeforeSave: false });

    res.send("Email updated successfully.");
  } catch (error) {
    res.status(500).send("Server error");
  }
};

// @desc    Resend email verification OTP
// @route   POST /api/user/resend-email-otp
// @access  Private
exports.resendEmailOtp = async (req, res) => {
  // Logic tương tự updateEmail nhưng không đổi new_email
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.new_email) {
      return res.status(400).send("No pending email update found.");
    }
    user.email_otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      specialChars: false,
    });
    user.email_otp_expires = Date.now() + 10 * 60 * 1000; // 10 phút
    await user.save({ validateBeforeSave: false });
    // Gửi lại email
    res.send("OTP resent.");
  } catch (error) {
    res.status(500).send("Server error");
  }
};


// @desc    Update user phone and send verification OTP
// @route   PUT /api/user/update-phone
// @access  Private
exports.updatePhone = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Số điện thoại mới là bắt buộc." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Check if the new phone is the same as the current one
    if (user.phone === phone) {
      // If phone is the same and already verified, just return success
      if (user.is_phone_verified) {
        return res.status(200).json({
          message: "Số điện thoại đã được xác thực và không thay đổi.",
        });
      }
    }

    // Update phone and mark as verified immediately (no OTP required)
    user.phone = phone;
    user.is_phone_verified = true; // Set to true immediately
    
    // Clear any existing OTP data
    user.phone_otp = undefined;
    user.phone_otp_expires = undefined;

    await user.save();

    res.status(200).json({
      message: "Số điện thoại đã được cập nhật và xác thực thành công.",
      requiresVerification: false, // No verification needed
    });
  } catch (error) {
    console.error("Error updating phone:", error);
    // Handle duplicate phone error specifically
    if (error.code === 11000 && error.keyPattern && error.keyPattern.phone) {
      return res.status(409).json({
        message: "Số điện thoại này đã được sử dụng bởi người dùng khác.",
      });
    }
    // Handle other errors
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi cập nhật số điện thoại." });
  }
};

// @desc    Verify phone using OTP
// @route   POST /api/user/verify-phone-otp
// @access  Private
exports.verifyPhoneOtp = async (req, res) => {
  const { otp } = req.body;

  if (!otp) {
    return res.status(400).json({ message: "Mã OTP là bắt buộc." });
  }

  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "Người dùng không tồn tại." });
    }

    // Check if token matches and is not expired
    if (user.phone_otp !== otp || user.phone_otp_expires < new Date()) {
      // Optionally clear token after failed attempt if desired, but for now just return error
      return res
        .status(400)
        .json({ message: "Mã OTP không hợp lệ hoặc đã hết hạn." });
    }

    // OTP is valid, verify phone and clear token fields
    user.is_phone_verified = true;
    user.phone_otp = undefined;
    user.phone_otp_expires = undefined;

    await user.save();

    res
      .status(200)
      .json({ message: "Số điện thoại đã được xác minh thành công!" });
  } catch (error) {
    console.error("Error verifying phone OTP:", error);
    res
      .status(500)
      .json({ message: "Đã xảy ra lỗi khi xác minh số điện thoại." });
  }
};

// @desc    Resend phone verification OTP
// @route   POST /api/user/resend-phone-otp
// @access  Private
exports.resendPhoneOtp = async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    return res.status(400).json({ message: "Số điện thoại mới là bắt buộc." });
  }

  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.phone) {
      return res
        .status(404)
        .json({ message: "Không tìm thấy người dùng hoặc số điện thoại." });
    }

    if (user.is_phone_verified) {
      return res
        .status(400)
        .json({ message: "Số điện thoại đã được xác thực." });
    }

    // Generate a new OTP and expiry
    const otp = generateOTP();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    // Update user with new OTP
    user.phone_otp = otp;
    user.phone_otp_expires = otpExpires;
    await user.save();

    // Resend SMS using Twilio
    try {
      await sendVerificationSMS(user.phone, otp);
      res.status(200).json({ message: "Đã gửi lại mã OTP thành công." });
    } catch (smsError) {
      console.error("Error resending SMS:", smsError.message);
      res.status(500).json({ 
        message: "Không thể gửi lại mã OTP. Vui lòng thử lại sau." 
      });
    }
  } catch (error) {
    console.error("Lỗi khi gửi lại OTP điện thoại:", error);
    res
      .status(500)
      .json({ message: error.message || "Lỗi server khi gửi lại OTP." });
  }
};

// @desc    Change user password
// @route   PUT /api/user/change-password
// @access  Private
exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ message: "Mật khẩu hiện tại không đúng" });
    }

    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save({ validateBeforeSave: false });

    res.json({ message: "Mật khẩu đã được thay đổi thành công" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// @desc    Create or update driver license info
// @route   POST /api/user/create-driver-license
// @access  Private
exports.createDriverLicense = async (req, res) => {
  try {
    const {
      driver_license_full_name,
      driver_license_birth_date,
      driver_license_number,
    } = req.body;
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let imageUrl = user.driver_license_image; // Giữ lại ảnh cũ làm mặc định

    // Nếu có file mới được tải lên, upload nó và cập nhật URL
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "driver_licenses",
      });
      imageUrl = result.secure_url;
    }

    // Cập nhật thông tin cho người dùng
    user.driver_license_full_name = driver_license_full_name;
    user.driver_license_birth_date = driver_license_birth_date;
    user.driver_license_number = driver_license_number;
    user.driver_license_image = imageUrl; // Luôn cập nhật URL ảnh
    user.driver_license_verification_status = "pending"; // Đặt trạng thái chờ duyệt

    await user.save({ validateBeforeSave: false });

    res
      .status(200)
      .json({ message: "Thông tin GPLX đã được gửi để chờ duyệt!", user });
  } catch (error) {
    console.error("Error creating/updating driver license:", error);
    res.status(500).json({ message: "Lỗi khi xử lý thông tin GPLX." });
  }
};

// @desc    Update driver license verification status by admin
// @route   PUT /api/user/driver-license-status/:id
// @access  Private/Admin
exports.updateDriverLicenseVerificationStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["verified", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.driver_license_verification_status = status;
    await user.save({ validateBeforeSave: false });

    res.json({ message: `Driver license status updated to ${status}` });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server error while updating license status" });
  }
};

exports.getBankAccounts = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("bankAccounts");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json({ accounts: user.bankAccounts || [] });
  } catch (err) {
    console.error("getBankAccounts error:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi lấy danh sách tài khoản ngân hàng." });
  }
};

exports.addBankAccount = async (req, res) => {
  try {
    const { accountNumber, bankName, accountHolder } = req.body;
    if (!accountNumber || !bankName || !accountHolder) {
      return res.status(400).json({
        message: "Vui lòng nhập đầy đủ thông tin tài khoản ngân hàng.",
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Kiểm tra tên chủ tài khoản phải trùng với tên trong GPLX hoặc CCCD
    const validNames = [];
    if (user.driver_license_full_name) {
      validNames.push(user.driver_license_full_name.trim().toLowerCase());
    }
    if (user.cccd_full_name) {
      validNames.push(user.cccd_full_name.trim().toLowerCase());
    }
    if (user.name) {
      validNames.push(user.name.trim().toLowerCase());
    }

    const accountHolderLower = accountHolder.trim().toLowerCase();
    const isValidName = validNames.some((name) => name === accountHolderLower);

    if (!isValidName) {
      let errorMessage = "Tên chủ tài khoản phải trùng với tên trong ";
      const availableNames = [];
      if (user.driver_license_full_name) availableNames.push("GPLX");
      if (user.cccd_full_name) availableNames.push("CCCD");
      if (user.name && !user.driver_license_full_name && !user.cccd_full_name)
        availableNames.push("hồ sơ cá nhân");

      if (availableNames.length > 0) {
        errorMessage += availableNames.join(" hoặc ");
        errorMessage += ". Tên hợp lệ: ";
        const validNamesDisplay = [];
        if (user.driver_license_full_name)
          validNamesDisplay.push(user.driver_license_full_name);
        if (user.cccd_full_name) validNamesDisplay.push(user.cccd_full_name);
        if (user.name && !user.driver_license_full_name && !user.cccd_full_name)
          validNamesDisplay.push(user.name);
        errorMessage += validNamesDisplay.join(", ");
      } else {
        errorMessage =
          "Vui lòng xác thực GPLX hoặc CCCD trước khi thêm tài khoản ngân hàng.";
      }

      return res.status(400).json({ message: errorMessage });
    }

    // Kiểm tra trùng lặp tài khoản
    const existingAccount = user.bankAccounts.find(
      (acc) => acc.accountNumber === accountNumber && acc.bankName === bankName
    );
    if (existingAccount) {
      return res
        .status(400)
        .json({ message: "Tài khoản ngân hàng này Đã được thêm trước đó." });
    }

    user.bankAccounts.push({ accountNumber, bankName, accountHolder });
    await user.save();
    res
      .status(200)
      .json({ message: "Thêm tài khoản ngân hàng thành công!", user });
  } catch (err) {
    console.error("addBankAccount error:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi thêm tài khoản ngân hàng." });
  }
};

exports.deleteBankAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.bankAccounts = user.bankAccounts.filter(
      (acc) => acc._id.toString() !== accountId
    );
    await user.save();
    res.status(200).json({
      message: "Xóa tài khoản ngân hàng thành công!",
      accounts: user.bankAccounts,
    });
  } catch (err) {
    console.error("deleteBankAccount error:", err);
    res
      .status(500)
      .json({ message: "Lỗi server khi xóa tài khoản ngân hàng." });
  }
};

// @desc    Create or update CCCD info
// @route   POST /api/user/create-cccd
// @access  Private
exports.createCCCD = async (req, res) => {
  try {
    const { cccd_number, cccd_full_name } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    let frontUrl = user.cccd_front_url;
    let backUrl = user.cccd_back_url;
    // Upload ảnh nếu có file mới
    if (req.files && req.files.cccd_front && req.files.cccd_front[0]) {
      const resultFront = await cloudinary.uploader.upload_stream_promise(
        req.files.cccd_front[0].buffer,
        {
          folder: "rentzy/cccd",
        }
      );
      frontUrl = resultFront.secure_url;
    }
    if (req.files && req.files.cccd_back && req.files.cccd_back[0]) {
      const resultBack = await cloudinary.uploader.upload_stream_promise(
        req.files.cccd_back[0].buffer,
        {
          folder: "rentzy/cccd",
        }
      );
      backUrl = resultBack.secure_url;
    }
    user.cccd_number = cccd_number;
    user.name = cccd_full_name;
    user.cccd_front_url = frontUrl;
    user.cccd_back_url = backUrl;
    user.owner_request_status = "pending";
    await user.save({ validateBeforeSave: false });
    res
      .status(200)
      .json({ message: "Thông tin CCCD đã được gửi để chờ duyệt!", user });
  } catch (error) {
    console.error("Error creating/updating CCCD:", error);
    res.status(500).json({ message: "Lỗi khi xử lý thông tin CCCD." });
  }
};

// @desc    Verify CCCD info with FPT.AI OCR
// @route   POST /api/user/verify-cccd
// @access  Private
exports.verifyCCCD = async (req, res) => {
  try {
    const { cccd_number, full_name, birth_date } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    // Upload ảnh lên Cloudinary nếu có file mới
    let imageUrl = user.cccd_image;
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "cccds",
      });
      imageUrl = result.secure_url;
    }
    // Gọi FPT.AI OCR CCCD
    const axios = require("axios");
    const FormData = require("form-data");
    const form = new FormData();
    form.append("image", fs.createReadStream(req.file.path));
    const apiKey = "1Bqxz1oBUZ0AIERNIjXlJ72q0U8pj5j3";
    const ocrRes = await axios.post("https://api.fpt.ai/vision/idr/vnm", form, {
      headers: {
        ...form.getHeaders(),
        "api-key": apiKey,
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });
    const ocr = ocrRes.data.data[0] || {};
    // So sánh trực tiếp các trường
    const ocrNumber = (ocr.id || "").trim();
    const ocrName = (ocr.name || "").trim();
    const ocrDob = ocr.dob ? ocr.dob.split("/").reverse().join("-") : "";
    if (!ocrNumber || !ocrName || !ocrDob) {
      return res.status(400).json({
        success: false,
        message: "Không nhận diện được đủ thông tin từ ảnh CCCD.",
      });
    }
    if (
      ocrNumber !== cccd_number.trim() ||
      ocrName !== full_name.trim() ||
      ocrDob !== birth_date.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Thông tin trên ảnh CCCD không khớp với thông tin bạn nhập. Vui lòng kiểm tra lại!",
      });
    }
    // Nếu khớp hoàn toàn, lưu và trả về thành công
    user.cccd_number = cccd_number;
    user.cccd_full_name = full_name;
    user.cccd_birth_date = birth_date;
    user.cccd_image = imageUrl;
    user.cccd_verification_status = "pending";
    await user.save({ validateBeforeSave: false });
    res.status(200).json({
      success: true,
      message: "Thông tin CCCD đã được gửi để chờ admin duyệt!",
      user,
      ocr,
      input: { cccd_number, full_name, birth_date },
    });
  } catch (error) {
    console.error("Error verifying CCCD:", error);
    res
      .status(500)
      .json({ success: false, message: "Lỗi khi xử lý thông tin CCCD." });
  }
};

// @desc    Block user (set is_verified = false) and send email
// @route   PUT /api/admin/users/:id/block
// @access  Private/Admin
exports.blockUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role.includes("admin"))
      return res.status(403).json({ message: "Không thể block admin." });
    user.isActive = false;
    await user.save({ validateBeforeSave: false });

    // Gửi email thông báo
    const nodemailer = require("nodemailer");
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    await transporter.sendMail({
      to: user.email,
      subject: "Tài khoản của bạn đã bị khóa",
      html: `<p>Tài khoản của bạn trên Rentzy đã bị khóa bởi quản trị viên. Nếu bạn cho rằng đây là nhầm lẫn, vui lòng liên hệ hỗ trợ.</p>`,
    });

    res.json({
      success: true,
      message: "User has been blocked and notified by email.",
    });
  } catch (error) {
    console.error("Block user error:", error);
    res.status(500).json({ message: "Lỗi server khi block user." });
  }
};

// @desc    Get user transactions
// @route   GET /api/user/my-transactions
// @access  Private
exports.getUserTransactions = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const { type, status, paymentMethod } = req.query;

    // Build filter query
    const filter = { user: req.user._id };
    if (type) filter.type = type;
    if (status) filter.status = status;
    if (paymentMethod) filter.paymentMethod = paymentMethod;

    // Get transactions with pagination
    const transactions = await Transaction.find(filter)
      .populate("booking", "_id startDate endDate vehicle")
      .populate({
        path: "booking",
        populate: {
          path: "vehicle",
          select: "name model images",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Transaction.countDocuments(filter);
    const totalPages = Math.ceil(total / limit);

    // Calculate summary statistics
    const summary = await Transaction.aggregate([
      { $match: { user: req.user._id } },
      {
        $group: {
          _id: null,
          totalTransactions: { $sum: 1 },
          totalAmount: { $sum: "$amount" },
          completedTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, 1, 0] },
          },
          completedAmount: {
            $sum: { $cond: [{ $eq: ["$status", "COMPLETED"] }, "$amount", 0] },
          },
          pendingTransactions: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, 1, 0] },
          },
          pendingAmount: {
            $sum: { $cond: [{ $eq: ["$status", "PENDING"] }, "$amount", 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: {
        transactions,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary: summary[0] || {
          totalTransactions: 0,
          totalAmount: 0,
          completedTransactions: 0,
          completedAmount: 0,
          pendingTransactions: 0,
          pendingAmount: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching user transactions:", error);
    res.status(500).json({
      success: false,
      message: "Lỗi server khi lấy danh sách giao dịch",
    });
  }
};
