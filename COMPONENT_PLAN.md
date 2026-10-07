# BestFriend Quiz — Component Architecture & Inventory
**Document**: `COMPONENT_PLAN.md`  
**Application**: LemonQuiz  
**Tech Stack**: Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Lucide React, Canvas Confetti  
**Design Pattern**: Atomic Neo-Pop Primitives + Specialized Domain Components

---

## 1. Component Directory Hierarchy

```text
components/
├── ui/                                # Core Neo-Pop Design Primitives
│   ├── Button.tsx                     # Tactile 3D push button with hard shadows
│   ├── Input.tsx                      # High-contrast rounded form input
│   ├── Card.tsx                       # Tactile squircle container card
│   ├── Badge.tsx                      # Rotated sticker badges & status pills
│   ├── StickerPill.tsx                # Interactive emoji/vibe selection tags
│   ├── ProgressBar.tsx                # Gradient arcade progress indicator
│   ├── Modal.tsx                      # Accessible dialog with spring animation
│   ├── BottomSheet.tsx                # Mobile-first slide-up action drawer
│   └── Toast.tsx                      # Ephemeral feedback alerts
│
├── quiz/                              # Domain-Specific Quiz Components
│   ├── QuizPlayer.tsx                 # Core gameplay state orchestrator
│   ├── QuestionCard.tsx               # Active question display with sticker tag
│   ├── AnswerOptionButton.tsx         # 60px tactile option with letter badge
│   ├── QuestionBankCarousel.tsx       # Swipeable 100+ question idea bank
│   ├── QuestionEditor.tsx             # Custom question & option authoring card
│   ├── QuizCreator.tsx                # 2-step quiz creation studio wizard
│   ├── ResultTrophyCard.tsx           # 3-beat score reveal & friendship tier card
│   ├── QuestionReviewAccordion.tsx    # Post-quiz question-by-question breakdown
│   ├── ShareStoryModal.tsx            # Instagram/Snapchat 9:16 export modal
│   └── ReportQuizModal.tsx            # Safety & abuse reporting modal
│
├── dashboard/                         # Creator Management & Squad Leaderboard
│   ├── LeaderboardPodium.tsx          # Top 3 friends gold/silver/bronze podium
│   ├── FriendRankRow.tsx              # Squad member leaderboard list item
│   ├── QuizStatsSummary.tsx           # Total attempts, average score & MVP badge
│   ├── QuizControls.tsx               # Status toggle, share, and delete controls
│   └── FriendBreakdownDrawer.tsx      # Slide-over showing specific friend answers
│
└── feedback/                          # Animations, States & Loaders
    ├── ScoreCounterRoll.tsx           # Animated tabular score counter (0 -> X)
    ├── ConfettiBurst.tsx              # Multi-color particle celebration launcher
    ├── SuspenseLoader.tsx             # Bouncing lemon & cycling suspense copy
    └── EmptyStateBox.tsx              # High-energy empty illustrations & CTAs
```

---

## 2. Core UI Primitives Specification (`components/ui/`)

### 2.1 `Button.tsx` (Tactile 3D Push Button)
- **Role**: Primary interaction element across all screens.
- **Variants**:
  - `lemon` (Default Primary): Electric Lemon `#FACC15` with `#CA8A04` 4px bottom shadow.
  - `violet` (Secondary): Deep Violet `#8B5CF6` with `#5B21B6` 4px bottom shadow.
  - `coral` (Viral / Love): Hot Coral `#FF4D6D` with `#BE123C` 4px bottom shadow.
  - `ghost` (Discreet): Transparent with border `#312766` and hover highlight.
  - `danger` (Destructive): Savage Red `#EF4444` with `#991B1B` 4px bottom shadow.
- **Sizes**:
  - `sm`: 36px height (pills/badges).
  - `md`: 48px height (secondary actions).
  - `lg`: 58px–60px height (primary CTAs & answer options).
- **Physics**: `active:translate-y-1 active:shadow-none transition-all duration-75`.

### 2.2 `Input.tsx` (Chunky Arcade Input)
- **Role**: Nickname input, question text input, custom option editor.
- **Props**: `placeholder`, `value`, `onChange`, `maxLength`, `error`, `icon`, `addonRight`.
- **States**:
  - *Default*: `bg-[#1A1538] border-2 border-[#312766] text-white rounded-2xl h-14 px-4 text-base`.
  - *Focus*: `border-[#FACC15] ring-2 ring-[#FACC15]/20`.
  - *Error*: `border-[#EF4444] ring-2 ring-[#EF4444]/20`.

