import mongoose from 'mongoose';

const OrderProductSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  price: { type: Number, required: true },
  personalization: {
    photo: String,
    video: String,
    greetingCard: String,
    customMessage: String,
    wrap: String,
    ribbonColor: String
  }
});

const TrackingTimelineSchema = new mongoose.Schema({
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  note: String
});

const OrderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  products: [OrderProductSchema],
  totalAmount: { type: Number, required: true },
  couponUsed: String,
  discountAmount: { type: Number, default: 0 },
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zip: String
  },
  paymentMethod: { type: String, required: true }, // 'upi', 'gpay', 'phonepe', 'paytm', 'card', 'netbanking', 'cod'
  paymentStatus: { type: String, default: 'pending' }, // 'pending', 'paid', 'failed', 'refunded'
  orderStatus: { type: String, enum: ['pending', 'packed', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
  trackingTimeline: [TrackingTimelineSchema],
  deliveryDate: { type: String, required: true },
  deliveryTime: { type: String, required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  deliveryOTP: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Order = mongoose.models.Order || mongoose.model('Order', OrderSchema);
export default Order;
