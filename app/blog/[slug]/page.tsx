import Link from "next/link";
import { notFound } from "next/navigation";
import BlogPortableText from "@/components/BlogPortableText";
import JsonLd from "@/components/JsonLd";
import ShareBar from "@/components/ShareBar";
import { SITE_URL, fitTitle, breadcrumbLd } from "@/lib/seo";
import { getBlogPost, getBlogPosts, getDetailPagesCopy } from "@/lib/sanity";
import "./article.css";

function initials(name: string) {
  return (name || "")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

// Re-render on a short window so a post deleted or unpublished in Studio stops
// serving its public URL (it falls through to notFound below).
export const revalidate = 60;

export async function generateStaticParams() {
  const posts = await getBlogPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Article" };
  // The post's SEO tab wins; the headline and subhead are the fallback.
  const seoTitle = post.seo?.metaTitle?.trim() || post.title;
  const description = post.seo?.metaDescription?.trim() || post.excerpt || "";
  return {
    // Headlines run 50–70 chars; a long one goes out without " — Train 321"
    // rather than losing its last words to the brand.
    title: fitTitle(seoTitle),
    description,
    alternates: { canonical: `/blog/${slug}` },
    ...(post.seo?.noIndex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      type: "article",
      title: seoTitle,
      description,
      publishedTime: post.publishedAt,
      ...(post.revisedAt ? { modifiedTime: post.revisedAt } : {}),
      authors: post.author?.name ? [post.author.name] : undefined,
      // The share image, else the cover. Declaring openGraph here replaces
      // the layout's file-convention image, so coverless posts must name the
      // branded card explicitly or they'd ship with no og:image.
      images: [{ url: post.seo?.ogImage || post.coverImage || `${SITE_URL}/opengraph-image` }]
    }
  };
}

type CourseLink = { slug: string; label: string; audience: string; blurb: string };

const COURSES: Record<string, CourseLink> = {
  "food-handler": { slug: "food-handler", label: "Food Handler Card", audience: "For food workers", blurb: "The food safety basics every food service worker needs, from hygiene and safe temperatures to allergens. Your certificate is ready as soon as you pass." },
  "food-manager": { slug: "food-manager", label: "Food Manager Certification", audience: "For managers", blurb: "Videos, study material and a 300-question practice test, then a proctored, ANAB-accredited exam valid for five years." },
  rbs: { slug: "rbs", label: "California RBS Training", audience: "California servers", blurb: "Required Responsible Beverage Service training from an approved provider. We report your completion to ABC within 24 hours." },
  tabc: { slug: "tabc", label: "TABC Seller-Server", audience: "Texas servers", blurb: "The Texas seller-server certification course, online." },
  alcohol: { slug: "alcohol", label: "Alcohol Safety", audience: "Other states", blurb: "Spot fake IDs, recognize intoxication and refuse a sale the right way." },
  "california-sexual-harassment": { slug: "california-sexual-harassment", label: "California Sexual Harassment Training", audience: "California employers", blurb: "One-hour employee and two-hour supervisor courses for California's harassment prevention requirement." },
  "human-trafficking": { slug: "human-trafficking", label: "Human Trafficking Awareness", audience: "Hospitality teams", blurb: "Hospitality-focused training on recognizing and reporting human trafficking." }
};

/**
 * The courses an article should hand readers to, picked from its title and
 * category; first match wins. Articles were shipping with zero links to a
 * course page, so the pages earning the traffic passed none of it on.
 * General food safety posts get both food courses, labelled by audience, so
 * employees and managers each land on the course meant for them.
 */
const COURSE_RULES: Array<{ test: RegExp; slugs: string[] }> = [
  { test: /\brbs\b|responsible beverage/i, slugs: ["rbs"] },
  { test: /tabc|seller.server/i, slugs: ["tabc"] },
  { test: /intoxica|alcohol/i, slugs: ["rbs", "tabc", "alcohol"] },
  { test: /food manager|manager certification|manager exam/i, slugs: ["food-manager"] },
  { test: /harassment|sb ?1343/i, slugs: ["california-sexual-harassment"] },
  { test: /traffick/i, slugs: ["human-trafficking"] },
  { test: /food|contamin|kitchen|allergen|temperature|hygiene|defense|fda/i, slugs: ["food-handler", "food-manager"] }
];

function coursesFor(post: { title: string; category?: string }): CourseLink[] {
  const hay = `${post.title} ${post.category || ""}`;
  return COURSE_RULES.find((r) => r.test.test(hay))?.slugs.map((s) => COURSES[s]) || [];
}

/**
 * "Keep reading" picks: posts in the same category first, then the newest of
 * the rest. Newest-only sent a food safety reader to the CEO note.
 */
function relatedPosts<T extends { slug: string; category?: string }>(post: T, all: T[], n = 3): T[] {
  const others = all.filter((p) => p.slug !== post.slug);
  const same = others.filter((p) => post.category && p.category === post.category);
  return [...same, ...others.filter((p) => !same.includes(p))].slice(0, n);
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts, copy] = await Promise.all([
    getBlogPost(slug),
    getBlogPosts(),
    getDetailPagesCopy()
  ]);
  if (!post) notFound();

  const related = relatedPosts(post, allPosts);

  const crumbJournal = copy?.blogCrumbJournal || "Journal";
  const shareLabel = copy?.blogShareLabel || "Share";
  const readingMinSuffix = copy?.blogReadingMinSuffix || "min read";
  const orgSuffix = copy?.blogAuthorOrgSuffix || "Train 321";

  const relatedEyebrow = copy?.blogRelatedHead?.eyebrow || "Keep reading";
  const relatedHeading = copy?.blogRelatedHead?.heading || "More in the journal";
  const relatedReadLabel = copy?.blogRelatedReadLabel || "Read article";

  const authorName = post.author?.name || orgSuffix;
  const courseLinks = coursesFor(post);
  // Only an editor-set "Last updated" shows; _updatedAt moves on every typo
  // fix and bulk edit, which would stamp old posts as freshly revised.
  const revised = post.revisedAt && post.revisedAt.slice(0, 10) > (post.publishedAt || "").slice(0, 10)
    ? post.revisedAt
    : null;

  const cta = copy?.blogBottomCta;
  const ctaHeading = cta?.heading || "Ready to see the platform?";
  const ctaLede =
    cta?.lede ||
    "Book a 20-minute walkthrough with a real human. No slides, no pressure.";
  const ctaPrimaryLabel = cta?.primaryCta?.label || "Book a demo";
  const ctaPrimaryHref = cta?.primaryCta?.to || "/demo";
  const ctaSecondaryLabel = cta?.secondaryCta?.label || "Browse courses";
  const ctaSecondaryHref = cta?.secondaryCta?.to || "/catalog";

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.excerpt || "",
    url: `${SITE_URL}/blog/${post.slug}`,
    datePublished: post.publishedAt,
    ...(revised || post.updatedAt ? { dateModified: revised || post.updatedAt } : {}),
    ...(post.coverImage ? { image: post.coverImage } : {}),
    // A post with no named author is the company's, not a person called
    // "Train 321".
    author: post.author?.name
      ? {
          "@type": "Person",
          name: post.author.name,
          ...(post.author.role ? { jobTitle: post.author.role } : {}),
          ...(post.author.bio ? { description: post.author.bio } : {}),
          worksFor: { "@id": `${SITE_URL}/#organization` }
        }
      : { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`,
    ...(post.category ? { articleSection: post.category } : {}),
    ...(courseLinks.length
      ? {
          about: courseLinks.map((c) => ({ "@type": "Course", name: c.label, url: `${SITE_URL}/courses/${c.slug}` }))
        }
      : {})
  };

  // Same trail as the crumbs rendered below; the category is a label there,
  // not a page, so it is left out.
  const crumbsLd = breadcrumbLd([
    { name: "Home", path: "/" },
    { name: crumbJournal, path: "/blog" },
    { name: post.title, path: `/blog/${post.slug}` }
  ]);

  return (
    <div className="t321-mkt-article">
      <JsonLd data={articleLd} />
      <JsonLd data={crumbsLd} />
      <header className={`t321-mkt-article__hero is-tone-${post.heroTone}`}>
        <div className="t321-mkt-container">
          <nav className="t321-mkt-article__crumbs" aria-label="Breadcrumb">
            <Link href="/blog">{crumbJournal}</Link>
            <span aria-hidden="true">/</span>
            <span>{post.category}</span>
          </nav>
          <span className="t321-mkt-eyebrow">
            <i className={post.heroIcon} aria-hidden="true" />
            {post.category}
          </span>
          <h1 className="t321-mkt-h1">{post.title}</h1>
          <p className="t321-mkt-lede">{post.excerpt}</p>
          <div className="t321-mkt-article__meta">
            <div className="t321-mkt-article__avatar" aria-hidden="true">{initials(authorName)}</div>
            <div className="t321-mkt-article__author">
              <strong>{authorName}</strong>
              <span>{post.author?.role}</span>
            </div>
            <div className="t321-mkt-article__dot" aria-hidden="true" />
            <div className="t321-mkt-article__dates">
              <strong>
                <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
              </strong>
              <span>
                {[
                  revised && (
                    <span key="u">
                      Updated <time dateTime={revised}>{formatDate(revised)}</time>
                    </span>
                  ),
                  post.readMinutes && <span key="r">{post.readMinutes} {readingMinSuffix}</span>
                ]
                  .filter(Boolean)
                  .flatMap((el, i) => (i ? [" · ", el] : [el]))}
              </span>
            </div>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="t321-mkt-container">
          <figure className="t321-mkt-article__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.coverImageAlt || post.title} />
          </figure>
        </div>
      )}

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-article__body">
          <ShareBar
            url={`${SITE_URL}/blog/${post.slug}`}
            title={post.title}
            summary={post.excerpt}
            label={shareLabel}
          />

          <article className="t321-mkt-article__prose t321-mkt-prose">
            <BlogPortableText value={post.body} />

            {courseLinks.length > 0 && (
              <aside
                className={`t321-mkt-article__course${courseLinks.length > 1 ? " is-multi" : ""}`}
                aria-label={courseLinks.length > 1 ? "Related courses" : "Related course"}
              >
                <span className="t321-mkt-eyebrow">{courseLinks.length > 1 ? "Related courses" : "Related course"}</span>
                <div className="t321-mkt-article__course-list">
                  {courseLinks.map((c) => (
                    <div key={c.slug} className="t321-mkt-article__course-item">
                      {courseLinks.length > 1 && <span className="t321-mkt-article__course-aud">{c.audience}</span>}
                      <h2>{c.label}</h2>
                      <p>{c.blurb}</p>
                      <Link href={`/courses/${c.slug}`} className="t321-mkt-btn t321-mkt-btn--accent">
                        See the course
                      </Link>
                    </div>
                  ))}
                </div>
              </aside>
            )}

            <div className="t321-mkt-article__sign">
              <div className="t321-mkt-article__avatar t321-mkt-article__avatar--lg" aria-hidden="true">
                {initials(authorName)}
              </div>
              <div>
                <strong>{authorName}</strong>
                <span>{[post.author?.role, orgSuffix].filter(Boolean).join(" · ")}</span>
                {post.author?.bio && <p className="t321-mkt-article__bio">{post.author.bio}</p>}
              </div>
            </div>
          </article>
        </div>
      </section>

      {related.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">{relatedEyebrow}</span>
              <h2 className="t321-mkt-h2">{relatedHeading}</h2>
            </div>
            <div className="t321-mkt-article__related">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/blog/${p.slug}`}
                  className="t321-mkt-card t321-mkt-card--hover t321-mkt-article__related-card"
                >
                  <div className={`t321-mkt-article__related-art is-tone-${p.heroTone}`}>
                    {p.coverImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.coverImage} alt={p.coverImageAlt || p.title} loading="lazy" />
                    ) : (
                      <i className={p.heroIcon} aria-hidden="true" />
                    )}
                  </div>
                  <span className="t321-mkt-eyebrow">{p.category}</span>
                  <h3 className="t321-mkt-h3">{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <span className="t321-mkt-article__related-link">
                    {relatedReadLabel} <i className="fas fa-arrow-right" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="t321-mkt-section t321-mkt-section--ink">
        <div className="t321-mkt-container t321-mkt-article__cta">
          <div>
            <h2 className="t321-mkt-h2">{ctaHeading}</h2>
            <p className="t321-mkt-lede">{ctaLede}</p>
          </div>
          <div className="t321-mkt-article__cta-actions">
            <Link href={ctaPrimaryHref} className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              {ctaPrimaryLabel}
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href={ctaSecondaryHref} className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              {ctaSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
