'use client';

import React, { createContext, useContext, useEffect, useReducer } from 'react';
import { showSuccessToast, showInfoToast } from '../components/Toast';

type CartItem = {
  id: string;
  name: string;
  tagline: string;
  price: number;
  licenseType: string;
  bundles: string[];
  imageUrl?: string;
};

type CartState = {
  items: CartItem[];
  isLoading: boolean;
};

type Action =
  | { type: 'ADD_ITEM'; payload: CartItem }
  | { type: 'REMOVE_ITEM'; payload: { id: string } }
  | { type: 'CLEAR_CART' }
  | { type: 'SET_CART'; payload: CartItem[] }
  | { type: 'SET_LOADING'; payload: boolean };

const initialState: CartState = { 
  items: [],
  isLoading: true
};

function areBundlesEqual(a: string[], b: string[]) {
  return a.length === b.length && a.every(val => b.includes(val));
}

function cartReducer(state: CartState, action: Action): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingIndex = state.items.findIndex(item => item.id === action.payload.id);
      if (existingIndex !== -1) {
        const existing = state.items[existingIndex];
        const sameLicense = existing?.licenseType === action.payload.licenseType;
        const sameBundles = areBundlesEqual(existing?.bundles || [], action.payload.bundles);

        if (sameLicense && sameBundles) {
          showInfoToast('Already in the cart');
          return state;
        }

        // Replace the existing one with new license/bundles
        const updatedItems = [...state.items];
        updatedItems[existingIndex] = action.payload;
        return { ...state, items: updatedItems };
      }
      showSuccessToast("Added to the cart");
      return { ...state, items: [...state.items, action.payload] };
    }

    case 'REMOVE_ITEM':
      return { 
        ...state, 
        items: state.items.filter(item => item.id !== action.payload.id) 
      };

    case 'CLEAR_CART':
      return { 
        ...state, 
        items: [] 
      };

    case 'SET_CART':
      return { 
        ...state, 
        items: action.payload,
        isLoading: false
      };

    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };

    default:
      return state;
  }
}

const CartContext = createContext<{
  state: CartState;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
} | null>(null);

export const CartProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Load cart from localStorage on client-side mount
  useEffect(() => {
    const loadCart = () => {
      try {
        dispatch({ type: 'SET_LOADING', payload: true });
        
        if (typeof window === 'undefined') return;
        
        const stored = localStorage.getItem('cart');
        if (stored) {
          const parsedCart = JSON.parse(stored);
          if (Array.isArray(parsedCart) && parsedCart.length > 0) {
            dispatch({ type: 'SET_CART', payload: parsedCart });
          }
        }
      } catch (e) {
        console.error('Error loading cart:', e);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };

    loadCart();
  }, []);

  // Update localStorage whenever cart changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart', JSON.stringify(state.items));
    }
  }, [state.items]);

  const addItem = (item: CartItem) => {
    dispatch({ type: 'ADD_ITEM', payload: item });
  };
  
  const removeItem = (id: string) => {
    dispatch({ type: 'REMOVE_ITEM', payload: { id } });
  };
  
  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('cart');
    }
  };

  return (
    <CartContext.Provider value={{ state, addItem, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside CartProvider');
  return context;
};