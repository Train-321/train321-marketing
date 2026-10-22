"use client";

// Isolated cart for /marketing-v9 only. It mirrors the site's shared cart
// behaviour (individual/company audience, seat counts, server-authoritative
// pricing) but is COMPLETELY separate from it:
//   • its own React context and its own localStorage keys (t321.v9cart.*),
//   • no analytics/GA events (so v9 activity never enters the live funnel),
//   • pricing read from the SAME read-only APIs the live cart uses
//     (/api/enroll/course, /api/enroll/quote) — those only read/price, they
//     never create an account or a charge, so the current system is untouched.
// Adding/removing/quoting here can't affect the main site cart or checkout.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode
} from "react";
import type {
  BuyerAudience,
  CartCourse,
  EnrollCartLine,
  EnrollQuote,
  InvoiceCadence
} from "@/lib/enroll";

const STORAGE_KEY = "t321.v9cart.v1";
const PROMO_KEY = "t321.v9cart.promo.v1";
const BUYER_KEY = "t321.v9cart.buyer.v1";

export type BuyerState = {
  audience: BuyerAudience;
  employees: number;
  locations: number;
  cadence: InvoiceCadence;
};

const DEFAULT_BUYER: BuyerState = {
  audience: "individual",
  employees: 5,
  locations: 1,
  cadence: "yearly"
};

/** Persisted shape — ids + seat counts only, re-resolved against the LMS on
    load so a stale cart can never show or carry an out-of-date price. */
export type StoredItem = { id: number; users: number };
/** A stored item joined with its freshly-fetched course data. */
export type V9Line = CartCourse & { users: number };

type V9CartValue = {
  lines: V9Line[];
  count: number;
  quote: EnrollQuote | null;
  loading: boolean;
  ready: boolean;
  promoError: string | null;
  promoCode: string;

  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  buyer: BuyerState;
  setAudience: (a: BuyerAudience) => void;
  setEmployees: (n: number) => void;
  setLocations: (n: number) => void;
  setCadence: (c: InvoiceCadence) => void;

  add: (course: CartCourse, users?: number) => void;
  remove: (id: number) => void;
  setUsers: (id: number, users: number) => void;
  clear: () => void;
  applyPromo: (code: string) => void;
  has: (id: number) => boolean;
  toApiLines: () => EnrollCartLine[];
};

const Ctx = createContext<V9CartValue | null>(null);

export function useV9Cart(): V9CartValue {
  const v = useContext(Ctx);
  if (!v) throw new Error("useV9Cart must be used inside <V9CartProvider>");
  return v;
}

function seatBasedIds(lines: V9Line[]): Set<number> {
  return new Set(lines.filter((l) => l.isSeatBased).map((l) => l.id));
}

function readStoredItems(): StoredItem[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map((v) => {
        const o = v as { id?: unknown; users?: unknown };
        return { id: Number(o?.id), users: Math.max(1, Number(o?.users) || 1) };
      })
      .filter((i) => Number.isFinite(i.id) && i.id > 0);
  } catch {
    return [];
  }
}

function readStoredBuyer(): BuyerState {
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return DEFAULT_BUYER;
    const p = JSON.parse(raw) as Partial<BuyerState>;
    return {
      audience: p.audience === "company" ? "company" : "individual",
      employees: Math.max(1, Number(p.employees) || DEFAULT_BUYER.employees),
      locations: Math.min(9999, Math.max(1, Number(p.locations) || 1)),
      cadence: p.cadence === "monthly" ? "monthly" : "yearly"
    };
  } catch {
    return DEFAULT_BUYER;
  }
}

