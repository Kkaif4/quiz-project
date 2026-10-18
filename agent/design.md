# UI/UX Design System: Lemon Quiz (Premium Cozy Edition)

> **Target Demographic**: Gen-Z & Millennial close circles, best friends, couples, and community squads (Ages 13–30).  
> **Aesthetic Archetype**: *Premium Cozy Boutique* — Warm stationery paper, morning sunlight, intimate candlelight, tactile scrapbook cards, soft lighting, and high-contrast espresso typography. Inspired by Notion, Pinterest, Locket, and artisanal print magazines.  
> **Key Directives**:
> 1. **Zero OS Emoji Clutter**: Standard OS emojis render inconsistently across operating systems and degrade aesthetic polish. All UI elements use **Lucide React vector icons in duotone pill containers** or curated custom illustrated mascots.
> 2. **Mobile-First Ergonomics**: Over 95% of traffic originates from WhatsApp, Instagram, and TikTok share links. Minimum 56px touch targets for all interactive actions.
> 3. **Cozy Dual-Theme Lighting**: Warm ivory morning stationery in Light Mode; intimate candlelight and fireplace warmth in Dark Mode.

---

## 1. Core Visual Direction & Atmosphere

The visual system is designed around warm natural textures, layered card surfaces, gentle ambient glow, and high typographic contrast:

- **Stationery Paper Textures**: Soft cream and ivory surfaces with subtle warm borders (`rgba(109, 82, 111, 0.12)`).
- **Deep Espresso Typography**: Replaces pure harsh black (`#000000`) with rich dark espresso (`#241C24`) for an artisanal, editorial aesthetic with >14:1 contrast ratio.
- **Ambient Radial Backdrops**: Zero-asset pure CSS ambient glow mesh simulating warm morning window light or gentle late-night candlelight.
- **Micro-Interactions**: Tactile spring click feedback (`active:scale-[0.98]`), smooth progress bars, and soft particle celebrations.

---

## 2. Color Palette & Token System

### 2.1 Light Theme (Warm Morning Stationery)

| Token | Hex | Role & Usage |
| :--- | :--- | :--- |
| **Warm Ivory** | `#FFF9F2` | Root page canvas, large layout containers |
| **Cream** | `#F8EFE3` | Secondary cards, pill containers, subtle panels |
| **Deep Espresso** | `#241C24` | Primary typography, high-contrast headings |
| **Warm Muted Plum** | `#665566` | Secondary body text, subtitles, meta labels |
| **Soft Annotation** | `#8C7C8C` | Captions, question numbers, helper text |
| **Soft Plum** | `#6D526F` | Primary brand accent, action buttons, links |
| **Deep Plum** | `#4B344D` | Strong CTA hover states, dark contrast pills |
| **Soft Champagne** | `#F3D7A4` | Warm highlights, badges, ambient lighting |
| **Champagne Gold** | `#D1A76A` | Viral conversion CTAs (*"Create Your Own Quiz"*), 1st place medals |
| **Dusty Rose** | `#D99A9A` | Friendship moments, love badges, hearts, sharing |
| **Soft Lavender** | `#B8A5C9` | Category pills, quiz tags, subtle decorative states |
| **Sage** | `#A8B89A` | Correct answers, success toasts, verified states |

### 2.2 Dark Theme (Warm Late-Night Candlelight)

| Token | Hex | Role & Usage |
| :--- | :--- | :--- |
| **Midnight Plum** | `#17131A` | Root dark background, late-night atmosphere |
| **Deep Velvet Surface** | `#211A25` | Section panels, inputs, secondary layers |
| **Warm Espresso Card** | `#2A202D` | Primary cards, modals, question options |
| **Elevated Card** | `#342638` | Hover states, active option pills, dropdowns |
| **Warm Cream Text** | `#FFF8F0` | Primary text, titles, high-contrast values |
| **Lavender-Gray Text** | `#D8CDD5` | Secondary text, descriptions |
| **Muted Plum Text** | `#A99CA8` | Captions, subtle timestamps |
| **Luminous Plum Accent** | `#A985A9` | Active states, buttons, focus rings |
| **Rose Accent** | `#D89A9F` | Hearts, social sharing accents |
| **Champagne Accent** | `#E6C88A` | Badges, gold medal highlights, achievement glow |

---

## 3. Typography & Editorial Hierarchy

The type system pairs a modern geometric sans-serif for UI readability with a classic editorial serif for emotional headings and celebration screens:

- **Primary Sans**: `Plus Jakarta Sans` (`--font-plus-jakarta`)
- **Editorial Serif**: `DM Serif Display` (`--font-dm-serif` / `font-editorial italic`)
- **Body Fallback**: `Inter` (`--font-inter`)

