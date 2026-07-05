import express from 'express';
import { dbService } from '../services/dbService.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const coupons = await dbService.findCoupons();
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/validate/:code', async (req, res) => {
  try {
    const coupon = await dbService.findCouponByCode(req.params.code);
    if (!coupon) {
      return res.status(404).json({ message: 'Invalid, inactive, or expired coupon code.' });
    }
    res.json(coupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const { code, discountPercent, expiryDate } = req.body;
    if (!code || !discountPercent) {
      return res.status(400).json({ message: 'Code and discount percent are required.' });
    }
    const newCoupon = await dbService.createCoupon({
      code: code.toUpperCase(),
      discountPercent: Number(discountPercent),
      expiryDate: expiryDate || null,
      active: true
    });
    res.status(201).json(newCoupon);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', protect, authorize('admin', 'manager'), async (req, res) => {
  try {
    const success = await dbService.deleteCoupon(req.params.id);
    if (!success) return res.status(404).json({ message: 'Coupon not found.' });
    res.json({ message: 'Coupon successfully removed.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
