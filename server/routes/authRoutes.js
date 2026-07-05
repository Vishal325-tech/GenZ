import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  requestOTP,
  verifyOTP,
  forgotPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.post('/forgot-password', forgotPassword);

export default router;
