For the MVP, I would keep the database to **4 collections**:

1. `quizzes`
2. `attempts`
3. `reports`
4. `users` — optional, basically empty/unused until auth is introduced

The important design choice is **don't create a separate `questions` collection**. Questions belong to a quiz and are small enough to embed directly inside `quizzes`.

Assuming **MongoDB + Mongoose + Next.js**, here's the schema I'd actually ship.

---

# 1. Database relationship

```text
                    ┌─────────────────┐
                    │      User       │
                    │   (future)      │
                    └────────┬────────┘
                             │
                             │ ownerId
                             ▼
                    ┌─────────────────┐
                    │      Quiz       │
                    │                 │
                    │ ownerId         │
                    │ ownerTokenHash  │
                    │ code            │
                    │ questions[]     │
                    └────────┬────────┘
                             │
                             │ quizId
                             ▼
                    ┌─────────────────┐
                    │     Attempt     │
                    │                 │
                    │ quizId         │
                    │ nickname        │
                    │ answers[]       │
                    │ score           │
                    └─────────────────┘

                    ┌─────────────────┐
                    │     Report      │
                    │                 │
                    │ quizId         │
                    │ reason          │
                    └─────────────────┘
```

---

# 2. Quiz schema

This is the most important collection.

```ts
import mongoose, { Schema, Types } from "mongoose";

const QuizOptionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
  },
  { _id: false },
);

const QuizQuestionSchema = new Schema(
  {
    id: {
      type: String,
      required: true,
    },

    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300,
    },

    type: {
      type: String,
      enum: ["single"],
      default: "single",
    },

    options: {
      type: [QuizOptionSchema],
      required: true,
      validate: {
        validator: (options: unknown[]) =>
          options.length >= 2 && options.length <= 6,
        message: "A question must have 2-6 options",
      },
    },

    correctOptionId: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const QuizSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    /**
     * Future authentication support.
     * Null for anonymous MVP quizzes.
     */
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    /**
     * Never store the raw owner token.
     * Store SHA-256 hash instead.
     */
    ownerTokenHash: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },

    questions: {
      type: [QuizQuestionSchema],
      required: true,
      validate: {
        validator: (questions: unknown[]) =>
          questions.length >= 3 && questions.length <= 15,
        message: "Quiz must contain 3-15 questions",
      },
    },

    settings: {
      showScore: {
        type: Boolean,
        default: true,
      },

      showCorrectAnswers: {
        type: Boolean,
        default: false,
      },

      maxAttemptsPerPerson: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
      },
    },

    stats: {
      attempts: {
        type: Number,
        default: 0,
      },

      shares: {
        type: Number,
        default: 0,
      },

      views: {
        type: Number,
        default: 0,
      },
    },

    status: {
      type: String,
      enum: ["active", "disabled"],
      default: "active",
      index: true,
    },
  },

  {
    timestamps: true,
  },
);

export const Quiz = mongoose.models.Quiz || mongoose.model("Quiz", QuizSchema);
```

---

# 3. Why questions are embedded

Don't do this:

```text
Quiz
 ↓
Question collection
 ↓
Option collection
```

That's unnecessary for this product.

A quiz might have only 5–15 questions.

So:

```text
Quiz
 └── questions[]
       ├── question
       ├── options[]
       └── correctOptionId
```

is much simpler.

When loading a quiz:

```text
1 MongoDB query
```

instead of:

```text
Quiz query
    ↓
Question query
    ↓
Option query
```

For your MVP, embedded questions are exactly what you want.

---

# 4. Attempt schema

Every time someone takes a quiz, create one `Attempt`.

```ts
const AttemptAnswerSchema = new Schema(
  {
    questionId: {
      type: String,
      required: true,
    },

    optionId: {
      type: String,
      required: true,
    },
  },
  { _id: false },
);

const AttemptSchema = new Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    quizId: {
      type: Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
      index: true,
    },

    nickname: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },

    answers: {
      type: [AttemptAnswerSchema],
      required: true,
    },

    score: {
      type: Number,
      required: true,
      min: 0,
    },

    total: {
      type: Number,
      required: true,
      min: 1,
    },

    percentage: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },

    /**
     * Useful later for abuse detection.
     * Don't expose this to other users.
     */
    metadata: {
      userAgent: {
        type: String,
        default: null,
      },

      ipHash: {
        type: String,
        default: null,
      },
    },
  },

  {
    timestamps: true,
  },
);

AttemptSchema.index({
  quizId: 1,
  createdAt: -1,
});

AttemptSchema.index({
  quizId: 1,
  score: -1,
});

export const Attempt =
  mongoose.models.Attempt || mongoose.model("Attempt", AttemptSchema);
```

---

# 5. Why `score` should be stored

You might think:

> Why not calculate the score every time?

Because Rahul's dashboard might eventually have:

```text
500 attempts
```

You don't want to recalculate every attempt every time.

Store:

```text
score
total
percentage
```

when the attempt is submitted.

For example:

```json
{
  "score": 8,
  "total": 10,
  "percentage": 80
}
```

Then ranking becomes extremely cheap:

```js
Attempt.find({ quizId }).sort({ score: -1 }).limit(10);
```

---

# 6. Report schema

Keep moderation simple.

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

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "reviewed", "resolved"],
      default: "pending",
      index: true,
    },
  },
  {
    timestamps: true,
  },
);

export const Report =
  mongoose.models.Report || mongoose.model("Report", ReportSchema);
```

---

# 7. User schema — future, not required for MVP

I'd actually create the model now but **don't force users into it**.

```ts
const UserSchema = new Schema(
  {
    name: {
      type: String,
      trim: true,
      maxlength: 50,
    },

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

    image: {
      type: String,
      default: null,
    },

    status: {
      type: String,
      enum: ["active", "suspended"],
      default: "active",
    },
  },

  {
    timestamps: true,
  },
);

