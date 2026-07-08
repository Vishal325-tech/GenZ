import React from 'react';
import { Menu, Bell, Search, UserCircle, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  return (
    <header className="h-16 bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-neutral-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 lg:hidden transition-colors"
        >
          <Menu size={20} />
        </button>
        
        {/* Search Bar - Hidden on extra small screens */}
        <div className="hidden sm:flex items-center bg-gray-100 dark:bg-neutral-800 rounded-lg px-3 py-1.5 focus-within:ring-2 ring-luxury-gold/50 transition-all">
          <Search size={16} className="text-gray-400" />
          <input 
            type="text" 
            placeholder="Search anything..." 
            className="bg-transparent border-none outline-none text-sm ml-2 w-48 lg:w-64 dark:text-gray-200 placeholder-gray-400"
          />
          <div className="flex items-center gap-1 ml-2">
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-sans font-medium text-gray-500 bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded">⌘</kbd>
            <kbd className="hidden lg:inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-sans font-medium text-gray-500 bg-white dark:bg-neutral-700 border border-gray-200 dark:border-neutral-600 rounded">K</kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors"
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        
        <div className="relative">
          <button className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-neutral-800 transition-colors relative">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-neutral-900"></span>
          </button>
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-neutral-700 mx-1 hidden sm:block"></div>

        <div className="flex items-center gap-3 cursor-pointer">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Admin User</span>
            <span className="text-[10px] font-medium text-luxury-gold uppercase tracking-wider">Super Admin</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-luxury-gold/20 flex items-center justify-center text-luxury-gold border border-luxury-gold/30">
            <UserCircle size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
