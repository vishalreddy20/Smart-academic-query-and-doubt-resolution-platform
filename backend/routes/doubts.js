import express from 'express';
import Doubt from '../models/Doubt.js';
import Subject from '../models/Subject.js';
import User from '../models/User.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', verifyToken, authorize('student'), async (req, res) => {
  try {
    const { subjectId, title, description } = req.body;

    if (!subjectId || !title || !description) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    const doubt = await Doubt.create({
      studentId: req.user.id,
      subjectId,
      title,
      description,
    });

    const populatedDoubt = await doubt.populate('studentId subjectId');

    res.status(201).json({
      message: 'Doubt posted successfully',
      doubt: populatedDoubt,
    });
  } catch (error) {
    console.error('Post doubt error:', error);
    res.status(500).json({ message: 'Error posting doubt' });
  }
});

router.get('/my', verifyToken, authorize('student'), async (req, res) => {
  try {
    const doubts = await Doubt.find({ studentId: req.user.id })
      .populate('subjectId')
      .sort({ createdAt: -1 });

    res.json({ doubts });
  } catch (error) {
    console.error('Get my doubts error:', error);
    res.status(500).json({ message: 'Error fetching doubts' });
  }
});

router.get('/open', verifyToken, authorize('faculty'), async (req, res) => {
  try {
    const doubts = await Doubt.find({ status: 'OPEN' })
      .populate('studentId subjectId')
      .sort({ createdAt: -1 });

    res.json({ doubts });
  } catch (error) {
    console.error('Get open doubts error:', error);
    res.status(500).json({ message: 'Error fetching open doubts' });
  }
});

router.put('/claim/:id', verifyToken, authorize('faculty'), async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndUpdate(
      req.params.id,
      {
        status: 'CLAIMED',
        facultyId: req.user.id,
      },
      { new: true }
    ).populate('studentId subjectId');

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    res.json({
      message: 'Doubt claimed successfully',
      doubt,
    });
  } catch (error) {
    console.error('Claim doubt error:', error);
    res.status(500).json({ message: 'Error claiming doubt' });
  }
});

router.put('/answer/:id', verifyToken, authorize('faculty'), async (req, res) => {
  try {
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ message: 'Please provide an answer' });
    }

    const doubt = await Doubt.findById(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    if (doubt.facultyId.toString() !== req.user.id) {
      return res.status(403).json({ message: 'You can only answer doubts you claimed' });
    }

    doubt.status = 'RESOLVED';
    doubt.answer = answer;
    await doubt.save();

    const populatedDoubt = await doubt.populate('studentId subjectId');

    res.json({
      message: 'Doubt resolved successfully',
      doubt: populatedDoubt,
    });
  } catch (error) {
    console.error('Answer doubt error:', error);
    res.status(500).json({ message: 'Error answering doubt' });
  }
});

router.get('/knowledge-base', async (req, res) => {
  try {
    const { search } = req.query;

    let query = { status: 'RESOLVED' };

    if (search) {
      query.$text = { $search: search };
    }

    const doubts = await Doubt.find(query)
      .populate('studentId subjectId facultyId')
      .sort({ createdAt: -1 });

    res.json({ doubts });
  } catch (error) {
    console.error('Knowledge base error:', error);
    res.status(500).json({ message: 'Error fetching knowledge base' });
  }
});

router.get('/all', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const doubts = await Doubt.find()
      .populate('studentId subjectId facultyId')
      .sort({ createdAt: -1 });

    res.json({ doubts });
  } catch (error) {
    console.error('Get all doubts error:', error);
    res.status(500).json({ message: 'Error fetching all doubts' });
  }
});

router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const doubt = await Doubt.findByIdAndDelete(req.params.id);

    if (!doubt) {
      return res.status(404).json({ message: 'Doubt not found' });
    }

    res.json({ message: 'Doubt deleted successfully' });
  } catch (error) {
    console.error('Delete doubt error:', error);
    res.status(500).json({ message: 'Error deleting doubt' });
  }
});

export default router;
