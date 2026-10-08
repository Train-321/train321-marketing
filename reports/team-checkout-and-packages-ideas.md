# Team checkout: seat counts and packages

Source: Christina's Slack note, 8 Oct 2026. Two points: (1) a team buying a
seat-based course can set employees and locations yet still end up with one
seat, and read "$15" as the team price; (2) most companies won't hand-pick
courses, so offer ready-made packages like the Denny's signup.

## 1. Seat counts (fixed, uncommitted on `main`)

**What was wrong.** The team-level Employees count only drives the compliance
subscription quote. Each seat-based course (RBS, Florida Responsible Vendor,
A+ Security Host) kept its own seat count, which defaulted to 1 and never
looked at the headcount. "My team · 12 employees" with RBS at "× 1 seats" and
"Due today $15.00" was the normal result.

**What changed.**

- Switching to "My team" sizes every 1-seat seat-based line to the employee
  count. Adding a seat-based course while already in team mode starts it at
  one seat per employee.
- Changing Employees moves any seat count that was still tracking the old
  headcount. A count the buyer edited by hand on the line stays put.
- When a line covers fewer people than the headcount, both the checkout
  summary and the cart drawer show "Covers 7 of your 9 employees · Use 9
  seats" with a one-click fix. More seats than employees is left alone (a
  normal turnover buffer).
- Line copy now shows the math: "$15.00 × 8 seats = $120.00 · one-time", and
  "1 seat" is singular.
- The totals row says "Subtotal" for a seat-only team order. It used to say
  "First yearly invoice", which implied a renewal that never comes.
- The Employees hint reads "Seat counts in your order follow this number"
  whenever a seat-based course is in the cart.

Files: `components/cart/CartContext.tsx`, `app/checkout/CheckoutClient.tsx`,
`components/cart/CartDrawer.tsx`, plus the two CSS files.

**Still worth considering.**

- Put a "How many seats?" step on the course page itself for seat-based
  courses, before the cart, so the team price is visible at the first
  decision point rather than at checkout.
- The backend quote is authoritative; the "= $120.00" line math is display
  only. If per-seat volume discounts ever land, move that figure to the quote.

## 2. Packages (ideas, nothing built)

**What Denny's has today** (LMS repo, `DennysSignupController` and
`DennysSignup.vue`): three plans priced per location per month, with a
headcount tier slider that sets the rate.

| Plan | Contents | Model |
| --- | --- | --- |
| Food Handler Training | 1 course, all states | $/mo per location |
| Food Handler + Harassment Prevention | 13 courses, state-aware | $/mo per location |
| Workplace Safety Package | 10 courses, add-on to either plan | $/mo per location |

Plan contents are a hard-coded course-id list per plan. Seat-based courses
inside a plan are included at 1 seat each.

**Ideas, cheapest first.**

1. **Role packages on the public site, built from the existing group
   quote.** Three cards on `/catalog` and the checkout: "Front of house"
   (food handler, RBS/alcohol, harassment), "Back of house" (food handler,
   safety set), "Managers" (manager food safety, harassment for supervisors,
   RBS). Selecting one fills the cart with the right courses for the buyer's
   state and sizes seats to headcount. No backend change: it is a preset
   cart, priced by the same enroll quote the cart uses today.
2. **"Everything my state requires" package.** The site already knows the
   buyer's state (geo auto-detect, state map finder). One card: pick state,
   pick headcount, see one number. Behind it is the same preset-cart idea,
   with the course list generated from the state requirement data in
   `lib/courseGroups.ts` rather than hand-picked.
3. **Generalise the Denny's plan engine.** Move `PLAN_DEFS` out of the
   controller into a `plans` table (name, course ids, per-location tiers,
   add-on flag) and expose a public `/plans` endpoint. The marketing site
   renders whatever plans exist. This is the version that lets Christina
   create a package without a deploy, and lets a Denny's-style per-location
   subscription be sold to any chain. Biggest lift: needs Studio or admin UI
   to edit plans, and a checkout path on the marketing site for
   per-location subscriptions.
4. **Industry presets as the entry point.** "Restaurant", "Bar", "Hotel",
   "Security" tiles on the home page that lead into idea 1 or 2 with the
   right package pre-selected. Pure routing on top of whichever of the
   above ships.

**Open questions for Christina.**

- Should packages be one-time (sum of seats, like the cart today) or
  per-location subscriptions (like Denny's)? The answer decides whether idea
  1 or idea 3 is the target.
- Which three or four packages matter most? A draft list with course ids
  would let idea 1 ship in days.
- Is a package discount expected (e.g. 10% off the bundle)? The enroll quote
  has promo support, so a per-package promo code is the quick route.
