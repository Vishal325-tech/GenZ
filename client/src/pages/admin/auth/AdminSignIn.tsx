import React, { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminAuth } from '../../../context/AdminAuthContext';

const AdminSignIn: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { adminLogin, adminToken } = useAdminAuth();

  // Redirect to dashboard if already logged in
  if (adminToken) {
    return <Navigate to="/admin" replace />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      await adminLogin(email, password);
      navigate('/admin');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl shadow-luxury-gold/10"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-luxury-gold to-yellow-300 flex items-center justify-center text-white font-bold font-serif text-3xl mx-auto mb-4 shadow-lg shadow-luxury-gold/30">
            G
          </div>
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Admin Portal</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Sign in to manage Royal Hampers</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Email Address</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all"
                placeholder="admin@genz.com"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">Password</label>
              <Link to="/admin/forgot-password" className="text-xs font-medium text-luxury-gold hover:underline">Forgot password?</Link>
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full flex justify-center items-center gap-2 py-3.5 bg-gradient-to-r from-luxury-gold to-yellow-500 hover:from-luxury-gold-dark hover:to-luxury-gold text-white rounded-xl text-sm font-bold shadow-lg shadow-luxury-gold/20 transition-all active:scale-[0.98]"
          >
            <LogIn size={18} />
            Sign In
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Don't have an admin account? <Link to="/admin/signup" className="font-semibold text-luxury-gold hover:underline">Request access</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSignIn;
