"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { recordView } from "@/app/actions/post-views";

export function formatViews(count: number) {
  return ` · ${count.toLocaleString("en-US")} ${count === 1 ? "view" : "views"}`;
}

// Records one view when a post page mounts and shows the current count.
// Renders nothing while loading or when the backend is unavailable.
export function ViewCounter({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  const [, startTransition] = useTransition();
  const recordedSlug = useRef<string | null>(null);

  useEffect(() => {
    // Guard against React Strict Mode running the effect twice in development.
    if (recordedSlug.current === slug) return;
    recordedSlug.current = slug;

    startTransition(async () => {
      try {
        setCount(await recordView(slug));
      } catch {
        setCount(null);
      }
    });
  }, [slug]);

  if (count === null) return null;
  return <span>{formatViews(count)}</span>;
}
