"use client";

import { useEffect, useRef, useState } from "react";
import { COURSE_PLACEHOLDER_IMAGE } from "@/lib/newFeatures";
import "./SkeletonImage.css";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Extra classes for the wrapper (the box that gets the shimmer). */
  className?: string;
  /** Swapped in when `src` is missing or fails to load. */
  fallback?: string;
};

/**
 * An <img> that shows the shared shimmer skeleton until its bytes actually
 * arrive, then fades the picture in — no blank box, no layout pop. Missing
 * or broken sources swap to the course placeholder and fade in the same way.
 *
 * The wrapper owns sizing: give it (via className or the parent) whatever
 * box the design needs; the image covers it.
 */
export default function SkeletonImage({
  src,
  alt,
  className = "",
  fallback = COURSE_PLACEHOLDER_IMAGE
}: Props) {
  const [current, setCurrent] = useState(src || fallback);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // A new src (e.g. the cart re-resolving a line) restarts the cycle.
  useEffect(() => {
    setCurrent(src || fallback);
    setLoaded(false);
  }, [src, fallback]);

  // Cached images fire no onLoad after hydration — if the browser already
  // has the bytes, skip the shimmer instead of waiting for an event that
  // already happened.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth > 0) setLoaded(true);
  }, [current]);

  return (
    <span className={`t321-imgskel${loaded ? " is-loaded" : ""} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={current}
        alt={alt}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (current !== fallback) {
            setCurrent(fallback);
            setLoaded(false);
          } else {
            // Even the placeholder failed — reveal the box rather than
            // shimmering forever.
            setLoaded(true);
          }
        }}
      />
    </span>
  );
}
