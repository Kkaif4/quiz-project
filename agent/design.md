# UI/UX Design System: Friendship Quiz (Premium Youth Edition)

> **Target Demographic**: Ages 12–20 (Middle school, high school, and university friends).  
> **Aesthetic Archetype**: *Premium Youth Modern* — Crisp, vibrant, tactile, and sleek. Inspired by Spotify Wrapped, Locket, BeReal, and Arc.  
> **Key Directive**: **Zero cheap system emoji clutter.** Standard OS emojis look inconsistent across devices and make web apps look cheap or amateurish. Every visual accent uses **refined vector iconography, polished micro-badges, crisp typography, and subtle ambient glows.**

---

## 1. Design Philosophy

Teenagers and young adults have high visual standards shaped by modern mobile apps. The design must feel aspirational, clean, and shareable—never like a preschool toy or a boring school form.

### The Core Principles
1. **Device-Agnostic Premium Polish**: No OS emoji rendering discrepancies (iOS vs Android vs Windows). All iconography is rendered via crisp, scalable vector icons (`lucide-react`) and custom SVG badges.
2. **Tactile Spring Physics**: Buttons and interactive cards have subtle spring physics (`cubic-bezier(0.16, 1, 0.3, 1)`), tactile click compression (`scale-[0.98]`), and smooth card transitions.
3. **Airy Layered Surfaces**: Soft satin card surfaces, frosted glass (`backdrop-blur-md`), subtle micro-borders (`ring-1 ring-black/[0.06]`), and soft ambient shadows (`shadow-[0_8px_30px_rgb(0,0,0,0.04)]`).
4. **Mobile & Thumb-First**: 95%+ of traffic comes from WhatsApp/Instagram links. All touch targets are comfortably thumb-sized (minimum 52px–60px option height).
5. **High-Conversion Frictionless CTAs**: Clear visual hierarchy leading the player from result inspection into creating their own quiz.

---

## 2. Color System & Lighting

A clean, warm canvas elevated with vibrant, controlled accent pigments (Sunlight Amber, Deep Indigo, and Electric Rose) and ultra-crisp slate typography.

### Primary Accents
| Token | Hex | Tailwind Utility | Visual Role |
| :--- | :--- | :--- | :--- |
| **Amber Sun** (Primary) | `#F59E0B` / `#D97706` | `bg-amber-500`, `text-amber-600` | Main CTA, active states, key highlight glow |
| **Deep Indigo** (Contrast) | `#4F46E5` | `bg-indigo-600`, `text-indigo-600` | Secondary highlights, tags, focus indicators |
| **Electric Rose** | `#F43F5E` | `bg-rose-500`, `text-rose-500` | Best friend badges, heart accents, attention pins |
| **Emerald Crisp** | `#10B981` | `bg-emerald-500`, `text-emerald-500` | Correct answers, high tier scores, live badges |
| **Sky Blue** | `#0EA5E9` | `bg-sky-500`, `text-sky-500` | Share action button, analytics badges |

### Neutral & Surface Palette
| Token | Hex | Tailwind Utility | Visual Role |
| :--- | :--- | :--- | :--- |
| **Velvet Canvas** | `#FAFAF9` | `bg-stone-50` / `bg-[#FAFAF9]` | Warm, eye-pleasing background |
| **Satin Pure** | `#FFFFFF` | `bg-white` | Question cards, modals, top navigation |
| **Muted Pill** | `#F1F5F9` | `bg-slate-100` | Option unselected surface, badge background |
| **Micro-Border** | `rgba(15, 23, 42, 0.07)` | `border-slate-200/80` or `ring-1 ring-slate-900/5` | Razor-sharp, elegant card borders |
| **Obsidian Dark** | `#0F172A` | `text-slate-900` | Headlines, question titles, primary button text |
| **Subtle Slate** | `#64748B` | `text-slate-500` | Subtitles, timestamps, helper labels |

---

## 3. Typography & Hierarchy

Utilize a modern geometric sans-serif (e.g., `Plus Jakarta Sans`, `Outfit`, or `Inter` with tight tracking for headlines).

```text
Display 1 (Score / Hero)  : text-4xl sm:text-5xl font-extrabold tracking-tight text-slate-950
H1 (Question Title)       : text-xl sm:text-2xl font-bold tracking-tight text-slate-900 leading-snug
H2 (Section Header)       : text-lg font-bold text-slate-800
Body Text                 : text-base font-medium text-slate-700 leading-relaxed
Micro-Label / Tag         : text-xs font-semibold uppercase tracking-wider text-slate-500
Option Text               : text-base sm:text-lg font-semibold text-slate-900
```

---

## 4. Iconography & Asset Guidelines (No Raw Emojis)

All visual indicators use **Lucide React** vector icons styled with container pills and colored stroke weights.

