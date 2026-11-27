"use client";

// The Fall / Thanksgiving promo for the v5 homepage. A separate event from
// Halloween (components/v5/halloween is untouched): its own promo code, its
// own art, its own dates. Same switching rules:
//   - ?event=fall in the URL turns it on until FALL.endsAt;
//   - on the homepage (`forced`) it follows the LIVE promo code in the LMS:
//     on only while the code is active and its "valid until" has not passed,
//     so Promo Codes in the LMS admin is the on/off switch — no deploy.

import { useEffect, useState } from "react";

export const FALL = {
  /** The ?event= value that turns the promo on. */
  key: "fall",
  // Must match a live code in the LMS promo-code admin — checkout validates it
  // there and rejects anything else. Change code and offer together.
  code: "THANKSGIVING",
  offer: "20% off",
  title: "Thanksgiving Sale",
  /**
   * Fallback deadline when the LMS gives no "valid until": the Sunday after
   * Thanksgiving 2026 (Nov 29), 11:59:59 pm Eastern (EST, UTC−5). The live
   * promo's own expiry replaces this whenever the LMS has one.
   */
  endsAt: "2026-11-30T04:59:59Z"
};

/** The offer as the LMS promo-code admin currently defines it. */
export type LiveFallPromo = {
  code: string;
  /** "20% off" / "$10 off" — built from the LMS discount type + amount. */
  offer: string;
  /** The admin's description with the offer prefix trimmed, e.g. " every course". */
  rest: string;
  /** Deadline (ms) — end of the "valid until" day, Eastern. */
  endsAt: number;
};

/** End of a YYYY-MM-DD day in Eastern time (EDT or EST, whichever applies). */
function easternEndOfDay(ymd: string): number {
  for (const offset of ["-04:00", "-05:00"]) {
    const t = Date.parse(`${ymd}T23:59:59${offset}`);
    const hour = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      hour: "numeric",
      hour12: false
    }).format(new Date(t));
    if (hour === "23") return t;
  }
  return Date.parse(`${ymd}T23:59:59Z`);
}

/**
 * Loads the live FALL promo from the LMS (via /api/promo).
 *   undefined  loading, or LMS unreachable → callers keep the FALL defaults
 *   null       code unknown / inactive / expired → hide the offer
 *   LiveFallPromo  the real thing
 */
export function useFallPromo(): LiveFallPromo | null | undefined {
  const [promo, setPromo] = useState<LiveFallPromo | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/promo?code=${encodeURIComponent(FALL.code)}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as {
          promo: {
            code: string;
            description: string;
            discountType: "percentage" | "fixed";
            discount: number;
            validUntil: string | null;
          } | null;
        };
        if (cancelled) return;
        if (!data.promo) {
          setPromo(null);
          return;
        }
        const p = data.promo;
        const offer = p.discountType === "fixed" ? `$${p.discount} off` : `${p.discount}% off`;
        const desc = p.description.trim();
        const rest = desc
          ? desc.toLowerCase().startsWith(offer.toLowerCase())
            ? desc.slice(offer.length)
            : ` ${desc}`
          : " every course";
        setPromo({
          code: p.code,
          offer,
          rest,
          endsAt: p.validUntil ? easternEndOfDay(p.validUntil) : Date.parse(FALL.endsAt)
        });
      } catch {
        /* network error → keep the defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);
  return promo;
}

/**
 * Master switch for the homepage's Fall / Thanksgiving theme (offer bar,
 * leaves, pumpkins, sale strip, map vine). Off now that Thanksgiving is over —
 * all the code stays; set to true (and move FALL.endsAt) to bring it back.
 */
export const FALL_ENABLED = false;

/**
 * True after mount when the fall event is live. While the promo is still
 * loading the theme stays off, so a plain page never flashes into the theme.
 */
export function useFall(forced = false): boolean {
  const [asked, setAsked] = useState(false);
  const live = useFallPromo();
  useEffect(() => {
    setAsked(new URLSearchParams(window.location.search).get("event") === FALL.key);
  }, []);
  // Checked after the hooks above, so React always sees the same hook order.
  if (!FALL_ENABLED) return false;
  if (forced) {
    // The homepage runs the fall look through the Thanksgiving window: until
    // FALL.endsAt (end of the Sunday after Thanksgiving, Eastern), or the
    // live code's own "valid until" if that is later — then it switches off
    // by itself. The offer bar and sale strip still appear only while the
    // THANKSGIVING code is live in the LMS, so a dead code is never shown.
    const end = live ? Math.max(live.endsAt, Date.parse(FALL.endsAt)) : Date.parse(FALL.endsAt);
    return Date.now() < end;
  }
  return asked && Date.now() < Date.parse(FALL.endsAt);
}
