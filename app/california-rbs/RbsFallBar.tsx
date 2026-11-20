"use client";

// Thanksgiving offer bar for the California RBS page — the homepage's fall
// bar (same look: leaves, offer, live countdown, the code on a ticket), wired
// to THIS page's checkout: "Apply code" puts the code into the checkout's
// promo field and scrolls there, so the visitor sees the new total.
// Like the homepage it follows the LIVE code in the LMS (useFallPromo): shown
// only while THANKSGIVING is active, so a dead code is never shown. The
// checkout still validates the code against the courses in the cart.

import { useEffect, useState } from "react";
import { FALL, useFallPromo } from "@/components/v5/fall/event";
import { Leaf } from "@/components/v5/fall/FallDecor";

/** Fired with { code }: RbsCheckout applies it to its promo field. */
export const RBS_PROMO_EVENT = "rbs:promo";
const DISMISS_KEY = "t321.ca-rbs.fall.dismissed";

const pad = (n: number) => String(n).padStart(2, "0");
function remaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export default function RbsFallBar() {
  const live = useFallPromo();
  const [now, setNow] = useState<number | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY)) setDismissed(true);
    } catch {
      /* storage unavailable — show the bar */
    }
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Wait for the LMS answer (undefined = loading): the code is only shown once
  // the LMS confirms it's live, never on a guess.
  if (!live || now === null || dismissed || now >= live.endsAt) return null;
  const t = remaining(live.endsAt - now);
  const units: Array<[number, string]> = [
    [t.d, "days"],
    [t.h, "hrs"],
    [t.m, "min"],
    [t.s, "sec"]
  ];

  const apply = () => {
    window.dispatchEvent(new CustomEvent(RBS_PROMO_EVENT, { detail: { code: live.code } }));
    setApplied(true);
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    document.getElementById("rbs-checkout")?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };
  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="v5-fa-bar rbs-fall-bar" role="region" aria-label="Thanksgiving offer">
      <div className="v5-fa-bar__inner">
        <p className="v5-fa-bar__offer">
          <span className="v5-fa-bar__leaves" aria-hidden="true">
            <Leaf className="v5-fa-bar__leaf v5-fa-bar__leaf--a" />
            <Leaf className="v5-fa-bar__leaf v5-fa-bar__leaf--b" />
          </span>
          <span className="v5-fa-bar__title">{FALL.title}</span>
          <span className="v5-fa-bar__deal">
            <strong>{live.offer}</strong>
            <span className="v5-fa-bar__deal-rest">{live.rest}</span>
          </span>
        </p>
        <p className="v5-fa-bar__clock" aria-label={`Ends in ${t.d} days ${t.h} hours ${t.m} minutes`}>
          <span className="v5-fa-bar__ends" aria-hidden="true">
            Ends in
          </span>
          <span className="v5-fa-bar__tiles" aria-hidden="true">
            {units.map(([n, label]) => (
              <span key={label} className="v5-fa-bar__tile">
                <b>{pad(n)}</b>
                <small>{label}</small>
              </span>
            ))}
          </span>
        </p>
        <div className={`v5-fa-ticket${applied ? " is-applied" : ""}`}>
          <span className="v5-fa-ticket__code">{live.code}</span>
          {applied ? (
            <span className="v5-fa-ticket__action v5-fa-ticket__action--done" role="status">
              <i className="fas fa-check" aria-hidden="true" /> Applied
            </span>
          ) : (
            <button type="button" className="v5-fa-ticket__action" onClick={apply} aria-label={`Apply code ${live.code} at checkout`}>
              Apply code
            </button>
          )}
        </div>
      </div>
      <button type="button" className="v5-fa-bar__close" aria-label="Dismiss Thanksgiving offer" onClick={dismiss}>
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    </div>
  );
}
