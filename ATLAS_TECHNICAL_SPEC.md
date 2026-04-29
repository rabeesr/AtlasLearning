# ATLAS — Technical Development Specification

This document is a comprehensive technical guide for building ATLAS. It is designed to be consumed by an LLM coding assistant (e.g., Claude Code) to scaffold the project and implement each feature. Each section includes enough context, architecture decisions, and implementation details to build the feature without ambiguity.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Project Structure](#project-structure)
3. [Phase 0: Project Scaffolding](#phase-0-project-scaffolding)
4. [Phase 1: Database Schema](#phase-1-database-schema)
5. [Phase 2: Authentication](#phase-2-authentication)
6. [Phase 3: Curriculum Data Model](#phase-3-curriculum-data-model)
7. [Phase 4: Knowledge Graph UI](#phase-4-knowledge-graph-ui)
8. [Phase 5: Topic Deep-Dive Pages](#phase-5-topic-deep-dive-pages)
9. [Phase 6: Browser-Based Code Execution](#phase-6-browser-based-code-execution)
10. [Phase 7: Coding Challenge System](#phase-7-coding-challenge-system)
11. [Phase 8: Quiz System](#phase-8-quiz-system)
12. [Phase 9: Competency Dashboard](#phase-9-competency-dashboard)
13. [Phase 10: Spaced Repetition Engine](#phase-10-spaced-repetition-engine)
14. [Phase 11: SMS Nudges (Twilio)](#phase-11-sms-nudges-twilio)
15. [Phase 12: AI Chatbot](#phase-12-ai-chatbot)
16. [Phase 13: Learning Velocity Tracker](#phase-13-learning-velocity-tracker)
17. [Phase 14: Polish & Deployment](#phase-14-polish--deployment)
18. [Appendix A: Environment Variables](#appendix-a-environment-variables)
19. [Appendix B: Content Sources](#appendix-b-content-sources)

---

## Project Overview

**ATLAS** is a domain-agnostic personal learning OS. V1 launches with robotics as the first domain. The architecture must support adding new domains by swapping curriculum seed data without code changes to the platform itself.

### Tech Stack
| Layer | Technology | Why |
|-------|-----------|-----|
| Framework | Next.js (App Router) | Full-stack React, API routes, SSR/SSG |
| Styling | Tailwind CSS | Rapid UI development, utility-first |
| Database | Supabase (PostgreSQL) | Auth-compatible, real-time subscriptions, free tier |
| Auth | Clerk | Drop-in auth, session management, middleware |
| Knowledge Graph | React Flow + dagre | Native React nodes, auto-layout, MIT license |
| Code Editor | Monaco Editor (`@monaco-editor/react`) | VS Code editor in the browser, syntax highlighting, autocomplete |
| Code Execution | Pyodide (Web Worker) | CPython in WASM, NumPy/SciPy/matplotlib support, no backend needed |
| SMS | Twilio (Programmable SMS) | Outbound messages + inbound webhook for quiz replies |
| AI | Claude API (`@anthropic-ai/sdk`) | Chatbot, content generation, curriculum expansion |
| Deployment | Vercel | Zero-config Next.js hosting, serverless functions, edge network |

---

## Project Structure

```
atlas/
├── public/
│   └── pyodide/                    # (optional) self-hosted Pyodide files
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout with Clerk provider
│   │   ├── page.tsx                # Landing / redirect to dashboard
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   ├── sign-up/[[...sign-up]]/page.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx            # Competency dashboard
│   │   ├── graph/
│   │   │   └── page.tsx            # Knowledge graph view
│   │   ├── topics/
│   │   │   └── [topicId]/
│   │   │       ├── page.tsx        # Topic deep-dive page
│   │   │       ├── challenge/
│   │   │       │   └── page.tsx    # Coding challenge page
│   │   │       └── quiz/
│   │   │           └── page.tsx    # Quiz page
│   │   ├── chat/
│   │   │   └── page.tsx            # AI chatbot (also embedded in topic pages)
│   │   ├── settings/
│   │   │   └── page.tsx            # SMS preferences, notification config
│   │   └── api/
│   │       ├── sms/
│   │       │   ├── send/route.ts   # Cron-triggered: send daily SMS quiz
│   │       │   └── webhook/route.ts # Twilio inbound: receive quiz reply
│   │       ├── chat/route.ts       # Claude API streaming endpoint
│   │       ├── progress/route.ts   # Update proficiency scores
│   │       └── curriculum/route.ts # LLM curriculum generation endpoint
│   ├── components/
│   │   ├── graph/
│   │   │   ├── KnowledgeGraph.tsx  # React Flow wrapper (dynamic import, ssr: false)
│   │   │   ├── TopicNode.tsx       # Custom React Flow node component
│   │   │   └── DependencyEdge.tsx  # Custom edge with styling
│   │   ├── challenges/
│   │   │   ├── CodeEditor.tsx      # Monaco Editor wrapper
│   │   │   ├── CodeRunner.tsx      # Pyodide execution + test harness
│   │   │   └── TestResults.tsx     # Pass/fail display
│   │   ├── quiz/
│   │   │   ├── QuizCard.tsx        # Multiple choice question component
│   │   │   └── QuizResults.tsx     # Score display
│   │   ├── dashboard/
│   │   │   ├── CompetencyRadar.tsx # Proficiency visualization
│   │   │   ├── TopicStatusGrid.tsx # Topic cards with status indicators
│   │   │   └── VelocityTracker.tsx # Learning pace + projected completion
│   │   ├── chat/
│   │   │   └── ChatInterface.tsx   # Claude-powered chat UI
│   │   └── shared/
│   │       ├── Layout.tsx          # App shell with nav
│   │       └── LoadingStates.tsx   # Skeleton loaders, Pyodide loading
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # Supabase browser client
│   │   │   ├── server.ts           # Supabase server client (for API routes)
│   │   │   └── types.ts            # Generated TypeScript types from schema
│   │   ├── pyodide/
│   │   │   ├── worker.ts           # Web Worker script for Pyodide execution
│   │   │   └── bridge.ts           # Main thread <-> Worker message passing
│   │   ├── twilio/
│   │   │   └── client.ts           # Twilio send helper
│   │   ├── claude/
│   │   │   └── client.ts           # Anthropic SDK wrapper, system prompts
│   │   ├── spaced-repetition/
│   │   │   └── engine.ts           # SM-2 or custom decay algorithm
│   │   ├── curriculum/
│   │   │   ├── loader.ts           # Load and parse challenge manifests at build time
│   │   │   └── graph.ts            # Build dependency graph from topic data
│   │   └── proficiency/
│   │       └── scorer.ts           # Proficiency calculation logic
│   ├── data/
│   │   ├── domains/
│   │   │   └── robotics/
│   │   │       ├── curriculum.yaml # Full topic graph: topics, subtopics, dependencies
│   │   │       ├── topics/         # Per-topic content files
│   │   │       │   ├── control-theory.md
│   │   │       │   ├── kinematics.md
│   │   │       │   ├── perception.md
│   │   │       │   ├── path-planning.md
│   │   │       │   └── ros-fundamentals.md
│   │   │       └── challenges/     # Git-managed coding challenges
│   │   │           ├── pid-controller/
│   │   │           │   ├── manifest.yaml
│   │   │           │   ├── problem.md
│   │   │           │   ├── starter.py
│   │   │           │   ├── tests.py
│   │   │           │   └── solution.py
│   │   │           └── forward-kinematics/
│   │   │               ├── manifest.yaml
│   │   │               ├── problem.md
│   │   │               ├── starter.py
│   │   │               ├── tests.py
│   │   │               └── solution.py
│   │   └── quizzes/
│   │       └── robotics/
│   │           ├── control-theory.json   # Pre-curated MC questions
│   │           └── kinematics.json
│   └── hooks/
│       ├── usePyodide.ts           # Hook to initialize and interact with Pyodide worker
│       ├── useProgress.ts          # Hook for reading/writing user progress
│       └── useSpacedRepetition.ts  # Hook for decay calculations
├── challenges/                      # Symlink or copy — same as src/data/domains/robotics/challenges
├── supabase/
│   └── migrations/                 # SQL migration files
│       └── 001_initial_schema.sql
├── .env.local                      # Environment variables (see Appendix A)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── vercel.json
```

### Key architectural principle: Domain-agnostic design
The `src/data/domains/` directory is the only place domain-specific content lives. To add a new domain (e.g., quantum computing), create `src/data/domains/quantum-computing/` with the same structure: `curriculum.yaml`, `topics/`, `challenges/`, and corresponding quiz files. The rest of the app reads from whatever domain is active.

---

## Phase 0: Project Scaffolding

### Step 0.1: Initialize the project
```bash
npx create-next-app@latest atlas --typescript --tailwind --eslint --app --src-dir
cd atlas
```

### Step 0.2: Install core dependencies
```bash
# UI
npm install @xyflow/react dagre @types/dagre
npm install @monaco-editor/react
npm install react-markdown remark-gfm rehype-katex remark-math

# Database
npm install @supabase/supabase-js @supabase/ssr

# Auth
npm install @clerk/nextjs

# AI
npm install @anthropic-ai/sdk

# SMS
npm install twilio

# Utilities
npm install yaml gray-matter lucide-react
npm install -D @types/node
```

### Step 0.3: Configure Next.js for Pyodide
In `next.config.ts`, add headers to enable `SharedArrayBuffer` (needed for Pyodide Web Worker):
```typescript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
        ],
      },
    ];
  },
  webpack: (config) => {
    config.resolve.fallback = { fs: false, path: false };
    return config;
  },
};
```

**Important:** The `Cross-Origin-Embedder-Policy` and `Cross-Origin-Opener-Policy` headers may conflict with Clerk's auth iframes and Twilio's scripts. If so, apply these headers ONLY to the challenge pages, not globally. Test this early.

### Step 0.4: Deploy skeleton to Vercel
```bash
git init
git add .
git commit -m "Initial scaffold"
# Connect to Vercel via CLI or dashboard
vercel
```

Confirm the deployed skeleton loads before proceeding.

---

## Phase 1: Database Schema

### Supabase Tables

```sql
-- Domains (robotics, quantum computing, etc.)
CREATE TABLE domains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,           -- 'robotics'
  name TEXT NOT NULL,                   -- 'Robotics'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Topics (broad areas + subtopics, self-referencing hierarchy)
CREATE TABLE topics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  domain_id UUID REFERENCES domains(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                   -- 'control-theory'
  name TEXT NOT NULL,                   -- 'Control Theory'
  description TEXT,
  parent_topic_id UUID REFERENCES topics(id), -- NULL for broad topics, set for subtopics
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  estimated_hours NUMERIC,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(domain_id, slug)
);

-- Topic dependencies (prerequisite relationships)
CREATE TABLE topic_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  prerequisite_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  UNIQUE(topic_id, prerequisite_id)
);

-- External resources linked to topics
CREATE TABLE resources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  type TEXT CHECK (type IN ('video', 'article', 'documentation', 'course', 'book')),
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  description TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- User progress per topic
CREATE TABLE user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,                -- Clerk user ID
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  status TEXT CHECK (status IN ('locked', 'available', 'in_progress', 'completed', 'decaying')) DEFAULT 'locked',
  proficiency_score NUMERIC DEFAULT 0,  -- 0-100
  last_activity_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  decay_factor NUMERIC DEFAULT 1.0,     -- For spaced repetition
  review_interval_days INTEGER DEFAULT 1,
  next_review_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, topic_id)
);

-- Quiz questions (pre-curated multiple choice)
CREATE TABLE quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  topic_id UUID REFERENCES topics(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL,               -- ["option A", "option B", "option C", "option D"]
  correct_index INTEGER NOT NULL,       -- 0-based index into options array
  explanation TEXT,                      -- Shown after answering
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  sms_friendly BOOLEAN DEFAULT false,   -- Short enough for SMS delivery
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Quiz attempts (tracks each answer)
CREATE TABLE quiz_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  question_id UUID REFERENCES quiz_questions(id) ON DELETE CASCADE,
  selected_index INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  source TEXT CHECK (source IN ('web', 'sms')) DEFAULT 'web',
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- Challenge attempts (tracks coding challenge submissions)
CREATE TABLE challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  challenge_slug TEXT NOT NULL,         -- Maps to challenge directory name
  topic_id UUID REFERENCES topics(id),
  code_submitted TEXT NOT NULL,
  tests_passed INTEGER DEFAULT 0,
  tests_total INTEGER DEFAULT 0,
  is_passing BOOLEAN DEFAULT false,
  attempted_at TIMESTAMPTZ DEFAULT now()
);

-- SMS configuration per user
CREATE TABLE sms_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT UNIQUE NOT NULL,
  phone_number TEXT NOT NULL,
  is_enabled BOOLEAN DEFAULT true,
  send_time TIME DEFAULT '09:00',       -- Preferred time (user's local)
  timezone TEXT DEFAULT 'America/Chicago',
  frequency TEXT CHECK (frequency IN ('daily', 'weekdays', 'custom')) DEFAULT 'daily',
  custom_days JSONB,                    -- e.g., ["mon", "wed", "fri"]
  topics_filter JSONB,                  -- Optional: limit to specific topic IDs
  created_at TIMESTAMPTZ DEFAULT now()
);

-- SMS messages sent (audit log)
CREATE TABLE sms_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  question_id UUID REFERENCES quiz_questions(id),
  twilio_sid TEXT,
  sent_at TIMESTAMPTZ DEFAULT now(),
  reply_received BOOLEAN DEFAULT false,
  reply_body TEXT,
  reply_correct BOOLEAN
);
```

### Row Level Security (RLS)
Enable RLS on all tables with user data. Policies should filter on `user_id = auth.uid()` for Supabase auth, or use Clerk's user ID passed via a custom JWT claim.

**Note on Clerk + Supabase integration:** Clerk and Supabase use different auth systems. The recommended approach is to use Clerk for the frontend auth UI and session management, and pass the Clerk user ID to Supabase as a custom claim. See Clerk's docs on Supabase integration for the JWT template setup.

---

## Phase 2: Authentication

### Clerk Setup
1. Create a Clerk application at clerk.com
2. Add environment variables (see Appendix A)
3. Wrap the app in `<ClerkProvider>` in `src/app/layout.tsx`
4. Add Clerk middleware in `src/middleware.ts`:

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/sign-in(.*)', '/sign-up(.*)', '/api/sms/webhook']);

export default clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};
```

**Important:** The `/api/sms/webhook` route MUST be public — Twilio sends POST requests to it without auth. Validate the Twilio signature instead (see Phase 11).

---

## Phase 3: Curriculum Data Model

### curriculum.yaml Structure
This is the source of truth for the knowledge graph. It lives at `src/data/domains/robotics/curriculum.yaml`.

```yaml
domain:
  slug: robotics
  name: Robotics
  description: "Comprehensive robotics curriculum from fundamentals to advanced topics"

topics:
  - slug: mathematics-foundations
    name: "Mathematics Foundations"
    description: "Core math required for robotics"
    difficulty: beginner
    subtopics:
      - slug: linear-algebra-robotics
        name: "Linear Algebra for Robotics"
        description: "Vectors, matrices, transformations"
        difficulty: beginner
      - slug: calculus-robotics
        name: "Calculus for Robotics"
        description: "Derivatives, integrals, differential equations for motion"
        difficulty: beginner
      - slug: probability-statistics
        name: "Probability & Statistics"
        description: "Bayesian inference, distributions, estimation"
        difficulty: intermediate

  - slug: control-theory
    name: "Control Theory"
    description: "Feedback control systems for robotics"
    difficulty: intermediate
    dependencies:
      - mathematics-foundations
    subtopics:
      - slug: feedback-loops
        name: "Feedback Control Loops"
        description: "Open vs closed loop, block diagrams"
        difficulty: beginner
      - slug: pid-controllers
        name: "PID Controllers"
        description: "Proportional, integral, derivative control"
        difficulty: intermediate
        dependencies:
          - feedback-loops
          - calculus-robotics
      - slug: state-space
        name: "State-Space Representation"
        description: "State variables, state equations, controllability"
        difficulty: advanced
        dependencies:
          - linear-algebra-robotics
          - pid-controllers

  - slug: kinematics-dynamics
    name: "Kinematics & Dynamics"
    description: "Motion, forces, and mechanical behavior of robots"
    difficulty: intermediate
    dependencies:
      - mathematics-foundations
    subtopics:
      - slug: forward-kinematics
        name: "Forward Kinematics"
        description: "Joint angles to end-effector position"
        difficulty: intermediate
        dependencies:
          - linear-algebra-robotics
      - slug: inverse-kinematics
        name: "Inverse Kinematics"
        description: "End-effector position to joint angles"
        difficulty: advanced
        dependencies:
          - forward-kinematics
      - slug: dynamics
        name: "Robot Dynamics"
        description: "Forces, torques, equations of motion"
        difficulty: advanced
        dependencies:
          - calculus-robotics
          - forward-kinematics

  - slug: perception
    name: "Perception & Sensing"
    description: "How robots perceive and interpret the world"
    difficulty: intermediate
    dependencies:
      - mathematics-foundations
    subtopics:
      - slug: sensor-types
        name: "Sensors & Sensor Models"
        description: "Lidar, cameras, IMUs, encoders"
        difficulty: beginner
      - slug: computer-vision-basics
        name: "Computer Vision Basics"
        description: "Image processing, feature detection"
        difficulty: intermediate
        dependencies:
          - linear-algebra-robotics
      - slug: sensor-fusion
        name: "Sensor Fusion"
        description: "Kalman filters, combining sensor data"
        difficulty: advanced
        dependencies:
          - probability-statistics
          - sensor-types

  - slug: path-planning
    name: "Planning & Navigation"
    description: "How robots decide where to go and how to get there"
    difficulty: intermediate
    dependencies:
      - mathematics-foundations
      - kinematics-dynamics
    subtopics:
      - slug: graph-search
        name: "Graph Search Algorithms"
        description: "A*, Dijkstra, BFS/DFS for robotics"
        difficulty: intermediate
      - slug: sampling-planning
        name: "Sampling-Based Planning"
        description: "RRT, PRM, and probabilistic methods"
        difficulty: advanced
        dependencies:
          - graph-search
          - probability-statistics
      - slug: slam
        name: "SLAM"
        description: "Simultaneous Localization and Mapping"
        difficulty: advanced
        dependencies:
          - sensor-fusion
          - graph-search
```

### Curriculum Loader (`src/lib/curriculum/loader.ts`)
At build time (or on demand), parse `curriculum.yaml`:
1. Read the YAML file
2. Flatten the hierarchy into a list of topics with parent references
3. Resolve dependency slugs to topic IDs
4. Optionally sync to Supabase (for progress tracking) or keep in memory (for graph rendering)

The loader should be domain-agnostic — it reads from `src/data/domains/{domainSlug}/curriculum.yaml` based on the active domain.

### Graph Builder (`src/lib/curriculum/graph.ts`)
Convert the curriculum data into React Flow nodes and edges:
1. Each topic/subtopic becomes a node
2. Each dependency becomes a directed edge
3. Use dagre to compute layout positions
4. Node data includes: name, status (from user progress), difficulty, whether it has a challenge

---

## Phase 4: Knowledge Graph UI

### Component: `KnowledgeGraph.tsx`
This is the centerpiece of the app. It MUST be dynamically imported with `ssr: false`.

```typescript
import dynamic from 'next/dynamic';
const KnowledgeGraph = dynamic(() => import('@/components/graph/KnowledgeGraph'), {
  ssr: false,
  loading: () => <GraphSkeleton />,
});
```

### Implementation Details
1. **React Flow setup:** Use `@xyflow/react` (the v12+ package name for React Flow).
2. **Layout:** Use dagre with `rankdir: 'TB'` (top-to-bottom) for hierarchical layout. Broad topics at the top, subtopics flow down.
3. **Custom node component (`TopicNode.tsx`):** Each node renders:
   - Topic name
   - Difficulty badge (color-coded: green/yellow/red)
   - Status icon: locked (lock icon), available (circle), in-progress (half circle), completed (checkmark), decaying (warning icon)
   - Progress percentage if in-progress
   - Click handler → navigates to `/topics/{topicSlug}`
4. **Custom edge component (`DependencyEdge.tsx`):**
   - Solid arrow for met prerequisites
   - Dashed/grayed arrow for unmet prerequisites
5. **Interactivity:**
   - Zoom and pan (built-in with React Flow)
   - Minimap in corner
   - Click node to navigate
   - Hover for tooltip with topic description
6. **Dependency gating visual:** Locked nodes are visually dimmed/grayed with a lock icon overlay. Clicking a locked node shows a tooltip: "Complete {prerequisite names} first."

### Layout Algorithm with dagre
```typescript
import dagre from 'dagre';

function getLayoutedElements(nodes, edges) {
  const g = new dagre.graphlib.Graph();
  g.setDefaultEdgeLabel(() => ({}));
  g.setGraph({ rankdir: 'TB', nodesep: 80, ranksep: 100 });

  nodes.forEach((node) => {
    g.setNode(node.id, { width: 220, height: 80 });
  });

  edges.forEach((edge) => {
    g.setEdge(edge.source, edge.target);
  });

  dagre.layout(g);

  const layoutedNodes = nodes.map((node) => {
    const pos = g.node(node.id);
    return { ...node, position: { x: pos.x - 110, y: pos.y - 40 } };
  });

  return { nodes: layoutedNodes, edges };
}
```

---

## Phase 5: Topic Deep-Dive Pages

### Route: `/topics/[topicId]/page.tsx`

### Content Source
Each topic has a markdown file at `src/data/domains/robotics/topics/{topicSlug}.md` with frontmatter:

```markdown
---
title: "PID Controllers"
topic_slug: pid-controllers
domain: robotics
summary: "Proportional-Integral-Derivative control for robotics applications"
learning_objectives:
  - "Understand the three terms of a PID controller"
  - "Tune PID gains for a simulated system"
  - "Implement a basic PID controller in Python"
estimated_minutes: 45
---

# PID Controllers

## What is a PID Controller?
A PID controller continuously calculates an error value...

## The Three Terms
### Proportional (P)
...

### Integral (I)
...

### Derivative (D)
...

## Worked Example
Consider a robot arm that needs to reach a target angle...

```python
import numpy as np

def pid_controller(kp, ki, kd, setpoint, measured, integral, prev_error, dt):
    error = setpoint - measured
    integral += error * dt
    derivative = (error - prev_error) / dt
    output = kp * error + ki * integral + kd * derivative
    return output, integral, error
```
```

### Page Layout
```
┌─────────────────────────────────────────────┐
│ ← Back to Graph          Topic: PID Control │
├─────────────────────────────────────────────┤
│ [Lecture Notes]  [Challenge]  [Quiz]  [Chat]│  ← Tab navigation
├─────────────────────────────────────────────┤
│                                             │
│  Rendered markdown content                  │
│  with code blocks, math (KaTeX),            │
│  and worked examples                        │
│                                             │
├─────────────────────────────────────────────┤
│ Resources                                   │
│ 🎥 UMich Lecture: Control Systems (YouTube) │
│ 📄 Wikipedia: PID Controller                │
│ 📚 Modern Robotics Ch. 11                  │
├─────────────────────────────────────────────┤
│ Prerequisites: Feedback Loops, Calculus      │
│ Leads to: State-Space Representation        │
└─────────────────────────────────────────────┘
```

### Markdown Rendering
Use `react-markdown` with:
- `remark-gfm` for GitHub-flavored markdown (tables, strikethrough)
- `remark-math` + `rehype-katex` for LaTeX math rendering (critical for robotics equations)
- Custom code block component that uses syntax highlighting

---

## Phase 6: Browser-Based Code Execution

This is the highest technical risk. Build and validate this BEFORE other features.

### Architecture
```
Main Thread                    Web Worker
─────────────                  ──────────
CodeRunner.tsx ──postMessage──→ worker.ts
     │                              │
     │                         Load Pyodide
     │                         Load numpy, scipy
     │                              │
     ←──── "ready" ────────────────┘
     │
     ──── { code, tests } ────────→
     │                         Execute user code
     │                         Run test assertions
     │                         Capture stdout/stderr
     ←──── { results } ───────────┘
```

### Web Worker (`src/lib/pyodide/worker.ts`)
```typescript
// This runs in a Web Worker context
importScripts('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.js');

let pyodide = null;

async function initPyodide() {
  pyodide = await loadPyodide();
  await pyodide.loadPackage(['numpy', 'scipy']);
  self.postMessage({ type: 'ready' });
}

self.onmessage = async (event) => {
  const { type, code, tests } = event.data;

  if (type === 'run') {
    try {
      // Run user code
      await pyodide.runPythonAsync(code);

      // Run test code that imports from user's namespace
      const testCode = `
${tests}
`;
      const result = await pyodide.runPythonAsync(testCode);

      self.postMessage({
        type: 'result',
        success: true,
        output: pyodide.globals.get('__test_results__')?.toJs() || [],
      });
    } catch (error) {
      self.postMessage({
        type: 'result',
        success: false,
        error: error.message,
      });
    }
  }
};

initPyodide();
```

### Bridge (`src/lib/pyodide/bridge.ts`)
Provides a Promise-based API for the main thread:
```typescript
class PyodideBridge {
  private worker: Worker;
  private ready: Promise<void>;

  constructor() {
    this.worker = new Worker(new URL('./worker.ts', import.meta.url));
    this.ready = new Promise((resolve) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === 'ready') resolve();
      };
    });
  }

  async runCode(code: string, tests: string): Promise<ExecutionResult> {
    await this.ready;
    return new Promise((resolve) => {
      this.worker.onmessage = (e) => {
        if (e.data.type === 'result') resolve(e.data);
      };
      this.worker.postMessage({ type: 'run', code, tests });
    });
  }
}
```

### Hook (`src/hooks/usePyodide.ts`)
```typescript
function usePyodide() {
  const [bridge, setBridge] = useState<PyodideBridge | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const b = new PyodideBridge();
    b.ready.then(() => setIsLoading(false));
    setBridge(b);
    return () => b.terminate();
  }, []);

  return { bridge, isLoading };
}
```

### CORS Header Warning
The `Cross-Origin-Embedder-Policy: require-corp` header required by Pyodide may break Clerk's auth popups, YouTube embeds, and other third-party resources. Solutions:
1. Only apply the headers on challenge pages (using Next.js route-specific headers)
2. Or use `credentialless` instead of `require-corp` if browser support is sufficient
3. Test this interaction early in Week 1

---

## Phase 7: Coding Challenge System

### Challenge Directory Structure
Each challenge lives at `src/data/domains/robotics/challenges/{challengeSlug}/`:

**manifest.yaml:**
```yaml
title: "Implement a PID Controller"
topic: "pid-controllers"
difficulty: "intermediate"
prerequisites:
  - "feedback-loops"
  - "calculus-robotics"
estimated_minutes: 30
tags:
  - "control"
  - "classical-robotics"
packages:
  - "numpy"         # Pyodide packages to pre-load for this challenge
description: "Implement a PID controller function that takes sensor readings and returns a control output."
```

**problem.md:**
````markdown
# Implement a PID Controller

## Background
A PID controller computes a control signal based on three terms...

## Your Task
Implement the `pid_step` function that takes the current error, accumulated integral, and previous error, and returns the control output.

## Function Signature
```python
def pid_step(kp: float, ki: float, kd: float, error: float, integral: float, prev_error: float, dt: float) -> tuple[float, float]:
    """
    Returns: (control_output, updated_integral)
    """
```

## Constraints
- `dt > 0`
- Return both the control output and the updated integral term
````

**starter.py:**
```python
import numpy as np

def pid_step(kp: float, ki: float, kd: float, error: float, integral: float, prev_error: float, dt: float) -> tuple[float, float]:
    """
    Compute one step of a PID controller.

    Args:
        kp: Proportional gain
        ki: Integral gain
        kd: Derivative gain
        error: Current error (setpoint - measured)
        integral: Accumulated integral term
        prev_error: Error from previous step
        dt: Time step

    Returns:
        (control_output, updated_integral)
    """
    # YOUR CODE HERE
    pass
```

**tests.py:**
```python
import numpy as np

__test_results__ = []

def test(name, condition):
    __test_results__.append({"name": name, "passed": bool(condition)})

# Test 1: Pure proportional
output, integral = pid_step(1.0, 0.0, 0.0, 5.0, 0.0, 0.0, 0.1)
test("Pure P: output = kp * error", abs(output - 5.0) < 1e-6)

# Test 2: Integral accumulation
output, integral = pid_step(0.0, 1.0, 0.0, 5.0, 2.0, 0.0, 0.1)
test("Integral updates correctly", abs(integral - 2.5) < 1e-6)

# Test 3: Derivative term
output, integral = pid_step(0.0, 0.0, 1.0, 5.0, 0.0, 3.0, 0.1)
test("Derivative: kd * (error - prev_error) / dt", abs(output - 20.0) < 1e-6)

# Test 4: All three terms combined
output, integral = pid_step(1.0, 0.5, 0.1, 10.0, 5.0, 8.0, 0.1)
expected_p = 1.0 * 10.0
expected_i = 0.5 * (5.0 + 10.0 * 0.1)
expected_d = 0.1 * (10.0 - 8.0) / 0.1
test("Combined PID output", abs(output - (expected_p + expected_i + expected_d)) < 1e-6)
```

**solution.py:**
```python
import numpy as np

def pid_step(kp, ki, kd, error, integral, prev_error, dt):
    integral += error * dt
    derivative = (error - prev_error) / dt
    output = kp * error + ki * integral + kd * derivative
    return output, integral
```

### Challenge Loader (`src/lib/curriculum/loader.ts`)
At build time, scan the challenges directory:
1. Read all `manifest.yaml` files
2. Parse and validate against expected schema
3. Read `problem.md`, `starter.py`, `tests.py`
4. Export as a typed data structure accessible by the app
5. Map each challenge to its topic via the `topic` field in the manifest

Use Next.js `generateStaticParams` or load at build time via a script that outputs JSON.

### Challenge Page UI
```
┌─────────────────────────────────────────────┐
│ Challenge: Implement a PID Controller       │
│ Topic: Control Theory > PID Controllers     │
│ Difficulty: ⭐⭐ Intermediate               │
├──────────────────────┬──────────────────────┤
│                      │                      │
│  Problem Description │  Monaco Editor       │
│  (rendered markdown) │  (starter.py loaded) │
│                      │                      │
│                      │  [▶ Run Tests]       │
│                      │                      │
│                      ├──────────────────────┤
│                      │  Test Results        │
│                      │  ✅ Test 1: Pure P   │
│                      │  ✅ Test 2: Integral │
│                      │  ❌ Test 3: Deriv.   │
│                      │  ❌ Test 4: Combined │
│                      │                      │
│                      │  2/4 tests passing   │
└──────────────────────┴──────────────────────┘
```

---

## Phase 8: Quiz System

### Pre-Curated Questions Format
Stored in Supabase (seeded from `src/data/quizzes/robotics/*.json`):

```json
[
  {
    "topic_slug": "pid-controllers",
    "question": "In a PID controller, which term responds to the accumulated past error?",
    "options": [
      "Proportional (P)",
      "Integral (I)",
      "Derivative (D)",
      "None of the above"
    ],
    "correct_index": 1,
    "explanation": "The Integral term accumulates error over time, addressing steady-state error that the P term alone cannot eliminate.",
    "difficulty": "beginner",
    "sms_friendly": true
  }
]
```

### Quiz Page UI (`/topics/{topicSlug}/quiz`)
- Display questions one at a time
- Multiple choice with A/B/C/D buttons
- Immediate feedback after answering (correct/incorrect + explanation)
- Running score at the top
- On completion: update proficiency score in Supabase via `user_progress` table

### Proficiency Update Logic
After a quiz:
```
new_score = (old_score * 0.7) + (quiz_percentage * 0.3)
```
This weighted average prevents a single bad quiz from tanking the score while still reflecting recent performance. The exact formula is a research item (Week 1) — this is a starting point.

---

## Phase 9: Competency Dashboard

### Route: `/dashboard`

### Layout
```
┌─────────────────────────────────────────────┐
│ ATLAS Dashboard            [Settings ⚙️]     │
├─────────────────────────────────────────────┤
│                                             │
│  Learning Velocity: 2.3 topics/week         │
│  Projected Completion: June 15, 2026        │
│  Current Streak: 5 days                     │
│                                             │
├─────────────────────────────────────────────┤
│ Competency Overview                         │
│ ┌──────────┐ ┌──────────┐ ┌──────────┐     │
│ │ Math     │ │ Control  │ │Kinematics│     │
│ │ Found.   │ │ Theory   │ │& Dynamics│     │
│ │ ████░ 72%│ │ ██░░░ 40%│ │ ░░░░░  0%│     │
│ │ 3/4 done │ │ 1/3 done │ │ locked   │     │
│ └──────────┘ └──────────┘ └──────────┘     │
│ ┌──────────┐ ┌──────────┐                   │
│ │Perception│ │ Planning │                   │
│ │& Sensing │ │& Navig.  │                   │
│ │ ░░░░░  0%│ │ ░░░░░  0%│                   │
│ │ locked   │ │ locked   │                   │
│ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────┤
│ ⚠️ Decaying: Linear Algebra (last: 12d ago) │
│ 📌 Recommended Next: Feedback Loops         │
│ 📊 This Week: 3 quizzes, 1 challenge done   │
└─────────────────────────────────────────────┘
```

### Data Sources
- `user_progress` table for proficiency scores and status
- `quiz_attempts` and `challenge_attempts` for activity metrics
- Spaced repetition engine for decay warnings
- Calculated learning velocity from `completed_at` timestamps

---

## Phase 10: Spaced Repetition Engine

### Algorithm: Modified SM-2
Based on the SuperMemo SM-2 algorithm (used by Anki), adapted for topic-level granularity:

```typescript
// src/lib/spaced-repetition/engine.ts

interface ReviewState {
  easeFactor: number;     // Default 2.5, min 1.3
  interval: number;       // Days until next review
  repetition: number;     // Number of successful reviews
}

function calculateNextReview(
  state: ReviewState,
  quality: number          // 0-5 rating (0=fail, 5=perfect)
): ReviewState {
  let { easeFactor, interval, repetition } = state;

  if (quality >= 3) {
    // Successful recall
    if (repetition === 0) interval = 1;
    else if (repetition === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetition += 1;
  } else {
    // Failed recall — reset
    repetition = 0;
    interval = 1;
  }

  // Update ease factor
  easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  easeFactor = Math.max(1.3, easeFactor);

  return { easeFactor, interval, repetition };
}
```

### Quality Score Mapping
- Quiz: `quality = (correct_answers / total_questions) * 5`
- Challenge: `quality = all_tests_pass ? 5 : (tests_passed / tests_total) * 3`

### Decay Detection
A cron job (Vercel Cron or Supabase scheduled function) runs daily:
1. Query all `user_progress` where `next_review_at < now()` and `status = 'completed'`
2. Update status to `'decaying'`
3. These topics become priority candidates for SMS nudges

---

## Phase 11: SMS Nudges (Twilio)

### Setup
1. Create a Twilio account and get a phone number with SMS capability
2. Set up the webhook URL: `https://your-app.vercel.app/api/sms/webhook`
3. Configure Twilio to POST inbound messages to this URL

### Outbound: Daily SMS (`/api/sms/send/route.ts`)
Triggered by Vercel Cron (in `vercel.json`):
```json
{
  "crons": [
    {
      "path": "/api/sms/send",
      "schedule": "0 * * * *"
    }
  ]
}
```

This runs hourly. The API route:
1. Query all users with `sms_config.is_enabled = true`
2. For each user, check if current time (in their timezone) matches their `send_time`
3. If yes, select a quiz question:
   - Priority 1: Questions from decaying topics
   - Priority 2: Questions from in-progress topics
   - Priority 3: Questions from available (next up) topics
   - Avoid recently sent questions (check `sms_log`)
4. Format the SMS:
```
📚 ATLAS Daily Quiz

Topic: PID Controllers

In a PID controller, which term responds to accumulated past error?

A) Proportional
B) Integral
C) Derivative
D) None of the above

Reply with A, B, C, or D
```
5. Send via Twilio and log to `sms_log`

### Inbound: Reply Webhook (`/api/sms/webhook/route.ts`)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

export async function POST(request: NextRequest) {
  // 1. Validate Twilio signature
  const signature = request.headers.get('x-twilio-signature');
  // ... validate with twilio.validateRequest()

  const formData = await request.formData();
  const from = formData.get('From') as string;
  const body = (formData.get('Body') as string).trim().toUpperCase();

  // 2. Look up the most recent unanswered SMS for this phone number
  // Query sms_log WHERE phone = from AND reply_received = false ORDER BY sent_at DESC LIMIT 1

  // 3. Grade the answer
  const selectedIndex = { 'A': 0, 'B': 1, 'C': 2, 'D': 3 }[body];
  const isCorrect = selectedIndex === question.correct_index;

  // 4. Update sms_log
  // 5. Update user_progress proficiency score
  // 6. Log quiz_attempt with source = 'sms'

  // 7. Send response
  const twiml = new twilio.twiml.MessagingResponse();
  if (isCorrect) {
    twiml.message(`✅ Correct! ${question.explanation}`);
  } else {
    const correctLetter = ['A', 'B', 'C', 'D'][question.correct_index];
    twiml.message(`❌ The answer was ${correctLetter}. ${question.explanation}`);
  }

  return new NextResponse(twiml.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  });
}
```

### SMS Settings Page (`/settings`)
- Phone number input (with country code)
- Enable/disable toggle
- Time picker for preferred send time
- Timezone selector
- Frequency: daily / weekdays / custom (day checkboxes)
- Optional: filter to specific topics

---

## Phase 12: AI Chatbot

### Route: Embedded in topic pages + standalone at `/chat`

### API Endpoint (`/api/chat/route.ts`)
Uses the Anthropic SDK with streaming:

```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

export async function POST(request: Request) {
  const { messages, topicContext } = await request.json();

  const systemPrompt = `You are ATLAS, an AI tutor specializing in robotics education. 
You are currently helping the user learn about: ${topicContext.topicName}.

Context about this topic:
${topicContext.description}

The user's current proficiency in this topic is ${topicContext.proficiency}%.
Their background: Computer Science masters, Chemical Engineering undergrad, MBA. 
They are new to robotics.

Guidelines:
- Explain concepts clearly with practical examples
- Use mathematical notation when appropriate (LaTeX)
- Reference real-world robotics applications
- If the user asks about something outside robotics, gently redirect
- Suggest related topics from their curriculum when relevant
- If they seem confused, break concepts down further
- Never make up formulas or equations — if unsure, say so`;

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages,
  });

  // Return streaming response
  return new Response(stream.toReadableStream());
}
```

### Chat UI Component (`ChatInterface.tsx`)
- Message list with user/assistant bubbles
- Input field with send button
- Streaming response display (token by token)
- Rendered markdown in assistant messages (with math support)
- Context indicator showing which topic the chat is scoped to
- "Clear conversation" button

---

## Phase 13: Learning Velocity Tracker

### Calculation
```typescript
function calculateVelocity(completedTopics: UserProgress[]): {
  topicsPerWeek: number;
  projectedCompletionDate: Date;
} {
  // Get completion timestamps sorted chronologically
  const completions = completedTopics
    .filter(t => t.completed_at)
    .sort((a, b) => a.completed_at - b.completed_at);

  if (completions.length < 2) {
    return { topicsPerWeek: 0, projectedCompletionDate: null };
  }

  // Calculate rolling average over the last 14 days
  const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const recentCompletions = completions.filter(t => t.completed_at > twoWeeksAgo);
  const topicsPerWeek = recentCompletions.length / 2;

  // Project completion
  const totalTopics = /* total topic count from curriculum */;
  const remainingTopics = totalTopics - completions.length;
  const weeksRemaining = remainingTopics / topicsPerWeek;
  const projectedDate = new Date(Date.now() + weeksRemaining * 7 * 24 * 60 * 60 * 1000);

  return { topicsPerWeek, projectedCompletionDate: projectedDate };
}
```

Display on the dashboard as a simple stat card with the projected date.

---

## Phase 14: Polish & Deployment

### Loading States
- **Pyodide loading:** Show a progress bar or spinner with "Loading Python environment..." message. The first load is 5-10 seconds — users need to know something is happening.
- **Graph loading:** Skeleton with pulsing node outlines while data loads.
- **Chat streaming:** Show a typing indicator while the first token arrives.

### Error Handling
- Pyodide execution errors: display the Python traceback in the test results panel
- Network errors: toast notifications with retry option
- SMS webhook errors: log to `sms_log` with error details, don't crash

### Responsive Design
- Dashboard: stack topic cards vertically on mobile
- Knowledge graph: full-screen on mobile with pinch-to-zoom
- Challenge page: stack problem description above editor on mobile (though coding on mobile is a poor experience — show a message suggesting desktop)
- Topic pages: single column on mobile

### Vercel Configuration (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/sms/send",
      "schedule": "0 * * * *"
    }
  ]
}
```

### Pre-deployment Checklist
- [ ] All environment variables set in Vercel dashboard
- [ ] Supabase RLS policies enabled and tested
- [ ] Twilio webhook URL configured and verified
- [ ] Clerk production keys (not development keys)
- [ ] CORS headers tested with Clerk + Pyodide
- [ ] At least 5 topic nodes with content
- [ ] At least 1-2 coding challenges verified working
- [ ] SMS send + receive tested end-to-end
- [ ] Chatbot tested with topic context

---

## Appendix A: Environment Variables

```env
# .env.local

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Anthropic (Claude)
ANTHROPIC_API_KEY=sk-ant-...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# App
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

---

## Appendix B: Content Sources

### Primary: University of Michigan Robotics Courses
- URL: https://robotics.umich.edu/academics/courses/online-courses/
- Use course syllabi and publicly available materials to seed the curriculum
- Parse course descriptions, topics, and learning objectives

### Secondary: HuggingFace Robotics Course
- URL: https://huggingface.co/learn/robotics-course/unit0/1
- Covers: classical robotics (kinematics, control), RL, imitation learning, foundation models
- Uses LeRobot library + PyTorch
- Only Units 0-2 released as of April 2026

### Tertiary: awesome-robotics GitHub
- URL: https://github.com/Kiloreux/awesome-robotics
- Curated list of courses, books, papers, software, and resources
- Use as reference library links per topic

### Textbook References
- "Modern Robotics" by Lynch & Park (available online: modernrobotics.org)
- "Probabilistic Robotics" by Thrun, Burgard, Fox
- "Robotics: Modelling, Planning and Control" by Siciliano et al.
- "Robot Modeling and Control" by Spong, Hutchinson, Vidyasagar
