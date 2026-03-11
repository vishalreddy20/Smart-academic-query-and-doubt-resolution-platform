import User from '../models/User.js';
import OTP from '../models/OTP.js';
import { generateToken } from '../utils/jwtService.js';
import { createAndSendOTP, verifyOTP, resendOTP } from '../utils/otpService.js';
import { sendOTPEmail, sendWelcomeEmail, sendPasswordResetEmail } from '../utils/emailService.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

// Register User (Student or Tutor)
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, confirmPassword, role, phone, college, branch, graduationYear, expertise } = req.body;

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
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already registered' });
  }

  // Create user
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'student',
    phone: phone || '',
    college: college || '',
    branch: branch || '',
    graduationYear: graduationYear || '',
    expertise: expertise || [],
  });

  // Generate and send OTP
  try {
    await createAndSendOTP(email, 'signup');
    const otp = await OTP.findOne({ email });
    console.log(`OTP for ${email}: ${otp.otp}`); // For development - remove in production
    
    res.status(201).json({
      message: 'User registered successfully. Please verify your email with OTP.',
      userId: user._id,
      email: user.email,
      requiresOTPVerification: true,
    });
  } catch (error) {
    await User.deleteOne({ _id: user._id });
    return res.status(500).json({ message: 'Failed to send OTP email' });
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

  if (!email || !otp) {
    return res.status(400).json({ message: 'Email and OTP are required' });
  }

  try {
    await verifyOTP(email, otp);

    // Update user as verified
    const user = await User.findOne({ email });
    user.isVerified = true;
    await user.save();

    // Generate token
    const token = generateToken(user._id, user.role);

    // Send welcome email
    try {
      await sendWelcomeEmail(email, user.name);
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
      },
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Resend OTP
export const resendOTPCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    await resendOTP(email, 'signup');
    const otp = await OTP.findOne({ email });
    console.log(`OTP for ${email}: ${otp.otp}`); // For development

    res.json({
      message: 'OTP resent successfully',
      email,
    });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
});

// Login
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please provide email and password' });
  }

  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  if (!user.isVerified) {
    return res.status(403).json({ 
      message: 'Please verify your email first',
      userId: user._id,
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
      isPremiumActive: user.isPremiumActive,
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

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  try {
    await sendPasswordResetEmail(email, resetLink);
    res.json({
      message: 'Password reset link sent to your email',
      email,
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
