# BestFriend Quiz — UI/UX Design & Architecture Specification
**Document**: `UI_UX_DESIGN_PLAN.md`  
**Target Demographic**: Teens & Young Adults (Ages 13–20)  
**Product Identity**: LemonQuiz — The Ultimate Viral Friendship Game  
**Design Philosophy**: "Neo-Pop Social Arcade & Tactile Stickerbook"  
**Platform Focus**: Mobile-First (360px–430px) with Responsive Desktop Scaling

---

## 1. Product Vision & Brand Essence

### 1.1 The Core Mission
**LemonQuiz** is not an enterprise survey tool or an exam system. It is a **digital social playground** designed for Gen Z friends, classmates, squad group chats, and internet besties to test, roast, celebrate, and validate how well they actually know each other.

### 1.2 The Emotional Core
Every screen, transition, and micro-interaction is tuned to trigger distinct social emotions:
- **Curiosity**: *"Did Sarah actually remember my secret fear of pigeons?"*
- **Playful Competition**: *"I can't let Jake score higher than me on Kaif's quiz."*
- **Affection & Clout**: *"We got 100% — we're officially soulmates. Posting this to my Instagram story right now."*
- **Mischief & Roasting**: *"Bro scored 20% on my quiz... exposing him in the squad group chat."*

### 1.3 The Viral Engine Loop
```
   ┌────────────────────────────────────────────────────────┐
   │                      THE VIRAL LOOP                    │
   └────────────────────────────────────────────────────────┘
                               │
               [1] Creator builds 60s Quiz
                               │
                               ▼
               [2] Shares Link to IG Story / WhatsApp GC
                               │
                               ▼
               [3] Squad members play & get roasted / hyped
                               │
                               ▼
               [4] High-impact 9:16 Trophy Card Reveal
                               │
                               ▼
               [5] Friend clicks "Create Your Own Quiz" ───┐
                               │                            │
                               ▼                            ▼
                 [6] Squad ranks on Leaderboard      (Loop restarts)
```

---

## 2. Target Audience Deep Dive (Ages 13–20)

### 2.1 Online Behavioral Profile
- **Primary Channels**: WhatsApp group chats, Instagram Direct Messages, Instagram Stories, Snapchat Streaks, Discord servers, TikTok.
- **Attention Budget**: 3 to 5 seconds to get hooked. If the quiz creator takes longer than 60 seconds or requires sign-up passwords, they bounce.
- **Visual Diet**: High-energy TikTok transitions, Duolingo gamification, BeReal authentic raw vibes, Discord custom emojis, Snapchat Bitmojis, Spotify Wrapped milestone reveals.
- **Device Reality**: 88%+ mobile traffic, predominantly portrait orientation, single-thumb navigation while walking or multitasking.

### 2.2 What Gen Z Despises in Web Apps
- ❌ **The "AI SaaS" Look**: Sterile dark mode with generic purple-blue glowing blobs, 100px blur glass cards, Inter font, and empty corporate hero copy ("Empowering friendship through intelligence").
- ❌ **Survey Monkey / Google Forms Vibe**: Tiny radio buttons, dry grey outlines, rigid form validation alerts, cold tables.
- ❌ **Fake "Fellow Kids" Slang**: Overusing outdated cringe slang awkwardly ("No cap fr fr on god skibidi").
- ❌ **Friction Gates**: Forcing login, email verification, or password creation before seeing a quiz result.

---

## 3. Anti-Pattern Manifesto & Creative Visual Direction

### 3.1 The "Neo-Pop Stickerbook & Social Arcade" Aesthetic
To make LemonQuiz instantly recognizable from a single screenshot without even seeing the logo, we introduce the **Neo-Pop Stickerbook** design language:

```
┌─────────────────────────────────────────────────────────────────┐
│                    NEO-POP STICKERBOOK PILLARS                  │
├───────────────────────────────┬─────────────────────────────────┤
│ 1. Tactile Push Buttons       │ 3D offset hard shadows with     │
│                               │ physical click compression.     │
├───────────────────────────────┼─────────────────────────────────┤
│ 2. Sticker Badges & Pins      │ Rotated (-2° to +3°) playful    │
│                               │ tags with solid borders.        │
├───────────────────────────────┼─────────────────────────────────┤
│ 3. Expressive Emoji Combos    │ Curated contextual emojis       │
│                               │ paired with crisp Lucide icons. │
├───────────────────────────────┼─────────────────────────────────┤
│ 4. Electric Sun & Berry Tones │ Punchy lemon yellow, sunset     │
│                               │ coral, neon lavender & ink.     │
├───────────────────────────────┼─────────────────────────────────┤
│ 5. 3-Beat Dramatic Reveal     │ Suspense drumroll, score roll,  │
│                               │ trophy drop & confetti burst.   │
└───────────────────────────────┴─────────────────────────────────┘
```

