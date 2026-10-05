# AI Rulebook: Engineering & Architectural Invariants

> **Project:** Lemon Quiz (Friendship Quiz MVP)
>
> **Target Genre:** Viral, consumer-social web application for teens and young adults (ages 12–20).
>
> **Tech Stack:** Next.js App Router (Next 16 Canary + React 19), Tailwind CSS v4, MongoDB Atlas with Mongoose, Zod, Lucide React.
>
> **Purpose:** This rulebook defines the strict, non-negotiable architectural, security, design, and code quality invariants for this codebase.

---

# CRITICAL RULEBOOK INSTRUCTION

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

The rules in this document are mandatory.

Any AI agent or engineer that works on this codebase MUST follow these rules.

The agent MUST NOT:

- change a rule;
- remove a rule;
- weaken a rule;
- reinterpret a rule;
- add a new rule;
- replace a rule with a different rule;
- create an exception unless the rulebook already defines the exception.

If a requested task conflicts with a rule, the agent MUST stop and report the conflict.

The agent MUST NOT silently resolve the conflict.

The agent MUST ask for an explicit rulebook change before proceeding.

The rulebook is the source of truth for the invariants defined below.

---

# 1. Architectural Invariants

## 1.1 Simplicity & Monolithic Architecture

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Keep the complete application inside this single Next.js repository.

### Forbidden

The agent MUST NOT:

- introduce Redis for the MVP;
- introduce Kafka for the MVP;
- introduce BullMQ for the MVP;
- introduce background worker services for the MVP;
- create separate backend microservices;
- create a standalone Express server;
- create a standalone NestJS server;
- implement WebSockets;
- introduce heavy third-party authentication platforms such as Clerk, NextAuth, Auth0, or Supabase Auth for the MVP.

Polling or atomic server revalidation is sufficient.

The product uses anonymous cryptographic tokens.

---

## 1.2 Embedded Data Model

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Store questions and options directly inside the `Quiz` MongoDB document.

### Forbidden

The agent MUST NOT:

- create a separate `Question` collection;
- create a separate `Option` collection;
- use `$lookup` to load a quiz;
- use multi-collection joins to load a quiz.

A quiz MUST load with one fast indexed query.

---

## 1.3 Next.js 16 & React 19 App Router

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Dynamic route parameters and search parameters are Promises.

### Correct

```ts
const { quizCode } = await params;
```

### Incorrect

```ts
const { quizCode } = params;
```

### Rule

Preserve the separation between Server Components and Client Components.

Use Server Components by default for:

- data fetching;
- metadata;
- server-rendered content.

Use Client Components when required for:

- forms;
- quiz interactivity;
- confetti;
- other browser-only interaction.

### Rule

Always follow breaking changes documented in:

```text
node_modules/next/dist/docs/
```

---

# 2. Security & Anti-Abuse Non-Negotiables

## 2.1 Zero-Leakage Server-Side Scoring

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

The client MUST NEVER receive the answer key.

The answer key includes:

```text
correctOptionId
```

### Required behavior

Public quiz responses MUST explicitly exclude:

```text
questions.correctOptionId
ownerTokenHash
```

This applies to:

```text
/q/[quizCode]
GET /api/quizzes/[quizCode]
```

The client MUST submit only:

```json
{
  "answers": [
    {
      "questionId": "...",
      "optionId": "..."
    }
  ]
}
```

The server MUST:

1. fetch the authoritative quiz document;
2. calculate the score on the server;
3. calculate the percentage on the server;
4. store the `Attempt` record.

The client MUST NOT calculate or control the authoritative score.

---

## 2.2 Cryptographic Identity & Token Hashing

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Raw owner tokens MUST NEVER be stored in MongoDB.

### Token generation

Generate the raw token with:

```ts
crypto.randomBytes(32).toString("hex");
```

This produces a 64-character high-entropy string.

### Storage

Store only:

```text
ownerTokenHash = sha256(rawToken)
```

### Authentication

For incoming:

```text
/manage/[ownerToken]
```

requests:

