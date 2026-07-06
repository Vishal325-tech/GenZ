import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Clock, ShoppingCart, Heart, Video, Image, Check, Star, CornerDownRight, MessageCircle, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import CustomCardDesigner from '../components/CustomCardDesigner';
import { Product, getAssetUrl, INITIAL_PRODUCTS } from '../data/initialData';

const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Delivery Scheduler
  const [deliveryDate, setDeliveryDate] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('Afternoon (12:00 PM - 04:00 PM)');

  // Personalization State
  const [personalization, setPersonalization] = useState({
    greetingCard: 'Classic Gold Filigree',
    customMessage: '',
    wrap: 'No Custom Wrapping',
    ribbonColor: 'Gold Shimmer',
    photo: '',
    video: ''
  });

  // Mock Upload states
  const [photoLoading, setPhotoLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewPhoto, setReviewPhoto] = useState('');
  const [reviewMsg, setReviewMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/products/${id}`);
      if (!res.ok) throw new Error('Product not found');
      const data = await res.json();
      setProduct(data);
      setActiveImage(data.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500');

      // Load related items
      const relRes = await fetch(`/api/products?category=${encodeURIComponent(data.category)}`);
      const relData = await relRes.json();
      setRelated(relData.filter((p: Product) => p._id !== data._id).slice(0, 4));
    } catch (err) {
      console.error("Using built-in product data (no backend):", err);
      const staticProd = INITIAL_PRODUCTS.find(p => p._id === id);
      if (staticProd) {
        setProduct(staticProd);
        setActiveImage(staticProd.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500');
        setRelated(INITIAL_PRODUCTS.filter(p => p._id !== id && p.category === staticProd.category).slice(0, 4));
      } else {
        navigate('/shop');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleMockUpload = (type: 'photo' | 'video', e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    
    if (type === 'photo') {
      setPhotoLoading(true);
      setTimeout(() => {
        setPersonalization(prev => ({ ...prev, photo: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300' }));
        setPhotoLoading(false);
      }, 1500);
    } else {
      setVideoLoading(true);
      setTimeout(() => {
        setPersonalization(prev => ({ ...prev, video: 'https://www.w3schools.com/html/mov_bbb.mp4' }));
        setVideoLoading(false);
      }, 2000);
    }
  };

  const handleDesignChange = (design: any) => {
    setPersonalization(prev => ({ ...prev, ...design }));
  };

  const handleAddToCart = () => {
    if (!product) return;
    if (!deliveryDate) {
      alert('Please choose a delivery date before checking out!');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.offerPrice || product.price,
      image: product.images[0],
      personalization: {
        ...personalization,
        deliveryDate,
        deliveryTime
      }
    }, quantity);

    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    if (!deliveryDate) {
      alert('Please select a delivery date before checking out!');
      return;
    }

    addToCart({
      productId: product._id,
      name: product.name,
      price: product.offerPrice || product.price,
      image: product.images[0],
      personalization: {
        ...personalization,
        deliveryDate,
        deliveryTime
      }
    }, quantity);

    navigate('/checkout');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('gift_movers_token');
    if (!token) {
      alert('Please log in to submit a product review.');
      navigate('/login');
      return;
    }

    try {
      const res = await fetch(`/api/products/${id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          rating: reviewRating,
          comment: reviewComment,
          photo: reviewPhoto
        })
      });
      const data = await res.json();
      if (res.ok) {
        setReviewComment('');
        setReviewPhoto('');
        setReviewMsg('Thank you! Your review has been submitted for moderation.');
        setTimeout(() => setReviewMsg(''), 4000);
        loadData();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-3">
        <div className="w-12 h-12 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-luxury-gold animate-pulse">Unveiling gift details...</p>
      </div>
    );
  }

  if (!product) return null;

  const displayPrice = product.offerPrice || product.price;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Product Details Header Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        
        {/* Product Images section */}
        <div className="md:col-span-1 space-y-4">
          <div className="w-full aspect-square bg-white dark:bg-luxury-black rounded-2xl overflow-hidden border border-luxury-gold/20 shadow-lg relative">
            <img
              src={getAssetUrl(activeImage)}
              alt={product.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>

          {/* Thumbnail row selector */}
          <div className="flex space-x-3 overflow-x-auto pb-1">
            {product.images.map((img, index) => (
              <button
                key={index}
                onClick={() => setActiveImage(img)}
                className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                  activeImage === img ? 'border-luxury-gold shadow-md' : 'border-transparent hover:border-luxury-gold/50'
                }`}
              >
                <img src={getAssetUrl(img)} alt={`${product.name} ${index + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Right Column: Title, pricing & Scheduler */}
        <div className="flex flex-col justify-between">
          <div className="space-y-4">
            <span className="text-xs text-luxury-gold font-bold uppercase tracking-widest block">
              {product.category}
            </span>
            <h1 className="font-serif text-2xl sm:text-3xl font-bold text-luxury-black-dark dark:text-white leading-snug">
              {product.name}
            </h1>

            {/* Ratings */}
            <div className="flex items-center space-x-1">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xs">
                    {i < Math.round(product.ratingAverage) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-xs text-luxury-black/50 dark:text-white/50 font-medium">
                ({product.ratingAverage.toFixed(1)} Average / {(product.reviews || []).filter(r => r.approved).length} customer reviews)
              </span>
            </div>

            {/* Pricing replaced with bespoke inquiry status */}
            <div className="flex items-baseline space-x-4 py-2 border-t border-b border-luxury-gold/15">
              <span className="text-sm uppercase tracking-widest font-extrabold text-luxury-gold">
                Elite Bespoke Gift Hamper (Enquiry Only)
              </span>
            </div>

            <p className="text-xs sm:text-sm text-luxury-black/70 dark:text-white/70 leading-relaxed font-light">
              {product.description}
            </p>

            {/* Delivery Date & Time slot scheduler */}
            <div className="p-4 rounded-xl border border-luxury-gold/20 bg-luxury-cream dark:bg-luxury-black-soft space-y-3.5">
              <h4 className="text-xs font-bold text-luxury-black dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <Calendar className="h-4.5 w-4.5 text-luxury-gold" />
                <span>Delivery Date & Time Slot</span>
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-black/60 dark:text-white/60 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    min={new Date().toISOString().split('T')[0]}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-luxury-black dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-luxury-black/60 dark:text-white/60 block mb-1">Time Slot</label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none"
                  >
                    <option>Morning (09:00 AM - 12:00 PM)</option>
                    <option>Afternoon (12:00 PM - 04:00 PM)</option>
                    <option>Evening (04:00 PM - 08:00 PM)</option>
                    <option>Midnight Special (11:00 PM - 12:00 AM) (+₹150)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Custom Photo / Video attachments */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-luxury-black/60 dark:text-white/60 uppercase block">Print Photo Card</label>
                <div className="relative border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 bg-white dark:bg-neutral-800 flex items-center justify-center h-12 hover:border-luxury-gold/50 transition-colors">
                  {photoLoading ? (
                    <span className="text-[10px] animate-pulse">Uploading photo...</span>
                  ) : personalization.photo ? (
                    <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1"><Check className="h-3 w-3" /> Photo Attached</span>
                  ) : (
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <Image className="h-4 w-4 text-luxury-gold" />
                      <span className="text-[10px] font-semibold text-neutral-500">Upload Photo</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleMockUpload('photo', e)} />
                    </label>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-luxury-black/60 dark:text-white/60 uppercase block">Video Greeting Tag</label>
                <div className="relative border border-neutral-300 dark:border-neutral-700 rounded-lg p-2.5 bg-white dark:bg-neutral-800 flex items-center justify-center h-12 hover:border-luxury-gold/50 transition-colors">
                  {videoLoading ? (
                    <span className="text-[10px] animate-pulse">Uploading video...</span>
                  ) : personalization.video ? (
                    <span className="text-[10px] text-green-600 font-semibold flex items-center gap-1"><Check className="h-3 w-3" /> Video Attached</span>
                  ) : (
                    <label className="flex items-center space-x-1.5 cursor-pointer">
                      <Video className="h-4 w-4 text-luxury-gold" />
                      <span className="text-[10px] font-semibold text-neutral-500">Upload Video</span>
                      <input type="file" accept="video/*" className="hidden" onChange={(e) => handleMockUpload('video', e)} />
                    </label>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Enquiry Actions */}
          <div className="space-y-4 pt-6 border-t border-luxury-gold/15">
            <div className="grid grid-cols-2 gap-4">
              <a
                href={`https://wa.me/9108531238?text=${encodeURIComponent(`Hi, I am interested in the ${product.name} from GENZ Royal Hampers.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs uppercase font-bold tracking-widest shadow-md transition-all"
              >
                <MessageCircle className="h-4 w-4" />
                <span>WhatsApp Enquiry</span>
              </a>
              <a
                href={`mailto:contact@genzroyalhampers.com?subject=Enquiry for ${encodeURIComponent(product.name)}`}
                className="flex items-center justify-center space-x-2 py-3 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-lg text-xs uppercase font-bold tracking-widest shadow-lg hover:shadow-red-glow transition-all"
              >
                <Mail className="h-4 w-4" />
                <span>Email Enquiry</span>
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Greeting Card designer section */}
      <section>
        <CustomCardDesigner onDesignChange={handleDesignChange} />
      </section>

      {/* Reviews section */}
      <section className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-6 space-y-6">
        <h3 className="font-serif text-lg font-bold text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2.5">
          Reviews & Feedbacks
        </h3>

        {/* Existing reviews list */}
        <div className="space-y-4">
          {(product.reviews || []).filter(r => r.approved).length === 0 ? (
            <p className="text-xs text-luxury-black/50 dark:text-white/50 italic">No approved reviews yet for this product. Be the first to leave one!</p>
          ) : (
            (product.reviews || []).filter(r => r.approved).map((rev) => (
              <div key={rev._id || Math.random()} className="border-b border-neutral-100 dark:border-neutral-800 pb-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="text-xs font-bold text-luxury-black dark:text-white">{rev.userName}</h5>
                    <div className="flex text-amber-500 mt-0.5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-xs">
                          {i < rev.rating ? '★' : '☆'}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-[10px] text-luxury-black/40 dark:text-white/40">
                    {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <p className="text-xs text-luxury-black/70 dark:text-white/70 leading-relaxed font-light">
                  {rev.comment}
                </p>

                {/* Seller Reply */}
                {rev.reply && (
                  <div className="flex items-start bg-luxury-cream dark:bg-luxury-black p-3 rounded-lg border border-luxury-gold/10 ml-4 space-x-2">
                    <CornerDownRight className="h-4 w-4 text-luxury-gold shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[10px] font-bold text-luxury-red block">GENZ Support</span>
                      <p className="text-xs text-luxury-black/60 dark:text-white/60 leading-relaxed mt-0.5">
                        {rev.reply}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Write Review Form */}
        <form onSubmit={handleReviewSubmit} className="space-y-4 border-t border-luxury-gold/15 pt-6">
          <h4 className="text-xs font-bold text-luxury-black dark:text-white uppercase tracking-wider">Leave a Review</h4>
          
          {reviewMsg && <p className="text-xs text-luxury-gold font-bold">{reviewMsg}</p>}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-bold text-luxury-black/60 dark:text-white/60 uppercase block mb-1">Rating</label>
              <select
                value={reviewRating}
                onChange={(e) => setReviewRating(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white"
              >
                <option value="5">5 Stars (Excellent)</option>
                <option value="4">4 Stars (Good)</option>
                <option value="3">3 Stars (Average)</option>
                <option value="2">2 Stars (Poor)</option>
                <option value="1">1 Star (Very Poor)</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-luxury-black/60 dark:text-white/60 uppercase block mb-1">Upload Photo Card (Optional)</label>
              <input
                type="text"
                placeholder="Paste review image URL..."
                value={reviewPhoto}
                onChange={(e) => setReviewPhoto(e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white"
              />
            </div>
          </div>
          <div>
            <label className="text-[10px] font-bold text-luxury-black/60 dark:text-white/60 uppercase block mb-1">Comment</label>
            <textarea
              required
              rows={3}
              placeholder="Tell us about the gift presentation, wrapping ribbon quality, and delivery speed..."
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              className="w-full px-3 py-2 rounded border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-luxury-red hover:bg-luxury-red-dark text-white rounded text-xs font-bold uppercase tracking-wider shadow"
          >
            Submit Review
          </button>
        </form>

      </section>

      {/* Related Products Section */}
      {related.length > 0 && (
        <section className="space-y-6">
          <h3 className="font-serif text-lg font-bold text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2.5">
            Related Hampers & Gifts
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <div key={p._id} className="scale-95 hover:scale-100 transition-all duration-300">
                {/* Embedded smaller product card representation */}
                <div onClick={() => navigate(`/product/${p._id}`)} className="bg-white dark:bg-luxury-black-soft rounded-xl overflow-hidden border border-luxury-gold/10 shadow-sm cursor-pointer hover:border-luxury-gold/40">
                  <img src={p.images[0]} alt={p.name} className="w-full h-36 object-cover" />
                  <div className="p-3">
                    <h5 className="font-serif text-xs font-bold truncate text-luxury-black dark:text-white">{p.name}</h5>
                    <span className="text-xs font-bold text-luxury-red dark:text-luxury-gold mt-1 block">₹{p.price.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ProductDetails;
