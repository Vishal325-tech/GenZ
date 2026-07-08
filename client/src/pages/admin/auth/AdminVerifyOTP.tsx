import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminVerifyOTP: React.FC = () => {
  const navigate = useNavigate();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/admin/reset-password');
  };

  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl shadow-luxury-gold/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Verify OTP</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enter the 6-digit code sent to your email.</p>
        </div>

        <form className="space-y-5" onSubmit={handleVerify}>
          <div>
            <div className="relative">
              <KeyRound size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                required
                maxLength={6}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-center text-xl tracking-[0.5em] focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all font-mono"
                placeholder="000000"
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="w-full py-3.5 bg-gradient-to-r from-luxury-gold to-yellow-500 hover:from-luxury-gold-dark hover:to-luxury-gold text-white rounded-xl text-sm font-bold shadow-lg shadow-luxury-gold/20 transition-all active:scale-[0.98]"
          >
            Verify & Proceed
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

export default AdminVerifyOTP;
