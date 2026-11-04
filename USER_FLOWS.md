# BestFriend Quiz — User Flows & Journey Architecture
**Document**: `USER_FLOWS.md`  
**Application**: LemonQuiz  
**Target Group**: Gen Z (13–20)  
**Primary Loops**: Creator Onboarding, Friend Gameplay, Viral Re-creation, Squad Dashboard

---

## 1. High-Level System Architecture & Flowchart

```mermaid
flowchart TD
    %% Global Nodes
    A["📱 User Opens Homepage (/)"] --> B{"Has Existing Quiz in Cookies?"}
    
    %% Returning Flow
    B -->|Yes| C["👑 'My Quizzes' Drawer Shown on Home"]
    C --> D["📊 Direct Link to /manage/[ownerToken]"]
    
    %% Creator Onboarding Flow
    B -->|No / Clicks 'Create Quiz'| E["✨ Creator Studio (/create)"]
    E --> F["Step 1: Creator Name & Persona Picker"]
    F --> G["Step 2: Rapid Question Bank (Pick / Custom)"]
    G --> H["Step 3: Mark Correct Answer & Customize Options"]
    H --> I["Step 4: 1-Click Publish & Launch"]
    I --> J["🚀 Share Hub Modal (/manage/[ownerToken])"]
    
    %% Viral Share Channels
    J --> K["💬 WhatsApp Group Chat Link"]
    J --> L["📸 Instagram / Snapchat 9:16 Story Card"]
    J --> M["🔗 Direct URL Copy"]
    
    %% Friend Player Flow
    K & L & M --> N["🎯 Friend Opens Quiz (/q/[quizCode])"]
    N --> O["Step 1: Hero Welcome & Nickname Entry"]
    O --> P["Step 2: Interactive Question Stack (1 to N)"]
    P --> Q["Step 3: Tactical Answer Tap & Feedback"]
    Q --> R["Step 4: Suspense Scoring Calculation Loader"]
    R --> S["🏆 Score Reveal & Friendship Trophy (/q/[quizCode]/result/[attemptCode])"]
    
    %% Viral Conversion Loop
    S --> T["🔥 PRIMARY CTA: 'Create Your Own Quiz'"]
    T --> E
    S --> U["📱 SECONDARY CTA: 'Share Result on Story / WhatsApp'"]
    
    %% Squad Dashboard Update
    S -.->|Async Update| V["⚡ Live Leaderboard Updated on /manage/[ownerToken]"]
```

---

## 2. Journey 1: The Quiz Creator Flow (Zero-Friction 60s Launch)

### 2.1 The Problem It Solves
Most quiz builders feel like Google Forms or tax software. The LemonQuiz Creator Studio must feel like picking tracks in a music playlist or selecting stickers in an Instagram story.

### 2.2 Detailed Step-by-Step Flow

```mermaid
sequenceDiagram
    autonumber
    actor Creator as User A (Creator)
    participant Client as Frontend (/create)
    participant API as Backend (/api/quizzes)
    participant DB as MongoDB Atlas

    Creator->>Client: Clicks "Create Your Quiz in 60s"
    Client->>Creator: Shows Step 1: "What's your nickname or squad name?"
    Creator->>Client: Enters "Kaif" (1-30 chars) + picks Vibe Emoji (👑, ⚡, 💅, 🍋)
    Client->>Creator: Transitions to Question Studio with 5 pre-loaded popular questions
    
    loop Customize Questions (Min 3, Max 15)
        Creator->>Client: Swaps question from "100+ Question Idea Bank" (Funny, Deep, Savage)
        Creator->>Client: Selects Correct Option (Tactile Check Pill)
        Creator->>Client: (Optional) Edits Option Text
    end

    Creator->>Client: Taps "Launch My Quiz 🚀"
    Client->>API: POST /api/quizzes { title, creatorName, questions }
    API->>DB: Save Quiz with ownerTokenHash + return raw ownerToken & quizCode
    API-->>Client: Set-Cookie: quiz_owner_tokens (HTTP-only) + 201 Created
    Client->>Creator: Redirects to Share Hub (/manage/[ownerToken]) with celebratory burst
```

### 2.3 UX Friction Removers in Creator Flow
1. **Pre-filled Defaults**: The studio never starts with blank inputs. It immediately presents 5 hilarious, universally relatable questions (e.g., *"What is my go-to 2 AM food?", "What is my biggest red flag?", "Who is my celebrity hall pass?"*).
2. **1-Tap Swap**: If the creator doesn't like a question, a single tap on the 🔄 **"Shuffle Idea"** button instantly replaces it with another top-voted template.
3. **Smart Validation**: Visual counter (`5 / 15 questions added`) turns vibrant green when ready. The Launch CTA is always floating and thumb-accessible.

---

## 3. Journey 2: The Friend Player Flow (The Challenge)

### 3.1 The Player Mindset
The friend tapped a link on an Instagram Story or WhatsApp group chat at 11:30 PM. They are curious, slightly competitive, and want to prove they are the "#1 bestie" while avoiding the embarrassment of scoring low.

### 3.2 Detailed Step-by-Step Flow

