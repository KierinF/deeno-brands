import { Resend } from "resend";

export async function POST(req: Request) {
  const data = await req.json();
  const { firstName, lastName, email, phone, trade, budget } = data;

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set — skipping email send");
    return Response.json({ ok: true });
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: "kierin@deenobrands.agency",
    subject: `New audit request from ${firstName} ${lastName}`,
    text: [
      `Name: ${firstName} ${lastName}`,
      `Email: ${email}`,
      `Phone: ${phone || "—"}`,
      `Trade: ${trade || "—"}`,
      `Budget: ${budget || "—"}`,
    ].join("\n"),
  });

  return Response.json({ ok: true });
}
