# Database Architecture & Schemas: Lemon Quiz

> **Document Purpose**: Authoritative reference for MongoDB collections, schemas, indexing strategies, embedding rationale, and query patterns.  
> **Maintainer Rule**: Any agent altering models, indexes, or query projections must document changes here.

---

## 1. Database Philosophy & Modeling Strategy

Lemon Quiz uses **MongoDB Atlas** managed through **Mongoose**. The schema adheres to these core modeling rules:

1. **Embed Questions Inside `Quiz`**: Questions (3–15) and options (2–6) have a 1:1 lifecycle with the quiz. Embedding them avoids multi-collection `$lookup` joins and guarantees atomic reads and updates.
2. **Reference `Attempt` as a Separate Collection**: A popular quiz can attract hundreds or thousands of friend attempts. Embedding attempts inside `Quiz` would violate document size limits (16MB) and cause extreme write contention.
3. **Reference `Report` Separately**: Abuse reports must not pollute the primary quiz document and require independent status management.
4. **Denormalize Scores on Write**: When an attempt is submitted, the server calculates and persists `score`, `total`, and `percentage`. Leaderboards are read heavily and should never recalculate scores on the fly.

---

## 2. Collections & Schemas

### 2.1 `quizzes` Collection

Stores quiz metadata, ownership hashes, settings, and the complete embedded question tree.

```ts
import mongoose, { Schema } from "mongoose";

const QuizOptionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 100 },
  },
  { _id: false },
);

const QuizQuestionSchema = new Schema(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true, maxlength: 300 },
    type: { type: String, enum: ["single"], default: "single" },
    options: {
      type: [QuizOptionSchema],
      required: true,
      validate: [
        (opts: unknown[]) => opts.length >= 2 && opts.length <= 6,
        "Questions must have 2 to 6 options",
      ],
    },
    // CRITICAL: NEVER project this field in public responses
    correctOptionId: { type: String, required: true },
  },
  { _id: false },
);

const QuizSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    ownerTokenHash: { type: String, required: true, unique: true, index: true },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },
    title: { type: String, required: true, trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 300, default: "" },
    questions: {
      type: [QuizQuestionSchema],
      required: true,
      validate: [
        (q: unknown[]) => q.length >= 3 && q.length <= 15,
        "Quiz must contain 3 to 15 questions",
      ],
    },
    settings: {
      showScore: { type: Boolean, default: true },
      showCorrectAnswers: { type: Boolean, default: false },
      maxAttemptsPerPerson: { type: Number, default: 1, min: 1, max: 10 },
    },
    stats: {
      attempts: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
      views: { type: Number, default: 0 },
    },
    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true },
);
```

---

### 2.2 `attempts` Collection

Stores individual friend quiz submissions and calculated scores.

```ts
const AttemptAnswerSchema = new Schema(
  {
    questionId: { type: String, required: true },
    optionId: { type: String, required: true },
  },
  { _id: false },
);

const AttemptSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, index: true },
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    nickname: { type: String, required: true, trim: true, maxlength: 30 },
    answers: { type: [AttemptAnswerSchema], required: true },
    score: { type: Number, required: true, min: 0 },
    total: { type: Number, required: true, min: 1 },
    percentage: { type: Number, required: true, min: 0, max: 100 },
    metadata: {
      userAgent: { type: String, default: null },
      ipHash: { type: String, default: null }, // Salted SHA-256
    },
  },
  { timestamps: true },
);

// Compound indexes for leaderboard and recent attempts
AttemptSchema.index({ quizId: 1, score: -1, createdAt: -1 });
AttemptSchema.index({ quizId: 1, createdAt: -1 });
AttemptSchema.index({ quizId: 1, "metadata.ipHash": 1 });
```

---

### 2.3 `reports` Collection

Stores user-submitted flags for content moderation.

```ts
const ReportSchema = new Schema(
  {
    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },
    reason: {
      type: String,
      enum: ["spam", "harassment", "sexual", "hate", "impersonation", "other"],
      required: true,
    },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true },
);
```

---

### 2.4 `users` Collection (Browser Blueprint & Creator Profile)

Stores passwordless creator identity anchored by client-side browser fingerprint and salted server-side IP hash.

```ts
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    clientFingerprint: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    ipHash: {
      type: String,
      trim: true,
      sparse: true,
      index: true,
    },
    userAgent: { type: String, default: null },
    lastSeenAt: { type: Date, default: Date.now },
    username: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      unique: true,
      sparse: true,
      index: true,
    },
    image: { type: String, default: null },
    status: { type: String, enum: ["active", "suspended"], default: "active" },
  },
  { timestamps: true },
);

UserSchema.index({ clientFingerprint: 1, ipHash: 1 });
```

---

## 3. Indexing Strategy Summary

| Collection | Index Fields                              | Type     | Purpose                                           |
| :--------- | :---------------------------------------- | :------- | :------------------------------------------------ |
| `quizzes`  | `code`                                    | Unique   | Public URL lookup (`/q/:code`)                    |
| `quizzes`  | `ownerTokenHash`                          | Unique   | Private owner dashboard lookup (`/manage/:token`) |
| `quizzes`  | `status`                                  | Standard | Filter out disabled quizzes                       |
| `quizzes`  | `{ status: 1, updatedAt: -1 }`            | Compound | Fast, indexed XML sitemap generation (<5ms)       |
| `quizzes`  | `ownerId`                                 | Standard | User quiz ownership & returning recovery queries  |
| `users`    | `clientFingerprint`                       | Sparse   | Fast device blueprint lookup (`/api/users/identify`) |
| `users`    | `ipHash`                                  | Sparse   | Network locality lookup                           |
| `users`    | `{ clientFingerprint: 1, ipHash: 1 }`     | Compound | Fast composite blueprint & network verification   |
| `attempts` | `code`                                    | Unique   | Result page lookup (`/result/:attemptCode`)       |
| `attempts` | `quizId`                                  | Standard | Scoped attempts lookup                            |
| `attempts` | `{ quizId: 1, score: -1, createdAt: -1 }` | Compound | Fast, zero-memory-sort leaderboard queries        |
| `attempts` | `{ quizId: 1, createdAt: -1 }`            | Compound | Chronological attempt history in owner view       |
| `attempts` | `{ quizId: 1, "metadata.ipHash": 1 }`     | Compound | Fast per-person attempt limit verification        |
| `reports`  | `quizId`                                  | Standard | Finding reports by quiz                           |
| `reports`  | `status`                                  | Standard | Admin moderation queues                           |

---

## 4. Query Patterns & Safe Projections

### Public Quiz Loader (Zero Answer Key Leakage)

```ts
const quiz = await Quiz.findOne({ code, status: "active" })
  .select("-ownerTokenHash -questions.correctOptionId")
  .lean();
```

### Owner Dashboard Lookup

```ts
const hashedToken = hashToken(rawOwnerToken);
const quiz = await Quiz.findOne({ ownerTokenHash: hashedToken }).lean();
```

### High-Speed Leaderboard Fetch

```ts
const leaderboard = await Attempt.find({ quizId: quiz._id })
  .sort({ score: -1, createdAt: -1 })
  .limit(20)
  .select("nickname score total percentage createdAt")
  .lean();
```

---

## 5. Serverless Connection Management (`lib/db.ts`)

In Next.js serverless functions, new invocations must reuse existing cached connections rather than spawning redundant database sockets:

```ts
// Cached Mongoose connection structure
let cached = global.mongoose || { conn: null, promise: null };
```

- Ensures max connection limits on MongoDB Atlas are never exhausted during viral traffic spikes.
