import { getBlogPosts } from "@/lib/content";
import BlogClient from "./BlogClient";

export const metadata = {
  title: "Journal — Train321",
  description: "Compliance updates, operator playbooks, and field notes from the Train321 team."
};

export default function BlogIndexPage() {
  const posts = getBlogPosts();
  return <BlogClient posts={posts} />;
}
