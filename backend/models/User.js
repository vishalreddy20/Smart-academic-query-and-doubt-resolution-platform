import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    // Basic Info
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      lowercase: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
      select: false, // Don't return password by default
    },
    phone: {
      type: String,
      default: '',
    },
    profilePic: {
      type: String,
      default: null,
    },

    // Role & Status
    role: {
      type: String,
      enum: ['student', 'tutor', 'admin'],
      default: 'student',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: true, // Auto-approve for now (admin can disable)
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Academic Info (for tutors & students)
    college: {
      type: String,
      default: '',
    },
    branch: {
      type: String,
      default: '',
    },
    graduationYear: {
      type: String,
      default: '',
    },
    expertise: {
      type: [String], // Array of subjects
      default: [],
    },

    // Tutor Specific
    isTestPassed: {
      type: Boolean,
      default: false,
    },
    bankDetails: {
      accountHolder: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      ifscCode: { type: String, default: '' },
      bankName: { type: String, default: '' },
    },

    // Statistics
    rating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    totalDoubtsResolved: {
      type: Number,
      default: 0,
    },
    totalEarnings: {
      type: Number,
      default: 0,
    },

    // Subscription
    subscriptionTier: {
      type: String,
      enum: ['free', 'premium', 'pro'],
      default: 'free',
    },
    subscriptionExpiry: {
      type: Date,
      default: null,
    },
    isPremiumActive: {
      type: Boolean,
      default: false,
    },

    // Password Reset
    forgotPasswordToken: {
      type: String,
      default: null,
    },
    forgotPasswordExpiry: {
      type: Date,
      default: null,
    },

    // Metadata
    lastLogin: {
      type: Date,
      default: null,
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcryptjs.genSalt(10);
  this.password = await bcryptjs.hash(this.password, salt);
});

// Method to compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcryptjs.compare(enteredPassword, this.password);
};

// Method to get user data without sensitive info
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.forgotPasswordToken;
  delete obj.forgotPasswordExpiry;
  return obj;
};

export default mongoose.model('User', userSchema);
