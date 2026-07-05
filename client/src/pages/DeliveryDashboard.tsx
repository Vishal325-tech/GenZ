import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, CheckCircle, ShieldCheck, MapPin, Phone, Calendar, Clock, Loader2, Sparkles, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface OrderProduct {
  productId: string;
  name: string;
  quantity: number;
  price: number;
}

interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  products: OrderProduct[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  deliveryDate: string;
  deliveryTime: string;
  shippingAddress: {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
  };
  deliveryOTP?: string;
}

const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  
  // Dashboard states
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState<Record<string, string>>({});
  const [otpErrors, setOtpErrors] = useState<Record<string, string>>({});
  const [otpSuccess, setOtpSuccess] = useState<Record<string, string>>({});

  const fetchAssignments = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch('/api/orders/delivery/my-assignments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        console.error("Failed to load delivery assignments");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Redirect if not delivery or admin
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role !== 'delivery' && user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAssignments();
  }, [token, user]);

  const handleOtpChange = (orderId: string, val: string) => {
    setOtpInputs(prev => ({ ...prev, [orderId]: val }));
    setOtpErrors(prev => ({ ...prev, [orderId]: '' }));
  };

  const handleVerifyDelivery = async (orderId: string) => {
    const enteredOtp = otpInputs[orderId] || '';
    if (!enteredOtp) {
      setOtpErrors(prev => ({ ...prev, [orderId]: 'Please enter a 6-digit OTP' }));
      return;
    }

    try {
      const res = await fetch(`/api/orders/${orderId}/verify-delivery`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ otp: enteredOtp })
      });
      const data = await res.json();

      if (res.ok) {
        setOtpSuccess(prev => ({ ...prev, [orderId]: 'Order verified and delivered!' }));
        fetchAssignments(); // reload listings
      } else {
        setOtpErrors(prev => ({ ...prev, [orderId]: data.message || 'OTP verification failed' }));
      }
    } catch (err) {
      console.error(err);
      setOtpErrors(prev => ({ ...prev, [orderId]: 'Network error. Please try again.' }));
    }
  };

  const handleLogoutClick = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-luxury-black-dark transition-colors duration-300 pb-12">
      
      {/* Premium Header */}
      <header className="bg-luxury-black border-b border-luxury-gold/25 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-luxury-gold/15 rounded-lg border border-luxury-gold/30">
              <Truck className="h-6 w-6 text-luxury-gold animate-pulse" />
            </div>
            <div>
              <h1 className="font-serif text-lg md:text-xl font-bold tracking-wider text-white">
                Gajanana Royal Hampers
              </h1>
              <span className="text-[10px] text-luxury-gold uppercase tracking-widest font-semibold">
                Delivery Executive Console
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-4 text-white">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-bold">{user?.name || 'Raju Delivery executive'}</p>
              <p className="text-[9px] text-neutral-400 font-mono">Agent ID: #{user?._id?.substring(0,8).toUpperCase()}</p>
            </div>
            <button
              onClick={handleLogoutClick}
              className="p-2.5 rounded-full border border-neutral-700 bg-neutral-800 text-neutral-400 hover:text-luxury-red hover:border-luxury-red transition-all"
              title="Logout"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Listings */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        <div className="flex items-center justify-between border-b border-luxury-gold/15 pb-4 mb-8">
          <div>
            <h2 className="font-serif text-xl font-bold text-luxury-black-dark dark:text-white flex items-center gap-1.5">
              <Sparkles className="h-5 w-5 text-luxury-gold" />
              <span>Assigned Deliveries</span>
            </h2>
            <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-1">
              Verify customer details, plan routes, and verify 6-digit OTP codes to complete deliveries.
            </p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full border border-luxury-gold bg-luxury-gold/5 text-luxury-gold font-mono">
            {orders.length} Deliveries Pending
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 text-luxury-gold space-y-2">
            <Loader2 className="h-10 w-10 animate-spin" />
            <span className="text-xs uppercase tracking-widest font-bold">Accessing assigned schedules...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white dark:bg-luxury-black-soft border border-luxury-gold/15 p-12 rounded-2xl text-center space-y-4 shadow-md max-w-xl mx-auto">
            <span className="text-4xl block">✨</span>
            <h3 className="font-serif font-bold text-sm text-luxury-black dark:text-white">All caught up! No deliveries assigned.</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Check in with the admin panel to assign deliveries.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div 
                key={order._id}
                className="bg-white dark:bg-luxury-black-soft border border-luxury-gold/15 rounded-2xl p-5 md:p-6 shadow-md transition-all hover:border-luxury-gold grid grid-cols-1 md:grid-cols-3 gap-6"
              >
                
                {/* Left Side: Client & Schedule */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="bg-luxury-gold/10 text-luxury-gold-dark dark:text-luxury-gold text-[9px] font-bold px-2 py-0.5 rounded-full border border-luxury-gold/20 uppercase font-mono">
                      Order GRH-{order._id.substring(0,8).toUpperCase()}
                    </span>
                    <h4 className="font-serif text-sm font-bold text-luxury-black-dark dark:text-white pt-1">
                      {order.shippingAddress.name}
                    </h4>
                    <p className="text-[10px] text-neutral-400 truncate">{order.customerEmail}</p>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300">
                      <Calendar className="h-4 w-4 text-luxury-gold shrink-0" />
                      <span>Date: {order.deliveryDate}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300">
                      <Clock className="h-4 w-4 text-luxury-gold shrink-0" />
                      <span>Slot: {order.deliveryTime}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-neutral-600 dark:text-neutral-300">
                      <Phone className="h-4 w-4 text-luxury-gold shrink-0" />
                      <span>Phone: <a href={`tel:${order.shippingAddress.phone}`} className="hover:underline font-bold text-luxury-gold">{order.shippingAddress.phone}</a></span>
                    </div>
                  </div>
                </div>

                {/* Middle: Map Route & Address Details */}
                <div className="space-y-3.5 border-t md:border-t-0 md:border-l md:border-r border-luxury-gold/10 md:px-6 pt-4 md:pt-0">
                  <div className="flex items-start space-x-2 text-xs">
                    <MapPin className="h-4.5 w-4.5 text-luxury-red shrink-0" />
                    <div>
                      <span className="font-bold block text-luxury-black dark:text-white text-[11px] uppercase tracking-wider">Delivery Address</span>
                      <p className="text-neutral-500 dark:text-neutral-300 mt-1 leading-relaxed text-[11px]">
                        {order.shippingAddress.street}, {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.zip}
                      </p>
                    </div>
                  </div>

                  {/* Route Link Placeholder */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${order.shippingAddress.street}, ${order.shippingAddress.city}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 border border-luxury-gold/30 hover:border-luxury-gold hover:bg-luxury-gold/5 px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold text-luxury-gold tracking-wide transition-all"
                  >
                    <span>View Map Route</span>
                  </a>
                </div>

                {/* Right Side: Verification and Action */}
                <div className="flex flex-col justify-between pt-4 md:pt-0 border-t md:border-t-0 border-luxury-gold/10">
                  <div className="space-y-3">
                    <span className="text-[11px] font-bold block text-neutral-500 uppercase tracking-wider">
                      Delivery Verification
                    </span>

                    {order.orderStatus === 'delivered' ? (
                      <div className="flex items-center space-x-1.5 text-green-600 bg-green-50 dark:bg-green-950/15 p-3 rounded-lg border border-green-500/10 text-xs">
                        <CheckCircle className="h-4.5 w-4.5" />
                        <span className="font-bold">Delivered & Closed</span>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-[10px] text-neutral-400">
                          Ask customer for verification code received in their notifications/email.
                        </p>
                        
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            maxLength={6}
                            value={otpInputs[order._id] || ''}
                            onChange={(e) => handleOtpChange(order._id, e.target.value)}
                            className="w-full px-3 py-2 text-center text-xs tracking-widest font-mono rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-luxury-black dark:text-white focus:outline-none focus:border-luxury-gold"
                          />
                          <button
                            onClick={() => handleVerifyDelivery(order._id)}
                            className="bg-luxury-red hover:bg-luxury-red-dark text-white px-4 rounded-lg text-xs font-bold uppercase tracking-wider shrink-0 transition-all shadow-sm"
                          >
                            Verify
                          </button>
                        </div>

                        {otpErrors[order._id] && (
                          <p className="text-[10px] text-luxury-red font-semibold">{otpErrors[order._id]}</p>
                        )}
                        {otpSuccess[order._id] && (
                          <p className="text-[10px] text-green-600 font-semibold">{otpSuccess[order._id]}</p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="border-t border-luxury-gold/10 pt-3 mt-4 flex items-center justify-between text-[10px] text-neutral-400 font-medium">
                    <span>Amount to Collect:</span>
                    <span className="font-serif font-bold text-sm text-luxury-red dark:text-luxury-gold">
                      {order.paymentMethod === 'cod' ? `₹${order.totalAmount.toLocaleString()} (COD)` : '₹0.00 (PAID ONLINE)'}
                    </span>
                  </div>

                </div>

              </div>
            ))}
          </div>
        )}

      </main>

    </div>
  );
};

export default DeliveryDashboard;
