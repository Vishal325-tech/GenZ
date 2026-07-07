import mongoose from 'mongoose';

const ReactionSchema = new mongoose.Schema({
  emoji: { type: String, required: true },
  label: { type: String },
  userId: { type: String },
  createdAt: { type: Date, default: Date.now }
});

const CommentSchema = new mongoose.Schema({
  userName: { type: String, required: true },
  text: { type: String, required: true },
  emoji: { type: String },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null },
  isReported: { type: Boolean, default: false },
  isApproved: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

const StorySchema = new mongoose.Schema({
  // ── Customer Info ──
  customerName: { type: String, required: true, trim: true },
  brideName: { type: String, trim: true },
  groomName: { type: String, trim: true },
  email: { type: String, required: true, trim: true },
  mobile: { type: String, required: true, trim: true },
  city: { type: String, trim: true },
  state: { type: String, trim: true },
  country: { type: String, default: 'India', trim: true },

  // ── Occasion ──
  occasion: {
    type: String,
    required: true,
    enum: [
      'Birthday', 'Anniversary', 'Wedding', 'Proposal', 'Engagement',
      'Baby Shower', 'Housewarming', 'Graduation', 'Retirement',
      "Mother's Day", "Father's Day", "Valentine's Day", 'Christmas',
      'Diwali', 'New Year', 'Congratulations', 'Corporate Celebration',
      'Festival', 'Custom Occasion'
    ]
  },
  customOccasion: { type: String, trim: true },

  // ── Media ──
  photos: [{ type: String }],          // up to 5 URLs
  videos: [{ type: String }],          // up to 2 URLs
  coverPhoto: { type: String },
  thumbnail: { type: String },

  // ── Social Media (optional) ──
  socialMedia: {
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    youtube: { type: String, trim: true },
    website: { type: String, trim: true },
    linkedin: { type: String, trim: true }
  },
  showSocialMedia: { type: Boolean, default: false },

  // ── Celebration Details ──
  title: { type: String, required: true, trim: true },
  caption: { type: String, trim: true },
  personalMessage: { type: String, trim: true },
  giftMessage: { type: String, trim: true },
  hashtags: [{ type: String }],

  // ── AI Generated Wishes ──
  aiWishes: { type: String, trim: true },
  aiHashtags: [{ type: String }],
  aiGiftSuggestions: [{ type: String }],

  // ── Schedule ──
  celebrationDate: { type: Date, required: true },
  publishTime: { type: Date },
  storyDuration: {
    type: String,
    enum: ['24h', '48h', '3d', '7d', 'custom'],
    default: '24h'
  },
  customDurationHours: { type: Number },
  expiresAt: { type: Date },

  // ── Privacy ──
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  hideComments: { type: Boolean, default: false },
  allowSharing: { type: Boolean, default: true },

  // ── Admin Workflow ──
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'published', 'expired', 'archived', 'featured'],
    default: 'pending'
  },
  adminNotes: { type: String, trim: true },
  isFeatured: { type: Boolean, default: false },
  isVerified: { type: Boolean, default: false },

  // ── Engagement ──
  reactions: [ReactionSchema],
  comments: [CommentSchema],
  viewCount: { type: Number, default: 0 },
  shareCount: { type: Number, default: 0 },

  // ── Timestamps ──
  publishedAt: { type: Date },
  archivedAt: { type: Date },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Indexes for search & archive
StorySchema.index({ status: 1, celebrationDate: 1 });
StorySchema.index({ occasion: 1 });
StorySchema.index({ customerName: 'text', title: 'text', city: 'text' });
StorySchema.index({ expiresAt: 1 });

StorySchema.pre('save', function (next) {
  this.updatedAt = new Date();

  // Auto-compute expiresAt from publishTime + duration
  if (this.publishTime && !this.expiresAt) {
    const durationMap = { '24h': 24, '48h': 48, '3d': 72, '7d': 168 };
    const hours = this.storyDuration === 'custom'
      ? (this.customDurationHours || 24)
      : (durationMap[this.storyDuration] || 24);
    this.expiresAt = new Date(this.publishTime.getTime() + hours * 60 * 60 * 1000);
  }
  next();
});

const Story = mongoose.models.Story || mongoose.model('Story', StorySchema);
export default Story;
