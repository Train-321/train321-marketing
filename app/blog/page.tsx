import { getBlogPosts, getBlogIndexPage } from "@/lib/sanity";
import BlogClient from "./BlogClient";

// Posts come and go from Studio; re-render so an unpublished or deleted post
// leaves the Journal without a deploy.
export const revalidate = 60;

export const metadata = {
  // "Journal" is the in-site name; nobody searches for a journal, so the
  // search title says blog.
  title: "Compliance Blog for Restaurant Operators",
  description:
    "Food code changes, state training laws, certification tips and field notes from the Train 321 team, written for restaurant and bar operators.",
  alternates: { canonical: "/blog" }
};

export default async function BlogIndexPage() {
  const [posts, page] = await Promise.all([getBlogPosts(), getBlogIndexPage()]);
  return <BlogClient posts={posts} page={page} />;
}
