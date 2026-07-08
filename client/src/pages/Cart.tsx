import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Trash2, Calendar, Gift, Ticket, MessageSquare, ArrowRight, Clock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { getAssetUrl } from '../data/initialData';

const Cart: React.FC = () => {
  const navigate = useNavigate();
  const {
    cartItems,
    coupon,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
    cartSubtotal,
    discountAmount,
    cartTotal
  } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    setCouponError('');
    setCouponSuccess('');
    try {
      const msg = await applyCoupon(couponCode);
      setCouponSuccess(msg);
      setCouponCode('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <span className="text-4xl block mb-3 animate-pulse">🛒</span>
        <h3 className="font-serif text-lg font-bold text-luxury-black-dark dark:text-white">Your Shopping Cart is Empty</h3>
        <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-1 max-w-xs leading-relaxed">
          Explore our signature red-themed gift boxes and teddy flowers to deliver happiness to your loved ones!
        </p>
        <Link
          to="/shop"
          className="mt-6 px-6 py-2.5 bg-luxury-red hover:bg-luxury-red-dark text-white rounded text-xs font-bold uppercase tracking-wider shadow"
        >
          Explore Gifts
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <h2 className="font-serif text-2xl font-bold text-luxury-black-dark dark:text-white mb-8">
        Your Shopping Cart
      </h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-4 flex flex-col sm:flex-row gap-4 shadow-sm"
            >
              {/* Product Thumbnail */}
              <img
                src={getAssetUrl(item.image)}
                alt={item.name}
                className="h-24 w-24 rounded-lg object-cover bg-neutral-100 shrink-0 mx-auto sm:mx-0"
              />

              {/* Product Details & Personalizations */}
              <div className="flex-grow space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-serif text-sm font-bold text-luxury-black dark:text-white leading-tight">
                    {item.name}
                  </h4>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="p-1 text-luxury-black/40 dark:text-white/40 hover:text-luxury-red transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Print Personalization notes */}
                <div className="text-[10px] grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-luxury-black/60 dark:text-white/60 bg-luxury-cream/40 dark:bg-luxury-black/20 p-2.5 rounded-lg border border-luxury-gold/5">
                  {item.personalization.deliveryDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-luxury-gold shrink-0" />
                      <span className="truncate">Deliver on: {item.personalization.deliveryDate}</span>
                    </div>
                  )}
                  {item.personalization.deliveryTime && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3 text-luxury-gold shrink-0" />
                      <span className="truncate">Slot: {item.personalization.deliveryTime}</span>
                    </div>
                  )}
                  {item.personalization.greetingCard && (
                    <div className="flex items-center space-x-1">
                      <Ticket className="h-3 w-3 text-luxury-gold shrink-0" />
                      <span className="truncate">Card: {item.personalization.greetingCard}</span>
                    </div>
                  )}
                  {item.personalization.wrap && (
                    <div className="flex items-center space-x-1">
                      <Gift className="h-3 w-3 text-luxury-gold shrink-0" />
                      <span className="truncate">Wrapping: {item.personalization.wrap}</span>
                    </div>
                  )}
                  {item.personalization.customMessage && (
                    <div className="col-span-1 sm:col-span-2 flex items-start space-x-1 pt-0.5 border-t border-luxury-gold/5 mt-0.5">
                      <MessageSquare className="h-3 w-3 text-luxury-gold shrink-0 mt-0.5" />
                      <span className="italic leading-normal">Message: "{item.personalization.customMessage}"</span>
                    </div>
                  )}
                </div>

                {/* Quantity Controls */}
                <div className="flex justify-between items-center pt-2">
                  <div className="flex items-center border border-neutral-300 dark:border-neutral-700 rounded bg-white dark:bg-neutral-800">
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                      className="px-2 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold"
                    >
                      -
                    </button>
                    <span className="px-3 text-xs font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                      className="px-2 py-0.5 hover:bg-neutral-100 dark:hover:bg-neutral-700 text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                  <span className="text-sm font-bold text-luxury-red dark:text-luxury-gold">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>

              </div>
            </div>
          ))}
        </div>

        {/* Right Side: Inquiry Summary Card */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/20 p-5 space-y-4 shadow-md">
            <h3 className="font-serif font-bold text-sm text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2.5">
              Inquiry Summary
            </h3>

            {/* Inquiry details */}
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-luxury-black/60 dark:text-white/60">Total Items</span>
                <span className="font-semibold">{cartItems.length} Hampers</span>
              </div>
              <div className="flex justify-between">
                <span className="text-luxury-black/60 dark:text-white/60">Enquiry Status</span>
                <span className="font-semibold text-green-600">Free to Submit</span>
              </div>
              <div className="flex justify-between border-t border-luxury-gold/15 pt-3 text-sm">
                <span className="font-bold text-luxury-black dark:text-white">Est. Response Time</span>
                <span className="font-bold text-luxury-red dark:text-luxury-gold text-sm">Within 2 Hours</span>
              </div>
            </div>

            {/* Checkout Action */}
            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-lg text-xs uppercase font-bold tracking-widest shadow-md transition-all mt-4"
            >
              <span>Proceed to Inquiry Details</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Cart;
