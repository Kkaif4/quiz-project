# Architecture Decision Records (ADRs): Lemon Quiz

> **Document Purpose**: Record of foundational technical, architectural, and design decisions, their rationale, trade-offs, and consequences.  
> **Maintainer Rule**: Whenever a major structural decision is made or amended, record an ADR entry here.

---

## Index of Decisions

- [ADR-001: Sessionless Anonymous Ownership via Cryptographic Hashing](#adr-001-sessionless-anonymous-ownership-via-cryptographic-hashing)
- [ADR-002: Embedded Questions in Quiz Document (No Separate Question Collection)](#adr-002-embedded-questions-in-quiz-document)
- [ADR-003: Strict Server-Side Scoring with Projected Zero-Leakage Answers](#adr-003-strict-server-side-scoring-with-projected-zero-leakage-answers)
- [ADR-004: In-Memory Sliding Window Rate Limiting for MVP](#adr-004-in-memory-sliding-window-rate-limiting-for-mvp)
- [ADR-005: Vector Iconography (Lucide React) over Raw OS Emojis](#adr-005-vector-iconography-lucide-react-over-raw-os-emojis)
- [ADR-006: Salted SHA-256 IP Hashing for Privacy-Preserving Anti-Abuse](#adr-006-salted-sha-256-ip-hashing-for-privacy-preserving-anti-abuse)
- [ADR-007: Denormalized Score and Percentage Storage on Attempt Write](#adr-007-denormalized-score-and-percentage-storage-on-attempt-write)
- [ADR-008: Next.js 16 Canary & React 19 App Router with Async Params](#adr-008-nextjs-16-canary--react-19-app-router-with-async-params)
- [ADR-009: Timing-Safe Admin Authentication & Dual-Layer Content Sanitization](#adr-009-timing-safe-admin-authentication--dual-layer-content-sanitization)
- [ADR-010: DNS-over-HTTPS (DoH) SRV Resolution for Cloudflare Workers (Superseded)](#adr-010-dns-over-https-doh-srv-resolution-for-cloudflare-workers--edge-isolation)
- [ADR-011: Migration to Vercel Serverless Architecture & Node.js Native Connection Pooling](#adr-011-migration-to-vercel-serverless-architecture--nodejs-native-connection-pooling)
- [ADR-012: Browser Blueprint (Fingerprint) & Passwordless User Identity](#adr-012-browser-blueprint-fingerprint--passwordless-user-identity)
- [ADR-013: Comprehensive SEO, Search Engine Indexing & Zero-Leakage Structured Data Architecture](#adr-013-comprehensive-seo-search-engine-indexing--zero-leakage-structured-data-architecture)
- [ADR-014: Owner Recognition, Dashboard Auto-Routing & Play Screen Protection](#adr-014-owner-recognition-dashboard-auto-routing--play-screen-protection)

---

### ADR-001: Sessionless Anonymous Ownership via Cryptographic Hashing

- **Status**: Accepted
- **Context**: For viral consumer apps targeting teens (12–20), mandatory account creation (email/password/OAuth) creates catastrophic drop-off (>80% bounce).
- **Decision**: Creators generate quizzes anonymously. A 32-byte cryptographically secure token (`crypto.randomBytes(32).toString('hex')`) is generated. The database stores only `ownerTokenHash = sha256(rawToken)`. The client retains the raw token via the URL (`/manage/:token`) and an HTTP-only cookie.
- **Consequences**:
  - *Positive*: Zero sign-up friction; immediate quiz creation; zero breach liability for leaked passwords.
  - *Negative*: If a creator loses their URL and clears browser cookies, they cannot recover their quiz without future account claiming.

---

### ADR-002: Embedded Questions in Quiz Document

- **Status**: Accepted
- **Context**: A quiz contains between 3 and 15 questions with 2 to 6 options each. Relational normalization would suggest separate `questions` and `options` collections.
- **Decision**: Embed `questions[]` and `options[]` directly inside the `Quiz` document.
- **Consequences**:
  - *Positive*: Fetching a quiz requires exactly 1 indexed query; zero `$lookup` overhead; atomic updates when editing questions.
  - *Negative*: Questions cannot be shared independently across different quizzes (not required for MVP).

---

### ADR-003: Strict Server-Side Scoring with Projected Zero-Leakage Answers

- **Status**: Accepted
- **Context**: If `correctOptionId` is sent to the client browser, anyone inspecting network payloads or React state can cheat and achieve 100%.
- **Decision**:
  1. Public loaders (`/q/:code`) explicitly exclude `correctOptionId` and `ownerTokenHash`.
  2. The client submits only chosen answers: `[{ questionId, optionId }]`.
  3. The server computes the score by comparing against the database record and saves the result.
- **Consequences**:
  - *Positive*: Absolute integrity of quiz results and leaderboard credibility.
  - *Negative*: Submissions require a server round-trip to display scores (acceptable for async results).

---

### ADR-004: In-Memory Sliding Window Rate Limiting for MVP

- **Status**: Accepted
- **Context**: Public write endpoints (`/api/quizzes`, `/api/quizzes/:code/attempts`, `/api/reports`) are vulnerable to bot spam and database exhaustion.
- **Decision**: Use a lightweight, in-memory sliding-window token bucket limiter with LRU cache eviction in `lib/rate-limit.ts`.
- **Consequences**:
  - *Positive*: Zero external dependencies (no Redis instance required initially); fast response times.
  - *Negative*: In multi-instance serverless deployments, limits are local per instance until an Upstash Redis adapter is swapped in.

---

### ADR-005: Vector Iconography (Lucide React) over Raw OS Emojis

- **Status**: Accepted
- **Context**: Relying on system emojis (`🎉`, `🔥`, `🍕`) produces inconsistent visual results across Android, iOS, and Windows, degrading the product feel to look amateurish.
- **Decision**: Prohibit raw OS emojis in core UI buttons, headers, cards, and badges. Use styled **Lucide React** vector icons inside duotone container pills.
- **Consequences**:
  - *Positive*: Uniform, high-end, device-agnostic appearance matching apps like Spotify Wrapped, BeReal, and Locket.
  - *Negative*: Requires importing icons from `lucide-react`.

---

### ADR-006: Salted SHA-256 IP Hashing for Privacy-Preserving Anti-Abuse

- **Status**: Accepted
- **Context**: Tracking abuse and enforcing rate limits requires IP tracking, but storing raw IPs poses privacy and GDPR concerns, especially for teenagers.
- **Decision**: Hash client IPs using `SHA-256(ip + SALT)` before storing in attempt metadata or checking frequency.
- **Consequences**:
  - *Positive*: Irreversible hashing ensures compliance with data privacy standards while preserving fingerprint uniqueness for anti-abuse.
  - *Negative*: Requires an environment variable `TOKEN_SALT`.

---

### ADR-007: Denormalized Score and Percentage Storage on Attempt Write

- **Status**: Accepted
- **Context**: Leaderboards and result pages repeatedly request scores. Calculating score on read across hundreds of attempts creates CPU overhead.
- **Decision**: Calculate and persist `score`, `total`, and `percentage` in the `Attempt` document during submission.
- **Consequences**:
  - *Positive*: Leaderboard queries are trivial and indexed: `Attempt.find({ quizId }).sort({ score: -1 })`.
  - *Negative*: Minor storage overhead for numbers.

---

### ADR-008: Next.js 16 Canary & React 19 App Router with Async Params

- **Status**: Accepted
- **Context**: The repository is initialized with Next.js `16.3.8` (Canary) and React `19.2.8`. Next.js 15+ introduced breaking changes where route `params` and `searchParams` are Promises.
- **Decision**: All dynamic pages and route handlers must explicitly `await params`.
- **Consequences**:
  - *Positive*: Fully compliant with current Next.js runtime; avoids hydration errors and deprecation warnings.
  - *Negative*: Code must follow strict async conventions.

---

### ADR-009: Timing-Safe Admin Authentication & Dual-Layer Content Sanitization

- **Status**: Accepted
- **Context**: Administrative endpoints (`/api/admin/reports`) and moderation consoles require high security without introducing heavyweight third-party identity providers for MVP. Standard string comparisons (`adminKey === expectedKey`) are vulnerable to side-channel timing attacks that leak secret characters. Furthermore, user-generated content (quiz titles, questions, options, nicknames) submitted by young users is vulnerable to profanity, offensive slurs, leetspeak evasion, and stored Cross-Site Scripting (XSS).
- **Decision**:
  1. *Timing-Safe Constant-Time Verification*: Implement constant-time comparison in `lib/security.ts` using `crypto.timingSafeEqual` over SHA-256 digests of the incoming secret and `ADMIN_SECRET_KEY`. This eliminates timing vulnerabilities regardless of token length while supporting flexible transmission via `Authorization: Bearer`, `x-admin-key`, or `?key=`.
  2. *Dual-Layer Content Sanitization & Slur Filtering*:
     - **Boundary Layer (Zod)**: In `lib/validation.ts`, run leetspeak decoding and regex profanity detection (`lib/sanitize.ts`) to immediately reject offensive submissions on write endpoints.
     - **Transport/Storage Layer**: Strip ASCII control characters, normalize whitespace, and enforce HTML entity encoding (`escapeHtml`) across all textual fields to neutralize script injection without requiring `dangerouslySetInnerHTML`.
- **Consequences**:
  - *Positive*: Immune to side-channel timing attacks; zero external auth infrastructure overhead; comprehensive defense-in-depth against XSS and abusive language; protects teenage user base.
  - *Negative*: Secret rotation requires updating environment variable `ADMIN_SECRET_KEY`; profanity dictionary requires periodic maintenance for emerging teen slang.

---

### ADR-010: DNS-over-HTTPS (DoH) SRV Resolution for Cloudflare Workers & Edge Isolation

- **Status**: Superseded by ADR-011
- **Context**: When deploying the Next.js App Router application to Cloudflare Workers (`workerd` runtime) using `@opennextjs/cloudflare`, connecting to MongoDB Atlas via standard `mongodb+srv://` URIs caused immediate runtime crashes on API routes (`Quiz creation error: at a (worker.js)...`). Cloudflare Workers V8 isolate runtime does not support the native Node.js `dns.resolveSrv` and `dns.resolveTxt` methods invoked by the official MongoDB driver, causing SRV record resolution to throw unhandled exceptions.
- **Decision**:
  Implement a transparent DNS-over-HTTPS (DoH) resolution helper (`resolveMongoSrvUri`) in `lib/db.ts`:
  1. Detect incoming `mongodb+srv://` connection strings.
  2. Parse authentication, cluster hostname, database name, and query parameters.
  3. Query Cloudflare's public DoH resolver (`https://cloudflare-dns.com/dns-query`) with automatic fallback to Google DoH (`https://dns.google/resolve`) over standard HTTPS `fetch` to resolve the SRV records (`_mongodb._tcp.<host>`) into explicit replica-set shard hostnames and ports (`host:27017`).
  4. Query TXT records for `<host>` via DoH to retrieve authoritative `replicaSet` name and `authSource` parameters.
  5. Enforce `ssl=true` and assemble a standard direct connection string: `mongodb://user:pass@host1:27017,host2:27017,host3:27017/db?authSource=admin&replicaSet=...&ssl=true`.
  6. Cache the resolved URI in memory so the DNS lookup executes only once per Worker instance lifecycle.
- **Consequences**:
  - *Positive*: Resolved SRV lookup failures in Cloudflare Workers isolate environments.
  - *Negative*: Added severe 1,500ms+ network delay on cold start due to sequential external HTTPS queries.

---

### ADR-011: Migration to Vercel Serverless Architecture & Node.js Native Connection Pooling

- **Status**: Accepted
- **Context**: The application experienced severe latency bottlenecks under Cloudflare Workers: sequential HTTPS DoH queries added 1,500ms+ delay on cold starts, and workerd edge isolates caused connection churn. Moving the deployment platform to Vercel provides a standard Node.js serverless runtime environment.
- **Decision**:
  1. Deprecate and remove all Cloudflare Workers workarounds (`resolveMongoSrvUri` DoH queries to Cloudflare and Google DNS, `@opennextjs/cloudflare` imports, and `wrangler` bindings).
  2. Use native Node.js Mongoose connection pooling with `mongodb+srv://` connection strings, relying on Node's high-speed native DNS resolution (`dns.resolveSrv` ~10ms).
  3. Cache the Mongoose connection singleton in `globalThis.mongoose` across warm Vercel serverless containers.
  4. Lower connection timeouts (`serverSelectionTimeoutMS: 5000`, `connectTimeoutMS: 5000`) for fast failover.
- **Consequences**:
  - *Positive*: Eliminates 1,500ms+ DoH latency penalty on every cold start; enables full Next.js streaming SSR and native image optimization; standardizes deployment on Vercel.
  - *Negative*: Eliminates edge isolate deployment (not required for MVP).

---

### ADR-012: Browser Blueprint (Fingerprint) & Passwordless User Identity

- **Status**: Accepted
- **Context**: In consumer-social viral applications aimed at teens (ages 12–20), traditional authentication (passwords, emails, OAuth walls) causes severe drop-off (~60–80% friction). While capability tokens and cookies provided anonymous ownership, users frequently lost quiz access when switching devices, using in-app social browsers (Instagram, TikTok webviews), or clearing browser cookies. Additionally, quizzes lacked explicit creator name attribution, hurting virality and social context.
- **Decision**:
  1. *Native Client-Side Browser Blueprint (`lib/fingerprint.ts`)*: Generate a deterministic, high-entropy 64-character SHA-256 hash using native Web Crypto (`window.crypto.subtle`) combined with Canvas 2D render geometry, screen resolution, timezone, locale, hardware concurrency, touch points, and platform. Zero external dependencies, 0 KB bundle weight, <3ms execution.
  2. *Privacy-Preserving Salted IP Anchor*: On the server, compute a salted SHA-256 hash of the client IP (`hashIp(clientIp)`). Raw IPs are never stored. The client fingerprint serves as the device discriminator, while `ipHash` verifies network locality and guards against cross-device spoofing.
  3. *Mandatory Creator Name Flow*: Refactor Stage 1 of `QuizCreator.tsx` to require the creator's name first (e.g. "Sarah"). The quiz title auto-adapts to `"How Well Do You Know Sarah?"`. The name is sanitized via the profanity filter and upserted into the `User` collection.
  4. *Automatic Quiz Recovery (`/api/users/identify`)*: When a returning user opens the app, their browser footprint is matched against MongoDB. If matched, their profile and active quizzes are seamlessly loaded and displayed, greeting them with `"Welcome back, Sarah!"` even if browser cookies or `localStorage` were purged.
- **Consequences**:
  - *Positive*: Zero-friction identity with 0 drop-off; no passwords or emails required; seamless returning user recognition across browser restarts; prevents collisions on shared school/dorm Wi-Fi networks by using client-side canvas/hardware fingerprint as primary key; 100% compliant with zero-PII privacy rules.
  - *Negative*: Device switches (e.g. phone to desktop) still require sharing the `/manage/:ownerToken` capability URL unless accounts are linked post-MVP.

---

### ADR-013: Comprehensive SEO, Search Engine Indexing & Zero-Leakage Structured Data Architecture

- **Status**: Accepted
- **Context**: While peer-to-peer social sharing (WhatsApp, Instagram Stories, Snapchat) drives initial viral loops, capturing organic high-intent search queries ("friendship quiz 2026", "bff test", "how well do your friends know you") represents an immense viral acquisition channel. However, search indexing must balance Googlebot discovery with two non-negotiable security constraints: (1) Capability URLs (`/manage/[ownerToken]`) and moderation surfaces (`/admin/reports`) must NEVER be crawled or indexed, and (2) Public Schema.org structured data (`Quiz` schema) must NEVER expose answer keys (`acceptedAnswer` or `correctOptionId`), which would allow players to inspect page source to cheat.
- **Decision**:
  1. *Metadata Route Handlers*: Implement native Next.js 16 App Router route handlers:
     - `app/sitemap.ts`: Dynamic XML sitemap indexing static routes (`/`, `/create`) and active public quizzes (`/q/[quizCode]`) with 1-hour ISR caching (`revalidate = 3600`) and compound indexed queries (`{ status: 1, updatedAt: -1 }`). Fallbacks gracefully in offline CI environments.
     - `app/robots.ts`: Rules explicitly allowing public viral paths (`/`, `/create`, `/q/`, `/api/og*`) while strictly disallowing private capability URLs (`/manage/*`, `/admin/*`, `/api/*`).
     - `app/manifest.ts`: Native PWA manifest for Google mobile indexing with brand theme `#8B5CF6`.
  2. *Defense-in-Depth Search Cloaking*: Beyond `robots.txt`, dedicated Server Component layouts (`app/manage/[ownerToken]/layout.tsx` and `app/admin/layout.tsx`) enforce `robots: { index: false, follow: false, noarchive: true }`. Furthermore, `next.config.ts` injects HTTP response headers `X-Robots-Tag: noindex, nofollow, noarchive` for `/manage/:path*` and `/admin/:path*`.
  3. *Type-Safe & Sanitized JSON-LD Component (`components/seo/JsonLd.tsx`)*: Render Schema.org structured data on the server with raw `<` characters escaped to `\u003c` to neutralize stored XSS attack vectors.
  4. *Zero-Leakage Structured Data Invariant*: In `app/q/[quizCode]/page.tsx`, `Quiz` Schema includes question text and option choices inside `suggestedAnswer`. `acceptedAnswer` and `correctOptionId` are strictly excluded, preserving game integrity.
  5. *Link Equity Consolidation*: Result pages (`/q/[quizCode]/result/[attemptCode]`) specify `alternates: { canonical: "/q/[quizCode]" }` and `robots: { index: false, follow: true, noarchive: true }`, directing all crawler equity to the root quiz and avoiding crawl budget exhaustion.
  6. *Dynamic Origin Resolution (`lib/seo.ts`)*: Normalize canonical URLs and `metadataBase` across local development, Vercel preview, and production domains, trimming all trailing slashes.
- **Consequences**:
  - *Positive*: Maximizes Google SERP organic traffic with Rich Snippets (FAQ accordions, WebSite search action, Quiz badges); guarantees zero leakage of answer keys or owner capability tokens; protects crawl budget.
  - *Negative*: Result score pages are not indexed individually in Google Search (by design, to avoid duplicate content penalties).

---

### ADR-014: Owner Recognition, Dashboard Auto-Routing & Play Screen Protection

- **Status**: Accepted
- **Context**: When creators generate a quiz and share it to group chats (WhatsApp, Instagram Stories), they frequently tap their own shared link (`/q/[quizCode]`) or navigate back to the homepage. Previously, `/q/[quizCode]` had zero owner awareness, forcing the owner into entering a nickname and answering their own questions. Furthermore, when returning users were identified via browser blueprint, `/api/users/identify` returned quizzes without their `ownerToken`, causing the homepage cards to show "View Quiz" (`/q/[code]`) instead of "Manage" (`/manage/[token]`), leaving owners without an easy way to access their dashboard.
- **Decision**:
  1. *User Model Owner Token Persistence*: Store `ownerTokens: string[]` on the `User` schema. When a quiz is created, add the generated `ownerToken` to `user.ownerTokens` via `$addToSet`.
  2. *Token Hydration in Blueprint Identity*: In `POST /api/users/identify`, compute a hash lookup map for `user.ownerTokens` and hydrate each quiz's `ownerToken` in the response so the homepage cards immediately render the `Manage / Leaderboard` link.
  3. *Safe Client Deduplication*: In `MyQuizzesSection.tsx`, merge quizzes using a Map that never overwrites an existing `ownerToken` with an empty string, and backfills newly discovered tokens into `localStorage`.
  4. *Server-Side Auto-Routing on `/q/[quizCode]`*: Check `cookies().get("quiz_owner_tokens")`. If candidate tokens match the quiz's `ownerTokenHash` and `searchParams.preview !== "true"`, automatically `redirect("/manage/" + matchedToken)`. If `preview === "true"`, render an Owner Preview Floating Banner with a one-click jump to the dashboard.
  5. *Client-Side Owner Shield (`QuizPlayer.tsx`)*: If cookies are absent on the server, `QuizPlayer` queries `/api/quizzes/[quizCode]/owner-check` with client tokens and browser fingerprint. If verified as owner, display the **Owner Welcome Screen** with a prominent button to the dashboard, share link copy, and optional preview mode toggle.
  6. *Bulletproof Post-Creation Navigation*: In `QuizCreator.tsx`, display a celebratory overlay on success and execute `window.location.assign(result.manageUrl)` for guaranteed hard navigation across mobile browsers.
- **Consequences**:
  - *Positive*: Creators are never forced to take their own quiz; their dashboard and live leaderboard are instantly accessible; returning users can manage all their quizzes even after cookie purges; zero answer key leakage is strictly preserved.
  - *Negative*: Owners wanting to take their own quiz as an anonymous player must explicitly choose "Preview Mode" (`?preview=true`).

---

### ADR-015: Invisible Google reCAPTCHA v3 Bot Defense & Security Architecture

- **Status**: Accepted
- **Context**: The viral nature of social friendship quizzes invites automated abuse: automated quiz spamming, headless bots gaming leaderboard scores, and automated abuse report flooding. While the platform has Layer 1-3 defenses (Sliding window IP rate limits, honeypot inputs, >= 3s timing validation), high-reputation distributed botnets or rotating residential proxies could theoretically bypass IP quotas. The user requested Google reCAPTCHA v3 (Invisible) to defend write operations without degrading viral conversion or interrupting teenage mobile players with checkboxes or CAPTCHA puzzles.
- **Decision**:
  1. *Invisible reCAPTCHA v3 Protocol*: Utilize Google reCAPTCHA v3, executing transparently in the background and returning risk scores (0.0 to 1.0) rather than presenting intrusive visual challenges or checkboxes.
  2. *Protected Write Endpoints*:
     - Quiz Creation (`POST /api/quizzes`, action: `"create_quiz"`)
     - Quiz Attempt Submission (`POST /api/quizzes/[quizCode]/attempts`, action: `"submit_attempt"`)
     - Abuse Report Submission (`POST /api/reports`, action: `"submit_report"`)
  3. *Unprotected Read/Identity Boundary*: Explicitly exclude `POST /api/users/identify` from reCAPTCHA to maintain instantaneous, zero-friction creator recognition on landing page load.
  4. *Fail-Open Resilience*: Client-side execution in `lib/recaptcha-client.ts` uses a 4000ms safety timeout race condition. If a user has an ad-blocker (uBlock Origin, Brave Shields) blocking `google.com/recaptcha`, or experiences network timeout, `executeRecaptcha` resolves to `null`. On the server, `verifyRecaptchaV3` supports `RECAPTCHA_FAIL_OPEN="true"` and dev mode fail-open to ensure legitimate human players are never blocked.
  5. *Test Mode & Environment Bypasses*: In `NODE_ENV === "test"` or when `RECAPTCHA_ENABLED === "false"`, server verification automatically bypasses with `bypassed: true, score: 1.0`, keeping CI/CD test runs lightning-fast and offline-capable.
  6. *Thresholds & Action Verification*: Server verifies `score >= minScore` (default 0.5 or `process.env.RECAPTCHA_SCORE_THRESHOLD`) and matches `expectedAction` against `data.action`.
  7. *Compliance Disclosures & UI Polish*: Include Google Terms and Privacy policy links in the review dock, player footer, and report modal. Style `.grecaptcha-badge` with `z-index: 40 !important` and safe margins in `app/globals.css` so it doesn't obstruct mobile CTA decks.
- **Consequences**:
  - *Positive*: Seamless zero-click protection against headless bots; 0% friction for teenage mobile players; ad-blocker users are not stranded; full test suite automation without live external Google API dependencies.
  - *Negative*: Relies on Google reCAPTCHA v3 backend availability unless fail-open is enabled.

---

### ADR-016: Premium Cozy Visual System & UX Architecture

- **Status**: Accepted
- **Context**: The original visual theme relied on high-contrast neon/violet gamified styling. The product goal is to establish Lemon Quiz as a premium, warm, social, emotional, and modern friendship experience — evoking cozy morning sunlight on warm stationery paper in light mode, and intimate candlelight atmosphere in dark mode. The aesthetic must feel like a polished mobile product (Instagram/Pinterest tier) rather than a generic SaaS or childish quiz website.
- **Decision**:
  1. *Core Color Palette*:
     - Light Backgrounds: Warm Ivory (`#FFF9F2`), Cream (`#F8EFE3`).
     - Deep Espresso Typography (`#241C24` primary, `#5C4A5A` secondary, `#8E7B8B` muted) replaces pure black to eliminate harsh contrast and create an artisanal, warm feel.
     - Brand Accents: Soft Plum (`#6D526F`, `#4B344D`) for interactive elements; Soft Champagne (`#F3D7A4`, `#D1A76A`) for premium conversion CTAs; Dusty Rose (`#D99A9A`) and Soft Lavender (`#B8A5C9`) for friendship moments, emotional badges, and category pills; Sage (`#A8B89A`) for success states.
     - Cozy Dark Theme: Late-night candlelight palette using `#17131A` (base), `#211A25` (surface), `#2A202D` (card), `#342638` (elevated), with `#FFF8F0` warm text and muted plum/rose accents.
  2. *Editorial & Sans Typography Pairing*:
     - Primary Sans: `Plus Jakarta Sans` for clean, modern legibility.
     - Editorial Accent: `DM Serif Display` (`font-editorial` / `italic`) for boutique headlines, emotive statements, and celebratory trophy screens.
     - Body Fallback: `Inter` for optimal rendering across international character sets.
  3. *Tactile Surfaces & Mobile Ergonomics*:
     - Generous `rounded-2xl` and `rounded-3xl` radii with soft layered shadows (`0 8px 30px rgba(75, 52, 77, 0.08)`).
     - Minimum 56px touch target heights across all interactive buttons, inputs, option chips, and navigation decks.
     - Duotone pill icon containers using Lucide React vector icons with zero raw OS emojis.
  4. *Cozy Micro-Interactions*:
     - Warm confetti explosion on score reveal with champagne gold, dusty rose, lavender, soft plum, and sage particles.
     - Smooth stationery radio chips with spring-like selection feedback.
- **Consequences**:
  - *Positive*: Unifies brand aesthetic into an emotionally resonant, tactile social product; maintains >14:1 WCAG AAA contrast ratio on body text; preserves all core security, SEO, and zero answer key leakage invariants.
  - *Negative*: Requires loading Google web fonts `Plus_Jakarta_Sans` and `DM_Serif_Display` (optimized via `next/font/google` zero-layout-shift font variables).
