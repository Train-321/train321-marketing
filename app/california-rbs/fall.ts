// Thanksgiving look on the California RBS page: on until the same end date the
// homepage's fall event uses (components/v5/fall/event.ts → FALL.endsAt: the
// Sunday after Thanksgiving 2026, 11:59:59 pm Eastern), then off by itself.
// Kept here as a plain constant so the server page can decide (the homepage's
// event.ts is a client module). No promo code — the look only.
export const RBS_FALL_ENDS_AT = "2026-11-30T04:59:59Z";

/**
 * Master switch for the Thanksgiving look (leaves, pumpkins, vine, warm tints
 * and the offer bar). Off now that Thanksgiving is over — the code all stays;
 * set to true (and move RBS_FALL_ENDS_AT) to bring it back.
 */
export const RBS_FALL_ENABLED = false;

export function isRbsFall(now = Date.now()): boolean {
  return RBS_FALL_ENABLED && now < Date.parse(RBS_FALL_ENDS_AT);
}
