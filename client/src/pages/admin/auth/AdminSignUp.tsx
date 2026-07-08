import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, Lock, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const AdminSignUp: React.FC = () => {
  return (
    <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl shadow-luxury-gold/10"
      >
        <div className="text-center mb-8">
          <h1 className="text-2xl font-serif font-bold text-gray-900 dark:text-white">Request Access</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Apply for a staff account</p>
        </div>

        {success ? (
          <div className="text-center py-8 text-green-600 dark:text-green-400">
            <p>Request submitted successfully! Awaiting approval.</p>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Full Name</label>
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Corporate Email</label>
              <div className="relative">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="email" 
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all"
                  placeholder="john@genz.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">Requested Role</label>
              <div className="relative">
                <ShieldCheck size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <select 
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-neutral-800 border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:ring-2 ring-luxury-gold/50 dark:text-white transition-all appearance-none"
                >
                  <option value="admin">Admin</option>
                  <option value="manager">Manager</option>
                  <option value="editor">Editor</option>
                  <option value="support">Customer Support</option>
                  <option value="delivery">Delivery Manager</option>
                </select>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full flex justify-center items-center py-3.5 bg-gray-900 dark:bg-white hover:bg-black dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-sm font-bold shadow-lg shadow-gray-900/20 transition-all active:scale-[0.98] disabled:opacity-70"
            >
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        )}

        <div className="mt-8 pt-6 border-t border-gray-100 dark:border-neutral-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Already have an account? <Link to="/admin/signin" className="font-semibold text-luxury-gold hover:underline">Sign In</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminSignUp;