export const User = mongoose.models.User || mongoose.model("User", UserSchema);
```

But again:

**MVP users don't need to exist in this collection.**

---

# 8. Future-ready Quiz schema

There is one thing I'd deliberately prepare for now.

Currently:

```ts
type: "single";
```

Later you want:

```ts
type:
  | "single"
  | "multiple"
  | "text"
  | "image"
  | "rating"
  | "slider"
```

So your TypeScript type should already look like:

```ts
export type QuizQuestionType =
  | "single"
  | "multiple"
  | "text"
  | "image"
  | "rating"
  | "slider";
```

But your Mongoose validation can initially allow only:

```ts
enum: ["single"]
```

This gives you a clean upgrade path without pretending you've implemented functionality you haven't.

---

# 9. Future question schema

Eventually a question could become:

```ts
{
  id: "q_123",

  text: "What's my favorite food?",

  type: "image",

  options: [
    {
      id: "o1",
      text: "Pizza",
      imageUrl: "..."
    },
    {
      id: "o2",
      text: "Burger",
      imageUrl: "..."
    }
  ],

  correctOptionId: "o1"
}
```

For a text question:

```ts
{
  id: "q_124",

  text: "What's my biggest dream?",

  type: "text",

  options: [],

  correctOptionId: null
}
```

You don't need this now.

---

# 10. Future `Quiz` evolution

Your current:

```text
Quiz
├── code
├── owner
├── title
├── questions
├── settings
├── stats
└── status
```

can eventually become:

```text
Quiz
├── identity
│   ├── code
│   ├── ownerId
│   └── ownerTokenHash
│
├── content
│   ├── title
│   ├── description
│   ├── coverImage
│   └── questions
│
├── settings
│   ├── privacy
│   ├── attempts
│   ├── scoring
│   └── expiration
│
├── appearance
│   ├── theme
│   ├── background
│   └── font
│
├── stats
│   ├── views
│   ├── attempts
│   ├── shares
│   └── completions
│
└── timestamps
```

But **don't build these fields now unless you need them**.

---

# 11. Future sharing collection?

Don't create one now.

Initially:

```text
Quiz.stats.shares
```

is enough.

Later, if you need detailed analytics:

```text
ShareEvent
{
  quizId,
  attemptId,
  type: "quiz" | "result",
  platform: "whatsapp" | "instagram" | "copy",
  createdAt
}
```

Then you can answer:

> How many people shared this quiz to WhatsApp?

But that's a **future analytics feature**, not MVP.

---

# 12. Future event tracking

Same principle.

Don't create:

```text
Event
EventSession
EventPageView
EventClick
EventConversion
```

on day one.

If traffic starts growing, introduce:

```text
events
```

with:

```js
{
  type: "quiz_created",

  quizId,

  anonymousId,

  metadata: {},

  createdAt
}
```

Then you can measure:

```text
landing
 ↓
create
 ↓
share
 ↓
open
 ↓
complete
 ↓
create again
```

---

# 13. Recommended indexes

For MVP:

### Quiz

```text
code                    UNIQUE
ownerTokenHash          UNIQUE
ownerId
status
```

### Attempt

```text
code                    UNIQUE
quizId
quizId + createdAt
quizId + score
```

### Report

```text
quizId
status
createdAt
```

Don't create indexes everywhere. Every index has a write/storage cost.

---

# 14. One important change I'd make to the earlier architecture

I would **not store `ownerTokenHash` as the only ownership mechanism forever**.

MVP:

```text
Anonymous creator
       ↓
ownerTokenHash
       ↓
Quiz
```

Future:

```text
User
       ↓
ownerId
       ↓
Quiz
       ↓
ownerTokenHash
```

So when you introduce Google authentication later:

```text
Rahul logs in
       ↓
Find User
       ↓
Find quizzes where ownerId = Rahul
       ↓
Show dashboard
```

The old anonymous quizzes can be **claimed**:

```text
Anonymous Quiz
       ↓
"Save to my account"
       ↓
Google login
       ↓
quiz.ownerId = user._id
```

That's a clean migration path.

---

# 15. Final MVP database

I'd literally launch with this:

```text
MongoDB
│
├── quizzes
│   │
│   ├── _id
│   ├── code
│   ├── ownerTokenHash
│   ├── ownerId: null
│   ├── title
│   ├── description
│   ├── questions[]
│   │   ├── id
│   │   ├── text
│   │   ├── type
│   │   ├── options[]
│   │   │   ├── id
│   │   │   └── text
│   │   └── correctOptionId
│   │
│   ├── settings
│   ├── stats
│   ├── status
│   └── timestamps
│
├── attempts
│   │
│   ├── _id
│   ├── code
│   ├── quizId
│   ├── nickname
│   ├── answers[]
│   ├── score
│   ├── total
│   ├── percentage
│   ├── metadata
│   └── timestamps
│
├── reports
│   ├── _id
│   ├── quizId
│   ├── reason
│   ├── description
│   ├── status
│   └── timestamps
│
└── users
    ├── _id
    ├── name
    ├── username
    ├── email
    ├── image
    ├── status
    └── timestamps
```

### The key rule

**Don't build the future schema into the present just because you can imagine future features.**

Build the data model around the current core:

> **Quiz → Questions → Attempts → Results**

Then leave clean extension points for:

> **Users → Themes → Question types → Sharing analytics → Profiles → Leaderboards → Monetization**

That gives you a database that is simple enough to build in a few days, but not so simplistic that you'll have to throw it away when the MVP gets traction.