### 2.3 `Badge.tsx` & `StickerPill.tsx` (Rotated Sticker Pins)
- **Role**: Category indicators, trending tags, rank badges.
- **Styling**: `rounded-full px-3.5 py-1 text-xs font-black uppercase tracking-wider inline-flex items-center gap-1.5`.
- **Special Effect**: Optional `tilt` prop (`tilt="left"` -> `-2deg`, `tilt="right"` -> `+3deg`).

### 2.4 `ProgressBar.tsx` (Arcade Energy Meter)
- **Role**: Top HUD during quiz gameplay.
- **Visual**: Rounded container (`h-3 bg-[#1A1538] rounded-full overflow-hidden border border-[#312766]`).
- **Fill**: Gradient bar (`from-[#FACC15] via-[#FF4D6D] to-[#8B5CF6]`) transitioning with `transition-all duration-300 ease-out`.

---

## 3. Quiz Domain Components (`components/quiz/`)

### 3.1 `AnswerOptionButton.tsx`
- **Role**: The core gameplay interaction component.
- **Props**:
  ```typescript
  interface AnswerOptionButtonProps {
    letter: "A" | "B" | "C" | "D" | "E" | "F";
    text: string;
    isSelected: boolean;
    isDisabled: boolean;
    state?: "idle" | "selected" | "correct" | "wrong";
    onSelect: () => void;
  }
  ```
- **Visual Architecture**:
  - Left: Rounded square badge (`w-9 h-9 rounded-xl font-black text-sm`) displaying letter `A`, `B`, `C`, etc.
  - Center: Option text (`font-bold text-base sm:text-lg flex-1 text-left`).
  - Right: Indicator icon (Checkmark for selected/correct, Cross for wrong).
- **Height**: Guaranteed `min-h-[58px]` for thumb ergonomics.

### 3.2 `QuestionBankCarousel.tsx`
- **Role**: Rapid question selector in Creator Studio.
- **Features**:
  - Tab filters for question categories (🌟 *Trending*, 🍕 *Food & Habits*, 💀 *Savage Roasts*, 🔮 *Deep Lore*, 💖 *Crushes*).
  - Horizontal scroll-snap card deck on mobile.
  - 1-tap **"+ Add Question"** button injecting question directly into active quiz.

### 3.3 `ResultTrophyCard.tsx`
- **Role**: High-stakes score reveal screen.
- **Features**:
  - Orchestrates 3-beat reveal: Suspense pulse -> Animated score roll-up -> Trophy badge drop -> Confetti burst.
  - Dynamically computes Friendship Verdict Tier (Soulmate, Ride or Die, Homie, Acquaintance, Stranger).
  - Prominently embeds the viral CTA: **"Think you know your squad better? Make YOUR Quiz in 60s"**.

### 3.4 `ShareStoryModal.tsx`
- **Role**: Renders an exportable 9:16 Instagram/Snapchat Story card.
- **Export Formats**: Canvas image download, native Web Share API trigger (`navigator.share`), or 1-tap direct clipboard copy.

---

## 4. Dashboard & Leaderboard Components (`components/dashboard/`)

### 4.1 `LeaderboardPodium.tsx`
- **Role**: Visual podium showcasing 1st, 2nd, and 3rd place squad members.
- **Visuals**:
  - 🥇 1st Place (Center, Elevated): Gold crown sticker + Glowing yellow border + Score percentage.
  - 🥈 2nd Place (Left): Silver star sticker + Slate border.
  - 🥉 3rd Place (Right): Bronze medal sticker + Amber border.

### 4.2 `FriendRankRow.tsx`
- **Role**: Roster item for all other participants (Rank 4+).
- **Visuals**: Compact card with Rank `#`, Nickname, Score pill (`7/10`), Date taken, and Chevron indicator to open Answer Breakdown Drawer.

### 4.3 `FriendBreakdownDrawer.tsx`
- **Role**: Slide-over bottom sheet / modal displaying exact question-by-question answers given by a selected friend compared to creator's real answer.

---

## 5. Feedback & Animation Primitives (`components/feedback/`)

### 5.1 `ScoreCounterRoll.tsx`
- **Role**: Smooth numerical increment animation from `0` to `Final Score` over 1200ms using `requestAnimationFrame`.

### 5.2 `ConfettiBurst.tsx`
- **Role**: Canvas confetti explosion on quiz completion and quiz launch using brand colors (`#FFE600`, `#FF4D6D`, `#8B5CF6`, `#10B981`).

### 5.3 `SuspenseLoader.tsx`
- **Role**: Playful arcade loader during attempt scoring calculation with rotating funny microcopy lines.
