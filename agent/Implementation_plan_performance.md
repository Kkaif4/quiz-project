# Performance Incident: Deep Investigation & Implementation Plan

> **Document Version**: `v1.1.0`  
> **Target Platform**: `Vercel (Next.js App Router + Node.js Serverless + MongoDB Atlas)`  
> **Status**: `Active / Ready for Implementation`  
> **Primary Objective**: Eliminate severe website slowness, achieving sub-150ms API response times, sub-250ms First Contentful Paint (FCP), immediate (<50ms) quiz interactions, and zero redundant database queries.

---

## 1. Architectural Pivot: Cloudflare Workers → Vercel

The application is transitioning deployment from **OpenNext / Cloudflare Workers to Vercel**.

### Key Architectural Benefits:
1. **Full Node.js Runtime Support**: Vercel Serverless Functions execute on native Node.js (Node 20/22). Mongoose natively supports `mongodb+srv://` connection strings with native Node.js DNS resolution (`dns.resolveSrv`) in 5–15ms.
2. **Elimination of Cloudflare Workarounds**: All Cloudflare Workers `workerd` workarounds—specifically the 2–4 sequential HTTPS DNS-over-HTTPS (DoH) lookups to `cloudflare-dns.com` and `dns.google` in `lib/db.ts` and dynamic `@opennextjs/cloudflare` imports—are **completely removed**.
3. **Native Next.js Optimization**: Vercel natively optimizes Next.js streaming SSR, React Server Components (`React.cache()`), Edge caching, and asset compression.

---

## 2. Phase 1: Investigation & Discovery Findings

### 2.1 Database & Connection Layer
- **Cold Start Latency (DoH Overhead)**:
  - In `lib/db.ts`, `resolveMongoSrvUri()` executed sequential HTTPS queries to Cloudflare DoH and Google DoH for both SRV and TXT records.
  - Live measurement of DNS lookups to `auth.rnlfnk4.mongodb.net`:
    - SRV record query: **672 ms**
    - TXT record query: **844 ms**
    - Total DNS lookup time before MongoDB handshake: **~1,516 ms**!
  - **Vercel Fix**: Moving to Vercel allows us to strip the entire DoH HTTPS resolution pipeline and connect directly with Mongoose's native driver.
- **Connection Pooling**:
  - Maintain the cached singleton on `globalThis.mongoose` so warm Vercel serverless containers reuse existing MongoDB connections with 0ms connection overhead.
  - Lower connection timeouts from 15,000ms to 5,000ms for fast failover.

### 2.2 Database Query Duplication & Redundant Roundtrips
- **Server Component Duplicate Queries (`React.cache` Missing)**:
  - On `/q/[quizCode]`: `generateMetadata()` calls `getPublicQuizByCode` (1 DB query), and `QuizPage` component calls it again (1 DB query + 1 update).
  - On `/manage/[ownerToken]`: `generateMetadata()` calls `getOwnerQuizByToken` (1 query), `ManagePage` calls it again (1 query), and `getQuizAttemptsForOwner` runs 2 more queries = **4 DB queries per view**.
  - On `/q/[quizCode]/result/[attemptCode]`: `generateMetadata()` calls `getAttemptResultByCode` (2 queries: `Attempt` + `Quiz`), and `ResultPage` calls it again (2 queries) = **4 DB queries per view**.
- **The Submission-to-Result Waterfall**:
  - When submitting a quiz attempt (`POST /api/quizzes/[quizCode]/attempts`):
    1. `Quiz.findOne` (full document hydration) — *DB call 1*
    2. `Attempt.countDocuments` (frequency check) — *DB call 2*
    3. `Attempt.exists({ code })` (redundant check on 64-char nanoid) — *DB call 3*
    4. `Attempt.create` (insert attempt) — *DB call 4*
    5. `Quiz.updateOne` (atomic counter increment awaited synchronously) — *DB call 5*
    6. Browser navigates to `/q/[quizCode]/result/[attemptCode]` -> Server runs 4 more queries!
    - **Total: 9 sequential database roundtrips** between finishing the quiz and seeing the score.

