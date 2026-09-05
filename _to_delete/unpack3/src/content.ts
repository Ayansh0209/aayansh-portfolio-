export const profile = {
  name: "Aayansh Singh",
  role: "Full-Stack Developer",
  location: "Noida, India",
  email: "ayansh0209@gmail.com",
  status: "Available for work",
  headline: { left: ["Mapping", "Systems"], right: ["Shipping", "Tools"] },
  intro:
    "I'm a computer science student in Noida who builds software end to end. Most of what I make is developer tooling — dependency graphs, execution tracers, editor extensions — the kind of thing that makes a large unfamiliar codebase legible.",
  intro2:
    "I work mainly in TypeScript, React and Node, with a C++ background that keeps pulling me back toward systems work. I care about taking a problem from a rough idea to something deployed that people actually use, and about the parts that usually get skipped: performance, accessibility, and knowing when motion earns its place.",
};

export const links = {
  github: "https://github.com/Ayansh0209",
  linkedin: "https://www.linkedin.com/in/aayansh-singh-9354842b9/",
  email: "mailto:ayansh0209@gmail.com",
};

/** the 3D form the left cell of the work frame morphs to for this project */
export type OrbShape =
  | "graph"
  | "knot"
  | "lattice"
  | "sphere"
  | "globe"
  | "grid";

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

const thumbs = (prefix: string) =>
  Array.from({ length: 8 }, (_, i) => `/work/${prefix}-t${i + 1}.jpg`);

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
    thumbs: thumbs("codemap"),
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
    thumbs: thumbs("iat"),
    mobileImage: "/work/iat-portrait.jpg",
    tint: ["#7c6a52", "#241f1a"],
  },
  {
    index: "03",
    name: "This Portfolio",
    field: "WebGL · Interface",
    title: "The site you are looking at",
    quote: "Motion that earns its place.",
    blurb:
      "A single scrolling page with a WebGL hero, a pinned project carousel, and live product demos in place of screenshots.",
    detail:
      "No animation library — the inertial scroll, reveals and pinned carousel are hand-rolled. The hero is a point cloud morphing between generated forms and a portrait sampled from a photograph.",
    stack: ["Next.js", "TypeScript", "Three.js", "GLSL", "Tailwind"],
    rail: ["NX", "TS", "3JS", "GL", "TW"],
    facts: [
      { label: "Dependencies", value: "No animation library" },
      { label: "Accessibility", value: "Reduced-motion aware" },
    ],
    repo: "https://github.com/Ayansh0209",
    shape: "sphere",
    image: "/work/folio-hero.jpg",
    thumbs: thumbs("folio"),
    mobileImage: "/work/folio-portrait.jpg",
    tint: ["#9a7f63", "#201c19"],
  },
  {
    index: "04",
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
  {
    index: "05",
    name: "E-Commerce Platform",
    field: "Full-Stack · Commerce",
    title: "A fashion storefront, end to end",
    quote: "The whole commercial path, not just the shopfront.",
    blurb:
      "A fashion and clothing storefront with the full commercial path built out — authentication, cart and wishlist, payments, order tracking and an admin dashboard.",
    detail:
      "Next.js and React on the front with Redux Toolkit for state and Firebase for auth, over an Express and MongoDB API. Razorpay handles payments; the Shiprocket API drives real-time order tracking.",
    stack: ["Next.js", "React", "Redux", "Express", "MongoDB", "Firebase"],
    rail: ["NX", "RE", "RX", "EX", "MG", "FB"],
    facts: [
      { label: "Payments", value: "Razorpay" },
      { label: "Fulfilment", value: "Shiprocket tracking" },
    ],
    repo: "https://github.com/Ayansh0209/E-commerce-website",
    shape: "grid",
    image: "/work/ecom-hero.jpg",
    thumbs: thumbs("ecom"),
    mobileImage: "/work/ecom-portrait.jpg",
    tint: ["#a8794f", "#2a1f18"],
  },
  {
    index: "06",
    name: "Geospatial Risk Mapping",
    field: "Team Project · ML",
    title: "Predicting disease risk across a map",
    quote: "Where the risk is, before it arrives.",
    blurb:
      "A team project mapping geospatial disease risk, pairing sequence models over time with a browser client for exploring the predictions.",
    detail:
      "Python pipelines carry the modelling — an LSTM stage over temporal sequences, a GAN stage for augmentation, SMOTE for class imbalance — served to a Vite and React client through a Python API.",
    stack: ["Python", "Jupyter", "LSTM", "GAN", "React", "Vite"],
    rail: ["PY", "JP", "ML", "RE", "VI"],
    facts: [
      { label: "Role", value: "Team project" },
      { label: "Modelling", value: "LSTM · GAN · SMOTE" },
    ],
    repo: "https://github.com/DronRajModi/Geospatial_risk_mapping",
    shape: "globe",
    tint: ["#6f7a63", "#1b1f1a"],
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
  "C++",
  "TypeScript",
  "JavaScript",
  "React",
  "Next.js",
  "Node",
  "Express",
  "Tailwind",
  "MongoDB",
  "Redis",
  "Python",
  "SQL",
  "Docker",
  "Git",
] as const;
