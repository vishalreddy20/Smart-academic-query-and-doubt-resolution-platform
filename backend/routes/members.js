import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import Member from '../models/Member.js';

const router = express.Router();

// Resolve __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads/ folder exists (relative to backend root)
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpeg|jpg|png|gif|webp/;
  const extname = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowed.test(file.mimetype);
  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (jpg, jpeg, png, gif, webp) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// POST /api/members — Add a new member
router.post('/', upload.single('image'), async (req, res) => {
  try {
    const {
      name,
      rollNumber,
      year,
      degree,
      aboutProject,
      hobbies,
      certificate,
      internship,
      aboutYourAim,
    } = req.body;

    // Basic validation
    if (!name || !rollNumber || !year || !degree || !aboutProject) {
      return res.status(400).json({
        message: 'Name, Roll Number, Year, Degree, and About Project are required.',
      });
    }

    // Parse hobbies — could be comma-separated string or JSON array
    let hobbiesArray = [];
    if (hobbies) {
      if (Array.isArray(hobbies)) {
        hobbiesArray = hobbies.map((h) => h.trim()).filter(Boolean);
      } else {
        hobbiesArray = hobbies
          .split(',')
          .map((h) => h.trim())
          .filter(Boolean);
      }
    }

    const imageName = req.file ? req.file.filename : '';

    const member = new Member({
      name,
      rollNumber,
      year,
      degree,
      aboutProject,
      hobbies: hobbiesArray,
      certificate: certificate || '',
      internship: internship || '',
      aboutYourAim: aboutYourAim || '',
      image: imageName,
    });

    await member.save();

    res.status(201).json({
      message: 'Member added successfully!',
      member,
    });
  } catch (error) {
    console.error('POST /api/members error:', error);
    res.status(500).json({ message: error.message || 'Server error while adding member.' });
  }
});

// GET /api/members — Fetch all members
router.get('/', async (_req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.json({ members });
  } catch (error) {
    console.error('GET /api/members error:', error);
    res.status(500).json({ message: 'Server error while fetching members.' });
  }
});

// GET /api/members/:id — Fetch single member
router.get('/:id', async (req, res) => {
  try {
    // Validate ObjectId format before querying
    if (!req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        message: `Invalid member ID: "${req.params.id}". Use the actual 24-character ID from GET /api/members.`,
      });
    }
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    res.json({ member });
  } catch (error) {
    console.error('GET /api/members/:id error:', error);
    res.status(500).json({ message: 'Server error while fetching member.' });
  }
});

// DELETE /api/members/:id — Delete a member and their image
router.delete('/:id', async (req, res) => {
  try {
    const member = await Member.findById(req.params.id);
    if (!member) {
      return res.status(404).json({ message: 'Member not found.' });
    }
    // Remove image file from disk if it exists
    if (member.image) {
      const imagePath = path.join(uploadsDir, member.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }
    await Member.findByIdAndDelete(req.params.id);
    res.json({ message: 'Member deleted successfully.' });
  } catch (error) {
    console.error('DELETE /api/members/:id error:', error);
    res.status(500).json({ message: 'Server error while deleting member.' });
  }
});

export default router;
