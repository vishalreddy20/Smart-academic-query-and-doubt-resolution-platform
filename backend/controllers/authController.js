import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateToken } from '../utils/jwtService.js';
import { createAndSendOTP, verifyOTP, resendOTP } from '../utils/otpService.js';
import { isEmailConfigured, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

const normalizeEmail = (email = '') => email.trim().toLowerCase();

const resolveFrontendUrl = (req) => {
  const requestOrigin = req.get('origin');

  if (process.env.NODE_ENV !== 'production' && requestOrigin) {
    return requestOrigin;
  }

  return process.env.FRONTEND_URL || requestOrigin || 'http://localhost:5173';
};

// Register User (Student or Tutor)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role, phone, college, branch, graduationYear, expertise } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const requireEmailOtp = `${process.env.REQUIRE_EMAIL_OTP ?? 'true'}`.toLowerCase() === 'true';

  if (requireEmailOtp && !isEmailConfigured()) {
    return res.status(503).json({
      message: 'Email OTP service is not configured. Set EMAIL_SERVICE, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM in backend/.env and restart backend.',
    });
  }

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email: normalizedEmail });
  if (existingUser) {
    if (existingUser.isVerified) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // If OTP is disabled, auto-verify the existing unverified user
    if (!requireEmailOtp) {
      existingUser.isVerified = true;
      await existingUser.save();
      const token = generateToken(existingUser._id, existingUser.role);
      return res.status(200).json({
        message: 'Account verified successfully',
        token,
        user: {
          _id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          isVerified: true,
          isApproved: existingUser.isApproved,
        },
      });
    }

    const otpResult = await resendOTP(normalizedEmail, 'signup');

    return res.status(200).json({
      message: 'Email already registered but not verified. A new OTP has been sent.',
      userId: existingUser._id,
      email: existingUser.email,
      requiresOTPVerification: true,
      ...(otpResult.deliveryMethod ? { deliveryMethod: otpResult.deliveryMethod } : {}),
    });
  }

  // Create user
  const user = await User.create({
    name,
    email: normalizedEmail,
    password,
    role: role || 'student',
    isVerified: !requireEmailOtp,
    phone: phone || '',
    college: college || '',
    branch: branch || '',
    graduationYear: graduationYear || '',
    expertise: expertise || [],
  });

  // If OTP is not required, auto-verify and return token
  if (!requireEmailOtp) {
    const token = generateToken(user._id, user.role);
    return res.status(201).json({
      message: 'User registered successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: true,
        isApproved: user.isApproved,
      },
    });
  }

  // Generate and send OTP
  try {
    const otpResult = await createAndSendOTP(normalizedEmail, 'signup');
    
    res.status(201).json({
      message: 'User registered successfully. Please verify your email with OTP.',
      userId: user._id,
      email: user.email,
      requiresOTPVerification: true,
      ...(otpResult.deliveryMethod ? { deliveryMethod: otpResult.deliveryMethod } : {}),
    });
  } catch (error) {
    console.error('Registration OTP Error:', error);
    await User.deleteOne({ _id: user._id });
    return res.status(500).json({ message: error.message || 'Failed to send OTP email' });
  }
});

// Register Admin (requires secret code)
export const registerAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, adminCode } = req.body;

  // Validate admin code
  if (adminCode !== process.env.ADMIN_SECRET_CODE) {
    return res.status(403).json({ message: 'Invalid admin registration code' });
  }

  // Validation
  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  // Check if user exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Create admin user
  const admin = await User.create({
    name,
    email,
    password,
    role: 'admin',
    isVerified: true,
    isApproved: true,
  });

  const token = generateToken(admin._id, admin.role);

  res.status(201).json({
    message: 'Admin registered successfully',
    token,
    user: {
      _id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  });
});

