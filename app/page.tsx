import Link from "next/link";

// Placeholder home page — kept here while individual pages port over from Nuxt.
// Once pages/index.tsx with the real hero animation lands, this file becomes that.

const PORT_STATUS = [
  { name: "Header / Footer / global styles", status: "done" },
  { name: "About", status: "pending" },
  { name: "Contact", status: "pending" },
  { name: "FAQ", status: "pending" },
  { name: "Testimonials", status: "pending" },
  { name: "Demo", status: "pending" },
  { name: "Services", status: "pending" },
  { name: "Catalog", status: "pending" },
  { name: "Course detail (/courses/[slug])", status: "pending" },
  { name: "Blog index + article", status: "pending" },
  { name: "Legal pages (/legal/[slug])", status: "pending" },
  { name: "Home (with hero animation)", status: "pending" },
  { name: "Individuals", status: "pending" },
  { name: "TinaCMS schemas + backend", status: "pending" },
  { name: "Visual editing wired per page", status: "pending" },
  { name: "Sanity teardown", status: "pending" }
];

export default function HomePage() {
  return (
    <div>
      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <span className="t321-mkt-eyebrow">
            <i className="fas fa-bolt" aria-hidden="true" /> Train321 — Next.js + TinaCMS rebuild
          </span>
          <h1 className="t321-mkt-h1">
            Compliance training your team <em>actually finishes.</em>
          </h1>
          <p className="t321-mkt-lede">
            The marketing site is being migrated from Nuxt + Sanity to Next.js + TinaCMS. The
            shared chrome (header, footer, design tokens, fonts) is live. Individual pages port
            over one at a time.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <Link href="/catalog" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Browse courses <i className="fas fa-arrow-right" aria-hidden="true" />
            </Link>
            <Link href="/about" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              About us
            </Link>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow">In progress</span>
            <h2 className="t321-mkt-h2">Migration status</h2>
            <p className="t321-mkt-lede">
              The original Nuxt site is preserved on the <code>nuxt-archive</code> branch. Once
              every box below is checked, that branch can be archived and this placeholder
              replaced with the real homepage.
            </p>
          </div>
          <ul style={{ listStyle: "none", padding: 0, margin: "0 auto", maxWidth: 720, display: "grid", gap: "0.5rem" }}>
            {PORT_STATUS.map((item) => (
              <li
                key={item.name}
                className="t321-mkt-card"
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.85rem 1.1rem" }}
              >
                <i
                  className={`fas ${item.status === "done" ? "fa-check-circle" : "fa-circle"}`}
                  style={{
                    color:
                      item.status === "done"
                        ? "var(--t321-mkt-positive)"
                        : "var(--t321-mkt-line-strong)",
                    fontSize: "1rem"
                  }}
                  aria-hidden="true"
                />
                <span style={{ fontWeight: 500 }}>{item.name}</span>
                <span
                  className={`t321-mkt-badge ${
                    item.status === "done" ? "t321-mkt-badge--positive" : ""
                  }`}
                  style={{ marginLeft: "auto" }}
                >
                  {item.status === "done" ? "Done" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="t321-mkt-section">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow">
              <i className="fas fa-info-circle" aria-hidden="true" /> Stack
            </span>
            <h2 className="t321-mkt-h2">What's running here</h2>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              maxWidth: 960,
              margin: "0 auto"
            }}
          >
            {[
              { label: "Framework", value: "Next.js 15", icon: "fa-bolt" },
              { label: "Router", value: "App Router + Turbopack", icon: "fa-route" },
              { label: "Styling", value: "Custom CSS tokens", icon: "fa-palette" },
              { label: "Hosting", value: "Vercel", icon: "fa-cloud" },
              { label: "CMS", value: "TinaCMS (next session)", icon: "fa-database" },
              { label: "Content", value: "Markdown in Git", icon: "fa-code-branch" }
            ].map((card) => (
              <div key={card.label} className="t321-mkt-card">
                <i className={`fas ${card.icon}`} style={{ color: "var(--t321-mkt-accent)", fontSize: "1.1rem" }} aria-hidden="true" />
                <div style={{ marginTop: "0.5rem", fontSize: "0.78rem", color: "var(--t321-mkt-ink-muted)", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>
                  {card.label}
                </div>
                <div style={{ fontSize: "1rem", fontWeight: 500, marginTop: "0.2rem" }}>{card.value}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
