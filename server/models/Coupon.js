import mongoose from 'mongoose';

const CouponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountPercent: { type: Number, required: true },
  active: { type: Boolean, default: true },
  expiryDate: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

const Coupon = mongoose.models.Coupon || mongoose.model('Coupon', CouponSchema);
export default Coupon;
