"use client";

// The Halloween promo for /v5. It only switches on when the page is opened
// with ?event=halloween and the offer hasn't ended, so the everyday page and
// every shared /v5 link stay exactly as they are.

import { useEffect, useState } from "react";

export const HALLOWEEN = {
  /** The ?event= value that turns the promo on. */
  key: "halloween",
  // Must match a live code in the LMS promo-code admin — checkout validates it
  // there and rejects anything else. Change code and offer together.
  code: "HALLOWEEN",
  offer: "20% off",
  /** Oct 31, 11:59:59 pm Eastern (EDT, UTC−4). After this the promo is off. */
  endsAt: "2026-11-01T03:59:59Z"
};

/** The offer as the LMS promo-code admin currently defines it. */
export type LivePromo = {
  code: string;
  /** "20% off" / "$10 off" — built from the LMS discount type + amount. */
  offer: string;
  /** The admin's description with the offer prefix trimmed, e.g. " every course". */
  rest: string;
  /** Deadline (ms) — end of the "valid until" day, Eastern. */
  endsAt: number;
};

/**
 * End of a YYYY-MM-DD day in Eastern time, whichever of EDT/EST applies on
 * that date — so the countdown ends at 11:59:59 pm Eastern exactly like the
 * hard-coded HALLOWEEN.endsAt does.
 */
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
 * Loads the live promo from the LMS (via /api/promo) so the banner shows what
 * the admin actually configured — discount, wording, expiry — instead of the
 * values hard-coded above.
 *
 *   undefined  still loading, or the LMS couldn't be reached → callers keep
 *              the hard-coded HALLOWEEN defaults (today's behaviour)
 *   null       the LMS says the code is unknown/inactive/expired → callers
 *              should hide the offer rather than advertise a dead code
 *   LivePromo  the real thing
 */
export function useEventPromo(code: string): LivePromo | null | undefined {
  const [promo, setPromo] = useState<LivePromo | null | undefined>(undefined);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/promo?code=${encodeURIComponent(code)}`, { cache: "no-store" });
        if (!res.ok) return; // unreachable/unavailable → keep defaults
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
        // "20% off every course" → rest " every course"; anything that doesn't
        // start with the offer is shown whole after it.
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
          endsAt: p.validUntil ? easternEndOfDay(p.validUntil) : Date.parse(HALLOWEEN.endsAt)
        });
      } catch {
        /* network error → keep the hard-coded defaults */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);
  return promo;
}

/**
 * True after mount when the event is live. It turns on when the URL asks for it
 * (?event=halloween) OR when `forced` is passed (the homepage takeover renders
 * the event at "/" with no query param). The end date still applies either way,
 * so it switches itself off once the offer ends.
 */
export function useHalloween(forced = false): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const asked = forced || new URLSearchParams(window.location.search).get("event") === HALLOWEEN.key;
    setOn(asked && Date.now() < Date.parse(HALLOWEEN.endsAt));
  }, [forced]);
  return on;
}
