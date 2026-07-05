import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { dbService } from '../services/dbService.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

const UPLOAD_DIR = path.resolve('uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit to support gift videos
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

    const host = req.get('host');
    const protocol = req.protocol;
    const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const mediaItem = await dbService.addMedia({
      name: req.file.originalname,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
      size: req.file.size,
      url: fileUrl
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

    // Delete from disk
    const filePath = path.join(UPLOAD_DIR, item.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete from DB
    await dbService.deleteMedia(req.params.id);
    res.json({ message: 'Media file successfully removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
