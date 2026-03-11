import User from '../models/User.js';
import Subject from '../models/Subject.js';
import Doubt from '../models/Doubt.js';
import Payment from '../models/Payment.js';
import asyncHandler from 'express-async-handler';

// Get Platform Statistics
export const getStats = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments();
  const totalStudents = await User.countDocuments({ role: 'student' });
  const totalTutors = await User.countDocuments({ role: 'tutor' });
  const approvedTutors = await User.countDocuments({ role: 'tutor', isApproved: true });
  const verifiedUsers = await User.countDocuments({ isVerified: true });

  const totalDoubts = await Doubt.countDocuments();
  const openDoubts = await Doubt.countDocuments({ status: 'open' });
  const resolvedDoubts = await Doubt.countDocuments({ status: 'resolved' });

  const totalSubjects = await Subject.countDocuments();

  const totalRevenue = await Payment.aggregate([
    { $match: { paymentStatus: 'success' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);

  const premiumUsers = await User.countDocuments({ subscriptionTier: { $ne: 'free' } });

  res.json({
    stats: {
      totalUsers,
      totalStudents,
      totalTutors,
      approvedTutors,
      verifiedUsers,
      totalDoubts,
      openDoubts,
      resolvedDoubts,
      totalSubjects,
      totalRevenue: totalRevenue[0]?.total || 0,
      premiumUsers,
    },
  });
});

// Get All Users
export const getAllUsers = asyncHandler(async (req, res) => {
  const { role, isVerified, isApproved } = req.query;

  let query = {};
  if (role) query.role = role;
  if (isVerified === 'true') query.isVerified = true;
  if (isApproved === 'true') query.isApproved = true;

  const users = await User.find(query)
    .select('-password')
    .sort({ createdAt: -1 })
    .limit(100);

  res.json({
    users,
    count: users.length,
  });
});

// Approve Tutor
export const approveTutor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isApproved: true },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: 'Tutor approved successfully',
    user,
  });
});

// Reject Tutor
export const rejectTutor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const user = await User.findByIdAndUpdate(
    id,
    { isApproved: false },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: 'Tutor rejected',
    reason: reason || 'No reason provided',
    user,
  });
});

// Deactivate User
export const deactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: false },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: 'User deactivated',
    user,
  });
});

// Reactivate User
export const reactivateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndUpdate(
    id,
    { isActive: true },
    { new: true }
  ).select('-password');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: 'User reactivated',
    user,
  });
});

// Delete User
export const deleteUser = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findByIdAndDelete(id);

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  res.json({
    message: 'User deleted successfully',
  });
});

// Create Subject
export const createSubject = asyncHandler(async (req, res) => {
  const { name, branch, description, icon, color } = req.body;

  if (!name || !branch) {
    return res.status(400).json({ message: 'Name and branch are required' });
  }

  // Check if subject already exists
  const existingSubject = await Subject.findOne({ name });
  if (existingSubject) {
    return res.status(400).json({ message: 'Subject already exists' });
  }

  const subject = await Subject.create({
    name,
    branch,
    description: description || '',
    icon: icon || null,
    color: color || '#3B82F6',
  });

  res.status(201).json({
    message: 'Subject created successfully',
    subject,
  });
});

// Get All Subjects
export const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ isActive: true }).sort({ name: 1 });

  res.json({
    subjects,
    count: subjects.length,
  });
});

// Update Subject
export const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, branch, description, icon, color, isActive } = req.body;

  const subject = await Subject.findByIdAndUpdate(
    id,
    {
      name: name || undefined,
      branch: branch || undefined,
      description: description || undefined,
      icon: icon || undefined,
      color: color || undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    },
    { new: true, runValidators: true }
  );

  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }

  res.json({
    message: 'Subject updated successfully',
    subject,
  });
});

// Delete Subject
export const deleteSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findByIdAndDelete(id);

  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }

  res.json({
    message: 'Subject deleted successfully',
  });
});

// Get Tutors Pending Approval
export const getPendingTutors = asyncHandler(async (req, res) => {
  const tutors = await User.find({ role: 'tutor', isApproved: false })
    .select('-password')
    .sort({ createdAt: -1 });

  res.json({
    tutors,
    count: tutors.length,
  });
});

// Get Recent Doubts
export const getRecentDoubts = asyncHandler(async (req, res) => {
  const doubts = await Doubt.find()
    .populate('studentId', 'name profilePic')
    .populate('subjectId', 'name')
    .populate('tutorId', 'name profilePic')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    doubts,
  });
});

// Get Recent Payments
export const getRecentPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find({ paymentStatus: 'success' })
    .populate('userId', 'name email')
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    payments,
  });
});
