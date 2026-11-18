"use client";

// Fall / Thanksgiving event bar at the very top of the page, above the site
// header. Mirrors the Halloween bar's behaviour (portal into the page
// wrapper, one-click "Apply code", live countdown, dismiss for the session)
// with its own look, code and copy. Nothing here touches the Halloween files.

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCart } from "@/components/cart/CartContext";
import { FALL, useFallPromo } from "./event";
import { Leaf } from "./FallDecor";

const DISMISS_KEY = "t321.v5.fall.dismissed";

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

export default function FallBar() {
  const { promoCode, applyPromo } = useCart();
  const [host, setHost] = useState<HTMLElement | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  // The offer as the LMS promo admin defines it. While loading (or if the LMS
  // can't be reached) the defaults render; a code the LMS says is dead hides
  // the bar (early return below).
  const live = useFallPromo();
  const code = live?.code ?? FALL.code;
  const offer = live?.offer ?? FALL.offer;
  const rest = live?.rest ?? " every course";
  const ends = live?.endsAt ?? Date.parse(FALL.endsAt);
  const applied = promoCode.toUpperCase() === code.toUpperCase();

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
    el.className = "v5-fa-bar-host";
    page.insertBefore(el, page.firstChild);
    setHost(el);
    return () => el.remove();
  }, []);

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  if (!host || dismissed || live === null || now >= ends) return null;
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
    <div className="v5-fa-bar" role="region" aria-label="Thanksgiving offer">
      <div className="v5-fa-bar__inner">
        <p className="v5-fa-bar__offer">
          <span className="v5-fa-bar__leaves" aria-hidden="true">
            <Leaf className="v5-fa-bar__leaf v5-fa-bar__leaf--a" />
            <Leaf className="v5-fa-bar__leaf v5-fa-bar__leaf--b" />
          </span>
          <span className="v5-fa-bar__title">{FALL.title}</span>
          <span className="v5-fa-bar__deal">
            <strong>{offer}</strong>
            <span className="v5-fa-bar__deal-rest">{rest}</span>
          </span>
        </p>

        {/* Read as one sentence; the ticking digits themselves stay quiet. */}
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

        {/* The coupon: code on the left, perforation, action on the right. */}
        <div className={`v5-fa-ticket${applied ? " is-applied" : ""}`}>
          <span className="v5-fa-ticket__code">
            <small>Code</small>
            {code}
          </span>
          {applied ? (
            <span className="v5-fa-ticket__action v5-fa-ticket__action--done" role="status">
              <i className="fas fa-check" aria-hidden="true" /> Applied
            </span>
          ) : (
            <button
              type="button"
              className="v5-fa-ticket__action"
              onClick={() => applyPromo(code)}
              aria-label={`Apply code ${code} to your cart`}
            >
              Apply code
            </button>
          )}
        </div>
      </div>

      <button type="button" className="v5-fa-bar__close" aria-label="Dismiss Thanksgiving offer" onClick={dismiss}>
        <i className="fas fa-times" aria-hidden="true" />
      </button>
    </div>,
    host
  );
}
