import { getCourses } from "@/lib/content";
import CatalogClient from "./CatalogClient";

export const metadata = {
  title: "Catalog — Train321",
  description: "Every course Train321 offers, on a single page."
};

export default function CatalogPage() {
  const courses = getCourses();
  return <CatalogClient courses={courses} />;
}
