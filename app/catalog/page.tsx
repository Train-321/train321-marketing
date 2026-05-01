import { getCourses, getCatalogPage } from "@/lib/sanity";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Catalog — Train321",
  description: "Every course Train321 offers, on a single page."
};

export default async function CatalogPage() {
  const [courses, page] = await Promise.all([getCourses(), getCatalogPage()]);
  return <CatalogClient courses={courses} page={page} />;
}
