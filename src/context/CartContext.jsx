import { createContext, useContext, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { AuthContext } from "./AuthContext.jsx";

const CartContext = createContext(null);

export const fmt = (value) =>
  Number(value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

function storageKey(userId) {
  return userId ? `hb_cart_${userId}` : "hb_cart_guest";
}

function loadCart(userId) {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

/**
 * Each cart item has the shape:
 * {
 *   key: string,          // unique key (e.g. productId + timestamp)
 *   productId?: string,
 *   comboId?: string,
 *   name: string,
 *   imageUrl?: string,
 *   basePrice: number,    // basePrice sem addons
 *   unitPrice: number,    // basePrice + addons price
 *   quantity: number,
 *   meatDoneness?: 'MAL_PASSADO' | 'AO_PONTO' | 'BEM_PASSADO',
 *   addons: [{ addonId, name, price, quantity }],
 *   removedIngredients: string[],
 *   notes: string,
 * }
 */
export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const userId = user?.id ?? null;

  const [items, setItems] = useState(() => loadCart(userId));
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    setItems(loadCart(userId));
  }, [userId]);

  useEffect(() => {
    localStorage.setItem(storageKey(userId), JSON.stringify(items));
  }, [items, userId]);

  const addItem = (item) => {
    setItems((prev) => {
      const existing = prev.find((e) => e.key === item.key);
      if (existing) {
        return prev.map((e) =>
          e.key === item.key
            ? { ...e, quantity: e.quantity + (item.quantity ?? 1) }
            : e,
        );
      }
      return [...prev, { ...item, quantity: item.quantity ?? 1 }];
    });
    toast.success(`${item.name} adicionado!`, {
      style: {
        background: "#222",
        color: "#F5A623",
        border: "1px solid #3A3A3A",
      },
      iconTheme: { primary: "#F5A623", secondary: "#000" },
    });
    setIsCartOpen(true);
  };

  const removeItem = (key) => {
    setItems((prev) => prev.filter((e) => e.key !== key));
  };

  const updateQuantity = (key, qty) => {
    if (qty <= 0) return removeItem(key);
    setItems((prev) =>
      prev.map((e) => (e.key === key ? { ...e, quantity: qty } : e)),
    );
  };

  const clearCart = () => setItems([]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const subtotal = useMemo(
    () => items.reduce((acc, e) => acc + e.unitPrice * e.quantity, 0),
    [items],
  );

  const totalItems = useMemo(
    () => items.reduce((acc, e) => acc + e.quantity, 0),
    [items],
  );

  const value = useMemo(
    () => ({
      items,
      isCartOpen,
      subtotal,
      totalItems,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      openCart,
      closeCart,
    }),
    [items, isCartOpen, subtotal, totalItems],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be inside CartProvider");
  return ctx;
}

export { CartContext };
