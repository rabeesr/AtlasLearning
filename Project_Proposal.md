# Project Proposal: ATLAS

## One-Line Description
A personalized AI-powered learning OS that combines interactive knowledge graphs, browser-based coding challenges, and daily SMS nudges to systematically build deep technical mastery — launching with robotics as its first domain.

## The Problem
Learning a deep technical field on your own is fragmented and unstructured. Resources are scattered across universities, MOOCs, YouTube, and GitHub repos. Coursera teaches linearly. Leetcode tests without teaching. Khan Academy covers breadth but not technical depth. No single platform maps an entire domain's landscape, tracks what you know, tells you what to learn next, and actively prevents knowledge decay.

ATLAS is a personal learning OS that solves this — domain by domain. It combines structured curriculum, interactive coding challenges, spaced repetition, and AI-powered guidance into one adaptive platform. The architecture is domain-agnostic: the knowledge graph, challenge engine, proficiency tracking, and SMS nudge system work for any technical field. New domains are added by seeding a new curriculum.

The first domain is **robotics**, because I'm actively pursuing a career transition into the field. I have a CS masters and chemical engineering undergraduate degree, but zero formal robotics training. I need a structured, adaptive system that meets me where I am and gets me interview-ready as fast as possible. Future domains could include quantum computing, machine learning, biotech, or any technical field where deep, structured self-study matters.

## Target User
Me — a software engineer with a strong CS and engineering foundation (Python, physics, calculus) who needs to rapidly build deep expertise in new technical domains. The immediate use case is breaking into the robotics industry with zero formal robotics training. The platform is built as a personal tool with domain-agnostic architecture — robotics is the first domain, but the same engine supports any technical field by swapping the curriculum seed data.

## Core Features (V1)

1. **Competency Dashboard** — Visual overview of proficiency across all robotics-relevant topics. See at a glance what you've mastered, what's in progress, what's decaying, and where to focus next. Includes a learning velocity tracker showing pace of progress and projected curriculum completion date.

2. **Interactive Knowledge Graph / Mind Map** — Visual map of the full robotics topic landscape showing how concepts interrelate and depend on each other. Seeded from University of Michigan robotics courses and expanded by LLM-generated curriculum. Includes dependency warnings that gate you from jumping into topics you're not ready for. Each node links to a curated resource library of external content (lectures, articles, documentation) and user-added YouTube videos tagged to specific topics.

3. **Topic Deep-Dive Pages** — Drill into any knowledge graph node to access detailed lecture notes with practice examples, generated from curated course content and LLM. Each topic page includes explanation, worked examples, and links to relevant external resources.

4. **Browser-Based Coding Challenges & Quizzes** — Python coding challenges executed in the browser via Pyodide, with test cases to verify solutions. Quiz exercises for conceptual topics. Results feed back to the dashboard to update proficiency scores. Challenges are grounded in established robotics curricula (UMich courses, textbooks) to ensure correctness. Not every topic node requires a coding challenge — core topics launch with full challenges, others with lecture notes + quizzes, and challenges are added iteratively.

   **Challenge Management:** Challenges are git-managed, not administered through a UI. Each challenge lives in the repository as a directory with a YAML manifest and associated files:
   ```
   challenges/
     pid-controller/
       manifest.yaml
       problem.md
       starter.py
       tests.py
       solution.py
     inverse-kinematics/
       manifest.yaml
       problem.md
       starter.py
       tests.py
       solution.py
   ```
   The YAML manifest defines metadata used by the app to dynamically populate topics:
   ```yaml
   title: "Implement a PID Controller"
   topic: "control-theory"
   difficulty: "intermediate"  # beginner | intermediate | advanced
   prerequisites:
     - "feedback-loops"
     - "basic-calculus"
   estimated_minutes: 30
   tags:
     - "control"
     - "classical-robotics"
   ```
   The app reads the challenge directory at build time, parses manifests, and maps challenges to the corresponding knowledge graph nodes. New challenges are added by committing files and deploying — no admin panel required.

5. **Spaced Repetition & SMS Nudges** — Completed topics are tracked for knowledge decay using spaced repetition principles. Daily SMS messages (via Twilio) deliver a short digestible topic summary and an interactive quiz, targeted at gaps and decaying knowledge. Timing, frequency, and preferences are configurable directly in the app.

6. **AI Chatbot** — Conversational assistant powered by Claude API, available within any topic for deeper exploration, follow-up questions, and concept clarification. Scoped to the current domain's learning context.

