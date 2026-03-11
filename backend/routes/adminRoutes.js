import express from 'express';
import {
  getStats,
  getAllUsers,
  approveTutor,
  rejectTutor,
  deactivateUser,
  reactivateUser,
  deleteUser,
  createSubject,
  getAllSubjects,
  updateSubject,
  deleteSubject,
  getPendingTutors,
  getRecentDoubts,
  getRecentPayments,
} from '../controllers/adminController.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.use(verifyToken, authorize('admin'));

// Statistics
router.get('/stats', getStats);

// Users Management
router.get('/users', getAllUsers);
router.put('/users/:id/approve', approveTutor);
router.put('/users/:id/reject', rejectTutor);
router.put('/users/:id/deactivate', deactivateUser);
router.put('/users/:id/reactivate', reactivateUser);
router.delete('/users/:id', deleteUser);

// Tutors
router.get('/tutors/pending', getPendingTutors);

// Subjects
router.get('/subjects', getAllSubjects);
router.post('/subjects', createSubject);
router.put('/subjects/:id', updateSubject);
router.delete('/subjects/:id', deleteSubject);

// Activity
router.get('/doubts/recent', getRecentDoubts);
router.get('/payments/recent', getRecentPayments);

export default router;
