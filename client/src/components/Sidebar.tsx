import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Gift } from 'lucide-react';

const OCCASIONS = [
  'Birthday', 'Anniversary', "Valentine's Day", 'Baby Shower', 'Congratulations',
  'Graduation', 'Festivals', 'Christmas', 'House Warming', 'Father\'s Day',
  'Mother\'s Day', 'Wedding', 'Surprise Gifts', 'Corporate Gifts'
];

const Sidebar: React.FC = () => {
  const location = useLocation();

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 bg-[#FFF0F2]/50 dark:bg-luxury-black-soft/50 backdrop-blur-md border-r border-luxury-gold/20 shadow-[4px_0_24px_rgba(0,0,0,0.02)] transition-colors duration-300 relative z-10">
      <div className="sticky top-20 p-6 overflow-y-auto max-h-[calc(100vh-5rem)]">
        <div className="flex items-center space-x-2 mb-6 pb-4 border-b border-luxury-gold/20">
          <Gift className="h-5 w-5 text-luxury-gold" />
          <h3 className="font-serif font-bold text-luxury-black-dark dark:text-white uppercase tracking-widest text-xs">
            Shop by Occasion
          </h3>
        </div>
        <ul className="space-y-1.5">
          {OCCASIONS.map((occ) => {
            const path = `/occasion/${encodeURIComponent(occ)}`;
            const isActive = location.pathname === path;
            return (
              <li key={occ}>
                <Link
                  to={path}
                  className={`block px-4 py-2.5 rounded-lg text-sm transition-all duration-300 font-medium ${
                    isActive
                      ? 'bg-luxury-gold/10 text-luxury-red dark:text-luxury-gold border-l-2 border-luxury-red dark:border-luxury-gold'
                      : 'text-luxury-black/70 dark:text-white/70 hover:bg-white/60 dark:hover:bg-luxury-black hover:text-luxury-red dark:hover:text-luxury-gold hover:translate-x-1 border-l-2 border-transparent'
                  }`}
                >
                  {occ}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
};

export default Sidebar;