## Tech Stack
- Frontend: Next.js
- Styling: Tailwind CSS
- Database: Supabase (user data, progress, topic graph, resource links, SMS quiz questions and answers)
- Auth: Clerk
- Knowledge Graph Visualization: React Flow (native React, MIT license) + dagre or elkjs for auto-layout of topic dependency graph. Nodes are full React components (progress badges, lock icons for gated topics, difficulty indicators). Requires `dynamic import` with `ssr: false` in Next.js.
- Code Editor: Monaco Editor (same editor as VS Code) for challenge code input
- Code Execution: Pyodide (CPython compiled to WebAssembly). Runs in a Web Worker to avoid blocking the UI. Pre-loaded packages: NumPy, SciPy, matplotlib. First load ~5-10 seconds (cached after). Test harness runs user function and compares output client-side — no backend execution server needed.
- APIs: Twilio (SMS send + webhook for receiving quiz replies), Claude API (chatbot, content generation, curriculum engine), YouTube oEmbed (video embeds)
- SMS Quiz Flow: Twilio sends multiple choice question → user replies with letter → Twilio webhook (Next.js API route) receives reply → matches against stored correct answer → sends back result → syncs proficiency score to Supabase
- Deployment: Vercel
- MCP Servers: Potential custom MCP server for topic-specific document referencing (stretch goal)

## Stretch Goals

