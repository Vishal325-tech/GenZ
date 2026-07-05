import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Info, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface QuickViewModalProps {
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
  isOpen: boolean;
  onClose: () => void;
}

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const [added, setAdded] = React.useState(false);

  if (!isOpen) return null;

  const displayPrice = product.offerPrice || product.price;

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
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1500);
  };

  const handleDetailsRedirect = () => {
    onClose();
    navigate(`/product/${product._id}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-luxury-black/70 backdrop-blur-sm p-4">
      {/* Background click close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-3xl bg-luxury-cream dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/30 shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 z-10 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-luxury-gold hover:text-luxury-red z-20 transition-colors"
        >
          <X className="h-6 w-6" />
        </button>

        {/* Product Image */}
        <div className="w-full aspect-[4/5] bg-luxury-cream-dark">
          <img
            src={product.images[0] || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500'}
            alt={product.name}
            className="w-full h-full object-cover"
          />
        </div>

        {/* Details Column */}
        <div className="p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="text-[10px] text-luxury-gold font-bold uppercase tracking-widest block mb-1">
              {product.category}
            </span>
            <h3 className="font-serif text-lg md:text-xl font-bold text-luxury-black-dark dark:text-white mb-2">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center space-x-1 mb-4">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-xs">
                    {i < Math.round(product.ratingAverage) ? '★' : '☆'}
                  </span>
                ))}
              </div>
              <span className="text-xs text-luxury-black/50 dark:text-white/50">
                ({product.ratingAverage.toFixed(1)} Rating)
              </span>
            </div>

            {/* Price replaced with bespoke inquiry status */}
            <div className="flex items-baseline space-x-3 mb-6">
              <span className="text-sm uppercase tracking-widest font-bold text-luxury-gold">
                Elite Bespoke Hamper
              </span>
            </div>

            <p className="text-xs md:text-sm text-luxury-black/70 dark:text-white/70 leading-relaxed mb-6">
              {product.description}
            </p>

            {/* Stock indicator */}
            <div className="text-xs mb-6">
              {product.stock > 0 ? (
                <span className="text-green-600 font-semibold">Available for Bespoke Wrapping</span>
              ) : (
                <span className="text-luxury-red font-semibold">Out of Stock</span>
              )}
            </div>
          </div>

          <div className="w-full">
            <button
              onClick={handleDetailsRedirect}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-luxury-red hover:bg-luxury-red-dark text-white rounded-lg text-sm font-semibold shadow-md transition-all"
            >
              <Info className="h-4 w-4" />
              <span>Configure & Enquire Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
