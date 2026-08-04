"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import type {
  BuyerAudience,
  CartCourse,
  EnrollCartLine,
  EnrollQuote,
  InvoiceCadence
} from "@/lib/enroll";
import "./AudienceSwitchConfirm.css";

const STORAGE_KEY = "t321.cart.v1";
const PROMO_KEY = "t321.cart.promo.v1";
const BUYER_KEY = "t321.cart.buyer.v1";

/**
 * Who's buying. Individual is the default; switching to company changes the
 * quote (subscription math keyed on employees × locations) and unlocks the
 * company fields at checkout. Persisted so the choice survives navigation.
 */
export type BuyerState = {
  audience: BuyerAudience;
  employees: number;
  locations: number;
  cadence: InvoiceCadence;
};

// Yearly is the default cadence — it carries the built-in 10% discount, and
// the toggle at checkout makes switching to monthly a one-click move.
const DEFAULT_BUYER: BuyerState = {
  audience: "individual",
  employees: 5,
  locations: 1,
  cadence: "yearly"
};

function readStoredBuyer(): BuyerState {
  try {
    const raw = window.localStorage.getItem(BUYER_KEY);
    if (!raw) return DEFAULT_BUYER;
    const p = JSON.parse(raw) as Partial<BuyerState>;
    return {
      audience: p.audience === "company" ? "company" : "individual",
      employees: Math.max(1, Number(p.employees) || DEFAULT_BUYER.employees),
      locations: Math.min(50, Math.max(1, Number(p.locations) || 1)),
      cadence: p.cadence === "monthly" ? "monthly" : "yearly"
    };
  } catch {
    return DEFAULT_BUYER;
  }
}

/**
 * What we persist. Deliberately ids + seat counts ONLY — never names or
 * prices. A cart can sit in localStorage for weeks; re-resolving it against the
 * LMS on every load means a price change or a delisted course is picked up
 * immediately instead of being shown from a stale snapshot.
 */
export type StoredCartItem = { id: number; users: number };

/** A stored item joined with its freshly-fetched course data. */
export type CartLine = CartCourse & { users: number };

type CartContextValue = {
  /** Hydrated lines. Empty until the first resolve completes. */
  lines: CartLine[];
  /** Number of distinct courses — what the header badge shows. */
  count: number;
  /** Server-computed pricing, or null while loading / when the cart is empty. */
  quote: EnrollQuote | null;
  /** True while lines are being resolved or a quote is in flight. */
  loading: boolean;
  /**
   * False until the saved cart has been read from storage AND resolved once.
   * Callers must wait for this before treating an empty `lines` as an empty
   * cart — otherwise a hard load of /checkout flashes "your cart is empty"
   * over a cart that's about to appear.
   */
  ready: boolean;
  /** Set when the promo code the buyer typed was rejected by the backend. */
  promoError: string | null;
  promoCode: string;

  drawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;

  /** Who's buying — drives quote shape and the checkout form. */
  buyer: BuyerState;
  setAudience: (a: BuyerAudience) => void;
  /**
   * Preferred way to switch audience from UI. Applies immediately when the
   * cart is empty; otherwise pops a confirm dialog ("switching clears your
   * cart") and only applies — clearing the cart — if the buyer agrees.
   */
  requestAudienceChange: (a: BuyerAudience) => void;
  setEmployees: (n: number) => void;
  setLocations: (n: number) => void;
  setCadence: (c: InvoiceCadence) => void;

  /** Add a course. Adding one already in the cart bumps its seats instead. */
  add: (course: CartCourse, users?: number) => void;
  remove: (id: number) => void;
  setUsers: (id: number, users: number) => void;
  clear: () => void;
  applyPromo: (code: string) => void;
  has: (id: number) => boolean;

  /** The shape lib/enroll expects — used by the checkout page. */
  toApiLines: () => EnrollCartLine[];
};

const CartContext = createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

