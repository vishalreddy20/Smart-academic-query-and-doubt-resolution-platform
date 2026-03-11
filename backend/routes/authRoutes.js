import express from 'express';
import { 
  register, 
  registerAdmin, 
  verifyOTPCode,
  resendOTPCode,
  login, 
  getMe, 
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  logout 
} from '../controllers/authController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/register-admin', registerAdmin);
router.post('/verify-otp', verifyOTPCode);
router.post('/resend-otp', resendOTPCode);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Protected routes
router.get('/me', verifyToken, getMe);
router.put('/profile', verifyToken, updateProfile);
router.put('/change-password', verifyToken, changePassword);
router.post('/logout', verifyToken, logout);

export default router;
