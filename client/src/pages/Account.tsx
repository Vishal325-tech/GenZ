import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { User, MapPin, Heart, History, Trash2, Edit, Plus, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useWishlist } from '../context/WishlistContext';

interface Order {
  _id: string;
  totalAmount: number;
  orderStatus: string;
  createdAt: string;
  products: Array<{ name: string; quantity: number }>;
}

const Account: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, token, updateUser, logout } = useAuth();
  const { wishlist, toggleWishlist } = useWishlist();

  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [wishlistProducts, setWishlistProducts] = useState<any[]>([]);

  // Profile forms
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState('');

  // Address Form CRUD modal
  const [addresses, setAddresses] = useState<any[]>(user?.addressBook || []);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [addrName, setAddrName] = useState('');
  const [addrPhone, setAddrPhone] = useState('');
  const [addrStreet, setAddrStreet] = useState('');
  const [addrCity, setAddrCity] = useState('');
  const [addrState, setAddrState] = useState('');
  const [addrZip, setAddrZip] = useState('');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token]);

  // Load customer order history & wishlist products
  useEffect(() => {
    if (!token) return;

    const fetchHistory = async () => {
      try {
        const oRes = await fetch('/api/orders/my-orders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const oData = await oRes.ok ? await oRes.json() : [];
        setOrders(oData);

        // Fetch products in wishlist
        const wRes = await fetch('/api/products');
        const wData = await wRes.ok ? await wRes.json() : [];
        setWishlistProducts(wData.filter((p: any) => wishlist.includes(p._id)));
      } catch (err) {
        console.error(err);
      }
    };
    fetchHistory();
  }, [token, wishlist]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setPhone(user.phone || '');
      setAddresses(user.addressBook || []);
    }
  }, [user]);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateUser({ name, phone });
      setProfileMsg('Profile updated successfully!');
      setTimeout(() => setProfileMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'Profile update failed');
    }
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addrName || !addrPhone || !addrStreet || !addrCity || !addrState || !addrZip) return;

    const newAddress = {
      name: addrName,
      phone: addrPhone,
      street: addrStreet,
      city: addrCity,
      state: addrState,
      zip: addrZip,
      isDefault: addresses.length === 0
    };

    const updatedAddresses = [...addresses, newAddress];
    try {
      await updateUser({ addressBook: updatedAddresses });
      setShowAddressForm(false);
      setAddrName('');
      setAddrPhone('');
      setAddrStreet('');
      setAddrCity('');
      setAddrState('');
      setAddrZip('');
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (idx: number) => {
    const updated = addresses.filter((_, i) => i !== idx);
    try {
      await updateUser({ addressBook: updated });
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        
        {/* Left column tabs */}
        <div className="md:col-span-1 space-y-2.5">
          <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/20 p-4 text-center">
            <div className="h-16 w-16 rounded-full bg-luxury-cream text-luxury-gold border border-luxury-gold flex items-center justify-center text-xl font-bold mx-auto mb-3">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <h4 className="font-serif text-sm font-bold text-luxury-black dark:text-white truncate">{user.name}</h4>
            <span className="text-[10px] text-neutral-400 font-semibold uppercase tracking-wider block mt-0.5">{user.role}</span>
          </div>

          <div className="flex flex-col bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-2">
            <button
              onClick={() => setActiveTab('profile')}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded text-left text-xs font-semibold ${
                activeTab === 'profile' ? 'bg-luxury-gold text-luxury-black' : 'text-neutral-500 hover:bg-luxury-cream dark:hover:bg-luxury-black/35'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile Settings</span>
            </button>
            <button
              onClick={() => setActiveTab('addresses')}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded text-left text-xs font-semibold ${
                activeTab === 'addresses' ? 'bg-luxury-gold text-luxury-black' : 'text-neutral-500 hover:bg-luxury-cream dark:hover:bg-luxury-black/35'
              }`}
            >
              <MapPin className="h-4 w-4" />
              <span>Address Book</span>
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded text-left text-xs font-semibold ${
                activeTab === 'wishlist' ? 'bg-luxury-gold text-luxury-black' : 'text-neutral-500 hover:bg-luxury-cream dark:hover:bg-luxury-black/35'
              }`}
            >
              <Heart className="h-4 w-4" />
              <span>Wishlist Favorites</span>
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-2.5 px-4 py-2.5 rounded text-left text-xs font-semibold ${
                activeTab === 'history' ? 'bg-luxury-gold text-luxury-black' : 'text-neutral-500 hover:bg-luxury-cream dark:hover:bg-luxury-black/35'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Order History</span>
            </button>
            
            <button
              onClick={handleLogout}
              className="mt-6 border-t border-luxury-gold/15 pt-4 text-xs text-luxury-red font-bold text-left px-4 py-2 hover:bg-luxury-cream dark:hover:bg-luxury-black/35"
            >
              Log Out Settings
            </button>
          </div>
        </div>

        {/* Right column detailed panels */}
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-luxury-black-soft rounded-2xl border border-luxury-gold/15 p-6 shadow-sm min-h-[400px]">
            
            {/* Tab: Profile */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave} className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2.5">
                  Update Account Profile
                </h3>
                {profileMsg && <p className="text-xs text-green-600 font-bold flex items-center gap-1"><Check className="h-3.5 w-3.5" />{profileMsg}</p>}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Email Address (Read-only)</label>
                    <input
                      type="email"
                      disabled
                      value={user.email}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-neutral-200 dark:bg-neutral-900 text-xs text-neutral-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-neutral-500 uppercase block mb-1">Contact Phone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-xs text-luxury-black dark:text-white"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-luxury-red hover:bg-luxury-red-dark text-white rounded text-xs font-bold uppercase tracking-wider"
                >
                  Save Profile
                </button>
              </form>
            )}

            {/* Tab: Address Book */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-luxury-gold/15 pb-2.5">
                  <h3 className="font-serif text-lg font-bold text-luxury-black dark:text-white">
                    Manage Address Book
                  </h3>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="flex items-center space-x-1.5 px-3 py-1.5 rounded-full bg-luxury-gold hover:bg-luxury-gold-hover text-luxury-black text-[10px] font-bold uppercase"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Address</span>
                  </button>
                </div>

                {/* Add Address Form overlay block */}
                {showAddressForm && (
                  <form onSubmit={handleAddAddress} className="p-4 rounded-xl border border-luxury-gold/30 bg-luxury-cream space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <input type="text" placeholder="Recipient Name" required value={addrName} onChange={e=>setAddrName(e.target.value)} className="w-full px-3 py-1.5 border rounded text-xs" />
                      </div>
                      <div>
                        <input type="text" placeholder="Contact Phone" required value={addrPhone} onChange={e=>setAddrPhone(e.target.value)} className="w-full px-3 py-1.5 border rounded text-xs" />
                      </div>
                    </div>
                    <input type="text" placeholder="Street Address" required value={addrStreet} onChange={e=>setAddrStreet(e.target.value)} className="w-full px-3 py-1.5 border rounded text-xs" />
                    <div className="grid grid-cols-3 gap-2">
                      <input type="text" placeholder="City" required value={addrCity} onChange={e=>setAddrCity(e.target.value)} className="w-full px-3 py-1.5 border rounded text-xs" />
                      <input type="text" placeholder="State" required value={addrState} onChange={e=>setAddrState(e.target.value)} className="w-full px-3 py-1.5 border rounded text-xs" />
                      <input type="text" placeholder="ZIP" required value={addrZip} onChange={e=>setAddrZip(e.target.value)} className="w-full px-3 py-1.5 border rounded text-xs" />
                    </div>
                    <button type="submit" className="px-4 py-2 bg-luxury-black text-white text-xs rounded hover:bg-neutral-800">
                      Save Address
                    </button>
                  </form>
                )}

                {/* Render addresses */}
                {addresses.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">No saved addresses found. Add one for rapid checkout logistics.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr, idx) => (
                      <div key={idx} className="border border-neutral-200 dark:border-neutral-700 p-4 rounded-xl relative space-y-1">
                        <button
                          onClick={() => handleDeleteAddress(idx)}
                          className="absolute top-4 right-4 text-neutral-400 hover:text-luxury-red"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <h5 className="font-bold text-xs">{addr.name} {addr.isDefault && <span className="bg-luxury-gold/25 text-luxury-gold-dark text-[8px] font-bold px-1.5 py-0.5 rounded ml-2 uppercase">Default</span>}</h5>
                        <p className="text-[11px] text-neutral-500 leading-relaxed pt-1">
                          {addr.street}<br />
                          {addr.city}, {addr.state} - {addr.zip}<br />
                          Phone: {addr.phone}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Wishlist */}
            {activeTab === 'wishlist' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2.5">
                  Your Favorites (Wishlist)
                </h3>
                {wishlistProducts.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">Your wishlist has no items. Visit the shop and click the heart icon on any hamper!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {wishlistProducts.map((p) => (
                      <div key={p._id} className="flex border border-neutral-200 dark:border-neutral-700 rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900 relative">
                        <img src={p.images[0]} alt={p.name} className="h-20 w-20 object-cover shrink-0" />
                        <div className="p-3 overflow-hidden pr-8 flex flex-col justify-between">
                          <div>
                            <h5 onClick={() => navigate(`/product/${p._id}`)} className="font-bold text-xs truncate cursor-pointer hover:underline">{p.name}</h5>
                            <span className="text-[10px] text-neutral-400 font-bold block">{p.category}</span>
                          </div>
                          <span className="text-xs font-bold text-luxury-red">₹{p.price.toLocaleString()}</span>
                        </div>
                        <button
                          onClick={() => toggleWishlist(p._id)}
                          className="absolute top-3 right-3 text-luxury-red"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Tab: Order History */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="font-serif text-lg font-bold text-luxury-black dark:text-white border-b border-luxury-gold/15 pb-2.5">
                  Your Purchase Orders
                </h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-neutral-400 italic">You haven't placed any orders yet. Visit our shop and send someone a special hamper!</p>
                ) : (
                  <div className="space-y-3">
                    {orders.map((o) => (
                      <div key={o._id} className="p-4 rounded-xl border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-900 flex justify-between items-center text-xs">
                        <div className="space-y-1 overflow-hidden mr-4">
                          <h5 className="font-bold text-xs">GM-{o._id.substring(0,8).toUpperCase()}</h5>
                          <p className="text-[10px] text-neutral-500 font-medium truncate">
                            {o.products.map(p => `${p.name} x${p.quantity}`).join(', ')}
                          </p>
                          <span className="text-[9px] text-neutral-400 font-mono block">Order date: {new Date(o.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="text-right shrink-0 space-y-1.5">
                          <span className="font-bold block text-luxury-red">₹{o.totalAmount.toLocaleString()}</span>
                          <button
                            onClick={() => navigate(`/track-order/${o._id}`)}
                            className="bg-luxury-gold hover:bg-luxury-gold-hover text-luxury-black font-bold uppercase text-[9px] px-2.5 py-1 rounded"
                          >
                            Track: {o.orderStatus.toUpperCase()}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Account;
