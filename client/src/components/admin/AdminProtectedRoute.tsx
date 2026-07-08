import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { ShieldAlert } from 'lucide-react';

const AdminProtectedRoute: React.FC = () => {
  const { adminUser, adminToken, adminLoading } = useAdminAuth();

  if (adminLoading) {
    return (
      <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex justify-center items-center">
        <div className="w-12 h-12 rounded-full border-4 border-luxury-gold border-t-transparent animate-spin"></div>
      </div>
    );
  }

  // Check if token exists
  if (!adminToken) {
    return <Navigate to="/admin/login" replace />;
  }

  // Check if user has an admin role
  const adminRoles = ['superadmin', 'admin', 'manager', 'editor', 'delivery', 'support'];
  if (!adminUser || !adminRoles.includes(adminUser.role)) {
    return (
      <div className="min-h-screen bg-luxury-cream dark:bg-neutral-950 flex flex-col justify-center items-center p-4">
        <div className="bg-white/80 dark:bg-neutral-900/80 backdrop-blur-xl border border-gray-200 dark:border-neutral-800 rounded-3xl p-8 shadow-2xl text-center max-w-md w-full">
          <ShieldAlert className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold dark:text-white">Access Denied</h2>
          <p className="text-sm text-gray-500 mt-2">
            Your account does not have the required permissions to access the enterprise portal.
          </p>
          <button 
            onClick={() => window.location.href = '/GenZ/'}
            className="mt-6 px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg text-sm font-bold shadow-lg"
          >
            Return to Store
          </button>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export default AdminProtectedRoute;
