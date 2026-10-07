# BestFriend Quiz — Complete Screen Specifications
**Document**: `SCREEN_SPECIFICATIONS.md`  
**Application**: LemonQuiz  
**Coverage**: All 17 Core Screens, Dynamic Views, Drawers, and State Variations

---

## Screen 1: Viral Landing Page (`/`)

### 1.1 Overview & Goals
- **URL**: `/`
- **Goal**: Hook visitors in < 3 seconds, showcase social proof, explain the 3-step loop instantly, and convert them to create a quiz or resume managing their existing quizzes.
- **User Mindset**: *"What is this? Is it fun? Is it fast? Let's check it out."*

### 1.2 Layout & Component Structure
1. **Sticky Header**:
   - Left: LemonQuiz Neo-Pop logo (Lemon icon with subtle wiggle + bold wordmark).
   - Right: Tactile "+ Create Quiz" button (`btn-tactile-lemon`).
2. **Hero Section**:
   - Floating Squad Badge: *"🔥 Over 250,000 Friendship Tests Taken"*.
   - Main Punchy Headline: **"How well do your friends *really* know you?"** (Gradient lemon & berry text).
   - Subtitle: *"Make a personalized quiz in 60s, drop it in your group chat or IG story, and watch the chaos unfold."*
   - Primary CTA: **"Create Your Quiz in 60s 🚀"** (Large 60px tactile button with sparkle accent).
3. **Interactive Live Teaser Card (Mock Question)**:
   - Playable sample question card with 4 tactile option buttons (e.g. *"What is my go-to late night snack?"*). Tapping an option triggers instant celebratory checkmark or playful roast reaction.
4. **Returning Creator Drawer ("My Quizzes")**:
   - Streamed asynchronously via React Server Component. Displays active quizzes with live attempt counters and direct links to `/manage/[ownerToken]`.
5. **3-Step How-It-Works Visual Strip**:
   - Step 1: *Pick your questions* ✏️
   - Step 2: *Share to Group Chat / Story* 📱
   - Step 3: *Crown your squad MVP* 👑
6. **FAQ Accordion & SEO Footer**:
   - Clean, expandable cards answering safety, anonymity, and sharing questions.

### 1.3 Mobile vs. Desktop Behavior
- **Mobile (360px–430px)**: Hero CTA takes 100% width with sticky bottom bar when scrolled past hero; question cards stack vertically.
- **Desktop (1024px+)**: 2-column hero with marketing copy on left and interactive playable card on right.

---

## Screen 2: Creator Studio — Step 1: Identity & Vibe (`/create`)

### 2.1 Overview & Goals
- **URL**: `/create` (Stage 1)
- **Goal**: Capture creator identity with zero friction.
- **User Mindset**: *"Let me set my name and choose a vibe."*

### 2.2 Layout & Components
1. **Progress Header**: Pill badge showing *"Step 1 of 2: Set Your Identity"*.
2. **Title**: *"Who is this quiz about?"*
3. **Name Input**: Chunky input field (`bg-[#1A1538] border-2 border-[#312766] rounded-2xl h-14 px-4 text-lg font-bold`).
   - Placeholder: *"e.g. Alex, Sarah, or The Squad Leader"*.
   - Real-time character counter (`0 / 30`).
4. **Vibe & Mascot Selector**:
   - Horizontal scrollable sticker pills: 👑 *The MVP*, ⚡ *Wild Energy*, 💅 *Main Character*, 🍋 *Sour & Sweet*, 🎮 *Gamer Lore*, 🍕 *Foodie*.
5. **Primary CTA**: **"Next: Pick Questions ➡️"** (Disabled until name is entered, activates with bright lemon pop).

---

## Screen 3: Creator Studio — Step 2: Question Editor & Idea Bank (`/create`)

### 3.1 Overview & Goals
- **URL**: `/create` (Stage 2)
- **Goal**: Enable creators to curate 3 to 15 questions in under 60 seconds using pre-built idea banks and custom options.
- **User Mindset**: *"I want funny, savage, and deep questions without typing everything from scratch."*

