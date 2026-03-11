import express from 'express';
import {
  createPaymentOrder,
  verifyPayment,
  getPaymentHistory,
  getSubscription,
  cancelSubscription,
  initiateRefund,
} from '../controllers/paymentController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Protected routes
router.post('/create-order', verifyToken, createPaymentOrder);
router.post('/verify', verifyToken, verifyPayment);
router.get('/history', verifyToken, getPaymentHistory);
router.get('/subscription', verifyToken, getSubscription);
router.put('/subscription/cancel', verifyToken, cancelSubscription);
router.post('/refund', verifyToken, initiateRefund);

export default router;
