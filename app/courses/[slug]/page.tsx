import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourse, getCourses, getDetailPagesCopy, getSiteSettings } from "@/lib/sanity";
import EnrollButton from "@/components/EnrollButton";
import CourseCertificate from "@/components/CourseCertificate";
import StateCoursePicker from "@/components/StateCoursePicker";
import { getGroupPicker, resolveEnrollCourse } from "@/lib/enroll";
import "./course.css";

export async function generateStaticParams() {
  const courses = await getCourses();
  return courses.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const course = await getCourse(slug);
  if (!course) return { title: "Course · Train321" };
  return {
    title: `${course.title} · Train321`,
    description: course.summary || course.tagline || ""
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [course, copy, settings] = await Promise.all([getCourse(slug), getDetailPagesCopy(), getSiteSettings()]);
  if (!course) notFound();

  const enrollBase = settings.enrollBaseUrl || "http://new-features.train321.com/#/enroll";
  const enrollHref = course.enrollUrl
    || (course.enrollId ? `${enrollBase}?add=${course.enrollId}&checkout=1` : enrollBase);

  // State/regional versions come from ONE place: the LMS's course groups
  // (new-features tbl_course_group). When this course's enrollId belongs to
  // a group, the group's variants ARE the state picker — admins manage
  // states, prices, and external-state redirects in the LMS and this page
  // follows within its 5-minute revalidate. Ungrouped courses get no picker;
  // the Sanity stateVariants field is intentionally NOT consulted anymore.
  //
  // An explicit `enrollUrl` override still wins — that's an editor saying
  // "send buyers here".
  const [cartCourse, picker] = await Promise.all([
    course.enrollUrl ? Promise.resolve(null) : resolveEnrollCourse(course.enrollId),
    course.enrollUrl ? Promise.resolve(null) : getGroupPicker(course.enrollId)
  ]);

  // Grouped course → the page carries an inline "Choose your state" section
  // (StateCoursePicker) and every Enroll button becomes an anchor scrolling
  // to it. Ungrouped course → buttons act on the single course directly.
  const grouped = Boolean(picker);
  const ctaHref = grouped ? "#choose-your-state" : enrollHref;
  const ctaCourse = grouped ? null : cartCourse;

  // Chrome copy with fallbacks.
  const crumbHome = copy?.courseCrumbHome || "Home";
  const crumbCourses = copy?.courseCrumbCourses || "Courses";
  const enrollLabel = copy?.courseEnrollLabel || "Enroll now";
  const browseLabel = copy?.courseBrowseLabel || "Browse all courses";
  const getStartedLabel = copy?.courseGetStartedLabel || "Get started";
  const priceFromLabel = copy?.coursePriceFromLabel || "From";
  const priceUnitLabel = copy?.coursePriceUnitLabel || "per seat";
  const priceCustomAmt = copy?.coursePriceCustomAmt || "Custom";
  const priceCustomUnit = copy?.coursePriceCustomUnit || "pricing";
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

  return (
    <article className="t321-mkt-course">
      <section className="t321-mkt-course__hero">
        <div className="t321-mkt-container t321-mkt-course__hero-grid">
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
            <div className="t321-mkt-course__cta">
              <EnrollButton
                href={ctaHref}
                label={enrollLabel}
                className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg"
                course={ctaCourse}
                mode="buy"
              />
              <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
                {browseLabel}
              </Link>
            </div>
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

          <aside className="t321-mkt-course__hero-card" aria-label="Course summary">
            <div className={`t321-mkt-course__hero-card-head is-tone-${course.color || "accent"}`}>
              <i className={course.icon || "fas fa-book"} aria-hidden="true" />
            </div>
            <div className="t321-mkt-course__hero-card-body">
              {course.priceFrom != null ? (
                <div className="t321-mkt-course__price">
                  <span className="t321-mkt-course__price-from">{priceFromLabel}</span>
                  <span className="t321-mkt-course__price-amt">${course.priceFrom}</span>
                  <span className="t321-mkt-course__price-unit">{priceUnitLabel}</span>
                </div>
              ) : (
                <div className="t321-mkt-course__price t321-mkt-course__price--custom">
                  <span className="t321-mkt-course__price-amt">{priceCustomAmt}</span>
                  <span className="t321-mkt-course__price-unit">{priceCustomUnit}</span>
                </div>
              )}
              {course.priceNote && <p className="t321-mkt-course__price-note">{course.priceNote}</p>}
              {course.hero?.stats && (
                <ul className="t321-mkt-course__stats">
                  {course.hero.stats.map((s) => (
                    <li key={s.label}>
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              {/* The aside is the "considering it" spot, so this one adds to
                  the cart and opens the drawer rather than jumping to checkout. */}
              <EnrollButton
                href={ctaHref}
                label={grouped ? "Choose your state" : cartCourse ? "Add to cart" : getStartedLabel}
                className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block"
                course={ctaCourse}
                mode="add"
                showArrow={false}
              />
            </div>
          </aside>
        </div>
      </section>

      {picker && <StateCoursePicker picker={picker} />}

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

      {course.modules && (
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
              <CourseCertificate courseTitle={course.title} />
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
            <EnrollButton
              href={grouped ? "#choose-your-state" : ctaPrimaryHref}
              label={ctaPrimaryLabel}
              className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg"
              course={ctaCourse}
              mode="buy"
            />
            <Link href={ctaSecondaryHref} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              {ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
