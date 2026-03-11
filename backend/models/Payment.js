import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  orderId: {
    type: String,
    unique: true,
    required: true,
  },
  paymentId: {
    type: String,
    unique: true,
    default: null,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    default: 'INR',
  },
  planType: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'premium',
  },
  planDuration: {
    type: Number, // in months
    default: 1,
  },
  description: {
    type: String,
    default: '',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'success', 'failed', 'cancelled'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'stripe', 'paypal', 'bank-transfer'],
    default: 'razorpay',
  },
  transactionId: {
    type: String,
    default: null,
  },
  signature: {
    type: String,
    default: null,
  },
  errorMessage: {
    type: String,
    default: null,
  },
  paidAt: {
    type: Date,
    default: null,
  },
  refundId: {
    type: String,
    default: null,
  },
  refundStatus: {
    type: String,
    enum: ['none', 'pending', 'completed', 'failed'],
    default: 'none',
  },
  refundReason: {
    type: String,
    default: null,
  },
  refundedAt: {
    type: Date,
    default: null,
  },
  metadata: {
    type: Object,
    default: {},
  },
}, { timestamps: true });

export default mongoose.model('Payment', paymentSchema);