### 3.2 Layout & Components
1. **Top Bar**:
   - Question Counter Badge: `[ 5 / 15 Questions Added ]` (Turns vibrant green at >= 3).
   - Category Filters: 🌟 *Trending*, 🍕 *Food & Habits*, 💀 *Savage Roasts*, 🔮 *Deep Lore*, 💖 *Crushes & Love*.
2. **Rapid Question Idea Carousel**:
   - Swipeable cards with pre-written questions. Tap **"+ Add This Question"** to insert immediately.
3. **Active Question Card List**:
   - Each card has:
     - Editable Question Title Input.
     - Option List (2 to 6 options per question).
     - Tactile **Correct Answer Checkbox Pill** (Creator taps to mark the true answer).
     - Trash icon to remove question.
     - Reorder handle.
4. **Floating Action Bar (Sticky Bottom)**:
   - Left: **"+ Add Custom Question"** button.
   - Right: **"Launch Quiz 🚀"** (Tactile gold button).

### 3.3 Mobile Optimization
- Fixed bottom action bar with `backdrop-blur-md` ensuring the "Launch" button is always thumb-accessible regardless of scroll position.

---

## Screen 4: Quiz Preview Mode Modal

### 4.1 Overview & Goals
- **Goal**: Allow creator to test the gameplay experience exactly as friends will see it before publishing.
- **User Mindset**: *"Let me do a quick speedrun to make sure there are no typos."*

### 4.2 Layout & Components
- Modal overlay with phone frame preview.
- Shows mock player with Next/Prev navigation.
- Bottom pill: *"Preview Mode — Answers are not saved"*.
- Top right: *"Looks Good! Publish 🚀"* button.

---

## Screen 5: Quiz Published & Viral Share Hub

### 5.1 Overview & Goals
- **URL**: `/manage/[ownerToken]` (Triggered right after creation or when managing)
- **Goal**: Maximize immediate sharing to group chats and stories.
- **User Mindset**: *"My quiz is ready! Let me send this to the squad immediately."*

### 5.2 Layout & Components
1. **Celebration Banner**:
   - Bouncing lemon badge + Confetti burst.
   - Title: **"Your Friendship Quiz is LIVE! 🎉"**.
   - Subtitle: *"Share your unique link and see who gets 100% first."*
2. **1-Tap Share Channels**:
   - 🟢 **"Share to WhatsApp Group Chat"** (Direct deep link with custom emoji message).
   - 🟣 **"Download Instagram Story Card"** (Generates 9:16 graphic ready to post with a link sticker).
   - 📋 **"Copy Quiz Link"** (Big tactile button; transforms to *"Copied! ✨"* with green ripple).
3. **Secret Owner Notice**:
   - Pill reminder: *"Bookmark this page to view your squad leaderboard anytime!"*.

---

## Screen 6: Friend Quiz Welcome Screen (`/q/[quizCode]`)

### 6.1 Overview & Goals
- **URL**: `/q/[quizCode]` (Step 1)
- **Goal**: Engage the friend, set the challenge stakes, and capture their nickname.
- **User Mindset**: *"Kaif sent me his quiz. Let me show him I'm his #1 bestie."*

### 6.2 Layout & Components
1. **Creator Header Card**:
   - Creator's chosen avatar/vibe sticker + Name: **"Kaif's BestFriend Test"**.
   - Sub-badge: *"8 Questions • Takes ~45 seconds"*.
2. **Challenge Banner**:
   - **"Are you a Real One 👑 or a Fake Friend 💀?"**
   - *"Answer honestly. Kaif will see your full score and answers on his live leaderboard."*
3. **Nickname Input**:
   - Large tactile input: *"Enter your nickname or IG handle"*.
   - Helper note: *"Use a name Kaif will recognize!"*.
4. **Anti-Bot Honeypot**: Hidden field for spam bots.
5. **Primary CTA**: **"Start Challenge ⚡"** (60px tactile lemon button).
6. **Discreet Footer**: Flag icon for community safety / report.

---

## Screen 7: Quiz Answering / Gameplay Screen (`/q/[quizCode]`)

