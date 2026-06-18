"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from "react";
import type { CartItem } from "@/types";

interface CartContextValue {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    variantId?: string
  ) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  totalItems: number;
  subtotal: number;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mosafa-cart";

function itemKey(productId: string, variantId?: string) {
  return `${productId}::${variantId ?? ""}`;
}

function readStoredCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? (JSON.parse(stored) as CartItem[]) : [];
  } catch {
    return [];
  }
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;
  hydrated: boolean;
}

type CartAction =
  | { type: "HYDRATE"; items: CartItem[] }
  | { type: "OPEN" }
  | { type: "CLOSE" }
  | { type: "ADD"; item: Omit<CartItem, "quantity">; quantity: number }
  | { type: "REMOVE"; productId: string; variantId?: string }
  | {
      type: "UPDATE_QTY";
      productId: string;
      variantId?: string;
      quantity: number;
    }
  | { type: "CLEAR" };

function addToItems(
  items: CartItem[],
  item: Omit<CartItem, "quantity">,
  quantity: number
): CartItem[] {
  const normalized = {
    ...item,
    variantId: item.variantId || undefined,
  };
  const key = itemKey(normalized.productId, normalized.variantId);
  const existing = items.find(
    (i) => itemKey(i.productId, i.variantId) === key
  );
  if (existing) {
    return items.map((i) =>
      itemKey(i.productId, i.variantId) === key
        ? { ...i, quantity: i.quantity + quantity }
        : i
    );
  }
  return [...items, { ...normalized, quantity }];
}

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "HYDRATE":
      return {
        ...state,
        items: state.items.length > 0 ? state.items : action.items,
        hydrated: true,
      };
    case "OPEN":
      return { ...state, isOpen: true };
    case "CLOSE":
      return { ...state, isOpen: false };
    case "ADD":
      return {
        items: addToItems(state.items, action.item, action.quantity),
        isOpen: true,
        hydrated: state.hydrated,
      };
    case "REMOVE": {
      const key = itemKey(action.productId, action.variantId);
      return {
        ...state,
        items: state.items.filter(
          (i) => itemKey(i.productId, i.variantId) !== key
        ),
      };
    }
    case "UPDATE_QTY": {
      const key = itemKey(action.productId, action.variantId);
      if (action.quantity <= 0) {
        return {
          ...state,
          items: state.items.filter(
            (i) => itemKey(i.productId, i.variantId) !== key
          ),
        };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          itemKey(i.productId, i.variantId) === key
            ? { ...i, quantity: action.quantity }
            : i
        ),
      };
    }
    case "CLEAR":
      return { ...state, items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isOpen: false,
    hydrated: false,
  });

  useEffect(() => {
    dispatch({ type: "HYDRATE", items: readStoredCart() });
  }, []);

  useEffect(() => {
    if (!state.hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items, state.hydrated]);

  useEffect(() => {
    if (!state.isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dispatch({ type: "CLOSE" });
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [state.isOpen]);

  const openCart = useCallback(() => dispatch({ type: "OPEN" }), []);
  const closeCart = useCallback(() => dispatch({ type: "CLOSE" }), []);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      dispatch({ type: "ADD", item, quantity });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId?: string) => {
    dispatch({ type: "REMOVE", productId, variantId });
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      dispatch({ type: "UPDATE_QTY", productId, variantId, quantity });
    },
    []
  );

  const clearCart = useCallback(() => dispatch({ type: "CLEAR" }), []);

  const totalItems = useMemo(
    () => state.items.reduce((sum, i) => sum + i.quantity, 0),
    [state.items]
  );

  const subtotal = useMemo(
    () => state.items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      items: state.items,
      isOpen: state.isOpen,
      hydrated: state.hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      totalItems,
      subtotal,
    }),
    [
      state.items,
      state.isOpen,
      state.hydrated,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
      totalItems,
      subtotal,
    ]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
