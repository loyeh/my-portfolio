import { skills } from "@/content/skills";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { Badge } from "@/components/ui/badge";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export function Skills() {
  return (
    <section id="skills" className="border-b border-line py-24 md:py-32">
      <Container>
        <SectionHeading
          eyebrow="Toolbox"
          title="What I reach for"
          subtitle="A working set, not a résumé keyword dump — grouped by how I actually use it."
        />

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {skills.map((group, i) => (
            <RevealOnScroll key={group.category} delay={i * 0.05}>
              <div className="rounded-md border border-line bg-card p-5">
                <h3 className="font-mono text-xs uppercase tracking-wide text-brass">
                  {group.category}
                </h3>
                <div className="mt-4 flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <Badge key={item}>{item}</Badge>
                  ))}
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </Container>
    </section>
  );
}
