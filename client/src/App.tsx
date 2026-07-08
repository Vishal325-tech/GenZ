import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Contexts
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Footer from './components/Footer';
import AIChatBot from './components/AIChatBot';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import TrackOrder from './pages/TrackOrder';
import Account from './pages/Account';
import Login from './pages/Login';

import Blogs from './pages/Blogs';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';
import OccasionPage from './pages/OccasionPage';
import DeliveryDashboard from './pages/DeliveryDashboard';
import SubmitStory from './pages/SubmitStory';
import StoryArchive from './pages/StoryArchive';
import AdminStoryDashboard from './pages/AdminStoryDashboard';

// Helper component to conditionally hide nav/footer on admin/delivery pages and enforce login
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isSpecialPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery');
  const isHome = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen bg-luxury-cream dark:bg-luxury-black-dark">
      {!isSpecialPath && <Navbar />}
      <div className="flex flex-grow relative max-w-[100vw]">
        {!isSpecialPath && !isHome && <Sidebar />}
        <main className="flex-grow w-full min-w-0 relative flex flex-col">
          {children}
        </main>
      </div>
      {!isSpecialPath && <Footer />}
      {!isSpecialPath && <AIChatBot />}
      
      {/* Global Floating Whatsapp Chat widget */}
      {!isSpecialPath && (
        <a
          href="https://wa.me/9108531238?text=Hello%20GENZ%20Royal%20Hampers!%20I%20would%20like%20to%20know%20more%20about%20your%20premium%20gifting%20services."
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-[6.5rem] right-6 z-40 bg-[#25D366] text-white p-3.5 rounded-full shadow-[0_0_15px_rgba(37,211,102,0.4)] hover:scale-110 transition-all hover:shadow-[0_0_20px_rgba(37,211,102,0.6)] animate-fade-in-up"
          title="WhatsApp Chat Support"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current">
            <path d="M12.012 2c-5.506 0-9.989 4.478-9.99 9.984a9.96 9.96 0 0 0 1.333 4.993L2 22l5.233-1.371a9.936 9.936 0 0 0 4.777 1.224h.005c5.505 0 9.988-4.478 9.989-9.985 0-2.669-1.038-5.176-2.926-7.067A9.922 9.922 0 0 0 12.012 2zm5.792 14.156c-.318.895-1.572 1.637-2.185 1.765-.544.113-1.25.201-3.64-.789-3.056-1.266-5.029-4.38-5.181-4.584-.153-.204-1.22-1.626-1.22-3.107 0-1.48.775-2.208 1.05-2.514.275-.306.602-.383.803-.383.201 0 .401.002.576.01.182.008.427-.07.67.518.25.602.853 2.08.928 2.233.075.153.125.331.025.529-.1.199-.15.33-.298.503-.149.173-.313.385-.446.516-.149.146-.305.305-.131.602.174.298.773 1.272 1.657 2.057.901.802 1.66 1.05 1.895 1.164.234.114.37.095.508-.063.138-.159.593-.689.75-.923.159-.234.318-.196.536-.117.218.078 1.385.653 1.623.771.238.117.397.176.455.276.059.1.059.578-.26 1.474z" />
          </svg>
        </a>
      )}
    </div>
  );
};

// Wait, let's look at what we exported in CartContext.tsx.
// We exported CartProvider and useCart! So the import is correct if we import it from './context/CartContext'.
// Let's make sure we double-check the path. The import above says:
// import { CartProvider } from './context/CartProvider';
// That is incorrect! It should be './context/CartContext'. Let's fix that in the code block.

import AdminLayout from './components/admin/AdminLayout';
import AdminProtectedRoute from './components/admin/AdminProtectedRoute';
import AdminSignIn from './pages/admin/auth/AdminSignIn';
import AdminSignUp from './pages/admin/auth/AdminSignUp';
import AdminForgotPassword from './pages/admin/auth/AdminForgotPassword';
import AdminResetPassword from './pages/admin/auth/AdminResetPassword';
import AdminVerifyOTP from './pages/admin/auth/AdminVerifyOTP';

import Dashboard from './pages/admin/Dashboard';
import CustomerManagement from './pages/admin/CustomerManagement';
import OrderManagement from './pages/admin/OrderManagement';
import ShopManagement from './pages/admin/ShopManagement';

import { 
  CompanyManagement, MediaLibrary, DeliveryManagement,
  Coupons, Reviews, Blogs as AdminBlogs, Notifications, Reports, Settings, Admins 
} from './pages/admin/Placeholders';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AdminAuthProvider>
            <CartProvider>
              <WishlistProvider>
              <Router basename={import.meta.env.BASE_URL}>
                <LayoutWrapper>
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/product/:id" element={<ProductDetails />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/track-order/:id" element={<TrackOrder />} />
                    <Route path="/account" element={<Account />} />

                    <Route path="/blogs" element={<Blogs />} />
                    <Route path="/gallery" element={<Gallery />} />
                    <Route path="/occasion/:occasionName" element={<OccasionPage />} />
                    <Route path="/delivery" element={<DeliveryDashboard />} />
                    <Route path="/stories/submit" element={<SubmitStory />} />
                    <Route path="/stories/archive" element={<StoryArchive />} />
                    <Route path="/stories" element={<StoryArchive />} />
                    
                    {/* Admin Portal Routes */}
                    <Route path="/admin">
                      {/* Auth Routes */}
                      <Route path="login" element={<AdminSignIn />} />
                      <Route path="signup" element={<AdminSignUp />} />
                      <Route path="forgot-password" element={<AdminForgotPassword />} />
                      <Route path="reset-password" element={<AdminResetPassword />} />
                      <Route path="verify-otp" element={<AdminVerifyOTP />} />

                      {/* Protected Dashboard Routes */}
                      <Route element={<AdminProtectedRoute />}>
                        <Route element={<AdminLayout />}>
                          <Route index element={<Dashboard />} />
                          <Route path="company" element={<CompanyManagement />} />
                          <Route path="customers" element={<CustomerManagement />} />
                          <Route path="orders" element={<OrderManagement />} />
                          <Route path="products" element={<ShopManagement />} />
                          <Route path="categories" element={<ShopManagement />} />
                          <Route path="stories" element={<AdminStoryDashboard />} />
                          <Route path="gallery" element={<MediaLibrary />} />
                          <Route path="media" element={<MediaLibrary />} />
                          <Route path="delivery" element={<DeliveryManagement />} />
                          <Route path="coupons" element={<Coupons />} />
                          <Route path="reviews" element={<Reviews />} />
                          <Route path="blogs" element={<AdminBlogs />} />
                          <Route path="notifications" element={<Notifications />} />
                          <Route path="reports" element={<Reports />} />
                          <Route path="settings" element={<Settings />} />
                          <Route path="admins" element={<Admins />} />
                        </Route>
                      </Route>
                    </Route>
                    
                    {/* Redirect login and all unknown routes to home */}
                    <Route path="/login" element={<Login />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </LayoutWrapper>
              </Router>
            </WishlistProvider>
            </CartProvider>
          </AdminAuthProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
