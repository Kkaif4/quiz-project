import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import { connectToDatabase } from "@/lib/db";
import { Quiz } from "@/models/Quiz";
import { User } from "@/models/User";
import { getMatchingOwnerToken } from "@/lib/quiz";
import { POST as createQuizPost } from "@/app/api/quizzes/route";
import { POST as identifyUserPost } from "@/app/api/users/identify/route";
import { POST as ownerCheckPost } from "@/app/api/quizzes/[quizCode]/owner-check/route";

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
        if (
          (val.startsWith('"') && val.endsWith('"')) ||
          (val.startsWith("'") && val.endsWith("'"))
        ) {
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

process.env.SALT = process.env.SALT || "lemon-quiz-development-salt";
process.env.TOKEN_SALT = process.env.TOKEN_SALT || "lemon-quiz-development-salt";

async function runOwnerFlowVerification() {
  console.log("=================================================================");
  console.log("   LEMON QUIZ — PHASE 10: OWNER RECOGNITION & ROUTING TESTS     ");
  console.log("=================================================================\n");

  await connectToDatabase();
  console.log("Connected to MongoDB Atlas\n");

  const testFingerprint = `test_fp_${Date.now()}`;
  const creatorName = "OwnerTesterAlex";

  // 1. Create a quiz with browser footprint
  console.log("--- [TEST 1] Create Quiz & Persist OwnerToken to User Profile ---");
  const createReq = new Request("http://localhost:3000/api/quizzes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "198.51.100.42",
    },
    body: JSON.stringify({
      creatorName,
      clientFingerprint: testFingerprint,
      title: "Alex's Friendship Test",
      description: "How well do you know Alex?",
      questions: [
        {
          id: "q1",
          text: "What is my favorite sport?",
          type: "single",
          options: [
            { id: "opt1", text: "Basketball" },
            { id: "opt2", text: "Soccer" },
          ],
          correctOptionId: "opt1",
        },
        {
          id: "q2",
          text: "What coffee do I drink?",
          type: "single",
          options: [
            { id: "opt1", text: "Cold brew" },
            { id: "opt2", text: "Latte" },
          ],
          correctOptionId: "opt2",
        },
        {
          id: "q3",
          text: "What is my favorite color?",
          type: "single",
          options: [
            { id: "opt1", text: "Purple" },
            { id: "opt2", text: "Blue" },
          ],
          correctOptionId: "opt1",
        },
      ],
      settings: {
        showScore: true,
        showCorrectAnswers: false,
        maxAttemptsPerPerson: 1,
      },
    }),
  });

  const createRes = await createQuizPost(createReq);
  assert.strictEqual(createRes.status, 201, "Expected 201 Created");
  const createData = await createRes.json();
  assert.strictEqual(createData.success, true);
  const { quizCode, ownerToken, manageUrl } = createData.data;

  assert.ok(quizCode, "Quiz code must be returned");
  assert.ok(ownerToken, "Raw owner token must be returned");
  assert.strictEqual(manageUrl, `/manage/${ownerToken}`);

  // Verify User document has ownerTokens array populated
  const savedUser = await User.findOne({ clientFingerprint: testFingerprint });
  assert.ok(savedUser, "User record must exist");
  assert.ok(
    savedUser.ownerTokens && savedUser.ownerTokens.includes(ownerToken),
    "user.ownerTokens must contain the newly generated ownerToken",
  );
  console.log("✔ Invariant Passed: User document contains ownerToken in ownerTokens array.\n");

  // 2. Identify user via blueprint and verify ownerToken hydration
  console.log("--- [TEST 2] Blueprint Identify Hydrates OwnerToken ---");
  const identifyReq = new Request("http://localhost:3000/api/users/identify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-forwarded-for": "198.51.100.42",
    },
    body: JSON.stringify({ clientFingerprint: testFingerprint }),
  });

  const identifyRes = await identifyUserPost(identifyReq);
  assert.strictEqual(identifyRes.status, 200);
  const identifyData = await identifyRes.json();
  assert.strictEqual(identifyData.success, true);
  assert.strictEqual(identifyData.data.user.name, creatorName);

  const userQuizzes = identifyData.data.quizzes;
  assert.ok(Array.isArray(userQuizzes) && userQuizzes.length > 0);
  const targetQuiz = userQuizzes.find((q: { code: string }) => q.code === quizCode);
  assert.ok(targetQuiz, "Created quiz must be in user's quiz list");
  assert.strictEqual(
    targetQuiz.ownerToken,
    ownerToken,
    "Target quiz must have hydrated ownerToken so Manage button displays",
  );
  console.log("✔ Invariant Passed: /api/users/identify returns hydrated ownerToken for creator.\n");

  // 3. Test getMatchingOwnerToken helper
  console.log("--- [TEST 3] getMatchingOwnerToken Verification ---");
  const matchedToken = await getMatchingOwnerToken(quizCode, [
    "invalid_token_1",
    ownerToken,
    "invalid_token_2",
  ]);
  assert.strictEqual(matchedToken, ownerToken, "Must match valid candidate ownerToken");

  const unMatchedToken = await getMatchingOwnerToken(quizCode, [
    "some_other_token_abc",
  ]);
  assert.strictEqual(unMatchedToken, null, "Must return null for non-owner tokens");
  console.log("✔ Invariant Passed: getMatchingOwnerToken accurately verifies ownership.\n");

  // 4. Test /api/quizzes/[quizCode]/owner-check route
  console.log("--- [TEST 4] POST /api/quizzes/[quizCode]/owner-check Verification ---");

  // A: Positive check with tokens
  const checkReqValid = new Request(
    `http://localhost:3000/api/quizzes/${quizCode}/owner-check`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.42",
      },
      body: JSON.stringify({ tokens: [ownerToken] }),
    },
  );
  const checkResValid = await ownerCheckPost(checkReqValid, {
    params: Promise.resolve({ quizCode }),
  });
  assert.strictEqual(checkResValid.status, 200);
  const checkDataValid = await checkResValid.json();
  assert.strictEqual(checkDataValid.success, true);
  assert.strictEqual(checkDataValid.data.isOwner, true);
  assert.strictEqual(checkDataValid.data.ownerToken, ownerToken);

  // B: Positive check with clientFingerprint (recovery)
  const checkReqFp = new Request(
    `http://localhost:3000/api/quizzes/${quizCode}/owner-check`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.42",
      },
      body: JSON.stringify({ clientFingerprint: testFingerprint }),
    },
  );
  const checkResFp = await ownerCheckPost(checkReqFp, {
    params: Promise.resolve({ quizCode }),
  });
  assert.strictEqual(checkResFp.status, 200);
  const checkDataFp = await checkResFp.json();
  assert.strictEqual(checkDataFp.success, true);
  assert.strictEqual(checkDataFp.data.isOwner, true);
  assert.strictEqual(checkDataFp.data.ownerToken, ownerToken);

  // C: Negative check with random token
  const checkReqInvalid = new Request(
    `http://localhost:3000/api/quizzes/${quizCode}/owner-check`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-forwarded-for": "198.51.100.42",
      },
      body: JSON.stringify({ tokens: ["unrelated_random_token_12345"] }),
    },
  );
  const checkResInvalid = await ownerCheckPost(checkReqInvalid, {
    params: Promise.resolve({ quizCode }),
  });
  assert.strictEqual(checkResInvalid.status, 200);
  const checkDataInvalid = await checkResInvalid.json();
  assert.strictEqual(checkDataInvalid.success, true);
  assert.strictEqual(checkDataInvalid.data.isOwner, false);
  assert.strictEqual(checkDataInvalid.data.ownerToken, null);

  console.log("✔ Invariant Passed: /api/quizzes/[quizCode]/owner-check validates tokens & blueprint safely.\n");

  // 5. Zero Answer Key Leakage invariant
  console.log("--- [TEST 5] Security Invariant: Zero Answer Key Leakage ---");
  const rawQuizJson = JSON.stringify(checkDataValid);
  assert.ok(
    !rawQuizJson.includes("correctOptionId"),
    "owner-check MUST NEVER return correctOptionId",
  );
  assert.ok(
    !rawQuizJson.includes("ownerTokenHash"),
    "owner-check MUST NEVER expose ownerTokenHash",
  );
  console.log("✔ Invariant Passed: Zero answer key & token hash leakage confirmed.\n");

  // Clean up test data
  await Quiz.deleteOne({ code: quizCode });
  await User.deleteOne({ clientFingerprint: testFingerprint });
  console.log("Cleaned up test quiz and user records.");

  console.log("=================================================================");
  console.log("   ALL PHASE 10 OWNER RECOGNITION CHECKS PASSED WITH 100%!       ");
  console.log("=================================================================\n");
}

runOwnerFlowVerification()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Owner flow test failed:", err);
    process.exit(1);
  });
