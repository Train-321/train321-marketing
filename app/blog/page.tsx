import { getBlogPosts, getBlogIndexPage } from "@/lib/sanity";
import BlogClient from "./BlogClient";

// Posts come and go from Studio; re-render so an unpublished or deleted post
// leaves the Journal without a deploy.
export const revalidate = 60;

export const metadata = {
  title: "Journal — Train321",
  description: "Compliance updates, operator playbooks, and field notes from the Train321 team."
};

export default async function BlogIndexPage() {
  const [posts, page] = await Promise.all([getBlogPosts(), getBlogIndexPage()]);
  return <BlogClient posts={posts} page={page} />;
}
