export type ClassValue =
  | string
  | number
  | boolean
  | undefined
  | null
  | { [key: string]: boolean | undefined | null }
  | ClassValue[];

/**
 * Clean class utility merging strings, conditionals, and arrays
 * without requiring external runtime dependencies.
 */
export function cn(...inputs: ClassValue[]): string {
  const classes: string[] = [];

  for (const input of inputs) {
    if (!input) continue;

    if (typeof input === "string" || typeof input === "number") {
      classes.push(String(input));
    } else if (Array.isArray(input)) {
      const inner = cn(...input);
      if (inner) classes.push(inner);
    } else if (typeof input === "object") {
      for (const [key, value] of Object.entries(input)) {
        if (value) classes.push(key);
      }
    }
  }

  return classes.join(" ");
}

export type VerdictTier =
  | "inner_circle"
  | "certified_bestie"
  | "casual_friend"
  | "strangers";

export interface FriendshipVerdict {
  tier: VerdictTier;
  title: string;
  tagline: string;
  description: string;
  badgeBg: string;
  badgeText: string;
  accentBg: string;
  iconName: "Crown" | "HeartHandshake" | "Flame" | "Sparkles";
}

/**
 * Returns dynamic friendship verdict tiers, titles, and praise/roast commentary
 * based on the scored percentage.
 *
 * Tier Boundaries:
 * - 90-100%: Inner Circle Status
 * - 70-89%: Certified Bestie
 * - 40-69%: Casual Friend
 * - 0-39%: Strangers with Memories
 */
export function getFriendshipVerdict(percentage: number): FriendshipVerdict {
  const clamped = Math.max(0, Math.min(100, Math.round(percentage)));

  if (clamped >= 90) {
    return {
      tier: "inner_circle",
      title: "Inner Circle Status",
      tagline: "Unbreakable Bond",
      description:
        "You know them better than almost anyone! You remember the tiny details, secret jokes, and everyday chaos. Top-tier soulmate best friend energy.",
      badgeBg: "bg-purple-500/15 border-purple-500/30 text-purple-300",
      badgeText: "text-purple-300",
      accentBg: "bg-purple-600",
      iconName: "Crown",
    };
  }

  if (clamped >= 70) {
    return {
      tier: "certified_bestie",
      title: "Certified Bestie",
      tagline: "High Compatibility",
      description:
        "Solid, genuine connection! You two are totally on the same wavelength. A few missed details, but real friendship is unmistakable.",
      badgeBg: "bg-pink-500/15 border-pink-500/30 text-pink-300",
      badgeText: "text-pink-300",
      accentBg: "bg-pink-500",
      iconName: "HeartHandshake",
    };
  }

  if (clamped >= 40) {
    return {
      tier: "casual_friend",
      title: "Casual Friend",
      tagline: "Good Vibes",
      description:
        "Good vibes and great laughs, but plenty of hidden secrets left to unlock. You definitely need another late-night hangout to catch up.",
      badgeBg: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
      badgeText: "text-indigo-300",
      accentBg: "bg-indigo-600",
      iconName: "Flame",
    };
  }

  return {
    tier: "strangers",
    title: "Strangers with Memories",
    tagline: "Time to Catch Up",
    description:
      "Are you sure you guys talk often? It's time to sit down, grab snacks, and rebuild those core memories from scratch.",
    badgeBg: "bg-violet-950/40 border-violet-800/40 text-violet-300",
    badgeText: "text-violet-300",
    accentBg: "bg-violet-700",
    iconName: "Sparkles",
  };
}

/**
 * Formats a Date or date string into human-friendly relative time.
 * e.g., "just now", "5m ago", "2h ago", "yesterday", "3d ago".
 */
export function formatRelativeTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) {
    return "recently";
  }

  const now = Date.now();
  const diffMs = now - d.getTime();

  if (diffMs < 45_000) {
    return "just now";
  }

  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }

  const diffHours = Math.floor(diffMs / (60 * 60 * 1000));
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (diffDays === 1) {
    return "yesterday";
  }
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths}mo ago`;
  }

  return `${Math.floor(diffDays / 365)}y ago`;
}
