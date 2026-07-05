import express from 'express';
import { dbService } from '../services/dbService.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const cats = await dbService.findCategories();
    res.json(cats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const newCat = await dbService.createCategory(req.body);
    res.status(201).json(newCat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const updated = await dbService.updateCategory(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Category not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const success = await dbService.deleteCategory(req.params.id);
    if (!success) return res.status(404).json({ message: 'Category not found' });
    res.json({ message: 'Category removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