| Context | Icon (`lucide-react`) | Styling / Presentation |
| :--- | :--- | :--- |
| **Brand Mark / Logo** | `Sparkles` or `Zap` | Dual-tone pill badge with amber glow |
| **Best Friend Template** | `HeartHandshake` | Rose duotone badge (`bg-rose-50 text-rose-600 p-2 rounded-xl`) |
| **Chaos & Fun Template** | `Flame` | Orange duotone badge (`bg-orange-50 text-orange-600 p-2 rounded-xl`) |
| **Favorites Template** | `Compass` or `BookmarkCheck` | Indigo duotone badge (`bg-indigo-50 text-indigo-600 p-2 rounded-xl`) |
| **Deep Questions** | `MessageCircleHeart` | Violet duotone badge (`bg-violet-50 text-violet-600 p-2 rounded-xl`) |
| **Top Rank (1st)** | `Crown` | Gold accent pill (`bg-amber-100 text-amber-700`) |
| **Second Rank (2nd)** | `Medal` | Silver accent pill (`bg-slate-100 text-slate-700`) |
| **Third Rank (3rd)** | `Award` | Bronze accent pill (`bg-orange-100 text-orange-800`) |
| **Share Link** | `Share2` / `Copy` | Crisp outline with instant toast confirmation |
| **WhatsApp Direct** | Brand SVG / `Send` | Deep emerald green pill (`bg-[#25D366] text-white`) |
| **Safety / Report** | `ShieldAlert` | Discreet slate outline icon in footer |

---

