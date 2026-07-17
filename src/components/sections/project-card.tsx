import Link from "next/link";
import { Star, ArrowUpRight } from "lucide-react";
import type { CuratedProject } from "@/types/content";
import { Badge } from "@/components/ui/badge";
import { LogRow } from "@/components/ui/log-row";
import { timeAgo } from "@/lib/utils";

export function ProjectCard({ project }: { project: CuratedProject }) {
  const href = project.caseStudy ? `/projects/${project.slug}` : project.repo.html_url;
  const external = !project.caseStudy;

  return (
    <LogRow
      meta={
        <>
          {timeAgo(project.repo.pushed_at)}
          {project.repo.stargazers_count > 0 && (
            <span className="mt-1 flex items-center gap-1 md:justify-end">
              <Star className="h-3 w-3" /> {project.repo.stargazers_count}
            </span>
          )}
        </>
      }
    >
      <Link
        href={href}
        target={external ? "_blank" : undefined}
        rel={external ? "noreferrer" : undefined}
        className="group flex items-start justify-between gap-3 rounded-md border border-line bg-card p-5 transition-colors hover:border-brass"
      >
        <div>
          <h3 className="flex items-center gap-2 text-lg font-semibold text-ink group-hover:text-brass">
            {project.title}
          </h3>
          <p className="mt-2 text-sm text-ink-soft">{project.tagline}</p>
          {project.repo.language && (
            <div className="mt-3">
              <Badge tone="pine">{project.repo.language}</Badge>
            </div>
          )}
        </div>
        <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-ink-soft transition-colors group-hover:text-brass" />
      </Link>
    </LogRow>
  );
}