1. receive the provided token;
2. hash the token;
3. query MongoDB using `ownerTokenHash`.

### Persistence

Store raw owner tokens in:

```text
HTTP-only
SameSite=Lax
```

cookies named:

```text
quiz_owner_tokens
```

Use client `localStorage` as the fallback.

---

## 2.3 Strict Multi-Tier Rate Limiting

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Every public write endpoint MUST use IP-based rate limiting.

### Limits

| Endpoint                                | Limit                         |
| --------------------------------------- | ----------------------------- |
| `POST /api/quizzes`                     | 5 requests / IP / hour        |
| `POST /api/quizzes/[quizCode]/attempts` | 10 requests / IP / 10 minutes |
| `POST /api/reports`                     | 3 requests / IP / hour        |

### Response

When a limit is exceeded, return:

```text
429 Too Many Requests
```

The response MUST include:

```text
Retry-After
```

---

## 2.4 Privacy & Data Minimization

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Do NOT collect:

- phone numbers;
- email addresses;
- physical addresses;
- school names;
- dates of birth;
- sensitive profile details.

### Rule

Never store raw IP addresses in MongoDB documents.

Store:

```text
ipHash = sha256(clientIp + process.env.SALT)
```

---

## 2.5 Anti-Bot & Anti-Cheat Guards

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Honeypot

Attempt and quiz forms MUST include a hidden field.

Example:

```text
website
```

If the field contains a value, silently reject or fail the request.

### Timing check

Reject attempts submitted in less than:

```text
3 seconds
```

### Payload size

Limit JSON request bodies to:

```text
50KB maximum
```

---

# 3. Data Validation & Boundary Constraints

## 3.1 Dual-Layer Validation

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Validate every incoming payload with Zod at the route boundary.

Perform Zod validation before any database interaction.

Mongoose schemas MUST enforce the same constraints as a second validation layer.

---

## 3.2 Fixed Numeric Bounds

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

The following limits are fixed.

| Field              | Minimum |   Maximum | Invariant Rationale                 |
| ------------------ | ------: | --------: | ----------------------------------- |
| Quiz Title         |  1 char | 100 chars | Prevents UI overflow, trimmed       |
| Quiz Description   | 0 chars | 300 chars | Optional context                    |
| Questions Count    |       3 |        15 | Keeps quiz engaging without fatigue |
| Question Text      |  1 char | 300 chars | High legibility on mobile           |
| Options Count      |       2 |         6 | Standard multiple choice limits     |
| Option Text        |  1 char | 100 chars | Clean button typography             |
| Nickname           |  1 char |  30 chars | Displayable in leaderboard          |
| Report Description | 0 chars | 500 chars | Sufficient for moderation details   |

The agent MUST NOT change these bounds without an explicit rulebook change.

---

## 3.3 Relational Invariants

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

Every `correctOptionId` MUST match the `id` of an option in that question's `options` array.

In `Attempt.answers`, every `optionId` MUST exist inside the corresponding `questionId` in the quiz.

---

# 4. UI/UX & Design Rules

## 4.1 Zero OS Emoji Clutter

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

NEVER use raw system emojis in:

- UI buttons;
- titles;
- headers;
- badges;
- dashboard metrics.

Examples of forbidden raw emojis include:

```text
🎉
🔥
🍕
💀
❤️
```

### Standard

Use Lucide React vector icons instead.

Examples:

```tsx
<Sparkles />
<Crown />
<HeartHandshake />
<Flame />
<ShieldAlert />
<Share2 />
```

Style these icons inside duotone container pills.

### Reason

OS emojis render differently across Apple, Google, and Microsoft platforms.

This creates inconsistent visual rhythm and can make the interface look amateurish.

---

## 4.2 Mobile-First & Thumb-Friendly

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Design for mobile first.

The target assumption is that 95%+ of users open quizzes on mobile through:

- WhatsApp;
- Instagram;
- TikTok.

### Interactive options

Interactive options MUST have a minimum tap height of:

```text
56px
```

### Primary CTAs

