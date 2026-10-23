import type { Metadata } from "next";
import { getCartCourse, type CartCourse } from "@/lib/enroll";
import CourseCheckout from "./CourseCheckout";
import "../../../marketing-v9.css";

// Direct checkout reached from a v9 course landing page's "Get started", or
// linked straight from an email/ad. The [id] segment may be a single course id
// OR a comma-separated list (e.g. 669,856,692) — every valid id is resolved and
// auto-filled into the cart. Self-contained and isolated: it prices via the
// shared READ-ONLY quote API and never creates an account or charge.
export const metadata: Metadata = {
  title: "Checkout | Train 321",
  robots: { index: false, follow: false }
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Accept a single id or a comma-separated list; drop blanks/dupes/non-ids.
  const ids = [
    ...new Set(
      decodeURIComponent(id)
        .split(",")
        .map((s) => Number(s.trim()))
        .filter((n) => Number.isInteger(n) && n > 0)
    )
  ];

  // Resolve each id; ids that don't resolve (e.g. a typo) are simply skipped
  // rather than 404-ing the whole page.
  const resolved = await Promise.all(ids.map((n) => getCartCourse(n)));
  const courses = resolved.filter((c): c is CartCourse => c !== null);

  return <CourseCheckout courses={courses} />;
}
