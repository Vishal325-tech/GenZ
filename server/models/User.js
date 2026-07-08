import mongoose from 'mongoose';

const AddressSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zip: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'superadmin', 'admin', 'manager', 'editor', 'delivery', 'support'], default: 'customer' },
  accountStatus: { type: String, enum: ['active', 'pending_approval', 'suspended'], default: 'active' },
  phone: { type: String },
  addressBook: [AddressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  savedCards: [{
    cardId: String,
    cardNumber: String,
    expiryDate: String,
    cardHolder: String
  }],
  notifications: [{
    title: String,
    message: String,
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Avoid OverwriteModelError
const User = mongoose.models.User || mongoose.model('User', UserSchema);
export default User;
