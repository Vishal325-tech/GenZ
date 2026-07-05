import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, Eye, MessageCircle, Mail } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import QuickViewModal from './QuickViewModal';

export interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    offerPrice?: number;
    description: string;
    stock: number;
    category: string;
    images: string[];
    ratingAverage: number;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const [added, setAdded] = useState(false);

  const displayPrice = product.offerPrice || product.price;
  const discountPercent = product.offerPrice
    ? Math.round(((product.price - product.offerPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product._id,
      name: product.name,
      price: displayPrice,
      image: product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
      personalization: {}
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart({
      productId: product._id,
      name: product.name,
      price: displayPrice,
      image: product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500',
      personalization: {}
    });
    navigate('/checkout');
  };

  return (
    <>
      <div
        onClick={() => navigate(`/product/${product._id}`)}
        className="group relative flex flex-col bg-white dark:bg-luxury-black-soft rounded-2xl overflow-hidden border border-luxury-gold/10 hover:border-luxury-gold/50 shadow-md hover:shadow-gold-glow transition-all duration-500 cursor-pointer"
      >
        {/* Badges / Wishlist */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="bg-luxury-red text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {discountPercent}% OFF
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="bg-orange-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
              Only {product.stock} Left!
            </span>
          )}
          {product.stock === 0 && (
            <span className="bg-gray-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase">
              Out of stock
            </span>
          )}
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product._id);
          }}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-white/80 dark:bg-luxury-black-dark/80 border border-luxury-gold/20 hover:scale-110 transition-transform shadow-sm"
        >
          <Heart
            className={`h-4.5 w-4.5 transition-colors ${
              isInWishlist(product._id) ? 'text-luxury-red fill-luxury-red' : 'text-luxury-gold'
            }`}
          />
        </button>

        {/* Product Image */}
        <div className="w-full aspect-[4/5] bg-luxury-cream-dark overflow-hidden relative">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500'}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
          {/* Cover glow overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuickViewOpen(true);
              }}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded bg-white text-luxury-black text-xs font-semibold shadow hover:bg-luxury-gold transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              <span>Quick View</span>
            </button>
          </div>
        </div>

        {/* Information details */}
        <div className="p-4 flex flex-col flex-grow">
          <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-wider mb-1">
            {product.category}
          </span>
          <h4 className="font-serif text-sm font-semibold text-luxury-black-dark dark:text-white line-clamp-1 group-hover:text-luxury-red dark:group-hover:text-luxury-gold transition-colors duration-300">
            {product.name}
          </h4>

          {/* Rating */}
          <div className="flex items-center space-x-1 mt-1 mb-2">
            <div className="flex text-amber-500">
              {[...Array(5)].map((_, i) => (
                <span key={i} className="text-xs">
                  {i < Math.round(product.ratingAverage) ? '★' : '☆'}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-luxury-black/50 dark:text-white/50">
              ({product.ratingAverage.toFixed(1)})
            </span>
          </div>

          <p className="text-xs text-luxury-black/60 dark:text-white/60 line-clamp-2 leading-relaxed mb-4">
            {product.description}
          </p>

          {/* Action buttons - Enquiry Mode */}
          <div className="mt-auto pt-4 border-t border-luxury-gold/10 grid grid-cols-2 gap-2">
            <a
              href={`https://wa.me/9108531238?text=${encodeURIComponent(`Hi, I am interested in the ${product.name} from GENZ Royal Hampers.`)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="py-1.5 bg-green-500 hover:bg-green-600 text-white rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm transition-all flex items-center justify-center space-x-1"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`mailto:contact@genzroyalhampers.com?subject=Enquiry for ${encodeURIComponent(product.name)}`}
              onClick={(e) => e.stopPropagation()}
              className="py-1.5 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider shadow-sm hover:shadow-red-glow transition-all flex items-center justify-center space-x-1"
            >
              <Mail className="h-3.5 w-3.5" />
              <span>Email Us</span>
            </a>
          </div>

        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewOpen && (
        <QuickViewModal
          product={product}
          isOpen={quickViewOpen}
          onClose={() => setQuickViewOpen(false)}
        />
      )}
    </>
  );
};

export default ProductCard;
