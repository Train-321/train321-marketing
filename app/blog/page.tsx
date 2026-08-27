import { getBlogPosts, getBlogIndexPage } from "@/lib/sanity";
import BlogClient from "./BlogClient";

// Posts come and go from Studio; re-render so an unpublished or deleted post
// leaves the Journal without a deploy.
export const revalidate = 60;

export const metadata = {
  title: "Journal",
  description: "Compliance updates, operator playbooks, and field notes from the Train 321 team.",
  alternates: { canonical: "/blog" }
};

export default async function BlogIndexPage() {
  const [posts, page] = await Promise.all([getBlogPosts(), getBlogIndexPage()]);
  return <BlogClient posts={posts} page={page} />;
}
