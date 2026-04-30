import { notFound } from "next/navigation";
import { tinaCourse, tinaCourseConnection } from "@/lib/tina";
import CoursePageClient from "./CoursePageClient";

export async function generateStaticParams() {
  const result = await tinaCourseConnection();
  return (
    result.data.courseConnection.edges
      ?.map((edge) => edge?.node?._sys?.filename)
      .filter((s): s is string => Boolean(s))
      .map((slug) => ({ slug })) ?? []
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await tinaCourse(slug);
  if (!result) return { title: "Course · Train321" };
  const course = result.data.course;
  return {
    title: `${course.title} · Train321`,
    description: course.summary || course.tagline || ""
  };
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await tinaCourse(slug);
  if (!result) return notFound();
  return <CoursePageClient {...result} />;
}
