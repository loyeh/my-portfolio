import { Mail } from "lucide-react";
import { siteConfig } from "@/content/site.config";
import { Container } from "@/components/ui/container";
import { SectionHeading } from "@/components/ui/section-heading";
import { RevealOnScroll } from "@/components/ui/reveal-on-scroll";
import { ContactForm } from "@/components/sections/contact-form";
import { GithubMark } from "@/components/ui/icons";

export function Contact() {
  return (
    <section id="contact" className="py-24 md:py-32">
      <Container>
        <div className="grid gap-12 md:grid-cols-[1fr_20rem]">
          <div>
            <SectionHeading
              eyebrow="Contact"
              title="Open a thread"
              subtitle="Have a project, a role, or just a question about how something here was built? Send a message."
            />
            <RevealOnScroll>
              <ContactForm />
            </RevealOnScroll>
          </div>

          <RevealOnScroll delay={0.1}>
            <div className="space-y-4 border-l border-line pl-6">
              <a
                href={`mailto:${siteConfig.contactEmail}`}
                className="flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-brass"
              >
                <Mail className="h-4 w-4" /> {siteConfig.contactEmail}
              </a>
              <a
                href={`https://github.com/${siteConfig.githubUsername}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-ink-soft transition-colors hover:text-brass"
              >
                <GithubMark className="h-4 w-4" /> github.com/{siteConfig.githubUsername}
              </a>
            </div>
          </RevealOnScroll>
        </div>
      </Container>
    </section>
  );
}