Primary CTAs MUST be:

- sticky; or
- immediately visible above the fold

on mobile viewports.

### Active states

Interactive buttons MUST provide tactile feedback.

Use:

```text
active:scale-[0.98]
transition-transform
duration-100
```

---

## 4.3 Viral Conversion Priority

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

The result page:

```text
/q/[quizCode]/result/[attemptCode]
```

has one primary metric:

**Convert the friend into a new quiz creator.**

### Standard

The primary high-contrast and most visually prominent button on the result screen MUST be:

```text
Create Your Own Quiz
```

Sharing the score MUST remain secondary.

---

# 5. Code Quality & Implementation Rules

## 5.1 Strict TypeScript & Zero `any`

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

No implicit `any` types.

No explicit `any` types.

### Rule

The following MUST have strict TypeScript interfaces in `types/`:

- database models;
- API request payloads;
- API responses.

---

## 5.2 Serverless MongoDB Connection Pooling

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Never call:

```ts
mongoose.connect();
```

directly inside route handlers without cached connection handling.

### Standard

Use the singleton pattern in:

```text
lib/db.ts
```

The singleton MUST cache MongoDB connections across hot serverless lambdas.

---

## 5.3 Safe String Sanitization & XSS Defense

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Never use:

```tsx
dangerouslySetInnerHTML;
```

### Rule

Sanitize and HTML-escape all user-provided strings before display.

This includes:

- quiz titles;
- question text;
- nicknames.

---

## 5.4 Error Handling & User-Facing Copy

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

### Rule

Never expose:

- raw database errors;
- stack traces;
- internal server errors

to clients.

### Standard response

Return:

```json
{
  "success": false,
  "error": "..."
}
```

Use the appropriate HTTP status code:

```text
400
401
404
429
500
```

### User-facing tone

Error messages MUST be:

- friendly;
- clear;
- reassuring.

Error messages MUST NOT use unnecessary technical jargon.

---

# 6. Documentation & Architecture Graph Maintenance Invariant

## 6.1 Context Graph Change Logging

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

Maintain:

```text
agent/GRAPH_CONTEXT.md
```

### Rule

Whenever a major or structurally significant change is made to any of the following:

- module;
- data schema;
- security boundary;
- route topology;

the AI agent MUST:

1. add a log entry to Section 7 of `agent/GRAPH_CONTEXT.md`;
2. update the affected Mermaid diagrams.

### Do not log

Do NOT log:

- minor cosmetic changes;
- trivial bug fixes.

### Log

Log:

- architectural modifications;
- new collections;
- new fields;
- changed security policies;
- major component workflow changes.

---

## 6.2 Living Documentation Maintenance

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

The following documentation files in `/agent` MUST remain synchronized with the codebase.

### 1. `agent/task.md`

Update:

- task progress;
- completed tasks.

Bump the version when milestones are completed.

### 2. `agent/architecture.md`

Keep the following accurate:

- system patterns;
- technology stack;
- pipelines.

### 3. `agent/database.md`

Keep the following accurate:

- Mongoose schemas;
- indexes;
- query projections.

### 4. `agent/decisions.md`

Record a new Architectural Decision Record when a major technical choice is made or modified.

---

# RULEBOOK ENFORCEMENT

**[IMMUTABLE — DO NOT CHANGE OR ADD]**

Before implementing any task, the AI agent MUST check the task against this rulebook.

The agent MUST NOT modify an invariant to make a task easier.

The agent MUST NOT add a new architecture pattern when an existing rule already defines the required behavior.

The agent MUST NOT silently create exceptions.

If a task conflicts with this rulebook:

1. stop implementation;
2. identify the conflicting rule;
3. explain the conflict;
4. ask for explicit authorization to modify the rulebook.

Until the rulebook is explicitly changed, the existing rule remains active.

**The agent must obey the rulebook.**

**The agent must not rewrite the rulebook.**

**The agent must not add rules to the rulebook.**

**The agent must not remove rules from the rulebook.**

**The agent must not weaken rules in the rulebook.**
