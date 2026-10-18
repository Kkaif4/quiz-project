# Lemon Quiz — UI Bug & Testing Sheet

**Purpose:** Track UI/UX bugs, fixes, and UI testing results.

**Testing scope:** Main landing page, quiz creation flow, review screen, owner dashboard, and sharing components.

**Status values:** `Open` · `In Progress` · `Fixed` · `Blocked`  
**Testing values:** `Not Tested` · `Passed` · `Failed`

---

## Bug Summary

| ID     | Area                        | Priority | Status | Fixed | Tested     |
| ------ | --------------------------- | -------- | ------ | ----- | ---------- |
| UI-001 | Main App / Hero             | P2       | Fixed  | Yes   | Passed     |
| UI-002 | FAQ                         | P2       | Fixed  | Yes   | Passed     |
| UI-003 | Lemon Mascot Asset          | P2       | Fixed  | Yes   | Passed     |
| UI-004 | Setup Screen                | P1       | Fixed  | Yes   | Passed     |
| UI-005 | Starting Presets            | P1       | Fixed  | Yes   | Passed     |
| UI-006 | Questions Screen / Footer   | P0       | Fixed  | Yes   | Passed     |
| UI-007 | Review Screen / Footer      | P1       | Fixed  | Yes   | Passed     |
| UI-008 | Owner Dashboard / Quiz Live | P1       | Fixed  | Yes   | Passed     |
| UI-009 | Owner Dashboard / Buttons   | P0       | Fixed  | Yes   | Passed     |
| UI-010 | Share Link Components       | P2       | Fixed  | Yes   | Passed     |

---

# UI-001 — Increase Hero Image Size

**Location:** `app/page.tsx`

**Section:** `/* Pill Badge with Floating Accents */`

### Problem

The image under the **Pill Badge with Floating Accents** section is too small.

### Required change

Increase the displayed image size by approximately **20%**.

### Acceptance criteria

- Image is approximately 20% larger.
- Image remains inside its parent container.
- Image does not overlap surrounding content.
- Desktop layout remains aligned.
- Mobile layout does not overflow.
- Image maintains its aspect ratio.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-002 — FAQ Animation

**Location:** Main app / `Frequently Asked Questions`

### Problem

The FAQ interaction feels too stiff.

The current expand/collapse interaction needs smoother motion.

### Required change

Add a subtle, smooth animation when an FAQ item:

- opens
- closes
- changes state

### Animation requirements

Use a short and smooth transition.

The animation should feel:

- premium
- lightweight
- responsive
- natural

Do not use excessive bouncing or long animations.

### Acceptance criteria

- FAQ opens smoothly.
- FAQ closes smoothly.
- Content does not jump unexpectedly.
- No layout overflow occurs.
- Animation works on mobile.
- Animation works on desktop.
- Reduced-motion preferences are respected where applicable.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-003 — Fix Lemon Mascot Image Source

**Location:** Main app

### Current issue

The application uses:

```tsx
src = "/deco-lemon-mascot-cozy.svg";
```

The asset should use the correct image that is already stored in the project's `public` directory.

### Required change

- Inspect the `public` directory.
- Identify the correct Lemon mascot asset.
- Replace the incorrect/invalid image reference.
- Use the actual public asset path.
- Do not create a duplicate asset.

### Acceptance criteria

- Image loads correctly in production.
- No 404 request occurs.
- Correct Lemon mascot is displayed.
- Image works on mobile and desktop.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-004 — Increase Setup Screen Image Size

**Location:** Step 1 — Setup Screen

**Current image:**

```text
/Cozy Lemon Reading Nook.png
```

### Problem

The image is too small inside the setup screen.

### Required change

Increase the image size while keeping the layout balanced.

### Acceptance criteria

- Image occupies more of the available visual area.
- Image fits the parent container.
- Image maintains its aspect ratio.
- Image does not overflow.
- Text and controls remain readable.
- Desktop layout remains balanced.
- Mobile layout remains usable.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-005 — Redesign Starting Preset Cards

**Location:** Step 1 — Setup Screen

**Section:** `Pick a Starting Preset`

### Problem

Preset cards contain too much empty space on mobile.

The cards do not use the available screen space efficiently.

### Required change

Redesign the preset cards for mobile.

Optimize:

