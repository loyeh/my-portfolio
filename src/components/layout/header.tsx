import Link from "next/link";
import { siteConfig } from "@/content/site.config";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { MobileNav } from "@/components/layout/mobile-nav";
import { Container } from "@/components/ui/container";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur-sm">
      <Container className="relative flex h-16 items-center justify-between">
        <Link
          href="/"
          className="font-mono text-sm text-ink transition-colors hover:text-brass"
        >
          <span className="text-brass">~/</span>
          {siteConfig.githubUsername}
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-mono text-xs uppercase tracking-wide text-ink-soft transition-colors hover:text-brass"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <ThemeToggle className="hidden md:inline-flex" />
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
