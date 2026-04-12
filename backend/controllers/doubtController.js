import Doubt from '../models/Doubt.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import asyncHandler from 'express-async-handler';
import Subscription from '../models/Subscription.js';

// Post a Doubt
export const postDoubt = asyncHandler(async (req, res) => {
  const { subjectId, title, description, difficulty, deadline, tags, attachments } = req.body;
  const studentId = req.user.id;

  if (!subjectId || !title || !description) {
    return res.status(400).json({ message: 'Please provide all required fields' });
  }

  // Check if subject exists
  const subject = await Subject.findById(subjectId);
  if (!subject) {
    return res.status(404).json({ message: 'Subject not found' });
  }

  // Get student's subscription plan to determine priority
  const subscription = await Subscription.findOne({ userId: studentId }).populate('planId');
  let priorityScore = 1; // Default: free
  if (subscription && subscription.planId) {
    if (subscription.planId.name === 'pro') priorityScore = 3;
    else if (subscription.planId.name === 'premium') priorityScore = 2;
  }

  const doubt = await Doubt.create({
    studentId,
    subjectId,
    title,
    description,
    difficulty: difficulty || 'medium',
    deadline: deadline || null,
    tags: tags || [],
    attachments: attachments || [],
    priorityScore,
    status: 'open',
    queuedAt: new Date(),
  });

  // Increment subject doubts count
  await Subject.findByIdAndUpdate(subjectId, { $inc: { doubtsCount: 1 } });

  // TODO: Tutor assignment (assign when service is stable)
  // try {
  //   await assignTutorForDoubt(doubt._id);
  // } catch (error) {
  //   console.log('Assignment note:', error.message);
  // }

  // Re-fetch with population (Mongoose v7+ doesn't support chained .populate() on document instances)
  const populatedDoubt = await Doubt.findById(doubt._id)
    .populate('studentId', 'name profilePic college')
    .populate('subjectId', 'name')
    .populate('tutorId', 'name profilePic rating');

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

// Get Claimed/In-Progress Doubts by Tutor
export const getClaimedDoubts = asyncHandler(async (req, res) => {
  const tutorId = req.user.id;

  const doubts = await Doubt.find({ tutorId, status: { $in: ['claimed', 'in-progress', 'submitted'] } })
    .populate('studentId', 'name profilePic college branch')
    .populate('subjectId', 'name')
    .sort({ createdAt: -1 });

  res.json({
    doubts,
    count: doubts.length,
  });
});

// Get Resolved Doubts by Tutor
export const getResolvedByTutor = asyncHandler(async (req, res) => {
  const tutorId = req.user.id;

  const doubts = await Doubt.find({ tutorId, status: 'resolved' })
    .populate('studentId', 'name profilePic')
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

  // Check if tutor is approved
  const tutor = await User.findById(tutorId);
  if (!tutor || !tutor.isApproved) {
    return res.status(403).json({ message: 'Your account must be approved before you can claim doubts' });
  }

  // Only allow claiming open doubts
  const existing = await Doubt.findById(id);
  if (!existing) return res.status(404).json({ message: 'Doubt not found' });
  if (existing.status !== 'open') {
    return res.status(400).json({ message: 'This doubt is not available for claiming' });
  }

  const doubt = await Doubt.findByIdAndUpdate(
    id,
    {
      status: 'claimed',
      tutorId,
      claimedAt: new Date(),
    },
    { new: true }
  ).populate('studentId', 'name profilePic').populate('subjectId', 'name');

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

// Tutor Submit Answer (with SLA tracking)
export const tutorAnswerDoubt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { solution, solutionFiles } = req.body;
  const tutorId = req.user.id;

  const doubt = await Doubt.findById(id);

  if (!doubt) {
    return res.status(404).json({ message: 'Doubt not found' });
  }

  if (doubt.tutorId?.toString() !== tutorId) {
    return res.status(403).json({ message: 'Only the assigned tutor can submit answer' });
  }

  if (!['claimed', 'in-progress'].includes(doubt.status)) {
    return res.status(400).json({ message: 'Doubt must be in claimed or in-progress status' });
  }

  // Calculate response time in minutes
  const responseTimeMinutes = doubt.claimedAt 
    ? Math.round((new Date() - new Date(doubt.claimedAt)) / 60000)
    : null;

  // Check SLA breach
  const subscription = await Subscription.findOne({ userId: doubt.studentId }).populate('planId');
  const slaMinutes = subscription?.planId?.maxResponseTime;
  const slaBreached = slaMinutes && responseTimeMinutes > slaMinutes;

  doubt.solution = solution;
  doubt.solutionFiles = solutionFiles || [];
  doubt.status = 'submitted';
  doubt.submittedAt = new Date();
  doubt.responseTime = responseTimeMinutes;
  doubt.slaBreached = slaBreached;
  doubt.resolvedAt = new Date();
  
  await doubt.save();

  res.json({
    message: 'Answer submitted successfully',
    doubt: await doubt.populate(['studentId', 'tutorId', 'subjectId']),
    responseMetrics: {
      responseTimeMinutes,
      slaLimit: slaMinutes,
      slaBreached
    }
  });
});

// Student Reopen Resolved Doubt
export const reopenDoubt = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;
  const studentId = req.user.id;

  const doubt = await Doubt.findById(id);

  if (!doubt) {
    return res.status(404).json({ message: 'Doubt not found' });
  }

  if (doubt.studentId.toString() !== studentId) {
    return res.status(403).json({ message: 'Only the student can reopen their doubt' });
  }

  if (!['resolved', 'submitted'].includes(doubt.status)) {
    return res.status(400).json({ message: 'Only submitted or resolved doubts can be reopened' });
  }

  // Check if already reopened once (limit to prevent abuse)
  if (doubt.reopenCount >= 2) {
    return res.status(400).json({ message: 'Maximum reopen limit reached. Please post a new doubt.' });
  }

  // Reopen the doubt
  doubt.status = 'open';
  doubt.tutorId = null;
  doubt.solution = null;
  doubt.solutionFiles = [];
  doubt.studentRating = null;
  doubt.studentFeedback = null;
  doubt.submittedAt = null;
  doubt.reopenCount += 1;
  doubt.isReopened = true;
  doubt.reopenedAt = new Date();
  doubt.tutorComments = reason || 'Student reopened this doubt';
  
  await doubt.save();

  res.json({
    message: 'Doubt reopened successfully. It is now available for tutors to claim.',
    doubt: await doubt.populate(['studentId', 'subjectId']),
    reopenInfo: {
      reopenCount: doubt.reopenCount,
      maxRepeats: 2
    }
  });
});

