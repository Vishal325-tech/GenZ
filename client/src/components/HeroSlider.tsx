import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Gem, Heart, Package, Clock, ShieldCheck, Truck, RefreshCw, Headphones, Award, Star, Gift } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_SLIDES = [
  {
    id: 1,
    theme: 'pink',
    bgClass: 'bg-gradient-to-br from-pink-200 via-rose-100 to-pink-300 dark:from-[#3a1c22] dark:via-[#2a1216] dark:to-[#1a0a0c]',
    title: 'Ultra-Premium Luxury Gift Baskets & Hampers',
    description: 'Indulge in our curated collection of exquisite custom gift hampers, artisanal chocolates, plush teddy bears, and hand-wrapped flowers styled to create everlasting memories.',
    image: 'uploads/whatsapp-image-2026-06-23-at-7-00-40-pm.jpeg',
    ctaPrimary: 'SHOP COLLECTION',
    ctaSecondary: 'EXPLORE TRENDING'
  },
  {
    id: 2,
    theme: 'dark-gold',
    bgClass: 'bg-gradient-to-br from-[#1c1c1c] via-[#2a2a2a] to-[#121212] dark:from-black dark:via-[#1a1a1a] dark:to-black',
    title: 'Golden Elegance & Bespoke Curation',
    description: 'Experience the pinnacle of luxury with our gold-themed hampers, featuring exclusive imported goods and shimmering ribbons designed for true royalty.',
    image: 'uploads/whatsapp-image-2026-06-23-at-7-00-41-pm.jpeg',
    ctaPrimary: 'VIEW BESPOKE GIFTS',
    ctaSecondary: 'OUR HERITAGE'
  },
  {
    id: 3,
    theme: 'green',
    bgClass: 'bg-gradient-to-br from-emerald-100 via-green-50 to-emerald-200 dark:from-[#0d2a1d] dark:via-[#091f15] dark:to-[#04120a]',
    title: 'Fresh & Classy Botanical Gifts',
    description: 'Breathe life into your celebrations with our luxury botanical hampers, fresh exotic flowers, and organic luxury treats handpicked with love.',
    image: 'uploads/whatsapp-image-2026-06-23-at-7-01-33-pm.jpeg',
    ctaPrimary: 'EXPLORE FLOWERS',
    ctaSecondary: 'GIFT COMBOS'
  },
  {
    id: 4,
    theme: 'purple',
    bgClass: 'bg-gradient-to-br from-purple-200 via-fuchsia-100 to-purple-300 dark:from-[#2d1b36] dark:via-[#1f1025] dark:to-[#120716]',
    title: 'Royal Purple & Majestic Surprises',
    description: 'Make them feel like royalty. Unveil our majestic purple hampers adorned with elegant balloons, premium chocolates, and magical keepsakes.',
    image: 'uploads/whatsapp-image-2026-06-23-at-7-01-54-pm.jpeg',
    ctaPrimary: 'SHOP ROYALTY',
    ctaSecondary: 'TRENDING NOW'
  },
  {
    id: 5,
    theme: 'navy',
    bgClass: 'bg-gradient-to-br from-blue-200 via-indigo-100 to-blue-300 dark:from-[#0f1b2b] dark:via-[#08101a] dark:to-[#03070d]',
    title: 'Deep Blue Elegance & Glowing Keepsakes',
    description: 'For the distinguished taste. Our navy theme offers sophisticated corporate gifts, timeless presents, and elegant personalized keepsakes.',
    image: 'uploads/whatsapp-image-2026-06-23-at-7-01-55-pm.jpeg',
    ctaPrimary: 'CORPORATE GIFTS',
    ctaSecondary: 'PERSONALIZED'
  }
];

const FEATURES = [
  { icon: <Gem className="h-4 w-4" />, text: 'Premium Quality' },
  { icon: <Heart className="h-4 w-4" />, text: 'Handpicked with Love' },
  { icon: <Package className="h-4 w-4" />, text: 'Luxury Packaging' },
  { icon: <Clock className="h-4 w-4" />, text: 'On-time Delivery' }
];

const HIGHLIGHTS = [
  { icon: <ShieldCheck className="h-3 w-3" />, text: '100% Secure Payments' },
  { icon: <Truck className="h-3 w-3" />, text: 'Same Day Delivery' },
  { icon: <RefreshCw className="h-3 w-3" />, text: 'Easy Returns' },
  { icon: <Headphones className="h-3 w-3" />, text: '24/7 Customer Support' },
  { icon: <Award className="h-3 w-3" />, text: 'Premium Quality' }
];

const CATEGORIES = [
  'Birthday', 'Anniversary', 'Wedding', 'Valentine\'s', 'Flowers', 'Cakes', 'Chocolates', 'Teddy Bears', 'Personalized', 'Corporate'
];

