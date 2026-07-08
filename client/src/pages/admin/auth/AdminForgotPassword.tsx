import React from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminForgotPassword: React.FC = () => {
  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl shadow-luxury-gold/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Forgot Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enter your email to receive an OTP.</p>
        </div>

        <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); window.location.href = '#/admin/verify-otp'; }}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all"
                placeholder="admin@genz.com"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-luxury-gold to-yellow-500 hover:from-luxury-gold-dark hover:to-luxury-gold text-white rounded-xl text-sm font-bold shadow-lg shadow-luxury-gold/20 transition-all active:scale-[0.98]"
          >
            Send OTP
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 text-center">
          <Link to="/admin/signin" className="font-semibold text-gray-500 dark:text-gray-400 hover:text-luxury-gold text-sm transition-colors">
            ← Back to Sign In
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminForgotPassword;
