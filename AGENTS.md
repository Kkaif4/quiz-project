<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Governance & Agent Operating Manual: Lemon Quiz

All AI coding agents, autonomous subagents, and human contributors operating in this repository **MUST** adhere to the following operational instructions and maintain the authoritative system documents located in [`agent/`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent).

---

## 1. Required Document Maintenance

Whenever you perform work, create features, or modify existing systems, you **MUST** keep the following living documentation updated:

| Document                                                                                                        | Maintenance Obligation                                                                                                                                                                                                                                                                               |
| :-------------------------------------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [agent/task.md](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent/task.md)                   | **Active Task & Progress Tracker**: Check off completed tasks (`[x]`), mark current tasks in progress, and increment the document version (`v1.0.1`, `v1.1.0`) when phases advance.                                                                                                                  |
| [agent/architecture.md](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent/architecture.md)   | **System Architecture Specification**: Update whenever system pipelines, tech stack components, authentication/capability flows, or directory layouts evolve.                                                                                                                                        |
| [agent/database.md](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent/database.md)           | **Database & Schemas Specification**: Update whenever Mongoose models, embedded structures, index strategies, or query projections are modified.                                                                                                                                                     |
| [agent/decisions.md](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent/decisions.md)         | **Architectural Decision Records (ADRs)**: Record a formal ADR entry whenever a major technical direction, dependency, or structural choice is adopted or altered.                                                                                                                                   |
| [agent/GRAPH_CONTEXT.md](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent/GRAPH_CONTEXT.md) | **Context Graph & Change Log**: **CRITICAL RULE**: Whenever a _major or structurally significant change_ is made to any module, data schema, or security boundary, add a log entry to Section 7 and update the corresponding Mermaid diagram(s). _(Do not log minor cosmetic or trivial bug fixes)._ |

---

## 2. Core Non-Negotiables & Rules Reference

Before writing or modifying any code, review and strictly abide by:

- [agent/RULES.md](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent/RULES.md) (The AI Rulebook):
  - **Zero Answer Key Leakage**: Never send `correctOptionId` in public responses.
  - **Server-Side Scoring**: Calculate all attempt scores exclusively on the server.
  - **Token Hashing**: Store only SHA-256 hashes of raw owner tokens in MongoDB.
  - **Rate Limiting**: Enforce sliding window limits on quiz creation (5/hr), attempts (10/10m), and reports (3/hr).
  - **Privacy**: No PII collection. Salt and hash IP addresses.
  - **Anti-Bot**: Honeypot inputs and timing validation (>3s).
- [agent/design.md](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/agent/design.md) (Design System):
  - **Zero OS Emoji Clutter**: Never use raw system emojis in UI elements. Use **Lucide React** vector icons inside duotone container pills.
  - **Mobile-First & Thumb-Friendly**: Minimum 56px touch target height.
  - **Viral Loop Focus**: Primary CTA on the result screen must always be _"Create Your Own Quiz"_.

---

## 3. Next.js 16 Canary & React 19 Standards

- All dynamic route segments and search params are asynchronous Promises: `const { quizCode } = await params;`.
- Respect Server vs Client Component boundaries. Keep client bundles lightweight.
