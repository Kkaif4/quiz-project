# Implementation Plan: Friendship Quiz MVP

This implementation plan synthesizes the specifications from [MVP.md](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/agent/MVP.md) and [Schema.md](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/agent/Schema.md). It outlines the architecture, data validation rules, security hardening (rate limiting, hashing, server-side scoring, sanitization), and a phase-by-phase task breakdown with explicit priorities (**P0**, **P1**, **P2**).

---

## 1. Architecture & Security Overview

```
                          ┌───────────────────────────┐
                          │   Client Browser / Mobile  │
                          └─────────────┬─────────────┘
                                        │
           ┌────────────────────────────┼───────────────────────────┐
           ▼                            ▼                           ▼
     /create (Creator)          /q/:code (Friend)         /manage/:token (Owner)
           │                            │                           │
           └────────────────────────────┼───────────────────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │   Next.js App Router      │
                          │   (Next 16 + React 19)    │
                          ├───────────────────────────┤
                          │ • Middleware / Rate Limit │
                          │ • Zod Payload Validation  │
                          │ • SHA-256 Token / IP Hash │
                          │ • Server-Side Scoring     │
                          │ • Data Sanitization       │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │       MongoDB Atlas       │
                          │  quizzes, attempts,       │
                          │  reports, users (future)  │
                          └───────────────────────────┘
```

### Core Security & Integrity Tenets

1. **Server-Side Scoring Only**: The client never sees `correctOptionId`. Public quiz queries explicitly project out answer keys. Scoring is computed strictly on the server against the database record.
2. **Cryptographic Identity Without Accounts**: Raw owner tokens (`crypto.randomBytes(32).toString('hex')`) are stored in hashed form (`SHA-256`) in MongoDB. Raw tokens exist only in the owner's URL and secure cookies/localStorage.
3. **Multi-Tier Rate Limiting**: In-memory / edge-compatible token bucket or sliding-window rate limiters on `POST /api/quizzes`, `POST /api/quizzes/:code/attempts`, and `POST /api/reports` to protect against database exhaustion, spam bots, and DoS attacks.
4. **Data Minimization & Teen Privacy**: No phone numbers, emails, contacts, or birthdates collected. IP addresses are hashed with a secret salt (`ipHash = sha256(ip + SALT)`) for anti-abuse tracking without storing PII.
5. **Anti-Bot & Anti-Cheat**: Timing thresholds (minimum completion time check), honeypot form fields, and payload size bounds.

---

## 2. Validation & Security Rulebook

| Surface                                                     | Validation Rules                                                                                                                                                                                                                  | Security / Protection                                                                                                                                                       |
| :---------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Quiz Creation** (`POST /api/quizzes`)                     | • Title: 1–100 chars, trimmed<br>• Description: max 300 chars<br>• Questions: 3–15 items<br>• Question text: 1–300 chars<br>• Options: 2–6 per question, 1–100 chars each<br>• `correctOptionId` must match one of the option IDs | • Rate limit: 5 requests / IP / hour<br>• Max payload: 50 KB<br>• Generates `nanoid(8)` code and `crypto.randomBytes(32)` owner token<br>• Hashes owner token before saving |
| **Quiz Player** (`GET /q/:code`)                            | • Quiz code: 6–10 alphanumeric chars                                                                                                                                                                                              | • **Answer key sanitization**: strip `correctOptionId` before returning to client<br>• Check `status === "active"`                                                          |
| **Attempt Submission** (`POST /api/quizzes/:code/attempts`) | • Nickname: 1–30 chars, trimmed, escaped<br>• Answers: array matching quiz question IDs<br>• Option IDs must belong to the respective question                                                                                    | • Rate limit: 10 attempts / IP / 10 minutes<br>• Timing validation (flag submissions faster than 3 seconds)<br>• Honeypot field checking<br>• Computes score server-side    |
| **Owner Dashboard** (`/manage/:ownerToken`)                 | • Token: 64-char hex string                                                                                                                                                                                                       | • Hashes incoming token (`SHA-256`) to query database<br>• Sets HTTP-only, SameSite cookie for "My Quizzes" access                                                          |
| **Abuse Reports** (`POST /api/reports`)                     | • Reason: `["spam", "harassment", "sexual", "hate", "impersonation", "other"]`<br>• Description: max 500 chars                                                                                                                    | • Rate limit: 3 reports / IP / hour<br>• Stores quiz reference and status (`pending`)                                                                                       |

---

## 3. Phased Implementation Roadmap

### Phase 1: Core Foundation, Database & Validation (P0)

