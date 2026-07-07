import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Plus, Clock, Star, Eye, Search, Heart, Gift, MessageSquare, Sparkles } from 'lucide-react';

// Types
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
  giftMessage?: string;
  celebrationDate: string;
  publishedAt?: string;
  expiresAt?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  viewCount?: number;
  reactions: { emoji: string; label: string }[];
  socialMedia?: {
    instagram?: string;
  };
  showSocialMedia?: boolean;
}

// Occasion emoji map
const occasionEmoji: Record<string, string> = {
  Birthday: '🎂', Anniversary: '💍', Wedding: '💒', Proposal: '💍',
  Engagement: '💍', 'Baby Shower': '🍼', Housewarming: '🏠',
  Graduation: '🎓', Retirement: '🎉', "Mother's Day": '🌸',
  "Father's Day": '👔', "Valentine's Day": '💝', Christmas: '🎄',
  Diwali: '🪔', 'New Year': '🎆', Congratulations: '🎊',
  'Corporate Celebration': '🏢', Festival: '🎊', 'Custom Occasion': '🌟'
};

const getGreeting = (story: StoryData) => {
  const name = story.brideName && story.groomName
    ? `${story.brideName.split(' ')[0]} & ${story.groomName.split(' ')[0]}`
    : story.customerName.split(' ')[0];
  const occ = story.occasion;
  if (occ === 'Birthday') return `Happy B'day ${name}`;
  if (occ === 'Anniversary') return `Happy Anniv ${name}`;
  if (occ === 'Wedding') return `Happy Wedding ${name}`;
  if (occ === "Valentine's Day") return `Happy Valentine's ${name}`;
  if (occ === 'New Year') return `Happy New Year ${name}`;
  if (occ === 'Diwali') return `Happy Diwali ${name}`;
  if (occ === 'Christmas') return `Merry Christmas ${name}`;
  if (occ === 'Custom Occasion') return `Congrats ${name}`;
  
  return `Happy ${occ} ${name}`;
};

interface StoryBarProps {
  onViewStory: (stories: StoryData[], index: number) => void;
  onCreateStory: () => void;
}

const getApiBase = () => {
  const url = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  if (url.endsWith('/api')) return url;
  if (url.endsWith('/api/')) return url.slice(0, -1);
  return `${url}/api`;
};
const API_BASE = getApiBase();

