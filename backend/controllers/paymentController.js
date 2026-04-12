import Razorpay from 'razorpay';
import Payment from '../models/Payment.js';
import Subscription from '../models/Subscription.js';
import User from '../models/User.js';
import crypto from 'crypto';
import asyncHandler from 'express-async-handler';

const getRazorpayClient = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    return null;
  }

  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
};

// Plan pricing (in paise - 100 paise = 1 INR)
const PLANS = {
  premium: {
    monthly: 29900,   // ₹299
    quarterly: 74900, // ₹749
    yearly: 249900,  // ₹2499
  },
  pro: {
    monthly: 59900,   // ₹599
    quarterly: 149900, // ₹1499
    yearly: 499900,  // ₹4999
  },
};

// Create Payment Order
export const createPaymentOrder = asyncHandler(async (req, res) => {
  const { planType, duration } = req.body; // duration: 'monthly', 'quarterly', 'yearly'
  const userId = req.user.id;

  if (!PLANS[planType]?.[duration]) {
    return res.status(400).json({ message: 'Invalid plan or duration' });
  }

  const amount = PLANS[planType][duration];
  const razorpay = getRazorpayClient();

  if (!razorpay) {
    return res.status(503).json({ message: 'Payment service is not configured' });
  }

  try {
    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount,
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        planType,
        duration,
      },
    });

    // Save payment record with pending status
    const payment = await Payment.create({
      userId,
      orderId: razorpayOrder.id,
      amount: amount / 100, // Convert back to INR
      planType,
      planDuration: duration === 'monthly' ? 1 : duration === 'quarterly' ? 3 : 12,
      paymentStatus: 'pending',
      paymentMethod: 'razorpay',
    });

    res.json({
      message: 'Payment order created',
      orderId: razorpayOrder.id,
      paymentId: payment._id,
      amount,
      planType,
      duration,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create payment order', error: error.message });
  }
});

// Verify Payment Signature (Webhook)
export const verifyPayment = asyncHandler(async (req, res) => {
  const { orderId, paymentId, signature } = req.body;
  const userId = req.user.id;

  if (!process.env.RAZORPAY_KEY_SECRET) {
    return res.status(503).json({ message: 'Payment verification is not configured' });
  }

  try {
    // Verify signature
    const body = orderId + '|' + paymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expectedSignature !== signature) {
      return res.status(400).json({ message: 'Payment verification failed' });
    }

    // Update payment record
    const payment = await Payment.findOneAndUpdate(
      { orderId, userId },
      {
        paymentId,
        paymentStatus: 'success',
        signature,
        paidAt: new Date(),
      },
      { new: true }
    );

    if (!payment) {
      return res.status(404).json({ message: 'Payment record not found' });
    }

    // Update user subscription
    const user = await User.findById(userId);
    user.subscriptionTier = payment.planType;
    user.isPremiumActive = true;

    const startDate = new Date();
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + payment.planDuration);
    user.subscriptionExpiry = endDate;

    await user.save();

    // Create subscription record
    await Subscription.findOneAndUpdate(
      { userId },
      {
        planType: payment.planType,
        status: 'active',
        startDate,
        endDate,
        autoRenew: true,
        paymentId: payment._id,
      },
      { upsert: true, new: true }
    );

    res.json({
      message: 'Payment verified successfully',
      payment: {
        _id: payment._id,
        status: payment.paymentStatus,
        planType: payment.planType,
      },
      user: {
        subscriptionTier: user.subscriptionTier,
        isPremiumActive: user.isPremiumActive,
        subscriptionExpiry: user.subscriptionExpiry,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Payment verification failed', error: error.message });
  }
});

// Get Payment History
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const payments = await Payment.find({ userId })
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    payments,
  });
});

// Get Current Subscription
export const getSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const subscription = await Subscription.findOne({ userId });

  if (!subscription) {
    return res.json({
      planType: 'free',
      status: 'none',
      message: 'No active subscription',
    });
  }

  res.json({
    subscription: {
      _id: subscription._id,
      planType: subscription.planType,
      status: subscription.status,
      startDate: subscription.startDate,
      endDate: subscription.endDate,
      autoRenew: subscription.autoRenew,
      features: subscription.features,
      daysRemaining: Math.ceil((subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)),
    },
  });
});

// Cancel Subscription
export const cancelSubscription = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { reason } = req.body;

  const subscription = await Subscription.findOneAndUpdate(
    { userId },
    {
      status: 'cancelled',
      cancellationReason: reason || 'User initiated cancellation',
      cancelledAt: new Date(),
    },
    { new: true }
  );

  if (!subscription) {
    return res.status(404).json({ message: 'Subscription not found' });
  }

  // Update user
  await User.findByIdAndUpdate(userId, {
    subscriptionTier: 'free',
    isPremiumActive: false,
  });

  res.json({
    message: 'Subscription cancelled successfully',
    subscription,
  });
});

// Initiate Refund (Admin/User)
export const initiateRefund = asyncHandler(async (req, res) => {
  const { paymentId, reason } = req.body;
  const userId = req.user.id;

  const payment = await Payment.findOne({ _id: paymentId, userId });

  if (!payment) {
    return res.status(404).json({ message: 'Payment not found' });
  }

  if (payment.paymentStatus !== 'success') {
    return res.status(400).json({ message: 'Only successful payments can be refunded' });
  }

  if (payment.refundStatus !== 'none') {
    return res.status(400).json({ message: 'Refund already initiated' });
  }

  const razorpay = getRazorpayClient();
  if (!razorpay) {
    return res.status(503).json({ message: 'Refund service is not configured' });
  }

  try {
    // Initiate refund with Razorpay
    const refund = await razorpay.payments.refund(payment.paymentId, {
      amount: Math.floor(payment.amount * 100), // Convert to paise
      notes: {
        reason: reason || 'User requested refund',
      },
    });

    // Update payment record
    payment.refundId = refund.id;
    payment.refundStatus = 'pending';
    payment.refundReason = reason || 'User requested refund';
    await payment.save();

    // Downgrade user subscription
    await User.findByIdAndUpdate(userId, {
      subscriptionTier: 'free',
      isPremiumActive: false,
    });

    res.json({
      message: 'Refund initiated',
      refund: {
        refundId: refund.id,
        status: refund.status,
        amount: payment.amount,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to initiate refund', error: error.message });
  }
});
