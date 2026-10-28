import type { Metadata } from "next";
import Link from "next/link";
import { getSiteSettings, getTestimonials, getEnrollmentPage, type Testimonial, type TrustLogo } from "@/lib/sanity";
import { getCartCourse, type CartCourse } from "@/lib/enroll";
import { resolveGroup } from "./groupResolve";
import CourseCertificate from "@/components/CourseCertificate";
import QuickBuy, { DEFAULT_BENEFITS } from "./QuickBuy";
import "./marketing-v10.css";

// v10: the email-to-checkout landing page. One link in a campaign email —
//   /marketing-v10?ids=692&email=maria@example.com&name=Maria%20Gonzalez&elt=…&promo=…
// — opens on the course, a certificate preview in the buyer's name and a
// checkout that already knows who they are. Related courses for the same
// state can be added in one tap. Everything below the hero is there to build
// trust (real clients, reviews, plain answers), not to navigate away.
export const metadata: Metadata = {
  title: "Complete your enrollment | Train 321",
  description: "Finish enrolling in your Train 321 course — instant access, certificate the same day.",
  alternates: { canonical: "/marketing-v10" },
  robots: { index: false, follow: false }
};

// Stripe publishable key. Defaults to the staging TEST key so this page never
// picks up a live key by accident; override with NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.
const STAGING_TEST_PK =
  "pk_test_51TXerrHCrvN27dgKikzbOVKiEgVrnoGpmaDOaRQ19Rggz4Vwobdezb8CughlPawXWT662nPSCAsWQPOGWdJc3I3Z00Ylg5794l";

const RATING = "4.9/5";

const STEPS = [
  { title: "Enroll in a minute", body: "Pay once — the course goes straight into your Train 321 account." },
  { title: "Train at your pace", body: "About an hour on your phone or computer. Your progress saves as you go." },
  { title: "Get your certificate", body: "Pass the final and download your certificate right away." }
];

const FAQ = [
  { q: "I already have a Train 321 account — will this create another one?", a: "No. If your email already has an account, the course is added to it. Coming from our email link usually means you won't even need your password." },
  { q: "How long does the course take?", a: "Most people finish in about an hour. Your progress saves automatically, so you can stop and pick up where you left off." },
  { q: "Can I take it on my phone?", a: "Yes — phone, tablet or computer, in English or Spanish." },
  { q: "When do I get my certificate?", a: "As soon as you pass. Download or print it right away; it also stays in your account." },
  { q: "Is my payment secure?", a: "Payments are processed by Stripe over an encrypted connection. Your card details go straight to Stripe and never touch our servers." },
  { q: "Who do I contact if I need help?", a: "Call 561-325-7300 or email support@train321.com — a real person will help you." }
];

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";

