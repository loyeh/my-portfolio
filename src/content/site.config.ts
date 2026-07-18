import type { SiteConfig } from "@/types/content";

// PLACEHOLDER: swap tagline/role copy for your own voice whenever you're ready.
export const siteConfig: SiteConfig = {
  name: "Ahmad Asadi Looyeh",
  role: "Full-Stack Developer",
  tagline: "Shipping full-stack, logging the practice in public.",
  githubUsername: "loyeh",
  contactEmail: "asadi_loyeh@yahoo.com",
  isPlaceholder: {
    bio: true,
    resume: true,
    avatar: true,
  },
  socials: [
    { label: "GitHub", url: "https://github.com/loyeh", icon: "github" },
    { label: "Email", url: "mailto:asadi_loyeh@yahoo.com", icon: "mail" },
  ],
  nav: [
    { label: "About", href: "/#about" },
    { label: "Skills", href: "/#skills" },
    { label: "Projects", href: "/projects" },
    { label: "Experience", href: "/#experience" },
    { label: "Blog", href: "/blog" },
    { label: "Resume", href: "/resume" },
    { label: "Contact", href: "/#contact" },
  ],
};
