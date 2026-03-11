import mongoose from 'mongoose';

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  planType: {
    type: String,
    enum: ['free', 'premium', 'pro'],
    default: 'free',
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'expired', 'suspended'],
    default: 'active',
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  autoRenew: {
    type: Boolean,
    default: true,
  },
  maxDoubtsPerMonth: {
    type: Number,
    default: function() {
      if (this.planType === 'premium') return 50;
      if (this.planType === 'pro') return 200;
      return 5;
    },
  },
  doubtsUsedThisMonth: {
    type: Number,
    default: 0,
  },
  features: {
    priority: { type: Boolean, default: false },
    instantResponse: { type: Boolean, default: false },
    fileUpload: { type: Boolean, default: false },
    analytics: { type: Boolean, default: false },
    advancedSearch: { type: Boolean, default: false },
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
    default: null,
  },
  cancellationReason: {
    type: String,
    default: null,
  },
  cancelledAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model('Subscription', subscriptionSchema);
