"use client";

// Isolated cart for /marketing-v9 only. Completely separate from the site's
// shared CartContext: its own React context and its own localStorage key, so
// adding/removing here never touches the main site cart or checkout.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from "react";

export type V9Item = {
  id: number;
  name: string;
  price: number;
  image: string | null;
  stateLabel: string | null;
  qty: number;
};
export type V9AddInput = Omit<V9Item, "qty">;

type V9CartValue = {
  items: V9Item[];
  count: number;
  subtotal: number;
  ready: boolean;
  drawerOpen: boolean;
  add: (c: V9AddInput) => void;
  remove: (id: number) => void;
  setQty: (id: number, qty: number) => void;
  has: (id: number) => boolean;
  clear: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const KEY = "t321.v9cart.v1";
const Ctx = createContext<V9CartValue | null>(null);

export function useV9Cart(): V9CartValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useV9Cart must be used inside <V9CartProvider>");
  return v;
}

export function V9CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<V9Item[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Hydrate from localStorage once on the client.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setItems(parsed);
      }
    } catch {
      /* ignore unreadable storage */
    }
    setReady(true);
  }, []);

  // Persist after hydration so we never overwrite stored items with the empty
  // initial state on first paint.
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items, ready]);

  const add = useCallback((c: V9AddInput) => {
    setItems((prev) => (prev.some((x) => x.id === c.id) ? prev : [...prev, { ...c, qty: 1 }]));
    setDrawerOpen(true);
  }, []);
  const remove = useCallback((id: number) => setItems((p) => p.filter((x) => x.id !== id)), []);
  const setQty = useCallback(
    (id: number, qty: number) =>
      setItems((p) => p.map((x) => (x.id === id ? { ...x, qty: Math.max(1, qty) } : x))),
    []
  );
  const clear = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const count = useMemo(() => items.reduce((n, x) => n + x.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((n, x) => n + x.price * x.qty, 0), [items]);
  const has = useCallback((id: number) => items.some((x) => x.id === id), [items]);

  const value = useMemo<V9CartValue>(
    () => ({ items, count, subtotal, ready, drawerOpen, add, remove, setQty, has, clear, openDrawer, closeDrawer }),
    [items, count, subtotal, ready, drawerOpen, add, remove, setQty, has, clear, openDrawer, closeDrawer]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
