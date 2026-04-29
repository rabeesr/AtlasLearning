import type {
  ConceptVariant,
  NavGroup,
  PlaceholderPageMeta,
  ThemeTokens,
  WorkbenchNavItem,
} from "@/types/ui";
import type { CurriculumData, TopicContent } from "@/types/domain";

const defaultMissionControlTokens: ThemeTokens = {
  background: "#07111f",
  backgroundAlt: "#0d1c31",
  panel: "rgba(12, 24, 42, 0.88)",
  panelAlt: "rgba(18, 34, 57, 0.92)",
  panelMuted: "rgba(109, 148, 196, 0.12)",
  border: "rgba(113, 171, 245, 0.18)",
  borderStrong: "rgba(113, 171, 245, 0.38)",
  text: "#edf4ff",
  textMuted: "#98abc9",
  accent: "#6de2ff",
  accentStrong: "#b1f577",
  accentSoft: "rgba(109, 226, 255, 0.16)",
  success: "#5cf2b5",
  warning: "#ffba5c",
  danger: "#ff7b7b",
  shadow: "0 24px 80px rgba(2, 10, 24, 0.48)",
  glow: "0 0 0 1px rgba(109, 226, 255, 0.08), 0 0 42px rgba(109, 226, 255, 0.14)",
  displayFont: "\"Avenir Next\", \"Segoe UI\", sans-serif",
  bodyFont: "\"Avenir Next\", \"Trebuchet MS\", sans-serif",
  monoFont: "\"SFMono-Regular\", \"Menlo\", monospace",
  radius: "24px",
  radiusLarge: "34px",
  strokeWidth: "1px",
};

export const learnerTheme = defaultMissionControlTokens;

export const conceptVariants: ConceptVariant[] = [
  {
    slug: "research-atelier",
    name: "Research Atelier",
    tagline: "Warm editorial science for long-form concentration.",
    description:
      "A refined reading room for deep study, pairing laboratory seriousness with human warmth.",
    tokens: {
      background: "#f3eadf",
      backgroundAlt: "#e7dccf",
      panel: "rgba(255, 249, 241, 0.84)",
      panelAlt: "rgba(248, 240, 230, 0.96)",
      panelMuted: "rgba(87, 61, 44, 0.08)",
      border: "rgba(90, 67, 49, 0.14)",
      borderStrong: "rgba(90, 67, 49, 0.28)",
      text: "#33251b",
      textMuted: "#786251",
      accent: "#0c6b63",
      accentStrong: "#8d4d2f",
      accentSoft: "rgba(12, 107, 99, 0.12)",
      success: "#337c5d",
      warning: "#a66a2a",
      danger: "#9d4a4a",
      shadow: "0 26px 60px rgba(74, 53, 39, 0.12)",
      glow: "0 0 0 1px rgba(255,255,255,0.2)",
      displayFont: "\"Iowan Old Style\", \"Palatino Linotype\", serif",
      bodyFont: "\"Baskerville\", Georgia, serif",
      monoFont: "\"SFMono-Regular\", \"Menlo\", monospace",
      radius: "26px",
      radiusLarge: "36px",
      strokeWidth: "1px",
    },
  },
  {
    slug: "mission-control",
    name: "Mission Control",
    tagline: "Operational intelligence with visible system state.",
    description:
      "A high-agency command deck that makes learning feel like piloting a live scientific program.",
    tokens: defaultMissionControlTokens,
  },
  {
    slug: "museum-of-ideas",
    name: "Museum of Ideas",
    tagline: "Spatial, contemplative, concept-forward curation.",
    description:
      "An elegant gallery for thought, designed around conceptual adjacency and slow intellectual movement.",
    tokens: {
      background: "#e7ece8",
      backgroundAlt: "#dbe4de",
      panel: "rgba(249, 251, 248, 0.9)",
      panelAlt: "rgba(236, 241, 237, 0.95)",
      panelMuted: "rgba(38, 63, 57, 0.08)",
      border: "rgba(52, 75, 69, 0.14)",
      borderStrong: "rgba(52, 75, 69, 0.28)",
      text: "#22312e",
      textMuted: "#647572",
      accent: "#2a7a74",
      accentStrong: "#8d7a45",
      accentSoft: "rgba(42, 122, 116, 0.12)",
      success: "#438764",
      warning: "#9a7c35",
      danger: "#995e5e",
      shadow: "0 24px 72px rgba(46, 63, 58, 0.12)",
      glow: "0 0 0 1px rgba(255,255,255,0.24)",
      displayFont: "\"Didot\", \"Bodoni 72\", serif",
      bodyFont: "\"Hoefler Text\", Georgia, serif",
      monoFont: "\"Courier\", monospace",
      radius: "30px",
      radiusLarge: "42px",
      strokeWidth: "1px",
    },
  },
  {
    slug: "industrial-schematic",
    name: "Industrial Schematic",
    tagline: "Blueprint precision with technical rigor.",
    description:
      "A drafting-table system with orthogonal grids, engineered typography, and disciplined signal color.",
    tokens: {
      background: "#dfe8ef",
      backgroundAlt: "#cfd9e2",
      panel: "rgba(244, 248, 252, 0.9)",
      panelAlt: "rgba(233, 239, 245, 0.98)",
      panelMuted: "rgba(24, 54, 88, 0.08)",
      border: "rgba(23, 55, 90, 0.18)",
      borderStrong: "rgba(23, 55, 90, 0.38)",
      text: "#10263d",
      textMuted: "#52677c",
      accent: "#1267b2",
      accentStrong: "#e56f20",
      accentSoft: "rgba(18, 103, 178, 0.12)",
      success: "#1f7c65",
      warning: "#cf7f1f",
      danger: "#bf4f4f",
      shadow: "0 24px 60px rgba(32, 56, 80, 0.14)",
      glow: "0 0 0 1px rgba(18, 103, 178, 0.08)",
      displayFont: "\"DIN Alternate\", \"Arial Narrow\", sans-serif",
      bodyFont: "\"Gill Sans\", \"Trebuchet MS\", sans-serif",
      monoFont: "\"IBM Plex Mono\", \"Menlo\", monospace",
      radius: "18px",
      radiusLarge: "24px",
      strokeWidth: "1px",
    },
  },
];

