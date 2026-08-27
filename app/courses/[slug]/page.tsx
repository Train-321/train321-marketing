import Link from "next/link";
import { Suspense, cache } from "react";
import { notFound } from "next/navigation";
import TrackViewItem from "@/components/TrackViewItem";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, plainText } from "@/lib/seo";
import { getCourse, getCourses, getDetailPagesCopy, getSiteSettings } from "@/lib/sanity";
import { resolveCourse } from "@/lib/staticCourses";
import EnrollButton from "@/components/EnrollButton";
import CourseCertificate from "@/components/CourseCertificate";
import TabcCertificate from "@/components/TabcCertificate";
import { StatePickerProvider, StateSelect, StateResults } from "@/components/StateCoursePicker";
import { getGroupPicker, resolveEnrollCourse } from "@/lib/enroll";
import "./course.css";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = resolveCourse(slug, await getCourse(slug));
  if (!course) return { title: "Course · Train 321" };
  return {
    title: `${course.title} · Train 321`,
    description: course.summary || course.tagline || "",
    alternates: { canonical: `/courses/${slug}` }
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [sanityCourse, copy, settings] = await Promise.all([getCourse(slug), getDetailPagesCopy(), getSiteSettings()]);
  // Fall back to a code-defined course (e.g. TABC) when Sanity has none for
  // this slug — same layout, no CMS document required. Sanity always wins if
  // it has one, so publishing a real doc later transparently takes over.
  const course = resolveCourse(slug, sanityCourse);
  if (!course) notFound();

  const enrollBase = settings.enrollBaseUrl || "http://new-features.train321.com/#/enroll";
  const enrollHref = course.enrollUrl
    || (course.enrollId ? `${enrollBase}?add=${course.enrollId}&checkout=1` : enrollBase);

  // Everything commerce (the cart course, the LMS course group, the state
  // picker) streams in AFTER the page shell: the static content renders
  // instantly and the purchase widgets suspend behind skeletons until the
  // LMS answers. cache() dedupes the lookups so all four islands below
  // share ONE round-trip per render. An explicit enrollUrl override skips
  // the LMS entirely — that's an editor saying "send buyers here".
  const skipLms = Boolean(course.enrollUrl);
  const lms = { enrollId: course.enrollId, skipLms, enrollHref };

  // Chrome copy with fallbacks.
  const crumbHome = copy?.courseCrumbHome || "Home";
  const crumbCourses = copy?.courseCrumbCourses || "Courses";
  const enrollLabel = copy?.courseEnrollLabel || "Enroll now";
  const browseLabel = copy?.courseBrowseLabel || "Browse all courses";
  const overviewEyebrow = copy?.courseOverviewEyebrow || "Course overview";
  const overviewHeading = course.overviewHeading || copy?.courseOverviewHeading || "What you'll get";
  const outcomesHeading = copy?.courseOutcomesHeading || "By the end, you'll be able to";
  const curriculumEyebrow = copy?.courseCurriculumEyebrow || "Curriculum";
  const curriculumHeading = copy?.courseCurriculumHeading || "Inside the course";
  const curriculumLedeTpl =
    copy?.courseCurriculumLedeTpl || "{n} modules — self-paced, with progress that saves automatically.";
  const curriculumLede = curriculumLedeTpl.replace("{n}", String(course.modules?.length || 0));
  const certEyebrow = copy?.courseCertEyebrow || "Your certificate";
  const certHeading = copy?.courseCertHeading || "Official, instant, accepted";
  const certDeliveryLabel = copy?.courseCertDeliveryLabel || "Delivery";
  const certValidityLabel = copy?.courseCertValidityLabel || "Validity";
  const certAcceptedLabel = copy?.courseCertAcceptedLabel || "Accepted by";
  const faqEyebrow = copy?.courseFaqEyebrow || "FAQ";
  const faqHeading = copy?.courseFaqHeading || "Common questions";

  const cta = copy?.courseBottomCta;
  const ctaHeading = cta?.heading || "Ready to get your team certified?";
  const ctaLede =
    cta?.lede ||
    "Buy seats in under a minute. Invite learners by email or CSV. Track completion from a single dashboard.";
  const ctaPrimaryLabel = cta?.primaryCta?.label || "Enroll now";
  const ctaPrimaryHref = cta?.primaryCta?.to || enrollHref;
  const ctaSecondaryLabel = cta?.secondaryCta?.label || "See a demo";
  const ctaSecondaryHref = cta?.secondaryCta?.to || "/demo";

  // Course rich-result schema. Offers are only claimed when a real numeric
  // price exists; "custom pricing" courses stay offer-less rather than lying.
  const courseLd = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: plainText(course.summary || course.tagline),
    url: `${SITE_URL}/courses/${course.slug}`,
    ...(course.image ? { image: course.image } : {}),
    provider: { "@id": `${SITE_URL}/#organization` },
    hasCourseInstance: {
      "@type": "CourseInstance",
      courseMode: "Online",
      courseWorkload: course.modules?.length ? `PT${course.modules.length}H` : "PT1H"
    },
    ...(typeof course.priceFrom === "number" && course.priceFrom > 0
      ? {
          offers: {
            "@type": "Offer",
            price: course.priceFrom,
            priceCurrency: "USD",
            availability: "https://schema.org/InStock",
            url: `${SITE_URL}/courses/${course.slug}`
          }
        }
      : {})
  };

  return (
    <article className="t321-mkt-course">
      <JsonLd data={courseLd} />
      {/* GA4 view_item. Keyed on enrollId so this page's view joins the same
          product as its add_to_cart and purchase; courses with no LMS id
          aren't purchasable, so there's nothing to attribute. */}
      {course.enrollId && (
        <TrackViewItem
          id={String(course.enrollId)}
          name={course.title}
          price={course.priceFrom ?? 0}
          category={course.category}
        />
      )}
      <StatePickerProvider>
      <section className="t321-mkt-course__hero">
        <div
          className={`t321-mkt-container t321-mkt-course__hero-grid${
            course.image ? "" : " t321-mkt-course__hero-grid--solo"
          }`}
        >
          <div className="t321-mkt-course__hero-body">
            <div className="t321-mkt-course__crumbs">
              <Link href="/">{crumbHome}</Link>
              <i className="fas fa-angle-right" aria-hidden="true" />
              <Link href="/catalog">{crumbCourses}</Link>
              <i className="fas fa-angle-right" aria-hidden="true" />
              <span>{course.title}</span>
            </div>
            <span className="t321-mkt-eyebrow">
              <i className={course.icon || "fas fa-book"} aria-hidden="true" />
              {course.eyebrow}
            </span>
            <h1 className="t321-mkt-h1">{course.title}</h1>
            <p className="t321-mkt-lede">{course.tagline}</p>
            {/* Grouped course → picking a state IS the primary action, so the
                picker sits here in the hero body rather than off in the price
                card. Ungrouped courses keep the enroll / browse pair, since
                they have nothing to choose. Streams in behind a skeleton
                shaped like the picker, the common case. */}
            <Suspense
              fallback={
                <div className="t321-mkt-course__pick" aria-hidden="true">
                  <span className="t321-skel t321-skel--label" style={{ display: "block" }} />
                  <span className="t321-skel t321-skel--select" style={{ display: "block" }} />
                </div>
              }
            >
              <HeroWidget {...lms} enrollLabel={enrollLabel} browseLabel={browseLabel} />
            </Suspense>
            {course.accreditations && course.accreditations.length > 0 && (
              <ul className="t321-mkt-course__accred">
                {course.accreditations.map((a) => (
                  <li key={a}>
                    <i className="fas fa-check-circle" aria-hidden="true" />
                    {a}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* The right column is purely a Studio-managed image now. No image →
              no card at all (the hero goes full-width). The price/stats/cart
              block was removed; enrolling lives in the hero body on the left. */}
          {course.image && (
            <aside className="t321-mkt-course__hero-card" aria-label="Course image">
              <div className="t321-mkt-course__hero-media">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={course.image} alt={course.title} />
              </div>
            </aside>
          )}
        </div>
      </section>

      <Suspense fallback={null}>
        <ResultsIsland {...lms} />
      </Suspense>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-course__two">
          <div>
            <span className="t321-mkt-eyebrow">{overviewEyebrow}</span>
            <h2 className="t321-mkt-h2">{overviewHeading}</h2>
            <p className="t321-mkt-course__summary">{course.summary}</p>
          </div>
          {course.outcomes && (
            <div className="t321-mkt-course__outcomes">
              <h3 className="t321-mkt-h3">{outcomesHeading}</h3>
              <ul>
                {course.outcomes.map((o, i) => (
                  <li key={i}>
                    <i className="fas fa-check" aria-hidden="true" />
                    {o}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* An empty array is truthy, which rendered a "Curriculum" block
          announcing "0 modules" on entries that have none — the service
          pages (Licensing, White-Label) in particular. */}
      {course.modules && course.modules.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">{curriculumEyebrow}</span>
              <h2 className="t321-mkt-h2">{curriculumHeading}</h2>
              <p className="t321-mkt-lede">{curriculumLede}</p>
            </div>
            <ol className="t321-mkt-course__modules">
              {course.modules.map((m, i) => (
                <li key={m.title}>
                  <span className="t321-mkt-course__mod-num">{String(i + 1).padStart(2, "0")}</span>
                  <div className="t321-mkt-course__mod-body">
                    <strong>{m.title}</strong>
                    <span>{m.duration}</span>
                  </div>
                  <i className="fas fa-play-circle t321-mkt-course__mod-icon" aria-hidden="true" />
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {course.certificate && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container t321-mkt-course__cert">
            <div className="t321-mkt-course__cert-visual">
              {course.certificateVariant === "tabc" ? (
                <TabcCertificate />
              ) : (
                <CourseCertificate courseTitle={course.title} />
              )}
            </div>
            <div>
              <span className="t321-mkt-eyebrow">{certEyebrow}</span>
              <h2 className="t321-mkt-h2">{certHeading}</h2>
              <dl className="t321-mkt-course__cert-dl">
                <div><dt>{certDeliveryLabel}</dt><dd>{course.certificate.delivery}</dd></div>
                <div><dt>{certValidityLabel}</dt><dd>{course.certificate.validity}</dd></div>
                <div><dt>{certAcceptedLabel}</dt><dd>{course.certificate.accepted}</dd></div>
              </dl>
            </div>
          </div>
        </section>
      )}

      {course.faqs && course.faqs.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container t321-mkt-course__faqs">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">{faqEyebrow}</span>
              <h2 className="t321-mkt-h2">{faqHeading}</h2>
            </div>
            {course.faqs.map((f, i) => (
              <details key={i} className="t321-mkt-course__faq">
                <summary>
                  <span>{f.q}</span>
                  <i className="fas fa-plus" aria-hidden="true" />
                </summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-course__cta-band">
          <div>
            <h2 className="t321-mkt-h2">{ctaHeading}</h2>
            <p className="t321-mkt-lede">{ctaLede}</p>
          </div>
          <div className="t321-mkt-course__cta-band-actions">
            <Suspense fallback={<span className="t321-skel t321-skel--btn" aria-hidden="true" />}>
              <BuyCta {...lms} fallbackHref={ctaPrimaryHref} label={ctaPrimaryLabel} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg" />
            </Suspense>
            <Link href={ctaSecondaryHref} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              {ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>
      </StatePickerProvider>
    </article>
  );
}

/* ── Streaming commerce islands ─────────────────────────
   The page shell renders instantly; these suspend behind skeletons while
   the LMS answers. cache() scopes dedupe to the render, so the four
   islands cost one resolveEnrollCourse + one getGroupPicker between them. */

const cachedCourse = cache((enrollId?: string) => resolveEnrollCourse(enrollId));
const cachedPicker = cache((enrollId?: string) => getGroupPicker(enrollId));

type LmsProps = { enrollId?: string; skipLms: boolean; enrollHref: string };

async function lookup({ enrollId, skipLms }: LmsProps) {
  if (skipLms) return { cartCourse: null, picker: null };
  const [cartCourse, picker] = await Promise.all([
    cachedCourse(enrollId),
    cachedPicker(enrollId)
  ]);
  return { cartCourse, picker };
}

/** Hero / bottom-band buy button: anchors to the state picker for grouped
    courses, buys the single course inline otherwise. */
async function BuyCta(
  props: LmsProps & { label: string; className: string; fallbackHref?: string }
) {
  const { cartCourse, picker } = await lookup(props);
  const grouped = Boolean(picker);
  return (
    <EnrollButton
      href={grouped ? "#choose-your-state" : props.fallbackHref || props.enrollHref}
      label={props.label}
      className={props.className}
      course={grouped ? null : cartCourse}
      mode="buy"
    />
  );
}

/** The hero body's primary action. A grouped course leads with the state
    picker — nothing can be bought until a state is chosen, so the dropdown
    replaces the enroll / browse pair entirely. Everything else keeps the
    original buttons. */
async function HeroWidget(
  props: LmsProps & { enrollLabel: string; browseLabel: string }
) {
  const { cartCourse, picker } = await lookup(props);

  if (picker && picker.states.length > 0) {
    return (
      <div className="t321-mkt-course__pick">
        <StateSelect picker={picker} variant="hero" />
      </div>
    );
  }

  // Ungrouped course — nothing to choose, so the original buttons stand. The
  // states list is now every state rather than only the tagged ones, so the
  // length guard above is a safety net, not a case we expect to hit.
  return (
    <div className="t321-mkt-course__cta">
      <EnrollButton
        href={picker ? "#choose-your-state" : props.enrollHref}
        label={props.enrollLabel}
        className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg"
        course={picker ? null : cartCourse}
        mode="buy"
      />
      <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
        {props.browseLabel}
      </Link>
    </div>
  );
}

/** The per-state results + cross-sell section (only for grouped courses). */
async function ResultsIsland(props: LmsProps) {
  const { picker } = await lookup(props);
  return picker ? <StateResults picker={picker} /> : null;
}
