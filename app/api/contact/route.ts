import { Resend } from "resend";

export async function GET(req: Request) {
  console.error(`[contact] ⚠️  GET received — browser converted POST→GET via cached 301 redirect. URL: ${(req as { url?: string }).url}. Clear browser cache.`);
  return new Response("Method Not Allowed — use POST", { status: 405 });
}

export async function POST(req: Request) {
  console.log(`[contact] POST received — url: ${(req as { url?: string }).url}`);
  try {
    const data = await req.json();
    const { firstName, lastName, email, phone, trade, budget, source, website } = data;

    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY not set — skipping email send");
      return Response.json({ ok: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const subject = source === "audit-report"
      ? `Audit report request from ${email}`
      : `New audit request from ${firstName ?? ""} ${lastName ?? ""}`.trim();

    const text = source === "audit-report"
      ? [`Email: ${email}`, `Phone: ${phone || "—"}`, `Website scanned: ${website || "—"}`, `Source: audit terminal`].join("\n")
      : [
          `Name: ${firstName} ${lastName}`,
          `Email: ${email}`,
          `Phone: ${phone || "—"}`,
          `Trade: ${trade || "—"}`,
          `Budget: ${budget || "—"}`,
        ].join("\n");

    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: "kierin@deenobrands.agency",
      subject,
      text,
    });

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Contact route error:", err);
    return Response.json({ ok: false, error: "Failed to send" }, { status: 500 });
  }
}
