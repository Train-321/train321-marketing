"use client";

import { useEffect, useRef, useState } from "react";
import { COURSE_PLACEHOLDER_IMAGE } from "@/lib/newFeatures";
import { sizedImage, sizedSrcSet } from "@/lib/images";
import "./SkeletonImage.css";

type Props = {
  src: string | null | undefined;
  alt: string;
  /** Extra classes for the wrapper (the box that gets the shimmer). */
  className?: string;
  /** Swapped in when `src` is missing or fails to load. */
  fallback?: string;
  /**
   * Roughly how wide the image renders, in CSS px. Sources we can resize (LMS
   * thumbnails, Sanity) are requested at this width (and 2x) instead of at
   * their uploaded size. Defaults to a catalog card.
   */
  width?: number;
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
  fallback = COURSE_PLACEHOLDER_IMAGE,
  width = 384
}: Props) {
  const [current, setCurrent] = useState(src || fallback);
  // Whether to ask for the resized copy. Turned off for this image if the
  // optimizer ever fails, so a resize problem degrades to the original file
  // rather than to the placeholder.
  const [optimize, setOptimize] = useState(true);
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // A new src (e.g. the cart re-resolving a line) restarts the cycle.
  useEffect(() => {
    setCurrent(src || fallback);
    setOptimize(true);
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
        src={optimize ? sizedImage(current, width) : current}
        srcSet={optimize ? sizedSrcSet(current, width) : undefined}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          if (optimize && sizedImage(current, width) !== current) {
            // The resized copy failed — retry with the original before
            // giving up on the picture altogether.
            setOptimize(false);
            setLoaded(false);
          } else if (current !== fallback) {
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