const StoryBar: React.FC<StoryBarProps> = ({ onViewStory, onCreateStory }) => {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const res = await fetch(`${API_BASE}/stories/active`);
      const data = await res.json();
      setStories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to fetch stories:', err);
      // Use demo data for preview
      setStories(getDemoStories());
    } finally {
      setLoading(false);
    }
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [stories]);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 300;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    });
    setTimeout(checkScroll, 400);
  };

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return '';
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'Expired';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return `${Math.floor(diff / (1000 * 60))}m`;
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  const getDisplayImage = (story: StoryData) => {
    return story.thumbnail || story.coverPhoto || story.photos?.[0] || '';
  };

  const filteredStories = stories.filter(story => 
    story.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (story.brideName && story.brideName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (story.groomName && story.groomName.toLowerCase().includes(searchQuery.toLowerCase())) ||
    story.occasion.toLowerCase().includes(searchQuery.toLowerCase()) ||
    story.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="w-full px-4 py-10 bg-gradient-to-br from-[#fff0f2] via-[#ffeef1] to-[#fce4ec] text-[#3d3d3d] border-b border-rose-100 shadow-inner">
        <div className="flex gap-4 overflow-hidden max-w-7xl mx-auto">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2 animate-pulse">
              <div className="w-[86px] h-[86px] sm:w-[94px] sm:h-[94px] rounded-full bg-rose-200/60" />
              <div className="w-16 h-3 bg-rose-200/60 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="w-full py-10 px-4 sm:px-8 bg-gradient-to-br from-[#fff0f2] via-[#ffeef1] to-[#fce4ec] text-[#3d3d3d] border-b border-rose-100 flex flex-col items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-3">
          <motion.button
            onClick={onCreateStory}
            className="relative w-20 h-20 rounded-full bg-gradient-to-tr from-[#b32454] via-rose-400 to-[#e6b830] p-[2.5px] flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all text-white"
          >
            <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-rose-100">
              <Plus className="w-8 h-8 text-[#b32454]" />
            </div>
          </motion.button>
          <h3 className="font-serif text-lg font-bold text-[#8b0000] mt-2">No stories yet!</h3>
          <p className="text-xs text-gray-500 text-center max-w-xs">
            Be the first to share your celebration story and spread happiness with the world! ✨
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="relative w-full py-5 px-4 sm:px-8 bg-gradient-to-br from-[#fff0f2] via-[#ffeef1] to-[#fce4ec] text-[#3d3d3d] overflow-hidden border-b border-rose-100">
      
      {/* Background Ornaments: Balloons & Sparkles */}
      <div className="absolute inset-y-0 left-0 pointer-events-none flex items-center pl-6 opacity-35 select-none hidden lg:flex">
        {/* Left balloons */}
        <div className="relative w-40 h-60">
          <div className="absolute top-0 left-0 text-rose-400 rotate-[-12deg] filter drop-shadow-[0_4px_6px_rgba(219,112,147,0.2)]">
            <svg viewBox="0 0 100 150" className="w-24 h-36">
              <ellipse cx="50" cy="50" rx="30" ry="38" fill="currentColor" />
              <path d="M50 88 L47 95 L53 95 Z" fill="currentColor" />
              <path d="M50 95 Q45 120 50 140" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div className="absolute top-10 left-12 text-[#ffb3c1] rotate-[8deg] filter drop-shadow-[0_4px_6px_rgba(219,112,147,0.15)]">
            <svg viewBox="0 0 100 150" className="w-20 h-30">
              <ellipse cx="50" cy="50" rx="30" ry="38" fill="currentColor" />
              <path d="M50 88 L47 95 L53 95 Z" fill="currentColor" />
              <path d="M50 95 Q45 120 50 140" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>
      </div>
      
      <div className="absolute inset-y-0 right-0 pointer-events-none flex items-center pr-6 opacity-35 select-none hidden lg:flex">
        {/* Right gift boxes & sparkles */}
        <div className="flex flex-col gap-4 items-center">
          <svg viewBox="0 0 100 100" className="w-20 h-20 text-rose-400 filter drop-shadow-[0_4px_8px_rgba(219,112,147,0.2)]">
            <rect x="20" y="30" width="60" height="60" fill="currentColor" rx="4" />
            <rect x="44" y="30" width="12" height="60" fill="#fff" />
            <rect x="20" y="54" width="60" height="12" fill="#fff" />
            <rect x="16" y="20" width="68" height="14" fill="currentColor" rx="2" />
          </svg>
        </div>
      </div>

      {/* Top Header: Brand Crown Logo & Share Button */}
      <div className="relative w-full flex flex-col items-center z-10">
        
        {/* Crown & Brand Name */}
        <div className="flex flex-col items-center gap-1.5 mb-2">
          {/* Gold Crown */}
          <svg viewBox="0 0 24 24" className="w-8 h-8 text-[#d4af37] fill-current drop-shadow-sm">
            <path d="M2.25 18.75a.75.75 0 0 0 0 1.5h19.5a.75.75 0 0 0 0-1.5H2.25ZM21.75 16.5c.24 0 .463-.122.593-.324.13-.203.149-.457.052-.676l-3.374-7.587 1.579-2.527a.75.75 0 0 0-.963-1.07l-3.568 2.378L12.593 2.11a.75.75 0 0 0-1.186 0L7.93 6.695l-3.569-2.378a.75.75 0 0 0-.962 1.07l1.578 2.527-3.373 7.587a.75.75 0 0 0 .052.676c.13.202.353.324.593.324h19.5Z" />
          </svg>
          <span className="font-serif font-black text-xl tracking-[0.18em] text-[#8b0000] leading-none">
            GENZ
          </span>
          <span className="text-[9px] tracking-[0.25em] font-bold text-[#d4af37] uppercase">
            Royal Hampers
          </span>
        </div>

        {/* Share Button (Top Right Absolute) */}
        <div className="absolute top-2 right-2 hidden sm:block">
          <button
            onClick={onCreateStory}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#b32454] to-[#8b0000] text-white text-xs font-bold shadow-md hover:scale-105 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Share Your Story
          </button>
        </div>

        {/* Main Title & Subtitle */}
        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#8b0000] text-center mt-2">
          Celebration Stories
        </h1>
        
        {/* Gift Divider */}
        <div className="flex items-center gap-3 w-40 my-2">
          <div className="h-[1px] bg-rose-300 flex-1" />
          <span className="text-xs">🎁</span>
          <div className="h-[1px] bg-rose-300 flex-1" />
        </div>

        {/* Subtitle */}
        <p className="text-center text-xs sm:text-sm text-gray-600 font-medium max-w-md mb-6 leading-relaxed">
          Every celebration is special, every story is beautiful.<br />
          Share your happiness with the world. <span className="text-rose-500">💖</span>
        </p>

        {/* Centered Search Bar */}
        <div className="relative w-full max-w-xl mb-6 px-4">
          <div className="relative flex items-center bg-white rounded-full shadow-[0_4px_20px_rgba(219,112,147,0.15)] border border-rose-200 overflow-hidden pr-1.5 py-1.5 pl-4">
            <Search className="w-4 h-4 text-rose-400 flex-shrink-0" />
            <input
              type="text"
              placeholder="Search by name, occasion or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3 pr-2 py-1.5 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
            />
            <button className="px-6 py-2 rounded-full bg-gradient-to-r from-[#b32454] to-[#8b0000] text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all flex-shrink-0">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Stories list container with navigation arrows */}
      <div className="relative w-full px-12 mb-6">
        
        {/* Scroll Arrows */}
        <AnimatePresence>
          {canScrollLeft && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('left')}
              className="absolute left-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-rose-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-[#b32454]"
            >
              <ChevronLeft className="w-5 h-5" />
            </motion.button>
          )}
          {canScrollRight && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => scroll('right')}
              className="absolute right-1 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white shadow-md border border-rose-100 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-[#b32454]"
            >
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          )}
        </AnimatePresence>

        {/* Stories Scroll Container */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-6 overflow-x-auto pb-4 story-scrollbar scroll-smooth"
          style={{ scrollbarWidth: 'thin' }}
        >
          {/* Create Story Button */}
          <motion.button
            onClick={onCreateStory}
            className="flex-shrink-0 flex flex-col items-center gap-2 group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="relative w-[86px] h-[86px] sm:w-[94px] sm:h-[94px] rounded-full bg-gradient-to-tr from-[#b32454] via-rose-400 to-[#e6b830] p-[2.5px] flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(219,112,147,0.4)] transition-all duration-300">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center border border-rose-100 relative">
                {/* Crown over Your Story */}
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 text-[#d4af37] absolute -top-1.5 left-1/2 -translate-x-1/2 drop-shadow-sm">
                  <path fill="currentColor" d="M2 16h20v2H2zm19.5-2.2L18.4 5.3l-2.9 4.3-3.5-6.2-3.5 6.2-2.9-4.3L2.5 13.8V15h19z" />
                </svg>
                <Plus className="w-7 h-7 text-[#b32454] group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="text-[11px] font-bold text-gray-700 mt-1">
              Your Story
            </span>
          </motion.button>

          {/* Story Cards */}
          {filteredStories.map((story, index) => (
            <motion.button
              key={story._id}
              onClick={() => onViewStory(stories, index)}
              className="flex-shrink-0 flex flex-col items-center gap-2 group relative"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              {/* Story Ring */}
              <div className="relative">
                {/* LIVE indicator badge if featured */}
                {story.isFeatured && (
                  <span className="absolute -top-1 -right-1 z-10 bg-red-500 text-white text-[8px] font-extrabold px-1.5 py-0.5 rounded-full uppercase tracking-wider shadow-sm animate-pulse">
                    LIVE
                  </span>
                )}
                
                <div className={`story-ring bg-gradient-to-tr from-[#b32454] via-rose-400 to-[#e6b830] rounded-full p-[3px] shadow-[0_4px_10px_rgba(219,112,147,0.15)]`}>
                  <div className="story-ring-inner border-2 border-white rounded-full">
                    <div className="relative w-[80px] h-[80px] sm:w-[88px] sm:h-[88px] rounded-full overflow-hidden bg-rose-50">
                      {getDisplayImage(story) ? (
                        <img
                          src={getDisplayImage(story)}
                          alt={story.customerName}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl">
                          {occasionEmoji[story.occasion] || '🎉'}
                        </div>
                      )}

                      {/* Occasion Badge Overlay */}
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <span className="occasion-badge shadow-md bg-gradient-to-r from-[#b32454] to-[#8b0000] text-white border-0 text-[10px] px-2 py-0.5 rounded-full">
                          {story.occasion}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Name & Timer */}
              <div className="flex flex-col items-center max-w-[95px] text-center mt-1">
                <span className="text-[10px] text-gray-500 tracking-wide">
                  {story.occasion === 'Birthday' ? 'Happy Birthday' : story.occasion}
                </span>
                <span className="text-[11px] font-extrabold text-[#8b0000] leading-tight line-clamp-1 px-1">
                  {story.brideName && story.groomName
                    ? `${story.brideName.split(' ')[0]} & ${story.groomName.split(' ')[0]}`.toUpperCase()
                    : story.customerName.split(' ')[0].toUpperCase()}
                </span>
                <div className="flex items-center gap-1 mt-0.5">
                  {story.isVerified && (
                    <Star className="w-2.5 h-2.5 text-[#d4af37] fill-[#d4af37]" />
                  )}
                  {story.expiresAt && (
                    <span className="text-[9px] text-gray-500 flex items-center gap-0.5 font-medium">
                      <Clock className="w-2.5 h-2.5" />
                      {getTimeRemaining(story.expiresAt)}
                    </span>
                  )}
                </div>
              </div>
            </motion.button>
          ))}
          {filteredStories.length === 0 && (
            <div className="flex items-center justify-center w-full py-8 text-center text-gray-500 italic">
              No stories found matching "{searchQuery}"
            </div>
          )}
        </div>
      </div>

      {/* Floating Bottom Card Banner (Instagram & Value Props) */}
      <div className="relative w-full mt-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 bg-white/70 backdrop-blur-md p-6 border-y border-rose-100 shadow-[0_8px_32px_rgba(219,112,147,0.08)] px-4 sm:px-8 lg:px-12">
          
          {/* Left: Instagram Brand Connection styled exactly like the demo */}
          <a
            href="https://instagram.com/genz.hampers"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-5 hover:opacity-95 active:scale-98 transition-all text-left w-full lg:w-auto relative group"
          >
            {/* Double Gold Ring Circular Instagram Icon */}
            <div className="relative flex-shrink-0">
              {/* Floating Hearts around the icon */}
              <span className="absolute -top-2 -left-2 text-rose-400 text-sm animate-bounce select-none">💖</span>
              <span className="absolute -bottom-2 -right-1 text-rose-500 text-xs animate-pulse select-none">❤️</span>
              
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-[#d4af37] via-[#f7e7a7] to-[#b8860b] p-[2.5px] shadow-[0_4px_12px_rgba(219,112,147,0.15)] flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-white p-[1px] flex items-center justify-center">
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 p-[3.5px] flex items-center justify-center text-white">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 fill-current" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1">
              {/* Instagram Outline Pill */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-400 bg-rose-50/50 text-[#b32454] w-fit">
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
                <span className="text-[11px] font-bold tracking-wider uppercase">Instagram</span>
              </div>

              {/* Account ID with Checkmark */}
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl sm:text-2xl text-gray-800 tracking-tight group-hover:text-[#b32454] transition-colors">
                  @genz.hampers
                </span>
                {/* Verified Checkmark (blue badge exactly like demo) */}
                <div className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-500 text-white shadow-sm shrink-0">
                  <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-none stroke-current stroke-[3]" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
              </div>

              {/* Occasion / Celebration Symbols Line */}
              <div className="flex flex-wrap items-center gap-1.5 text-[11px] sm:text-xs text-gray-600 font-semibold tracking-wide mt-0.5">
                <span>🎉 Celebrate.</span>
                <span className="text-gray-300">|</span>
                <span>💖 Share.</span>
                <span className="text-gray-300">|</span>
                <span>🎁 Create Beautiful Memories.</span>
              </div>
            </div>
          </a>

          {/* Middle: Brand Values Proposition flex row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full lg:w-auto border-t lg:border-t-0 border-rose-100 pt-4 lg:pt-0">
            <ValuePropItem icon={<Heart className="w-5 h-5 text-rose-500" />} title="Spread Happiness" desc="Send wishes to loved ones" />
            <ValuePropItem icon={<Gift className="w-5 h-5 text-[#d4af37]" />} title="Send Gifts" desc="Make day extra special" />
            <ValuePropItem icon={<MessageSquare className="w-5 h-5 text-blue-400" />} title="Leave Messages" desc="Share love & blessings" />
            <ValuePropItem icon={<Sparkles className="w-5 h-5 text-purple-400" />} title="Create Memories" desc="Stories that last forever" />
          </div>

          {/* Right: YouTube Direct connection */}
          <a
            href="https://youtube.com/@genz.hampers"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 w-14 h-10 bg-red-600 hover:bg-red-700 hover:scale-105 active:scale-95 transition-all rounded-xl flex items-center justify-center text-white shadow-md border border-white/10"
            title="Watch on YouTube"
          >
            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

// Reusable Value Proposition Item
const ValuePropItem: React.FC<{ icon: React.ReactNode; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="flex items-start gap-2.5 text-left">
    <div className="mt-0.5 bg-rose-50 p-2 rounded-xl flex-shrink-0">
      {icon}
    </div>
    <div className="flex flex-col">
      <span className="text-sm font-bold text-[#8b0000]">{title}</span>
      <span className="text-xs text-gray-500 font-semibold leading-tight">{desc}</span>
    </div>
  </div>
);

// Demo stories for preview when API is not available
function getDemoStories(): StoryData[] {
  return [
    { _id: 'd1', customerName: 'Priya Sharma', occasion: 'Birthday', title: "Priya's 25th Birthday 🎂", caption: 'Best birthday ever!', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 20 * 3600000).toISOString(), isFeatured: true, isVerified: true, viewCount: 142, reactions: [{ emoji: '❤️', label: 'Love' }], personalMessage: 'Thank you for making my day special!' },
    { _id: 'd2', customerName: 'Rahul & Neha', occasion: 'Anniversary', title: '5th Wedding Anniversary 💍', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 45 * 3600000).toISOString(), viewCount: 89, reactions: [{ emoji: '💕', label: 'Love' }] },
    { _id: 'd3', customerName: 'Ananya Patel', occasion: 'Wedding', title: 'Our Dream Wedding 💒', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 150 * 3600000).toISOString(), isFeatured: true, viewCount: 324, reactions: [] },
    { _id: 'd4', customerName: 'Vikram Singh', occasion: 'Graduation', title: 'MBA Graduation 🎓', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 10 * 3600000).toISOString(), viewCount: 56, reactions: [] },
    { _id: 'd5', customerName: 'Meera Joshi', occasion: 'Baby Shower', title: 'Welcome Baby 🍼', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 30 * 3600000).toISOString(), isVerified: true, viewCount: 198, reactions: [] },
    { _id: 'd6', customerName: 'Arun Kumar', occasion: 'Diwali', title: 'Diwali Celebration 🪔', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 60 * 3600000).toISOString(), viewCount: 267, reactions: [] },
    { _id: 'd7', customerName: 'Sara Khan', occasion: "Valentine's Day", title: 'Valentine Special 💝', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 8 * 3600000).toISOString(), viewCount: 78, reactions: [] },
    { _id: 'd8', customerName: 'Ravi Desai', occasion: 'Housewarming', title: 'New Home 🏠', photos: [], videos: [], celebrationDate: new Date().toISOString(), expiresAt: new Date(Date.now() + 40 * 3600000).toISOString(), viewCount: 34, reactions: [] },
  ];
}

export default StoryBar;