```text
Display 1 (Hero Title)   : font-editorial text-4xl sm:text-5xl lg:text-6xl text-[var(--text-primary)]
Display 2 (Score Tiers)  : font-editorial italic text-3xl sm:text-4xl text-[var(--text-primary)]
H1 (Page / Wizard)       : font-sans text-2xl sm:text-3xl font-extrabold tracking-tight text-[var(--text-primary)]
H2 (Section Header)      : font-sans text-lg sm:text-xl font-bold text-[var(--text-primary)]
H3 (Card Header)         : font-sans text-base sm:text-lg font-bold text-[var(--text-primary)]
Body Regular             : font-sans text-sm sm:text-base font-normal text-[var(--text-secondary)] leading-relaxed
Micro-Pill / Badge       : font-sans text-xs font-bold uppercase tracking-wider text-[var(--accent-plum)]
Option Text (56px)       : font-sans text-base font-semibold text-[var(--text-primary)]
```

---

## 4. Complete Asset Catalog & UI/UX Integration (26 Assets)

All 26 assets across the 6 core specification categories are integrated directly into the design system:

### 4.1 Brand & Identity Assets
| Asset File | Format & Specs | UI Placement & Usage | Component Reference |
| :--- | :--- | :--- | :--- |
| `brand-lemon-icon.svg` | SVG (48 × 48 px) | Top navigation bar, header brand pill, and footer icon | [`components/ui/BrandLogo.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/ui/BrandLogo.tsx) |
| `brand-logo-lockup.svg` | SVG (180 × 44 px) | Full header logo (icon + "Lemon Quiz" wordmark) | [`components/ui/BrandLogo.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/ui/BrandLogo.tsx) |
| `favicon.svg` | SVG (32 × 32 px) | Scalable vector browser tab icon | [`app/layout.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/layout.tsx), [`app/manifest.ts`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/manifest.ts) |
| `apple-touch-icon.png` | PNG (180 × 180 px) | iOS home screen bookmark icon | [`app/layout.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/layout.tsx) |
| `icon-pwa-192.png` | PNG (192 × 192 px) | Progressive Web App manifest icon | [`app/manifest.ts`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/manifest.ts) |
| `icon-pwa-512.png` | PNG (512 × 512 px) | Progressive Web App splash/install icon | [`app/manifest.ts`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/manifest.ts) |

### 4.2 Ambient Lighting & Textures
| Asset File | Format & Specs | UI Placement & Usage | Component Reference |
| :--- | :--- | :--- | :--- |
| `texture-warm-paper.webp` | WebP (512 × 512 px) | Seamless tileable subtle paper/stationery grain for canvas | [`app/globals.css`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/globals.css) |
| `glow-ambient-light.svg` | SVG (1440 × 900 px) | Light mode fixed background warm ivory/champagne radial wash | [`app/globals.css`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/globals.css) |
| `glow-ambient-dark.svg` | SVG (1440 × 900 px) | Dark mode fixed background candlelight radial glow | [`app/globals.css`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/globals.css) |

### 4.3 Decorative Accents & Boutique Micro-Illustrations
| Asset File | Format & Specs | UI Placement & Usage | Component Reference |
| :--- | :--- | :--- | :--- |
| `deco-botanical-leaf-left.svg` | SVG (120 × 160 px) | Landing page hero left border decorative foliage | [`app/page.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/page.tsx) |
| `deco-botanical-leaf-right.svg` | SVG (140 × 180 px) | Landing page hero right border decorative foliage | [`app/page.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/page.tsx) |
| `deco-lemon-mascot-cozy.svg` | SVG (96 × 96 px) | Line-art mascot with warm smile in hero and CTA sections | [`app/page.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/page.tsx) |
| `deco-starburst-champagne.svg` | SVG (32 × 32 px) | Floating sparkle accent near headings and badges | [`app/page.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/page.tsx) |
| `deco-heart-rose.svg` | SVG (28 × 28 px) | Floating emotional friendship heart accent | [`app/page.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/page.tsx) |
| `submitting-pulse.svg` | SVG (80 × 80 px) | Quiz player submitting loader (pulsing warm starburst) | [`components/quiz/QuizPlayer.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/quiz/QuizPlayer.tsx) |

