import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  className,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={cn("mb-12 md:mb-16", className)}>
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
        {eyebrow}
      </p>
      <h2 className="mt-3 font-display text-4xl italic tracking-tight text-ink md:text-5xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-base text-ink-soft md:text-lg">
          {subtitle}
        </p>
      )}
    </div>
  );
}
