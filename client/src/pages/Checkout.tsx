import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, CreditCard, Landmark, Check, QrCode, Search, Gift } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import PaymentSimulator from '../components/PaymentSimulator';

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, cartSubtotal, cartTotal, coupon, discountAmount, applyCoupon, removeCoupon, clearCart } = useCart();
  const { user, token } = useAuth();

  // Address fields
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');

  // Map state
  const [searchMapQuery, setSearchMapQuery] = useState('');
  const [selectedCoordinates, setSelectedCoordinates] = useState('12.9716° N, 77.5946° E');
  const [locating, setLocating] = useState(false);

  // Coupon state
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState('stripe_card');
  const [showSimulator, setShowSimulator] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleMapLocate = () => {
    setLocating(true);
    setTimeout(() => {
      setLocating(false);
      setStreet('Gold Palace Residency, Palace Road');
      setCity('Bangalore');
      setState('Karnataka');
      setZip('560052');
      setSelectedCoordinates('12.9984° N, 77.5921° E');
      setSearchMapQuery('Bangalore Palace, Vasanth Nagar');
    }, 1200);
  };

  const handleMapSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchMapQuery.trim()) {
      setLocating(true);
      setTimeout(() => {
        setLocating(false);
        setStreet(`${searchMapQuery.trim()}, High Street`);
        setCity('Bangalore');
        setState('Karnataka');
        setZip('560001');
        setSelectedCoordinates(`${(12.9 + Math.random() * 0.1).toFixed(4)}° N, ${(77.5 + Math.random() * 0.1).toFixed(4)}° E`);
      }, 1000);
    }
  };

  const handleCouponApply = async (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    setCouponSuccess('');
    if (!couponInput.trim()) return;

    try {
      const msg = await applyCoupon(couponInput.trim());
      setCouponSuccess(msg);
      setCouponInput('');
    } catch (err: any) {
      setCouponError(err.message || 'Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    removeCoupon();
    setCouponSuccess('');
    setCouponError('');
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !street || !city || !state || !zip) {
      alert('Please fill out all shipping address logistics.');
      return;
    }

    if (paymentMethod === 'cod') {
      executeOrderCreation('COD_SANDBOX_SUCCESS');
    } else {
      setShowSimulator(true);
    }
  };

  const executeOrderCreation = async (receiptId: string) => {
    setLoading(true);
    setShowSimulator(false);
    try {
      const shippingFee = cartSubtotal >= 2500 ? 0 : 150;
      const orderPayload = {
        products: cartItems.map(item => ({
          productId: item.productId,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          personalization: item.personalization
        })),
        totalAmount: cartTotal + shippingFee,
        couponUsed: coupon?.code || '',
        discountAmount,
        shippingAddress: { name, phone, street, city, state, zip },
        paymentMethod,
        deliveryDate: cartItems[0]?.personalization.deliveryDate || new Date().toLocaleDateString(),
        deliveryTime: cartItems[0]?.personalization.deliveryTime || 'Afternoon (12:00 PM - 04:00 PM)'
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(orderPayload)
      });
      const data = await res.json();

      if (res.ok) {
        clearCart();
        navigate(`/track-order/${data._id}`);
      } else {
        alert(data.message || 'Failed to submit order.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error. Failed to create order.');
    } finally {
      setLoading(false);
    }
  };

  const shippingFee = cartSubtotal >= 2500 ? 0 : 150;
  const finalPayable = cartTotal + shippingFee;

  if (cartItems.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h3 className="text-lg font-bold font-serif text-luxury-black dark:text-white">Your checkout cart is empty!</h3>
        <button onClick={() => navigate('/shop')} className="mt-4 px-6 py-2 bg-luxury-red text-white text-xs font-semibold rounded-full shadow-md hover:bg-luxury-red-dark transition-all">
          Back to Shop
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      <div className="flex items-center space-x-2.5 mb-8">
        <Gift className="h-6 w-6 text-luxury-gold" />
        <h2 className="font-serif text-2xl font-bold text-luxury-black-dark dark:text-white">
          Secure Royal Checkout
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Forms */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmitOrder} className="space-y-6">
            
            {/* Delivery address */}
            <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-5 space-y-4 shadow-md">
              <h3 className="font-serif font-bold text-sm text-luxury-black dark:text-white flex justify-between items-center border-b border-luxury-gold/15 pb-2">
                <span>Shipping Address</span>
                <button
                  type="button"
                  onClick={handleMapLocate}
                  className="text-[10px] font-bold text-luxury-gold hover:text-luxury-gold-dark border border-luxury-gold/30 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-luxury-gold/5"
                >
                  <MapPin className="h-3 w-3 animate-bounce" />
                  <span>{locating ? 'Locating...' : 'Auto-Fill Location'}</span>
                </button>
              </h3>

              {/* Map Simulator */}
              <div className="rounded-xl overflow-hidden border border-luxury-gold/10 relative h-48 bg-neutral-900 shadow-inner">
                {/* Search bar inside map */}
                <div className="absolute top-3 left-3 right-3 z-10 flex gap-2">
                  <div className="flex-grow flex items-center bg-white/95 dark:bg-neutral-900/95 backdrop-blur rounded-lg border border-luxury-gold/25 px-2.5 shadow-md">
                    <Search className="h-3.5 w-3.5 text-luxury-gold shrink-0 mr-1.5" />
                    <input
                      type="text"
                      placeholder="Search landmark, colony, or building..."
                      value={searchMapQuery}
                      onChange={(e) => setSearchMapQuery(e.target.value)}
                      className="w-full bg-transparent border-none text-[11px] py-1.5 focus:outline-none text-luxury-black dark:text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleMapSearch}
                    className="bg-luxury-gold hover:bg-luxury-gold-hover text-luxury-black px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider shadow-md shrink-0"
                  >
                    Locate
                  </button>
                </div>

                {/* Map Graphics */}
                <div className="absolute inset-0 bg-neutral-900 opacity-90 flex flex-col items-center justify-center p-4 text-center">
                  <MapPin className="h-8 w-8 text-luxury-red mb-1 animate-pulse" />
                  <span className="text-xs text-white font-bold tracking-wide">Google Maps Simulator</span>
                  <span className="text-[10px] text-luxury-gold font-mono mt-0.5">{selectedCoordinates}</span>
                  {street && <span className="text-[10px] text-neutral-300 max-w-xs mt-1 truncate">{street}, {city}</span>}
                </div>
                
                {/* Visual Grid Lines */}
                <div className="w-full h-full opacity-10 bg-[linear-gradient(rgba(212,175,55,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(212,175,55,0.2)_1px,transparent_1px)] bg-[size:15px_15px]" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">City</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">State</label>
                  <input
                    type="text"
                    required
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">ZIP Code</label>
                  <input
                    type="text"
                    required
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none focus:ring-1 focus:ring-luxury-gold"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method selection */}
            <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-5 space-y-4 shadow-md">
              <h3 className="font-serif font-bold text-sm text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2">
                Choose Payment Method
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'stripe_card' ? 'border-luxury-gold bg-luxury-cream text-luxury-black' : 'border-neutral-200 dark:border-neutral-700'
                }`}>
                  <div className="flex items-center space-x-3">
                    <CreditCard className="h-5 w-5 text-luxury-gold" />
                    <div>
                      <span className="text-xs font-semibold block">Stripe Gateway</span>
                      <span className="text-[9px] text-neutral-400">Pay securely via Credit Card</span>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="stripe_card" checked={paymentMethod === 'stripe_card'} onChange={() => setPaymentMethod('stripe_card')} className="accent-luxury-red" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'razorpay' ? 'border-luxury-gold bg-luxury-cream text-luxury-black' : 'border-neutral-200 dark:border-neutral-700'
                }`}>
                  <div className="flex items-center space-x-3">
                    <Landmark className="h-5 w-5 text-luxury-gold" />
                    <div>
                      <span className="text-xs font-semibold block">Razorpay Gateway</span>
                      <span className="text-[9px] text-neutral-400">Net Banking & Wallet support</span>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="razorpay" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="accent-luxury-red" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'upi' ? 'border-luxury-gold bg-luxury-cream text-luxury-black' : 'border-neutral-200 dark:border-neutral-700'
                }`}>
                  <div className="flex items-center space-x-3">
                    <QrCode className="h-5 w-5 text-luxury-gold" />
                    <div>
                      <span className="text-xs font-semibold block">UPI Transaction</span>
                      <span className="text-[9px] text-neutral-400">Scan code on PhonePe/GPay</span>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="upi" checked={paymentMethod === 'upi'} onChange={() => setPaymentMethod('upi')} className="accent-luxury-red" />
                </label>

                <label className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'border-luxury-gold bg-luxury-cream text-luxury-black' : 'border-neutral-200 dark:border-neutral-700'
                }`}>
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">🚚</span>
                    <div>
                      <span className="text-xs font-semibold block">Cash on Delivery</span>
                      <span className="text-[9px] text-neutral-400">Pay when executive delivers</span>
                    </div>
                  </div>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="accent-luxury-red" />
                </label>
              </div>
            </div>

            {/* Place Order button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-xl text-xs uppercase font-bold tracking-widest shadow-md hover:shadow-red-glow transition-all flex items-center justify-center space-x-2"
            >
              <span>{loading ? 'Processing Order...' : `Proceed to Pay ₹${finalPayable.toLocaleString()}`}</span>
            </button>

          </form>
        </div>

        {/* Right Side: Order summary & coupons */}
        <div className="space-y-6">
          
          {/* Summary */}
          <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-5 space-y-4 shadow-md">
            <h3 className="font-serif font-bold text-sm text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2">
              Order Summary
            </h3>

            <div className="max-h-48 overflow-y-auto space-y-3.5 pr-1">
              {cartItems.map(item => (
                <div key={item.productId} className="flex justify-between items-start text-xs">
                  <div className="overflow-hidden mr-2">
                    <h5 className="font-bold truncate">{item.name}</h5>
                    <span className="text-[10px] text-neutral-400">Quantity: {item.quantity}</span>
                    {item.personalization.customMessage && (
                      <span className="text-[8px] italic text-luxury-gold block truncate">Msg: "{item.personalization.customMessage}"</span>
                    )}
                  </div>
                  <span className="font-bold text-neutral-600 dark:text-neutral-300">
                    ₹{(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-luxury-gold/15 pt-3 space-y-2 text-xs">
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Subtotal</span>
                <span>₹{cartSubtotal.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600 font-medium">
                  <span>Discount ({coupon?.code})</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-neutral-600 dark:text-neutral-400">
                <span>Shipping Logistics</span>
                <span>{shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}</span>
              </div>
              <div className="flex justify-between font-bold text-base text-luxury-red dark:text-luxury-gold pt-2 border-t border-dashed border-neutral-200">
                <span>Grand Total</span>
                <span>₹{finalPayable.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 text-[10px] text-green-600 bg-green-50 dark:bg-green-950/10 p-2.5 rounded-lg border border-green-500/10">
              <ShieldCheck className="h-4.5 w-4.5 shrink-0" />
              <span>SSL Secured & Verified Royal Payment Session</span>
            </div>
          </div>

          {/* Coupon Code section */}
          <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-5 space-y-3.5 shadow-md">
            <h4 className="font-serif font-bold text-xs text-luxury-black dark:text-white uppercase tracking-wider">
              Apply Promo Code
            </h4>
            
            {coupon ? (
              <div className="flex items-center justify-between bg-green-50 dark:bg-green-950/10 border border-green-500/20 p-2.5 rounded-lg text-xs">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <div>
                    <span className="font-bold text-green-600">{coupon.code}</span>
                    <span className="text-[9px] text-neutral-400 block">{coupon.discountPercent}% Discount Applied</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveCoupon}
                  className="text-[10px] font-bold text-luxury-red hover:underline uppercase"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleCouponApply} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. LUXURY15"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-grow px-3 py-2 text-xs rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                />
                <button
                  type="submit"
                  className="bg-luxury-gold hover:bg-luxury-gold-hover text-luxury-black px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider shadow-sm transition-all"
                >
                  Apply
                </button>
              </form>
            )}

            {couponError && <p className="text-[10px] text-luxury-red font-semibold">{couponError}</p>}
            {couponSuccess && <p className="text-[10px] text-green-600 font-semibold">{couponSuccess}</p>}
            
            <p className="text-[9px] text-neutral-400 leading-normal">
              Try using code <span className="font-bold text-luxury-gold">LUXURY15</span> or <span className="font-bold text-luxury-gold">FESTIVAL50</span> to get special seasonal offers on checkout.
            </p>
          </div>

        </div>

      </div>

      {/* Simulator Modal popup */}
      {showSimulator && (
        <PaymentSimulator
          amount={finalPayable}
          method={paymentMethod === 'stripe_card' ? 'card' : paymentMethod}
          onPaymentSuccess={executeOrderCreation}
          onPaymentCancel={() => setShowSimulator(false)}
        />
      )}

    </div>
  );
};

export default Checkout;