const HeroSlider: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [isHovered, setIsHovered] = useState(false);
  const [slides, setSlides] = useState(DEFAULT_SLIDES);

  useEffect(() => {
    const fetchHeroImages = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const url = apiUrl.endsWith('/api') ? apiUrl.replace('/api', '/api/ui/images/genz_ui_hero') : `${apiUrl}/ui/images/genz_ui_hero`;
        
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.images && data.images.length > 0) {
            setSlides(prev => prev.map((slide, index) => {
              if (data.images[index]) {
                return { ...slide, image: data.images[index].url };
              }
              return slide;
            }));
          }
        }
      } catch (err) {
        console.error('Failed to fetch dynamic hero images:', err);
      }
    };

    fetchHeroImages();
  }, []);

  useEffect(() => {
    if (isHovered) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 7500);
    return () => clearInterval(timer);
  }, [isHovered]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const slide = slides[currentSlide];

  return (
    <div 
      className="relative w-full min-h-[90vh] md:min-h-[85vh] flex flex-col overflow-hidden transition-all duration-1000 ease-in-out"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      
      <div className={`absolute inset-0 ${slide.bgClass} transition-colors duration-1000`} />

      <div className="absolute inset-0 bg-black/5 dark:bg-black/30 pointer-events-none transition-colors duration-1000" />

      <div className="relative z-10 flex-grow flex flex-col items-center justify-center pt-2 pb-16 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto w-full">
        
        <span className="inline-flex items-center space-x-1.5 px-4 py-1.5 rounded-full border border-luxury-gold/40 bg-luxury-gold/10 text-luxury-gold text-[10px] sm:text-xs uppercase font-bold tracking-widest animate-pulse mb-8">
          <Star className="h-3.5 w-3.5 fill-current" />
          <span>GENZ Royal Hampers • Royal Curation</span>
        </span>

        <div className="w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
          
          <div className="flex-1 text-center lg:text-left space-y-6 flex flex-col items-center lg:items-start transition-opacity duration-500" key={`text-${currentSlide}`}>
            
            <h1 className={`font-serif text-2xl sm:text-3xl lg:text-4xl xl:text-[2.75rem] font-extrabold leading-tight tracking-wide ${slide.theme === 'dark-gold' || slide.theme === 'navy' || slide.theme === 'purple' ? 'text-white' : 'text-luxury-black-dark dark:text-white'}`}>
              {slide.title}
            </h1>
            
            <p className={`max-w-xl text-sm sm:text-base leading-relaxed font-light ${slide.theme === 'dark-gold' || slide.theme === 'navy' || slide.theme === 'purple' ? 'text-white/80' : 'text-luxury-black/70 dark:text-white/80'}`}>
              {slide.description}
            </p>

            <form onSubmit={handleSearch} className="w-full max-w-md relative mt-6">
              <input
                type="text"
                placeholder="Search luxury hampers, cakes, flowers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-28 py-3.5 rounded-full border border-white/40 bg-white/80 dark:bg-black/50 backdrop-blur-md text-sm text-luxury-black dark:text-white focus:outline-none focus:ring-2 focus:ring-luxury-gold shadow-xl transition-all"
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-luxury-gold" />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-luxury-red hover:bg-luxury-red-dark text-white text-xs font-bold uppercase tracking-wider px-5 py-2.5 rounded-full transition-colors shadow-md"
              >
                Search
              </button>
            </form>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-4">
              <button onClick={() => navigate('/shop')} className="bg-luxury-red hover:bg-luxury-red-dark text-white px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase font-bold tracking-widest shadow-lg hover:shadow-red-glow transition-all flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>{slide.ctaPrimary}</span>
              </button>
              <button onClick={() => navigate('/shop')} className={`backdrop-blur-md border px-8 py-3.5 rounded-full text-xs sm:text-sm uppercase font-bold tracking-widest shadow-lg transition-all flex items-center space-x-2 ${slide.theme === 'dark-gold' || slide.theme === 'navy' || slide.theme === 'purple' ? 'bg-white/10 hover:bg-white/20 border-white/30 text-white' : 'bg-black/5 hover:bg-black/10 border-luxury-black/20 text-luxury-black-dark dark:text-white dark:border-white/30 dark:bg-white/10'}`}>
                <Star className="h-4 w-4" />
                <span>{slide.ctaSecondary}</span>
              </button>
            </div>
          </div>

          <div className="flex-1 w-full max-w-lg xl:max-w-2xl relative flex flex-col items-center lg:items-end transition-opacity duration-500" key={`img-${currentSlide}`}>
            <div className="relative w-full aspect-[16/10] max-h-[380px] rounded-3xl overflow-hidden shadow-2xl border border-white/20 group">
              <img 
                src={slide.image.startsWith('http') ? slide.image : `${import.meta.env.BASE_URL}${slide.image}`} 
                alt={slide.title} 
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </div>

            <div className="absolute -right-4 lg:-right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col gap-3 z-20">
              {FEATURES.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-white/90 dark:bg-black/80 backdrop-blur-md px-4 py-2.5 rounded-lg shadow-lg border border-luxury-gold/30">
                  <div className="text-luxury-gold">{feature.icon}</div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-luxury-black dark:text-white">{feature.text}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      <div className="absolute bottom-[3.5rem] left-1/2 -translate-x-1/2 flex space-x-3 z-20">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            className={`w-2.5 h-2.5 rounded-full transition-all duration-300 shadow-sm ${currentSlide === idx ? 'w-8 bg-luxury-gold' : 'bg-white/60 hover:bg-white'}`}
          />
        ))}
      </div>

      <div className="absolute bottom-0 left-0 w-full z-20 bg-white/30 dark:bg-black/30 backdrop-blur-md border-t border-luxury-gold/20 py-3 overflow-x-auto hide-scrollbar">
        <div className="flex items-center gap-4 px-4 sm:px-6 lg:px-12 max-w-[1600px] mx-auto min-w-max">
          {CATEGORIES.map((cat, idx) => (
            <button key={idx} onClick={() => navigate('/shop')} className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white/60 dark:bg-black/60 hover:bg-luxury-gold hover:text-white transition-colors border border-luxury-gold/20 text-[10px] sm:text-xs font-bold uppercase tracking-wider text-luxury-black dark:text-white shadow-sm">
              <Gift className="h-3.5 w-3.5" />
              <span>{cat}</span>
            </button>
          ))}
        </div>
      </div>

    </div>
  );
};

export default HeroSlider;