- card height
- internal padding
- icon placement
- title placement
- description placement
- spacing
- grid/stack behavior

### Design goal

Cards must feel:

- compact
- premium
- easy to scan
- visually balanced
- touch-friendly

Do not make cards so small that they become difficult to tap.

### Acceptance criteria

- Empty space is significantly reduced.
- Card content is vertically balanced.
- Cards remain easy to tap.
- Cards work correctly at 320px–414px widths.
- Desktop cards remain visually consistent.
- Selected preset state remains clearly visible.
- No horizontal overflow occurs.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-006 — Questions Screen Footer Buttons

**Location:** Step 2 — Questions Screen

### Problems

The footer buttons are not aligned correctly.

There are multiple issues:

1. **Go to Previous Screen** button is too large.
2. **Add Question** button currently has the correct size.
3. **Next Question** button is too small.
4. Footer actions are missing from the mobile view.
5. Submit/continue action is missing from the mobile view where applicable.

### Required change

Redesign the footer action layout.

### Button hierarchy

The layout should visually prioritize:

**Primary:**

- Next Question
- Submit / final action

**Secondary:**

- Add Question

**Tertiary:**

- Go to Previous Screen

### Required sizing

- Reduce the size of the Previous button.
- Keep Add Question approximately at its current correct size.
- Increase Next Question to a balanced premium size.
- Keep button heights consistent.
- Align buttons vertically and horizontally.
- Prevent buttons from exceeding the parent container.

### Mobile requirement

The footer actions **must be visible on mobile**.

They must not:

- disappear
- overflow
- become clipped
- move outside the viewport
- overlap other components

### Acceptance criteria

- All footer actions are visible.
- Buttons align correctly.
- Previous button is visually secondary.
- Next Question has strong primary hierarchy.
- Add Question remains balanced.
- Submit action is visible when required.
- No horizontal overflow.
- Footer works at 320px, 360px, 375px, 390px, and 414px widths.
- Desktop layout remains balanced.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-007 — Review Screen Footer Alignment

**Location:** Step 3 — Review Screen

### Problem

Footer buttons are not aligned correctly.

### Required change

Apply the same footer layout principles used for the Questions Screen.

### Acceptance criteria

- All footer buttons align correctly.
- Buttons remain inside the parent container.
- Primary action is visually dominant.
- Secondary actions remain visually smaller.
- Mobile footer is visible.
- Desktop footer is balanced.
- No horizontal overflow occurs.
- Button spacing is consistent with Step 2.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-008 — Owner Dashboard "Quiz is Live" Component

**Location:** Owner Dashboard

### Problem

The **Quiz is Live** component is not aligned correctly.

The Resume/Pause buttons are also too large and overflow their parent container.

### Required change

Redesign the component.

Improve:

- text alignment
- status indicator
- button sizing
- button spacing
- component padding
- responsive layout

### Required behavior

The component must clearly communicate:

- current quiz status
- available action
- current state

### Acceptance criteria

- `Quiz is Live` text is correctly aligned.
- Status indicator is aligned with the text.
- Resume/Pause button fits inside the parent.
- Button does not overflow.
- Component works on mobile.
- Component works on desktop.
- Long text does not break the layout.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-009 — Owner Dashboard Large Buttons Overflow

**Location:** Owner Dashboard

### Problem

Multiple large buttons exceed their parent containers.

### Required change

Audit **all large buttons** on the Owner Dashboard.

Do not fix only the currently visible button.

Check:

- width
- max-width
- padding
- flex behavior
- grid behavior
- parent width
- text wrapping
- icon spacing
- mobile breakpoints

### Acceptance criteria

- No button exceeds its parent.
- No horizontal overflow occurs.
- Buttons shrink correctly when required.
- Button text remains readable.
- Icons remain aligned.
- Buttons maintain consistent sizing.
- Mobile layout is fully usable.
- Desktop layout remains balanced.

### Important

Fix the underlying shared button/layout rule if the same issue affects multiple components.

Do not create repeated page-specific hacks.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI-010 — Remove Unused Space in Share Link Components

**Location:** Owner Dashboard

### Components

1. **Public Quiz Link — Send to Friends**
2. **Private Owner Dashboard Link**

### Problem

Both components contain unused space/div structure on the left side.

This creates unnecessary visual imbalance.

### Required change

Inspect the component structure.

