import assert from "node:assert";
import mongoose from "mongoose";
import { Quiz } from "@/models/Quiz";
import { Attempt } from "@/models/Attempt";
import {
  getOwnerQuizByToken,
  getQuizAttemptsForOwner,
  getQuizzesByOwnerTokens,
} from "@/lib/quiz";
import {
  UpdateQuizStatusSchema,
  SyncOwnerQuizzesSchema,
} from "@/lib/validation";
import { generateCode, generateOwnerToken, hashToken } from "@/lib/tokens";
import { PATCH as updateQuizStatusPatch } from "@/app/api/quizzes/[quizCode]/route";
import { POST as myQuizzesPost } from "@/app/api/quizzes/my-quizzes/route";

process.env.MONGODB_URI = "mongodb://127.0.0.1:27018/lemon-quiz-test";
process.env.SALT = "test-salt-secret";
process.env.TOKEN_SALT = "test-salt-secret";

async function runPhase4BackendTests() {
  console.log("=== STARTING PHASE 4 BACKEND FOUNDATIONS VERIFICATION SUITE ===");

  await mongoose.connect(process.env.MONGODB_URI as string);
  console.log(" Connected to MongoDB Test Database");

  await Quiz.deleteMany({});
  await Attempt.deleteMany({});
  console.log(" Cleaned test collections");

  // =========================================================================
  // TEST 1: Zod Schemas Validation
  // =========================================================================
  console.log("\n--- [TEST 1] Validation Schemas ---");
  {
    // UpdateQuizStatusSchema
    const validStatus = UpdateQuizStatusSchema.safeParse({
      ownerToken: "valid-owner-token",
      status: "disabled",
    });
    assert.strictEqual(validStatus.success, true, "Valid status should pass");

    const invalidStatus = UpdateQuizStatusSchema.safeParse({
      ownerToken: "valid-owner-token",
      status: "archived", // not allowed in enum
    });
    assert.strictEqual(invalidStatus.success, false, "Invalid status enum must fail");

    const emptyToken = UpdateQuizStatusSchema.safeParse({
      ownerToken: "   ",
      status: "active",
    });
    assert.strictEqual(emptyToken.success, false, "Empty token must fail");

    // SyncOwnerQuizzesSchema
    const validTokens = SyncOwnerQuizzesSchema.safeParse({
      tokens: ["token-1", "token-2"],
    });
    assert.strictEqual(validTokens.success, true, "Valid tokens array should pass");

    const emptyTokens = SyncOwnerQuizzesSchema.safeParse({
      tokens: [],
    });
    assert.strictEqual(emptyTokens.success, true, "Empty tokens array should pass");

    const over50Tokens = SyncOwnerQuizzesSchema.safeParse({
      tokens: Array.from({ length: 51 }, (_, i) => `token-${i}`),
    });
    assert.strictEqual(over50Tokens.success, false, "Over 50 tokens must fail");

    console.log(" Passed: UpdateQuizStatusSchema and SyncOwnerQuizzesSchema validations");
  }

  // =========================================================================
  // TEST 2: getOwnerQuizByToken Query Function
  // =========================================================================
  console.log("\n--- [TEST 2] getOwnerQuizByToken Query ---");
  {
    const rawOwnerToken = generateOwnerToken();
    const hashedOwnerToken = hashToken(rawOwnerToken);
    const quizCode = generateCode(8);

    await Quiz.create({
      code: quizCode,
      ownerTokenHash: hashedOwnerToken,
      title: "Bestie Trivia",
      description: "How well do you know me?",
      status: "active",
      stats: { attempts: 2, shares: 1, views: 5 },
      questions: [
        {
          id: "q1",
          text: "What is my favorite snack?",
          type: "single",
          options: [
            { id: "opt1", text: "Chips" },
            { id: "opt2", text: "Ice cream" },
          ],
          correctOptionId: "opt2",
        },
        {
          id: "q2",
          text: "Where would I travel?",
          type: "single",
          options: [
            { id: "opt3", text: "Tokyo" },
            { id: "opt4", text: "Paris" },
          ],
          correctOptionId: "opt3",
        },
        {
          id: "q3",
          text: "Morning or night?",
          type: "single",
          options: [
            { id: "opt5", text: "Morning" },
            { id: "opt6", text: "Night" },
          ],
          correctOptionId: "opt6",
        },
      ],
    });

    // Valid lookup
    const ownerQuiz = await getOwnerQuizByToken(rawOwnerToken);
    assert.ok(ownerQuiz, "Owner quiz must be retrieved");
    assert.strictEqual(ownerQuiz.code, quizCode);
    assert.strictEqual(ownerQuiz.title, "Bestie Trivia");
    assert.strictEqual(ownerQuiz.description, "How well do you know me?");
    assert.strictEqual(ownerQuiz.status, "active");
    assert.strictEqual(ownerQuiz.stats.attempts, 2);

    // CRITICAL: Owner must see correctOptionId for review
    assert.strictEqual(ownerQuiz.questions[0].correctOptionId, "opt2");
    assert.strictEqual(ownerQuiz.questions[1].correctOptionId, "opt3");
    assert.strictEqual(ownerQuiz.questions[2].correctOptionId, "opt6");

    // CRITICAL: ownerTokenHash must NOT be in returned object
    assert.strictEqual((ownerQuiz as unknown as Record<string, unknown>).ownerTokenHash, undefined);

    // Invalid / missing token
    const wrongQuiz = await getOwnerQuizByToken("non-existent-token");
    assert.strictEqual(wrongQuiz, null, "Wrong token must return null");

    const nullQuiz = await getOwnerQuizByToken("");
    assert.strictEqual(nullQuiz, null, "Empty token must return null");

    console.log(" Passed: getOwnerQuizByToken properly retrieves quiz with answers and strips hash");
  }

  // =========================================================================
  // TEST 3: getQuizAttemptsForOwner Query Function
  // =========================================================================
  console.log("\n--- [TEST 3] getQuizAttemptsForOwner Leaderboard & History ---");
  {
    const rawOwnerToken = generateOwnerToken();
    const quizCode = generateCode(8);

    const quiz = await Quiz.create({
      code: quizCode,
      ownerTokenHash: hashToken(rawOwnerToken),
      title: "History Test Quiz",
      questions: [
        {
          id: "q1",
          text: "Q1",
          type: "single",
          options: [
            { id: "o1", text: "A" },
            { id: "o2", text: "B" },
          ],
          correctOptionId: "o1",
        },
        {
          id: "q2",
          text: "Q2",
          type: "single",
          options: [
            { id: "o3", text: "C" },
            { id: "o4", text: "D" },
          ],
          correctOptionId: "o3",
        },
        {
          id: "q3",
          text: "Q3",
          type: "single",
          options: [
            { id: "o5", text: "E" },
            { id: "o6", text: "F" },
          ],
          correctOptionId: "o5",
        },
      ],
    });

    // Test with zero attempts
    const emptyResult = await getQuizAttemptsForOwner(quiz._id);
    assert.strictEqual(emptyResult.leaderboard.length, 0);
    assert.strictEqual(emptyResult.history.length, 0);
    assert.strictEqual(emptyResult.averageScore, 0);

    // Create 3 attempts with timestamps
    const now = Date.now();
    await Attempt.create({
      code: "att1",
      quizId: quiz._id,
      nickname: "Alice",
      answers: [{ questionId: "q1", optionId: "o1" }],
      score: 1,
      total: 3,
      percentage: 33,
      createdAt: new Date(now - 3000),
    });

    await Attempt.create({
      code: "att2",
      quizId: quiz._id,
      nickname: "Bob",
      answers: [
        { questionId: "q1", optionId: "o1" },
        { questionId: "q2", optionId: "o3" },
        { questionId: "q3", optionId: "o5" },
      ],
      score: 3,
      total: 3,
      percentage: 100,
      createdAt: new Date(now - 2000),
    });

    await Attempt.create({
      code: "att3",
      quizId: quiz._id,
      nickname: "Charlie",
      answers: [
        { questionId: "q1", optionId: "o1" },
        { questionId: "q2", optionId: "o3" },
      ],
      score: 2,
      total: 3,
      percentage: 67,
      createdAt: new Date(now - 1000),
    });

    const result = await getQuizAttemptsForOwner(quiz._id);

    // Leaderboard sorted by score descending: Bob (3), Charlie (2), Alice (1)
    assert.strictEqual(result.leaderboard.length, 3);
    assert.strictEqual(result.leaderboard[0].nickname, "Bob");
    assert.strictEqual(result.leaderboard[0].score, 3);
    assert.strictEqual(result.leaderboard[1].nickname, "Charlie");
    assert.strictEqual(result.leaderboard[1].score, 2);
    assert.strictEqual(result.leaderboard[2].nickname, "Alice");
    assert.strictEqual(result.leaderboard[2].score, 1);

    // History sorted by createdAt descending: Charlie, Bob, Alice
    assert.strictEqual(result.history.length, 3);
    assert.strictEqual(result.history[0].nickname, "Charlie");
    assert.strictEqual(result.history[1].nickname, "Bob");
    assert.strictEqual(result.history[2].nickname, "Alice");

    // History includes answers
    assert.strictEqual(result.history[0].answers.length, 2);

    // Average percentage: Math.round((33 + 100 + 67) / 3) = Math.round(200 / 3) = 67
    assert.strictEqual(result.averageScore, 67);

    console.log(" Passed: getQuizAttemptsForOwner returns correctly sorted leaderboard, history, and average");
  }

  // =========================================================================
  // TEST 4: getQuizzesByOwnerTokens Query Function
  // =========================================================================
  console.log("\n--- [TEST 4] getQuizzesByOwnerTokens Multi-Quiz Hub ---");
  {
    const tokenA = generateOwnerToken();
    const tokenB = generateOwnerToken();
    const tokenUnused = generateOwnerToken();

    const quizA = await Quiz.create({
      code: generateCode(8),
      ownerTokenHash: hashToken(tokenA),
      title: "Quiz Alpha",
      status: "active",
      questions: [
        { id: "q1", text: "Q1", options: [{ id: "1", text: "A" }, { id: "2", text: "B" }], correctOptionId: "1" },
        { id: "q2", text: "Q2", options: [{ id: "3", text: "C" }, { id: "4", text: "D" }], correctOptionId: "3" },
        { id: "q3", text: "Q3", options: [{ id: "5", text: "E" }, { id: "6", text: "F" }], correctOptionId: "5" },
      ],
    });

    const quizB = await Quiz.create({
      code: generateCode(8),
      ownerTokenHash: hashToken(tokenB),
      title: "Quiz Beta",
      status: "disabled",
      questions: [
        { id: "q1", text: "Q1", options: [{ id: "1", text: "A" }, { id: "2", text: "B" }], correctOptionId: "1" },
        { id: "q2", text: "Q2", options: [{ id: "3", text: "C" }, { id: "4", text: "D" }], correctOptionId: "3" },
        { id: "q3", text: "Q3", options: [{ id: "5", text: "E" }, { id: "6", text: "F" }], correctOptionId: "5" },
      ],
    });

    const summaries = await getQuizzesByOwnerTokens([tokenA, tokenB, tokenUnused]);
    assert.strictEqual(summaries.length, 2, "Should return 2 matching quizzes");

    const summaryA = summaries.find((s) => s.code === quizA.code);
    assert.ok(summaryA);
    assert.strictEqual(summaryA.title, "Quiz Alpha");
    assert.strictEqual(summaryA.status, "active");
    assert.strictEqual(summaryA.ownerToken, tokenA, "Must map back to raw tokenA");

    const summaryB = summaries.find((s) => s.code === quizB.code);
    assert.ok(summaryB);
    assert.strictEqual(summaryB.title, "Quiz Beta");
    assert.strictEqual(summaryB.status, "disabled");
    assert.strictEqual(summaryB.ownerToken, tokenB, "Must map back to raw tokenB");

    // Empty tokens list
    const emptySummaries = await getQuizzesByOwnerTokens([]);
    assert.strictEqual(emptySummaries.length, 0);

    console.log(" Passed: getQuizzesByOwnerTokens maps quizzes correctly to raw tokens");
  }

  // =========================================================================
  // TEST 5: PATCH /api/quizzes/[quizCode] Route Handler
  // =========================================================================
  console.log("\n--- [TEST 5] PATCH /api/quizzes/[quizCode] Status Toggle ---");
  {
    const rawOwnerToken = generateOwnerToken();
    const quizCode = generateCode(8);

    await Quiz.create({
      code: quizCode,
      ownerTokenHash: hashToken(rawOwnerToken),
      title: "Toggle Status Quiz",
      status: "active",
      questions: [
        { id: "q1", text: "Q1", options: [{ id: "1", text: "A" }, { id: "2", text: "B" }], correctOptionId: "1" },
        { id: "q2", text: "Q2", options: [{ id: "3", text: "C" }, { id: "4", text: "D" }], correctOptionId: "3" },
        { id: "q3", text: "Q3", options: [{ id: "5", text: "E" }, { id: "6", text: "F" }], correctOptionId: "5" },
      ],
    });

    // 1. Unauthorized attempt (wrong token)
    const unauthorizedReq = new Request(`http://localhost/api/quizzes/${quizCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerToken: "wrong-owner-token",
        status: "disabled",
      }),
    });
    const unauthorizedRes = await updateQuizStatusPatch(unauthorizedReq, {
      params: Promise.resolve({ quizCode }),
    });
    assert.strictEqual(unauthorizedRes.status, 403, "Mismatched token must return 403");
    const unauthorizedData = await unauthorizedRes.json();
    assert.strictEqual(unauthorizedData.error, "Invalid owner token");

    // 2. Successful toggle to disabled
    const disableReq = new Request(`http://localhost/api/quizzes/${quizCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerToken: rawOwnerToken,
        status: "disabled",
      }),
    });
    const disableRes = await updateQuizStatusPatch(disableReq, {
      params: Promise.resolve({ quizCode }),
    });
    assert.strictEqual(disableRes.status, 200, "Valid PATCH must return 200");
    const disableData = await disableRes.json();
    assert.strictEqual(disableData.success, true);
    assert.strictEqual(disableData.data.status, "disabled");

    // Verify DB updated
    const updatedQuiz = await Quiz.findOne({ code: quizCode }).lean();
    assert.strictEqual(updatedQuiz?.status, "disabled");

    // 3. Successful toggle back to active
    const activeReq = new Request(`http://localhost/api/quizzes/${quizCode}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerToken: rawOwnerToken,
        status: "active",
      }),
    });
    const activeRes = await updateQuizStatusPatch(activeReq, {
      params: Promise.resolve({ quizCode }),
    });
    assert.strictEqual(activeRes.status, 200);
    const activeData = await activeRes.json();
    assert.strictEqual(activeData.data.status, "active");

    // 4. Non-existent quiz code
    const notFoundReq = new Request("http://localhost/api/quizzes/nonexistent", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ownerToken: rawOwnerToken,
        status: "disabled",
      }),
    });
    const notFoundRes = await updateQuizStatusPatch(notFoundReq, {
      params: Promise.resolve({ quizCode: "nonexistent" }),
    });
    assert.strictEqual(notFoundRes.status, 404, "Non-existent quiz must return 404");

    console.log(" Passed: PATCH route handler enforces capability security and updates status");
  }

  // =========================================================================
  // TEST 6: POST /api/quizzes/my-quizzes Route Handler
  // =========================================================================
  console.log("\n--- [TEST 6] POST /api/quizzes/my-quizzes Route Handler ---");
  {
    const token = generateOwnerToken();
    const quizCode = generateCode(8);

    await Quiz.create({
      code: quizCode,
      ownerTokenHash: hashToken(token),
      title: "My Quizzes API Test",
      status: "active",
      questions: [
        { id: "q1", text: "Q1", options: [{ id: "1", text: "A" }, { id: "2", text: "B" }], correctOptionId: "1" },
        { id: "q2", text: "Q2", options: [{ id: "3", text: "C" }, { id: "4", text: "D" }], correctOptionId: "3" },
        { id: "q3", text: "Q3", options: [{ id: "5", text: "E" }, { id: "6", text: "F" }], correctOptionId: "5" },
      ],
    });

    // Valid POST request
    const req = new Request("http://localhost/api/quizzes/my-quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tokens: [token],
      }),
    });

    const res = await myQuizzesPost(req);
    assert.strictEqual(res.status, 200, "Valid POST /api/quizzes/my-quizzes must return 200");
    const json = await res.json();
    assert.strictEqual(json.success, true);
    assert.strictEqual(json.data.length, 1);
    assert.strictEqual(json.data[0].code, quizCode);
    assert.strictEqual(json.data[0].ownerToken, token);

    // Invalid body (missing tokens)
    const invalidReq = new Request("http://localhost/api/quizzes/my-quizzes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const invalidRes = await myQuizzesPost(invalidReq);
    assert.strictEqual(invalidRes.status, 400);

    console.log(" Passed: POST /api/quizzes/my-quizzes successfully validates and returns owner quizzes");
  }

  await mongoose.disconnect();
  console.log("\n=== ALL PHASE 4 BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY! ===");
}

runPhase4BackendTests().catch((err) => {
  console.error("Test failure:", err);
  process.exit(1);
});