> **Goal**: Establish the base infrastructure, MongoDB connection pooling, Mongoose models, Zod validation schemas, and cryptographic utilities.

- [ ] **Task 1.1: Dependencies & Configuration** `[P0]`
  - Install runtime dependencies: `mongoose`, `zod`, `nanoid`, `lucide-react`, `canvas-confetti`.
  - Configure `.env.example` with `MONGODB_URI`, `APP_URL`, `TOKEN_SALT`, `RATE_LIMIT_ENABLED`.
  - Next.js 16 / React 19 compatibility audit (ensure async `params` and `searchParams` conventions are followed).
- [ ] **Task 1.2: MongoDB Connection Pooling** `[P0]`
  - Create [lib/db.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/lib/db.ts) implementing cached connection singleton for serverless Next.js execution.
  - Add connection event logging and graceful disconnect handlers.
- [ ] **Task 1.3: Mongoose Schemas & Indexes** `[P0]`
  - Implement [models/Quiz.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/models/Quiz.ts):
    - Embedded `QuizQuestionSchema` (with validator for 2–6 options).
    - Unique index on `code` and `ownerTokenHash`.
    - Index on `status`, `ownerId`.
  - Implement [models/Attempt.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/models/Attempt.ts):
    - Unique index on `code`.
    - Compound indexes: `{ quizId: 1, createdAt: -1 }` and `{ quizId: 1, score: -1 }`.
  - Implement [models/Report.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/models/Report.ts):
    - Index on `quizId` and `status`.
  - Implement [models/User.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/models/User.ts) (placeholder for future OAuth claim flow).
- [ ] **Task 1.4: Validation Engine (Zod)** `[P0]`
  - Create [lib/validation.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/lib/validation.ts):
    - `CreateQuizSchema` (validating limits: 3–15 questions, 2–6 options, correct answer presence).
    - `SubmitAttemptSchema` (validating nickname length, answers array structure).
    - `CreateReportSchema` (validating categories and description limit).
- [ ] **Task 1.5: Crypto & Token Utilities** `[P0]`
  - Create [lib/tokens.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/lib/tokens.ts):
    - `generateOwnerToken()`: 32 cryptographically secure random bytes (64 hex characters).
    - `hashToken(token: string)`: SHA-256 hashing.
    - `generateCode(length: number)`: URL-friendly nano code (`[a-zA-Z0-9]`).
    - `hashIp(ip: string)`: SHA-256 with salt for private abuse tracking.

---

### Phase 2: Server Protection, Rate Limiting & API Core (P0 / P1)

> **Goal**: Build bulletproof APIs with built-in rate limiting, server-side scoring, input sanitization, and answer sanitization.

