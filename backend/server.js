import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { deleteExpiredOTPs } from './utils/otpService.js';
import User from './models/User.js';
import Subject from './models/Subject.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../dist');
const isProduction = process.env.NODE_ENV === 'production';

const app = express();

// Middleware
app.use(helmet());
app.use(morgan('combined'));
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:5173',
  'http://127.0.0.1:5173',
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);

      const isExplicitlyAllowed = allowedOrigins.includes(origin);
      const isLocalDevOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      if (isExplicitlyAllowed || isLocalDevOrigin) {
        return callback(null, true);
      }

      return callback(new Error('CORS not allowed for this origin'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✓ MongoDB connected successfully');
    seedData(); // Seed data on startup
  })
  .catch((err) => {
    console.error('✗ MongoDB connection error:', err);
    process.exit(1);
  });

// Seed initial data (admin, subjects)
const seedData = async () => {
  try {
    // Check if admin exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      const adminUser = new User({
        name: 'Administrator',
        email: 'admin@tutorify.com',
        password: 'Admin@123',
        role: 'admin',
        isVerified: true,
        isApproved: true,
        isActive: true,
      });
      await adminUser.save();
      console.log('✓ Admin user created (email: admin@tutorify.com, password: Admin@123)');
    }

    // Seed subjects if empty
    const subjectsCount = await Subject.countDocuments();
    if (subjectsCount === 0) {
      const subjects = [
        { name: 'Mathematics', branch: 'General', description: 'All math topics' },
        { name: 'Physics', branch: 'General', description: 'Physics concepts' },
        { name: 'Chemistry', branch: 'General', description: 'Chemistry topics' },
        { name: 'Data Structures', branch: 'Computer Science', description: 'DSA concepts' },
        { name: 'Web Development', branch: 'Computer Science', description: 'Web dev basics' },
        { name: 'Mechanical Engineering', branch: 'Engineering', description: 'Mech engineering' },
        { name: 'Electrical Circuits', branch: 'Engineering', description: 'Circuit theory' },
        { name: 'English', branch: 'General', description: 'English language' },
      ];
      await Subject.insertMany(subjects);
      console.log('✓ Subjects seeded');
    }
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/doubts', doubtRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);

// Public subjects list for posting/filtering doubts
app.get('/api/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date() });
});

if (isProduction) {
  app.use(express.static(frontendDistPath));

  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) {
      return next();
    }

    return res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// 404 Handler
app.use(notFoundHandler);

// Error Handler (must be last)
app.use(errorHandler);

// Clean up expired OTPs every hour
setInterval(deleteExpiredOTPs, 60 * 60 * 1000);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✓ Server running on port ${PORT}`);
  console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
