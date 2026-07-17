import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { getLatestActivity } from "@/lib/github";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { timeAgo } from "@/lib/utils";

export async function Hero() {
  const latest = await getLatestActivity();

  return (
    <section className="relative overflow-hidden border-b border-line bg-grid bg-fixed">
      <div className="absolute inset-0 bg-gradient-to-b from-paper via-paper/95 to-paper" />
      <Container className="relative py-24 md:py-36">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
          {siteConfig.role} · {siteConfig.location}
        </p>

        <h1 className="mt-6 max-w-3xl font-display text-5xl italic leading-[1.05] tracking-tight text-ink md:text-7xl">
          {siteConfig.name} builds things, one log entry at a time.
        </h1>

        <p className="mt-6 max-w-xl text-base text-ink-soft md:text-lg">
          {siteConfig.tagline} Every project below is a real commit, pulled live
          from GitHub — not a curated highlight reel.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button href="/projects" variant="primary">
            View the log <ArrowUpRight className="h-4 w-4" />
          </Button>
          <Button href="/#contact" variant="secondary">
            Get in touch
          </Button>
        </div>

        <div className="mt-14 max-w-xl rounded-md border border-line bg-card/60 px-5 py-4 font-mono text-xs text-ink-soft backdrop-blur-sm">
          {latest ? (
            <>
              <span className="text-pine">$</span> latest commit ·{" "}
              <Link
                href={latest.html_url}
                target="_blank"
                rel="noreferrer"
                className="text-ink hover:text-brass"
              >
                {latest.name}
              </Link>{" "}
              · {timeAgo(latest.pushed_at)}
            </>
          ) : (
            <>
              <span className="text-pine">$</span> latest commit · unavailable right now
            </>
          )}
        </div>
      </Container>
    </section>
  );
}
