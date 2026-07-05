import express from 'express';
import {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  getInvoice,
  assignOrder,
  getDeliveryAssignments,
  verifyDeliveryOTP,
  getDeliveryStaffList
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, createOrder);

router.route('/my-orders')
  .get(protect, getUserOrders);

router.route('/all')
  .get(protect, authorize('admin', 'manager'), getAllOrders);

router.route('/delivery/my-assignments')
  .get(protect, authorize('delivery', 'admin'), getDeliveryAssignments);

router.route('/delivery-staff')
  .get(protect, authorize('admin', 'manager'), getDeliveryStaffList);

router.route('/:id/assign')
  .put(protect, authorize('admin', 'manager'), assignOrder);

router.route('/:id/verify-delivery')
  .put(protect, authorize('delivery', 'admin'), verifyDeliveryOTP);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, authorize('admin', 'manager'), updateOrderStatus);

// Publicly accessible print invoice link
router.route('/:id/invoice')
  .get(getInvoice);

export default router;