- [ ] **Task 2.1: Server Rate Limiter Engine** `[P0]`
  - Create [lib/rate-limit.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/lib/rate-limit.ts):
    - Token-bucket / sliding window in-memory rate limiter with LRU cache cleanup (zero external dependencies required for MVP, easily swappable with Upstash Redis later).
    - Configurable presets:
      - `quizCreate`: 5 req / hour per IP.
      - `quizAttempt`: 10 req / 10 min per IP.
      - `quizReport`: 3 req / hour per IP.
    - Returns headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`.
- [ ] **Task 2.2: Quiz Creation API (`POST /api/quizzes`)** `[P0]`
  - Implement [app/api/quizzes/route.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/api/quizzes/route.ts):
    - Apply rate limiting & body size validation.
    - Validate payload with `CreateQuizSchema`.
    - Generate unique public `quizCode` and private `ownerToken`.
    - Hash owner token and save document in MongoDB.
    - Append owner token into HTTP-only cookie `quiz_owner_tokens`.
    - Return `quizCode`, raw `ownerToken`, and `manageUrl`.
- [ ] **Task 2.3: Public Quiz Retrieval API & Server Action** `[P0]`
  - Implement public loader function in [lib/quiz.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/lib/quiz.ts):
    - Query active quiz by `code`.
    - **Crucial Security Step**: Project out `ownerTokenHash` and `questions.correctOptionId`.
    - Increment views counter atomically (`$inc: { "stats.views": 1 }`).
- [ ] **Task 2.4: Attempt Submission & Server-Side Scoring (`POST /api/quizzes/[quizCode]/attempts`)** `[P0]`
  - Implement [app/api/quizzes/[quizCode]/attempts/route.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/api/quizzes/[quizCode]/attempts/route.ts):
    - Rate limit check and honeypot validation.
    - Validate with `SubmitAttemptSchema`.
    - Load full quiz (including `correctOptionId`).
    - Compute score: match each submitted answer against `correctOptionId`.
    - Calculate `score`, `total`, `percentage = Math.round((score / total) * 100)`.
    - Generate `attemptCode`, hash IP, save Attempt record.
    - Atomically increment quiz stats (`$inc: { "stats.attempts": 1 }`).
    - Return `attemptCode`, `score`, `total`, `percentage`.
- [ ] **Task 2.5: Abuse Reporting API (`POST /api/reports`)** `[P1]`
  - Implement [app/api/reports/route.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/api/reports/route.ts):
    - Rate limit check.
    - Validate payload with `CreateReportSchema`.
    - Create pending Report record in MongoDB.

---

### Phase 3: Core Viral Loop & Frontend UX (P0 / P1)

> **Goal**: Deliver a polished, mobile-first frontend supporting the viral loop: Create → Share → Answer → Result → Create.

- [ ] **Task 3.1: Starter Templates & Quiz Creation Page** `[P0]`
  - Create [lib/templates.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/lib/templates.ts) with preset themes:
    - _"Best Friend Test"_ (7 fun questions).
    - _"How Well Do You Know Me?"_ (7 lifestyle questions).
    - _"Funny Friend Test"_ (7 silly dilemmas).
    - _"My Favorites"_ (food, movie, hobby, vacation).
  - Implement [components/quiz/QuizCreator.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/components/quiz/QuizCreator.tsx) & [components/quiz/QuestionEditor.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/components/quiz/QuestionEditor.tsx):
    - Clean question list with add/remove/reorder.
    - Options input with radio selection for the correct answer.
    - Template selector modal/drawer.
    - Form validation feedback before submission.
  - Implement [app/create/page.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/create/page.tsx).
- [ ] **Task 3.2: Public Quiz Taking Page (`/q/[quizCode]`)** `[P0]`
  - Implement [app/q/[quizCode]/page.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/q/[quizCode]/page.tsx) and [components/quiz/QuizPlayer.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/components/quiz/QuizPlayer.tsx):
    - Async Next 16 params resolution.
    - Nickname prompt screen.
    - Step-by-step or clean single-scroll question cards with active animations.
    - Mobile-optimized touch targets (minimum 48px).
    - Progress bar ("Question X of Y").
    - Submit handler dispatching to attempts API.
    - Report Quiz button with modal dialog.
- [ ] **Task 3.3: Result Page & Viral Hook (`/q/[quizCode]/result/[attemptCode]`)** `[P0]`
  - Implement [app/q/[quizCode]/result/[attemptCode]/page.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/q/[quizCode]/result/[attemptCode]/page.tsx) and [components/quiz/QuizResult.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/components/quiz/QuizResult.tsx):
    - Confetti celebration animation for scores > 70%.
    - Dynamic scorecard message based on percentage:
      - 90–100%: "True Soulmate! 🔥"
      - 70–89%: "You know them pretty well! 🎉"
      - 40–69%: "Not bad, but room to improve! 👀"
      - 0–39%: "Do you even know each other?! 😂"
    - Primary CTA: **"Create My Own Quiz"** (routes directly to `/create` with prompt).
    - Secondary CTA: **"Share My Result"** (copies result text or invokes Web Share API).

---

### Phase 4: Owner Management & Dashboard (P1)

> **Goal**: Allow quiz creators to monitor live attempts, view rankings, copy private dashboard links, and manage quiz availability.

- [ ] **Task 4.1: Owner Authentication via Token Hash** `[P1]`
  - Implement server loader in [app/manage/[ownerToken]/page.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/manage/[ownerToken]/page.tsx):
    - Hash raw token using `hashToken(ownerToken)`.
    - Fetch Quiz matching `ownerTokenHash`.
    - Return 404/unauthorized UI if not found.
    - Fetch attempts for this quiz sorted by `score: -1` and `createdAt: -1`.
- [ ] **Task 4.2: Owner Dashboard UI Components** `[P1]`
  - Implement [components/dashboard/ResultList.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/components/dashboard/ResultList.tsx) & [components/dashboard/Ranking.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/components/dashboard/Ranking.tsx):
    - Summary stat cards: Total Views, Total Attempts, Average Score.
    - Leaderboard ranking with medal badges (🥇, 🥈, 🥉).
    - Chronological attempts table with nickname, score, and submission timestamp.
  - Implement [components/quiz/ShareCard.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/components/quiz/ShareCard.tsx):
    - Public quiz link copy button with toast feedback.
    - Direct WhatsApp / Messenger / Twitter share buttons.
    - "Save Private Dashboard Link" alert box with one-click copy.
- [ ] **Task 4.3: Owner Quiz Controls** `[P1]`
  - Implement server action or route handler to toggle quiz status (`active` vs `disabled`).
  - Option to clear or delete test attempts.
- [ ] **Task 4.4: "My Quizzes" Home Hub (`/`)** `[P1]`
  - Implement [app/page.tsx](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/app/page.tsx):
    - Hero section with viral pitch and "Create Quiz in 60 Seconds" button.
    - Reads `quiz_owner_tokens` cookie (or localStorage fallback).
    - If owner tokens exist, fetch and display "Your Active Quizzes" cards with attempt counts.

---

### Phase 5: Server Hardening, Security & Anti-Abuse (P1 / P2)

> **Goal**: Fortify the application against malicious payloads, bot floods, and inappropriate user-generated content.

- [ ] **Task 5.1: HTTP Security Headers & Middleware** `[P1]`
  - Create [middleware.ts](file:///home/kaif/storage/LemonRangers/lemon-quiz-meniac/middleware.ts) or configure `next.config.ts` headers:
    - `Content-Security-Policy` (preventing inline XSS execution).
    - `X-Frame-Options: DENY` (clickjacking protection).
    - `X-Content-Type-Options: nosniff`.
    - `Referrer-Policy: strict-origin-when-cross-origin`.
  - Add request body size limiter to route handlers.
- [ ] **Task 5.2: Content Sanitization & Profanity Filtering** `[P1]`
  - Add basic slur/profanity detection for quiz titles and nicknames.
  - Strict text sanitization: escape all user-rendered strings to prevent HTML/script injection.
- [ ] **Task 5.3: Anti-Cheat & Bot Deterrence** `[P2]`
  - Add invisible honeypot field `website` to attempt form (reject any payload where `website` is populated).
  - Add timing threshold: reject or flag attempts submitted in under 3 seconds.
  - Enforce `maxAttemptsPerPerson` using signed browser fingerprint / cookie.
- [ ] **Task 5.4: Basic Admin Moderation View (`/admin/reports`)** `[P2]`
  - Simple token-protected page (via env `ADMIN_SECRET_KEY`) to view pending reports and disable offending quizzes.

---

### Phase 6: Viral Optimization, Polish & Verification (P2)

> **Goal**: Maximize conversion rate (K-factor), responsiveness, and ensure zero regressions.

- [ ] **Task 6.1: Social Sharing & Dynamic Metadata** `[P2]`
  - Implement Open Graph and Twitter card metadata for `/q/[quizCode]` and results pages.
  - Pre-format WhatsApp share text:
    > _"Hey! Rahul created a Friendship Quiz to see how well you know him. Can you score 10/10? 👉 https://domain.com/q/a8Kx29"_
- [ ] **Task 6.2: Loading States, Skeletons & Error Boundaries** `[P2]`
  - Add `loading.tsx` and `error.tsx` for `/q/[quizCode]`, `/manage/[ownerToken]`, and `/create`.
  - Polished empty states when a quiz has 0 attempts yet.
- [ ] **Task 6.3: End-to-End Verification Checklist** `[P0]`
  - Test Full Loop: Creator makes quiz -> gets owner token -> shares link -> friend plays -> server scores accurately -> friend sees score -> friend clicks "Create My Own Quiz".
  - Test Rate Limiter: verify `429 Too Many Requests` is returned when limits are exceeded.
  - Test Security: verify `correctOptionId` is NEVER leaked in `/q/[quizCode]` API responses or HTML source.
  - Test Database: verify compound indexes are utilized for leaderboard and attempt queries.

---

## 4. Priority Matrix

```text
Priority P0 (Blockers / Core MVP)
├── Database connection & Mongoose models (Quiz, Attempt, Report)
├── Zod validation schemas & cryptographic tokens (SHA-256)
├── Server-side scoring engine (never send correctOptionId to client)
├── Quiz creation flow & public quiz player
├── Result page with "Create My Own Quiz" viral CTA
└── Basic in-memory rate limiting on creation & attempt submission

Priority P1 (High Impact / Stability & Ownership)
├── Owner dashboard (/manage/:token) with real-time rankings
├── Cookie / LocalStorage owner token persistence ("My Quizzes" on /)
├── Starter templates ("Best Friend", "How Well Do You Know Me?")
├── Abuse reporting flow & modal
├── HTTP security headers & payload size bounding
└── XSS escaping and nickname sanitization

Priority P2 (Polish / Viral Growth & Admin)
├── Social share text generators (WhatsApp / Web Share API)
├── Open Graph dynamic tags
├── Honeypot bot protection & timing validation
├── Admin report review screen
└── Loading skeletons and animated score celebration
```
