import { tinaBlogPostConnection } from "@/lib/tina";
import BlogClient from "./BlogClient";

export const metadata = {
  title: "Journal — Train321",
  description: "Compliance updates, operator playbooks, and field notes from the Train321 team."
};

export default async function BlogIndexPage() {
  const result = await tinaBlogPostConnection();
  return <BlogClient {...result} />;
}
