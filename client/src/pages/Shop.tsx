import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
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

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [selectedOccasion, setSelectedOccasion] = useState(searchParams.get('occasion') || '');
  const [selectedTag, setSelectedTag] = useState(searchParams.get('tag') || '');
  const [priceRange, setPriceRange] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Trigger load when query or filter changes
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        const search = searchParams.get('search');
        if (search) query.append('search', search);

        // Map Category/Occasion if selected in filters
        if (selectedCategory) query.append('category', selectedCategory);
        if (selectedTag) query.append('tag', selectedTag);
        
        // Price Ranges
        if (priceRange === 'under_1500') {
          query.append('maxPrice', '1500');
        } else if (priceRange === '1500_3000') {
          query.append('minPrice', '1500');
          query.append('maxPrice', '3000');
        } else if (priceRange === 'above_3000') {
          query.append('minPrice', '3000');
        }

        query.append('sort', sortBy);

        const res = await fetch(`/api/products?${query.toString()}`);
        const data = await res.json();
        
        let filteredData = data;
        // Occasion is a tag or subcategory filter in this setup
        if (selectedOccasion) {
          filteredData = data.filter((p: Product) => 
            p.category.toLowerCase() === selectedOccasion.toLowerCase() ||
            p.description.toLowerCase().includes(selectedOccasion.toLowerCase()) ||
            p.name.toLowerCase().includes(selectedOccasion.toLowerCase())
          );
        }

        setProducts(filteredData);
      } catch (err) {
        console.error('Failed to load shop items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams, selectedCategory, selectedOccasion, selectedTag, priceRange, sortBy]);

  // Sync state if URL changes directly
  useEffect(() => {
    setSelectedCategory(searchParams.get('category') || '');
    setSelectedOccasion(searchParams.get('occasion') || '');
    setSelectedTag(searchParams.get('tag') || '');
  }, [searchParams]);

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedOccasion('');
    setSelectedTag('');
    setPriceRange('');
    setSortBy('newest');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      
      {/* Search status header */}
      <div className="mb-8">
        <h2 className="font-serif text-2xl font-bold text-luxury-black-dark dark:text-white">
          {searchParams.get('search') ? `Search Results for "${searchParams.get('search')}"` : 'Luxury Gift Catalog'}
        </h2>
        <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-1">
          Showing {products.length} elegant collection items
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6 lg:sticky lg:top-24 h-fit">
          <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/20 p-5 space-y-5">
            <div className="flex items-center justify-between border-b border-luxury-gold/15 pb-2.5">
              <span className="font-serif font-bold text-sm text-luxury-black dark:text-white flex items-center gap-1.5">
                <SlidersHorizontal className="h-4.5 w-4.5 text-luxury-gold" />
                <span>Filters</span>
              </span>
              <button
                onClick={clearFilters}
                className="text-[10px] uppercase font-bold text-luxury-red hover:underline"
              >
                Clear All
              </button>
            </div>

            {/* Category Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-luxury-gold block mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none"
              >
                <option value="">All Categories</option>
                <option value="Luxury Gift Hampers">Luxury Gift Hampers</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Birthday">Birthday</option>
                <option value="Flowers">Flowers</option>
                <option value="Chocolate Hampers">Chocolate Hampers</option>
                <option value="Teddy Bears">Teddy Bears</option>
                <option value="Customized Gifts">Customized Gifts</option>
                <option value="Baby Gifts">Baby Gifts</option>
              </select>
            </div>

            {/* Occasion Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-luxury-gold block mb-2">Occasion</label>
              <select
                value={selectedOccasion}
                onChange={(e) => setSelectedOccasion(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none"
              >
                <option value="">All Occasions</option>
                <option value="Birthday">Birthday</option>
                <option value="Anniversary">Anniversary</option>
                <option value="Valentine's Day">Valentine's Day</option>
                <option value="Wedding">Wedding</option>
                <option value="Congratulations">Congratulations</option>
                <option value="House Warming">House Warming</option>
              </select>
            </div>

            {/* Price Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-luxury-gold block mb-2">Budget (Price)</label>
              <div className="flex flex-col space-y-1.5 text-xs text-neutral-600 dark:text-neutral-400">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="under_1500"
                    checked={priceRange === 'under_1500'}
                    onChange={() => setPriceRange('under_1500')}
                    className="accent-luxury-red"
                  />
                  <span>Under ₹1,500</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="1500_3000"
                    checked={priceRange === '1500_3000'}
                    onChange={() => setPriceRange('1500_3000')}
                    className="accent-luxury-red"
                  />
                  <span>₹1,500 - ₹3,000</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="radio"
                    name="price"
                    value="above_3000"
                    checked={priceRange === 'above_3000'}
                    onChange={() => setPriceRange('above_3000')}
                    className="accent-luxury-red"
                  />
                  <span>Above ₹3,000</span>
                </label>
              </div>
            </div>

            {/* Recipient tags */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-luxury-gold block mb-2">Signature Badges</label>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none"
              >
                <option value="">All Items</option>
                <option value="featured">Featured Product</option>
                <option value="trending">Trending Product</option>
                <option value="best_seller">Best Seller</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-luxury-gold block mb-2 flex items-center gap-1">
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>Sort By</span>
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white focus:outline-none"
              >
                <option value="newest">Newest Additions</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="popular">Customer Popularity</option>
              </select>
            </div>

          </div>
        </div>

        {/* Product Grid Listings */}
        <div className="lg:col-span-3">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 space-y-3">
              <div className="w-10 h-10 border-4 border-luxury-gold border-t-transparent rounded-full animate-spin"></div>
              <p className="text-xs text-luxury-gold tracking-wide animate-pulse">Sourcing luxury catalogs...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-24 bg-white dark:bg-luxury-black-soft border border-luxury-gold/15 rounded-2xl p-6">
              <span className="text-3xl block mb-2">🎁</span>
              <h4 className="font-serif text-base font-bold text-luxury-black dark:text-white">No Hampers Match this Search</h4>
              <p className="text-xs text-luxury-black/50 dark:text-white/50 mt-1 max-w-sm mx-auto leading-relaxed">
                Try searching using broader terms like "flower" or "chocolate", or adjust the budget filter sliders.
              </p>
              <button
                onClick={clearFilters}
                className="mt-4 px-6 py-2 bg-luxury-red hover:bg-luxury-red-dark text-white rounded text-xs font-semibold shadow-md"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Shop;
