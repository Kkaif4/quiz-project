import { NextResponse } from "next/server";
import crypto from "crypto";

export const MAX_PAYLOAD_BYTES = 50 * 1024; // 50KB limit to prevent memory exhaustion

/**
 * Validates request payload size and parses JSON body safely.
 * Returns either { ok: true, body } or { ok: false, response: NextResponse }.
 */
export async function validatePayloadSize<T = unknown>(
  request: Request,
  maxBytes: number = MAX_PAYLOAD_BYTES,
): Promise<{ ok: true; body: T } | { ok: false; response: NextResponse }> {
  // 1. Content-Length header guard
  const contentLength = request.headers.get("content-length");
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Payload exceeds 50KB limit" },
        { status: 413 },
      ),
    };
  }

  // 2. Read raw body and byte-length guard
  let rawBody: string;
  try {
    rawBody = await request.text();
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Failed to read request payload" },
        { status: 400 },
      ),
    };
  }

  if (Buffer.byteLength(rawBody, "utf8") > maxBytes) {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Payload exceeds 50KB limit" },
        { status: 413 },
      ),
    };
  }

  // 3. JSON parse guard
  try {
    const body = JSON.parse(rawBody) as T;
    return { ok: true, body };
  } catch {
    return {
      ok: false,
      response: NextResponse.json(
        { success: false, error: "Invalid JSON payload" },
        { status: 400 },
      ),
    };
  }
}

/**
 * Anti-bot honeypot detector.
 * Returns true if the honeypot field `website` is present and contains non-empty content.
 */
export function isHoneypotTriggered(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;
  const website = (body as Record<string, unknown>).website;
  if (website === undefined || website === null) {
    return false;
  }
  if (typeof website === "string") {
    return website.trim().length > 0;
  }
  return true;
}

/**
 * Extracts administrative authorization token from incoming request.
 * Priority:
 * 1. Authorization header: "Bearer <token>"
 * 2. "x-admin-key" header
 * 3. "?key=" query parameter
 */
export function extractAdminToken(request: Request): string | null {
  // 1. Authorization: Bearer <key>
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token) return token;
  }

  // 2. x-admin-key header
  const adminKeyHeader = request.headers.get("x-admin-key");
  if (adminKeyHeader && adminKeyHeader.trim().length > 0) {
    return adminKeyHeader.trim();
  }

  // 3. ?key= search param
  try {
    const url = new URL(request.url);
    const keyParam = url.searchParams.get("key");
    if (keyParam && keyParam.trim().length > 0) {
      return keyParam.trim();
    }
  } catch {
    // Ignore invalid or relative URLs
  }

  return null;
}

/**
 * Constant-time verification of the administrative secret key.
 * Hashes both the extracted token and the configured secret with SHA-256
 * before comparing with crypto.timingSafeEqual to eliminate timing attack vectors.
 */
export function verifyAdminSecret(request: Request): boolean {
  const adminSecret = process.env.ADMIN_SECRET_KEY;
  if (
    !adminSecret ||
    typeof adminSecret !== "string" ||
    adminSecret.trim().length === 0
  ) {
    return false;
  }

  const token = extractAdminToken(request);
  if (!token) {
    return false;
  }

  const tokenHash = crypto
    .createHash("sha256")
    .update(token.trim(), "utf8")
    .digest();
  const secretHash = crypto
    .createHash("sha256")
    .update(adminSecret.trim(), "utf8")
    .digest();

  return crypto.timingSafeEqual(tokenHash, secretHash);
}