**V1 Stretch:**
- Project-based capstone milestones combining multiple topics into mini-projects
- "Explain like I'm a chemical engineer" prompt tuning in the chatbot (leveraging user's ChemE background for analogies)
- RAG pipeline for chatbot grounding responses in curriculum content
- MCP server tools so the AI chatbot can reference specific PDFs/docs per topic
- YouTube transcript extraction to auto-curate knowledge graph content from video
- C++ challenge support via Judge0 (server-side code execution) for production-level robotics challenges

**V2 — Content Depth + New Domains:**
- Paper reader — paste a research paper, AI breaks it down and maps new concepts to your knowledge graph
- Textbook mode — upload a textbook PDF, generates a parallel study guide with challenges for each chapter
- Second domain launch — add a new technical field (e.g., quantum computing, ML, biotech) by seeding a new curriculum, validating that the domain-agnostic architecture works beyond robotics

**V3 — AI Enhancement:**
- Adaptive difficulty — auto-adjusts challenge complexity based on performance
- Learning style detection — tracks whether you learn faster from examples, theory, or challenges and adjusts presentation
- Socratic mode — AI asks leading questions instead of explaining, toggle between "teach me" and "make me think"
- Mistake pattern analysis — identifies recurring errors across challenges ("you keep confusing forward and inverse kinematics")
- Daily briefing — morning summary of yesterday's progress, decaying topics, today's plan, and relevant robotics news
- Dynamic SMS quiz generation — Claude API generates novel multiple choice questions per topic and proficiency level, grounded in RAG pipeline and MCP server tools to limit hallucinations. Pre-curated questions are sufficient for V1 while the user is still learning foundational concepts; dynamic generation becomes valuable once the user can evaluate question correctness.

**V4+ — Hardware Integration:**
- Embedded 2D/3D robotics simulator (PyBullet/MuJoCo via WASM) for simulation-based challenges
- Physical robot companion integration (LeRobot SO-100) for real hardware testing
- Sensor data playground — upload and work with real sensor data in challenges

**Future (Unversioned):**
- Interview prep mode: toggle the platform from learning to interview preparation, generating domain-specific questions a hiring manager would ask, graded by AI on completeness and technical accuracy
- Gamification: streaks, achievement badges, XP system, RPG-style skill tree visualization
- Career/application: portfolio generator from completed work, full interview simulator with AI interviewer, job posting analyzer that maps requirements to your graph, conference/paper tracker
- Social/community: study groups, mentor matching, leaderboards, shareable learning path visualizations
- Analytics: time-to-mastery predictions, comparative analytics, weekly/monthly progress reports, forgetting curve visualization

## Biggest Risk
1. **Content quality without domain expertise.** I don't know robotics yet, which means I can't fully QA whether the LLM-generated curriculum, explanations, and coding challenge test cases are correct. Mitigation: ground everything in established UMich courses and known textbooks, personally test every coding challenge before shipping, and treat the LLM as an extender of expert content rather than the sole source of truth.
2. **Coding challenge correctness.** Test cases for robotics Python challenges need to be verifiably correct. I'll write them with LLM assistance but validate each one myself using reference solutions from course materials and textbooks.
3. **Proficiency model design.** How to accurately score mastery of a topic is an open research question. I need to study how Khan Academy, Coursera, and academic institutions model proficiency before committing to an approach. This is a week 1 research task.
4. **V1 scope.** The feature set is ambitious. The knowledge graph, coding challenges, SMS system, and chatbot are each meaningful engineering efforts. Disciplined weekly scoping and willingness to push features to stretch goals will be critical.

## Weekly Milestones

### Week 1: Foundation + Research
- **Research (Day 1):** Study proficiency models from Khan Academy, Coursera, and Duolingo. Decide on a scoring approach (mastery-based, point-based, or hybrid) and document the decision.
- **Project setup:** Initialize Next.js + Tailwind + Supabase + Clerk. Deploy a skeleton to Vercel. Confirm CI/CD pipeline works.
- **Pyodide spike:** Build a bare-bones prototype — Monaco Editor + "Run" button + Pyodide in a Web Worker + output display. Confirm NumPy loads and a simple function can be tested against expected output. This validates the core technical risk early.
- **Curriculum seed:** Parse UMich robotics course syllabi and structure the initial topic graph data (JSON/YAML). Use Claude to expand into a full topic map with dependencies.
- **Database schema:** Design and create Supabase tables for topics, user progress, quiz questions, resource links.
- **Deliverable:** Deployed skeleton with working in-browser Python execution and a draft curriculum data file.

### Week 2: Knowledge Graph + Topic Pages
- **Knowledge graph UI:** Implement React Flow with dagre layout. Render the curriculum as an interactive graph with nodes, edges, dependency arrows. Add zoom, pan, minimap. Clicking a node navigates to its topic page.
- **Dependency gating:** Implement visual indicators — locked nodes for topics with unmet prerequisites, progress indicators on completed/in-progress nodes.
- **Topic deep-dive pages:** Build the topic page template. For each topic: lecture notes (LLM-generated from UMich content), worked examples, and links to external resources.
- **Resource library:** Ability to add YouTube video links to specific topics and display them on the topic page.
- **Deliverable:** Navigable knowledge graph with 5 broad topic areas and their subtopics, each with lecture content and resource links.

### Week 3: Challenges + Dashboard
- **Coding challenge infrastructure:** Build the full challenge UI — Monaco Editor, Pyodide execution, test runner, pass/fail display. Wire up the YAML manifest system so challenges auto-populate from the git directory.
- **First 1-2 coding challenges:** Write and verify 1-2 challenges with test cases for a core topic (e.g., implement a PID controller, compute forward kinematics).
- **Quiz system:** Build multiple choice quizzes for conceptual topics. Store questions in Supabase. Results update proficiency scores.
- **Competency dashboard:** Build the main dashboard view — proficiency scores across topics, visual indicators for mastery/in-progress/decaying/locked status.
- **Deliverable:** Working challenge execution, 1-2 verified coding challenges, quiz system, and a functional dashboard.

### Week 4: SMS + Interview Prep + Chat
- **Twilio SMS integration:** Set up Twilio for outbound SMS (topic + quiz). Build the webhook API route to receive replies, grade them, and sync results to Supabase.
- **SMS configuration UI:** In-app settings for timing, frequency, and topic preferences for daily nudges.
- **Spaced repetition logic:** Implement decay tracking for completed topics. SMS targeting prioritizes decaying topics and identified gaps.
- **AI chatbot:** Integrate Claude API as a contextual chatbot within topic pages. Scope system prompt to the current domain's learning context.
- **Deliverable:** Receiving daily SMS quizzes, replying and seeing scores update. Chatbot functional.

### Week 5: Polish + Content + Demo Prep
- **Additional coding challenges (if time permits):** Write and verify additional challenges to expand coverage beyond the initial 1-2 topics.
- **Learning velocity tracker:** Implement the pace-of-learning calculation and projected completion date on the dashboard.
- **Content polish:** Review and improve all topic nodes across the 5 broad areas. Ensure lecture notes are accurate, examples are clear, and resource links work.
- **UI polish:** Responsive design, loading states (especially for Pyodide), error handling, empty states.
- **End-to-end testing:** Walk through the entire user journey — login, dashboard, graph exploration, topic drill-down, challenge completion, SMS receipt and reply, interview prep, chatbot.
- **Demo preparation:** Prepare a 3-5 minute walkthrough for the project fair.
- **Deliverable:** Fully deployed, polished ATLAS ready for demo.

## Week 5 Goal
A working, deployed platform where I can:
- Log in and see my competency dashboard with proficiency scores across robotics topics
- Explore a visual knowledge graph of the robotics curriculum with dependency relationships
- Explore at least 5 broad topic areas with subtopics, each with lecture notes and practice examples
- Complete browser-based coding challenges with automated test verification for 1-2 core topics
- Receive daily SMS nudges with a topic summary and quiz
- Configure SMS timing and preferences in the app
- Chat with the AI assistant about any topic in the curriculum
- See my learning velocity and projected completion timeline
