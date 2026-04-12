import Doubt from '../models/Doubt.js';
import User from '../models/User.js';
import Subscription from '../models/Subscription.js';

/**
 * Assign best available tutor to a doubt
 * Implements priority-based matching with SLA tracking
 */
export const assignTutorForDoubt = async (doubtId) => {
  try {
    const doubt = await Doubt.findById(doubtId).populate('studentId subjectId');
    
    if (!doubt) {
      throw new Error('Doubt not found');
    }

    // Get student's subscription plan
    const subscription = await Subscription.findOne({ userId: doubt.studentId._id }).populate('planId');
    const plan = subscription?.planId;

    if (!plan) {
      console.log(`Doubt ${doubtId}: No plan found for student`);
      return null; // Stay in queue until tutor manually claims
    }

    // Calculate SLA deadline (in minutes from now)
    const slaMinutes = plan.maxResponseTime;
    const responseTimeSLA = new Date(Date.now() + slaMinutes * 60000);

    // Find best tutor for this doubt
    const tutor = await findBestTutor(doubt, plan);

    if (!tutor) {
      console.log(`Doubt ${doubtId}: No available tutor matching criteria`);
      doubt.responseTimeSLA = responseTimeSLA;
      await doubt.save();
      return null; // Doubt stays in queue
    }

    // Assign tutor
    doubt.tutorId = tutor._id;
    doubt.status = 'claimed';
    doubt.claimedAt = new Date();
    doubt.responseTimeSLA = responseTimeSLA;

    await doubt.save();

    console.log(`✓ Doubt ${doubtId} assigned to tutor ${tutor.name} (Rating: ${tutor.rating})`);
    return tutor;

  } catch (error) {
    console.error('Assignment service error:', error.message);
    throw error;
  }
};

/**
 * Find best tutor based on expertise, load, and rating
 * Pro/Premium students get quality-filtered tutors
 */
export const findBestTutor = async (doubt, plan) => {
  try {
    // Filter tutors with matching subject expertise
    const tutorsWithExpertise = await User.find({
      role: 'tutor',
      isActive: true,
      isApproved: true,
      expertiseSubjects: doubt.subjectId._id,
    });

    if (tutorsWithExpertise.length === 0) {
      return null;
    }

    // Apply rating filters based on plan tier
    let filteredTutors = tutorsWithExpertise;
    if (plan.name === 'pro') {
      filteredTutors = tutorsWithExpertise.filter(t => t.rating >= 4.5);
    } else if (plan.name === 'premium') {
      filteredTutors = tutorsWithExpertise.filter(t => t.rating >= 4.0);
    }
    // Free tier: all tutors

    if (filteredTutors.length === 0) {
      return null;
    }

    // Calculate current load for each tutor
    const tutorsWithLoad = await Promise.all(
      filteredTutors.map(async (tutor) => {
        const claimed = await Doubt.countDocuments({
          tutorId: tutor._id,
          status: { $in: ['claimed', 'in-progress', 'submitted'] }
        });
        return {
          ...tutor.toObject(),
          currentLoad: claimed
        };
      })
    );

    // Sort by lightest load first, then highest rating
    tutorsWithLoad.sort((a, b) => {
      if (a.currentLoad !== b.currentLoad) {
        return a.currentLoad - b.currentLoad;
      }
      return b.rating - a.rating;
    });

    return tutorsWithLoad[0]; // Return lightest-loaded tutor

  } catch (error) {
    console.error('Error finding best tutor:', error.message);
    return null;
  }
};

/**
 * Get priority queue of open doubts
 * Sorted by priority score (pro > premium > free), then by queue time
 */
export const getPriorityQueue = async () => {
  try {
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
          _id: 1,
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

    return queue;

  } catch (error) {
    console.error('Error getting priority queue:', error.message);
    return [];
  }
};

/**
 * Check if doubt has breached SLA
 */
export const checkSLACompliance = async (doubtId) => {
  try {
    const doubt = await Doubt.findById(doubtId);

    if (!doubt || !doubt.responseTimeSLA) {
      return { breached: false };
    }

    const now = new Date();
    const breached = now > doubt.responseTimeSLA;

    if (breached && !doubt.slaBreached) {
      doubt.slaBreached = true;
      await doubt.save();
    }

    return {
      breached,
      deadline: doubt.responseTimeSLA,
      elapsed: Math.round((now - doubt.claimedAt) / 60000)
    };

  } catch (error) {
    console.error('Error checking SLA compliance:', error.message);
    return { breached: false, error: error.message };
  }
};
