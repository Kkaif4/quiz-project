import assert from "node:assert";
import mongoose from "mongoose";
import { TEMPLATES, getTemplateById } from "@/lib/templates";
import { cn, getFriendshipVerdict } from "@/lib/utils";
import { getPublicQuizByCode, getAttemptResultByCode } from "@/lib/quiz";
import { Quiz } from "@/models/Quiz";
import { Attempt } from "@/models/Attempt";
import { CreateQuizSchema } from "@/lib/validation";
import { hashToken, hashIp, generateCode } from "@/lib/tokens";

process.env.MONGODB_URI = "mongodb://127.0.0.1:27018/lemon-quiz-test";
process.env.SALT = "test-salt-secret";
process.env.TOKEN_SALT = "test-salt-secret";
process.env.RATE_LIMIT_ENABLED = "true";

async function runPhase3Tests() {
  console.log("=== STARTING PHASE 3 COMPREHENSIVE VERIFICATION SUITE ===");

  // Connect to test MongoDB
  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log(" Connected to MongoDB Test Database");

  // Clean test database collections
  await Quiz.deleteMany({});
  await Attempt.deleteMany({});
  console.log(" Cleaned test collections");

  // =========================================================================
  // TASK-301: Templates & Utility Invariant Verification
  // =========================================================================
  console.log("\n--- [TASK-301] Template & Utility Invariants ---");

  // 1. Verify 4 templates exist with expected IDs
  assert.strictEqual(TEMPLATES.length, 4, "Must have exactly 4 templates");
  const templateIds = TEMPLATES.map((t) => t.id);
  assert.deepStrictEqual(templateIds, [
    "best-friends",
    "crush-admirer",
    "roommate-chaos",
    "childhood-nostalgia",
  ]);
  console.log(" Passed: 4 required templates exist with exact preset identifiers");

  // 2. Invariant verification on each template
  for (const tmpl of TEMPLATES) {
    assert(tmpl.title.length > 0 && tmpl.title.length <= 100, `Template ${tmpl.id} title length`);
    assert(tmpl.questions.length >= 5 && tmpl.questions.length <= 6, `Template ${tmpl.id} question count`);

    for (const q of tmpl.questions) {
      assert(q.text.length > 0 && q.text.length <= 300, `Question ${q.id} text length`);
      assert.strictEqual(q.options.length, 4, `Question ${q.id} must have exactly 4 options`);
      assert.strictEqual(q.type, "single", `Question ${q.id} type must be single`);

      const optionIds = new Set(q.options.map((o) => o.id));
      assert(
        optionIds.has(q.correctOptionId),
        `Question ${q.id} correctOptionId (${q.correctOptionId}) must exist in its options`,
      );

      for (const opt of q.options) {
        assert(opt.text.length > 0 && opt.text.length <= 100, `Option ${opt.id} text length`);
      }
    }

    // Verify template passes Zod validation
    const zodResult = CreateQuizSchema.safeParse({
      title: tmpl.title,
      description: tmpl.description,
      questions: tmpl.questions,
    });
    assert(zodResult.success, `Template ${tmpl.id} must pass CreateQuizSchema validation`);
  }
  console.log(" Passed: All templates contain 5-6 questions, 4 options each, valid correctOptionId, and pass Zod schema");

  // 3. getTemplateById
  const bf = getTemplateById("best-friends");
  assert.strictEqual(bf?.id, "best-friends");
  const unknownTmpl = getTemplateById("non-existent");
  assert.strictEqual(unknownTmpl, undefined);
  console.log(" Passed: getTemplateById retrieves valid template and handles misses");

  // 4. cn() utility tests
  assert.strictEqual(cn("base", undefined, false, null, "extra"), "base extra");
  assert.strictEqual(cn("btn", { "btn-primary": true, "btn-disabled": false }), "btn btn-primary");
  assert.strictEqual(cn(["text-sm", ["font-bold", false]]), "text-sm font-bold");
  console.log(" Passed: cn() utility correctly merges strings, falsy values, arrays, and objects");

  // 5. getFriendshipVerdict() tier boundary tests
  const v100 = getFriendshipVerdict(100);
  assert.strictEqual(v100.tier, "inner_circle");
  assert.strictEqual(v100.iconName, "Crown");

  const v90 = getFriendshipVerdict(90);
  assert.strictEqual(v90.tier, "inner_circle");

  const v85 = getFriendshipVerdict(85);
  assert.strictEqual(v85.tier, "certified_bestie");
  assert.strictEqual(v85.iconName, "HeartHandshake");

  const v70 = getFriendshipVerdict(70);
  assert.strictEqual(v70.tier, "certified_bestie");

  const v65 = getFriendshipVerdict(65);
  assert.strictEqual(v65.tier, "casual_friend");
  assert.strictEqual(v65.iconName, "Flame");

  const v40 = getFriendshipVerdict(40);
  assert.strictEqual(v40.tier, "casual_friend");

  const v35 = getFriendshipVerdict(35);
  assert.strictEqual(v35.tier, "strangers");
  assert.strictEqual(v35.iconName, "Sparkles");

  const v0 = getFriendshipVerdict(0);
  assert.strictEqual(v0.tier, "strangers");

  console.log(" Passed: getFriendshipVerdict properly maps all 4 score boundaries to correct tiers & Lucide icons");

  // =========================================================================
  // TASK-302: Public Quiz Loader & Security Invariants
  // =========================================================================
  console.log("\n--- [TASK-302] Public Quiz Loader Invariants ---");

  const quizCode = generateCode(8);
  const rawOwnerToken = "test-owner-token-secret-12345678901234567890";
  const ownerTokenHash = hashToken(rawOwnerToken);

  const testQuiz = await Quiz.create({
    code: quizCode,
    ownerTokenHash,
    title: "Alex's Friendship Test",
    description: "See if you really know Alex!",
    questions: [
      {
        id: "q_1",
        text: "What is my favorite sport?",
        type: "single",
        options: [
          { id: "opt_1", text: "Basketball" },
          { id: "opt_2", text: "Soccer" },
        ],
        correctOptionId: "opt_1",
      },
      {
        id: "q_2",
        text: "What is my favorite animal?",
        type: "single",
        options: [
          { id: "opt_3", text: "Dog" },
          { id: "opt_4", text: "Cat" },
        ],
        correctOptionId: "opt_3",
      },
      {
        id: "q_3",
        text: "What is my morning drink?",
        type: "single",
        options: [
          { id: "opt_5", text: "Matcha" },
          { id: "opt_6", text: "Espresso" },
        ],
        correctOptionId: "opt_6",
      },
    ],
    settings: {
      showScore: true,
      showCorrectAnswers: false,
      maxAttemptsPerPerson: 1,
    },
    stats: { views: 5, attempts: 2, shares: 1 },
    status: "active",
  });

  // Verify getPublicQuizByCode
  const publicQuiz = await getPublicQuizByCode(quizCode, { incrementViews: true });
  assert(publicQuiz !== null, "Public quiz must be found");
  assert.strictEqual(publicQuiz.code, quizCode);
  assert.strictEqual(publicQuiz.title, "Alex's Friendship Test");
  assert.strictEqual(publicQuiz.questions.length, 3);

  // CRITICAL INVARIANT: Zero Answer Key Leakage
  for (const q of publicQuiz.questions) {
    assert.strictEqual(
      (q as unknown as { correctOptionId?: string }).correctOptionId,
      undefined,
      "CRITICAL: correctOptionId must NEVER be returned in public quiz",
    );
  }
  assert.strictEqual(
    (publicQuiz as unknown as { ownerTokenHash?: string }).ownerTokenHash,
    undefined,
    "CRITICAL: ownerTokenHash must NEVER be returned in public quiz",
  );

  // Check view increment
  const refreshedQuiz = await Quiz.findById(testQuiz._id);
  assert.strictEqual(refreshedQuiz?.stats.views, 6, "View count must be atomically incremented");
  console.log(" Passed: getPublicQuizByCode strips all correctOptionId keys, strips ownerTokenHash, and increments views");

  // =========================================================================
  // TASK-303: Attempt Result Loader & Verification
  // =========================================================================
  console.log("\n--- [TASK-303] Attempt Result Loader Invariants ---");

  const attemptCode = generateCode(8);
  const clientIp = "192.168.1.50";
  const ipHash = hashIp(clientIp);

  await Attempt.create({
    code: attemptCode,
    quizId: testQuiz._id,
    nickname: "Jordan",
    answers: [
      { questionId: "q_1", optionId: "opt_1" },
      { questionId: "q_2", optionId: "opt_3" },
      { questionId: "q_3", optionId: "opt_5" }, // incorrect
    ],
    score: 2,
    total: 3,
    percentage: 67,
    metadata: {
      userAgent: "Mozilla/5.0 Test Agent",
      ipHash,
    },
  });

  // Verify getAttemptResultByCode
  const attemptResult = await getAttemptResultByCode(quizCode, attemptCode);
  assert(attemptResult !== null, "Attempt result must be found");
  assert.strictEqual(attemptResult.attemptCode, attemptCode);
  assert.strictEqual(attemptResult.quizCode, quizCode);
  assert.strictEqual(attemptResult.quizTitle, "Alex's Friendship Test");
  assert.strictEqual(attemptResult.nickname, "Jordan");
  assert.strictEqual(attemptResult.score, 2);
  assert.strictEqual(attemptResult.total, 3);
  assert.strictEqual(attemptResult.percentage, 67);

  // CRITICAL PRIVACY & SECURITY: No ipHash or userAgent leaked
  assert.strictEqual((attemptResult as unknown as { metadata?: unknown }).metadata, undefined);
  assert.strictEqual((attemptResult as unknown as { ipHash?: unknown }).ipHash, undefined);
  assert.strictEqual((attemptResult as unknown as { userAgent?: unknown }).userAgent, undefined);
  console.log(" Passed: getAttemptResultByCode securely loads result without leaking ipHash or userAgent");

  // Mismatched quizCode should return null
  const mismatchResult = await getAttemptResultByCode("wrong-code", attemptCode);
  assert.strictEqual(mismatchResult, null, "Mismatch quiz code must return null");

  // Missing attemptCode should return null
  const missingResult = await getAttemptResultByCode(quizCode, "missing99");
  assert.strictEqual(missingResult, null, "Missing attempt code must return null");
  console.log(" Passed: getAttemptResultByCode safely handles missing or mismatched codes");

  // Disconnect from MongoDB
  await mongoose.disconnect();
  console.log(" Disconnected from MongoDB");
  console.log("=== ALL PHASE 3 VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runPhase3Tests().catch((err) => {
  console.error("Phase 3 Verification Failed:", err);
  process.exit(1);
});
