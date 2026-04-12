import express from 'express';
import {
  postDoubt,
  getMyDoubts,
  getOpenDoubts,
  getClaimedDoubts,
  getResolvedByTutor,
  getDoubtDetail,
  claimDoubt,
  submitSolution,
  rateSolution,
  deleteDoubt,
  searchDoubts,
  tutorAnswerDoubt,
  reopenDoubt,
  getPriorityQueue,
  getKnowledgeBase,
} from '../controllers/doubtController.js';
import { verifyToken, authorize, requireVerifiedEmail } from '../middleware/auth.js';

const router = express.Router();

// Public routes (specific paths MUST come before :id)
router.get('/knowledge', getKnowledgeBase);
router.get('/search', searchDoubts);

// Student routes
router.post('/', verifyToken, requireVerifiedEmail, authorize('student'), postDoubt);
router.get('/my/all', verifyToken, authorize('student'), getMyDoubts);

// Tutor routes
router.get('/open/all', verifyToken, authorize('tutor'), getOpenDoubts);
router.get('/claimed/all', verifyToken, authorize('tutor'), getClaimedDoubts);
router.get('/resolved/all', verifyToken, authorize('tutor'), getResolvedByTutor);

// Admin routes
router.get('/admin/queue/priority', verifyToken, authorize('admin'), getPriorityQueue);

// Parameterized routes (MUST come AFTER all specific paths)
router.get('/:id', getDoubtDetail);
router.put('/:id/claim', verifyToken, authorize('tutor'), claimDoubt);
router.put('/:id/submit', verifyToken, authorize('tutor'), submitSolution);
router.post('/:id/answer', verifyToken, authorize('tutor'), tutorAnswerDoubt);
router.put('/:id/rate', verifyToken, authorize('student'), rateSolution);
router.post('/:id/reopen', verifyToken, authorize('student'), reopenDoubt);
router.delete('/:id', verifyToken, authorize('admin'), deleteDoubt);

export default router;
