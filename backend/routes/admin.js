import express from 'express';
import Doubt from '../models/Doubt.js';
import User from '../models/User.js';
import Subject from '../models/Subject.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalDoubts = await Doubt.countDocuments();
    const totalSubjects = await Subject.countDocuments();

    const doubtsByStatus = await Doubt.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
        },
      },
    ]);

    const statusCounts = {
      OPEN: 0,
      CLAIMED: 0,
      RESOLVED: 0,
    };

    doubtsByStatus.forEach((item) => {
      statusCounts[item._id] = item.count;
    });

    const stats = {
      totalUsers,
      totalDoubts,
      totalSubjects,
      openDoubts: statusCounts.OPEN,
      claimedDoubts: statusCounts.CLAIMED,
      resolvedDoubts: statusCounts.RESOLVED,
    };

    res.json({ stats });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ message: 'Error fetching stats' });
  }
});

export default router;
