import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String, required: true },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  reply: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.models.Message || mongoose.model('Message', MessageSchema);
export default Message;
