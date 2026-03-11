import crypto from 'crypto';
import OTP from '../models/OTP.js';
import { sendOTPEmail, isEmailConfigured } from './emailService.js';

export const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};

export const createAndSendOTP = async (email, purpose = 'signup') => {
  try {
    // Delete any existing OTP for this email
    await OTP.deleteMany({ email });

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + parseInt(process.env.OTP_EXPIRE_TIME) * 60 * 1000); // 5 minutes

    const otpDoc = await OTP.create({
      email,
      otp,
      expiresAt,
      purpose,
    });

    const isDevelopment = process.env.NODE_ENV !== 'production';

    if (isEmailConfigured()) {
      await sendOTPEmail(email, otp);
    } else if (isDevelopment) {
      console.warn(`[DEV OTP FALLBACK] Email transport is not configured. OTP for ${email}: ${otp}`);
    } else {
      throw new Error('Email service is not configured');
    }

    return {
      success: true,
      message: 'OTP sent to email',
      otpId: otpDoc._id,
      deliveryMethod: isEmailConfigured() ? 'email' : 'development-fallback',
      ...(isDevelopment && !isEmailConfigured() ? { devOtp: otp } : {}),
    };
  } catch (error) {
    throw new Error('Failed to create OTP: ' + error.message);
  }
};

export const verifyOTP = async (email, otp) => {
  try {
    const otpDoc = await OTP.findOne({ email });

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
    // Delete existing OTP
    await OTP.deleteMany({ email });
    
    // Generate new OTP
    return await createAndSendOTP(email, purpose);
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
