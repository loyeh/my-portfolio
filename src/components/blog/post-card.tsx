import Link from "next/link";
import type { BlogPost } from "@/types/content";
import { LogRow } from "@/components/ui/log-row";
import { formatDate } from "@/lib/utils";

export function PostCard({ post }: { post: BlogPost }) {
  return (
    <LogRow meta={formatDate(post.date)}>
      <Link
        href={`/blog/${post.slug}`}
        className="group block rounded-md border border-line bg-card p-5 transition-colors hover:border-brass"
      >
        <h3 className="text-lg font-semibold text-ink group-hover:text-brass">
          {post.title}
        </h3>
        <p className="mt-2 text-sm text-ink-soft">{post.description}</p>
        <p className="mt-3 font-mono text-xs text-ink-soft">{post.readingTime}</p>
      </Link>
    </LogRow>
  );
}
