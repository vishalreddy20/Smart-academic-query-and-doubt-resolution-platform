import crypto from 'crypto';
import OTP from '../models/OTP.js';
import { sendOTPEmail, isEmailConfigured } from './emailService.js';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const createAndSendOTP = async (email, purpose = 'signup') => {
  try {
    const normalizedEmail = normalizeEmail(email);

    // Delete any existing OTP for this email
    await OTP.deleteMany({ email: normalizedEmail });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_TIME) * 60 * 1000); // 5 minutes

    const otpDoc = await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt,
      purpose,
    });

    if (!isEmailConfigured()) {
      throw new Error('Email service is not configured');
    }

    await sendOTPEmail(normalizedEmail, otp);

    return {
      success: true,
      message: 'OTP sent to email',
      otpId: otpDoc._id,
      deliveryMethod: 'email',
    };
  } catch (error) {
    throw new Error('Failed to create OTP: ' + error.message);
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const normalizedEmail = normalizeEmail(email);
    const otpDoc = await OTP.findOne({ email: normalizedEmail });

    if (!otpDoc) {
      throw new Error('OTP not found. Please request a new one.');
    }

    // Check if OTP has expired
    if (new Date() > otpDoc.expiresAt) {
      await OTP.deleteOne({ _id: otpDoc._id });
      throw new Error('OTP has expired. Please request a new one.');
    }

    // Check max attempts
    if (otpDoc.attempts >= otpDoc.maxAttempts) {
      await OTP.deleteOne({ _id: otpDoc._id });
      throw new Error('Maximum OTP verification attempts exceeded. Please request a new one.');
    }

    // Verify OTP
    if (otpDoc.otp !== otp) {
      otpDoc.attempts += 1;
      await otpDoc.save();
      throw new Error(`Invalid OTP. ${otpDoc.maxAttempts - otpDoc.attempts} attempts remaining.`);
    }

    // OTP verified
    otpDoc.isVerified = true;
    await otpDoc.save();

    return {
      success: true,
      message: 'OTP verified successfully',
    };
  } catch (error) {
    throw error;
  }
};

export const resendOTP = async (email, purpose = 'signup') => {
  try {
    const normalizedEmail = normalizeEmail(email);

    // Delete existing OTP
    await OTP.deleteMany({ email: normalizedEmail });
    
    // Generate new OTP
    return await createAndSendOTP(normalizedEmail, purpose);
  } catch (error) {
    throw new Error('Failed to resend OTP: ' + error.message);
  }
};

export const deleteExpiredOTPs = async () => {
  try {
    await OTP.deleteMany({ expiresAt: { $lt: new Date() } });
  } catch (error) {
    console.error('Error deleting expired OTPs:', error);
  }
};
