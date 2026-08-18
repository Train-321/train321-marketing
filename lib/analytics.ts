/**
 * GA4 ecommerce events.
 *
 * Everything here is a no-op unless NEXT_PUBLIC_GA_MEASUREMENT_ID is set,
 * which is production-only — so dev and preview can fire away without
 * polluting the property. Every helper is also SSR-safe: no window, no send.
 *
 * The event names are GA4's own reserved ecommerce names, not custom ones.
 * That matters: it's what makes the built-in Monetisation reports, the
 * purchase funnel and revenue attribution populate on their own rather than
 * needing a hand-built report per question.
 */

import type { CartLine } from "@/components/cart/CartContext";

const CURRENCY = "USD";

type GtagItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_category?: string;
  item_variant?: string;
};

type GtagFn = (command: string, eventName: string, params?: Record<string, unknown>) => void;

function gtag(): GtagFn | null {
  if (typeof window === "undefined") return null;
  const fn = (window as unknown as { gtag?: GtagFn }).gtag;
  return typeof fn === "function" ? fn : null;
}

/**
 * Events raised before gtag.js has run.
 *
 * @next/third-parties loads the tag with Next's afterInteractive strategy, so
 * anything fired from an effect during hydration — a view_item on a course
 * page, most obviously — gets there first and would otherwise be dropped on
 * the floor. Holding them here and flushing once gtag appears keeps them,
 * and waiting for the real gtag (rather than queueing onto dataLayer
 * ourselves) means our events can never land ahead of the config command
 * that tells GA which property they belong to.
 */
const pending: Array<[string, Record<string, unknown>]> = [];
let waiting = false;

function flushPending(g: GtagFn) {
  while (pending.length) {
    const next = pending.shift();
    if (next) g("event", next[0], next[1]);
  }
}

function waitForGtag() {
  if (waiting) return;
  waiting = true;
  let tries = 0;
  const tick = () => {
    const g = gtag();
    if (g) {
      waiting = false;
      flushPending(g);
      return;
    }
    // ~10s. Past that the tag is blocked or absent and holding events only
    // grows memory.
    if (++tries > 40) {
      waiting = false;
      pending.length = 0;
      return;
    }
    setTimeout(tick, 250);
  };
  tick();
}

function send(eventName: string, params: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const g = gtag();
  if (g) {
    g("event", eventName, params);
    return;
  }
  pending.push([eventName, params]);
  waitForGtag();
}

/** Cart line → GA4 item. Seat-based courses carry their seat count as
    quantity; compliance courses are always one. */
export function lineToItem(line: CartLine): GtagItem {
  return {
    item_id: String(line.id),
    item_name: line.name,
    price: line.price,
    quantity: line.users || 1,
    item_category: line.isSeatBased ? "Seat-based" : "Compliance",
    ...(line.stateLabel ? { item_variant: line.stateLabel } : {})
  };
}

function itemsValue(items: GtagItem[]) {
  return items.reduce((sum, i) => sum + i.price * i.quantity, 0);
}

/** A course detail page was viewed. */
export function trackViewItem(item: GtagItem) {
  send("view_item", { currency: CURRENCY, value: item.price * item.quantity, items: [item] });
}

/** A course card or tile was clicked — which listings actually pull people in. */
export function trackSelectItem(item: GtagItem, listName?: string) {
  send("select_item", {
    ...(listName ? { item_list_name: listName } : {}),
    items: [item]
  });
}

export function trackAddToCart(item: GtagItem) {
  send("add_to_cart", { currency: CURRENCY, value: item.price * item.quantity, items: [item] });
}

export function trackRemoveFromCart(item: GtagItem) {
  send("remove_from_cart", {
    currency: CURRENCY,
    value: item.price * item.quantity,
    items: [item]
  });
}

export function trackViewCart(items: GtagItem[]) {
  send("view_cart", { currency: CURRENCY, value: itemsValue(items), items });
}

export function trackBeginCheckout(items: GtagItem[], value?: number) {
  send("begin_checkout", {
    currency: CURRENCY,
    value: value ?? itemsValue(items),
    items
  });
}

/**
 * A completed order. transaction_id is what GA4 uses to de-duplicate, so a
 * refresh of the success panel can't double-count revenue — hence the charge
 * id rather than a generated one.
 */
export function trackPurchase(args: {
  transactionId: string;
  value: number;
  items: GtagItem[];
  coupon?: string;
}) {
  send("purchase", {
    transaction_id: args.transactionId,
    currency: CURRENCY,
    value: args.value,
    ...(args.coupon ? { coupon: args.coupon } : {}),
    items: args.items
  });
}

/** Demo request / contact form — the non-purchase conversion. */
export function trackGenerateLead(source: string) {
  send("generate_lead", { currency: CURRENCY, value: 0, lead_source: source });
}
