import Link from "next/link";
import { cn } from "@/lib/utils";

type ButtonBaseProps = {
  variant?: "primary" | "secondary" | "ghost";
  className?: string;
  children: React.ReactNode;
};

const variants: Record<NonNullable<ButtonBaseProps["variant"]>, string> = {
  primary:
    "bg-ink text-paper hover:bg-brass hover:text-paper border border-ink hover:border-brass",
  secondary: "border border-line text-ink hover:border-brass hover:text-brass",
  ghost: "text-ink-soft hover:text-brass",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium transition-colors";

export function Button({
  variant = "primary",
  className,
  children,
  href,
  ...props
}: ButtonBaseProps &
  (
    | ({ href: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>)
    | ({ href?: undefined } & React.ButtonHTMLAttributes<HTMLButtonElement>)
  )) {
  const classes = cn(base, variants[variant], className);

  if (href) {
    return (
      <Link href={href} className={classes} {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}>
        {children}
      </Link>
    );
  }

  return (
    <button className={classes} {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}>
      {children}
    </button>
  );
}
