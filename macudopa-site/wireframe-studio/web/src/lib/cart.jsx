import { createContext, useContext, useState, useEffect } from 'react';
import { api } from './api.js';

const Cart = createContext(null);
export const useCart = () => useContext(Cart);

function load() {
  try {
    const raw = localStorage.getItem('mf_cart');
    const arr = raw ? JSON.parse(raw) : [];
    return arr;
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(load());
  const [open, setOpen] = useState(false);
  const [checkout, setCheckout] = useState(false);
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');
  const [placed, setPlaced] = useState(null);

  useEffect(() => {
    localStorage.setItem('mf_cart', JSON.stringify(items));
  }, [items]);

  const add = (productId, variantId, qty = 1) => {
    setItems((cur) => {
      const key = `${productId}|${variantId}`;
      const found = cur.find((i) => i.key === key);
      if (found) return cur.map((i) => (i.key === key ? { ...i, qty: i.qty + qty } : i));
      return [...cur, { key, slug: productId, variant: variantId, qty }];
    });
    setOpen(true);
  };
  const setQty = (key, qty) => setItems((cur) => (qty <= 0 ? cur.filter((i) => i.key !== key) : cur.map((i) => (i.key === key ? { ...i, qty } : i))));
  const remove = (key) => setItems((cur) => cur.filter((i) => i.key !== key));
  const clear = () => setItems([]);

  const count = items.reduce((n, i) => n + i.qty, 0);
  const startCheckout = () => { setCheckout(true); setOpen(false); setError(''); };
  const cancelCheckout = () => { setCheckout(false); };
  const closeAll = () => { setOpen(false); setCheckout(false); setPlaced(null); setError(''); };

  const placeOrder = async (payment) => {
    setPlacing(true); setError('');
    try {
      const j = await api('/orders', {
        method: 'POST',
        body: {
          items: items.map((i) => ({ slug: i.slug, variant: i.variant, qty: i.qty })),
          payment
        }
      });
      setPlaced(j.order);
      setItems([]);
      setCheckout(false);
      setOpen(false);
    } catch (e) {
      setError(e.message);
    } finally {
      setPlacing(false);
    }
  };

  return (
    <Cart.Provider value={{
      items, count, open, checkout, placing, error, placed,
      add, setQty, remove, clear, setOpen, startCheckout, cancelCheckout, closeAll, placeOrder
    }}>
      {children}
    </Cart.Provider>
  );
}
