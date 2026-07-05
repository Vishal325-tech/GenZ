import React, { createContext, useContext, useEffect, useState } from 'react';

export interface PersonalizationType {
  photo?: string;
  video?: string;
  greetingCard?: string;
  customMessage?: string;
  wrap?: string;
  ribbonColor?: string;
  deliveryDate?: string;
  deliveryTime?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  personalization: PersonalizationType;
}

export interface CouponType {
  code: string;
  discountPercent: number;
}

interface CartContextType {
  cartItems: CartItem[];
  coupon: CouponType | null;
  addToCart: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  updatePersonalization: (productId: string, personalization: PersonalizationType) => void;
  applyCoupon: (code: string) => Promise<string>;
  removeCoupon: () => void;
  clearCart: () => void;
  cartSubtotal: number;
  discountAmount: number;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('gift_movers_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [coupon, setCoupon] = useState<CouponType | null>(() => {
    const saved = localStorage.getItem('gift_movers_coupon');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    localStorage.setItem('gift_movers_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    if (coupon) {
      localStorage.setItem('gift_movers_coupon', JSON.stringify(coupon));
    } else {
      localStorage.removeItem('gift_movers_coupon');
    }
  }, [coupon]);

  const addToCart = (item: Omit<CartItem, 'quantity'>, qty = 1) => {
    setCartItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      if (existing) {
        return prev.map(i =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + qty }
            : i
        );
      }
      return [...prev, { ...item, quantity: qty }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    );
  };

  const updatePersonalization = (productId: string, personalization: PersonalizationType) => {
    setCartItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, personalization: { ...item.personalization, ...personalization } }
          : item
      )
    );
  };

  const applyCoupon = async (code: string): Promise<string> => {
    try {
      const res = await fetch(`/api/coupons/validate/${code.toUpperCase()}`);
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Coupon validation failed');
      }
      setCoupon({
        code: data.code,
        discountPercent: data.discountPercent
      });
      return `Coupon applied successfully! ${data.discountPercent}% discount active.`;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to apply coupon.');
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
  };

  const clearCart = () => {
    setCartItems([]);
    setCoupon(null);
  };

  // Calculations
  const cartSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = coupon ? (cartSubtotal * coupon.discountPercent) / 100 : 0;
  const cartTotal = Math.max(0, cartSubtotal - discountAmount);
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      coupon,
      addToCart,
      removeFromCart,
      updateQuantity,
      updatePersonalization,
      applyCoupon,
      removeCoupon,
      clearCart,
      cartSubtotal,
      discountAmount,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