Determine whether the left-side element is:

- an unnecessary wrapper
- an empty div
- an unused icon container
- an incorrect grid/flex column
- unnecessary padding
- an obsolete layout element

Remove or correct the unused space.

### Acceptance criteria

- Content uses the available width correctly.
- No unexplained empty column remains.
- Link/input and action buttons align correctly.
- Component looks balanced.
- Mobile layout remains usable.
- Desktop layout remains balanced.
- No regression occurs in copy/share functionality.

### Status

- **Status:** Closed
- **Fixed:** Yes
- **Tested:** Passed

---

# UI TESTING CHECKLIST

## Main App

| Test                     | Result     |
| ------------------------ | ---------- |
| Hero image size          | Passed     |
| Hero image alignment     | Passed     |
| FAQ open animation       | Passed     |
| FAQ close animation      | Passed     |
| Lemon mascot asset loads | Passed     |
| No mascot 404            | Passed     |
| Mobile landing page      | Passed     |
| Desktop landing page     | Passed     |

---

## Step 1 — Setup

| Test                   | Result     |
| ---------------------- | ---------- |
| Setup image size       | Passed     |
| Setup image alignment  | Passed     |
| Preset cards — mobile  | Passed     |
| Preset cards — desktop | Passed     |
| Preset selected state  | Passed     |
| No horizontal overflow | Passed     |
| CTA alignment          | Passed     |

---

## Step 2 — Questions

| Test                      | Result     |
| ------------------------- | ---------- |
| Previous button size      | Passed     |
| Add Question button       | Passed     |
| Next Question button size | Passed     |
| Footer alignment          | Passed     |
| Mobile footer visible     | Passed     |
| Submit action visible     | Passed     |
| Button overflow check     | Passed     |
| Question selection state  | Passed     |

---

## Step 3 — Review

| Test                  | Result     |
| --------------------- | ---------- |
| Footer alignment      | Passed     |
| Primary action size   | Passed     |
| Secondary action size | Passed     |
| Mobile footer         | Passed     |
| Desktop footer        | Passed     |
| Button overflow       | Passed     |

---

## Owner Dashboard

| Test                          | Result     |
| ----------------------------- | ---------- |
| Quiz is Live alignment        | Passed     |
| Resume button                 | Passed     |
| Pause button                  | Passed     |
| Large buttons                 | Passed     |
| Button overflow               | Passed     |
| Public link component         | Passed     |
| Private link component        | Passed     |
| Empty left-side space removed | Passed     |
| Mobile dashboard              | Passed     |
| Desktop dashboard             | Passed     |

---

# RESPONSIVE TEST MATRIX

Every fixed issue must be tested at:

| Viewport | Result     |
| -------- | ---------- |
| 320px    | Passed     |
| 360px    | Passed     |
| 375px    | Passed     |
| 390px    | Passed     |
| 414px    | Passed     |
| Tablet   | Passed     |
| Desktop  | Passed     |

---

# FIX LOG

Use this section to maintain the actual progress.

| ID     | Fix Applied | Files Changed | Fixed By | Date | Tested | Result |
| ------ | ----------- | ------------- | -------- | ---- | ------ | ------ |
| UI-001 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-002 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-003 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-004 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-005 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-006 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-007 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-008 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-009 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |
| UI-010 | Implemented | Various UI Files| Antigravity| 2026-10-05| Yes    | Passed |

---

# REGRESSION RULE

A bug can be marked **Fixed** only when:

1. The code change is complete.
2. The affected screen has been checked.
3. Mobile behavior has been checked.
4. Desktop behavior has been checked.
5. No related layout regression is visible.

A bug can be marked **Tested / Passed** only after actual UI testing.

Do not mark a bug as fixed or tested based only on code inspection.

---

# FINAL QA REQUIREMENT

After all fixes:

- Test the complete Create Quiz flow.
- Test all three steps.
- Test quiz submission.
- Test Owner Dashboard.
- Test public quiz link.
- Test private owner link.
- Test mobile layouts.
- Test desktop layouts.
- Check browser console for new errors.
- Check network requests for 404 asset errors.
- Check for horizontal overflow.
- Check all primary buttons.
- Check all selected states.
- Check all responsive footer actions.

Only then mark the relevant bugs as **Fixed** and **Tested — Passed**.
