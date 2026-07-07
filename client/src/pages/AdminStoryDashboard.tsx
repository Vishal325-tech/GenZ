import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Eye, Clock, Archive, Star, TrendingUp, Users,
  Check, X, Trash2, Edit, Calendar, Search, Filter, ChevronDown,
  MessageSquare, Share2, Heart, AlertCircle, CheckCircle2,
  ArrowLeft, ExternalLink, Sparkles, RefreshCw
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

interface StoryData {
  _id: string;
  customerName: string;
  email: string;
  mobile: string;
  city?: string;
  occasion: string;
  title: string;
  caption?: string;
  personalMessage?: string;
  coverPhoto?: string;
  thumbnail?: string;
  photos: string[];
  videos: string[];
  celebrationDate: string;
  publishTime?: string;
  expiresAt?: string;
  storyDuration: string;
  status: string;
  isFeatured: boolean;
  isVerified: boolean;
  viewCount: number;
  shareCount: number;
  reactions: { emoji: string }[];
  comments: { _id: string; userName: string; text: string; isApproved: boolean }[];
  createdAt: string;
  adminNotes?: string;
}

interface Stats {
  total: number;
  active: number;
  pending: number;
  scheduled: number;
  archived: number;
  featured: number;
  mostViewed: StoryData[];
  mostShared: StoryData[];
  topOccasion: { _id: string; count: number } | null;
}

const occasionEmoji: Record<string, string> = {
  Birthday: '🎂', Anniversary: '💍', Wedding: '💒', Proposal: '💍',
  Engagement: '💍', 'Baby Shower': '🍼', Housewarming: '🏠',
  Graduation: '🎓', Retirement: '🎉', "Mother's Day": '🌸',
  "Father's Day": '👔', "Valentine's Day": '💝', Christmas: '🎄',
  Diwali: '🪔', 'New Year': '🎆', Congratulations: '🎊',
  'Corporate Celebration': '🏢', Festival: '🎊', 'Custom Occasion': '🌟'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  approved: 'bg-blue-100 text-blue-700 border-blue-200',
  published: 'bg-green-100 text-green-700 border-green-200',
  featured: 'bg-purple-100 text-purple-700 border-purple-200',
  rejected: 'bg-red-100 text-red-700 border-red-200',
  expired: 'bg-gray-100 text-gray-600 border-gray-200',
  archived: 'bg-gray-100 text-gray-500 border-gray-200',
};

