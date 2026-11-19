import "./rbs.css";

// Shown the moment someone lands on /california-rbs, while the page loads its
// courses, prices and add-ons from the LMS. A skeleton in the shape of the
// page's first screen (ribbon, top bar, hero copy on the left, certificate on
// the right), so the page fills in smoothly instead of flashing blank.

function Bar({ w, h = 14, className = "" }: { w: string; h?: number; className?: string }) {
  return <span className={`rbs-sk ${className}`} style={{ width: w, height: h }} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="t321-rbs" aria-busy="true">
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>
      <p className="rbs-sr-only" role="status">
        Loading…
      </p>

      <p className="rbs-ribbon">
        <i className="fas fa-shield-alt" aria-hidden="true" />{" "}
        <span className="rbs-ribbon__full">Approved California Responsible Beverage Service (RBS) training provider</span>
        <span className="rbs-ribbon__short">Approved California RBS training provider</span>
      </p>

      <header className="rbs-top">
        <div className="rbs-wrap rbs-top__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logos/train321_logo.png" alt="Train 321" className="rbs-top__logo-img" />
          <Bar w="180px" h={16} />
        </div>
      </header>

      <section className="rbs-hero rbs-hero--loading">
        <div className="rbs-wrap rbs-hero__grid">
          <div className="rbs-hero__copy">
            <Bar w="240px" h={28} className="rbs-sk--pill" />
            <Bar w="92%" h={46} />
            <Bar w="70%" h={46} />
            <Bar w="85%" />
            <Bar w="60%" />
            <Bar w="220px" />
            <Bar w="200px" />
            <div className="rbs-sk-row rbs-sk-row--start">
              <Bar w="210px" h={54} className="rbs-sk--field" />
              <Bar w="150px" h={54} className="rbs-sk--field" />
            </div>
          </div>
          <div className="rbs-hero__visual">
            <span className="rbs-sk rbs-sk--cert" aria-hidden="true" />
          </div>
        </div>
      </section>
    </div>
  );
}
