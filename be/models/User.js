const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: false },
  phone: String,
  role: { type: [String], enum: ['renter', 'owner', 'admin'], default: ['renter'] },
  
  // Account status - true: active, false: blocked
  isActive: { type: Boolean, default: true },

  // Verification email status fields
  emailVerificationToken: String, // Field to store the email verification token (OTP)
  emailVerificationExpires: Date, // Field to store the expiration time for the token
  is_verified: { type: Boolean, default: false }, // Email verification status
  
   // Phone verification fields
   phoneVerificationToken: String, // Field to store the phone verification token (OTP)
   phoneVerificationExpires: Date, // Field to store the expiration time for the phone token
   is_phone_verified: { type: Boolean, default: false }, // Phone verification status

  avatar_url: String,


  cccd_full_name:String,
  cccd_number: String,
  cccd_image: String,
  cccd_birth_date:Date,
  cccd_verification_status: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none',
  },

  driver_license_number: String,
  driver_license_front_url: String,
  driver_license_full_name: String, // Họ tên trên GPLX
  driver_license_birth_date: Date,
  driver_license_image: {
    type: String,
  },
  driver_license_verification_status: {
    type: String,
    enum: ['none', 'pending', 'verified', 'rejected'],
    default: 'none',
  },

  bankAccounts: [
    {
      accountNumber: { type: String, required: true },
      bankName: { type: String, required: true },
      accountHolder: { type: String, required: true },
      createdAt: { type: Date, default: Date.now }
    }
  ],

  created_at: { type: Date, default: Date.now },

  googleId: { type: String, unique: true, sparse: true },
  loginMethods: { type: [String], default: ['password'] },

  // Fields for Owner Registration and Admin Review
  owner_request_status: {
    type: String,
    enum: ['none', 'pending', 'approved', 'rejected'],
    default: 'none'
  },
  owner_request_submitted_at: { type: Date },
  owner_request_reviewed_at: { type: Date },
  owner_request_rejection_reason: { type: String },
  phone_otp: {
    type: String,
    default: null,
  },
  phone_otp_expires: {
    type: Date,
    default: null,
  },

  // xác minh email
  
  favorites: [{
    type: mongoose.Schema.Types.ObjectId,
  }],
});

// To check if a user is an owner, check if 'owner' is present in the role array:
// user.role.includes('owner')

// To check if a user is a renter and can rent, check if 'renter' role is present AND is_license_verified_for_renter is true:
// user.role.includes('renter') && user.is_license_verified_for_renter

// To check if a user is an owner and can list cars, check if 'owner' role is present AND is_identity_verified_for_owner is true:
// user.role.includes('owner') && user.is_identity_verified_for_owner

module.exports = mongoose.model('User', userSchema);