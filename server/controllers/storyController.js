import fs from 'fs';
import path from 'path';
import dbService from '../services/dbService.js';
import { generateWishes, generateHashtags, generateGiftSuggestions } from '../services/aiWishesService.js';
import { renameCloudinaryAsset, deleteFromCloudinary } from '../services/cloudinaryService.js';

const SETTINGS_FILE = path.resolve('data/settings.json');

const readSettings = () => {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading settings file:', err);
  }
  return { autoApprove: false };
};

const writeSettings = (settings) => {
  try {
    const dir = path.dirname(SETTINGS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2));
    return true;
  } catch (err) {
    console.error('Error writing settings file:', err);
    return false;
  }
};

// ── Helper to delete story media from Cloudinary ──
const deleteStoryMedia = async (story) => {
  const photos = story.photos || [];
  const videos = story.videos || [];
  const coverPhoto = story.coverPhoto;
  const thumbnail = story.thumbnail;

  const destroyAsset = async (url, type) => {
    if (!url || !url.includes('cloudinary.com')) return;
    try {
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (!match) return;
      const publicId = match[1];
      await deleteFromCloudinary(publicId, type);
      console.log(`🗑️ Deleted Cloudinary asset: ${publicId} (${type})`);
    } catch (err) {
      console.error(`Failed to delete Cloudinary asset: ${url}`, err);
    }
  };

  for (const url of photos) {
    await destroyAsset(url, 'image');
  }
  for (const url of videos) {
    await destroyAsset(url, 'video');
  }
  if (coverPhoto) {
    await destroyAsset(coverPhoto, 'image');
  }
  if (thumbnail) {
    await destroyAsset(thumbnail, 'image');
  }
};

// ── Helper to move media files between folders in Cloudinary ──
const moveStoryMedia = async (story, targetState) => {
  const photos = story.photos || [];
  const videos = story.videos || [];
  const updatedPhotos = [];
  const updatedVideos = [];

  const renameMedia = async (url, type) => {
    if (!url || !url.includes('cloudinary.com')) return url;
    try {
      // Extract public ID from Cloudinary URL (excludes version prefix if present, and file extension)
      const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
      if (!match) return url;
      const fromPublicId = match[1];
      
      let toPublicId = fromPublicId;
      if (fromPublicId.includes('/pending/')) {
        toPublicId = fromPublicId.replace('/pending/', `/${targetState}/`);
      } else if (fromPublicId.includes('/approved/')) {
        toPublicId = fromPublicId.replace('/approved/', `/${targetState}/`);
      }

      if (fromPublicId === toPublicId) return url;

      // Rename asset in Cloudinary REST API
      const newUrl = await renameCloudinaryAsset(fromPublicId, toPublicId, type);
      return newUrl;
    } catch (err) {
      console.error(`Failed to move story media asset: ${url} to ${targetState}`, err);
      return url; // Keep original URL on failure
    }
  };

  // Process all media in parallel batches or sequence
  for (const url of photos) {
    const newUrl = await renameMedia(url, 'image');
    updatedPhotos.push(newUrl);
  }

  for (const url of videos) {
    const newUrl = await renameMedia(url, 'video');
    updatedVideos.push(newUrl);
  }

  let coverPhoto = story.coverPhoto;
  if (coverPhoto) {
    coverPhoto = await renameMedia(coverPhoto, 'image');
  }

  let thumbnail = story.thumbnail;
  if (thumbnail) {
    thumbnail = await renameMedia(thumbnail, 'image');
  }

  return {
    photos: updatedPhotos,
    videos: updatedVideos,
    coverPhoto,
    thumbnail
  };
};

