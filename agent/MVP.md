Use **Next.js as the full-stack application + MongoDB + Prisma or MongoDB driver**. Since you already know Prisma, you can use it, but for MongoDB specifically I'd lean toward the **native MongoDB driver/Mongoose** if you want maximum simplicity and flexibility.

The target architecture should be:

```text
                         ┌──────────────────────┐
                         │      Browser         │
                         │ Mobile / Desktop     │
                         └──────────┬───────────┘
                                    │
                                    ▼
                         ┌──────────────────────┐
                         │      Next.js         │
                         │                      │
                         │ App Router           │
                         │ Server Components    │
                         │ Route Handlers       │
                         │ Server Actions       │
                         └──────────┬───────────┘
                                    │
                     ┌──────────────┼──────────────┐
                     │              │              │
                     ▼              ▼              ▼
                  MongoDB       Cookie/Token    Image Gen
                  Database       Identity        (later)
                     │
                     ▼
              ┌─────────────────┐
              │ MongoDB Atlas   │
              └─────────────────┘
```

## 1. MVP architecture philosophy

The rule I'd follow:

> **One repository. One Next.js application. One MongoDB database. No Redis. No separate API server. No microservices. No queues. No WebSockets. No authentication system initially.**

You need to prove one thing:

```text
Create → Share → Friend answers → Result → Friend creates quiz → Loop
```

Everything else is secondary.

---

# 2. Recommended stack

```text
Frontend
──────────────
Next.js
React
TypeScript
Tailwind CSS
shadcn/ui
Framer Motion

Backend
──────────────
Next.js Route Handlers
TypeScript

Database
──────────────
MongoDB Atlas

Validation
──────────────
Zod

Security
──────────────
HTTP-only cookies
Cryptographically random tokens
Rate limiting later

Images
──────────────
HTML/CSS → screenshot/image generation later

Deployment
──────────────
Vercel
MongoDB Atlas
```

You can literally deploy the first version with:

```text
GitHub
   ↓
Vercel
   ↓
MongoDB Atlas
```

---

# 3. Project structure

I'd keep it clean but **not over-engineered**.

```text
friendship-quiz/
│
├── app/
│   │
│   ├── page.tsx
│   │
│   ├── create/
│   │   └── page.tsx
│   │
│   ├── q/
│   │   └── [quizCode]/
│   │       ├── page.tsx
│   │       └── result/
│   │           └── [attemptCode]/
│   │               └── page.tsx
│   │
│   ├── manage/
│   │   └── [ownerToken]/
│   │       ├── page.tsx
│   │       └── loading.tsx
│   │
│   ├── api/
│   │   ├── quizzes/
│   │   │   └── route.ts
│   │   │
│   │   ├── quizzes/
│   │   │   └── [quizCode]/
│   │   │       ├── route.ts
│   │   │       └── attempts/
│   │   │           └── route.ts
│   │   │
│   │   └── analytics/
│   │       └── [quizCode]/
│   │           └── route.ts
│   │
│   └── globals.css
│
├── components/
│   ├── quiz/
│   │   ├── QuizCreator.tsx
│   │   ├── QuestionEditor.tsx
│   │   ├── QuizPlayer.tsx
│   │   ├── QuizResult.tsx
│   │   └── ShareCard.tsx
│   │
│   ├── dashboard/
│   │   ├── ResultList.tsx
│   │   ├── Ranking.tsx
│   │   └── Analytics.tsx
│   │
│   └── ui/
│
├── lib/
│   ├── db.ts
│   ├── tokens.ts
│   ├── quiz.ts
│   ├── validation.ts
│   └── utils.ts
│
├── models/
│   ├── quiz.ts
│   └── attempt.ts
│
├── types/
│   └── quiz.ts
│
├── public/
│
├── middleware.ts
│
├── package.json
└── .env
```

Don't create 50 services/classes for a project this small.

---

# 4. The most important architecture decision: identity

You don't need traditional authentication for MVP.

