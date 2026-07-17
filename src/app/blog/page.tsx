import type { Metadata } from "next";
import { getAllPosts } from "@/lib/mdx";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { PostCard } from "@/components/blog/post-card";

export const metadata: Metadata = {
  title: `Blog — ${siteConfig.name}`,
  description: "Notes on what I'm building and learning.",
};

export default function BlogPage() {
  const posts = getAllPosts();

  return (
    <Container className="py-20 md:py-28">
      <SectionHeading
        eyebrow="Blog"
        title="Notes from the log"
        subtitle="Short write-ups on what I'm building, learning, or stuck on."
      />

      {posts.length > 0 ? (
        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      ) : (
        <p className="font-mono text-sm text-ink-soft">No posts yet.</p>
      )}
    </Container>
  );
}
