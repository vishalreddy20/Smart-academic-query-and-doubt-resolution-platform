import Doubt from '../models/Doubt.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import asyncHandler from 'express-async-handler';

// Real Analytics: Trends over time
export const getDoubtsOverTime = asyncHandler(async (req, res) => {
  const { days = 30 } = req.query;
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const trend = await Doubt.aggregate([
    {
      $match: { createdAt: { $gte: startDate } }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 },
        resolved: {
          $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
        }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json({ trend, period: `${days} days` });
});

// Subject-wise load
export const getSubjectLoad = asyncHandler(async (req, res) => {
  const load = await Doubt.aggregate([
    {
      $group: {
        _id: '$subjectId',
        totalDoubts: { $sum: 1 },
        openDoubts: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        resolvedDoubts: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgResponseTime: {
          $avg: { $cond: ['$responseTime', '$responseTime', null] }
        },
      }
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subject'
      }
    },
    { $unwind: '$subject' },
    {
      $project: {
        subject: '$subject.name',
        totalDoubts: 1,
        openDoubts: 1,
        resolvedDoubts: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        resolutionRate: {
          $round: [{ $multiply: [{ $divide: ['$resolvedDoubts', '$totalDoubts'] }, 100] }, 2]
        }
      }
    },
    { $sort: { totalDoubts: -1 } }
  ]);

  res.json({ subjectLoad: load });
});

// Tutor performance analytics
export const getTutorPerformance = asyncHandler(async (req, res) => {
  const performance = await Doubt.aggregate([
    {
      $match: { tutorId: { $ne: null } }
    },
    {
      $group: {
        _id: '$tutorId',
        totalAnswered: { $sum: 1 },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        avgResponseTime: { $avg: '$responseTime' },
        avgRating: { $avg: '$studentRating' },
        slaBreachedCount: { $sum: { $cond: ['$slaBreached', 1, 0] } },
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'tutor'
      }
    },
    { $unwind: '$tutor' },
    {
      $project: {
        tutorName: '$tutor.name',
        tutorEmail: '$tutor.email',
        totalAnswered: 1,
        resolved: 1,
        avgResponseTime: { $round: ['$avgResponseTime', 2] },
        avgRating: { $round: ['$avgRating', 2] },
        slaBreachedCount: 1,
        resolutionRate: {
          $round: [{ $multiply: [{ $divide: ['$resolved', '$totalAnswered'] }, 100] }, 2]
        },
        performance: {
          $cond: [
            { $gte: [{ $divide: ['$resolved', '$totalAnswered'] }, 0.8] },
            'Excellent',
            {
              $cond: [
                { $gte: [{ $divide: ['$resolved', '$totalAnswered'] }, 0.6] },
                'Good',
                'Needs Improvement'
              ]
            }
          ]
        }
      }
    },
    { $sort: { totalAnswered: -1 } }
  ]);

  res.json({ tutorPerformance: performance });
});

// Resolution turnaround time
export const getResolutionTurnaround = asyncHandler(async (req, res) => {
  const turnaround = await Doubt.aggregate([
    {
      $match: { status: 'resolved', responseTime: { $ne: null } }
    },
    {
      $group: {
        _id: null,
        avgResolutionTime: { $avg: '$responseTime' },
        minResolutionTime: { $min: '$responseTime' },
        maxResolutionTime: { $max: '$responseTime' },
        p50ResolutionTime: { $avg: '$responseTime' }, // Simplified (use percentile in production)
        withinSLA: { $sum: { $cond: [{ $eq: ['$slaBreached', false] }, 1, 0] } },
        slaBreached: { $sum: { $cond: ['$slaBreached', 1, 0] } },
      }
    }
  ]);

  const stats = turnaround[0] || {};
  const total = (stats.withinSLA || 0) + (stats.slaBreached || 0);

  res.json({
    resolutionTurnaround: {
      ...stats,
      slaComplianceRate: total > 0 ? ((stats.withinSLA / total) * 100).toFixed(2) : 0,
    }
  });
});

// Premium conversion analytics
export const getPremiumConversion = asyncHandler(async (req, res) => {
  const totalUsers = await User.countDocuments({ role: 'student' });
  const premiumSubscriptions = await Subscription.countDocuments({ status: 'active' });
  const premiumUsers = await Subscription.aggregate([
    {
      $group: {
        _id: null,
        totalRevenue: {
          $sum: {
            $cond: [{ $ne: ['$_id', null] }, 1, 0]
          }
        }
      }
    }
  ]);

  // Get plan distribution
  const planDistribution = await Subscription.aggregate([
    {
      $match: { status: 'active' }
    },
    {
      $group: {
        _id: '$planId',
        count: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: 'plans',
        localField: '_id',
        foreignField: '_id',
        as: 'plan'
      }
    },
    { $unwind: '$plan' },
    {
      $project: {
        planName: '$plan.name',
        displayName: '$plan.displayName',
        count: 1,
        price: '$plan.price'
      }
    }
  ]);

  res.json({
    premiumMetrics: {
      totalStudents: totalUsers,
      activeSubscriptions: premiumSubscriptions,
      conversionRate: totalUsers > 0 ? ((premiumSubscriptions / totalUsers) * 100).toFixed(2) : 0,
      planDistribution,
    }
  });
});

// Dashboard overview (real metrics, not just counters)
export const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const [trends, subjectLoad, tutorPerf, turnaround, conversion] = await Promise.all([
    Doubt.aggregate([
      {
        $match: { createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
          open: { $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] } },
        }
      }
    ]),
    Doubt.aggregate([
      {
        $group: {
          _id: '$subjectId',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Doubt.findOne({ tutorId: { $ne: null }, studentRating: { $ne: null } })
      .select('studentRating')
      .exec(),
    Doubt.aggregate([
      {
        $match: { status: 'resolved' }
      },
      {
        $group: {
          _id: null,
          avgTime: { $avg: '$responseTime' },
          slaRate: {
            $avg: { $cond: [{ $eq: ['$slaBreached', false] }, 1, 0] }
          }
        }
      }
    ]),
    Subscription.countDocuments({ status: 'active' })
  ]);

  res.json({
    overview: {
      doubtsTrend: trends[0] || { total: 0, resolved: 0, open: 0 },
      topSubjects: subjectLoad,
      avgTutorRating: tutorPerf[0] ? tutorPerf[0].studentRating : 0,
      resolutionMetrics: turnaround[0] || { avgTime: 0, slaRate: 0 },
      activeSubscriptions: conversion,
    }
  });
});
