import { NextRequest } from "next/server";

// Skip this route during static export (GitHub Pages). It requires a server runtime (Vercel).
export const dynamic = "force-static";

// ─── Rate limiting ─────────────────────────────────────────────────────────────
// In-memory store: Map<ip, { count: number; windowStart: number }>
// Limits: 5 scans/hour per IP, 100 scans/day globally
const ipStore = new Map<string, { count: number; windowStart: number }>();
let globalDayCount = 0;
let globalDayStart = Date.now();

const PER_IP_LIMIT = 5;      // max scans per IP per hour
const GLOBAL_DAILY_LIMIT = 100; // total scans per day across all users

function checkRateLimit(ip: string): { allowed: boolean; reason?: string } {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;

  // Reset global daily counter
  if (now - globalDayStart > DAY) {
    globalDayCount = 0;
    globalDayStart = now;
  }
  if (globalDayCount >= GLOBAL_DAILY_LIMIT) {
    return { allowed: false, reason: "Daily scan limit reached. Try again tomorrow." };
  }

  // Check per-IP hourly limit
  const entry = ipStore.get(ip);
  if (!entry || now - entry.windowStart > HOUR) {
    ipStore.set(ip, { count: 1, windowStart: now });
  } else {
    if (entry.count >= PER_IP_LIMIT) {
      const resetIn = Math.ceil((HOUR - (now - entry.windowStart)) / 60000);
      return { allowed: false, reason: `Too many scans. Try again in ${resetIn} minute${resetIn === 1 ? "" : "s"}.` };
    }
    entry.count++;
  }

  globalDayCount++;
  return { allowed: true };
}

// ─── Extract IP from request ───────────────────────────────────────────────────
function getIP(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

// Extracts useful SEO/marketing signals from raw HTML
function extractSignals(html: string, url: string) {
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/si);
  const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "";

  const descMatch = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);
  const description = descMatch ? descMatch[1].trim() : "";

  const h1s = [...html.matchAll(/<h1[^>]*>(.*?)<\/h1>/gsi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).slice(0, 3);
  const h2s = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gsi)].map(m => m[1].replace(/<[^>]+>/g, "").trim()).slice(0, 6);

  // Tracking pixels
  const hasGA = /google-analytics\.com|gtag\(|GoogleAnalyticsObject/i.test(html);
  const hasGTM = /googletagmanager\.com|GTM-/i.test(html);
  const hasFBPixel = /facebook\.net\/tr|fbq\(|connect\.facebook\.net/i.test(html);
  const hasBingPixel = /bat\.bing\.com|UET_/i.test(html);

  // Conversion signals
  const hasPhone = /(\(?\d{3}\)?[\s.\-]?\d{3}[\s.\-]?\d{4})/i.test(html);
  const hasCallToAction = /\b(call now|get a quote|free estimate|book now|contact us|schedule|request a call|get started)\b/i.test(html);
  const hasChat = /tawk\.to|intercom|livechat|zendesk|crisp\.chat|drift\.com/i.test(html);
  const hasBooking = /calendly|appointy|acuity|housecall|service titan|jobber|fieldedge/i.test(html);

  // Google / local signals
  const hasGBP = /business\.google\.com|google\.com\/maps|LocalBusiness|GeoCoordinates/i.test(html);
  const hasReviews = /google review|trustpilot|yelp|reviews|testimonial|star[s]?\s*rating|(\d\.?\d?)\s*out of\s*5/i.test(html);
  const reviewCountMatch = html.match(/(\d{1,4})\s*(review|rating)/i);
  const reviewCount = reviewCountMatch ? reviewCountMatch[1] : null;

  const hasSSL = url.startsWith("https://");
  const hasStructuredData = html.includes("application/ld+json");
  const hasMobileViewport = html.includes('name="viewport"') || html.includes("name='viewport'");
  const hasLocalKeywords = /\b(plumb|hvac|electric|pest|heating|cooling|drain|sewer|furnace|ac unit|air condition)\b/i.test(html);

  // Estimate page count from nav links
  const navLinks = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  const navHrefs = [...navLinks.matchAll(/href=["']([^"'#?]+)["']/gi)].map(m => m[1]).filter(h => h.startsWith("/") || h.includes(".html"));
  const estPageCount = Math.max(4, navHrefs.length + 1);

  const textSample = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 1500);

  return {
    title, description, h1s, h2s,
    hasGA, hasGTM, hasFBPixel, hasBingPixel,
    hasPhone, hasCallToAction, hasChat, hasBooking,
    hasGBP, hasReviews, reviewCount,
    hasSSL, hasStructuredData, hasMobileViewport, hasLocalKeywords,
    estPageCount, textSample,
  };
}

