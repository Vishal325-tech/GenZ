import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Clock, Facebook, Instagram, Twitter, Heart, CheckCircle } from 'lucide-react';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-luxury-black text-luxury-cream-dark border-t border-luxury-gold/20 pt-16 pb-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        
        {/* Brand Information */}
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <span className="font-serif text-xl font-bold tracking-wider text-luxury-gold">
              GAJANANA ROYAL HAMPERS
            </span>
          </div>
          <p className="text-sm text-luxury-cream-dark/60 leading-relaxed">
            Delivering luxury and premium curated celebration hampers directly to your loved ones. Hand-wrapped with love, ribboned to perfection.
          </p>
          <div className="flex space-x-4 pt-2">
            <a href="#" className="text-luxury-gold hover:text-white transition-colors"><Facebook className="h-5 w-5" /></a>
            <a href="#" className="text-luxury-gold hover:text-white transition-colors"><Instagram className="h-5 w-5" /></a>
            <a href="#" className="text-luxury-gold hover:text-white transition-colors"><Twitter className="h-5 w-5" /></a>
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="font-serif text-lg font-semibold text-white border-b border-luxury-gold/30 pb-2 mb-4">
            Quick Links
          </h4>
          <ul className="space-y-2 text-sm text-luxury-cream-dark/70">
            <li><Link to="/shop" className="hover:text-luxury-gold transition-colors">Browse Gifts</Link></li>
            <li><Link to="/gallery" className="hover:text-luxury-gold transition-colors">Deliveries Gallery</Link></li>
            <li><Link to="/blogs" className="hover:text-luxury-gold transition-colors">Our Blog</Link></li>
            <li><Link to="/about" className="hover:text-luxury-gold transition-colors">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-luxury-gold transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Operating Hours & Contact */}
        <div className="space-y-4">
          <h4 className="font-serif text-lg font-semibold text-white border-b border-luxury-gold/30 pb-2 mb-4">
            Operational Hours
          </h4>
          <ul className="space-y-2.5 text-sm text-luxury-cream-dark/70">
            <li className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-luxury-gold shrink-0" />
              <span>Mon - Sat: 9:00 AM - 9:00 PM</span>
            </li>
            <li className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-luxury-gold shrink-0" />
              <span>Sunday: 10:00 AM - 6:00 PM</span>
            </li>
            <li className="flex items-center space-x-2 pt-2">
              <Phone className="h-4 w-4 text-luxury-gold shrink-0" />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-luxury-gold shrink-0" />
              <span>support@gajananaroyalhampers.com</span>
            </li>
          </ul>
        </div>

        {/* Google Maps / Location locator */}
        <div>
          <h4 className="font-serif text-lg font-semibold text-white border-b border-luxury-gold/30 pb-2 mb-4">
            Our Location
          </h4>
          <div className="w-full h-36 rounded-lg overflow-hidden border border-luxury-gold/20 shadow-lg relative bg-luxury-black-soft flex items-center justify-center">
            {/* Styled Google Maps iframe mockup */}
            <div className="absolute inset-0 bg-neutral-900 opacity-80 flex flex-col items-center justify-center p-4 text-center">
              <MapPin className="h-7 w-7 text-luxury-red mb-1.5 animate-bounce" />
              <span className="text-xs text-white font-semibold">Gajanana Royal Hampers Hub</span>
              <span className="text-[10px] text-luxury-cream-dark/60 mt-1">100 Luxury Palace, Gold Sector, Bangalore</span>
            </div>
            {/* Mock coordinates mapping grid background */}
            <div className="w-full h-full opacity-10 bg-[linear-gradient(rgba(212,175,55,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.2)_1px,transparent_1px)] bg-[size:10px_10px]" />
          </div>
        </div>

      </div>

      {/* Newsletter signup & bottom credits */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-luxury-gold/10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          
          {/* Newsletter Input */}
          <div className="w-full max-w-md">
            <h5 className="text-sm font-semibold text-white mb-2">Subscribe to our Luxury Newsletter</h5>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 px-4 py-2 text-xs rounded border border-luxury-gold/30 bg-luxury-black-soft text-white focus:outline-none focus:border-luxury-gold"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold bg-luxury-gold text-luxury-black hover:bg-luxury-gold-hover rounded transition-colors"
              >
                Subscribe
              </button>
            </form>
            {subscribed && (
              <div className="flex items-center space-x-1.5 text-xs text-luxury-gold mt-2">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Subscription successful! Welcome to Gajanana Royal Hampers.</span>
              </div>
            )}
          </div>

          {/* Legal Links */}
          <div className="flex flex-wrap gap-4 text-xs text-luxury-cream-dark/40">
            <Link to="/privacy" className="hover:text-luxury-gold transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-luxury-gold transition-colors">Terms & Conditions</Link>
            <Link to="/shipping-policy" className="hover:text-luxury-gold transition-colors">Shipping Policy</Link>
            <Link to="/refund-policy" className="hover:text-luxury-gold transition-colors">Refund Policy</Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-12 text-xs text-luxury-cream-dark/30 flex flex-col sm:flex-row items-center justify-center gap-1">
          <span>&copy; {new Date().getFullYear()} Gajanana Royal Hampers. CEO: Vishal S H. Handcrafted with</span>
          <div className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5 text-luxury-red fill-luxury-red animate-pulse" />
            <span>for elite gifting.</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
