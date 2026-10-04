# AI Rulebook: Engineering & Architectural Invariants

> **Project**: Lemon Quiz (Friendship Quiz MVP)  
> **Target Genre**: Viral, consumer-social web application for teens and young adults (ages 12–20).  
> **Tech Stack**: Next.js App Router (Next 16 Canary + React 19), Tailwind CSS v4, MongoDB Atlas with Mongoose, Zod, Lucide React.  
> **Purpose**: This rulebook defines the strict, non-negotiable architectural, security, design, and code quality invariants that ANY AI agent or engineer must adhere to when generating, refactoring, or reviewing code in this codebase.

---

## 1. Architectural Invariants

### 1.1 Simplicity & Monolithic Architecture (The "No Over-Engineering" Rule)

- **Rule**: Keep everything inside this single Next.js application repository.
- **Forbidden**:
  - ❌ Do NOT introduce Redis, Kafka, BullMQ, or background worker services for MVP.
  - ❌ Do NOT create separate backend microservices or standalone Express/NestJS servers.
  - ❌ Do NOT implement WebSockets. Polling or atomic server revalidation is sufficient.
  - ❌ Do NOT integrate heavy third-party auth platforms (Clerk, NextAuth, Auth0, Supabase Auth) for the MVP. The product relies on anonymous cryptographic tokens.

### 1.2 Embedded Data Model (Questions Belong to Quizzes)

- **Rule**: Questions and options **MUST** be embedded directly within the `Quiz` document.
- **Forbidden**:
  - ❌ Do NOT create a separate `Question` or `Option` MongoDB collection.
  - ❌ Do NOT perform `$lookup` or multi-collection joins to load a quiz. A quiz must load in a single fast indexed query.

### 1.3 Next.js 16 & React 19 App Router Conventions

- **Rule**: Dynamic route parameters and search parameters are **Promises**.
  - Correct: `const { quizCode } = await params;`
  - Incorrect: `const { quizCode } = params;`
- **Rule**: Preserve the separation between Server Components (default for data fetching and metadata) and Client Components (`"use client"` for forms, quiz interactivity, and confetti).
- **Rule**: Always heed breaking changes documented in `node_modules/next/dist/docs/`.

---

## 2. Security & Anti-Abuse Non-Negotiables

### 2.1 Zero-Leakage Server-Side Scoring

- **Rule**: The client must **NEVER** receive the answer key (`correctOptionId`).
- **Implementation**:
  - All public queries (`/q/[quizCode]`, `GET /api/quizzes/[quizCode]`) **MUST** explicitly project out `questions.correctOptionId` and `ownerTokenHash`.
  - The client submits only `{ answers: [{ questionId, optionId }] }`.
  - The server fetches the authoritative quiz document, computes `score` and `percentage` internally, and stores the `Attempt` record.

### 2.2 Cryptographic Identity & Token Hashing

- **Rule**: Raw owner tokens must **NEVER** be stored in MongoDB.
  - Generate raw token: `crypto.randomBytes(32).toString('hex')` (64-character high-entropy string).
  - Storage: Store only `ownerTokenHash = sha256(rawToken)`.
  - Authentication: Incoming `/manage/[ownerToken]` requests hash the provided token and query by `ownerTokenHash`.
  - Persistence: Store raw tokens in HTTP-only, `SameSite=Lax` cookies (`quiz_owner_tokens`) with client localStorage fallback.

### 2.3 Strict Multi-Tier Rate Limiting

- **Rule**: Every public write endpoint must be protected by an IP-based rate limiter:
  - `POST /api/quizzes`: Max 5 requests / IP / hour.
  - `POST /api/quizzes/[quizCode]/attempts`: Max 10 requests / IP / 10 minutes.
  - `POST /api/reports`: Max 3 requests / IP / hour.
- **Header Standard**: Return `429 Too Many Requests` with `Retry-After` header when limit is exceeded.

### 2.4 Privacy & Data Minimization (Teen Protection)

- **Rule**: Do **NOT** collect phone numbers, emails, addresses, school names, dates of birth, or sensitive profile details.
- **Rule**: Never store raw IP addresses in database documents. Store a salted hash: `ipHash = sha256(clientIp + process.env.SALT)`.

### 2.5 Anti-Bot & Anti-Cheat Guards

- **Honeypot**: Include a hidden form field (e.g. `website`) on attempt and quiz forms. If populated, silently reject or fail the request.
- **Timing Check**: Reject attempts submitted in under 3 seconds (physically impossible for human reading and answering).
- **Payload Size**: Limit JSON body sizes to 50KB maximum to eliminate memory exhaustion attacks.

---

## 3. Data Validation & Boundary Constraints

### 3.1 Dual-Layer Validation (Zod + Mongoose)

- **Rule**: Validate incoming payloads with **Zod** at the route boundary before any database interaction. Ensure Mongoose schemas enforce the identical constraints as a secondary guarantee.

