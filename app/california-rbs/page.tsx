import type { Metadata } from "next";
import Link from "next/link";
import {
  getCaRbsPage,
  getEnrollmentPage,
  getSiteSettings,
  getTestimonials,
  type Testimonial,
  type TrustLogo
} from "@/lib/sanity";
import { getRbsCourses, parseCourseIds, rbsPublishableKey } from "@/lib/adsRbs";
import type { CartCourse } from "@/lib/enroll";
import { stateFromParam, suggestAddOns } from "@/app/enrollment/addOns";
import HeroCertificate, { HeroNameBar } from "./HeroCertificate";
import RbsCheckout from "./RbsCheckout";
import StickyEnroll from "./StickyEnroll";
import RevealOnScroll from "./RevealOnScroll";
import "./rbs.css";

// California RBS — the ad landing page. Where visitors land after clicking a
// California RBS ad: one course, one checkout, no site navigation to wander
// off into. Separate from /enrollment on purpose (its own layout, its own API
// routes and LMS endpoints), so ad changes can't disturb that page.
//
// Every factual claim here is the wording already approved on the site's
// California RBS course page (/courses/rbs).

const DEFAULT_TITLE = "California RBS Certification Training Online";
const DEFAULT_DESCRIPTION =
  "Complete your required California Responsible Beverage Service (RBS) training online with Train 321, an approved California RBS training provider.";

// Title / description from Studio (California RBS Ad Page → SEO), else the built-ins.
export async function generateMetadata(): Promise<Metadata> {
  const cms = await getCaRbsPage().catch(() => null);
  return {
    // The site's title template adds " | Train 321".
    title: cms?.seoTitle || DEFAULT_TITLE,
    description: cms?.seoDescription || DEFAULT_DESCRIPTION,
    // Ad traffic only: keep it out of search results (the course page covers SEO).
    robots: { index: false, follow: false }
  };
}

const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) || "";
const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: Number.isInteger(n) ? 0 : 2 });

const FAQ = [
  {
    q: "Who needs RBS training in California?",
    a: "Anyone who serves alcoholic beverages, or manages people who do, at an ABC-licensed on-premises business needs to be RBS certified."
  },
  {
    q: "Is Train 321 an approved provider?",
    a: "Yes. Train 321 is an approved California RBS training provider."
  },
  {
    q: "What happens after I finish the training?",
    a: "We report your completion to California ABC within 24 hours. You then log in to the ABC's RBS Portal and pass the Alcohol Server Certification Exam with a score of 70% or higher within 30 days of your confirmed training date."
  },
  {
    q: "Who issues my certification?",
    a: "Your official California Alcohol Server Certification is issued by California ABC after you pass the state exam."
  },
  {
    q: "I already have a Train 321 account. Will this create another one?",
    a: "No. Enter the email you use with Train 321 and the course is added to your existing account."
  }
];

