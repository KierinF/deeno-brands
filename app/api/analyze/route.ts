import { NextRequest } from "next/server";

// Extracts useful SEO/marketing signals from raw HTML
function extractSignals(html: string, url: string) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/si);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : "";

  const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gsi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).slice(0, 3);
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gsi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).slice(0, 5);

  const hasGA = /google-analytics\.com|gtag\(|GoogleAnalyticsObject/i.test(html);
  const hasGTM = /googletagmanager\.com|GTM-/i.test(html);
  const hasPhone = /(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/i.test(html);
  const hasCallToAction = /\b(call now|get a quote|free estimate|book now|contact us|schedule|request)\b/i.test(html);
  const hasReviews = /google review|trustpilot|yelp|reviews|testimonial/i.test(html);
  const hasSSL = url.startsWith("https://");
  const hasStructuredData = html.includes("application/ld+json");

  // Rough text sample
  const textSample = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);

  return { title, description, h1s, h2s, hasGA, hasGTM, hasPhone, hasCallToAction, hasReviews, hasSSL, hasStructuredData, textSample };
}

// Mock results when no API key is set
function getMockLines(url: string): string {
  const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
  return `> Connecting to ${domain}...                  OK
> Reading HTML structure...                   OK
> Parsing meta signals...                     OK
> Checking page title...                      GENERIC
> Meta description...                         MISSING
> H1 tags present...                          1 FOUND
> Google Analytics...                         NOT FOUND
> Call-to-action visibility...                WEAK
> Phone number above fold...                  NOT DETECTED
> Review signals...                           NONE FOUND
> SSL certificate...                          OK
> Structured data (Schema.org)...             MISSING

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCAN COMPLETE

MARKETING GRADE: D+

TOP 3 THINGS WRONG:
1. No tracking — you have no idea where leads come from
2. No reviews visible — 57% of customers won't call < 4 stars
3. CTA is buried — your phone number should be on every screen

We've seen this before. A lot.
Add ANTHROPIC_API_KEY to .env.local for real AI analysis.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

export async function POST(req: NextRequest) {
  const { url } = await req.json() as { url: string };

  if (!url || typeof url !== "string") {
    return new Response("Missing url", { status: 400 });
  }

  // Normalise URL
  const fullUrl = url.startsWith("http") ? url : `https://${url}`;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  // No API key — return mock results as a stream
  if (!apiKey) {
    const mockText = getMockLines(fullUrl);
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const lines = mockText.split("\n");
        for (const line of lines) {
          controller.enqueue(encoder.encode(line + "\n"));
          await new Promise(r => setTimeout(r, 120));
        }
        controller.close();
      }
    });
    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" }
    });
  }

  // Fetch the target website
  let html = "";
  let fetchStatus = "OK";
  let responseTime = 0;

  try {
    const start = Date.now();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(fullUrl, {
      signal: controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; DeenoScanner/1.0)" }
    });
    clearTimeout(timeout);
    responseTime = Date.now() - start;
    html = await res.text();
    if (!res.ok) fetchStatus = `HTTP ${res.status}`;
  } catch {
    fetchStatus = "TIMEOUT / BLOCKED";
    html = "";
  }

  const signals = extractSignals(html, fullUrl);

  // Build Claude prompt
  const systemPrompt = `You are a blunt, expert home services digital marketing auditor. You are scanning someone's website and giving them a cold, honest assessment in a retro terminal style. Be direct, specific, a little wry. No filler.`;

  const userPrompt = `I scanned ${fullUrl}

TECHNICAL SIGNALS:
- Page response: ${fetchStatus} (${responseTime}ms)
- Title: ${signals.title || "NONE"}
- Meta description: ${signals.description || "NONE"}
- H1 headings: ${signals.h1s.join(" | ") || "NONE"}
- H2 headings: ${signals.h2s.join(" | ") || "NONE"}
- Google Analytics: ${signals.hasGA ? "YES" : "NO"}
- Google Tag Manager: ${signals.hasGTM ? "YES" : "NO"}
- Phone number found: ${signals.hasPhone ? "YES" : "NO"}
- Call-to-action text: ${signals.hasCallToAction ? "YES" : "NO"}
- Review signals: ${signals.hasReviews ? "YES" : "NO"}
- SSL: ${signals.hasSSL ? "YES" : "NO"}
- Structured data: ${signals.hasStructuredData ? "YES" : "NO"}
- Page text sample: "${signals.textSample.slice(0, 800)}"

Write the output as a terminal scan result. Use EXACTLY this format:

> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
(10-14 lines of scan results)

Then:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCAN COMPLETE

MARKETING GRADE: [A/B/C/D/F with +/-]

TOP 3 THINGS WRONG:
1. [specific fix — 1 line, blunt]
2. [specific fix — 1 line, blunt]
3. [specific fix — 1 line, blunt]

[One final wry closing line — max 12 words]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Keep it tight. No explanations. No preamble. Start immediately with the first > line.`;

  // Call Claude and stream response
  const claudeRes = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 600,
      stream: true,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!claudeRes.ok || !claudeRes.body) {
    const err = await claudeRes.text().catch(() => "unknown");
    return new Response(`> Claude API error: ${err}\n`, { status: 500 });
  }

  // Transform SSE from Claude into plain text stream
  const reader = claudeRes.body.getReader();
  const decoder = new TextDecoder();
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";
        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (data === "[DONE]") continue;
            try {
              const json = JSON.parse(data);
              const text = json?.delta?.text ?? "";
              if (text) controller.enqueue(encoder.encode(text));
            } catch { /* skip */ }
          }
        }
      }
      controller.close();
    }
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-cache" }
  });
}
