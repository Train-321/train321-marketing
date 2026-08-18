import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceDetail, getServiceSlugs, type ServiceBlock } from "@/lib/sanity";
import "./service.css";

/**
 * Service detail page — deliberately NOT the course template.
 *
 * Services (custom course development, white labeling, licensing) have no
 * enrollment, price, module count, curriculum or certificate. Those pages used
 * to be course documents and so inherited all of that furniture; this template
 * renders service sections only, and every section is optional — anything the
 * editor leaves blank simply doesn't appear.
 */

export const revalidate = 300;

export async function generateStaticParams() {
  const slugs = await getServiceSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = await getServiceDetail(slug);
  if (!service) return { title: "Services — Train 321" };
  return {
    title: service.seo?.title || `${service.title} — Train 321`,
    description: service.seo?.description || service.lede || ""
  };
}

/** Portable-text blocks → plain paragraphs. Services use prose, not rich
    layout, so this avoids a renderer dependency for a handful of blocks. */
function blocksToParagraphs(blocks?: ServiceBlock[]): string[] {
  if (!blocks?.length) return [];
  return blocks
    .map((b) => (b.children || []).map((c) => c.text || "").join(""))
    .map((t) => t.trim())
    .filter(Boolean);
}

export default async function ServiceDetailPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = await getServiceDetail(slug);
  if (!service) notFound();

  const heading = service.heading || service.title;
  const overview = blocksToParagraphs(service.overview);
  const cta = service.finalCta;

  return (
    <article className="t321-mkt-service">
      {/* Breadcrumb says Services — not Courses. */}
      <section className="t321-mkt-service__hero">
        <div className="t321-mkt-container">
          <div className="t321-mkt-service__crumbs">
            <Link href="/">Home</Link>
            <i className="fas fa-angle-right" aria-hidden="true" />
            <Link href="/services">Services</Link>
            <i className="fas fa-angle-right" aria-hidden="true" />
            <span>{service.title}</span>
          </div>

          <div className="t321-mkt-service__hero-grid">
            <div>
              {service.eyebrow && (
                <span className="t321-mkt-eyebrow">
                  <i className={service.icon || "fas fa-briefcase"} aria-hidden="true" /> {service.eyebrow}
                </span>
              )}
              <h1 className="t321-mkt-h1">{heading}</h1>
              {service.lede && <p className="t321-mkt-lede">{service.lede}</p>}

              {(service.primaryCta?.label || service.secondaryCta?.label) && (
                <div className="t321-mkt-service__cta">
                  {service.primaryCta?.label && service.primaryCta.to && (
                    <Link
                      href={service.primaryCta.to}
                      className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg"
                    >
                      {service.primaryCta.label}
                      <i className="fas fa-arrow-right" aria-hidden="true" />
                    </Link>
                  )}
                  {service.secondaryCta?.label && service.secondaryCta.to && (
                    <Link
                      href={service.secondaryCta.to}
                      className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg"
                    >
                      {service.secondaryCta.label}
                    </Link>
                  )}
                </div>
              )}
            </div>

            {service.imageUrl && (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img className="t321-mkt-service__hero-img" src={service.imageUrl} alt="" />
            )}
          </div>
        </div>
      </section>

      {(overview.length > 0 || service.features?.length) && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container t321-mkt-service__overview">
            {service.overviewHeading && (
              <h2 className="t321-mkt-h2">{service.overviewHeading}</h2>
            )}
            <div className="t321-mkt-service__prose">
              {overview.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            {service.features && service.features.length > 0 && (
              <ul className="t321-mkt-service__features">
                {service.features.map((f, i) => (
                  <li key={i}>
                    <i className="fas fa-check" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {service.benefits && service.benefits.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            {service.benefitsHeading && (
              <div className="t321-mkt-section__head">
                <h2 className="t321-mkt-h2">{service.benefitsHeading}</h2>
              </div>
            )}
            <div className="t321-mkt-service__grid">
              {service.benefits.map((b, i) => (
                <div key={i} className="t321-mkt-service__card t321-mkt-card">
                  <span className="t321-mkt-service__card-icon">
                    <i className={b.icon || "fas fa-circle-check"} aria-hidden="true" />
                  </span>
                  {b.title && <h3 className="t321-mkt-h3">{b.title}</h3>}
                  {b.body && <p>{b.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.capabilities && service.capabilities.length > 0 && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container">
            {service.capabilitiesHeading && (
              <div className="t321-mkt-section__head">
                <h2 className="t321-mkt-h2">{service.capabilitiesHeading}</h2>
              </div>
            )}
            <div className="t321-mkt-service__grid">
              {service.capabilities.map((c, i) => (
                <div key={i} className="t321-mkt-service__card t321-mkt-card">
                  <span className="t321-mkt-service__card-icon">
                    <i className={c.icon || "fas fa-wand-magic-sparkles"} aria-hidden="true" />
                  </span>
                  {c.title && <h3 className="t321-mkt-h3">{c.title}</h3>}
                  {c.body && <p>{c.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.process && service.process.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            {service.processHeading && (
              <div className="t321-mkt-section__head">
                <h2 className="t321-mkt-h2">{service.processHeading}</h2>
              </div>
            )}
            <ol className="t321-mkt-service__steps">
              {service.process.map((s, i) => (
                <li key={i}>
                  <span className="t321-mkt-service__step-num">{i + 1}</span>
                  <div>
                    {s.title && <strong>{s.title}</strong>}
                    {s.body && <p>{s.body}</p>}
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      {service.deliveryOptions && service.deliveryOptions.length > 0 && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container">
            {service.deliveryHeading && (
              <div className="t321-mkt-section__head">
                <h2 className="t321-mkt-h2">{service.deliveryHeading}</h2>
              </div>
            )}
            <div className="t321-mkt-service__grid">
              {service.deliveryOptions.map((d, i) => (
                <div key={i} className="t321-mkt-service__card t321-mkt-card">
                  <span className="t321-mkt-service__card-icon">
                    <i className={d.icon || "fas fa-server"} aria-hidden="true" />
                  </span>
                  {d.title && <h3 className="t321-mkt-h3">{d.title}</h3>}
                  {d.body && <p>{d.body}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {service.examples && service.examples.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            {service.examplesHeading && (
              <div className="t321-mkt-section__head">
                <h2 className="t321-mkt-h2">{service.examplesHeading}</h2>
              </div>
            )}
            <div className="t321-mkt-service__grid">
              {service.examples.map((e, i) => {
                const inner = (
                  <>
                    {e.imageUrl && (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img className="t321-mkt-service__example-img" src={e.imageUrl} alt="" />
                    )}
                    <div className="t321-mkt-service__example-body">
                      {e.title && <h3 className="t321-mkt-h3">{e.title}</h3>}
                      {e.body && <p>{e.body}</p>}
                    </div>
                  </>
                );
                return e.to ? (
                  <Link
                    key={i}
                    href={e.to}
                    className="t321-mkt-service__example t321-mkt-card t321-mkt-card--hover"
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={i} className="t321-mkt-service__example t321-mkt-card">
                    {inner}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {service.faqs && service.faqs.length > 0 && (
        <section className="t321-mkt-section">
          <div className="t321-mkt-container t321-mkt-service__faq">
            {service.faqHeading && (
              <div className="t321-mkt-section__head">
                <h2 className="t321-mkt-h2">{service.faqHeading}</h2>
              </div>
            )}
            {service.faqs.map((f, i) => (
              <details key={i} className="t321-mkt-service__faq-item">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </section>
      )}

      {(cta?.heading || cta?.primaryLabel) && (
        <section className="t321-mkt-section t321-mkt-section--ink">
          <div className="t321-mkt-container t321-mkt-service__final">
            {cta.heading && <h2 className="t321-mkt-h2">{cta.heading}</h2>}
            {cta.lede && <p className="t321-mkt-lede">{cta.lede}</p>}
            <div className="t321-mkt-service__cta">
              {cta.primaryLabel && cta.primaryTo && (
                <Link href={cta.primaryTo} className="t321-mkt-btn t321-mkt-btn--primary t321-mkt-btn--lg">
                  {cta.primaryLabel}
                  <i className="fas fa-arrow-right" aria-hidden="true" />
                </Link>
              )}
              {cta.secondaryLabel && cta.secondaryTo && (
                <Link href={cta.secondaryTo} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
                  {cta.secondaryLabel}
                </Link>
              )}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
