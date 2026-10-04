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

- **Status**: Accepted
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
  - *Positive*: Completely eliminates SRV lookup failures in Cloudflare Workers isolate environments; allows Mongoose to connect directly to MongoDB Atlas replica sets via `nodejs_compat` TCP sockets without any external Node DNS dependencies; maintains 100% backward compatibility with standard Node.js and local development.
  - *Negative*: Adds a single one-off ~100ms HTTPS fetch on cold worker start when first connecting to MongoDB.

