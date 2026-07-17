import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/mdx";
import { getCaseStudySlugs } from "@/lib/github";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://example.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = getAllPosts();
  const caseStudySlugs = await getCaseStudySlugs();

  const staticRoutes = ["", "/projects", "/blog", "/resume"].map((route) => ({
    url: `${SITE_URL}${route}`,
    lastModified: new Date(),
  }));

  const postRoutes = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
  }));

  const projectRoutes = caseStudySlugs.map((slug) => ({
    url: `${SITE_URL}/projects/${slug}`,
    lastModified: new Date(),
  }));

  return [...staticRoutes, ...postRoutes, ...projectRoutes];
}
