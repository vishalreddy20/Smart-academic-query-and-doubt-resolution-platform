import Doubt from '../models/Doubt.js';
import Subscription from '../models/Subscription.js';
import Plan from '../models/Plan.js';
import User from '../models/User.js';

/**
 * Tutor Assignment Algorithm
 * 
 * Priority Queue Logic:
 * 1. Sort by plan (pro > premium > free)
 * 2. Sort by queue time (older first)
 * 3. Match with best available tutor
 * 4. Calculate SLA based on plan
 */

export const assignTutorForDoubt = async (doubtId) => {
  try {
    const doubt = await Doubt.findById(doubtId)
      .populate('studentId')
      .populate('subjectId');

    if (!doubt) throw new Error('Doubt not found');

    // Get student plan
    const subscription = await Subscription.findOne({ 
      userId: doubt.studentId._id,
      status: 'active'
    }).populate('planId');

    const plan = subscription?.planId || await Plan.findOne({ name: 'free' });

    // Priority score: 1 (free) → 2 (premium) → 3 (pro)
    const priorityMap = { free: 1, premium: 2, pro: 3 };
    const priorityScore = priorityMap[plan.name] || 1;

    // Find best tutor
    const bestTutor = await findBestTutor(doubt, plan);

    if (!bestTutor) {
      console.log(`[QUEUE] Doubt ${doubtId} queued - No tutor available`);
      return { queued: true, message: 'No tutors available, queued for later' };
    }

    // Calculate SLA
    const slaMinutes = plan.features.guaranteedSLA ? plan.maxResponseTime : null;

    // Assign to tutor
    const updated = await Doubt.findByIdAndUpdate(
      doubtId,
      {
        tutorId: bestTutor._id,
        status: 'claimed',
        studentPlanId: plan._id,
        priorityScore,
        claimedAt: new Date(),
        $set: { 
          responseTimeSLA: slaMinutes ? new Date(Date.now() + slaMinutes * 60 * 1000) : null
        }
      },
      { new: true }
    );

    console.log(`[ASSIGNED] Doubt to ${bestTutor.name} (Plan: ${plan.name})`);
    
    return {
      assigned: true,
      tutorId: bestTutor._id,
      tutorName: bestTutor.name,
      plan: plan.name,
      slaMinutes
    };

  } catch (error) {
    console.error('Assignment error:', error.message);
    throw error;
  }
};

/**
 * Find best tutor based on:
 * 1. Expertise match
 * 2. Availability (active load)
 * 3. Rating (for premium/pro students)
 * 4. Response time history
 */
const findBestTutor = async (doubt, plan) => {
  try {
    // Get subject
    const subjectName = doubt.subjectId.name;

    // Query: Active tutors with matching expertise
    let query = {
      role: 'tutor',
      isActive: true,
      isApproved: true,
      expertise: subjectName
    };

    // For premium/pro: Filter by rating
    if (plan.name === 'pro') {
      query.rating = { $gte: 4.5 };
    } else if (plan.name === 'premium') {
      query.rating = { $gte: 4.0 };
    }

    const tutors = await User.find(query).select('name email rating');

    if (tutors.length === 0) return null;

    // Sort by lightest load (fewest claimed doubts)
    const tutorsWithLoad = await Promise.all(
      tutors.map(async (tutor) => {
        const load = await Doubt.countDocuments({
          tutorId: tutor._id,
          status: { $in: ['claimed', 'in-progress', 'submitted'] }
        });
        return { ...tutor.toObject(), currentLoad: load };
      })
    );

    // Sort: lowest load first, then highest rating
    tutorsWithLoad.sort((a, b) => {
      if (a.currentLoad !== b.currentLoad) {
        return a.currentLoad - b.currentLoad;
      }
      return b.rating - a.rating;
    });

    return tutorsWithLoad[0];

  } catch (error) {
    console.error('Tutor finding error:', error.message);
    return null;
  }
};

/**
 * Get priority-sorted queue for admin dashboard
 */
export const getPriorityQueue = async () => {
  try {
    const queue = await Doubt.aggregate([
      {
        $match: { status: 'open' }
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
          plan: { $arrayElemAt: ['$subscription.plan', 0] }
        }
      },
      {
        $sort: {
          priorityScore: -1, // Pro > Premium > Free
          queuedAt: 1 // Older first within same priority
        }
      }
    ]);

    return queue;
  } catch (error) {
    console.error('Queue error:', error.message);
    return [];
  }
};

/**
 * Check and mark SLA breaches
 */
export const checkSLACompliance = async (doubtId) => {
  try {
    const doubt = await Doubt.findById(doubtId);

    if (!doubt || !doubt.claimedAt || doubt.status !== 'open') {
      return { slaBreached: false };
    }

    const subscription = await Subscription.findOne({
      userId: doubt.studentId,
      status: 'active'
    }).populate('planId');

    const plan = subscription?.planId;

    if (!plan || !plan.features.guaranteedSLA) {
      return { slaBreached: false };
    }

    const elapsedMinutes = (new Date() - doubt.claimedAt) / (1000 * 60);

    if (elapsedMinutes > plan.maxResponseTime) {
      await Doubt.findByIdAndUpdate(doubtId, { slaBreached: true });
      return { slaBreached: true, elapsedMinutes, slaLimit: plan.maxResponseTime };
    }

    return { slaBreached: false, elapsedMinutes, slaLimit: plan.maxResponseTime };

  } catch (error) {
    console.error('SLA check error:', error.message);
    return { slaBreached: false };
  }
};
