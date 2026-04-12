'use client';

import { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { Product } from './data';
import { SHOP_INFO } from './data';

export interface CartItem { product: Product; quantity: number; }

// ── Coupon codes ──
export const COUPONS: Record<string, { discount: number; type: 'percent' | 'flat'; label: string }> = {
  'NEW50':   { discount: 50, type: 'percent', label: '50% off (max ₹100)' },
  'FREEDEL': { discount: 30, type: 'flat',    label: 'Free Delivery' },
  'WEEKEND': { discount: 20, type: 'percent', label: '20% off on all orders' },
  'MOMOS10': { discount: 10, type: 'flat',    label: '₹10 off on momos' },
  'FIRST':   { discount: 30, type: 'flat',    label: '₹30 off on first order' },
};

export function applyCoupon(code: string, subtotal: number): { valid: boolean; savings: number; message: string } {
  const c = COUPONS[code.toUpperCase()];
  if (!c) return { valid: false, savings: 0, message: 'Invalid coupon code' };
  if (subtotal < 50) return { valid: false, savings: 0, message: 'Min order ₹50 required' };
  let savings = c.type === 'percent'
    ? Math.min(Math.round((subtotal * c.discount) / 100), code === 'NEW50' ? 100 : 9999)
    : c.discount;
  return { valid: true, savings, message: `${c.label} applied! ✅` };
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  coupon: string;
  couponSavings: number;
  wishlist: string[];   // product IDs
  recentOrders: RecentOrder[];
  address: SavedAddress | null;
  userName: string;
}

export interface RecentOrder {
  id: string;
  date: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  status: 'delivered' | 'cancelled' | 'processing';
}

export interface SavedAddress {
  area: string;
  address: string;
  label: string;
}

type CartAction =
  | { type: 'ADD_ITEM'; product: Product }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'APPLY_COUPON'; code: string; savings: number }
  | { type: 'REMOVE_COUPON' }
  | { type: 'TOGGLE_WISHLIST'; productId: string }
  | { type: 'ADD_ORDER'; order: RecentOrder }
  | { type: 'SET_ADDRESS'; address: SavedAddress }
  | { type: 'SET_USER_NAME'; name: string }
  | { type: 'HYDRATE'; state: Partial<CartState> };

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.items.find(i => i.product.id === action.product.id);
      return {
        ...state,
        items: existing
          ? state.items.map(i => i.product.id === action.product.id ? { ...i, quantity: i.quantity + 1 } : i)
          : [...state.items, { product: action.product, quantity: 1 }],
        isOpen: true,
      };
    }
    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter(i => i.product.id !== action.productId) };
    case 'UPDATE_QUANTITY':
      if (action.quantity <= 0) return { ...state, items: state.items.filter(i => i.product.id !== action.productId) };
      return { ...state, items: state.items.map(i => i.product.id === action.productId ? { ...i, quantity: action.quantity } : i) };
    case 'CLEAR_CART':
      return { ...state, items: [], coupon: '', couponSavings: 0 };
    case 'TOGGLE_CART':
      return { ...state, isOpen: !state.isOpen };
    case 'OPEN_CART':
      return { ...state, isOpen: true };
    case 'CLOSE_CART':
      return { ...state, isOpen: false };
    case 'APPLY_COUPON':
      return { ...state, coupon: action.code, couponSavings: action.savings };
    case 'REMOVE_COUPON':
      return { ...state, coupon: '', couponSavings: 0 };
    case 'TOGGLE_WISHLIST': {
      const has = state.wishlist.includes(action.productId);
      return { ...state, wishlist: has ? state.wishlist.filter(id => id !== action.productId) : [...state.wishlist, action.productId] };
    }
    case 'ADD_ORDER':
      return { ...state, recentOrders: [action.order, ...state.recentOrders].slice(0, 20) };
    case 'SET_ADDRESS':
      return { ...state, address: action.address };
    case 'SET_USER_NAME':
      return { ...state, userName: action.name };
    case 'HYDRATE':
      return { ...state, ...action.state };
    default:
      return state;
  }
}

const INITIAL: CartState = {
  items: [], isOpen: false, coupon: '', couponSavings: 0,
  wishlist: [], recentOrders: [], address: null, userName: '',
};

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyCouponCode: (code: string) => { valid: boolean; message: string };
  removeCoupon: () => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (order: RecentOrder) => void;
  setAddress: (address: SavedAddress) => void;
  setUserName: (name: string) => void;
  itemCount: number;
  subtotal: number;
  couponSavings: number;
  coupon: string;
  deliveryFee: number;
  total: number;
  wishlist: string[];
  recentOrders: RecentOrder[];
  address: SavedAddress | null;
  userName: string;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'meghna_kitchen_state';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, INITIAL);

  // Persist to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as Partial<CartState>;
        dispatch({ type: 'HYDRATE', state: { ...parsed, isOpen: false } });
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      const { isOpen, ...rest } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    } catch {}
  }, [state]);

  const addItem = useCallback((product: Product) => dispatch({ type: 'ADD_ITEM', product }), []);
  const removeItem = useCallback((productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }), []);
  const updateQuantity = useCallback((productId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);
  const removeCoupon = useCallback(() => dispatch({ type: 'REMOVE_COUPON' }), []);
  const toggleWishlist = useCallback((productId: string) => dispatch({ type: 'TOGGLE_WISHLIST', productId }), []);
  const addOrder = useCallback((order: RecentOrder) => dispatch({ type: 'ADD_ORDER', order }), []);
  const setAddress = useCallback((address: SavedAddress) => dispatch({ type: 'SET_ADDRESS', address }), []);
  const setUserName = useCallback((name: string) => dispatch({ type: 'SET_USER_NAME', name }), []);

  const applyCouponCode = useCallback((code: string) => {
    const subtotal = state.items.reduce((s, i) => s + i.product.price * i.quantity, 0);
    const result = applyCoupon(code, subtotal);
    if (result.valid) dispatch({ type: 'APPLY_COUPON', code: code.toUpperCase(), savings: result.savings });
    return { valid: result.valid, message: result.message };
  }, [state.items]);

  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
  const deliveryFee = subtotal >= SHOP_INFO.freeDeliveryAbove ? 0 : state.couponSavings > 0 && state.coupon === 'FREEDEL' ? 0 : (subtotal > 0 ? SHOP_INFO.deliveryFee : 0);
  const total = Math.max(0, subtotal + deliveryFee - state.couponSavings);

  return (
    <CartContext.Provider value={{
      items: state.items, isOpen: state.isOpen,
      addItem, removeItem, updateQuantity, clearCart, toggleCart, openCart, closeCart,
      applyCouponCode, removeCoupon, toggleWishlist, addOrder, setAddress, setUserName,
      itemCount, subtotal, couponSavings: state.couponSavings, coupon: state.coupon,
      deliveryFee, total, wishlist: state.wishlist, recentOrders: state.recentOrders,
      address: state.address, userName: state.userName,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
