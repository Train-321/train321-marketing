import { getBlogPosts, getBlogIndexPage } from "@/lib/sanity";
import BlogClient from "./BlogClient";

export const metadata = {
  title: "Journal — Train321",
  description: "Compliance updates, operator playbooks, and field notes from the Train321 team."
};

export default async function BlogIndexPage() {
  const [posts, page] = await Promise.all([getBlogPosts(), getBlogIndexPage()]);
  return <BlogClient posts={posts} page={page} />;
}