---

## 4. Design System Tokens & Color Architecture

### 4.1 Color System (Tailored & Expressive)
The color palette balances intense youth vibrance with high contrast and dark mode comfort.

#### Primary Brand Swatches
- 🍋 **Electric Lemon (Hero Brand)**: `#FFE600` (Light) / `#FACC15` (Dark) — High energy, sunny, instantly recognizable.
- 🍇 **Neon Violet (Deep Accent)**: `#8B5CF6` / `#7C3AED` — Squad mystery, depth, premium arcade feel.
- 🍓 **Sunset Coral / Hot Pink (Reaction & Heart)**: `#FF4D6D` / `#F43F5E` — Excitement, love, roast moments.
- 🫐 **Electric Indigo (Focus & Action)**: `#6366F1` / `#4F46E5` — Smooth contrast for secondary actions.
- 🍏 **Mint Slime (Correct / Victory)**: `#10B981` / `#059669` — Instant satisfaction for correct answers.
- 🌶️ **Savage Red (Wrong / Roast)**: `#EF4444` / `#DC2626` — Playful blunder badge.

#### Dark Mode Palette (Default Canvas)
```css
--bg-primary: #0A0718;       /* Deep space midnight ink */
--bg-secondary: #120E27;     /* Elevated arcade tier */
--card-bg: #1A1538;          /* Solid high-contrast card background */
--card-hover: #241D4D;       /* Interactive hover state */
--card-border: #312766;      /* Crisp defining border */
--card-border-active: #FFE600; /* Electric Lemon focus border */

--text-primary: #FFFFFF;     /* Pure high-contrast white */
--text-secondary: #CBD5E1;   /* Soft slate for descriptions */
--text-muted: #8E84A6;       /* Subtext and inactive indicators */
--text-lemon: #FDE047;       /* Punchy highlight text */

--shadow-tactile: 0 4px 0 #000000;
--shadow-tactile-lemon: 0 4px 0 #CA8A04;
--shadow-tactile-violet: 0 4px 0 #5B21B6;
--shadow-tactile-pink: 0 4px 0 #BE123C;
```

#### Light Mode Palette (Daylight Pop)
```css
--bg-primary: #FAF8FF;       /* Clean lavender-cream atmosphere */
--bg-secondary: #F0EBFF;     /* Soft pastel card container */
--card-bg: #FFFFFF;          /* Crisp white canvas */
--card-hover: #F8F5FF;       /* Soft tactile touch */
--card-border: #E2D9F3;      /* Clean structural divider */
--card-border-active: #7C3AED; /* Purple pop border */

--text-primary: #150E28;     /* Deep midnight ink */
--text-secondary: #4A4068;   /* Readable body slate */
--text-muted: #7E729C;       /* Gentle footnote */
```

---

## 5. Typography System

### 5.1 Typeface Direction
- **Display & Headlines**: `Plus Jakarta Sans` / `Outfit` / `Inter` (Font Weight: 800 ExtraBold & 900 Black). Punchy, curved, rounded terminals that feel energetic and athletic.
- **Body Text**: Clean Geometric Sans (Font Weight: 500 Medium & 600 SemiBold) with high legibility on 360px screens.
- **Score Counters & Numbers**: Chunky Tabular Monospace / Display Numbers (`font-black tabular-nums`).

### 5.2 Type Scale (Mobile First)

| Role | Mobile (360px–430px) | Desktop (1024px+) | Line Height | Tracking | Weight |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | 34px–38px | 56px–64px | 1.1 | -0.03em | 900 Black |
| **Section Title** | 24px–28px | 36px–40px | 1.2 | -0.02em | 800 ExtraBold |
| **Question Display** | 20px–24px | 28px–32px | 1.25 | -0.015em | 800 ExtraBold |
| **Option Button Text** | 16px–17px | 18px–20px | 1.3 | 0em | 700 Bold |
| **Trophy Score Number** | 48px–56px | 72px–80px | 1.0 | -0.04em | 900 Black |
| **Body / Subtitle** | 14px–15px | 16px–18px | 1.5 | 0em | 500 Medium |
| **Badge / Microcopy** | 11px–12px | 13px–14px | 1.0 | +0.05em | 800 Bold |

---

## 6. Shapes, Elevation & Tactile Physics

### 6.1 Geometry & Radii
- **Main Container Cards**: `rounded-3xl` (24px to 28px) — friendly squircle feel.
- **Answer Selection Buttons**: `rounded-2xl` (16px) with distinct 56px+ height.
- **Badges, Tags, & Status Pills**: `rounded-full` (9999px) with solid colored background.
- **Sticker Pins**: Angled `-2deg` to `+3deg` with `rotate-[-2deg]` and subtle scale bounce on hover.