Instead, create three identifiers.

### Quiz code

Public:

```text
/q/a8Kx29
```

Anyone with this can take the quiz.

### Attempt code

Private to the person who took it:

```text
/q/a8Kx29/result/Ks82Lm
```

### Owner token

Private to Rahul:

```text
/manage/7Hk29xP8mQ...random...
```

The owner token should be **long and cryptographically random**.

Don't use:

```text
/manage/rahul
/manage/1234
```

Use something like:

```text
crypto.randomBytes(32).toString("hex")
```

or Web Crypto's equivalent.

---

# 5. MongoDB collections

For MVP, you only need **two core collections**.

## `quizzes`

```js
{
  _id: ObjectId,

  code: "a8Kx29",

  ownerTokenHash: "...",

  title: "How well do you know Rahul?",

  questions: [
    {
      id: "q1",

      text: "What's my favorite food?",

      type: "single",

      options: [
        {
          id: "o1",
          text: "Pizza"
        },
        {
          id: "o2",
          text: "Biryani"
        },
        {
          id: "o3",
          text: "Burger"
        },
        {
          id: "o4",
          text: "Pasta"
        }
      ],

      correctOptionId: "o2"
    }
  ],

  status: "active",

  stats: {
    attempts: 17,
    shares: 24
  },

  createdAt: Date
}
```

---

# 6. `attempts`

Separate collection.

```js
{
  _id: ObjectId,

  code: "Ks82Lm",

  quizId: ObjectId,

  nickname: "Aman",

  answers: [
    {
      questionId: "q1",
      optionId: "o2"
    }
  ],

  score: 8,

  total: 10,

  percentage: 80,

  createdAt: Date
}
```

This separation is important.

Don't do this:

```js
quiz: {
   attempts: [...]
}
```

Because a popular quiz could eventually have thousands of attempts.

---

# 7. Why no User collection initially?

Because Rahul doesn't actually need an account.

The first version doesn't care who Rahul is.

It cares about:

```text
Quiz
 ↓
Owner token
 ↓
Attempts
```

Later you can introduce:

```text
User
 ↓
Quiz
 ↓
Attempts
```

without changing the fundamental quiz architecture.

---

# 8. Complete user flow

## Rahul

```text
/
↓
Create My Quiz
↓
/create
↓
Create 7 questions
↓
POST /api/quizzes
↓
MongoDB
↓
Return:
    quizCode
    ownerToken
↓
/manage/:ownerToken
```

Dashboard:

```text
Your quiz is ready 🎉

Share:
https://site.com/q/a8Kx29

17 friends have answered

[ View Results ]
[ Copy Quiz Link ]
[ Share ]
```

---

# 9. Friend A flow

Friend clicks:

```text
/q/a8Kx29
```

Next.js:

```text
GET quiz by code
```

Displays quiz.

Friend enters:

```text
Nickname:
Aman
```

Answers.

Submit:

```text
POST /api/quizzes/a8Kx29/attempts
```

Server:

```text
1. Load quiz
2. Validate answers
3. Calculate score
4. Create attempt
5. Return attemptCode
```

Then:

```text
/q/a8Kx29/result/Ks82Lm
```

---

# 10. Result page

Example:

```text
        🎉

       8/10

      80%

   You know Rahul
      pretty well!

────────────────────

🔥 You got 8 correct

[ Share My Result ]

[ Create My Own Quiz ]
```

The critical CTA is:

```text
Create My Own Quiz
```

---

# 11. Friend A creates his quiz

Click:

```text
/create
```

You can optionally pre-fill:

```text
"Create a quiz for your friends"
```

No login.

New owner token.

New quiz.

New share URL.

Loop continues.

---

# 12. Rahul returns later

This is where the owner token matters.

When Rahul created his quiz:

```text
/manage/7Hk29xP8mQ...
```

You store this URL in:

```text
localStorage
```

For example:

```js
localStorage.setItem(
  "quiz_owner_tokens",
  JSON.stringify([...])
)
```

