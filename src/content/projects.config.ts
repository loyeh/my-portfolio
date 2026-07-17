import type { ProjectOverride } from "@/types/content";

export const FEATURED_PROJECT_COUNT = 6;

// Layer of manual curation on top of the live GitHub feed for loyeh.
// `pinned` repos are force-included and shown first (by `order`).
// `excluded` repos are hidden even if they'd otherwise qualify.
// A `caseStudy` promotes a repo from a card to a full /projects/[slug] page —
// add one by hand for any repo worth a deeper writeup.
export const projectOverrides: ProjectOverride[] = [
  {
    repoName: "my_gallery",
    pinned: true,
    order: 1,
    displayTitle: "Photo Gallery",
    tagline: "A simple, responsive photo gallery built to learn layout and DOM fundamentals.",
    caseStudy: {
      problem:
        "Early on, I wanted a project that would force me to deal with real layout problems — responsive grids, image loading, and simple filtering — instead of following a tutorial line by line.",
      approach:
        "Built a plain HTML/CSS/JavaScript gallery: a responsive grid of images, click-to-expand viewing, and simple category filtering, with no framework to lean on so I'd have to understand the DOM directly.",
      highlights: [
        "Responsive CSS grid that reflows cleanly from mobile to desktop",
        "Vanilla JS event delegation for filtering and image expansion",
        "No build tooling — a deliberate constraint to focus on fundamentals",
      ],
      stack: ["JavaScript", "HTML", "CSS"],
    },
  },
  {
    repoName: "quiz-app",
    pinned: true,
    order: 2,
    displayTitle: "Quiz App",
    tagline: "46th of 50 in a daily challenge series — a scored, multi-question quiz UI.",
  },
  {
    repoName: "insect-catch-game",
    pinned: true,
    order: 3,
    displayTitle: "Insect Catch Game",
    tagline: "50th of 50 challenge series — a small browser game with score tracking.",
  },
  {
    repoName: "password-generator",
    pinned: true,
    order: 4,
    displayTitle: "Password Generator",
    tagline: "31st of 50 challenge series — configurable secure password generation.",
  },
  {
    repoName: "drawing-app",
    pinned: true,
    order: 5,
    displayTitle: "Drawing App",
    tagline: "A canvas-based drawing tool built from a 50-day challenge series.",
  },
  {
    repoName: "dojo-blog",
    pinned: true,
    order: 6,
    displayTitle: "Dojo Blog",
    tagline: "A React blog app built while learning React fundamentals.",
  },
];
