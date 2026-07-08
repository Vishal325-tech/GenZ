import express from 'express';
import { getDashboardOverview } from '../controllers/adminDashboardController.js';
import { getAllCustomers } from '../controllers/adminCustomerController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Admin must be logged in and have 'superadmin' or 'admin' role
router.get('/stats', protect, authorize('superadmin', 'admin'), getDashboardOverview);
router.get('/customers', protect, authorize('superadmin', 'admin'), getAllCustomers);

export default router;