export const learnerNavGroups: NavGroup[] = [
  {
    id: "learn",
    label: "Learn",
    description: "Stay oriented in the robotics curriculum and enter the next topic with intent.",
    items: [
      { href: "/", label: "Dashboard", description: "Whole-domain progress, pillars, and blocked topics." },
      { href: "/graph", label: "Knowledge Graph", description: "Dependency view for unlock planning." },
      { href: "/topics/linear-algebra-robotics", label: "Topic Hub", description: "Consistent learn, quiz, challenge, review flow." },
    ],
  },
  {
    id: "practice",
    label: "Practice",
    description: "Train across the curriculum instead of hiding practice inside one topic.",
    items: [
      { href: "/practice/quizzes", label: "Quiz Center", description: "Topic and pillar filtered retrieval practice." },
      { href: "/practice/challenges", label: "Challenge Center", description: "Applied exercises with readiness visibility." },
    ],
  },
  {
    id: "review",
    label: "Review",
    description: "Catch decay early and schedule the smallest useful repair loop.",
    items: [
      {
        href: "/review/spaced-repetition",
        label: "Review Center",
        description: "Decaying topics and spaced repetition queue.",
      },
    ],
  },
];

export const workbenchNavItems: WorkbenchNavItem[] = [
  {
    href: "/workbench",
    label: "Workbench",
    description: "Ingestion, parser health, docs, and implementation scaffolding.",
  },
  {
    href: "/workbench/concepts",
    label: "Concept Lab",
    description: "Compare the flagship screens across visual systems.",
  },
  {
    href: "/workbench/docs/curriculum-seeding-tracker",
    label: "Curriculum Tracker",
    description: "Roadmap and content seeding status.",
  },
  {
    href: "/workbench/docs/build-progress-tracker",
    label: "Build Tracker",
    description: "Engineering progress notes.",
  },
];

