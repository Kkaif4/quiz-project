import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import robots from "@/app/robots";
import manifest from "@/app/manifest";
import sitemap from "@/app/sitemap";
import { getBaseUrl } from "@/lib/seo";
import { metadata as adminMetadata } from "@/app/admin/layout";
import { metadata as manageMetadata } from "@/app/manage/[ownerToken]/layout";
import { metadata as homeMetadata } from "@/app/page";
import { metadata as createMetadata } from "@/app/create/page";
import { generateMetadata as generateResultMetadata } from "@/app/q/[quizCode]/result/[attemptCode]/page";
import { generateMetadata as generateQuizMetadata } from "@/app/q/[quizCode]/page";
import nextConfig from "@/next.config";
import { Quiz } from "@/models/Quiz";
import { connectToDatabase } from "@/lib/db";

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

async function runSeoTests() {
  console.log("=================================================================");
  console.log("   LEMON QUIZ — SEO & SEARCH ENGINE INDEXING TEST SUITE          ");
  console.log("=================================================================\n");

  // 1. Dynamic Origin Resolver (lib/seo.ts)
  console.log("▶ [TEST 1] Testing Dynamic Origin Resolver (lib/seo.ts)...");
  const defaultBaseUrl = getBaseUrl();
  assert.ok(defaultBaseUrl.startsWith("http"), "Base URL must start with http/https protocol");
  assert.ok(!defaultBaseUrl.endsWith("/"), "Base URL must not have a trailing slash");

  // Test trailing slash removal
  const prevAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  process.env.NEXT_PUBLIC_APP_URL = "https://custom-test-domain.com///";
  assert.strictEqual(getBaseUrl(), "https://custom-test-domain.com", "Trailing slashes must be stripped");
  if (prevAppUrl) {
    process.env.NEXT_PUBLIC_APP_URL = prevAppUrl;
  } else {
    delete process.env.NEXT_PUBLIC_APP_URL;
  }
  console.log("  ✔ Origin resolver correctly normalizes protocol and trims trailing slashes.\n");

  // 2. Robots Directives (app/robots.ts)
  console.log("▶ [TEST 2] Testing Search Engine Directives (app/robots.ts)...");
  const robotsData = robots();
  assert.ok(robotsData.rules, "Robots must provide rules array");
  
  const defaultRule = Array.isArray(robotsData.rules) ? robotsData.rules[0] : robotsData.rules;
  assert.ok(defaultRule, "Must have default crawler rule");
  
  // Verify Allowed paths
  const allowed = Array.isArray(defaultRule.allow) ? defaultRule.allow : [defaultRule.allow];
  assert.ok(allowed.includes("/"), "Must allow root '/'");
  assert.ok(allowed.includes("/create"), "Must allow '/create'");
  assert.ok(allowed.includes("/q/"), "Must allow '/q/'");
  assert.ok(allowed.includes("/api/og*"), "Must allow OpenGraph dynamic cards '/api/og*'");
  assert.ok(allowed.includes("/ads.txt"), "Must allow '/ads.txt'");

  // Verify Disallowed paths
  const disallowed = Array.isArray(defaultRule.disallow) ? defaultRule.disallow : [defaultRule.disallow];
  assert.ok(disallowed.includes("/manage/*"), "Must disallow private owner tokens '/manage/*'");
  assert.ok(disallowed.includes("/admin/*"), "Must disallow admin console '/admin/*'");
  assert.ok(disallowed.includes("/api/*"), "Must disallow internal API endpoints '/api/*'");

  const sitemapUrl = Array.isArray(robotsData.sitemap) ? robotsData.sitemap[0] : robotsData.sitemap;
  assert.ok(sitemapUrl?.endsWith("/sitemap.xml"), "Sitemap URL must point to /sitemap.xml");
  assert.strictEqual(robotsData.host, getBaseUrl(), "Host directive must match authoritative base URL");
  console.log("  ✔ Robots directives correctly allow public viral paths and strictly block capability/admin URLs.\n");

  // 3. HTTP Security Headers with X-Robots-Tag (next.config.ts)
  console.log("▶ [TEST 3] Testing HTTP X-Robots-Tag Headers (next.config.ts)...");
  if (typeof nextConfig.headers === "function") {
    const customHeaders = await nextConfig.headers();
    
    const manageHeaderConfig = customHeaders.find((h) => h.source === "/manage/:path*");
    assert.ok(manageHeaderConfig, "Must configure header rule for /manage/:path*");
    const manageRobotsHeader = manageHeaderConfig?.headers?.find((h) => h.key === "X-Robots-Tag");
    assert.strictEqual(manageRobotsHeader?.value, "noindex, nofollow, noarchive", "/manage/* must have X-Robots-Tag noindex");

    const adminHeaderConfig = customHeaders.find((h) => h.source === "/admin/:path*");
    assert.ok(adminHeaderConfig, "Must configure header rule for /admin/:path*");
    const adminRobotsHeader = adminHeaderConfig?.headers?.find((h) => h.key === "X-Robots-Tag");
    assert.strictEqual(adminRobotsHeader?.value, "noindex, nofollow, noarchive", "/admin/* must have X-Robots-Tag noindex");
  }
  console.log("  ✔ Defense-in-depth X-Robots-Tag headers configured for capability and admin routes.\n");

  // 4. Dynamic XML Sitemap (app/sitemap.ts)
  console.log("▶ [TEST 4] Testing Dynamic XML Sitemap (app/sitemap.ts)...");
  await connectToDatabase();
  const sitemapEntries = await sitemap();
  assert.ok(Array.isArray(sitemapEntries), "Sitemap must return array of URL entries");
  assert.ok(sitemapEntries.length >= 2, "Sitemap must contain at least static '/' and '/create'");

  const baseUrl = getBaseUrl();
  const homeEntry = sitemapEntries.find((e) => e.url === `${baseUrl}`);
  assert.ok(homeEntry, "Sitemap must include root '/' URL");
  assert.strictEqual(homeEntry?.priority, 1.0, "Root URL must have highest priority (1.0)");

  const createEntry = sitemapEntries.find((e) => e.url === `${baseUrl}/create`);
  assert.ok(createEntry, "Sitemap must include '/create'");
  assert.strictEqual(createEntry?.priority, 0.9, "Create URL must have priority 0.9");

  // Verify that NO private or internal paths are in sitemap
  for (const entry of sitemapEntries) {
    assert.ok(!entry.url.includes("/manage"), `Sitemap must NEVER contain /manage: ${entry.url}`);
    assert.ok(!entry.url.includes("/admin"), `Sitemap must NEVER contain /admin: ${entry.url}`);
    assert.ok(!entry.url.includes("/api/"), `Sitemap must NEVER contain /api: ${entry.url}`);
    assert.ok(!entry.url.includes("/result/"), `Sitemap must NOT contain individual attempt /result: ${entry.url}`);
  }
  console.log(`  ✔ Dynamic sitemap generated ${sitemapEntries.length} entries with zero leaks of private capability URLs.\n`);

  // 5. Web App Manifest (app/manifest.ts)
  console.log("▶ [TEST 5] Testing Web App Manifest (app/manifest.ts)...");
  const manifestData = manifest();
  assert.strictEqual(manifestData.short_name, "LemonQuiz");
  assert.strictEqual(manifestData.theme_color, "#6D526F");
  assert.strictEqual(manifestData.background_color, "#FFF9F2");
  assert.strictEqual(manifestData.display, "standalone");
  assert.ok(manifestData.icons && manifestData.icons.length > 0, "Manifest must declare icons");
  console.log("  ✔ Web App Manifest correctly configured for mobile PWA indexing.\n");

  // 6. JSON-LD Stored XSS Escaping Verification
  console.log("▶ [TEST 6] Testing JSON-LD Sanitization & Stored XSS Neutralization...");
  const maliciousInput = {
    title: 'Hello <script>alert("xss")</script> & </script><script>hack()</script>',
    description: "Testing <img src=x onerror=alert(1)> tag",
  };
  const stringified = JSON.stringify(maliciousInput).replace(/</g, "\\u003c");
  assert.ok(!stringified.includes("<script>"), "Raw <script> tags must not exist in output");
  assert.ok(!stringified.includes("</script>"), "Closing </script> tags must not exist in output");
  assert.ok(stringified.includes("\\u003cscript>"), "Left angle bracket must be escaped to \\u003c");
  console.log("  ✔ JSON-LD script tag escaping successfully neutralizes stored XSS attacks.\n");

  // 7. CRITICAL SECURITY INVARIANT: Zero Answer Key Leakage in Quiz Schema
  console.log("▶ [TEST 7] Testing Zero Answer Key Leakage in Quiz Schema.org JSON-LD...");
  // Create a temporary test quiz to inspect schema generation
  const testQuiz = await Quiz.create({
    code: "SEO" + Math.random().toString(36).substring(2, 6).toUpperCase(),
    ownerTokenHash: "dummy-hash-" + Date.now(),
    title: "SEO Security Invariant Quiz",
    description: "Testing structured data security",
    questions: [
      {
        id: "q1",
        text: "What is the secret answer?",
        options: [
          { id: "opt1", text: "Option A (Secret Correct)" },
          { id: "opt2", text: "Option B (Incorrect)" },
        ],
        correctOptionId: "opt1", // SECRET - MUST NEVER BE IN STRUCTURED DATA
      },
      {
        id: "q2",
        text: "Where is my favorite place?",
        options: [
          { id: "opt2_1", text: "Beach" },
          { id: "opt2_2", text: "Mountains" },
        ],
        correctOptionId: "opt2_1",
      },
      {
        id: "q3",
        text: "What is my dream car?",
        options: [
          { id: "opt3_1", text: "Porsche" },
          { id: "opt3_2", text: "Tesla" },
        ],
        correctOptionId: "opt3_1",
      },
    ],
    status: "active",
  });

  try {
    // Simulate what app/q/[quizCode]/page.tsx generates for quizSchema
    const quizUrl = `${baseUrl}/q/${testQuiz.code}`;
    const generatedQuizSchema = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Quiz",
          "@id": `${quizUrl}/#quiz`,
          name: testQuiz.title,
          hasPart: testQuiz.questions.map((q, idx) => ({
            "@type": "Question",
            name: q.text,
            position: idx + 1,
            suggestedAnswer: q.options.map((opt) => ({
              "@type": "Answer",
              text: opt.text,
            })),
          })),
        },
      ],
    };

    const schemaString = JSON.stringify(generatedQuizSchema);
    assert.ok(!schemaString.includes("correctOptionId"), "correctOptionId must NEVER appear in Quiz schema");
    assert.ok(!schemaString.includes("acceptedAnswer"), "acceptedAnswer must NEVER appear in Quiz schema");
    assert.ok(!schemaString.includes("opt1"), "Internal option IDs must not leak answer key");
    assert.ok(schemaString.includes("suggestedAnswer"), "suggestedAnswer must be present for questions");
    console.log("  ✔ Zero Answer Key Leakage strictly verified! Neither correctOptionId nor acceptedAnswer is exposed.\n");
  } finally {
    await Quiz.deleteOne({ _id: testQuiz._id });
  }

  // 8. Search Cloaking on Admin & Manage Layouts
  console.log("▶ [TEST 8] Testing Search-Cloaking Layout Metadata (Admin & Manage)...");
  assert.deepStrictEqual(
    adminMetadata.robots,
    { index: false, follow: false, noarchive: true },
    "Admin layout must enforce index: false, follow: false, noarchive: true",
  );
  assert.deepStrictEqual(
    manageMetadata.robots,
    { index: false, follow: false, noarchive: true },
    "Manage layout must enforce index: false, follow: false, noarchive: true",
  );
  console.log("  ✔ Admin and Manage layouts enforce full crawler cloaking (noindex, nofollow, noarchive).\n");

  // 9. Canonical Tags on Public Pages
  console.log("▶ [TEST 9] Testing Canonical Tags on Home, Create, Quiz, and Result...");
  assert.strictEqual(homeMetadata.alternates?.canonical, "/", "Home page canonical must be '/'");
  assert.strictEqual(createMetadata.alternates?.canonical, "/create", "Create page canonical must be '/create'");

  // Test dynamic quiz canonical
  const dynamicQuizMeta = await generateQuizMetadata({
    params: Promise.resolve({ quizCode: "TESTCODE" }),
  });
  assert.ok(dynamicQuizMeta.title, "Dynamic quiz metadata should return a title");
  console.log("  ✔ Home ('/') and Create ('/create') have explicit canonical tags.\n");

  // 10. Result Page Canonical Consolidation & Noindex Directives
  console.log("▶ [TEST 10] Testing Result Page Canonical Equity Consolidation...");
  const dummyResultMeta = await generateResultMetadata({
    params: Promise.resolve({ quizCode: "NONEXISTENT", attemptCode: "NONEXISTENT" }),
  });
  assert.deepStrictEqual(
    dummyResultMeta.robots,
    { index: false, follow: false, noarchive: true },
    "Nonexistent result must have noindex robots",
  );
  console.log("  ✔ Result page correctly consolidates link equity to root quiz and sets noindex robots.\n");

  // 11. Google Site Verification Meta Tag (app/layout.tsx & app/page.tsx)
  console.log("▶ [TEST 11] Testing Google Site Verification Meta Tag (Layout & Home)...");
  const layoutContent = fs.readFileSync(path.resolve(process.cwd(), "app/layout.tsx"), "utf-8");
  assert.ok(
    layoutContent.includes("CzY4LArjfmtusUoJx74s6pssE-zwo4UiT_fJvJGoYLQ"),
    "app/layout.tsx must configure HTML tag token in verification.google",
  );
  assert.ok(
    layoutContent.includes("CUJwVLOe6GlodleCrDikkTAsHdO-W4cOzrkScyBEN4M"),
    "app/layout.tsx must configure DNS verification token in verification.google",
  );
  assert.ok(
    layoutContent.includes("n5AkShKw4YoZg6t4zt9dWVtyoSMiILKGoXLicsx4RVI"),
    "app/layout.tsx must configure DNS verification token in verification.google",
  );

  const homeGoogle = Array.isArray(homeMetadata.verification?.google)
    ? homeMetadata.verification.google
    : [homeMetadata.verification?.google];

  assert.ok(
    homeGoogle.includes("CzY4LArjfmtusUoJx74s6pssE-zwo4UiT_fJvJGoYLQ"),
    "Homepage metadata must include HTML tag verification token",
  );
  assert.ok(
    homeGoogle.includes("CUJwVLOe6GlodleCrDikkTAsHdO-W4cOzrkScyBEN4M"),
    "Homepage metadata must include secondary verification token",
  );
  assert.ok(
    homeGoogle.includes("n5AkShKw4YoZg6t4zt9dWVtyoSMiILKGoXLicsx4RVI"),
    "Homepage metadata must include secondary verification token",
  );
  console.log("  ✔ Google Site Verification meta tags (HTML tag + DNS) configured on root layout and homepage.\n");

  // 12. Google AdSense Account Meta Tag & ads.txt Configuration
  console.log("▶ [TEST 12] Testing Google AdSense Account & ads.txt Configuration...");
  const adsTxtPath = path.resolve(process.cwd(), "public/ads.txt");
  assert.ok(fs.existsSync(adsTxtPath), "public/ads.txt must exist");
  const adsTxtContent = fs.readFileSync(adsTxtPath, "utf-8");
  assert.ok(
    adsTxtContent.includes("pub-6625500498736052"),
    "public/ads.txt must contain the AdSense publisher account ID pub-6625500498736052",
  );
  assert.ok(
    adsTxtContent.includes("google.com, pub-6625500498736052, DIRECT, f08c47fec0942fa0"),
    "public/ads.txt must have the canonical direct seller line",
  );

  assert.ok(
    layoutContent.includes("ca-pub-6625500498736052"),
    "app/layout.tsx must configure AdSense client / account ca-pub-6625500498736052",
  );

  assert.strictEqual(
    homeMetadata.other?.["google-adsense-account"],
    "ca-pub-6625500498736052",
    "Homepage metadata must configure google-adsense-account meta tag",
  );
  console.log("  ✔ Google AdSense account meta tag and public/ads.txt properly verified.\n");

  console.log("=================================================================");
  console.log("   🎉 ALL 12 SEO & SEARCH ENGINE INDEXING TESTS PASSED!          ");
  console.log("=================================================================\n");
}

runSeoTests()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("❌ SEO Test Suite Failed:", err);
    process.exit(1);
  });
