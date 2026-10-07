"use client";

// Tiny motion toolkit for /v5 — no animation library. Scroll reveals are a
// class toggle driven by IntersectionObserver; the CSS in v5.css does the
// actual easing, and prefers-reduced-motion turns it all off there.

import {
  createElement,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  type RefObject
} from "react";

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);
  return reduced;
}

type InViewOptions = { once?: boolean; rootMargin?: string; threshold?: number };

export function useInView<T extends Element>(
  ref: RefObject<T | null>,
  { once = true, rootMargin = "0px 0px -12% 0px", threshold = 0.15 }: InViewOptions = {}
): boolean {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setInView(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setInView(true);
            if (once) io.unobserve(e.target);
          } else if (!once) {
            setInView(false);
          }
        }
      },
      { rootMargin, threshold }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [ref, once, rootMargin, threshold]);
  return inView;
}

type RevealProps = {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  /** Stagger index — each step adds 70ms (see --v5-reveal-i in v5.css). */
  index?: number;
  /** "up" (default) slides up, "scale" grows in, "none" just fades. */
  variant?: "up" | "scale" | "none";
  style?: CSSProperties;
  id?: string;
};

/** Fades/slides its children in the first time they scroll into view. */
export function Reveal({
  children,
  as = "div",
  className = "",
  index = 0,
  variant = "up",
  style,
  id
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const inView = useInView(ref);
  return createElement(
    as,
    {
      ref,
      id,
      className: `v5-reveal v5-reveal--${variant}${inView ? " is-in" : ""}${className ? ` ${className}` : ""}`,
      style: { ...style, "--v5-reveal-i": index } as CSSProperties
    },
    children
  );
}

/**
 * Count a stat up from zero when it scrolls into view. Accepts the Studio
 * strings as-is ("50,000+", "4.8/5", "6 yrs") — the first number animates,
 * the rest of the string is kept around it.
 */
export function CountUp({ value, duration = 1400 }: { value: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { threshold: 0.4 });
  const reduced = usePrefersReducedMotion();
  const match = value.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  const [shown, setShown] = useState<string>(match ? `${match[1]}0${match[3]}` : value);

  useEffect(() => {
    if (!match) return;
    const prefix = match[1];
    const suffix = match[3];
    const target = parseFloat(match[2].replace(/,/g, ""));
    const decimals = (match[2].split(".")[1] || "").length;
    const grouped = match[2].includes(",");
    const fmt = (n: number) =>
      `${prefix}${
        grouped
          ? Math.round(n).toLocaleString("en-US")
          : n.toFixed(decimals)
      }${suffix}`;
    if (!inView) return;
    if (reduced) {
      setShown(fmt(target));
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 4);
      setShown(fmt(target * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, reduced, value, duration]);

  return (
    <span ref={ref} className="v5-countup">
      {shown}
    </span>
  );
}
