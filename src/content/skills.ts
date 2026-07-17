import type { SkillGroup } from "@/types/content";

export const skills: SkillGroup[] = [
  {
    category: "Languages",
    items: ["JavaScript", "TypeScript", "Python", "PHP", "SQL"],
  },
  {
    category: "Frontend",
    items: ["React", "Next.js", "Redux Toolkit", "Tailwind CSS", "Radix UI", "React Hook Form"],
  },
  {
    category: "Backend",
    items: ["FastAPI", "Node.js", "Express", "REST APIs", "WebSockets"],
  },
  {
    category: "Data",
    items: ["PostgreSQL", "MongoDB", "SQL Server", "SQLAlchemy", "Drizzle ORM"],
  },
  {
    category: "Cloud & DevOps",
    items: ["Azure", "Docker", "CI/CD", "Sentry"],
  },
  {
    category: "Testing & Tools",
    items: ["Playwright", "Jest", "pytest", "Git", "Claude Code"],
  },
];
