import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Check, Calendar, Clock, MapPin, Download, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TrackingItem {
  status: string;
  timestamp: string;
  note?: string;
}

interface Order {
  _id: string;
  customerName: string;
  totalAmount: number;
  orderStatus: 'pending' | 'packed' | 'shipped' | 'delivered' | 'cancelled';
  trackingTimeline: TrackingItem[];
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
  products: Array<{
    productId: string;
    name: string;
    quantity: number;
    price: number;
  }>;
}

const STEPS = [
  { status: 'pending', label: 'Order Registered' },
  { status: 'packed', label: 'Premium Wrapped' },
  { status: 'shipped', label: 'Dispatched Courier' },
  { status: 'delivered', label: 'Gifts Delivered' }
];

const TrackOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = async () => {
    if (!id) return;
    try {
      const res = await fetch(`/api/orders/${id}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });
      if (res.ok) {
        const data = await res.json();
        setOrder(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrderDetails();

    // Auto poll every 10 seconds to show live updates from admin panel status adjustments
    const interval = setInterval(() => {
      fetchOrderDetails();
    }, 10000);

    return () => clearInterval(interval);
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-luxury-gold animate-pulse">Accessing courier tracking...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-luxury-red mx-auto" />
        <h3 className="text-lg font-serif font-bold text-luxury-black dark:text-white">Tracking Record Not Found</h3>
        <p className="text-xs text-neutral-500">
          We couldn't retrieve order tracking details for order ID: <span className="font-mono">{id}</span>.
        </p>
        <Link to="/shop" className="inline-block px-6 py-2 bg-luxury-red text-white text-xs font-bold rounded">
          Back to Shop
        </Link>
      </div>
    );
  }

  // Find index of current status
  const currentStepIndex = STEPS.findIndex(s => s.status === order.orderStatus);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen space-y-8">
      
      {/* Header Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-luxury-gold/15 pb-6 gap-4">
        <div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-luxury-black-dark dark:text-white">
            Delivery Tracking: GM-{order._id.substring(0,8).toUpperCase()}
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Recipient: <span className="font-semibold text-luxury-black dark:text-white">{order.shippingAddress.name}</span>
          </p>
        </div>

        {/* Invoice PDF download */}
        <a
          href={`/api/orders/${order._id}/invoice`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 border border-luxury-gold text-luxury-gold hover:bg-luxury-gold hover:text-luxury-black px-4 py-2 rounded-lg text-xs font-bold transition-all w-fit shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Download Invoice</span>
        </a>
      </div>

      {/* Progress Timeline Stepper */}
      <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-6 md:p-8 shadow-sm">
        
        {/* Horizontal timeline on medium+ screens */}
        <div className="hidden md:flex justify-between items-center relative mb-12">
          {/* Progress bar line backing */}
          <div className="absolute left-[8%] right-[8%] h-0.5 bg-neutral-200 dark:bg-neutral-800 z-0">
            <div
              className="h-full bg-luxury-gold transition-all duration-500"
              style={{ width: `${(Math.max(0, currentStepIndex) / (STEPS.length - 1)) * 100}%` }}
            />
          </div>

          {STEPS.map((s, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            const timelineItem = order.trackingTimeline.find(t => t.status === s.status);

            return (
              <div key={s.status} className="flex flex-col items-center text-center z-10 relative w-1/4">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center transition-all ${
                  isCompleted 
                    ? 'bg-luxury-gold border-luxury-gold text-luxury-black shadow-gold-glow' 
                    : 'bg-white dark:bg-neutral-900 border-neutral-300 text-neutral-400'
                } ${isCurrent ? 'ring-4 ring-luxury-gold/20 scale-110' : ''}`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-semibold">{idx + 1}</span>}
                </div>
                <h5 className={`text-xs font-bold mt-3 ${isCompleted ? 'text-luxury-black dark:text-white' : 'text-neutral-400'}`}>
                  {s.label}
                </h5>
                <span className="text-[9px] text-neutral-400 mt-0.5 font-mono">
                  {timelineItem ? new Date(timelineItem.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* Vertical timeline stepper on mobile */}
        <div className="md:hidden space-y-6">
          {STEPS.map((s, idx) => {
            const isCompleted = idx <= currentStepIndex;
            const timelineItem = order.trackingTimeline.find(t => t.status === s.status);

            return (
              <div key={s.status} className="flex items-start space-x-4">
                <div className={`h-8 w-8 rounded-full border flex items-center justify-center shrink-0 ${
                  isCompleted ? 'bg-luxury-gold border-luxury-gold text-luxury-black' : 'bg-neutral-100 dark:bg-neutral-800 border-neutral-300 text-neutral-400'
                }`}>
                  {isCompleted ? <Check className="h-4 w-4" /> : <span className="text-xs font-semibold">{idx + 1}</span>}
                </div>
                <div>
                  <h5 className={`text-xs font-bold ${isCompleted ? 'text-luxury-black dark:text-white' : 'text-neutral-400'}`}>
                    {s.label}
                  </h5>
                  <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                    {timelineItem ? new Date(timelineItem.timestamp).toLocaleString() : 'Awaiting processing stage'}
                  </p>
                  {timelineItem?.note && (
                    <p className="text-[10px] text-luxury-gold mt-1 italic">Note: "{timelineItem.note}"</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Shipment Specs Grid layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Delivery details */}
        <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-5 space-y-4 shadow-sm">
          <h3 className="font-serif font-bold text-sm text-luxury-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
            Logistics & Schedule
          </h3>
          <ul className="space-y-3 text-xs">
            <li className="flex items-center space-x-2">
              <Calendar className="h-4.5 w-4.5 text-luxury-gold shrink-0" />
              <span>Target Delivery Date: <strong className="text-luxury-black dark:text-white">{order.deliveryDate}</strong></span>
            </li>
            <li className="flex items-center space-x-2">
              <Clock className="h-4.5 w-4.5 text-luxury-gold shrink-0" />
              <span>Preferred Delivery Time: <strong className="text-luxury-black dark:text-white">{order.deliveryTime}</strong></span>
            </li>
            <li className="flex items-start space-x-2">
              <MapPin className="h-4.5 w-4.5 text-luxury-gold shrink-0 mt-0.5" />
              <div>
                <span>Shipping Address:</span>
                <p className="font-medium text-neutral-600 dark:text-neutral-400 mt-1">
                  {order.shippingAddress.name}<br />
                  {order.shippingAddress.street}, {order.shippingAddress.city}<br />
                  {order.shippingAddress.state} - {order.shippingAddress.zip}
                </p>
              </div>
            </li>
          </ul>
        </div>

        {/* Right Column: Gift Hamper Summary */}
        <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-5 space-y-4 shadow-sm">
          <h3 className="font-serif font-bold text-sm text-luxury-black dark:text-white border-b border-neutral-100 dark:border-neutral-800 pb-2">
            Packaged Items
          </h3>
          <div className="space-y-3">
            {order.products.map((p, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs text-neutral-600 dark:text-neutral-400">
                <span className="font-medium">{p.name} <strong className="text-luxury-gold">x {p.quantity}</strong></span>
                <span className="font-bold text-luxury-black dark:text-white">₹{(p.price * p.quantity).toLocaleString()}</span>
              </div>
            ))}
            <div className="border-t border-dashed border-neutral-200 pt-3 flex justify-between font-bold text-xs text-luxury-red dark:text-luxury-gold">
              <span>Amount Paid</span>
              <span>₹{order.totalAmount.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default TrackOrder;
