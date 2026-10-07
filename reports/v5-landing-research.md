# Train 321 — v5 landing page design research

**Date:** 7 Oct 2026  
**Scope:** homepage redesign for train321.com (ANSI/ANAB-accredited food handler, food manager, alcohol server, sexual-harassment-prevention, BOH/FOH courses; US, state-by-state).  
**Method:** fetched and read the live homepages/course pages listed below; DOM-inspected Toast and MasterClass in the browser; read the current Train 321 home + repo (`components/HomeCourseFinder.tsx`, `StateCoursePicker.tsx`, `GroupStateDialog.tsx`, `CourseCard.tsx`, `TrustLogosCarousel.tsx`, `lib/states.ts`, `lib/courseGroups.ts`).  
**Could not be read:** `efoodhandlers.com` homepage (Cloudflare bot wall, blocked for both fetch and browser; I did not try to bypass it — details below come from its indexed `delta.` subdomain and shop URLs), `7shifts.com` (same wall), `theceshop.com` (human-verification page), `web.archive.org` (not reachable from this environment).

---

## 0. TL;DR — what to steal, what to avoid

1. **Nobody in this niche has a "marketing beast" homepage.** Every competitor is blue/white, icon-heavy, stock-flat, and either hides prices (ServSafe, 360training, StateFoodSafety, TIPS, Userve, Premier) or looks like a price list (FHC, Rserving, eFoodTrainer). A photo-first page with real hover craft will look a generation ahead.
2. **State selection is solved badly everywhere.** 11 of 14 sellers use a plain `<select>` or an alphabetical link wall; only Rserving has a (static image) map. Winning pattern: **geolocated default + searchable combobox + popular-state chips + decorative/interactive SVG map on desktop**, with the result ("Accepted in Texas: …") rendered *inline* on the page, not on a new page.
3. **Price-forward converts in this category.** The high-volume sellers (AAA: 43,391 reviews on a $6.95 card; Learn2Serve; LIQUORexam; TABC On The Fly) all show "from $X" + rating + review count on the homepage card. Keep Train 321's "from $10" cards and add rating + count + duration + "instant certificate".
4. **Trust stack convention** (use all of it, above the fold or just below): ANAB/ANSI badge *with accreditation number*, the regulator's name ("TABC-approved program #…", "CA ABC RBS provider"), big counts (certificates, locations), star rating with count, brand logos, named testimonials, retake/refund guarantee.
5. **Best-in-class patterns that fit:** Toast's hover-to-reveal floating photo on an industry pill cloud; MasterClass's portrait-mosaic hero and category chip row; Stripe's logo marquee + metrics grid + photo accordions; Jobber's "6 photo cards + expandable long list" industries page; Coursera/MasterClass/Brilliant "What brings you here?" intent chooser; Linear-style cursor-glow cards; Magic UI blur-fade stagger; Mercury/Stripe number tickers.
6. **Mobile first, hover second.** Gate every hover effect behind `@media (hover:hover) and (pointer:fine)`, give every hover effect a tap/focus equivalent, and wrap all motion in `prefers-reduced-motion`.
7. **Photography must model compliant behaviour.** A food-safety brand cannot show bare hands on ready-to-eat food, no hair restraint, or a bartender over-pouring. Curate for gloves/hairnets/thermometers/wristbands; this is a credibility issue, not an aesthetic one.

---

## 1. Competitors

### Summary matrix

| Site | Hero message | State selection | Prices on home? | Strongest trust signal | Visual verdict |
|---|---|---|---|---|---|
| ServSafe | Seasonal campaign ("Join Us This September…") | None | No ($15 handler; $152.95–$179 manager on catalog) | ANAB + National Restaurant Association | Institutional, dated portal; no worker photography |
| 360training | "Regulatory Compliance Training Made Easy" | None (industry mega-menu) | No ($9.99 handler on course page) | "11M+ Learners", Newsweek 2026 award, Trustpilot | Clean but generic corporate |
| Learn2Serve (360) | "Food & Alcohol Training Online" | Dropdown "Get Training In:" | **Yes** (bundles $17.99–$41.99, % OFF tags) | ANAB label, Amazon/CVS logos | Price-list energy, decent |
| StateFoodSafety | "Get trained & certified today…" | Mega-menu state→county links; product-page dropdown | No (CA $10) | "Government approved everywhere we sell", price match, ANAB #1020 | Tidy, illustration-led, safe |
| eFoodHandlers (SFS division) | "California Food Handlers Card — 75-Minute Online Program — Only $7.95" (state page) | County dropdown; `?statecode=` shop URLs | **Yes** on state pages ($7.95–$19.95) | ANAB/ASTM, "trusted by millions since 2009", 8 languages incl. ASL | Form-first; bot wall blocks crawlers |
| TIPS (gettips.com) | "Alcohol Training & Certifications", 5.7M certified | Alphabetical link list in nav | No ($38–$50 on state pages) | "#1 Trusted… Since 1979", CVS/MGM logos | Branded photo hero, otherwise standard |
| Userve | "Get your certificate in hours, not days." | **Hero = state dropdown + "Find Your Program"** | No ($14.95 handler, $19.99 RBS on state pages) | "300K+ Happy Students", 98%, Hilton/Marriott logos | Thin imagery ("hero image placeholder") |
| Premier Food Safety | "ServSafe Certification and Food Handler Cards" | State text links + county | No (CA $7.95) | "4.9 from 3,000+ Reviews", McDonald's/Subway logos, "3 Million Satisfied Clients" | Blue/white, checklist hero |
| FHC foodhandlerclasses.com | "As low as $6" | Location filter dropdown + flag-icon cards | **Yes** ($6–$27) | ANAB ID 1135, ACF approved | Directory, not a brand |
| AAA Food Handler | "Get Your Online Training With AAA Food Handler!" | Per-course "Select a State" dropdown | **Yes** (from $6.95) | **4.9 (43,391 reviews)** on the handler card; 18 client logos | Card grid, proven converter |
| Always Food Safe | "ANAB Accredited Food And Alcohol Safety Certification Courses" | Per-course dropdown | **Yes** ($6–$65+) | "1 Free Exam Retake", "Best Seller"/"Trending" labels | Standard |
| Rserving | "Get certified the fastest and most affordable way!" | **Map image + dropdown + link list** | **Yes** ($3.99–$99.87) | ANSI badge, state program names (ABLE, ATAP, BASSET) | Cluttered |
| LIQUORexam | "The most reviewed alcohol & food safety training provider in the USA." | Dropdown + "Nationwide" | **Yes** (strike-through $14.95→$10.95, "91 Ratings") | "20,000+ 5-Star Reviews", "500,000+ People Trained" | Card grid, reviews-led |
| Trust20 | "Food safety made for today's industry" | Per-product dropdown with approval note | **Yes** ($15/$25/$90) | "ANAB-accredited", "25K industry workers", "95% satisfaction" | Most modern of the pack (still icon-led) |
| **Train 321 (today)** | "Tap. Train. Done." | Dropdown that filters the catalog inline | **Yes** (from $10/$10/$14/$159) | "50,000+ certificates", "5,000+ locations", 4.8/5, CRA/Denny's/Domino's logos | Already ahead on structure; needs photography + motion |

