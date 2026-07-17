import { siteConfig } from "@/content/site.config";
import { projectOverrides, FEATURED_PROJECT_COUNT } from "@/content/projects.config";
import type { CuratedProject, GithubRepo } from "@/types/content";

const GITHUB_API = "https://api.github.com";

function githubHeaders(): HeadersInit {
  const headers: HeadersInit = { Accept: "application/vnd.github+json" };
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  return headers;
}

async function fetchRepos(): Promise<GithubRepo[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/users/${siteConfig.githubUsername}/repos?per_page=100&sort=pushed`,
      {
        headers: githubHeaders(),
        next: { revalidate: 3600, tags: ["github-repos"] },
      }
    );

    if (!res.ok) return [];
    return (await res.json()) as GithubRepo[];
  } catch {
    return [];
  }
}

function titleCase(name: string) {
  return name
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function slugForRepo(name: string) {
  return name.toLowerCase();
}

export async function getCuratedProjects(): Promise<CuratedProject[]> {
  const repos = await fetchRepos();
  const overrideMap = new Map(projectOverrides.map((o) => [o.repoName, o]));

  const eligible = repos.filter((repo) => !repo.fork && !repo.archived);

  const curated: CuratedProject[] = eligible
    .map((repo) => {
      const override = overrideMap.get(repo.name);
      if (override?.excluded) return null;

      const project: CuratedProject = {
        repo,
        title: override?.displayTitle ?? titleCase(repo.name),
        tagline: override?.tagline ?? repo.description ?? "No description yet — see the repo for details.",
        pinned: override?.pinned ?? false,
        order: override?.order ?? Number.MAX_SAFE_INTEGER,
        slug: slugForRepo(repo.name),
        caseStudy: override?.caseStudy,
      };
      return project;
    })
    .filter((p): p is CuratedProject => p !== null);

  curated.sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
    if (a.pinned && b.pinned) return a.order - b.order;
    if (a.repo.stargazers_count !== b.repo.stargazers_count) {
      return b.repo.stargazers_count - a.repo.stargazers_count;
    }
    return new Date(b.repo.pushed_at).getTime() - new Date(a.repo.pushed_at).getTime();
  });

  return curated;
}

export async function getFeaturedProjects(): Promise<CuratedProject[]> {
  const all = await getCuratedProjects();
  return all.slice(0, FEATURED_PROJECT_COUNT);
}

export async function getProjectBySlug(slug: string): Promise<CuratedProject | null> {
  const all = await getCuratedProjects();
  return all.find((p) => p.slug === slug) ?? null;
}

export async function getCaseStudySlugs(): Promise<string[]> {
  return projectOverrides.filter((o) => o.caseStudy).map((o) => slugForRepo(o.repoName));
}

export async function getLatestActivity(): Promise<GithubRepo | null> {
  const repos = await fetchRepos();
  const active = repos.filter((r) => !r.fork).sort(
    (a, b) => new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
  );
  return active[0] ?? null;
}

export async function getRepoLanguages(repoName: string): Promise<string[]> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${siteConfig.githubUsername}/${repoName}/languages`,
      { headers: githubHeaders(), next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, number>;
    return Object.keys(data);
  } catch {
    return [];
  }
}

export async function getRepoReadme(repoName: string): Promise<string | null> {
  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${siteConfig.githubUsername}/${repoName}/readme`,
      {
        headers: { ...githubHeaders(), Accept: "application/vnd.github.raw+json" },
        next: { revalidate: 3600 },
      }
    );
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}
