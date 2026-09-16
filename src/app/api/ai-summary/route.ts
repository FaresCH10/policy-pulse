import { NextResponse } from "next/server";

/**
 * Optional server-side AI summarisation.
 *
 * Design constraints, all enforced here rather than in the client:
 *
 *  - The API key is read from the server environment only. It is never returned
 *    to the browser and never embedded in a response.
 *  - The summary is grounded: the prompt contains the supplied source text and
 *    instructs the model to use nothing else.
 *  - The source URL is echoed back untouched so the UI can keep the link.
 *  - When no key is configured the route reports `available: false`. The UI then
 *    hides the feature entirely, so there is no button that fails.
 *  - Any upstream error degrades to `available: false` rather than a 500, so the
 *    core demo never depends on this route.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface SummaryRequest {
  sourceText?: unknown;
  sourceTitle?: unknown;
  sourceUrl?: unknown;
  jurisdiction?: unknown;
}

export function GET() {
  return NextResponse.json({
    available: isConfigured(),
    provider: process.env.AI_SUMMARY_PROVIDER ?? null,
    note: isConfigured()
      ? "Server-side summarisation is configured. Summaries are grounded in the supplied source text."
      : "No summarisation provider is configured. The feature is hidden in the interface.",
  });
}

export async function POST(request: Request) {
  if (!isConfigured()) {
    return NextResponse.json({
      available: false,
      reason: "not-configured",
      note: "AI summarisation is not enabled in this deployment.",
    });
  }

  let payload: SummaryRequest;
  try {
    payload = (await request.json()) as SummaryRequest;
  } catch {
    return NextResponse.json(
      { available: false, reason: "bad-request", note: "Expected a JSON body." },
      { status: 400 },
    );
  }

  const sourceText = typeof payload.sourceText === "string" ? payload.sourceText.trim() : "";
  const sourceTitle = typeof payload.sourceTitle === "string" ? payload.sourceTitle : "";
  const sourceUrl = typeof payload.sourceUrl === "string" ? payload.sourceUrl : "";
  const jurisdiction =
    typeof payload.jurisdiction === "string" ? payload.jurisdiction : "unspecified";

  if (sourceText.length < 40) {
    return NextResponse.json(
      {
        available: false,
        reason: "insufficient-source",
        note: "Not enough source text was supplied to ground a summary. PolicyPulse will not summarise from memory.",
      },
      { status: 422 },
    );
  }

  const baseUrl = process.env.AI_SUMMARY_BASE_URL ?? "https://api.openai.com/v1";
  const model = process.env.AI_SUMMARY_MODEL ?? "gpt-4o-mini";
  const apiKey = process.env.AI_SUMMARY_API_KEY as string;

  const systemPrompt = [
    "You summarise official policy documents for a civic technology tool.",
    "Use ONLY the supplied source text. Never add facts, figures, dates, or obligations that are not present in it.",
    "Never give legal advice. Never describe effects on emissions, health, or the climate.",
    "Write 2 to 4 plain-language sentences a non-expert can act on.",
    "If the source text does not answer something, say so rather than guessing.",
    `Jurisdiction: ${jurisdiction}.`,
    sourceTitle ? `Document title: ${sourceTitle}.` : "",
    sourceUrl ? `The document is published at ${sourceUrl} and the interface will keep that link.` : "",
  ]
    .filter(Boolean)
    .join(" ");

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 20_000);

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: `Source text follows between the markers.\n<<<SOURCE>>>\n${sourceText.slice(
              0,
              12_000,
            )}\n<<<END SOURCE>>>`,
          },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!response.ok) {
      return NextResponse.json({
        available: false,
        reason: "upstream-error",
        note: `The summarisation provider responded ${response.status}. The raw source text is still shown.`,
      });
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const summary = data.choices?.[0]?.message?.content?.trim();

    if (!summary) {
      return NextResponse.json({
        available: false,
        reason: "empty-summary",
        note: "The provider returned nothing usable. The raw source text is still shown.",
      });
    }

    return NextResponse.json({
      available: true,
      summary,
      sourceUrl,
      groundedIn: sourceTitle || "supplied source text",
      disclaimer:
        "Machine-generated summary of the supplied document. The official text and its link remain the authoritative source.",
    });
  } catch {
    return NextResponse.json({
      available: false,
      reason: "unreachable",
      note: "The summarisation provider could not be reached. The raw source text is still shown.",
    });
  }
}

function isConfigured(): boolean {
  return Boolean(process.env.AI_SUMMARY_API_KEY);
}