### 3.2 Fixed Numeric Bounds

| Field              | Minimum | Maximum   | Invariant Rationale                 |
| :----------------- | :------ | :-------- | :---------------------------------- |
| Quiz Title         | 1 char  | 100 chars | Prevents UI overflow, trimmed       |
| Quiz Description   | 0 chars | 300 chars | Optional context                    |
| Questions Count    | 3       | 15        | Keeps quiz engaging without fatigue |
| Question Text      | 1 char  | 300 chars | High legibility on mobile           |
| Options Count      | 2       | 6         | Standard multiple choice limits     |
| Option Text        | 1 char  | 100 chars | Clean button typography             |
| Nickname           | 1 char  | 30 chars  | Displayable in leaderboard          |
| Report Description | 0 chars | 500 chars | Sufficient for moderation details   |

### 3.3 Relational Invariants

- Each `correctOptionId` in a question **MUST** match the `id` of an option present in that question's `options` array.
- In `Attempt.answers`, every `optionId` must exist within the respective `questionId` in the quiz.

---

## 4. UI/UX & Design Rules (Premium Youth Standard)

### 4.1 Zero OS Emoji Clutter

- **Rule**: **NEVER** use raw system emojis (`🎉`, `🔥`, `🍕`, `💀`, `❤️`) in UI buttons, titles, headers, badges, or dashboard metrics.
- **Standard**: Always use **Lucide React** vector icons (`<Sparkles />`, `<Crown />`, `<HeartHandshake />`, `<Flame />`, `<ShieldAlert />`, `<Share2 />`) styled inside duotone container pills.
- **Reason**: OS emojis render inconsistently across Apple, Google, and Microsoft platforms, disrupt visual rhythm, and look amateurish.

### 4.2 Mobile-First & Thumb-Friendly

- **Rule**: 95%+ of users open quizzes on mobile through WhatsApp, Instagram, or TikTok.
- **Standard**:
  - Interactive options must have a minimum tap height of **56px**.
  - Primary CTAs must be sticky or immediately visible above the fold on mobile viewports.
  - Active button states must provide tactile feedback: `active:scale-[0.98] transition-transform duration-100`.

### 4.3 The Viral Conversion Priority

- **Rule**: The Result Page (`/q/[quizCode]/result/[attemptCode]`) has one primary metric: **converting the friend into a new quiz creator**.
- **Standard**: The primary, most radiant, high-contrast button on the result screen must always be **"Create Your Own Quiz"**. Sharing the score is always secondary.

---

## 5. Code Quality & Implementation Rules

### 5.1 Strict TypeScript & Zero `any`

- **Rule**: No implicit or explicit `any` types.
- **Rule**: All database models, API request payloads, and API responses must have strict TypeScript interfaces defined in `types/`.

### 5.2 Serverless MongoDB Connection Pooling

- **Rule**: Never call `mongoose.connect()` directly inside route handlers without cached connection handling.
- **Standard**: Use the singleton pattern in `lib/db.ts` to cache connections across hot serverless lambdas.

### 5.3 Safe String Sanitization & XSS Defense

- **Rule**: Never use `dangerouslySetInnerHTML`.
- **Rule**: All user-provided strings (quiz title, question text, nickname) must be sanitized and HTML-escaped before display.

### 5.4 Error Handling & User-Facing Copy

- **Rule**: Never expose raw database errors, stack traces, or internal server errors to client responses.
- **Standard**: Return standardized JSON: `{ success: false, error: string }` with appropriate HTTP status codes (`400`, `401`, `404`, `429`, `500`).
- **Tone**: Error messages must be friendly, clear, and reassuring—never technical jargon.

---

## 6. Documentation & Architecture Graph Maintenance Invariant

### 6.1 Context Graph Change Logging (`agent/GRAPH_CONTEXT.md`)
- **Rule**: Whenever any major or structurally significant change is made to any module, data schema, security boundary, or route topology, the AI agent **MUST** add a log entry to Section 7 of [agent/GRAPH_CONTEXT.md](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/agent/GRAPH_CONTEXT.md) and update the affected Mermaid diagram(s).
- **Threshold**: Do NOT log minor cosmetic or trivial bug fixes. Only log architectural modifications, new collections/fields, altered security policies, or major component workflow shifts.

### 6.2 Living Documentation Maintenance
- **Rule**: The following documentation files in `/agent` must be actively maintained and kept synchronized with code changes:
  1. [agent/task.md](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/agent/task.md): Update progress, check completed tasks, and bump version when milestones complete.
  2. [agent/architecture.md](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/agent/architecture.md): Keep system patterns, tech stack, and pipelines accurate.
  3. [agent/database.md](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/agent/database.md): Keep Mongoose schemas, indexes, and query projections accurate.
  4. [agent/decisions.md](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/agent/decisions.md): Record new Architectural Decision Records (ADRs) whenever major technical choices are made or modified.