// Get Priority Queue (for admin/system)
export const getPriorityQueue = asyncHandler(async (req, res) => {
  const queue = await Doubt.aggregate([
    {
      $match: { status: 'open' }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'studentId',
        foreignField: '_id',
        as: 'student'
      }
    },
    {
      $lookup: {
        from: 'subscriptions',
        let: { studentId: '$studentId' },
        pipeline: [
          { $match: { $expr: { $eq: ['$userId', '$$studentId'] } } },
          { $lookup: { from: 'plans', localField: 'planId', foreignField: '_id', as: 'plan' } }
        ],
        as: 'subscription'
      }
    },
    {
      $addFields: {
        plan: { 
          $ifNull: [{ $arrayElemAt: ['$subscription.plan', 0] }, { name: 'free' }]
        }
      }
    },
    {
      $sort: {
        priorityScore: -1, // Pro > Premium > Free
        queuedAt: 1 // Older doubts first
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        difficulty: 1,
        priorityScore: 1,
        queuedAt: 1,
        studentName: { $arrayElemAt: ['$student.name', 0] },
        planName: '$plan.name'
      }
    }
  ]);

  res.json({
    queue,
    totalInQueue: queue.length,
    priorityBreakdown: {
      pro: queue.filter(q => q.priorityScore === 3).length,
      premium: queue.filter(q => q.priorityScore === 2).length,
      free: queue.filter(q => q.priorityScore === 1).length,
    }
  });
});

// Get Knowledge Base (Public) — all resolved doubts with solutions
export const getKnowledgeBase = asyncHandler(async (req, res) => {
  const { q, subject, difficulty } = req.query;

  let query = {
    status: 'resolved',
    solution: { $ne: null },
    studentRating: { $ne: null },
  };

  if (subject) query.subjectId = subject;
  if (difficulty) query.difficulty = difficulty;

  let doubts;
  if (q && q.trim()) {
    try {
      doubts = await Doubt.find({ ...query, $text: { $search: q } })
        .populate('studentId', 'name')
        .populate('subjectId', 'name')
        .populate('tutorId', 'name rating')
        .sort({ score: { $meta: 'textScore' }, createdAt: -1 })
        .limit(50);
    } catch {
      // Fallback if text index not ready
      doubts = await Doubt.find({
        ...query,
        $or: [
          { title: { $regex: q, $options: 'i' } },
          { description: { $regex: q, $options: 'i' } },
          { tags: { $in: [new RegExp(q, 'i')] } },
        ],
      })
        .populate('studentId', 'name')
        .populate('subjectId', 'name')
        .populate('tutorId', 'name rating')
        .sort({ createdAt: -1 })
        .limit(50);
    }
  } else {
    doubts = await Doubt.find(query)
      .populate('studentId', 'name')
      .populate('subjectId', 'name')
      .populate('tutorId', 'name rating')
      .sort({ createdAt: -1 })
      .limit(100);
  }

  res.json({ doubts, count: doubts.length });
});
