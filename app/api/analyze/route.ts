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
  const hasClickToCall = /href=["']tel:/i.test(html);
  const hasCallToAction = /\b(call now|get a quote|free estimate|book now|contact us|schedule|request a call|get started)\b/i.test(html);
  const hasChat = /tawk\.to|intercom|livechat|zendesk|crisp\.chat|drift\.com/i.test(html);
  const hasBooking = /calendly|appointy|acuity|housecall|service titan|jobber|fieldedge/i.test(html);
  const hasContactForm = /<form[^>]*>/i.test(html) && (/<input[^>]+type=["']email["']/i.test(html) || /<input[^>]+type=["']tel["']/i.test(html));

  // Google / local signals
  const hasGBP = /business\.google\.com|google\.com\/maps|LocalBusiness|GeoCoordinates/i.test(html);
  const hasMapEmbed = /google\.com\/maps\/embed/i.test(html);
  const hasReviews = /google review|trustpilot|yelp|reviews|testimonial|star[s]?\s*rating|(\d\.?\d?)\s*out of\s*5/i.test(html);
  const reviewCountMatch = html.match(/(\d{1,4})\s*(review|rating)/i);
  const reviewCount = reviewCountMatch ? reviewCountMatch[1] : null;

  const hasSSL = url.startsWith("https://");
  const hasStructuredData = html.includes("application/ld+json");
  // Extract schema @type if present
  const schemaTypeMatch = html.match(/"@type"\s*:\s*"([^"]+)"/);
  const schemaType = schemaTypeMatch ? schemaTypeMatch[1] : null;
  const hasMobileViewport = html.includes('name="viewport"') || html.includes("name='viewport'");
  const hasLocalKeywords = /\b(plumb|hvac|electric|pest|heating|cooling|drain|sewer|furnace|ac unit|air condition)\b/i.test(html);

  // Images without alt text
  const allImgs = (html.match(/<img[^>]*>/gi) ?? []).length;
  const imgsWithAlt = (html.match(/<img[^>]+alt=["'][^"']+["'][^>]*>/gi) ?? []).length;
  const missingAltCount = Math.max(0, allImgs - imgsWithAlt);

  // Estimate page count from nav links
  const navLinks = html.match(/<nav[^>]*>([\s\S]*?)<\/nav>/i)?.[1] ?? "";
  const navHrefs = [...navLinks.matchAll(/href=["']([^"'#?]+)["']/gi)].map(m => m[1]).filter(h => h.startsWith("/") || h.includes(".html"));
  const estPageCount = Math.max(4, navHrefs.length + 1);

  // Word count estimate
  const plainText = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = plainText.split(/\s+/).length;
  const textSample = plainText.slice(0, 1500);

  return {
    title, description, h1s, h2s,
    hasGA, hasGTM, hasFBPixel, hasBingPixel,
    hasPhone, hasClickToCall, hasCallToAction, hasChat, hasBooking, hasContactForm,
    hasGBP, hasMapEmbed, hasReviews, reviewCount,
    hasSSL, hasStructuredData, schemaType, hasMobileViewport, hasLocalKeywords,
    missingAltCount, estPageCount, wordCount, textSample,
  };
}

// Mock results when no API key is set
function getMockLines(url: string): string {
  const domain = url.replace(/https?:\/\/(www\.)?/, "").split("/")[0];
  return `> Connecting to ${domain}...              OK
> Fetching HTML + sitemap...               OK
━━━ GOOGLE PRESENCE ━━━
> GBP / Maps signals...                    NOT FOUND
> Review count in HTML...                  NONE
> Maps embed detected...                   NO
SECTION SCORE: 2/10
━━━ WEBSITE TECHNICAL ━━━
> SSL certificate...                       OK
> Analytics (GA/GTM)...                    NOT FOUND
> Schema.org markup...                     MISSING
SECTION SCORE: 4/10
━━━ SEO ━━━
> Page title quality...                    GENERIC
> Meta description...                      MISSING
> Local keywords...                        WEAK
SECTION SCORE: 3/10
━━━ CONVERSION ━━━
> Click-to-call (tel: link)...             NOT FOUND
> Contact form detected...                 NONE
> Online booking system...                 NONE
SECTION SCORE: 2/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL SCORE: 11/40 — GRADE: D
TOP 3 PRIORITIES:
1. Add GA4 + GTM — you're flying blind on where leads come from
2. Claim and optimise your Google Business Profile immediately
3. Put a tap-to-call button above the fold on mobile
Set ANTHROPIC_API_KEY in Vercel env vars for real AI analysis.
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

  // Fetch sitemap.xml to get real page count
  let sitemapPageCount: number | null = null;
  try {
    const domain = new URL(fullUrl).origin;
    const smCtrl = new AbortController();
    const smTimeout = setTimeout(() => smCtrl.abort(), 2500);
    const smRes = await fetch(`${domain}/sitemap.xml`, { signal: smCtrl.signal, headers: { "User-Agent": "Mozilla/5.0 (compatible; DeenoScanner/1.0)" } });
    clearTimeout(smTimeout);
    if (smRes.ok) {
      const smText = await smRes.text();
      const urlMatches = smText.match(/<loc>/g);
      sitemapPageCount = urlMatches ? urlMatches.length : null;
    }
  } catch { /* non-blocking */ }

  const pageCount = sitemapPageCount !== null ? `${sitemapPageCount} (from sitemap)` : `~${s.estPageCount} (estimated from nav)`;

  const systemPrompt = `You are a blunt, expert home services digital marketing auditor. You scan websites and give cold, honest, scored terminal-style assessments. Be direct, specific, a little wry. No filler. No preamble. Keep output COMPACT — 3 metrics per section, no blank lines between sections.`;

  const userPrompt = `Auditing: ${fullUrl}

SCRAPED SIGNALS:
- Response: ${fetchStatus} (${responseTime}ms)
- SSL: ${s.hasSSL ? "YES" : "NO"}
- Mobile viewport: ${s.hasMobileViewport ? "YES" : "NO"}
- Page count: ${pageCount}
- Word count (homepage): ~${s.wordCount}
- Images missing alt text: ${s.missingAltCount}
- Title: ${s.title || "NONE"}
- Meta description: ${s.description ? s.description.slice(0, 120) : "NONE"}
- H1: ${s.h1s.join(" | ") || "NONE"}
- H2s: ${s.h2s.join(" | ") || "NONE"}
- Google Analytics: ${s.hasGA ? "YES" : "NO"}
- Google Tag Manager: ${s.hasGTM ? "YES" : "NO"}
- Facebook Pixel: ${s.hasFBPixel ? "YES" : "NO"}
- Bing Pixel: ${s.hasBingPixel ? "YES" : "NO"}
- Schema.org markup: ${s.hasStructuredData ? `YES (type: ${s.schemaType ?? "unknown"})` : "NO"}
- GBP/Maps signals: ${s.hasGBP ? "DETECTED" : "NOT FOUND"}
- Maps embed: ${s.hasMapEmbed ? "YES" : "NO"}
- Review signals: ${s.hasReviews ? `YES (count: ${s.reviewCount ?? "unknown"})` : "NONE"}
- Phone number in HTML: ${s.hasPhone ? "YES" : "NO"}
- Click-to-call (tel: link): ${s.hasClickToCall ? "YES" : "NO"}
- Contact form: ${s.hasContactForm ? "YES" : "NO"}
- CTA text: ${s.hasCallToAction ? "YES" : "NO"}
- Live chat: ${s.hasChat ? "YES" : "NO"}
- Online booking: ${s.hasBooking ? "YES" : "NO"}
- Local keywords: ${s.hasLocalKeywords ? "YES" : "NO"}
- Page text sample: "${s.textSample.slice(0, 500)}"

Output EXACTLY this format — start immediately, no preamble, NO blank lines between sections:

━━━ GOOGLE PRESENCE ━━━
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
SECTION SCORE: X/10
━━━ WEBSITE TECHNICAL ━━━
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
SECTION SCORE: X/10
━━━ SEO ━━━
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
SECTION SCORE: X/10
━━━ CONVERSION ━━━
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
> [metric 38 chars]   [STATUS]
SECTION SCORE: X/10
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FINAL SCORE: XX/40 — GRADE: [A/B/C/D/F]
TOP 3 PRIORITIES:
1. [blunt, actionable, 1 line]
2. [blunt, actionable, 1 line]
3. [blunt, actionable, 1 line]
[one wry closing line, max 10 words]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STATUS values: OK, FOUND, DETECTED, MISSING, NOT FOUND, WEAK, GENERIC, PARTIAL, NONE, BLOCKED, YES, NO, or a short value.
Score each section 1-10. FINAL SCORE = sum of all 4 sections (max 40).`;

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
      max_tokens: 700,
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
