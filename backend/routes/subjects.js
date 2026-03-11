import express from 'express';
import Subject from '../models/Subject.js';
import { verifyToken, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const subjects = await Subject.find().sort({ subjectName: 1 });
    res.json({ subjects });
  } catch (error) {
    console.error('Get subjects error:', error);
    res.status(500).json({ message: 'Error fetching subjects' });
  }
});

router.post('/', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const { subjectName, description } = req.body;

    if (!subjectName) {
      return res.status(400).json({ message: 'Please provide subject name' });
    }

    const existingSubject = await Subject.findOne({ subjectName });
    if (existingSubject) {
      return res.status(400).json({ message: 'Subject already exists' });
    }

    const subject = await Subject.create({
      subjectName,
      description: description || '',
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject,
    });
  } catch (error) {
    console.error('Create subject error:', error);
    res.status(500).json({ message: 'Error creating subject' });
  }
});

router.delete('/:id', verifyToken, authorize('admin'), async (req, res) => {
  try {
    const subject = await Subject.findByIdAndDelete(req.params.id);

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deleted successfully' });
  } catch (error) {
    console.error('Delete subject error:', error);
    res.status(500).json({ message: 'Error deleting subject' });
  }
});

export default router;
