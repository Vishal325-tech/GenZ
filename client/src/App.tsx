import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from 'react-router-dom';

// Contexts
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
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

import Blogs from './pages/Blogs';
import Gallery from './pages/Gallery';
import AdminDashboard from './pages/AdminDashboard';
import OccasionPage from './pages/OccasionPage';
import DeliveryDashboard from './pages/DeliveryDashboard';

// Helper component to conditionally hide nav/footer on admin/delivery pages and enforce login
const LayoutWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const isSpecialPath = location.pathname.startsWith('/admin') || location.pathname.startsWith('/delivery');

  return (
    <div className="flex flex-col min-h-screen bg-luxury-cream dark:bg-luxury-black-dark">
      {!isSpecialPath && <Navbar />}
      <div className="flex flex-grow relative max-w-[100vw]">
        {!isSpecialPath && <Sidebar />}
        <main className="flex-grow w-full min-w-0 relative flex flex-col">
          {children}
        </main>
      </div>
      {!isSpecialPath && <Footer />}
      {!isSpecialPath && <AIChatBot />}
    </div>
  );
};

// Wait, let's look at what we exported in CartContext.tsx.
// We exported CartProvider and useCart! So the import is correct if we import it from './context/CartContext'.
// Let's make sure we double-check the path. The import above says:
// import { CartProvider } from './context/CartProvider';
// That is incorrect! It should be './context/CartContext'. Let's fix that in the code block.

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          {/* Note: In CartContext.tsx we declared CartProvider. We import from CartContext */}
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
                    <Route path="/admin" element={<AdminDashboard />} />
                    <Route path="/occasion/:occasionName" element={<OccasionPage />} />
                    <Route path="/delivery" element={<DeliveryDashboard />} />
                    
                    {/* Redirect login and all unknown routes to home */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </LayoutWrapper>
              </Router>
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
