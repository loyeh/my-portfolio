"use client";

import { createContext, useContext, useEffect, useState, useTransition } from "react";
import { getViewCounts } from "@/app/actions/post-views";
import { formatViews } from "@/components/blog/view-counter";

const PostViewCountsContext = createContext<Record<string, number> | null>(null);

// Loads the view counts for every post on the blog index in a single Server Action call.
export function PostViewCountsProvider({
  slugs,
  children,
}: {
  slugs: string[];
  children: React.ReactNode;
}) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const [, startTransition] = useTransition();
  const slugKey = slugs.join(",");

  useEffect(() => {
    startTransition(async () => {
      try {
        setCounts(await getViewCounts(slugKey ? slugKey.split(",") : []));
      } catch {
        setCounts(null);
      }
    });
  }, [slugKey]);

  return <PostViewCountsContext.Provider value={counts}>{children}</PostViewCountsContext.Provider>;
}

export function PostViewCount({ slug }: { slug: string }) {
  const counts = useContext(PostViewCountsContext);
  const count = counts?.[slug];
  if (count === undefined) return null;
  return <span>{formatViews(count)}</span>;
}
