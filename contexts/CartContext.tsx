
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product, CartItem } from '../types';

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const savedCart = localStorage.getItem('jx4_cart');
      if (!savedCart) return [];
      const parsed = JSON.parse(savedCart);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error('Failed to load cart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('jx4_cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const existing = safePrev.find(item => item && item.id === product.id);
      if (existing) {
        return safePrev.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...safePrev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.filter(item => item && item.id !== productId);
    });
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prev => {
      const safePrev = Array.isArray(prev) ? prev : [];
      return safePrev.map(item => 
        item && item.id === productId ? { ...item, quantity } : item
      );
    });
  };

  const clearCart = () => setCart([]);

  const safeCart = Array.isArray(cart) ? cart : [];
  const cartTotal = safeCart.reduce((acc, item) => acc + (item ? item.precio * item.quantity : 0), 0);
  const cartCount = safeCart.reduce((acc, item) => acc + (item ? item.quantity : 0), 0);

  return (
    <CartContext.Provider value={{ cart: safeCart, addToCart, removeFromCart, updateQuantity, clearCart, cartTotal, cartCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
