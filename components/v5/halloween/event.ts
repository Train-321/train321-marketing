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

/** True after mount when the URL asks for the event and it's still running. */
export function useHalloween(): boolean {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const asked = new URLSearchParams(window.location.search).get("event") === HALLOWEEN.key;
    setOn(asked && Date.now() < Date.parse(HALLOWEEN.endsAt));
  }, []);
  return on;
}
