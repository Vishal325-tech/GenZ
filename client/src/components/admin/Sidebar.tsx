import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Building2, Users, ShoppingCart, Package, Tags, BookOpen, 
  Image as ImageIcon, FolderTree, Truck, Ticket, Star, FileText, Bell, 
  BarChart3, Settings, ShieldCheck, LogOut, ChevronLeft
} from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const { adminLogout } = useAdminAuth();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Company', path: '/admin/company', icon: Building2 },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Orders', path: '/admin/orders', icon: ShoppingCart },
    { name: 'Products', path: '/admin/products', icon: Package },
    { name: 'Categories', path: '/admin/categories', icon: Tags },
    { name: 'Stories', path: '/admin/stories', icon: BookOpen },
    { name: 'Gallery', path: '/admin/gallery', icon: ImageIcon },
    { name: 'Media Library', path: '/admin/media', icon: FolderTree },
    { name: 'Delivery', path: '/admin/delivery', icon: Truck },
    { name: 'Coupons', path: '/admin/coupons', icon: Ticket },
    { name: 'Reviews', path: '/admin/reviews', icon: Star },
    { name: 'Blogs', path: '/admin/blogs', icon: FileText },
    { name: 'Notifications', path: '/admin/notifications', icon: Bell },
    { name: 'Reports', path: '/admin/reports', icon: BarChart3 },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
    { name: 'Admins', path: '/admin/admins', icon: ShieldCheck },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-r border-gray-200 dark:border-neutral-800 flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Logo Area */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-luxury-gold to-yellow-300 flex items-center justify-center text-white font-bold font-serif text-xl">
              G
            </div>
            <span className="font-serif font-bold text-lg dark:text-white tracking-wide">Royal Admin</span>
          </div>
          <button 
            className="lg:hidden p-1 rounded-md text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800"
            onClick={() => setIsOpen(false)}
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive 
                      ? 'bg-luxury-gold/10 text-luxury-gold dark:bg-luxury-gold/20' 
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-neutral-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
                onClick={() => {
                  if (window.innerWidth < 1024) setIsOpen(false);
                }}
              >
                <Icon size={18} className="shrink-0" />
                <span className="truncate">{item.name}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-neutral-800 shrink-0">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
