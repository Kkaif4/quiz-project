# Frontend Refactoring Plan: Cozy Lemon Theme

## 1. Objective

Refactor the entire Frontend (FE) architecture to introduce a centralized, modular component design that fully embraces the **Cozy Lemon Theme**.

The refactor must improve:

- UI consistency
- Mobile responsiveness
- Component reusability
- Accessibility
- Interaction states
- Typography consistency
- Visual hierarchy
- Performance
- Maintainability
- Cross-page design consistency

The frontend must strictly leverage the existing asset library defined in `agent/Assepts.md` and the existing `public/` directory.

Where appropriate, raster formats (`PNG`, `JPG`, `WebP`) should be prioritized for rich illustrations and textured visual elements.

**Do not generate new assets.**

**Do not delete existing assets.**

---

# 2. Design System & Theme Alignment

## 2.1 Cozy Lemon Theme

The visual system must consistently use:

### Colors

- Warm Morning Sunlight — `--bg-primary`
- Deep Espresso — `--text-primary`
- Champagne Gold
- Soft Lavender
- Dusty Rose
- Sage
- Supporting warm neutral surfaces

All colors must come from centralized CSS variables/tokens.

Do not introduce arbitrary one-off colors inside page components.

---

## 2.2 Typography

Use a clean, readable sans-serif with a warm aesthetic.

Typography must define centralized:

- Display heading
- H1
- H2
- H3
- Body
- Small/body-secondary
- Caption
- Button text
- Label
- Helper/error text

Font weights must be intentional:

- Regular → body
- Medium → labels/buttons
- Semibold/Bold → headings and important metrics

Avoid excessive font-weight changes.

Typography must remain readable on small mobile screens.

---

## 2.3 Borders & Shadows

Use:

- `rounded-2xl`
- `rounded-3xl`
- Soft borders
- Ambient shadows
- `--shadow-card`
- `--shadow-button`

Avoid excessive shadows or decorative borders.

Cards must feel cohesive across:

- Landing page
- Quiz creator
- Quiz player
- Results
- Dashboard

---

# 3. Centralized & Modular Component Architecture

Adopt an Atomic Design-inspired architecture.

However, **do not over-componentize**.

Only extract components when they:

1. Are reused.
2. Have a clear visual responsibility.
3. Have meaningful internal state.
4. Make the parent page substantially easier to understand.

Avoid creating components that are only wrappers around one `<div>` without meaningful behavior.

---

# 3.1 Reusable Component Registry

Location:

```text
components/ui/
```

## Button.tsx

Unified button component supporting:

- `primary`
- `secondary`
- `ghost`
- Optional destructive/action variant where required

Sizes:

- Small
- Medium
- Large

States:

- Default
- Hover
- Focus
- Active
- Disabled
- Loading

Requirements:

- Minimum 56px touch target for primary interactive controls where appropriate.
- Prevent layout shift when loading.
- Loading state must preserve button dimensions.
- Buttons must not overflow their parent containers.
- Long button labels must wrap or adapt safely on small screens.

---

## Card.tsx

Standardize:

- Background
- Border
- Radius
- Shadow
- Padding
- Responsive spacing

Support appropriate variants where required rather than duplicating card styles throughout pages.

---

## Typography.tsx

Centralize:

- Heading styles
- Body styles
- Supporting text
- Labels
- Captions
- Error/helper text

Avoid manually recreating typography combinations in individual pages.

---

## SelectionBox.tsx

Used for:

- Quiz answers
- Presets
- Theme selections
- Other selectable cards

States:

- Default
- Hover
- Focus
- Active
- Selected
- Disabled

Selected state should feel tactile and satisfying using:

- Warm border
- Subtle inset shadow
- Background change
- Check indicator

Do not rely on color alone to communicate selection.

---

# 3.2 Layout Wrappers

Location:

```text
components/layout/
```

## PageContainer.tsx

Responsible for:

- Maximum content width
- Responsive horizontal padding
- Vertical spacing
- Ambient background
- Optional page-level variants

Background may use:

- `texture-warm-paper.webp`
- `texture-subtle-grain.png`

Only use assets that actually exist in the approved asset library.

---

# 4. Responsive Architecture

Responsiveness must be treated as a **first-class design requirement**, not only a testing step.

The UI must work correctly from very small mobile screens through desktop.

## 4.1 Required Viewports

Test at minimum:

```text
320px
360px
375px
390px
414px
768px
1024px
1280px+
```

Pay special attention to:

- 320px
- 360px
- 375px

because these expose most mobile layout problems.

---

# 4.2 Mobile-First Rules

All components must be designed mobile-first.

Desktop layouts must enhance the mobile layout rather than requiring a separate desktop implementation.

