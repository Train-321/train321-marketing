import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCartCourse } from "@/lib/enroll";
import CourseCheckout from "./CourseCheckout";
import "../../../marketing-v9.css";

// Direct, single-course checkout reached from a v9 course landing page's
// "Get started". Pre-loaded with just that one course. Self-contained and
// isolated — it prices via the shared READ-ONLY quote API and never creates an
// account or charge, so the live cart, /checkout and backend are untouched.
export const metadata: Metadata = {
  title: "Checkout | Train 321",
  robots: { index: false, follow: false }
};

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const numId = Number(id);
  if (!Number.isInteger(numId) || numId <= 0) notFound();

  const course = await getCartCourse(numId);
  if (!course) notFound();

  return <CourseCheckout course={course} />;
}