### 2.3 Static Asset Bloat & Network Contention
- `public/background.png`: **1.2 MB** raw uncompressed PNG loaded in CSS on every single page via `.bg-ambient-image`.
- `public/browser-icon.png`: **1.2 MB** raw 1254x1254 PNG requested by browsers as the favicon/apple-touch-icon.
- **Impact**: Mobile users download **2.4 MB of images** before or alongside application scripts, causing major bandwidth saturation and delayed First Contentful Paint.

### 2.4 Frontend Hydration & SSR Blocking
- `app/page.tsx`: Awaits `cookies()` and runs `getQuizzesByOwnerTokens` at the root Server Component level without `<Suspense>`. The entire marketing hero, CTA, and page shell are blocked until MongoDB responds.
- `next.config.ts`: Completely empty; missing `compress: true`, image optimization, and `serverExternalPackages: ["mongoose"]`.

---

## 3. Phase 2: Ranked Bottlenecks (P0, P1, P2)

```text
P0 — Critical
Problem: 1.5s+ DNS-over-HTTPS (DoH) lookups on DB connection cold starts.
Evidence: dig SRV took 672ms; dig TXT took 844ms. Sequential HTTP loops in resolveMongoSrvUri().
Impact: Every worker cold start and dev module reload waits 1,500ms - 2,000ms before touching MongoDB.
Fix: Strip Cloudflare DoH and use standard Node.js Mongoose connection pooling on Vercel.

P0 — Critical
Problem: Missing React.cache() query deduplication causing 2x–4x redundant DB queries per page.
Evidence: /q/[quizCode] runs getPublicQuizByCode twice; /result runs getAttemptResultByCode twice (4 DB calls); /manage runs getOwnerQuizByToken twice.
Impact: Adds 300ms–800ms of wasted database roundtrip latency to every SSR page load.
Fix: Wrap getPublicQuizByCode, getOwnerQuizByToken, and getAttemptResultByCode in React.cache().

P0 — Critical
Problem: 2.4 MB of uncompressed images (background.png & browser-icon.png) loaded on every page.
Evidence: file public/background.png (1.2MB), file public/browser-icon.png (1.2MB).
Impact: 1.5s–3s network transfer delay on 4G mobile; blocks critical CSS and JS parsing.
Fix: Replace background.png with lightweight optimized WebP/SVG or pure CSS gradient; replace browser-icon.png with properly sized icons (<10KB total).

P1 — High
Problem: 5 sequential DB roundtrips during quiz attempt submission + awaited stats counter.
Evidence: Quiz.findOne -> countDocuments -> Attempt.exists -> Attempt.create -> await Quiz.updateOne.
Impact: Friend waits 800ms–1500ms after answering the last question for submission to complete.
Fix: Remove redundant Attempt.exists check (nanoid 8 chars has 280T combinations + unique index), make Quiz.updateOne non-blocking fire-and-forget, use lean projection on Quiz.findOne.

P1 — High
Problem: SSR stream blocked on homepage by owner cookies and DB query.
Evidence: app/page.tsx calls cookies() and awaits getQuizzesByOwnerTokens before rendering hero shell.
Impact: First Contentful Paint delayed by 400ms–1,000ms for all visitors.
Fix: Wrap MyQuizzesSection in a Server Component <Suspense fallback={null}> boundary so the hero and CTAs stream immediately to the client.

P2 — Medium
Problem: next.config.ts lacks serverExternalPackages and compression.
Evidence: Empty nextConfig object in next.config.ts.
Impact: Increased bundle sizes and uncompressed text responses.
Fix: Configure compress: true and serverExternalPackages: ["mongoose"].
```

---

## 4. Phase 3: Critical Path Specifications

### 4.1 Landing Page
- Hero headline, badges, and primary "Create Quiz" CTA stream to the browser immediately in `<50ms`.
- `MyQuizzesSection` is wrapped inside `<Suspense fallback={null}>` so returning owner history loads progressively without blocking initial paint.

### 4.2 Quiz Creation
- Remove pre-insert `Quiz.exists` roundtrip query loop. Insert directly and handle duplicate key error (code 11000) on the astronomically rare collision.
- Creation API response time drops to `<100ms`.

