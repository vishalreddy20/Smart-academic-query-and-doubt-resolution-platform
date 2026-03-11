import express from 'express';
import {
  postDoubt,
  getMyDoubts,
  getOpenDoubts,
  getDoubtDetail,
  claimDoubt,
  submitSolution,
  rateSolution,
  deleteDoubt,
  searchDoubts,
} from '../controllers/doubtController.js';
import { verifyToken, authorize, requireVerifiedEmail } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/search', searchDoubts);

// Student routes
router.post('/', verifyToken, requireVerifiedEmail, authorize('student'), postDoubt);
router.get('/my/all', verifyToken, authorize('student'), getMyDoubts);
router.put('/:id/rate', verifyToken, authorize('student'), rateSolution);

// Tutor routes
router.get('/open/all', verifyToken, authorize('tutor'), getOpenDoubts);
router.put('/:id/claim', verifyToken, authorize('tutor'), claimDoubt);
router.put('/:id/submit', verifyToken, authorize('tutor'), submitSolution);

// Admin routes
router.delete('/:id', verifyToken, authorize('admin'), deleteDoubt);

// Public route for single doubt detail (keep last so it doesn't shadow specific paths)
router.get('/:id', getDoubtDetail);

export default router;
