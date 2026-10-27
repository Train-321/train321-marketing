"use client";

// Event bar at the very top of the page, above the site header. It renders
// through a portal into the page wrapper (the header lives in the layout,
// outside /v5), carries the offer, a one-click "Apply code" that saves the
// code to the cart for checkout, and a live countdown to the deadline.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart/CartContext";
import { HALLOWEEN } from "./event";
import { Pumpkin } from "./HalloweenDecor";

const DISMISS_KEY = "t321.v5.halloween.dismissed";

function remaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return {
    d: Math.floor(s / 86400),
    h: Math.floor((s % 86400) / 3600),
    m: Math.floor((s % 3600) / 60),
    s: s % 60
  };
}

const pad = (n: number) => String(n).padStart(2, "0");

export default function HalloweenBar() {
  const { promoCode, applyPromo } = useCart();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const ends = Date.parse(HALLOWEEN.endsAt);
  const applied = promoCode.toUpperCase() === HALLOWEEN.code.toUpperCase();

  // Mount point: first child of the page wrapper, so the bar sits above the
  // sticky header and scrolls away while the header stays pinned.
  useEffect(() => {
    try {
      if (window.sessionStorage.getItem(DISMISS_KEY)) setDismissed(true);
    } catch {
      /* storage unavailable — show the bar */
    }
    const page = document.querySelector(".t321-mkt-page");
    if (!page) return;
    const el = document.createElement("div");
    el.className = "v5-hw-bar-host";
    page.insertBefore(el, page.firstChild);
    setHost(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!host || dismissed || now >= ends) return null;
  const t = remaining(ends - now);

  const dismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  const units: Array<[number, string]> = [
    [t.d, "days"],
    [t.h, "hrs"],
    [t.m, "min"],
    [t.s, "sec"]
  ];

  return createPortal(
    <div className="v5-hw-bar" role="region" aria-label="Halloween offer">
      <div className="v5-hw-bar__inner">
        <p className="v5-hw-bar__offer">
          <Pumpkin className="v5-hw-bar__pumpkin" />
          <span className="v5-hw-bar__title">Halloween Sale</span>
          <span className="v5-hw-bar__deal">
            <strong>{HALLOWEEN.offer}</strong>
            <span className="v5-hw-bar__deal-rest"> every course</span>
          </span>
        </p>

        {/* Read as one sentence; the ticking digits themselves stay quiet. */}
        <p className="v5-hw-bar__clock" aria-label={`Ends in ${t.d} days ${t.h} hours ${t.m} minutes`}>
          <span className="v5-hw-bar__ends" aria-hidden="true">
            Ends in
          </span>
          <span className="v5-hw-bar__tiles" aria-hidden="true">
            {units.map(([n, label]) => (
              <span key={label} className="v5-hw-bar__tile">
                <b>{pad(n)}</b>
                <small>{label}</small>
              </span>
            ))}
          </span>
        </p>

        {/* The coupon: code on the left, perforation, action on the right. */}
        <div className={`v5-hw-ticket${applied ? " is-applied" : ""}`}>
          <span className="v5-hw-ticket__code">
            <small>Code</small>
            {HALLOWEEN.code}
          </span>
          {applied ? (
            <span className="v5-hw-ticket__action v5-hw-ticket__action--done" role="status">
              <i className="fas fa-check" aria-hidden="true" /> Applied
            </span>
          ) : (
            <button
              type="button"
              className="v5-hw-ticket__action"
              onClick={() => applyPromo(HALLOWEEN.code)}
              aria-label={`Apply code ${HALLOWEEN.code} to your cart`}
            >
              Apply code
            </button>
          )}
        </div>
      </div>

      <button type="button" className="v5-hw-bar__close" aria-label="Dismiss Halloween offer" onClick={dismiss}>
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    </div>,
    host
  );
}
