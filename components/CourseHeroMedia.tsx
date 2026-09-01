"use client";

import { useState } from "react";

export type CourseHeroMediaProps = {
  /** Course image URL. Used on its own, or as the video's poster frame. */
  image?: string;
  /** Numeric Vimeo id, already extracted from whatever the editor pasted. */
  videoId?: string;
  /** Poster to fall back to when a video has no course image behind it. */
  videoPoster?: string;
  title: string;
};

/**
 * The course hero's visual: a course image, a Vimeo video, or a video posed
 * over the course image.
 *
 * The box is a fixed 16/9 frame whatever the media's own shape is (see
 * `.t321-mkt-course__hero-media` in course.css) — portrait and square uploads
 * used to resize the whole hero column, so the page reflowed as each course
 * loaded a differently-shaped image.
 *
 * A video loads behind a click-to-play poster, the same facade the home hero
 * uses: no third-party embed on first paint, and nothing starts making noise
 * on its own.
 */
export default function CourseHeroMedia({
  image,
  videoId,
  videoPoster,
  title
}: CourseHeroMediaProps) {
  const [playing, setPlaying] = useState(false);
  const poster = image || videoPoster;

  if (!videoId) {
    if (!image) return null;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={image} alt={title} />;
  }

  if (playing) {
    return (
      <iframe
        className="t321-mkt-course__hero-frame"
        src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0&autoplay=1`}
        title={title}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
      />
    );
  }

  return (
    <button
      type="button"
      className="t321-mkt-course__hero-poster"
      onClick={() => setPlaying(true)}
      aria-label={`Play video: ${title}`}
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt="" />
      ) : (
        <span className="t321-mkt-course__hero-poster-ground" aria-hidden="true" />
      )}
      <span className="t321-mkt-course__hero-play" aria-hidden="true">
        <i className="fas fa-play" />
      </span>
    </button>
  );
}
