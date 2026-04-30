"use client";

import Link from "next/link";
import { useTina } from "tinacms/dist/react";
import type { CourseQuery, CourseQueryVariables } from "@/tina/__generated__/types";
import "./course.css";

type Props = { data: CourseQuery; query: string; variables: CourseQueryVariables };

export default function CoursePageClient(props: Props) {
  const { data } = useTina(props);
  const course = data.course;
  if (!course) return null;

  const slug = course._sys.filename;
  const enrollHref = course.enrollId ? `/enroll?add=${course.enrollId}&checkout=1` : "/enroll";
  const accreditations = (course.accreditations || []).filter((a): a is string => Boolean(a));
  const outcomes = (course.outcomes || []).filter((o): o is string => Boolean(o));
  const modules = (course.modules || []).filter((m): m is NonNullable<typeof m> => Boolean(m));
  const heroStats = (course.hero?.stats || []).filter((s): s is NonNullable<typeof s> => Boolean(s));
  const faqs = (course.faqs || []).filter((f): f is NonNullable<typeof f> => Boolean(f));

  return (
    <article className="t321-mkt-course" data-slug={slug}>
      <section className="t321-mkt-course__hero">
        <div className="t321-mkt-container t321-mkt-course__hero-grid">
          <div className="t321-mkt-course__hero-body">
            <div className="t321-mkt-course__crumbs">
              <Link href="/">Home</Link>
              <i className="fas fa-angle-right" aria-hidden="true" />
              <Link href="/catalog">Courses</Link>
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
              <Link href={enrollHref} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
                Enroll now
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
                Browse all courses
              </Link>
            </div>
            {accreditations.length > 0 && (
              <ul className="t321-mkt-course__accred">
                {accreditations.map((a) => (
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
                  <span className="t321-mkt-course__price-from">From</span>
                  <span className="t321-mkt-course__price-amt">${course.priceFrom}</span>
                  <span className="t321-mkt-course__price-unit">per seat</span>
                </div>
              ) : (
                <div className="t321-mkt-course__price t321-mkt-course__price--custom">
                  <span className="t321-mkt-course__price-amt">Custom</span>
                  <span className="t321-mkt-course__price-unit">pricing</span>
                </div>
              )}
              {course.priceNote && <p className="t321-mkt-course__price-note">{course.priceNote}</p>}
              {heroStats.length > 0 && (
                <ul className="t321-mkt-course__stats">
                  {heroStats.map((s) => (
                    <li key={s.label}>
                      <strong>{s.value}</strong>
                      <span>{s.label}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={enrollHref} className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--block">
                Get started
                <i className="fas fa-arrow-right" aria-hidden="true" />
              </Link>
              <p className="t321-mkt-course__card-foot">
                <i className="fas fa-shield-alt" aria-hidden="true" />
                60-day money-back guarantee on unused seats
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-course__two">
          <div>
            <span className="t321-mkt-eyebrow">Course overview</span>
            <h2 className="t321-mkt-h2">What you&apos;ll get</h2>
            <p className="t321-mkt-course__summary">{course.summary}</p>
          </div>
          {outcomes.length > 0 && (
            <div className="t321-mkt-course__outcomes">
              <h3 className="t321-mkt-h3">By the end, you&apos;ll be able to</h3>
              <ul>
                {outcomes.map((o, i) => (
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

      {modules.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">Curriculum</span>
              <h2 className="t321-mkt-h2">Inside the course</h2>
              <p className="t321-mkt-lede">
                {modules.length} modules — self-paced, with progress that saves automatically.
              </p>
            </div>
            <ol className="t321-mkt-course__modules">
              {modules.map((m, i) => (
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
            <div className="t321-mkt-course__cert-visual" aria-hidden="true">
              <div className="t321-mkt-course__cert-card">
                <span className="t321-mkt-course__cert-head">Certificate of Completion</span>
                <span className="t321-mkt-course__cert-name">{course.title}</span>
                <span className="t321-mkt-course__cert-seal"><i className="fas fa-medal" /></span>
                <span className="t321-mkt-course__cert-meta">Train321 · ANSI-accredited</span>
              </div>
            </div>
            <div>
              <span className="t321-mkt-eyebrow">Your certificate</span>
              <h2 className="t321-mkt-h2">Official, instant, accepted</h2>
              <dl className="t321-mkt-course__cert-dl">
                <div><dt>Delivery</dt><dd>{course.certificate.delivery}</dd></div>
                <div><dt>Validity</dt><dd>{course.certificate.validity}</dd></div>
                <div><dt>Accepted by</dt><dd>{course.certificate.accepted}</dd></div>
              </dl>
            </div>
          </div>
        </section>
      )}

      {faqs.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container t321-mkt-course__faqs">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">FAQ</span>
              <h2 className="t321-mkt-h2">Common questions</h2>
            </div>
            {faqs.map((f, i) => (
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
            <h2 className="t321-mkt-h2">Ready to get your team certified?</h2>
            <p className="t321-mkt-lede">
              Buy seats in under a minute. Invite learners by email or CSV. Track completion from a single dashboard.
            </p>
          </div>
          <div className="t321-mkt-course__cta-band-actions">
            <Link href={enrollHref} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Enroll now
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href="/demo" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              See a demo
            </Link>
          </div>
        </div>
      </section>
    </article>
  );
}
