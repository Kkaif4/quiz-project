/**
 * Lemon Quiz - Client-Side Google reCAPTCHA v3 Engine
 *
 * Implements non-intrusive, zero-friction bot verification:
 * - Dynamically appends https://www.google.com/recaptcha/api.js?render=${siteKey}
 * - Enforces a 4000ms timeout race condition so ad-blockers (uBlock Origin, Brave Shields)
 *   or network failures resolve to `null` and NEVER block legitimate user submissions.
 * - Safe for Next.js SSR / client hydration.
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (callback: () => void) => void;
      execute: (siteKey: string, options: { action: string }) => Promise<string>;
    };
  }
}

let scriptLoadPromise: Promise<boolean> | null = null;

export function getRecaptchaSiteKey(): string {
  return (
    process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY ||
    process.env.NEXT_PUBLIC_RECAPTCHA_KEY ||
    ""
  );
}

/**
 * Dynamically loads the reCAPTCHA v3 script tag into document.head if not already present.
 */
export function loadRecaptchaScript(): Promise<boolean> {
  if (typeof window === "undefined") {
    return Promise.resolve(false);
  }

  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) {
    return Promise.resolve(false);
  }

  if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
    return Promise.resolve(true);
  }

  if (scriptLoadPromise) {
    return scriptLoadPromise;
  }

  scriptLoadPromise = new Promise<boolean>((resolve) => {
    const SCRIPT_ID = "google-recaptcha-v3";
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;

    if (existing) {
      if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
        resolve(true);
        return;
      }
      existing.addEventListener("load", () => resolve(true), { once: true });
      existing.addEventListener("error", () => resolve(false), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = `https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(siteKey)}`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      resolve(true);
    };

    script.onerror = () => {
      console.warn("[reCAPTCHA v3] Script failed to load (blocked or network offline). Failing open.");
      resolve(false);
    };

    document.head.appendChild(script);
  });

  return scriptLoadPromise;
}

/**
 * Executes a reCAPTCHA v3 challenge for a given action with a 4000ms safety timeout race.
 * Returns null if reCAPTCHA is not configured, blocked, or timed out.
 */
export async function executeRecaptcha(action: string): Promise<string | null> {
  const siteKey = getRecaptchaSiteKey();
  if (!siteKey) {
    return null;
  }

  try {
    const isLoaded = await loadRecaptchaScript();
    if (!isLoaded || !window.grecaptcha) {
      return null;
    }

    const executePromise = new Promise<string | null>((resolve) => {
      try {
        window.grecaptcha!.ready(async () => {
          try {
            const token = await window.grecaptcha!.execute(siteKey, { action });
            resolve(token || null);
          } catch (execError) {
            console.warn("[reCAPTCHA v3] grecaptcha.execute error:", execError);
            resolve(null);
          }
        });
      } catch (readyError) {
        console.warn("[reCAPTCHA v3] grecaptcha.ready error:", readyError);
        resolve(null);
      }
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        resolve(null);
      }, 4000);
    });

    return await Promise.race([executePromise, timeoutPromise]);
  } catch (err) {
    console.warn("[reCAPTCHA v3] Execution encountered error:", err);
    return null;
  }
}
