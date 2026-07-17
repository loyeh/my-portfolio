import { experience } from "@/content/experience";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { LogRow } from "@/components/ui/log-row";
import { Badge } from "@/components/ui/badge";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

function formatRange(start: string, end: string) {
  const fmt = (d: string) =>
    new Date(`${d}-01`).toLocaleDateString("en-US", { year: "numeric", month: "short" });
  return `${fmt(start)} — ${end === "present" ? "present" : fmt(end)}`;
}

export function Experience() {
  return (
    <section id="experience" className="border-b border-line py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Timeline"
          title="The build log"
          subtitle="Chronological, not curated — what I was actually doing, in order."
        />

        <div className="space-y-10">
          {experience.map((item, i) => (
            <RevealOnScroll key={item.id} delay={i * 0.05}>
              <LogRow meta={formatRange(item.start, item.end)}>
                <h3 className="text-lg font-semibold text-ink">
                  {item.role} <span className="font-normal text-ink-soft">· {item.org}</span>
                </h3>
                <p className="mt-2 text-ink-soft">{item.summary}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} tone="pine">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </LogRow>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