### 4.3 Quiz Player (Core User Flow)
- **Zero Network Lag During Play**: Question-to-question navigation remains 100% local client state.
- **Fast Submission**:
  - `Quiz.findOne` uses `.lean()` and minimal field projection.
  - Eliminate redundant `Attempt.exists` check.
  - `Quiz.updateOne` (views/attempts counter) is non-blocking (fire-and-forget).
  - Submission latency drops from ~1,200ms to **<150ms**.
- **Anti-Cheat & Security Invariants**: Zero answer key leakage, server-side scoring, honeypot, and timing validation remain 100% intact.

### 4.4 Results Page
- React `cache()` eliminates duplicate queries between `generateMetadata()` and `ResultPage`.
- Result details render immediately without waiting for secondary statistics.

### 4.5 Owner Dashboard
- Single deduplicated query for quiz details.
- `Attempt` history queries use explicit field projection, excluding unused metadata.

---

## 5. Phase 4: Implementation Task Breakdown

### Milestone 1: Pure Node.js Database Connection on Vercel (P0)
- [ ] **TASK-701** `[P0]`: **Streamline `lib/db.ts` for Vercel & Standard Node.js**
  - Remove `resolveMongoSrvUri` DoH functions, Google/Cloudflare HTTPS fetch loops, and OpenNext context checks.
  - Implement clean, standard Mongoose connection singleton with `globalThis.mongoose` caching.
  - Configure optimal connection options (`maxPoolSize: 10`, `serverSelectionTimeoutMS: 5000`, `connectTimeoutMS: 5000`).

### Milestone 2: Query Deduplication via `React.cache()` (P0)
- [ ] **TASK-702** `[P0]`: **Implement `React.cache()` on Data Loaders in `lib/quiz.ts`**
  - Wrap `getPublicQuizByCode` in `React.cache()` to share data between `generateMetadata` and `QuizPage`.
  - Wrap `getOwnerQuizByToken` in `React.cache()` for `ManagePage`.
  - Wrap `getAttemptResultByCode` in `React.cache()` for `ResultPage`.
  - Make `stats.views` increment non-blocking.

### Milestone 3: Asset & Image Optimization (P0)
- [ ] **TASK-703** `[P0]`: **Eliminate 2.4 MB Asset Bloat in `public/` & `globals.css`**
  - Optimize `public/background.png` (1.2 MB) to <30 KB or pure CSS ambient glow.
  - Replace `public/browser-icon.png` (1.2 MB) with properly sized icons (<10 KB total).
  - Update `app/globals.css` and `app/layout.tsx`.

### Milestone 4: Quiz Submission & Creation Streamlining (P1)
- [ ] **TASK-704** `[P1]`: **Streamline `POST /api/quizzes/[quizCode]/attempts`**
  - Eliminate redundant `Attempt.exists` check prior to insert.
  - Make `Quiz.updateOne({ $inc: { "stats.attempts": 1 } })` non-blocking.
  - Use `.lean()` and lean projections on `Quiz.findOne`.
- [ ] **TASK-705** `[P1]`: **Streamline `POST /api/quizzes` Creation Route**
  - Remove redundant `Quiz.exists` pre-check loop; insert directly with index collision error guard.

### Milestone 5: Streaming SSR & Suspense Boundaries (P1)
- [ ] **TASK-706** `[P1]`: **Non-Blocking Homepage Streaming in `app/page.tsx`**
  - Wrap `MyQuizzesSection` inside `<Suspense fallback={null}>` so hero and CTAs stream immediately without waiting for database queries.

### Milestone 6: Next.js Vercel & Node Tuning (P2)
- [ ] **TASK-707** `[P2]`: **Tune `next.config.ts`**
  - Enable gzip/brotli compression (`compress: true`).
  - Add `serverExternalPackages: ["mongoose"]`.

### Milestone 7: Verification & Governance Maintenance (P0)
- [ ] **TASK-708** `[P0]`: **End-to-End Latency Verification & Test Suite Execution**
  - Benchmark TTFB before and after.
  - Run test suite: `tests/phase2.test.ts`, `tests/phase3.test.ts`, `tests/e2e_loop.test.ts`.
  - Run `npm run lint` and `npm run build`.
  - Update `agent/task.md`, `agent/decisions.md` (ADR-010), and `agent/GRAPH_CONTEXT.md`.
