import type { ExperienceItem } from "@/types/content";

// PLACEHOLDER: dates are approximate — tighten them up and add real
// company/role names once you're ready to name them.
export const experience: ExperienceItem[] = [
  {
    id: "frontend-fundamentals",
    role: "Frontend fundamentals",
    org: "Self-taught, guided courses",
    start: "2023-06",
    end: "2023-12",
    summary:
      "Learned core web fundamentals and moved into component-based development with React.",
    tags: ["React", "JavaScript"],
    isPlaceholder: true,
  },
  {
    id: "challenge-series",
    role: "Self-directed practice",
    org: "Daily build challenges",
    start: "2024-01",
    end: "present",
    summary:
      "Working through structured daily coding challenges — UI clones, small games, and tools — publishing every rep to GitHub.",
    tags: ["JavaScript", "HTML/CSS", "DOM"],
    isPlaceholder: true,
  },
  {
    id: "fullstack-team-projects",
    role: "Full-stack development",
    org: "Team projects, production systems",
    start: "2024-06",
    end: "present",
    summary:
      "Building and maintaining full-stack web applications — React/Next.js frontends, Python/FastAPI backends, cloud integrations, and CI/CD — as part of a team.",
    tags: ["React", "Next.js", "FastAPI", "Azure"],
    isPlaceholder: true,
  },
];
