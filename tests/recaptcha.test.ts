import assert from "node:assert";
import { isRecaptchaEnabled, verifyRecaptchaV3 } from "@/lib/recaptcha";
import { CreateQuizSchema, SubmitAttemptSchema, CreateReportSchema } from "@/lib/validation";

async function runRecaptchaTests() {
  console.log("=================================================================");
  console.log("   LEMON QUIZ — RECAPTCHA V3 SECURITY VERIFICATION TEST SUITE    ");
  console.log("=================================================================\n");

  const origEnv = { ...process.env };
  const origFetch = globalThis.fetch;

  try {
    // 1. isRecaptchaEnabled() tests
    console.log("▶ [TEST 1] Testing isRecaptchaEnabled() status toggling...");

    Object.assign(process.env, { NODE_ENV: "test" });
    assert.strictEqual(isRecaptchaEnabled(), false, "Should be disabled when NODE_ENV === 'test'");

    Object.assign(process.env, { NODE_ENV: "production" });
    process.env.RECAPTCHA_ENABLED = "false";
    process.env.RECAPTCHA_SECRET_KEY = "test-secret";
    assert.strictEqual(isRecaptchaEnabled(), false, "Should be disabled when RECAPTCHA_ENABLED === 'false'");

    delete process.env.RECAPTCHA_ENABLED;
    delete process.env.RECAPTCHA_SECRET_KEY;
    delete process.env.RECAPTCHA_SECRET;
    assert.strictEqual(isRecaptchaEnabled(), false, "Should be disabled when no secret key is set");

    process.env.RECAPTCHA_SECRET_KEY = "dummy-secret-key";
    assert.strictEqual(isRecaptchaEnabled(), true, "Should be enabled with RECAPTCHA_SECRET_KEY");

    delete process.env.RECAPTCHA_SECRET_KEY;
    process.env.RECAPTCHA_SECRET = "dummy-secret-fallback";
    assert.strictEqual(isRecaptchaEnabled(), true, "Should be enabled with RECAPTCHA_SECRET");
    console.log("  ✔ isRecaptchaEnabled() correctly detects environment status.\n");

    // 2. Bypass when disabled
    console.log("▶ [TEST 2] Testing bypass when reCAPTCHA is disabled...");
    Object.assign(process.env, { NODE_ENV: "test" });
    const bypassResult = await verifyRecaptchaV3(null, "create_quiz");
    assert.strictEqual(bypassResult.success, true);
    assert.strictEqual(bypassResult.bypassed, true);
    assert.strictEqual(bypassResult.score, 1.0);
    assert.strictEqual(bypassResult.action, "create_quiz");
    console.log("  ✔ Disabled reCAPTCHA automatically bypasses without network calls.\n");

    // 3. Missing token rejection when enabled
    console.log("▶ [TEST 3] Testing missing token rejection when enabled...");
    Object.assign(process.env, { NODE_ENV: "production" });
    process.env.RECAPTCHA_SECRET_KEY = "prod-secret-123";

    const missingResult = await verifyRecaptchaV3(undefined, "create_quiz");
    assert.strictEqual(missingResult.success, false);
    assert.strictEqual(missingResult.error, "Missing reCAPTCHA security token");

    const emptyResult = await verifyRecaptchaV3("   ", "create_quiz");
    assert.strictEqual(emptyResult.success, false);
    assert.strictEqual(emptyResult.error, "Missing reCAPTCHA security token");
    console.log("  ✔ Missing or blank tokens are rejected when reCAPTCHA is active.\n");

    // 4. Successful token verification with Google API mock
    console.log("▶ [TEST 4] Testing successful Google API verification with high score...");
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          success: true,
          score: 0.9,
          action: "create_quiz",
          challenge_ts: "2026-10-05T12:00:00Z",
          hostname: "lemonquiz.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const validResult = await verifyRecaptchaV3("valid-token-abc", "create_quiz", "192.0.2.1", 0.5);
    assert.strictEqual(validResult.success, true);
    assert.strictEqual(validResult.score, 0.9);
    assert.strictEqual(validResult.action, "create_quiz");
    assert.strictEqual(validResult.hostname, "lemonquiz.com");
    console.log("  ✔ High-score token passed verification successfully.\n");

    // 5. Score threshold rejection
    console.log("▶ [TEST 5] Testing score threshold rejection...");
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          success: true,
          score: 0.3,
          action: "submit_attempt",
          challenge_ts: "2026-10-05T12:00:00Z",
          hostname: "lemonquiz.com",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const lowScoreResult = await verifyRecaptchaV3("bot-token-xyz", "submit_attempt", "192.0.2.1", 0.5);
    assert.strictEqual(lowScoreResult.success, false);
    assert.ok(lowScoreResult.error?.includes("score too low"));
    assert.strictEqual(lowScoreResult.score, 0.3);

    // Custom threshold from environment
    process.env.RECAPTCHA_SCORE_THRESHOLD = "0.8";
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          success: true,
          score: 0.7,
          action: "submit_attempt",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const envThresholdResult = await verifyRecaptchaV3("token-test", "submit_attempt");
    assert.strictEqual(envThresholdResult.success, false);
    assert.ok(envThresholdResult.error?.includes("score too low"));
    delete process.env.RECAPTCHA_SCORE_THRESHOLD;
    console.log("  ✔ Low scores below threshold correctly rejected.\n");

    // 6. Action mismatch rejection
    console.log("▶ [TEST 6] Testing action mismatch rejection...");
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          success: true,
          score: 0.95,
          action: "unexpected_action",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const actionMismatchResult = await verifyRecaptchaV3("valid-token", "submit_report");
    assert.strictEqual(actionMismatchResult.success, false);
    assert.ok(actionMismatchResult.error?.includes("action mismatch"));
    console.log("  ✔ Action mismatch rejected properly.\n");

    // 7. Google API error code handling
    console.log("▶ [TEST 7] Testing Google API error-codes handling...");
    globalThis.fetch = (async () => {
      return new Response(
        JSON.stringify({
          success: false,
          "error-codes": ["invalid-input-response", "timeout-or-duplicate"],
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }) as unknown as typeof fetch;

    const googleFailResult = await verifyRecaptchaV3("expired-token", "create_quiz");
    assert.strictEqual(googleFailResult.success, false);
    assert.ok(googleFailResult.error?.includes("invalid-input-response"));
    console.log("  ✔ Google API error-codes formatted into error response.\n");

    // 8. Fail-Open Network Resiliency
    console.log("▶ [TEST 8] Testing fail-open network error behavior...");
    globalThis.fetch = (async () => {
      throw new Error("DNS resolution failed");
    }) as unknown as typeof fetch;

    // In production without fail-open: should return error
    Object.assign(process.env, { NODE_ENV: "production" });
    delete process.env.RECAPTCHA_FAIL_OPEN;
    const failClosedResult = await verifyRecaptchaV3("token", "create_quiz");
    assert.strictEqual(failClosedResult.success, false);
    assert.ok(failClosedResult.error?.includes("temporarily unavailable"));

    // In production WITH fail-open: should fail open
    process.env.RECAPTCHA_FAIL_OPEN = "true";
    const failOpenResult = await verifyRecaptchaV3("token", "create_quiz");
    assert.strictEqual(failOpenResult.success, true);
    assert.strictEqual(failOpenResult.bypassed, true);

    // In development mode: should fail open automatically
    Object.assign(process.env, { NODE_ENV: "development" });
    delete process.env.RECAPTCHA_FAIL_OPEN;
    const devFailOpenResult = await verifyRecaptchaV3("token", "create_quiz");
    assert.strictEqual(devFailOpenResult.success, true);
    assert.strictEqual(devFailOpenResult.bypassed, true);
    console.log("  ✔ Network exceptions properly fail-open in dev/configured mode, fail-closed in strict prod.\n");

    // 9. Zod Schema Recaptcha Token Compatibility
    console.log("▶ [TEST 9] Testing Zod schemas with recaptchaToken...");
    const sampleQuiz = {
      creatorName: "Tester",
      title: "My Quiz",
      questions: [
        {
          id: "q1",
          text: "What is my fav food?",
          options: [
            { id: "o1", text: "Pizza" },
            { id: "o2", text: "Pasta" },
          ],
          correctOptionId: "o1",
        },
        {
          id: "q2",
          text: "What is my fav animal?",
          options: [
            { id: "o1", text: "Dog" },
            { id: "o2", text: "Cat" },
          ],
          correctOptionId: "o1",
        },
        {
          id: "q3",
          text: "What is my fav color?",
          options: [
            { id: "o1", text: "Blue" },
            { id: "o2", text: "Red" },
          ],
          correctOptionId: "o1",
        },
      ],
      recaptchaToken: "token-sample-123",
    };
    const parsedQuiz = CreateQuizSchema.safeParse(sampleQuiz);
    assert.strictEqual(parsedQuiz.success, true);
    assert.strictEqual(parsedQuiz.data?.recaptchaToken, "token-sample-123");

    // Optional/null token in schema
    const parsedQuizNoToken = CreateQuizSchema.safeParse({ ...sampleQuiz, recaptchaToken: null });
    assert.strictEqual(parsedQuizNoToken.success, true);

    // SubmitAttemptSchema
    const sampleAttempt = {
      nickname: "Alex",
      answers: [{ questionId: "q1", optionId: "o1" }],
      durationSeconds: 10,
      recaptchaToken: "token-attempt-xyz",
    };
    const parsedAttempt = SubmitAttemptSchema.safeParse(sampleAttempt);
    assert.strictEqual(parsedAttempt.success, true);
    assert.strictEqual(parsedAttempt.data?.recaptchaToken, "token-attempt-xyz");

    // CreateReportSchema
    const sampleReport = {
      quizId: "QUIZ1234",
      reason: "spam" as const,
      recaptchaToken: "token-report-xyz",
    };
    const parsedReport = CreateReportSchema.safeParse(sampleReport);
    assert.strictEqual(parsedReport.success, true);
    assert.strictEqual(parsedReport.data?.recaptchaToken, "token-report-xyz");
    console.log("  ✔ All Zod schemas parse and validate recaptchaToken seamlessly.\n");

    console.log("=================================================================");
    console.log("   🎉 ALL RECAPTCHA V3 BACKEND TESTS PASSED SUCCESSFULLY!        ");
    console.log("=================================================================\n");
  } finally {
    // Restore environment & fetch
    globalThis.fetch = origFetch;
    process.env = origEnv;
  }
}

runRecaptchaTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ reCAPTCHA Test Suite Failed:", err);
    process.exit(1);
  });
