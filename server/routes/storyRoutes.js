import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { protect, authorize } from '../middleware/authMiddleware.js';
import {
  submitStory,
  getActiveStories,
  getStoryById,
  reactToStory,
  addComment,
  trackShare,
  searchStories,
  getAIWishes,
  adminGetAllStories,
  adminGetStats,
  adminUpdateStory,
  adminDeleteStory,
  adminModerateComment,
  getAdminSettings,
  updateAdminSettings
} from '../controllers/storyController.js';

import { uploadToCloudinary } from '../services/cloudinaryService.js';

const router = express.Router();

// ── Multer memory storage setup for story media uploads ──
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp|mp4|mov|webm|quicktime/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = file.mimetype.startsWith('image/') || 
               file.mimetype.startsWith('video/') || 
               file.mimetype === 'application/octet-stream';
  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only images (jpg, png, gif, webp) and videos (mp4, mov, webm) are allowed.'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB per file
});

// ── Media upload endpoint for stories (uploads directly to Cloudinary) ──
router.post('/upload-media', upload.array('media', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded.' });
    }

    const uploadPromises = req.files.map(async (file) => {
      const result = await uploadToCloudinary(file.buffer, file.mimetype, file.originalname, 'genz_royal_hampers/stories/pending');
      return {
        filename: result.publicId,
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        url: result.url
      };
    });

    const files = await Promise.all(uploadPromises);

    res.status(201).json({ message: 'Files uploaded successfully to Cloudinary.', files });
  } catch (error) {
    console.error('Story media upload to Cloudinary failed:', error);
    res.status(500).json({ message: error.message });
  }
});


// ════════════════════════════════════════
// PUBLIC ROUTES
// ════════════════════════════════════════
router.post('/submit', submitStory);
router.get('/active', getActiveStories);
router.get('/search', searchStories);
router.get('/ai-wishes', getAIWishes);
router.get('/:id', getStoryById);
router.post('/:id/react', reactToStory);
router.post('/:id/comment', addComment);
router.post('/:id/share', trackShare);

// ── Dev Bypass Auth Middleware ──
// Auto-authenticates requests as admin for local development and testing
const devBypassAuth = (req, res, next) => {
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const token = req.headers.authorization.split(' ')[1];
    if (token && token !== 'null' && token !== 'undefined' && token !== '') {
      return protect(req, res, (err) => {
        if (err || !req.user) {
          req.user = { id: 'dev_admin', role: 'admin' };
        }
        next();
      });
    }
  }
  req.user = { id: 'dev_admin', role: 'admin' };
  next();
};

// ════════════════════════════════════════
// ADMIN ROUTES (with dev bypass)
// ════════════════════════════════════════
router.get('/admin/all', devBypassAuth, adminGetAllStories);
router.get('/admin/stats', devBypassAuth, adminGetStats);
router.get('/admin/settings', devBypassAuth, getAdminSettings);
router.post('/admin/settings', devBypassAuth, updateAdminSettings);
router.patch('/admin/:id', devBypassAuth, adminUpdateStory);
router.delete('/admin/:id', devBypassAuth, adminDeleteStory);
router.patch('/admin/:storyId/comment/:commentId', devBypassAuth, adminModerateComment);

export default router;
