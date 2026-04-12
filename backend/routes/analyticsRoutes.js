import express from 'express';
import {
  getDoubtsOverTime,
  getSubjectLoad,
  getTutorPerformance,
  getResolutionTurnaround,
  getPremiumConversion,
  getDashboardAnalytics,
} from '../controllers/analyticsController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// All analytics endpoints require admin access
router.use(verifyToken, authorize('admin'));

// Individual analytics endpoints
router.get('/trends', getDoubtsOverTime); // GET /api/analytics/trends?days=30
router.get('/subject-load', getSubjectLoad); // GET /api/analytics/subject-load
router.get('/tutor-performance', getTutorPerformance); // GET /api/analytics/tutor-performance
router.get('/turnaround', getResolutionTurnaround); // GET /api/analytics/turnaround
router.get('/conversion', getPremiumConversion); // GET /api/analytics/conversion
router.get('/dashboard', getDashboardAnalytics); // GET /api/analytics/dashboard (combined overview)

export default router;
