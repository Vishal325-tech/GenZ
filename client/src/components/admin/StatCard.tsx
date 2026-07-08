import React from 'react';
import { motion } from 'framer-motion';

import { Link } from 'react-router-dom';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  delay?: number;
  to?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, delay = 0, to }) => {
  const cardContent = (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className={`bg-white/70 dark:bg-neutral-900/70 backdrop-blur-xl border border-gray-200/50 dark:border-neutral-800/50 rounded-2xl p-5 shadow-sm transition-all ${to ? 'hover:shadow-md hover:border-luxury-gold/50 hover:-translate-y-1 cursor-pointer' : 'hover:shadow-md'}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</h3>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-neutral-800 rounded-xl text-luxury-gold transition-colors hover:bg-luxury-gold/10">
          {icon}
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
            trend.isPositive 
              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
          }`}>
            {trend.isPositive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
        </div>
      )}
    </motion.div>
  );

  if (to) {
    return <Link to={to} className="block">{cardContent}</Link>;
  }

  return cardContent;
};

export default StatCard;
