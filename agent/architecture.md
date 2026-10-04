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

| Layer             | Technology                     | Rationale                                                  |
| :---------------- | :----------------------------- | :--------------------------------------------------------- |
| **Framework**     | Next.js 16 (Canary) / React 19 | App Router, Server Components, async request handling      |
| **Styling**       | Tailwind CSS v4                | Rapid utility styling, custom typography, zero runtime CSS |
| **Database**      | MongoDB Atlas via Mongoose     | Flexible document schema, seamless question embedding      |
| **Validation**    | Zod                            | Runtime schema validation for requests and models          |
| **Security**      | Node.js `crypto`               | SHA-256 token and IP hashing, high-entropy tokens          |
| **Rate Limiting** | In-Memory Sliding Window (LRU) | Zero-dependency IP rate limiting for single-node / MVP     |
| **Icons**         | Lucide React                   | Sharp vector iconography, zero cheap system OS emojis      |
| **Effects**       | `canvas-confetti`              | High-performance canvas particle celebrations              |

---

## 3. Identity, Browser Blueprint & Ownership Architecture

To eliminate drop-off from registration walls while maintaining persistent creator identity across browser sessions, Lemon Quiz combines **Client Browser Blueprints**, **Salted IP Anchors**, and **Capability URLs**:

```
                       ┌─────────────────────────┐
                       │   Creator creates quiz  │
                       └────────────┬────────────┘
                                    │
                                    ▼
       ┌────────────────────────────────────────────────────────┐
       │ 1. Mandatory Creator Name: "Sarah" (sanitized)         │
       │ 2. Client Browser Blueprint: SHA-256 Web Crypto Hash   │
       │ 3. Salted Server IP Hash: SHA-256(clientIp + SALT)     │
       │ 4. Public Quiz Code: nanoId(8)   -> /q/a8Kx29          │
       │ 5. Raw Owner Token:  crypto(32)  -> 64-char hex string │
       └────────────────────────────┬───────────────────────────┘
                                    │
                      ┌─────────────┴─────────────┐
                      ▼                           ▼
          ┌───────────────────────┐   ┌───────────────────────┐
          │ SHA-256 Hashes in DB  │   │ Raw Token to Client   │
          │ -> User Collection    │   │ -> Private Manage URL │
          │    (blueprint, ipHash)│   │ -> HTTP-only Cookie   │
          │ -> Quiz.ownerTokenHash│   │ -> LocalStorage Backup│
          │ -> Quiz.ownerId (ref) │   └───────────────────────┘
          └───────────────────────┘
```

