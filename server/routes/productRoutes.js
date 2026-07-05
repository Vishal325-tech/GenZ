import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  approveReview,
  replyToReview,
  deleteReview
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .get(getProducts)
  .post(protect, authorize('admin', 'manager'), createProduct);

router.route('/:id')
  .get(getProductById)
  .put(protect, authorize('admin', 'manager'), updateProduct)
  .delete(protect, authorize('admin', 'manager'), deleteProduct);

router.route('/:id/reviews')
  .post(protect, addProductReview);

router.route('/:id/reviews/:reviewId/approve')
  .put(protect, authorize('admin', 'manager'), approveReview);

router.route('/:id/reviews/:reviewId/reply')
  .put(protect, authorize('admin', 'manager'), replyToReview);

router.route('/:id/reviews/:reviewId')
  .delete(protect, authorize('admin', 'manager'), deleteReview);

export default router;