```mermaid
sequenceDiagram
    autonumber
    actor Friend as User B (Friend)
    participant Player as QuizPlayer (/q/[quizCode])
    participant ScoreAPI as Server (/api/quizzes/[code]/attempts)
    participant ResultPage as Result Screen (/result/[attemptCode])

    Friend->>Player: Lands on /q/[quizCode] from shared link
    Player->>Friend: Displays: "How well do you REALLY know Kaif?" + Avatar/Vibe
    Player->>Friend: Input field: "Enter your nickname to start"
    Friend->>Player: Types "Zack" + Taps "Start Challenge ⚡"
    
    loop For each Question (1 to Total)
        Player->>Friend: Renders Question Card + 4 Chunky Option Buttons (A, B, C, D)
        Friend->>Player: Taps Option (e.g., "Extra spicy ramen")
        Player->>Player: Instant tactile depression + sound/haptic + advance to next card (250ms delay)
    end

    Player->>ScoreAPI: POST /attempts { nickname, answers, timeSpent, honeypot }
    ScoreAPI->>ScoreAPI: Calculate score server-side (prevent cheating)
    ScoreAPI-->>Player: Return { attemptCode, score, total, percentage, rank }
    Player->>ResultPage: Transition to Dramatic 3-Beat Score Reveal
    ResultPage->>Friend: Confetti burst + Trophy Rank + "Create Your Own Quiz" CTA
```

### 3.3 Anti-Cheating & Integrity Guardrails
- **Zero Client Answer Key**: The client receives only `questionId`, `questionText`, and `options: [{ id, text }]`. The `correctOptionId` is NEVER delivered to the browser.
- **Timing & Bot Filter**: Attempts completed in under 3 seconds or with filled honeypot fields are rejected without disrupting legitimate users.

---

## 4. Journey 3: The Viral Re-Engagement Loop

### 4.1 The Conversion Funnel

```mermaid
stateDiagram-v2
    [*] --> FriendViewsResult: Friend finishes quiz
    FriendViewsResult --> TrophyReveal: Sees score & tier (e.g. 90% Soulmate)
    TrophyReveal --> DecisionPoint: Read funny roast/compliment microcopy
    
    DecisionPoint --> ShareSocial: "Share Score to WhatsApp / IG Story"
    DecisionPoint --> CreateOwnQuiz: "Think you know your friends better? Create YOUR Quiz"
    
    ShareSocial --> SocialTraffic: Squad members see score & tap link
    SocialTraffic --> [*]
    
    CreateOwnQuiz --> CreatorStudio: Direct jump to /create prefilled with friend's name
    CreatorStudio --> NewQuizPublished: Loop multiplies virally (K-factor > 1.2)
```

### 4.2 Key Viral Trigger Elements
1. **The Revenge CTA**: *"Now it's your turn. Make Kaif take your quiz and see if they remember YOUR favorite things!"*
2. **The High-Score Brag Card**: Ready-to-screenshot 9:16 Instagram Story graphic with user score, tier crown, and link tag placeholder.
3. **The WhatsApp Squad Nudge**: One-tap pre-formatted message:  
   *`"I just scored 9/10 on Kaif's Friendship Quiz! 👑 Can you beat my score? Take it here: https://lemonquiz.com/q/xyz"`*

---

## 5. Journey 4: Returning Creator & Squad Dashboard Flow

```mermaid
sequenceDiagram
    autonumber
    actor Creator as User A (Returning)
    participant Home as Homepage (/)
    participant Dashboard as /manage/[ownerToken]
    participant DB as MongoDB Atlas

    Creator->>Home: Visits homepage on mobile browser
    Home->>Home: Reads 'quiz_owner_tokens' cookie / LocalStorage fallback
    Home->>Creator: Displays "Welcome back, Kaif! Your quiz has 14 responses 👑"
    Creator->>Dashboard: Clicks "Open Squad Leaderboard"
    Dashboard->>DB: Query Quiz details + Attempts sorted by score DESC
    Dashboard->>Creator: Renders:
    Note over Dashboard,Creator: 1. Squad Podium (1st, 2nd, 3rd place with gold/silver crowns)<br/>2. Full Friend Roster with score pills & timestamps<br/>3. Insights: 'Hardest Question' & 'Squad MVP'<br/>4. Deep-dive drawer for each friend's answers
    
    Creator->>Dashboard: Taps on friend "Zack (9/10)"
    Dashboard->>Creator: Opens Drawer showing exactly which question Zack missed
    Creator->>Dashboard: Taps "Share Leaderboard to Story"
```

---

## 6. Journey 5: Safe Community & Abuse Reporting Flow

```mermaid
flowchart LR
    A["🚩 Flag Icon on Quiz"] --> B["Tap Report"]
    B --> C["Open Clean Report Modal"]
    C --> D{"Select Reason"}
    D -->|Spam| E["Spam / Scam"]
    D -->|Harassment| F["Bullying / Personal Attack"]
    D -->|Inappropriate| G["NSFW / Inappropriate Content"]
    D -->|Impersonation| H["Fake Identity"]
    E & F & G & H --> I["Optional 1-line note"]
    I --> J["Tap 'Submit Report'"]
    J --> K["Silent 200 OK + Gentle Toast: 'Thanks for keeping LemonQuiz safe'"]
    K --> L["Return to gameplay seamlessly"]
```

---

## 7. Edge Cases & Resilience Strategy

| Edge Case Scenario | UX Handling & Fallback Strategy |
| :--- | :--- |
| **User closes browser mid-quiz** | Answers stored in session memory; reloading prompts "Resume where you left off?" without restarting. |
| **Creator loses owner link** | Auto-restored via HTTP-only cookie + browser fingerprint + local storage mirror. |
| **Friend enters blank or emoji-only name** | Gentle inline tooltip: *"Enter at least 1 letter so your squad recognizes you!"* |
| **Slow network during submission** | Animated arcade spinner with microcopy: *"Calculating your Friendship IQ... Hang tight!"* (Timeout gracefully falls back to retry button). |
| **Quiz reaches rate limit** | Clean friendly countdown modal: *"Whoa speedster! Take a 30s breather before your next attempt."* |
| **Quiz deleted or expired** | Playful 404 screen with illustration: *"This quiz was archived by the creator. Why not start your own?"* |
