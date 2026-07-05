import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Sparkles, Heart, Award, ArrowLeft, Loader2 } from 'lucide-react';
import ProductCard from '../components/ProductCard';

interface Product {
  _id: string;
  name: string;
  price: number;
  offerPrice?: number;
  description: string;
  stock: number;
  category: string;
  images: string[];
  ratingAverage: number;
  tags?: string[];
}

interface OccasionDetail {
  title: string;
  subtitle: string;
  desc: string;
  bannerImg: string;
  gradient: string;
}

const OCCASION_DATA: Record<string, OccasionDetail> = {
  Birthday: {
    title: "Royal Birthday Hampers",
    subtitle: "Celebrate Another Beautiful Year",
    desc: "Make their special day truly unforgettable with our meticulously curated collection of gold-foil birthday hampers, gourmet cake combinations, hand-tied rose bouquets, and velvet-plush teddy bears.",
    bannerImg: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1200",
    gradient: "from-pink-500/10 via-amber-500/5 to-transparent"
  },
  Anniversary: {
    title: "Golden Anniversary Curation",
    subtitle: "To Everlasting Love & Milestones",
    desc: "Commemorate silver, golden, and relationship milestones. Exquisite hampers containing gold-rimmed customization mugs, premium imported chocolates, room fragrances, and handwritten wax-sealed letters.",
    bannerImg: "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=1200",
    gradient: "from-amber-600/10 via-yellow-500/5 to-transparent"
  },
  Wedding: {
    title: "Imperial Wedding Curation",
    subtitle: "A Grand Start to Forever",
    desc: "Congratulate newlyweds with regal corporate trays, silver-plated dinnerware, premium dry-fruit selections, and premium custom packaging bound with elegant silk mesh ribbons.",
    bannerImg: "https://images.unsplash.com/photo-1519741497674-611481863552?w=1200",
    gradient: "from-red-600/10 via-amber-600/5 to-transparent"
  },
  "Valentine's Day": {
    title: "Crimson Romance Collection",
    subtitle: "Express Your Deepest Affection",
    desc: "Ignite romantic memories with single-origin dark chocolate truffles, crimson velvet rose baskets, matching custom jewelry pieces, and customizable video card messages.",
    bannerImg: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=1200",
    gradient: "from-rose-700/10 via-pink-600/5 to-transparent"
  },
  "Baby Shower": {
    title: "Sweet Baby Shower Delights",
    subtitle: "Welcome the New Bundle of Joy",
    desc: "Celebrate expectant mothers with newborn clothing essentials, organic baby products, giant plush toy bears, and baby-wrapped chocolate hampers.",
    bannerImg: "https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1200",
    gradient: "from-blue-400/10 via-pink-400/5 to-transparent"
  },
  "Mother's Day": {
    title: "Empress Mother's Day Tribute",
    subtitle: "Honoring Her Grace & Love",
    desc: "Pamper the queen of your life with customized self-care gift boxes, wellness teas, premium floral mugs, and luxury chocolate selections.",
    bannerImg: "https://images.unsplash.com/photo-1544816155-12df9643f363?w=1200",
    gradient: "from-purple-500/10 via-pink-400/5 to-transparent"
  },
  "Father's Day": {
    title: "Regal Father's Day Curation",
    subtitle: "Saluting Strength & Leadership",
    desc: "Present your appreciation with executive organizer kits, customized travel flasks, rich roasted coffee bean sets, and dark chocolate selections wrapped in black satin ribbon.",
    bannerImg: "https://images.unsplash.com/photo-1550305080-4e029753abcf?w=1200",
    gradient: "from-slate-600/10 via-blue-900/5 to-transparent"
  },
  "House Warming": {
    title: "Elegant Housewarming Assortment",
    subtitle: "Blessing New Thresholds & Homes",
    desc: "Greet new homeowners with aromatic diffusers, luxury soy wax candles, ceramic mugs, customized keychains, and fresh lucky bamboo arrangements.",
    bannerImg: "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200",
    gradient: "from-teal-600/10 via-amber-500/5 to-transparent"
  },
  Congratulations: {
    title: "Triumphant Success Hampers",
    subtitle: "Celebrate Great Achievements",
    desc: "Raise a toast with sparkling non-alcoholic wine, gold-foiled congratulations cards, gourmet cookies, and exotic orchids to salute achievements.",
    bannerImg: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=1200",
    gradient: "from-green-600/10 via-amber-600/5 to-transparent"
  },
  Graduation: {
    title: "Distinguished Graduate Trays",
    subtitle: "To Bright Horizons & Careers",
    desc: "Send warm wishes for their professional launch with leather organizers, customized journals, wellness chocolates, and fresh yellow lilies.",
    bannerImg: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200",
    gradient: "from-cyan-600/10 via-indigo-600/5 to-transparent"
  },
  Festivals: {
    title: "Festive Shimmer & Joy Hampers",
    subtitle: "Illuminating Indian Celebrations",
    desc: "Bring shine to Diwali, Eid, and Christmas festivities. Handmade terracotta lamps, sweet boxes, gourmet almond boxes, and custom greetings bound in gold mesh.",
    bannerImg: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=1200",
    gradient: "from-orange-600/10 via-yellow-600/5 to-transparent"
  }
};