### 6.2 Tactile Button Physics (Zero Squishy Blur)
Instead of floaty, ethereal glow buttons, LemonQuiz buttons use **tactile physical offset**:
```css
/* Tactile Push Button Utility */
.btn-tactile-lemon {
  background-color: #FACC15;
  color: #1A1538;
  box-shadow: 0 5px 0 #CA8A04;
  transform: translateY(0);
  transition: all 0.1s cubic-bezier(0.4, 0, 0.2, 1);
}
.btn-tactile-lemon:hover {
  filter: brightness(1.05);
}
.btn-tactile-lemon:active {
  transform: translateY(4px);
  box-shadow: 0 1px 0 #CA8A04;
}
```

---

## 7. Iconography & Expressive Visual Accents

### 7.1 Hybrid Icon Strategy (Lucide Icons + Vector Emojis)
- **Lucide Icons**: Used for standard navigation, UI actions, copy, share, back, settings, lock, checkmarks (`strokeWidth={2.5}`).
- **Curated Emojis**: Used as emotional anchors and question theme badges (🍋, 👑, 🔥, 💀, 🔮, 🍕, 🍿, 🏆, ⚡, 🤫).

### 7.2 Friendship Verdict Badges
| Tier | Score Range | Badge Name | Visual Anchor | Microcopy |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1** | 90% – 100% | **Certified Soulmate** 🔮 | Radiant Gold & Lavender | *"You two share a single braincell. Telepathic connection!"* |
| **Tier 2** | 70% – 89% | **Ride or Die BFF** 👑 | Emerald & Violet Crown | *"Real one! You know the deepest lore and comfort foods."* |
| **Tier 3** | 45% – 69% | **Good Homie** 🤝 | Electric Coral & Indigo | *"Not bad! You know the vibes, but missed some deep secrets."* |
| **Tier 4** | 20% – 44% | **Casual Acquaintance** ☕ | Soft Slate & Amber | *"Oof! Do you two only talk during group projects?"* |
| **Tier 5** | 0% – 19% | **Stranger in Disguise** 💀 | Savage Crimson & Smoke | *"Did you just meet 5 minutes ago? Caught in 4K!"* |

---

## 8. Mobile Ergonomics & Thumb-Zone Mapping

### 8.1 360px–430px Optimization
- **The Golden Thumb Zone**: All critical interactive targets (Option A–D cards, Next button, Share CTA) sit in the lower 60% of the viewport.
- **Top Safe Area**: Sticky header holds quiz progress bar, question counter pill (`3 / 8`), and exit/report buttons.
- **Minimum Tap Targets**: Every clickable answer option is at least **58px tall** with **12px vertical spacing** to prevent mis-clicks.

```
┌───────────────────────────────────────┐ ◄── 390px Viewport Top
│  [Logo / Back]       [ 4 / 8 ] [ 🚩 ] │ ── Sticky Safe Zone
├───────────────────────────────────────┤
│                                       │
│    [Question Sticker Tag: HABITS]     │ ── Context Header
│    "What's my biggest guilty          │
│     pleasure song on repeat?"         │ ── Big Bold Question
│                                       │
├───────────────────────────────────────┤ ◄── Thumb Reach Boundary
│  ┌─────────────────────────────────┐  │
│  │ A  Late Night K-Pop Anthems     │  │ ── 60px Tap Target
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ B  2010s Disney Channel Hits    │  │ ── 60px Tap Target
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ C  Obscure Indie Rock           │  │ ── 60px Tap Target
│  └─────────────────────────────────┘  │
│  ┌─────────────────────────────────┐  │
│  │ D  Sad Boy Rap at 3 AM          │  │ ── 60px Tap Target
│  └─────────────────────────────────┘  │
└───────────────────────────────────────┘ ◄── Viewport Bottom
```

---

## 9. Accessibility & Inclusivity

- **Contrast Ratios**: All text against background tokens exceeds **4.8:1** (WCAG AA compliant).
- **Reduced Motion**: Respects `prefers-reduced-motion: reduce`. Instant state changes replace bouncy springs and confetti falls.
- **Keyboard Navigation**: Full `Tab` + `Enter`/`Space` accessibility on all option cards and buttons with high-visibility electric lemon focus rings (`focus-visible:ring-4 focus-visible:ring-yellow-400`).
- **Screen Reader Announcements**: `aria-live="polite"` handles question changes and score counter announcements.

---

## 10. Summary & Sign-off
This design specification forms the single source of truth for the LemonQuiz visual overhaul. Every screen must reflect high tactile fun, ultra-snappy mobile mechanics, and a viral loop that compels every friend to take the quiz and create their own.
