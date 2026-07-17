import { about } from "@/content/about";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";

export function About() {
  return (
    <section id="about" className="border-b border-line py-24 md:py-32">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1fr_18rem]">
          <div>
            <SectionHeading eyebrow="About" title="Working the log" />
            <RevealOnScroll>
              <p className="text-lg leading-relaxed text-ink md:text-xl">
                {about.intro}
              </p>
              <div className="mt-6 space-y-4 text-ink-soft">
                {about.paragraphs.map((p, i) => (
                  <p key={i} className="leading-relaxed">
                    {p}
                  </p>
                ))}
              </div>
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.1}>
            <dl className="space-y-6 border-l border-line pl-6">
              {about.facts.map((fact) => (
                <div key={fact.label}>
                  <dt className="font-mono text-xs uppercase tracking-wide text-ink-soft">
                    {fact.label}
                  </dt>
                  <dd className="mt-1 text-ink">{fact.value}</dd>
                </div>
              ))}
            </dl>
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
