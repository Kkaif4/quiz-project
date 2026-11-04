# BestFriend Quiz — Architectural Design Decisions (ADRs)
**Document**: `DESIGN_DECISIONS.md`  
**Application**: LemonQuiz  
**Status**: Approved Specification  
**Scope**: UI/UX Design System, Viral Mechanics, and Interaction Architecture

---

## ADR-D01: Neo-Pop Tactile Design vs Generic AI Glassmorphism

### Context
Most AI-generated websites default to dark purple-blue backgrounds with high-blur glass cards (`backdrop-blur-xl`), glowing abstract gradient spheres, and sterile Inter typography. While futuristic for enterprise tools, this aesthetic feels cold, corporate, and lifeless to a 13–20 year old audience looking to have fun with their friends.

### Decision
Adopt the **Neo-Pop Tactile Stickerbook** aesthetic:
- Solid high-contrast surfaces (`#1A1538` dark ink container cards).
- Physical 3D offset push-down buttons (`0 4px 0 #CA8A04` shadow that translates down on click).
- Playful rotated sticker badges (`-2deg` to `+3deg` tilt).
- Punchy Electric Lemon (`#FACC15`) and Sunset Berry (`#FF4D6D`) brand accents.

### Consequences
- **Positive**: Instantly recognizable brand identity from a single screenshot. Feels like a real party game rather than a survey.
- **Trade-off**: Requires custom tactile button and shadow utilities instead of default Tailwind drop shadows.

---

## ADR-D02: Expressive Emoji & Vector Hybrid Iconography

### Context
A previous strict rule banned all system emojis in favor of plain monochrome Lucide icons. While clean, this stripped the emotional warmth and youth-oriented humor from the game.

### Decision
Implement a **hybrid iconography model**:
- **Lucide React Icons**: Handled for structural navigation, copy links, security shields, and control settings (`strokeWidth={2.5}`).
- **Curated Vector Emojis**: Integrated as emotional reaction anchors, category badges (🍕, 👑, 💀, 🔮, ⚡), and friendship verdict tiers.

### Consequences
- **Positive**: Directly mirrors how Gen Z communicates in group chats and stories without sacrificing UI legibility.

---

## ADR-D03: 3-Beat Dramatic Score Reveal vs Instant Metric Table

### Context
Displaying a simple static score like *"Score: 8/10"* upon submission is boring and misses the primary viral hook of the product.

### Decision
Structure the result screen as a **3-Beat Arcade Reveal**:
1. Suspense pulsing aura (0–400ms).
2. Animated rapid score roll-up from 0% to final score (400–1400ms).
3. Dramatic Friendship Verdict Trophy drop with celebratory canvas confetti explosion (1400–1500ms).

### Consequences
- **Positive**: Delivers a dopamine-rich climax that encourages users to screenshot and share immediately.

---

## ADR-D04: 9:16 Social Story Card Export vs Plain Text Link Sharing

### Context
Text-only link sharing has low click-through rates on visual platforms like Instagram Stories, Snapchat, and TikTok.

### Decision
Design a dedicated **9:16 vertical trophy card** that users can export or screenshot directly, featuring their friendship score, crowned tier, and custom link sticker placeholder.

### Consequences
- **Positive**: Massively increases viral reach and social media conversion.

---

## ADR-D05: 60-Second Question Bank Studio vs Blank Slate Form

### Context
Requiring users to type 10 questions and 40 answers from scratch on a mobile keyboard causes an 80%+ drop-off during onboarding.

### Decision
Provide a curated **100+ Question Idea Bank** pre-loaded with hilarious, trending, and relatable friendship questions. The creator can build and launch a complete quiz in under 60 seconds by simply swapping and customizing defaults.

### Consequences
- **Positive**: Minimizes cognitive load and maximizes quiz creation completion rates.

---

## ADR-D06: Zero-Auth Instant Onboarding with URL Token + Cookie Mirroring

### Context
Forcing teenagers to register with an email and password before taking or creating a quiz destroys viral velocity.

### Decision
Maintain zero-auth instant creation:
- Secure 32-byte cryptographic `ownerToken` delivered via URL and mirrored into HTTP-only cookies and localStorage.
- Dynamic Server Component streams the creator's quizzes onto the homepage automatically upon return.

### Consequences
- **Positive**: Zero onboarding friction; quiz creation begins with a single tap.
- **Preserved Rule**: Raw owner tokens are never stored in plain text on the server; only SHA-256 hashes are persisted in MongoDB.