const AdminStoryDashboard: React.FC = () => {
  const [stories, setStories] = useState<StoryData[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    active: 0,
    pending: 0,
    scheduled: 0,
    archived: 0,
    featured: 0,
    mostViewed: [],
    mostShared: [],
    topOccasion: null
  });
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStory, setSelectedStory] = useState<StoryData | null>(null);
  const [actionLoading, setActionLoading] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [authError, setAuthError] = useState('');
  const [autoApprove, setAutoApprove] = useState(false);

  const navigate = useNavigate();
  const { user, token } = useAuth();

  const toggleAutoApprove = async () => {
    try {
      const nextValue = !autoApprove;
      const res = await fetch(`${API_BASE}/stories/admin/settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ autoApprove: nextValue })
      });
      if (res.ok) {
        setAutoApprove(nextValue);
        showNotification('success', `Auto-Approval is now ${nextValue ? 'Enabled' : 'Disabled'}`);
      } else {
        showNotification('error', 'Failed to update auto-approval setting.');
      }
    } catch {
      showNotification('error', 'Failed to connect to setting API.');
    }
  };

  useEffect(() => {
    if (!token) {
      navigate('/login');
      return;
    }
    if (user && user.role === 'customer') {
      navigate('/');
      return;
    }
    fetchData();
  }, [token, user, filterStatus]);

  const fetchData = async () => {
    setLoading(true);
    setAuthError('');
    try {
      const params = new URLSearchParams();
      if (filterStatus) params.set('status', filterStatus);

      const [storiesRes, statsRes, settingsRes] = await Promise.all([
        fetch(`${API_BASE}/stories/admin/all?${params}`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/stories/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch(`${API_BASE}/stories/admin/settings`, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      if (!storiesRes.ok || !statsRes.ok) {
        throw new Error('Failed to fetch data from server.');
      }

      const storiesData = await storiesRes.json();
      const statsData = await statsRes.json();
      
      if (settingsRes.ok) {
        const settingsData = await settingsRes.json();
        setAutoApprove(settingsData.autoApprove);
      }

      setStories(Array.isArray(storiesData) ? storiesData : []);
      if (statsData && statsData.total !== undefined) {
        setStats(statsData);
      }
    } catch (err: any) {
      console.error('Fetch dashboard data failed:', err);
      setAuthError(err.message || 'Connection error. Make sure the server is running.');
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const updateStory = async (id: string, updates: Partial<StoryData>) => {
    setActionLoading(id);
    try {
      const res = await fetch(`${API_BASE}/stories/admin/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(updates)
      });
      const data = await res.json();
      if (res.ok) {
        showNotification('success', data.message || 'Story updated!');
        fetchData();
        if (selectedStory?._id === id) setSelectedStory(null);
      } else {
        showNotification('error', data.message || 'Update failed.');
      }
    } catch {
      showNotification('error', 'Network error.');
    } finally {
      setActionLoading('');
    }
  };

  const deleteStory = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this story?')) return;
    setActionLoading(id);
    try {
      await fetch(`${API_BASE}/stories/admin/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      showNotification('success', 'Story deleted.');
      fetchData();
      if (selectedStory?._id === id) setSelectedStory(null);
    } catch {
      showNotification('error', 'Delete failed.');
    } finally {
      setActionLoading('');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const filteredStories = stories.filter(s => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return s.customerName.toLowerCase().includes(q) ||
           s.title.toLowerCase().includes(q) ||
           s.occasion.toLowerCase().includes(q) ||
           s.email.toLowerCase().includes(q);
  });

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const formatDateTime = (d: string) => new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

  if (authError) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl border border-red-100 p-6 text-center shadow-lg">
          <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center text-red-500 mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-serif font-bold text-gray-800 mb-2">Error Loading Dashboard</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">{authError}</p>
          <div className="flex flex-col gap-2">
            <button
              onClick={() => window.location.href = '/GenZ/'}
              className="w-full btn-luxury rounded-xl py-2.5 text-xs font-semibold"
            >
              Go to Homepage
            </button>
            <button
              onClick={fetchData}
              className="w-full text-xs text-gray-400 hover:text-gray-600 font-semibold"
            >
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4 sm:p-6">
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${
              notification.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
          >
            {notification.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
            {notification.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-serif font-bold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-luxury-gold" />
              Story Management
            </h1>
            <p className="text-sm text-gray-500 mt-1">Manage celebration stories, approvals, and analytics</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={toggleAutoApprove}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-semibold transition-all ${
                autoApprove
                  ? 'bg-green-500 border-green-500 text-white shadow-[0_2px_10px_rgba(34,197,94,0.3)] hover:bg-green-600'
                  : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className={`w-2 h-2 rounded-full ${autoApprove ? 'bg-white animate-ping' : 'bg-gray-400'}`} />
              Auto-Approval: {autoApprove ? 'ON' : 'OFF'}
            </button>

            <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-all">
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="max-w-7xl mx-auto mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <StatCard icon={<BarChart3 className="w-5 h-5" />} label="Total" value={stats.total} color="text-gray-700" bg="bg-gray-50" />
            <StatCard icon={<Eye className="w-5 h-5" />} label="Active" value={stats.active} color="text-green-600" bg="bg-green-50" />
            <StatCard icon={<Clock className="w-5 h-5" />} label="Pending" value={stats.pending} color="text-yellow-600" bg="bg-yellow-50" />
            <StatCard icon={<Calendar className="w-5 h-5" />} label="Scheduled" value={stats.scheduled} color="text-blue-600" bg="bg-blue-50" />
            <StatCard icon={<Archive className="w-5 h-5" />} label="Archived" value={stats.archived} color="text-gray-500" bg="bg-gray-50" />
            <StatCard icon={<Star className="w-5 h-5" />} label="Featured" value={stats.featured} color="text-purple-600" bg="bg-purple-50" />
          </div>

          {/* Top Stats Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3">
            {stats.topOccasion && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Top Occasion</span>
                <p className="text-lg font-bold text-gray-800 mt-1">
                  {occasionEmoji[stats.topOccasion._id] || '🎉'} {stats.topOccasion._id}
                </p>
                <span className="text-xs text-gray-400">{stats.topOccasion.count} stories</span>
              </div>
            )}
            {stats.mostViewed?.[0] && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Most Viewed</span>
                <p className="text-sm font-bold text-gray-800 mt-1 truncate">{stats.mostViewed[0].title}</p>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> {stats.mostViewed[0].viewCount} views</span>
              </div>
            )}
            {stats.mostShared?.[0] && (
              <div className="bg-white rounded-xl p-4 border border-gray-100">
                <span className="text-[10px] font-bold text-gray-400 uppercase">Most Shared</span>
                <p className="text-sm font-bold text-gray-800 mt-1 truncate">{stats.mostShared[0].title}</p>
                <span className="text-xs text-gray-400 flex items-center gap-1"><Share2 className="w-3 h-3" /> {stats.mostShared[0].shareCount} shares</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="max-w-7xl mx-auto mb-4">
        <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name, title, occasion, email..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-luxury-gold/50"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {['', 'pending', 'approved', 'published', 'featured', 'rejected', 'archived'].map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-semibold border transition-all capitalize ${
                  filterStatus === s
                    ? 'border-luxury-gold bg-luxury-gold/10 text-luxury-gold'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
                }`}
              >
                {s || 'All'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stories Table */}
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading stories...</div>
          ) : filteredStories.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-4xl mb-3">📭</div>
              <p className="text-gray-500">No stories found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    <th className="text-left p-3 font-semibold text-gray-500 text-xs">Story</th>
                    <th className="text-left p-3 font-semibold text-gray-500 text-xs">Occasion</th>
                    <th className="text-left p-3 font-semibold text-gray-500 text-xs">Customer</th>
                    <th className="text-left p-3 font-semibold text-gray-500 text-xs">Date</th>
                    <th className="text-left p-3 font-semibold text-gray-500 text-xs">Status</th>
                    <th className="text-left p-3 font-semibold text-gray-500 text-xs">Engagement</th>
                    <th className="text-right p-3 font-semibold text-gray-500 text-xs">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStories.map(story => (
                    <tr key={story._id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gradient-to-br from-celebration-soft-pink to-celebration-rose-gold flex-shrink-0">
                            {(story.thumbnail || story.coverPhoto) ? (
                              <img src={story.thumbnail || story.coverPhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg">
                                {occasionEmoji[story.occasion] || '🎉'}
                              </div>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-800 truncate max-w-[180px]">{story.title}</p>
                            <p className="text-[10px] text-gray-400">Created {formatDate(story.createdAt)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <span className="occasion-badge">{story.occasion}</span>
                      </td>
                      <td className="p-3">
                        <p className="font-medium text-gray-700">{story.customerName}</p>
                        <p className="text-[10px] text-gray-400">{story.email}</p>
                      </td>
                      <td className="p-3 text-xs text-gray-500">{formatDate(story.celebrationDate)}</td>
                      <td className="p-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${STATUS_COLORS[story.status] || ''}`}>
                          {story.status}
                        </span>
                        {story.isFeatured && (
                          <Star className="w-3 h-3 text-yellow-500 fill-yellow-500 inline ml-1" />
                        )}
                      </td>
                      <td className="p-3">
                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span className="flex items-center gap-0.5"><Eye className="w-3 h-3" />{story.viewCount}</span>
                          <span className="flex items-center gap-0.5"><Heart className="w-3 h-3" />{story.reactions?.length || 0}</span>
                          <span className="flex items-center gap-0.5"><Share2 className="w-3 h-3" />{story.shareCount}</span>
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setSelectedStory(story)}
                            className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center hover:bg-blue-100 transition-colors"
                            title="Preview"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {story.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStory(story._id, { status: 'approved' })}
                                className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                                title="Approve"
                                disabled={actionLoading === story._id}
                              >
                                <Check className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => updateStory(story._id, { status: 'rejected' })}
                                className="w-7 h-7 rounded-lg bg-red-50 text-red-600 flex items-center justify-center hover:bg-red-100 transition-colors"
                                title="Reject"
                                disabled={actionLoading === story._id}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                          {(story.status === 'approved' || story.status === 'published') && (
                            <button
                              onClick={() => updateStory(story._id, { isFeatured: !story.isFeatured })}
                              className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                                story.isFeatured ? 'bg-yellow-100 text-yellow-600' : 'bg-gray-50 text-gray-400 hover:bg-yellow-50'
                              }`}
                              title={story.isFeatured ? 'Unfeature' : 'Feature'}
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {story.status !== 'published' && story.status !== 'featured' && (
                            <button
                              onClick={() => updateStory(story._id, { status: 'published' })}
                              className="w-7 h-7 rounded-lg bg-green-50 text-green-600 flex items-center justify-center hover:bg-green-100 transition-colors"
                              title="Publish Now"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => updateStory(story._id, { status: 'archived' })}
                            className="w-7 h-7 rounded-lg bg-gray-50 text-gray-400 flex items-center justify-center hover:bg-gray-100 transition-colors"
                            title="Archive"
                          >
                            <Archive className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => deleteStory(story._id)}
                            className="w-7 h-7 rounded-lg bg-red-50 text-red-400 flex items-center justify-center hover:bg-red-100 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Story Detail Modal */}
      <AnimatePresence>
        {selectedStory && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedStory(null)}
          >
            <motion.div
              className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-serif font-bold text-gray-800">Story Preview</h2>
                  <button onClick={() => setSelectedStory(null)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                </div>

                {/* Preview content */}
                <div className="space-y-4">
                  {(selectedStory.coverPhoto || selectedStory.thumbnail) && (
                    <img
                      src={selectedStory.coverPhoto || selectedStory.thumbnail}
                      alt={selectedStory.title}
                      className="w-full h-48 object-cover rounded-xl"
                    />
                  )}

                  <div>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold border capitalize ${STATUS_COLORS[selectedStory.status] || ''}`}>
                      {selectedStory.status}
                    </span>
                    <h3 className="text-xl font-serif font-bold text-gray-800 mt-2">{selectedStory.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">{selectedStory.caption}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <DetailItem label="Customer" value={selectedStory.customerName} />
                    <DetailItem label="Email" value={selectedStory.email} />
                    <DetailItem label="Mobile" value={selectedStory.mobile} />
                    <DetailItem label="City" value={selectedStory.city || '—'} />
                    <DetailItem label="Occasion" value={`${occasionEmoji[selectedStory.occasion] || ''} ${selectedStory.occasion}`} />
                    <DetailItem label="Date" value={formatDate(selectedStory.celebrationDate)} />
                    <DetailItem label="Duration" value={selectedStory.storyDuration} />
                    <DetailItem label="Visibility" value={selectedStory.status} />
                  </div>

                  {selectedStory.personalMessage && (
                    <div className="p-3 bg-gray-50 rounded-xl">
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Personal Message</span>
                      <p className="text-sm text-gray-700 mt-1 italic">"{selectedStory.personalMessage}"</p>
                    </div>
                  )}

                  {selectedStory.photos?.length > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">Photos ({selectedStory.photos.length})</span>
                      <div className="flex gap-2 mt-1 overflow-x-auto">
                        {selectedStory.photos.map((url, i) => (
                          <img key={i} src={url} alt="" className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t">
                    {selectedStory.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStory(selectedStory._id, { status: 'approved' })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 text-white text-xs font-semibold hover:bg-green-600"
                        >
                          <Check className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button
                          onClick={() => updateStory(selectedStory._id, { status: 'rejected' })}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-500 text-white text-xs font-semibold hover:bg-red-600"
                        >
                          <X className="w-3.5 h-3.5" /> Reject
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => updateStory(selectedStory._id, { status: 'published' })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-500 text-white text-xs font-semibold hover:bg-blue-600"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Publish Now
                    </button>
                    <button
                      onClick={() => updateStory(selectedStory._id, { isFeatured: !selectedStory.isFeatured })}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-purple-500 text-white text-xs font-semibold hover:bg-purple-600"
                    >
                      <Star className="w-3.5 h-3.5" /> {selectedStory.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      onClick={() => deleteStory(selectedStory._id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-red-100 text-red-600 text-xs font-semibold hover:bg-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Sub-components ──
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: number; color: string; bg: string }> = ({ icon, label, value, color, bg }) => (
  <div className={`${bg} rounded-xl p-4 border border-gray-100`}>
    <div className={`${color} mb-2`}>{icon}</div>
    <p className="text-2xl font-bold text-gray-800">{value}</p>
    <span className="text-[10px] font-semibold text-gray-400 uppercase">{label}</span>
  </div>
);

const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <span className="text-[10px] font-bold text-gray-400 uppercase">{label}</span>
    <p className="text-sm text-gray-700">{value}</p>
  </div>
);

export default AdminStoryDashboard;
