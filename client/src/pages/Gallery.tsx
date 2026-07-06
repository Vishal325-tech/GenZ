import React, { useEffect, useState } from 'react';
import { Film, Image as ImageIcon, Play, Eye } from 'lucide-react';
import { MediaItem, getAssetUrl, INITIAL_MEDIA } from '../data/initialData';

const STATIC_GALLERY: MediaItem[] = INITIAL_MEDIA;

const Gallery: React.FC = () => {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [activeTab, setActiveTab] = useState('All');
  const [loading, setLoading] = useState(true);
  const [previewVideo, setPreviewVideo] = useState('');
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const res = await fetch('/api/media');
        const data = await res.ok ? await res.json() : [];
        
        // Merge dynamic database media with static seeded media
        const mappedDbMedia = data.map((m: any) => ({
          _id: m._id,
          name: m.name,
          url: m.url,
          mimetype: m.mimetype,
          category: m.mimetype.startsWith('video') ? 'Videos' : 'Customer Deliveries'
        }));
        
        setMedia([...mappedDbMedia, ...STATIC_GALLERY]);
      } catch (err) {
        console.error("Using built-in media data:", err);
        setMedia(STATIC_GALLERY);
      } finally {
        setLoading(false);
      }
    };

    fetchMedia();
  }, []);

  const TABS = ['All', 'Images', 'Videos', 'Birthday Gifts', 'Anniversary Gifts', 'Wedding Gifts', 'Customer Deliveries'];

  const filteredMedia = media.filter(item => {
    if (activeTab === 'All') return true;
    if (activeTab === 'Images') return !item.mimetype.startsWith('video');
    if (activeTab === 'Videos') return item.mimetype.startsWith('video');
    return item.category === activeTab;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-8">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Deliveries & Wraps</span>
        <h2 className="font-serif text-3xl font-bold text-luxury-black-dark dark:text-white">Our Gifting Gallery</h2>
        <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
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

            return (
              <div
                key={item._id}
                className="group relative aspect-video rounded-xl overflow-hidden border border-luxury-gold/10 hover:border-luxury-gold shadow-md hover:shadow-gold-glow transition-all duration-300 bg-neutral-200"
              >
                {isVideo ? (
                  <div className="w-full h-full relative bg-neutral-900 flex items-center justify-center">
                    <video src={item.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center group-hover:bg-black/20 transition-all duration-300">
                      <button
                        onClick={() => setPreviewVideo(item.url)}
                        className="p-3.5 rounded-full bg-white/20 hover:bg-luxury-gold text-white hover:text-luxury-black transition-colors"
                      >
                        <Play className="h-6 w-6 fill-current" />
                      </button>
                    </div>
                    {/* Live reel badge */}
                    <div className="absolute top-3 left-3 bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                      <span>Live Reel</span>
                    </div>
                  </div>
                ) : (
                  <img src={item.url} alt={item.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500 cursor-pointer" onClick={() => setPreviewImage(item.url)} />
                )}

                {/* Overlay details */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex justify-between items-center text-white">
                  <div className="overflow-hidden mr-3">
                    <h5 className="text-xs font-bold truncate">{item.name}</h5>
                    <span className="text-[9px] text-neutral-300 uppercase font-semibold">{item.category || 'Gifts'}</span>
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

      {/* Video Streaming Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden border border-luxury-gold/40">
            <button
              onClick={() => setPreviewVideo('')}
              className="absolute top-4 right-4 text-white hover:text-luxury-red z-10 p-1 rounded-full bg-black/40"
            >
              ✕
            </button>
            <video src={previewVideo} controls autoPlay className="w-full aspect-video" />
          </div>
        </div>
      )}
      {previewImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-2xl bg-black rounded-lg overflow-hidden border border-luxury-gold/40">
            <button
              onClick={() => setPreviewImage('')}
              className="absolute top-4 right-4 text-white hover:text-luxury-red z-10 p-1 rounded-full bg-black/40"
            >
              ✕
            </button>
            <img src={previewImage} alt="Preview" className="w-full object-contain" />
          </div>
        </div>
      )}

    </div>
  );
};

export default Gallery;
