const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const { protect } = require("../middleware/authMiddleware");
const multer = require('multer');
const upload = multer({ dest: 'uploads/' }); // Thay đổi: Lưu file tạm thời vào thư mục 'uploads/'
const { addBankAccount } = require('../controller/userController');
const uploadMemory = require('../middleware/upload');
const { createOrUpdateDriverLicense } = require('../controller/adminController');
const { blockUser } = require('../controller/userController');

// Middleware kiểm tra admin
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role && req.user.role.includes('admin')) {
    next();
  } else {
    res.status(403).json({ message: 'Admin access required.' });
  }
};


router.get("/profile", protect, userController.getProfile);
router.post('/forgot-password', userController.forgotPassword);
router.post('/reset-password', userController.resetPassword);
router.post('/update-avatar', protect, upload.single('avatar'), userController.updateAvatar);
router.put('/update-profile', protect, upload.fields([
  { name: 'driver_license_front', maxCount: 1 },
  { name: 'driver_license_back', maxCount: 1 }
]), userController.updateProfile);

// New route for creating driver license info
router.post('/create-driver-license', protect, upload.single('driver_license_image'), createOrUpdateDriverLicense);

// New routes for email update and verification
router.put('/update-email', protect, userController.updateEmail);
router.post('/verify-email-otp', protect, userController.verifyEmailOtp);
router.post('/resend-email-otp', protect, userController.resendEmailOtp);

// New route for phone update (will require a new controller function)
router.put('/update-phone', protect, userController.updatePhone); // Link to a future updatePhone controller function

// New route for changing password
router.put('/change-password', protect, userController.changePassword); // Link to a future changePassword controller function

// Admin route to update driver license verification status
router.put('/driver-license-status/:id', protect, userController.updateDriverLicenseVerificationStatus);

// New route for verifying phone OTP
router.post('/verify-phone-otp', protect, userController.verifyPhoneOtp);

// New route for resending phone OTP
router.post('/resend-phone-otp', protect, userController.resendPhoneOtp);

// Bank account management routes
router.get('/bank-account', protect, userController.getBankAccounts);
router.post('/bank-account', protect, userController.addBankAccount);
router.delete('/bank-account/:accountId', protect, userController.deleteBankAccount);

// New route for creating CCCD info
router.post('/create-cccd', protect, uploadMemory.fields([
  { name: 'cccd_front', maxCount: 1 },
  { name: 'cccd_back', maxCount: 1 }
]), userController.createCCCD);

// New route for verifying CCCD with AI OCR
router.post('/verify-cccd', protect, upload.single('cccd_image'), userController.verifyCCCD);

// Admin block user
router.put('/admin/users/:id/block', protect, adminOnly, blockUser);

// Get user transactions
router.get('/my-transactions', protect, userController.getUserTransactions);

module.exports = router;