### 4.4 Quiz Creator Theme Pack Icons
| Asset File | Format & Specs | UI Placement & Usage | Component Reference |
| :--- | :--- | :--- | :--- |
| `theme-best-friends.svg` | SVG (48 × 48 px) | Theme pack card: "Best Friends" (Dusty Rose pill) | [`components/quiz/QuizCreator.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/quiz/QuizCreator.tsx), [`lib/templates.ts`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/lib/templates.ts) |
| `theme-warm-memories.svg` | SVG (48 × 48 px) | Theme pack card: "Warm Memories" / Crush (Soft Lavender pill) | [`components/quiz/QuizCreator.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/quiz/QuizCreator.tsx), [`lib/templates.ts`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/lib/templates.ts) |
| `theme-daily-chaos.svg` | SVG (48 × 48 px) | Theme pack card: "Daily Chaos" / Roommates (Champagne Gold pill) | [`components/quiz/QuizCreator.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/quiz/QuizCreator.tsx), [`lib/templates.ts`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/lib/templates.ts) |
| `theme-favorites.svg` | SVG (48 × 48 px) | Theme pack card: "Favorites" / Nostalgia (Sage pill) | [`components/quiz/QuizCreator.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/quiz/QuizCreator.tsx), [`lib/templates.ts`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/lib/templates.ts) |

### 4.5 Dashboard & Leaderboard Badges
| Asset File | Format & Specs | UI Placement & Usage | Component Reference |
| :--- | :--- | :--- | :--- |
| `badge-podium-crown-gold.svg` | SVG (40 × 40 px) | Leaderboard 1st place podium badge (Champagne Gold) | [`components/dashboard/Ranking.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/dashboard/Ranking.tsx) |
| `badge-podium-medal-silver.svg` | SVG (40 × 40 px) | Leaderboard 2nd place podium badge (Soft Lavender) | [`components/dashboard/Ranking.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/dashboard/Ranking.tsx) |
| `badge-podium-award-bronze.svg` | SVG (40 × 40 px) | Leaderboard 3rd place podium badge (Dusty Rose) | [`components/dashboard/Ranking.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/dashboard/Ranking.tsx) |
| `empty-quizzes-cozy.svg` | SVG (240 × 200 px) | "My Quizzes" drawer empty state (cozy open journal illustration) | [`components/dashboard/MyQuizzesSection.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/dashboard/MyQuizzesSection.tsx) |

### 4.6 Social Share & Open Graph Assets
| Asset File | Format & Specs | UI Placement & Usage | Component Reference |
| :--- | :--- | :--- | :--- |
| `story-card-frame-texture.webp` | WebP (1080 × 1920 px) | 9:16 Instagram/Snapchat/WhatsApp story card background | [`components/quiz/ShareCard.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/quiz/ShareCard.tsx) |
| `story-card-watermark.svg` | SVG (180 × 40 px) | Discrete footer branding watermark on downloadable story cards | [`components/quiz/ShareCard.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/components/quiz/ShareCard.tsx) |
| `og-preview-default.jpg` | JPG (1200 × 630 px) | Default OpenGraph/Twitter card image for link sharing previews | [`app/layout.tsx`](file:///home/kaif/storage/Codes/Fun-projects/lemon-quiz-maniac/app/layout.tsx) |

---

## 5. Component Design Standards

### 5.1 Tactile Buttons
- `.btn-primary-cozy`: Deep Soft Plum (`#6D526F` hover `#4B344D`), white text, `rounded-2xl`, min 56px height, soft plum shadow.
- `.btn-premium-gold`: Champagne Gold (`#D1A76A` hover `#B88B4E`), dark text, `rounded-2xl`, min 56px height, champagne glow shadow. **Reserved strictly for high-conversion viral actions.**
- `.btn-secondary-cream`: Cream surface (`#F8EFE3`), subtle plum border, deep plum text, `rounded-2xl`.

### 5.2 Floating Stationery Cards
- `.card-cozy`: White (light mode) / Warm Espresso (`#2A202D`, dark mode) surface with `rounded-3xl`, subtle stationery border (`rgba(109, 82, 111, 0.10)`), and layered elevation shadow (`0 12px 40px rgba(75, 52, 77, 0.08)`).
- Touch target height: 56px minimum across all option choices, input fields, and action buttons.

### 5.3 Theme Switcher (`components/ui/ThemeToggle.tsx`)
- Floating/header pill toggle featuring animated Lucide React `Sun` and `Moon` icons.
- Instant zero-FOUC synchronization between `localStorage` and system `prefers-color-scheme`.

---

## 6. Visual Quality & Accessibility Guardrails

1. **Zero Raw System OS Emojis**: Never render standard OS emojis in UI elements (buttons, headers, pills, tables). Use Lucide vector icons or custom scanned illustrations.
2. **WCAG AAA Text Contrast**: High contrast deep espresso (`#241C24`) on light surfaces (>14:1) and warm cream (`#FFF8F0`) on dark surfaces (>15:1).
3. **Responsive Asset Optimization**: Use Next.js `<Image />` with `sizes`, `priority` on above-the-fold hero graphics, and proper `alt` descriptions to preserve fast LCP and CWV metrics.
4. **Dark Mode Image Harmony**: Apply subtle backdrop glow filters (`drop-shadow`) or opacity overlays so that raster artwork blends seamlessly into both light and dark themes without jarring white box edges.