Avoid:

- Fixed widths that cause overflow
- Fixed-height content containers
- Absolute positioning for primary layout
- Horizontal scrolling unless intentionally designed
- Buttons wider than their parent
- Text that becomes clipped
- Cards that require desktop width

Use flexible layouts:

```text
width: 100%
max-width: ...
min-width: 0
flex-wrap
grid
```

where appropriate.

---

# 4.3 Responsive Spacing

Spacing must scale according to viewport size.

Mobile:

- Smaller page padding
- Smaller card padding
- Smaller gaps
- Compact navigation
- Full-width or near-full-width CTAs

Desktop:

- Increased whitespace
- Wider content area
- Larger visual hierarchy

Do not simply shrink desktop layouts.

---

# 4.4 Responsive Typography

Typography must remain readable without causing overflow.

Requirements:

- Large headings must scale down on mobile.
- Long quiz titles must wrap correctly.
- Buttons must handle long labels.
- Leaderboard names must not break layouts.
- Error messages must wrap.
- Quiz questions must never overflow horizontally.

Use responsive typography rather than fixed desktop font sizes.

---

# 4.5 Responsive Buttons & Actions

Primary mobile actions should generally be:

```text
width: 100%
```

or fit naturally inside a responsive action row.

Desktop may use:

```text
inline-flex
```

Action groups must:

- Wrap when necessary.
- Never overflow.
- Maintain clear hierarchy.
- Preserve adequate spacing.

For multi-action footers:

```text
Mobile:
Previous
Add Question
Next

Desktop:
Previous        Add Question        Next
```

The exact layout may vary, but the hierarchy must remain clear.

---

# 4.6 Responsive Quiz Creator

The creator must be specifically tested at mobile widths.

Check:

- Setup screen
- Preset selection
- Question editor
- Option inputs
- Add question
- Delete question
- Navigation footer
- Review screen
- Submit action

Inputs must not overflow.

Question/option cards must collapse naturally on small screens.

Action bars must remain visible and usable.

---

# 4.7 Responsive Quiz Player

Quiz player must prioritize:

1. Question
2. Answer choices
3. Progress
4. Primary action

Answer options must maintain a minimum comfortable touch target.

Do not allow decorative elements to consume excessive vertical space on mobile.

The user should be able to answer without unnecessary scrolling whenever practical.

---

# 4.8 Responsive Dashboard

Dashboard must adapt:

### Mobile

Use:

- Stacked cards
- Scroll-safe leaderboard rows
- Compact statistics
- Full-width actions
- Collapsible/stacked action groups

### Desktop

Use:

- Wider dashboard grid
- Multi-column statistics
- Larger leaderboard presentation
- Inline actions where appropriate

Do not force desktop tables onto small screens.

---

# 4.9 Responsive Header / Navigation

Header must be explicitly tested on mobile.

Requirements:

- Logo must remain visible.
- Navigation must not overflow.
- Theme toggle must remain accessible.
- Create Quiz CTA must remain usable.
- Mobile navigation must have a defined behavior if desktop navigation cannot fit.

Avoid shrinking navigation text until it becomes unreadable.

---

# 4.10 Responsive Images & Illustrations

Illustrations must:

- Scale proportionally.
- Never overflow containers.
- Avoid unnecessary cropping.
- Preserve their intended visual focal point.
- Use appropriate `object-fit` behavior.

Hero illustrations must have explicit mobile sizing.

Decorative assets may be hidden or reduced on small screens when they interfere with usability.

---

# 5. Asset Integration Strategy

Strict adherence to:

```text
agent/Assepts.md
public/
```

Rules:

- No new assets.
- No deleted assets.
- No duplicate assets.
- No unnecessary replacement of existing assets.
- Verify asset paths before implementation.

---

## 5.1 Raster Priority

Use raster assets for rich illustrations where available.

Examples:

- `texture-warm-paper.webp`
- `texture-subtle-grain.png`
- `Elegant Green Leaf Branch.png`
- `Cozy Lemon Reading Nook.png`
- `Cheerful Dancing Lemon Mascot.png`

Raster assets should be preferred when they provide texture, warmth, or illustration detail.

However, **do not replace SVGs merely because PNG/JPG exists**.

SVG remains preferable for:

- Small icons
- Logos
- Simple decorative vectors
- Scalable UI elements
- Crisp small-size graphics

---

## 5.2 Icons

Use Lucide React for structural UI icons.

Use approved branded assets for:

- Lemon branding
- Decorative elements
- Theme-specific illustrations
- Podium badges
- Brand marks

Do not use raw system emojis as UI icons.

---

# 6. Phase 1 — Foundation & Tokens

Clean up:

```text
app/globals.css
```

