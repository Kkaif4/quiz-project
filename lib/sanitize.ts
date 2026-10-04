/**
 * Sanitization & Content Moderation Utilities.
 * 
 * Provides defense against XSS, control-character injection, and profanity/slur abuse.
 */

const HTML_ESCAPE_MAP: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#x27;",
  "/": "&#x2F;",
};

/**
 * Escapes unsafe HTML characters: &, <, >, ", ', and /.
 */
export function escapeHtml(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.replace(/[&<>"'/]/g, (char) => HTML_ESCAPE_MAP[char] || char);
}

/**
 * Strips ASCII non-printables (control codes) and Unicode invisible or directional override characters.
 */
export function stripControlChars(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str
    // ASCII control codes (0x00-0x1F except tab/newline, and 0x7F-0x9F)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    // Unicode zero-width, invisible, and directional formatting characters
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]/g, "");
}

/**
 * Trims leading/trailing whitespace and collapses internal multiple spaces/tabs into a single space.
 */
export function normalizeWhitespace(str: string): string {
  if (!str || typeof str !== "string") return "";
  return str.trim().replace(/\s+/g, " ");
}

export interface SanitizeTextOptions {
  escapeHtml?: boolean;
  maxLength?: number;
}

/**
 * Comprehensive text sanitization pipeline:
 * 1. Strips non-printable and invisible control characters.
 * 2. Normalizes multiple spaces into a single space.
 * 3. Optionally truncates to a maximum length.
 * 4. Optionally escapes HTML characters.
 */
export function sanitizeText(
  str: string,
  options?: SanitizeTextOptions,
): string {
  if (!str || typeof str !== "string") return "";

  let clean = stripControlChars(str);
  clean = normalizeWhitespace(clean);

  if (options?.maxLength !== undefined && options.maxLength > 0) {
    clean = clean.slice(0, options.maxLength);
  }

  if (options?.escapeHtml) {
    clean = escapeHtml(clean);
  }

  return clean;
}

/**
 * Leetspeak substitutions:
 * @ -> a, $ -> s, 0 -> o, 3 -> e, ! -> i, + -> t, 1 -> i or l
 */
export function decodeLeetspeak(text: string, oneAsL: boolean = false): string {
  if (!text || typeof text !== "string") return "";
  return text
    .replace(/@/g, "a")
    .replace(/\$/g, "s")
    .replace(/0/g, "o")
    .replace(/3/g, "e")
    .replace(/!/g, "i")
    .replace(/\+/g, "t")
    .replace(/1/g, oneAsL ? "l" : "i");
}

/**
 * Curated list of severe slurs, hate speech, explicit sexual terms, and extreme vulgarities.
 * Must be matched with word boundaries (\b) to avoid the Scunthorpe problem.
 */
const PROFANITY_WORDS = [
  // Extreme profanity & vulgarities
  "ass",
  "asshole",
  "assholes",
  "bastard",
  "bastards",
  "bitch",
  "bitches",
  "bitching",
  "bullshit",
  "cock",
  "cocks",
  "cocksucker",
  "cocksuckers",
  "cunt",
  "cunts",
  "dick",
  "dicks",
  "dickhead",
  "dickheads",
  "dildo",
  "dildos",
  "fuck",
  "fucks",
  "fucked",
  "fucker",
  "fuckers",
  "fucking",
  "motherfuck",
  "motherfucker",
  "motherfuckers",
  "motherfucking",
  "pussy",
  "pussies",
  "shit",
  "shits",
  "shitted",
  "shitting",
  "slut",
  "sluts",
  "twat",
  "twats",
  "whore",
  "whores",
  // Explicit sexual terms
  "blowjob",
  "blowjobs",
  "clit",
  "clits",
  "cum",
  "deepthroat",
  "handjob",
  "handjobs",
  "jizz",
  "porn",
  "porno",
  "pornography",
  // Severe slurs & hate speech
  "chink",
  "chinks",
  "coon",
  "coons",
  "dyke",
  "dykes",
  "fag",
  "fags",
  "faggot",
  "faggots",
  "gook",
  "gooks",
  "kike",
  "kikes",
  "nigga",
  "niggas",
  "nigger",
  "niggers",
  "retard",
  "retards",
  "retarded",
  "spic",
  "spics",
  "tranny",
  "trannies",
  "wetback",
  "wetbacks",
];

const PROFANITY_REGEX = new RegExp(
  `\\b(?:${PROFANITY_WORDS.join("|")})\\b`,
  "i",
);

/**
 * Checks if the given text contains any severe profanity, hate speech, or slurs.
 * Evaluates both the raw text and decoded leetspeak variants while respecting word boundaries.
 * Prevents false positives like "classic", "hello", "bass".
 */
export function containsProfanity(text: string): boolean {
  if (!text || typeof text !== "string") return false;

  // Normalize delimiter characters (_, -, ., /) to spaces so compound handles
  // like "asshole_friend" or "b!tch-lover" are properly segmented into word boundaries
  const normalized = text.replace(/[_.\-\/]/g, " ");

  // 1. Direct word boundary check
  if (PROFANITY_REGEX.test(normalized)) return true;

  // 2. Leetspeak decoded check (1 -> i)
  const decodedI = decodeLeetspeak(normalized, false);
  if (PROFANITY_REGEX.test(decodedI)) return true;

  // 3. Leetspeak decoded check (1 -> l)
  const decodedL = decodeLeetspeak(normalized, true);
  if (PROFANITY_REGEX.test(decodedL)) return true;

  return false;
}

/**
 * Censors profanity and slurs in text by replacing offensive words with asterisks (*).
 */
export function censorProfanity(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text.replace(
    /(?:^|(?<=[^a-zA-Z0-9@$!+]))[a-zA-Z0-9@$!+]+(?=$|[^a-zA-Z0-9@$!+])/g,
    (word) => {
      if (containsProfanity(word)) {
        return "*".repeat(word.length);
      }
      return word;
    },
  );
}
