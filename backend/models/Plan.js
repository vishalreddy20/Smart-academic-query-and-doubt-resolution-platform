import mongoose from 'mongoose';

const planSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      unique: true,
      required: true,
    },
    displayName: {
      type: String,
      required: true, // "Free Plan", "Premium", "Pro"
    },
    price: {
      type: Number,
      required: true, // in INR (0 for free)
    },
    billingCycle: {
      type: String,
      enum: ['month', 'year'],
      default: 'month',
    },
    doubtLimit: {
      type: Number,
      required: true, // 5, 50, 200
    },
    queuePriority: {
      type: Number,
      required: true, // 1 = lowest, 3 = highest (used for sorting)
    },
    maxResponseTime: {
      type: Number, // in minutes (SLA)
      default: null,
    },
    features: {
      knowledgeBaseAccess: { type: Boolean, default: true },
      fileUpload: { type: Boolean, default: false },
      priorityQueue: { type: Boolean, default: false },
      topTutorsOnly: { type: Boolean, default: false },
      dedicatedTutorPool: { type: Boolean, default: false },
      analyticsAccess: { type: Boolean, default: false },
      guaranteedSLA: { type: Boolean, default: false },
    },
    description: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Plan', planSchema);
