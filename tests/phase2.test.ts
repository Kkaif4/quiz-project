import assert from "node:assert";
import mongoose from "mongoose";
import {
  SlidingWindowRateLimiter,
  getClientIp,
  createRateLimitHeaders,
  quizCreateLimiter,
  quizAttemptLimiter,
  quizReportLimiter,
} from "@/lib/rate-limit";
import { getPublicQuizByCode } from "@/lib/quiz";
import { hashToken, hashIp } from "@/lib/tokens";
import { Quiz } from "@/models/Quiz";
import { Attempt } from "@/models/Attempt";
import { Report } from "@/models/Report";
import { POST as createQuizHandler } from "@/app/api/quizzes/route";
import { GET as getQuizHandler } from "@/app/api/quizzes/[quizCode]/route";
import { POST as submitAttemptHandler } from "@/app/api/quizzes/[quizCode]/attempts/route";
import { POST as createReportHandler } from "@/app/api/reports/route";

process.env.MONGODB_URI = "mongodb://127.0.0.1:27018/lemon-quiz-test";
process.env.SALT = "test-salt-secret";
process.env.TOKEN_SALT = "test-salt-secret";
process.env.RATE_LIMIT_ENABLED = "true";

async function runTests() {
  console.log("=== STARTING PHASE 2 COMPREHENSIVE VERIFICATION SUITE ===");

  // Connect to test MongoDB
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log(" Connected to MongoDB Test Database");

  // Clean test database collections
  await Quiz.deleteMany({});
  await Attempt.deleteMany({});
  await Report.deleteMany({});
  console.log(" Cleaned test collections");

  // =========================================================================
  // TASK-201: Rate Limiter Tests
  // =========================================================================
  console.log("\n--- [TASK-201] Rate Limiter Unit Tests ---");

  // Test 1: Sliding window counting and rejection
  const testLimiter = new SlidingWindowRateLimiter({
    windowMs: 60 * 1000,
    max: 3,
    maxEntries: 10,
  });

  const ipA = "192.168.1.100";
  const r1 = testLimiter.check(ipA);
  assert.strictEqual(r1.success, true);
  assert.strictEqual(r1.remaining, 2);

  const r2 = testLimiter.check(ipA);
  assert.strictEqual(r2.success, true);
  assert.strictEqual(r2.remaining, 1);

  const r3 = testLimiter.check(ipA);
  assert.strictEqual(r3.success, true);
  assert.strictEqual(r3.remaining, 0);

  const r4 = testLimiter.check(ipA);
  assert.strictEqual(r4.success, false);
  assert.strictEqual(r4.remaining, 0);
  assert.ok(r4.retryAfter && r4.retryAfter > 0, "retryAfter should be > 0");
  console.log(" Passed: Sliding window limits requests at max and calculates retryAfter");

  // Test 2: Rate limit headers
  const headers = createRateLimitHeaders(r4);
  assert.strictEqual(headers["X-RateLimit-Limit"], "3");
  assert.strictEqual(headers["X-RateLimit-Remaining"], "0");
  assert.ok(headers["Retry-After"]);
  console.log(" Passed: Standard rate limit headers formatted properly");

  // Test 3: Disable switch
  process.env.RATE_LIMIT_ENABLED = "false";
  const rDisabled = testLimiter.check(ipA);
  assert.strictEqual(rDisabled.success, true);
  process.env.RATE_LIMIT_ENABLED = "true";
  console.log(" Passed: RATE_LIMIT_ENABLED='false' bypasses rate limiter");

  // Test 4: LRU Eviction
  const lruLimiter = new SlidingWindowRateLimiter({
    windowMs: 60 * 1000,
    max: 5,
    maxEntries: 2,
  });
  lruLimiter.check("ip-1");
  lruLimiter.check("ip-2");
  assert.strictEqual(lruLimiter.size, 2);
  // Accessing ip-1 moves it to most recent
  lruLimiter.check("ip-1");
  // Adding ip-3 should evict ip-2 (least recently used)
  lruLimiter.check("ip-3");
  assert.strictEqual(lruLimiter.size, 2);
  // ip-2 should now be treated as new
  const resIp2 = lruLimiter.check("ip-2");
  assert.strictEqual(resIp2.remaining, 4, "ip-2 was re-created as new entry");
  console.log(" Passed: LRU eviction correctly evicts oldest entries at capacity");

  // Test 5: Client IP extraction
  const reqForwarded = new Request("http://localhost", {
    headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
  });
  assert.strictEqual(getClientIp(reqForwarded), "203.0.113.195");

  const reqReal = new Request("http://localhost", {
    headers: { "x-real-ip": "198.51.100.4" },
  });
  assert.strictEqual(getClientIp(reqReal), "198.51.100.4");

  const reqFallback = new Request("http://localhost");
  assert.strictEqual(getClientIp(reqFallback), "127.0.0.1");
  console.log(" Passed: getClientIp extracts forwarded, real, and fallback IPs");

  // =========================================================================
  // TASK-202: Quiz Creation Route (POST /api/quizzes)
  // =========================================================================
  console.log("\n--- [TASK-202] Quiz Creation Route Tests ---");
  quizCreateLimiter.reset();

  const validQuizPayload = {
    title: "How Well Do You Know Me?",
    description: "Ultimate friendship test",
    questions: [
      {
        id: "q_1",
        text: "What is my favorite late-night food?",
        type: "single",
        options: [
          { id: "opt_1a", text: "Pepperoni Pizza" },
          { id: "opt_1b", text: "Ramen noodles" },
          { id: "opt_1c", text: "Tacos" },
        ],
        correctOptionId: "opt_1a",
      },
      {
        id: "q_2",
        text: "What is my biggest pet peeve?",
        type: "single",
        options: [
          { id: "opt_2a", text: "Slow walkers" },
          { id: "opt_2b", text: "People chewing loudly" },
        ],
        correctOptionId: "opt_2b",
      },
      {
        id: "q_3",
        text: "Where is my dream vacation?",
        type: "single",
        options: [
          { id: "opt_3a", text: "Tokyo, Japan" },
          { id: "opt_3b", text: "Paris, France" },
          { id: "opt_3c", text: "Maui, Hawaii" },
        ],
        correctOptionId: "opt_3a",
      },
    ],
    settings: {
      showScore: true,
      showCorrectAnswers: false,
      maxAttemptsPerPerson: 1,
    },
  };

  // Test 1: Payload size check (> 50KB)
  const hugePayload = "A".repeat(52 * 1024);
  const reqHuge = new Request("http://localhost/api/quizzes", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(hugePayload)),
    },
    body: hugePayload,
  });
  const resHuge = await createQuizHandler(reqHuge);
  assert.strictEqual(resHuge.status, 413);
  console.log(" Passed: Payload > 50KB is rejected with 413 Payload Too Large");

  // Test 2: Honeypot check
  const reqBot = new Request("http://localhost/api/quizzes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ ...validQuizPayload, website: "https://spam.xyz" }),
  });
  const resBot = await createQuizHandler(reqBot);
  assert.strictEqual(resBot.status, 400);
  console.log(" Passed: Anti-bot honeypot rejects populated 'website' field");

  // Test 3: Validation schema rejection (less than 3 questions)
  const reqInvalid = new Request("http://localhost/api/quizzes", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      ...validQuizPayload,
      questions: validQuizPayload.questions.slice(0, 2),
    }),
  });
  const resInvalid = await createQuizHandler(reqInvalid);
  assert.strictEqual(resInvalid.status, 400);
  console.log(" Passed: Schema rejects quiz with less than 3 questions");

  // Test 4: Successful quiz creation
  const reqValid = new Request("http://localhost/api/quizzes", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "10.0.0.1" },
    body: JSON.stringify(validQuizPayload),
  });
  const resValid = await createQuizHandler(reqValid);
  assert.strictEqual(resValid.status, 201);
  const dataValid = await resValid.json();
  assert.strictEqual(dataValid.success, true);
  assert.ok(dataValid.data.quizCode);
  assert.ok(dataValid.data.ownerToken);
  assert.strictEqual(dataValid.data.manageUrl, `/manage/${dataValid.data.ownerToken}`);
  assert.strictEqual(dataValid.data.shareUrl, `/q/${dataValid.data.quizCode}`);

  // Verify cookie set
  const setCookieHeader = resValid.headers.get("set-cookie");
  assert.ok(setCookieHeader?.includes("quiz_owner_tokens"));
  assert.ok(setCookieHeader?.includes(dataValid.data.ownerToken));

  // Verify database record
  const savedQuiz = await Quiz.findOne({ code: dataValid.data.quizCode });
  assert.ok(savedQuiz);
  assert.strictEqual(savedQuiz.status, "active");
  assert.strictEqual(savedQuiz.ownerTokenHash, hashToken(dataValid.data.ownerToken));
  assert.notStrictEqual(savedQuiz.ownerTokenHash, dataValid.data.ownerToken, "Raw owner token must never be stored");
  console.log(" Passed: Valid quiz created with 201, cookie set, and hashed ownerToken in DB");

  // Test 5: Quiz creation rate limit (5 / IP / hr)
  for (let i = 0; i < 4; i++) {
    const req = new Request("http://localhost/api/quizzes", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": "10.0.0.1" },
      body: JSON.stringify(validQuizPayload),
    });
    const res = await createQuizHandler(req);
    assert.strictEqual(res.status, 201);
  }
  // 6th request from same IP
  const reqExceeded = new Request("http://localhost/api/quizzes", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "10.0.0.1" },
    body: JSON.stringify(validQuizPayload),
  });
  const resExceeded = await createQuizHandler(reqExceeded);
  assert.strictEqual(resExceeded.status, 429);
  assert.ok(resExceeded.headers.get("retry-after"));
  console.log(" Passed: Quiz creation rate limiter enforces 5 req/IP/hour and returns 429");

  // =========================================================================
  // TASK-203: Public Quiz Loader & Zero Leakage Verification
  // =========================================================================
  console.log("\n--- [TASK-203] Public Quiz Loader & Zero Leakage Audit ---");

  const createdCode = dataValid.data.quizCode;
  const initialViews = savedQuiz.stats.views;

  const publicQuiz = await getPublicQuizByCode(createdCode, { incrementViews: true });
  assert.ok(publicQuiz);
  assert.strictEqual(publicQuiz.code, createdCode);
  assert.strictEqual(publicQuiz.stats.views, initialViews + 1);

  // CRITICAL SECURITY AUDIT: Verify ZERO leakage
  assert.strictEqual((publicQuiz as unknown as Record<string, unknown>).ownerTokenHash, undefined);
  for (const q of publicQuiz.questions) {
    assert.strictEqual((q as unknown as Record<string, unknown>).correctOptionId, undefined);
  }
  const publicJson = JSON.stringify(publicQuiz);
  assert.ok(!publicJson.includes("correctOptionId"), "CRITICAL: correctOptionId leaked in JSON string!");
  assert.ok(!publicJson.includes("ownerTokenHash"), "CRITICAL: ownerTokenHash leaked in JSON string!");
  assert.ok(!publicJson.includes(dataValid.data.ownerToken), "CRITICAL: raw ownerToken leaked in JSON string!");
  console.log(" Passed: Public Quiz Loader verified ZERO leakage (0 answer keys, 0 token hashes)");

  // Test GET route handler
  const reqRouteGet = new Request(`http://localhost/api/quizzes/${createdCode}`);
  const resRouteGet = await getQuizHandler(reqRouteGet, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resRouteGet.status, 200);
  const routeGetData = await resRouteGet.json();
  assert.strictEqual(routeGetData.success, true);
  assert.strictEqual(routeGetData.data.code, createdCode);

  const resRoute404 = await getQuizHandler(reqRouteGet, {
    params: Promise.resolve({ quizCode: "nonexistent-code" }),
  });
  assert.strictEqual(resRoute404.status, 404);
  console.log(" Passed: GET /api/quizzes/[quizCode] returns 200 for active quiz, 404 for missing");

  // =========================================================================
  // TASK-204: Attempt Submission & Server-Side Scoring
  // =========================================================================
  console.log("\n--- [TASK-204] Attempt Submission & Scoring Route Tests ---");
  quizAttemptLimiter.reset();

  const attemptIp = "192.168.10.50";

  // Test 1: Honeypot check on attempt
  const reqAttemptBot = new Request(`http://localhost/api/quizzes/${createdCode}/attempts`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": attemptIp },
    body: JSON.stringify({
      nickname: "BotGuy",
      answers: [{ questionId: "q_1", optionId: "opt_1a" }],
      website: "bot-url",
      durationSeconds: 10,
    }),
  });
  const resAttemptBot = await submitAttemptHandler(reqAttemptBot, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resAttemptBot.status, 400);
  console.log(" Passed: Attempt submission rejects honeypot website field");

  // Test 2: Timing guard (durationSeconds < 3s)
  const reqAttemptFast = new Request(`http://localhost/api/quizzes/${createdCode}/attempts`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": attemptIp },
    body: JSON.stringify({
      nickname: "Flash",
      answers: [{ questionId: "q_1", optionId: "opt_1a" }],
      durationSeconds: 1,
    }),
  });
  const resAttemptFast = await submitAttemptHandler(reqAttemptFast, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resAttemptFast.status, 400);
  console.log(" Passed: Attempt completed in < 3s is rejected");

  // Test 2b: Timing guard (missing durationSeconds)
  const reqAttemptNoDuration = new Request(`http://localhost/api/quizzes/${createdCode}/attempts`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": attemptIp },
    body: JSON.stringify({
      nickname: "NoDurationBot",
      answers: [{ questionId: "q_1", optionId: "opt_1a" }],
    }),
  });
  const resAttemptNoDuration = await submitAttemptHandler(reqAttemptNoDuration, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resAttemptNoDuration.status, 400);
  console.log(" Passed: Attempt without durationSeconds is rejected (required timing guard)");

  // Test 3: Non-existent quiz code
  const reqAttempt404 = new Request("http://localhost/api/quizzes/fake999/attempts", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": attemptIp },
    body: JSON.stringify({
      nickname: "Sam",
      answers: [{ questionId: "q_1", optionId: "opt_1a" }],
      durationSeconds: 10,
    }),
  });
  const resAttempt404 = await submitAttemptHandler(reqAttempt404, {
    params: Promise.resolve({ quizCode: "fake999" }),
  });
  assert.strictEqual(resAttempt404.status, 404);
  console.log(" Passed: Attempt on non-existent quiz returns 404");

  // Test 3b: Invalid questionId rejection (Rule 3.3 invariant)
  const reqInvalidQ = new Request(`http://localhost/api/quizzes/${createdCode}/attempts`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "192.168.10.99" },
    body: JSON.stringify({
      nickname: "HackerOne",
      answers: [{ questionId: "non_existent_q", optionId: "opt_1a" }],
      durationSeconds: 10,
    }),
  });
  const resInvalidQ = await submitAttemptHandler(reqInvalidQ, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resInvalidQ.status, 400);
  const dataInvalidQ = await resInvalidQ.json();
  assert.strictEqual(dataInvalidQ.error, "Invalid questionId or optionId provided in answers");
  console.log(" Passed: Attempt with invalid questionId is rejected with 400 Bad Request");

  // Test 3c: Invalid optionId rejection (Rule 3.3 invariant)
  const reqInvalidOpt = new Request(`http://localhost/api/quizzes/${createdCode}/attempts`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "192.168.10.99" },
    body: JSON.stringify({
      nickname: "HackerTwo",
      answers: [{ questionId: "q_1", optionId: "non_existent_opt" }],
      durationSeconds: 10,
    }),
  });
  const resInvalidOpt = await submitAttemptHandler(reqInvalidOpt, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resInvalidOpt.status, 400);
  const dataInvalidOpt = await resInvalidOpt.json();
  assert.strictEqual(dataInvalidOpt.error, "Invalid questionId or optionId provided in answers");
  console.log(" Passed: Attempt with invalid optionId is rejected with 400 Bad Request");

  // Test 4: Valid attempt scoring (2 out of 3 correct)
  // Authoritative answers: q_1 -> opt_1a, q_2 -> opt_2b, q_3 -> opt_3a
  // Submitted:
  // q_1: opt_1a (correct)
  // q_2: opt_2a (incorrect, correct is opt_2b)
  // q_3: opt_3a (correct)
  // Expected score: 2, total: 3, percentage: 67
  const validAttemptBody = {
    nickname: "BestFriendAlex",
    answers: [
      { questionId: "q_1", optionId: "opt_1a" },
      { questionId: "q_2", optionId: "opt_2a" },
      { questionId: "q_3", optionId: "opt_3a" },
    ],
    durationSeconds: 12,
  };

  const reqAttemptValid = new Request(`http://localhost/api/quizzes/${createdCode}/attempts`, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-real-ip": attemptIp,
      "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)",
    },
    body: JSON.stringify(validAttemptBody),
  });
  const resAttemptValid = await submitAttemptHandler(reqAttemptValid, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resAttemptValid.status, 201);
  const dataAttempt = await resAttemptValid.json();
  assert.strictEqual(dataAttempt.success, true);
  assert.strictEqual(dataAttempt.data.nickname, "BestFriendAlex");
  assert.strictEqual(dataAttempt.data.score, 2);
  assert.strictEqual(dataAttempt.data.total, 3);
  assert.strictEqual(dataAttempt.data.percentage, 67);
  assert.strictEqual(dataAttempt.data.quizCode, createdCode);
  assert.ok(dataAttempt.data.attemptCode);

  // Check database Attempt record
  const savedAttempt = await Attempt.findOne({ code: dataAttempt.data.attemptCode });
  assert.ok(savedAttempt);
  assert.strictEqual(savedAttempt.score, 2);
  assert.strictEqual(savedAttempt.percentage, 67);
  assert.strictEqual(savedAttempt.metadata?.ipHash, hashIp(attemptIp));
  assert.notStrictEqual(savedAttempt.metadata?.ipHash, attemptIp, "Raw IP must never be stored");

  // Check quiz stats incremented
  const updatedQuiz = await Quiz.findOne({ code: createdCode });
  assert.strictEqual(updatedQuiz?.stats.attempts, 1);
  console.log(" Passed: Server-side scoring accurate (2/3 = 67%), attempt persisted with ipHash, stats incremented");

  // Test 5: maxAttemptsPerPerson constraint
  // Since settings.maxAttemptsPerPerson is 1, a second attempt from attemptIp must return 403
  const reqAttemptSecond = new Request(`http://localhost/api/quizzes/${createdCode}/attempts`, {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": attemptIp },
    body: JSON.stringify({
      nickname: "AlexAgain",
      answers: [{ questionId: "q_1", optionId: "opt_1a" }],
      durationSeconds: 15,
    }),
  });
  const resAttemptSecond = await submitAttemptHandler(reqAttemptSecond, {
    params: Promise.resolve({ quizCode: createdCode }),
  });
  assert.strictEqual(resAttemptSecond.status, 403);
  console.log(" Passed: maxAttemptsPerPerson enforced (second attempt from same IP rejected with 403)");

  // =========================================================================
  // TASK-205: Abuse Reporting Route (POST /api/reports)
  // =========================================================================
  console.log("\n--- [TASK-205] Abuse Reporting Route Tests ---");
  quizReportLimiter.reset();

  const reportIp = "172.16.0.22";

  // Test 1: Payload size check (>50KB)
  const reqReportHuge = new Request("http://localhost/api/reports", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(hugePayload)),
    },
    body: hugePayload,
  });
  const resReportHuge = await createReportHandler(reqReportHuge);
  assert.strictEqual(resReportHuge.status, 413);
  console.log(" Passed: Report payload > 50KB rejected with 413");

  // Test 2: Non-existent quiz
  const reqReport404 = new Request("http://localhost/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": reportIp },
    body: JSON.stringify({
      quizId: "fake-quiz-code",
      reason: "spam",
      description: "This is spam",
    }),
  });
  const resReport404 = await createReportHandler(reqReport404);
  assert.strictEqual(resReport404.status, 404);
  console.log(" Passed: Reporting non-existent quiz returns 404");

  // Test 3: Valid report by quizCode
  const reqReportValidCode = new Request("http://localhost/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": reportIp },
    body: JSON.stringify({
      quizId: createdCode,
      reason: "harassment",
      description: "Inappropriate language in options",
    }),
  });
  const resReportValidCode = await createReportHandler(reqReportValidCode);
  assert.strictEqual(resReportValidCode.status, 201);
  const dataReport = await resReportValidCode.json();
  assert.strictEqual(dataReport.success, true);

  // Verify in MongoDB
  const savedReport = await Report.findOne({ quizId: savedQuiz._id });
  assert.ok(savedReport);
  assert.strictEqual(savedReport.reason, "harassment");
  assert.strictEqual(savedReport.status, "pending");
  console.log(" Passed: Valid report submitted by quiz code with status 'pending'");

  // Test 4: Valid report by Mongo ObjectId
  const reqReportValidId = new Request("http://localhost/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": "172.16.0.23" },
    body: JSON.stringify({
      quizId: String(savedQuiz._id),
      reason: "spam",
    }),
  });
  const resReportValidId = await createReportHandler(reqReportValidId);
  assert.strictEqual(resReportValidId.status, 201);
  console.log(" Passed: Valid report submitted by Mongo ObjectId");

  // Test 5: Report rate limiter (3 req / IP / hr)
  quizReportLimiter.reset(reportIp);
  for (let i = 0; i < 3; i++) {
    const req = new Request("http://localhost/api/reports", {
      method: "POST",
      headers: { "content-type": "application/json", "x-real-ip": reportIp },
      body: JSON.stringify({
        quizId: createdCode,
        reason: "spam",
      }),
    });
    const res = await createReportHandler(req);
    assert.strictEqual(res.status, 201);
  }
  // 4th request from reportIp
  const reqReportExceeded = new Request("http://localhost/api/reports", {
    method: "POST",
    headers: { "content-type": "application/json", "x-real-ip": reportIp },
    body: JSON.stringify({
      quizId: createdCode,
      reason: "spam",
    }),
  });
  const resReportExceeded = await createReportHandler(reqReportExceeded);
  assert.strictEqual(resReportExceeded.status, 429);
  assert.ok(resReportExceeded.headers.get("retry-after"));
  console.log(" Passed: Report rate limiter enforces 3 req/IP/hour and returns 429");

  // Clean up
  await mongoose.disconnect();
  console.log("\n Disconnected from MongoDB");
  console.log("=== ALL PHASE 2 VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
