import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const mongoSanitize = require('express-mongo-sanitize');
import path from 'path';
import { fileURLToPath } from 'url';
import { isEmailConfigured } from './utils/emailService.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { deleteExpiredOTPs } from './utils/otpService.js';
import User from './models/User.js';
import Subject from './models/Subject.js';

// Import Routes
import authRoutes from './routes/authRoutes.js';
import doubtRoutes from './routes/doubtRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';

// Load env variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDistPath = path.resolve(__dirname, '../dist');
const isProduction = process.env.NODE_ENV === 'production';
const requireEmailOtp = `${process.env.REQUIRE_EMAIL_OTP ?? 'true'}`.toLowerCase() === 'true';

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

// MongoDB injection sanitization
app.use(mongoSanitize());

// Global Rate Limiter — 100 req / 15 min per IP
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests from this IP, please try again after 15 minutes.' },
});
app.use('/api/', globalLimiter);

// Strict Auth Rate Limiter — 10 req / 15 min per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many authentication attempts, please try again later.' },
});

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

    // Enforce Indian BTech CSE subject taxonomy
    const cseSubjects = [
      { name: 'Data Structures and Algorithms', branch: 'CSE', description: 'Arrays, linked lists, trees, graphs, sorting, searching, and complexity analysis' },
      { name: 'Object Oriented Programming', branch: 'CSE', description: 'Java/C++ OOP concepts, classes, inheritance, polymorphism, and design basics' },
      { name: 'Database Management Systems', branch: 'CSE', description: 'ER modeling, normalization, SQL, transactions, indexing, and query optimization' },
      { name: 'Operating Systems', branch: 'CSE', description: 'Processes, threads, scheduling, synchronization, deadlocks, memory, and file systems' },
      { name: 'Computer Networks', branch: 'CSE', description: 'OSI/TCP-IP, routing, switching, transport, application protocols, and network security' },
      { name: 'Theory of Computation', branch: 'CSE', description: 'Automata, regular languages, CFG, PDA, Turing machines, and computability' },
      { name: 'Compiler Design', branch: 'CSE', description: 'Lexical analysis, parsing, semantic analysis, IR, optimization, and code generation' },
      { name: 'Software Engineering', branch: 'CSE', description: 'SDLC models, requirements, UML, testing, maintenance, and project management' },
      { name: 'Machine Learning', branch: 'CSE', description: 'Supervised/unsupervised learning, model evaluation, and practical ML workflows' },
      { name: 'Cloud Computing', branch: 'CSE', description: 'Virtualization, containers, cloud services, deployment architecture, and scaling' },
    ];

    for (const subject of cseSubjects) {
      await Subject.updateOne(
        { name: subject.name },
        { $set: { ...subject, isActive: true } },
        { upsert: true }
      );
    }

    await Subject.updateMany(
      { name: { $nin: cseSubjects.map((subject) => subject.name) } },
      { $set: { isActive: false } }
    );

    console.log('✓ Indian BTech CSE subjects synchronized');
  } catch (error) {
    console.error('Seeding error:', error);
  }
};

// Routes
const apiRouter = express.Router();
apiRouter.use('/auth', authLimiter, authRoutes);
apiRouter.use('/doubts', doubtRoutes);
apiRouter.use('/payments', paymentRoutes);
apiRouter.use('/admin', adminRoutes);
apiRouter.use('/analytics', analyticsRoutes);

// Public subjects list for posting/filtering doubts
apiRouter.get('/subjects', async (req, res) => {
  try {
    const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch subjects' });
  }
});

// Health check
apiRouter.get('/health', (req, res) => {
  res.json({ status: 'Backend running', timestamp: new Date() });
});

app.use('/api', apiRouter);
app.use('/', apiRouter); // Mount on / to handle Vercel routePrefix stripping


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

// Export for Vercel Serverless Functions
export default app;

// Only listen if not in a serverless environment
if (process.env.NODE_ENV !== 'production' || (!process.env.VERCEL && !process.env.VERCEL_ENV)) {
  app.listen(PORT, () => {
    console.log(`✓ Server running on port ${PORT}`);
    console.log(`✓ Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
    if (!isEmailConfigured()) {
      const message = '! Email service is not configured. Set EMAIL_SERVICE, EMAIL_HOST, EMAIL_PORT, EMAIL_SECURE, EMAIL_USER, EMAIL_PASSWORD, and EMAIL_FROM in backend/.env.';

      if (requireEmailOtp) {
        console.error(message);
        console.error('! REQUIRE_EMAIL_OTP=true, so server is exiting to prevent invalid OTP flow.');
        process.exit(1); // Exit only locally
      }

      console.warn(message);
      console.warn('! REQUIRE_EMAIL_OTP=false, so backend continues with OTP endpoints but they will return configuration errors.');
    }
  });
}
