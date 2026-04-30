"use client";

import Link from "next/link";
import { useTina } from "tinacms/dist/react";
import { TinaMarkdown, type Components } from "tinacms/dist/rich-text";
import type { LegalPageQuery, LegalPageQueryVariables } from "@/tina/__generated__/types";
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

// Walk a Tina rich-text AST extracting `h2` heading text. Tina represents
// inline runs as `{type: "text", text: "..."}` children of headings.
function extractHeadings(body: unknown): Array<{ id: string; text: string }> {
  const out: Array<{ id: string; text: string }> = [];
  if (!body || typeof body !== "object") return out;
  const root = body as { children?: unknown[] };
  for (const node of root.children || []) {
    if (!node || typeof node !== "object") continue;
    const n = node as { type?: string; children?: unknown[] };
    if (n.type === "h2") {
      const text = collectText(n.children || []);
      out.push({ id: slugify(text), text });
    }
  }
  return out;
}

function collectText(children: unknown[]): string {
  return children
    .map((c) => {
      if (!c || typeof c !== "object") return "";
      const n = c as { text?: string; children?: unknown[] };
      if (typeof n.text === "string") return n.text;
      if (Array.isArray(n.children)) return collectText(n.children);
      return "";
    })
    .join("");
}

const richTextComponents = {
  h2: (props: unknown) => {
    const children = (props as { children?: React.ReactNode })?.children;
    const text = collectText(
      Array.isArray(children) ? (children as unknown[]) : [children]
    );
    return <h2 id={slugify(text)}>{children}</h2>;
  }
} as unknown as Components<Record<string, unknown>>;

type Props = { data: LegalPageQuery; query: string; variables: LegalPageQueryVariables };

export default function LegalPageClient(props: Props) {
  const { data } = useTina(props);
  const page = data.legalPage;
  if (!page) return null;

  const headings = extractHeadings(page.body);

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
          {page.effectiveDate && (
            <p className="t321-mkt-legal__date">Effective {formatDate(page.effectiveDate)}</p>
          )}
          {page.intro && <p className="t321-mkt-lede">{page.intro}</p>}
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container t321-mkt-legal__body">
          {headings.length > 0 && (
            <aside className="t321-mkt-legal__toc" aria-label="On this page">
              <span className="t321-mkt-legal__toc-head">On this page</span>
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
            <TinaMarkdown content={page.body} components={richTextComponents} />
          </div>
        </div>
      </section>
    </article>
  );
}
