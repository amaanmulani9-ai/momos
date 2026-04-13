'use client';

import { createContext, useCallback, useContext, useEffect, useReducer, useRef } from 'react';
import {
  fallbackSettings,
  type OrderRecord,
  type ProductDetail,
} from '@/lib/customer-data';

export interface CartItem {
  product: ProductDetail;
  quantity: number;
}

export interface SavedAddress {
  label: string;
  area: string;
  address: string;
  placeId?: string;
  lat?: number;
  lng?: number;
}

export const COUPONS: Record<string, { discount: number; type: 'percent' | 'flat'; label: string; cap?: number }> = {
  NEW50: { discount: 50, type: 'percent', label: '50% off on your first order', cap: 100 },
  FREEDEL: { discount: fallbackSettings.deliveryFee, type: 'flat', label: 'Free delivery offer' },
  WEEKEND: { discount: 20, type: 'percent', label: '20% weekend savings' },
  MOMOS10: { discount: 10, type: 'flat', label: 'Flat Rs.10 off' },
};

export function applyCoupon(code: string, subtotal: number, deliveryFeeForOffers = fallbackSettings.deliveryFee) {
  const upper = code.toUpperCase();
  const coupon = COUPONS[upper];
  if (!coupon) {
    return { valid: false, savings: 0, message: 'Invalid coupon code' };
  }

  if (subtotal < 100) {
    return { valid: false, savings: 0, message: 'Minimum order is Rs.100' };
  }

  let savings =
    upper === 'FREEDEL'
      ? deliveryFeeForOffers
      : coupon.type === 'percent'
        ? Math.round((subtotal * coupon.discount) / 100)
        : coupon.discount;

  if (coupon.cap && upper !== 'FREEDEL') {
    savings = Math.min(savings, coupon.cap);
  }

  return {
    valid: true,
    savings,
    message: `${coupon.label} applied`,
  };
}

interface CustomerState {
  items: CartItem[];
  isOpen: boolean;
  coupon: string;
  couponSavings: number;
  wishlist: string[];
  recentOrders: OrderRecord[];
  address: SavedAddress | null;
  userName: string;
  userPhone: string;
}

type CustomerAction =
  | { type: 'HYDRATE'; state: Partial<CustomerState> }
  | { type: 'ADD_ITEM'; product: ProductDetail }
  | { type: 'REMOVE_ITEM'; productId: string }
  | { type: 'UPDATE_QUANTITY'; productId: string; quantity: number }
  | { type: 'CLEAR_CART' }
  | { type: 'TOGGLE_CART' }
  | { type: 'OPEN_CART' }
  | { type: 'CLOSE_CART' }
  | { type: 'APPLY_COUPON'; code: string; savings: number }
  | { type: 'REMOVE_COUPON' }
  | { type: 'TOGGLE_WISHLIST'; productId: string }
  | { type: 'ADD_ORDER'; order: OrderRecord }
  | { type: 'SET_ADDRESS'; address: SavedAddress }
  | { type: 'SET_USER_NAME'; name: string }
  | { type: 'SET_USER_PHONE'; phone: string };

const STORAGE_KEY = 'momos-marketplace-v1';

const INITIAL_STATE: CustomerState = {
  items: [],
  isOpen: false,
  coupon: '',
  couponSavings: 0,
  wishlist: [],
  recentOrders: [],
  address: null,
  userName: '',
  userPhone: '',
};

function reducer(state: CustomerState, action: CustomerAction): CustomerState {
  switch (action.type) {
    case 'HYDRATE': {
      const incoming = { ...action.state };
      if (incoming.items?.length) {
        incoming.items = incoming.items.filter((row) => Boolean(row.product?.restaurantId));
      }
      return { ...state, ...incoming, isOpen: false };
    }
    case 'ADD_ITEM': {
      const existingItem = state.items.find((item) => item.product.id === action.product.id);
      return {
        ...state,
        items: existingItem
          ? state.items.map((item) =>
              item.product.id === action.product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item,
            )
          : [...state.items, { product: action.product, quantity: 1 }],
      };
    }
    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter((item) => item.product.id !== action.productId),
      };
    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: action.quantity <= 0
          ? state.items.filter((item) => item.product.id !== action.productId)
          : state.items.map((item) =>
              item.product.id === action.productId
                ? { ...item, quantity: action.quantity }
                : item,
            ),
      };
    case 'CLEAR_CART':
      return {
        ...state,
        items: [],
        coupon: '',
        couponSavings: 0,
      };
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
    case 'TOGGLE_WISHLIST':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.productId)
          ? state.wishlist.filter((id) => id !== action.productId)
          : [...state.wishlist, action.productId],
      };
    case 'ADD_ORDER':
      return {
        ...state,
        recentOrders: [action.order, ...state.recentOrders.filter((order) => order.id !== action.order.id)].slice(0, 20),
      };
    case 'SET_ADDRESS':
      return { ...state, address: action.address };
    case 'SET_USER_NAME':
      return { ...state, userName: action.name };
    case 'SET_USER_PHONE':
      return { ...state, userPhone: action.phone };
    default:
      return state;
  }
}

