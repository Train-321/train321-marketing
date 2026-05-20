import { getCourses, getCatalogPage, getSiteSettings } from "@/lib/sanity";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Catalog — Train321",
  description: "Every course Train321 offers, on a single page."
};

export default async function CatalogPage() {
  const [courses, page, settings] = await Promise.all([getCourses(), getCatalogPage(), getSiteSettings()]);
  const enrollBaseUrl = settings.enrollBaseUrl || "http://new-features.train321.com/#/enroll";
  return <CatalogClient courses={courses} page={page} enrollBaseUrl={enrollBaseUrl} />;
}
