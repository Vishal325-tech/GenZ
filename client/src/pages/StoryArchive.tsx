import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Filter, Calendar, MapPin, Heart, Eye, Share2,
  ChevronDown, Clock, Star, Sparkles, X, Grid, List
} from 'lucide-react';

const getApiBase = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url.endsWith('/api')) return url;
  if (url.endsWith('/api/')) return url.slice(0, -1);
  return `${url}/api`;
};
const API_BASE = getApiBase();

const OCCASIONS = [
  'All', 'Birthday', 'Anniversary', 'Wedding', 'Proposal', 'Engagement',
  'Baby Shower', 'Housewarming', 'Graduation', 'Retirement',
  "Mother's Day", "Father's Day", "Valentine's Day", 'Christmas',
  'Diwali', 'New Year', 'Congratulations', 'Festival'
];

const SORT_OPTIONS = [
  { value: 'recent', label: 'Most Recent' },
  { value: 'popular', label: 'Most Viewed' },
  { value: 'shared', label: 'Most Shared' },
  { value: 'liked', label: 'Most Liked' },
];

const occasionEmoji: Record<string, string> = {
  Birthday: '🎂', Anniversary: '💍', Wedding: '💒', Proposal: '💍',
  Engagement: '💍', 'Baby Shower': '🍼', Housewarming: '🏠',
  Graduation: '🎓', Retirement: '🎉', "Mother's Day": '🌸',
  "Father's Day": '👔', "Valentine's Day": '💝', Christmas: '🎄',
  Diwali: '🪔', 'New Year': '🎆', Congratulations: '🎊',
  'Corporate Celebration': '🏢', Festival: '🎊', 'Custom Occasion': '🌟'
};

interface StoryData {
  _id: string;
  customerName: string;
  brideName?: string;
  groomName?: string;
  occasion: string;
  title: string;
  caption?: string;
  coverPhoto?: string;
  thumbnail?: string;
  photos: string[];
  videos: string[];
  personalMessage?: string;
  celebrationDate: string;
  city?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  viewCount?: number;
  shareCount?: number;
  reactions: { emoji: string }[];
}

interface StoryArchiveProps {
  onViewStory?: (stories: StoryData[], index: number) => void;
}