Create centralized design tokens for:

- Colors
- Typography
- Radius
- Shadows
- Spacing
- Transitions
- Focus states
- Responsive values

Ensure all major components use the tokens.

---

## 6.1 Interaction Tokens

Define consistent:

- Hover transitions
- Active scale
- Selected transitions
- Focus rings
- Disabled opacity
- Loading states

Interactions must feel consistent throughout the application.

---

# 6.2 Accessibility

Every interactive component must support:

- Keyboard navigation
- Visible focus state
- Semantic HTML
- Appropriate ARIA only where required
- Screen-reader-readable labels
- Disabled state
- Loading state

Do not use color as the only indicator of:

- Selection
- Error
- Success
- Disabled state

Maintain sufficient text/background contrast.

---

# 6.3 Reduced Motion

Respect:

```css
prefers-reduced-motion
```

Animations must have a reduced-motion fallback.

Avoid unnecessary animation on:

- Page loading
- Quiz transitions
- Selection states
- FAQ
- Modal/overlay interactions

---

# 7. Phase 2 — Refactor Quiz Creation Flow

Location:

```text
app/create/
components/quiz/
```

Replace ad-hoc:

- Buttons
- Preset cards
- Selection states
- Inputs
- Navigation controls

with centralized components.

Refactor:

```text
components/quiz/QuizCreator.tsx
```

to separate:

- State management
- Validation
- UI rendering
- Navigation
- Submission

Do not unnecessarily move business logic into UI components.

---

## 7.1 Creator States

Explicitly design:

- Initial
- Editing
- Validation error
- Loading
- Submission
- Submission failure
- Success

The UI must never leave the user unsure whether an action worked.

---

# 8. Phase 3 — Refactor Quiz Player

Location:

```text
app/q/[quizCode]/
```

Standardize:

- Question layout
- Answer SelectionBox
- Progress
- Navigation
- Submit state
- Error state

Selected answers should provide clear tactile feedback.

The quiz player must remain usable on 320px-wide screens.

Do not make a separate API request for every question if the current architecture can load the quiz once and manage question state client-side.

---

# 9. Phase 4 — Refactor Dashboard

Location:

```text
app/manage/
```

Standardize:

- Dashboard cards
- Statistics
- Leaderboard entries
- Action buttons
- Share cards
- Status indicators

Use centralized `Card`, `Button`, `Typography`, and related components.

---

## 9.1 Leaderboard

Leaderboard must handle:

- Long names
- Different score lengths
- Missing/empty states
- Mobile stacking
- Ranking badges

Badges must use approved assets:

- 1st
- 2nd
- 3rd

---

## 9.2 ShareCard

`ShareCard.tsx` must support:

- Mobile
- Desktop
- Long quiz titles
- Long usernames
- Different result values
- Share actions
- Copy-link state
- Success/error state

The share UI must never overflow its parent.

---

# 10. Loading, Error & Empty States

Create consistent patterns for:

## Loading

- Skeletons where appropriate
- Button loading states
- Submission states
- Avoid unnecessary full-page spinners

## Error

- Clear user-readable message
- Recovery action where possible
- No raw technical errors

## Empty

Examples:

- No quizzes
- No attempts
- No leaderboard results
- No data yet

Empty states must provide a useful next action.

---

# 11. Forms & Validation UI

Standardize:

- Input styles
- Labels
- Helper text
- Error messages
- Required indicators
- Focus states
- Disabled states

Validation errors must appear close to the affected field.

Do not rely only on a toast for important form errors.

---

# 12. Performance

The refactor must not increase unnecessary JavaScript or bundle size.

Requirements:

- Prefer Server Components where client state is not required.
- Use Client Components only where interactivity requires them.
- Avoid unnecessary third-party dependencies.
- Optimize large raster assets.
- Use appropriate image loading behavior.
- Lazy-load below-the-fold heavy illustrations where appropriate.
- Avoid layout shift from images.
- Avoid unnecessary re-renders.
- Avoid duplicate state.
- Avoid unnecessary API calls.

Do not optimize prematurely, but do not introduce obvious performance regressions.

---

# 13. Responsive Layout & Overflow Audit

Every page must be checked for:

- Horizontal overflow
- Clipped text
- Oversized buttons
- Incorrect fixed heights
- Misaligned action rows
- Cards exceeding parent width
- Images exceeding containers
- Broken sticky elements
- Incorrect z-index
- Overlapping decorative elements
- Mobile footer/action-bar problems

Use browser DevTools responsive mode.

---

# 14. Theme Consistency

All major pages must visually belong to the same design system:

```text
Landing
Create Quiz
Quiz Player
Results
Dashboard
Share Cards
Error Pages
Loading States
Empty States
```

