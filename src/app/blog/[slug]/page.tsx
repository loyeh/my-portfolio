import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { getAllPostSlugs, getPostBySlug, getAdjacentPosts } from "@/lib/mdx";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { mdxComponents } from "@/components/blog/mdx-components";
import { ViewCounter } from "@/components/blog/view-counter";
import Link from "next/link";

export async function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} — ${siteConfig.name}`,
    description: post.description,
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const { previous, next } = getAdjacentPosts(slug);

  return (
    <Container className="py-20 md:py-28">
      <article className="mx-auto max-w-2xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
          {formatDate(post.date)} · {post.readingTime}
          <ViewCounter slug={slug} />
        </p>
        <h1 className="mt-3 font-display text-4xl italic tracking-tight text-ink md:text-5xl">
          {post.title}
        </h1>
        {post.tags && (
          <div className="mt-4 flex gap-2">
            {post.tags.map((tag) => (
              <Badge key={tag} tone="pine">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="mt-10 border-t border-line pt-10">
          <MDXRemote
            source={post.content}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  [rehypePrettyCode, { theme: "github-dark" }],
                ],
              },
            }}
          />
        </div>

        <div className="mt-16 flex items-center justify-between border-t border-line pt-8 font-mono text-sm">
          {previous ? (
            <Link href={`/blog/${previous.slug}`} className="text-ink-soft hover:text-brass">
              ← {previous.title}
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={`/blog/${next.slug}`} className="text-ink-soft hover:text-brass">
              {next.title} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </article>
    </Container>
  );
}
