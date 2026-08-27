"use client";

import { useEffect } from "react";
import type { BuyerAudience } from "@/lib/enroll";
import { useCart } from "./cart/CartContext";

/**
 * Sets the cart's buyer audience once on mount. Rendered by campaign/landing
 * pages that promise a specific flow — e.g. the California RBS sign-up link
 * always checks out as an individual, even for a visitor whose stored cart
 * state says "company" from an earlier session.
 */
export default function ForceAudience({ audience }: { audience: BuyerAudience }) {
  const { setAudience } = useCart();
  useEffect(() => {
    // Deferred a tick: child effects run BEFORE parent effects, and
    // CartProvider's mount effect hydrates the buyer from localStorage —
    // setting synchronously here would be overwritten by that hydration.
    const t = setTimeout(() => setAudience(audience), 0);
    return () => clearTimeout(t);
    // Once per mount, deliberately — the visitor can still switch by hand
    // afterwards; we only set the starting point for this landing.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
}
