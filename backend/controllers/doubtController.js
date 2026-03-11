import Doubt from '../models/Doubt.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';

// Post a Doubt
export const postDoubt = asyncHandler(async (req, res) => {
  const { subjectId, title, description, difficulty, deadline, tags } = req.body;
  const studentId = req.user.id;

  if (!subjectId || !title || !description) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Check if subject exists
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }

  const doubt = await Doubt.create({
    studentId,
    subjectId,
    title,
    description,
    difficulty: difficulty || 'medium',
    deadline: deadline || null,
    tags: tags || [],
  });

  // Increment subject doubts count
  await Subject.findByIdAndUpdate(subjectId, { $inc: { doubtsCount: 1 } });

  const populatedDoubt = await doubt.populate('studentId subjectId');

  res.status(201).json({
    message: 'Doubt posted successfully',
    doubt: populatedDoubt,
  });
});

// Get Student's Doubts
export const getMyDoubts = asyncHandler(async (req, res) => {
  const studentId = req.user.id;

  const doubts = await Doubt.find({ studentId })
    .populate('studentId', 'name profilePic')
    .populate('subjectId', 'name')
    .populate('tutorId', 'name profilePic rating')
    .sort({ createdAt: -1 });

  res.json({
    doubts,
    count: doubts.length,
  });
});

// Get Open Doubts (for tutors)
export const getOpenDoubts = asyncHandler(async (req, res) => {
  const { subject, difficulty, sort } = req.query;

  let query = { status: 'open' };

  if (subject) {
    query.subjectId = subject;
  }

  if (difficulty) {
    query.difficulty = difficulty;
  }

  let doubts = await Doubt.find(query)
    .populate('studentId', 'name profilePic college')
    .populate('subjectId', 'name')
    .sort({ createdAt: -1 });

  res.json({
    doubts,
    count: doubts.length,
  });
});

// Get Doubt Detail
export const getDoubtDetail = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doubt = await Doubt.findByIdAndUpdate(
    id,
    { $inc: { views: 1 } },
    { new: true }
  )
    .populate('studentId', 'name profilePic college branch')
    .populate('subjectId', 'name')
    .populate('tutorId', 'name profilePic rating');

  if (!doubt) {
    return res.status(404).json({ message: 'Doubt not found' });
  }

  res.json({ doubt });
});

// Claim Doubt (Tutor)
export const claimDoubt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const tutorId = req.user.id;

  const doubt = await Doubt.findByIdAndUpdate(
    id,
    {
      status: 'claimed',
      tutorId,
    },
    { new: true }
  );

  if (!doubt) {
    return res.status(404).json({ message: 'Doubt not found' });
  }

  res.json({
    message: 'Doubt claimed successfully',
    doubt,
  });
});

// Submit Solution
export const submitSolution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { solution, solutionFiles } = req.body;
  const tutorId = req.user.id;

  const doubt = await Doubt.findById(id);

  if (!doubt) {
    return res.status(404).json({ message: 'Doubt not found' });
  }

  if (doubt.tutorId.toString() !== tutorId) {
    return res.status(403).json({ message: 'Only the claimed tutor can submit solution' });
  }

  doubt.status = 'submitted';
  doubt.solution = solution;
  doubt.solutionFiles = solutionFiles || [];
  doubt.submittedAt = new Date();
  await doubt.save();

  res.json({
    message: 'Solution submitted successfully',
    doubt,
  });
});

// Rate Solution
export const rateSolution = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, feedback } = req.body;
  const studentId = req.user.id;

  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5' });
  }

  const doubt = await Doubt.findById(id);

  if (!doubt) {
    return res.status(404).json({ message: 'Doubt not found' });
  }

  if (doubt.studentId.toString() !== studentId) {
    return res.status(403).json({ message: 'Only the student can rate the solution' });
  }

  doubt.status = 'resolved';
  doubt.studentRating = rating;
  doubt.studentFeedback = feedback || '';
  await doubt.save();

  // Update tutor stats
  const tutor = await User.findById(doubt.tutorId);
  if (tutor) {
    tutor.totalDoubtsResolved += 1;
    const allRatings = await Doubt.find({ tutorId: doubt.tutorId, studentRating: { $ne: null } });
    const avgRating = allRatings.reduce((sum, d) => sum + d.studentRating, 0) / allRatings.length;
    tutor.rating = Math.round(avgRating * 10) / 10; // Round to 1 decimal
    await tutor.save();
  }

  res.json({
    message: 'Solution rated successfully',
    doubt,
  });
});

// Delete Doubt (Admin only)
export const deleteDoubt = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doubt = await Doubt.findByIdAndDelete(id);

  if (!doubt) {
    return res.status(404).json({ message: 'Doubt not found' });
  }

  // Decrement subject doubts count
  await Subject.findByIdAndUpdate(doubt.subjectId, { $inc: { doubtsCount: -1 } });

  res.json({
    message: 'Doubt deleted successfully',
  });
});

// Search Doubts
export const searchDoubts = asyncHandler(async (req, res) => {
  const { q, subject } = req.query;

  let query = { status: 'resolved' }; // Only search in resolved doubts

  if (subject) {
    query.subjectId = subject;
  }

  let doubts = await Doubt.find(
    q ? { ...query, $text: { $search: q } } : query
  )
    .populate('studentId', 'name profilePic')
    .populate('subjectId', 'name')
    .populate('tutorId', 'name profilePic rating')
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    doubts,
    count: doubts.length,
  });
});
