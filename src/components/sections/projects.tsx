import { getFeaturedProjects } from "@/lib/github";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Button } from "@/components/ui/button";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { ProjectCard } from "@/components/sections/project-card";

export async function Projects() {
  const projects = await getFeaturedProjects();

  return (
    <section id="projects" className="border-b border-line py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Projects"
          title="Recent entries"
          subtitle="Pulled live from GitHub — stars, language, and last-pushed date included, not staged."
        />

        {projects.length > 0 ? (
          <div className="space-y-6">
            {projects.map((project, i) => (
              <RevealOnScroll key={project.repo.id} delay={i * 0.04}>
                <ProjectCard project={project} />
              </RevealOnScroll>
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-ink-soft">
            Couldn&apos;t reach the GitHub API right now — check back shortly.
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="/projects" variant="secondary">
            View all projects
          </Button>
          <Button
            href={`https://github.com/${siteConfig.githubUsername}`}
            variant="ghost"
          >
            All repos on GitHub ↗
          </Button>
        </div>
      </Container>
    </section>
  );
}
