"use server";

import { getAllPostSlugs } from "@/lib/mdx";
import { getPostViews, getVisitor, isBackendConfigured, isBot, recordPostView } from "@/lib/backend";

const MAX_SLUGS = 100;

// Server Actions are public POST endpoints: only accept slugs of posts that exist,
// so nobody can fill the view tables with junk.
function isKnownSlug(slug: unknown, known: Set<string>): slug is string {
  return typeof slug === "string" && known.has(slug);
}

/** Records one view of a post for the current visitor. Returns the up-to-date count, or null. */
export async function recordView(slug: string): Promise<number | null> {
  if (!isBackendConfigured()) return null;
  if (!isKnownSlug(slug, new Set(getAllPostSlugs()))) return null;

  const { userAgent } = await getVisitor();
  if (isBot(userAgent)) return null;

  try {
    const view = await recordPostView(slug);
    return view.viewCount;
  } catch (error) {
    console.error("Failed to record post view:", error);
    return null;
  }
}

/** View counts for many posts in one backend call (blog index). Null when unavailable. */
export async function getViewCounts(slugs: string[]): Promise<Record<string, number> | null> {
  if (!isBackendConfigured() || !Array.isArray(slugs)) return null;

  const known = new Set(getAllPostSlugs());
  const wanted = [...new Set(slugs.filter((slug) => isKnownSlug(slug, known)))].slice(0, MAX_SLUGS);
  if (wanted.length === 0) return {};

  try {
    return await getPostViews(wanted);
  } catch (error) {
    console.error("Failed to read post views:", error);
    return null;
  }
}
