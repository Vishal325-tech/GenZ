import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, ChevronLeft, ChevronRight, Heart, Share2, MessageCircle,
  Star, Clock, Eye, Send, Volume2, VolumeX, Pause, Play, ExternalLink
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { getAssetUrl } from '../data/initialData';

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
  aiWishes?: string;
  celebrationDate: string;
  publishedAt?: string;
  expiresAt?: string;
  isFeatured?: boolean;
  isVerified?: boolean;
  viewCount?: number;
  shareCount?: number;
  reactions: { emoji: string; label: string }[];
  comments?: { _id: string; userName: string; text: string; createdAt: string }[];
  socialMedia?: { instagram?: string; facebook?: string; youtube?: string; website?: string };
  showSocialMedia?: boolean;
  hideComments?: boolean;
  allowSharing?: boolean;
  hashtags?: string[];
  backgroundMusic?: string;
}

const MUSIC_URLS: Record<string, string> = {
  happy_birthday: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  anniversary: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  romantic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  celebration: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  acoustic: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  corporate: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3',
  lullaby: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-7.mp3',
  party: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3',
  wedding: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-9.mp3',
};

interface StoryViewerProps {
  stories: StoryData[];
  initialIndex: number;
  onClose: () => void;
}

const REACTIONS = [
  { emoji: '❤️', label: 'Love' },
  { emoji: '🎉', label: 'Celebrate' },
  { emoji: '👏', label: 'Congrats' },
  { emoji: '🥳', label: 'Party' },
  { emoji: '🎂', label: 'Birthday' },
  { emoji: '💍', label: 'Anniversary' },
  { emoji: '🌹', label: 'Best Wishes' },
];

