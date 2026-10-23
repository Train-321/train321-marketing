import type { Metadata } from "next";
import { getCartCourse, type CartCourse } from "@/lib/enroll";
import CourseCheckout from "./CourseCheckout";
import "./marketing-v9.css";

// /marketing-v9 IS the checkout — a short hero + the buy form, so a visitor
// lands and can purchase within seconds. Courses come from the URL:
// /marketing-v9?ids=856,692 pre-fills the cart with those courses. noindex.
// Isolated: it only READS course + price data; nothing is charged or created.
export const metadata: Metadata = {
  title: "Get started — food, alcohol & workplace training | Train 321",
  description:
    "Enroll in ANSI-accredited food, alcohol and workplace compliance courses. Finish online in about an hour, certificate the same day.",
  alternates: { canonical: "/marketing-v9" },
  robots: { index: false, follow: true }
};

export default async function GetStartedCheckout({
  searchParams
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const sp = await searchParams;
  const idsParam = sp.ids ?? sp.course ?? sp.id;
  const raw = idsParam ? (Array.isArray(idsParam) ? idsParam.join(",") : idsParam) : "";
  const ids = [
    ...new Set(
      raw.split(",").map((s) => Number(s.trim())).filter((n) => Number.isInteger(n) && n > 0)
    )
  ];
  const resolved = await Promise.all(ids.map((n) => getCartCourse(n)));
  const courses = resolved.filter((c): c is CartCourse => c !== null);

  return <CourseCheckout courses={courses} />;
}
