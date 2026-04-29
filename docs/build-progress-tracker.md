# Build Progress Tracker

Last updated: 2026-04-29

## Completed

- Created the initial Next.js scaffold and TypeScript/Tailwind configuration.
- Added a single-domain robotics configuration with generic domain types.
- Implemented filesystem curriculum loading from `curriculum.yaml`.
- Implemented topic markdown loading with frontmatter parsing.
- Added a demo current-user abstraction and mock progress repository.
- Added ingestion manifest loading and a parser registry.
- Added the initial app shell and seeded overview, dashboard, graph, settings, and topic routes.
- Added curriculum and source-ingestion tracker documents.
- Installed dependencies and verified the scaffold with typecheck, lint, and production build.

## Deferred by design

- Clerk authentication
- Supabase persistence and row-level security integration
- React Flow graph renderer
- Pyodide code execution
- Challenge and quiz execution flows
- Twilio and AI provider wiring

## Next build steps

1. Add the first real raw source assets and decide whether existing parsers are sufficient.
2. Expand topic markdown coverage for the seeded robotics nodes.
3. Replace the graph preview with React Flow once the content contracts are stable.
4. Introduce service-backed progress, quiz, and challenge repositories.
5. Add Clerk and Supabase integration behind the existing user and repository interfaces.

## Open technical notes

- The current user abstraction uses a demo user and should be replaced with Clerk session data later.
- Topic routes and curriculum dependencies are slug-based throughout the scaffold.
- The scaffold assumes repo-managed curriculum content and user-specific operational data.
