# Cozy Lemon Theme Frontend Refactoring Plan & Tasklist

## Phase 1: Foundation & Tokens
- [ ] Define tokens in `app/globals.css` (Colors, Radius, Shadows, Spacing).
- [ ] Implement `components/ui/Button.tsx` (Variants: primary, secondary, ghost. Sizes: sm, md, lg. States: hover, focus, disabled, loading).
- [ ] Implement `components/ui/Card.tsx` (Standardize background, border, radius, shadow, padding).
- [ ] Implement `components/ui/Typography.tsx` (Centralize headings, body styles, labels).
- [ ] Implement `components/ui/SelectionBox.tsx` (For quiz answers, presets. Clear tactile feedback, warm border, inset shadow).
- [ ] Create `components/layout/PageContainer.tsx` (Max width, responsive padding, ambient background like `texture-warm-paper.webp` or `texture-subtle-grain.png`).

## Phase 2: Refactor Quiz Creation Flow (app/create, components/quiz/QuizCreator.tsx)
- [ ] Refactor Step 1: Setup Screen (Use redesigned preset cards, fix `Cozy Lemon Reading Nook.png` image size).
- [ ] Refactor Step 2: Questions Screen (Update Question Editor, option inputs, footer buttons sizing and alignment).
- [ ] Refactor Step 3: Review Screen (Footer button alignment, primary vs secondary action visual dominance).
- [ ] Handle Loading, Error, and Validation states cleanly.

## Phase 3: Refactor Quiz Player (app/q/[quizCode]/page.tsx)
- [ ] Standardize Question Layout.
- [ ] Standardize Answer SelectionBox with proper selection feedback.
- [ ] Ensure minimum 56px touch target for answer options.
- [ ] Make progress bar and navigation mobile-friendly (fits on 320px).
- [ ] Fix `submitting-pulse.svg` loading state.

## Phase 4: Refactor Dashboard & Results (app/manage, components/dashboard)
- [ ] Dashboard layout update (Stacked cards on mobile, grid on desktop).
- [ ] Redesign `Quiz is Live` component and large buttons (fix overflow).
- [ ] Fix Leaderboard Badges (`badge-podium-crown-gold.svg`, `badge-podium-medal-silver.svg`, `badge-podium-award-bronze.svg`).
- [ ] Update `ShareCard.tsx` (Remove unused space on left side).
- [ ] Update empty states (`empty-quizzes-cozy.svg`).

## Phase 5: Fix specific bugs from bug_sheet.md
- [ ] UI-001: Increase Hero image size on `app/page.tsx`.
- [ ] UI-002: Add smooth FAQ animation on `app/page.tsx`.
- [ ] UI-003: Fix Lemon Mascot Image Source (`deco-lemon-mascot-cozy.svg` to existing public asset like `Cheerful Dancing Lemon Mascot.png`).
- [ ] UI-004: Increase Setup Screen Image Size (`Cozy Lemon Reading Nook.png`).
- [ ] UI-005: Redesign Starting Preset Cards.
- [ ] UI-006: Questions Screen Footer Buttons (Adjust previous/add/next sizes, ensure mobile visibility).
- [ ] UI-007: Review Screen Footer Alignment.
- [ ] UI-008: Owner Dashboard "Quiz is Live" Component (Redesign, fix overflow).
- [ ] UI-009: Owner Dashboard Large Buttons Overflow (Fix width, max-width, text wrapping).
- [ ] UI-010: Remove Unused Space in Share Link Components.
