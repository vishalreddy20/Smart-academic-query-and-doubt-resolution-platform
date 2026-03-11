import mongoose from 'mongoose';

const doubtSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
    },
    attachments: {
      type: [String], // Array of file URLs
      default: [],
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['open', 'claimed', 'in-progress', 'submitted', 'resolved', 'disputed'],
      default: 'open',
    },
    tutorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    solution: {
      type: String,
      default: null,
    },
    solutionFiles: {
      type: [String],
      default: [],
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    studentRating: {
      type: Number,
      min: 1,
      max: 5,
      default: null,
    },
    studentFeedback: {
      type: String,
      default: null,
    },
    tutorComments: {
      type: String,
      default: null,
    },
    deadline: {
      type: Date,
      default: null,
    },
    aiTagged: {
      type: Boolean,
      default: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    views: {
      type: Number,
      default: 0,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index for search
doubtSchema.index({ title: 'text', description: 'text', tags: 'text' });
doubtSchema.index({ studentId: 1, status: 1 });
doubtSchema.index({ subjectId: 1, status: 1 });
doubtSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model('Doubt', doubtSchema);