export const placeholderPages: PlaceholderPageMeta[] = [
  {
    href: "/practice/challenges",
    title: "Challenge Deck",
    eyebrow: "Practice",
    journey: "Practice",
    purpose: "Stage domain problems that force transfer, not just recall.",
    whyItMatters: "Learning hard material requires friction that resembles real technical work.",
    inputs: ["Topic selection and target difficulty", "Prerequisite graph state", "Recent errors and weak spots"],
    outputs: ["Challenge runs with solution traces", "Scored reflections", "Links back to topic repair work"],
    comingNext: ["Timed challenge templates", "Attempt review heatmaps", "Instructor-calibrated rubrics"],
    readiness: "Scaffold ready for attempt engine",
    related: [
      { href: "/dashboard", label: "Return to Dashboard" },
      { href: "/practice/quizzes", label: "Open Quiz Center" },
      { href: "/topics/linear-algebra-robotics", label: "Inspect a Topic Brief" },
    ],
  },
  {
    href: "/practice/quizzes",
    title: "Quiz Center",
    eyebrow: "Practice",
    journey: "Practice",
    purpose: "Run compact retrieval checks across active and decaying topics.",
    whyItMatters: "Fast feedback loops reveal whether understanding survives outside of reading mode.",
    inputs: ["Current topic queue", "Question bank coverage", "Desired session length"],
    outputs: ["Score snapshots", "Question-level misses", "Review queue recommendations"],
    comingNext: ["Adaptive quiz assembly", "Distractor analysis", "Difficulty calibration by topic"],
    readiness: "Question plumbing stubbed in the repository layer",
    related: [
      { href: "/review/spaced-repetition", label: "Review Queue" },
      { href: "/practice/challenges", label: "Challenge Deck" },
      { href: "/graph", label: "Knowledge Graph" },
    ],
  },
  {
    href: "/practice/capstones",
    title: "Capstone Studio",
    eyebrow: "Practice",
    journey: "Practice",
    purpose: "Assemble multi-week synthesis projects that integrate several topic families.",
    whyItMatters: "Capstones turn topic completion into evidence of operational mastery.",
    inputs: ["Target capability profile", "Available source materials", "Milestones and evaluation criteria"],
    outputs: ["Project briefs", "Milestone checklists", "Portfolio artifacts and retrospectives"],
    comingNext: ["Milestone sequencing", "Mentor review hooks", "Artifact publishing workflow"],
    readiness: "Architecture placeholder with delivery milestones defined",
    related: [
      { href: "/career/tools", label: "Career Tools" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/research/paper-reader", label: "Paper Reader" },
    ],
  },
  {
    href: "/practice/simulator",
    title: "Scenario Simulator",
    eyebrow: "Practice",
    journey: "Practice",
    purpose: "Rehearse system behavior in a guided environment before live implementation.",
    whyItMatters: "Simulation creates a bridge between abstract theory and operational decision-making.",
    inputs: ["Scenario templates", "State variables", "Success constraints and failure modes"],
    outputs: ["Decision logs", "Outcome states", "Intervention suggestions"],
    comingNext: ["Robotics control scenarios", "Branching decision trees", "State rewind and annotation"],
    readiness: "Roadmap placeholder awaiting scenario schema",
    related: [
      { href: "/practice/challenges", label: "Challenge Deck" },
      { href: "/review/analytics", label: "Progress Analytics" },
      { href: "/topics/linear-algebra-robotics", label: "Topic Deep Dive" },
    ],
  },
  {
    href: "/review/spaced-repetition",
    title: "Spaced Repetition Queue",
    eyebrow: "Review",
    journey: "Review",
    purpose: "Surface what is about to decay and schedule the minimum effective review.",
    whyItMatters: "Retention compounds only when the system can detect forgetting before it becomes drift.",
    inputs: ["Topic proficiency scores", "Last review timestamps", "Recall outcomes"],
    outputs: ["Priority queue", "Session batching", "Decay alerts and rescheduling"],
    comingNext: ["Leitner-style scheduling", "Memory confidence calibration", "Cross-topic bundle review"],
    readiness: "Progress repository can feed the queue once review events exist",
    related: [
      { href: "/review/daily-briefing", label: "Daily Briefing" },
      { href: "/review/analytics", label: "Progress Analytics" },
      { href: "/practice/quizzes", label: "Quiz Center" },
    ],
  },
  {
    href: "/review/daily-briefing",
    title: "Daily Briefing",
    eyebrow: "Review",
    journey: "Review",
    purpose: "Deliver a concise SMS or digest that tells the learner exactly what to do next.",
    whyItMatters: "A serious learning system should compete on consistency, not just content depth.",
    inputs: ["Timezone and availability", "Active goals", "Review urgency and unfinished sessions"],
    outputs: ["SMS preferences", "Briefing templates", "Daily action sequence"],
    comingNext: ["Quiet hours", "Escalation rules", "Morning and evening briefing variants"],
    readiness: "SMS provider abstraction exists and can be wired into preferences",
    related: [
      { href: "/review/spaced-repetition", label: "Spaced Repetition" },
      { href: "/workbench", label: "Workbench" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    href: "/review/analytics",
    title: "Progress Analytics",
    eyebrow: "Review",
    journey: "Review",
    purpose: "Show depth, retention, and momentum rather than vanity completion counts.",
    whyItMatters: "Learners need operational visibility into where they are strong, shallow, or drifting.",
    inputs: ["Progress events", "Quiz outcomes", "Review history and topic density"],
    outputs: ["Retention curves", "Coverage gaps", "Suggested recovery plans"],
    comingNext: ["Topic decay maps", "Time-to-mastery estimates", "Learning streak diagnostics"],
    readiness: "Dashboard metrics prepared for later analytics expansion",
    related: [
      { href: "/dashboard", label: "Dashboard" },
      { href: "/graph", label: "Knowledge Graph" },
      { href: "/review/spaced-repetition", label: "Spaced Repetition" },
    ],
  },
  {
    href: "/research/chat-tutor",
    title: "Chat Tutor",
    eyebrow: "Research",
    journey: "Research",
    purpose: "Offer just-in-time explanations that stay grounded in the curriculum graph.",
    whyItMatters: "A tutor becomes useful when it knows the learner's current frontier and evidence base.",
    inputs: ["Learner question", "Topic context", "Approved notes, docs, and source material"],
    outputs: ["Clarifications", "Targeted examples", "Escalations to primary sources"],
    comingNext: ["Context-aware prompts", "Citation mode", "Session memory by topic"],
    readiness: "AI provider abstraction is present; orchestration still needs product logic",
    related: [
      { href: "/research/paper-reader", label: "Paper Reader" },
      { href: "/research/textbook-mode", label: "Textbook Mode" },
      { href: "/topics/linear-algebra-robotics", label: "Topic Deep Dive" },
    ],
  },
  {
    href: "/research/paper-reader",
    title: "Paper Reader",
    eyebrow: "Research",
    journey: "Research",
    purpose: "Read technical papers with scaffolding for concepts, equations, and citations.",
    whyItMatters: "Primary-source fluency is where serious learners separate from summary consumers.",
    inputs: ["PDF or parsed source", "Active topic annotations", "Equation and reference extraction"],
    outputs: ["Annotated reading sessions", "Concept cross-links", "Reading-based quiz seeds"],
    comingNext: ["Citation graph sidecar", "Equation focus mode", "Source-to-topic linking tools"],
    readiness: "Ingestion registry already tracks source manifests needed for this surface",
    related: [
      { href: "/workbench", label: "Workbench" },
      { href: "/research/chat-tutor", label: "Chat Tutor" },
      { href: "/research/textbook-mode", label: "Textbook Mode" },
    ],
  },
  {
    href: "/research/textbook-mode",
    title: "Textbook Mode",
    eyebrow: "Research",
    journey: "Research",
    purpose: "Present long-form study material with navigable objectives, examples, and checkpoints.",
    whyItMatters: "Deep technical learning still depends on sustained reading, not only fragmented drills.",
    inputs: ["Structured chapters", "Learning objectives", "Embedded examples and prompts"],
    outputs: ["Reading sessions", "Checkpoint responses", "Topic-linked notes"],
    comingNext: ["Chapter outlines", "Inline checkpoint questions", "Glossary side rails"],
    readiness: "Topic content contracts support structured reading expansion",
    related: [
      { href: "/research/paper-reader", label: "Paper Reader" },
      { href: "/dashboard", label: "Dashboard" },
      { href: "/topics/linear-algebra-robotics", label: "Topic Deep Dive" },
    ],
  },
  {
    href: "/career/interview-prep",
    title: "Interview Prep",
    eyebrow: "Career",
    journey: "Career",
    purpose: "Translate domain mastery into rehearsable interview narratives and problem sets.",
    whyItMatters: "Learners need an explicit bridge from technical study to career leverage.",
    inputs: ["Target role profile", "Topic mastery map", "Mock interview prompts"],
    outputs: ["Question banks", "Narrative briefs", "Follow-up study prescriptions"],
    comingNext: ["Role-specific drill packs", "Whiteboard mode", "Answer scoring rubrics"],
    readiness: "Career path placeholder ready for competency mapping",
    related: [
      { href: "/career/tools", label: "Career Tools" },
      { href: "/practice/capstones", label: "Capstone Studio" },
      { href: "/review/analytics", label: "Progress Analytics" },
    ],
  },
  {
    href: "/career/tools",
    title: "Career Tools",
    eyebrow: "Career",
    journey: "Career",
    purpose: "Package learning outputs into artifacts useful for applications and portfolio proof.",
    whyItMatters: "If the product ends at comprehension, it misses the downstream value of mastery.",
    inputs: ["Capstone artifacts", "Skill graph", "Role goals and application materials"],
    outputs: ["Portfolio snippets", "Application-tailored evidence", "Readiness checklists"],
    comingNext: ["Artifact export", "Resume claim verification", "Portfolio assembly helpers"],
    readiness: "Roadmap surface ready for artifact inventory wiring",
    related: [
      { href: "/career/interview-prep", label: "Interview Prep" },
      { href: "/practice/capstones", label: "Capstone Studio" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
];

export function findSampleTopic(curriculum: CurriculumData, topicContent: TopicContent[]) {
  const contentSlugs = new Set(topicContent.map((entry) => entry.slug));
  return (
    curriculum.topics.find((topic) => contentSlugs.has(topic.slug)) ??
    curriculum.topics.find((topic) => topic.parentSlug !== null) ??
    curriculum.topics[0]
  );
}

export function getConceptVariant(slug: string) {
  return conceptVariants.find((variant) => variant.slug === slug) ?? null;
}

export function getPlaceholderMeta(href: string) {
  return placeholderPages.find((page) => page.href === href) ?? null;
}

export const conceptTopicSampleFallback = "linear-algebra-robotics";
