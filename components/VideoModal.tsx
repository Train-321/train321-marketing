"use client";

import { useEffect } from "react";
import "./VideoModal.css";

type VideoModalProps = {
  vimeoId: string | null;
  title?: string;
  onClose: () => void;
};

export default function VideoModal({ vimeoId, title, onClose }: VideoModalProps) {
  useEffect(() => {
    if (!vimeoId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [vimeoId, onClose]);

  if (!vimeoId) return null;

  return (
    <div
      className="t321-mkt-video-modal"
      role="dialog"
      aria-modal="true"
      aria-label={title || "Video"}
      onClick={onClose}
    >
      <div className="t321-mkt-video-modal__panel" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          className="t321-mkt-video-modal__close"
          aria-label="Close video"
          onClick={onClose}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
        <div className="t321-mkt-video-modal__frame">
          <iframe
            src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&title=0&byline=0&portrait=0`}
            title={title || "Video"}
            frameBorder="0"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}