// ── Public: Submit a new story ──
export const submitStory = async (req, res) => {
  try {
    const data = req.body;

    // Check if active story already exists with this email or mobile
    const existing = await dbService.findStories({
      $or: [
        { email: data.email },
        { mobile: data.mobile }
      ],
      status: { $ne: 'archived' }
    });

    if (existing && existing.length > 0) {
      return res.status(400).json({
        message: 'You have already uploaded a story with this email or mobile number. Multiple active submissions are not allowed.'
      });
    }

    // Enforce media limits
    if (data.photos && data.photos.length > 5) {
      return res.status(400).json({ message: 'Maximum 5 photos allowed.' });
    }
    if (data.videos && data.videos.length > 2) {
      return res.status(400).json({ message: 'Maximum 2 videos allowed.' });
    }

    // Auto-generate AI wishes if not provided
    if (!data.aiWishes) {
      data.aiWishes = generateWishes(data.occasion);
    }
    if (!data.aiHashtags || data.aiHashtags.length === 0) {
      data.aiHashtags = generateHashtags(data.occasion);
    }
    if (!data.aiGiftSuggestions || data.aiGiftSuggestions.length === 0) {
      data.aiGiftSuggestions = generateGiftSuggestions(data.occasion);
    }

    // Set publish time to celebration date if not specified
    if (!data.publishTime) {
      data.publishTime = data.celebrationDate;
    }

    // Check auto-approve setting
    const settings = readSettings();
    const autoApprove = settings.autoApprove || false;

    if (autoApprove) {
      data.status = 'published';
      data.publishedAt = new Date().toISOString();
    } else {
      data.status = 'pending';
    }

    const story = await dbService.createStory(data);

    res.status(201).json({
      message: 'Story submitted successfully! It will be reviewed and published.',
      story
    });
  } catch (error) {
    console.error('Submit story error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ── Public: Get active (published) stories ──
export const getActiveStories = async (req, res) => {
  try {
    const allStories = await dbService.findStories({
      status: { $in: ['published', 'featured'] }
    });

    // Filter active (non-expired)
    const now = new Date();
    const activeStories = allStories.filter(story => {
      if (!story.expiresAt) return true;
      return new Date(story.expiresAt) > now;
    });

    // Sort by featured first, then published date
    activeStories.sort((a, b) => {
      if (a.isFeatured && !b.isFeatured) return -1;
      if (!a.isFeatured && b.isFeatured) return 1;
      return new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt);
    });

    // Strip comments & notes for public feed
    const sanitized = activeStories.map(s => {
      const { comments, adminNotes, email, mobile, ...rest } = s;
      return rest;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Public: Get single story by ID ──
export const getStoryById = async (req, res) => {
  try {
    const story = await dbService.findStoryById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: 'Story not found.' });
    }

    // Increment view count
    story.viewCount = (story.viewCount || 0) + 1;
    await dbService.updateStory(story._id, { viewCount: story.viewCount });

    res.json(story);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Public: React to a story ──
export const reactToStory = async (req, res) => {
  try {
    const { emoji, label } = req.body;
    const story = await dbService.findStoryById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found.' });

    const reactions = story.reactions || [];
    reactions.push({ emoji, label, userId: req.body.userId || 'anonymous', createdAt: new Date() });
    
    await dbService.updateStory(story._id, { reactions });

    res.json({ message: 'Reaction added!', reactions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Public: Add a comment ──
export const addComment = async (req, res) => {
  try {
    const story = await dbService.findStoryById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found.' });
    if (story.hideComments) return res.status(403).json({ message: 'Comments are disabled.' });

    const { userName, text, emoji, parentId } = req.body;
    const comments = story.comments || [];
    comments.push({
      _id: `comment_${Math.random().toString(36).substr(2, 9)}`,
      userName,
      text,
      emoji,
      parentId: parentId || null,
      isApproved: true,
      createdAt: new Date().toISOString()
    });

    await dbService.updateStory(story._id, { comments });

    res.json({ message: 'Comment added!', comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Public: Share tracking ──
export const trackShare = async (req, res) => {
  try {
    const story = await dbService.findStoryById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found.' });

    const shareCount = (story.shareCount || 0) + 1;
    await dbService.updateStory(story._id, { shareCount });

    res.json({ message: 'Share tracked', shareCount });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Public: Search/Archive ──
export const searchStories = async (req, res) => {
  try {
    const { q, occasion, city, month, year, sort } = req.query;
    
    // Get all stories visible to public
    const allStories = await dbService.findStories({});
    let list = allStories.filter(s => 
      s.visibility === 'public' && 
      ['published', 'featured', 'archived'].includes(s.status)
    );

    if (occasion) {
      list = list.filter(s => s.occasion === occasion);
    }
    if (city) {
      const cityRegex = new RegExp(city, 'i');
      list = list.filter(s => cityRegex.test(s.city || ''));
    }
    if (q) {
      const qLower = q.toLowerCase();
      list = list.filter(s => 
        s.customerName.toLowerCase().includes(qLower) ||
        s.title.toLowerCase().includes(qLower) ||
        (s.city || '').toLowerCase().includes(qLower)
      );
    }
    if (month || year) {
      list = list.filter(s => {
        const sDate = new Date(s.celebrationDate);
        if (year && sDate.getFullYear() !== parseInt(year)) return false;
        if (month && (sDate.getMonth() + 1) !== parseInt(month)) return false;
        return true;
      });
    }

    if (sort === 'popular') {
      list.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (sort === 'shared') {
      list.sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0));
    } else if (sort === 'liked') {
      list.sort((a, b) => (b.reactions?.length || 0) - (a.reactions?.length || 0));
    } else {
      list.sort((a, b) => new Date(b.publishedAt || b.createdAt) - new Date(a.publishedAt || a.createdAt));
    }

    // Strip comments
    const sanitized = list.slice(0, 50).map(s => {
      const { comments, adminNotes, email, mobile, ...rest } = s;
      return rest;
    });

    res.json(sanitized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── AI: Generate wishes for an occasion ──
export const getAIWishes = async (req, res) => {
  try {
    const { occasion } = req.query;
    if (!occasion) return res.status(400).json({ message: 'Occasion is required.' });

    const wishes = generateWishes(occasion);
    const hashtags = generateHashtags(occasion);
    const gifts = generateGiftSuggestions(occasion);

    res.json({ wishes, hashtags, giftSuggestions: gifts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ══════════════════════════════════════════════════
// ADMIN ENDPOINTS
// ══════════════════════════════════════════════════

// ── Admin: Get all stories with filters ──
export const adminGetAllStories = async (req, res) => {
  try {
    const { status, occasion, featured } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (occasion) filter.occasion = occasion;
    if (featured === 'true') filter.isFeatured = true;

    const stories = await dbService.findStories(filter);
    stories.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    res.json(stories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Dashboard Stats ──
export const adminGetStats = async (req, res) => {
  try {
    const all = await dbService.findStories({});
    const total = all.length;
    const active = all.filter(s => ['published', 'featured'].includes(s.status)).length;
    const pending = all.filter(s => s.status === 'pending').length;
    const scheduled = all.filter(s => s.status === 'approved' && new Date(s.publishTime) > new Date()).length;
    const archived = all.filter(s => s.status === 'archived').length;
    const featured = all.filter(s => s.isFeatured).length;

    // Most viewed
    const mostViewed = [...all].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5);
    // Most shared
    const mostShared = [...all].sort((a, b) => (b.shareCount || 0) - (a.shareCount || 0)).slice(0, 5);

    // Top occasion calculation
    const counts = {};
    all.forEach(s => {
      counts[s.occasion] = (counts[s.occasion] || 0) + 1;
    });
    let topOccasion = null;
    let maxCount = 0;
    Object.keys(counts).forEach(occ => {
      if (counts[occ] > maxCount) {
        maxCount = counts[occ];
        topOccasion = { _id: occ, count: maxCount };
      }
    });

    res.json({
      total, active, pending, scheduled, archived, featured,
      mostViewed, mostShared, topOccasion
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Update story status ──
export const adminUpdateStory = async (req, res) => {
  try {
    const story = await dbService.findStoryById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found.' });

    const updates = {};
    const allowedFields = [
      'status', 'adminNotes', 'isFeatured', 'isVerified',
      'publishTime', 'storyDuration', 'customDurationHours',
      'title', 'caption', 'personalMessage', 'occasion'
    ];

    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    // Capture state transition
    const originalStatus = story.status;
    const targetStatus = req.body.status || story.status;

    // Handle rejection by deleting the story and its media from Cloudinary
    if (targetStatus === 'rejected') {
      console.log(`🗑️ Rejecting story: deleting story document and Cloudinary media: ${story.title}`);
      await deleteStoryMedia(story);
      await dbService.deleteStory(story._id);
      return res.json({ message: 'Story rejected and deleted successfully, and media removed from Cloudinary.' });
    }

    // Auto-set timestamps based on status
    if (targetStatus === 'published' || targetStatus === 'featured') {
      updates.publishedAt = story.publishedAt || new Date().toISOString();
    }
    if (targetStatus === 'archived') {
      updates.archivedAt = new Date().toISOString();
    }

    // ── User Request: Folder organization inside Cloudinary ──
    // If approved, move media from stories/pending to stories/approved
    if (originalStatus === 'pending' && (targetStatus === 'approved' || targetStatus === 'published' || targetStatus === 'featured')) {
      console.log(`📦 Transitioning story media to approved folder on Cloudinary: ${story.title}`);
      const relocatedMedia = await moveStoryMedia(story, 'approved');
      Object.assign(updates, relocatedMedia);
    } 
    // If archived/expired, move to stories/archived
    else if (targetStatus === 'archived' && originalStatus !== 'archived') {
      console.log(`📦 Transitioning story media to archived folder on Cloudinary: ${story.title}`);
      const relocatedMedia = await moveStoryMedia(story, 'archived');
      Object.assign(updates, relocatedMedia);
    }

    const updatedStory = await dbService.updateStory(story._id, updates);
    res.json({ message: `Story status updated to ${updatedStory.status}.`, story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Delete story ──
export const adminDeleteStory = async (req, res) => {
  try {
    const story = await dbService.findStoryById(req.params.id);
    if (!story) return res.status(404).json({ message: 'Story not found.' });

    // Delete media from Cloudinary
    await deleteStoryMedia(story);

    const success = await dbService.deleteStory(req.params.id);
    if (!success) return res.status(404).json({ message: 'Story not found.' });
    res.json({ message: 'Story deleted successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Moderate comment ──
export const adminModerateComment = async (req, res) => {
  try {
    const { action } = req.body; // 'approve' | 'delete'
    const story = await dbService.findStoryById(req.params.storyId);
    if (!story) return res.status(404).json({ message: 'Story not found.' });

    let comments = story.comments || [];
    if (action === 'delete') {
      comments = comments.filter(c => c._id !== req.params.commentId);
    } else if (action === 'approve') {
      comments = comments.map(c => {
        if (c._id === req.params.commentId) {
          return { ...c, isApproved: true };
        }
        return c;
      });
    }

    await dbService.updateStory(story._id, { comments });
    res.json({ message: `Comment ${action}d.`, comments });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Scheduler: Auto-publish & auto-expire ──
export const runScheduler = async () => {
  const now = new Date();

  try {
    const allStories = await dbService.findStories({});

    // Auto-publish approved stories whose publishTime has arrived
    const toPublish = allStories.filter(s => 
      s.status === 'approved' && 
      s.publishTime && 
      new Date(s.publishTime) <= now
    );
    
    for (const story of toPublish) {
      // Transition approved story to published
      const updates = {
        status: 'published',
        publishedAt: now.toISOString()
      };
      
      // Relocate media to approved folder in Cloudinary
      const relocatedMedia = await moveStoryMedia(story, 'approved');
      Object.assign(updates, relocatedMedia);

      await dbService.updateStory(story._id, updates);
      console.log(`📢 Auto-published story & relocated media: ${story.title}`);
    }

    // Auto-expire published stories past expiresAt
    const toExpire = allStories.filter(s => 
      ['published', 'featured'].includes(s.status) && 
      s.expiresAt && 
      new Date(s.expiresAt) <= now
    );

    for (const story of toExpire) {
      const updates = {
        status: 'archived',
        archivedAt: now.toISOString()
      };

      // Relocate media to archived folder in Cloudinary
      const relocatedMedia = await moveStoryMedia(story, 'archived');
      Object.assign(updates, relocatedMedia);

      await dbService.updateStory(story._id, updates);
      console.log(`📦 Auto-archived story & relocated media: ${story.title}`);
    }
  } catch (error) {
    console.error('Scheduler execution failed:', error);
  }
};

// ── Admin: Get settings ──
export const getAdminSettings = async (req, res) => {
  try {
    const settings = readSettings();
    res.json({ autoApprove: settings.autoApprove || false });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ── Admin: Update settings ──
export const updateAdminSettings = async (req, res) => {
  try {
    const { autoApprove } = req.body;
    const settings = readSettings();
    settings.autoApprove = autoApprove;
    writeSettings(settings);
    res.json({ message: 'Settings updated successfully.', autoApprove: settings.autoApprove });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
