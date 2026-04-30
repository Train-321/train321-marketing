import type { TrustLogo } from "@/lib/sanity";
import "./TrustLogosCarousel.css";

// Marquee carousel of accreditation / partner logos.
// Reads from siteSettings.trustLogos in Sanity. Click-to-edit works
// because the strings come from a stega-encoded fetch.

type Props = {
  logos: TrustLogo[];
  label?: string;
};

export default function TrustLogosCarousel({ logos, label }: Props) {
  if (!logos || logos.length === 0) return null;

  // Duplicate the list so the marquee can loop seamlessly.
  const track = [...logos, ...logos];

  return (
    <div className="t321-mkt-logos">
      {label && <p className="t321-mkt-logos__label">{label}</p>}
      <div className="t321-mkt-logos__viewport" aria-label="Accreditations and partners">
        <ul className="t321-mkt-logos__track">
          {track.map((logo, i) => {
            const inner = (
              <>
                {logo.imageUrl ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={logo.imageUrl}
                    alt={logo.label || logo.name}
                    title={logo.label || logo.name}
                    loading="lazy"
                  />
                ) : (
                  <span className="t321-mkt-logos__name">{logo.name}</span>
                )}
              </>
            );
            return (
              <li className="t321-mkt-logos__item" key={`${logo.name}-${i}`} aria-hidden={i >= logos.length}>
                {logo.url ? (
                  <a href={logo.url} target="_blank" rel="noopener noreferrer">
                    {inner}
                  </a>
                ) : (
                  inner
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
