'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  priceUsd: number;
  unit: string;
  currency: string;
  qty: number;
}

const STORAGE_KEY = 'gws.cart.v1';

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* noop */
  }
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>(readCart);

  useEffect(() => {
    writeCart(items);
  }, [items]);

  const add = useCallback(
    (item: Omit<CartItem, 'qty'> & { qty?: number }) => {
      setItems((prev) => {
        const existing = prev.find((i) => i.productId === item.productId);
        if (existing) {
          return prev.map((i) => (i.productId === item.productId ? { ...i, qty: i.qty + (item.qty ?? 1) } : i));
        }
        return [...prev, { ...item, qty: item.qty ?? 1 }];
      });
    },
    [],
  );

  const setQty = useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const count = useMemo(() => items.reduce((acc, i) => acc + i.qty, 0), [items]);
  const totalUsd = useMemo(() => items.reduce((acc, i) => acc + i.priceUsd * i.qty, 0), [items]);

  return { items, count, totalUsd, add, setQty, remove, clear };
}