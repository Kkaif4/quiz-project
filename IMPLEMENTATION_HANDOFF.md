# BestFriend Quiz — Implementation Handoff Manual
**Document**: `IMPLEMENTATION_HANDOFF.md`  
**Application**: LemonQuiz  
**Target Next Phase**: Phase 12 (UI/UX Neo-Pop Overhaul & Viral Experience Implementation)  
**Authoritative Specifications**:
- Design System: [`UI_UX_DESIGN_PLAN.md`](file:///d:/Github/quiz-project/UI_UX_DESIGN_PLAN.md)
- User Journeys: [`USER_FLOWS.md`](file:///d:/Github/quiz-project/USER_FLOWS.md)
- Screen Specs: [`SCREEN_SPECIFICATIONS.md`](file:///d:/Github/quiz-project/SCREEN_SPECIFICATIONS.md)
- Component Taxonomy: [`COMPONENT_PLAN.md`](file:///d:/Github/quiz-project/COMPONENT_PLAN.md)
- Animation Rules: [`ANIMATION_INTERACTION_PLAN.md`](file:///d:/Github/quiz-project/ANIMATION_INTERACTION_PLAN.md)
- Design ADRs: [`DESIGN_DECISIONS.md`](file:///d:/Github/quiz-project/DESIGN_DECISIONS.md)

---

## 1. Golden Non-Negotiables (What NOT to Touch)

The future implementation agent **MUST NOT** modify or break the following existing backend and security foundations:

1. 🔒 **Zero Answer Key Leakage**: Never send `correctOptionId` in public responses from `/api/quizzes/[quizCode]` or `lib/quiz.ts`.
2. 🔒 **Server-Side Scoring**: Attempt scores must remain calculated exclusively in `app/api/quizzes/[quizCode]/attempts/route.ts`.
3. 🔒 **Cryptographic Hashing**: All owner tokens must continue to be stored only as SHA-256 hashes in MongoDB.
4. 🔒 **Rate Limiting & Honeypots**: Preserve sliding-window rate limiters and honeypot field checks on all submission routes.
5. 🔒 **Database Schemas & Models**: Keep MongoDB models (`Quiz.ts`, `Attempt.ts`, `Report.ts`) intact.

---

## 2. Implementation Roadmap & Execution Order

When beginning implementation, execute the work in the following sequential phases:

### Phase 1: Design Tokens & CSS Utilities Foundation
1. Update `app/globals.css` with the new Neo-Pop tokens (Electric Lemon `#FACC15`, Deep Space Ink `#0A0718`, Sunset Berry `#FF4D6D`, tactile button shadow classes `.btn-tactile-lemon`, `.btn-tactile-violet`, `.shadow-tactile`).
2. Verify responsive viewport settings in `app/layout.tsx`.

### Phase 2: Core UI Primitives (`components/ui/`)
1. Create/Update `components/ui/Button.tsx` (Tactile 3D press physics).
2. Create/Update `components/ui/Input.tsx` (Arcade rounded inputs with focus rings).
3. Create/Update `components/ui/Card.tsx` (Squircle container cards with solid borders).
4. Create/Update `components/ui/Badge.tsx` and `StickerPill.tsx` (Rotated tilt badges).
5. Create/Update `components/ui/ProgressBar.tsx` (Arcade gradient progress bar).

### Phase 3: Quiz Gameplay & Scoring Redesign
1. Redesign `components/quiz/QuizPlayer.tsx` and `AnswerOptionButton.tsx` according to `SCREEN_SPECIFICATIONS.md` (Screens 6 & 7).
2. Upgrade `components/quiz/QuizResult.tsx` and `ResultTrophyCard.tsx` with the 3-Beat reveal sequence and Canvas Confetti.
3. Build the `ShareStoryModal.tsx` 9:16 exportable story card preview.

### Phase 4: Creator Studio & Question Bank Wizard
1. Redesign `components/quiz/QuizCreator.tsx` and `QuestionEditor.tsx` with the 2-step setup, 100+ Question Idea Bank carousel, and 1-tap option correct answer marking.
2. Upgrade `app/create/page.tsx`.

### Phase 5: Creator Dashboard & Squad Leaderboard
1. Redesign `app/manage/[ownerToken]/page.tsx` and `components/dashboard/Ranking.tsx` into `LeaderboardPodium.tsx` and `FriendRankRow.tsx`.
2. Add the `FriendBreakdownDrawer.tsx` to inspect individual friend answers.
3. Update `components/dashboard/MyQuizzesSection.tsx`.

### Phase 6: Landing Page & Viral Polish
1. Redesign `app/page.tsx` with the interactive playable teaser question, live counters, and high-energy hero.
2. Update `app/not-found.tsx` and error boundaries with Neo-Pop lost stickers.

---

## 3. Acceptance & Verification Checklist

Before marking the redesign complete, verify the following criteria:

- [ ] **Mobile Ergonomics**: Tested and pristine at `360px`, `390px`, and `430px` viewport widths.
- [ ] **Thumb Reach**: All answer options and primary CTAs are >= 58px tall and within the lower 60% thumb reach zone.
- [ ] **Tactile Physics**: All buttons depress `4px` physically on tap without laggy blur effects.
- [ ] **Viral CTA Placement**: The *"Create Your Own Quiz"* button is the highest-contrast, primary element on the result screen.
- [ ] **Zero Answer Leakage**: Network inspect tool confirms `correctOptionId` is nowhere in public quiz JSON payloads.
- [ ] **Confetti & Suspense**: The 3-beat score reveal choreographs smoothly with confetti explosion.
- [ ] **Accessibility**: All interactive elements pass keyboard focus navigation (`focus-visible`) and WCAG AA contrast.
- [ ] **Reduced Motion**: Confetti and bouncy animations cleanly disable when `prefers-reduced-motion: reduce` is detected.
