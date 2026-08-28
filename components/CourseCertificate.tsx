import Image from "next/image";
import "./CourseCertificate.css";

/**
 * Marketing preview of the certificate learners actually receive.
 *
 * Mirrors the production DomPDF template (`templates/generic.blade.php` in the
 * Train 321 backend): Letter landscape, the navy/cyan blob background, Montserrat
 * on #01154F, and the 30/40/30 footer strip of issue meta · gold seal · signature.
 * Everything below the course title is sample data — real certificates are filled
 * from the learner's enrollment record.
 */

export type CourseCertificateProps = {
  /** Course title, printed in the "has successfully completed the" slot. */
  courseTitle: string;
  learnerName?: string;
  completionDate?: string;
  expirationDate?: string;
  /**
   * Some certificates don't expire on their own terms — California RBS, for
   * one, is governed by the ABC's certification cycle rather than a date this
   * certificate prints. Those pages hide the row instead of showing a date the
   * learner's real certificate won't carry.
   */
  showExpiration?: boolean;
  certificateNo?: string;
  signatureName?: string;
  signatureTitle?: string;
  legalText?: string;
};

export default function CourseCertificate({
  courseTitle,
  learnerName = "Maria Gonzalez",
  completionDate = "03-14-2026",
  expirationDate = "03-14-2029",
  showExpiration = true,
  certificateNo = "2026-100426",
  signatureName = "Train 321 Learning Team",
  signatureTitle = "Train 321, LLC",
  legalText
}: CourseCertificateProps) {
  // The closing sentence lists what an issued certificate carries, so it has to
  // track the rows above it — promising an expiration date the certificate
  // doesn't print would be the same error twice.
  const legal =
    legalText ??
    `SAMPLE CERTIFICATE — SHOWN FOR ILLUSTRATION. STUDENT CERTIFICATION: BY COMPLETING THIS PROGRAM THE STUDENT CERTIFIES THAT THEY COMPLETED ALL LESSONS, QUIZZES AND THE FINAL EXAM REQUIRED TO DEMONSTRATE MASTERY OF ALL MATERIAL. ISSUED CERTIFICATES CARRY THE LEARNER'S NAME, ${
      showExpiration ? "COMPLETION AND EXPIRATION DATES" : "COMPLETION DATE"
    }, AND A UNIQUE CERTIFICATE NUMBER.`;
  return (
    <div className="t321-cert">
      <div className="t321-cert__page">
        <Image
          className="t321-cert__logo"
          src="/img/certificate/hot_logo.png"
          alt=""
          width={128}
          height={65}
        />

        <p className="t321-cert__title">
          <span className="t321-cert__title-rule" />
          CERTIFICATE
          <span className="t321-cert__title-rule" />
        </p>
        <p className="t321-cert__subtitle">OF COMPLETION</p>

        <p className="t321-cert__ack">THIS ACKNOWLEDGES THAT:</p>
        <p className="t321-cert__name">{learnerName}</p>
        <p className="t321-cert__completed">HAS SUCCESSFULLY COMPLETED THE</p>
        <p className="t321-cert__course">{courseTitle}</p>

        <div className="t321-cert__foot">
          <div className="t321-cert__meta">
            {showExpiration && (
              <div className="t321-cert__meta-row t321-cert__meta-row--strong">
                <span>Expiration Date:</span>
                <span>{expirationDate}</span>
              </div>
            )}
            {/* With no expiration above it, the completion date is the lead
                line and takes the emphasis the strip is designed around. */}
            <div className={`t321-cert__meta-row${showExpiration ? "" : " t321-cert__meta-row--strong"}`}>
              <span>Date Completed:</span>
              <span>{completionDate}</span>
            </div>
            <div className="t321-cert__meta-row">
              <span>Certificate #:</span>
              <span>{certificateNo}</span>
            </div>
          </div>

          <div className="t321-cert__seal">
            <Image src="/img/certificate/stamp.png" alt="" width={196} height={196} />
          </div>

          <div className="t321-cert__sign">
            <span className="t321-cert__sign-script">{signatureName}</span>
            <span className="t321-cert__sign-title">{signatureTitle}</span>
          </div>
        </div>

        <p className="t321-cert__legal">{legal}</p>
      </div>
    </div>
  );
}
