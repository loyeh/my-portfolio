import Link from "next/link";
import type { MDXComponents } from "mdx/types";

export const mdxComponents: MDXComponents = {
  h2: (props) => (
    <h2 className="mt-12 font-display text-2xl italic text-ink" {...props} />
  ),
  h3: (props) => (
    <h3 className="mt-8 text-lg font-semibold text-ink" {...props} />
  ),
  p: (props) => <p className="mt-4 leading-relaxed text-ink-soft" {...props} />,
  ul: (props) => (
    <ul className="mt-4 list-disc space-y-2 pl-5 text-ink-soft" {...props} />
  ),
  ol: (props) => (
    <ol className="mt-4 list-decimal space-y-2 pl-5 text-ink-soft" {...props} />
  ),
  a: ({ href, ...props }) => (
    <Link
      href={href ?? "#"}
      className="text-brass underline underline-offset-2"
      {...props}
    />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-4 border-l-2 border-brass pl-4 italic text-ink-soft"
      {...props}
    />
  ),
  code: (props) => (
    <code
      className="rounded bg-card px-1.5 py-0.5 font-mono text-[0.85em] text-ink"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-md border border-line bg-card p-4 text-sm"
      {...props}
    />
  ),
};
