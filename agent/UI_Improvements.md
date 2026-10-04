# Lemon Quiz Meniac — Updated Change List (Final)

## 1. Brand Identity Transformation

### Remove:

- Lemon/yellow theme
- Beach/ocean visual style
- Generic quiz website feeling

### Introduce:

- Friendship/social app identity
- Emotional connection
- Memories with close ones
- Youth-focused aesthetic (12–20)

New visual direction:

```
Dark Violet + Purple + Midnight Blue + Black + White
```

---

# 2. Complete Design System Migration

## Replace:

- Hardcoded colors
- Random component colors
- Inconsistent styling

## Add:

- Centralized color tokens
- Reusable theme variables
- Consistent UI styling

New token categories:

```
Primary
Secondary
Accent
Background
Surface
Text
Border
Shadow
Glow
```

---

# 3. New Dark Mode Theme (Primary)

## Background

```
Main:
#080816

Secondary:
#0F0B24

Cards:
#17132F

Hover:
#211A45
```

## Text

```
Primary:
#F8FAFC

Secondary:
#CBD5E1

Muted:
#94A3B8
```

## Brand

```
Violet:
#8B5CF6

Purple:
#A855F7

Lavender:
#C084FC

Indigo:
#6366F1

Love Accent:
#F472B6
```

---

# 4. Improved Light Mode Theme

## New light mode direction:

Not plain white.

Goal:

- soft lavender atmosphere
- premium purple feeling
- clean social app style

## Background

```
Main:
#F8F7FF

Secondary:
#F1EDFF
```

## Cards

```
Surface:
#FFFFFF

Elevated:
#FCFAFF

Hover:
#EEE8FF
```

## Text

```
Primary:
#171126

Secondary:
#51466A

Muted:
#817693
```

## Borders

Added:

```
#E4DAFF
```

for:

- cards
- inputs
- dividers

---

# 5. Gradient System

New controlled gradients:

## Primary CTA

```
linear-gradient(
135deg,
#8B5CF6,
#6366F1
)
```

Used for:

- main buttons
- important actions

---

## Friendship/Love

```
linear-gradient(
135deg,
#F472B6,
#A855F7
)
```

Used for:

- emotional highlights
- friendship scores

---

## Premium

```
linear-gradient(
135deg,
#C084FC,
#4F46E5
)
```

Used for:

- premium-looking cards
- special sections

---

# 6. Background Image Integration

Using:

```
public/background.png
```

Changes:

- Add branded website background
- Add proper overlays
- Maintain readability
- Support dark mode
- Support light mode
- Avoid image distortion

Requirements:

- Responsive scaling
- Performance optimization
- No layout shifting

---

# 7. Browser Icon Integration

Using:

```
public/browser-icon.png
```

Changes:

- Replace default favicon
- Update Next.js metadata
- Improve browser tab branding

---

# 8. Quiz Creation Flow Redesign

## Current:

```
Create Quiz

Question 1
Question 2
Question 3
Question 4
...
Question 10

Submit
```

Problems:

- Long scrolling
- Poor mobile experience
- Feels like a boring form

---

## New:

```
Create Quiz

Question 1/10

↓

Question 2/10

↓

Question 3/10

↓

Review

↓

Publish
```

---

New features:

### Step indicator

Example:

```
Question 4 / 10
```

---

### Navigation

Add:

- Previous button
- Next button
- Current progress state

---

### Better interaction

Goal:

```
Answer → Continue → Answer → Continue
```

instead of:

```
Scroll → Find field → Type → Scroll
```

---

# 9. Mobile-First Responsive Redesign

Critical priority.

The website will be optimized for:

```
320px
375px
390px
430px
Tablet
Desktop
```

---

## Mobile improvements:

### Buttons

Minimum:

```
44px height
```

Preferred:

```
48-56px
```

---

### Forms

Improve:

- Input size
- Spacing
- Keyboard behavior
- Touch usability

---

### Quiz experience

Optimize:

- One-hand usage
- Large answer buttons
- No horizontal scrolling
- Easy navigation

---

### Navigation

Avoid:

- compressed desktop menus
- tiny links
- crowded layouts

---

# 10. Component Styling Updates

Update:

## Buttons

Changes:

- New gradients
- Better hover states
- Purple glow
- Rounded modern style

---

## Cards

Changes:

- Purple tinted surfaces
- Better depth
- Soft borders
- Improved shadows

---

## Inputs

Changes:

- New focus colors
- Theme support
- Better spacing

---

## Badges

Changes:

- Brand colors
- Better contrast

---

# 11. Shadow & Glow System

Replace:

- random shadows
- harsh effects

With:

- soft purple shadows
- subtle glow effects
- modern depth

Example:

```
rgba(139,92,246,0.15)
```

---

# 12. Typography Improvements

Changes:

- Better heading hierarchy
- Improved readability
- Better mobile scaling
- Better spacing

---

# 13. Result Page Visual Upgrade

Improve:

- Friendship score presentation
- Shareability
- Emotional impact

Focus:

```
Score
+
Friendship message
+
Share CTA
```

Designed for screenshots/stories.

---

# 14. Performance Improvements

Optimize for users coming from shared links.

Changes:

- Faster loading
- Optimized images
- Reduced unnecessary animations
- Avoid layout shifts
- Better mobile network performance

---

# 15. Accessibility Improvements

Add:

- Better contrast
- Larger click targets
- Visible focus states
- Readable text
- Keyboard support

---

# 16. Code Quality Improvements

Frontend code improvements:

- Remove duplicated colors
- Use theme variables
- Reuse components
- Avoid unnecessary dependencies
- Keep UI maintainable

---

# Explicitly NOT Changing

No changes to:

```
❌ Backend logic

❌ Database schema

❌ API contracts

❌ Authentication

❌ Quiz scoring algorithm

❌ Core MVP architecture
```

---

# Final Goal

Transform:

```
Basic quiz website
        ↓
Mobile-first friendship/social experience
```

The product should feel like:

```
Instagram Stories
+
Discord community feeling
+
Friendship memories
```

while keeping the MVP architecture unchanged.