const SHARE_PLATFORMS = [
  { name: 'WhatsApp', icon: '💬', getUrl: (url: string, title: string) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}` },
  { name: 'Facebook', icon: '📘', getUrl: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
  { name: 'Twitter', icon: '🐦', getUrl: (url: string, title: string) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}` },
  { name: 'Telegram', icon: '✈️', getUrl: (url: string, title: string) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}` },
];

const STORY_DURATION = 8000; // 8 seconds per slide

const occasionEmoji: Record<string, string> = {
  Birthday: '🎂', Anniversary: '💍', Wedding: '💒', Proposal: '💍',
  Engagement: '💍', 'Baby Shower': '🍼', Housewarming: '🏠',
  Graduation: '🎓', Retirement: '🎉', "Mother's Day": '🌸',
  "Father's Day": '👔', "Valentine's Day": '💝', Christmas: '🎄',
  Diwali: '🪔', 'New Year': '🎆', Congratulations: '🎊',
  'Corporate Celebration': '🏢', Festival: '🎊', 'Custom Occasion': '🌟'
};

const StoryViewer: React.FC<StoryViewerProps> = ({ stories, initialIndex, onClose }) => {
  const [localStories, setLocalStories] = useState<StoryData[]>(stories);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showReactions, setShowReactions] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [floatingHearts, setFloatingHearts] = useState<{ id: number; x: number; y: number; emoji: string }[]>([]);
  const [commentText, setCommentText] = useState('');
  const [isMuted, setIsMuted] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);
  const heartId = useRef(0);
  const touchStartX = useRef(0);
  const holdTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHoldingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const story = localStories[currentIndex];
  
  // Build slides array: cover + photos + videos
  const getSlides = useCallback(() => {
    const slides: { type: 'image' | 'video'; url: string }[] = [];
    if (story.coverPhoto) slides.push({ type: 'image', url: getAssetUrl(story.coverPhoto) });
    story.photos?.forEach(p => slides.push({ type: 'image', url: getAssetUrl(p) }));
    story.videos?.forEach(v => slides.push({ type: 'video', url: getAssetUrl(v) }));
    // If no media, create a text-only slide
    if (slides.length === 0) slides.push({ type: 'image', url: '' });
    return slides;
  }, [story]);

  const slides = getSlides();
  const totalSlides = slides.length;

  // Progress & auto-advance
  useEffect(() => {
    if (isPaused) return;

    startTimeRef.current = Date.now() - pausedTimeRef.current;
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const pct = Math.min((elapsed / STORY_DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) {
        goNext();
      }
    }, 30);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentSlide, isPaused]);

  useEffect(() => {
    if (!videoRef.current) return;
    videoRef.current.load(); // Force reload the video resource when src/slide changes in React
    if (isPaused) {
      videoRef.current.pause();
    } else {
      videoRef.current.play().catch((err) => console.log("Autoplay blocked:", err));
    }
  }, [isPaused, currentSlide, currentIndex]);

  useEffect(() => {
    if (story.backgroundMusic) {
      const url = MUSIC_URLS[story.backgroundMusic] || story.backgroundMusic;
      if (!audioRef.current) {
        audioRef.current = new Audio(url);
        audioRef.current.loop = true;
      } else if (audioRef.current.src !== url) {
        audioRef.current.pause();
        audioRef.current.src = url;
      }

      // Control play/pause & mute status
      audioRef.current.muted = isMuted;
      if (!isPaused && !isMuted) {
        audioRef.current.play().catch(e => console.log('Audio autoplay blocked:', e));
      } else {
        audioRef.current.pause();
      }
    } else {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [story.backgroundMusic, isPaused, isMuted, currentIndex]);

  const resetProgress = () => {
    setProgress(0);
    pausedTimeRef.current = 0;
  };

  const goNext = () => {
    if (currentSlide < totalSlides - 1) {
      setCurrentSlide(prev => prev + 1);
      resetProgress();
    } else {
      // User request: Don't automatically advance to the next person's story
      onClose();
    }
  };

  const goPrev = () => {
    if (currentSlide > 0) {
      setCurrentSlide(prev => prev - 1);
      resetProgress();
    }
  };

  const goNextStory = () => {
    if (currentIndex < localStories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setCurrentSlide(0);
      resetProgress();
    } else {
      onClose();
    }
  };

  const goPrevStory = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setCurrentSlide(0);
      resetProgress();
    }
  };

  // Pause/resume
  const handlePause = () => {
    setIsPaused(true);
    pausedTimeRef.current = Date.now() - startTimeRef.current;
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const handleResume = () => {
    setIsPaused(false);
  };

  // Hold-to-pause helper logic
  const handleHoldStart = () => {
    isHoldingRef.current = false;
    holdTimerRef.current = setTimeout(() => {
      isHoldingRef.current = true;
      handlePause();
    }, 250);
  };

  const handleHoldEnd = () => {
    if (holdTimerRef.current) clearTimeout(holdTimerRef.current);
    if (isHoldingRef.current) {
      isHoldingRef.current = false;
      handleResume();
    }
  };

  // Touch & click handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    handleHoldStart();
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const isHoldActive = isHoldingRef.current;
    handleHoldEnd();

    // Only process swipe navigation if we weren't holding
    if (!isHoldActive) {
      const diff = e.changedTouches[0].clientX - touchStartX.current;
      if (Math.abs(diff) > 50) {
        diff > 0 ? goPrev() : goNext();
      }
    }
  };

  const handleMouseDown = () => {
    handleHoldStart();
  };

  const handleMouseUp = () => {
    handleHoldEnd();
  };

  const handleClick = (e: React.MouseEvent) => {
    // If click happens on close button, volume button, comment input, or reaction drawer, do nothing
    if ((e.target as HTMLElement).closest('.interactive-overlay, button, input')) return;

    const rect = (e.target as HTMLElement).closest('.story-viewport')?.getBoundingClientRect();
    if (!rect) return;
    const x = e.clientX - rect.left;
    if (x < rect.width / 3) {
      goPrev();
    } else if (x > (rect.width * 2) / 3) {
      goNext();
    } else {
      // Middle click/tap: toggle pause/play permanently
      if (isPaused) {
        handleResume();
      } else {
        handlePause();
      }
    }
  };

  // Keyboard
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goNextStory();
      if (e.key === 'ArrowLeft') goPrevStory();
      if (e.key === ' ') { e.preventDefault(); isPaused ? handleResume() : handlePause(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [currentIndex, currentSlide, isPaused, localStories]);

  // Floating heart
  const spawnHeart = (emoji: string, clientX?: number, clientY?: number) => {
    const id = heartId.current++;
    const x = clientX ?? Math.random() * 200 + 100;
    const y = clientY ?? Math.random() * 200 + 400;
    setFloatingHearts(prev => [...prev, { id, x, y, emoji }]);
    setTimeout(() => {
      setFloatingHearts(prev => prev.filter(h => h.id !== id));
    }, 2000);
  };

  const handleReaction = async (emoji: string) => {
    spawnHeart(emoji);
    setShowReactions(false);

    // Optimistic Update
    setLocalStories(prev => {
      const next = [...prev];
      const current = next[currentIndex];
      if (current) {
        const reactions = current.reactions ? [...current.reactions] : [];
        reactions.push({ emoji, label: '' });
        next[currentIndex] = { ...current, reactions };
      }
      return next;
    });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stories/${story._id}/react`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emoji, label: '', userId: 'visitor' })
      });
      const data = await res.json();
      if (res.ok && data.reactions) {
        setLocalStories(prev => {
          const next = [...prev];
          if (next[currentIndex]) {
            next[currentIndex] = { ...next[currentIndex], reactions: data.reactions };
          }
          return next;
        });
      }
    } catch (err) {
      console.error('Failed to submit reaction:', err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.origin + '/stories?view=' + story._id);
    setShowShare(false);
  };

  const formatDate = (d: string) => {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const currentSlideData = slides[currentSlide];

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
        >
          <X className="w-5 h-5 text-white" />
        </button>

        {/* Prev Story Arrow (Desktop) */}
        {currentIndex > 0 && (
          <button
            onClick={goPrevStory}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-all hidden md:flex"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Next Story Arrow (Desktop) */}
        {currentIndex < localStories.length - 1 && (
          <button
            onClick={goNextStory}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-50 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 items-center justify-center transition-all hidden md:flex"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        )}

        {/* Main Story Container */}
        <motion.div
          key={story._id + currentSlide}
          className="story-viewport relative w-full max-w-[420px] h-[90vh] max-h-[780px] rounded-2xl overflow-hidden shadow-2xl mx-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
        >
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-b from-celebration-deep-black via-gray-900 to-celebration-deep-black">
            {currentSlideData.type === 'image' && currentSlideData.url ? (
              <img
                src={currentSlideData.url}
                alt={story.title}
                className="w-full h-full object-cover pointer-events-none"
                loading="lazy"
              />
            ) : currentSlideData.type === 'video' && currentSlideData.url ? (
              <video
                ref={videoRef}
                src={currentSlideData.url}
                className="w-full h-full object-cover pointer-events-none"
                autoPlay
                loop
                muted={isMuted}
                playsInline
              />
            ) : (
              /* Text-only story with gradient background */
              <div className="w-full h-full bg-gradient-to-br from-celebration-royal-purple via-celebration-rose-gold to-luxury-gold flex items-center justify-center p-8">
                <div className="text-center">
                  <div className="text-6xl mb-4">{occasionEmoji[story.occasion] || '🎉'}</div>
                  <h2 className="text-2xl font-serif font-bold text-white mb-3">{story.title}</h2>
                  {story.personalMessage && (
                    <p className="text-white/90 text-base leading-relaxed font-light italic">
                      "{story.personalMessage}"
                    </p>
                  )}
                  {story.aiWishes && !story.personalMessage && (
                    <p className="text-white/85 text-sm leading-relaxed mt-4">
                      {story.aiWishes}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Instagram and Brand Watermark Overlay */}
          <div className="absolute right-4 bottom-24 pointer-events-none flex flex-col items-end gap-3 z-20">
            {/* Instagram Tag */}
            <a
              href="https://instagram.com/genz.hampers"
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="pointer-events-auto cursor-pointer flex flex-col items-end gap-1 group/insta"
            >
              <div className="flex items-center gap-2 bg-black/30 backdrop-blur-[2px] px-3 py-1.5 rounded-full border border-white/10 shadow-lg group-hover/insta:bg-black/50 transition-all">
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600 text-white shadow-md">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                  </svg>
                </span>
                <span className="font-serif italic font-extrabold text-xs text-white tracking-wide drop-shadow-md">
                  @genz.hampers
                </span>
              </div>
              <span className="text-[9px] text-white/95 font-semibold tracking-wider uppercase bg-black/40 backdrop-blur-[2px] px-2 py-0.5 rounded shadow-md mt-0.5 group-hover/insta:bg-black/60 transition-all mr-1">
                watch story on insta
              </span>
            </a>

            {/* YouTube Icon & Brand Watermark */}
            <div className="flex items-center gap-2 pr-1">
              {/* YouTube Icon */}
              <a
                href="https://youtube.com/@genz.hampers"
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="pointer-events-auto cursor-pointer w-10 h-7 bg-red-600 rounded-lg flex items-center justify-center shadow-lg border border-white/10 hover:bg-red-700 transition-all"
              >
                <svg className="w-5 h-5 text-white fill-current" viewBox="0 0 24 24">
                  <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.518 3.545 12 3.545 12 3.545s-7.518 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.87.508 9.388.508 9.388.508s7.518 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
              
              {/* Monogram Brand Watermark */}
              <div className="flex flex-col items-center justify-center shrink-0 w-11 h-11 bg-gradient-to-br from-luxury-gold to-luxury-gold-dark rounded-full p-[2px] shadow-[0_0_12px_rgba(212,175,55,0.4)] opacity-85">
                <div className="w-full h-full bg-luxury-black-dark rounded-full flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-luxury-red/20 to-transparent" />
                  {/* Crown SVG */}
                  <svg viewBox="0 0 24 24" fill="currentColor" className="text-luxury-gold w-3.5 h-3.5 absolute top-1 drop-shadow-sm">
                    <path d="M2.25 18.75a.75.75 0 0 0 0 1.5h19.5a.75.75 0 0 0 0-1.5H2.25ZM21.75 16.5c.24 0 .463-.122.593-.324.13-.203.149-.457.052-.676l-3.374-7.587 1.579-2.527a.75.75 0 0 0-.963-1.07l-3.568 2.378L12.593 2.11a.75.75 0 0 0-1.186 0L7.93 6.695l-3.569-2.378a.75.75 0 0 0-.962 1.07l1.578 2.527-3.373 7.587a.75.75 0 0 0 .052.676c.13.202.353.324.593.324h19.5Z" />
                  </svg>
                  {/* GZ Monogram */}
                  <span className="font-serif font-black text-transparent bg-clip-text bg-gradient-to-b from-luxury-gold-light via-luxury-gold to-luxury-gold-dark text-[10px] leading-none tracking-tighter mt-3">
                    GZ
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Dark Overlay */}
          <div className="story-overlay absolute inset-0 pointer-events-none" />

          {/* Progress Bars */}
          <div className="absolute top-3 left-3 right-3 flex gap-1 z-30">
            {slides.map((_, i) => (
              <div key={i} className="flex-1 h-[3px] rounded-full bg-white/30 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all"
                  style={{
                    width: i < currentSlide ? '100%' : i === currentSlide ? `${progress}%` : '0%',
                    transition: i === currentSlide ? 'none' : 'width 0.3s'
                  }}
                />
              </div>
            ))}
          </div>

          {/* Top Header */}
          <div className="absolute top-8 left-3 right-3 flex items-center justify-between z-30">
            <div className="flex items-center gap-2.5">
              {/* Profile */}
              <div className="story-ring" style={{ padding: '2px' }}>
                <div className="story-ring-inner" style={{ padding: '1px', background: 'transparent' }}>
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-celebration-soft-pink to-celebration-rose-gold flex items-center justify-center overflow-hidden">
                    {story.thumbnail || story.coverPhoto ? (
                      <img src={getAssetUrl(story.thumbnail || story.coverPhoto)} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm">{occasionEmoji[story.occasion] || '🎉'}</span>
                    )}
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-white text-sm font-semibold">
                    {story.brideName && story.groomName ? `${story.brideName} & ${story.groomName}` : story.customerName}
                  </span>
                  {story.isVerified && (
                    <Star className="w-3.5 h-3.5 text-luxury-gold fill-luxury-gold" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-white/60 text-[10px]">
                  <span className="occasion-badge">{story.occasion}</span>
                  <span>{formatDate(story.celebrationDate)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {currentSlideData.type === 'video' && (
                <button
                  onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                  className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center"
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-white" /> : <Volume2 className="w-3.5 h-3.5 text-white" />}
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); isPaused ? handleResume() : handlePause(); }}
                className="w-7 h-7 rounded-full bg-black/30 flex items-center justify-center"
              >
                {isPaused ? <Play className="w-3.5 h-3.5 text-white" /> : <Pause className="w-3.5 h-3.5 text-white" />}
              </button>
            </div>
          </div>

          {/* Bottom Content */}
          <div className="absolute bottom-0 left-0 right-0 p-4 z-30">
            {/* Title & Caption */}
            {currentSlideData.url && (
              <div className="mb-3">
                <h3 className="text-white font-serif text-lg font-bold mb-1">{story.title}</h3>
                {story.caption && <p className="text-white/80 text-sm">{story.caption}</p>}
                {story.personalMessage && currentSlideData.url && (
                  <p className="text-white/70 text-xs italic mt-1.5">"{story.personalMessage}"</p>
                )}
              </div>
            )}

            {/* Hashtags */}
            {story.hashtags && story.hashtags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {story.hashtags.slice(0, 5).map((tag, i) => (
                  <span key={i} className="text-[10px] text-luxury-gold/90 bg-luxury-gold/10 rounded-full px-2 py-0.5">
                    {tag.startsWith('#') ? tag : `#${tag}`}
                  </span>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {/* Reactions */}
                <button
                  onClick={(e) => { e.stopPropagation(); setShowReactions(!showReactions); setShowShare(false); }}
                  className="flex items-center gap-1 text-white/90 hover:text-red-400 transition-colors"
                >
                  <Heart className="w-5 h-5" />
                  <span className="text-xs">{story.reactions?.length || 0}</span>
                </button>

                {/* Comments */}
                {!story.hideComments && (
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePause(); setShowComments(!showComments); }}
                    className="flex items-center gap-1 text-white/90 hover:text-blue-400 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-xs">{story.comments?.length || 0}</span>
                  </button>
                )}

                {/* Share */}
                {story.allowSharing !== false && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setShowShare(!showShare); setShowReactions(false); }}
                    className="flex items-center gap-1 text-white/90 hover:text-green-400 transition-colors"
                  >
                    <Share2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Reactions Popup */}
            <AnimatePresence>
              {showReactions && (
                <motion.div
                  className="flex gap-2 mt-3 p-2 rounded-xl story-glass"
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {REACTIONS.map(r => (
                    <motion.button
                      key={r.emoji}
                      onClick={() => handleReaction(r.emoji)}
                      className="text-2xl hover:scale-125 transition-transform"
                      whileHover={{ scale: 1.3 }}
                      whileTap={{ scale: 0.9 }}
                      title={r.label}
                    >
                      {r.emoji}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Share Popup */}
            <AnimatePresence>
              {showShare && (
                <motion.div
                  className="flex gap-3 mt-3 p-3 rounded-xl story-glass items-center"
                  initial={{ opacity: 0, y: 20, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.8 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {SHARE_PLATFORMS.map(p => (
                    <a
                      key={p.name}
                      href={p.getUrl(window.location.href, story.title)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                      title={p.name}
                    >
                      <span className="text-xl">{p.icon}</span>
                      <span className="text-[9px] text-white/60">{p.name}</span>
                    </a>
                  ))}
                  <button
                    onClick={handleCopyLink}
                    className="flex flex-col items-center gap-1 hover:scale-110 transition-transform"
                  >
                    <span className="text-xl">🔗</span>
                    <span className="text-[9px] text-white/60">Copy</span>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comments Panel */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  className="mt-3 p-3 rounded-xl story-glass-dark max-h-[200px] overflow-y-auto"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {story.comments && story.comments.length > 0 ? (
                    <div className="space-y-2 mb-3">
                      {story.comments.map((c) => (
                        <div key={c._id} className="flex gap-2">
                          <div className="w-6 h-6 rounded-full bg-celebration-rose-gold/30 flex items-center justify-center text-[10px]">
                            {c.userName?.[0] || '?'}
                          </div>
                          <div>
                            <span className="text-white/80 text-xs font-semibold">{c.userName}</span>
                            <p className="text-white/60 text-xs">{c.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-white/40 text-xs text-center mb-3">No comments yet. Be the first! 💬</p>
                  )}
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 bg-white/10 text-white text-xs rounded-full px-3 py-2 outline-none placeholder:text-white/30 border border-white/10 focus:border-luxury-gold/50"
                    />
                    <button
                      onClick={async () => {
                        if (!commentText.trim()) return;
                        const newComment = commentText;
                        setCommentText('');

                        // Optimistic Update
                        setLocalStories(prev => {
                          const next = [...prev];
                          const current = next[currentIndex];
                          if (current) {
                            const comments = current.comments ? [...current.comments] : [];
                            comments.push({
                              _id: `comment_temp_${Date.now()}`,
                              userName: 'Visitor',
                              text: newComment,
                              createdAt: new Date().toISOString()
                            } as any);
                            next[currentIndex] = { ...current, comments };
                          }
                          return next;
                        });

                        try {
                          const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/stories/${story._id}/comment`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ userName: 'Visitor', text: newComment })
                          });
                          const data = await res.json();
                          if (res.ok && data.comments) {
                            setLocalStories(prev => {
                              const next = [...prev];
                              if (next[currentIndex]) {
                                next[currentIndex] = { ...next[currentIndex], comments: data.comments };
                              }
                              return next;
                            });
                          }
                        } catch (err) {
                          console.error('Failed to submit comment:', err);
                        }
                      }}
                      className="w-8 h-8 rounded-full bg-luxury-gold flex items-center justify-center hover:bg-celebration-rose-gold transition-colors"
                    >
                      <Send className="w-3.5 h-3.5 text-white" />
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* GENZ Royal Hampers Branding Footer */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/10">
              <div className="flex items-center">
                <BrandLogo isDarkTheme={true} className="scale-50 origin-left -ml-2" />
              </div>
              <div className="flex items-center gap-2 text-[9px] text-white/30">
                {story.showSocialMedia && story.socialMedia?.instagram && (
                  <a
                    href={`https://instagram.com/${story.socialMedia.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-luxury-gold transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    @{story.socialMedia.instagram}
                  </a>
                )}
                <a
                  href="https://genzroyalhampers.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-luxury-gold transition-colors flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-2.5 h-2.5" />
                  genzroyalhampers.com
                </a>
              </div>
            </div>
          </div>

          {/* Floating Hearts */}
          {floatingHearts.map(h => (
            <motion.div
              key={h.id}
              className="absolute z-50 text-3xl pointer-events-none"
              style={{ left: h.x, top: h.y }}
              initial={{ opacity: 1, scale: 1, y: 0 }}
              animate={{ opacity: 0, scale: 1.5, y: -150 }}
              transition={{ duration: 1.8, ease: 'easeOut' }}
            >
              {h.emoji}
            </motion.div>
          ))}

          {/* Sparkle Particles */}
          {story.isFeatured && (
            <>
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="sparkle-particle absolute text-luxury-gold pointer-events-none"
                  style={{
                    left: `${15 + i * 18}%`,
                    top: `${20 + (i % 3) * 25}%`,
                    animationDelay: `${i * 0.5}s`,
                    fontSize: `${10 + i * 2}px`
                  }}
                >
                  ✦
                </div>
              ))}
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default StoryViewer;
