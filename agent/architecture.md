# System Architecture: Lemon Quiz

> **Document Purpose**: Authoritative reference for the system architecture, design patterns, security model, and component layout.  
> **Maintainer Rule**: Any agent making fundamental structural or architectural changes must update this document in tandem.

---

## 1. High-Level Architecture Overview

Lemon Quiz is a lightweight, viral, full-stack Next.js application built to deliver maximum simplicity, zero-friction viral sharing, and rock-solid security.

```
                          ┌───────────────────────────┐
                          │   Client Browser / Mobile  │
                          │   (iOS Safari, Android)   │
                          └─────────────┬─────────────┘
                                        │ HTTPS
                                        ▼
                          ┌───────────────────────────┐
                          │  Next.js 16 App Router    │
                          ├───────────────────────────┤
                          │ • Security Middleware     │
                          │ • Rate Limiter Guard      │
                          │ • Zod Payload Validation  │
                          │ • Server-Side Scoring     │
                          │ • Data Sanitization       │
                          └─────────────┬─────────────┘
                                        │
                                        ▼
                          ┌───────────────────────────┐
                          │   MongoDB Atlas Cluster   │
                          │  (Cached Mongoose Pool)   │
                          └───────────────────────────┘
```

### Architectural Principles
1. **Monolithic Simplicity**: Single repository, single framework (Next.js), single database (MongoDB). No Redis, microservices, background message queues, or WebSockets for the MVP.
2. **Sessionless Ownership**: No passwords, emails, or OAuth walls required to create a quiz. Ownership is established via cryptographically secure random tokens.
3. **Server-Side Authority**: The client is never trusted to calculate scores or verify answers. The answer key is never transmitted across the wire to players.
4. **Sub-second Loading**: Embedded question document modeling enables single-query lookups for instant quiz loading.

---

## 2. Technology Stack

| Layer | Technology | Rationale |
| :--- | :--- | :--- |
| **Framework** | Next.js 16 (Canary) / React 19 | App Router, Server Components, async request handling |
| **Styling** | Tailwind CSS v4 | Rapid utility styling, custom typography, zero runtime CSS |
| **Database** | MongoDB Atlas via Mongoose | Flexible document schema, seamless question embedding |
| **Validation** | Zod | Runtime schema validation for requests and models |
| **Security** | Node.js `crypto` | SHA-256 token and IP hashing, high-entropy tokens |
| **Rate Limiting**| In-Memory Sliding Window (LRU) | Zero-dependency IP rate limiting for single-node / MVP |
| **Icons** | Lucide React | Sharp vector iconography, zero cheap system OS emojis |
| **Effects** | `canvas-confetti` | High-performance canvas particle celebrations |

---

## 3. Identity & Ownership Architecture

To eliminate drop-off from registration walls, Lemon Quiz uses **Capability URLs and Hashed Tokens**:

```
                       ┌─────────────────────────┐
                       │   Creator creates quiz  │
                       └────────────┬────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ Generates:                                             │
       │ 1. Public Quiz Code: nanoId(8)   -> /q/a8Kx29          │
       │ 2. Raw Owner Token:  crypto(32)  -> 64-char hex string │
       └────────────────────────────┬───────────────────────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      ▼                           ▼
          ┌───────────────────────┐   ┌───────────────────────┐
          │ SHA-256 Token Hash    │   │ Raw Token to Client   │
          │ -> Saved in MongoDB   │   │ -> Private URL        │
          │   quizzes collection  │   │ -> HTTP-only Cookie   │
          └───────────────────────┘   │ -> LocalStorage Backup│
                                      └───────────────────────┘
```

- **Owner Dashboard Access**: When navigating to `/manage/[ownerToken]`, the server computes `hashToken(ownerToken)` and matches against `Quiz.ownerTokenHash`. The database never contains plaintext tokens.
- **"My Quizzes" Hub**: Returning creators visit `/` and their browser presents the `quiz_owner_tokens` cookie. The server fetches active quizzes matching those hashes without requiring a login session.

---

## 4. Request & Security Pipeline

```
  Client Request
       │
       ▼
┌───────────────────────────┐
│ 1. Rate Limiting Check    │ ──[Exceeded]──► 429 Too Many Requests
└──────────────┬────────────┘
               │ Pass
               ▼
┌───────────────────────────┐
│ 2. Payload Size Limit     │ ──[> 50KB]────► 413 Payload Too Large
└──────────────┬────────────┘
               │ Pass
               ▼
┌───────────────────────────┐
│ 3. Zod Schema Validation  │ ──[Invalid]───► 400 Bad Request
└──────────────┬────────────┘
               │ Valid
               ▼
┌───────────────────────────┐
│ 4. Anti-Bot Honeypot      │ ──[Triggered]─► 400 / Drop Silently
└──────────────┬────────────┘
               │ Pass
               ▼
┌───────────────────────────┐
│ 5. Business Logic Handler │
│    • Authoritative Scoring│
│    • Projection of Answers│
└──────────────┬────────────┘
               │
               ▼
┌───────────────────────────┐
│ 6. Cached Mongoose Query  │
└───────────────────────────┘
```

---

## 5. Security & Trust Boundaries

1. **Answer Key Protection**: The field `Quiz.questions[].correctOptionId` is restricted to server-side scoring routines. All public routes (`GET /api/quizzes/[code]`, `/q/[code]`) explicitly use `.select("-questions.correctOptionId -ownerTokenHash")`.
2. **Teen Privacy & Data Minimization**:
   - Zero collection of PII (names, emails, phones, locations).
   - Nicknames are capped at 30 characters and strictly sanitized.
   - IP addresses are salted and hashed (`SHA-256(ip + SALT)`) to prevent reverse identification.
3. **Anti-Cheat & Timing Defense**:
   - Submissions completed faster than 3 seconds are rejected or flagged.
   - Invisible honeypot inputs capture naive bot submissions.

---

## 6. Directory Structure & Conventions

```text
lemon-quiz-meniac/
├── agent/                  # System documentation & agent governance
│   ├── architecture.md     # System architecture specification
│   ├── database.md         # Database schema & index definitions
│   ├── decisions.md        # Architectural decision records (ADRs)
│   ├── design.md           # Premium UI/UX design specifications
│   ├── GRAPH_CONTEXT.md    # System relationship & state graphs
│   ├── RULES.md            # Non-negotiable AI rulebook
│   └── task.md             # Versioned task tracker
├── app/                    # Next.js 16 App Router
│   ├── api/                # API Route Handlers
│   ├── create/             # Quiz creator view
│   ├── manage/             # Owner dashboard view
│   ├── q/                  # Public quiz & result view
│   └── page.tsx            # Home & My Quizzes hub
├── components/             # React 19 UI components
│   ├── dashboard/          # Owner stats, rankings, lists
│   ├── quiz/               # Creator, player, result, share card
│   └── ui/                 # Reusable buttons, badges, inputs
├── lib/                    # Shared server & client utilities
│   ├── db.ts               # Mongoose connection singleton
│   ├── rate-limit.ts       # Sliding window rate limiter
│   ├── tokens.ts           # Token generation & hashing
│   └── validation.ts       # Zod schemas
├── models/                 # Mongoose schemas & models
│   ├── Attempt.ts
│   ├── Quiz.ts
│   ├── Report.ts
│   └── User.ts
└── types/                  # Strict TypeScript interfaces
```
