import { cn } from "@/lib/utils";

// The site's signature structural device: every list-like section (experience,
// projects, posts) reads as an entry in a build log, with a monospace metadata
// column standing in for a git-log timestamp/hash.
export function LogRow({
  meta,
  children,
  className,
}: {
  meta: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "grid grid-cols-1 gap-x-6 gap-y-2 border-l border-line pl-5 md:grid-cols-[7.5rem_1fr] md:border-l-0 md:pl-0",
        className
      )}
    >
      <div className="font-mono text-xs leading-relaxed text-ink-soft md:border-r md:border-line md:pr-5 md:pt-1 md:text-right">
        {meta}
      </div>
      <div className="md:pl-6">{children}</div>
    </div>
  );
}
