import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Film, Image as ImageIcon, Play, Eye, Share2, Check,
  Heart, Gift, Send, Star, AlertCircle, Calendar, MapPin, X, MessageSquare
} from 'lucide-react';
import { MediaItem, getAssetUrl, INITIAL_MEDIA } from '../data/initialData';

const STATIC_GALLERY: MediaItem[] = INITIAL_MEDIA;
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const occasionEmoji: Record<string, string> = {
  Birthday: '🎂', Anniversary: '💍', Wedding: '💒', Proposal: '💍',
  Engagement: '💍', 'Baby Shower': '🍼', Housewarming: '🏠',
  Graduation: '🎓', Retirement: '🎉', "Mother's Day": '🌸',
  "Father's Day": '👔', "Valentine's Day": '💝', Christmas: '🎄',
  Diwali: '🪔', 'New Year': '🎆', Congratulations: '🎊',
  'Corporate Celebration': '🏢', Festival: '🎊', 'Custom Occasion': '🌟'
};

const Gallery: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [selectedMedia, setSelectedMedia] = useState<any | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [copiedLink, setCopiedLink] = useState('');
  
  // Interactive Modal States
  const [commentText, setCommentText] = useState('');
  const [reactionsCount, setReactionsCount] = useState(0);
  const [commentsList, setCommentsList] = useState<any[]>([]);

  useEffect(() => {
    const v = searchParams.get('v');
    const i = searchParams.get('i');
    if (v || i) {
      // Find matching item in media list or wait until loaded
      const found = media.find(m => m.url === (v || i));
      if (found) {
        openMedia(found);
      }
    }
  }, [searchParams, media]);

  const openMedia = (item: any) => {
    setSelectedMedia(item);
    setReactionsCount(item.story?.reactions?.length || 16); // Default mock fallback if no story
    setCommentsList(item.story?.comments || [
      { _id: 'c1', userName: 'Aarav Mehta', text: 'Best wishes to you! 💖', createdAt: new Date().toISOString() },
      { _id: 'c2', userName: 'Sneha Rao', text: 'Happy celebrations! 🌟', createdAt: new Date().toISOString() }
    ]);
    setSearchParams(item.mimetype.startsWith('video') ? { v: item.url } : { i: item.url });
  };

  const closeMedia = () => {
    setSelectedMedia(null);
    setSearchParams({});
  };

  const handleShare = async (url: string, type: 'v' | 'i') => {
    const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}gallery?${type}=${encodeURIComponent(url)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this awesome celebration from GENZ Royal Hampers!',
          url: shareUrl
        });
        return;
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
    
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  // Submit dynamic comment
  const handleSubmitComment = async (storyId: string) => {
    if (!commentText.trim()) return;

    const newComment = {
      _id: `comment_${Date.now()}`,
      userName: 'Visitor',
      text: commentText,
      createdAt: new Date().toISOString()
    };

    setCommentsList(prev => [...prev, newComment]);
    setCommentText('');

    if (storyId && !storyId.startsWith('static')) {
      try {
        await fetch(`${API_BASE}/stories/${storyId}/comment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userName: 'Visitor', text: commentText })
        });
      } catch (err) {
        console.error('Failed to post comment to backend:', err);
      }
    }
  };

  // Trigger Wish Now Reaction
  const handleWishNow = async (storyId: string) => {
    setReactionsCount(prev => prev + 1);

    if (storyId && !storyId.startsWith('static')) {
      try {
        await fetch(`${API_BASE}/stories/${storyId}/react`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emoji: '❤️', label: 'Love' })
        });
      } catch (err) {
        console.error('Failed to register reaction:', err);
      }
    }
  };

  useEffect(() => {
    const fetchMediaAndStories = async () => {
      try {
        const [mediaRes, storiesRes] = await Promise.all([
          fetch('/api/media'),
          fetch(`${API_BASE}/stories/active`)
        ]);

        const mediaData = await mediaRes.ok ? await mediaRes.json() : [];
        const storiesData = await storiesRes.ok ? await storiesRes.json() : [];

        // ── Cloudinary Dynamic Stories Integration ──
        // Extract photos and videos uploaded to Cloudinary stories
        const mappedStories: any[] = [];
        storiesData.forEach((story: any) => {
          story.photos?.forEach((url: string, idx: number) => {
            mappedStories.push({
              _id: `${story._id}_p_${idx}`,
              name: story.title || (story.brideName && story.groomName ? `${story.brideName} & ${story.groomName}'s celebration` : `${story.customerName}'s celebration`),
              url: url,
              mimetype: 'image/jpeg',
              category: `${story.occasion} Gifts`,
              story: story
            });
          });

          story.videos?.forEach((url: string, idx: number) => {
            mappedStories.push({
              _id: `${story._id}_v_${idx}`,
              name: story.title || (story.brideName && story.groomName ? `${story.brideName} & ${story.groomName}'s celebration reel` : `${story.customerName}'s celebration reel`),
              url: url,
              mimetype: 'video/mp4',
              category: 'Videos',
              story: story
            });
          });
        });

        const mappedDbMedia = mediaData.map((m: any) => ({
          _id: m._id,
          name: m.name,
          url: m.url,
          mimetype: m.mimetype,
          category: m.mimetype.startsWith('video') ? 'Videos' : 'Customer Deliveries'
        }));

        setMedia([...mappedStories, ...mappedDbMedia, ...STATIC_GALLERY]);
      } catch (err) {
        console.error("Using fallback gallery data:", err);
        setMedia(STATIC_GALLERY);
      } finally {
        setLoading(false);
      }
    };

    fetchMediaAndStories();
  }, []);

  const TABS = ['All', 'Images', 'Videos', 'Birthday Gifts', 'Anniversary Gifts', 'Wedding Gifts', 'Customer Deliveries'];

  const filteredMedia = media.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Images') return !item.mimetype.startsWith('video');
    if (activeTab === 'Videos') return item.mimetype.startsWith('video');
    return item.category === activeTab || (item.story && `${item.story.occasion} Gifts` === activeTab);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold animate-pulse">Deliveries & Wraps</span>
        <h2 className="font-serif text-3xl font-bold text-luxury-black-dark dark:text-white">Our Gifting Gallery</h2>
        <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2 animate-pulse" />
      </div>

      {/* Tabs list row */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-luxury-gold/15 pb-4">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === tab 
                ? 'bg-luxury-gold text-luxury-black shadow-sm' 
                : 'text-neutral-500 hover:bg-luxury-cream dark:hover:bg-luxury-black/30'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Grid gallery */}
      {loading ? (
        <div className="text-center py-20 text-xs text-luxury-gold animate-pulse">Assembling gallery view...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMedia.map((item) => {
            const isVideo = item.mimetype.startsWith('video') || item.url.endsWith('.mp4');
            const assetUrl = getAssetUrl(item.url);

            return (
              <div 
                key={item._id} 
                className="relative group rounded-xl overflow-hidden cursor-pointer shadow-lg hover:shadow-xl transition-all"
                onClick={() => openMedia(item)}
              >
                {isVideo ? (
                  <div className="w-full h-full relative bg-neutral-900 flex items-center justify-center">
                    <video src={item.url} className="w-full h-full object-cover aspect-[4/5]" muted playsInline />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
                      <button className="p-3.5 rounded-full bg-white/20 hover:bg-luxury-gold text-white hover:text-luxury-black transition-all">
                        <Play className="h-6 w-6 fill-current" />
                      </button>
                    </div>
                    <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[9px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      <span>Live Reel</span>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full relative bg-neutral-100 overflow-hidden aspect-[4/5]">
                    <img src={item.url} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500" />
                  </div>
                )}

                {/* Overlay details */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-center text-white">
                  <div className="overflow-hidden mr-3">
                    <h5 className="text-xs font-bold truncate">{item.name}</h5>
                    <span className="text-[9px] text-neutral-300 uppercase font-semibold">{item.story?.occasion || item.category || 'Gifts'}</span>
                  </div>
                  {isVideo ? (
                    <Film className="h-4.5 w-4.5 text-luxury-gold shrink-0" />
                  ) : (
                    <ImageIcon className="h-4.5 w-4.5 text-luxury-gold shrink-0" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Split Pane Reel & Details Viewer (Screenshot Layout) ── */}
      {selectedMedia && (() => {
        const isVideo = selectedMedia.mimetype.startsWith('video') || selectedMedia.url.endsWith('.mp4');
        
        // Load metadata (Real story properties or category-based fallback)
        const storyId = selectedMedia.story?._id || `static_${selectedMedia._id}`;
        const customerName = selectedMedia.story?.brideName && selectedMedia.story?.groomName
          ? `${selectedMedia.story.brideName} & ${selectedMedia.story.groomName}`
          : selectedMedia.story?.customerName || selectedMedia.name.split("'s")[0] || 'VISHAL SHANKAR HANDIGUND';
        const occasion = selectedMedia.story?.occasion || (selectedMedia.category?.includes('Gifts') ? selectedMedia.category.split(' ')[0] : 'Birthday');
        const city = selectedMedia.story?.city || 'Belgaum';
        const viewsCount = selectedMedia.story?.viewCount || 124;
        
        const wishesText = selectedMedia.story?.aiWishes || selectedMedia.story?.personalMessage || 
          `🎂 Happy Birthday, ${customerName}! May your special day be filled with happiness, love, laughter, success, and unforgettable memories. The entire GENZ Royal Hampers Team wishes you a wonderful birthday and a year full of joy and prosperity. 🎂🎁❤️`;

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-6 backdrop-blur-sm">
            <div className="relative w-full max-w-5xl h-[85vh] max-h-[700px] bg-[#FFF5F6] rounded-3xl overflow-hidden border border-luxury-gold/20 shadow-celebration flex flex-col md:flex-row">
              
              {/* Close button */}
              <button 
                onClick={closeMedia}
                className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-white/25 hover:bg-red-500 hover:text-white flex items-center justify-center transition-all text-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Left Column: Media Player */}
              <div className="w-full md:w-[45%] h-[40%] md:h-full relative bg-[#121212] flex items-center justify-center border-r border-luxury-gold/10">
                {isVideo ? (
                  <video 
                    src={selectedMedia.url} 
                    controls 
                    autoPlay 
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <img 
                    src={selectedMedia.url} 
                    alt="" 
                    className="w-full h-full object-contain"
                  />
                )}

                {/* Badge Overlay: Occasion */}
                <div className="absolute top-4 left-4">
                  <span className="occasion-badge flex items-center gap-1 shadow-md">
                    {occasionEmoji[occasion] || '🎉'} {occasion}
                  </span>
                </div>

                {/* Badge Overlay: City */}
                <div className="absolute bottom-4 left-4">
                  <span className="bg-black/60 text-white text-[10px] font-semibold px-2.5 py-1 rounded-lg tracking-wider flex items-center gap-1">
                    📍 {city}
                  </span>
                </div>
              </div>

              {/* Right Column: Dynamic Wishes & Engagement Panel */}
              <div className="w-full md:w-[55%] h-[60%] md:h-full p-6 flex flex-col justify-between overflow-y-auto bg-gradient-to-b from-[#FFF5F6] to-white">
                
                {/* Upper Section */}
                <div className="space-y-4">
                  {/* Profile Header */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-celebration-soft-pink to-celebration-rose-gold flex items-center justify-center text-xl shadow-md border-2 border-white">
                      {occasionEmoji[occasion] || '🎉'}
                    </div>
                    <div>
                      <h4 className="font-serif text-sm sm:text-base font-bold text-luxury-black-dark flex items-center gap-1.5">
                        {customerName}
                        <Star className="w-4 h-4 text-luxury-gold fill-luxury-gold" />
                      </h4>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-luxury-gold/80">
                        {storyId.substring(0, 10).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Wishes card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-celebration-soft-pink-light/30 to-celebration-gold-light/30 border border-luxury-gold/10 relative mt-4 shadow-sm">
                    <div className="absolute top-2 right-2 text-celebration-rose-gold/25 font-serif text-4xl">“</div>
                    <p className="text-xs sm:text-sm text-luxury-black-light font-light leading-relaxed italic pr-4 whitespace-pre-line">
                      {wishesText}
                    </p>
                  </div>

                  {/* Engagement Metrics Stats */}
                  <div className="grid grid-cols-4 gap-2 text-center py-3.5 border-t border-b border-luxury-gold/10 my-4 bg-white/40 rounded-xl shadow-sm">
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-luxury-black-dark">{viewsCount}</p>
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold">Views</span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-luxury-black-dark">{reactionsCount}</p>
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold">Wishes</span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-luxury-black-dark">3</p>
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold">Gifts Sent</span>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm font-bold text-luxury-black-dark">{commentsList.length}</p>
                      <span className="text-[9px] text-neutral-400 uppercase font-semibold">Messages</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="flex gap-2 items-center">
                    <button 
                      onClick={() => handleWishNow(selectedMedia.story?._id || '')}
                      className="flex-1 border border-celebration-rose-gold text-celebration-rose-gold rounded-full py-2.5 text-xs font-bold hover:bg-celebration-soft-pink/10 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Heart className="w-3.5 h-3.5 fill-current" /> Wish Now
                    </button>
                    <button 
                      onClick={() => window.location.href = '/GenZ/shop'}
                      className="flex-1 bg-gradient-to-r from-[#B76E79] to-[#6A0DAD] text-white rounded-full py-2.5 text-xs font-bold hover:shadow-gold-glow hover:scale-[1.01] transition-all flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Gift className="w-3.5 h-3.5" /> Send Gift
                    </button>
                    <button 
                      onClick={() => handleShare(selectedMedia.url, isVideo ? 'v' : 'i')}
                      className="border border-luxury-gold text-luxury-gold rounded-full p-2.5 hover:bg-luxury-gold/10 transition-all shadow-sm"
                      title="Share link"
                    >
                      {copiedLink === selectedMedia.url ? <Check className="w-3.5 h-3.5 text-green-500 animate-bounce" /> : <Share2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Lower Section: Message Input & Scrollable List */}
                <div className="mt-5 pt-4 border-t border-luxury-gold/10 flex-grow flex flex-col min-h-[160px]">
                  {/* Leave message input */}
                  <div className="flex gap-2 mb-3">
                    <input 
                      type="text" 
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      placeholder={`Leave a congratulatory message for ${customerName.split(' ')[0]}...`}
                      className="flex-1 text-xs border border-luxury-gold/15 bg-white/60 rounded-full px-4 py-2.5 outline-none focus:border-luxury-gold/50 shadow-inner"
                      onKeyDown={e => e.key === 'Enter' && handleSubmitComment(selectedMedia.story?._id || '')}
                    />
                    <button 
                      onClick={() => handleSubmitComment(selectedMedia.story?._id || '')}
                      className="w-9 h-9 rounded-full bg-luxury-gold hover:bg-celebration-rose-gold text-white flex items-center justify-center transition-colors shadow"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Scrollable messages thread */}
                  <div className="space-y-2 overflow-y-auto max-h-[140px] pr-1 flex-grow">
                    {commentsList.map((c, i) => (
                      <div key={c._id || i} className="p-2.5 rounded-xl bg-white border border-luxury-gold/5 shadow-sm text-xs flex gap-2 animate-fade-in-up">
                        <div className="w-6 h-6 rounded-full bg-celebration-rose-gold/10 text-celebration-rose-gold flex items-center justify-center text-[10px] font-bold">
                          {c.userName?.[0] || 'V'}
                        </div>
                        <div>
                          <p className="font-semibold text-luxury-black-dark">{c.userName}</p>
                          <p className="text-neutral-500 mt-0.5">{c.text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default Gallery;
