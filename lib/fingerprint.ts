/**
 * Client-Side Browser Blueprint / Fingerprint Generator
 * Zero external dependencies. Uses native Web Crypto SHA-256 and Canvas 2D.
 */

let cachedFingerprint: string | null = null;

export async function getBrowserFingerprint(): Promise<string> {
  if (typeof window === "undefined") {
    return "";
  }

  // Return in-memory cached blueprint if already computed in this session
  if (cachedFingerprint) {
    return cachedFingerprint;
  }

  // Check sessionStorage for fast retrieval across page navigations
  try {
    const stored = window.sessionStorage?.getItem("lemon_browser_fp");
    if (stored && stored.length === 64) {
      cachedFingerprint = stored;
      return stored;
    }
  } catch {
    // Ignore storage restriction errors (e.g. strict sandboxing)
  }

  try {
    const components: string[] = [];

    // 1. Screen Dimensions & Color Depth
    if (window.screen) {
      components.push(
        `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`,
      );
    }

    // 2. Timezone & Locale
    try {
      components.push(Intl.DateTimeFormat().resolvedOptions().timeZone || "");
    } catch {
      components.push(String(new Date().getTimezoneOffset()));
    }
    components.push(navigator.language || "");
    components.push((navigator.languages || []).join(","));

    // 3. Hardware Concurrency, Memory & Touch Points
    components.push(String(navigator.hardwareConcurrency || 1));
    components.push(String((navigator as unknown as { deviceMemory?: number }).deviceMemory || 1));
    components.push(String(navigator.maxTouchPoints || 0));
    components.push(navigator.platform || "");

    // 4. Canvas 2D Geometric & Alpha Render Signature
    try {
      const canvas = document.createElement("canvas");
      canvas.width = 240;
      canvas.height = 60;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.textBaseline = "top";
        ctx.font = "14px 'Arial', sans-serif";
        ctx.fillStyle = "#f43f5e";
        ctx.fillRect(100, 5, 80, 20);
        ctx.fillStyle = "#8b5cf6";
        ctx.fillText("LemonQuiz,fp!#*~", 10, 15);
        ctx.fillStyle = "rgba(16, 185, 129, 0.75)";
        ctx.fillText("LemonQuiz,fp!#*~", 14, 18);
        components.push(canvas.toDataURL());
      }
    } catch {
      // Canvas rendering blocked by privacy extension
      components.push("canvas_blocked");
    }

    // 5. Combine and compute deterministic SHA-256 hash using native Web Crypto
    const rawString = components.join("###");
    if (window.crypto?.subtle) {
      const msgBuffer = new TextEncoder().encode(rawString);
      const hashBuffer = await window.crypto.subtle.digest("SHA-256", msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");

      cachedFingerprint = hashHex;
      try {
        window.sessionStorage?.setItem("lemon_browser_fp", hashHex);
      } catch {
        // Storage restricted
      }
      return hashHex;
    }
  } catch (err) {
    console.warn("Failed to generate native browser fingerprint:", err);
  }

  // Graceful fallback: Stable local identifier if Web Crypto is unavailable
  try {
    let localId = window.localStorage?.getItem("lemon_client_uuid");
    if (!localId) {
      localId = `fp_fb_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
      window.localStorage?.setItem("lemon_client_uuid", localId);
    }
    cachedFingerprint = localId;
    return localId;
  } catch {
    return "anonymous_client";
  }
}
