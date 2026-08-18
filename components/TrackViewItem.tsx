"use client";

import { useEffect, useRef } from "react";
import { trackViewItem } from "@/lib/analytics";

/**
 * Fires GA4 view_item for a course detail page. Course pages are server
 * components, so the event needs a client island; this renders nothing.
 *
 * item_id is the LMS course id — the same id the cart uses — so view_item,
 * add_to_cart and purchase all join up on one product in GA4's reports
 * rather than appearing as three unrelated things.
 */
export default function TrackViewItem({
  id,
  name,
  price,
  category
}: {
  id: string;
  name: string;
  price: number;
  category?: string;
}) {
  const sent = useRef(false);
  useEffect(() => {
    if (sent.current) return;
    sent.current = true;
    trackViewItem({ item_id: id, item_name: name, price, quantity: 1, item_category: category });
  }, [id, name, price, category]);
  return null;
}