// Verify OTP
export const verifyOTPCode = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    await verifyOTP(normalizedEmail, otp);

    // Update user as verified
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    user.isVerified = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send welcome email
    try {
      await sendWelcomeEmail(normalizedEmail, user.name);
    } catch (error) {
      console.error('Error sending welcome email:', error);
    }

    res.json({
      message: 'Email verified successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        isApproved: user.isApproved,
        isPremiumActive: user.isPremiumActive,
        rating: user.rating,
        totalDoubtsResolved: user.totalDoubtsResolved,
        totalEarnings: user.totalEarnings,
        totalSolved: user.totalDoubtsResolved,
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Resend OTP
export const resendOTPCode = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const normalizedEmail = normalizeEmail(email);

  const requireEmailOtp = `${process.env.REQUIRE_EMAIL_OTP ?? 'true'}`.toLowerCase() === 'true';

  if (requireEmailOtp && !isEmailConfigured()) {
    return res.status(503).json({
      message: 'Email OTP service is not configured. Set EMAIL_SERVICE, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM in backend/.env and restart backend.',
    });
  }

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) {
    return res.status(404).json({ message: 'No account found for this email' });
  }

  if (user.isVerified) {
    return res.status(400).json({ message: 'This email is already verified. Please log in.' });
  }

  try {
    const otpResult = await resendOTP(normalizedEmail, 'signup');

    res.json({
      message: 'OTP resent successfully',
      email: normalizedEmail,
      ...(otpResult.deliveryMethod ? { deliveryMethod: otpResult.deliveryMethod } : {}),
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email: normalizedEmail }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ 
      message: 'Please verify your email first',
      userId: user._id,
      email: user.email,
      requiresOTPVerification: true,
    });
  }

  if (!user.isActive) {
    return res.status(403).json({ message: 'Account is inactive' });
  }

  const isPasswordValid = await user.matchPassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = generateToken(user._id, user.role);

  // Update last login
  user.lastLogin = new Date();
  user.ipAddress = req.ip;
  await user.save();

  res.json({
    message: 'Login successful',
    token,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePic,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
      isPremiumActive: user.isPremiumActive,
      rating: user.rating,
      totalDoubtsResolved: user.totalDoubtsResolved,
      totalEarnings: user.totalEarnings,
      totalSolved: user.totalDoubtsResolved,
    },
  });
});

// Get Current User
export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePic: user.profilePic,
      college: user.college,
      branch: user.branch,
      graduationYear: user.graduationYear,
      expertise: user.expertise,
      isVerified: user.isVerified,
      isApproved: user.isApproved,
      isPremiumActive: user.isPremiumActive,
      subscriptionTier: user.subscriptionTier,
      subscriptionExpiry: user.subscriptionExpiry,
      rating: user.rating,
      totalDoubtsResolved: user.totalDoubtsResolved,
      totalEarnings: user.totalEarnings,
    },
  });
});

// Update Profile
export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, college, branch, graduationYear, expertise, profilePic } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (college) user.college = college;
  if (branch) user.branch = branch;
  if (graduationYear) user.graduationYear = graduationYear;
  if (expertise) user.expertise = expertise;
  if (profilePic) user.profilePic = profilePic;

  await user.save();

  res.json({
    message: 'Profile updated successfully',
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profilePic: user.profilePic,
      college: user.college,
      branch: user.branch,
      graduationYear: user.graduationYear,
      expertise: user.expertise,
    },
  });
});

// Change Password
export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword, confirmPassword } = req.body;

  if (!currentPassword || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'New passwords do not match' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ message: 'Password must be at least 6 characters' });
  }

  const user = await User.findById(req.user.id).select('+password');
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const isValid = await user.matchPassword(currentPassword);
  if (!isValid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: 'Password changed successfully' });
});

// Forgot Password
export const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Generate reset token
  const resetToken = crypto.randomBytes(32).toString('hex');
  user.forgotPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  user.forgotPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  await user.save();

  const resetLink = `${resolveFrontendUrl(req)}/reset-password/${resetToken}`;
  const emailConfigured = isEmailConfigured();
  const isDevelopment = process.env.NODE_ENV !== 'production';

  try {
    if (emailConfigured) {
      await sendPasswordResetEmail(email, resetLink);
    } else if (!isDevelopment) {
      throw new Error('Email service is not configured');
    }

    res.json({
      message: emailConfigured ? 'Password reset link sent to your email' : 'Development reset link generated',
      email,
      ...(isDevelopment && !emailConfigured ? { deliveryMethod: 'development-fallback', resetLink } : {}),
    });
  } catch (error) {
    user.forgotPasswordToken = null;
    user.forgotPasswordExpiry = null;
    await user.save();
    return res.status(500).json({ message: 'Failed to send reset email' });
  }
});

// Reset Password
export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword, confirmPassword } = req.body;

  if (!token || !newPassword || !confirmPassword) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,
    forgotPasswordExpiry: { $gt: new Date() },
  });

  if (!user) {
    return res.status(400).json({ message: 'Invalid or expired reset link' });
  }

  user.password = newPassword;
  user.forgotPasswordToken = null;
  user.forgotPasswordExpiry = null;
  await user.save();

  res.json({ message: 'Password reset successfully' });
});

// Logout
export const logout = asyncHandler(async (req, res) => {
  res.json({ message: 'Logged out successfully' });
});