// Mock results when no API key is set
function getMockLines(url: string): string {
  const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
  return `> Connecting to ${domain}...                  OK
> Fetching HTML...                            OK

━━━ GOOGLE PRESENCE ━━━
> Google Business Profile signals...         NOT FOUND
> Review count detected...                   NONE
> Star rating visible...                     NONE
> NAP consistency...                         PARTIAL
SECTION SCORE: 3/10

━━━ WEBSITE TECHNICAL ━━━
> SSL certificate...                         OK
> Mobile viewport...                         OK
> Google Analytics...                        NOT FOUND
> Google Tag Manager...                      NOT FOUND
> Facebook Pixel...                          NOT FOUND
> Estimated page count...                    ~5 pages
> Structured data (Schema.org)...            MISSING
SECTION SCORE: 4/10

━━━ SEO ━━━
> Page title...                              GENERIC
> Meta description...                        MISSING
> H1 tags present...                         1 FOUND
> Local keywords...                          WEAK
> Schema markup...                           NONE
SECTION SCORE: 3/10

━━━ CONVERSION ━━━
> Phone number visible...                    NOT DETECTED
> Strong call-to-action...                   WEAK
> Review/trust signals...                    NONE
> Live chat...                               NONE
> Online booking...                          NONE
SECTION SCORE: 2/10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCAN COMPLETE
FINAL SCORE: 12/40 — GRADE: D

TOP 3 PRIORITIES:
1. No tracking — you have no idea where leads come from
2. Missing GBP signals — Google can't verify you're a local business
3. CTA is buried — your phone number should be on every screen

Add ANTHROPIC_API_KEY to .env.local for real AI analysis.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
}

// If GET is received it means the browser converted POST→GET via a cached 301 redirect.
// Clear browser cache to fix. This log helps confirm the diagnosis.
export async function GET(req: NextRequest) {
  console.error(`[analyze] ⚠️  GET received — browser followed cached 301 redirect (POST converted to GET). URL: ${req.url}. User must clear browser cache or the fetch URL must avoid the cached path.`);
  return new Response("Method Not Allowed — use POST. If you're seeing this, your browser converted a POST to GET via a cached redirect. Clear browser cache.", { status: 405 });
}

export async function POST(req: NextRequest) {
  console.log(`[analyze] POST received — url: ${req.url} — ip: ${getIP(req)}`);
  // Rate limiting — check before doing anything expensive
  const ip = getIP(req);
  const limit = checkRateLimit(ip);
  if (!limit.allowed) {
    return new Response(
      `> Rate limit reached.\n> ${limit.reason}\n`,
      { status: 429, headers: { "Content-Type": "text/plain" } }
    );
  }

  const { url } = await req.json() as { url: string };

  if (!url || typeof url !== "string") {
    return new Response("Missing url", { status: 400 });
  }

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

  const s = extractSignals(html, fullUrl);

  const systemPrompt = `You are a blunt, expert home services digital marketing auditor. You are scanning someone's website and giving a cold, honest, scored assessment in a retro terminal style. Be direct, specific, a little wry. No filler. No preamble.`;

  const userPrompt = `Auditing: ${fullUrl}

TECHNICAL SIGNALS EXTRACTED:
- Page response: ${fetchStatus} (${responseTime}ms)
- SSL: ${s.hasSSL ? "YES" : "NO"}
- Mobile viewport: ${s.hasMobileViewport ? "YES" : "NO"}
- Title: ${s.title || "NONE"}
- Meta description: ${s.description || "NONE"}
- H1 headings: ${s.h1s.join(" | ") || "NONE"}
- H2 headings: ${s.h2s.join(" | ") || "NONE"}
- Google Analytics: ${s.hasGA ? "YES" : "NO"}
- Google Tag Manager: ${s.hasGTM ? "YES" : "NO"}
- Facebook Pixel: ${s.hasFBPixel ? "YES" : "NO"}
- Bing/UET Pixel: ${s.hasBingPixel ? "YES" : "NO"}
- Structured data: ${s.hasStructuredData ? "YES" : "NO"}
- Estimated pages (from nav): ~${s.estPageCount}
- Google Business Profile signals: ${s.hasGBP ? "DETECTED" : "NOT FOUND"}
- Review signals: ${s.hasReviews ? "DETECTED" : "NONE"}
- Review count in HTML: ${s.reviewCount ?? "NOT FOUND"}
- Phone number found: ${s.hasPhone ? "YES" : "NO"}
- Call-to-action text: ${s.hasCallToAction ? "YES" : "NO"}
- Live chat widget: ${s.hasChat ? "YES" : "NO"}
- Online booking system: ${s.hasBooking ? "YES" : "NO"}
- Local service keywords: ${s.hasLocalKeywords ? "YES" : "NO"}
- Page text sample: "${s.textSample.slice(0, 600)}"

Write the output EXACTLY in this format — no extra text, no preamble, start immediately:

━━━ GOOGLE PRESENCE ━━━
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
SECTION SCORE: X/10

━━━ WEBSITE TECHNICAL ━━━
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
SECTION SCORE: X/10

━━━ SEO ━━━
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
SECTION SCORE: X/10

━━━ CONVERSION ━━━
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
> [metric label padded to 38 chars]   [SHORT STATUS]
SECTION SCORE: X/10

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCAN COMPLETE
FINAL SCORE: XX/40 — GRADE: [A/B/C/D/F with optional +/-]

TOP 3 PRIORITIES:
1. [specific fix — 1 line, blunt, actionable]
2. [specific fix — 1 line, blunt, actionable]
3. [specific fix — 1 line, blunt, actionable]

[One wry closing line — max 12 words]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS values to use: OK, FOUND, DETECTED, MISSING, NOT FOUND, WEAK, GENERIC, PARTIAL, NONE, BLOCKED, YES, NO, or a short number/value.
Score each section honestly 1-10 based on signals. FINAL SCORE is sum of 4 sections (max 40).`;

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
      max_tokens: 900,
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
