import { Resend } from "resend";

export async function POST(request) {
  const resend = new Resend(process.env.RESEND_API_KEY);

  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request" }, { status: 400 });
  }

  const { name, email, event } = body;
  if (!name || !email) {
    return Response.json({ error: "Name and email required" }, { status: 400 });
  }

  try {
    await resend.emails.send({
      from: "Tryon History Museum <info@tryonhistorymuseum.org>",
      to: "info@tryonhistorymuseum.org",
      subject: `Interest List: ${event || "At Home in Tryon"}`,
      html: `
        <p><strong>New interest list submission</strong></p>
        <p><strong>Event:</strong> ${event || "At Home in Tryon"}</p>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
      `,
    });
    return Response.json({ received: true });
  } catch (err) {
    console.error("[interest-list] Email error:", err.message);
    return Response.json({ error: "Failed to send" }, { status: 500 });
  }
}
