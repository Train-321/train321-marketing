"use client";

// Phones only (hidden by CSS on wider screens): a slim "Enroll now" bar pinned
// to the bottom of the screen. It appears once the hero's own Enroll button
// has scrolled out of view, and steps aside again while the checkout itself
// is on screen — so it never covers the form.

import { useEffect, useState } from "react";

export default function StickyEnroll({ label }: { label: string }) {
  const [heroCtaVisible, setHeroCtaVisible] = useState(true);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  useEffect(() => {
    const heroCta = document.getElementById("rbs-hero-cta");
    const checkout = document.getElementById("rbs-checkout");
    if (!heroCta || !checkout || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === heroCta) setHeroCtaVisible(e.isIntersecting);
        if (e.target === checkout) setCheckoutVisible(e.isIntersecting);
      }
    });
    io.observe(heroCta);
    io.observe(checkout);
    return () => io.disconnect();
  }, []);

  const show = !heroCtaVisible && !checkoutVisible;
  return (
    <div className={`rbs-sticky${show ? " is-shown" : ""}`} aria-hidden={!show}>
      <a href="#rbs-checkout" className="rbs-btn rbs-btn--pay" tabIndex={show ? 0 : -1}>
        {label} <i className="fas fa-arrow-right" aria-hidden="true" />
      </a>
    </div>
  );
}