const StoryArchive: React.FC<StoryArchiveProps> = ({ onViewStory }) => {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('All');
  const [sortBy, setSortBy] = useState('recent');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchStories();
  }, [selectedOccasion, sortBy]);

  const fetchStories = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedOccasion !== 'All') params.set('occasion', selectedOccasion);
      if (sortBy) params.set('sort', sortBy);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`${API_BASE}/stories/search?${params}`);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch {
      setStories(getDemoArchive());
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStories();
  };

  const getDisplayImage = (story: StoryData) => {
    return story.coverPhoto || story.thumbnail || story.photos?.[0] || '';
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-luxury-cream via-white to-celebration-soft-pink-light/20 py-8 px-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-celebration-gold-light/50 border border-luxury-gold/20 mb-4"
        >
          <Sparkles className="w-4 h-4 text-luxury-gold" />
          <span className="text-xs font-semibold text-luxury-gold">Celebration Stories</span>
        </motion.div>
        <motion.h1
          className="text-3xl sm:text-4xl font-serif font-bold celebration-text-gradient mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          Story Archive ✨
        </motion.h1>
        <motion.p
          className="text-sm text-luxury-black-light/60 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Relive beautiful celebration moments from our community
        </motion.p>
      </div>

      {/* Search & Filters */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="luxury-glass rounded-2xl p-4 shadow-celebration">
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-luxury-gold/50" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search by name, occasion, location..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-luxury-gold/15 bg-white/50 text-sm text-luxury-black-light placeholder:text-luxury-black-light/30 focus:outline-none focus:border-luxury-gold/50 focus:shadow-gold-glow transition-all"
              />
            </div>
            <button type="submit" className="btn-celebration px-5 py-2.5 rounded-xl text-sm font-semibold">
              Search
            </button>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="px-3 py-2.5 rounded-xl border border-luxury-gold/20 hover:border-luxury-gold/40 transition-all"
            >
              <Filter className="w-4 h-4 text-luxury-gold" />
            </button>
          </form>

          {/* Filter Bar */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-luxury-gold/10">
                  <div className="flex-1">
                    <label className="text-[10px] font-bold text-luxury-black-light/40 uppercase mb-2 block">Sort By</label>
                    <div className="flex flex-wrap gap-2">
                      {SORT_OPTIONS.map(s => (
                        <button
                          key={s.value}
                          onClick={() => setSortBy(s.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            sortBy === s.value
                              ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                              : 'border-luxury-gold/15 text-luxury-black-light/50 hover:border-luxury-gold/30'
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-end gap-2">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${viewMode === 'grid' ? 'border-luxury-gold bg-luxury-gold/10' : 'border-luxury-gold/15'}`}
                    >
                      <Grid className="w-4 h-4 text-luxury-gold" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${viewMode === 'list' ? 'border-luxury-gold bg-luxury-gold/10' : 'border-luxury-gold/15'}`}
                    >
                      <List className="w-4 h-4 text-luxury-gold" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Occasion Tabs */}
          <div className="flex gap-2 overflow-x-auto mt-4 pb-1 story-scrollbar">
            {OCCASIONS.map(occ => (
              <button
                key={occ}
                onClick={() => setSelectedOccasion(occ)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all whitespace-nowrap ${
                  selectedOccasion === occ
                    ? 'border-luxury-gold bg-gradient-to-r from-luxury-gold/10 to-celebration-rose-gold/10 text-luxury-gold shadow-gold-glow'
                    : 'border-luxury-gold/10 text-luxury-black-light/50 hover:border-luxury-gold/20'
                }`}
              >
                {occ !== 'All' && <span className="mr-1">{occasionEmoji[occ]}</span>}
                {occ}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories Grid */}
      <div className="max-w-6xl mx-auto">
        {loading ? (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-5`}>
            {[...Array(6)].map((_, i) => (
              <div key={i} className="luxury-glass rounded-2xl overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-luxury-gold/10" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-luxury-gold/10 rounded w-3/4" />
                  <div className="h-3 bg-luxury-gold/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : stories.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-xl font-serif font-bold text-luxury-black-light/50 mb-2">No Stories Found</h3>
            <p className="text-sm text-luxury-black-light/40">Try a different search or occasion filter.</p>
          </div>
        ) : (
          <div className={`grid ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'} gap-5`}>
            {stories.map((story, index) => (
              <motion.div
                key={story._id}
                className={`luxury-glass rounded-2xl overflow-hidden cursor-pointer group hover:shadow-celebration transition-all duration-300 ${
                  viewMode === 'list' ? 'flex' : ''
                }`}
                onClick={() => onViewStory?.(stories, index)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4 }}
              >
                {/* Image */}
                <div className={`relative overflow-hidden ${viewMode === 'list' ? 'w-32 sm:w-48 flex-shrink-0' : 'aspect-[4/5]'}`}>
                  {getDisplayImage(story) ? (
                    <img
                      src={getDisplayImage(story)}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-celebration-royal-purple/20 via-celebration-rose-gold/20 to-luxury-gold/20 flex items-center justify-center">
                      <span className="text-4xl">{occasionEmoji[story.occasion] || '🎉'}</span>
                    </div>
                  )}

                  {/* Overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  {/* Featured Badge */}
                  {story.isFeatured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full bg-luxury-gold/90 text-white text-[10px] font-bold">
                      <Star className="w-3 h-3 fill-white" /> Featured
                    </div>
                  )}

                  {/* Occasion Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="occasion-badge">{story.occasion}</span>
                  </div>

                  {/* Stats on hover */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-white/90 text-xs">
                        <Eye className="w-3.5 h-3.5" /> {story.viewCount || 0}
                      </span>
                      <span className="flex items-center gap-1 text-white/90 text-xs">
                        <Heart className="w-3.5 h-3.5" /> {story.reactions?.length || 0}
                      </span>
                    </div>
                    <span className="flex items-center gap-1 text-white/90 text-xs">
                      <Share2 className="w-3.5 h-3.5" /> {story.shareCount || 0}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-serif font-bold text-luxury-black-light truncate">{story.title}</h3>
                      <p className="text-xs text-luxury-black-light/50 mt-0.5 flex items-center gap-1">
                        by {story.brideName && story.groomName ? `${story.brideName} & ${story.groomName}` : story.customerName}
                        {story.isVerified && <Star className="w-3 h-3 text-luxury-gold fill-luxury-gold" />}
                      </p>
                    </div>
                  </div>

                  {story.caption && viewMode === 'list' && (
                    <p className="text-xs text-luxury-black-light/40 mb-2 line-clamp-2">{story.caption}</p>
                  )}

                  <div className="flex items-center justify-between text-[10px] text-luxury-black-light/40">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(story.celebrationDate)}
                    </span>
                    {story.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {story.city}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* GENZ Branding */}
      <div className="max-w-6xl mx-auto mt-12 text-center">
        <div className="h-px bg-gradient-to-r from-transparent via-luxury-gold/20 to-transparent mb-4" />
        <div className="flex items-center justify-center gap-2 text-[10px] text-luxury-black-light/30">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-luxury-gold to-celebration-rose-gold flex items-center justify-center">
            <span className="text-[6px] font-bold text-white">GZ</span>
          </div>
          GENZ Royal Hampers • Celebrating Life's Best Moments
        </div>
      </div>
    </div>
  );
};

function getDemoArchive(): StoryData[] {
  return [
    { _id: 'a1', customerName: 'Priya Sharma', occasion: 'Birthday', title: "Priya's 25th Birthday 🎂", caption: 'Best birthday celebration ever!', photos: [], videos: [], celebrationDate: '2026-06-15', city: 'Mumbai', isFeatured: true, isVerified: true, viewCount: 542, shareCount: 23, reactions: [{emoji:'❤️'},{emoji:'🎉'},{emoji:'🥳'}] },
    { _id: 'a2', customerName: 'Rahul & Neha', occasion: 'Anniversary', title: '5th Wedding Anniversary 💍', photos: [], videos: [], celebrationDate: '2026-05-20', city: 'Delhi', viewCount: 389, shareCount: 15, reactions: [{emoji:'💕'},{emoji:'💍'}] },
    { _id: 'a3', customerName: 'Ananya Patel', occasion: 'Wedding', title: 'Our Dream Wedding 💒', photos: [], videos: [], celebrationDate: '2026-04-10', city: 'Ahmedabad', isFeatured: true, viewCount: 1024, shareCount: 67, reactions: [{emoji:'❤️'},{emoji:'🎉'},{emoji:'💒'},{emoji:'💕'}] },
    { _id: 'a4', customerName: 'Vikram Singh', occasion: 'Graduation', title: 'MBA Graduation 🎓', photos: [], videos: [], celebrationDate: '2026-06-01', city: 'Bangalore', viewCount: 256, shareCount: 8, reactions: [{emoji:'👏'}] },
    { _id: 'a5', customerName: 'Meera Joshi', occasion: 'Baby Shower', title: 'Welcome Baby Arjun 🍼', photos: [], videos: [], celebrationDate: '2026-03-25', city: 'Pune', isVerified: true, viewCount: 498, shareCount: 34, reactions: [{emoji:'💕'},{emoji:'🍼'}] },
    { _id: 'a6', customerName: 'Arun Kumar', occasion: 'Diwali', title: 'Grand Diwali Celebration 🪔', photos: [], videos: [], celebrationDate: '2025-11-12', city: 'Jaipur', viewCount: 867, shareCount: 45, reactions: [{emoji:'🪔'},{emoji:'✨'}] },
  ];
}

export default StoryArchive;