But **don't rely solely on localStorage**.

Give Rahul the option:

> 🔐 Save this private dashboard link

```text
[ Copy Private Link ]
```

He can bookmark it.

---

# 13. Better UX: "My Quizzes"

When Rahul comes back to:

```text
/
```

you can check a cookie:

```text
quiz_owner_tokens
```

Then show:

```text
Welcome back 👋

Your quizzes

❤️ Best Friend Test
👥 17 responses

😂 How Well Do You Know Me?
👥 8 responses
```

This gives the illusion of an account without building authentication.

---

# 14. Don't store owner token directly

This is important.

If the database is compromised and you have:

```js
ownerToken: "7Hk29...";
```

someone could access the dashboard.

Instead:

```text
Raw token
   ↓
SHA-256
   ↓
ownerTokenHash
   ↓
MongoDB
```

When accessing:

```text
/manage/7Hk29...
```

hash the incoming token and find:

```text
ownerTokenHash
```

The raw token is only known by the user/browser.

For MVP, this is plenty.

---

# 15. Question architecture

Start with only:

```ts
type QuestionType = "single" | "multiple" | "text";
```

But honestly:

### MVP should initially support only:

```text
single
```

That's it.

Because the moment you add:

- multiple choice
- text
- images
- ranking
- sliders
- yes/no
- emoji
- date

your scoring and UI complexity grows.

Start with:

```text
Single choice
2–6 options
1 correct answer
```

Then add other types after the loop works.

---

# 16. Question limits

Set hard limits.

For example:

```text
Minimum questions: 3
Maximum questions: 15

Minimum options: 2
Maximum options: 6
```

I'd recommend the UI default:

```text
7 questions
4 options each
```

This gives users a useful starting point without overwhelming them.

---

# 17. Quiz creation UX

Don't ask the creator:

> Select question type.

Instead:

```text
What's your favorite food?

○ Pizza
○ Burger
○ Biryani
○ Pasta

Correct answer:
● Biryani
```

The system assumes:

```text
type = single
```

You can hide technical complexity from the user.

---

# 18. Templates

This will significantly improve the MVP.

When Rahul clicks Create:

```text
Choose a starting point

❤️ Best Friend
😂 Funny Friend Test
🧠 How Well Do You Know Me?
🎵 My Favorites
🔥 Random Questions
```

Template gives:

```text
5–7 questions
```

Rahul edits them.

This is much faster than starting from an empty form.

---

# 19. API design

Don't create REST APIs for everything.

You only need roughly:

```text
POST   /api/quizzes

GET    /api/quizzes/:code

POST   /api/quizzes/:code/attempts

GET    /api/manage/:token

GET    /api/quizzes/:code/analytics
```

You can even eliminate some of these by using Server Components/Server Actions.

For MVP, I would use:

### Server Components

For:

```text
GET quiz
GET dashboard
GET results
```

### Route Handlers

For:

```text
POST create quiz
POST submit attempt
```

That's enough.

---

# 20. Server-side scoring

Never trust the browser.

Browser sends:

```json
{
  "answers": [
    {
      "questionId": "q1",
      "optionId": "o2"
    }
  ]
}
```

Server loads the actual quiz:

```text
correctOptionId
```

and calculates:

```text
correct = 8
total = 10
percentage = 80
```

Then stores the result.

---

# 21. MongoDB indexes

Don't over-index.

MVP:

```text
quizzes
  unique index: code
  unique index: ownerTokenHash

attempts
  unique index: code
  index: quizId
  index: quizId + score
  index: quizId + createdAt
```

That's enough.

---

# 22. Security

For a public viral site, this matters more than fancy architecture.

At minimum:

### Rate limit

Protect:

```text
POST /api/quizzes
POST /api/quizzes/:code/attempts
```

Otherwise bots can destroy your database.

### Validate everything

Use Zod:

```text
quiz title
question text
options
answer
nickname
```

### Sanitize output

Never render user text as raw HTML.

