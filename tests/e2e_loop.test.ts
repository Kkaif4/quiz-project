import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { Attempt } from "@/models/Attempt";
import { Report } from "@/models/Report";
import { hashToken, hashIp } from "@/lib/tokens";
import { getAttemptResultByCode, getOwnerQuizByToken } from "@/lib/quiz";
import { POST as createQuizPost } from "@/app/api/quizzes/route";
import { GET as getQuizGet, PATCH as updateQuizStatusPatch } from "@/app/api/quizzes/[quizCode]/route";
import { POST as submitAttemptPost } from "@/app/api/quizzes/[quizCode]/attempts/route";
import { POST as submitReportPost } from "@/app/api/reports/route";
import { GET as adminReportsGet, PATCH as adminReportsPatch } from "@/app/api/admin/reports/route";
import { getFriendshipVerdict } from "@/lib/utils";

// Load .env manually if needed
function loadEnv() {
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf-8");
    for (const line of content.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const idx = trimmed.indexOf("=");
      if (idx !== -1) {
        const key = trimmed.slice(0, idx).trim();
        let val = trimmed.slice(idx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

loadEnv();

process.env.SALT = process.env.SALT || "lemon-quiz-development-salt-change-in-production";
process.env.TOKEN_SALT = process.env.TOKEN_SALT || "lemon-quiz-development-salt-change-in-production";
process.env.ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || "lemon-quiz-admin-secret-key-change-in-production";

async function runE2EVerification() {
  console.log("=================================================================");
  console.log("   LEMON QUIZ — END-TO-END VIRAL LOOP & INTEGRITY TEST SUITE     ");
  console.log("=================================================================\n");

  await connectToDatabase();
  console.log("Connected to MongoDB via connectToDatabase() [DoH Enabled]\n");

  const testTitle = "E2E Automated Verification Quiz";
  const questions = [
    {
      id: "q1",
      text: "What is my absolute favorite comfort midnight snack?",
      type: "single" as const,
      options: [
        { id: "opt1", text: "Spicy Ramen" },
        { id: "opt2", text: "Leftover Pizza" },
        { id: "opt3", text: "Ice Cream" },
        { id: "opt4", text: "Chocolate Chip Cookies" },
      ],
      correctOptionId: "opt1",
    },
    {
      id: "q2",
      text: "Which city is at the very top of my travel bucket list?",
      type: "single" as const,
      options: [
        { id: "opt1", text: "Tokyo" },
        { id: "opt2", text: "Reykjavik" },
        { id: "opt3", text: "New York" },
        { id: "opt4", text: "Kyoto" },
      ],
      correctOptionId: "opt2",
    },
    {
      id: "q3",
      text: "What is my most predictable morning habit?",
      type: "single" as const,
      options: [
        { id: "opt1", text: "Hit snooze 3 times" },
        { id: "opt2", text: "Drink cold brew coffee" },
        { id: "opt3", text: "Check notifications instantly" },
        { id: "opt4", text: "Go for a run" },
      ],
      correctOptionId: "opt1",
    },
    {
      id: "q4",
      text: "What movie genre can I watch on repeat forever?",
      type: "single" as const,
      options: [
        { id: "opt1", text: "Sci-Fi Thrillers" },
        { id: "opt2", text: "90s Rom-Coms" },
        { id: "opt3", text: "Psychological Horror" },
        { id: "opt4", text: "Animated Features" },
      ],
      correctOptionId: "opt1",
    },
    {
      id: "q5",
      text: "What would I do first if I won a million dollars?",
      type: "single" as const,
      options: [
        { id: "opt1", text: "Buy a house with a huge garden" },
        { id: "opt2", text: "Take all my close friends on a trip" },
        { id: "opt3", text: "Invest it all and disappear" },
        { id: "opt4", text: "Start an indie game studio" },
      ],
      correctOptionId: "opt2",
    },
  ];

  // -------------------------------------------------------------------------
  // TEST 1: Quiz Creation & Cryptographic Identity
  // -------------------------------------------------------------------------
  console.log("--- [TEST 1] Quiz Creation & Cryptographic Token Generation ---");
  const createPayload = {
    title: testTitle,
    description: "Testing complete viral cycle from creation to leaderboard",
    questions,
    settings: {
      revealAnswers: "after_attempt",
      allowRetries: true,
      maxAttemptsPerPerson: 5,
    },
  };

  const createReq = new Request("http://localhost:3000/api/quizzes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "203.0.113.195",
    },
    body: JSON.stringify(createPayload),
  });

  const createRes = await createQuizPost(createReq);
  assert.strictEqual(createRes.status, 201, "Quiz creation should return 201");

  const createBody = await createRes.json();
  assert.strictEqual(createBody.success, true);
  assert.ok(createBody.data.quizCode, "quizCode must be present");
  assert.ok(createBody.data.ownerToken, "ownerToken must be present");

  const { quizCode, ownerToken } = createBody.data;
  console.log(` Quiz created successfully: Code=${quizCode}`);

  // Direct DB inspection
  const quizDoc = await Quiz.findOne({ code: quizCode }).lean();
  if (!quizDoc) throw new Error("Quiz must exist in DB");
  assert.strictEqual(quizDoc.ownerTokenHash, hashToken(ownerToken), "ownerTokenHash in DB must match hash of rawToken");
  assert.strictEqual((quizDoc as unknown as Record<string, unknown>).ownerToken, undefined, "Raw ownerToken must NEVER be stored in DB");
  console.log(" Invariant Passed: Raw ownerToken never saved to MongoDB, only SHA-256 hash.");

  // -------------------------------------------------------------------------
  // TEST 2: Zero Answer Key Leakage Verification
  // -------------------------------------------------------------------------
  console.log("\n--- [TEST 2] Public Sanitization & Zero Answer Key Leakage ---");
  const getReq = new Request(`http://localhost:3000/api/quizzes/${quizCode}`);
  const getRes = await getQuizGet(getReq, { params: Promise.resolve({ quizCode }) });
  assert.strictEqual(getRes.status, 200, "Public quiz fetch must return 200");

  const getBody = await getRes.json();
  assert.strictEqual(getBody.success, true);
  const publicQuiz = getBody.data;

  // Strict zero-leakage assertions
  assert.strictEqual(publicQuiz.ownerTokenHash, undefined, "ownerTokenHash must NOT be in public quiz response");
  assert.strictEqual(publicQuiz.ownerToken, undefined, "ownerToken must NOT be in public quiz response");

  for (const q of publicQuiz.questions) {
    assert.strictEqual(q.correctOptionId, undefined, `Question ${q.id} must NEVER leak correctOptionId`);
    assert.ok(q.options.length >= 2, "Options must be present");
  }

  const rawJson = JSON.stringify(getBody);
  assert.ok(!rawJson.includes("correctOptionId"), "CRITICAL: 'correctOptionId' keyword completely absent in public JSON");
  assert.ok(!rawJson.includes("ownerTokenHash"), "CRITICAL: 'ownerTokenHash' completely absent in public JSON");
  console.log(" Invariant Passed: Zero answer key leakage confirmed on public quiz endpoint.");

  // -------------------------------------------------------------------------
  // TEST 3: Anti-Cheat & Anti-Bot Protection
  // -------------------------------------------------------------------------
  console.log("\n--- [TEST 3] Anti-Cheat & Anti-Bot Protection ---");
  // 3a. Honeypot trap test
  const botReq = new Request(`http://localhost:3000/api/quizzes/${quizCode}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.5" },
    body: JSON.stringify({
      nickname: "BotSpammer",
      website: "https://spam-bot.xyz", // Honeypot filled
      durationSeconds: 15,
      answers: [{ questionId: "q1", optionId: "opt1" }],
    }),
  });
  const botRes = await submitAttemptPost(botReq, { params: Promise.resolve({ quizCode }) });
  assert.strictEqual(botRes.status, 400, "Honeypot trigger must return 400 Bad Request");
  console.log(" Bot honeypot successfully rejected (HTTP 400).");

  // 3b. Anti-cheat minimum duration test (< 3s)
  const speedReq = new Request(`http://localhost:3000/api/quizzes/${quizCode}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.6" },
    body: JSON.stringify({
      nickname: "SpeedCheat",
      website: "",
      durationSeconds: 1, // Sub-3-second impossible speed
      answers: [{ questionId: "q1", optionId: "opt1" }],
    }),
  });
  const speedRes = await submitAttemptPost(speedReq, { params: Promise.resolve({ quizCode }) });
  assert.strictEqual(speedRes.status, 400, "Sub-3-second submission must return 400 Bad Request");
  console.log(" Speed-cheat sub-3-second submission successfully rejected (HTTP 400).");

  // -------------------------------------------------------------------------
  // TEST 4: Attempt Submission & Server-Side Scoring
  // -------------------------------------------------------------------------
  console.log("\n--- [TEST 4] Server-Side Scoring & Attempt Persistence ---");
  // Friend submits 4 out of 5 correct answers:
  // q1: opt1 (correct)
  // q2: opt2 (correct)
  // q3: opt1 (correct)
  // q4: opt1 (correct)
  // q5: opt3 (wrong - correct is opt2)
  const friendAnswers = [
    { questionId: "q1", optionId: "opt1" },
    { questionId: "q2", optionId: "opt2" },
    { questionId: "q3", optionId: "opt1" },
    { questionId: "q4", optionId: "opt1" },
    { questionId: "q5", optionId: "opt3" },
  ];

  const attemptReq = new Request(`http://localhost:3000/api/quizzes/${quizCode}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.42" },
    body: JSON.stringify({
      nickname: "BestieSam",
      website: "",
      durationSeconds: 18,
      answers: friendAnswers,
    }),
  });

  const attemptRes = await submitAttemptPost(attemptReq, { params: Promise.resolve({ quizCode }) });
  assert.strictEqual(attemptRes.status, 201, "Valid attempt submission must return 201 Created");

  const attemptBody = await attemptRes.json();
  assert.strictEqual(attemptBody.success, true);
  assert.strictEqual(attemptBody.data.score, 4, "Score must be exactly 4 (calculated on server)");
  assert.strictEqual(attemptBody.data.total, 5, "Total must be 5");
  assert.strictEqual(attemptBody.data.percentage, 80, "Percentage must be 80%");
  const attemptCode = attemptBody.data.attemptCode;
  assert.ok(attemptCode, "attemptCode must be generated");

  // Inspect Attempt DB record
  const attemptDoc = await Attempt.findOne({ code: attemptCode }).lean();
  if (!attemptDoc || !attemptDoc.metadata) throw new Error("Attempt record must exist with metadata");
  assert.strictEqual(attemptDoc.metadata.ipHash, hashIp("198.51.100.42"), "Salted SHA-256 IP hash must be saved");
  assert.strictEqual((attemptDoc.metadata as unknown as Record<string, unknown>).ip, undefined, "Raw IP address must NOT be stored in DB");

  // Check stats increment
  const updatedQuiz = await Quiz.findOne({ code: quizCode }).lean();
  assert.ok((updatedQuiz?.stats?.attempts || 0) >= 1, "Quiz attempts count must increment atomically");
  console.log(" Server scoring evaluated accurately: 4/5 (80%), IP safely hashed, stats incremented.");

  // -------------------------------------------------------------------------
  // TEST 5: Result Retrieval & Verdict Mapping
  // -------------------------------------------------------------------------
  console.log("\n--- [TEST 5] Result View & Friendship Verdict ---");
  const resultData = await getAttemptResultByCode(quizCode, attemptCode);
  if (!resultData) throw new Error("Attempt result must load");
  assert.strictEqual(resultData.score, 4);
  assert.strictEqual(resultData.percentage, 80);
  assert.strictEqual(resultData.nickname, "BestieSam");
  const verdict = getFriendshipVerdict(resultData.percentage);
  assert.ok(verdict, "Friendship verdict must be generated");
  console.log(` Result loaded: ${resultData.nickname} scored ${resultData.score}/${resultData.total} (${resultData.percentage}%). Verdict="${verdict.tier}"`);

  // -------------------------------------------------------------------------
  // TEST 6: Owner Capabilities & Dashboard Controls
  // -------------------------------------------------------------------------
  console.log("\n--- [TEST 6] Owner Management & Capability Authorization ---");
  const ownerQuiz = await getOwnerQuizByToken(ownerToken);
  if (!ownerQuiz || !ownerQuiz.questions[0]) throw new Error("Owner must be authorized via SHA-256 token");
  assert.strictEqual(ownerQuiz.code, quizCode);
  assert.ok(ownerQuiz.questions[0].correctOptionId, "Owner is allowed to see correctOptionId for review");

  // Status Toggle: Disable quiz
  const patchReq = new Request(`http://localhost:3000/api/quizzes/${quizCode}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ownerToken,
      status: "disabled",
    }),
  });
  const patchRes = await updateQuizStatusPatch(patchReq, { params: Promise.resolve({ quizCode }) });
  assert.strictEqual(patchRes.status, 200, "Status update must return 200");

  const disabledQuiz = await Quiz.findOne({ code: quizCode }).lean();
  assert.strictEqual(disabledQuiz?.status, "disabled", "Quiz status must now be disabled in DB");
  console.log(" Owner successfully toggled quiz to 'disabled'.");

  // Verify new attempts blocked on disabled quiz
  const blockedAttemptReq = new Request(`http://localhost:3000/api/quizzes/${quizCode}/attempts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.99" },
    body: JSON.stringify({
      nickname: "LateFriend",
      website: "",
      durationSeconds: 15,
      answers: friendAnswers,
    }),
  });
  const blockedRes = await submitAttemptPost(blockedAttemptReq, { params: Promise.resolve({ quizCode }) });
  assert.strictEqual(blockedRes.status, 404, "Attempts on disabled quiz must be rejected (404)");
  console.log(" Submissions on disabled quiz blocked successfully.");

  // Re-activate quiz
  await Quiz.updateOne({ code: quizCode }, { $set: { status: "active" } });

  // -------------------------------------------------------------------------
  // TEST 7: Abuse Reporting & Admin Moderation Route
  // -------------------------------------------------------------------------
  console.log("\n--- [TEST 7] Abuse Reporting & Admin Moderation ---");
  const reportReq = new Request("http://localhost:3000/api/reports", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": "198.51.100.77" },
    body: JSON.stringify({
      quizId: quizCode,
      reason: "spam",
      description: "Automated verification spam report",
      website: "",
    }),
  });
  const reportRes = await submitReportPost(reportReq);
  assert.strictEqual(reportRes.status, 201, "Report submission must return 201");
  console.log(" User abuse report submitted successfully.");

  // Fetch report via Admin API
  const adminReq = new Request(`http://localhost:3000/api/admin/reports?status=pending`, {
    headers: { "x-admin-key": process.env.ADMIN_SECRET_KEY as string },
  });
  const adminRes = await adminReportsGet(adminReq);
  assert.strictEqual(adminRes.status, 200, "Admin reports list must return 200");
  const adminBody = await adminRes.json();
  assert.ok(adminBody.data.reports.length >= 1, "Report must be in admin list");
  const reportId = adminBody.data.reports[0].id || adminBody.data.reports[0]._id;

  // Moderate report via Admin API (resolve)
  const moderateReq = new Request("http://localhost:3000/api/admin/reports", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "x-admin-key": process.env.ADMIN_SECRET_KEY as string,
    },
    body: JSON.stringify({
      reportId,
      action: "resolve",
      resolutionNotes: "Verified clean by E2E test suite",
    }),
  });
  const moderateRes = await adminReportsPatch(moderateReq);
  assert.strictEqual(moderateRes.status, 200, "Report resolution must return 200");
  console.log(" Admin successfully moderated and resolved the abuse report.");

  // -------------------------------------------------------------------------
  // Clean up test documents
  // -------------------------------------------------------------------------
  await Quiz.deleteOne({ code: quizCode });
  await Attempt.deleteMany({ quizId: quizDoc._id });
  await Report.deleteOne({ _id: reportId });
  console.log("\n Cleaned up test quiz, attempt, and report records.");

  console.log("\n=================================================================");
  console.log("   ALL E2E VERIFICATION CHECKS PASSED WITH 100% SUCCESS!        ");
  console.log("=================================================================");
}

runE2EVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("\n❌ E2E VERIFICATION FAILURE:", err);
    process.exit(1);
  });