export default async function CaliforniaRbsLanding({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  // The cart, the /enrollment way: ?ids=1,2 (also ?course= / ?id=). With no
  // ids — the normal ad link — it's the California RBS course. The LMS
  // re-checks every id and drops any it doesn't sell.
  const ids = parseCourseIds(sp.ids, sp.course, sp.id);
  // Test run: ?demo=1 walks the whole checkout with a guest buyer — locally and
  // on the live site. It can't take a payment or create anything: in demo mode
  // the card field isn't rendered (Stripe is never used), the email check and
  // "Pay" are simulated in the browser, and no LMS checkout / sign-in / start
  // call, ad attribution or analytics purchase event is ever made. Links
  // without ?demo=1 behave exactly as before.
  const demo = one(sp.demo) === "1";
  const linkState = stateFromParam(one(sp.state));
  // Studio copy (California RBS Ad Page). Blank fields keep the built-ins below.
  const cms = await getCaRbsPage().catch(() => null);
  // No ids in the link → Studio's "Courses to sell", else the LMS's RBS course.
  const cartIds = ids.length ? ids : (cms?.defaultCourseIds ?? []);
  const [courses, settings, testimonials, enrollmentPage] = await Promise.all([
    getRbsCourses(cartIds),
    getSiteSettings().catch(() => null),
    getTestimonials().catch(() => [] as Testimonial[]),
    getEnrollmentPage().catch(() => null)
  ]);
  // "Often added": Studio's own picks for this page, else the same as /enrollment.
  const popularIds = cms?.popularCourseIds.length ? cms.popularCourseIds : (enrollmentPage?.popularCourseIds ?? []);
  const { picks: suggestions } = courses.length
    ? await suggestAddOns(courses, popularIds, linkState).catch(() => ({
        picks: [] as CartCourse[],
        byState: false
      }))
    : { picks: [] as CartCourse[] };
  const supportEmail = settings?.supportEmail || "support@train321.com";
  const logos: TrustLogo[] =(settings?.trustLogos || []).filter((l) => l.imageUrl).slice(0, 6);
  // A short testimonial keeps this section compact: a featured short one,
  // else any short one, else the shortest there is.
  const SHORT_QUOTE = 260;
  const shortQuotes = testimonials.filter((t) => (t.quote || "").length <= SHORT_QUOTE);
  const quote =
    shortQuotes.find((t) => t.featured) ??
    shortQuotes[0] ??
    [...testimonials].sort((a, b) => (a.quote || "").length - (b.quote || "").length)[0];
  const total = courses.reduce((s, c) => s + c.price, 0);
  const priceLabel = courses.length ? money(total) : null;
  const faq = cms?.faqItems.length ? cms.faqItems : FAQ;

  // The normal ad link (no ?ids=) sells California RBS; its copy uses the
  // approved wording from the California RBS course page. Links for other
  // courses get neutral wording, so no RBS-only claim is made about them.
  const isRbs = ids.length === 0;
  const heroCertTitle = isRbs ? "California RBS Training" : courses[0]?.name || "Your course";
  const heroChecks = cms?.proofPoints.length
    ? cms.proofPoints
    : isRbs
      ? ["Approved California provider", "Reported to ABC within 24 hours", "Self-paced on any device"]
      : ["Instant access", "Self-paced on any device", "Certificate on completion"];
  const howSteps = isRbs
    ? [
        {
          icon: "fas fa-laptop",
          t: "Complete the training",
          d: "Take the approved RBS course online, on your phone or computer, at your own pace."
        },
        {
          icon: "fas fa-paper-plane",
          t: "We report to California ABC",
          d: "Your training completion is reported to California ABC within 24 hours."
        },
        {
          icon: "fas fa-clipboard-check",
          t: "Pass the ABC exam",
          d: "Log in to the ABC's RBS Portal and pass the certification exam with 70% or higher within 30 days."
        }
      ]
    : [
        { icon: "fas fa-credit-card", t: "Enroll", d: "Pay securely and get instant access." },
        { icon: "fas fa-laptop", t: "Train online", d: "Learn at your own pace, on your phone or computer." },
        { icon: "fas fa-award", t: "Get certified", d: "Pass the course and download your certificate." }
      ];

  return (
    <div className="t321-rbs">
      {/* Landing page: the site header/footer step aside so the only way
          forward is the checkout. */}
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>

      <p className="rbs-ribbon">
        <i className="fas fa-shield-alt" aria-hidden="true" />{" "}
        {cms?.ribbonText ? (
          cms.ribbonText
        ) : (
          <>
            {/* Phones get the short wording so it stays on one line. */}
            <span className="rbs-ribbon__full">Approved California Responsible Beverage Service (RBS) training provider</span>
            <span className="rbs-ribbon__short">Approved California RBS training provider</span>
          </>
        )}
      </p>

      <header className="rbs-top">
        <div className="rbs-wrap rbs-top__inner">
          <Link href="/" className="rbs-top__logo" aria-label="Train 321 home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/logos/train321_logo.png" alt="Train 321" />
          </Link>
          {/* Same support contact as /enrollment's header (Studio's support email). */}
          <a href={`mailto:${supportEmail}`} className="rbs-top__phone">
            <span className="rbs-top__phone-label">Questions?</span>
            <i className="fas fa-envelope" aria-hidden="true" /> {supportEmail}
          </a>
        </div>
      </header>

      {/* ① Hero — the first thing a new visitor from the ad sees: what this
          is, why it's trustworthy, and one clear way to enroll. */}
      <section className="rbs-hero" aria-labelledby="rbs-hero-title">
        <div className="rbs-wrap rbs-hero__grid">
          <div className="rbs-hero__copy">
            <p className="rbs-hero__eyebrow">
              <i className="fas fa-shield-halved" aria-hidden="true" />{" "}
              {isRbs ? "California ABC-approved RBS training" : "Online training by Train 321"}
            </p>
            <h1 id="rbs-hero-title" className="rbs-hero__title">
              {cms?.heroTitle || "Get your California RBS certification online"}
            </h1>
            <p className="rbs-hero__lede">
              {cms?.heroDescription ||
                "Complete your required Responsible Beverage Service training online with Train 321, an approved California RBS training provider."}
            </p>
            {/* The main call to action: type your name → it appears on the
                certificate on the right → "Get my certificate" opens checkout
                with the name filled in. */}
            <HeroNameBar priceLabel={priceLabel || undefined} />
            {/* Trust strip: the reassurance US buyers look for next to a Buy button. */}
            <ul className="rbs-hero__trust">
              <li>
                <a href="#rbs-how" className="rbs-hero__how">
                  How it works <i className="fas fa-arrow-down" aria-hidden="true" />
                </a>
              </li>
              <li>
                <i className="fas fa-lock" aria-hidden="true" /> Secure checkout
              </li>
              <li>
                <i className="fas fa-bolt" aria-hidden="true" /> Instant access
              </li>
              <li className="rbs-hero__cards" aria-label="Visa, Mastercard, American Express and Discover accepted">
                <i className="fab fa-cc-visa" aria-hidden="true" />
                <i className="fab fa-cc-mastercard" aria-hidden="true" />
                <i className="fab fa-cc-amex" aria-hidden="true" />
                <i className="fab fa-cc-discover" aria-hidden="true" />
              </li>
            </ul>
            {/* Proof points: a quiet line of green checks under the action. */}
            {heroChecks.length > 0 && (
              <ul className="rbs-hero__proof">
                {heroChecks.map((t) => (
                  <li key={t}>
                    <i className="fas fa-circle-check" aria-hidden="true" /> {t}
                  </li>
                ))}
              </ul>
            )}
          </div>
          {/* Live certificate: their name fills in as they type, then it
              carries into the checkout (HeroCertificate.tsx). */}
          <HeroCertificate courseTitle={heroCertTitle} showChipA={isRbs} />
        </div>
      </section>

      {/* ② Trusted by */}
      {logos.length > 0 && (
        <section className="rbs-logos" aria-label="Trusted by">
          <div className="rbs-wrap">
            <p>Trusted by restaurant brands and state restaurant associations</p>
            <ul>
              {logos.map((l) => (
                <li key={l.name}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={l.imageUrl} alt={l.label || l.name} loading="lazy" />
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ④ How you get certified — split: heading + Enroll on the left, a
          numbered list of the three steps on the right. */}
      <section className="rbs-section rbs-section--tint rbs-how" id="rbs-how" aria-labelledby="rbs-how-title">
        <div className="rbs-wrap rbs-how__grid">
          <div className="rbs-how__head rbs-reveal">
            <p className="rbs-kicker">How it works</p>
            <h2 id="rbs-how-title" className="rbs-h2">
              {isRbs ? "How you get RBS certified" : "Three simple steps"}
            </h2>
            <p className="rbs-how__sub">
              {isRbs
                ? "From enrolling to your California Alcohol Server Certification, in three steps."
                : "From enrolling to your certificate — all online."}
            </p>
          </div>
          <ol className="rbs-how__steps">
            {howSteps.map((s, i) => (
              <li key={s.t} className="rbs-how__step rbs-reveal" style={{ ["--rbs-d" as string]: `${i * 120}ms` }}>
                <span className="rbs-how__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div className="rbs-how__body">
                  <h3>
                    <span className="rbs-sr-only">Step {i + 1}: </span>
                    {s.t}
                  </h3>
                  <p>{s.d}</p>
                </div>
              </li>
            ))}
          </ol>
          {/* Desktop: sits under the heading (left column); phones: after the steps. */}
          <div className="rbs-how__foot rbs-reveal">
            <a href="#rbs-checkout" className="rbs-btn rbs-btn--pay rbs-btn--glow rbs-how__cta">
              Enroll now{priceLabel ? ` — ${priceLabel}` : ""} <i className="fas fa-arrow-right" aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      {/* ⑤ Enroll — the checkout (every "Enroll now" button lands here). */}
      <section className="rbs-checkout" id="rbs-checkout" aria-label="Enroll">
        <div className="rbs-wrap">
          {courses.length > 0 ? (
            <RbsCheckout
              courses={courses}
              suggestions={suggestions}
              publishableKey={rbsPublishableKey()}
              subtitle={cms?.heroTitle || "California RBS Certification Training"}
              certificateNote={cms?.certificateNote || undefined}
              checkoutHeading={cms?.checkoutHeading || undefined}
              prefillEmail={one(sp.email) || (demo ? "guest@example.com" : "")}
              prefillName={one(sp.name) || (demo ? "Guest Tester" : "")}
              demo={demo}
              prefillPromo={one(sp.promo)}
              stateCode={linkState}
              isRbsDefault={isRbs}
            />
          ) : (
            <div className="rbs-card rbs-unavailable">
              <h2>Enrollment is briefly unavailable</h2>
              <p>Call us and we&rsquo;ll get you enrolled right away.</p>
              <a href="tel:5613257300" className="rbs-btn rbs-btn--pay">
                <i className="fas fa-phone" aria-hidden="true" /> 561-325-7300
              </a>
            </div>
          )}
        </div>
      </section>

      {/* Phones: a slim enroll bar once the hero button has scrolled away. */}
      <StickyEnroll label={`Enroll now${priceLabel ? ` — ${priceLabel}` : ""}`} />
      <RevealOnScroll />

      {quote && (
        <section className="rbs-section rbs-section--tint rbs-section--quote" aria-label="What learners say">
          <div className="rbs-wrap rbs-wrap--narrow">
            <figure className="rbs-quote rbs-reveal">
              <span className="rbs-quote__stars" aria-label="5 stars">★★★★★</span>
              <blockquote>&ldquo;{quote.quote}&rdquo;</blockquote>
              <figcaption>
                <strong>{quote.name}</strong>
                {(quote.role || quote.company) && <span>{[quote.role, quote.company].filter(Boolean).join(", ")}</span>}
              </figcaption>
            </figure>
          </div>
        </section>
      )}

      <section className="rbs-section" aria-labelledby="rbs-faq-title">
        <div className="rbs-wrap rbs-faq">
          <div className="rbs-faq__intro rbs-reveal">
            <p className="rbs-kicker">FAQ</p>
            <h2 id="rbs-faq-title" className="rbs-h2">{cms?.faqHeading || "Questions, answered"}</h2>
            <p className="rbs-faq__help">
              Still have a question? Call <a href="tel:5613257300">561-325-7300</a> or email{" "}
              <a href="mailto:support@train321.com">support@train321.com</a>.
            </p>
          </div>
          <div className="rbs-faq__list rbs-reveal" style={{ ["--rbs-d" as string]: "120ms" }}>
            {faq.map((f) => (
              <details key={f.q} className="rbs-faq__item">
                <summary>
                  {f.q}
                  <i className="fas fa-plus" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="rbs-closer">
        <div className="rbs-wrap rbs-closer__inner rbs-reveal">
          <div>
            <h2>{cms?.closerHeading || "Get your California RBS training done today."}</h2>
            <p>{cms?.closerSub || <>Approved provider &middot; Reported to ABC within 24 hours</>}</p>
          </div>
          <a href="#rbs-checkout" className="rbs-btn rbs-btn--gold">
            {cms?.closerButton || "Enroll now"}
            {priceLabel ? ` · ${priceLabel}` : ""} <i className="fas fa-arrow-right" aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="rbs-foot">
        <div className="rbs-wrap rbs-foot__inner">
          <span>&copy; {new Date().getFullYear()} Train 321. All rights reserved.</span>
          <nav aria-label="Legal">
            <Link href="/legal/terms-conditions">Terms</Link>
            <Link href="/legal/privacy-policy">Privacy</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
