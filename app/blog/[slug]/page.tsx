import Link from "next/link";
import { notFound } from "next/navigation";
import BlogPortableText from "@/components/BlogPortableText";
import JsonLd from "@/components/JsonLd";
import { SITE_URL } from "@/lib/seo";
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
  if (!post) return { title: "Article — Train 321" };
  return {
    title: `${post.title} — Train 321`,
    description: post.excerpt || "",
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt || "",
      publishedTime: post.publishedAt,
      authors: post.author?.name ? [post.author.name] : undefined,
      // The cover image when the post has one. Declaring openGraph here
      // replaces the layout's file-convention image, so coverless posts must
      // name the branded card explicitly or they'd ship with no og:image.
      images: [{ url: post.coverImage || `${SITE_URL}/opengraph-image` }]
    }
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [post, allPosts, copy] = await Promise.all([
    getBlogPost(slug),
    getBlogPosts(),
    getDetailPagesCopy()
  ]);
  if (!post) notFound();

  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  const crumbJournal = copy?.blogCrumbJournal || "Journal";
  const shareLabel = copy?.blogShareLabel || "Share";
  const readingMinSuffix = copy?.blogReadingMinSuffix || "min read";
  const orgSuffix = copy?.blogAuthorOrgSuffix || "Train 321";

  const relatedEyebrow = copy?.blogRelatedHead?.eyebrow || "Keep reading";
  const relatedHeading = copy?.blogRelatedHead?.heading || "More in the journal";
  const relatedReadLabel = copy?.blogRelatedReadLabel || "Read article";

  const authorName = post.author?.name || orgSuffix;

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
    ...(post.coverImage ? { image: post.coverImage } : {}),
    author: {
      "@type": "Person",
      name: authorName,
      ...(post.author?.role ? { jobTitle: post.author.role } : {})
    },
    publisher: { "@id": `${SITE_URL}/#organization` },
    mainEntityOfPage: `${SITE_URL}/blog/${post.slug}`
  };

  return (
    <div className="t321-mkt-article">
      <JsonLd data={articleLd} />
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
              <strong>{formatDate(post.publishedAt)}</strong>
              <span>{post.readMinutes} {readingMinSuffix}</span>
            </div>
          </div>
        </div>
      </header>

      {post.coverImage && (
        <div className="t321-mkt-container">
          <figure className="t321-mkt-article__cover">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={post.coverImage} alt={post.coverImageAlt || ""} />
          </figure>
        </div>
      )}

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-article__body">
          <aside className="t321-mkt-article__share" aria-label={shareLabel}>
            <span>{shareLabel}</span>
            <a href={`/blog/${post.slug}`} aria-label="Copy link">
              <i className="fas fa-link" />
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}`}
              target="_blank"
              rel="noopener"
              aria-label="Share on Twitter"
            >
              <i className="fab fa-twitter" />
            </a>
            <a
              href="https://www.linkedin.com/sharing/share-offsite/"
              target="_blank"
              rel="noopener"
              aria-label="Share on LinkedIn"
            >
              <i className="fab fa-linkedin-in" />
            </a>
          </aside>

          <article className="t321-mkt-article__prose t321-mkt-prose">
            <BlogPortableText value={post.body} />

            <div className="t321-mkt-article__sign">
              <div className="t321-mkt-article__avatar t321-mkt-article__avatar--lg" aria-hidden="true">
                {initials(authorName)}
              </div>
              <div>
                <strong>{authorName}</strong>
                <span>{[post.author?.role, orgSuffix].filter(Boolean).join(" · ")}</span>
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
                      <img src={p.coverImage} alt={p.coverImageAlt || ""} />
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