### 7.1 Overview & Goals
- **URL**: `/q/[quizCode]` (Step 2 - Active gameplay)
- **Goal**: Deliver a lightning-fast, gamified question-by-question flow that feels like a party game.
- **User Mindset**: *"Focus mode. Which option is definitely his favorite?"*

### 7.2 Layout & Components
1. **Top HUD Bar**:
   - Question Progress Pill: `[ Question 3 of 8 ]`.
   - Smooth animated gradient progress bar across the top.
   - Discreet flag icon (Report).
2. **Active Question Card**:
   - Tactile squircle card (`rounded-3xl bg-[#1A1538] border-2 border-[#312766] shadow-tactile p-6 sm:p-8`).
   - Dynamic Category Sticker Pin (e.g. 🍕 *LATE NIGHT HABITS*).
   - ExtraBold Question Heading (22px–26px).
3. **Answer Option Stack (4 Cards)**:
   - 4 large tactile buttons with letter badges (`A`, `B`, `C`, `D`).
   - Height: 60px minimum.
   - Press physics: `active:translate-y-1`.
   - On tap: Option illuminates in Electric Lemon, plays subtle haptic bounce, and automatically advances to next question after 220ms.

---

## Screen 8: Quiz Submission & Suspense Scoring State

### 8.1 Overview & Goals
- **Goal**: Build anticipation while scoring is calculated securely on the server.
- **User Mindset**: *"Did I nail it? What's my score?"*

### 8.2 Layout & Components
- Centered playful arcade animation: Bouncing lemon with sparkling aura.
- Animated dynamic microcopy cycling every 600ms:
  - *"Consulting the Friendship Oracle... 🔮"*
  - *"Calculating your Squad Loyalty IQ... 🧠"*
  - *"Compiling your Friendship Verdict... ⚡"*

---

## Screen 9: Friend Result & Trophy Reveal (`/q/[quizCode]/result/[attemptCode]`)

### 9.1 Overview & Goals
- **URL**: `/q/[quizCode]/result/[attemptCode]`
- **Goal**: Deliver the high-dopamine score reveal, crown the friendship tier, and trigger the viral loop CTA.
- **User Mindset**: *"I got 85%! I'm a Ride or Die! Let me screenshot this and then make my own quiz."*

### 9.2 Layout & Components
1. **Top Celebration Pill**: *"Challenge Completed! 🎉"*.
2. **Main Social Trophy Card (Ready for Screenshotting)**:
   - Glowing circular tier backdrop.
   - Large animated score roll-up: **"8 / 10"** (`font-black text-6xl`).
   - Percentage Tag: **"80% Friendship Match"**.
   - Friendship Verdict Badge: **"👑 Ride or Die BFF"**.
   - Funny roast/compliment verdict text: *"Real one! You know the deepest secrets and comfort foods."*
3. **Primary Viral CTA (Highest Visual Weight)**:
   - **"⚡ Think you know Kaif better? Make YOUR Quiz in 60s"** (`btn-tactile-lemon h-16 text-lg font-black w-full`).
4. **Secondary Action**:
   - **"📸 Share Result to Story / WhatsApp"** (Exports card or opens share drawer).
