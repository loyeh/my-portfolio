import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server Actions on the blog pages validate slugs against src/content/blog at
  // runtime (getAllPostSlugs), so ship the post files with those functions.
  outputFileTracingIncludes: {
    "/blog": ["./src/content/blog/**/*"],
    "/blog/*": ["./src/content/blog/**/*"],
  },
};

export default nextConfig;
