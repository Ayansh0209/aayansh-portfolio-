export const profile = {
  name: "Aayansh Singh",
  role: "Full-Stack Developer",
  location: "Noida, India",
  email: "ayansh0209@gmail.com",
  status: "Available for work",
  headline: { left: ["Mapping", "Systems"], right: ["Shipping", "Tools"] },
  intro:
    "I build software end to end — from graph-based developer tooling to interactive learning platforms. Strongest in TypeScript, React and Node, with a C++ background that keeps pulling me toward developer tooling and systems work. I like taking a problem from a rough idea to something deployed that people actually use.",
};

export const links = {
  github: "https://github.com/Ayansh0209",
  linkedin: "https://www.linkedin.com/in/aayansh-singh-9354842b9/",
  wellfound: "https://wellfound.com/u/aayansh-singh-4",
  email: "mailto:ayansh0209@gmail.com",
};

/** which 3D form the left cell morphs to for this project */
export type OrbShape = "graph" | "knot" | "lattice";

export type Project = {
  index: string;
  name: string;
  field: string;
  title: string;
  quote: string;
  /** one-line summary — first paragraph in the description cell */
  blurb: string;
  /** the build detail — second paragraph */
  detail: string;
  stack: string[];
  /** short codes for the vertical tech rail, max 6 */
  rail: string[];
  facts: { label: string; value: string }[];
  live?: string;
  repo: string;
  shape: OrbShape;
  /** a live, animated representation of what the product actually does */
  demo?: "graph" | "trace";
  /** drop files in /public/work and reference them here; all optional */
  image?: string;
  thumbs?: string[];
  mobileImage?: string;
  tint: [string, string];
};

export const projects: Project[] = [
  {
    index: "01",
    name: "CodeMap AI",
    field: "Developer Tooling",
    title: "Dependency graphs for unfamiliar codebases",
    quote: "Understand the codebase before you change it.",
    blurb:
      "An AI platform that generates dependency graphs of GitHub repositories, so a developer can understand an unfamiliar codebase quickly.",
    detail:
      "An internal retrieval API feeds the model only the files connected through imports and function relationships — cutting token usage and inference cost while improving accuracy. An issue-mapping system surfaces the files relevant to a given GitHub issue.",
    stack: ["TypeScript", "Next.js", "Express", "Redis", "Gemini API"],
    rail: ["TS", "NX", "EX", "RD", "AI"],
    facts: [
      { label: "GitHub stars", value: "52" },
      { label: "Month one", value: "744 visitors · 1,127 views" },
    ],
    live: "https://code-map-ai-mu.vercel.app/",
    repo: "https://github.com/Ayansh0209/CodeMap-Ai",
    shape: "graph",
    demo: "graph",
    image: "/work/codemap-hero.jpg",
    thumbs: [
      "/work/codemap-t1.jpg",
      "/work/codemap-t2.jpg",
      "/work/codemap-t3.jpg",
      "/work/codemap-t4.jpg",
      "/work/codemap-t5.jpg",
      "/work/codemap-t6.jpg",
      "/work/codemap-t7.jpg",
      "/work/codemap-t8.jpg",
    ],
    mobileImage: "/work/codemap-portrait.jpg",
    tint: ["#b08052", "#3a2b1e"],
  },
  {
    index: "02",
    name: "Interactive Algorithm Tutor",
    field: "Education · Runtime",
    title: "A multi-language execution tracer",
    quote: "Watch the code think.",
    blurb:
      "Runs your code in Python, Java or C++ and captures a full step-by-step trace, then renders the visualization that matches the data structure it found.",
    detail:
      "Traces come from sys.settrace, the Java Debug Interface and gdb. A React/Vite frontend talks to a Node gateway that fans out to three language workers, with a timeline scrubber, play/pause/speed and a key-steps-only mode.",
    stack: ["React", "Vite", "Node", "Python", "Java", "C++"],
    rail: ["RE", "VI", "ND", "PY", "JV", "C++"],
    facts: [
      { label: "Content", value: "70+ articles · 40+ visualizations" },
      { label: "Infra", value: "Linux VM · Caddy · pm2" },
    ],
    live: "https://interactive-algorithm-tutor.vercel.app",
    repo: "https://github.com/Ayansh0209/Interactive-algorithm-tutor-version-2",
    shape: "knot",
    demo: "trace",
    image: "/work/iat-hero.jpg",
    thumbs: [
      "/work/iat-t1.jpg",
      "/work/iat-t2.jpg",
      "/work/iat-t3.jpg",
      "/work/iat-t4.jpg",
      "/work/iat-t5.jpg",
      "/work/iat-t6.jpg",
      "/work/iat-t7.jpg",
      "/work/iat-t8.jpg",
    ],
    mobileImage: "/work/iat-portrait.jpg",
    tint: ["#7c6a52", "#241f1a"],
  },
  {
    index: "03",
    name: "CScout",
    field: "VS Code Extension",
    title: "Static analysis, inside the editor",
    quote: "Static analysis, where you already are.",
    blurb:
      "Brings CScout static analysis into VS Code, replacing the hard-to-navigate HTML it generates by default.",
    detail:
      "Explore identifiers, dependencies, call graphs and include hierarchies across large C/C++ codebases without leaving the editor — the analysis runs where the code is already open.",
    stack: ["C++", "TypeScript", "VS Code API"],
    rail: ["C++", "TS", "VS"],
    facts: [{ label: "Target", value: "Large C/C++ codebases" }],
    repo: "https://github.com/Ayansh0209/cscout-vscode",
    shape: "lattice",
    tint: ["#5f5a52", "#1c1a18"],
  },
];

export const services = [
  {
    index: "01",
    title: "Full-stack build",
    body:
      "Idea to deployed product. API design, data modelling, auth, caching and the frontend that sits on top — shipped on Vercel or a plain Linux box behind Caddy, whichever the project actually needs.",
    tags: ["Next.js", "Express", "MongoDB", "Redis", "Docker"],
  },
  {
    index: "02",
    title: "Frontend engineering",
    body:
      "Interfaces that hold up under real data. Considered type, motion that earns its place, and the accessibility and performance work that usually gets skipped.",
    tags: ["React", "TypeScript", "Tailwind", "Three.js"],
  },
  {
    index: "03",
    title: "Developer tooling",
    body:
      "The work I keep coming back to: static analysis, runtime tracing, dependency graphs, editor extensions. Tools that make a large unfamiliar codebase legible.",
    tags: ["C++", "VS Code API", "Node", "Graph analysis"],
  },
];

export const stack = [
  { name: "C++", level: "advanced" },
  { name: "TypeScript", level: "advanced" },
  { name: "JavaScript", level: "advanced" },
  { name: "React", level: "advanced" },
  { name: "Next.js", level: "advanced" },
  { name: "Node", level: "advanced" },
  { name: "Express", level: "advanced" },
  { name: "Tailwind", level: "advanced" },
  { name: "MongoDB", level: "intermediate" },
  { name: "Redis", level: "intermediate" },
  { name: "Python", level: "intermediate" },
  { name: "SQL", level: "intermediate" },
  { name: "Docker", level: "intermediate" },
  { name: "Git", level: "advanced" },
] as const;