## 5. Screen-by-Screen UI Specifications

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PREMIUM USER EXPERIENCE                         │
│                                                                        │
│  [ Landing Page ] ────────► [ Template Picker ] ──────► [ Share View ] │
│         │                                                     │        │
│         ▼                                                     ▼        │
│  [ "My Quizzes" Hub ]                                 [ /q/:quizCode ] │
│                                                               │        │
│                                                               ▼        │
│                                                       [ Quiz Player ]  │
│                                                               │        │
│                                                               ▼        │
│                                                       [ Results Card ] │
│                                                               │        │
│                                                               ▼        │
│                                                   [ Create My Own ]    │
└────────────────────────────────────────────────────────────────────────┘
```

### 1. Landing Page (`/`)
- **Header**: Minimalist navigation bar with logo mark (`Sparkles` icon in amber pill + *"FriendQuiz"* in bold slate-950) and a subtle *"My Quizzes"* link button.
- **Hero Section**:
  - Top Pill Badge: `ring-1 ring-amber-500/20 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-xs font-semibold inline-flex items-center gap-1.5` with a subtle spark icon.
  - Headline: **"Find out who knows you best."**
  - Subhead: *"Create a personalized quiz in 60 seconds, share the link with friends, and watch real-time rankings roll in."*
  - Primary CTA:
    - High-impact button: `bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98] px-8 py-4 rounded-2xl font-bold shadow-lg shadow-slate-950/15 flex items-center justify-center gap-2`.
    - Icon: `ArrowRight` or `Plus`.
- **Sample Question Showcase**:
  - Floating satin card displaying a mock question: *"What is my go-to comfort food?"* with 4 sleek option pills.
- **Returning Creator Drawer ("My Quizzes")**:
  - Automatically loads if owner tokens exist in cookies or local storage.
  - Section header: `Your Active Quizzes` with live pulse indicator.
  - Quiz cards show title, attempt count badge (`Users` icon + count), and a direct `Manage` button with `ChevronRight`.

---

### 2. Quiz Creator (`/create`)
- **Top Navigation**:
  - Clean step indicator: `Question 3 of 7` with a sleek horizontal progress bar (`h-1.5 bg-slate-100 rounded-full overflow-hidden`).
- **Template Selector (Carousel of Cards)**:
  - Clean horizontal scroll or grid of pill cards:
    - `HeartHandshake` icon + **Best Friends**
    - `Flame` icon + **Chaos & Fun**
    - `Compass` icon + **Favorites**
    - `Sparkles` icon + **Blank Canvas**
  - Tapping an item instantly loads high-quality question presets into the editor.
- **Question Editor Card**:
  - White satin card with `rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8`.
  - Question input with clean, floating label styling.
  - Options list (2 to 6 options):
    - Each option has a sleek text input.
    - Right side contains a circular checkmark button:
      - Unchecked: `w-7 h-7 rounded-full border border-slate-300 flex items-center justify-center hover:border-slate-400`.
      - Correct Answer: `w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm` with `Check` icon.
- **Action Dock (Sticky Mobile Bottom Bar)**:
  - `+ Add Question` button (secondary slate pill).
  - `Publish Quiz` button (primary bold button with `CheckCircle2` icon).

---

### 3. Quiz Player Screen (`/q/[quizCode]`)
- **Stage 1: Identity Card**:
  - Satin card floating in the viewport center.
  - Title: *"Rahul created a friendship test for you"*
  - Subtitle: *"Enter your name or nickname to get on the leaderboard."*
  - Input: Full-width modern input with `User` icon prefix.
  - Button: `Start Quiz` with smooth transition to question cards.
- **Stage 2: Question Experience**:
  - Clean progress bar pinned at top (`h-1 bg-amber-500 transition-all duration-300`).
  - Question Card:
    - Question index tag: `QUESTION 03` in micro-caps.
    - Large, legible prompt text (20px–24px).
  - 4 Interactive Option Buttons:
    - Minimum height: 56px.
    - Style: `w-full text-left px-5 py-4 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50 active:scale-[0.99] transition-all flex items-center justify-between font-medium text-slate-800`.
    - Left side: Clean alphabetical index badge (`A`, `B`, `C`, `D`) in a soft slate circle.
    - Selection animation: Immediate subtle glow ring, check icon trigger, and smooth 250ms slide to the next card.
- **Footer**:
  - Discreet `ShieldAlert` icon with text: *"Report this quiz"* (opens a clean, non-intrusive modal).

---

### 4. Results Page & Viral Conversion (`/q/[quizCode]/result/[attemptCode]`)
- **Score Showcase**:
  - Circular progress ring or bold geometric score tile:
    - Large typographic score: **8 / 10** (`text-5xl font-black text-slate-950`).
    - Percentage pill: **80% MATCH** with emerald or amber background.
  - Confetti Effect: High-end particle explosion (`canvas-confetti` using gold, rose, and indigo geometric confetti shapes—no emoji debris).
  - Dynamic Friendship Verdict:
    - **90–100%**: *"Inner Circle Status"* — You know them better than almost anyone.
    - **70–89%**: *"Certified Bestie"* — High compatibility and genuine connection.
    - **40–69%**: *"Casual Friend"* — Good vibes, but plenty of secrets left to learn.
    - **0–39%**: *"Strangers with Memories"* — Time to sit down and catch up.
- **High-Impact Viral CTAs**:
  1. **Primary Button (High-End Contrast)**:  
     `[ Create Your Own Quiz ]`  
     `bg-slate-950 text-white hover:bg-slate-800 active:scale-[0.98] py-4 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-slate-950/20`  
     *(Includes `Sparkles` icon)*
  2. **Secondary Button**:  
     `[ Share Score via WhatsApp ]`  
     `bg-emerald-600 text-white hover:bg-emerald-500 py-3.5 rounded-2xl font-semibold flex items-center justify-center gap-2`
  3. **Tertiary Action**:  
     `[ Copy Link ]` (clean ghost pill button).

---

### 5. Owner Dashboard (`/manage/[ownerToken]`)
- **Banner**:
  - *"Your Quiz is Active & Live"* with a green status dot (`h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse`).
- **One-Click Share Hub**:
  - Card with the public quiz link and quick-action buttons:
    - `Copy Link` (`Copy` icon).
    - `WhatsApp Share` (direct deep-link with pre-formatted invitation text).
- **Security Notice Pill**:
  - Subtle amber banner with `KeyRound` icon:  
    *"Private Dashboard — Bookmark this page to view updated friend responses anytime."*
- **Metrics Grid**:
  - 3 minimalist cards with micro-icons:
    - `Eye` icon: Total Views
    - `Users` icon: Total Responses
    - `TrendingUp` icon: Average Score
- **Live Leaderboard**:
  - Sorted rankings by highest score and submission recency.
  - Rows display:
    - Rank badge: `Crown` (1st), `Medal` (2nd), `Award` (3rd), or `#4+` numeral pill.
    - Participant Name (bold).
    - Score Tag: `8/10 (80%)`.
    - Relative time tag: `5m ago`.
- **Response Toggle**:
  - Sleek switch to pause/resume submissions (`active` vs `disabled`).

---

## 6. Micro-Interactions & Animation Guidelines

1. **Button Presses**: `active:scale-[0.98] transition-transform duration-100 ease-out`.
2. **Page & Card Transitions**: Subtle upward fade (`opacity: 0, y: 8` to `opacity: 1, y: 0` over 200ms).
3. **Selection State**: Quick border color interpolation (`border-slate-200` to `border-amber-500 ring-2 ring-amber-500/20`).
4. **Toast Feedback**: Clean bottom-center pill toasts with check icon for actions like link copying.

---

## 7. Quality & Consistency Guardrails

- **Zero OS Emojis in Core UI**: Do not use system emojis in headers, buttons, cards, or status indicators. Use Lucide icons or tailored SVG assets.
- **Device Parity**: Layouts and assets look pixel-identical whether viewed on an iPhone Safari browser, an Android Chrome browser, or a desktop screen.
- **WCAG AA Compliance**: High-contrast ratios maintained across all text-to-background combinations.
