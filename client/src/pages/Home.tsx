import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MessageCircle, Star, Award, Compass, Truck, Search, Heart, ShieldCheck, Gift, Play, Check, Share2 } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from '../components/ProductCard';
import HeroSlider from '../components/HeroSlider';
import Sidebar from '../components/Sidebar';
import StoryBar from '../components/StoryBar';
import StoryViewer from '../components/StoryViewer';
import { useLanguage } from '../context/LanguageContext';
import { Product, Category, MediaItem, getAssetUrl, INITIAL_CATEGORIES, INITIAL_PRODUCTS, INITIAL_MEDIA } from '../data/initialData';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  // Data states
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [liveMedia, setLiveMedia] = useState<MediaItem[]>([]);
  const [previewVideo, setPreviewVideo] = useState('');
  const [copiedLink, setCopiedLink] = useState('');
  const [loading, setLoading] = useState(true);

  // Story viewer state
  const [storyViewerData, setStoryViewerData] = useState<{ stories: any[]; index: number } | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  const handleShareVideo = async (url: string) => {
    const shareUrl = `${window.location.origin}${import.meta.env.BASE_URL}gallery?v=${encodeURIComponent(url)}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Check out this awesome Reel from GENZ Royal Hampers!',
          url: shareUrl
        });
        return;
      } catch (err) {
        console.error('Error sharing:', err);
      }
    }
    
    // Fallback to clipboard
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(''), 2000);
  };

  // Load products, categories & media
  useEffect(() => {
    const fetchData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        const prodData = await prodRes.json();
        setAllProducts(prodData);

        const catRes = await fetch('/api/categories');
        const catData = await catRes.json();
        setCategories(catData);

        const mediaRes = await fetch('/api/media');
        if (mediaRes.ok) {
          const mediaData = await mediaRes.json();
          setLiveMedia(mediaData);
        }
      } catch (err) {
        console.error('Using built-in data (no backend):', err);
        setCategories(INITIAL_CATEGORIES);
        setAllProducts(INITIAL_PRODUCTS);
        setLiveMedia(INITIAL_MEDIA);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Groupings
  const featured = allProducts.filter(p => p.tags?.includes('featured')).slice(0, 4);
  const bestSellers = allProducts.filter(p => p.tags?.includes('best_seller')).slice(0, 4);
  const trending = allProducts.filter(p => p.tags?.includes('trending')).slice(0, 4);
  
  // Occasion/Category Groupings
  const teddyBears = allProducts.filter(p => p.category.toLowerCase().includes('teddy')).slice(0, 4);
  const flowers = allProducts.filter(p => p.category.toLowerCase().includes('flower')).slice(0, 4);
  const chocolates = allProducts.filter(p => p.category.toLowerCase().includes('chocolate')).slice(0, 4);
  const cakes = allProducts.filter(p => p.category.toLowerCase().includes('cake')).slice(0, 4);
  const luxuryHampers = allProducts.filter(p => p.category.toLowerCase().includes('luxury')).slice(0, 4);

  return (
    <div className="relative overflow-hidden min-h-screen bg-luxury-cream dark:bg-luxury-black-dark transition-colors duration-300">
      
      {/* Dynamic Auto-Sliding Hero Section */}
      <HeroSlider />

      {/* ═══ Celebration Stories Bar ═══ */}
      <StoryBar
        onViewStory={(stories, index) => setStoryViewerData({ stories, index })}
        onCreateStory={() => navigate('/stories/submit')}
      />

      {/* Story Viewer Overlay */}
      {storyViewerData && (
        <StoryViewer
          stories={storyViewerData.stories}
          initialIndex={storyViewerData.index}
          onClose={() => setStoryViewerData(null)}
        />
      )}

      <div className="flex relative max-w-[100vw]">
        <Sidebar />
        
        <div className="flex-grow w-full min-w-0 relative flex flex-col">
          {/* Brand Value Propositions */}
          <section className="bg-white dark:bg-luxury-black-soft py-10 border-b border-luxury-gold/10">
            <div className="w-full px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="flex items-center space-x-3.5 p-4">
                <Award className="h-9 w-9 text-luxury-gold shrink-0" />
                <div>
                  <h5 className="font-serif text-sm font-bold text-luxury-black-dark dark:text-white">Elite Craftsmanship</h5>
                  <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-0.5">Hand-tied velvet ribbons and gold wax seals.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3.5 p-4">
                <Truck className="h-9 w-9 text-luxury-gold shrink-0" />
                <div>
                  <h5 className="font-serif text-sm font-bold text-luxury-black-dark dark:text-white">Scheduled Delivery</h5>
                  <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-0.5">Select specific date and time slot checkout.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3.5 p-4">
                <Compass className="h-9 w-9 text-luxury-gold shrink-0" />
                <div>
                  <h5 className="font-serif text-sm font-bold text-luxury-black-dark dark:text-white">Gift Personalization</h5>
                  <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-0.5">Custom video message tags and greeting cards.</p>
                </div>
              </div>
              <div className="flex items-center space-x-3.5 p-4">
                <MessageCircle className="h-9 w-9 text-luxury-gold shrink-0" />
                <div>
                  <h5 className="font-serif text-sm font-bold text-luxury-black-dark dark:text-white">AI Shopper Assistant</h5>
                  <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-0.5">Intelligent gift matching in seconds.</p>
                </div>
              </div>
            </div>
          </section>

          {/* Occasion Categories Grid Section */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-2 mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Browse by occasion</span>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">
                {t('categoryTitle')}
              </h2>
              <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
            </div>

            {loading ? (
              <div className="text-center text-sm py-12 text-luxury-black/50">{t('loading')}</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {categories.map((cat) => (
                  <div
                    key={cat._id}
                    onClick={() => navigate(`/occasion/${encodeURIComponent(cat.name)}`)}
                    className="group relative h-48 rounded-2xl overflow-hidden border border-luxury-gold/10 hover:border-luxury-gold shadow-md cursor-pointer transition-all duration-500"
                  >
                    <img
                      src={getAssetUrl(cat.image)}
                      alt={cat.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/90 via-luxury-black/40 to-transparent flex flex-col justify-end p-4 text-center">
                      <h4 className="font-serif text-sm md:text-base font-bold text-white group-hover:text-luxury-gold transition-colors duration-300">
                        {cat.name}
                      </h4>
                      <span className="text-[9px] text-luxury-cream-dark/60 font-semibold tracking-wider uppercase mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Explore gifts →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Featured Hampers Section */}
          {featured.length > 0 && (
            <section className="bg-luxury-cream-dark/20 py-16 border-t border-b border-luxury-gold/10">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Signature Selection</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Featured Gift Hampers</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featured.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Best Sellers Section */}
          {bestSellers.length > 0 && (
            <section className="py-16">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Popular Choices</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Best Sellers</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {bestSellers.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Trending Gifts Section */}
          {trending.length > 0 && (
            <section className="bg-luxury-cream-dark/20 py-16 border-t border-b border-luxury-gold/10">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Highly Curated</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Trending Gifts</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {trending.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Teddy Bears Section */}
          {teddyBears.length > 0 && (
            <section className="py-16">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Plush & Soft</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Teddy Bears</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {teddyBears.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Flowers Section */}
          {flowers.length > 0 && (
            <section className="bg-luxury-cream-dark/20 py-16 border-t border-b border-luxury-gold/10">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Fresh Blooms</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Fresh Flowers</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {flowers.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Chocolates Section */}
          {chocolates.length > 0 && (
            <section className="py-16">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Artisanal Sweets</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Luxury Chocolates</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {chocolates.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Cakes Section */}
          {cakes.length > 0 && (
            <section className="bg-luxury-cream-dark/20 py-16 border-t border-b border-luxury-gold/10">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Royal Celebrations</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Gourmet Cakes</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {cakes.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

          {/* Luxury Hampers Section */}
          {luxuryHampers.length > 0 && (
            <section className="py-16">
              <div className="w-full px-4 sm:px-6 lg:px-8">
                <div className="text-center space-y-2 mb-12">
                  <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Signature Hampers</span>
                  <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">Luxury Gift Hampers</h2>
                  <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {luxuryHampers.map(p => <ProductCard key={p._id} product={p} />)}
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Live Customer Happiness Reels Section */}
          <section className="bg-white dark:bg-luxury-black-dark py-16 border-t border-b border-luxury-gold/10">
            <div className="w-full px-4 sm:px-6 lg:px-8 space-y-12">
              
              <div className="text-center space-y-2">
                <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Real Celebrations, Real Joy</span>
                <h2 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white">
                  Customer Happiness Live Reels
                </h2>
                <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
              </div>

              {/* Videos Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {liveMedia.filter(item => item.mimetype.startsWith('video')).slice(0, 3).map((item) => (
                  <div 
                    key={item._id}
                    className="group relative aspect-[9/16] max-w-[280px] mx-auto w-full rounded-2xl overflow-hidden shadow-lg border border-luxury-gold/10 hover:border-luxury-gold transition-all duration-300 bg-neutral-900"
                  >
                    <video src={item.url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent flex flex-col justify-between p-4">
                      <div className="flex justify-between items-start">
                        <span className="bg-red-600/90 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-md">
                          <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
                          <span>Live Reel</span>
                        </span>
                      </div>

                      <div className="space-y-2 text-white">
                        <h5 className="text-xs font-bold truncate">{item.name}</h5>
                        <button 
                          onClick={() => setPreviewVideo(item.url)}
                          className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold text-luxury-gold hover:text-white transition-colors"
                        >
                          <span className="p-1.5 rounded-full bg-white/20 hover:bg-luxury-gold hover:text-luxury-black transition-all">
                            <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                          </span>
                          <span>Watch Full Clip</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Photos Grid */}
              <div className="space-y-4">
                <h4 className="font-serif text-sm font-semibold text-center text-luxury-black-soft dark:text-neutral-300 tracking-wider">
                  Recent Delivery Moments
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {liveMedia.filter(item => !item.mimetype.startsWith('video')).slice(0, 4).map((item) => (
                    <div 
                      key={item._id}
                      className="group relative aspect-square rounded-xl overflow-hidden border border-luxury-gold/10 shadow-sm"
                    >
                      <img 
                        src={item.url} 
                        alt={item.name} 
                        loading="lazy" 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
                        <span className="text-[10px] text-white font-semibold truncate w-full">{item.name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center pt-4">
                <button
                  onClick={() => navigate('/gallery')}
                  className="px-8 py-3 rounded-full text-xs font-bold uppercase tracking-widest border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black transition-all shadow-md"
                >
                  Explore Gifting Gallery
                </button>
              </div>

            </div>
          </section>

          {/* Luxury Customer Testimonials */}
          <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center space-y-2 mb-12">
              <span className="text-xs font-bold uppercase tracking-widest text-luxury-gold">Delighted Customer Notes</span>
              <h2 className="font-serif text-2xl font-bold text-luxury-black-dark dark:text-white">Customer Reviews</h2>
              <div className="w-16 h-0.5 bg-luxury-red mx-auto mt-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 shadow-sm space-y-4">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-sm">★</span>)}
                </div>
                <p className="text-xs text-luxury-black/70 dark:text-white/70 leading-relaxed italic">
                  "Ordered the Royal Crimson hamper for my parents' anniversary in Bangalore. The delivery was exactly on schedule, and the gold ribbons and custom greeting card looked incredibly luxurious!"
                </p>
                <div className="border-t border-luxury-gold/10 pt-3">
                  <h6 className="font-bold text-xs text-luxury-black-dark dark:text-white">Meera Nair</h6>
                  <span className="text-[10px] text-luxury-black/40 dark:text-white/40">Verified Customer</span>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 shadow-sm space-y-4">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-sm">★</span>)}
                </div>
                <p className="text-xs text-luxury-black/70 dark:text-white/70 leading-relaxed italic">
                  "The greeting card designer is genius! Typing my message and choosing Classic Gold filigree with live preview gave me so much confidence. Will always use GenZ Royal Hampers."
                </p>
                <div className="border-t border-luxury-gold/10 pt-3">
                  <h6 className="font-bold text-xs text-luxury-black-dark dark:text-white">Amit Sharma</h6>
                  <span className="text-[10px] text-luxury-black/40 dark:text-white/40">Verified Customer</span>
                </div>
              </div>

              <div className="p-6 bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 shadow-sm space-y-4">
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => <span key={i} className="text-sm">★</span>)}
                </div>
                <p className="text-xs text-luxury-black/70 dark:text-white/70 leading-relaxed italic">
                  "As a Super Admin, managing categories and tracking orders is incredibly seamless in the backend. I can update shipping status codes and see sales charts live in seconds."
                </p>
                <div className="border-t border-luxury-gold/10 pt-3">
                  <h6 className="font-bold text-xs text-luxury-black-dark dark:text-white">Kavitha K.</h6>
                  <span className="text-[10px] text-luxury-black/40 dark:text-white/40">Store Manager</span>
                </div>
              </div>
            </div>
          </section>

      {/* Video Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-3xl max-h-[85vh] bg-black rounded-2xl border border-luxury-gold/40 shadow-2xl flex items-center justify-center">
            
            <div className="absolute -top-3 -right-3 md:top-4 md:right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => setPreviewVideo('')}
                className="p-2.5 rounded-full bg-neutral-900 shadow-xl border border-white/20 text-white hover:text-luxury-red transition-all"
                title="Close"
              >
                ✕
              </button>
              <button
                onClick={() => handleShareVideo(previewVideo)}
                className="p-2.5 rounded-full bg-neutral-900 shadow-xl border border-white/20 text-white hover:text-luxury-gold transition-all"
                title="Share Reel Link"
              >
                {copiedLink === previewVideo ? <Check className="h-5 w-5 text-green-500" /> : <Share2 className="h-5 w-5" />}
              </button>
            </div>

            <video src={previewVideo} controls autoPlay className="w-full h-full max-h-[85vh] object-contain rounded-2xl" />
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