function readStoredItems(): StoredCartItem[] {
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
    // Corrupt or unavailable storage (private mode, quota) — start empty
    // rather than blowing up the whole app on mount.
    return [];
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<StoredCartItem[]>([]);
  const [lines, setLines] = useState<CartLine[]>([]);
  const [quote, setQuote] = useState<EnrollQuote | null>(null);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [buyer, setBuyer] = useState<BuyerState>(DEFAULT_BUYER);

  // Nothing is read from storage during render — that would desync the server
  // and client HTML and trip a hydration mismatch. We load on mount instead,
  // so the first paint is an empty cart for everyone and fills in a tick later.
  const hydrated = useRef(false);
  useEffect(() => {
    const stored = readStoredItems();
    setItems(stored);
    setBuyer(readStoredBuyer());
    try {
      setPromoCode(window.localStorage.getItem(PROMO_KEY) || "");
    } catch {
      /* storage unavailable — no promo to restore */
    }
    hydrated.current = true;
    // Nothing saved → there's nothing to resolve, so we're already settled.
    // Otherwise the resolve effect below flips this once it has answered.
    if (stored.length === 0) setReady(true);
  }, []);

  // Persist on change, but only after the initial load — otherwise the empty
  // starting state would immediately overwrite a real saved cart.
  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* over quota or blocked — the in-memory cart still works */
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

  // A cart emptied item-by-item drops its promo too — otherwise the code
  // silently re-applies to whatever the buyer adds next.
  useEffect(() => {
    if (!hydrated.current) return;
    if (items.length === 0) {
      setPromoCode("");
      setPromoError(null);
    }
  }, [items.length]);

  useEffect(() => {
    if (!hydrated.current) return;
    try {
      window.localStorage.setItem(BUYER_KEY, JSON.stringify(buyer));
    } catch {
      /* ignore */
    }
  }, [buyer]);

  // ── Resolve stored ids → full course rows ──────────────────────────────
  // Keyed on the id list only: changing seat counts doesn't need a re-fetch.
  const idKey = useMemo(() => items.map((i) => i.id).sort((a, b) => a - b).join(","), [items]);

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

        // Drop stored ids the LMS no longer returns — delisted or deleted
        // courses shouldn't linger in the cart and fail at checkout.
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
            .filter((l): l is CartLine => l !== null)
        );
      } catch {
        // Leave whatever lines we already had rather than emptying the cart on
        // a transient network blip.
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
    // `items` is intentionally excluded: it changes on every seat tweak, and
    // the seat count is folded in from the closure above. idKey covers the
    // only change that warrants a refetch.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idKey]);

  // Keep seat counts on the hydrated lines in sync without a network round-trip.
  useEffect(() => {
    setLines((prev) =>
      prev.map((l) => {
        const stored = items.find((i) => i.id === l.id);
        const users = Math.max(1, stored?.users || 1);
        return users === l.users ? l : { ...l, users };
      })
    );
  }, [items]);

  // ── Price the cart ─────────────────────────────────────────────────────
  // Debounced so dragging a seat stepper doesn't fire a request per click.
  const apiLines = useMemo<EnrollCartLine[]>(
    () => lines.map((l) => ({ id: l.id, users: l.users, isSeatBased: l.isSeatBased })),
    [lines]
  );
  const apiLinesKey = useMemo(
    () => apiLines.map((l) => `${l.id}:${l.users}:${l.isSeatBased ? 1 : 0}`).join("|"),
    [apiLines]
  );

  // Cadence is deliberately NOT part of the key — one quote returns both
  // monthly and yearly figures, so flipping the toggle re-renders for free.
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
        // A code that the backend didn't echo back as applied is invalid or
        // expired. Say so instead of silently charging full price.
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

  // ── Mutations ──────────────────────────────────────────────────────────

  const add = useCallback((course: CartCourse, users = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === course.id);
      if (existing) {
        // Re-adding a compliance course is a no-op (you can only buy one seat
        // for yourself); for a seat-based course it adds to the quantity.
        if (!course.isSeatBased) return prev;
        return prev.map((i) =>
          i.id === course.id ? { ...i, users: i.users + Math.max(1, users) } : i
        );
      }
      return [...prev, { id: course.id, users: Math.max(1, users) }];
    });

    // Optimistically show the line so the drawer isn't blank while the resolve
    // round-trips. The resolve overwrites this with authoritative data.
    setLines((prev) =>
      prev.some((l) => l.id === course.id)
        ? prev
        : [...prev, { ...course, users: Math.max(1, users) }]
    );
  }, []);

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
    // Reset who's buying too — a completed company purchase shouldn't leave
    // the NEXT visit quoting subscription prices for a fresh cart.
    setBuyer(DEFAULT_BUYER);
  }, []);

  const setAudience = useCallback(
    (audience: BuyerAudience) => setBuyer((b) => ({ ...b, audience })),
    []
  );

  // Audience switch with a cart-clearing warning. `pendingAudience` non-null
  // means the confirm dialog is up, waiting on the buyer's decision.
  const [pendingAudience, setPendingAudience] = useState<BuyerAudience | null>(null);
  const requestAudienceChange = useCallback(
    (audience: BuyerAudience) => {
      if (audience === buyer.audience) return;
      if (items.length === 0) {
        setBuyer((b) => ({ ...b, audience }));
        return;
      }
      setPendingAudience(audience);
    },
    [buyer.audience, items.length]
  );
  const cancelAudienceChange = useCallback(() => setPendingAudience(null), []);
  const confirmAudienceChange = useCallback(() => {
    if (pendingAudience) {
      // clear() resets the buyer to defaults; re-apply the chosen audience on
      // top so the switch the buyer just confirmed sticks.
      clear();
      setBuyer({ ...DEFAULT_BUYER, audience: pendingAudience });
    }
    setPendingAudience(null);
  }, [pendingAudience, clear]);
  const setEmployees = useCallback(
    (n: number) =>
      setBuyer((b) => ({ ...b, employees: Math.min(9999, Math.max(1, Math.floor(n) || 1)) })),
    []
  );
  const setLocations = useCallback(
    (n: number) =>
      // Backend validation caps locations at 50.
      setBuyer((b) => ({ ...b, locations: Math.min(50, Math.max(1, Math.floor(n) || 1)) })),
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

  // These MUST be stable. CartWidget closes the drawer in an effect keyed on
  // [pathname, closeDrawer]; if closeDrawer got a new identity every time
  // `drawerOpen` changed, opening the drawer would re-run that effect and
  // immediately close it again.
  const openDrawer = useCallback(() => setDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const value = useMemo<CartContextValue>(
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
      requestAudienceChange,
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
    [lines, quote, loading, ready, promoError, promoCode, drawerOpen, openDrawer, closeDrawer, buyer, setAudience, requestAudienceChange, setEmployees, setLocations, setCadence, add, remove, setUsers, clear, applyPromo, has, toApiLines]
  );

  const pendingIsCompany = pendingAudience === "company";
  const itemCount = items.length;

  return (
    <CartContext.Provider value={value}>
      {children}
      {pendingAudience && (
        <div
          className="t321-cart-switch"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="t321-cart-switch-title"
        >
          <div className="t321-cart-switch__backdrop" onClick={cancelAudienceChange} />
          <div className="t321-cart-switch__panel">
            <h3 id="t321-cart-switch-title" className="t321-cart-switch__title">
              {pendingIsCompany ? "Switch to team pricing?" : "Switch to individual pricing?"}
            </h3>
            <p className="t321-cart-switch__body">
              {pendingIsCompany
                ? "Team accounts are priced per employee, so your current cart will be cleared."
                : "Individual pricing is a one-time payment, so your current cart will be cleared."}{" "}
              You have {itemCount} course{itemCount === 1 ? "" : "s"} in the cart.
            </p>
            <div className="t321-cart-switch__actions">
              <button
                type="button"
                className="t321-cart-switch__btn"
                onClick={cancelAudienceChange}
              >
                Keep my cart
              </button>
              <button
                type="button"
                className="t321-cart-switch__btn t321-cart-switch__btn--primary"
                onClick={confirmAudienceChange}
              >
                Switch &amp; clear cart
              </button>
            </div>
          </div>
        </div>
      )}
    </CartContext.Provider>
  );
}
