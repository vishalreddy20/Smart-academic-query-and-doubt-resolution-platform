import mongoose from 'mongoose';

const subjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide subject name'],
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    branch: {
      type: String,
      required: true,
      trim: true,
    },
    icon: {
      type: String, // URL to icon image
      default: null,
    },
    color: {
      type: String,
      default: '#3B82F6',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    doubtsCount: {
      type: Number,
      default: 0,
    },
    tutorsCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model('Subject', subjectSchema);
