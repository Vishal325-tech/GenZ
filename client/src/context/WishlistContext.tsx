import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

export interface ProductType {
  _id: string;
  name: string;
  price: number;
  offerPrice?: number;
  description: string;
  stock: number;
  category: string;
  subCategory?: string;
  images: string[];
  videos?: string[];
  tags?: string[];
  ratingAverage: number;
}

interface WishlistContextType {
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, updateUser, token } = useAuth();
  const [localWishlist, setLocalWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('gift_movers_wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Sync state with authenticated user
  useEffect(() => {
    if (user && user.wishlist) {
      setLocalWishlist(user.wishlist);
    }
  }, [user]);

  const toggleWishlist = async (productId: string) => {
    let updatedWishlist: string[];
    
    if (localWishlist.includes(productId)) {
      updatedWishlist = localWishlist.filter(id => id !== productId);
    } else {
      updatedWishlist = [...localWishlist, productId];
    }
    
    setLocalWishlist(updatedWishlist);
    localStorage.setItem('gift_movers_wishlist', JSON.stringify(updatedWishlist));

    if (token && user) {
      try {
        await updateUser({ wishlist: updatedWishlist });
      } catch (err) {
        console.error('Failed to sync wishlist to server:', err);
      }
    }
  };

  const isInWishlist = (productId: string) => {
    return localWishlist.includes(productId);
  };

  return (
    <WishlistContext.Provider value={{
      wishlist: localWishlist,
      toggleWishlist,
      isInWishlist
    }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) throw new Error('useWishlist must be used within a WishlistProvider');
  return context;
};
