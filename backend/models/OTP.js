import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  otp: {
    type: String,
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  maxAttempts: {
    type: Number,
    default: 5,
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }, // Auto-delete after expiry
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  purpose: {
    type: String,
    enum: ['signup', 'forgot-password', 'email-change'],
    default: 'signup',
  },
}, { timestamps: true });

export default mongoose.model('OTP', otpSchema);