A user should not feel that different pages were built by different designers.

---

# 15. Component API Consistency

Before creating a new reusable component, check whether an existing component can be extended.

Avoid:

```text
PrimaryButton.tsx
CreateButton.tsx
SubmitButton.tsx
DashboardButton.tsx
QuizButton.tsx
```

when they can all use:

```text
Button.tsx
```

Similarly, avoid multiple independent card and selection implementations.

---

# 16. Z-Index & Overlay Rules

Define consistent layering for:

- Header
- Sticky actions
- Modals
- Dropdowns
- Toasts
- Decorative assets
- Mobile navigation

Avoid arbitrary values such as:

```text
z-[9999]
z-[10000]
```

unless there is a documented reason.

---

# 17. Testing & Validation

## 17.1 Responsive Testing

Minimum viewport matrix:

| Device Width | Priority  |
| ------------ | --------- |
| 320px        | Critical  |
| 360px        | Critical  |
| 375px        | Critical  |
| 390px        | Critical  |
| 414px        | Critical  |
| 768px        | Important |
| 1024px       | Important |
| 1280px+      | Important |

Test both portrait and relevant desktop layouts.

---

## 17.2 Functional Testing

Verify:

- Create quiz
- Select preset
- Add/remove question
- Select answer
- Navigate questions
- Submit quiz
- View result
- View dashboard
- Pause/resume quiz
- Share quiz
- Copy link
- Theme switching
- Error recovery

---

## 17.3 Accessibility Testing

Verify:

- Keyboard navigation
- Focus visibility
- Screen-reader labels
- Touch targets
- Contrast
- Reduced motion
- Form labels
- Error messaging

---

## 17.4 Visual Regression

Compare before/after at:

- 320px
- 375px
- 414px
- 768px
- 1024px
- 1280px+

Pay particular attention to:

- Headers
- Hero
- Cards
- Buttons
- Quiz options
- Creator footer
- Dashboard actions
- Leaderboards
- Share cards

---

# 18. Dependency Rules

Do not introduce new external libraries unless there is a clear requirement.

Before adding a dependency:

1. Check whether the functionality already exists.
2. Check whether native CSS/React/Next.js can solve it.
3. Check whether an existing dependency already provides it.
4. Only then consider adding a dependency.

Lucide React remains the standard icon library.

---

# 19. Code Quality Rules

The refactor must preserve existing project architecture and security requirements.

Do not:

- Move backend logic into frontend components.
- Expose sensitive data.
- Add unnecessary global state.
- Add unnecessary context providers.
- Introduce `any`.
- Duplicate validation logic unnecessarily.
- Introduce unsafe HTML rendering.
- Break existing API contracts.

The refactor is primarily a **frontend architecture and UI improvement**, not an excuse to redesign the backend.

---

# 20. Final Acceptance Criteria

The refactor is complete only when:

- [ ] Cozy Lemon visual system is consistent.
- [ ] Design tokens are centralized.
- [ ] Button is centralized.
- [ ] Card is centralized.
- [ ] Typography is centralized.
- [ ] SelectionBox is centralized.
- [ ] PageContainer is centralized.
- [ ] Quiz Creator uses shared components.
- [ ] Quiz Player uses shared components.
- [ ] Dashboard uses shared components.
- [ ] ShareCard uses shared components.
- [ ] All approved assets are used correctly.
- [ ] No approved assets were deleted.
- [ ] No unnecessary new assets were generated.
- [ ] No unnecessary dependencies were added.
- [ ] 320px layout works.
- [ ] 360px layout works.
- [ ] 375px layout works.
- [ ] 390px layout works.
- [ ] 414px layout works.
- [ ] Tablet layout works.
- [ ] Desktop layout works.
- [ ] No horizontal overflow exists.
- [ ] Primary touch targets meet the 56px requirement where applicable.
- [ ] Keyboard navigation works.
- [ ] Focus states are visible.
- [ ] Reduced-motion behavior works.
- [ ] Loading states are consistent.
- [ ] Error states are consistent.
- [ ] Empty states are consistent.
- [ ] Form validation UI is consistent.
- [ ] Images do not cause layout shift.
- [ ] No obvious performance regression exists.
- [ ] Existing functionality continues to work.
- [ ] Production build passes.
- [ ] Lint passes.
- [ ] Final responsive regression test passes.

---

# 21. Implementation Principle

**Refactor for consistency, not complexity.**

The final frontend should feel:

**Cozy + Premium + Friendly + Fast + Responsive + Simple.**

Every component should have a clear responsibility.

Every page should use the same visual language.

Every interactive element should behave consistently.

Every screen size should remain usable.

Do not add abstraction unless it provides real value.