interface CustomerContextValue {
  items: CartItem[];
  isOpen: boolean;
  coupon: string;
  couponSavings: number;
  wishlist: string[];
  recentOrders: OrderRecord[];
  address: SavedAddress | null;
  userName: string;
  userPhone: string;
  itemCount: number;
  subtotal: number;
  deliveryFee: number;
  total: number;
  addItem: (product: ProductDetail) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  applyCouponCode: (code: string) => { valid: boolean; message: string };
  removeCoupon: () => void;
  toggleWishlist: (productId: string) => void;
  addOrder: (order: OrderRecord) => void;
  getRecentOrderById: (orderId: string) => OrderRecord | undefined;
  setAddress: (address: SavedAddress) => void;
  setUserName: (name: string) => void;
  setUserPhone: (phone: string) => void;
}

const CustomerContext = createContext<CustomerContextValue | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(STORAGE_KEY);
      if (savedState) {
        dispatch({ type: 'HYDRATE', state: JSON.parse(savedState) as Partial<CustomerState> });
        return;
      }
      const legacy = localStorage.getItem('momos-customer-state');
      if (legacy) {
        const parsed = JSON.parse(legacy) as Partial<CustomerState>;
        if (parsed.items?.length && parsed.items.some((row) => !row.product?.restaurantId)) {
          dispatch({ type: 'HYDRATE', state: { ...parsed, items: [] } });
        } else {
          dispatch({ type: 'HYDRATE', state: parsed });
        }
      }
    } catch {
      // Ignore malformed local storage state and continue with defaults.
    }
  }, []);

  useEffect(() => {
    try {
      const { isOpen, ...persistedState } = state;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(persistedState));
    } catch {
      // Ignore storage failures.
    }
  }, [state]);

  const addItem = useCallback((product: ProductDetail) => {
    const current = stateRef.current;
    const first = current.items[0];
    if (
      first &&
      product.restaurantId &&
      first.product.restaurantId !== product.restaurantId
    ) {
      const ok =
        typeof window !== 'undefined' &&
        window.confirm(
          'Your cart has items from another restaurant. Clear the cart and add dishes from this one?',
        );
      if (!ok) {
        return;
      }
      dispatch({ type: 'CLEAR_CART' });
    }
    dispatch({ type: 'ADD_ITEM', product });
  }, []);
  const removeItem = useCallback((productId: string) => dispatch({ type: 'REMOVE_ITEM', productId }), []);
  const updateQuantity = useCallback((productId: string, quantity: number) => dispatch({ type: 'UPDATE_QUANTITY', productId, quantity }), []);
  const clearCart = useCallback(() => dispatch({ type: 'CLEAR_CART' }), []);
  const toggleCart = useCallback(() => dispatch({ type: 'TOGGLE_CART' }), []);
  const openCart = useCallback(() => dispatch({ type: 'OPEN_CART' }), []);
  const closeCart = useCallback(() => dispatch({ type: 'CLOSE_CART' }), []);
  const removeCoupon = useCallback(() => dispatch({ type: 'REMOVE_COUPON' }), []);
  const toggleWishlist = useCallback((productId: string) => dispatch({ type: 'TOGGLE_WISHLIST', productId }), []);
  const addOrder = useCallback((order: OrderRecord) => dispatch({ type: 'ADD_ORDER', order }), []);
  const setAddress = useCallback((address: SavedAddress) => dispatch({ type: 'SET_ADDRESS', address }), []);
  const setUserName = useCallback((name: string) => dispatch({ type: 'SET_USER_NAME', name }), []);
  const setUserPhone = useCallback((phone: string) => dispatch({ type: 'SET_USER_PHONE', phone }), []);

  const applyCouponCode = useCallback(
    (code: string) => {
      const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
      const deliveryForOffer =
        state.items[0]?.product.restaurantDeliveryFee ?? fallbackSettings.deliveryFee;
      const result = applyCoupon(code, subtotal, deliveryForOffer);
      if (result.valid) {
        dispatch({ type: 'APPLY_COUPON', code: code.toUpperCase(), savings: result.savings });
      }
      return {
        valid: result.valid,
        message: result.message,
      };
    },
    [state.items],
  );

  const itemCount = state.items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = state.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const freeDeliveryAbove =
    state.items[0]?.product.restaurantFreeDeliveryAbove ?? fallbackSettings.freeDeliveryAbove;
  const lineDeliveryFee =
    state.items[0]?.product.restaurantDeliveryFee ?? fallbackSettings.deliveryFee;
  const deliveryFee =
    subtotal === 0
      ? 0
      : state.coupon === 'FREEDEL' || subtotal >= freeDeliveryAbove
        ? 0
        : lineDeliveryFee;
  const total = Math.max(0, subtotal + deliveryFee - state.couponSavings);

  const getRecentOrderById = useCallback(
    (orderId: string) => state.recentOrders.find((order) => order.id === orderId),
    [state.recentOrders],
  );

  return (
    <CustomerContext.Provider
      value={{
        items: state.items,
        isOpen: state.isOpen,
        coupon: state.coupon,
        couponSavings: state.couponSavings,
        wishlist: state.wishlist,
        recentOrders: state.recentOrders,
        address: state.address,
        userName: state.userName,
        userPhone: state.userPhone,
        itemCount,
        subtotal,
        deliveryFee,
        total,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        toggleCart,
        openCart,
        closeCart,
        applyCouponCode,
        removeCoupon,
        toggleWishlist,
        addOrder,
        getRecentOrderById,
        setAddress,
        setUserName,
        setUserPhone,
      }}
    >
      {children}
    </CustomerContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCart must be used inside CartProvider');
  }
  return context;
}

