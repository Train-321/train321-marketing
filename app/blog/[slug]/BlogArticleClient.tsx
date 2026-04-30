"use client";

import Link from "next/link";
import { useTina } from "tinacms/dist/react";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import type {
  BlogPostQuery,
  BlogPostQueryVariables,
  BlogPostConnectionQuery
} from "@/tina/__generated__/types";
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

type RelatedPost = NonNullable<
  NonNullable<
    NonNullable<BlogPostConnectionQuery["blogPostConnection"]["edges"]>[number]
  >["node"]
>;

type Props = {
  data: BlogPostQuery;
  query: string;
  variables: BlogPostQueryVariables;
  related: RelatedPost[];
};

// Custom rich-text component overrides — promote any blockquote that
// starts with the 💡 emoji into a styled callout.
const richTextComponents = {
  blockquote: (props: unknown) => {
    const children = (props as { children?: React.ReactNode })?.children;
    const text = (() => {
      if (typeof children === "string") return children.trim();
      if (Array.isArray(children)) return children.map((c) => (typeof c === "string" ? c : "")).join(" ").trim();
      return "";
    })();
    if (text.startsWith("💡")) {
      return (
        <aside className="t321-mkt-article__callout">
          {text.replace(/^💡\s*/, "")}
        </aside>
      );
    }
    return <blockquote>{children}</blockquote>;
  }
} as unknown as Components<Record<string, unknown>>;

export default function BlogArticleClient(props: Props) {
  const { data } = useTina({
    data: props.data,
    query: props.query,
    variables: props.variables
  });
  const post = data.blogPost;
  if (!post) return null;
  const slug = post._sys.filename;

  return (
    <div className="t321-mkt-article">
      <header className={`t321-mkt-article__hero is-tone-${post.heroTone}`}>
        <div className="t321-mkt-container">
          <nav className="t321-mkt-article__crumbs" aria-label="Breadcrumb">
            <Link href="/blog">Journal</Link>
            <span aria-hidden="true">/</span>
            <span>{post.category}</span>
          </nav>
          <span className="t321-mkt-eyebrow">
            <i className={post.heroIcon || ""} aria-hidden="true" />
            {post.category}
          </span>
          <h1 className="t321-mkt-h1">{post.title}</h1>
          <p className="t321-mkt-lede">{post.excerpt}</p>
          <div className="t321-mkt-article__meta">
            <div className="t321-mkt-article__avatar" aria-hidden="true">
              {initials(post.author?.name || "")}
            </div>
            <div className="t321-mkt-article__author">
              <strong>{post.author?.name}</strong>
              <span>{post.author?.role}</span>
            </div>
            <div className="t321-mkt-article__dot" aria-hidden="true" />
            <div className="t321-mkt-article__dates">
              <strong>{formatDate(post.publishedAt)}</strong>
              <span>{post.readMinutes} min read</span>
            </div>
          </div>
        </div>
      </header>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-article__body">
          <aside className="t321-mkt-article__share" aria-label="Share">
            <span>Share</span>
            <a href={`/blog/${slug}`} aria-label="Copy link">
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
            <TinaMarkdown content={post.body} components={richTextComponents} />

            <div className="t321-mkt-article__sign">
              <div className="t321-mkt-article__avatar t321-mkt-article__avatar--lg" aria-hidden="true">
                {initials(post.author?.name || "")}
              </div>
              <div>
                <strong>{post.author?.name}</strong>
                <span>{post.author?.role} · Train321</span>
              </div>
            </div>
          </article>
        </div>
      </section>

      {props.related.length > 0 && (
        <section className="t321-mkt-section t321-mkt-section--sunk">
          <div className="t321-mkt-container">
            <div className="t321-mkt-section__head">
              <span className="t321-mkt-eyebrow">Keep reading</span>
              <h2 className="t321-mkt-h2">More in the journal</h2>
            </div>
            <div className="t321-mkt-article__related">
              {props.related.map((p) => (
                <Link
                  key={p._sys.filename}
                  href={`/blog/${p._sys.filename}`}
                  className="t321-mkt-card t321-mkt-card--hover t321-mkt-article__related-card"
                >
                  <div className={`t321-mkt-article__related-art is-tone-${p.heroTone}`}>
                    <i className={p.heroIcon || ""} aria-hidden="true" />
                  </div>
                  <span className="t321-mkt-eyebrow">{p.category}</span>
                  <h3 className="t321-mkt-h3">{p.title}</h3>
                  <p>{p.excerpt}</p>
                  <span className="t321-mkt-article__related-link">
                    Read article <i className="fas fa-arrow-right" />
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
            <h2 className="t321-mkt-h2">Ready to see the platform?</h2>
            <p className="t321-mkt-lede">
              Book a 20-minute walkthrough with a real human. No slides, no pressure.
            </p>
          </div>
          <div className="t321-mkt-article__cta-actions">
            <Link href="/demo" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Book a demo
              <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              Browse courses
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
