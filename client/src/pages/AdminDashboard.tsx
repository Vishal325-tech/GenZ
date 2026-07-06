import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldAlert, LayoutDashboard, Gift, FolderTree, ShoppingBag, 
  Users, Star, Image, Ticket, Settings, Mail, Plus, Trash2, Edit, Check, Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import BrandLogo from '../components/BrandLogo';

// Types
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
  reviews: any[];
}

interface Category {
  _id: string;
  name: string;
  image?: string;
  subCategories: string[];
}

interface Order {
  _id: string;
  customerName: string;
  totalAmount: number;
  orderStatus: string;
  paymentStatus: string;
  deliveryDate: string;
  assignedTo?: string;
  createdAt: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
  role: string;
}

interface MediaItem {
  _id: string;
  name: string;
  url: string;
  mimetype: string;
}

interface Coupon {
  _id: string;
  code: string;
  discountPercent: number;
}

interface BannerConfig {
  homeBanner: { title: string; subtitle: string };
  festivalBanner: { title: string; subtitle: string };
}

interface MessageItem {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  isRead: boolean;
  reply?: string;
}

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  // Database Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [deliveryStaff, setDeliveryStaff] = useState<Customer[]>([]);

  // Product Form states
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProdId, setEditingProdId] = useState('');
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodOfferPrice, setProdOfferPrice] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodStock, setProdStock] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodImage, setProdImage] = useState('');

  // Category Form
  const [catName, setCatName] = useState('');

  // Coupon Form
  const [cpCode, setCpCode] = useState('');
  const [cpDiscount, setCpDiscount] = useState('');

  // Banners Config Forms
  const [banners, setBanners] = useState<BannerConfig>({
    homeBanner: { title: 'Deliver Happiness with Beautiful Gifts', subtitle: 'Send gifts anywhere for birthdays...' },
    festivalBanner: { title: 'Sparkle and Joy: Festive Season Offers', subtitle: 'Get flat 20% off on all luxury festival hampers...' }
  });
  
  // Media Upload files helper
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);

  const fetchDashboardData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };

      const pRes = await fetch('/api/products');
      setProducts(await pRes.ok ? await pRes.json() : []);

      const cRes = await fetch('/api/categories');
      setCategories(await cRes.ok ? await cRes.json() : []);

      const oRes = await fetch('/api/orders/all', { headers });
      setOrders(await oRes.ok ? await oRes.json() : []);

      const uRes = await fetch('/api/auth/profile', { headers }); // dummy list, let's call profile
      const custRes = await fetch('/api/auth/profile', { headers }); // mock standard users later if needed
      setCustomers([{ _id: user?._id || 'admin', name: user?.name || 'Admin', email: user?.email || 'admin@giftmovers.com', role: user?.role || 'admin' }]);

      const mRes = await fetch('/api/media');
      setMedia(await mRes.ok ? await mRes.json() : []);

      const cpRes = await fetch('/api/coupons', { headers });
      setCoupons(await cpRes.ok ? await cpRes.json() : []);

      const msgRes = await fetch('/api/messages', { headers });
      setMessages(await msgRes.ok ? await msgRes.json() : []);

      const bRes = await fetch('/api/banners');
      if (bRes.ok) {
        setBanners(await bRes.json());
      }

      const dsRes = await fetch('/api/orders/delivery-staff', { headers });
      setDeliveryStaff(await dsRes.ok ? await dsRes.json() : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Authorize route: check token first, redirect if not staff
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role === 'customer') {
      navigate('/');
      return;
    }
    fetchDashboardData();
  }, [token, user]);

  // CRUD Product Actions
  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name: prodName,
      price: Number(prodPrice),
      offerPrice: prodOfferPrice ? Number(prodOfferPrice) : null,
      description: prodDesc,
      stock: Number(prodStock),
      category: prodCat,
      images: [prodImage || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?w=500']
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    try {
      let res;
      if (editingProdId) {
        res = await fetch(`/api/products/${editingProdId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(payload)
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers,
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        setProductFormOpen(false);
        setEditingProdId('');
        setProdName('');
        setProdPrice('');
        setProdOfferPrice('');
        setProdDesc('');
        setProdStock('');
        setProdCat('');
        setProdImage('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleEditProductClick = (p: Product) => {
    setEditingProdId(p._id);
    setProdName(p.name);
    setProdPrice(p.price.toString());
    setProdOfferPrice(p.offerPrice?.toString() || '');
    setProdDesc(p.description);
    setProdStock(p.stock.toString());
    setProdCat(p.category);
    setProdImage(p.images[0] || '');
    setProductFormOpen(true);
  };

  const handleDeleteProduct = async (id: string) => {
    if (!window.confirm('Delete this gift basket product?')) return;
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Category
  const handleCategoryCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catName) return;
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: catName, image: '/images/cat_placeholder.jpg' })
      });
      if (res.ok) {
        setCatName('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!window.confirm('Delete category?')) return;
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Order status timelines
  const handleUpdateOrderStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, note: `Status modified in Admin console to: ${status}` })
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Review approvals / replies
  const handleReviewApprove = async (productId: string, reviewId: string, approved: boolean) => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews/${reviewId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ approved })
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD Coupon
  const handleCouponCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cpCode || !cpDiscount) return;
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ code: cpCode, discountPercent: Number(cpDiscount) })
      });
      if (res.ok) {
        setCpCode('');
        setCpDiscount('');
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const res = await fetch(`/api/coupons/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Media Library Upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileToUpload) return;
    
    const formData = new FormData();
    formData.append('file', fileToUpload);

    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      if (res.ok) {
        setFileToUpload(null);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteMedia = async (id: string) => {
    if (!window.confirm('Delete file from library and server disk?')) return;
    try {
      const res = await fetch(`/api/media/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAssignDeliveryStaff = async (orderId: string, staffId: string) => {
    if (!staffId) return;
    try {
      const res = await fetch(`/api/orders/${orderId}/assign`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ staffId })
      });
      if (res.ok) {
        alert('Delivery Executive assigned successfully! Order marked as Shipped.');
        fetchDashboardData();
      } else {
        const d = await res.json();
        alert(d.message || 'Failed to assign executive');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // No-code banner save
  const handleBannersSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/banners', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(banners)
      });
      if (res.ok) {
        alert('Banners modified instantly on live frontend!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!token || (user && user.role === 'customer')) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <ShieldAlert className="h-12 w-12 text-luxury-red mx-auto" />
        <h3 className="text-lg font-bold">Unauthorized. Access Restricted.</h3>
        <p className="text-xs text-neutral-400">Staff logins only.</p>
        <button onClick={() => navigate('/login')} className="px-6 py-2 bg-luxury-red text-white text-xs font-semibold rounded">
          Back to Login
        </button>
      </div>
    );
  }

  // Dashboard Stats Calculations
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

  return (
    <div className="flex min-h-screen bg-neutral-900 text-neutral-100 transition-colors duration-300">
      
      {/* Sidebar Navigation */}
      <div className="w-64 bg-neutral-950 border-r border-luxury-gold/15 p-4 flex flex-col justify-between shrink-0">
        <div>
          <div className="text-center pb-6 border-b border-luxury-gold/15 mb-6 flex flex-col items-center">
            <BrandLogo isDarkTheme={true} />
            <span className="text-[9px] uppercase tracking-widest text-neutral-500 font-bold block">Cockpit Control</span>
          </div>

          <div className="flex flex-col space-y-1">
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'dashboard' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <LayoutDashboard className="h-4 w-4" /> <span>Dashboard Stats</span>
            </button>
            <button onClick={() => setActiveTab('products')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'products' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <Gift className="h-4 w-4" /> <span>Products Catalog</span>
            </button>
            <button onClick={() => setActiveTab('categories')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'categories' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <FolderTree className="h-4 w-4" /> <span>Categories</span>
            </button>
            <button onClick={() => setActiveTab('orders')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'orders' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <ShoppingBag className="h-4 w-4" /> <span>Orders Tracking</span>
            </button>
            <button onClick={() => setActiveTab('reviews')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'reviews' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <Star className="h-4 w-4" /> <span>Moderations</span>
            </button>
            <button onClick={() => setActiveTab('media')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'media' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <Image className="h-4 w-4" /> <span>Media Folders</span>
            </button>
            <button onClick={() => setActiveTab('coupons')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'coupons' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <Ticket className="h-4 w-4" /> <span>Coupons</span>
            </button>
            <button onClick={() => setActiveTab('banners')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'banners' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <Settings className="h-4 w-4" /> <span>No-Code Banners</span>
            </button>
            <button onClick={() => setActiveTab('messages')} className={`flex items-center space-x-2.5 px-3 py-2 rounded text-xs font-semibold ${activeTab === 'messages' ? 'bg-luxury-gold text-neutral-950' : 'text-neutral-400 hover:bg-neutral-900'}`}>
              <Mail className="h-4 w-4" /> <span>Inquiries</span>
            </button>
          </div>
        </div>

        <div className="text-[10px] text-neutral-500 border-t border-neutral-900 pt-4">
          Logged as: <span className="text-luxury-gold font-bold">{user?.name} ({user?.role})</span>
        </div>
      </div>

      {/* Main dashboard content panel */}
      <div className="flex-1 p-8 overflow-y-auto">
        {loading ? (
          <div className="text-center py-24 text-xs animate-pulse text-luxury-gold">Consolidating live charts...</div>
        ) : (
          <div className="space-y-6">

            {/* View: Dashboard Stats & SVG charts */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8 animate-scaleUp">
                {/* Stats cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-neutral-950 border border-luxury-gold/15 p-5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Total Revenue</span>
                    <h3 className="text-xl font-bold text-luxury-gold mt-1.5">₹{totalRevenue.toLocaleString()}</h3>
                  </div>
                  <div className="bg-neutral-950 border border-luxury-gold/15 p-5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Orders Dispatched</span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{orders.length} orders</h3>
                  </div>
                  <div className="bg-neutral-950 border border-luxury-gold/15 p-5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Products Active</span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{products.length} hampers</h3>
                  </div>
                  <div className="bg-neutral-950 border border-luxury-gold/15 p-5 rounded-2xl">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Customer Base</span>
                    <h3 className="text-xl font-bold text-white mt-1.5">{customers.length} users</h3>
                  </div>
                </div>

                {/* SVG charts: dynamic elegant visual representation */}
                <div className="bg-neutral-950 border border-luxury-gold/15 rounded-2xl p-6">
                  <h4 className="font-serif text-sm font-bold text-luxury-gold mb-6">Revenue Growth curve (Weekly)</h4>
                  <div className="w-full h-48 relative border-b border-l border-neutral-800 flex items-end">
                    {/* SVG Curve drawing vector path */}
                    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 500 100" preserveAspectRatio="none">
                      <path
                        d="M0,80 Q100,50 200,70 T400,20 T500,10"
                        fill="none"
                        stroke="#D4AF37"
                        strokeWidth="2"
                        className="animate-[dash_3s_ease-in-out_forwards]"
                      />
                      {/* Grid shadows */}
                      <path
                        d="M0,80 Q100,50 200,70 T400,20 T500,10 L500,100 L0,100 Z"
                        fill="url(#goldGrad)"
                        opacity="0.08"
                      />
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" />
                          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                    </svg>
                    {/* Chart axis numbers */}
                    <div className="absolute left-2 top-2 text-[8px] text-neutral-500 font-mono">₹50K</div>
                    <div className="absolute left-2 top-24 text-[8px] text-neutral-500 font-mono">₹25K</div>
                    <div className="absolute left-2 bottom-2 text-[8px] text-neutral-500 font-mono">₹0</div>
                  </div>
                </div>

                {/* CEO Section */}
                <div className="bg-neutral-950 border border-luxury-gold/25 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 mt-6">
                  {/* CEO Avatar Mock */}
                  <div className="h-20 w-20 rounded-full bg-luxury-cream border border-luxury-gold text-luxury-black-dark flex items-center justify-center text-xl font-bold font-serif shrink-0 shadow-lg shadow-gold-glow">
                    VS
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-1">
                      <h4 className="font-serif text-base font-bold text-white tracking-wide">Vishal S H</h4>
                      <span className="bg-luxury-gold/15 text-luxury-gold text-[9px] uppercase px-2 py-0.5 rounded font-bold border border-luxury-gold/25 w-fit mx-auto md:mx-0">
                        Chief Executive Officer & Founder
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 italic font-light leading-relaxed">
                      "Delivering happiness is not just our business milestone; it is our corporate soul. Under our elite gifting standards, every basket is wrapped to express profound care, luxury, and warmth. Vishal S H leads our corporate directives to redefine bespoke logistics across all regions."
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-neutral-500 pt-1 border-t border-neutral-900">
                      <span>Direct Executive line: vishal@giftmovers.com</span>
                      <span className="font-mono text-luxury-gold font-bold">Approved CEO Directives 2026</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* View: Products list CRUD */}
            {activeTab === 'products' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-luxury-gold/15 pb-4">
                  <h3 className="font-serif text-base font-bold text-luxury-gold">Products Catalogue CRUD</h3>
                  <button
                    onClick={() => { setEditingProdId(''); setProductFormOpen(true); }}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-luxury-gold hover:bg-luxury-gold-hover text-neutral-950 text-xs font-bold rounded-lg uppercase"
                  >
                    <Plus className="h-4 w-4" /> <span>Add Gift Product</span>
                  </button>
                </div>

                {/* Sliding popup layout form for adding/editing products */}
                {productFormOpen && (
                  <form onSubmit={productFormOpen ? handleProductSubmit : undefined} className="bg-neutral-950 p-6 rounded-2xl border border-luxury-gold/30 space-y-4 max-w-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider">{editingProdId ? 'Modify Gift Item' : 'New Gift Item'}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <input type="text" placeholder="Name" required value={prodName} onChange={e=>setProdName(e.target.value)} className="bg-neutral-900 text-xs p-2 rounded border border-neutral-800 text-white" />
                      <input type="number" placeholder="Price (₹)" required value={prodPrice} onChange={e=>setProdPrice(e.target.value)} className="bg-neutral-900 text-xs p-2 rounded border border-neutral-800 text-white" />
                      <input type="number" placeholder="Offer Price (₹)" value={prodOfferPrice} onChange={e=>setProdOfferPrice(e.target.value)} className="bg-neutral-900 text-xs p-2 rounded border border-neutral-800 text-white" />
                      <input type="number" placeholder="Stock" required value={prodStock} onChange={e=>setProdStock(e.target.value)} className="bg-neutral-900 text-xs p-2 rounded border border-neutral-800 text-white" />
                      
                      <select required value={prodCat} onChange={e=>setProdCat(e.target.value)} className="bg-neutral-900 text-xs p-2 rounded border border-neutral-800 text-white">
                        <option value="">-- Choose Category --</option>
                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                      </select>

                      <input type="text" placeholder="Image URL (e.g. /images/gift.jpg)" value={prodImage} onChange={e=>setProdImage(e.target.value)} className="bg-neutral-900 text-xs p-2 rounded border border-neutral-800 text-white" />
                    </div>
                    <textarea placeholder="Description detail" rows={3} required value={prodDesc} onChange={e=>setProdDesc(e.target.value)} className="w-full bg-neutral-900 text-xs p-2 rounded border border-neutral-800 text-white" />
                    <div className="flex space-x-2 pt-2">
                      <button type="submit" className="px-6 py-2 bg-luxury-gold text-neutral-950 text-xs font-bold rounded">
                        Save Product
                      </button>
                      <button type="button" onClick={()=>setProductFormOpen(false)} className="px-6 py-2 border border-neutral-800 text-xs rounded">Cancel</button>
                    </div>
                  </form>
                )}

                {/* Products catalog list table */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {products.map(p => (
                    <div key={p._id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <h5 className="font-serif font-bold text-white truncate max-w-[160px]">{p.name}</h5>
                        <p className="text-[10px] text-neutral-500 mt-0.5">₹{p.price.toLocaleString()} | Stock: {p.stock}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button onClick={()=>handleEditProductClick(p)} className="p-1.5 text-neutral-400 hover:text-luxury-gold border border-neutral-900 hover:border-luxury-gold/20 rounded">
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={()=>handleDeleteProduct(p._id)} className="p-1.5 text-neutral-400 hover:text-luxury-red border border-neutral-900 hover:border-luxury-red/25 rounded">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Categories CRUD */}
            {activeTab === 'categories' && (
              <div className="space-y-6">
                <form onSubmit={handleCategoryCreate} className="flex gap-2 max-w-md">
                  <input
                    type="text"
                    required
                    placeholder="New category name (e.g. Corporate Gifts)"
                    value={catName}
                    onChange={e=>setCatName(e.target.value)}
                    className="flex-1 bg-neutral-950 text-xs p-2 rounded border border-neutral-800 text-white"
                  />
                  <button type="submit" className="px-4 py-2 bg-luxury-gold text-neutral-950 text-xs font-bold rounded">
                    Create
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categories.map(c => (
                    <div key={c._id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-serif font-bold text-white">{c.name}</span>
                      <button onClick={()=>handleDeleteCategory(c._id)} className="text-neutral-500 hover:text-luxury-red">
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Orders tracking list */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                <h3 className="font-serif text-base font-bold text-luxury-gold border-b border-luxury-gold/15 pb-2.5">
                  Incoming Orders Tracker
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-neutral-400">
                    <thead className="bg-neutral-950 text-[10px] uppercase text-neutral-500 tracking-wider">
                      <tr>
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Customer</th>
                        <th className="p-3">Deliver Date</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Assign Executive</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Update Timeline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o._id} className="border-b border-neutral-900 hover:bg-neutral-950/40">
                          <td className="p-3 font-bold text-white font-mono">GRH-{o._id.substring(0,8).toUpperCase()}</td>
                          <td className="p-3">{o.customerName}</td>
                          <td className="p-3">{o.deliveryDate}</td>
                          <td className="p-3 text-luxury-gold font-bold">₹{o.totalAmount.toLocaleString()}</td>
                          <td className="p-3">
                            <select
                              value={o.assignedTo || ''}
                              onChange={e => handleAssignDeliveryStaff(o._id, e.target.value)}
                              className="bg-neutral-900 border border-neutral-800 p-1 rounded text-[10px] text-white w-32"
                            >
                              <option value="">-- Unassigned --</option>
                              {deliveryStaff.map(s => (
                                <option key={s._id} value={s._id}>{s.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-3 uppercase text-[10px] font-bold text-white">{o.orderStatus}</td>
                          <td className="p-3 text-right">
                            <select
                              value={o.orderStatus}
                              onChange={e => handleUpdateOrderStatus(o._id, e.target.value)}
                              className="bg-neutral-900 border border-neutral-800 p-1 rounded text-[10px] text-white"
                            >
                              <option value="pending">Pending</option>
                              <option value="packed">Packed</option>
                              <option value="shipped">Shipped</option>
                              <option value="delivered">Delivered</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* View: Reviews Moderation */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                <h3 className="font-serif text-base font-bold text-luxury-gold border-b border-luxury-gold/15 pb-2.5">
                  Customer Reviews Moderation
                </h3>
                <div className="space-y-4">
                  {products.flatMap(p => p.reviews.map(r => ({ ...r, productId: p._id, productName: p.name }))).map((rev, idx) => (
                    <div key={idx} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <h5 className="font-bold text-white">{rev.userName} <span className="text-[10px] font-normal text-neutral-500">on {rev.productName}</span></h5>
                          <span className="text-luxury-gold">{'★'.repeat(rev.rating)}</span>
                        </div>
                        <div className="flex space-x-2">
                          {!rev.approved ? (
                            <button
                              onClick={() => handleReviewApprove(rev.productId, rev._id, true)}
                              className="px-2.5 py-1 bg-green-700 text-white rounded text-[10px] font-bold"
                            >
                              Approve
                            </button>
                          ) : (
                            <span className="text-green-600 font-bold uppercase text-[9px] border border-green-600/30 px-2 py-0.5 rounded">Approved</span>
                          )}
                        </div>
                      </div>
                      <p className="text-neutral-400 italic">"{rev.comment}"</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Media Library */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <form onSubmit={handleFileUpload} className="flex gap-2 max-w-sm">
                  <input
                    type="file"
                    required
                    onChange={e => setFileToUpload(e.target.files?.[0] || null)}
                    className="flex-1 bg-neutral-950 text-xs p-1 rounded border border-neutral-800 text-white"
                  />
                  <button type="submit" className="px-4 py-2 bg-luxury-gold text-neutral-950 text-xs font-bold rounded">
                    Upload
                  </button>
                </form>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {media.map(m => (
                    <div key={m._id} className="bg-neutral-950 border border-neutral-800 p-2.5 rounded-xl space-y-2 text-xs relative group">
                      <button
                        onClick={() => handleDeleteMedia(m._id)}
                        className="absolute top-2 right-2 p-1 bg-black/60 rounded text-neutral-400 hover:text-luxury-red"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <img src={m.url} alt={m.name} className="h-24 w-full object-cover rounded bg-neutral-900" />
                      <div className="flex justify-between items-center pt-1">
                        <span className="truncate max-w-[100px] text-[10px] text-neutral-500">{m.name}</span>
                        <button
                          onClick={() => { navigator.clipboard.writeText(m.url); alert('File URL copied!'); }}
                          className="text-[9px] font-bold text-luxury-gold flex items-center gap-1 hover:underline"
                        >
                          <LinkIcon className="h-3 w-3" /> URL
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Coupons */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                <form onSubmit={handleCouponCreate} className="grid grid-cols-3 gap-2 max-w-lg">
                  <input type="text" placeholder="CODE (e.g. FLAT50)" required value={cpCode} onChange={e=>setCpCode(e.target.value)} className="bg-neutral-950 text-xs p-2 rounded border border-neutral-800 text-white uppercase" />
                  <input type="number" placeholder="Discount %" required value={cpDiscount} onChange={e=>setCpDiscount(e.target.value)} className="bg-neutral-950 text-xs p-2 rounded border border-neutral-800 text-white" />
                  <button type="submit" className="bg-luxury-gold text-neutral-950 text-xs font-bold rounded px-4">
                    Create Coupon
                  </button>
                </form>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {coupons.map(cp => (
                    <div key={cp._id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl flex justify-between items-center text-xs">
                      <span className="font-bold text-white uppercase">{cp.code} ({cp.discountPercent}% OFF)</span>
                      <button onClick={()=>handleDeleteCoupon(cp._id)} className="text-neutral-500 hover:text-luxury-red">
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* View: Banner Management */}
            {activeTab === 'banners' && (
              <form onSubmit={handleBannersSave} className="space-y-5 max-w-xl">
                <h3 className="font-serif text-base font-bold text-luxury-gold border-b border-luxury-gold/15 pb-2.5">
                  Configure Homepage Banner content (No-Code)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Banner Title</label>
                    <input
                      type="text"
                      value={banners.homeBanner.title}
                      onChange={e=>setBanners(prev=>({ ...prev, homeBanner: { ...prev.homeBanner, title: e.target.value } }))}
                      className="w-full bg-neutral-950 text-xs p-2 rounded border border-neutral-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Banner Subtitle</label>
                    <textarea
                      rows={2}
                      value={banners.homeBanner.subtitle}
                      onChange={e=>setBanners(prev=>({ ...prev, homeBanner: { ...prev.homeBanner, subtitle: e.target.value } }))}
                      className="w-full bg-neutral-950 text-xs p-2 rounded border border-neutral-800 text-white"
                    />
                  </div>
                </div>

                <h3 className="font-serif text-base font-bold text-luxury-gold border-b border-luxury-gold/15 pb-2.5 pt-4">
                  Configure Festival Banner content (No-Code)
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Festival Title</label>
                    <input
                      type="text"
                      value={banners.festivalBanner.title}
                      onChange={e=>setBanners(prev=>({ ...prev, festivalBanner: { ...prev.festivalBanner, title: e.target.value } }))}
                      className="w-full bg-neutral-950 text-xs p-2 rounded border border-neutral-800 text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-neutral-400 block mb-1">Festival Subtitle</label>
                    <textarea
                      rows={2}
                      value={banners.festivalBanner.subtitle}
                      onChange={e=>setBanners(prev=>({ ...prev, festivalBanner: { ...prev.festivalBanner, subtitle: e.target.value } }))}
                      className="w-full bg-neutral-950 text-xs p-2 rounded border border-neutral-800 text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-luxury-gold hover:bg-luxury-gold-hover text-neutral-950 text-xs font-bold rounded-lg uppercase"
                >
                  Save Banner Modifications
                </button>
              </form>
            )}

            {/* View: Contact Inquiry Messages */}
            {activeTab === 'messages' && (
              <div className="space-y-4">
                <h3 className="font-serif text-base font-bold text-luxury-gold border-b border-luxury-gold/15 pb-2.5">
                  Customer Inquiry Messages
                </h3>
                <div className="space-y-3">
                  {messages.length === 0 ? (
                    <p className="text-xs text-neutral-500 italic">No inquires or help tickets submitted yet.</p>
                  ) : (
                    messages.map(m => (
                      <div key={m._id} className="p-4 rounded-xl border border-neutral-800 bg-neutral-950 text-xs space-y-2">
                        <div className="flex justify-between items-center text-white font-bold">
                          <span>{m.name} ({m.email})</span>
                          <span className="text-[10px] uppercase text-neutral-500">Subject: {m.subject}</span>
                        </div>
                        <p className="text-neutral-400 italic">"{m.message}"</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

          </div>
        )}
      </div>

    </div>
  );
};

export default AdminDashboard;
