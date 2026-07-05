import express from 'express';
import { dbService } from '../services/dbService.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const msgs = await dbService.findMessages();
    res.json(msgs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All message parameters are required.' });
    }
    const newMsg = await dbService.createMessage({ name, email, subject, message });
    res.status(201).json(newMsg);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id/reply', protect, authorize('admin'), async (req, res) => {
  try {
    const { reply } = req.body;
    const updated = await dbService.updateMessageStatus(req.params.id, reply || '');
    if (!updated) return res.status(404).json({ message: 'Message not found.' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const success = await dbService.deleteMessage(req.params.id);
    if (!success) return res.status(404).json({ message: 'Message not found.' });
    res.json({ message: 'Message successfully deleted.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