- **Browser Blueprint (`lib/fingerprint.ts`)**: Native Web Crypto SHA-256 combining Canvas 2D render geometry, screen resolution, timezone, locale, hardware concurrency, and platform. Zero external dependencies (<3ms, 0 KB bundle increase).
- **Owner Dashboard Access**: When navigating to `/manage/[ownerToken]`, the server computes `hashToken(ownerToken)` and matches against `Quiz.ownerTokenHash`. The database never contains plaintext tokens.
- **Returning User Recovery (`/api/users/identify`)**: Returning creators visit `/` or `/create`. The client computes their browser blueprint. The server matches the user and returns their profile and active quizzes, greeting them with `"Welcome back, Sarah!"` even if cookies or `localStorage` were purged.

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
│   ├── admin/              # Moderation console with search-cloaking layout
│   ├── api/                # API Route Handlers
│   ├── create/             # Quiz creator view with canonical tag
│   ├── manage/             # Owner dashboard view with search-cloaking layout
│   ├── q/                  # Public quiz & result view with canonical tags
│   ├── manifest.ts         # Native Web App Manifest (/manifest.webmanifest)
│   ├── robots.ts           # Dynamic search crawler directives (/robots.txt)
│   ├── sitemap.ts          # Dynamic XML sitemap with 1h edge ISR (/sitemap.xml)
│   └── page.tsx            # Home page with WebSite, WebApp & FAQPage JSON-LD
├── components/             # React 19 UI components
│   ├── dashboard/          # Owner stats, rankings, lists
│   ├── home/               # FAQ accordion (FaqSection.tsx)
│   ├── quiz/               # Creator, player, result, share card
│   ├── seo/                # Sanitized Schema.org JSON-LD component (JsonLd.tsx)
│   └── ui/                 # Reusable buttons, badges, inputs
├── lib/                    # Shared server & client utilities
│   ├── db.ts               # Mongoose connection singleton
│   ├── fingerprint.ts      # Native Web Crypto browser blueprint engine
│   ├── rate-limit.ts       # Sliding window rate limiter
│   ├── seo.ts              # Authoritative origin resolver & baseUrl normalization
│   ├── tokens.ts           # Token generation & hashing
│   └── validation.ts       # Zod schemas
├── models/                 # Mongoose schemas & models
│   ├── Attempt.ts
│   ├── Quiz.ts             # Indexed with compound { status: 1, updatedAt: -1 }
│   ├── Report.ts
│   └── User.ts
└── types/                  # Strict TypeScript interfaces
```

---

## 7. SEO & Search Engine Indexing Infrastructure

1. **Dynamic Metadata Route Handlers**:
   - `app/sitemap.ts`: Dynamic XML sitemap indexing static routes (`/`, `/create`) and active public quizzes (`/q/[quizCode]`) with 1-hour ISR (`revalidate = 3600`).
   - `app/robots.ts`: Rules explicitly allowing `/`, `/create`, `/q/`, `/api/og*` while strictly blocking capability URLs (`/manage/*`, `/admin/*`, `/api/*`).
   - `app/manifest.ts`: Native PWA manifest with brand tokens for Google mobile search installability.
2. **Zero-Leakage Structured Data (Schema.org JSON-LD)**:
   - Type-safe, XSS-escaped Server Component `components/seo/JsonLd.tsx` converts `<` to `\u003c`.
   - Landing page embeds `WebSite`, `WebApplication`, `FAQPage`, and `BreadcrumbList`.
   - Quiz pages (`/q/[quizCode]`) embed `Quiz` schema with question prompts and `suggestedAnswer` options. **Never outputs `acceptedAnswer` or `correctOptionId`**.
3. **Canonicalization & Equity Consolidation**:
   - Global `metadataBase` configured with authoritative `getBaseUrl()`.
   - Result pages (`/q/[quizCode]/result/[attemptCode]`) canonicalize to parent quiz `/q/[quizCode]` with `robots: { index: false, follow: true, noarchive: true }`.
4. **Defense-in-Depth Search Cloaking**:
   - Layouts `app/admin/layout.tsx` and `app/manage/[ownerToken]/layout.tsx` enforce `robots: { index: false, follow: false, noarchive: true }`.
   - `next.config.ts` injects `X-Robots-Tag: noindex, nofollow, noarchive` on `/manage/:path*` and `/admin/:path*`.

---

## 11. Owner Recognition, Dashboard Auto-Routing & Play Screen Protection

To prevent quiz creators from accidentally taking their own quizzes or losing access to their dashboard, a multi-layered owner recognition shield is enforced:

1. **User Profile Token Persistence**: When a quiz is created, its capability token is stored on the creator's `User` record (`$addToSet: { ownerTokens: ownerToken }`).
2. **Returning User Token Hydration**: When `/api/users/identify` recovers an owner via browser fingerprint, all associated quizzes are hydrated with their raw `ownerToken` via a hash-lookup map (`hashToken(t) -> t`), ensuring homepage cards render `Manage / Leaderboard` (`/manage/[ownerToken]`) instead of `View Quiz`.
3. **Server-Side Auto-Routing on `/q/[quizCode]`**: The server component `app/q/[quizCode]/page.tsx` checks `cookies().get("quiz_owner_tokens")`. If candidate tokens match `ownerTokenHash` and `searchParams.preview !== "true"`, the server immediately executes `redirect("/manage/" + matchedToken)`. If `preview === "true"`, it renders an **Owner Preview Floating Banner** with a direct link back to the dashboard.
4. **Client-Side Shield & Owner Welcome Screen (`QuizPlayer.tsx`)**: If cookies were purged or blocked, `QuizPlayer` queries `/api/quizzes/[quizCode]/owner-check` using client tokens and browser fingerprint. If verified as owner, it renders the **Owner Welcome Screen** with actions to open the dashboard, copy the share link, or toggle preview mode. Creators are never forced to take their own quiz.
5. **Bulletproof Creation Transition (`QuizCreator.tsx`)**: Displays an instant celebratory overlay upon creation and triggers `window.location.assign(result.manageUrl)` for guaranteed hard navigation across mobile browsers.

