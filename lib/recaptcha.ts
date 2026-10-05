/**
 * Google reCAPTCHA v3 (Invisible) Server-Side Verification Engine
 *
 * Verifies client tokens against Google's siteverify API.
 * Features:
 * - Configurable score threshold (default 0.5)
 * - Action matching verification
 * - Timeout guard (5s via AbortSignal.timeout)
 * - Automatic test/development bypass
 * - Fail-open resiliency in dev / when RECAPTCHA_FAIL_OPEN=true
 */

export interface RecaptchaV3Result {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  bypassed?: boolean;
  errorCodes?: string[];
  error?: string;
}

interface GoogleSiteVerifyResponse {
  success: boolean;
  score?: number;
  action?: string;
  challenge_ts?: string;
  hostname?: string;
  "error-codes"?: string[];
  errorCodes?: string[];
}

/**
 * Checks whether reCAPTCHA verification is currently enabled.
 * Automatically disabled in test environments or when explicitly toggled off.
 */
export function isRecaptchaEnabled(): boolean {
  if (process.env.NODE_ENV === "test" || process.env.RECAPTCHA_ENABLED === "false") {
    return false;
  }
  const secret = process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET;
  return typeof secret === "string" && secret.trim().length > 0;
}

/**
 * Returns configured reCAPTCHA secret key.
 */
function getSecretKey(): string | undefined {
  return process.env.RECAPTCHA_SECRET_KEY || process.env.RECAPTCHA_SECRET;
}

/**
 * Resolves the effective minimum score threshold.
 */
function getMinScoreThreshold(overrideScore?: number): number {
  if (overrideScore !== undefined && !Number.isNaN(overrideScore)) {
    return overrideScore;
  }
  if (process.env.RECAPTCHA_SCORE_THRESHOLD) {
    const parsed = parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return 0.5;
}

/**
 * Verifies a Google reCAPTCHA v3 response token.
 *
 * @param token - The response token string received from client grecaptcha.execute
 * @param expectedAction - The expected action name (e.g., 'create_quiz', 'submit_attempt', 'submit_report')
 * @param remoteIp - Optional client IP address
 * @param minScore - Minimum acceptable score (0.0 to 1.0, default 0.5)
 */
export async function verifyRecaptchaV3(
  token: string | undefined | null,
  expectedAction: string,
  remoteIp?: string,
  minScore?: number,
): Promise<RecaptchaV3Result> {
  // 1. Bypass check (test mode or disabled)
  if (!isRecaptchaEnabled()) {
    return {
      success: true,
      bypassed: true,
      score: 1.0,
      action: expectedAction,
    };
  }

  // 2. Reject missing or blank token when active
  if (!token || typeof token !== "string" || token.trim().length === 0) {
    return {
      success: false,
      error: "Missing reCAPTCHA security token",
    };
  }

  const secretKey = getSecretKey();
  if (!secretKey) {
    return {
      success: true,
      bypassed: true,
      score: 1.0,
      action: expectedAction,
    };
  }

  // 3. Post to Google siteverify endpoint
  try {
    const postData = new URLSearchParams();
    postData.append("secret", secretKey.trim());
    postData.append("response", token.trim());
    if (remoteIp && remoteIp !== "unknown" && remoteIp !== "127.0.0.1") {
      postData.append("remoteip", remoteIp);
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: postData.toString(),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      throw new Error(`reCAPTCHA API returned HTTP status ${response.status}`);
    }

    const data = (await response.json()) as GoogleSiteVerifyResponse;
    const errorCodes = data["error-codes"] || data.errorCodes;

    // 4. Validate Google response
    if (!data.success) {
      const errorMsg =
        errorCodes && errorCodes.length > 0
          ? `reCAPTCHA verification failed: ${errorCodes.join(", ")}`
          : "reCAPTCHA verification failed";

      return {
        success: false,
        score: data.score,
        action: data.action,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
        errorCodes,
        error: errorMsg,
      };
    }

    // 5. Score threshold check
    const threshold = getMinScoreThreshold(minScore);
    if (typeof data.score === "number" && data.score < threshold) {
      return {
        success: false,
        score: data.score,
        action: data.action,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
        errorCodes,
        error: `reCAPTCHA score too low (${data.score.toFixed(2)} < ${threshold.toFixed(2)})`,
      };
    }

    // 6. Action mismatch check
    if (expectedAction && data.action && data.action !== expectedAction) {
      return {
        success: false,
        score: data.score,
        action: data.action,
        challenge_ts: data.challenge_ts,
        hostname: data.hostname,
        errorCodes,
        error: `reCAPTCHA action mismatch (expected "${expectedAction}", received "${data.action}")`,
      };
    }

    // Verification passed
    return {
      success: true,
      score: data.score,
      action: data.action,
      challenge_ts: data.challenge_ts,
      hostname: data.hostname,
      errorCodes,
    };
  } catch (err: unknown) {
    const isDev = process.env.NODE_ENV === "development";
    const failOpen = process.env.RECAPTCHA_FAIL_OPEN === "true";
    const errorMsg = err instanceof Error ? err.message : String(err);

    if (failOpen || isDev) {
      console.warn(`[reCAPTCHA Warning] Verification service issue, failing open: ${errorMsg}`);
      return {
        success: true,
        bypassed: true,
        score: 1.0,
        action: expectedAction,
        error: errorMsg,
      };
    }

    console.error(`[reCAPTCHA Error] Verification service unavailable: ${errorMsg}`);
    return {
      success: false,
      error: "Security verification service temporarily unavailable. Please try again.",
    };
  }
}

/**
 * Backward compatibility alias for generic token verification
 */
export const verifyRecaptchaToken = (
  token: string | undefined | null,
  remoteIp?: string,
  expectedAction = "submit",
) => verifyRecaptchaV3(token, expectedAction, remoteIp);