5. **Question Breakdown Accordion**:
   - Expandable list showing every question, what the friend picked, and whether it was correct (without revealing creator's other hidden answers).

---

## Screen 10: Exportable 9:16 Social Story Card

### 10.1 Overview & Goals
- **Goal**: High-contrast, beautifully formatted graphic optimized for Instagram and Snapchat stories.
- **User Mindset**: *"This looks aesthetic. Posting directly to my story."*

### 10.2 Card Dimensions & Visuals
- **Aspect Ratio**: 9:16 (1080 x 1920 logical canvas).
- **Background**: Deep space ink with electric lemon & hot berry ambient glow.
- **Top**: LemonQuiz Neo-Pop branding + Creator badge (*"Kaif's Friendship Challenge"*).
- **Center**: Giant Trophy Pill + Score (*"Zack scored 90% — Certified Soulmate 🔮"*).
- **Bottom**: Link Sticker Area (*"Take the test: lemonquiz.com/q/xyz"*).

---

## Screen 11: Creator Dashboard & Live Leaderboard (`/manage/[ownerToken]`)

### 11.1 Overview & Goals
- **URL**: `/manage/[ownerToken]`
- **Goal**: Provide the creator with real-time squad analytics, podium standings, and individual friend answer breakdowns.
- **User Mindset**: *"Let's see who took my quiz today and who totally failed."*

### 11.2 Layout & Components
1. **Quiz Overview Header**:
   - Quiz Title + Status Pill (🟢 Active / 🔴 Closed).
   - Stats Bar: **Total Attempts (18)** • **Avg Score (72%)** • **Top Squad MVP (Sarah - 100%)**.
   - 1-Tap Share Bar: Quick buttons to copy link or share to WhatsApp.
2. **The Squad Podium (Top 3 Friends)**:
   - 🥇 1st Place: Gold Crown Avatar card.
   - 🥈 2nd Place: Silver Medal card.
   - 🥉 3rd Place: Bronze Medal card.
3. **Full Friend Roster (Sorted by Score / Recency)**:
   - List of all participants with:
     - Rank number (`#1`, `#2`, ...).
     - Friend Nickname.
     - Score pill (`8/10 (80%)`).
     - Time taken & timestamp.
     - Tap to inspect friend's specific answers.
4. **Quiz Controls & Settings**:
   - Toggle Quiz Acceptance (Open / Paused).
   - Edit Quiz (if 0 attempts).
   - Danger Zone: Delete Quiz.

---

## Screen 12: Individual Friend Breakdown Drawer

### 12.1 Overview & Goals
- **Goal**: Slide-over drawer letting the creator see exactly how a specific friend answered each question.
- **User Mindset**: *"Wait, what did Jake think my favorite movie was?"*

### 12.2 Layout & Components
- Header: Friend Name + Total Score + Timestamp.
- Question-by-Question List:
  - Question Title.
  - Friend's Picked Answer.
  - Green check if match, Red cross with creator's true answer if missed.
- Action: *"Share Friend's Score Card to Chat"*.

---

## Screen 13: Quiz Settings & Danger Zone Modal

### 13.1 Overview & Goals
- **Goal**: Safe management of quiz status and deletion.
- **Components**:
  - Close/Pause toggle with immediate status update.
  - Delete quiz button with double-confirmation prompt to prevent accidental data loss.

---

## Screen 14: Empty State Variations

1. **No Attempts Yet (Dashboard)**:
   - Illustration: Floating lonely lemon with megaphone 📢.
   - Headline: *"Your quiz is waiting for the squad!"*.
   - Copy: *"Share your link on WhatsApp or your IG Story to get your first response."*
   - CTA: **"Share Quiz Link Now 🚀"**.
2. **No Quizzes Created Yet (Homepage Drawer)**:
   - Friendly prompt encouraging 60s creation.

---

## Screen 15: Loading States & Skeletons

- **Landing Page Skeletons**: Shimmering card outlines matching exact typography and button heights.
- **Leaderboard Skeleton**: Pulsing podium placeholders and table rows.
- **Gameplay Skeleton**: Minimalist card loader preventing layout shift.

---

## Screen 16: Error & Rate-Limit States

1. **Rate Limit Hit (429)**:
   - Friendly toast/modal: *"Whoa speedster! 🏎️ Take a 30s breather before your next attempt."* with countdown timer.
2. **Quiz Not Found / Deleted (404)**:
   - Playful ghost sticker: *"This quiz vanished into the void or was archived by the creator."*
   - CTA: **"Create Your Own Quiz 🚀"**.

---

## Screen 17: 404 Not Found Page (`app/not-found.tsx`)

### 17.1 Layout & Components
- Funky lost sticker graphic.
- Big Display Text: **"Lost in the Squad Void? 🛸"**.
- Microcopy: *"Looks like this link took a wrong turn at 3 AM."*.
- Primary CTA: **"Back to LemonQuiz Home 🏠"**.
- Secondary CTA: **"Create a Fresh Quiz ✨"**.
