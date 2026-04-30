// Placeholder home page — full home with hero animation/audience toggle ports next.

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
            Site is being migrated from Nuxt+Sanity to Next.js+TinaCMS. Header, footer, and
            base styles are live. Pages port in the next session.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <a href="/catalog" className="t321-mkt-btn t321-mkt-btn--accent t321-mkt-btn--lg">
              Browse courses <i className="fas fa-arrow-right" aria-hidden="true" />
            </a>
            <a href="/about" className="t321-mkt-btn t321-mkt-btn--ghost t321-mkt-btn--lg">
              About us
            </a>
          </div>
        </div>
      </section>

      <section className="t321-mkt-section t321-mkt-section--sunk">
        <div className="t321-mkt-container">
          <div className="t321-mkt-section__head">
            <span className="t321-mkt-eyebrow">In progress</span>
            <h2 className="t321-mkt-h2">Migration status</h2>
            <p className="t321-mkt-lede">
              The original Nuxt site is preserved on the <code>nuxt-archive</code> branch. Pages
              port one at a time in subsequent sessions.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
