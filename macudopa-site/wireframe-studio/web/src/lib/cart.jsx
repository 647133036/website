import { createContext, useContext, useState, useEffect } from 'react';
import { byId, productPrice } from './products.js';

const Cart = createContext(null);
export const useCart = () => useContext(Cart);

function load() {
  try {
    const raw = localStorage.getItem('mf_cart');
    const arr = raw ? JSON.parse(raw) : [];
    return arr.filter((i) => byId(i.id));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load());
  const [open, setOpen] = useState(false);
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    localStorage.setItem('mf_cart', JSON.stringify(items));
  }, [items]);

  const add = (productId, variantId, qty = 1) => {
    const p = byId(productId);
    if (!p) return;
    setItems((cur) => {
      const key = `${productId}|${variantId}`;
      const found = cur.find((i) => i.key === key);
      if (found) return cur.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...cur, { key: `${productId}|${variantId}`, id: productId, variant: variantId, qty }];
    });
    setOpen(true);
  };

  const setQty = (key, qty) => {
    setItems((cur) => (qty <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty } : i))));
  };
  const remove = (key) => setItems((cur) => cur.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const linePrice = (i) => {
    const p = byId(i.id);
    const v = p.variants.find((x) => x.id === i.variant);
    return productPrice(p, v);
  };
  const count = items.reduce((n, i) => n + i.qty, 0);
  const total = items.reduce((n, i) => n + linePrice(i) * i.qty, 0);

  const checkout = () => {
    const ref = `MCP-${Date.now().toString(36).toUpperCase()}`;
    setPlaced({ ref, total: total.toFixed(2), count, placedAt: new Date().toLocaleString() });
    setItems([]);
    setOpen(false);
  };

  return (
    <Cart.Provider value={{ items, count, total, open, linePrice, add, setQty, remove, clear, setOpen, placed, setPlaced, checkout }}>
      {children}
    </Cart.Provider>
  );
}
