import mongoose from 'mongoose';

const ReviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  photo: String,
  video: String,
  reply: String,
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const ProductSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  offerPrice: { type: Number },
  description: { type: String, required: true },
  stock: { type: Number, required: true, default: 0 },
  category: { type: String, required: true },
  subCategory: { type: String },
  images: [{ type: String }],
  videos: [{ type: String }],
  tags: [{ type: String }], // 'featured', 'trending', 'best_seller', etc.
  reviews: [ReviewSchema],
  ratingAverage: { type: Number, default: 4.5 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export default Product;
