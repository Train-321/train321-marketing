import "./TabcCertificate.css";

/**
 * Marketing preview of the TABC seller/server certificate, drawn entirely in
 * SVG/CSS (no raster asset, no CMS). Everything below the title is sample data
 * — real certificates are filled from the learner's enrollment record. Shown
 * only for the TABC course (see `certificateVariant` on the course).
 */

export type TabcCertificateProps = {
  learnerName?: string;
  certificateNo?: string;
  expirationDate?: string;
  schoolNo?: string;
  signatureName?: string;
  legalText?: string;
};

/** A five-point star, centred, sized by the wrapping <g> transform. */
function Star() {
  return (
    <path d="M12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26Z" />
  );
}

/** Small symmetric filigree used above the title and below the name. */
function Flourish({ className }: { className?: string }) {
  return (
    <svg
      className={`t321-tabc__flourish${className ? ` ${className}` : ""}`}
      viewBox="0 0 220 16"
      aria-hidden="true"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.1">
        <path d="M110 8c13-9 26-9 33 0-9 7-20 5-22-3" />
        <path d="M110 8c-13-9-26-9-33 0 9 7 20 5 22-3" />
        <path d="M77 8H20" />
        <path d="M143 8h57" />
      </g>
      <circle cx="110" cy="8" r="2.3" fill="currentColor" />
    </svg>
  );
}

/** Corner ornament, mirrored via CSS at each corner. */
function Corner() {
  return (
    <svg className="t321-tabc__corner" viewBox="0 0 40 40" aria-hidden="true">
      <g fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M4 4c14 0 22 8 22 22" />
        <path d="M4 10c10 0 16 6 16 16" />
        <circle cx="6" cy="6" r="2.2" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}

export default function TabcCertificate({
  learnerName = "Maria Gonzalez",
  certificateNo = "2026-100426",
  expirationDate = "03-14-2028",
  schoolNo = "663-753",
  signatureName = "Train 321 Learning Team",
  legalText = "SAMPLE CERTIFICATE — SHOWN FOR ILLUSTRATION. STUDENT CERTIFICATION: BY COMPLETING THIS PROGRAM THE STUDENT CERTIFIES THAT THEY COMPLETED ALL LESSONS, QUIZZES AND THE FINAL EXAM REQUIRED TO DEMONSTRATE MASTERY OF ALL MATERIAL. ISSUED CERTIFICATES CARRY THE LEARNER'S NAME, COMPLETION AND EXPIRATION DATES, AND A UNIQUE CERTIFICATE NUMBER."
}: TabcCertificateProps) {
  return (
    <div className="t321-tabc">
      <div className="t321-tabc__page">
        <Corner />
        <Corner />
        <Corner />
        <Corner />

        <div className="t321-tabc__head">
          {/* Texas Alcoholic Beverage Commission seal */}
          <svg className="t321-tabc__seal-abc" viewBox="0 0 120 120" aria-hidden="true">
            <defs>
              <path id="tabc-abc-top" d="M60 12a48 48 0 0 1 0 96" />
              <path id="tabc-abc-bot" d="M60 108a48 48 0 0 1 0-96" />
            </defs>
            <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="2" />
            <circle cx="60" cy="60" r="49" fill="none" stroke="currentColor" strokeWidth="1" />
            <text className="t321-tabc__seal-txt">
              <textPath href="#tabc-abc-top" startOffset="50%">TEXAS ALCOHOLIC</textPath>
            </text>
            <text className="t321-tabc__seal-txt">
              <textPath href="#tabc-abc-bot" startOffset="50%">BEVERAGE COMMISSION</textPath>
            </text>
            <circle cx="60" cy="58" r="24" fill="none" stroke="currentColor" strokeWidth="1" />
            <g className="t321-tabc__star" transform="translate(46 44) scale(1.15)">
              <Star />
            </g>
          </svg>

          <div className="t321-tabc__certno">
            <span className="t321-tabc__certno-val">{certificateNo}</span>
            <span className="t321-tabc__line" />
            <span className="t321-tabc__certno-label">Certificate Number</span>
          </div>
        </div>

        <Flourish className="t321-tabc__flourish--title" />
        <h3 className="t321-tabc__title">Seller Training Certification</h3>
        <span className="t321-tabc__title-rule" />

        <p className="t321-tabc__name">{learnerName}</p>
        <Flourish className="t321-tabc__flourish--name" />

        <p className="t321-tabc__body">
          has completed a TABC-approved Seller/Server Training Program.
        </p>

        {/* Seller Training School · TABC-approved seal */}
        <svg className="t321-tabc__seal-school" viewBox="0 0 120 132" aria-hidden="true">
          <defs>
            <path id="tabc-school-top" d="M60 14a44 44 0 0 1 0 88" />
            <path id="tabc-school-bot" d="M18 60a42 42 0 0 0 84 0" />
          </defs>
          <circle cx="60" cy="58" r="50" fill="none" stroke="currentColor" strokeWidth="2" />
          <circle cx="60" cy="58" r="44" fill="none" stroke="currentColor" strokeWidth="1" />
          <text className="t321-tabc__seal-txt">
            <textPath href="#tabc-school-top" startOffset="50%">SELLER TRAINING SCHOOL</textPath>
          </text>
          <text className="t321-tabc__seal-txt">
            <textPath href="#tabc-school-bot" startOffset="50%">TABC-APPROVED</textPath>
          </text>
          {/* laurel */}
          <path d="M42 74c-10-6-13-18-11-30" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M78 74c10-6 13-18 11-30" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <g className="t321-tabc__star" transform="translate(46 40) scale(1.2)">
            <Star />
          </g>
          {/* ribbon */}
          <path d="M48 104h24v18l-12-6-12 6z" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <text x="60" y="116" className="t321-tabc__ribbon-txt">{schoolNo}</text>
        </svg>

        <div className="t321-tabc__foot">
          <div className="t321-tabc__foot-col">
            <span className="t321-tabc__foot-val">{expirationDate}</span>
            <span className="t321-tabc__line" />
            <span className="t321-tabc__foot-label">Expiration Date</span>
            <span className="t321-tabc__foot-sub">(Two years from issue date)</span>
          </div>
          <div className="t321-tabc__foot-col">
            <span className="t321-tabc__foot-script">{signatureName}</span>
            <span className="t321-tabc__line" />
            <span className="t321-tabc__foot-label">Trainer Signature</span>
          </div>
        </div>
      </div>

      <p className="t321-tabc__legal">{legalText}</p>
    </div>
  );
}
