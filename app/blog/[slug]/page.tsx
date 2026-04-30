import { notFound } from "next/navigation";
import { tinaBlogPost, tinaBlogPostConnection } from "@/lib/tina";
import BlogArticleClient from "./BlogArticleClient";

export async function generateStaticParams() {
  const result = await tinaBlogPostConnection();
  return (
    result.data.blogPostConnection.edges
      ?.map((edge) => edge?.node?._sys?.filename)
      .filter((s): s is string => Boolean(s))
      .map((slug) => ({ slug })) ?? []
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await tinaBlogPost(slug);
  if (!result) return { title: "Article — Train321" };
  const post = result.data.blogPost;
  return {
    title: `${post.title} — Train321`,
    description: post.excerpt || ""
  };
}

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const result = await tinaBlogPost(slug);
  if (!result) return notFound();

  const allPosts = await tinaBlogPostConnection();
  const related = (allPosts.data.blogPostConnection.edges || [])
    .map((e) => e?.node)
    .filter((n): n is NonNullable<typeof n> => Boolean(n))
    .filter((n) => n._sys.filename !== slug)
    .slice(0, 3);

  return <BlogArticleClient {...result} related={related} />;
}
