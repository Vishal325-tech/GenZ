import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminResetPassword: React.FC = () => {
  const navigate = useNavigate();
  const [success, setSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      navigate('/admin/signin');
    }, 2000);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl text-center"
        >
          <CheckCircle2 size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-xl font-bold dark:text-white">Password Reset Successful</h2>
          <p className="text-sm text-gray-500 mt-2">Redirecting to sign in...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl shadow-luxury-gold/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">New Password</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Create a new secure password.</p>
        </div>

        <form className="space-y-5" onSubmit={handleReset}>
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">New Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Confirm Password</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-luxury-gold to-yellow-500 hover:from-luxury-gold-dark hover:to-luxury-gold text-white rounded-xl text-sm font-bold shadow-lg shadow-luxury-gold/20 transition-all active:scale-[0.98]"
          >
            Reset Password
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AdminResetPassword;
