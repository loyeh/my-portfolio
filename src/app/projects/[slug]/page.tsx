import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowUpRight, Star } from "lucide-react";
import { getCaseStudySlugs, getProjectBySlug } from "@/lib/github";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export async function generateStaticParams() {
  const slugs = await getCaseStudySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: `${project.title} — ${siteConfig.name}`,
    description: project.tagline,
  };
}

export const revalidate = 3600;

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);

  if (!project || !project.caseStudy) notFound();

  const { caseStudy } = project;

  return (
    <Container className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-brass">
          Case study
        </p>
        <h1 className="mt-3 font-display text-4xl italic tracking-tight text-ink md:text-5xl">
          {project.title}
        </h1>

        <div className="mt-5 flex flex-wrap items-center gap-4 font-mono text-xs text-ink-soft">
          <span>Last pushed {formatDate(project.repo.pushed_at)}</span>
          {project.repo.stargazers_count > 0 && (
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" /> {project.repo.stargazers_count}
            </span>
          )}
          <Link
            href={project.repo.html_url}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 text-brass hover:underline"
          >
            View on GitHub <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="mt-10 space-y-10 border-t border-line pt-10">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Problem
            </h2>
            <p className="mt-2 leading-relaxed text-ink">{caseStudy.problem}</p>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Approach
            </h2>
            <p className="mt-2 leading-relaxed text-ink">{caseStudy.approach}</p>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
              Highlights
            </h2>
            <ul className="mt-2 space-y-2">
              {caseStudy.highlights.map((h) => (
                <li key={h} className="flex gap-2 leading-relaxed text-ink">
                  <span className="text-brass">·</span> {h}
                </li>
              ))}
            </ul>
          </div>

          {caseStudy.stack && (
            <div>
              <h2 className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                Stack
              </h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {caseStudy.stack.map((s) => (
                  <Badge key={s} tone="pine">
                    {s}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-12">
          <Button href="/projects" variant="secondary">
            ← Back to all projects
          </Button>
        </div>
      </div>
    </Container>
  );
}