### 1.1 ServSafe — https://www.servsafe.com/
- **Hero:** "Join Us This September as We Build a Recipe for Food Safety Success!" (National Food Safety Month bundle promo). CTAs: "Learn More", "Getting Started Guide", "Get Certified", "View Products". The hero sells a campaign, not the product.
- **Browsing:** five circular icon cards — ServSafe Food Manager / Food Handler / Alcohol / Allergens / Workplace; audience links for Instructors/Proctors, Administrators, Academic.
- **State selection:** none on the homepage. The Food Handler page only says "We stay on top of the various and changing regulatory requirements for every state…" (https://www.servsafe.com/ServSafe-Food-Handler).
- **Trust:** ANAB, National Restaurant Association / NRAEF, ServSafe International, ManageFirst — all in the footer. Manager page: "accredited by the ANSI National Accreditation Board (ANAB)-Conference for Food Protection (CFP)"; ProctorU is "the only web based exam provider that has been approved by ServSafe and ANAB".
- **Pricing:** not on the homepage. Catalog: Food Handler Online Course & Assessment **$15.00** (3 attempts) (https://www.servsafe.com/access/SS/Catalog/ProductDetail/SSECT6); Manager Online Course + online exam **$152.95**, with online remote proctoring **$179.00**, exam voucher **$30**.
- **Verdict:** maximum authority, minimum UX. Weak: no state logic, no prices, no photography of workers, seasonal hero. Strong: the accreditation story and the product icon row are instantly scannable.

### 1.2 360training — https://www.360training.com/
- **Hero:** "Regulatory Compliance Training Made Easy" / "Meet government and employer requirements with job training courses from 360training®"; photo of a construction worker.
- **Browsing:** industry mega-menu — Food & Alcohol, Environmental Safety & OSHA, Healthcare, Real Estate, Insurance, HR & Compliance, Power & Utilities, Industrial Skills (4–7 courses each). "View More" / "For Businesses" CTAs per section.
- **State selection:** none on home.
- **Trust:** "Newsweek and Statista named 360training one of America's Top Online Learning Providers for 2026"; "29+ years" (since 1997); "11M+ Learners", "21+ million courses completed"; five-star testimonials (Martin E., Rebecca W., Thomas D.); Trustpilot.
- **Course page (National Food Handler, https://www.360training.com/course/ansi-accredited-food-handler-training):** **$9.99**; "4.6 (491 Reviews)"; "ANAB–ASTM Accredited… ASTM International E2659-24"; "Over 11 Million Certificates Issued & Counting"; "25+ Years Most Trusted Food & Beverage Training"; 2 hours; "Up-to-Date, Interactive & Mobile-Friendly"; "Instant Food Handler Card & Certificate Download"; two exam attempts; valid 3 years; English/Spanish version toggle; 72-hour refund; Amazon/CVS/Hy-Vee/Jack in the Box logos.
- **Verdict:** the course page is the best buy-box in the category (price, rating+count, accreditation standard, duration, instant download, language toggle, refund). The homepage is a generic corporate portal.

### 1.3 Learn2Serve — https://www.360training.com/learn2serve (learn2serve.com 301-redirects here)
- **Hero:** "Food & Alcohol Training Online" / "The most convenient way to get your food handler, manager, and alcohol certificate online." Hero photo of diverse models. CTA: "Buy Now" (repeated per course).
- **Browsing:** nav — Alcohol, Food Handler, Food Manager, Food Allergy, Cannabis, HACCP. Section order: hero → corporate logos (Amazon, CVS Health, Jack in the Box, Hy-Vee) → "Get Training In:" **state dropdown** → featured packages → reviews → "Why learn with us" → footer.
- **Pricing (shown):** Texas TABC + Food Handler **$17.99** (was $19.99), Louisiana Responsible Vendor + Food Handler **$22.00**, Utah Alcohol + Food Handler **$41.99**; "% OFF" tags (11%, 24%, 12%). TABC alone $9.99 + $3.25 state filing fee (https://www.360training.com/learn2serve/alcohol/Texas).
- **Trust:** ANAB logo + "ANAB-Accredited" labels, 5-star quotes ("Learn2Serve's courses are more comprehensive than competitors…" — Jack H.), "over 20 years", Trustpilot.
- **Verdict:** the closest structural analogue to Train 321 (state dropdown → bundles with prices). Bundling (alcohol + food handler per state) is the key merchandising move to copy.

### 1.4 StateFoodSafety — https://www.statefoodsafety.com/
- **Hero:** "Get trained & certified today with StateFoodSafety!" / "Unmatched compliance and food safety leadership for over 20 years." CTA "Get Started Now"; illustration of people training.
- **Browsing:** six product cards with image + "Select" (Food Handlers Card, Food Manager Certification & Training, Allergens Essentials, Alcohol Server Certification, HACCP Courses, Sexual Harassment Prevention Training). Mega-menu lists every state under each product, with county children (e.g. Alabama → Jefferson County; `/food-handler/alabama/jefferson-county`).
- **State selection:** links to state pages in the mega-menu; product pages use a "Select a State" dropdown; CA/CO/KY/MO branch to counties (https://www.statefoodsafety.com/food-handler).
- **Trust:** "Government Approved — Accepted by hundreds of regulatory agencies nationwide"; "Best Price — We will match the price of any comparable training course"; handler page: "Government approved everywhere we sell", "Approved in more areas than any other provider", "100% online & accessible on any device", "Compliant with 2022 FDA Food Code standards", "More than 95% of people pass!", "Get your certificate immediately after you pass!"; manager page: "Nationally accredited by ANAB #1020", "ANAB-CFP accredited and state-accepted certification" (https://www.statefoodsafety.com/food-manager).
- **Pricing:** none on home; CA food handler is $10.
- **Verdict:** the SEO machine of the category (state × county pages). Weak on the homepage: illustrations instead of people, no prices, no reviews shown. Copy worth echoing: "approved everywhere we sell".

### 1.5 eFoodHandlers — https://www.efoodhandlers.com/ (a StateFoodSafety division)
- **Access:** homepage returns a Cloudflare "Sorry, you have been blocked" page to automated fetches and to the browser pane from this machine; not bypassed. Findings come from `delta.efoodhandlers.com` and indexed shop URLs.
- **State page (CA):** "California Food Handlers Card" / "75 - Minute Online Program" / "Only $7.95"; CTA "Get Started Now" with a "Register" form in the hero; "Select your County" dropdown (all 58 counties); bundles "Alcohol Server & Food Handler Training Bundle ($19.95)", "Food Handler & COVID-19 Training Bundle ($17.95)"; ANAB logo + "ASTM e2659-2018"; "Since 2009, eFoodHandlers has been trusted by millions"; Trustpilot; languages "English, Español, 普通话, 한국어, Việt, American Sign Language, Tagalog, Serbo-Croatian" (https://delta.efoodhandlers.com/).
- **Shop URLs:** state/program are query params — `/shop/program?t=bfs&statecode=ny`, `?t=ase-bfs&statecode=fl`, `?t=bfs&statecode=ca&county=los+angeles&lg=es`. Indexed prices: CA **$7.95**, NY **$10.00**, OR **$15.00** (from $20), FL **$19.95**.
- **Verdict:** aggressive price + county depth + language breadth (ASL is a genuine differentiator). Weak: form-first layout, and a bot wall that will also hurt their crawlability/previews.

### 1.6 TIPS — https://www.gettips.com/
- **Hero:** "Alcohol Training & Certifications"; "certified more than 5.7 million participants… while promoting responsible consumption", 45+ years. Audience-split CTAs: **"Choose the training for your job"** (Individuals) and **"Buy training for your team or event"** (Groups & Businesses).
- **Browsing:** nav Individuals / Businesses / Trainers / Resources / Support; six tracks (On-Premise, Off-Premise, Concessions, Gaming, Delivery…) each with a state selector.
- **State selection:** full alphabetical text list (Alabama → Wyoming, D.C., International) inside nav menus — no dropdown, no map.
- **Trust:** "45+ Years", "#1 Trusted Alcohol Training Provider Since 1979", "Over 5.7 Million", 5-star quotes, logos (CVS Health, MGM International), Trustpilot.
- **Pricing:** none on home; state pages show $38.00 (Off-Premise); On-Premise typically $40–$50.
- **Verdict:** the audience-split hero (individual vs. team) is exactly right for Train 321 and worth copying. Everything else is standard.

### 1.7 Userve — https://www.userve.com/
- **Hero:** "Get your certificate in hours, not days." / "Flexible programs for alcohol servers, food managers and food handlers, with no prior experience required." The hero **is** the picker: "Select Your State" dropdown (all 50) + single CTA **"Find Your Program"**.
- **Browsing:** Programs / Business / Blog / About / Help Center / Contact; phone number and login in header; two categories (Alcohol Server Programs — "state-approved training"; Food Safety Programs — Manager, Handler, Allergy).
- **Trust:** "300K+ Happy Students", "98% satisfaction rating", money-back guarantee, "10+ Years", logos (Hilton, Marriott, DoubleTree, Holiday Inn, YMCA), two 5-star quotes. Blue accent `#000B8F`.
- **Pricing:** none on home; state pages: Food Handler **$14.95** (PA/MA/IN/NJ/MD/CA/TN); CA RBS **$19.99** + $3 state fee. Clean state routing: `/us/ca/food-service/anab-food-handler-training`, `/us/ca/alcohol-service/rbs-certification`.
- **Verdict:** best hero *mechanic* in the niche (state → program in one step) with the weakest visuals (SVG icons, placeholder hero). Train 321 should do Userve's mechanic with MasterClass-grade imagery.

### 1.8 Premier Food Safety — https://www.premierfoodsafety.com/
- **Hero:** "ServSafe Certification and Food Handler Cards" / "Protecting Lives Through Food Safety" + four checkmarks: Health Department Approved · ANAB-Accredited · Available in multiple languages · 45+ Years Experience.
- **Browsing:** nav Food Handlers Card (state/county) · Food Manager Certification (50 states + territories) · Alcohol Training (CA RBS, IL BASSET) · Allergen · Sexual Harassment Prevention; Certificate Lookup, FAQs, Store. "Select State" dropdowns for Handler and Manager; "Book In-Person Class".
- **State selection:** text links by state + county (Maricopa, San Diego).
- **Trust:** "4.9 from 3,000 + Reviews", logos (McDonald's, Subway, P.F. Chang's, IHOP), "Over 3 Million Satisfied Clients", ANAB + ServSafe badges, five testimonials.
- **Pricing:** none on home; CA Food Handler **$7.95** (all counties except Riverside/San Bernardino/San Diego; mailed card +$9.99; English/Spanish/Korean/Chinese) (https://premierfoodsafety.com/food-handlers-card/california).
- **Verdict:** the "checklist hero" (four proof points next to the headline) is a good, cheap pattern. Visually interchangeable with the rest.

### 1.9 FHC Food Handler Classes — https://www.foodhandlerclasses.com/
- **Hero:** "FHC® Food Handler Classes" / "Online food handlers certificate training" / **"As low as $6"**; CTAs "Sign up", "Bulk order".
- **Browsing:** geographic nav (Countries; Approved U.S. States; Other U.S. States; More Locations); "Filter by location" dropdown + "Filter" button; cards per location with US-flag icon, description, price, "Buy now".
- **Trust:** ANAB logo and "Accreditation ID 1135", American Culinary Federation Education Foundation approval, "4 CE hours".
- **Pricing:** $7.00 standard; TX no-exam $6; Bahamas $16; WV Marion County $17; WV $27; bulk "$1.00 off each".
- **Verdict:** a directory. Only lesson: radical price clarity.

### 1.10 Other notable sellers (fetched)
- **eFoodTrainer** — https://efoodtrainer.com/ — "GET YOUR FOOD HANDLER CERTIFICATE" / "Select your state and get your certificate only for $9.99"; alphabetical state links repeated down the page; "ANAB-Accredited Food Handler Course"; "It's easy, It's fast, It's guaranteed pass!"; four-step process.
- **AAA Food Handler** — https://www.aaafoodhandler.com/ — "Click a program to start today!"; per-course "Select a State" dropdown; cards: Food Handler **from $6.95 — 4.9 (43,391 reviews)**, Food Manager from $49.95 — 4.9 (12,117), Alcohol from $7.95 — 4.8 (3,128), Allergen from $12.95, Harassment from $6.95; "ANAB-CFP Accredited Food Manager Certification"; 18 client logos (McDonald's, Marriott, Dunkin', Chick-fil-A). The most convincing card anatomy in the niche.
- **TAP Series** — https://tapseries.io/ — "Courses and Cloud Solutions anytime, anywhere."; Food Safety Manager / Sexual Harassment / HACCP / Active Shooter, each "100% ONLINE"; ACF + International HACCP Alliance logos; "over a million trained"; McDonald's/Subway/Marriott/Starbucks logos; no state selection; no prices.
- **Always Food Safe** — https://alwaysfoodsafe.com/ — "ANAB Accredited Food And Alcohol Safety Certification Courses"; "1 Free Exam Retake" banner; "NEED TO TRAIN YOUR TEAM?" + phone; per-course "Select State"; "Best Seller" (Manager) / "Trending" (Alcohol) labels; $6.00 handler → $65+ manager; 16 partner logos; "Instant Exam Results", "Fun & Engaging Video Training".
- **Rserving** — https://www.rserving.com/ — "Get certified the fastest and most affordable way!"; state via **clickable US map image + dropdown + alphabetical links**; Compliance vs Career training; "$3.99 ea"…"$99.87"; "$5.98 w/ Employer Account!"; state program names (ABLE, ATAP, BASSET, CA RBS); minimum-age table.
- **TABC On The Fly** (360training brand) — https://www.tabconthefly.com/ — rotating banners "TABC Certification Online Fast No Course Timer Instant Certificate"; "ENROLL NOW" **"Only $9.99"**; "approved by the Texas Alcoholic Beverage Commission" program 454-508; "made by servers, for servers"; four named Texas testimonials; TABC + Texas Food Handler bundle.
- **LIQUORexam** — https://www.liquorexam.com/ — "The most reviewed alcohol & food safety training provider in the USA." / "Fast, affordable online certification for individuals and teams."; CTAs "Find My Course" / "Explore Business Training"; state dropdown + "Nationwide courses"; "20,000+ 5-Star Reviews", "500,000+ People Trained", "State Approved"; price cards with strike-through ("$10.95 Regular price $14.95", "91 Ratings"); TABC $8.95; CA RBS $8.95 (reg $14.95).
- **Trust20** — https://trust20.co/ — "Food safety made for today's industry" / "Get the food safety training or certification that's right for you."; Food Handler $15, Food Allergy $25, Food Protection Manager $90, Alcohol "Coming Soon"; state dropdown per product with an approval sentence underneath ("Trust20 is an approved food handler training provider in California"); "ANAB-accredited", "25K Industry workers", "95% Satisfaction rate". The most contemporary brand in the set; still no real photography.
- Also in the market (not fetched): American Course Academy (Utah bundles), Serving Alcohol Inc., SafeStaff (FL), National Registry of Food Safety Professionals (manager exam).

### 1.11 What this means for Train 321
- **Differentiate on experience, not claims.** Everyone claims ANAB + approvals + millions trained. Nobody shows real kitchens, bars, hotels, or the people who work in them, and nobody has an inline "what do I need in my state" answer. That is the gap.
- **Keep prices on the homepage** (Train 321 already does) and add the AAA/360training buy-box elements to the card: rating + review count, duration, "instant certificate", language toggle, retake policy.
- **Copy the Learn2Serve bundle move** (state alcohol + food handler as one card with a strike-through) and the Userve hero mechanic (state → program without leaving the page).
- **Audience split in the hero** (TIPS): "I need a certificate" vs "I'm training a team".
- **Name the regulator on every state answer** ("Accepted by Texas DSHS", "TABC program #…") — StateFoodSafety's "approved everywhere we sell" is the strongest line in the category; make it concrete per state.

---

## 2. Best-in-class landing-page patterns (15 reusable patterns)

Observed sources: Linear (https://linear.app/), Vercel (https://vercel.com/), Stripe (https://stripe.com/), Framer (https://www.framer.com/), Coursera (https://www.coursera.org/), Duolingo (https://www.duolingo.com/), MasterClass (https://www.masterclass.com/), Brilliant (https://brilliant.org/), Webflow (https://webflow.com/), Superhuman (https://superhuman.com/), Raycast (https://www.raycast.com/), Arc (https://arc.net/), Notion (https://www.notion.com/), Clay (https://www.clay.com/), Cal.com (https://cal.com/), Lemon Squeezy (https://www.lemonsqueezy.com/), Mercury (https://mercury.com/), Retool (https://retool.com/), Attio (https://attio.com/), Toast (https://pos.toasttab.com/). Component references: Magic UI (https://magicui.design/docs/components/marquee, /bento-grid, /number-ticker, /blur-fade), Aceternity UI (https://ui.aceternity.com/components/spotlight, /card-spotlight, /3d-card-effect, /focus-cards), 21st.dev (https://21st.dev/@educalvolpz/components/hover-expand, https://21st.dev/@bundui/components/magnetic-button, https://21st.dev/@uniquesonu/components/text-parallax-content-scroll), WebKit scroll-driven animations guide (https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/), Codrops intro to scroll() and view() (https://tympanus.net/codrops/?p=75216), Awwwards hover collections (https://www.awwwards.com/inspiration/hover-interactions-tenity, https://www.awwwards.com/inspiration/hover-tag-homerun, https://www.awwwards.com/inspiration/article-gallery-hover-interaction-dave-holloway), Emil Kowalski on clip-path (https://emilkowal.ski/ui/the-magic-of-clip-path), cursor-glow grid cards (https://freefrontend.com/code/interactive-glowing-grid-cards-2026-03-09/, https://dev.to/kadenwildauer/modern-card-hover-animations-css-and-javascript-3cg3), bento guide (https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide), scrollytelling (https://varun.ca/scrollytelling).

Global rules that apply to every pattern below:
- Gate pointer effects: `@media (hover: hover) and (pointer: fine) { … }`. Touch gets the resting state plus a tap/focus equivalent.
- Motion opt-out: wrap keyframes/transitions in `@media (prefers-reduced-motion: no-preference)`; in React read `useReducedMotion()` (Framer Motion) and skip transforms, keep opacity fades ≤200 ms.
- Only animate `transform`, `opacity`, `filter`, `clip-path`; never `width/height/top/left` on scroll.
- Every hover-revealed content must also exist in the DOM for keyboard/screen-reader users (`:focus-visible` triggers the same state; use `:focus-within` on containers).

### 2.1 Intent chooser ("What brings you here today?")
- **Seen on:** MasterClass ("What brings you to MasterClass today?" — 8 checkbox intents → Continue), Coursera ("What brings you to Coursera today?"), Brilliant ("I'm a learner" / "I'm a parent or teacher"), TIPS ("Choose the training for your job" / "Buy training for your team or event").
- **Good for:** Train 321's two audiences (worker vs. employer) and two questions ("what does my state require?" / "which course?"). Put it in the hero as two segmented tabs that swap the finder's copy and CTA.
- **Mobile:** excellent — chips/segments are thumb-friendly.
- **Build:** `role="tablist"` segmented control; store choice in URL (`?for=teams`) and `localStorage`; content swap with a 150 ms opacity crossfade.
- **A11y:** real buttons, `aria-selected`, arrow-key navigation; no auto-submit on selection.

### 2.2 Bento grid
- **Seen on:** Stripe (product grid with background imagery), Raycast (extensions by category), Framer (platform features), Attio, Lemon Squeezy, Magic UI's BentoGrid (`col-span-3 lg:col-span-1/2`, background component + `group-hover:scale-90` content, `mask-image` fades, CTA reveals on hover).
- **Good for:** "Browse by category" — 6 course groups as tiles of unequal size (Food Handler and Alcohol large; Manager, Harassment, BOH, FOH smaller), each with a photo, a one-line promise, a from-price, and a hover-revealed "View courses →".
- **Mobile:** collapses to single column; keep tiles ≥ 160 px tall; limit to 6–9 tiles (saasframe's guidance).
- **Build:** CSS grid `grid-template-columns: repeat(6, 1fr)`; `grid-column: span 4/2`; tile = `<a>` with `position:relative; overflow:hidden; border-radius: 20px`; photo as `<Image fill sizes=…>`; `.tile:hover img { transform: scale(1.04) }`, `.tile:hover .cta { opacity:1; transform:none }` with 300 ms `ease-out`.
- **A11y:** whole tile is one link with a single accessible name; CTA text visible in DOM; `:focus-visible` outline on the tile.

### 2.3 Marquee logo bar ("trusted by")
- **Seen on:** Stripe (auto-rotating logo strip), Homebase (logo loop repeated twice, "Trusted by 150,000+ small businesses and their teams."), Retool (logo bar directly under hero and again mid-page), Clay (logos + metrics "+140% outbound pipeline"), Notion (20+ logos). Magic UI Marquee: duplicates children (`repeat=4`), `--duration`, `pauseOnHover`, `reverse`, `vertical`, edge gradient masks.
- **Good for:** Train 321's California Restaurant Association / Denny's / Domino's logos + a caption like "Trusted by 5,000+ locations". Place directly under the hero (Retool) and again before the team CTA.
- **Mobile:** works; slow it down (60 s) and reduce logo height to 24 px.
- **Build (no lib):**
  ```css
  .marquee{--duration:45s;display:flex;overflow:hidden;
    mask-image:linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)}
  .marquee__track{display:flex;gap:56px;flex:none;min-width:100%;
    animation:scroll var(--duration) linear infinite}
  .marquee:hover .marquee__track{animation-play-state:paused}
  @keyframes scroll{to{transform:translateX(calc(-100% - 56px))}}
  @media (prefers-reduced-motion:reduce){.marquee__track{animation:none;flex-wrap:wrap}}
  ```
  Render the track twice; the clone gets `aria-hidden="true"`.
- **A11y:** the list of names in a visually-hidden `<ul>` once; pause on hover/focus; honour reduced motion (Magic UI's docs do not mention it — add it yourself).

### 2.4 Cursor-following spotlight / glow border on cards
- **Seen on:** Linear-style feature cards; Aceternity Card Spotlight (radial-gradient mask following the cursor, `radius=350`), Framer "Hover Glow Effect" (CSS vars updated in `requestAnimationFrame`, no React re-render; fill / border / both via `mask-composite`), freefrontend glowing grid cards (one `pointermove` on the grid updates `--mouse-x/--mouse-y` per card so neighbours' borders light up too).
- **Good for:** course cards and the "Accepted in your state" results panel — premium feel without imagery.
- **Mobile:** no-op (gate behind hover media query); resting border stays visible.
- **Build:**
  ```js
  grid.addEventListener('pointermove', e => { for (const c of cards) {
    const r = c.getBoundingClientRect();
    c.style.setProperty('--mx', `${e.clientX - r.left}px`);
    c.style.setProperty('--my', `${e.clientY - r.top}px`); } });
  ```
  ```css
  .card{position:relative;border:1px solid var(--line);border-radius:16px}
  .card::before{content:"";position:absolute;inset:0;border-radius:inherit;pointer-events:none;
    background:radial-gradient(260px circle at var(--mx) var(--my),rgb(255 122 0/.16),transparent 60%);
    opacity:0;transition:opacity .3s}
  .card:hover::before{opacity:1}
  /* border-only variant */
  .card::after{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1px;pointer-events:none;
    background:radial-gradient(320px circle at var(--mx) var(--my),var(--accent),transparent 60%);
    -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
    -webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity .3s}
  .card:hover::after{opacity:1}
  ```
- **A11y:** purely decorative; keep a visible `:focus-visible` ring independent of the glow.

### 2.5 Hover-expanding image accordion (flex)
- **Seen on:** Stripe's Enterprise / Startups / Platforms expandable panels with photographs; 21st.dev Hover Expand ("panels expand on hover or keyboard focus and the rest collapse to a thin strip with a rotated label"); Framer Hover Accordion (images + auto-playing video); CSS-only versions (https://www.cssscript.com/expanding-accordion-gallery/, https://freefrontend.com/css-horizontal-accordions/).
- **Good for:** the "Industries we serve" band — 6–8 full-bleed photos (restaurant line, bar, hotel, café, grocery, catering, healthcare, stadium) in one row; hover grows one to ~45 % width and reveals its label + "See courses".
- **Mobile:** switch to a vertical stack of 120 px rows that expand on tap (one open at a time), or to a scroll-snap carousel. Do not ship the horizontal version under 768 px.
- **Build:**
  ```css
  .acc{display:flex;gap:8px;height:clamp(360px,52vh,560px)}
  .acc>a{flex:1 1 0;min-width:0;position:relative;overflow:hidden;border-radius:18px;
    transition:flex-grow .55s cubic-bezier(.22,1,.36,1)}
  .acc>a img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;
    transition:transform .8s ease}
  .acc>a:hover,.acc>a:focus-visible{flex-grow:4}
  .acc>a:hover img{transform:scale(1.05)}
  .acc>a .label{position:absolute;left:18px;bottom:18px;writing-mode:vertical-rl;rotate:180deg;
    color:#fff;transition:opacity .3s}
  .acc>a:is(:hover,:focus-visible) .label{writing-mode:horizontal-tb;rotate:none}
  @media (max-width:767px){.acc{flex-direction:column;height:auto}
    .acc>a{flex:0 0 112px}.acc>a[aria-expanded=true]{flex-basis:260px}}
  ```
  Give the first panel `aria-current` so there is always one open at rest; Framer Motion `layout` is an acceptable alternative for springier easing.
- **A11y:** panels are links; label text must be in the DOM at all times (not only on hover); `:focus-visible` expands exactly like hover; reduced motion → no flex transition (instant).

### 2.6 Hover-to-reveal floating photo on a pill cloud (Toast)
- **Seen on:** Toast homepage section "We help build businesses that last / Thousands of specific features for however you serve or sell." — 16 business types (Full Service, Bar & Lounge, Pizzeria, Fine Dining, Enterprise, Hotel, Food Truck, Cafe & Bakery, Quick Service, Fast Casual, Drive-Thru, Bottle Shop, Convenience, Grocery, Butcher Shop, Hybrid) rendered as big `rounded-[72px]` pills (42 px text on desktop) in a centred `flex-wrap gap-3`. DOM-verified behaviour: pill background turns brand colour on hover; a `position:fixed` 200×250 px photo card (`rounded-16`, `shadow-xl`, AVIF image) follows the cursor and animates from `opacity-0 scale-75 rotate-[-8deg]` to `opacity-100 scale-100 rotate-0` in 200 ms `ease-out`; the floating card is `hidden lg:block`, so mobile gets pills only.
- **Good for:** showing breadth of industries (Train 321 could list 16–20 workplace types) in a small vertical footprint, with a photo for each — this is the single most "alive" pattern in the set and the cheapest to build.
- **Mobile:** pills wrap and are tappable; no floating photo. Optionally show a small thumbnail inside the pill on tap.
- **Build (React):** one `<a>` per pill; one absolutely-positioned floating `<div>` per pill (or a single shared floater whose `src` swaps); `onPointerMove` sets `left = clientX + 16; top = clientY - 125` through `style.transform` (rAF-throttled); toggle a `data-show` attribute for the scale/rotate/opacity transition; `pointer-events:none` on the floater; preload images with `<link rel="preload" as="image">` for the first six.
- **A11y:** floater is `aria-hidden`; pill text is the link name; no information lives only in the photo.

### 2.7 Image zoom / reveal on hover with gradient caption (MasterClass tiles)
- **Seen on:** MasterClass "Popular now" tiles — 9:16 image, `mc-tile-overlay--gradient-bottom`, `mc-animation--zoom` on the image, "New" badge top-left, duration caption; Coursera course cards; Awwwards image-hover collections.
- **Good for:** popular-course cards and blog cards.
- **Build:** `.tile{overflow:hidden;border-radius:14px} .tile img{transition:transform .6s cubic-bezier(.22,1,.36,1)} .tile:hover img{transform:scale(1.06)} .tile::after{content:"";position:absolute;inset:auto 0 0 0;height:55%;background:linear-gradient(transparent,rgb(0 0 0/.65))}`. Clip-path variant for a "reveal": start `clip-path:inset(0 0 0 0 round 14px)` and animate the inset on hover (see Emil Kowalski's clip-path notes — hardware accelerated, no layout shift).
- **Mobile:** no zoom; keep gradient caption.

### 2.8 Staggered fade/blur-up on scroll
- **Seen on:** practically every site in the set; Magic UI BlurFade (Framer Motion variants, `useInView` margin `-50px`, `blur 6px`, `offset 6`, `duration .4`, `delay` per item for stagger).
- **Good for:** section headers, card grids, stats.
- **Build (CSS-only, progressive):**
  ```css
  @media (prefers-reduced-motion:no-preference){
    @supports (animation-timeline:view()){
      .reveal{animation:rise linear both;animation-timeline:view();animation-range:entry 0% entry 40%}
    }
  }
  @keyframes rise{from{opacity:0;transform:translateY(24px);filter:blur(6px)}}
  ```
  Supported in Chrome/Edge and Safari 26 (WebKit guide); for Firefox add an IntersectionObserver fallback that toggles `.is-in` and uses `transition-delay: calc(var(--i) * 70ms)` for stagger. Keep `animation-timeline` *after* the `animation` shorthand or it gets reset.
- **A11y:** content must be readable if the animation never runs (use `both` fill with sensible `from` only; never start at `opacity:0` without the media query guard).

### 2.9 Sticky scroll-telling ("How it works")
- **Seen on:** Attio's numbered 1–5 revenue journey, Cal.com 01/02/03, Lemon Squeezy 01–06, 21st.dev Text Parallax Content (`useScroll` + `useTransform`, sticky image, overlay copy), Aceternity Sticky Scroll Reveal, varun.ca scrollytelling (`position: sticky` figure).
- **Good for:** "Pick your state → Take the course on your phone → Download your certificate" with the phone/certificate visual pinned on the right while three steps scroll on the left.
- **Build:** `.story{display:grid;grid-template-columns:1fr 1fr;gap:64px} .story__media{position:sticky;top:96px;height:70vh} .story__step{min-height:70vh;display:grid;align-content:center}`; an IntersectionObserver on steps sets `data-active` which crossfades the pinned visual (three stacked images, `opacity` transitions). Framer Motion `useScroll({target})` + `useTransform` if you want progress-linked parallax.
- **Mobile:** un-stick; render image above each step.
- **A11y:** steps are an `<ol>`; visuals are decorative; reduced motion → crossfade only.

### 2.10 Animated number counters
- **Seen on:** Stripe metrics ("135+ currencies", "$1.9T", "99.999%", "200M+"), Mercury ("300K+", "1 in 3", "$20B+", "4.9"), Linear ("40,000 product teams"), Magic UI NumberTicker (`value`, `startValue`, `direction`, `delay`, `decimalPlaces`).
- **Good for:** Train 321's "50,000+ certificates", "5,000+ locations", "4.8/5", "50 states".
- **Build (no lib):** IntersectionObserver at `threshold:.5` → `requestAnimationFrame` loop over 1.2 s with `1-(1-p)^3` easing; `Intl.NumberFormat` for commas; render the final value immediately when reduced motion is on.
- **A11y:** put the final number in `aria-label` (or a visually-hidden span) and mark the ticking span `aria-hidden` so screen readers hear one number, not 60.

### 2.11 Masked text reveal (headline rises through a clip)
- **Seen on:** Awwwards hover/typography collections; f7.de headline mask animation; Emil Kowalski's clip-path essay; MasterClass's two-line uppercase hero.
- **Good for:** the hero H1 and section H2s — a one-time, 700 ms, line-by-line rise reads "crafted" without being busy.
- **Build:** split into lines (`<span class="line"><span>…</span></span>`); `.line{overflow:hidden;display:block} .line>span{display:inline-block;transform:translateY(110%);animation:up .8s cubic-bezier(.22,1,.36,1) forwards;animation-delay:calc(var(--i)*90ms)} @keyframes up{to{transform:none}}` — or `clip-path:inset(0 0 100% 0)` → `inset(0)`.
- **A11y:** text is real text; reduced motion → no animation; do not split words into letters (breaks screen readers).

### 2.12 Gradient-mesh + grain backgrounds
- **Seen on:** Stripe's animated wave hero, Raycast and Superhuman gradient overlays, Mercury's subtle lighting.
- **Good for:** the hero and final CTA bands — warmth behind photography without a dark theme.
- **Build:** two or three large `radial-gradient()`s in oklch with low alpha on a light base; grain via an inline SVG `feTurbulence` (`type="fractalNoise" baseFrequency=".8" numOctaves="3"`) tile at `opacity:.05–.08` with `mix-blend-mode:multiply`; optional slow `@keyframes` hue drift on the gradient layer only (`transform`/`opacity`, 30 s).
- **A11y:** ensure 4.5:1 text contrast over the brightest part of the mesh; pause drift under reduced motion.

### 2.13 Tabbed product tour / persona tabs
- **Seen on:** Notion (3-part tabbed tour with desktop/mobile screenshots), Clay ("What do you want to build?" six tabs), Webflow (marketing/design/engineering/agency persona tabs), Attio (numbered 1–5 tabs), Toast IQ (Sales/Menu/Labor).
- **Good for:** "Browse by category" (tabs = course groups) and a "For teams" tour (Assign → Track → Download certificates).
- **Build:** `role="tablist"` with arrow-key roving tabindex; panels crossfade (`@starting-style` + `transition: opacity .25s` or Framer `AnimatePresence mode="wait"`); auto-advance every 6 s only on desktop and only until first interaction; images preloaded.
- **Mobile:** tabs become a horizontally scrollable chip row with `scroll-snap`.

### 2.14 Portrait-mosaic marquee hero (MasterClass)
- **Seen on:** MasterClass hero — right half is a grid of instructor portraits in two tile sizes (DOM: 172×215 and 256×319) arranged in columns that drift vertically; left half is the uppercase two-line headline, price line, red CTA, "30-day money-back guarantee" microcopy.
- **Good for:** Train 321's hero right half: 3 columns of worker portraits (line cook, bartender, barista, hotel housekeeper, grocery clerk, caregiver) drifting slowly in alternating directions — instantly says "every industry, real people".
- **Build:** three `.col` flex columns with `animation: drift 80s linear infinite` (`translateY(-50%)` on a duplicated column; middle column `reverse`); container `mask-image` fade top/bottom; `pauseOnHover`; images `loading="eager"` for the first row only, AVIF, 400 px wide.
- **Mobile:** two columns, 40 vh tall, slower; or a single static collage with reduced motion.
- **A11y:** `aria-hidden` on the mosaic; `alt=""`; people in the photos are not presented as customers (licensing — see §6).

### 2.15 Focus cards (hover one, dim the rest)
- **Seen on:** Aceternity Focus Cards (hovered index in state; non-hovered get `blur-sm` + `scale-[0.98]`).
- **Good for:** a 6–8 photo "Workplaces we train" grid on desktop as an alternative to the flex accordion.
- **Build (pure CSS):** `@media (hover:hover){ .grid:hover .card:not(:hover){filter:blur(3px);opacity:.6;transform:scale(.98)} }` with 300 ms transitions; add `:focus-within` equivalents.
- **A11y:** blur is decorative; the focused card remains fully legible.

Also worth noting: **3D tilt cards** (Aceternity 3D Card: cursor → `rotateX/rotateY`, `perspective`, `transform-style: preserve-3d`, child `translateZ`) and **magnetic buttons** (21st.dev/bundui; framer.university tutorial; button translates 20–30 % of cursor offset toward the pointer, springs back) are both fashionable but fragile: keep tilt ≤ 6°, use them on at most one element (the hero CTA / the certificate mock), and gate both behind `(hover:hover) and (pointer:fine)`. **Quote-as-headline** (Arc: "Arc is the Chrome replacement I've been waiting for" — The Verge) is a good trust-band idea if Train 321 has a strong press or association quote (e.g. California Restaurant Association).

---

## 3. Industry / category showcases — rebuildable examples

1. **Toast — pill cloud with hover photo popover** (https://pos.toasttab.com/, section "We help build businesses that last").  
   16 business-type pills, centred flex-wrap, 42 px text, `rounded-72px`; hover → pill fills brand colour + text goes white; a fixed-position 200×250 photo card (rounded 16, shadow-xl) pops in beside the cursor from `opacity 0 / scale .75 / rotate -8°` in 200 ms ease-out and follows the pointer; hidden below `lg`. Images are AVIF from a CDN, one per business type. **Rebuild exactly as §2.6.** Best fit for "Who we train" with 16–20 workplace types.

2. **Jobber — six photo cards + expandable long list** (https://www.getjobber.com/industries/, "Learn how Jobber serves your industry").  
   Featured grid of six industry cards (Cleaning, Construction, General Contracting, Landscaping, Lawn Care, Plumbing), each card showing **two images** (a person + their work: "a woman wearing yellow gloves", "a man riding a lawn mower"); below it an alphabetical text list of 50+ further industries. Photography is candid and occupational, not corporate. **Rebuild:** 3×2 card grid (`aspect-ratio: 4/5`, image pair stacked with a 12 px gap, title below, whole card is a link) + a "See all 40 workplaces" disclosure that reveals a 4-column `<ul>`. Best fit for SEO-friendly breadth without clutter.

3. **Instawork — six photo-background cards** (https://www.instawork.com/, "From warehousing and fulfillment to dining facilities and retail, we've got you covered").  
   Six cards (Warehousing, Ecommerce Fulfillment, 3PL, Dining Facilities, Stadiums & Events, Retail Operations), each a full-bleed photo with a dark gradient, industry name, and a "Find workers" link. **Rebuild:** `grid-template-columns: repeat(3, 1fr)`, `aspect-ratio: 3/4`, gradient overlay, `img` zoom on hover, CTA arrow slides 4 px on hover. Simplest photo-forward option; works unchanged on mobile (2 columns).

4. **Stripe — photo accordions by customer type** (https://stripe.com/, Enterprise / Startups / Platforms).  
   Expandable sections whose hero images (aerial street, storefront, doorstep) compose Stripe's parallelogram; one open at a time, click/hover to switch, copy + links inside the open panel. **Rebuild:** the flex accordion of §2.5 with three to five panels, each panel's open state showing a headline, two bullets, and "See courses". Best fit for a small number of audiences (Restaurants · Bars & nightlife · Hotels & venues · Grocery & retail · Healthcare & senior living).

5. **MasterClass — category chip row + 9:16 tile carousel** (https://www.masterclass.com/, "Trending / Acting & Performing Arts / … / Food & Drink / …" then "Popular now · See all").  
   A horizontally scrollable chip row filters a carousel of portrait tiles (gradient-bottom caption, "New" badge, duration). **Rebuild:** chips as `role="tablist"` with `scroll-snap-type:x mandatory`; the tile track is a CSS scroll-snap carousel with prev/next buttons; chips re-sort/filter cards with a 250 ms FLIP (Framer Motion `layout`) so the re-sort reads as motion, not a reload. Best fit for "Popular courses" (chips = Food safety · Alcohol · HR · Kitchen skills · Front of house · Spanish).

6. **Lightspeed — vertical tiles with "Explore [x] software" links** (https://www.lightspeedhq.com/, "Tailor Lightspeed Retail to your unique business").  
   15+ verticals as text tiles (name, descriptor, link); no photos — proof that breadth without imagery reads flat. Use only as the fallback/SEO list under a photo pattern.

7. **Coursera — category tiles + "Trending searches" chips** (https://www.coursera.org/, "Browse categories", "Trending searches: Python, Data Analytics, Project Management").  
   Pairs a tile grid with a chip row of the most-searched terms. **Rebuild:** under the finder, a "Most searched: Texas food handler · TABC · California RBS · Illinois BASSET · NY harassment" chip row that pre-fills the finder — cheap, data-driven, and great for SEO internal links.

Honourable mentions: Square buries business types in a mega-menu (Food & Beverage → coffee shops, quick service, drive-thru, full service, bars & breweries, food trucks, catering, bakeries, pizzeria) — useful as the *taxonomy* for Train 321's list; Homebase uses a logo marquee ("Trusted by 150,000+ small businesses") with a lifestyle hero photo (phone + falafel bowl on a restaurant table) rather than industry tiles; Deputy lists industries only in the footer (don't).

**Recommendation for Train 321:** use **two** of these, not one — the Toast pill cloud for breadth (20 workplace types, each with a photo) and a Jobber/Instawork six-card grid for the anchor segments (Restaurants · Bars & breweries · Cafés & bakeries · Hotels & venues · Grocery & convenience · Healthcare, schools & senior living). Mobile gets the cards (2-up) and the pills (wrapping, no popover).

---

## 4. State-selection UX

### What the market does
| Mechanism | Who | Notes |
|---|---|---|
| Plain `<select>` in hero | Userve ("Select Your State" + "Find Your Program"), DriversEd ("Select a State" + "Select a Product"), AceableAgent ("Choose a state") | One step, familiar, zero discoverability of what's inside |
| Per-course dropdown | AAA Food Handler, Always Food Safe, Trust20 (with an approval sentence under it), Learn2Serve ("Get Training In:") | Good when the course is chosen first; repetitive |
| Alphabetical link wall | TIPS, Premier, eFoodTrainer, Kaplan ("Start With Selecting Your State" → abbreviation list) | SEO-friendly, slow to use, ugly |
| Mega-menu state→county | StateFoodSafety | Great for crawlers; heavy for humans |
| Query-param shop (`?statecode=ny&county=…&lg=es`) | eFoodHandlers | Fine as a URL contract, not as UI |
| Image map + dropdown + links | Rserving | Only map in the niche; a static image map (no hover/keyboard) |
| Region-grouped state cards with "Starting at $149" | AceableAgent ("Choose Your State to Learn More") | Nice: price per state visible before clicking |

### Recommended pattern for Train 321 (layered)
1. **Geolocated default, never auto-submitted.** On Vercel, read `x-vercel-ip-country-region` (ISO 3166-2 region, e.g. `TX`) or `geolocation(request).region` from `@vercel/functions` (https://vercel.com/guides/geo-ip-headers-geolocation-vercel-functions, https://vercel.com/docs/edge-network/headers) in the server component and pass it as the finder's initial value. Show it as a chip: "Showing courses accepted in **Texas** — Not you? Change". Headers are absent locally, so default to "Select your state" in dev.
2. **Searchable combobox (always present, all breakpoints).** Type "te" → Tennessee, Texas; show the two-letter code as a muted suffix; group "Popular" first. Follow the WAI-ARIA APG editable combobox with list autocomplete (https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/): `role="combobox"`, `aria-autocomplete="list"`, `aria-expanded`, `aria-controls`, `aria-activedescendant` (DOM focus stays in the input), Up/Down to move, Enter to select, Escape to close/clear, printable characters filter, scroll the active option into view. Keep a real `<label>` ("State") — do not use the placeholder as the label (USWDS combo box guidance: https://designsystem.digital.gov/components/combo-box/). Train 321 already has `CustomSelect` and `US_STATES` in `lib/states.ts`; upgrade the select to this combobox.
3. **Popular-state chips** under the input (TX, CA, FL, IL, AZ, NY, WA, UT — order by actual sales from GA4, not alphabet). One tap sets the state. Chips are buttons with `aria-pressed`.
4. **Interactive SVG map on desktop (≥1024 px) as the visual, not the only control.** Hover tints the state and shows a tooltip with the count ("Texas · 6 courses accepted"); click selects. Libraries: `@mirawision/usa-map-react` (https://github.com/MiraWision/usa-map-react — per-state click/hover/focus handlers, labels, tooltips), `react-svgmap-usa`, or a hand-rolled SVG per the WebsiteBeaver tutorial (https://websitebeaver.com/how-to-make-an-interactive-and-responsive-svg-map-of-us-states-capitals). Keep the file small (simplified paths, ~50 KB).  
   **A11y (BOIA tips, https://www.boia.org/blog/interactive-maps-and-accessibility-4-tips):** each state `<path>` wrapped in a `<button>`/`<a>` or given `tabindex="0"`, `role="button"`, and a `<title>`/`aria-label` ("Texas"); visible focus ring; don't rely on colour alone (add a stroke on hover/selected); the combobox is the text alternative, so the map may be `aria-hidden` *if* every state is reachable in the combobox. Never trap keyboard focus in the map.  
   **Mobile:** hide the map (small states — RI, DE, DC, NJ — are untappable at 375 px) or show it as a decorative, `aria-hidden` illustration that reflects the chosen state.
5. **Inline result, same page.** Selection updates an "Accepted in Texas" panel right beside the picker: course cards with "Accepted by Texas DSHS" / "TABC-approved program #…" lines, from-prices, and a bundle card (TABC + Food Handler). Update the URL (`?state=TX`) with `history.replaceState` so the state survives refresh and is shareable; `aria-live="polite"` announces "6 courses accepted in Texas".
6. **State pages still exist** (`/states/texas`) for SEO — the finder links to them ("See everything for Texas →"), mirroring StateFoodSafety's crawl depth without its mega-menu.

Pros/cons summary: map = delightful and informative on desktop, useless on touch and risky for a11y unless duplicated; combobox = fastest and accessible everywhere, zero delight; chips = one-tap for 80 % of traffic; geolocation = removes a step for most visitors but must be visibly overridable (VPNs, travelling managers buying for another state).

---

## 5. Course-card and pricing conventions in this niche

### Observed price points (Oct 2026)
| Product | Low | Typical | High | Evidence |
|---|---|---|---|---|
| Food handler card | $6 (FHC TX no-exam; Always Food Safe) | **$7–$10** (FHC $7; Premier/eFoodHandlers CA $7.95; 360training national $9.99; eFoodTrainer $9.99; StateFoodSafety CA $10; eFoodHandlers NY $10) | $14.95–$19.95 (Userve $14.95; ServSafe $15; Trust20 $15; eFoodHandlers FL $19.95; FHC WV $27) | §1 |
| Food manager (training + exam) | $49.95 (AAA "from") | **$90–$150** (Trust20 $90; Learn2Serve $109–$149; ServSafe $152.95) | $179 (ServSafe with remote proctoring); exam voucher alone $30 | §1.1, §1.10 |
| Alcohol seller/server | $3.99 (Rserving) / $6.95–$8.95 (LIQUORexam CA RBS, TABC) | **$9.99–$15** (TABC On The Fly $9.99; Learn2Serve $9.99 + $3.25 TX filing fee; LIQUORexam AL $10.95; "TABC On The Fly ~$15" in guides) | $19.99 (Userve RBS) + $3 CA ABC exam fee; TIPS $38–$50 | https://practicetestgeeks.com/tabc/tabc-certification-online, https://servingalcohol.com/best-rbs-course-providers-compared-2026/ |
| Allergen | $12.95 (AAA) | $25 (Trust20) | — | §1.10 |
| Sexual-harassment prevention | $6.95 (AAA) | $14+ (Train 321) | — | §1.10 |
| Bundles | $16.99–$17.99 (TABC + TX/National FH, Learn2Serve), $19.95 (eFoodHandlers CA alcohol + FH) | $22 (LA RV + FH) | $41.99 (UT alcohol + FH) | §1.3, §1.5 |
| **Train 321 today** | FH $10+, Alcohol $10+, Harassment $14+, Manager $159+ | | | https://train321.com/ |

Takeaways: Train 321's handler and alcohol prices sit mid-pack; the manager price ($159+) is at the top of the market next to ServSafe, so the manager card must justify it (ANAB-CFP, proctoring included, retake, 5-year validity). A **state bundle card** (alcohol + food handler, strike-through) is the most obvious missing SKU on the homepage.

### Badges and microcopy that appear on converting cards
- Accreditation **with a number/standard**: "ANAB Accredited" + "#1020" (StateFoodSafety), "ID 1135" (FHC), "ASTM E2659-24" (360training), "ANAB-CFP" (manager).
- Approval **naming the regulator**: "TABC-approved program #454-508", "approved food handler training provider in California", "Government approved everywhere we sell", "Health Department Approved".
- Speed: "Instant certificate download", "Instant exam results", "75-minute program", "2 hours", "No course timer", "Get your certificate in hours, not days."
- Risk reversal: "2 exam attempts included", "1 Free Exam Retake", "Unlimited exam attempts", "72-hour refund", "Pass the exam or get your money back", "Best price — we will match…".
- Device/language: "100% online", "Mobile-friendly", "English / Spanish" toggle, multi-language lists (eFoodHandlers' 8 incl. ASL).
- Validity: "Valid 3 years", "5-Year Manager Certification".
- Social proof on the card itself: "4.9 (43,391 reviews)", "4.6 (491 Reviews)", "91 Ratings"; "Best Seller", "Trending", "New", "Most popular".
- Price presentation: "from $6.95", strike-through regular price + "% OFF" tag (Learn2Serve, LIQUORexam, DriversEd), "$1 off each" bulk, "w/ Employer Account" team price.
- Employer hooks: "Train your team", bulk phone number, "Request a quote", dashboard screenshots (Train 321 already has "Team training CTA").

### Recommended Train 321 course card anatomy (v5)
Photo (4:3, real workplace) with category chip and "Most popular"/"New" badge → title (state-aware: "Texas Food Handler Card") → one-line outcome ("Accepted by Texas DSHS · valid 2 years") → meta row (⏱ 60–90 min · 🗣 EN/ES · 📄 Instant certificate · ↻ Free retake) → price row ("from **$10**", strike-through if bundled) → rating "4.8 ★ (1,240)" → CTA "Enroll" + quiet "Details". Hover: image zoom + glow border; focus-visible ring. Mobile: identical, full-width.

---

## 6. Stock photography sources and licensing

| Source | License (key terms) | Attribution | Notes |
|---|---|---|---|
| **Unsplash** — https://unsplash.com/license | "irrevocable, nonexclusive, worldwide copyright license to download, copy, modify, distribute, perform, and use images… including for commercial purposes, without permission from or attributing the photographer or Unsplash." Not allowed: selling images "without significant modification"; "compiling images from Unsplash to replicate a similar or competing service." | Not required | Owned by Getty since 2021; **Unsplash+** images are a separate paid license — filter them out. Quality is highest; hospitality coverage good. |
| **Pexels** — https://www.pexels.com/license/ | "All photos and videos on Pexels are free to use"; modification allowed; prohibited: identifiable people "in a bad light or in a way that is offensive", implying "endorsement of your product by people or brands", selling unaltered copies, redistribution on stock platforms, use "as part of your trade-mark… business name". | Not required | Largest free library and video; good diversity; also free **videos** for hover-to-play tiles. |
| **Pixabay** — https://pixabay.com/service/license-summary/ | Pixabay Content License: free use and modification; no standalone distribution; no use of recognisable people "in any immoral or illegal way"; nothing "misleading or deceptive"; no trademark use; branded content not for merch. | Not required | More amateur; useful for B-roll and textures. |
| **Nappy** — https://nappy.co/ | CC0; "free for commercial and personal use without attribution" | Not required | Candid photos of Black and Brown people; fixes the diversity gap of the big three. |
| Also: **Openverse** (https://openverse.org/) aggregates CC-licensed images — check each item's license (many are CC BY, which *requires* attribution). | | | |

**Licensing notes for a marketing site**
- Free-site licenses are copyright licenses, not model releases. A photo of a bartender can illustrate "bar staff" but must **not** be captioned as a Train 321 student or paired with a testimonial (Pexels explicitly forbids implying endorsement). Use real customers for testimonials and keep stock people generic.
- Avoid visible brands (soda fridges, POS logos, beer taps with trademarks) — Pexels/Pixabay prohibit trademark use and it looks like fake endorsement.
- Do not put stock photos in the logo/brand mark (prohibited by Pexels/Pixabay).
- Keep a `credits.md` with photographer + URL per asset even though attribution is optional — it's the audit trail if a photo is later removed or re-licensed.
- For a food-safety brand, **reject photos that model violations**: bare hands on ready-to-eat food, no hair restraint, jewellery in prep, raw/cooked cross-contact, drinks on the line, over-pouring. Prefer gloves, hairnets/caps, thermometers, date labels, wristbands at the bar, handwashing.
- Serve as AVIF/WebP through `next/image` at ≤ 1600 px; the whole hero mosaic should stay under ~600 KB.

**Search queries that return strong, diverse worker imagery (Unsplash + Pexels):**
1. `line cook plating kitchen` / `chef expediting pass`
2. `commercial kitchen prep gloves hairnet`
3. `bartender pouring cocktail bar`
4. `server carrying tray restaurant smiling`
5. `barista espresso machine cafe counter`
6. `food truck window owner`
7. `bakery pastry chef display case`
8. `grocery deli counter employee` / `supermarket cashier checkout`
9. `hotel housekeeping staff hallway` / `hotel front desk receptionist`
10. `catering staff buffet event`
11. `brewery taproom bartender taps`
12. `nurse hospital hallway walking` / `caregiver senior living dining`
13. `school cafeteria lunch service worker`
14. `warehouse worker safety vest scanner`
15. `restaurant manager tablet dining room`
16. `dishwasher commercial kitchen stainless` (use `kitchen porter` on Unsplash)
17. `convenience store clerk counter`
18. `restaurant team staff portrait diverse` and Spanish-language variants (`cocinero`, `mesera`, `barista latina`) to surface more diverse sets
19. Pexels video: `chef cooking slow motion`, `bartender shaking cocktail` for hover-to-play tiles (mute, `preload="none"`, `playsinline`)

---

## 7. Recommended page skeleton (section by section)

Existing building blocks to reuse: `HomeCourseFinder`, `StateCoursePicker`, `GroupStateDialog`, `CourseCard`, `TrustLogosCarousel`, `TestimonialQuotes`, `CustomSelect`; data from `lib/states.ts` (`US_STATES`, `availableIn`) and `lib/courseGroups.ts` (`COURSE_GROUPS` with `stateAware`). Light theme, warm neutrals, one vivid accent; photography everywhere; dark bands only for §7.7 and §7.10.

1. **Sticky header** — logo, mega-menu by course group (state-aware links), "For teams", "Sign in", primary "Find my course" that scrolls to the finder. Compact on scroll (`@starting-style` height transition).
2. **Hero = finder** (Userve mechanic, MasterClass visual, TIPS audience split).  
   Left: segmented control "I need a certificate / I'm training a team" (§2.1); masked-text H1 (§2.11) e.g. "The certificate your job needs. Done on your phone, today."; subhead; **state combobox + popular-state chips** (§4) with geolocated default; CTA "Show my courses"; micro-trust row (ANAB badge · "50,000+ certificates" · "4.8/5"). Right: **portrait-mosaic marquee** (§2.14) of real workers across industries. Background: gradient mesh + grain (§2.12).
3. **Logo marquee** (§2.3) — "Trusted by 5,000+ locations" with CRA / Denny's / Domino's etc.; pause on hover; static wrap under reduced motion.
4. **"Accepted in {State}" results panel** — appears/updates inline after a state is chosen (and pre-rendered for the geolocated state): course cards (§5 anatomy) with regulator line and a bundle card; `aria-live`; URL `?state=XX`; link to the state page. Desktop shows the **interactive SVG map** to the left as the picker's visual; mobile hides it.
5. **Browse by category** — tabbed bento (§2.2 + §2.13): tabs = Food Handler · Food Manager · Alcohol · Harassment · Back of House · Front of House; tiles with photo, promise, from-price, hover CTA; cursor-glow borders (§2.4); staggered blur-fade (§2.8).
6. **Popular courses** — chip row + scroll-snap carousel of 9:16/4:3 tiles with "Most popular" badges, duration, rating, price (§3.5, §2.7); "Most searched" chips (Coursera) that pre-fill the finder.
7. **Who we train (industries)** — dark band: Toast-style **pill cloud with hover photo popover** (§2.6) for 20 workplace types, followed by a 6-card Jobber/Instawork photo grid for the anchor segments (§3.1–3.3). Mobile: pills wrap, cards go 2-up. Optional: flex accordion (§2.5) instead of the card grid on desktop.
8. **How it works** — sticky scroll-telling (§2.9): 01 Pick your state · 02 Train on any device (EN/ES) · 03 Download your certificate instantly; phone/certificate visual pinned; stacked on mobile.
9. **For employers** — split section: dashboard screenshot (3D tilt ≤ 6° on hover, desktop only), bullets (assign, track, bulk pricing, certificates in one place), "Request a team quote"; quote-as-headline from an association/customer (Arc pattern) if available.
10. **Stats band** — number tickers (§2.10): certificates issued, locations, states, average rating; dark or accent background.
11. **Testimonials** — carousel with real customer portraits, role, city, and a metric where possible (Mercury/Clay pattern); never stock faces.
12. **Approvals strip** — "Accepted by" logos/names: ANAB (#), Texas DSHS, TABC, CA ABC/CDPH, IL IDPH/BASSET, etc., each linking to a verification page.
13. **FAQ** — accordion with FAQ schema; questions sourced from the state result ("Is this accepted in {State}?", "How fast is the certificate?", "Spanish?").
14. **Final CTA** — repeats the state combobox on a gradient-mesh band: "Find the course your state accepts".
15. **Footer** — state index (all 50 + DC) for crawl depth, categories, support, languages, legal.

**Performance/a11y budget:** LCP = hero H1 or first mosaic image (`priority`), total hero images < 600 KB, no layout-shifting animations, every hover effect gated and mirrored by focus, all motion behind `prefers-reduced-motion`, finder fully keyboard-operable, Lighthouse a11y ≥ 95.

---

## Sources (fetched/read 7 Oct 2026)
Competitors: https://www.servsafe.com/ · https://www.servsafe.com/ServSafe-Food-Handler · https://www.servsafe.com/ServSafe-Manager · https://www.servsafe.com/access/SS/Catalog/ProductDetail/SSECT6 · https://www.360training.com/ · https://www.360training.com/course/ansi-accredited-food-handler-training · https://www.360training.com/learn2serve · https://www.360training.com/learn2serve/alcohol/Texas · https://www.statefoodsafety.com/ · https://www.statefoodsafety.com/food-handler · https://www.statefoodsafety.com/food-manager · https://delta.efoodhandlers.com/ · https://www.efoodhandlers.com/shop/program?t=bfs&statecode=ny · https://www.gettips.com/ · https://www.gettips.com/tips-training-online · https://www.userve.com/ · https://www.userve.com/us/ca/food-service/anab-food-handler-training · https://www.userve.com/us/ca/alcohol-service/rbs-certification · https://www.premierfoodsafety.com/ · https://premierfoodsafety.com/food-handlers-card/california · https://www.foodhandlerclasses.com/ · https://efoodtrainer.com/ · https://www.aaafoodhandler.com/ · https://tapseries.io/ · https://alwaysfoodsafe.com/ · https://www.rserving.com/ · https://www.tabconthefly.com/ · https://www.liquorexam.com/ · https://trust20.co/ · https://train321.com/  
Pricing guides: https://practicetestgeeks.com/tabc/tabc-certification-online · https://practicetestgeeks.com/tabc/how-much-is-tabc-certification · https://servingalcohol.com/best-rbs-course-providers-compared-2026/ · https://schoolmaker.com/blog/best-food-protection-courses · https://getlicensemap.com/states/food-handler/california  
Best-in-class: https://linear.app/ · https://vercel.com/ · https://stripe.com/ · https://www.framer.com/ · https://www.coursera.org/ · https://www.duolingo.com/ · https://www.masterclass.com/ · https://brilliant.org/ · https://webflow.com/ · https://superhuman.com/ · https://www.raycast.com/ · https://arc.net/ · https://www.notion.com/ · https://www.clay.com/ · https://resend.com/ · https://cal.com/ · https://www.lemonsqueezy.com/ · https://mercury.com/ · https://retool.com/ · https://attio.com/ · https://pos.toasttab.com/ · https://www.getjobber.com/industries/ · https://www.instawork.com/ · https://www.lightspeedhq.com/ · https://squareup.com/us/en · https://www.joinhomebase.com/ · https://www.deputy.com/ · https://www.aceableagent.com/ · https://www.kapre.com/ · https://driversed.com/  
Patterns & components: https://magicui.design/docs/components/marquee · https://magicui.design/docs/components/bento-grid · https://magicui.design/docs/components/number-ticker · https://magicui.design/docs/components/blur-fade · https://ui.aceternity.com/components/spotlight · https://ui.aceternity.com/components/card-spotlight · https://ui.aceternity.com/components/3d-card-effect · https://ui.aceternity.com/components/focus-cards · https://21st.dev/@educalvolpz/components/hover-expand · https://21st.dev/@bundui/components/magnetic-button · https://21st.dev/@uniquesonu/components/text-parallax-content-scroll · https://21st.dev/@manuarora700/components/sticky-scroll-reveal · https://www.framer.com/marketplace/components/hover-accordion/ · https://www.framer.com/marketplace/components/spotlight-bento-grid/ · https://www.framer.com/marketplace/components/hover-glow-effect/ · https://www.cssscript.com/expanding-accordion-gallery/ · https://freefrontend.com/css-horizontal-accordions/ · https://freefrontend.com/code/interactive-glowing-grid-cards-2026-03-09/ · https://dev.to/kadenwildauer/modern-card-hover-animations-css-and-javascript-3cg3 · https://emilkowal.ski/ui/the-magic-of-clip-path · https://f7.de/en/blog/headline-mask-animation · https://framer.university/blog/how-to-make-magnetic-buttons-in-framer · https://webkit.org/blog/17101/a-guide-to-scroll-driven-animations-with-just-css/ · https://tympanus.net/codrops/?p=75216 · https://modern-css.com/scroll-linked-animations-without-a-library/ · https://varun.ca/scrollytelling · https://www.saasframe.io/blog/designing-bento-grids-that-actually-work-a-2026-practical-guide · https://line25.com/articles/web-design-trends-2026/ · https://www.awwwards.com/inspiration/hover-interactions-tenity · https://www.awwwards.com/inspiration/hover-tag-homerun · https://www.awwwards.com/inspiration/article-gallery-hover-interaction-dave-holloway · https://www.lapa.ninja/ · https://godly.website/ · https://land-book.com/  
State pickers & a11y: https://www.w3.org/WAI/ARIA/apg/patterns/combobox/examples/combobox-autocomplete-list/ · https://designsystem.digital.gov/components/combo-box/ · https://www.evinced.com/blog/creating-accessible-combo-boxes · https://www.boia.org/blog/interactive-maps-and-accessibility-4-tips · https://github.com/MiraWision/usa-map-react · https://websitebeaver.com/how-to-make-an-interactive-and-responsive-svg-map-of-us-states-capitals · https://www.framer.com/marketplace/components/usa-map/ · https://vercel.com/guides/geo-ip-headers-geolocation-vercel-functions · https://vercel.com/docs/edge-network/headers  
Photography licensing: https://unsplash.com/license · https://www.pexels.com/license/ · https://pixabay.com/service/license-summary/ · https://nappy.co/ · https://licenseorg.com/blog/unsplash-license-attribution-required