const OccasionPage: React.FC = () => {
  const { occasionName } = useParams<{ occasionName: string }>();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Decode the URL param
  const occasionKey = occasionName ? decodeURIComponent(occasionName) : '';
  const occasion = OCCASION_DATA[occasionKey] || {
    title: `${occasionKey} Hampers`,
    subtitle: "Premium Curation for Special Moments",
    desc: `Explore our custom collection of Gajanana Royal Hampers specifically designed for ${occasionKey}. Choose gift boxes, greetings, and schedules easily at checkout.`,
    bannerImg: "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=1200",
    gradient: "from-amber-500/10 via-neutral-900/5 to-transparent"
  };

  useEffect(() => {
    const fetchOccasionProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/products`);
        if (res.ok) {
          const allProds: Product[] = await res.json();
          const filtered = allProds.filter(p => {
            const tagMatch = p.tags?.some(t => t.toLowerCase() === occasionKey.toLowerCase());
            const catMatch = p.category.toLowerCase().includes(occasionKey.toLowerCase());
            const nameMatch = p.name.toLowerCase().includes(occasionKey.toLowerCase());
            return tagMatch || catMatch || nameMatch;
          });
          
          if (filtered.length > 0) {
            setProducts(filtered);
          } else {
            setProducts(allProds.slice(0, 4));
          }
        }
      } catch (err) {
        console.error("Failed to load occasion products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOccasionProducts();
  }, [occasionKey]);

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-luxury-black-dark transition-colors duration-300">
      
      {/* Back button */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-luxury-gold hover:text-luxury-red transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Home</span>
        </button>
      </div>

      {/* Hero Banner Section */}
      <section className="relative max-w-7xl mx-auto mx-4 sm:mx-6 lg:mx-8 my-6 rounded-3xl overflow-hidden border border-luxury-gold/20 shadow-2xl h-[450px] flex items-center bg-cover bg-center"
        style={{ backgroundImage: `url('${occasion.bannerImg}')` }}>
        
        {/* Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-luxury-black/95 via-luxury-black/75 to-transparent" />
        
        <div className="relative z-10 max-w-2xl px-6 sm:px-12 text-white space-y-4">
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full border border-luxury-gold/40 bg-luxury-gold/5 text-luxury-gold text-[10px] uppercase font-bold tracking-widest animate-pulse">
            <Sparkles className="h-3 w-3" />
            <span>{occasion.subtitle}</span>
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-white leading-tight">
            {occasion.title}
          </h1>
          <p className="text-sm text-neutral-300 leading-relaxed font-light">
            {occasion.desc}
          </p>
          <div className="flex items-center space-x-2 pt-2 text-xs text-luxury-gold font-bold uppercase tracking-wider">
            <Award className="h-4.5 w-4.5" />
            <span>Gajanana Royal Curation Seal</span>
          </div>
        </div>

        {/* Ambient Sparkles */}
        <div className="absolute inset-0 pointer-events-none z-0">
          {[...Array(6)].map((_, i) => {
            const top = Math.random() * 80;
            const left = Math.random() * 80;
            const delay = Math.random() * 5;
            return (
              <span
                key={i}
                className="absolute text-yellow-300 text-sm animate-ping opacity-60"
                style={{
                  top: `${top}%`,
                  left: `${left}%`,
                  animationDelay: `${delay}s`,
                  animationDuration: '3s'
                }}
              >
                ✨
              </span>
            );
          })}
        </div>
      </section>

      {/* Products Grid list */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="border-b border-luxury-gold/15 pb-4 mb-8">
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-luxury-black-dark dark:text-white flex items-center gap-2">
            <Heart className="h-5.5 w-5.5 text-luxury-red animate-pulse" />
            <span>Curated Gifting Box Hampers</span>
          </h2>
          <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-1">
            Choose from our premium items, personalize wrap styling, and choose delivery date & time at checkout.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-luxury-gold space-y-2">
            <Loader2 className="h-10 w-10 animate-spin" />
            <span className="text-xs uppercase tracking-widest font-bold">Unboxing occasion hampers...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        )}
      </section>

    </div>
  );
};

export default OccasionPage;
