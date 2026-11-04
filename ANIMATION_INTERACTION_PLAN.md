# BestFriend Quiz — Animation & Micro-Interaction Specification
**Document**: `ANIMATION_INTERACTION_PLAN.md`  
**Application**: LemonQuiz  
**Philosophy**: "Smooth, Tactile, Playful & Lightweight" (Zero unnecessary slow cinematic delays)

---

## 1. Animation Design Principles

Animations in LemonQuiz exist for three reasons only:
1. **Provide Physical Feedback**: Make buttons feel real, clicky, and satisfying on mobile glass screens.
2. **Build Narrative Tension**: Create genuine suspense before revealing how well a friend scored.
3. **Reward Success**: Celebrate high scores and quiz launches with high-energy dopamine bursts.

### 1.1 What We Explicitly Avoid
- ❌ **Slow Cinematic Fades**: No 1.5-second sluggish page transitions that make users wait.
- ❌ **Constant Distracting Motion**: No looping background particles that drain mobile batteries.
- ❌ **Excessive Parallax**: No heavy scroll lag on budget mobile chipsets.

---

## 2. Animation Tokens & Easing Curves

```css
/* Snappy Spring & Easing Tokens */
--ease-snap: cubic-bezier(0.34, 1.56, 0.64, 1);    /* Bouncy pop curve for buttons & modals */
--ease-out-quad: cubic-bezier(0.25, 0.46, 0.45, 0.94); /* Smooth deceleration for card slides */
--ease-in-quad: cubic-bezier(0.55, 0.085, 0.68, 0.53); /* Crisp exit curve */

/* Duration Standards */
--duration-instant: 100ms;  /* Tactile button press & haptic click */
--duration-fast: 220ms;     /* Option select lock-in & question transition */
--duration-standard: 350ms; /* Modal open, drawer slide-up */
--duration-reveal: 1200ms;  /* Score number counter roll-up */
```

---

## 3. Core Interaction Animations

### 3.1 Tactile Button Press Physics
When a user taps any primary button or answer option:
- `Active State (0ms)`: Translates down `4px` (`translateY(4px)`) and collapses the 4px bottom shadow to `0px`.
- `Release State (80ms)`: Springs back to original resting position with `--ease-snap`.

```css
@keyframes button-pop {
  0% { transform: scale(1); }
  50% { transform: scale(0.96); }
  100% { transform: scale(1); }
}
```

### 3.2 Question Card Stack Transition (Gameplay Flow)
When an answer is selected:
1. **Beat 1 (0ms - 150ms)**: Selected option border flashes Electric Lemon (`#FACC15`) with a subtle checkmark ripple.
2. **Beat 2 (150ms - 300ms)**: Active question card slides out to the left (`translateX(-16px)` + `opacity: 0`).
3. **Beat 3 (200ms - 400ms)**: Next question card slides in from the right (`translateX(16px)` -> `translateX(0px)` + `opacity: 1`) with `--ease-snap`.

---

## 4. The 3-Beat Score Reveal Sequence (`/result/[attemptCode]`)

The result screen is choreographed like an arcade win screen:

```
Timeline:
0ms           400ms                     1400ms          1500ms
├──────────────┼──────────────────────────┼───────────────┼──────────────►
[Suspense Orb] [Score Number Rolls 0 -> X] [Trophy Drops] [Confetti Burst]
```

### Breakdown:
1. **0ms – 400ms (Suspense Pulse)**:
   - Screen loads with backdrop blur.
   - Central trophy placeholder pulses gently (`scale(0.95)` -> `scale(1.05)`).
2. **400ms – 1400ms (Score Counter Roll-up)**:
   - Big display numbers roll rapidly from `0%` to the actual score (e.g. `85%`) with tabular numeric easing.
3. **1400ms (Trophy Stamp Down)**:
   - Friendship Verdict Badge (e.g. *"👑 Ride or Die BFF"*) drops in from `scale(1.3)` with a heavy stamp effect (`scale(1.0)` + spring).
4. **1500ms (Confetti Explosion)**:
   - Multi-burst canvas confetti fires from coordinates `(x: 0.5, y: 0.6)` spraying brand colors across the screen.

---

## 5. Sticker & Mascot Micro-Animations

- **Floating Sticker Wiggle**: Badges with `tilt="left"` or `tilt="right"` have a subtle idle wiggle on hover (`rotate(-2deg)` to `rotate(-4deg)` over 200ms).
- **Copy Button Feedback**: Tapping "Copy Link" changes the icon to a green checkmark with a mini pulse animation for 2000ms.

---

## 6. Accessible Reduced-Motion Standards (`prefers-reduced-motion`)

For users with motion sensitivity or OS reduced-motion settings:
```css
@media (prefers-reduced-motion: reduce) {
  *, ::before, ::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```
- Confetti animation is automatically skipped (`disableForReducedMotion: true`).
- Card slide transitions become instant crossfades.
- Score counter immediately displays the final number without the 1200ms roll.
