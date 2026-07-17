import type { Metadata } from "next";
import { getCuratedProjects } from "@/lib/github";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { ProjectCard } from "@/components/sections/project-card";

export const metadata: Metadata = {
  title: `Projects — ${siteConfig.name}`,
  description: "Every non-fork, non-archived repository, pulled live from GitHub.",
};

export const revalidate = 3600;

export default async function ProjectsPage() {
  const projects = await getCuratedProjects();

  return (
    <Container className="py-20 md:py-28">
      <SectionHeading
        eyebrow="Full log"
        title="All projects"
        subtitle={`${projects.length} repositories, pulled live from github.com/${siteConfig.githubUsername} — forks and archived repos excluded.`}
      />

      {projects.length > 0 ? (
        <div className="space-y-6">
          {projects.map((project) => (
            <ProjectCard key={project.repo.id} project={project} />
          ))}
        </div>
      ) : (
        <p className="font-mono text-sm text-ink-soft">
          Couldn&apos;t reach the GitHub API right now — check back shortly.
        </p>
      )}
    </Container>
  );
}
