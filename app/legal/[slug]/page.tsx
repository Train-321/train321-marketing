import Link from "next/link";
import { notFound } from "next/navigation";
import { legalPages, legalList } from "@/assets/data/legal";
import "./legal.css";

type LegalBlock =
  | { type: "p"; content: string }
  | { type: "ul" | "ol"; content: string[] };

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

function renderBlock(block: LegalBlock, key: string) {
  switch (block.type) {
    case "ul":
      return (
        <ul key={key}>
          {block.content.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol key={key}>
          {block.content.map((it, idx) => (
            <li key={idx}>{it}</li>
          ))}
        </ol>
      );
    default:
      return <p key={key}>{block.content}</p>;
  }
}

export function generateStaticParams() {
  return legalList.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = legalPages[slug as keyof typeof legalPages];
  if (!page) return { title: "Legal — Train321" };
  return {
    title: `${page.title} — Train321`,
    description: page.intro || ""
  };
}

export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = legalPages[slug as keyof typeof legalPages];
  if (!page) notFound();

  return (
    <article className="t321-mkt-legal">
      <section className="t321-mkt-legal__hero">
        <div className="t321-mkt-container">
          <div className="t321-mkt-legal__crumbs">
            <Link href="/">Home</Link>
            <i className="fas fa-angle-right" aria-hidden="true" />
            <span>{page.title}</span>
          </div>
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-file-alt" aria-hidden="true" /> Policy
          </span>
          <h1 className="t321-mkt-h1">{page.title}</h1>
          <p className="t321-mkt-legal__date">Effective {formatDate(page.effectiveDate)}</p>
          {page.intro && <p className="t321-mkt-lede">{page.intro}</p>}
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-legal__body">
          <aside className="t321-mkt-legal__toc" aria-label="On this page">
            <span className="t321-mkt-legal__toc-head">On this page</span>
            <ol>
              {page.sections.map((s, i) => (
                <li key={i}>
                  <a href={`#section-${i}`}>{s.heading}</a>
                </li>
              ))}
            </ol>
          </aside>

          <div className="t321-mkt-prose t321-mkt-legal__prose">
            {page.sections.map((s, i) => (
              <section key={i} id={`section-${i}`} className="t321-mkt-legal__section">
                <h2>{s.heading}</h2>
                {(s.blocks as LegalBlock[]).map((b, bi) => renderBlock(b, `${b.type}-${bi}`))}
              </section>
            ))}
          </div>
        </div>
      </section>
    </article>
  );
}
