import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const type = searchParams.get("type") || "home";
    const title = searchParams.get("title") || "LemonQuiz — Friendship Test";
    const nickname = searchParams.get("nickname") || "A Friend";
    const score = searchParams.get("score") || "";
    const total = searchParams.get("total") || "";
    const percentage = searchParams.get("percentage") || "";
    const verdict = searchParams.get("verdict") || "";
    const questionsCount = searchParams.get("questionsCount") || "6";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "60px 70px",
            backgroundColor: "#080816",
            backgroundImage:
              "radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.28) 0%, rgba(8, 8, 22, 1) 75%)",
            fontFamily: "system-ui, -apple-system, sans-serif",
            color: "#F8FAFC",
            border: "2px solid rgba(139, 92, 246, 0.35)",
            boxSizing: "border-box",
          }}
        >
          {/* Top Brand Bar */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
              }}
            >
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  backgroundColor: "rgba(139, 92, 246, 0.25)",
                  border: "1.5px solid rgba(168, 85, 247, 0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#C084FC",
                  fontSize: "26px",
                  fontWeight: 900,
                }}
              >
                L
              </div>
              <div
                style={{
                  fontSize: "30px",
                  fontWeight: 900,
                  letterSpacing: "-0.03em",
                  color: "#F8FAFC",
                }}
              >
                Lemon<span style={{ color: "#A855F7" }}>Quiz</span>
              </div>
            </div>

            {/* Type badge */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                padding: "8px 18px",
                borderRadius: "9999px",
                backgroundColor: "rgba(139, 92, 246, 0.15)",
                border: "1px solid rgba(139, 92, 246, 0.4)",
                color: "#E2E8F0",
                fontSize: "16px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {type === "result"
                ? "Friendship Score"
                : type === "quiz"
                  ? "Friendship Challenge"
                  : type === "manage"
                    ? "Owner Dashboard"
                    : "Social Challenge"}
            </div>
          </div>

          {/* Central Hero Body */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              maxWidth: "1000px",
            }}
          >
            {type === "result" ? (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "40px",
                }}
              >
                {/* Large score badge */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "180px",
                    height: "180px",
                    borderRadius: "32px",
                    backgroundColor: "rgba(139, 92, 246, 0.2)",
                    border: "2px solid rgba(168, 85, 247, 0.6)",
                    boxShadow: "0 0 50px rgba(139, 92, 246, 0.3)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "64px",
                      fontWeight: 900,
                      color: "#FFFFFF",
                      lineHeight: 1,
                    }}
                  >
                    {percentage || (score && total ? Math.round((Number(score) / Number(total)) * 100) : "80")}%
                  </div>
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#CBD5E1",
                      marginTop: "6px",
                    }}
                  >
                    {score && total ? `${score} / ${total} Correct` : "Score"}
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "44px",
                      fontWeight: 900,
                      color: "#F8FAFC",
                      letterSpacing: "-0.02em",
                      lineHeight: 1.15,
                    }}
                  >
                    {nickname} tested their bond!
                  </div>
                  <div
                    style={{
                      fontSize: "26px",
                      fontWeight: 600,
                      color: "#C084FC",
                    }}
                  >
                    {verdict ? `Rating: ${verdict}` : `Quiz: "${title}"`}
                  </div>
                </div>
              </div>
            ) : type === "quiz" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                  }}
                >
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 800,
                      color: "#A855F7",
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                    }}
                  >
                    {questionsCount} Questions • 60 Seconds
                  </span>
                </div>
                <div
                  style={{
                    fontSize: "52px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                  }}
                >
                  {title}
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 500,
                    color: "#94A3B8",
                  }}
                >
                  How well do your friends really know you? Take the test and see where you rank!
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "16px",
                }}
              >
                <div
                  style={{
                    fontSize: "56px",
                    fontWeight: 900,
                    color: "#FFFFFF",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.1,
                  }}
                >
                  How well do your friends really know you?
                </div>
                <div
                  style={{
                    fontSize: "24px",
                    fontWeight: 500,
                    color: "#CBD5E1",
                    maxWidth: "850px",
                  }}
                >
                  Create your custom friendship test in 60s, share on WhatsApp & Instagram, and inspect the live leaderboard.
                </div>
              </div>
            )}
          </div>

          {/* Footer Callout */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              paddingTop: "24px",
              borderTop: "1px solid rgba(139, 92, 246, 0.2)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "20px",
              }}
            >
              <div
                style={{
                  padding: "8px 20px",
                  borderRadius: "12px",
                  backgroundColor: "#8B5CF6",
                  color: "#FFFFFF",
                  fontSize: "18px",
                  fontWeight: 800,
                  letterSpacing: "-0.01em",
                }}
              >
                Play Free • Zero Login
              </div>
              <div
                style={{
                  fontSize: "18px",
                  color: "#94A3B8",
                  fontWeight: 600,
                }}
              >
                Instant Results • Private Leaderboard
              </div>
            </div>

            <div
              style={{
                fontSize: "18px",
                color: "#CBD5E1",
                fontWeight: 700,
                letterSpacing: "0.02em",
              }}
            >
              lemonquiz.app
            </div>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        headers: {
          "Cache-Control":
            "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
        },
      },
    );
  } catch (error) {
    console.error("OG Image generation error:", error);
    return new Response("Failed to generate OpenGraph image", { status: 500 });
  }
}
