import Link from "next/link";
import { Mail, Link2, AtSign, Send } from "lucide-react";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { GithubMark } from "@/components/ui/icons";
import type { SocialLink } from "@/types/content";

function SocialIcon({ icon }: { icon: SocialLink["icon"] }) {
  const className = "h-4 w-4";
  switch (icon) {
    case "github":
      return <GithubMark className={className} />;
    case "mail":
      return <Mail className={className} strokeWidth={1.75} />;
    case "linkedin":
      return <Link2 className={className} strokeWidth={1.75} />;
    case "twitter":
      return <AtSign className={className} strokeWidth={1.75} />;
    case "telegram":
      return <Send className={className} strokeWidth={1.75} />;
  }
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-line">
      <Container className="flex flex-col gap-4 py-10 text-sm text-ink-soft md:flex-row md:items-center md:justify-between">
        <p className="font-mono text-xs">
          <span className="text-brass">$</span> {siteConfig.name} — built &amp; logged from{" "}
          {siteConfig.location}, {year}
        </p>
        <div className="flex items-center gap-4">
          {siteConfig.socials.map((social) => (
            <Link
              key={social.url}
              href={social.url}
              target={social.url.startsWith("http") ? "_blank" : undefined}
              rel="noreferrer"
              aria-label={social.label}
              className="text-ink-soft transition-colors hover:text-brass"
            >
              <SocialIcon icon={social.icon} />
            </Link>
          ))}
        </div>
      </Container>
    </footer>
  );
}
