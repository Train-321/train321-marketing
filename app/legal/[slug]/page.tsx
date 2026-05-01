import Link from "next/link";
import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { getLegalPage, getLegalPages, getDetailPagesCopy } from "@/lib/sanity";
import "./legal.css";

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Pull out h2 headings ("## Heading") for the on-page TOC.
function extractHeadings(body: string): Array<{ id: string; text: string }> {
  const lines = body.split(/\r?\n/);
  const out: Array<{ id: string; text: string }> = [];
  for (const line of lines) {
    const m = /^##\s+(.+?)\s*$/.exec(line);
    if (m) {
      const text = m[1].trim();
      out.push({ id: slugify(text), text });
    }
  }
  return out;
}

export async function generateStaticParams() {
  const pages = await getLegalPages();
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await getLegalPage(slug);
  if (!page) return { title: "Legal — Train321" };
  return {
    title: `${page.title} — Train321`,
    description: page.intro || ""
  };
}

export default async function LegalPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [page, copy] = await Promise.all([getLegalPage(slug), getDetailPagesCopy()]);
  if (!page) notFound();

  const headings = extractHeadings(page.body);
  const homeLabel = copy?.legalCrumbHome || "Home";
  const eyebrowLabel = copy?.legalEyebrow || "Policy";
  const effectivePrefix = copy?.legalEffectivePrefix || "Effective";
  const tocLabel = copy?.legalTocLabel || "On this page";

  return (
    <article className="t321-mkt-legal">
      <section className="t321-mkt-legal__hero">
        <div className="t321-mkt-container">
          <div className="t321-mkt-legal__crumbs">
            <Link href="/">{homeLabel}</Link>
            <i className="fas fa-angle-right" aria-hidden="true" />
            <span>{page.title}</span>
          </div>
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-file-alt" aria-hidden="true" /> {eyebrowLabel}
          </span>
          <h1 className="t321-mkt-h1">{page.title}</h1>
          {page.effectiveDate && (
            <p className="t321-mkt-legal__date">{effectivePrefix} {formatDate(page.effectiveDate)}</p>
          )}
          {page.intro && <p className="t321-mkt-lede">{page.intro}</p>}
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-legal__body">
          {headings.length > 0 && (
            <aside className="t321-mkt-legal__toc" aria-label={tocLabel}>
              <span className="t321-mkt-legal__toc-head">{tocLabel}</span>
              <ol>
                {headings.map((h) => (
                  <li key={h.id}>
                    <a href={`#${h.id}`}>{h.text}</a>
                  </li>
                ))}
              </ol>
            </aside>
          )}

          <div className="t321-mkt-prose t321-mkt-legal__prose">
            <ReactMarkdown
              components={{
                h2: ({ children, ...props }) => {
                  const text = String(children);
                  return (
                    <h2 id={slugify(text)} {...props}>
                      {children}
                    </h2>
                  );
                }
              }}
            >
              {page.body}
            </ReactMarkdown>
          </div>
        </div>
      </section>
    </article>
  );
}
