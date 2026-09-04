import Image from "next/image";
import "./TabcCertificate.css";

/**
 * Marketing preview of the TABC seller/server certificate — the designed
 * sample image (dummy data and the sample/legal disclaimer are printed on the
 * image itself). Rendered only for the TABC course, via `certificateVariant`
 * on the course; every other course keeps the generic CourseCertificate.
 */
export default function TabcCertificate() {
  return (
    <div className="t321-tabc">
      <Image
        className="t321-tabc__img"
        src="/img/certificate/tabc-sample.png"
        alt="Sample TABC Seller Training Certification for Maria Gonzalez, showing the certificate number, expiration date and trainer signature"
        width={1150}
        height={842}
      />
    </div>
  );
}