export function V9CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<StoredItem[]>([]);
  const [lines, setLines] = useState<V9Line[]>([]);
  const [quote, setQuote] = useState<EnrollQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [buyer, setBuyer] = useState<BuyerState>(DEFAULT_BUYER);

  const buyerRef = useRef<BuyerState>(DEFAULT_BUYER);
  useEffect(() => {
    buyerRef.current = buyer;
  }, [buyer]);
  const linesRef = useRef<V9Line[]>([]);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  // Hydrate once on the client (never during render — that would desync SSR).
  const hydrated = useRef(false);
  useEffect(() => {
    const stored = readStoredItems();
    setItems(stored);
    setBuyer(readStoredBuyer());
    try {
      setPromoCode(window.localStorage.getItem(PROMO_KEY) || "");
    } catch {
      /* storage unavailable */
    }
    hydrated.current = true;
    if (stored.length === 0) setReady(true);
  }, []);

  // Persist after hydration so the empty initial state never clobbers storage.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* ignore */
    }
  }, [items]);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(PROMO_KEY, promoCode);
    } catch {
      /* ignore */
    }
  }, [promoCode]);
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
    } catch {
      /* ignore */
    }
  }, [buyer]);

  // Emptying the cart drops any promo too.
  useEffect(() => {
    if (!hydrated.current) return;
    if (items.length === 0) {
      setPromoCode("");
      setPromoError(null);
    }
  }, [items.length]);

  // ── Resolve stored ids → full course rows (read-only API) ───────────────
  const idKey = useMemo(
    () => items.map((i) => i.id).sort((a, b) => a - b).join(","),
    [items]
  );

  useEffect(() => {
    if (!idKey) {
      setLines([]);
      return;
    }
    let cancelled = false;
    const ids = idKey.split(",").map(Number);

    (async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/enroll/course", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids })
        });
        if (!res.ok) throw new Error("resolve failed");
        const data = (await res.json()) as { courses: CartCourse[] };
        if (cancelled) return;

        const byId = new Map(data.courses.map((c) => [c.id, c]));
        // Drop ids the LMS no longer returns.
        setItems((prev) => {
          const kept = prev.filter((i) => byId.has(i.id));
          return kept.length === prev.length ? prev : kept;
        });
        setLines(
          ids
            .map((id) => {
              const course = byId.get(id);
              if (!course) return null;
              const stored = items.find((i) => i.id === id);
              return { ...course, users: Math.max(1, stored?.users || 1) };
            })
            .filter((l): l is V9Line => l !== null)
        );
      } catch {
        if (!cancelled) setLoading(false);
      } finally {
        if (!cancelled) {
          setLoading(false);
          setReady(true);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey]);

  // Keep seat counts on hydrated lines in sync without a refetch.
  useEffect(() => {
    setLines((prev) =>
      prev.map((l) => {
        const stored = items.find((i) => i.id === l.id);
        const users = Math.max(1, stored?.users || 1);
        return users === l.users ? l : { ...l, users };
      })
    );
  }, [items]);

  // ── Price the cart (read-only API, debounced) ───────────────────────────
  const apiLines = useMemo<EnrollCartLine[]>(
    () =>
      lines.map((l) => ({
        id: l.id,
        users: buyer.audience === "company" ? l.users : 1,
        isSeatBased: l.isSeatBased
      })),
    [lines, buyer.audience]
  );
  const apiLinesKey = useMemo(
    () => apiLines.map((l) => `${l.id}:${l.users}:${l.isSeatBased ? 1 : 0}`).join("|"),
    [apiLines]
  );
  const buyerKey = `${buyer.audience}:${buyer.employees}:${buyer.locations}`;

  useEffect(() => {
    if (!apiLinesKey) {
      setQuote(null);
      setPromoError(null);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/enroll/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lines: apiLines,
            promoCode,
            audience: buyer.audience,
            employees: buyer.employees,
            locations: buyer.locations
          })
        });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setPromoError(data?.message || "We couldn't price your cart.");
          return;
        }
        setQuote(data as EnrollQuote);
        setPromoError(
          promoCode && !(data as EnrollQuote).promo
            ? "That promo code isn't valid or has expired."
            : null
        );
      } catch {
        if (!cancelled) setPromoError("We couldn't price your cart.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 250);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiLinesKey, promoCode, buyerKey]);

  // ── Mutations ───────────────────────────────────────────────────────────
  const add = useCallback(
    (course: CartCourse, users?: number) => {
      const seats = Math.max(
        1,
        users ??
          (course.isSeatBased && buyerRef.current.audience === "company"
            ? buyerRef.current.employees
            : 1)
      );
      setItems((prev) => {
        const existing = prev.find((i) => i.id === course.id);
        if (existing) {
          if (!course.isSeatBased || buyerRef.current.audience !== "company") return prev;
          return prev.map((i) =>
            i.id === course.id ? { ...i, users: i.users + Math.max(1, users ?? 1) } : i
          );
        }
        return [...prev, { id: course.id, users: seats }];
      });
      // Optimistic line so the drawer isn't blank during the resolve round-trip.
      setLines((prev) =>
        prev.some((l) => l.id === course.id) ? prev : [...prev, { ...course, users: seats }]
      );
      setDrawerOpen(true);
    },
    []
  );

  const remove = useCallback((id: number) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    setLines((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const setUsers = useCallback((id: number, users: number) => {
    const next = Math.max(1, Math.min(999, Math.floor(users) || 1));
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, users: next } : i)));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setLines([]);
    setQuote(null);
    setPromoCode("");
    setPromoError(null);
    setBuyer(DEFAULT_BUYER);
  }, []);

  const setAudience = useCallback((audience: BuyerAudience) => {
    if (audience === "company") {
      const { employees } = buyerRef.current;
      const seatIds = seatBasedIds(linesRef.current);
      setItems((prev) =>
        prev.map((i) => (seatIds.has(i.id) && i.users === 1 ? { ...i, users: employees } : i))
      );
    }
    buyerRef.current = { ...buyerRef.current, audience };
    setBuyer((b) => ({ ...b, audience }));
  }, []);

  const setEmployees = useCallback((n: number) => {
    const next = Math.min(9999, Math.max(1, Math.floor(n) || 1));
    const prevEmployees = buyerRef.current.employees;
    if (next === prevEmployees) return;
    const seatIds = seatBasedIds(linesRef.current);
    setItems((prev) =>
      prev.map((i) =>
        seatIds.has(i.id) && i.users === prevEmployees ? { ...i, users: next } : i
      )
    );
    buyerRef.current = { ...buyerRef.current, employees: next };
    setBuyer((b) => ({ ...b, employees: next }));
  }, []);

  const setLocations = useCallback(
    (n: number) =>
      setBuyer((b) => ({ ...b, locations: Math.min(9999, Math.max(1, Math.floor(n) || 1)) })),
    []
  );
  const setCadence = useCallback(
    (cadence: InvoiceCadence) => setBuyer((b) => ({ ...b, cadence })),
    []
  );

  const applyPromo = useCallback((code: string) => {
    setPromoCode(code.trim());
    setPromoError(null);
  }, []);

  const has = useCallback((id: number) => items.some((i) => i.id === id), [items]);
  const toApiLines = useCallback(() => apiLines, [apiLines]);
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<V9CartValue>(
    () => ({
      lines,
      count: lines.length,
      quote,
      loading,
      ready,
      promoError,
      promoCode,
      drawerOpen,
      openDrawer,
      closeDrawer,
      buyer,
      setAudience,
      setEmployees,
      setLocations,
      setCadence,
      add,
      remove,
      setUsers,
      clear,
      applyPromo,
      has,
      toApiLines
    }),
    [lines, quote, loading, ready, promoError, promoCode, drawerOpen, openDrawer, closeDrawer, buyer, setAudience, setEmployees, setLocations, setCadence, add, remove, setUsers, clear, applyPromo, has, toApiLines]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
