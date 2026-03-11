import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  doubtId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doubt',
    default: null,
  },
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  reviewType: {
    type: String,
    enum: ['solution-quality', 'communication', 'timeliness', 'helpfulness'],
    default: 'solution-quality',
  },
  isAnonymous: {
    type: Boolean,
    default: false,
  },
  helpful: {
    type: Number,
    default: 0,
  },
  notHelpful: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

export default mongoose.model('Review', reviewSchema);
