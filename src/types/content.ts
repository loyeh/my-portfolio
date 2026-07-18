export interface SocialLink {
  label: string;
  url: string;
  icon: "github" | "linkedin" | "twitter" | "mail" | "telegram";
}

export interface SiteConfig {
  name: string;
  role: string;
  tagline: string;
  githubUsername: string;
  contactEmail: string;
  isPlaceholder: {
    bio: boolean;
    resume: boolean;
    avatar: boolean;
  };
  socials: SocialLink[];
  nav: { label: string; href: string }[];
}

export interface SkillGroup {
  category: string;
  items: string[];
}

export interface ExperienceItem {
  id: string;
  role: string;
  org: string;
  start: string;
  end: string | "present";
  summary: string;
  tags: string[];
  isPlaceholder?: boolean;
}

export interface ProjectCaseStudy {
  problem: string;
  approach: string;
  highlights: string[];
  stack?: string[];
}

export interface ProjectOverride {
  repoName: string;
  pinned?: boolean;
  order?: number;
  excluded?: boolean;
  displayTitle?: string;
  tagline?: string;
  caseStudy?: ProjectCaseStudy;
}

export interface GithubRepo {
  id: number;
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  fork: boolean;
  archived: boolean;
  stargazers_count: number;
  language: string | null;
  pushed_at: string;
  topics?: string[];
}

export interface CuratedProject {
  repo: GithubRepo;
  title: string;
  tagline: string;
  pinned: boolean;
  order: number;
  slug: string;
  caseStudy?: ProjectCaseStudy;
}

export interface BlogFrontmatter {
  title: string;
  description: string;
  date: string;
  tags?: string[];
  isPlaceholder?: boolean;
}

export interface BlogPost extends BlogFrontmatter {
  slug: string;
  content: string;
  readingTime: string;
}
