import crypto from "crypto";
import { customAlphabet } from "nanoid";

/**
 * URL-friendly alphanumeric alphabet for generating quiz codes and attempt codes.
 * Excludes easily confusable characters (0, O, I, l) to ensure readability on mobile screens.
 */
const CODE_ALPHABET =
  "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

const defaultCodeGenerator = customAlphabet(CODE_ALPHABET, 8);

/**
 * Generates a 32-byte cryptographically secure random token (64 hex characters).
 * Transmitted to the quiz creator once; stored in MongoDB only as a SHA-256 hash.
 */
export function generateOwnerToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Computes the SHA-256 hash of a raw owner token.
 * Used for database lookups and capability-based authentication.
 */
export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Generates a high-entropy, URL-safe alphanumeric code using Nano ID.
 * Defaults to 8 characters for quiz and attempt codes.
 */
export function generateCode(length: number = 8): string {
  if (length === 8) {
    return defaultCodeGenerator();
  }
  return customAlphabet(CODE_ALPHABET, length)();
}

/**
 * Computes a privacy-preserving salted SHA-256 hash of an IP address.
 * Allows duplicate detection and sliding-window rate limiting without storing PII.
 */
export function hashIp(ip: string): string {
  const salt =
    process.env.SALT || process.env.TOKEN_SALT || "lemon_default_salt";
  return crypto.createHash("sha256").update(`${ip}:${salt}`).digest("hex");
}
