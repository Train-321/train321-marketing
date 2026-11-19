import "./rbs.css";

// Shown the moment someone lands on /california-rbs, while the page loads its
// courses, prices and add-ons from the LMS. A skeleton in the exact shape of
// the real page (ribbon, top bar, certificate on the left, checkout card on
// the right), so the page fills in smoothly instead of flashing blank.

function Bar({ w, h = 14, className = "" }: { w: string; h?: number; className?: string }) {
  return <span className={`rbs-sk ${className}`} style={{ width: w, height: h }} aria-hidden="true" />;
}

export default function Loading() {
  return (
    <div className="t321-rbs" aria-busy="true">
      <style>{`.t321-mkt-header,.t321-mkt-footer{display:none !important;}`}</style>
      <p className="rbs-sr-only" role="status">
        Loading your enrollment…
      </p>

      <p className="rbs-ribbon">
        <i className="fas fa-shield-alt" aria-hidden="true" /> Approved California Responsible Beverage Service (RBS)
        training provider
      </p>

      <header className="rbs-top">
        <div className="rbs-wrap rbs-top__inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/img/logos/train321_logo.png" alt="Train 321" className="rbs-top__logo-img" />
          <Bar w="180px" h={16} />
        </div>
      </header>

      <section className="rbs-checkout">
        <div className="rbs-wrap">
          <div className="rbs-co rbs-co--loading">
            <div className="rbs-co__side">
              <div className="rbs-side__intro rbs-sk-stack">
                <Bar w="78%" h={30} className="rbs-sk--center" />
                <Bar w="92%" className="rbs-sk--center" />
                <Bar w="70%" className="rbs-sk--center" />
              </div>
              <span className="rbs-sk rbs-sk--cert" aria-hidden="true" />
              <div className="rbs-sk-row">
                <Bar w="110px" />
                <Bar w="140px" />
                <Bar w="150px" />
              </div>
            </div>

            <div className="rbs-co__main">
              <div className="rbs-paycard">
                <Bar w="62%" h={26} />
                <div className="rbs-order rbs-sk-order">
                  <span className="rbs-sk rbs-sk--thumb" aria-hidden="true" />
                  <span className="rbs-sk-stack">
                    <Bar w="85%" h={16} />
                    <Bar w="30%" h={12} />
                  </span>
                  <Bar w="54px" h={16} />
                </div>
                <div className="rbs-sk-row rbs-sk-row--start">
                  <Bar w="150px" h={30} className="rbs-sk--pill" />
                  <Bar w="130px" h={30} className="rbs-sk--pill" />
                </div>
                <span className="rbs-sk-stack">
                  <Bar w="60px" h={12} />
                  <Bar w="100%" h={50} className="rbs-sk--field" />
                </span>
                <span className="rbs-sk-stack">
                  <Bar w="50px" h={12} />
                  <Bar w="100%" h={50} className="rbs-sk--field" />
                </span>
                <Bar w="100%" h={54} className="rbs-sk--field" />
                <Bar w="46%" h={12} className="rbs-sk--center" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
