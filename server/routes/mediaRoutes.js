import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbService } from '../services/dbService.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

import { uploadToCloudinary } from '../services/cloudinaryService.js';

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

router.get('/', async (req, res) => {
  try {
    const media = await dbService.findMedia();
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload', protect, authorize('admin', 'editor', 'manager'), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded.' });
    }

    const result = await uploadToCloudinary(req.file.buffer, req.file.mimetype, req.file.originalname);

    const mediaItem = await dbService.addMedia({
      name: req.file.originalname,
      filename: result.publicId,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: result.url
    });

    res.status(201).json(mediaItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin', 'editor', 'manager'), async (req, res) => {
  try {
    const media = await dbService.findMedia();
    const item = media.find(m => m._id === req.params.id);
    if (!item) {
      return res.status(404).json({ message: 'Media item not found.' });
    }

    // Safely delete from local disk if it exists (for backward compatibility)
    if (item.filename) {
      const UPLOAD_DIR = path.resolve('uploads');
      const filePath = path.join(UPLOAD_DIR, item.filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    // Delete from DB
    await dbService.deleteMedia(req.params.id);
    res.json({ message: 'Media file successfully removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