### Limit sizes

For example:

```text
Quiz title: 100 chars
Question: 300 chars
Option: 100 chars
Nickname: 30 chars
Questions: 15
Options: 6
```

---

# 23. Don't collect unnecessary personal data

For MVP:

```text
❌ phone
❌ address
❌ contacts
❌ exact DOB
❌ school
❌ unnecessary profile information
```

You don't need it.

Especially given your target audience includes teenagers.

---

# 24. Abuse reporting

At launch, add:

```text
•••
Report Quiz
```

Report categories:

```text
Spam
Harassment
Sexual content
Hate
Impersonation
Other
```

You don't need a sophisticated moderation dashboard on day one.

Store:

```js
{
  (quizId, reason, createdAt);
}
```

Then manually inspect reported content.

---

# 25. Analytics for YOUR platform

Separate this from Rahul's quiz analytics.

You need to know:

```text
Visitors
Quiz creations
Quiz attempts
Share clicks
Quiz completion rate
Create → share conversion
Result → create conversion
```

The most important metric:

```text
K-factor ≈ invitations generated × conversion rate
```

You want to know whether one participant produces more participants.

Don't obsess over generic page views.

---

# 26. Your first success metric

I'd track this funnel:

```text
Landing
   ↓
Create Quiz
   ↓
Quiz Created
   ↓
Share
   ↓
Friend Opens
   ↓
Friend Starts
   ↓
Friend Completes
   ↓
Friend Creates Quiz
```

For example:

```text
100 creators
 ↓
80 share
 ↓
400 friends open
 ↓
300 start
 ↓
250 complete
 ↓
80 create their own
```

That last number is extremely important.

If:

```text
250 complete
↓
10 create
```

your viral loop is weak.

If:

```text
250 complete
↓
80 create
```

you have something worth pushing traffic toward.

---

# 27. What I would explicitly NOT build

For this MVP:

```text
❌ Microservices
❌ NestJS backend
❌ Redis
❌ Kafka
❌ WebSockets
❌ Elasticsearch
❌ PostgreSQL
❌ Complex authentication
❌ Following/followers
❌ Chat
❌ Notifications
❌ Full profiles
❌ Recommendation engine
❌ AI-generated questions
❌ Complex admin panel
❌ Payment system
```

All of that is premature.

---

# 28. Deployment architecture

Keep it boring:

```text
                   GitHub
                      │
                      ▼
                   Vercel
                      │
             ┌────────┴────────┐
             │                 │
          Next.js           API Routes
             │                 │
             └────────┬────────┘
                      │
                      ▼
                MongoDB Atlas
```

Environment:

```env
MONGODB_URI="mongodb+srv://..."
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

That's basically it.

---

# 29. Final MVP architecture

If I were implementing this myself, I'd lock the architecture at:

```text
                         USER
                          │
                          ▼
                    Next.js App
                          │
          ┌───────────────┼────────────────┐
          │               │                │
          ▼               ▼                ▼
       Creator          Friend           Owner
       /create          /q/:code         /manage/:token
          │               │                │
          │               │                │
          └───────────────┼────────────────┘
                          │
                          ▼
                 Next.js Server
                          │
              ┌───────────┴───────────┐
              │                       │
              ▼                       ▼
          Quiz Logic              Analytics
              │                       │
              └──────────┬────────────┘
                         ▼
                      MongoDB
                       /    \
                      /      \
                  Quizzes   Attempts
```

### Core data relationship

```text
Quiz
 │
 ├── ownerTokenHash
 │
 ├── questions[]
 │
 └──────┐
        │
        ▼
     Attempts
        │
        ├── nickname
        ├── answers[]
        ├── score
        └── createdAt
```

### Core viral loop

```text
CREATE
   ↓
SHARE
   ↓
OPEN
   ↓
ANSWER
   ↓
RESULT
   ↓
SHARE / CREATE
   ↓
NEW QUIZ
   ↓
SHARE
   ↓
...
```
