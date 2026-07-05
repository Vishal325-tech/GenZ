import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Sun, Moon, Globe, Mic, Menu, X, Gift } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLanguage, Language } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import VoiceSearchModal from './VoiceSearchModal';

const OCCASIONS = [
  'Birthday', 'Anniversary', "Valentine's Day", 'Baby Shower', 'Congratulations',
  'Graduation', 'Festivals', 'Christmas', 'House Warming', 'Father\'s Day',
  'Mother\'s Day', 'Wedding', 'Surprise Gifts', 'Corporate Gifts'
];

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlist } = useWishlist();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [occasionsOpen, setOccasionsOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [voiceSearchOpen, setVoiceSearchOpen] = useState(false);

  const occasionsRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (occasionsRef.current && !occasionsRef.current.contains(e.target as Node)) {
        setOccasionsOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleOccasionClick = (occ: string) => {
    navigate(`/occasion/${encodeURIComponent(occ)}`);
    setOccasionsOpen(false);
    setMobileMenuOpen(false);
  };

  const selectLanguage = (lang: Language) => {
    setLanguage(lang);
    setLangDropdownOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FFF0F2]/85 dark:bg-luxury-black-dark/85 backdrop-blur-md transition-colors duration-300 shadow-md border-b-2 border-transparent bg-clip-border [border-image:linear-gradient(to_right,#D4AF37,#8B0000,#D4AF37)_1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <Gift className="h-8 w-8 text-luxury-red hover:text-luxury-gold transition-colors duration-300" />
            <div className="flex flex-col">
              <span className="font-serif text-lg md:text-xl font-bold tracking-wider font-extrabold shimmer-red transition-all duration-300">
                GAJANANA ROYAL HAMPERS
              </span>
              <span className="text-[10px] uppercase tracking-widest text-luxury-red/80 dark:text-luxury-red/70 font-semibold flex items-center gap-1.5">
                <span>Royal Celebration & Hampers</span>
                <span className="bg-luxury-red text-white text-[8px] px-1.5 py-0.5 rounded-full font-bold border border-luxury-red-dark/40 shadow-sm">CEO Vishal S H</span>
              </span>
            </div>
          </Link>

          {/* Search bar Desktop */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2.5 rounded-full border border-luxury-gold/30 bg-white dark:bg-luxury-black-soft text-sm text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold dark:focus:ring-luxury-gold"
            />
            <Search className="absolute left-3.5 h-4 w-4 text-luxury-gold" />
            <button
              type="button"
              onClick={() => setVoiceSearchOpen(true)}
              className="absolute right-3.5 p-1 rounded-full text-luxury-gold hover:bg-luxury-cream dark:hover:bg-luxury-black"
              title="Voice Search"
            >
              <Mic className="h-4 w-4" />
            </button>
          </form>

          {/* Navigation Links Desktop */}
          <div className="hidden lg:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium text-luxury-black/80 dark:text-white/80 hover:text-luxury-red dark:hover:text-luxury-gold transition-colors">
              {t('home')}
            </Link>
            <Link to="/shop" className="text-sm font-medium text-luxury-black/80 dark:text-white/80 hover:text-luxury-red dark:hover:text-luxury-gold transition-colors">
              {t('shop')}
            </Link>

            {/* Occasions Dropdown */}
            <div className="relative" ref={occasionsRef}>
              <button
                onClick={() => setOccasionsOpen(!occasionsOpen)}
                className="text-sm font-medium text-luxury-black/80 dark:text-white/80 hover:text-luxury-red dark:hover:text-luxury-gold transition-colors flex items-center"
              >
                {t('occasions')}
              </button>
              {occasionsOpen && (
                <div className="absolute top-8 left-0 w-56 rounded-md shadow-lg bg-white dark:bg-luxury-black-soft border border-luxury-gold/20 py-2 z-50">
                  <div className="grid grid-cols-1 max-h-80 overflow-y-auto">
                    {OCCASIONS.map((occ) => (
                      <button
                        key={occ}
                        onClick={() => handleOccasionClick(occ)}
                        className="text-left px-4 py-2 text-xs hover:bg-luxury-cream dark:hover:bg-luxury-black text-luxury-black dark:text-white transition-colors"
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link to="/gallery" className="text-sm font-medium text-luxury-black/80 dark:text-white/80 hover:text-luxury-red dark:hover:text-luxury-gold transition-colors">
              {t('gallery')}
            </Link>
            <Link to="/blogs" className="text-sm font-medium text-luxury-black/80 dark:text-white/80 hover:text-luxury-red dark:hover:text-luxury-gold transition-colors">
              {t('blog')}
            </Link>

          </div>

          {/* Action Buttons Icons */}
          <div className="flex items-center space-x-4">
            {/* Lang Dropdown */}
            <div className="relative" ref={langRef}>
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="p-2 rounded-full hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-gold"
                title="Select Language"
              >
                <Globe className="h-5 w-5" />
              </button>
              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-luxury-black-soft border border-luxury-gold/20 py-1 z-50">
                  <button onClick={() => selectLanguage('en')} className="w-full text-left px-4 py-2 text-sm hover:bg-luxury-cream dark:hover:bg-luxury-black text-luxury-black dark:text-white">
                    English
                  </button>
                  <button onClick={() => selectLanguage('kn')} className="w-full text-left px-4 py-2 text-sm hover:bg-luxury-cream dark:hover:bg-luxury-black text-luxury-black dark:text-white">
                    ಕನ್ನಡ
                  </button>
                  <button onClick={() => selectLanguage('hi')} className="w-full text-left px-4 py-2 text-sm hover:bg-luxury-cream dark:hover:bg-luxury-black text-luxury-black dark:text-white">
                    हिन्दी
                  </button>
                </div>
              )}
            </div>

            {/* Dark Mode toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-gold"
              title="Toggle Theme"
            >
              {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </button>

            {/* Wishlist */}
            <Link
              to="/account?tab=wishlist"
              className="p-2 rounded-full hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-gold relative"
              title="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlist.length > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-luxury-red text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {wishlist.length}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Link
              to="/cart"
              className="p-2 rounded-full hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-gold relative"
              title="Cart"
            >
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1.5 right-1.5 bg-luxury-red text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Account */}
            <Link
              to={user ? "/account" : "/login"}
              className="p-2 rounded-full hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-gold"
              title="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-gold"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Drawer menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-luxury-gold/10 bg-luxury-cream dark:bg-luxury-black px-4 py-4 space-y-3 shadow-inner">
          <form onSubmit={handleSearchSubmit} className="flex items-center relative">
            <input
              type="text"
              placeholder={t('searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 rounded-full border border-luxury-gold/30 bg-white dark:bg-luxury-black-soft text-sm text-luxury-black dark:text-white focus:outline-none"
            />
            <Search className="absolute left-3.5 h-4 w-4 text-luxury-gold" />
            <button
              type="button"
              onClick={() => { setVoiceSearchOpen(true); setMobileMenuOpen(false); }}
              className="absolute right-3.5 p-1 rounded-full text-luxury-gold hover:bg-luxury-cream dark:hover:bg-luxury-black"
            >
              <Mic className="h-4 w-4" />
            </button>
          </form>

          <div className="flex flex-col space-y-2 pt-2">
            <Link to="/" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-black dark:text-white">
              {t('home')}
            </Link>
            <Link to="/shop" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-black dark:text-white">
              {t('shop')}
            </Link>
            
            {/* Occasions Mobile collapsible list */}
            <div>
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-luxury-gold block">
                {t('occasions')}
              </span>
              <div className="grid grid-cols-2 gap-1 px-3 py-2 max-h-36 overflow-y-auto border border-luxury-gold/10 rounded my-1 bg-white dark:bg-luxury-black-soft">
                {OCCASIONS.map((occ) => (
                  <button
                    key={occ}
                    onClick={() => handleOccasionClick(occ)}
                    className="text-left text-xs py-1.5 hover:text-luxury-red dark:hover:text-luxury-gold text-luxury-black dark:text-white"
                  >
                    {occ}
                  </button>
                ))}
              </div>
            </div>

            <Link to="/gallery" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-black dark:text-white">
              {t('gallery')}
            </Link>
            <Link to="/blogs" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium rounded hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft text-luxury-black dark:text-white">
              {t('blog')}
            </Link>



            {user ? (
              <button
                onClick={() => { logout(); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2 text-base font-medium text-luxury-red hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft rounded"
              >
                Log Out
              </button>
            ) : (
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="px-3 py-2 text-base font-medium text-luxury-red hover:bg-luxury-cream-dark dark:hover:bg-luxury-black-soft rounded">
                Log In
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Voice Search Integration */}
      <VoiceSearchModal isOpen={voiceSearchOpen} onClose={() => setVoiceSearchOpen(false)} />
    </nav>
  );
};

export default Navbar;