export default async function EmailCheckoutLanding({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const raw = [sp.ids, sp.course, sp.id].flat().filter(Boolean).join(",");
  const ids = [...new Set(raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0))];
  const idCourses = (await Promise.all(ids.map((n) => getCartCourse(n)))).filter((c): c is CartCourse => c !== null);

  // ?group=<id> (+ &state=XX): a course GROUP instead of / alongside course ids.
  // Its matching version(s) join the cart; with no state chosen yet (and a
  // state-aware group) the page asks first — see the picker below.
  const group = one(sp.group) ? await resolveGroup(one(sp.group), one(sp.state)) : null;
  const seen = new Set(idCourses.map((c) => c.id));
  const courses = [...idCourses, ...(group?.members || []).filter((c) => !seen.has(c.id))];
  const needsState = Boolean(group && group.stateAware && !group.state && courses.length === 0);

  // Links for the state picker keep every other campaign param (email, elt…).
  const stateHref = (code: string) => {
    const q = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) {
      const val = Array.isArray(v) ? v[0] : v;
      if (val && k !== "state") q.set(k, val);
    }
    q.set("state", code);
    return `?${q.toString()}`;
  };

  const [suggestions, testimonials, settings, enrollmentPage] = await Promise.all([
    // Add-on upsell ("Often added with this course") is intentionally off —
    // the page sells exactly what the link carries.
    Promise.resolve([] as CartCourse[]),
    getTestimonials().catch(() => [] as Testimonial[]),
    getSiteSettings().catch(() => null),
    getEnrollmentPage().catch(() => null)
  ]);
  const logos: TrustLogo[] = settings?.trustLogos || [];
  const supportEmail = settings?.supportEmail || "support@train321.com";
  // Highlights under the certificate: a per-course set from Studio when one is
  // defined for the lead course id, else the Studio defaults, else QuickBuy's
  // built-in four.
  const leadId = courses[0]?.id;
  const benefits =
    enrollmentPage?.courseHighlights.find((c) => c.courseId === leadId)?.highlights ??
    (enrollmentPage?.defaultHighlights.length ? enrollmentPage.defaultHighlights : undefined);
  const featured = testimonials.filter((t) => t.featured);
  const quotes = (featured.length ? featured : testimonials).slice(0, 3);
  const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || STAGING_TEST_PK;

  return (
    <div className="t321-v10">
      {/* Landing page: the site's own header/footer are swapped for a slim
          one, so the only way forward is the checkout. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      <header className="v10-top">
        <div className="v10-wrap v10-top__inner">
          <Link href="/" aria-label="Train 321 home"><img src="/img/logos/train321_logo.png" alt="Train 321" className="v10-top__logo" /></Link>
          <div className="v10-top__right">
            <a href={`mailto:${supportEmail}`} className="v10-top__phone"><i className="fas fa-envelope" aria-hidden="true" /> <span>{supportEmail}</span></a>
          </div>
        </div>
      </header>

      {group && group.state && courses.length === 0 && group.redirectHref ? (
        /* The chosen state is served by a partner site — send them there. */
        <section className="v10-hero">
          <div className="v10-wrap v10-empty">
            <p className="v10-kicker">{group.name}</p>
            <h1 className="v10-title">Your state&rsquo;s version is on our partner site</h1>
            <p className="v10-lede">The approved {group.name} for your state is provided through a partner. Continue there to enroll &mdash; it only takes a minute.</p>
            <a href={group.redirectHref} className="v10-btn v10-btn--pay">Continue to enroll <i className="fas fa-arrow-right" aria-hidden="true" /></a>
          </div>
        </section>
      ) : needsState && group ? (
        /* Group link, state not chosen yet: ask, then reload with &state=XX so
           the matching version(s) land in the cart. Plain links — no client
           state — so the rest of the page stays exactly as it is. */
        <section className="v10-hero">
          <div className="v10-wrap v10-empty">
            <p className="v10-kicker">{group.name}</p>
            <h1 className="v10-title">Which state do you work in?</h1>
            <p className="v10-lede">{group.blurb || "The approved version depends on your state — pick yours and we'll load the right course."}</p>
            <div className="v10-states" role="list">
              {group.stateOptions.map((s) => (
                <Link key={s.code} href={stateHref(s.code)} className="v10-btn v10-btn--state" role="listitem">{s.name}</Link>
              ))}
              {group.hasNationwide && (
                <Link href={stateHref("ALL")} className="v10-btn v10-btn--state" role="listitem">Any other state</Link>
              )}
            </div>
          </div>
        </section>
      ) : courses.length === 0 ? (
        /* No course in the URL: the same hero layout as a course link — kicker,
           headline, blurb, certificate preview, highlights and the side card —
           with the title / description / button from Studio (Enrollment Page →
           "No course in link"). The strings below are the fallbacks. */
        <section className="v10-hero">
          <div className="v10-wrap">
            <div className="v10-hero__grid">
              <div className="v10-head">
                <p className="v10-hello">Your course is ready</p>
                <h1 className="v10-title">{enrollmentPage?.emptyTitle || "Your Train 321 course"}</h1>
                <p className="v10-lede">
                  {enrollmentPage?.emptyLede || "Finish online in about an hour and download your certificate the same day."}
                </p>
                <div className="v10-rating">
                  <span className="v10-stars" aria-hidden="true">★★★★★</span>
                  <span><strong>{RATING}</strong> from 50,000+ learners</span>
                </div>
              </div>

              <div className="v10-more">
                <figure className="v10-cert">
                  <CourseCertificate
                    courseTitle={enrollmentPage?.emptyTitle || "Your Train 321 course"}
                    learnerName="Your Name"
                    showExpiration={false}
                  />
                </figure>
                <ul className="v10-benefits">
                  {(benefits ?? DEFAULT_BENEFITS).map((b, i) => (
                    <li key={`${b.title}-${i}`}>
                      <i className={b.icon || "fas fa-check"} aria-hidden="true" />
                      <span><strong>{b.title}</strong> {b.sub}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="v10-card v10-card--default" id="v10-checkout">
                <div className="v10-card__head">
                  <h2>Complete your enrollment</h2>
                  <span><i className="fas fa-lock" aria-hidden="true" /> Secure</span>
                </div>
                <p className="v10-lede">Pick your course and you&rsquo;ll be enrolled in under a minute.</p>
                <Link href={enrollmentPage?.emptyCtaHref || "/catalog"} className="v10-btn v10-btn--pay">
                  {enrollmentPage?.emptyCtaLabel || "Browse courses"} <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
                <ul className="v10-assure">
                  <li><i className="fas fa-lock" aria-hidden="true" /> Encrypted checkout by Stripe</li>
                  <li><i className="fas fa-bolt" aria-hidden="true" /> Instant access</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <>
          <section className="v10-hero">
            <div className="v10-wrap">
              <QuickBuy
                courses={courses}
                suggestions={suggestions}
                prefillEmail={one(sp.email)}
                prefillName={one(sp.name)}
                prefillPromo={one(sp.promo)}
                linkToken={one(sp.elt)}
                benefits={benefits}
                publishableKey={publishableKey}
                rating={RATING}
              />
            </div>
          </section>

          {logos.length > 0 && (
            <section className="v10-logos" aria-label="Trusted by">
              <div className="v10-wrap">
                <p>Trusted by restaurant brands and state restaurant associations</p>
                <ul>
                  {logos.slice(0, 8).map((l) => (
                    <li key={l.name}>
                      {l.imageUrl ? <img src={l.imageUrl} alt={l.label || l.name} loading="lazy" /> : <span>{l.name}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          )}

          <section className="v10-section">
            <div className="v10-wrap">
              <h2 className="v10-h2">Certified today, in three steps</h2>
              <ol className="v10-steps">
                {STEPS.map((s, i) => (
                  <li key={s.title}>
                    <span className="v10-steps__n">{i + 1}</span>
                    <h3>{s.title}</h3>
                    <p>{s.body}</p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {quotes.length > 0 && (
            <section className="v10-section v10-section--tint">
              <div className="v10-wrap">
                <h2 className="v10-h2">Trusted by the teams we train</h2>
                <div className="v10-quotes">
                  {quotes.map((t) => (
                    <figure key={t.id} className="v10-quote">
                      <span className="v10-stars" aria-label="5 stars">★★★★★</span>
                      <blockquote>&ldquo;{t.quote}&rdquo;</blockquote>
                      <figcaption>
                        <strong>{t.name}</strong>
                        {(t.role || t.company) && <span>{[t.role, t.company].filter(Boolean).join(", ")}</span>}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </div>
            </section>
          )}

          <section className="v10-section">
            <div className="v10-wrap v10-wrap--narrow">
              <h2 className="v10-h2">Questions, answered</h2>
              <div className="v10-faq">
                {FAQ.map((f) => (
                  <details key={f.q}>
                    <summary>{f.q}<i className="fas fa-chevron-down" aria-hidden="true" /></summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </section>

          <section className="v10-closer">
            <div className="v10-wrap">
              <h2>Your course is one step away.</h2>
              <p>Enroll in under a minute and start right now.</p>
              <a href="#v10-checkout" className="v10-btn v10-btn--light">Complete my enrollment <i className="fas fa-arrow-up" aria-hidden="true" /></a>
            </div>
          </section>
        </>
      )}

      <footer className="v10-foot">
        <div className="v10-wrap v10-foot__inner">
          <img src="/img/logos/train321_logo.png" alt="Train 321" className="v10-foot__logo" />
          <nav aria-label="Legal">
            <Link href="/legal/terms-conditions">Terms</Link>
            <Link href="/legal/privacy-policy">Privacy</Link>
            <a href="tel:5613257300">561-325-7300</a>
            <a href="mailto:support@train321.com">support@train321.com</a>
          </nav>
          <p>© 2026 Train 321. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
