import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StatCard from '../../components/admin/StatCard';
import { DollarSign, ShoppingCart, Users, Package, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { generatePDFReport } from '../../utils/reportGenerator';

interface Trend {
  value: string | number;
  isPositive: boolean;
}

interface DashboardStats {
  todaySales: number;
  totalSales: number;
  totalOrders: number;
  todayOrders: number;
  totalCustomers: number;
  activeProducts: number;
  trends: {
    sales: Trend;
    orders: Trend;
    customers: Trend;
    products: Trend;
  };
  revenueData: { name: string; revenue: number }[];
  topProducts: { _id: string; name: string; price: number; sales: number }[];
}

const Dashboard: React.FC = () => {
  const { adminToken } = useAdminAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/admin/dashboard/stats', {
          headers: {
            Authorization: `Bearer ${adminToken}`
          }
        });
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard stats', err);
      } finally {
        setLoading(false);
      }
    };
    if (adminToken) {
      fetchStats();
    }
  }, [adminToken]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
  };

  const handleExportReport = () => {
    if (!stats) return;
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Summary Stats
    csvContent += "Dashboard Summary Report\n\n";
    csvContent += `Metric,Value\n`;
    csvContent += `Today's Sales,${stats.todaySales}\n`;
    csvContent += `Total Sales,${stats.totalSales}\n`;
    csvContent += `Today's Orders,${stats.todayOrders}\n`;
    csvContent += `Total Orders,${stats.totalOrders}\n`;
    csvContent += `Total Customers,${stats.totalCustomers}\n`;
    csvContent += `Active Products,${stats.activeProducts}\n\n`;
    
    // Top Products
    csvContent += "Top Selling Products\n";
    csvContent += "Product Name,Price,Total Sales\n";
    stats.topProducts.forEach(p => {
      // Escape commas in names
      const name = p.name.includes(',') ? `"${p.name}"` : p.name;
      csvContent += `${name},${p.price},${p.sales}\n`;
    });
    
    // Trigger download
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `store_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="flex items-center gap-3">
          <select className="bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-800 rounded-lg px-4 py-2 text-sm font-medium focus:outline-none focus:border-luxury-gold dark:text-white">
            <option>Today</option>
            <option>Last 7 Days</option>
            <option>This Month</option>
            <option>This Year</option>
          </select>
          <button 
            onClick={handleExportReport}
            className="bg-gray-100 hover:bg-gray-200 dark:bg-neutral-800 dark:hover:bg-neutral-700 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm transition-colors"
          >
            Export CSV
          </button>
          <button 
            onClick={() => stats && generatePDFReport(stats)}
            className="bg-luxury-gold hover:bg-luxury-gold-hover text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-colors"
          >
            Export PDF
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales" 
          value={loading ? '...' : formatCurrency(stats?.todaySales || 0)} 
          icon={<DollarSign size={24} />} 
          trend={stats?.trends?.sales ? { value: `${stats.trends.sales.value}%`, isPositive: stats.trends.sales.isPositive } : undefined}
          delay={0}
          to="/admin/reports"
        />
        <StatCard 
          title="Total Orders" 
          value={loading ? '...' : (stats?.totalOrders || 0).toLocaleString()} 
          icon={<ShoppingCart size={24} />} 
          trend={stats?.trends?.orders ? { value: `${stats.trends.orders.value}%`, isPositive: stats.trends.orders.isPositive } : undefined}
          delay={0.1}
          to="/admin/orders"
        />
        <StatCard 
          title="Total Customers" 
          value={loading ? '...' : (stats?.totalCustomers || 0).toLocaleString()} 
          icon={<Users size={24} />} 
          trend={stats?.trends?.customers ? { value: `${stats.trends.customers.value}%`, isPositive: stats.trends.customers.isPositive } : undefined}
          delay={0.2}
          to="/admin/customers"
        />
        <StatCard 
          title="Active Products" 
          value={loading ? '...' : (stats?.activeProducts || 0).toLocaleString()} 
          icon={<Package size={24} />} 
          trend={stats?.trends?.products ? { value: `${stats.trends.products.value}%`, isPositive: stats.trends.products.isPositive } : undefined}
          delay={0.3}
          to="/admin/products"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="lg:col-span-2 bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-neutral-800/50 rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Revenue Overview</h3>
            <Link to="/admin/reports" className="text-sm font-medium text-luxury-gold hover:underline">View Details</Link>
          </div>
          <div className="flex-1 min-h-[250px] w-full">
            {loading ? (
              <div className="w-full h-full flex justify-center items-center">
                <div className="w-8 h-8 rounded-full border-2 border-luxury-gold border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.revenueData || []} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" className="dark:stroke-neutral-800" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9ca3af' }} dy={10} />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: '#9ca3af' }}
                    tickFormatter={(value) => `₹${value >= 1000 ? (value / 1000).toFixed(0) + 'k' : value}`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                    formatter={(value: number) => [formatCurrency(value), 'Revenue']}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#D4AF37" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Top Selling Products Placeholder */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-neutral-800/50 rounded-2xl p-6 shadow-sm flex flex-col"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg font-bold text-gray-900 dark:text-white">Top Products</h3>
            <TrendingUp size={18} className="text-luxury-gold" />
          </div>
          <div className="space-y-4 flex-1">
            {loading ? (
              <div className="flex justify-center py-10"><div className="w-8 h-8 rounded-full border-2 border-luxury-gold border-t-transparent animate-spin"></div></div>
            ) : (
              stats?.topProducts?.map((product, i) => (
                <div key={product._id || i} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-neutral-800 rounded-lg transition-colors cursor-pointer">
                  <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-neutral-800 flex-shrink-0 border border-gray-100 dark:border-neutral-700"></div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate">{product.name}</h4>
                    <p className="text-xs text-gray-500">{formatCurrency(product.price)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900 dark:text-white">{product.sales} sales</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;
