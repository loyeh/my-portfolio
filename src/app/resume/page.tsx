import type { Metadata } from "next";
import { Download } from "lucide-react";
import { siteConfig } from "@/content/site.config";
import { about } from "@/content/about";
import { skills } from "@/content/skills";
import { experience } from "@/content/experience";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: `Resume — ${siteConfig.name}`,
  description: `${siteConfig.name}'s resume and experience summary.`,
};

const RESUME_PATH = "/resume/ahmad-asadi-looyeh-resume.pdf";

export default function ResumePage() {
  const resumeAvailable = !siteConfig.isPlaceholder.resume;

  return (
    <Container className="py-20 md:py-28">
      <div className="mx-auto max-w-3xl">
        <SectionHeading
          eyebrow="Resume"
          title={siteConfig.name}
          subtitle={`${siteConfig.role} · ${siteConfig.location}`}
        />

        <div className="mb-12">
          {resumeAvailable ? (
            <Button href={RESUME_PATH} target="_blank" rel="noreferrer">
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          ) : (
            <div className="rounded-md border border-dashed border-line bg-card px-5 py-4 font-mono text-sm text-ink-soft">
              A downloadable PDF isn&apos;t ready yet — the summary below is
              current. Check back soon, or reach out directly.
            </div>
          )}
        </div>

        <div className="space-y-12 border-t border-line pt-10">
          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-brass">
              Summary
            </h2>
            <p className="mt-3 leading-relaxed text-ink">{about.intro}</p>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-brass">
              Skills
            </h2>
            <div className="mt-4 space-y-4">
              {skills.map((group) => (
                <div key={group.category}>
                  <p className="text-sm font-medium text-ink">{group.category}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {group.items.map((item) => (
                      <Badge key={item}>{item}</Badge>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-mono text-xs uppercase tracking-wide text-brass">
              Experience
            </h2>
            <div className="mt-4 space-y-6">
              {experience.map((item) => (
                <div key={item.id}>
                  <p className="text-sm font-medium text-ink">
                    {item.role} · {item.org}
                  </p>
                  <p className="font-mono text-xs text-ink-soft">
                    {item.start} — {item.end}
                  </p>
                  <p className="mt-1 text-sm text-ink-soft">{item.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
