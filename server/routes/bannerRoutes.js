import express from 'express';
import { dbService } from '../services/dbService.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const banners = await dbService.getBanners();
    res.json(banners);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/', protect, authorize('admin', 'editor'), async (req, res) => {
  try {
    const updated = await dbService.updateBanners(req.body);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
